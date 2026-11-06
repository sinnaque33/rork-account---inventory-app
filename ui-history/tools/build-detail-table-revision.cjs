// Tenth revision (2026-10-27): Koli Detayı's products as one table instead of a card per product. The real koliDetay rows
// (fixtures-api.json, box id 8) carry a product code, colour, barcode, lot count and quantity and no image, so the v9 card
// spent a decorative tile and three blocks per product. Here the column labels are written once (Ürün · Lot · Miktar),
// quantities line up in one right-aligned column and a total row closes the table. Base page and tokens come from v9.
// Only koli-detay and its three scan states; the viewer keeps v9/v8 for the other screens.
// `--replace` regenerates this revision while it is pending approval. No application edits.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),root=path.dirname(base),previous='2026-10-27-impeccable-v9',id='2026-10-27-impeccable-v10';
const to=path.join(base,'experiments',id),light=path.join(base,'previews',id+'-light');
if(fs.existsSync(to)||fs.existsSync(light)){
  const meta=fs.existsSync(path.join(to,'meta.json'))&&JSON.parse(fs.readFileSync(path.join(to,'meta.json'),'utf8'));
  if(!process.argv.includes('--replace')||meta&&meta.status!=='pending_approval')throw new Error('Revizyon zaten var; üzerine yazılmaz.');
  // DESIGN.md is written by hand after review; keep it.
  for(const dir of [to,light])for(const item of ['screens','states','tokens.css','meta.json'])fs.rmSync(path.join(dir,item),{recursive:true,force:true});
}
const api=JSON.parse(fs.readFileSync(path.join(base,'fixtures-api.json'),'utf8')),old=JSON.parse(fs.readFileSync(path.join(base,'fixtures.json'),'utf8'));
const rows=api.koliDetay.items['8'];
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function icon(name,cls=''){const c={exports:{},module:{exports:{}},require:()=>((_name,nodes)=>nodes)};vm.runInNewContext(fs.readFileSync(path.join(root,'node_modules/lucide-react-native/dist/cjs/icons',name+'.js'),'utf8'),c);const nodes=Array.isArray(c.module.exports)?c.module.exports:c.exports.default;return '<svg class="icon'+(cls?' '+cls:'')+'" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+nodes.map(([tag,a])=>'<'+tag+' '+Object.entries(a).filter(([k])=>k!=='key').map(([k,v])=>k+'="'+esc(v)+'"').join(' ')+'/>').join('')+'</svg>';}
function replaceOnce(html,search,replacement){if(html.split(search).length!==2)throw new Error('Beklenen yapı bulunamadı: '+search);return html.replace(search,()=>replacement);}

// A row: code (h1), colour and any other sh_ field on the second line, barcode (h2) on the third; lot and quantity in
// their own columns. Fields the server adds later fall onto the second line as “Label value”.
const keyOf=(row,prefix)=>Object.keys(row).find(k=>k.startsWith(prefix));
const sentence=t=>t[0]+t.slice(1).toLocaleLowerCase('tr');
const num=v=>Number(String(v).replace(',','.'))||0;
const row=(r,{qty=r.sh_Miktar,just=false}={})=>{
  const h2=keyOf(r,'h2_'),extra=Object.keys(r).filter(k=>k.startsWith('sh_')&&!['sh_Renk','sh_Miktar','sh_Lot Adeti'].includes(k));
  const second=[r.sh_Renk?'<span class="v10-color">'+esc(r.sh_Renk)+'</span>':'',...extra.map(k=>'<span>'+esc(sentence(k.slice(3)))+' '+esc(r[k])+'</span>')].filter(Boolean).join('');
  return '<div class="v10-row'+(just?' v10-just':'')+'" role="row"><div class="v10-what" role="cell"><strong class="mono">'+esc(r[keyOf(r,'h1_')])+'</strong>'+(second?'<p class="v10-meta">'+second+'</p>':'')+(h2?'<p class="mono v10-code" aria-label="'+esc(sentence(h2.slice(3)))+' '+esc(r[h2])+'">'+esc(r[h2])+'</p>':'')+'</div><span class="v10-lot mono" role="cell">'+esc(r['sh_Lot Adeti']??'–')+'</span><strong class="v10-qty mono" role="cell">'+esc(qty)+'</strong></div>';
};
const table=(list,{bump=-1}={})=>{
  const qtys=list.map((r,i)=>i===bump?String(num(r.sh_Miktar)+1):r.sh_Miktar),lots=list.reduce((s,r)=>s+num(r['sh_Lot Adeti']),0),total=qtys.reduce((s,q)=>s+num(q),0);
  return '<p class="v4-count"><strong>'+list.length+'</strong> ürün kalemi · toplam miktar <strong>'+total+'</strong></p>'+
    '<section class="v4-card v10-table" role="table" aria-label="Kolideki ürünler"><div class="v10-row v10-head" role="row"><span role="columnheader">Ürün</span><span role="columnheader">Lot</span><span role="columnheader">Miktar</span></div>'+
    list.map((r,i)=>row(r,{qty:qtys[i],just:i===bump})).join('')+
    '<div class="v10-row v10-total" role="row"><span role="cell">Toplam</span><span class="v10-lot mono" role="cell">'+lots+'</span><strong class="v10-qty mono" role="cell">'+total+'</strong></div></section>';
};
const products=(html,opts)=>{const i=html.indexOf('<p class="v4-count">'),j=html.indexOf('</div></div><footer',i);if(i<0||j<0)throw new Error('Ürün listesi bulunamadı');return html.slice(0,i)+table(rows,opts)+html.slice(j);};

// Scan states, same language as v8/v9: bottom notice for success and error, sheet only for the over-limit question.
const scanned=esc(old.barcode),first=rows[0],added=String(num(first.sh_Miktar)+1);
const titled=(html,name)=>html.replace(/<title>([^<]*) · Impeccable önerisi<\/title>/,(_,t)=>'<title>'+t+' · '+name+' · Impeccable önerisi</title>');
const aboveFooter=(html,notice)=>replaceOnce(html,'<footer class="v4-footer quad">',notice+'<footer class="v4-footer quad">');
const overlay=(html,markup)=>replaceOnce(html,'<div class="system-bottom"',markup+'<div class="system-bottom"');
const okNotice=(title,message)=>'<div class="v7-toast" role="status"><span class="v7-toast-mark">'+icon('check')+'</span><div><strong>'+title+'</strong><p>'+message+'</p></div></div>';
const errNotice=reason=>'<div class="v7-toast v8-err" role="alert"><span class="v7-toast-mark">'+icon('x')+'</span><div><strong>Okutma başarısız</strong><p>'+reason+'</p><p class="v8-code">'+scanned+'</p></div><span class="v8-close" role="button" aria-label="Bildirimi kapat">'+icon('x')+'</span></div>';
const states=[
  ['okutma-basarili','Okutma başarılı',html=>aboveFooter(products(html,{bump:0}),okNotice('Ürün eklendi',esc(first['h1_Malzeme Adı'])+' · '+esc(first.sh_Renk)+' · Miktar '+added)),
    ['Bildirim altta, 2 sn. Eklenen satır yeşil zeminli, miktarı yeşil ve yeni değeriyle (10 → '+added+'); toplam da güncellenir.','Ses yok, dokunma gerekmez; yeni okutma eskisinin yerine geçer.','Silme modunda aynı bildirim “Ürün silindi” der.']],
  ['okutma-hatali','Okutma hatalı',html=>aboveFooter(replaceOnce(html,'<div class="v4-scan-input">','<div class="v4-scan-input v8-bad">').replace('placeholder="Eklenecek barkodu okutun..."','value="'+scanned+'"'),errNotice('Okutulan barkod sistemde bulunamadı.')),
    ['Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Tablo değişmez.','Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; neden metni örnektir.','Bildirim sonraki okutmaya kadar kalır, × ile de kapanır.']],
  ['miktar-asimi','Miktar aşımı',html=>overlay(html,'<div class="v7-scrim"><section class="v7-sheet" role="alertdialog" aria-modal="true" aria-labelledby="limit-title" aria-describedby="limit-message"><span class="v7-warn-mark">'+icon('triangle-alert')+'</span><h2 id="limit-title">Miktar Aşımı</h2><p id="limit-message">Sipariş miktarı aşılıyor, devam etmek istiyor musunuz?</p><p class="v7-chip">'+esc(first.h2_Barkod)+'</p><div class="v7-sheet-actions"><span class="v4-btn quiet" role="button">Hayır</span><span class="v4-btn v7-warn" role="button">Evet</span></div></section></div>'),
    ['Karar gerektiği için okutmayı durduran tek durum: alttan pencere, uygulamadaki metin ve “Hayır / Evet”.','Okutulan barkod, tablodaki T4121’in gerçek barkodu.','Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır.']]
];

const css=fs.readFileSync(path.join(base,'experiments',previous,'tokens.css'),'utf8')+`
/* Revision 10 — Koli Detayı products as one table: labels once, quantities in one right-aligned column, total row. */
.v10-table{display:flex;flex-direction:column}
.v10-row{display:grid;grid-template-columns:minmax(0,1fr) var(--s12) var(--s16);align-items:center;gap:var(--s3);padding:var(--s3) var(--s4)}
.v10-row+.v10-row{border-top:var(--hairline) solid var(--v4-band-line)}
.v10-head{padding-top:var(--s2);padding-bottom:var(--s2);background:var(--v4-band);font-size:var(--read-meta);font-weight:600;color:var(--read-muted)}
.v10-head>span:nth-child(n+2),.v10-lot,.v10-qty{text-align:right}
.v10-what{min-width:0}
.v10-what>strong{display:block;font-size:var(--read-product);font-weight:650;line-height:1.3}
.v10-meta{display:flex;flex-wrap:wrap;gap:var(--s1) var(--s3);margin-top:var(--s1);font-size:var(--read-meta);font-weight:550;line-height:1.45}
.v10-code{margin-top:var(--s1);font-size:var(--read-meta);line-height:1.45;letter-spacing:.04em;color:var(--read-muted)}
.v10-lot{font-size:var(--read-body);font-weight:500;color:var(--read-muted)}
.v10-qty{font-size:var(--read-quantity);font-weight:600;line-height:1.2;color:var(--v4-ok-ink)}
.v10-total{background:var(--v4-band);font-size:var(--read-meta);font-weight:650}
.v10-total .v10-lot{color:var(--ink);font-size:var(--read-meta);font-weight:650}
.v10-total .v10-qty{font-size:var(--read-body);color:var(--ink)}
.v10-just{background:var(--v4-ok-tile)}
.v10-just .v10-lot,.v10-just .v10-code{color:var(--ink)}
`;
for(const [dir,from] of [[to,path.join(base,'experiments',previous)],[light,path.join(base,'previews',previous+'-light')]]){
  for(const sub of ['screens','states'])fs.mkdirSync(path.join(dir,sub),{recursive:true});
  fs.writeFileSync(path.join(dir,'tokens.css'),css);
  const page=products(fs.readFileSync(path.join(from,'screens','koli-detay.html'),'utf8'));
  if(/undefined|\[object Object\]|NaN/.test(page))throw new Error('Eksik veri');
  fs.writeFileSync(path.join(dir,'screens','koli-detay.html'),page);
  for(const [state,name,make] of states){const out=titled(make(page),name);if(/undefined|\[object Object\]|NaN/.test(out))throw new Error('Eksik veri: '+state);fs.writeFileSync(path.join(dir,'states','koli-detay--'+state+'.html'),out);}
}
const prev=JSON.parse(fs.readFileSync(path.join(base,'experiments',previous,'meta.json'),'utf8'));
const meta={id,date:'2026-10-27',revision:10,previous,status:'pending_approval',basedOn:prev.basedOn,label:'Impeccable · Koli Detayı ürün tablosu',
  note:'Onuncu öneri: Koli Detayı’nda ürünler kart yerine tek tabloda. Sütun başlıkları bir kez, miktarlar tek sütunda, en altta toplam. Veri test sunucusunun koliDetay yanıtı. Ana koda uygulanmadı.',
  skill:'impeccable / layout',profile:prev.profile,
  screenNotes:{'koli-detay':[
    'Ürünler tek tabloda: Ürün · Lot · Miktar başlıkları bir kez yazılır. Yanıtta görsel olmadığı için ikon karosu kaldırıldı; satır başına üç blok yerine tek satır.',
    'Solda ürün kodu, altında renk, en altta barkod (sabit genişlikli, soluk). Miktarlar sağda, alt alta hizalı ve yeşil: okutma sırasında göz tek sütunda iner.',
    'Tablonun sonunda toplam lot ve toplam miktar; özet satırında da “toplam miktar”. Birim yanıtta olmadığı için yazılmaz. Sunucunun ekleyeceği yeni sh_ alanları renk satırına düşer.'
  ]},
  states:{'koli-detay':states.map(([state,name,,notes])=>({id:state,name,notes}))}};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'Onuncu önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Koli Detayı ürün tablosu: öneri 10 (1 ekran, 3 durum, iki tema).');
