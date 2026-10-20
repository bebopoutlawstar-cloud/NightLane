/* ===== PDFs: pick one, it uploads and sends right away. The file name rides along in the link. ===== */
const PDF_MAX=20e6;
function pdfName(url){ try{ const last=decodeURIComponent(new URL(url,location.href).pathname.split("/").pop()||""); return /\.pdf$/i.test(last)?last:"PDF"; }catch(e){ return "PDF"; } }
function safePdfName(n){ let b=String(n||"file").replace(/\.pdf$/i,"").normalize("NFKD").replace(/[^\w.\- ]+/g,"").replace(/\s+/g,"_").replace(/^[._-]+/,"").slice(0,60); return (b||"file")+".pdf"; }
function pdfCard(url){
  const a=el("a","pdfcard"); a.href=url; a.target="_blank"; a.rel="noopener noreferrer";
  const name=pdfName(url).replace(/_/g," ");
  const t=el("span","pdf-txt"); t.append(el("span","pdf-name",name), el("span","pdf-sub","PDF · tap to open"));
  a.append(el("span","pdf-ico","PDF"),t); a.setAttribute("aria-label","Open PDF: "+name);
  /* chat files are private: swap in a short-lived signed link (the service worker can't help with opening a new tab) */
  const m=String(url).match(PRIVATE_FILE_RE);
  let signed=null;
  if(m&&sb){ privateLink(m[1],decodeURIComponent(m[2])).then(u=>{ if(u){ signed=u; a.href=u; } }).catch(()=>{}); }
  a.addEventListener("click",async e=>{
    e.stopPropagation();
    if(!m||!sb||signed) return;   // already signed (or demo): let the link open normally
    e.preventDefault();
    const w=window.open("about:blank","_blank");   // open right away so it isn't treated as a pop-up
    const u=await privateLink(m[1],decodeURIComponent(m[2])).catch(()=>null);
    if(u){ signed=u; a.href=u; if(w) w.location.href=u; else location.href=u; }
    else { if(w) w.close(); $("status").textContent="Couldn't open that PDF. Check your connection and try again."; }
  });
  return a;
}
$("trayPdf").onclick=()=>{ closeTray(); $("pdfPicker").click(); };
$("pdfPicker").onchange=async e=>{
  const f=e.target.files?.[0]; e.target.value=""; if(!f) return;
  const isPdf=f.type==="application/pdf"||(/\.pdf$/i.test(f.name)&&!f.type);
  if(!isPdf){ $("status").textContent="That isn't a PDF. Pick a .pdf file."; return; }
  if(f.size>PDF_MAX){ $("status").textContent="That PDF is over 20 MB. Try a smaller one."; return; }
  try{
    $("status").textContent="Sending PDF…";
    const blob=f.type==="application/pdf"?f:new Blob([f],{type:"application/pdf"});
    const url=await api.upload("chat-media",user.id,blob,safePdfName(f.name));
    await sendFields({kind:"file",media_url:url,media_type:"pdf"});
    $("status").textContent="";
  }catch(err){ $("status").textContent="PDF didn't send: "+err.message; }
};
/* ---- + → Backlog: share something from your backlog into this chat ---- */
$("trayBacklog").onclick=async()=>{
  trayTab("backlog"); $("trayBlSearch").value="";
  const list=$("trayBlList"); list.innerHTML='<p class="note">Loading your backlog…</p>';
  await loadMyBacklog(); paintTrayBacklog();
};
$("trayBlSearch").oninput=()=>paintTrayBacklog();
function paintTrayBacklog(){
  const list=$("trayBlList"); list.innerHTML="";
  const q=$("trayBlSearch").value.trim().toLowerCase();
  const items=(myBl||[]).filter(it=>!it.private && (!q||String(it.title||"").toLowerCase().includes(q)));
  if(!(myBl||[]).length){
    list.append(el("p","note","Your backlog is empty. Add games and anime first, then share them here."));
    const b=el("button","ghost","📚 Open my backlog"); b.type="button"; b.onclick=()=>{ closeTray(); openBacklog(user.id); }; list.append(b); return;
  }
  if(!items.length){ list.append(el("p","note","Nothing on your backlog matches that.")); return; }
  items.forEach(it=>{
    const b=el("button","traybl"); b.type="button"; b.setAttribute("aria-label","Share "+it.title+" to this chat");
    const cov=blCover(it); if(cov) b.append(cov); else b.append(el("span","traybl-noimg",blIcon(it.type)));
    const mid=el("span","traybl-mid");
    mid.append(el("b","",it.title), el("small","",`${blIcon(it.type)} ${BL_TYPE_LABEL[it.type]||"Item"} · ${BL_STATUS[it.status]||"Planned"}${it.rating?" · "+"★".repeat(it.rating):""}`));
    b.append(mid); b.onclick=()=>shareBlHere(it); list.append(b);
  });
}
function shareBlHere(it){
  if(!room) return;
  blSharing=it; say("blNoteMsg",""); $("blNoteBox").value="";
  const prev=$("blNotePrev"); prev.innerHTML=""; prev.append(backlogMsgCard({card:{kind:"backlog",type:it.type,title:it.title,image:it.image,status:it.status,rating:it.rating,platform:it.platform,progress:it.progress,total:it.total},user_id:user.id}));
  show($("blNoteSheet")); setTimeout(()=>$("blNoteBox").focus({preventScroll:true}),80);
}
const closeBlNote=()=>show($("blNoteSheet"),false);
$("blNoteBack").onclick=closeBlNote;
$("blNoteSheet").addEventListener("click",e=>{ if(e.target.id==="blNoteSheet") closeBlNote(); });
$("blNoteBox").addEventListener("keydown",e=>{ if(e.key==="Escape"){ e.stopPropagation(); closeBlNote(); } });
$("blNoteForm").addEventListener("submit",async e=>{
  e.preventDefault(); if(!blSharing||!room) return;
  const here=inboxRows.find(r=>r.code===room)||{code:room,is_dm:isDm,dm_name:isDm&&dmUser?nameOf(dmUser):null,name:roomName};
  $("blNoteSend").disabled=true;
  try{ await blShareTo(here,$("blNoteBox").value); closeBlNote(); closeTray(); }
  finally{ $("blNoteSend").disabled=false; }
});

/* ---------- polls ---------- */
async function loadPolls(list){
  const ids=list.filter(m=>m.kind==="poll"&&!pollsById.has(m.id)).map(m=>m.id); if(!ids.length) return;
  const {polls,votes}=await api.polls(ids).catch(()=>({polls:[],votes:[]}));
  polls.forEach(p=>pollsById.set(p.message_id,{options:p.options,multi:p.multi,votes:new Map()}));
  votes.forEach(v=>{ const p=pollsById.get(v.message_id); if(p) setVote(p,v,true); });
}
function setVote(p,v,added){ let s=p.votes.get(v.option_index); if(!s) p.votes.set(v.option_index,s=new Set()); added?s.add(v.user_id):s.delete(v.user_id); }
function pollEl(m){
  const p=pollsById.get(m.id), box=el("div","poll");
  box.append(el("h4","",m.text||"Poll"));
  if(!p){ box.append(el("div","pollfoot","Loading poll…")); return box; }
  const voters=new Set(); p.votes.forEach(s=>s.forEach(u=>voters.add(u)));
  const total=[...p.votes.values()].reduce((a,s)=>a+s.size,0);
  p.options.forEach((opt,i)=>{
    const s=p.votes.get(i)||new Set(), mine=s.has(user.id), pct=total?Math.round(s.size/total*100):0;
    const b=el("button","popt"+(mine?" mine":"")); b.type="button";
    const fill=el("span","fill"); fill.style.width=pct+"%";
    b.append(fill, el("span","",(mine?"✓ ":"")+opt), el("span","n",total?`${s.size} · ${pct}%`:""));
    b.title=[...s].map(nameOf).join(", ");
    b.setAttribute("aria-label",`${opt}: ${s.size} vote${s.size===1?"":"s"}${mine?", your pick":""}`);
    b.onclick=async e=>{ e.stopPropagation();
      const had=mine; if(!p.multi&&!had) p.options.forEach((_,k)=>p.votes.get(k)?.delete(user.id));
      setVote(p,{option_index:i,user_id:user.id},!had); refreshMsg(m.id);
      try{ if(!had) sfx("tick"); await api.vote(m.id,i); if(!had) gainXP("vote"); }catch(err){ $("status").textContent="Vote didn't save: "+err.message; } };
    box.append(b);
  });
  box.append(el("div","pollfoot",`${voters.size} ${voters.size===1?"person":"people"} voted${p.multi?" · pick any":""}`));
  return box;
}
function openPollSheet(){
  $("pollQ").value=""; $("pollMulti").checked=false; say("pollMsg",""); $("pollOpts").innerHTML=""; addPollOption(); addPollOption(); show($("pollSheet")); setTimeout(()=>$("pollQ").focus(),50);
}
function addPollOption(){
  const box=$("pollOpts"); if(box.children.length>=6) return;
  const row=el("div","optrow"); const inp=el("input","field"); inp.maxLength=80; inp.placeholder=`Option ${box.children.length+1}`; inp.setAttribute("aria-label",inp.placeholder);
  const rm=el("button","","✕"); rm.type="button"; rm.setAttribute("aria-label","Remove option");
  rm.onclick=()=>{ if(box.children.length>2){ row.remove(); [...box.children].forEach((r,k)=>{ r.firstChild.placeholder=`Option ${k+1}`; }); } };
  row.append(inp,rm); box.append(row); show($("pollAdd"),box.children.length<6);
}
$("pollAdd").onclick=()=>{ addPollOption(); $("pollOpts").lastChild.firstChild.focus(); };
$("pollClose").onclick=()=>show($("pollSheet"),false);
$("pollForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const q=$("pollQ").value.trim(), opts=[...$("pollOpts").querySelectorAll("input")].map(i=>i.value.trim()).filter(Boolean);
  if(!q) return say("pollMsg","Add a question.",true);
  if(opts.length<2) return say("pollMsg","Add at least two options.",true);
  if(new Set(opts.map(o=>o.toLowerCase())).size!==opts.length) return say("pollMsg","Options need to be different.",true);
  $("pollCreate").disabled=true;
  try{ await sendFields({kind:"poll",question:q,options:opts,multi:$("pollMulti").checked}); show($("pollSheet"),false); }
  catch(err){ say("pollMsg","Couldn't post poll: "+err.message,true); }
  finally{ $("pollCreate").disabled=false; }
});

/* ---------- themes ---------- */
function validHex(c){ return typeof c==="string"&&/^#[0-9a-f]{6}$/i.test(c)?c:null; }
function textOn(hex){ const n=parseInt(hex.slice(1),16), r=n>>16&255, g=n>>8&255, b=n&255; return (0.299*r+0.587*g+0.114*b)>150?"#07041A":"#F4F7FF"; }
function savedTheme(){ try{ return JSON.parse(LS.get("nl-theme")); }catch(e){ return null; } }
function themeColors(t){ if(!t) return THEMES.night; if(t.preset&&t.preset!=="custom"&&THEMES[t.preset]) return THEMES[t.preset]; return {main:validHex(t.main)||THEMES.night.main,accent:validHex(t.accent)||THEMES.night.accent,hi:validHex(t.hi)||THEMES.night.hi}; }
function applyTheme(t,persist=true){
  const c=themeColors(t), r=document.documentElement.style;
  r.setProperty("--cyan",c.main); r.setProperty("--mag",c.accent); r.setProperty("--volt",c.hi);
  [...document.body.classList].filter(c=>c.startsWith("theme-")).forEach(c=>document.body.classList.remove(c));
  if(t?.preset&&THEMES[t.preset]?.body) document.body.classList.add("theme-"+THEMES[t.preset].body);
  if(persist) try{ LS.set("nl-theme",JSON.stringify(t||{preset:"night"})); }catch(e){}
}
let themeAtOpen=null;
applyTheme(savedTheme());
let draftTheme=null, draftBubble=null;
function paintThemeSheet(){
  const grid=$("presetGrid"); grid.innerHTML="";
  const cur=draftTheme.preset||"custom";
  Object.entries(THEMES).filter(([id])=>unlockOk("theme",id)).forEach(([id,t])=>{
    const b=el("button","preset"); b.type="button"; b.setAttribute("aria-pressed",cur===id);
    const dots=el("span","dots"); [t.main,t.accent,t.hi].forEach(c=>{ const i=el("i"); i.style.background=c; dots.append(i); });
    b.append(dots,t.label); b.onclick=()=>{ draftTheme={preset:id,frame:draftTheme.frame||null}; previewTheme(); }; grid.append(b);
  });
  const cb=el("button","preset"); cb.type="button"; cb.setAttribute("aria-pressed",cur==="custom");
  const cd=el("span","dots"); const cc=themeColors(draftTheme); [cc.main,cc.accent,cc.hi].forEach(c=>{ const i=el("i"); i.style.background=c; cd.append(i); });
  cb.append(cd,"Custom"); cb.onclick=()=>{ const c=themeColors(draftTheme); draftTheme={preset:"custom",...c,frame:draftTheme.frame||null}; previewTheme(); }; grid.append(cb);
  const c=themeColors(draftTheme); $("colMain").value=c.main; $("colAccent").value=c.accent; $("colHi").value=c.hi;
  const sw=$("bubbleSwatches"); sw.innerHTML="";
  const reset=el("button","reset"); reset.type="button"; reset.setAttribute("aria-label","Default bubble"); reset.setAttribute("aria-pressed",!draftBubble); reset.onclick=()=>{ draftBubble=null; previewTheme(); }; sw.append(reset);
  BUBBLES.forEach(h=>{ const b=el("button"); b.type="button"; b.style.background=h; b.setAttribute("aria-label","Bubble color "+h); b.setAttribute("aria-pressed",draftBubble&&draftBubble.toLowerCase()===h.toLowerCase()); b.onclick=()=>{ draftBubble=h; previewTheme(); }; sw.append(b); });
  if(draftBubble) $("colBubble").value=draftBubble;
  const pm=$("themePreviewMsg"); paintFace($("themePreviewFace"),meProfile);
  if(draftBubble){ pm.classList.add("custom"); pm.style.setProperty("--bub",draftBubble); pm.style.setProperty("--bubtext",textOn(draftBubble)); } else { pm.classList.remove("custom"); }
  paintFrameRow();
}
function previewTheme(){ applyTheme(draftTheme,false); paintThemeSheet(); }
["colMain","colAccent","colHi"].forEach(id=>$(id).addEventListener("input",()=>{ draftTheme={preset:"custom",main:$("colMain").value,accent:$("colAccent").value,hi:$("colHi").value,frame:draftTheme.frame||null}; applyTheme(draftTheme,false); paintThemeSheet(); }));
$("colBubble").addEventListener("input",e=>{ draftBubble=e.target.value; paintThemeSheet(); });
$("openTheme").onclick=()=>{ themeAtOpen=meProfile?.theme||savedTheme()||{preset:"night"}; draftTheme=themeAtOpen; draftBubble=validHex(meProfile?.bubble_color); say("themeMsg",""); show($("profile"),false); paintThemeSheet(); show($("themeSheet")); };
$("themeClose").onclick=()=>{ applyTheme(themeAtOpen||meProfile?.theme||savedTheme()); show($("themeSheet"),false); };
$("themeSave").onclick=async()=>{
  $("themeSave").disabled=true;
  try{
    const style={theme:{...draftTheme,...(meProfile?.theme?.card?{card:meProfile.theme.card}:{}),...(meProfile?.theme?.dice?{dice:meProfile.theme.dice}:{})},bubble_color:draftBubble};   // keep the profile card and dice look
    await api.saveStyle(user.id,style);
    meProfile={...meProfile,...style}; cache.set(user.id,meProfile); applyTheme(draftTheme); gainXP("theme"); paintMe(); if(room) repaintFaces(user.id);
    if(room) renderAll(false);
    say("themeMsg","Saved."); setTimeout(()=>show($("themeSheet"),false),500);
  }catch(err){ say("themeMsg","Couldn't save: "+err.message,true); }
  finally{ $("themeSave").disabled=false; }
};

/* ---------- previews for replies, pins, inbox ---------- */
/* ===== notices ("Bebop changed the background to Nebula") ===== */
function noticeWhat(m){
  const [k,v]=(m.text||"").split(/:(.*)/s);
  if(k==="bg"){ const lab=(BACKGROUNDS.find(([id])=>id===v)||[])[1]||(/^#/.test(v||"")?"a custom color":"Stars"); return "🎨 changed the background to "+lab; }
  if(k==="icon") return v==="removed"?"🖼️ removed the room picture":"🖼️ changed the room picture";
  if(k==="add"){ const names=(v||"").split(",").map(x=>x.split("|")[1]||"someone"); const list=names.length>2?names.slice(0,-1).join(", ")+", and "+names.at(-1):names.join(" and "); return "👋 added "+list; }
  return "updated the room";
}
const noticeText=m=>{ const [emo,...rest]=noticeWhat(m).split(" "); return `${emo} ${m.user_id===user.id?"You":nameOf(m.user_id)} ${rest.join(" ")}`; };

/* ===== times in your timezone ===== */
const myTz=()=>{ try{ return Intl.DateTimeFormat().resolvedOptions().timeZone||null; }catch(e){ return null; } };
function tzParts(tz,date){ const o={}; new Intl.DateTimeFormat("en-US",{timeZone:tz,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).formatToParts(date).forEach(x=>o[x.type]=+x.value||x.value); return o; }
function wallToUtc(tz,y,mo,d,h,mi){   // "8:00 PM on this day, in their timezone" → the real moment
  let guess=Date.UTC(y,mo-1,d,h,mi);
  for(let i=0;i<2;i++){ const p=tzParts(tz,new Date(guess)); const shown=Date.UTC(p.year,p.month-1,p.day,p.hour%24,p.minute); guess+=Date.UTC(y,mo-1,d,h,mi)-shown; }
  return new Date(guess);
}
const TZ_TIME_RE=/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s?(a\.?m\.?|p\.?m\.?)(?![a-z])|\b(1[3-9]|2[0-3]):([0-5]\d)\b/gi;
function annotateTimes(node,m){
  const theirs=cache.get(m.user_id)?.tz, mine=myTz();
  if(!theirs||!mine||theirs===mine||m.user_id===user.id) return;
  const sent=new Date(m.created_at), day=tzParts(theirs,sent);
  const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT,{acceptNode:t=>t.parentElement.closest("a,.tznote")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const texts=[]; while(walker.nextNode()) texts.push(walker.currentNode);
  for(const t of texts){
    const str=t.nodeValue; TZ_TIME_RE.lastIndex=0; let mt, last=0, frag=null;
    while((mt=TZ_TIME_RE.exec(str))){
      let h, mi;
      if(mt[4]){ h=+mt[4]; mi=+mt[5]; } else { h=+mt[1]%12; mi=+(mt[2]||0); if(/^p/i.test(mt[3])) h+=12; }
      const when=wallToUtc(theirs,day.year,day.month,day.day,h,mi);
      const mineP=tzParts(mine,when); if(mineP.hour===h&&mineP.minute===mi) continue;   // same clock time, nothing to add
      let label=when.toLocaleTimeString([],{hour:"numeric",minute:mi?"2-digit":undefined});
      const dd=Date.UTC(mineP.year,mineP.month-1,mineP.day)-Date.UTC(day.year,day.month-1,day.day);
      if(dd) label+=dd>0?" next day":" day before";
      frag=frag||document.createDocumentFragment();
      frag.append(str.slice(last,mt.index+mt[0].length), el("span","tznote",` (${label} your time)`));
      last=mt.index+mt[0].length;
    }
    if(frag){ frag.append(str.slice(last)); t.replaceWith(frag); }
  }
}

/* ===== room pictures ===== */
const roomIcons=new Map();
function roomIconEl(url,cls="roomicon"){ const i=document.createElement("img"); i.className=cls; i.src=url; i.alt=""; i.loading="lazy"; i.onerror=()=>i.remove(); return i; }
function paintRoomIcon(){
  $("roomLabel").querySelector(".roomicon")?.remove();
  const url=!isDm&&roomIcons.get(room); if(url) $("roomLabel").prepend(roomIconEl(url));
  const pv=$("riPreview"); if(pv){ pv.innerHTML=""; if(url) pv.append(roomIconEl(url,"roomicon big")); else pv.textContent="#"; show($("riRemove"),!!url); }
}
function previewOf(m){
  if(m.kind==="notice") return noticeWhat(m);
  if(!m) return "";
  if(isBlCard(m)) return m.text||"🎮 Backlog item";
  if(isEcard(m)) return "💌 Card: "+ECARD_TEMPLATES[m.card.template].title;
  if(m.kind==="poll") return "📊 "+(m.text||"Poll");
  if(m.kind==="game") return "🎮 "+(m.text||"Game");
  if(m.kind==="sticker"||m.sticker) return "Sticker "+(STICKERS[m.sticker]?.label?`(${STICKERS[m.sticker].label})`:"");
  if(m.media_type==="audio"||m.kind==="audio") return "🎤 Voice message";
  if(m.media_type==="pdf"||m.kind==="file") return "📄 "+(m.media_url?pdfName(m.media_url).replace(/_/g," "):"PDF");
  if(m.media_type==="video"||m.kind==="video") return "🎬 Video"+(m.text?": "+m.text:"");
  if(m.image_urls?.length>1&&!m.text) return `📷 ${m.image_urls.length} photos`;
  if(m.image_url&&!m.text) return "📷 Photo";
  return m.text||"";
}

/* ---------- overlays ---------- */
function openLightbox(urls,i){
  lbAlbum=urls.length>1?urls:null; lbIndex=i; lbReset(false); $("lightImg").src=urls[i];
  show($("lbPrev"),!!lbAlbum); show($("lbNext"),!!lbAlbum); lbPaintCount(); show($("lightbox"));
}
function lbStep(d){ if(!lbAlbum) return; lbIndex=(lbIndex+d+lbAlbum.length)%lbAlbum.length; lbReset(false); $("lightImg").src=lbAlbum[lbIndex]; lbPaintCount(); }
function lbPaintCount(){ $("lbCount").textContent=lbAlbum?`${lbIndex+1} / ${lbAlbum.length}`:""; $("lbHint").textContent=lbAlbum?"Swipe for more · pinch or double-tap to zoom":"Pinch or double-tap to zoom"; }
$("lbPrev").onclick=e=>{ e.stopPropagation(); lbStep(-1); };
$("lbNext").onclick=e=>{ e.stopPropagation(); lbStep(1); };
$("lbClose").onclick=e=>{ e.stopPropagation(); show($("lightbox"),false); };
/* zoom + pan: the photo is scaled by lbZ and moved by lbX/lbY (pixels from the center) */
let lbZ=1, lbX=0, lbY=0;
const LB_MAX=5;
function lbApply(ease){ const img=$("lightImg"); img.classList.toggle("ease",!!ease); img.style.transform=lbZ===1&&!lbX&&!lbY?"":`translate(${lbX}px,${lbY}px) scale(${lbZ})`; $("lbStage").classList.toggle("zoomed",lbZ>1); }
function lbReset(ease){ lbZ=1; lbX=0; lbY=0; lbApply(ease); }
function lbClamp(){   // keep the photo from being dragged off into empty space
  const img=$("lightImg"), st=$("lbStage").getBoundingClientRect();
  const w=img.offsetWidth*lbZ, h=img.offsetHeight*lbZ, mx=Math.max(0,(w-st.width)/2), my=Math.max(0,(h-st.height)/2);
  lbX=Math.min(mx,Math.max(-mx,lbX)); lbY=Math.min(my,Math.max(-my,lbY));
}
function lbZoomAt(z,cx,cy,ease){   // zoom to z, keeping the screen point (cx,cy) under your finger
  const st=$("lbStage").getBoundingClientRect(), px=cx-(st.left+st.width/2), py=cy-(st.top+st.height/2);
  z=Math.min(LB_MAX,Math.max(1,z)); const k=z/lbZ;
  lbX=px-(px-lbX)*k; lbY=py-(py-lbY)*k; lbZ=z;
  if(lbZ<=1.01){ lbZ=1; lbX=0; lbY=0; } else lbClamp();
  lbApply(ease);
}
(()=>{
  const stage=$("lbStage"), pts=new Map();
  let pinch=null, pan=null, swipe=null, lastTap=0, tapTimer=null;
  const dist=()=>{ const [a,b]=[...pts.values()]; return Math.hypot(a.x-b.x,a.y-b.y); };
  const mid=()=>{ const [a,b]=[...pts.values()]; return {x:(a.x+b.x)/2,y:(a.y+b.y)/2}; };
  stage.addEventListener("pointerdown",e=>{
    stage.setPointerCapture?.(e.pointerId); pts.set(e.pointerId,{x:e.clientX,y:e.clientY,t:Date.now(),sx:e.clientX,sy:e.clientY,onImg:e.target===$("lightImg")});
    if(pts.size===2){ pinch={d:dist(),z:lbZ}; pan=null; swipe=null; }
    else if(pts.size===1){ pan={x:e.clientX,y:e.clientY,ox:lbX,oy:lbY}; swipe={x:e.clientX,y:e.clientY}; }
  });
  stage.addEventListener("pointermove",e=>{
    const p=pts.get(e.pointerId); if(!p) return; p.x=e.clientX; p.y=e.clientY;
    if(pinch&&pts.size===2){ const m=mid(); lbZoomAt(pinch.z*dist()/pinch.d,m.x,m.y,false); }
    else if(pan&&lbZ>1){ lbX=pan.ox+(e.clientX-pan.x); lbY=pan.oy+(e.clientY-pan.y); lbClamp(); lbApply(false); }
    else if(swipe&&lbAlbum){ const dx=e.clientX-swipe.x; $("lightImg").style.transform=`translateX(${dx}px)`; }
  });
  const end=e=>{
    const p=pts.get(e.pointerId); if(!p) return; pts.delete(e.pointerId);
    if(pts.size<2) pinch=null;
    if(pts.size===1){ const q=[...pts.values()][0]; pan={x:q.x,y:q.y,ox:lbX,oy:lbY}; return; }   // lifted one finger of a pinch: keep panning with the other
    const moved=Math.hypot(e.clientX-p.sx,e.clientY-p.sy), quick=Date.now()-p.t<300;
    if(swipe&&lbZ===1){
      const dx=e.clientX-swipe.x;
      if(lbAlbum&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(e.clientY-swipe.y)){ lbStep(dx<0?1:-1); swipe=null; pan=null; return; }
      if(!moved||moved<10) lbApply(false); else lbReset(true);
    }
    swipe=null; pan=null;
    if(moved<10&&quick&&e.type==="pointerup"){
      const now=Date.now();
      if(now-lastTap<300){ clearTimeout(tapTimer); lastTap=0; if(lbZ>1) lbReset(true); else lbZoomAt(2.5,e.clientX,e.clientY,true); return; }
      lastTap=now;
      const onPhoto=p.onImg;   // where the finger went down (pointerup reports the stage because of pointer capture)
      clearTimeout(tapTimer); tapTimer=setTimeout(()=>{ if(!onPhoto&&lbZ===1) show($("lightbox"),false); },300);   // one tap on the dark area closes
    }
  };
  stage.addEventListener("pointerup",end); stage.addEventListener("pointercancel",end);
  stage.addEventListener("wheel",e=>{ e.preventDefault(); lbZoomAt(lbZ*(e.deltaY<0?1.2:1/1.2),e.clientX,e.clientY,false); },{passive:false});
  addEventListener("resize",()=>{ if(!$("lightbox").classList.contains("hidden")){ lbClamp(); lbApply(false); } });
})();
["profile","roomSheet","msgMenu","pollSheet","summarySheet","calSheet","searchSheet","backlogSheet","blShareSheet","forgotSheet","rcSheet"].forEach(id=>$(id).addEventListener("click",e=>{ if(e.target.id===id) show($(id),false); }));
addEventListener("keydown",e=>{
  if(e.key==="Escape") closeTray();
  if(e.key==="Escape") ["micHelp","lightbox","profile","roomSheet","msgMenu","pollSheet","tray","themeSheet","gameSheet","personSheet","summarySheet","calSheet","searchSheet","installSheet","habitsSheet","quizSheet","slSheet","newsSheet","backlogSheet","blShareSheet","recover","forgotSheet","rcSheet","rulesSheet","cheatSheet","arcanaSheet"].forEach(id=>{ const n=$(id); if(n) show(n,false); });
  if(!$("lightbox").classList.contains("hidden")&&lbAlbum){ if(e.key==="ArrowLeft") lbStep(-1); if(e.key==="ArrowRight") lbStep(1); }
});

/* ================= PUSH NOTIFICATIONS ================= */
let swReg=null;
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const installed=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost")){
  navigator.serviceWorker.register("sw.js").then(r=>swReg=r).catch(()=>{});
  navigator.serviceWorker.addEventListener("message",e=>{ if(e.data?.room==="@reports"){ if(user&&isAdmin) openReviews(); else pendingOpenReports=true; return; } if(e.data?.room && user){ ["profile","roomSheet","msgMenu"].forEach(id=>show($(id),false)); enterRoom(e.data.room); } });
}
function b64ToBytes(b){ const p="=".repeat((4-b.length%4)%4), s=atob((b+p).replace(/-/g,"+").replace(/_/g,"/")); return Uint8Array.from(s,c=>c.charCodeAt(0)); }
async function currentSub(){ const r=await swReady(); return r ? r.pushManager.getSubscription() : null; }
async function paintNotif(){
  const btn=$("notifBtn");
  if(!sb||!VAPID_PUBLIC_KEY){ btn.disabled=true; btn.textContent="Notifications: not set up yet"; return; }
  if(isIOS&&!installed){ btn.disabled=false; btn.textContent="📲 Install the app to get notifications"; btn.dataset.install="1"; return; }
  delete btn.dataset.install;
  const reg=await swReady();
  if(!reg||!("PushManager" in window)||BROWSER.name==="opera"){ btn.disabled=true;
    btn.textContent=BROWSER.ios?"Open NightLane from your home screen icon for notifications":BROWSER.android?"No notifications in this browser: open NightLane in Chrome or get the Play Store app":"Notifications don't work in this browser: try Chrome or Edge"; return; }
  if(Notification.permission==="denied"){ btn.disabled=true; btn.textContent="Notifications blocked in settings"; return; }
  const subbed=!!(await currentSub());
  btn.disabled=false; btn.textContent=subbed?"Turn off notifications":"Turn on notifications"; show($("notifTest"),subbed);
}
async function pushOn(){
  if(await Notification.requestPermission()!=="granted") throw new Error("Permission wasn't given.");
  const reg=await swReady(); if(!reg) throw new Error("The app is still starting up. Try again in a second.");
  const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToBytes(VAPID_PUBLIC_KEY)});
  await api.savePush(sub.toJSON());
  try{ LS.set("nl-push-on","1"); LS.set("nl-push-off",""); }catch(e){}
  show($("pushNudge"),false);
}
/* the service worker can still be starting when the app opens: wait for it (up to 5 seconds) */
async function swReady(){
  if(swReg) return swReg;
  if(!("serviceWorker" in navigator)) return null;
  try{ const r=await Promise.race([navigator.serviceWorker.ready,new Promise(res=>setTimeout(()=>res(null),5000))]); if(r) swReg=r; }catch(e){}
  return swReg;
}
// Phones can quietly drop a push subscription (iPhone does it after a few "silent" pushes, OS updates,
// long idle...) without telling the app. So every time the app opens (and when you come back to it):
//  - still subscribed? re-save it, so the server always has the current one
//  - lost it, but you never turned notifications off yourself? quietly sign back up
//  - the phone won't let us do that without a tap (iPhone)? show a one-tap "turn them back on" bar
let pushCheckAt=0;
async function refreshPushSubscription(){
  try{
    if(!sb||!VAPID_PUBLIC_KEY||!user||!("PushManager" in window)||!("Notification" in window)) return;
    if(isIOS&&!installed) return;
    pushCheckAt=Date.now();
    let off=false, wasOn=false; try{ off=LS.get("nl-push-off")==="1"; wasOn=LS.get("nl-push-on")==="1"; }catch(e){}
    if(off) return;   // you turned them off on purpose
    const reg=await swReady(); if(!reg) return;
    const had=await reg.pushManager.getSubscription();
    const perm=Notification.permission;
    if(perm==="denied") return;
    if(!had&&!wasOn&&perm!=="granted") return;   // never turned on here
    if(perm==="granted"){
      try{
        const sub=had||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToBytes(VAPID_PUBLIC_KEY)});
        await api.savePush(sub.toJSON());
        try{ LS.set("nl-push-on","1"); }catch(e){}
        show($("pushNudge"),false); return;
      }catch(e){ if(had) return; }   // couldn't sign back up without a tap: fall through to the bar
    }
    show($("pushNudge"),true);
  }catch(e){ /* best-effort; the toggle in Profile still works */ }
}
$("pushNudge").onclick=async()=>{
  $("pushNudge").disabled=true;
  try{ await pushOn(); $("status").textContent="🔔 Notifications are back on."; }
  catch(err){ show($("pushNudge"),false); $("status").textContent="Couldn't turn notifications on: "+err.message; }
  $("pushNudge").disabled=false; paintNotif().catch(()=>{});
};
document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&user&&Date.now()-pushCheckAt>10*60*1000) refreshPushSubscription(); });
async function pushOff(){ const sub=await currentSub(); if(!sub) return; await api.deletePush(sub.endpoint); await sub.unsubscribe(); }
function pushOffOnPurpose(){ try{ LS.set("nl-push-off","1"); LS.set("nl-push-on",""); }catch(e){} show($("pushNudge"),false); }
$("notifBtn").onclick=async()=>{
  if($("notifBtn").dataset.install){ show($("profile"),false); openInstallSheet(); return; }
  $("notifBtn").disabled=true;
  try{
    if(await currentSub()){ await pushOff(); pushOffOnPurpose(); say("profMsg","Notifications off."); }
    else { await pushOn(); say("profMsg","Notifications on for rooms you've joined."); }
  }catch(err){ say("profMsg",err.message,true); }
  paintNotif();
};


