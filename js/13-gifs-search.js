/* ================= GIF KEYBOARD (KLIPY first, GIPHY backup) =================
   KLIPY is what Discord moved to after Google shut down Tenor. With no KLIPY key (or if KLIPY is down), GIPHY answers. */


let gifTimer=null, gifLastQ=null;
function klipyCid(){   // an anonymous id per phone (KLIPY asks for one), never your NightLane account id
  let id=null; try{ id=LS.get("nl-gif-cid"); }catch(e){}
  if(!id){ id="nl-"+Math.random().toString(36).slice(2,12); try{ LS.set("nl-gif-cid",id); }catch(e){} }
  return id;
}
function klipyItem(it){   // KLIPY items carry files by size (hd/md/sm/xs) and format (gif/webp/mp4); read them defensively
  const f=it?.file||it?.files||{};
  const url=o=>typeof o==="string"?o:(o&&typeof o.url==="string"?o.url:null);
  const pick=(sizes)=>{ for(const z of sizes){ const o=f[z]; if(!o) continue; for(const fm of ["gif","webp"]){ const u=url(o[fm]); if(u&&/^https:\/\//.test(u)) return u; } } return null; };
  const small=pick(["sm","xs","md","hd"])||(/^https:\/\//.test(it?.src||"")?it.src:null);
  const big=pick(["md","sm","hd"])||small, banner=pick(["hd","md","sm"])||big;
  return small?{title:it.title||"",images:{fixed_height_small:{url:small},fixed_height:{url:big},banner:{url:banner}},via:"KLIPY"}:null;
}
async function fetchKlipy(q){
  const base=`https://api.klipy.com/api/v1/${encodeURIComponent(KLIPY_API_KEY)}/gifs/`, qs=`per_page=24&rating=pg-13&customer_id=${encodeURIComponent(klipyCid())}`;
  const r=await fetch(q?`${base}search?q=${encodeURIComponent(q)}&${qs}`:`${base}trending?${qs}`); if(!r.ok) throw new Error("klipy "+r.status);
  const d=await r.json(), list=d?.data?.data||(Array.isArray(d?.data)?d.data:[]);
  return list.map(klipyItem).filter(Boolean);
}
async function fetchGiphy(q){
  const u=q?`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=24&rating=pg-13`:`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=24&rating=pg-13`;
  const d=await (await fetch(u)).json();
  return (d.data||[]).map(g=>({title:g.title||"",images:{fixed_height_small:{url:g.images.fixed_height_small.url},fixed_height:{url:g.images.fixed_height.url},banner:{url:(g.images.downsized_medium||g.images.downsized||g.images.fixed_height).url}},via:"GIPHY"}));
}
async function fetchGifs(q){   // KLIPY first; GIPHY when there's no KLIPY key, KLIPY fails, or finds nothing
  if(KLIPY_API_KEY){ try{ const k=await fetchKlipy(q); if(k.length) return k; }catch(e){} }
  if(!GIPHY_API_KEY) return [];
  return fetchGiphy(q);
}
function paintGifGrid(grid,list,onPick,label){
  grid.innerHTML="";
  if(!list.length){ grid.innerHTML='<p class="note">No GIFs for that. Try another word.</p>'; return; }
  list.forEach(g=>{ const b=el("button","gifpick"); b.type="button"; b.setAttribute("aria-label",label+(g.title||"gif"));
    const i=document.createElement("img"); i.src=g.images.fixed_height_small.url; i.alt=g.title||""; i.loading="lazy"; b.append(i);
    b.onclick=()=>onPick(g); grid.append(b); });
  grid.append(el("p","note gifcredit","Powered by "+(list[0].via||"GIPHY")));
}
async function loadGifs(q){
  const grid=$("gifGrid");
  if(q===gifLastQ&&grid.children.length) return; gifLastQ=q;
  grid.innerHTML='<p class="note">Loading…</p>';
  try{ const list=await fetchGifs(q); if(gifLastQ!==q) return; paintGifGrid(grid,list,openGifPreview,"Send GIF: "); }
  catch(e){ grid.innerHTML='<p class="note">Couldn\'t reach the GIF search. Check your connection.</p>'; }
}
/* 🎞️ pick a GIF for your profile card banner (same search as chat) */
let gbTimer=null, gbLastQ=null;
async function loadBannerGifs(q){
  const grid=$("gbGrid"); if(q===gbLastQ&&grid.children.length) return; gbLastQ=q;
  grid.innerHTML='<p class="note">Loading…</p>';
  try{ const list=await fetchGifs(q); if(gbLastQ!==q) return;
    paintGifGrid(grid,list,g=>{ draftCard={...draftCard,banner:"img",img:g.images.banner?.url||g.images.fixed_height.url}; show($("gifBannerSheet"),false); paintCardSheet(); say("cardMsg","🎞️ GIF banner picked. Hit Save card."); },"Use as banner: "); }
  catch(e){ grid.innerHTML='<p class="note">Couldn\'t reach the GIF search. Check your connection.</p>'; }
}
function openBannerGifs(){ gbLastQ=null; $("gbSearch").value=""; show($("gifBannerSheet")); loadBannerGifs(""); setTimeout(()=>$("gbSearch").focus({preventScroll:true}),80); }
$("gbSearch").addEventListener("input",e=>{ clearTimeout(gbTimer); gbTimer=setTimeout(()=>loadBannerGifs(e.target.value.trim()),350); });
$("gbClose").onclick=()=>show($("gifBannerSheet"),false);
$("gifBannerSheet").addEventListener("click",e=>{ if(e.target.id==="gifBannerSheet") show($("gifBannerSheet"),false); });
/* tap a GIF → see it big, add a message if you want, then send */
let gifPicked=null;
function openGifPreview(g){
  gifPicked=g; say("gifPrevMsg",""); $("gifCaption").value="";
  const i=$("gifPrevImg"); i.src=g.images.fixed_height_small.url; i.alt=g.title||"GIF";
  const big=new Image(); big.onload=()=>{ if(gifPicked===g) i.src=big.src; }; big.src=g.images.fixed_height.url;   // small one shows instantly, the sharp one swaps in
  show($("gifPreview")); setTimeout(()=>$("gifCaption").focus({preventScroll:true}),80);
}
$("gifPrevBack").onclick=()=>{ show($("gifPreview"),false); gifPicked=null; };
$("gifPreview").addEventListener("click",e=>{ if(e.target.id==="gifPreview"){ show($("gifPreview"),false); gifPicked=null; } });
$("gifCaption").addEventListener("keydown",e=>{ if(e.key==="Escape"){ e.stopPropagation(); show($("gifPreview"),false); gifPicked=null; } });
$("gifPrevForm").addEventListener("submit",async e=>{
  e.preventDefault(); const g=gifPicked; if(!g) return;
  const text=$("gifCaption").value.trim()||null;
  $("gifPrevSend").disabled=true; say("gifPrevMsg","Sending…");
  try{ await sendFields({kind:"image",image_url:g.images.fixed_height.url,text}); show($("gifPreview"),false); closeTray(); gifPicked=null; say("gifPrevMsg",""); }
  catch(err){ say("gifPrevMsg","GIF didn't send: "+err.message,true); }
  finally{ $("gifPrevSend").disabled=false; }
});
$("gifSearch").addEventListener("input",e=>{ clearTimeout(gifTimer); gifTimer=setTimeout(()=>loadGifs(e.target.value.trim()),350); });
$("trayGifs").onclick=()=>{ trayTab("gifs"); loadGifs($("gifSearch").value.trim()); setTimeout(()=>$("gifSearch").focus(),50); };

/* little die icons for the roll chips under messages (a real d20 for d20s, not a six-sided 🎲) */
/* (moved to js/00-media.js) */
function dchipIcon(chip,kind){ const u=DICE_ICON[kind]; if(!u) return; const i=document.createElement("img"); i.className="dchipic"; i.src=u; i.alt=""; chip.prepend(i); }
/* ================= PIXEL DICE =================
   Dice art by LullabyJazz (credited in Credits), recolored for NightLane; the d6 pips feed Liar's Dice. */
/* (moved to js/00-media.js) */

function paintDiceSkins(){
  const box=$("ldSkins"); if(!box) return; box.innerHTML=""; const cur=diceSkinOf(user.id);
  DICE_SKINS.forEach(([id,label])=>{ const b=el("button","ld-skin"); b.type="button"; b.setAttribute("role","radio"); b.setAttribute("aria-checked",String(id===cur));
    b.append(dieEl(5,{skin:id}),el("span","",label)); b.onclick=()=>pickDiceSkin(id); box.append(b); });
}
async function pickDiceSkin(id){
  const before=meProfile?.theme||{}, theme={...before}; if(id==="nightlane") delete theme.dice; else theme.dice=id;
  meProfile={...meProfile,theme}; cache.set(user.id,meProfile); paintDiceSkins(); const g=gamesById.get(openGameId); if(g?.type==="liarsdice") paintDice(g);
  try{ await api.saveStyle(user.id,{theme}); say("ldLookMsg","Saved. Everyone sees your dice like this."); }
  catch(err){ meProfile={...meProfile,theme:before}; cache.set(user.id,meProfile); paintDiceSkins(); if(g?.type==="liarsdice") paintDice(g); say("ldLookMsg","Couldn't save: "+err.message,true); }
}
document.addEventListener("toggle",e=>{ if(e.target?.id==="ldLook"&&e.target.open) paintDiceSkins(); },true);
function diceKind(n){ return n===100?"d100":DICE_ART["d"+n]?"d"+n:null; }
function dieFaceFor(kind,v){ if(kind==="d10") return v%10; if(kind==="d100") return Math.floor((v%100)/10)*10%100; return v; }
function setDieFace(sp,kind,v){ const a=DICE_ART[kind], sc=+sp.dataset.sc||1, i=Math.max(0,a.faces.indexOf(dieFaceFor(kind,v))); sp.style.backgroundPosition=`${-i*a.w*sc}px 0`; }
function diceSprite(kind,v,sc){ const a=DICE_ART[kind], s=el("span","pxdie pxdie-"+kind); s.dataset.sc=sc;
  s.style.width=a.w*sc+"px"; s.style.height=a.h*sc+"px"; s.style.backgroundImage=`url(${a.url})`; s.style.backgroundSize=`${a.w*a.faces.length*sc}px ${a.h*sc}px`; setDieFace(s,kind,v); return s; }
/* one shared roll scene for the pixel dice: tumbles in, flickers through faces, lands on the result */
function pxRoll(n,r,caption,big){
  const layer=$("sfx"), kind=diceKind(n), d=el("div","sx-d20 pxroll");
  const target=Math.min(innerWidth*.44,big?180:150), base=DICE_ART[kind==="d100"?"d10":kind];
  const sc=Math.max(2,Math.floor(target/(base.w*(n===100?2:1)))||2);
  const dice=n===100?[[diceSprite("d100",10,sc),"d100"],[diceSprite("d10",1,sc),"d10"]]:[[diceSprite(kind,1,sc),kind]];
  dice.forEach(([s])=>d.append(s)); d.append(el("small","dn-label","d"+n)); layer.append(d);
  let spins=0; const iv=setInterval(()=>{ dice.forEach(([s,k])=>setDieFace(s,k,k==="d100"?10*Math.floor(Math.random()*10):1+Math.floor(Math.random()*(k==="d10"?10:+k.slice(1)))));
    if(++spins>14){ clearInterval(iv); dice.forEach(([s,k])=>setDieFace(s,k,r)); d.classList.add("landed"); caption(layer); } },70);
  setTimeout(()=>d.remove(),2900);
}
/* ================= MORE DICE ================= */
function diceIn(text){ const m=(text||"").match(/(^|[^a-z])roll(?:s|ed|ing)? (?:a |the |me a |an )?d(1|2|3|4|6|8|10|12|100)(?![0-9])/i); return m?+m[2]:null; }
function dNFor(m,n){ let h=2166136261; for(const ch of "d"+n+"|"+String(m?.id)+"|"+(m?.created_at||"")){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619)>>>0; } return (h%n)+1; }
const DICE_SHAPES={1:"circle",2:"coin",3:"triangle",4:"triangle",6:"square",8:"diamond",10:"kite",12:"pentagon",100:"circle"};
QX.diceN=function(m,n){
  const layer=$("sfx"), r=dNFor(m,n), shape=DICE_SHAPES[n]||"hex";
  if(diceKind(n)){ pxRoll(n,r,lay=>{ const cap=el("div","sx-caption sx-dcap", r===n?`MAX ROLL! 🎉`: r===1?"ouch, a 1":`rolled a ${r}`); lay.append(cap);
    if(r===n&&n>=6&&typeof FX!=="undefined") FX.play("confetti"); setTimeout(()=>cap.remove(),1800); }); return; }
  const d=document.createElement("div"); d.className="sx-d20 dn-"+shape; d.innerHTML=`<div class="dn-face"></div><b class="sx-dnum">?</b><small class="dn-label">d${n}</small>`; layer.append(d);
  const num=d.querySelector(".sx-dnum"); let spins=0;
  const iv=setInterval(()=>{ num.textContent=1+Math.floor(Math.random()*n); if(++spins>14){ clearInterval(iv); num.textContent=r; d.classList.add("landed");
    const cap=el("div","sx-caption sx-dcap", n===1?"…it's a d1. It's always 1. 🙃": n===2?(r===1?"HEADS":"TAILS"): r===n?`MAX ROLL! 🎉`: r===1?"ouch, a 1":`rolled a ${r}`); layer.append(cap);
    if(r===n&&n>=6&&typeof FX!=="undefined") FX.play("confetti"); setTimeout(()=>cap.remove(),1800); } },70);
  setTimeout(()=>d.remove(),2900);
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"dice", name:"Dice bag", re:/(^|[^a-z])roll(s|ed|ing)? (a |the |me a |an )?d(1|2|3|4|6|8|10|12|100)(?![0-9])/i, play:m=>QX.diceN(m,diceIn(m.text))}
);
Object.assign(HINTS,{dice:"There's more than one die in the bag: try a d6, a d100, even a d1."});

/* ================= PACK 10 SECRETS ================= */
QX.scaryMovie=function(){
  const layer=$("sfx"); const d=document.createElement("div"); d.className="px-call gf-call";
  d.innerHTML=`<div class="gf-mask"><svg viewBox="0 0 100 130"><path d="M50 4 C82 4 96 40 92 80 C88 112 70 126 50 126 C30 126 12 112 8 80 C4 40 18 4 50 4Z" fill="#f4f4f8" stroke="#07041A" stroke-width="3"/><path d="M28 44 C30 34 44 36 42 50 C40 60 30 58 28 44Z M72 44 C70 34 56 36 58 50 C60 60 70 58 72 44Z" fill="#07041A"/><path d="M50 60 L45 78 L55 78Z" fill="#07041A"/><path d="M50 84 C40 86 34 100 38 116 C46 120 54 120 62 116 C66 100 60 86 50 84Z" fill="#07041A"/></svg></div><div class="px-caller">📞 UNKNOWN</div><div class="gf-line">"What's your favorite scary movie?"</div><div class="px-callbtns"><span>✕</span><span>✆</span></div>`;
  layer.append(d); if(navigator.vibrate) navigator.vibrate([400,200,400,200,600]);
  setTimeout(()=>{ d.querySelector(".gf-line").textContent="…they hung up."; d.classList.add("ended"); },3200); setTimeout(()=>d.remove(),4300);
};
QX.potOfGreed=function(){
  const layer=$("sfx"); const d=document.createElement("div"); d.className="pg-wrap";
  d.innerHTML=`<div class="pg-card"><div class="pg-back"><span>✦</span></div><div class="pg-front"><div class="pg-name">JAR OF PLENTY</div><div class="pg-art"><svg viewBox="0 0 100 100"><path d="M34 34 Q24 36 26 50 L30 82 Q32 92 50 92 Q68 92 70 82 L74 50 Q76 36 66 34Z" fill="#d9a441" stroke="#07041A" stroke-width="4"/><rect x="34" y="24" width="32" height="12" rx="3" fill="#b07a2a" stroke="#07041A" stroke-width="4"/><path d="M30 58 Q50 66 70 58" fill="none" stroke="#07041A" stroke-width="3"/><path d="M50 8 L53 16 L61 16 L55 21 L57 29 L50 24 L43 29 L45 21 L39 16 L47 16Z" fill="#fff6c8" stroke="#07041A" stroke-width="2"/><circle cx="30" cy="16" r="3" fill="#fff6c8"/><circle cx="72" cy="12" r="2.5" fill="#fff6c8"/><circle cx="50" cy="74" r="7" fill="#fff6c8" stroke="#07041A" stroke-width="3"/></svg></div><div class="pg-type">✦ LUCKY CARD ✦</div><div class="pg-text">Draw 2 cards.</div></div></div><div class="sx-caption pg-cap">"Draw your last pathetic card!"</div>`;
  layer.append(d); setTimeout(()=>d.classList.add("flip"),900); setTimeout(()=>{ d.querySelector(".pg-cap").textContent="…what does it do again? 🤔"; },2400); setTimeout(()=>d.remove(),4600);
};
QX.yugioh=function(){
  const layer=$("sfx"); const d=document.createElement("div"); d.className="yg-wrap";
  d.innerHTML=`<div class="yg-rays"></div><div class="yg-eye"><svg viewBox="0 0 120 60"><path d="M4 30 Q60 -10 116 30 Q60 70 4 30Z" fill="none" stroke="#ffd84a" stroke-width="5"/><circle cx="60" cy="30" r="14" fill="#ffd84a"/><circle cx="60" cy="30" r="6" fill="#07041A"/><path d="M60 46 L56 60 M60 46 L70 58" stroke="#ffd84a" stroke-width="4"/></svg></div><div class="yg-glyphs">${["☥","▲","☉","◈","✦","⊙","☥","◬","▲","✧","☉","◈"].map((g,i)=>`<i style="left:${6+(i%6)*16}%;top:${i<6?12:78}%;animation-delay:${i*.12}s">${g}</i>`).join("")}</div><div class="sx-caption yg-cap">IT'S TIME TO D-D-D-DUEL</div>`;
  layer.append(d); setTimeout(()=>d.remove(),4200);
};
QX.console=function(kind){
  const layer=$("sfx"); const blue=kind==="ps"; const d=document.createElement("div"); d.className="cs-wrap "+(blue?"cs-blue":"cs-green");
  d.innerHTML=`<div class="cs-glow"></div><div class="cs-logo">${blue?'<svg viewBox="0 0 120 40"><rect x="4" y="12" width="112" height="16" fill="none" stroke="#fff" stroke-width="3"/><rect x="52" y="4" width="16" height="32" fill="#fff"/></svg>':'<svg viewBox="0 0 80 50"><path d="M18 10 H62 Q76 10 78 28 Q80 46 68 46 Q60 46 54 36 H26 Q20 46 12 46 Q0 46 2 28 Q4 10 18 10Z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><path d="M20 22 V32 M15 27 H25" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="56" cy="23" r="3.5" fill="#fff"/><circle cx="63" cy="30" r="3.5" fill="#fff"/></svg>'}</div><div class="cs-text">${blue?"powering on…":"powering on…"}</div>`;
  layer.append(d);
  try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); const o=ac.createOscillator(), g=ac.createGain(); o.type="sine"; o.frequency.setValueAtTime(blue?180:220,ac.currentTime); o.frequency.exponentialRampToValueAtTime(blue?740:660,ac.currentTime+.9); g.gain.setValueAtTime(.0001,ac.currentTime); g.gain.exponentialRampToValueAtTime(.06,ac.currentTime+.2); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+1.6); o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+1.7); }catch(e){}
  setTimeout(()=>d.remove(),3600);
};
QX.shotFirst=function(){
  const layer=$("sfx"); const d=document.createElement("div"); d.className="sf-wrap";
  d.innerHTML=`<div class="sf-man"><svg viewBox="0 0 120 200"><g class="sf-body"><circle cx="60" cy="30" r="18" fill="#07041A"/><path d="M40 52 L80 52 L86 120 L34 120Z" fill="#07041A"/><path d="M38 125 L50 195 L60 195 L60 130 L60 195 L70 195 L82 125Z" fill="#07041A"/><g class="sf-arm"><path d="M78 62 L118 70 L118 80 L80 78Z" fill="#07041A"/><rect x="112" y="64" width="12" height="8" fill="#07041A"/></g></g></svg></div><div class="sf-flash"></div><div class="sx-caption sf-cap">who shot first?</div>`;
  layer.append(d);
  setTimeout(()=>{ d.classList.add("bang"); if(navigator.vibrate) navigator.vibrate(80); },1200);
  setTimeout(()=>{ d.classList.add("down"); d.querySelector(".sf-cap").textContent="…you did. 🤠"; },1500);
  setTimeout(()=>d.remove(),4200);
};
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"scarymovie", name:"Scary movie", re:/favou?rite scary movie/i, play:()=>QX.scaryMovie()},
  {id:"potofgreed", name:"Pot of Greed", re:/last pathetic card|pot of greed/i, play:()=>QX.potOfGreed()},
  {id:"yugioh", name:"Yu-Gi-Oh!", re:/yu-?gi-?oh|d-d-d-duel|heart of the cards/i, play:()=>QX.yugioh()},
  {id:"ps5", name:"PlayStation", re:/(^|[^a-z])ps ?5([^a-z0-9]|$)|playstation/i, play:()=>QX.console("ps")},
  {id:"xbox", name:"Xbox", re:/(^|[^a-z])x-?box([^a-z]|$)/i, play:()=>QX.console("xb")},
  {id:"shotfirst", name:"Who shot first", re:/who shot first/i, play:()=>QX.shotFirst()}
);
Object.assign(HINTS,{
  scarymovie:"Answer the phone. The voice wants to know your favorite kind of film.",
  potofgreed:"Taunt your opponent to draw their final, pitiful card. Everyone knows what the green pot does. Nobody remembers.",
  yugioh:"It's time to d-d-d-…",
  ps5:"Sony's fifth console. Say it and the room turns blue.",
  xbox:"Microsoft's console. Say it and the room turns green.",
  shotfirst:"A cantina argument that's lasted decades. Ask the question.",
});

/* ================= UNLOCKABLES ================= */
const UNLOCKS=[
  {id:"frame:guts",     type:"frame", label:"Blazing frame",        by:{stat:"guts",stat_n:12}},
  {id:"frame:bonded",   type:"frame", label:"Lovers frame 💞",       by:{linkRank:5}},
  {id:"frame:crew",     type:"frame", label:"Ride or Die frame 🤜🤛", by:{linkRank:5}},
  {id:"theme:phantom",  type:"theme", label:"🎭 Phantom theme",     by:{secret:"konami"}},
  {id:"theme:pipboy",   type:"theme", label:"☢️ Wasteland theme",   by:{secret:"pipboy"}},
  {id:"theme:mochi",    type:"theme", label:"🍡 Mochi theme",       by:{secret:"uwa"}},
  {id:"theme:redrum",   type:"theme", label:"🩸 Redrum theme",      by:{secret:"redrum"}},
  {id:"theme:lab",      type:"theme", label:"⚗️ Future Gadget Lab", by:{secret:"elpsy"}},
  {id:"theme:divergence",type:"theme", label:"⚙️ Divergence theme",  by:{secret:"steinsgate"}},
  {id:"theme:tvworld",  type:"theme", label:"📺 TV World theme",    by:{secret:"shadow"}},
  {id:"theme:plumber",  type:"theme", label:"🍄 Plumber theme",     by:{secret:"letsago"}},
  {id:"theme:grandline",type:"theme", label:"🏴‍☠️ Grand Line theme", by:{secret:"onepiece"}},
  {id:"theme:gold",     type:"theme", label:"👑 Gold theme",        by:{level:8}},
  {id:"bg:burning",     type:"bg",    label:"🔥 Burning City background", by:{secret:"cityburn"}},
  {id:"bg:darkhour",    type:"bg",    label:"🌑 Dark Hour background",    by:{secret:"darkhour"}},
  {id:"bg:wasteland",   type:"bg",    label:"☢️ Wasteland background",    by:{secret:"war"}},
  {id:"bg:warp",        type:"bg",    label:"🚀 Hyperspace background",   by:{secret:"hyperspace"}},
  {id:"bg:matrix",      type:"bg",    label:"🟢 Code Rain background",    by:{secret:"matrix"}},
  {id:"bg:sakura",      type:"bg",    label:"🌸 Sakura background",       by:{secret:"yuri"}},
  {id:"bg:lava",        type:"bg",    label:"🌋 Lava background",         by:{secret:"gigadrill"}},
  {id:"bg:cafe",        type:"bg",    label:"☕ Café background",         by:{secret:"writer"}},
  {id:"sticker:nightowl",type:"sticker", label:"🦉 Night owl sticker",  by:{secret:"moonwink"}},
  {id:"sticker:dragon", type:"sticker", label:"🐉 Dragon sticker",      by:{secret:"dragon"}},
  {id:"sticker:nat20",  type:"sticker", label:"🎲 NAT 20 sticker",      by:{secret:"d20"}},
  {id:"sticker:preem",  type:"sticker", label:"✨ PREEM sticker",       by:{secret:"preem"}},
  {id:"sticker:pog",    type:"sticker", label:"😮 POG sticker",         by:{secret:"pog"}},
  {id:"sticker:nani",   type:"sticker", label:"❗ NANI?! sticker",      by:{secret:"nani"}},
  {id:"sticker:redrum", type:"sticker", label:"🩸 REDRUM sticker",      by:{secret:"redrum"}},
  {id:"sticker:blunt",   type:"sticker", label:"🌿 Blunt sticker",      by:{secret:"xen"}},
  {id:"sticker:showtime",type:"sticker",label:"🎭 SHOWTIME sticker",   by:{secret:"showtime"}},
  {id:"frame:neon",     type:"frame", label:"Neon ring frame",       by:{level:3}},
  {id:"frame:glitch",   type:"frame", label:"Glitch frame",          by:{secret:"netrunner"}},
  {id:"frame:flame",    type:"frame", label:"Flame frame",           by:{secret:"cityburn"}},
  {id:"frame:phantom",  type:"frame", label:"Phantom frame",         by:{secret:"konami"}},
  {id:"frame:pixel",    type:"frame", label:"Pixel frame",           by:{secret:"gameover"}},
  {id:"frame:gold",     type:"frame", label:"Gold crown frame",      by:{level:6}},
  {id:"frame:mythic",   type:"frame", label:"Mythic rainbow frame",  by:{level:11}},
  {id:"frame:circuit",  type:"frame", label:"Circuit frame",         by:{level:4}},
  {id:"frame:frost",    type:"frame", label:"Frost frame",           by:{level:5}},
  {id:"frame:thunder",  type:"frame", label:"Thunder frame",         by:{level:8}},
  {id:"frame:galaxy",   type:"frame", label:"Galaxy frame",          by:{level:14}},
  {id:"frame:sakura",   type:"frame", label:"Sakura frame",          by:{secret:"yuri"}},
  {id:"frame:spiral",   type:"frame", label:"Spiral frame",          by:{secret:"gigadrill"}},
  {id:"frame:shadow",   type:"frame", label:"Shadow frame",          by:{secret:"johnny"}},
  {id:"frame:heartbeat",type:"frame", label:"Heartbeat frame",       by:{linkRank:8}},
  {id:"frame:quill",    type:"frame", label:"Ink & quill frame 🪶",   by:{secrets:["solemnly","mischief"],n:2}},
  {id:"frame:shark",    type:"frame", label:"Shark frame 🦈",        by:{secrets:["jawstheme","biggerboat","amity","smileyou"],n:2}},
  {id:"frame:verse",    type:"frame", label:"Multiverse frame 🕸️",   by:{secrets:["mask","canon"],n:2}},
];
const FRAMES={neon:"Neon ring",glitch:"Glitch",flame:"Flame",phantom:"Phantom",pixel:"Pixel",gold:"Gold crown",mythic:"Mythic",guts:"Blazing",bonded:"Lovers 💞",crew:"Ride or Die 🤜🤛",creator:"Creator 👑",circuit:"Circuit",frost:"Frost",thunder:"Thunder",galaxy:"Galaxy",sakura:"Sakura",spiral:"Spiral",shadow:"Shadow",heartbeat:"Heartbeat",shark:"Shark 🦈",quill:"Ink & quill 🪶",verse:"Multiverse 🕸️"};
const myLevel=()=>xpLevel(xpData().xp).lvl;
function unlockMet(u){ return u.by.secrets?u.by.secrets.filter(hasSecret).length>=(u.by.n||u.by.secrets.length):u.by.secret?hasSecret(u.by.secret):u.by.level?myLevel()>=u.by.level:u.by.stat?statCount(u.by.stat)>=u.by.stat_n:u.by.linkRank?[...socialLinks.values()].some(r=>rankFromXp(r.xp).rank>=u.by.linkRank):true; }
const unlockOk=(type,key)=>{ const u=UNLOCKS.find(x=>x.id===type+":"+key); return !u||unlockMet(u); };
const UNLOCK_KEY="nl-unlocked";
const seenUnlocks=()=>{ try{ return JSON.parse(LS.get(UNLOCK_KEY)||"[]"); }catch(e){ return []; } };
function checkUnlocks(){
  const seen=seenUnlocks(); const fresh=UNLOCKS.filter(u=>unlockMet(u)&&!seen.includes(u.id));
  if(!fresh.length) return;
  try{ LS.set(UNLOCK_KEY,JSON.stringify([...seen,...fresh.map(u=>u.id)])); }catch(e){} progressChanged();
  if(seen.length===0&&fresh.length>2) return;            // first run: don't spam
  fresh.forEach((u,i)=>setTimeout(()=>{
    const where={theme:"Theme & colors",bg:"Room → Chat background",sticker:"the sticker tray",frame:"Theme & colors → Frame"}[u.type];
    const t=el("button","toast mention"); t.type="button"; const body=el("span","tbody");
    body.append(el("div","ttitle","🎁 Unlocked!"), el("div","ttext",`${u.label} · find it in ${where}`));
    { const ic=el("span","sx-lock"); ic.append(pxIcon({theme:"potion",frame:"ring",bg:"gem",sticker:"scroll"}[u.type]||"goldkey",32,"")); t.append(ic,body); } t.onclick=()=>{ t.remove(); if(u.type==="theme"||u.type==="frame"){ openProfile(); $("openTheme").click(); } else openProfile(); };
    $("toasts").prepend(t); setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },6000);
    if(navigator.vibrate) navigator.vibrate([20,40,20]);
  },1800+i*900));
  if($("stickerGrid").children.length) $("stickerGrid").innerHTML="";
  if(!$("profile").classList.contains("hidden")) paintUnlocks();
}
function paintUnlocks(){
  const box=$("unlockList"); box.innerHTML="";
  const got=UNLOCKS.filter(unlockMet).length; $("unlockSummary").textContent=`🎁 Unlockables: ${got}/${UNLOCKS.length}`;
  const groups={theme:"Themes",frame:"Profile frames",bg:"Chat backgrounds",sticker:"Stickers"};
  Object.entries(groups).forEach(([type,title])=>{
    const h=el("div","unlockgroup"); h.append(pxIcon({theme:"potion",frame:"ring",bg:"gem",sticker:"scroll"}[type],16,""),title); box.append(h);
    UNLOCKS.filter(u=>u.type===type).forEach(u=>{ const ok=unlockMet(u); const chip=el("span","sx-chip"+(ok?" got":""), ok?u.label:(u.by.level?`reach level ${u.by.level}`:u.by.secrets?`${u.by.secrets.filter(hasSecret).length}/${u.by.n||u.by.secrets.length} 🦈 secrets`:"???")); if(!ok) chip.prepend(pxIcon("key",16,"locked")); if(!ok&&(u.by.secret||u.by.secrets)) chip.title="Find a secret to unlock"; box.append(chip); });
  });
}
/* frames: everyone sees them (saved inside your profile theme) */
function frameOf(p){ const f=p?.theme?.frame; return f&&FRAMES[f]?f:null; }
const _paintFace=paintFace;
paintFace=function(node,p){ _paintFace(node,p); [...node.classList].filter(c=>c.startsWith("frame-")).forEach(c=>node.classList.remove(c)); node.querySelector(":scope > .frx")?.remove();
  const f=frameOf(p); if(f){ node.classList.add("frame-"+f); const x=document.createElement("span"); x.className="frx"; x.setAttribute("aria-hidden","true"); if(f==="creator") creatorBits(x); node.append(x); } };
function creatorBits(x){ ["🗡️","🎲","🎬","🚀"].forEach((e,i)=>x.append(el("i","cr c"+i,e))); x.append(el("span","crtag","★ CREATOR")); }
function paintFrameRow(){
  const row=$("frameRow"); row.innerHTML="";
  const cur=draftTheme.frame||"";
  const none=el("button","framepick"+(cur===""?" on":"")); none.type="button";
  const nf=el("span","face"); nf.append(el("span","fi","★")); none.append(nf,el("span","framelabel","None"));
  none.onclick=()=>{ draftTheme={...draftTheme,frame:null}; paintThemeSheet(); }; row.append(none);
  Object.entries(FRAMES).forEach(([id,label])=>{ if(!unlockOk("frame",id)) return; if(id==="creator"&&!isAdmin&&cur!=="creator") return; /* only the app's creator can pick this one */ const b=el("button","framepick"+(cur===id?" on":"")); b.type="button";
    const f=el("span","face frame-"+id); f.append(el("span","fi","★")); if(id==="creator"){ const x=el("span","frx"); creatorBits(x); f.append(x); } b.append(f,el("span","framelabel",label));
    b.onclick=()=>{ draftTheme={...draftTheme,frame:id}; paintThemeSheet(); }; row.append(b); });
  const pf=$("themePreviewFace"); [...pf.classList].filter(c=>c.startsWith("frame-")).forEach(c=>pf.classList.remove(c)); if(draftTheme.frame&&FRAMES[draftTheme.frame]) pf.classList.add("frame-"+draftTheme.frame);
  paintStatusRow();
}
const STATUS_SHAPES=[["dot","Dot"],["star","Star"],["diamond","Diamond"],["heart","Heart"],["ring","Ring"],["moon","Moon"],["square","Square"],["triangle","Triangle"],["bolt","Bolt"],["sparkle","Sparkle"],["plus","Plus"],["pulse","Pulse"]];
function paintStatusRow(){
  const row=$("statusRow"); if(!row) return; row.innerHTML="";
  const cur=draftTheme.statusShape||"dot";
  STATUS_SHAPES.forEach(([id,label])=>{
    const b=el("button","statuspick"+(cur===id?" on":"")); b.type="button"; b.dataset.shape=id;
    b.append(el("i",""),el("span","",label));
    b.onclick=()=>{ draftTheme={...draftTheme,statusShape:id}; paintThemeSheet(); };
    row.append(b);
  });
}

/* ================= SEARCH ================= */
let searchTimer=null;
function openSearch(scope){ $("searchScope").textContent=scope==="room"?`in ${roomName||"# "+room}`:"all your chats"; $("searchSheet").dataset.scope=scope; $("searchBox").value=""; $("searchResults").innerHTML='<p class="note">Type a word to search.</p>'; show($("searchSheet")); setTimeout(()=>$("searchBox").focus(),60); }
$("searchBtn").onclick=()=>openSearch("room"); $("searchAll").onclick=()=>openSearch("all"); $("searchClose").onclick=()=>show($("searchSheet"),false);
$("searchBox").addEventListener("input",()=>{ clearTimeout(searchTimer); searchTimer=setTimeout(runSearch,300); });
async function runSearch(){
  const q=$("searchBox").value.trim(), box=$("searchResults"); if(q.length<2){ box.innerHTML='<p class="note">Type at least 2 letters.</p>'; return; }
  box.innerHTML='<p class="note">Searching…</p>';
  try{
    const scope=$("searchSheet").dataset.scope, rows=await api.search(q,scope==="room"?room:null);
    await ensureProfiles(rows.map(r=>r.user_id));
    box.innerHTML=""; if(!rows.length){ box.append(el("p","note",`Nothing found for “${q}”.`)); return; }
    rows.forEach(r=>{
      const b=el("button","srow"); b.type="button";
      const f=el("span","face"); paintFace(f,cache.get(r.user_id));
      const info=el("span","info"); const head=el("div","srhead"); head.append(el("b","",nameOf(r.user_id)),el("span","",` · ${r.room_name||"#"+r.room} · ${shortWhen(r.created_at)}`));
      const snip=el("div","srsnip"); highlightSnippet(snip,previewOf(r)||"",q); info.append(head,snip);
      b.append(f,info); b.onclick=()=>jumpToMessage(r.room,r.id); box.append(b);
    });
  }catch(err){ box.innerHTML=""; box.append(el("p","msgline bad","Search isn't set up yet: run the search SQL update.")); }
}
function highlightSnippet(node,text,q){
  const i=text.toLowerCase().indexOf(q.toLowerCase()); const start=Math.max(0,i-40), s=(start?"…":"")+text.slice(start,start+140)+(text.length>start+140?"…":"");
  const j=s.toLowerCase().indexOf(q.toLowerCase()); if(j<0){ node.textContent=s; return; }
  node.append(s.slice(0,j), el("mark","",s.slice(j,j+q.length)), s.slice(j+q.length));
}
async function jumpToMessage(code,id){
  show($("searchSheet"),false);
  if(room!==code){ await enterRoom(code); }
  let tries=0; while(!elById.has(id)&&hasMore&&tries++<8) await loadOlder();
  if(elById.has(id)) jumpTo(id); else $("status").textContent="That message is too far back to load here.";
}

/* ================= PRESENCE ================= */
const online=new Map();   // user id -> {room, typing, at, dnd, idle}
let presenceCh=null, presenceTimer=null, idleTimer=null;
const IDLE_AFTER_MS=2*60000;   // 2 minutes with no touch/click/key (or the app in the background) = away: friends see you as offline
let lastActivityAt=Date.now();
const dndOn=()=>{ try{ return LS.get("nl-dnd")==="1"; }catch(e){ return false; } };
function setDND(on){ try{ LS.set("nl-dnd",on?"1":"0"); }catch(e){} pushPresence(); }
function markActive(){ lastActivityAt=Date.now(); if(document.hidden) return; if(online.get(user?.id)?.idle) pushPresence(); }
["pointerdown","keydown","touchstart","wheel","input","compositionupdate"].forEach(ev=>addEventListener(ev,markActive,{passive:true}));   // "input": phone keyboards don't always send key presses
const typingNow=()=>!!(room&&document.activeElement===$("box")&&$("box").value.trim());
const computeIdle=()=>document.hidden||(!typingNow()&&Date.now()-lastActivityAt>IDLE_AFTER_MS);
let hiddenAt=0; document.addEventListener("visibilitychange",()=>{ if(document.hidden) hiddenAt=Date.now(); });
const awaySince=()=>Math.min(lastActivityAt, document.hidden&&hiddenAt?hiddenAt:Infinity);   // when you actually stopped using NightLane
const myPresence=()=>{ const idle=computeIdle(); return {at:Date.now(),room:room||null,typing:!!(room&&$("box").value.trim()),dnd:dndOn(),idle,idleSince:idle?awaySince():null}; };
function pushPresence(){ if(presenceCh) presenceCh.track(myPresence()).catch(()=>{}); }
/* Online status. If the connection errors out or closes (network switch, screen lock, Android pausing the
   app, an expired login), it used to stay dead silently: you'd look offline to everyone while your own dot
   still showed. Now it heals itself: retries on errors, checks its health every 20s and whenever you come
   back to the app, and re-announces you every minute in case the server forgot. */
let presenceStatus="off", presenceRetry=null, presenceTicks=0, presenceFails=0, presenceListening=false;
function presenceHealthy(){ let up=true; try{ up=sb.realtime.isConnected(); }catch(e){} return !!presenceCh&&presenceCh.state==="joined"&&up; }   // the channel can say "joined" while the connection under it is gone
function schedulePresenceRestart(ms){ clearTimeout(presenceRetry); presenceRetry=setTimeout(restartPresence,ms); }
async function restartPresence(){
  if(!sb||!user||offlineMode||navigator.onLine===false) return;
  try{ const {data}=await sb.auth.getSession(); if(data?.session?.access_token) sb.realtime.setAuth(data.session.access_token); }catch(e){}
  if(presenceCh){ const old=presenceCh; presenceCh=null; try{ sb.removeChannel(old).catch(()=>{}); }catch(e){} }   // don't wait on a dead connection to say goodbye
  startPresence();
}
function startPresence(){
  if(!sb||!user||presenceCh) return;
  const ch=presenceCh=sb.channel("presence:all",{config:{presence:{key:user.id}}});
  ch.on("presence",{event:"sync"},()=>{ if(ch!==presenceCh) return; online.clear(); Object.entries(ch.presenceState()).forEach(([id,arr])=>online.set(id,arr[arr.length-1]||{})); paintPresence(); paintPresenceDiag(); })
    .subscribe(async (st)=>{
      if(ch!==presenceCh) return;
      presenceStatus=st;
      if(st==="SUBSCRIBED"){ presenceFails=0; await ch.track(myPresence()).catch(()=>{}); }
      else if(st==="CHANNEL_ERROR"||st==="TIMED_OUT"||st==="CLOSED"){ presenceFails++; schedulePresenceRestart(Math.min(30000,2000*presenceFails)); }
      paintPresenceDiag();
    });
  const touch=()=>{ if(!document.hidden) api.touchSeen().catch(()=>{}); };
  touch(); clearInterval(presenceTimer); presenceTimer=setInterval(touch,90000);
  clearInterval(idleTimer); idleTimer=setInterval(()=>{
    if(!presenceHealthy()&&!document.hidden&&presenceCh&&(presenceCh.state!=="joining"||!sb.realtime.isConnected())) schedulePresenceRestart(0);
    else if(presenceHealthy()&&++presenceTicks%3===0) pushPresence();   // re-announce about once a minute
    const now=computeIdle(); if(!!online.get(user?.id)?.idle!==now) pushPresence();
    paintPresence();   // belt-and-suspenders: a status dot only repaints when someone's presence *changes*; if you
                        // opened a chat with someone whose status hadn't changed since, their dot could be stuck
                        // showing nothing until something did. This just re-checks everyone on-screen periodically.
  },20000);
  if(!presenceListening){ presenceListening=true;   // add these once, not on every reconnect
    document.addEventListener("visibilitychange",()=>{ if(!user||!presenceCh) return; if(!document.hidden){ markActive(); api.touchSeen().catch(()=>{}); if(!presenceHealthy()) schedulePresenceRestart(300); } pushPresence(); });
    addEventListener("online",()=>{ if(user&&presenceCh&&!presenceHealthy()) schedulePresenceRestart(1000); });
  }
}
function stopPresence(){ clearTimeout(presenceRetry); if(presenceCh){ const old=presenceCh; presenceCh=null; sb.removeChannel(old); } presenceStatus="off"; clearInterval(presenceTimer); clearInterval(idleTimer); online.clear(); }
function paintPresenceDiag(){
  const d=$("presenceDiag"); if(!d) return;
  if(!sb){ d.textContent=""; return; }
  const n=[...online.keys()].filter(id=>id!==user?.id).length;
  d.textContent=presenceHealthy()?`🟢 Online status: connected · you can see ${n} other ${n===1?"person":"people"} online`:presenceCh?"🟡 Online status: reconnecting…":"⚪ Online status: not connected";
}
let demoPresenceOverride=false;   // tests can set this true to fully control isOnline/whereIs via the `online` Map
const isOnline=uid=>online.has(uid)||(!sb&&!demoPresenceOverride&&["vee"].includes(uid));
const whereIs=uid=>{ if(online.has(uid)) return online.get(uid); if(!sb&&!demoPresenceOverride) return uid==="vee"?{room:"5959",typing:false}:uid==="rook"?{room:null,typing:false}:null; return null; };
// "online" | "idle" | "dnd" | null(offline) — this is what the little status symbol reflects everywhere
function statusOf(uid){
  if(uid&&user&&uid===user.id&&(sb?presenceCh:demoPresenceOverride?online.has(uid):true)){ if(dndOn()) return "dnd"; if(computeIdle()) return null; return "online"; }   // away 2+ minutes = you look offline (same as friends see you)   // you always know your own status instantly — never wait on the server to echo it back
  if(!isOnline(uid)) return null;
  const w=whereIs(uid)||{};
  if(w.dnd) return "dnd";
  if(w.typing) return "online";   // typing = definitely here, even mid long message
  if(w.idle) return null;   // away 2+ minutes: show them as offline
  return "online";
}
// still connected but away 2+ minutes: when they stopped (ms), else null
function awayAt(uid){
  if(uid&&user&&uid===user.id) return computeIdle()?awaySince():null;
  if(!isOnline(uid)) return null; const w=whereIs(uid)||{}; if(!w.idle||w.dnd) return null;
  return +w.idleSince||+w.at||Date.now();
}
const STATUS_WORD={online:"online",idle:"idle",dnd:"on Do Not Disturb"};
// only name rooms the viewer is also in
function presenceLine(uid){
  const st=statusOf(uid);
  if(!st){ const a=awayAt(uid); return a?`away · last seen ${agoText(a)}`:lastSeenText(uid); }
  const w=whereIs(uid); if(!w||!w.room) return st==="online"?"active now":STATUS_WORD[st];
  const mine=inboxRows.find(r=>r.code===w.room); if(!mine) return st==="online"?"active now":STATUS_WORD[st];
  const label=mine.is_dm?(mine.dm_user===user.id?"a private chat":(mine.dm_user===uid?"your chat":"a private chat")):(mine.name||"#"+w.room);
  if(mine.is_dm&&mine.dm_user!==uid) return st==="online"?"active now":STATUS_WORD[st];
  return (w.typing?"typing in ":"in ")+label;
}
function paintOnlineStrip(){
  const strip=$("onlineStrip"); if(!strip) return;
  const ids=[...new Set([...online.keys(),...(!sb?["vee"]:[])])].filter(id=>id!==user?.id&&cache.has(id)&&!blocked.has(id)&&statusOf(id)&&statusOf(id)!=="dnd"&&(contactIds.includes(id)||inboxRows.some(r=>r.is_dm&&r.dm_user===id)||members.has(id)));
  strip.innerHTML=""; show(strip,ids.length>0); if(!ids.length) return;
  strip.append(el("span","onlinelbl",`${ids.length} online`));
  ids.slice(0,12).forEach(id=>{ const bt=el("button","onlinechip"); bt.type="button"; const f=el("span","face"); paintFace(f,cache.get(id)); const w=whereIs(id); const t=el("small","",w?.typing?"typing…":w?.room&&inboxRows.find(r=>r.code===w.room&&!r.is_dm)?(inboxRows.find(r=>r.code===w.room).name||"#"+w.room):"online"); bt.append(f,el("span","",nameOf(id)),t); bt.onclick=()=>openPerson(id); strip.append(bt); });
}
function paintRoomOnline(){
  if(!room) return;
  if(isDm&&dmUser){
    const dp=$("dmPresence"), here=!!statusOf(dmUser)&&statusOf(dmUser)!=="dnd"&&whereIs(dmUser)?.room===room;
    dp.innerHTML=""; dp.append(el("span","dot"),el("span","",presenceLine(dmUser)));
    dp.classList.toggle("here",here); show(dp,true); show($("hereBar"),false);
    return;
  }
  show($("dmPresence"),false);
  const here=[...members.keys()].filter(id=>id!==user.id&&statusOf(id)&&statusOf(id)!=="dnd"&&whereIs(id)?.room===room);
  const bar=$("hereBar");
  if(!here.length){ show(bar,false); return; }
  bar.innerHTML="";
  const faces=el("span","hb-faces"); here.slice(0,5).forEach(id=>{ const f=el("span","face"); paintFace(f,cache.get(id)); faces.append(f); });
  const names=here.map(id=>nameOf(id));
  const label = here.length===1 ? `${names[0]} is here` : here.length<=3 ? `${names.slice(0,-1).join(", ")} & ${names[here.length-1]} are here`
              : `${names.slice(0,2).join(", ")} & ${here.length-2} more are here`;
  const txt=document.createElement("span"); const bEl=document.createElement("b"); bEl.textContent="🟢 "; txt.append(bEl,label);
  bar.append(faces,txt); show(bar,true);
}
function lastSeenText(uid){
  if(isOnline(uid)&&!awayAt(uid)) return "active now";
  const t=cache.get(uid)?.last_seen; if(!t) return "";
  const m=Math.round((Date.now()-new Date(t))/60000); if(m<1) return "active just now"; if(m<60) return `active ${m}m ago`; const h=Math.round(m/60); if(h<24) return `active ${h}h ago`; const d=Math.round(h/24); return d===1?"active yesterday":`active ${d}d ago`;
}
function applyStatusDot(node,uid,p){
  const st=statusOf(uid); ["online","idle","dnd"].forEach(s=>node.classList.toggle("status-"+s,st===s));
  node.classList.toggle("has-status",!!st);
  const shape=(p?.theme?.statusShape)||"dot";
  STATUS_SHAPES.forEach(([s])=>node.classList.toggle("shape-"+s,shape===s));
  const w=whereIs(uid); node.classList.toggle("here",!!(st&&st!=="dnd"&&w&&room&&w.room===room&&uid!==user?.id));
}
function paintPresence(){
  document.querySelectorAll(".face[data-uid]").forEach(f=>applyStatusDot(f,f.dataset.uid,cache.get(f.dataset.uid)));
  document.querySelectorAll("[data-presence]").forEach(n=>{ n.textContent=presenceLine(n.dataset.presence); });
  paintOnlineStrip(); paintRoomOnline(); contactsPresenceSoon();
}
const _paintFace2=paintFace;
paintFace=function(node,p){ _paintFace2(node,p); if(p?.id){ node.dataset.uid=p.id; applyStatusDot(node,p.id,p); } };

/* ================= LINK PREVIEWS ================= */
const previewCache=new Map();
const URL_RE=/https?:\/\/[^\s<]+[^\s<.,:;"')\]!?]/i;
function firstUrl(text){ const m=(text||"").match(URL_RE); return m?m[0]:null; }
async function fetchPreview(url){
  if(previewCache.has(url)) return previewCache.get(url);
  let p=null;
  const yt=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  try{
    if(yt){ const r=await fetch("https://www.youtube.com/oembed?format=json&url="+encodeURIComponent("https://www.youtube.com/watch?v="+yt[1])); if(r.ok){ const j=await r.json(); p={title:j.title,site:"YouTube",image:`https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`,by:j.author_name}; } }
    else if(api.linkPreview) p=await api.linkPreview(url);
  }catch(e){ p=null; }
  previewCache.set(url,p); return p;
}
function previewCard(url,p){
  const a=el("a","lpcard"); a.href=url; a.target="_blank"; a.rel="noopener noreferrer";
  if(p.image){ const i=document.createElement("img"); i.src=p.image; i.alt=""; i.loading="lazy"; i.onerror=()=>i.remove(); a.append(i); }
  const t=el("span","lptext"); t.append(el("b","",p.title||url)); if(p.description) t.append(el("span","lpdesc",p.description.slice(0,120))); t.append(el("small","",(p.site||new URL(url).hostname.replace(/^www\./,""))+(p.by?" · "+p.by:"")));
  a.append(t); a.onclick=e=>e.stopPropagation(); return a;
}
function attachPreview(bub,m){
  if(m.kind!=="text"||!m.text) return; const url=firstUrl(m.text); if(!url) return;
  if(/giphy\.com|tenor\.com|klipy\.com|\.(png|jpe?g|gif|webp)(\?|$)/i.test(url)) return;
  if(location.origin&&url.startsWith(location.origin+location.pathname)) return;
  fetchPreview(url).then(p=>{ if(!p||!p.title) return; const node=elById.get(m.id); const b=node?.querySelector(".bubble"); if(b&&!b.querySelector(".lpcard")) b.append(previewCard(url,p)); });
}

/* ================= PERSONAL INVITE LINKS ================= */
let myInviteTok=null;   // your private friend code: fetched only for you, never stored on your public profile
async function myInviteUrl(){ if(!myInviteTok){ try{ myInviteTok=await api.myInviteToken(); }catch(e){ return null; } } return myInviteTok?`https://nightlane.chat/download.html?friend=${encodeURIComponent(myInviteTok)}`:null; }   // the invite opens the Get the app page, which keeps the friend code for after sign-in
$("inviteFriendBtn").onclick=async()=>{
  const u=await myInviteUrl(); if(!u){ say("contactMsg","Couldn't get your invite link. Check your connection and try again.",true); return; }
  const text=`Come chat with me on NightLane 🌙 Get the app (or open it in your browser) and we're friends: ${u}`;
  if(navigator.share){ try{ await navigator.share({title:"Join me on NightLane",text,url:u}); return; }catch(e){} }
  try{ await navigator.clipboard.writeText(u); nlToast("sys","invite link copied // whoever signs in from it becomes your friend",4500); }catch(e){ say("contactMsg",u); }
};
$("resetInviteBtn").onclick=async()=>{
  if(!await nlAlert({ kind:"warn", title:"Reset invite link", badge:"WARNING", text:"Make a new friend link? Your old link stops working right away. Friends you already have stay your friends.", status:"AWAITING INPUT", buttons:[{label:"RESET", value:true},{label:"CANCEL", value:false}] })) return;
  const btn=$("resetInviteBtn"); btn.disabled=true;
  try{
    const r=await api.resetInviteToken();
    const tok=typeof r==="string"?r:(r?.token||r?.invite_token||(Array.isArray(r)?(typeof r[0]==="string"?r[0]:r[0]?.token||r[0]?.invite_token):null));
    myInviteTok=tok||null; if(!myInviteTok){ try{ myInviteTok=await api.myInviteToken(); }catch(e){} }
    say("contactMsg","Done ✅ Your old friend link is dead. Tap 📲 to share your new one.");
  }catch(err){ say("contactMsg","Couldn't reset your link: "+err.message,true); }
  finally{ btn.disabled=false; }
};
async function handleFriendInvite(token){
  try{ const r=await api.acceptFriendInvite(token); await loadContacts(); const name=r?.username||"your friend"; sfx("friend");
    say("contactMsg",`You and ${name} are friends now 🤝`); setFrontTab("contacts"); if(fxEnabled()&&typeof FX!=="undefined"){ FX.play("hearts"); pxfx("hearts",{scale:4}); } }
  catch(err){ say("contactMsg",/expired|invalid|not_found/i.test(err.message)?"That invite link isn't valid anymore.":"Couldn't use that invite: "+err.message,true); setFrontTab("contacts"); }
}

