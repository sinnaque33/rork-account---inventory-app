// Sixth revision: the nine screens the viewer shows, each with the small fixes from the Impeccable critique of 2026-10-22.
// Sources stay untouched: v2 (login, settings, dashboard, create-koli), v4 (box list, box detail, irsaliye), v5 (barcode, order selection).
// No application edits. `--replace` regenerates only this revision's generated files while it is pending approval.
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..'),previous='2026-10-22-impeccable-v5',id='2026-10-22-impeccable-v6';
const to=path.join(base,'experiments',id),light=path.join(base,'previews',id+'-light');
if(fs.existsSync(to)||fs.existsSync(light)){
  const meta=fs.existsSync(path.join(to,'meta.json'))&&JSON.parse(fs.readFileSync(path.join(to,'meta.json'),'utf8'));
  if(!process.argv.includes('--replace')||meta&&meta.status!=='pending_approval')throw new Error('Revizyon zaten var; üzerine yazılmaz.');
  // DESIGN.md and validation.json are written by hand after review; keep them.
  for(const dir of [to,light])for(const item of ['screens','tokens.css','meta.json'])fs.rmSync(path.join(dir,item),{recursive:true,force:true});
}
const v2='2026-10-16-impeccable-v2',v4='2026-10-22-impeccable-v4';
const sources={login:v2,settings:v2,dashboard:v2,'create-koli':v2,'koli-listesi':v4,'koli-detay':v4,'irskoli-listesi':v4,'barcode-scanner':previous,'order-receipts':previous};
function replaceOnce(html,search,replacement){if(!html.includes(search))throw new Error('Beklenen yapı bulunamadı: '+search);if(html.indexOf(search)!==html.lastIndexOf(search))throw new Error('Birden fazla eşleşme: '+search);return html.replace(search,()=>replacement);}
// A global pattern that must match exactly `count` times.
function replaceCount(html,pattern,replacement,count){const found=(html.match(pattern)||[]).length;if(found!==count)throw new Error('Beklenen '+count+' eşleşme, bulunan '+found+': '+pattern);return html.replace(pattern,replacement);}
// The first inline icon after a marker, exactly as written in the source file.
function svgAfter(html,marker){const at=html.indexOf(marker);if(at<0)throw new Error('Beklenen yapı bulunamadı: '+marker);const start=html.indexOf('<svg',at);return html.slice(start,html.indexOf('</svg>',start)+6);}
const read=(proposal,slug)=>fs.readFileSync(path.join(base,'experiments',proposal,'screens',slug+'.html'),'utf8');
const chevron=svgAfter(read(v2,'create-koli'),'Siparişten malzeme ekleme</p></div>');
const receiptIcon=svgAfter(read(previous,'order-receipts'),'<span class="v4-tile koli">');
const receiptPaths=receiptIcon.slice(receiptIcon.indexOf('>')+1,-6);

// Icon-only header controls are buttons, not images.
const headerButtons=html=>replaceCount(html,/<span class="(tool[^"]*?) ?" role="img"/g,'<span class="$1" role="button"',(html.match(/<span class="tool[^"]*" role="img"/g)||[]).length||1);
// Each fix must match exactly in both the dark source and its light preview.
const fixes={
  login:html=>{
    html=replaceOnce(headerButtons(html),'<svg class="icon positive"','<svg class="icon remember-check"');
    const eye=svgAfter(html,'aria-label="Şifre" readonly tabindex="-1" value="••••••••">');
    return replaceOnce(html,eye,'<span class="tool reveal" role="button" aria-label="Şifreyi göster">'+eye+'</span>');
  },
  settings:html=>{
    html=headerButtons(html);
    // Connection fields back in the shipped order, with the API URL hint under its own field.
    const start=html.indexOf('<section class="form-section"><h2>Bağlantı ve depo</h2>'),end=html.indexOf('</section>',start)+10,part=html.slice(start,end);
    const field=label=>{const m=part.match(new RegExp('<div class="field"><label>'+label+'</label><div class="input-wrap[^"]*">[\\s\\S]*?</div></div>'));if(!m)throw new Error('Alan bulunamadı: '+label);return m[0];};
    const hint=part.match(/<p class="hint">API URL[^<]*<\/p>/)[0],api=field('API URL');
    const rebuilt='<section class="form-section"><h2>Bağlantı ve depo</h2>'+api.slice(0,-6)+hint+'</div><div class="form-grid">'+field('Şirket kodu')+field('Şirket şifresi')+'</div>'+field('Depo ID')+'</section>';
    if(start<0||rebuilt.length!==part.length)throw new Error('Bağlantı bölümü yeniden sıralanamadı.');
    html=html.slice(0,start)+rebuilt+html.slice(end);
    html=replaceCount(html,/<h3>([^<]+)<\/h3>(<p class="hint">[^<]*<\/p><\/div>)<span class="switch" role="img" aria-label="Kapalı"><\/span>/g,'<h3>$1</h3>$2<span class="switch" role="switch" aria-checked="false" aria-label="$1"></span>',3);
    html=replaceCount(html,/<label>([^<]+)<\/label><div class="segment">/g,'<label>$1</label><div class="segment" role="radiogroup" aria-label="$1">',3);
    html=replaceCount(html,/<div class="segment-item selected">/g,'<div class="segment-item selected" role="radio" aria-checked="true">',3);
    return replaceCount(html,/<div class="segment-item ?">/g,'<div class="segment-item" role="radio" aria-checked="false">',3);
  },
  dashboard:html=>{
    html=replaceOnce(headerButtons(html),'<span class="destination-icon positive">','<span class="destination-icon irs">');
    html=replaceOnce(html,'<h3 class="section-title">Hızlı erişim</h3>','<p class="section-title">Hızlı erişim</p>');
    return replaceCount(html,/<svg class="icon muted"[^>]*>[\s\S]*?<\/svg>/g,()=>chevron,2);
  },
  'create-koli':html=>{
    const cart=svgAfter(html,'<span class="destination-icon accent">');
    return replaceOnce(headerButtons(html),cart,cart.slice(0,cart.indexOf('>')+1)+receiptPaths+'</svg>');
  },
  'koli-listesi':html=>replaceOnce(headerButtons(html),'<svg class="icon i-koli"','<svg class="icon"'),
  'koli-detay':html=>{
    html=replaceOnce(headerButtons(html),'<span class="v4-order-no" role="img"','<span class="v4-order-no" role="link"');
    html=replaceOnce(html,'<span class="v4-new-box">','<span class="v4-new-box" role="button">');
    html=replaceOnce(html,'<div class="v4-segment" role="img" aria-label="Tarama modu: Malzeme Ekle seçili">','<div class="v4-segment" role="radiogroup" aria-label="Tarama modu">');
    html=replaceOnce(html,'<span class="on">','<span class="on" role="radio" aria-checked="true">');
    return replaceOnce(html,'<span class="del">','<span class="del" role="radio" aria-checked="false">');
  },
  'irskoli-listesi':html=>{
    html=replaceCount(headerButtons(html),/<article class="v4-card v4-select( on)?">/g,(_,on)=>'<article class="v4-card v4-select'+(on||'')+'" role="checkbox" aria-checked="'+Boolean(on)+'">',7);
    return replaceCount(html,/<span class="v4-check" role="img" aria-label="Seçili(?: değil)?">/g,'<span class="v4-check" aria-hidden="true">',7);
  },
  'barcode-scanner':html=>{
    html=replaceCount(html,/<span class="(v5-round[^"]*)" role="img"/g,'<span class="$1" role="button"',2);
    html=replaceOnce(html,'<label>İlk ürünü okutun</label>','<label for="scan-barcode">İlk ürünü okutun</label>');
    return replaceOnce(html,'<input aria-label="Ürün barkodu" ','<input id="scan-barcode" ');
  },
  'order-receipts':headerButtons
};

// v5 tokens already carry every v2–v5 rule; the v2 screens use none of the later prefixed classes, so they render as before.
const css=fs.readFileSync(path.join(base,'experiments',previous,'tokens.css'),'utf8')+`
/* Revision 06 — small fixes from the Impeccable critique; identity, copy and structure of each source proposal kept. */
/* Theme values instead of near-misses: red, deep red, indigo and error as in constants/theme.ts. Green stays darker for white text. */
:root{--primary:#da2128;--v4-koli:#da2128;--v4-koli-deep:#9e1318;--v4-irs:#5b5bf0;--error:#ff3340;--small:14px;--v4-check-radius:4px}
:root[data-app-theme="light"]{--primary:#da2128;--v4-koli:#da2128;--v4-irs:#3e3ec4;--error:#d32030;--v4-card-shadow:none}
/* Android touch targets: 48dp. */
.tool,.v5-round{width:var(--s12);height:var(--s12)}
.v5-scan-head{grid-template-columns:var(--s12) minmax(0,1fr) var(--s12)}
.segment-item,.v4-segment>span,.v4-new-box{min-height:var(--s12)}
.v4-order-no{align-self:stretch;min-height:var(--s12)}
.input-wrap>.reveal{margin-right:calc(-1*var(--s3))}
/* Koli tiles carry the brand red; delete is a bare error-red icon; irsaliye is indigo everywhere. */
.v4-tile.koli,.destination-icon.accent{background:var(--v4-koli-tile);color:var(--v5-scan-red)}
.destination-icon.irs{background:var(--v4-irs-tile);color:var(--v4-irs-ink)}
.tool.danger{background:none}
/* Green is kept for completion and the ready scan field; a quantity keeps only its green figure, as shipped. */
.v4-qty{background:var(--v4-band);box-shadow:inset 0 0 0 var(--hairline) var(--v4-band-line)}
.v4-qty>span,.v4-qty>div>span{color:var(--read-muted)}
.remember-check{color:var(--primary)}
.login-foot{font-size:var(--small)}
.login-foot .icon{color:var(--muted)}
.v4-order-note{color:var(--v4-on-color)}
/* Hierarchy. */
.form-section h2{font-size:var(--read-meta);font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:var(--read-muted)}
.greeting{padding:var(--s4) 0 var(--s8)}
.greeting h2{font-size:var(--title)}
.section-title{font-weight:600}
.page-lead{margin-bottom:var(--s6)}
.choice h3{font-size:var(--read-body);font-weight:650}
.v5-field label{font-size:var(--read-body);color:var(--ink)}
.v5-scan-ring{background:var(--raised);box-shadow:inset 0 0 0 var(--hairline) var(--line)}
.v5-alt{background:var(--v4-card);border-color:var(--v4-card-line)}
.v5-alt-tile{background:var(--v4-koli-tile);color:var(--v5-scan-red)}
.v5-alt>.icon{color:var(--subtle)}
.v5-order p{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
/* Density: more boxes and products per screen. */
.v4-box-head{padding:var(--s3) var(--s4)}
.v4-customer{margin-top:var(--s1)}
.v4-facts{padding:var(--s2) var(--s4)}
.v4-item{padding:var(--s3) var(--s4)}
.v4-item-foot{margin-top:var(--s2);padding-top:var(--s2)}
.v4-controls{gap:var(--s2)}
.v4-footer{padding:var(--s2) var(--s4)}
`;
for(const dir of [to,light]){fs.mkdirSync(path.join(dir,'screens'),{recursive:true});fs.writeFileSync(path.join(dir,'tokens.css'),css);}
for(const [slug,source] of Object.entries(sources)){
  for(const [dir,file] of [[to,path.join(base,'experiments',source,'screens',slug+'.html')],[light,path.join(base,'previews',source+'-light','screens',slug+'.html')]]){
    const html=fixes[slug](fs.readFileSync(file,'utf8'));
    if(/undefined|\[object Object\]/.test(html))throw new Error('Eksik veri: '+slug);
    fs.writeFileSync(path.join(dir,'screens',slug+'.html'),html);
  }
}
const old=JSON.parse(fs.readFileSync(path.join(base,'experiments',previous,'meta.json'),'utf8'));
const screenNotes={
  login:['Kaynak: v2 girişi; düzen ve metinler korundu.','“Beni hatırla” işareti orijinaldeki gibi marka kırmızısı, güvenlik kilidi nötr: yeşil yalnız tamamlama anlamında kalır.','Ayarlar ve şifre göster düğmeleri 48 px dokunma alanında; açıklama ve alt bilgi 14 px.'],
  settings:['Kaynak: v2 ayarları; bölümler, anahtarlar ve değerler korundu.','Bağlantı alanları orijinal sırada: API URL ve hemen altında açıklaması, Şirket kodu ile Şirket şifresi yan yana, en son Depo ID.','Bölüm başlıkları markanın büyük harfli etiket stilinde; segmentler 48 px, anahtarlar ayarın adıyla okunur.'],
  dashboard:['Kaynak: v2 Ana Sayfa; iki kartlı yapı korundu.','İrsaliye karosu çivit, Koli Listesi karosu kırmızı: sonraki ekranlardaki akış renkleriyle aynı.','Kartlarda › kullanıldı (↗ dış bağlantı gibi okunuyordu); kullanıcı adı 30 → 24 px. Gradyan kartlara dönüş kullanıcı kararına bırakıldı.'],
  'create-koli':['Kaynak: v2 Yeni Koli; tek seçenek korundu.','Sipariş seçeneği fiş ikonuyla, Sipariş Seçimi’ndeki gibi; karo koli kırmızısında.','Seçenek başlığı 16 px kalın, açıklaması 13 → 14 px: Sipariş Seçimi’ndeki siparişsiz koli seçeneğiyle aynı ölçüde.'],
  'koli-listesi':['Kaynak: v4 koli kartları; sipariş no nötr renkte, sipariş ve depo kartın alt şeridinde.','Kart iç boşlukları sıkılaştırıldı: ekranda daha çok koli görünür.','Yeni Koli tek kırmızı, ışımalı düğme; Barkod düğmesinin ikonu nötr.'],
  'koli-detay':['Kaynak: v4; sipariş bağlamı marka kırmızısı gradyan kartta, filigransız.','Miktar nötr zeminde yeşil sayıyla (orijinaldeki gibi); Koli sil ikonu zeminsiz ve tema hata kırmızısında, ürün karolarıyla karışmaz.','Kart ve alt çubuk boşlukları sıkılaştırıldı; sipariş bağlantısı, Yeni Koli ve mod düğmeleri 48 px.'],
  'irskoli-listesi':['Kaynak: v4; seçim modunda iki kapalı koli seçili, başlık kaynak koddaki gibi “2 Koli Seçildi”.','Çivit tema değerinde; onay kutusunun köşesi 4 px, satırlar onay kutusu olarak okunur.','Açık/Kapalı rozetleri renk, nokta ve kelimeyle; renk tek başına anlam taşımaz.'],
  'barcode-scanner':['Kaynak: v5; orijinal ortalanmış düzen korundu.','Tarama dairesi orijinaldeki gibi nötr gri, ikon kırmızı: dokunulacak bir düğme gibi durmaz.','“İlk ürünü okutun” 16 px ana renkte ve alanın etiketi; başlık düğmeleri 48 px.'],
  'order-receipts':['Kaynak: v5; arama, siparişsiz koli seçeneği ve sipariş kartları korundu.','Siparişsiz koli seçeneği sıradan kart görünümünde; uyarı şeridi gibi durmaz, koli ekleme ikonu ve alt satırıyla ayrışır.','Cari adı en fazla iki satır; kırmızı ikon tonu barkod ekranıyla aynı.']
};
const meta={...old,id,date:'2026-10-22',revision:6,previous,status:'pending_approval',label:'Impeccable · Kritik sonrası küçük düzeltmeler',note:'Altıncı öneri: görüntüleyicideki dokuz ekran Impeccable kritiğinden geçti ve yalnız küçük düzeltmeler yapıldı; kaynak önerilerin düzeni ve metinleri korundu. Kırmızı ve çivit tema değerlerinde. Ana koda uygulanmadı.',skill:'impeccable / critique + polish / operate',screenNotes};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'Altıncı önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Kritik düzeltmeleri: dokuz ekran, iki tema.');
