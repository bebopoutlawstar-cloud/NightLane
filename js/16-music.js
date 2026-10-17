/* ================= 🎧 LOFI RADIO =================
   Endless chill background music, made live in the browser (no audio files, nothing to license).
   Soft electric-piano chords, a round bass, lazy swung drums, little melody notes and vinyl crackle.
   Off by default. It goes quiet by itself during calls, voice notes, videos, and when the app is in the background. */
const LOFI={ ctx:null, master:null, on:false, vol:.6, timer:null, next:0, beat:0, bar:0, prog:null, progLeft:0, capture:false, noise:null, crackle:null, lfo:null, keysBus:null, drumBus:null, echo:null };
const LOFI_BPM=72, LOFI_BEAT=60/LOFI_BPM;
// chords: [bass note, [piano notes]] in MIDI numbers; one chord per bar
const LOFI_PROGS=[
  [[38,[53,57,60,64]],[43,[53,57,59,64]],[36,[52,55,59,62]],[45,[55,58,61,64]]],   // Dm9 · G13 · Cmaj9 · A7b9
  [[41,[57,60,64,67]],[40,[55,59,62,64]],[45,[55,60,64,67]],[45,[57,60,64,67]]],   // Fmaj7 · Em7 · Am7 · Am7
  [[43,[53,57,59,64]],[36,[52,55,59,62]],[45,[55,57,60,64]],[38,[53,57,60,64]]],   // G13 · Cmaj9 · Am9 · Dm9
  [[46,[53,57,60,62]],[45,[55,57,60,64]],[38,[53,57,60,64]],[43,[53,55,59,62]]]    // Bbmaj7 · Am9 · Dm9 · G9
];
const lofiHz=m=>440*Math.pow(2,(m-69)/12);
const lofiPrefs=()=>{ try{ return JSON.parse(LS.get("nl-lofi"))||{}; }catch(e){ return {}; } };
function lofiSave(){ try{ LS.set("nl-lofi",JSON.stringify({on:LOFI.on,vol:LOFI.vol,station:LOFI.station,bg:LOFI.bg})); }catch(e){} }

/* 📻 STATIONS (2026.10.18s): the generated radio, plus two packs of real lofi Cole bought.
   The song files live in Supabase Storage (bucket "music"), NOT in the GitHub repo: the licenses let us play them
   in the app but not hand the files out. Demo mode looks in a local "music/" folder instead. */
const MUSIC_BASE=SUPABASE_URL?SUPABASE_URL+"/storage/v1/object/public/music/":"music/";
const LOFI_STATIONS={
  night:{icon:"🌙", name:"Night Lofi", gen:true},
  dust:{icon:"☀️", name:"Dust & Sunlight", by:"Gent Byci", tracks:[
    ["ds-01-piano-hour","Piano Hour"],["ds-02-afternoon-company","Afternoon Company"],["ds-03-piano-music-box","Piano Music Box"],
    ["ds-04-coasting-through-time","Coasting Through Time"],["ds-05-golden-blue","Golden Blue"]]},
  cozy:{icon:"🔥", name:"Cozy Lofi", by:"Cristiano Leone", ext:"mp3", tracks:[
    ["cl-01-fireplace","Fireplace"],["cl-02-sunset","Sunset"],["cl-03-raining-days","Raining Days"],["cl-04-good-old-days","Good Old Days"],
    ["cl-05-daydreaming","Daydreaming"],["cl-06-yesterday","Yesterday"],["cl-07-sunrise","Sunrise"],["cl-08-memory-lane","Memory Lane"],
    ["cl-09-five-years","Five Years"],["cl-10-empty-roads","Empty Roads"],["cl-11-lonesome","Lonesome"],["cl-12-unwind","Unwind"]]}
};
LOFI_STATIONS.mine={icon:"📁", name:"My Music", by:"your music", local:true, level:.3, tracks:[]};   // songs from your own phone (loud, so a lower level)
LOFI.station="night"; LOFI.el=null; LOFI.tmaster=null; LOFI.tfade=null; LOFI.bag=[]; LOFI.track=null; LOFI.fails=0;
const lofiReal=()=>!LOFI_STATIONS[LOFI.station]?.gen;
function lofiTrackSetup(){   // one <audio> (not on the page, so it doesn't count as "a video is playing") -> fade -> volume -> speakers
  if(LOFI.el||!LOFI.ctx) return;
  const a=new Audio(); a.crossOrigin="anonymous"; a.preload="auto"; a.playsInline=true;
  const src=LOFI.ctx.createMediaElementSource(a);
  LOFI.tfade=LOFI.ctx.createGain(); LOFI.tmaster=LOFI.ctx.createGain(); LOFI.tmaster.gain.value=0;
  src.connect(LOFI.tfade).connect(LOFI.tmaster).connect(LOFI.ctx.destination);
  a.addEventListener("ended",()=>lofiNext());
  a.addEventListener("playing",()=>{ LOFI.fails=0; });
  a.addEventListener("error",()=>{   // missing or broken file: skip it; if a whole station won't load, go back to Night Lofi
    if(!lofiReal()||!LOFI.on) return;
    const st=LOFI_STATIONS[LOFI.station];
    if(++LOFI.fails>=st.tracks.length){ LOFI.fails=0; toast("🎧 Lofi",st.local?"Your phone couldn't play those songs, so it's back on Night Lofi. MP3 and M4A files work best.":`Couldn't load ${st.name} right now, so it's back on Night Lofi.`); lofiStation("night"); return; }
    setTimeout(lofiNext,300);
  });
  a.addEventListener("timeupdate",()=>{   // these songs loop with no fade at the end, so fade out the last 3 seconds
    const left=a.duration-a.currentTime; if(isFinite(left)&&left<3.2&&!LOFI.fadingOut){ LOFI.fadingOut=true; try{ LOFI.tfade.gain.setTargetAtTime(0,LOFI.ctx.currentTime,.8); }catch(e){} }
    paintLofiNow();
  });
  LOFI.el=a;
}
function lofiNext(){   // shuffle: every song plays once before any repeats
  if(!lofiReal()||!LOFI.el) return;
  const list=LOFI_STATIONS[LOFI.station].tracks;
  if(!LOFI.bag.length||LOFI.bag.station!==LOFI.station){ const b=list.map((_,i)=>i).sort(()=>Math.random()-.5); if(LOFI.track&&b[0]===LOFI.track.i&&b.length>1) b.push(b.shift()); LOFI.bag=b; LOFI.bag.station=LOFI.station; }
  if(!list.length){ LOFI.track=null; LOFI.el.pause(); paintLofiNow(); return; }   // My Music with no songs yet
  const i=LOFI.bag.shift(), [file,title]=list[i], st=LOFI.station;
  const track=LOFI.track={i,title,station:st,id:file}; LOFI.fadingOut=false;
  const t=LOFI.ctx.currentTime; try{ LOFI.tfade.gain.cancelScheduledValues(t); LOFI.tfade.gain.setValueAtTime(0,t); LOFI.tfade.gain.linearRampToValueAtTime(1,t+1.5); }catch(e){}
  const go=src=>{ if(LOFI.track!==track) return; if(LOFI.blobUrl&&LOFI.blobUrl!==src){ URL.revokeObjectURL(LOFI.blobUrl); LOFI.blobUrl=null; }
    LOFI.el.src=src; if(LOFI.on&&!document.hidden) LOFI.el.play().catch(()=>{}); };
  if(LOFI_STATIONS[st].local) mmBlob(file).then(b=>{ if(!b) throw 0; const u=URL.createObjectURL(b); LOFI.blobUrl=u; go(u); }).catch(()=>{ if(LOFI.track===track) LOFI.el.dispatchEvent(new Event("error")); });
  else go(MUSIC_BASE+file+"."+(LOFI_STATIONS[st].ext||"m4a"));
  paintLofiNow(); lofiMedia();
}
function lofiStation(id){
  if(!LOFI_STATIONS[id]||LOFI_STATIONS[id].hidden) id="night";
  const was=LOFI.station; LOFI.station=id; lofiSave();
  if(was!==id){ LOFI.bag=[]; LOFI.track=null; LOFI.fails=0; if(LOFI.el){ LOFI.el.pause(); LOFI.el.removeAttribute("src"); } }
  if(LOFI.on&&LOFI.ctx){ lofiTrackSetup(); if(lofiReal()&&(was!==id||LOFI.el.paused)) lofiNext(); }
  paintLofi();
}
/* ===== 📁 MY MUSIC (2026.10.18w): songs people pick from their own phone =====
   Kept in this device's IndexedDB (browser storage) and never uploaded, so there's nothing to host or license.
   On iPhone you pick from the Files app (Apple Music and Spotify songs are locked, so they can't be added). */
let mmDbP=null;
function mmDb(){ return mmDbP||(mmDbP=new Promise((res,rej)=>{ const r=indexedDB.open("nl-music",1); r.onupgradeneeded=()=>r.result.createObjectStore("songs",{keyPath:"id",autoIncrement:true}); r.onsuccess=()=>res(r.result); r.onerror=()=>{ mmDbP=null; rej(r.error); }; })); }
function mmTx(mode,fn){ return mmDb().then(db=>new Promise((res,rej)=>{ const tx=db.transaction("songs",mode), st=tx.objectStore("songs"); let out; const q=fn(st); if(q) q.onsuccess=()=>{ out=q.result; }; tx.oncomplete=()=>res(out); tx.onerror=tx.onabort=()=>rej(tx.error); })); }
const mmBlob=id=>mmTx("readonly",st=>st.get(id)).then(r=>r?.blob||null);
let mmSongs=[];   // [{id,name,size}]
async function mmLoad(){
  try{ const all=await mmTx("readonly",st=>st.getAll()); mmSongs=(all||[]).map(r=>({id:r.id,name:r.name,size:r.size||0})); }catch(e){ mmSongs=[]; }
  LOFI_STATIONS.mine.tracks=mmSongs.map(r=>[r.id,r.name]); LOFI.bag=[]; paintMyMusic();
}
const mmTitle=f=>f.name.replace(/\.[a-z0-9]{2,5}$/i,"").replace(/[_]+/g," ").trim()||"Untitled";
async function mmAdd(files){
  const ok=[...files].filter(f=>/^audio\//.test(f.type)||/\.(mp3|m4a|aac|wav|ogg|opus|flac)$/i.test(f.name));
  if(!ok.length){ toast("📁 My Music","Those weren't music files. Try MP3 or M4A songs."); return; }
  try{ navigator.storage?.persist?.().catch(()=>{}); }catch(e){}   // ask the browser not to clear them when space runs low
  let added=0;
  for(const f of ok){ try{ await mmTx("readwrite",st=>st.add({name:mmTitle(f),type:f.type,size:f.size,blob:f,added:Date.now()})); added++; }
    catch(e){ toast("📁 My Music",/quota/i.test(e?.name||e?.message||"")?"Your phone is out of space for more songs.":"Couldn't save "+mmTitle(f)+"."); break; } }
  const wasEmpty=!LOFI_STATIONS.mine.tracks.length;
  await mmLoad();
  if(added) toast("📁 My Music",`Added ${added} song${added===1?"":"s"}.`);
  if(wasEmpty&&added&&LOFI.on&&LOFI.station==="mine"&&LOFI.ctx){ lofiTrackSetup(); lofiNext(); }
}
async function mmRemove(id){
  try{ await mmTx("readwrite",st=>st.delete(id)); }catch(e){}
  const playing=LOFI.station==="mine"&&LOFI.track?.id===id;
  await mmLoad();
  if(playing&&LOFI.on){ LOFI.el.pause(); lofiNext(); }
}
function mmPlay(id){   // tap a song to play it now
  if(LOFI.station!=="mine"||!LOFI.on) return;
  const list=LOFI_STATIONS.mine.tracks, i=list.findIndex(t=>t[0]===id); if(i<0) return;
  LOFI.bag=[i,...list.map((_,k)=>k).filter(k=>k!==i).sort(()=>Math.random()-.5)]; LOFI.bag.station="mine"; lofiNext();
}
function paintMyMusic(){
  const box=$("myMusicBox"); if(!box) return;
  show(box,LOFI.on&&LOFI.station==="mine");
  const mb=mmSongs.reduce((n,r)=>n+r.size,0)/1048576;
  $("mmCount").textContent=mmSongs.length?`${mmSongs.length} song${mmSongs.length===1?"":"s"} · ${mb<10?mb.toFixed(1):Math.round(mb)} MB`:"No songs yet";
  const ul=$("mmList"); ul.replaceChildren();
  mmSongs.forEach(r=>{ const li=el("li",LOFI.track?.station==="mine"&&LOFI.track.id===r.id?"now":""), t=el("span","",r.name), x=el("button","","✕");
    t.title="Play "+r.name; t.onclick=()=>mmPlay(r.id); x.type="button"; x.setAttribute("aria-label","Remove "+r.name); x.onclick=()=>mmRemove(r.id);
    li.append(t,x); ul.append(li); });
}
function paintLofiNow(){
  const row=$("lofiNowRow"); if(!row) return;
  const st=LOFI_STATIONS[LOFI.station], tr=LOFI.track;
  show(row,LOFI.on&&lofiReal());
  if(lofiReal()){ const n=$("lofiNow"); if(tr) n.replaceChildren("♪ ",el("b","",tr.title)," · "+st.by); else n.textContent=st.local&&!st.tracks.length?"Add some songs below 👇":"Loading…"; }
  if(st?.local&&LOFI.mmNow!==(tr?.id??null)){ LOFI.mmNow=tr?.id??null; paintMyMusic(); }   // highlight the song that's playing
}

function lofiBuild(){
  const ctx=LOFI.ctx=new (window.AudioContext||window.webkitAudioContext)();
  const comp=ctx.createDynamicsCompressor(); comp.threshold.value=-18; comp.ratio.value=3;
  const warm=ctx.createBiquadFilter(); warm.type="lowpass"; warm.frequency.value=4200;   // takes the "digital" edge off
  LOFI.master=ctx.createGain(); LOFI.master.gain.value=0;
  warm.connect(LOFI.master).connect(comp).connect(ctx.destination);
  LOFI.keysBus=ctx.createBiquadFilter(); LOFI.keysBus.type="lowpass"; LOFI.keysBus.frequency.value=2000; LOFI.keysBus.connect(warm);
  LOFI.drumBus=ctx.createGain(); LOFI.drumBus.gain.value=.8; LOFI.drumBus.connect(warm);
  // a little echo for the melody notes
  const d=ctx.createDelay(1.5), fb=ctx.createGain(), wet=ctx.createGain();
  d.delayTime.value=LOFI_BEAT*.75; fb.gain.value=.32; wet.gain.value=.35;
  d.connect(fb).connect(d); d.connect(wet).connect(LOFI.keysBus); LOFI.echo=d;
  // tape "wow": a slow wobble on every note's pitch
  LOFI.lfo=ctx.createOscillator(); LOFI.lfo.frequency.value=.35; const lg=ctx.createGain(); lg.gain.value=7; LOFI.lfo.connect(lg); LOFI.lfoOut=lg; LOFI.lfo.start();
  // white noise, reused for drums
  const nb=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate), nd=nb.getChannelData(0);
  for(let i=0;i<nd.length;i++) nd[i]=Math.random()*2-1; LOFI.noise=nb;
  // vinyl: soft hiss + random pops, looped
  const vb=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate), vd=vb.getChannelData(0);
  for(let i=0;i<vd.length;i++){ vd[i]=(Math.random()*2-1)*.0012; if(Math.random()<.00015) vd[i]+=(Math.random()<.5?-1:1)*(.15+Math.random()*.3); }
  const vs=ctx.createBufferSource(); vs.buffer=vb; vs.loop=true;
  const vh=ctx.createBiquadFilter(); vh.type="highpass"; vh.frequency.value=1400; const vg=ctx.createGain(); vg.gain.value=.18;   // vinyl kept faint: a little texture, not a hum
  vs.connect(vh).connect(vg).connect(warm); vs.start(); LOFI.crackle=vs;
}
function lofiNote(freq,t,dur,vel,out,soft){   // a mellow electric-piano-ish note
  const ctx=LOFI.ctx, g=ctx.createGain();
  const a=ctx.createOscillator(); a.type="sine"; a.frequency.value=freq;
  const b=ctx.createOscillator(); b.type="triangle"; b.frequency.value=freq*2; b.detune.value=(Math.random()-.5)*8;
  const bg=ctx.createGain(); bg.gain.value=soft?.08:.15;
  LOFI.lfoOut.connect(a.detune); LOFI.lfoOut.connect(b.detune);
  a.connect(g); b.connect(bg).connect(g); g.connect(out);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vel,t+.025);
  g.gain.exponentialRampToValueAtTime(vel*.35,t+Math.min(1.2,dur)); g.gain.exponentialRampToValueAtTime(.0001,t+dur+.4);
  a.start(t); b.start(t); a.stop(t+dur+.5); b.stop(t+dur+.5);
}
function lofiKick(t,v){ const ctx=LOFI.ctx, o=ctx.createOscillator(), g=ctx.createGain();
  o.frequency.setValueAtTime(115,t); o.frequency.exponentialRampToValueAtTime(42,t+.13);
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+.38); o.connect(g).connect(LOFI.drumBus); o.start(t); o.stop(t+.4); }
function lofiNoise(t,v,type,freq,len,q){ const ctx=LOFI.ctx, s=ctx.createBufferSource(), f=ctx.createBiquadFilter(), g=ctx.createGain();
  s.buffer=LOFI.noise; s.playbackRate.value=.9+Math.random()*.2; f.type=type; f.frequency.value=freq; if(q) f.Q.value=q;
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+len); s.connect(f).connect(g).connect(LOFI.drumBus);
  s.start(t,Math.random()*.5); s.stop(t+len+.02); }
function lofiSnare(t){ lofiNoise(t,.16,"bandpass",1700,.2,.7);
  const ctx=LOFI.ctx, o=ctx.createOscillator(), g=ctx.createGain(); o.frequency.value=185; g.gain.setValueAtTime(.08,t); g.gain.exponentialRampToValueAtTime(.0001,t+.09); o.connect(g).connect(LOFI.drumBus); o.start(t); o.stop(t+.1); }
function lofiBeat(t){   // everything that happens on one beat
  const beat=LOFI.beat, swing=LOFI_BEAT*.5+LOFI_BEAT*.08;   // the "and" lands a little late: that's the lazy feel
  if(beat===0){ if(!LOFI.progLeft){ LOFI.prog=LOFI_PROGS[Math.floor(Math.random()*LOFI_PROGS.length)]; LOFI.progLeft=8; } LOFI.progLeft--; }
  const [root,notes]=LOFI.prog[LOFI.bar%4];
  if(beat===0) notes.forEach((m,i)=>lofiNote(lofiHz(m),t+i*.018+Math.random()*.01,LOFI_BEAT*3.6,.045,LOFI.keysBus));   // strummed chord
  if(beat===2&&Math.random()<.45) notes.slice(1).forEach((m,i)=>lofiNote(lofiHz(m),t+swing+i*.015,LOFI_BEAT*1.2,.022,LOFI.keysBus));
  if(beat===0||(beat===2&&Math.random()<.7)) lofiNote(lofiHz(root),t+(beat===2?swing:0),LOFI_BEAT*1.6,.11,LOFI.keysBus,true);   // bass
  if(beat===0||beat===2) lofiKick(t,.55); if(beat===2&&Math.random()<.35) lofiKick(t+swing,.3);
  if(beat===1||beat===3) lofiSnare(t+.012);
  if(Math.random()>.12) lofiNoise(t,.035,"highpass",7200,.05); if(Math.random()>.2) lofiNoise(t+swing,.022,"highpass",7600,.04);   // hats
  if(Math.random()<.3){ const m=notes[Math.floor(Math.random()*notes.length)]+12; lofiNote(lofiHz(m),t+(Math.random()<.5?0:swing),LOFI_BEAT*.9,.03,LOFI.echo); }   // little melody
  LOFI.beat=(beat+1)%4; if(LOFI.beat===0) LOFI.bar++;
}
const lofiBusy=()=>!!(typeof callRoom!=="undefined"&&callRoom) || LOFI.capture || [...document.querySelectorAll("audio,video")].some(m=>!m.paused&&!m.muted&&m.currentTime>0);
function lofiTick(){
  const ctx=LOFI.ctx; if(!ctx) return;
  const gen=!lofiReal(), busy=lofiBusy();
  if(gen){ while(LOFI.next<ctx.currentTime+(document.hidden?1.6:.25)){ lofiBeat(LOFI.next); LOFI.next+=LOFI_BEAT; } } else LOFI.next=ctx.currentTime+.1;
  LOFI.master.gain.setTargetAtTime(LOFI.on&&gen&&!busy?LOFI.vol*.55:0,ctx.currentTime,.35);   // duck for calls, recording, videos
  if(LOFI.tmaster) LOFI.tmaster.gain.setTargetAtTime(LOFI.on&&!gen&&!busy?LOFI.vol*(LOFI_STATIONS[LOFI.station]?.level||.5):0,ctx.currentTime,.35);
}
async function lofiStart(){
  if(!LOFI.ctx) lofiBuild();
  try{ await LOFI.ctx.resume(); }catch(e){}
  if(!LOFI.timer){ LOFI.next=LOFI.ctx.currentTime+.1; LOFI.timer=setInterval(lofiTick,60); }
  lofiTrackSetup();
  if(lofiReal()){ if(!LOFI.track) lofiNext(); else LOFI.el.play().catch(()=>{}); }
}
function lofiStop(){ if(LOFI.master) LOFI.master.gain.setTargetAtTime(0,LOFI.ctx.currentTime,.25);
  if(LOFI.tmaster) LOFI.tmaster.gain.setTargetAtTime(0,LOFI.ctx.currentTime,.25);
  setTimeout(()=>{ if(LOFI.on) return; clearInterval(LOFI.timer); LOFI.timer=null; LOFI.el?.pause(); LOFI.ctx?.suspend().catch(()=>{}); },900); }
function lofiSet(on){ LOFI.on=on; lofiSave(); if(on) lofiStart(); else lofiStop(); paintLofi(); lofiMedia(); }
/* 🎛️ the song shows in your computer's / phone's media controls (Windows volume pop-up, Android notification), with play, pause and next */
function lofiMedia(){
  const ms=navigator.mediaSession; if(!ms) return;
  try{
    const st=LOFI_STATIONS[LOFI.station], tr=LOFI.track;
    ms.metadata=LOFI.on?new MediaMetadata({title:lofiReal()?(tr?.title||st.name):"Night Lofi",artist:lofiReal()?(st.by||""):"made live in NightLane",album:"NightLane radio · "+st.name,artwork:[{src:"icon-192.png",sizes:"192x192",type:"image/png"}]}):null;
    ms.playbackState=LOFI.on?"playing":"paused";
    if(!LOFI.msOn){ LOFI.msOn=true;
      ms.setActionHandler("play",()=>lofiSet(true)); ms.setActionHandler("pause",()=>lofiSet(false));
      try{ ms.setActionHandler("nexttrack",()=>{ if(LOFI.on&&lofiReal()) lofiNext(); }); }catch(e){} }
  }catch(e){}
}
function paintLofi(){
  const q=$("lofiQuick"); if(q){ q.classList.toggle("on",LOFI.on); q.setAttribute("aria-pressed",String(LOFI.on)); q.title=LOFI.on?"Lofi music: on":"Lofi music: off"; }
  const b=$("lofiBtn"); if(b) b.textContent="🎧 Lofi music: "+(LOFI.on?"On":"Off");
  const r=$("lofiVolRow"); if(r) show(r,LOFI.on);
  const bgb=$("lofiBgBtn"); if(bgb){ show(bgb,LOFI.on); bgb.textContent="🎧 Keep playing in the background: "+(LOFI.bg?"On":"Off"); }
  const v=$("lofiVol"); if(v) v.value=Math.round(LOFI.vol*100);
  const sb_=$("lofiStations"); if(sb_){ show(sb_,LOFI.on);
    if(!sb_.children.length) Object.entries(LOFI_STATIONS).filter(([,st])=>!st.hidden).forEach(([id,st])=>{ const b=el("button"); b.type="button"; b.setAttribute("role","radio"); b.dataset.st=id; b.append(el("i","",st.icon),st.name); b.onclick=()=>lofiStation(id); sb_.append(b); });
    [...sb_.children].forEach(b=>b.setAttribute("aria-checked",String(b.dataset.st===LOFI.station))); }
  paintLofiNow(); paintMyMusic();
}
(()=>{   // remember the choice; phones only allow sound after a tap, so a saved "on" waits for the first one
  const p=lofiPrefs(); LOFI.on=!!p.on; if(typeof p.vol==="number") LOFI.vol=Math.min(1,Math.max(.05,p.vol)); if(LOFI_STATIONS[p.station]&&!LOFI_STATIONS[p.station].hidden) LOFI.station=p.station; LOFI.bg=p.bg!==false;   // background play is on unless you turned it off
  $("lofiSkip").onclick=()=>lofiNext();
  $("lofiBgBtn").onclick=()=>{ LOFI.bg=!LOFI.bg; lofiSave(); paintLofi(); if(LOFI.bg&&(BROWSER.ios||isIOS)) toast("🎧 Lofi","Heads up: iPhone pauses web music when you leave the app, so this works best on computers and Android."); };
  $("mmPick").onchange=e=>{ const f=e.target.files; if(f?.length) mmAdd(f).finally(()=>{ e.target.value=""; }); };
  if(BROWSER.ios||isIOS) $("mmIosTip").textContent="On iPhone, songs come from the Files app. Apple Music and Spotify songs are locked and can't be added.";
  mmLoad();
  if(LOFI.on){ const go=()=>{ document.removeEventListener("pointerdown",go,true); if(LOFI.on) lofiStart(); }; document.addEventListener("pointerdown",go,true); }
  $("lofiQuick").onclick=()=>lofiSet(!LOFI.on);
  $("lofiBtn").onclick=()=>lofiSet(!LOFI.on);
  $("lofiVol").oninput=e=>{ LOFI.vol=Math.max(.05,(+e.target.value||0)/100); lofiSave(); };
  document.addEventListener("visibilitychange",()=>{ if(!LOFI.ctx||!LOFI.on) return;
    if(document.hidden){ if(LOFI.bg) return; LOFI.el?.pause(); LOFI.ctx.suspend().catch(()=>{}); }
    else { LOFI.ctx.resume().catch(()=>{}); if(lofiReal()&&LOFI.el?.src) LOFI.el.play().catch(()=>{}); } });
  paintLofi();
})();
const _afcLofi=audioForCapture; audioForCapture=function(on){ LOFI.capture=!!on; return _afcLofi.apply(this,arguments); };   // quiet while recording

