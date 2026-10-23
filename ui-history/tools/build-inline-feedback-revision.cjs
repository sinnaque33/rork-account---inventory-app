// Eighth revision: scan feedback for serial scanning. The user's review of v7 (2026-10-23): no full-screen green flash and no
// full-screen red; success and error both appear as the bottom notice of “Başarılı okutmadan sonra”, so the next barcode can be
// scanned without a tap. Base screens and tokens come from v7. No application edits.
// `--replace` regenerates only this revision's generated files while it is pending approval.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),root=path.dirname(base),previous='2026-10-22-impeccable-v7',id='2026-10-23-impeccable-v8';
const to=path.join(base,'experiments',id),light=path.join(base,'previews',id+'-light');
if(fs.existsSync(to)||fs.existsSync(light)){
  const meta=fs.existsSync(path.join(to,'meta.json'))&&JSON.parse(fs.readFileSync(path.join(to,'meta.json'),'utf8'));
  if(!process.argv.includes('--replace')||meta&&meta.status!=='pending_approval')throw new Error('Revizyon zaten var; üzerine yazılmaz.');
  // DESIGN.md and validation.json are written by hand after review; keep them.
  for(const dir of [to,light])for(const item of ['screens','states','tokens.css','meta.json'])fs.rmSync(path.join(dir,item),{recursive:true,force:true});
}
const f=JSON.parse(fs.readFileSync(path.join(base,'fixtures.json'),'utf8'));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function icon(name,cls=''){const c={exports:{},module:{exports:{}},require:()=>((_name,nodes)=>nodes)};vm.runInNewContext(fs.readFileSync(path.join(root,'node_modules/lucide-react-native/dist/cjs/icons',name+'.js'),'utf8'),c);const nodes=Array.isArray(c.module.exports)?c.module.exports:c.exports.default;return '<svg class="icon'+(cls?' '+cls:'')+'" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+nodes.map(([tag,a])=>'<'+tag+' '+Object.entries(a).filter(([k])=>k!=='key').map(([k,v])=>k+'="'+esc(v)+'"').join(' ')+'/>').join('')+'</svg>';}
function replaceOnce(html,search,replacement){if(!html.includes(search))throw new Error('Beklenen yapı bulunamadı: '+search);if(html.indexOf(search)!==html.lastIndexOf(search))throw new Error('Birden fazla eşleşme: '+search);return html.replace(search,()=>replacement);}

const item=f.items[0],qty=n=>n.toFixed(2),barcode=esc(f.barcode);
const newBox='KL-'+String(Math.max(...f.boxes.map(b=>Number(b.PackageNo.slice(3))))+1).padStart(6,'0');
const variant=esc(item.sh_Renk)+' / '+esc(item.sh_Beden);
const titled=(html,name)=>html.replace(/<title>([^<]*) · Impeccable önerisi<\/title>/,(_,t)=>'<title>'+t+' · '+name+' · Impeccable önerisi</title>');
const bodyClass=(html,cls)=>html.replace(/<body class="([^"]*)">/,(_,c)=>'<body class="'+c+' '+cls+'">');
const overlay=(html,markup)=>replaceOnce(html,'<div class="system-bottom"',markup+'<div class="system-bottom"');
// One notice for both outcomes: same place, same shape; colour, icon and sound tell them apart.
const okNotice=(title,message)=>'<div class="v7-toast" role="status"><span class="v7-toast-mark">'+icon('check')+'</span><div><strong>'+title+'</strong><p>'+message+'</p></div></div>';
const errNotice=reason=>'<div class="v7-toast v8-err" role="alert"><span class="v7-toast-mark">'+icon('x')+'</span><div><strong>Okutma başarısız</strong><p>'+reason+'</p><p class="v8-code">'+barcode+'</p></div><span class="v8-close" role="button" aria-label="Bildirimi kapat">'+icon('x')+'</span></div>';
const aboveFooter=(html,notice)=>replaceOnce(html,'<footer class="v4-footer quad">',notice+'<footer class="v4-footer quad">');
const items=html=>[...html.matchAll(/<article class="v4-card v4-item">[\s\S]*?<\/article>/g)];
function firstItem(html,change){const [first]=items(html);if(!first)throw new Error('Ürün kartı yok');return html.slice(0,first.index)+change(first[0])+html.slice(first.index+first[0].length);}
const added=html=>firstItem(html,a=>replaceOnce(a,'<strong>'+qty(item.h2_Miktar)+'</strong>','<strong>'+qty(item.h2_Miktar+1)+'</strong>').replace('<article class="v4-card v4-item">','<article class="v4-card v4-item v7-just">'));
const badScan=html=>replaceOnce(html,'<div class="v4-scan-input">','<div class="v4-scan-input v8-bad">').replace('placeholder="Eklenecek barkodu okutun..."','value="'+barcode+'"');
function newBoxPage(detail){
  let html=replaceOnce(detail,'<h1 class="mono">'+esc(f.boxes[0].PackageNo)+'</h1>','<h1 class="mono">'+newBox+'</h1>');
  for(const extra of items(html).slice(1).reverse())html=html.slice(0,extra.index)+html.slice(extra.index+extra[0].length);
  html=replaceOnce(html,'<strong>'+f.items.length+'</strong> ürün kalemi','<strong>1</strong> ürün kalemi');
  html=firstItem(html,a=>replaceOnce(a,'<strong>'+qty(item.h2_Miktar)+'</strong>','<strong>'+qty(1)+'</strong>'));
  return aboveFooter(html,okNotice('Başarılı',newBox+' numaralı koli oluşturuldu.'));
}
const states={
  'barcode-scanner':[
    ['gonderiliyor','Gönderiliyor',html=>replaceOnce(replaceOnce(html,'<div class="v5-barcode">','<div class="v5-barcode v7-locked">'),'<div class="v4-btn v5-send">Gönder</div>','<div class="v4-btn v5-send v7-busy" role="button" aria-disabled="true" aria-busy="true" aria-label="Gönderiliyor">'+icon('loader-circle')+'</div>'),
      ['Gönder’e basılınca düğmede yükleniyor işareti döner ve düğme pasifleşir; çift gönderim olmaz. Uygulamadaki davranış.','Barkod alanı yanıt gelene kadar kilitli ve soluk; ses ve titreşim yok.']],
    ['okutma-basarili','Okutma başarılı',detail=>newBoxPage(detail),
      ['Okutma başarılıysa koli açılır ve doğrudan yeni kolinin detayına geçilir: '+newBox+', ilk ürün 1 adet. Uygulamadaki davranış; araya tam ekran parlama girmez.','Altta 2 sn kalan bildirim “Başarılı” ve sunucunun açıklamasını gösterir; buradaki açıklama metni örnektir.','Okutma alanı yeniden odaklanır; sonraki ürün hemen okutulabilir.']],
    ['okutma-hatali','Okutma hatalı',html=>overlay(replaceOnce(html,'<div class="v5-barcode">','<div class="v5-barcode v8-bad">'),'<div class="v8-dock">'+errNotice('Koli oluşturulurken hata meydana geldi.')+'</div>'),
      ['Ekran kırmızıya boyanmaz: hata, başarı bildirimiyle aynı yerde ve biçimde çıkar; kırmızı ikon, kırmızı çerçeve, 500 ms titreşim ve Ayarlar’daki hata sesi.','Okutma alanı kırmızı çerçeveli, okutulan barkod alanda kalır; yeniden okutunca yerine yazılır.','Bildirim kendiliğinden kapanmaz: sonraki okutmada ya da × ile kapanır. Neden sunucunun açıklamasıdır; yoksa uygulamanın metni.']]
  ],
  'koli-detay':[
    ['okutma-basarili','Okutma başarılı',html=>aboveFooter(added(html),okNotice('Ürün eklendi',esc(item.InventoryName)+' · '+variant+' · '+(item.h2_Miktar+1)+' '+esc(item.sh_Birim))),
      ['Seri okutma için tam ekran parlama yok: liste yenilenir, miktarı artan ürün yeşil çerçeveyle işaretlenir, altta bildirim çıkar. Ses yok.','Bildirim 2 sn kalır ve hangi ürünün eklendiğini, yeni miktarı söyler; uygulamadaki “Başarılı / Ürün eklendi” yerine. Yeni okutma eskisinin yerine geçer.','Okutma alanı odakta kalır; dokunmadan sonraki barkod okutulur. Silme modunda aynı bildirim “Ürün silindi” der.']],
    ['okutma-hatali','Okutma hatalı',html=>aboveFooter(badScan(html),errNotice('Okutulan barkod sistemde bulunamadı.')),
      ['Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Liste değişmez.','Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; bildirimde neden ve barkod yazar (neden metni örnektir, yoksa “Bir hata oluştu”).','Bildirim sonraki okutmaya kadar kalır, × ile de kapanır; Tamam’a basmak gerekmez, okutma alanı odakta kalır.']],
    ['miktar-asimi','Miktar aşımı',html=>overlay(html,'<div class="v7-scrim"><section class="v7-sheet" role="alertdialog" aria-modal="true" aria-labelledby="limit-title" aria-describedby="limit-message"><span class="v7-warn-mark">'+icon('triangle-alert')+'</span><h2 id="limit-title">Miktar Aşımı</h2><p id="limit-message">Sipariş miktarı aşılıyor, devam etmek istiyor musunuz?</p><p class="v7-chip">'+barcode+'</p><div class="v7-sheet-actions"><span class="v4-btn quiet" role="button">Hayır</span><span class="v4-btn v7-warn" role="button">Evet</span></div></section></div>'),
      ['v7’deki gibi: karar gerektiği için okutma durur ve alttan pencere açılır; metin ve “Hayır / Evet” uygulamadakiyle aynı.','Düğmeler başparmak bölgesinde; okutulan barkod gösterilir. Evet, ürünü sınırı yok sayarak ekler.','Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır.']]
  ]
};

const css=fs.readFileSync(path.join(base,'experiments',previous,'tokens.css'),'utf8')+`
/* Revision 08 — serial scanning. Success and error share the bottom notice; nothing covers the screen or waits for a tap. */
:root{--v8-err-tile:#3a0f14;--v8-err-ink:#ff5c66;--v8-err-line:#ff3340}
:root[data-app-theme="light"]{--v8-err-tile:#fde4e6;--v8-err-ink:#b3141c;--v8-err-line:#d32030}
.v7-toast.v8-err{align-items:flex-start;border-color:var(--v8-err-line);outline:var(--hairline) solid var(--v8-err-line);outline-offset:calc(-2*var(--hairline));padding-right:0}
.v8-err .v7-toast-mark{background:var(--v8-err-tile);color:var(--v8-err-ink)}
.v8-err>div{flex:1}
.v8-err strong{color:var(--v8-err-ink)}
.v8-err p{color:var(--ink)}
.v8-err p.v8-code{font-family:var(--font-mono);font-size:var(--read-meta);letter-spacing:.06em;color:var(--read-muted)}
.v8-close{width:var(--s12);height:var(--s12);margin:calc(-1*var(--s2)) 0;display:grid;place-items:center;flex-shrink:0;color:var(--read-muted)}
.v8-close .icon{width:var(--s5);height:var(--s5)}
.v8-dock{position:absolute;left:0;right:0;bottom:calc(var(--status-height) + var(--s4));z-index:4}
.v8-dock .v7-toast{position:static;margin:0 var(--s4)}
.v4-scan-input.v8-bad,.v5-barcode.v8-bad{border-color:var(--v8-err-line);border-width:var(--heavy)}
.v4-scan-input.v8-bad>.icon{color:var(--v8-err-ink)}
.v4-scan-input.v8-bad input{font-family:var(--font-mono);letter-spacing:.06em}
`;
const sources=[[to,path.join(base,'experiments',previous)],[light,path.join(base,'previews',previous+'-light')]];
for(const [dir,from] of sources){
  for(const sub of ['screens','states'])fs.mkdirSync(path.join(dir,sub),{recursive:true});
  fs.writeFileSync(path.join(dir,'tokens.css'),css);
  const screens={};
  for(const file of fs.readdirSync(path.join(from,'screens')).filter(n=>n.endsWith('.html'))){
    screens[file.slice(0,-5)]=fs.readFileSync(path.join(from,'screens',file),'utf8');
    fs.writeFileSync(path.join(dir,'screens',file),screens[file.slice(0,-5)]);
  }
  for(const [slug,list] of Object.entries(states))for(const [state,name,make] of list){
    const source=slug==='barcode-scanner'&&state==='okutma-basarili'?screens['koli-detay']:screens[slug];
    const html=titled(make(source),name);
    if(/undefined|\[object Object\]/.test(html))throw new Error('Eksik veri: '+slug+'--'+state);
    fs.writeFileSync(path.join(dir,'states',slug+'--'+state+'.html'),html);
  }
}
const old=JSON.parse(fs.readFileSync(path.join(base,'experiments',previous,'meta.json'),'utf8'));
const noteFor=(slug,text)=>[...old.screenNotes[slug].filter(n=>!n.startsWith('Durum seçicide')),text];
const screenNotes={...old.screenNotes,
  'barcode-scanner':noteFor('barcode-scanner','Durum seçicide: Gönderiliyor, Okutma başarılı (yeni kolinin detayı) ve Okutma hatalı (alttaki bildirim).'),
  'koli-detay':noteFor('koli-detay','Durum seçicide: Okutma başarılı, Okutma hatalı (ikisi de alttaki bildirim) ve Miktar aşımı.')
};
const meta={...old,id,date:'2026-10-23',revision:8,previous,status:'pending_approval',label:'Impeccable · Seri okutma bildirimi',
  note:'Sekizinci öneri: seri okutma için tam ekran yeşil ve kırmızı kaldırıldı. Başarı ve hata aynı alt bildirimde; başarı 2 sn kalır, hata sonraki okutmaya kadar kalır ve okutma alanını kırmızı çerçeveler. Ana koda uygulanmadı.',
  skill:'impeccable / harden / operate',screenNotes,
  states:Object.fromEntries(Object.entries(states).map(([slug,list])=>[slug,list.map(([state,name,,notes])=>({id:state,name,notes}))]))};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:id+'-light',theme:'light',source:'experiments/'+id,note:'Sekizinci önerinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Seri okutma bildirimi: dokuz ekran, altı durum, iki tema.');
