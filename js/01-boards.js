/* Phone storage, safely. If the browser blocks saved data (Safari "Block All Cookies", some privacy modes),
   everything still works for this session from memory, and progress still syncs to your account. */
const LS=(()=>{ const mem={}; let ok=true;
  try{ const t="__nl_test"; localStorage.setItem(t,"1"); localStorage.removeItem(t); }catch(e){ ok=false; }
  return { ok,
    get(k){ if(ok){ try{ const v=localStorage.getItem(k); if(v!==null) return v; }catch(e){} } return Object.prototype.hasOwnProperty.call(mem,k)?mem[k]:null; },
    set(k,v){ mem[k]=String(v); if(ok){ try{ localStorage.setItem(k,String(v)); }catch(e){} } },
    remove(k){ delete mem[k]; if(ok){ try{ localStorage.removeItem(k); }catch(e){} } } }; })();
/* Motion: follows the device's "reduce motion" setting, unless you choose "Always play" in Profile */
const motionAlways=()=>LS.get("nl-motion")==="always";
const motionLess=()=>LS.get("nl-motion")==="less";   // "Less motion" picked inside NightLane, whatever the device says
const reducedMotion=()=>motionLess()||(!motionAlways()&&matchMedia("(prefers-reduced-motion: reduce)").matches);
if(motionAlways()) document.documentElement.classList.add("motion-always");
if(motionLess()) document.documentElement.classList.add("motion-less");
/* Accessibility: text size + color-blind friendly status symbols */
const TEXT_SIZES=[["s","Small"],["m","Normal"],["l","Large"],["xl","Extra large"]];
const textSize=()=>{ const v=LS.get("nl-textsize"); return TEXT_SIZES.some(t=>t[0]===v)?v:"m"; };
const cbMode=()=>LS.get("nl-cb")==="on";
function applyA11y(){ const h=document.documentElement; TEXT_SIZES.forEach(([k])=>h.classList.toggle("ts-"+k,textSize()===k&&k!=="m")); h.classList.toggle("cb",cbMode()); }
applyA11y();
// Checked before anything else runs (startup saves some settings, which would make everyone look "returning")
const NL_RETURNING=(()=>{ try{ return ["nl-xp","nl-secrets","nl-front-tab","nl-room","nl-uisound","nl-fx"].some(k=>LS.get(k)!==null); }catch(e){ return false; } })();
/* ================= KING'S COURT ================= */
function kcInCourt(i){ const r=(i/8)|0, c=i%8; return r>=2&&r<=5&&c>=2&&c<=5; }
function kcInitialBoard(){ const b=Array(64).fill(""); for(let i=0;i<64;i++){ if(kcInCourt(i)) continue; const r=(i/8)|0, c=i%8; b[i]=((r+c)%2===0)?"x":"o"; } return b; }
function kcNeighbors(i){ const r=(i/8)|0, c=i%8, out=[]; if(r>0) out.push(i-8); if(r<7) out.push(i+8); if(c>0) out.push(i-1); if(c<7) out.push(i+1); return out; }
function kcSimpleTargets(b,i){ return kcNeighbors(i).filter(n=>b[n]===""); }
function kcJumpTargets(b,i){
  const r=(i/8)|0, c=i%8, out=[];
  [[-2,0],[2,0],[0,-2],[0,2]].forEach(([dr,dc])=>{
    const nr=r+dr, nc=c+dc; if(nr<0||nr>7||nc<0||nc>7) return;
    const mid=i+(dr/2)*8+(dc/2), land=nr*8+nc;
    if(b[mid]&&b[land]==="") out.push({mid,land});
  });
  return out;
}
// Mirrors play_kingscourt() in Postgres exactly, so demo mode plays by the real rules
// and the live client can apply a move optimistically before the server confirms it.
/* how many moves this player has made. Your first TWO moves are simple steps (no jumping); the first one goes into the Court.
   Older games don't have the counter yet, so it's worked out from the game's move total (X always moves first). */
function kcMv(state,mark,gmoves){
  const v=state?.["mv_"+mark]; if(v!=null) return +v;
  if(!state?.["first_"+mark]) return 0;
  return gmoves!=null?(mark==="x"?Math.ceil(gmoves/2):Math.floor(gmoves/2)):2;
}
const kcNoJump=(state,mark,gmoves)=>kcMv(state,mark,gmoves)<2;
function kcApplyPath(state,mark,path,gmoves){
  const b=state.board.slice(), opp=mark==="x"?"o":"x";
  if(!path||path.length<2) throw new Error("That's not a move.");
  if(b[path[0]]!==mark) throw new Error("That's not your piece.");
  const seen=new Set([path[0]]);
  for(let k=1;k<path.length;k++){ if(seen.has(path[k])&&path[k]!==path[0]) throw new Error("A move can't land on a square it already passed through."); seen.add(path[k]); }
  const wasFirst=!state["first_"+mark], noJump=kcNoJump(state,mark,gmoves), opp0=mark==="x"?"o":"x";
  b[path[0]]="";
  const a=path[0], c=path[1], ar=(a/8)|0, ac=a%8, cr=(c/8)|0, cc=c%8, step=Math.abs(cr-ar)+Math.abs(cc-ac);
  if(path.length===2 && step===1 && (ar===cr||ac===cc)){
    if(b[c]!=="") throw new Error("That square is taken.");
    b[c]=mark;
  } else {
    if(wasFirst) throw new Error("Your first move has to be a simple step into the Court (no jumping yet).");
    if(noJump) throw new Error("No jumping on your first two moves. Take a simple step.");
    for(let k=0;k<path.length-1;k++){
      const A=path[k], C=path[k+1], Ar=(A/8)|0, Ac=A%8, Cr=(C/8)|0, Cc=C%8;
      const straight=(Ar===Cr&&Math.abs(Ac-Cc)===2)||(Ac===Cc&&Math.abs(Ar-Cr)===2);
      if(!straight) throw new Error("Jumps move exactly two squares in a straight line.");
      const mid=((Ar+Cr)/2|0)*8+((Ac+Cc)/2|0);
      if(b[mid]==="") throw new Error("There's nothing to jump there.");
      if(b[C]!=="") throw new Error("That landing square is taken.");
      if(b[mid]===opp) b[mid]="";
      b[A]="";   // lift the piece off the square it jumps from (a chain used to leave a copy on every landing)
      b[C]=mark;
    }
  }
  const final=path[path.length-1];
  if(wasFirst){ if(!kcInCourt(final)) throw new Error("Your first move has to land inside the Court."); }
  else { const myCourt=b.reduce((n,v,i)=>n+(v===mark&&kcInCourt(i)?1:0),0); if(myCourt===0) throw new Error("You always need at least one piece in the Court — that move would leave you with none."); }
  let oppCourt=b.reduce((n,v,i)=>n+(v===opp&&kcInCourt(i)?1:0),0);
  const oppTotal=b.reduce((n,v)=>n+(v===opp?1:0),0);
  if(oppTotal>0 && !state["first_"+opp]) oppCourt=1;
  const done = oppCourt===0 || oppTotal===0;
  return { board:b, turn: done?state.turn:opp, winner: done?mark:null, line:[],
           first_x: mark==="x"?true:!!state.first_x, first_o: mark==="o"?true:!!state.first_o,
           ["mv_"+mark]: kcMv(state,mark,gmoves)+1, ["mv_"+opp0]: kcMv(state,opp0,gmoves),
           last: path, done };
}
function kcBotPath(state,mark,gmoves){
  const b=state.board, opp=mark==="x"?"o":"x", mine=b.map((v,i)=>v===mark?i:-1).filter(i=>i>=0);
  const wasFirst=!state["first_"+mark];
  if(!wasFirst&&kcNoJump(state,mark,gmoves)){ for(const i of mine){ const t=kcSimpleTargets(b,i).find(t=>{ const nb=b.slice(); nb[i]=""; nb[t]=mark; return kcCourtCount(nb,mark)>0; }); if(t!==undefined) return [i,t]; } return null; }
  if(wasFirst){
    for(const i of mine){ for(const t of kcSimpleTargets(b,i)) if(kcInCourt(t)) return [i,t]; }
    for(const i of mine){ const t=kcSimpleTargets(b,i)[0]; if(t!==undefined) return [i,t]; }
    return null;
  }
  let best=null;
  for(const i of mine){
    const chains=kcAllChains(b,i,mark);
    for(const path of chains){
      const caps=path.length-1;
      const capturesOpp=path.slice(0,-1).some((p,k)=>{ const A=p,C=path[k+1]; const mid=(((A/8|0)+(C/8|0))/2|0)*8+(((A%8)+(C%8))/2|0); return b[mid]===opp; });
      if(!best||caps>best.caps) best={path,caps,capturesOpp};
    }
  }
  if(best&&best.path.length>1) return best.path;
  for(const i of mine){ const t=kcSimpleTargets(b,i)[0]; if(t!==undefined) return [i,t]; }
  return null;
}
function kcAllChains(b,start,mark){
  const results=[]; const walk=(board,path,seen)=>{
    const jumps=kcJumpTargets(board,path[path.length-1]).filter(j=>!seen.has(j.land));
    if(!jumps.length){ if(path.length>1) results.push(path.slice()); return; }
    for(const j of jumps){ const nb=board.slice(); nb[j.land]=mark; nb[path[path.length-1]]=""; walk(nb,[...path,j.land],new Set([...seen,j.land])); }
  };
  walk(b,[start],new Set([start]));
  return results;
}
function kcCourtCount(b,mark){ return b.reduce((n,v,i)=>n+(v===mark&&kcInCourt(i)?1:0),0); }
function kcPieceCount(b,mark){ return b.reduce((n,v)=>n+(v===mark?1:0),0); }

let kcSel=null, kcPath=null, kcChaining=false, kcPreview=null, kcHopsShown=0, kcOwn=null, kcAnimUntil=0;
function kcReset(){ kcSel=null; kcPath=null; kcChaining=false; kcPreview=null; kcHopsShown=0; }
/* one hop, played on the board as it is now: the piece arcs from -> to, a captured piece flashes and vanishes */
function kcHopAnim(from,to,capSq,opp,per=520){
  try{
    const board=$("board").querySelector(".kcboard"); if(!board||!e8Motion()){ GSFX.tap(); if(capSq!=null) GSFX.pop(); return; }
    const cells=board.children, piece=cells[to]?.querySelector(".kcpc"); if(!piece) return;
    const c=i=>{ const r=cells[i].getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; }, a=c(from), d=c(to);
    piece.style.zIndex="3";
    piece.animate([{transform:`translate(${a.x-d.x}px,${a.y-d.y}px)`},{transform:`translate(${(a.x-d.x)/2}px,${(a.y-d.y)/2-30}px) scale(1.3)`},{transform:"none"}],{duration:per,easing:"ease-in-out",fill:"backwards"}).onfinish=()=>piece.style.zIndex="";
    setTimeout(()=>GSFX.tap(),per-30); kcAnimUntil=Date.now()+per+600;
    if(capSq!=null&&cells[capSq]){ const gh=el("span","kcpc "+opp+" kcgone"); gh.style.zIndex="4"; cells[capSq].append(gh); setTimeout(()=>gh.remove(),per+700);
      gh.animate([{transform:"scale(1)",opacity:1},{transform:"scale(1.25)",opacity:1,filter:"brightness(3) saturate(0)",offset:.25},{transform:"scale(0) rotate(90deg)",opacity:0}],{duration:420,delay:per*.55,easing:"ease-out",fill:"both"});
      setTimeout(()=>GSFX.pop(),per*.55); }
  }catch(e){}
}
function kcBoardEl(g){
  const s=g.state, me=myMark(g), board=el("div","kcboard");
  const showBoard = kcPreview || s.board;
  const canPlay=g.status==="active"&&me&&s.turn===me;
  const wasFirst=canPlay&&!s["first_"+me], noJump=canPlay&&kcNoJump(s,me,g.moves);
  let targets=new Map();
  if(canPlay&&kcSel!=null){
    if(kcChaining){ kcJumpTargets(showBoard,kcSel).forEach(j=>targets.set(j.land,"jump")); }
    else if(wasFirst){ kcSimpleTargets(showBoard,kcSel).filter(kcInCourt).forEach(t=>targets.set(t,"simple")); }
    else { kcSimpleTargets(showBoard,kcSel).forEach(t=>targets.set(t,"simple")); if(!noJump) kcJumpTargets(showBoard,kcSel).forEach(j=>targets.set(j.land,"jump")); }
  }
  const lastSet=new Set(s.last||[]);
  for(let i=0;i<64;i++){
    const cell=el("button","kccell"+(kcInCourt(i)?" court":"")+(i===kcSel?" sel":"")+(targets.has(i)?" tgt-"+targets.get(i):"")); cell.type="button";   // (the last move's path only lights up while it's being shown, then clears)
    cell.setAttribute("aria-label",`${kcInCourt(i)?"Court, ":""}row ${((i/8)|0)+1}, column ${i%8+1}: ${showBoard[i]?showBoard[i].toUpperCase():"empty"}`);
    const v=showBoard[i];
    if(v){ const p=el("span","kcpc "+v); cell.append(p); }
    cell.disabled=!canPlay || (kcChaining && i!==kcSel && !targets.has(i)) || (!kcChaining && !(v===me || targets.has(i)));
    cell.onclick=()=>kcTap(g,i);
    board.append(cell);
  }
  return board;
}
/* King's Court animation: the piece slides (or hops, for jumps) along its path, captured pieces pop,
   and stepping into the Court sparkles. Works for your moves and your opponent's. */
/* older iPhones: their Safari can lack (or half-support) the animation tools, so never let a hiccup leave pieces behind */
function kcAnimateMove(g,prev,force){
  const board=$("board").querySelector(".kcboard"); if(!board) return;
  const p0=g.state.last||[];
  if(!force&&kcOwn&&kcOwn.key===JSON.stringify(p0)){ const sh=kcOwn.shown; kcOwn=null;
    if(sh>0){ const hops=p0.length-1; if(sh<hops){ const A=p0[hops-1], C=p0[hops], mid=((((A/8)|0)+((C/8)|0))/2|0)*8+(((A%8)+(C%8))/2|0), mover=g.state.board[C], opp=mover==="x"?"o":"x";
        kcHopAnim(A,C,(prev?.state?.board?.[mid]===opp&&!g.state.board[mid])?mid:null,opp); }
      return; } }
  const wipe=()=>board.querySelectorAll(".kcgone").forEach(n=>n.remove());
  const path=g.state.last||[];
  if(path.length>=2&&(force||JSON.stringify(path)!==JSON.stringify(prev?.state?.last||[]))){   // outline the path while it plays, then clear it
    path.forEach(i=>board.children[i]?.classList.add("last"));
    setTimeout(()=>path.forEach(i=>board.children[i]?.classList.remove("last")),path.length*(force?760:500)+1400);
  }
  if(typeof Element.prototype.animate!=="function"){ if(force) kcStepReplay(g); return; }
  try{ kcAnimateMoveRaw(g,prev,force); }catch(e){ wipe(); if(force) kcStepReplay(g); return; }
  setTimeout(wipe,7000);   // last safety net
}
/* no-animation replay: light up each square the piece visited, and mark captures with an ✕ */
function kcStepReplay(g){
  const path=g.state.last||[], cells=$("board").querySelector(".kcboard")?.children; if(!cells||path.length<2) return;
  const caps=[]; for(let k=0;k<path.length-1;k++){ const A=path[k], C=path[k+1]; if(Math.abs(((A/8)|0)-((C/8)|0))+Math.abs(A%8-C%8)===2){ const mid=((((A/8)|0)+((C/8)|0))/2|0)*8+(((A%8)+(C%8))/2|0); if(!g.state.board[mid]) caps.push([k,mid]); } }
  path.forEach((sq,k)=>setTimeout(()=>{ cells[sq]?.classList.add("kcstep"); caps.filter(c=>c[0]===k-1).forEach(c=>cells[c[1]]?.classList.add("kccap")); },k*700));
  setTimeout(()=>{ [...cells].forEach(c=>c.classList.remove("kcstep","kccap")); },path.length*700+1400);
}
function kcAnimateMoveRaw(g,prev,force){
  const path=g.state.last||[], was=prev?.state?.last||[];
  if(path.length<2||JSON.stringify(path)===JSON.stringify(was)||(!e8Motion()&&!force)) return;
  const board=$("board").querySelector(".kcboard"); if(!board) return;
  const cells=board.children, dest=path[path.length-1], piece=cells[dest]?.querySelector(".kcpc"); if(!piece) return;
  const c=i=>{ const r=cells[i].getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; }, d=c(dest);
  const jump=path.length>2||Math.abs(((path[0]/8)|0)-((path[1]/8)|0))+Math.abs(path[0]%8-path[1]%8)===2;
  const frames=[], hops=path.length-1;
  path.forEach((sq,k)=>{
    const p=c(sq); frames.push({transform:`translate(${p.x-d.x}px,${p.y-d.y}px) scale(1)`,offset:k/hops});
    if(jump&&k<hops){ const q=c(path[k+1]); frames.push({transform:`translate(${(p.x+q.x)/2-d.x}px,${(p.y+q.y)/2-d.y-30}px) scale(1.3)`,offset:(k+.5)/hops}); }
  });
  frames[frames.length-1]={transform:"translate(0,0) scale(1)",offset:1};
  const per=force?(jump?720:540):(jump?460:340);   // replays are slow so you can follow every hop
  kcAnimUntil=Date.now()+per*(path.length-1)+900;
  piece.style.zIndex="3"; piece.animate(frames,{duration:per*hops,easing:"ease-in-out",fill:"backwards"}).onfinish=()=>piece.style.zIndex="";
  for(let h=1;h<=hops;h++) setTimeout(()=>GSFX.tap(jump?1:.7),per*h-30);   // tap as it lands each time
  // captured pieces: whatever of the opponent's disappeared (except the moving piece's start square)
  const mover=prev.state.turn, opp=mover==="x"?"o":"x", pb=prev.state.board||[], nb=g.state.board||[];
  let k=0;
  // (the jumper arcs high over it, then the captured piece flashes white and shrinks away, so it never looks like it changed color)
  const hopAt=sq=>{ for(let h=0;h<hops;h++){ const A=path[h], C=path[h+1]; if(Math.abs(((A/8)|0)-((C/8)|0))+Math.abs(A%8-C%8)===2&&((((A/8)|0)+((C/8)|0))/2|0)*8+(((A%8)+(C%8))/2|0)===sq) return h; } return k++; };
  pb.forEach((v,i)=>{ if(v===opp&&!nb[i]){ const ghost=el("span","kcpc "+opp+" kcgone"), gd=per*(hopAt(i)+.75); setTimeout(()=>GSFX.pop(),gd); cells[i].append(ghost); ghost.style.zIndex="4"; setTimeout(()=>ghost.remove(),gd+700);
    ghost.animate([{transform:"scale(1)",opacity:1,filter:"none"},{transform:"scale(1.25)",opacity:1,filter:"brightness(3) saturate(0)",offset:.25},{transform:"scale(0) rotate(90deg)",opacity:0,filter:"brightness(3) saturate(0)"}],{duration:460,delay:gd,easing:"ease-out",fill:"both"}).onfinish=()=>ghost.remove();
    setTimeout(()=>ghost.remove(),gd+700); } });   // belt and braces: some phones skip onfinish, so it never gets left behind
  // stepping into the Court from outside sparkles
  if(kcInCourt(dest)&&!kcInCourt(path[0])){ setTimeout(()=>{ cells[dest].classList.add("kcspark"); setTimeout(()=>cells[dest]?.classList.remove("kcspark"),800); },per*hops); }
}
/* ===== Mancala board ===== your pits are always the bottom row, your store on the right */
function mcSeatView(g){ const me=myMark(g)||"x"; return me==="x"?{bottom:[0,1,2,3,4,5],top:[12,11,10,9,8,7],myStore:6,oppStore:13,me}:{bottom:[7,8,9,10,11,12],top:[5,4,3,2,1,0],myStore:13,oppStore:6,me}; }
function mcStones(n,seed){   // little pebbles, scattered the same way every time for the same pit
  const box=el("span","mcstones"); let r=seed*9301+49297;
  const rnd=()=>{ r=(r*9301+49297)%233280; return r/233280; };
  for(let k=0;k<Math.min(n,14);k++){ const st=el("i","mcstone c"+(k%4)); st.style.left=(18+rnd()*56)+"%"; st.style.top=(18+rnd()*56)+"%"; box.append(st); }
  return box;
}
function mcPitEl(g,i,kind){
  const b=g.state.board, me=myMark(g), mine=me&&((me==="x"&&i<=5)||(me==="o"&&i>=7&&i<=12));
  const canPlay=kind==="pit"&&g.status==="active"&&mine&&g.state.turn===me&&b[i]>0;
  const n=el(kind==="store"?"div":"button","mc"+kind+(canPlay?" can":"")); n.dataset.i=i;
  if(kind==="pit"){ n.type="button"; n.disabled=!canPlay; n.onclick=()=>mcMove(i); }
  n.setAttribute("aria-label",`${kind==="store"?(i===(me==="o"?13:6)?"Your store":"Their store"):mine?"Your pit":"Their pit"}: ${b[i]} stone${b[i]===1?"":"s"}`);
  n.append(mcStones(b[i],i+1),el("b","mccount",String(b[i])));
  return n;
}
function mcBoardEl(g){
  const v=mcSeatView(g), wrap=el("div","mcboard");
  const opp=el("div","mcside opp"), mine=el("div","mcside mine");
  v.top.forEach(i=>opp.append(mcPitEl(g,i,"pit"))); v.bottom.forEach(i=>mine.append(mcPitEl(g,i,"pit")));
  const rows=el("div","mcrows"); rows.append(opp,mine);
  wrap.append(mcPitEl(g,v.oppStore,"store"),rows,mcPitEl(g,v.myStore,"store"));
  return wrap;
}
function mcMini(g){
  const b=g?.state?.board||MC_START, box=el("div","mcmini");
  box.append(el("span","mcmini-s",String(b[13])),el("span","mcmini-row",b.slice(7,13).reverse().join(" ")+"\n"+b.slice(0,6).join(" ")),el("span","mcmini-s",String(b[6])));
  return box;
}
async function mcMove(pit){
  const g=gamesById.get(openGameId), me=g&&myMark(g);
  if(!g||g.status!=="active"||g.state.turn!==me) return;
  const before=JSON.parse(JSON.stringify(g));
  try{ const r=mcApply(g.state,me,pit); g.state=r.state; g.status=r.done?"done":"active"; }catch(err){ say("gameMsg",err.message,true); return; }
  paintGame(before); refreshMsg(g.message_id);
  try{ await api.playMancala(g.message_id,pit); }
  catch(err){ gamesById.set(g.message_id,before); paintGame(); refreshMsg(g.message_id); say("gameMsg",isNetworkError(err)?"You're offline. Try again when you're back.":"Move didn't go through: "+err.message,true); }
}
// sowing animation: a stone hops pit to pit, each pit bumps as it lands; captures fly to the store
function mcAnimate(g,prev){
  if(!e8Motion()) return;
  const l=g.state.last; if(!l||prev.state?.board?.[l.from]==null) return;
  let r; try{ r=mcApply(prev.state,l.by,l.from); }catch(e){ return; }
  const cellOf=i=>$("board").querySelector(`[data-i="${i}"]`), center=e=>{ const q=e.getBoundingClientRect(); return {x:q.left+q.width/2,y:q.top+q.height/2}; };
  const hop=Math.max(260,Math.min(430,5200/Math.max(1,r.path.length))), seq=[l.from,...r.path];   // slow enough to watch, still quick for huge sows
  // the pits count up as each stone lands (they start from the board before the move)
  const pb=prev.state.board.slice(), setPit=(i,n)=>{ const c=cellOf(i); if(!c) return; const ct=c.querySelector(".mccount"), st=c.querySelector(".mcstones"); if(ct) ct.textContent=String(n); if(st) st.replaceWith(mcStones(n,i+1)); };
  pb.forEach((n,i)=>{ if(n!==g.state.board[i]) setPit(i,n); }); setPit(l.from,0); const run=pb.slice(); run[l.from]=0;
  r.path.forEach((i,k)=>setTimeout(()=>{ run[i]++; setPit(i,run[i]); mcClick(run[i]); },hop*(k+1)));
  const capT=l.captured!=null?1900:0;
  mcAnimUntil=Date.now()+hop*r.path.length+capT+800;
  setTimeout(()=>g.state.board.forEach((n,i)=>{ if(run[i]!==n) setPit(i,n); }),hop*r.path.length+capT+80);   // land on the real final counts
  const gh=el("i","mcstone c1 mcflying"); document.body.append(gh);
  const pts=seq.map(i=>cellOf(i)).filter(Boolean).map(center);
  if(pts.length<2){ gh.remove(); return; }
  gh.style.left=(pts[0].x-6)+"px"; gh.style.top=(pts[0].y-6)+"px";
  const frames=[]; pts.forEach((p,k)=>{ frames.push({transform:`translate(${p.x-pts[0].x}px,${p.y-pts[0].y}px) scale(1)`,offset:k/(pts.length-1)});
    if(k<pts.length-1){ const q=pts[k+1]; frames.push({transform:`translate(${(p.x+q.x)/2-pts[0].x}px,${(p.y+q.y)/2-pts[0].y-16}px) scale(1.5)`,offset:(k+.5)/(pts.length-1)}); } });
  gh.animate(frames,{duration:hop*(pts.length-1),easing:"linear"}).onfinish=()=>gh.remove();
  r.path.forEach((i,k)=>{ const c=cellOf(i); c?.animate([{transform:"scale(1)"},{transform:"scale(1.14)",filter:"brightness(1.5)"},{transform:"scale(1)"}],{duration:260,delay:hop*(k+1)-60}); });
  cellOf(l.from)?.animate([{filter:"brightness(1.8)"},{filter:"none"}],{duration:400});
  const end=hop*r.path.length;
  if(l.captured!=null){ const storeI=l.by==="x"?6:13, lastI=r.path[r.path.length-1];
    setTimeout(()=>{ const from=cellOf(l.captured), mine=cellOf(lastI), to=cellOf(storeI); if(!from||!to) return;
      const got=Math.max(1,run[l.captured]+run[lastI]), b=center(to), flyers=[];   // every captured stone flies (up to 10), plus your last stone
      [[from,run[l.captured]],[mine,run[lastI]]].forEach(([cell,n])=>{ if(!cell) return; const a=center(cell); for(let k=0;k<Math.min(n,8);k++) flyers.push(a); });
      setPit(l.captured,0); setPit(lastI,0); let landed=run[storeI];
      flyers.slice(0,10).forEach((a,k)=>{ const s2=el("i","mcstone c"+(k%4)+" mcflying"); s2.style.left=(a.x-6+(k%3)*4)+"px"; s2.style.top=(a.y-6+((k/3)|0)*3)+"px"; document.body.append(s2);
        s2.animate([{transform:"none"},{transform:`translate(${b.x-a.x}px,${b.y-a.y-40}px) scale(1.5)`,offset:.5},{transform:`translate(${b.x-a.x}px,${b.y-a.y}px) scale(1)`}],{duration:700,delay:k*90,easing:"ease-in-out",fill:"backwards"}).onfinish=()=>s2.remove();
        setTimeout(()=>{ s2.remove(); },k*90+900);
        setTimeout(()=>{ landed=Math.min(g.state.board[storeI],landed+Math.ceil(got/Math.max(1,Math.min(flyers.length,10)))); setPit(storeI,landed); mcClick(5); },k*90+690); });
      const pop=el("span","mcpop","Capture!"); to.append(pop); pop.animate([{opacity:0,transform:"translate(-50%,0) scale(.6)"},{opacity:1,transform:"translate(-50%,-14px) scale(1.1)",offset:.3},{opacity:0,transform:"translate(-50%,-30px)"}],{duration:1100}).onfinish=()=>pop.remove(); },end+400); }
  if(l.extra){ const st=cellOf(l.by==="x"?6:13); if(st) setTimeout(()=>{ const pop=el("span","mcpop","Extra turn!"); st.append(pop);
    pop.animate([{opacity:0,transform:"translate(-50%,0) scale(.6)"},{opacity:1,transform:"translate(-50%,-14px) scale(1.1)",offset:.3},{opacity:0,transform:"translate(-50%,-30px)"}],{duration:1200}).onfinish=()=>pop.remove(); },end); }
}
/* ===== 🔊 GAME SOUNDS (2026.10.19d): all made in code, no sound files. They follow the Sounds setting. =====
   card flick / slide / riffle shuffle, dice rattle + bounce, Go stones, mahjong tiles, piece taps, capture pops. */
const GSFX=(()=>{
  let nb=null; const on=()=>typeof uiSoundOn!=="function"||uiSoundOn();
  const ctx=()=>{ const c=sfxCtx(); if(c.state==="suspended") c.resume(); return c; };
  const noise=c=>{ if(nb) return nb; nb=c.createBuffer(1,c.sampleRate,c.sampleRate); const d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; return nb; };
  const burst=(t,{f=2000,q=1,dur=.05,vol=.5,type="bandpass",att=.003,rate=1}={})=>{ const c=ctx(), s=c.createBufferSource(), fl=c.createBiquadFilter(), g=c.createGain();
    s.buffer=noise(c); s.playbackRate.value=rate; fl.type=type; fl.frequency.value=f; fl.Q.value=q;
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+att); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(fl).connect(g).connect(c.destination); s.start(t,Math.random()*.5); s.stop(t+dur+.02); };
  const tone=(t,{f0=600,f1=f0,dur=.08,vol=.3,type="sine"}={})=>{ const c=ctx(), o=c.createOscillator(), g=c.createGain(); o.type=type;
    o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t+dur+.02); };
  const R=(a,b)=>a+Math.random()*(b-a), now=()=>ctx().currentTime+.01;
  const play=fn=>{ if(!on()) return; try{ fn(now()); }catch(e){} };
  const flick=t=>{ burst(t,{f:R(2600,3400),q:1.4,dur:.045,vol:.55}); burst(t,{f:6500,q:2,dur:.015,vol:.25,type:"highpass"}); };
  return {
    flick:(n=1)=>play(t=>{ for(let k=0;k<n;k++) flick(t+k*R(.07,.1)); }),                        // play a card
    slide:()=>play(t=>{ const c=ctx(), s=c.createBufferSource(), fl=c.createBiquadFilter(), g=c.createGain(); s.buffer=noise(c); fl.type="bandpass"; fl.Q.value=.9;
      fl.frequency.setValueAtTime(900,t); fl.frequency.linearRampToValueAtTime(2200,t+.18); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.35,t+.06); g.gain.exponentialRampToValueAtTime(.0001,t+.22);
      s.connect(fl).connect(g).connect(c.destination); s.start(t); s.stop(t+.25); }),               // draw a card
    shuffle:()=>play(t=>{ let x=t; for(let k=0;k<28;k++){ burst(x,{f:R(2200,3800),q:1.6,dur:.03,vol:R(.25,.45)}); x+=R(.016,.03); }   // riffle...
      burst(x+.08,{f:1400,q:.7,dur:.25,vol:.3,att:.05}); burst(x+.36,{f:900,q:1,dur:.06,vol:.4}); }),  // ...bridge, then tap the deck square
    dice:(n=5)=>play(t=>{ tone(t,{f0:140,f1:90,dur:.08,vol:.25}); let x=t; for(let k=0;k<14;k++){ burst(x,{f:R(3000,4800),q:8,dur:.02,vol:R(.2,.4)}); x+=R(.025,.06); }   // rattle in the cup
      let y=x+.12, gap=.11; for(let k=0;k<Math.min(6,n+1);k++){ burst(y,{f:R(2500,3800),q:6,dur:.025,vol:.5*Math.pow(.75,k)}); tone(y,{f0:R(700,900),f1:500,dur:.03,vol:.12*Math.pow(.75,k)}); y+=gap; gap*=.7; } }),   // ...and they bounce
    tap:(v=1)=>play(t=>{ tone(t,{f0:R(380,440),f1:260,dur:.06,vol:.3*v}); burst(t,{f:R(1800,2300),q:3,dur:.025,vol:.45*v}); }),   // a piece set down
    stone:(caps=0)=>play(t=>{ burst(t,{f:R(2600,3200),q:4,dur:.03,vol:.8}); tone(t,{f0:R(950,1100),f1:650,dur:.05,vol:.2});    // slate on wood: "pak"
      for(let k=0;k<Math.min(caps,4);k++) burst(t+.12+k*.07,{f:R(3200,4200),q:6,dur:.025,vol:.4}); }),
    tile:(n=1)=>play(t=>{ for(let k=0;k<n;k++){ const x=t+k*.06; burst(x,{f:R(1800,2200),q:5,dur:.03,vol:.6}); burst(x+.012,{f:R(3200,3800),q:6,dur:.02,vol:.35}); tone(x,{f0:420,f1:300,dur:.04,vol:.15}); } }),
    pop:()=>play(t=>{ tone(t,{f0:320,f1:980,dur:.09,vol:.22,type:"triangle"}); burst(t,{f:3600,q:4,dur:.03,vol:.35}); }),
    thud:()=>play(t=>{ tone(t,{f0:130,f1:55,dur:.18,vol:.45}); burst(t,{f:500,q:.8,dur:.12,vol:.4,type:"lowpass"}); })   // slap the table (BS!, bust, Liar!)
  };
})();
/* what changed in a game -> which sound. Each game state is played once (the server echo of your own move stays quiet). */
const gsSeen=new Map();
function gameSound(g,prev){
  const a=prev.state||{}, b=g.state||{}, t=g.type;
  const key=(x,st,stt)=>JSON.stringify([t==="tictactoe"?x.board:t==="lucky7"?[x.rows,x.last]:x.last,x.round,stt,t==="go"?x.caps:0]);
  const sig=key(b,g.state,g.status);
  if(gsSeen.get(g.message_id)===sig) return; const first=!gsSeen.has(g.message_id); gsSeen.set(g.message_id,sig);
  if(first&&key(a,a,prev.status)===sig) return;
  const L=b.last||{}, started=prev.status==="waiting"&&g.status==="active", newRound=b.round!=null&&a.round!==b.round;
  if(t==="mancala") return;                                   // has its own clicks
  if(t==="kingscourt"){ if(!e8Motion()&&JSON.stringify(a.last)!==JSON.stringify(b.last)) GSFX.tap(); return; }   // (the animation taps each hop)
  if(t==="tictactoe"){ if(JSON.stringify(a.board)!==JSON.stringify(b.board)) GSFX.tap(); return; }
  if(t==="go"){ const caps=((b.caps?.x||0)+(b.caps?.o||0))-((a.caps?.x||0)+(a.caps?.o||0)); const at=typeof b.last==="object"?b.last?.at:b.last; if(JSON.stringify(a.last)!==JSON.stringify(b.last)&&at!=null&&at>=0) GSFX.stone(caps); return; }   // (pass / resign: no stone)
  if(t==="liarsdice"){ if(started||newRound) GSFX.dice(5); else if(L.called) GSFX.thud(); else if(L.qty) GSFX.tap(.6); return; }
  if(t==="mahjong"){ if(started) GSFX.shuffle(); else if(L.act==="discard") GSFX.tile(); else if(L.act==="claim") GSFX.tile(2); else if(L.act==="draw"||L.act==="wall") GSFX.slide(); else if(L.act==="win") GSFX.tile(3); return; }
  if(t==="blackout"){ if(started){ GSFX.shuffle(); return; }
    if(L.act==="place") GSFX.tile(); else if(L.act==="call"||L.act==="raise") GSFX.tap(.6);
    else if(L.act==="flip"){ if(L.tile==="B") GSFX.thud(); else { GSFX.flick(); if(L.end) setTimeout(()=>GSFX.pop(),160); } }
    else if(L.act==="won"&&L.tile==null) GSFX.flick();
    return; }
  // card games: Crazy Eights, BS, Lucky 7
  if(started||newRound){ GSFX.shuffle(); return; }
  if(t==="lucky7"){ const n=r=>(r||[]).reduce((s,x)=>s+((x?.n?.length)||0)+((x?.m?.length)||0),0); if(n(b.rows)>n(a.rows)) GSFX.flick(); if((b.rows||[]).some((r,i)=>r?.st==="bust"&&a.rows?.[i]?.st!=="bust")) GSFX.thud(); return; }
  if(L.called||L.caught) GSFX.thud();
  else if(L.drew||L.took) GSFX.slide();
  else if(L.played) GSFX.flick(Math.min(4,L.played));
  else if(L.card||L.lastcard||L.skipped) GSFX.flick();
}
let mcAnimUntil=0;
/* 🪵 a stone dropping into a wooden pit: a hollow knock, plus a little clack when it hits other stones. Made in code, no sound files. */
function mcClick(stonesNow){
  if(typeof uiSoundOn==="function"&&!uiSoundOn()) return;
  try{ const ctx=sfxCtx(); if(ctx.state==="suspended") ctx.resume(); const t=ctx.currentTime+.005, out=ctx.createGain(); out.gain.value=.5; out.connect(ctx.destination);
    // wood knock: a short low "tock"
    const o=ctx.createOscillator(), g=ctx.createGain(), f=180+Math.random()*60; o.type="sine"; o.frequency.setValueAtTime(f*1.6,t); o.frequency.exponentialRampToValueAtTime(f,t+.03);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.55,t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+.12); o.connect(g).connect(out); o.start(t); o.stop(t+.14);
    // the click: a tiny burst of filtered noise (brighter and doubled when it lands on other stones)
    const clack=(at,freq,vol)=>{ const len=.03, nb=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*len),ctx.sampleRate), d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,4);
      const s=ctx.createBufferSource(), bp=ctx.createBiquadFilter(), gg=ctx.createGain(); s.buffer=nb; bp.type="bandpass"; bp.frequency.value=freq; bp.Q.value=6; gg.gain.value=vol; s.connect(bp).connect(gg).connect(out); s.start(at); };
    clack(t,1800+Math.random()*500,.9);
    if(stonesNow>1){ clack(t+.035+Math.random()*.02,3200+Math.random()*900,.6); if(stonesNow>3) clack(t+.07+Math.random()*.03,3800+Math.random()*700,.35); }
  }catch(e){}
}
/* ===== Go board: tap a spot to preview, tap it again to place ===== */
let goPick=null, goResignArm=0;
function goBoardEl(g,prev){
  const s=g.state, me=myMark(g), can=g.status==="active"&&me&&s.turn===me, done=g.status==="done";
  const wrap=el("div","goboard-wrap"), board=el("div","goboard"); board.setAttribute("role","grid"); board.setAttribute("aria-label","Go board, 9 by 9");
  const NS="http://www.w3.org/2000/svg", svg=document.createElementNS(NS,"svg"); svg.setAttribute("class","gogrid"); svg.setAttribute("viewBox","0 0 9 9"); svg.setAttribute("aria-hidden","true");
  for(let k=0;k<9;k++){ [[.5,k+.5,8.5,k+.5],[k+.5,.5,k+.5,8.5]].forEach(([a,b2,c,d])=>{ const ln=document.createElementNS(NS,"line"); ln.setAttribute("x1",a); ln.setAttribute("y1",b2); ln.setAttribute("x2",c); ln.setAttribute("y2",d); ln.setAttribute("stroke","#3a2414"); ln.setAttribute("stroke-width",".04"); svg.append(ln); }); }
  GO_STARS.forEach(p=>{ const c=document.createElementNS(NS,"circle"); c.setAttribute("cx",p%9+.5); c.setAttribute("cy",((p/9)|0)+.5); c.setAttribute("r",".09"); c.setAttribute("fill","#3a2414"); svg.append(c); });
  board.append(svg);
  const own=done&&s.how==="score"?goScore(s.board).own:null, lastAt=s.last?.at, pb=prev?.state?.board;
  s.board.forEach((v,i)=>{
    const pt=el("button","gopt"+(can&&!v?" can":"")); pt.type="button"; pt.dataset.i=i; pt.setAttribute("role","gridcell");
    pt.setAttribute("aria-label",`Row ${((i/9)|0)+1}, column ${i%9+1}: ${v==="x"?"black stone":v==="o"?"white stone":"empty"}`);
    if(v){ const st=el("span","gost "+v+(i===lastAt?" last":"")+(pb&&pb[i]!==v&&i===lastAt?" new":"")); pt.append(st); }
    else if(can&&goPick===i){ pt.append(el("span","gost ghost "+me)); }
    else if(own&&own[i]) pt.append(el("span","goterr "+own[i]));
    if(pb&&pb[i]&&!v){ const gh=el("span","gost dying "+pb[i]); pt.append(gh); setTimeout(()=>gh.remove(),600); }   // captured: pop away
    pt.disabled=!can||!!v; pt.onclick=()=>goTap(g,i);
    board.append(pt);
  });
  wrap.append(board);
  const c=s.caps||{x:0,o:0}; wrap.append(el("div","gocaps",`CAPTURED · ⚫ Black ${c.x||0} · ⚪ White ${c.o||0}`));
  if(g.status==="active"&&me){
    const bar=el("div","gobar"), pass=el("button","",s.turn===me?"Pass":"Pass (wait for your turn)"), res=el("button","warn",goResignArm>Date.now()?"Tap again to resign":"Resign");
    pass.type=res.type="button"; pass.disabled=s.turn!==me;
    pass.onclick=()=>goSend(g,-1);
    res.onclick=()=>{ if(goResignArm>Date.now()){ goResignArm=0; goSend(g,-2); } else { goResignArm=Date.now()+3000; paintGame(); setTimeout(()=>{ if(goResignArm&&goResignArm<=Date.now()){ goResignArm=0; paintGame(); } },3100); } };
    bar.append(pass,res); wrap.append(bar);
  }
  return wrap;
}
function goMini(g){
  const b=g?.state?.board||Array(81).fill(""), box=el("div","gomini"); box.setAttribute("aria-hidden","true");
  b.forEach(v=>box.append(el("i",v||""))); return box;
}
function goStatus(g){
  const s=g.state, me=myMark(g), st=gameStatusText(g), col=m=>m==="x"?"Black":"White";
  if(g.status==="done"){
    if(s.how==="resign"){ const loser=s.winner==="x"?g.player_o:g.player_x; return (loser===user.id?"You resigned":`${nameOf(loser)} resigned`)+" · "+st.text; }
    if(s.score) return `⚫ ${s.score.x} – ⚪ ${s.score.o} · ${st.text}`;
    return st.text;
  }
  if(g.status!=="active") return st.text;
  const theyPassed=s.last?.at===-1&&s.last.by!==me;
  if(st.turn){
    if(theyPassed) return "They passed. Pass too to end and count, or keep playing.";
    if(goPick!=null) return "Tap the same spot again to place it";
    return `Your turn! (you're ${col(me)})`;
  }
  if(s.last?.at===-1&&s.last.by===me) return `You passed. ${st.text}`;
  return st.text;
}
function goTap(g,i){
  const me=myMark(g); if(g.status!=="active"||g.state.turn!==me||g.state.board[i]) return;
  if(goPick!==i){ goPick=i; paintGame(); return; }
  goPick=null; goSend(g,i);
}
async function goSend(g,move){
  const me=myMark(g); if(!me) return;
  const before=JSON.parse(JSON.stringify(g));
  try{ const r=goApply(g.state,me,move); g.state=r.state; g.status=r.done?"done":"active"; }catch(err){ say("gameMsg",err.message,true); goPick=null; paintGame(); return; }
  goPick=null; say("gameMsg",""); paintGame(before); refreshMsg(g.message_id);
  try{ await api.playGo(g.message_id,move); }
  catch(err){ gamesById.set(g.message_id,before); paintGame(); refreshMsg(g.message_id); say("gameMsg",isNetworkError(err)?"You're offline. Try again when you're back.":"Move didn't go through: "+err.message,true); }
}
function kcTap(g,i){
  const s=g.state, me=myMark(g), board=kcPreview||s.board;
  if(kcChaining){
    if(i===kcSel) return;
    const jt=kcJumpTargets(board,kcSel); const hit=jt.find(j=>j.land===i); if(!hit) return;
    const nb=board.slice(); const opp=me==="x"?"o":"x", cap=nb[hit.mid]===opp; if(cap) nb[hit.mid]=""; nb[i]=me; const from=kcSel; nb[kcSel]="";
    kcPreview=nb; kcPath.push(i); kcSel=i;
    if(!kcJumpTargets(nb,i).length) kcFinish(g); else { paintGame(); kcHopAnim(from,i,cap?hit.mid:null,opp); kcHopsShown=kcPath.length-1; }
    return;
  }
  if(board[i]===me){ kcSel=(kcSel===i)?null:i; paintGame(); return; }
  if(kcSel==null) return;
  const wasFirst=!s["first_"+me];
  const simple=kcSimpleTargets(board,kcSel), jumps=kcJumpTargets(board,kcSel);
  if(simple.includes(i)&&(!wasFirst||kcInCourt(i))){ kcPath=[kcSel,i]; kcFinish(g); return; }
  const hit=jumps.find(j=>j.land===i);
  if(hit&&!wasFirst&&!kcNoJump(s,me,g.moves)){ const nb=board.slice(); const opp=me==="x"?"o":"x"; if(nb[hit.mid]===opp) nb[hit.mid]=""; nb[i]=me; nb[kcSel]="";
    const from=kcSel, cap=board[hit.mid]===opp;
    kcPreview=nb; kcPath=[kcSel,i]; kcSel=i; kcChaining=true;
    if(!kcJumpTargets(nb,i).length) kcFinish(g); else { paintGame(); kcHopAnim(from,i,cap?hit.mid:null,opp); kcHopsShown=1; }
  }
}
async function kcFinish(g){
  const path=kcPath, before=JSON.parse(JSON.stringify(g)), shown=kcChaining?kcHopsShown:0; kcReset();
  kcOwn={key:JSON.stringify(path),shown};
  let applied; try{ applied=kcApplyPath(g.state,myMark(g),path,g.moves); }catch(err){ say("gameMsg",err.message,true); paintGame(); return; }
  g.state={board:applied.board,turn:applied.turn,winner:applied.winner,line:[],first_x:applied.first_x,first_o:applied.first_o,mv_x:applied.mv_x,mv_o:applied.mv_o,last:applied.last};
  g.status=applied.done?"done":"active"; paintGame(before); refreshMsg(g.message_id);
  try{ await api.playKingsCourt(g.message_id,path); if(!sb) setTimeout(()=>kcBotTurn(g.message_id),900); }
  catch(err){ gamesById.set(g.message_id,before); paintGame(); refreshMsg(g.message_id); say("gameMsg","Move didn't go through: "+err.message,true); }
}
/* ===== Go rules (mirrors play_go() in go.sql exactly) =====
   81 points, index = row*9 + col. "x" = Black (goes first), "o" = White. Pass = -1, resign = -2.
   Capture enemy groups with no liberties; no suicide; simple ko; two passes in a row = count it up (area scoring, White +6.5). */
const GO_KOMI=6.5, GO_STARS=[20,24,40,56,60];
function goStart(){ return {board:Array(81).fill(""),turn:"x",winner:null,line:[],last:null,ko:null,passes:0,caps:{x:0,o:0},score:null}; }
function goNbrs(p){ const r=[]; if(p>=9) r.push(p-9); if(p<72) r.push(p+9); if(p%9>0) r.push(p-1); if(p%9<8) r.push(p+1); return r; }
function goGroup(b,start){   // the connected group a stone is in, and how many liberties (empty neighbours) it has
  const col=b[start], stones=[start], seen=new Set(stones), libs=new Set();
  for(let k=0;k<stones.length;k++) for(const q of goNbrs(stones[k])){ if(b[q]==="") libs.add(q); else if(b[q]===col&&!seen.has(q)){ seen.add(q); stones.push(q); } }
  return {stones,libs:libs.size};
}
function goScore(b){   // stones + empty areas that touch only one colour
  const own=Array(81).fill(""), seen=new Set(); let x=0,o=0;
  for(let p=0;p<81;p++){
    if(b[p]==="x"){ x++; continue; } if(b[p]==="o"){ o++; continue; } if(seen.has(p)) continue;
    const region=[p]; seen.add(p); let tx=false,to=false;
    for(let k=0;k<region.length;k++) for(const r of goNbrs(region[k])){ if(b[r]==="x") tx=true; else if(b[r]==="o") to=true; else if(!seen.has(r)){ seen.add(r); region.push(r); } }
    const who=tx&&!to?"x":to&&!tx?"o":""; if(who){ region.forEach(q=>own[q]=who); if(who==="x") x+=region.length; else o+=region.length; }
  }
  return {x,o,own};
}
function goApply(state,mark,move){
  const opp=mark==="x"?"o":"x", caps={x:0,o:0,...(state.caps||{})};
  if(move===-2) return {state:{...state,winner:opp,how:"resign",last:{by:mark,at:-2}},done:true};
  if(state.turn!==mark) throw new Error("It's not your turn.");
  if(move===-1){
    const passes=(state.passes||0)+1;
    if(passes>=2){ const sc=goScore(state.board), xs=sc.x, os=sc.o+GO_KOMI;
      return {state:{...state,winner:xs>os?"x":"o",how:"score",passes,ko:null,score:{x:xs,o:os},last:{by:mark,at:-1}},done:true}; }
    return {state:{...state,turn:opp,passes,ko:null,last:{by:mark,at:-1}},done:false};
  }
  if(!(move>=0&&move<=80)) throw new Error("That's not a spot on the board.");
  const b=state.board.slice();
  if(b[move]) throw new Error("There's already a stone there.");
  if(state.ko!=null&&state.ko===move) throw new Error("Ko! You can't take back right away. Play somewhere else first.");
  b[move]=mark; const dead=[];
  for(const q of goNbrs(move)) if(b[q]===opp){ const gr=goGroup(b,q); if(!gr.libs) gr.stones.forEach(d=>{ if(!dead.includes(d)) dead.push(d); }); }
  dead.forEach(d=>b[d]="");
  const mine=goGroup(b,move);
  if(!mine.libs) throw new Error("You can't play there: your stones would have no liberties.");
  const ko=dead.length===1&&mine.stones.length===1&&mine.libs===1?dead[0]:null;
  caps[mark]=(caps[mark]||0)+dead.length;
  return {state:{...state,board:b,turn:opp,passes:0,ko,caps,last:{by:mark,at:move,dead}},done:false};
}
function goBotMove(state,mark){   // demo bot: capture > put them in atari > stay safe > near the action; never fills its own eyes
  const opp=mark==="x"?"o":"x", b=state.board; let best=-1, score=-1e9;
  if(state.passes&&b.filter(Boolean).length>40) return -1;
  for(let p=0;p<81;p++){
    if(b[p]) continue;
    const ns=goNbrs(p); if(ns.every(q=>b[q]===mark)) continue;   // its own eye
    let r; try{ r=goApply(state,mark,p); }catch(e){ continue; }
    const nb=r.state.board, me2=goGroup(nb,p);
    let v=r.state.last.dead.length*20+Math.random()*3;
    ns.forEach(q=>{ if(nb[q]===opp){ const g2=goGroup(nb,q); if(g2.libs===1) v+=6; v+=1; } });
    if(me2.libs===1) v-=15;
    const rr=(p/9)|0, cc=p%9; if(rr===0||rr===8||cc===0||cc===8) v-=2;
    if(v>score){ score=v; best=p; }
  }
  return best<0||score<-5?-1:best;
}
/* ===== Mancala rules (mirrors play_mancala() in Postgres exactly) =====
   Spots 0–5: X's pits · 6: X's store · 7–12: O's pits · 13: O's store. Sowing goes up the numbers (counter-clockwise). */
const MC_START=[4,4,4,4,4,4,0,4,4,4,4,4,4,0];
function mcApply(state,mark,pit){
  const b=state.board.slice(), myStore=mark==="x"?6:13, oppStore=mark==="x"?13:6, lo=mark==="x"?0:7;
  if(pit<lo||pit>lo+5) throw new Error("Pick one of the pits on your side.");
  let n=b[pit]; if(!n) throw new Error("That pit is empty. Pick one with stones.");
  const sown=n, path=[]; b[pit]=0; let i=pit;
  while(n){ i=(i+1)%14; if(i===oppStore) continue; b[i]++; n--; path.push(i); }
  let extra=i===myStore, captured=null;
  if(!extra&&i>=lo&&i<=lo+5&&b[i]===1&&b[12-i]>0){ captured=12-i; b[myStore]+=b[12-i]+1; b[12-i]=0; b[i]=0; }
  const xs=b.slice(0,6).reduce((a,c)=>a+c,0), os=b.slice(7,13).reduce((a,c)=>a+c,0), done=xs===0||os===0;
  let winner=null;
  if(done){ b[6]+=xs; b[13]+=os; for(let j=0;j<6;j++){ b[j]=0; b[j+7]=0; } winner=b[6]>b[13]?"x":b[13]>b[6]?"o":"draw"; }
  return {state:{board:b,line:[],winner,turn:done||extra?mark:(mark==="x"?"o":"x"),last:{by:mark,from:pit,to:i,extra:extra&&!done,captured,sown}},done,path};
}
function mcBotPit(state,mark){   // demo bot: grab an extra turn, else the biggest capture, else anything
  const lo=mark==="x"?0:7, opts=[...Array(6)].map((_,k)=>lo+k).filter(p=>state.board[p]>0);
  let best=null, score=-1;
  opts.forEach(p=>{ const r=mcApply(state,mark,p), st=mark==="x"?6:13, gain=r.state.board[st]-state.board[st]+(r.state.last.extra?3:0)+Math.random();
    if(gain>score){ score=gain; best=p; } });
  return best;
}
function kcBotTurn(id){
  const g=gamesById.get(id); if(!g||g.status!=="active"||myMark(g)===g.state.turn) return;
  const bot=g.state.turn; const path=kcBotPath(g.state,bot,g.moves); if(!path) return;
  try{ const before=JSON.parse(JSON.stringify(g)); const applied=kcApplyPath(g.state,bot,path,g.moves); g.moves=(g.moves||0)+1;
    g.state={board:applied.board,turn:applied.turn,winner:applied.winner,line:[],first_x:applied.first_x,first_o:applied.first_o,mv_x:applied.mv_x,mv_o:applied.mv_o,last:applied.last};
    g.status=applied.done?"done":"active"; paintGame(before); refreshMsg(id);
    if(!applied.done&&g.state.turn===bot) setTimeout(()=>kcBotTurn(id),700);
  }catch(e){}
}

