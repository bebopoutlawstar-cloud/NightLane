/* ================= SECRETS 🔓 ================= */
const SECRETS_KEY="nl-secrets";
/* Cole's accounts: saying "Cole" makes these usernames shine. Add more usernames here (lowercase). */
const CREATOR_USERNAMES=["bebop"];
const foundSecrets=()=>{ try{ return JSON.parse(LS.get(SECRETS_KEY)||"[]"); }catch(e){ return []; } };
const hasSecret=id=>foundSecrets().includes(id);
const SX=(()=>{   // secret effects layer
  const layer=document.createElement("div"); layer.id="sfx"; layer.setAttribute("aria-hidden","true"); document.body.append(layer);
  const add=(cls,html="")=>{ const d=document.createElement("div"); d.className=cls; d.innerHTML=html; layer.append(d); return d; };
  const later=(fn,ms)=>setTimeout(fn,ms);
  const R=(a,b)=>a+Math.random()*(b-a);
  function chatClass(cls,ms){ const c=$("chat"); c.classList.remove(cls); void c.offsetWidth; c.classList.add(cls); later(()=>c.classList.remove(cls),ms); }
  function canvasFx(host,draw,ms){
    const cv=document.createElement("canvas"); cv.className="sfx-canvas"; host.append(cv);
    const dpr=Math.min(devicePixelRatio||1,2), ctx=cv.getContext("2d");
    const size=()=>{ const r=host.getBoundingClientRect(); cv.width=r.width*dpr; cv.height=r.height*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); return r; };
    let box=size(), start=performance.now(), raf;
    const state=draw.init?draw.init(box):{};
    const frame=now=>{ if(!cv.isConnected) return; const t=now-start, k=Math.min(1,t/ms); ctx.clearRect(0,0,box.width,box.height); try{ draw.step(ctx,box,state,t,k); }catch(e){ cv.remove(); return; } if(k<1) raf=requestAnimationFrame(frame); else cv.remove(); };
    raf=requestAnimationFrame(frame); setTimeout(()=>cv.remove(),ms+400);
  }
  return {
    showtime(){
      const bg=add("sx-showtime-bg"); const ban=add("sx-banner sx-showtime","SHOWTIME!");
      for(let i=0;i<34;i++){ const c=add("sx-card"); c.style.setProperty("--tx",R(-60,60)+"vw"); c.style.setProperty("--ty",R(-60,60)+"vh"); c.style.setProperty("--r",R(-540,540)+"deg"); c.style.background=["#E8182B","#07041A","#F4F7FF"][i%3]; c.style.animationDelay=R(0,.25)+"s"; later(()=>c.remove(),2300); }
      later(()=>{ bg.remove(); ban.remove(); },2300);
    },
    takeyourtime(){
      const v=add("sx-dim"); const clock=add("sx-clock",`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#07041A" stroke="var(--cyan)" stroke-width="4"/>${[...Array(12)].map((_,i)=>`<rect x="49" y="9" width="2" height="7" fill="var(--volt)" transform="rotate(${i*30} 50 50)"/>`).join("")}<rect class="h" x="48.5" y="26" width="3" height="26" fill="var(--white)"/><rect class="m" x="49.2" y="14" width="1.6" height="38" fill="var(--mag)"/><circle cx="50" cy="50" r="3" fill="var(--volt)"/></svg><div class="sx-caption">take your time…</div>`);
      chatClass("sx-slow",3600); later(()=>{ v.remove(); clock.remove(); },3600);
    },
    over9000(){
      chatClass("fx-shake",1000);
      const m=add("sx-power",`<div class="sx-powerlabel">POWER LEVEL</div><div class="sx-bar"><i></i></div><div class="sx-num">0</div>`);
      const num=m.querySelector(".sx-num"), start=performance.now();
      const tick=now=>{ const k=Math.min(1,(now-start)/1400); num.textContent=Math.floor(9001*Math.pow(k,2.2)).toLocaleString(); if(k<1) requestAnimationFrame(tick); else { num.textContent="9,001!!"; m.classList.add("maxed"); if(typeof FX!=="undefined") FX.play("boom"); } };
      requestAnimationFrame(tick); later(()=>m.remove(),2600);
    },
    barrelroll(){ chatClass("sx-roll",1300); },
    lightsout(){
      const d=add("sx-dark"); d.style.setProperty("--x","50%"); d.style.setProperty("--y","45%");
      const move=e=>{ const p=e.touches?e.touches[0]:e; d.style.setProperty("--x",p.clientX+"px"); d.style.setProperty("--y",p.clientY+"px"); };
      addEventListener("pointermove",move); addEventListener("touchmove",move,{passive:true});
      later(()=>{ d.classList.add("out"); later(()=>{ d.remove(); removeEventListener("pointermove",move); removeEventListener("touchmove",move); },500); },6000);
    },
    midnight(){
      if(typeof FX!=="undefined") FX.play("night");
      const moon=add("sx-moon",`<svg viewBox="0 0 100 100"><path d="M64 10a42 42 0 1 0 30 62a34 34 0 0 1-30-62z" fill="var(--volt)" stroke="#07041A" stroke-width="3"/></svg>`);
      later(()=>moon.remove(),3400);
    },
    cityburn(){
      const host=$("chat"), wrap=document.createElement("div"); wrap.className="sx-city"; host.prepend(wrap);
      canvasFx(wrap,{
        init(box){ const b=[]; let x=-10; while(x<box.width+20){ const w=R(26,64); b.push({x,w,h:R(box.height*.14,box.height*.55),win:[...Array(40)].map(()=>Math.random()<.35)}); x+=w+R(2,8); }
          return {b,embers:[...Array(90)].map(()=>({x:R(0,box.width),y:R(box.height*.4,box.height*1.2),v:R(.6,2.2),s:R(1,3),p:R(0,6)})),smoke:[...Array(10)].map(()=>({x:R(0,box.width),y:R(box.height*.3,box.height*.7),r:R(60,140),v:R(.15,.45)}))}; },
        step(ctx,box,s,t,k){
          const a=k<.12?k/.12:k>.85?(1-k)/.15:1; ctx.globalAlpha=a;
          const g=ctx.createLinearGradient(0,0,0,box.height); g.addColorStop(0,"#140409"); g.addColorStop(.45,"#5c0f12"); g.addColorStop(.75,"#d2461a"); g.addColorStop(1,"#ffb13b");
          ctx.fillStyle=g; ctx.fillRect(0,0,box.width,box.height);
          for(const m of s.smoke){ m.y-=m.v; ctx.fillStyle="rgba(20,8,12,.35)"; ctx.beginPath(); ctx.arc(m.x+Math.sin(t/900+m.r)*20,m.y,m.r,0,7); ctx.fill(); }
          for(const bd of s.b){
            const top=box.height-bd.h;
            ctx.fillStyle="#07030a"; ctx.fillRect(bd.x,top,bd.w,bd.h);
            let i=0; for(let wy=top+8; wy<box.height-10; wy+=12){ for(let wx=bd.x+5; wx<bd.x+bd.w-6; wx+=10){ if(bd.win[i++%40]){ ctx.fillStyle=`rgba(255,${120+Math.floor(80*Math.abs(Math.sin(t/180+wx*wy)))},40,.85)`; ctx.fillRect(wx,wy,4,6);} } }
            const fh=12+8*Math.sin(t/120+bd.x); const fg=ctx.createLinearGradient(0,top-fh*2,0,top+4); fg.addColorStop(0,"rgba(255,220,80,0)"); fg.addColorStop(.6,"rgba(255,120,30,.9)"); fg.addColorStop(1,"rgba(255,60,20,.9)");
            ctx.fillStyle=fg; ctx.beginPath(); ctx.moveTo(bd.x,top+2); for(let fx=0;fx<=bd.w;fx+=6) ctx.lineTo(bd.x+fx,top-fh*(0.5+0.5*Math.abs(Math.sin(t/90+fx+bd.x)))); ctx.lineTo(bd.x+bd.w,top+2); ctx.fill();
          }
          ctx.globalCompositeOperation="lighter";
          for(const e of s.embers){ e.y-=e.v; e.x+=Math.sin(t/300+e.p)*.6; if(e.y<-10){ e.y=box.height+10; } ctx.fillStyle=`rgba(255,${150+Math.floor(Math.random()*80)},60,.9)`; ctx.beginPath(); ctx.arc(e.x,e.y,e.s,0,7); ctx.fill(); }
          ctx.globalCompositeOperation="source-over"; ctx.globalAlpha=1;
        }
      },6500);
      later(()=>wrap.remove(),6600);
      const cap=add("sx-caption sx-citycap","🔥 WE HAVE A CITY TO BURN"); later(()=>cap.remove(),3000);
    },
    netrunner(){
      chatClass("sx-glitch",1100);
      const o=add("sx-scan","<span>// NETRUNNER DETECTED //</span>"); later(()=>o.remove(),1100);
      if(navigator.vibrate) navigator.vibrate([20,40,20,40,60]);
    },
    choom(){
      const swaps=[];
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>/friend/i.test(n.nodeValue)&&!n.parentElement.closest("script,style,textarea,input,#feed .bubble")?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
      const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(n=>{ swaps.push([n,n.nodeValue]); n.nodeValue=n.nodeValue.replace(/friend/gi,w=>w[0]==="F"?(w==="FRIEND"?"CHOOM":"Choom"):"choom"); });
      const ph=$("contactName"); const oldPh=ph.placeholder; ph.placeholder=oldPh.replace(/friend/gi,"choom");
      const toast=add("sx-caption sx-choomcap","Preem, choom 😎"); later(()=>toast.remove(),1800);
      const restore=()=>{ swaps.forEach(([n,v])=>{ if(n.isConnected) n.nodeValue=v; }); ph.placeholder=oldPh; removeEventListener("pointerdown",restore,true); };
      setTimeout(()=>addEventListener("pointerdown",restore,true),400);
    },
    jackin(){
      canvasFx(layer,{
        init(box){ const cols=Math.floor(box.width/14); return {cols,drops:[...Array(cols)].map(()=>R(-40,0))}; },
        step(ctx,box,s,t,k){
          const a=k<.1?k/.1:k>.8?(1-k)/.2:1; ctx.fillStyle=`rgba(3,8,6,${.78*a})`; ctx.fillRect(0,0,box.width,box.height);
          ctx.font="bold 14px ui-monospace,monospace";
          s.drops.forEach((d,i)=>{ for(let j=0;j<16;j++){ const y=(d-j)*16; if(y<0||y>box.height) continue; ctx.fillStyle=j===0?`rgba(240,255,255,${a})`:(i%4===0?`rgba(224,122,198,${a*(1-j/16)})`:`rgba(0,${200+Math.floor(55*Math.random())},255,${a*(1-j/16)})`); ctx.fillText("01ｱｲｳｴｵ#$%<>/"[Math.floor(Math.random()*15)],i*14,y); } s.drops[i]+=.55; if(d*16>box.height+260) s.drops[i]=R(-20,0); });
        }
      },3200);
      const cap=add("sx-caption sx-jackcap","JACKED IN ▮"); later(()=>cap.remove(),2600);
    },
    flatline(){
      chatClass("sx-gray",3200);
      const o=add("sx-ekg",`<svg viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M0 50 H90 L105 20 L120 80 L135 50 H200 L212 28 L224 72 L236 50 H400" /></svg><div class="sx-caption">FLATLINED</div>`);
      if(navigator.vibrate) later(()=>navigator.vibrate(900),1500);
      later(()=>o.remove(),3200);
    },
    preem(){ const s=add("sx-banner sx-preem","PREEM ✓"); later(()=>s.remove(),1800); },
    gonk(){ chatClass("sx-gonk",1700); const c=add("sx-caption sx-gonkcap","🤪 gonk"); later(()=>c.remove(),1500); },
    blackwall(){
      const w=add("sx-blackwall","<span>BLACKWALL</span><small>ACCESS DENIED</small>"); chatClass("sx-glitch",900);
      later(()=>w.classList.add("out"),2200); later(()=>w.remove(),2700);
    },
    easycome(){
      canvasFx(layer,{
        init(box){ return {sky:NightSky.make(box.width,box.height,{count:170,flares:5})}; },
        step(ctx,box,s,t,k){
          const a=k<.12?k/.12:k>.82?(1-k)/.18:1;
          ctx.fillStyle=`rgba(3,2,12,${.88*a})`; ctx.fillRect(0,0,box.width,box.height);
          NightSky.draw(ctx,s.sky,t*2.5,a);
        }
      },5600);
      const ship=add("sx-ship",`<svg viewBox="0 0 160 80"><defs><linearGradient id="sxhull" x1="0" x2="1"><stop offset="0" stop-color="#2a2f55"/><stop offset="1" stop-color="#9aa4c0"/></linearGradient><radialGradient id="sxflame"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#00F0FF"/><stop offset="1" stop-color="rgba(0,240,255,0)"/></radialGradient></defs>
        <ellipse cx="18" cy="42" rx="22" ry="10" fill="url(#sxflame)" class="sx-flame"/>
        <polygon points="30,34 118,26 154,40 118,54 30,48" fill="url(#sxhull)" stroke="#07041A" stroke-width="3"/>
        <polygon points="62,30 92,6 104,8 86,31" fill="#E07AC6" stroke="#07041A" stroke-width="3"/>
        <polygon points="62,50 92,74 104,72 86,49" fill="#E07AC6" stroke="#07041A" stroke-width="3"/>
        <polygon points="104,34 132,36 104,42" fill="#00F0FF" stroke="#07041A" stroke-width="2"/></svg>`);
      const cap=add("sx-caption sx-easycap","easy come, easy go…");
      later(()=>{ ship.remove(); cap.remove(); },5600);
    },
    lumos(){
      const g=add("sx-lumos"); for(let i=0;i<26;i++){ const sp=add("sx-spark"); sp.style.left=R(10,90)+"%"; sp.style.top=R(15,85)+"%"; sp.style.animationDelay=R(0,2.2)+"s"; later(()=>sp.remove(),4200); }
      chatClass("sx-bright",4200); later(()=>g.remove(),4200);
    },
    d20(m){
      const n=d20For(m);
      pxRoll(20,n,lay=>{ const cap=add("sx-caption sx-dcap",n===20?"NAT 20! 🎉":n===1?"CRIT FAIL 💀":`rolled a ${n}`);
        if(n===20&&typeof FX!=="undefined") FX.play("confetti"); if(n===1) chatClass("fx-shake",1000);
        later(()=>cap.remove(),1800); },true);
    },
    creator(){
      const ids=[...cache.values()].filter(p=>p&&CREATOR_USERNAMES.includes((p.username||"").toLowerCase())).map(p=>p.id);
      const faces=[...document.querySelectorAll(".face")].filter(f=>ids.includes(f.dataset.uid)||(f.id==="openProfile2"||f.id==="meFace"||f.id==="profFace")&&ids.includes(user?.id));
      faces.forEach(f=>{ f.classList.remove("sx-godly"); void f.offsetWidth; f.classList.add("sx-godly"); later(()=>f.classList.remove("sx-godly"),4200); });
      const here=ids.some(id=>room&&members.has(id));
      const rays=add("sx-rays"); later(()=>rays.remove(),3200);
      const p=ids.map(id=>cache.get(id)).find(Boolean);
      const t=el("div","toast mention sx-crown");
      const f=el("span","face sx-godly"); if(p) paintFace(f,p); else f.append(el("span","fi","👑"));
      const body=el("span","tbody"); body.append(el("div","ttitle","👑 THE CREATOR"), el("div","ttext",here?`${p?.username||"Cole"} built this place.`:"Cole isn't here… but he's watching."));
      t.append(f,body); $("toasts").prepend(t); later(()=>{ t.classList.add("out"); later(()=>t.remove(),260); },4200);
    },
    matrix(){
      canvasFx(layer,{
        init(box){ const cols=Math.floor(box.width/16); return {drops:[...Array(cols)].map(()=>R(-30,0)),speed:[...Array(cols)].map(()=>R(.35,.9))}; },
        step(ctx,box,s,t,k){
          const a=k<.1?k/.1:k>.8?(1-k)/.2:1; ctx.fillStyle=`rgba(0,6,0,${.82*a})`; ctx.fillRect(0,0,box.width,box.height);
          ctx.font="bold 16px ui-monospace,Menlo,monospace";
          s.drops.forEach((dd,i)=>{ for(let q=0;q<22;q++){ const y=(dd-q)*17; if(y<0||y>box.height+17) continue;
            ctx.fillStyle=q===0?`rgba(200,255,200,${a})`:`rgba(0,${170+Math.floor(85*Math.random())},60,${a*(1-q/22)})`;
            ctx.fillText(String(Math.floor(Math.random()*10)),i*16+2,y); }
            s.drops[i]+=s.speed[i]; if(dd*17>box.height+380) s.drops[i]=R(-25,0); });
        }
      },3800);
    },
    zombies(){
      const wrap=document.createElement("div"); wrap.className="sx-city"; $("chat").prepend(wrap);
      canvasFx(wrap,{
        init(box){ return {z:[...Array(7)].map((_,i)=>({x:(i/7)*box.width+R(-20,20),s:R(.9,1.45),v:R(.25,.55),ph:R(0,6)}))}; },
        step(ctx,box,s,t,k){
          const a=k<.1?k/.1:k>.85?(1-k)/.15:1; ctx.globalAlpha=a;
          const g=ctx.createLinearGradient(0,0,0,box.height); g.addColorStop(0,"#050b08"); g.addColorStop(.55,"#0f2418"); g.addColorStop(1,"#2d4a2a");
          ctx.fillStyle=g; ctx.fillRect(0,0,box.width,box.height);
          ctx.fillStyle="rgba(210,255,190,.9)"; ctx.beginPath(); ctx.arc(box.width*.78,box.height*.18,34,0,7); ctx.fill();
          const ground=box.height*.74;
          ctx.fillStyle="#040806"; ctx.fillRect(0,ground,box.width,box.height-ground);
          for(let gx=10;gx<box.width;gx+=90){ ctx.fillRect(gx,ground-34,18,34); ctx.fillRect(gx-6,ground-26,30,7); }
          for(const zz of s.z){
            zz.x+=zz.v; if(zz.x>box.width+60) zz.x=-60;
            const bob=Math.sin(t/260+zz.ph)*3, sc=zz.s, x=zz.x, y=ground+bob;
            ctx.save(); ctx.translate(x,y); ctx.scale(sc,sc); ctx.rotate(Math.sin(t/500+zz.ph)*.08);
            ctx.fillStyle="#020403"; ctx.strokeStyle="#020403"; ctx.lineCap="round";
            ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-3+Math.sin(t/260+zz.ph)*5,-34); ctx.moveTo(6,0); ctx.lineTo(3-Math.sin(t/260+zz.ph)*5,-34); ctx.stroke();
            ctx.fillRect(-11,-74,22,42);
            ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(-8,-68); ctx.lineTo(30,-64+Math.sin(t/300+zz.ph)*4); ctx.moveTo(8,-62); ctx.lineTo(34,-56+Math.cos(t/300+zz.ph)*4); ctx.stroke();
            ctx.beginPath(); ctx.arc(4,-86,11,0,7); ctx.fill();
            ctx.fillStyle="rgba(170,255,120,.9)"; ctx.fillRect(7,-89,3,2); ctx.fillRect(12,-89,3,2);
            ctx.restore();
          }
          const fog=ctx.createLinearGradient(0,ground-80,0,box.height); fog.addColorStop(0,"rgba(140,200,140,0)"); fog.addColorStop(1,"rgba(140,200,140,.35)");
          ctx.fillStyle=fog; ctx.fillRect(0,ground-80,box.width,box.height-ground+80);
          ctx.globalAlpha=1;
        }
      },7000);
      later(()=>wrap.remove(),7100);
      const cap=add("sx-caption sx-zcap","🧟 THEY'RE COMING"); later(()=>cap.remove(),2500);
    },
    wendigo(){
      const w=document.createElement("div"); w.className="sx-wendigo"; w.setAttribute("aria-hidden","true");
      w.innerHTML=`<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">
        <rect width="200" height="300" fill="#020204"/>
        <g fill="#0b0b12">${[...Array(9)].map((_,i)=>`<polygon points="${i*24-10},300 ${i*24+8},${80+((i*37)%90)} ${i*24+26},300"/>`).join("")}</g>
        <g stroke="#cfd2da" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".92">
          <path d="M86 86 L70 50 L58 58 M70 50 L64 26 M70 50 L84 30 M64 26 L52 18"/>
          <path d="M114 86 L130 50 L142 58 M130 50 L136 26 M130 50 L116 30 M136 26 L148 18"/></g>
        <path d="M78 92 Q100 76 122 92 L118 132 Q100 150 82 132 Z" fill="#d9dbe2" stroke="#2a2a33" stroke-width="2"/>
        <ellipse cx="90" cy="108" rx="7" ry="9" fill="#020204"/><ellipse cx="110" cy="108" rx="7" ry="9" fill="#020204"/>
        <circle cx="90" cy="109" r="2.3" fill="#fff" class="sx-eye"/><circle cx="110" cy="109" r="2.3" fill="#fff" class="sx-eye"/>
        <path d="M96 122 L100 130 L104 122" fill="#020204"/>
        <path d="M84 138 Q100 150 116 138 L112 146 L106 140 L100 148 L94 140 L88 146 Z" fill="#020204"/>
        <path d="M80 150 Q100 142 120 150 L132 300 L68 300 Z" fill="#050508"/>
        <path d="M82 160 L52 250 M118 160 L148 250" stroke="#050508" stroke-width="10" stroke-linecap="round"/></svg>`;
      $("chat").prepend(w); chatClass("sx-see",2400); if(navigator.vibrate) navigator.vibrate([10,80,10]);
      later(()=>w.remove(),2400);
    },
    ghost(){
      const vig=add("sx-redvig");
      const m=add("sx-emf",`<div class="sx-emftitle">EMF METER</div><div class="sx-leds">${[1,2,3,4,5].map(i=>`<i class="l${i}"></i>`).join("")}</div><div class="sx-emfread">EMF <b>1</b></div><div class="sx-emfalert">⚠ PRESENCE DETECTED NEAR YOU</div>`);
      const read=m.querySelector(".sx-emfread b"), leds=[...m.querySelectorAll(".sx-leds i")];
      let lvl=1; const beep=()=>{ try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); const o=ac.createOscillator(), g=ac.createGain(); o.frequency.value=700+lvl*180; g.gain.value=.05; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+.07); }catch(e){} };
      const iv=setInterval(()=>{ lvl=Math.min(5,lvl+(Math.random()<.7?1:0)); leds.forEach((l,i)=>l.classList.toggle("on",i<lvl)); read.textContent=lvl; beep(); if(navigator.vibrate) navigator.vibrate(30);
        if(lvl===5){ clearInterval(iv); m.classList.add("max"); if(typeof HW!=="undefined") HW.emfGhost(); } },380);
      later(()=>{ clearInterval(iv); m.remove(); vig.remove(); },3800);
    },
    phantomUnlock(){ const b=add("sx-banner sx-showtime","PHANTOM UNLOCKED"); const bg=add("sx-showtime-bg"); later(()=>{ b.remove(); bg.remove(); },2000); },
    scatter(){
      feed.querySelectorAll(".msg").forEach(n=>{ n.style.setProperty("--sx",R(-160,160)+"px"); n.style.setProperty("--sy",R(-120,120)+"px"); n.style.setProperty("--sr",R(-60,60)+"deg"); });
      chatClass("sx-scatter",1100);
    }
  };
})();

const esc2=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const SECRET_LIST=[
  {id:"showtime", name:"Showtime", re:/(^|[^a-z])(it'?s )?showtime([^a-z]|$)/i, play:()=>SX.showtime()},
  {id:"takeyourtime", name:"Take your time", re:/take your time/i, play:()=>SX.takeyourtime()},
  {id:"over9000", name:"Over 9000", re:/over (9,?000|nine thousand)/i, play:()=>SX.over9000()},
  {id:"barrelroll", name:"Barrel roll", re:/do a barrel roll/i, play:()=>SX.barrelroll()},
  {id:"lightsout", name:"Lights out", re:/(^|[^a-z])lights out([^a-z]|$)/i, play:()=>SX.lightsout()},
  {id:"midnight", name:"Midnight", re:/(^|[^a-z])midnight([^a-z]|$)/i, when:()=>new Date().getHours()===0, play:()=>SX.midnight()},
  {id:"cityburn", name:"A city to burn", re:/we(?:'ve got| have| got|'ve) a city to burn/i, play:()=>SX.cityburn()},
  {id:"netrunner", name:"Netrunner", re:/(^|[^a-z])netrunner(s)?([^a-z]|$)/i, play:()=>SX.netrunner()},
  {id:"choom", name:"Choom", re:/(^|[^a-z])chooms?([^a-z]|$)/i, play:()=>SX.choom()},
  {id:"jackin", name:"Jack in", re:/(^|[^a-z])jack(ing|ed)? in([^a-z]|$)/i, play:()=>SX.jackin()},
  {id:"flatline", name:"Flatline", re:/(^|[^a-z])flatlin(e|ed|ing)([^a-z]|$)/i, play:()=>SX.flatline()},
  {id:"preem", name:"Preem", re:/(^|[^a-z])preem([^a-z]|$)/i, play:()=>SX.preem()},
  {id:"gonk", name:"Gonk", re:/(^|[^a-z])gonk([^a-z]|$)/i, play:()=>SX.gonk()},
  {id:"blackwall", name:"Blackwall", re:/(^|[^a-z])blackwall([^a-z]|$)/i, play:()=>SX.blackwall()},
  {id:"easycome", name:"Easy come, easy go", re:/easy come,? easy go/i, play:()=>SX.easycome()},
  {id:"lumos", name:"Lumos", re:/(^|[^a-z])lumos([^a-z]|$)/i, play:()=>SX.lumos()},
  {id:"d20", name:"Roll a d20", re:/(^|[^a-z])roll(s|ed|ing)? (a |the |me a )?d20([^a-z0-9]|$)/i, play:m=>SX.d20(m)},
  {id:"creator", name:"The creator", re:/(^|[^a-z])cole([^a-z]|$)/i, play:()=>SX.creator()},
  {id:"matrix", name:"The Matrix", re:/(^|[^a-z])matrix([^a-z]|$)/i, play:()=>SX.matrix()},
  {id:"zombies", name:"Zombies", re:/(^|[^a-z])zombie(s)?([^a-z]|$)/i, play:()=>SX.zombies()},
  {id:"wendigo", name:"Wendigo", re:/(^|[^a-z])wendigo(s)?([^a-z]|$)/i, play:()=>SX.wendigo()},
  {id:"ghost", name:"Ghost", re:/(^|[^a-z])ghost(s)?([^a-z]|$)/i, play:()=>SX.ghost()},
  {id:"konami", name:"Phantom code", gesture:true},
  {id:"moonwink", name:"Night owl", gesture:true},
  {id:"shake", name:"Shake it", gesture:true},
];
function d20For(m){
  let h=2166136261; for(const ch of String(m?.id)+"|"+(m?.created_at||"")){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619)>>>0; }
  return (h%20)+1;
}
function secretFor(text){
  if(!text) return null;
  const t=text.replace(/[’‘]/g,"'");
  return SECRET_LIST.find(s=>s.re&&s.re.test(t)&&(!s.when||s.when()))||null;
}
const countFound=f=>f.filter(id=>SECRET_LIST.some(x=>x.id===id)).length;   // removed secrets don't count
function discoverSecret(id){
  const f=foundSecrets(); if(f.includes(id)) return false;
  f.push(id); try{ LS.set(SECRETS_KEY,JSON.stringify(f)); }catch(e){} progressChanged(true);
  const s=SECRET_LIST.find(x=>x.id===id); sfx("secret"); gainXP("secret"); setTimeout(checkUnlocks,900);
  const t=el("div","toast mention"); const body=el("span","tbody");
  body.append(el("div","ttitle",`🔓 Secret found (${countFound(f)}/${SECRET_LIST.length})`), el("div","ttext",s?s.name:"???"));
  t.append(el("span","sx-lock","🔓"),body); $("toasts").prepend(t);
  setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },4500);
  if(navigator.vibrate) navigator.vibrate([30,50,30,50,80]);
  if(!$("profile").classList.contains("hidden")) paintSecrets();
  return true;
}
const secretBannerShown=new Set();
function playSecretFromMessage(m,s,force){
  if(!force&&!reducedMotion()) s.play(m); else if(force) s.play(m);
  else if(s.id==="choom") s.play(m);         // text swap is fine with reduced motion
  if(m.user_id===user.id) discoverSecret(s.id);
  else {
    const key=room+":"+s.id;
    if(!secretBannerShown.has(key)&&!force){ secretBannerShown.add(key);
      const t=el("div","toast"); const body=el("span","tbody");
      body.append(el("div","ttitle","🔓 Secret"), el("div","ttext",`${nameOf(m.user_id)} found a secret!`));
      const f=el("span","face"); paintFace(f,cache.get(m.user_id)); t.append(f,body); $("toasts").prepend(t);
      setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },3500);
    }
  }
}
function paintSecrets(){
  paintHint(); paintXP(); paintUnlocks();
  const f=foundSecrets();
  $("secretSummary").textContent=`🔒 Secrets found: ${countFound(f)}/${SECRET_LIST.length}`;
  const box=$("secretList"); box.innerHTML="";
  SECRET_LIST.forEach(s=>{ const got=f.includes(s.id); box.append(el("span","sx-chip"+(got?" got":""),got?s.name:"???")); });
  show($("motionBtn"), typeof DeviceMotionEvent!=="undefined" && typeof DeviceMotionEvent.requestPermission==="function" && !motionOn);
}

/* Konami code: swipe ↑↑↓↓←→←→ (or arrow keys), then double-tap the date stamp or the room name */
const KONAMI=["up","up","down","down","left","right","left","right"];
let konamiSeq=[], konamiArmedUntil=0, stampTaps=[];
function konamiPush(dir){
  konamiSeq.push(dir); konamiSeq=konamiSeq.slice(-8);
  if(konamiSeq.join()===KONAMI.join()){ konamiArmedUntil=Date.now()+10000; konamiSeq=[]; if(navigator.vibrate) navigator.vibrate(15); }
}
let swipeStart=null;
addEventListener("touchstart",e=>{ if(e.touches.length===1) swipeStart={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()}; },{passive:true});
addEventListener("touchend",e=>{
  if(!swipeStart) return; const p=e.changedTouches[0], dx=p.clientX-swipeStart.x, dy=p.clientY-swipeStart.y; const quick=Date.now()-swipeStart.t<700; swipeStart=null;
  if(!quick||Math.max(Math.abs(dx),Math.abs(dy))<40) return;
  konamiPush(Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up"));
},{passive:true});
addEventListener("keydown",e=>{
  if(e.target.closest&&e.target.closest("input,textarea")) return;
  const map={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
  if(map[e.key]) konamiPush(map[e.key]);
  else if((e.key==="b"||e.key==="a")&&Date.now()<konamiArmedUntil){ stampTap(); }
});
function stampTap(){
  if(Date.now()>konamiArmedUntil) return;
  const now=Date.now(); stampTaps=stampTaps.filter(t=>now-t<700); stampTaps.push(now);
  if(stampTaps.length>=2){ stampTaps=[]; konamiArmedUntil=0; unlockPhantom(); }
}
function unlockPhantom(){
  const fresh=discoverSecret("konami");
  if(!reducedMotion()) SX.phantomUnlock();
  if(!fresh){ $("status").textContent="Phantom theme is already unlocked. Find it in Theme & colors."; }
}
[$("sMonth")?.closest(".stamp"),$("roomLabel"),$("miniDate")].forEach(n=>n&&n.addEventListener("click",stampTap));

/* Tap the sun/moon 7 times: it winks and unlocks a secret sticker */
let iconTaps=[];
$("sIcon").addEventListener("click",()=>{
  const now=Date.now(); iconTaps=iconTaps.filter(t=>now-t<3000); iconTaps.push(now);
  const ic=$("sIcon"); ic.classList.remove("sx-tap"); void ic.offsetWidth; ic.classList.add("sx-tap");
  if(iconTaps.length>=7){ iconTaps=[]; ic.classList.remove("sx-wink"); void ic.offsetWidth; ic.classList.add("sx-wink"); setTimeout(()=>ic.classList.remove("sx-wink"),1400);
    const fresh=discoverSecret("moonwink"); $("stickerGrid").innerHTML="";
    if(!fresh) say("roomMsg","🦉 The night owl sticker is already in your sticker tray."); }
});

/* Shake your phone in a room: bubbles scatter and snap back */
let motionOn=false, lastShake=0, lastAcc=null;
function onMotion(e){
  const a=e.accelerationIncludingGravity; if(!a) return;
  if(lastAcc){ const d=Math.abs(a.x-lastAcc.x)+Math.abs(a.y-lastAcc.y)+Math.abs(a.z-lastAcc.z);
    if(d>32&&Date.now()-lastShake>2500&&room&&!$("chat").classList.contains("hidden")){ lastShake=Date.now(); if(!reducedMotion()) SX.scatter(); discoverSecret("shake"); } }
  lastAcc={x:a.x||0,y:a.y||0,z:a.z||0};
}
function startMotion(){ if(motionOn) return; motionOn=true; addEventListener("devicemotion",onMotion); }
if(typeof DeviceMotionEvent!=="undefined"&&typeof DeviceMotionEvent.requestPermission!=="function") startMotion();
$("motionBtn").onclick=async()=>{ try{ if(await DeviceMotionEvent.requestPermission()==="granted") startMotion(); }catch(e){} paintSecrets(); };

/* ================= SECRETS PACK 3: Persona, Steins;Gate & more ================= */
function hashMsg(m,salt=""){ let h=2166136261; for(const ch of salt+String(m?.id)+"|"+(m?.created_at||"")){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619)>>>0; } return h; }
function worldLineFor(m){ const h=hashMsg(m,"wl"); const whole=h%100<70?1:0; const frac=String(h%1000000).padStart(6,"0"); return `${whole}.${frac}`; }
const isShiny=m=>typeof m?.id==="number"&&hashMsg(m,"shiny")%500===0;
const ACHIEVEMENTS=["Professional Yapper","Touched Grass (Allegedly)","Certified Night Owl","Main Character Energy","Chat's Favorite","Emoji Overlord","Lore Master","Speedrunner of Replies","Keyboard Warrior","The Hype Train","Left on Read Survivor","Meme Archaeologist","Vibe Curator","Sleep Is Optional","Legend in the Group Chat"];
const PX=(()=>{
  const layer=$("sfx");
  const add=(cls,html="")=>{ const d=document.createElement("div"); d.className=cls; d.innerHTML=html; layer.append(d); return d; };
  const later=(fn,ms)=>setTimeout(fn,ms), R=(a,b)=>a+Math.random()*(b-a);
  const chatClass=(cls,ms)=>{ const c=$("chat"); c.classList.remove(cls); void c.offsetWidth; c.classList.add(cls); later(()=>c.classList.remove(cls),ms); };
  const chime=(notes)=>{ try{ const ac=window.__sxac||(window.__sxac=new (window.AudioContext||window.webkitAudioContext)()); notes.forEach(([f,at,len])=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type="sine"; o.frequency.value=f; g.gain.setValueAtTime(.0001,ac.currentTime+at); g.gain.exponentialRampToValueAtTime(.08,ac.currentTime+at+.02); g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+at+len); o.connect(g); g.connect(ac.destination); o.start(ac.currentTime+at); o.stop(ac.currentTime+at+len+.05); }); }catch(e){} };
  const nixie=(value,caption)=>{
    const box=add("px-nixie",`<div class="px-tubes">${[...value].map(ch=>`<span class="px-tube${ch==="."?" dot":""}">${ch==="."?".":"0"}</span>`).join("")}</div><div class="sx-caption">${caption}</div>`);
    const tubes=[...box.querySelectorAll(".px-tube:not(.dot)")], digits=[...value].filter(c=>c!==".");
    let n=0; const iv=setInterval(()=>{ n++; tubes.forEach((t,i)=>{ t.textContent= n>10+i*3 ? digits[i] : Math.floor(Math.random()*10); t.classList.toggle("set",n>10+i*3); }); if(n>10+tubes.length*3+2) clearInterval(iv); },60);
    later(()=>box.remove(),3600);
  };
  return {
    allout(m){
      const bg=add("sx-showtime-bg px-allbg");
      for(let i=0;i<3;i++){ const s=add("px-slash"); s.style.top=(20+i*25)+"%"; s.style.animationDelay=(i*.12)+"s"; later(()=>s.remove(),1400); }
      const ids=[...new Set([m?.user_id,...members.keys()].filter(Boolean))].slice(0,4);
      ids.forEach((uid,i)=>{ const f=el("div","face px-sil"); paintFace(f,cache.get(uid)); f.style.animationDelay=(.25+i*.12)+"s"; f.style.top=(28+i*12)+"%"; layer.append(f); later(()=>f.remove(),1900); });
      later(()=>{ const b=add("sx-banner sx-showtime","FINISH!"); later(()=>b.remove(),1300); },1000);
      chatClass("fx-shake",1000); later(()=>bg.remove(),2400);
    },
    callingcard(){
      const letters="TAKE YOUR HEART".split("").map(ch=>ch===" "?"<i class='sp'></i>":(()=>{ const pal=[["#E8182B","#F4F7FF"],["#07041A","#F4F7FF"],["#F4F7FF","#07041A"],["#F4F7FF","#E8182B"]][Math.floor(Math.random()*4)]; return `<b style="--r:${R(-14,14)}deg;background:${pal[0]};color:${pal[1]}">${ch}</b>`; })()).join("");
      const c=add("px-card",`<div class="px-cardtop">♠ CALLING CARD ♠</div><div class="px-letters">${letters}</div><div class="px-cardsig">— the phantoms</div>`);
      later(()=>c.classList.add("snatch"),2300); later(()=>c.remove(),3000);
    },
    persona(){
      const fl=add("px-flames"); for(let i=0;i<40;i++){ const f=document.createElement("i"); f.style.left=R(0,100)+"%"; f.style.animationDelay=R(0,.9)+"s"; f.style.setProperty("--s",R(.6,1.6)); fl.append(f); }
      const mask=add("px-mask",[...Array(6)].map((_,i)=>`<span style="--tx:${R(-40,40)}vw;--ty:${R(-40,30)}vh;--r:${R(-300,300)}deg;clip-path:polygon(${[[0,0,55,0,40,50],[55,0,100,0,70,45],[0,0,40,50,0,60],[70,45,100,0,100,60],[0,60,40,50,50,100],[40,50,70,45,100,60,50,100]][i].reduce((a,v,k)=>a+(k%2?v+"%,":v+"% "),"").replace(/,$/,"")})"></span>`).join(""));
      later(()=>mask.classList.add("shatter"),1100); later(()=>{ fl.remove(); mask.remove(); },2800);
    },
    velvet(){ const v=add("px-velvet",`<div class="px-beam"></div><div class="sx-caption">Welcome, guest…</div>`); later(()=>v.remove(),3800); },
    midnightchannel(){
      const tv=add("px-tv",`<canvas></canvas><div class="px-sil2"></div><div class="sx-caption">📺 midnight channel</div>`);
      const cv=tv.querySelector("canvas"), ctx=cv.getContext("2d"); cv.width=160; cv.height=120; const start=performance.now();
      const draw=now=>{ const img=ctx.createImageData(160,120); for(let i=0;i<img.data.length;i+=4){ const v=Math.random()*255; img.data[i]=v*1.05; img.data[i+1]=v*.95; img.data[i+2]=v*.4; img.data[i+3]=255; } ctx.putImageData(img,0,0); if(now-start<3000&&tv.isConnected) requestAnimationFrame(draw); };
      requestAnimationFrame(draw); later(()=>tv.remove(),3200);
    },
    darkhour(){ chatClass("px-green",4200); const d=add("px-dark",`<div class="px-bigmoon"></div><div class="px-clock">12:00</div>`); later(()=>d.remove(),4200); },
    rankup(){ const c=add("px-rank",`<div class="px-rankt">RANK UP!</div><div class="px-stars">${[...Array(10)].map((_,i)=>`<i style="animation-delay:${.3+i*.1}s">★</i>`).join("")}</div>`); later(()=>c.remove(),2600); chime([[523,0,.15],[659,.12,.15],[784,.24,.3]]); },
    batonpass(){ const last=[...feed.querySelectorAll(".msg.me")].pop(); if(last){ last.classList.remove("px-baton"); void last.offsetWidth; last.classList.add("px-baton"); later(()=>last.classList.remove("px-baton"),1200); } const b=add("px-swoosh","BATON PASS ➜"); later(()=>b.remove(),1400); },
    iamthou(){ chatClass("px-mirror",1800); const c=add("sx-caption px-center","I am thou… thou art I"); later(()=>c.remove(),1800); },
    lookingcool(m){
      feed.querySelectorAll(`.face[data-uid="${CSS.escape(m?.user_id||"")}"]`).forEach(f=>{ const s=el("span","px-shades","🕶️"); f.append(s); later(()=>s.remove(),3200); });
      const c=add("sx-caption px-center","looking cool 😎"); later(()=>c.remove(),1600);
    },
    elpsy(m){ nixie(worldLineFor(m),"El Psy Kongroo."); },
    worldline(m){ nixie(worldLineFor(m),"world line shift detected"); },
    tuturu(){ chime([[1046,0,.18],[1318,.14,.3]]); for(let i=0;i<14;i++){ const s=add("px-star","★"); s.style.setProperty("--tx",R(-35,35)+"vw"); s.style.setProperty("--ty",R(-30,30)+"vh"); s.style.color=["#F3FF3A","#E07AC6","#00F0FF"][i%3]; later(()=>s.remove(),1300); } const c=add("sx-caption px-center","Tuturu♪"); later(()=>c.remove(),1400); },
    dmail(m){
      const node=elById.get(m?.id); const tag=node?.querySelector(".tag"); const orig=tag?.lastChild?.nodeValue;
      if(node){ node.classList.remove("px-dmail"); void node.offsetWidth; node.classList.add("px-dmail"); }
      if(tag&&orig){ const base=new Date(m.created_at); let k=0; const iv=setInterval(()=>{ k++; const d=new Date(base-(k*k*97000)); tag.lastChild.nodeValue=` ${nameOf(m.user_id)} · ${d.toLocaleString([],{month:"numeric",day:"numeric",hour:"numeric",minute:"2-digit"})}`; if(k>14){ clearInterval(iv); later(()=>{ if(tag.isConnected) tag.lastChild.nodeValue=orig; },500); } },80); }
      const c=add("sx-caption px-center","📨 D-Mail sent to the past"); later(()=>c.remove(),1800);
    },
    timeleap(){ chatClass("px-rewind",2000); const cl=add("sx-clock px-backclock",`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#07041A" stroke="var(--cyan)" stroke-width="4"/><rect class="m" x="49" y="12" width="2" height="40" fill="var(--mag)"/><rect class="h" x="48.5" y="26" width="3" height="26" fill="var(--white)"/></svg><div class="sx-caption">⏪ time leap</div>`); later(()=>cl.remove(),2000); },
    organization(){
      const call=add("px-call",`<div class="px-caller">📞 UNKNOWN NUMBER</div><div class="px-ring">incoming call…</div><div class="px-callbtns"><span>✕</span><span>✆</span></div>`);
      if(navigator.vibrate) navigator.vibrate([400,200,400,200,400]);
      later(()=>{ call.querySelector(".px-ring").textContent="call ended."; call.classList.add("ended"); },2400); later(()=>call.remove(),3400);
    },
    hououin(){ const coat=add("px-coat",`<svg viewBox="0 0 120 160"><path d="M60 10 L30 26 L10 150 L50 150 L60 60 L70 150 L110 150 L90 26 Z" fill="#F4F7FF" stroke="#07041A" stroke-width="5"/><path d="M60 10 L48 60 L60 60 L72 60 Z" fill="#07041A"/></svg>`); later(()=>{ const b=add("sx-banner sx-showtime px-fwah","FWAHAHAHA!"); later(()=>b.remove(),1300); },500); later(()=>coat.remove(),1600); },
    microwave(){ chatClass("px-micro",2600); later(()=>{ chime([[1568,0,.5]]); const c=add("sx-banner px-ding","DING!"); later(()=>c.remove(),900); },2300); },
    snap(){
      const nodes=[...feed.querySelectorAll(".msg")].filter(()=>Math.random()<.5);
      nodes.forEach((n,i)=>{ n.style.animationDelay=(i*60)+"ms"; n.classList.add("px-dust"); });
      later(()=>nodes.forEach(n=>{ n.classList.remove("px-dust"); n.classList.add("px-undust"); n.style.animationDelay=""; later(()=>n.classList.remove("px-undust"),700); }),2600);
    },
    pressf(){ for(let i=0;i<28;i++){ const f=add("px-f","F"); f.style.left=R(4,92)+"%"; f.style.animationDelay=R(0,1.4)+"s"; f.style.fontSize=R(24,56)+"px"; later(()=>f.remove(),3400); } },
    achievement(m){ const t=ACHIEVEMENTS[hashMsg(m,"ach")%ACHIEVEMENTS.length]; const a=add("px-ach",`<div class="px-achicon">${pxIconHtml("coin",32)}</div><div><small>ACHIEVEMENT UNLOCKED</small><b>${t}</b></div>`); chime([[784,0,.12],[1175,.1,.25]]); later(()=>a.remove(),3300); },
    combo(n){ const b=add("px-combo",`COMBO <b>×${n}</b>!`); later(()=>b.remove(),1100); },
    owl(){ const t=add("px-owl",`<div class="px-owlface">🦉</div><div>It's late… <b>go to bed</b>, night owl.</div>`); later(()=>t.remove(),4200); },
    credits(){
      const names=[...new Set([...contactIds,...members.keys()].map(id=>cache.get(id)?.username).filter(Boolean))].filter(n=>!CREATOR_USERNAMES.includes(n.toLowerCase()));
      const c=add("px-credits",`<div class="px-roll"><h1>NightLane</h1><p>🌙</p><h2>Created by</h2><p>Cole</p><h2>Design & Neon</h2><p>Cole</p><h2>Special Thanks</h2>${(names.length?names:["everyone in the group chat"]).map(n=>`<p>${n.replace(/[<>&]/g,"")}</p>`).join("")}<h2>Built with</h2><p>late nights & good friends</p><p class="px-end">thanks for being here.</p></div>`);
      c.style.pointerEvents="auto"; c.onclick=()=>c.remove(); later(()=>c.remove(),14000);
    },
    halloween(){ if(typeof HW!=="undefined"){ HW.halloween(); return; } for(let i=0;i<22;i++){ const b=add("px-drift",i%3?"🦇":"🎃"); b.style.left=R(0,95)+"%"; b.style.animationDelay=R(0,2)+"s"; b.style.fontSize=R(22,44)+"px"; later(()=>b.remove(),5500); } },
    newyear(){ if(typeof FX!=="undefined"){ FX.play("confetti"); later(()=>FX.play("boom"),1200); } const b=add("sx-banner sx-showtime",`HAPPY ${new Date().getFullYear()}!`); later(()=>b.remove(),2200); },
    oct3(){   /* October 3rd: an engraved pocket watch, then a metal arm reaching for the sky */
      const scene=add("o3-scene",`<div class="o3-sky"></div><div class="o3-stars"></div><div class="o3-part o3-one"><svg class="o3-watch" viewBox="0 0 200 330" aria-hidden="true"><defs>
<radialGradient id="o3steel" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f4f6fb"/><stop offset=".55" stop-color="#aab1c2"/><stop offset="1" stop-color="#5d6476"/></radialGradient>
<radialGradient id="o3inner" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#d9dde8"/><stop offset="1" stop-color="#8d94a6"/></radialGradient>
<radialGradient id="o3face" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#e7e1cf"/></radialGradient></defs>
<g class="o3-lid"><circle cx="100" cy="88" r="74" fill="url(#o3steel)" stroke="#2b2f3a" stroke-width="4"/><circle cx="100" cy="88" r="62" fill="url(#o3inner)" stroke="#6b7284" stroke-width="2"/>
<g class="o3-scratch" fill="none" stroke-linecap="round"><g stroke="#3a3f4c" stroke-width="1.4" font-family="Courier New,monospace" font-size="14" font-weight="700" letter-spacing="1">
<text x="100" y="82" text-anchor="middle" fill="none" transform="rotate(-4 100 82)">DON'T FORGET</text><text x="100" y="108" text-anchor="middle" fill="none" transform="rotate(-2 100 108)">3. OCT</text></g>
<g stroke="#f5f7ff" stroke-opacity=".55" stroke-width=".6" font-family="Courier New,monospace" font-size="14" font-weight="700" letter-spacing="1"><text x="100.8" y="82.8" text-anchor="middle" fill="none" transform="rotate(-4 100 82)">DON'T FORGET</text><text x="100.8" y="108.8" text-anchor="middle" fill="none" transform="rotate(-2 100 108)">3. OCT</text></g>
<path d="M58 66 l18 -6 M124 118 l20 4 M70 122 l8 -14 M136 60 l-10 10" stroke="#4a4f5c" stroke-width=".9" stroke-opacity=".7"/></g></g>
<rect x="88" y="158" width="24" height="12" rx="3" fill="#7d8496" stroke="#2b2f3a" stroke-width="3"/>
<g class="o3-body"><circle cx="100" cy="242" r="74" fill="url(#o3steel)" stroke="#2b2f3a" stroke-width="4"/><circle cx="100" cy="242" r="60" fill="url(#o3face)" stroke="#6b7284" stroke-width="3"/>
<g stroke="#2b2f3a" stroke-linecap="round"><line x1="100" y1="188" x2="100" y2="200" stroke-width="3.5" transform="rotate(0 100 242)"/><line x1="100" y1="188" x2="100" y2="196" stroke-width="2" transform="rotate(30 100 242)"/><line x1="100" y1="188" x2="100" y2="196" stroke-width="2" transform="rotate(60 100 242)"/><line x1="100" y1="188" x2="100" y2="200" stroke-width="3.5" transform="rotate(90 100 242)"/><line x1="100" y1="188" x2="100" y2="196" stroke-width="2" transform="rotate(120 100 242)"/><line x1="100" y1="188" x2="100" y2="196" stroke-width="2" transform="rotate(150 100 242)"/><line x1="100" y1="188" x2="100" y2="200" stroke-width="3.5" transform="rotate(180 100 242)"/><line x1="100" y1="188" x2="100" y2="196" stroke-width="2" transform="rotate(210 100 242)"/><line x1="100" y1="188" x2="100" y2="196" stroke-width="2" transform="rotate(240 100 242)"/><line x1="100" y1="188" x2="100" y2="200" stroke-width="3.5" transform="rotate(270 100 242)"/><line x1="100" y1="188" x2="100" y2="196" stroke-width="2" transform="rotate(300 100 242)"/><line x1="100" y1="188" x2="100" y2="196" stroke-width="2" transform="rotate(330 100 242)"/></g>
<line x1="100" y1="242" x2="100" y2="210" stroke="#1a1d26" stroke-width="4" stroke-linecap="round" transform="rotate(95 100 242)"/>
<line class="o3-hand" x1="100" y1="250" x2="100" y2="196" stroke="#c0263a" stroke-width="2" stroke-linecap="round"/><circle cx="100" cy="242" r="5" fill="#1a1d26"/></g></svg></div><div class="o3-part o3-two"><svg class="o3-arm" viewBox="0 0 220 420" aria-hidden="true"><defs>
<linearGradient id="o3metal" x1="0" x2="1"><stop offset="0" stop-color="#5a6274"/><stop offset=".35" stop-color="#e6ebf5"/><stop offset=".6" stop-color="#a3abbd"/><stop offset="1" stop-color="#4b5263"/></linearGradient>
<linearGradient id="o3dark" x1="0" x2="1"><stop offset="0" stop-color="#2c313d"/><stop offset=".5" stop-color="#7b8396"/><stop offset="1" stop-color="#2c313d"/></linearGradient></defs>
<g stroke="#12141b" stroke-width="3" stroke-linejoin="round">
<path d="M78 420 L72 250 Q72 236 86 234 L134 234 Q148 236 148 250 L142 420 Z" fill="url(#o3metal)"/>
<path d="M80 300 L140 300 M79 360 L141 360" stroke="#3a404e" stroke-width="2"/>
<circle cx="92" cy="270" r="3.5" fill="#2c313d"/><circle cx="128" cy="270" r="3.5" fill="#2c313d"/><circle cx="92" cy="330" r="3.5" fill="#2c313d"/><circle cx="128" cy="330" r="3.5" fill="#2c313d"/>
<rect x="76" y="212" width="68" height="26" rx="6" fill="url(#o3dark)"/>
<path d="M70 214 L66 150 Q66 132 84 130 L136 130 Q154 132 154 150 L150 214 Z" fill="url(#o3metal)"/>
<path d="M72 172 L148 172" stroke="#3a404e" stroke-width="2"/>
<g fill="url(#o3metal)">
<path d="M70 140 L56 104 Q52 92 60 88 Q68 86 72 96 L86 132 Z"/>
<rect x="76" y="44" width="17" height="88" rx="7"/><path d="M76 86 h17 M76 64 h17" stroke="#3a404e" stroke-width="2"/>
<rect x="97" y="30" width="17" height="102" rx="7"/><path d="M97 80 h17 M97 56 h17" stroke="#3a404e" stroke-width="2"/>
<rect x="118" y="38" width="17" height="94" rx="7"/><path d="M118 84 h17 M118 60 h17" stroke="#3a404e" stroke-width="2"/>
<rect x="139" y="58" width="15" height="76" rx="7"/><path d="M139 96 h15 M139 78 h15" stroke="#3a404e" stroke-width="2"/></g></g>
<path d="M84 140 L86 410" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/></svg></div><div class="o3-cap">Don't forget.</div>`);
      later(()=>scene.remove(),9200);
    },
    aprilfools(){ chatClass("px-flip",4200); const c=add("sx-caption px-center","April Fools! 🤡"); later(()=>c.remove(),2200); },
    milestone(n){ if(typeof FX!=="undefined") FX.play("confetti"); const b=add("px-ach",`<div class="px-achicon">🎉</div><div><small>ROOM MILESTONE</small><b>Message #${n.toLocaleString()}!</b></div>`); later(()=>b.remove(),3500); }
  };
})();
SECRET_LIST.splice(SECRET_LIST.findIndex(s=>s.id==="konami"),0,
  {id:"allout", name:"All-Out Attack", re:/all[- ]out attack/i, play:m=>PX.allout(m)},
  {id:"callingcard", name:"Calling card", re:/calling card/i, play:()=>PX.callingcard()},
  {id:"persona", name:"Persona!", re:/(^|[^a-z])persona([^a-z]|$)/i, play:()=>PX.persona()},
  {id:"velvet", name:"Velvet Room", re:/velvet room/i, play:()=>PX.velvet()},
  {id:"midnightchannel", name:"Midnight Channel", re:/midnight channel/i, play:()=>PX.midnightchannel()},
  {id:"darkhour", name:"Dark Hour", re:/dark hour/i, play:()=>PX.darkhour()},
  {id:"rankup", name:"Rank up", re:/(^|[^a-z])rank(ed)? up([^a-z]|$)/i, play:()=>PX.rankup()},
  {id:"batonpass", name:"Baton pass", re:/baton pass/i, play:()=>PX.batonpass()},
  {id:"iamthou", name:"I am thou", re:/i am thou/i, play:()=>PX.iamthou()},
  {id:"lookingcool", name:"Looking cool", re:/looking cool/i, play:m=>PX.lookingcool(m)},
  {id:"elpsy", name:"El Psy Kongroo", re:/el psy (k|c)ongroo/i, play:m=>PX.elpsy(m)},
  {id:"tuturu", name:"Tuturu", re:/(^|[^a-z])tut?turu+([^a-z]|$)/i, play:()=>PX.tuturu()},
  {id:"dmail", name:"D-Mail", re:/(^|[^a-z])d-?mail([^a-z]|$)/i, play:m=>PX.dmail(m)},
  {id:"timeleap", name:"Time leap", re:/time[- ]?leap/i, play:()=>PX.timeleap()},
  {id:"organization", name:"The Organization", re:/the organi[sz]ation([^a-z]|$)/i, play:()=>PX.organization()},
  {id:"hououin", name:"Hououin Kyouma", re:/hou?ouin( kyou?ma)?/i, play:()=>PX.hououin()},
  {id:"worldline", name:"World line", re:/(^|[^a-z])world ?line([^a-z]|$)/i, play:m=>PX.worldline(m)},
  {id:"microwave", name:"Microwave", re:/(^|[^a-z])microwave([^a-z]|$)/i, play:()=>PX.microwave()},
  {id:"snap", name:"Snap", re:/(^|[^a-z])\*?snaps?\*?( fingers?)?([^a-z]|$)/i, play:()=>PX.snap()},
  {id:"pressf", name:"Press F", re:/press f([^a-z]|$)/i, play:()=>PX.pressf()},
  {id:"achievement", name:"Achievement", re:/(^|[^a-z])achievement([^a-z]|$)/i, play:m=>PX.achievement(m)},
  {id:"combo", name:"Combo", gesture:true},
  {id:"shiny", name:"Shiny ✨", gesture:true},
  {id:"lateowl", name:"3 AM owl", gesture:true},
  {id:"credits", name:"Credits", gesture:true}
);

/* things that happen when YOU send a message */
let myRecentSends=[];
async function afterMySend(m){
  sfx("send");
  gainXP(m.kind==="image"?"photo":m.kind==="audio"||m.kind==="video"?"voice":m.kind==="sticker"?"sticker":m.kind==="poll"?"poll":m.kind==="game"?"game":"message");
  if(m.reply_to) gainXP("reply");
  if(isDm&&dmUser) bumpLink(dmUser);
  const now=Date.now(); myRecentSends=myRecentSends.filter(t=>now-t<10000); myRecentSends.push(now);
  if(myRecentSends.length>=5&&fxEnabled()){ PX.combo(myRecentSends.length); if(myRecentSends.length===5) discoverSecret("combo"); }
  if(isShiny(m)){ discoverSecret("shiny"); const k=SHINY_KINDS.find(x=>x[0]===shinyKindOf(m)); toast(`✨ Shiny collected: ${k[1]} ${k[2]}!`,"Saved to your Shinydex, and your partner got a ⚡ Power boost. Tap to see.",()=>openPartner(user.id)); }
  partnerSoon(Date.now()-ptLastCheck>30000?4000:30000);
  const h=new Date().getHours();
  if(h>=3&&h<5){ const key="nl-owl-"+new Date().toDateString(); let seen=false; try{ seen=!!LS.get(key); LS.set(key,"1"); }catch(e){} if(!seen){ if(fxEnabled()) PX.owl(); discoverSecret("lateowl"); } }
  try{ const n=await api.countMessages(m.room); if([100,500,1000,5000,10000].includes(n)&&fxEnabled()) PX.milestone(n); }catch(e){}
}

/* seasonal surprises, once a day */
function seasonalCheck(where){
  if(!fxEnabled()||reducedMotion()) return;
  const d=new Date(), md=(d.getMonth()+1)+"-"+d.getDate(), key="nl-season-"+where+"-"+d.toDateString();
  let done=false; try{ done=!!LS.get(key); }catch(e){}
  const run=fn=>{ if(done) return; try{ LS.set(key,"1"); }catch(e){} setTimeout(fn,700); };
  if(where==="login"&&md==="10-31") run(()=>PX.halloween());
  if(where==="login"&&md==="1-1") run(()=>PX.newyear());
  if(where==="login"&&md==="10-3") run(()=>PX.oct3());
  if(where==="room"&&md==="4-1") run(()=>PX.aprilfools());
}

/* long-press the date stamp for the credits */
(function(){
  const stamp=$("sMonth").closest(".stamp"); let tm=null;
  const startP=()=>{ clearTimeout(tm); tm=setTimeout(()=>{ tm=null; PX.credits(); discoverSecret("credits"); if(navigator.vibrate) navigator.vibrate(30); },800); };
  const cancel=()=>{ clearTimeout(tm); tm=null; };
  stamp.addEventListener("pointerdown",startP); ["pointerup","pointerleave","pointercancel"].forEach(ev=>stamp.addEventListener(ev,cancel));
  stamp.addEventListener("contextmenu",e=>e.preventDefault());
})();

