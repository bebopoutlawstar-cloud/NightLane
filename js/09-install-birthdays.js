/* ================= INSTALL HELPER ================= */
const SHARE_ICON='<span class="ico" aria-label="Share icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 15V3M7 8l5-5 5 5M5 12v8h14v-8"/></svg></span>';
const DOTS_ICON='<span class="ico" aria-label="menu icon">⋮</span>';
let deferredInstall=null;
addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); deferredInstall=e; try{ LS.remove("nl-installed"); }catch(_){} paintInstallEntry(); });   // the browser only offers this when NightLane ISN'T installed (so an uninstall brings the link back)
addEventListener("appinstalled",()=>{ deferredInstall=null; try{ LS.set("nl-installed","1"); }catch(_){} paintInstallEntry(); say("installMsg","Installed! Open NightLane from your home screen."); });

function detectBrowser(ua=navigator.userAgent){
  const ios=/iPad|iPhone|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
  const android=/Android/i.test(ua);
  const inApp=/FBAN|FBAV|Instagram|Snapchat|musical_ly|TikTok|Line\/|Twitter|LinkedInApp|Pinterest|GSA\//i.test(ua);
  const iosVer=(ua.match(/OS (\d+)_(\d+)/)||[]).slice(1).map(Number);
  const iosNew=iosVer.length&&(iosVer[0]>16||(iosVer[0]===16&&iosVer[1]>=4));
  let name="other", canInstall=false;
  if(ios){
    if(inApp){ name="inapp"; }
    else if(/CriOS/.test(ua)){ name="chrome-ios"; canInstall=iosNew; }
    else if(/EdgiOS/.test(ua)){ name="edge-ios"; canInstall=iosNew; }
    else if(/FxiOS/.test(ua)){ name="firefox-ios"; canInstall=iosNew; }
    else if(/Version\/[\d.]+.*Safari\//.test(ua)&&!/OPiOS|DuckDuckGo|Brave/i.test(ua)){ name="safari"; canInstall=true; }
    else { name="ios-other"; }            // Lion and other app browsers
  } else if(android){
    if(inApp||/; wv\)/.test(ua)) name="inapp";
    else if(/SamsungBrowser/.test(ua)){ name="samsung"; canInstall=false; }
    else if(/OPR\/|OPX\/|Opera|OPT\/|OPRGX|OPGX/i.test(ua)){ name="opera"; canInstall=false; }   // Opera / Opera GX: no web push, no real install   // its installs trip Android's "built for an older version of Android" block (Samsung bug); Chrome installs cleanly
    else if(/EdgA/.test(ua)){ name="edge-android"; canInstall=true; }
    else if(/Firefox/.test(ua)){ name="firefox-android"; canInstall=true; }
    else if(/Chrome\//.test(ua)){ name="chrome-android"; canInstall=true; }
    else name="android-other";
  } else {
    name=/Edg\//.test(ua)?"edge-desktop":/Chrome\//.test(ua)?"chrome-desktop":"desktop-other";
    canInstall=name!=="desktop-other";
  }
  return {ios,android,name,canInstall,iosNew};
}
const BROWSER=detectBrowser();
const isStandalone=()=>["standalone","window-controls-overlay","minimal-ui","fullscreen"].some(m=>matchMedia(`(display-mode: ${m})`).matches)||navigator.standalone===true;
// Opened as the installed app? Remember it, so the browser tab on the same PC/phone stops asking you to install.
if(isStandalone()){ try{ LS.set("nl-installed","1"); }catch(e){} }
const knownInstalled=()=>{ if(isStandalone()) return true; try{ return LS.get("nl-installed")==="1"; }catch(e){ return false; } };

function paintInstallEntry(){
  const notInstalled=!knownInstalled();
  [$("installLink1"),$("installLink2")].forEach(x=>show(x,notInstalled));
  let dismissed=false; try{ dismissed=LS.get("nl-install-bar")==="off"; }catch(e){}
  const stuck=notInstalled && !BROWSER.canInstall && (BROWSER.ios||BROWSER.android);
  if(stuck&&!dismissed){
    $("installBarText").textContent = BROWSER.ios
      ? "This browser can't add NightLane to your home screen, so notifications won't work here."
      : BROWSER.name==="samsung" ? "Samsung Internet can't install NightLane safely. Open it in Chrome to get the app."
      : BROWSER.name==="opera" ? "Opera can't install NightLane or send its notifications. Open nightlane.chat in Chrome, or get NightLane from the Play Store." : "This browser can't install NightLane. Open it in Chrome to get the app.";
    show($("installBar"));
  } else show($("installBar"),false);
}
function openInstallSheet(){
  const url=location.origin+location.pathname; $("installUrl").value=url; say("installMsg","");
  const steps=$("installSteps"); steps.innerHTML="";
  const add=h=>{ const li=document.createElement("li"); const s=document.createElement("span"); s.innerHTML=h; li.append(s); steps.append(li); };
  show($("installNow"),!!deferredInstall&&BROWSER.name!=="samsung"); show($("installChrome"),false);
  const B=BROWSER.name;
  if(B==="safari"){
    $("installIntro").textContent="You're in Safari, so you're all set.";
    add(`Tap the <b>Share</b> button ${SHARE_ICON} at the bottom (or top) of Safari.`);
    add(`Scroll down and tap <b>Add to Home Screen</b>.`);
    add(`Tap <b>Add</b>, then open NightLane from your home screen.`);
    add(`Log in, tap your picture, and turn on <b>notifications</b>.`);
  } else if(["chrome-ios","edge-ios","firefox-ios"].includes(B)&&BROWSER.canInstall){
    $("installIntro").textContent="Your browser can add NightLane to your home screen.";
    add(`Tap the <b>Share</b> button ${SHARE_ICON} (in Chrome it's next to the address bar; in Firefox and Edge it may be in the ${DOTS_ICON} menu).`);
    add(`Tap <b>Add to Home Screen</b>, then <b>Add</b>.`);
    add(`Open NightLane from your home screen, log in, and turn on <b>notifications</b> in your profile.`);
  } else if(BROWSER.ios){
    $("installIntro").textContent = B==="inapp"
      ? "You opened NightLane inside another app, which can't install it."
      : "This browser can't add apps to your home screen. Safari can.";
    add(`Tap <b>Copy</b> below to copy the NightLane link.`);
    add(`Open <b>Safari</b> and paste the link into the address bar.${BROWSER.iosNew?" (Chrome, Edge, or Firefox work too.)":""}`);
    add(`Tap <b>Share</b> ${SHARE_ICON} → <b>Add to Home Screen</b> → <b>Add</b>.`);
    add(`If Safari is turned off in Screen Time, ask whoever manages it. You can still chat here, just without notifications.`);
  } else if(BROWSER.android&&BROWSER.canInstall){
    $("installIntro").textContent = deferredInstall ? "Tap Install now, or use your browser menu." : "Install from your browser menu.";
    add(`Tap the ${DOTS_ICON} menu in the corner of your browser.`);
    add(`Tap <b>Install app</b> or <b>Add to Home screen</b>.`);
    add(`Open NightLane from your home screen, log in, and turn on <b>notifications</b> in your profile.`);
  } else if(B==="samsung"){
    $("installIntro").textContent="Samsung Internet has a bug that makes Android block NightLane with a scary \"older version of Android\" warning. Install from Chrome instead. No security settings to change.";
    const host=location.host+location.pathname;
    $("installChrome").href=`intent://${host}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
    show($("installChrome"));
    add(`Tap <b>Open in Chrome</b> above. (No Chrome? Get it free from the Play Store, or copy the link below into it.)`);
    add(`In Chrome, tap ${DOTS_ICON} → <b>Install app</b>.`);
    add(`Already installed it from Samsung Internet? Remove that copy first, and <b>don't</b> turn off Play Protect for it.`);
  } else if(BROWSER.android){
    $("installIntro").textContent="This browser can't install NightLane. Chrome can.";
    add(`Tap <b>Copy</b> below to copy the NightLane link.`);
    add(`Open <b>Chrome</b> and paste the link.`);
    add(`Tap ${DOTS_ICON} → <b>Install app</b> or <b>Add to Home screen</b>.`);
  } else {
    $("installIntro").textContent = BROWSER.canInstall ? "You can install NightLane on this computer." : "On a computer, Chrome or Edge can install NightLane.";
    if(BROWSER.canInstall) add(`Click the <b>install</b> icon at the right end of the address bar, or use the browser menu → <b>Install NightLane</b>.`);
    add(`On your phone, open the link below in <b>Safari</b> (iPhone) or <b>Chrome</b> (Android) and add it to your home screen.`);
  }
  show($("installSheet"));
}
$("installNow").onclick=async()=>{
  if(!deferredInstall) return;
  deferredInstall.prompt();
  const {outcome}=await deferredInstall.userChoice.catch(()=>({outcome:"dismissed"}));
  if(outcome==="accepted"){ say("installMsg","Installing… Open NightLane from your home screen."); deferredInstall=null; show($("installNow"),false); }
};
$("installCopy").onclick=async()=>{
  const v=$("installUrl").value;
  try{ await navigator.clipboard.writeText(v); say("installMsg","Link copied. Paste it into Safari or Chrome."); }
  catch(e){ $("installUrl").select(); say("installMsg","Press and hold the link above, then tap Copy."); }
};
$("installClose").onclick=()=>show($("installSheet"),false);
$("installSheet").addEventListener("click",e=>{ if(e.target.id==="installSheet") show($("installSheet"),false); });
[$("installLink2"),$("installBarHow")].forEach(x=>x.onclick=openInstallSheet);   // (the sign-in screen's "Get the app" is a plain link to download.html)
$("installBarClose").onclick=()=>{ show($("installBar"),false); try{ LS.set("nl-install-bar","off"); }catch(e){} };
paintInstallEntry();
try{ matchMedia("(display-mode: standalone)").addEventListener("change",paintInstallEntry); }catch(e){}

/* ================= BIRTHDAYS ================= */
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
function fillBirthdayPicker(){
  const m=$("bdMonth"), d=$("bdDay");
  if(!m.options.length){ m.append(new Option("Month","")); MONTHS.forEach((name,i)=>m.append(new Option(name,String(i+1).padStart(2,"0")))); }
  const cur=meProfile?.birthday||"";
  m.value=cur.slice(0,2);
  paintDays(cur.slice(3,5));
  $("bdClear").classList.toggle("hidden",!cur);
  say("bdMsg", cur ? (isBirthdayToday(cur)?"Happy birthday! 🎂 Everyone sees a cake on your picture today.":`Friends will see a 🎂 on your picture on ${MONTHS[+cur.slice(0,2)-1]} ${+cur.slice(3,5)}.`) : "");
}
function paintDays(keep){
  const m=$("bdMonth").value, d=$("bdDay"), prev=keep??d.value;
  const max=m?[31,29,31,30,31,30,31,31,30,31,30,31][+m-1]:31;
  d.innerHTML=""; d.append(new Option("Day",""));
  for(let i=1;i<=max;i++) d.append(new Option(String(i),String(i).padStart(2,"0")));
  d.value=prev&&+prev<=max?prev:"";
}
$("bdMonth").addEventListener("change",()=>paintDays());
$("bdSave").onclick=async()=>{
  const m=$("bdMonth").value, d=$("bdDay").value;
  if(!m||!d) return say("bdMsg","Pick a month and a day.",true);
  await saveBirthday(`${m}-${d}`);
};
$("bdClear").onclick=()=>saveBirthday(null);
async function saveBirthday(bd){
  $("bdSave").disabled=true;
  try{
    await api.saveStyle(user.id,{birthday:bd});
    meProfile={...meProfile,birthday:bd}; cache.set(user.id,meProfile); paintMe();
    if(room) repaintFaces(user.id);
    fillBirthdayPicker();
    if(bd===null) say("bdMsg","Birthday removed.");
    else if(isBirthdayToday(bd)) celebrateMyBirthday(true);
  }catch(err){ say("bdMsg","Couldn't save: "+err.message,true); }
  finally{ $("bdSave").disabled=false; }
}
function celebrateMyBirthday(force){
  if(!meProfile||!isBirthdayToday(meProfile.birthday)) return;
  const key="nl-bday-"+new Date().toDateString();
  try{ if(!force&&LS.get(key)) return; LS.set(key,"1"); }catch(e){}
  setTimeout(()=>{
    if(fxEnabled()) FX.play("confetti");
    const t=el("div","toast mention");
    const f=el("span","face"); paintFace(f,meProfile);
    const body=el("span","tbody"); body.append(el("div","ttitle","🎂 Happy birthday!"), el("div","ttext",`Have an amazing day, ${meProfile.username}!`));
    t.append(f,body); $("toasts").prepend(t);
    setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },6000);
  },600);
}

