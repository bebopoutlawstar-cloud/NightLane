/* ================= SECRETS PACK 5: horror, sci-fi, action, games ================= */
const QX=(()=>{
  const layer=$("sfx");
  const add=(cls,html="")=>{ const d=document.createElement("div"); d.className=cls; d.innerHTML=html; layer.append(d); return d; };
  const later=(fn,ms)=>setTimeout(fn,ms), R=(a,b)=>a+Math.random()*(b-a);
  const chatClass=(cls,ms)=>{ const c=$("chat"); c.classList.remove(cls); void c.offsetWidth; c.classList.add(cls); later(()=>c.classList.remove(cls),ms); };
  const stamp=(text,cls="",ms=1900)=>{ const b=add("sx-banner qx-stamp "+cls,text); later(()=>b.remove(),ms); return b; };
  const shake=()=>chatClass("fx-shake",1000);
  const chime=(notes)=>{ try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); notes.forEach(([f,at,len,type])=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type=type||"square"; o.frequency.value=f; g.gain.setValueAtTime(.0001,ac.currentTime+at); g.gain.exponentialRampToValueAtTime(.06,ac.currentTime+at+.02); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+at+len); o.connect(g); g.connect(ac.destination); o.start(ac.currentTime+at); o.stop(ac.currentTime+at+len+.05); }); }catch(e){} };
  function canvasFx(draw,ms){
    const cv=document.createElement("canvas"); cv.className="sfx-canvas"; layer.append(cv);
    const dpr=Math.min(devicePixelRatio||1,2), ctx=cv.getContext("2d"), W=innerWidth, H=innerHeight; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    const st=draw.init?draw.init(W,H):{}; const start=performance.now();
    const frame=now=>{ if(!cv.isConnected) return; const t=now-start, k=Math.min(1,t/ms); ctx.clearRect(0,0,W,H); try{ draw.step(ctx,W,H,st,t,k); }catch(e){ cv.remove(); return; } if(k<1) requestAnimationFrame(frame); else cv.remove(); };
    setTimeout(()=>cv.remove(),ms+400);
    requestAnimationFrame(frame);
  }
  const senderFaces=m=>[...feed.querySelectorAll(`.face[data-uid="${CSS.escape(m?.user_id||"")}"]`)];
  const flyAcross=(html,cls,ms)=>{ const f=add("qx-fly "+cls,html); f.style.animationDuration=ms+"ms"; later(()=>f.remove(),ms+100); return f; };
  return {
    dragon(){
      const d=flyAcross(`<svg viewBox="0 0 260 140"><g class="qx-wing"><path d="M120 70 L60 10 L150 40 Z" fill="#7a1fa2" stroke="#07041A" stroke-width="4"/></g><path d="M20 90 Q80 60 130 70 Q190 80 230 60 L250 70 L236 84 Q190 100 130 96 Q80 92 40 110 Z" fill="#c62bd6" stroke="#07041A" stroke-width="4"/><path d="M226 62 L252 46 L258 66 Z" fill="#c62bd6" stroke="#07041A" stroke-width="3"/><circle cx="240" cy="66" r="3.5" fill="#F3FF3A"/><path d="M20 90 Q0 100 8 118" stroke="#c62bd6" stroke-width="8" fill="none" stroke-linecap="round"/><g class="qx-wing2"><path d="M120 76 L70 130 L150 100 Z" fill="#7a1fa2" stroke="#07041A" stroke-width="4"/></g></svg>`,"qx-dragon",4200);
      canvasFx({init(W,H){ return {p:[]}; }, step(ctx,W,H,s,t,k){ const dx=-W*.4+ (W*1.7)*k, dy=H*.6-H*.35*k+Math.sin(t/300)*14; if(k<.92) for(let i=0;i<4;i++) s.p.push({x:dx+R(-10,40),y:dy+R(-6,6),v:R(1,3),life:1,sz:R(3,8)}); s.p.forEach(pp=>{ pp.x+=pp.v*2; pp.y+=R(-1,1); pp.life-=.02; ctx.globalAlpha=Math.max(0,pp.life); ctx.fillStyle=pp.life>.5?"#F3FF3A":"#FF8A3D"; ctx.beginPath(); ctx.arc(pp.x,pp.y,Math.max(0,pp.sz*pp.life),0,7); ctx.fill(); }); s.p=s.p.filter(pp=>pp.life>0); ctx.globalAlpha=1; }},4200);
      later(()=>{ const c=add("sx-caption px-center","🐉"); later(()=>c.remove(),1200); },1200);
    },
    goodkid(){
      const g=add("qx-gk",`<div class="qx-gkbox"><span>GOOD</span><span>KID</span></div><div class="sx-caption">♪ playing in the background ♪</div>`);
      chatClass("qx-bounce",3600); chime([[392,0,.2,"triangle"],[494,.2,.2,"triangle"],[587,.4,.35,"triangle"]]); later(()=>g.remove(),3600);
    },
    drift(){
      const s=add("qx-smoke"); const car=flyAcross(`<svg viewBox="0 0 200 80"><path d="M10 55 L40 30 Q60 18 100 18 L150 18 Q175 18 190 40 L194 55 Z" fill="#F4F7FF" stroke="#07041A" stroke-width="4"/><path d="M50 32 L95 24 L95 44 L45 44 Z" fill="#111" opacity=".85"/><path d="M104 24 L145 24 Q160 26 168 44 L104 44 Z" fill="#111" opacity=".85"/><rect x="0" y="54" width="200" height="8" fill="#07041A"/><circle cx="50" cy="60" r="14" fill="#07041A"/><circle cx="50" cy="60" r="6" fill="#9aa4c0"/><circle cx="150" cy="60" r="14" fill="#07041A"/><circle cx="150" cy="60" r="6" fill="#9aa4c0"/><rect x="60" y="34" width="30" height="8" fill="#07041A" opacity=".6"/></svg>`,"qx-car",2600);
      for(let i=0;i<14;i++){ const p=document.createElement("i"); p.style.animationDelay=(i*.12)+"s"; s.append(p); }
      later(()=>stamp("DEJA VU","qx-drift",1500),700); chatClass("qx-tilt",2600); later(()=>s.remove(),2800);
    },
    redrum(){ chatClass("qx-flicker",2600); const r=add("qx-redrum","REDRUM"); later(()=>r.remove(),2600); },
    behindyou(){
      const w=document.createElement("div"); w.className="qx-lurker"; w.innerHTML=`<svg viewBox="0 0 200 200"><path d="M40 200 Q45 120 100 110 Q155 120 160 200 Z" fill="#020204"/><circle cx="100" cy="86" r="34" fill="#020204"/><ellipse cx="88" cy="82" rx="6" ry="9" fill="#ff2b2b" class="qx-eye"/><ellipse cx="112" cy="82" rx="6" ry="9" fill="#ff2b2b" class="qx-eye"/></svg>`;
      $("chat").prepend(w); chatClass("sx-see",2400); if(navigator.vibrate) navigator.vibrate([10,60,10]); later(()=>w.remove(),2400);
    },
    boo(){ shake(); if(typeof HW!=="undefined"){ HW.boo(); return; } const f=add("qx-flash"); const g=add("qx-boo","👻"); if(navigator.vibrate) navigator.vibrate(120); later(()=>{ f.remove(); g.remove(); },900); },
    cursed(){
      chatClass("qx-vhs",3800);
      const tags=[...feed.querySelectorAll(".tag")], saved=tags.map(t=>t.lastChild&&t.lastChild.nodeType===3?t.lastChild.nodeValue:null);
      tags.forEach(t=>{ if(t.lastChild&&t.lastChild.nodeType===3) t.lastChild.nodeValue=t.lastChild.nodeValue.replace(/\d{1,2}:\d{2} ?[AP]M/i,"3:33 AM"); });
      const c=add("sx-caption px-center qx-cursedcap","▶ PLAY  ·  ᴄᴜʀsᴇᴅ"); later(()=>{ c.remove(); tags.forEach((t,i)=>{ if(saved[i]!==null&&t.isConnected&&t.lastChild) t.lastChild.nodeValue=saved[i]; }); },3800);
    },
    beamup(m){ senderFaces(m).forEach(f=>{ f.classList.remove("qx-beam"); void f.offsetWidth; f.classList.add("qx-beam"); later(()=>f.classList.remove("qx-beam"),2600); }); chime([[880,0,.4,"sine"],[1320,.2,.5,"sine"]]); const c=add("sx-caption px-center","✨ energizing…"); later(()=>c.remove(),1800); },
    hyperspace(){
      canvasFx({init(W,H){ return {s:[...Array(220)].map(()=>({a:R(0,6.3),d:R(5,Math.hypot(W,H)/2),z:R(.2,1)}))}; },
        step(ctx,W,H,s,t,k){ const cx=W/2,cy=H/2, sp=Math.pow(k,2)*60+1, a=k<.1?k/.1:k>.85?(1-k)/.15:1; ctx.fillStyle=`rgba(3,2,12,${.85*a})`; ctx.fillRect(0,0,W,H); ctx.globalAlpha=a; ctx.strokeStyle="#fff"; for(const st of s.s){ st.d+=sp*st.z; if(st.d>Math.hypot(W,H)) st.d=R(5,60); const x=cx+Math.cos(st.a)*st.d, y=cy+Math.sin(st.a)*st.d, len=Math.min(120,sp*st.z*3); ctx.lineWidth=st.z*2; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(cx+Math.cos(st.a)*(st.d-len),cy+Math.sin(st.a)*(st.d-len)); ctx.stroke(); } ctx.globalAlpha=1; }},3200);
      later(()=>stamp("PUNCH IT!","qx-warp",1200),1600);
    },
    force(){ feed.querySelectorAll(".msg").forEach((n,i)=>{ n.style.setProperty("--fy",R(-40,-110)+"px"); n.style.setProperty("--fr",R(-8,8)+"deg"); n.style.animationDelay=(i*40)+"ms"; n.classList.add("qx-float"); later(()=>{ n.classList.remove("qx-float"); n.style.animationDelay=""; },2800); }); const c=add("sx-caption px-center","the force is strong with this chat"); later(()=>c.remove(),2200); },
    assimilate(){ chatClass("qx-borg",3200); const g=add("qx-grid"); const b=stamp("RESISTANCE IS FUTILE","qx-borgtext",2600); later(()=>g.remove(),3200); },
    fortytwo(){ const b=add("qx-42",`<b>42</b><small>DON'T PANIC</small>`); later(()=>b.remove(),3000); },
    spacecowboy(){ const f=add("qx-fade",`<div class="qx-cowboy">SEE YOU SPACE COWBOY…</div>`); later(()=>f.classList.add("in"),50); later(()=>f.classList.add("out"),3600); later(()=>f.remove(),4400); },
    terminate(m){
      const hud=add("qx-hud",`<div class="qx-hudbox"><i></i><i></i><i></i><i></i><span>TARGET ACQUIRED</span></div><div class="qx-hudtext">> ANALYSIS: HASTA LA VISTA<br>> STATUS: <b>TERMINATED</b></div>`);
      const f=senderFaces(m)[0]; if(f){ const r=f.getBoundingClientRect(); const box=hud.querySelector(".qx-hudbox"); box.style.left=(r.left+r.width/2)+"px"; box.style.top=(r.top+r.height/2)+"px"; }
      later(()=>hud.remove(),3000);
    },
    yippee(){ if(typeof FX!=="undefined"){ FX.play("boom"); later(()=>FX.play("embers"),400); } later(()=>stamp("YIPPEE KI-YAY","qx-action",1600),300); },
    illbeback(m){ const n=[...feed.querySelectorAll(".msg.me, .msg")].filter(x=>x.dataset.id==String(m?.id))[0]||[...feed.querySelectorAll(".msg")].pop(); if(n){ n.classList.remove("qx-leave"); void n.offsetWidth; n.classList.add("qx-leave"); later(()=>n.classList.remove("qx-leave"),3200); } later(()=>{ const c=add("sx-caption px-center","…I'm back."); later(()=>c.remove(),1200); },2400); },
    kamehameha(){
      canvasFx({init(){ return {}; }, step(ctx,W,H,s,t,k){ const cx=W*.2, cy=H*.5; if(k<.45){ const r=8+k*180; const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r); g.addColorStop(0,"#fff"); g.addColorStop(.4,"#7fd4ff"); g.addColorStop(1,"rgba(40,120,255,0)"); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,r,0,7); ctx.fill(); } else { const kk=(k-.45)/.55, len=W*1.2*Math.min(1,kk*2.2), th=60+Math.sin(t/40)*10; const g=ctx.createLinearGradient(cx,0,cx+len,0); g.addColorStop(0,"#fff"); g.addColorStop(.5,"#7fd4ff"); g.addColorStop(1,"rgba(40,120,255,0)"); ctx.fillStyle=g; ctx.globalAlpha=kk>.85?(1-kk)/.15:1; ctx.fillRect(cx,cy-th/2,len,th); ctx.fillStyle="rgba(255,255,255,.9)"; ctx.fillRect(cx,cy-th/6,len,th/3); ctx.globalAlpha=1; } }},2600);
      later(()=>shake(),1200); later(()=>stamp("HAAAA!","qx-warp",1200),1200);
    },
    nani(){ const b=stamp("NANI?!","qx-nani",1900); shake(); later(()=>b.classList.add("qx-shatter"),1100); },
    leeroy(){ const ids=[...members.keys()].slice(0,6); ids.forEach((uid,i)=>{ const f=el("div","face qx-charge"); paintFace(f,cache.get(uid)); f.style.top=(30+i*9)+"%"; f.style.animationDelay=(i*.15)+"s"; layer.append(f); later(()=>f.remove(),2600); }); stamp("LEEROOOOOY!","qx-action",2200); if(navigator.vibrate) navigator.vibrate([40,40,40,40,120]); },
    fatality(){ const s=add("qx-redslash"); chatClass("qx-flicker",1200); later(()=>{ const b=add("qx-fatality","FATALITY"); later(()=>b.remove(),2200); },350); later(()=>s.remove(),1400); },
    hadouken(){ canvasFx({init(){return{};}, step(ctx,W,H,s,t,k){ const x=W*.1+W*.95*k, y=H*.55; for(let i=0;i<6;i++){ ctx.globalAlpha=(1-i/6)*.9; ctx.fillStyle=i<2?"#fff":"#00F0FF"; ctx.beginPath(); ctx.arc(x-i*22,y+Math.sin(t/60+i)*4,34-i*4,0,7); ctx.fill(); } ctx.globalAlpha=1; }},1400); later(()=>stamp("HADOUKEN!","qx-warp",1300),100); },
    gameover(){
      const g=add("qx-gameover",`<div class="qx-go">GAME OVER</div><div class="qx-cont">CONTINUE? <b>9</b></div><div class="qx-coin">INSERT COIN</div>`);
      const n=g.querySelector(".qx-cont b"); let c=9; const iv=setInterval(()=>{ c--; if(c<0){ clearInterval(iv); return; } n.textContent=c; chime([[220,0,.08]]); },380);
      later(()=>{ clearInterval(iv); g.remove(); },4600);
    },
    oneup(){ const h=add("qx-1up","<span>+1 UP</span><i>♥</i>"); chime([[1319,0,.08],[1568,.08,.08],[2637,.16,.08],[2093,.24,.08],[2349,.32,.08],[3136,.4,.2]]); later(()=>h.remove(),1800); },
    cake(){ const c=add("qx-cake","🎂"); later(()=>{ c.textContent="🎂→ a LIE"; c.classList.add("qx-lie"); },900); later(()=>c.remove(),2600); },
    headshot(m){ const f=senderFaces(m)[0]; const x=add("qx-cross"); if(f){ const r=f.getBoundingClientRect(); x.style.setProperty("--x",(r.left+r.width/2)+"px"); x.style.setProperty("--y",(r.top+r.height/2)+"px"); } later(()=>{ shake(); stamp("HEADSHOT","qx-action",1400); },500); later(()=>x.remove(),1900); },
    victory(){ if(typeof FX!=="undefined") FX.play("confetti"); const b=add("qx-victory",`<div>👑</div><b>#1</b><small>WINNER WINNER</small>`); later(()=>b.remove(),3000); },
    levelup(){ const b=add("qx-level",`<div class="qx-lvlbar"><i></i></div><div class="qx-lvltxt">LEVEL UP!</div>`); { const sp=pxfxEl("levelup",{scale:1.6,ms:55}); if(sp) b.querySelector(".qx-lvltxt").replaceWith(sp); } chime([[523,0,.1],[659,.1,.1],[784,.2,.1],[1046,.3,.3]]); later(()=>b.remove(),2600); },
    crit(){ for(let i=0;i<7;i++){ const n=add("qx-dmg",String(Math.floor(R(900,9999)))); n.style.left=R(10,80)+"%"; n.style.top=R(25,70)+"%"; n.style.animationDelay=(i*.1)+"s"; later(()=>n.remove(),1900); } stamp("CRITICAL HIT!","qx-crit",1700); shake(); },
    pog(){ const p=add("qx-pog",`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#F3FF3A" stroke="#07041A" stroke-width="4"/><ellipse cx="34" cy="42" rx="11" ry="14" fill="#fff" stroke="#07041A" stroke-width="3"/><ellipse cx="66" cy="42" rx="11" ry="14" fill="#fff" stroke="#07041A" stroke-width="3"/><circle cx="36" cy="44" r="5"/><circle cx="68" cy="44" r="5"/><ellipse cx="50" cy="72" rx="12" ry="14" fill="#07041A"/></svg><b>POG</b>`); later(()=>p.remove(),1700); },
    celebrate(){ if(typeof FX!=="undefined") FX.play("confetti"); },
  };
})();
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"dragon", name:"Dragon", re:/(^|[^a-z])dragons?([^a-z]|$)/i, play:()=>QX.dragon()},
  {id:"goodkid", name:"Good Kid", re:/good kid/i, play:()=>QX.goodkid()},
  {id:"drift", name:"Deja vu", re:/deja ?vu|eurobeat|(^|[^a-z])drift(ing|s)?([^a-z]|$)|tofu delivery/i, play:()=>QX.drift()},
  {id:"redrum", name:"Redrum", re:/(^|[^a-z])redrum([^a-z]|$)/i, play:()=>QX.redrum()},
  {id:"behindyou", name:"Behind you", re:/(it'?s )?behind you/i, play:()=>QX.behindyou()},
  {id:"boo", name:"Boo!", re:/(^|[^a-z])boo!+([^a-z]|$)|(^|[^a-z])boo([^a-z]|$)/i, play:()=>QX.boo()},
  {id:"cursed", name:"Cursed tape", re:/(^|[^a-z])cursed([^a-z]|$)/i, play:()=>QX.cursed()},
  {id:"beamup", name:"Beam me up", re:/beam me up/i, play:m=>QX.beamup(m)},
  {id:"hyperspace", name:"Hyperspace", re:/hyperspace|punch it|warp speed|lightspeed/i, play:()=>QX.hyperspace()},
  {id:"force", name:"The Force", re:/(may )?the force( be with you)?/i, play:()=>QX.force()},
  {id:"assimilate", name:"Assimilated", re:/resistance is futile/i, play:()=>QX.assimilate()},
  {id:"fortytwo", name:"42", re:/the answer to (life|everything)|^\s*42\s*$|don'?t panic/i, play:()=>QX.fortytwo()},
  {id:"spacecowboy", name:"Space cowboy", re:/space cowboy/i, play:()=>QX.spacecowboy()},
  {id:"terminate", name:"Hasta la vista", re:/hasta la vista/i, play:m=>QX.terminate(m)},
  {id:"yippee", name:"Yippee ki-yay", re:/yippee?[- ]?ki[- ]?yay/i, play:()=>QX.yippee()},
  {id:"illbeback", name:"I'll be back", re:/i'?ll be back/i, play:m=>QX.illbeback(m)},
  {id:"kamehameha", name:"Kamehameha", re:/kame ?hame ?ha/i, play:()=>QX.kamehameha()},
  {id:"nani", name:"Nani?!", re:/omae wa mou|(^|[^a-z])nani\??!?([^a-z]|$)/i, play:()=>QX.nani()},
  {id:"leeroy", name:"Leeroy", re:/leero+y/i, play:()=>QX.leeroy()},
  {id:"fatality", name:"Fatality", re:/(^|[^a-z])fatality([^a-z]|$)|finish him/i, play:()=>QX.fatality()},
  {id:"hadouken", name:"Hadouken", re:/hadou?ken|shoryuken/i, play:()=>QX.hadouken()},
  {id:"gameover", name:"Game over", re:/game over/i, play:()=>QX.gameover()},
  {id:"oneup", name:"1-UP", re:/(^|[^a-z0-9])1[- ]?up([^a-z]|$)|extra life/i, play:()=>QX.oneup()},
  {id:"cake", name:"The cake", re:/the cake is a lie/i, play:()=>QX.cake()},
  {id:"headshot", name:"Headshot", re:/(^|[^a-z])headshot([^a-z]|$)/i, play:m=>QX.headshot(m)},
  {id:"victory", name:"Victory", re:/victory royale|winner winner|chicken dinner/i, play:()=>QX.victory()},
  {id:"levelup", name:"Level up", re:/level(ed)? up/i, play:()=>QX.levelup()},
  {id:"crit", name:"Critical hit", re:/critical hit|(^|[^a-z])crit([^a-z]|$)/i, play:()=>QX.crit()},
  {id:"pog", name:"Pog", re:/(^|[^a-z])pog(gers|champ)?([^a-z]|$)/i, play:()=>QX.pog()}
);
// "celebrate" joins the everyday confetti trigger (not a secret)
FX_TRIGGERS.find(t=>t.fx==="confetti").words.push("celebrate","celebration","let's celebrate");
FX_TRIGGERS.forEach(t=>t.re=new RegExp("(^|[^a-z0-9'])("+t.words.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")(?=$|[^a-z0-9])","i"));
FX_TRIGGERS.find(t=>t.fx==="kiss").re=/(^|[^a-z0-9'])m+(w+|u+w*)a+h+(?=$|[^a-z0-9])/i;   // mwah, mwahhh, muah, muwah, mmwaaah…

/* ================= DAILY HINT ================= */
const HINTS={
 showtime:"A phantom's favorite word when the curtain goes up.", takeyourtime:"The kindest thing a game ever told you while it loaded.", over9000:"A scouter reading that broke the scale.",
 barrelroll:"An old fox's advice for dodging fire. Say the full instruction.", lightsout:"What you shout before hide-and-seek in the dark.", midnight:"Only whispered when the clock has just struck twelve.",
 cityburn:"A mercenary's motto about torching a whole town.", netrunner:"The hacker class of a neon-lit future.", choom:"Night City slang for a friend.", jackin:"What you do to a terminal before the code rains down.",
 flatline:"When the heart monitor sings one long note.", preem:"Night City for 'top quality'.", gonk:"Night City for 'idiot'.", blackwall:"The AI firewall nobody's supposed to cross.",
 easycome:"…easy go. Say both halves.", lumos:"A wand-lighting spell.", d20:"Ask for a roll of the biggest die in the bag.", creator:"Say the name of the person who built this place.",
 matrix:"Green code falls from the sky in this movie.", zombies:"The undead, plural.", wendigo:"An antlered legend of the frozen north.", ghost:"The EMF meter spikes when you say this.",
 allout:"The whole party jumps in for one finishing blow.", callingcard:"Thieves leave this before they steal a heart.", persona:"Say the name of the game itself.", velvet:"A blue room between dream and reality.",
 midnightchannel:"Tune in when it rains, after twelve.", darkhour:"The hidden 25th hour, when the moon looks wrong.", rankup:"A confidant's bond grows stronger.", batonpass:"Hand the turn to a teammate.",
 iamthou:"'…thou art I.' Say the first half.", lookingcool:"A compliment Joker's friends give him.", elpsy:"The mad scientist's sign-off. Two words, kind of Latin.", tuturu:"Mayuri's greeting.",
 dmail:"Email sent to the past.", timeleap:"Jump your memories back 48 hours.", organization:"The shadowy group Okabe fears.", hououin:"The mad scientist's chosen name.",
 worldline:"Attractor fields shift between these.", microwave:"A kitchen appliance that became a time machine.", snap:"Half of everything turns to dust.", pressf:"Pay respects with a single key.",
 achievement:"Unlocked! (say the word).", dragon:"A fire-breathing beast with wings.", goodkid:"A band name, or what your mom calls you.", drift:"Running tofu up a mountain, or that feeling you've seen this exact moment before.",
 redrum:"Read it backwards in a mirror.", behindyou:"Where the monster always is.", boo:"What a ghost says.", cursed:"A videotape you shouldn't have watched.",
 beamup:"Ask Scotty for a lift.", hyperspace:"The stars stretch into lines when you go this fast. Say the pilot's two-word order.", force:"May it be with you.", assimilate:"What the Borg tell you.",
 fortytwo:"The answer to life, the universe and everything.", spacecowboy:"See you… (finish the Bebop sign-off).", terminate:"A robot's farewell, in Spanish.", yippee:"John McClane's catchphrase.",
 illbeback:"The most famous three-word promise in action movies.", kamehameha:"Goku's signature beam.", nani:"The word you scream when someone says you're already dead.", leeroy:"He had chicken. He charged anyway.",
 fatality:"The gory word a certain announcer growls when you end a fight in style.", hadouken:"A fireball from a Street Fighter's palms.", gameover:"Two words on every arcade screen when you lose.", oneup:"A green mushroom would give you one of these. One digit, a hyphen, two letters.",
 cake:"Portal's most famous lie.", headshot:"A sniper's favorite word.", victory:"What you say after coming first in a battle royale… something about poultry.", levelup:"Your XP bar just filled.",
 crit:"When the dice roll max damage.", pog:"Twitch's favorite wide-eyed face.",
 konami:"↑↑↓↓←→←→ then tap the date twice.", moonwink:"Tap the sky's biggest light seven times.", shake:"Give your phone a good shake in a room.", credits:"Press and hold the date stamp.",
 combo:"Send five messages in ten seconds.", shiny:"About 1 in 500 messages sparkles. Keep talking.", lateowl:"Send something between 3 and 5 AM.",
};
const dayNum=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/864e5);
function hintOfDay(){   // ONE hint a day: picked once, then locked in until tomorrow (finding secrets doesn't hand out more)
  const today=dayNum();
  try{ const saved=JSON.parse(LS.get("nl-hint-pick")||"null"); if(saved&&saved.day===today){ const s=SECRET_LIST.find(x=>x.id===saved.id); if(s) return s; } }catch(e){}
  const left=SECRET_LIST.filter(s=>HINTS[s.id]&&!hasSecret(s.id)); if(!left.length) return null;
  const pick=left[today%left.length];
  try{ LS.set("nl-hint-pick",JSON.stringify({day:today,id:pick.id})); }catch(e){}
  return pick;
}
function paintHint(){
  const h=hintOfDay(), box=$("hintBox");
  if(!h){ box.textContent="🏆 You've found every secret. Legend."; return; }
  box.innerHTML="";
  if(hasSecret(h.id)){ box.append(el("b","","✅ You found today's secret!"),el("small",""," · new hint tomorrow")); return; }
  box.append(el("b","","🔍 Today's hint: "),el("span","",HINTS[h.id]));
  const left=SECRET_LIST.filter(s=>!hasSecret(s.id)).length; box.append(el("small","",` · ${left} still hidden · new hint tomorrow`));
}
function hintNudge(){
  const h=hintOfDay(); if(!h||hasSecret(h.id)) return;
  const key="nl-hint-"+dayNum(); try{ if(LS.get(key)) return; LS.set(key,"1"); }catch(e){}
  setTimeout(()=>{
    const t=el("button","toast"); t.type="button"; const body=el("span","tbody");
    body.append(el("div","ttitle","🔍 Daily secret hint"), el("div","ttext",HINTS[h.id]));
    t.append(el("span","sx-lock","🔍"),body); t.onclick=()=>{ t.remove(); openProfile(); profTab("me"); setTimeout(()=>$("hintBox").scrollIntoView({behavior:"smooth",block:"center"}),300); };
    $("toasts").prepend(t); setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },7000);
  },2500);
}

/* ================= SECRETS PACK 6: Fallout, Fall Guys, Persona 4 ================= */
const RX=(()=>{
  const layer=$("sfx");
  const add=(cls,html="")=>{ const d=document.createElement("div"); d.className=cls; d.innerHTML=html; layer.append(d); return d; };
  const later=(fn,ms)=>setTimeout(fn,ms), R=(a,b)=>a+Math.random()*(b-a);
  const chatClass=(cls,ms)=>{ const c=$("chat"); c.classList.remove(cls); void c.offsetWidth; c.classList.add(cls); later(()=>c.classList.remove(cls),ms); };
  const chime=(notes)=>{ try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); notes.forEach(([f,at,len,type])=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type=type||"triangle"; o.frequency.value=f; g.gain.setValueAtTime(.0001,ac.currentTime+at); g.gain.exponentialRampToValueAtTime(.07,ac.currentTime+at+.02); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+at+len); o.connect(g); g.connect(ac.destination); o.start(ac.currentTime+at); o.stop(ac.currentTime+at+len+.05); }); }catch(e){} };
  const senderFaces=m=>[...feed.querySelectorAll(`.face[data-uid="${CSS.escape(m?.user_id||"")}"]`)];
  return {
    war(){ chatClass("rx-sepia",4600); const w=add("rx-war",`<div class="rx-dust"></div><div class="rx-wartext"><span>WAR.</span><span>WAR NEVER CHANGES.</span></div>`); later(()=>w.remove(),4600); },
    pipboy(){ chatClass("rx-pip",4200); if(!hasSecret("pipboy")) later(()=>{ const c=add("sx-caption px-center","☢️ Wasteland theme unlocked in Theme & colors"); c.style.top="72%"; later(()=>c.remove(),2600); },2600); const p=add("rx-pipboy",`<div class="rx-pipframe"><div class="rx-piphead">WASTELAND OS v2.0 &nbsp;·&nbsp; BOOT OK</div><div class="rx-pipbody"><div class="rx-boy">☢️</div><div class="rx-piprows"><b>HP</b> 100/100<br><b>RAD</b> ▮▮▯▯▯<br><b>CAPS</b> 42<br><b>STATUS</b> still kicking</div></div></div>`); chime([[880,0,.08,"square"],[660,.1,.08,"square"]]); later(()=>p.remove(),4200); },
    nuka(){ for(let i=0;i<30;i++){ const c=add("rx-cap","⭐"); c.style.left=R(2,96)+"%"; c.style.animationDelay=R(0,1.6)+"s"; c.style.setProperty("--r",R(-720,720)+"deg"); later(()=>c.remove(),3800); } chime([[523,0,.1],[659,.1,.1],[784,.2,.2]]); const cap=add("sx-caption px-center rx-nukacap","🧢 +30 caps"); later(()=>cap.remove(),1800); },
    fallguys(){
      const colors=["#ff4fa3","#ffd400","#3dd6ff","#7cff6b","#ff7a3d","#c78bff"];
      for(let i=0;i<7;i++){ const b=add("rx-bean",`<svg viewBox="0 0 60 90"><path d="M30 4 C52 4 56 30 56 50 C56 74 46 88 30 88 C14 88 4 74 4 50 C4 30 8 4 30 4Z" fill="${colors[i%6]}" stroke="#07041A" stroke-width="4"/><ellipse cx="30" cy="40" rx="16" ry="20" fill="#fff" stroke="#07041A" stroke-width="3"/><circle cx="24" cy="38" r="3"/><circle cx="36" cy="38" r="3"/></svg>`); b.style.animationDelay=(i*.22)+"s"; b.style.bottom=(8+(i%3)*4)+"%"; later(()=>b.remove(),4200); }
      later(()=>{ const q=add("sx-banner rx-qualified","QUALIFIED!"); later(()=>q.remove(),1600); },2200);
      chime([[659,0,.12],[784,.12,.12],[988,.24,.12],[1319,.36,.3]]);
    },
    shadow(m){
      const p=cache.get(m?.user_id)||{username:"you"};
      const s=add("rx-shadow",`<div class="rx-shadowface"><span class="face"></span><i class="rx-eye l"></i><i class="rx-eye r"></i></div><div class="rx-shadowtext">"I am a shadow… <b>the true self.</b>"</div>`);
      paintFace(s.querySelector(".face"),p); chatClass("rx-tvworld",4200); if(navigator.vibrate) navigator.vibrate([20,80,20,80,200]);
      later(()=>s.remove(),4200);
    },
    beefbowl(m){
      chatClass("rx-rain",6000); const rain=add("rx-rainlayer"); for(let i=0;i<60;i++){ const d=document.createElement("i"); d.style.left=R(0,100)+"%"; d.style.animationDelay=R(0,1.2)+"s"; d.style.animationDuration=R(.5,.9)+"s"; rain.append(d); }
      const b=add("rx-bowl",`<div class="rx-bowltitle">☔ RAINY DAY MEGA BEEF BOWL CHALLENGE</div><div class="rx-bowlart"><svg viewBox="0 0 160 110"><ellipse cx="80" cy="34" rx="70" ry="22" fill="#8b4a1f" stroke="#07041A" stroke-width="4"/><ellipse cx="80" cy="30" rx="60" ry="16" fill="#c96a2c"/><path d="M20 40 Q80 130 140 40 Z" fill="#F4F7FF" stroke="#07041A" stroke-width="4"/><path d="M30 60 Q80 66 130 60" stroke="#E07AC6" stroke-width="5" fill="none"/></svg></div><div class="rx-timer">30:00</div><div class="rx-bowlfoot">Finish it and it's free.</div>`);
      const t=b.querySelector(".rx-timer"); let s=1800; const iv=setInterval(()=>{ s-=61; if(s<=0){ s=0; clearInterval(iv); t.textContent="TIME!"; b.querySelector(".rx-bowlfoot").textContent="Nice try. Come back next rainy day."; } else t.textContent=`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; },140);
      senderFaces(m).forEach(f=>{ const sw=el("span","rx-sweat","💦"); f.append(sw); later(()=>sw.remove(),6000); });
      later(()=>{ clearInterval(iv); b.remove(); rain.remove(); },6000);
    },
    junes(){
      const j=add("rx-junes",`<div class="rx-junesign">Every day's great<br>at your <span>JUNES</span></div><div class="rx-bags">🛍️ 🛍️ 🛍️</div>`);
      chime([[659,0,.18],[659,.2,.18],[880,.4,.18],[784,.6,.18],[659,.8,.32],[784,1.2,.18],[880,1.4,.5]]);
      later(()=>j.remove(),3600);
    },
  };
})();
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"war", name:"War never changes", re:/war never changes/i, play:()=>RX.war()},
  {id:"pipboy", name:"Pip-Boy", re:/pip[- ]?boy|vault[- ]?(boy|tec|dweller)/i, play:()=>RX.pipboy()},
  {id:"nuka", name:"Nuka-Cola", re:/nuka[- ]?cola|bottle ?caps?/i, play:()=>RX.nuka()},
  {id:"fallguys", name:"Qualified!", re:/fall ?guys?|(^|[^a-z])qualified!?([^a-z]|$)/i, play:()=>RX.fallguys()},
  {id:"shadow", name:"The true self", re:/(shadow,? )?the true self|i am a shadow/i, play:m=>RX.shadow(m)},
  {id:"beefbowl", name:"Beef bowl", re:/rainy day( mega)? beef bowl|mega beef bowl|beef bowl challenge/i, play:m=>RX.beefbowl(m)},
  {id:"junes", name:"Your Junes", re:/(^|[^a-z])junes([^a-z]|$)/i, play:()=>RX.junes()}
);
Object.assign(HINTS,{
  war:"The first thing every Fallout narrator says.",
  pipboy:"The green-screen wrist computer everyone in the wasteland wears. Say its name with a hyphen.",
  nuka:"The wasteland's favorite soda, or the currency it's capped with.",
  fallguys:"Sixty jellybeans race through an obstacle course. Say the game, or what the winners are.",
  shadow:"In the TV world, your other half admits what it really is.",
  beefbowl:"Inaba's free-if-you-finish-it challenge, only served in bad weather.",
  junes:"Every day's great at your…",
});

/* ================= SECRETS PACK 7: gotta go fast + plumber vibes ================= */
const MX=(()=>{
  const layer=$("sfx");
  const add=(cls,html="")=>{ const d=document.createElement("div"); d.className=cls; d.innerHTML=html; layer.append(d); return d; };
  const later=(fn,ms)=>setTimeout(fn,ms), R=(a,b)=>a+Math.random()*(b-a);
  const chatClass=(cls,ms)=>{ const c=$("chat"); c.classList.remove(cls); void c.offsetWidth; c.classList.add(cls); later(()=>c.classList.remove(cls),ms); };
  const chime=(notes)=>{ try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); notes.forEach(([f,at,len,type])=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type=type||"square"; o.frequency.value=f; g.gain.setValueAtTime(.0001,ac.currentTime+at); g.gain.exponentialRampToValueAtTime(.05,ac.currentTime+at+.02); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+at+len); o.connect(g); g.connect(ac.destination); o.start(ac.currentTime+at); o.stop(ac.currentTime+at+len+.05); }); }catch(e){} };
  return {
    gofast(){
      const lines=add("mx-speed"); for(let i=0;i<26;i++){ const l=document.createElement("i"); l.style.top=R(0,100)+"%"; l.style.animationDelay=R(0,1.2)+"s"; l.style.width=R(60,220)+"px"; lines.append(l); }
      chatClass("mx-dash",2200);
      let count=0; const ring=add("mx-rings",`<span class="mx-ring"></span><b>×0</b>`); const b=ring.querySelector("b");
      const iv=setInterval(()=>{ count+=1+Math.floor(Math.random()*3); b.textContent="×"+count; chime([[1568,0,.05,"sine"],[2093,.05,.08,"sine"]]); if(count>=50){ clearInterval(iv); } },140);
      for(let i=0;i<12;i++){ const r=add("mx-ringfly"); r.style.top=R(20,80)+"%"; r.style.animationDelay=(i*.13)+"s"; later(()=>r.remove(),2600); }
      later(()=>{ clearInterval(iv); const s=add("sx-banner qx-stamp mx-fast","GOTTA GO FAST!"); later(()=>s.remove(),1500); },1400);
      later(()=>{ lines.remove(); ring.remove(); },3000);
    },
    letsago(){
      chatClass("mx-hop",1200); chime([[660,0,.08],[880,.08,.12]]);
      later(()=>{ chime([[988,0,.06],[1319,.06,.18]]); const c=add("mx-coin","🪙"); c.style.left="50%"; later(()=>c.remove(),1200); const t=add("mx-cointext","+1 coin"); later(()=>t.remove(),1200); },350);
      later(()=>{ const s=add("sx-banner qx-stamp mx-letsago","LET'S-A GO!"); later(()=>s.remove(),1400); },700);
    },
    mammamia(){
      feed.querySelectorAll(".msg").forEach((n,i)=>{ n.style.animationDelay=(i*50)+"ms"; n.classList.add("mx-fall"); later(()=>{ n.classList.remove("mx-fall"); n.style.animationDelay=""; },2600); });
      chime([[494,0,.15],[440,.15,.15],[415,.3,.15],[392,.45,.4]]); const s=add("sx-banner qx-stamp mx-mamma","MAMMA MIA!"); later(()=>s.remove(),1800);
    },
    powerup(m){
      feed.querySelectorAll(`.face[data-uid="${CSS.escape(m?.user_id||"")}"]`).forEach(f=>{ f.classList.remove("mx-grow"); void f.offsetWidth; f.classList.add("mx-grow"); later(()=>f.classList.remove("mx-grow"),3000); });
      chime([[523,0,.06],[659,.06,.06],[784,.12,.06],[1047,.18,.06],[1319,.24,.06],[1568,.3,.2]]); const c=add("sx-caption px-center","🍄 POWER UP!"); later(()=>c.remove(),1600);
    },
  };
})();
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"gofast", name:"Gotta go fast", re:/gotta go fast|way past cool|(^|[^a-z])(too|2) slow!?([^a-z]|$)/i, play:()=>MX.gofast()},
  {id:"letsago", name:"Let's-a go", re:/let'?s-?a go|it'?s-?a me|wahoo+/i, play:()=>MX.letsago()},
  {id:"mammamia", name:"Mamma mia", re:/mamma mia|mama mia/i, play:()=>MX.mammamia()},
  {id:"powerup", name:"Power up", re:/power[- ]?up|super mushroom/i, play:m=>MX.powerup(m)}
);
Object.assign(HINTS,{
  gofast:"A blue blur's motto about speed.",
  letsago:"An Italian plumber's cheer before a jump.",
  mammamia:"What the same plumber says when things go wrong.",
  powerup:"Eat the mushroom and you grow twice as tall.",
});

/* ================= DRAGON (silhouette scene), ONE PIECE, XP ================= */
const DRAGON_IMG="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAACACAYAAAC1BNNAAAAEJUlEQVR42u3dUWrDMBCE4VoIeofe/2y9Q6DQPgVKSFI5leyV9pvXUkfW/jsa2Y7z9kZT671+fL/Xj28zsU+bKTge1FHHvnx9qmej6kqFJ2pVAT0Bf7AsxYwlJfhX+DUApQOf+1Nq8Lk/nalQ0MmoVtOU4GsA8KeIOopGwJf/CfgagBJmfPlfZEzv+IpJwBd/KGvUEX+skGkd3wpAwNcAlB18y/t8MfCsr06WVQvO/Skl+BrAyvRMmwnOoYjNf68WR42zgJ4yqgKdotXsCNd3A0vcCVezI8ZZZ4P78vW5AZ3rL+34AM/p+EeMdwM5+CPXe9R4K9gpozaQc/3oDIwY7wZy4M9ger3HvAEd+LOs8j3HXYFOGVf9Dexcfxbouzv+75tDQKdoDXplseeNLXdBOX5Yx39kxD3GXiAgg2fK9sCnqZq0dwyvz5YNMYhWzfuu6oCpW9Y/4mpOr6xfX50gjUDRItAQ8Fu7kGyWZzi+Z3WoS9w5s+avjN/TmfQv8KPUde85lCMH5v024k0UbSaQXnHMiDXbcw5TvGSIYkETuUat51GjD1wjMKYR8uNv1Az0SiY0zXt17sFvNeD0U29uexTFi6bG5eMj5vX62T0/61lSWDZCaIK59lijnwS4Pa802VkjxAAwQoy9fH1uJVNBbZLnMYrR3xADgtUg7N5iZH2Av3ATzLDhb3X2KZ7O1AjxwIp6Hmc9KuE7t417g9n3B6vsb/5zHr//l+MnWA0iR55XQX50Pq3HA75olHIVEnUGRSMzEVsKZDVIuefg+FYDjk9WgiyOD3xNAHzSCBmgB75GSAu+zS2lVDUFXB74BPgkkvEBny7fy/igTyvggz6d28v4YOf4BHqbWwL7wjGH41NayfhcXsYn0GeIOTI+4FNCL+oAPq04PuDTuT3wgZ4SeptbEnWI02dweuADPjX8og7oUwr4oAc+gT7LvAEf9ByfQA980NPC8wh80HN80BPwQU8LzyvwieNzJcoyv1VR6C/9fvZmlTkroKdnwN8+cLbKb3gV0FML8KvBX0BPrcCvNOcF9JRRLmfSS8awd2WIZjpFUeko+IEPevMFfAI/8BVw4bmLVIuicJRxDouCraMzr8O3fm6UuhTQrwf8iAZ4NKezXtkpoJ8f+qNWgL/mdqYm2IC/HvBHzM2jz+8Zizg+6Luca88VYPa5LqCf+5zPbgDg0+kNsLcJjtoAA5/bh10FOD7oU0W/UZEnepSqgM8B/2gQj/ystI4P+r4RaDSotzfXOD51iRB7jOC9fnzfHmOkkUR1/+kcP7vb37uCEwmuWb6kXkBv47sHylawvS0Z9MtvKP/aO3jLAp0WM3r8/dn/jTp2avC5/euN0PImtBFQ+mXzhYGKVNzWO7b3ruo8A7bHOUZsgjoLaJHHFmFFaoU5+8NpV/0As4EXcEP5Yk8AAAAASUVORK5CYII=";
QX.dragon=function(){
  const layer=$("sfx"); const scene=document.createElement("div"); scene.className="dg-scene";
  scene.innerHTML=`<div class="dg-stars">${[...Array(28)].map(()=>`<i style="left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*2}s"></i>`).join("")}</div><div class="dg-moon"></div><img class="dg-dragon" src="${DRAGON_IMG}" alt="">`;
  layer.append(scene); setTimeout(()=>scene.classList.add("out"),4600); setTimeout(()=>scene.remove(),5400);
};
QX.onepiece=function(){
  const layer=$("sfx"); const d=document.createElement("div"); d.className="op-wrap";
  d.innerHTML=`<div class="op-chest"><div class="op-glow"></div><div class="op-lid"><i></i></div><div class="op-body"><b></b></div></div><div class="sx-caption op-cap">the treasure is…</div>`;
  layer.append(d);
  const lid=d.querySelector(".op-lid"), cap=d.querySelector(".op-cap");
  setTimeout(()=>d.classList.add("open"),600);
  setTimeout(()=>{ d.classList.remove("open"); d.classList.add("slam"); cap.textContent="…nice try. Keep sailing. 🏴‍☠️"; if(navigator.vibrate) navigator.vibrate(60); },2300);
  setTimeout(()=>d.remove(),4200);
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"onepiece", name:"The One Piece", re:/one piece/i, play:()=>QX.onepiece()}
);
/* 🐈 Hagrid: the Creator's cat. Call him like any cat: pspsps (or "pss pss pss") */
const HAGRID_IMG="data:image/png;base64,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";
QX.hagrid=function(m){
  const layer=$("sfx"), W=innerWidth, FRAME=108;
  const cat=document.createElement("div"); cat.className="hg-cat"; cat.style.backgroundImage=`url(${HAGRID_IMG})`;
  const bub=document.createElement("div"); bub.className="hg-bubble"; bub.textContent="mrrp?";
  layer.append(cat,bub);
  const mid=Math.round(W/2-54), speed=110;   // px per second
  let x=-FRAME, phase="in", t0=performance.now(), last=t0, frame=0, ft=0;
  const show=f=>{ cat.style.backgroundPosition=`${-f*FRAME}px 0`; };
  const meow=()=>{ try{ if(typeof uiSoundOn==="function"&&!uiSoundOn()) return; const ac=sfxCtx(); if(ac.state==="suspended") ac.resume();
    const o=ac.createOscillator(), g=ac.createGain(), t=ac.currentTime; o.type="triangle";
    o.frequency.setValueAtTime(520,t); o.frequency.linearRampToValueAtTime(820,t+.12); o.frequency.linearRampToValueAtTime(600,t+.32);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.09,t+.04); g.gain.exponentialRampToValueAtTime(.001,t+.36);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t+.4); }catch(e){} };
  const paw=()=>{ const b=m&&document.querySelector(`.msg[data-id="${m.id}"] .bubble`); if(!b||b.querySelector(".hg-paw")) return;
    const s=document.createElementNS("http://www.w3.org/2000/svg","svg"); s.setAttribute("viewBox","0 0 7 6"); s.setAttribute("class","hg-paw"); s.setAttribute("shape-rendering","crispEdges"); s.setAttribute("aria-hidden","true");
    s.innerHTML='<path fill="currentColor" d="M1 0h1v1H1zM3 0h1v1H3zM5 0h1v1H5zM0 2h1v1H0zM6 2h1v1H6zM2 2h3v1H2zM1 3h5v2H1zM2 5h3v1H2z"/>'; b.append(s); };
  let sitAt=0;
  const tick=now=>{
    const dt=(now-last)/1000; last=now;
    if(phase==="in"||phase==="out"){
      x+=speed*dt; ft+=dt; if(ft>.12){ ft=0; frame=(frame+1)%4; } show(frame);
      if(phase==="in"&&x>=mid){ x=mid; phase="sit"; sitAt=now; show(4); paw(); }
      if(phase==="out"&&x>W+10){ cat.remove(); bub.remove(); return; }
    } else {
      const k=now-sitAt;
      show((k>500&&k<640)||(k>1500&&k<1640)?5:4);           // two slow blinks
      if(k>700&&!bub.classList.contains("on")){ bub.classList.add("on"); meow(); }
      if(k>2100) bub.classList.remove("on");
      if(k>2400){ phase="out"; }
    }
    cat.style.transform=`translateX(${Math.round(x)}px)`; bub.style.left=(Math.round(x)+66)+"px";
    requestAnimationFrame(tick);
  };
  show(0); cat.style.transform=`translateX(${x}px)`; requestAnimationFrame(tick);
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"hagrid", name:"Hagrid", re:/(^|[^a-z])(?:p+s+[\s.!~]*){3,}(?=$|[^a-z])/i, play:m=>QX.hagrid(m)}
);
/* 🦈 Jaws: four secrets; find any two for the Shark frame */
const jwSound=(fn)=>{ try{ if(typeof uiSoundOn==="function"&&!uiSoundOn()) return; const ac=sfxCtx(); if(ac.state==="suspended") ac.resume(); fn(ac,ac.currentTime); }catch(e){} };
const jwNote=(ac,t,f,d,vol=.22)=>{ const o=ac.createOscillator(), lp=ac.createBiquadFilter(), g=ac.createGain(); o.type="sawtooth"; o.frequency.value=f; lp.type="lowpass"; lp.frequency.value=420;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.03); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(lp).connect(g).connect(ac.destination); o.start(t); o.stop(t+d+.05); };
const jwTheme=(n=14)=>jwSound((ac,t)=>{ let gap=.62; for(let i=0;i<n;i++){ jwNote(ac,t,i%2?87.3:82.4,Math.min(.5,gap*.9)); t+=gap; gap=Math.max(.13,gap*.84); } });   // E2, F2… faster and faster
const jwWater=L=>{ const w=el("div","jw-water"); L.append(w); return w; };
const jwTeeth=()=>{ const t=el("div","jw-teeth"); const n=14, pts=[]; for(let i=0;i<=n;i++){ pts.push(`${i/n*100}% 0`); if(i<n) pts.push(`${(i+.5)/n*100}% 100%`); } t.style.clipPath=`polygon(${pts.join(",")})`; return t; };
const jwMouth=L=>{ const m=el("div","jw-mouth"); const top=el("div","jw-jaw top"), bot=el("div","jw-jaw bot"); top.append(jwTeeth()); bot.append(jwTeeth()); m.append(el("div","jw-in"),top,bot); L.append(m); return m; };
const JW_BOAT='<svg viewBox="0 0 24 14" shape-rendering="crispEdges" aria-hidden="true"><rect x="9" y="2" width="6" height="5" fill="#f4f1ff"/><rect x="10" y="3" width="2" height="2" fill="#4aa8d8"/><rect x="11" y="0" width="1" height="2" fill="#07041a"/><path d="M1 7h22l-3 6H4z" fill="#8a4b2a"/><rect x="1" y="7" width="22" height="1" fill="#c9773f"/></svg>';
QX.jawstheme=function(){
  const L=sxLayer("sxJaws",5600); jwWater(L);
  const fin=el("div","jw-fin"); L.append(fin); setTimeout(()=>fin.classList.add("go"),700);
  const cap=sxCap(L,"duun-nuh…","jw-cap"); setTimeout(()=>cap.textContent="duun-nuh… duun-nuh…",1700); setTimeout(()=>cap.textContent="DUN-NUH DUN-NUH DUN-NUH",3000);
  jwTheme(16); if(navigator.vibrate) setTimeout(()=>navigator.vibrate([60,90,60,70,60,50,60]),2600);
};
QX.biggerboat=function(){
  const L=sxLayer("sxJaws",5600); jwWater(L);
  const boat=el("div","jw-boat"); boat.innerHTML=JW_BOAT; L.append(boat);
  const m=jwMouth(L); jwTheme(8);
  setTimeout(()=>m.classList.add("up"),1500);
  setTimeout(()=>{ m.classList.add("shut"); boat.classList.add("sunk"); if(navigator.vibrate) navigator.vibrate(120); jwSound((ac,t)=>jwNote(ac,t,55,.5,.35)); },2500);
  setTimeout(()=>sxCap(L,"You're gonna need a bigger boat.","jw-cap"),3000);
};
QX.amity=function(){
  const L=sxLayer("sxJaws",5000);
  const s2=el("div","jw-sign"); s2.innerHTML='<b>WELCOME TO AMITY ISLAND</b><small>the beaches are open ☀</small><i></i><div class="jw-fin"></div>'; L.append(s2);
  setTimeout(()=>{ const c=sxCap(L,"…it's a beautiful day for a swim.","jw-cap"); c.style.top="68%"; c.style.fontSize="clamp(20px,6vw,34px)"; },1600);
  jwSound((ac,t)=>{ [523,659,784].forEach((f,i)=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type="triangle"; o.frequency.value=f; g.gain.setValueAtTime(.08,t+i*.12); g.gain.exponentialRampToValueAtTime(.001,t+i*.12+.25); o.connect(g).connect(ac.destination); o.start(t+i*.12); o.stop(t+i*.12+.3); }); });
  setTimeout(()=>jwTheme(4),2600);
};
QX.smile=function(){
  const L=sxLayer("sxJaws",5400); jwWater(L);
  const m=jwMouth(L); setTimeout(()=>m.classList.add("up"),300);
  const tank=el("div","jw-tank"); tank.style.top="66%"; L.append(tank);
  setTimeout(()=>{ const c=el("div","jw-cross"); c.style.top="66%"; L.append(c); },900);
  const cap=sxCap(L,"Smile, you son of a—","jw-cap");
  setTimeout(()=>{ L.append(el("div","jw-boom")); m.remove(); tank.remove(); L.querySelector(".jw-cross")?.remove(); cap.textContent="BOOM 💥";
    if(navigator.vibrate) navigator.vibrate([200,60,120]);
    jwSound((ac,t)=>{ const b=ac.createBuffer(1,ac.sampleRate*.8,ac.sampleRate), d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.5);
      const src=ac.createBufferSource(), lp=ac.createBiquadFilter(), g=ac.createGain(); src.buffer=b; lp.type="lowpass"; lp.frequency.value=900; g.gain.value=.5; src.connect(lp).connect(g).connect(ac.destination); src.start(t); }); },2300);
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"jawstheme",  name:"Duun-nuh",           re:/(^|[^a-z])(duh+[- ]?nuh+|du+n+[- ]?nu+n*h*|da+[- ]?du+m)(?:[\s.,!…-]+(duh+[- ]?nuh+|du+n+[- ]?nu+n*h*|da+[- ]?du+m)){1,}/i, play:()=>QX.jawstheme()},
  {id:"biggerboat", name:"A bigger boat",      re:/(gonna|going to) need a bigger boat/i, play:()=>QX.biggerboat()},
  {id:"amity",      name:"Amity Island",       re:/amity island/i, play:()=>QX.amity()},
  {id:"smileyou",   name:"Smile, you…",        re:/smile,? you son of a/i, play:()=>QX.smile()}
);
Object.assign(HINTS,{jawstheme:"Hum the two low notes that mean something's in the water. Twice.",
  biggerboat:"What the police chief says the first time he sees the shark.",
  amity:"The island town that kept its beaches open.",
  smileyou:"The chief's last words to the shark, right before he hits the tank."});
/* 🗺️ INK MAP: "I solemnly swear that I am up to no good" turns your NightLane into a parchment map;
   "Mischief managed" folds it into a letter that flies away. Only on the phone that said it; remembered until you say the second spell. */
const INKMAP={
  KEY:"nl-inkmap",
  isOn(){ return document.body.classList.contains("inkmap"); },
  set(on){ document.body.classList.toggle("inkmap",!!on); try{ LS.set(this.KEY,on?"1":""); }catch(e){} if(typeof INKMAP.onChange==="function") try{ INKMAP.onChange(!!on); }catch(e){} },
  // ✍️ for Cole's walking footprints: one left and one right shoe print (inline SVG, ink brown). Use them however you like.
  FOOT_L:'<svg viewBox="0 0 12 22" width="12" height="22" aria-hidden="true"><path fill="#3b2414" d="M6 0c3 0 5 3 5 7 0 3-1 5-2 7H3C1 11 1 8 1 6c0-3 2-6 5-6zM3 16h6c0 3-1 6-3 6s-3-3-3-6z"/></svg>',
  FOOT_R:'<svg viewBox="0 0 12 22" width="12" height="22" aria-hidden="true" style="transform:scaleX(-1)"><path fill="#3b2414" d="M6 0c3 0 5 3 5 7 0 3-1 5-2 7H3C1 11 1 8 1 6c0-3 2-6 5-6zM3 16h6c0 3-1 6-3 6s-3-3-3-6z"/></svg>',
};
try{ if(LS.get(INKMAP.KEY)==="1") document.body.classList.add("inkmap"); }catch(e){}
QX.solemnly=function(m){
  const mine=!m||m.user_id===user?.id;
  if(!mine){   // a friend is up to no good: a little ink blot and a whisper, but your screen stays yours
    const L=sxLayer("sxInk",2600); const c=sxCap(L,`${nameOf(m.user_id)} is up to no good…`); c.style.fontFamily='"IM Fell English",Georgia,serif'; c.style.fontStyle="italic"; return; }
  if(INKMAP.isOn()){ const L=sxLayer("sxInk",2200); sxCap(L,"The map is already open…"); return; }
  const L=sxLayer("sxInk",4600);
  L.append(el("div","im-ink"), el("div","im-reveal"));
  const w=el("div","im-words","I solemnly swear that I am up to no good"); L.append(w);
  try{ const ac=sfxCtx(); if(uiSoundOn()&&ac){ if(ac.state==="suspended") ac.resume(); const t=ac.currentTime; [392,466,587,698].forEach((f,i)=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type="sine"; o.frequency.value=f; g.gain.setValueAtTime(0,t+1.2+i*.18); g.gain.linearRampToValueAtTime(.07,t+1.25+i*.18); g.gain.exponentialRampToValueAtTime(.001,t+2.2+i*.18); o.connect(g).connect(ac.destination); o.start(t+1.2+i*.18); o.stop(t+2.4+i*.18); }); } }catch(e){}
  setTimeout(()=>INKMAP.set(true),2000);
};
QX.mischief=function(m){
  const mine=!m||m.user_id===user?.id;
  if(!mine||!INKMAP.isOn()){ const L=sxLayer("sxInk",2200); const c=sxCap(L,"Mischief managed."); c.style.fontFamily='"IM Fell English",Georgia,serif'; c.style.fontStyle="italic"; return; }
  const L=sxLayer("sxInk",3600); L.style.transition="none";
  const sh=el("div","im-sheet"), top=el("div","im-half top"), bot=el("div","im-half bot"); sh.append(bot,top); L.append(sh);
  INKMAP.set(false);                         // the neon app is waiting underneath the paper
  setTimeout(()=>sh.classList.add("f1"),80);   // fold the top half down
  setTimeout(()=>{ sh.remove(); const lt=el("div","im-letter"); L.append(lt);   // folded small and sealed
    setTimeout(()=>lt.classList.add("fly"),700); },700);
  try{ const ac=sfxCtx(); if(uiSoundOn()&&ac){ if(ac.state==="suspended") ac.resume(); const t=ac.currentTime; const b=ac.createBuffer(1,ac.sampleRate*.25,ac.sampleRate), d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length)*.5;
    [0,.7,1.45].forEach(k=>{ const src=ac.createBufferSource(), f=ac.createBiquadFilter(), g=ac.createGain(); src.buffer=b; f.type="bandpass"; f.frequency.value=1800+k*900; g.gain.value=.25; src.connect(f).connect(g).connect(ac.destination); src.start(t+k); }); } }catch(e){}
  setTimeout(()=>{ document.body.classList.add("im-glitch"); setTimeout(()=>document.body.classList.remove("im-glitch"),750); },2500);
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"solemnly", name:"Up to no good", re:/i solemnly swear,? (that )?i('?m| am) up to no good/i, mode:on=>INKMAP.set(true), play:m=>QX.solemnly(m)},
  {id:"mischief", name:"Mischief managed", re:/(^|[^a-z])mischief managed/i, mode:on=>INKMAP.set(false), play:m=>QX.mischief(m)}
);
Object.assign(HINTS,{solemnly:"Swear, very seriously, that you're up to no good. The whole oath.",
  mischief:"Two words that close the map when the mischief is done."});
/* 🕸️ COMIC VERSE: "Anyone can wear the mask" jumps your NightLane into a comic-print universe;
   "That's a canon event" glitches it back. Only on the phone that said it; remembered until you say the second line.
   Can't be in two universes at once, so it closes the ink map (and the map closes it). */
const VERSE={
  KEY:"nl-verse", _iv:null,
  isOn(){ return document.body.classList.contains("verse"); },
  set(on){
    on=!!on;
    if(on&&INKMAP.isOn()) INKMAP.set(false);
    document.body.classList.toggle("verse",on); try{ LS.set(this.KEY,on?"1":""); }catch(e){}
    this.loop(on); try{ paintTyping(); }catch(e){}
  },
  loop(on){   // every so often a message slips into another dimension and snaps back
    clearInterval(this._iv); this._iv=null; if(!on) return;
    this._iv=setInterval(()=>{
      if(document.hidden||reducedMotion()||!fxEnabled()) return;
      const all=[...document.querySelectorAll("#feed .msg, .feed .msg")].filter(x=>{ const r=x.getBoundingClientRect(); return r.bottom>0&&r.top<innerHeight; });
      if(!all.length) return; const m=all[Math.floor(Math.random()*all.length)];
      m.classList.remove("sv-split"); void m.offsetWidth; m.classList.add("sv-split"); setTimeout(()=>m.classList.remove("sv-split"),520);
    },5200+Math.random()*2400);
  },
  SFX:["THWIP!","BAM!","POW!","ZAP!","WHAM!","KRAK!","FWOOSH!","BOOM!"],
  pop(){   // a comic sound effect bursts over the compose bar when you send
    if(!this.isOn()||!fxEnabled()||reducedMotion()) return;
    const c=document.querySelector(".compose"), r=c?c.getBoundingClientRect():{left:20,top:innerHeight-120,width:300};
    const b=el("div","sv-sfx",this.SFX[Math.floor(Math.random()*this.SFX.length)]);
    b.style.left=Math.max(8,Math.min(innerWidth-190,r.left+r.width*(.25+Math.random()*.4)))+"px"; b.style.top=Math.max(60,r.top-70)+"px";
    document.body.append(b); setTimeout(()=>b.remove(),950);
  },
  SENSE:'<svg class="sv-sense" viewBox="0 0 26 22" aria-hidden="true"><g fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path stroke="#000" d="M3 4l3 3-2 2 4 3M13 1v4l-2 2 2 3M23 4l-3 3 2 2-4 3"/><path stroke="#ff2d55" d="M2 16l4-1M24 16l-4-1M13 21v-4"/></g></svg>',
  typing(box,label){   // the typing indicator in comic mode
    let t=box.querySelector(".sv-think");
    if(!t){ box.innerHTML=""; t=el("div","sv-think"); t.innerHTML=this.SENSE+'<span class="sv-cloud"><span class="sv-who"></span><span class="sv-dots" aria-hidden="true"><i></i><i></i><i></i></span></span>'; box.append(t); }
    t.querySelector(".sv-who").textContent=label.toUpperCase();
  }
};
try{ if(LS.get(VERSE.KEY)==="1"&&LS.get(INKMAP.KEY)!=="1"){ document.body.classList.add("verse"); setTimeout(()=>VERSE.loop(true),1500); } }catch(e){}
{ const _imset=INKMAP.set; INKMAP.set=function(on){ if(on&&VERSE.isOn()) VERSE.set(false); _imset.call(INKMAP,on); try{ paintTyping(); }catch(e){} }; }
/* 🔁 secret looks (Spider-Verse / the ink map) follow your account, so your phone and computer match */
const LOOKSYNC={
  _quiet:false, _t:null,
  now(){ return VERSE.isOn()?"verse":INKMAP.isOn()?"inkmap":"none"; },
  apply(look){   // switch this device to the account's look, quietly (no save back)
    if(!look||look===this.now()) return;
    this._quiet=true;
    try{ if(look==="verse") VERSE.set(true); else if(look==="inkmap") INKMAP.set(true); else { if(VERSE.isOn()) VERSE.set(false); if(INKMAP.isOn()) INKMAP.set(false); } }
    finally{ this._quiet=false; }
  },
  changed(){ if(this._quiet||!user) return; clearTimeout(this._t); this._t=setTimeout(()=>api.setLook(this.now()).catch(()=>{}),400); },
  async pull(){
    if(!user) return; const look=await api.getLook(user.id).catch(()=>undefined);
    if(look===undefined) return;                       // SQL not run yet: each device keeps its own
    if(look===null){ if(this.now()!=="none") api.setLook(this.now()).catch(()=>{}); return; }   // first time: this device's look becomes the account's
    this.apply(look);
  }
};
{ const _vs=VERSE.set; VERSE.set=function(on){ _vs.call(VERSE,on); LOOKSYNC.changed(); };
  const _is=INKMAP.set; INKMAP.set=function(on){ _is.call(INKMAP,on); LOOKSYNC.changed(); }; }
document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&user) LOOKSYNC.pull(); });
function svBeep(kind){   // a stuttery synth zap (portal) or a tape-glitch crunch (canon)
  try{ const ac=sfxCtx(); if(!uiSoundOn()||!ac) return; if(ac.state==="suspended") ac.resume(); const t=ac.currentTime;
    const notes=kind==="in"?[220,330,440,660,880,1320]:[880,523,659,330,247,165];
    notes.forEach((f,i)=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type="square"; o.frequency.value=f; const s=t+i*.09;
      g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(.045,s+.01); g.gain.exponentialRampToValueAtTime(.001,s+.08); o.connect(g).connect(ac.destination); o.start(s); o.stop(s+.1); });
  }catch(e){}
}
QX.mask=function(m){
  const mine=!m||m.user_id===user?.id;
  if(!mine){ const L=sxLayer("sxVerse",2600); sxCap(L,`${nameOf(m.user_id)} just jumped universes…`,"small sv-cap"); return; }
  if(VERSE.isOn()){ const L=sxLayer("sxVerse",2200); sxCap(L,"You're already in this universe.","small sv-cap"); return; }
  const L=sxLayer("sxVerse",3400); L.classList.add("sv-portal");
  [["#ff2d55",0],["#00e5ff",.12],["#ffe600",.24],["#ff2d55",.4],["#00e5ff",.52]].forEach(([c,d])=>{ const r=el("div","sv-ring"); r.style.setProperty("--c",c); r.style.setProperty("--d",d+"s"); L.append(r); });
  setTimeout(()=>sxCap(L,"ANYONE CAN WEAR THE MASK.","sv-cap"),650);
  svBeep("in"); if(navigator.vibrate) navigator.vibrate([20,40,20,40,60]);
  setTimeout(()=>VERSE.set(true),1200);
};
QX.canon=function(m){
  const mine=!m||m.user_id===user?.id;
  if(!mine||!VERSE.isOn()){ const L=sxLayer("sxVerse",2200); sxCap(L,"That's a canon event.","small sv-cap"); return; }
  const L=sxLayer("sxVerse",2600);
  for(let i=0;i<7;i++){ const s=el("div","sv-slice"); s.style.top=(i*14+Math.random()*6)+"%"; s.style.height=(4+Math.random()*9)+"%"; s.style.setProperty("--c",["#ff2d55","#00e5ff","#ffe600"][i%3]); s.style.setProperty("--d",(i*.05)+"s"); L.append(s); }
  sxCap(L,"CANON EVENT.","sv-cap");
  svBeep("out"); if(navigator.vibrate) navigator.vibrate([60,30,20,30,20]);
  setTimeout(()=>{ VERSE.set(false); document.body.classList.add("im-glitch"); setTimeout(()=>document.body.classList.remove("im-glitch"),750); },900);
};
QX.leap=function(){   // the screen drops away… and swings back up
  const L=sxLayer("sxVerse",2400); sxCap(L,"LEAP OF FAITH","small sv-cap");
  document.body.classList.remove("sv-leap"); void document.body.offsetWidth; document.body.classList.add("sv-leap");
  setTimeout(()=>document.body.classList.remove("sv-leap"),1600);
  try{ const ac=sfxCtx(); if(uiSoundOn()&&ac){ if(ac.state==="suspended") ac.resume(); const t=ac.currentTime, o=ac.createOscillator(), g=ac.createGain(); o.type="triangle";
    o.frequency.setValueAtTime(900,t); o.frequency.exponentialRampToValueAtTime(120,t+.45); o.frequency.exponentialRampToValueAtTime(700,t+.9);
    g.gain.setValueAtTime(.06,t); g.gain.exponentialRampToValueAtTime(.001,t+1); o.connect(g).connect(ac.destination); o.start(t); o.stop(t+1.05); } }catch(e){}
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"mask",  name:"Anyone can wear the mask", re:/anyone can wear the mask/i, mode:on=>VERSE.set(true), play:m=>QX.mask(m)},
  {id:"canon", name:"Canon event", re:/(^|[^a-z])canon event/i, mode:on=>VERSE.set(false), play:m=>QX.canon(m)},
  {id:"leap",  name:"Leap of faith", re:/(^|[^a-z])leap of faith([^a-z]|$)/i, play:m=>QX.leap(m)}
);
Object.assign(HINTS,{mask:"Five words that say a hero can be anybody. Say it and jump universes.",
  canon:"Two words for a moment that has to happen in every universe. They bring you home.",
  leap:"It's not a jump. It's a…"});
/* 🦁 VOL + TRON: say Keith → the two of them, VOL on one chest (red), TRON on the other (blue). Photo from Cole. */
/* (moved to js/00-media.js) */
QX.voltronpals=function(){
  const L=sxLayer("sxVoltron",5200); L.classList.add("dim");
  const w=el("div","vt-wrap"), ph=el("div","vt-photo"), im=new Image(); im.src=VT_IMG; im.alt="Kenneth and Cole"; ph.append(im);
  ph.append(el("span","vt-word vol","VOL"), el("span","vt-plus","+"), el("span","vt-word tron","TRON"), el("div","vt-flash"));
  w.append(ph); L.append(w);
  try{ const ac=sfxCtx(); if(uiSoundOn()&&ac){ if(ac.state==="suspended") ac.resume(); const t=ac.currentTime;
    [[.9,196],[1.35,262],[1.8,392]].forEach(([d,f],i)=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type=i===2?"sawtooth":"square"; o.frequency.value=f; g.gain.setValueAtTime(0,t+d); g.gain.linearRampToValueAtTime(.06,t+d+.02); g.gain.exponentialRampToValueAtTime(.001,t+d+(i===2?.9:.3)); o.connect(g).connect(ac.destination); o.start(t+d); o.stop(t+d+1); }); } }catch(e){}
  setTimeout(()=>{ if(navigator.vibrate) navigator.vibrate([30,60,30,60,120]); },1800);
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"voltronpals", name:"Vol + Tron", re:/(^|[^a-z])keith([^a-z]|$)/i, play:()=>QX.voltronpals()}
);
Object.assign(HINTS,{voltronpals:"Two friends, one robot. Say the red paladin's name."});

Object.assign(HINTS,{hagrid:"The Creator's cat comes when you call him the way you call any cat. Three times."});
Object.assign(HINTS,{onepiece:"The treasure at the end of the Grand Line. Say its name."});
HINTS.dragon="A winged silhouette crosses the moon when you say it.";

/* ---------- XP & levels ---------- */
const XP_KEY="nl-xp";
const XP_RULES={secret:50,message:2,photo:6,voice:6,sticker:3,poll:10,vote:2,game:5,gamewin:30,friend:15,daily:20,reply:3,reaction:1,task:4,pin:2,rename:5,theme:10,habit:8,backlog:3,backlogdone:10,qotd:15};
const LEVEL_TITLES=["Newcomer","Regular","Night Owl","Neon Runner","Chatterbox","Phantom","Netrunner","Legend","Choom Supreme","Creator's Favorite","Mythic"];
const xpData=()=>{ try{ return JSON.parse(LS.get(XP_KEY))||{xp:0,log:{}}; }catch(e){ return {xp:0,log:{}}; } };
const xpNeed=lvl=>100+Math.round(60*(lvl-1)*(lvl-1)*.6+40*(lvl-1));   // xp to go from lvl → lvl+1
function xpLevel(total){ let lvl=1,rem=total; while(rem>=xpNeed(lvl)){ rem-=xpNeed(lvl); lvl++; } return {lvl,rem,need:xpNeed(lvl)}; }
let lastXpToast=0;
function gainXP(kind,mult=1){
  const amt=(XP_RULES[kind]||0)*mult; if(!amt) return;
  const d=xpData(); const before=xpLevel(d.xp).lvl;
  d.xp+=amt; d.log[kind]=(d.log[kind]||0)+1; try{ LS.set(XP_KEY,JSON.stringify(d)); }catch(e){} progressChanged();
  const now=xpLevel(d.xp);
  if(!$("profile").classList.contains("hidden")) paintXP(); paintHomeLevel();
  if(now.lvl>before) whenEffectsQuiet(()=>{   // wait for any easter egg on screen to finish first, so they don't pile up
    sfx("levelup");
    setTimeout(checkUnlocks,2500); setTimeout(()=>growCelebrate(before,now.lvl),4800); if(fxEnabled()&&typeof QX!=="undefined"&&!reducedMotion()) QX.levelup();
    const t=el("div","toast mention"); const body=el("span","tbody"); body.append(el("div","ttitle",`⬆ Level ${now.lvl} · ${LEVEL_TITLES[Math.min(now.lvl-1,LEVEL_TITLES.length-1)]}`), el("div","ttext","Keep going, you're on a roll."));
    { const ic=el("span","sx-lock"); ic.append(pxIcon("goldkey",32,"")); t.append(ic,body); } $("toasts").prepend(t); setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },5000);
    if(navigator.vibrate) navigator.vibrate([30,40,30,40,120]);
  }); else if(amt>=15&&Date.now()-lastXpToast>4000){ lastXpToast=Date.now(); sfx("xp"); const f=el("div","xpfloat","+"+amt+" XP"); $("toasts").append(f); setTimeout(()=>f.remove(),1400); }
}
/* is an easter egg / screen effect playing right now? (the effects layer has something in it, or the confetti canvas is running) */
function effectsBusy(){
  const s=document.getElementById("sfx"), t=document.getElementById("fxText");
  return !!(s&&s.children.length) || !!(t&&t.children.length) || !!document.querySelector(".sxscene:not(.ambient):not(.out)") || (typeof FX!=="undefined"&&!!FX.busy?.());
}
/* run fn once the screen has been calm for a moment (gives up waiting after 20 seconds) */
function whenEffectsQuiet(fn){
  const start=Date.now(); let calm=0;
  const tick=()=>{ calm=effectsBusy()?0:calm+250; if(calm>=750||Date.now()-start>20000) fn(); else setTimeout(tick,250); };
  setTimeout(tick,250);
}
function paintXP(){
  const d=xpData(), L=xpLevel(d.xp), pct=Math.round(L.rem/L.need*100);
  $("xpLevel").textContent=`LV ${L.lvl}`; $("xpTitle").textContent=LEVEL_TITLES[Math.min(L.lvl-1,LEVEL_TITLES.length-1)];
  $("xpFill").style.width=pct+"%"; $("xpText").textContent=`${L.rem} / ${L.need} XP · ${d.xp.toLocaleString()} total`;
  const ways=[["secret",pxIconHtml("goldkey",16)+"find a secret",50],["gamewin","🏆 win a game",30],["daily","📅 open the app daily",20],["friend","🤝 add a friend",15],["qotd","❓ answer the question of the day",15],["poll","📊 start a poll",10],["theme","🎨 change your theme",10],["photo","📷 send a photo",6],["voice","🎤 voice message",6],["message","💬 send a message",2]];
  $("xpWays").innerHTML=ways.map(([k,label,v])=>`<span class="sx-chip${(d.log[k]||0)>0?" got":""}">${label} +${v}</span>`).join("");
}
function dailyXP(){ const key="nl-xpday-"+new Date().toDateString(); try{ if(LS.get(key)) return; LS.set(key,"1"); }catch(e){} setTimeout(()=>{ gainXP("daily"); pxfx("coins",{at:$("homeLevel"),scale:2}); },1500); }

/* ================= I AM KENOUGH ================= */
/* (moved to js/00-media.js) */
QX.kenough=function(){
  const layer=$("sfx"); const d=document.createElement("div"); d.className="ken-wrap";
  d.innerHTML=`<img class="ken-bg" src="${KEN_IMG}" alt=""><img class="ken-img" src="${KEN_IMG}" alt=""><div class="ken-text"><span>I am</span><b>Kenough.</b></div>`;
  layer.append(d); setTimeout(()=>d.classList.add("out"),4200); setTimeout(()=>d.remove(),5000);
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"kenough", name:"Kenough", re:/i'?m just ken([^a-z]|$)|i am ken(ough)?([^a-z]|$)|(^|[^a-z])kenough/i, play:()=>QX.kenough()}
);
Object.assign(HINTS,{kenough:"A plastic man in a mojo dojo casa house learns he's… enough."});

