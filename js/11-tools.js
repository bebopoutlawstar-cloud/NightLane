/* ================= AI, DATES, CHECKLISTS, DISAPPEARING MESSAGES ================= */
const LANGS=[["","Off"],["en","English"],["es","Spanish"],["fr","French"],["de","German"],["pt","Portuguese"],["it","Italian"],["ja","Japanese"],["ko","Korean"],["zh","Chinese"],["tl","Tagalog"],["vi","Vietnamese"],["ar","Arabic"],["hi","Hindi"],["ru","Russian"]];
const aiOn=()=>!sb||AI_ENABLED;
const myLang=()=>{ if(!aiOn()) return ""; try{ return LS.get("nl-lang")||""; }catch(e){ return ""; } };
const translations=new Map();   // message id -> {text, same}
const showOriginal=new Set();

/* ---------- catch me up (summaries) ---------- */
function updateCatchUp(){
  const mine=members.get(user?.id)?.read||0;
  const unread=msgs.filter(m=>m.user_id!==user.id&&new Date(m.created_at).getTime()>mine&&(m.text||m.kind!=="text")).length;
  const bar=$("catchUp"); bar.dataset.n=unread;
  show(bar, aiOn() && unread>=8 && !bar.dataset.dismissed);
  $("catchUpText").textContent=`${unread} new messages · ✨ Catch me up`;
}
$("catchUpX").onclick=()=>{ $("catchUp").dataset.dismissed="1"; show($("catchUp"),false); };
$("catchUpBtn").onclick=()=>summarize(+$("catchUp").dataset.n||30);
$("rsSummarize").onclick=()=>{ show($("roomSheet"),false); summarize(60); };
async function summarize(count){
  $("sumTitle").textContent="✨ Catching you up…"; $("sumBody").innerHTML='<p class="sub">Reading the last '+count+' messages…</p>'; show($("summarySheet"));
  try{
    const r=await api.ai({action:"summarize",room,count});
    $("sumTitle").textContent="✨ Here's what you missed";
    const ul=el("ul","sumlist"); (r.points||[]).forEach(pt=>ul.append(el("li","",pt)));
    $("sumBody").innerHTML=""; if(r.headline) $("sumBody").append(el("p","sumhead",r.headline)); $("sumBody").append(ul);
    if(r.todo?.length){ $("sumBody").append(el("h3","","For you")); const t=el("ul","sumlist"); r.todo.forEach(x=>t.append(el("li","",x))); $("sumBody").append(t); }
    $("catchUp").dataset.dismissed="1"; show($("catchUp"),false);
  }catch(err){ $("sumTitle").textContent="Couldn't summarize"; $("sumBody").innerHTML=""; $("sumBody").append(el("p","msgline bad",friendlyAiError(err))); }
}
$("sumClose").onclick=()=>show($("summarySheet"),false);
function friendlyAiError(err){
  const m=String(err?.message||err);
  if(/not set up|ANTHROPIC|api key/i.test(m)) return "AI features aren't set up yet. The notify-style 'ai' function needs an ANTHROPIC_API_KEY secret in Supabase.";
  if(/demo/i.test(m)) return m;
  return "Something went wrong: "+m;
}

/* ---------- translation ---------- */
function paintLangPicker(){ show($("langBox"),aiOn());   // (the whole section, heading too: translating needs the AI feature switched on)
  const s=$("langPick"); if(!s.options.length) LANGS.forEach(([v,n])=>s.append(new Option(n,v))); s.value=myLang(); }
$("langPick").onchange=e=>{ try{ LS.set("nl-lang",e.target.value); }catch(x){} translations.clear(); if(room) renderAll(false); say("profMsg",e.target.value?"New messages in other languages will be translated for you.":"Translation turned off."); };
async function translateMsg(m,force){
  const lang=myLang(); if(!lang||!m.text||m.kind==="poll"||m.kind==="game") return;
  if(translations.has(m.id)&&!force) return;
  translations.set(m.id,{pending:true});
  try{ const r=await api.ai({action:"translate",message_id:m.id,room:m.room,lang}); translations.set(m.id,{text:r.text,same:!!r.same,from:r.from}); }
  catch(err){ translations.set(m.id,{error:friendlyAiError(err)}); }
  refreshMsg(m.id);
}
function translationBlock(m){
  const tr=translations.get(m.id); if(!tr||tr.pending||tr.same||!tr.text) return null;
  const box=el("div","trbox");
  if(showOriginal.has(m.id)){ box.append(el("span","trlabel","original")); }
  else { const t=el("div","trtext"); linkify(t,tr.text); box.append(t); box.append(el("span","trlabel",`🌐 translated${tr.from?" from "+tr.from:""} · tap for original`)); }
  box.onclick=e=>{ e.stopPropagation(); showOriginal.has(m.id)?showOriginal.delete(m.id):showOriginal.add(m.id); refreshMsg(m.id); };
  return box;
}
$("menuTranslate").onclick=()=>{ const m=menuMsg; show($("msgMenu"),false); if(!myLang()){ $("status").textContent="Pick your language in Profile → Alerts first."; openProfile(); profTab("alerts"); return; } translateMsg(m,true); };

/* ---------- dates → calendar ---------- */
const MONTH_RE="jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";
const DAY_FULL="sunday|monday|tuesday|wednesday|thursday|friday|saturday";
const DAY_ABBR="sun|mon|tues?|wed|thu(?:rs)?|fri|sat";
const DAY_RE=DAY_FULL+"|"+DAY_ABBR;
const TIME_RE="(?:\\d{1,2}(?::\\d{2})?\\s?(?:am|pm)|\\d{1,2}:\\d{2}|noon|midnight)";
const DATE_PATTERNS=[
  new RegExp(`\\b(?:(?:this|next|on|every)\\s+)?(?:${DAY_FULL})(?![a-z])(?:\\s+(?:at\\s+)?${TIME_RE})?`,"i"),
  new RegExp(`\\b(?:this|next|on|every)\\s+(?:${DAY_ABBR})(?![a-z])(?:\\s+(?:at\\s+)?${TIME_RE})?`,"i"),
  new RegExp(`\\b(?:${DAY_ABBR})(?![a-z])\\s+(?:(?:at\\s+)?${TIME_RE}|at\\s+\\d{1,2}(?![0-9:]))`,"i"),
  new RegExp(`\\b(?:tomorrow|tonight|today)\\b(?:\\s+(?:at\\s+)?${TIME_RE})?`,"i"),
  new RegExp(`\\b(?:${MONTH_RE})\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s+\\d{4})?\\b(?:\\s+(?:at\\s+)?${TIME_RE})?`,"i"),
  new RegExp(`\\b\\d{1,2}\\/\\d{1,2}(?:\\/\\d{2,4})?\\b(?:\\s+(?:at\\s+)?${TIME_RE})?`,"i"),
  new RegExp(`\\bat\\s+${TIME_RE}\\b`,"i"),
];
function findDates(text){
  const hits=[]; let s=text;
  for(const re of DATE_PATTERNS){ let m; const g=new RegExp(re.source,"gi"); while((m=g.exec(s))){ if(!hits.some(h=>m.index<h.end&&m.index+m[0].length>h.start)) hits.push({start:m.index,end:m.index+m[0].length,text:m[0]}); } }
  return hits.sort((a,b)=>a.start-b.start);
}
function parseWhen(phrase,base=new Date()){
  const p=phrase.toLowerCase(); let d=new Date(base); d.setSeconds(0,0); let hasTime=false;
  const mon=p.match(new RegExp(`(${MONTH_RE})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?`));
  const num=p.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  const day=p.match(new RegExp(`\\b(${DAY_RE})\\b`));
  if(mon){ const mi=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"].indexOf(mon[1].slice(0,3)); d.setMonth(mi,+mon[2]); if(mon[3]) d.setFullYear(+mon[3]); else if(d<base&&(base-d)>864e5*2) d.setFullYear(d.getFullYear()+1); }
  else if(num){ d.setMonth(+num[1]-1,+num[2]); if(num[3]) d.setFullYear(num[3].length===2?2000+ +num[3]:+num[3]); else if(d<base&&(base-d)>864e5*2) d.setFullYear(d.getFullYear()+1); }
  else if(day){ const want=["sun","mon","tue","wed","thu","fri","sat"].indexOf(day[1].slice(0,3)); let diff=(want-base.getDay()+7)%7; if(diff===0&&!/this/.test(p)) diff=7; if(/next/.test(p)&&diff<7) diff+=7; d.setDate(base.getDate()+diff); }
  else if(/tomorrow/.test(p)) d.setDate(base.getDate()+1);
  const t=p.match(/(\d{1,2})(?::(\d{2}))?\s?(am|pm)|(\d{1,2}):(\d{2})|(noon)|(midnight)/) || (p.match(/\bat\s+(\d{1,2})\b/)&&(()=>{ const hh=+p.match(/\bat\s+(\d{1,2})\b/)[1]; return [null,String(hh),null,(hh>=1&&hh<=7)?"pm":"am"]; })());
  if(t){ hasTime=true; if(t[6]) d.setHours(12,0); else if(t[7]) d.setHours(0,0); else if(t[3]){ let h=+t[1]%12; if(t[3]==="pm") h+=12; d.setHours(h,+(t[2]||0)); } else d.setHours(+t[4],+t[5]); }
  else if(/tonight/.test(p)){ hasTime=true; d.setHours(19,0); }
  else d.setHours(9,0);
  return {date:d,hasTime};
}
let calDraft=null;
function openCalendar(phrase,m){
  const {date,hasTime}=parseWhen(phrase,m?.created_at?new Date(m.created_at):new Date());
  calDraft={m,phrase};
  const pad=n=>String(n).padStart(2,"0");
  $("calTitle").value=(m.text||"NightLane plan").replace(/\s+/g," ").slice(0,60);
  $("calDate").value=`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  $("calTime").value=`${pad(date.getHours())}:${pad(date.getMinutes())}`;
  $("calWhere").value=roomName||("#"+room);
  $("calHint").textContent=`From "${phrase}"${hasTime?"":" · no time given, so 9:00 AM is a guess"}`;
  say("calMsg",""); show($("calSheet"));
}
function calEvent(){
  const [y,mo,da]=$("calDate").value.split("-").map(Number), [h,mi]=$("calTime").value.split(":").map(Number);
  const start=new Date(y,mo-1,da,h,mi), end=new Date(start.getTime()+3600e3);
  return {title:$("calTitle").value.trim()||"NightLane plan",start,end,where:$("calWhere").value.trim(),desc:`Planned in NightLane${calDraft?.m?` by ${nameOf(calDraft.m.user_id)}: "${(calDraft.m.text||"").slice(0,200)}"`:""}`};
}
const icsStamp=d=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
$("calGoogle").onclick=()=>{ const e=calEvent(); const u=new URL("https://calendar.google.com/calendar/render"); u.searchParams.set("action","TEMPLATE"); u.searchParams.set("text",e.title); u.searchParams.set("dates",`${icsStamp(e.start)}/${icsStamp(e.end)}`); u.searchParams.set("details",e.desc); if(e.where) u.searchParams.set("location",e.where); window.open(u.toString(),"_blank","noopener"); };
$("calIcs").onclick=()=>{
  const e=calEvent(); const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//NightLane//EN","BEGIN:VEVENT",`UID:${Date.now()}@nightline`,`DTSTAMP:${icsStamp(new Date())}`,`DTSTART:${icsStamp(e.start)}`,`DTEND:${icsStamp(e.end)}`,`SUMMARY:${e.title.replace(/[,;\\]/g,"\\$&")}`,`LOCATION:${e.where.replace(/[,;\\]/g,"\\$&")}`,`DESCRIPTION:${e.desc.replace(/[,;\\]/g,"\\$&").replace(/\n/g,"\\n")}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
  const blob=new Blob([ics],{type:"text/calendar;charset=utf-8"}), url=URL.createObjectURL(blob), a=document.createElement("a"); a.href=url; a.download="nightlane-plan.ics"; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),4000);
  say("calMsg","Calendar file ready. Open it to add the event.");
};
$("calTask").onclick=async()=>{ const e=calEvent(); show($("calSheet"),false); await addTask(`${e.title} — ${e.start.toLocaleString([],{weekday:"short",month:"numeric",day:"numeric",hour:"numeric",minute:"2-digit"})}`); };
$("calClose").onclick=()=>show($("calSheet"),false);
function renderTextWithDates(node,text,mentionIds,m){
  const hits=findDates(text); if(!hits.length){ renderText(node,text,mentionIds); return; }
  let last=0, prevDate=null;
  const TIME_ONLY=new RegExp(`^at\\s+${TIME_RE}$`,"i");
  for(const h of hits){ const s=el("span"); renderText(s,text.slice(last,h.start),mentionIds); node.append(s);
    /* "at 6pm" on its own belongs to the day mentioned before it ("on sunday … at 6pm" = Sunday 6pm), not to today (2026.10.21m) */
    const timeOnly=TIME_ONLY.test(h.text.trim()), phrase=timeOnly&&prevDate?prevDate+" "+h.text:h.text;
    if(!timeOnly) prevDate=h.text.replace(new RegExp(`\\s+(?:at\\s+)?${TIME_RE}$`,"i"),"");
    // a tiny calendar page with the REAL month/day (the 📅 emoji always shows "JUL 17" on most phones)
    const when=parseWhen(phrase,m?.created_at?new Date(m.created_at):new Date()).date;
    const chip=el("button","datechip"); chip.type="button"; chip.title=`${when.toLocaleDateString([],{weekday:"long",month:"long",day:"numeric"})} · tap to add it to your calendar`;
    const ico=el("span","calico"+(timeOnly&&!prevDate?" clock":"")); ico.setAttribute("aria-hidden","true");
    if(timeOnly&&!prevDate) ico.append(el("b","","TIME"),el("i","",when.toLocaleTimeString("en-US",{hour:"numeric"}).replace(/\s?(AM|PM)/,(x,a)=>a[0].toLowerCase())));   // just a time, no day said: show a clock face, not today's date
    else ico.append(el("b","",when.toLocaleDateString("en-US",{month:"short"}).toUpperCase()),el("i","",String(when.getDate())));
    chip.append(ico,document.createTextNode(h.text)); chip.setAttribute("aria-label",`${h.text}, ${when.toLocaleDateString([],{weekday:"long",month:"long",day:"numeric"})} ${when.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}. Add to calendar`); chip.onclick=e=>{ e.stopPropagation(); openCalendar(phrase,m); }; node.append(chip); last=h.end; }
  const s=el("span"); renderText(s,text.slice(last),mentionIds); node.append(s);
}

/* ---------- room checklist ---------- */
const tasks=new Map();
async function loadTasks(){ tasks.clear(); (await api.tasks(room).catch(()=>[])).forEach(t=>tasks.set(t.id,t)); paintTasks(); }
function paintTasks(){
  const list=[...tasks.values()].sort((a,b)=>(a.done-b.done)||(a.created_at<b.created_at?-1:1));
  const box=$("taskList"); box.innerHTML=""; $("taskTitle").textContent=`Checklist (${list.filter(t=>!t.done).length} open)`;
  list.forEach(t=>{
    const row=el("label","taskrow"+(t.done?" done":"")); const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=!!t.done;
    cb.onchange=async()=>{ t.done=cb.checked; if(cb.checked) sfx("tick"); paintTasks(); try{ await api.setTaskDone(t.id,cb.checked); }catch(err){ t.done=!cb.checked; paintTasks(); say("rsMsg",err.message,true); } };
    const txt=el("span","tasktext",t.text); const who=el("small","",nameOf(t.created_by));
    const x=el("button","rm","✕"); x.type="button"; x.setAttribute("aria-label","Remove task"); x.onclick=async e=>{ e.preventDefault(); if(!await nlAlert({ kind:"warn", title:"Remove task?", badge:"WARNING", text:"This takes it off the checklist for everyone in the room.", status:"AWAITING INPUT", buttons:[{label:"REMOVE", value:true},{label:"KEEP", value:false}] })) return; tasks.delete(t.id); paintTasks(); try{ await api.deleteTask(t.id); }catch(err){ say("rsMsg",err.message,true); loadTasks(); } };
    row.append(cb,txt,who,x); box.append(row);
  });
  $("taskCount").textContent=list.filter(t=>!t.done).length?`✅ ${list.filter(t=>!t.done).length}`:""; 
}
async function addTask(text){
  text=(text||"").trim().slice(0,200); if(!text) return;
  try{ const t=await api.addTask(room,text); tasks.set(t.id,t); paintTasks(); gainXP("task"); nlToast("ok","added to the room checklist"); }
  catch(err){ nlToast("err","couldn't add task // "+err.message,5000); }
}
$("taskForm").addEventListener("submit",async e=>{ e.preventDefault(); const v=$("taskInput").value; $("taskInput").value=""; await addTask(v); });
$("menuTask").onclick=()=>{ const m=menuMsg; show($("msgMenu"),false); addTask(previewOf(m)); };
$("menuCal").onclick=()=>{ const m=menuMsg; show($("msgMenu"),false); const h=findDates(m.text||""); openCalendar(h.length?h[0].text:"tomorrow",m); if(!h.length) $("calHint").textContent="No date spotted, so this defaults to tomorrow 9:00 AM. Change it below."; };
$("taskCount").onclick=()=>{ $("roomBtn").click(); setTimeout(()=>$("taskTitle").scrollIntoView({behavior:"smooth",block:"start"}),300); };

/* ---------- disappearing messages ---------- */
let disappear=0;
const DISAPPEAR=[[0,"Off"],[3600,"1 hour"],[86400,"24 hours"],[604800,"7 days"]];
function paintDisappear(){ const s=$("disappearModes"); s.querySelectorAll("button").forEach(b=>b.setAttribute("aria-checked",+b.dataset.sec===disappear)); $("disappearNote").textContent=disappear?`New messages here vanish for everyone ${DISAPPEAR.find(x=>x[0]===disappear)[1]} after they're sent.`:"Messages stay until someone deletes them."; }
$("disappearModes").querySelectorAll("button").forEach(b=>b.onclick=async()=>{
  const prev=disappear; disappear=+b.dataset.sec; paintDisappear();
  try{ await api.setDisappear(room,disappear); say("rsMsg",disappear?"Disappearing messages on.":"Disappearing messages off."); }
  catch(err){ disappear=prev; paintDisappear(); say("rsMsg",err.message,true); }
});
let expiryTimer=null;
function scheduleExpiry(){
  clearTimeout(expiryTimer);
  const next=msgs.filter(m=>m.expires_at).map(m=>new Date(m.expires_at).getTime()).filter(t=>t>Date.now()).sort((a,b)=>a-b)[0];
  const due=msgs.filter(m=>m.expires_at&&new Date(m.expires_at).getTime()<=Date.now()).map(m=>m.id);
  due.forEach(id=>removeMessage(id));
  if(next) expiryTimer=setTimeout(scheduleExpiry,Math.min(next-Date.now()+50,60000));
}
function expiryTag(m){
  if(!m.expires_at) return null;
  const left=new Date(m.expires_at).getTime()-Date.now(); if(left<=0) return null;
  const s=el("span","expiry","⏳"+(left<3600e3?Math.max(1,Math.round(left/60000))+"m":left<86400e3?Math.round(left/3600e3)+"h":Math.round(left/86400e3)+"d"));
  s.title="This message will disappear"; return s;
}

