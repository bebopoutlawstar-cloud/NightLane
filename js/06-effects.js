/* ================= FULL-SCREEN EFFECTS ================= */
/* ================= PIXEL ART EFFECTS + ICONS =================
   Effects: Super Pixel Effects Gigapack (free) by Will Tice / unTied Games, recolored in NightLane neon.
   Icons: Assorted Icons by Quintino Pixels (CC0). Font: monogram by datagoblin (CC0).
   pxfx(name,{at,scale,ms}) plays an effect once on top of everything; pxfxEl(name,…) makes one you can put inside something. */
/* (moved to js/00-media.js) */
const PX_ICONS={"potion":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABm0lEQVR42u2WMUgCYRTHf0o0hEq42dotEbS0FKVONTQUBEZLQ+0NNlyDLYEuRjQ4NDS41+bQUlB3Sro02NJybULgcER3NEnXoCeWCnfn6RH4X+7ed9x77/u/9/2/B2OM4TF8A/xruOHLaQKGmtoFoPj0DcDWw7Ujf/5B6DODj7oERu5WIrYwx+z0FAB5+RmAw424bZ+OS5BIZoitrWYB5LuSeHORGn0J3ID/Px5DI3crme/Z1lN02gN2GTCqtTryXakzOPuxRQCqtXovfXAtAUPXdeSX13bztYKLJhvyyyu6rttKwmcneDGaZln5pCyE2h9MO765hFSoABAtnhAIBCz591kNnp8/Zk/tv7GJ9yYpjYhIWQhZTsJyCYRw8NfOgS57aMfw7eOrTXcn/tqe6kAjIv6yTXl2JYH0+VUX9b3o95/de6+EZSGEomqmVrh3DBPJDAePWt+6Tx6tIxUqKKoGlzuWVdGObPZNwiyHomrI2zPYuRnt3gVNKV45RQgH24uKqgHYDj7wQPK3OZ3MBI4HkiEMuWOM4Q1+AAg3m8V3/yJlAAAAAElFTkSuQmCC","ring":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABcElEQVR42u2UsUoDQRCGv9wLiGmE5AkOJK1ISGFrugOxtkhlZasIgo2FYKM2AQs7EQIWQqpEvcrK4wpFkJTpvMMyha5F4nKbhLi7l2iRG9hmbm7+b2dnBjLLbN4tl/J/kTZfGgAh1vbVZO1D45yOrfhz4Yheq6w6+0DiLwAA6BQDeq2yPACn7BpB2ACI971VBaJTDAA4a38aQ5gCCM+tAuBePIxUQwlsrmtBODbitUaeyI9Z2roZAQHYbgZEfswgXkxjCoTnVqmUCgD4YVd+qHsRAPnKovRFfszl2zIAO1f1iTraAE/nx9zdv0qHH3ZpvNyOBC44JQAONlaG43K2TyA8t6qIA8mkyvn4CvsA148AsmqpemA4SfIJ0prVHphU0pkDmN7+tyZ0/vP2qVfxuIZNToFOtZwpll2Km1RLByCXnPeTzdrPdlNOUlz39tabUAoNZl3xDcR1e8WkmQTAOJAxXa+d26abxQxyZpbZHNs39CqRbRMRFIcAAAAASUVORK5CYII=","gem":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABtUlEQVR42mNgGAWjYIABI4X6/1NqHiUO+L/dsILB8s4nBgYGBobjKnwMnuc7SDaTaahGwf+LT17BOYcuXYfQu48wrO6vJslcchzw/8uXLwzzD53tYmBgYLDT0yw7dOl6F5J8Wa6XPdFmM5Lj85vhRxns/wYwsARDBP+shdAHmTcwrH23nMGmN5uBWEcwUWr5k8jXcAX2fwMYgoUiGY4UT2WYvO0gtlxCtgPglqMDiRBRrBoS7YwZQgtbiXIEsfGOgt92//9/8cmr/y8tIDS6fLhm2P/J2w7+J+QAFlJcsc19N4P93wCIxmDUUPjKgJoOqF0OMPLw8DB47XRlOMi8AaciZDliEyLNCqJDu49QvSQkKhQYGBgY/nnoE10gkRwCdz98g7NllmPmgLXvljPYudrQtCj+f/HJKwaJEFEGlmBIOSARIgoPlZfVQgyklIQUpwHkUFj7bjmDnZ4mSfrJcQCjvowYw4s1r+FFMHLK15cRIylkyQ4BWA2InP2ITfnUAv8vPnn1/233//+rrNf/Dy1sJVjqUT0NKAtwMezdsGFAGzT/v3z5QrbvqeaIgbR8FIwCigEAKwvOHEuaGEQAAAAASUVORK5CYII=","scroll":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABVklEQVR42u2WMUvDUBSFTyRZm0LGQpBHEUJAECfJ4urmP3B16e5PcDaLq/+gWzdxKZ1ECJSASAgBx0LSNcNz0Lz01T6TZ29wMGd7Ibzv3HvuDQF69frvMojv47r3Uxrgj3cTAIDtlnCYj8PjSSPjgAqeRiHY+RFstxQP0yjc1ZVODAg5zJfOTSYMisy/IACAVbL8ZgKAMg5zH/js5AYAMAxi5HNPCe8iAgE/e1sDAOKrdyV8lSyVF5m/bbv3MPo8BWthJMdoJ/z08l4Zt0GR9zCIAQCL8aA2Vuf+I8fUWbPtlhaZBYcB+dwTJtpUrWuAp1Eo5Vhl7bD6pcV40LpqnSHkz9PrrYrVU37xcluBDfItKDILtlsieXptgtOuocN8FJklmWj7kSHrwCa0yCxpHvaBtzFgVENFXblWB6rB2zRBAde5QFrFtjtO/UfEO/yT6tWr19/pA1Ubf0rXXT1gAAAAAElFTkSuQmCC","key":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABPUlEQVR42mNgGAWjYIABIxXN+k+O+dRywP8Hi7MYjh1/Chd4dusFQ8mekwTtYKSm5c9uvYALSqlJEO0Iiiz/dGLu/2VZ/v97XMz/Q6MBjtHEaeOAB4uz8FlC0BFMlLoAOd6xAZ84P7zyTLTOZu9un6V5Vv6/LMsfPYj/ExE91A2BZVn+yBYzLMvyZzh2/CnBXMBIjSy4ZuFZhgv33zB4uevQtRxAyf9Qy0g2n4mC/I9uOSMWTJO6AJvPyQ5JRjJSPElxTM0o+P9gcRZVLSe5yF2W5f8/RlmZqmU7IynBvm3nFQYDRREGBgYGqoUAE7HBvm3nFYYld+8yMDAwMITEGyMXPPQJduTqFkvRS7syHmY5zDFI9T1d0sD/HhdzBik1CbhA1LSNVE39hNIAI3IRS23LSW3x/mcYBaOABgAA4KvQySiHXiAAAAAASUVORK5CYII=","goldkey":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABwElEQVR42u2XvWsUQRjGfxsOwm3wHxBSWQXZQiSQA2Wz4EehxO6aYJ/SIoWkCFeEs9lGS1s7sTnxKygcg0KQEAhccY1prQKCvNlEEJ4UyQ4XzYWIOwnoveXs7P6e2feZ952BUZxzRAG+qT/hjFUMllxCkceYGWaGXDJMVLXgTtZUkccCZGaSS9Te3lN7e09yiYaJqP0t/HCFQJ8oLfyD7Okzbj2Gz+8Ek4FWLpfIzPT2ykM9mHkiuUSdrCm5RLPzm5qd3/Rjof4AH6+v0PjyndXLFwG4130OXZC7D8Du+hYwRTATro4fgG//+MrO1TXv+ijt8bI1RbxYcPPOq3AGLNNgZt6M5bhc4o0Zsg4IoJM1mWv1idIeZsaNT0t+wlq9S5T2juVVUgc6WfNgNWmPIo+Z2GgA8OFam4WZ2mBqKveAijxmrtX3QurTl9hd3+Lbmwu8+LnMo+W6F1R5/suCM5BnDVTEI944C/ixFfK84OG23Qj+z8HHTgFnYqNx2FR80dFZCPgN/v713cpF1E48aPwCL7taKST0oVRFHntgWW5LQfFiUUkzi07rgSMvDelswXfBSYfL0PcCBb5LjOI/jn3DIULtt9ahvQAAAABJRU5ErkJggg==","coin":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABrElEQVR42u1Wq3LCQBQ9ZBim3eBgcKsqqqp2EPkNvgJXU1eNw+D4ivxDVUQmH4CIWsc0MkkngtSwl90UyObRqWjODDOIJOeeR24WGDDgjzHqcG/ZxzNHbYmzLcPj8gkAkPgFAOBhE2E6nTZ69rgpuU6sMFtNAAApgM/XZwDAfHcobYZw2pInfoFUBEhFYFzEuATjEtmW3Yup1QBEnocxZqsJ3MiDs18YQ2SS06/PDpD6xC8ulosAbuTRf1K1X1wcecvu8jhN1TMuyQVnv6AodJzWR5zWRysXHFv1KvdqARmXcCOPnABA0TAuVSnLTg7o6lMRIA9jQ10exgZ5KgLrHjR9DeFGHnItilvXYBMZXejcgWrOdfh6F1YujG3JlfJUBIA4O3G2PpMcj0v86EZvm1AvWDX3THJ6LXWYyg/dIsjDmIqlBlLFvEaub8Q6J2wGGJ2XCWariVEsXaW+lBK/oPx7W0SKWCftqr7p57gsP14oEn0hVdUrzHeHWo5GA+hfQ1XC6mbUl1Kd/W0OJOTCrbKqmGzUtz4RVQ8lV2y3fnbbM2H5S+fMAQP+Ib4BpZ7UcIeyNKkAAAAASUVORK5CYII=","eye":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABJ0lEQVR42mNgGAWjYKQDRjL1/aeWeUxkWPz/+JWHDL/+/0fBx688hMvTKrT+H7/y8P+v///x4uNXHtLEEQQtpqUjSLKcVEcwERHsZLscKV2QnwiNteUGLBv+P37lIYoDzl59xPAtJwRFke3+UzgNOHv1EQMDAwODpY48TruYSPE9zPKGi3/hYocdzSgKAaLKgbNXH8Etarj4l2Hvu7MoPj/saAb3LU0coLY8gsHAmgWvGvSooUlJCHOEs5AxnE/IYRQ5AF+wfq6xwnAYtR3ACE29DBeO/iE6dNABvhxAVBScvfoIb1aDAd6WYzRJA/BQQLZgQxY7QcvPXn1E0Pek1N//f/3/D89ysOC+cPQP1tAh1vIhVR2jN0jwWUyS5QPeJBsFo2AUAACLEj01XB4yaQAAAABJRU5ErkJggg=="};
function pxfxEl(name,{scale=2,ms,loops=1,cls=""}={}){
  const a=PXFX_ART[name]; if(!a) return null; const [w,h,n,fms,src]=a, f=ms||fms;
  const d=document.createElement("i"); d.className="pxfx "+cls; d.setAttribute("aria-hidden","true");
  d.style.cssText=`width:${w*scale}px;height:${h*scale}px;background-image:url(${src});background-size:${w*n*scale}px ${h*scale}px;--end:-${w*n*scale}px;animation:pxfxrun ${n*f}ms steps(${n}) ${loops==="loop"?"infinite":loops} both`;
  return d;
}
let pxfxLayer=null;
function pxfx(name,{at=null,scale,ms,loops=1,dy=0}={}){
  if(!fxEnabled()||reducedMotion()) return null;
  const a=PXFX_ART[name]; if(!a) return null;
  if(!pxfxLayer){ pxfxLayer=document.createElement("div"); pxfxLayer.id="pxfxLayer"; pxfxLayer.setAttribute("aria-hidden","true"); document.body.append(pxfxLayer); }
  const s=Math.max(1,Math.min(scale||3,(innerWidth-24)/a[0]));
  let x=innerWidth/2, y=innerHeight*.42;
  if(at instanceof Element){ const r=at.getBoundingClientRect(); if(!r.width&&!r.height) return null; x=r.left+r.width/2; y=r.top+r.height/2; }
  else if(at){ x=at.x; y=at.y; }
  const d=pxfxEl(name,{scale:s,ms,loops}); d.style.left=(x-a[0]*s/2)+"px"; d.style.top=(y+dy-a[1]*s/2)+"px";
  pxfxLayer.append(d);
  const done=()=>d.remove(); d.addEventListener("animationend",done); setTimeout(done,(ms||a[3])*a[2]*(+loops||1)+500);
  return d;
}
/* a big pixel "You Won!" with fireworks for any game you win */
function pxWin(){ pxfx("firework",{scale:4,dy:-90}); setTimeout(()=>pxfx("firework",{scale:3,at:{x:innerWidth*.25,y:innerHeight*.3}}),250); setTimeout(()=>pxfx("firework",{scale:3,at:{x:innerWidth*.75,y:innerHeight*.34}}),450); pxfx("youwon",{scale:2.6}); }
const pxIcon=(name,size=28,alt="")=>{ const i=document.createElement("img"); i.className="pxi"; i.src=PX_ICONS[name]; i.width=i.height=size; i.alt=alt; i.decoding="async"; return i; };
const pxIconHtml=(name,size=16)=>`<img class="pxi" src="${PX_ICONS[name]}" width="${size}" height="${size}" alt="">`;
/* the winner's chip in card and dice games gets a little spinning pixel crown */
(()=>{ const [w,h,n,f,src]=PXFX_ART.crown, s=1.25, st=document.createElement("style");
  st.textContent=`.e8p.won{position:relative}.e8p.won::after{content:"";position:absolute;left:-2px;top:-${Math.round(h*s)-12}px;z-index:2;width:${w*s}px;height:${h*s}px;background:url(${src}) 0 0/${w*n*s}px ${h*s}px;image-rendering:pixelated;animation:pxfxrun ${n*f}ms steps(${n}) infinite;--end:-${w*n*s}px;pointer-events:none}@media (prefers-reduced-motion:reduce){html:not(.motion-always) .e8p.won::after{animation:none}}`;
  document.head.append(st); })();

const FX_TRIGGERS=[
  {fx:"confetti", label:"Confetti",       words:["happy birthday","hbd","congrats","congratulations"], emoji:["🎉","🎂","🥳"]},
  {fx:"hearts",   label:"Neon hearts",    words:["love you","ily","luv u","love u"], emoji:["❤️","💖","😍","🥰","💕"]},
  {fx:"kiss",     label:"Flying kiss",    words:["mwah","muah"], emoji:["😘","💋"]},
  {fx:"hype",     label:"Hype banner",    words:["let's go","lets go","gg","hype"], emoji:["🏆"]},
  {fx:"embers",   label:"Embers",         words:["lit"], emoji:["🔥"]},
  {fx:"laugh",    label:"Laugh stamps",   words:["lol","lmao","lmfao"], emoji:["😂","🤣"]},
  {fx:"rain",     label:"Rain",           words:["rip"], emoji:["😭","😢","💔"]},
  {fx:"night",    label:"Shooting stars", words:["good night","goodnight","gn"], emoji:["🌙","😴","🌠"]},
  {fx:"boom",     label:"Shockwave",      words:["boom","mind blown"], emoji:["💥","🤯"]},
];
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
FX_TRIGGERS.forEach(t=>t.re=new RegExp("(^|[^a-z0-9'])("+t.words.map(esc).join("|")+")(?=$|[^a-z0-9])","i"));
function fxFor(text){
  if(!text) return null;
  const norm=text.replace(/[’‘]/g,"'");
  let best=null, bestAt=Infinity;              // first trigger in the message wins
  for(const t of FX_TRIGGERS){
    const m=norm.match(t.re); if(m&&m.index<bestAt){ best=t; bestAt=m.index; }
    for(const e of t.emoji){ const i=norm.indexOf(e); if(i>=0&&i<bestAt){ best=t; bestAt=i; } }
  }
  return best;
}
const fxEnabled=()=>{ try{ return LS.get("nl-fx")!=="off"; }catch(e){ return true; } };
const fxPlayed=new Set();

const FX=(()=>{
  const canvas=document.createElement("canvas"); canvas.id="fx"; canvas.setAttribute("aria-hidden","true");
  const layer=document.createElement("div"); layer.id="fxText"; layer.setAttribute("aria-hidden","true");
  document.body.append(canvas,layer);
  const ctx=canvas.getContext("2d");
  const C=["#00F0FF","#F3FF3A","#E07AC6","#F4F7FF","#B18CFF"];
  const R=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
  let W=0,H=0,dpr=1,raf=0,run=null;
  function size(){ dpr=Math.min(devicePixelRatio||1,2); W=innerWidth; H=innerHeight; canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
  addEventListener("resize",size); size();
  function shake(){ const c=$("chat"); c.classList.remove("fx-shake"); void c.offsetWidth; c.classList.add("fx-shake"); setTimeout(()=>c.classList.remove("fx-shake"),1000); }
  function banner(text){ const b=el("div","fx-banner",text); layer.append(b); setTimeout(()=>b.remove(),1900); }
  function heart(x,y,s){ ctx.beginPath(); ctx.moveTo(x,y+s*.3); ctx.bezierCurveTo(x,y,x-s*.5,y,x-s*.5,y+s*.3); ctx.bezierCurveTo(x-s*.5,y+s*.6,x,y+s*.8,x,y+s); ctx.bezierCurveTo(x,y+s*.8,x+s*.5,y+s*.6,x+s*.5,y+s*.3); ctx.bezierCurveTo(x+s*.5,y,x,y,x,y+s*.3); ctx.closePath(); }

  const effects={
    confetti:{dur:3200,init:()=>[...Array(170)].map(()=>({x:R(0,W),y:R(-H*.6,-10),vx:R(-1.5,1.5),vy:R(2,5),w:R(7,15),h:R(4,8),r:R(0,6.3),vr:R(-.2,.2),c:pick(C),ph:R(0,6)})),
      step:(ps,t)=>{ for(const p of ps){ p.vy+=.04; p.x+=p.vx+Math.sin(t/300+p.ph)*.8; p.y+=p.vy; p.r+=p.vr;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle=p.c; ctx.beginPath(); ctx.moveTo(-p.w/2,-p.h/2); ctx.lineTo(p.w/2,-p.h/2+2); ctx.lineTo(p.w/2-2,p.h/2); ctx.lineTo(-p.w/2+1,p.h/2-1); ctx.fill(); ctx.restore(); } }},
    hearts:{dur:3200,init:()=>[...Array(38)].map(()=>({x:R(0,W),y:H+R(0,H*.6),vy:R(2,4.5),s:R(16,40),ph:R(0,6),c:pick(["#E07AC6","#00F0FF","#F3FF3A"])})),
      step:(ps,t)=>{ for(const p of ps){ p.y-=p.vy; const x=p.x+Math.sin(t/400+p.ph)*14; ctx.globalAlpha=Math.max(0,Math.min(1,p.y/(H*.35)));
        heart(x,p.y,p.s); ctx.fillStyle="rgba(7,4,26,.7)"; ctx.fill(); ctx.lineWidth=3; ctx.strokeStyle=p.c; ctx.shadowColor=p.c; ctx.shadowBlur=12; ctx.stroke(); ctx.shadowBlur=0; } ctx.globalAlpha=1; }},
    embers:{dur:2800,init:()=>[...Array(170)].map(()=>({x:R(0,W),y:R(H*.35,H*1.3),vy:R(2.5,7),vx:R(-.6,.6),s:R(1.5,4.5),c:pick(["#FF8A3D","#F3FF3A","#E07AC6","#FF5A5A"]),ph:R(0,6)})),
      step:(ps,t)=>{ ctx.globalCompositeOperation="lighter"; for(const p of ps){ p.y-=p.vy; p.x+=p.vx+Math.sin(t/200+p.ph)*.6;
        ctx.globalAlpha=.5+.5*Math.abs(Math.sin(t/90+p.ph)); ctx.fillStyle=p.c; ctx.shadowColor=p.c; ctx.shadowBlur=10; ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,7); ctx.fill(); }
        ctx.shadowBlur=0; ctx.globalAlpha=1; ctx.globalCompositeOperation="source-over"; }},
    hype:{dur:1900,init:(txt)=>{ banner(txt); return [...Array(60)].map(()=>({a:R(0,6.3),len:R(.3,.7),w:R(1,4),c:pick(C)})); },
      step:(ps,t,k)=>{ const cx=W/2, cy=H/2, rMax=Math.hypot(W,H)/2; ctx.globalAlpha=(1-k)*.8;
        for(const p of ps){ if(Math.random()<.5) continue; const r0=rMax*(1-p.len)*(.6+.4*Math.random()); ctx.strokeStyle=p.c; ctx.lineWidth=p.w;
          ctx.beginPath(); ctx.moveTo(cx+Math.cos(p.a)*r0,cy+Math.sin(p.a)*r0); ctx.lineTo(cx+Math.cos(p.a)*rMax,cy+Math.sin(p.a)*rMax); ctx.stroke(); } ctx.globalAlpha=1; }},
    laugh:{dur:1900,init:()=>{ shake(); const words=["LOL","HA","LMAO","HA!","LOL"];
        words.forEach((w,i)=>setTimeout(()=>{ const s=el("span","fx-stamp",w); s.style.left=(i%2?R(45,65):R(5,25))+"%"; s.style.top=(12+i*15+R(-4,4))+"%"; s.style.setProperty("--r",R(-18,18)+"deg"); layer.append(s); setTimeout(()=>s.remove(),1700); },i*160));
        return []; }, step:()=>{} },
    rain:{dur:3000,init:()=>[...Array(220)].map(()=>({x:R(-W*.2,W*1.1),y:R(-H,0),v:R(12,22),l:R(12,30)})),
      step:(ps,t,k)=>{ ctx.fillStyle=`rgba(7,4,26,${.35*Math.sin(Math.PI*k)})`; ctx.fillRect(0,0,W,H);
        ctx.strokeStyle="rgba(0,240,255,.55)"; ctx.lineWidth=1.5; ctx.beginPath();
        for(const p of ps){ p.y+=p.v; p.x-=p.v*.18; if(p.y>H&&k<.7){ p.y=R(-60,0); p.x=R(0,W*1.2); } ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+p.l*.18,p.y-p.l); }
        ctx.stroke(); }},
    night:{dur:3200,init:()=>[...Array(26)].map((_,i)=>({x:R(W*.1,W*1.3),y:R(-H*.3,H*.6),v:R(10,16),delay:i*90,len:R(100,220),c:pick(["#F4F7FF","#00F0FF","#F3FF3A"])})),
      step:(ps,t,k)=>{ ctx.fillStyle=`rgba(7,4,26,${.3*Math.sin(Math.PI*k)})`; ctx.fillRect(0,0,W,H);
        for(const p of ps){ if(t<p.delay) continue; const d=(t-p.delay)/16*p.v, x=p.x-d, y=p.y+d*.55;
          const g=ctx.createLinearGradient(x,y,x+p.len,y-p.len*.55); g.addColorStop(0,p.c); g.addColorStop(1,"rgba(0,0,0,0)");
          ctx.strokeStyle=g; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+p.len,y-p.len*.55); ctx.stroke();
          ctx.fillStyle=p.c; ctx.shadowColor=p.c; ctx.shadowBlur=12; ctx.beginPath(); ctx.arc(x,y,2.5,0,7); ctx.fill(); ctx.shadowBlur=0; } }},
    boom:{dur:1700,init:()=>{ shake(); return {shards:[...Array(46)].map(()=>({a:R(0,6.3),v:R(6,16),s:R(6,16),r:R(0,6),c:pick(C)})),d:0}; },
      step:(st,t,k)=>{ const cx=W/2, cy=H/2;
        if(k<.25){ ctx.fillStyle=`rgba(243,255,58,${(.25-k)*2.6})`; ctx.fillRect(0,0,W,H); }
        ["#F3FF3A","#00F0FF","#E07AC6"].forEach((c,i)=>{ const kk=Math.max(0,k*1.4-i*.12); if(kk<=0||kk>1) return;
          ctx.strokeStyle=c; ctx.globalAlpha=1-kk; ctx.lineWidth=10*(1-kk)+2; ctx.beginPath(); ctx.arc(cx,cy,kk*Math.hypot(W,H)*.6,0,7); ctx.stroke(); });
        ctx.globalAlpha=1-k;
        for(const p of st.shards){ const d=p.v*t/16; ctx.save(); ctx.translate(cx+Math.cos(p.a)*d,cy+Math.sin(p.a)*d); ctx.rotate(p.r+t/200); ctx.fillStyle=p.c;
          ctx.beginPath(); ctx.moveTo(0,-p.s/2); ctx.lineTo(p.s/2,p.s/3); ctx.lineTo(-p.s/2,p.s/2); ctx.fill(); ctx.restore(); }
        ctx.globalAlpha=1; }},
  };
  function play(name,opts={}){
    if(reducedMotion()) return;
    const e=effects[name]; if(!e) return;
    cancelAnimationFrame(raf); clearTimeout(endTimer); layer.innerHTML=""; ctx.clearRect(0,0,W,H);
    const state=e.init(opts.text); const start=performance.now(); endsAt=Date.now()+e.dur;
    canvas.style.display="block";
    const frame=now=>{ const t=now-start, k=Math.min(1,t/e.dur);
      ctx.clearRect(0,0,W,H);
      try{ e.step(state,t,k); }catch(err){ stop(); return; }
      if(k<1) raf=requestAnimationFrame(frame); else stop(); };
    raf=requestAnimationFrame(frame);
    endTimer=setTimeout(stop,e.dur+400);   // backup: iPhones can drop animation frames when the app is paused mid-effect
  }
  // Whatever happens, an effect can never leave lines frozen on screen: when it's over, the layer is wiped AND hidden.
  let endTimer=0, endsAt=0;
  function stop(){ cancelAnimationFrame(raf); clearTimeout(endTimer); ctx.clearRect(0,0,W,H); canvas.style.display="none"; }
  canvas.style.display="none";
  const sweep=()=>{ if(Date.now()>=endsAt) stop(); };
  document.addEventListener("visibilitychange",()=>{ if(!document.hidden) sweep(); });
  addEventListener("pageshow",sweep); addEventListener("focus",sweep);
  return {play,stop,busy:()=>canvas.style.display==="block"&&Date.now()<endsAt};
})();

function hypeText(text){
  const n=(text||"").toLowerCase().replace(/[’‘]/g,"'");
  if(/(^|[^a-z0-9])gg([^a-z0-9]|$)/.test(n)) return "GG!";
  if(/hype/.test(n)) return "HYPE!";
  if(n.includes("🏆")) return "WINNER!";
  return "LET'S GO!";
}
function playFx(m,force){
  if(m.kind==="notice") return;
  if(!m?.text||m.kind==="poll"||m.kind==="game"||isBlCard(m)||isEcard(m)) return;   // a shared title like "Dragon Ball" shouldn't fire the dragon secret
  if(!force) maybeHifive(m);
  const s=secretFor(m.text), t=s?null:fxFor(m.text); if(!s&&!t) return;
  if(s?.mode&&!force&&m.user_id===user?.id&&Date.now()-new Date(m.created_at)<=15000&&(!fxEnabled()||document.hidden||reducedMotion())&&!fxPlayed.has(m.id)){
    fxPlayed.add(m.id); s.mode(); discoverSecret(s.id); return; }   // a spell still works with effects off, just without the show
  if(!force&&typeof feed!=="undefined"&&feed.isConnected&&feed.scrollHeight-feed.scrollTop-feed.clientHeight>600&&!$("chat").classList.contains("hidden")){ fxPlayed.add(m.id); return; }   // you're scrolled up reading: don't cover the screen with effects
  if(!force){ if(!fxEnabled()||document.hidden||fxPlayed.has(m.id)) return; const age=Date.now()-new Date(m.created_at); if(age>15000&&!(m._live&&Date.now()-m._live<5000&&age<180000)) return; }   // just arrived live = fresh (phones' clocks and slow networks can be off)
  fxPlayed.add(m.id); if(typeof markSecretAsked==="function") markSecretAsked(m.id);   // remember it was seen, even after the app closes
  fxEnqueue(()=>{
    if(s) playSecretFromMessage(m,s,force);
    else if(t.fx==="kiss") playKiss(m);
    else { FX.play(t.fx,{text:hypeText(m.text)}); if(t.fx==="boom") pxfx("boom",{scale:5}); }
  },force);
}
/* 🎟️ effects take turns (2026.10.20v): when several people fire secrets or effects at once, they line up and play
   one after another instead of piling on top of each other. An effect counts as finished when its layers are empty
   again; none can hold the line for more than 9 seconds, and anything waiting over 40 seconds is skipped. */
const fxQueue=[]; let fxTimer=null, fxCurrentAt=0, fxQuietUntil=0;
function fxLayersBusy(){
  const sx=document.getElementById("sfx"), ft=document.getElementById("fxText");
  return (sx&&sx.children.length>0)||(ft&&ft.children.length>0)||(typeof FX!=="undefined"&&FX.busy());
}
function fxEnqueue(fn,first){
  if(first) fxQueue.unshift({fn,at:Date.now()});   // a replay you tapped yourself goes next
  else { if(fxQueue.length>=5) return; fxQueue.push({fn,at:Date.now()}); }   // a spam storm doesn't build an endless line
  fxPump();
}
function fxPump(){
  if(fxTimer) return;
  const step=()=>{
    fxTimer=null;
    if(!fxQueue.length) return;
    const now=Date.now(), playing=fxCurrentAt&&now-fxCurrentAt<9000&&(now<fxQuietUntil||fxLayersBusy());
    if(playing){ fxTimer=setTimeout(step,200); return; }
    const it=fxQueue.shift();
    if(now-it.at>40000){ step(); return; }   // too old by now
    fxCurrentAt=now; fxQuietUntil=now+1500;   // every effect gets at least 1.5 s to itself
    try{ it.fn(); }catch(e){}
    fxTimer=setTimeout(step,400);
  };
  step();
}
/* 😘 "mwah": a kiss flies from the sender's picture to whoever it's for (the other person in a DM, the person being
   replied to, or whoever spoke last), and that picture blushes. Kisses aimed at you land on your own picture up top. */
function kissTarget(m){
  if(m.reply_to&&byId.get(m.reply_to)&&byId.get(m.reply_to).user_id!==m.user_id) return byId.get(m.reply_to).user_id;
  if(isDm) return m.user_id===user.id?dmUser:user.id;
  const i=msgs.findIndex(x=>x.id===m.id);
  for(let k=(i<0?msgs.length:i)-1;k>=0;k--){ const u=msgs[k].user_id; if(u&&u!==m.user_id&&!String(u).startsWith("00000000-0000-4000-a000")) return u; }
  return null;
}
function faceOnScreen(uid){
  if(uid===user.id){ const top=$("openProfile2"); if(top&&top.offsetParent) return top; }
  const H=innerHeight;
  const els=[...feed.querySelectorAll(".msg")].reverse();
  for(const e of els){ const id=+e.dataset.id; const mm=byId.get(id); if(mm?.user_id!==uid) continue; const f=e.querySelector(".face"); if(!f) continue; const r=f.getBoundingClientRect(); if(r.bottom>0&&r.top<H) return f; }
  return null;
}
function playKiss(m){
  const to=kissTarget(m); if(!to) return;
  const fromEl=elById.get(m.id)?.querySelector(".face")||(m.user_id===user.id?$("openProfile2"):null);
  const toEl=faceOnScreen(to)||(to===user.id?$("openProfile2"):$("roomLabel"));   // not on screen? aim at the chat name up top
  if(!fromEl||!toEl||fromEl===toEl) return;
  const a=fromEl.getBoundingClientRect(), b=toEl.getBoundingClientRect();
  const ax=a.left+a.width/2, ay=a.top+a.height/2, bx=b.left+b.width/2, by=b.top+b.height/2;
  const k=el("div","kiss-fly","💋"); k.style.left=(ax-18)+"px"; k.style.top=(ay-18)+"px"; document.body.append(k);
  const dx=bx-ax, dy=by-ay, lift=Math.min(160,Math.abs(dx)*.4+60);
  const reduce=reducedMotion();
  k.animate(reduce?[{opacity:0},{opacity:1},{opacity:0}]:[
    {transform:"translate(0,0) scale(.4) rotate(-20deg)",opacity:0},
    {transform:`translate(${dx*.1}px,${dy*.1-20}px) scale(1.3) rotate(0deg)`,opacity:1,offset:.12},
    {transform:`translate(${dx*.5}px,${dy*.5-lift}px) scale(1.1) rotate(12deg)`,offset:.55},
    {transform:`translate(${dx}px,${dy}px) scale(.8) rotate(-6deg)`,opacity:1,offset:.92},
    {transform:`translate(${dx}px,${dy}px) scale(.2)`,opacity:0}],{duration:reduce?600:1300,easing:"cubic-bezier(.4,.1,.4,1)"}).onfinish=()=>{
    k.remove();
    toEl.animate([{filter:"none"},{filter:"drop-shadow(0 0 10px #ff5aa8) brightness(1.15) saturate(1.3)"},{filter:"none"}],{duration:900});
    if(!reduce) for(let i=0;i<5;i++){ const h=el("div","kiss-heart",["💕","💗","💖"][i%3]); h.style.left=(bx-10)+"px"; h.style.top=(by-10)+"px"; h.style.setProperty("--x",((i-2)*22)+"px"); h.style.animationDelay=(i*.05)+"s"; document.body.append(h); setTimeout(()=>h.remove(),1300); }
  };
  if(navigator.vibrate) navigator.vibrate([15,40,25]);
}

/* ---------- keep the chat inside the visible area when the keyboard opens ---------- */
(function(){
  const vv=window.visualViewport; if(!vv) return;
  const rootStyle=document.documentElement.style;
  let raf=0;
  function fit(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      const nearBottom=feed.scrollHeight-feed.scrollTop-feed.clientHeight<120;
      rootStyle.setProperty("--app-h",vv.height+"px");
      rootStyle.setProperty("--app-top",vv.offsetTop+"px");
      if(nearBottom) feed.scrollTop=feed.scrollHeight;
    });
  }
  vv.addEventListener("resize",fit); vv.addEventListener("scroll",fit); fit();
  $("box").addEventListener("focus",()=>setTimeout(()=>{ fit(); feed.scrollTop=feed.scrollHeight; },300));
})();

