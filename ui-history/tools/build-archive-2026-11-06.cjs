// Second archive record (2026-11-06): the shipped app after all nine screens were ported. Pages are the v15 proposal
// plus what changed directly in the app afterwards: "Koli Ara" label, equal footer buttons, smaller text on four
// screens. gitCommit is the last code commit; source-map.json hashes the sources with LF line endings, as in the repo.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execSync}=require('node:child_process');
const base=path.resolve(__dirname,'..'),root=path.dirname(base),date='2026-11-06',v15='2026-11-05-impeccable-v15';
const to=path.join(base,'versions',date),light=path.join(base,'previews','archive-'+date+'-light');
if(fs.existsSync(to)&&!process.argv.includes('--replace'))throw new Error('Arşiv zaten var; üzerine yazılmaz.');
for(const dir of [to,light])fs.rmSync(dir,{recursive:true,force:true});
const gitCommit=execSync('git rev-parse HEAD',{cwd:root}).toString().trim();
const css=fs.readFileSync(path.join(base,'experiments',v15,'tokens.css'),'utf8')+`
/* Archive 2026-11-06 — changes made directly in the app after v15. */
.v4-footer.pair{grid-template-columns:1fr 1fr}
main[aria-label="Koli Listesi"],main[aria-label="İrsaliye Oluştur"],main[aria-label="Sipariş Seçimi"]{--read-title:19px;--read-body:15px;--read-meta:13px;--v4-code:17px}
main[aria-label="Barkod Okutma"]{--title:23px;--label:13px;--read-body:15px;--read-meta:13px;--v4-scan:18px}
`;
const page=(slug,html)=>{
  let out=html.replace(/<title>([^<]*) · Impeccable önerisi<\/title>/,(_,t)=>'<title>'+t+' · '+date+'</title>').replace('Onay bekleyen statik tasarım önerisi.','Uygulamanın '+date+' hâli.');
  if(slug==='koli-listesi'){if(out.split('<span>Barkod</span>').length!==2)throw new Error('Barkod düğmesi bulunamadı');out=out.replace('<span>Barkod</span>','<span>Koli Ara</span>');}
  if(/Impeccable önerisi|Onay bekleyen/.test(out))throw new Error('Öneri izi kaldı: '+slug);
  return out;
};
const slugs=[];
for(const [dir,src] of [[to,path.join(base,'experiments',v15)],[light,path.join(base,'previews',v15+'-light')]]){
  fs.mkdirSync(path.join(dir,'screens'),{recursive:true});
  fs.writeFileSync(path.join(dir,'tokens.css'),css);
  for(const file of fs.readdirSync(path.join(src,'screens'))){
    const slug=file.replace('.html','');if(dir===to)slugs.push(slug);
    fs.writeFileSync(path.join(dir,'screens',file),page(slug,fs.readFileSync(path.join(src,'screens',file),'utf8')));
  }
}
const screenNotes={
  'login':'Hoş geldiniz ekranı; açık temada beyaz sayfa.',
  'settings':'Uygulama ayarları; açık temada seçili seçenek beyaz.',
  'dashboard':'İki kart aynı boyda, çıkış düğmesi başlıkta.',
  'koli-listesi':'Düz liste; her kolide sipariş no. Altta eşit boyda Koli Ara ve Yeni Koli. Yazılar bir boy küçük.',
  'koli-detay':'Kırmızı sipariş kartı, miktar sağ üstte, okutma hatası altta bildirim. Klavye yalnız alana dokununca açılır.',
  'create-koli':'Sipariş seçeneği tek satırlık kart.',
  'order-receipts':'Düz liste, kartta sipariş no ve cari. Yazılar bir boy küçük.',
  'irskoli-listesi':'Siparişe göre gruplu seçim, Tümünü seç, satırın sağındaki okla koli detayı. Yazılar bir boy küçük.',
  'barcode-scanner':'Okutma alanı 18 px, diğer yazılar bir boy küçük. Hata altta bildirim. Klavye yalnız alana dokununca açılır.'
};
const meta={date,gitCommit,appVersion:JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version,
  note:'İkinci arşiv: dokuz ekranın yeni tasarımı uygulamada.',
  changedScreens:slugs.sort(),screenNotes,
  profile:{width:390,height:844,platform:'android',theme:'dark',language:'tr',keyboard:'hidden'},fixture:'../../fixtures-api.json'};
fs.writeFileSync(path.join(to,'meta.json'),JSON.stringify(meta,null,2)+'\n');
const walk=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);
const files=['app','constants','hooks','locales'].flatMap(walk).filter(f=>/\.(tsx?|json)$/.test(f)).sort().map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n')).digest('hex')}));
fs.writeFileSync(path.join(to,'source-map.json'),JSON.stringify({gitCommit,files},null,2)+'\n');
fs.writeFileSync(path.join(light,'meta.json'),JSON.stringify({id:'archive-'+date+'-light',theme:'light',source:'versions/'+date,note:date+' arşivinin açık tema önizlemesi.'},null,2)+'\n');
console.log('Arşiv '+date+': '+slugs.length+' ekran, iki tema, '+files.length+' kaynak dosya özeti.');
