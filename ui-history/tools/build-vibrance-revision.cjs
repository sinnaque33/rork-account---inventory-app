// Fourth revision: box list, box detail, waybill and barcode screens in the shipped theme's flow colours.
// No application edits. `--replace` regenerates only this revision's generated files while it is pending approval.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),root=path.dirname(base),previous='2026-10-16-impeccable-v3',id='2026-10-22-impeccable-v4';
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
// Extreme chevron from the dashboard watermark (app/(app)/dashboard.tsx), drawn in currentColor.
const mark='<svg class="v4-mark" aria-hidden="true" viewBox="0 0 95 100"><path d="M0,0 L28,0 L50,50 L28,100 L0,100 L22,50 Z" fill="currentColor"/><path d="M40,0 L68,0 L90,50 L68,100 L40,100 L62,50 Z" fill="currentColor"/></svg>';
const sample=fs.readFileSync(path.join(from,'screens/koli-listesi.html'),'utf8');
const status=sample.slice(sample.indexOf('<div class="system-status">'),sample.indexOf('<main'));
const tool=(name,label,cls='')=>`<span class="tool${cls?' '+cls:''}" role="img" aria-label="${esc(label)}">${icon(name)}</span>`;
const page=(title,source,body)=>`<!doctype html>\n<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=390, initial-scale=1"><meta name="color-scheme" content="dark"><title>${title} · Impeccable önerisi</title><link rel="stylesheet" href="../tokens.css"></head><body class="v4-body"><!-- Onay bekleyen statik tasarım önerisi. Kaynak: ${source}. Sabit veri: ui-history/fixtures.json. -->${status}<main class="app v4" aria-label="${title}">${body}</main><div class="system-bottom" aria-hidden="true"></div></body></html>`;
const split=v=>{const [lead,...rest]=String(v).split(' • ');return [lead,rest.join(' • ')];};
const order=f.orders.find(o=>o.ReceiptNo===f.boxes[0].ReceiptNo),selected=new Set(['KL-001249','KL-001251']);

const boxCard=b=>{const [customer,note]=split(b.SipExp);return `<article class="v4-card v4-box"><div class="v4-box-head"><span class="v4-tile koli">${icon('package')}</span><div><h2 class="mono">${esc(b.PackageNo)}</h2><p class="v4-customer">${esc(customer)}</p><p class="v4-note">${esc(note)}</p></div>${icon('chevron-right')}</div><dl class="v4-facts"><div><dt>${icon('receipt-text')}Sipariş</dt><dd class="mono">${esc(b.ReceiptNo)}</dd></div><div><dt>${icon('warehouse')}Depo</dt><dd>${esc(b.Explanation)}</dd></div></dl></article>`;};
const itemCard=i=>`<article class="v4-card v4-item"><div class="v4-item-head"><span class="v4-tile koli">${icon('package')}</span><div><h2>${esc(i['h1_Ürün'])}</h2><p class="v4-sku"><span>Stok kodu</span><strong class="mono">${esc(i.sh_Stok)}</strong></p></div></div><div class="v4-item-foot"><dl class="v4-variant"><div><dt>Renk</dt><dd>${esc(i.sh_Renk)}</dd></div><div><dt>Beden</dt><dd>${esc(i.sh_Beden)}</dd></div></dl><div class="v4-qty"><span>Miktar</span><div><strong>${i.h2_Miktar.toFixed(2)}</strong><span>${esc(i.sh_Birim)}</span></div></div></div></article>`;
const selectCard=b=>{const on=selected.has(b.PackageNo),open=b.Status===0;return `<article class="v4-card v4-select${on?' on':''}"><span class="v4-check" role="img" aria-label="${on?'Seçili':'Seçili değil'}">${on?icon('check'):''}</span><h2 class="mono">${esc(b.PackageNo)}</h2><span class="v4-status ${open?'open':'closed'}">${open?'Açık':'Kapalı'}</span></article>`;};

const screens={
  'koli-listesi':['Koli Listesi','app/(app)/koli-listesi.tsx',`<header class="header">${tool('arrow-left','Geri')}<h1>Koli Listesi</h1></header><div class="v4-top"><div class="v4-search">${icon('search')}<input readonly tabindex="-1" aria-label="Koli ara, Enter&#39;a bas..." placeholder="Koli ara, Enter&#39;a bas..."></div></div><div class="scroll"><div class="v4-list"><p class="v4-count"><strong>${f.boxes.length}</strong> koli</p>${f.boxes.map(boxCard).join('')}<p class="v4-end">Tüm koliler yüklendi</p></div></div><footer class="v4-footer pair"><div class="v4-btn quiet tall">${icon('scan-barcode','i-koli')}<span>Barkod</span></div><div class="v4-btn koli tall">${icon('plus')}<span>Yeni Koli</span></div></footer>`],
  'koli-detay':['Koli Detayı','app/(app)/koli-detay.tsx',`<header class="header">${tool('arrow-left','Geri')}<h1 class="mono">${esc(f.boxes[0].PackageNo)}</h1>${tool('trash-2','Koli sil','danger')}</header><section class="v4-order" aria-label="Sipariş bağlamı"><span class="v4-order-no" role="img" aria-label="Sipariş ${esc(f.boxes[0].ReceiptNo)}; siparişteki koliler"><strong class="mono">${esc(f.boxes[0].ReceiptNo)}</strong>${icon('chevron-right')}</span><span class="v4-new-box">${icon('package-plus')}Yeni Koli</span><span class="v4-order-note">${esc(f.boxes[0].SipExp)}</span></section><div class="v4-controls"><div class="v4-segment" role="img" aria-label="Tarama modu: Malzeme Ekle seçili"><span class="on">${icon('plus')}Malzeme Ekle</span><span class="del">${icon('trash-2')}Malzeme Sil</span></div><div class="v4-scan-input">${icon('scan-barcode')}<input readonly tabindex="-1" aria-label="Eklenecek barkod" placeholder="Eklenecek barkodu okutun..."></div></div><div class="scroll"><div class="v4-list"><p class="v4-count"><strong>${f.items.length}</strong> ürün kalemi</p>${f.items.map(itemCard).join('')}</div></div><footer class="v4-footer quad"><div class="v4-btn quiet">${icon('printer')}<span>Yazdır</span></div><div class="v4-btn quiet">${icon('file-text','i-irs')}<span>İrsaliye Oluştur</span></div><div class="v4-btn quiet">${icon('lock-open','i-open')}<span>Koli Açma</span></div><div class="v4-btn ok">${icon('lock')}<span>Koli Kapatma</span></div></footer>`],
  'irskoli-listesi':['İrsaliye Oluştur','app/(app)/irskoli-listesi.tsx',`<header class="header">${tool('arrow-left','Geri')}<h1>${selected.size} Koli Seçildi</h1>${tool('x','Seçimi temizle')}</header><div class="v4-top"><p class="v4-hint">${icon('truck')}İrsaliye için kolileri seçin.</p><div class="v4-search">${icon('search')}<input readonly tabindex="-1" aria-label="Koli No ile ara..." placeholder="Koli No ile ara..."></div></div><div class="scroll"><div class="v4-list">${f.boxes.map(selectCard).join('')}</div></div><footer class="v4-footer one"><div class="v4-btn irs tall">${icon('truck')}<span>Seçilenleri İrsaliye Yap (${selected.size})</span></div></footer>`],
  'barcode-scanner':['Barkod Okutma','app/(app)/barcode-scanner.tsx',`<header class="header">${tool('x','Kapat')}<h1>Barkod Okutun</h1>${tool('house','Ana sayfa')}</header><div class="scroll"><div class="v4-scan-page"><section class="v4-hero"><div class="v4-hero-top"><span class="v4-hero-tile">${icon('package-plus')}</span><div><h2>Siparişten koli aç</h2><p>İlk ürünün barkodunu okutun veya yazın.</p></div></div><dl><div><dt>Sipariş No</dt><dd class="mono">${esc(order.ReceiptNo)}</dd></div><div><dt>Cari</dt><dd>${esc(order.CurrentAccountName)}</dd></div></dl>${mark}</section><div class="v4-field"><label>Ürün barkodu</label><div class="v4-scan-input big">${icon('scan-barcode')}<input aria-label="Ürün barkodu" readonly tabindex="-1" value="${esc(f.barcode)}"></div></div><div class="v4-btn ok tall">${icon('arrow-right')}<span>Gönder</span></div></div></div>`]
};

const css=fs.readFileSync(path.join(from,'tokens.css'),'utf8')+`
/* Revision 04 — the shipped theme's own flow colours: koli red, irsaliye indigo, green completion, amber open. */
:root{
 --v4-page:#0c0b0d;--v4-card:#1b191e;--v4-card-line:#36323c;--v4-band:#141317;--v4-band-line:#2b2830;
 --v4-koli:#cc2434;--v4-koli-deep:#8e1016;--v4-koli-tile:#3b1a20;--v4-koli-ink:#ff8f98;--v4-on-koli-soft:#ffe9eb;
 --v4-irs:#5250e0;--v4-irs-tile:#23224d;--v4-irs-ink:#b6b2ff;
 --v4-ok:#15834e;--v4-ok-tile:#123224;--v4-ok-ink:#6fdca5;
 --v4-open-tile:#372b14;--v4-open-ink:#f4c46c;
 --v4-on-color:#ffffff;--v4-veil:color-mix(in srgb,#ffffff 18%,transparent);--v4-veil-line:color-mix(in srgb,#ffffff 26%,transparent);
 --v4-glow-koli:0 6px 24px color-mix(in srgb,#da2128 35%,transparent);--v4-card-shadow:none;
 --v4-code:18px;--v4-scan:22px;--v4-tile:44px;--v4-check:24px;--v4-check-radius:7px;--v4-dot:8px;--v4-r-card:14px;--v4-r-hero:18px;
 --v4-mark:220px;--v4-mark-x:-44px;--v4-mark-y:-56px;--v4-mark-alpha:.12;
}
:root[data-app-theme="light"]{
 --v4-page:#f2f1f4;--v4-card:#ffffff;--v4-card-line:#e2dfe6;--v4-band:#f7f6f9;--v4-band-line:#ebe8ee;
 --v4-koli:#c62132;--v4-koli-tile:#fce7ea;--v4-koli-ink:#b51c2c;
 --v4-irs:#4b48d4;--v4-irs-tile:#eceafe;--v4-irs-ink:#3d39a8;
 --v4-ok:#147b48;--v4-ok-tile:#e1f4e9;--v4-ok-ink:#11663e;
 --v4-open-tile:#fbf0d8;--v4-open-ink:#7a520a;
 --v4-card-shadow:0 1px 2px color-mix(in srgb,#1c1921 8%,transparent),0 3px 10px color-mix(in srgb,#1c1921 5%,transparent);
}
.v4-body{background:var(--v4-page)}
.v4 .header{border-bottom-color:var(--v4-card-line)}
.v4 .header h1.mono{font-family:var(--font-mono);font-weight:600}
.v4-top{display:flex;flex-direction:column;gap:var(--s3);padding:var(--s3) var(--s4)}
.v4-hint{display:flex;align-items:center;gap:var(--s2);font-size:var(--read-meta);color:var(--read-muted)}
.v4-hint .icon{width:var(--s5);height:var(--s5);color:var(--v4-irs-ink)}
.v4-search{display:flex;align-items:center;gap:var(--s3);min-height:var(--s12);padding:0 var(--s5);border-radius:var(--pill);background:var(--v4-card);border:var(--hairline) solid var(--control-line);box-shadow:var(--v4-card-shadow)}
.v4-search>.icon{width:var(--s5);height:var(--s5);color:var(--muted)}
.v4-search input{font-size:var(--read-body);padding:var(--s3) 0}
.v4-list{display:flex;flex-direction:column;gap:var(--s3);padding:var(--s1) var(--s4) var(--s6)}
.v4-count{font-size:var(--read-meta);font-weight:500;color:var(--read-muted);padding:0 var(--s1)}
.v4-count strong{color:var(--ink);font-weight:650}
.v4-end{text-align:center;font-size:var(--read-meta);color:var(--read-muted);padding:var(--s2) 0}
.v4-card{background:var(--v4-card);border:var(--hairline) solid var(--v4-card-line);border-radius:var(--v4-r-card);box-shadow:var(--v4-card-shadow);overflow:hidden;overflow-wrap:anywhere}
.v4-tile{width:var(--v4-tile);height:var(--v4-tile);display:grid;place-items:center;flex-shrink:0;border-radius:var(--r2)}
.v4-tile .icon{width:var(--s6);height:var(--s6)}
.v4-tile.koli{background:var(--v4-koli-tile);color:var(--v4-koli-ink)}
.i-koli{color:var(--v4-koli-ink)}.i-irs{color:var(--v4-irs-ink)}.i-open{color:var(--v4-open-ink)}
.v4-box-head{display:grid;grid-template-columns:var(--v4-tile) minmax(0,1fr) var(--s5);gap:var(--s3);align-items:start;padding:var(--s4)}
.v4-box-head h2{font-size:var(--read-title);font-weight:650;line-height:1.3}
.v4-box-head>.icon{width:var(--s5);height:var(--s5);margin-top:var(--s1);color:var(--subtle)}
.v4-customer{font-size:var(--read-body);font-weight:550;line-height:1.45;margin-top:var(--s2)}
.v4-note{font-size:var(--read-meta);line-height:1.45;color:var(--read-muted)}
.v4-facts{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:var(--s4);padding:var(--s3) var(--s4);background:var(--v4-band);border-top:var(--hairline) solid var(--v4-band-line)}
.v4-facts dt{display:flex;align-items:center;gap:var(--s1);font-size:var(--read-meta);color:var(--read-muted)}
.v4-facts dt .icon{width:var(--s4);height:var(--s4)}
.v4-facts dd{font-size:var(--read-meta);font-weight:550;line-height:1.45;margin-top:var(--s1)}
.v4-order{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;column-gap:var(--s3);row-gap:var(--s1);margin:var(--s3) var(--s4) 0;padding:var(--s3) var(--s3) var(--s3) var(--s4);border-radius:var(--v4-r-hero);color:var(--v4-on-color);background:var(--v4-koli) linear-gradient(120deg,var(--v4-koli) 15%,var(--v4-koli-deep))}
.v4-order-no{display:flex;align-items:center;gap:var(--s1);min-width:0;font-size:var(--v4-code)}
.v4-order-no strong{font-weight:650}
.v4-order-no .icon{width:var(--s5);height:var(--s5)}
.v4-order-note{grid-column:1/-1;font-size:var(--read-meta);line-height:1.45;color:var(--v4-on-koli-soft)}
.v4-new-box{display:flex;align-items:center;gap:var(--s2);min-height:var(--s11);padding:0 var(--s4);border-radius:var(--pill);background:var(--v4-on-color);color:var(--v4-koli);font-size:var(--read-meta);font-weight:650;flex-shrink:0}
.v4-new-box .icon{width:var(--s5);height:var(--s5)}
.v4-mark{position:absolute;z-index:-1;width:auto;height:var(--v4-mark);right:var(--v4-mark-x);bottom:var(--v4-mark-y);color:var(--v4-on-color);opacity:var(--v4-mark-alpha);pointer-events:none}
.v4-controls{display:flex;flex-direction:column;gap:var(--s3);padding:var(--s3) var(--s4) var(--s2)}
.v4-segment{display:grid;grid-template-columns:1fr 1fr;gap:var(--s1);padding:var(--s1);border-radius:var(--r3);background:var(--v4-card);border:var(--hairline) solid var(--v4-card-line);box-shadow:var(--v4-card-shadow)}
.v4-segment>span{display:flex;align-items:center;justify-content:center;gap:var(--s2);min-height:var(--s11);border-radius:var(--r2);font-size:var(--read-meta);font-weight:600;color:var(--muted)}
.v4-segment .icon{width:var(--s5);height:var(--s5)}
.v4-segment .on{background:var(--v4-ok);color:var(--v4-on-color)}
.v4-segment .del .icon{color:var(--error)}
.v4-scan-input{display:flex;align-items:center;gap:var(--s3);min-height:var(--s14);padding:0 var(--s4);border-radius:var(--r2);background:var(--v4-card);border:var(--heavy) solid var(--v4-ok-ink);box-shadow:var(--v4-card-shadow)}
.v4-scan-input>.icon{width:var(--s6);height:var(--s6);color:var(--v4-ok-ink)}
.v4-scan-input input{font-size:var(--read-body);padding:var(--s4) 0}
.v4-scan-input.big input{font-family:var(--font-mono);font-size:var(--v4-scan);font-weight:500;letter-spacing:.06em}
.v4-item{padding:var(--s4)}
.v4-item-head{display:grid;grid-template-columns:var(--v4-tile) minmax(0,1fr);gap:var(--s3);align-items:start}
.v4-item h2{font-size:var(--read-product);font-weight:650;line-height:1.4}
.v4-sku{display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s1);font-size:var(--read-meta);line-height:1.45}
.v4-sku span{color:var(--read-muted)}
.v4-sku strong{font-weight:500}
.v4-item-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--s3);margin-top:var(--s3);padding-top:var(--s3);border-top:var(--hairline) solid var(--v4-band-line)}
.v4-variant{display:flex;gap:var(--s6);min-width:0}
.v4-variant dt{font-size:var(--read-meta);color:var(--read-muted)}
.v4-variant dd{font-size:var(--read-body);font-weight:600;line-height:1.45;margin-top:var(--s1)}
.v4-qty{display:flex;flex-direction:column;align-items:flex-end;padding:var(--s2) var(--s3);border-radius:var(--r2);background:var(--v4-ok-tile);color:var(--v4-ok-ink);flex-shrink:0}
.v4-qty>span{font-size:var(--read-meta);font-weight:500}
.v4-qty>div{display:flex;align-items:baseline;gap:var(--s2)}
.v4-qty strong{font-family:var(--font-mono);font-size:var(--read-quantity);font-weight:600;line-height:1.25}
.v4-qty>div>span{font-size:var(--read-meta);font-weight:500}
.v4-footer{display:grid;gap:var(--s2);padding:var(--s3) var(--s4);background:var(--v4-page);border-top:var(--hairline) solid var(--v4-card-line)}
.v4-footer.pair{grid-template-columns:1fr 1.35fr;gap:var(--s3)}
.v4-footer.quad{grid-template-columns:1fr 1fr}
.v4-btn{display:flex;align-items:center;justify-content:center;gap:var(--s2);min-height:var(--s12);padding:var(--s2) var(--s3);border-radius:var(--r2);font-size:var(--read-meta);font-weight:600;line-height:1.25;text-align:center}
.v4-btn .icon{width:var(--s5);height:var(--s5)}
.v4-btn.tall{min-height:var(--s14);font-size:var(--read-body)}
.v4-btn.quiet{background:var(--v4-card);border:var(--hairline) solid var(--v4-card-line);color:var(--ink);box-shadow:var(--v4-card-shadow)}
.v4-btn.koli{background:var(--v4-koli);color:var(--v4-on-color);box-shadow:var(--v4-glow-koli)}
.v4-btn.ok{background:var(--v4-ok);color:var(--v4-on-color)}
.v4-btn.irs{background:var(--v4-irs);color:var(--v4-on-color)}
.v4-select{display:flex;align-items:center;gap:var(--s4);min-height:var(--s16);padding:var(--s3) var(--s4)}
.v4-select h2{flex:1;min-width:0;font-size:var(--v4-code);font-weight:600}
.v4-check{width:var(--v4-check);height:var(--v4-check);display:grid;place-items:center;flex-shrink:0;border-radius:var(--v4-check-radius);border:var(--heavy) solid var(--control-line);color:var(--v4-on-color)}
.v4-check .icon{width:var(--s4);height:var(--s4);stroke-width:3}
.v4-select.on{background:var(--v4-irs-tile);border-color:var(--v4-irs-ink);box-shadow:inset 0 0 0 var(--hairline) var(--v4-irs-ink),var(--v4-card-shadow)}
.v4-select.on .v4-check{background:var(--v4-irs);border-color:var(--v4-irs)}
.v4-status{display:inline-flex;align-items:center;gap:var(--s2);padding:var(--s1) var(--s3);border-radius:var(--pill);font-size:var(--read-meta);font-weight:600;line-height:1.4;flex-shrink:0}
.v4-status:before{content:'';width:var(--v4-dot);height:var(--v4-dot);border-radius:50%;background:currentColor}
.v4-status.open{background:var(--v4-open-tile);color:var(--v4-open-ink)}
.v4-status.closed{background:var(--v4-ok-tile);color:var(--v4-ok-ink)}
.v4-scan-page{display:flex;flex-direction:column;gap:var(--s6);padding:var(--s4) var(--s4) var(--s8)}
.v4-hero{position:relative;isolation:isolate;overflow:hidden;padding:var(--s5);border-radius:var(--v4-r-hero);color:var(--v4-on-color);background:var(--v4-koli) linear-gradient(150deg,var(--v4-koli) 10%,var(--v4-koli-deep))}
.v4-hero-top{display:flex;align-items:center;gap:var(--s4)}
.v4-hero-tile{width:var(--s12);height:var(--s12);display:grid;place-items:center;flex-shrink:0;border-radius:var(--r2);background:var(--v4-veil)}
.v4-hero-tile .icon{width:var(--s6);height:var(--s6)}
.v4-hero h2{font-size:var(--heading);font-weight:700;line-height:1.25;letter-spacing:-.01em}
.v4-hero-top p{font-size:var(--read-meta);line-height:1.45;color:var(--v4-on-koli-soft);margin-top:var(--s1)}
.v4-hero dl{display:grid;gap:var(--s3);margin-top:var(--s5);padding-top:var(--s4);border-top:var(--hairline) solid var(--v4-veil-line)}
.v4-hero dt{font-size:var(--read-meta);color:var(--v4-on-koli-soft)}
.v4-hero dd{font-size:var(--read-body);font-weight:600;line-height:1.45;margin-top:var(--s1)}
.v4-hero dd.mono{font-size:var(--v4-code)}
.v4-field{display:flex;flex-direction:column;gap:var(--s2)}
.v4-field label{font-size:var(--read-meta);font-weight:600}
`;
for(const dir of [to,light]){fs.mkdirSync(path.join(dir,'screens'),{recursive:true});fs.writeFileSync(path.join(dir,'tokens.css'),css);}
for(const [slug,[title,source,body]] of Object.entries(screens)){
  const html=page(title,source,body);
  if(/undefined|\[object Object\]/.test(html))throw new Error('Eksik veri: '+slug);
  fs.writeFileSync(path.join(to,'screens',slug+'.html'),html);
  fs.writeFileSync(path.join(light,'screens',slug+'.html'),html.replace('<html lang="tr">','<html lang="tr" data-app-theme="light">').replace('name="color-scheme" content="dark"','name="color-scheme" content="light"'));
}
const old=JSON.parse(fs.readFileSync(path.join(from,'meta.json'),'utf8'));
const meta={...old,id,date:'2026-10-22',revision:4,previous,status:'pending_approval',label:'Impeccable · Ana temanın akış renkleri',note:'Dördüncü öneri: koli listesi, koli detayı, irsaliye oluşturma ve barkod okutma ekranlarında ana temanın kırmızı (koli), çivit (irsaliye), yeşil (tamamlama) ve amber (açık koli) renkleri anlamlı yerlere geri getirildi. Ana koda uygulanmadı.',skill:'impeccable / colorize + bolder / operate',screenNotes:{
 'koli-listesi':['Her koli ayrı bir kart: kırmızı koli ikonu, büyük koli numarası, müşteri ve sevkiyat notu.','Sipariş ve depo kartın alt şeridinde; sipariş numarası koli akışının kırmızısıyla vurgulanır.','Yeni Koli, ana temadaki tarama düğmesinin kırmızı ışımasını taşır; Barkod sakin ikincil düğme.'],
 'koli-detay':['Sipariş bağlamı Ana Sayfa kartlarıyla aynı kırmızı gradyan kartta; Extreme şevronu filigran olarak içinde.','Malzeme Ekle seçiliyken düğme ve barkod alanı yeşil; okutma alanı hazır göründüğü için ilk bakışta bulunur.','Ürünler ayrı kartlarda; miktar yeşil alanda. İrsaliye ikonu çivit, Koli Açma amber, Koli Kapatma yeşil.'],
 'irskoli-listesi':['İrsaliye akışı ana temadaki çivit rengini taşır: seçili koliler, onay kutuları ve alt işlem düğmesi.','Önizleme seçim modunda çizildi: iki kapalı koli seçili, başlık kaynak koddaki gibi “2 Koli Seçildi”. Kaynak arşiv seçimsizdir.','Açık/Kapalı durumu nokta ve metinli renkli rozetle; renk tek başına anlam taşımaz.'],
 'barcode-scanner':['Sipariş bağlamı, Ana Sayfa’daki Koli Listesi kartıyla aynı kırmızı gradyan kartta.','Sipariş no ve cari ayrı satırlarda; barkod alanı büyük sabit genişlikli yazı ve yeşil hazır çerçeveyle.','Gönder yeşil tamamlama düğmesi; Extreme şevronu kartın köşesinde marka filigranı.']
}};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'Dördüncü önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Akış renkleri önerisi: dört ekran, iki tema.');
