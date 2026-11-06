// Twelfth revision (2026-10-27): user feedback on v8/v9/v11. Codes leave the monospace face (user disliked it) and use
// the sans with tabular numerals. Ana Sayfa cards get one height. Koli Listesi groups boxes by order, with the order
// number written out in the group header (the v9 card hid it in a muted prefix). Koli Detayı keeps the v9 card body
// (barcode under the code, labelled Renk / Lot adeti foot) with v11's quantity in the top-right corner. Sipariş Seçimi
// groups real orders by customer. Barkod Okutma: font, real order number and customer.
// İrsaliye stays on v9; login, settings and create-koli stay on v8. `--replace` regenerates while pending approval.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),root=path.dirname(base),id='2026-10-27-impeccable-v12';
const v8='2026-10-23-impeccable-v8',v9='2026-10-27-impeccable-v9',v11='2026-10-27-impeccable-v11';
const to=path.join(base,'experiments',id),light=path.join(base,'previews',id+'-light');
if(fs.existsSync(to)||fs.existsSync(light)){
  const meta=fs.existsSync(path.join(to,'meta.json'))&&JSON.parse(fs.readFileSync(path.join(to,'meta.json'),'utf8'));
  if(!process.argv.includes('--replace')||meta&&meta.status!=='pending_approval')throw new Error('Revizyon zaten var; üzerine yazılmaz.');
  // DESIGN.md is written by hand after review; keep it.
  for(const dir of [to,light])for(const item of ['screens','states','tokens.css','meta.json'])fs.rmSync(path.join(dir,item),{recursive:true,force:true});
}
const api=JSON.parse(fs.readFileSync(path.join(base,'fixtures-api.json'),'utf8'));
const boxes=api.koliListesi.items,rows=api.koliDetay.items['8'];
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function icon(name,cls=''){const c={exports:{},module:{exports:{}},require:()=>((_name,nodes)=>nodes)};vm.runInNewContext(fs.readFileSync(path.join(root,'node_modules/lucide-react-native/dist/cjs/icons',name+'.js'),'utf8'),c);const nodes=Array.isArray(c.module.exports)?c.module.exports:c.exports.default;return '<svg class="icon'+(cls?' '+cls:'')+'" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+nodes.map(([tag,a])=>'<'+tag+' '+Object.entries(a).filter(([k])=>k!=='key').map(([k,v])=>k+'="'+esc(v)+'"').join(' ')+'/>').join('')+'</svg>';}
function replaceOnce(html,search,replacement){if(html.split(search).length!==2)throw new Error('Beklenen yapı bulunamadı: '+search);return html.replace(search,()=>replacement);}
const replaceRun=(html,start,end,markup)=>{const i=html.indexOf(start),j=html.indexOf(end,i);if(i<0||j<0||html.indexOf(start,i+1)>=0&&html.indexOf(start,i+1)<i)throw new Error('Liste bulunamadı: '+start);return html.slice(0,i)+markup+html.slice(j);};
const titled=(html,name)=>html.replace(/<title>([^<]*) · Impeccable önerisi<\/title>/,(_,t)=>'<title>'+t+' · '+name+' · Impeccable önerisi</title>');

// Koli Listesi: one card per order (first-seen order, i.e. the service's newest-first order); header names the order,
// its description and box count; each row is one box, sequence large, full box number under it.
const groups=[];for(const b of boxes){let g=groups.find(x=>x.no===b.ReceiptNo);if(!g)groups.push(g={no:b.ReceiptNo,exp:b.SipExp,boxes:[]});g.boxes.push(b);}
const seq=no=>no.includes('-')?no.slice(no.lastIndexOf('-')+1):no;
const boxList='<p class="v4-count"><strong>'+boxes.length+'</strong> koli · <strong>'+groups.length+'</strong> sipariş</p>'+groups.map(g=>
  '<section class="v4-card v12-group" aria-label="Sipariş '+esc(g.no)+'"><header class="v12-group-head"><div><h2><span class="v12-k">Sipariş No</span> <span class="mono">'+esc(g.no)+'</span></h2>'+(g.exp?'<p class="v12-exp">'+esc(g.exp)+'</p>':'')+'</div><span class="v12-count">'+g.boxes.length+' koli</span></header>'+
  g.boxes.map(b=>'<article class="v12-row" role="button" aria-label="Koli '+esc(b.PackageNo)+'"><span class="v12-tile koli">'+icon('package')+'</span><div class="v12-row-text"><p class="v12-box-no"><span class="v12-k">Koli</span> <strong class="mono">'+esc(seq(b.PackageNo))+'</strong></p><p class="mono v12-full">'+esc(b.PackageNo)+'</p></div>'+icon('chevron-right','v12-chev')+'</article>').join('')+'</section>').join('');

// Sipariş Seçimi: the service returns orders sorted by customer (CurrentAccountName, the cari, not a depot) and most
// customers have several orders, so one card per customer, its orders as rows. Same group language as Koli Listesi.
const receipts=api.orderReceipts.items,customers=[];
for(const o of receipts){const name=o.CurrentAccountName.replace(/\s+/g,' ').trim();let c=customers.find(x=>x.name===name);if(!c)customers.push(c={name,orders:[]});c.orders.push(o);}
const orderList='<p class="v4-count"><strong>'+receipts.length+'</strong> sipariş · <strong>'+customers.length+'</strong> cari</p>'+customers.map(c=>
  '<section class="v4-card v12-group" aria-label="'+esc(c.name)+'"><header class="v12-group-head"><div><h2 class="v12-cari">'+esc(c.name)+'</h2></div><span class="v12-count">'+c.orders.length+' sipariş</span></header>'+
  c.orders.map(o=>'<article class="v12-row v12-order" role="button" aria-label="Sipariş '+esc(o.ReceiptNo)+'"><span class="v12-tile koli">'+icon('file-text')+'</span><p class="v12-box-no"><span class="v12-k">Sipariş No</span> <strong class="mono">'+esc(o.ReceiptNo)+'</strong></p>'+icon('chevron-right','v12-chev')+'</article>').join('')+'</section>').join('');

// Koli Detayı: v9 card body, v11 quantity corner.
const keyOf=(row,prefix)=>Object.keys(row).find(k=>k.startsWith(prefix));
const sentence=t=>t[0]+t.slice(1).toLocaleLowerCase('tr');
const num=v=>Number(String(v).replace(',','.'))||0;
const card=(r,{qty=r.sh_Miktar,just=false}={})=>{
  const h2=keyOf(r,'h2_'),facts=Object.keys(r).filter(k=>k.startsWith('sh_')&&k!=='sh_Miktar');
  return '<article class="v4-card v4-item v12-item'+(just?' v7-just':'')+'"><div class="v12-item-head"><span class="v4-tile koli">'+icon('package')+'</span><div class="v12-what"><h2 class="mono">'+esc(r[keyOf(r,'h1_')])+'</h2>'+(h2?'<p class="v4-sku"><span>'+esc(sentence(h2.slice(3)))+'</span><strong class="mono">'+esc(r[h2])+'</strong></p>':'')+'</div><div class="v11-qty"><span>Miktar</span><strong class="mono">'+esc(qty)+'</strong></div></div>'+
    (facts.length?'<div class="v4-item-foot"><dl class="v4-variant">'+facts.map(k=>'<div><dt>'+esc(sentence(k.slice(3)))+'</dt><dd>'+esc(r[k])+'</dd></div>').join('')+'</dl></div>':'')+'</article>';
};
const products=(html,items,opts={})=>replaceRun(html,'<p class="v4-count">','</div></div><footer','<p class="v4-count"><strong>'+items.length+'</strong> ürün kalemi</p>'+items.map((r,i)=>card(r,i===opts.bump?{qty:opts.qty,just:true}:{})).join(''));

const first=rows[0],added=String(num(first.sh_Miktar)+1),order=boxes[0].ReceiptNo,scanned=first.h2_Barkod;
const aboveFooter=(html,notice)=>replaceOnce(html,'<footer class="v4-footer quad">',notice+'<footer class="v4-footer quad">');
const overlay=(html,markup)=>replaceOnce(html,'<div class="system-bottom"',markup+'<div class="system-bottom"');
const okNotice=(title,message)=>'<div class="v7-toast" role="status"><span class="v7-toast-mark">'+icon('check')+'</span><div><strong>'+title+'</strong><p>'+message+'</p></div></div>';
const errNotice=(reason,code)=>'<div class="v7-toast v8-err" role="alert"><span class="v7-toast-mark">'+icon('x')+'</span><div><strong>Okutma başarısız</strong><p>'+reason+'</p><p class="v8-code">'+esc(code)+'</p></div><span class="v8-close" role="button" aria-label="Bildirimi kapat">'+icon('x')+'</span></div>';
const detailStates=[
  ['okutma-basarili','Okutma başarılı',html=>aboveFooter(products(html,rows,{bump:0,qty:added}),okNotice('Ürün eklendi',esc(first['h1_Malzeme Adı'])+' · '+esc(first.sh_Renk)+' · Miktar '+added))],
  ['okutma-hatali','Okutma hatalı',html=>aboveFooter(replaceOnce(html,'<div class="v4-scan-input">','<div class="v4-scan-input v8-bad">').replace('placeholder="Eklenecek barkodu okutun..."','value="8690123456789"'),errNotice('Okutulan barkod sistemde bulunamadı.','8690123456789'))],
  ['miktar-asimi','Miktar aşımı',html=>overlay(html,'<div class="v7-scrim"><section class="v7-sheet" role="alertdialog" aria-modal="true" aria-labelledby="limit-title" aria-describedby="limit-message"><span class="v7-warn-mark">'+icon('triangle-alert')+'</span><h2 id="limit-title">Miktar Aşımı</h2><p id="limit-message">Sipariş miktarı aşılıyor, devam etmek istiyor musunuz?</p><p class="v7-chip">'+esc(scanned)+'</p><div class="v7-sheet-actions"><span class="v4-btn quiet" role="button">Hayır</span><span class="v4-btn v7-warn" role="button">Evet</span></div></section></div>')]
];

// Barkod Okutma: real order number and customer (the order's CurrentAccountName), barcode in the sans.
const customer=receipts.find(o=>o.ReceiptNo===order).CurrentAccountName;
const scanPage=html=>html.split('SIP-2026-0148').join(order).split('Marmara Tekstil A.Ş.').join(esc(customer)).split('8690123456789').join(scanned).replace('aria-label="Sipariş fişi '+order+'"','aria-label="Sipariş No '+order+'"');
// After a successful first scan the app opens the new box: next sequence of the same order, first product 1.
const nextBox=order+'-'+String(Number(seq(boxes[0].PackageNo))+1).padStart(3,'0');

const css=fs.readFileSync(path.join(base,'experiments',v11,'tokens.css'),'utf8')+`
/* Revision 12 — readability pass from user feedback. */
/* Codes and numbers leave the monospace face: the sans with tabular numerals. */
:root,:root[data-app-theme="light"]{--font-mono:Proposal,sans-serif}
.mono{font-feature-settings:"tnum" 1,"lnum" 1}
.v4-scan-input.big input,.v5-barcode input,.v7-code strong,.v4-scan-input.v8-bad input{letter-spacing:.02em}
.v7-chip,.v8-err p.v8-code{letter-spacing:.02em}
/* Ana Sayfa: both destinations one height. */
.dashboard-actions{display:grid;grid-auto-rows:1fr}
.destination{min-height:calc(var(--s16) + var(--s12))}
/* Koli Listesi and Sipariş Seçimi: grouped rows. */
.v12-k{font-size:var(--read-meta);font-weight:500;color:var(--read-muted)}
.v12-group-head{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--s3);padding:var(--s3) var(--s4);background:var(--v4-band);border-bottom:var(--hairline) solid var(--v4-band-line)}
.v12-group-head>div{min-width:0}
.v12-group-head h2{font-size:var(--read-title);font-weight:650;line-height:1.3}
.v12-group-head h2 .v12-k{margin-right:var(--s1)}
.v12-exp{margin-top:var(--s1);font-size:var(--read-meta);font-weight:500;line-height:1.45;color:var(--read-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.v12-count{flex-shrink:0;margin-top:var(--s1);padding:var(--s1) var(--s2);border-radius:var(--pill);background:var(--v4-card);box-shadow:inset 0 0 0 var(--hairline) var(--v4-band-line);font-size:var(--read-meta);font-weight:600;line-height:1.3;white-space:nowrap}
.v12-row{display:grid;grid-template-columns:var(--s10) minmax(0,1fr) var(--s5);gap:var(--s3);align-items:center;min-height:var(--s16);padding:var(--s2) var(--s4)}
.v12-row+.v12-row{border-top:var(--hairline) solid var(--v4-band-line)}
.v12-tile{width:var(--s10);height:var(--s10);display:grid;place-items:center;border-radius:var(--r2)}
.v12-tile.koli{background:var(--v4-koli-tile);color:var(--v5-scan-red)}
.v12-tile .icon{width:var(--s5);height:var(--s5)}
.v12-row-text{min-width:0}
.v12-box-no{display:flex;align-items:baseline;gap:var(--s1);line-height:1.3}
.v12-box-no strong{font-size:var(--read-title);font-weight:650}
.v12-full{margin-top:var(--s1);font-size:var(--read-meta);line-height:1.4;color:var(--read-muted)}
.v12-chev{width:var(--s5);height:var(--s5);color:var(--subtle)}
.v12-order{min-height:var(--s14)}
.v12-cari{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.v12-group-head h2.v12-cari{font-size:var(--read-body)}
/* Koli Detayı: v9 card body with v11's quantity corner. */
.v12-item-head{display:grid;grid-template-columns:var(--v4-tile) minmax(0,1fr) auto;gap:var(--s3);align-items:start}
.v12-what{min-width:0}
.v12-item .v4-item-foot{margin-top:var(--s3)}
.v12-item.v7-just{background:var(--v4-ok-tile)}
`;

const screens=[
  ['dashboard',v8,html=>html],
  ['koli-listesi',v9,html=>replaceRun(html,'<p class="v4-count">','</div></div><footer',boxList)],
  ['koli-detay',v11,html=>products(html,rows)],
  ['order-receipts',v8,html=>replaceRun(html,'<p class="v4-count">','</div></div></main>',orderList)],
  ['barcode-scanner',v8,scanPage]
];
const check=(out,what)=>{if(/undefined|\[object Object\]|NaN|SIP-2026|Marmara|KL-0/.test(out))throw new Error('Eksik ya da eski veri: '+what);return out;};
for(const [dir,src] of [[to,n=>path.join(base,'experiments',n)],[light,n=>path.join(base,'previews',n+'-light')]]){
  for(const sub of ['screens','states'])fs.mkdirSync(path.join(dir,sub),{recursive:true});
  fs.writeFileSync(path.join(dir,'tokens.css'),css);
  const pages={};
  for(const [slug,from,make] of screens){pages[slug]=check(make(fs.readFileSync(path.join(src(from),'screens',slug+'.html'),'utf8')),slug);fs.writeFileSync(path.join(dir,'screens',slug+'.html'),pages[slug]);}
  for(const [state,name,make] of detailStates)fs.writeFileSync(path.join(dir,'states','koli-detay--'+state+'.html'),check(titled(make(pages['koli-detay']),name),state));
  for(const state of ['gonderiliyor','okutma-hatali'])fs.writeFileSync(path.join(dir,'states','barcode-scanner--'+state+'.html'),check(scanPage(fs.readFileSync(path.join(src(v8),'states','barcode-scanner--'+state+'.html'),'utf8')),state));
  const opened=aboveFooter(products(pages['koli-detay'].replace(boxes[0].PackageNo,nextBox),[first],{bump:0,qty:'1'}),okNotice('Başarılı',esc(nextBox)+' numaralı koli oluşturuldu.'));
  fs.writeFileSync(path.join(dir,'states','barcode-scanner--okutma-basarili.html'),check(opened.replace(/<title>[^<]*<\/title>/,'<title>Koli Detayı · Okutma başarılı · Impeccable önerisi</title>'),'scan-ok'));
}
const m8=JSON.parse(fs.readFileSync(path.join(base,'experiments',v8,'meta.json'),'utf8')),m11=JSON.parse(fs.readFileSync(path.join(base,'experiments',v11,'meta.json'),'utf8'));
const scanStates=m8.states['barcode-scanner'].map(s=>s.id!=='okutma-basarili'?s:{...s,notes:s.notes.map(n=>n.replace('KL-001255',nextBox))});
const meta={id,date:'2026-10-27',revision:12,previous:v11,status:'pending_approval',basedOn:m11.basedOn,label:'Impeccable · Okunabilirlik ve gruplama',
  note:'On ikinci öneri: kullanıcı geri bildirimi. Kodlar sabit genişlikli yazı tipinden çıktı; Ana Sayfa kartları eşit boy; Koli Listesi siparişe göre gruplu; Koli Detayı kartı v9 düzeninde, miktar v11’deki gibi; Sipariş Seçimi cariye göre gruplu. İrsaliye v9’da kalır. Ana koda uygulanmadı.',
  skill:'impeccable / typeset + layout',profile:m11.profile,
  screenNotes:{
    'dashboard':['İki kart aynı yükseklikte: alt metni iki satıra inen İrsaliye kartı Koli Listesi’ni de kendi boyuna çeker.','Metinler, renkler ve düzen v8 ile aynı.'],
    'koli-listesi':['Koliler siparişe göre gruplu: başlıkta “Sipariş No 00000151”, siparişin açıklaması ve koli sayısı. Sipariş numarası artık açıkça yazıyor.','Her satır bir koli: “Koli 022” büyük, altında tam koli no. Satır 64 px, dokunma alanı satırın tamamı.','Sıra servisin sırası (en yeni önce); bir sipariş ilk göründüğü yerde toplanır. Sayfalama gelirse aynı siparişin sonraki kolileri aynı gruba eklenir.','Kodlar sabit genişlikli yazı tipinden çıktı: aynı yazı tipi, rakamlar eşit genişlikte.'],
    'koli-detay':['Üst kısım v11 ile aynı.','Kart v9 düzeninde: ürün kodu, altında “Barkod …”, ince çizginin altında etiketli Renk ve Lot adeti.','Miktar v11’deki gibi sağ üstte, büyük ve yeşil; bütün kartlarda aynı hizada.'],
    'order-receipts':['Veri test sunucusunun orderReceipts yanıtından (ilk 24 kayıt). Kartın ikinci satırı depo değil cari (CurrentAccountName); depo yok.','Servis siparişleri cariye göre sıralı döndürüyor ve çoğu carinin birden çok siparişi var: her cari bir kart, başlıkta cari adı (en fazla iki satır) ve sipariş sayısı, satırlarda “Sipariş No 00000151”, 56 px.','Koli Listesi ile aynı grup dili. Uygulamadaki önek “Fiş:”; öneride “Sipariş No”.','Siparişsiz koli seçeneği ve arama (sipariş no veya cari) v8 ile aynı.'],
    'barcode-scanner':['Sipariş ve barkod sabit genişlikli yazı tipinden çıktı; barkod aralığı daraldı.','Sipariş çipi ve altındaki cari gerçek veriyle: 00000151, BEBETTO TEKSTİL A.Ş.','Düzen ve durumlar v8 ile aynı.']
  },
  states:{'koli-detay':m11.states['koli-detay'],'barcode-scanner':scanStates}};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'On ikinci önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Okunabilirlik: öneri 12 (5 ekran, 6 durum, iki tema).');
