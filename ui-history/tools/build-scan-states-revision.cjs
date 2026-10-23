// Seventh revision: what happens after a scan, drawn as states of Barkod Okutma and Koli Detayı, plus the user's decisions of
// 2026-10-22 (open boxes cannot go on a waybill; the no-order option reads “Siparişsiz koli oluştur”). Base screens come from v6.
// States live in states/<slug>--<state>.html next to screens/, so relative asset paths stay the same. No application edits.
// `--replace` regenerates only this revision's generated files while it is pending approval.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),root=path.dirname(base),previous='2026-10-22-impeccable-v6',id='2026-10-22-impeccable-v7';
const to=path.join(base,'experiments',id),light=path.join(base,'previews',id+'-light');
if(fs.existsSync(to)||fs.existsSync(light)){
  const meta=fs.existsSync(path.join(to,'meta.json'))&&JSON.parse(fs.readFileSync(path.join(to,'meta.json'),'utf8'));
  if(!process.argv.includes('--replace')||meta&&meta.status!=='pending_approval')throw new Error('Revizyon zaten var; üzerine yazılmaz.');
  // DESIGN.md and validation.json are written by hand after review; keep them.
  for(const dir of [to,light])for(const item of ['screens','states','tokens.css','meta.json'])fs.rmSync(path.join(dir,item),{recursive:true,force:true});
}
const f=JSON.parse(fs.readFileSync(path.join(base,'fixtures.json'),'utf8'));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function icon(name,cls=''){const c={exports:{},module:{exports:{}},require:()=>((_name,nodes)=>nodes)};vm.runInNewContext(fs.readFileSync(path.join(root,'node_modules/lucide-react-native/dist/cjs/icons',name+'.js'),'utf8'),c);const nodes=Array.isArray(c.module.exports)?c.module.exports:c.exports.default;return '<svg class="icon'+(cls?' '+cls:'')+'" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+nodes.map(([tag,a])=>'<'+tag+' '+Object.entries(a).filter(([k])=>k!=='key').map(([k,v])=>k+'="'+esc(v)+'"').join(' ')+'/>').join('')+'</svg>';}
function replaceOnce(html,search,replacement){if(!html.includes(search))throw new Error('Beklenen yapı bulunamadı: '+search);if(html.indexOf(search)!==html.lastIndexOf(search))throw new Error('Birden fazla eşleşme: '+search);return html.replace(search,()=>replacement);}
// A global pattern that must match exactly `count` times.
function replaceCount(html,pattern,replacement,count){const found=(html.match(pattern)||[]).length;if(found!==count)throw new Error('Beklenen '+count+' eşleşme, bulunan '+found+': '+pattern);return html.replace(pattern,replacement);}

// The user's decisions, applied to the base screens.
const baseFixes={
  'irskoli-listesi':html=>replaceCount(html,/<article class="v4-card v4-select" role="checkbox" aria-checked="false"><span class="v4-check" aria-hidden="true"><\/span><h2 class="mono">(KL-\d+)<\/h2><span class="v4-status open">/g,
    '<article class="v4-card v4-select off" role="checkbox" aria-checked="false" aria-disabled="true"><span class="v4-check" aria-hidden="true"></span><div><h2 class="mono">$1</h2><p class="v7-why">Kapatılmadan eklenemez</p></div><span class="v4-status open">',3),
  'order-receipts':html=>replaceOnce(html,'<h2>Sipariş bağlantısı yapılmayacak</h2><p>Siparişten bağımsız koli oluştur</p>','<h2>Siparişsiz koli oluştur</h2><p>Koli bir siparişe bağlanmaz</p>')
};

// State helpers. Covers and sheets sit above the app; the phone's own status bar and home indicator stay readable on top.
const item=f.items[0],qty=n=>n.toFixed(2),barcode=esc(f.barcode);
const newBox='KL-'+String(Math.max(...f.boxes.map(b=>Number(b.PackageNo.slice(3))))+1).padStart(6,'0');
const titled=(html,name)=>html.replace(/<title>([^<]*) · Impeccable önerisi<\/title>/,(_,t)=>'<title>'+t+' · '+name+' · Impeccable önerisi</title>');
const bodyClass=(html,cls)=>html.replace(/<body class="([^"]*)">/,(_,c)=>'<body class="'+c+' '+cls+'">');
const overlay=(html,markup)=>replaceOnce(html,'<div class="system-bottom"',markup+'<div class="system-bottom"');
const toast=(html,title,message)=>replaceOnce(html,'<footer class="v4-footer quad">','<div class="v7-toast" role="status"><span class="v7-toast-mark">'+icon('check')+'</span><div><strong>'+title+'</strong><p>'+message+'</p></div></div><footer class="v4-footer quad">');
const items=html=>[...html.matchAll(/<article class="v4-card v4-item">[\s\S]*?<\/article>/g)];
function firstItem(html,change){const [first]=items(html);if(!first)throw new Error('Ürün kartı yok');return html.slice(0,first.index)+change(first[0])+html.slice(first.index+first[0].length);}
const errorCover=(reason)=>'<div class="v7-cover err" role="alertdialog" aria-modal="true" aria-labelledby="scan-result-title" aria-describedby="scan-result-reason"><div class="v7-cover-body"><span class="v7-mark">'+icon('x')+'</span><h2 class="v7-verdict" id="scan-result-title">İşlem Başarısız</h2><div class="v7-detail"><p id="scan-result-reason">'+reason+'</p><p class="v7-code"><span>Okutulan barkod</span><strong>'+barcode+'</strong></p></div></div><div class="v7-cover-actions"><span class="v7-btn" role="button">Tamam</span></div></div>';
const variant=esc(item.sh_Renk)+' / '+esc(item.sh_Beden);
const states={
  'barcode-scanner':[
    ['gonderiliyor','Gönderiliyor',html=>replaceOnce(replaceOnce(html,'<div class="v5-barcode">','<div class="v5-barcode v7-locked">'),'<div class="v4-btn v5-send">Gönder</div>','<div class="v4-btn v5-send v7-busy" role="button" aria-disabled="true" aria-busy="true" aria-label="Gönderiliyor">'+icon('loader-circle')+'</div>'),
      ['Gönder’e basılınca düğmede yükleniyor işareti döner ve düğme pasifleşir; çift gönderim olmaz. Uygulamadaki davranış.','Barkod alanı yanıt gelene kadar kilitli ve soluk; ses ve titreşim yok.']],
    ['okutma-basarili','Okutma başarılı',null,
      ['Okutma başarılıysa koli açılır ve doğrudan yeni kolinin detayına geçilir: '+newBox+', ilk ürün 1 adet. Uygulamadaki davranış.','Altta 2 sn kalan bildirim “Başarılı” ve sunucunun açıklamasını gösterir; buradaki açıklama metni örnektir.','Okutma alanı yeniden odaklanır; sonraki ürün hemen okutulabilir.']],
    ['okutma-hatali','Okutma hatalı',html=>overlay(bodyClass(html,'v7-on-err'),errorCover('Koli oluşturulurken hata meydana geldi.')),
      ['Tam ekran hata kırmızısı, 500 ms titreşim ve Ayarlar’daki hata sesi (Klasik Bip ya da yalnız titreşim). Marka kırmızısı düğmelerden ölçekle ve daha sıcak tonla (#FF3340) ayrışır.','Neden sunucunun açıklamasıdır; yoksa uygulamanın kendi metni “Koli oluşturulurken hata meydana geldi.” gösterilir. Okutulan barkod altta yazılır.','Tamam başparmak bölgesinde; kapanınca alan temizlenir ve yeniden odaklanır.']]
  ],
  'koli-detay':[
    ['okutma-basarili','Okutma başarılı',html=>overlay(bodyClass(firstItem(html,a=>replaceOnce(a,'<strong>'+qty(item.h2_Miktar)+'</strong>','<strong>'+qty(item.h2_Miktar+1)+'</strong>')),'v7-on-ok'),
      '<div class="v7-cover ok" role="status"><div class="v7-cover-body"><span class="v7-mark">'+icon('check')+'</span><p class="v7-verdict">Eklendi</p><p class="v7-count"><strong>'+(item.h2_Miktar+1)+'</strong>'+esc(item.sh_Birim)+'</p><p class="v7-what">'+esc(item.InventoryName)+'<br>'+variant+'</p></div></div>'),
      ['Ürün eklenince ~350 ms tam ekran yeşil parlama: onay işareti, “Eklendi” ve ürünün yeni miktarı. Ses yok; marka dokümanında başarı sessizdir.','Parlama okutmayı durdurmaz; biter bitmez sonraki barkod okutulabilir.','Eklenen ürün, liste yenilenince miktarı artan satırdan bulunur; servis değişikliği gerekmez.']],
    ['okutma-sonrasi','Başarılı okutmadan sonra',html=>toast(firstItem(html,a=>replaceOnce(a,'<strong>'+qty(item.h2_Miktar)+'</strong>','<strong>'+qty(item.h2_Miktar+1)+'</strong>').replace('<article class="v4-card v4-item">','<article class="v4-card v4-item v7-just">')),
      'Ürün eklendi',esc(item.InventoryName)+' · '+variant+' · '+(item.h2_Miktar+1)+' '+esc(item.sh_Birim)),
      ['Parlamadan sonra liste yenilenir; miktarı artan ürün yeşil çerçeveyle işaretlenir.','Altta 2 sn kalan bildirim hangi ürünün eklendiğini ve yeni miktarı söyler; uygulamadaki “Başarılı / Ürün eklendi” yerine.','Silme modunda aynı akış “Ürün silindi” ile çalışır.']],
    ['okutma-hatali','Okutma hatalı',html=>overlay(bodyClass(html,'v7-on-err'),errorCover('Okutulan barkod sistemde bulunamadı.')),
      ['Tam ekran hata kırmızısı, 500 ms titreşim ve hata sesi; liste ve okutma alanı arkada değişmeden kalır.','Neden sunucunun açıklamasıdır (buradaki metin örnektir); yoksa “Bir hata oluştu”. Okutulan barkod altta yazılır.','Tamam başparmak bölgesinde; kapanınca okutma alanı yeniden odaklanır.']],
    ['miktar-asimi','Miktar aşımı',html=>overlay(html,'<div class="v7-scrim"><section class="v7-sheet" role="alertdialog" aria-modal="true" aria-labelledby="limit-title" aria-describedby="limit-message"><span class="v7-warn-mark">'+icon('triangle-alert')+'</span><h2 id="limit-title">Miktar Aşımı</h2><p id="limit-message">Sipariş miktarı aşılıyor, devam etmek istiyor musunuz?</p><p class="v7-chip">'+barcode+'</p><div class="v7-sheet-actions"><span class="v4-btn quiet" role="button">Hayır</span><span class="v4-btn v7-warn" role="button">Evet</span></div></section></div>'),
      ['Sipariş miktarı aşılırsa hata sesi ve titreşimle onay penceresi açılır; metin ve “Hayır / Evet” uygulamadakiyle aynı.','Pencere alttan açılır, düğmeler başparmak bölgesinde; okutulan barkod gösterilir. Evet, ürünü sınırı yok sayarak ekler.','Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır.']]
  ]
};
// The scan screen's success is the new box's detail page, so it is drawn from Koli Detayı.
function newBoxPage(detail){
  let html=replaceOnce(detail,'<h1 class="mono">'+esc(f.boxes[0].PackageNo)+'</h1>','<h1 class="mono">'+newBox+'</h1>');
  for(const extra of items(html).slice(1).reverse())html=html.slice(0,extra.index)+html.slice(extra.index+extra[0].length);
  html=replaceOnce(html,'<strong>'+f.items.length+'</strong> ürün kalemi','<strong>1</strong> ürün kalemi');
  html=firstItem(html,a=>replaceOnce(a,'<strong>'+qty(item.h2_Miktar)+'</strong>','<strong>'+qty(1)+'</strong>'));
  return toast(html,'Başarılı',newBox+' numaralı koli oluşturuldu.');
}

const css=fs.readFileSync(path.join(base,'experiments',previous,'tokens.css'),'utf8')+`
/* Revision 07 — scan results. Success is a quiet green flash; alert-red is full-bleed, audible and dismissed by hand (DESIGN-extreme). */
:root{--v7-ok:#23c277;--v7-on-ok:#06130c;--v7-err:#ff3340;--v7-on-err:#ffffff;--v7-err-ink:#b0121c;--v7-err-panel:color-mix(in srgb,#000000 24%,transparent);--v7-warn:#f5a524;--v7-on-warn:#1a1304;--v7-warn-tile:#2a2008;--v7-warn-ink:#f5a524;--v7-scrim:rgba(0,0,0,.66);--v7-toast:#26242a;--v7-toast-line:#3a3742;--v7-ok-tile:#0e2419;--v7-ok-ink:#23c277;--v7-mark:88px;--v7-mark-icon:44px;--v7-verdict:28px;--v7-count:56px;--v7-footer:120px}
:root[data-app-theme="light"]{--v7-ok:#159c5b;--v7-err:#d32030;--v7-warn-tile:#fbf0da;--v7-warn-ink:#8a570a;--v7-scrim:rgba(0,0,0,.45);--v7-toast:#e2e2e5;--v7-toast-line:#d7d3dc;--v7-ok-tile:#ffffff;--v7-ok-ink:#0e7a45}
.v7-cover{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;padding:calc(var(--status-height) + var(--s6)) var(--s5) calc(var(--status-height) + var(--s4));text-align:center}
.v7-cover.ok{background:var(--v7-ok);color:var(--v7-on-ok)}
.v7-cover.err{background:var(--v7-err);color:var(--v7-on-err)}
.v7-cover-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--s3)}
.v7-mark{width:var(--v7-mark);height:var(--v7-mark);display:grid;place-items:center;margin-bottom:var(--s2);border:3px solid currentColor;border-radius:50%}
.v7-mark .icon{width:var(--v7-mark-icon);height:var(--v7-mark-icon);stroke-width:2.6}
.v7-verdict{font-size:var(--v7-verdict);font-weight:700;line-height:1.2;letter-spacing:-.01em}
.v7-count{display:flex;align-items:baseline;gap:var(--s2);font-size:var(--read-body);font-weight:600}
.v7-count strong{font-family:var(--font-mono);font-size:var(--v7-count);font-weight:600;line-height:1}
.v7-what{font-size:var(--read-body);font-weight:600;line-height:1.45}
.v7-detail{width:100%;display:flex;flex-direction:column;gap:var(--s3);margin-top:var(--s4);padding:var(--s4);border-radius:var(--r3);background:var(--v7-err-panel)}
.v7-detail p{font-size:var(--read-body);line-height:1.45}
.v7-code{display:flex;flex-direction:column;gap:var(--s1)}
.v7-code span{font-size:var(--read-meta);font-weight:600}
.v7-code strong{font-family:var(--font-mono);font-size:var(--v4-scan);font-weight:500;letter-spacing:.06em}
.v7-cover-actions{display:flex}
.v7-btn{flex:1;display:flex;align-items:center;justify-content:center;min-height:var(--s14);border-radius:var(--r2);background:var(--v7-on-err);color:var(--v7-err-ink);font-size:var(--read-body);font-weight:650}
.v7-on-ok .system-status,.v7-on-err .system-status{position:relative;z-index:6;padding:var(--s1) var(--s5)}
.v7-on-ok .system-status{color:var(--v7-on-ok);background:var(--v7-ok)}
.v7-on-err .system-status{color:var(--v7-on-err);background:var(--v7-err)}
.v7-on-ok .system-bottom,.v7-on-err .system-bottom,.v7-scrim~.system-bottom{z-index:6}
.v7-on-ok .system-bottom:after{background:var(--v7-on-ok)}
.v7-on-err .system-bottom:after{background:var(--v7-on-err)}
.v7-toast{position:absolute;left:var(--s4);right:var(--s4);bottom:calc(var(--v7-footer) + var(--s3));z-index:4;display:flex;align-items:center;gap:var(--s3);padding:var(--s3) var(--s4);border-radius:var(--r2);background:var(--v7-toast);border:var(--hairline) solid var(--v7-toast-line)}
.v7-toast-mark{width:var(--s8);height:var(--s8);display:grid;place-items:center;flex-shrink:0;border-radius:50%;background:var(--v7-ok-tile);color:var(--v7-ok-ink)}
.v7-toast-mark .icon{width:var(--s5);height:var(--s5);stroke-width:2.4}
.v7-toast>div{min-width:0}
.v7-toast strong{display:block;font-size:var(--read-body);font-weight:650;line-height:1.35}
.v7-toast p{font-size:var(--read-meta);line-height:1.4;color:var(--read-muted);margin-top:var(--s1)}
.v4-card.v7-just{border-color:var(--v4-ok-ink);outline:var(--hairline) solid var(--v4-ok-ink);outline-offset:calc(-2*var(--hairline))}
.v7-scrim{position:absolute;inset:0;z-index:5;display:flex;align-items:flex-end;background:var(--v7-scrim)}
.v7-sheet{width:100%;display:flex;flex-direction:column;align-items:center;gap:var(--s3);padding:var(--s6) var(--s5) calc(var(--status-height) + var(--s5));border-radius:var(--v4-r-hero) var(--v4-r-hero) 0 0;background:var(--v4-card);text-align:center}
.v7-warn-mark{width:var(--s16);height:var(--s16);display:grid;place-items:center;border-radius:50%;background:var(--v7-warn-tile);color:var(--v7-warn-ink)}
.v7-warn-mark .icon{width:var(--s8);height:var(--s8)}
.v7-sheet h2{font-size:var(--title);font-weight:700;line-height:1.25}
.v7-sheet>p{font-size:var(--read-body);line-height:1.5}
.v7-chip{padding:var(--s1) var(--s3);border-radius:var(--pill);background:var(--raised);font-family:var(--font-mono);font-size:var(--read-meta)}
.v7-sheet-actions{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:var(--s3);margin-top:var(--s3)}
.v7-sheet .v4-btn{min-height:var(--s14);font-size:var(--read-body)}
.v4-btn.v7-warn{background:var(--v7-warn);color:var(--v7-on-warn)}
.v7-busy .icon{width:var(--s6);height:var(--s6);stroke-width:2.4}
@media (prefers-reduced-motion:no-preference){.v7-busy .icon{animation:v7-spin 1s linear infinite}}
@keyframes v7-spin{to{transform:rotate(360deg)}}
.v5-barcode.v7-locked input{color:var(--read-muted)}
/* Open boxes cannot go on a waybill: dashed, quiet and with the reason on the row. */
.v4-select>div{flex:1;min-width:0}
.v4-select.off{background:var(--v4-band);border-style:dashed}
.v4-select.off h2{color:var(--read-muted)}
.v4-select.off .v4-check{border-style:dashed;border-color:var(--read-divider)}
.v7-why{font-size:var(--read-meta);line-height:1.4;color:var(--read-muted);margin-top:var(--s1)}
`;
const sources=[[to,path.join(base,'experiments',previous)],[light,path.join(base,'previews',previous+'-light')]];
for(const [dir,from] of sources){
  for(const sub of ['screens','states'])fs.mkdirSync(path.join(dir,sub),{recursive:true});
  fs.writeFileSync(path.join(dir,'tokens.css'),css);
  const screens={};
  for(const file of fs.readdirSync(path.join(from,'screens')).filter(n=>n.endsWith('.html'))){
    const slug=file.slice(0,-5);
    screens[slug]=(baseFixes[slug]||(h=>h))(fs.readFileSync(path.join(from,'screens',file),'utf8'));
    fs.writeFileSync(path.join(dir,'screens',file),screens[slug]);
  }
  for(const [slug,list] of Object.entries(states))for(const [state,name,make] of list){
    const html=titled(make?make(screens[slug]):newBoxPage(screens['koli-detay']),name);
    if(/undefined|\[object Object\]/.test(html))throw new Error('Eksik veri: '+slug+'--'+state);
    fs.writeFileSync(path.join(dir,'states',slug+'--'+state+'.html'),html);
  }
}
const old=JSON.parse(fs.readFileSync(path.join(base,'experiments',previous,'meta.json'),'utf8'));
const screenNotes={...old.screenNotes,
  'barcode-scanner':[...old.screenNotes['barcode-scanner'],'Durum seçicide: Gönderiliyor, Okutma başarılı (yeni kolinin detayı) ve Okutma hatalı.'],
  'koli-detay':[...old.screenNotes['koli-detay'],'Durum seçicide: Okutma başarılı (yeşil parlama), Başarılı okutmadan sonra, Okutma hatalı ve Miktar aşımı.'],
  'irskoli-listesi':['Kaynak: v6; seçim modunda iki kapalı koli seçili.','Açık koliler irsaliyeye eklenemez (kullanıcı kararı): kesik çizgili satır, pasif onay kutusu ve satırda “Kapatılmadan eklenemez”.','Açık/Kapalı rozetleri renk, nokta ve kelimeyle; seçili satırlar çivit.'],
  'order-receipts':['Kaynak: v6; arama, siparişsiz koli seçeneği ve sipariş kartları korundu.','Siparişsiz seçenek “Siparişsiz koli oluştur / Koli bir siparişe bağlanmaz” (kullanıcı kararı): eylemi söyler, uyarı gibi okunmaz.','Cari adı en fazla iki satır; kırmızı ikon tonu barkod ekranıyla aynı.']
};
const meta={...old,id,date:'2026-10-22',revision:7,previous,status:'pending_approval',label:'Impeccable · Okutma sonuçları ve durumlar',
  note:'Yedinci öneri: okutmadan sonra olanlar (yeşil başarı parlaması, tam ekran hata, miktar aşımı onayı, gönderim) Barkod Okutma ve Koli Detayı’nın durumları olarak çizildi. Açık koliler irsaliyeye eklenemez; siparişsiz seçenek “Siparişsiz koli oluştur” oldu. Ana koda uygulanmadı.',
  skill:'impeccable / harden / operate',screenNotes,
  states:Object.fromEntries(Object.entries(states).map(([slug,list])=>[slug,list.map(([state,name,,notes])=>({id:state,name,notes}))]))};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'Yedinci önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Okutma sonuçları: dokuz ekran, yedi durum, iki tema.');
