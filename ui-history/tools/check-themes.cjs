// Offline DOM/layout QA; no screenshots and no edits outside ui-history.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{pathToFileURL}=require('node:url'),{spawnSync}=require('node:child_process');
const base=path.resolve(__dirname,'..'),qa=path.join(base,'.qa'),results=[];
fs.mkdirSync(qa,{recursive:true});
const chrome=process.env.UI_HISTORY_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
function run(name,html,width=1440){
  const file=path.join(qa,name+'.html');fs.writeFileSync(file,html);
  const p=spawnSync(chrome,['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--user-data-dir='+path.join(qa,'theme-check-profile'),'--window-size='+width+',1080','--virtual-time-budget=6500','--dump-dom',pathToFileURL(file).href],{encoding:'utf8',timeout:45000,windowsHide:true,maxBuffer:8*1024*1024});
  const match=(p.stdout||'').match(/<pre id="qa-result">([\s\S]*?)<\/pre>/);
  if(!match)throw new Error(name+': '+(p.error?.message||p.stderr?.slice(-600)));
  const r=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>'));results.push({name,...r});console.log(name,r.errors.length?'FAIL '+JSON.stringify(r):'PASS');
}
const checks=`const r={errors:[],passed:[]};const check=(v,m)=>{if(v)r.passed.push(m);else r.errors.push(m)};`;
const finish=`const pre=document.createElement('pre');pre.id='qa-result';pre.textContent=JSON.stringify(r);document.body.append(pre);`;
const readability=process.argv.includes('--readability'),vibrance=process.argv.includes('--vibrance'),scanOrder=process.argv.includes('--scan-order'),states=process.argv.includes('--states'),critique=process.argv.includes('--critique')||states;
// v4/v5 list screens sit on a grey light page; the v5 barcode screen and the v2 screens keep the shipped white canvas.
const greyPage=['koli-listesi.html','koli-detay.html','irskoli-listesi.html','order-receipts.html'];
const lightBackground=file=>critique?(greyPage.includes(file)||file.startsWith('koli-detay--')||file==='barcode-scanner--okutma-basarili.html'?'rgb(242, 241, 244)':'rgb(255, 255, 255)'):scanOrder&&file==='barcode-scanner.html'?'rgb(255, 255, 255)':vibrance||scanOrder?'rgb(242, 241, 244)':'rgb(255, 255, 255)';
const targets=states?[['experiments/2026-10-23-impeccable-v8',false,true],['previews/2026-10-23-impeccable-v8-light',true,true]]:critique?[['experiments/2026-10-22-impeccable-v6',false,true],['previews/2026-10-22-impeccable-v6-light',true,true]]:scanOrder?[['experiments/2026-10-22-impeccable-v5',false,true],['previews/2026-10-22-impeccable-v5-light',true,true]]:vibrance?[['experiments/2026-10-22-impeccable-v4',false,true],['previews/2026-10-22-impeccable-v4-light',true,true]]:readability?[['experiments/2026-10-16-impeccable-v3',false,true],['previews/2026-10-16-impeccable-v3-light',true,true]]:[['experiments/2026-10-16-impeccable-v2',false,true],['previews/2026-10-16-impeccable-v2-light',true,true],['previews/archive-2026-10-15-light',true,false]];
for(const [folder,light,proposal] of targets){
  for(const dir of [path.join(base,folder,'screens'),...(states&&proposal?[path.join(base,folder,'states')]:[])])
  for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.html')&&(!process.argv.includes('--detail-only')||f==='koli-detay.html'))){
    const html=fs.readFileSync(path.join(dir,file),'utf8');
    const script=`<script>(async()=>{${checks}try{await document.fonts.ready;
      check(document.body.clientWidth===390&&document.body.clientHeight===844,'viewport');
      check(getComputedStyle(document.body).backgroundColor==='${light?lightBackground(file):'rgb(12, 11, 13)'}','theme background');
      check(getComputedStyle(document.body).colorScheme==='${light?'light':'dark'}','native control scheme');
      check(document.fonts.check('15px "${proposal?'Proposal':'Archive Roboto'}"'),'local font');
      check([...document.images].every(i=>i.complete&&i.naturalWidth>0),'local images');
      check([...document.querySelectorAll('.app *')].filter(e=>!e.closest('svg')).every(e=>{const b=e.getBoundingClientRect();return !b.width||b.left>=-.5&&b.right<=390.5}),'horizontal bounds');
      if(${readability}){
        const size=s=>parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
        if('${file}'==='koli-listesi.html'){check(size('.readable-box h2')===20,'20px package ID');check(size('.customer-name')===16,'16px customer');check(document.querySelectorAll('.readable-box').length===7,'7 records preserved');}
        else{check(size('.readable-item h2')===20,'20px product');check(size('.readable-quantity strong')===24,'24px quantity');check(document.querySelectorAll('.readable-item').length===4,'4 items preserved');check(document.querySelectorAll('.detail-footer .action').length===4,'4 actions preserved');check(document.querySelector('.scroll').clientHeight>=350,'product reading space');}
        for(const e of document.querySelectorAll('.readable-box h2,.readable-item h2,.box-facts dd,.variant-facts dd'))check(e.scrollWidth<=e.clientWidth+1,'text fits '+e.tagName);
      }
      if(${vibrance||critique}){
        const size=s=>parseFloat(getComputedStyle(document.querySelector(s)).fontSize),count=s=>document.querySelectorAll(s).length;
        if('${file}'==='koli-listesi.html'){check(count('.v4-box')===7,'7 box cards');check(size('.v4-box h2')===20,'20px package ID');check(size('.v4-customer')===16,'16px customer');check(count('.v4-tile.koli')===7,'koli tiles');}
        if('${file}'==='koli-detay.html'){check(count('.v4-item')===4,'4 item cards');check(size('.v4-item h2')===20,'20px product');check(size('.v4-qty strong')===24,'24px quantity');check(count('.v4-footer .v4-btn')===4,'4 actions preserved');check(document.querySelector('.scroll').clientHeight>=350,'product reading space');}
        if('${file}'==='irskoli-listesi.html'){check(count('.v4-select')===7,'7 selectable boxes');check(count('.v4-select.on')===2,'2 selected');check(count('.v4-status.open')===3&&count('.v4-status.closed')===4,'status from fixture');check(document.querySelector('.v4-btn.irs').textContent.includes('(2)'),'selection count in action');}
        if('${file}'==='barcode-scanner.html'&&${vibrance}){check(document.querySelector('.v4-scan-input input').value==='8690123456789','fixture barcode');check(document.querySelector('.v4-hero').getBoundingClientRect().height<=280,'compact order hero');}
      }
      if(${scanOrder||critique}){
        const size=s=>parseFloat(getComputedStyle(document.querySelector(s)).fontSize),count=s=>document.querySelectorAll(s).length;
        if('${file}'==='barcode-scanner.html'){const area=document.querySelector('.v5-scan').getBoundingClientRect(),block=document.querySelector('.v5-scan-body-inner').getBoundingClientRect();check(Math.abs((block.top-area.top)-(area.bottom-block.bottom))<=2,'centred like the shipped screen');check(document.querySelector('.v5-barcode input').value==='8690123456789','fixture barcode');check(size('.v5-barcode input')===22,'22px barcode');check(count('.v5-scan-ring')===1&&count('.v5-send')===1,'scan ring and submit kept');check(document.querySelector('.v5-chip').textContent.trim()==='SIP-2026-0148','order chip');}
        if('${file}'==='order-receipts.html'){check(count('.v5-order')===6,'6 orders preserved');check(count('.v5-alt')===1,'independent box option');check(size('.v5-order h2')===20,'20px order no');check(size('.v5-order p')===16,'16px account');for(const e of document.querySelectorAll('.v5-order,.v5-alt'))check(e.getBoundingClientRect().height>=64,'64px row');}
      }
      if(${vibrance||scanOrder||critique}){
        for(const e of document.querySelectorAll('.v4 h1,.v4 h2,.v4 dd,.v4-status,.v4-order-note,.v5-order p,.v5-alt p'))check(e.scrollWidth<=e.clientWidth+1,'text fits '+e.textContent.trim().slice(0,24));
        for(const e of document.querySelectorAll('.v4-btn,.v4-new-box,.tool,.v4-segment>span,.v5-round'+(${critique}?',.segment-item,.v4-order-no,.v7-btn,.v8-close':'')))check(e.getBoundingClientRect().height>=${critique?48:44},'touch target '+(e.textContent.trim()||e.getAttribute('aria-label')));
      }
      // v6: the critique fixes stay in place (theme colours, 48dp controls, 14px floor, roles, reordered fields).
      if(${critique}){
        const all=s=>[...document.querySelectorAll(s)],bg=s=>getComputedStyle(document.querySelector(s)).backgroundColor;
        const small=all('.app *'+(${states}?',.v7-cover *,.v7-scrim *':'')).filter(e=>!e.closest('svg')&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<14);
        check(!small.length,'14px text floor '+small.map(e=>e.textContent.trim().slice(0,20)).join(', '));
        check(all('.tool,.v5-round').every(e=>e.getBoundingClientRect().width>=48),'48dp icon buttons');
        check(!document.querySelector('.tool[role="img"],.v5-round[role="img"],.switch[role="img"],.v4-check[role="img"],.v4-segment[role="img"]'),'controls are not images');
        for(const s of ['.action.primary','.v4-btn.koli','.v5-send'])if(document.querySelector(s))check(bg(s)==='rgb(218, 33, 40)','theme red '+s);
        if(document.querySelector('.v4-btn.irs'))check(bg('.v4-btn.irs')==='${light?'rgb(62, 62, 196)':'rgb(91, 91, 240)'}','theme indigo');
        if(${light})check(all('.v4-card').every(e=>getComputedStyle(e).boxShadow==='none'),'no card shadows in light');
        if('${file}'==='login.html')check(getComputedStyle(document.querySelector('.remember-check')).color===bg('.action.primary'),'remember mark in brand red');
        if('${file}'==='settings.html'){const f=all('.form-section')[1];check(f.querySelector('.field .hint')?.textContent.startsWith('API URL'),'API URL hint under its field');check(all('.form-grid label').map(l=>l.textContent).join('|')==='Şirket kodu|Şirket şifresi','credentials side by side');check(all('.switch').every(e=>e.getAttribute('role')==='switch'&&e.getAttribute('aria-label')!=='Kapalı'),'named switches');}
        if('${file}'==='dashboard.html'){check(document.querySelector('.destination-icon.irs'),'indigo irsaliye');check(all('.destination path[d="m9 18 6-6-6-6"]').length===2,'chevrons');}
        if('${file}'==='koli-detay.html'){check(bg('.tool.danger')==='rgba(0, 0, 0, 0)','bare delete icon');check(document.querySelector('.v4-order-no').getBoundingClientRect().height>=48,'48dp order link');check(all('.v4-segment [role="radio"]').length===2,'mode radios');}
        if('${file}'==='irskoli-listesi.html')check(all('[role="checkbox"]').length===7&&all('[aria-checked="true"]').length===2,'checkbox rows');
        if('${file}'==='barcode-scanner.html')check(document.getElementById(document.querySelector('.v5-field label').htmlFor),'labelled barcode field');
        if('${file}'==='order-receipts.html')check(bg('.v5-alt')===bg('.v5-order'),'quiet no-order option');
      }
      // v8: serial scanning. Results sit in the bottom notice; only the over-limit question covers the screen.
      if(${states}){
        const all=s=>[...document.querySelectorAll(s)],box=s=>document.querySelector(s).getBoundingClientRect(),name='${file}';
        check(!document.querySelector('.v7-cover'),'no full-screen result');
        if(document.querySelector('.v7-scrim')){const b=box('.v7-scrim');check(b.left===0&&b.top===0&&b.width===390&&b.height===844,'full-bleed sheet scrim');}
        if(document.querySelector('.v7-toast')){const t=box('.v7-toast'),limit=document.querySelector('.v4-footer')?box('.v4-footer').top-8:844-24-8;check(t.bottom<=limit&&t.top>844*.55,'notice in thumb zone, clear of footer');}
        if(name.endsWith('--okutma-hatali.html')){check(all('.v8-err').length===1&&document.querySelector('.v8-err').getAttribute('role')==='alert','error notice announced');check(document.querySelector('.v8-code').textContent==='8690123456789','scanned barcode shown');check(document.querySelector('.v8-bad'),'scan field marked');check(all('.v8-err [role="button"]').length===1,'only close, no OK needed');}
        if(name==='koli-detay--okutma-basarili.html'){check(document.querySelector('.v7-toast[role="status"]')&&!document.querySelector('.v7-toast [role="button"]'),'success needs no tap');check(document.querySelector('.v7-just .v4-qty strong').textContent==='25.00','updated item marked');}
        if(name==='koli-detay--miktar-asimi.html')check(all('.v7-sheet [role="button"]').length===2&&box('.v7-sheet-actions').top>844*.6,'two choices in thumb zone');
        if(name==='barcode-scanner--gonderiliyor.html')check(document.querySelector('.v5-send[aria-busy="true"] svg'),'busy submit');
        if(name==='barcode-scanner--okutma-basarili.html')check(document.querySelector('h1').textContent==='KL-001255'&&all('.v4-item').length===1&&document.querySelector('.v7-toast'),'new box opened with toast');
        if(name==='irskoli-listesi.html')check(all('.v4-select.off').length===3&&all('.v4-select.off').every(e=>e.getAttribute('aria-disabled')==='true'&&e.querySelector('.v4-status.open')&&e.textContent.includes('Kapatılmadan eklenemez')),'open boxes disabled with reason');
        if(name==='order-receipts.html')check(document.querySelector('.v5-alt h2').textContent==='Siparişsiz koli oluştur','no-order option names its action');
      }
      const scrolls=[...document.querySelectorAll('.scroll,.rn-scroll')];check(scrolls.every(e=>e.clientHeight>100),'scroll space');for(const e of scrolls){e.scrollTop=e.scrollHeight;check(e.scrollTop===e.scrollHeight-e.clientHeight,'scroll end');}
      if('${file}'==='login.html')check(document.querySelector('img').src.includes('${light?'on-light':'on-dark'}'),'theme logo');
      if('${file}'==='settings.html'){const first=document.querySelector('${proposal?'.segment':'.s-segment'}');check(first.querySelector('${proposal?'.selected':'.s-segmentOptionActive'}').textContent.trim()==='${light?'Aydınlık':'Koyu'}','theme segment');}
      if(${proposal}){const rgb=s=>(s.match(/[\\d.]+/g)||[]).slice(0,3).map(Number);const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);const failures=[];
        for(const e of document.querySelectorAll('.app *'+(${states}?',.v7-cover *,.v7-scrim *':''))){if(e.closest('svg')||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const s=getComputedStyle(e);let p=e,bg;while(p){bg=getComputedStyle(p).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')break;p=p.parentElement}const a=lum(rgb(s.color)),b=lum(rgb(bg));const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);const threshold=parseFloat(s.fontSize)>=24||parseFloat(s.fontSize)>=18.66&&parseFloat(s.fontWeight)>=700?3:4.5;if(ratio<threshold)failures.push(e.textContent.slice(0,35)+': '+ratio.toFixed(2));}check(!failures.length,'text contrast '+failures.join(', '));
      }
    }catch(e){r.errors.push(e.message)}${finish}})();</script>`;
    run((proposal?'ai':'archive')+'-'+(light?'light':'dark')+'-'+file.slice(0,-5),html.replace('<head>','<head><base href="'+pathToFileURL(path.join(dir,file)).href+'">').replace('</body>',script+'</body>'));
  }
}
if(process.argv.includes('--screens-only')){fs.writeFileSync(path.join(qa,(states?'states':critique?'critique':scanOrder?'scan-order':vibrance?'vibrance':'readability')+'-confirm.json'),JSON.stringify(results,null,2)+'\n');process.exit(results.some(r=>r.errors.length)?1:0);}
const viewer=fs.readFileSync(path.join(base,'viewer/index.html'),'utf8'),manifest=fs.readFileSync(path.join(base,'manifest.js'),'utf8');
function testViewer(name,setup,script,width=1440){
  run(name,viewer.replace('<head>','<head><base href="'+pathToFileURL(path.join(base,'viewer/index.html')).href+'"><script>'+setup+'</script>').replace('<script src="../manifest.js"></script>','<script>'+manifest+'\nwindow.UI_HISTORY.versions.push({date:"2026-10-17",appVersion:"1.0.1",note:"Test",files:[],changedScreens:[]});</script>').replace('</body>','<script>(async()=>{'+checks+'const q=s=>document.querySelector(s),wait=()=>new Promise(d=>setTimeout(d,80));try{'+script+'}catch(e){r.errors.push(e.message)}'+finish+'})();</script></body>'),width);
}
const behavior=`
  await wait();const shell=getComputedStyle(document.body).backgroundColor,hash=location.hash;
  check(document.documentElement.dataset.theme==='dark','viewer dark');
  check(q('#screen-ai iframe').src.includes('impeccable-v8/'),'new revision');
  q('#theme-toggle').click();await wait();
  check(getComputedStyle(document.body).backgroundColor===shell,'viewer unchanged');check(location.hash===hash,'selection hash unchanged');
  for(const slot of ['a','b','ai'])check(q('#screen-'+slot+' iframe').src.includes('/previews/'),'light '+slot);
  check(q('#screen-a iframe').src===q('#screen-b iframe').src,'light fallback uses old source');check(q('#meta-b .inherited'),'fallback label');
  for(const option of q('#screen-select').options){q('#screen-select').value=option.value;q('#screen-select').dispatchEvent(new Event('change'));await wait();for(const slot of ['a','b','ai'])check(q('#screen-'+slot+' iframe').src.includes('-light/screens/'+option.value+'.html'),'light switch '+slot+' '+option.value);}
  for(const [slug,revision] of ['login','settings','dashboard','create-koli','koli-listesi','koli-detay','irskoli-listesi','barcode-scanner','order-receipts'].map(slug=>[slug,'v8'])){q('#screen-select').value=slug;q('#screen-select').dispatchEvent(new Event('change'));await wait();check(q('#screen-ai iframe').src.includes('impeccable-'+revision+'-light/'),'newest revision '+revision+' '+slug);check(q('#meta-ai .proposal-notes li'),'revision notes '+slug);}
  q('#screen-select').value='koli-detay';q('#screen-select').dispatchEvent(new Event('change'));await wait();
  const chips=[...document.querySelectorAll('#states-ai .state-chips button')];check(chips.length===4&&chips[0].getAttribute('aria-pressed')==='true','state chips');
  chips.find(b=>b.textContent==='Okutma hatalı').click();await wait();
  check(q('#screen-ai iframe').src.includes('impeccable-v8-light/states/koli-detay--okutma-hatali.html'),'state frame');check(location.hash.includes('durum=okutma-hatali'),'state in hash');check(document.activeElement?.dataset.state==='okutma-hatali','state focus kept');check(q('#meta-ai .proposal-notes li').textContent.startsWith('Başarı bildirimiyle aynı'),'state notes');
  q('#meta-ai .preview-button').click();check(q('#preview-body iframe').src===q('#screen-ai iframe').src,'state preview');q('#preview-close').click();await wait();
  q('#screen-select').value='barcode-scanner';q('#screen-select').dispatchEvent(new Event('change'));await wait();check(!location.hash.includes('durum='),'state reset on screen change');
  q('#screen-select').value='login';q('#screen-select').dispatchEvent(new Event('change'));await wait();check(!q('#states-ai .state-chips'),'no chips without states');
  q('#meta-ai .preview-button').focus();q('#meta-ai .preview-button').click();check(q('#preview-body iframe').src===q('#screen-ai iframe').src,'full preview theme');check(q('#preview-body iframe').offsetWidth===390,'full preview width');q('#preview-close').click();await wait();check(document.activeElement===q('#meta-ai .preview-button'),'focus restored');
  q('#theme-toggle').click();await wait();check(!q('#screen-ai iframe').src.includes('/previews/'),'dark restored');check(q('#screen-a iframe').src.includes('/versions/'),'archive dark restored');check(getComputedStyle(document.body).backgroundColor===shell,'shell still dark');
  q('#theme-toggle').click();await wait();check(localStorage.getItem('ui-history-phone-theme')==='light','preference saved');
  const host=q('#screen-ai'),frame=q('#screen-ai iframe');check(Math.abs(host.clientWidth-frame.getBoundingClientRect().width)<1,'scale');
  if(innerWidth<741){check(q('#phone-ai').getBoundingClientRect().top>q('#phone-b').getBoundingClientRect().bottom,'stacked phones');check(document.documentElement.scrollWidth<=innerWidth,'viewer horizontal bounds');}
`;
const setup='localStorage.setItem("ui-history-phone-theme","dark");location.hash="#screen=login&a=2026-10-15&b=2026-10-17";';
testViewer('themes-viewer',setup,behavior);
testViewer('themes-persist','location.hash="#screen=settings&a=2026-10-15";','await wait();check(document.documentElement.dataset.phoneTheme==="light","light preference restored");check(q("#screen-a iframe").src.includes("-light/"),"restored archive");check(q("#screen-ai iframe").src.includes("-light/"),"restored proposal");check(document.documentElement.dataset.theme==="dark","persist keeps shell dark");');
testViewer('themes-mobile',setup,behavior,600);
const actual=spawnSync(chrome,['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--enable-logging=stderr','--user-data-dir='+path.join(qa,'theme-check-profile'),'--virtual-time-budget=4000','--dump-dom',pathToFileURL(path.join(base,'viewer/index.html')).href+'#screen=login&a=2026-10-15&b=2026-10-15'],{encoding:'utf8',timeout:30000,windowsHide:true,maxBuffer:8*1024*1024});
const errors=[];if(!actual.stdout?.includes('id="phone-profile"'))errors.push('actual viewer');if(/Not allowed to load local resource|Failed to load resource|Access to font .*blocked/.test(actual.stderr||''))errors.push('local resource blocked');
results.push({name:'actual-file',errors});console.log('actual-file',errors.length?'FAIL':'PASS');
fs.writeFileSync(path.join(qa,'theme-results.json'),JSON.stringify(results,null,2)+'\n');if(results.some(r=>r.errors.length))process.exitCode=1;
