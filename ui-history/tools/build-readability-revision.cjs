// Narrow, immutable revision: only box list and box detail. No application edits.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),root=path.dirname(base),previous='2026-10-16-impeccable-v2',id='2026-10-16-impeccable-v3';
const from=path.join(base,'experiments',previous),to=path.join(base,'experiments',id),light=path.join(base,'previews',id+'-light');
if(fs.existsSync(to)||fs.existsSync(light))throw new Error('Revizyon zaten var; üzerine yazılmaz.');
const f=JSON.parse(fs.readFileSync(path.join(base,'fixtures.json'),'utf8'));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function icon(name){const c={exports:{},module:{exports:{}},require:()=>((_name,nodes)=>nodes)};vm.runInNewContext(fs.readFileSync(path.join(root,'node_modules/lucide-react-native/dist/cjs/icons',name+'.js'),'utf8'),c);const nodes=Array.isArray(c.module.exports)?c.module.exports:c.exports.default;return '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+nodes.map(([tag,a])=>'<'+tag+' '+Object.entries(a).filter(([k])=>k!=='key').map(([k,v])=>k+'="'+esc(v)+'"').join(' ')+'/>').join('')+'</svg>';}
const fragments={
  'koli-listesi':`<div class="list-summary">${f.boxes.length} koli</div><div class="readable-rows">${f.boxes.map(b=>{const [customer,...rest]=b.SipExp.split(' • ');return `<article class="readable-box"><div class="row-top"><h2 class="mono">${esc(b.PackageNo)}</h2>${icon('chevron-right')}</div><p class="customer-name">${esc(customer)}</p><p class="shipment-note">${esc(rest.join(' • '))}</p><dl class="box-facts"><div><dt>Sipariş</dt><dd class="mono">${esc(b.ReceiptNo)}</dd></div><div><dt>Depo</dt><dd>${esc(b.Explanation)}</dd></div></dl></article>`;}).join('')}</div><p class="end-note">Tüm koliler yüklendi</p>`,
  'koli-detay':`<div class="list-summary">${f.items.length} ürün kalemi</div><div class="readable-rows">${f.items.map(i=>`<article class="readable-item"><h2>${esc(i['h1_Ürün'])}</h2><div class="item-facts"><dl class="variant-facts"><div><dt>Renk</dt><dd>${esc(i.sh_Renk)}</dd></div><div><dt>Beden</dt><dd>${esc(i.sh_Beden)}</dd></div></dl><div class="readable-quantity"><span>Miktar</span><div><strong>${i.h2_Miktar.toFixed(2)}</strong><span>${esc(i.sh_Birim)}</span></div></div></div><p class="stock-code"><span>Stok kodu</span><strong class="mono">${esc(i.sh_Stok)}</strong></p></article>`).join('')}</div>`
};
const css=fs.readFileSync(path.join(from,'tokens.css'),'utf8')+`
/* Revision 03 — text roles optimized for the 390px operational profile. */
:root{--read-title:20px;--read-product:20px;--read-body:16px;--read-meta:14px;--read-quantity:24px;--read-leading:1.55;--read-muted:#c6bfce;--read-divider:#514b59;--read-gap:20px}
:root[data-app-theme="light"]{--read-muted:#554d60;--read-divider:#bdb6c6}
.readable .search input{font-size:var(--read-body)}
.readable .search{min-height:var(--s14)}
.readable .list-summary{font-size:var(--read-meta);font-weight:500;color:var(--read-muted);padding:var(--s2) var(--s5) var(--s3)}
.readable .end-note{font-size:var(--read-meta);color:var(--read-muted)}
.readable .action{font-size:var(--read-body)}
.readable-rows{border-top:var(--hairline) solid var(--read-divider)}
.readable-box,.readable-item{padding:var(--s5);border-bottom:var(--hairline) solid var(--read-divider);line-height:var(--read-leading);overflow-wrap:anywhere}
.readable-box:nth-child(odd),.readable-item:nth-child(odd){background:var(--surface)}
.readable-box h2{font-size:var(--read-title);font-weight:650;line-height:1.4}
.readable-box .row-top>.icon{color:var(--accent)}
.customer-name{font-size:var(--read-body);font-weight:550;margin-top:var(--s3);line-height:var(--read-leading)}
.shipment-note{font-size:var(--read-meta);color:var(--read-muted);margin-top:var(--s1)}
.box-facts{display:grid;gap:var(--s2);margin-top:var(--s4)}
.box-facts>div{display:grid;grid-template-columns:var(--s16) minmax(0,1fr);gap:var(--s2)}
.box-facts dt{font-size:var(--read-meta);color:var(--read-muted)}
.box-facts dd{font-size:var(--read-meta);font-weight:500;min-width:0}
.readable-item h2{font-size:var(--read-product);line-height:1.5;font-weight:650;max-width:100%}
.item-facts{display:flex;align-items:center;justify-content:space-between;gap:var(--s4);margin-top:var(--s4)}
.variant-facts{display:flex;flex-wrap:wrap;gap:var(--s4);min-width:0;flex:1}
.variant-facts dt{font-size:var(--read-meta);color:var(--read-muted);margin-bottom:var(--s1)}
.variant-facts dd{font-size:var(--read-body);font-weight:550}
.readable-quantity{color:var(--success);background:var(--success-soft);border-radius:var(--r1);padding:var(--s2) var(--s3);flex-shrink:0}
.readable-quantity>span{font-size:var(--read-meta);font-weight:500}
.readable-quantity>div{display:flex;align-items:baseline;gap:var(--s2)}
.readable-quantity strong{font-family:var(--font-mono);font-size:var(--read-quantity);font-weight:600;line-height:1.3}
.readable-quantity>div>span{font-size:var(--read-meta)}
.stock-code{display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s4);font-size:var(--read-meta)}
.stock-code>span{color:var(--read-muted)}
.stock-code strong{font-weight:500}
.readable .detail-context{padding:var(--s3) var(--s5)}
.context-main{display:flex;align-items:center;gap:var(--s3);justify-content:space-between}
.context-main>div{min-width:0;flex:1}
.context-main .order-link{font-size:var(--read-body);font-weight:600;justify-content:flex-start;gap:var(--s2);color:var(--ink)}
.context-main .order-link .icon{color:var(--accent);width:var(--s5);height:var(--s5)}
.readable .detail-context>p{font-size:var(--read-meta);line-height:1.5;color:var(--read-muted);margin-top:var(--s1)}
.readable .text-action{font-size:var(--read-meta);gap:var(--s2);flex-shrink:0}
.readable .detail-controls .segment-item{font-size:var(--read-meta);font-weight:600}
.readable .detail-footer .action{font-size:var(--read-meta);min-height:var(--s12)}
`;
for(const dir of [to,light]){fs.mkdirSync(path.join(dir,'screens'),{recursive:true});fs.writeFileSync(path.join(dir,'tokens.css'),css);}
for(const slug of Object.keys(fragments)){
  let html=fs.readFileSync(path.join(from,'screens',slug+'.html'),'utf8');
  html=html.replace('class="app"','class="app readable"').replace(/<div class="scroll\s*">[\s\S]*?<\/div><footer/,`<div class="scroll">${fragments[slug]}</div><footer`);
  if(!html.includes(fragments[slug]))throw new Error('Liste yapısı eşleşmedi: '+slug);
  if(slug==='koli-detay')html=html.replace(/<div class="detail-context">[\s\S]*?<div class="detail-controls">/,`<div class="detail-context"><div class="context-main"><div><span class="order-link" role="img" aria-label="Sipariş ${esc(f.boxes[0].ReceiptNo)}; siparişteki koliler"><strong class="mono">${esc(f.boxes[0].ReceiptNo)}</strong>${icon('chevron-right')}</span></div><span class="text-action">${icon('package-plus')}Yeni Koli</span></div><p>${esc(f.boxes[0].SipExp)}</p></div><div class="detail-controls">`);
  fs.writeFileSync(path.join(to,'screens',slug+'.html'),html);
  fs.writeFileSync(path.join(light,'screens',slug+'.html'),html.replace('<html lang="tr">','<html lang="tr" data-app-theme="light">').replace('name="color-scheme" content="dark"','name="color-scheme" content="light"'));
}
const old=JSON.parse(fs.readFileSync(path.join(from,'meta.json'),'utf8'));
const meta={...old,id,revision:3,previous,label:'Impeccable · Koli ekranlarında okunabilirlik',note:'Üçüncü öneri: yalnız koli listesi ve koli detayında daha büyük yazılar, belirgin satırlar ve ayrı miktar alanı. Ana koda uygulanmadı.',skill:'impeccable / typeset / operate',screenNotes:{
 'koli-listesi':['Koli numarası 15 → 20 px, müşteri adı 14 → 16 px, sipariş/depo bilgileri 12–13 → 14 px oldu.','Müşteri, sevkiyat notu, sipariş ve depo ayrı satırlarda; dönüşümlü yüzeyler kayıt sınırını belirginleştiriyor.','Aynı yedi kayıt korunuyor; daha rahat okuma için ekranda daha az kayıt görünüyor.'],
 'koli-detay':['Ürün adı 15 → 20 px ve tam satır; miktar 20 → 24 px, ayrı yeşil alanda.','Renk ve beden değerleri 16 px; etiketler ve stok kodu 14 px.','Sipariş başlığı kısaltıldı; ürünlere daha fazla dikey alan ayrıldı. Dört alt işlem korundu.']
}};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'Üçüncü önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Okunabilirlik önerisi: iki ekran, iki tema.');
