// Node built-ins only. Reads snapshots; writes only ui-history/manifest.js.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..');
const ctx = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(base,'manifest.js'),'utf8'),ctx,{timeout:1000});
const screens = ctx.window.UI_HISTORY.screens;
const slugs = new Set(screens.map(s=>s.slug));
function lightPreview(id){
  const dir=path.join(base,'previews',id);
  if(!fs.existsSync(path.join(dir,'meta.json')))return undefined;
  const files=fs.readdirSync(path.join(dir,'screens')).filter(f=>f.endsWith('.html')).map(f=>f.slice(0,-5)).sort();
  if(files.some(s=>!slugs.has(s))||!fs.existsSync(path.join(dir,'tokens.css')))throw new Error('Açık tema önizlemesi geçersiz: '+id);
  return {id,files};
}
const versions = fs.readdirSync(path.join(base,'versions'),{withFileTypes:true})
  .filter(e=>e.isDirectory()&&/^\d{4}-\d{2}-\d{2}$/.test(e.name))
  .map(e=>{
    const dir=path.join(base,'versions',e.name);
    const meta=JSON.parse(fs.readFileSync(path.join(dir,'meta.json'),'utf8'));
    if(meta.date!==e.name||!meta.appVersion||!meta.gitCommit||typeof meta.note!=='string'||!Array.isArray(meta.changedScreens))throw new Error('Geçersiz meta: '+e.name);
    const files=fs.readdirSync(path.join(dir,'screens')).filter(f=>f.endsWith('.html')).map(f=>f.slice(0,-5)).sort();
    if(files.some(s=>!slugs.has(s)))throw new Error('Yeni ekranı önce manifest.screens listesine ekleyin: '+e.name);
    if(meta.changedScreens.some(s=>!files.includes(s)))throw new Error('Değişti denilen ekranın HTML dosyası yok: '+e.name);
    if(files.length&&!fs.existsSync(path.join(dir,'tokens.css')))throw new Error('tokens.css eksik: '+e.name);
    return {...meta,files,lightPreview:lightPreview('archive-'+e.name+'-light')};
  }).sort((a,b)=>a.date.localeCompare(b.date));
const experiments=fs.readdirSync(path.join(base,'experiments'),{withFileTypes:true})
  .filter(e=>e.isDirectory()&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.name)&&fs.existsSync(path.join(base,'experiments',e.name,'meta.json')))
  .map(e=>{
    const dir=path.join(base,'experiments',e.name),meta=JSON.parse(fs.readFileSync(path.join(dir,'meta.json'),'utf8'));
    if(meta.id!==e.name||!versions.some(v=>v.date===meta.basedOn)||!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)||!['pending_approval','approved','rejected'].includes(meta.status))throw new Error('Geçersiz öneri: '+e.name);
    const files=fs.readdirSync(path.join(dir,'screens')).filter(f=>f.endsWith('.html')).map(f=>f.slice(0,-5)).sort();
    if(files.some(s=>!slugs.has(s))||!fs.existsSync(path.join(dir,'tokens.css')))throw new Error('Öneri ekran/token envanteri geçersiz: '+e.name);
    return {...meta,files,lightPreview:lightPreview(e.name+'-light')};
  }).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
fs.writeFileSync(path.join(base,'manifest.js'),'/* Dosya envanteri tools/update-manifest.cjs ile güncellenir; fetch kullanılmaz. */\nwindow.UI_HISTORY = '+JSON.stringify({screens,versions,experiments},null,2)+';\n');
console.log(versions.length+' versiyon, '+screens.length+' ekran: manifest.js güncellendi.');
