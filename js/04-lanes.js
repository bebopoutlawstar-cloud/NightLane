/* ===================== 🛣️ LANES (2026.10.19h) =====================
   Your crew's hangout: one Lane with side chats inside (💬 General, 🎮 Games, 🎬 Movies...). Each side chat is a
   normal room underneath, so everything rooms can do works there. Lane people are in every side chat automatically. */
const laneOf=id=>myLanesList.find(l=>l.id===id);
const LANE_ICONS=["🦊","🐉","👾","🌸","🍕","🛸","🐺","🌊","🦇","🍜","🍄","🐙","🌵","🧃","🎲","🪐"];
/* 🎨 NightLane glyphs: neon line icons in the app's own look. Saved as "nl:<name>". */
const NL_GLYPHS={
  moon:[["p","M15 3a8 8 0 1 0 6 13A9 9 0 0 1 15 3z"]], star:[["p","M12 2l3 7h7l-5.5 4.5 2 7.5L12 16.5 5.5 21l2-7.5L2 9h7z"]],
  skull:[["p","M12 3c-4.4 0-8 3.1-8 7.5 0 2.4 1.2 4 2.5 5V19h11v-3.5c1.3-1 2.5-2.6 2.5-5C20 6.1 16.4 3 12 3z"],["c",9,11,1.6],["c",15,11,1.6],["p","M10 19v-2M14 19v-2"]],
  game:[["p","M6 8h12a4 4 0 0 1 4 4v1a3 3 0 0 1-5.4 1.8L15 13H9l-1.6 1.8A3 3 0 0 1 2 13v-1a4 4 0 0 1 4-4z"],["p","M7 10v4M5 12h4"],["c",16,11,.6],["c",18,13,.6]],
  film:[["p","M3 5h18v14H3z"],["p","M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"]], tv:[["p","M3 7h18v12H3z"],["p","M8 3l4 4 4-4"]],
  music:[["p","M9 18V5l11-2v13"],["c",6,18,3],["c",17,16,3]], heart:[["p","M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"]],
  bolt:[["p","M13 2L4 14h7l-1 8 9-12h-7z"]], ghost:[["p","M5 21V10a7 7 0 0 1 14 0v11l-2.3-2-2.3 2-2.4-2-2.4 2-2.3-2z"],["c",9.5,10,1],["c",14.5,10,1]],
  crown:[["p","M3 19h18M4 16L3 7l5 4 4-7 4 7 5-4-1 9z"]], dice:[["p","M4 4h16v16H4z"],["c",8.5,8.5,1],["c",15.5,15.5,1],["c",12,12,1],["c",15.5,8.5,1],["c",8.5,15.5,1]],
  phones:[["p","M4 15v-3a8 8 0 0 1 16 0v3"],["p","M4 15h3v5H4zM17 15h3v5h-3z"]], flame:[["p","M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"]],
  planet:[["c",12,12,5.5],["p","M3 16c2 2.5 16-3 18-8.5"]], cat:[["p","M5 20v-9L4 4l5 4h6l5-4-1 7v9z"],["c",9.5,13,.8],["c",14.5,13,.8],["p","M11 16h2"]],
  sword:[["p","M20 4L9 15M14 4h6v6M7 13l4 4M5 19l2-2"]], chat:[["p","M4 5h16v11H9l-5 4z"]], camera:[["p","M4 8h4l2-3h4l2 3h4v11H4z"],["c",12,13,3.5]],
  book:[["p","M4 19a2 2 0 0 1 2-2h14V3H6a2 2 0 0 0-2 2z"],["p","M4 19a2 2 0 0 0 2 2h14v-4"]], cal:[["p","M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"]],
  eye:[["p","M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"],["c",12,12,3]], alien:[["p","M12 3c-5 0-8 3.5-8 8 0 5 4 10 8 10s8-5 8-10c0-4.5-3-8-8-8z"],["p","M7.5 11.5c1.5 0 3 1 3 2.5-1.5 0-3-1-3-2.5zM16.5 11.5c-1.5 0-3 1-3 2.5 1.5 0 3-1 3-2.5z"]],
  pizza:[["p","M12 21L3 6c6-3 12-3 18 0z"],["c",10,9,1],["c",14,11,1],["c",12,15,1]], code:[["p","M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"]]
};
const NL_KEYS=Object.keys(NL_GLYPHS);
/* draw an icon: "nl:<glyph>", an uploaded picture URL, or an emoji */
function glyphEl(key,cls=""){
  const span=el("span","nlg "+cls); key=key||"nl:moon";
  if(/^https?:|^blob:/.test(key)){ const i=document.createElement("img"); i.src=key; i.alt=""; i.loading="lazy"; span.append(i); return span; }
  const g=key.startsWith("nl:")&&NL_GLYPHS[key.slice(3)];
  if(!g){ span.textContent=key; return span; }
  span.classList.add("c"+(NL_KEYS.indexOf(key.slice(3))%3));
  const NS="http://www.w3.org/2000/svg", svg=document.createElementNS(NS,"svg"); svg.setAttribute("viewBox","0 0 24 24"); svg.setAttribute("aria-hidden","true");
  g.forEach(([t,a,b,c])=>{ const e=document.createElementNS(NS,t==="p"?"path":"circle"); if(t==="p") e.setAttribute("d",a); else { e.setAttribute("cx",a); e.setAttribute("cy",b); e.setAttribute("r",c); } svg.append(e); });
  span.append(svg); return span;
}
const laneIconEl=l=>glyphEl(l?.icon_url||l?.icon||"nl:moon");
const chatIconEl=r=>glyphEl(roomIcons.get(r.code)||r.lane_label||"nl:chat");
const LANE_BANNERS=[["city","Neon City"],["drive","Night Drive"],["moon","Moonrise"],["rain","Rain"],["static","Static"],["vapor","Vapor"]];
function laneBanner(node,b){ LANE_BANNERS.forEach(([k])=>node.classList.remove("lbn-"+k)); node.style.backgroundImage=""; node.classList.toggle("hasbn",!!b);
  if(!b) return; if(LANE_BANNERS.some(([k])=>k===b)) node.classList.add("lbn-"+b); else node.style.backgroundImage=`url("${b.replace(/"/g,"")}")`; }
const LANE_TAGS=[["nl:chat","General"],["nl:game","Games"],["nl:film","Movies"],["nl:tv","Shows"],["nl:music","Music"],["nl:camera","Pics"],["nl:ghost","Memes"],["nl:cal","Plans"],["nl:star","Art"],["nl:book","Books"],["nl:pizza","Food"],["nl:code","Tech"],["nl:flame","Hype"],["nl:moon","Late night"]];
async function loadLanes(){
  if(!user) return;
  try{
    const ls=await api.myLanes(), rs=ls.length?await api.laneRooms(ls.map(l=>l.id)):[];
    myLanesList=ls.map(l=>({...l,rooms:rs.filter(r=>r.lane===l.id).sort((a,b)=>(a.lane_pos||0)-(b.lane_pos||0))}));
    laneByRoom=new Map(rs.map(r=>[r.code,r]));
  }catch(e){}   // offline: keep what we had
}
/* 🔊 voice lounges: who's in each one, watched from outside (presence only, so nobody gets pinged) */
const loungeWho=new Map(), loungeLines=new Map();
const isLounge=r=>r?.lane_kind==="voice";
function loungeUnwatch(code){ const ch=loungeLines.get(code); if(ch){ try{ ch.local?ch.close():sb.removeChannel(ch); }catch(e){} loungeLines.delete(code); } }
function loungeWatchAll(){
  const want=new Set(); myLanesList.forEach(l=>l.rooms.filter(isLounge).forEach(r=>want.add(r.code)));
  [...loungeLines.keys()].forEach(c=>{ if(!want.has(c)||gc?.room===c) loungeUnwatch(c); });
  [...want].slice(0,8).forEach(code=>{ if(loungeLines.has(code)||gc?.room===code) return;
    const ch=sb?sb.channel("call:"+code,{config:{private:true}}):localLine("call:"+code);
    ch.on("presence",{event:"sync"},()=>{ loungeWho.set(code,Object.keys(ch.presenceState()||{})); paintLanes(); if(room) paintLaneBar(); });
    if(ch.local) ch.subscribe(()=>{}); else ch.subscribe(); loungeLines.set(code,ch); });
}
function joinLounge(r){
  if(isOffline()){ offlineNotice(); return; }
  if(gc?.room===r.code) return; if(callStream||gc){ toast("🔊 Lounge","Hang up your call first."); return; }
  openGroupCall(true,null,{code:r.code,silent:true});
}
function laneChatRow(r){
  if(isLounge(r)){ const who=(loungeWho.get(r.code)||[]).filter(u=>u!==user?.id);
    const b=el("button","lanechat lounge"+(who.length?" live":"")); b.type="button";
    const tg=el("span","lc-tag"); tg.append(chatIconEl({...r,lane_label:r.lane_label&&r.lane_label!=="💬"?r.lane_label:"nl:phones"})); 
    const info=el("span","lc-info"); info.append(el("div","lc-name",r.name||"Lounge"));
    info.append(el("div","lc-prev",who.length?`🔊 ${who.slice(0,3).map(nameOf).join(", ")}${who.length>3?` +${who.length-3}`:""} in voice`:"🔊 Voice lounge · tap to hop in (nobody gets pinged)"));
    b.append(tg,info); if(who.length) b.append(el("span","badge lv",String(who.length)));
    b.setAttribute("aria-label",`${r.name||"Voice lounge"}, voice lounge${who.length?`, ${who.length} in voice`:""}`); b.onclick=()=>joinLounge(r); return b; }
  const ir=inboxRows.find(x=>x.code===r.code)||{}, n=+ir.unread||0;
  const b=el("button","lanechat"+(n?" unread":"")); b.type="button";
  const info=el("span","lc-info"); info.append(el("div","lc-name",r.name||"chat"));
  const pv=ir.last_kind?previewOf({kind:ir.last_kind,text:ir.last_text,image_url:ir.last_image?"x":null,media_type:ir.last_kind==="video"||ir.last_kind==="audio"?ir.last_kind:null,sticker:ir.last_kind==="sticker"?"x":null}):"";
  info.append(el("div","lc-prev",pv?(ir.last_sender?`${ir.last_sender}: ${pv}`:pv):"Nothing here yet"));
  const tg=el("span","lc-tag"); tg.append(chatIconEl(r)); b.append(tg,info);
  if(n) b.append(el("span","badge",n>99?"99+":String(n)));
  b.setAttribute("aria-label",`${r.name||"Side chat"}${n?`, ${n} unread`:""}`);
  b.onclick=()=>{ if(isOffline()){ offlineNotice(); return; } enterRoom(r.code); };
  return b;
}
function paintLanes(){
  const box=$("laneList"); if(!box) return; box.replaceChildren();
  show($("laneEmpty"),!myLanesList.length);
  myLanesList.forEach(l=>{
    const card=el("div","lanecard"), head=el("div","lanehead"), info=el("span","ln-info");
    info.append(el("b","",l.name),el("small","",`${l.members} ${+l.members===1?"person":"people"}${l.my_role!=="member"?" · you're the "+(l.my_role==="owner"?"owner":"helper"):""}`));
    const gear=el("button","ln-gear","⚙️"); gear.type="button"; gear.setAttribute("aria-label","Lane settings for "+l.name); gear.onclick=()=>openLaneSheet(l.id);
    const ic=el("span","laneicon"); ic.append(laneIconEl(l)); laneBanner(head,l.banner);
    head.append(ic,info,gear); card.append(head);
    l.rooms.forEach(r=>card.append(laneChatRow(r)));
    box.append(card);
  });
  if(!$("lanesPane").classList.contains("hidden")||room) setTimeout(loungeWatchAll,0);
}
/* the strip of side chats along the top of a Lane chat: hop between them */
function paintLaneBar(){
  const bar=$("laneBar"); if(!bar) return;
  const lr=!isDm&&laneByRoom.get(room), ln=lr&&laneOf(lr.lane);
  show(bar,!!ln); bar.replaceChildren(); if(!ln) return;
  const home=el("button","lb-home"); home.append(laneIconEl(ln)); home.type="button"; home.title=ln.name+" settings"; home.setAttribute("aria-label",ln.name+" settings"); home.onclick=()=>openLaneSheet(ln.id); bar.append(home);
  ln.rooms.forEach(r=>{ const ir=inboxRows.find(x=>x.code===r.code), on=r.code===room;
    if(isLounge(r)){ const n=(loungeWho.get(r.code)||[]).length, b=el("button","lounge"+(n?" dot":"")); b.type="button";
      b.append(chatIconEl({...r,lane_label:r.lane_label&&r.lane_label!=="💬"?r.lane_label:"nl:phones"}),el("span","",(r.name||"Lounge")+(n?` · ${n}`:""))); b.title="Voice lounge: hop in without pinging anyone"; b.onclick=()=>joinLounge(r); bar.append(b); return; }
    const b=el("button",!on&&+ir?.unread>0?"dot":""); b.type="button"; b.setAttribute("role","tab"); b.setAttribute("aria-selected",String(on));
    b.append(chatIconEl(r),el("span","",r.name||"chat")); b.onclick=()=>{ if(!on) enterRoom(r.code); }; bar.append(b); });
  bar.querySelector('[aria-selected="true"]')?.scrollIntoView({inline:"center",block:"nearest"});
}
async function openLaneSheet(id){
  const l=laneOf(id); if(!l) return; laneSheetId=id;
  const mgr=l.my_role!=="member";
  $("lsTitle").replaceChildren(glyphEl(l.icon_url||l.icon,"rl-glyph"),l.name); $("lsSub").textContent=mgr?(l.my_role==="owner"?"You own this Lane.":"You're a helper here."):"You're in this Lane.";
  say("lsMsg",""); show($("lsRename"),mgr); show($("lsAddChat"),mgr&&l.rooms.length<20);
  const chats=$("lsChats"); chats.replaceChildren();
  l.rooms.forEach(r=>{ const row=el("div","lsrow"); row.append(chatIconEl(r)); row.lastChild.classList.add("rl-glyph"); row.append(el("span","ls-name",r.name||"chat"));
    if(mgr){ const ed=el("button","","✏️"); ed.type="button"; ed.setAttribute("aria-label","Edit "+(r.name||"side chat")); ed.onclick=()=>openLaneForm({mode:"chat-edit",lane:id,code:r.code,name:r.name,label:r.lane_label,chatUrl:roomIcons.get(r.code)||null}); row.append(ed);
      if(l.rooms.length>1){ const rm=el("button","","🗑️"); rm.type="button"; rm.setAttribute("aria-label","Remove "+(r.name||"side chat"));
        rm.onclick=async()=>{ if(!confirm(`Remove the side chat "${r.name}"? Nobody will be able to open it anymore.`)) return;
          try{ await api.laneRemoveChat(r.code); await loadInbox(); openLaneSheet(id); }catch(err){ say("lsMsg",err.message,true); } }; row.append(rm); } }
    chats.append(row); });
  const ppl=$("lsPeople"); ppl.replaceChildren(); ppl.append(el("p","sub","Loading…")); show($("laneSheet"));
  let mem=[]; try{ mem=await api.laneMembers(id); await ensureProfiles(mem.map(m=>m.user_id)).catch(()=>{}); }catch(e){}
  if(laneSheetId!==id) return;
  ppl.replaceChildren(); const rank={owner:0,helper:1,member:2};
  mem.sort((a,b)=>rank[a.role]-rank[b.role]||nameOf(a.user_id).localeCompare(nameOf(b.user_id))).forEach(m=>{
    const row=el("div","lsrow"), f=el("span","face sm"); paintFace(f,cache.get(m.user_id)||{id:m.user_id});
    row.append(f,el("span","ls-name",m.user_id===user.id?"You":nameOf(m.user_id))); if(m.role!=="member") row.append(el("span","ls-role",m.role==="owner"?"OWNER":"HELPER"));
    if(m.user_id!==user.id){
      if(l.my_role==="owner"&&m.role!=="owner"){ const hb=el("button","",m.role==="helper"?"Unhelper":"⭐ Helper"); hb.type="button";
        hb.onclick=async()=>{ try{ await api.laneSetRole(id,m.user_id,m.role==="helper"?"member":"helper"); openLaneSheet(id); }catch(err){ say("lsMsg",err.message,true); } }; row.append(hb); }
      if(m.role!=="owner"&&(l.my_role==="owner"||(l.my_role==="helper"&&m.role==="member"))){ const kb=el("button","","Remove"); kb.type="button";
        kb.onclick=async()=>{ if(!confirm(`Remove ${nameOf(m.user_id)} from ${l.name}?`)) return; try{ await api.laneRemoveMember(id,m.user_id); await loadInbox(); openLaneSheet(id); }catch(err){ say("lsMsg",err.message,true); } }; row.append(kb); } }
    ppl.append(row); });
}
$("lsClose").onclick=()=>{ show($("laneSheet"),false); laneSheetId=null; };
$("laneSheet").addEventListener("click",e=>{ if(e.target.id==="laneSheet"){ show($("laneSheet"),false); laneSheetId=null; } });
$("lsAddFriends").onclick=()=>{ const id=laneSheetId; show($("laneSheet"),false); openAddFriends(id); };
$("lsAddChat").onclick=()=>openLaneForm({mode:"chat-new",lane:laneSheetId});
$("lsRename").onclick=()=>{ const l=laneOf(laneSheetId); if(l) openLaneForm({mode:"lane-edit",lane:l.id,name:l.name,icon:l.icon,iconUrl:l.icon_url||null,banner:l.banner||null}); };
$("lsLeave").onclick=async()=>{ const l=laneOf(laneSheetId); if(!l) return;
  if(!confirm(`Leave ${l.name}? You'll leave all its side chats.${l.my_role==="owner"?" You're the owner, so a helper (or the longest member) takes over.":""}`)) return;
  try{ await api.laneLeave(l.id); show($("laneSheet"),false); laneSheetId=null; if(laneByRoom.get(room)?.lane===l.id) exitRoom(); await loadInbox(); toast("🛣️ Lanes",`You left ${l.name}.`); }
  catch(err){ say("lsMsg",err.message,true); } };
$("laneNewBtn").onclick=()=>openLaneForm({mode:"new"});

/* one form for: a new Lane · rename a Lane · a new side chat · edit a side chat · move a room in */
let lf=null;
const laneOf2=()=>lf?.newLane||null;
function openLaneForm(o){
  lf={icon:o.icon||"nl:moon",label:o.label||"nl:chat",lane:o.lane||null,iconUrl:null,banner:o.mode==="new"?"city":null,chatUrl:null,iconFile:null,bannerFile:null,chatFile:null,...o};
  lf.origIconUrl=o.iconUrl||null; lf.origBanner=o.banner||null;
  const T={new:"New Lane","lane-edit":"Name & icon","chat-new":"New side chat","chat-edit":"Edit side chat",attach:"Move into a Lane"};
  const G={new:"Make the Lane","lane-edit":"Save","chat-new":"Add it","chat-edit":"Save",attach:"Move it in"};
  $("lfTitle").textContent=T[o.mode]; $("lfGo").textContent=G[o.mode]; say("lfMsg","");
  show($("lfLaneBox"),o.mode==="new"||o.mode==="lane-edit"); show($("lfChatBox"),o.mode!=="lane-edit"); show($("lfPickBox"),o.mode==="attach");
  $("lfChatLabel").textContent=o.mode==="new"?"First side chat":o.mode==="attach"?"Label it":"Side chat";
  lf.kind="chat"; show($("lfKind"),o.mode==="chat-new"); show($("lfKindNote"),false);
  $("lfKind").querySelectorAll("button").forEach(b=>{ b.setAttribute("aria-checked",String(b.dataset.kind==="chat")); b.onclick=()=>{ lf.kind=b.dataset.kind; $("lfKind").querySelectorAll("button").forEach(x=>x.setAttribute("aria-checked",String(x===b))); show($("lfKindNote"),lf.kind==="voice");
    if(lf.kind==="voice"&&!$("lfChatName").value.trim()) $("lfChatName").value="Lounge"; if(lf.kind==="voice"){ lf.label="nl:phones"; } }; });
  $("lfLaneName").value=o.mode==="lane-edit"?(o.name||""):"";
  $("lfChatName").value=o.mode==="chat-edit"||o.mode==="attach"?(o.name||""):""; $("lfChatName").placeholder=o.mode==="new"?"General":"repo, movie night, whatever";
  $("lfEmoji").value=o.mode==="chat-edit"&&!String(o.label||"").startsWith("nl:")?(o.label||""):"";
  const icons=$("lfIcons"), glyphs=$("lfGlyphs"); icons.replaceChildren(); glyphs.replaceChildren();
  const pickIcon=(key,b)=>{ lf.icon=key; lf.iconUrl=null; lf.iconFile=null; show($("lfIconPrev"),false); [...icons.children,...glyphs.children].forEach(x=>x.setAttribute("aria-checked",String(x===b))); };
  NL_KEYS.forEach(k=>{ const b=el("button"); b.type="button"; b.setAttribute("role","radio"); b.setAttribute("aria-label",k); b.append(glyphEl("nl:"+k)); b.setAttribute("aria-checked",String("nl:"+k===lf.icon&&!lf.iconUrl)); b.onclick=()=>pickIcon("nl:"+k,b); glyphs.append(b); });
  LANE_ICONS.forEach(ic=>{ const b=el("button","",ic); b.type="button"; b.setAttribute("role","radio"); b.setAttribute("aria-checked",String(ic===lf.icon&&!lf.iconUrl)); b.onclick=()=>pickIcon(ic,b); icons.append(b); });
  const ip=$("lfIconPrev"); ip.replaceChildren(); show(ip,!!lf.iconUrl); if(lf.iconUrl) ip.append(glyphEl(lf.iconUrl));
  const bns=$("lfBanners"); bns.replaceChildren();
  const pickBanner=(key,b)=>{ lf.banner=key; lf.bannerFile=null; show($("lfBannerPrev"),false); [...bns.children].forEach(x=>x.setAttribute("aria-checked",String(x===b))); };
  [[null,"None"],...LANE_BANNERS].forEach(([k,n])=>{ const b=el("button",k?"lbn-"+k:"",n); b.type="button"; b.setAttribute("role","radio"); b.setAttribute("aria-checked",String(k===lf.banner)); b.onclick=()=>pickBanner(k,b); bns.append(b); });
  const bp=$("lfBannerPrev"); const customBn=lf.banner&&!LANE_BANNERS.some(([k])=>k===lf.banner); show(bp,!!customBn); bp.style.backgroundImage=customBn?`url("${lf.banner}")`:"";
  const cp=$("lfChatPrev"); cp.replaceChildren(); show(cp,!!lf.chatUrl); if(lf.chatUrl) cp.append(glyphEl(lf.chatUrl));
  const tags=$("lfLabels"); tags.replaceChildren();
  LANE_TAGS.forEach(([e,n])=>{ const b=el("button"); b.append(glyphEl(e),n); b.type="button"; b.setAttribute("role","radio"); b.setAttribute("aria-checked",String(e===lf.label&&o.mode!=="chat-edit"));
    b.onclick=()=>{ lf.label=e; $("lfEmoji").value=""; lf.chatFile=null; if(lf.chatUrl){ lf.chatUrl=null; lf.chatClear=true; } show($("lfChatPrev"),false); const cur=$("lfChatName").value.trim(); if(!cur||LANE_TAGS.some(t=>t[1]===cur)) $("lfChatName").value=n; [...tags.children].forEach(x=>x.setAttribute("aria-checked",String(x===b))); }; tags.append(b); });
  const pick=$("lfPick"); pick.replaceChildren();
  if(o.mode==="attach"){ const mine=myLanesList.filter(l=>l.my_role!=="member"); if(!lf.lane) lf.lane=mine[0]?.id||null;
    mine.forEach(l=>{ const b=el("button","",`${l.icon} ${l.name}`); b.type="button"; b.setAttribute("role","radio"); b.setAttribute("aria-checked",String(l.id===lf.lane)); b.onclick=()=>{ lf.lane=l.id; [...pick.children].forEach(x=>x.setAttribute("aria-checked",String(x===b))); }; pick.append(b); }); }
  show($("laneForm"));
  setTimeout(()=>(o.mode==="new"||o.mode==="lane-edit"?$("lfLaneName"):$("lfChatName")).focus(),60);
}
/* 📷 pictures: Lane icon (square crop), banner (wide crop), side chat picture (square crop) */
let lfPicking=null;
$("lfIconUp").onclick=()=>{ lfPicking="icon"; $("lfFile").click(); };
$("lfBannerUp").onclick=()=>{ lfPicking="banner"; $("lfFile").click(); };
$("lfChatUp").onclick=()=>{ lfPicking="chat"; $("lfFile").click(); };
$("lfFile").onchange=async e=>{
  const f=e.target.files[0]; e.target.value=""; if(!f||!lf) return;
  if(f.size>15e6) return say("lfMsg","That picture is over 15 MB. Pick a smaller one.",true);
  const gif=f.type==="image/gif"&&f.size<5e6;
  let pic=f; if(!gif){ try{ pic=await openCrop(f,lfPicking==="banner"?"banner":"room"); }catch(err){ return say("lfMsg","Couldn't open that picture: "+err.message,true); } if(!pic) return; }
  const url=URL.createObjectURL(pic);
  if(lfPicking==="icon"){ lf.iconFile=pic; [...$("lfIcons").children,...$("lfGlyphs").children].forEach(x=>x.setAttribute("aria-checked","false")); const ip=$("lfIconPrev"); ip.replaceChildren(glyphEl(url)); show(ip); }
  if(lfPicking==="banner"){ lf.bannerFile=pic; [...$("lfBanners").children].forEach(x=>x.setAttribute("aria-checked","false")); const bp=$("lfBannerPrev"); bp.style.backgroundImage=`url("${url}")`; show(bp); }
  if(lfPicking==="chat"){ lf.chatFile=pic; lf.chatClear=false; const cp=$("lfChatPrev"); cp.replaceChildren(glyphEl(url)); show(cp); }
  say("lfMsg","");
};
$("lfEmoji").addEventListener("input",()=>{ lf&&(lf.label=$("lfEmoji").value.trim()||lf.label); [...$("lfLabels").children].forEach(x=>x.setAttribute("aria-checked","false")); });
$("lfClose").onclick=()=>show($("laneForm"),false);
$("laneForm").addEventListener("click",e=>{ if(e.target.id==="laneForm") show($("laneForm"),false); });
$("lfGo").onclick=async()=>{
  if(!lf) return; const m=lf.mode, lname=$("lfLaneName").value.trim().replace(/\s+/g," "), cname=$("lfChatName").value.trim().replace(/\s+/g," "), label=($("lfEmoji").value.trim()||lf.label||"nl:chat").slice(0,16);
  if((m==="new"||m==="lane-edit")&&!lname) return say("lfMsg","Give your Lane a name.",true);
  if((m==="chat-new"||m==="chat-edit")&&!cname) return say("lfMsg","Name the side chat.",true);
  if(m==="attach"&&!lf.lane) return say("lfMsg","Pick a Lane.",true);
  $("lfGo").disabled=true; say("lfMsg","…");
  try{
    let go=null;
    if(m==="new"){ const r=await api.laneCreate(lname,lf.icon,cname||"General",label); go=r?.room; lf.newLane=r?.lane; }
    if(m==="lane-edit") await api.laneRename(lf.lane,lname,lf.icon);
    if(m==="chat-new") go=await api.laneAddChat(lf.lane,cname,lf.kind==="voice"&&label==="nl:chat"?"nl:phones":label,lf.kind);
    if(m==="chat-edit") await api.laneEditChat(lf.code,cname,label);
    if(m==="attach") await api.laneAttach(lf.lane,lf.code,label);
    // 🎨 pictures + banner (lanes-art.sql)
    const laneId=m==="new"?laneOf2(go):lf.lane;
    try{
    if((m==="new"||m==="lane-edit")&&laneId){
      let iconUrl=lf.iconUrl, banner=lf.banner;
      if(lf.iconFile){ say("lfMsg","Uploading picture…"); iconUrl=await api.upload("avatars",user.id,lf.iconFile); }
      if(lf.bannerFile){ say("lfMsg","Uploading banner…"); banner=await api.upload("avatars",user.id,lf.bannerFile); }
      if(iconUrl!==(m==="new"?null:lf.origIconUrl)||banner!==(m==="new"?null:lf.origBanner)) await api.laneSetArt(laneId,iconUrl||null,banner||null);
    }
    const chatCode=m==="chat-new"||m==="new"?go:lf.code;
    if(chatCode&&(lf.chatFile||lf.chatClear)){ say("lfMsg","Uploading picture…"); await api.laneSetChatIcon(chatCode,lf.chatFile?await api.upload("avatars",user.id,lf.chatFile):null); }
    }catch(err){ toast("🎨 Lanes",/lane_set_art|lane_set_chat_icon|schema cache|does not exist/i.test(err.message)?"Saved, but pictures and banners need a quick setup: run lanes-art.sql in Supabase.":"Saved, but the picture didn't upload: "+err.message); }
    show($("laneForm"),false); await loadInbox();
    if(m==="new"){ setFrontTab("lanes"); toast("🛣️ Lanes",`${lf.icon} ${lname} is ready! Tap ⚙️ to add friends.`); }
    if(m==="chat-new"&&go&&lf.kind!=="voice"){ show($("laneSheet"),false); enterRoom(go); }
    else if(laneSheetId&&!$("laneSheet").classList.contains("hidden")) openLaneSheet(laneSheetId);
    if(m==="attach"||m==="chat-edit"||m==="lane-edit"){ if(room&&laneByRoom.has(room)) setRoomName(laneByRoom.get(room).name||roomName); }
    if(m==="attach") toast("🛣️ Lanes","Moved in! It's a side chat now.");
  }catch(err){ say("lfMsg",/lane_set_art|lane_set_chat_icon/i.test(err.message)?"Pictures and banners need a quick setup: run lanes-art.sql in Supabase.":/lane_|schema cache|does not exist/i.test(err.message)?"Lanes need a quick setup first: run lanes.sql in Supabase.":err.message,true); }
  finally{ $("lfGo").disabled=false; }
};

/* ---------- add friends straight into a room ---------- */
const afPicked=new Set(); let afLane=null, afHere=null;   // afLane: adding to a Lane instead of this room
async function openAddFriends(lane){
  afLane=typeof lane==="string"?lane:null;
  if(afLane){ try{ afHere=new Set((await api.laneMembers(afLane)).map(m=>m.user_id)); }catch(e){ afHere=new Set(); } } else afHere=null;
  show($("roomSheet"),false); afPicked.clear(); say("afMsg",""); paintAfButton();
  $("afSub").textContent=afLane?"Tap the friends you want in this Lane. They'll get every side chat.":"Tap the friends you want to add.";
  const list=$("afList"); list.innerHTML=""; list.append(el("p","sub","Loading your friends…")); show($("afSheet"));
  let mine=[], them=[];
  try{ [mine,them]=await Promise.all([api.contacts(),api.addedMe()]); }catch(e){ list.innerHTML=""; list.append(el("p","sub","Couldn't load your friends. Check your connection and try again.")); return; }
  const mutual=mine.filter(u=>them.includes(u)&&!blocked.has(u));   // only people who added you back can be added
  await ensureProfiles(mutual).catch(()=>{});
  list.innerHTML="";
  if(!mutual.length){ list.append(el("p","sub","No friends to add yet. Once you and a friend have both added each other, they'll show up here.")); return; }
  const isIn=u=>afHere?afHere.has(u):members.has(u);
  const here=mutual.filter(isIn), todo=mutual.filter(u=>!isIn(u));
  const byName=(a,b)=>nameOf(a).localeCompare(nameOf(b));
  todo.sort(byName).forEach(u=>list.append(afRow(u,false)));
  here.sort(byName).forEach(u=>list.append(afRow(u,true)));
  if(!todo.length) list.prepend(el("p","sub",afLane?"All your friends are already in this Lane! 🎉":"All your friends are already in this room! 🎉"));
}
function afRow(uid,already){
  const b=el("button","afrow"+(already?" here":"")); b.type="button"; b.disabled=already;
  const f=el("span","face sm"); paintFace(f,cache.get(uid)||{id:uid,username:nameOf(uid)});
  b.append(f,el("span","afname",cache.get(uid)?.username||nameOf(uid)),el("span","afcheck",already?(afLane?"In Lane":"In room"):""));
  b.setAttribute("aria-pressed","false"); b.setAttribute("aria-label",(cache.get(uid)?.username||"Friend")+(already?", already in this room":""));
  if(!already) b.onclick=()=>{ const on=!afPicked.has(uid); on?afPicked.add(uid):afPicked.delete(uid); b.classList.toggle("on",on); b.setAttribute("aria-pressed",String(on)); b.querySelector(".afcheck").textContent=on?"✓":""; paintAfButton(); };
  return b;
}
function paintAfButton(){ const n=afPicked.size; $("afAdd").disabled=!n; $("afAdd").textContent=n?`Add ${n} friend${n>1?"s":""}`:"Add"; }
$("addFriendsBtn").onclick=()=>openAddFriends();
$("afAdd").onclick=async()=>{
  const ids=[...afPicked]; if(!ids.length) return;
  $("afAdd").disabled=true; say("afMsg","Adding…");
  try{
    const n=afLane?await api.laneAddFriends(afLane,ids):await api.addFriendsToRoom(room,ids);
    if(!n){ say("afMsg","They couldn't be added. They may already be here, or not a mutual friend anymore.",true); $("afAdd").disabled=false; return; }
    say("afMsg",`Added ${n} friend${n>1?"s":""}! 🎉 They'll get a notification.`);
    setTimeout(()=>{ show($("afSheet"),false); if(afLane){ loadInbox(); if(laneSheetId===afLane) openLaneSheet(afLane); } },1100);
  }catch(err){ say("afMsg","Couldn't add them: "+err.message,true); $("afAdd").disabled=false; }
};
$("afClose").onclick=()=>show($("afSheet"),false);
$("afSheet").addEventListener("click",e=>{ if(e.target.id==="afSheet") show($("afSheet"),false); });

/* ---------- room picture ---------- */
$("riPick").onclick=()=>$("riFile").click();
$("riFile").onchange=async e=>{
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  if(f.size>15e6) return say("rsMsg","That picture is over 15 MB. Pick a smaller one.",true);
  const gif=f.type==="image/gif"&&f.size<5e6;   // 🎞️ GIFs stay animated (cropping would freeze them)
  let pic=f;
  if(!gif){ try{ pic=await openCrop(f,"room"); }catch(err){ return say("rsMsg","Couldn't open that picture: "+err.message,true); }
    if(!pic) return say("rsMsg",""); }   // cancelled
  $("riPick").disabled=true; say("rsMsg","Uploading…");
  try{ const url=await api.upload("avatars",user.id,pic); await api.setRoomIcon(room,url); roomIcons.set(room,url); paintRoomIcon(); loadInboxSoon(); say("rsMsg","Room picture updated for everyone."); }
  catch(err){ say("rsMsg","Couldn't change the picture: "+err.message,true); }
  finally{ $("riPick").disabled=false; }
};
$("riRemove").onclick=async()=>{
  try{ await api.setRoomIcon(room,null); roomIcons.delete(room); paintRoomIcon(); loadInboxSoon(); say("rsMsg","Room picture removed."); }
  catch(err){ say("rsMsg","Couldn't remove it: "+err.message,true); }
};

/* ---------- room background ---------- */
function setRoomBackground(bg){
  roomBg=bg||null;
  const c=$("chat");
  if(bg&&/^#[0-9a-f]{6}$/i.test(bg)){ c.dataset.bg="custom"; c.style.setProperty("--roombg",bg); }
  else { c.dataset.bg=bg||"stars"; c.style.removeProperty("--roombg"); }
}
/* a third background layer (with its own ::before/::after) for richer, animated chat backgrounds */
(()=>{ const c=document.getElementById("chat"); if(c&&!c.querySelector(":scope > .bgfx")){ const f=document.createElement("div"); f.className="bgfx"; f.setAttribute("aria-hidden","true"); c.prepend(f); } })();
function paintBgTiles(){
  const box=$("bgTiles"); box.innerHTML="";
  BACKGROUNDS.filter(([id])=>unlockOk("bg",id)||(roomBg||"stars")===id).forEach(([id,label])=>{
    const t=el("button","bgtile",label); t.type="button"; t.dataset.bg=id; t.setAttribute("aria-pressed",(roomBg||"stars")===id);
    t.onclick=()=>chooseBackground(id==="stars"?null:id); box.append(t);
  });
  if(roomBg&&roomBg.startsWith("#")) $("bgCustom").value=roomBg;
}
async function chooseBackground(bg){
  const prev=roomBg; setRoomBackground(bg); paintBgTiles();
  try{ await api.setBackground(room,bg); say("rsMsg","Background updated for everyone."); }
  catch(err){ setRoomBackground(prev); paintBgTiles(); say("rsMsg","Couldn't change background: "+err.message,true); }
}
$("bgCustom").addEventListener("change",e=>chooseBackground(e.target.value));

/* ---------- pinned messages ---------- */
async function loadPinnedContext(){
  const missing=[...pins.keys()].filter(id=>!byId.has(id)&&!contextById.has(id));
  for(const id of missing){ const m=await api.fetchMessage(id).catch(()=>null); if(m){ contextById.set(id,m); await ensureProfiles([m.user_id]); } else pins.delete(id); }
  const games=[...pins.keys()].map(id=>byId.get(id)||contextById.get(id)).filter(m=>m?.kind==="game");
  if(games.length){ await loadGames(games).catch(()=>{}); const ids=new Set(games.flatMap(m=>{ const g=gamesById.get(m.id); return g?[g.player_x,g.player_o,...(g.state?.players||[])]:[]; }).filter(Boolean)); if(ids.size) await ensureProfiles([...ids]).catch(()=>{}); }
}
// "whose turn / who won" for any game, for the pin bar
function anyGameStatus(g){ return g.type==="eights"?e8Status(g):g.type==="liarsdice"?ldStatus(g):g.type==="bs"?bsStatus(g):g.type==="lucky7"?l7Status(g):g.type==="blackout"?boStatus(g):g.type==="mahjong"?mjStatus(g):gameStatusText(g); }
const pinnedGameUp=m=>{ const g=m?.kind==="game"&&gamesById.get(m.id); return !!(g&&g.status!=="done"&&anyGameStatus(g).turn); };
function pinnedList(){   // games waiting on you come first
  return [...pins.values()].sort((a,b)=>a.created_at<b.created_at?1:-1).map(p=>byId.get(p.message_id)||contextById.get(p.message_id)).filter(m=>m&&!blocked.has(m.user_id))
    .sort((a,b)=>(pinnedGameUp(b)?1:0)-(pinnedGameUp(a)?1:0));
}
function paintPinBar(){
  const list=pinnedList(); show($("pinBar"),list.length>0); if(!list.length) return;
  if(pinCursor>=list.length) pinCursor=0;
  const m=list[pinCursor]; const t=$("pinText"); t.textContent="";
  const g=m.kind==="game"&&gamesById.get(m.id);
  $("pinBar").classList.toggle("gamepin",!!g); $("pinBar").classList.toggle("myturn",!!g&&pinnedGameUp(m));
  $("pinBar").querySelector(".pinicon").textContent=g?"🎮":"📌";
  if(g){ t.append(el("b","",(m.text||"Game")+" · ")); t.append(anyGameStatus(g).text); }
  else { t.append(el("b","",nameOf(m.user_id))); t.append(previewOf(m)); }
  $("pinCount").textContent=list.length>1?`${pinCursor+1}/${list.length} ▾`:""; show($("pinCount"),list.length>1);
  if(list.length<2) closePinMenu(); else if(!$("pinMenu").classList.contains("hidden")) paintPinMenu();
  $("pinJump").setAttribute("aria-label",g?`Pinned game: ${m.text}, ${anyGameStatus(g).text}. Tap to open it`:`Pinned message from ${nameOf(m.user_id)}. Tap to jump to it`);
}
$("pinJump").onclick=async()=>{
  const list=pinnedList(); if(!list.length) return;
  const m=list[pinCursor%list.length];
  if(m.kind==="game"&&gamesById.has(m.id)){ openGame(m.id); if(list.length>1){ pinCursor=(pinCursor+1)%list.length; paintPinBar(); } return; }   // a pinned game opens straight away
  let tries=0; while(!elById.has(m.id)&&hasMore&&tries++<6) await loadOlder();
  if(elById.has(m.id)) jumpTo(m.id); else $("status").textContent="That pinned message is too far back to show.";
  if(list.length>1){ pinCursor=(pinCursor+1)%list.length; paintPinBar(); }
};
/* tap the "1/3 ▾" to see every pin at once and jump straight to the one you want (thanks hachiware!) */
function openPinFrom(m){
  closePinMenu();
  if(m.kind==="game"&&gamesById.has(m.id)){ openGame(m.id); return; }
  (async()=>{ let tries=0; while(!elById.has(m.id)&&hasMore&&tries++<6) await loadOlder();
    if(elById.has(m.id)) jumpTo(m.id); else $("status").textContent="That pinned message is too far back to show."; })();
}
function paintPinMenu(){
  const box=$("pinMenu"); box.innerHTML="";
  pinnedList().forEach((m,i)=>{
    const g=m.kind==="game"&&gamesById.get(m.id), up=!!g&&pinnedGameUp(m);
    const b=el("button","pinitem"+(up?" myturn":"")+(i===pinCursor?" cur":"")); b.type="button"; b.setAttribute("role","menuitem");
    const t=el("span","pt");
    if(g){ t.append(el("b","",m.text||"Game"),anyGameStatus(g).text); } else { t.append(el("b","",nameOf(m.user_id)),previewOf(m)); }
    b.append(el("span","",g?"🎮":"📌"),t);
    b.onclick=e=>{ e.stopPropagation(); pinCursor=i; paintPinBar(); openPinFrom(m); };
    box.append(b);
  });
}
function closePinMenu(){ show($("pinMenu"),false); $("pinCount").setAttribute("aria-expanded","false"); }
$("pinCount").onclick=e=>{ e.stopPropagation(); const open=$("pinMenu").classList.contains("hidden");
  if(open){ paintPinMenu(); show($("pinMenu"),true); $("pinCount").setAttribute("aria-expanded","true"); } else closePinMenu(); };
document.addEventListener("click",e=>{ if(!$("pinMenu").classList.contains("hidden")&&!e.target.closest("#pinBar")) closePinMenu(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!$("pinMenu").classList.contains("hidden")) closePinMenu(); });
function paintPins(){
  const list=pinnedList(), box=$("pinList"); box.innerHTML=""; show($("pinTitle"),list.length>0);
  $("pinTitle").textContent=`Pinned (${list.length})`;
  list.forEach(m=>{
    const row=el("div","member"); const txt=el("span","mname",`${nameOf(m.user_id)}: ${previewOf(m)}`);
    const b=el("button","","Unpin"); b.type="button";
    b.onclick=async()=>{ try{ await api.unpin(m.id); pins.delete(m.id); paintPins(); paintPinBar(); refreshMsg(m.id); }catch(err){ say("rsMsg",err.message,true); } };
    row.append(txt,b); box.append(row);
  });
}

/* ---------- read receipts ---------- */
let readTimer=null;
function markReadSoon(){
  if(!room||document.hidden||$("chat").classList.contains("hidden")) return;
  const code=room;
  clearTimeout(readTimer); readTimer=setTimeout(()=>api.markRead(code).then(()=>{
    // You've read it: clear its pop-ups, and on PC (where the chat list stays on screen next to the chat) refresh the unread numbers too
    if(typeof closeRoomNotifications==="function") closeRoomNotifications(code);
    if((document.body.classList.contains("desktop")||!$("front").classList.contains("hidden"))&&typeof loadInboxSoon==="function") loadInboxSoon();
  }).catch(()=>{}),700);
}
function setMember(r){
  if(!r?.user_id) return;
  const prev=members.get(r.user_id)||{read:0,nick:null};
  const next={read: r.last_read_at!==undefined ? (r.last_read_at?new Date(r.last_read_at).getTime():0) : prev.read,
              nick: r.nickname!==undefined ? (r.nickname||null) : prev.nick};
  members.set(r.user_id,next);
  if(r.user_id===user?.id&&room&&typeof updateCatchUp==="function"&&!$("catchUp").dataset.shownOnce){ $("catchUp").dataset.shownOnce="1"; }
  if(next.nick!==prev.nick && room){ renderAll(false); paintPinBar(); if(!$("roomSheet").classList.contains("hidden")) paintMembers(); }
  ensureProfiles([r.user_id]).then(paintReceipts);
}
function paintReceipts(){
  feed.querySelectorAll(".receipt").forEach(n=>n.remove());
  const mineEls=feed.querySelectorAll(".msg.me"); const last=mineEls[mineEls.length-1]; if(!last) return;
  const t=+last.dataset.t;
  const readers=[...members].filter(([uid,v])=>uid!==user.id&&v.read>=t&&!blocked.has(uid)).map(([uid])=>cache.get(uid)).filter(Boolean);
  const r=el("div","receipt"+(readers.length?" read":""));
  if(readers.length){
    const faces=el("span","mini-faces");
    readers.slice(0,4).forEach(p=>{ const f=el("span","face"); paintFace(f,p); faces.append(f); });
    r.append(faces,`Read by ${readers.length<=2?readers.map(p=>nameOf(p.id)).join(" & "):readers.length+" people"}`);
  } else r.textContent="Sent";
  last.after(r);
}

/* ---------- typing ---------- */
let lastTypingSent=0;
let footTimer=null, footStep=0;   // ink-map walking footprints
function stopFootsteps(){ clearInterval(footTimer); footTimer=null; footStep=0; }
function paintTyping(){
  const box=$("typing"); const names=[...typers.values()].map(v=>v.name);
  if(!names.length){ stopFootsteps(); box.innerHTML=""; return; }
  if(INKMAP.isOn()){   // ✍️ Cole: map mode shows footprints instead of "is typing"
    if(!footTimer){
      box.innerHTML = INKMAP.FOOT_L; footStep=1;
      footTimer=setInterval(()=>{
        if(!INKMAP.isOn()){ stopFootsteps(); box.innerHTML=""; paintTyping(); return; }
        if(footStep>=8){ box.innerHTML=""; footStep=0; }
        box.insertAdjacentHTML("beforeend", footStep%2 ? INKMAP.FOOT_R : INKMAP.FOOT_L);
        footStep++;
      },320);
    }
    return;
  }
  if(footTimer){ stopFootsteps(); box.innerHTML=""; }
  const label=names.length===1?`${names[0]} is typing`:names.length===2?`${names[0]} & ${names[1]} are typing`:"Several people are typing";
  if(typeof VERSE!=="undefined"&&VERSE.isOn()){ VERSE.typing(box,label); return; }   // 🕸️ comic mode: thought bubble + spider-sense
  if(box.querySelector(".sv-think")) box.innerHTML="";
  let pill=box.querySelector(".pill");
  if(!pill){ pill=el("div","pill"); pill.innerHTML='<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span></span>'; box.append(pill); }
  pill.lastChild.textContent=label;
}
function onTyping(p){
  if(!p?.uid||p.uid===user?.id||blocked.has(p.uid)) return;
  if(!p.typing) return stopTyping(p.uid);
  clearTimeout(typers.get(p.uid)?.timer);
  typers.set(p.uid,{name:(members.get(p.uid)?.nick||String(p.name||"Someone")).slice(0,30),timer:setTimeout(()=>stopTyping(p.uid),4000)});
  paintTyping();
}
function stopTyping(uid){ const v=typers.get(uid); if(!v) return; clearTimeout(v.timer); typers.delete(uid); paintTyping(); }
let typingPresenceTimer=null;
function sendTyping(on){
  clearTimeout(typingPresenceTimer); typingPresenceTimer=setTimeout(()=>{ if(typeof pushPresence==="function") pushPresence(); },on?300:1200);
  if(!unsub?.typing||!user) return;
  const now=Date.now(); if(on&&now-lastTypingSent<2000) return;
  lastTypingSent=on?now:0;
  try{ unsub.typing({uid:user.id,name:nameOf(user.id),typing:on}); }catch(e){}
}

/* ---------- composer ---------- */
function clearPending(){ spoilerOn=false; pendingFile=null; pendingKind=null; pendingDuration=null; show($("pending"),false); show($("pendingImg")); show($("pendingVid"),false); $("pendingVid").removeAttribute("src"); clearPendingImages(); }
function clearPendingImages(){ spoilerOn=false; pendingImages.forEach(f=>f._url&&URL.revokeObjectURL(f._url)); pendingImages=[]; paintPendingMulti(); }
/* ---------- spoiler photos ---------- */
let spoilerOn=false;
new MutationObserver(()=>paintSpoilerBtn()).observe(document.getElementById("pending"),{attributes:true,attributeFilter:["class"]});
document.getElementById("spoilerBtn").onclick=()=>{ spoilerOn=!spoilerOn; paintSpoilerBtn(); };
const hasPendingPhoto=()=>pendingImages.length>0||(!!pendingFile&&pendingKind==="image");
// Pixelates a spoiler photo (or album) until tapped. The photo is also blurred underneath, so it never
// flashes clear while loading. Revealing is just for you, and sticks if the message gets redrawn.
const spoilersSeen=new Set();
function makeSpoiler(box,id){
  if(spoilersSeen.has(id)) return;
  box.classList.add("spoiler");
  box.querySelectorAll("img").forEach(im=>{
    const cv=document.createElement("canvas"); cv.className="pixels"; cv.setAttribute("aria-hidden","true");
    const draw=()=>{ try{ const w=14, h=Math.max(1,Math.round(w*(im.naturalHeight||1)/(im.naturalWidth||1))); cv.width=w; cv.height=h; cv.getContext("2d").drawImage(im,0,0,w,h); cv.classList.add("ready"); }catch(e){} };
    if(im.complete&&im.naturalWidth) draw(); else im.addEventListener("load",draw,{once:true});
    im.insertAdjacentElement("afterend",cv);
  });
  const label=el("span","spoilerlabel","🙈 Spoiler · tap to see"); box.append(label);
  box.setAttribute("aria-label","Spoiler photo. Tap to reveal");
  box.addEventListener("click",function reveal(e){
    if(!box.classList.contains("spoiler")) return;
    e.stopPropagation(); e.preventDefault();
    box.classList.remove("spoiler"); box.querySelectorAll("canvas.pixels").forEach(c=>c.remove()); label.remove();
    box.removeAttribute("aria-label"); spoilersSeen.add(id); box.removeEventListener("click",reveal,true);
  },true);
}
function paintSpoilerBtn(){
  const b=$("spoilerBtn"); if(!b) return;
  show(b,hasPendingPhoto()); b.setAttribute("aria-pressed",String(spoilerOn));
  b.innerHTML=`🙈 Send as spoiler: <b>${spoilerOn?"on":"off"}</b>`; b.classList.toggle("on",spoilerOn);
}
function paintPendingMulti(){
  const wrap=$("pendingMulti"); show(wrap, pendingImages.length>1); setTimeout(paintSpoilerBtn,0);
  if(pendingImages.length<=1) return;
  show($("pending"),false);
  const strip=$("pmStrip"); strip.innerHTML="";
  pendingImages.forEach((f,i)=>{
    if(!f._url) f._url=URL.createObjectURL(f);
    const tile=el("span","pm-tile"); const img=document.createElement("img"); img.src=f._url; img.alt="";
    const x=el("button","",""); x.type="button"; x.setAttribute("aria-label","Remove this photo"); x.textContent="✕";
    x.onclick=()=>{ URL.revokeObjectURL(f._url); pendingImages.splice(i,1); paintPendingMulti(); };
    tile.append(img,x); strip.append(tile);
  });
  if(pendingImages.length<PENDING_MAX){ const add=el("button","pm-add","+"); add.type="button"; add.setAttribute("aria-label","Add another photo"); add.onclick=()=>$("picker").click(); strip.append(add); }
  $("pmLabel").textContent=`${pendingImages.length} photo${pendingImages.length===1?"":"s"} ready`;
}
const PENDING_MAX=10;
$("pmClear").onclick=clearPendingImages;
$("pickBtn").onclick=()=>{ closeTray(); $("picker").click(); };
/* Re-records a video at 720p / ~2 Mbps so iPhone clips (often 30-100+ MB) fit the 25 MB upload limit.
   It plays the video silently into a hidden canvas and records that, so it takes about as long as the clip.
   Output is MP4 (H.264) where the browser supports it, which plays on every phone. */
async function shrinkVideo(file,onProgress){
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream) throw new Error("this browser can't shrink videos. Try a shorter clip.");
  // H.264 only: it plays on every phone (VP9-in-MP4 doesn't play on iPhones)
  const type=["video/mp4;codecs=avc1.42E01E,mp4a.40.2","video/mp4;codecs=avc1,mp4a","video/mp4;codecs=avc1","video/webm;codecs=h264,opus","video/webm;codecs=h264"].find(t=>MediaRecorder.isTypeSupported(t));
  if(!type) throw new Error("this browser can't shrink videos. Try a shorter clip.");
  const url=URL.createObjectURL(file), v=document.createElement("video");
  v.src=url; v.playsInline=true; v.preload="auto"; v.muted=true;
  let ac=null, dest=null, stream=null, snd=null;
  try{
    await new Promise((res,rej)=>{ v.onloadedmetadata=res; v.onerror=()=>rej(new Error("couldn't read that video.")); });
    const short=Math.min(v.videoWidth,v.videoHeight)||720, k=Math.min(1,720/short);
    const w=Math.max(2,Math.round(v.videoWidth*k/2)*2), h=Math.max(2,Math.round(v.videoHeight*k/2)*2);
    const c=document.createElement("canvas"); c.width=w; c.height=h; const ctx=c.getContext("2d");
    stream=c.captureStream(30);
    // Sound: best is the video's own audio (stays in sync even if playback stutters). It's routed into a
    // recorder, never the speaker. If the phone blocks un-muted playback, fall back to decoding the audio.
    let elemAudio=false;
    try{ ac=sfxCtx(); if(ac.state==="suspended") await ac.resume();
         dest=ac.createMediaStreamDestination(); ac.createMediaElementSource(v).connect(dest);
         dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t)); v.muted=false; elemAudio=true; }catch(e){ dest=null; }
    const rec=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:2_000_000,audioBitsPerSecond:96_000});
    const chunks=[]; rec.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
    const stopped=new Promise(res=>{ rec.onstop=res; });
    // if playback stalls, pause recording so frozen frames aren't saved
    v.addEventListener("waiting",()=>{ if(rec.state==="recording") rec.pause(); });
    v.addEventListener("playing",()=>{ if(rec.state==="paused") rec.resume(); });
    let done=false;
    const draw=()=>{ if(done) return; ctx.drawImage(v,0,0,w,h); if(v.duration) onProgress&&onProgress(Math.min(1,v.currentTime/v.duration));
      v.requestVideoFrameCallback?v.requestVideoFrameCallback(draw):requestAnimationFrame(draw); };
    const finished=new Promise(res=>{ v.onended=res; });
    ctx.drawImage(v,0,0,w,h);
    try{ await v.play(); }
    catch(err){
      if(!elemAudio) throw new Error("couldn't play that video to shrink it.");
      v.muted=true; elemAudio=false;
      try{ const buf=await ac.decodeAudioData(await file.arrayBuffer()); snd=ac.createBufferSource(); snd.buffer=buf; snd.connect(dest); }catch(e){ snd=null; }
      await v.play();
    }
    rec.start(500); if(snd) snd.start(0,v.currentTime); draw();
    await finished; done=true; ctx.drawImage(v,0,0,w,h);
    if(rec.state==="paused") rec.resume();
    await new Promise(r=>setTimeout(r,200)); rec.stop(); await stopped;
    const out=new Blob(chunks,{type:type.split(";")[0]});
    if(!out.size) throw new Error("couldn't shrink that video. Try a shorter clip.");
    onProgress&&onProgress(1);
    return out;
  }finally{
    try{ snd&&snd.stop(); }catch(e){} try{ stream&&stream.getTracks().forEach(t=>t.stop()); }catch(e){}
    v.pause(); URL.revokeObjectURL(url); v.removeAttribute("src"); v.load();
  }
}
function videoDuration(file){ return new Promise(res=>{ const v=document.createElement("video"); v.preload="metadata"; v.onloadedmetadata=()=>{ res(v.duration); URL.revokeObjectURL(v.src); }; v.onerror=()=>res(NaN); v.src=URL.createObjectURL(file); }); }
$("picker").onchange=async e=>{
  let files=[...e.target.files]; e.target.value="";
  if(!files.length) return;
  if(files.length===1&&!pendingImages.length){ takeFile(files[0]); return; }
  if((await Promise.all(files.map(isHeic))).some(Boolean)){
    $("status").textContent="Converting photos…";
    files=(await Promise.all(files.map(f=>readableImage(f).catch(()=>null)))).filter(Boolean); $("status").textContent="";
  }
  const imgs=files.filter(f=>f.type.startsWith("image/"));
  if(imgs.length<files.length) $("status").textContent="Only photos can be sent together — videos need their own message.";
  if(!imgs.length) return;
  if(pendingFile){ clearPending(); }   // switching from a single video/photo into album mode
  const room=PENDING_MAX-pendingImages.length;
  if(room<=0){ $("status").textContent=`You can send up to ${PENDING_MAX} photos at once.`; return; }
  const oversize=imgs.some(f=>f.size>15e6);
  if(oversize) $("status").textContent="One or more photos are over 15 MB and were skipped.";
  pendingImages.push(...imgs.filter(f=>f.size<=15e6).slice(0,room));
  paintPendingMulti();
};
async function takeFile(f){
  const heic=await isHeic(f);
  if(!heic&&!f.type.startsWith("image/")&&!f.type.startsWith("video/")){ $("status").textContent="Only photos and videos can be attached."; return; }
  if(heic){ $("status").textContent="Converting photo…"; try{ f=await readableImage(f); $("status").textContent=""; }catch(err){ $("status").textContent=err.message; return; } }
  if(f.type.startsWith("video/")){
    if(f.size>MAX_PICK_BYTES){ $("status").textContent="That video is too big (over 500 MB). Try a shorter clip."; return; }
    const d=await videoDuration(f);
    if(isFinite(d)&&d>MAX_VIDEO_SECONDS+0.5){ $("status").textContent=`Videos can be up to ${MAX_VIDEO_SECONDS} seconds. That one is ${Math.round(d)}.`; return; }
    pendingFile=f; pendingKind="video"; pendingDuration=isFinite(d)?Math.round(d*10)/10:null;
    $("pendingVid").src=URL.createObjectURL(f); show($("pendingVid")); show($("pendingImg"),false); $("pendingLabel").textContent="Video ready"; show($("pending"));
  } else {
    if(f.size>15e6){ $("status").textContent="Photo is over 15 MB."; return; }
    pendingFile=f; pendingKind="image"; $("pendingImg").src=URL.createObjectURL(f); show($("pendingImg")); show($("pendingVid"),false); $("pendingLabel").textContent="Photo ready"; show($("pending"));
  }
}
$("box").addEventListener("paste",e=>{
  const items=[...(e.clipboardData?.items||[])];
  const file=items.filter(i=>i.kind==="file").map(i=>i.getAsFile()).find(f=>f&&(f.type.startsWith("image/")||f.type.startsWith("video/")))
          || [...(e.clipboardData?.files||[])].find(f=>f.type.startsWith("image/")||f.type.startsWith("video/"));
  if(!file) return;
  e.preventDefault();
  takeFile(file.name?file:new File([file],"pasted."+(file.type.split("/")[1]||"png"),{type:file.type}));
});
["dragover","drop"].forEach(t=>$("chat").addEventListener(t,e=>{
  if(![...(e.dataTransfer?.types||[])].includes("Files")) return;
  e.preventDefault();
  if(t==="drop"){ const f=[...e.dataTransfer.files].find(f=>f.type.startsWith("image/")||f.type.startsWith("video/")); if(f) takeFile(f); }
}));
$("unpick").onclick=clearPending;

async function sendFields(fields){
  sendTyping(false);
  const m = fields.kind==="poll" ? await api.createPoll(room,fields.question,fields.options,fields.multi)
                                 : await sendRobust(room,{...fields,reply_to:fields.reply_to||replyTo?.id});
  clearReply(); $("status").textContent=sb?"Live":"Demo mode";
  await addMessages([m]);
  afterMySend(m);
  return m;
}
/* Bad Wi-Fi: instead of giving up on the first hiccup, keep trying for ~20 seconds. Before each retry it checks
   whether an earlier try actually made it (the message saved but the answer got lost), so nothing sends twice. */
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const sameMsg=(m,f)=>(m.kind||"text")===(f.kind||"text")&&(m.text||null)===(f.text||null)&&(m.image_url||null)===(f.image_url||null)&&(m.media_url||null)===(f.media_url||null)&&(m.sticker||null)===(f.sticker||null);
async function sendRobust(code,payload){
  if(typeof VERSE!=="undefined"&&payload?.kind==="text") try{ VERSE.pop(); }catch(e){}
  const started=Date.now(), had=new Set(msgs.filter(m=>m.user_id===user.id).map(m=>m.id));
  const waits=[0,1500,3000,5000,8000]; let lastErr;
  for(const w of waits){
    if(w){
      if(room===code) $("status").textContent="Weak connection… still sending";
      await pause(w);
      try{ const hit=(await api.loadLatest(code)).find(m=>m.user_id===user.id&&!had.has(m.id)&&new Date(m.created_at).getTime()>started-15000&&sameMsg(m,payload)); if(hit) return hit; }
      catch(e){ lastErr=e; if(!isNetworkError(e)) throw e; continue; }
    }
    try{ return await api.send(code,payload); }
    catch(e){ lastErr=e; if(!isNetworkError(e)) throw e; }
  }
  throw lastErr;
}
let sendingNow=false;
$("sendForm").addEventListener("submit",async e=>{
  e.preventDefault();
  if(sendingNow) return;                     // Enter pressed again while the last one is still sending
  const text=$("box").value.trim(); if(!text&&!pendingFile&&!pendingImages.length) return;
  sendingNow=true; $("sendBtn").disabled=true; hideMentions();
  const hadMedia=!!pendingFile||pendingImages.length>0;
  if(!hadMedia){ $("box").value=""; $("box").style.height=""; }   // text-only: clear right away so you can keep typing
  paintComposeMode();
  try{
    const f={kind:"text",text,mentions:mentionsIn(text)};
    if(spoilerOn&&hasPendingPhoto()) f.spoiler=true;
    if(pendingImages.length>1){
      $("status").textContent=`Uploading ${pendingImages.length} photos…`;
      const urls=await Promise.all(pendingImages.map(async img=>api.upload("chat-images",user.id,await shrink(img,1280,false))));
      f.image_urls=urls; f.image_url=urls[0]; f.kind="image";
    }
    else if(pendingFile&&pendingKind==="video"){
      let vid=pendingFile;
      if(vid.size>MAX_VIDEO_BYTES){
        $("status").textContent="Shrinking video… 0%";
        try{ vid=await shrinkVideo(vid,k=>{ $("status").textContent=`Shrinking video… ${Math.round(k*100)}%`; }); }
        catch(err){ throw new Error(err.message||"couldn't shrink that video. Try a shorter clip."); }
        if(vid.size>MAX_VIDEO_BYTES) throw new Error("even after shrinking it's over 25 MB. Try a shorter clip.");
      }
      $("status").textContent="Uploading video…"; f.media_url=await api.upload("chat-media",user.id,vid); f.media_type="video"; f.media_duration=pendingDuration; f.kind="video"; }
    else if(pendingFile||pendingImages.length===1){ $("status").textContent="Uploading photo…"; const one=pendingFile||pendingImages[0]; f.image_url=await api.upload("chat-images",user.id,await shrink(one,1280,false)); f.kind="image"; }
    await sendFields(f);
    if(room&&!isGameNight()&&isDailyAnswer(text)){ dismissDaily(room); show($("dailyBar"),false);   // answered: the question bar leaves this chat for today
      try{ const k="nl-qotd-xp-"+dayNumber(); if(!LS.get(k)){ LS.set(k,"1"); gainXP("qotd"); } }catch(e){} }   // +15 XP once a day, not once per chat   // answered: the question bar leaves this chat for today
    if(hadMedia&&$("box").value.trim()===text){ $("box").value=""; $("box").style.height=""; }   // only clear the caption you sent, never new typing
    if(hadMedia) clearPending();
    mentionPicks.clear(); paintComposeMode();
  }catch(err){
    if(text&&!hadMedia){ const now=$("box").value; $("box").value=now.trim()?text+"\n"+now:text; $("box").dispatchEvent(new Event("input")); }   // put your message back
    const offline=navigator.onLine===false||/failed to fetch|network|load failed|fetch/i.test(String(err?.message||err));
    $("status").textContent=offline?"You're offline. Your message is still in the box. Tap Send when you're back.":"Didn't send: "+err.message;
    sfx("error");
  }
  finally{ sendingNow=false; $("sendBtn").disabled=false; }
});
$("box").addEventListener("keydown",e=>{
  if(e.key==="Escape"){ hideMentions(); return; }
  if(e.key==="Enter"&&!e.shiftKey&&!matchMedia("(pointer: coarse)").matches){e.preventDefault();$("sendForm").requestSubmit();}
});
$("box").addEventListener("input",function(){ this.style.height="auto"; this.style.height=this.scrollHeight+"px"; sendTyping(this.value.trim().length>0); updateMentions(); paintComposeMode(); });
function paintComposeMode(){ $("sendForm").classList.toggle("typing",$("box").value.length>0); }
let newPillN=0;
function newPillAdd(){ newPillN++; $("newPillText").textContent=newPillN===1?"1 new message":`${newPillN} new messages`; show($("newPill")); }
function newPillClear(){ newPillN=0; show($("newPill"),false); }
$("newPill").onclick=()=>{ feed.scrollTo({top:feed.scrollHeight,behavior:reducedMotion()?"auto":"smooth"}); newPillClear(); };
feed.addEventListener("scroll",()=>{ if(newPillN&&feed.scrollHeight-feed.scrollTop-feed.clientHeight<80) newPillClear(); },{passive:true});
$("box").addEventListener("blur",()=>{ sendTyping(false); setTimeout(hideMentions,200); });

/* ---------- mentions ---------- */
function mentionQuery(){
  const box=$("box"), upto=box.value.slice(0,box.selectionStart);
  const m=upto.match(/(^|\s)@([^\s@]{0,20})$/); return m?{q:m[2].toLowerCase(),start:upto.length-m[2].length-1}:null;
}
function updateMentions(){
  const q=mentionQuery(); if(!q||!room){ hideMentions(); return; }
  const list=[...members.keys()].filter(uid=>uid!==user.id&&!blocked.has(uid))
    .filter(uid=>nameOf(uid).toLowerCase().startsWith(q.q)||(cache.get(uid)?.username||"").toLowerCase().startsWith(q.q)).slice(0,6);
  const box=$("mentionList"); box.innerHTML=""; if(!list.length){ hideMentions(); return; }
  list.forEach(uid=>{
    const b=el("button"); b.type="button"; b.setAttribute("role","option");
    const f=el("span","face"); paintFace(f,cache.get(uid)); b.append(f,nameOf(uid));
    b.onmousedown=ev=>ev.preventDefault();
    b.onclick=()=>{
      const bx=$("box"), cur=mentionQuery(); if(!cur) return;
      const name=nameOf(uid), before=bx.value.slice(0,cur.start), after=bx.value.slice(bx.selectionStart);
      bx.value=`${before}@${name} ${after}`; const pos=before.length+name.length+2; bx.setSelectionRange(pos,pos);
      mentionPicks.set(name,uid); hideMentions(); bx.focus();
    };
    box.append(b);
  });
  show(box);
}
function hideMentions(){ show($("mentionList"),false); }
function mentionsIn(text){
  const ids=new Set();
  for(const [name,uid] of mentionPicks) if(text.includes("@"+name)) ids.add(uid);
  for(const uid of members.keys()){ if(uid===user.id) continue;
    const names=[nameOf(uid),cache.get(uid)?.username].filter(Boolean);
    if(names.some(n=>new RegExp("(^|\\s)@"+n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(?=$|[^\\w])","i").test(text))) ids.add(uid); }
  return [...ids];
}
function renderText(node,text,mentionIds){
  const tokens=[];
  (mentionIds||[]).forEach(uid=>{ [nameOf(uid),cache.get(uid)?.username].filter(Boolean).forEach(n=>tokens.push("@"+n)); });
  if(!tokens.length){ linkify(node,text); return; }
  tokens.sort((a,b)=>b.length-a.length);
  const re=new RegExp("("+tokens.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")","gi");
  let last=0, m;
  while((m=re.exec(text))){ const s=el("span"); linkify(s,text.slice(last,m.index)); node.append(s); node.append(el("span","mention",m[0])); last=m.index+m[0].length; }
  const s=el("span"); linkify(s,text.slice(last)); node.append(s);
}

/* ---------- voice messages ---------- */
let rec=null;
function fmtDur(s){ s=Math.max(0,Math.round(s||0)); return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); }
$("micBtn").onclick=async()=>{
  closeTray();
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){ $("status").textContent="Voice messages aren't supported in this browser."; return; }
  let stream;
  /* voice-message quality: one clean mono track at full rate. Echo cancellation is for calls, not voice notes,
     and it's what makes voices cut in and out ("choppy"), so it's off. Noise suppression + auto volume stay on. */
  const VOICE_MIC={channelCount:1,sampleRate:{ideal:48000},echoCancellation:false,noiseSuppression:true,autoGainControl:true};
  audioForCapture(true);
  try{ stream=await navigator.mediaDevices.getUserMedia({audio:VOICE_MIC}); }
  catch(e){
    if(e?.name==="NotAllowedError"||e?.name==="SecurityError"){ $("status").textContent="Microphone permission was blocked. Allow it in your browser settings to record."; return; }
    try{ stream=await navigator.mediaDevices.getUserMedia({audio:true}); }   // older phones that don't like the settings above
    catch(e2){ $("status").textContent="Microphone permission was blocked. Allow it in your browser settings to record."; return; }
  }
  const type=["audio/mp4","audio/webm;codecs=opus","audio/webm","audio/ogg"].find(t=>MediaRecorder.isTypeSupported(t))||"";
  let mr; try{ mr=new MediaRecorder(stream,{...(type?{mimeType:type}:{}),audioBitsPerSecond:128000}); }   // higher quality than the default
  catch(e){ mr=new MediaRecorder(stream,type?{mimeType:type}:undefined); }
  const chunks=[];
  mr.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
  rec={mr,stream,chunks,start:Date.now(),cancelled:false,timer:setInterval(()=>{
    const s=(Date.now()-rec.start)/1000; $("recTime").textContent=fmtDur(s);
    if(s>=maxVoiceSeconds()) finishRecording(true);
  },250)};
  mr.start();   // one continuous recording (saving it in little 1/4-second pieces made the file stutter on some phones)
  $("recTime").textContent="0:00"; show($("composeRow"),false); show($("recBar"));
};
function finishRecording(send){
  if(!rec) return; const r=rec; rec=null;
  clearInterval(r.timer); show($("recBar"),false); show($("composeRow"));
  const seconds=(Date.now()-r.start)/1000;
  r.mr.onstop=async()=>{
    r.stream.getTracks().forEach(t=>t.stop()); audioForCapture(false);
    if(!send) { $("status").textContent="Recording discarded."; return; }
    if(seconds<0.8){ $("status").textContent="That was too short to send."; return; }
    const blob=new Blob(r.chunks,{type:(r.mr.mimeType||"audio/webm").split(";")[0]});
    try{
      $("status").textContent="Sending voice message…";
      const url=await api.upload("chat-media",user.id,blob);
      await sendFields({kind:"audio",media_url:url,media_type:"audio",media_duration:Math.round(seconds*10)/10});
    }catch(err){ $("status").textContent="Voice message didn't send: "+err.message; }
  };
  try{ r.mr.stop(); }catch(e){ r.stream.getTracks().forEach(t=>t.stop()); }
}
$("recSend").onclick=()=>finishRecording(true);
$("recCancel").onclick=()=>finishRecording(false);

let playingAudio=null;
function voicePlayer(url,duration){
  const wrap=el("div","voice"); const btn=el("button","play"); btn.type="button"; btn.setAttribute("aria-label","Play voice message");
  const playIcon='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>', pauseIcon='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  btn.innerHTML=playIcon;
  const wave=el("div","wave"); let seed=0; for(const c of url) seed=(seed*31+c.charCodeAt(0))>>>0;
  const bars=[...Array(28)].map((_,i)=>{ seed=(seed*1103515245+12345)>>>0; const b=el("i"); b.style.height=(25+(seed%70))+"%"; wave.append(b); return b; });
  const dur=el("span","dur",fmtDur(duration));
  const audio=new Audio(); audio.preload="none"; audio.src=url;
  const paint=()=>{ const k=audio.duration&&isFinite(audio.duration)?audio.currentTime/audio.duration:(duration?audio.currentTime/duration:0); const on=Math.round(k*bars.length); bars.forEach((b,i)=>b.classList.toggle("on",i<on)); dur.textContent=fmtDur(audio.paused&&!audio.currentTime?duration:audio.currentTime); };
  audio.ontimeupdate=paint;
  audio.onended=()=>{ btn.innerHTML=playIcon; btn.setAttribute("aria-label","Play voice message"); audio.currentTime=0; paint(); };
  let wantPlay=false;   // you pressed play (so after swapping in a private link, keep playing)
  audio.onerror=async()=>{ if(await privateFallback(audio)){ if(wantPlay) audio.play().catch(()=>{ dur.textContent="Can't play"; }); return; } dur.textContent="Can't play"; };
  btn.onclick=e=>{ e.stopPropagation();
    if(audio.paused){ if(playingAudio&&playingAudio!==audio) playingAudio.pause(); playingAudio=audio; wantPlay=true; audio.play().catch(()=>{ /* a load failure is handled by audio.onerror (it retries with a private link first) */ }); btn.innerHTML=pauseIcon; btn.setAttribute("aria-label","Pause voice message"); }
    else { wantPlay=false; audio.pause(); btn.innerHTML=playIcon; btn.setAttribute("aria-label","Play voice message"); } };
  audio.onpause=()=>{ btn.innerHTML=playIcon; };
  wave.onclick=e=>{ e.stopPropagation(); const d=audio.duration&&isFinite(audio.duration)?audio.duration:duration; if(!d) return; const r=wave.getBoundingClientRect(); audio.currentTime=Math.max(0,Math.min(d,(e.clientX-r.left)/r.width*d)); paint(); };
  wrap.append(btn,wave,dur); return wrap;
}

/* ---------- stickers ---------- */
const STK=(body,rot=-6)=>`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(${rot} 60 60)">${body}</g></svg>`;
const STAMP=(txt,bg,fg,size=34,extra="")=>STK(`<polygon points="10,34 108,24 112,86 14,96" fill="#07041A" transform="translate(5 5)"/><polygon points="10,34 108,24 112,86 14,96" fill="${bg}" stroke="#07041A" stroke-width="4"/>${extra}<text x="61" y="${66+size*.33}" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="${size}" fill="${fg}" stroke="#07041A" stroke-width="1.5" paint-order="stroke">${txt}</text>`);
const STICKERS={
  duo:{label:"Duo",bond:10,svg:STK(`<circle cx="44" cy="60" r="34" fill="#07041A" transform="translate(4 4)"/><circle cx="78" cy="60" r="34" fill="#07041A" transform="translate(4 4)"/><circle cx="44" cy="60" r="34" fill="#00F0FF" stroke="#07041A" stroke-width="4"/><circle cx="78" cy="60" r="34" fill="#E07AC6" fill-opacity=".92" stroke="#07041A" stroke-width="4"/><path d="M61 36 l3 7 7 1 -5 5 2 7 -7 -4 -6 4 1 -7 -5 -5 7 -1z" fill="#F3FF3A" stroke="#07041A" stroke-width="2.5"/><text x="61" y="84" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="32" fill="#F3FF3A" stroke="#07041A" stroke-width="5" paint-order="stroke">DUO</text>`)},
  nice:{label:"NICE!",svg:STAMP("NICE!","#F3FF3A","#07041A",36)},
  gg:{label:"GG",svg:STAMP("GG","#00F0FF","#07041A",50)},
  lol:{label:"LOL",svg:STAMP("LOL","#E07AC6","#F4F7FF",46,"") },
  omw:{label:"OMW",svg:STAMP("OMW","#7CFF6B","#07041A",44)},
  brb:{label:"BRB",svg:STAMP("BRB","#FF8A3D","#07041A",44)},
  noway:{label:"NO WAY",svg:STAMP("NO WAY","#FF5A5A","#F4F7FF",28)},
  what:{label:"?!",svg:STK(`<polygon points="60,6 74,40 112,34 84,62 104,98 64,82 30,110 36,72 6,52 44,42" fill="#07041A" transform="translate(4 4)"/><polygon points="60,6 74,40 112,34 84,62 104,98 64,82 30,110 36,72 6,52 44,42" fill="#F3FF3A" stroke="#07041A" stroke-width="4"/><text x="60" y="76" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="40" fill="#07041A">?!</text>`,8)},
  moon:{label:"Winking moon",svg:STK(`<path d="M70 12a48 48 0 1 0 40 70a38 38 0 0 1-40-70z" fill="#07041A" transform="translate(4 4)"/><path d="M70 12a48 48 0 1 0 40 70a38 38 0 0 1-40-70z" fill="#F3FF3A" stroke="#07041A" stroke-width="4"/><circle cx="42" cy="54" r="5" fill="#07041A"/><path d="M58 52q7-6 13 0" stroke="#07041A" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M40 76q12 12 26 2" stroke="#07041A" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="34" cy="68" r="5" fill="#E07AC6" opacity=".7"/>`,-10)},
  heart:{label:"Heart",svg:STK(`<path d="M60 102C20 74 8 52 18 34c10-18 32-18 42 0c10-18 32-18 42 0c10 18-2 40-42 68z" fill="#07041A" transform="translate(4 4)"/><path d="M60 102C20 74 8 52 18 34c10-18 32-18 42 0c10-18 32-18 42 0c10 18-2 40-42 68z" fill="#E07AC6" stroke="#07041A" stroke-width="4"/><path d="M30 42q6-10 16-8" stroke="#F4F7FF" stroke-width="5" fill="none" stroke-linecap="round"/>`,6)},
  fire:{label:"Fire",svg:STK(`<path d="M60 8c8 22 34 30 34 60a34 34 0 0 1-68 0c0-16 8-24 14-32c2 12 8 16 12 16c-4-16 0-32 8-44z" fill="#07041A" transform="translate(4 4)"/><path d="M60 8c8 22 34 30 34 60a34 34 0 0 1-68 0c0-16 8-24 14-32c2 12 8 16 12 16c-4-16 0-32 8-44z" fill="#FF8A3D" stroke="#07041A" stroke-width="4"/><path d="M60 58c6 10 16 14 16 28a16 16 0 0 1-32 0c0-8 6-12 8-18c2 6 4 8 6 8c-2-6 0-12 2-18z" fill="#F3FF3A"/>`,-4)},
  crown:{label:"Crown",svg:STK(`<polygon points="12,86 18,32 42,58 60,22 78,58 102,32 108,86" fill="#07041A" transform="translate(4 4)"/><polygon points="12,86 18,32 42,58 60,22 78,58 102,32 108,86" fill="#F3FF3A" stroke="#07041A" stroke-width="4"/><rect x="12" y="86" width="96" height="14" fill="#00F0FF" stroke="#07041A" stroke-width="4"/><circle cx="60" cy="66" r="7" fill="#E07AC6" stroke="#07041A" stroke-width="3"/>`,-8)},
  nightowl:{label:"Night owl",secret:"moonwink",svg:STK(`<path d="M68 12a46 46 0 1 0 38 68a36 36 0 0 1-38-68z" fill="#07041A" transform="translate(4 4)"/><path d="M68 12a46 46 0 1 0 38 68a36 36 0 0 1-38-68z" fill="#F3FF3A" stroke="#07041A" stroke-width="4"/><rect x="18" y="46" width="30" height="14" rx="3" fill="#07041A"/><rect x="52" y="46" width="30" height="14" rx="3" fill="#07041A"/><rect x="46" y="50" width="8" height="4" fill="#07041A"/><rect x="22" y="49" width="10" height="4" fill="#00F0FF" opacity=".8"/><path d="M34 78q12 8 26 0" stroke="#07041A" stroke-width="4" fill="none" stroke-linecap="round"/><text x="84" y="30" font-family="Anton,Impact,sans-serif" font-size="20" fill="#E07AC6" stroke="#07041A" stroke-width="3" paint-order="stroke">✦</text>`,-6)},
  dragon:{label:"Dragon",secret:"dragon",get svg(){ return `<img src="${DRAGON_IMG}" alt="" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(3px 3px 0 #F3FF3A)">`; }},
  nat20:{label:"NAT 20",secret:"d20",svg:STK(`<polygon points="60,6 108,32 108,88 60,114 12,88 12,32" fill="#07041A" transform="translate(4 4)"/><polygon points="60,6 108,32 108,88 60,114 12,88 12,32" fill="#F3FF3A" stroke="#07041A" stroke-width="4"/><text x="60" y="76" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="44" fill="#07041A">20</text>`,-8)},
  preem:{label:"PREEM",secret:"preem",svg:STAMP("PREEM","#9aa4c0","#F4F7FF",34)},
  pogs:{label:"POG",secret:"pog",svg:STK(`<circle cx="60" cy="60" r="50" fill="#07041A" transform="translate(4 4)"/><circle cx="60" cy="60" r="50" fill="#F3FF3A" stroke="#07041A" stroke-width="4"/><ellipse cx="42" cy="50" rx="12" ry="15" fill="#fff" stroke="#07041A" stroke-width="3"/><ellipse cx="78" cy="50" rx="12" ry="15" fill="#fff" stroke="#07041A" stroke-width="3"/><circle cx="44" cy="52" r="5"/><circle cx="80" cy="52" r="5"/><ellipse cx="60" cy="84" rx="13" ry="15" fill="#07041A"/>`,-6)},
  nanis:{label:"NANI?!",secret:"nani",svg:STAMP("NANI?!","#c00","#F4F7FF",32)},
  redrums:{label:"REDRUM",secret:"redrum",svg:STK(`<text x="60" y="76" text-anchor="middle" font-family="Brush Script MT,Segoe Script,cursive" font-size="34" fill="#ff1a1a" stroke="#07041A" stroke-width="2" paint-order="stroke" transform="scale(-1 1) translate(-120 0)">REDRUM</text>`,-8)},
  showtimes:{label:"SHOWTIME",secret:"showtime",svg:STAMP("SHOWTIME!","#E8182B","#F4F7FF",22)},
  blunt:{label:"Blunt",secret:"xen",svg:STK(`<g transform="translate(4 4)"><path d="M14 78 L96 44 L104 58 L22 92 Z" fill="#07041A"/></g>
    <path d="M14 78 L96 44 L104 58 L22 92 Z" fill="#8a5a2b" stroke="#07041A" stroke-width="4" stroke-linejoin="round"/>
    <path d="M22 80 L94 50 M26 86 L98 56" stroke="#6b4220" stroke-width="2.5"/>
    <path d="M14 78 L22 92 L30 89 L22 75 Z" fill="#F4F7FF" stroke="#07041A" stroke-width="3"/>
    <ellipse cx="100" cy="51" rx="6" ry="8" transform="rotate(-22 100 51)" fill="#FF8A3D" stroke="#07041A" stroke-width="3"/>
    <circle cx="101" cy="50" r="3" fill="#F3FF3A"/>
    <path d="M102 38 q-8 -8 0 -16 q8 -8 0 -16" fill="none" stroke="#B18CFF" stroke-width="5" stroke-linecap="round"/>
    <path d="M114 36 q-6 -6 0 -12" fill="none" stroke="#00F0FF" stroke-width="4" stroke-linecap="round"/>
    <path d="M60 24 l3 7 7 1 -5 5 2 7 -7 -4 -6 4 1 -7 -5 -5 7 -1z" fill="#7CFF6B" stroke="#07041A" stroke-width="2.5"/>`,-4)},
  zzz:{label:"Sleepy",svg:STK(`<text x="20" y="96" font-family="Anton,Impact,sans-serif" font-size="56" fill="#00F0FF" stroke="#07041A" stroke-width="5" paint-order="stroke">Z</text><text x="56" y="70" font-family="Anton,Impact,sans-serif" font-size="42" fill="#E07AC6" stroke="#07041A" stroke-width="5" paint-order="stroke">Z</text><text x="84" y="44" font-family="Anton,Impact,sans-serif" font-size="30" fill="#F3FF3A" stroke="#07041A" stroke-width="5" paint-order="stroke">Z</text>`,-8)},
};
function stickerEl(id){ const s=el("span","stk"); s.innerHTML=STICKERS[id].svg; s.setAttribute("role","img"); s.setAttribute("aria-label",STICKERS[id].label+" sticker"); return s; }
function paintStickers(){
  const g=$("stickerGrid"); if(g.children.length) return;
  Object.keys(STICKERS).filter(id=>(!STICKERS[id].secret||hasSecret(STICKERS[id].secret))&&(!STICKERS[id].bond||(isDm&&dmUser&&bondRankWith(dmUser)>=STICKERS[id].bond))).forEach(id=>{ const b=el("button"); b.type="button"; b.setAttribute("aria-label","Send "+STICKERS[id].label+" sticker"); b.append(stickerEl(id));
    b.onclick=async()=>{ closeTray(); try{ await sendFields({kind:"sticker",sticker:id}); }catch(err){ $("status").textContent="Sticker didn't send: "+err.message; } };
    g.append(b); });
}
function closeTray(){ show($("tray"),false); $("plusBtn").setAttribute("aria-expanded","false"); }
$("plusBtn").onclick=()=>{ const open=$("tray").classList.contains("hidden"); if(open){ paintStickers(); show($("tray")); } else show($("tray"),false); $("plusBtn").setAttribute("aria-expanded",String(open)); };
function trayTab(t){ $("traySticker").setAttribute("aria-pressed",t==="stickers"); $("trayGames").setAttribute("aria-pressed",t==="games"); $("trayGifs").setAttribute("aria-pressed",t==="gifs"); show($("stickerGrid"),t==="stickers"); show($("gameList"),t==="games"); show($("gifPane"),t==="gifs"); $("trayBacklog").setAttribute("aria-pressed",t==="backlog"); show($("trayBlPane"),t==="backlog"); }
$("traySticker").onclick=()=>trayTab("stickers");
$("trayGames").onclick=()=>{ const t=isDm&&dmUser?`Challenge ${nameOf(dmUser)}`:"Challenge the room"; document.querySelectorAll("#gameList .gp-hint").forEach(n=>n.textContent=t); trayTab("games"); };
$("gameList").querySelectorAll(".gamepick").forEach(bt=>bt.onclick=async()=>{
  closeTray(); trayTab("stickers");
  try{ const m=await api.createGame(room,bt.dataset.game); await addMessages([m]); openGame(m.id); }
  catch(err){ $("status").textContent="Couldn't start a game: "+err.message; }
});
$("trayPoll").onclick=()=>{ closeTray(); openPollSheet(); };
