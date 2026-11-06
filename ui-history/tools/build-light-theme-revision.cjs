// Thirteenth revision (2026-10-27): light theme colours only. The user: dark theme is fine, light theme hurts
// readability. Every screen is carried from its current proposal (v12: five screens and six states, v9: İrsaliye,
// v8: Giriş, Ayarlar, Koli Oluştur) onto v12's tokens plus light-only overrides; dark pages are unchanged apart from
// v12's font (codes in the sans), which now reaches the v8/v9 screens too. `--replace` regenerates while pending.
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..'),id='2026-10-27-impeccable-v13';
const v8='2026-10-23-impeccable-v8',v9='2026-10-27-impeccable-v9',v12='2026-10-27-impeccable-v12';
const to=path.join(base,'experiments',id),light=path.join(base,'previews',id+'-light');
if(fs.existsSync(to)||fs.existsSync(light)){
  const meta=fs.existsSync(path.join(to,'meta.json'))&&JSON.parse(fs.readFileSync(path.join(to,'meta.json'),'utf8'));
  if(!process.argv.includes('--replace')||meta&&meta.status!=='pending_approval')throw new Error('Revizyon zaten var; üzerine yazılmaz.');
  // DESIGN.md is written by hand after review; keep it.
  for(const dir of [to,light])for(const item of ['screens','states','tokens.css','meta.json'])fs.rmSync(path.join(dir,item),{recursive:true,force:true});
}
const source={login:v8,settings:v8,'create-koli':v8,'irskoli-listesi':v9,dashboard:v12,'koli-listesi':v12,'koli-detay':v12,'order-receipts':v12,'barcode-scanner':v12};

const css=fs.readFileSync(path.join(base,'experiments',v12,'tokens.css'),'utf8')+`
/* Revision 13 — light theme readability. One neutral page grey under white cards on every screen (before: white page
   with grey cards on some screens, grey page with white cards on others), neutral instead of violet-grey text, firmer
   lines, a real card shadow, a white notice instead of a grey slab. Dark theme untouched. */
:root[data-app-theme="light"]{
 --canvas:#eef0f3;--surface:#ffffff;--raised:#e4e7ec;--line:#d3d7de;--control-line:#7a808b;
 --ink:#14161b;--muted:#474d57;--subtle:#5a606b;--read-muted:#474d57;--read-divider:#c9ced6;
 --v4-page:#eef0f3;--v4-card:#ffffff;--v4-card-line:#d3d7de;--v4-band:#f5f6f8;--v4-band-line:#e2e5ea;
 --v4-koli-tile:#fde6e8;--v4-irs-tile:#e9e8fd;--v4-ok-tile:#dcf3e6;--v4-ok-ink:#0b6337;--v7-ok-ink:#0b6337;
 --v4-card-shadow:0 1px 2px rgba(20,22,27,.06),0 2px 6px rgba(20,22,27,.05);
 --v7-toast:#ffffff;--v7-toast-line:#d3d7de;--v7-ok-tile:#dcf3e6;
}
:root[data-app-theme="light"] .v4-card,:root[data-app-theme="light"] .destination{box-shadow:var(--v4-card-shadow)}
:root[data-app-theme="light"] .v4-card.v7-just,:root[data-app-theme="light"] .v4-card.v12-item.v7-just{box-shadow:inset 0 0 0 var(--hairline) var(--v4-ok),var(--v4-card-shadow)}
:root[data-app-theme="light"] .v7-toast{box-shadow:0 4px 16px rgba(20,22,27,.12),0 1px 3px rgba(20,22,27,.08)}
:root[data-app-theme="light"] .segment{background:var(--raised);border-color:transparent}
:root[data-app-theme="light"] .segment-item.selected{background:var(--surface);box-shadow:0 1px 2px rgba(20,22,27,.12),inset 0 0 0 var(--hairline) var(--line)}
:root[data-app-theme="light"] .header{background:var(--surface)}
/* Status bar continues the white header; the page grey starts below it. */
:root[data-app-theme="light"] body{background:linear-gradient(var(--surface) var(--status-height),var(--canvas) var(--status-height))}
/* Login keeps a white page: the logo artwork has a white ground and would sit in a box on grey. */
:root[data-app-theme="light"] body:has(main[aria-label="Giriş"]){background:var(--surface)}
:root[data-app-theme="light"] main[aria-label="Giriş"] .input-wrap{background:var(--canvas)}
`;
// The app no longer has the login footer (removed on the user's request, 2026-10-26).
const pageFix=(slug,html)=>slug!=='login'?html:html.replace(/<p class="login-foot">.*?<\/p>/,'');
const check=(html,what)=>{if(/undefined|\[object Object\]|NaN/.test(html))throw new Error('Eksik veri: '+what);return html;};
for(const [dir,src] of [[to,n=>path.join(base,'experiments',n)],[light,n=>path.join(base,'previews',n+'-light')]]){
  for(const sub of ['screens','states'])fs.mkdirSync(path.join(dir,sub),{recursive:true});
  fs.writeFileSync(path.join(dir,'tokens.css'),css);
  for(const [slug,from] of Object.entries(source))fs.writeFileSync(path.join(dir,'screens',slug+'.html'),check(pageFix(slug,fs.readFileSync(path.join(src(from),'screens',slug+'.html'),'utf8')),slug));
  for(const file of fs.readdirSync(path.join(src(v12),'states')))fs.writeFileSync(path.join(dir,'states',file),check(fs.readFileSync(path.join(src(v12),'states',file),'utf8'),file));
}
const metaOf=n=>JSON.parse(fs.readFileSync(path.join(base,'experiments',n,'meta.json'),'utf8'));
const metas={[v8]:metaOf(v8),[v9]:metaOf(v9),[v12]:metaOf(v12)};
const lightNote='Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.';
const meta={id,date:'2026-10-27',revision:13,previous:v12,status:'pending_approval',basedOn:metas[v12].basedOn,label:'Impeccable · Açık tema renkleri',
  note:'On üçüncü öneri: yalnız açık tema renkleri (kullanıcı: koyu tema iyi, açık temada okunabilirlik zayıf). Ekranlar güncel önerilerinden (v12, İrsaliye v9, Giriş/Ayarlar/Koli Oluştur v8) taşındı. Ana koda uygulanmadı.',
  skill:'impeccable / colorize',profile:metas[v12].profile,
  screenNotes:Object.fromEntries(Object.entries(source).map(([slug,from])=>[slug,[lightNote,...metas[from].screenNotes[slug]]])),
  states:metas[v12].states};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'On üçüncü önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Açık tema: öneri 13 (9 ekran, 6 durum, iki tema).');
