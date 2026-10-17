/* ================= STAYING CONNECTED ================= */
let liveStatus=null, catchingUp=false, lastCatchUp=0, roomHandlers=null, roomBadSince=0;
/* Bad Wi-Fi watchdog: the live connection can die without saying so (iPhones especially). While a chat is open,
   check every 5s. Connection looks bad → ask the server for new messages directly every ~8s so chat keeps
   flowing, and if it stays bad for 20s, reconnect the chat from scratch. Healthy → a quiet double-check every 45s. */
setInterval(()=>{
  if(!sb||!room||!user||document.hidden||navigator.onLine===false){ roomBadSince=0; return; }
  let up=true; try{ up=sb.realtime.isConnected(); }catch(e){}
  if(up&&liveStatus==="Live"){ roomBadSince=0; if(Date.now()-lastCatchUp>45000) catchUp("check"); return; }
  if(!roomBadSince) roomBadSince=Date.now();
  if(Date.now()-lastCatchUp>8000) catchUp("poll");
  if(Date.now()-roomBadSince>20000&&roomHandlers){
    roomBadSince=Date.now();
    try{ if(unsub) unsub(); }catch(e){}
    try{ if(!up) sb.realtime.connect(); }catch(e){}
    unsub=api.subscribe(room,roomHandlers);
  }
},5000);
async function catchUp(reason){
  if(!room||!user||catchingUp) return;
  const code=room; catchingUp=true; lastCatchUp=Date.now();
  const newestKnown=msgs.length?msgs[msgs.length-1].created_at:null;
  try{
    const [latest,mem,pinRows]=await Promise.all([api.loadLatest(code),api.members(code).catch(()=>null),api.pins(code).catch(()=>null)]);
    if(room!==code) return;
    // missed more than one page while away? fill the gap between what we had and the newest page
    const fetched=new Set(latest.map(m=>m.id));   // everything this catch-up loaded is definitely NOT deleted
    if(newestKnown&&latest.length>=PAGE&&latest[0].created_at>newestKnown){
      let from=newestKnown;
      for(let page=0;page<20;page++){
        const chunk=await api.loadAfter(code,from); if(room!==code) return;
        chunk.forEach(m=>fetched.add(m.id)); await addMessages(chunk);
        const last=chunk[chunk.length-1];
        if(chunk.length<PAGE||!last||last.created_at>=latest[0].created_at||last.created_at===from) break;
        from=last.created_at;
      }
    }
    await addMessages(latest);
    // drop anything deleted while we were away (only within the loaded window)
    { const whole=latest.length<PAGE, oldest=latest[0]?.created_at;   // fewer than a page = we got the whole room
      msgs.filter(m=>!fetched.has(m.id)&&(whole||(oldest&&m.created_at>oldest))).map(m=>m.id).forEach(removeMessage); }
    if(mem) mem.forEach(setMember);
    if(pinRows){ pins.clear(); pinRows.forEach(p=>pins.set(p.message_id,p)); await loadPinnedContext(); paintPinBar(); }
    const gids=[...gamesById.keys()];
    if(gids.length){ (await api.games(gids).catch(()=>[])).forEach(g=>{ const prev=gamesById.get(g.message_id); if(JSON.stringify(prev)!==JSON.stringify(g)){ gamesById.set(g.message_id,g); refreshMsg(g.message_id); if(openGameId===g.message_id) paintGame(prev); } }); }
    markReadSoon();
  }catch(e){ /* still offline: the next reconnect tries again */ }
  finally{ catchingUp=false; }
}
addEventListener("offline",()=>{ if(room) $("status").textContent="Offline · will reconnect"; });
addEventListener("online",()=>{ if(room){ $("status").textContent="Reconnecting…"; catchUp("online"); } else if(user) loadInbox(); });
document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&room&&Date.now()-lastCatchUp>4000) catchUp("resume"); });

/* invite and room links posted inside NightLane open right here instead of a new tab */
feed.addEventListener("click",e=>{
  const a=e.target.closest("a"); if(!a) return;
  let u; try{ u=new URL(a.href); }catch(err){ return; }
  if(u.origin+u.pathname!==location.origin+location.pathname) return;
  const join=u.searchParams.get("join"), linked=u.searchParams.get("room");
  if(!join&&!linked) return;
  e.preventDefault();
  if((join||linked).toLowerCase()===room){ $("status").textContent="You're already in this room."; return; }
  enterRoom(join||linked, u.searchParams.get("t"));
});

/* ================= BACK BUTTON (Android / browser back) ================= */
// Each chat or sheet you open adds a history step, so Back closes the top one instead of leaving the app.
(function(){
  const LAYERS=["cropSheet","chat","profile","roomSheet","msgMenu","themeSheet","pollSheet","installSheet","gameSheet","personSheet","summarySheet","calSheet","searchSheet","lightbox","habitsSheet","quizSheet","slSheet","newsSheet","backlogSheet","blShareSheet","forgotSheet","rcSheet","rulesSheet","cheatSheet","arcanaSheet","editSheet","gifPreview","blNoteSheet"];
  const stack=[], waiting=[]; let popping=false, ignorePops=0, pendingBack=0, flushQueued=false;
  /* Android Chrome skips history steps a page adds without a tap first. So when a chat opens on its own
     (from a notification or an Owl "your turn" ping), Back used to skip it and close the whole app.
     Now that step waits until your first tap, which makes it count. */
  const tapped=()=>!navigator.userActivation||navigator.userActivation.isActive;
  function flushWaiting(){ if(!waiting.length||!tapped()) return; waiting.splice(0).forEach(id=>history.pushState({nl:id},"")); }
  ["click","keydown","touchend","pointerup"].forEach(t=>addEventListener(t,flushWaiting,true));
  const isOpen=id=>!$(id).classList.contains("hidden");
  function queueBack(){
    pendingBack++;
    if(flushQueued) return; flushQueued=true;
    setTimeout(()=>{ flushQueued=false; if(pendingBack>0){ ignorePops++; history.go(-pendingBack); pendingBack=0; } },0);
  }
  function watch(id){
    new MutationObserver(()=>{
      const open=isOpen(id), i=stack.indexOf(id);
      if(open&&i<0){ stack.push(id); if(tapped()) history.pushState({nl:id},""); else waiting.push(id); }
      else if(!open&&i>=0){ stack.splice(i,1); const w=waiting.indexOf(id); if(w>=0) waiting.splice(w,1); else if(!popping) queueBack(); }
    }).observe($(id),{attributes:true,attributeFilter:["class"]});
  }
  LAYERS.forEach(watch);
  function closeLayer(id){
    if(id==="chat") exitRoom();
    else if(id==="gameSheet") closeGame();
    else if(id==="themeSheet") $("themeClose").click();
    else if(id==="cropSheet") $("cropCancel").click();
    else show($(id),false);
  }
  addEventListener("popstate",()=>{
    if(ignorePops>0){ ignorePops--; return; }
    const top=[...stack].reverse().find(isOpen);
    if(!top) return;                       // nothing open: let the browser leave the app as normal
    popping=true; closeLayer(top);
    setTimeout(()=>{ popping=false; },0);
  });
})();

/* ================= DESKTOP TERMINAL MODE ================= */
// computer layout: a window 900px+ wide with a mouse or trackpad
const isDesktop=()=>matchMedia("(min-width: 900px) and (any-pointer: fine)").matches;   // (any-pointer: a touch-screen laptop with a trackpad still counts)
function applyDesktop(){
  const d=isDesktop(); document.body.classList.toggle("desktop",d);
  if(d&&!document.querySelector(".deskframe")){ const f=document.createElement("div"); f.className="deskframe"; document.body.insertBefore(f,$("front")); f.append($("front"),$("chat"));
    const bar=document.createElement("div"); bar.className="termbar"; bar.id="termbar"; document.body.append(bar); }
  if(d){ $("chat").dataset.idle="▮ NIGHTLANE TERMINAL\n\nno channel open.\nselect a room on the left, or press  Ctrl+K  to search.\n\n> _"; paintTermBar(); }
}
/* ===== PC holiday look: pixel sprites + a terminal line under the date =====
   Phones get the big date stamp with holiday stickers; on PC the stamp is swapped for the green terminal date,
   so this gives the PC its own holiday look. Halloween uses the real pixel art (HWART); the rest are tiny pixel
   grids drawn as crisp SVG squares. Each letter in a grid is a color from that sprite's palette ("." = empty). */
const PXART={
  heart:{p:{R:"#ff3d7f",W:"#ffd1e0",D:"#c21757"},g:["..RR...RR..",".RWRR.RRRR.","RRWRRRRRRRR","RRRRRRRRRRR","RRRRRRRRRRD",".RRRRRRRRD.","..RRRRRRD..","...RRRRD...","....RRD....",".....D....."]},
  clover:{p:{G:"#2ee66b",L:"#a6ffbe",D:"#178a3e",S:"#178a3e"},g:["..GGG.GGG..",".GGLGGGLGG.",".GGGGGGGGG.","..GGGGGGG..","GGGGG.GGGGG","GLGGGDGGGLG","GGGGG.GGGGG","..GGGGGGG..",".GGGG.GGGG.","....S......","...S......."]},
  hat:{p:{G:"#2ee66b",K:"#0b3b1c",Y:"#f3ff3a"},g:["...GGGGG...","...GGGGG...","...GGGGG...","...GGGGG...","...KKKKK...","...KYYYK...","GGGGGGGGGGG",".GGGGGGGGG."]},
  flake:{p:{W:"#e8fbff",C:"#7fe9ff"},g:[".....W.....","...W.W.W...","....WWW....",".W..W.W..W.","..W.WWW.W..","WWWWWCWWWWW","..W.WWW.W..",".W..W.W..W.","....WWW....","...W.W.W...",".....W....."]},
  tree:{p:{Y:"#f3ff3a",G:"#2ee66b",D:"#178a3e",R:"#ff3d5a",C:"#00f0ff",B:"#8a5a2b"},g:[".....Y.....","....YYY....",".....G.....","....GGD....","...GGRGD...","....GGD....","...GCGGGD..","..GGGGGRGD.","...GGGGGD..","..GRGGGGCD.",".GGGGGYGGGD","GGGGGGGGGGD",".....B.....",".....B....."]},
  burst:{p:{Y:"#f3ff3a",M:"#ff4fd8",W:"#ffffff"},g:[".....Y.....",".M...Y...M.","..M..Y..M..","...M...M...","....YYY....","YYYY.W.YYYY","....YYY....","...M...M...","..M..Y..M..",".M...Y...M.",".....Y....."]},
  burst2:{p:{Y:"#00f0ff",M:"#ff3d5a",W:"#ffffff"},g:[".....Y.....",".M...Y...M.","..M..Y..M..","...M...M...","....YYY....","YYYY.W.YYYY","....YYY....","...M...M...","..M..Y..M..",".M...Y...M.",".....Y....."]},
  egg:{p:{P:"#ffb3e6",Y:"#fff36b",C:"#7fe9ff",W:"#ffffff"},g:["...PPP...","..PWPPP..",".PWPPPPP.",".YYYYYYY.","PPPPPPPPP","PCPCPCPCP","PPPPPPPPP",".YYYYYYY.",".PPPPPPP.","..PPPPP..","...PPP..."]},
  egg2:{p:{P:"#9be7ff",Y:"#ff9bd2",C:"#fff36b",W:"#ffffff"},g:["...PPP...","..PWPPP..",".PWPPPPP.",".CCCCCCC.","PPPPPPPPP","PYPYPYPYP","PPPPPPPPP",".CCCCCCC.",".PPPPPPP.","..PPPPP..","...PPP..."]},
  leaf:{p:{O:"#ff8a1f",R:"#c2410c",Y:"#ffd23a",B:"#7a4a1f"},g:[".....O.....","....OYO....",".O..OOO..O.",".OOOOROOOO.","..OOOROOOO.","OOOOOROOOOO",".OOOOROOOO.","..OOORRYO..",".OOO.R.OOO.",".....R.....",".....B.....",".....B....."]},
  acorn:{p:{B:"#8a5a2b",D:"#5a3716",O:"#e0a050",L:"#ffd28a"},g:["....D....","..BBBBB..",".BDBDBDB.","BBBBBBBBB",".OOOOOOO.",".OLOOOOO.",".OLOOOOO.","..OOOOO..","...OOO...","....O...."]},
  flag:{p:{B:"#2f5bff",W:"#ffffff",R:"#ff3d5a"},g:["BBBBRRRRRRR","BWBWWWWWWWW","BBBBRRRRRRR","BWBWWWWWWWW","RRRRRRRRRRR","WWWWWWWWWWW","RRRRRRRRRRR"]},
};
function pxSprite(name,size=3){
  const a=PXART[name], h=a.g.length, w=a.g[0].length; let rects="";
  a.g.forEach((row,y)=>[...row].forEach((c,x)=>{ if(c!=="."&&a.p[c]) rects+=`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${a.p[c]}"/>`; }));
  const s=document.createElement("span"); s.className="dhspr"; s.setAttribute("aria-hidden","true");
  s.innerHTML=`<svg viewBox="0 0 ${w} ${h}" width="${w*size}" height="${h*size}" shape-rendering="crispEdges">${rects}</svg>`;
  return s;
}
function hwSprite(name,{frames=1,scale=1}={}){   // one of the real Halloween pixel sprites
  const a=typeof HWART!=="undefined"&&HWART[name]; if(!a) return null;
  const w=a.w/frames, s=document.createElement("span"); s.className="dhspr dhimg"; s.setAttribute("aria-hidden","true");
  s.style.width=w*scale+"px"; s.style.height=a.h*scale+"px"; s.style.backgroundImage=`url(${a.src})`; s.style.backgroundSize=`${a.w*scale}px ${a.h*scale}px`;
  if(frames>1){ s.style.setProperty("--hwend",(-a.w*scale)+"px"); s.style.animation=`hwframes ${frames/8}s steps(${frames}) infinite`; }
  return s;
}
const DESK_HOLIDAY={
  halloween:   {line:"boo.exe is running",          color:"#ff8a1f", art:()=>[hwSprite("jackohead",{scale:.8}),hwSprite("ghost",{frames:4,scale:1.1})]},
  thanksgiving:{line:"loading gratitude...",        color:"#ffb347", art:()=>[pxSprite("leaf"),pxSprite("acorn")]},
  winter:      {line:"snow.sys online",             color:"#9fe8ff", art:()=>[pxSprite("tree"),pxSprite("flake")]},
  newyear:     {line:"happy_new_year.exe",          color:"#f3ff3a", art:()=>[pxSprite("burst"),pxSprite("burst2")]},
  valentine:   {line:"sending <3 to the crew",      color:"#ff6fae", art:()=>[pxSprite("heart"),pxSprite("heart",2)]},
  stpat:       {line:"luck.dll loaded",             color:"#2ee66b", art:()=>[pxSprite("clover"),pxSprite("hat")]},
  easter:      {line:"egg_hunt --start",            color:"#ffb3e6", art:()=>[pxSprite("egg"),pxSprite("egg2")]},
  july4:       {line:"fireworks.bat",               color:"#ff5a6e", art:()=>[pxSprite("flag"),pxSprite("burst2")]},
};
function paintDeskHoliday(d){
  const n=$("deskHol"); if(!n) return;
  const key=typeof holidayFor==="function"?holidayFor(d):"", h=DESK_HOLIDAY[key];
  if(n.dataset.hol===key) return;   // only rebuild when the holiday changes, so the typing doesn't replay every 30 seconds
  n.dataset.hol=key; n.innerHTML=""; show(n,!!h); if(!h) return;
  n.style.setProperty("--hol",h.color);
  const art=document.createElement("span"); art.className="dhart"; h.art().filter(Boolean).forEach(s=>art.append(s));
  const line=document.createElement("span"); line.className="dhline";
  const txt=document.createElement("span"); txt.className="dhtype"; txt.textContent="> "+h.line; txt.style.setProperty("--n",h.line.length+2);
  line.append(txt); n.append(art,line);
}
function paintDeskDate(){ const n=$("deskDate"); if(!n) return; const d=new Date(); paintDeskHoliday(d); const wd=d.toLocaleDateString([],{weekday:"short"}), md=`${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`; const ph=(typeof phaseOf==="function"?phaseOf(d.getHours()):""); n.innerHTML=`<b>${md}</b><span>${wd}</span><span>· ${ph||d.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}</span><span class="blink">_</span>`; }
setInterval(()=>{ if(document.body.classList.contains("desktop")) paintDeskDate(); },30000);
function paintTermBar(){ paintDeskDate();
  const bar=$("termbar"); if(!bar) return;
  const on=[...online.keys()].filter(id=>id!==user?.id).length;
  bar.innerHTML=`<span>▮ NIGHTLANE<span class="blink">_</span></span><span>uplink: <b>${!sb?"DEMO":(navigator.onLine?(liveStatus||"IDLE"):"OFFLINE")}</b></span><span>user: <b>${meProfile?.username||"—"}</b></span><span>channel: <b>${room?(isDm?"private":(roomName||"#"+room)):"none"}</b></span><span>online: <b>${on}</b></span><span class="right">${user?`<span class="kbd">Ctrl+K</span> search · `:""}<span class="kbd">Esc</span> close · <span class="kbd">Ctrl+/</span> secrets</span>`;
}
setInterval(()=>{ if(document.body.classList.contains("desktop")) paintTermBar(); },4000);
addEventListener("resize",applyDesktop); applyDesktop();
addEventListener("keydown",e=>{
  if(!document.body.classList.contains("desktop")) return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){ e.preventDefault(); if(user) openSearch(room?"room":"all"); }
  if((e.ctrlKey||e.metaKey)&&e.key==="/"){ e.preventDefault(); if(user){ openProfile(); profTab("me"); setTimeout(()=>{ const d=$("secretSummary")?.closest("details"); if(d) d.open=true; $("secretSummary").scrollIntoView({behavior:"smooth",block:"center"}); },300); } }
});
/* boot sequence: once per session, desktop only */
function bootSequence(){
  if(!isDesktop()) return;
  if(typeof hideSplash==="function") hideSplash(); try{ if(sessionStorage.getItem("nl-booted")) return; sessionStorage.setItem("nl-booted","1"); }catch(e){}
  const lines=["NIGHTLANE//OS  v1.0  —  neon shell","> initializing uplink ......... OK","> resolving signal path ....... OK","> loading cutout renderer ..... OK","> mounting secret vault ....... 99 entries","> checking clearance .......... netrunner","",`> ${new Date().toLocaleString([],{weekday:"long",hour:"numeric",minute:"2-digit"})}`,"> welcome back. jack in when ready."];
  const b=document.createElement("div"); b.className="boot"; b.innerHTML=`<h1>NIGHTLANE</h1><pre id="bootText"></pre><span class="cur"></span><div class="skip">▸ CLICK OR PRESS ANY KEY TO ENTER</div><div class="bootbar"><i></i></div>`; document.body.append(b);
  const pre=b.querySelector("#bootText"); let li=0,ci=0,done=false;
  const chime=(f,len)=>{ try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); const o=ac.createOscillator(),g=ac.createGain(); o.type="square"; o.frequency.value=f; g.gain.value=.02; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+len); }catch(e){} };
  const finish=()=>{ if(done) return; done=true; b.classList.add("out"); setTimeout(()=>b.remove(),520); removeEventListener("keydown",finish); };
  const tick=()=>{ if(done) return; if(li>=lines.length){ setTimeout(finish,700); return; }
    const line=lines[li]; if(ci<line.length){ pre.textContent+=line[ci++]; if(ci%3===0) chime(600+Math.random()*300,.01); setTimeout(tick,line.startsWith(">")?8:22); }
    else { pre.textContent+="\n"; li++; ci=0; setTimeout(tick,line.includes("OK")?90:220); } };
  b.onclick=finish; addEventListener("keydown",finish); setTimeout(tick,300);
  setTimeout(finish,3600);   // never make anyone wait: it lets you in by itself after ~3.5 seconds (the bar along the bottom shows how long)
}
bootSequence();

/* ---------- boot ---------- */
/* ================= OFFLINE ================= */
let offlineMode=false;
const isOffline=()=>navigator.onLine===false||offlineMode;
function isNetworkError(err){ return navigator.onLine===false||err?.name==="AbortError"||/failed to fetch|networkerror|network request|load failed|fetch failed|internet|aborted|timed out|timeout/i.test(String(err?.message||err)); }
function savedLoginUser(){
  if(!SUPABASE_URL) return null;
  try{ const k="sb-"+new URL(SUPABASE_URL).hostname.split(".")[0]+"-auth-token"; const s=JSON.parse(LS.get(k)||"null"); return s?.user||s?.currentSession?.user||null; }catch(e){ return null; }
}
function paintOffline(){
  const off=isOffline(); show($("offlineBar"),off&&!!user);
  if(off) $("offlineText").textContent=offlineMode&&navigator.onLine!==false?"Reconnecting… showing your saved chats.":"You're offline. Showing your saved chats.";
}
function offlineNotice(){
  const t=el("div","toast"); const body=el("span","tbody");
  body.append(el("div","ttitle","📡 You're offline"), el("div","ttext","Chats will open again as soon as you're back online."));
  t.append(body); $("toasts").prepend(t); setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },3500);
}
function startOffline(saved,slow){   // show your saved chats right away; the real login takes over when the connection's back
  if(user) return;
  offlineMode=true; user=saved;
  let cached=null; try{ cached=JSON.parse(LS.get("nl-me-cache")||"null"); }catch(e){}
  meProfile=(cached&&cached.id===saved.id)?cached:{id:saved.id,username:saved.user_metadata?.username||"you",avatar_url:null};
  cache.set(user.id,meProfile); paintMe(); applyTheme(meProfile.theme||savedTheme());
  show($("authCard"),false); show($("roomCard")); $("front").classList.add("logged");
  loadInbox(); paintOffline(); hideSplash();
  try{ const t=LS.get("nl-front-tab"); if(["chats","lanes","dms","contacts"].includes(t)) setFrontTab(t); }catch(e){}
}
addEventListener("offline",()=>paintOffline());
addEventListener("online",async()=>{
  if(LIB_MISSING){ location.reload(); return; }   // the server library never loaded: start fresh now that we can fetch it
  paintOffline();
  if(offlineMode){ const u=await api.session().catch(()=>null); if(u){ authSeen=u.id; offlineMode=false; handleAuth(u); } else { offlineMode=false; authSeen=null; handleAuth(null); } }
});

setMode("in");
api.onAuth((u,event)=>{
  if(event==="PASSWORD_RECOVERY"){ say("recMsg",""); show($("recover")); setTimeout(()=>$("newPass").focus(),50); }
  syncAuth(u);
});
let authSeen;
function syncAuth(u){
  if(offlineMode){   // opened offline from a saved login: a real login result takes over; an offline "no session" doesn't kick you out
    if(u){ authSeen=u.id; handleAuth(u); } else if(navigator.onLine!==false){ offlineMode=false; authSeen=null; handleAuth(null); }
    return;
  }
  const id=u?.id||null; if(id===authSeen) return; authSeen=id; handleAuth(u);
}
(async()=>{
  const saved=savedLoginUser();
  if(saved&&(navigator.onLine===false||LIB_MISSING)) return startOffline(saved);
  let done=false;
  const slow=setTimeout(()=>{ if(!done&&saved&&!user) startOffline(saved,true); },4000);   // bad signal: don't sit on a blank screen
  const u=await api.session().catch(()=>null); done=true; clearTimeout(slow);
  syncAuth(u);
})();
let callStream=null;   // your camera + mic while a call is open

