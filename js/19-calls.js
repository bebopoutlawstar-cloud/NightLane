/* ===== Step 4 polish: call log, ring timeout, ringing buzz, LIVE timer ===== */
let callMsgId=null, callOutcome=null, callStartAt=0, callTimer=null, ringTimer=null, ringBuzz=null;
const callClock=ms=>{ const s=Math.floor(ms/1000); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; };
function stopRinging(){ clearTimeout(ringTimer); ringTimer=null; clearInterval(ringBuzz); ringBuzz=null; try{ navigator.vibrate&&navigator.vibrate(0); }catch(e){} stopCallTune(); }

/* 🎵 the dial tone (caller), the Night Drive ringtone (person being called, NightLane's own, in 00-media.js),
   and an "access granted" chime when the call connects. Dial tone + chime: "CyberFinance Terminal UI Sounds" by pegadance (Hacking Tension Pulse 01, Success Chime 01). */
/* (moved to js/00-media.js) */
const callSoundOn=()=>typeof uiSoundOn!=="function"||uiSoundOn();
let chimeBuf=null, tuneSrc=null, tuneGain=null, tuneWanted=false;
async function callBuf(uri){ const r=await fetch(uri); return sfxCtx().decodeAudioData(await r.arrayBuffer()); }
let tuneEl=null;   // backup player if the phone's sound engine gets paused by the mic turning on
const tuneBufs={};   // cache for the dial tone and the ringtone, so they don't have to be reloaded every time
async function startCallTune(uri=CALL_TUNE){   // CALL_TUNE = dial tone (you're calling), RING_TONE = Night Drive (someone's calling you)
  tuneWanted=true;   // call sounds always play (even with UI sounds off): it tells you the call is going through
  try{
    const ctx=sfxCtx(); if(ctx.state==="suspended") await ctx.resume();
    tuneBufs[uri]=tuneBufs[uri]||await callBuf(uri); const tuneBuf=tuneBufs[uri]; if(!tuneWanted||tuneSrc) return;   // the call may have ended while it loaded
    const s=ctx.createBufferSource(), g=ctx.createGain();
    s.buffer=tuneBuf; s.loop=true; s.loopEnd=Math.min(tuneBuf.duration,32);
    g.gain.setValueAtTime(0,ctx.currentTime); g.gain.linearRampToValueAtTime(.35,ctx.currentTime+.5);   // fade in
    s.connect(g).connect(ctx.destination); s.start(); tuneSrc=s; tuneGain=g;
  }catch(e){}
}
/* phones pause the sound engine for a moment when the mic/camera turns on, which killed the dial tone: wake it back up,
   and if it won't wake, play the tune through a plain audio player instead */
async function kickCallTune(){
  if(!tuneWanted) return;
  try{ const ctx=sfxCtx(); if(ctx.state!=="running") await Promise.race([ctx.resume(),new Promise(r=>setTimeout(r,700))]);
    if(ctx.state==="running"){ if(!tuneSrc) startCallTune(); return; } }catch(e){}
  if(!tuneWanted||tuneEl) return;
  try{ tuneEl=new Audio(CALL_TUNE); tuneEl.loop=true; tuneEl.volume=.35; await tuneEl.play(); }catch(e){ tuneEl=null; }
}
function stopCallTune(){
  tuneWanted=false; if(tuneEl){ try{ tuneEl.pause(); }catch(e){} tuneEl=null; }
  if(!tuneSrc) return;
  const ctx=sfxCtx(), s=tuneSrc, g=tuneGain; tuneSrc=tuneGain=null;
  try{ g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(g.gain.value,ctx.currentTime); g.gain.linearRampToValueAtTime(0,ctx.currentTime+.3); s.stop(ctx.currentTime+.35); }catch(e){}   // quick fade out
}
/* short synth beeps for the call buttons: accept = rising blips, decline / hang up = falling buzz (made in code, no sound files) */
function callBlip(kind){
  if(!callSoundOn()) return;
  try{ const ctx=sfxCtx(); if(ctx.state==="suspended") ctx.resume();
    const up=kind==="accept", notes=up?[523,784,1047]:[392,262], t0=ctx.currentTime+.02;
    notes.forEach((f,i)=>{ const o=ctx.createOscillator(), g=ctx.createGain(), t=t0+i*(up?.07:.11), d=up?.09:.16;
      o.type=up?"square":"sawtooth"; o.frequency.setValueAtTime(f,t); if(!up) o.frequency.exponentialRampToValueAtTime(f*.7,t+d);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(up?.12:.14,t+.01); g.gain.exponentialRampToValueAtTime(.001,t+d);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t+d+.02); });
  }catch(e){}
}
async function playConnectChime(){
  if(!callSoundOn()) return;
  try{ const ctx=sfxCtx(); if(ctx.state==="suspended") await ctx.resume(); chimeBuf=chimeBuf||await callBuf(CALL_CHIME);
    const s=ctx.createBufferSource(), g=ctx.createGain(); s.buffer=chimeBuf; g.gain.value=.5; s.connect(g).connect(ctx.destination); s.start(); }catch(e){}
}

/* 🎤 when the phone won't hand over the mic / camera: explain why, in plain words, with the steps for THIS phone */
function showMicHelp(err,voice){
  const name=err?.name||"", msg=String(err?.message||err||""), what=voice?"microphone":"microphone and camera", What=voice?"Microphone":"Microphone and Camera";
  const ios=BROWSER.ios||isIOS, android=BROWSER.android||/Android/i.test(navigator.userAgent);
  const iosNum=+((navigator.userAgent.match(/OS (\d+)_/)||[])[1]||0);
  let title="Mic blocked", intro="", steps=[];
  if(/AudioSession/i.test(msg)){
    title="Update needed"; intro="This phone is running an older NightLane.";
    steps=["Swipe NightLane closed, then open it again to get the latest version.","Try the call again."];
  } else if(name==="NotFoundError"||name==="OverconstrainedError"){
    title="No mic found"; intro=`NightLane couldn't find a ${what} on this device.`;
    steps=["If you're on a computer, plug in a headset or webcam and try again.",voice?"":"Or try a 🎧 Voice call instead, which only needs a mic."].filter(Boolean);
  } else if(name==="NotReadableError"||name==="AbortError"){
    title="Mic is busy"; intro=`Another app is using your ${what} right now.`;
    steps=["Hang up any phone call, FaceTime, or other video app.","Close apps like the Camera or a voice recorder.","Try the call again."];
  } else if(ios){
    title=voice?"Mic blocked":"Mic & camera blocked";
    intro=`Your iPhone is blocking the ${what} for NightLane. iPhone doesn't list NightLane in Settings by name: its mic and camera follow Safari's settings.`;
    steps=["Swipe NightLane closed and open it again. Then call again and tap <b>Allow</b> when it asks.",
      `If it doesn't ask: open <b>Settings → ${iosNum>=18?"Apps → Safari":"Safari"}</b>, scroll to <b>Settings for Websites</b>, and set <b>${What}</b> to <b>Ask</b> or <b>Allow</b>.`,
      "Still blocked? Check <b>Settings → Screen Time → Content & Privacy Restrictions</b>. If <b>Microphone</b> is locked there, it needs to be unlocked.",
      "Then swipe NightLane closed, open it again, and call."];
  } else if(android){
    title=voice?"Mic blocked":"Mic & camera blocked";
    intro=`Your phone is blocking the ${what} for NightLane. Calls need permission to use it.`;
    steps=["Using the installed app? Long-press the NightLane icon → <b>App info</b> → <b>Permissions</b>, and allow <b>"+What+"</b>.",
      "In Chrome: tap the icon left of the web address → <b>Permissions</b>, and allow <b>"+What+"</b>.",
      "Then close NightLane, open it again, and call."];
  } else {
    title=voice?"Mic blocked":"Mic & camera blocked";
    intro=`Your browser is blocking the ${what} for NightLane. Calls need permission to use it.`;
    steps=["Click the icon on the left of the address bar (a lock or sliders).",`Set <b>${What}</b> to <b>Allow</b>.`,"Reload the page and call again."];
  }
  $("micHelpTitle").textContent=title; $("micHelpIntro").textContent=intro;
  $("micHelpSteps").innerHTML=steps.map(t=>"<li><span>"+t+"</span></li>").join("");   // fixed text only, nothing from users
  $("micHelpErr").textContent=name||msg?`Phone said: ${[name,msg].filter(Boolean).join(" · ").slice(0,140)}`:"";
  show($("micHelp"));
}
$("micHelpClose").onclick=()=>show($("micHelp"),false);
$("micHelp").addEventListener("click",e=>{ if(e.target.id==="micHelp") show($("micHelp"),false); });

let callVoice=false;   // true = voice-only call (no cameras)
function setCallVoice(v){ callVoice=!!v; show($("callShare"),!callVoice&&canShare()); show($("callCam"),!callVoice); show($("callFlip"),!callVoice); show($("callGlitch"),!callVoice); updateCallLook(); }

/* ===== 16e: what each phone is doing with its camera, and how loud the call is =====
   myCam / theirCam: is a picture being sent (privacy glitch counts as on).
   Both off (or a voice call) = QUIET mode: the avatar screen, normal volume, for holding it up to your ear.
   Anyone's camera on = LOUD mode: your mic gets a boost before it's sent, so quiet talkers come through.
   The 🔊 button flips it by hand, for both phones. */
let camTrack=null, micRaw=null, camFacing="user", callCtx=null, micGain=null, audioSender=null, videoSender=null;
let myCam=true, theirCam=true, loudPick=null, glitch=null;
const LOUD_GAIN=3.5, QUIET_GAIN=1;   // after the leveler: LOUD is about 3.5× louder than QUIET (+11 dB)
function callLoud(){ const both=callVoice||(!myCam&&!theirCam); return loudPick!=null?loudPick:!both; }
function updateCallLook(){
  const cs=$("callScreen"), both=callVoice||(!myCam&&!theirCam);
  cs.classList.toggle("callvoice",both); cs.classList.toggle("theyoff",!both&&!theirCam);
  const loud=callLoud(), b=$("callVol");
  b.classList.toggle("on",loud); b.setAttribute("aria-pressed",String(loud));
  b.setAttribute("aria-label",loud?"Volume: loud (tap for quiet)":"Volume: quiet (tap for loud)"); $("callVolTxt").textContent=loud?"LOUD":"QUIET";
  if(micGain&&callCtx){ try{ micGain.gain.setTargetAtTime(loud?LOUD_GAIN:QUIET_GAIN,callCtx.currentTime,.05); }catch(e){} }
}
/* made right on the tap (phones only start audio from a tap); used to boost the mic */
function makeCallCtx(){ try{ callCtx=new (window.AudioContext||window.webkitAudioContext)(); callCtx.resume().catch(()=>{}); }catch(e){ callCtx=null; } }
const CAM_SIZE={width:{ideal:640},height:{ideal:480},frameRate:{ideal:24,max:30}};   // 640x480 @ 24fps: smooth on weak signal, still clear on a phone screen
async function getCallMedia(){
  const raw=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}, video:callVoice?false:{facingMode:camFacing,...CAM_SIZE}});
  micRaw=raw.getAudioTracks()[0]; camTrack=raw.getVideoTracks()[0]||null;
  let mic=micRaw;
  try{   // mic -> volume knob -> limiter (stops the boost from crackling) -> the call
    if(!callCtx) throw 0;
    if(callCtx.state!=="running") await Promise.race([callCtx.resume(),new Promise(r=>setTimeout(r,800))]);
    if(callCtx.state!=="running") throw 0;   // no boost is better than no sound
    const src=callCtx.createMediaStreamSource(new MediaStream([micRaw]));
    // mic -> leveler (evens out soft and loud talking) -> volume knob (LOUD / QUIET) -> limiter (stops crackle) -> the call
    const lev=callCtx.createDynamicsCompressor(), g=callCtx.createGain(), lim=callCtx.createDynamicsCompressor(), out=callCtx.createMediaStreamDestination();
    lev.threshold.value=-34; lev.knee.value=8; lev.ratio.value=3; lev.attack.value=.006; lev.release.value=.25;
    lim.threshold.value=-2; lim.knee.value=0; lim.ratio.value=20; lim.attack.value=.002; lim.release.value=.08;
    g.gain.value=callLoud()?LOUD_GAIN:QUIET_GAIN;
    src.connect(lev).connect(g).connect(lim).connect(out); micGain=g; mic=out.stream.getAudioTracks()[0];
    callCtx.onstatechange=()=>{   // iPhone can pause audio (another call, Siri): fall back to the plain mic
      if(!callCtx||callCtx.state==="running"||!micRaw) return;
      callCtx.resume().catch(()=>{}).finally(()=>setTimeout(()=>{ if(callCtx&&callCtx.state!=="running"&&micRaw) useRawMic(); },1000));
    };
  }catch(e){ mic=micRaw; micGain=null; }
  callStream=new MediaStream([mic,...(camTrack?[camTrack]:[])]);
  myCam=!callVoice; theirCam=!callVoice; loudPick=null; updateCallLook();
  paintLocal();
  if(camTrack){ try{ const cams=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==="videoinput"); show($("callFlip"),cams.length>1); }catch(e){} }
  startTalkWatch();
}
/* 🎙️ who's talking: your mic button lights up while you speak, and so does the tile (or picture) of whoever's talking.
   Reads the sound levels the call already measures (getStats), so it costs almost nothing. */
let talkT=null;
function startTalkWatch(){
  if(talkT) return;
  talkT=setInterval(async()=>{
    const links=pc?[{c:pc,el:$("callFace")}]:(typeof gc!=="undefined"&&gc)?[...gc.peers.values()].filter(p=>p.pc).map(p=>({c:p.pc,el:p.tile})):[];
    let me=0;
    for(const {c,el:who} of links){ try{ let them=0; (await c.getStats()).forEach(r=>{
        if(r.kind!=="audio"||r.audioLevel==null) return;
        if(r.type==="media-source") me=Math.max(me,r.audioLevel);
        if(r.type==="inbound-rtp") them=Math.max(them,r.audioLevel); });
      who&&who.classList.toggle("talking",them>.03); }catch(e){} }
    const live=callStream?.getAudioTracks().some(t=>t.enabled), b=$("callMute"), on=!!live&&me>.035;
    b.classList.toggle("talking",on); b.style.setProperty("--lvl",on?Math.min(1,me*3).toFixed(2):"0");
  },150);
}
function stopTalkWatch(){ clearInterval(talkT); talkT=null; const b=$("callMute"); b.classList.remove("talking"); b.style.removeProperty("--lvl"); $("callFace").classList.remove("talking"); }
function useRawMic(){
  const old=callStream?.getAudioTracks()[0]; if(!old||old===micRaw) return;
  micRaw.enabled=old.enabled; audioSender?.replaceTrack(micRaw).catch(()=>{});
  callStream.removeTrack(old); callStream.addTrack(micRaw); old.stop(); micGain=null;
}
function paintLocal(){ $("localVideo").srcObject=new MediaStream(callStream?callStream.getVideoTracks():[]); $("localVideo").classList.toggle("back",(camFacing==="environment"&&!glitch)||!!shareTrack); if(typeof gc!=="undefined"&&gc) gSelf(); }
async function swapSentVideo(track){   // send a different picture without redialing
  const old=callStream.getVideoTracks()[0];
  if(old!==track){ if(old) callStream.removeTrack(old); callStream.addTrack(track); }
  if(videoSender) await videoSender.replaceTrack(track).catch(()=>{});
  if(gc) await Promise.all([...gc.peers.values()].map(p=>p.vs?.replaceTrack(track).catch(()=>{})));
  tuneAll(); paintLocal();
}
function setMyCam(on){
  myCam=!!on; if(camTrack) camTrack.enabled=myCam; if(glitch) glitch.track.enabled=myCam;
  const b=$("callCam"); b.classList.toggle("off",!myCam); b.setAttribute("aria-pressed",String(!myCam)); b.setAttribute("aria-label",myCam?"Camera off":"Camera on");
  $("localVideo").classList.toggle("camoff",!myCam); if(gc) gSelf();
  loudPick=null; sendSignal("cam",{on:myCam}); updateCallLook();
}
/* 🔄 front <-> back camera */
async function flipCam(){
  if(!camTrack) return;
  const want=camFacing==="user"?"environment":"user";
  try{
    camTrack.stop();   // some phones can't open 2 cameras at once
    const fresh=(await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:want},...CAM_SIZE}})).getVideoTracks()[0];
    camFacing=want; camTrack=fresh; camTrack.enabled=myCam;
    if(glitch) glitch.v.srcObject=new MediaStream([camTrack]); else if(!shareTrack) await swapSentVideo(camTrack);
    paintLocal();
  }catch(e){ $("callState").textContent="Couldn't switch camera"; }
}
/* 👾 privacy glitch: they still see you move, but chopped into big neon blocks with RGB tearing, so your face never shows */
function startGlitch(){
  const v=document.createElement("video"); v.muted=true; v.playsInline=true; v.srcObject=new MediaStream([camTrack]); v.play().catch(()=>{});
  const W=270,H=360,CX=9,CY=12, c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d");
  const sm=document.createElement("canvas"); sm.width=CX; sm.height=CY; const sx=sm.getContext("2d",{willReadFrequently:true});
  const PAL=["#07041a","#3b2d80","#ff4fd8","#00f0ff","#f3ff3a"], cw=W/CX, ch=H/CY;
  let f=0;
  const draw=()=>{
    f++;
    let d=null; try{ if(v.readyState>=2){ sx.drawImage(v,0,0,CX,CY); d=sx.getImageData(0,0,CX,CY).data; } }catch(e){}
    x.globalCompositeOperation="source-over"; x.globalAlpha=1; x.fillStyle=PAL[0]; x.fillRect(0,0,W,H);
    for(let r=0;r<CY;r++){
      const shift=Math.random()<.14?(Math.random()-.5)*cw*2.5:0;
      for(let k=0;k<CX;k++){
        const i=(r*CX+k)*4, lum=d?(.3*d[i]+.59*d[i+1]+.11*d[i+2])/255:Math.random()*.4;
        x.fillStyle=PAL[Math.max(0,Math.min(4,Math.floor(lum*5+(Math.random()-.5)*.6)))];
        x.fillRect(Math.round(k*cw+shift),Math.round(r*ch),Math.ceil(cw)+1,Math.ceil(ch)+1);
      }
    }
    x.globalCompositeOperation="lighter"; x.globalAlpha=.16; x.drawImage(c,5,0); x.drawImage(c,-5,0);   // RGB split ghosts
    x.globalCompositeOperation="source-over"; x.globalAlpha=1;
    for(let n=Math.floor(Math.random()*3);n>0;n--){ const y=Math.random()*H|0, h=6+Math.random()*24|0; x.drawImage(c,0,y,W,h,(Math.random()-.5)*60,y,W,h); }   // tears
    x.fillStyle="rgba(0,0,0,.28)"; for(let y=0;y<H;y+=3) x.fillRect(0,y,W,1);   // scanlines
    if(f%14<11){ x.fillStyle="#f3ff3a"; x.font="bold 13px monospace"; x.textAlign="center"; x.fillText("// SIGNAL MASKED //",W/2,H*.3); }
  };
  draw(); const timer=setInterval(draw,1000/12);
  const track=c.captureStream(12).getVideoTracks()[0];
  glitch={v,timer,track};
}
function stopGlitch(){ if(!glitch) return; clearInterval(glitch.timer); glitch.track.stop(); glitch.v.srcObject=null; glitch=null; }
async function toggleGlitch(){
  if(!camTrack||!callStream) return;
  if(shareTrack) await stopShare();
  if(glitch){ const g=glitch; glitch=null; await swapSentVideo(camTrack); glitch=g; stopGlitch(); }
  else { startGlitch(); await swapSentVideo(glitch.track); }
  const on=!!glitch, b=$("callGlitch"); b.classList.toggle("on",on); b.setAttribute("aria-pressed",String(on));
  paintLocal(); setMyCam(true);   // glitch is a picture, so the camera counts as on
}
async function openCall(voice=false){
  if(callStream) return;   // already in a call
  setCallVoice(voice===true);
  audioForCapture(true);   // iPhone: let the mic work during the call
  startCallTune();         // start it right on the tap (phones only allow sound that starts from a tap)
  makeCallCtx();
  try{
    await getCallMedia();   // camera + mic (with the loud-mode boost), and shows yourself in the little box
    $("callName").textContent=nameOf(dmUser);      // their name
    paintFace($("callFace"), cache.get(dmUser));   // their picture in the middle
    $("callState").textContent="Calling…";
    show($("callScreen")); kickCallTune();
    callRoom=room; callOutcome=null; prefetchIce();
    await joinCallLine(room);   // join the private call channel for this DM
    const m=await sendFields({kind:"call", text:callVoice?"📞 Voice call":"📞 Call"});
    callMsgId=m?.id??null;
    ringTimer=setTimeout(()=>{ if(!pc){ callOutcome="missed"; $("callState").textContent="No answer"; setTimeout(endCall,1500); } },45000);   // give up after 45 seconds
  }catch(err){
    const v=callVoice;
    $("status").textContent="Couldn't use your camera or mic: "+err.message;
    endCall(); showMicHelp(err,v);
  }
}

const CALL_ICON="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAALlJREFUOI3tkyEOwkAQRV9JVU0lCGRVZbcSg+gtOATH4AxoBOEIILgAu7KKBIPA1jS4RZCSdmcSAli+mv0787I/mY0IlGeVD72iMK96s1tF/bs4HK63+3CeGjDJs16A70Ni0Q3cptJLU5hdpD/SAJqaBmz7A6CTc3ZwViMAjO9zxT0KRwVMrnqzpo8j/AFvAP2d//oFJgG/jkTjyUhPAJyz2BbKpfiQlFZ6AAKbZ5XvooRrC1CfD4OZB9rZKoiZOiC6AAAAAElFTkSuQmCC", CALL_ICON_MISSED="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAOpJREFUOI2NkzEOgjAUhn+MA4kHYCdMTAauIKMLM1zFVUfvUCYHDqDRybUsGifDzmAii3HDwVDbR6n9p/a1//de+1oHRGGQdDQWRbEYF7uNI68pkzBIutN5Dy/jAIDZawsAqEuGxeo7nj8bBTKh2fw0R1P8MtYlg5/mqK+cbtUDZEhvFjANRAuoSyaOQVVVatxYgY2muuw9BNIdjEl7ibLBT3MBtQLoZIJYAUyyBoxV8RdgOv8AEEWxYqAd0HVj0EYv43gcGdpWbzACqorjfVnDXXK45EX2H4vKoYEwSLr++9JnCwC3+0HxfADT2Fw6GG1bZAAAAABJRU5ErkJggg==";
/* the call note in the chat: a pixel phone (broken if it was missed), the result, and a Call back button */
function callLogEl(m){
  const missed=/missed|declined/i.test(m.text||""), box=el("div","calllog"+(missed?" missed":""));
  const ic=document.createElement("img"); ic.src=missed?CALL_ICON_MISSED:CALL_ICON; ic.alt=""; ic.width=ic.height=32; box.append(ic);
  box.append(el("span","cltext",(m.text||"📞 Call").replace(/^📞\s*/,"")));
  if(isGroupCallOpen(m)){ const b=el("button","clback","Join"); b.type="button"; b.onclick=e=>{ e.stopPropagation(); openGroupCall(/voice/i.test(m.text||""),m); }; box.append(b); }
  else if(isDm&&m.room===room&&!/^📞 Group/.test(m.text||"")){ const b=el("button","clback","Call back"); b.type="button"; b.onclick=e=>{ e.stopPropagation(); openCall(/voice/i.test(m.text||"")); }; box.append(b); }
  return box;
}
/* the "call line": a private live channel only the 2 people in this DM can use (set up by calls.sql) */
let callLine=null;
function joinCallLine(code){
  leaveCallLine();   // never be on two lines at once
  if(!sb) return Promise.resolve();   // demo mode has no server
  return new Promise(resolve=>{
    callLine=sb.channel("call:"+code,{config:{private:true,broadcast:{self:false}}})
      .on("broadcast",{event:"signal"},({payload})=>onCallSignal(payload))
      .subscribe(s=>{ if(s==="SUBSCRIBED") resolve(); });
  });
}
function sendSignal(type,data={}){ callLine?.send({type:"broadcast",event:"signal",payload:{type,from:user?.id,...data}}); }
function leaveCallLine(){ if(callLine){ if(callLine.local) callLine.close(); else sb.removeChannel(callLine); callLine=null; } }

/* ===== network routes: STUN finds your address; TURN relays the call when a network blocks direct links =====
   The TURN password comes from our "turn-credentials" server function (Cloudflare), so it's never in this file.
   If that isn't set up yet, calls still work on most Wi-Fi using the free STUN servers. */
const STUN_ONLY={iceServers:[{urls:["stun:stun.l.google.com:19302","stun:stun.cloudflare.com:3478"]}]};
let iceCache=null, iceAt=0;
async function getIceServers(){
  if(iceCache&&Date.now()-iceAt<50*60*1000) return iceCache;
  try{
    if(!sb) throw 0;
    const {data,error}=await sb.functions.invoke("turn-credentials");
    if(error||!data?.iceServers?.length) throw error||0;
    iceCache={iceServers:data.iceServers}; iceAt=Date.now(); relayWarned=false; return iceCache;
  }catch(e){ warnNoRelay(); return STUN_ONLY; }
}
/* no relay = calls on mobile data (and many work/school Wi-Fi) usually can't connect. Say so once per call instead of hanging on "Connecting…" */
let relayWarned=false;
function warnNoRelay(){ if(!sb||relayWarned) return; relayWarned=true; setTimeout(()=>{ if(callStream||gc) callFlash("⚠️ The call relay isn't answering. On mobile data the call may not connect: try Wi-Fi.",5000); },1200); }
function prefetchIce(){ getIceServers().catch(()=>{}); }

/* ===== 📶 call quality (2026.10.20k) =====
   Voice matters more than picture: when the signal gets weak, the phone keeps the sound clear and lets the video
   get softer instead of freezing everything. Video is capped so it never floods a slow connection, and a quick
   check every few seconds warns you when the link is struggling, so you know to repeat what you missed. */
async function tuneSender(s,kind,group){
  if(!s?.getParameters||!s.track) return;
  try{ const p=s.getParameters(); if(!p.encodings||!p.encodings.length) p.encodings=[{}]; const e=p.encodings[0], share=!!shareTrack&&s.track===shareTrack;
    if(kind==="audio"){ e.priority="high"; e.networkPriority="high"; }
    else { e.maxBitrate=share?1200000:(group?350000:700000); if(share) delete e.maxFramerate; else e.maxFramerate=24; e.priority="low"; e.networkPriority="low"; p.degradationPreference=share?"maintain-resolution":"balanced"; }
    await s.setParameters(p); }catch(e){}
}
function tunePc(c,group){ try{ c.getSenders().forEach(s=>s.track&&tuneSender(s,s.track.kind,group)); }catch(e){} }
function tuneAll(){ if(pc) tunePc(pc); if(typeof gc!=="undefined"&&gc) gc.peers.forEach(p=>p.pc&&tunePc(p.pc,true)); }
let watchT=null, lastStats=new WeakMap(), weakWarnAt=0;
function unwatchCall(){ clearInterval(watchT); watchT=null; }
function watchCall(){
  if(watchT) return;
  watchT=setInterval(async()=>{
    const list=pc?[pc]:(typeof gc!=="undefined"&&gc)?[...gc.peers.values()].map(p=>p.pc).filter(Boolean):[];
    if(!list.length){ unwatchCall(); return; }
    let weak=false;
    for(const c of list){ try{
      let rtt=0, lost=0, got=0; (await c.getStats()).forEach(r=>{
        if(r.type==="candidate-pair"&&r.nominated&&r.currentRoundTripTime) rtt=Math.max(rtt,r.currentRoundTripTime);
        if(r.type==="inbound-rtp"){ lost+=r.packetsLost||0; got+=r.packetsReceived||0; } });
      const old=lastStats.get(c)||{lost,got}; lastStats.set(c,{lost,got});
      const dl=lost-old.lost, dg=got-old.got, loss=dl+dg>50?dl/(dl+dg):0;
      if(loss>.08||rtt>.5) weak=true;
    }catch(e){} }
    if(weak&&Date.now()-weakWarnAt>20000){ weakWarnAt=Date.now(); callFlash("📶 Weak connection: video may blur or freeze",2600); }
  },3000);
}

/* ===== the video link (WebRTC) =====
   Each phone makes a "peer connection", plugs its camera + mic into it, and they swap 3 kinds of notes over
   the call line: an OFFER (caller: "here's what I can send"), an ANSWER (callee: "ok, here's mine"), and
   ICE notes (possible network routes to reach each phone). Once a route works, video flows phone to phone. */
let pc=null, pendingIce=[];
async function startPeer(){
  const servers=await getIceServers(); if(!callStream) return;
  pc=new RTCPeerConnection(servers); pendingIce=[];
  callStream.getTracks().forEach(t=>{ const s=pc.addTrack(t,callStream); if(t.kind==="video") videoSender=s; else audioSender=s; });   // send my camera + mic
  pc.ontrack=e=>{ $("remoteVideo").srcObject=e.streams[0]; $("callScreen").classList.add("live");   // their video arrived
    if(!callStartAt){ stopCallTune(); playConnectChime(); sendSignal("cam",{on:myCam}); callStartAt=Date.now(); $("callState").textContent="LIVE 0:00"; callTimer=setInterval(()=>{ $("callState").textContent="LIVE "+callClock(Date.now()-callStartAt); },1000); } };
  pc.onicecandidate=e=>{ if(e.candidate) sendSignal("ice",{c:e.candidate.toJSON()}); };   // a route to reach me
  pc.onconnectionstatechange=()=>{ const st=pc?.connectionState;
    if(st==="connected"){ clearTimeout(iceFixT); tunePc(pc); watchCall(); }
    if(st==="disconnected"){ clearTimeout(iceFixT); iceFixT=setTimeout(()=>restartIce(),2500); callFlash("📶 Signal dropped, reconnecting…",2500); }
    if(st==="failed"){ if(iAmOfferer&&!iceRetried){ iceRetried=true; restartIce(); return; } $("callState").textContent="Connection lost"; setTimeout(endCall,1500); } };
}
async function flushIce(){ for(const c of pendingIce.splice(0)){ try{ await pc.addIceCandidate(c); }catch(e){} } }
let iAmOfferer=false, iceRetried=false, iceFixT=null;
async function restartIce(){   // the network changed (wifi <-> data, weak spot): find a new route without hanging up
  if(!pc||!iAmOfferer||pc.connectionState==="connected"||pc.connectionState==="closed") return;
  try{ pc.restartIce?.(); const o=await pc.createOffer({iceRestart:true}); await pc.setLocalDescription(o); sendSignal("offer",{sdp:pc.localDescription.toJSON()}); }catch(e){}
}
async function sendOffer(){ if(!pc) return; iAmOfferer=true; const o=await pc.createOffer(); await pc.setLocalDescription(o); sendSignal("offer",{sdp:pc.localDescription.toJSON()}); }
async function onOffer(sdp){ if(!pc) return; await pc.setRemoteDescription(sdp); await flushIce(); const a=await pc.createAnswer(); await pc.setLocalDescription(a); sendSignal("answer",{sdp:pc.localDescription.toJSON()}); }
async function onAnswer(sdp){ if(!pc) return; await pc.setRemoteDescription(sdp); await flushIce(); }
async function onIce(c){ if(!pc||!pc.remoteDescription){ pendingIce.push(c); return; } try{ await pc.addIceCandidate(c); }catch(e){} }
function stopPeer(){ iAmOfferer=false; iceRetried=false; clearTimeout(iceFixT); unwatchCall(); if(pc){ pc.ontrack=pc.onicecandidate=pc.onconnectionstatechange=null; pc.close(); pc=null; } pendingIce=[]; $("remoteVideo").srcObject=null; $("callScreen").classList.remove("live"); }

function endCall(){
  if(gc) leaveGroup();   // group call: say bye + close every link (and the line), so "end" below goes nowhere
  sendSignal("end");   // tell the other phone we hung up
  leaveCallLine();
  stopPeer(); stopRinging(); stopTalkWatch();
  // the caller updates the call note in the chat: "📞 Call · 2:31", "📞 Missed call" or "📞 Call declined"
  if(callMsgId!=null){
    const kind=callVoice?"Voice call":"Call";
    const text=callStartAt?`📞 ${kind} · ${callClock(Date.now()-callStartAt)}`:callOutcome==="declined"?`📞 ${kind} declined`:callVoice?"📞 Missed voice call":"📞 Missed call";
    api.callLog(callMsgId,text).catch(()=>{});
  }
  callMsgId=null; callOutcome=null; callStartAt=0; clearInterval(callTimer); callTimer=null; setCallVoice(false);
  if(callStream){
    callStream.getTracks().forEach(track => track.stop());
  }
  stopGlitch(); if(shareTrack){ shareTrack.onended=null; shareTrack.stop(); shareTrack=null; } paintShareBtn(); [camTrack,micRaw].forEach(t=>t&&t.stop());
  if(callCtx){ callCtx.onstatechange=null; callCtx.close().catch(()=>{}); }
  camTrack=micRaw=callCtx=micGain=audioSender=videoSender=null; camFacing="user"; myCam=theirCam=true; loudPick=null;
  $("callGlitch").classList.remove("on"); $("callGlitch").setAttribute("aria-pressed","false");
  $("localVideo").classList.remove("back"); $("callScreen").classList.remove("theyoff","uihidden","theysharing","group"); callRoom=null;
  callStream=null; audioForCapture(false); updateCallLook();
  $("localVideo").srcObject=null;
  ["callMute","callCam"].forEach(id=>{ $(id).classList.remove("off"); $(id).setAttribute("aria-pressed","false"); });
  $("localVideo").classList.remove("camoff");
  show($("callRingBar"), false);
  show($("callMainBar"), true);
  show($("callScreen"),false);
}

let callRoom=null;   // which DM the call is in

async function showIncomingCall(m){
  if(callStream||pc||!$("callScreen").classList.contains("hidden")) return;   // already on a call: ignore
  callRoom=m.room; callMsgId=null; setCallVoice(/voice/i.test(m.text||""));
  $("callName").textContent=nameOf(m.user_id);        // who's calling
  paintFace($("callFace"), cache.get(m.user_id));     // their picture in the middle
  $("callState").textContent=callVoice?"Incoming voice call…":"Incoming call…";
  show($("callRingBar"), true);
  show($("callMainBar"), false);
  show($("callScreen"), true);
  // ring: Night Drive plays and the phone buzzes every 2 seconds; stops after 45 seconds like the caller does
  const ring=()=>{ try{ navigator.vibrate&&navigator.vibrate([400,200,400]); }catch(e){} };
  ring(); ringBuzz=setInterval(ring,2000); startCallTune(RING_TONE);
  ringTimer=setTimeout(()=>{ $("callState").textContent="Missed call"; setTimeout(endCall,1200); },45000);
  prefetchIce();
  await joinCallLine(callRoom);   // listen right away, so if they hang up first, the ringing stops
}

async function declineCall(){
  stopRinging(); callBlip("decline");
  if(!callLine) await joinCallLine(callRoom);
  sendSignal("decline");
  leaveCallLine();   // leave first, so endCall doesn't also send "end"
  endCall();
}
$("callDecline").onclick=declineCall;

function onCallSignal(s){
  if(gc){ groupSignal(s); return; }
  if(s.type==="share") $("callScreen").classList.toggle("theysharing",!!s.on);   // they started / stopped sharing their screen
  if(s.type==="decline"){ callOutcome="declined"; stopRinging(); callBlip("decline"); $("callState").textContent="Declined"; setTimeout(endCall,1500); }
  if(s.type==="end"){ callBlip("decline"); leaveCallLine(); endCall(); }   // they hung up (leave first so we don't say "end" back)
  if(s.type==="offer") onOffer(s.sdp).catch(()=>{});     // video link notes (handled by the helpers above)
  if(s.type==="answer") onAnswer(s.sdp).catch(()=>{});
  if(s.type==="ice") onIce(s.c);
  if(s.type==="cam"){ theirCam=!!s.on; loudPick=null; updateCallLook(); }   // they turned their camera on/off
  if(s.type==="vol"){ loudPick=!!s.loud; updateCallLook(); flashVol(); }     // they tapped 🔊
  if(s.type==="accept"){ stopRinging(); $("callState").textContent="Connecting…"; startPeer().then(sendOffer); }   // they picked up: start the video link
}

async function acceptCall(){
  stopRinging(); callBlip("accept"); audioForCapture(true); makeCallCtx();
  try{
    await getCallMedia();   // camera + mic (with the loud-mode boost), and shows yourself in the little box
    show($("callRingBar"), false);
    show($("callMainBar"), true);
    $("callState").textContent="Connecting…";
    if(!callLine) await joinCallLine(callRoom);   // join the private call channel for this DM
    await startPeer();              // get the video link ready...
    sendSignal("accept");           // ...then tell the caller to send the offer
  }catch(err){
    const v=callVoice;
    $("callState").textContent="Couldn't use your camera or mic";
    setTimeout(()=>{ endCall(); showMicHelp(err,v); },1200);
  }
}
$("callAccept").onclick=acceptCall;

/* mute + camera off: the tracks stay connected, they just send silence / black until you turn them back on */
function toggleTrack(kind,btn,offLabel,onLabel){
  if(!callStream) return;
  const tracks=kind==="audio"?[...callStream.getAudioTracks(),...(micRaw?[micRaw]:[])]:callStream.getVideoTracks();
  const off=tracks.some(t=>t.enabled); tracks.forEach(t=>t.enabled=!off);
  btn.classList.toggle("off",off); btn.setAttribute("aria-pressed",String(off)); btn.setAttribute("aria-label",off?onLabel:offLabel);
  if(kind==="video") $("localVideo").classList.toggle("camoff",off);
}
$("callMute").onclick=()=>toggleTrack("audio",$("callMute"),"Mute","Unmute");
$("callCam").onclick=()=>setMyCam(!myCam);
$("callFlip").onclick=flipCam;
$("callGlitch").onclick=toggleGlitch;
$("callVol").onclick=()=>{ loudPick=!callLoud(); sendSignal("vol",{loud:loudPick}); updateCallLook(); flashVol(); };
function flashVol(){ callFlash(callLoud()?"🔊 LOUD · you both sound louder":"👂 QUIET · normal volume, good for your ear"); }
let flashT=0;
function callFlash(text,ms=1800){ const f=$("callFlash"); f.textContent=text; f.classList.add("on"); clearTimeout(flashT); flashT=setTimeout(()=>f.classList.remove("on"),ms); }
/* 👁 hide the buttons: tap HIDE, or tap the video. Tap anywhere to bring them back */
function setCallUi(hidden){ $("callScreen").classList.toggle("uihidden",!!hidden); if(hidden) callFlash("Tap anywhere to bring the buttons back",1600); }
$("callHide").onclick=e=>{ e.stopPropagation(); setCallUi(true); };
$("callScreen").addEventListener("click",e=>{
  const cs=$("callScreen"); if(!cs.classList.contains("live")) return;
  if(cs.classList.contains("uihidden")){ e.preventDefault(); e.stopPropagation(); setCallUi(false); return; }
  if(e.target.closest("button,#localVideo,.callbar")) return;
  setCallUi(true);
},true);
/* drag your own video box to any corner; it snaps to the closest one and remembers it */
(()=>{
  const lv=$("localVideo"), cs=$("callScreen");
  try{ const c=LS.get("nl-lv-corner"); if(["tl","tr","bl","br"].includes(c)) cs.dataset.lv=c; }catch(e){}
  let start=null;
  lv.addEventListener("pointerdown",e=>{ if(cs.classList.contains("uihidden")) return; start={x:e.clientX,y:e.clientY,moved:false}; lv.setPointerCapture(e.pointerId); });
  lv.addEventListener("pointermove",e=>{ if(!start) return; const dx=e.clientX-start.x, dy=e.clientY-start.y;
    if(!start.moved&&Math.hypot(dx,dy)<6) return; start.moved=true; lv.classList.add("dragging");
    lv.style.translate=`${dx}px ${dy}px`; });
  const end=e=>{ if(!start) return; const s0=start; start=null; lv.classList.remove("dragging"); if(!s0.moved){ lv.style.translate=""; return; }
    const r=lv.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
    const corner=(cy<innerHeight/2?"t":"b")+(cx<innerWidth/2?"l":"r");
    const before=lv.getBoundingClientRect(); lv.style.translate=""; cs.dataset.lv=corner; const after=lv.getBoundingClientRect();
    lv.animate([{translate:`${before.left-after.left}px ${before.top-after.top}px`},{translate:"0 0"}],{duration:220,easing:"cubic-bezier(.2,.9,.3,1.2)"});
    try{ LS.set("nl-lv-corner",corner); }catch(e){} };
  lv.addEventListener("pointerup",end); lv.addEventListener("pointercancel",end);
})();

/* 📞 opens a small picker: 🎧 voice call or 📹 video call */
$("callBtn").onclick=e=>{ e.stopPropagation(); const open=$("callPick").classList.contains("hidden"); show($("callPick"),open); $("callBtn").setAttribute("aria-expanded",String(open)); };
$("callPickVoice").onclick=()=>{ show($("callPick"),false); isDm?openCall(true):openGroupCall(true); };
$("callPickVideo").onclick=()=>{ show($("callPick"),false); isDm?openCall(false):openGroupCall(false); };
document.addEventListener("click",e=>{ if(!$("callPick").classList.contains("hidden")&&!e.target.closest("#callPick,#callBtn")) show($("callPick"),false); });
$("callEnd").onclick=()=>{ callBlip("decline"); endCall(); };

/* ===== 🖥️ SCREEN SHARE (2026.10.18r) =====
   Same trick as the camera flip: getDisplayMedia() hands us the screen as a video track, and replaceTrack()
   sends it in place of the camera, no redial. Phones' browsers can't share their screen, so the button
   only shows on computers (phones can still watch). */
let shareTrack=null;
const canShare=()=>!!navigator.mediaDevices?.getDisplayMedia&&!(BROWSER.ios||BROWSER.android||isIOS||/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent));
function paintShareBtn(){ const on=!!shareTrack, b=$("callShare"); b.classList.toggle("on",on); b.setAttribute("aria-pressed",String(on)); b.setAttribute("aria-label",on?"Stop sharing your screen":"Share your screen"); $("callShareTxt").textContent=on?"STOP":"SHARE"; }
async function startShare(){
  if(!callStream||shareTrack||callVoice) return;
  let t;
  try{ t=(await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:15,max:30}},audio:false})).getVideoTracks()[0]; }
  catch(e){ if(e?.name!=="NotAllowedError"&&e?.name!=="AbortError") callFlash("Couldn't share your screen"); return; }   // closing the picker isn't an error
  if(!callStream||!t){ t?.stop(); return; }   // the call ended while the picker was open
  if(glitch) await toggleGlitch();
  try{ t.contentHint="detail"; }catch(e){}   // keep text sharp
  shareTrack=t; t.onended=()=>stopShare();   // the browser's own "Stop sharing" bar
  await swapSentVideo(t);
  if(!myCam) setMyCam(true);   // a shared screen counts as your camera being on
  sendSignal("share",{on:true}); paintShareBtn(); paintLocal(); callFlash("🖥️ Sharing your screen");
}
async function stopShare(){
  const t=shareTrack; if(!t) return;
  shareTrack=null; t.onended=null; t.stop();
  if(callStream&&camTrack) await swapSentVideo(glitch?glitch.track:camTrack);   // back to your camera
  sendSignal("share",{on:false}); paintShareBtn(); paintLocal();
}
$("callShare").onclick=()=>shareTrack?stopShare():startShare();

/* ===== 👥 GROUP CALLS in rooms (2026.10.18r) =====
   "Mesh": everyone links straight to everyone else, so it's capped at 4 people (each phone sends its video
   once per person). Everybody meets on the room's call line ("call:<room code>", only room members can join)
   and uses its PRESENCE list to see who's in the call. For each pair, the one with the smaller user id sends
   the offer, so two phones never offer to each other at the same time. */
const GC_MAX=4;
let gc=null;   // {room, voice, peers: Map(uid -> {pc, vs, ice, tile, ready}), msgId, msgAt, aloneT}

/* demo mode has no server: tabs in the same browser talk over a BroadcastChannel instead (same shape as a Supabase channel) */
function localLine(topic){
  const bc=new BroadcastChannel("nl-"+topic), hs={broadcast:[],sync:[]}, others=new Map(); let mine=null, me=null, closed=false;
  const sync=()=>hs.sync.forEach(f=>f());
  bc.onmessage=({data:d})=>{ if(closed||!d) return;
    if(d.k==="sig") hs.broadcast.forEach(f=>f({payload:d.p}));
    if(d.k==="pres"){ others.set(d.key,d.meta); if(d.ask&&mine) bc.postMessage({k:"pres",key:me,meta:mine}); sync(); }
    if(d.k==="gone"){ others.delete(d.key); sync(); } };
  return { local:true,
    on(type,filter,cb){ hs[type==="presence"?"sync":"broadcast"].push(cb); return this; },
    subscribe(cb){ setTimeout(()=>cb("SUBSCRIBED"),0); return this; },
    async track(meta){ mine=meta; me=user.id; bc.postMessage({k:"pres",key:me,meta,ask:true}); sync(); },
    presenceState(){ const st={}; others.forEach((m,k)=>st[k]=[m]); if(mine) st[me]=[mine]; return st; },
    send(msg){ if(!closed) bc.postMessage({k:"sig",p:msg.payload}); },
    close(){ if(closed) return; closed=true; if(mine) bc.postMessage({k:"gone",key:me}); bc.close(); } };
}
function joinGroupLine(code){
  leaveCallLine();
  const ch=sb?sb.channel("call:"+code,{config:{private:true,broadcast:{self:false},presence:{key:user.id}}}):localLine("call:"+code);
  ch.on("broadcast",{event:"signal"},({payload})=>onCallSignal(payload)).on("presence",{event:"sync"},()=>gSync());
  callLine=ch;
  return Promise.race([
    new Promise(res=>ch.subscribe(async st=>{ if(st==="SUBSCRIBED"){ try{ await ch.track({at:Date.now()}); }catch(e){} res(); } })),
    new Promise((res,rej)=>setTimeout(()=>rej(new Error("Couldn't reach the call. Check your connection.")),12000))]);
}
const isGroupCallOpen=m=>/^📞 Group/.test(m.text||"")&&!/·/.test(m.text)&&Date.now()-new Date(m.created_at).getTime()<3*3600e3&&!gc;
const roomTitle=code=>{ const r=inboxRows.find(x=>x.code===code); return r?.name||(code===room&&roomName)||"#"+code; };

async function openGroupCall(voice=false,joinMsg=null,opt={}){
  if(callStream||gc) return;   // already in a call
  const code=joinMsg?joinMsg.room:(opt.code||room); if(!code||String(code).startsWith("dm-")) return;
  if(opt.silent) loungeUnwatch(code);   // don't watch a lounge from outside while we're in it
  gc={room:code, voice:!!voice, peers:new Map(), msgId:joinMsg?.id??null, msgAt:joinMsg?new Date(joinMsg.created_at).getTime():Date.now(), aloneT:null, full:false};
  setCallVoice(voice===true); audioForCapture(true); makeCallCtx();
  try{
    await getCallMedia();
    const cs=$("callScreen"); cs.classList.add("group"); theirCam=true; updateCallLook();
    $("callName").textContent=roomTitle(code); paintFace($("callFace"),meProfile||cache.get(user.id));
    $("callState").textContent=joinMsg||opt.silent?"Joining…":"Starting…"; $("callGrid").replaceChildren(); $("callGrid").dataset.n="0";
    show($("callScreen")); callRoom=code; prefetchIce();
    await joinGroupLine(code);
    if(!gc) return;   // hung up while joining
    if(!joinMsg&&!opt.silent){ const m=await sendFields({kind:"call",text:voice?"📞 Group voice call":"📞 Group call"}); if(gc){ gc.msgId=m?.id??null; gc.msgAt=Date.now(); } }
    if(opt.silent) gc.lounge=true;   // 🔊 a voice lounge: nobody gets rung, and you can sit in it alone
    gPaintState();
    if(!gc.lounge) gc.aloneT=setTimeout(()=>{ if(gc&&!callStartAt){ callFlash("Nobody joined this time",2000); setTimeout(endCall,2000); } },120000);   // give up after 2 minutes alone
  }catch(err){
    const v=voice===true; endCall();
    if(/reach the call/.test(err?.message||"")) toast("📞 Call",err.message); else showMicHelp(err,v);
  }
}

/* who's here? (runs every time someone joins or leaves the line) */
function gSync(){
  if(!gc||!callLine) return;
  const st=callLine.presenceState();
  const list=Object.entries(st).map(([uid,arr])=>({uid,at:Math.min(...arr.map(x=>+x.at||0))})).sort((a,b)=>a.at-b.at||(a.uid<b.uid?-1:1));
  if(!list.some(x=>x.uid===user.id)) return;   // our own join hasn't shown up yet
  const inCall=list.slice(0,GC_MAX).map(x=>x.uid);
  if(!inCall.includes(user.id)){ if(!gc.full){ gc.full=true; callFlash(`This call is full (${GC_MAX} people max)`,2200); setTimeout(endCall,2200); } return; }
  inCall.forEach(uid=>{ if(uid!==user.id&&!gc.peers.has(uid)) gPeer(uid,user.id<uid); });
  [...gc.peers.keys()].forEach(uid=>{ if(!inCall.includes(uid)) gDrop(uid); });
}
function gTile(uid){
  gSelf(); const t=el("div","gtile"+(callVoice?" camoff":"")), v=document.createElement("video"), f=el("span","face"), b=el("b","",nameOf(uid));
  v.autoplay=true; v.playsInline=true; t.append(v,f,b); t.dataset.uid=uid;
  const nf=el("button","gfilter","🎧 Filter"); nf.type="button"; nf.setAttribute("aria-pressed","false"); nf.setAttribute("aria-label","Filter out this person's background noise (only for you)");
  nf.onclick=e=>{ e.stopPropagation(); gFilterToggle(uid); }; t.append(nf);
  paintFace(f,cache.get(uid)); ensureProfiles([uid]).then(()=>{ paintFace(f,cache.get(uid)); b.textContent=nameOf(uid); }).catch(()=>{});
  $("callGrid").append(t); gLayout(); return t;
}
/* ===== 🎧 background-noise filter, per person, only for you (2026.10.20p) =====
   Someone's dog, TV or fan coming through? Tap 🎧 on their tile. Their sound goes through a voice band
   (cuts low rumble, mains hum and hiss) and a "noise gate" that quiets them when they're not talking.
   Nothing changes for them or anyone else in the call. */
function gFilterToggle(uid){
  const p=gc?.peers.get(uid); if(!p) return;
  if(p.nf) gFilterOff(p);
  else { const st=p.tile.querySelector("video").srcObject; if(!st||!st.getAudioTracks().length){ callFlash("Their sound hasn't connected yet"); return; } gFilterOn(p,st); }
  const on=!!p.nf, btn=p.tile.querySelector(".gfilter"); btn.setAttribute("aria-pressed",String(on)); btn.textContent=on?"✨ Filtered":"🎧 Filter";
  callFlash(on?`✨ Filtering ${nameOf(uid)}'s background noise (only you hear the change)`:`🎧 ${nameOf(uid)} unfiltered`,2200);
}
function gFilterOn(p,stream){
  let ctx; try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ callFlash("This browser can't filter sound"); return; }
  ctx.resume().catch(()=>{});
  const src=ctx.createMediaStreamSource(stream);
  const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=150; hp.Q.value=.9;    // rumble, traffic, desk bumps, deep TV bass
  const hp2=ctx.createBiquadFilter(); hp2.type="highpass"; hp2.frequency.value=150; hp2.Q.value=.6;  // (twice, so it cuts much harder)
  const hum=ctx.createBiquadFilter(); hum.type="notch"; hum.frequency.value=60; hum.Q.value=8;     // electrical hum
  const hum2=ctx.createBiquadFilter(); hum2.type="notch"; hum2.frequency.value=120; hum2.Q.value=8; // and its echo
  const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=4000; lp.Q.value=.7;   // hiss, clatter, fans
  const lp2=ctx.createBiquadFilter(); lp2.type="lowpass"; lp2.frequency.value=4000; lp2.Q.value=.6;
  const lev=ctx.createDynamicsCompressor(); lev.threshold.value=-24; lev.ratio.value=3; lev.knee.value=10; lev.attack.value=.005; lev.release.value=.2;   // evens their voice out after all that cutting
  const boost=ctx.createGain(); boost.gain.value=.9;   // the leveller already lifts quiet bits, so no extra boost: same volume as unfiltered
  const an=ctx.createAnalyser(); an.fftSize=1024; const gate=ctx.createGain(); gate.gain.value=1;
  src.connect(hp).connect(hp2).connect(hum).connect(hum2).connect(lp).connect(lp2); lp2.connect(an); lp2.connect(gate).connect(lev).connect(boost).connect(ctx.destination);
  const buf=new Float32Array(an.fftSize); let floor=.004, hold=0;
  const t=setInterval(()=>{   // the gate: open while they talk, nearly closed in the gaps
    an.getFloatTimeDomainData(buf); let s=0; for(let i=0;i<buf.length;i++) s+=buf[i]*buf[i];
    const rms=Math.sqrt(s/buf.length), loud=rms>Math.max(.008,floor*3.2);
    if(rms<floor) floor=floor*.8+rms*.2; else if(!loud) floor=floor*.995+rms*.005;   // learns how loud their background is
    hold=loud?10:Math.max(0,hold-1);   // stay open ~¼ s after a word so endings aren't clipped
    const want=hold>0?1:.03; gate.gain.setTargetAtTime(want,ctx.currentTime,want>.5?.01:.07);
  },25);
  p.tile.querySelector("video").muted=true;   // the tile keeps playing (Chrome needs that), you hear the cleaned copy instead
  p.nf={ctx,t,gate};
}
function gFilterOff(p){ if(!p?.nf) return; clearInterval(p.nf.t); p.nf.ctx.close().catch(()=>{}); p.nf=null; const v=p.tile.querySelector("video"); if(v) v.muted=false; }
function gLayout(){ const g=$("callGrid"), me=g.querySelector(".gtile.me"); if(me&&me!==g.lastElementChild) g.append(me); g.dataset.n=String(Math.min(4,g.children.length)); }
/* your own box in the grid (muted, so you don't hear yourself) */
function gSelf(){
  const g=$("callGrid"); let t=g.querySelector(".gtile.me");
  if(!t){ t=el("div","gtile me live"); const v=document.createElement("video"), f=el("span","face"); v.autoplay=v.playsInline=v.muted=true; t.append(v,f,el("b","","You")); paintFace(f,meProfile||cache.get(user.id)); g.append(t); }
  const v=t.querySelector("video"), src=$("localVideo").srcObject; if(v.srcObject!==src){ v.srcObject=src; v.play().catch(()=>{}); }
  t.classList.toggle("camoff",!myCam||callVoice); t.classList.toggle("back",$("localVideo").classList.contains("back")); gLayout();
}
function gPeer(uid,offerer){
  const p={uid,pc:null,vs:null,ice:[],tile:gTile(uid)}; gc.peers.set(uid,p);
  p.ready=(async()=>{
    const servers=await getIceServers(); if(!gc||gc.peers.get(uid)!==p||!callStream) return;
    const pc=p.pc=new RTCPeerConnection(servers);
    callStream.getTracks().forEach(t=>{ const sn=pc.addTrack(t,callStream); if(t.kind==="video") p.vs=sn; });   // my camera + mic, to this person
    pc.ontrack=e=>{ const v=p.tile.querySelector("video"); if(v.srcObject!==e.streams[0]){ v.srcObject=e.streams[0]; v.play().catch(()=>{}); if(p.nf){ gFilterOff(p); gFilterOn(p,e.streams[0]); } } };   // the stream is ready, but it only counts as LIVE once the link actually connects (below)
    pc.onicecandidate=e=>{ if(e.candidate) sendSignal("ice",{to:uid,c:e.candidate.toJSON()}); };
    const markLive=()=>{ clearTimeout(p.slowT); clearTimeout(p.retryT); if(!p.tile.classList.contains("live")){ p.tile.classList.add("live"); gLive(); } };
    pc.onconnectionstatechange=()=>{ if(gc?.peers.get(uid)!==p) return; const st=pc.connectionState;
      if(st==="connected"){ markLive(); tunePc(pc,true); watchCall(); }
      if(st==="failed"){
        if(offerer&&!p.retried){ p.retried=true; gRestart(p); return; }   // one more try on a fresh route
        if(!offerer&&!p.retried){ p.retried=true; return; }               // the other phone is retrying: give it a moment
        callFlash(`Couldn't connect to ${nameOf(uid)}. If either of you is on mobile data, try Wi-Fi.`,5000); gDrop(uid);
      } };
    p.slowT=setTimeout(()=>{ if(gc?.peers.get(uid)===p&&!p.tile.classList.contains("live")) callFlash(`Still connecting to ${nameOf(uid)}… If you're on mobile data, Wi-Fi usually fixes this.`,4500); },15000);
    p.retryT=setTimeout(()=>{ if(gc?.peers.get(uid)===p&&!p.tile.classList.contains("live")&&offerer&&!p.retried){ p.retried=true; gRestart(p); } },45000);   // stuck without ever "failing": try a fresh route anyway
    if(offerer){ const o=await pc.createOffer(); await pc.setLocalDescription(o); sendSignal("offer",{to:uid,sdp:pc.localDescription.toJSON()}); }
  })().catch(()=>{});
  gPaintState(); return p;
}
async function gRestart(p){   // find a new route without leaving the call
  try{ p.pc.restartIce?.(); const o=await p.pc.createOffer({iceRestart:true}); await p.pc.setLocalDescription(o); sendSignal("offer",{to:p.uid,sdp:p.pc.localDescription.toJSON()}); }catch(e){}
}
function gDrop(uid){
  const p=gc?.peers.get(uid); if(!p) return; clearTimeout(p.slowT); clearTimeout(p.retryT);
  gc.peers.delete(uid); gFilterOff(p); try{ p.pc&&(p.pc.ontrack=p.pc.onicecandidate=p.pc.onconnectionstatechange=null, p.pc.close()); }catch(e){}
  p.tile.querySelector("video").srcObject=null; p.tile.remove(); gLayout(); gPaintState();
}
function gLive(){   // someone's picture/sound arrived
  if(!callStartAt){ clearTimeout(gc.aloneT); playConnectChime(); callStartAt=Date.now(); clearInterval(callTimer); callTimer=setInterval(gPaintState,1000); }
  sendSignal("cam",{on:myCam}); if(shareTrack) sendSignal("share",{on:true});   // so the newcomer sees the right thing
  gPaintState();
}
function gPaintState(){
  if(!gc) return;
  const live=[...gc.peers.values()].some(p=>p.tile.classList.contains("live"));
  $("callScreen").classList.toggle("live",live);
  $("callState").textContent=live?`LIVE ${callClock(Date.now()-callStartAt)} · ${gc.peers.size+1} IN CALL`:gc.peers.size?"Connecting…":gc.lounge?"🔊 In the lounge · hang out until someone hops in":"Waiting for others…";
}
async function groupSignal(s){
  if(!gc||!s||(s.to&&s.to!==user.id)) return;
  const from=s.from; if(!from||from===user.id) return;
  if(s.type==="bye"){ gDrop(from); return; }
  if(s.type==="cam"||s.type==="share"){ const t=gc.peers.get(from)?.tile; if(t) t.classList.toggle(s.type==="cam"?"camoff":"sharing",s.type==="cam"?!s.on:!!s.on); return; }
  if(!["offer","answer","ice"].includes(s.type)) return;
  const p=gc.peers.get(from)||(s.type!=="answer"?gPeer(from,false):null); if(!p) return;
  await p.ready; const pc=p.pc; if(!pc||gc?.peers.get(from)!==p) return;
  try{
    if(s.type==="offer"){ await pc.setRemoteDescription(s.sdp); for(const c of p.ice.splice(0)) await pc.addIceCandidate(c).catch(()=>{}); const a=await pc.createAnswer(); await pc.setLocalDescription(a); sendSignal("answer",{to:from,sdp:pc.localDescription.toJSON()}); }
    if(s.type==="answer"){ await pc.setRemoteDescription(s.sdp); for(const c of p.ice.splice(0)) await pc.addIceCandidate(c).catch(()=>{}); }
    if(s.type==="ice"){ if(!pc.remoteDescription) p.ice.push(s.c); else await pc.addIceCandidate(s.c).catch(()=>{}); }
  }catch(e){}
}
function leaveGroup(){
  const g=gc; if(!g) return;
  let others=0; try{ others=Object.keys(callLine?.presenceState()||{}).filter(k=>k!==user.id).length; }catch(e){}
  sendSignal("bye");
  // last one out closes the note in the chat, so it stops showing Join
  if(!others&&!g.full&&g.msgId!=null) api.callLog(g.msgId,`${g.voice?"📞 Group voice call":"📞 Group call"} · ${callClock(Date.now()-g.msgAt)}`).catch(()=>{});
  clearTimeout(g.aloneT); unwatchCall();
  [...g.peers.keys()].forEach(gDrop);
  gc=null; leaveCallLine();
  $("callGrid").replaceChildren(); $("callGrid").dataset.n="0";
  if(g.lounge) setTimeout(loungeWatchAll,600);
}
/* someone started a call in a room: a banner you can tap to join (no full-screen ringing for rooms) */
async function showGroupInvite(m){
  if(gc||callStream) return;
  const row=inboxRows.find(r=>r.code===m.room); if((row?.notify||"all")==="off") return;
  await ensureProfiles([m.user_id]).catch(()=>{});
  const voice=/voice/i.test(m.text||"");
  try{ navigator.vibrate&&navigator.vibrate([200,100,200]); }catch(e){} if(typeof sfx==="function") sfx("notify");
  toast(voice?"🎧 Group voice call":"📹 Group call",`${nameOf(m.user_id)} started a call in ${roomTitle(m.room)}. Tap to join.`,()=>openGroupCall(voice,m));
}
