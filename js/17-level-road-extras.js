/* ================= THE APP GROWS WITH YOU 🌱 =================
   New accounts start simple (chat, DMs, stickers, GIFs, photos) and features unlock as they level up.
   Anyone who joined before GROW_START keeps everything. Only STARTING a feature is locked: a friend's game,
   poll or card always works for you. Perks at higher levels are for everyone. */
const GROW_START="2026-10-17T00:00:00Z";   // accounts created after this follow the level road
const GROW_STEPS=[
  {lvl:2, ids:["trayGames","trayPoll"],                 label:"🎮 Games and 📊 Polls",            where:"the ➕ menu in any chat"},
  {lvl:2, ids:["lofiQuick","lofiBtn"],                  label:"🎧 Radio",                          where:"the 🎧 button next to your name"},
  {lvl:3, ids:["openBacklog","trayBacklog","trayCard"], label:"🎬 Media Backlog and 💌 Cards",     where:"your Profile and the ➕ menu"},
  {lvl:3, ids:["callBtn"],                              label:"📞 Calls (voice, video and group)", where:"the 📞 button at the top of a chat"},
  {lvl:4, ids:["openHabits","openQuiz","openSignal"],   label:"🎯 Habits, 🃏 Who are you? and 📡 Night Signal", where:"your Profile"},
  {lvl:5, ids:["laneNewBtn"],                           label:"🛣️ Making your own Lanes",          where:"the Lanes tab"}
];   // locks only STARTING these: answering a call, joining a group call or voice lounge, and being in a friend's Lane always work   // (your Partner egg isn't locked: it hatches from chatting, so it already grows with you)
const GROW_PERKS=[
  {lvl:6,  label:"🎤 Voice notes up to 3 minutes"},
  {lvl:10, label:"🎤 Voice notes up to 5 minutes"}
];
function maxVoiceSeconds(){ const l=myLevel(); return l>=10?300:l>=6?180:MAX_VOICE_SECONDS; }
function growNew(){ const t=Date.parse(user?.created_at||""); return isFinite(t)&&t>Date.parse(GROW_START); }
function growNeed(id){   // the level a button needs, or 0 if it's open
  if(!growNew()) return 0;
  const st=GROW_STEPS.find(s=>s.ids.includes(id));
  return st&&myLevel()<st.lvl ? st.lvl : 0;
}
function paintGrow(){
  GROW_STEPS.forEach(st=>st.ids.forEach(id=>{
    const b=$(id); if(!b) return; const need=growNeed(id);
    b.classList.toggle("growlock",!!need); b.dataset.lvl=need||"";
    if(need) b.setAttribute("aria-disabled","true"); else b.removeAttribute("aria-disabled");
  }));
  const road=$("growRoad"); if(!road) return; road.innerHTML="";
  const lvl=myLevel(), fresh=growNew();
  const row=(need,label,sub)=>{ const ok=lvl>=need||(!fresh&&sub!=="perk"); const r=el("div","growstep"+(ok?" got":""));
    r.append(el("b","","LV "+need), el("span","",label), el("i","",ok?"✓":"🔒")); return r; };
  if(!fresh) road.append(el("p","note","You were here early, so every feature is already yours. Perks still unlock as you level up."));
  GROW_STEPS.forEach(st=>road.append(row(st.lvl,st.label,"feature")));
  GROW_PERKS.forEach(pk=>road.append(row(pk.lvl,pk.label,"perk")));
  const got=GROW_PERKS.filter(pk=>lvl>=pk.lvl).length+(fresh?GROW_STEPS.filter(st=>lvl>=st.lvl).length:GROW_STEPS.length);
  $("growSummary").textContent=`🛣️ Level road: ${got}/${GROW_STEPS.length+GROW_PERKS.length}`;
}
// a locked button explains itself instead of opening (capture phase runs before the button's own click)
document.addEventListener("click",e=>{
  const b=e.target.closest?.(".growlock"); if(!b) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const st=GROW_STEPS.find(s=>s.ids.includes(b.id));
  const L=xpLevel(xpData().xp);
  $("status").textContent=`🔒 Level ${b.dataset.lvl} unlocks ${st?st.label:"this"}. You're level ${L.lvl}: keep chatting!`;
  growToast("🔒 Unlocks at level "+b.dataset.lvl, `You're level ${L.lvl} · ${L.need-L.rem} XP to the next level`);
},true);
function growToast(title,text){
  const t=el("div","toast mention"); const body=el("span","tbody"); body.append(el("div","ttitle",title), el("div","ttext",text));
  const ic=el("span","sx-lock"); ic.append(pxIcon("goldkey",32,"")); t.append(ic,body);
  $("toasts").prepend(t); setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },6000);
}
function growCelebrate(from,to){   // called after a level-up: say what just opened
  paintGrow();
  const news=[];
  if(growNew()) GROW_STEPS.filter(st=>st.lvl>from&&st.lvl<=to).forEach(st=>news.push([`🔓 New: ${st.label}`,`Find it in ${st.where}.`]));
  GROW_PERKS.filter(pk=>pk.lvl>from&&pk.lvl<=to).forEach(pk=>news.push(["⭐ New perk",pk.label]));
  news.forEach(([a,b],i)=>setTimeout(()=>growToast(a,b),i*1400));
}

/* ================= NIGHT SIGNAL 📡 ================= */
const NS_QUESTIONS=[
  {text:"be the first to talk in a new group chat", signal:"spark"},
  {text:"tell a friend a hard truth they need to hear", signal:"spark"},
  {text:"say what everyone’s thinking but won’t say", signal:"spark"},
  {text:"jump in before you know the rules", signal:"spark"},
  {text:"ask “what were you about to say?” after someone gets cut off", signal:"glow"},
  {text:"text a quiet friend “you good?”", signal:"glow"},
  {text:"help a friend even when you’re exhausted", signal:"glow"},
  {text:"hype a friend’s post right away", signal:"glow"},
  {text:"laugh it off when a server gets your order wrong", signal:"drift"},
  {text:"shrug when plans get canceled", signal:"drift"},
  {text:"let a small argument go instead of winning it", signal:"drift"},
  {text:"take a long walk with no destination", signal:"drift"},
  {text:"say yes to a 2 a.m. food run", signal:"static"},
  {text:"send a meme at the worst moment", signal:"static"},
  {text:"change plans just for fun", signal:"static"},
  {text:"start a bit that goes too far", signal:"static"},
  {text:"talk about friends the same way when they’re not around", signal:"beacon"},
  {text:"answer a 3 a.m. call even when you’re asleep", signal:"beacon"},
  {text:"remember the small stuff people tell you", signal:"beacon"},
  {text:"keep the same friends for years", signal:"beacon"},
  {text:"change your mind after a good argument", signal:"shade"},
  {text:"replay a conversation hours later to see what you could have said", signal:"shade"},
  {text:"write things you'd never say out loud", signal:"shade"},
  {text:"lie awake thinking about the universe and your place in it", signal:"shade"},
  {text:"own a mistake and fix it before anyone asks", signal:"pulse"},
  {text:"set a boundary with a friend even when it’s hard", signal:"pulse"},
  {text:"redo something until it's perfect", signal:"pulse"},
  {text:"grind a game until you 100% it", signal:"pulse"},
];
const NS_AFTER_HOURS="What is stopping you from being you?";
const NS_SCALE=["Not likely","Probably not","Maybe","Probably","Very likely"];
const NS_INFO={
  spark: {name:"SPARK", color:"#ff4d4d", blurb:"Bold. You jump in first and figure it out on the way."},
  glow:  {name:"GLOW",  color:"#ffb347", blurb:"Warm. You light up the room and check on everyone."},
  drift: {name:"DRIFT", color:"#00e5ff", blurb:"Chill. Patient, easygoing and hard to rattle."},
  static:{name:"STATIC",color:"#f3ff3a", blurb:"Chaotic fun. The plot twist and the 2 a.m. idea."},
  beacon:{name:"BEACON",color:"#4d7cff", blurb:"Loyal. The light your friends always find their way back to."},
  shade: {name:"SHADE", color:"#b86bff", blurb:"Deep. A quiet thinker with layers."},
  pulse: {name:"PULSE", color:"#4dff88", blurb:"Driven. Once you start, you finish."}
};
let nsIndex=0;      // which question we're on (0 = the first one)
let nsAnswers=[];   // the score for each answer, 0 to 4

function nsPaint(){
  const q=NS_QUESTIONS[nsIndex];
  $("nsCount").textContent=`Question ${nsIndex+1} of ${NS_QUESTIONS.length}`;
  show($("nsProg")); show($("nsEnds"));
  show($("nsGlyph"),false); $("nsExtra").innerHTML=""; $("nsSheet").classList.remove("nsres");   // back to question mode
  const prog=$("nsProg"); prog.innerHTML="";
  NS_QUESTIONS.forEach((_,i)=>{
    const seg=el("span");
    if( nsAnswers[i] !== undefined ) seg.className="on";
    prog.append(seg);
  });
  $("nsAsk").textContent="How likely are you to…"; $("nsAsk").style.color="";   // undo the result-screen look on a retake
  $("nsText").textContent=q.text;
  const box=$("nsScale"); box.innerHTML="";
  box.style.flexDirection="";
  NS_SCALE.forEach((label,score)=>{
    const picked=nsAnswers[nsIndex]===score;
    const b=el("button","nssq"+(picked?" on":"")); b.type="button"; b.setAttribute("role","radio");
    b.setAttribute("aria-label",label); b.setAttribute("aria-checked",String(picked));
    b.style.width=b.style.height= `${20 + score * 10}px`;
    b.onclick=()=>{ nsAnswers[nsIndex]=score; nsPaint(); };   // just picks it: change your mind as much as you like
    box.append(b);
  });
  // your pick in words + the Back / Next buttons
  const a=nsAnswers[nsIndex];
  $("nsPicked").textContent=a===undefined?"":NS_SCALE[a];
  show($("nsNav")); show($("nsPicked"));
  $("nsBack").disabled=nsIndex===0;
  $("nsNext").disabled=a===undefined;
  $("nsNext").textContent=nsIndex===NS_QUESTIONS.length-1?"SEE MY SIGNAL ▶":"NEXT ▶";
}
$("nsNext").onclick=()=>{ if(nsAnswers[nsIndex]!==undefined) nsPick(nsAnswers[nsIndex]); };
$("nsBack").onclick=()=>{ if(nsIndex>0){ nsIndex--; nsPaint(); } };
function nsPick(score){
  nsAnswers[nsIndex]=score;   // remember this answer
  nsIndex++;                  // move to the next question
  if( nsIndex < NS_QUESTIONS.length ) nsPaint();
  else nsFinish();            // all 28 answered
}
function nsOpen(){
  nsIndex=0; nsAnswers=[];    // start fresh
  nsPaint();
  show($("nsSheet"));
}
$("nsClose").onclick=()=>show($("nsSheet"),false);

function nsFinish(){
  const scores={spark:0,glow:0,drift:0,static:0,beacon:0,shade:0,pulse:0};
  NS_QUESTIONS.forEach((q,i)=>{
    scores[q.signal]+=nsAnswers[i];
  });
  let top="spark";
  for(const s in scores){
    if( scores[s] > scores[top] ) top=s;
  }
  nsShowResult(scores, top);
  nsSave(scores, top);
}
function nsShowResult(scores, top){
  show($("nsProg"),false); show($("nsEnds"),false); show($("nsNav"),false); show($("nsPicked"),false);
  $("nsSheet").classList.add("nsres");
  const info=NS_INFO[top];
  $("nsCount").textContent="Your Night Signal";
  $("nsAsk").textContent=`You’re a ${info.name}.`;
  $("nsAsk").style.color=info.color;
  $("nsText").textContent=info.blurb;
  const box=$("nsScale"); box.innerHTML="";
  box.style.flexDirection="column";
  for(const s in scores){
    const row=el("div","nsbar");
    const fill=el("span","nsfill");
    fill.style.width=`${(scores[s] / 16) * 100}%`;
    fill.style.background=NS_INFO[s].color;
    row.append(el("b","",NS_INFO[s].name), fill);
    box.append(row);
  }
  nsResultExtras(top);
}

/* a friend's Night Signal on their profile card (the database only answers for friends who added you) */
function nsFillTile(c,top){   // the 📡 Signal tile, used on friends' cards and your own profile
  const info=NS_INFO[top]; c.innerHTML=""; c.classList.remove("open");
  c.style.setProperty("--c",info.color);
  c.append(el("span","ma-eyebrow","📡 Signal"), nsGlyph(top,3), el("span","ps-name",info.name), el("span","ps-blurb",info.blurb), el("span","ma-more","Meaning ›"));
  c.setAttribute("aria-label",`Night Signal: ${info.name}. Tap to read what it means.`);
  c.setAttribute("aria-expanded","false");
  c.onclick=()=>{ const on=!c.classList.contains("open"); c.classList.toggle("open",on); c.setAttribute("aria-expanded",String(on)); };
  show(c,true);
}
async function paintPersonSignal(uid){
  const tok=personPaintTok, c=$("personSignal"); show(c,false); c.innerHTML="";
  let top=null; try{ top=await api.signalOf(uid); }catch(e){}
  if(personUid!==uid||tok!==personPaintTok||!top||!NS_INFO[top]) return;
  nsFillTile(c,top);
}
async function paintMySignal(){
  const c=$("mySignal"); if(!c) return;
  let m=null; try{ m=await api.mySignal(); }catch(e){}
  if(m&&NS_INFO[m.top]) nsFillTile(c,m.top); else { show(c,false); c.innerHTML=""; }
}
/* ---- Night Signal: finishing touches (pixel icon, saving, After Hours, retake) ---- */
const NS_GLYPHS={   // 9×9 pixel art from the concept board: # = lit pixel
  spark:  ["....##...","...##....","..##.....",".#######.","....##...","...##....","..##.....",".##......","........."],
  glow:   [".##...##.","#..#.#..#","#...#...#","#.......#",".#.....#.","..#...#..","...#.#...","....#....","........."],
  drift:  [".........","..##.....",".#..#..#.","#....##..",".........","..##.....",".#..#..#.","#....##..","........."],
  static: [".#.....#.","..#...#..","#########","#.#..#..#","#..#...##","##...#..#","#..##.#.#","#########",".#.....#."],
  beacon: ["#...#...#",".#.###.#.","...#.#...","...###...","...#.#...","..##.##..","..#####..",".##...##.","#########"],
  shade:  ["...###...","..##.....",".##......",".##......",".##......",".##......","..##.....","...###...","........."],
  pulse:  [".........","....#....","...##....","...#.#...","####.#.##","......##.","......#..",".........","........."]
};
function nsGlyph(kind,px){   // two copies of the icon: a blurred one behind that breathes, and a crisp one on top
  const color=NS_INFO[kind].color, wrap=el("div","nsglyph");
  wrap.style.setProperty("--px",px+"px"); wrap.style.setProperty("--c",color);
  wrap.style.setProperty("--delay",Object.keys(NS_INFO).indexOf(kind)*0.48+"s");
  ["halo","core"].forEach(layer=>{
    const g=el("div","ng-"+layer);
    NS_GLYPHS[kind].join("").split("").forEach(ch=>{ const c=el("i"); if(ch==="#") c.className="on"; g.append(c); });
    wrap.append(g);
  });
  return wrap;
}
function nsResultExtras(top){
  const g=$("nsGlyph"); g.innerHTML=""; g.append(nsGlyph(top,8)); show(g);
  const box=$("nsExtra"); box.innerHTML="";
  const ah=el("div","nsah");
  ah.append(el("div","nsah-k","🌙 AFTER HOURS"), el("p","nsah-q",NS_AFTER_HOURS));
  const ta=document.createElement("textarea"); ta.className="field"; ta.maxLength=500; ta.rows=3;
  ta.placeholder="Type as much or as little as you want. Or skip it."; ta.setAttribute("aria-label",NS_AFTER_HOURS);
  const note=el("div","nsah-note","🔒 Only you can see this. It's never shown to friends.");
  const save=el("button","blbtn add","Save my answer"); save.type="button";
  save.onclick=async()=>{
    save.disabled=true; save.textContent="Saving…";
    try{ await api.saveAfterHours(ta.value.trim()); save.textContent=ta.value.trim()?"Saved 🌙":"Cleared"; }
    catch(e){ save.textContent="Couldn't save. Try again"; note.textContent=nsSetupHint(e); }
    setTimeout(()=>{ save.disabled=false; if(/Saved|Cleared/.test(save.textContent)) save.textContent="Save my answer"; },1800);
  };
  ah.append(ta,note,save); box.append(ah);
  api.afterHours().then(a=>{ if(a&&!ta.value) ta.value=a; }).catch(()=>{});
  const again=el("button","blbtn","↻ Retake the quiz"); again.type="button"; again.onclick=nsOpen;
  box.append(again);
}
function nsSetupHint(e){
  const m=String(e?.message||e);
  return /night_signal|relation|does not exist|schema cache/i.test(m) ? "Night Signal needs a quick setup: run night-signal.sql in Supabase." : m;
}
async function nsSave(scores,top){
  try{ await api.saveSignal(scores,top); paintMySignal(); paintQuizTab(); }
  catch(e){ $("nsExtra").prepend(el("p","note bad","Your result didn't save: "+nsSetupHint(e))); }
}
async function nsStart(){   // from Profile: show your saved result, or start the quiz if you haven't taken it
  show($("profile"),false);
  let mine=null; try{ mine=await api.mySignal(); }catch(e){}
  if(mine&&mine.scores&&NS_INFO[mine.top]){ nsIndex=0; nsAnswers=[]; show($("nsSheet")); nsShowResult(mine.scores,mine.top); }
  else nsOpen();
}
$("openSignal").onclick=nsStart;


/* ================= MEDIA BACKLOG 🎮📺 =================
   Cole's Media Backlog (the React class app), rebuilt inside NightLane: games + anime, statuses, +1 progress,
   star ratings, stats, filters, RAWG/Kitsu search. Saved to your account; friends you've added can view it,
   and any item can be shared into a chat as a card that friends can add to their own list. */
const RAWG_KEY="bdc93c6f8ede4fb2b7427360172996ae";   // same key as the Media Backlog site
const BL_STATUS={planned:"Planned","in-progress":"In Progress",completed:"Completed"};
let blOwner=null, blItems=[], myBl=null, blTab="library", blFilters={q:"",type:"all",status:"all",sort:"default"}, blResults={game:null,anime:null,tv:null,movie:null,book:null,manga:null}, blQuery={game:"",anime:"",tv:"",movie:"",book:"",manga:""};
const blMine=()=>blOwner===user?.id;
const isBlCard=m=>m?.card&&typeof m.card==="object"&&m.card.kind==="backlog"&&typeof m.card.title==="string";
const blKey=it=>it.source_id||("title:"+String(it.title||"").toLowerCase()+"|"+it.type);
function blFriendlyError(err){
  const m=String(err?.message||err);
  if(/duplicate key|no_dupes/i.test(m)) return "That's already on your backlog.";
  if(/'?private'? column|column .*private/i.test(m)) return "Private items need a quick setup: run backlog-private.sql in Supabase.";
  if(/backlog_items_type_check|violates check constraint/i.test(m)) return "Books and manga need a quick setup: run backlog-books.sql in Supabase.";
  if(/relation|does not exist|schema cache|backlog_items/i.test(m)) return "The backlog isn't set up yet: run media-backlog.sql in Supabase.";
  return m;
}
async function loadMyBacklog(){ try{ myBl=await api.backlog(user.id); }catch(e){ myBl=myBl||[]; } return myBl; }

async function openBacklog(uid){
  if(!user) return;
  blOwner=uid||user.id; blTab="library"; blFilters={q:"",type:"all",status:"all",sort:"default"}; say("blMsg","");
  $("blTitle").textContent=blMine()?"Media Backlog":`${cache.get(blOwner)?.username||"Friend"}'s Backlog`;
  show($("blTabs"),blMine()); $("blBody").innerHTML='<p class="note">Loading…</p>'; show($("backlogSheet"));
  try{ blItems=await api.backlog(blOwner); if(blMine()) myBl=blItems; else await loadMyBacklog(); blCoverSoon(3000); }
  catch(err){ blItems=[]; $("blBody").innerHTML=""; $("blBody").append(el("p","msgline bad",blFriendlyError(err))); return; }
  paintBacklog();
}
function paintBacklog(){
  $("blTabs").querySelectorAll("button").forEach(b=>b.setAttribute("aria-checked",String(b.dataset.tab===blTab)));
  $("backlogSheet").classList.toggle("blwide",blTab==="library"&&blView()==="grid");
  if(blTab==="library") paintBlLibrary(); else if(blTab==="import") paintBlImport(); else paintBlSearch(blTab);
}
$("blTabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{ blTab=b.dataset.tab; say("blMsg",""); closeBlPeek(); paintBacklog(); });

/* ---------- library ---------- */
function paintBlLibrary(){
  const box=$("blBody"); box.innerHTML="";
  const anime=blItems.filter(i=>i.type==="anime"||i.type==="tv"), games=blItems.filter(i=>i.type==="game");
  const stats=[[blItems.length,"Total"],[blItems.filter(i=>i.status==="in-progress").length,"Active"],[blItems.filter(i=>i.status==="completed").length,"Done"],
               [anime.reduce((n,i)=>n+(+i.progress||0),0),"Eps"],[games.reduce((n,i)=>n+(+i.progress||0),0),"Hours"]];
  const st=el("div","blstats"); stats.forEach(([n,l])=>{ const d=el("div","blstat"); d.append(el("b","",String(n)),el("span","",l)); st.append(d); }); box.append(st);
  if(!blItems.length){
    box.append(el("p","note",blMine()?"Your backlog is empty. Tap a + tab to find something to add, or 📥 Import your Letterboxd, Goodreads or IMDb list.":"Nothing to show. A backlog only shows to people its owner has added as a friend."));
    if(blMine()) box.append(blManualForm());
    return;
  }
  const fb=el("div","blfilters");
  const q=el("input","field"); q.placeholder="Search this backlog…"; q.value=blFilters.q; q.setAttribute("aria-label","Search this backlog");
  q.oninput=()=>{ blFilters.q=q.value; paintBlList(); };
  const mk=(key,opts,label)=>{ const s=document.createElement("select"); s.className="blsel"; s.setAttribute("aria-label",label); opts.forEach(([v,t])=>s.append(new Option(t,v))); s.value=blFilters[key]; s.onchange=()=>{ blFilters[key]=s.value; paintBlList(); }; return s; };
  fb.append(q, mk("type",[["all","All"],["game","Games"],["anime","Anime"],["tv","TV"],["movie","Movies"],["book","Books"],["manga","Manga"]],"Type"),
    mk("status",[["all","Status"],["planned","Planned"],["in-progress","In Progress"],["completed","Completed"]],"Status"),
    mk("sort",[["default","Newest"],["title","A–Z"],["rating","Top rated"],["progress","Most progress"]],"Sort"));
  const vr=el("div","blviewrow"), cnt=el("span","blcount"), vt=el("div","blview"); vt.setAttribute("role","group"); vt.setAttribute("aria-label","View");
  [["list","☰ List"],["grid","▦ Grid"]].forEach(([v,t])=>{ const b=el("button","",t); b.type="button"; b.dataset.v=v; b.setAttribute("aria-pressed",String(blView()===v)); b.onclick=()=>{ setBlView(v); vt.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.v===v))); $("backlogSheet").classList.toggle("blwide",v==="grid"); paintBlList(); }; vt.append(b); });
  vr.append(cnt,vt);
  box.append(fb, vr, el("div","bllist"));
  paintBlList();
  if(blMine()) box.append(blManualForm());
}
function paintBlList(){
  const list=$("blBody").querySelector(".bllist"); if(!list) return; list.innerHTML="";
  const f=blFilters, q=f.q.trim().toLowerCase();
  let items=blItems.filter(i=>(!q||i.title.toLowerCase().includes(q))&&(f.type==="all"||i.type===f.type)&&(f.status==="all"||i.status===f.status));
  if(f.sort==="title") items=[...items].sort((a,b)=>a.title.localeCompare(b.title));
  if(f.sort==="rating") items=[...items].sort((a,b)=>b.rating-a.rating);
  if(f.sort==="progress") items=[...items].sort((a,b)=>b.progress-a.progress);
  const cnt=$("blBody").querySelector(".blcount"); if(cnt) cnt.textContent=items.length===blItems.length?`${items.length} item${items.length===1?"":"s"}`:`${items.length} of ${blItems.length}`;
  const grid=blView()==="grid"; list.classList.toggle("blgrid",grid);
  if(!items.length){ list.append(el("p","note","No items match your filters.")); return; }
  items.forEach(it=>list.append(grid?blTile(it):blCard(it)));
  if(blPeekItem&&!$("blPeek").classList.contains("hidden")) paintBlPeek();
}
function blStars(rating,onRate){
  if(!onRate){ const r=el("div","blstars ro","★".repeat(rating)+"☆".repeat(5-rating)); r.setAttribute("role","img"); r.setAttribute("aria-label",rating?`Rated ${rating} out of 5`:"Not rated"); return r; }
  const row=el("div","blstars");
  for(let s=1;s<=5;s++){ const b=el("button","blstar"+(s<=rating?" on":""),s<=rating?"★":"☆"); b.type="button"; b.setAttribute("aria-label",`Rate ${s} out of 5`);
    if(onRate) b.onclick=()=>onRate(s===rating?0:s); else b.disabled=true; row.append(b); }
  return row;
}
const blProgressText=it=>{
  if(it.type==="anime"||it.type==="tv") return `Episode ${it.progress} / ${it.total??"?"}`;
  if(it.type==="book") return `Page ${it.progress} / ${it.total??"?"}`;
  if(it.type==="manga") return `Chapter ${it.progress} / ${it.total??"?"}`;
    if(it.type==="movie") return it.status==="completed" ? "Watched" : "Not watched yet";
  return `${it.progress} hrs played`;
};
function blCover(it){ const u=safeImg(it.image); if(!u) return null; const i=document.createElement("img"); i.src=u; i.alt=""; i.loading="lazy"; i.className=it.type==="game"?"blcover":"blposter"; i.onerror=()=>i.remove(); return i; }
function blCard(it){
  const c=el("article","blcard"+(it.status==="completed"?" done":""));
  const cov=blCover(it); if(cov) c.append(cov);
  const mid=el("div","blmid"), top=el("div","bltop");
top.append(el("span","bltype "+it.type, blIcon(it.type) + " " + BL_TYPE_LABEL[it.type].toUpperCase() )); if(it.platform) top.append(el("span","blplat",it.platform));
  let prog;
  if(it.type!=="movie" && blMine()){ prog=el("button","blprog bledit",blProgressText(it)+" ✎"); prog.type="button"; prog.setAttribute("aria-label",`Change progress for ${it.title}`); prog.onclick=()=>openProgressEditor(it,c); }
  else prog=el("div","blprog",blProgressText(it));
  mid.append(top, el("div","blname",it.title), prog, blStars(it.rating,blMine()?(r=>blUpdate(it,{rating:r})):null));
  if(blMine()){
    const row=el("div","blactions");
    const sel=document.createElement("select"); sel.className="blsel"; sel.setAttribute("aria-label","Status for "+it.title);
    Object.entries(BL_STATUS).forEach(([v,t])=>sel.append(new Option(t,v))); sel.value=it.status; sel.onchange=()=>blUpdate(it,{status:sel.value});
    let plus;
if(it.type==="movie"){
  plus=el("button","blbtn",it.status==="completed"?"Mark as not watched":"Mark as watched"); plus.type="button";
  plus.onclick=()=>blUpdate(it,{status:it.status==="completed"?"planned":"completed"});
} else {
  plus=el("button","blbtn","+1"); plus.type="button"; plus.disabled=!!(it.total&&it.progress>=it.total); plus.setAttribute("aria-label",(blCounted(it.type)?"Add one "+BL_COUNTED[it.type]+" to ":"Add an hour to ")+it.title); plus.onclick=()=>blPlusOne(it);
}
    const share=el("button","blbtn","Share"); share.type="button"; share.onclick=()=>openBlShare(it);
    const pic=el("button","blbtn blpic","🖼️"); pic.type="button"; pic.title=it.image?"Change the picture":"Add your own picture"; pic.setAttribute("aria-label",(it.image?"Change the picture for ":"Add a picture for ")+it.title); pic.onclick=()=>blChangePoster(it);
    const lock=el("button","blbtn bllock"+(it.private?" on":""), it.private ? "🔒 Private" : "🔓" );   // private = filled pink with a word, so it can't be mistaken for the open lock
    lock.type="button";
    lock.setAttribute("aria-label", (it.private ? "Show to friends: " : "Hide from friends: ") + it.title);
    lock.onclick=()=>blUpdate(it,{ private: !it.private});
    const del=el("button","blbtn bldel","✕"); del.type="button"; del.setAttribute("aria-label","Remove "+it.title); del.onclick=()=>blDelete(it);
    row.append(sel,plus,share,pic,lock,del); mid.append(row);
  } else {
    mid.append(el("div","blstatus "+it.status,BL_STATUS[it.status]||it.status));
    if(!(myBl||[]).some(x=>blKey(x)===blKey(it))) mid.append(blAddToMineButton(it));   // you both have it: no button needed
  }
  c.append(mid); return c;
}
function blAddToMineButton(src){
  const have=(myBl||[]).some(x=>blKey(x)===blKey(src));
  const b=el("button","blbtn"+(have?"":" add"),have?"On your backlog ✓":"+ Add to my backlog"); b.type="button"; b.disabled=have;
  b.onclick=async e=>{ e.stopPropagation(); b.disabled=true; b.textContent="Adding…";
    try{ await blAdd({type:src.type,title:src.title,image:src.image,platform:src.platform,total:src.total,source_id:src.source_id}); b.textContent="On your backlog ✓"; b.classList.remove("add"); }
    catch(err){ b.textContent=blFriendlyError(err).startsWith("That's already")?"On your backlog ✓":"Try again"; b.disabled=b.textContent!=="Try again"; } };
  return b;
}

/* ---------- editing (instant on screen, saved in the background) ---------- */
async function blUpdate(it,patch){
  const before={...it}; Object.assign(it,patch); paintBlList(); paintBlStatsOnly();
  try{ await api.updateBacklog(it.id,patch); if(patch.status==="completed"&&before.status!=="completed") blCompleted(it); }
  catch(err){ Object.assign(it,before); paintBlList(); paintBlStatsOnly(); say("blMsg","Didn't save: "+blFriendlyError(err),true); }
}
function paintBlStatsOnly(){ if(blTab!=="library") return; const st=$("blBody").querySelector(".blstats"); if(!st) return;   // update just the numbers
  const anime=blItems.filter(i=>i.type==="anime"||i.type==="tv"), games=blItems.filter(i=>i.type==="game");
  const nums=[blItems.length,blItems.filter(i=>i.status==="in-progress").length,blItems.filter(i=>i.status==="completed").length,anime.reduce((n,i)=>n+(+i.progress||0),0),games.reduce((n,i)=>n+(+i.progress||0),0)];
  st.querySelectorAll("b").forEach((b,i)=>b.textContent=String(nums[i])); }
function blProgressPatch(it,progress,total){
  total=total===undefined?it.total:total;
  progress=Math.max(0,Math.min(Math.round(progress)||0, total||100000));
  const patch={progress};
  if(total!==it.total) patch.total=total;
  if(progress>0&&it.status==="planned") patch.status="in-progress";
  if(total&&progress>=total) patch.status="completed";
  else if(it.status==="completed"&&total&&progress<total) patch.status="in-progress";   // rewound a finished show
  return patch;
}
function blPlusOne(it){
  if(it.total&&it.progress>=it.total) return;
  blUpdate(it,blProgressPatch(it,it.progress+1));
}
/* Tap the progress line: − / + / type a number / +1 +5 +10 / set total episodes. Saves once on Done. */
function openProgressEditor(it,card){
  card.querySelector(".blpedit")?.remove();
  const anime=blCounted(it.type), unit=BL_COUNTED[it.type]||"hour";
  let prog=+it.progress||0, total=it.total||null;
  const box=el("div","blpedit"); box.setAttribute("role","group"); box.setAttribute("aria-label",`Progress for ${it.title}`);
  const minus=el("button","blbtn","−"), plus=el("button","blbtn","+"); minus.type=plus.type="button";
  minus.setAttribute("aria-label",`One less ${unit}`); plus.setAttribute("aria-label",`One more ${unit}`);
  const num=el("input","field blpnum"); num.type="number"; num.inputMode="numeric"; num.min="0"; num.value=prog; num.setAttribute("aria-label",anime?(blReads(it.type)?unit[0].toUpperCase()+unit.slice(1)+"s read":"Episodes watched"):"Hours played");
  const row=el("div","blprow"); row.append(minus,num);
  let tot=null;
  if(anime){ row.append(el("span","blpof","of")); tot=el("input","field blpnum"); tot.type="number"; tot.inputMode="numeric"; tot.min="1"; tot.placeholder="?"; tot.value=total||""; tot.setAttribute("aria-label","Total "+unit+"s"); row.append(tot); }
  else row.append(el("span","blpof","hrs"));
  row.append(plus);
  const quick=el("div","blprow blquick");
  (it.type==="book"?[10,25,50]:[1,5,10]).forEach(n=>{ const q=el("button","blbtn",`+${n}${anime?"":"h"}`); q.type="button"; q.setAttribute("aria-label",`Add ${n} ${unit}${n>1?"s":""}`); q.onclick=()=>set(prog+n); quick.append(q); });
  const done=el("button","blbtn add","Done"); done.type="button"; quick.append(done);
  const cap=()=>{ const t=tot&&+tot.value>0?Math.round(+tot.value):(anime?null:null); return t; };
  function set(v){ const t=anime?cap():null; prog=Math.max(0,Math.min(Math.round(+v)||0,t||100000)); num.value=prog; minus.disabled=prog<=0; plus.disabled=!!(t&&prog>=t); }
  minus.onclick=()=>set(prog-1); plus.onclick=()=>set(prog+1);
  num.oninput=()=>{ prog=Math.max(0,Math.round(+num.value)||0); };
  num.onblur=()=>set(num.value); if(tot) tot.onchange=()=>set(prog);
  const save=()=>{ set(num.value); const t=anime?cap():it.total; box.remove(); const patch=blProgressPatch(it,prog,t); if(patch.progress!==it.progress||patch.total!==undefined||patch.status) blUpdate(it,patch); else paintBlList(); };
  done.onclick=save;
  box.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); save(); } if(e.key==="Escape"){ box.remove(); } });
  box.append(row,quick); set(prog);
  card.querySelector(".blmid").append(box);
  setTimeout(()=>{ num.focus(); num.select(); },50);
}
function blCompleted(it){
  gainXP("backlogdone");
  const t=el("button","toast mention"); t.type="button"; const body=el("span","tbody");
  body.append(el("div","ttitle",it.type==="game" ? "🎮 Game complete!" : blIcon(it.type)+(blReads(it.type)?" Finished reading!":" Finished watching!")), el("div","ttext",`${it.title} · tap to share it`));
  t.append(el("span","sx-lock","🏆"),body); t.onclick=()=>{ t.remove(); openBlShare(it); };
  $("toasts").prepend(t); setTimeout(()=>{ if(t.isConnected){ t.classList.add("out"); setTimeout(()=>t.remove(),260); } },6000);
  if(fxEnabled()) FX.play("confetti");
}
async function blDelete(it){
  if(!await nlAlert({ kind:"warn", title:"Remove from backlog", badge:"WARNING", text:`Remove ${it.title} from your backlog?`, status:"AWAITING INPUT", buttons:[{label:"REMOVE", value:true},{label:"CANCEL", value:false}] })) return;
  if(blPeekItem===it) closeBlPeek();
  const i=blItems.indexOf(it); blItems.splice(i,1); paintBlLibrary();
  try{ await api.deleteBacklog(it.id); }catch(err){ blItems.splice(i,0,it); paintBlLibrary(); say("blMsg","Couldn't remove it: "+blFriendlyError(err),true); }
}
async function blAdd(fields){
  if(fields.type==="tv"&&!fields.total&&/^tvmaze:\d+$/.test(fields.source_id||"")){
    try{ const r=await fetch(`https://api.tvmaze.com/shows/${fields.source_id.slice(7)}/episodes`); if(r.ok) fields={...fields,total:(await r.json()).length||null}; }catch(e){}   // no count? you can still set it later
  }
  const clean={type: BL_TYPE_LABEL[fields.type] ? fields.type : "game", title:String(fields.title||"").trim().slice(0,120),
    image:safeImg(fields.image)&&String(fields.image).startsWith("https://")?String(fields.image).slice(0,500):null,
    platform:fields.platform?String(fields.platform).slice(0,40):null,
    total:Number.isInteger(+fields.total)&&+fields.total>0?+fields.total:null,
    source_id:fields.source_id?String(fields.source_id).slice(0,40):null, status:"planned"};
  if(!clean.title) throw new Error("Give it a title first.");
  if(!clean.source_id&&(myBl||[]).some(x=>blKey(x)===blKey(clean))) throw new Error("duplicate key");
  const row=await api.addBacklog(clean);
  (myBl ||= []); if(!myBl.includes(row)) myBl.unshift(row);
  if(blMine()&&!blItems.includes(row)&&blItems!==myBl) blItems.unshift(row);
  gainXP("backlog");
  return row;
}

/* ---------- manual add (for things the search can't find) ---------- */
/* your own poster/cover picture: pick a photo, it's shrunk and uploaded, and the link is saved on the backlog item
   (so when you share it, friends see the same picture) */
function blPickImage(){
  return new Promise(res=>{ const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.onchange=()=>res(inp.files[0]||null); inp.click(); });
}
async function blUploadPoster(file){
  if(!file) return null;
  if(!/^image\//.test(file.type||"")) throw new Error("Pick a picture file.");
  if(file.size>15e6) throw new Error("That picture is over 15 MB. Pick a smaller one.");
  const blob=await shrink(file,600,false);
  return await api.upload("avatars",user.id,blob);
}
async function blChangePoster(it){
  const f=await blPickImage(); if(!f) return;
  say("blMsg","Uploading poster…");
  try{ const url=await blUploadPoster(f); await blUpdate(it,{image:url}); say("blMsg","Poster saved 🖼️"); }
  catch(err){ say("blMsg","Couldn't add the poster: "+err.message,true); }
}
function blManualForm(){
  const d=el("details","blmanual"); d.append(el("summary","","+ Add one manually"));
  const t=el("input","field"); t.placeholder="Title"; t.maxLength=120; t.setAttribute("aria-label","Title");
  const type=document.createElement("select"); type.className="blsel"; type.setAttribute("aria-label","Type"); type.append(new Option("Game","game"),new Option("Anime","anime"),new Option("TV","tv"),new Option("Movie","movie"),new Option("Book","book"),new Option("Manga","manga"));
  const plat=el("input","field"); plat.placeholder="Platform"; plat.maxLength=40; plat.setAttribute("aria-label","Platform");
  const tot=el("input","field"); tot.type="number"; tot.min="1"; tot.placeholder="Episodes"; tot.setAttribute("aria-label","Total episodes");
  type.onchange=()=>{ tot.style.visibility=blCounted(type.value)?"visible":"hidden"; tot.placeholder=({book:"Pages",manga:"Chapters"})[type.value]||"Episodes"; plat.placeholder=type.value==="book"?"Author":"Platform"; tot.setAttribute("aria-label","Total "+(BL_COUNTED[type.value]||"episode")+"s"); }; tot.style.visibility="hidden";
  let posterFile=null;
  const pRow=el("div","blposterpick"), pBtn=el("button","blbtn","🖼️ Add a poster (optional)"), pPrev=el("span","blposterprev");
  pBtn.type="button";
  pBtn.onclick=async()=>{ const f=await blPickImage(); if(!f) return; posterFile=f; pPrev.innerHTML=""; const im=document.createElement("img"); im.alt="Poster preview"; im.src=URL.createObjectURL(f); pPrev.append(im); pBtn.textContent="🖼️ Change poster"; };
  pRow.append(pBtn,pPrev);
  const go=el("button","blbtn add","Add"); go.type="button";
  go.onclick=async()=>{ go.disabled=true; try{ if(!t.value.trim()) throw new Error("Give it a title first."); let image=null; if(posterFile){ say("blMsg","Uploading poster…"); image=await blUploadPoster(posterFile); }
      await blAdd({title:t.value,type:type.value,platform:plat.value,total:blCounted(type.value)?tot.value:null,image}); t.value=""; plat.value=""; tot.value=""; posterFile=null; pPrev.innerHTML=""; pBtn.textContent="🖼️ Add a poster (optional)"; say("blMsg","Added!"); paintBlLibrary(); }catch(err){ say("blMsg",blFriendlyError(err),true); } go.disabled=false; };
  const r=el("div","row2"); r.append(type,plat,tot);
  d.append(t,r,pRow,go); return d;
}

/* ---------- search (RAWG for games, Kitsu for anime, TVmaze for TV). Movies are added by hand, with your own poster. ---------- */
const BL_SEARCH_TEXT={
  game:{ph:"Search games…", help:"Find a game to add. Covers and platforms come from RAWG."},
  anime:{ph:"Search anime…", help:"Find an anime to add. Posters and episode counts come from Kitsu."},
  tv:{ph:"Search TV shows…", help:"Find a TV show to add. Posters and episode counts come from TVmaze."},
  movie:{ph:"", help:""},
  book:{ph:"Search books or authors…", help:"Find a book to add. Covers and page counts come from Open Library."},
  manga:{ph:"Search manga…", help:"Find a manga to add. Covers and chapter counts come from Kitsu."}
};
function paintBlSearch(type){
  const box=$("blBody"); box.innerHTML="";
  if(type==="movie"){
    box.append(el("p","note","Add a movie, and give it your own poster if you like. When you share it, your poster goes with it."));
    const f=blManualForm(); f.open=true; const sel=f.querySelector("select"); if(sel){ sel.value="movie"; sel.onchange?.(); } box.append(f);
    return;
  }
  const form=document.createElement("form"); form.className="blsearch";
  const q=el("input","field"); q.placeholder=BL_SEARCH_TEXT[type].ph; q.value=blQuery[type]; q.setAttribute("aria-label",q.placeholder);
  const go=el("button","blbtn add","Search"); go.type="submit";
  form.append(q,go); form.onsubmit=e=>{ e.preventDefault(); blRunSearch(type,q.value); };
  const res=el("div","bllist blresults"); box.append(form,res);
  if(blResults[type]) paintBlResults(type); else res.append(el("p","note",BL_SEARCH_TEXT[type].help));
  setTimeout(()=>q.focus(),60);
}
async function blRunSearch(type,query){
  query=String(query||"").trim(); blQuery[type]=query;
  const res=$("blBody").querySelector(".blresults"); if(!res) return;
  const what={game:"a game",anime:"an anime",tv:"a TV show",movie:"a movie",book:"a book",manga:"a manga"}[type]||"a title";
  if(!query){ say("blMsg",`Type ${what} name to search.`,true); return; }
  say("blMsg",""); res.innerHTML='<p class="note">Searching…</p>';
  try{
    if(type==="game"){
      const r=await fetch(`https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(query)}&page_size=12`); if(!r.ok) throw new Error(r.status);
      blResults.game=((await r.json()).results||[]).map(g=>({type:"game",title:g.name,image:g.background_image||null,platform:g.platforms?.[0]?.platform?.name||null,total:null,source_id:"rawg:"+g.id,meta:[g.released?.slice(0,4),(g.platforms||[]).slice(0,3).map(p=>p.platform.name).join(", ")].filter(Boolean).join(" · ")}));
    } else if(type==="tv"){
      const r=await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`); if(!r.ok) throw new Error(r.status);
      blResults.tv=(await r.json()).slice(0,12).map(x=>{ const s=x.show||{}, net=s.network?.name||s.webChannel?.name||null; return {
        type:"tv", title:s.name||"Untitled", image:s.image?.medium||null, platform:net, total:null, source_id:"tvmaze:"+s.id,
        meta:[s.premiered?.slice(0,4), net, s.status==="Running"?"still airing":null].filter(Boolean).join(" · ") }; });
    } else if(type==="book"){
      const r=await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,cover_i,first_publish_year,number_of_pages_median`); if(!r.ok) throw new Error(r.status);
      blResults.book=((await r.json()).docs||[]).map(b=>({type:"book",title:b.title||"Untitled",image:b.cover_i?`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`:null,
        platform:(b.author_name||[])[0]||null,total:b.number_of_pages_median||null,source_id:"ol:"+String(b.key||"").split("/").pop(),
        meta:[(b.author_name||[])[0],b.first_publish_year,b.number_of_pages_median?b.number_of_pages_median+" pages":null].filter(Boolean).join(" · ")}));
    } else if(type==="manga"){
      const r=await fetch(`https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(query)}&page[limit]=12`); if(!r.ok) throw new Error(r.status);
      blResults.manga=((await r.json()).data||[]).map(a=>{ const x=a.attributes||{}; return {type:"manga",title:x.titles?.en||x.canonicalTitle||"Untitled",image:x.posterImage?.small||null,platform:x.subtype&&x.subtype!=="manga"?x.subtype[0].toUpperCase()+x.subtype.slice(1):"Manga",total:x.chapterCount||null,source_id:"kitsu-m:"+a.id,meta:[x.startDate?.slice(0,4),x.chapterCount?x.chapterCount+" ch":null,x.volumeCount?x.volumeCount+" vol":null,x.status==="current"?"ongoing":null].filter(Boolean).join(" · ")}; });
    } else {
      const r=await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=12`); if(!r.ok) throw new Error(r.status);
      blResults.anime=((await r.json()).data||[]).map(a=>{ const x=a.attributes||{}; return {type:"anime",title:x.titles?.en||x.canonicalTitle||"Untitled",image:x.posterImage?.small||null,platform:"Streaming",total:x.episodeCount||null,source_id:"kitsu:"+a.id,meta:[x.startDate?.slice(0,4),x.episodeCount?x.episodeCount+" eps":null,x.subtype?.toUpperCase()].filter(Boolean).join(" · ")}; });
    }
    if(blQuery[type]===query&&blTab===type) paintBlResults(type);
  }catch(err){ res.innerHTML=""; res.append(el("p","msgline bad",`Couldn't find ${what} right now. Wait a few seconds and try again.`)); }
}
function paintBlResults(type){
  const res=$("blBody").querySelector(".blresults"); if(!res) return; res.innerHTML="";
  const list=blResults[type]||[];
  if(!list.length){ res.append(el("p","note","No results. Try a different spelling.")); return; }
  list.forEach(item=>{
    const row=el("div","blresult"); const cov=blCover(item); if(cov) row.append(cov);
    const mid=el("div","blmid"); mid.append(el("div","blname",item.title)); if(item.meta) mid.append(el("div","blprog",item.meta));
    row.append(mid,blAddToMineButton(item)); res.append(row);
  });
}

/* ================= NIGHTLANE PARTNERS 🥚 =================
   Everyone raises a little pixel partner. The SERVER feeds it from how you chat (partners.sql), so it can't be cheated:
   ⚡ Power: shiny messages, games and moves · 💗 Heart: replies and reactions · ✨ Spirit: photos, voice, video, stickers ·
   🌙 Shadow: late-night messages. Egg → Baby → Rookie (path = what you fed it most) → Champion → Ultimate.
   Shiny messages are also collected in the Shinydex. This file only draws things and shows the evolution scenes. */
const PX_PAL={"k": "#07041A", "w": "#F4F7FF", "c": "#00F0FF", "y": "#F3FF3A", "o": "#FF8A1F", "p": "#FF6FB5", "b": "#6FA8FF", "d": "#3D5BD9", "m": "#B48CFF", "v": "#6A3FB5", "r": "#FF2E3F", "g": "#2EE66B", "s": "#9AA3C7", "h": "#FFD86B"};
const PX_SHINY={"y": "#FFD86B", "o": "#FFF6C8", "c": "#FF6FB5", "v": "#2EE66B", "m": "#FFD86B", "b": "#FFB3D9", "d": "#FF8A1F", "r": "#00F0FF", "p": "#00F0FF", "g": "#FF6FB5"};
const PX_SPRITES={"egg":["......kkkk......","....kkwwwwkk....","...kwwwwwwwwk...","..kwwcwwwwcwwk..","..kwccwwwwccwk..",".kwwwwwwwwwwwwk.",".kwwwwwwwwwwwwk.",".kwcwwwwwwwwcwk.",".kwccwwwwwwccwk.",".kwwwwwwwwwwwwk.",".kwwwwwwwwwwwwk.","..kwwwwwwwwwwk..","..kwwwwwwwwwwk..","...kkwwwwwwkk...",".....kkkkkk.....","................"],"pixi":["................","................",".......kk.......","......kyyk......",".......kk.......","....kkkkkkkk....","..kkmmmmmmmmkk..",".kmmmmmmmmmmmmk.",".kmmwkmmmmkwmmk.",".kmmkkmmmmkkmmk.","kmppmmmkkmmmppmk","kmmmmmmmmmmmmmmk",".kmmmmmmmmmmmmk.","..kkmmmmmmmmkk..","...kk.kkkk.kk...","................"],"voltkit":["................","..y..........y..","..yy........yy..","..kyk......kyk..",".kbbk.kkkk.kbbk.",".kbbbkbbbbkbbbk.","kbbbbbbbbbbbbbbk","kbbwkbbbbbbkwbby","kbbkkbbbbbbkkbyk","kbbbbbbbbbbbbyyk",".kbbbbbkkbbbbbyk","..kbbbbbbbbbbk.y",".kbbbwwwwwwbbbk.",".kbbbwwwwwwbbbk.","..kbk.kkkk.kbk..","..kk..kkkk..kk.."],"chirpi":[".......kk.......","......kppk......",".......kk.......","....kkkkkkkk....","...kbbbbbbbbk...","..kbbbbbbbbbbk..",".kbbwkbbbbkwbbk.",".kbbkkbbbbkkbbk.","kbbbbbboobbbbbbk","kdbbbbboobbbbbdk","kddbbbbbbbbbbddk","kddbwwwwwwwwbddk",".kbbwwwwwwwwbbk.","..kbbwwwwwwbbk..","...kkko..okkk...",".....o....o....."],"gloomp":["................","k..............k","kk............kk","kvk..........kvk","kvvkkkkkkkkkkvvk","kvvvvvvvvvvvvvvk",".kvvvvvvvvvvvvk.",".kvywkvvvvkwyvk.",".kvyykvvvvkyyvk.","kkvvvvvvvvvvvvkk","kvkvvvvkkvvvvkvk","kvvkvvwvvwvvkvvk",".kvvvvvvvvvvvvk.","..kkvvvvvvvvkk..","....kkvkkvkk....","......k..k......"],"thundrake":[".w............w.",".wk..........kw.","..wkkkkkkkkkkw..","..kooooooooook..",".kooooooooooook.",".koowkooookwook.","kkookkooookkookk","kdkooooooooookdk","kddkooooooookddk","kdddkyyyyyykdddk","kdddkyyyyyykdddk",".kddkyyyyyykddk.","..kkoyyyyyyokk..","..kooooooooook..","..kok.kkkk.kok..","..kk..kkkk..kk.."],"lyrabird":["..p....kk....p..","...p..kppk..p...","....pkpkkpkp....","....kkkkkkkk....","...kcccccccck...","..kcccccccccck..","..kcwkcccckwck..","..kckkcccckkck..",".kcccccyyccccck.","kpkccccyycccckpk","kppkcccccccckppk","kpppkwwwwwwkpppk","kpppkwwwwwwkpppk",".kppkcwwwwckppk.","..kk.kcccck.kk..",".....kk..kk....."],"nocturo":[".k............k.",".kk..........kk.",".kvk........kvk.",".kvvkkkkkkkkvvk.",".kvvvvvvvvvvvvk.","kvvvvvvvvvvvvvvk","kvrrrrrrrrrrrrvk","kvrywkrrrrkwyrvk","kvrykkrrrrkkyrvk","kvvvvvvvvvvvvvvk","kvvvvvykkyvvvvvk","kdvvvvvvvvvvvvdk","kddvvvwwwwvvvddk","kddvvvwwwwvvvddk",".kkvvkvvvvkvvkk.","..kk.kk..kk.kk.."],"stormwyrm":["w..w........w..w","wk.wk......kw.kw",".wkkwkkkkkkwkkw.","..kddddddddddk..",".kddddddddddddk.",".kddckddddkcddk.","kkddkkddddkkddkk","kykddddddddddkyk","kyykddddddddkyyk","kyyykwwwwwwkyyyk","kyyykwwwwwwkyyyk","kykyykwwwwkyykyk",".k.kdwwwwwwdk.k.","..kddddddddddk..","..kdk.kkkk.kdk..","..kk..kkkk..kk.."],"seraphon":[".....yyyyyy.....","....y......y....",".p...kkkkkk...p.","pwp.kcccccck.pwp","pwwkcccccccckwwp","pwkcwkcccckwckwp",".pkckkcccckkckp.","pwkccccyycccckwp","pwkccccyycccckwp","pwwkcccccccckwwp",".pwkkwwwwwwkkwp.","pwwpkwwwwwwkpwwp","pwwpkcwwwwckpwwp",".ppkkcccccckkpp.","...k.kcccck.k...","....kk....kk...."],"eclipsar":["y..............y","yy............yy",".yk..........ky.",".kvkkkkkkkkkkvk.","kvvvvvvvvvvvvvvk","kvrrrrrrrrrrrrvk","kvrywkrrrrkwyrvk","kvrykkrrrrkkyrvk","kvvvvvvvvvvvvvvk","kvvvvvykkyvvvvvk","rkvvvvvvvvvvvvkr","rrkvvvwwwwvvvkrr","rrrkvvwwwwvvkrrr","rrrkvvwwwwvvkrrr",".rrkvvkvvkvvkrr.","..kk.kk..kk.kk.."],"snapling":["..k..........k..","..kg........gk..","...k..kkkk..k...","....kkggggkk....","...kggggggggk...","..kggggggggggk..",".kggwkggggkwggk.",".kggkkggggkkggk.","kcckggggggggkcck","kccckggkkggkccck","kcccckggggkcccck",".kcccckggkcccck.","..kkkyyyyyykkk..","....kyyyyyyk....",".....kyyyyk.....","......kkkk......"],"mothlume":[".y............y.","..y..........y..","...yk.kkkk.ky...",".kk.kkwwwwkk.kk.","kgcgkwwwwwwkgcgk","kgggkwwwwwwkgggk","kgcgkwkwwkwkgcgk","kggggkkwwkkggggk","kgcggkwwwwkggcgk","kggggkwwwwkggggk",".kggkwwwwwwkggk.","kgcggkwwwwkggcgk","kgggggkwwkgggggk",".kgcgkkwwkkgcgk.","..kkk.kkkk.kkk..","................"],"aurorath":["......yyyy......",".....y....y.....","..kk.ykkkky.kk..",".kpk.kwwwwk.kpk.","kppckwwwwwwkcppk","kpcckwkwwkwkccpk","kccgkwkwwkwkgcck","kcggkwwwwwwkggck","kggckwwwwwwkcggk","kgcpkwwwwwwkpcgk","kcppkwywwywkppck",".kpppkwwwwkpppk.","..kppkwwwwkppk..","...kkkwwwwkkk...",".....kkkkkk.....","................"]};

const PARTNER_STAGES=["Egg","Baby","Rookie","Champion","Ultimate"];
const PARTNER_AT=[0,15,120,600,2000];
const PARTNER_PATHS={power:{icon:"⚡",label:"Power",line:["voltkit","thundrake","stormwyrm"],color:"#F3FF3A"},
  heart:{icon:"💗",label:"Heart",line:["chirpi","lyrabird","seraphon"],color:"#FF6FB5"},
  spirit:{icon:"✨",label:"Spirit",line:["snapling","mothlume","aurorath"],color:"#2EE66B"},
  shadow:{icon:"🌙",label:"Shadow",line:["gloomp","nocturo","eclipsar"],color:"#B48CFF"}};
const PARTNER_NAMES={egg:"Data Egg",pixi:"Pixi",voltkit:"Sparkit",chirpi:"Chirpi",snapling:"Snapling",gloomp:"Gloomp",
  thundrake:"Thundrake",lyrabird:"Lyrabird",mothlume:"Mothlume",nocturo:"Nocturo",stormwyrm:"Stormwyrm",seraphon:"Seraphon",aurorath:"Aurorath",eclipsar:"Eclipsar"};
const SHINY_KINDS=[["gold","🟡","Gold"],["prism","🌈","Prism"],["glitch","👾","Glitch"],["holo","💠","Holo"]];
const shinyKindOf=m=>{ const n=hashMsg(m,"shinytype")%100; return n<50?"gold":n<80?"prism":n<95?"glitch":"holo"; };   // same math as the server
function partnerSpecies(p){
  const st=Math.max(0,Math.min(4,+p?.stage||0));
  if(st===0) return "egg"; if(st===1) return "pixi";
  return (PARTNER_PATHS[p.path]||PARTNER_PATHS.heart).line[st-2];
}
const partnerName=p=>(p?.nickname&&String(p.nickname).trim())||PARTNER_NAMES[partnerSpecies(p)];
const pxCache=new Map();
function pxSpriteUrl(id,shiny,mode){   // mode: undefined | "shadow" (dark silhouette for not-yet-seen forms)
  const k=id+(shiny?"*":"")+(mode||""); if(pxCache.has(k)) return pxCache.get(k);
  const rows=PX_SPRITES[id]; if(!rows) return "";
  const cv=document.createElement("canvas"); cv.width=cv.height=16; const g=cv.getContext("2d");
  rows.forEach((row,y)=>[...row].forEach((ch,x)=>{ if(ch===".") return;
    g.fillStyle=mode==="shadow"?(ch==="k"?"#07041A":"#2a1b5a"):((shiny&&PX_SHINY[ch])||PX_PAL[ch]); g.fillRect(x,y,1,1); }));
  const url=cv.toDataURL(); pxCache.set(k,url); return url;
}
function pxImg(id,shiny,cls,mode){ const i=document.createElement("img"); i.className="pxsprite"+(cls?" "+cls:""); i.alt=""; i.src=pxSpriteUrl(id,shiny,mode); i.draggable=false; return i; }

let myPartner=null, partnerView=null, partnerShinies=null;
async function loadPartner(uid){ try{ return await api.partner(uid); }catch(e){ return null; } }
function partnerNext(p){ const st=+p?.stage||0; return st>=4?null:PARTNER_AT[st+1]; }

/* ---------- the Partner sheet ---------- */
async function openPartner(uid){
  uid=uid||user.id; const mine=uid===user.id;
  show($("profile"),false); show($("personSheet"),false);
  partnerView={uid,mine,p:mine&&myPartner?myPartner:null}; partnerShinies=null;
  paintPartner(); show($("partnerSheet"));
  const [p,sh]=await Promise.all([loadPartner(uid),api.shinies(uid).catch(()=>[])]);
  if(partnerView?.uid!==uid) return;
  partnerView.p=p||{stage:0,total:0,power:0,heart:0,spirit:0,shadow:0}; partnerShinies=sh||[];
  if(mine&&p){ myPartner=p; partnerSeenCheck(p); }
  paintPartner();
}
function paintPartner(){
  const v=partnerView; if(!v) return;
  const p=v.p, who=v.mine?"Your":`${cache.get(v.uid)?.username||"Their"}'s`;
  $("ptTitle").textContent=v.mine?"🥚 Your Partner":`🥚 ${cache.get(v.uid)?.username||"Friend"}'s Partner`;
  const stage=$("ptStage"); stage.innerHTML="";
  if(!p){ stage.append(el("p","note","Loading…")); return; }
  const sp=partnerSpecies(p), st=+p.stage||0;
  const plate=el("div","pt-plate"+(p.shiny?" shiny":"")+(st===0?" egg":"")); plate.append(pxImg(sp,p.shiny,"pt-big")); stage.append(plate);
  const name=el("div","pt-name"); name.append(el("b","",partnerName(p)));
  if(p.shiny) name.append(el("span","pt-shinytag","✦ SHINY"));
  stage.append(name);
  const path=PARTNER_PATHS[p.path];
  stage.append(el("div","pt-sub",[PARTNER_STAGES[st], p.nickname?PARTNER_NAMES[sp]:null, path?`${path.icon} ${path.label} path`:null].filter(Boolean).join(" · ")));
  if(v.mine){ const rn=el("button","linkbtn",p.nickname?"✏️ Rename":"✏️ Give it a name"); rn.type="button"; rn.onclick=renamePartner; stage.append(rn); }
  // progress to the next stage
  const nx=partnerNext(p), box=el("div","pt-prog");
  if(nx){ const from=PARTNER_AT[st], pct=Math.max(0,Math.min(100,Math.round(100*((+p.total||0)-from)/(nx-from))));
    const bar=el("div","pt-bar"), fill=el("i"); fill.style.width=pct+"%"; bar.append(fill);
    box.append(el("div","pt-proglabel",st===0?`Hatching… ${Math.max(0,nx-(+p.total||0))} more data`:`${Math.max(0,nx-(+p.total||0))} more data to evolve`),bar); }
  else box.append(el("div","pt-proglabel","🏆 Fully evolved. Legendary."));
  stage.append(box);
  // stats
  const stats=el("div","pt-stats"), top=Math.max(1,+p.power||0,+p.heart||0,+p.spirit||0,+p.shadow||0);
  Object.entries(PARTNER_PATHS).forEach(([k,d])=>{ const n=+p[k]||0, row=el("div","pt-stat");
    const bar=el("span","pt-sbar"), f=el("i"); f.style.width=Math.round(100*n/top)+"%"; f.style.background=d.color; bar.append(f);
    row.append(el("span","pt-slab",`${d.icon} ${d.label}`),bar,el("span","pt-snum",String(n))); stats.append(row); });
  stage.append(stats);
  // evolution line: forms it hasn't reached yet stay as dark silhouettes
  const line=el("div","pt-line"); line.setAttribute("aria-label","Evolution line");
  const forms=["egg","pixi",...(path?path.line:[null,null,null])];
  forms.forEach((f,i)=>{ const c=el("span","pt-form"+(i===st?" now":""));
    if(!f) c.append(el("span","pt-q","?")); else c.append(pxImg(f,p.shiny&&i<=st,"pt-mini",i>st?"shadow":undefined));
    c.title=i<=st&&f?PARTNER_NAMES[f]:"???"; line.append(c); if(i<4) line.append(el("span","pt-arrow","›")); });
  if(!path&&st<2) line.append(el("div","pt-hint","Its path is picked when it becomes a Rookie, by whatever you fed it most."));
  stage.append(line);
  // Shinydex
  const dex=el("div","pt-dex"), counts={}; (partnerShinies||[]).forEach(s=>counts[s.kind]=(counts[s.kind]||0)+1);
  dex.append(el("h3","",`💎 Shinydex · ${(partnerShinies||[]).length}`));
  const grid=el("div","pt-dexgrid");
  SHINY_KINDS.forEach(([k,ic,lab])=>{ const n=counts[k]||0, t=el("div","pt-dexcell"+(n?"":" locked"));
    t.append(el("span","pt-dexic",n?ic:"❔"),el("span","pt-dexlab",n?lab:"???"),el("span","pt-dexn","×"+n)); grid.append(t); });
  dex.append(grid);
  dex.append(el("p","note",partnerShinies===null?"Loading…":v.mine?"About 1 in 500 messages you send is shiny ✨. Each one is collected here, feeds ⚡ Power, and makes a shiny partner more likely when your next egg hatches.":"Shiny messages they've found."));
  stage.append(dex);
  if(v.mine){ const how=el("details","pt-how"); how.append(el("summary","","How do I raise it?"));
    const ul=el("ul"); ["Every message you send feeds it a little.","⚡ Power: shiny messages, starting games, and every game move.","💗 Heart: replying to messages and reacting to them.","✨ Spirit: photos, voice notes, videos, stickers and files.","🌙 Shadow: chatting late at night (10 PM to 5 AM).","It can eat up to 250 data a day, so chatting every day beats spamming."].forEach(t=>ul.append(el("li","",t)));
    how.append(ul); stage.append(how); }
}
async function renamePartner(){
  const cur=myPartner?.nickname||"";
  const n=await nlPrompt({ title:"Name your partner", badge:"PARTNER", text:"Up to 16 letters. Leave it empty to use its species name.", value:cur, maxLength:16, ok:"NAME IT" }); if(n===null) return;
  try{ const saved=await api.setPartnerName(n); myPartner={...(myPartner||{}),nickname:saved}; if(partnerView?.mine) partnerView.p={...partnerView.p,nickname:saved}; paintPartner(); paintPartnerButton(); }
  catch(err){ toast("Couldn't rename it",err.message); }
}
$("ptClose").onclick=()=>{ show($("partnerSheet"),false); partnerView=null; };
$("openPartner").onclick=()=>openPartner(user.id);
function paintPartnerButton(){
  const b=$("openPartner"); if(!b) return; b.innerHTML="";
  const p=myPartner; b.append(pxImg(partnerSpecies(p||{stage:0}),!!p?.shiny,"pt-btnimg"),document.createTextNode(p?` ${partnerName(p)} · ${PARTNER_STAGES[+p.stage||0]}`:" My Partner"));
}
/* friends' partners on their profile card */
async function paintPersonPartner(uid){
  const tok=personPaintTok, b=$("personPartner"); show(b,false); b.innerHTML="";
  const p=await loadPartner(uid); if(personUid!==uid||tok!==personPaintTok||!p) return;
  b.append(pxImg(partnerSpecies(p),!!p.shiny,"pt-btnimg"),document.createTextNode(` ${partnerName(p)} · ${PARTNER_STAGES[+p.stage||0]}${p.shiny?" ✦":""}`));
  b.onclick=()=>openPartner(uid); show(b,true);
}

/* ---------- hatching and evolving: the server changes it, this phone notices and plays the scene ---------- */
const ptSeenKey=()=>"nl-partner-seen-"+(user?.id||"");
function partnerSeenCheck(p){
  if(!p) return; const now=`${+p.stage||0}|${p.path||""}|${p.shiny?1:0}`;
  let seen=null; try{ seen=LS.get(ptSeenKey()); }catch(e){}
  try{ LS.set(ptSeenKey(),now); }catch(e){}
  const was=seen?+seen.split("|")[0]:0;
  if((+p.stage||0)>was){
    const before=seen?{stage:was,path:seen.split("|")[1]||null,shiny:seen.split("|")[2]==="1"}:{stage:Math.max(0,(+p.stage||0)-1),path:p.path,shiny:p.shiny};
    if(!seen&&(+p.stage||0)>1) before.stage=+p.stage-1;
    playEvolution(before,p);
  }
}
let ptCheckTimer=null, ptLastCheck=0;
function partnerSoon(ms=5000){ clearTimeout(ptCheckTimer); ptCheckTimer=setTimeout(refreshMyPartner,ms); }
async function refreshMyPartner(){
  if(!user) return; ptLastCheck=Date.now();
  const p=await loadPartner(user.id); if(!p) return;
  myPartner=p; paintPartnerButton(); partnerSeenCheck(p);
}
document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&user&&Date.now()-ptLastCheck>60000) partnerSoon(3000); });
function playEvolution(before,after){
  const sc=$("evoScene"); if(!sc) return;
  const from=partnerSpecies(before), to=partnerSpecies(after), hatch=(+before.stage||0)===0;
  const a=pxImg(from,!!before.shiny,"evo-a"), b=pxImg(to,!!after.shiny,"evo-b");
  const stage=$("evoStage"); stage.innerHTML=""; stage.append(a,b);
  $("evoTitle").textContent=hatch?"Your egg is hatching…":`${PARTNER_NAMES[from]} is evolving…`;
  $("evoText").textContent="";
  sc.classList.remove("done"); show(sc,true);
  const motion=fxEnabled()&&!reducedMotion();
  if(motion) setTimeout(()=>pxfx("warp",{at:stage,scale:4}),1700);
  setTimeout(()=>{ if(!$("evoTitle")||!$("evoText")) return; sc.classList.add("done"); if(motion){ pxfx("sparkle",{at:stage,scale:6}); if(after.shiny) pxfx("shine",{at:stage,scale:4,loops:3}); }
    $("evoTitle").textContent=hatch?`It hatched into ${PARTNER_NAMES[to]}!`:`${PARTNER_NAMES[from]} evolved into ${PARTNER_NAMES[to]}!`;
    const path=PARTNER_PATHS[after.path];
    $("evoText").textContent=(after.shiny&&hatch?"✦ It's a SHINY! ✦ ":"")+(path&&(+after.stage||0)===2?`${path.icon} It took the ${path.label} path.`:`${PARTNER_STAGES[+after.stage||0]} stage reached.`);
    if(motion) FX.play("confetti"); if(navigator.vibrate) navigator.vibrate([30,60,30,60,120]); sfx?.("notify"); },motion?2600:200);
}
$("evoScene").onclick=()=>{ if($("evoScene").classList.contains("done")) show($("evoScene"),false); };
$("evoClose").onclick=e=>{ e.stopPropagation(); show($("evoScene"),false); };

/* ---------- grid view: a poster wall. Tap a cover to open its full card. ---------- */
function blView(){ try{ return LS.get("nl-bl-view")==="grid"?"grid":"list"; }catch(e){ return "list"; } }
function setBlView(v){ try{ LS.set("nl-bl-view",v); }catch(e){} }
let blPeekItem=null;
function blTile(it){
  const b=el("button","bltile"+(it.status==="completed"?" done":"")); b.type="button";
  b.setAttribute("aria-label",`${it.title}, ${BL_TYPE_LABEL[it.type]||""}, ${BL_STATUS[it.status]||""}${it.rating?`, ${it.rating} stars`:""}`);
  const ph=el("span","bt-ph"); ph.append(el("b","",blIcon(it.type)), el("span","",it.title)); b.append(ph);
  const u=safeImg(it.image); if(u){ const i=document.createElement("img"); i.src=u; i.alt=""; i.loading="lazy"; i.onerror=()=>i.remove(); b.append(i); }
  const badge=it.status==="completed"?"✓":it.status==="in-progress"?(blCounted(it.type)&&it.total?Math.round(100*(+it.progress||0)/it.total)+"%":"▶"):"";
  if(badge) b.append(el("span","bt-badge",badge));
  if(it.private) b.append(el("span","bt-lock","🔒"));
  if(it.rating) b.append(el("span","bt-stars","★".repeat(it.rating)));
  b.onclick=()=>openBlPeek(it);
  return b;
}
function openBlPeek(it){ blPeekItem=it; paintBlPeek(); show($("blPeek")); }
function paintBlPeek(){
  const box=$("blPeekBody");
  if(!blPeekItem||!blItems.includes(blPeekItem)){ closeBlPeek(); return; }
  if(box.querySelector(".blpedit")) return;   // don't wipe the progress editor while it's open
  box.innerHTML=""; box.append(blCard(blPeekItem));
}
function closeBlPeek(){ blPeekItem=null; show($("blPeek"),false); }
$("blPeekClose").onclick=closeBlPeek;

/* ---------- 📥 import from Letterboxd, Goodreads or IMDb (their CSV exports) ---------- */
function parseCsv(text){
  text=String(text||"").replace(/^﻿/,""); const rows=[]; let row=[], f="", q=false;
  for(let i=0;i<text.length;i++){ const c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){ f+='"'; i++; } else q=false; } else f+=c; }
    else if(c==='"') q=true;
    else if(c===","){ row.push(f); f=""; }
    else if(c==="\n"||c==="\r"){ if(c==="\r"&&text[i+1]==="\n") i++; row.push(f); f=""; if(row.some(x=>x!=="")) rows.push(row); row=[]; }
    else f+=c; }
  row.push(f); if(row.some(x=>x!=="")) rows.push(row);
  if(!rows.length) return [];
  const head=rows[0].map(h=>h.trim());
  return rows.slice(1).map(r=>Object.fromEntries(head.map((h,i)=>[h,(r[i]??"").trim()])));
}
/* turns a CSV export into backlog items: {type,title,status,rating,progress,total,platform,image,source_id} */
function blFromCsv(rows,fileName){
  const h=rows.length?Object.keys(rows[0]):[], has=k=>h.includes(k), wl=/watchlist|to.?read/i.test(fileName||"");
  const stars=(v,max)=>{ const n=parseFloat(v); return n>0?Math.max(1,Math.min(5,Math.round(n*5/max))):0; };
  if(has("Letterboxd URI")&&has("Name")){
    return {source:"Letterboxd",items:rows.map(r=>({type:"movie",title:r.Name,status:wl?"planned":"completed",rating:has("Rating")?stars(r.Rating,5):0,progress:0,total:null,
      platform:/^\d{4}$/.test(r.Year||"")?r.Year:null,image:null,source_id:"lb:"+(String(r["Letterboxd URI"]).split("/").filter(Boolean).pop()||r.Name).slice(0,30)}))};
  }
  if(has("Book Id")&&has("Title")&&(has("Exclusive Shelf")||has("My Rating"))){
    return {source:"Goodreads",items:rows.map(r=>{ const shelf=(r["Exclusive Shelf"]||"").toLowerCase(), pages=parseInt(r["Number of Pages"])||null;
      const status=shelf==="read"?"completed":shelf==="currently-reading"?"in-progress":"planned";
      const isbn=(r.ISBN13||r.ISBN||"").replace(/[^0-9X]/gi,"");
      return {type:"book",title:r.Title,status,rating:stars(r["My Rating"],5),progress:status==="completed"&&pages?pages:0,total:pages,platform:r.Author||null,
        image:isbn.length>=10?`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`:null,source_id:"gr:"+r["Book Id"]}; })};
  }
  if(has("Const")&&has("Title")&&has("Title Type")){
    const map={movie:"movie",tvMovie:"movie",short:"movie",video:"movie",tvSpecial:"movie",tvSeries:"tv",tvMiniSeries:"tv",videoGame:"game"};
    return {source:"IMDb",items:rows.filter(r=>map[r["Title Type"]]).map(r=>{ const type=map[r["Title Type"]];
      const status=!wl&&r["Your Rating"]?"completed":"planned";
      return {type,title:r.Title,status,rating:stars(r["Your Rating"],10),progress:0,total:null,platform:type==="movie"&&/^\d{4}$/.test(r.Year||"")?r.Year:null,image:null,source_id:"imdb:"+r.Const}; })};
  }
  return {source:null,items:[]};
}
let blImport=null;   // {source, file, fresh:[...], dupes, done, running}
function paintBlImport(){
  const box=$("blBody"); box.innerHTML="";
  const w=el("div","blimport");
  w.append(el("p","note","Bring your lists over in one go. Export a CSV from the site, then pick it here:"));
  const ol=el("ol");
  [["🎬 Letterboxd","Settings → Data → Export your data. Use watched.csv, ratings.csv or watchlist.csv."],
   ["📚 Goodreads","My Books → Import and export → Export library."],
   ["🎞️ IMDb","Your ratings or your watchlist → ⋯ → Export."]].forEach(([a,b])=>{ const li=el("li"); li.append(el("b","",a+": "),document.createTextNode(b)); ol.append(li); });
  w.append(ol);
  const inp=document.createElement("input"); inp.type="file"; inp.accept=".csv,text/csv"; inp.className="sr"; inp.id="blCsv"; inp.tabIndex=-1;
  const pick=el("button","blbtn add","📂 Choose a CSV file"); pick.type="button"; pick.onclick=()=>inp.click();
  inp.onchange=async()=>{ const f=inp.files?.[0]; inp.value=""; if(f) await blReadCsv(f); };
  w.append(inp,pick);
  if(blImport) w.append(blImportSummary());
  box.append(w);
}
async function blReadCsv(f){
  if(f.size>8e6){ say("blMsg","That file is over 8 MB. Is it the right export?",true); return; }
  try{
    const {source,items}=blFromCsv(parseCsv(await f.text()),f.name);
    if(!source){ blImport=null; say("blMsg","That doesn't look like a Letterboxd, Goodreads or IMDb export.",true); paintBlImport(); return; }
    await loadMyBacklog();
    const have=new Set((myBl||[]).map(blKey)), haveTitle=new Set((myBl||[]).map(x=>x.type+"|"+String(x.title).toLowerCase().trim()));
    const seen=new Set(), fresh=[]; let dupes=0;
    items.forEach(it=>{ it.title=String(it.title||"").trim().slice(0,120); if(!it.title) return;
      const tk=it.type+"|"+it.title.toLowerCase();
      if(have.has(blKey(it))||haveTitle.has(tk)||seen.has(it.source_id)||seen.has(tk)){ dupes++; return; }
      seen.add(it.source_id); seen.add(tk); fresh.push(it); });
    blImport={source,file:f.name,fresh:fresh.slice(0,2000),dupes,done:0,running:false};
    say("blMsg",""); paintBlImport();
  }catch(err){ say("blMsg","Couldn't read that file: "+err.message,true); }
}
function blImportSummary(){
  const im=blImport, s=el("div","blsum");
  const by={}; im.fresh.forEach(i=>by[i.type]=(by[i.type]||0)+1);
  const kinds=Object.entries(by).map(([t,n])=>`${n} ${({tv:"TV show",manga:"manga"})[t]||BL_TYPE_LABEL[t].toLowerCase()}${n===1||t==="manga"?"":"s"}`).join(", ");
  const head=el("div"); head.append(el("b","",im.source), document.createTextNode(` · ${im.file}`)); s.append(head);
  if(im.fresh.length&&im.done>=im.fresh.length){ s.append(el("div","",`✓ Added ${im.done}! Covers fill in over the next few minutes while NightLane is open.`)); return s; }
  s.append(el("div","",im.fresh.length?`Ready to add ${kinds}.`:"Everything in this file is already on your backlog."));
  if(im.dupes) s.append(el("div","note",`${im.dupes} skipped (already on your backlog or listed twice).`));
  if(im.fresh.length){
    const go=el("button","blbtn add",im.running?`Adding… ${im.done} / ${im.fresh.length}`:im.done?`Continue (${im.done} / ${im.fresh.length} added)`:`Add ${im.fresh.length} to my backlog`);
    go.type="button"; go.disabled=!!im.running; go.onclick=()=>blRunImport(); s.append(go);
  }
  return s;
}
async function blRunImport(){
  const im=blImport; if(!im||im.running) return; im.running=true; paintBlImport();
  const clean=it=>({type:it.type,title:it.title,status:BL_STATUS[it.status]?it.status:"planned",rating:Math.max(0,Math.min(5,Math.round(+it.rating)||0)),
    progress:Math.max(0,Math.round(+it.progress)||0),total:Number.isInteger(+it.total)&&+it.total>0?+it.total:null,
    platform:it.platform?String(it.platform).slice(0,40):null,image:safeImg(it.image)&&String(it.image).startsWith("https://")?String(it.image).slice(0,500):null,
    source_id:String(it.source_id||"").slice(0,40)||null});
  const isDupe=e=>/duplicate|no_dupes/i.test(String(e?.message||e));
  try{
    for(let i=im.done;i<im.fresh.length;i+=50){
      const chunk=im.fresh.slice(i,i+50).map(clean); let rows;
      try{ rows=await api.addBacklogMany(chunk); }
      catch(err){ if(!isDupe(err)) throw err; rows=[]; for(const one of chunk){ try{ rows.push(await api.addBacklog(one)); }catch(e){ if(!isDupe(e)) throw e; } } }
      (myBl ||= []); rows.forEach(r=>{ if(!myBl.includes(r)) myBl.unshift(r); if(blMine()&&blItems!==myBl&&!blItems.includes(r)) blItems.unshift(r); });
      im.done=Math.min(im.fresh.length,i+50); if(blTab==="import") paintBlImport();
    }
    gainXP("backlog"); say("blMsg",`📥 Imported ${im.done} from ${im.source}!`); if(fxEnabled()) FX.play("confetti");
    blCoverSoon(2000);
  }catch(err){ say("blMsg","Import stopped: "+blFriendlyError(err)+" Tap Continue to pick up where it left off.",true); }
  finally{ im.running=false; if(blTab==="import") paintBlImport(); }
}
/* covers for imported items: looked up one at a time in the background (these sites limit how fast you can ask) */
let blCoverTimer=null, blCoverBusy=false;
function blCoverTried(){ try{ return new Set(JSON.parse(LS.get("nl-bl-cover-tried")||"[]")); }catch(e){ return new Set(); } }
function blCoverSoon(ms=4000){ clearTimeout(blCoverTimer); blCoverTimer=setTimeout(blCoverStep,ms); }
async function blCoverStep(){
  if(!user||blCoverBusy||document.hidden||!myBl) return;
  const tried=blCoverTried();
  const it=myBl.find(x=>!x.image&&/^(lb|imdb|gr):/.test(x.source_id||"")&&!tried.has(String(x.id)));
  if(!it) return;
  blCoverBusy=true; let gap=3500;
  const fetchT=u=>Promise.race([fetch(u),new Promise((_,r)=>setTimeout(()=>r(new Error("timeout")),8000))]);
  try{
    let img=null, total=null;
    if(it.type==="tv"){
      gap=800; const r=await fetchT(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(it.title)}`);
      if(r.ok){ const sh=await r.json(); img=sh.image?.medium||null; }
    } else if(it.type==="book"){
      gap=1500; const r=await fetchT(`https://openlibrary.org/search.json?q=${encodeURIComponent(it.title+" "+(it.platform||""))}&limit=1&fields=cover_i,number_of_pages_median`);
      if(r.ok){ const d=(await r.json()).docs?.[0]; img=d?.cover_i?`https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`:null; if(!it.total&&d?.number_of_pages_median) total=d.number_of_pages_median; }
    } else if(it.type==="movie"||it.type==="game"){
      if(it.type==="movie"){
        const r=await fetchT(`https://itunes.apple.com/search?term=${encodeURIComponent(it.title)}&media=movie&entity=movie&limit=5`);
        if(r.ok){ const res=(await r.json()).results||[], yr=/^\d{4}$/.test(it.platform||"")?it.platform:null, t=it.title.toLowerCase();
          const hit=res.find(m=>yr&&String(m.releaseDate||"").startsWith(yr)&&m.trackName?.toLowerCase()===t)||res.find(m=>m.trackName?.toLowerCase()===t)||(yr?res.find(m=>String(m.releaseDate||"").startsWith(yr)):null);
          img=hit?.artworkUrl100?hit.artworkUrl100.replace(/\/\d+x\d+bb\./,"/300x450bb."):null; }
      } else {
        const r=await fetchT(`https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(it.title)}&page_size=1`);
        if(r.ok){ img=((await r.json()).results||[])[0]?.background_image||null; }
      }
    }
    tried.add(String(it.id)); try{ LS.set("nl-bl-cover-tried",JSON.stringify([...tried].slice(-3000))); }catch(e){}
    const patch={}; if(img&&img.startsWith("https://")) patch.image=img; if(total) patch.total=total;
    if(Object.keys(patch).length){ Object.assign(it,patch); await api.updateBacklog(it.id,patch).catch(()=>{});
      if(!$("backlogSheet").classList.contains("hidden")&&blTab==="library") paintBlList(); }
  }catch(e){ gap=8000; }
  finally{ blCoverBusy=false; blCoverSoon(gap); }
}
document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&user&&myBl) blCoverSoon(5000); });

/* ---------- sharing into a chat ---------- */
let blSharing=null;
const BL_TYPE_LABEL={game:"Game",anime:"Anime",movie:"Movie",tv:"TV show",book:"Book",manga:"Manga"};
const BL_COUNTED={anime:"episode",tv:"episode",book:"page",manga:"chapter"};   // types with a total you count toward
const blCounted=t=>!!BL_COUNTED[t];
const blReads=t=>t==="book"||t==="manga";
const blIcon=t=>({game:"🎮",anime:"📺",movie:"🎬",tv:"📺",book:"📚",manga:"📖"}[t]||"🎮");
function blShareText(it){
  const verb=it.status==="completed"?"Finished":it.status==="in-progress"?(it.type==="game"?"Playing":blReads(it.type)?"Reading":"Watching"):"On my backlog";
  const stars=it.rating?" · "+"★".repeat(it.rating)+"☆".repeat(5-it.rating):"";
  return `${blIcon(it.type)} ${verb}: ${it.title}${stars}`;
}
async function openBlShare(it){
  blSharing=it; $("blShareWhat").textContent=blShareText(it); $("blShareNote").value="";
  const box=$("blShareList"); box.innerHTML="";
  if(!inboxRows.length) await loadInbox();
  const rows=[...inboxRows].sort((a,b)=>(b.code===room)-(a.code===room));
  if(!rows.length) box.append(el("p","note","Join a room or start a DM first."));
  rows.forEach(r=>{
    const b=el("button","roomrow"); b.type="button";
    let icon; if(r.is_dm){ icon=el("span","face"); paintFace(icon,cache.get(r.dm_user)||{id:r.dm_user,username:r.dm_name}); } else icon=el("span","hash","#");
    const info=el("span","info"); info.append(el("div","name",(r.code===room?"This chat · ":"")+(r.is_dm?(r.dm_name||"Private chat"):(r.name||"# "+r.code))));
    b.append(icon,info); b.onclick=()=>blShareTo(r); box.append(b);
  });
  show($("blShareSheet"));
}
async function blShareTo(r,note){
  const it=blSharing; if(!it) return; show($("blShareSheet"),false);
  note=String(note??$("blShareNote").value??"").trim().slice(0,300);
  const card={kind:"backlog",type:it.type,title:it.title,image:safeImg(it.image)||null,status:it.status,rating:it.rating||0,platform:it.platform||null,progress:it.progress||0,total:it.total||null,src:it.source_id||null,...(note?{note}:{})};
  try{
    const m=await api.send(r.code,{kind:"text",text:blShareText(it)+(note?"\n"+note:""),image_url:card.image,card});
    if(r.code===room) await addMessages([m]);
    const where=r.is_dm?(r.dm_name||"your DM"):(r.name||"#"+r.code);
    if($("backlogSheet").classList.contains("hidden")) $("status").textContent=`Shared to ${where}.`; else say("blMsg",`Shared to ${where} ✓`);
  }catch(err){ say("blMsg","Couldn't share: "+blFriendlyError(err),true); }
}
$("blShareClose").onclick=()=>show($("blShareSheet"),false);

/* ================= E-CARDS =================
   The templates and the isEcard check were written by Cole. A card rides in the message's "card" slot:
   { kind:"ecard", template:"birthday", message:"..." }. Friends see a sealed envelope until they tap it. */
const ECARD_TEMPLATES={
  birthday:{ title:"Happy Birthday!", emoji:"🎂", color:"#FF5C9A", message:"Wishing you a wonderful birthday!" },
  congrats:{ title:"Congratulations!", emoji:"🎉", color:"#FFD700", message:"Well done!" },
  getwell:{ title:"Feel better soon!", emoji:"🌸", color:"#87CEEB", message:"Wishing you a speedy recovery!" },
  thanksgiving:{ title:"Happy Thanksgiving!", emoji:"🦃", color:"#FF8C00", message:"Wishing you a joyful Thanksgiving!" },
  christmas:{ title:"Merry Christmas!", emoji:"🎄", color:"#FF0000", message:"Wishing you a festive Christmas!" },
  halloween:{ title:"Happy Halloween!", emoji:"🎃", color:"#FF7518", message:"Wishing you a spooky and fun Halloween!" },
  easter:{ title:"Happy Easter!", emoji:"🐰", color:"#98FB98", message:"Wishing you a joyful Easter!" },
  newyear:{ title:"Happy New Year!", emoji:"🎆", color:"#00FFFF", message:"Wishing you a prosperous New Year!" },
  mothersday:{ title:"Happy Mother's Day!", emoji:"🌷", color:"#FF69B4", message:"Wishing you a wonderful Mother's Day!" },
  fathersday:{ title:"Happy Father's Day!", emoji:"👔", color:"#1E90FF", message:"Wishing you a wonderful Father's Day!" },
  valentines:{ title:"Happy Valentine's Day!", emoji:"💖", color:"#FF69B4", message:"Wishing you a sweet Valentine's Day!" },
};
const isEcard=m=>m?.card&&typeof m.card==="object"&&m.card.kind==="ecard"&&ECARD_TEMPLATES[m.card.template];

/* cards you've opened stay open (remembered on this device) */
const ECARD_OPEN_KEY="nl-ecards-open";
function ecOpened(){ try{ return new Set(JSON.parse(LS.get(ECARD_OPEN_KEY)||"[]")); }catch(e){ return new Set(); } }
function markEcardOpen(id){ try{ const ids=[...ecOpened()].filter(x=>x!==id); ids.push(id); LS.set(ECARD_OPEN_KEY,JSON.stringify(ids.slice(-300))); }catch(e){} }

function ecardMsgCard(m){
  const t=ECARD_TEMPLATES[m.card.template];            // look up the design: birthday, congrats...
  const box=el("div","ecard");                          // the card box
  box.style.setProperty("--ec",t.color);                // hand the card its color, so the CSS can use it
  const inside=()=>{                                    // the open card: emoji, title, message, who it's from
    box.append(el("div","ec-emoji",t.emoji), el("div","ec-title",t.title));
    box.append(el("div","ec-msg",String(m.card.message||t.message).slice(0,300)));
    box.append(el("div","ec-from","from "+nameOf(m.user_id)));
  };
  const sealed=m.user_id!==user?.id && typeof m.id==="number" && !ecOpened().has(m.id);   // your friends get an envelope first
  if(!sealed){ inside(); return box; }
  box.classList.add("closed"); box.tabIndex=0; box.setAttribute("role","button"); box.setAttribute("aria-label",`Card from ${nameOf(m.user_id)}. Tap to open`);
  const env=el("div","ec-env"); env.append(el("div","ec-flap"), el("div","ec-seal",t.emoji));
  box.append(env, el("div","ec-tap","A card from "+nameOf(m.user_id)), el("div","ec-hint","Tap to open"));
  const open=e=>{
    e?.stopPropagation(); if(!box.classList.contains("closed")||box.classList.contains("opening")) return;
    markEcardOpen(m.id); box.classList.add("opening"); if(navigator.vibrate) navigator.vibrate(20);
    setTimeout(()=>{
      box.classList.remove("closed","opening"); box.removeAttribute("role"); box.removeAttribute("aria-label"); box.removeAttribute("tabindex");
      box.innerHTML=""; inside(); box.classList.add("revealed");
      if(typeof FX!=="undefined"&&fxEnabled()&&!reducedMotion()) FX.play("confetti");
    }, reducedMotion()?0:650);
  };
  box.onclick=open; box.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); open(e); } };
  return box;
}

/* ---------- the "Send a card" sheet ---------- */
let ecPick="birthday", ecTyped=false;
function ecSuggested(){   // pick a card that fits today
  if(isDm&&dmUser&&isBirthdayToday(cache.get(dmUser)?.birthday)) return "birthday";
  const h=typeof holidayFor==="function"?holidayFor(new Date()):"";
  return ({halloween:"halloween",thanksgiving:"thanksgiving",winter:"christmas",newyear:"newyear",valentine:"valentines",easter:"easter"})[h]||"birthday";
}
function openEcardSheet(){
  ecPick=ecSuggested(); ecTyped=false; $("ecMsg").value=ECARD_TEMPLATES[ecPick].message; say("ecMsgLine","");
  paintEcPicks(); paintEcPreview(); show($("ecardSheet"));
}
function paintEcPicks(){
  const box=$("ecPicks"); box.innerHTML="";
  Object.entries(ECARD_TEMPLATES).forEach(([key,t])=>{
    const b=el("button","ecpick"); b.type="button"; b.setAttribute("role","radio"); b.setAttribute("aria-checked",String(key===ecPick));
    b.style.setProperty("--ec",t.color); b.append(el("span","ecp-emoji",t.emoji), el("span","ecp-name",t.title.replace(/!$/,"")));
    b.onclick=()=>{ ecPick=key; if(!ecTyped) $("ecMsg").value=t.message; paintEcPicks(); paintEcPreview(); };
    box.append(b);
  });
}
function paintEcPreview(){
  const pv=$("ecPreview"); pv.innerHTML="";
  pv.append(ecardMsgCard({id:"preview",user_id:user?.id,card:{kind:"ecard",template:ecPick,message:$("ecMsg").value.trim()}}));
}
$("ecMsg").addEventListener("input",()=>{ ecTyped=true; paintEcPreview(); });
$("trayCard").onclick=()=>{ closeTray(); openEcardSheet(); };
$("ecClose").onclick=()=>show($("ecardSheet"),false);
$("ecardForm").onsubmit=async e=>{
  e.preventDefault(); const t=ECARD_TEMPLATES[ecPick]; if(!t||!room) return;
  const msg=$("ecMsg").value.trim().slice(0,300)||t.message;
  $("ecSend").disabled=true;
  try{
    await sendFields({kind:"text",text:`💌 ${t.title}\n${msg}`,card:{kind:"ecard",template:ecPick,message:msg}});
    show($("ecardSheet"),false);
  }catch(err){ say("ecMsgLine","Couldn't send the card: "+err.message,true); }
  finally{ $("ecSend").disabled=false; }
};

/* ---------- the card friends see in chat ---------- */
function backlogMsgCard(m){
  const c=m.card, box=el("div","blmsg");
  const type=BL_TYPE_LABEL[c.type] ? c.type : "game", img=safeImg(c.image);
  const typeLabel=blIcon(type)+" "+BL_TYPE_LABEL[type].toUpperCase();
  if(img){ const i=document.createElement("img"); i.src=img; i.alt=""; i.loading="lazy"; if(type==="game") i.className="wide"; i.onerror=()=>i.remove(); box.append(i); }
  const mid=el("div","blmid");
  mid.append(el("div","bleye",`${typeLabel} · ${(BL_STATUS[c.status]||"Planned").toUpperCase()}`), el("div","blname",String(c.title).slice(0,120)));
  const meta=[c.platform?String(c.platform).slice(0,40):null, c.status!=="planned"?blProgressText({type,status:c.status,progress:+c.progress||0,total:c.total||null}):null].filter(Boolean).join(" · ");
  if(meta) mid.append(el("div","blprog",meta));
  if(+c.rating>0) mid.append(blStars(Math.min(5,+c.rating),null));
  if(m.user_id!==user.id){
    const src={type,title:String(c.title),image:img,platform:c.platform,total:c.total,source_id:typeof c.src==="string"?c.src:null};
    if(myBl===null) loadMyBacklog().then(()=>{ const nb=blAddToMineButton(src); btn.replaceWith(nb); btn=nb; });
    let btn=blAddToMineButton(src); mid.append(btn);
  }
  box.append(mid); return box;
}

$("openBacklog").onclick=()=>{ show($("profile"),false); openBacklog(user.id); };
$("personBacklog").onclick=()=>{ const uid=personUid; show($("personSheet"),false); openBacklog(uid); };
$("blClose").onclick=()=>show($("backlogSheet"),false);

