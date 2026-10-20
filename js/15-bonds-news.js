/* ================= HABITS, STATS, SOCIAL BONDS, ARCANA ================= */
const STATS=["guts","knowledge","charm","kindness","proficiency"];
const STAT_LABEL={guts:"Guts",knowledge:"Knowledge",charm:"Charm",kindness:"Kindness",proficiency:"Proficiency"};
const STAT_ICON={guts:"🔥",knowledge:"📘",charm:"💫",kindness:"💚",proficiency:"🛠️"};
const STAT_TITLES={
  guts:["Faint of Heart","Milquetoast","Steady","Bold","Fearless","Lionhearted"],
  knowledge:["Oblivious","Studious","Sharp","Scholarly","Brilliant","Erudite"],
  charm:["Awkward","Existent","Likeable","Magnetic","Captivating","Debonair"],
  kindness:["Prickly","Inoffensive","Warm","Caring","Compassionate","Angelic"],
  proficiency:["Clumsy","Bumbling","Capable","Skilled","Masterful","Transcendent"],
};
const STAT_TIERS=[0,5,12,22,35,50];
function statTier(count){ let i=0; for(let k=0;k<STAT_TIERS.length;k++) if(count>=STAT_TIERS[k]) i=k; return i; }
function statNext(count){ const i=statTier(count); return i>=STAT_TIERS.length-1?null:STAT_TIERS[i+1]; }

let myHabits=[], myHabitLogs=[], habitsLoaded=false;
const habitStatOf=new Map();   // habit id -> stat, including habits you've removed (their check-ins still count)
async function loadHabits(){
  try{
    const [h,logs,all]=await Promise.all([api.habits(),api.habitLogs("2000-01-01"),api.habitStats().catch(()=>null)]);
    myHabits=h; myHabitLogs=logs; habitStatOf.clear();
    (all||h).forEach(x=>habitStatOf.set(x.id,x.stat));
    habitsLoaded=true;
  }
  catch(e){ myHabits=[]; myHabitLogs=[]; }
}
function statCount(stat){ return myHabitLogs.filter(l=>habitStatOf.get(l.habit_id)===stat).reduce((n,l)=>n+(l.count||1),0); }
function countToday(habitId){ const today=localDay(new Date()); const log=myHabitLogs.find(l=>l.habit_id===habitId&&l.done_on===today); return log?(log.count||1):0; }
function localDay(d = new Date()){
  const year  = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day   = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function doneToday(habitId){ const today=localDay(new Date()); return myHabitLogs.some(l=>l.habit_id===habitId&&l.done_on===today); }
function habitStreak(habitId){
  const days=new Set(myHabitLogs.filter(l=>l.habit_id===habitId).map(l=>l.done_on));
  let n=0, d=new Date();
  if(!days.has(localDay(d))) d.setDate(d.getDate()-1);
  while(days.has(localDay(d))){ n++; d.setDate(d.getDate()-1); }
  return n;
}

async function paintHabits(){
  if(!habitsLoaded) await loadHabits();
  const bars=$("statBars"); bars.innerHTML="";
  STATS.forEach(s=>{
    const count=statCount(s), tier=statTier(count), next=statNext(count);
    const row=el("div","statrow");
    row.append(el("span","staticon",STAT_ICON[s]));
    const mid=el("div","statmid");
    mid.append(el("div","statname",`${STAT_LABEL[s]} · ${STAT_TITLES[s][tier]}`));
    const bar=el("div","statbar"); const pct=next?Math.round(100*(count-STAT_TIERS[tier])/(next-STAT_TIERS[tier])):100;
    const fill=el("div","statfill"); fill.style.width=pct+"%"; bar.append(fill); mid.append(bar);
    row.append(mid); row.append(el("span","statnum",String(count)));
    bars.append(row);
  });
  const total=myHabitLogs.filter(l=>habitStatOf.has(l.habit_id)).reduce((n,l)=>n+(l.count||1),0);
  $("habitSummary").textContent=myHabits.length?`${myHabits.length} habit${myHabits.length===1?"":"s"} · ${total} total completion${total===1?"":"s"}`:"";
  const list=$("habitList"); list.innerHTML="";
  if(!myHabits.length) list.append(el("p","note","No habits yet. Add one below — each check-in builds a stat."));
    myHabits.forEach(h=>{
    const n=countToday(h.id);
    const row=el("div","habitrow"+(n>0?" done":""));
    const chk=el("button","habitchk"); chk.type="button";
    chk.setAttribute("aria-label","Add one: "+h.label+(n?` (${n} today)`:""));
    chk.textContent=n>1?String(n):n===1?"✓":"";
    chk.onclick=()=>bumpHabitUI(h,1);
    const mid=el("div","habitmid");
    const streak=habitStreak(h.id), lifetime=myHabitLogs.filter(l=>l.habit_id===h.id).reduce((t,l)=>t+(l.count||1),0);
    mid.append(el("div","habitlabel",`${STAT_ICON[h.stat]} ${h.label}`));
    const bits=[]; if(n>1) bits.push(`×${n} today`); if(streak>0) bits.push(`🔥 ${streak} day streak`); bits.push(`${lifetime} total`); if(h.reminder_time) bits.push(`reminds at ${h.reminder_time}`);
    mid.append(el("small","",bits.join(" · ")));
    row.append(chk,mid);
    if(n>0){ const minus=el("button","habitminus","−"); minus.type="button"; minus.setAttribute("aria-label","Remove one: "+h.label); minus.onclick=()=>bumpHabitUI(h,-1); row.append(minus); }
    const del=el("button","habitdel","✕"); del.type="button"; del.setAttribute("aria-label","Remove "+h.label);
    del.onclick=async()=>{ try{ await api.archiveHabit(h.id); myHabits=myHabits.filter(x=>x.id!==h.id); paintHabits(); say("habitMsg",`Removed "${h.label}". You keep the ${STAT_LABEL[h.stat]} points it earned.`); }catch(e){ say("habitMsg","Couldn't remove it. Check your connection and try again.",true); } };
    row.append(del); list.append(row);
  });
}
async function bumpHabitUI(h,delta){
  try{
    const today=localDay(new Date());
    const newCount=await api.bumpHabit(h.id,today,delta);
    const log=myHabitLogs.find(l=>l.habit_id===h.id&&l.done_on===today);
    if(newCount>0){ if(log) log.count=newCount; else myHabitLogs.push({habit_id:h.id,user_id:user.id,done_on:today,count:newCount}); }
    else myHabitLogs=myHabitLogs.filter(l=>!(l.habit_id===h.id&&l.done_on===today));
        const xpKey="nl-habitxp-"+today+"-"+h.id;
    if(delta>0&&newCount===1&&!LS.get(xpKey)){ gainXP("habit"); try{ LS.set(xpKey,"1"); }catch(e){} }
    paintHabits();
  }catch(e){ say("habitMsg",e.message,true); }
}
$("habitForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const label=$("habitLabel").value.trim(), stat=$("habitStat").value, time=$("habitTime").value||null;
  if(!label) return;
  try{ const h=await api.createHabit(label,stat,time); myHabits.push(h); habitStatOf.set(h.id,h.stat); $("habitLabel").value=""; $("habitTime").value=""; paintHabits(); checkUnlocks?.(); }
  catch(err){ say("habitMsg",err.message,true); }
});
function openHabits(){ say("habitMsg",""); paintHabits(); show($("habitsSheet")); }
$("openHabits").onclick=openHabits;
$("habitsClose").onclick=()=>show($("habitsSheet"),false);

/* ---------- daily reminder nudge ---------- */
function checkHabitReminders(){
  if(!myHabits.length) return;
  const now=new Date(), hm=String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
  const due=myHabits.find(h=>h.reminder_time&&h.reminder_time<=hm&&!doneToday(h.id));
  if(!due) return;
  const key="nl-habit-nudged-"+localDay(new Date())+"-"+due.id;
  try{ if(LS.get(key)) return; LS.set(key,"1"); }catch(e){}
  const t=el("div","toast mention"); const body=el("span","tbody");
  body.append(el("div","ttitle","🎯 "+due.label), el("div","ttext","Still on your list for today."));
  const btn=el("button","send","Mark done"); btn.type="button"; btn.onclick=()=>{ bumpHabitUI(due,1); t.remove(); };
  t.append(el("span","sx-lock","🎯"),body,btn); $("toasts").prepend(t);
  setTimeout(()=>{ if(t.isConnected){ t.classList.add("out"); setTimeout(()=>t.remove(),260); } },8000);
}

/* ================= PERSONALITY QUIZ → ARCANA ================= */
const QUIZ=[
  {q:"Your friend wants to try something completely new together. You:",a:[["Say yes before they finish the sentence.","Fool"],["Start figuring out exactly how to make it work.","Magician"],["Ask a few quiet questions before deciding.","Priestess"],["Just want everyone to feel good about doing it.","Empress"]]},
  {q:"A group project has no leader and it's falling apart. You:",a:[["Take charge and assign the work.","Emperor"],["Quietly keep everyone talking to each other.","Hierophant"],["Check in on how everyone's actually doing.","Lovers"],["Just start doing your part and let it pull others in.","Chariot"]]},
  {q:"Something's genuinely hard right now. Your first move is:",a:[["Push through it, no drama.","Strength"],["Step back and deal with it alone for a while.","Hermit"],["Trust it'll work itself out in time.","Fortune"],["Figure out exactly what's fair here.","Justice"]]},
  {q:"You realize something in your life needs to change. You:",a:[["Sit with it, even if it's uncomfortable, before acting.","Hanged Man"],["Cut it off clean, no half-measures.","Death"],["Look for the balance instead of the extreme.","Temperance"],["You already know exactly what you want instead.","Devil"]]},
  {q:"Everything you had planned falls apart at once. You:",a:[["Honestly? A little relieved it's over.","Tower"],["Hold onto hope that it gets better.","Star"],["Go quiet and process it your own way.","Moon"],["Treat it as a real chance to start over.","Judgement"]]},
  {q:"People who know you well would say you're the one who:",a:[["Always gives people a second chance.","Judgement"],["Finishes what everyone else gives up on.","World"],["Keeps hope alive for the group.","Star"],["Makes hard days feel a little lighter.","Sun"]]},
  {q:"On your best days, you're the person who:",a:[["Lights up whatever room you're in.","Sun"],["Notices what nobody else does.","Moon"],["Actually finishes the thing.","World"],["Isn't afraid to blow it up and start over.","Tower"]]},
  {q:"When you really want something, you:",a:[["Go get it, no apologies.","Devil"],["Find a way that doesn't cost you everything else.","Temperance"],["Let go of whatever's in the way, completely.","Death"],["Wait it out, even if it's painful.","Hanged Man"]]},
  {q:"Someone asks you to pick a side in something messy. You:",a:[["Look at the facts and call it straight.","Justice"],["Figure the truth comes out eventually anyway.","Fortune"],["Stay out of it — not your fight.","Hermit"],["Say what you think, calmly, once.","Strength"]]},
  {q:"You've set your sights on something big. You:",a:[["Go straight at it, full speed.","Chariot"],["Bring the people you care about along for it.","Lovers"],["Build the community that'll get you there.","Hierophant"],["Build the plan first, then execute it.","Emperor"]]},
  {q:"The energy you bring into a room is usually:",a:[["Warm — people just relax around you.","Empress"],["Quiet, but people can tell you're paying attention.","Priestess"],["Sharp — you make things happen.","Magician"],["Unpredictable, in a good way.","Fool"]]},
];
/* (moved to js/00-media.js) */























const ARCANA_FLAVOR={
  Fool:"You leap first and figure out the landing later.",
  Magician:"You turn raw will into results.",
  Priestess:"You know more than you let on.",
  Empress:"You make people feel safe just by being there.",
  Emperor:"You build the structure everyone else leans on.",
  Hierophant:"You hold the group together, quietly, constantly.",
  Lovers:"You choose people, over and over, on purpose.",
  Chariot:"You don't wait for permission to move.",
  Strength:"Calm isn't the absence of feeling — it's choosing anyway.",
  Hermit:"You do your best thinking alone.",
  Fortune:"You trust the timing, even when it's messy.",
  Justice:"You can't let an unfair thing just sit there.",
  "Hanged Man":"You carry weight others never see.",
  Death:"You let things end so something else can start.",
  Temperance:"You find the middle path nobody else can see.",
  Devil:"You know exactly what you want, and you don't apologize for it.",
  Tower:"Sometimes you just have to let it all fall down.",
  Star:"You're the reason people still have hope.",
  Moon:"What you show isn't always what's true underneath.",
  Sun:"You make ordinary moments feel bigger.",
  Judgement:"You're always one conversation away from starting over.",
  World:"You finish what you start, completely.",
};
/* What each Arcana means: traditional tarot meanings (public domain), written in plain words */
const ARCANA_MEANING={
  Fool:{n:"0",full:"The Fool",keys:["new beginnings","freedom","spontaneity"],
    tarot:"The very first step of a journey: stepping into the unknown with an open heart and no map.",
    you:"Adventurous and easygoing. You say yes to things, and you make every plan more fun.",
    good:"Fearless curiosity", watch:"Leaping before you look"},
  Magician:{n:"I",full:"The Magician",keys:["willpower","skill","making it happen"],
    tarot:"Having every tool you need on the table, and the focus to use them. Ideas become real.",
    you:"Resourceful and quick. When something needs doing, you're the one who figures it out.",
    good:"Turning plans into action", watch:"Overpromising or showing off"},
  Priestess:{n:"II",full:"The High Priestess",keys:["intuition","mystery","inner knowing"],
    tarot:"The quiet keeper of secrets. Trust your gut and look beneath the surface.",
    you:"Perceptive and private. You read people easily and notice what others miss.",
    good:"A spooky-good intuition", watch:"Keeping too much to yourself"},
  Empress:{n:"III",full:"The Empress",keys:["nurturing","abundance","comfort"],
    tarot:"Growth, creativity, and care, like a garden in full bloom.",
    you:"Warm and generous. You're the friend who makes sure everyone's fed and okay.",
    good:"Making people feel cared for", watch:"Giving until you're running on empty"},
  Emperor:{n:"IV",full:"The Emperor",keys:["structure","leadership","stability"],
    tarot:"Order and authority: building solid foundations and protecting them.",
    you:"Reliable and organized. When things get messy, you take charge.",
    good:"Steady leadership", watch:"Being stubborn or controlling"},
  Hierophant:{n:"V",full:"The Hierophant",keys:["tradition","belonging","guidance"],
    tarot:"Shared beliefs and rituals, and learning from the people who came before you.",
    you:"Loyal to your people and your traditions. You're the glue, and often the mentor.",
    good:"Bringing people together", watch:"Resisting change"},
  Lovers:{n:"VI",full:"The Lovers",keys:["connection","choices","harmony"],
    tarot:"Deep bonds, and the choices that show who we really are.",
    you:"Devoted. You invest in the people you care about and keep choosing them.",
    good:"Loyalty that runs deep", watch:"Losing yourself in other people"},
  Chariot:{n:"VII",full:"The Chariot",keys:["drive","determination","victory"],
    tarot:"Charging forward by steering opposite forces with pure willpower.",
    you:"Ambitious and competitive. Once you've got momentum, nothing slows you down.",
    good:"Unstoppable determination", watch:"Bulldozing over people"},
  Strength:{n:"VIII",full:"Strength",keys:["courage","patience","compassion"],
    tarot:"Quiet inner strength: taming the lion with gentleness, not force.",
    you:"Calm under pressure. Kind, but a lot tougher than people expect.",
    good:"Resilience", watch:"Bottling up your feelings"},
  Hermit:{n:"IX",full:"The Hermit",keys:["reflection","solitude","wisdom"],
    tarot:"Stepping away from the noise to find your own light.",
    you:"Thoughtful and independent. Your best ideas come when you're on your own.",
    good:"Deep insight", watch:"Isolating yourself"},
  Fortune:{n:"X",full:"Wheel of Fortune",keys:["change","luck","cycles"],
    tarot:"Life's turning wheel: ups and downs, and learning to roll with them.",
    you:"Adaptable and easygoing. Things tend to work out for you, somehow.",
    good:"Rolling with whatever happens", watch:"Leaving everything to chance"},
  Justice:{n:"XI",full:"Justice",keys:["fairness","truth","balance"],
    tarot:"Cause and effect: weighing things honestly, and owning the results.",
    you:"Principled. You'll stand up for someone even when it's awkward.",
    good:"Honesty", watch:"Seeing everything in black and white"},
  "Hanged Man":{n:"XII",full:"The Hanged Man",keys:["surrender","new perspective","patience"],
    tarot:"Pausing and seeing the world upside down, so you finally understand it.",
    you:"Patient and selfless, with a way of seeing things nobody else does.",
    good:"Seeing what others miss", watch:"Waiting too long, or carrying everything alone"},
  Death:{n:"XIII",full:"Death",keys:["endings","transformation","fresh starts"],
    tarot:"Not literal death: one chapter closing so a new one can begin.",
    you:"Brave about change. You're always growing into a new version of yourself.",
    good:"Knowing when to let go", watch:"Burning bridges too fast"},
  Temperance:{n:"XIV",full:"Temperance",keys:["balance","moderation","healing"],
    tarot:"Blending opposites into something whole, with patience and a middle path.",
    you:"The peacemaker. Level-headed when everyone else is losing it.",
    good:"Finding balance", watch:"Avoiding conflict you actually need to have"},
  Devil:{n:"XV",full:"The Devil",keys:["desire","temptation","attachment"],
    tarot:"The things that hold us, like habits and attachments, and the power to break free.",
    you:"Bold and magnetic. You know exactly what you want.",
    good:"Confidence and passion", watch:"Getting stuck in bad habits"},
  Tower:{n:"XVI",full:"The Tower",keys:["upheaval","revelation","sudden change"],
    tarot:"A lightning strike that knocks down what wasn't built to last, so the truth can come through.",
    you:"Unfiltered and honest. You shake things up when they've gotten stale.",
    good:"Breaking bad patterns", watch:"Causing chaos just because"},
  Star:{n:"XVII",full:"The Star",keys:["hope","inspiration","healing"],
    tarot:"The calm after the storm: renewed hope and faith that things will get better.",
    you:"Optimistic and inspiring. People feel better just talking to you.",
    good:"Keeping hope alive", watch:"Head in the clouds"},
  Moon:{n:"XVIII",full:"The Moon",keys:["dreams","intuition","the unknown"],
    tarot:"Things aren't always what they seem: imagination, illusion, and hidden feelings.",
    you:"Imaginative, creative, and a little mysterious. There's always more going on under the surface.",
    good:"Creativity", watch:"Overthinking"},
  Sun:{n:"XIX",full:"The Sun",keys:["joy","success","warmth"],
    tarot:"Pure positivity and energy. Everything's bright and clear.",
    you:"Upbeat, with the kind of energy that's contagious.",
    good:"Lifting everyone's mood", watch:"Glossing over real problems"},
  Judgement:{n:"XX",full:"Judgement",keys:["awakening","second chances","reflection"],
    tarot:"A wake-up call: facing the past and rising into who you're meant to be.",
    you:"Self-aware and forgiving. You believe in second chances, for others and yourself.",
    good:"Growth", watch:"Being too hard on yourself"},
  World:{n:"XXI",full:"The World",keys:["completion","wholeness","achievement"],
    tarot:"The end of the journey: everything finally coming together.",
    you:"A finisher. Well-rounded, and you see things all the way through.",
    good:"Seeing it through", watch:"Getting restless once you're done"}
};
/* What each Arcana means for a Social Bond: written about the friendship, not the person */
const ARCANA_BOND={
  Fool:"A bond built on adventure. You two are always up for something new, and the best stories start with \"wait, what if we…\"",
  Magician:"You make things happen together. Put you two on a project and it actually gets done.",
  Priestess:"You understand each other without saying much. Sometimes a look is enough.",
  Empress:"A warm, comfy friendship. You look out for each other and make each other feel at home.",
  Emperor:"Steady and dependable. You can count on each other, no matter what.",
  Hierophant:"A bond built on shared traditions: inside jokes, rituals, and stuff only you two get.",
  Lovers:"A deep connection you both keep choosing. Real, ride-or-die friendship.",
  Chariot:"You push each other forward. Friendly competition, big goals, cheering each other on.",
  Strength:"You're each other's calm. When one of you is struggling, the other steadies them.",
  Hermit:"A quiet, thoughtful friendship. Long talks, deep thoughts, no small talk needed.",
  Fortune:"A bond full of lucky timing. You always turn up in each other's lives at the right moment.",
  Justice:"Honest and fair. You tell each other the truth, even when it's hard to hear.",
  "Hanged Man":"Patient and forgiving. You can always see things from each other's side.",
  Death:"A bond that's grown through big changes. You've watched each other become new people.",
  Temperance:"Balanced and easy. You bring out each other's calm side.",
  Devil:"An irresistible friendship. You bring out each other's wild side, maybe a little too well.",
  Tower:"Chaotic in the best way. Things get shaken up whenever you two are together.",
  Star:"Hopeful and uplifting. You make each other believe things will work out.",
  Moon:"A bond with layers: secrets, dreams, and late-night thoughts you don't share with anyone else.",
  Sun:"Pure good vibes. Every conversation leaves you both in a better mood.",
  Judgement:"A friendship of second chances. You've forgiven each other and come back stronger.",
  World:"An all-in friendship. You've been through it all together, and you're still here."
};
function openArcanaMeaning(arc,{whose="",mine=false}={}){
  const m=ARCANA_MEANING[arc]; if(!m) return;
  $("amTitle").textContent=whose?`${whose}'s Arcana`:"Your Arcana";
  const art=$("amArt"); art.innerHTML=""; if(ARCANA_ART[arc]){ const im=document.createElement("img"); im.src=ARCANA_ART[arc]; im.alt=m.full+" tarot card"; art.append(im); }
  $("amName").textContent=`${m.n} · ${m.full}`;
  const kw=$("amKeys"); kw.innerHTML=""; m.keys.forEach(k=>kw.append(el("span","am-key",k)));
  $("amTarot").textContent=m.tarot; $("amYou").textContent=m.you; $("amGood").textContent=m.good; $("amWatch").textContent=m.watch;
  show($("amRetake"),mine);
  show($("arcanaSheet"));
}
const quizChime=(notes)=>{ try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); notes.forEach(([f,at,len,type])=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type=type||"sine"; o.frequency.value=f; g.gain.setValueAtTime(.0001,ac.currentTime+at); g.gain.exponentialRampToValueAtTime(.06,ac.currentTime+at+.02); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+at+len); o.connect(g); g.connect(ac.destination); o.start(ac.currentTime+at); o.stop(ac.currentTime+at+len+.05); }); }catch(e){} };
let quizAnswers=[], quizIdx=0;
function paintQuiz(){
  quizAnswers=[]; quizIdx=0; show($("quizShuffle"),false); show($("quizBody"),true);
  renderQuizQuestion();
}
function renderQuizQuestion(){
  const box=$("quizBody"); box.innerHTML="";
  const dots=el("div","quizdots");
  QUIZ.forEach((_,i)=>dots.append(el("span","quizdot"+(i<quizIdx?" done":i===quizIdx?" on":""))));
  box.append(dots);
  const item=QUIZ[quizIdx];
  const card=el("div","quizq quizq-in");
  card.append(el("div","quizqnum",`Card ${quizIdx+1} of ${QUIZ.length}`));
  card.append(el("div","quizqtext",item.q));
  const opts=el("div","quizopts");
  item.a.forEach(([label,arc])=>{
    const btn=el("button","quizopt"); btn.type="button"; btn.textContent=label;
    btn.onclick=()=>selectQuizAnswer(arc,card,btn);
    opts.append(btn);
  });
  card.append(opts); box.append(card);
  quizChime([[440,0,.06,"triangle"]]);
}
function selectQuizAnswer(arc,card,btn){
  quizAnswers[quizIdx]=arc;
  [...card.querySelectorAll(".quizopt")].forEach(b=>{ b.disabled=true; if(b!==btn) b.classList.add("fade"); });
  btn.classList.add("on");
  card.classList.add("quizq-out");
  quizChime([[660,0,.08,"triangle"]]);
  setTimeout(()=>{ quizIdx++; if(quizIdx>=QUIZ.length) startQuizShuffle(); else renderQuizQuestion(); },420);
}
function startQuizShuffle(){
  show($("quizBody"),false); show($("quizShuffle"),true);
  quizChime([[220,0,.1,"square"],[220,.15,.1,"square"],[220,.3,.1,"square"],[220,.45,.1,"square"]]);
  setTimeout(finishQuiz,2000);
}
async function finishQuiz(){
  const tally={}; quizAnswers.forEach(a=>tally[a]=(tally[a]||0)+1);
  const winner=Object.entries(tally).sort((a,b)=>b[1]-a[1])[0][0];
  try{ await api.saveArcana(winner); meProfile.arcana=winner; cache.set(user.id,meProfile); }catch(e){}
  show($("quizSheet"),false); show($("quizShuffle"),false); show($("profile"),false);
  revealArcana(winner);
  paintArcanaBadge();
}
function revealArcana(arcana){
  const layer=$("sfx"), w=document.createElement("div"); w.className="arcana-reveal";
  w.innerHTML=`<div class="arcana-burst"></div>
    <div class="arcana-drop"><div class="arcana-card"><div class="arcana-back"></div>
      <div class="arcana-front">${ARCANA_ART[arcana]?`<img class="arcana-art" src="${ARCANA_ART[arcana]}" alt="">`:""}<div class="arcana-name">${arcana}</div><div class="arcana-flavor">${ARCANA_FLAVOR[arcana]||""}</div></div>
    </div></div>
    <div class="arcana-actions"><button type="button" class="send arcana-done">Nice.</button><button type="button" class="linkbtn arcana-again">Retake the quiz</button></div>`;
  layer.append(w);
  const burst=w.querySelector(".arcana-burst");
  for(let i=0;i<16;i++){ const s=document.createElement("i"); s.style.setProperty("--a",(i*(360/16))+"deg"); burst.append(s); }
  setTimeout(()=>{ w.classList.add("flip"); quizChime([[523,0,.15,"sine"],[659,.1,.15,"sine"],[784,.2,.1,"sine"],[1047,.32,.35,"sine"]]); if(navigator.vibrate) navigator.vibrate([20,30,20,30,120]); burst.classList.add("go"); },850);
  w.querySelector(".arcana-done").onclick=()=>w.remove();
  w.querySelector(".arcana-again").onclick=()=>{ w.remove(); openQuiz(); };
  setTimeout(()=>{ if(w.isConnected) w.remove(); },10000);
}
function openQuiz(){ paintQuiz(); show($("quizSheet")); }
$("openQuiz").onclick=openQuiz;
$("quizClose").onclick=()=>show($("quizSheet"),false);

function paintArcanaBadge(){
  const n=$("myArcana"); if(!n) return;
  const arc=meProfile?.arcana;
  show(n,!!arc); if(!arc) return;
  n.innerHTML=""; n.append(el("span","ma-eyebrow","🃏 Arcana"), el("span","ma-name",arc));
  n.append(el("span","ma-more","Meaning ›"));
  n.setAttribute("aria-label","Your Arcana: "+arc+". Tap to see what it means.");
  n.onclick=()=>{ show($("profile"),false); openArcanaMeaning(arc,{mine:true}); };
}
/* the Me tab's icon is a tiny version of your own profile picture */
function paintMeTab(){
  const ic=$("meTabIcon"); if(!ic||!meProfile) return;
  ic.innerHTML=""; const f=el("span","face metab"); paintFace(f,meProfile); ic.append(f);
}
/* Quizzes tab: show your own results on each quiz card */
function paintQuizTab(){
  const a=$("quizMineArc"), g=$("quizMineSig"); if(!a||!g) return;
  a.textContent=meProfile?.arcana?`You: ${meProfile.arcana}`:"Not taken yet";
  g.textContent="…"; g.style.color="";
  api.mySignal().then(m=>{ if(m&&NS_INFO[m.top]){ g.textContent=`You: ${NS_INFO[m.top].name}`; g.style.color=NS_INFO[m.top].color; } else g.textContent="Not taken yet"; }).catch(()=>{ g.textContent="Not taken yet"; });
}

/* ================= SOCIAL BONDS ================= */
// "Social Bond" is our own name for this feature (kept generic, not tied to any game’s specific term).
const RANK_STEPS=[0,30,70,120,180,250,330,420,520,630];
function rankFromXp(xp){ let r=1; for(let i=1;i<RANK_STEPS.length;i++) if(xp>=RANK_STEPS[i]) r=i+1; const into=xp-RANK_STEPS[r-1], need=r>=10?0:RANK_STEPS[r]-RANK_STEPS[r-1]; return {rank:Math.min(r,10),into,need}; }
let socialLinks=new Map();   // other uid -> row
/* ===== Bond styles: a higher Social Bond rank with a friend unlocks looks that only work in your DM with them =====
   Both of you see the same style. The server double-checks the rank (set_dm_style), so nobody can skip ahead. */
const BOND_BGS=[["campfire","🔥 Campfire",3],["twinstars","✨ Twin Stars",6],["constellation","🌌 Constellation",9]];
const BOND_BUBBLES=[["synced","💞 Synced",4],["heartline","💗 Heartline",7]];
const DUO_RANK=10;
let dmStyle={bg:null,bubbles:null};
function bondRankWith(uid){ const r=uid&&socialLinks.get(uid); return r?rankFromXp(r.xp||0).rank:1; }
function applyDmStyle(st){
  dmStyle={bg:isDm&&st?.bg||null, bubbles:isDm&&st?.bubbles||null};
  const c=$("chat"); if(dmStyle.bubbles) c.dataset.bubbles=dmStyle.bubbles; else delete c.dataset.bubbles;
  setRoomBackground(roomBg);
}
function clearDmStyle(){ dmStyle={bg:null,bubbles:null}; delete $("chat").dataset.bubbles; $("stickerGrid").innerHTML=""; }
async function loadDmStyle(){
  clearDmStyle(); applyDmStyle(null); if(!isDm) return;
  const r=room; try{ const st=await api.dmStyle(r); if(r===room) applyDmStyle(st); }catch(e){}   // before the SQL is run this just stays plain
}
function onDmStyleSignal(p){
  if(!p||p.room!==room||p.from===user.id) return;
  applyDmStyle(p); if(!$("roomSheet").classList.contains("hidden")) paintBondStyles();
  $("status").textContent=`💞 ${nameOf(p.from)} changed your DM style`;
}
async function chooseDmStyle(bg,bubbles){
  const prev={...dmStyle}; applyDmStyle({bg,bubbles}); paintBondStyles(); paintBgTiles();
  try{ await api.setDmStyle(room,bg,bubbles); try{ unsub?.dmstyle?.({room,bg,bubbles,from:user.id}); }catch(e){} say("rsMsg","Bond style updated for both of you."); }
  catch(err){ applyDmStyle(prev); paintBondStyles(); paintBgTiles(); say("rsMsg","Couldn't change it: "+err.message,true); }
}
function paintBondStyles(){
  const box=$("bondBox"); const on=isDm&&!!dmUser; show(box,on); if(!on) return;
  const rank=bondRankWith(dmUser), who=nameOf(dmUser);
  $("bondRankLine").textContent=`Your Social Bond with ${who} is rank ${rank}. These styles only work in this DM, and you both see them.`;
  const tiles=(list,cur,id,pick)=>{
    const g=$(id); g.innerHTML="";
    const none=el("button","bgtile bondtile","None"); none.type="button"; none.dataset.bond="none"; none.setAttribute("aria-pressed",String(!cur)); none.onclick=()=>pick(null); g.append(none);
    list.forEach(([key,label,need])=>{
      const ok=rank>=need, t=el("button","bgtile bondtile"+(ok?"":" locked"),ok?label:`🔒 Rank ${need}`);
      t.type="button"; t.dataset.bond=key; t.setAttribute("aria-pressed",String(cur===key));
      if(ok) t.onclick=()=>pick(key); else { t.disabled=true; t.setAttribute("aria-label",`${label} (locked: reach Social Bond rank ${need} with ${who})`); }
      g.append(t);
    });
  };
  tiles(BOND_BGS,dmStyle.bg,"bondBgTiles",k=>chooseDmStyle(k,dmStyle.bubbles));
  tiles(BOND_BUBBLES,dmStyle.bubbles,"bondBubbleTiles",k=>chooseDmStyle(dmStyle.bg,k));
  $("bondDuoLine").textContent=rank>=DUO_RANK?"🤝 Duo sticker unlocked! Find it in + → Stickers, only in this DM.":`🔒 Rank ${DUO_RANK}: a Duo sticker only you two can send.`;
}
/* a bond background sits on top of the normal room background (only in the DM) */
const _setRoomBackground=setRoomBackground;
setRoomBackground=function(bg){ _setRoomBackground(bg); if(isDm&&dmStyle.bg){ const c=$("chat"); c.dataset.bg="bond-"+dmStyle.bg; c.style.removeProperty("--roombg"); } };
/* picking a normal background in a DM turns the bond background off, so you actually see your pick */
const _chooseBackground=chooseBackground;
chooseBackground=async function(bg){ if(isDm&&dmStyle.bg){ await chooseDmStyle(null,dmStyle.bubbles); } return _chooseBackground(bg); };
async function loadSocialLinks(){ try{ const rows=await api.socialLinks(); socialLinks=new Map(rows.map(r=>[r.user_a===user.id?r.user_b:r.user_a,r])); return true; }catch(e){ return false; } }   // false = couldn't load (bad signal)
function linkBadge(uid){
  const row=socialLinks.get(uid); if(!row) return null;
  const {rank}=rankFromXp(row.xp);
  const b=el("span","linkbadge",`${row.arcana} · Rank ${rank}`); return b;
}
/* Each phone remembers the last rank it saw for every bond. Anything new since then (a bond someone
   else started, or a rank-up their messages caused) gets announced when you open the app or get a DM. */
const bondKey=()=>"nl-bond-ranks-"+(user?.id||"");
function bondSeen(){ try{ return JSON.parse(LS.get(bondKey())); }catch(e){ return null; } }
function bondRemember(map){ try{ LS.set(bondKey(),JSON.stringify(map)); }catch(e){} }
function bondRememberOne(uid,rank){ const m=bondSeen(); if(!m) return; m[uid]=rank; bondRemember(m); }
let bondChecking=false, bondTimer=null;
function bondCheckSoon(ms=4000){ clearTimeout(bondTimer); bondTimer=setTimeout(checkBondNews,ms); }
async function checkBondNews(){
  if(!user||bondChecking) return; bondChecking=true;
  try{
    if(!await loadSocialLinks()) return;               // bad signal: try again later rather than forget what you've seen
    const seen=bondSeen(), now={...(seen||{})}, news=[];
    socialLinks.forEach((r,uid)=>{ const rank=rankFromXp(r.xp).rank; now[uid]=rank;
      if(seen&&seen[uid]===undefined) news.push({uid,r,rank,fresh:true});
      else if(seen&&rank>seen[uid]) news.push({uid,r,rank}); });
    bondRemember(now);                                  // first run on a device just learns quietly
    if(!news.length) return;
    await ensureProfiles(news.map(n=>n.uid));
    if(news.length>2) bondSummaryToast(news);           // lots at once: one toast, not a pile of them
    else news.forEach((n,i)=>setTimeout(()=>bondToast(n),600+i*900));
    const up=news.find(n=>!n.fresh);
    if(up&&fxEnabled()&&!reducedMotion()) setTimeout(()=>QX.rankup(nameOf(up.uid),up.r.arcana,up.rank),400);
    if(!$("contactsPane").classList.contains("hidden")) loadContacts();
  }finally{ bondChecking=false; }
}
function bondSummaryToast(news){
  const t=el("button","toast mention"); t.type="button";
  const body=el("span","tbody"), fresh=news.filter(n=>n.fresh).length, ups=news.length-fresh;
  const names=news.slice(0,3).map(n=>cache.get(n.uid)?.username||"a friend").join(", ")+(news.length>3?` and ${news.length-3} more`:"");
  body.append(el("div","ttitle",`💫 ${news.length} Social Bond updates`),
              el("div","ttext",`${[fresh?`${fresh} new`:"",ups?`${ups} ranked up`:""].filter(Boolean).join(" · ")}: ${names}`));
  t.append(body); t.onclick=()=>{ t.remove(); $("openBonds").click(); };
  $("toasts").prepend(t); setTimeout(()=>{ if(t.isConnected){ t.classList.add("out"); setTimeout(()=>t.remove(),260); } },8000);
  if(navigator.vibrate) navigator.vibrate([20,40,20]);
}
function bondToast(n){
  const name=cache.get(n.uid)?.username||"a friend";
  const t=el("button","toast mention"); t.type="button";
  const f=el("span","face"); paintFace(f,cache.get(n.uid));
  const body=el("span","tbody");
  body.append(el("div","ttitle",n.fresh?"💫 New Social Bond":"💫 Social Bond ranked up"),
              el("div","ttext",n.fresh?`${n.r.arcana} with ${name} · Rank ${n.rank}`:`${name} · ${n.r.arcana} Rank ${n.rank}`));
  t.append(f,body); t.onclick=()=>{ t.remove(); openSocialLink(n.uid); };
  $("toasts").prepend(t); setTimeout(()=>{ if(t.isConnected){ t.classList.add("out"); setTimeout(()=>t.remove(),260); } },7000);
  if(navigator.vibrate) navigator.vibrate([20,40,20]);
}
document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&user) bondCheckSoon(1500); });

async function bumpLink(otherUid){
  if(!otherUid||otherUid===user.id) return;
  try{
    const before=socialLinks.get(otherUid), beforeRank=before?rankFromXp(before.xp).rank:0;
    const row=await api.bumpSocialLink(otherUid); socialLinks.set(otherUid,row); bondRememberOne(otherUid,rankFromXp(row.xp).rank);
    const {rank}=rankFromXp(row.xp);
    if(rank>beforeRank&&fxEnabled()&&typeof QX!=="undefined"&&QX.rankup) QX.rankup(nameOf(otherUid),row.arcana,rank);
    if(rank>beforeRank) setTimeout(checkUnlocks,900);
  }catch(e){}
}
function openSocialLink(uid){
  const row=socialLinks.get(uid); if(!row){ say("personMsg","No bond yet — send a message to start one."); return; }
  const {rank,into,need}=rankFromXp(row.xp);
  $("slArcana").textContent=row.arcana; $("slRank").textContent="RANK "+rank+(rank>=10?" · MAX":"");
  if(ARCANA_ART[row.arcana]){ $("slArt").src=ARCANA_ART[row.arcana]; show($("slArt")); } else show($("slArt"),false);
  $("slName").textContent=nameOf(uid);
  const pct=rank>=10?100:Math.round(100*into/need);
  $("slFill").style.width=pct+"%"; $("slText").textContent=rank>=10?"Bond maxed out.":`${into} / ${need} to next rank`;
  // what this bond's card means for the friendship
  const box=$("slMeaning"); box.innerHTML=""; const bm=ARCANA_BOND[row.arcana], am=ARCANA_MEANING[row.arcana];
  if(bm){ box.append(el("b","","🤝 What your bond means"));
    if(am){ const kw=el("div","am-keys"); am.keys.forEach(k=>kw.append(el("span","am-key",k))); box.append(kw); }
    box.append(el("p","",bm), el("p","sl-grow",rank>=10?"🏆 This bond is maxed out. Legendary.":`📈 Grows as you two message each other in DMs.`)); }
  show(box,!!bm);
  show($("slSheet"));
}
$("slClose").onclick=()=>{ show($("slSheet"),false); if(slFromList){ slFromList=false; show($("bondsSheet")); } };
/* ===== My Social Bonds: every bond you have, strongest first (only you see this) ===== */
let slFromList=false;
function paintBondsList(){
  const rows=[...socialLinks.entries()].map(([uid,r])=>({uid,r,...rankFromXp(r?.xp||0)}))
    .sort((a,b)=>b.rank-a.rank||(b.r.xp||0)-(a.r.xp||0)||nameOf(a.uid).localeCompare(nameOf(b.uid)));
  const box=$("bondRows"); box.innerHTML="";
  const maxed=rows.filter(x=>x.rank>=10).length;
  $("bondsSub").textContent=rows.length?`${rows.length} bond${rows.length===1?"":"s"}${maxed?` · ${maxed} maxed out 🏆`:""}. They grow as you DM each other. Only you can see this list.`
    :"No bonds yet. Send a friend a private message to start one!";
  rows.forEach(({uid,r,rank,into,need})=>{
    const b=el("button","bondrow"); b.type="button";
    const f=el("span","face"); paintFace(f,cache.get(uid));
    const main=el("span","br-main"); main.append(el("span","br-name",nameOf(uid)), el("span","br-arc",(r.arcana||"Bond")+(rank>=10?" · MAX":` · ${into}/${need} to next`)));
    const bar=el("span","br-bar"), fill=el("i"); fill.style.width=(rank>=10?100:Math.round(100*into/Math.max(need,1)))+"%"; bar.append(fill); main.append(bar);
    const rk=el("span","br-rank",String(rank)); rk.prepend(el("small",null,"RANK"));
    b.setAttribute("aria-label",`${nameOf(uid)}: ${r.arcana||"Bond"}, rank ${rank}`);
    b.append(f,main,rk); b.onclick=()=>{ slFromList=true; show($("bondsSheet"),false); openSocialLink(uid); };
    box.append(b);
  });
}
$("openBonds").onclick=async()=>{
  show($("profile"),false); paintBondsList(); show($("bondsSheet"));
  await loadSocialLinks(); await ensureProfiles([...socialLinks.keys()]).catch(()=>{});
  if(!$("bondsSheet").classList.contains("hidden")) paintBondsList();
};
$("bondsClose").onclick=()=>show($("bondsSheet"),false);

/* ================= WHAT'S NEW =================
   HOW TO SHIP AN UPDATE: bump APP_VERSION and add a new entry at the TOP of CHANGELOG.
   Everyone who opens the app afterwards sees every entry they haven't seen yet, once. */

const CHANGELOG=[
  
    {v:"2026.10.20s", title:"See who's talking 🎙️", items:["🎙️ In calls, your mic button lights up while you speak (brighter when you're louder), so you know you're coming through.","🟨 In group calls, whoever's talking gets a glowing tile. In 1-on-1 calls, their picture glows."]},
    {v:"2026.10.20r", title:"Filter volume fix 🎧", items:["🎧 Filtering someone in a group call no longer makes them louder: same volume, less background noise."]},
    {v:"2026.10.20q", title:"Clearer group calls 📶", items:["📶 Group calls only show someone as LIVE once you can actually hear each other.","🔁 If a connection drops, NightLane tries a fresh route before giving up, and tells you if it can't connect (with a tip to try Wi-Fi) instead of sitting on \"Connecting…\".","🎧 The background-noise filter is stronger (tighter voice range, quieter gaps between words) and no longer makes people louder."]},
    {v:"2026.10.20p", title:"Filter background noise 🎧", items:["🎧 Group calls: someone's TV, fan or dog coming through? Tap 🎧 Filter on their tile to clean up their sound. Only you hear the change."]},
    {v:"2026.10.20o", title:"Video sending upgrades 🎬", items:["📶 A progress bar now shows how far along your photos and videos are while they send.","🎬 Send up to 3 videos at once: pick several, or tap + to add more. Each one arrives as its own message.","📷 Fixed: picking more photos while one was waiting no longer drops the first one."]},
    {v:"2026.10.20n", title:"Lane Chime on Android 🎵", items:["🎵 Android: want the Lane Chime even when NightLane is closed? Profile → Alerts has a quick how-to and a Save button."]},
    {v:"2026.10.20m", title:"No more missed messages 🔔", items:["🔔 Fixed: leaving NightLane open on your PC used to count every message as \"read\", so your phone stayed quiet. Now a message only counts as read when you're actually there (NightLane in front, and you've moved the mouse, typed or tapped in the last 2 minutes)."]},
    {v:"2026.10.20l", title:"NightLane's own sound 🎵", items:["🎵 New message sound: the Lane Chime, made just for NightLane.","📞 Incoming calls now ring with \"Night Drive\", our own ringtone, with the Lane Chime built in. Coded by Cole."]},
    {v:"2026.10.20k", title:"Smoother calls 📞", items:["🎙️ Voices come first: on a weak signal the video softens instead of the sound cutting out.","📶 A heads-up shows when the connection is struggling, and calls try to reconnect on their own after a short drop.","🎵 The dial tone plays again when you start a call (phones were muting it when the camera turned on)."]},
    {v:"2026.10.20j", title:"Tidier Alerts tab 🧹", items:["🧹 Removed an empty \"Translate\" heading from Profile → Alerts. Translation isn't switched on yet, so it shouldn't show."]},
    {v:"2026.10.20i", title:"Read in peace 📖", items:["📖 Scrolling up to catch up on missed messages no longer gets you thrown back to the bottom when new messages arrive out of order on a slow connection. A \"new messages\" pill shows instead.","🌧️ While you're scrolled up reading, screen effects (rain, confetti…) don't play over what you're reading."]},
    {v:"2026.10.20h", title:"No more Social Bond spam 💫", items:["💫 Fixed: after opening NightLane on a bad signal, you could get a pile of \"New Social Bond\" pop-ups for bonds you already had. Now a failed check is simply tried again later, and lots of updates at once show as one pop-up."]},
    {v:"2026.10.20g", title:"Bad signal? It tells you 📡", items:["📡 On a weak connection, NightLane no longer just sits on the loading screen or the date: after a few seconds it says \"Slow connection… still trying\" with a Try again button, and opens by itself as soon as it gets through.","⚡ On a weak signal, the installed app now opens from its saved copy after 3 seconds instead of hanging on the icon screen, and grabs the newest version in the background."]},
    {v:"2026.10.20f", title:"Quicker start on PC 💻", items:["💻 The computer start-up screen now lets you in by itself after about 3 seconds (a bar shows how long), and says clearly that you can click or press any key to enter."]},
    {v:"2026.10.20e", title:"Lanes, explained 🛣️", items:["🛣️ The Lanes tab now explains the difference: a Room is one chat, a Lane is your crew's home with several chats inside (like a Discord server, but simpler). Tap \"Rooms vs Lanes\" at the top of the tab."]},
    {v:"2026.10.20d", title:"Get the app 📲", items:["📲 New download page at nightlane.chat/download: one place to get NightLane on Android (Google Play), iPhone and computers, with a one-tap Install button where your browser allows it.","🔑 The sign-in screen now has a big Get the app button, and the Install sheet links to the full download page."]},
    {v:"2026.10.20c", title:"Lanes tab click 🔊", items:["🔊 The Lanes tab now makes the same click as Rooms, DMs and Friends when you switch to it."]},
    {v:"2026.10.20b", title:"New game: Blackout 🌑", items:["🌑 New game: Blackout! A bluffing game for 2–6 players (best with 3+). Everyone has 3 Neon tiles and 1 Blackout. Stack them face down, then call how many Neon you can flip without hitting a Blackout. Others raise or drop out, and the caller has to flip their own stack first.","⚡ Score 2 points to win, or be the last one with tiles. Find it in the ➕ Games tray."]},
    {v:"2026.10.20a", title:"Lighter and quicker to update ⚡", items:["⚡ Behind the scenes, NightLane's code is now split into smaller files. When an update comes out, your phone only downloads the parts that changed instead of the whole app again.","🖼️ Built-in pictures and sounds are saved on your phone once and reused, so updates are much smaller."]},
    {v:"2026.10.19m", title:"Longer level road 🛣️", items:["🛣️ New accounts unlock more as they level up, so there's less to take in on day one: 🎧 Radio at level 2, 📞 Calls at level 3, and making your own Lanes at level 5.","📞 You can always answer a call, join a group call or voice lounge, and hang out in a friend's Lane, whatever your level.","🙌 Accounts made before the level road keep everything."]},
    {v:"2026.10.19l", title:"Bigger Lane tabs 🛣️", items:["🛣️ On computers, the Lane side chat tabs at the top of a chat are a bit bigger, and they (and the \"is here\" bar) no longer get squashed flat."]},
    {v:"2026.10.19k", title:"Room themes on computers 🌌", items:["🌌 Room backgrounds on computers now match your phone: the Synthwave grid stays on the floor, the Sunset sun sits low, and the Burning city skyline is back at the bottom instead of hanging from the top.","✨ Stars on a computer now has its own twinkling starfield (it used to be a plain dark screen with the odd shooting star).","🔁 Spider-Verse and the ink map now follow your account, so your phone and computer stay in the same look.","💻 On computers, the top bar, the Transmit bar and the chat's scrollbar now reach all the way across the chat pane, with no open gaps at the sides."]},
    {v:"2026.10.19j", title:"Laptop fixes 💻", items:["💻 On computers: slim dark scrollbars everywhere instead of chunky white ones, and the \"is here\" bar no longer shows scroll arrows.","💻 Touch-screen laptops with a trackpad now get the full computer layout.","🕷️ Spider-Verse theme on computers: calmer background, plain yellow caption boxes, slimmer outlines and bigger text, so chats read cleaner.","🌙 Browsers with \"force dark pages\" (like Opera GX) no longer repaint NightLane's colors."]},
    {v:"2026.10.19i", title:"Lane looks 🎨", items:["🎨 Lanes get NightLane-style neon icons, plus emoji or your own uploaded picture.","🌆 Pick a Lane banner: Neon City, Night Drive, Moonrise, Rain, Static, Vapor, or upload your own.","📷 Side chats can have their own picture too, or a neon icon.","🔊 New side chat type: Voice lounge. It's a call that's always open, so you can hop in and out without pinging anybody, and see who's in from the Lanes tab.","✨ Screen effects now play for messages that arrive a little late (some iPhones missed them)."]},
    {v:"2026.10.19h", title:"Lanes 🛣️", items:["🛣️ New: Lanes! Make a hangout for your crew with side chats inside, like 🎮 Games, 🎬 Movies or 🎵 Music. Everyone in the Lane is in every side chat. Find it in the new Lanes tab.","⭐ The owner can make friends helpers, who can add, rename and remove side chats too. Anyone in the Lane can add their friends.","📦 Own a room? Move it into a Lane from Room settings and it becomes a side chat, messages and all."]},
    {v:"2026.10.19g", title:"Smoother games 🎮", items:["🎮 All games: when the server confirms a move you already see, the board no longer redraws, so card flips, dice rolls, tile and stone animations play all the way through instead of skipping to the end."]},
    {v:"2026.10.19f", title:"Mancala, smoother 🟤", items:["🟤 Mancala: the pits no longer jump to the final numbers mid-sow, and captures are easy to see: the stones leave both pits and fly into your store one by one, clicking as they land."]},
    {v:"2026.10.19e", title:"See every hop 👑", items:["👑 King's Court: each hop of a multi-jump now animates as you tap it, and your move no longer skips straight to the end when the server confirms it."]},
    {v:"2026.10.19d", title:"Game sounds 🔊", items:["🔊 Every game has sound now: card flicks and riffle shuffles (Crazy Eights, BS, Lucky 7), rattling dice (Liar's Dice), clacking tiles (Mahjong), slate stones (Go), and piece taps and capture pops (King's Court, Tic-tac-toe). Turn them off with Sounds in your Profile."]},
    {v:"2026.10.19c", title:"Slow it down 🐢", items:["👑 King's Court moves and replays play slower, so you can follow every hop.","🟤 Mancala shows your score (stones in your store) under your name instead of X and O.","🟤 Mancala: watch each stone hop pit to pit. The counts tick up as it lands, with a wooden click (and a clack when it hits other stones)."]},
    {v:"2026.10.19b", title:"King's Court rule 👑", items:["👑 King's Court: no jumping on your first TWO moves now (the first one still has to step into the Court). Thanks JKWrangler09!"]},
    {v:"2026.10.19a", title:"Music in the background 🎧", items:["🎧 The lofi radio now keeps playing when you switch to another tab or app (turn it off in Profile → Look if you'd rather it pause). The song also shows up in your computer's or phone's media controls, with play, pause and skip."]},
    {v:"2026.10.18z", title:"12-hour time 🕐", items:["🕐 Times now always show as 12-hour (3:05 PM), in your own time zone, even on computers set to a 24-hour language."]},
    {v:"2026.10.18y", title:"King's Court fix 👑", items:["👑 Fixed: chain jumps in King's Court left a copy of your piece on every square you landed on. Now the piece really moves. Start a rematch to get a clean board.","🏆 Instead of X and O under your names, King's Court now shows how many pieces each of you has captured, plus how many you have left. Thanks JKWrangler09!"]},
    {v:"2026.10.18x", title:"Cozy Lofi 🔥", items:["🔥 New radio station: Cozy Lofi, 12 warm lofi songs by Cristiano Leone. Find it next to Dust & Sunlight in Profile → Look → Lofi music."]},
    {v:"2026.10.18w", title:"My Music 📁", items:["👑 King's Court: the yellow outline of the last move now only shows while the move replays, then clears, and Replay works on older iPhones too.","📁 New: a My Music station on the 🎧 radio! Add songs from your own phone and NightLane shuffles them like the lofi stations. Your songs stay on your phone and are never uploaded. Find it in Profile → Look → Lofi music."]},
    {v:"2026.10.18v", title:"Replay fix ↺", items:["👑 King's Court: Replay no longer leaves extra pieces sitting on the board."]},
    {v:"2026.10.18u", title:"Clearer captures 👑", items:["👑 King's Court: when a piece gets jumped, the jumper now arcs higher over it and the captured piece flashes white and vanishes, so it doesn't look like it changed color."]},
    {v:"2026.10.18t", title:"Replay ↺", items:["👑 King's Court: when you open the board on your turn, it replays your opponent's last move so you can see what happened. Tap ↺ Replay last move to watch it again. Thanks JKWrangler09!"]},
    {v:"2026.10.18s", title:"Radio stations 📻", items:["📻 New: the 🎧 Lofi radio has stations! Pick 🌙 Night Lofi (made live in the app) or ☀️ Dust & Sunlight, real piano lofi by Gent Byci. Find it in Profile → Look. Songs shuffle, and Skip ⏭ jumps to the next one."]},
    {v:"2026.10.18r", title:"Group calls + screen share 📞🖥️", items:["👥 New: group calls in rooms! Tap 📞 in any room for a group voice or video call, up to 4 people. Everyone in the room gets a banner to join, and the call note in the chat has a Join button while it's going.","🖥️ New: share your screen during a video call (DMs and group calls). Sharing works from a computer, and phones can watch."]},
    {v:"2026.10.18q", title:"Name in the middle ✨", items:["✨ Names on profile cards now sit centered under the picture."]},
    {v:"2026.10.18p", title:"See yourself 👁️", items:["👁️ New: Profile → \"See how friends see you\" shows your profile card exactly the way friends see it. Thanks beef!"]},
    {v:"2026.10.18o", title:"Both on your profile 📡🃏", items:["📡🃏 Your own profile now shows your Night Signal next to your Arcana, just like friends see it."]},
    {v:"2026.10.18n", title:"Night Signal: change your mind 📡", items:["📡 Tapping an answer now just lights it up. Change it as much as you like, then tap NEXT. You can go BACK too."]},
    {v:"2026.10.18m", title:"Even smoother lofi 🎧", items:["🎧 The lofi music's vinyl static is now just a whisper."]},
    {v:"2026.10.18l", title:"Smoother lofi 🎧", items:["🎧 Less static in the lofi music, so the music comes through."]},
    {v:"2026.10.18k", title:"Lofi radio 🎧", items:["🎧 New: chill lofi music while you're in the app. Tap 🎧 at the top of your chats to turn it on or off, and set the volume in Profile → Look.","🌙 It plays forever without repeating, and goes quiet by itself during calls, voice notes and videos."]},
    {v:"2026.10.18j", title:"It's you 🪞", items:["🪞 The Me tab in your Profile now shows a tiny version of your own picture."]},
    {v:"2026.10.18i", title:"Quizzes tab 🧩", items:["🧩 Your Profile has a new Quizzes tab with 🃏 Who are you? and 📡 Night Signal in one place, plus your results."]},
    {v:"2026.10.18h", title:"Easier to read 👓", items:["📡 Night Signal questions use a bolder pixel font that's much easier to read."]},
    {v:"2026.10.18g", title:"The app grows with you 🌱", items:["🛣️ New: the Level road, in your Profile under your XP. See what unlocks as you level up.","⭐ Level perks for everyone: voice notes up to 3 minutes at level 6, and up to 5 minutes at level 10.","📡 Friends' profile cards now show their Night Signal.","🌱 New accounts start simple and unlock games, polls, the backlog, cards, habits and quizzes as they level up. Already here? You keep everything."]},
    {v:"2026.10.18f", title:"Night Signal polish 📡", items:["📡 Your Night Signal bars no longer get clipped by the angled edge of the screen."]},
    {v:"2026.10.18e", title:"Night Signal 📡", items:["📡 New: Night Signal! Profile → 📡 Night Signal. Answer 28 \"how likely are you to…\" questions and find your signal: Spark, Glow, Drift, Static, Beacon, Shade or Pulse.","🌙 After Hours: one last question after your result. Only you can ever see your answer.","↻ Retake it any time from your Profile."]},
    {v:"2026.10.18d", title:"Easier to spot 🔒", items:["🔒 Private backlog items now show a pink \"🔒 Private\" button, so you can tell at a glance what only you can see."]},
    {v:"2026.10.18c", title:"Just for you 🔒", items:["🔒 Tap 🔓 on anything in your Media Backlog to make it private. Only you can see it: friends won't see it on your backlog, and it won't show in the share list in chats. Tap 🔒 to make it public again."]},
    {v:"2026.10.18b", title:"Crop room pictures ✂️", items:["✂️ Changing a room picture now lets you crop it first, with a preview of how it looks. GIFs stay animated. Thanks Han!"]},
  {v:"2026.10.18a", title:"GIF banners + better GIF search 🎞️", items:["🎞️ Profile card → Banner → 🎞️ GIF: search for a GIF and make it your banner, no download needed.","🔍 GIF search now uses KLIPY (what Discord uses), with GIPHY as a backup."]},
  {v:"2026.10.17f", title:"GIF banners move again 🎞️", items:["🎞️ GIF banners on your profile card stay animated again. (Upload it again if yours froze.) Thanks Kennie!"]},
  {v:"2026.10.17e", title:"Secret tweak 🦁", items:["🦁 The Vol + Tron secret now hides behind just one name."]},
  {v:"2026.10.17d", title:"A new secret 🦁", items:["🦁 Two friends, one robot. There's a new secret hiding behind a name…"]},
  {v:"2026.10.17c", title:"Small fix 🔧", items:["🔧 Mutual friends and pet Partners no longer show up twice on a friend's profile. Thanks Beef!"]},
  {v:"2026.10.17b", title:"Status + mutual friends 🤝", items:["💞 Show off your boo: set your relationship status (Single, Taken, It's complicated…) in Profile → Profile card, and tag your partner. They get asked first, and the tag only shows once they say yes.","🤝 Tap a friend's picture to see the friends you have in common."]},
  {v:"2026.10.17a", title:"Partner tags 💞", items:["💞 Tag your partner on your profile: Profile → Profile card → Partner. They get asked first, and it only shows once they say yes.","🤝 Behind the scenes: NightLane can now find the friends you have in common."]},
  {v:"2026.10.16z", title:"Crop your banner ✂️", items:["✂️ Uploading a profile card banner now lets you crop it: drag, pinch or slide to zoom, and ⟳ to rotate.","👀 Both croppers (banner and profile photo) show a live preview of exactly how friends will see it."]},
  {v:"2026.10.16y", title:"Mahjong: no surprise throws 🀄", items:["🀄 Tapping a tile now only picks it. Nothing gets thrown away until you hit the Throw away button. Tap the picked tile again to put it back."]},
  {v:"2026.10.16x", title:"Easier to read 🕸️", items:["🕸️ Comic mode: your messages now always use black ink on the yellow caption box, even if you picked a custom bubble color."]},
  {v:"2026.10.16w", title:"Into another universe 🕸️", items:["🕸️ A new line is hiding in the chat that jumps your NightLane into a comic-book universe: halftone dots, off-register ink, sound effects when you send. Another two words bring you home.","💭 Friends typing show up as a comic thought bubble.","🎨 Do both to unlock the Multiverse frame. There's a bonus one-shot hiding too."]},
  {v:"2026.10.16v", title:"Footsteps on the map 👣", items:["👣 In ink-map mode, when a friend is typing you see their footprints walking across the map instead of \"is typing\". Footprints by Cole."]},
  {v:"2026.10.16u", title:"Up to no good 🗺️", items:["🗺️ There's an oath hidden in the chat that turns NightLane into an old ink map, just for you. Another two words fold it back up.","🪶 Do both to unlock the Ink & quill frame."]},
  {v:"2026.10.16t", title:"Something's in the water 🦈", items:["🦈 Four new secrets from a certain 1975 summer movie are hiding in the chat.","🌊 Find any two of them to unlock the new Shark frame."]},
  {v:"2026.10.16s", title:"He's real now 🐈‍⬛", items:["🐈‍⬛ The secret cat got redrawn from real life: fluffy, smoky and judging you slightly."]},
  {v:"2026.10.16r", title:"A new secret 🐈", items:["🐈 Someone very important to the Creator is hiding in the chat. Call him the way you'd call any cat…"]},
  {v:"2026.10.16q", title:"No double pop-ups 🔕", items:["🔕 While NightLane is open, new messages only show NightLane's own pop-up, not a phone notification on top of it (thanks jimmylikespie21!). Want both anyway? Turn on Phone notifications while NightLane is open in Profile."]},
  {v:"2026.10.16p", title:"Smarter notifications 👀", items:["👀 NightLane now knows which chat you have open, so it never sends your phone a notification for the chat you're reading. Close the app or switch chats and they come back right away."]},
  {v:"2026.10.16o", title:"Quieter notifications 🔕", items:["🔕 No more notification pop-ups for the chat you're already reading (thanks jimmylikespie21!)."]},
  {v:"2026.10.16n", title:"Mahjong fix 🀄", items:["🀄 Your hand no longer shows up twice for a moment after a move (thanks Kenny!)."]},
  {v:"2026.10.16m", title:"Small tweak 👁", items:["👁 HIDE on calls now only hides the buttons. The neon HUD, their name and the LIVE timer stay on screen."]},
  {v:"2026.10.16l", title:"Fixes 🀄", items:["🀄 Mahjong: your hand no longer runs off the side of the screen on phones. Tiles wrap onto two rows (thanks Kenny!).","🔔 iPhone: no more blank \"NightLane\" notifications while you're in the app. If one shows, it's the real message, with no sound."]},
  {v:"2026.10.16k", title:"Call upgrades 📹", items:["🔊 LOUD and QUIET actually sound different now: LOUD is about 3× louder, and quiet talkers get a real boost. You'll see a pop-up on both phones when it switches.","👁 Tap HIDE, or tap the video, to hide all the buttons. Tap anywhere to bring them back.","↔️ Drag your own video box to any corner, like FaceTime. It remembers where you put it.","🙌 Thanks to hachiware and Babygirl Fried Rice Legend for the ideas!"]},
  {v:"2026.10.16j", title:"Mic help 🎤", items:["🎤 If your phone won't let NightLane use the mic or camera for a call, you now get clear steps for your phone (iPhone, Android or computer) instead of an error code."]},
  {v:"2026.10.16i", title:"Small fix 📞", items:["📞 The Voice/Video call menu no longer hides behind a pinned message (thanks hachiware!)."]},
  {v:"2026.10.16h", title:"Notifications stay on 🔔", items:["🔔 Fixed notifications switching themselves off after updates (thanks Isaiah and Freddy!). If your phone ever drops them anyway, NightLane turns them back on by itself, or shows a one-tap bar to do it."]},
  {v:"2026.10.16g", title:"New game: Go ⚫", items:["⚫ Play Go on a 9×9 board: ＋ → Games → Go. Surround territory, capture stones, and pass when you're done.","👆 Tap a spot to preview your stone, then tap again to place it, so no more misplaced stones.","📖 Full rules are under How to play."]},
  {v:"2026.10.16f", title:"No more surprise zoom", items:["🔍 Double-tapping on iPhone no longer zooms the screen (in chats, menus or calls). Pinch zoom still works."]},
  {v:"2026.10.16e", title:"Call controls 🔊", items:["🔊 Video calls are now LOUD: your mic gets a boost so quiet talkers come through. When both cameras are off it switches to QUIET mode, for holding the phone up to your ear. Tap the speaker button to switch it yourself.","🔄 Flip between your front and back camera.","👾 Privacy glitch: stay on video, but they only see you as moving neon blocks, never your face.","🎵 New sounds for accepting, declining and hanging up, and the connect chime now plays when you pick up too."]},
  {v:"2026.10.16d", title:"Voice calls 🎧", items:["🎧 Tap 📞 in a DM and pick Voice call or Video call. Voice calls keep both cameras off and show their picture instead.","👆 Bigger call buttons (thanks Freddy!)."]},
  {v:"2026.10.16c", title:"iPhone call fix 📞", items:["📞 Calls now work on iPhone: the \"couldn't use your camera or mic\" error is fixed (thanks jimmy!). Voice messages on iPhone got the same fix.","📝 Call notes in the chat no longer say \"edited\"."]},
  {v:"2026.10.16b", title:"Call sounds 🎵", items:["🎵 Calling someone now plays a cyberpunk connecting tune while it rings, and an \"access granted\" chime when the call connects.","⬆ The LEVEL UP effect is now NightLane yellow."]},
  {v:"2026.10.16a", title:"Video calls 📞", items:["📞 You can now video call your friends! Open a DM and tap the 📞 at the top. Your friend's phone rings with Accept and Decline.","🎤 Mute and 📷 camera off during a call, with a LIVE timer.","📝 Every call leaves a note in the chat: how long it was, or a missed call with a Call back button.","Coded by Cole 🛠️"]},
  {v:"2026.10.15c", title:"Crop your profile pic ✂️", items:["✂️ Changing your profile photo now lets you crop it first: drag to move, pinch or slide to zoom, and the circle shows exactly how it'll look (thanks hachiware!)."]},
  {v:"2026.10.15a", title:"New game: Mahjong 🀄", items:["🀄 Mahjong Lite for 2–4 players: draw a tile, throw one away, and be the first to collect 4 sets and a pair. Tap ＋ → Games.","🧠 Never played? Your hand sorts itself into sets, ★ marks good tiles to throw away, and it tells you when you're one tile from winning (and which tiles you need).","🀄 Someone throws away the tile you need? Hit MAHJONG! to grab it and win.","Tile art by natonato, recolored for NightLane."]},
  {v:"2026.10.14c", title:"Tidier chat lists 🧹", items:["🧹 Rooms and DMs got the Friends tab treatment: chats quiet for 2+ weeks fold into a 💤 Quiet section at the bottom (a new message brings them right back up).","🔍 Got 8+ chats? A search box shows up to find one fast.","📬 Tap Unread to see only the chats waiting on you."]},
  {v:"2026.10.14b", title:"Question of the day fix ❓", items:["❓ Once you answer the Question of the Day in a chat, its bar disappears from that chat for the rest of the day, even if you answered from another device.","✨ Answering the Question of the Day now gives +15 XP (once a day)."]},
  {v:"2026.10.14a", title:"Pixel glow-up ✨", items:["🎆 Winning a game now pops a pixel \"You Won!\" with neon fireworks, and the winner gets a little spinning crown.","💥 Lucky 7 BUSTs explode, LUCKY 7 says WOW, and level-ups get a pixel LEVEL UP.","🥚 Partner evolutions warp and sparkle (shinies shimmer extra), new friends get a heart burst, and your daily XP drops coins.","🗝️ Unlocks, achievements and level-ups have pixel item icons now.","🖥️ The PC terminal and game scores use a crisp pixel font.","Credits: effects by unTied Games, icons by Quintino Pixels, font by datagoblin."]},
  {v:"2026.10.13f", title:"Back button fix ⬅️", items:["⬅️ Opening a chat from a notification (like the Owl's \"your turn\" ping) and then pressing Back on Android now takes you to your chat list instead of closing the app."]},
  {v:"2026.10.13e", title:"Pins menu 📌", items:["📌 Got more than one pin? Tap the \"1/3 ▾\" on the pin bar to see them all at once and jump straight to any game or message. Games waiting on you are highlighted (thanks hachiware!)."]},
  {v:"2026.10.13d", title:"Lucky 7 fix 🍀", items:["🃏 The card you just flipped now stays face up next to the deck, so you always see what you got, even when it ends the round (thanks hachiware!).","🛡️ Flip a 2nd Shield? It now goes to the next player who doesn't have one, instead of quietly vanishing.","📋 Round results show everyone's cards from that round."]},
  {v:"2026.10.13c", title:"Games list fix 🎮", items:["🎮 The Games list in ＋ scrolls again, so you can reach every game on smaller phones (thanks hachiware!).","➕ The ＋ menu tabs sit in two tidy rows instead of squishing together."]},
  {v:"2026.10.13b", title:"New card art 🃏", items:["🃏 Crazy Eights and BS got a real pixel-art deck in NightLane colors, with a matching neon card back. Card art by art-bickles."]},
  {v:"2026.10.13a", title:"New game: Lucky 7 🍀", items:["🍀 Lucky 7 for 2–8 players: flip cards for points, but a repeat number busts you! Get 7 different numbers for LUCKY 7. Shields, Freezes and Doubles keep it wild. First to 150 wins (thanks temmie!). Tap ＋ → Games.","⚡ Crazy Eights Wild rematches now stay Wild."]},
  {v:"2026.10.12e", title:"Crazy Eights: Wild mode ⚡", items:["⚡ New Wild mode for Crazy Eights: Jacks skip, Queens reverse, 2s make the next player draw 2, and Wild +4 cards. Stack a 2 on a 2 (or a +4 on a +4) to pass it on!","☝️ Down to one card? Hit \"Last card!\" fast, or anyone can catch you for +2. The host picks Classic or Wild before dealing (thanks temmie!)."]},
  {v:"2026.10.12d", title:"Dice looks 🎲", items:["🎲 Pick how your Liar's Dice look: NightLane, Classic, Crimson, Cobalt, Toxic, Volt, Steak 🥩 or Ghost 👻. Everyone at the table sees your dice in your style. Open a Liar's Dice game → 🎨 Dice look."]},
  {v:"2026.10.12c", title:"Join your friends 🚪", items:["🎲 Roll chips under messages now show the real die you rolled (a little d20 for d20s).","🚪 Tap someone in the online list (or their picture anywhere): if they're in a room you're also in, a Join them button takes you straight there (thanks jimmylikespie21!)."]},
  {v:"2026.10.12b", title:"Pixel dice 🎲", items:["🎲 All the dice got a pixel makeover in NightLane colors: \"roll a d20\", d4 through d100, and Liar's Dice. Dice art by LullabyJazz."]},
  {v:"2026.10.12a", title:"Partners 🥚", items:["🥚 Everyone gets a pixel partner! It hatches from an egg and evolves as you chat: Egg → Baby → Rookie → Champion → Ultimate.","⚡💗✨🌙 How you chat decides what it becomes: games and shinies (Power), replies and reactions (Heart), photos and voice notes (Spirit), or late nights (Shadow).","💎 Shiny messages are collected in your Shinydex, and shiny partners exist… Profile → 🧑 Me → My Partner."]},
  {v:"2026.10.11f", title:"Creator frame, cleaner 👑", items:["👑 The Creator frame is calmer now: one corner icon that cycles through its four favorites."]},
  {v:"2026.10.11e", title:"Theme fix 🎨", items:["🎨 Theme & colors opens again (thanks kennie!)."]},
  {v:"2026.10.11d", title:"Creator frame 👑", items:["👑 The person who made NightLane now has his own one-of-a-kind frame. Spot it around the app."]},
  {v:"2026.10.11c", title:"Ride or Die 🤜🤛", items:["🤜🤛 New Ride or Die frame for your best friends and bros. It unlocks at Social Bond rank 5, right next to the Bonded frame (now called Lovers 💞). Pick whichever fits in Theme & colors."]},
  {v:"2026.10.11b", title:"PDF fix 📄", items:["📄 PDFs open properly now instead of showing a \"Bucket not found\" page (thanks Malcolm!)."]},
  {v:"2026.10.11a", title:"Backlog glow-up 📚", items:["▦ Grid view: see your backlog as a poster wall. Tap a cover to open it.","📚 Books and 📖 Manga: search and add them with covers, and track pages or chapters.","📥 Import your Letterboxd, Goodreads or IMDb lists in one go. Covers fill in by themselves. (Thanks beef!)"]},
  {v:"2026.10.10b", title:"Tidier friends list ⭐", items:["⭐ Star friends to pin them at the top of your list.","🟢 Friends who are online now show first. Offline friends fold into their own section.","🔍 Got lots of friends? A search box finds anyone fast."]},
  {v:"2026.10.10a", title:"Share PDFs 📄", items:["📄 Send PDFs in any chat: tap ＋ then 📄 PDF. Friends tap it to open (up to 20 MB)."]},
  {v:"2026.10.09l", title:"A tidier Profile 🗂️", items:["🗂️ Profile is now split into 4 tabs: 🧑 Me, 🎨 Look, 🔔 Alerts and ⚙️ Account. It remembers the one you used last.","🔘 On/off settings are real switches now.","📷 Tap your picture to change it."]},
  {v:"2026.10.09k", title:"My Social Bonds 💫", items:["💫 See every Social Bond you have in one place, strongest first, with each one's arcana, rank and progress. Profile → My Social Bonds. Tap one to see what it means."]},
  {v:"2026.10.09j", title:"Social links 🔗", items:["🔗 Add your Discord, Instagram, TikTok, YouTube, Twitch, X, Steam, GitHub or website to your profile card (Profile → Profile card → Social links). Friends tap them on your profile (thanks beef!)."]},
  {v:"2026.10.09i", title:"Your colors, everywhere 🎨", items:["🎨 Log out and Delete my account now follow your Highlight color too (thanks beef!)."]},
  {v:"2026.10.09h", title:"Mark all as read ✓", items:["✓ New \"Mark all as read\" button above your chats: clears every unread number, the app icon number and your phone notifications without opening each chat."]},
  {v:"2026.10.09g", title:"No double notifications 🔕", items:["🔕 While NightLane is open on your screen, you just get its own pop-ups instead of a phone notification too. Want both? Profile → Notifications & effects → Phone notifications while NightLane is open."]},
  {v:"2026.10.09f", title:"Smarter notifications 🔔", items:["🔔 Read a chat on your PC? Your phone's notification now only shows what's actually still unread, and doesn't buzz at all for messages you already saw."]},
  {v:"2026.10.09e", title:"Edit notes ✏️", items:["✏️ Edited messages now show a small \"✏️ edited this\" note right on the message, so everyone can tell it was changed."]},
  {v:"2026.10.09d", title:"Enter to save edits ⌨️", items:["⌨️ On a computer, press Enter to save an edited message (Shift+Enter for a new line, Esc to cancel), just like sending."]},
  {v:"2026.10.09c", title:"Pronouns 🏷️", items:["🏷️ Add your pronouns to your profile: Profile → Profile card. Pick one or type your own, and friends see it under your name."]},
  {v:"2026.10.09b", title:"Browser help 🧭", items:["🧭 Using a browser that can't do notifications (like Opera GX)? NightLane now tells you exactly what to do instead of just \"not supported\": open it in Chrome or get the Play Store app."]},
  {v:"2026.10.09a", title:"Two fixes 🔧", items:["⌨️ Typing a long message no longer makes you look offline for a moment. If you're typing, you show as online.","✨ Effects and secrets you already saw no longer pop up as \"missed\" when you come back to a chat from a notification."]},
  {v:"2026.10.08f", title:"Sideways scroll fix 🔧", items:["🔧 Fixed chats scrolling sideways when someone replied to a long message or link. Sorry about that!"]},
  {v:"2026.10.08e", title:"Profile cards 🪪", items:["🪪 Dress up your profile: pick a banner (or upload your own picture), an animated effect like sparkles or snow, and up to 3 stickers. Friends see it when they tap your picture. Profile → Profile card."]},
  {v:"2026.10.08d", title:"! fix ❗", items:["❗ The ! burst on your own long messages and replies no longer gets pushed off the edge of the screen."]},
  {v:"2026.10.08c", title:"Private profiles 🔒", items:["🔒 Your profile, status and birthday are now only visible to your friends and people you share a chat with. Strangers can only find you by typing your exact username, and they only see your name and picture."]},
  {v:"2026.10.08b", title:"More fun, every day 🎲", items:["✨ A quick tour of the fun stuff: secret words you can try right away, the games in every chat, and Social Bonds. Replay it anytime from Tips.","❓ Every chat gets a question of the day. Tap Answer to reply to it.","🎮 Fridays are game night: one tap opens the games.","🎲 The new 🎲 button gives you something fun to try: an effect word, a game, a secret hunt hint, or your bond rank."]},
  {v:"2026.10.08a", title:"Status timers ⏱️", items:["⏱️ Pick when your status clears itself: 30 minutes, 2 hours, 4 hours, 24 hours, or never. Your own status shows how long it has left."]},
  {v:"2026.10.05c", title:"About & Contact pages 📄", items:["📄 New About and Contact & Support pages, plus a footer on the sign-in screen, Terms and Privacy with links to all of them and our support email."]},
  {v:"2026.10.05b", title:"Icon number test 🔢", items:["🔢 New button in Profile → Notifications: \"Test the number on my app icon\". It shows a test number so you can see if your phone or PC displays it, and tells you what to fix if not."]},
  {v:"2026.10.05a", title:"Better on bad Wi-Fi 📶", items:["📶 On a weak connection, messages keep trying to send for a few seconds instead of failing right away, and they never send twice.","🔄 If the live connection drops, NightLane keeps pulling in new messages and reconnects by itself, so chats don't freeze."]},
  {v:"2026.10.04n", title:"Away status 💤", items:["💤 If someone hasn't touched NightLane for 2 minutes (or put it in the background), they show as offline with \"away · last seen 3m ago\". As soon as they're back, their green light comes back."]},
  {v:"2026.10.04m", title:"PC unread fix 💻", items:["💻 On PC, the unread number next to a chat now clears as soon as you read it, and its notifications go away too."]},
  {v:"2026.10.04l", title:"Holiday look on PC 🎃", items:["🎃 On PC, holidays now get their own pixel-art look: little pixel sprites and a typed terminal line under the date. Halloween, Thanksgiving, winter, New Year's, Valentine's, St. Patrick's, Easter and the 4th of July."]},
  {v:"2026.10.04k", title:"No more install nag 📲", items:["📲 Once NightLane is installed on your PC or phone, the \"Install NightLane as an app\" link goes away."]},
  {v:"2026.10.04j", title:"PC tips 💻", items:["💻 Tips now explain how to install NightLane on a PC and get notifications working there."]},
  {v:"2026.10.04i", title:"Question mark fix ❓", items:["❓ The ? on your own questions pops out on top of your picture frame again instead of hiding behind it."]},
  {v:"2026.10.04h", title:"Online light fix 🟢", items:["🟢 A friend's online light no longer hides behind their message when it ends in ! or ?."]},
  {v:"2026.10.04g", title:"See who reacted 👀", items:["👀 Hold down on a reaction under a message to see who sent it. You can also double-tap a message and pick \"See who reacted\"."]},
  {v:"2026.10.04f", title:"Reset your friend link 🔄", items:["🔄 New \"Reset my friend link\" button in Friends. Shared your link with the wrong person? Make a new one and the old link stops working."]},
  {v:"2026.10.04e", title:"Clearer voice messages 🎙️", items:[
    "🎙️ Voice messages record as one smooth clip at higher quality, so they don't sound choppy anymore.",
  ]},
  {v:"2026.10.04d", title:"Shared movies fix", items:[
    "🎬 A movie you share as Completed now says \"Watched\" in the chat (it wrongly said \"Not watched yet\").",
  ]},
  {v:"2026.10.04c", title:"Your own posters 🖼️", items:[
    "🖼️ Add your own poster or cover to anything in your backlog: tap 🖼️ on the item, or add one when you add a movie.",
    "🎬 Share it and your friends see your poster too.",
    "🎞️ Movies are now added by hand (movie search is gone).",
  ]},
  {v:"2026.10.04b", title:"Statuses show up for friends", items:[
    "💭 Opening someone's profile or your Friends list now grabs their latest status, so you always see what friends just set.",
  ]},
  {v:"2026.10.04a", title:"Status updates 💭", items:[
    "💭 Set a status! Tap \"Set a status\" under your name in Profile, pick a quick one (🎮 Gaming, 📚 Studying, 😴 Sleeping…) or write your own.",
    "👀 Friends see your status on your profile and in their Friends list, with how long ago you set it.",
  ]},
  {v:"2026.10.03h", title:"No more accidental taps", items:[
    "👆 Press and hold a message to open its options, then lift your finger. The menu won't react to the finger that opened it, so you can't hit Report or Copy by accident.",
  ]},
  {v:"2026.10.03g", title:"E-cards 💌", items:[
    "💌 Send a card! Tap + → Card, pick a design (birthday, congrats, get well, holidays, and more), write a message, and send.",
    "✉️ Your friend gets a sealed envelope in the chat. They tap it to open the card.",
  ]},
  {v:"2026.10.03f", title:"Tidier holiday stickers", items:[
    "🎃 Holiday stickers on the home screen are smaller and sit in the corners, so they don't cover the date anymore.",
  ]},
  {v:"2026.10.03e", title:"Holiday date stamps 🎄", items:[
    "🎄 The date stamp now dresses up for more holidays: Thanksgiving, winter holidays, New Year, Valentine's, St. Patrick's, Easter, and the Fourth of July.",
  ]},
  {v:"2026.10.03d", title:"Halloween vibes 🎃", items:[
    "🎃 The date stamp dresses up for Halloween all October.",
  ]},
  {v:"2026.10.03c", title:"Notifications troubleshooting added to the Tips", items:[
    "🔔 Added troubleshooting tips for notifications in the Tips section.",
  ]},
  {v:"2026.10.03b", title:"Smoother level ups", items:[
    "⬆ If you level up while a secret effect is playing, the LEVEL UP now waits until the effect is done instead of piling on top of it.",
  ]},
  {v:"2026.10.03a", title:"Don't forget ⌚", items:[
    "⌚ Open NightLane on October 3rd for a little surprise.",
  ]},
  {v:"2026.10.02h", title:"Bond styles 💞", items:[
    "💞 Your Social Bond with a friend now unlocks styles for your DM with them. Open the DM → Room → Bond styles.",
    "🔥 Backgrounds: Campfire (rank 3), Twin Stars (rank 6), and Constellation (rank 9).",
    "💗 Matching bubbles for both of you: Synced (rank 4) and Heartline (rank 7).",
    "🤝 Max rank (10) unlocks a Duo sticker only you two can send each other.",
  ]},
  {v:"2026.10.02g", title:"Movie posters 🎞️", items:[
    "🎞️ + Movies now searches real movies, with posters and the year. Movie info comes from TMDB.",
  ]},
  {v:"2026.10.02f", title:"Movies & TV 🎬", items:[
    "🎬 Your Media Backlog now holds TV shows and movies, not just games and anime. Tap + TV to search for shows, with posters and episode counts.",
    "✅ Movies get a simple Mark as watched button instead of hours or episodes. Add movies by hand for now. Movie search is on the way.",
  ]},
  {v:"2026.10.02e", title:"Spooky season 🎃", items:[
    "👻 Boo! and the ghost hunt got real pixel-art ghosts, outlined in NightLane neon.",
    "🎃 Four new Halloween secrets are hiding in the vault. Happy hunting!",
  ]},
  {v:"2026.10.02d", title:"Real high fives ✋", items:[
    "✋ Say \"high five\" while friends are in the chat and they get a High five back! button. If they tap it in time, you both get a big NICE! slap and your Social Bond grows.",
    "😅 Nobody tapped? You'll know you were left hanging.",
  ]},
  {v:"2026.10.02c", title:"Cleaner date stamp 🗓️", items:[
    "🗓️ The big date on the home screen now spaces itself out for two-digit months like 10, 11, and 12, so the slash sits neatly between the month and day.",
  ]},
  {v:"2026.10.02b", title:"Real dates 📆", items:[
    "📆 Dates in messages (\"tonight\", \"Friday\", \"Oct 12\") now show a little calendar with the actual day, instead of the phone's calendar emoji that always says July 17.",
    "🗓️ \"Tomorrow\" in an older message now means the day after it was sent, both on the little calendar and when you add it to your calendar.",
  ]},
  {v:"2026.10.02a", title:"A better look at photos 🔍", items:[
    "🔍 Tap a photo for a full-screen view with nothing covering it. Pinch or double-tap to zoom in, and drag to look around. On a computer, scroll to zoom.",
    "👉 In albums, swipe left or right (or use the arrows at the bottom) to see the next photo.",
  ]},
  {v:"2026.10.01b", title:"Say something about it 💬", items:[
    "💬 When you share something from your backlog, you can add a message with it, like \"you HAVE to play this\". It shows right under the card.",
  ]},
  {v:"2026.10.01a", title:"Preview your GIFs 🎞️", items:[
    "🎞️ Tapping a GIF now shows it big first, so you can make sure it's the right one. Add a message under it if you want, then hit Send. Thanks to jimmylikespie21 for the idea!",
  ]},
  {v:"2026.09.30m", title:"Accessibility ♿", items:[
    "🔠 Profile → 🎨 Look → Text size: make messages, the typing box, and your chat list smaller or bigger.",
    "🎞️ Animations now has a Less motion choice that calms things down even if your device isn't set to reduce motion.",
    "🎨 Color-blind friendly mode: online, away, and do-not-disturb dots get different shapes and easier-to-tell colors.",
  ]},
  {v:"2026.09.30l", title:"Double-tap to react 👆👆", items:[
    "👆👆 Double-tap a message to react. Just the emoji pop up, nothing else.",
    "✋ Press and hold a message (or right-click on a computer) for reply, pin, report, and the rest. A single tap does nothing now, so no more accidental menus.",
  ]},
  {v:"2026.09.30k", title:"Fix your typos ✏️", items:[
    "✏️ Made a typo? Press and hold your own message, then Edit message. Everyone sees the new version, marked \"edited\".",
  ]},
  {v:"2026.09.30j", title:"Share your backlog 🎮", items:[
    "🎮 Tap ➕ in any chat, then Backlog, to share a game or anime from your backlog right there.",
  ]},
  {v:"2026.09.30i", title:"Say hi to newcomers 👋", items:[
    "👋 New visitors now see a \"What is NightLane?\" box on the login screen that explains what the app is about.",
  ]},
  {v:"2026.09.30h", title:"Stats that stick 📈", items:[
    "📈 Removing a habit no longer takes away the stat points you earned from it. Anything you lost this way is back.",
  ]},
  {v:"2026.09.30g", title:"Rules of the road 📜", items:[
    "📜 NightLane now has a Privacy Policy and Terms of Service. Find them on the login screen and at the bottom of your Profile.",
    "🔑 Forgot your password and have no recovery code? Email support@nightlane.chat for help.",
    "🖥️ On computers, the date no longer bumps into the Log in / Sign up tabs.",
  ]},
  {v:"2026.09.30f", title:"Safety upgrades 🛡️", items:[
    "🛡️ Behind-the-scenes improvements to how reports get handled.",
  ]},
  {v:"2026.09.30e", title:"Easier to find ➕", items:[
    "➕ The more-reactions button now fits on every phone instead of hiding off the edge.",
  ]},
  {v:"2026.09.30d", title:"React with anything 😎", items:[
    "😎 Tap ➕ next to the quick reactions to pick from lots more emoji, or use any emoji from your keyboard.",
    "🕘 Emoji you use show up under Recent for next time. Thanks to jimmylikespie21 for the idea!",
  ]},
  {v:"2026.09.30c", title:"Long messages fixed 📝", items:[
    "📝 Really long messages no longer spill text outside the bubble's corners.",
  ]},
  {v:"2026.09.30b", title:"One hint a day 🔍", items:[
    "🔍 The daily secret hint is now truly one a day. Finding a secret won't unlock another hint until tomorrow.",
  ]},
  {v:"2026.09.30a", title:"Easier new rooms 🚪", items:[
    "🚪 \"Make a new room\" now makes it and takes you straight in, in one tap. Then use Room → ＋ Add friends to bring people in.",
  ]},
  {v:"2026.09.29d", title:"Reports review", items:[
    "A way to view the reports.",
  ]},
  {v:"2026.09.29c", title:"Samsung photo fix 📷", items:[
    "📷 Photos from Samsung phones (and iPhones) saved in HEIC format now send properly. NightLane converts them for you.",
  ]},
  {v:"2026.09.29b", title:"Report fix 🛠️", items:[
    "🛠️ Reports now send properly.",
  ]},
  {v:"2026.09.29a", title:"Reporting Added 🚩", items:[
    "🚩 See something not okay? Tap a friend's message → Report, pick a reason, and send. Only the admin sees reports.",
  ]},
  {v:"2026.09.27n", title:"Secret cleanup 🧹", items:[
    "🧹 Retired a couple of secrets. Your found count only counts secrets that still exist.",
  ]},
  {v:"2026.09.27m", title:"A new look for an old world line ⚙️", items:[
    "⚙️ One of the Steins;Gate secrets got a brand-new animation. Find the right world line to see it…",
  ]},
  {v:"2026.09.27l", title:"Add friends to rooms 👋", items:[
    "👋 Add friends straight into a room, no link needed: Room settings → ＋ Add friends, then tap who to add.",
    "🔔 Friends you add get a notification, and a little note shows up in the chat.",
  ]},
  {v:"2026.09.27k", title:"Catch up on effects ✨", items:[
    "✨ Missed some effects while you were away? When you open the chat, NightLane offers to play them for you, secrets and regular effects like 💥 Boom.",
  ]},
  {v:"2026.09.27j", title:"Small fix ❓", items:[
    "❓ The ? and ! on friends' messages no longer hide behind their name tag.",
  ]},
  {v:"2026.09.27i", title:"El Psy Kongroo 🔬", items:[
    "🔬 Eight new secrets are hiding in the chat for lab members. Some of them involve a microwave…",
    "⚙️ A new theme, Divergence, is waiting at the end of the right world line. Find it to unlock it.",
  ]},
  {v:"2026.09.27h", title:"Secrets on every screen 🎞️", items:[
    "🎞️ Secrets and animations not playing on your computer? Your device may be set to reduce motion. Profile → 🎨 Look → Animations: Always play turns them back on.",
  ]},
  {v:"2026.09.27g", title:"Defenders of the universe 🦁", items:[
    "🦁 Seven new secrets are hiding in the chat for paladins. Patience yields focus…",
  ]},
  {v:"2026.09.27f", title:"Two fixes 🛠️", items:[
    "🔒 \"You missed a secret\" no longer offers secrets you've already found.",
    "🖼️ Fixed Room settings getting cut off on the right after adding a room picture.",
  ]},
  {v:"2026.09.27e", title:"Room pictures & time zones 🖼️", items:[
    "🖼️ Rooms can have their own picture now: Room settings → Room picture.",
    "🕗 When a friend in another time zone says a time like \"8pm\", you'll see it in your own time too.",
    "🎨 When someone changes a room's background or picture, a little note shows up in the chat.",
    "🟢 The new online-status shapes show their real shape in the picker, and there are 8 new bubble colors.",
  ]},
    {v:"2026.09.27d", title:"New Tips page on profile", items:[
    "Profile → 💡 Tips, or from the Welcome screen",
  ]},
   {v:"2026.09.27c", title:"Welcome Intro added 🦉", items:[
    "New welcome intro for new users/users who haven't seen it yet, explaining what NightLane is and how to get started.",
    "Tap Find my friends on the welcome screen to jump straight to adding friends.",
  ]},
  {v:"2026.09.27b", title:"Quick fix 🛠️", items:[
    "Fixed the Recovery code button in Profile.",
    "Added Malcolm to the bug hunters in Credits. Thanks!",
  ]},
  {v:"2026.09.27a", title:"Credits! 🌃", items:[
    "A new credits page shows who made NightLane, and what they did. Open Profile and tap 🌃 Credits to see it.",
    "Thanks to everyone who helped make NightLane possible, and to the people who inspired it!",
  ]},
  {v:"2026.09.26z", title:"18 new secrets 🎬", items:[
    "🎬 Eighteen new secrets are hiding in the chat, based on a bunch of anime lines someone quotes way too often.",
    "👀 …and one more, for when something is right behind you. Isn't it?",
    "🙌 Thanks to jimmylikespie21 for the ideas!",
  ]},
  {v:"2026.09.26y", title:"Glow-up: frames, dots & backgrounds ✨", items:[
    "🖼️ 8 new profile frames to unlock: Circuit, Frost, Thunder, Galaxy, Sakura, Spiral, Shadow, and Heartbeat.",
    "🟢 7 new online-status shapes: moon, square, triangle, bolt, sparkle, plus, and a pulsing dot.",
    "🌌 Chat backgrounds are livelier (shooting stars, lightning, a synthwave sun…) and there are 7 new ones: Ocean, Snowfall, Fireflies, Nebula, plus Sakura, Lava, and Café to unlock.",
    "🛠️ Fixed the online dot getting stuck behind some frames' decorations.",
  ]},
  {v:"2026.09.26x", title:"Spiral power 🌀", items:[
    "🌀 Seven new secrets are hiding in the chat. Kick reason to the curb, believe in yourself, and you might find them all…",
  ]},
  {v:"2026.09.26w", title:"Mwah 😘", items:[
    "😘 Say \"mwah\" (or send 😘 / 💋) and a kiss flies from your picture to theirs. In a DM it goes to the other person; in a room, to whoever you're replying to (or whoever spoke last).",
  ]},
  {v:"2026.09.26v", title:"Small fix ✍️", items:[
    "✍️ Fixed a couple of secret captions getting cut off on narrow phones.",
  ]},
  {v:"2026.09.26u", title:"One more secret 🌸", items:[
    "🌸 Another secret just bloomed in the chat…",
  ]},
  {v:"2026.09.26t", title:"More secrets + a new theme 🍡", items:[
    "🔍 Two more secrets are hiding in the chat, one of them very cute.",
    "🍡 Find the cute one to unlock the soft, pastel Mochi theme.",
  ]},
  {v:"2026.09.26s", title:"11 new secrets 👀", items:[
    "🔍 Eleven new secrets are hiding in the chat, inspired by one of our friends' favorite references: anime, horror, and a little physics.",
    "🙌 Thanks to Rice for the ideas!",
  ]},
  {v:"2026.09.26r", title:"Small fix ❓", items:[
    "❓ The ? and ! marks on messages show in front of profile frames again.",
  ]},
  {v:"2026.09.26q", title:"Unread count on the app icon 🔴", items:[
    "🔴 NightLane's icon now shows how many unread messages you have, on iPhone (Home Screen app) and computers.",
    "🤖 On Android, the icon shows a dot from your notifications. Samsung phones can show the number too: Settings → Notifications → App icon badges → Show with number.",
    "🛠️ Fixed long messages in Profile (like after sending a test notification) spilling over the Log out button.",
    "🙌 Thanks to jimmylikespie21 for the idea!",
  ]},
  {v:"2026.09.26p", title:"Fresh coat of paint 🎨", items:[
    "🎨 A few older secrets got brand-new original artwork. Same words, new surprises.",
    "☢️ The Pip-Boy theme is now called Wasteland. Same green glow, and if you were using it, you still are.",
  ]},
  {v:"2026.09.26o", title:"Frames fixed ✨", items:[
    "🖼️ Profile frames actually show up now, and they all got an upgrade: neon glow, RGB glitch, real flames, calling-card layers, 8-bit pixels, shining gold, a rainbow Mythic, and more.",
    "🙌 Thanks to Han for the reminder!",
  ]},
  {v:"2026.09.26n", title:"What's my Arcana mean? 🃏", items:[
    "🃏 Tap any Arcana, yours in Profile or a friend's on their card, to see what it means: what the card stands for in tarot, what it says about the person, their superpower, and their blind spot.",
    "🤝 Your Social Bonds explain themselves too: open one to see what its card says about your friendship.",
  ]},
  {v:"2026.09.26k", title:"7 new secrets 👀", items:[
    "🎮 Seven new secrets are hiding in the chat: some for gamers who've been down in the tunnels, crossed blades, or cooked meat on a spit…",
    "🩸 …and some for horror fans. Check the hints if you get stuck.",
  ]},
  {v:"2026.09.26j", title:"A new secret 🚬", items:[
    "🎖️ There's a new secret hiding in the chat. Old soldiers might know the words…",
  ]},
  {v:"2026.09.26i", title:"BS fix 🛠️", items:[
    "🛠️ Fixed BS sometimes playing your picked cards by accident when someone else called BS while you were choosing. The table no longer jumps under your finger.",
  ]},
  {v:"2026.09.26h", title:"Games stay on top 📌", items:[
    "📌 Games in progress now pin themselves to the top of the chat, and unpin when they're over. No more scrolling up to find them.",
    "🎮 Tap a pinned game to jump straight into it. Games waiting on you glow and show up first.",
  ]},
  {v:"2026.09.26g", title:"New game: BS 🃏", items:[
    "🃏 BS is here for big groups (2–8 players): ＋ → Games → BS.",
    "🤥 Play cards face down and claim the rank. Lie if you want. Anyone can call BS! and whoever's wrong picks up the pile.",
  ]},
  {v:"2026.09.26f", title:"New game: Mancala 🟤", items:[
    "🟤 Play Mancala, one of the oldest games in the world: ＋ → Games → Mancala.",
    "🪨 Sow stones around the board, land in your store for an extra turn, and capture your opponent's stones. Most stones wins!",
  ]},
  {v:"2026.09.26e", title:"Games come alive 🎬", items:[
    "👑 King's Court: pieces slide and hop across the board, captured pieces pop, and stepping into the Court sparkles. You can see your opponent's moves happen now.",
    "🎲 Liar's Dice: dice tumble when you roll, bids slam in, LIAR! stamps the table, and the reveal flips everyone's dice one by one.",
  ]},
  {v:"2026.09.26d", title:"Crazy Eights feels like cards 🃏", items:[
    "🃏 Cards now fly out of the deck when they're dealt, zip to the pile when played, and slide into your hand when you draw.",
    "✋ Your hand fans out like real cards, and playable ones lift and glow. Play an 8 and the new suit bursts onto the table.",
  ]},
  {v:"2026.09.26c", title:"New game: Liar's Dice 🎲", items:[
    "🎲 Bluff your friends in Liar's Dice (2–6 players): ＋ → Games → Liar's Dice.",
    "🤥 Bid on everyone's hidden dice, 1s are wild, and call Liar! when you don't buy it. Last one with dice wins.",
  ]},
  {v:"2026.09.26b", title:"How to play 📖", items:[
    "📖 Every game now has simple rules: tap \"📖 How to play\" on any game, or \"Rules\" in the Games tray.",
    "👋 Opening a game you've never played? The rules pop up on their own.",
  ]},
  {v:"2026.09.26a", title:"New game: Crazy Eights 🃏", items:[
    "🃏 Play Crazy Eights with 2–6 friends: ＋ → Games → Crazy Eights. Friends tap Join, then deal.",
    "🎴 Match the suit or number. 8s are wild. First to empty their hand wins!",
    "⏭️ Someone gone quiet? After 2 minutes on their turn, anyone can skip them.",
  ]},
  {v:"2026.09.25k", title:"Online dots fixed 🟢", items:[
    "🟢 Fixed people sometimes looking offline to everyone after their connection hiccuped (switching Wi-Fi, locking the screen). Your online status now reconnects on its own.",
    "🔎 Profile now shows whether your online status is connected, and how many people you can see online.",
  ]},
  {v:"2026.09.25j", title:"Spoiler photos 🙈", items:[
    "🙈 Sending a photo that's a spoiler (or just not for everyone's eyes right away)? Flip \"Send as spoiler\" before sending. It shows pixelated until someone taps to see it.",
  ]},
  {v:"2026.09.25i", title:"Tidy tabs ✨", items:[
    "✨ Fixed the unread count on the selected tab (Rooms / DMs / Friends) getting cut off at the top, and the counts on the other tabs looking blurry.",
  ]},
  {v:"2026.09.25h", title:"Even steadier chats 🧱", items:[
    "📜 Loading older messages can no longer drop them into the wrong chat if you switch chats while it loads.",
    "🔥 Tap reactions as fast as you want: what you see is always what gets saved.",
    "📡 Clearer messages when you're offline while adding a friend, opening a DM, or reacting.",
  ]},
  {v:"2026.09.25g", title:"Easier Android install 🤖", items:[
    "🤖 Installing from Samsung Internet made Android show a scary \"older version of Android\" warning (a Samsung bug). NightLane now sends you to Chrome instead, where it installs cleanly. Never turn off Play Protect to install it.",
  ]},
  {v:"2026.09.25f", title:"Faster backlog updates ⏱️", items:[
    "⏱️ Tap \"Episode 6 / 26\" or \"12 hrs played\" on your backlog to jump ahead: type a number, use − / +, or tap +1, +5, +10.",
    "📺 Anime with an unknown episode count? Fill in the total right there.",
  ]},
  {v:"2026.09.25e", title:"Cleaner backlogs 🎮", items:[
    "🎮 On a friend's backlog, games and shows you already have no longer show an \"add\" button.",
  ]},
  {v:"2026.09.25d", title:"Never get locked out 🛟", items:[
    "👤 Log in with your username now, not just your email. No more guessing which email you used.",
    "🛟 New: recovery codes. Make one in Profile → 🛟 Recovery code and save it. If you ever forget your password, your username + that code gets you back in, no email needed.",
    "📧 Forgot which email you signed up with? Forgot password? → Show a hint.",
  ]},
  {v:"2026.09.25c", title:"Change your password 🔑", items:[
    "🔑 New: Profile → 🔑 Change password, so you can pick a new password any time you're signed in.",
  ]},
  {v:"2026.09.25b", title:"Private photos & smoother scrolling 🔒", items:[
    "🔒 Photos, videos, and voice messages are now private to the chat they're sent in. Links don't work for anyone outside it, and deleting a message makes its file stop opening.",
    "📜 Reading older messages? New ones no longer yank you to the bottom. Tap the \"↓ new messages\" button when you're ready.",
    "⌨️ More room to type: the camera and mic buttons tuck away while you're writing a message.",
  ]},
  {v:"2026.09.25a", title:"NightLine is now NightLane 🌃", items:[
    "🌃 New name, new home: nightlane.chat. Same app, same account. Your chats, XP, secrets, Social Bonds, habits, and backlog all came with you.",
    "📲 On your phone: remove the old NightLine icon and add NightLane to your Home Screen from nightlane.chat.",
    "🔔 Turn notifications back on (Profile → Notifications). Your phone treats the new address as a new app.",
    "🖼️ Fresh icon with the new name on the ribbon.",
  ]},
  {v:"2026.09.22l", title:"Works offline 📡", items:[
    "📡 Opening NightLane with no signal (or in airplane mode) now shows your saved chats right away, instead of a long wait and a sign-in screen. It reconnects on its own when you're back.",
    "🔐 No more getting signed out just because your phone was offline when your login needed renewing.",
    "💬 Your chats list stays put when you lose signal, with a clear \"you're offline\" note instead of confusing errors.",
    "⚡ Signing in is faster, and the loading screen now covers it until everything's ready.",
  ]},
  {v:"2026.09.22k", title:"Rock-solid messaging 💬", items:[
    "🧭 Fixed messages from one chat briefly showing up in another if you switched chats quickly.",
    "📥 Coming back after a long time away now loads every message you missed, not just the last 50.",
    "⌨️ Pressing Enter a few times on a slow connection no longer sends the same message twice, and you can keep typing while a message sends.",
    "📡 Sending while offline now tells you clearly, and keeps your message in the box to send again.",
  ]},
  {v:"2026.09.22j", title:"Security upgrade 🔒", items:[
    "🔒 Fixed a security hole that could let a stranger add themselves as your friend. Your friend invite link is now private to you.",
    "🔗 Everyone got a fresh friend invite link, so old ones you shared before today won't work anymore. Grab your new one from Friends → 📲.",
    "🙈 Profiles (usernames, birthdays, last seen) are now only visible to people signed in to NightLane.",
  ]},
  {v:"2026.09.22i", title:"Pop-ups fit the screen 📐", items:[
    "📐 Fixed pop-ups (like \"You missed a secret\") running off the edge of the screen. Longer ones now wrap onto a second line so you can read the whole thing.",
    "🕛 \"You missed a secret\" now only offers secrets friends triggered today, not old ones from days ago.",
  ]},
  {v:"2026.09.22h", title:"Secrets stay found 🔒", items:[
    "🔒 Fixed secrets counting as \"found\" again on iPhone. Your app now checks your account every time you come back, so Safari and the Home Screen app (or two devices) stay in sync. (Found by Xen!)",
    "🛡️ If your browser blocks saved data, NightLane now warns you, and your XP and secrets still save to your account.",
  ]},
  {v:"2026.09.22g", title:"Media Backlog 🎮📺", items:[
    "🎮 New: Media Backlog! Track games and anime in Profile → 🎮 Media Backlog. Search thousands of games and shows, rate them, and tap +1 as you play or watch.",
    "👀 Tap a friend's picture to see their backlog. (Only friends you've added can see yours.)",
    "💬 Share anything on your list into a chat. Friends can add it to their own backlog in one tap.",
    "🏆 Finishing something gives XP and a little celebration.",
  ]},
  {v:"2026.09.22f", title:"Feel the buzz 📳", items:[
    "📳 New messages now give a stronger double-buzz you can actually feel, and @mentions buzz three times. (Android)",
    "🔔 Group chat notifications now wake your phone and buzz right away, instead of showing up late and silent. (Android)",
    "🔕 Don't want it? Turn it off in Profile → Notifications & effects. It also stays quiet while you're on Do Not Disturb.",
    "💡 Notifications not buzzing when the app is closed? Check your phone isn't on Mute mode, and that NightLane's notifications are set to Alert, not Silent.",
  ]},
  {v:"2026.09.22e", title:"iPhone glow-up 📱", items:[
    "💾 Your XP, level, secrets, and unlocks now save to your account, so they're safe if Safari clears data, you reinstall, or you get a new phone.",
    "🔍 No more surprise zoom-in when you tap a text box on iPhone.",
    "🎬 Big videos (like iPhone clips) get shrunk automatically before sending, so they fit. Keep the app open while it says \"Shrinking video…\"",
    "✨ When there's a new update, you'll see a \"Tap to refresh\" bar. No more closing and reopening the app.",
  ]},
  {v:"2026.09.22d", title:"Bonds & Arcana 💫", items:[
    "💫 You'll now get a heads-up when a friend starts a Social Bond with you or ranks it up, even if their messages did it while you were away.",
    "🃏 Tap anyone's picture to see their own Arcana from the quiz, plus your Social Bond with them.",
    "🤔 Quick tip: your Social Bond card belongs to your friendship, so it can be different from each person's own quiz Arcana.",
  ]},
  {v:"2026.09.22c", title:"Glitch squashed 🧹", items:[
    "🧹 Fixed weird lines getting stuck on screen after an effect (like GG) if you left the app mid-effect. (Found by Xen!)",
  ]},
  {v:"2026.09.22b", title:"See who's online 🟢", items:[
    "🟢 Online, idle, and Do Not Disturb symbols now show on everyone's picture, not just your own. (Thanks Ren for the report!)",
    "👀 Friends only show up once they've updated too. If someone looks offline, tell them to fully close and reopen the app (or press Ctrl+Shift+R on a computer).",
    "✨ Screen effects now play on the very first message in a brand-new chat.",
  ]},
  {v:"2026.09.22", title:"The Night Owl arrives 🦉", items:[
    "🦉 Close the app with habits left and the Night Owl DMs you a reminder (evenings only, once a day). Turn it off in Profile.",
    "🕔 Habits now follow YOUR clock. Checking one off late at night no longer counts it for tomorrow. (Fixed by Cole!)",
    "🃏 Your Arcana stays on your profile after updates now. No more retaking the quiz.",
    "📰 This page! You'll see it once after every update.",
  ]},
];

function paintNews(sinceVersion){
  const box=$("newsBody"); box.innerHTML="";
  const fresh=CHANGELOG.filter(r=>!sinceVersion||r.v>sinceVersion);
  const list=fresh.length?fresh:CHANGELOG.slice(0,1);
  list.forEach((r,i)=>{
    const rel=el("div","newsrel"+(i===0?" latest":""));
    rel.append(el("div","newsver",(i===0?"Latest · ":"")+"Update "+r.v), el("div","newshead",r.title));
    const ul=el("ul","newsitems"); r.items.forEach(t=>ul.append(el("li","",t))); rel.append(ul);
    box.append(rel);
  });
  if(!fresh.length&&CHANGELOG.length>1) box.append(el("p","newsolder",`${CHANGELOG.length-1} earlier update${CHANGELOG.length===2?"":"s"} not shown.`));
}
function openNews(sinceVersion){ paintNews(sinceVersion); show($("newsSheet")); }
function maybeShowWhatsNew(){
  let seen=null, usedBefore=false;
  try{ seen=LS.get("nl-seen-version"); usedBefore=NL_RETURNING;
       LS.set("nl-seen-version",APP_VERSION); }catch(e){ return; }
  if(seen===APP_VERSION) return;
  if(!seen&&!usedBefore&&!(user?.created_at&&user.created_at<"2026-09-26")) return;   // brand-new user: nothing is "new" to them yet (accounts from before the move still see the card)
  setTimeout(()=>openNews(seen||CHANGELOG[1]?.v),900);   // no record of what they saw (e.g. new address): just the latest card
}
$("newsClose").onclick=()=>show($("newsSheet"),false);

/* ================= AUTO-UPDATE =================
   Every few minutes (and whenever you come back to the app) it peeks at the live index.html. If the
   APP_VERSION there is newer, a "tap to refresh" bar appears. If you come back after 2+ minutes away and
   you're just on the home screen (nothing typed or uploading), it refreshes by itself. */
let updateReady=null, hiddenSince=0;
async function checkForUpdate(){
  if(updateReady||location.protocol==="file:"||!navigator.onLine) return;
  try{
    const r=await fetch(location.pathname+"?v="+Date.now(),{cache:"no-store"});
    const m=(await r.text()).match(/const APP_VERSION="([^"]+)"/);
    if(m&&m[1]>APP_VERSION){ updateReady=m[1]; show($("updateBar")); }
  }catch(e){}
}
function busyRightNow(){
  return !$("chat").classList.contains("hidden") || !!$("box").value.trim() || !!pendingFile || pendingImages.length>0 || (typeof pendingVideos!=="undefined"&&pendingVideos.length>0) || !!rec
      || [...document.querySelectorAll(".overlay")].some(o=>!o.classList.contains("hidden"));
}
async function safeReload(){ try{ if(sb) await Promise.race([sb.auth.getSession(),new Promise(r=>setTimeout(r,3000))]); }catch(e){} location.reload(); }
$("updateBar").onclick=()=>safeReload();
document.addEventListener("visibilitychange",()=>{
  if(document.hidden){ hiddenSince=Date.now(); return; }
  const away=hiddenSince?Date.now()-hiddenSince:0;
  if(updateReady&&away>120000&&!busyRightNow()&&navigator.onLine!==false) return safeReload();
  checkForUpdate();
});
setInterval(()=>{ if(!document.hidden) checkForUpdate(); },5*60*1000);
setTimeout(checkForUpdate,15000);
$("newsSheet").addEventListener("click",e=>{ if(e.target.id==="newsSheet") show($("newsSheet"),false); });
$("openNews").onclick=()=>{ show($("profile"),false); openNews(null); };
QX.rankup=function(name,arcana,rank){
  const layer=$("sfx"), w=document.createElement("div"); w.className="sl-rankup";
  w.innerHTML=`<div class="sl-card"><div class="sl-rankt">RANK UP!</div><div class="sl-arcana">${arcana}</div><div class="sl-sub">${name} · Rank ${rank}</div><div class="px-stars">${[...Array(10)].map((_,i)=>`<i style="animation-delay:${.3+i*.1}s">★</i>`).join("")}</div></div>`;
  layer.append(w);
  try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); [[523,0,.15],[659,.12,.15],[784,.24,.3]].forEach(([f,at,len])=>{ const o=ac.createOscillator(),g=ac.createGain(); o.frequency.value=f; g.gain.setValueAtTime(.05,ac.currentTime+at); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+at+len); o.connect(g); g.connect(ac.destination); o.start(ac.currentTime+at); o.stop(ac.currentTime+at+len+.05); }); }catch(e){}
  if(navigator.vibrate) navigator.vibrate([30,40,30,40,120]);
  setTimeout(()=>w.remove(),3000);
};

