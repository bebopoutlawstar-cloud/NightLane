/* ================= CONTACTS & PRIVATE CHATS ================= */
function setFrontTab(t){
  $("tabChats").setAttribute("aria-selected",t==="chats"); $("tabLanes").setAttribute("aria-selected",t==="lanes"); $("tabDms").setAttribute("aria-selected",t==="dms"); $("tabContacts").setAttribute("aria-selected",t==="contacts");
  show($("chatsPane"),t==="chats"); show($("lanesPane"),t==="lanes"); show($("dmsPane"),t==="dms"); show($("contactsPane"),t==="contacts");
  if(t==="lanes") paintLanes();
  if(t==="contacts") loadContacts();
  try{ LS.set("nl-front-tab",t); }catch(e){}
}
$("tabChats").onclick=()=>setFrontTab("chats"); $("tabLanes").onclick=()=>setFrontTab("lanes"); $("tabDms").onclick=()=>setFrontTab("dms"); $("tabContacts").onclick=()=>setFrontTab("contacts");
function setTabBadge(id,n){ const bdg=$(id); bdg.textContent=n>99?"99+":String(n); show(bdg,n>0); }
const isFriend=uid=>contactIds.includes(uid);
const addedMe=uid=>addedMeIds.includes(uid);
async function addFriend(uid){
  if(isFriend(uid)) return;
  await api.addContact(uid); contactIds.push(uid); if(addedMe(uid)) sfx("friend"); gainXP("friend");   // 🤝 the chime plays when it makes you friends both ways
  refreshFriendUI();
}
async function removeFriend(uid){
  await api.removeContact(uid); contactIds=contactIds.filter(x=>x!==uid);
  refreshFriendUI();
}
function refreshFriendUI(){
  if(!$("contactsPane").classList.contains("hidden")) loadContacts(); else paintFriendBadge();
  if(!$("roomSheet").classList.contains("hidden")) paintMembers();
  if(personUid&&!$("personSheet").classList.contains("hidden")) paintPerson();
  if(!$("front").classList.contains("hidden")) loadInbox();
}
function dismissedRequests(){ try{ return JSON.parse(LS.get("nl-dismissed-req")||"[]"); }catch(e){ return []; } }
function pendingRequests(){ const d=dismissedRequests(); return addedMeIds.filter(id=>!isFriend(id)&&!blocked.has(id)&&!d.includes(id)&&cache.has(id)); }
function paintFriendBadge(){ setTabBadge("badgeFriends",pendingRequests().length); }
async function loadContacts(){
  if(!user) return;
  [contactIds,addedMeIds]=await Promise.all([api.contacts().catch(()=>contactIds),api.addedMe().catch(()=>addedMeIds)]);
  await ensureProfiles([...contactIds,...addedMeIds]);
  if(Date.now()-(loadRel.at||0)>60000){ loadRel.at=Date.now(); loadRel(); }   // 💞 partner tags + asks (at most once a minute)
  if(Date.now()-(loadContacts.fresh||0)>30000){ loadContacts.fresh=Date.now(); await refreshProfiles(contactIds); }   // fresh statuses, at most every 30s
  // people who added you, that you haven't added back
  const reqBox=$("requestList"); reqBox.innerHTML="";
  const reqs=pendingRequests();
  show($("requestsTitle"),reqs.length>0); paintFriendBadge();
  reqs.forEach(uid=>{
    const p=cache.get(uid), row=el("div","contactrow");
    const f=el("span","face"); paintFace(f,p);
    const n=el("span","cname",p.username); n.append(el("span","tagline","added you as a friend"));
    const add=el("button","send","Add back"); add.type="button";
    add.onclick=async()=>{ try{ await addFriend(uid); say("contactMsg",`You and ${p.username} are friends now 🤝`); }catch(err){ say("contactMsg",err.message,true); } };
    const x=el("button","rm","✕"); x.type="button"; x.setAttribute("aria-label",`Dismiss ${p.username}`);
    x.onclick=()=>{ const d=dismissedRequests(); d.push(uid); try{ LS.set("nl-dismissed-req",JSON.stringify(d)); }catch(e){} loadContacts(); };
    row.append(f,n,add,x); reqBox.append(row);
  });
  paintContactList();
}
/* ===== friends list: ⭐ favorites, then 🟢 online, then offline (folds up), with a search box ===== */
const favKey=()=>"nl-fav-friends-"+(user?.id||"");
function favSet(){ try{ return new Set(JSON.parse(LS.get(favKey())||"[]")); }catch(e){ return new Set(); } }
function toggleFav(uid){ const f=favSet(); f.has(uid)?f.delete(uid):f.add(uid); try{ LS.set(favKey(),JSON.stringify([...f])); }catch(e){} paintContactList(); }
let offlineOpen=null;   // null = decide by size
function paintContactList(){
  const box=$("contactList"); box.innerHTML="";
  const ids=contactIds.filter(id=>cache.has(id)&&!blocked.has(id)).sort((a,b)=>cache.get(a).username.localeCompare(cache.get(b).username));
  show($("contactEmpty"),!ids.length); show($("friendsTitle"),ids.length>0);
  show($("friendFindWrap"),ids.length>=8);
  const q=ids.length>=8?$("friendFind").value.trim().toLowerCase().replace(/^@/,""):"";
  const shown=q?ids.filter(uid=>cache.get(uid).username.toLowerCase().includes(q)):ids;
  if(q&&!shown.length){ box.append(el("p","fnone",`No friends match "${q}".`)); return; }
  const favs=favSet(), isOn=uid=>!!statusOf(uid);
  const fav=shown.filter(uid=>favs.has(uid)), rest=shown.filter(uid=>!favs.has(uid));
  const on=rest.filter(isOn), off=rest.filter(uid=>!isOn(uid));
  const many=ids.length>=8;   // small lists stay one simple list
  if(!many&&!fav.length){ shown.sort((a,b)=>isOn(b)-isOn(a)).forEach(uid=>box.append(contactRow(uid,favs))); return; }
  if(fav.length){ box.append(el("h4","fsec",`⭐ Favorites`)); fav.forEach(uid=>box.append(contactRow(uid,favs))); }
  if(on.length){ box.append(el("h4","fsec",`🟢 Online now · ${on.length}`)); on.forEach(uid=>box.append(contactRow(uid,favs))); }
  if(off.length){
    const d=document.createElement("details"); d.className="fgroup";
    d.open=!!q||(offlineOpen!=null?offlineOpen:off.length<=8);
    const sm=el("summary","fsec",`Offline · ${off.length}`); d.append(sm);
    d.addEventListener("toggle",()=>{ if(!q) offlineOpen=d.open; });
    off.forEach(uid=>d.append(contactRow(uid,favs))); box.append(d);
  }
}
$("friendFind").addEventListener("input",paintContactList);
let contactPaintTimer=null;
function contactsPresenceSoon(){ if($("contactsPane").classList.contains("hidden")) return; clearTimeout(contactPaintTimer); contactPaintTimer=setTimeout(()=>{ if(document.activeElement?.closest?.("#contactList")) return; paintContactList(); },1500); }
function contactRow(uid,favs){
  {
    const p=cache.get(uid), row=el("div","contactrow");
    const f=el("span","face"); paintFace(f,p); f.style.cursor="pointer"; f.onclick=()=>openPerson(uid);
    const n=el("span","cname",p.username);
    { const sl=statusLine(p,true); if(sl) n.append(el("span","tagline cstatus",sl)); }
    if(addedMe(uid)) n.append(el("span","tagline","🤝 mutual friends"));
    const dm=inboxRows.find(r=>r.is_dm&&r.dm_user===uid); if(dm&&+dm.unread>0) n.append(el("small","",`${dm.unread} unread`));
    const badge=linkBadge(uid); if(badge){ badge.onclick=e=>{ e.stopPropagation(); openSocialLink(uid); }; badge.style.cursor="pointer"; n.append(badge); }
    const go=el("button","send","Message"); go.type="button"; go.onclick=()=>openDm(uid);
    const rm=el("button","rm","✕"); rm.type="button"; rm.setAttribute("aria-label",`Remove ${p.username} from friends`);
    rm.onclick=async()=>{ if(!await nlAlert({ kind:"err", title:"Remove friend?", badge:"DANGER", text:`Remove ${p.username} from your friends? You'll stop showing in each other's friend list.`, status:"AWAITING INPUT", buttons:[{label:"REMOVE", value:true},{label:"KEEP", value:false}] })) return; try{ await removeFriend(uid); }catch(err){ say("contactMsg",err.message,true); } };
    const st=el("button","fav"+(favs.has(uid)?" on":""),favs.has(uid)?"★":"☆"); st.type="button";
    st.setAttribute("aria-pressed",String(favs.has(uid))); st.setAttribute("aria-label",(favs.has(uid)?"Unfavorite ":"Favorite ")+p.username);
    st.onclick=()=>toggleFav(uid);
    if(!statusOf(uid)) row.classList.add("offline");
    row.append(st,f,n,go,rm); return row;
  }
}
$("contactAdd").onclick=async()=>{
  const name=$("contactName").value.trim().replace(/^@/,"");
  if(!/^[A-Za-z0-9_]{3,20}$/.test(name)) return say("contactMsg","Type their exact username (3–20 letters, numbers, _).",true);
  $("contactAdd").disabled=true;
  try{
    const p=await api.findUser(name);
    if(!p) throw new Error(`No one is called ${name}. Check the spelling.`);
    if(p.id===user.id) throw new Error("That's you!");
    cache.set(p.id,{...cache.get(p.id),...p});
    if(isFriend(p.id)) throw new Error(`${p.username} is already your friend.`);
    await addFriend(p.id); $("contactName").value="";
    say("contactMsg",addedMe(p.id)?`You and ${p.username} are friends now 🤝`:`Added ${p.username} as a friend.`); loadContacts();
  }catch(err){ say("contactMsg",isNetworkError(err)?"You're offline. Try again when you're back.":err.message,true); }
  finally{ $("contactAdd").disabled=false; }
};
$("contactName").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); $("contactAdd").click(); } });
async function openDm(uid){
  const name=nameOf(uid)||cache.get(uid)?.username||"them";
  try{
    const code=await api.startDm(uid);
    await enterRoom(code);
  }catch(err){
    const msg=err.message==="not_connected"?`You can message ${name} once you share a room, or after they add you as a friend.`
             :err.message==="cant_message"?`You can't message ${name}.`:isNetworkError(err)?"You're offline. Chats open again when you're back.":"Couldn't open the chat: "+err.message;
    if(!$("personSheet").classList.contains("hidden")) say("personMsg",msg,true);
    else if($("chat").classList.contains("hidden")) say("contactMsg",msg,true); else $("status").textContent=msg;
  }
}

/* ---------- person card (tap someone's picture) ---------- */
let personUid=null;
/* ===== profile status (MySpace style): an emoji + a short line, set from your Profile ===== */
const STATUS_PRESETS=[["🎮","Gaming"],["📚","Studying"],["💼","At work"],["🍿","Watching something"],["🎧","Vibing to music"],["😴","Sleeping"],["🍕","Eating"],["🏋️","At the gym"],["🚗","On the road"],["🤒","Feeling sick"],["🎉","Out with friends"],["💭","Thinking…"]];
const STATUS_EMOJIS=["💭","🎮","📚","💼","🍿","🎧","😴","🍕","🏋️","🚗","🤒","🎉","😎","🥳","😤","😭","🔥","💀","✨","🌙","☕","🎨","💻","⚽","🏀","🎤","❤️","👻"];
function statusAgo(at){
  const t=Date.parse(at); if(!t) return ""; const m=Math.max(0,Math.round((Date.now()-t)/60000));
  return m<1?"just now":m<60?m+"m ago":m<1440?Math.round(m/60)+"h ago":Math.round(m/1440)+"d ago";
}
const statusExpired=p=>!!(p?.status_until&&Date.parse(p.status_until)<=Date.now());   // "clear after" time has passed
function statusLeft(p){   // "clears in 1h 20m"
  const t=Date.parse(p?.status_until||""); if(!t) return ""; const m=Math.max(1,Math.ceil((t-Date.now())/60000));
  return "clears in "+(m<60?m+"m":Math.floor(m/60)+"h"+(m%60?" "+(m%60)+"m":""));
}
function statusLine(p,short){   // "🎮 grinding ranked · 2h ago"
  if(!p||!(p.status_emoji||p.status_text)||statusExpired(p)) return "";
  const txt=[p.status_emoji,p.status_text].filter(Boolean).join(" ");
  return short?txt:txt+(p.status_at?" · "+statusAgo(p.status_at):"");
}
function paintMyStatus(){
  const b=$("myStatus"); if(!b) return;
  const sl=statusLine(meProfile);
  b.textContent=sl?sl+(meProfile?.status_until?" · "+statusLeft(meProfile):""):"💭 Set a status"; b.classList.toggle("empty",!sl);
  if(!sl&&statusExpired(meProfile)&&!paintMyStatus.clearing){   // my timer ran out: tidy it up on the server too
    paintMyStatus.clearing=true; saveMyStatus(null,"").catch(()=>{}).finally(()=>{ paintMyStatus.clearing=false; });
  }
}
let stEmoji="💭";
function openStatusSheet(){
  stEmoji=meProfile?.status_emoji||"💭"; $("stText").value=meProfile?.status_text||""; say("stMsg","");
  $("stEmoji").textContent=stEmoji; show($("stEmojis"),false);
  { let last="0"; try{ last=LS.get("nl-status-until")||"0"; }catch(e){} $("stUntil").value=["0","30","120","240","1440"].includes(last)?last:"0"; } show($("stClear"),!!(meProfile?.status_emoji||meProfile?.status_text));
  const pr=$("stPresets"); pr.innerHTML="";
  STATUS_PRESETS.forEach(([e,t])=>{ const b=el("button","stpreset",e+" "+t); b.type="button"; b.onclick=()=>{ stEmoji=e; $("stEmoji").textContent=e; $("stText").value=t; $("stText").focus(); }; pr.append(b); });
  const em=$("stEmojis"); em.innerHTML="";
  STATUS_EMOJIS.forEach(e=>{ const b=el("button","",e); b.type="button"; b.setAttribute("aria-label","Use "+e); b.onclick=()=>{ stEmoji=e; $("stEmoji").textContent=e; show(em,false); }; em.append(b); });
  show($("statusSheet"));
}
async function saveMyStatus(emoji,text,mins=0){
  text=String(text||"").trim().slice(0,60);
  if(text&&!emoji) emoji="💭";
  const until=text&&mins>0?new Date(Date.now()+mins*60000).toISOString():null;
  const r=await api.setStatus(user.id,text?emoji:null,text||null,until)||{};
  meProfile={...meProfile,status_emoji:text?emoji:null,status_text:text||null,status_at:text?new Date().toISOString():null,status_until:r.noTimer?null:until};
  cache.set(user.id,meProfile); paintMyStatus();
}
$("myStatus").onclick=openStatusSheet;
$("stEmoji").onclick=()=>show($("stEmojis"),$("stEmojis").classList.contains("hidden"));
$("stClose").onclick=()=>show($("statusSheet"),false);
$("statusForm").onsubmit=async e=>{
  e.preventDefault(); const text=$("stText").value.trim();
  if(!text) return say("stMsg","Type a status, or tap Clear status.",true);
  $("stSave").disabled=true;
  const mins=+$("stUntil").value||0; try{ LS.set("nl-status-until",String(mins)); }catch(e){}
  try{ await saveMyStatus(stEmoji,text,mins); show($("statusSheet"),false);
    say("profMsg",mins&&!meProfile.status_until?"💭 Status updated, but auto-clear isn't switched on yet. Ask Cole to run the status SQL.":mins?"💭 Status updated. It "+statusLeft(meProfile)+".":"💭 Status updated."); }
  catch(err){ say("stMsg",/status_/.test(err.message)?"Statuses aren't switched on yet. Ask Cole to run the status SQL.":"Couldn't save: "+err.message,true); }
  finally{ $("stSave").disabled=false; }
};
$("stClear").onclick=async()=>{
  try{ await saveMyStatus(null,""); show($("statusSheet"),false); say("profMsg","Status cleared."); }
  catch(err){ say("stMsg","Couldn't clear: "+err.message,true); }
};

/* "Join them": if they're online in a room you're also in (or your DM with them), hop straight there */
function personJoinTarget(uid){
  const st=statusOf(uid); if(!st||st==="dnd") return null;
  const w=whereIs(uid); if(!w?.room||w.room===room) return null;
  const r=inboxRows.find(x=>x.code===w.room); if(!r) return null;                 // only rooms you're in too
  if(r.is_dm&&r.dm_user!==uid) return null;                                       // their DMs with other people stay private
  return {code:r.code,label:r.is_dm?"🚪 Hop into your chat":`🚪 Join them in ${r.name||"#"+r.code}`,typing:!!w.typing};
}
function paintPersonJoin(uid){
  const b=$("personJoin"), t=personJoinTarget(uid); show(b,!!t); if(!t) return;
  b.textContent=t.label+(t.typing?" (typing…)":"");
  b.onclick=async()=>{ show($("personSheet"),false); try{ await enterRoom(t.code); }catch(err){ toast("Couldn't open that chat",err.message); } };
}
function paintPersonLinks(links){
  const box=$("personLinks"); box.innerHTML=""; if(!links) return;
  Object.entries(links).forEach(([k,h])=>{ const d=CARD_LINKS[k]; if(!d) return;
    const text=d.icon+" "+(k==="web"?new URL(h).hostname.replace(/^www\./,""):(k==="discord"?h:"@"+h));
    if(!d.url){ const b=el("button","plink",text); b.type="button"; b.title="Copy Discord username";
      b.onclick=()=>{ navigator.clipboard?.writeText(h).then(()=>toast("📋 Copied","Discord: "+h),()=>{}); }; box.append(b); return; }
    const a=el("a","plink",text); a.href=d.url(h); a.target="_blank"; a.rel="noopener noreferrer nofollow"; a.title=d.label+(k==="web"?" · opens "+a.href:""); box.append(a);
  });
}
function openPerson(uid){
  if(!uid||uid===user.id){ if(uid===user.id) openProfile(); return; }
  $("personSheet").classList.remove("preview");
  personUid=uid; say("personMsg",""); paintPerson(); show($("personSheet"));
  refreshProfiles([uid]).then(()=>{ if(personUid===uid&&!$("personSheet").classList.contains("hidden")) paintPerson(); });
}
/* 👁️ preview your own card exactly as friends see it (thanks beef!) */
function openProfilePreview(){
  show($("profile"),false);
  if(meProfile) cache.set(user.id,meProfile);
  $("personSheet").classList.add("preview");
  personUid=user.id; say("personMsg",""); paintPerson(); show($("personSheet"));
}
$("openPreview").onclick=openProfilePreview;
let personPaintTok=0;   // a profile gets drawn twice (right away, then with fresh info): only the newest draw may add server answers
function paintPerson(){
  const tok=++personPaintTok;
  const uid=personUid, p=cache.get(uid)||{username:"Someone"}, nick=room?members.get(uid)?.nick:null;
  paintFace($("personFace"),p);
  { const card=cardOf(p); paintCardBanner($("personBanner"),card); $("personSheet").classList.toggle("has-card",!!(card&&(card.banner||card.fx||card.stk.length)));
    $("personPronouns").textContent=card?.pronouns||""; show($("personPronouns"),!!card?.pronouns);
    $("personRelStatus").textContent=card?.relStatus||""; show($("personRelStatus"),!!card?.relStatus);
    relPartnerOf(uid).then(partner=>{
      if(personUid!==uid||tok!==personPaintTok) return;   // they tapped someone else while we were waiting (or a newer draw took over)
      if(!partner) return;          // no partner: keep the status line as it is
      $("personRelStatus").textContent=`${card?.relStatus||"💞"} with ${relName(partner)}`;
      show($("personRelStatus"),true);
    });
    paintPersonLinks(card?.links); }
  paintPersonPartner(uid);
  paintPersonSignal(uid);
  paintPersonJoin(uid);
  $("personName").textContent=nick||p.username;
  { const sl=statusLine(p); $("personStatus").textContent=sl; show($("personStatus"),!!sl); }
  $("personSub").textContent=(nick&&nick!==p.username?`@${p.username} · `:"@"+p.username+" · ")+(isBirthdayToday(p.birthday)?"🎂 birthday today! · "+(presenceLine(uid)||""):(presenceLine(uid)||(roomName&&!isDm?`in ${roomName}`:"NightLane")));
  const f=isFriend(uid), back=addedMe(uid);
  $("personTag").textContent = f&&back?"🤝 You're friends": f?"✓ On your friends list": back?"👋 Added you as a friend":"";
  show($("personTag"),f||back);
  const mb=$("personMutual"); mb.innerHTML=""; show(mb,false);   // start empty and hidden
api.mutualFriends(uid).then(ids=>{
  if(personUid!==uid||tok!==personPaintTok) return;      // same guard as before + only the newest draw adds faces
  if(!ids.length) return;          // no friends in common: stay hidden
  ids.slice(0,5).forEach(id=>{     // up to 5 faces
    const face=el("span","face sm");
    paintFace(face, cache.get(id));
    mb.append(face);
  });
    mb.append(el("span","ma-count",`${ids.length} mutual friend${ids.length===1 ? "" : "s"}`));
  show(mb,true);
});
  const pa=$("personArcana"); pa.innerHTML=""; show(pa,!!p.arcana);
  if(p.arcana){ pa.append(el("span","ma-eyebrow","🃏 Arcana"), el("span","ma-name",p.arcana)); if(ARCANA_FLAVOR[p.arcana]) pa.append(el("span","ta-flavor",ARCANA_FLAVOR[p.arcana]));
    if(ARCANA_MEANING[p.arcana]){ pa.append(el("span","ma-more","Meaning ›")); pa.setAttribute("role","button"); pa.tabIndex=0; pa.setAttribute("aria-label",`${p.username}'s Arcana: ${p.arcana}. Tap to see what it means.`);
      pa.onclick=()=>openArcanaMeaning(p.arcana,{whose:p.username}); pa.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); pa.onclick(); } }; } }
  else { pa.onclick=null; pa.removeAttribute("role"); }
  $("personBacklog").textContent=`🎮 See ${p.username}'s backlog`;
  const bond=socialLinks.get(uid), pb=$("personBond"); show(pb,!!bond);
  if(bond){ const {rank}=rankFromXp(bond.xp); pb.textContent=`💫 Your Social Bond: ${bond.arcana} · Rank ${rank}`; pb.onclick=()=>{ show($("personSheet"),false); openSocialLink(uid); }; }
  $("personFriend").textContent = f?"Remove friend": back?"Add back 🤝":"Add friend";
  $("personFriend").className = f?"ghost":"go";
  show($("personDm"),!(isDm&&dmUser===uid));
  $("personDm").textContent=`Message ${p.username} privately`;
}
$("personFriend").onclick=async()=>{
  const uid=personUid, name=cache.get(uid)?.username||"them";
  $("personFriend").disabled=true;
  try{
    if(isFriend(uid)){ if(!await nlAlert({ kind:"err", title:"Remove friend?", badge:"DANGER", text:`Remove ${name} from your friends? You'll stop showing in each other's friend list.`, status:"AWAITING INPUT", buttons:[{label:"REMOVE", value:true},{label:"KEEP", value:false}] })) return; await removeFriend(uid); say("personMsg",`Removed ${name}.`); }
    else { const back=addedMe(uid); await addFriend(uid); say("personMsg",back?`You and ${name} are friends now 🤝`:`Added ${name} as a friend.`); if(navigator.vibrate) navigator.vibrate(20); }
  }catch(err){ say("personMsg",err.message,true); }
  finally{ $("personFriend").disabled=false; }
};
$("personDm").onclick=()=>{ const uid=personUid; show($("personSheet"),false); openDm(uid); };
$("personClose").onclick=()=>show($("personSheet"),false);
$("personSheet").addEventListener("click",e=>{ if(e.target.id==="personSheet") show($("personSheet"),false); });
feed.addEventListener("click",e=>{ const f=e.target.closest(".msg .face"); if(f&&f.dataset.uid) openPerson(f.dataset.uid); });

async function onFriendAdded(uid){
  if(!uid||blocked.has(uid)) return;
  if(!addedMeIds.includes(uid)) addedMeIds.push(uid);
  await ensureProfiles([uid]);
  const p=cache.get(uid); if(!p) return;
  refreshFriendUI(); paintFriendBadge();
  if(isFriend(uid)) return;
  const t=el("button","toast"); t.type="button";
  const f=el("span","face"); paintFace(f,p);
  const body=el("span","tbody"); body.append(el("div","ttitle","👋 New friend"), el("div","ttext",`${p.username} added you. Tap to add back.`));
  t.append(f,body); t.onclick=()=>{ t.remove(); openPerson(uid); };
  $("toasts").prepend(t); setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },6000);
}

/* ================= NOTIFICATIONS ================= */
function paintNotifyModes(){ $("notifyModes").querySelectorAll("button").forEach(b=>b.setAttribute("aria-checked",b.dataset.mode===myNotify)); }
$("notifyModes").querySelectorAll("button").forEach(b=>b.onclick=async()=>{
  const prev=myNotify; myNotify=b.dataset.mode; paintNotifyModes();
  try{ await api.setNotify(room,myNotify); say("rsMsg",{all:"You'll be notified about every message here.",mentions:"You'll only be notified when someone @mentions you here.",off:"Notifications are off for this chat."}[myNotify]); }
  catch(err){ myNotify=prev; paintNotifyModes(); say("rsMsg","Couldn't change notifications: "+err.message,true); }
});

/* 👀 "reading this chat right now": tells the server which chat is on your screen, so it doesn't send you
   phone notifications for it (needs viewing.sql + notify v24). Refreshed every 20 seconds; the server
   forgets it 45 seconds after the app closes or goes to the background. */
let viewingKey=null, viewingRoom=null, viewingAt=0, hereOld=false;
function viewingNow(){ return (sb&&user&&room&&!document.hidden&&!$("chat").classList.contains("hidden"))?room:null; }
/* 16q: also "NightLane is on my screen" (any page), so the server skips message pushes while you're in the app:
   the app's own pop-up already shows them. Not sent if you turned on "Phone notifications while NightLane is open". */
function appActiveNow(){ return !!(sb&&user&&!document.hidden&&!(typeof dupOn==="function"&&dupOn())); }
function sendHere(r,active){
  if(hereOld){ if(viewingRoom&&viewingRoom!==r) api.setViewing(viewingRoom,false).catch(()=>{}); if(r) api.setViewing(r,true).catch(()=>{}); return; }
  api.setHere(r,active).then(x=>{ if(x==="old"){ hereOld=true; sendHere(r,active); } }).catch(()=>{ viewingAt=0; });
}
function viewTick(force){
  if(!sb||!user) return;
  const r=viewingNow(), active=appActiveNow(), key=(r||"")+"|"+active;
  if(key!==viewingKey){ sendHere(r,active); viewingKey=key; viewingRoom=r; viewingAt=Date.now(); return; }
  if((r||active)&&(force||Date.now()-viewingAt>20000)){ viewingAt=Date.now(); sendHere(r,active); }
}
setInterval(()=>viewTick(false),3000);
document.addEventListener("visibilitychange",()=>viewTick(true));
addEventListener("pagehide",()=>{ if(viewingKey&&viewingKey!=="|false"){ sendHere(null,false); viewingKey="|false"; viewingRoom=null; } });

// in-app banners for chats you're not looking at
const toastSeen=new Set();
async function onAnyMessage(m){
  if(!user||!m||m.user_id===user.id||blocked.has(m.user_id)||toastSeen.has(m.id)) return;
  toastSeen.add(m.id);
  if(m.kind==="call" && Date.now() - new Date(m.created_at).getTime() < 30000){ if(String(m.room).startsWith("dm-")) showIncomingCall(m); else showGroupInvite(m); return; }   // a fresh call rings
  if(String(m.room).startsWith("dm-")) bondCheckSoon();
  const viewingIt = m.room===room && !$("chat").classList.contains("hidden") && !document.hidden;
  if(!$("front").classList.contains("hidden")) loadInboxSoon();
  if(viewingIt) return;
  const row=inboxRows.find(r=>r.code===m.room);
  const mentioned=(m.mentions||[]).includes(user.id);
  const mode=row?.notify||"all";
  if(mode==="off"||(mode==="mentions"&&!mentioned)) return;
  await ensureProfiles([m.user_id]);
  if(document.hidden) return;   // the phone notification covers it
  const p=cache.get(m.user_id)||{username:"Someone"};
  const where=row?.is_dm?"private":(row?.name||"#"+m.room);
  const t=el("button","toast"+(mentioned?" mention":"")); t.type="button";
  const f=el("span","face"); paintFace(f,p);
  const body=el("span","tbody");
  body.append(el("div","ttitle",mentioned?`📣 ${p.username} mentioned you · ${where}`:`${p.username} · ${where}`));
  body.append(el("div","ttext",previewOf(m)));
  t.append(f,body);
  t.onclick=()=>{ t.remove(); ["profile","roomSheet","msgMenu","pollSheet","themeSheet"].forEach(id=>show($(id),false)); enterRoom(m.room); };
  const box=$("toasts"); box.prepend(t); while(box.children.length>3) box.lastChild.remove();
  sfx(mentioned?"mention":"notify");
  buzz(mentioned?"mention":"message");
  setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },5000);
  if(row) { row.unread=(+row.unread||0)+1; }
}
let inboxTimer=null;
function loadInboxSoon(){ clearTimeout(inboxTimer); inboxTimer=setTimeout(loadInbox,400); }

/* The number on the app icon = your real unread total (muted chats don't count). iPhone home-screen app and
   installed desktop apps show the number; Android shows its own dot/count from notifications instead. */
let iconUnread=0;
function setIconBadge(n){
  iconUnread=Math.max(0,n|0);
  try{ if("setAppBadge" in navigator){ iconUnread>0?navigator.setAppBadge(iconUnread).catch(()=>{}):navigator.clearAppBadge().catch(()=>{}); } }catch(e){}
  try{ const msg={type:"nl-unread",n:iconUnread}; navigator.serviceWorker?.controller?.postMessage(msg); }catch(e){}   // so new messages while closed add on top of the real number
}
function clearBadge(){ setIconBadge(0); }
async function closeRoomNotifications(code){
  const row=(typeof inboxRows!=="undefined"?inboxRows:[]).find(r=>r.code===code);
  if(row&&+row.unread>0&&row.notify!=="off"){ setIconBadge(iconUnread-(+row.unread)); row.unread=0; }   // you're reading this chat now
  try{ const reg=swReg||await navigator.serviceWorker?.getRegistration(); (await reg?.getNotifications({tag:"room-"+code})||[]).forEach(n=>n.close()); }catch(e){}
}
document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&user){ if(room) closeRoomNotifications(room); loadInboxSoon(); } });   // refresh the real count when you come back
// the service worker asks which chat is on screen, so it only skips notifications for that one
navigator.serviceWorker?.addEventListener("message",e=>{
  if(e.data?.type==="which-room"&&e.ports?.[0]) e.ports[0].postMessage({room: (!document.hidden&&!$("chat").classList.contains("hidden"))?room:null});
});
/* Shows a test number on the app icon so you can see whether this device displays it. */
$("badgeTest").onclick=async()=>{
  const android=/Android/i.test(navigator.userAgent), installed=typeof knownInstalled==="function"?isStandalone():true;
  if(!installed){ say("profMsg","Open NightLane from its installed app icon first (not a browser tab), then tap this again. Browser tabs can't put a number on an icon.",true); return; }
  if(android){
    try{ const reg=swReg||await navigator.serviceWorker.getRegistration(); await reg.showNotification("NightLane badge test 🔢",{body:"Look at the NightLane icon on your home screen now.",icon:"icon-192.png",badge:"badge-96.png",tag:"badge-test"}); }catch(e){}
    say("profMsg","Android apps from Chrome can't set their own number. Your phone shows a dot (or, on Samsung with 'Show with number', how many NightLane notifications are waiting) while a notification sits in your tray. I just sent one, so check your home screen icon now. If there's no dot, the icon on your home screen may be a Chrome shortcut instead of the installed app: remove it and install again from Chrome's ⋮ menu → Install app.");
    return;
  }
  if(!("setAppBadge" in navigator)){ say("profMsg","This browser can't show a number on app icons. Chrome or Edge on PC, and the iPhone home screen app, can.",true); return; }
  try{ await navigator.setAppBadge(3); }catch(e){ say("profMsg","Your device blocked the number: "+(e.message||e),true); return; }
  say("profMsg",/Windows/i.test(navigator.userAgent)
    ? "Look at NightLane's taskbar icon now: you should see a little 3 in its corner for 15 seconds. Windows only shows it while the NightLane window is open (minimized is fine). No 3? Turn on Settings → Personalization → Taskbar → Taskbar behaviors → Show badges on taskbar apps."
    : "Look at the NightLane icon now: it should show 3 for 15 seconds. No number? Turn on Badges in your device's notification settings for NightLane.");
  setTimeout(()=>setIconBadge(iconUnread),15000);   // put the real count back
};
$("notifTest").onclick=async()=>{
  $("notifTest").disabled=true; say("profMsg","Sending a real test push through your phone's notification system…");
  try{
    const r=await api.testPush();
    if(r?.demo){ const reg=swReg||await navigator.serviceWorker.getRegistration(); await reg.showNotification("NightLane test 🌙",{body:"Demo mode: this just shows locally.",icon:"icon-192.png",badge:"badge-96.png",tag:"test"}); say("profMsg","Demo mode: shown locally, since there's no server here to round-trip through."); }
    else if(!r?.sent){ say("profMsg","No working device found to send to. Turn notifications off and back on below, then try again.",true); }
    else { say("profMsg","Sent for real — it should arrive any second. If it never shows up, the problem is on your phone's side (check this app's notification settings), not the app itself."); }
  }catch(err){ say("profMsg","The test push failed to send: "+err.message,true); }
  finally{ $("notifTest").disabled=false; }
};

