// Fifteenth revision (2026-11-05): İrsaliye Oluştur gets a direct way into a box. Tapping a row must keep selecting it,
// so each row is split in two targets: selection on the left, a chevron on the right that opens Koli Detayı. Every other
// screen and state is carried from v14 unchanged. `--replace` regenerates while pending approval.
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..'),id='2026-11-05-impeccable-v15',v14='2026-11-04-impeccable-v14';
const to=path.join(base,'experiments',id),light=path.join(base,'previews',id+'-light');
if(fs.existsSync(to)||fs.existsSync(light)){
  const meta=fs.existsSync(path.join(to,'meta.json'))&&JSON.parse(fs.readFileSync(path.join(to,'meta.json'),'utf8'));
  if(!process.argv.includes('--replace')||meta&&meta.status!=='pending_approval')throw new Error('Revizyon zaten var; üzerine yazılmaz.');
  // DESIGN.md is written by hand after review; keep it.
  for(const dir of [to,light])for(const item of ['screens','states','tokens.css','meta.json'])fs.rmSync(path.join(dir,item),{recursive:true,force:true});
}
// The chevron is the one Koli Listesi already uses to mean "open this box".
const list=fs.readFileSync(path.join(base,'experiments',v14,'screens/koli-listesi.html'),'utf8');
const chevron=list.slice(list.indexOf('<article class="v4-card v4-box')).match(/<svg.*?<\/svg>/g)[1];
const split=html=>{
  let rows=0;
  const out=html.replace(/<div class="v9-pick( on)?" role="checkbox" aria-checked="(true|false)" aria-label="Koli ([^"]+)">(.*?<\/span><\/span>)<\/div>/g,(_,on,checked,no,inner)=>{rows++;return '<div class="v15-row'+(on?' on':'')+'"><div class="v9-pick'+(on||'')+'" role="checkbox" aria-checked="'+checked+'" aria-label="Koli '+no+'">'+inner+'</div><span class="v15-go" role="button" aria-label="Koli '+no+' detayını aç">'+chevron+'</span></div>';});
  if(!rows||/<div class="v9-pick[^>]*>/.test(out.replace(/<div class="v15-row[^>]*><div class="v9-pick[^>]*>/g,'')))throw new Error('Satırlar dönüştürülemedi');
  return out;
};
const css=fs.readFileSync(path.join(base,'experiments',v14,'tokens.css'),'utf8')+`
/* Revision 15 — İrsaliye rows: select on the left, open the box on the right. */
.v15-row{display:flex;align-items:stretch}
.v15-row+.v15-row{border-top:var(--hairline) solid var(--v4-band-line)}
.v15-row.on{background:var(--v4-irs-tile)}
.v15-row .v9-pick{flex:1;min-width:0}
.v15-row .v9-pick.on{background:none}
.v15-go{width:var(--s14);display:grid;place-items:center;flex-shrink:0;color:var(--subtle);box-shadow:inset var(--hairline) 0 0 var(--v4-band-line)}
.v15-go .icon{width:var(--s5);height:var(--s5)}
.v15-row.on .v15-go{color:var(--v4-irs-ink);box-shadow:inset var(--hairline) 0 0 color-mix(in srgb,var(--v4-irs-ink) 35%,transparent)}
`;
for(const [dir,src] of [[to,path.join(base,'experiments',v14)],[light,path.join(base,'previews',v14+'-light')]]){
  for(const sub of ['screens','states'])fs.mkdirSync(path.join(dir,sub),{recursive:true});
  fs.writeFileSync(path.join(dir,'tokens.css'),css);
  for(const file of fs.readdirSync(path.join(src,'screens'))){
    const html=fs.readFileSync(path.join(src,'screens',file),'utf8');
    fs.writeFileSync(path.join(dir,'screens',file),file==='irskoli-listesi.html'?split(html):html);
  }
  for(const file of fs.readdirSync(path.join(src,'states')))fs.copyFileSync(path.join(src,'states',file),path.join(dir,'states',file));
}
const m14=JSON.parse(fs.readFileSync(path.join(base,'experiments',v14,'meta.json'),'utf8'));
const meta={...m14,id,date:'2026-11-05',revision:15,previous:v14,status:'pending_approval',label:'Impeccable · İrsaliyeden koliye git',
  note:'On beşinci öneri: İrsaliye Oluştur’da her satırın sağında koliyi açan ok. Seçim satırın solunda aynı kalır. Diğer ekranlar v14 ile aynı. Ana koda uygulanmadı.',
  skill:'impeccable / layout',
  screenNotes:{...m14.screenNotes,'irskoli-listesi':['Her satır iki hedefli: sol taraf seçer (eskisi gibi), sağdaki ok koli detayını açar. Ok, Koli Listesi’ndeki okla aynı anlamda.','Ok alanı 56 px genişliğinde, satır boyunca; ince bir çizgi iki hedefi ayırır, yanlış dokunma seçimi bozmaz.','Detaydan geri dönünce seçimler, arama ve kaydırma yeri korunur.',...m14.screenNotes['irskoli-listesi'].slice(1)]}};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'On beşinci önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('İrsaliyeden koliye git: öneri 15 (9 ekran, 6 durum, iki tema).');
