const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(base,'manifest.js'),'utf8'),context,{timeout:1000});
const data=context.window.UI_HISTORY;
const viewer=fs.readFileSync(path.join(base,'viewer/index.html'),'utf8');
const inline=[...viewer.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const ctx={URLSearchParams};
vm.runInNewContext(inline.replace(/\n\s*initViewer\(\);\s*$/,''),ctx,{timeout:1000});
const versions=[{date:'2026-10-17',files:['settings'],changedScreens:['settings']},{date:'2026-10-15',files:['login','settings'],changedScreens:['login','settings']},{date:'2026-10-16',files:['login'],changedScreens:['login']}];
assert.equal(ctx.resolveScreen(versions,'login','2026-10-17').date,'2026-10-16');
assert.equal(ctx.resolveScreen(versions,'settings','2026-10-16').date,'2026-10-15');
assert.equal(ctx.resolveScreen(versions,'settings','2026-10-17').date,'2026-10-17');
assert.equal(ctx.resolveScreen(versions,'login','2026-10-14'),null);
assert.equal(ctx.resolveScreen(versions,'new-screen','2026-10-17'),null);
assert.equal(ctx.resolveScreen([{date:'2026-10-15',files:[],changedScreens:['login']}],'login','2026-10-15'),null,'Fiziksel files envanteri önceliklidir');
const catalog=[{slug:'login'},{slug:'settings'}];
for(const state of [{screen:'settings',a:'2026-10-15',b:'2026-10-17'},{screen:'login',a:'2026-10-15',b:'2026-10-15'},{screen:'login',a:null,b:'2026-10-15'},{screen:'login',a:null,b:null},{screen:'settings',a:'2026-10-15',b:null,variant:'okutma-hatali'}])assert.equal(JSON.stringify(ctx.parseSelection(ctx.selectionHash(state),catalog,versions)),JSON.stringify(state));
assert.equal(JSON.stringify(ctx.parseSelection('#screen=../bad&a=wrong&b=2099-10-15',catalog,versions)),JSON.stringify({screen:'login',a:null,b:null}));
assert.equal(JSON.stringify(ctx.parseSelection('#screen=login&durum=../states/x',catalog,versions)),JSON.stringify({screen:'login',a:null,b:null}),'Durum yalnız güvenli bir kısa ad olabilir');
assert(!/\bfetch\s*\(|XMLHttpRequest|https?:\/\/[^"']+\.(?:js|css)/.test(viewer));
assert(viewer.includes('width:390px;height:844px'));
assert(viewer.includes('transform-origin:top left'));
assert(viewer.includes('@media(max-width:740px)'));
let screenCount=0;
for(const version of data.versions){
  const dir=path.join(base,'versions',version.date);
  const meta=JSON.parse(fs.readFileSync(path.join(dir,'meta.json'),'utf8'));
  assert.equal(meta.date,version.date);
  assert(/^[a-f0-9]{40}$/.test(meta.gitCommit));
  const physical=fs.readdirSync(path.join(dir,'screens')).filter(f=>f.endsWith('.html')).map(f=>f.slice(0,-5)).sort();
  assert.equal(JSON.stringify([...version.files].sort()),JSON.stringify(physical));
  for(const slug of meta.changedScreens)assert(physical.includes(slug));
  const tokens=fs.readFileSync(path.join(dir,'tokens.css'),'utf8');
  const defined=new Set([...tokens.matchAll(/(--[\w-]+)\s*:/g)].map(m=>m[1]));
  for(const match of tokens.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g))assert(fs.existsSync(path.resolve(dir,match[1])),'Font eksik '+match[1]);
  for(const slug of physical){
    const file=path.join(dir,'screens',slug+'.html');const html=fs.readFileSync(file,'utf8');screenCount++;
    assert(html.startsWith('<!doctype html>'));
    assert(html.includes('href="../tokens.css"'));
    assert(!/<script\b|\bfetch\s*\(/i.test(html));
    assert(!/\b(?:src|href)=["'](?:https?:)?\/\//.test(html));
    assert(!/undefined|\[object Object\]/.test(html));
    for(const ref of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(ref[1].startsWith('#'))continue;assert(ref[1]==='../tokens.css'||ref[1].startsWith('../../../assets/'),'Geçersiz dış referans '+ref[1]);assert(fs.existsSync(path.resolve(path.dirname(file),ref[1])),'Asset eksik '+ref[1]);}
    for(const ref of html.matchAll(/var\((--[\w-]+)\)/g))assert(defined.has(ref[1]),slug+' eksik token '+ref[1]);
    const styles=[...html.matchAll(/<style>([\s\S]*?)<\/style>|style="([^"]*)"/g)].map(m=>m[1]||m[2]).join('\n');
    assert(!/#[a-f\d]{3,8}\b|rgba?\(/i.test(styles),slug+' sabit renk');
    assert(!/(?:padding|margin|gap|top|bottom|left|right)[\w-]*\s*:\s*-?[1-9][\d.]*px/i.test(styles),slug+' sabit spacing');
    assert(/viewBox="0 0 24 24"/.test(html),slug+' SVG ikon yok');
  }
}
console.log('PASS: '+screenCount+' HTML; yerel asset/font bağlantıları, CSS tokenları, meta/manifest envanteri.');
console.log('PASS: 6 geçmiş sürüm/dosya seçimi senaryosu; aynı/farklı tarih, boş slot ve hatalı hash kontrolleri.');
console.log('PASS: Viewer çevrimdışı bağımlılık, viewport/ölçek ve dar ekran kuralları.');
for(const experiment of data.experiments||[]){
  const dir=path.join(base,'experiments',experiment.id),css=fs.readFileSync(path.join(dir,'tokens.css'),'utf8');
  assert(data.versions.some(v=>v.date===experiment.basedOn),'Kaynak arşiv');
  const defined=new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m=>m[1]));
  for(const ref of css.matchAll(/var\((--[\w-]+)\)/g))assert(defined.has(ref[1]),'Eksik öneri tokenı '+ref[1]);
  for(const ref of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))assert(fs.existsSync(path.resolve(dir,ref[1])));
  for(const slug of experiment.files){
    const file=path.join(dir,'screens',slug+'.html'),html=fs.readFileSync(file,'utf8');
    assert(!/<script\b|\bstyle=|<style\b|undefined|\[object Object\]/i.test(html),'Öneri yalnız yerel CSS kullanır');
    assert(html.includes('href="../tokens.css"'));
    assert(experiment.screenNotes[slug]?.length,'Ekran notu eksik');
    for(const ref of html.matchAll(/(?:src|href)="([^"]+)"/g)){assert(ref[1]==='../tokens.css'||ref[1].startsWith('../../../assets/'));assert(fs.existsSync(path.resolve(path.dirname(file),ref[1])));}
  }
  // Screen states: states/<slug>--<state>.html, also in the light preview when the proposal has one.
  let stateCount=0;
  for(const [slug,list] of Object.entries(experiment.states||{})){
    assert(experiment.files.includes(slug),'Durumun ekranı yok: '+slug);
    for(const variant of list){
      assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(variant.id)&&variant.name&&variant.notes?.length,'Durum kaydı eksik: '+slug+'/'+variant.id);
      const folders=[[dir,false],...(experiment.lightPreview?[[path.join(base,'previews',experiment.lightPreview.id),true]]:[])];
      for(const [folder,light] of folders){
        const file=path.join(folder,'states',slug+'--'+variant.id+'.html'),html=fs.readFileSync(file,'utf8');
        assert(!/<script\b|\bstyle=|<style\b|undefined|\[object Object\]/i.test(html),'Durum yalnız yerel CSS kullanır');
        assert(html.includes('href="../tokens.css"')&&html.includes('data-app-theme="light"')===light);
        for(const ref of html.matchAll(/(?:src|href)="([^"]+)"/g)){assert(ref[1]==='../tokens.css'||ref[1].startsWith('../../../assets/'));assert(fs.existsSync(path.resolve(path.dirname(file),ref[1])));}
      }
      stateCount++;
    }
  }
  console.log('PASS: AI önerisi '+experiment.id+'; '+experiment.files.length+' ekran'+(stateCount?', '+stateCount+' durum':'')+', bağımsız tokenlar, yerel varlıklar, notlar.');
}
let previewCount=0;
for(const record of [...data.versions,...data.experiments||[]]){
  if(!record.lightPreview)continue;
  const {id,files}=record.lightPreview,dir=path.join(base,'previews',id);
  assert(/^[a-z0-9-]+$/.test(id));
  const meta=JSON.parse(fs.readFileSync(path.join(dir,'meta.json'),'utf8'));
  assert.equal(meta.theme,'light');
  const css=fs.readFileSync(path.join(dir,'tokens.css'),'utf8');
  assert(css.includes('data-app-theme="light"'));
  for(const ref of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))assert(fs.existsSync(path.resolve(dir,ref[1])));
  for(const slug of files){
    const file=path.join(dir,'screens',slug+'.html'),html=fs.readFileSync(file,'utf8');previewCount++;
    assert(html.includes('data-app-theme="light"'));
    assert(!/<script\b/i.test(html));
    for(const ref of html.matchAll(/(?:src|href)="([^"]+)"/g)){assert(ref[1]==='../tokens.css'||ref[1].startsWith('../../../assets/'));assert(fs.existsSync(path.resolve(path.dirname(file),ref[1])));}
  }
}
console.log('PASS: '+previewCount+' açık tema önizlemesi; scriptsiz HTML, yerel CSS/font/logo.');
