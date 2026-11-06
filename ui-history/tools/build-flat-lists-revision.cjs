// Fourteenth revision (2026-11-04): feedback from the responsible colleague: everything is fine except the grouping on
// the order and box lists, which confuses people; bring those back towards the old layout. Koli Listesi and Sipariş
// Seçimi become flat lists again, one card per record, in the service's order. What the user asked for in v12 stays:
// order number written out with its label, codes in the sans. All other screens and states are carried from v13
// unchanged. `--replace` regenerates while pending approval.
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..'),id='2026-11-04-impeccable-v14';
const v8='2026-10-23-impeccable-v8',v9='2026-10-27-impeccable-v9',v13='2026-10-27-impeccable-v13';
const to=path.join(base,'experiments',id),light=path.join(base,'previews',id+'-light');
if(fs.existsSync(to)||fs.existsSync(light)){
  const meta=fs.existsSync(path.join(to,'meta.json'))&&JSON.parse(fs.readFileSync(path.join(to,'meta.json'),'utf8'));
  if(!process.argv.includes('--replace')||meta&&meta.status!=='pending_approval')throw new Error('Revizyon zaten var; üzerine yazılmaz.');
  // DESIGN.md is written by hand after review; keep it.
  for(const dir of [to,light])for(const item of ['screens','states','tokens.css','meta.json'])fs.rmSync(path.join(dir,item),{recursive:true,force:true});
}
const api=JSON.parse(fs.readFileSync(path.join(base,'fixtures-api.json'),'utf8'));
const boxes=api.koliListesi.items,receipts=api.orderReceipts.items;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const replaceRun=(html,start,end,markup)=>{const i=html.indexOf(start),j=html.indexOf(end,i);if(i<0||j<0)throw new Error('Liste bulunamadı: '+start);return html.slice(0,i)+markup+html.slice(j);};
// Icons come from the old cards themselves, so the tiles are the ones people already know.
const svgs=(file,card)=>{const html=fs.readFileSync(path.join(base,'experiments',file),'utf8'),i=html.indexOf(card);if(i<0)throw new Error('Kart bulunamadı: '+card);return html.slice(i,html.indexOf('</article>',i)).match(/<svg.*?<\/svg>/g);};
const [boxIcon,boxChev]=svgs(v9+'/screens/koli-listesi.html','<article class="v4-card v4-box v9-box"');
const [orderIcon,orderChev]=svgs(v8+'/screens/order-receipts.html','<article class="v4-card v5-order"');

const boxList='<p class="v4-count"><strong>'+boxes.length+'</strong> koli</p>'+boxes.map(b=>
  '<article class="v4-card v4-box v9-box" role="button" aria-label="Koli '+esc(b.PackageNo)+'"><div class="v4-box-head"><span class="v4-tile koli">'+boxIcon+'</span><div><h2 class="mono v14-no">'+esc(b.PackageNo)+'</h2><p class="v14-order"><span class="v12-k">Sipariş No</span> <strong class="mono">'+esc(b.ReceiptNo)+'</strong></p>'+(b.SipExp?'<p class="v9-exp">'+esc(b.SipExp)+'</p>':'')+'</div>'+boxChev+'</div></article>').join('')+'<p class="v4-end">Tüm koliler yüklendi</p>';
const orderList='<p class="v4-count"><strong>'+receipts.length+'</strong> sipariş</p>'+receipts.map(o=>
  '<article class="v4-card v5-order" role="button" aria-label="Sipariş '+esc(o.ReceiptNo)+'"><span class="v4-tile koli">'+orderIcon+'</span><div><h2><span class="v12-k">Sipariş No</span> <span class="mono">'+esc(o.ReceiptNo)+'</span></h2><p>'+esc(o.CurrentAccountName.replace(/\s+/g,' ').trim())+'</p></div>'+orderChev+'</article>').join('');

const css=fs.readFileSync(path.join(base,'experiments',v13,'tokens.css'),'utf8')+`
/* Revision 14 — flat lists again: one card per box, one card per order. */
.v14-no{font-size:var(--read-title);font-weight:650;line-height:1.3}
.v14-order{display:flex;align-items:baseline;gap:var(--s1);margin-top:var(--s1);line-height:1.4}
.v14-order strong{font-size:var(--read-body);font-weight:600}
`;
const lists={'koli-listesi':[boxList,'</div></div><footer'],'order-receipts':[orderList,'</div></div></main>']};
const check=(html,what)=>{if(/undefined|\[object Object\]|NaN|v12-group/.test(html))throw new Error('Eksik ya da eski veri: '+what);return html;};
for(const [dir,src] of [[to,path.join(base,'experiments',v13)],[light,path.join(base,'previews',v13+'-light')]]){
  for(const sub of ['screens','states'])fs.mkdirSync(path.join(dir,sub),{recursive:true});
  fs.writeFileSync(path.join(dir,'tokens.css'),css);
  for(const file of fs.readdirSync(path.join(src,'screens'))){
    const slug=file.replace('.html',''),html=fs.readFileSync(path.join(src,'screens',file),'utf8');
    fs.writeFileSync(path.join(dir,'screens',file),check(lists[slug]?replaceRun(html,'<p class="v4-count">',lists[slug][1],lists[slug][0]):html,slug));
  }
  for(const file of fs.readdirSync(path.join(src,'states')))fs.copyFileSync(path.join(src,'states',file),path.join(dir,'states',file));
}
const m13=JSON.parse(fs.readFileSync(path.join(base,'experiments',v13,'meta.json'),'utf8'));
const meta={...m13,id,date:'2026-11-04',revision:14,previous:v13,status:'pending_approval',label:'Impeccable · Düz listeler',
  note:'On dördüncü öneri: sorumlu arkadaşın geri bildirimi. Koli Listesi ve Sipariş Seçimi’ndeki gruplama kaldırıldı, listeler eskisi gibi kayıt başına bir kart. Diğer ekranlar v13 ile aynı. Ana koda uygulanmadı.',
  skill:'impeccable / layout',
  screenNotes:{...m13.screenNotes,
    'koli-listesi':['Gruplama kaldırıldı: her koli bir kart, servisin sırasıyla (en yeni önce).','Kartta koli no, altında “Sipariş No 00000151” ve siparişin açıklaması (en fazla iki satır, boşsa çizilmez).','Listenin sonundaki “Tüm koliler yüklendi” satırı geri geldi.'],
    'order-receipts':['Gruplama kaldırıldı: her sipariş bir kart, servisin sırasıyla.','Kartta “Sipariş No 00000151”, altında cari (CurrentAccountName, en fazla iki satır). Uygulamadaki önek “Fiş:”; öneride “Sipariş No”.','Siparişsiz koli seçeneği ve arama (sipariş no veya cari) aynı.']}};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'On dördüncü önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Düz listeler: öneri 14 (9 ekran, 6 durum, iki tema).');
