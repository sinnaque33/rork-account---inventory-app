// Eleventh revision (2026-10-27): Koli Detayı's v9 product card, refined. The user preferred cards over the v10 table
// (rejected). Same real data (fixtures-api.json, box id 8). The card keeps its tile and card language but drops the
// labelled foot: quantity moves to the top-right corner so every card's quantity sits on one vertical line, the barcode
// stays under the product code, colour becomes a small tag with the lot count next to it. Base page and tokens from v9.
// Only koli-detay and its three scan states. `--replace` regenerates this revision while it is pending approval.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),root=path.dirname(base),previous='2026-10-27-impeccable-v9',id='2026-10-27-impeccable-v11';
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

// A card: tile, product code (h1) with the barcode (h2) under it, then colour tag, lot count and any other sh_ field;
// quantity in the card's top-right corner. Fields the server adds later join the tag line as “Label value”.
const keyOf=(row,prefix)=>Object.keys(row).find(k=>k.startsWith(prefix));
const sentence=t=>t[0]+t.slice(1).toLocaleLowerCase('tr');
const num=v=>Number(String(v).replace(',','.'))||0;
const card=(r,{qty=r.sh_Miktar,just=false}={})=>{
  const h2=keyOf(r,'h2_'),extra=Object.keys(r).filter(k=>k.startsWith('sh_')&&!['sh_Renk','sh_Miktar','sh_Lot Adeti'].includes(k));
  const tags=(r.sh_Renk?'<span class="v11-tag">'+esc(r.sh_Renk)+'</span>':'')+(r['sh_Lot Adeti']!==undefined?'<span class="v11-lot"><strong class="mono">'+esc(r['sh_Lot Adeti'])+'</strong> lot</span>':'')+extra.map(k=>'<span class="v11-lot">'+esc(sentence(k.slice(3)))+' <strong>'+esc(r[k])+'</strong></span>').join('');
  return '<article class="v4-card v11-item'+(just?' v7-just':'')+'"><span class="v4-tile koli">'+icon('package')+'</span><div class="v11-what"><h2 class="mono">'+esc(r[keyOf(r,'h1_')])+'</h2>'+(h2?'<p class="mono v11-code" aria-label="'+esc(sentence(h2.slice(3)))+' '+esc(r[h2])+'">'+esc(r[h2])+'</p>':'')+(tags?'<p class="v11-tags">'+tags+'</p>':'')+'</div><div class="v11-qty"><span>Miktar</span><strong class="mono">'+esc(qty)+'</strong></div></article>';
};
const list=(items,{bump=-1}={})=>'<p class="v4-count"><strong>'+items.length+'</strong> ürün kalemi</p>'+items.map((r,i)=>card(r,i===bump?{qty:String(num(r.sh_Miktar)+1),just:true}:{})).join('');
const products=(html,opts)=>{const i=html.indexOf('<p class="v4-count">'),j=html.indexOf('</div></div><footer',i);if(i<0||j<0)throw new Error('Ürün listesi bulunamadı');return html.slice(0,i)+list(rows,opts)+html.slice(j);};

// Scan states, same language as v8/v9: bottom notice for success and error, sheet only for the over-limit question.
const scanned=esc(old.barcode),first=rows[0],added=String(num(first.sh_Miktar)+1);
const titled=(html,name)=>html.replace(/<title>([^<]*) · Impeccable önerisi<\/title>/,(_,t)=>'<title>'+t+' · '+name+' · Impeccable önerisi</title>');
const aboveFooter=(html,notice)=>replaceOnce(html,'<footer class="v4-footer quad">',notice+'<footer class="v4-footer quad">');
const overlay=(html,markup)=>replaceOnce(html,'<div class="system-bottom"',markup+'<div class="system-bottom"');
const okNotice=(title,message)=>'<div class="v7-toast" role="status"><span class="v7-toast-mark">'+icon('check')+'</span><div><strong>'+title+'</strong><p>'+message+'</p></div></div>';
const errNotice=reason=>'<div class="v7-toast v8-err" role="alert"><span class="v7-toast-mark">'+icon('x')+'</span><div><strong>Okutma başarısız</strong><p>'+reason+'</p><p class="v8-code">'+scanned+'</p></div><span class="v8-close" role="button" aria-label="Bildirimi kapat">'+icon('x')+'</span></div>';
const states=[
  ['okutma-basarili','Okutma başarılı',html=>aboveFooter(products(html,{bump:0}),okNotice('Ürün eklendi',esc(first['h1_Malzeme Adı'])+' · '+esc(first.sh_Renk)+' · Miktar '+added)),
    ['Bildirim altta, 2 sn. Eklenen ürünün kartı yeşil çerçeveli, miktarı yeni değeriyle (10 → '+added+').','Ses yok, dokunma gerekmez; yeni okutma eskisinin yerine geçer.','Silme modunda aynı bildirim “Ürün silindi” der.']],
  ['okutma-hatali','Okutma hatalı',html=>aboveFooter(replaceOnce(html,'<div class="v4-scan-input">','<div class="v4-scan-input v8-bad">').replace('placeholder="Eklenecek barkodu okutun..."','value="'+scanned+'"'),errNotice('Okutulan barkod sistemde bulunamadı.')),
    ['Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Liste değişmez.','Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; neden metni örnektir.','Bildirim sonraki okutmaya kadar kalır, × ile de kapanır.']],
  ['miktar-asimi','Miktar aşımı',html=>overlay(html,'<div class="v7-scrim"><section class="v7-sheet" role="alertdialog" aria-modal="true" aria-labelledby="limit-title" aria-describedby="limit-message"><span class="v7-warn-mark">'+icon('triangle-alert')+'</span><h2 id="limit-title">Miktar Aşımı</h2><p id="limit-message">Sipariş miktarı aşılıyor, devam etmek istiyor musunuz?</p><p class="v7-chip">'+esc(first.h2_Barkod)+'</p><div class="v7-sheet-actions"><span class="v4-btn quiet" role="button">Hayır</span><span class="v4-btn v7-warn" role="button">Evet</span></div></section></div>'),
    ['Karar gerektiği için okutmayı durduran tek durum: alttan pencere, uygulamadaki metin ve “Hayır / Evet”.','Okutulan barkod, listedeki T4121’in gerçek barkodu.','Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır.']]
];

const css=fs.readFileSync(path.join(base,'experiments',previous,'tokens.css'),'utf8')+`
/* Revision 11 — Koli Detayı product card, refined: quantity top-right on one vertical line, no labelled foot. */
.v11-item{display:grid;grid-template-columns:var(--v4-tile) minmax(0,1fr) auto;gap:var(--s3);align-items:start;padding:var(--s3) var(--s4)}
.v11-what{min-width:0}
.v11-what h2{font-size:var(--read-product);font-weight:650;line-height:1.3}
.v11-code{margin-top:var(--s1);font-size:var(--read-meta);line-height:1.45;letter-spacing:.04em;color:var(--read-muted)}
.v11-tags{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s2) var(--s3);margin-top:var(--s2)}
.v11-tag{display:inline-flex;align-items:center;min-height:var(--s6);padding:0 var(--s2);border-radius:var(--r1);background:var(--v4-band);box-shadow:inset 0 0 0 var(--hairline) var(--v4-band-line);font-size:var(--read-meta);font-weight:600;line-height:1.4}
.v11-lot{font-size:var(--read-meta);line-height:1.4;color:var(--read-muted)}
.v11-lot strong{color:var(--ink);font-weight:600}
.v11-qty{display:flex;flex-direction:column;align-items:flex-end;min-width:var(--s16)}
.v11-qty span{font-size:var(--read-meta);font-weight:500;color:var(--read-muted)}
.v11-qty strong{font-size:var(--read-quantity);font-weight:600;line-height:1.2;color:var(--v4-ok-ink)}
.v11-item.v7-just{background:var(--v4-ok-tile)}
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
const meta={id,date:'2026-10-27',revision:11,previous,status:'pending_approval',basedOn:prev.basedOn,label:'Impeccable · Koli Detayı ürün kartı',
  note:'On birinci öneri: Koli Detayı’nın v9 ürün kartı iyileştirildi (kullanıcı tabloyu değil kartı tercih etti). Miktar sağ üstte, kartlar yarı yükseklikte. Veri test sunucusunun koliDetay yanıtı. Ana koda uygulanmadı.',
  skill:'impeccable / layout',profile:prev.profile,
  screenNotes:{'koli-detay':[
    'v9 kartı korunur: karo, kart dili, renkler. Etiketli alt bölüm kaldırıldı; kart ~170 px’ten ~110 px’e indi, ekranda daha çok ürün görünür.',
    'Miktar kartın sağ üst köşesinde, büyük ve yeşil: kartlar arasında hep aynı dikey hizada, okutma sırasında göz tek çizgide iner.',
    'Barkod ürün kodunun altında; renk küçük bir etiket, yanında “2 lot”. Birim yanıtta yok, yazılmaz; sunucunun ekleyeceği yeni alanlar aynı satıra düşer.'
  ]},
  states:{'koli-detay':states.map(([state,name,,notes])=>({id:state,name,notes}))}};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'On birinci önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Koli Detayı ürün kartı: öneri 11 (1 ekran, 3 durum, iki tema).');
