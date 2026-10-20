/* ================= PACK 15: Jay, The Writer, Kingdom Hearts, Resident Evil ================= */
(function(){
  const layer=$("sfx"), add=(cls,html="")=>{ const d=document.createElement("div"); d.className=cls; d.innerHTML=html; layer.append(d); return d; };
  const later=(fn,ms)=>setTimeout(fn,ms);
  const chatClass=(cls,ms)=>{ const c=$("chat"); c.classList.remove(cls); void c.offsetWidth; c.classList.add(cls); later(()=>c.classList.remove(cls),ms); };
  const bg=(cls,html,ms)=>{ const w=document.createElement("div"); w.className="sx-city "+cls; w.innerHTML=html; $("chat").prepend(w); chatClass("sx-see",ms); later(()=>w.remove(),ms); return w; };
  const chime=(notes)=>{ try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); notes.forEach(([f,at,len,type])=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type=type||"sine"; o.frequency.value=f; g.gain.setValueAtTime(.0001,ac.currentTime+at); g.gain.exponentialRampToValueAtTime(.06,ac.currentTime+at+.02); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+at+len); o.connect(g); g.connect(ac.destination); o.start(ac.currentTime+at); o.stop(ac.currentTime+at+len+.05); }); }catch(e){} };
  QX.jay=function(){
    const w=add("p15-scene p15-sunset-scene",`<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="p15sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1055"/><stop offset=".45" stop-color="#c2417a"/><stop offset=".72" stop-color="#ff9a3d"/><stop offset="1" stop-color="#ffd27a"/></linearGradient></defs>
      <rect width="200" height="300" fill="url(#p15sky)"/><circle cx="100" cy="205" r="34" fill="#fff1b0"/><rect x="0" y="205" width="200" height="95" fill="#1a0b2e"/>
      <g fill="#0a0414"><rect x="0" y="230" width="200" height="70"/><ellipse cx="100" cy="232" rx="120" ry="14"/>
        <circle cx="86" cy="196" r="11"/><path d="M72 206 Q86 200 100 206 L98 236 L74 236Z"/><path d="M74 236 L70 268 L80 268 L86 244 L92 268 L102 268 L98 236Z"/>
        <circle cx="116" cy="202" r="9"/><path d="M104 211 Q116 206 128 211 L126 236 L106 236Z"/><path d="M106 236 L102 266 L111 266 L116 246 L121 266 L130 266 L126 236Z"/>
        <path d="M100 214 L106 214 L108 224 L98 224Z"/></g></svg><div class="sx-caption p15-cap">brothers. 🌇</div>`);
    later(()=>w.classList.add("out"),6200); later(()=>w.remove(),7000);
  };
  QX.writer=function(){
    const w=add("p15-scene p15-study-scene",`<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="300" fill="#140c05"/><rect x="0" y="0" width="200" height="140" fill="#1e1308"/>
      <g fill="#3a2410">${[...Array(6)].map((_,i)=>`<rect x="${10+i*32}" y="20" width="26" height="110"/>`).join("")}</g>
      <g fill="#7a4a1e">${[...Array(18)].map((_,i)=>`<rect x="${12+(i%6)*32+(i%3)*3}" y="${24+Math.floor(i/6)*36}" width="${5+(i%3)*2}" height="30"/>`).join("")}</g>
      <radialGradient id="p15lamp"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      <circle cx="150" cy="150" r="90" fill="url(#p15lamp)" class="p15-flicker"/><path d="M136 132 L164 132 L172 152 L128 152Z" fill="#2a1a0a"/><rect x="149" y="152" width="3" height="40" fill="#2a1a0a"/>
      <rect x="20" y="190" width="160" height="12" fill="#3a2410"/><rect x="26" y="202" width="8" height="60" fill="#2a1a0a"/><rect x="166" y="202" width="8" height="60" fill="#2a1a0a"/>
      <rect x="60" y="176" width="46" height="14" fill="#0a0604"/><g fill="#d9c9a5">${[...Array(12)].map((_,i)=>`<rect x="${64+(i%6)*7}" y="${178+Math.floor(i/6)*5}" width="4" height="3"/>`).join("")}</g>
      <g fill="#0a0604"><circle cx="82" cy="150" r="14"/><path d="M62 166 Q82 156 102 166 L106 192 L58 192Z"/><path d="M66 176 L60 186 L92 184Z" class="p15-hand"/></g>
      </svg><div class="writer-cap">...and the night kept typing back.</div>`);   // caption lives outside the stretched picture so it never gets cropped
    chime([[880,0,.05,"square"],[880,.25,.05,"square"],[880,.45,.05,"square"],[880,.6,.05,"square"],[1200,1.1,.3,"triangle"]]);
    later(()=>w.classList.add("out"),5700); later(()=>w.remove(),6500);
  };
  QX.kingdomHearts=function(){
    const w=add("kh-wrap",`<div class="kh-sky"></div><div class="kh-moon"></div><div class="kh-city">${[...Array(14)].map((_,i)=>`<i style="left:${i*7.3}%;height:${20+((i*37)%50)}%"></i>`).join("")}</div><div class="sx-caption kh-cap">the heart-shaped moon rises…</div>`);
    chime([[523,0,.5],[659,.4,.5],[784,.8,.9],[1047,1.5,1.2]]); later(()=>w.classList.add("out"),5200); later(()=>w.remove(),6000);
  };
  QX.keyblade=function(){
    const w=add("kb-wrap",`<div class="kb-hole"><i></i></div><div class="kb-beam"></div><div class="sx-caption kb-cap">🔒 sealed</div>`);
    later(()=>w.classList.add("lock"),1400); later(()=>{ chime([[1568,0,.15,"square"],[784,.15,.35,"square"]]); if(navigator.vibrate) navigator.vibrate([30,30,80]); },1500); later(()=>w.remove(),3600);
  };
  QX.residentEvil=function(){
    chatClass("qx-flicker",1200); const w=add("re-wrap",`<div class="re-tw"><div class="re-paper"><b>SAVE GAME?</b><span>You will need an <i>Ink Ribbon</i>.</span><small>Itchy. Tasty.</small></div><div class="re-keys">${[...Array(14)].map(()=>"<i></i>").join("")}</div></div><div class="re-heart">❤</div>`);
    const paper=w.querySelector(".re-paper"); const seq=["SAVE GAME?","SAVING","SAVING.","SAVING..","SAVED"]; let i=0; const iv=setInterval(()=>{ i++; if(i<seq.length){ paper.querySelector("b").textContent=seq[i]; chime([[900,0,.03,"square"]]); } else clearInterval(iv); },500);
    later(()=>{ clearInterval(iv); w.remove(); },4200);
  };
  QX.greenHerb=function(m){
    const faces=[...feed.querySelectorAll(`.face[data-uid="${CSS.escape(m?.user_id||"")}"]`)]; faces.forEach(f=>{ f.classList.remove("re-heal"); void f.offsetWidth; f.classList.add("re-heal"); later(()=>f.classList.remove("re-heal"),2600); });
    const h=add("re-herb",`🌿<b>HP FINE</b>`); chime([[659,0,.12],[988,.12,.25]]); later(()=>h.remove(),2200);
  };
})();
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"jay", name:"Jay", re:/(^|[^a-z])jay([^a-z]|$)/i, play:()=>QX.jay()},
  {id:"writer", name:"The writer", re:/the writer/i, play:()=>QX.writer()},
  {id:"kingdomhearts", name:"Kingdom Hearts", re:/kingdom hearts|simple and clean|got it memori[sz]ed/i, play:()=>QX.kingdomHearts()},
  {id:"keyblade", name:"Keyblade", re:/key ?blade/i, play:()=>QX.keyblade()},
  {id:"residentevil", name:"Resident Evil", re:/resident evil|itchy,? tasty|ink ribbon|jill sandwich/i, play:()=>QX.residentEvil()},
  {id:"greenherb", name:"Green herb", re:/green herb|first aid spray/i, play:m=>QX.greenHerb(m)}
);
Object.assign(HINTS,{
  jay:"Say a little brother's name and two silhouettes watch the sun go down.",
  writer:"Two words: an author at work. The study lamp flickers.",
  kingdomhearts:"A heart-shaped moon rises when you name the crossover RPG.",
  keyblade:"The weapon that locks worlds. One word, or two.",
  residentevil:"The zombie mansion series. Bonus: what the zombie diary says.",
  greenherb:"The plant that heals in the mansion.",
});

/* ================= DANGANRONPA ================= */
(function(){
  const layer=$("sfx"), add=(cls,html="")=>{ const d=document.createElement("div"); d.className=cls; d.innerHTML=html; layer.append(d); return d; };
  const later=(fn,ms)=>setTimeout(fn,ms), R=(a,b)=>a+Math.random()*(b-a);
  const chatClass=(cls,ms)=>{ const c=$("chat"); c.classList.remove(cls); void c.offsetWidth; c.classList.add(cls); later(()=>c.classList.remove(cls),ms); };
  const chime=(notes)=>{ try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); notes.forEach(([f,at,len,type])=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type=type||"square"; o.frequency.value=f; g.gain.setValueAtTime(.0001,ac.currentTime+at); g.gain.exponentialRampToValueAtTime(.07,ac.currentTime+at+.02); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+at+len); o.connect(g); g.connect(ac.destination); o.start(ac.currentTime+at); o.stop(ac.currentTime+at+len+.05); }); }catch(e){} };
  QX.monokuma=function(){   // "half kind, half cruel": an original two-faced coin flips and lands cruel side up
    const w=add("dr-coinwrap",`<div class="dr-coin"><div class="dr-face kind">😇</div><div class="dr-face cruel">😈</div></div><div class="dr-cap">heh heh heh…</div>`);
    chime([[1046,0,.08],[880,.08,.08],[1046,.16,.08],[1318,.3,.2]]); if(navigator.vibrate) navigator.vibrate([20,30,20,30,60]);
    later(()=>w.classList.add("out"),2600); later(()=>w.remove(),3200);
  };
  QX.classTrial=function(){
    chatClass("qx-glitch",900);
    const b=add("sx-banner qx-stamp dr-trial","CLASS TRIAL"); chime([[220,0,.15,"sawtooth"],[220,.15,.15,"sawtooth"],[330,.3,.4,"sawtooth"]]); if(navigator.vibrate) navigator.vibrate([15,20,15,20,15,20,80]);
    later(()=>b.remove(),1900);
  };
  QX.nonstop=function(m){
    const w=add("dr-nonstop",`<div class="dr-strip"></div><div class="dr-target">${(m?.text||"").slice(0,60).replace(/[<>&]/g,"")||"…"}</div><div class="dr-cross"></div>`);
    later(()=>{ w.querySelector(".dr-cross").classList.add("hit"); chime([[1568,0,.06,"square"],[2093,.06,.14,"square"]]); if(navigator.vibrate) navigator.vibrate(40); },700);
    later(()=>w.remove(),1900);
  };
  QX.despair=function(){
    chatClass("qx-glitch",1300); const w=add("dr-despair",`<div class="dr-desptext">DESPAIR</div><div class="dr-hopetext">×</div><div class="dr-desptext2">HOPE</div>`);
    chime([[196,0,.3,"sawtooth"],[261,.3,.5,"sawtooth"]]); later(()=>w.remove(),2600);
  };
  QX.guilty=function(m){
    const w=add("dr-verdict",`<div class="dr-vcard g"><b>GUILTY</b></div>`); chime([[220,0,.15,"square"],[196,.15,.15,"square"],[164,.3,.5,"square"]]);
    if(navigator.vibrate) navigator.vibrate([10,10,10,10,10,10,150]);
    later(()=>w.classList.add("slam"),100); later(()=>w.remove(),2400);
  };
  QX.notGuilty=function(){
    const w=add("dr-verdict",`<div class="dr-vcard ng"><b>NOT GUILTY</b></div>`); chime([[659,0,.15],[880,.15,.15],[1318,.3,.4]]);
    later(()=>w.classList.add("slam"),100); later(()=>w.remove(),2400);
  };
})();
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"monokuma", name:"Monokuma", re:/mono ?kuma|upupupu/i, play:()=>QX.monokuma()},
  {id:"classtrial", name:"Class Trial", re:/class trial/i, play:()=>QX.classTrial()},
  {id:"nonstop", name:"Non-stop Debate", re:/non-?stop debate/i, play:m=>QX.nonstop(m)},
  {id:"despair", name:"Despair", re:/(^|[^a-z])despair([^a-z]|$)/i, play:()=>QX.despair()},
  {id:"notguilty", name:"Not guilty verdict", re:/not guilty([^a-z]|$)/i, play:()=>QX.notGuilty()},
  {id:"guilty", name:"Guilty verdict", re:/(^|[^a-z])guilty(?! pleasure)([^a-z]|$)/i, play:m=>QX.guilty(m)}
);
Object.assign(HINTS,{
  monokuma:"A two-toned bear headmaster, half kind, half cruel. Say his name, or his laugh.",
  classtrial:"Two words: the courtroom phase of a certain killing game.",
  nonstop:"A rapid-fire debate where you shoot down the lie with the truth.",
  despair:"The opposite of hope, in one word.",
  guilty:"The verdict nobody wants to hear.",
  notguilty:"The verdict everyone hopes for.",
});

QX.hifive=function(m){
  const layer=$("sfx"), add=(cls,html="")=>{ const d=document.createElement("div"); d.className=cls; d.innerHTML=html; layer.append(d); return d; };
  const HAND=`<svg viewBox="0 0 100 120"><path d="M50 118 L34 90 Q20 82 20 66 L20 30 Q20 22 28 22 Q36 22 36 30 L36 54 L36 14 Q36 4 46 4 Q56 4 56 14 L56 52 L56 8 Q56 -2 66 -2 Q76 -2 76 8 L76 52 L76 18 Q76 10 84 10 Q92 10 92 18 L92 62 Q92 90 72 100 L64 118Z" fill="#f2c396" stroke="#07041A" stroke-width="4"/></svg>`;
  const left=add("hf-hand hf-left",HAND), right=add("hf-hand hf-right",HAND);
  setTimeout(()=>{
    const burst=add("hf-burst"); for(let i=0;i<14;i++){ const s=document.createElement("i"); s.style.setProperty("--a",(i*(360/14))+"deg"); burst.append(s); }
    try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); const o=ac.createOscillator(), g=ac.createGain(); o.type="square"; o.frequency.value=180; g.gain.setValueAtTime(.12,ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.15); o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+.16); }catch(e){}
    if(navigator.vibrate) navigator.vibrate(40);
    setTimeout(()=>burst.remove(),700);
  },420);
  setTimeout(()=>{ left.remove(); right.remove(); },1600);
};
/* ===== Halloween pixel art =====
   "Halloween Graphics" by finalbossblues (finalbossblues.itch.io) and "Jacko" by Tyler Warren, used under the pack's
   commercial-use terms (you may use them in projects, just don't hand out the image files on their own).
   Each sprite is a tiny pixel strip; CSS gives it NightLane's cyan/magenta outline and glow. */
/* (moved to js/00-media.js) */
const HW=(()=>{
  const R=(a,b)=>a+Math.random()*(b-a);
  const layer=()=>$("sfx");
  const gone=(n,ms)=>setTimeout(()=>n.remove(),ms);
  // one sprite: name from HWART, how many frames are in its strip, which row (for the Day of the Dead sheet)
  // one sprite from HWART: an animated strip (frames), one icon out of a strip (cell + frame), or one row of a sheet (row + rowH)
  function spr(name,{frames=1,cell=0,frame=0,row=0,rowH=0,fps=6,scale=4,cls=""}={}){
    const a=HWART[name], fh=rowH||a.h, w=frames>1?a.w/frames:(cell||a.w);
    const d=document.createElement("div"); d.className="hwspr "+cls; d.setAttribute("aria-hidden","true");
    d.style.width=w*scale+"px"; d.style.height=fh*scale+"px";
    d.style.backgroundImage=`url(${a.src})`; d.style.backgroundSize=`${a.w*scale}px ${a.h*scale}px`;
    d.style.backgroundPosition=`${-frame*(cell||0)*scale}px ${-row*fh*scale}px`;
    if(frames>1){ d.style.setProperty("--hwend",(-a.w*scale)+"px"); d.style.animation=`hwframes ${frames/fps}s steps(${frames}) infinite`; }
    layer().append(d); return d;
  }
  function caption(text,ms=2600){ const c=document.createElement("div"); c.className="hwcap"; c.textContent=text; layer().append(c); gone(c,ms); }
  function bats(n,ms=4200){ for(let i=0;i<n;i++){ const b=spr("bat",{frames:4,fps:10,scale:R(2.2,3.4),cls:"hwbat"}); b.style.top=R(5,55)+"%"; b.style.animationDelay="0s,"+R(0,1.2)+"s"; b.style.setProperty("--dur",R(2.6,4)+"s"); if(i%2) b.classList.add("rev"); gone(b,ms+1400); } }
  function candyRain(n,ms=4500,set="candy",count=8){ for(let i=0;i<n;i++){ const c=spr(set,{cell:16,frame:Math.floor(R(0,count)),scale:R(2.5,3.6),cls:"hwfall"}); c.style.left=R(2,92)+"%"; c.style.animationDelay=R(0,1.6)+"s"; c.style.setProperty("--rot",R(-260,260)+"deg"); gone(c,ms); } }
  const buzz=p=>{ if(navigator.vibrate) navigator.vibrate(p); };
  return {
    boo(){
      const f=document.createElement("div"); f.className="qx-flash"; layer().append(f); gone(f,900);
      const g=spr("ghost",{frames:4,fps:8,scale:Math.min(9,innerWidth/40),cls:"hwboo"}); gone(g,1100); buzz(120);
    },
    emfGhost(){ const g=spr("ghost",{frames:4,fps:6,scale:6,cls:"hwdrift"}); g.style.top=R(25,45)+"%"; gone(g,3200); },
    trickOrTreat(){
      const j=spr("jacko",{scale:Math.min(3.2,innerHeight/190),cls:"hwrise"}); gone(j,4600);
      setTimeout(()=>{ candyRain(26); buzz([40,60,40]); },500);
      bats(5); caption("TRICK OR TREAT!",3200);
    },
    halloween(){
      for(let i=0;i<14;i++){ const pmk=spr("candy",{cell:16,frame:i%2,scale:R(2.5,4),cls:"hwfloat"}); pmk.style.left=R(0,92)+"%"; pmk.style.animationDelay=R(0,2)+"s"; gone(pmk,5600); }
      bats(7,5000); caption("HAPPY HALLOWEEN 🎃",2800);
    },
    dayOfTheDead(){
      const sc=Math.max(2.4,Math.min(4,innerWidth/170));
      const band=document.createElement("div"); band.className="hwrow hwband"; layer().append(band);
      const dance=document.createElement("div"); dance.className="hwrow hwdance"; layer().append(dance);
      for(let i=0;i<4;i++){ band.append(spr("dotd",{frames:4,row:i,rowH:36,fps:6,scale:sc,cls:"hwin"})); dance.append(spr("dotd",{frames:4,row:4+i,rowH:36,fps:7,scale:sc,cls:"hwin"})); }
      candyRain(16,6000,"skulls",6);
      caption("¡DÍA DE LOS MUERTOS!",3600); gone(band,6400); gone(dance,6400);
    },
    reaper(){
      const v=document.createElement("div"); v.className="hwdark"; layer().append(v); gone(v,4600);
      const r=spr("reaper",{frames:4,fps:5,scale:Math.min(6,innerWidth/50),cls:"hwwalk"}); gone(r,4600);
      bats(3,4000); caption("☠ YOUR TIME IS UP…",3000); buzz([20,200,20]);
    },
    witch(){
      const w=spr("witch",{frames:4,fps:5,scale:Math.min(5,innerWidth/60),cls:"hwwitch"}); gone(w,5200);
      for(let i=0;i<18;i++){ const b=document.createElement("i"); b.className="hwbubble"; b.style.left=`calc(50% + ${R(-40,40)}px)`; b.style.animationDelay=R(0,3.4)+"s"; b.style.setProperty("--sz",R(6,16)+"px"); layer().append(b); gone(b,5200); }
      caption("DOUBLE, DOUBLE, TOIL AND TROUBLE",3400);
    }
  };
})();

/* ===== interactive high five =====
   Someone says "high five" while others are in the chat → everyone else gets a "✋ High five back!" button for 15s.
   Tap it and both of you get the big double slap (and your Social Bond grows). Nobody taps → the sender is left hanging. */
const HIFIVE_RE=/hi-?five|hi-?5\b|high[- ]?five/i, HIFIVE_MS=15000;
const hifiveSeen=new Set(), hifiveMine=new Map();   // msg ids already handled · my open high fives (id → {timer, got})
const hfFx=()=>fxEnabled()&&!reducedMotion();
function othersHere(){ return [...online.keys()].filter(id=>id!==user?.id&&whereIs(id)?.room===room&&!blocked.has(id)).length + (!sb&&room==="5959"?1:0); }
function maybeHifive(m){
  if(!m||typeof m.id!=="number"||hifiveSeen.has(m.id)||!HIFIVE_RE.test(m.text||"")) return;
  if(Date.now()-new Date(m.created_at)>HIFIVE_MS-2000) return;   // only live ones, not old history
  hifiveSeen.add(m.id);
  if(m.user_id===user.id){
    if(!othersHere()) return;                                       // nobody around: just the normal animation
    const t=setTimeout(()=>{ const h=hifiveMine.get(m.id); hifiveMine.delete(m.id); if(h&&!h.got) hifiveHanging(); },HIFIVE_MS+1500);
    hifiveMine.set(m.id,{timer:t,got:0});
  } else if(m.room===room||!m.room){ setTimeout(()=>hifivePrompt(m),hfFx()?900:0); }   // let the hands finish first
}
function hifivePrompt(m){
  if(m.room&&m.room!==room) return;
  document.querySelector(".hfprompt")?.remove();
  const box=el("div","hfprompt"); box.setAttribute("role","alert");
  const txt=el("span","hftext",`✋ ${nameOf(m.user_id)} wants a high five!`);
  const btn=el("button","go hfbtn","✋ High five back!"); btn.type="button";
  const bar=el("i","hfbar"); bar.style.animationDuration=HIFIVE_MS+"ms";
  const x=el("button","hfx","✕"); x.type="button"; x.setAttribute("aria-label","Ignore");
  box.append(txt,btn,x,bar);
  const done=()=>{ clearTimeout(tm); box.classList.add("out"); setTimeout(()=>box.remove(),250); };
  const tm=setTimeout(done,HIFIVE_MS);
  btn.onclick=()=>{
    done();
    try{ unsub?.hifive?.({kind:"back",msg:m.id,to:m.user_id,toName:nameOf(m.user_id),from:user.id,name:nameOf(user.id)}); }catch(e){}
    hifiveCelebrate(nameOf(m.user_id),true); bumpLink(m.user_id);
  };
  x.onclick=done;
  $("sendForm").before(box); btn.focus({preventScroll:true});
}
function onHifiveSignal(p){
  if(!p||p.kind!=="back"||p.from===user.id||blocked.has(p.from)) return;
  const who=p.name||nameOf(p.from);
  if(p.to===user.id){
    const h=hifiveMine.get(p.msg); if(h){ h.got++; if(h.got===1){ clearTimeout(h.timer); setTimeout(()=>hifiveMine.delete(p.msg),HIFIVE_MS); } }
    hifiveCelebrate(who,false);   // (the person who tapped grows the bond, so it only counts once)
  } else $("status").textContent=`🙌 ${who} high-fived ${p.to===user.id?"you":(p.toName||nameOf(p.to))}!`;
}
function hifiveCelebrate(name,iTapped){
  $("status").textContent=iTapped?`🙌 You high-fived ${name}!`:`🙌 ${name} high-fived you back!`;
  if(navigator.vibrate) navigator.vibrate([30,40,60]);
  if(!hfFx()) return;
  QX.hifive();
  setTimeout(()=>{ const n=document.createElement("div"); n.className="hf-nice"; n.textContent="NICE!"; n.append(el("small","",iTapped?"you + "+name:name+" + you")); $("sfx").append(n); setTimeout(()=>n.remove(),1700); },380);
}
function hifiveHanging(){
  $("status").textContent="😅 Left hanging… nobody high-fived back.";
  if(!hfFx()) return;
  const n=document.createElement("div"); n.className="hf-hang"; n.textContent="✋"; $("sfx").append(n); setTimeout(()=>n.remove(),1800);
}
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"trickortreat", name:"Trick or treat", re:/trick[- ]or[- ]treat/i, play:()=>HW.trickOrTreat()},
  {id:"dayofthedead", name:"Día de los Muertos", re:/d[ií]a de (los )?muertos|day of the dead/i, play:()=>HW.dayOfTheDead()},
  {id:"grimreaper", name:"Grim Reaper", re:/grim reaper|(don'?t )?fear the reaper/i, play:()=>HW.reaper()},
  {id:"toilandtrouble", name:"Toil and trouble", re:/toil and trouble|hocus[- ]pocus/i, play:()=>HW.witch()},
  {id:"hifive", name:"Hi-five", re:/hi-?five|hi-?5\b|high[- ]?five/i, play:m=>QX.hifive(m)}
);
QX.xen=function(){
  const layer=$("sfx");
  for(let i=0;i<9;i++){ const d=document.createElement("div"); d.className="xen-puff"; d.style.left=(8+Math.random()*80)+"%"; d.style.animationDelay=(i*.18)+"s"; layer.append(d); setTimeout(()=>d.remove(),3600); }
  const c=document.createElement("div"); c.className="sx-caption xen-cap"; c.textContent="🌿 puff puff pass"; layer.append(c); setTimeout(()=>c.remove(),2600);
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"xen", name:"Xen's stash", re:/(^|[^a-z])xen([^a-z]|$)/i, when:()=>isDm, play:()=>QX.xen()}
);
Object.assign(HINTS,{ xen:"Say a certain little brother's name, but only in a private chat." });
/* "War has changed": an old war-film look, a gloved hand takes a drag (the ember glows), smoke curls up,
   and the line types itself out like a title card. The hand and cigarette are an original drawing. */
QX.war=function(){
  document.getElementById("warLayer")?.remove();
  const layer=document.createElement("div"); layer.id="warLayer"; document.body.append(layer);   // its own layer, so other effects (like the secret-found celebration) can't wipe it mid-scene
  const film=el("div","war-film"); layer.append(film);
  const hand=document.createElement("div"); hand.className="war-hand";
  hand.innerHTML=`<svg viewBox="0 0 220 200" aria-hidden="true">
    <path d="M-10 200 L40 118 L92 104 L118 132 L70 200 Z" fill="#4a4f32" stroke="#07041a" stroke-width="5"/>
    <path d="M40 118 L92 104 L98 116 L46 132 Z" fill="#383c25"/>
    <path d="M86 108 C96 86 118 78 136 84 L150 96 C156 104 150 114 140 112 L128 110 L124 126 C118 142 100 148 90 136 Z" fill="#23201c" stroke="#07041a" stroke-width="5" stroke-linejoin="round"/>
    <path d="M132 86 C142 82 158 84 164 92 C168 98 162 104 154 102 L140 98 Z" fill="#c9926b" stroke="#07041a" stroke-width="4"/>
    <path d="M140 110 C150 108 164 110 168 118 C170 124 164 128 156 126 L136 122 Z" fill="#c9926b" stroke="#07041a" stroke-width="4"/>
    <rect x="146" y="95" width="62" height="11" rx="2" transform="rotate(-14 146 100)" fill="#f2efe6" stroke="#07041a" stroke-width="3"/>
    <rect x="146" y="95" width="16" height="11" rx="2" transform="rotate(-14 146 100)" fill="#d9a441" stroke="#07041a" stroke-width="3"/>
    <circle class="war-ember" cx="208" cy="85" r="6"/>
  </svg>`;
  layer.append(hand);
  for(let i=0;i<7;i++){ const sm=el("div","war-smoke"); sm.style.animationDelay=(1.1+i*.32)+"s"; sm.style.setProperty("--dx",(Math.random()*60-20)+"px"); layer.append(sm); }
  const cap=el("div","war-cap"); layer.append(cap);
  const line="War has changed."; let k=0;
  setTimeout(()=>{ const t=setInterval(()=>{ cap.textContent=line.slice(0,++k); if(k>=line.length) clearInterval(t); },85); },900);
  if(navigator.vibrate) navigator.vibrate([20,80,20]);
  setTimeout(()=>{ [film,hand,cap].forEach(n=>n.classList.add("out")); },4600);
  setTimeout(()=>layer.remove(),5400);
};
/* ===== Game + horror secrets (original visuals: nods to the vibe and famous lines, no copyrighted art) ===== */
function sxLayer(id,ms){   // each scene gets its own layer so other effects can't cut it short
  document.getElementById(id)?.remove();
  const L=document.createElement("div"); L.id=id; L.className="sxscene"; document.body.append(L);
  setTimeout(()=>L.classList.add("out"),ms-700); setTimeout(()=>L.remove(),ms); return L;
}
const sxCap=(L,text,cls="")=>{ const c=el("div","sxcap "+cls,text); L.append(c); return c; };
QX.artyom=function(){   // Metro: gas-mask visor fogs, cracks, filter timer runs out, hiss
  const L=sxLayer("sxArtyom",6200);
  L.innerHTML=`<div class="gm-visor"></div><div class="gm-fog"></div>
    <svg class="gm-crack" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M78 8 L70 22 L74 30 L64 44 L68 50 L58 62 M70 22 L82 30 M64 44 L52 46 M68 50 L80 58" /></svg>
    <div class="gm-watch"><b>00:05</b><span>FILTER</span></div>`;
  let t=5; const w=L.querySelector(".gm-watch b");
  const iv=setInterval(()=>{ t--; w.textContent="00:0"+Math.max(0,t); if(t<=0){ clearInterval(iv); L.classList.add("swap"); sxCap(L,"🫁 *hiss* Filter changed"); if(navigator.vibrate) navigator.vibrate([10,40,10,40,120]); } },800);
};
QX.forhonor=function(){   // For Honor: two blades clash with sparks
  const L=sxLayer("sxHonor",3600);
  const blade=`<svg viewBox="0 0 40 240"><path d="M20 0 L30 150 L20 170 L10 150 Z" fill="#dfe6f0" stroke="#07041a" stroke-width="4"/><rect x="0" y="168" width="40" height="12" fill="#b08a3a" stroke="#07041a" stroke-width="4"/><rect x="14" y="180" width="12" height="46" fill="#4a2e1a" stroke="#07041a" stroke-width="4"/><circle cx="20" cy="232" r="8" fill="#b08a3a" stroke="#07041a" stroke-width="4"/></svg>`;
  L.innerHTML=`<div class="fh-blade left">${blade}</div><div class="fh-blade right">${blade}</div>`;
  setTimeout(()=>{ document.body.animate([{transform:"translate(0,0)"},{transform:"translate(-9px,5px)"},{transform:"translate(8px,-6px)"},{transform:"translate(-4px,3px)"},{transform:"none"}],{duration:380});
    const fl=el("div","fh-flash"); L.append(fl);
    for(let i=0;i<22;i++){ const sp=el("i","fh-spark"); sp.style.setProperty("--a",(Math.random()*360)+"deg"); sp.style.setProperty("--d",(60+Math.random()*120)+"px"); sp.style.animationDelay=(Math.random()*.08)+"s"; L.append(sp); }
    sxCap(L,"⚔️ FOR HONOR!","fh-cap"); if(navigator.vibrate) navigator.vibrate(90); },520);
};
QX.steak=function(){   // Monster Hunter: meat on the spit, then WELL DONE!
  const L=sxLayer("sxSteak",4200);
  L.innerHTML=`<div class="mh-spit"><div class="mh-meat">🍖</div><div class="mh-fire">🔥🔥🔥</div></div>`;
  setTimeout(()=>{ L.querySelector(".mh-meat").classList.add("done"); sxCap(L,"WELL DONE! ✨","mh-cap"); if(navigator.vibrate) navigator.vibrate([30,30,60]); },2300);
};
QX.palico=function(){   // Monster Hunter: paw prints trot across, a cat peeks up
  const L=sxLayer("sxPalico",4400);
  for(let i=0;i<9;i++){ const pw=el("span","mh-paw","🐾"); pw.style.left=(4+i*11)+"%"; pw.style.top=(62-i*5+(i%2?6:0))+"%"; pw.style.animationDelay=(i*.22)+"s"; L.append(pw); }
  setTimeout(()=>{ L.append(el("div","mh-cat","🐱")); sxCap(L,"Meow! Ready to hunt, meowster!","mh-cap small"); },2100);
};
QX.johnny=function(){   // The Shining: three axe hits crack the screen
  const L=sxLayer("sxJohnny",4400);
  const cracks=[`M55 38 L56 24 L54 12 L55 0 M61 40 L62 28 L60 16`,`M55 50 L56 64 L54 78 L55 100 M49 42 L48 28 L50 14 M62 50 L63 66 L61 80`,`M47 50 L46 64 L48 76 M66 44 L67 30 M66 50 L68 62 L67 74 M44 44 L43 34`];   // wood splits along the grain
  L.innerHTML=`<svg class="jh-crack" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>`;
  const svg=L.querySelector("svg");
  cracks.forEach((d,i)=>setTimeout(()=>{ const pth=document.createElementNS("http://www.w3.org/2000/svg","path"); pth.setAttribute("d",d); svg.append(pth);
    document.body.animate([{transform:"none"},{transform:"translate(10px,-6px) rotate(.6deg)"},{transform:"translate(-8px,5px)"},{transform:"none"}],{duration:260});
    if(navigator.vibrate) navigator.vibrate(70);
    if(i===2){ L.append(el("div","jh-hole")); sxCap(L,"HERE'S JOHNNY!","jh-cap"); } },300+i*700));
};
QX.balloon=function(){   // It: one red balloon drifts up a darkened screen
  const L=sxLayer("sxBalloon",6000); L.classList.add("dim");
  L.innerHTML=`<svg class="it-balloon" viewBox="0 0 60 150"><ellipse cx="30" cy="34" rx="24" ry="30" fill="#d4141f" stroke="#5a0006" stroke-width="3"/><ellipse cx="21" cy="22" rx="6" ry="9" fill="rgba(255,255,255,.35)"/><path d="M26 63 L34 63 L30 70 Z" fill="#8f0a12"/><path d="M30 70 C22 90 38 104 28 122 C22 134 32 142 30 150" fill="none" stroke="#e8e0d0" stroke-width="2"/></svg>`;
  setTimeout(()=>sxCap(L,"🎈 we all float down here…","it-cap"),1800);
};
QX.theyrehere=function(){   // Poltergeist: TV static with a handprint on the glass
  const L=sxLayer("sxStatic",4400);
  const cv=document.createElement("canvas"); cv.className="tv-static"; cv.width=160; cv.height=280; L.append(cv);
  const ctx=cv.getContext("2d"), img=ctx.createImageData(160,280); let on=true;
  const draw=()=>{ if(!on) return; for(let i=0;i<img.data.length;i+=4){ const v=Math.random()*255|0; img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=255; } ctx.putImageData(img,0,0); requestAnimationFrame(draw); }; draw();
  L.append(el("div","tv-scan"));
  setTimeout(()=>{ L.append(el("div","tv-hand","🖐️")); sxCap(L,"they're here…","tv-cap"); },1400);
  setTimeout(()=>{ on=false; },4400);
};
/* ===== Rice's references (original visuals) ===== */
QX.ein=function(){ const L=sxLayer("sxEin",3200); L.append(el("div","ein-dog","🐕")); setTimeout(()=>sxCap(L,"woof!","ein-cap"),900); };
QX.arcanaAll=function(){
  const L=sxLayer("sxArcana",5200); L.classList.add("dim");
  const names=Object.keys(ARCANA_ART).sort(()=>Math.random()-.5).slice(0,7);
  names.forEach((n,i)=>{ const c=el("div","ar-card"); c.style.setProperty("--a",((i-3)*14)+"deg"); c.style.animationDelay=(i*.12)+"s";
    c.innerHTML=`<div class="ar-back">✦</div><div class="ar-front"><img src="${ARCANA_ART[n]}" alt=""></div>`; L.append(c); });
  setTimeout(()=>sxCap(L,"✦ all is revealed ✦","ar-cap"),1900);
};
QX.emc2=function(){
  const L=sxLayer("sxEmc",3600);
  L.innerHTML=`<svg class="emc-atom" viewBox="0 0 200 200"><g fill="none" stroke="#00f0ff" stroke-width="4"><ellipse cx="100" cy="100" rx="90" ry="32"/><ellipse cx="100" cy="100" rx="90" ry="32" transform="rotate(60 100 100)"/><ellipse cx="100" cy="100" rx="90" ry="32" transform="rotate(-60 100 100)"/></g><circle cx="100" cy="100" r="14" fill="#f3ff3a"/></svg>`;
  setTimeout(()=>{ L.append(el("div","emc-flash")); sxCap(L,"E = mc²","emc-cap"); if(navigator.vibrate) navigator.vibrate(60); },1500);
};
QX.asabove=function(){
  const c=$("chat"); c.classList.remove("sx-flip"); void c.offsetWidth; c.classList.add("sx-flip"); setTimeout(()=>c.classList.remove("sx-flip"),3400);
  const L=sxLayer("sxAbove",3400); setTimeout(()=>sxCap(L,"…so below.","above-cap"),700);
};
QX.wassup=function(){
  const L=sxLayer("sxWassup",3200); const w=el("div","ws-word"); L.append(w); const txt="WAAASSSUUUUP!"; let k=0;
  const iv=setInterval(()=>{ w.textContent=txt.slice(0,++k); if(k>=txt.length) clearInterval(iv); },70);
  for(let i=0;i<6;i++){ const t=el("span","ws-tongue","👅"); t.style.left=(8+i*15)+"%"; t.style.animationDelay=(1+i*.1)+"s"; L.append(t); }
};
QX.slasher=function(){
  const L=sxLayer("sxSlash",2600);
  for(let i=0;i<3;i++){ const sl=el("div","sl-cut"); sl.style.top=(30+i*14)+"%"; sl.style.animationDelay=(i*.13)+"s"; L.append(sl); }
  setTimeout(()=>{ document.body.animate([{transform:"none"},{transform:"translate(-6px,4px)"},{transform:"none"}],{duration:200}); if(navigator.vibrate) navigator.vibrate([30,40,30,40,30]); },150);
};
QX.sharknado=function(){
  const L=sxLayer("sxShark",4200);
  const tw=el("div","sn-twister"); for(let i=0;i<12;i++){ const s2=el("span","sn-shark","🦈"); s2.style.setProperty("--y",(i*7)+"%"); s2.style.setProperty("--r",(18+i*4)+"vw"); s2.style.animationDelay=(-i*.18)+"s"; tw.append(s2); } L.append(tw);
  setTimeout(()=>sxCap(L,"SHARKNADO!","sn-cap"),1400);
};
QX.fnaf=function(){
  const L=sxLayer("sxFnaf",6400);
  L.innerHTML=`<canvas class="tv-static fn-static" width="120" height="200"></canvas><div class="fn-hud"><b>CAM 1A</b><span class="fn-rec">● REC</span></div><div class="fn-power">Power left: <b>3%</b></div>`;
  const cv=L.querySelector("canvas"), ctx=cv.getContext("2d"), img=ctx.createImageData(120,200); let on=true;
  const draw=()=>{ if(!on) return; for(let i=0;i<img.data.length;i+=4){ const v=Math.random()*255|0; img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=255; } ctx.putImageData(img,0,0); requestAnimationFrame(draw); }; draw();
  const pw=L.querySelector(".fn-power b"); let n=3; const iv=setInterval(()=>{ n--; pw.textContent=Math.max(0,n)+"%"; if(n<=0) clearInterval(iv); },500);
  setTimeout(()=>{ on=false; L.classList.add("fn-dark"); L.innerHTML=`<div class="fn-eyes"><i></i><i></i></div>`; if(navigator.vibrate) navigator.vibrate([10,60,10]); },1900);
  setTimeout(()=>{ L.classList.remove("fn-dark"); L.classList.add("fn-dawn"); L.innerHTML=""; sxCap(L,"6 AM ☀️","fn-cap"); if(navigator.vibrate) navigator.vibrate([40,40,40,40,120]); },4300);
};
QX.horhor=function(){
  const c=$("chat"); c.classList.remove("sx-flicker"); void c.offsetWidth; c.classList.add("sx-flicker"); setTimeout(()=>c.classList.remove("sx-flicker"),2800);
  const L=sxLayer("sxHor",3000); ["hor","hor","hor…"].forEach((w,i)=>setTimeout(()=>{ const x=el("div","hor-word",w); x.style.top=(34+i*12)+"%"; x.style.left=(18+i*18)+"%"; L.append(x); },300+i*600));
};
QX.cutdeep=function(){
  const L=sxLayer("sxMist",4600);
  for(let i=0;i<5;i++){ const m=el("div","mist"); m.style.top=(i*20-10)+"%"; m.style.animationDelay=(i*.25)+"s"; L.append(m); }
  setTimeout(()=>L.append(el("div","mist-glint")),1500);
};
QX.rainday=function(){
  const L=sxLayer("sxRain",5600); L.classList.add("rd-sky"); L.append(el("div","rd-sun","☀️"));
  setTimeout(()=>{ for(let i=0;i<16;i++){ const d=el("i","rd-drop"); d.style.left=(44+Math.random()*12)+"%"; d.style.animationDelay=(Math.random()*1.6)+"s"; L.append(d); } },1200);
  setTimeout(()=>sxCap(L,"…it's raining.","rd-cap"),2400);
};
/* Madoka Magica: a glowing gem clouds over with despair and cracks (original drawing) */
QX.meguca=function(){
  const L=sxLayer("sxMeguca",5200); L.classList.add("dim");
  L.innerHTML=`<div class="mg-gem"><svg viewBox="0 0 100 140"><defs><radialGradient id="mgGlow" cx="45%" cy="40%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ff9ad5"/><stop offset="1" stop-color="#c2187a"/></radialGradient></defs>
    <path d="M50 4 C78 30 92 62 92 84 C92 112 72 134 50 134 C28 134 8 112 8 84 C8 62 22 30 50 4Z" fill="url(#mgGlow)" stroke="#07041a" stroke-width="4"/>
    <path class="mg-dark" d="M50 4 C78 30 92 62 92 84 C92 112 72 134 50 134 C28 134 8 112 8 84 C8 62 22 30 50 4Z" fill="#12021a"/>
    <path class="mg-crack" d="M50 20 L44 48 L56 62 L42 86 L54 104 L48 128" fill="none" stroke="#ff4db8" stroke-width="3"/></svg></div>`;
  const cap=sxCap(L,"","mg-cap"); const line="being meguca is suffering"; let k=0;
  setTimeout(()=>{ const iv=setInterval(()=>{ cap.textContent=line.slice(0,++k); if(k>=line.length) clearInterval(iv); },60); },1800);
};
/* Chiikawa-style cuteness (no characters): a squishy "uwa!!" with bouncing dango, and the Mochi theme unlocks */
QX.uwa=function(){
  const L=sxLayer("sxUwa",3600);
  const w=el("div","uwa-word","uwa!!"); L.append(w);
  for(let i=0;i<7;i++){ const d=el("span","uwa-dango",["🍡","🍙","🍮","✨"][i%4]); d.style.left=(8+i*13)+"%"; d.style.animationDelay=(i*.09)+"s"; L.append(d); }
  if(!hasSecret("uwa")) setTimeout(()=>sxCap(L,"🍡 Mochi theme unlocked in Theme & colors","uwa-cap small"),1600);
  if(navigator.vibrate) navigator.vibrate([15,30,15]);
};
/* Yuri (百合, "lily"): the old line gets broken apart by blooming lilies, and the punchline takes its place */
QX.yuri=function(){
  const L=sxLayer("sxYuri",5600);
  const lily=`<svg viewBox="0 0 60 60"><g stroke="#07041a" stroke-width="2" stroke-linejoin="round"><path d="M30 34 C22 20 22 8 30 2 C38 8 38 20 30 34Z" fill="#fff"/><path d="M30 34 C18 30 8 22 6 12 C16 12 26 20 30 34Z" fill="#fdf2f7"/><path d="M30 34 C42 30 52 22 54 12 C44 12 34 20 30 34Z" fill="#fdf2f7"/><path d="M30 34 C20 40 12 50 12 58 C22 54 28 44 30 34Z" fill="#fff"/><path d="M30 34 C40 40 48 50 48 58 C38 54 32 44 30 34Z" fill="#fff"/></g><circle cx="30" cy="32" r="3.5" fill="#ffcf5a"/></svg>`;
  const old=el("div","yu-old"); "girls can't love girls".split(" ").forEach((w,i)=>{ const sp=el("span","yu-w",w); sp.style.setProperty("--dx",((i-1.5)*60)+"px"); sp.style.setProperty("--r",((i%2?1:-1)*(20+i*8))+"deg"); old.append(sp); });
  L.append(old);
  setTimeout(()=>{ for(let i=0;i<9;i++){ const f=el("div","yu-lily"); f.innerHTML=lily; f.style.left=(6+i*10.5)+"%"; f.style.animationDelay=(i*.07)+"s"; L.append(f); }
    old.classList.add("broken"); if(navigator.vibrate) navigator.vibrate([20,30,40]); },1300);
  setTimeout(()=>{ sxCap(L,"…yes they can 💕","yu-cap");
    for(let i=0;i<12;i++){ const h=el("span","yu-float",i%3?"💕":"🌸"); h.style.left=(Math.random()*90+2)+"%"; h.style.animationDelay=(Math.random()*.8)+"s"; L.append(h); } },2100);
};
/* Gurren Lagann: a spiral drill rises through a blue sky and pierces the heavens (original drawing) */
QX.believe=function(line){
  line=line||"Believe in the you that believes in yourself.";
  const L=sxLayer("sxBelieve",6400); L.classList.add("gl-sky");
  for(let i=0;i<4;i++){ const c=el("div","gl-cloud"); c.style.top=(12+i*18)+"%"; c.style.animationDelay=(-i*1.3)+"s"; L.append(c); }
  const d=el("div","gl-drill"); d.innerHTML=`<svg viewBox="0 0 80 160"><defs><clipPath id="glCone"><path d="M40 2 L74 150 L6 150Z"/></clipPath></defs>
    <path d="M40 2 L74 150 L6 150Z" fill="#c9d3dc" stroke="#07041a" stroke-width="4"/>
    <g clip-path="url(#glCone)" class="gl-spiral">${[...Array(12)].map((_,i)=>`<path d="M-20 ${i*16} L100 ${i*16-40}" stroke="#6b7c8a" stroke-width="6"/>`).join("")}</g>
    <path d="M40 2 L74 150 L6 150Z" fill="none" stroke="#07041a" stroke-width="4"/><rect x="2" y="148" width="76" height="12" rx="3" fill="#e8552d" stroke="#07041a" stroke-width="4"/></svg>`;
  L.append(d);
  setTimeout(()=>{ L.append(el("div","gl-flash")); ["-28deg","22deg"].forEach(a=>{ const b=el("div","gl-beam"); b.style.setProperty("--a",a); L.append(b); });
    document.body.animate([{transform:"none"},{transform:"translate(-8px,6px)"},{transform:"translate(7px,-5px)"},{transform:"none"}],{duration:420}); if(navigator.vibrate) navigator.vibrate([40,30,80]);
    const cap=sxCap(L,"","gl-cap"); let k=0;
    const iv=setInterval(()=>{ cap.textContent=line.slice(0,++k); if(k>=line.length) clearInterval(iv); },45); },2000);
};
/* ===== more Gurren Lagann (original visuals) ===== */
function glSpeedLines(L){ const sl=el("div","gl-speed"); L.append(sl); return sl; }
QX.justwho=function(){
  const L=sxLayer("sxJustWho",4800); glSpeedLines(L);
  for(let i=0;i<14;i++){ const f=el("span","gl-flame","🔥"); f.style.left=(i*7.5)+"%"; f.style.animationDelay=(i%4*.08)+"s"; L.append(f); }
  setTimeout(()=>{ const c=sxCap(L,"JUST WHO THE HELL DO YOU THINK I AM?!","gl-slam"); document.body.animate([{transform:"none"},{transform:"translate(-10px,7px) rotate(-.6deg)"},{transform:"translate(9px,-6px)"},{transform:"translate(-5px,3px)"},{transform:"none"}],{duration:500}); if(navigator.vibrate) navigator.vibrate([60,40,120]); },500);
};
QX.rowrow=function(){
  const L=sxLayer("sxRowRow",5200); L.classList.add("dim");
  const sp=el("div","gl-spiral-big"); L.append(sp);
  [0,1,2,3].forEach(i=>setTimeout(()=>{ document.body.animate([{transform:"scale(1)"},{transform:"scale(1.025)"},{transform:"scale(1)"}],{duration:260}); sp.animate([{filter:"brightness(1)"},{filter:"brightness(1.8)"},{filter:"brightness(1)"}],{duration:300}); if(navigator.vibrate) navigator.vibrate(35); },500+i*520));
  setTimeout(()=>sxCap(L,"🔥 FIGHT! 🔥","gl-slam"),2700);
};
QX.kickreason=function(){
  const L=sxLayer("sxKick",4800);
  const blk=el("div","gl-reason","REASON"); L.append(blk);
  const boot=el("div","gl-boot","👢"); L.append(boot);
  setTimeout(()=>{ blk.classList.add("gone"); if(navigator.vibrate) navigator.vibrate(70); },900);
  setTimeout(()=>{ glSpeedLines(L); sxCap(L,"DO THE IMPOSSIBLE!","gl-slam"); },1500);
};
QX.gigadrill=function(){
  const c=$("chat"); c.classList.remove("gl-charge"); void c.offsetWidth; c.classList.add("gl-charge"); setTimeout(()=>c.classList.remove("gl-charge"),1500);
  const L=sxLayer("sxGiga",5000);
  setTimeout(()=>{ const d=el("div","gl-drill gl-giga"); d.innerHTML=`<svg viewBox="0 0 80 160"><defs><clipPath id="glCone2"><path d="M40 2 L74 150 L6 150Z"/></clipPath></defs><path d="M40 2 L74 150 L6 150Z" fill="#c9d3dc" stroke="#07041a" stroke-width="4"/><g clip-path="url(#glCone2)" class="gl-spiral">${[...Array(12)].map((_,i)=>`<path d="M-20 ${i*16} L100 ${i*16-40}" stroke="#6b7c8a" stroke-width="6"/>`).join("")}</g><rect x="2" y="148" width="76" height="12" rx="3" fill="#e8552d" stroke="#07041a" stroke-width="4"/></svg>`; L.append(d); },1300);
  setTimeout(()=>{ L.append(el("div","gl-flash")); glSpeedLines(L); sxCap(L,"GIGA DRILL BREAK!!","gl-slam"); document.body.animate([{transform:"none"},{transform:"translate(-12px,8px)"},{transform:"translate(10px,-8px)"},{transform:"translate(-6px,4px)"},{transform:"none"}],{duration:550}); if(navigator.vibrate) navigator.vibrate([80,40,160]); },2100);
};
QX.gattai=function(){
  const L=sxLayer("sxGattai",3800);
  const a=el("div","gl-half left"), b=el("div","gl-half right"); L.append(a,b);
  setTimeout(()=>{ L.append(el("div","gl-shock")); L.append(el("div","gl-flash")); sxCap(L,"GATTAI!","gl-slam"); document.body.animate([{transform:"none"},{transform:"translate(0,8px)"},{transform:"none"}],{duration:300}); if(navigator.vibrate) navigator.vibrate([30,20,90]); },650);
};
/* ===== Jimmy's anime lines: TikTok-style captions, each word lights up red as it's "said" ===== */
QX.animeLine=function(text,mood,emoji){
  const words=text.split(/\s+/), per=Math.max(170,Math.min(300,2400/words.length));
  const L=sxLayer("sxLine",Math.round(words.length*per+2600)); L.classList.add("al-"+mood);
  if(mood==="hype") glSpeedLines(L);
  const em=el("div","al-emoji",emoji); L.append(em);
  const box=el("div","al-cap"); L.append(box);
  const spans=words.map(w=>{ const sp=el("span","al-w",w); box.append(sp," "); return sp; });
  spans.forEach((sp,i)=>setTimeout(()=>{ spans.forEach(x=>x.classList.remove("on")); sp.classList.add("on","seen"); },400+i*per));
  setTimeout(()=>spans.forEach(x=>x.classList.remove("on")),400+words.length*per+300);
};
/* (Jimmy's anime-line captions were removed in 2026.10.20x; "stay frosty" got its own action-movie scene below) */
/* Jimmy's idea: "it's right behind me, isn't it?" works with it / he / she / they, and the answer matches */
QX.behind=function(who){
  const L=sxLayer("sxBehind",6400); L.classList.add("bh-dark");
  L.append(el("div","bh-shadow"));
  const eyes=el("div","bh-eyes"); eyes.append(el("i"),el("i")); L.append(eyes);
  const ans={he:"…yes. He is.",she:"…yes. She is.",they:"…yes. They are.",it:"…yes. It is."}[who]||"…yes. It is.";
  setTimeout(()=>{ sxCap(L,ans,"bh-cap"); if(navigator.vibrate) navigator.vibrate([10,80,10,80,200]); },3000);
};
/* ===== Voltron: Legendary Defender (original visuals) ===== */
QX.formvoltron=function(){
  const L=sxLayer("sxVoltron",4400); L.classList.add("dim");
  [["#1c1c2e","0,-60vh","vt-core"],["#e0323c","-60vw,0","vt-armL"],["#2f7de1","60vw,0","vt-armR"],["#38c46a","-50vw,60vh","vt-legL"],["#f2c230","50vw,60vh","vt-legR"]].forEach(([c,from,cls],i)=>{
    const pc=el("div","vt-piece "+cls); pc.style.background=c; pc.style.setProperty("--from",from); pc.style.animationDelay=(i*.14)+"s"; L.append(pc); });
  setTimeout(()=>{ L.append(el("div","gl-shock")); L.append(el("div","gl-flash")); sxCap(L,"FORM VOLTRON!","gl-slam vt-cap");
    document.body.animate([{transform:"none"},{transform:"translate(0,9px)"},{transform:"translate(0,-4px)"},{transform:"none"}],{duration:420}); if(navigator.vibrate) navigator.vibrate([40,30,120]); },1350);
};
QX.blazingsword=function(){
  const L=sxLayer("sxSword",4200); L.classList.add("dim");
  L.append(el("div","bs-blade"),el("div","bs-guard"));
  setTimeout(()=>{ L.append(el("div","gl-flash")); sxCap(L,"BLAZING SWORD!","gl-slam"); if(navigator.vibrate) navigator.vibrate([30,20,90]); },1300);
};
QX.patience=function(){
  const L=sxLayer("sxFocus",4200); L.classList.add("pf-blur");
  L.append(el("div","pf-ring"));
  setTimeout(()=>{ L.classList.add("sharp"); sxCap(L,"Patience yields focus.","pf-cap"); },1700);
};
QX.vrepitsa=function(){
  const L=sxLayer("sxVrepit",3600); L.classList.add("vr-glow");
  const f=el("div","vr-fist","✊"); L.append(f);
  setTimeout(()=>{ document.body.animate([{transform:"none"},{transform:"translate(0,10px)"},{transform:"none"}],{duration:300}); sxCap(L,"VREPIT SA!","gl-slam vr-cap"); if(navigator.vibrate) navigator.vibrate(90); },650);
};
QX.quiznak=function(){
  const L=sxLayer("sxQuiznak",3000);
  L.append(el("div","qz-burst")); sxCap(L,"QUIZNAK?!","gl-slam qz-cap");
  if(navigator.vibrate) navigator.vibrate([20,20,20]);
};
QX.spacemall=function(){
  const L=sxLayer("sxMall",4800); L.classList.add("dim");
  for(let i=0;i<9;i++){ const it=el("span","sm-item",["🛍️","🛒","🛍️","🧃","🛍️","🎁","🛒","🍕","🛍️"][i]); it.style.top=(10+i*9)+"%"; it.style.animationDelay=(i*.25)+"s"; L.append(it); }
  setTimeout(()=>sxCap(L,"✨ SPACE MALL ✨","sm-cap"),900);
};
QX.sharpshooter=function(){
  const L=sxLayer("sxSharp",3600);
  const x=el("div","ss-cross"); L.append(x);
  setTimeout(()=>{ x.classList.add("locked"); L.append(el("div","gl-flash")); sxCap(L,"🎯 SHARPSHOOTER","gl-slam ss-cap"); if(navigator.vibrate) navigator.vibrate(60); },1500);
};
/* ===== more Steins;Gate (original visuals) ===== */
QX.steinsgate=function(){   // white screen full of black clockwork gears turning (original drawing)
  const L=sxLayer("sxSteins",6400); L.classList.add("sg-white");
  const gearPath=(teeth,r=50,depth=9,hole=14)=>{ let d=""; const n=teeth*2;
    for(let k=0;k<n;k++){ const a0=k/n*Math.PI*2, a1=(k+1)/n*Math.PI*2, rr=k%2?r:r+depth;
      const p=(a,rad)=>`${(60+rad*Math.cos(a)).toFixed(1)},${(60+rad*Math.sin(a)).toFixed(1)}`;
      d+=(k?"L":"M")+p(a0+.08,rr)+"L"+p(a1-.08,rr); }
    return d+`Z M${60+hole},60 a${hole},${hole} 0 1,0 ${-hole*2},0 a${hole},${hole} 0 1,0 ${hole*2},0Z`; };
  const spots=[[8,12,34,14],[30,8,20,10],[58,14,40,18],[88,10,24,11],[18,38,26,12],[46,40,46,20],[80,36,30,13],[6,64,36,16],[36,70,24,11],[62,66,38,17],[92,62,22,10],[20,92,30,13],[52,94,22,10],[80,88,40,18]];
  spots.forEach(([x,y,size,teeth],k)=>{
    const g=el("div","sg-gear"); g.style.left=x+"%"; g.style.top=y+"%"; g.style.width=g.style.height=`min(${size}vw,${size*4.4}px)`;
    g.style.animationDuration=(4+size/6).toFixed(1)+"s"; g.style.animationDirection=k%2?"reverse":"normal"; g.style.animationDelay=(-k*.37)+"s";
    const hands=k%4===1?`<line x1="60" y1="60" x2="60" y2="32" stroke="#fff" stroke-width="5" stroke-linecap="round"/><line x1="60" y1="60" x2="80" y2="66" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`:"";
    g.innerHTML=`<svg viewBox="0 0 120 120"><path d="${gearPath(teeth)}" fill="#0b0b0b" fill-rule="evenodd"/><circle cx="60" cy="60" r="30" fill="none" stroke="#0b0b0b" stroke-width="3" opacity=".5"/>${hands}</svg>`;
    g.style.opacity="0"; g.animate([{opacity:0,transform:"translate(-50%,-50%) scale(.6)"},{opacity:1,transform:"translate(-50%,-50%) scale(1)"}],{duration:600,delay:120+k*70,fill:"forwards",easing:"cubic-bezier(.2,1.2,.4,1)"});
    L.append(g); });
  setTimeout(()=>{ sxCap(L,"Welcome to the Steins;Gate world line.","sg-cap sg-dark"); if(!hasSecret("steinsgate")) setTimeout(()=>sxCap(L,"⚙️ Divergence theme unlocked in Theme & colors","sg-cap small sg-dark sg-unlock"),900); if(navigator.vibrate) navigator.vibrate([20,40,20,40,80]); },2000);
};
QX.fuhaha=function(){
  const c=$("chat"); c.classList.remove("sx-flicker"); void c.offsetWidth; c.classList.add("sx-flicker"); setTimeout(()=>c.classList.remove("sx-flicker"),2800);
  const L=sxLayer("sxFuhaha",3600);
  ["FUHA","HAHA","HAHA!"].forEach((w,i)=>setTimeout(()=>{ const x=el("div","fh-laugh",w); x.style.top=(26+i*14)+"%"; x.style.left=(10+i*22)+"%"; L.append(x); if(navigator.vibrate) navigator.vibrate(30); },200+i*450));
};
QX.christina=function(){
  const L=sxLayer("sxTina",3000);
  L.append(el("div","ct-anger","💢")); sxCap(L,"There's no -tina!","gl-slam ct-cap");
  document.body.animate([{transform:"none"},{transform:"translate(-6px,0)"},{transform:"translate(6px,0)"},{transform:"none"}],{duration:260});
};
QX.gelbanana=function(){
  const L=sxLayer("sxGel",4200);
  const b=el("div","gb-banana","🍌"); L.append(b);
  setTimeout(()=>{ b.classList.add("gel"); sxCap(L,"…it's gel now.","gb-cap"); },1400);
};
QX.phonewave=function(){
  const L=sxLayer("sxPhonewave",5200); L.classList.add("dim");
  L.innerHTML=`<div class="pw-box"><div class="pw-window"><div class="pw-plate"><span>📱</span></div></div><div class="pw-panel"><i></i><i></i><b>88</b></div></div>`;
  setTimeout(()=>{ for(let i=0;i<10;i++){ const z=el("i","pw-zap"); z.style.left=(30+Math.random()*40)+"%"; z.style.top=(30+Math.random()*25)+"%"; z.style.animationDelay=(i*.12)+"s"; L.append(z); } if(navigator.vibrate) navigator.vibrate([20,30,20,30,20]); },1200);
  setTimeout(()=>sxCap(L,"Phone Microwave (name subject to change)","pw-cap"),2200);
};
QX.readingsteiner=function(){
  const c=$("chat"); c.classList.remove("rs-shift"); void c.offsetWidth; c.classList.add("rs-shift"); setTimeout(()=>c.classList.remove("rs-shift"),2600);
  const L=sxLayer("sxSteiner",3400);
  for(let i=0;i<3;i++){ const r=el("div","rs-ring"); r.style.animationDelay=(i*.35)+"s"; L.append(r); }
  setTimeout(()=>sxCap(L,"…the world line shifted.","sg-cap"),1600);
};
QX.johntitor=function(){
  const L=sxLayer("sxTitor",6600); L.classList.add("jt-screen");
  const pre=el("pre","jt-text"); L.append(pre);
  const txt="> NEW POST\n> From: Time Traveler 0\n\nI am a time traveler from 2036.\nI came back for an old computer.\n\n_";
  let k=0; const iv=setInterval(()=>{ pre.textContent=txt.slice(0,++k); if(k>=txt.length) clearInterval(iv); },35);
};
QX.okarin=function(){
  const L=sxLayer("sxOkarin",4200);
  L.innerHTML=`<div class="ok-watch"><div class="ok-chain"></div><div class="ok-face"><i class="ok-hand h"></i><i class="ok-hand m"></i></div></div>`;
  setTimeout(()=>sxCap(L,"Okarin~ ⏱️","sg-cap"),1300);
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="microwave"),0,   // before the plain "microwave" secret, so "phone microwave" gets this one
  {id:"phonewave",   name:"Phone Microwave",   re:/phone ?microwave|phonewave/i, play:()=>QX.phonewave()}
);
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"steinsgate",  name:"Steins;Gate",       re:/(^|[^0-9.])1\.048596([^0-9]|$)|steins[; ]?gate/i, play:()=>QX.steinsgate()},
  {id:"fuhaha",      name:"Mad scientist",     re:/fu+ha+(ha)+|i am (a )?mad scientist/i, play:()=>QX.fuhaha()},
  {id:"christina",   name:"No -tina",          re:/(^|[^a-z])christina([^a-z]|$)/i, play:()=>QX.christina()},
  {id:"gelbanana",   name:"Gel banana",        re:/gel(led)? banana|gelnana/i, play:()=>QX.gelbanana()},
  {id:"readingsteiner",name:"Reading Steiner", re:/reading steiner/i, play:()=>QX.readingsteiner()},
  {id:"johntitor",   name:"Time traveler",     re:/john titor/i, play:()=>QX.johntitor()},
  {id:"okarin",      name:"Okarin",            re:/(^|[^a-z])okarin([^a-z]|$)/i, play:()=>QX.okarin()},
  {id:"formvoltron", name:"Form Voltron",      re:/(^|[^a-z])form voltron/i, play:()=>QX.formvoltron()},
  {id:"blazingsword",name:"Blazing sword",     re:/(form(ing)? (the )?)?blazing sword/i, play:()=>QX.blazingsword()},
  {id:"patience",    name:"Patience",          re:/patience yields focus/i, play:()=>QX.patience()},
  {id:"vrepitsa",    name:"Vrepit sa",         re:/(^|[^a-z])vrepit sa([^a-z]|$)/i, play:()=>QX.vrepitsa()},
  {id:"quiznak",     name:"Quiznak",           re:/(^|[^a-z])quiznak/i, play:()=>QX.quiznak()},
  {id:"spacemall",   name:"Space mall",        re:/(^|[^a-z])space mall([^a-z]|$)/i, play:()=>QX.spacemall()},
  {id:"sharpshooter",name:"Sharpshooter",      re:/(i'?m|i am) the sharpshooter/i, play:()=>QX.sharpshooter()},
  {id:"behind",     name:"Right behind me",    re:/(it|he|she|they)('?s|'?re| is| are) right behind me/i,
   play:m=>{ const w=((m&&m.text)||"").match(/(it|he|she|they)('?s|'?re| is| are) right behind me/i); QX.behind(w?w[1].toLowerCase():"it"); }},
  {id:"stayfrosty", name:"Stay frosty",       re:/(^|[^a-z])stay frosty/i, play:()=>QX.stayfrosty()},
  {id:"justwho",    name:"Who the hell",       re:/just who the (hell|heck) do (you|ya|u) think (i am|i'm)/i, play:()=>QX.justwho()},
  {id:"rowrow",     name:"Row, row",           re:/row,?\s*row,?\s*fight the power/i, play:()=>QX.rowrow()},
  {id:"kickreason", name:"Do the impossible",  re:/kick reason to the curb|do the impossible/i, play:()=>QX.kickreason()},
  {id:"gigadrill",  name:"Giga Drill Break",   re:/giga drill break/i, play:()=>QX.gigadrill()},
  {id:"gattai",     name:"Gattai!",            re:/(^|[^a-z])gattai([^a-z]|$)/i, play:()=>QX.gattai()},
  {id:"pierce",     name:"Pierce the heavens", re:/pierce the heavens/i, play:()=>QX.believe("PIERCE THE HEAVENS!!")},
  {id:"believe",    name:"Believe in yourself", re:/believe in the you that believes in yourself|believe in the me that believes in you/i, play:()=>QX.believe()},
  {id:"yuri",       name:"Lilies",            re:/(^|[^a-z])yuri([^a-z]|$)|百合/i, play:()=>QX.yuri()},
  {id:"meguca",     name:"Suffering",         re:/(^|[^a-z])meguca([^a-z]|$)/i, play:()=>QX.meguca()},
  {id:"uwa",        name:"Uwa!!",             re:/(^|[^a-z])uwa+h?([^a-z]|$)|^\s*una+[!~.…]*\s*$/i, play:()=>QX.uwa()},
  {id:"ein",        name:"Data dog",          re:/(^|[^a-z])ein([^a-z]|$)/i, play:()=>QX.ein()},
  {id:"allrevealed",name:"All is revealed",   re:/arcana is the means by which all is revealed|means by which all is revealed/i, play:()=>QX.arcanaAll()},
  {id:"emc2",       name:"Relativity",        re:/(^|[^a-z])e\s*=\s*mc(\^?2|²)/i, play:()=>QX.emc2()},
  {id:"asabove",    name:"As above",          re:/as above,?\s+so below/i, play:()=>QX.asabove()},
  {id:"wassup",     name:"Wassup",            re:/(^|[^a-z])wa+s+u+p+([^a-z]|$)|(^|[^a-z])wa+z+u+p+([^a-z]|$)/i, play:()=>QX.wassup()},
  {id:"slasher",    name:"Slasher",           re:/(^|[^a-z])slasher([^a-z]|$)/i, play:()=>QX.slasher()},
  {id:"sharknado",  name:"Sharknado",         re:/sharknado/i, play:()=>QX.sharknado()},
  {id:"fnaf",       name:"Night shift",       re:/five nights at freddy'?s|(^|[^a-z])fnaf([^a-z]|$)/i, play:()=>QX.fnaf()},
  {id:"horhor",     name:"Hor hor hor",       re:/(^|[^a-z])hor hor hor([^a-z]|$)/i, play:()=>QX.horhor()},
  {id:"cutdeep",    name:"Hidden mist",       re:/words cut deep|deeper than any blade/i, play:()=>QX.cutdeep()},
  {id:"rainday",    name:"Terrible day",      re:/terrible day for rain/i, play:()=>QX.rainday()}
);
Object.assign(HINTS,{
  ein:"The smartest crew member on the Bebop is a corgi. Say his name.",
  steinsgate:"The one world line where everyone's saved. Type its divergence number (starts with 1.04…).",
  fuhaha:"The mad scientist's evil laugh. Fuha…",
  christina:"A mad scientist's nickname for his assistant (she hates it).",
  gelbanana:"What the time machine did to the fruit before it worked.",
  phonewave:"The accidental time machine's full name, two gadgets squished together (name subject to change).",
  readingsteiner:"The power to remember what changed when the world line shifts.",
  johntitor:"A famous internet time traveler who claimed to be from 2036.",
  okarin:"What his childhood friend calls the mad scientist.",
  formvoltron:"Five pilots, five robot lions, one command. Form…",
  blazingsword:"The giant robot's legendary weapon: a sword that's on fire. Form the…",
  patience:"A calm team leader's lesson for the hothead: patience yields…",
  vrepitsa:"The purple empire's salute. Two words.",
  quiznak:"An old royal advisor's favorite space swear word.",
  spacemall:"The paladins went shopping in outer space. Where?",
  sharpshooter:"The blue paladin keeps reminding everyone what he is. I'm the…",
  behind:"A horror-movie character slowly realizes something is standing right behind them… isn't it?",
  stayfrosty:"What the sergeant tells his squad before things get loud. Stay…",
  justwho:"A big brother in shades yells a question that's really an answer: just who the hell…?",
  rowrow:"The battle chant from a certain drill anime's hype song. Row, row…",
  kickreason:"The team's motto says to kick something to the curb and do the impossible.",
  gigadrill:"The finishing move. Giga… what?",
  gattai:"The Japanese word robots shout when they combine.",
  pierce:"Your drill is the drill that will… (three words).",
  believe:"A big brother with a drill says: don't believe in me, and don't believe in yourself… believe in the you that… (finish it).",
  yuri:"The Japanese word for \"lily\" is also the name of a genre about girls in love. Say it.",
  meguca:"Contracting with a certain white creature turns out badly. Being a magical girl is… (say it the meme way).",
  uwa:"Tiny, round, and always a little overwhelmed. Make the little cry they make.",
  allrevealed:"A velvet-room host says the Arcana is the means by which… finish his line.",
  emc2:"The most famous equation in physics. Type it out.",
  asabove:"An old saying (and a scary catacomb movie): as above…",
  wassup:"A phone-call greeting that got screamed in a horror parody. Stretch it out.",
  slasher:"The kind of horror movie with a masked killer and a big knife. One word.",
  sharknado:"Sharks. In a tornado. What's the movie called?",
  fnaf:"Survive five nights as a pizzeria's night guard. Say the game, or its four letters.",
  horhor:"An animatronic bear's deep laugh. Three times.",
  cutdeep:"A demon of the mist's last words: your words cut deeper than any… what?",
  rainday:"A colonel at his best friend's funeral says it's a terrible day for… what?"
});
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"artyom",     name:"Filter change",     re:/(^|[^a-z])artyom([^a-z]|$)/i, play:()=>QX.artyom()},
  {id:"forhonor",   name:"For honor",         re:/(^|[^a-z])for honou?r([^a-z]|$)/i, play:()=>QX.forhonor()},
  {id:"steak",      name:"Well done",         re:/(^|[^a-z])(gourmet|well[- ]done) steak([^a-z]|$)/i, play:()=>QX.steak()},
  {id:"palico",     name:"Palico",            re:/(^|[^a-z])(palico|felyne)s?([^a-z]|$)/i, play:()=>QX.palico()},
  {id:"johnny",     name:"Here's Johnny",     re:/(^|[^a-z])here'?s johnn?y([^a-z]|$)/i, play:()=>QX.johnny()},
  {id:"floatdown",  name:"We all float",      re:/we all float(\s+down\s+here)?/i, play:()=>QX.balloon()},
  {id:"theyrehere", name:"They're here",      re:/(^|[^a-z])they'?re\s+he{2,}re+([^a-z]|$)/i, play:()=>QX.theyrehere()}
);
Object.assign(HINTS,{
  artyom:"Down in the tunnels, a young ranger's name. Say it and check your mask.",
  forhonor:"Knights, vikings, and samurai all shout the same two-word battle cry.",
  steak:"Hunters know the perfect way to cook meat on a spit. Order that kind of steak.",
  palico:"A hunter's loyal little cat companion has a name. Call for them.",
  johnny:"An axe, a door, and a famous greeting. Who's here?",
  floatdown:"A red balloon in a storm drain says: we all… what?",
  theyrehere:"A little girl at a staticky TV whispers who arrived. Stretch the last word out."
});
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"warchanged", name:"War has changed", re:/(^|[^a-z])war\s+has\s+changed([^a-z]|$)/i, play:()=>QX.war()}
);
Object.assign(HINTS,{ warchanged:"A tired old soldier sighs that the battlefield isn't what it used to be. Say what he says. (Three words.)" });
Object.assign(HINTS,{ hifive:"Two open hands meet in the middle. Say it as one word or two." });
Object.assign(HINTS,{
  trickortreat:"What kids say at the door on October 31st.",
  dayofthedead:"A colorful holiday to remember loved ones, in Spanish or English.",
  grimreaper:"He carries a scythe. Some say don't fear him.",
  toilandtrouble:"Witches' chant: double, double… (or a spell from a Halloween movie).",
});

/* ================= MISSED-SECRET PROMPT ================= */
const missedAsked=()=>{ try{ return new Set(JSON.parse(LS.get("nl-secret-asked")||"[]")); }catch(e){ return new Set(); } };
function markSecretAsked(id){
  const s=missedAsked(); s.add(id);
  const arr=[...s].slice(-400);
  try{ LS.set("nl-secret-asked",JSON.stringify(arr)); }catch(e){}
}
function checkMissedSecret(){   // (name kept: also covers regular effects now)
  if(!fxEnabled()||reducedMotion()) return;
  const asked=missedAsked();
  const today=dayKey(Date.now());   // only effects from TODAY (your local day), not old ones
  const found=new Set(foundSecrets());
  // everything friends set off today that you haven't seen play and haven't been offered yet (newest 5, played oldest first)
  const myRead=members.get(user.id)?.read||0;   // when you last had this chat open: anything before that, you were here for
  const hits=msgs.filter(m=>m.kind==="text"&&m.user_id!==user.id&&dayKey(m.created_at)===today&&new Date(m.created_at).getTime()>myRead&&!fxPlayed.has(m.id)&&!asked.has(m.id)&&(secretFor(m.text)||fxFor(m.text))).slice(-5);
  if(!hits.length) return;
  hits.forEach(m=>markSecretAsked(m.id));   // each message is only ever offered once
  const newSecret=hits.some(m=>{ const sec=secretFor(m.text); return sec&&!found.has(sec.id); });
  const who=[...new Set(hits.map(m=>nameOf(m.user_id)))];
  const names=who.length>2?`${who.slice(0,2).join(", ")} and others`:who.join(" and ");
  const roomAtPrompt=room;
  setTimeout(()=>{
    if(room!==roomAtPrompt||!hits.some(m=>elById.has(m.id))) return;   // they've moved on; don't interrupt elsewhere
    const t=el("div","toast missed-secret"); const body=el("span","tbody");
    const title=newSecret?(hits.length>1?`🔒 You missed a secret (and ${hits.length-1} more effect${hits.length>2?"s":""})`:"🔒 You missed a secret"):`✨ You missed ${hits.length>1?hits.length+" effects":"an effect"}`;
    body.append(el("div","ttitle",title), el("div","ttext",`${names} set ${hits.length>1?"some":"one"} off while you were away. Want to see ${hits.length>1?"them":"it"}?`));
    const row=el("div","missed-actions");
    const yes=el("button","send",hits.length>1?"Play them":"Show me"); yes.type="button";
    yes.onclick=()=>{ t.remove(); hits.forEach((m,k)=>setTimeout(()=>{ if(room!==roomAtPrompt||!elById.has(m.id)) return; fxPlayed.add(m.id); jumpTo(m.id); playFx(m,true); },k*4200)); };
    const no=el("button","ghost","No thanks"); no.type="button"; no.onclick=()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); };
    row.append(yes,no);
    t.append(el("span","sx-lock",newSecret?"🔒":"✨"),body); t.append(row);
    $("toasts").prepend(t); setTimeout(()=>{ if(t.isConnected){ t.classList.add("out"); setTimeout(()=>t.remove(),260); } },12000);
  },1400);
}


/* ===== 2026.10.20x: Lyra's list + Pokémon, Digimon, Ace Combat, Spider-Man, Ghibli, Gundam =====
   Nods to famous lines only: every picture and sound here is NightLane's own (no characters, logos or clips). */
function nsAudio(fn){ try{ if(typeof uiSoundOn==="function"&&!uiSoundOn()) return; const ac=sfxCtx(); if(ac.state==="suspended") ac.resume(); fn(ac,ac.currentTime+.03); }catch(e){} }
function nsTone(ac,t,f,d,o={}){ const os=ac.createOscillator(), g=ac.createGain(); os.type=o.type||"square"; os.frequency.setValueAtTime(f,t); if(o.to) os.frequency.exponentialRampToValueAtTime(o.to,t+d);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(o.vol||.05,t+.012); g.gain.exponentialRampToValueAtTime(.001,t+d); os.connect(g).connect(ac.destination); os.start(t); os.stop(t+d+.05); }
function nsNoise(ac,t,d,o={}){ const b=ac.createBuffer(1,Math.ceil(ac.sampleRate*d),ac.sampleRate), x=b.getChannelData(0); for(let i=0;i<x.length;i++) x[i]=Math.random()*2-1;
  const s=ac.createBufferSource(); s.buffer=b; const fl=ac.createBiquadFilter(); fl.type=o.ftype||"bandpass"; fl.frequency.setValueAtTime(o.f||1200,t); if(o.to) fl.frequency.exponentialRampToValueAtTime(o.to,t+d); fl.Q.value=o.q||1;
  const g=ac.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(o.vol||.1,t+Math.min(o.att||.04,d/3)); g.gain.exponentialRampToValueAtTime(.001,t+d); s.connect(fl).connect(g).connect(ac.destination); s.start(t); s.stop(t+d+.05); }
const nsBuzz=p=>{ try{ navigator.vibrate&&navigator.vibrate(p); }catch(e){} };
const nsR=(a,b)=>a+Math.random()*(b-a);

QX.ridetogether=function(){   // ⚔️ Together we ride: banner unrolls, pennants charge past, trumpets + hooves, the chat goes medieval
  const L=sxLayer("sxRide",5200); L.classList.add("dim");
  L.innerHTML=`<div class="md-banner"><span>Together we ride!</span></div>`;
  const cols=["#c8323c","#2f5fb3","#e0b23a","#2f8f4e","#7b3fa0","#c8323c"];
  cols.forEach((c,i)=>{ const p=el("div","md-pennant"); p.style.setProperty("--c",c); p.style.bottom=(6+(i%3)*7)+"%"; p.style.animationDelay=(.5+i*.22)+"s"; L.append(p); });
  const ch=$("chat"); ch.classList.add("md-chat"); setTimeout(()=>ch.classList.remove("md-chat"),10000);
  const fr=sxLayer("sxRideFrame",10000); fr.classList.add("md-frame","ambient");   // ambient: the next effect doesn't have to wait for this frame
  nsAudio((ac,t)=>{ [392,523,659,784].forEach((f,i)=>nsTone(ac,t+i*.16,f,i===3?.9:.2,{type:"sawtooth",vol:.045})); nsTone(ac,t+.64,523,.9,{type:"square",vol:.03});
    for(let k=0;k<8;k++){ const b=t+1.1+k*.38; nsNoise(ac,b,.07,{f:220,vol:.22,q:2}); nsNoise(ac,b+.11,.06,{f:200,vol:.18,q:2}); nsNoise(ac,b+.2,.08,{f:180,vol:.26,q:2}); } });
  nsBuzz([40,90,40,90,40]);
};
QX.society=function(){   // 🃏 We live in a society: jester hat, flying cards, HA HA HA
  const L=sxLayer("sxSociety",4600); L.classList.add("dim");
  L.innerHTML=`<svg class="js-hat" viewBox="0 0 120 90" aria-hidden="true"><path d="M10 80 Q20 30 8 10 Q40 30 60 8 Q80 30 112 10 Q100 30 110 80 Z" fill="#7a2fa0" stroke="#07041a" stroke-width="4"/><path d="M60 8 Q80 30 112 10 Q100 30 110 80 L60 80 Z" fill="#2f9e52" stroke="#07041a" stroke-width="4"/><rect x="6" y="74" width="108" height="14" rx="4" fill="#e0b23a" stroke="#07041a" stroke-width="4"/><circle cx="8" cy="10" r="7" fill="#e0b23a" stroke="#07041a" stroke-width="3"/><circle cx="60" cy="8" r="7" fill="#e0b23a" stroke="#07041a" stroke-width="3"/><circle cx="112" cy="10" r="7" fill="#e0b23a" stroke="#07041a" stroke-width="3"/></svg>`;
  ["♠","♥","♦","♣","♠","♥","♦","♣","♠","♥"].forEach((s,i)=>{ const c=el("span","js-card"+(s==="♥"||s==="♦"?" red":""),s); c.style.setProperty("--tx",nsR(-48,48)+"vw"); c.style.setProperty("--ty",nsR(-40,40)+"vh"); c.style.setProperty("--r",nsR(-400,400)+"deg"); c.style.animationDelay=(.3+i*.06)+"s"; L.append(c); });
  [["HA",18,30,"#39ff9a"],["HA",50,22,"#c066ff"],["HA",76,34,"#39ff9a"],["HA HA!",40,62,"#c066ff"]].forEach(([t,x,y,c],i)=>{ const h=el("span","js-ha",t); h.style.left=x+"%"; h.style.top=y+"%"; h.style.color=c; h.style.animationDelay=(1+i*.35)+"s"; L.append(h); });
  sxCap(L,"We live in a society.","js-cap");
  nsAudio((ac,t)=>{ [[1,660],[1.35,600],[1.7,540],[2.1,480],[2.3,560]].forEach(([d,f])=>nsTone(ac,t+d,f,.22,{type:"square",to:f*.8,vol:.05})); });
};
QX.titansgo=function(){   // 💥 Titans, go!: comic burst with speed lines in five hero colours
  const L=sxLayer("sxTitans",3800);
  L.innerHTML=`<div class="tt-lines"></div><div class="tt-burst"><span class="tt-small">TITANS,</span><span class="tt-big">GO!</span></div>`;
  ["#e8313d","#2f6bff","#9b4dff","#2fd16a","#ff9a1f"].forEach((c,i)=>{ const s=el("div","tt-stripe"); s.style.background=c; s.style.top=(18+i*14)+"%"; s.style.animationDelay=(i*.07)+"s"; L.append(s); });
  nsAudio((ac,t)=>{ nsNoise(ac,t,.45,{f:600,to:3000,vol:.12}); [262,330,392,523].forEach(f=>nsTone(ac,t+.42,f,.6,{type:"sawtooth",vol:.035})); });
  document.body.animate([{transform:"scale(1)"},{transform:"scale(1.02)"},{transform:"scale(1)"}],{duration:300,delay:400}); nsBuzz([20,40,80]);
};
QX.reeses=function(){   // 🥣 cereal puffs pour into a bowl, milk splash
  const L=sxLayer("sxPuffs",4600);
  L.innerHTML=`<div class="rp-bowl"><div class="rp-milk"></div></div>`;
  for(let i=0;i<46;i++){ const p=el("i","rp-puff"+(i%2?" pb":"")); p.style.left=nsR(32,68)+"%"; p.style.setProperty("--d",nsR(1.1,1.8)+"s"); p.style.animationDelay=nsR(0,1.6)+"s"; p.style.setProperty("--s",nsR(.7,1.2)); L.append(p); }
  setTimeout(()=>{ for(let i=0;i<14;i++){ const d=el("i","rp-drop"); d.style.setProperty("--dx",nsR(-90,90)+"px"); d.style.setProperty("--dy",nsR(-120,-40)+"px"); L.append(d); } sxCap(L,"Breakfast is served 🥣","rp-cap"); },2100);
  nsAudio((ac,t)=>{ for(let k=0;k<26;k++) nsNoise(ac,t+.3+k*.07+Math.random()*.03,.03,{f:nsR(2500,5000),vol:.06,q:3}); nsNoise(ac,t+2.1,.5,{f:900,to:300,vol:.12,ftype:"lowpass"}); });
};
function nsOrb(L,cls){ const o=el("div","po-orb "+(cls||"")); o.innerHTML=`<i class="po-top"></i><i class="po-band"></i><i class="po-btn"></i>`; L.append(o); return o; }
QX.catchem=function(){   // 🔮 Gotta catch 'em all: a neon capture orb is thrown, wobbles 3 times… CAUGHT!
  const L=sxLayer("sxCatch",5200); nsOrb(L,"throw");
  setTimeout(()=>{ for(let i=0;i<16;i++){ const s=el("i","po-star"); s.style.setProperty("--a",(i*22.5)+"deg"); L.append(s); } sxCap(L,"CAUGHT!","po-cap"); nsBuzz([30,40,90]); },3500);
  nsAudio((ac,t)=>{ nsNoise(ac,t,.5,{f:800,to:2400,vol:.08}); [1.4,2.1,2.8].forEach(d=>{ nsTone(ac,t+d,180,.08,{type:"square",vol:.07}); nsTone(ac,t+d+.09,140,.08,{type:"square",vol:.06}); });
    [784,988,1175,1568].forEach((f,i)=>nsTone(ac,t+3.5+i*.1,f,i===3?.6:.12,{type:"square",vol:.045})); });
};
QX.ichooseyou=function(){   // 🔮 I choose you!: the orb flies out and bursts open in light
  const L=sxLayer("sxChoose",3800); nsOrb(L,"release");
  setTimeout(()=>{ L.append(el("div","po-burst")); sxCap(L,"I choose you!","po-cap"); nsBuzz(60); },1300);
  nsAudio((ac,t)=>{ nsNoise(ac,t,.6,{f:700,to:2600,vol:.08}); nsTone(ac,t+1.3,300,.7,{type:"sine",to:1800,vol:.08}); nsNoise(ac,t+1.3,.6,{f:3000,to:600,vol:.08}); });
};
QX.wild=function(m){   // 👾 A wild ___ appeared!: retro battle flash, then the text box
  const name=((m?.text||"").match(/a wild (.{1,24}?) appear(ed|s)/i)||[])[1]||"friend";
  const L=sxLayer("sxWild",4600);
  L.innerHTML=`<div class="wl-bars">${'<i></i>'.repeat(8)}</div><div class="wl-box"><span></span></div>`;
  const span=L.querySelector(".wl-box span"), line=`A wild ${name.trim().toUpperCase()} appeared!`;   // textContent only: nothing typed is treated as code
  setTimeout(()=>{ let k=0; const iv=setInterval(()=>{ span.textContent=line.slice(0,++k); if(k>=line.length) clearInterval(iv); },45); },1300);
  nsAudio((ac,t)=>{ for(let i=0;i<3;i++) nsTone(ac,t+i*.18,1200,.12,{type:"square",vol:.04}); [262,330,392,523,659].forEach((f,i)=>nsTone(ac,t+.7+i*.08,f,.12,{type:"square",vol:.045})); });
};
QX.digivolve=function(m){   // 🧬 Digivolve: your picture spins in data rings and evolves
  const L=sxLayer("sxDigi",5000); L.classList.add("dim");
  const w=el("div","dg-wrap"), f=el("span","face dg-face"); try{ paintFace(f,cache.get(m?.user_id)||meProfile); }catch(e){}
  w.append(el("i","dg-ring r1"),el("i","dg-ring r2"),el("i","dg-ring r3"),f,el("i","dg-flash")); L.append(w);
  for(let i=0;i<10;i++){ const c=el("span","dg-code",Array.from({length:14},()=>Math.random()<.5?"0":"1").join("\n")); c.style.left=(4+i*10)+"%"; c.style.animationDelay=nsR(0,1)+"s"; L.append(c); }
  setTimeout(()=>{ sxCap(L,"EVOLVE.exe ✓","dg-cap"); nsBuzz([20,30,20,30,120]); },2600);
  nsAudio((ac,t)=>{ nsTone(ac,t,180,2.4,{type:"sawtooth",to:1400,vol:.04}); nsTone(ac,t+.2,240,2.2,{type:"square",to:1800,vol:.02}); [1046,1318,1568,2093].forEach((f,i)=>nsTone(ac,t+2.6+i*.07,f,.5,{type:"sine",vol:.05})); });
};
QX.foxtwo=function(){   // 🚀 Fox two: lock-on tone, missile streaks with a smoke trail, flares pop
  const L=sxLayer("sxFox",4400);
  L.innerHTML=`<div class="ac-hud"><i class="ac-ret"></i><b class="ac-lock">LOCK</b></div><div class="ac-missile"><i></i></div>`;
  setTimeout(()=>{ for(let i=0;i<12;i++){ const f=el("i","ac-flare"); f.style.setProperty("--dx",nsR(-80,80)+"px"); f.style.animationDelay=(i*.06)+"s"; L.append(f); } },1700);
  setTimeout(()=>sxCap(L,"FOX 2","ac-cap"),900);
  nsAudio((ac,t)=>{ for(let i=0;i<8;i++) nsTone(ac,t+i*.12,1050,.06,{type:"square",vol:.035}); nsTone(ac,t+.96,1050,.5,{type:"square",vol:.035}); nsNoise(ac,t+1,1.2,{f:500,to:3000,vol:.13}); for(let i=0;i<6;i++) nsNoise(ac,t+1.8+i*.07,.08,{f:2500,vol:.05}); });
};
QX.splashone=function(){   // 💥 Splash one: far-off explosion on the HUD
  const L=sxLayer("sxSplash",4000);
  L.innerHTML=`<div class="ac-hud"><i class="ac-ret"></i></div><div class="ac-boom"><i class="ac-fire"></i><i class="ac-smoke"></i></div>`;
  setTimeout(()=>sxCap(L,"SPLASH ONE","ac-cap"),700);
  nsAudio((ac,t)=>{ nsNoise(ac,t+.3,1.6,{f:180,to:60,vol:.35,ftype:"lowpass"}); nsTone(ac,t+.3,70,1,{type:"sine",to:35,vol:.15}); });
  nsBuzz([60,40,120]);
};
function nsWebSvg(){ let s=`<svg viewBox="0 0 200 200" aria-hidden="true"><g fill="none" stroke="#e8eef8" stroke-width="2.2" stroke-linecap="round">`;
  for(let a=0;a<=90;a+=15){ const r=a*Math.PI/180; s+=`<path d="M0 0 L${(200*Math.cos(r)).toFixed(1)} ${(200*Math.sin(r)).toFixed(1)}"/>`; }
  for(let k=1;k<=6;k++){ const R=k*30; let d=""; for(let a=0;a<=90;a+=15){ const r=a*Math.PI/180, sag=a%30?0.93:1; d+=(a?" L":"M")+(R*sag*Math.cos(r)).toFixed(1)+" "+(R*sag*Math.sin(r)).toFixed(1); } s+=`<path d="${d}"/>`; }
  return s+`</g></svg>`; }
const nsThwip=(ac,t)=>nsNoise(ac,t,.16,{f:5200,to:900,vol:.12,q:4});
QX.greatpower=function(){   // 🕸️ With great power…: webs shoot in from the corners and stick
  const L=sxLayer("sxWebs",4800);
  ["tl","tr","bl","br"].forEach((c,i)=>{ const w=el("div","wb-corner "+c); w.innerHTML=nsWebSvg(); w.style.animationDelay=(i*.25)+"s"; L.append(w); });
  setTimeout(()=>sxCap(L,"…comes great responsibility.","wb-cap"),1300);
  nsAudio((ac,t)=>{ for(let i=0;i<4;i++) nsThwip(ac,t+i*.25); });
};
QX.thwip=function(){   // 🕸️ Thwip: one web line zips across
  const L=sxLayer("sxThwip",2400);
  L.innerHTML=`<svg class="wb-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M-2 78 Q50 70 102 22" fill="none" stroke="#e8eef8" stroke-width=".9" vector-effect="non-scaling-stroke"/></svg><div class="wb-splat">${nsWebSvg()}</div>`;
  nsAudio((ac,t)=>nsThwip(ac,t)); nsBuzz(25);
};
QX.windrises=function(){   // 🍃 The wind rises: a gust sweeps leaves and a paper plane across
  const L=sxLayer("sxWind",5200);
  for(let i=0;i<22;i++){ const f=el("i","wr-leaf"); f.style.top=nsR(5,90)+"%"; f.style.setProperty("--c",["#7cc46a","#b7d96b","#e0c25a","#5fae7a"][i%4]); f.style.setProperty("--d",nsR(2.2,3.6)+"s"); f.style.animationDelay=nsR(0,1.6)+"s"; L.append(f); }
  L.insertAdjacentHTML("beforeend",`<svg class="wr-plane" viewBox="0 0 60 30" aria-hidden="true"><path d="M2 15 L58 3 L30 27 L26 17 Z" fill="#f6f2e8" stroke="#8a8170" stroke-width="1.5"/><path d="M26 17 L58 3" stroke="#8a8170" stroke-width="1"/></svg>`);
  nsAudio((ac,t)=>{ nsNoise(ac,t,3.8,{f:400,to:1400,vol:.09,ftype:"lowpass",att:1.2}); nsNoise(ac,t+1,2.4,{f:900,to:500,vol:.05,att:.8}); });
};
QX.spiritedaway=function(){   // 🏮 Spirited away: dusk falls, paper lanterns and petals drift up
  const L=sxLayer("sxSpirit",6200); L.classList.add("sp-dusk");
  for(let i=0;i<14;i++){ const l=el("i","sp-lantern"); l.style.left=nsR(4,92)+"%"; l.style.setProperty("--d",nsR(4,5.6)+"s"); l.style.animationDelay=nsR(0,1.6)+"s"; l.style.setProperty("--s",nsR(.7,1.2)); L.append(l); }
  for(let i=0;i<18;i++){ const p=el("i","sp-petal"); p.style.left=nsR(0,100)+"%"; p.style.animationDelay=nsR(0,3)+"s"; L.append(p); }
  nsAudio((ac,t)=>{ [587,659,784,880,1046,880,784].forEach((f,i)=>nsTone(ac,t+.3+i*.42,f,1.2,{type:"sine",vol:.045})); });
};
QX.launch=function(){   // 🚀 ___, launching!: catapult lights race forward, thrusters flare, LAUNCH!
  const L=sxLayer("sxLaunch",4200); L.classList.add("dim");
  L.innerHTML=`<div class="gl-deck"></div><div class="gl-thrust"></div>`;
  setTimeout(()=>{ sxCap(L,"LAUNCH!","gl-cap"); document.body.animate([{transform:"translateY(0)"},{transform:"translateY(-6px)"},{transform:"translateY(3px)"},{transform:"none"}],{duration:420}); nsBuzz([30,30,160]); },1600);
  nsAudio((ac,t)=>{ nsTone(ac,t,220,1.6,{type:"sawtooth",to:1100,vol:.035}); nsNoise(ac,t+1.6,1.4,{f:300,to:80,vol:.3,ftype:"lowpass"}); nsNoise(ac,t+1.6,.8,{f:2000,to:500,vol:.1}); });
};
QX.redcomet=function(){   // ☄️ Three times faster: a red comet tears across, faster each pass
  const L=sxLayer("sxComet",4400);
  [[0,1.3],[1.4,.85],[2.35,.42]].forEach(([d,dur],i)=>{ const c=el("i","rc-comet"); c.style.setProperty("--dur",dur+"s"); c.style.setProperty("--y",(30+i*18)+"%"); c.style.animationDelay=d+"s"; L.append(c); });
  setTimeout(()=>{ L.append(el("div","rc-flash")); sxCap(L,"3× faster","rc-cap"); nsBuzz([20,20,20,20,90]); },2800);
  nsAudio((ac,t)=>{ [[0,1.3,500],[1.4,.85,800],[2.35,.42,1300]].forEach(([d,dur,f])=>nsNoise(ac,t+d,dur,{f,to:f*3,vol:.12})); });
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"ridetogether", name:"Together we ride", re:/together,? we ride/i, play:()=>QX.ridetogether()},
  {id:"society",      name:"We live in a society", re:/we live in a society/i, play:()=>QX.society()},
  {id:"titansgo",     name:"Titans, go!",      re:/titans,? go/i, play:()=>QX.titansgo()},
  {id:"reeses",       name:"Breakfast puffs",  re:/reese'?s puffs/i, play:()=>QX.reeses()},
  {id:"catchem",      name:"Gotta catch 'em all", re:/gotta catch ('?em|them) all/i, play:()=>QX.catchem()},
  {id:"ichooseyou",   name:"I choose you",     re:/(^|[^a-z])i choose you([^a-z]|$)/i, play:()=>QX.ichooseyou()},
  {id:"wild",         name:"A wild one appeared", re:/a wild .{1,24}? appear(ed|s)/i, play:m=>QX.wild(m)},
  {id:"digivolve",    name:"Digivolve",        re:/(^|[^a-z])digivolv(e|ing|ed)/i, play:m=>QX.digivolve(m)},
  {id:"foxtwo",       name:"Fox two",          re:/(^|[^a-z])fox (two|2)\s*([.!?,~]|$)/i, play:()=>QX.foxtwo()},
  {id:"splashone",    name:"Splash one",       re:/(^|[^a-z])splash (one|1)\s*([.!?,~]|$)/i, play:()=>QX.splashone()},
  {id:"greatpower",   name:"Great responsibility", re:/with great power( comes)? great responsibility|great power,? great responsibility/i, play:()=>QX.greatpower()},
  {id:"thwip",        name:"Thwip",            re:/(^|[^a-z])thwip/i, play:()=>QX.thwip()},
  {id:"windrises",    name:"The wind rises",   re:/the wind (rises|is rising)/i, play:()=>QX.windrises()},
  {id:"spiritedaway", name:"Spirited away",    re:/(^|[^a-z])spirited away/i, play:()=>QX.spiritedaway()},
  {id:"launch",       name:"Launching!",       re:/(^|[^a-z])[a-z]{2,20}, (ikimasu|launching!)|amuro,? (ikimasu|launching)/i, play:()=>QX.launch()},
  {id:"redcomet",     name:"Red comet",        re:/three times (faster|as fast)|3x faster|red comet/i, play:()=>QX.redcomet()}
);
Object.assign(HINTS,{
  ridetogether:"Saddle up with your allies. Three words, a fire emblem on the banner.",
  society:"The clown's favourite complaint about the world we live in.",
  titansgo:"The team's leader shouts it before every fight. Two words.",
  reeses:"A chocolate-and-peanut-butter cereal that's famous for its song. Say its name.",
  catchem:"The promise every young trainer makes. Gotta…",
  ichooseyou:"Three words a trainer shouts when sending out their partner.",
  wild:"A ___ appeared! (Fill in the blank with anything.)",
  digivolve:"When digital monsters grow up, they…",
  foxtwo:"A fighter pilot's call when firing a heat-seeker.",
  splashone:"A fighter pilot's call when the target goes down.",
  greatpower:"Uncle Ben's advice. With great power…",
  thwip:"The sound a web-shooter makes.",
  windrises:"The wind ___. We must try to live.",
  spiritedaway:"A girl gets ___ ___ to a bathhouse of spirits.",
  launch:"Say a pilot's name, then that they're launching. (Or the famous one: Amuro, ikimasu!)",
  redcomet:"The red one is three times… what?"
});

QX.stayfrosty=function(){   // 🚨 Stay frosty: cop lights strobe, frost creeps in, the shades come down, siren whoop
  const L=sxLayer("sxFrosty",5200); L.classList.add("dim");
  L.innerHTML=`<div class="sf-lights"><i class="r"></i><i class="b"></i></div><div class="sf-frost tl"></div><div class="sf-frost tr"></div><div class="sf-frost bl"></div><div class="sf-frost br"></div>
    <svg class="sf-shades" viewBox="0 0 240 80" aria-hidden="true"><path d="M8 14 H232" stroke="#c9ced8" stroke-width="5" stroke-linecap="round"/><path d="M14 16 Q16 70 62 70 Q104 70 108 22 Q108 14 100 14 H20 Q14 14 14 16Z" fill="#101626" stroke="#c9ced8" stroke-width="4"/><path d="M226 16 Q224 70 178 70 Q136 70 132 22 Q132 14 140 14 H220 Q226 14 226 16Z" fill="#101626" stroke="#c9ced8" stroke-width="4"/><path d="M108 22 Q120 12 132 22" fill="none" stroke="#c9ced8" stroke-width="4"/><path d="M30 24 L58 52" stroke="rgba(120,200,255,.5)" stroke-width="6" stroke-linecap="round"/><path d="M150 24 L178 52" stroke="rgba(120,200,255,.5)" stroke-width="6" stroke-linecap="round"/></svg>`;
  setTimeout(()=>{ sxCap(L,"STAY FROSTY.","sf-cap"); L.append(el("div","sf-glint")); nsBuzz([30,60,30,60,140]); },1500);
  nsAudio((ac,t)=>{ for(let k=0;k<3;k++){ nsTone(ac,t+k*.5,700,.25,{type:"sine",to:1400,vol:.06}); nsTone(ac,t+k*.5+.25,1400,.25,{type:"sine",to:700,vol:.06}); }   // whoop whoop
    nsTone(ac,t+1.5,110,.9,{type:"sawtooth",to:55,vol:.06}); nsNoise(ac,t+1.5,.7,{f:4000,to:9000,vol:.05}); });
};
