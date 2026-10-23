/* İlk sürüme özel, agent tarafından yazılmış HTML eşlemeleri.
 * Genel bir RN renderer değildir. Sonraki tasarımları bu şablonla otomatik üretmeyin.
 * Var olan arşivi üzerine yazmaz. Yalnızca ui-history içine yazar.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const archive = path.resolve(__dirname, '..');
const date = '2026-10-15';
const out = path.join(archive, 'versions', date);
if (fs.existsSync(path.join(out, 'meta.json'))) throw new Error('Bu arşiv zaten var; üzerine yazılmadı.');
const read = p => fs.readFileSync(path.join(root,p), 'utf8');
const transpile = source => ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const platform = {OS:'android', select: x => x.android ?? x.default};
const context = {exports:{},require:()=>({Platform:platform})};
vm.runInNewContext(transpile(read('constants/theme.ts')),context);
const theme = context.exports.darkTheme;
const styleSheet = {create:x=>x,absoluteFillObject:{position:'absolute',top:0,right:0,bottom:0,left:0},hairlineWidth:1};
const catalog = [
  ['login','Giriş','app/login.tsx'],['settings','Ayarlar','app/settings.tsx'],
  ['dashboard','Ana Sayfa','app/(app)/dashboard.tsx'],['koli-listesi','Koli Listesi','app/(app)/koli-listesi.tsx'],
  ['koli-detay','Koli Detayı','app/(app)/koli-detay.tsx'],['create-koli','Yeni Koli','app/(app)/create-koli.tsx'],
  ['order-receipts','Sipariş Seçimi','app/(app)/order-receipts.tsx'],['irskoli-listesi','İrsaliye Oluştur','app/(app)/irskoli-listesi.tsx'],
  ['barcode-scanner','Barkod Okutma','app/(app)/barcode-scanner.tsx']
].map(([slug,name,source])=>({slug,name,source}));
function stylesFrom(file) {
  const source = read(file);
  const ast = ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  let expr;
  function visit(n) { if(ts.isVariableDeclaration(n)&&n.name.getText(ast)==='makeStyles') expr=n.initializer.getText(ast); ts.forEachChild(n,visit); }
  visit(ast);
  if(!expr) throw new Error('makeStyles yok: '+file);
  const ctx={theme,StyleSheet:styleSheet,Platform:platform};
  vm.runInNewContext(transpile('const makeStyles = '+expr+'; globalThis.result = makeStyles(theme);'),ctx);
  return ctx.result;
}
const sourceStyles=Object.fromEntries(catalog.map(s=>[s.slug,stylesFrom(s.source)]));
sourceStyles.action=stylesFrom('app/components/ActionButton.tsx');
const fixture=JSON.parse(fs.readFileSync(path.join(archive,'fixtures.json'),'utf8'));
const translations=JSON.parse(read('locales/tr.json'));
const t=(key,vars={})=>{let value=key.split('.').reduce((v,k)=>v?.[k],translations);if(typeof value!=='string')throw new Error('Çeviri yok: '+key);return value.replace(/\{\{(\w+)\}\}/g,(_,k)=>vars[k]??'');};
const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kebab=s=>s.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
const vars=new Map();
const colors=new Map();
for(const [k,v] of Object.entries(theme.colors)){vars.set('color-'+kebab(k),v);if(!colors.has(v.toLowerCase()))colors.set(v.toLowerCase(),'color-'+kebab(k));}
for(const [k,v] of Object.entries(theme.spacing))vars.set('space-'+k,v+'px');
for(const [k,v] of Object.entries(theme.radius))vars.set('radius-'+k,v+'px');
vars.set('font-sans','"Archive Roboto", sans-serif');vars.set('font-mono','"Archive Roboto Mono", monospace');
for(const [name,spec] of Object.entries(theme.type))for(const [prop,v] of Object.entries(spec))vars.set('type-'+kebab(name)+'-'+kebab(prop),prop==='fontFamily'?(v==='monospace'?'var(--font-mono)':'var(--font-sans)'):typeof v==='number'?v+'px':v);
Object.entries({'viewport-width':'390px','viewport-height':'844px','system-top':'24px','system-bottom':'24px','native-header':'56px'}).forEach(([k,v])=>vars.set(k,v));
function size(n){if(n===0)return '0';const key='size-'+String(n).replace('-','minus-').replace('.','_');vars.set(key,n+'px');return 'var(--'+key+')';}
function color(v){if(['transparent','currentColor'].includes(v))return v;let key=colors.get(v.toLowerCase());if(!key){key='color-extra-'+crypto.createHash('sha1').update(v).digest('hex').slice(0,8);colors.set(v.toLowerCase(),key);vars.set(key,v);}return 'var(--'+key+')';}
const unitless=new Set(['opacity','zIndex','fontWeight','flexGrow','flexShrink','order','aspectRatio']);
function css(s){let rules=[];const add=(p,v)=>rules.push(kebab(p)+':'+v);for(let [p,v] of Object.entries(s||{})){
  if(v===undefined||v===null||p.startsWith('shadow')||p==='elevation'||p==='textAlignVertical'||p==='includeFontPadding')continue;
  if(p==='flex'){add('flex',v===1?'1 1 0%':v);continue;}
  if(p==='fontFamily'){add(p,v==='monospace'?'var(--font-mono)':'var(--font-sans)');continue;}
  if(p==='transform'){add(p,v.map(o=>Object.entries(o).map(([k,x])=>k+'('+(typeof x==='number'&&!k.startsWith('scale')?size(x):x)+')').join(' ')).join(' '));continue;}
  let value=typeof v==='number'?(unitless.has(p)?v:size(v)):/color/i.test(p)?color(v):v;
  if(/^(padding|margin)(Horizontal|Vertical)$/.test(p)){const prefix=p.startsWith('padding')?'padding':'margin';for(const side of p.endsWith('Horizontal')?['Left','Right']:['Top','Bottom'])add(prefix+side,value);continue;}
  add(p,value);
}
  if(s.shadowColor||s.elevation){const off=s.shadowOffset||{width:0,height:Math.ceil(s.elevation/2)};const blur=s.shadowRadius!==undefined?s.shadowRadius*2:s.elevation;const c=s.shadowColor||'#000000';const alpha=s.shadowOpacity??0.22;const key='shadow-'+crypto.createHash('sha1').update(JSON.stringify(s)).digest('hex').slice(0,8);vars.set(key,`${off.width}px ${off.height}px ${blur}px color-mix(in srgb, ${c} ${alpha*100}%, transparent)`);add('boxShadow','var(--'+key+')');}
  return rules.join(';');
}
let active,used;
function classNames(names=''){return names.split(' ').filter(Boolean).map(n=>{if(n.startsWith('x-'))return n;const key=n.startsWith('a-')?'action':active;const raw=n.startsWith('a-')?n.slice(2):n;if(!sourceStyles[key][raw])throw new Error('Stil yok: '+key+'.'+raw);used.set(n,sourceStyles[key][raw]);return 's-'+n;}).join(' ');}
const style=o=>Object.keys(o||{}).length?' style="'+escape(css(o))+'"':'';
function view(names,content='',extra={}){return '<div class="rn-view '+classNames(names)+'"'+style(extra)+'>'+content+'</div>';}
function text(names,content,extra={},lines=0){return '<span class="rn-text '+classNames(names)+(lines===1?' clamp-one':lines>1?' clamp-many':'')+'"'+style(extra)+(lines>1?' data-lines="'+lines+'"':'')+'>'+escape(content)+'</span>';}
function input(names,value,label,placeholder='',extra={},multiline=false){return multiline?'<textarea readonly tabindex="-1" rows="2" aria-label="'+escape(label)+'" class="rn-input '+classNames(names)+'"'+style(extra)+'>'+escape(value)+'</textarea>':'<input readonly tabindex="-1" aria-label="'+escape(label)+'" class="rn-input '+classNames(names)+'" value="'+escape(value)+'" placeholder="'+escape(placeholder)+'"'+style(extra)+'>';}
function icon(name,n=24,c='ink',extra={}){
  const file=path.join(root,'node_modules/lucide-react-native/dist/cjs/icons',name+'.js');
  const ctx={exports:{},module:{exports:{}},require:()=>((_name,nodes)=>nodes)};vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);const nodes=Array.isArray(ctx.module.exports)?ctx.module.exports:ctx.exports.default;
  if(!Array.isArray(nodes))throw new Error('İkon çözülemedi: '+name);
  return '<svg aria-hidden="true" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'+style({width:n,height:n,color:theme.colors[c]||c,...extra})+'>'+nodes.map(([tag,attrs])=>'<'+tag+' '+Object.entries(attrs).filter(([k])=>k!=='key').map(([k,v])=>kebab(k)+'="'+escape(v)+'"').join(' ')+'/>').join('')+'</svg>';
}
const scroll=(content,inner='',outer='',extras={})=>'<div class="rn-view rn-scroll '+classNames(outer)+'">'+view(inner,content,{flexGrow:1,...extras})+'</div>';
function header(title,back=true,right=''){return '<header class="rn-view native-header">'+(back?icon('arrow-left',24):'')+'<span>'+escape(title)+'</span>'+right+'</header>';}
const listSearch=(key,box='searchInputContainer')=>view('searchContainer',view(box,icon('search',20,'inkSubtle')+input('searchInput','',t(key),t(key))));
const screens={};
screens.login=()=>view('container',view('settingsButton',icon('settings',22,'inkMuted'),{top:32})+scroll(view('content',
  view('header','<img class="'+classNames('logo')+'" src="../../../assets/extreme-logo-on-dark-v1.png" alt="Extreme Business Solutions">'+text('title',t('login.welcome'))+text('subtitle',t('login.subtitle')))+
  view('form',view('inputGroup',text('label',t('login.labels.user'))+input('input',fixture.user.userName,t('login.labels.user')))+
    view('inputGroup',text('label',t('login.labels.password'))+view('passwordWrapper',input('input passwordInput',fixture.user.passwordDisplay,t('login.labels.password'))+view('eyeButton',icon('eye',20,'inkMuted'))))+
    view('rememberRow',icon('square-check-big',22,'primary')+view('rememberTextContainer',text('rememberLabel',t('login.labels.rememberMe'))+text('rememberHint',t('login.rememberMeHint'))))+
    view('button',text('buttonText',t('login.buttons.login'))+icon('log-in',20,'onPrimary')))+text('footer',t('login.footer'))),'scrollContent'));
screens.dashboard=()=>header(t('navigation.dashboard'),false)+view('container',
  '<svg class="'+classNames('watermark')+'" width="220" height="300" viewBox="0 0 95 100" aria-hidden="true"><path d="M0,0 L28,0 L50,50 L28,100 L0,100 L22,50 Z" fill="'+color('#DA2128')+'"/><path d="M40,0 L68,0 L90,50 L68,100 L40,100 L62,50 Z" fill="'+color('#DA2128')+'"/></svg>'+
  view('header x-header-gradient',view('headerContent',view('headerTop',view('headerTextContainer',text('greeting',t('dashboard.greeting'),{},1)+text('userName',fixture.user.firstName,{},2))+view('logoutButton',icon('log-out',20))),{paddingTop:44}))+
  scroll(view('content',text('sectionTitle',t('dashboard.quickAccess'))+view('cardGrid',[
    ['boxes','boxListTitle','boxListSubtitle','x-red-gradient'],['truck','createWaybillTitle','createWaybillSubtitle','x-info-gradient']
  ].map(([ic,title,subtitle,gradient])=>view('card',view('cardGradient '+gradient,view('cardIcon',icon(ic,32,'#fff'))+text('cardTitle',t('dashboard.'+title))+text('cardSubtitle',t('dashboard.'+subtitle))+view('cardArrow',icon('arrow-up-right',18,'#fff',{opacity:.6}))))).join(''))),'scrollContent','scrollView'));
screens['create-koli']=()=>header(t('createKoli.headerTitle'))+view('container',scroll(view('content',text('title',t('createKoli.title'))+text('subtitle',t('createKoli.subtitleSingle'))+view('buttonsContainer',view('optionButton',view('iconCircle',icon('shopping-cart',32,'onPrimary'))+text('optionTitle',t('createKoli.orderOptionTitle'))+text('optionDescription',t('createKoli.orderOptionDesc'))))),'scrollContent'));
screens['koli-listesi']=()=>header(t('navigation.koliListesi'))+view('container',listSearch('koliListesi.searchPlaceholder')+
  scroll(fixture.boxes.map(b=>view('card',view('cardHeader',view('iconContainer',icon('package',24,'primary'))+view('itemInfo',text('packageNo',b.PackageNo)+text('receiptNo',t('koliListesi.receiptNoPrefix')+b.ReceiptNo)+text('sipExp',b.SipExp)+text('explanation',b.Explanation))))).join('')+view('footerLoader',text('footerText',t('koliListesi.allLoaded'))),'content')+
  view('fabSecondaryContainer',view('fabSecondary',icon('scan-barcode',26,'primary')))+view('fab',icon('plus',28,'onPrimary')));
screens['order-receipts']=()=>header(t('orderReceipts.headerTitle'))+view('container',listSearch('orderReceipts.searchPlaceholder')+
  scroll(view('card',view('cardHeader',view('iconContainer',icon('file-text',22,'onPrimary'),{backgroundColor:theme.colors.primary})+view('itemInfo',text('receiptNo',t('orderReceipts.noOrderLink'))+text('accountName',t('orderReceipts.noOrderDesc')))+icon('chevron-right',20,'primary')),{borderColor:theme.colors.primary,borderWidth:2,marginBottom:20})+
  fixture.orders.map(o=>view('card',view('cardHeader',view('iconContainer',icon('file-text',22,'primary'))+view('itemInfo',text('receiptNo',t('orderReceipts.receiptPrefix')+o.ReceiptNo)+text('accountName',o.CurrentAccountName,{},2))+icon('chevron-right',20,'inkSubtle')))).join(''),'content'));
screens['irskoli-listesi']=()=>header(t('irsKoli.headerTitle'))+view('container',listSearch('irsKoli.searchPlaceholder','searchBox')+
  scroll(fixture.boxes.map(b=>view('card',view('cardHeader',view('cardTitleContainer',icon('package',24,'inkSubtle')+view('',text('cardTitle',b.PackageNo)+text('cardSubtitle',t('irsKoli.statusLabel')+t('irsKoli.'+(b.Status===0?'statusOpen':'statusClosed'))),{marginLeft:12}))+view('',icon('square',24,'inkSubtle',{opacity:.5}))))).join(''),'listContent'));
screens['barcode-scanner']=()=>view('container',view('header',view('headerButton',icon('x',24))+text('headerTitle',t('scanner.headerTitle'))+view('headerButton',icon('house',24,'onPrimary'),{backgroundColor:theme.colors.primary}),{paddingTop:32})+
  scroll(view('iconCircle',icon('scan-barcode',64,'primary'))+text('title',t('scanner.titles.createFromOrder'))+text('subtitle',fixture.orders[0].CurrentAccountName+' - '+t('scanner.titles.receiptNo',{no:fixture.orders[0].ReceiptNo})+'\n'+t('scanner.titles.firstItemPrompt'))+
  view('inputSection',input('barcodeInput',fixture.barcode,t('scanner.placeholder'))+view('submitButton',text('submitButtonText',t('scanner.submitButton')))),'content','',{flex:'unset'}));
screens['koli-detay']=()=>{
  const b=fixture.boxes[0];return header(t('koliDetay.boxNo')+b.PackageNo,true,icon('trash-2',24,'error',{marginRight:16}))+
  view('container',view('receiptBanner',view('orderCard',view('orderCardAccent')+view('orderCardInfo',text('orderCardLabel',t('koliDetay.orderNoLabel'))+text('orderCardValue',b.ReceiptNo,{},1)+text('sipExpBannerText',b.SipExp,{},2))+view('orderCardAction',icon('boxes',16,'primary')+icon('chevron-right',14,'primary')))+view('newBoxButton',icon('package-plus',18,'onPrimary')+text('newBoxButtonText',t('koliDetay.btnNewBox'))))+
  view('topSection',view('toggleContainer',view('toggleBtn toggleBtnActiveAdd',icon('plus',18,'onPrimary')+text('toggleText',t('koliDetay.addMaterial'),{color:theme.colors.onPrimary}))+view('toggleBtn',icon('trash-2',18,'inkSubtle')+text('toggleText',t('koliDetay.deleteMaterial'))))+
    view('barcodeInputWrapper',icon('scan-barcode',22,'primary')+input('barcodeInputTop','',t('koliDetay.placeholderAdd'),t('koliDetay.placeholderAdd'))))+
  scroll(fixture.items.map(item=>view('card',view('cardContent',view('iconContainer',icon('package',24,'primary'))+view('itemInfo',text('itemName',item['h1_Ürün'],{},3)+view('quantityContainer',text('quantityLabel','Miktar: ')+text('quantityValue',item.h2_Miktar.toFixed(2)))+view('dynamicFieldsContainer',Object.entries(item).filter(([k])=>k.startsWith('sh_')).slice(0,6).map(([k,v])=>view('dynamicFieldRow',text('fieldLabel',k.slice(3)+':')+text('fieldValue',v,{color:theme.colors.success,fontWeight:'700'},1))).join('')))))).join(''),'content')+
  view('buttonContainer',[['printer','btnPrint','ink'],['file-text','btnCreateReceipt','ink'],['lock-open','btnOpenBox','success'],['lock','btnCloseBox','primary']].map(([ic,key,c])=>view('a-actionButton',icon(ic,20,c)+text('a-buttonText',t('koliDetay.'+key)))).join(''),{paddingBottom:32}));
};
screens.settings=()=>{
  const field=(label,value,multi=false)=>view('inputGroup',text('label',t('settings.labels.'+label))+input('input'+(multi?' multilineInput':''),value,t('settings.labels.'+label),'',{},multi));
  const segment=(label,options)=>view('inputGroup',text('label',t('settings.'+label))+view('segment',options.map((value,i)=>view('segmentOption'+(!i?' segmentOptionActive':''),text('segmentText'+(!i?' segmentTextActive':''),value))).join('')));
  const checkbox=(label,key)=>view('inputGroup',text('label',t('settings.labels.'+label))+view('checkboxContainer',icon('square',24,'inkSubtle')+view('checkboxTextContainer',text('checkboxTitle',t('settings.'+key+'.title'))+text('checkboxSubtitle',t('settings.'+key+'.subtitle')))));
  return header(t('settings.headerTitle'))+view('container',scroll(view('content',view('header',view('iconContainer',icon('settings',36,'primary'))+text('title',t('settings.pageTitle'))+text('subtitle',t('settings.pageSubtitle')))+view('form',
    segment('theme',[t('settings.themeOptions.dark'),t('settings.themeOptions.light')])+segment('language',['🇹🇷 Türkçe','🇬🇧 English'])+
    field('apiUrl',fixture.settings.apiUrl,true)+field('companyCode',fixture.settings.companyCode)+field('companyPassword',fixture.settings.passwordDisplay)+field('warehouseCode',fixture.settings.warehouseCode)+
    view('inputGroup',text('label',t('settings.labels.errorSound'))+view('soundSelectorContainer',['error_1','vibration'].map((id,i)=>view('soundOption'+(!i?' soundOptionSelected':''),text('soundOptionText'+(!i?' soundOptionTextSelected':''),t('settings.sounds.'+id)))).join('')))+
    checkbox('boxMode','boxModeDesc')+checkbox('skipWeightMode','weightModeDesc')+checkbox('stockControlMode','stockControlDesc')+
    view('buttonGroup',view('button primaryButton',icon('save',20,'onPrimary')+text('primaryButtonText',t('settings.buttons.save')))+view('button secondaryButton',icon('refresh-cw',20)+text('secondaryButtonText',t('settings.buttons.reset')))))+
    view('helpBox',text('helpTitle',t('settings.help.title'))+text('helpText',t('settings.help.text')))),'scrollContent','scrollView'));
};
const sharedCSS=()=>`
*{box-sizing:border-box;border:0 solid currentColor}body{position:relative}html,body{margin:0;padding:0;width:var(--viewport-width);height:var(--viewport-height);overflow:hidden;background:var(--color-canvas);color:var(--color-ink);font-family:var(--font-sans);font-size:${size(14)};-webkit-text-size-adjust:100%;color-scheme:dark}
.rn-view{display:flex;flex-direction:column;flex-shrink:0;align-items:stretch;position:relative;min-width:0}.rn-text{display:block;flex-shrink:0;white-space:pre-wrap;min-width:0}.rn-input{appearance:none;display:block;font-family:var(--font-sans);font-size:${size(14)};background:transparent;border:0 solid transparent;margin:0;padding:0;min-width:0;outline:none;resize:none;caret-color:transparent;pointer-events:none}.rn-input::placeholder{color:var(--color-ink-subtle);opacity:1}.icon{display:block;flex-shrink:0}img{object-fit:contain;flex-shrink:0}.rn-scroll{flex:1 1 0%;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:none}.rn-scroll::-webkit-scrollbar{display:none}.rn-scroll>div{flex-shrink:0;min-height:100%}.rn-scroll .s-content{flex-basis:auto}.app{position:absolute;top:var(--system-top);bottom:var(--system-bottom);width:100%;overflow:hidden}.app>.s-container{min-height:0}.native-header{height:var(--native-header);flex-direction:row;align-items:center;padding:0 ${size(16)};gap:${size(32)};background:var(--color-canvas);border-bottom:${size(1)} solid var(--color-hairline);font-size:${size(20)};font-weight:600}.native-header span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.system-status{height:var(--system-top);position:absolute;inset:0 0 auto;flex-direction:row;align-items:center;justify-content:space-between;padding:0 ${size(20)};font-size:${size(12)};font-weight:500;z-index:20}.system-signals{flex-direction:row;gap:${size(5)};align-items:center}.system-bottom{position:absolute;bottom:0;left:0;right:0;height:var(--system-bottom);align-items:center;justify-content:center;background:var(--color-canvas)}.system-bottom:after{content:'';width:${size(108)};height:${size(4)};border-radius:var(--radius-pill);background:var(--color-ink)}.clamp-one{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.clamp-many{overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical}.clamp-many[data-lines="2"]{-webkit-line-clamp:2}.clamp-many[data-lines="3"]{-webkit-line-clamp:3}
.x-header-gradient{background:linear-gradient(var(--color-surface1),var(--color-canvas))}.x-red-gradient{background:linear-gradient(var(--color-primary),var(--color-primary-deep))}.x-info-gradient{background:linear-gradient(var(--color-info),var(--color-info-deep))}
`;
fs.mkdirSync(path.join(out,'screens'),{recursive:true});
fs.mkdirSync(path.join(archive,'assets'),{recursive:true});
fs.copyFileSync(path.join(root,'assets/extreme-logo-on-dark.png'),path.join(archive,'assets/extreme-logo-on-dark-v1.png'));
fs.copyFileSync(path.join(root,'assets/Extreme-Logo-Ana.png'),path.join(archive,'assets/extreme-logo-on-light-v1.png'));
fs.copyFileSync(path.join(root,'node_modules/lucide-react-native/LICENSE'),path.join(archive,'assets/LUCIDE-LICENSE.txt'));
for(const screen of catalog){active=screen.slug;used=new Map();const content=screens[active]();const status=view('','09:41',{fontSize:12})+'<div class="rn-view system-signals">'+icon('wifi',13)+icon('signal',13)+icon('battery-full',17)+'</div>';
  const cssText=sharedCSS()+'\n/* Kaynak makeStyles: '+screen.source+' */\n'+[...used].map(([name,s])=>'.s-'+name+'{'+css(s)+'}').join('\n');
  const html='<!doctype html>\n<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=390, initial-scale=1"><meta name="color-scheme" content="dark"><title>'+escape(screen.name)+' · '+date+'</title><link rel="stylesheet" href="../tokens.css"><style>'+cssText+'</style></head><body><!-- Statik HTML arşivi; kaynak: '+screen.source+'; fixture: ui-history/fixtures.json. -->\n<div class="rn-view system-status" aria-label="Saat 09:41; bağlantı ve pil sabit">'+status+'</div><main class="rn-view app" aria-label="'+escape(screen.name)+'">'+content+'</main><div class="rn-view system-bottom" aria-hidden="true"></div></body></html>\n';
  fs.writeFileSync(path.join(out,'screens',active+'.html'),html);
}
const fontsCSS='@font-face{font-family:"Archive Roboto";src:url("../../assets/fonts/Roboto.ttf") format("truetype");font-weight:100 900;font-style:normal;font-display:block}\n@font-face{font-family:"Archive Roboto Mono";src:url("../../assets/fonts/RobotoMono.ttf") format("truetype");font-weight:100 700;font-style:normal;font-display:block}\n';
fs.writeFileSync(path.join(out,'tokens.css'),'/* Kaynak: constants/theme.ts ve ekran makeStyles/inline stilleri. Android, koyu tema. */\n'+fontsCSS+':root{\n'+[...vars].map(([k,v])=>'  --'+k+': '+v+';').join('\n')+'\n}\n/* Kaynaktaki açık tema paleti de sürüm kaydında korunur; ekranlar koyu kalır. */\n:root[data-app-theme="light"]{\n'+Object.entries(context.exports.lightColors).map(([k,v])=>'  --color-'+kebab(k)+': '+v+';').join('\n')+'\n}\n');
const gitCommit=execFileSync('git',['-c','safe.directory='+root.replaceAll('\\','/'),'rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const appVersion=JSON.parse(read('app.json')).expo.version;
const meta={date,gitCommit,appVersion,note:'İlk tasarım arşivi. Mevcut uygulamanın 9 ekranı kaynak koddan HTML/CSS olarak kaydedildi.',changedScreens:catalog.map(s=>s.slug),screenNotes:Object.fromEntries(catalog.map(s=>[s.slug,'İlk kayıt — mevcut tasarım.'])),profile:{width:390,height:844,platform:'android',theme:'dark',language:'tr',keyboard:'hidden'},fixture:'../../fixtures.json'};
fs.writeFileSync(path.join(out,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(archive,'manifest.js'),'/* Yerel script; fetch gerektirmez. tools/update-manifest.cjs ile güncellenir. */\nwindow.UI_HISTORY = '+JSON.stringify({screens:catalog,versions:[{...meta,files:catalog.map(s=>s.slug)}]},null,2)+';\n');
const sourceFiles=[...catalog.map(s=>s.source),'constants/theme.ts','contexts/ThemeContext.tsx','app/_layout.tsx','app/(app)/_layout.tsx','app/components/ActionButton.tsx','locales/tr.json'];
fs.writeFileSync(path.join(out,'source-map.json'),JSON.stringify({gitCommit,files:sourceFiles.map(file=>({file,sha256:crypto.createHash('sha256').update(read(file)).digest('hex')})),styles:sourceStyles},null,2)+'\n');
const fonts=fs.readdirSync(path.join(archive,'assets/fonts')).filter(n=>n.endsWith('.ttf')).map(n=>({file:n,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(archive,'assets/fonts',n))).digest('hex')}));
fs.writeFileSync(path.join(archive,'assets/fonts/README.md'),'# Yerel arşiv fontları\n\n2026-10-15 tarihinde Google Fonts resmi deposundan indirildi; viewer çalışırken ağ bağlantısı gerekmez.\n\n- [Roboto](https://github.com/google/fonts/tree/main/ofl/roboto): `Roboto[wdth,wght].ttf` → Roboto.ttf; SIL OFL, Roboto-OFL.txt.\n- [Roboto Mono](https://github.com/google/fonts/tree/main/ofl/robotomono): `RobotoMono[wght].ttf` → RobotoMono.ttf; SIL OFL, RobotoMono-OFL.txt.\n\nAndroid sistem fontunun sürümü cihazdan cihaza farklılaşabilir. Roboto Mono, kaynak monospace alias’ının sabit arşiv karşılığıdır; cihazdaki monospace fontuyla birebir eşitlik iddiası yoktur. Dosyaları üzerine yazmayın; yeni font sürümü için yeni ad kullanın.\n\nSHA-256:\n\n'+fonts.map(f=>'- `'+f.file+'`: `'+f.sha256+'`').join('\n')+'\n');
console.log('İlk arşiv oluşturuldu:',date,catalog.length+' ekran',vars.size+' token');
