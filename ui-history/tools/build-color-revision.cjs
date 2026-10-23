// A new proposal and offline light previews. Original snapshots stay immutable.
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..');
const previous='2026-10-16-impeccable-v1',id='2026-10-16-impeccable-v2';
const from=path.join(base,'experiments',previous),to=path.join(base,'experiments',id);
if(fs.existsSync(to))throw new Error('Revizyon zaten var; üzerine yazılmadı.');
fs.mkdirSync(path.join(to,'screens'),{recursive:true});
function replaceOnce(html,search,replacement){if(!html.includes(search))throw new Error('Beklenen yapı bulunamadı: '+search);return html.replace(search,replacement);}
const files=fs.readdirSync(path.join(from,'screens')).filter(f=>f.endsWith('.html'));
for(const file of files){
  let html=fs.readFileSync(path.join(from,'screens',file),'utf8');
  if(file==='login.html')html=replaceOnce(html,'class="icon accent"','class="icon positive"');
  if(file==='dashboard.html')html=replaceOnce(html,'destination-icon info','destination-icon positive');
  if(file==='settings.html'||file==='barcode-scanner.html')html=html.replace('class="action primary"','class="action confirm"');
  if(file==='koli-detay.html'){
    html=replaceOnce(html,'class="segment-item selected"','class="segment-item selected add-mode"');
    html=replaceOnce(html,'class="segment-item"','class="segment-item delete-mode"');
    html=replaceOnce(html,'class="action primary"','class="action confirm"');
  }
  fs.writeFileSync(path.join(to,'screens',file),html);
}
const css=fs.readFileSync(path.join(from,'tokens.css'),'utf8');
const additions=`
/* Revision 02: brand/action red; addition, save and completion green. */
:root{--success:#69d9a1;--success-soft:#123224;--confirm:#15834e;--on-confirm:#ffffff;--error:#ff8791;--error-soft:#382025;--scheme:dark}
:root[data-app-theme="light"]{
 --canvas:#ffffff;--surface:#f5f5f7;--raised:#eae8ed;--line:#d7d3dc;--control-line:#85808d;
 --ink:#1c1921;--muted:#5e5768;--subtle:#686170;--primary:#c62132;--on-primary:#ffffff;--accent:#b71d2c;--accent-soft:#fbe8eb;
 --success:#11663e;--success-soft:#e1f4e9;--confirm:#147b48;--on-confirm:#ffffff;--error:#b51f30;--error-soft:#fbe8ec;
 --warning:#79520a;--warning-soft:#faf0d9;--info:#4d43ab;--scheme:light;
}
html,body{color-scheme:var(--scheme)}
.positive{color:var(--success)}
.confirm{background:var(--confirm);border-color:var(--confirm);color:var(--on-confirm)}
.destination-icon.accent{background:var(--accent-soft)}
.destination-icon.positive{background:var(--success-soft)}
.danger{color:var(--error);background:var(--error-soft);border-radius:var(--r2)}
.detail-controls .add-mode.selected{color:var(--success);background:var(--success-soft);box-shadow:inset 0 0 0 var(--hairline) var(--success)}
.detail-controls .delete-mode{color:var(--error)}
.quantity strong{color:var(--success)}
.login-foot .icon{color:var(--success)}
.order-row>.icon{color:var(--accent)}
.status.closed{box-shadow:inset 0 0 0 var(--hairline) var(--success)}
`;
fs.writeFileSync(path.join(to,'tokens.css'),css+additions);
const meta=JSON.parse(fs.readFileSync(path.join(from,'meta.json'),'utf8'));
Object.assign(meta,{id,label:'Impeccable · Açık/koyu tema ve renk dengesi',revision:2,previous,status:'pending_approval',note:'İkinci AI önerisi: açık/koyu tema, kırmızı marka işlemleri ve yeşil ekleme/kaydetme/tamamlama vurguları. Ana koda uygulanmadı.'});
const extra={login:'Hatırla seçimi ve güvenlik ikonu yeşil; giriş düğmesi marka kırmızısı.',settings:'Kaydet yeşil onay eylemi olarak ayrıldı; açık tema seçimi önizlemeyle eşleşir.',dashboard:'Koli erişimi kırmızı, irsaliye oluşturma erişimi yeşil vurgu taşır.','koli-listesi':'Yeni Koli kırmızı ana eylem; barkod işlemi nötr kaldı.','koli-detay':'Ekleme modu ve miktarlar yeşil; silme kırmızı; koli kapatma yeşil tamamlanma eylemi.','create-koli':'Sipariş seçeneği yumuşak kırmızı ikon zeminiyle belirginleştirildi.','order-receipts':'Sipariş satırı yönlendirmeleri marka kırmızısıyla vurgulandı.','irskoli-listesi':'Kapalı durumun yeşil rozeti netleştirildi; seçimsiz işlem pasif kaldı.','barcode-scanner':'Gönder yeşil işlem düğmesi; sipariş bağlamında kırmızı vurgu korundu.'};
for(const slug of Object.keys(meta.screenNotes))meta.screenNotes[slug]=[extra[slug],'Açık ve koyu tema için ayrı, okunabilir renk paletleri hazırlandı.',...meta.screenNotes[slug].filter(n=>!n.includes('koli kapatma ana eylem'))];
meta.profile.themes=['dark','light'];
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');

function lightSettings(html,isArchive){
  html=html.replaceAll('class="segment-item "','class="segment-item"');
  const names=isArchive?['s-segmentOption s-segmentOptionActive','s-segmentText s-segmentTextActive','s-segmentOption','s-segmentText']:['segment-item selected',null,'segment-item',null];
  html=replaceOnce(html,names[0]+'"','TEMP-THEME-A"');
  if(names[1])html=replaceOnce(html,names[1]+'"','TEMP-THEME-B"');
  html=replaceOnce(html,names[2]+'"',names[0]+'"');
  if(names[1])html=replaceOnce(html,names[3]+'"',names[1]+'"');
  html=html.replace('TEMP-THEME-A',names[2]);if(names[1])html=html.replace('TEMP-THEME-B',names[3]);return html;
}
for(const [source,previewId,kind] of [[path.join(base,'versions/2026-10-15'),'archive-2026-10-15-light','archive'],[to,id+'-light','proposal']]){
  const dir=path.join(base,'previews',previewId);if(fs.existsSync(dir))throw new Error('Önizleme zaten var: '+previewId);
  fs.mkdirSync(path.join(dir,'screens'),{recursive:true});
  fs.copyFileSync(path.join(source,'tokens.css'),path.join(dir,'tokens.css'));
  for(const file of files){
    let html=fs.readFileSync(path.join(source,'screens',file),'utf8')
      .replace('<html lang="tr">','<html lang="tr" data-app-theme="light">')
      .replace('name="color-scheme" content="dark"','name="color-scheme" content="light"')
      .replaceAll('color-scheme:dark','color-scheme:light')
      .replace('extreme-logo-on-dark-v1.png','extreme-logo-on-light-v1.png');
    if(file==='settings.html')html=lightSettings(html,kind==='archive');
    fs.writeFileSync(path.join(dir,'screens',file),html);
  }
  fs.writeFileSync(path.join(dir,'meta.json'),JSON.stringify({id:previewId,theme:'light',source:kind==='archive'?'versions/2026-10-15':'experiments/'+id,note:'Kaynak tasarımın açık tema önizlemesi; yeni uygulama sürümü değildir.'},null,2)+'\n');
}
console.log('Revizyon 2: 9 koyu + 9 açık öneri; ilk arşiv için 9 açık tema önizlemesi.');
