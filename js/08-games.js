/* ================= GAMES ================= */
const TTT_LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function tttResult(board){
  for(const l of TTT_LINES){ const [a,b2,c]=l; if(board[a]&&board[a]===board[b2]&&board[a]===board[c]) return {winner:board[a],line:l}; }
  return board.every(Boolean)?{winner:"draw",line:[]}:{winner:null,line:[]};
}
function applyTTT(g,cell,mark){
  g.state.board[cell]=mark; g.moves=(g.moves||0)+1;
  const r=tttResult(g.state.board); g.state.winner=r.winner; g.state.line=r.line;
  if(r.winner){ g.status="done"; } else g.state.turn=mark==="x"?"o":"x";
}
function tttBotMove(board,mark){
  const foe=mark==="x"?"o":"x", open=board.map((v,i)=>v?null:i).filter(i=>i!==null);
  const wins=m=>open.find(i=>{ const b2=[...board]; b2[i]=m; return tttResult(b2).winner===m; });
  return wins(mark)??wins(foe)??(open.includes(4)?4:open[Math.floor(Math.random()*open.length)]);
}
async function loadGames(list){
  const ids=list.filter(m=>m.kind==="game"&&!gamesById.has(m.id)).map(m=>m.id); if(!ids.length) return;
  const rows=await api.games(ids).catch(()=>[]);
  rows.forEach(g=>gamesById.set(g.message_id,g));
  await ensureProfiles(rows.flatMap(g=>[g.player_x,g.player_o]).filter(Boolean));
}
function myMark(g){ return g.player_x===user.id?"x":g.player_o===user.id?"o":null; }
function gameStatusText(g){
  const me=myMark(g), s=g.state||{}, xName=nameOf(g.player_x), oName=g.player_o?nameOf(g.player_o):"";
  if(g.status==="waiting") return {text: g.player_x===user.id?"Waiting for someone to join…":`${xName} wants to play!`, turn: g.player_x!==user.id};
  if(g.status==="done"){
    if(s.winner==="draw") return {text:"It's a draw 🤝",turn:false};
    const winnerId=s.winner==="x"?g.player_x:g.player_o;
    return {text: winnerId===user.id?"You won! 🏆":`${nameOf(winnerId)} won`, turn:false, won:winnerId===user.id};
  }
  const turnId=s.turn==="x"?g.player_x:g.player_o;
  if(turnId===user.id) return {text:"Your turn!",turn:true};
  return {text: me?`${nameOf(turnId)}'s turn`:`${xName} vs ${oName}`, turn:false};
}
function miniGrid(g){
  const box=el("span","minigrid"); box.setAttribute("aria-hidden","true");
  const s=g?.state||{board:Array(9).fill(""),line:[]};
  s.board.forEach((v,i)=>box.append(el("i",(v||"")+((s.line||[]).includes(i)?" win":""))));
  return box;
}
function kcMiniBoard(g){
  const box=el("span","minigrid kc-mini"); box.setAttribute("aria-hidden","true"); box.style.gridTemplateColumns="repeat(8,1fr)";
  const b=g?.state?.board||kcInitialBoard();
  b.forEach((v,i)=>box.append(el("i",(v||"")+(kcInCourt(i)?" court":""))));
  return box;
}
function gameCard(m){
  const g=gamesById.get(m.id);
  if(g?.type==="eights"||(!g&&m.text==="Crazy Eights")) return e8GameCard(m,g);
  if(g?.type==="liarsdice"||(!g&&m.text==="Liar's Dice")) return ldGameCard(m,g);
  if(g?.type==="bs"||(!g&&m.text==="BS")) return bsGameCard(m,g);
  if(g?.type==="lucky7"||(!g&&m.text==="Lucky 7")) return l7GameCard(m,g);
  if(g?.type==="mahjong"||(!g&&m.text==="Mahjong")) return mjGameCard(m,g);
  if(g?.type==="blackout"||(!g&&m.text==="Blackout")) return boGameCard(m,g);
  const card=el("div","gamecard");
  const isMC=g?.type==="mancala"||(!g&&m.text==="Mancala"), isGO=g?.type==="go"||(!g&&m.text==="Go");
  const top=el("div","gc-top"); top.append(isMC?mcMini(g):isGO?goMini(g):g?.type==="kingscourt"?kcMiniBoard(g):miniGrid(g));
  const info=el("div"); info.append(el("div","gc-title",isMC?"🟤 MANCALA":isGO?"⚫ GO":g?.type==="kingscourt"?"👑 KING'S COURT":"🎮 TIC-TAC-TOE"));
  if(!g){ info.append(el("div","gc-status","Loading…")); top.append(info); card.append(top); return card; }
  const st=gameStatusText(g); info.append(el("div","gc-status"+(st.turn?" turn":""),st.text));
  top.append(info); card.append(top);
  const mine=!!myMark(g);
  const label = g.status==="waiting" ? (g.player_x===user.id?"Open game":"Join game") : g.status==="done" ? (mine?"See board · Rematch":"See board") : (st.turn?"Play your turn":"Open game");
  const btn=el("button","play"+(st.turn?" big":""),label); btn.type="button";
  btn.onclick=e=>{ e.stopPropagation(); openGame(m.id); };
  card.append(btn);
  return card;
}
let openGameId=null;
function openGame(id){ rulesFor=null; openGameId=id; kcReset(); say("gameMsg",""); paintGame(); show($("gameSheet")); }
function closeGame(){ openGameId=null; kcReset(); show($("gameSheet"),false); }
$("gameClose").onclick=closeGame;
$("gameSheet").addEventListener("click",e=>{ if(e.target.id==="gameSheet") closeGame(); });
function playerTile(node,uid,mark,active){
  node.innerHTML=""; node.classList.toggle("active",!!active);
  const f=el("span","face"); if(uid) paintFace(f,cache.get(uid)); else f.append(el("span","fi","?"));
  node.append(f, el("span","pname",uid?(uid===user.id?"You":nameOf(uid)):"Open seat"), el("span","mark "+mark,mark.toUpperCase()));
}
function paintGame(prev){
  const g=gamesById.get(openGameId); if(!g){ closeGame(); return; }
  if(prev) try{ gameSound(g,prev); }catch(e){}
  // the same game state again (usually the server confirming a move we already drew): don't redraw, so animations play out
  if(prev&&prev!==g&&prev.status===g.status&&prev.player_x===g.player_x&&prev.player_o===g.player_o&&JSON.stringify(prev.state)===JSON.stringify(g.state)) return;
  paintGameRules(g);
  const e8=g.type==="eights", ld=g.type==="liarsdice", bs=g.type==="bs", l7=g.type==="lucky7", mj=g.type==="mahjong", bo=g.type==="blackout";
  show($("e8Area"),e8); show($("ldArea"),ld); show($("bsArea"),bs); show($("l7Area"),l7); show($("mjArea"),mj); show($("boArea"),bo); document.querySelector("#gameSheet .versus").classList.toggle("hidden",e8||ld||bs||l7||mj||bo); show($("board"),!e8&&!ld&&!bs&&!l7&&!mj&&!bo);
  if(bo){ paintBlackout(g,prev); return; }
  if(mj){ paintMahjong(g,prev); return; }
  if(l7){ paintLucky(g,prev); return; }
  if(e8){ paintEights(g,prev); return; }
  if(bs){ paintBS(g,prev); return; }
  if(ld){ paintDice(g,prev); return; }
  const isKC=g.type==="kingscourt", isMC=g.type==="mancala", isGO=g.type==="go";
  if(!isGO) goPick=null;
  $("gameTitle").textContent=isKC?"King's Court":isMC?"Mancala":isGO?"Go":"Tic-tac-toe"; show($("gameSub"),isKC||isMC||isGO);
  $("gameSub").textContent=isKC?"Pieces move one square up, down, left, or right. Get into the glowing Court and always keep a piece there."
    :isGO?"Black goes first. Tap a spot, then tap it again to place your stone. Surround empty points and capture stones."
    :"Tap a pit on your side to sow its stones counter-clockwise. Most stones in your store wins.";
  const s=g.state, st=gameStatusText(g), me=myMark(g);
  playerTile($("gpX"),g.player_x,"x",g.status==="active"&&s.turn==="x");
  playerTile($("gpO"),g.player_o,"o",g.status==="active"&&s.turn==="o");
  if(isGO){ $("gpX").querySelector(".mark").textContent="⚫"; $("gpO").querySelector(".mark").textContent="⚪"; }
  if(isMC){   // the score instead of X / O: stones in your store, and how many are still in your pits
    const b=s.board, side=m=>(m==="x"?b.slice(0,6):b.slice(7,13)).reduce((n,v)=>n+v,0);
    [["gpX","x",6],["gpO","o",13]].forEach(([id,m,store])=>{ const t=$(id), mk=t.querySelector(".mark");
      mk.replaceChildren(el("i","kcdot "+m),String(b[store])); mk.title="Stones in your store";
      t.append(el("small","kcsub",`in store · ${side(m)} left`)); });
  }
  if(isKC){   // a score instead of X / O: how many of the other player's pieces you've captured, and how many you have left
    const left=m=>s.board.filter(v=>v===m).length;
    [["gpX","x","o"],["gpO","o","x"]].forEach(([id,m,o])=>{ const t=$(id), mk=t.querySelector(".mark");
      mk.replaceChildren(el("i","kcdot "+m),String(Math.max(0,24-left(o)))); mk.title="Pieces captured";
      t.append(el("small","kcsub",`captured · ${left(m)} left`)); });
  }
  let statusText=st.text;
  if(isKC&&g.status==="active"){
    const wasFirst=me&&!s["first_"+me];
    if(kcChaining) statusText="Keep jumping, or tap Done";
    else if(st.turn&&wasFirst) statusText="Your first move: step into the glowing Court";
    else if(st.turn&&kcNoJump(s,me,g.moves)) statusText="Your second move: a simple step (no jumping yet)";
    else if(st.turn) statusText=`Your turn! (${kcCourtCount(s.board,me)} in the Court)`;
  }
  $("gameStatus").textContent=statusText; $("gameStatus").classList.toggle("good",!!(st.turn||st.won));
  const board=$("board");
  const mcKeep=isMC&&prev&&Date.now()<mcAnimUntil&&JSON.stringify(prev.state?.last)===JSON.stringify(g.state.last)&&JSON.stringify(prev.state.board)===JSON.stringify(g.state.board)&&!!board.querySelector(".mcboard");
  const kcKeep=isKC&&prev&&!kcPreview&&Date.now()<kcAnimUntil&&kcLastKey(prev)===kcLastKey(g)&&JSON.stringify(prev.state.board)===JSON.stringify(g.state.board)&&!!board.querySelector(".kcboard");
  if(!kcKeep&&!mcKeep) board.innerHTML="";
  if(isGO){
    board.className="goboard-host"; board.removeAttribute("role"); board.removeAttribute("aria-label"); board.append(goBoardEl(g,prev));
    show($("kcChainBar"),false); $("gameStatus").textContent=goStatus(g);
  } else if(isMC){
    if(!mcKeep){ board.className="mcboard-wrap"; board.removeAttribute("role"); board.setAttribute("aria-label","Mancala board"); board.append(mcBoardEl(g)); }
    show($("kcChainBar"),false);
    if(!mcKeep&&prev&&JSON.stringify(prev.state?.last)!==JSON.stringify(g.state.last)&&g.state.last) mcAnimate(g,prev);
    if(g.status==="active"&&g.state.turn===me&&g.state.last?.extra&&g.state.last.by===me) $("gameStatus").textContent="Extra turn! Go again 🎉";
  } else if(isKC){
    if(!kcKeep){ board.className="kcboard-wrap"; board.append(kcBoardEl(g)); }
    if(kcKeep){}
    else if(prev&&!kcPreview) kcAnimateMove(g,prev);
    else if(!prev&&!kcPreview&&kcSel==null&&g.status==="active"&&s.turn===me&&(s.last?.length||0)>=2&&kcSeenKey(g)!==kcLastKey(g)){   // opening the board on your turn: show what they just did
      const want=kcLastKey(g); setTimeout(()=>{ const cur=gamesById.get(g.message_id); if(cur&&openGameId===g.message_id&&kcLastKey(cur)===want&&kcSel==null&&!kcPreview) kcReplay(cur); },350); }
    if(s.last?.length>=2) kcSeen.set(g.message_id,kcLastKey(g));
    show($("kcChainBar"),kcChaining);
    show($("kcReplay"),!kcChaining&&(s.last?.length||0)>=2);
  } else {
    show($("kcReplay"),false);
    board.className="board"; board.removeAttribute("aria-label"); board.setAttribute("role","grid"); board.setAttribute("aria-label","Tic-tac-toe board");
    const canPlay=g.status==="active"&&me&&s.turn===me;
    s.board.forEach((v,i)=>{
      const cell=el("button","cell"+((s.line||[]).includes(i)?" win":"")); cell.type="button"; cell.setAttribute("role","gridcell");
      cell.setAttribute("aria-label",`Row ${Math.floor(i/3)+1}, column ${i%3+1}: ${v?v.toUpperCase():"empty"}`);
      if(v){ const mk=el("span",v); if(prev?.state?.board?.[i]===v) mk.style.animation="none"; cell.append(mk); }
      cell.disabled=!canPlay||!!v;
      cell.onclick=()=>makeMove(i);
      board.append(cell);
    });
  }
  show($("gameJoin"), g.status==="waiting" && g.player_x!==user.id);
  show($("gameRematch"), g.status==="done" && !!me && !kcChaining);
  if(g.status==="done"&&prev&&prev.status!=="done"){
    if(st.won) gainXP("gamewin");
    if(st.won&&fxEnabled()){ FX.play("confetti"); pxWin(); }
    if(navigator.vibrate) navigator.vibrate(st.won?[40,60,40]:60);
  } else if(prev?.state&&prev.state.turn!==s.turn&&s.turn===me&&navigator.vibrate) navigator.vibrate(25);
}
/* ↺ replay the last King's Court move: rebuild the board from just before it, then play the same animation */
const kcSeen=new Map(), kcLastKey=g=>JSON.stringify(g.state.last||[]), kcSeenKey=g=>kcSeen.get(g.message_id);
function kcReplay(g){
  const s=g.state, path=s.last||[]; if(path.length<2||!$("board").querySelector(".kcboard")) return;
  const b=s.board, dest=path[path.length-1], mover=b[dest]; if(!mover) return;
  const opp=mover==="x"?"o":"x", pb=b.slice();
  pb[dest]=""; pb[path[0]]=mover;
  for(let k=0;k<path.length-1;k++){ const A=path[k], C=path[k+1];
    if(Math.abs(((A/8)|0)-((C/8)|0))+Math.abs(A%8-C%8)===2){ const mid=((((A/8)|0)+((C/8)|0))/2|0)*8+(((A%8)+(C%8))/2|0); if(!b[mid]) pb[mid]=opp; } }   // an empty jumped square = a captured piece
  kcAnimateMove(g,{state:{last:[],board:pb,turn:mover}},true);
}
$("kcReplay").onclick=()=>{ const g=gamesById.get(openGameId); if(!g) return; paintGame(); requestAnimationFrame(()=>kcReplay(g)); };
$("kcDone").onclick=()=>{ const g=gamesById.get(openGameId); if(g&&kcChaining&&kcPath) kcFinish(g); };
async function makeMove(i){
  const g=gamesById.get(openGameId), me=g&&myMark(g);
  if(!g||g.status!=="active"||g.state.turn!==me||g.state.board[i]) return;
  const before=JSON.parse(JSON.stringify(g));
  applyTTT(g,i,me); paintGame(before); refreshMsg(g.message_id);
  try{ await api.playTicTacToe(g.message_id,i); }
  catch(err){ gamesById.set(g.message_id,before); paintGame(); refreshMsg(g.message_id); say("gameMsg","Move didn't go through: "+err.message,true); }
}
$("gameJoin").onclick=async()=>{
  const g=gamesById.get(openGameId); if(!g) return;
  $("gameJoin").disabled=true;
  try{ await api.joinGame(g.message_id); const before=JSON.parse(JSON.stringify(g));
    if(g.type==="eights"||g.type==="liarsdice"||g.type==="bs"||g.type==="lucky7"||g.type==="mahjong"||g.type==="blackout"){ if(!g.state.players.includes(user.id)) g.state.players.push(user.id); } else { g.player_o=user.id; g.status="active"; }
    paintGame(before); refreshMsg(g.message_id); }
  catch(err){ say("gameMsg","Couldn't join: "+err.message,true); }
  finally{ $("gameJoin").disabled=false; }
};
$("gameRematch").onclick=async()=>{
  const g=gamesById.get(openGameId); if(!g) return;
  $("gameRematch").disabled=true;
  try{ const m=await api.rematch(g.message_id); await addMessages([m]); openGame(m.id); }
  catch(err){ say("gameMsg","Couldn't start a rematch: "+err.message,true); }
  finally{ $("gameRematch").disabled=false; }
};

/* ================= GAME RULES 📖 =================
   Plain-language rules for every game. They open by themselves the first time you open a game type,
   any time from "📖 How to play", and from the Rules links in the Games tray. */
const GAME_RULES={
  blackout:{name:"Blackout",emoji:"🌑",players:"2–6 players (best with 3+)",goal:"Be the first to score 2 points, or the last one with tiles.",
    steps:["Everyone starts with 4 tiles: 3 <b>Neon</b> "+boTileHtml("N",1)+" and 1 <b>Blackout</b> "+boTileHtml("B",1)+". Only you can see yours.",
           "Each round starts with everyone setting <b>one tile face down</b> "+boTileHtml("back",1)+" on their stack.",
           "Then, in turn, either <b>stack another tile</b> or make a <b>call</b>: how many Neon tiles you can flip without hitting a Blackout.",
           "Once someone calls, everyone after them must <b>raise</b> the number or <b>drop out</b> for the round.",
           "When everyone else has dropped out, the caller flips. <b>Your own stack flips first</b>, top to bottom. Then you pick other stacks and flip their top tile, one at a time.",
           "Flip enough Neon and you score <b>1 point</b>. Hit a Blackout and you <b>lose one of your tiles</b> at random (only you find out which).",
           "Score <b>2 points</b> to win, or be the last player who still has tiles."],
    tip:"Your Blackout is your best bluff: stack it, then call big, and nobody will want to flip your stack. But if you win the call, you flip your own stack first!"},
  mahjong:{name:"Mahjong (Lite)",emoji:"🀄",players:"2–4 players",goal:"Be the first to make a hand of 4 sets and 1 pair (14 tiles).",
    steps:["There are 3 suits: <b>Dots</b> "+mjTileHtml("d3")+", <b>Bamboo</b> "+mjTileHtml("b3")+" and <b>Characters</b> "+mjTileHtml("c3")+", numbered 1–9, with 4 of each tile.",
           "Everyone starts with <b>13 tiles</b>. On your turn, <b>draw 1</b> tile, then <b>throw 1 away</b>.",
           "A <b>set</b> is 3 in a row of the same suit "+mjTileHtml("b4")+mjTileHtml("b5")+mjTileHtml("b6")+" or 3 of the same tile "+mjTileHtml("d7")+mjTileHtml("d7")+mjTileHtml("d7")+".",
           "A <b>pair</b> is 2 of the same tile "+mjTileHtml("c2")+mjTileHtml("c2")+".",
           "Get <b>4 sets + 1 pair</b> and hit <b>MAHJONG!</b> to win.",
           "If someone throws away the exact tile that finishes your hand, hit <b>MAHJONG!</b> to grab it, but be quick, before the next player draws!",
           "If the wall of tiles runs out first, the game is a draw."],
    tip:"Your hand sorts itself: sets glow cyan, your pair glows pink, and ★ marks tiles that are good to throw away. When you're one tile from winning, it tells you which tiles you need."},
  lucky7:{name:"Lucky 7",emoji:"🍀",players:"2–8 players",goal:"Be the first to 150 points.",
    steps:["On your turn, <b>Hit</b> to flip a card, or <b>Stay</b> to bank the points you have this round.",
           "Number cards go from 0 to 12, and big numbers are more common (there are twelve 12s but only one 1).",
           "Flip a number <b>you already have</b> and you <b>BUST</b>: 0 points this round.",
           "Get <b>7 different numbers</b> for <b>LUCKY 7</b>: +15 points, and the round ends for everyone.",
           "Specials: <b>🛡️ Shield</b> saves you from one bust · <b>❄️ Freeze</b> makes anyone you pick stay right now · <b>✖️2</b> doubles your numbers · <b>+4</b> and <b>+8</b> add points.",
           "When everyone has stayed or busted, the round is scored and a new one starts. First to <b>150</b> wins."],
    tip:"The more cards you have, the more likely the next one is a repeat. Know when to stay!"},
  tictactoe:{name:"Tic-tac-toe",emoji:"❌⭕",players:"2 players",goal:"Get three of your marks in a row.",
    steps:["One player is <b>X</b>, the other is <b>O</b>. X goes first.",
           "Take turns tapping an empty square to put your mark there.",
           "The first to get <b>3 in a row</b> (across, down, or diagonally) wins.",
           "If all 9 squares fill up with no 3 in a row, it's a <b>draw</b>."],
    tip:"Grab the middle square early. It's part of the most winning lines."},
  kingscourt:{name:"King's Court",emoji:"👑",players:"2 players",goal:"Leave your opponent with no pieces in the Court.",
    steps:["The glowing 4×4 square in the middle is <b>the Court</b>. Each player starts with 24 pieces around the edge.",
           "Pieces move <b>one square up, down, left, or right</b>, never diagonally.",
           "Your <b>first two moves</b> are simple steps (no jumping yet), and the first one has to go into the Court.",
           "<b>Jump</b> by hopping over a piece next to you onto the empty square just past it, in a straight line. Jump an opponent's piece to <b>capture</b> it; jumping your own just hops over.",
           "You can <b>chain jumps</b> in one turn and change direction between hops. Tap <b>Done</b> when you're finished.",
           "Once you're in, you must <b>always keep at least one piece in the Court</b>. A move that would empty it isn't allowed.",
           "You <b>win</b> when your opponent has no pieces left in the Court (after their first move), or no pieces at all."],
    tip:"Protect your Court pieces. Losing the last one is how games end."},
  eights:{name:"Crazy Eights",emoji:"🃏",players:"2–6 players",goal:"Be the first to get rid of all your cards.",
    steps:["Everyone gets <b>7 cards</b> (2 players) or <b>5 cards</b> (3–6 players). One card is flipped face up to start.",
           "On your turn, play a card that matches the top card's <b>suit</b> (♠ ♥ ♦ ♣) or <b>number</b>. Playable cards lift up and glow.",
           "<b>8s are wild.</b> Play one anytime and pick the suit the next player has to follow.",
           "Can't play? Tap the deck to <b>draw one card</b>. Play it if you can, or tap <b>Pass</b>.",
           "The <b>first player with no cards left wins</b>.",
           "Nobody can see your cards but you. If someone goes quiet for 2 minutes on their turn, anyone can <b>skip</b> them.",
           "<b>⚡ Wild mode</b> (the host picks it before dealing): <b>J</b> skips the next player, <b>Q</b> reverses the order, <b>2</b> makes the next player draw 2, and <b>Wild +4</b> picks the suit and makes them draw 4. Stack a 2 on a 2 (or a +4 on a +4) to pass it along!",
           "In Wild, tap <b>☝️ Last card!</b> before you're down to one. Forget, and anyone can tap <b>🚨 Catch!</b> to make you draw 2."],
    tip:"Save your 8s for when you're stuck. They can get you out of anything."},
  bs:{name:"BS",emoji:"🃏",players:"2–8 players (best with 3+)",goal:"Be the first to get rid of all your cards. (Also called Cheat or I Doubt It.)",
    steps:["The <b>whole deck is dealt out</b>, so everyone starts with lots of cards.",
           "Ranks go <b>in order</b>: Aces, then 2s, 3s, and so on up to Kings, then back to Aces. The rank you have to play is shown in the middle.",
           "On your turn, pick <b>1 to 4 cards</b> and play them <b>face down</b>, claiming they're all that rank. <b>You're allowed to lie.</b> (Cards that really match have a ✓.)",
           "Until the next player plays, <b>anyone</b> can tap <b>BS!</b> to call you out. The cards are flipped over.",
           "If <b>any</b> of them weren't what you claimed, <b>you</b> pick up the whole pile. If they were all real, the <b>caller</b> picks it up.",
           "When someone plays their <b>last cards</b>, everyone gets a chance to call BS. If they lied, they pick up the pile and play on. If nobody calls, or they were honest, <b>they win</b>.",
           "Someone gone quiet for 2 minutes on their turn? Anyone can <b>skip</b> them."],
    tip:"If you're holding three 7s and someone claims to play two 7s… somebody's lying. 😏"},
  go:{name:"Go",emoji:"⚫",players:"2 players",goal:"Own more of the board than your opponent: your stones plus the empty points you've surrounded.",
    steps:["Play on the <b>9×9 board</b>. <b>Black goes first</b>, then you take turns putting one stone on any empty point where the lines cross. Stones never move.",
           "Tap a spot to <b>preview</b> your stone, then tap it <b>again</b> to place it.",
           "Stones of the same colour that touch (up, down, left, right) are a <b>group</b>. The empty points next to a group are its <b>liberties</b>.",
           "Fill in a group's <b>last liberty</b> and you <b>capture</b> it: those stones come off the board.",
           "You <b>can't</b> play where your own stones would have no liberties, unless that move captures something.",
           "<b>Ko:</b> if a stone just captured one of yours, you can't capture it straight back. Play somewhere else first.",
           "Nothing good left to play? Tap <b>Pass</b>. When <b>both players pass in a row</b>, the game ends and gets counted.",
           "<b>Score</b> = your stones on the board + the empty points only you surround. <b>White gets 6.5 extra</b> for going second, so there are no ties. You can also <b>Resign</b> any time."],
    tip:"Before you both pass, capture any enemy stones that are trapped inside your area. Stones left on the board count for whoever owns them!"},
  mancala:{name:"Mancala",emoji:"🟤",players:"2 players",goal:"Have the most stones in your store when the game ends.",
    steps:["Each side has <b>6 pits</b> with 4 stones in each. Your pits are the bottom row, and <b>your store</b> is the big pit on your right.",
           "On your turn, tap one of <b>your pits</b>. Its stones are picked up and dropped <b>one at a time</b> into the next pits, counter-clockwise.",
           "Stones go into <b>your store</b> as they pass it, but <b>skip your opponent's store</b>. They do drop into your opponent's pits.",
           "If your <b>last stone lands in your store</b>, you get an <b>extra turn</b>.",
           "If your last stone lands in an <b>empty pit on your side</b>, you <b>capture</b> it plus all the stones in the pit directly across, and they go into your store.",
           "When either player's six pits are all empty, the game ends. The other player moves their leftover stones into their own store.",
           "<b>Most stones in your store wins.</b> A tie is a draw."],
    tip:"Count stones before you tap: landing the last one in your store gives you another turn, and you can chain them."},
  liarsdice:{name:"Liar's Dice",emoji:"🎲",players:"2–6 players",goal:"Be the last player with dice left.",
    steps:["Everyone starts with <b>5 dice</b> and rolls in secret. Only you can see yours.",
           "On your turn, <b>bid</b> on how many dice of one number are showing across <b>everyone's</b> dice, like \"four 5s\".",
           "<b>1s are wild</b>: they count as every number. (So you bid on 2s through 6s.)",
           "Each bid must go <b>higher</b>: more dice, or the same number of dice with a higher face.",
           "Think the last bid is wrong? Call <b>Liar!</b> Everyone's dice are revealed and counted.",
           "If there were fewer than the bid, the <b>bidder</b> loses a die. If there were at least that many, the <b>caller</b> loses one.",
           "The loser starts the next round and everyone re-rolls. Lose all your dice and you're out. <b>Last one standing wins.</b>",
           "Someone gone quiet for 2 minutes on their turn? Anyone can <b>skip</b> them, and they lose a die for stalling."],
    tip:"Count your own dice first. If you have three 5s (1s included), \"four 5s\" is a pretty safe bid."}
};
function renderRules(box,type){
  const r=GAME_RULES[type]; box.innerHTML=""; if(!r) return;
  box.append(el("div","rules-head",`${r.emoji} ${r.name} · ${r.players}`), el("p","rules-goal","🎯 Goal: "+r.goal));
  const ol=document.createElement("ol"); ol.className="rules-steps";
  r.steps.forEach(t=>{ const li=document.createElement("li"); li.innerHTML=t; ol.append(li); });   // rule text is written by us, never by users
  box.append(ol, el("p","rules-tip","💡 "+r.tip));
}
function openRulesSheet(type){ const r=GAME_RULES[type]; if(!r) return; $("rulesTitle").textContent=`How to play ${r.name}`; renderRules($("rulesBody"),type); show($("rulesSheet")); }
$("rulesClose").onclick=()=>show($("rulesSheet"),false);
$("rulesSheet").addEventListener("click",e=>{ if(e.target.id==="rulesSheet") show($("rulesSheet"),false); });
document.querySelectorAll(".rulelinks [data-rules]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); openRulesSheet(b.dataset.rules); });
let rulesFor=null;   // which game's rules are in the game screen's box
function paintGameRules(g){
  const box=$("gameRules"), btn=$("gameRulesBtn");
  if(rulesFor!==g.type){ rulesFor=g.type; renderRules(box,g.type);
    let seen=false; try{ seen=LS.get("nl-rules-seen-"+g.type)==="1"; LS.set("nl-rules-seen-"+g.type,"1"); }catch(e){}
    setRulesOpen(!seen); }   // first time you ever open this kind of game: show the rules
}
function setRulesOpen(on){ show($("gameRules"),on); $("gameRulesBtn").setAttribute("aria-expanded",String(on)); $("gameRulesBtn").textContent=on?"📖 Hide rules":"📖 How to play"; }
$("gameRulesBtn").onclick=()=>setRulesOpen($("gameRules").classList.contains("hidden"));

/* ================= CRAZY EIGHTS 🃏 =================
   Classic public-domain card game for 2–6 players. The server deals, keeps everyone's hand private,
   and checks every play; this draws the table and your hand. */
const E8_SUITS={S:"♠",H:"♥",D:"♦",C:"♣"}, E8_SUIT_NAME={S:"spades",H:"hearts",D:"diamonds",C:"clubs"};
const E8_RANK_NAME={A:"Ace",J:"Jack",Q:"Queen",K:"King"};
const e8Rank=c=>String(c).slice(0,-1), e8Suit=c=>String(c).slice(-1);
const E8_ACT={J:["⊘","Skip"],Q:["⇄","Reverse"],"2":["+2","Draw 2"]};
const E8_ART_RANKS=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
/* (moved to js/00-media.js) */
document.documentElement.style.setProperty("--card-art",`url(${CARD_ART})`);   // what these do in Wild mode
const e8CardName=c=>e8Rank(c)==="+4"?"Wild +4":`${E8_RANK_NAME[e8Rank(c)]||e8Rank(c)} of ${E8_SUIT_NAME[e8Suit(c)]}`;
const e8Pretty=c=>!c?"":e8Rank(c)==="+4"?"Wild +4":e8Rank(c)+E8_SUITS[e8Suit(c)];
function e8CardEl(c,{small=false,back=false,wild=false}={}){
  const w4=!back&&e8Rank(c)==="+4";
  const d=el("span","e8card"+(small?" sm":"")+(back?" back":"")+(w4?" wild4":"")+(!back&&!w4&&"HD".includes(e8Suit(c))?" red":""));
  if(w4){ d.append(el("b","","+4"),el("i","","✦")); d.setAttribute("aria-label","Wild +4"); return d; }
  const ri=E8_ART_RANKS.indexOf(e8Rank(c)), si="SHDC".indexOf(e8Suit(c));
  if(!back&&ri>=0&&si>=0){ d.classList.add("art"); d.style.backgroundPosition=`${ri/12*100}% ${si/4*100}%`; }
  if(!back){ d.append(el("b","",e8Rank(c)),el("i","",E8_SUITS[e8Suit(c)])); d.setAttribute("aria-label",e8CardName(c)+(wild&&E8_ACT[e8Rank(c)]?` (${E8_ACT[e8Rank(c)][1]})`:""));
    if(wild&&E8_ACT[e8Rank(c)]){ d.classList.add("act"); d.append(el("em","e8act",E8_ACT[e8Rank(c)][0])); } }
  return d;
}
const e8Seat=g=>(g.state.players||[]).indexOf(user.id);
const e8Wild=g=>g?.state?.mode==="wild";
const e8CanPlay=(g,c)=>{ const s=g.state;
  if(e8Wild(g)&&s.pending>0) return e8Rank(c)===s.pendkind;
  return e8Rank(c)==="8"||(e8Wild(g)&&e8Rank(c)==="+4")||e8Suit(c)===s.suit||e8Rank(c)===e8Rank(s.top); };
function e8LastText(g){
  const l=g.state.last; if(!l) return "";
  const who=l.by===user.id?"You":nameOf(l.by);
  if(l.card) return `${who} played ${e8Pretty(l.card)}${e8Rank(l.card)==="8"||e8Rank(l.card)==="+4"?` → ${E8_SUITS[l.suit]} ${E8_SUIT_NAME[l.suit]}`:""}${l.act==="skip"?" ⊘ next player skipped!":l.act==="reverse"?" ⇄ reversed!":l.act==="draw2"?" (+2!)":l.act==="draw4"?" (+4!)":""}`;
  if(l.took) return `${who} took ${l.took} card${l.took===1?"":"s"} 😵`;
  if(l.lastcard) return `${who}: "Last card!" ☝️`;
  if(l.caught) return `${who} caught ${l.caught===user.id?"you":nameOf(l.caught)} with one card! +2 🚨`;
  if(l.passed) return `${who} drew and passed`;
  if(l.drew) return `${who} drew a card`;
  if(l.skipped) return `${l.skipped===user.id?"Your":nameOf(l.skipped)+"'s"} turn was skipped`;
  return "";
}
function e8Status(g){
  const s=g.state, P=s.players||[], me=e8Seat(g), host=s.host;
  if(g.status==="waiting"){
    if(me<0) return {text:`${nameOf(host)} wants to play! (${P.length}/6)`,turn:true};
    return {text:host===user.id?`${P.length} player${P.length===1?"":"s"} in. Deal when everyone's here.`:`Waiting for ${nameOf(host)} to deal… (${P.length} in)`,turn:false};
  }
  if(g.status==="done") return s.winner===user.id?{text:"You won! 🏆",won:true}:{text:`${nameOf(s.winner)} won 🏆`};
  const up=P[s.turn];
  if(up===user.id&&e8Wild(g)&&s.pending>0) return {text:`+${s.pending} on you! Stack a ${s.pendkind==="+4"?"Wild +4":"2"} or take ${s.pending}.`,turn:true};
  if(up===user.id) return {text:s.drew?"You drew. Play a card or pass.":`Your turn! Match ${E8_SUITS[s.suit]} or ${e8Rank(s.top)==="+4"?"its suit":e8Rank(s.top)}, or play an 8${e8Wild(g)?" or Wild +4":""}.`,turn:true};
  return {text:`${nameOf(up)}'s turn`};
}
const e8Hands=new Map();   // message id -> {moves, cards}
async function e8Hand(g){
  if((g.state.players||[]).indexOf(user.id)<0||g.status==="waiting") return [];
  const hit=e8Hands.get(g.message_id); if(hit&&hit.moves===g.moves) return hit.cards;
  const cards=await api.eightsHand(g.message_id).catch(()=>hit?.cards||[]);
  e8Hands.set(g.message_id,{moves:g.moves,cards}); return cards;
}
function e8GameCard(m,g){
  const card=el("div","gamecard e8gc"), top=el("div","gc-top");
  top.append(g?.state?.top&&g.status!=="waiting"?e8CardEl(g.state.top,{small:true,wild:e8Wild(g)}):el("span","e8-gcicon","🃏"));
  const info=el("div"); info.append(el("div","gc-title","🃏 CRAZY EIGHTS"+(e8Wild(g)?" · WILD":"")));
  if(!g){ info.append(el("div","gc-status","Loading…")); top.append(info); card.append(top); return card; }
  const st=e8Status(g); info.append(el("div","gc-status"+(st.turn?" turn":""),st.text)); top.append(info); card.append(top);
  const inIt=e8Seat(g)>=0;
  const label=g.status==="waiting"?(inIt?(g.state.host===user.id?"Open lobby":"Open game"):"Join game"):g.status==="done"?(inIt?"See results · Rematch":"See results"):(st.turn?"Play your turn":inIt?"Open game":"Watch game");
  const btn=el("button","play"+(st.turn?" big":""),label); btn.type="button"; btn.onclick=e=>{ e.stopPropagation(); openGame(m.id); };
  card.append(btn); return card;
}
let e8Busy=false, e8PendingEight=null;
setInterval(()=>{ const g=gamesById.get(openGameId); if(g?.status==="active"&&!e8Busy){ if(g.type==="eights") paintEights(g); else if(g.type==="liarsdice") paintDice(g); else if(g.type==="bs") paintBS(g); else if(g.type==="lucky7") paintLucky(g); else if(g.type==="mahjong") paintMahjong(g); else if(g.type==="blackout") paintBlackout(g); } },20000);
async function e8Act(fn){
  if(e8Busy) return; e8Busy=true; say("gameMsg","");
  const id=openGameId;
  try{ await fn(); const [fresh]=await api.games([id]); if(fresh){ const prev=gamesById.get(id); gamesById.set(id,fresh); refreshMsg(id); if(openGameId===id) paintGame(prev); } }
  catch(err){ say("gameMsg",isNetworkError(err)?"You're offline. Try again when you're back.":err.message,true); }
  finally{ e8Busy=false; }
}
/* ---- card animations: remember where everything was before a redraw, then fly cards from there ---- */
const e8Motion=()=>!reducedMotion()&&typeof Element.prototype.animate==="function";
function e8Snapshot(){
  const r={hand:new Map(),chips:new Map()};
  r.deck=$("e8Draw").querySelector(".e8card")?.getBoundingClientRect();
  document.querySelectorAll("#e8Hand .e8play").forEach(b=>r.hand.set(b.dataset.card,b.getBoundingClientRect()));
  document.querySelectorAll("#e8Players .e8p").forEach(c=>r.chips.set(c.dataset.uid,c.getBoundingClientRect()));
  return r;
}
const e8Center=r=>({x:r.left+r.width/2,y:r.top+r.height/2});
function e8FlyInto(node,from,{spin=-22,delay=0,dur=460,flip=false}={}){   // animate a real element from where `from` was to where it is now
  if(!from||!from.width||!node) return; const to=node.getBoundingClientRect(); if(!to.width) return;
  const a=e8Center(from), b=e8Center(to), sc=Math.max(.35,Math.min(1.4,from.width/to.width||1));
  const base=getComputedStyle(node).transform; const end=base&&base!=="none"?base:"none";
  node.animate([
    {transform:`translate(${a.x-b.x}px,${a.y-b.y}px) rotate(${spin}deg) scale(${sc})${flip?" scaleX(.05)":""}`,opacity:.95},
    ...(flip?[{transform:`translate(${(a.x-b.x)*.45}px,${(a.y-b.y)*.45}px) rotate(${spin/2}deg) scale(1.05) scaleX(1)`,offset:.5}]:[]),
    {transform:`translate(0,-10px) rotate(0deg) scale(1.08)`,offset:.82},
    {transform:end,opacity:1}
  ],{duration:dur,delay,easing:"cubic-bezier(.2,.9,.3,1.15)",fill:"backwards"});
}
function e8Ghost(from,to,{back=true,card=null,dur=520}={}){   // a card that flies between two spots and disappears (e.g. a friend drawing)
  if(!from||!to) return; const gh=e8CardEl(card||"AS",{back,small:true}); gh.classList.add("e8ghost"); document.body.append(gh);
  const a=e8Center(from), b=e8Center(to); gh.style.left=(a.x-15)+"px"; gh.style.top=(a.y-21)+"px";
  gh.animate([{transform:"rotate(-10deg) scale(1)",opacity:1},{transform:`translate(${b.x-a.x}px,${b.y-a.y}px) rotate(18deg) scale(.7)`,opacity:.2}],{duration:dur,easing:"cubic-bezier(.3,.7,.3,1)"}).onfinish=()=>gh.remove();
}
function e8SuitBurst(suit){
  const pile=$("e8Top"); const b=el("span","e8burst"+("HD".includes(suit)?" red":""),E8_SUITS[suit]); pile.append(b);
  b.animate([{transform:"translate(-50%,-50%) scale(.3) rotate(-30deg)",opacity:0},{transform:"translate(-50%,-50%) scale(1.5) rotate(8deg)",opacity:1,offset:.35},{transform:"translate(-50%,-50%) scale(2.4) rotate(0deg)",opacity:0}],{duration:900,easing:"ease-out"}).onfinish=()=>b.remove();
}

async function paintEights(g,prev){
  const s=g.state, P=s.players||[], me=e8Seat(g), st=e8Status(g), myTurn=g.status==="active"&&P[s.turn]===user.id;
  const animate=!!prev&&e8Motion()&&openGameId===g.message_id;
  const before=animate?e8Snapshot():null, oldCards=[...(e8Hands.get(g.message_id)?.cards||[])];
  show($("kcChainBar"),false);
  const wildG=e8Wild(g);
  $("gameTitle").textContent="Crazy Eights"+(wildG?" · Wild":""); $("gameSub").textContent="Match the suit or number. 8s are wild. First to empty their hand wins."; show($("gameSub"),g.status==="waiting");
  $("gameStatus").textContent=st.text; $("gameStatus").classList.toggle("good",!!(st.turn||st.won));
  const row=$("e8Players"); row.innerHTML="";
  P.forEach((u,i)=>{ const chip=el("div","e8p"+(g.status==="active"&&i===s.turn?" turn":"")+(g.status==="done"&&u===s.winner?" won":""));
    chip.dataset.uid=u;
    const f=el("span","face"); paintFace(f,cache.get(u)); chip.append(f,el("span","pname",u===user.id?"You":nameOf(u)));
    if(g.status!=="waiting") chip.append(el("span","e8count",`🂠 ${s.counts?.[i]??"?"}`));
    if(wildG&&g.status==="active"&&me>=0&&u!==user.id&&s.counts?.[i]===1&&!s.called?.[i]){ const c=el("button","e8catch","🚨 Catch!"); c.type="button"; c.title=`${nameOf(u)} has one card and didn't call it`; c.onclick=()=>e8Act(()=>api.eightsCatch(g.message_id,i)); chip.append(c); }
    else if(wildG&&g.status==="active"&&s.counts?.[i]===1&&s.called?.[i]) chip.append(el("span","e8called","☝️"));
    row.append(chip); });
  $("e8Last").textContent=g.status==="waiting"?"":e8LastText(g);
  const playing=g.status!=="waiting";
  show(document.querySelector("#e8Area .e8-table"),playing);
  $("e8Top").innerHTML=""; $("e8Top").classList.toggle("stack",playing&&!!s.top); if(playing&&s.top) $("e8Top").append(e8CardEl(s.top,{wild:wildG}));
  if(playing&&wildG&&s.pending>0) $("e8Top").append(el("span","e8pend","+"+s.pending));
  // a new card on the pile: fly it in from whoever played it
  if(before&&playing&&s.top&&s.top!==prev?.state?.top&&prev?.status==="active"){
    const l=s.last||{}, from=(l.by===user.id&&before.hand.get(s.top))||before.chips.get(l.by)||before.deck;
    e8FlyInto($("e8Top").firstChild,from,{spin:l.by===user.id?-28:24,dur:480});
    if(e8Rank(s.top)==="8"||e8Rank(s.top)==="+4") setTimeout(()=>e8SuitBurst(s.suit),380);
  }
  // a friend drew: a face-down card slides from the deck to them
  if(before&&s.last?.drew&&s.last.by!==user.id&&JSON.stringify(s.last)!==JSON.stringify(prev?.state?.last)) e8Ghost(before.deck,before.chips.get(s.last.by));
  $("e8Suit").textContent=playing&&s.suit?`${E8_SUITS[s.suit]} ${e8Rank(s.top)==="8"||e8Rank(s.top)==="+4"?E8_SUIT_NAME[s.suit]:""}${wildG&&(s.dir||1)<0?" · ⇄":""}`:""; $("e8Suit").className="e8-suit"+("HD".includes(s.suit||"")?" red":"");
  const takeN=wildG&&myTurn?(+s.pending||0):0;
  $("e8DeckN").textContent=playing?(takeN?`Take +${takeN}`:`Draw (${s.deck??0})`):""; $("e8Draw").disabled=!myTurn||(!!s.drew&&!takeN)||e8Busy; $("e8Draw").classList.toggle("take",!!takeN);
  const myN=me>=0?s.counts?.[me]:null;
  show($("e8LastCard"),wildG&&g.status==="active"&&me>=0&&myN<=2&&myN>0&&!s.called?.[me]);
  show($("e8ModePick"),g.status==="waiting"&&s.host===user.id);
  document.querySelectorAll("#e8ModePick [data-mode]").forEach(b=>b.setAttribute("aria-checked",String(b.dataset.mode===e8ModeChoice)));
  show($("e8Pass"),myTurn&&!!s.drew);
  const stale=g.status==="active"&&!myTurn&&me>=0&&Date.now()-new Date(g.updated_at||Date.now()).getTime()>120000;
  show($("e8Skip"),stale); if(stale) $("e8Skip").textContent=`Skip ${nameOf(P[s.turn])}'s turn`;
  show($("e8Deal"),g.status==="waiting"&&s.host===user.id); $("e8Deal").disabled=P.length<2; $("e8Deal").textContent=P.length<2?"Waiting for players…":`Deal cards (${P.length} players)`;
  show($("gameJoin"),g.status==="waiting"&&me<0&&P.length<6);
  show($("gameRematch"),g.status==="done"&&me>=0);
  if(!myTurn) { show($("e8SuitPick"),false); e8PendingEight=null; }
  // your hand
  const handBox=$("e8Hand"); show(handBox,playing&&me>=0);
  if(playing&&me>=0){
    const cards=await e8Hand(g); if(openGameId!==g.message_id) return;
    const order="SHDC", ranks=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    const sorted=[...cards].sort((a,b)=>(e8Rank(a)==="+4")-(e8Rank(b)==="+4")||order.indexOf(e8Suit(a))-order.indexOf(e8Suit(b))||ranks.indexOf(e8Rank(a))-ranks.indexOf(e8Rank(b)));
    handBox.innerHTML="";
    const mid=(sorted.length-1)/2;
    sorted.forEach((c,idx)=>{ const can=myTurn&&e8CanPlay(g,c)&&!(wildG&&s.drew&&false), b=el("button","e8play"+(can?" can":myTurn?" cant":"")); b.type="button";
      b.dataset.card=c; b.style.setProperty("--r",((idx-mid)*Math.min(4,28/Math.max(1,sorted.length)))+"deg"); b.style.setProperty("--y",(Math.abs(idx-mid)*Math.min(2.2,14/Math.max(1,sorted.length)))+"px");
      b.append(e8CardEl(c,{wild:wildG})); b.setAttribute("aria-label",e8CardName(c)+(can?", playable":"")); b.disabled=!can;
      b.onclick=()=>{ if(e8Rank(c)==="8"||e8Rank(c)==="+4"){ e8PendingEight=c; show($("e8SuitPick")); return; } e8Act(()=>api.eightsPlay(g.message_id,c)); };
      handBox.append(b); });
    if(!cards.length&&g.status==="active") handBox.append(el("p","note","No cards?"));
    // new cards in your hand fly out of the deck: the whole hand when it's dealt, one card when you draw
    if(before||(e8Motion()&&prev&&prev.status==="waiting")){
      const fresh=prev?.status==="waiting"||!oldCards.length?sorted:sorted.filter(c=>!oldCards.includes(c));
      const deckR=(before?.deck?.width?before.deck:null)||$("e8Draw").querySelector(".e8card")?.getBoundingClientRect();   // the deck is hidden in the lobby, so use where it is now
      if(fresh.length&&fresh.length<=10) fresh.forEach((c,k)=>{ const node=handBox.querySelector(`[data-card="${c}"]`); e8FlyInto(node,deckR,{spin:-35,delay:k*(fresh.length>1?110:0),dur:520,flip:true}); });
    }
  }
  if(g.status==="done"&&prev&&prev.status!=="done"){
    if(st.won){ gainXP("gamewin"); if(fxEnabled()){ FX.play("confetti"); pxWin(); } }
    if(navigator.vibrate) navigator.vibrate(st.won?[40,60,40]:60);
  } else if(prev?.state&&prev.state.turn!==s.turn&&myTurn&&navigator.vibrate) navigator.vibrate(25);
}
Object.entries(E8_SUITS).forEach(([k,v])=>{ const b=el("button","e8suitbtn"+("HD".includes(k)?" red":""),v); b.type="button"; b.setAttribute("aria-label",E8_SUIT_NAME[k]);
  b.onclick=()=>{ const c=e8PendingEight, g=gamesById.get(openGameId); if(!c||!g) return; show($("e8SuitPick"),false); e8PendingEight=null; e8Act(()=>api.eightsPlay(g.message_id,c,k)); };
  $("e8SuitPick").append(b); });
$("e8Draw").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.eightsDraw(g.message_id)); };
$("e8Pass").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.eightsPass(g.message_id)); };
$("e8Skip").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.eightsSkip(g.message_id)); };
let e8ModeChoice=(()=>{ try{ return LS.get("nl-e8-mode")==="wild"?"wild":"classic"; }catch(e){ return "classic"; } })();
document.querySelectorAll("#e8ModePick [data-mode]").forEach(b=>b.onclick=()=>{ e8ModeChoice=b.dataset.mode; try{ LS.set("nl-e8-mode",e8ModeChoice); }catch(e){} document.querySelectorAll("#e8ModePick [data-mode]").forEach(x=>x.setAttribute("aria-checked",String(x.dataset.mode===e8ModeChoice))); });
$("e8Deal").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(async()=>{ try{ await api.eightsStart(g.message_id,e8ModeChoice); }catch(err){ if(/eights_start_mode|schema cache|does not exist/i.test(err.message)) throw new Error("Wild mode needs a quick setup: run eights-wild.sql in Supabase."); throw err; } }); };
$("e8LastCard").onclick=()=>{ const g=gamesById.get(openGameId); if(g){ e8Act(()=>api.eightsLastCard(g.message_id)); if(fxEnabled()&&navigator.vibrate) navigator.vibrate(40); } };

/* ================= LIAR'S DICE 🎲 =================
   Bluffing dice game for 2–6 players. Your dice are private (same table as card hands). The server checks
   every bid and does the counting when someone calls Liar!. */
const LD_PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
/* Liar's Dice looks: your pick is saved on your profile, so everyone sees your dice in your style */
const DICE_SKINS=[["nightlane","NightLane"],["classic","Classic"],["crimson","Crimson"],["cobalt","Cobalt"],["toxic","Toxic"],["volt","Volt"],["steak","Steak 🥩"],["ghost","Ghost 👻"]];
const diceSkinOf=uid=>{ const k=(uid===user?.id?meProfile:cache.get(uid))?.theme?.dice; return DICE_SKINS.some(([id])=>id===k)?k:"nightlane"; };
function dieEl(face,{small=false,hot=false,skin="nightlane"}={}){
  const nl=!DICE_SKINS_ART[skin], wild=String(face)==="1", d=el("span","die px"+(small?" sm":"")+(hot?" hot":"")+(wild?" wild":"")+(nl?"":" skinned")); d.setAttribute("aria-label",`die showing ${face}`); d.setAttribute("role","img");
  const a=DICE_ART[wild?"pips_wild":"pips"], i=Math.max(0,a.faces.indexOf(+face)), sz=small?26:40;
  d.style.setProperty("--die",`url(${nl?a.url:DICE_SKINS_ART[skin]})`); d.style.backgroundSize=`${sz*6}px ${sz}px`; d.style.backgroundPosition=`${-i*sz}px 0`;
  return d;
}
const ldSeat=g=>(g.state.players||[]).indexOf(user.id);
const ldTotal=g=>(g.state.counts||[]).reduce((a,b)=>a+b,0);
function ldStatus(g){
  const s=g.state, P=s.players||[], me=ldSeat(g), host=s.host;
  if(g.status==="waiting"){
    if(me<0) return {text:`${nameOf(host)} wants to play! (${P.length}/6)`,turn:true};
    return {text:host===user.id?`${P.length} player${P.length===1?"":"s"} in. Roll when everyone's here.`:`Waiting for ${nameOf(host)} to roll… (${P.length} in)`};
  }
  if(g.status==="done") return s.winner===user.id?{text:"You won! 🏆",won:true}:{text:`${nameOf(s.winner)} won 🏆`};
  const up=P[s.turn];
  if(me>=0&&s.counts[me]===0) return {text:`You're out. ${nameOf(up)}'s turn`};
  if(up===user.id) return {text:s.bid?"Your turn! Raise the bid or call Liar!":"Your turn! Make the opening bid.",turn:true};
  return {text:`${nameOf(up)}'s turn`};
}
function ldGameCard(m,g){
  const card=el("div","gamecard e8gc"), top=el("div","gc-top");
  top.append(g?.state?.bid?dieEl(g.state.bid.face,{small:true,skin:diceSkinOf(g.state.bid.by)}):el("span","e8-gcicon","🎲"));
  const info=el("div"); info.append(el("div","gc-title","🎲 LIAR'S DICE"));
  if(!g){ info.append(el("div","gc-status","Loading…")); top.append(info); card.append(top); return card; }
  const st=ldStatus(g); info.append(el("div","gc-status"+(st.turn?" turn":""),st.text)); top.append(info); card.append(top);
  const inIt=ldSeat(g)>=0;
  const label=g.status==="waiting"?(inIt?(g.state.host===user.id?"Open lobby":"Open game"):"Join game"):g.status==="done"?(inIt?"See results · Rematch":"See results"):(st.turn?"Play your turn":inIt?"Open game":"Watch game");
  const btn=el("button","play"+(st.turn?" big":""),label); btn.type="button"; btn.onclick=e=>{ e.stopPropagation(); openGame(m.id); };
  card.append(btn); return card;
}
let ldDraft={qty:1,face:2,for:null};
function ldMinRaise(g){ const b=g.state.bid; if(!b) return {qty:1,face:2}; return b.face<6?{qty:b.qty,face:b.face+1}:{qty:b.qty+1,face:2}; }
const ldHigher=(g,q,f)=>{ const b=g.state.bid; return !b||q>b.qty||(q===b.qty&&f>b.face); };
async function paintDice(g,prev){
  const s=g.state, P=s.players||[], me=ldSeat(g), st=ldStatus(g), playing=g.status!=="waiting";
  const myTurn=g.status==="active"&&P[s.turn]===user.id;
  show($("kcChainBar"),false);
  $("gameTitle").textContent="Liar's Dice"; $("gameSub").textContent="Bid on everyone's dice. 1s are wild. Call Liar! if you don't believe it."; show($("gameSub"),g.status==="waiting");
  $("gameStatus").textContent=st.text; $("gameStatus").classList.toggle("good",!!(st.turn||st.won));
  const row=$("ldPlayers"); row.innerHTML="";
  P.forEach((u,i)=>{ const out=playing&&s.counts?.[i]===0;
    const chip=el("div","e8p"+(g.status==="active"&&i===s.turn?" turn":"")+(g.status==="done"&&u===s.winner?" won":"")+(out?" out":""));
    const f=el("span","face"); paintFace(f,cache.get(u)); chip.append(f,el("span","pname",u===user.id?"You":nameOf(u)));
    if(playing) chip.append(el("span","e8count",out?"out":`🎲 ${s.counts?.[i]??"?"}`)); row.append(chip); });
  // current bid
  const bidBox=$("ldBid"); bidBox.innerHTML=""; show(bidBox,playing);
  if(playing){
    if(s.bid){ bidBox.append(el("span","ld-who",`${s.bid.by===user.id?"You":nameOf(s.bid.by)} bid`),el("b","ld-q",`${s.bid.qty} ×`),dieEl(s.bid.face,{skin:diceSkinOf(s.bid.by)})); }
    else if(g.status==="active") bidBox.append(el("span","ld-who",`Round ${s.round}: no bids yet · ${ldTotal(g)} dice on the table`));
  }
  // last reveal (after a Liar! call)
  const rv=s.reveal, rbox=$("ldReveal"); show(rbox,playing&&!!rv); rbox.innerHTML="";
  if(rv){
    const face=String(rv.bid.face), right=rv.count>=rv.bid.qty;
    rbox.append(el("p","ld-rline",`${rv.caller===user.id?"You":nameOf(rv.caller)} called Liar! on ${rv.bid.by===user.id?"your":nameOf(rv.bid.by)+"'s"} ${rv.bid.qty} × ${face}s. There ${rv.count===1?"was":"were"} ${rv.count} (1s count). ${right?"The bid was right":"The bid was a lie"}, so ${rv.loser===user.id?"you lose":nameOf(rv.loser)+" loses"} a die.`));
    Object.entries(rv.dice||{}).forEach(([u,ds])=>{ const r=el("div","ld-rrow"); r.append(el("span","ld-rname",u===user.id?"You":nameOf(u)));
      const w=el("span","ld-dice"); ds.forEach(x=>w.append(dieEl(x,{small:true,hot:x===face||x==="1",skin:diceSkinOf(u)}))); r.append(w); rbox.append(r); });
  }
  // your dice
  const mine=$("ldMine"); show($("ldMineWrap"),g.status==="active"&&me>=0&&s.counts[me]>0);
  if(!(g.status==="active"&&me>=0&&s.counts[me]>0)) mine.innerHTML="";
  if(g.status==="active"&&me>=0&&s.counts[me]>0){ const dice=await e8Hand(g); if(openGameId!==g.message_id) return; mine.innerHTML="";   /* cleared after the wait, so dice never show twice */ [...dice].sort().forEach(x=>mine.append(dieEl(x,{skin:diceSkinOf(user.id)})));
    if(prev&&e8Motion()&&(prev.status==="waiting"||prev.state?.round!==s.round)) ldTumble(mine); }
  // controls
  show($("ldControls"),myTurn);
  if(myTurn){
    const key=g.message_id+":"+g.moves;
    if(ldDraft.for!==key){ const m=ldMinRaise(g); ldDraft={...m,for:key}; }
    ldPaintControls(g);
  }
  const stale=g.status==="active"&&!myTurn&&me>=0&&Date.now()-new Date(g.updated_at||Date.now()).getTime()>120000;
  show($("ldSkip"),stale); if(stale) $("ldSkip").textContent=`Skip ${nameOf(P[s.turn])}'s turn`;
  show($("ldStart"),g.status==="waiting"&&s.host===user.id); $("ldStart").disabled=P.length<2; $("ldStart").textContent=P.length<2?"Waiting for players…":`Roll the dice (${P.length} players)`;
  show($("gameJoin"),g.status==="waiting"&&me<0&&P.length<6);
  show($("gameRematch"),g.status==="done"&&me>=0);
  if(prev&&e8Motion()) ldAnimate(g,prev);
  if(g.status==="done"&&prev&&prev.status!=="done"){ if(st.won){ gainXP("gamewin"); if(fxEnabled()){ FX.play("confetti"); pxWin(); } } if(navigator.vibrate) navigator.vibrate(st.won?[40,60,40]:60); }
  else if(prev?.state&&(prev.state.turn!==s.turn||prev.state.round!==s.round)&&myTurn&&navigator.vibrate) navigator.vibrate(25);
}
/* Liar's Dice animation: dice tumble when a round starts, bids slam in, "LIAR!" stamps the table,
   the reveal flips everyone's dice one by one, and the loser's die flies away. */
function ldSetFace(d,face){ [...d.children].forEach((p,i)=>p.className=(LD_PIPS[face]||[]).includes(i)?"on":""); d.classList.toggle("wild",String(face)==="1"); }
function ldTumble(box){
  [...box.children].forEach((d,k)=>{
    const final=d.getAttribute("aria-label").slice(-1); let n=0;
    const t=setInterval(()=>{ ldSetFace(d,1+Math.floor(Math.random()*6)); if(++n>7+k){ clearInterval(t); ldSetFace(d,final); } },65);
    d.animate([{transform:"translateY(-34px) rotate(-220deg) scale(.6)",opacity:.3},{transform:"translateY(6px) rotate(25deg) scale(1.1)",opacity:1,offset:.7},{transform:"none"}],{duration:560+k*65,easing:"cubic-bezier(.3,.8,.3,1.2)"});
  });
}
function ldAnimate(g,prev){
  const s=g.state, ps=prev.state||{};
  // a new bid pops in
  if(s.bid&&JSON.stringify(s.bid)!==JSON.stringify(ps.bid)){
    const q=$("ldBid").querySelector(".ld-q"), d=$("ldBid").querySelector(".die");
    q?.animate([{transform:"scale(.3)",opacity:0},{transform:"scale(1.35)",opacity:1,offset:.6},{transform:"scale(1)"}],{duration:380,easing:"ease-out"});
    d?.animate([{transform:"rotate(-180deg) scale(.4)"},{transform:"rotate(12deg) scale(1.2)",offset:.7},{transform:"none"}],{duration:420,easing:"ease-out"});
  }
  // someone called Liar!
  const rv=s.reveal, pr=ps.reveal;
  if(rv&&JSON.stringify(rv)!==JSON.stringify(pr)){
    const stamp=el("div","ld-stamp","LIAR!"); $("ldArea").append(stamp);
    stamp.animate([{transform:"translate(-50%,-50%) scale(3) rotate(-18deg)",opacity:0},{transform:"translate(-50%,-50%) scale(.9) rotate(-8deg)",opacity:1,offset:.25},{transform:"translate(-50%,-50%) scale(1) rotate(-8deg)",opacity:1,offset:.75},{transform:"translate(-50%,-50%) scale(1.1) rotate(-8deg)",opacity:0}],{duration:1300,easing:"ease-out"}).onfinish=()=>stamp.remove();
    if(navigator.vibrate) navigator.vibrate([30,40,60]);
    $("ldReveal").querySelectorAll(".die").forEach((d,k)=>{
      d.animate([{transform:"rotateY(90deg)",opacity:0},{transform:"rotateY(0deg)",opacity:1}],{duration:260,delay:500+k*70,easing:"ease-out",fill:"backwards"});
      if(d.classList.contains("hot")) d.animate([{transform:"scale(1)"},{transform:"scale(1.3)"},{transform:"scale(1)"}],{duration:360,delay:500+k*70+260,easing:"ease-in-out"});
    });
    const seat=(s.players||[]).indexOf(rv.loser);
    if(seat>=0){ setTimeout(()=>{ const chip=[...$("ldPlayers").children][seat]; if(!chip) return;   // look it up now: the row may have been redrawn
      chip.animate([{transform:"translateX(0)"},{transform:"translateX(-7px)"},{transform:"translateX(7px)"},{transform:"translateX(-4px)"},{transform:"none"}],{duration:420});
      const r=chip.getBoundingClientRect(), gd=dieEl(1+Math.floor(Math.random()*6),{small:true}); gd.classList.add("e8ghost"); gd.style.left=(r.right-30)+"px"; gd.style.top=(r.top+2)+"px"; document.body.append(gd);
      gd.animate([{transform:"none",opacity:1},{transform:"translate(26px,-70px) rotate(300deg) scale(.6)",opacity:0}],{duration:800,easing:"cubic-bezier(.2,.7,.4,1)"}).onfinish=()=>gd.remove(); },900); }
  }
}
function ldPaintControls(g){
  const total=ldTotal(g); ldDraft.qty=Math.max(1,Math.min(total,ldDraft.qty));
  $("ldQty").textContent=ldDraft.qty; $("ldMinus").disabled=ldDraft.qty<=1; $("ldPlus").disabled=ldDraft.qty>=total;
  const faces=$("ldFaces"); faces.innerHTML="";
  for(let f=2;f<=6;f++){ const b=el("button","ld-face"+(ldDraft.face===f?" on":"")); b.type="button"; b.setAttribute("role","radio"); b.setAttribute("aria-checked",String(ldDraft.face===f)); b.setAttribute("aria-label",`${f}s`);
    b.append(dieEl(f,{small:true,skin:diceSkinOf(user.id)})); b.onclick=()=>{ ldDraft.face=f; ldPaintControls(g); }; faces.append(b); }
  const ok=ldHigher(g,ldDraft.qty,ldDraft.face);
  $("ldBidBtn").disabled=!ok||e8Busy; $("ldBidBtn").textContent=ok?`Bid ${ldDraft.qty} × ${ldDraft.face}s`:"Bid higher than that";
  show($("ldLiarBtn"),!!g.state.bid); $("ldLiarBtn").disabled=e8Busy;
}
$("ldMinus").onclick=()=>{ const g=gamesById.get(openGameId); if(g){ ldDraft.qty--; ldPaintControls(g); } };
$("ldPlus").onclick=()=>{ const g=gamesById.get(openGameId); if(g){ ldDraft.qty++; ldPaintControls(g); } };
$("ldBidBtn").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.diceBid(g.message_id,ldDraft.qty,ldDraft.face)); };
$("ldLiarBtn").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.diceCall(g.message_id)); };
$("ldSkip").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.diceSkip(g.message_id)); };
$("ldStart").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.diceStart(g.message_id)); };

/* ================= BS 🃏 =================
   Bluffing card game for 2–8 players. Hands and the pile are private on the server; this shows the table,
   lets you pick 1–4 cards to play face down, and handles BS! calls. */
const BS_R=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const BS_NAME=["Aces","2s","3s","4s","5s","6s","7s","8s","9s","10s","Jacks","Queens","Kings"];
let bsSel=new Set(), bsSelFor=null, bsJustPlayed=[];
function bsStatus(g){
  const s=g.state, P=s.players||[], me=P.indexOf(user.id), host=s.host;
  if(g.status==="waiting"){
    if(me<0) return {text:`${nameOf(host)} wants to play! (${P.length}/8)`,turn:true};
    return {text:host===user.id?`${P.length} player${P.length===1?"":"s"} in. Deal when everyone's here (3+ is best).`:`Waiting for ${nameOf(host)} to deal… (${P.length} in)`};
  }
  if(g.status==="done") return s.winner===user.id?{text:"You won! 🏆",won:true}:{text:`${nameOf(s.winner)} won 🏆`};
  if(s.finishing) return s.finishing===user.id?{text:"You played your last cards! Waiting to see if anyone calls BS…"}:{text:`${nameOf(s.finishing)} is about to win!`,turn:P[s.turn]===user.id};
  const up=P[s.turn];
  if(up===user.id) return {text:`Your turn! Play 1–4 cards as ${BS_NAME[s.rank]}.`,turn:true};
  return {text:`${nameOf(up)}'s turn (${BS_NAME[s.rank]})`};
}
/* ================= 🍀 LUCKY 7 =================
   Push your luck: HIT to flip a card, STAY to bank your round. A repeat number = BUST (0), unless a 🛡️ Shield saves you.
   7 different numbers = LUCKY 7 (+15, round over). ❄️ Freeze makes someone stay. First to 150 wins.
   The server (lucky7.sql) runs the deck and the rules; every card on the table is face up. */
const L7_SPECIAL={S:["🛡️","Shield"],F:["❄️","Freeze"],X2:["✖️2","Double"],P4:["+4","Plus 4"],P8:["+8","Plus 8"]};
const l7Num=c=>/^n\d+$/.test(c)?+c.slice(1):null;
function l7CardEl(c,{small=false,dup=false}={}){
  const n=typeof c==="number"?c:l7Num(c), d=el("span","l7card"+(small?" sm":"")+(n===null?" special sp-"+c:" v"+n)+(dup?" dup":""));
  if(n!==null){ d.append(el("b","",String(n)),el("i","","🍀")); d.setAttribute("aria-label",`${n}`); }
  else { const sp=L7_SPECIAL[c]||["?",c]; d.append(el("b","",sp[0]),el("i","",sp[1])); d.setAttribute("aria-label",sp[1]); }
  return d;
}
function l7RowScore(r){
  if(!r||r.st==="bust") return 0;
  const sum=(r.n||[]).reduce((a,b)=>a+(+b||0),0)*((r.m||[]).includes("X2")?2:1);
  return sum+(r.m||[]).reduce((a,c)=>a+(c==="P4"?4:c==="P8"?8:0),0)+(r.st==="lucky"?15:0);
}
const l7Seat=g=>(g.state.players||[]).indexOf(user.id);
function l7Status(g){
  const s=g.state, P=s.players||[], me=l7Seat(g), host=s.host;
  if(g.status==="waiting"){
    if(me<0) return {text:`${nameOf(host)} wants to play! (${P.length}/8)`,turn:true};
    return {text:host===user.id?`${P.length} player${P.length===1?"":"s"} in. Deal when everyone's here.`:`Waiting for ${nameOf(host)} to deal… (${P.length} in)`,turn:false};
  }
  if(g.status==="done") return s.winner===user.id?{text:"You won! 🏆🍀",won:true}:{text:`${nameOf(s.winner)} won 🏆`};
  if(s.freezer!=null){ const f=P[s.freezer]; return f===user.id?{text:"❄️ You flipped a Freeze! Pick who has to stay.",turn:true}:{text:`❄️ ${nameOf(f)} is picking who to freeze…`}; }
  const up=P[s.turn];
  if(up===user.id){ const r=s.rows?.[me]; return {text:(r?.n?.length?`Your turn! You have ${l7RowScore(r)} this round. Hit or stay?`:"Your turn! Flip your first card."),turn:true}; }
  return {text:`${nameOf(up)}'s turn · round ${s.round||1}`};
}
function l7LastText(g){
  const l=g.state.last; if(!l) return "";
  const who=l.by===user.id?"You":nameOf(l.by);
  if(l.card){ const n=l7Num(l.card), what=n!==null?`a ${n}`:L7_SPECIAL[l.card]?.[1]||l.card;
    if(l.bust) return `${who} flipped ${what}… BUST! 💥`;
    if(l.saved) return `${who} flipped another ${n}, but the 🛡️ Shield saved ${l.by===user.id?"you":"them"}!`;
    if(l.lucky) return `${who} flipped ${what}: LUCKY 7! 🍀 +15`;
    if(l.gave) return `${who} flipped a 2nd Shield, so it went to ${l.gave===user.id?"you":nameOf(l.gave)} 🛡️`;
    if(l.tossed) return `${who} flipped a 2nd Shield. You can only hold one, so it was tossed.`;
    if(l.froze) return `${who} flipped a Freeze with nobody left, so ${l.by===user.id?"you":"they"} stay.`;
    return `${who} flipped ${what}${l.card==="F"?" ❄️":""}`; }
  if(l.stayed) return `${who} stayed ✋`;
  if(l.froze) return `${who} froze ${l.froze===user.id?"you":nameOf(l.froze)} ❄️`;
  if(l.skipped) return `${l.skipped===user.id?"Your":nameOf(l.skipped)+"'s"} turn was skipped (they stay)`;
  return "";
}
function l7GameCard(m,g){
  const card=el("div","gamecard e8gc"), top=el("div","gc-top");
  top.append(el("span","e8-gcicon l7-gcicon","7"));
  const info=el("div"); info.append(el("div","gc-title","🍀 LUCKY 7"));
  if(!g){ info.append(el("div","gc-status","Loading…")); top.append(info); card.append(top); return card; }
  const st=l7Status(g); info.append(el("div","gc-status"+(st.turn?" turn":""),st.text)); top.append(info); card.append(top);
  const inIt=l7Seat(g)>=0;
  const label=g.status==="waiting"?(inIt?(g.state.host===user.id?"Open lobby":"Open game"):"Join game"):g.status==="done"?(inIt?"See results · Rematch":"See results"):(st.turn?"Play your turn":inIt?"Open game":"Watch game");
  const btn=el("button","play"+(st.turn?" big":""),label); btn.type="button"; btn.onclick=e=>{ e.stopPropagation(); openGame(m.id); };
  card.append(btn); return card;
}
function l7Stamp(text,cls){ const s=el("div","ld-stamp l7-stamp "+cls,text); $("l7Area").append(s); setTimeout(()=>s.remove(),1600); }
async function paintLucky(g,prev){
  const s=g.state, P=s.players||[], me=l7Seat(g), st=l7Status(g), playing=g.status!=="waiting";
  const myTurn=g.status==="active"&&P[s.turn]===user.id&&s.freezer==null;
  show($("kcChainBar"),false);
  $("gameTitle").textContent="Lucky 7"; $("gameSub").textContent="Flip cards for points, but a repeat number busts you. Get 7 different numbers for LUCKY 7!"; show($("gameSub"),g.status==="waiting");
  $("gameStatus").textContent=st.text; $("gameStatus").classList.toggle("good",!!(st.turn||st.won));
  // scoreboard chips
  const row=$("l7Players"); row.innerHTML="";
  const goal=s.goal||150;
  P.forEach((u,i)=>{ const r=s.rows?.[i], chip=el("div","e8p"+(g.status==="active"&&i===s.turn&&s.freezer==null?" turn":"")+(g.status==="done"&&u===s.winner?" won":""));
    chip.dataset.uid=u; const f=el("span","face"); paintFace(f,cache.get(u)); chip.append(f,el("span","pname",u===user.id?"You":nameOf(u)));
    if(playing){ chip.append(el("span","e8count",`${s.scores?.[i]??0}/${goal}`));
      if(r&&r.st!=="in") chip.append(el("span","l7tag "+r.st,r.st==="stay"?"✋":r.st==="bust"?"💥":"🍀")); }
    row.append(chip); });
  $("l7Last").textContent=playing?l7LastText(g):"";
  show($("l7Table"),playing);
  // everyone's cards this round
  const rows=$("l7Rows"); rows.innerHTML="";
  if(playing&&s.rows){
    P.forEach((u,i)=>{ const r=s.rows[i]||{n:[],m:[]}, line=el("div","l7row"+(i===s.turn&&g.status==="active"?" up":"")+" "+(r.st||"in"));
      const head=el("div","l7rowhead"); head.append(el("b","",u===user.id?"You":nameOf(u)),el("span","l7pts",r.st==="bust"?"BUST 💥":`${l7RowScore(r)} pts${r.st==="lucky"?" · LUCKY 7 🍀":r.st==="stay"?" · stayed":""}`));
      if(r.sh) head.append(el("span","l7shield","🛡️"));
      const cards=el("div","l7cards"), seen=new Set();
      (r.n||[]).forEach((n,k)=>{ const dup=seen.has(n); seen.add(n); cards.append(l7CardEl(n,{small:true,dup:dup&&r.st==="bust"})); });
      (r.m||[]).forEach(c=>cards.append(l7CardEl(c,{small:true})));
      if(!(r.n||[]).length&&!(r.m||[]).length) cards.append(el("span","note","no cards yet"));
      const uniq=new Set(r.n||[]).size; if(uniq&&r.st!=="bust") head.append(el("span","l7uniq",`${uniq}/7`));
      line.append(head,cards); rows.append(line); });
  }
  $("l7DeckN").textContent=playing?`${s.deck??0} left`:"";
  /* the card that was just flipped stays face up by the deck, even if it ended the round or got passed on */
  const fl=$("l7Flip"); fl.innerHTML="";
  if(playing&&s.last?.card){ const c=l7CardEl(s.last.card); if(prev&&prev.moves!==g.moves&&JSON.stringify(s.last)!==JSON.stringify(prev.state?.last)) c.classList.add("pop");
    fl.append(c,el("small","",s.last.by===user.id?"you flipped":nameOf(s.last.by))); }
  // the big buttons
  show($("l7Act"),myTurn); $("l7Hit").disabled=e8Busy; $("l7Stay").disabled=e8Busy||!((s.rows?.[me]?.n||[]).length||(s.rows?.[me]?.m||[]).length);
  // freeze picker
  const fz=$("l7Freeze"); fz.innerHTML=""; const picking=g.status==="active"&&s.freezer!=null&&P[s.freezer]===user.id; show(fz,picking);
  if(picking){ fz.append(el("p","","❄️ Who has to stay?"));
    P.forEach((u,i)=>{ if(s.rows?.[i]?.st!=="in") return; const b=el("button","ghost",`${u===user.id?"Me 😬":nameOf(u)} (${l7RowScore(s.rows[i])} pts)`); b.type="button"; b.onclick=()=>e8Act(()=>api.l7Freeze(g.message_id,i)); fz.append(b); }); }
  // round summary
  const lr=s.lastRound, sum=$("l7Round"); sum.innerHTML=""; show(sum,playing&&!!lr);
  if(lr){ sum.append(el("b","",`Round ${lr.round} results`)); const ul=el("div","l7sum");
    (lr.sum||[]).forEach((x,i)=>{ const it=el("span","l7s "+x.st,`${P[i]===user.id?"You":nameOf(P[i])}: ${x.st==="bust"?"💥 0":"+"+x.pts}${x.st==="lucky"?" 🍀":""}`);
      const rr=lr.rows?.[i]; if(rr&&((rr.n||[]).length||(rr.m||[]).length)){ const cs=el("span","l7cards"); (rr.n||[]).forEach(n=>cs.append(l7CardEl(n,{small:true}))); (rr.m||[]).forEach(c=>cs.append(l7CardEl(c,{small:true}))); it.append(cs); }
      ul.append(it); }); sum.append(ul); }
  if(g.status==="done"&&prev&&prev.status!=="done"&&s.winner===user.id){ gainXP("gamewin"); if(fxEnabled()){ FX.play("confetti"); pxWin(); } }
  // stamps for big moments
  if(prev&&prev.moves!==g.moves&&s.last?.card&&JSON.stringify(s.last)!==JSON.stringify(prev.state?.last)){
    if(s.last.bust){ l7Stamp("BUST!","bust"); pxfx("boom",{at:$("l7Rows"),scale:3}); if(s.last.by===user.id&&navigator.vibrate) navigator.vibrate([60,40,120]); }
    else if(s.last.lucky){ l7Stamp("LUCKY 7!","lucky"); if(fxEnabled()) FX.play("confetti"); pxfx("wow",{scale:3,dy:-110}); }
    else if(s.last.saved) l7Stamp("SAVED!","saved");
  }
  const stale=g.status==="active"&&me>=0&&P[s.freezer??s.turn]!==user.id&&Date.now()-new Date(g.updated_at||Date.now()).getTime()>120000;
  show($("l7Skip"),stale); if(stale) $("l7Skip").textContent=`Skip ${nameOf(P[s.freezer??s.turn])} (they stay)`;
  show($("l7Deal"),g.status==="waiting"&&s.host===user.id); $("l7Deal").disabled=P.length<2; $("l7Deal").textContent=P.length<2?"Waiting for players…":`Deal (${P.length} players)`;
  show($("gameJoin"),g.status==="waiting"&&me<0&&P.length<8);
  show($("gameRematch"),g.status==="done"&&me>=0);
}
$("l7Hit").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.l7Hit(g.message_id)); };
$("l7Stay").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.l7Stay(g.message_id)); };
$("l7Skip").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.l7Skip(g.message_id)); };
/* ================= 🀄 MAHJONG LITE =================
   A simple Mahjong for 2–4 players: Dots, Bamboo and Characters 1–9 (no winds, dragons or flowers).
   Draw a tile, throw one away. Win with 4 sets + 1 pair. The server (mahjong.sql) deals and checks every move;
   the helpers below just show you your sets, what you're waiting on, and which tiles are safe to throw away.
   Tile art: "Simple Tiny Mahjong Tiles" by natonato, recolored for NightLane. */
const MJ_SUITS={d:"Dots",b:"Bamboo",c:"Characters"};
function mjIdx(t){ return ({d:0,b:9,c:18})[t[0]]+(+t.slice(1))-1; }   // 0..26 (function declarations: the rules card uses these before this point)
const mjCode=i=>"dbc"[Math.floor(i/9)]+(i%9+1);
function mjName(t){ return `${t.slice(1)} ${({d:"Dots",b:"Bamboo",c:"Characters"})[t[0]]}`; }
const mjSort=h=>[...h].sort((a,b)=>mjIdx(a)-mjIdx(b));
function mjTileEl(t,{z=2,cls=""}={}){
  const e=el("span","mjt"+(cls?" "+cls:"")); e.style.setProperty("--z",z); e.style.setProperty("--i",t==="back"?34:mjIdx(t));
  e.setAttribute("role","img"); e.setAttribute("aria-label",t==="back"?"face-down tile":mjName(t)); return e;
}
function mjTileHtml(t,z=1){ return `<span class="mjt" style="--z:${z};--i:${t==="back"?34:mjIdx(t)}" role="img" aria-label="${t==="back"?"tile":mjName(t)}"></span>`; }
function mjCounts(h){ const c=Array(27).fill(0); h.forEach(t=>c[mjIdx(t)]++); return c; }
function mjSetsOnly(c){
  let i=0; while(i<27&&!c[i]) i++; if(i>=27) return true;
  if(c[i]>=3){ c[i]-=3; const ok=mjSetsOnly(c); c[i]+=3; if(ok) return true; }
  if(i%9<=6&&c[i+1]&&c[i+2]){ c[i]--;c[i+1]--;c[i+2]--; const ok=mjSetsOnly(c); c[i]++;c[i+1]++;c[i+2]++; if(ok) return true; }
  return false;
}
function mjIsWin(h){ if(h.length!==14) return false; const c=mjCounts(h); for(let i=0;i<27;i++) if(c[i]>=2){ c[i]-=2; const ok=mjSetsOnly(c); c[i]+=2; if(ok) return true; } return false; }
// with 13 tiles: which tiles would finish the hand?
function mjWaits(h){ if(h.length!==13) return []; const c=mjCounts(h), out=[]; for(let i=0;i<27;i++){ if(c[i]>=4) continue; if(mjIsWin([...h,mjCode(i)])) out.push(mjCode(i)); } return out; }
// with 14 tiles: which throw-aways leave you one tile from winning?
function mjGoodThrows(h){ if(h.length!==14) return new Set(); const out=new Set(); for(const t of new Set(h)){ const i=h.indexOf(t); if(mjWaits([...h.slice(0,i),...h.slice(i+1)]).length) out.add(t); } return out; }
// split a hand into the most complete sets + one pair, for showing your progress
function mjGroups(h){
  const memo=new Map();
  function best(c,pair){
    let i=0; while(i<27&&!c[i]) i++; if(i>=27) return {score:0,groups:[],loose:[]};
    const key=c.join(",")+"|"+pair; if(memo.has(key)) return memo.get(key);
    let top=null; const take=(score,group,next,np,looseTile)=>{ const r=best(next,np); const s=r.score+score; if(!top||s>top.score) top={score:s,groups:group?[group,...r.groups]:r.groups,loose:looseTile?[looseTile,...r.loose]:r.loose}; };
    const t=mjCode(i);
    if(c[i]>=3){ const n=[...c]; n[i]-=3; take(3,{type:"trip",tiles:[t,t,t]},n,pair); }
    if(i%9<=6&&c[i+1]&&c[i+2]){ const n=[...c]; n[i]--;n[i+1]--;n[i+2]--; take(3,{type:"run",tiles:[t,mjCode(i+1),mjCode(i+2)]},n,pair); }
    if(!pair&&c[i]>=2){ const n=[...c]; n[i]-=2; take(2.5,{type:"pair",tiles:[t,t]},n,true); }
    { const n=[...c]; n[i]--; take(0,null,n,pair,t); }
    memo.set(key,top); return top;
  }
  const r=best(mjCounts(h),false);
  r.groups.sort((a,b)=>(a.type==="pair")-(b.type==="pair")||mjIdx(a.tiles[0])-mjIdx(b.tiles[0]));
  return r;
}
const mjSeat=g=>(g.state.players||[]).indexOf(user.id);
const mjPend=g=>{ const p=g.state.pend; return p&&p.tile&&g.state.phase==="draw"?p:null; };
function mjStatus(g){
  const s=g.state, P=s.players||[], me=mjSeat(g), host=s.host;
  if(g.status==="waiting"){
    if(me<0) return {text:`${nameOf(host)} wants to play! (${P.length}/4)`,turn:P.length<4};
    return {text:host===user.id?`${P.length} player${P.length===1?"":"s"} in. Deal when everyone's here (2–4).`:`Waiting for ${nameOf(host)} to deal… (${P.length} in)`,turn:false};
  }
  if(g.status==="done"){ if(!s.winner) return {text:"The wall ran out. It's a draw!"}; return s.winner===user.id?{text:"MAHJONG! You won! 🀄🏆",won:true}:{text:`${nameOf(s.winner)} won with MAHJONG! 🀄`}; }
  const up=P[s.turn];
  if(up===user.id) return {text:s.phase==="draw"?"Your turn! Draw a tile.":"Pick a tile to throw away.",turn:true};
  return {text:`${nameOf(up)}'s turn · ${s.wall} tiles left`};
}
function mjLastText(g){
  const l=g.state.last; if(!l) return "";
  const who=l.by===user.id?"You":nameOf(l.by);
  if(l.act==="discard") return `${who} threw away ${mjName(l.tile)}`;
  if(l.act==="draw") return `${who} drew a tile`;
  return "";
}
function mjGameCard(m,g){
  const card=el("div","gamecard e8gc"), top=el("div","gc-top");
  top.append(mjTileEl(g?.state?.pend?.tile&&g.status==="active"?g.state.pend.tile:"back",{z:1.5,cls:"gcmjt"}));
  const info=el("div"); info.append(el("div","gc-title","🀄 MAHJONG"));
  if(!g){ info.append(el("div","gc-status","Loading…")); top.append(info); card.append(top); return card; }
  const st=mjStatus(g); info.append(el("div","gc-status"+(st.turn?" turn":""),st.text)); top.append(info); card.append(top);
  const inIt=mjSeat(g)>=0;
  const label=g.status==="waiting"?(inIt?(g.state.host===user.id?"Open lobby":"Open game"):"Join game"):g.status==="done"?(inIt?"See hands · Rematch":"See hands"):(st.turn?"Play your turn":inIt?"Open game":"Watch game");
  const btn=el("button","play"+(st.turn?" big":""),label); btn.type="button"; btn.onclick=e=>{ e.stopPropagation(); openGame(m.id); };
  card.append(btn); return card;
}
let mjPick=null, mjClaimBuzz=null, mjPaintTok=0;
function mjGroupRow(h,{z=2,pick=false,good=null}={}){
  const r=mjGroups(h), row=el("div","mjgroups");
  r.groups.forEach(gr=>{ const b=el("span","mjset "+gr.type); gr.tiles.forEach(t=>b.append(mjTileBtn(t,z,pick,good))); row.append(b); });
  if(r.loose.length){ const b=el("span","mjset loose"); mjSort(r.loose).forEach(t=>b.append(mjTileBtn(t,z,pick,good))); row.append(b); }
  return {row,groups:r.groups};
}
function mjTileBtn(t,z,pick,good){
  const e=mjTileEl(t,{z,cls:(good?.has(t)?"good":"")+(pick&&mjPick===t?" picked":"")});
  if(pick){ e.tabIndex=0; e.setAttribute("role","button"); e.setAttribute("aria-label",`${mjName(t)}${good?.has(t)?" (good to throw away)":""}`);
    const go=()=>{ mjPick=mjPick===t?null:t; const g=gamesById.get(openGameId); if(g) paintMahjong(g); };   // tapping only picks (or un-picks); the Throw away button is the only way to throw
    e.onclick=go; e.onkeydown=ev=>{ if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); go(); } }; }
  return e;
}
function mjThrow(t){ const g=gamesById.get(openGameId); if(!g) return; mjPick=null; e8Act(()=>api.mjDiscard(g.message_id,t)); }
async function paintMahjong(g,prev){
  const s=g.state, P=s.players||[], me=mjSeat(g), st=mjStatus(g), playing=g.status!=="waiting";
  show($("kcChainBar"),false);
  $("gameTitle").textContent="Mahjong"; $("gameSub").textContent="Collect 4 sets and a pair. A set is 3 in a row of one suit, or 3 the same."; show($("gameSub"),g.status==="waiting");
  $("gameStatus").textContent=st.text; $("gameStatus").classList.toggle("good",!!(st.turn||st.won));
  const row=$("mjPlayers"); row.innerHTML="";
  P.forEach((u,i)=>{ const chip=el("div","e8p"+(g.status==="active"&&i===s.turn?" turn":"")+(g.status==="done"&&u===s.winner?" won":""));
    chip.dataset.uid=u; const f=el("span","face"); paintFace(f,cache.get(u)); chip.append(f,el("span","pname",u===user.id?"You":nameOf(u)));
    if(g.status==="active") chip.append(el("span","e8count",`🀫${s.counts?.[i]??13}`)); row.append(chip); });
  $("mjLast").textContent=g.status==="active"?mjLastText(g):"";
  // the table: wall + everyone's thrown-away tiles
  show($("mjTable"),playing); $("mjWall").textContent=playing?`${s.wall??0} left`:"";
  const rv=$("mjRivers"); rv.innerHTML="";
  if(playing) P.forEach((u,i)=>{ const line=el("div","mjriver"+(i===s.turn&&g.status==="active"?" up":""));
    line.append(el("b","",u===user.id?"You":nameOf(u)));
    const tiles=el("div","mjrtiles"), r=s.rivers?.[i]||[], pend=mjPend(g);
    if(!r.length) tiles.append(el("span","note","nothing thrown yet"));
    r.forEach((t,k)=>tiles.append(mjTileEl(t,{z:1,cls:pend&&pend.seat===i&&k===r.length-1?"hot":""})));
    line.append(tiles); rv.append(line); });
  // your hand
  // two updates can arrive at once (your move + the server's echo). Only the newest paint gets to draw the hand,
  // and the old tiles are cleared AFTER the wait, so the hand can never be drawn twice.
  const tok=++mjPaintTok;
  let hand=[];
  if(g.status==="active"&&me>=0){ hand=await e8Hand(g); if(openGameId!==g.message_id||tok!==mjPaintTok) return; }
  const handBox=$("mjHand"), hint=$("mjHint"); handBox.innerHTML=""; hint.innerHTML="";
  const myTurn=g.status==="active"&&P[s.turn]===user.id, throwing=myTurn&&s.phase==="discard"&&hand.length===14;
  const pend=g.status==="active"&&me>=0?mjPend(g):null, canClaim=!!(pend&&pend.seat!==me&&hand.length===13&&mjIsWin([...hand,pend.tile]));
  const canSelf=throwing&&mjIsWin(hand);
  if(mjPick&&!hand.includes(mjPick)) mjPick=null;
  show($("mjHandWrap"),hand.length>0);
  if(hand.length){
    const good=throwing&&!canSelf?mjGoodThrows(hand):null;
    const {row:gr,groups}=mjGroupRow(hand,{pick:throwing,good});
    handBox.append(gr);
    const sets=groups.filter(x=>x.type!=="pair").length, pair=groups.some(x=>x.type==="pair");
    $("mjProgress").textContent=`Sets ${sets}/4 · Pair ${pair?"✔":"✘"}`;
    if(canSelf||canClaim) hint.append(el("b","mjwin","🀄 Your hand is complete! Hit MAHJONG!"));
    else if(throwing){ hint.append(el("span","",mjPick?`Hit "Throw away" to get rid of ${mjName(mjPick)}, or tap it again to keep it.`:"Tap a tile you don't need, then hit Throw away.")); if(good?.size) hint.append(el("span","mjstar"," ★ = throw this and you're one tile from winning!")); }
    else if(hand.length===13){ const w=mjWaits(hand); if(w.length){ const b=el("span","mjwait"); b.append(el("b","","🀄 One away! You win with: ")); w.forEach(t=>b.append(mjTileEl(t,{z:1}))); hint.append(b); } }
  }
  // buttons
  show($("mjAct"),myTurn||canClaim);
  show($("mjDraw"),myTurn&&s.phase==="draw"); $("mjDraw").textContent=(s.wall??0)>0?"🀫 Draw a tile":"🀫 Wall's empty: end in a draw";
  show($("mjThrowBtn"),throwing&&!!mjPick&&!canSelf); if(mjPick) $("mjThrowBtn").textContent=`Throw away ${mjName(mjPick)}`;
  show($("mjMahjong"),canSelf||canClaim); $("mjMahjong").dataset.how=canSelf?"self":"claim";
  ["mjDraw","mjThrowBtn","mjMahjong"].forEach(id=>$(id).disabled=e8Busy);
  if(canClaim&&mjClaimBuzz!==g.moves){ mjClaimBuzz=g.moves; if(navigator.vibrate) navigator.vibrate([80,60,80]); }
  // the end: show everyone's hands
  const end=$("mjEnd"); end.innerHTML=""; show(end,g.status==="done"&&!!s.reveal);
  if(g.status==="done"&&s.reveal){
    if(s.winner){ const wh=mjSort(s.reveal[s.winner]||[]);
      const head=el("div","mjendhead"); head.append(el("b","",`🀄 ${s.winner===user.id?"You":nameOf(s.winner)} won `),el("span","",s.how==="claim"?`with ${P[s.from]===user.id?"your":nameOf(P[s.from])+"'s"} tile!`:"by drawing the winning tile!")); end.append(head);
      end.append(mjGroupRow(wh,{z:1.5}).row);
      if(wh.length&&new Set(wh.map(t=>t[0])).size===1) end.append(el("div","mjflush","✨ FULL FLUSH: all one suit!"));
    } else end.append(el("div","mjendhead","The wall ran out, so nobody won this time."));
    P.forEach(u=>{ if(u===s.winner) return; const h=s.reveal[u]; if(!h) return; const d=el("div","mjother"); d.append(el("small","",u===user.id?"Your hand":`${nameOf(u)}'s hand`)); const t=el("div","mjrtiles"); mjSort(h).forEach(x=>t.append(mjTileEl(x,{z:1}))); d.append(t); end.append(d); });
  }
  if(g.status==="done"&&prev&&prev.status!=="done"&&s.winner===user.id){ gainXP("gamewin"); if(fxEnabled()){ FX.play("confetti"); pxWin(); } }
  const stale=g.status==="active"&&me>=0&&P[s.turn]!==user.id&&Date.now()-new Date(g.updated_at||Date.now()).getTime()>120000;
  show($("mjSkip"),stale); if(stale) $("mjSkip").textContent=`Skip ${nameOf(P[s.turn])} (auto-play their turn)`;
  show($("mjDeal"),g.status==="waiting"&&s.host===user.id); $("mjDeal").disabled=P.length<2; $("mjDeal").textContent=P.length<2?"Waiting for players…":`Deal (${P.length} players)`;
  show($("gameJoin"),g.status==="waiting"&&me<0&&P.length<4);
  show($("gameRematch"),g.status==="done"&&me>=0);
}
$("mjDraw").onclick=()=>{ const g=gamesById.get(openGameId); if(g){ mjPick=null; e8Act(()=>api.mjDraw(g.message_id)); } };
$("mjThrowBtn").onclick=()=>{ if(mjPick) mjThrow(mjPick); };
$("mjMahjong").onclick=()=>{ const g=gamesById.get(openGameId); if(!g) return; const self=$("mjMahjong").dataset.how==="self"; e8Act(()=>self?api.mjWin(g.message_id):api.mjClaim(g.message_id)); };
$("mjSkip").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.mjSkip(g.message_id)); };
$("mjDeal").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(async()=>{ try{ await api.mjStart(g.message_id); }catch(err){ if(/mj_start|schema cache|does not exist/i.test(err.message)) throw new Error("Mahjong needs a quick setup: run mahjong.sql in Supabase."); throw err; } }); };

$("l7Deal").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(async()=>{ try{ await api.l7Start(g.message_id); }catch(err){ if(/l7_start|schema cache|does not exist/i.test(err.message)) throw new Error("Lucky 7 needs a quick setup: run lucky7.sql in Supabase."); throw err; } }); };
function bsGameCard(m,g){
  const card=el("div","gamecard e8gc"), top=el("div","gc-top");
  top.append(el("span","e8-gcicon bs-gcicon","BS!"));
  const info=el("div"); info.append(el("div","gc-title","🃏 BS"));
  if(!g){ info.append(el("div","gc-status","Loading…")); top.append(info); card.append(top); return card; }
  const st=bsStatus(g); info.append(el("div","gc-status"+(st.turn?" turn":""),st.text)); top.append(info); card.append(top);
  const inIt=(g.state.players||[]).includes(user.id);
  const label=g.status==="waiting"?(inIt?(g.state.host===user.id?"Open lobby":"Open game"):"Join game"):g.status==="done"?(inIt?"See results · Rematch":"See results"):(st.turn?"Play your turn":inIt?"Open game":"Watch game");
  const btn=el("button","play"+(st.turn?" big":""),label); btn.type="button"; btn.onclick=e=>{ e.stopPropagation(); openGame(m.id); };
  card.append(btn); return card;
}
let bsChangedAt=0;   // when the table last changed under you (a play, a BS call, a pickup)
async function paintBS(g,prev){
  const s=g.state, P=s.players||[], me=P.indexOf(user.id), st=bsStatus(g), playing=g.status!=="waiting";
  if(prev&&prev.moves!==g.moves) bsChangedAt=Date.now();
  const myTurn=g.status==="active"&&P[s.turn]===user.id&&!s.finishing;
  const animate=!!prev&&e8Motion()&&openGameId===g.message_id, before=animate?e8Snapshot():null;
  if(before){ before.pile=$("bsPile").getBoundingClientRect(); before.chips=new Map([...$("bsPlayers").children].map(c=>[c.dataset.uid,c.getBoundingClientRect()])); before.hand=new Map([...$("bsHand").querySelectorAll(".e8play")].map(b=>[b.dataset.card,b.getBoundingClientRect()])); }
  show($("kcChainBar"),false);
  $("gameTitle").textContent="BS"; $("gameSub").textContent="Play cards face down, claim the rank, and bluff. Anyone can call BS!"; show($("gameSub"),g.status==="waiting");
  $("gameStatus").textContent=st.text; $("gameStatus").classList.toggle("good",!!(st.turn||st.won));
  const row=$("bsPlayers"); row.innerHTML="";
  P.forEach((u,i)=>{ const chip=el("div","e8p"+(g.status==="active"&&i===s.turn&&!s.finishing?" turn":"")+(g.status==="done"&&u===s.winner?" won":"")+(s.finishing===u?" won":""));
    chip.dataset.uid=u; const f=el("span","face"); paintFace(f,cache.get(u)); chip.append(f,el("span","pname",u===user.id?"You":nameOf(u)));
    if(playing) chip.append(el("span","e8count",`🂠 ${s.counts?.[i]??"?"}`)); row.append(chip); });
  show(document.querySelector("#bsArea .bs-table"),playing);
  $("bsPileN").textContent=s.pile||0; $("bsPile").classList.toggle("empty",!s.pile);
  $("bsRank").textContent=BS_R[s.rank||0];
  // the last play (still open to a BS call until the next player plays)
  const lp=s.last_play; $("bsClaim").textContent=lp?`${lp.by===user.id?"You":nameOf(lp.by)} played ${lp.n} card${lp.n>1?"s":""} as ${BS_NAME[lp.rank]}`:(playing&&g.status==="active"?"":"");
  const canCall=g.status==="active"&&!!lp&&lp.by!==user.id&&me>=0&&!s.finishing;
  show($("bsCallBtn"),g.status==="active"&&me>=0&&!s.finishing); $("bsCallBtn").classList.toggle("ghosted",!canCall); $("bsCallBtn").disabled=!canCall;
  $("bsCallBtn").setAttribute("aria-hidden",String(!canCall));
  // someone played their last cards
  const fin=s.finishing; show($("bsFinish"),g.status==="active"&&!!fin);
  if(fin){ const canAccept=me>=0&&fin!==user.id&&(P[s.turn]===user.id||Date.now()-new Date(g.updated_at||Date.now()).getTime()>120000);
    $("bsFinishText").textContent=fin===user.id?"You played your last cards! If nobody calls BS, you win.":`${nameOf(fin)} played their last card${lp?.n>1?"s":""}! Call BS, or let them win.`;
    show($("bsFinishCall"),fin!==user.id&&me>=0); show($("bsAccept"),canAccept); }
  // last reveal
  const rv=s.reveal, rb=$("bsReveal"); show(rb,playing&&!!rv); rb.innerHTML="";
  if(rv){ rb.append(el("p","ld-rline",`${rv.caller===user.id?"You":nameOf(rv.caller)} called BS on ${rv.by===user.id?"you":nameOf(rv.by)}: ${rv.liar?"caught lying! 🤥":"they were honest! 😇"} ${rv.loser===user.id?"You":nameOf(rv.loser)} picked up ${rv.took} card${rv.took===1?"":"s"}.`));
    const w=el("div","bs-revealcards"); (rv.cards||[]).forEach(c=>{ const d=e8CardEl(c,{small:true}); if(e8Rank(c)!==BS_R[rv.rank]) d.classList.add("fake"); w.append(d); }); rb.append(w); }
  // your hand: pick 1–4 cards
  const hb=$("bsHand"); show(hb,playing&&me>=0);
  const key=g.message_id+":"+g.moves; if(bsSelFor!==key&&!myTurn) bsSel.clear(); if(bsSelFor!==key) bsSelFor=key;
  if(playing&&me>=0){
    const cards=await e8Hand(g); if(openGameId!==g.message_id) return;
    [...bsSel].forEach(c=>{ if(!cards.includes(c)) bsSel.delete(c); });
    const sorted=[...cards].sort((a,b)=>BS_R.indexOf(e8Rank(a))-BS_R.indexOf(e8Rank(b))||"SHDC".indexOf(e8Suit(a))-"SHDC".indexOf(e8Suit(b)));
    hb.innerHTML=""; const mid=(sorted.length-1)/2, big=sorted.length>14;
    sorted.forEach((c,idx)=>{ const real=e8Rank(c)===BS_R[s.rank], sel=bsSel.has(c);
      const b=el("button","e8play"+(sel?" can":"")+(real&&myTurn?" real":"")); b.type="button"; b.dataset.card=c;
      b.style.setProperty("--r","0deg"); b.style.setProperty("--y","0px");
      b.append(e8CardEl(c,{small:big})); b.setAttribute("aria-pressed",String(sel)); b.setAttribute("aria-label",e8CardName(c)+(real?", matches":"")+(sel?", selected":""));
      b.disabled=!myTurn;
      b.onclick=()=>{ if(bsSel.has(c)) bsSel.delete(c); else if(bsSel.size<4) bsSel.add(c); else { say("gameMsg","You can play up to 4 cards at a time."); return; } paintBS(gamesById.get(openGameId)); };
      hb.append(b); });
  }
  show($("bsPlayBtn"),myTurn); $("bsPlayBtn").disabled=!bsSel.size||e8Busy;
  $("bsPlayBtn").textContent=bsSel.size?`Play ${bsSel.size} as ${BS_NAME[s.rank]}`:`Pick 1–4 cards to play as ${BS_NAME[s.rank]}`;
  const stale=g.status==="active"&&!s.finishing&&P[s.turn]!==user.id&&me>=0&&Date.now()-new Date(g.updated_at||Date.now()).getTime()>120000;
  show($("bsSkip"),stale); if(stale) $("bsSkip").textContent=`Skip ${nameOf(P[s.turn])}'s turn`;
  show($("bsDeal"),g.status==="waiting"&&s.host===user.id); $("bsDeal").disabled=P.length<2; $("bsDeal").textContent=P.length<2?"Waiting for players…":`Deal cards (${P.length} players)`;
  show($("gameJoin"),g.status==="waiting"&&me<0&&P.length<8);
  show($("gameRematch"),g.status==="done"&&me>=0);
  if(before) bsAnimate(g,prev,before);
  if(g.status==="done"&&prev&&prev.status!=="done"){ if(st.won){ gainXP("gamewin"); if(fxEnabled()){ FX.play("confetti"); pxWin(); } } if(navigator.vibrate) navigator.vibrate(st.won?[40,60,40]:60); }
  else if(prev?.state&&prev.state.turn!==s.turn&&myTurn&&navigator.vibrate) navigator.vibrate(25);
}
function bsAnimate(g,prev,before){
  const s=g.state, ps=prev.state||{}, pile=$("bsPile").getBoundingClientRect();
  // someone played: face-down cards fly to the pile (yours from your hand, theirs from their picture)
  if(s.last?.played&&JSON.stringify(s.last)!==JSON.stringify(ps.last)){
    const by=s.last.by, n=s.last.played;
    for(let k=0;k<n;k++) setTimeout(()=>e8Ghost(by===user.id?(before.hand.get(bsJustPlayed[k])||before.chips.get(by)):before.chips.get(by),pile,{back:true,dur:460}),k*90);
    $("bsPile").animate([{transform:"scale(1)"},{transform:"scale(1.12) rotate(-3deg)"},{transform:"none"}],{duration:300,delay:380});
  }
  // BS was called: stamp, flip, and the pile flies to whoever lost
  if(s.reveal&&JSON.stringify(s.reveal)!==JSON.stringify(ps.reveal)){
    const rv=s.reveal, stamp=el("div","ld-stamp bs-stamp"+(rv.liar?"":" honest"),rv.liar?"LIAR!":"HONEST!"); $("bsArea").append(stamp);
    stamp.animate([{transform:"translate(-50%,-50%) scale(3) rotate(-18deg)",opacity:0},{transform:"translate(-50%,-50%) scale(.9) rotate(-8deg)",opacity:1,offset:.25},{transform:"translate(-50%,-50%) scale(1) rotate(-8deg)",opacity:1,offset:.75},{transform:"translate(-50%,-50%) scale(1.1) rotate(-8deg)",opacity:0}],{duration:1300,easing:"ease-out"}).onfinish=()=>stamp.remove();
    if(navigator.vibrate) navigator.vibrate([30,40,60]);
    $("bsReveal").querySelectorAll(".e8card").forEach((d,k)=>d.animate([{transform:"rotateY(90deg)",opacity:0},{transform:"rotateY(0)",opacity:1}],{duration:280,delay:450+k*110,easing:"ease-out",fill:"backwards"}));
    const to=[...$("bsPlayers").children].find(c=>c.dataset.uid===rv.loser)?.getBoundingClientRect();
    for(let k=0;k<Math.min(6,rv.took);k++) setTimeout(()=>e8Ghost(before.pile||pile,to,{back:true,dur:560}),900+k*70);
  }
}
$("bsPlayBtn").onclick=()=>{ const g=gamesById.get(openGameId); if(!g||!bsSel.size) return;
  if(Date.now()-bsChangedAt<750){ say("gameMsg","The table just changed. Check your cards, then tap Play again."); return; }   /* don't let a jumpy screen play cards for you */
  const cards=[...bsSel]; bsJustPlayed=cards; bsSel.clear(); e8Act(()=>api.bsPlay(g.message_id,cards)); };
[$("bsCallBtn"),$("bsFinishCall")].forEach(b=>b.onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.bsCall(g.message_id)); });
$("bsAccept").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.bsAccept(g.message_id)); };
$("bsSkip").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.bsSkip(g.message_id)); };
$("bsDeal").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.bsStart(g.message_id)); };

/* ================= 🌑 BLACKOUT (2026.10.20b) =================
   A bluffing game for 2–6 players (best with 3+), an original NightLane game.
   Everyone has 4 tiles: 3 ⚡ Neon and 1 🌑 Blackout. Each round you set tiles face down on your stack, then someone
   CALLS how many Neon tiles they can flip without hitting a Blackout. The others raise or drop out. The last caller
   flips their own stack first, then picks other stacks. Make it = 1 point (2 wins). Hit a Blackout = lose a tile.
   The server (blackout.sql) keeps every stack secret and checks every move. */
function boTileHtml(t,small){   // (a function declaration so the rules card can use it before this point)
  const svg=t==="N"?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2 5 13.5h6L9.8 22 19 9.8h-6.2z"/></svg>'
    :t==="B"?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle class="bite" cx="15.6" cy="8.8" r="7.2"/><path class="crack" d="M4 15.5 8 13l1.5 2.5L13 12"/></svg>':"";
  const label=t==="N"?"Neon tile":t==="B"?"Blackout tile":"face-down tile";
  return `<span class="botile ${t==="N"?"neon":t==="B"?"dark":"back"}${small?" sm":""}" role="img" aria-label="${label}">${svg}</span>`;
}
function boTileEl(t,{sm=false,cls=""}={}){ const w=document.createElement("span"); w.innerHTML=boTileHtml(t,sm); const e=w.firstChild; if(cls) e.classList.add(...cls.split(" ").filter(Boolean)); return e; }
const boSeat=g=>(g.state.players||[]).indexOf(user.id);
const boName=(u,cap)=>u===user.id?(cap?"You":"you"):nameOf(u);
const boTotal=s=>(s.piles||[]).reduce((a,b)=>a+b,0);
function boStatus(g){
  const s=g.state, P=s.players||[], me=boSeat(g), host=s.host;
  if(g.status==="waiting"){
    if(me<0) return {text:`${nameOf(host)} wants to play! (${P.length}/6)`,turn:P.length<6};
    return {text:host===user.id?`${P.length} player${P.length===1?"":"s"} in. Deal when everyone's here (best with 3+).`:`Waiting for ${nameOf(host)} to deal… (${P.length} in)`,turn:false};
  }
  if(g.status==="done") return s.winner===user.id?{text:"You won! 🏆⚡",won:true}:{text:`${nameOf(s.winner)} won 🏆`};
  const up=P[s.turn], out=me>=0&&!(s.tiles?.[me]>0);
  if(out) return {text:"You're out of tiles. Watch the others finish it!"};
  if(s.phase==="place"){
    if(me>=0&&!s.placed?.[me]) return {text:"Set a tile face down on your stack.",turn:true};
    const wait=P.filter((u,i)=>s.tiles[i]>0&&!s.placed[i]).map(u=>nameOf(u));
    return {text:`Waiting for ${wait.join(", ")} to set a tile…`};
  }
  if(s.phase==="play"){
    if(up===user.id){ const empty=!(s.tiles[me]-s.piles[me]>0); return {text:empty?"Your turn! No tiles left to stack, so make a call.":"Your turn! Stack another tile, or make a call.",turn:true}; }
    return {text:`${nameOf(up)}'s turn · round ${s.round}`};
  }
  if(s.phase==="bid"){
    const b=s.bid; if(up===user.id) return {text:`${boName(P[b.seat],true)} called ${b.n}. Raise it, or drop out.`,turn:true};
    return {text:`${nameOf(up)} is deciding… (the call is ${b.n})`};
  }
  if(s.phase==="flip"){
    const f=P[s.flipper]; if(f===user.id) return {text:`Flip ${s.need-s.lit} more Neon! Pick a stack.`,turn:true};
    return {text:`${nameOf(f)} is flipping… ${s.lit}/${s.need} Neon`};
  }
  return {text:""};
}
function boLastText(g){
  const l=g.state.last, P=g.state.players; if(!l) return "";
  const who=boName(l.by,true);
  if(l.act==="place") return `${who} stacked a tile`;
  if(l.act==="call") return `${who} called ${l.n} 🔦`;
  if(l.act==="raise") return `${who} raised it to ${l.n} 🔦`;
  if(l.act==="pass") return `${who} dropped out ✋`;
  if(l.act==="won") return `${who} won the call: ${l.n}. Flipping…`;
  if(l.act==="flip"){ const owner=P[l.seat], whose=owner===l.by?(l.by===user.id?"your own":"their own"):owner===user.id?"your":nameOf(owner)+"'s";
    return `${who} flipped ${whose} tile: ${l.tile==="B"?"🌑 BLACKOUT!":"⚡ Neon"}`; }
  if(l.act==="skip") return l.skipped?`${nameOf(l.skipped)} was away, so their turn was played for them`:"Tiles were set for the players who were away";
  return "";
}
function boResultText(r,P){
  if(!r) return "";
  const who=boName(r.by,true);
  if(r.ok) return `🔦 ${who} lit up ${r.need}! +1 point`;
  const whose=r.hit===r.by?(r.by===user.id?"your own":"their own"):r.hit===user.id?"your":nameOf(r.hit)+"'s";
  return `🌑 ${who} hit ${whose} Blackout and lost a tile${r.out?`… and ${r.by===user.id?"you're":"they're"} OUT`:""}`;
}
function boGameCard(m,g){
  const card=el("div","gamecard e8gc"), top=el("div","gc-top");
  const ic=el("span","bo-gcicon"); ic.append(boTileEl("N",{sm:true}),boTileEl("B",{sm:true})); top.append(ic);
  const info=el("div"); info.append(el("div","gc-title","🌑 BLACKOUT"));
  if(!g){ info.append(el("div","gc-status","Loading…")); top.append(info); card.append(top); return card; }
  const st=boStatus(g); info.append(el("div","gc-status"+(st.turn?" turn":""),st.text)); top.append(info); card.append(top);
  const inIt=boSeat(g)>=0;
  const label=g.status==="waiting"?(inIt?(g.state.host===user.id?"Open lobby":"Open game"):"Join game"):g.status==="done"?(inIt?"See results · Rematch":"See results"):(st.turn?"Play your turn":inIt?"Open game":"Watch game");
  const btn=el("button","play"+(st.turn?" big":""),label); btn.type="button"; btn.onclick=e=>{ e.stopPropagation(); openGame(m.id); };
  card.append(btn); return card;
}
let boN=1, boNKey="", boPaintTok=0;
function boStamp(text,cls){ const s=el("div","ld-stamp bo-stamp "+cls,text); $("boArea").append(s); setTimeout(()=>s.remove(),1700); }
/* one player's stack on the table: face-down tiles, with anything flipped sitting face up on top */
function boStackEl(g,i,{canFlip,fresh}){
  const s=g.state, P=s.players, shown=s.shown?.[i]||[], down=Math.max(0,(s.piles?.[i]||0)-shown.length);
  const col=el(canFlip?"button":"div","bostack"+(canFlip?" pick":"")+(i===s.turn&&g.status==="active"?" up":"")+(!(s.tiles?.[i]>0)?" out":""));
  if(canFlip){ col.type="button"; col.setAttribute("aria-label",`Flip ${P[i]===user.id?"your":nameOf(P[i])+"'s"} top tile`); col.onclick=()=>e8Act(()=>api.boFlip(g.message_id,i)); }
  const pile=el("div","bopile");
  for(let k=0;k<down;k++){ const t=boTileEl("back"); t.style.setProperty("--k",k); pile.append(t); }
  shown.forEach((x,k)=>{ const t=boTileEl(x,{cls:"up"+(fresh&&fresh.seat===i&&k===shown.length-1?" flipin":"")}); t.style.setProperty("--k",down+k); pile.append(t); });
  if(!down&&!shown.length) pile.append(el("span","boempty",s.phase==="place"&&s.tiles?.[i]>0?"…":"—"));
  pile.style.setProperty("--n",Math.max(0,down+shown.length-1));
  col.append(pile,el("b","",P[i]===user.id?"You":nameOf(P[i])));
  if(canFlip) col.append(el("small","boflip","Flip!"));
  return col;
}
async function paintBlackout(g,prev){
  const s=g.state, P=s.players||[], me=boSeat(g), st=boStatus(g), playing=g.status!=="waiting";
  show($("kcChainBar"),false);
  $("gameTitle").textContent="Blackout"; $("gameSub").textContent="Stack tiles, call how many Neon you can flip, and don't hit a Blackout!"; show($("gameSub"),g.status==="waiting");
  $("gameStatus").textContent=st.text; $("gameStatus").classList.toggle("good",!!(st.turn||st.won));
  const fresh=prev&&prev.moves!==g.moves&&s.last?.act==="flip"&&!s.last.end&&JSON.stringify(s.last)!==JSON.stringify(prev.state?.last)?s.last:null;
  // players: points (⚡⚡ wins) and tiles left
  const row=$("boPlayers"); row.innerHTML="";
  P.forEach((u,i)=>{ const out=playing&&!(s.tiles?.[i]>0);
    const chip=el("div","e8p"+(g.status==="active"&&i===s.turn&&s.phase!=="place"?" turn":"")+(g.status==="done"&&u===s.winner?" won":"")+(out?" out":""));
    chip.dataset.uid=u; const f=el("span","face"); paintFace(f,cache.get(u)); chip.append(f,el("span","pname",u===user.id?"You":nameOf(u)));
    if(playing){ const pts=el("span","bopts"); for(let k=0;k<(s.goal||2);k++) pts.append(el("i",k<(s.pts?.[i]||0)?"on":"")); pts.title=`${s.pts?.[i]||0} of ${s.goal||2} points`; chip.append(pts);
      if(out) chip.append(el("span","e8count","OUT")); else { const tl=el("span","botl"); for(let k=0;k<(s.tiles?.[i]??4);k++) tl.append(el("i")); tl.title=`${s.tiles?.[i]??4} tiles left`; chip.append(tl); }
      if(g.status==="active"&&s.phase==="place"&&!out) chip.append(el("span","l7tag",s.placed?.[i]?"✓":"…"));
      if(g.status==="active"&&s.phase==="bid"&&s.passed?.[i]) chip.append(el("span","l7tag","✋")); }
    row.append(chip); });
  $("boLast").textContent=g.status==="active"?boLastText(g):"";
  // the call
  const call=$("boCall"); call.innerHTML=""; const calling=g.status==="active"&&(s.phase==="bid"||s.phase==="flip")&&s.bid;
  show(call,!!calling);
  if(calling){ call.append(el("span","bocallwho",`🔦 ${boName(P[s.bid.seat],true)} ${s.phase==="flip"?"must flip":"called"}`),el("b","bocalln",String(s.bid.n)));
    if(s.phase==="flip"){ const pr=el("span","boprog"); for(let k=0;k<s.need;k++) pr.append(el("i",k<s.lit?"on":"")); call.append(pr); } }
  // the table
  show($("boTable"),playing&&g.status==="active");
  const tb=$("boTable"); tb.innerHTML="";
  if(g.status==="active"){
    const flipping=s.phase==="flip"&&P[s.flipper]===user.id, ownDone=flipping&&(s.shown[me]||[]).length>=s.piles[me];
    P.forEach((u,i)=>{ if(!(s.tiles?.[i]>0)&&!(s.piles?.[i]>0)) return;
      tb.append(boStackEl(g,i,{canFlip:ownDone&&i!==me&&(s.shown[i]||[]).length<s.piles[i],fresh})); });
  }
  // your tiles (only you see these)
  const tok=++boPaintTok;
  let cards=[];
  if(g.status==="active"&&me>=0&&s.tiles?.[me]>0){ cards=await e8Hand(g); if(openGameId!==g.message_id||tok!==boPaintTok) return; }
  const hand=cards.filter(c=>c[0]!=="p"), mine=cards.filter(c=>c[0]==="p").map(c=>c.slice(1)).reverse();   // your stack, top first
  const mb=$("boMine"); mb.innerHTML=""; show(mb,cards.length>0);
  if(cards.length){
    const h=el("div","bohand"); h.append(el("small","","Your hand"));
    const ht=el("div","botiles"); hand.forEach(t=>ht.append(boTileEl(t))); if(!hand.length) ht.append(el("span","note","empty")); h.append(ht);
    const sk=el("div","bohand"); sk.append(el("small","","Your stack (top first, only you see it)"));
    const stt=el("div","botiles"); mine.forEach((t,k)=>stt.append(boTileEl(t,{sm:true,cls:k<(s.shown?.[me]||[]).length?"gone":""}))); if(!mine.length) stt.append(el("span","note","nothing yet")); sk.append(stt);
    mb.append(h,sk);
  }
  // what you can do
  const myTurn=g.status==="active"&&me>=0&&P[s.turn]===user.id&&s.tiles?.[me]>0;
  const canPlace=g.status==="active"&&me>=0&&s.tiles?.[me]>0&&((s.phase==="place"&&!s.placed?.[me])||(s.phase==="play"&&myTurn));
  const nN=hand.filter(t=>t==="N").length, nB=hand.filter(t=>t==="B").length;
  show($("boPlace"),canPlace&&hand.length>0);
  $("boPlaceN").disabled=e8Busy||!nN; $("boPlaceB").disabled=e8Busy||!nB;
  $("boPlaceN").querySelector("small").textContent=nN?`(${nN} in hand)`:"(none left)";
  $("boPlaceB").querySelector("small").textContent=nB?"(your only one)":"(not in hand)";
  const total=boTotal(s), canCall=myTurn&&(s.phase==="play"||s.phase==="bid");
  const lo=s.phase==="bid"?(s.bid?.n||0)+1:1;
  const key=`${g.message_id}|${s.round}|${s.phase}|${s.bid?.n||0}`; if(key!==boNKey){ boNKey=key; boN=lo; }
  boN=Math.max(lo,Math.min(total,boN));
  show($("boCallBox"),canCall); show($("boPass"),canCall&&s.phase==="bid");
  if(canCall){ const room=lo<=total; $("boN").textContent=room?String(boN):"—";
    $("boMinus").disabled=!room||boN<=lo||e8Busy; $("boPlus").disabled=!room||boN>=total||e8Busy;
    $("boCallGo").disabled=!room||e8Busy; $("boCallGo").textContent=s.phase==="bid"?(room?`Raise to ${boN}`:"Can't go higher"):`🔦 Call ${boN}`;
    $("boCallHint").textContent=`${total} tile${total===1?"":"s"} on the table. Your own stack gets flipped first.`; }
  $("boPass").disabled=e8Busy;
  // the last round, flipped face up
  const r=s.result, rb=$("boResult"); rb.innerHTML=""; show(rb,playing&&!!r);
  if(r){ rb.classList.toggle("ok",!!r.ok); rb.classList.toggle("bad",!r.ok);
    rb.append(el("b","",`Round ${r.round}: `+boResultText(r,P)));
    const flips=el("div","boreveal"); let k=0;
    P.forEach((u,i)=>{ const sh=r.shown?.[i]||[]; if(!sh.length) return; const one=el("span","borev"); one.append(el("small","",u===user.id?"You":nameOf(u)));
      sh.forEach(t=>{ const e=boTileEl(t,{sm:true}); e.style.setProperty("--d",(k++*90)+"ms"); one.append(e); }); flips.append(one); });
    rb.append(flips); }
  // big moments
  const newResult=prev&&JSON.stringify(prev.state?.result)!==JSON.stringify(r)&&r&&prev.state?.round!==undefined;
  if(newResult){
    if(r.ok){ boStamp("LIT!","ok"); if(r.by===user.id&&navigator.vibrate) navigator.vibrate([30,40,30]); }
    else { boStamp("BLACKOUT!","bad"); $("boArea").classList.remove("boglitch"); void $("boArea").offsetWidth; $("boArea").classList.add("boglitch");
      if(e8Motion()) pxfx("boom",{at:$("boResult"),scale:3}); if(r.by===user.id&&navigator.vibrate) navigator.vibrate([60,40,140]); }
  }
  if(g.status==="done"&&prev&&prev.status!=="done"&&s.winner===user.id){ gainXP("gamewin"); if(fxEnabled()){ FX.play("confetti"); pxWin(); } }
  // somebody's away
  const stuck=g.status==="active"?(s.phase==="place"?P.filter((u,i)=>s.tiles[i]>0&&!s.placed[i]&&u!==user.id):[P[s.turn]].filter(u=>u!==user.id)):[];
  const stale=g.status==="active"&&me>=0&&stuck.length>0&&!(s.phase!=="place"&&P[s.turn]===user.id)&&Date.now()-new Date(g.updated_at||Date.now()).getTime()>120000;
  show($("boSkip"),stale); if(stale) $("boSkip").textContent=`${stuck.map(u=>nameOf(u)).join(", ")} ${stuck.length>1?"are":"is"} away: play for them`;
  show($("boDeal"),g.status==="waiting"&&s.host===user.id); $("boDeal").disabled=P.length<2; $("boDeal").textContent=P.length<2?"Waiting for players…":`Deal (${P.length} players)`;
  show($("gameJoin"),g.status==="waiting"&&me<0&&P.length<6);
  show($("gameRematch"),g.status==="done"&&me>=0);
}
const boRepaint=()=>{ const g=gamesById.get(openGameId); if(g) paintBlackout(g); };
$("boPlaceN").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.boPlace(g.message_id,"N")); };
$("boPlaceB").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.boPlace(g.message_id,"B")); };
$("boMinus").onclick=()=>{ boN--; boRepaint(); };
$("boPlus").onclick=()=>{ boN++; boRepaint(); };
$("boCallGo").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.boCall(g.message_id,boN)); };
$("boPass").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.boPass(g.message_id)); };
$("boSkip").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(()=>api.boSkip(g.message_id)); };
$("boDeal").onclick=()=>{ const g=gamesById.get(openGameId); if(g) e8Act(async()=>{ try{ await api.boStart(g.message_id); }catch(err){ if(/bo_start|schema cache|does not exist/i.test(err.message)) throw new Error("Blackout needs a quick setup: run blackout.sql in Supabase."); throw err; } }); };
