// Ninth revision and archive correction (2026-10-27): Koli Listesi drawn from the test server's real koliListesi response
// (fixtures-api.json). The real list has no Explanation (depot) and no status; SipExp is the order's description and may be
// empty; PackageNo is the order number plus the box's sequence ("00000151-022").
// 1. The 2026-10-15 archive and its light preview get the real cards, rendered the way the shipped card renders them
//    (user request: the depot line there was fixture data the app never shows).
// 2. A new proposal folder holds koli-listesi and koli-detay (with its scan states); the viewer keeps v8 for the rest.
// Koli Detayı uses the real koliDetay rows of box id 8 (h1_Malzeme Adı, h2_Barkod, sh_Renk, sh_Miktar, sh_Lot Adeti) under
// the list's first box: the log did not carry the package numbers of ids 6–8.
// `--replace` regenerates the proposal while it is pending approval. No application edits.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),root=path.dirname(base),previous='2026-10-23-impeccable-v8',id='2026-10-27-impeccable-v9';
const to=path.join(base,'experiments',id),light=path.join(base,'previews',id+'-light');
const api=JSON.parse(fs.readFileSync(path.join(base,'fixtures-api.json'),'utf8'));
const boxes=api.koliListesi.items,irsBoxes=api.irsKoliListesi.items,box=boxes[0],rows=api.koliDetay.items['8'],old=JSON.parse(fs.readFileSync(path.join(base,'fixtures.json'),'utf8'));
const keyOf=(row,prefix)=>Object.keys(row).find(k=>k.startsWith(prefix)),label=k=>k.replace(/^(h1|h2|sh)_/,'');
const sentence=t=>t[0]+t.slice(1).toLocaleLowerCase('tr');
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function icon(name,cls=''){const c={exports:{},module:{exports:{}},require:()=>((_name,nodes)=>nodes)};vm.runInNewContext(fs.readFileSync(path.join(root,'node_modules/lucide-react-native/dist/cjs/icons',name+'.js'),'utf8'),c);const nodes=Array.isArray(c.module.exports)?c.module.exports:c.exports.default;return '<svg class="icon'+(cls?' '+cls:'')+'" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+nodes.map(([tag,a])=>'<'+tag+' '+Object.entries(a).filter(([k])=>k!=='key').map(([k,v])=>k+'="'+esc(v)+'"').join(' ')+'/>').join('')+'</svg>';}
// Replaces the run of `count` sibling blocks that start with `open` and end right before `after`.
function replaceRun(html,open,after,make){const i=html.indexOf(open),j=html.indexOf(after,i);if(i<0||j<0)throw new Error('Beklenen yapı bulunamadı: '+open);return html.slice(0,i)+make(html.slice(i,html.indexOf(open,i+open.length)))+html.slice(j);}

// 1. Archive: the shipped card (koli-listesi.tsx @ 36edf72) shows Sipariş No and SipExp only when present, Explanation never here.
for(const file of ['versions/2026-10-15/screens/koli-listesi.html','previews/archive-2026-10-15-light/screens/koli-listesi.html']){
  const full=path.join(base,file);let html=fs.readFileSync(full,'utf8');
  html=replaceRun(html,'<div class="rn-view s-card">','<div class="rn-view s-footerLoader">',first=>{
    const tile=first.match(/<div class="rn-view s-iconContainer">[\s\S]*?<\/div>/)[0];
    return boxes.map(b=>'<div class="rn-view s-card"><div class="rn-view s-cardHeader">'+tile+'<div class="rn-view s-itemInfo"><span class="rn-text s-packageNo">'+esc(b.PackageNo)+'</span>'+(b.ReceiptNo?'<span class="rn-text s-receiptNo">Sipariş No: '+esc(b.ReceiptNo)+'</span>':'')+(b.SipExp?'<span class="rn-text s-sipExp">'+esc(b.SipExp)+'</span>':'')+'</div></div></div>').join('');
  });
  html=html.replace('fixture: ui-history/fixtures.json','fixture: ui-history/fixtures-api.json (test sunucusu)');
  fs.writeFileSync(full,html);
}
// Archive Koli Detayı, as KoliDetailRow renders a row: h1 is the title, the h2 field takes the quantity slot under its own
// label (a barcode stays unformatted), every sh_ field is a green label/value line.
for(const file of ['versions/2026-10-15/screens/koli-detay.html','previews/archive-2026-10-15-light/screens/koli-detay.html']){
  const full=path.join(base,file);let html=fs.readFileSync(full,'utf8');
  for(const [a,b] of [['Koli No: '+old.boxes[0].PackageNo,'Koli No: '+box.PackageNo],['>'+old.boxes[0].ReceiptNo+'<','>'+box.ReceiptNo+'<'],['>'+old.boxes[0].SipExp+'<','>'+box.SipExp+'<']]){if(!html.includes(a)&&!html.includes(b))throw new Error('Beklenen yapı bulunamadı: '+a);html=html.split(a).join(b);}
  html=replaceRun(html,'<div class="rn-view s-card">','</div></div><div class="rn-view s-buttonContainer"',first=>{
    const tile=first.match(/<div class="rn-view s-iconContainer">[\s\S]*?<\/div>/)[0],green='style="color:var(--color-success);font-weight:700"';
    return rows.map(row=>{const h2=keyOf(row,'h2_');return '<div class="rn-view s-card"><div class="rn-view s-cardContent">'+tile+'<div class="rn-view s-itemInfo"><span class="rn-text s-itemName clamp-many" data-lines="3">'+esc(row[keyOf(row,'h1_')])+'</span><div class="rn-view s-quantityContainer"><span class="rn-text s-quantityLabel">'+esc(label(h2))+': </span><span class="rn-text s-quantityValue">'+esc(row[h2])+'</span></div><div class="rn-view s-dynamicFieldsContainer">'+Object.keys(row).filter(k=>k.startsWith('sh_')).map(k=>'<div class="rn-view s-dynamicFieldRow"><span class="rn-text s-fieldLabel">'+esc(label(k))+':</span><span class="rn-text s-fieldValue clamp-one" '+green+'>'+esc(row[k])+'</span></div>').join('')+'</div></div></div></div>';}).join('');
  });
  fs.writeFileSync(full,html);
}

// Archive İrsaliye Oluştur: the shipped row shows PackageNo and, only when Status is present, a status line. The real
// irsKoliListesi has no Status, so each row is the number alone (ReceiptNo and SipExp arrive but are not drawn).
for(const file of ['versions/2026-10-15/screens/irskoli-listesi.html','previews/archive-2026-10-15-light/screens/irskoli-listesi.html']){
  const full=path.join(base,file);let html=fs.readFileSync(full,'utf8');
  html=replaceRun(html,'<div class="rn-view s-card">','</div></div></div></main>',first=>irsBoxes.map(b=>first.replace(/<span class="rn-text s-cardTitle">[^<]*<\/span>(<span class="rn-text s-cardSubtitle">[^<]*<\/span>)?/,'<span class="rn-text s-cardTitle">'+esc(b.PackageNo)+'</span>')).join(''));
  fs.writeFileSync(full,html);
}

// 2. Proposal.
if(fs.existsSync(to)||fs.existsSync(light)){
  const meta=fs.existsSync(path.join(to,'meta.json'))&&JSON.parse(fs.readFileSync(path.join(to,'meta.json'),'utf8'));
  if(!process.argv.includes('--replace')||meta&&meta.status!=='pending_approval')throw new Error('Revizyon zaten var; üzerine yazılmaz.');
  for(const dir of [to,light])for(const item of ['screens','states','tokens.css','meta.json'])fs.rmSync(path.join(dir,item),{recursive:true,force:true});
}
// The order number already opens the package number, so the card reads it once: muted order part, strong box sequence,
// then the order's description. No facts band: it only repeated the two halves of the number.
const card=b=>{
  const [order,seq]=b.PackageNo.includes('-')?[b.PackageNo.slice(0,b.PackageNo.lastIndexOf('-')),b.PackageNo.slice(b.PackageNo.lastIndexOf('-')+1)]:['',b.PackageNo];
  return '<article class="v4-card v4-box v9-box" role="button" aria-label="Koli '+esc(b.PackageNo)+'"><div class="v4-box-head"><span class="v4-tile koli">'+icon('package')+'</span><div><h2 class="mono v9-no">'+(order?'<span class="v9-order">'+esc(order)+'-</span>':'')+'<span class="v9-seq">'+esc(seq)+'</span></h2>'+(b.SipExp?'<p class="v9-exp">'+esc(b.SipExp)+'</p>':'')+'</div>'+icon('chevron-right')+'</div></article>';
};
// Koli Detayı proposal. The real row's quantity is sh_Miktar; the app shows it as a small green line while the barcode (h2)
// sits in the quantity slot. Here the quantity takes the quantity box, the barcode moves under the product code, and the
// other sh_ fields (Renk, Lot adeti) are the variant facts. Labels come from the field names, in sentence case.
const qtyKey=row=>Object.keys(row).find(k=>k==='sh_Miktar'),total=rows.length;
const itemCard=(row,qty=row.sh_Miktar)=>{const h2=keyOf(row,'h2_'),facts=Object.keys(row).filter(k=>k.startsWith('sh_')&&k!==qtyKey(row));
  return '<article class="v4-card v4-item"><div class="v4-item-head"><span class="v4-tile koli">'+icon('package')+'</span><div><h2 class="mono">'+esc(row[keyOf(row,'h1_')])+'</h2>'+(h2?'<p class="v4-sku"><span>'+esc(sentence(label(h2)))+'</span><strong class="mono">'+esc(row[h2])+'</strong></p>':'')+'</div></div>'+
    '<div class="v4-item-foot"><dl class="v4-variant">'+facts.map(k=>'<div><dt>'+esc(sentence(label(k)))+'</dt><dd>'+esc(row[k])+'</dd></div>').join('')+'</dl><div class="v4-qty"><span>Miktar</span><div><strong>'+esc(qty)+'</strong></div></div></div></article>';};
function detailPage(html){
  for(const [a,b] of [['<h1 class="mono">'+old.boxes[0].PackageNo+'</h1>','<h1 class="mono">'+box.PackageNo+'</h1>'],['Sipariş '+old.boxes[0].ReceiptNo+';','Sipariş '+box.ReceiptNo+';'],['<strong class="mono">'+old.boxes[0].ReceiptNo+'</strong>','<strong class="mono">'+box.ReceiptNo+'</strong>'],['<span class="v4-order-note">'+old.boxes[0].SipExp+'</span>','<span class="v4-order-note">'+esc(box.SipExp)+'</span>'],['<strong>'+old.items.length+'</strong> ürün kalemi','<strong>'+total+'</strong> ürün kalemi']]){if(html.split(a).length!==2)throw new Error('Beklenen yapı bulunamadı: '+a);html=html.replace(a,()=>b);}
  html=replaceRun(html,'<article class="v4-card v4-item">','</div></div><footer',()=>rows.map(row=>itemCard(row)).join(''));
  return html.replace('Sabit veri: ui-history/fixtures.json','Veri: ui-history/fixtures-api.json (test sunucusu)');
}
// Scan states on the real rows, same language as v8: bottom notice for success and error, sheet only for the over-limit question.
const scanned=esc(old.barcode),first=rows[0],added=String(Number(first.sh_Miktar)+1);
const titled=(html,name)=>html.replace(/<title>([^<]*) · Impeccable önerisi<\/title>/,(_,t)=>'<title>'+t+' · '+name+' · Impeccable önerisi</title>');
const aboveFooter=(html,notice)=>html.replace('<footer class="v4-footer quad">',()=>notice+'<footer class="v4-footer quad">');
const overlay=(html,markup)=>html.replace('<div class="system-bottom"',()=>markup+'<div class="system-bottom"');
const okNotice=(title,message)=>'<div class="v7-toast" role="status"><span class="v7-toast-mark">'+icon('check')+'</span><div><strong>'+title+'</strong><p>'+message+'</p></div></div>';
const errNotice=reason=>'<div class="v7-toast v8-err" role="alert"><span class="v7-toast-mark">'+icon('x')+'</span><div><strong>Okutma başarısız</strong><p>'+reason+'</p><p class="v8-code">'+scanned+'</p></div><span class="v8-close" role="button" aria-label="Bildirimi kapat">'+icon('x')+'</span></div>';
const firstCard=html=>{const i=html.indexOf('<article class="v4-card v4-item">'),j=html.indexOf('</article>',i)+10;return [html.slice(0,i),html.slice(i,j),html.slice(j)];};
const detailStates=[
  ['okutma-basarili','Okutma başarılı',html=>{const [a,,c]=firstCard(html);return aboveFooter(a+itemCard(first,added).replace('<article class="v4-card v4-item">','<article class="v4-card v4-item v7-just">')+c,okNotice('Ürün eklendi',esc(first['h1_Malzeme Adı'])+' · '+esc(first.sh_Renk)+' · Miktar '+added));},
    ['Bildirim altta, 2 sn; eklenen satır yeşil çerçeveli ve yeni miktarıyla (10 → '+added+'). Ses yok, dokunma gerekmez.','Bildirim ürün kodunu, rengi ve yeni miktarı söyler; yanıtta birim olmadığı için birim yazılmaz.','Yeni okutma eskisinin yerine geçer; silme modunda “Ürün silindi”.']],
  ['okutma-hatali','Okutma hatalı',html=>aboveFooter(html.replace('<div class="v4-scan-input">','<div class="v4-scan-input v8-bad">').replace('placeholder="Eklenecek barkodu okutun..."','value="'+scanned+'"'),errNotice('Okutulan barkod sistemde bulunamadı.')),
    ['Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Liste değişmez.','Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; neden metni örnektir.','Bildirim sonraki okutmaya kadar kalır, × ile de kapanır.']],
  ['miktar-asimi','Miktar aşımı',html=>overlay(html,'<div class="v7-scrim"><section class="v7-sheet" role="alertdialog" aria-modal="true" aria-labelledby="limit-title" aria-describedby="limit-message"><span class="v7-warn-mark">'+icon('triangle-alert')+'</span><h2 id="limit-title">Miktar Aşımı</h2><p id="limit-message">Sipariş miktarı aşılıyor, devam etmek istiyor musunuz?</p><p class="v7-chip">'+esc(first.h2_Barkod)+'</p><div class="v7-sheet-actions"><span class="v4-btn quiet" role="button">Hayır</span><span class="v4-btn v7-warn" role="button">Evet</span></div></section></div>'),
    ['Karar gerektiği için okutmayı durduran tek durum: alttan pencere, uygulamadaki metin ve “Hayır / Evet”.','Okutulan barkod, kolideki T4121’in gerçek barkodu.','Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır.']]
];
// İrsaliye Oluştur proposal. The service returns ReceiptNo and SipExp with each box, so boxes are grouped by order (first
// appearance keeps the service's newest-first order): a waybill is cut for an order, and mixed orders become visible.
// Status is not in the response, so there are no status badges and no disabled rows; the open-box rule needs that field.
const picked=new Set(['114','112']),split=no=>{const i=no.lastIndexOf('-');return i<0?['',no]:[no.slice(0,i+1),no.slice(i+1)];};
const groups=[];for(const b of irsBoxes){let g=groups.find(x=>x.no===b.ReceiptNo);if(!g)groups.push(g={no:b.ReceiptNo,exp:b.SipExp,boxes:[]});g.boxes.push(b);}
const irsRow=b=>{const on=picked.has(b.id),[order,seq]=split(b.PackageNo);return '<div class="v9-pick'+(on?' on':'')+'" role="checkbox" aria-checked="'+on+'" aria-label="Koli '+esc(b.PackageNo)+'"><span class="v4-check" aria-hidden="true">'+(on?icon('check'):'')+'</span><span class="mono v9-no">'+(order?'<span class="v9-order">'+esc(order)+'</span>':'')+'<span class="v9-seq">'+esc(seq)+'</span></span></div>';};
const irsGroup=g=>{const n=g.boxes.filter(b=>picked.has(b.id)).length;return '<section class="v4-card v9-group" aria-label="Sipariş '+esc(g.no)+'"><div class="v9-group-head"><div><h2 class="mono">'+esc(g.no)+'</h2>'+(g.exp?'<p>'+esc(g.exp)+'</p>':'')+'<p class="v9-group-count">'+g.boxes.length+' koli'+(n?' · <strong>'+n+' seçili</strong>':'')+'</p></div><span class="v9-all" role="button">Tümünü seç</span></div>'+g.boxes.map(irsRow).join('')+'</section>';};
function irsPage(html){
  html=replaceRun(html,'<article class="v4-card v4-select','</div></div><footer',()=>groups.map(irsGroup).join(''));
  return html.replace('Sabit veri: ui-history/fixtures.json','Veri: ui-history/fixtures-api.json (test sunucusu)');
}
const css=fs.readFileSync(path.join(base,'experiments',previous,'tokens.css'),'utf8')+`
/* Revision 09 — Koli Listesi on the test server's real data: no depot, no status, SipExp = order description (may be empty). */
.v9-no{font-size:var(--read-title);font-weight:650;line-height:1.3;letter-spacing:.01em}
.v9-order{color:var(--read-muted);font-weight:500}
.v9-seq{color:var(--ink)}
.v9-exp{margin-top:var(--s1);font-size:var(--read-meta);font-weight:550;line-height:1.45;letter-spacing:.02em;color:var(--read-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.v9-box .v4-box-head{align-items:center}
.v9-box .v4-box-head>.icon{margin-top:0}
/* İrsaliye Oluştur: one card per order, boxes as checkbox rows inside it. */
.v9-group-head{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--s3);padding:var(--s3) var(--s4);background:var(--v4-band);border-bottom:var(--hairline) solid var(--v4-band-line)}
.v9-group-head>div{min-width:0}
.v9-group-head h2{font-size:var(--read-body);font-weight:650;line-height:1.35}
.v9-group-head p{font-size:var(--read-meta);line-height:1.45;color:var(--read-muted);margin-top:var(--s1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.v9-group-head p.v9-group-count strong{color:var(--v4-irs-ink);font-weight:650}
.v9-all{display:flex;align-items:center;min-height:var(--s12);margin:calc(-1*var(--s2)) calc(-1*var(--s2)) calc(-1*var(--s2)) 0;padding:0 var(--s2);font-size:var(--read-meta);font-weight:650;color:var(--v4-irs-ink);white-space:nowrap;flex-shrink:0}
.v9-pick{display:flex;align-items:center;gap:var(--s4);min-height:var(--s14);padding:var(--s2) var(--s4)}
.v9-pick+.v9-pick{border-top:var(--hairline) solid var(--v4-band-line)}
.v9-pick .v9-no{font-size:var(--v4-code)}
.v9-pick.on{background:var(--v4-irs-tile)}
.v9-pick.on .v4-check{background:var(--v4-irs);border-color:var(--v4-irs)}
`;
for(const [dir,from] of [[to,path.join(base,'experiments',previous)],[light,path.join(base,'previews',previous+'-light')]]){
  fs.mkdirSync(path.join(dir,'screens'),{recursive:true});
  fs.writeFileSync(path.join(dir,'tokens.css'),css);
  let html=fs.readFileSync(path.join(from,'screens','koli-listesi.html'),'utf8');
  html=replaceRun(html,'<article class="v4-card v4-box">','<p class="v4-end">',()=>boxes.map(card).join(''));
  html=html.replace('Sabit veri: ui-history/fixtures.json','Veri: ui-history/fixtures-api.json (test sunucusu)');
  if(/undefined|\[object Object\]/.test(html))throw new Error('Eksik veri');
  fs.writeFileSync(path.join(dir,'screens','koli-listesi.html'),html);
  const detail=detailPage(fs.readFileSync(path.join(from,'screens','koli-detay.html'),'utf8'));
  fs.writeFileSync(path.join(dir,'screens','koli-detay.html'),detail);
  fs.mkdirSync(path.join(dir,'states'),{recursive:true});
  fs.writeFileSync(path.join(dir,'screens','irskoli-listesi.html'),irsPage(fs.readFileSync(path.join(from,'screens','irskoli-listesi.html'),'utf8')));
  for(const [state,name,make] of detailStates){const out=titled(make(detail),name);if(/undefined|\[object Object\]/.test(out))throw new Error('Eksik veri: '+state);fs.writeFileSync(path.join(dir,'states','koli-detay--'+state+'.html'),out);}
}
const prev=JSON.parse(fs.readFileSync(path.join(base,'experiments',previous,'meta.json'),'utf8'));
const meta={id,date:'2026-10-27',revision:9,previous,status:'pending_approval',basedOn:prev.basedOn,label:'Impeccable · Koli ekranları gerçek veriyle',
  note:'Dokuzuncu öneri: Koli Listesi, Koli Detayı ve İrsaliye Oluştur test sunucusunun gerçek yanıtlarıyla. Listede depo ve durum yok; SipExp siparişin açıklamasıdır. Detayda miktar, barkod ve lot adeti gerçek alanlardan. Diğer ekranlar v8’de. Ana koda uygulanmadı.',
  skill:'impeccable / refine',profile:prev.profile,
  screenNotes:{'koli-listesi':[
    'Veri: test sunucusunun koliListesi yanıtı (ilk sayfa, 7 koli). Depo (Explanation) ve açık/kapalı durumu bu yanıtta yok; kartlardan kaldırıldı.',
    'Koli no siparişin numarasıyla başlar (00000151-022): sipariş kısmı soluk, kolinin sırası koyu. Ayrı Sipariş No satırı ve alt şerit kaldırıldı; aynı numarayı tekrar ediyordu. Ekranda 7 kolinin 6’sı görünür.',
    'SipExp müşteri adı değil, siparişin açıklaması: en fazla iki satır. Boş gelen kolide satır hiç çizilmez, kart kısalır.'
  ],'koli-detay':[
    'Veri: test sunucusunun koliDetay yanıtı (id 8, iki ürün); başlık listedeki ilk koliden (00000151-022). Görsel, beden ve birim yanıtta yok.',
    'Asıl miktar (sh_Miktar) miktar kutusunda; uygulamada küçük yeşil satırdaydı, kutuda barkod duruyordu. Barkod ürün kodunun altında.',
    'Renk ve Lot adeti alt satırda; etiketler alan adlarından gelir. Durum seçicide: Okutma başarılı, Okutma hatalı, Miktar aşımı.'
  ],'irskoli-listesi':[
    'Veri: test sunucusunun irsKoliListesi yanıtı (ilk sayfa, 15 koli, 6 sipariş). Durum (açık/kapalı) yanıtta yok: rozetler ve pasif satırlar kaldırıldı.',
    'Koliler siparişe göre gruplu: başlıkta sipariş no, açıklama ve “5 koli · 2 seçili”. Sipariş sırası servisin sırası (en yeni önce). Farklı siparişlerin kolileri tek irsaliyede birleşirse bu artık görünür.',
    'Grup başlığında “Tümünü seç” (yeni davranış önerisi): bir siparişin bütün kolileri tek dokunuşla. Açık koli kuralı için servisin durum alanı göndermesi gerekir.'
  ]},
  states:{'koli-detay':detailStates.map(([state,name,,notes])=>({id:state,name,notes}))}};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'Dokuzuncu önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Koli Listesi, Koli Detayı, İrsaliye: arşiv düzeltildi, öneri 09 (3 ekran, 3 durum, iki tema).');
