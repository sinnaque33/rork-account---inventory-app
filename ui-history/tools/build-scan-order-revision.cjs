// Fifth revision: barcode screen back to the shipped centred layout with light fixes, plus a light pass on order selection.
// No application edits. `--replace` regenerates only this revision's generated files while it is pending approval.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),root=path.dirname(base),previous='2026-10-22-impeccable-v4',id='2026-10-22-impeccable-v5';
const from=path.join(base,'experiments',previous),to=path.join(base,'experiments',id),light=path.join(base,'previews',id+'-light');
if(fs.existsSync(to)||fs.existsSync(light)){
  const meta=fs.existsSync(path.join(to,'meta.json'))&&JSON.parse(fs.readFileSync(path.join(to,'meta.json'),'utf8'));
  if(!process.argv.includes('--replace')||meta&&meta.status!=='pending_approval')throw new Error('Revizyon zaten var; üzerine yazılmaz.');
  // DESIGN.md and validation.json are written by hand after review; keep them.
  for(const dir of [to,light])for(const item of ['screens','tokens.css','meta.json'])fs.rmSync(path.join(dir,item),{recursive:true,force:true});
}
const f=JSON.parse(fs.readFileSync(path.join(base,'fixtures.json'),'utf8'));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function icon(name,cls=''){const c={exports:{},module:{exports:{}},require:()=>((_name,nodes)=>nodes)};vm.runInNewContext(fs.readFileSync(path.join(root,'node_modules/lucide-react-native/dist/cjs/icons',name+'.js'),'utf8'),c);const nodes=Array.isArray(c.module.exports)?c.module.exports:c.exports.default;return '<svg class="icon'+(cls?' '+cls:'')+'" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+nodes.map(([tag,a])=>'<'+tag+' '+Object.entries(a).filter(([k])=>k!=='key').map(([k,v])=>k+'="'+esc(v)+'"').join(' ')+'/>').join('')+'</svg>';}
const sample=fs.readFileSync(path.join(from,'screens/koli-listesi.html'),'utf8');
const status=sample.slice(sample.indexOf('<div class="system-status">'),sample.indexOf('<main'));
const tool=(name,label,cls='')=>`<span class="tool${cls?' '+cls:''}" role="img" aria-label="${esc(label)}">${icon(name)}</span>`;
const page=(title,source,bodyClass,body)=>`<!doctype html>\n<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=390, initial-scale=1"><meta name="color-scheme" content="dark"><title>${title} · Impeccable önerisi</title><link rel="stylesheet" href="../tokens.css"></head><body class="${bodyClass}"><!-- Onay bekleyen statik tasarım önerisi. Kaynak: ${source}. Sabit veri: ui-history/fixtures.json. -->${status}<main class="app v4" aria-label="${title}">${body}</main><div class="system-bottom" aria-hidden="true"></div></body></html>`;
const order=f.orders.find(o=>o.ReceiptNo===f.boxes[0].ReceiptNo);

const orderCard=o=>`<article class="v4-card v5-order"><span class="v4-tile koli">${icon('file-text')}</span><div><h2 class="mono">${esc(o.ReceiptNo)}</h2><p>${esc(o.CurrentAccountName)}</p></div>${icon('chevron-right')}</article>`;
const screens={
  'barcode-scanner':['Barkod Okutma','app/(app)/barcode-scanner.tsx','v5-scan-body',`<header class="v5-scan-head"><span class="v5-round" role="img" aria-label="Kapat">${icon('x')}</span><h1>Barkod Okutun</h1><span class="v5-round home" role="img" aria-label="Ana sayfa">${icon('house')}</span></header><div class="scroll v5-scan"><div class="v5-scan-body-inner"><span class="v5-scan-ring">${icon('scan-barcode')}</span><h2>Siparişten Koli Aç</h2><p class="v5-chip" role="img" aria-label="Sipariş fişi ${esc(order.ReceiptNo)}">${icon('file-text')}<span class="mono">${esc(order.ReceiptNo)}</span></p><p class="v5-customer">${esc(order.CurrentAccountName)}</p><div class="v5-field"><label>İlk ürünü okutun</label><div class="v5-barcode"><input aria-label="Ürün barkodu" readonly tabindex="-1" value="${esc(f.barcode)}"></div></div><div class="v4-btn v5-send">Gönder</div></div></div>`],
  'order-receipts':['Sipariş Seçimi','app/(app)/order-receipts.tsx','v4-body',`<header class="header">${tool('arrow-left','Geri')}<h1>Sipariş Seçimi</h1></header><div class="v4-top"><div class="v4-search">${icon('search')}<input readonly tabindex="-1" aria-label="Sipariş No veya Cari Ara..." placeholder="Sipariş No veya Cari Ara..."></div></div><div class="scroll"><div class="v4-list"><article class="v4-card v5-alt"><span class="v4-tile v5-alt-tile">${icon('package-plus')}</span><div><h2>Sipariş bağlantısı yapılmayacak</h2><p>Siparişten bağımsız koli oluştur</p></div>${icon('chevron-right')}</article><p class="v4-count"><strong>${f.orders.length}</strong> sipariş</p>${f.orders.map(orderCard).join('')}</div></div>`]
};

const css=fs.readFileSync(path.join(from,'tokens.css'),'utf8')+`
/* Revision 05 — barcode screen in the shipped centred layout; order selection in the box-card language. */
:root{--v5-scan-red:#f23643;--v5-ring-line:#6b2a33;--v5-alt-line:#6b2a33;--v5-ring:120px;--v5-ring-icon:60px;--v5-input:64px}
:root[data-app-theme="light"]{--v5-scan-red:#da2128;--v5-ring-line:#f3b9c1;--v5-alt-line:#f3b9c1}
.v5-scan-body{background:var(--canvas)}
.v5-scan-body .system-status{padding:var(--s1) var(--s5);background:var(--surface)}
.v5-scan-head{display:grid;grid-template-columns:var(--s11) minmax(0,1fr) var(--s11);align-items:center;gap:var(--s3);padding:var(--s2) var(--s5) var(--s4);background:var(--surface);border-bottom:var(--hairline) solid var(--v4-card-line)}
.v5-scan-head h1{text-align:center;font-size:var(--heading)}
.v5-round{width:var(--s11);height:var(--s11);display:grid;place-items:center;border-radius:50%;background:var(--raised)}
.v5-round.home{background:var(--v4-koli-tile);color:var(--v5-scan-red)}
.v5-scan{display:flex;flex-direction:column}
.v5-scan-body-inner{margin:auto 0;display:flex;flex-direction:column;align-items:center;padding:var(--s6);text-align:center}
.v5-scan-ring{width:var(--v5-ring);height:var(--v5-ring);display:grid;place-items:center;margin-bottom:var(--s6);border-radius:50%;background:var(--v4-koli-tile);box-shadow:inset 0 0 0 var(--hairline) var(--v5-ring-line);color:var(--v5-scan-red)}
.v5-scan-ring .icon{width:var(--v5-ring-icon);height:var(--v5-ring-icon);stroke-width:1.6}
.v5-scan-body-inner h2{font-size:var(--title);font-weight:700;line-height:1.3;letter-spacing:-.02em}
.v5-chip{display:inline-flex;align-items:center;gap:var(--s2);margin-top:var(--s3);padding:var(--s1) var(--s3);border-radius:var(--pill);background:var(--v4-koli-tile);font-size:var(--label);font-weight:600}
.v5-chip .icon{width:var(--s4);height:var(--s4);color:var(--v5-scan-red)}
.v5-customer{font-size:var(--read-body);font-weight:550;line-height:1.45;margin-top:var(--s2)}
.v5-field{width:100%;display:flex;flex-direction:column;gap:var(--s2);margin-top:var(--s8)}
.v5-field label{font-size:var(--read-meta);font-weight:600;color:var(--read-muted)}
.v5-barcode{display:flex;align-items:center;min-height:var(--v5-input);padding:0 var(--s4);border-radius:var(--r2);background:var(--raised);border:var(--hairline) solid var(--control-line)}
.v5-barcode input{text-align:center;font-family:var(--font-mono);font-size:var(--v4-scan);font-weight:500;letter-spacing:.08em}
.v5-send{width:100%;margin-top:var(--s4);min-height:var(--s14);font-size:var(--read-body);background:var(--v4-koli);color:var(--v4-on-color)}
.v5-order,.v5-alt{display:grid;grid-template-columns:var(--v4-tile) minmax(0,1fr) var(--s5);gap:var(--s3);align-items:center;padding:var(--s4)}
.v5-order h2{font-size:var(--read-title);font-weight:650;line-height:1.3}
.v5-order p{font-size:var(--read-body);font-weight:450;line-height:1.45;margin-top:var(--s1)}
.v5-order>.icon{width:var(--s5);height:var(--s5);color:var(--subtle)}
.v5-alt{background:var(--v4-koli-tile);border-color:var(--v5-alt-line);margin-bottom:var(--s2)}
.v5-alt-tile{background:var(--v4-koli);color:var(--v4-on-color)}
.v5-alt h2{font-size:var(--read-body);font-weight:650;line-height:1.35}
.v5-alt p{font-size:var(--read-meta);line-height:1.45;color:var(--read-muted);margin-top:var(--s1)}
.v5-alt>.icon{width:var(--s5);height:var(--s5);color:var(--v4-koli-ink)}
`;
for(const dir of [to,light]){fs.mkdirSync(path.join(dir,'screens'),{recursive:true});fs.writeFileSync(path.join(dir,'tokens.css'),css);}
for(const [slug,[title,source,bodyClass,body]] of Object.entries(screens)){
  const html=page(title,source,bodyClass,body);
  if(/undefined|\[object Object\]/.test(html))throw new Error('Eksik veri: '+slug);
  fs.writeFileSync(path.join(to,'screens',slug+'.html'),html);
  fs.writeFileSync(path.join(light,'screens',slug+'.html'),html.replace('<html lang="tr">','<html lang="tr" data-app-theme="light">').replace('name="color-scheme" content="dark"','name="color-scheme" content="light"'));
}
const old=JSON.parse(fs.readFileSync(path.join(from,'meta.json'),'utf8'));
const meta={...old,id,date:'2026-10-22',revision:5,previous,status:'pending_approval',label:'Impeccable · Barkod ve sipariş seçiminde hafif iyileştirme',note:'Beşinci öneri: barkod okutma kaynak uygulamadaki ortalanmış düzene döndü ve yalnız hafif iyileştirildi; sipariş seçimi koli kartlarıyla aynı dile getirildi. Ana koda uygulanmadı.',skill:'impeccable / polish / operate',screenNotes:{
 'barcode-scanner':['Kaynak düzen korundu: ortadaki tarama dairesi, başlık, ortalanmış barkod alanı ve kırmızı Gönder.','Sipariş no fiş etiketinde, cari adı ayrı satırda; “İlk ürünü okutun” talimatı barkod alanının hemen üstünde.','Barkod büyük ve sabit genişlikli yazıyla; alan orijinaldeki gibi sade. Tarama dairesi kırmızı tonlu; ana sayfa düğmesi tonlu, böylece tek dolu kırmızı düğme Gönder.'],
 'order-receipts':['Kaynak yapı korundu: arama, siparişsiz koli seçeneği ve sipariş kartları.','Sipariş no 17 → 20 px sabit genişlikli, cari adı 13 → 16 px ana renkte; kartlar koli listesiyle aynı dilde.','Siparişsiz koli seçeneği kırmızı tonlu kartta ve koli ikonuyla; sipariş listesinden “6 sipariş” sayacıyla ayrılır.']
}};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'Beşinci önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Barkod ve sipariş seçimi önerisi: iki ekran, iki tema.');
