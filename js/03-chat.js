/* ================= INBOX ================= */
const inboxCacheKey=()=>"nl-inbox-cache-"+(user?.id||"");
async function loadInbox(){
  if(!user) return;
  let list=null;
  if(navigator.onLine!==false&&!offlineMode){ try{ const [l,icons]=await Promise.all([api.myRooms(),api.roomIcons().catch(()=>[])]); list=l; icons.forEach(i=>roomIcons.set(i.code,i.icon_url)); LS.set(inboxCacheKey(),JSON.stringify(list.slice(0,80))); }catch(e){ list=null; } }
  if(list===null){   // offline or failed: keep what's on screen, or the last saved copy, never wipe it to "No rooms"
    if(inboxRows.length) list=inboxRows; else { try{ list=JSON.parse(LS.get(inboxCacheKey())||"[]"); }catch(e){ list=[]; } }
    paintOffline();
  }
  inboxRows=list;
  await loadLanes();
  show($("markAllRead"),list.some(r=>+r.unread>0));
  if(!isOffline()&&list.some(r=>r.dm_user)) await ensureProfiles(list.map(r=>r.dm_user).filter(Boolean));   // offline: use the names/pictures saved with the list
  const roomRows=list.filter(r=>!r.is_dm&&!laneByRoom.has(r.code)), dmRows=list.filter(r=>r.is_dm), laneRows=list.filter(r=>laneByRoom.has(r.code));
  show($("inboxWrap"),roomRows.length>0); show($("inboxEmpty"),!roomRows.length); show($("dmEmpty"),!dmRows.length);
  const unreadOf=rows=>rows.filter(r=>r.notify!=="off").reduce((n,r)=>n+(+r.unread||0),0);
  setTabBadge("badgeRooms",unreadOf(roomRows)); setTabBadge("badgeDms",unreadOf(dmRows)); setTabBadge("badgeLanes",unreadOf(laneRows));
  setIconBadge(unreadOf(roomRows)+unreadOf(dmRows)+unreadOf(laneRows));   // the number on the app icon
  paintInboxLists();
}
/* Rooms and DMs lists stay tidy: a search box once you have 8+ chats, an All / Unread switch,
   and chats that have been quiet for 2+ weeks fold into a "Quiet" section at the bottom. */
const QUIET_DAYS=14, inboxView={rooms:{f:"all",open:false},dms:{f:"all",open:false}};
try{ const v=JSON.parse(LS.get("nl-inbox-view")||"null"); if(v){ inboxView.rooms.f=v.rooms==="unread"?"unread":"all"; inboxView.dms.f=v.dms==="unread"?"unread":"all"; } }catch(e){}
function paintInboxLists(){
  const rr=inboxRows.filter(r=>!r.is_dm&&!laneByRoom.has(r.code)), dr=inboxRows.filter(r=>r.is_dm);
  show($("inboxWrap"),rr.length>0); show($("inboxEmpty"),!rr.length); show($("dmEmpty"),!dr.length);
  paintInboxBox($("inbox"),rr,"rooms",$("roomTools"),$("roomFind"));
  paintLanes();
  paintInboxBox($("dmList"),inboxRows.filter(r=>r.is_dm),"dms",$("dmTools"),$("dmFind"));
}
/* ⭐ Pinned chats (coded by Cole): saved per account on this device */
const pinKey=()=>"nl-pin-chats-"+(user?.id||"");
function pinSet() { try{ return new Set(JSON.parse(LS.get(pinKey())||"[]")); }catch(e){ return new Set(); } }
function togglePin(code){
  const p=pinSet(); if(p.has(code)) p.delete(code); else p.add(code);
  try{ LS.set(pinKey(),JSON.stringify([...p])); }catch(e){}
  paintInboxLists();
}
function paintInboxBox(box,rows,kind,tools,find){
  box.innerHTML=""; const v=inboxView[kind];
  const many=rows.length>=8; show(tools,rows.length>=5); tools.classList.toggle("nosearch",!many);
  tools.querySelectorAll(".cf").forEach(b=>{ const on=b.dataset.f===v.f; b.classList.toggle("on",on); b.setAttribute("aria-pressed",on); });
  const q=many?find.value.trim().toLowerCase().replace(/^[@#]/,""):"";
  const rowName=r=>(r.is_dm?(r.dm_name||""):((r.name||"")+" "+r.code)).toLowerCase();
  let shown=rows;
  if(v.f==="unread"&&rows.length>=5) shown=shown.filter(r=>+r.unread>0);
  if(q) shown=shown.filter(r=>rowName(r).includes(q));
  if(!shown.length&&rows.length){ box.append(el("p","inote",q?`Nothing matches "${q}".`:"You're all caught up ✨")); return; }
  const pins=pinSet();
  const cutoff=Date.now()-QUIET_DAYS*864e5;
  const isQuiet=r=>!(+r.unread>0)&&(!r.last_at||new Date(r.last_at).getTime()<cutoff)&&!pins.has(r.code);
  const fold=many&&!q&&v.f==="all";
  const active=fold?shown.filter(r=>!isQuiet(r)):shown, quiet=fold?shown.filter(isQuiet):[];
  active.sort((a,b)=>{   // pinned first, then unread first, then most recent first
    const pa=pins.has(a.code), pb=pins.has(b.code); if(pa!==pb) return pa?-1:1;
    const ua=+a.unread>0, ub=+b.unread>0; if(ua!==ub) return ua?-1:1;
    const ta=new Date(a.last_at||0).getTime(), tb=new Date(b.last_at||0).getTime(); return tb-ta;   // most recent first
  });
  active.forEach(r=>box.append(inboxRow(r)));
  if(quiet.length){
    const d=document.createElement("details"); d.className="quiet"; d.open=v.open||!active.length;
    d.append(el("summary","",`💤 Quiet · ${quiet.length}`));
    d.addEventListener("toggle",()=>{ v.open=d.open; });
    quiet.forEach(r=>d.append(inboxRow(r))); box.append(d);
  }
}
[["roomTools","roomFind","rooms"],["dmTools","dmFind","dms"]].forEach(([t,f,k])=>{
  $(f).addEventListener("input",paintInboxLists);
  $(t).querySelectorAll(".cf").forEach(b=>b.onclick=()=>{ inboxView[k].f=b.dataset.f; try{ LS.set("nl-inbox-view",JSON.stringify({rooms:inboxView.rooms.f,dms:inboxView.dms.f})); }catch(e){} paintInboxLists(); });
});
function inboxRow(r){
    const b=el("button","roomrow"); b.type="button";
    let hash;
    if(r.is_dm){ hash=el("span","face"); paintFace(hash,cache.get(r.dm_user)||{id:r.dm_user,username:r.dm_name,avatar_url:r.dm_avatar}); }
    else if(roomIcons.get(r.code)){ hash=el("span","hash pic"); hash.append(roomIconEl(roomIcons.get(r.code))); }
    else hash=el("span","hash","#");
    const info=el("span","info");
    const nm=el("div","name",r.is_dm?(r.dm_name||"Private chat"):(r.name||"# "+r.code));
    if(r.is_dm){ if(contactIds.includes(r.dm_user)) nm.append(el("span","code","friend")); } else if(r.name) nm.append(el("span","code","#"+r.code));
    if(r.notify==="off") nm.append(el("span","muted","🔕")); else if(r.notify==="mentions") nm.append(el("span","muted","@"));
    info.append(nm);
    const pv=previewOf({kind:r.last_kind,text:r.last_text,image_url:r.last_image?"x":null,media_type:r.last_kind==="video"||r.last_kind==="audio"?r.last_kind:null,sticker:r.last_kind==="sticker"?"x":null})||"No messages yet";
    info.append(el("div","preview",r.last_sender?`${r.last_sender}: ${pv}`:pv));
    const when=el("span","when"); when.append(el("span","",shortWhen(r.last_at)));
    if(+r.unread>0) when.append(el("span","badge",r.unread>99?"99+":String(r.unread)));
    b.append(hash,info,when);
    b.setAttribute("aria-label",`${r.is_dm?"Private chat with "+(r.dm_name||"someone"):"Room "+(r.name||r.code)}${+r.unread?`, ${r.unread} unread`:""}`);
    b.onclick=()=>{ if(isOffline()){ offlineNotice(); return; } if(!r.is_dm) $("room").value=r.code; enterRoom(r.code); };
    const pinned = pinSet().has(r.code);
    const wrap=el("div","rowwrap"); wrap.append(b);
    const pin=el("button","pinbtn",pinned ? "⭐" : "☆"); pin.type="button"; pin.setAttribute("aria-label",pinned?"Unpin chat":"Pin chat"); pin.onclick=e=>{ e.stopPropagation(); togglePin(r.code); };
    wrap.append(pin);
    return wrap;
}
document.addEventListener("visibilitychange",()=>{ if(!document.hidden){ if(room) markReadSoon(); else loadInbox(); } });

/* ================= UI SOUNDS (Kenney "Interface Sounds", CC0 public domain) ================= */
/* (moved to js/00-media.js) */
const UI_VOL={send:.28,receive:.3,notify:.32,mention:.4,toggle:.22,tab:.16,error:.3};
/* Message buzzes: short double-taps you can actually feel (the old 25-30ms blips were too faint on most phones).
   Android only: Apple doesn't let web apps vibrate on iPhone. */
const BUZZ={chat:[70,50,70], message:[90,60,90], mention:[120,70,120,70,120]};
const buzzOn=()=>{ try{ return LS.get("nl-buzz")!=="off"; }catch(e){ return true; } };
function buzz(kind){ if(!buzzOn()||document.hidden||(typeof dndOn==="function"&&dndOn())) return; try{ navigator.vibrate&&navigator.vibrate(BUZZ[kind]||BUZZ.message); }catch(e){} }
const uiSoundOn=()=>{ try{ return LS.get("nl-uisound")!=="off"; }catch(e){ return true; } };

/* ================= NIGHT OWL (habit reminder DMs) =================
   A closed app can't run timers, so the server does the waiting: closing the app asks it to check back
   in 20 minutes (never before 5 PM your time). If habits are still unchecked then, the Night Owl
   DMs you, and that DM arrives as a normal push. Opening the app again cancels it. */
let owlToken=null;
if(sb){ sb.auth.getSession().then(({data})=>{ owlToken=data.session?.access_token||null; tellSwAuth(owlToken); }); sb.auth.onAuthStateChange((e,s)=>{ owlToken=s?.access_token||null; tellSwAuth(owlToken); }); }
/* ---- private chat files ----
   Chat photos/videos/voice only open for people in that chat. The service worker attaches your login to
   those requests; this hands it your current login (and clears it when you sign out). */
function tellSwAuth(token){
  if(!("serviceWorker" in navigator)) return;
  const msg={type:"nl-auth",auth:token?{token,key:SUPABASE_ANON_KEY}:null};
  try{ navigator.serviceWorker.controller?.postMessage(msg); }catch(e){}
  navigator.serviceWorker.ready.then(r=>{ try{ r.active?.postMessage(msg); }catch(e){} }).catch(()=>{});
}
if("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("controllerchange",()=>tellSwAuth(owlToken));
// Backup (first visit before the helper's running, or a browser without one): swap in a short-lived private link.
const PRIVATE_FILE_RE=/\/storage\/v1\/object\/public\/(chat-images|chat-media)\/([^?#]+)/;
const signedLinks=new Map();
async function privateLink(bucket,path){
  const k=bucket+"/"+path, hit=signedLinks.get(k); if(hit&&hit.exp>Date.now()) return hit.url;
  const {data,error}=await sb.storage.from(bucket).createSignedUrl(path,6*3600);
  if(error||!data?.signedUrl) return null;
  signedLinks.set(k,{url:data.signedUrl,exp:Date.now()+5.5*3600e3}); return data.signedUrl;
}
async function privateFallback(node){   // true if a private link was swapped in
  if(!sb||!node||node.dataset.nlSigned) return false;
  const m=(node.currentSrc||node.src||node.getAttribute?.("src")||"").match(PRIVATE_FILE_RE); if(!m) return false;
  node.dataset.nlSigned="1";
  const url=await privateLink(m[1],decodeURIComponent(m[2])); if(!url) return false;
  node.src=url; if(node.tagName==="SOURCE") node.parentElement?.load?.();
  return true;
}
document.addEventListener("error",e=>{ const t=e.target; if(t&&/^(IMG|VIDEO|AUDIO|SOURCE)$/.test(t.tagName)) privateFallback(t); },true);
/* ================= PROGRESS SYNC =================
   XP, secrets, and unlocks are saved on the phone AND merged into your account, so iPhone Safari's 7-day
   cleanup, reinstalling, or a new phone can't wipe them. The server only ever merges upward. */
function localProgress(){
  let x={xp:0,log:{}}, sec=[], un=[];
  try{ x=JSON.parse(LS.get("nl-xp"))||x; }catch(e){}
  try{ sec=JSON.parse(LS.get("nl-secrets")||"[]"); }catch(e){}
  try{ un=JSON.parse(LS.get("nl-unlocked")||"[]"); }catch(e){}
  return {xp:+x.xp||0, log:(x.log&&typeof x.log==="object")?x.log:{}, secrets:Array.isArray(sec)?sec:[], unlocks:Array.isArray(un)?un:[]};
}
function applyServerProgress(r){
  if(!r) return;
  try{
    const mine=localProgress();
    const log={...mine.log}; Object.entries(r.xp_log||{}).forEach(([k,v])=>{ log[k]=Math.max(+log[k]||0,+v||0); });
    LS.set("nl-xp",JSON.stringify({xp:Math.max(mine.xp,+r.xp||0),log}));
    LS.set("nl-secrets",JSON.stringify([...new Set([...mine.secrets,...(r.secrets||[])])]));
    LS.set("nl-unlocked",JSON.stringify([...new Set([...mine.unlocks,...(r.unlocks||[])])]));
  }catch(e){}
  if(typeof paintHomeLevel==="function") paintHomeLevel();
}
let progressTimer=null, progressDirty=false;
let progressDue=0;
function progressChanged(now){   // an urgent save (a found secret) is never pushed back by a routine one (like the XP it awards)
  progressDirty=true; const due=Date.now()+(now?0:3000);
  if(progressTimer&&progressDue<=due) return;
  clearTimeout(progressTimer); progressDue=due; progressTimer=setTimeout(()=>{ progressTimer=null; pushProgress(); },due-Date.now()); }
async function pushProgress(){ if(!user||!progressDirty) return; progressDirty=false; lastProgressSync=Date.now(); try{ applyServerProgress(await api.saveProgress(localProgress())); }catch(e){ progressDirty=true; } }
let lastProgressSync=0, progressSyncing=null;
async function syncProgress(){ if(!user) return; if(progressSyncing) return progressSyncing; lastProgressSync=Date.now();
  progressSyncing=(async()=>{ try{ applyServerProgress(await api.saveProgress(localProgress())); progressDirty=false; }catch(e){ /* SQL not installed yet, or offline: local progress still works */ } finally{ progressSyncing=null; } })();
  return progressSyncing; }
document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&user&&Date.now()-lastProgressSync>2000) syncProgress(); });
addEventListener("pageshow",e=>{ if(e.persisted&&user) syncProgress(); });
document.addEventListener("visibilitychange",()=>{ if(document.hidden&&user&&progressDirty){ progressDirty=false; clearTimeout(progressTimer); api.saveProgressOnExit(localProgress()); } });

const owlOn=()=>{ try{ return LS.get("nl-owl")!=="off"; }catch(e){ return true; } };
const myTimeZone=()=>{ try{ return Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC"; }catch(e){ return "UTC"; } };
function owlLeaving(){ if(user&&owlOn()&&myHabits.length) api.owlSchedule(myTimeZone()); }
function owlBack(){ if(user) api.owlCancel().catch(()=>{}); }
document.addEventListener("visibilitychange",()=>{ document.hidden?owlLeaving():owlBack(); });
addEventListener("pagehide",owlLeaving);
const _sfxBuf={}, _lastSfx={}; let _sfxLoading=null;
const sfxCtx=()=>window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)());
function loadSfx(){
  if(_sfxLoading) return _sfxLoading;
  const ac=sfxCtx();
  _sfxLoading=Promise.all(Object.entries(UI_SFX).map(([k,u])=>new Promise(res=>{
    try{ const bin=Uint8Array.from(atob(u.split(",")[1]),c=>c.charCodeAt(0)); ac.decodeAudioData(bin.buffer,buf=>{ _sfxBuf[k]=buf; res(); },()=>res()); }catch(e){ res(); }
  })));
  return _sfxLoading;
}
function sfx(name){
  if(!uiSoundOn()||document.hidden) return;
  const now=Date.now(); if(now-(_lastSfx[name]||0)<120) return; _lastSfx[name]=now;   // a burst of messages = one ping, not a machine gun
  try{
    const ac=sfxCtx(); if(ac.state==="suspended") ac.resume();
    const buf=_sfxBuf[name]; if(!buf){ loadSfx(); return; }
    const src=ac.createBufferSource(), g=ac.createGain(); src.buffer=buf; g.gain.value=UI_VOL[name]||.25;
    src.connect(g); g.connect(ac.destination); src.start();
  }catch(e){}
}
// iOS: follow the ring/silent switch like a normal app; decode + unlock audio on the very first touch
try{ if(navigator.audioSession) navigator.audioSession.type="ambient"; }catch(e){}
/* iPhone: "ambient" (follow the silent switch) also blocks the mic ("AudioSession category is not compatible with
   audio capture"). So switch to "auto" while a call or voice recording needs the mic, and back to ambient after. */
function audioForCapture(on){ try{ if(navigator.audioSession) navigator.audioSession.type=on?"auto":"ambient"; }catch(e){} }
["pointerdown","keydown"].forEach(ev=>addEventListener(ev,()=>{ try{ loadSfx(); const ac=sfxCtx(); if(ac.state==="suspended") ac.resume(); }catch(e){} },{once:true,passive:true,capture:true}));
// switches and home tabs get a small tactile click
document.addEventListener("click",e=>{
  const t=e.target.closest&&e.target.closest('[role="switch"],#fxBtn,#uiSoundBtn,#owlBtn,#buzzBtn,.segmented button,#tabChats,#tabLanes,#tabDms,#tabContacts');
  if(!t) return;
  sfx(t.matches('#tabChats,#tabLanes,#tabDms,#tabContacts')?"tab":"toggle");
},true);

/* ================= PROFILE ================= */
function paintFxSettings(){
  $("fxBtn").textContent="Screen effects: "+(fxEnabled()?"On":"Off");
  $("animPrefBtn").textContent="🎞️ Animations: "+motionName();
  paintA11y();
  $("uiSoundBtn").textContent="Sounds: "+(uiSoundOn()?"On":"Off");
  $("buzzBtn").textContent="📳 Vibrate on messages: "+(buzzOn()?"On":"Off"); show($("buzzBtn"),!!navigator.vibrate);
  $("owlBtn").textContent="🦉 Night Owl reminders: "+(owlOn()?"On":"Off");
  const ul=$("fxList"); if(ul.children.length) return;
  FX_TRIGGERS.forEach(t=>{ const li=el("li"); li.append(el("b","",t.label+": ")); li.append([...t.words.map(w=>`"${w}"`),...t.emoji].join(", ")); ul.append(li); });
}
function paintA11y(){
  const box=$("tsPick"); box.innerHTML="";
  TEXT_SIZES.forEach(([k,name],i)=>{
    const b=el("button","ghost",["A−","A","A+","A++"][i]); b.type="button"; b.setAttribute("role","radio"); b.setAttribute("aria-checked",String(textSize()===k)); b.setAttribute("aria-label","Text size: "+name); b.title=name;
    b.onclick=()=>{ try{ LS.set("nl-textsize",k); }catch(e){} applyA11y(); paintA11y(); say("profMsg",`Text size: ${name}. Messages, the typing box, and your chat list use it.`); };
    box.append(b);
  });
  $("cbBtn").textContent="🎨 Color-blind friendly: "+(cbMode()?"On":"Off");
}
$("cbBtn").onclick=()=>{ try{ LS.set("nl-cb",cbMode()?"off":"on"); }catch(e){} applyA11y(); paintA11y();
  say("profMsg",cbMode()?"Color-blind friendly is on: online is a solid blue dot, away is a hollow orange ring, and do not disturb is an orange-red dot with a white bar.":"Color-blind friendly is off."); };
$("fxBtn").onclick=()=>{ try{ LS.set("nl-fx",fxEnabled()?"off":"on"); }catch(e){} paintFxSettings(); if(fxEnabled()) FX.play("confetti"); };
$("uiSoundBtn").onclick=()=>{ try{ LS.set("nl-uisound",uiSoundOn()?"off":"on"); }catch(e){} paintFxSettings(); };
/* While NightLane is open on screen you already get its in-app pop-ups, so the phone's own notification is a duplicate.
   Off by default; this setting is handed to the background notification worker. */
const dupOn=()=>{ try{ return LS.get("nl-dup-notif")==="on"; }catch(e){ return false; } };
function tellSwPrefs(){ const msg={type:"nl-prefs",bothWhileOpen:dupOn()}; try{ navigator.serviceWorker?.controller?.postMessage(msg); }catch(e){} navigator.serviceWorker?.ready.then(r=>{ try{ r.active?.postMessage(msg); }catch(e){} }).catch(()=>{}); }
function paintDup(){ $("dupBtn").textContent=`📲 Phone notifications while NightLane is open: ${dupOn()?"On":"Off"}`; }
/* Mark every chat as read in one tap: clears the unread numbers, the app icon number and any phone notifications */
$("markAllRead").onclick=async()=>{
  const btn=$("markAllRead"), rows=inboxRows.filter(r=>+r.unread>0); if(!rows.length){ show(btn,false); return; }
  btn.disabled=true; btn.textContent="Marking…";
  const res=await Promise.allSettled(rows.map(r=>api.markRead(r.code)));
  rows.forEach((r,i)=>{ if(res[i].status==="fulfilled") r.unread=0; });
  try{ const reg=swReg||await navigator.serviceWorker?.getRegistration(); (await reg?.getNotifications()||[]).forEach(n=>n.close()); }catch(e){}
  setIconBadge(0); btn.disabled=false; btn.textContent="✓ Mark all as read";
  const failed=res.filter(x=>x.status==="rejected").length;
  toast(failed?"Some chats didn't update":"✓ All caught up",failed?"Check your connection and try again.":"Every chat is marked as read.");
  loadInbox();
};
$("dupBtn").onclick=()=>{ try{ LS.set("nl-dup-notif",dupOn()?"off":"on"); }catch(e){} paintDup(); tellSwPrefs(); };
paintDup(); tellSwPrefs();
$("buzzBtn").onclick=()=>{ try{ LS.set("nl-buzz",buzzOn()?"off":"on"); }catch(e){} paintFxSettings(); if(buzzOn()) buzz("message"); };
$("owlBtn").onclick=()=>{ try{ LS.set("nl-owl",owlOn()?"off":"on"); }catch(e){} if(!owlOn()) owlBack(); paintFxSettings();
  say("profMsg",owlOn()?"🦉 If you close the app with habits left, the Night Owl will DM you (evenings only, once a day).":"Night Owl reminders are off on this device."); };
const openProfile=()=>{ say("profMsg",""); paintPresenceDiag(); paintNotif(); paintBlocked(); paintFxSettings(); fillBirthdayPicker(); paintSecrets(); paintLangPicker(); paintDND(); paintArcanaBadge(); paintMySignal(); paintQuizTab(); paintMeTab(); show($("profile")); $("closeProfile").focus({preventScroll:true}); };
function paintDND(){ const on=dndOn(); $("dndSwitch").classList.toggle("on",on); $("dndSwitch").setAttribute("aria-checked",String(on)); $("dndRow").classList.toggle("on",on); }
$("dndSwitch").onclick=()=>{ setDND(!dndOn()); paintDND(); if(user) applyStatusDot($("meFace"),user.id,meProfile); };
$("openProfile1").onclick=openProfile; $("openProfile2").onclick=openProfile; $("meFace").onclick=openProfile;
$("joinToggle").onclick=()=>{ const open=$("joinPanel").classList.contains("hidden"); show($("joinPanel"),open); $("joinToggle").setAttribute("aria-expanded",String(open)); $("joinToggle").textContent=open?"✕":"＋"; if(open) setTimeout(()=>$("room").focus(),60); };
$("closeProfile").onclick=()=>show($("profile"),false);
$("changePhoto").onclick=()=>$("avatarPicker").click();
$("profFace").onclick=()=>$("avatarPicker").click();
$("xpMore").onclick=()=>{ const box=$("xpMore").closest(".xpbox"), on=!box.classList.contains("open"); box.classList.toggle("open",on); $("xpMore").setAttribute("aria-expanded",String(on)); $("xpMore").textContent=on?"How to earn XP ▴":"How to earn XP ▾"; }; $("profFace").title="Change photo";
/* ===== Profile tabs: Me · Look · Alerts · Account (remembers your last one) ===== */
const PROF_TABS=["me","look","quiz","alerts","account"];
function profTab(name){
  if(!PROF_TABS.includes(name)) name="me";
  document.querySelectorAll(".proftabs [data-tab]").forEach(b=>{ const on=b.dataset.tab===name; b.setAttribute("aria-selected",String(on)); b.tabIndex=on?0:-1; });
  document.querySelectorAll(".profpane").forEach(p=>{ p.hidden=p.dataset.pane!==name; });
  try{ LS.set("nl-prof-tab",name); }catch(e){}
}
document.querySelectorAll(".proftabs [data-tab]").forEach(b=>{
  b.id="proftab-"+b.dataset.tab; b.setAttribute("aria-controls","profpane-"+b.dataset.tab);
  b.onclick=()=>{ profTab(b.dataset.tab); const sh=$("profile").querySelector(".sheetbody"), t=document.querySelector(".proftabs"); if(sh&&t.getBoundingClientRect().top<sh.getBoundingClientRect().top+4) sh.scrollTop=t.offsetTop-sh.offsetTop-36; };
  b.onkeydown=e=>{ const i=PROF_TABS.indexOf(b.dataset.tab), d=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0; if(!d) return; e.preventDefault(); const n=PROF_TABS[(i+d+PROF_TABS.length)%PROF_TABS.length]; profTab(n); $("proftab-"+n).focus(); };
});
document.querySelectorAll(".profpane").forEach(p=>{ p.id="profpane-"+p.dataset.pane; p.setAttribute("aria-labelledby","proftab-"+p.dataset.pane); });
profTab((()=>{ try{ return LS.get("nl-prof-tab"); }catch(e){ return null; } })()||"me");
/* "Sounds: On" style buttons become switches. The old code still just sets the text; we redraw it. */
function drawSetRow(btn){
  const m=(btn.textContent||"").match(/^(.*\S)\s*:\s*(.+)$/); if(!m) return;
  const lab=m[1], val=m[2].trim(), bool=val==="On"||val==="Off";
  btn.classList.add("setrow"); btn.classList.toggle("on",val==="On");
  btn.replaceChildren(el("span","sr-lab",lab), bool?el("span","swi"):el("span","sval",val));
  if(bool){ btn.setAttribute("role","switch"); btn.setAttribute("aria-checked",String(val==="On")); btn.setAttribute("aria-label",lab); }
  else { btn.removeAttribute("role"); btn.removeAttribute("aria-checked"); btn.setAttribute("aria-label",lab+": "+val); }
}
["fxBtn","uiSoundBtn","buzzBtn","dupBtn","owlBtn","cbBtn","animPrefBtn","lofiBtn"].forEach(id=>{
  const b=$(id); if(!b) return; drawSetRow(b);
  new MutationObserver(()=>drawSetRow(b)).observe(b,{childList:true,characterData:true,subtree:true});
});
/* ✂️ Crop your profile photo before it's saved: drag to move, pinch / slide to zoom. The circle shows how it looks. */
/* Also crops the profile-card banner (a wide 3:1 frame), with a live preview of how friends will see it. */
const crop={img:null,x:0,y:0,z:1,base:1,box:280,bw:280,bh:280,mode:"avatar",ptrs:new Map(),pinch:null,done:null,urls:[],pvUrl:null,pvT:0};
function cropClamp(){ const s=crop.base*crop.z, w=crop.img.naturalWidth*s, h=crop.img.naturalHeight*s;
  crop.x=Math.min(0,Math.max(crop.bw-w,crop.x)); crop.y=Math.min(0,Math.max(crop.bh-h,crop.y)); }
function cropPaint(){ cropClamp(); $("cropImg").style.transform=`translate(${crop.x}px,${crop.y}px) scale(${crop.base*crop.z})`; cropPreviewSoon(); }
function cropFit(){   // fill the frame and center the picture
  const im=crop.img; crop.z=1; $("cropZoom").value=1;
  crop.base=Math.max(crop.bw/im.naturalWidth,crop.bh/im.naturalHeight);
  crop.x=(crop.bw-im.naturalWidth*crop.base)/2; crop.y=(crop.bh-im.naturalHeight*crop.base)/2; cropPaint(); }
function cropCanvas(maxW){   // what's inside the frame, as a canvas
  const s=crop.base*crop.z, sw=crop.bw/s, sh=crop.bh/s, c=document.createElement("canvas");
  c.width=Math.max(1,Math.min(maxW,Math.round(sw))); c.height=Math.max(1,Math.round(c.width*crop.bh/crop.bw));
  c.getContext("2d").drawImage(crop.img,-crop.x/s,-crop.y/s,sw,sh,0,0,c.width,c.height); return c; }
function cropPreviewSoon(){ clearTimeout(crop.pvT); crop.pvT=setTimeout(cropPreview,90); }
function cropPreview(){
  if(!crop.img||$("cropSheet").classList.contains("hidden")) return;
  cropCanvas(crop.mode==="banner"?480:200).toBlob(b=>{ if(!b) return;
    if(crop.pvUrl) URL.revokeObjectURL(crop.pvUrl); const u=crop.pvUrl=URL.createObjectURL(b), box=$("cropPrevBody"); box.innerHTML="";
    if(crop.mode==="banner"){   // the real card: your banner, your effect + stickers, your picture on top
      const wrap=el("div","cardprev"), ban=el("div","pcard-banner"), face=el("div","face lg"); wrap.append(ban,face); box.append(wrap);
      const c=cleanCard(draftCard)||{fx:null,stk:[]}; paintCardBanner(ban,{...c,banner:"img",img:u,stk:c.stk||[]}); paintFace(face,meProfile);
    } else if(crop.mode==="room"){   // the room picture: big in settings, small next to the room name and in your chat list
      const row=el("div","pv-faces"), big=el("div","hash pic"); big.style.cssText="width:64px;height:64px"; big.append(roomIconEl(u,"roomicon big"));
      const lab=el("span","pv-roomname"); lab.append(roomIconEl(u),document.createTextNode(roomName||"#"+(room||"room"))); row.append(big,lab); box.append(row);
    } else {   // your picture at the sizes friends see it
      const row=el("div","pv-faces"); [["face lg"],["face"],["face sm"]].forEach(([k])=>{ const f=el("div",k); paintFace(f,{...meProfile,avatar_url:u}); row.append(f); }); box.append(row);
    }
  },"image/jpeg",.85);
}
function cropZoomTo(z,cx=crop.bw/2,cy=crop.bh/2){   // zoom around a point so it stays under your finger
  z=Math.min(4,Math.max(1,z)); const s0=crop.base*crop.z, s1=crop.base*z;
  crop.x=cx-(cx-crop.x)*s1/s0; crop.y=cy-(cy-crop.y)*s1/s0; crop.z=z; $("cropZoom").value=z; cropPaint(); }
function openCrop(file,mode="avatar"){
  return new Promise(async(resolve,reject)=>{
    try{
      crop.mode=mode; const wide=mode==="banner";
      $("cropBox").classList.toggle("wide",wide); document.querySelector("#cropSheet .cropzoom").classList.toggle("wide",wide);
      $("cropTitle").textContent=wide?"Crop your banner":mode==="room"?"Crop the room picture":"Crop your photo"; $("cropSave").textContent=wide?"Use this banner":mode==="room"?"Use this picture":"Save photo";
      const url=URL.createObjectURL(await readableImage(file)), im=$("cropImg"); crop.urls=[url];
      await new Promise((ok,bad)=>{ im.onload=ok; im.onerror=()=>bad(new Error("couldn't open that photo")); im.src=url; });
      show($("cropSheet"));
      crop.img=im; crop.bw=$("cropBox").clientWidth||280; crop.bh=$("cropBox").clientHeight||crop.bw; crop.box=crop.bw; cropFit();
      crop.done=(blob)=>{ crop.done=null; crop.urls.forEach(u=>URL.revokeObjectURL(u)); crop.urls=[]; if(crop.pvUrl){ URL.revokeObjectURL(crop.pvUrl); crop.pvUrl=null; } show($("cropSheet"),false); resolve(blob); };
    }catch(err){ reject(err); }
  });
}
$("cropRotate").onclick=()=>{   // turn the picture a quarter turn clockwise
  const im=crop.img; if(!im) return; const c=document.createElement("canvas"); c.width=im.naturalHeight; c.height=im.naturalWidth;
  const g=c.getContext("2d"); g.translate(c.width,0); g.rotate(Math.PI/2); g.drawImage(im,0,0);
  c.toBlob(b=>{ if(!b) return; const u=URL.createObjectURL(b); crop.urls.push(u); im.onload=()=>{ im.onload=null; cropFit(); }; im.src=u; },"image/jpeg",.92);
};
$("cropZoom").oninput=e=>cropZoomTo(+e.target.value);
$("cropBox").addEventListener("pointerdown",e=>{ $("cropBox").setPointerCapture(e.pointerId); crop.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); crop.pinch=null; });
$("cropBox").addEventListener("pointermove",e=>{
  const p=crop.ptrs.get(e.pointerId); if(!p) return;
  if(crop.ptrs.size===1){ crop.x+=e.clientX-p.x; crop.y+=e.clientY-p.y; cropPaint(); }
  crop.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(crop.ptrs.size===2){ const [a,b]=[...crop.ptrs.values()], d=Math.hypot(a.x-b.x,a.y-b.y), r=$("cropBox").getBoundingClientRect();
    if(crop.pinch) cropZoomTo(crop.z*d/crop.pinch,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top); crop.pinch=d; }
});
["pointerup","pointercancel"].forEach(t=>$("cropBox").addEventListener(t,e=>{ crop.ptrs.delete(e.pointerId); crop.pinch=null; }));
$("cropBox").addEventListener("wheel",e=>{ e.preventDefault(); const r=$("cropBox").getBoundingClientRect(); cropZoomTo(crop.z*(e.deltaY<0?1.1:1/1.1),e.clientX-r.left,e.clientY-r.top); },{passive:false});
$("cropSave").onclick=()=>{ cropCanvas(crop.mode==="banner"?960:400).toBlob(b=>crop.done&&crop.done(b),"image/jpeg",.88); };
$("cropCancel").onclick=()=>crop.done&&crop.done(null);
$("cropSheet").addEventListener("click",e=>{ if(e.target.id==="cropSheet") crop.done&&crop.done(null); });
$("avatarPicker").onchange=async e=>{
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  if(f.size>15e6) return say("profMsg","That photo is over 15 MB. Pick a smaller one.",true);
  let cropped;
  try{ cropped=await openCrop(f); }catch(err){ return say("profMsg","Couldn't open that photo: "+err.message,true); }
  if(!cropped) return say("profMsg","");   // cancelled
  $("changePhoto").disabled=true; say("profMsg","Uploading…");
  try{
    const url=await api.upload("avatars",user.id,cropped);
    await api.setAvatar(user.id,url);
    meProfile={...meProfile,avatar_url:url}; cache.set(user.id,meProfile); paintMe(); repaintFaces(user.id);
    say("profMsg","Photo saved.");
  }catch(err){ say("profMsg","Upload failed: "+err.message,true); }
  finally{ $("changePhoto").disabled=false; }
};
$("logout").onclick=async()=>{ $("logout").disabled=true; await pushOff().catch(()=>{}); await api.signOut(); $("logout").disabled=false; };
$("deleteAccount").onclick=async()=>{
  const typed=prompt("This permanently deletes your account, profile, and every message you've sent. Type DELETE to confirm.");
  if(typed!=="DELETE") return say("profMsg","Account not deleted.");
  say("profMsg","Deleting…");
  try{ await pushOff().catch(()=>{}); await api.deleteAccount(); }
  catch(err){ say("profMsg","Couldn't delete: "+err.message,true); }
};
function paintBlocked(){
  const list=$("blockedList"); list.innerHTML="";
  show($("blockedTitle"),blocked.size>0);
  for(const uid of blocked){
    const row=el("div","member"); const f=el("span","face"); paintFace(f,cache.get(uid));
    const n=el("span","mname",nameOf(uid)); const b=el("button","unblock","Unblock"); b.type="button";
    b.onclick=async()=>{ try{ await api.unblock(uid); blocked.delete(uid); paintBlocked(); if(room) renderAll(); }catch(err){ say("profMsg",err.message,true); } };
    row.append(f,n,b); list.append(row);
  }
}

/* ================= ROOMS ================= */
$("roomCard").addEventListener("submit",e=>{ e.preventDefault(); enterRoom($("room").value); });
$("randomRoom").onclick=()=>{ show($("joinPanel")); $("joinToggle").setAttribute("aria-expanded","true"); $("joinToggle").textContent="✕";
  const a=new Uint8Array(6); crypto.getRandomValues(a);
  $("room").value="room-"+[...a].map(b=>"abcdefghjkmnpqrstuvwxyz23456789"[b%31]).join("");
  say("roomMsg","Making your room…");
  enterRoom($("room").value);   // one tap: make it and go straight in (then use Room to invite or add friends)
};

let enterSeq=0;   // every room-open gets a ticket; if you tap another room mid-load, the older one stops
async function enterRoom(code,token){
  const target=(code||"").trim().toLowerCase(); if(!target||!user) return;
  const seq=++enterSeq;
  $("jumpBtn").disabled=true; say("roomMsg","Checking the room…");
  let result;
  try{ result=await api.joinRoom(target,token); if(seq!==enterSeq) return; }
  catch(err){
    if(seq!==enterSeq) return;
    ["chat","roomSheet","msgMenu"].forEach(id=>show($(id),false)); show($("front")); show($("roomCard"));
    $("jumpBtn").disabled=false;
    if(isNetworkError(err)){ if($("room").value.startsWith("dm-")) $("room").value=""; say("roomMsg",""); offlineNotice(); paintOffline(); return; }
    show($("joinPanel")); $("joinToggle").setAttribute("aria-expanded","true"); $("joinToggle").textContent="✕";
    say("roomMsg", err.message==="private" ? "That room is private. Ask someone inside for an invite link." : "Couldn't join: "+err.message, true);
    return;
  }
  $("jumpBtn").disabled=false; say("roomMsg","");
  if(unsub){unsub();unsub=null;}
  room=target; roomOwner=null; roomName=null; setTimeout(()=>{ if(typeof pushPresence==="function") pushPresence(); if(typeof paintTermBar==="function") paintTermBar(); if(typeof paintPresence==="function") paintPresence(); },50);
  if(!room.startsWith("dm-")){ try{ LS.set("nl-room",room); }catch(e){} }
  show($("joinPanel"),false); $("joinToggle").setAttribute("aria-expanded","false"); $("joinToggle").textContent="＋";
  show($("front"),false); show($("chat")); $("roomLabel").textContent="# "+room; $("status").textContent="Connecting…";
  msgs.length=0; byId.clear(); elById.clear(); claimed.clear(); contextById.clear(); reactionsById.clear(); members.clear(); pollsById.clear(); pins.clear(); gamesById.clear(); closeGame(); pinCursor=0; paintPinBar(); setRoomBackground(null); closeTray(); hideMentions();
  typers.forEach(v=>clearTimeout(v.timer)); typers.clear(); paintTyping(); clearReply(); feed.innerHTML=""; newPillClear();
  try{
    const [latest,mem,info,pinRows]=await Promise.all([api.loadLatest(room),api.members(room).catch(()=>[]),api.roomInfo(room).catch(()=>null),api.pins(room).catch(()=>[])]);
    if(seq!==enterSeq) return;
    roomOwner=info?.owner||null; isDm=!!info?.is_dm; dmUser=null; disappear=+info?.disappear_seconds||0; delete $("catchUp").dataset.dismissed; show($("catchUp"),false); translations.clear(); showOriginal.clear(); loadTasks();
    show($("callBtn"), true);   // DMs: 1:1 call, rooms: group call
    $("callPickVoice").textContent=isDm?"🎧 Voice call":"🎧 Group voice call"; $("callPickVideo").textContent=isDm?"📹 Video call":"📹 Group video call";
    if(isDm){ dmUser=(mem.find(x=>x.user_id!==user.id)||{}).user_id||null; await ensureProfiles([dmUser].filter(Boolean)); if(seq!==enterSeq) return; }
    myNotify=(mem.find(x=>x.user_id===user.id)||{}).notify||"all";
    if(info&&!info.is_dm){ if(info.icon_url) roomIcons.set(room,info.icon_url); else roomIcons.delete(room); }
    if(info?.lane&&!laneByRoom.has(room)) await loadLanes().catch(()=>{});   // a side chat we haven't seen yet
    setRoomName(info?.name); setRoomBackground(info?.background); loadDmStyle();
    closeRoomNotifications(room);
    pinRows.forEach(p=>pins.set(p.message_id,p));
    mem.forEach(setMember);
    hasMore=latest.length>=PAGE;
    await addMessages(latest);
    if(seq!==enterSeq) return;
    updateCatchUp(); scheduleExpiry(); checkMissedSecret();
    await loadPinnedContext(); paintPinBar(); seasonalCheck("room");
    if(seq!==enterSeq) return;
    if(result==="created"&&!latest.length) feed.innerHTML='<p class="empty">You made a new private room. Tap Room to name it and invite friends.</p>';
    markReadSoon();
    paintDailyBar();
    unsub=api.subscribe(room,roomHandlers={
      msg:m=>{ stopTyping(m.user_id); m._live=Date.now(); addMessages([m]).then(()=>{ if(m.user_id!==user.id) markReadSoon(); }); },
      msgGone:removeMessage,
      msgEdited:applyEdit,
      profile:p=>{ const old=cache.get(p.id); cache.set(p.id,p); repaintFaces(p.id); if(personUid===p.id&&!$("personSheet").classList.contains("hidden")) paintPerson(); if(p.id===user.id){meProfile=p;paintMe();} if(old?.bubble_color!==p.bubble_color) renderAll(false); paintReceipts(); },
      member:setMember,
      roomUpdated:r=>{ if(r.icon_url!==undefined){ if(r.icon_url) roomIcons.set(r.code,r.icon_url); else roomIcons.delete(r.code); loadInboxSoon(); } if(r.code!==room) return; if(r.name!==undefined) setRoomName(r.name); else paintRoomIcon(); if(r.background!==undefined) setRoomBackground(r.background); if(r.owner!==undefined) roomOwner=r.owner; if(r.disappear_seconds!==undefined){ disappear=+r.disappear_seconds||0; paintDisappear(); } },
      task:p=>{ if(p.eventType==="DELETE"){ tasks.delete(p.old.id); } else tasks.set(p.new.id,p.new); paintTasks(); },
      game:g=>{ const prev=gamesById.get(g.message_id); gamesById.set(g.message_id,g); refreshMsg(g.message_id); if(openGameId===g.message_id) paintGame(prev);
        const wasPinned=pins.has(g.message_id);
        if(!sb&&g.status==="done"&&pins.get(g.message_id)?.auto){ pins.delete(g.message_id); pinCursor=0; }   // the server does this itself
        if(wasPinned) paintPinBar(); },
      vote:(v,added)=>{ const p=pollsById.get(v.message_id); if(!p) return; setVote(p,v,added); refreshMsg(v.message_id); },
      pin:async(p,added)=>{ if(added){ if(p.room&&p.room!==room) return; pins.set(p.message_id,p); await loadPinnedContext(); } else { if(!pins.has(p.message_id)) return; pins.delete(p.message_id); } pinCursor=0; paintPinBar(); if(!$("roomSheet").classList.contains("hidden")) paintPins(); },
      memberGone:uid=>{
        if(uid===user.id){ exitRoom(); say("roomMsg",`You're no longer in # ${room||"that room"}.`,true); return; }
        members.delete(uid); paintReceipts(); if(!$("roomSheet").classList.contains("hidden")) paintMembers();
      },
      reaction:(r,added)=>{ if(!byId.has(r.message_id)) return; setReaction(r,added); refreshMsg(r.message_id); },
      typing:onTyping,
      hifive:onHifiveSignal,
      dmstyle:p=>onDmStyleSignal(p),
      status:s=>{ const was=liveStatus; liveStatus=s; $("status").textContent=navigator.onLine===false?"Offline · will reconnect":s; if(s==="Live"&&was&&was!=="Live") catchUp("reconnected"); }
    });
  }catch(err){ $("status").textContent="Can't load messages. Check your Supabase setup."; }
}

function exitRoom(){
  if(rec) finishRecording(false); closeTray(); hideMentions();
  show($("hereBar"),false); show($("dmPresence"),false);
  setTimeout(()=>{ if(typeof pushPresence==="function") pushPresence(); },50);
  sendTyping(false); if(unsub){unsub();unsub=null;}
  clearPending(); clearReply();
  ["chat","roomSheet","msgMenu"].forEach(id=>show($(id),false)); show($("front")); show($("roomCard"));
  room=""; isDm=false; dmUser=null; clearDmStyle(); loadInbox(); if(typeof paintTermBar==="function") paintTermBar();
  show($("callBtn"), false);
}
$("back").onclick=exitRoom;

/* ---------- messages ---------- */
function setReaction(r,added){
  let map=reactionsById.get(r.message_id); if(!map) reactionsById.set(r.message_id,map=new Map());
  let set=map.get(r.emoji); if(!set) map.set(r.emoji,set=new Set());
  added?set.add(r.user_id):set.delete(r.user_id);
  if(!set.size) map.delete(r.emoji);
  if(typeof whoFor!=="undefined"&&whoFor?.id===r.message_id&&!$("rxSheet").classList.contains("hidden")) queueMicrotask(paintWhoReacted);
}

async function addMessages(list){
  const unique=new Map(); list.forEach(m=>{ if(!byId.has(m.id)&&!claimed.has(m.id)) unique.set(m.id,m); });
  list=[...unique.values()]; if(!list.length) return;
  list.forEach(m=>claimed.add(m.id));
  const replyIds=list.map(m=>m.reply_to).filter(id=>id&&!byId.has(id)&&!contextById.has(id));
  await ensureProfiles(list.map(m=>m.user_id));
  (await api.reactions(list.map(m=>m.id)).catch(()=>[])).forEach(r=>setReaction(r,true));
  await loadPolls(list); await loadGames(list);
  for(const id of [...new Set(replyIds)]){ const r=await api.fetchMessage(id).catch(()=>null); if(r){ contextById.set(r.id,r); await ensureProfiles([r.user_id]); } }
  if(!list.every(m=>claimed.has(m.id))) return;   // room changed while loading
  const appendOnly = msgs.length===0 || list.every(m=>m.created_at>=msgs[msgs.length-1].created_at);
  for(const m of list){ claimed.delete(m.id); if(byId.has(m.id)) continue; byId.set(m.id,m); msgs.push(m); }
  msgs.sort((a,b)=>a.created_at<b.created_at?-1:a.created_at>b.created_at?1:0);
  if(appendOnly && feed.querySelector(".msg,.empty,.older")) list.forEach(appendEl);
  else { renderAll(); list.forEach(m=>playFx(m)); }   // first message in an empty chat still gets its effect/secret (playFx skips anything older than 15s)
}

function visible(m){ return !blocked.has(m.user_id); }

function renderAll(keepBottom=true){
  const prevH=feed.scrollHeight, prevTop=feed.scrollTop;
  feed.innerHTML=""; elById.clear();
  if(hasMore){ const b=el("button","older","Load older messages"); b.type="button"; b.onclick=loadOlder; feed.append(b); }
  let lastDay=null, n=0;
  for(const m of msgs){
    if(!visible(m)) continue;
    const k=dayKey(m.created_at);
    if(k!==lastDay){ feed.append(el("div","daybreak",dayLabel(m.created_at))); lastDay=k; }
    const node=buildMsg(m,n++); elById.set(m.id,node); feed.append(node);
  }
  if(!n && !hasMore) feed.append(el("p","empty","Nobody has said anything here yet. Start it off."));
  paintReceipts();
  feed.scrollTop = keepBottom ? feed.scrollHeight : feed.scrollHeight-prevH+prevTop;
}

function appendEl(m){
  if(!visible(m)) return;
  const stick=feed.scrollHeight-feed.scrollTop-feed.clientHeight<150||m.user_id===user?.id;   // at the bottom already, or it's your own message
  feed.querySelector(".empty")?.remove();
  const prev=[...elById.keys()].map(id=>byId.get(id)).filter(Boolean).pop();
  if(!prev || dayKey(prev.created_at)!==dayKey(m.created_at)) feed.append(el("div","daybreak",dayLabel(m.created_at)));
  const node=buildMsg(m,elById.size); elById.set(m.id,node); feed.append(node);
  paintReceipts();
  if(stick) feed.scrollTop=feed.scrollHeight; else newPillAdd();
  if(m.user_id!==user.id&&myLang()) translateMsg(m);
  if(m.expires_at) scheduleExpiry();
  playFx(m);
  if(m.user_id!==user.id && Date.now()-new Date(m.created_at)<15000){ sfx("receive"); buzz("chat"); }
}

let loadingOlder=false;
async function loadOlder(){
  if(!msgs.length||loadingOlder) return;
  const code=room, seq=enterSeq, stillHere=()=>room===code&&enterSeq===seq;   // switched chats mid-load? drop it
  loadingOlder=true;
  const btn=feed.querySelector(".older"); if(btn){ btn.disabled=true; btn.textContent="Loading…"; }
  try{
    const older=await api.loadBefore(code,msgs[0].created_at); if(!stillHere()) return;
    hasMore=older.length>=PAGE;
    const fresh=older.filter(m=>!byId.has(m.id)&&m.room===code);
    await ensureProfiles(fresh.map(m=>m.user_id)); if(!stillHere()) return;
    const rx=await api.reactions(fresh.map(m=>m.id)).catch(()=>[]); if(!stillHere()) return;
    rx.forEach(r=>setReaction(r,true));
    await loadPolls(fresh); await loadGames(fresh); if(!stillHere()) return;
    fresh.forEach(m=>{ byId.set(m.id,m); msgs.push(m); });
    msgs.sort((a,b)=>a.created_at<b.created_at?-1:1);
    renderAll(false);
  }catch(e){ if(stillHere()&&btn){ btn.disabled=false; btn.textContent=isNetworkError(e)?"You're offline. Tap to try again":"Couldn't load. Try again"; } }
  finally{ loadingOlder=false; }
}

function refreshMsg(id){
  const old=elById.get(id), m=byId.get(id); if(!old||!m) return;
  const node=buildMsg(m,old.classList.contains("t1")?0:old.classList.contains("t2")?1:2, true);
  old.replaceWith(node); elById.set(id,node); paintReceipts();
}
function removeMessage(id){
  if(!byId.has(id)) return;
  const i=msgs.findIndex(m=>m.id===id); if(i>=0) msgs.splice(i,1);
  byId.delete(id); reactionsById.delete(id);
  if(replyTo?.id===id) clearReply();
  if(menuMsg?.id===id) show($("msgMenu"),false);
  renderAll(false);
}

function buildMsg(m,index,noAnim){
  if(m.kind==="notice"){ const n=el("div","notice-line"); n.dataset.t=new Date(m.created_at).getTime(); n.dataset.id=m.id; n.append(el("span","",noticeText(m))); return n; }
  const p=cache.get(m.user_id)||{username:"Unknown"}, mine=m.user_id===user.id;
  const at=new Date(m.created_at), fresh=!mine&&Date.now()-at<15000;
  const node=el("div","msg t"+(index%3)+(mine?" me":"")+(m.kind==="sticker"?" sticker-msg":"")+(isShiny(m)?" shiny":"")); node.dataset.t=at.getTime(); node.dataset.id=m.id;
  const bc=validHex(p.bubble_color); if(bc&&m.kind!=="sticker"){ node.classList.add("custom"); node.style.setProperty("--bub",bc); node.style.setProperty("--bubtext",textOn(bc)); }
  if(!mine&&(m.mentions||[]).includes(user.id)) node.classList.add("mentioned");
  if(noAnim) node.style.animation="none";
  const face=el("div","face"); face.dataset.uid=m.user_id; face.setAttribute("role","button"); face.setAttribute("aria-label",`${nameOf(m.user_id)}'s profile`); face.tabIndex=-1; paintFace(face,p);
  const col=el("div","col");
  const tag=el("div","tag");
  if(fresh&&!noAnim) tag.append(el("b","","NEW"));
  if(pins.has(m.id)) tag.append("📌 ");
  tag.append(`${nameOf(m.user_id)} · ${timeOf(at)}`); if(m.edited_at&&m.kind!=="call"){ const ed=el("span","edited"," · edited"); ed.title="Edited "+new Date(m.edited_at).toLocaleString(); tag.append(ed); }
  const exp=expiryTag(m); if(exp) tag.append(exp);
  const bub=el("div","bubble"); bub.tabIndex=0; bub.setAttribute("role","button"); bub.setAttribute("aria-label",`Message from ${nameOf(m.user_id)}. Open options`);
  if(m.reply_to){
    const r=byId.get(m.reply_to)||contextById.get(m.reply_to), q=el("button","quote"); q.type="button";
    if(r){ q.append(el("b","",nameOf(r.user_id))); q.append(previewOf(r)); q.onclick=e=>{ e.stopPropagation(); jumpTo(r.id); }; }
    else q.append("Original message was deleted");
    bub.append(q);
  }
  const albumUrls=(m.image_urls||[]).map(safeImg).filter(Boolean);
  const img=safeImg(m.image_url);
  if(albumUrls.length>1){
    const cap=Math.min(albumUrls.length,4), grid=el("div","albumgrid n"+cap);
    albumUrls.slice(0,4).forEach((u,i)=>{
      const b=el("button","tile"); b.type="button"; b.setAttribute("aria-label",`Open photo ${i+1} of ${albumUrls.length}`);
      const im=document.createElement("img"); im.src=u; im.alt="Photo from "+p.username; im.loading="lazy";
      b.append(im);
      if(i===3&&albumUrls.length>4) b.append(el("span","more","+"+(albumUrls.length-4)));
      b.onclick=e=>{ e.stopPropagation(); openLightbox(albumUrls,i); };
      grid.append(b);
    });
    if(m.spoiler) makeSpoiler(grid,m.id);
    { const gi=grid.firstChild?.querySelector?.("img"); if(gi) gi.addEventListener("load",()=>{ if(feed.scrollHeight-feed.scrollTop-feed.clientHeight<150+gi.offsetHeight) feed.scrollTop=feed.scrollHeight; }); }   // a photo that just loaded only keeps you at the bottom if you were there
    bub.append(grid);
  } else if(img&&!isBlCard(m)){ const b=el("button","shot"); b.type="button"; b.setAttribute("aria-label","Open photo");
    const i=document.createElement("img"); i.src=img; i.alt="Photo from "+p.username; i.loading="lazy";
    i.onload=()=>{ if(feed.scrollHeight-feed.scrollTop-feed.clientHeight<150+i.offsetHeight) feed.scrollTop=feed.scrollHeight; };
    b.append(i); b.onclick=e=>{ e.stopPropagation(); openLightbox([img],0); }; bub.append(b);
    if(m.spoiler) makeSpoiler(b,m.id); }
  const media=safeImg(m.media_url);
  if(media&&m.media_type==="video"){ const v=document.createElement("video"); v.className="vid"; v.src=media; v.controls=true; v.playsInline=true; v.preload="metadata"; bub.append(v); }
  if(media&&m.media_type==="audio") bub.append(voicePlayer(media,m.media_duration));
  if(media&&(m.media_type==="pdf"||m.kind==="file")) bub.append(pdfCard(media));
  if(m.kind==="sticker"&&STICKERS[m.sticker]) bub.append(stickerEl(m.sticker));
  if(isBlCard(m)){ bub.append(backlogMsgCard(m)); if(typeof m.card.note==="string"&&m.card.note.trim()){ const n=el("div","blnote"); renderTextWithDates(n,m.card.note.slice(0,300),m.mentions,m); bub.append(n); } }
  else if(isEcard(m)) bub.append(ecardMsgCard(m));
  else if(m.kind==="poll") bub.append(pollEl(m));
  else if(m.kind==="game") bub.append(gameCard(m));
  else if(m.kind==="call") bub.append(callLogEl(m));
  else if(m.text){ const t=el("div"); renderTextWithDates(t,m.text,m.mentions,m); annotateTimes(t,m); bub.append(t);
    const pm=m.text.trim().match(/[?!]+$/); if(pm&&(m.kind||"text")==="text"){ const cluster=pm[0]; const marks=cluster.includes("?")&&cluster.includes("!")?"?!":(cluster.includes("?")?"?":"!"); const hasBang=cluster.includes("!"); const p=el("span","punct"+(cluster.length>2?" loud":"")+(hasBang?" bang":""),marks); p.setAttribute("aria-hidden","true"); bub.append(p); } const trb=translationBlock(m); if(trb) bub.append(trb); if(!noAnim||!node.querySelector(".lpcard")) setTimeout(()=>attachPreview(bub,m),0);
    if(/el psy (k|c)ongroo|(^|[^a-z])world ?line([^a-z]|$)/i.test(m.text)&&typeof m.id==="number") bub.append(el("div","d20chip wlchip",`⚗️ world line ${worldLineFor(m)}`));
    if(typeof m.id==="number"&&diceIn(m.text)){ const n=diceIn(m.text), r=dNFor(m,n); { const chip=el("div","d20chip"+(r===n&&n>1?" nat20":r===1&&n>1?" nat1":""),n===2?`🪙 d2 → ${r===1?"heads":"tails"}`:`${DICE_ICON["d"+n]?"":"🎲 "}d${n} → ${r}${r===n&&n>1?" MAX!":""}`); dchipIcon(chip,"d"+n); bub.append(chip); } }
    if(/(^|[^a-z])roll(s|ed|ing)? (a |the |me a )?d20([^a-z0-9]|$)/i.test(m.text)&&typeof m.id==="number"){ const n=d20For(m); const chip=el("div","d20chip"+(n===20?" nat20":n===1?" nat1":""),`d20 → ${n}${n===20?" NAT 20!":n===1?" crit fail":""}`); dchipIcon(chip,"d20"); bub.append(chip); } }
  bub.onclick=e=>{ if(e.target.closest("a,video,.voice,.poll button,.gamecard button,.datechip,.trbox,.blmsg button,.ecard.closed")) return; bubbleTap(bub,m); };
  bub.addEventListener("contextmenu",e=>{ if(e.pointerType==="mouse"||e.button===2){ e.preventDefault(); openMenu(m); } });   // right-click on a computer
  bub.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openMenu(m); } };
  if(m.edited_at&&m.kind!=="sticker"&&m.kind!=="call"){ const en=el("span","ednote",`✏️ ${m.user_id===user?.id?"You":nameOf(m.user_id)} edited this`); en.title="Edited "+new Date(m.edited_at).toLocaleString(); bub.append(en); }
  col.append(tag,bub);
  const map=reactionsById.get(m.id);
  if(map&&map.size){
    const row=el("div","reacts");
    for(const [emoji,set] of map){
      const r=el("button","react"+(set.has(user.id)?" mine":"")); r.type="button";
      r.append(emoji, el("span","",String(set.size)));
      r.setAttribute("aria-label",`${emoji} ${set.size}, ${set.has(user.id)?"remove your reaction":"add reaction"}`);
      r.title=[...set].map(nameOf).join(", ")+" · hold to see who reacted";
      let held=false, t=null;
      const stop=()=>{ clearTimeout(t); t=null; };
      r.addEventListener("pointerdown",e=>{ if(e.button>0) return; held=false; stop(); t=setTimeout(()=>{ held=true; try{ navigator.vibrate?.(15); }catch(_){} openWhoReacted(m,emoji); },450); });
      ["pointerup","pointerleave","pointercancel"].forEach(ev=>r.addEventListener(ev,stop));
      r.addEventListener("contextmenu",e=>{ e.preventDefault(); stop(); held=true; openWhoReacted(m,emoji); });
      r.onclick=()=>{ if(held){ held=false; return; } toggleReaction(m,emoji); };
      row.append(r);
    }
    col.append(row);
  }
  node.append(face,col);
  attachSwipe(node,m); attachLongPress(bub,m);
  if((img||albumUrls.length>1)&&!m.text&&!m.reply_to&&m.kind!=="sticker") node.classList.add("photo-only");
  return node;
}
function jumpTo(id){
  const node=elById.get(id); if(!node) return;
  node.scrollIntoView({behavior:"smooth",block:"center"});
  node.classList.remove("flash"); void node.offsetWidth; node.classList.add("flash");
}
function repaintFaces(uid){ feed.querySelectorAll(`.face[data-uid="${CSS.escape(uid)}"]`).forEach(n=>paintFace(n,cache.get(uid))); }

// Each tap flips what you SEE instantly. Saving happens one step at a time per message+emoji, so fast
// double-taps can't reach the server out of order; whatever's on screen when you stop tapping is what sticks.
const reactSync=new Map();   // "msgId|emoji" -> {want, saved, busy}
function toggleReaction(m,emoji){
  const k=m.id+"|"+emoji, mine=!!reactionsById.get(m.id)?.get(emoji)?.has(user.id);
  const st=reactSync.get(k)||{saved:mine,busy:false}; st.want=!mine; reactSync.set(k,st);
  setReaction({message_id:m.id,user_id:user.id,emoji},st.want); refreshMsg(m.id);
  syncReaction(m,emoji,k);
}
async function syncReaction(m,emoji,k){
  const st=reactSync.get(k); if(!st||st.busy) return;
  st.busy=true;
  try{
    while(st.want!==st.saved){
      const target=st.want;
      if(target){ await api.react(m.id,m.room||room,emoji); gainXP("reaction"); } else await api.unreact(m.id,user.id,emoji);
      st.saved=target;
    }
    reactSync.delete(k);
  }catch(err){
    reactSync.delete(k);
    setReaction({message_id:m.id,user_id:user.id,emoji},st.saved); refreshMsg(m.id);   // show what actually saved
    $("status").textContent=isNetworkError(err)?"You're offline, so that reaction didn't save.":"Reaction didn't save.";
  }finally{ st.busy=false; }
}

/* ---------- more reactions: a big picker + any emoji from your keyboard ---------- */
const EMOJI_GROUPS=[
  ["Smileys","😀 😁 😆 🤣 😊 😇 🙂 😉 😍 🥰 😘 😋 😜 🤪 😎 🤩 🥳 😏 😒 😔 😭 😤 😡 🤯 😳 🥺 😱 🤔 🫡 🤫 🙄 😴 🤤 😵‍💫 🤢 🤮 🤠 👻 💀 🤡 👽 🤖 💩"],
  ["Hearts & hands","❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💔 ❤️‍🔥 💕 💖 💯 ✨ 👏 🙌 🤝 🙏 👌 🤌 ✌️ 🤞 🫶 💪 👀 🫠 🫣 👋 🤙 👊 👎"],
  ["Animals","🐶 🐱 🐭 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐸 🐵 🐔 🐧 🦆 🦉 🦇 🐺 🐴 🦄 🐝 🦋 🐢 🐍 🦖 🐙 🦈 🐬 🐳 🦀"],
  ["Food & drink","🍕 🍔 🍟 🌮 🍜 🍣 🍙 🍡 🍩 🍪 🎂 🍰 🍫 🍿 🍓 🍉 🍌 🍎 🥑 🌶️ ☕ 🧋 🍵 🥤 🍺 🍷"],
  ["Fun & stuff","🎉 🎊 🎁 🏆 🥇 🎮 🕹️ 🎲 🃏 🎵 🎧 🎤 📸 💻 📱 💡 💰 💎 🔮 🗡️ ⚔️ 🛡️ 🚀 🌙 ⭐ 🌈 ☀️ ⚡ 🌊 🌸 🍀 ☠️ 🔔 ⏰ ✅ ❌ ⚠️ 🆒 🆗"],
];
const recentReacts=()=>{ try{ return JSON.parse(LS.get("nl-recent-reacts")||"[]"); }catch(e){ return []; } };
function rememberReact(e){ const r=[e,...recentReacts().filter(x=>x!==e)].slice(0,16); try{ LS.set("nl-recent-reacts",JSON.stringify(r)); }catch(err){} }
function firstEmoji(str){   // the first emoji someone typed (handles skin tones, flags and combined emoji)
  const t=(str||"").trim(); if(!t) return null;
  const g=typeof Intl!=="undefined"&&Intl.Segmenter?[...new Intl.Segmenter(undefined,{granularity:"grapheme"}).segment(t)][0].segment:[...t][0];
  if(!g||g.length>16||/[\sA-Za-z0-9<>/\\:;"'`=&%$@(){}\[\],.!?_+*~^|-]/.test(g)) return null;
  return /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(g)?g:null;
}
let pickFor=null;
function openEmojiPicker(m){
  if(!m) return;
  pickFor=m; say("emojiMsg",""); $("emojiAny").value="";
  const box=$("emojiPick"); box.innerHTML="";
  const groups=[...(recentReacts().length?[["Recent",recentReacts().join(" ")]]:[]),...EMOJI_GROUPS];
  for(const [name,list] of groups){
    box.append(el("h3","",name)); const grid=el("div","emojigrid");
    list.split(" ").filter(Boolean).forEach(e=>{
      const b=el("button",reactionsById.get(m.id)?.get(e)?.has(user.id)?"on":"",e); b.type="button"; b.setAttribute("aria-label","React "+e);
      b.onclick=()=>pickReaction(e); grid.append(b); });
    box.append(grid);
  }
  show($("emojiSheet")); box.scrollTop=0;
}
function pickReaction(e){
  if(!pickFor) return;
  const mine=reactionsById.get(pickFor.id)?.get(e)?.has(user.id);
  const count=[...(reactionsById.get(pickFor.id)||new Map()).values()].filter(set=>set.has(user.id)).length;
  if(!mine&&count>=12) return say("emojiMsg","That's a lot of reactions! Remove one first.",true);
  show($("emojiSheet"),false); rememberReact(e); toggleReaction(pickFor,e);
}
$("emojiAnyForm").addEventListener("submit",e=>{ e.preventDefault(); const em=firstEmoji($("emojiAny").value); if(!em) return say("emojiMsg","That box only takes an emoji. Use your keyboard's emoji button 😊",true); pickReaction(em); });
$("emojiClose").onclick=()=>show($("emojiSheet"),false);
$("emojiSheet").addEventListener("click",e=>{ if(e.target.id==="emojiSheet") show($("emojiSheet"),false); });

/* ---------- message menu ---------- */
function openMenu(m){
  menuMsg=m; const mine=m.user_id===user.id;
  $("menuPreview").textContent=`${nameOf(m.user_id)}: ${previewOf(m)}`;
  $("menuPin").textContent=pins.has(m.id)?"Unpin message":"Pin message 📌";
  const row=$("emojiRow"); row.innerHTML="";
  EMOJIS.forEach(emoji=>{
    const b=el("button",reactionsById.get(m.id)?.get(emoji)?.has(user.id)?"on":"",emoji); b.type="button"; b.setAttribute("aria-label","React "+emoji);
    b.onclick=()=>{ show($("msgMenu"),false); toggleReaction(m,emoji); };
    row.append(b);
  });
  const more=el("button","more","+"); more.type="button"; more.setAttribute("aria-label","More reactions");
  more.onclick=()=>{ show($("msgMenu"),false); openEmojiPicker(m); }; row.append(more);
  show($("menuWho"),!!reactionsById.get(m.id)?.size);
  show($("menuCopy"),!!m.text&&m.kind!=="sticker"); show($("menuCal"),!!m.text&&m.kind==="text");
  show($("menuTranslate"),aiOn()&&!!m.text&&m.kind!=="sticker"&&m.kind!=="poll"&&m.kind!=="game"&&!mine);
  show($("menuFx"),!!(secretFor(m.text)||fxFor(m.text))&&m.kind!=="poll"&&m.kind!=="game");
  show($("menuEdit"),mine&&canEdit(m));
  show($("menuDelete"),mine||roomOwner===user.id);
  $("menuDelete").textContent=mine?"Delete message":"Delete message (room owner)";
  show($("menuBlock"),!mine); $("menuBlock").textContent=`Block ${nameOf(m.user_id)}`;
  show($("menuReport"),!mine); $("menuReport").textContent=`Report ${nameOf(m.user_id)}`;
  show($("menuDm"),!mine&&!isDm); $("menuDm").textContent=`Message ${nameOf(m.user_id)} privately`;
  show($("menuFriend"),!mine&&!isFriend(m.user_id)); $("menuFriend").textContent=addedMe(m.user_id)?`Add ${nameOf(m.user_id)} back as a friend 🤝`:`Add ${nameOf(m.user_id)} as a friend`;
  show($("msgMenu"));
}
$("menuClose").onclick=()=>show($("msgMenu"),false);
$("menuWho").onclick=()=>{ show($("msgMenu"),false); if(menuMsg) openWhoReacted(menuMsg,null); };

/* ---------- who reacted with what ---------- */
let whoFor=null, whoPick=null;
function openWhoReacted(m,emoji){ whoFor=m; whoPick=emoji; paintWhoReacted(); show($("rxSheet"));
  const unknown=[...(reactionsById.get(m.id)||new Map()).values()].flatMap(set=>[...set]).filter(uid=>!cache.get(uid)?.username);
  if(unknown.length&&typeof refreshProfiles==="function") Promise.resolve(refreshProfiles(unknown)).then(()=>{ if(whoFor===m) paintWhoReacted(); }).catch(()=>{});
}
function paintWhoReacted(){
  const map=whoFor&&reactionsById.get(whoFor.id);
  if(!map||!map.size){ show($("rxSheet"),false); return; }
  if(whoPick&&!map.has(whoPick)) whoPick=null;
  const tabs=$("rxTabs"), list=$("rxList"); tabs.innerHTML=""; list.innerHTML="";
  const total=[...map.values()].reduce((n,set)=>n+set.size,0);
  const tab=(label,count,key)=>{ const b=el("button",whoPick===key?"on":""); b.type="button"; b.append(label,el("span","",String(count))); b.setAttribute("aria-pressed",String(whoPick===key)); b.onclick=()=>{ whoPick=key; paintWhoReacted(); }; tabs.append(b); };
  tab("All",total,null);
  for(const [e,set] of map) tab(e,set.size,e);
  const rows=[];
  for(const [e,set] of map){ if(whoPick&&e!==whoPick) continue; for(const uid of set) rows.push([uid,e]); }
  rows.sort((a,b)=>(a[0]===user.id)-(b[0]===user.id)||nameOf(a[0]).localeCompare(nameOf(b[0])));
  rows.forEach(([uid,e])=>{
    const row=el("div","rxrow"), f=el("span","face"); paintFace(f,cache.get(uid)||{username:nameOf(uid)});
    row.append(f, el("span","rxname",uid===user.id?"You":nameOf(uid)), el("span","rxemo",e));
    list.append(row);
  });
  $("rxTitle").textContent=whoPick?`${whoPick} Reactions`:"Reactions";
}
$("rxClose").onclick=()=>show($("rxSheet"),false);
$("rxSheet").addEventListener("click",e=>{ if(e.target.id==="rxSheet") show($("rxSheet"),false); });
$("menuReport").onclick=()=>{ show($("msgMenu"),false); reportReason=null; $("reportDetails").value=""; say("reportMsg",""); document.querySelectorAll("#reportSheet [data-reason]").forEach(x=>x.classList.remove("on")); show($("reportSheet")); };
$("reportClose").onclick=()=>show($("reportSheet"),false);
$("reportSheet").addEventListener("click",e=>{ if(e.target.id==="reportSheet") show($("reportSheet"),false); });
let reportReason=null;   // remembers which reason was picked
document.querySelectorAll("#reportSheet [data-reason]").forEach(b=>{
  b.onclick=()=>{
    say("reportMsg","");
    reportReason=b.dataset.reason;                                                         // 1) remember this button's reason
    document.querySelectorAll("#reportSheet [data-reason]").forEach(x=>x.classList.remove("on"));   // un-highlight all 4
    b.classList.add("on");                                                               // 2) highlight just this one
  };
});
$("menuDm").onclick=()=>{ show($("msgMenu"),false); openDm(menuMsg.user_id); };
$("menuFriend").onclick=async()=>{ const uid=menuMsg.user_id, name=nameOf(uid), back=addedMe(uid); show($("msgMenu"),false);
  try{ await addFriend(uid); $("status").textContent=back?`You and ${name} are friends now 🤝`:`Added ${name} as a friend.`; }catch(err){ $("status").textContent="Couldn't add friend: "+err.message; } };
$("menuPin").onclick=async()=>{
  const m=menuMsg; show($("msgMenu"),false);
  try{
    if(pins.has(m.id)){ await api.unpin(m.id); pins.delete(m.id); $("status").textContent="Unpinned."; }
    else { await api.pin(room,m.id); pins.set(m.id,{message_id:m.id,pinned_by:user.id,created_at:new Date().toISOString()}); gainXP("pin"); $("status").textContent="Pinned to the top."; }
    pinCursor=0; paintPinBar(); refreshMsg(m.id);
  }catch(err){ $("status").textContent="Couldn't pin: "+err.message; }
};
$("reportForm").addEventListener("submit",async e=>{            // 1) the event that fires when a form is sent
  e.preventDefault();                                              // don't reload the page
  if(!reportReason) return say("reportMsg","Pick a reason first.",true);   // 2) the variable that remembers the picked reason
  $("reportSend").disabled=true; say("reportMsg","Sending…");
  try{
    await api.reportMessage(menuMsg.id, reportReason, $("reportDetails").value.trim());   // 3) the function I added  4) your text box's id
    say("reportMsg","Thanks. Your report was sent. 🙏");
    setTimeout(()=>show($("reportSheet"),false),1200);                // 5) close your sheet after a moment
  }catch(err){ say("reportMsg",err.message,true); }
  finally{ $("reportSend").disabled=false; }
});

$("menuFx").onclick=()=>{ show($("msgMenu"),false); setTimeout(()=>playFx(menuMsg,true),150); };
function startReply(m,focus=true){
  replyTo=m;
  $("replyText").textContent=`${nameOf(m.user_id)}: ${previewOf(m)}`; show($("replying"));
  if(focus) $("box").focus();
}
$("menuReply").onclick=()=>{ show($("msgMenu"),false); startReply(menuMsg); };

/* double-tap a message for reactions + options (one tap does nothing, so scrolling never opens it by accident) */
let tapHintTimer=null;
function bubbleTap(bub,m){
  const now=Date.now();
  if(bub._lastTap&&now-bub._lastTap<400){ bub._lastTap=0; clearTimeout(tapHintTimer); try{ getSelection().removeAllRanges(); }catch(e){} openReactPop(m,bub); return; }
  bub._lastTap=now;
  // first few single taps: a gentle reminder of the new gesture
  clearTimeout(tapHintTimer);
  tapHintTimer=setTimeout(()=>{ const n=+(LS.get("nl-dbltap-hint")||0); if(n<3&&bub._lastTap===now){ $("status").textContent="Double-tap to react · press and hold for reply & more"; try{ LS.set("nl-dbltap-hint",String(n+1)); }catch(e){} } },450);
}

function openReactPop(m,bub){
  const pop=$("reactPop"); pop.innerHTML=""; pop.dataset.id=m.id;
  EMOJIS.forEach(emoji=>{
    const b=el("button",reactionsById.get(m.id)?.get(emoji)?.has(user.id)?"on":"",emoji); b.type="button"; b.setAttribute("aria-label","React "+emoji);
    b.onclick=()=>{ closeReactPop(); toggleReaction(m,emoji); if(navigator.vibrate) navigator.vibrate(10); };
    pop.append(b);
  });
  const more=el("button","more","+"); more.type="button"; more.setAttribute("aria-label","More reactions");
  more.onclick=()=>{ closeReactPop(); openEmojiPicker(m); }; pop.append(more);
  show(pop); pop._st=$("feed").scrollTop;
  // sit just above the message (or below it if there's no room up top), never off the screen
  const r=bub.getBoundingClientRect(), w=pop.offsetWidth, h=pop.offsetHeight;
  const top0=($(".top")?.getBoundingClientRect().bottom)||0;
  let x=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8);
  let y=r.top-h-8; if(y<top0+6) y=Math.min(r.bottom+8,innerHeight-h-8);
  pop.style.left=x+"px"; pop.style.top=y+"px";
  pop.querySelector("button").focus({preventScroll:true});
}
function closeReactPop(){ show($("reactPop"),false); }
document.addEventListener("pointerdown",e=>{ const pop=$("reactPop"); if(!pop.classList.contains("hidden")&&!pop.contains(e.target)) closeReactPop(); },true);
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!$("reactPop").classList.contains("hidden")) closeReactPop(); });
$("feed").addEventListener("scroll",()=>{ const pop=$("reactPop"); if(!pop.classList.contains("hidden")&&Math.abs($("feed").scrollTop-(pop._st||0))>40) closeReactPop(); },{passive:true});   // only a real scroll closes it

/* swipe right on a message to reply */
let lpTimer=null, lpFired=false;
function cancelLongPress(){ clearTimeout(lpTimer); lpTimer=null; }
function attachLongPress(bub,m){
  let sx=0,sy=0;
  bub.addEventListener("pointerdown",e=>{ if(e.button>0||e.target.closest("video,.voice,.poll button,.gamecard button,a")) return;
    sx=e.clientX; sy=e.clientY; lpFired=false; cancelLongPress();
    lpTimer=setTimeout(()=>{ lpTimer=null; lpFired=true; if(navigator.vibrate) navigator.vibrate(25); menuGuard=true; openMenu(m); },450); });
  bub.addEventListener("pointermove",e=>{ if(lpTimer&&Math.hypot(e.clientX-sx,e.clientY-sy)>10) cancelLongPress(); });
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>bub.addEventListener(ev,cancelLongPress));
  bub.addEventListener("contextmenu",e=>e.preventDefault());
  bub.addEventListener("click",e=>{ if(lpFired){ e.stopPropagation(); e.preventDefault(); lpFired=false; } },true);
}
/* after a long-press opens the menu, the finger is still down on the screen. Ignore it: the menu's buttons
   only work once you lift your finger and tap again (so you can't hit Report or Copy by accident). */
let menuGuard=false, menuGuardUntil=0;
const releaseMenuGuard=()=>{ if(menuGuard){ menuGuard=false; menuGuardUntil=Date.now()+350; } };
document.addEventListener("pointerup",releaseMenuGuard,true);
document.addEventListener("pointercancel",releaseMenuGuard,true);
document.addEventListener("touchend",releaseMenuGuard,true);
$("msgMenu").addEventListener("click",e=>{ if(menuGuard||Date.now()<menuGuardUntil){ e.stopPropagation(); e.preventDefault(); } },true);
async function deleteMessageFlow(m){
  const mine=m.user_id===user.id;
  if(!confirm(mine?"Delete this message for everyone?":`Delete ${nameOf(m.user_id)}'s message for everyone?`)) return;
  try{ await api.deleteMessage(m.id); removeMessage(m.id); $("status").textContent="Message deleted."; }
  catch(err){ $("status").textContent="Couldn't delete: "+err.message; }
}
function attachSwipe(node,m){
  let x0=0,y0=0,dx=0,mode=null,col=null,hint=null;
  node.addEventListener("touchstart",e=>{
    if(e.touches.length!==1||e.target.closest("video,.voice,.poll,.gamecard,input,textarea")) { mode="off"; return; }
    x0=e.touches[0].clientX; y0=e.touches[0].clientY; dx=0; mode=null;
    col=node.querySelector(".col");
  },{passive:true});
  node.addEventListener("touchmove",e=>{
    if(mode==="off"||!col) return;
    const mx=e.touches[0].clientX-x0, my=e.touches[0].clientY-y0;
    if(mode===null){ if(Math.abs(mx)<8&&Math.abs(my)<8) return;
      const horiz=Math.abs(mx)>Math.abs(my)*1.3, canDelete=m.user_id===user.id||roomOwner===user.id;
      mode=!horiz?"off":mx>0?"swipe":(canDelete?"swipeDel":"off"); if(mode==="off") return;
      cancelLongPress();
      hint=el("span","swipe-hint"+(mode==="swipeDel"?" del":""),mode==="swipeDel"?"🗑":"↩"); node.prepend(hint); node.classList.add("swiping"); }
    dx=mode==="swipe"?Math.max(0,Math.min(90,mx)):Math.min(0,Math.max(-90,mx));
    col.style.transform=`translateX(${dx}px)`;
    const far=Math.abs(dx)>=60;
    hint.style.opacity=Math.min(1,Math.abs(dx)/60); hint.classList.toggle("ready",far);
    if(far&&!node.dataset.buzzed){ node.dataset.buzzed="1"; if(navigator.vibrate) navigator.vibrate(15); }
  },{passive:true});
  const end=()=>{
    if(mode==="swipe"||mode==="swipeDel"){
      col.style.transition="transform .2s ease"; col.style.transform="";
      setTimeout(()=>{ if(col) col.style.transition=""; hint?.remove(); node.classList.remove("swiping"); },220);
      if(mode==="swipe"&&dx>=60) startReply(m);
      if(mode==="swipeDel"&&dx<=-60) setTimeout(()=>deleteMessageFlow(m),230);
    }
    delete node.dataset.buzzed; mode=null; dx=0;
  };
  node.addEventListener("touchend",end); node.addEventListener("touchcancel",end);
}
$("menuCopy").onclick=async()=>{ show($("msgMenu"),false); try{ await navigator.clipboard.writeText(menuMsg.text); $("status").textContent="Copied."; }catch(e){} };
$("menuDelete").onclick=()=>{ const m=menuMsg; show($("msgMenu"),false); deleteMessageFlow(m); };
/* ---------- edit your own message ---------- */
// only plain text you sent (not photos, voice, polls, games, stickers, or shared backlog cards)
const canEdit=m=>typeof m.id==="number"&&(m.kind||"text")==="text"&&!!m.text&&!m.card&&!m.image_url&&!(m.image_urls&&m.image_urls.length)&&!m.media_url;
let editing=null;
$("menuEdit").onclick=()=>{
  editing=menuMsg; show($("msgMenu"),false); say("editMsg","");
  $("editBox").value=editing.text||""; show($("editSheet"));
  setTimeout(()=>{ const b=$("editBox"); b.focus(); b.setSelectionRange(b.value.length,b.value.length); },60);
};
$("editClose").onclick=()=>show($("editSheet"),false);
$("editSheet").addEventListener("click",e=>{ if(e.target.id==="editSheet") show($("editSheet"),false); });
$("editBox").addEventListener("keydown",e=>{ if(e.key==="Escape"){ e.stopPropagation(); show($("editSheet"),false); } else if(e.key==="Enter"&&!e.isComposing&&((e.ctrlKey||e.metaKey)||(!e.shiftKey&&!matchMedia("(pointer: coarse)").matches))){ e.preventDefault(); $("editForm").requestSubmit(); } });   // on a computer Enter saves (Shift+Enter = new line), same as sending
$("editForm").addEventListener("submit",async e=>{
  e.preventDefault(); const m=editing; if(!m) return;
  const text=$("editBox").value.trim();
  if(!text) return say("editMsg","Your message can't be empty. To remove it, use Delete instead.",true);
  if(text===m.text){ show($("editSheet"),false); return; }
  $("editSave").disabled=true; say("editMsg","Saving…");
  try{ const row=await api.editMessage(m.id,text); applyEdit(row||{id:m.id,text,edited_at:new Date().toISOString()}); show($("editSheet"),false); $("status").textContent="Message edited."; }
  catch(err){ say("editMsg",isNetworkError(err)?"Couldn't reach NightLane. Check your connection and try again.":/edit_message|function|schema cache/i.test(err.message||"")?"Editing isn't set up on the server yet.":err.message,true); }
  finally{ $("editSave").disabled=false; }
});
function applyEdit(row){
  const m=byId.get(row?.id); if(!m) return;
  m.text=row.text; m.edited_at=row.edited_at||new Date().toISOString();
  refreshMsg(m.id);
  if(menuMsg?.id===m.id&&!$("msgMenu").classList.contains("hidden")) $("menuPreview").textContent=`${nameOf(m.user_id)}: ${previewOf(m)}`;
}
$("menuBlock").onclick=async()=>{
  const uid=menuMsg.user_id, name=nameOf(uid);
  if(!confirm(`Block ${name}? You won't see their messages anywhere. You can unblock them from your profile.`)) return;
  show($("msgMenu"),false);
  try{ await api.block(uid); blocked.add(uid); renderAll(); $("status").textContent=`Blocked ${name}.`; }
  catch(err){ $("status").textContent="Couldn't block: "+err.message; }
};
function clearReply(){ replyTo=null; show($("replying"),false); }
$("cancelReply").onclick=clearReply;

/* ---------- room sheet ---------- */
function setRoomName(name){
  roomName=(name||"").trim()||null;
  const lr=laneByRoom.get(room), ln=lr&&laneOf(lr.lane);
  const label=isDm?(roomName||(dmUser?nameOf(dmUser):"Private chat")):ln?`${ln.name} › ${roomName||"chat"}`:(roomName||"# "+room);
  $("roomLabel").textContent=(isDm?"🔒 ":"")+label;
  if(ln&&!roomIcons.get(room)) $("roomLabel").prepend(glyphEl(lr.lane_label||"nl:chat","rl-glyph"));
  paintLaneBar();
  $("roomLabel").title=isDm?"Private chat":(roomName?`${roomName} (#${room})`:"#"+room);
  paintRoomTitle(); paintRoomIcon();
}
function paintRoomTitle(){
  if(isDm){ $("rsTitle").textContent=roomName||(dmUser?nameOf(dmUser):"Private chat"); $("rsCode").textContent="Private chat · only you two can see this"; show($("rsCode")); return; }
  $("rsTitle").textContent=roomName||"# "+room; $("rsCode").textContent=roomName?"#"+room:""; show($("rsCode"),!!roomName);
}
$("nameForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const name=$("roomName").value.trim().replace(/\s+/g," ").slice(0,40);
  if(name===(roomName||"")) return say("rsMsg","That's already the name.");
  $("nameSave").disabled=true;
  try{ await api.renameRoom(room,name); setRoomName(name); say("rsMsg",name?`Room renamed to ${name}.`:"Room name cleared."); }
  catch(err){ say("rsMsg","Couldn't rename: "+err.message,true); }
  finally{ $("nameSave").disabled=false; }
});
function inviteUrl(code,token){ return location.origin+location.pathname+"?join="+encodeURIComponent(code)+"&t="+encodeURIComponent(token); }
$("roomBtn").onclick=async()=>{
  say("rsMsg",""); paintRoomTitle(); $("roomName").value=roomName||""; $("invLink").value="Loading…"; show($("roomSheet"));
  const lr=laneByRoom.get(room), ln=lr&&laneOf(lr.lane);
  show($("roomOnly"),!isDm&&!ln); show($("riBox"),!isDm); paintRoomIcon(); $("leaveRoom").textContent=isDm?"Hide this chat":"Leave this room"; show($("leaveRoom"),!ln);
  show($("rsLaneBox"),!!ln); if(ln) $("rsLaneText").textContent=`${roomName||"This side chat"} is a side chat in ${ln.name}. Add friends, side chats and helpers from the Lane.`;
  show($("rsMoveBox"),!isDm&&!ln&&roomOwner===user.id&&myLanesList.some(l=>l.my_role!=="member"));
  paintMembers(); paintBgTiles(); paintBondStyles(); paintPins(); paintNotifyModes(); paintDisappear(); paintTasks(); show($("rsSummarize"),aiOn());
  try{
    const info=await api.roomInfo(room); if(!info) throw new Error("Couldn't find this room.");
    roomOwner=info.owner; setRoomName(info.name); show($("rsMoveBox"),!info.is_dm&&!info.lane&&info.owner===user.id&&myLanesList.some(l=>l.my_role!=="member")); if(document.activeElement!==$("roomName")) $("roomName").value=roomName||""; paintMembers();
    if(!info.is_dm) $("invLink").value=inviteUrl(info.code,info.invite_token);
    show($("invReset"),info.owner===user.id&&!info.is_dm); show($("invShare"),!!navigator.share);
  }catch(err){ $("invLink").value=""; say("rsMsg",err.message,true); }
};
async function paintMembers(){
  await ensureProfiles([...members.keys()]);
  const list=$("memberList"); list.innerHTML="";
  $("memTitle").textContent=`Members (${members.size})`;
  const ids=[...members.keys()].sort((a,b)=>(b===roomOwner)-(a===roomOwner)||nameOf(a).localeCompare(nameOf(b)));
  for(const uid of ids){
    const row=el("div","member"); const f=el("span","face"); paintFace(f,cache.get(uid));
    const nick=members.get(uid)?.nick, uname=cache.get(uid)?.username||"";
    const n=el("span","mname",nameOf(uid)+(uid===user.id?" (you)":"")); if(uid!==user.id){ const ls=el("span","lastseen",presenceLine(uid)); ls.dataset.presence=uid; n.append(ls); }
    if(nick&&nick!==uname) n.append(el("span","role",uname));
    if(uid===roomOwner) n.append(el("span","role","OWNER"));
    const nb=el("button","unblock","Nickname"); nb.type="button";
    nb.onclick=async()=>{
      const v=prompt(`Nickname for ${uname} in this room (leave empty to clear):`, nick||""); if(v===null) return;
      const clean=v.trim().replace(/\s+/g," ").slice(0,30);
      try{ await api.setNickname(room,uid,clean); setMember({user_id:uid,nickname:clean||null}); say("rsMsg",clean?`${uname} is now “${clean}” here.`:`Cleared ${uname}'s nickname.`); }
      catch(err){ say("rsMsg","Couldn't set nickname: "+err.message,true); }
    };
    row.append(f,n,nb);
    if(uid!==user.id&&!isDm){ const mb=el("button","unblock","Message"); mb.type="button"; mb.onclick=()=>{ show($("roomSheet"),false); openDm(uid); }; row.append(mb); }
    if(uid!==user.id){ const fb=el("button","unblock friendbtn"+(isFriend(uid)?" on":""),isFriend(uid)?"Friend ✓":"Add friend"); fb.type="button";
      fb.onclick=async()=>{ if(isFriend(uid)) { show($("roomSheet"),false); openPerson(uid); return; } try{ await addFriend(uid); say("rsMsg",`Added ${nameOf(uid)} as a friend.`); }catch(err){ say("rsMsg",err.message,true); } };
      row.append(fb); }
    if(roomOwner===user.id && uid!==user.id && !isDm){
      const b=el("button","","Remove"); b.type="button";
      b.onclick=async()=>{
        if(!confirm(`Remove ${nameOf(uid)} from # ${room}? The invite link will also reset so they can't rejoin with it.`)) return;
        try{ await api.removeMember(room,uid); members.delete(uid); paintMembers(); paintReceipts();
          const info=await api.roomInfo(room).catch(()=>null); if(info) $("invLink").value=inviteUrl(info.code,info.invite_token);
          say("rsMsg",`Removed ${nameOf(uid)}. New invite link made.`); }
        catch(err){ say("rsMsg",err.message,true); }
      };
      row.append(b);
    }
    list.append(row);
  }
}
$("invCopy").onclick=async()=>{
  const v=$("invLink").value; if(!v.startsWith("http")&&!v.startsWith("file")) return;
  try{ await navigator.clipboard.writeText(v); say("rsMsg","Link copied."); }
  catch(e){ $("invLink").select(); say("rsMsg","Press Ctrl+C (or long-press) to copy."); }
};
$("invShare").onclick=async()=>{ try{ await navigator.share({title:"Join me on NightLane",url:$("invLink").value}); }catch(e){} };
$("invReset").onclick=async()=>{
  $("invReset").disabled=true;
  try{ const t=await api.rotateInvite(room); $("invLink").value=inviteUrl(room,t); say("rsMsg","New link made. The old link no longer works."); }
  catch(err){ say("rsMsg",err.message,true); }
  finally{ $("invReset").disabled=false; }
};
$("leaveRoom").onclick=async()=>{
  const owner=roomOwner===user.id;
  if(isDm){ if(!confirm("Hide this private chat? It comes back if either of you sends a new message.")) return; }
  else if(!confirm(`Leave ${roomName||"# "+room}?${owner?" You're the owner, so ownership passes to the next member.":""} You'll need a new invite link to come back.`)) return;
  try{ const code=room; await api.leaveRoom(code); exitRoom(); say("roomMsg",`You left # ${code}.`); }
  catch(err){ say("rsMsg",err.message,true); }
};
$("rsClose").onclick=()=>show($("roomSheet"),false);
$("rsLaneOpen").onclick=()=>{ const lr=laneByRoom.get(room); if(lr){ show($("roomSheet"),false); openLaneSheet(lr.lane); } };
$("rsMoveLane").onclick=()=>{ show($("roomSheet"),false); openLaneForm({mode:"attach",code:room,name:roomName}); };

