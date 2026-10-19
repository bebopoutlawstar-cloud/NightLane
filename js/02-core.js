







const $ = id => document.getElementById(id);
const show = (el, on=true) => { el.classList.toggle("hidden", !on); if(on&&el.classList.contains("overlay")){ const sb=el.querySelector(".sheetbody"); if(sb) sb.scrollTop=0; } };
const DAYS=["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
const COLORS=["#00F0FF","#E07AC6","#F3FF3A","#7CFF6B","#FF8A3D","#B18CFF"];
const EMOJIS=["🔥","😂","😮","😢","👍","❤️"];
const PAGE=50;
const MAX_VIDEO_SECONDS=30, MAX_VIDEO_BYTES=25e6, MAX_VOICE_SECONDS=120, MAX_PICK_BYTES=500e6;
const BACKGROUNDS=[["stars","Stars"],["grid","Grid"],["rain","Rain"],["sunset","Sunset"],["aurora","Aurora"],["void","Void"],["ocean","Ocean"],["snow","Snowfall"],["fireflies","Fireflies"],["nebula","Nebula"],["sakura","Sakura"],["lava","Lava"],["cafe","Café"],["burning","Burning City"],["darkhour","Dark Hour"],["wasteland","Wasteland"],["warp","Hyperspace"],["matrix","Code Rain"]];
const THEMES={
  night:  {label:"Night Signal", main:"#00F0FF", accent:"#C65AAE", hi:"#F3FF3A"},
  crimson:{label:"Crimson",      main:"#FF4D6D", accent:"#FFB347", hi:"#FFF1A8"},
  toxic:  {label:"Toxic",        main:"#7CFF6B", accent:"#B18CFF", hi:"#F3FF3A"},
  ice:    {label:"Ice",          main:"#7FDBFF", accent:"#9FA8FF", hi:"#FFFFFF"},
  sunset: {label:"Sunset",       main:"#FF9A3D", accent:"#FF4FA3", hi:"#FFE45C"},
  mono:   {label:"Mono",         main:"#E8E8F0", accent:"#8A8AA8", hi:"#F3FF3A"},
  phantom:{label:"🎭 Phantom",   main:"#FF2E3F", accent:"#F4F7FF", hi:"#FF2E3F"},
  pipboy: {label:"☢️ Wasteland", main:"#5cff8a", accent:"#1f7a3a", hi:"#a7ffbf", body:"pipboy"},
  mochi:  {label:"🍡 Mochi",     main:"#e25d92", accent:"#5aa9e6", hi:"#c9760f", body:"mochi"},
  redrum: {label:"🩸 Redrum",    main:"#ff1a1a", accent:"#7a0a0a", hi:"#ffdddd", body:"redrum"},
  lab:    {label:"⚗️ Lab",       main:"#ff9a3d", accent:"#7a3e10", hi:"#ffd08a", body:"lab"},
  divergence:{label:"⚙️ Divergence", main:"#ffa54a", accent:"#6f8fae", hi:"#ffc27a", body:"divergence"},
  tvworld:{label:"📺 TV World",  main:"#ffe34a", accent:"#8a7a1a", hi:"#fff7cf", body:"tvworld"},
  plumber:{label:"🍄 Plumber",   main:"#ffd400", accent:"#e4342f", hi:"#fff", body:"plumber"},
  grandline:{label:"🏴‍☠️ Grand Line", main:"#ffd84a", accent:"#c0392b", hi:"#fff3d6", body:"grandline"},
  gold:   {label:"👑 Gold",      main:"#FFD86B", accent:"#b8860b", hi:"#fff6d8", body:"gold"},
};
const BUBBLES=["#2A1B4A","#0E3B4A","#4A1330","#123D22","#3D2A08","#1B2A6B","#5A1E5A","#262630","#6A1A1A","#0B4F4F","#3B1F6B","#5C3A0E","#1F4D1A","#6B1F4A","#12305E","#4A4A12"];
const colorFor = s => COLORS[[...(s||"?")].reduce((a,c)=>a+c.charCodeAt(0),0)%COLORS.length];
const say = (id,text,bad) => { $(id).textContent=text; $(id).classList.toggle("bad",!!bad); };
/* 🕐 always 12-hour time (3:05 PM), in this device's own time zone, even when the computer's language is set to
   English (UK) or another 24-hour language. Covers every time shown in the app, since they all go through these two. */
(()=>{ const P=Date.prototype, lt=P.toLocaleTimeString, ls=P.toLocaleString;
  const h12=(o,full)=>{ if(o&&(o.hour12!==undefined||o.hourCycle)) return o; if(!o) return full?{year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"2-digit",hour12:true}:{hour:"numeric",minute:"2-digit",hour12:true}; return o.hour||o.timeStyle?{...o,hour12:true}:o; };
  const loc=l=>(l===undefined||(Array.isArray(l)&&!l.length))&&/^en/i.test(navigator.language||"")?"en-US":l;   // English computers: "3:05 PM", not "3:05 pm"
  P.toLocaleTimeString=function(l,o){ return lt.call(this,loc(l),h12(o,false)); };
  P.toLocaleString=function(l,o){ return ls.call(this,loc(l),h12(o,true)); };
})();
const timeOf = t => new Date(t).toLocaleTimeString([],{hour:"numeric",minute:"2-digit",hour12:true});

/* ---------- date stamp ---------- */
const sun='<svg viewBox="0 0 100 100"><g fill="#07041A"><circle cx="50" cy="50" r="22"/>'+[...Array(8)].map((_,i)=>`<polygon points="50,2 58,20 42,20" transform="rotate(${i*45} 50 50)"/>`).join("")+'</g></svg>';
const moon='<svg viewBox="0 0 100 100"><path fill="#07041A" d="M62 12a40 40 0 1 0 28 60A32 32 0 0 1 62 12z"/><polygon fill="#07041A" points="24,18 27,26 35,27 29,32 31,40 24,36 17,40 19,32 13,27 21,26"/></svg>';
const phaseOf = h => h<5?"Late Night":h<12?"Morning":h<17?"Afternoon":h<21?"Evening":"Night";
/* ===== holiday looks for the date stamp =====
   holidayFor() looks at the date and returns the name of the holiday tag to put on the page ("" = no holiday).
   Each tag has matching CSS (body.halloween, body.winter, ...) that recolors the stamp and adds two emoji stickers. */
const HOLIDAYS=["halloween","thanksgiving","winter","newyear","valentine","stpat","easter","july4"];
function holidayFor(d){
  const m=d.getMonth()+1, day=d.getDate();   // +1 so January is 1 and December is 12 (easier to read)
  if(m===10) return "halloween";                       // all October
  if(m===11) return "thanksgiving";                    // all November
  if(m===12) return "winter";                          // all December
  if(m===1&&day<=7) return "newyear";                  // Jan 1–7
  if(m===2&&day<=14) return "valentine";               // Feb 1–14
  if(m===3&&day>=14&&day<=17) return "stpat";          // Mar 14–17
  if(m===7&&day<=4) return "july4";                    // Jul 1–4
  if(isEasterWeek(d)) return "easter";                 // the week leading up to Easter Sunday
  return "";
}
/* Easter moves every year, so this works out Easter Sunday for the year (a famous old math recipe) */
function easterSunday(y){
  const a=y%19, b=Math.floor(y/100), c=y%100, d=Math.floor(b/4), e=b%4, f=Math.floor((b+8)/25), g=Math.floor((b-f+1)/3);
  const h=(19*a+b-d-g+15)%30, i=Math.floor(c/4), k=c%4, l=(32+2*e+2*i-h-k)%7, m=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*m+114)/31), day=((h+l-7*m+114)%31)+1;
  return new Date(y,month-1,day);
}
function isEasterWeek(d){
  const today=new Date(d.getFullYear(),d.getMonth(),d.getDate()), easter=easterSunday(d.getFullYear());
  const daysBefore=Math.round((easter-today)/864e5);
  return daysBefore>=0&&daysBefore<=6;
}
function paintDate(){
  const d=new Date(), h=d.getHours();
  $("sMonth").textContent=d.getMonth()+1; $("sDay").textContent=d.getDate();
    document.body.classList.remove(...HOLIDAYS);          // take off yesterday's holiday tag (if any)
    const hol=holidayFor(d); if(hol) document.body.classList.add(hol);
  $("sWeek").textContent=DAYS[d.getDay()]; $("sPhase").textContent=phaseOf(h);
  $("sIcon").innerHTML=(h>=6&&h<19)?sun:moon;
  $("miniDate").innerHTML=`${d.getMonth()+1}/${d.getDate()}<small>${DAYS[d.getDay()].slice(0,3)}</small>`;
  layoutStamp();
}
/* Lay the month, slash, and day out side by side based on their real widths, so "10/2" or "12/25"
   gets the same clean divider as "9/30". If the whole date is too wide, both numbers shrink a little. */
function layoutStamp(){
  const mo=$("sMonth"), sl=mo?.parentElement.querySelector(".slash"), dy=$("sDay"); if(!mo||!sl||!dy) return;
  const st=mo.parentElement, W=st.clientWidth; if(!W) return;
  [mo,dy].forEach(n=>n.style.fontSize="");          // start from the normal CSS sizes
  for(let pass=0;pass<5;pass++){
    const moL=mo.offsetLeft, moR=moL+mo.offsetWidth, slW=sl.offsetWidth;
    const slL=moR-slW*0.15, dyL=slL+slW*0.85, dyR=dyL+dy.offsetWidth, ico=st.querySelector(".icon"), room=ico?ico.offsetLeft+ico.offsetWidth*0.12:W*0.8;   // keep the day clear of the sun/moon sticker
    sl.style.left=slL+"px"; dy.style.left=dyL+"px";
    if(dyR<=room+1||pass===4) break;
    const k=Math.max(0.85,(room-moL)/(dyR-moL));    // too wide: shrink both numbers to fit, then lay out again
    [mo,dy].forEach(n=>n.style.fontSize=(parseFloat(getComputedStyle(n).fontSize)*k)+"px");
  }
}
try{ document.fonts?.ready.then(layoutStamp); }catch(e){}
try{ new ResizeObserver(()=>layoutStamp()).observe(document.querySelector(".stamp")); }catch(e){ addEventListener("resize",layoutStamp); }
paintDate(); setInterval(paintDate,60000);
let lastDay=new Date().toDateString();
setInterval(()=>{ const now=new Date().toDateString(); if(now===lastDay) return; lastDay=now;
  if(typeof user!=="undefined"&&user){ paintMe(); if(room) renderAll(false); loadInbox(); loadContacts(); celebrateMyBirthday(); } },60000);

/* ---------- starfield ---------- */
(function(){
  const c=$("stars"),x=c.getContext("2d"); let s=[];
  const still=reducedMotion();
  function size(){c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;
    s=[...Array(160)].map(()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.6*devicePixelRatio,p:Math.random()*6}))}
  function draw(t){x.clearRect(0,0,c.width,c.height);
    s.forEach((o,i)=>{x.globalAlpha=.4+.6*Math.abs(Math.sin(t/1400+o.p));x.fillStyle=i%9==0?"#00F0FF":i%13==0?"#E07AC6":"#fff";x.beginPath();x.arc(o.x,o.y,o.r,0,7);x.fill()});
    if(!still) requestAnimationFrame(draw)}
  size(); addEventListener("resize",size); requestAnimationFrame(draw);
})();

/* ---------- helpers ---------- */
function loadImg(file){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error("That file isn't an image we can read."));i.src=URL.createObjectURL(file)})}
/* HEIC photos (Samsung "High efficiency pictures", iPhones) can't be read by Chrome on Android.
   Detect them and convert to JPG on the phone; the converter only downloads the first time it's needed. */
async function isHeic(file){
  if(/image\/hei[cf]/i.test(file.type||"")||/\.hei[cf]$/i.test(file.name||"")) return true;
  try{ const b=new Uint8Array(await file.slice(0,12).arrayBuffer()); const t=String.fromCharCode(...b.slice(4,12));
       return t.startsWith("ftyp")&&/^(heic|heix|hevc|hevx|mif1|msf1|heim|heis)/.test(t.slice(4)); }catch(e){ return false; }
}
let heicLib=null;
function loadHeicLib(){ return heicLib||(heicLib=new Promise((res,rej)=>{ const sc=document.createElement("script"); sc.src="https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
  sc.onload=()=>window.heic2any?res(window.heic2any):rej(new Error("converter didn't load")); sc.onerror=()=>{ heicLib=null; rej(new Error("check your connection")); }; document.head.append(sc); })); }
async function readableImage(file){
  if(!(await isHeic(file))) return file;
  try{ const conv=await loadHeicLib(); let out=await conv({blob:file,toType:"image/jpeg",quality:.9}); if(Array.isArray(out)) out=out[0];
       return new File([out],(file.name||"photo").replace(/\.\w+$/,"")+".jpg",{type:"image/jpeg"}); }
  catch(e){ throw new Error("That photo is in HEIC format and couldn't be converted ("+(e.message||"unknown error")+"). Try again, or turn off High efficiency pictures in your camera settings."); }
}
async function shrink(file,max,square){
  file=await readableImage(file);
  if(file.type==="image/gif" && !square && file.size<5e6) return file;
  const img=await loadImg(file); let sw=img.width, sh=img.height, sx=0, sy=0;
  if(square){const m=Math.min(sw,sh); sx=(sw-m)/2; sy=(sh-m)/2; sw=sh=m;}
  const k=Math.min(1,max/Math.max(sw,sh)), c=document.createElement("canvas");
  c.width=Math.round(sw*k); c.height=Math.round(sh*k);
  c.getContext("2d").drawImage(img,sx,sy,sw,sh,0,0,c.width,c.height);
  return new Promise(r=>c.toBlob(r,"image/jpeg",.85));
}
const safeImg = u => typeof u==="string" && (u.startsWith("https://")||u.startsWith("blob:")) ? u : null;
function linkify(el,text){
  const re=/((?:https?:\/\/|www\.)[^\s<]+[^\s<.,:;"')\]!?])/gi; let last=0, m;
  while((m=re.exec(text))){
    el.append(text.slice(last,m.index));
    const a=document.createElement("a"); a.href=m[0].startsWith("www.")?"https://"+m[0]:m[0];
    a.textContent=m[0]; a.target="_blank"; a.rel="noopener noreferrer";
    el.append(a); last=m.index+m[0].length;
  }
  el.append(text.slice(last));
}
function dayKey(t){ const d=new Date(t); return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate(); }
function dayLabel(t){
  const d=new Date(t), now=new Date(), y=new Date(); y.setDate(now.getDate()-1);
  if(dayKey(d)===dayKey(now)) return "Today";
  if(dayKey(d)===dayKey(y)) return "Yesterday";
  return `${d.getMonth()+1}/${d.getDate()} ${DAYS[d.getDay()].slice(0,3)}`;
}
function shortWhen(t){ return dayKey(t)===dayKey(Date.now()) ? timeOf(t) : dayLabel(t); }
function el(tag,cls,text){ const e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }

/* ================= BACKEND ================= */
let sb=null;
/* 📶 upload a file to Supabase Storage and report progress (0..1) as it goes. supabase-js can't report progress,
   so this sends the exact same request it would, with XMLHttpRequest, which can. */
async function uploadWithProgress(bucket,path,blob,type,onProgress){
  const token=(await sb.auth.getSession()).data.session?.access_token;
  await new Promise((resolve,reject)=>{
    const x=new XMLHttpRequest();
    x.open("POST",`${SUPABASE_URL}/storage/v1/object/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`);
    x.setRequestHeader("Authorization","Bearer "+(token||SUPABASE_ANON_KEY)); x.setRequestHeader("apikey",SUPABASE_ANON_KEY);
    x.setRequestHeader("Content-Type",type); x.setRequestHeader("x-upsert","false"); x.setRequestHeader("cache-control","max-age=3600");
    x.upload.onprogress=e=>{ if(e.lengthComputable) onProgress(e.loaded/e.total); };
    x.onload=()=>{ if(x.status>=200&&x.status<300){ onProgress(1); resolve(); } else { let m="upload failed"; try{ m=JSON.parse(x.responseText).message||m; }catch(e){} reject(new Error(m)); } };
    x.onerror=()=>reject(new Error("network error: failed to fetch")); x.ontimeout=()=>reject(new Error("upload timed out"));
    x.send(blob);
  });
}
try{ if(SUPABASE_URL&&SUPABASE_ANON_KEY&&window.supabase) sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{
  realtime:{heartbeatIntervalMs:15000},   // notice a dead connection sooner (bad Wi-Fi, phone switching networks)
  global:{fetch:(url,opts={})=>{   // on bad Wi-Fi a request can hang forever; give up after 20s so it can retry (uploads get as long as they need)
    if(opts.signal||/\/storage\/v1\/|\/functions\/v1\//.test(String(url))||typeof AbortController==="undefined") return fetch(url,opts);
    const c=new AbortController(), t=setTimeout(()=>c.abort(),20000);
    return fetch(url,{...opts,signal:c.signal}).finally(()=>clearTimeout(t));
  }}
}); }catch(e){}
const must = ({data,error}) => { if(error) throw error; return data; };

const live = {
  async session(){ const {data}=await sb.auth.getSession(); return data.session?.user||null; },
  onAuth(cb){ sb.auth.onAuthStateChange((e,s)=>cb(s?.user||null,e)); },
  async signUp(username,email,password){
    const {data:free,error:chk}=await sb.rpc("username_available",{p_username:username});
    if(!chk&&free===false) throw new Error("That username is taken.");
    const data=must(await sb.auth.signUp({email,password,options:{data:{username,terms_version:TERMS_VERSION,agreed_at:new Date().toISOString(),age_13_plus:true},emailRedirectTo:location.origin+location.pathname}}));
    return data.session ? "in" : "confirm";
  },
  async signIn(id,password){
    if(id.includes("@")){ must(await sb.auth.signInWithPassword({email:id,password})); return; }
    const s=await accountCall({action:"login",username:id,password});   // username: the server looks up the email and signs you in
    must(await sb.auth.setSession({access_token:s.access_token,refresh_token:s.refresh_token}));
  },
  async accountHint(username){ return (await accountCall({action:"hint",username})).hint; },
  async accountRecover(username,code,password){ await accountCall({action:"recover",username,code,password}); },
  async createRecoveryCode(){ return must(await sb.rpc("create_recovery_code")); },
  async myRecoveryCodeDate(){ return must(await sb.rpc("my_recovery_code_date")); },
  async isAdmin(){ return !!must(await sb.rpc("is_app_admin")); },
  async partner(uid){ const {data,error}=await sb.from("partners").select("*").eq("user_id",uid).maybeSingle(); if(error) throw error; return data; },
  async shinies(uid){ const {data,error}=await sb.from("shinies").select("kind,created_at").eq("user_id",uid).order("created_at",{ascending:false}).limit(500); if(error) throw error; return data||[]; },
  async setPartnerName(n){ return must(await sb.rpc("set_partner_name",{p_name:n})); },
  async signOut(){ await sb.auth.signOut(); },
  async resetPassword(email){ must(await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname})); },
  async updatePassword(pw){ must(await sb.auth.updateUser({password:pw})); },
  async deleteAccount(){ must(await sb.rpc("delete_my_account")); await sb.auth.signOut(); },
  async profiles(ids){   // (falls back without status / tz until the new SQL has been run)
    const su=await sb.from("profiles").select("id,username,avatar_url,theme,bubble_color,birthday,last_seen,arcana,tz,status_emoji,status_text,status_at,status_until").in("id",ids);
    if(!su.error) return su.data||[];
    const st=await sb.from("profiles").select("id,username,avatar_url,theme,bubble_color,birthday,last_seen,arcana,tz,status_emoji,status_text,status_at").in("id",ids);
    if(!st.error) return st.data||[];
    const r=await sb.from("profiles").select("id,username,avatar_url,theme,bubble_color,birthday,last_seen,arcana,tz").in("id",ids);
    if(r.error&&/tz/.test(r.error.message||"")) return must(await sb.from("profiles").select("id,username,avatar_url,theme,bubble_color,birthday,last_seen,arcana").in("id",ids));
    return must(r); },
  async saveTz(uid,tz){ await sb.from("profiles").update({tz}).eq("id",uid); },
  async getLook(uid){ const r=await sb.from("profiles").select("look").eq("id",uid).maybeSingle(); if(r.error) return undefined; return r.data?.look??null; },   // undefined = look-sync.sql not run yet
  async setLook(look){ const r=await sb.rpc("set_my_look",{p_look:look}); if(r.error&&!/set_my_look|function|schema cache/i.test(r.error.message||"")) throw r.error; },
  async setStatus(uid,emoji,text,until){
    const row={status_emoji:emoji||null,status_text:text||null,status_at:(emoji||text)?new Date().toISOString():null};
    const r=await sb.from("profiles").update({...row,status_until:(emoji||text)&&until?until:null}).eq("id",uid);
    if(r.error&&/status_until/.test(r.error.message||"")){ must(await sb.from("profiles").update(row).eq("id",uid)); return {noTimer:true}; }   // auto-clear SQL not run yet
    must(r); return {};
  },
  async setRoomIcon(room,url){ must(await sb.rpc("set_room_icon",{p_room:room,p_url:url})); },
  async addFriendsToRoom(room,ids){ return must(await sb.rpc("add_friends_to_room",{p_room:room,p_users:ids})); },
  async reportMessage(id,reason,details){ must(await sb.rpc("report_message",{p_message:id,p_reason:reason,p_details:details||null})); },
  async listReports(status){ return must(await sb.rpc("list_reports",{p_status:status||"open"})); },
  async setReportStatus(id,status){ must(await sb.rpc("set_report_status",{p_id:id,p_status:status})); },
  async setMessageReportsStatus(mid,status){ must(await sb.rpc("set_message_reports_status",{p_message:mid,p_status:status})); },
  async countOpenReports(){ const {data,error}=await sb.rpc("count_open_reports"); return error?0:(data||0); },
  async reportContext(mid){ return must(await sb.rpc("report_context",{p_message:mid})); },
  async adminDeleteMessage(mid){ must(await sb.rpc("admin_delete_message",{p_message:mid})); },
  async roomIcons(){ const {data,error}=await sb.rpc("my_room_icons"); return error?[]:(data||[]); },
  async search(q,roomCode){ return must(await sb.rpc("search_messages",{p_query:q,p_room:roomCode||null,p_limit:40})); },
  async touchSeen(){ await sb.rpc("touch_seen"); },
  async acceptFriendInvite(token){ return must(await sb.rpc("accept_friend_invite",{p_token:token})); },
  async linkPreview(url){ const {data,error}=await sb.functions.invoke("linkpreview",{body:{url}}); if(error||!data||data.error) return null; return data; },
  async saveStyle(uid,style){ must(await sb.from("profiles").update(style).eq("id",uid)); },
  async upload(bucket,uid,blob,name,onProgress){
    const t=(blob.type||"image/jpeg").split(";")[0];
    const ext={"image/gif":"gif","image/jpeg":"jpg","image/png":"png","image/webp":"webp","video/mp4":"mp4","video/webm":"webm","video/quicktime":"mov","audio/mp4":"m4a","audio/webm":"webm","audio/ogg":"ogg","audio/mpeg":"mp3","audio/aac":"aac","application/pdf":"pdf"}[t]||"bin";
    const path=name?`${uid}/${Date.now()}-${Math.random().toString(36).slice(2,8)}/${name}`:`${uid}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    if(onProgress) await uploadWithProgress(bucket,path,blob,t,onProgress);   // same upload, but it reports how far along it is
    else must(await sb.storage.from(bucket).upload(path,blob,{contentType:t}));
    return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  },
  async setAvatar(uid,url){ must(await sb.from("profiles").update({avatar_url:url}).eq("id",uid)); },
  async myRooms(){ return must(await sb.rpc("my_rooms")); },
  // 🛣️ Lanes (lanes.sql). Before that's run, myLanes quietly returns nothing so the app still works.
  async myLanes(){ const {data,error}=await sb.rpc("my_lanes"); if(error){ if(/my_lanes|schema cache|does not exist/i.test(error.message)) return []; throw error; } return data||[]; },
  async laneRooms(ids){ return ids.length?must(await sb.from("rooms").select("*").in("lane",ids)).map(r=>({code:r.code,name:r.name,lane:r.lane,lane_label:r.lane_label,lane_pos:r.lane_pos,lane_kind:r.lane_kind||"chat"})):[]; },
  async laneMembers(lane){ return must(await sb.from("lane_members").select("user_id,role,joined_at").eq("lane",lane)); },
  async laneCreate(name,icon,chat,label){ return must(await sb.rpc("lane_create",{p_name:name,p_icon:icon,p_chat:chat,p_label:label})); },
  async laneAddChat(lane,name,label,kind){ return must(await sb.rpc("lane_add_chat",kind==="voice"?{p_lane:lane,p_name:name,p_label:label,p_kind:"voice"}:{p_lane:lane,p_name:name,p_label:label})); },
  async laneEditChat(code,name,label){ must(await sb.rpc("lane_edit_chat",{p_room:code,p_name:name,p_label:label})); },
  async laneRemoveChat(code){ must(await sb.rpc("lane_remove_chat",{p_room:code})); },
  async laneRename(lane,name,icon){ must(await sb.rpc("lane_rename",{p_lane:lane,p_name:name,p_icon:icon})); },
  async laneAddFriends(lane,ids){ return must(await sb.rpc("lane_add_friends",{p_lane:lane,p_users:ids})); },
  async laneSetRole(lane,uid,role){ must(await sb.rpc("lane_set_role",{p_lane:lane,p_user:uid,p_role:role})); },
  async laneRemoveMember(lane,uid){ must(await sb.rpc("lane_remove_member",{p_lane:lane,p_user:uid})); },
  async laneLeave(lane){ must(await sb.rpc("lane_leave",{p_lane:lane})); },
  async laneAttach(lane,code,label){ must(await sb.rpc("lane_attach_room",{p_lane:lane,p_room:code,p_label:label})); },
  async laneSetArt(lane,iconUrl,banner){ must(await sb.rpc("lane_set_art",{p_lane:lane,p_icon_url:iconUrl,p_banner:banner})); },
  async laneSetChatIcon(code,url){ must(await sb.rpc("lane_set_chat_icon",{p_room:code,p_url:url})); },
  async contacts(){ const rows=must(await sb.from("contacts").select("contact,created_at").eq("owner",user.id)); return rows.map(r=>r.contact); },
  async addedMe(){ const rows=must(await sb.from("contacts").select("owner,created_at").eq("contact",user.id)); return rows.map(r=>r.owner); },
  async myInviteToken(){ return must(await sb.rpc("my_invite_token")); },
  async resetInviteToken(){ return must(await sb.rpc("reset_my_invite_token")); },
  async findUser(username){   // exact-username lookup (profiles are private now, so strangers can't be browsed)
    const r=await sb.rpc("find_profile",{p_username:username});
    if(r.error&&/find_profile|function|schema cache/i.test(r.error.message||"")) return must(await sb.from("profiles").select("id,username,avatar_url,bubble_color").ilike("username",username).maybeSingle());   // lockdown SQL not run yet
    const u=must(r); if(u&&u.id){ cache.set(u.id,{...(cache.get(u.id)||{}),...u}); } return u||null;
  },
  async addContact(uid){ must(await sb.from("contacts").upsert({contact:uid},{onConflict:"owner,contact",ignoreDuplicates:true})); },
  async removeContact(uid){ must(await sb.from("contacts").delete().eq("contact",uid)); },
  async mutualFriends(uid){ return (must(await sb.rpc("mutual_friends",{p_other:uid}))||[]).map(r=>typeof r==="string"?r:r.mutual_friends); },
  async relMine(){ return must(await sb.rpc("rel_mine")); },
  async relPartners(ids){ return must(await sb.rpc("rel_partners",{p_users:ids}))||[]; },
  async relRequest(uid){ return must(await sb.rpc("rel_request",{p_to:uid})); },
  async relRespond(uid,yes){ return must(await sb.rpc("rel_respond",{p_from:uid,p_accept:!!yes})); },
  async relClear(){ return must(await sb.rpc("rel_clear")); },
  async startDm(uid){
    const {data,error}=await sb.rpc("start_dm",{p_user:uid});
    if(error) throw new Error(/not_connected/.test(error.message)?"not_connected":/cant_message/.test(error.message)?"cant_message":error.message);
    return data;
  },
  async setNotify(room,mode){ must(await sb.from("room_members").update({notify:mode}).eq("room",room).eq("user_id",user.id)); },
  async setHere(room,active){ const {error}=await sb.rpc("set_here",{p_room:room,p_active:active}); if(error){ if(/set_here|schema cache|does not exist/i.test(error.message)) return "old"; throw error; } },
  async setViewing(room,on){ const {error}=await sb.rpc("set_viewing",{p_room:room,p_on:on}); if(error&&!/set_viewing|schema cache|does not exist/i.test(error.message)) throw error; },
  async ai(body){ const {data,error}=await sb.functions.invoke("ai",{body}); if(error){ let msg=error.message; try{ const j=await error.context?.json(); if(j?.error) msg=j.error; }catch(e){} throw new Error(msg); } if(data?.error) throw new Error(data.error); return data; },
  async tasks(room){ return must(await sb.from("room_tasks").select("*").eq("room",room).order("created_at")); },
  async addTask(room,text){ return must(await sb.from("room_tasks").insert({room,text}).select().single()); },
  async setTaskDone(id,done){ must(await sb.from("room_tasks").update({done,done_at:done?new Date().toISOString():null}).eq("id",id)); },
  async deleteTask(id){ must(await sb.from("room_tasks").delete().eq("id",id)); },
  async setDisappear(room,sec){ must(await sb.rpc("set_disappear",{p_room:room,p_seconds:sec})); },
  subscribeAll(onMsg,onFriend){
    const ch=sb.channel("inbox-"+user.id)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},p=>onMsg(p.new))
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"contacts",filter:`contact=eq.${user.id}`},p=>onFriend&&onFriend(p.new.owner))
      .subscribe();
    return ()=>sb.removeChannel(ch);
  },
  async joinRoom(room,token){
    const {data,error}=await sb.rpc("join_room",{p_room:room,p_token:token||null});
    if(error) throw new Error(/private_room/.test(error.message)?"private":error.message);
    return data;
  },
  async roomInfo(room){ return must(await sb.from("rooms").select("*").eq("code",room).maybeSingle()); },
  async setBackground(room,bg){ must(await sb.rpc("set_room_background",{p_room:room,p_background:bg})); },
  async setNickname(room,uid,nick){ must(await sb.rpc("set_nickname",{p_room:room,p_user:uid,p_nickname:nick})); },
  async pins(room){ return must(await sb.from("pinned_messages").select("message_id,pinned_by,created_at").eq("room",room).order("created_at",{ascending:false})); },
  async pin(room,id){ must(await sb.from("pinned_messages").insert({room,message_id:id})); },
  async unpin(id){ must(await sb.from("pinned_messages").delete().eq("message_id",id)); },
  async polls(ids){
    if(!ids.length) return {polls:[],votes:[]};
    const [p,v]=await Promise.all([sb.from("polls").select("message_id,options,multi").in("message_id",ids),sb.from("poll_votes").select("message_id,user_id,option_index").in("message_id",ids)]);
    return {polls:must(p),votes:must(v)};
  },
  async games(ids){ return ids.length?must(await sb.from("games").select("*").in("message_id",ids)):[]; },
  async createGame(room,type){ return must(await sb.rpc("create_game",{p_room:room,p_type:type})); },
  async joinGame(id){ must(await sb.rpc("join_game",{p_message:id})); },
  async playTicTacToe(id,cell){ must(await sb.rpc("play_tictactoe",{p_message:id,p_cell:cell})); },
  async playKingsCourt(id,path){ must(await sb.rpc("play_kingscourt",{p_message:id,p_path:path})); },
  async playMancala(id,pit){ must(await sb.rpc("play_mancala",{p_message:id,p_pit:pit})); },
  async playGo(id,move){ must(await sb.rpc("play_go",{p_message:id,p_move:move})); },
  async rematch(id){ return must(await sb.rpc("rematch_game",{p_message:id})); },
  async eightsHand(id){ const r=must(await sb.from("game_hands").select("cards").eq("message_id",id).eq("user_id",user.id).maybeSingle()); return r?.cards||[]; },
  async eightsStart(id,mode){ must(await sb.rpc("eights_start_mode",{p_message:id,p_mode:mode||"classic"})); },
  async l7Start(id){ must(await sb.rpc("l7_start",{p_message:id})); },
  async l7Hit(id){ return must(await sb.rpc("l7_hit",{p_message:id})); },
  async l7Stay(id){ must(await sb.rpc("l7_stay",{p_message:id})); },
  async l7Freeze(id,seat){ must(await sb.rpc("l7_freeze",{p_message:id,p_target:seat})); },
  async l7Skip(id){ must(await sb.rpc("l7_skip",{p_message:id})); },
  async mjStart(id){ must(await sb.rpc("mj_start",{p_message:id})); },
  async boStart(id){ must(await sb.rpc("bo_start",{p_message:id})); },
  async boPlace(id,t){ must(await sb.rpc("bo_place",{p_message:id,p_tile:t})); },
  async boCall(id,n){ must(await sb.rpc("bo_call",{p_message:id,p_n:n})); },
  async boPass(id){ must(await sb.rpc("bo_pass",{p_message:id})); },
  async boFlip(id,seat){ must(await sb.rpc("bo_flip",{p_message:id,p_seat:seat})); },
  async boSkip(id){ must(await sb.rpc("bo_skip",{p_message:id})); },
  async mjDraw(id){ return must(await sb.rpc("mj_draw",{p_message:id})); },
  async mjDiscard(id,t){ must(await sb.rpc("mj_discard",{p_message:id,p_tile:t})); },
  async mjWin(id){ must(await sb.rpc("mj_win",{p_message:id})); },
  async mjClaim(id){ must(await sb.rpc("mj_claim",{p_message:id})); },
  async mjSkip(id){ must(await sb.rpc("mj_skip",{p_message:id})); },
  async eightsLastCard(id){ must(await sb.rpc("eights_lastcard",{p_message:id})); },
  async eightsCatch(id,seat){ must(await sb.rpc("eights_catch",{p_message:id,p_seat:seat})); },
  async eightsPlay(id,card,suit){ must(await sb.rpc("eights_play",{p_message:id,p_card:card,p_suit:suit||null})); },
  async eightsDraw(id){ return must(await sb.rpc("eights_draw",{p_message:id})); },
  async eightsPass(id){ must(await sb.rpc("eights_pass",{p_message:id})); },
  async eightsSkip(id){ must(await sb.rpc("eights_skip",{p_message:id})); },
  async diceStart(id){ must(await sb.rpc("dice_start",{p_message:id})); },
  async diceBid(id,qty,face){ must(await sb.rpc("dice_bid",{p_message:id,p_qty:qty,p_face:face})); },
  async diceCall(id){ must(await sb.rpc("dice_call",{p_message:id})); },
  async diceSkip(id){ must(await sb.rpc("dice_skip",{p_message:id})); },
  async bsStart(id){ must(await sb.rpc("bs_start",{p_message:id})); },
  async bsPlay(id,cards){ must(await sb.rpc("bs_play",{p_message:id,p_cards:cards})); },
  async bsCall(id){ must(await sb.rpc("bs_call",{p_message:id})); },
  async bsAccept(id){ must(await sb.rpc("bs_accept",{p_message:id})); },
  async bsSkip(id){ must(await sb.rpc("bs_skip",{p_message:id})); },
  async createPoll(room,question,options,multi){ return must(await sb.rpc("create_poll",{p_room:room,p_question:question,p_options:options,p_multi:multi})); },
  async vote(id,idx){ must(await sb.rpc("vote_poll",{p_message:id,p_option:idx})); },
  async renameRoom(room,name){ must(await sb.rpc("rename_room",{p_room:room,p_name:name})); },
  async rotateInvite(room){ return must(await sb.rpc("rotate_invite",{p_room:room})); },
  async removeMember(room,uid){ must(await sb.rpc("remove_member",{p_room:room,p_user:uid})); },
  async leaveRoom(room){ must(await sb.rpc("leave_room",{p_room:room})); },
  async members(room){ return must(await sb.from("room_members").select("user_id,last_read_at,last_joined,nickname,notify").eq("room",room)); },
  async markRead(room){ await sb.rpc("mark_read",{p_room:room}); },
  async loadLatest(room){ return must(await sb.from("messages").select("*").eq("room",room).order("created_at",{ascending:false}).limit(PAGE)).reverse(); },
  async loadAfter(room,iso){ return must(await sb.from("messages").select("*").eq("room",room).gte("created_at",iso).order("created_at",{ascending:true}).limit(PAGE)); },
  async loadBefore(room,iso){ return must(await sb.from("messages").select("*").eq("room",room).lt("created_at",iso).order("created_at",{ascending:false}).limit(PAGE)).reverse(); },
  async fetchMessage(id){ return must(await sb.from("messages").select("*").eq("id",id).maybeSingle()); },
  async send(room,f){
    const row={room,kind:f.kind||"text",text:f.text||null,image_url:f.image_url||null,image_urls:f.image_urls||null,media_url:f.media_url||null,media_type:f.media_type||null,media_duration:f.media_duration||null,sticker:f.sticker||null,reply_to:f.reply_to||null,mentions:f.mentions||[],...(f.card?{card:f.card}:{}),...(f.spoiler?{spoiler:true}:{})};
    return must(await sb.from("messages").insert(row).select().single());
  },
  async deleteMessage(id){ must(await sb.from("messages").delete().eq("id",id)); },
  async editMessage(id,text){ return must(await sb.rpc("edit_message",{p_id:id,p_text:text})); },
  async callLog(id,text){ return must(await sb.rpc("call_log",{p_id:id,p_text:text})); },
  async countMessages(room){ const {count,error}=await sb.from("messages").select("id",{count:"exact",head:true}).eq("room",room); if(error) throw error; return count; },
  async reactions(ids){ return ids.length ? must(await sb.from("message_reactions").select("message_id,user_id,emoji").in("message_id",ids)) : []; },
  async react(message_id,room,emoji){ must(await sb.from("message_reactions").insert({message_id,room,emoji})); },
  async unreact(message_id,uid,emoji){ must(await sb.from("message_reactions").delete().eq("message_id",message_id).eq("user_id",uid).eq("emoji",emoji)); },
  async blocks(){ return must(await sb.from("blocks").select("blocked")).map(r=>r.blocked); },
  async block(uid){ must(await sb.from("blocks").insert({blocked:uid})); },
  async unblock(uid){ must(await sb.from("blocks").delete().eq("blocked",uid)); },
  async savePush(json){
    must(await sb.from("push_subscriptions").upsert({endpoint:json.endpoint,p256dh:json.keys.p256dh,auth:json.keys.auth,origin:location.origin},{onConflict:"endpoint"}));
    // moved to a new address? your signups from the old one would make every notification arrive twice
    await sb.from("push_subscriptions").delete().eq("user_id",user.id).or(`origin.is.null,origin.neq.${location.origin}`);
  },
  async habits(){ return must(await sb.from("habits").select("*").eq("archived",false).order("created_at")); },
  async createHabit(label,stat,reminder_time){ return must(await sb.from("habits").insert({label,stat,reminder_time:reminder_time||null}).select().single()); },
  async archiveHabit(id){ must(await sb.from("habits").update({archived:true}).eq("id",id)); },
  async habitStats(){ return must(await sb.from("habits").select("id,stat")); },   // every habit you've ever made, removed ones too, so stats keep their points
  async habitLogs(since){ return must(await sb.from("habit_logs").select("habit_id,done_on,count").gte("done_on",since)); },
  async toggleHabit(id,date){ return must(await sb.rpc("toggle_habit",{p_habit:id,...(date?{p_date:date}:{})})); },
  async bumpHabit(id,date,delta){ return must(await sb.rpc("bump_habit",{p_habit:id,p_date:date,p_delta:delta})); },
  async socialLinks(){ return must(await sb.from("social_links").select("*")); },
  async dmStyle(room){ return must(await sb.from("dm_styles").select("*").eq("room",room).maybeSingle()); },
  async setDmStyle(room,bg,bubbles){ return must(await sb.rpc("set_dm_style",{p_room:room,p_bg:bg||null,p_bubbles:bubbles||null})); },
  async bumpSocialLink(otherId,amount){ return must(await sb.rpc("bump_social_link",{p_other:otherId,...(amount?{p_amount:amount}:{})})); },
  async saveArcana(arcana){ must(await sb.from("profiles").update({arcana}).eq("id",user.id)); },
  async deletePush(endpoint){ await sb.from("push_subscriptions").delete().eq("endpoint",endpoint); },
  // Night Owl: sent while the app is closing, so it uses a keepalive request the browser finishes even after the page freezes
  async backlog(uid){ return must(await sb.from("backlog_items").select("*").eq("user_id",uid).order("created_at",{ascending:false})); },
  async addBacklog(it){ return must(await sb.from("backlog_items").insert(it).select().single()); },
  async addBacklogMany(list){ return must(await sb.from("backlog_items").insert(list).select()); },
  async updateBacklog(id,patch){ must(await sb.from("backlog_items").update(patch).eq("id",id)); },
  async deleteBacklog(id){ must(await sb.from("backlog_items").delete().eq("id",id)); },
  async mySignal(){ return must(await sb.from("night_signal").select("*").eq("user_id",user.id).maybeSingle()); },
  async signalOf(uid){ const r=must(await sb.from("night_signal").select("top").eq("user_id",uid).maybeSingle()); return r?.top||null; },   // friends only (the database checks)
  async saveSignal(scores,top){ must(await sb.from("night_signal").upsert({user_id:user.id,scores,top,taken_at:new Date().toISOString()},{onConflict:"user_id"})); },
  async afterHours(){ const r=must(await sb.from("night_signal_after_hours").select("answer").eq("user_id",user.id).maybeSingle()); return r?.answer||""; },
  async saveAfterHours(answer){
    if(!answer) return must(await sb.from("night_signal_after_hours").delete().eq("user_id",user.id));
    must(await sb.from("night_signal_after_hours").upsert({user_id:user.id,answer,updated_at:new Date().toISOString()},{onConflict:"user_id"}));
  },
  async saveProgress(d){ return must(await sb.rpc("save_progress",{p_xp:d.xp,p_log:d.log,p_secrets:d.secrets,p_unlocks:d.unlocks})); },
  saveProgressOnExit(d){ if(!owlToken) return; try{ fetch(SUPABASE_URL+"/rest/v1/rpc/save_progress",{method:"POST",keepalive:true,headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+owlToken,"Content-Type":"application/json"},body:JSON.stringify({p_xp:d.xp,p_log:d.log,p_secrets:d.secrets,p_unlocks:d.unlocks})}).catch(()=>{}); }catch(e){} },
  owlSchedule(tz){ if(!owlToken) return; try{ fetch(SUPABASE_URL+"/rest/v1/rpc/owl_schedule",{method:"POST",keepalive:true,headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+owlToken,"Content-Type":"application/json"},body:JSON.stringify({p_tz:tz})}).catch(()=>{}); }catch(e){} },
  async owlCancel(){ await sb.rpc("owl_cancel"); },
  async testPush(){ const {data,error}=await sb.functions.invoke("notify",{body:{selfTest:true}}); if(error){ let msg=error.message; try{ const jj=await error.context?.json(); if(jj?.error) msg=jj.error; }catch(e){} throw new Error(msg); } return data; },
  subscribe(room,h){
    const pub=sb.channel("room-"+room)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`room=eq.${room}`},p=>h.msg(p.new))
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"messages"},p=>p.old?.id!=null&&h.msgGone(p.old.id))
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"messages",filter:`room=eq.${room}`},p=>p.new?.id!=null&&h.msgEdited&&h.msgEdited(p.new))
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"profiles"},p=>h.profile(p.new))
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"room_members",filter:`room=eq.${room}`},p=>h.member(p.new))
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"room_members",filter:`room=eq.${room}`},p=>h.member(p.new))
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"room_members"},p=>p.old?.room===room&&h.memberGone(p.old.user_id))
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"rooms",filter:`code=eq.${room}`},p=>h.roomUpdated(p.new))
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"message_reactions",filter:`room=eq.${room}`},p=>h.reaction(p.new,true))
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"message_reactions"},p=>p.old&&h.reaction(p.old,false))
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"poll_votes",filter:`room=eq.${room}`},p=>h.vote(p.new,true))
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"poll_votes"},p=>p.old&&h.vote(p.old,false))
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"pinned_messages",filter:`room=eq.${room}`},p=>h.pin(p.new,true))
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"games",filter:`room=eq.${room}`},p=>h.game(p.new))
      .on("postgres_changes",{event:"*",schema:"public",table:"room_tasks",filter:`room=eq.${room}`},p=>h.task(p))
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"pinned_messages"},p=>p.old&&h.pin(p.old,false))
      .subscribe(s=>h.status(s==="SUBSCRIBED"?"Live":"Reconnecting…"));
    const priv=sb.channel("typing:"+room,{config:{private:true,broadcast:{self:false}}})
      .on("broadcast",{event:"typing"},({payload})=>h.typing(payload))
      .on("broadcast",{event:"hifive"},({payload})=>h.hifive&&h.hifive(payload))
      .on("broadcast",{event:"dmstyle"},({payload})=>h.dmstyle&&h.dmstyle(payload))
      .subscribe();
    const stop=()=>{ sb.removeChannel(pub); sb.removeChannel(priv); };
    stop.typing=payload=>priv.send({type:"broadcast",event:"typing",payload});
    stop.hifive=payload=>priv.send({type:"broadcast",event:"hifive",payload});
    stop.dmstyle=payload=>priv.send({type:"broadcast",event:"dmstyle",payload});
    return stop;
  }
};

const demo = (()=>{ // in-memory stand-in so the preview works without a server
  let user=null, listeners=[], H=null, nextId=100;
  const iso=(ago=0)=>new Date(Date.now()-ago).toISOString();
  const people={rook:{id:"rook",username:"Rook",avatar_url:null,tz:"Europe/London"},vee:{id:"vee",username:"Vee",avatar_url:null,tz:"America/New_York"}};
  const demoReports=[];
  function demoNotice(room,text){ const r=rooms[room], last=r.msgs[r.msgs.length-1];
    if(last&&last.kind==="notice"&&last.user_id==="me"&&last.text.split(":")[0]===text.split(":")[0]&&Date.now()-new Date(last.created_at)<120000){ r.msgs.pop(); fire("msgGone",last.id); }
    const m={id:nextId++,room,user_id:"me",kind:"notice",text,mentions:[],created_at:iso()}; r.msgs.push(m); setTimeout(()=>fire("msg",m),40); }
  const games={};
  const demoHabits=[{id:1,user_id:"me",label:"Drink water",stat:"guts",reminder_time:null,archived:false,created_at:iso(9e7)},{id:2,user_id:"me",label:"Read 10 pages",stat:"knowledge",reminder_time:null,archived:false,created_at:iso(9e7)}];
  let demoHabitId=3; const demoHabitLogs=[{habit_id:1,user_id:"me",done_on:new Date(Date.now()-864e5).toISOString().slice(0,10)}];
  const demoSocialLinks=new Map([["me|vee",{user_a:"me",user_b:"vee",xp:9,today_xp:9,today_date:iso().slice(0,10),arcana:"Star"}]]);
  function demoBot(id){ const g=games[id]; if(!g||g.status!=="active") return; const mark=g.player_x==="me"?"o":"x"; if(g.state.turn!==mark) return;
    const cell=tttBotMove(g.state.board,mark); applyTTT(g,cell,mark); fire("game",JSON.parse(JSON.stringify(g))); }
  const demoLanes={}; let demoLaneN=0;
  const rooms={}, reacts=[], blocked=new Set(), polls={}, votes=[], pins={}, contacts=new Set(["vee"]), relLinks=[]; let ALL=null, FRIEND=null;
  people.nix={id:"nix",username:"Nix",avatar_url:null};
  const lines=["No way. Tell me everything.","That is so you.","Check this: www.example.com","Meet at the usual spot?","LOL stop"];
  const seed=room=>rooms[room] ||= {owner:"me",token:"demo"+Math.random().toString(36).slice(2,8),members:{me:{read:iso()},rook:{read:iso(70000)},vee:{read:iso(50000)}},msgs:[
    {id:1,room,user_id:"rook",text:"Signal's clear. Who's online?",created_at:iso(26*3600e3)},
    {id:2,room,user_id:"vee",text:"Here. Bring snacks.",created_at:iso(25*3600e3)},
    {id:3,room,user_id:"rook",text:"Morning crew.",created_at:iso(90000)},
    {id:4,room,user_id:"vee",text:"Who's up for the arcade later?",reply_to:3,created_at:iso(60000)},
    {id:5,room,user_id:"rook",kind:"poll",text:"Arcade or movies tonight?",created_at:iso(45000)},
    {id:6,room,user_id:"vee",kind:"sticker",sticker:"omw",created_at:iso(30000)}]};
  polls[5]={message_id:5,options:["Arcade","Movies","Both 😎"],multi:false}; votes.push({message_id:5,user_id:"vee",option_index:0});
  people.vee.bubble_color="#0E3B4A"; people.vee.arcana="Priestess";
  const demoSignal={};
  let demoBlId=500; const demoBl={me:[], vee:[
    {id:1,user_id:"vee",type:"anime",title:"Cyberpunk: Edgerunners",status:"in-progress",progress:6,total:10,rating:5,platform:"Netflix",image:"https://media.kitsu.app/anime/poster_images/44242/small.jpg",source_id:"kitsu:44242",created_at:iso(9e6)},
    {id:2,user_id:"vee",type:"game",title:"Persona 5 Royal",status:"planned",progress:0,total:null,rating:0,platform:"PC",image:null,source_id:"rawg:274755",created_at:iso(9e7)}]};
  { const d=new Date(); people.vee.birthday=String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  reacts.push({message_id:2,user_id:"rook",emoji:"😂"});
  const fire=(f,...a)=>H&&H[f](...a);
  // ---- Crazy Eights (demo mirror of the server rules) ----
  const demoE8={};
  // ---- Mahjong (demo mirror of mahjong.sql) ----
  function mjDemoBegin(g){
    const n=g.state.players.length, wall=[]; for(const s of "dbc") for(let v=1;v<=9;v++) for(let k=0;k<4;k++) wall.push(s+v);
    wall.sort(()=>Math.random()-.5); const hands={}; g.state.players.forEach((u,i)=>hands[u]=wall.splice(0,13));
    demoE8[g.message_id]={deck:wall,discard:[],hands}; const first=Math.floor(Math.random()*n);
    Object.assign(g.state,{turn:first,phase:"draw",wall:wall.length,counts:Array(n).fill(13),rivers:Array.from({length:n},()=>[]),pend:null,last:null,winner:null,how:null,from:null,reveal:null}); g.status="active"; }
  function mjDemoFinish(g,winner,how,from){ const d=demoE8[g.message_id]; g.state.reveal=JSON.parse(JSON.stringify(d.hands)); Object.assign(g.state,{winner,how,from,pend:null}); g.status="done"; }
  function mjDemoMove(g,who,act){
    const st=g.state, P=st.players, seat=P.indexOf(who), d=demoE8[g.message_id], n=P.length;
    if(g.status!=="active") throw new Error("This game isn't being played right now.");
    if(act.claim){ const p=st.pend; if(!p||st.phase!=="draw") throw new Error("Too late, that tile is gone."); if(p.seat===seat) throw new Error("You can't claim your own tile.");
      if(!mjIsWin([...d.hands[who],p.tile])) throw new Error("That tile doesn't finish your hand."); d.hands[who].push(p.tile); st.rivers[p.seat].pop(); st.last={by:who,act:"claim",tile:p.tile}; mjDemoFinish(g,who,"claim",p.seat); e8DemoAfter(g); return; }
    if(seat!==st.turn) throw new Error("It's not your turn.");
    if(act.draw){ if(st.phase!=="draw") throw new Error("You already drew. Throw a tile away.");
      if(!d.deck.length){ st.last={by:who,act:"wall"}; mjDemoFinish(g,null,"wall",null); e8DemoAfter(g); return null; }
      const t=d.deck.shift(); d.hands[who].push(t); st.wall=d.deck.length; st.counts[seat]++; st.phase="discard"; st.pend=null; st.last={by:who,act:"draw"}; e8DemoAfter(g); return t; }
    if(act.win){ if(st.phase!=="discard") throw new Error("Draw a tile first."); if(!mjIsWin(d.hands[who])) throw new Error("Not quite! You need 4 sets and a pair."); st.last={by:who,act:"win"}; mjDemoFinish(g,who,"self",null); e8DemoAfter(g); return; }
    if(act.discard){ if(st.phase!=="discard") throw new Error("Draw a tile first."); const h=d.hands[who], k=h.indexOf(act.discard); if(k<0) throw new Error("That tile isn't in your hand.");
      h.splice(k,1); st.rivers[seat].push(act.discard); st.counts[seat]=h.length; st.turn=(seat+1)%n; st.phase="draw"; st.pend={tile:act.discard,seat}; st.last={by:who,act:"discard",tile:act.discard}; e8DemoAfter(g); }
  }
  function mjDemoBot(g){
    const st=g.state; if(g.status!=="active") return; const d=demoE8[g.message_id];
    if(st.pend&&st.phase==="draw"){ for(const u of st.players){ if(u==="me"||st.players.indexOf(u)===st.pend.seat) continue; if(mjIsWin([...d.hands[u],st.pend.tile])){ mjDemoMove(g,u,{claim:true}); return; } } }
    const who=st.players[st.turn]; if(who==="me") return;
    if(st.phase==="draw"){ mjDemoMove(g,who,{draw:true}); return; }
    const h=d.hands[who]; if(mjIsWin(h)){ mjDemoMove(g,who,{win:true}); return; }
    const good=[...mjGoodThrows(h)], loose=mjGroups(h).loose;
    mjDemoMove(g,who,{discard:good.length?good[0]:loose.length?loose[Math.floor(Math.random()*loose.length)]:h[h.length-1]});
  }
  // ---- Lucky 7 (demo mirror of lucky7.sql) ----
  function l7DemoDeck(){ const d=[]; for(let v=0;v<=12;v++) for(let k=0;k<Math.max(v,1);k++) d.push("n"+v); d.push("S","S","S","F","F","F","X2","P4","P4","P8","P8"); return d.sort(()=>Math.random()-.5); }
  const l7Empty=n=>Array.from({length:n},()=>({n:[],m:[],st:"in",sh:false}));
  function l7DemoBegin(g){ const n=g.state.players.length, first=Math.floor(Math.random()*n); demoE8[g.message_id]={deck:l7DemoDeck(),discard:[]};
    Object.assign(g.state,{scores:Array(n).fill(0),round:1,starter:first,turn:first,rows:l7Empty(n),deck:90,freezer:null,winner:null,last:null,lastRound:null,goal:150}); g.status="active"; }
  function l7DemoAfterMove(g,seat,last){
    const st=g.state, n=st.players.length, lucky=st.rows.some(r=>r.st==="lucky"); let nxt=null;
    if(!lucky) for(let i=1;i<=n;i++){ if(st.rows[(seat+i)%n].st==="in"){ nxt=(seat+i)%n; break; } }
    st.last=last; if(nxt!==null){ st.turn=nxt; return; }
    const sum=st.rows.map(r=>({pts:l7RowScore(r),st:r.st})); sum.forEach((x,i)=>st.scores[i]+=x.pts);
    st.lastRound={round:st.round,rows:st.rows,sum}; let best=-1, w=null; st.scores.forEach((v,i)=>{ if(v>=st.goal&&v>best){ best=v; w=st.players[i]; } });
    st.starter=(st.starter+1)%n; st.turn=st.starter;
    if(w){ g.status="done"; st.winner=w; } else { st.round++; st.rows=l7Empty(n); }
  }
  function l7DemoMove(g,who,act){
    const st=g.state, P=st.players, seat=P.indexOf(who), d=demoE8[g.message_id];
    if(g.status!=="active") throw new Error("This game isn't being played right now.");
    if(act.freeze!==undefined){ if(st.freezer!==seat) throw new Error("You don't have a Freeze to use."); if(st.rows[act.freeze]?.st!=="in") throw new Error("Pick someone who's still in the round."); st.rows[act.freeze].st="stay"; st.freezer=null; l7DemoAfterMove(g,seat,{by:who,froze:P[act.freeze]}); e8DemoAfter(g); return; }
    if(st.freezer!=null) throw new Error("Waiting for someone to pick who to freeze.");
    if(seat!==st.turn) throw new Error("It's not your turn.");
    const r=st.rows[seat];
    if(act.stay){ if(!r.n.length&&!r.m.length) throw new Error("Flip at least one card first."); r.st="stay"; l7DemoAfterMove(g,seat,{by:who,stayed:true}); e8DemoAfter(g); return; }
    if(!d.deck.length){ d.deck=d.discard.sort(()=>Math.random()-.5); d.discard=[]; }
    const c=d.deck.shift(); st.deck=d.deck.length; const last={by:who,card:c};
    if(c[0]==="n"){ const v=+c.slice(1); if(r.n.includes(v)){ if(r.sh){ r.sh=false; last.saved=true; } else { r.n.push(v); r.st="bust"; last.bust=true; } } else { r.n.push(v); if(new Set(r.n).size>=7){ r.st="lucky"; last.lucky=true; } } }
    else if(c==="S"){ if(!r.sh) r.sh=true; else { const n=st.rows.length; let o=null; for(let k=1;k<n;k++){ const i=(seat+k)%n; if(st.rows[i].st==="in"&&!st.rows[i].sh){ o=i; break; } } if(o!==null){ st.rows[o].sh=true; last.gave=P[o]; } else { d.discard.push(c); last.tossed=true; } } }
    else if(c==="F"){ if(!st.rows.some((x,i)=>x.st==="in"&&i!==seat)){ r.st="stay"; last.froze=who; l7DemoAfterMove(g,seat,last); e8DemoAfter(g); return c; } st.freezer=seat; st.last=last; e8DemoAfter(g); return c; }
    else r.m.push(c);
    l7DemoAfterMove(g,seat,last); e8DemoAfter(g); return c;
  }
  function l7DemoBot(g){
    const st=g.state; if(g.status!=="active") return;
    if(st.freezer!=null){ const who=st.players[st.freezer]; if(who==="me") return; const best=st.rows.map((r,i)=>({i,s:r.st==="in"&&i!==st.freezer?l7RowScore(r):-1})).sort((a,b)=>b.s-a.s)[0]; l7DemoMove(g,who,{freeze:best.s>=0?best.i:st.freezer}); return; }
    const who=st.players[st.turn]; if(who==="me") return; const r=st.rows[st.turn];
    if(r.n.length&&(l7RowScore(r)>=22||r.n.length>=5)) l7DemoMove(g,who,{stay:true}); else l7DemoMove(g,who,{hit:true});
  }
  // ---- Blackout (demo mirror of blackout.sql) ----
  const boUnstack=h=>h.map(c=>c.replace(/^p/,""));
  function boNextD(st,from,skipPassed){ const n=st.players.length; for(let i=1;i<=n;i++){ const s=(from+i)%n; if(st.tiles[s]>0&&!(skipPassed&&st.passed[s])) return s; } return from; }
  function boPlaceTurnD(st){ const n=st.players.length; for(let i=0;i<n;i++){ const s=(st.starter+i)%n; if(st.tiles[s]>0&&!st.placed[s]) return s; } return null; }
  function boDemoRound(g,starter){ const st=g.state, n=st.players.length, d=demoE8[g.message_id];
    st.players.forEach(u=>d.hands[u]=boUnstack(d.hands[u])); let s=starter; if(!(st.tiles[s]>0)) s=boNextD(st,s,false);
    Object.assign(st,{phase:"place",round:(st.round||0)+1,starter:s,turn:s,piles:Array(n).fill(0),shown:Array.from({length:n},()=>[]),placed:Array(n).fill(false),passed:Array(n).fill(false),bid:null,flipper:null,need:0,lit:0}); }
  function boDemoBegin(g){ const P=g.state.players; demoE8[g.message_id]={hands:Object.fromEntries(P.map(u=>[u,["N","N","N","B"]]))};
    Object.assign(g.state,{tiles:P.map(()=>4),pts:P.map(()=>0),round:0,winner:null,last:null,result:null,goal:2}); boDemoRound(g,Math.floor(Math.random()*P.length)); g.status="active"; }
  function boDemoResolve(g,ok,hit,last){
    const st=g.state, f=st.flipper, d=demoE8[g.message_id], P=st.players; let w=null;
    const res={round:st.round,by:P[f],seat:f,need:st.need,ok,hit:hit==null?null:P[hit],shown:JSON.parse(JSON.stringify(st.shown)),piles:[...st.piles],lost:false,out:false};
    if(ok){ st.pts[f]++; if(st.pts[f]>=st.goal) w=P[f]; }
    else { const cs=boUnstack(d.hands[P[f]]); cs.splice(Math.floor(Math.random()*cs.length),1); d.hands[P[f]]=cs; st.tiles[f]=cs.length; res.lost=true; res.out=!cs.length;
      if(st.tiles.filter(t=>t>0).length<=1) w=P[st.tiles.findIndex(t=>t>0)]; }
    const nxt=st.tiles[f]>0?f:(hit!=null&&hit!==f&&st.tiles[hit]>0?hit:boNextD(st,f,false));
    st.result=res; st.last=last;
    if(w){ P.forEach(u=>d.hands[u]=boUnstack(d.hands[u])); g.status="done"; st.winner=w; st.phase="over"; st.bid=null; return; }
    boDemoRound(g,nxt); st.turn=boPlaceTurnD(st);
  }
  function boDemoReveal(g,seat,by){
    const st=g.state, d=demoE8[g.message_id], pile=d.hands[st.players[seat]].filter(c=>c[0]==="p"), k=st.shown[seat].length;
    if(k>=pile.length) throw new Error("That stack is all flipped.");
    const tile=pile[pile.length-1-k].slice(1); st.shown[seat].push(tile); const last={by,act:"flip",seat,tile};
    if(tile==="B"){ boDemoResolve(g,false,seat,{...last,end:true}); return true; }
    st.lit++; if(st.lit>=st.need){ boDemoResolve(g,true,null,{...last,end:true}); return true; }
    st.last=last; return false;
  }
  function boDemoFlipStart(g,by){ const st=g.state, f=st.bid.seat;
    Object.assign(st,{phase:"flip",flipper:f,need:st.bid.n,lit:0,turn:f,last:{by,act:"won",seat:f,n:st.bid.n}});
    for(let k=0;k<st.piles[f];k++) if(boDemoReveal(g,f,st.players[f])) return; }
  function boDemoMove(g,who,act){
    const st=g.state, P=st.players, seat=P.indexOf(who), d=demoE8[g.message_id], total=st.piles.reduce((a,b)=>a+b,0);
    if(g.status!=="active") throw new Error("This game isn't being played right now.");
    if(seat<0) throw new Error("You're not playing in this game.");
    if(act.place){
      if(!(st.tiles[seat]>0)) throw new Error("You're out of tiles.");
      if(st.phase==="place"){ if(st.placed[seat]) throw new Error("You already set your tile. Waiting on the others."); }
      else if(st.phase==="play"){ if(st.turn!==seat) throw new Error("It's not your turn."); }
      else throw new Error("Someone already made a call. Raise or drop out.");
      const h=d.hands[who], k=h.indexOf(act.place); if(k<0) throw new Error("You don't have that tile in your hand.");
      h.splice(k,1); h.push("p"+act.place); st.piles[seat]++; st.last={by:who,act:"place",seat};
      if(st.phase==="place"){ st.placed[seat]=true; const nt=boPlaceTurnD(st); if(nt==null){ st.phase="play"; st.turn=st.starter; } else st.turn=nt; }
      else st.turn=boNextD(st,seat,false);
    } else if(act.call!==undefined){
      if(st.phase!=="play"&&st.phase!=="bid") throw new Error("You can't call right now.");
      if(st.turn!==seat) throw new Error("It's not your turn.");
      const raising=st.phase==="bid", n=act.call;
      if(!(n>=1)) throw new Error("Call at least 1.");
      if(raising&&n<=st.bid.n) throw new Error(`Call higher than ${st.bid.n}, or drop out.`);
      if(n>total) throw new Error(`There are only ${total} tiles on the table.`);
      st.phase="bid"; st.bid={seat,n}; st.last={by:who,act:raising?"raise":"call",seat,n};
      const nt=boNextD(st,seat,true); if(n>=total||nt===seat) boDemoFlipStart(g,who); else st.turn=nt;
    } else if(act.pass){
      if(st.phase!=="bid") throw new Error("Nobody has called yet."); if(st.turn!==seat) throw new Error("It's not your turn.");
      st.passed[seat]=true; st.last={by:who,act:"pass",seat}; const nt=boNextD(st,seat,true);
      if(nt===st.bid.seat) boDemoFlipStart(g,who); else st.turn=nt;
    } else if(act.flip!==undefined){
      const i=act.flip; if(st.phase!=="flip"||st.flipper!==seat) throw new Error("You're not the one flipping.");
      if(st.shown[seat].length<st.piles[seat]) throw new Error("Flip your own stack first.");
      if(i===seat||!(st.shown[i]?.length<st.piles[i])) throw new Error("That stack is all flipped.");
      boDemoReveal(g,i,who);
    }
    e8DemoAfter(g);
  }
  // the bots (and "play for someone who's away")
  function boDemoBot(g,forAway){
    const st=g.state; if(g.status!=="active") return; const P=st.players, d=demoE8[g.message_id];
    const who=st.phase==="place"?P.find((u,i)=>st.tiles[i]>0&&!st.placed[i]&&u!=="me"):P[st.turn];
    if(!who||who==="me") return;
    const seat=P.indexOf(who), h=d.hands[who], hand=h.filter(c=>c[0]!=="p"), pileN=h.filter(c=>c==="pN").length, myB=h.includes("pB"), total=st.piles.reduce((a,b)=>a+b,0);
    const pick=()=>hand.includes("B")&&Math.random()<.3?"B":hand.includes("N")?"N":"B";
    if(st.phase==="place") return boDemoMove(g,who,{place:pick()});
    if(st.phase==="play"){ if(hand.length&&(Math.random()<.5||total<2)) return boDemoMove(g,who,{place:pick()});
      return boDemoMove(g,who,{call:Math.max(1,Math.min(total,myB?Math.max(1,total-1):pileN+(Math.random()<.5?1:0)))}); }
    if(st.phase==="bid"){ const want=myB?0:pileN+1; if(st.bid.n+1<=Math.min(total,want)&&Math.random()<.6) return boDemoMove(g,who,{call:st.bid.n+1}); return boDemoMove(g,who,{pass:true}); }
    if(st.phase==="flip"){ const opts=P.map((u,i)=>i).filter(i=>i!==seat&&st.shown[i].length<st.piles[i]); if(opts.length) return boDemoMove(g,who,{flip:opts[Math.floor(Math.random()*opts.length)]}); }
  }
  function e8DemoTake(d,u,k){ for(let i=0;i<k;i++){ if(!d.deck.length&&d.discard.length>1){ const top=d.discard.pop(); d.deck=d.discard.sort(()=>Math.random()-.5); d.discard=[top]; } if(!d.deck.length) break; d.hands[u].push(d.deck.shift()); } }
  function e8DemoDeal(g,mode){
    const deck=[]; for(const r of ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]) for(const su of ["S","H","D","C"]) deck.push(r+su);
    if(mode==="wild") deck.push("+4W","+4W","+4W","+4W");
    for(let i=deck.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
    const P=g.state.players, size=P.length===2?7:5, hands={}; P.forEach(u=>hands[u]=deck.splice(0,size));
    let k=deck.findIndex(c=>!c.startsWith("8")&&!c.startsWith("+4")); const top=deck.splice(k,1)[0];
    demoE8[g.message_id]={deck,discard:[top],hands};
    Object.assign(g.state,{counts:P.map(u=>hands[u].length),turn:Math.floor(Math.random()*P.length),top,suit:top.slice(-1),deck:deck.length,drew:false,winner:null,last:null,mode:mode==="wild"?"wild":"classic",dir:1,pending:0,pendkind:null,called:{}});
    g.status="active";
  }
  function e8DemoMove(g,who,act){
    const d=demoE8[g.message_id], st=g.state, P=st.players, seat=P.indexOf(who);
    if(g.status!=="active") throw new Error("This game isn't being played right now.");
    if(seat!==st.turn) throw new Error("It's not your turn.");
    const hand=d.hands[who]; let drawn=null;
    const wild=st.mode==="wild", n=P.length, nxt=(k)=>(((seat+(st.dir||1)*k)%n)+n)%n;
    if(act.play){
      const i=hand.indexOf(act.play); if(i<0) throw new Error("That card isn't in your hand.");
      const c=act.play, r=c.slice(0,-1), su=c.slice(-1);
      if(wild&&st.pending>0&&r!==st.pendkind) throw new Error(`You have to take the +${st.pending}. Stack a ${st.pendkind} on it, or tap Take.`);
      if(r==="8"||(wild&&r==="+4")){ if(!["S","H","D","C"].includes(act.suit)) throw new Error("Pick a suit."); }
      else if(su!==st.suit&&r!==st.top.slice(0,-1)) throw new Error("That card doesn't match. Play the same suit or number, or an 8.");
      hand.splice(i,1); d.discard.push(c);
      let steps=1, a=null;
      if(wild&&hand.length){ if(r==="J"){ steps=2; a="skip"; } else if(r==="Q"){ if(n===2) steps=2; else st.dir=-(st.dir||1); a="reverse"; } else if(r==="2"){ st.pending+=2; st.pendkind="2"; a="draw2"; } else if(r==="+4"){ st.pending+=4; st.pendkind="+4"; a="draw4"; }
        if(hand.length>1&&st.called) delete st.called[seat]; }
      st.top=c; st.suit=(r==="8"||r==="+4")?act.suit:su; st.drew=false; st.last={by:who,card:c,suit:st.suit,act:a}; st.counts[seat]=hand.length;
      if(!hand.length){ g.status="done"; st.winner=who; st.pending=0; } else st.turn=(((seat+(st.dir||1)*steps)%n)+n)%n;
    } else if(act.draw&&wild&&st.pending>0){
      const k=st.pending; e8DemoTake(d,who,k); st.counts[seat]=hand.length; st.deck=d.deck.length; st.pending=0; st.pendkind=null; if(st.called) delete st.called[seat];
      st.turn=nxt(1); st.drew=false; st.last={by:who,took:k};
    } else if(act.draw){
      if(st.drew) throw new Error("You already drew. Play a card or pass.");
      if(!d.deck.length){ const top=d.discard.pop(); d.deck=d.discard.sort(()=>Math.random()-.5); d.discard=[top]; }
      if(!d.deck.length) throw new Error("No cards left to draw. Pass instead.");
      drawn=d.deck.shift(); hand.push(drawn); st.drew=true; st.deck=d.deck.length; st.counts[seat]=hand.length; st.last={by:who,drew:true};
    } else if(act.pass){
      if(!st.drew&&d.deck.length+d.discard.length>1) throw new Error("Draw a card first. You can pass after drawing.");
      st.drew=false; st.turn=nxt(1); st.last={by:who,passed:true};
    }
    e8DemoAfter(g); return drawn;
  }
  // ---- Liar's Dice (demo mirror of the server rules) ----
  const ldRoll=n=>Array.from({length:n},()=>String(1+Math.floor(Math.random()*6)));
  const ldNext=(st,from)=>{ const n=st.players.length; for(let i=1;i<=n;i++){ const s=(from+i)%n; if(st.counts[s]>0) return s; } return from; };
  function ldNewRound(g,first){ const st=g.state, d=demoE8[g.message_id]; st.players.forEach((u,i)=>d.hands[u]=ldRoll(st.counts[i])); st.bid=null; st.turn=first; st.round=(st.round||0)+1; }
  function ldDemoBegin(g){ const n=g.state.players.length; demoE8[g.message_id]={hands:{}}; Object.assign(g.state,{counts:Array(n).fill(5),round:0,reveal:null,winner:null,last:null}); ldNewRound(g,Math.floor(Math.random()*n)); g.status="active"; }
  function ldDemoMove(g,who,act,by){
    const st=g.state, P=st.players, seat=P.indexOf(who), d=demoE8[g.message_id];
    if(g.status!=="active") throw new Error("This game isn't being played right now.");
    if(!act.skip&&seat!==st.turn) throw new Error("It's not your turn.");
    const endOrNext=(loserSeat)=>{ const alive=st.counts.filter(c=>c>0).length;
      if(alive<=1){ g.status="done"; st.bid=null; st.winner=P[st.counts.findIndex(c=>c>0)]; } else ldNewRound(g,st.counts[loserSeat]>0?loserSeat:ldNext(st,loserSeat)); };
    if(act.bid){ const [q,f]=act.bid, total=st.counts.reduce((a,b)=>a+b,0);
      if(!(f>=2&&f<=6)) throw new Error("Bid on a number from 2 to 6 (1s are wild).");
      if(!(q>=1&&q<=total)) throw new Error(`There are only ${total} dice on the table.`);
      if(st.bid&&!(q>st.bid.qty||(q===st.bid.qty&&f>st.bid.face))) throw new Error("Your bid has to be higher: more dice, or the same number of dice with a higher face.");
      st.bid={qty:q,face:f,by:who}; st.turn=ldNext(st,seat); st.last={by:who,qty:q,face:f};
    } else if(act.call){
      if(!st.bid) throw new Error("Nobody has bid yet, so there's nothing to call. Make the first bid.");
      const dice={}; P.forEach((u,i)=>{ if(st.counts[i]>0) dice[u]=[...d.hands[u]]; });
      const cnt=Object.values(dice).flat().filter(x=>x===String(st.bid.face)||x==="1").length;
      const loser=cnt>=st.bid.qty?who:st.bid.by, ls=P.indexOf(loser); st.counts[ls]--;
      st.reveal={dice,bid:{...st.bid},caller:who,loser,count:cnt}; st.last={by:who,called:true,loser}; endOrNext(ls);
    } else if(act.skip){ st.counts[seat]--; st.reveal=null; st.last={by:by||"me",skipped:who}; endOrNext(seat); }
    e8DemoAfter(g);
  }
  function ldDemoBot(g,who){
    if(g.status!=="active"||g.state.players[g.state.turn]!==who) return;
    const st=g.state, hand=demoE8[g.message_id].hands[who], total=st.counts.reduce((a,b)=>a+b,0);
    const f=2+Math.floor(Math.random()*5), mine=hand.filter(x=>x===String(f)||x==="1").length, guess=mine+Math.round((total-hand.length)/3);
    const b=st.bid;
    if(b&&(b.qty>guess+1||b.qty>=total||Math.random()<.15)){ ldDemoMove(g,who,{call:true}); return; }
    let q=!b?Math.max(1,Math.min(total,guess)):(f>b.face?b.qty:b.qty+1);
    if(q>total){ ldDemoMove(g,who,{call:true}); return; }
    ldDemoMove(g,who,{bid:[q,f]});
  }
  function goDemoBot(g){   // Go practice bot
    const human=g.player_x==="me"?"x":"o"; if(g.status!=="active"||g.state.turn===human) return;
    const bm=g.state.turn, r=goApply(g.state,bm,goBotMove(g.state,bm)); g.state=r.state; g.status=r.done?"done":"active"; g.moves=(g.moves||0)+1;
    fire("game",JSON.parse(JSON.stringify(g)));
  }
  function mcDemoBot(g,human){   // Mancala practice bot: keeps going while it earns extra turns
    if(g.status!=="active"||g.state.turn===human) return; const bm=g.state.turn, rr=mcApply(g.state,bm,mcBotPit(g.state,bm));
    g.state=rr.state; g.status=rr.done?"done":"active"; g.moves=(g.moves||0)+1; fire("game",JSON.parse(JSON.stringify(g)));
    if(g.status==="active"&&g.state.turn===bm) setTimeout(()=>mcDemoBot(g,human),1600);
  }
  // ---- BS (demo mirror of the server rules) ----
  const BSR=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  function bsDemoDeal(g){
    const deck=[]; for(const r of BSR) for(const su of ["S","H","D","C"]) deck.push(r+su);
    for(let i=deck.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
    const P=g.state.players, hands={}; P.forEach(u=>hands[u]=[]); deck.forEach((c,k)=>hands[P[k%P.length]].push(c));
    demoE8[g.message_id]={hands,pile:[],lastCards:[]};
    Object.assign(g.state,{counts:P.map(u=>hands[u].length),turn:Math.floor(Math.random()*P.length),rank:0,pile:0,last_play:null,finishing:null,reveal:null,winner:null,last:null});
    g.status="active";
  }
  function bsDemoPlay(g,who,cards){
    const st=g.state, d=demoE8[g.message_id], seat=st.players.indexOf(who), hand=d.hands[who];
    if(g.status!=="active") throw new Error("This game isn't being played right now.");
    if(seat!==st.turn) throw new Error("It's not your turn.");
    if(st.finishing) throw new Error("Someone just played their last cards. Call BS or let them win first.");
    if(!(cards.length>=1&&cards.length<=4)) throw new Error("Play 1 to 4 cards.");
    const h=[...hand]; for(const c of cards){ const i=h.indexOf(c); if(i<0) throw new Error("You don't have those cards."); h.splice(i,1); }
    d.hands[who]=h; d.lastCards=[...cards]; d.pile.push(...cards);
    const claimed=st.rank; st.counts[seat]=h.length; st.last_play={by:who,n:cards.length,rank:claimed}; st.rank=(claimed+1)%13; st.pile+=cards.length;
    st.turn=(seat+1)%st.players.length; st.finishing=h.length?null:who; st.last={by:who,played:cards.length,rank:claimed};
    e8DemoAfter(g);
  }
  function bsDemoCall(g,who){
    const st=g.state, d=demoE8[g.message_id], lp=st.last_play;
    if(g.status!=="active") throw new Error("This game isn't being played right now.");
    if(!lp) throw new Error("There's nothing to call right now.");
    if(lp.by===who) throw new Error("You can't call BS on your own play.");
    const liar=d.lastCards.some(c=>c.slice(0,-1)!==BSR[lp.rank]), loser=liar?lp.by:who, ls=st.players.indexOf(loser), took=d.pile.length;
    d.hands[loser].push(...d.pile); st.counts[ls]+=took;
    st.reveal={caller:who,by:lp.by,cards:[...d.lastCards],rank:lp.rank,liar,loser,took}; st.last={by:who,called:true,liar,loser};
    d.pile=[]; d.lastCards=[]; st.pile=0; st.last_play=null;
    const fin=st.finishing; st.finishing=null;
    if(fin&&fin===lp.by&&!liar){ g.status="done"; st.winner=fin; }
    e8DemoAfter(g);
  }
  function bsDemoBots(g){   // after anything happens: maybe a bot calls BS, then the bot whose turn it is plays
    if(g.status!=="active") return; const st=g.state, d=demoE8[g.message_id], lp=st.last_play;
    if(lp){ for(const u of st.players){ if(u===lp.by||u==="me") continue; const have=d.hands[u].filter(c=>c.slice(0,-1)===BSR[lp.rank]).length;
      if(have+lp.n>4||Math.random()<(st.finishing?.6:.12)){ bsDemoCall(g,u); return; } } }
    const who=st.players[st.turn]; if(who==="me") return;
    if(st.finishing){ g.status="done"; st.winner=st.finishing; st.finishing=null; st.last_play=null; st.last={by:who,accepted:true}; e8DemoAfter(g); return; }
    const h=d.hands[who], real=h.filter(c=>c.slice(0,-1)===BSR[st.rank]);
    const cards=real.length&&Math.random()>.2?real.slice(0,1+Math.floor(Math.random()*real.length)):h.slice().sort(()=>Math.random()-.5).slice(0,Math.min(h.length,1+Math.floor(Math.random()*2)));
    bsDemoPlay(g,who,cards);
  }
  function e8DemoAfter(g){
    g.moves++; g.updated_at=iso(); const copy=JSON.parse(JSON.stringify(g)); setTimeout(()=>fire("game",copy),30);
    const who=g.state.players[g.state.turn];
    if(g.type==="bs"){ if(g.status==="active") setTimeout(()=>bsDemoBots(g),1300); return; }
    if(g.type==="mahjong"){ if(g.status==="active") setTimeout(()=>mjDemoBot(g),900); return; }
    if(g.type==="blackout"){ if(g.status==="active") setTimeout(()=>boDemoBot(g),1000); return; }
    if(g.type==="lucky7"){ const f=g.state.freezer!=null?g.state.players[g.state.freezer]:null; if(g.status==="active"&&(f?f!=="me":who!=="me")) setTimeout(()=>l7DemoBot(g),1000); return; }
    if(g.status==="active"&&who!=="me") setTimeout(()=>g.type==="liarsdice"?ldDemoBot(g,who):e8DemoBot(g,who),900);
  }
  function e8DemoBot(g,who){
    if(g.status!=="active"||g.state.players[g.state.turn]!==who) return;
    const hand=demoE8[g.message_id].hands[who], st=g.state;
    const ok=c=>st.mode==="wild"&&st.pending>0?c.slice(0,-1)===st.pendkind:(c.startsWith("8")||c.startsWith("+4")&&st.mode==="wild"||c.slice(-1)===st.suit||c.slice(0,-1)===st.top.slice(0,-1));
    const best=()=>hand.filter(ok).sort((a,b)=>(a.startsWith("8")?1:0)-(b.startsWith("8")?1:0))[0];
    const fav=()=>{ const n={}; hand.forEach(c=>{ if(!c.startsWith("8")) n[c.slice(-1)]=(n[c.slice(-1)]||0)+1; }); return Object.keys(n).sort((a,b)=>n[b]-n[a])[0]||"S"; };
    let c=best();
    if(!c&&!st.drew){ try{ e8DemoMove(g,who,{draw:true}); }catch(e){ e8DemoMove(g,who,{pass:true}); } return; }
    if(!c&&st.mode==="wild"&&st.pending>0){ e8DemoMove(g,who,{draw:true}); return; }
    if(c) e8DemoMove(g,who,{play:c,suit:c.startsWith("8")||c.startsWith("+4")?fav():undefined}); else e8DemoMove(g,who,{pass:true});
  }
  return {
    async session(){ return user; },
    onAuth(cb){ listeners.push(cb); },
    async signUp(username,email){ user={id:"me",email,user_metadata:{username},created_at:new Date().toISOString()}; people.me={id:"me",username,avatar_url:null,invite_token:"demo-me"}; people.rook.last_seen=new Date(Date.now()-7*60000).toISOString(); listeners.forEach(f=>f(user,"SIGNED_IN")); return "in"; },
    async signIn(email){ const n=email.includes("@")?(email.split("@")[0]||"you"):email; user={id:"me",email,user_metadata:{username:n}}; people.me=people.me||{id:"me",username:n,avatar_url:null}; listeners.forEach(f=>f(user,"SIGNED_IN")); },
    async signOut(){ user=null; listeners.forEach(f=>f(null,"SIGNED_OUT")); },
    async resetPassword(){}, async updatePassword(){},
    async accountHint(u){ if(u.toLowerCase()!=="bebop") throw new Error("No NightLane account has that username."); return "b••••••r@g••••.com"; },
    async accountRecover(u,code,pw){ if(!/^nl-?demo/i.test(code.trim())) throw new Error("That username and recovery code don't match."); },
    async createRecoveryCode(){ demoRcDate=new Date().toISOString(); return "NL-DEMO-7K3Q-M9XF"; },
    async myRecoveryCodeDate(){ return demoRcDate; },
    async isAdmin(){ return true; },
    async partner(uid){ return uid==="me"?(window.demoPartner ||= {user_id:"me",stage:1,path:null,shiny:false,nickname:null,power:3,heart:6,spirit:4,shadow:1,total:40}):{user_id:uid,stage:3,path:"shadow",shiny:uid==="vee",nickname:null,power:80,heart:120,spirit:60,shadow:400,total:700}; },
    async shinies(uid){ return uid==="me"?[{kind:"gold"},{kind:"gold"},{kind:"glitch"}]:[{kind:"prism"}]; },
    async setPartnerName(n){ const v=String(n||"").trim().slice(0,16)||null; (window.demoPartner ||= {stage:1}).nickname=v; return v; },
    async deleteAccount(){ user=null; listeners.forEach(f=>f(null,"SIGNED_OUT")); },
    async profiles(ids){ return ids.map(i=>people[i]).filter(Boolean); },
    async upload(_b,_u,blob,_n,onProgress){ for(let k=1;k<=10;k++){ await new Promise(r=>setTimeout(r,onProgress?120:30)); onProgress&&onProgress(k/10); } return URL.createObjectURL(blob); },
    async setAvatar(uid,url){ people[uid].avatar_url=url; },
    async saveStyle(uid,style){ Object.assign(people[uid],style); setTimeout(()=>fire("profile",{...people[uid]}),30); },
    async setStatus(uid,emoji,text,until){ Object.assign(people[uid],{status_emoji:emoji||null,status_text:text||null,status_at:(emoji||text)?new Date().toISOString():null,status_until:(emoji||text)&&until?until:null}); setTimeout(()=>fire("profile",{...people[uid]}),30); },
    async setBackground(room,bg){ const old=rooms[room].background||null; rooms[room].background=bg; setTimeout(()=>fire("roomUpdated",{code:room,name:rooms[room].name||null,background:bg,owner:rooms[room].owner}),30); if(old!==(bg||null)) demoNotice(room,"bg:"+(bg||"stars")); },
    async setRoomIcon(room,url){ rooms[room].icon_url=url; setTimeout(()=>fire("roomUpdated",{code:room,icon_url:url}),30); demoNotice(room,url?"icon:set":"icon:removed"); },
    async addFriendsToRoom(room,ids){ const r=rooms[room]; const who=ids.filter(u=>contacts.has(u)&&!r.members[u]); who.forEach(u=>r.members[u]={read:iso()}); if(who.length){ const m={id:nextId++,room,user_id:"me",kind:"notice",text:"add:"+who.map(u=>u+"|"+(people[u]?.username||u)).join(","),mentions:[],created_at:iso()}; r.msgs.push(m); setTimeout(()=>fire("msg",m),40); } return who.length; },
    async reportMessage(id,reason){ if(!["harassment","spam","inappropriate","other"].includes(reason)) throw new Error("Pick a reason."); demoReports.push({id:demoReports.length+1,message_id:id,reason,created_at:iso()}); },
    async listReports(status){ return demoReports.filter(r=>status==="all"||(r.status||"open")===(status||"open")).map(r=>{ const m=Object.values(rooms).flatMap(x=>x.msgs).find(x=>x.id===r.message_id); return {...r,status:r.status||"open",reporter_name:"you",reported_name:m?(people[m.user_id]?.username||m.user_id):"Vee",message_text:m?.text||"(deleted)",message_exists:!!m,room:m?.room||"5959",room_name:"The Hideout"}; }); },
    async setReportStatus(id,status){ const r=demoReports.find(x=>x.id===id); if(r) r.status=status; },
    async setMessageReportsStatus(mid,status){ demoReports.filter(x=>x.message_id===mid).forEach(r=>r.status=status); },
    async countOpenReports(){ return new Set(demoReports.filter(r=>(r.status||"open")==="open").map(r=>r.message_id)).size; },
    async reportContext(mid){ for(const r of Object.values(rooms)){ const i=r.msgs.findIndex(m=>m.id===mid); if(i>=0) return r.msgs.slice(Math.max(0,i-2),i+3).filter(m=>m.kind!=="notice").map(m=>({id:m.id,created_at:m.created_at,user_name:(people[m.user_id]||{username:m.user_id==="me"?"you":m.user_id}).username,kind:m.kind||"text",text:m.text||"",is_reported:m.id===mid})); } return []; },
    async adminDeleteMessage(mid){ for(const r of Object.values(rooms)) r.msgs=r.msgs.filter(m=>m.id!==mid); demoReports.filter(x=>x.message_id===mid).forEach(r=>r.status="handled"); setTimeout(()=>fire("msgGone",mid),30); },
    async roomIcons(){ return Object.entries(rooms).filter(([,r])=>r.members.me&&r.icon_url).map(([code,r])=>({code,icon_url:r.icon_url})); },
    async saveTz(){},
    async getLook(){ return null; },
    async setLook(){},
    async setNickname(room,uid,nick){ rooms[room].members[uid].nick=nick||null; setTimeout(()=>fire("member",{user_id:uid,last_read_at:rooms[room].members[uid].read,nickname:nick||null}),30); },
    async pins(room){ return Object.values(pins).filter(p=>p.room===room).sort((a,b)=>a.created_at<b.created_at?1:-1); },
    async pin(room,id){ pins[id]={room,message_id:id,pinned_by:"me",created_at:iso()}; setTimeout(()=>fire("pin",pins[id],true),30); },
    async unpin(id){ const p=pins[id]; delete pins[id]; setTimeout(()=>fire("pin",{message_id:id},false),30); },
    async games(ids){ return ids.map(i=>games[i]).filter(Boolean).map(g=>JSON.parse(JSON.stringify(g))); },
    async createGame(room,type){
      if(type==="eights"||type==="liarsdice"||type==="bs"||type==="lucky7"||type==="mahjong"||type==="blackout"){
        const r=rooms[room], m={id:nextId++,room,user_id:"me",kind:"game",text:type==="eights"?"Crazy Eights":type==="bs"?"BS":type==="lucky7"?"Lucky 7":type==="mahjong"?"Mahjong":type==="blackout"?"Blackout":"Liar's Dice",created_at:iso()}; r.msgs.push(m);
        games[m.id]={message_id:m.id,room,type,player_x:"me",player_o:null,status:"waiting",state:{players:["me"],host:"me"},moves:0,updated_at:iso()};
        ["vee","rook"].forEach((b,i)=>setTimeout(()=>{ const g=games[m.id]; if(g.status!=="waiting"||g.state.players.includes(b)) return; g.state.players.push(b); g.moves++; fire("game",JSON.parse(JSON.stringify(g))); },700+i*700));
        return m;
      }
      const r=rooms[room], m={id:nextId++,room,user_id:"me",kind:"game",text:type==="kingscourt"?"King's Court":type==="mancala"?"Mancala":type==="go"?"Go":"Tic-tac-toe",created_at:iso()}; r.msgs.push(m);
      const other=r.is_dm?Object.keys(r.members).find(u=>u!=="me"):null;
      const st0 = type==="kingscourt" ? {board:kcInitialBoard(),turn:"x",winner:null,line:[],first_x:false,first_o:false,mv_x:0,mv_o:0,last:[]} : type==="mancala" ? {board:[...MC_START],turn:"x",winner:null,line:[],last:null} : type==="go" ? goStart() : {board:Array(9).fill(""),turn:"x",winner:null,line:[]};
      games[m.id]={message_id:m.id,room,type,player_x:"me",player_o:other,status:other?"active":"waiting",state:st0,moves:0};
      if(!other) setTimeout(()=>{ const g=games[m.id]; if(g.status!=="waiting") return; g.player_o=Object.keys(r.members).find(u=>u!=="me")||"rook"; g.status="active"; fire("game",JSON.parse(JSON.stringify(g))); if(type==="kingscourt"&&g.player_x!=="me") setTimeout(()=>kcBotTurn(m.id),900); },1500);
      return m;
    },
    async joinGame(id){ const g=games[id]; if(g.type==="eights"||g.type==="liarsdice"||g.type==="bs"||g.type==="lucky7"||g.type==="mahjong"||g.type==="blackout"){ if(g.status!=="waiting") throw new Error("This game already started."); if(!g.state.players.includes("me")) g.state.players.push("me"); g.moves++; setTimeout(()=>fire("game",JSON.parse(JSON.stringify(g))),30); return; } g.player_o="me"; g.status="active"; setTimeout(()=>fire("game",JSON.parse(JSON.stringify(g))),30); setTimeout(()=>demoBot(id),900); },
    async playTicTacToe(id,cell){
      const g=games[id], mark=g.player_x==="me"?"x":"o";
      if(g.status!=="active"||g.state.turn!==mark||g.state.board[cell]) throw new Error("Not your turn.");
      applyTTT(g,cell,mark); setTimeout(()=>fire("game",JSON.parse(JSON.stringify(g))),30);
      if(g.status==="active") setTimeout(()=>demoBot(id),900);
    },
    async playMancala(id,pit){
      const g=games[id], mark=g.player_x==="me"?"x":"o";
      if(g.status!=="active"||g.state.turn!==mark) throw new Error("It's not your turn.");
      const r=mcApply(g.state,mark,pit); g.state=r.state; g.status=r.done?"done":"active"; g.moves=(g.moves||0)+1;
      setTimeout(()=>fire("game",JSON.parse(JSON.stringify(g))),30);
      setTimeout(()=>mcDemoBot(g,mark),1700);
    },
    async playGo(id,move){
      const g=games[id], mark=g.player_x==="me"?"x":"o";
      if(g.status!=="active") throw new Error("This game isn't being played right now.");
      const r=goApply(g.state,mark,move); g.state=r.state; g.status=r.done?"done":"active"; g.moves=(g.moves||0)+1;
      setTimeout(()=>fire("game",JSON.parse(JSON.stringify(g))),30);
      if(!r.done) setTimeout(()=>goDemoBot(g),1100);
    },
    async playKingsCourt(id,path){
      const g=games[id], mark=g.player_x==="me"?"x":"o";
      if(g.status!=="active"||g.state.turn!==mark) throw new Error("Not your turn.");
      const applied=kcApplyPath(g.state,mark,path,g.moves); g.moves=(g.moves||0)+1;
      g.state={board:applied.board,turn:applied.turn,winner:applied.winner,line:[],first_x:applied.first_x,first_o:applied.first_o,mv_x:applied.mv_x,mv_o:applied.mv_o,last:applied.last};
      g.status=applied.done?"done":"active";
      setTimeout(()=>fire("game",JSON.parse(JSON.stringify(g))),30);
    },
    async eightsHand(id){ return [...(demoE8[id]?.hands?.me||[])]; },
    async bsStart(id){ const g=games[id]; if(g.state.host!=="me") throw new Error("Only the person who started the game can deal."); bsDemoDeal(g); e8DemoAfter(g); },
    async bsPlay(id,cards){ bsDemoPlay(games[id],"me",cards); },
    async bsCall(id){ bsDemoCall(games[id],"me"); },
    async bsAccept(id){ const g=games[id], st=g.state; if(!st.finishing) throw new Error("Nobody is about to win yet."); g.status="done"; st.winner=st.finishing; st.finishing=null; st.last_play=null; e8DemoAfter(g); },
    async bsSkip(id){ const g=games[id]; if(Date.now()-new Date(g.updated_at).getTime()<120000) throw new Error("Give them a couple of minutes first."); const st=g.state; st.last={by:"me",skipped:st.players[st.turn]}; st.turn=(st.turn+1)%st.players.length; e8DemoAfter(g); },
    async diceStart(id){ const g=games[id]; if(g.state.host!=="me") throw new Error("Only the person who started the game can roll."); ldDemoBegin(g); e8DemoAfter(g); },
    async diceBid(id,qty,face){ ldDemoMove(games[id],"me",{bid:[qty,face]}); },
    async diceCall(id){ ldDemoMove(games[id],"me",{call:true}); },
    async diceSkip(id){ const g=games[id]; if(Date.now()-new Date(g.updated_at).getTime()<120000) throw new Error("Give them a couple of minutes first."); ldDemoMove(g,g.state.players[g.state.turn],{skip:true},"me"); },
    async eightsStart(id,mode){ const g=games[id]; if(g.state.host!=="me") throw new Error("Only the person who started the game can deal."); e8DemoDeal(g,mode); e8DemoAfter(g); },
    async l7Start(id){ const g=games[id]; if(g.state.host!=="me") throw new Error("Only the person who started the game can deal."); l7DemoBegin(g); e8DemoAfter(g); },
    async l7Hit(id){ return l7DemoMove(games[id],"me",{hit:true}); },
    async l7Stay(id){ l7DemoMove(games[id],"me",{stay:true}); },
    async l7Freeze(id,seat){ l7DemoMove(games[id],"me",{freeze:seat}); },
    async l7Skip(id){ const g=games[id]; if(Date.now()-new Date(g.updated_at).getTime()<120000) throw new Error("Give them a couple of minutes first."); },
    async mjStart(id){ const g=games[id]; if(g.state.host!=="me") throw new Error("Only the person who started the game can deal."); mjDemoBegin(g); e8DemoAfter(g); },
    async boStart(id){ const g=games[id]; if(g.state.host!=="me") throw new Error("Only the person who started the game can deal."); boDemoBegin(g); e8DemoAfter(g); },
    async boPlace(id,t){ boDemoMove(games[id],"me",{place:t}); },
    async boCall(id,n){ boDemoMove(games[id],"me",{call:n}); },
    async boPass(id){ boDemoMove(games[id],"me",{pass:true}); },
    async boFlip(id,seat){ boDemoMove(games[id],"me",{flip:seat}); },
    async boSkip(id){ const g=games[id]; if(Date.now()-new Date(g.updated_at).getTime()<120000) throw new Error("Give them a couple of minutes first."); boDemoBot(g,true); },
    async mjDraw(id){ return mjDemoMove(games[id],"me",{draw:true}); },
    async mjDiscard(id,t){ mjDemoMove(games[id],"me",{discard:t}); },
    async mjWin(id){ mjDemoMove(games[id],"me",{win:true}); },
    async mjClaim(id){ mjDemoMove(games[id],"me",{claim:true}); },
    async mjSkip(id){ const g=games[id]; if(Date.now()-new Date(g.updated_at).getTime()<120000) throw new Error("Give them a couple of minutes first."); },
    async eightsLastCard(id){ const g=games[id], st=g.state, seat=st.players.indexOf("me"); if(st.counts[seat]>2) throw new Error("You can only call it when you're about to have one card."); st.called={...(st.called||{}),[seat]:true}; st.last={by:"me",lastcard:true}; e8DemoAfter(g); },
    async eightsCatch(id,seat){ const g=games[id], st=g.state, d=demoE8[id]; if(st.counts[seat]!==1||st.called?.[seat]) throw new Error("Too late, they're safe."); const u=st.players[seat]; e8DemoTake(d,u,2); st.counts[seat]=d.hands[u].length; st.deck=d.deck.length; st.last={by:"me",caught:u}; e8DemoAfter(g); },
    async eightsPlay(id,card,suit){ e8DemoMove(games[id],"me",{play:card,suit}); },
    async eightsDraw(id){ return e8DemoMove(games[id],"me",{draw:true}); },
    async eightsPass(id){ e8DemoMove(games[id],"me",{pass:true}); },
    async eightsSkip(id){ const g=games[id]; if(Date.now()-new Date(g.updated_at).getTime()<120000) throw new Error("Give them a couple of minutes first."); const n=g.state.players.length; g.state.last={by:"me",skipped:g.state.players[g.state.turn]}; g.state.turn=(g.state.turn+1)%n; g.state.drew=false; e8DemoAfter(g); },
    async rematch(id){
      if(games[id].type==="eights"||games[id].type==="liarsdice"||games[id].type==="bs"||games[id].type==="lucky7"||games[id].type==="mahjong"||games[id].type==="blackout"){ const old=games[id], r=rooms[old.room]; const m={id:nextId++,room:old.room,user_id:"me",kind:"game",text:old.type==="eights"?"Crazy Eights":old.type==="bs"?"BS":old.type==="lucky7"?"Lucky 7":old.type==="mahjong"?"Mahjong":old.type==="blackout"?"Blackout":"Liar's Dice",created_at:iso()}; r.msgs.push(m);
        games[m.id]={message_id:m.id,room:old.room,type:old.type,player_x:"me",player_o:null,status:"waiting",state:{players:[...old.state.players],host:"me"},moves:0,updated_at:iso()};
        if(old.type==="eights") e8DemoDeal(games[m.id]); else if(old.type==="bs") bsDemoDeal(games[m.id]); else if(old.type==="lucky7") l7DemoBegin(games[m.id]); else if(old.type==="mahjong") mjDemoBegin(games[m.id]); else if(old.type==="blackout") boDemoBegin(games[m.id]); else ldDemoBegin(games[m.id]); e8DemoAfter(games[m.id]); return m; }
      const old=games[id], r=rooms[old.room], label=old.type==="kingscourt"?"King's Court":old.type==="mancala"?"Mancala":old.type==="go"?"Go":"Tic-tac-toe";
      const m={id:nextId++,room:old.room,user_id:"me",kind:"game",text:label,created_at:iso()}; r.msgs.push(m);
      const st0 = old.type==="kingscourt" ? {board:kcInitialBoard(),turn:"x",winner:null,line:[],first_x:false,first_o:false,mv_x:0,mv_o:0,last:[]} : old.type==="mancala" ? {board:[...MC_START],turn:"x",winner:null,line:[],last:null} : old.type==="go" ? goStart() : {board:Array(9).fill(""),turn:"x",winner:null,line:[]};
      games[m.id]={message_id:m.id,room:old.room,type:old.type,player_x:old.player_o,player_o:old.player_x,status:"active",state:st0,moves:0};
      if(games[m.id].player_x!=="me") setTimeout(()=>old.type==="kingscourt"?kcBotTurn(m.id):old.type==="mancala"?mcDemoBot(games[m.id],"o"):old.type==="go"?goDemoBot(games[m.id]):demoBot(m.id),900);
      return m;
    },
    async polls(ids){ return {polls:ids.map(i=>polls[i]).filter(Boolean),votes:votes.filter(v=>ids.includes(v.message_id))}; },
    async createPoll(room,question,options,multi){ const m={id:nextId++,room,user_id:"me",kind:"poll",text:question,created_at:iso()}; polls[m.id]={message_id:m.id,options,multi}; rooms[room].msgs.push(m);
      setTimeout(()=>{ const v={message_id:m.id,user_id:"rook",option_index:0}; votes.push(v); fire("vote",v,true); },1200); return m; },
    async vote(id,idx){
      const p=polls[id], mine=votes.filter(v=>v.message_id===id&&v.user_id==="me");
      const had=mine.find(v=>v.option_index===idx);
      const remove=v=>{ votes.splice(votes.indexOf(v),1); setTimeout(()=>fire("vote",v,false),20); };
      if(had) remove(had); else { if(!p.multi) mine.forEach(remove); const v={message_id:id,user_id:"me",option_index:idx}; votes.push(v); setTimeout(()=>fire("vote",v,true),30); }
    },
    async contacts(){ return [...contacts]; },
    async search(q,roomCode){ const all=Object.entries(rooms).flatMap(([code,r])=>r.msgs.map(m=>({...m,room:code,room_name:r.name||null}))); return all.filter(m=>(!roomCode||m.room===roomCode)&&(m.text||"").toLowerCase().includes(q.toLowerCase())).slice(-40).reverse(); },
    async touchSeen(){}, async acceptFriendInvite(token){ if(token!=="demo-nix") throw new Error("invalid"); contacts.add("nix"); return {username:"Nix"}; },
    async linkPreview(url){ return {title:"Example Domain",description:"This domain is for use in illustrative examples in documents.",site:"example.com"}; },
    async addedMe(){ return ["rook","vee"]; },
    async myInviteToken(){ return this._inv||"demo-me-0000000000000000000000"; },
    async resetInviteToken(){ this._inv="demo-me-"+Math.random().toString(36).slice(2,14); return this._inv; },
    async findUser(n){ return Object.values(people).find(p=>p.username.toLowerCase()===n.toLowerCase())||null; },
    async addContact(uid){ contacts.add(uid); },
    async removeContact(uid){ contacts.delete(uid); },
    async mutualFriends(uid){ const theirs={vee:["rook","nix"],rook:["vee"],nix:["vee"]}[uid]||[]; return [...contacts].filter(c=>theirs.includes(c)&&c!==uid); },
    async relMine(){ const acc=relLinks.find(l=>l.ok&&(l.from==="me"||l.to==="me")); return {partner:acc?(acc.from==="me"?acc.to:acc.from):null, outgoing:relLinks.find(l=>!l.ok&&l.from==="me")?.to||null, incoming:relLinks.filter(l=>!l.ok&&l.to==="me").map(l=>l.from)}; },
    async relPartners(ids){ return ids.flatMap(u=>{ const l=relLinks.find(l=>l.ok&&(l.from===u||l.to===u)); return l?[{user_id:u,partner:l.from===u?l.to:l.from}]:[]; }); },
    async relRequest(uid){ if(!(contacts.has(uid)&&(await this.addedMe()).includes(uid))) throw new Error("You can only tag a friend who added you back");
      if(relLinks.some(l=>l.ok&&(l.from==="me"||l.to==="me"))) throw new Error("Remove your current partner first");
      for(let i=relLinks.length-1;i>=0;i--) if(!relLinks[i].ok&&relLinks[i].from==="me") relLinks.splice(i,1);
      const l={from:"me",to:uid,ok:false}; relLinks.push(l); setTimeout(()=>{ if(relLinks.includes(l)) l.ok=true; },2500); return "pending"; },   // demo friends always say yes
    async relRespond(uid,yes){ const l=relLinks.find(l=>!l.ok&&l.from===uid&&l.to==="me"); if(!l) throw new Error("That request is gone"); if(yes) l.ok=true; else relLinks.splice(relLinks.indexOf(l),1); return yes?"accepted":"declined"; },
    async relClear(){ for(let i=relLinks.length-1;i>=0;i--){ const l=relLinks[i]; if(l.from==="me"||(l.to==="me"&&l.ok)) relLinks.splice(i,1); } },
    async startDm(uid){
      const code="dm-"+[uid,"me"].sort().join("-");
      if(!rooms[code]){ if(uid==="nix") throw new Error("not_connected");
        rooms[code]={is_dm:true,owner:"me",token:"x",members:{me:{read:iso()},[uid]:{read:iso()}},msgs:[]}; }
      rooms[code].members.me ||= {read:iso()};
      setTimeout(()=>{ const r=rooms[code]; if(r.msgs.length) return; const m={id:nextId++,room:code,user_id:uid,kind:"text",text:"hey! private chat unlocked 🔒",mentions:[],created_at:iso()}; r.msgs.push(m); fire("msg",m); ALL&&ALL(m); },2500);
      return code;
    },
    async setNotify(room,mode){ rooms[room].members.me.notify=mode; },
    async setViewing(){}, async setHere(){},
    async ai(body){
      await new Promise(r=>setTimeout(r,500));
      if(body.action==="summarize") return {headline:"Demo summary: the crew is planning an arcade night.",points:["Rook asked who's up for the arcade later; Vee and you are in.","A poll is running: Arcade vs Movies vs Both.","Someone is bringing snacks (Vee volunteered)."],todo:["Vote in the poll","Reply about tonight's time"]};
      const m=Object.values(rooms).flatMap(r=>r.msgs).find(x=>x.id===body.message_id)||(typeof byId!=="undefined"&&byId.get(body.message_id));
      const es={"Here. Bring snacks.":"Aquí. Trae bocadillos.","Morning crew.":"Buenos días, equipo."};
      if(m&&/[áéíóñ¿¡]/.test(m.text||"")) return {text:"(translated) "+m.text,from:"Spanish"};
      if(m&&es[m.text]&&body.lang==="es") return {text:es[m.text],from:"English"};
      return {same:true};
    },
    async tasks(room){ return (rooms[room].tasks||[]).slice(); },
    async addTask(room,text){ const t={id:nextId++,room,text,done:false,created_by:"me",created_at:iso()}; (rooms[room].tasks ||= []).push(t); return {...t}; },
    async setTaskDone(id,done){ Object.values(rooms).forEach(r=>(r.tasks||[]).forEach(t=>{ if(t.id===id) t.done=done; })); },
    async deleteTask(id){ Object.values(rooms).forEach(r=>{ r.tasks=(r.tasks||[]).filter(t=>t.id!==id); }); },
    async setDisappear(room,sec){ rooms[room].disappear=sec; setTimeout(()=>fire("roomUpdated",{code:room,name:rooms[room].name||null,disappear_seconds:sec,owner:rooms[room].owner}),30); },
    _injectMissed(room,text,who="vee"){ const m={id:nextId++,room,user_id:who,kind:"text",text,mentions:[],created_at:iso()}; seed(room).msgs.push(m); return m; },
    _setGameState(id,state,status){ if(games[id]){ games[id].state=state; if(status) games[id].status=status; } },
    _deleteSilently(room,id){ rooms[room].msgs=rooms[room].msgs.filter(m=>m.id!==id); },
    _status(s){ H&&H.status(s); },
    _friendAdd(uid){ FRIEND&&FRIEND(uid); },
    subscribeAll(onMsg,onFriend){ ALL=onMsg; FRIEND=onFriend; const t=setTimeout(()=>{ const r=seed("5959"); const m={id:nextId++,room:"5959",user_id:"rook",kind:"text",text:"@"+(people.me?.username||"you")+" you coming tonight?",mentions:["me"],created_at:iso()}; r.msgs.push(m); onMsg(m); },4000); return ()=>{ ALL=null; clearTimeout(t); }; },
    async myRooms(){ seed("5959"); if(rooms["5959"].name===undefined) rooms["5959"].name="The Hideout"; return Object.entries(rooms).filter(([,r])=>r.members.me).map(([code,r])=>{ const m=r.msgs[r.msgs.length-1]; const other=r.is_dm?Object.keys(r.members).find(u=>u!=="me"):null; return {code,name:r.name||null,is_dm:!!r.is_dm,dm_user:other,dm_name:other?people[other].username:null,dm_avatar:null,notify:r.members.me.notify||"all",is_owner:r.owner==="me",last_text:m?.text,last_image:!!m?.image_url,last_kind:m?.kind||"text",last_at:m?.created_at||iso(),last_sender:m?people[m.user_id]?.username:null,unread:r.msgs.filter(x=>x.user_id!=="me"&&x.created_at>(r.members.me?.read||"")).length}; }); },
    async joinRoom(room){ const existed=!!rooms[room]; seed(room); if(!existed){ rooms[room].msgs=[]; rooms[room].members={me:{read:iso()}}; return "created"; } rooms[room].members.me ||= {read:iso()}; return "member"; },
    async roomInfo(room){ const r=seed(room); if(room==="5959"&&r.name===undefined) r.name="The Hideout"; return {code:room,name:r.name||null,background:r.background||null,owner:r.owner,invite_token:r.token,is_dm:!!r.is_dm,lane:r.lane||null,lane_label:r.lane_label||null,disappear_seconds:r.disappear||0}; },
    async myLanes(){ return Object.values(demoLanes).filter(l=>l.members.me).map(l=>({id:l.id,name:l.name,icon:l.icon,owner:l.owner,my_role:l.members.me,members:Object.keys(l.members).length,icon_url:l.icon_url||null,banner:l.banner||null})); },
    async laneSetArt(lane,iconUrl,banner){ Object.assign(demoLanes[lane],{icon_url:iconUrl,banner}); },
    async laneSetChatIcon(code,url){ rooms[code].icon_url=url; },
    async laneRooms(ids){ return Object.entries(rooms).filter(([,r])=>r.lane&&ids.includes(r.lane)&&r.members.me).map(([code,r])=>({code,name:r.name,lane:r.lane,lane_label:r.lane_label,lane_pos:r.lane_pos||0,lane_kind:r.lane_kind||"chat"})); },
    async laneMembers(lane){ return Object.entries(demoLanes[lane].members).map(([user_id,role])=>({user_id,role})); },
    async laneCreate(name,icon,chat,label){ const id="lane"+(++demoLaneN), code="ln-demo"+demoLaneN+"a"; demoLanes[id]={id,name,icon,owner:"me",members:{me:"owner"}};
      rooms[code]={owner:"me",token:"x",members:{me:{read:iso()}},msgs:[],name:chat||"General",lane:id,lane_label:label||"💬",lane_pos:0}; return {lane:id,room:code}; },
    async laneAddChat(lane,name,label,kind){ const L=demoLanes[lane]; if(!L||L.members.me==="member") throw new Error("Only the owner and helpers can add side chats.");
      const code="ln-demo"+(++demoLaneN)+"c", pos=Object.values(rooms).filter(r=>r.lane===lane).length; const mem={}; Object.keys(L.members).forEach(u=>mem[u]={read:iso()});
      rooms[code]={owner:L.owner,token:"x",members:mem,msgs:[],name,lane,lane_label:label||"💬",lane_pos:pos,lane_kind:kind==="voice"?"voice":"chat"}; return code; },
    async laneEditChat(code,name,label){ const r=rooms[code]; r.name=name; if(label) r.lane_label=label; },
    async laneRemoveChat(code){ const r=rooms[code]; if(Object.values(rooms).filter(x=>x.lane===r.lane).length<=1) throw new Error("A Lane needs at least one side chat."); r.members={}; r.lane=null; },
    async laneRename(lane,name,icon){ Object.assign(demoLanes[lane],{name,icon:icon||demoLanes[lane].icon}); },
    async laneAddFriends(lane,ids){ const L=demoLanes[lane]; const who=ids.filter(u=>contacts.has(u)&&!L.members[u]); who.forEach(u=>L.members[u]="member");
      Object.values(rooms).filter(r=>r.lane===lane).forEach(r=>who.forEach(u=>r.members[u] ||= {read:iso()})); return who.length; },
    async laneSetRole(lane,uid,role){ if(demoLanes[lane].members[uid]&&demoLanes[lane].members[uid]!=="owner") demoLanes[lane].members[uid]=role; },
    async laneRemoveMember(lane,uid){ delete demoLanes[lane].members[uid]; Object.values(rooms).filter(r=>r.lane===lane).forEach(r=>delete r.members[uid]); },
    async laneLeave(lane){ const L=demoLanes[lane]; const was=L.members.me; delete L.members.me; Object.values(rooms).filter(r=>r.lane===lane).forEach(r=>delete r.members.me);
      if(was==="owner"){ const heir=Object.keys(L.members)[0]; if(heir){ L.members[heir]="owner"; L.owner=heir; } else delete demoLanes[lane]; } },
    async laneAttach(lane,code,label){ const r=rooms[code], L=demoLanes[lane]; if(r.owner!=="me") throw new Error("Only the room's owner can move it into a Lane."); if(r.lane) throw new Error("That room is already in a Lane.");
      r.lane=lane; r.lane_label=label||"💬"; r.lane_pos=Object.values(rooms).filter(x=>x.lane===lane).length; r.name=r.name||code;
      Object.keys(r.members).forEach(u=>{ if(!L.members[u]) L.members[u]="member"; }); Object.values(rooms).filter(x=>x.lane===lane).forEach(x=>Object.keys(L.members).forEach(u=>x.members[u] ||= {read:iso()})); },
    async renameRoom(room,name){ rooms[room].name=name||null; setTimeout(()=>fire("roomUpdated",{code:room,name:name||null,owner:rooms[room].owner}),40); },
    async rotateInvite(room){ return rooms[room].token="demo"+Math.random().toString(36).slice(2,8); },
    async removeMember(room,uid){ delete rooms[room].members[uid]; setTimeout(()=>fire("memberGone",uid),50); },
    async leaveRoom(room){ delete rooms[room].members.me; },
    async members(room){ return Object.entries(seed(room).members).map(([user_id,v])=>({user_id,last_read_at:v.read,last_joined:v.read,nickname:v.nick||null,notify:v.notify||"all"})); },
    async markRead(room){ if(rooms[room]?.members.me) rooms[room].members.me.read=iso(); },
    async loadLatest(room){ return seed(room).msgs.slice(-PAGE); },
    async loadBefore(){ return []; },
    async loadAfter(room,iso){ return (rooms[room]?.msgs||[]).filter(m=>m.created_at>=iso).sort((a,b)=>a.created_at<b.created_at?-1:1).slice(0,PAGE); },
    async fetchMessage(id){ return Object.values(rooms).flatMap(r=>r.msgs).find(m=>m.id===id)||null; },
    async send(room,f){
      const m={id:nextId++,room,user_id:"me",kind:f.kind||"text",text:f.text||null,image_url:f.image_url||null,image_urls:f.image_urls||null,media_url:f.media_url||null,media_type:f.media_type||null,media_duration:f.media_duration||null,sticker:f.sticker||null,reply_to:f.reply_to||null,mentions:f.mentions||[],card:f.card||null,spoiler:!!f.spoiler,created_at:iso(),expires_at:rooms[room].disappear?new Date(Date.now()+rooms[room].disappear*1000).toISOString():null}; rooms[room].msgs.push(m);
      const others=Object.keys(rooms[room].members).filter(u=>u!=="me"); if(!others.length) return m;
      const who=others[Math.floor(Math.random()*others.length)];
      setTimeout(()=>{ rooms[room].members[who].read=iso(); fire("member",{user_id:who,last_read_at:iso()}); },700);
      setTimeout(()=>fire("typing",{uid:who,name:people[who].username,typing:true}),1100);
      setTimeout(()=>fire("reaction",{message_id:m.id,user_id:who,emoji:"🔥"},true),1500);
      setTimeout(()=>{ const r={id:nextId++,room,user_id:who,text:lines[Math.floor(Math.random()*lines.length)],reply_to:null,created_at:iso()}; rooms[room].msgs.push(r); fire("msg",r); },3000);
      return m; },
    async countMessages(room){ return (rooms[room]?.msgs||[]).length; },
    async callLog(id,text){ for(const r of Object.values(rooms)){ const m=r.msgs.find(x=>x.id===id); if(m){ m.text=text; setTimeout(()=>fire("msgEdited",{...m}),30); return; } } },
    async editMessage(id,text){ for(const r of Object.values(rooms)){ const m=r.msgs.find(x=>x.id===id); if(m){ m.text=text; m.edited_at=iso(); setTimeout(()=>fire("msgEdited",{...m}),30); return {...m}; } } throw new Error("Message not found"); },
    async deleteMessage(id){ for(const r of Object.values(rooms)) r.msgs=r.msgs.filter(m=>m.id!==id); setTimeout(()=>fire("msgGone",id),50); },
    async reactions(ids){ return reacts.filter(r=>ids.includes(r.message_id)); },
    async react(message_id,_room,emoji){ const r={message_id,user_id:"me",emoji}; reacts.push(r); setTimeout(()=>fire("reaction",r,true),30); },
    async unreact(message_id,uid,emoji){ const i=reacts.findIndex(r=>r.message_id===message_id&&r.user_id===uid&&r.emoji===emoji); if(i>=0) reacts.splice(i,1); setTimeout(()=>fire("reaction",{message_id,user_id:uid,emoji},false),30); },
    async blocks(){ return [...blocked]; }, async block(uid){ blocked.add(uid); }, async unblock(uid){ blocked.delete(uid); },
    async savePush(){}, async deletePush(){}, async testPush(){ return {sent:1,devices:1,demo:true}; },
    owlSchedule(){}, async owlCancel(){},
    async backlog(uid){ return (demoBl[uid]||[]).filter(x=>uid==="me"||!x.private).map(x=>({...x})); },   // like the database: private items only for their owner
    async addBacklogMany(arr){ const out=[]; for(const it of arr) out.push(await this.addBacklog(it)); return out; },
    async addBacklog(it){ const list=(demoBl.me ||= []); if(it.source_id&&list.some(x=>x.source_id===it.source_id)) throw new Error('duplicate key value violates unique constraint "backlog_items_no_dupes"');
      const row={id:demoBlId++,user_id:"me",status:"planned",progress:0,total:null,rating:0,platform:null,image:null,source_id:null,created_at:iso(),...it}; list.unshift(row); return {...row}; },
    async updateBacklog(id,patch){ const r=(demoBl.me||[]).find(x=>x.id===id); if(r) Object.assign(r,patch); },
    async deleteBacklog(id){ demoBl.me=(demoBl.me||[]).filter(x=>x.id!==id); },
    async mySignal(){ return demoSignal.me?{...demoSignal.me}:null; },
    async signalOf(uid){ return uid==="me"?(demoSignal.me?.top||null):({rook:"static",vee:"glow",kai:"beacon"}[uid]||null); },
    async saveSignal(scores,top){ demoSignal.me={user_id:"me",scores,top,taken_at:iso()}; },
    async afterHours(){ return demoSignal.ah||""; },
    async saveAfterHours(answer){ demoSignal.ah=answer||""; },
    async saveProgress(d){ return {xp:d.xp,xp_log:d.log,secrets:d.secrets,unlocks:d.unlocks}; }, saveProgressOnExit(){},
    async habits(){ return demoHabits.filter(h=>!h.archived); },
    async habitStats(){ return demoHabits.map(h=>({id:h.id,stat:h.stat})); },
    async createHabit(label,stat,reminder_time){ const h={id:demoHabitId++,user_id:"me",label,stat,reminder_time:reminder_time||null,archived:false,created_at:iso()}; demoHabits.push(h); return h; },
    async archiveHabit(id){ const h=demoHabits.find(h=>h.id===id); if(h) h.archived=true; },
    async habitLogs(since){ return demoHabitLogs.filter(l=>l.done_on>=since); },
    async toggleHabit(id){ const today=iso().slice(0,10); const i=demoHabitLogs.findIndex(l=>l.habit_id===id&&l.done_on===today);
      if(i>=0){ demoHabitLogs.splice(i,1); return false; } demoHabitLogs.push({habit_id:id,user_id:"me",done_on:today}); return true; },
          async bumpHabit(id,date,delta){ const log=demoHabitLogs.find(l=>l.habit_id===id&&l.done_on===date); if(!log){ if(delta<0) return 0; demoHabitLogs.push({habit_id:id,user_id:"me",done_on:date,count:1}); return 1; } log.count=(log.count||1)+delta; if(log.count<=0){ demoHabitLogs.splice(demoHabitLogs.indexOf(log),1); return 0; } return log.count; },
    async socialLinks(){ return [...demoSocialLinks.values()]; },
    async dmStyle(room){ return (window.__demoDmStyles||{})[room]||null; },
    async setDmStyle(room,bg,bubbles){ const d=window.__demoDmStyles||(window.__demoDmStyles={}); d[room]={room,bg:bg||null,bubbles:bubbles||null}; return d[room]; },
    async bumpSocialLink(otherId,amount){
      const a="me"<otherId?"me":otherId, b="me"<otherId?otherId:"me", key=a+"|"+b;
      let row=demoSocialLinks.get(key);
      const arcanas=["Fool","Magician","Priestess","Empress","Emperor","Hierophant","Lovers","Chariot","Strength","Hermit","Fortune","Justice","Hanged Man","Death","Temperance","Devil","Tower","Star","Moon","Sun","Judgement","World"];
      if(!row){ let h=0; for(const c of key) h=(h*31+c.charCodeAt(0))>>>0; row={user_a:a,user_b:b,xp:0,today_xp:0,today_date:null,arcana:arcanas[h%arcanas.length]}; demoSocialLinks.set(key,row); }
      const today=localDay(new Date()); if(row.today_date!==today) row.today_xp=0;
      const grant=Math.max(0,Math.min(amount||3,24-row.today_xp)); row.xp+=grant; row.today_xp+=grant; row.today_date=today;
      return {...row};
    },
    async saveArcana(arcana){ people.me.arcana=arcana; },
    _setLinkXp(otherId,xp){ const a="me"<otherId?"me":otherId, b="me"<otherId?otherId:"me", key=a+"|"+b; const row=demoSocialLinks.get(key); if(row){ row.xp=xp; row.today_xp=0; row.today_date=null; } },
    _seedHabitLogs(n){ demoHabitLogs.length=0; for(let i=0;i<n;i++) demoHabitLogs.push({habit_id:1,user_id:"me",done_on:new Date(Date.now()-i*864e5).toISOString().slice(0,10)}); },
    subscribe(_room,h){ H=h; h.status("Demo mode"); const stop=()=>{H=null}; stop.typing=()=>{}; stop.hifive=()=>{}; stop.dmstyle=()=>{}; return stop; }
  };
})();
// The server library comes from a CDN. If it couldn't load (no signal on a cold start), use a stand-in that
// just reports "offline" — NEVER demo mode, which would show a real user fake chats.
const LIB_MISSING=!sb&&!!(SUPABASE_URL&&SUPABASE_ANON_KEY);
const offlineApi=new Proxy({},{ get:(t,k)=>{
  if(k==="onAuth"||String(k).startsWith("subscribe")) return ()=>()=>{};
  if(k==="session") return async()=>null;
  return ()=>{ const p=Promise.reject(new TypeError("Failed to fetch")); p.catch(()=>{}); return p; };
}});
let demoRcDate=null;
// calls the "account" server function (username log-in, recovery codes, email hint) and turns its errors into plain messages
async function accountCall(body){
  const r=await fetch(SUPABASE_URL+"/functions/v1/account",{method:"POST",headers:{"Content-Type":"application/json",apikey:SUPABASE_ANON_KEY,Authorization:"Bearer "+SUPABASE_ANON_KEY},body:JSON.stringify(body)});
  let data={}; try{ data=await r.json(); }catch(e){}
  if(r.status===404&&!data.error) throw new Error("Username log-in isn't set up yet. Use your email for now.");
  if(!r.ok) throw new Error(data.error||"Something went wrong. Try again.");
  return data;
}
if(!sb){   // demo mode: mimic the server's auto-pin for new games
  for(const k of ["createGame","rematch"]){ const orig=demo[k];
    demo[k]=async(...a)=>{ const m=await orig(...a); setTimeout(()=>{ if(room===m.room&&!pins.has(m.id)){ pins.set(m.id,{room:m.room,message_id:m.id,pinned_by:null,auto:true,created_at:new Date().toISOString()}); paintPinBar(); } },60); return m; }; }
}
const api = sb ? live : (LIB_MISSING ? offlineApi : demo);
$("modeNote").textContent = sb ? "" : LIB_MISSING ? "Can't reach NightLane right now. Check your connection; it'll load as soon as you're back online." : "Demo mode: no server connected, so accounts and friends are simulated.";

/* ================= STATE ================= */
let myLanesList=[], laneByRoom=new Map(), laneSheetId=null;   // 🛣️ Lanes (see the LANES section)
let user=null, meProfile=null, room="", roomName=null, roomOwner=null, unsub=null, pendingFile=null, replyTo=null, hasMore=false, menuMsg=null;
const cache=new Map();        // user id -> profile
const msgs=[];                // current room, oldest first
const byId=new Map();         // message id -> message
const elById=new Map();
const claimed=new Set();       // message ids currently being added (prevents duplicates)
const contextById=new Map();   // older messages fetched only to show a reply quote       // message id -> element
const reactionsById=new Map();// message id -> Map(emoji -> Set(user ids))
const members=new Map();      // user id -> {read: ms, nick}
const pollsById=new Map();    // message id -> {options, multi, votes: Map(index -> Set(user ids))}
const pins=new Map();         // message id -> {pinned_by, created_at}
const gamesById=new Map();    // message id -> game row
let isDm=false, dmUser=null, myNotify="all", contactIds=[], addedMeIds=[], inboxRows=[], unsubAll=null;
let pinCursor=0, roomBg=null, pendingKind=null, pendingDuration=null, mentionPicks=new Map();
let pendingImages=[];   // multi-photo staging; when length>1 this takes over from the single pendingFile flow
let lbAlbum=null, lbIndex=0;   // which album (if any) the lightbox is currently browsing
const typers=new Map();       // user id -> {name,timer}
let blocked=new Set();
const feed=$("feed");

function isBirthdayToday(bd){
  if(typeof bd!=="string"||!/^\d\d-\d\d$/.test(bd)) return false;
  const d=new Date(), y=d.getFullYear(), today=String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const leap=(y%4===0&&y%100!==0)||y%400===0;
  return bd===today || (bd==="02-29"&&!leap&&today==="02-28");
}
function paintFace(node,p){
  node.style.setProperty("--c",colorFor(p?.username));
  node.textContent="";
  const inner=document.createElement("span"); inner.className="fi";
  const url=safeImg(p?.avatar_url);
  if(url){ const i=document.createElement("img"); i.src=url; i.alt=""; inner.append(i); }
  else inner.textContent=(p?.username||"?")[0].toUpperCase();
  node.append(inner);
  const bday=isBirthdayToday(p?.birthday);
  node.classList.toggle("bday",bday);
  if(bday){ const c=document.createElement("span"); c.className="cake"; c.textContent="🎂"; c.setAttribute("aria-hidden","true"); node.append(c); node.title=`It's ${p?.username||"their"}'s birthday today!`; }
  else if(node.title&&node.title.startsWith("It's ")) node.removeAttribute("title");
}
function paintHomeLevel(){ try{ const L=xpLevel(xpData().xp); $("homeLevel").textContent="LV "+L.lvl; }catch(e){} try{ paintGrow(); }catch(e){} }
function paintMe(){ paintHomeLevel(); paintMyStatus();
  ["meFace","openProfile2","profFace"].forEach(id=>paintFace($(id),meProfile));
  $("meName").textContent=meProfile?.username||""; $("profName").textContent=meProfile?.username||""; $("profEmail").textContent=user?.email||"";
}
async function ensureProfiles(ids){
  const need=[...new Set(ids)].filter(i=>i&&!cache.has(i)); if(!need.length) return;
  (await api.profiles(need).catch(()=>[])).forEach(p=>cache.set(p.id,p));
}
/* re-download profiles we already have, so things like a friend's new status show up even if the live update was missed */
async function refreshProfiles(ids){
  const want=[...new Set(ids)].filter(i=>i&&i!==user?.id); if(!want.length) return [];
  const rows=await api.profiles(want).catch(()=>[]);
  rows.forEach(p=>{ cache.set(p.id,{...cache.get(p.id),...p}); });
  return rows;
}
const nameOf = uid => (room && members.get(uid)?.nick) || cache.get(uid)?.username || "Someone";

async function refreshMe(){
  const [p]=await api.profiles([user.id]).catch(()=>[]);
  if(p) LS.set("nl-me-cache",JSON.stringify(p));
  let cached=null; try{ cached=JSON.parse(LS.get("nl-me-cache")||"null"); }catch(e){}
  meProfile=p||(cached&&cached.id===user.id?cached:null)||{id:user.id,username:user.user_metadata?.username||"you",avatar_url:null};
  cache.set(user.id,meProfile); paintMe(); applyTheme(meProfile.theme||savedTheme());
  const tz=myTz(); if(tz&&meProfile.tz!==tz){ meProfile.tz=tz; api.saveTz(user.id,tz).catch(()=>{}); }   // so friends see your times in theirs
  try{ LOOKSYNC.pull(); }catch(e){}
}

/* ================= AUTH ================= */
function hideSplash(){
  const s=$("splash"); if(!s||s.classList.contains("gone")) return;
  s.classList.add("gone");
}
function showSplash(msg){   // the loading screen, brought back to cover sign-in while everything loads
  const s=$("splash"); if(!s) return;
  if(msg&&$("splashMsg")) $("splashMsg").textContent=msg;
  s.classList.remove("gone");
  clearTimeout(showSplash.t); showSplash.t=setTimeout(hideSplash,20000);   // never get stuck behind it
}
(function splashStars(){
  const cv=$("splashStars"); if(!cv) return; const ctx=cv.getContext("2d");
  const size=()=>{ cv.width=innerWidth*Math.min(devicePixelRatio||1,2); cv.height=innerHeight*Math.min(devicePixelRatio||1,2); };
  size(); const dpr=Math.min(devicePixelRatio||1,2);
  const stars=[...Array(60)].map(()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,r:Math.random()*1.6*dpr+.4*dpr,p:Math.random()*6}));
  let raf, start=performance.now();
  const frame=now=>{ if(!$("splashStars")) return; ctx.clearRect(0,0,cv.width,cv.height); const t=now-start;
    stars.forEach(s=>{ ctx.globalAlpha=.35+.65*Math.abs(Math.sin(t/700+s.p)); ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,7); ctx.fill(); });
    raf=requestAnimationFrame(frame); };
  raf=requestAnimationFrame(frame);
  setTimeout(()=>cancelAnimationFrame(raf),4000);
})();
const SPLASH_MSGS=["booting up…","tuning the signal…","waking the moon…","almost there…"];
let splashMsgI=0; const splashMsgTimer=setInterval(()=>{ const n=$("splashMsg"); if(!n){ clearInterval(splashMsgTimer); return; } splashMsgI=(splashMsgI+1)%SPLASH_MSGS.length; n.textContent=SPLASH_MSGS[splashMsgI]; },900);
setTimeout(hideSplash,6000);   // safety net: never let the splash get stuck

async function handleAuth(u){
  user=u;
  const q=new URLSearchParams(location.search);
  if(!u){
    myInviteTok=null; tellSwAuth(null); signedLinks.clear(); isAdmin=false; show($("openCheats"),false); clearBadge();
    hideSplash(); appReady();
    if(unsub){unsub();unsub=null;} if(unsubAll){unsubAll();unsubAll=null;} if(typeof stopPresence==="function") stopPresence();
    say("authMsg","");   // clear any leftover "Logging in…"
    if(q.get("friend")) say("authMsg","A friend invited you to NightLane. Log in or sign up to add them.");
    else if(location.hostname==="nightlane.chat"&&!LS.get("nl-welcomed-lane")) say("authMsg","🌃 NightLine is now NightLane! Same app, same account. Just log in with your usual email and password.");
    ["chat","profile","roomSheet","msgMenu"].forEach(id=>show($(id),false));
    show($("front")); show($("authCard")); show($("roomCard"),false); $("front").classList.remove("logged");
    if(q.get("join")){
      say("authMsg",`You're invited to room ${q.get("join").slice(0,30)}. Log in or sign up to join.`);
      try{ LS.set("nl-pending-join",JSON.stringify({code:q.get("join"),t:q.get("t")||null,at:Date.now()})); }catch(e){}
    }
    if(q.get("friend")){ try{ LS.set("nl-pending-friend",JSON.stringify({t:q.get("friend"),at:Date.now()})); }catch(e){} }
    return;
  }
  if(offlineMode){ offlineMode=false; paintOffline(); }
  await Promise.all([refreshMe(), syncProgress(), api.blocks().then(b=>{ blocked=new Set(b); }).catch(()=>{})]);
  if(!LS.ok&&!window.__lsWarned){ window.__lsWarned=true; setTimeout(()=>{
    const t=el("div","toast long"); const body=el("span","tbody");
    body.append(el("div","ttitle","⚠️ Your browser is blocking saved data"), el("div","ttext","Your progress still saves to your account, but settings reset each visit. Turn off Private Browsing or \"Block All Cookies\", or add NightLane to your Home Screen."));
    t.append(body); $("toasts").prepend(t); setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },10000); },3000); }
  show($("authCard"),false); show($("roomCard"));
  try{ const last=LS.get("nl-room")||""; $("room").value=last.startsWith("dm-")?"":last; }catch(e){}
  $("front").classList.add("logged");
  await Promise.all([ensureProfiles([...blocked]), loadContacts(), loadInbox()]); appReady(); startPresence(); owlBack(); partnerSoon(2500);
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));   // let the real front screen actually paint first
  hideSplash();
  try{ LS.set("nl-welcomed-lane","1"); }catch(e){}
  maybeShowWhatsNew();
  refreshPushSubscription();
  loadHabits().then(()=>{ checkHabitReminders(); setInterval(checkHabitReminders,300000); });
  checkBondNews().then(()=>{ if(user) loadContacts(); });
  paintArcanaBadge();
  if(q.get("friend")){ const tok=q.get("friend"); history.replaceState(null,"",location.pathname); setTimeout(()=>handleFriendInvite(tok),400); }
  try{ const t=LS.get("nl-front-tab"); if(["chats","lanes","dms","contacts"].includes(t)) setFrontTab(t); }catch(e){}
  celebrateMyBirthday(); seasonalCheck("login"); hintNudge(); dailyXP(); setTimeout(checkUnlocks,4000); setTimeout(recoveryNudge,9000); refreshAdmin(); setTimeout(maybeWelcome,1500);
  if(unsubAll) unsubAll();
  unsubAll=api.subscribeAll(onAnyMessage,onFriendAdded);   // (the icon number is set when the chat list loads)
  let linked=q.get("room"), joinCode=q.get("join"), joinToken=q.get("t");
  if(linked==="@reports"){ linked=null; pendingOpenReports=true; history.replaceState(null,"",location.pathname); }
  if(joinCode||linked) history.replaceState(null,"",location.pathname);
  try{ const pf=JSON.parse(LS.get("nl-pending-friend")||"null"); LS.remove("nl-pending-friend"); if(pf&&Date.now()-pf.at<3*864e5&&!q.get("friend")) setTimeout(()=>handleFriendInvite(pf.t),600); }catch(e){}
  if(!joinCode&&!linked){
    try{ const p=JSON.parse(LS.get("nl-pending-join")||"null");
      if(p&&Date.now()-p.at<3*864e5){ joinCode=p.code; joinToken=p.t; } }catch(e){}
  }
  try{ LS.remove("nl-pending-join"); }catch(e){}
  if(joinCode){ $("room").value=joinCode; enterRoom(joinCode,joinToken); }
  else if(linked) enterRoom(linked);
}

let mode="in";
function setMode(m){
  mode=m; $("tabIn").setAttribute("aria-selected",m==="in"); $("tabUp").setAttribute("aria-selected",m==="up");
  show($("unameWrap"),m==="up"); show($("agreeWrap"),m==="up"); $("authBtn").textContent=m==="in"?"Log in":"Create account";
  $("pass").autocomplete=m==="in"?"current-password":"new-password"; show($("forgot"),m==="in");
  $("emailLabel").textContent=m==="in"?"Email or username":"Email"; $("email").type=m==="in"?"text":"email"; $("email").autocomplete=m==="in"?"username":"email";
  if(!new URLSearchParams(location.search).get("join")) say("authMsg","");
}
$("tabIn").onclick=()=>setMode("in"); $("tabUp").onclick=()=>setMode("up");

$("authCard").addEventListener("submit",async e=>{
  e.preventDefault();
  const email=$("email").value.trim(), pass=$("pass").value, uname=$("uname").value.trim();
  if(mode==="up" && !/^[A-Za-z0-9_]{3,20}$/.test(uname)) return say("authMsg","Username needs 3–20 letters, numbers, or underscores.",true);
  if(mode==="up"||email.includes("@")){ if(!/^\S+@\S+\.\S+$/.test(email)) return say("authMsg","Enter a valid email.",true); }
  else if(!/^[A-Za-z0-9_]{3,20}$/.test(email)) return say("authMsg","Enter your email or your NightLane username.",true);
  if(pass.length<6) return say("authMsg","Password needs at least 6 characters.",true);
  if(mode==="up" && !$("agree").checked){ say("authMsg","Check the box to confirm you're 13 or older and agree to the Terms and Privacy Policy.",true); $("agree").focus(); return; }
  if(navigator.onLine===false) return say("authMsg","You're offline. Connect to the internet to "+(mode==="in"?"log in.":"sign up."),true);
  $("authBtn").disabled=true; say("authMsg",mode==="in"?"Logging in…":"Creating account…");
  showSplash(mode==="in"?"signing you in…":"setting up your account…");
  try{
    if(mode==="in") await api.signIn(email,pass);
    else { const r=await api.signUp(uname,email,pass); if(r==="confirm"){ hideSplash(); setMode("in"); say("authMsg","Check your email to confirm, then log in."); } }
    $("pass").value="";
  }catch(err){
    hideSplash();
    say("authMsg",isNetworkError(err)?"Couldn't reach NightLane. Check your connection and try again.":/invalid login/i.test(err.message)?"Wrong email or password.":/already registered/i.test(err.message)?"That email already has an account. Log in instead.":err.message,true);
  }finally{ $("authBtn").disabled=false; }
});

/* ---------- Forgot password: recovery code, email hint, or reset email ---------- */
$("forgot").onclick=()=>{
  const id=$("email").value.trim();
  $("fpUser").value=id&&!id.includes("@")?id:""; $("fpCode").value=""; $("fpPass").value=""; $("fpHintOut").textContent=""; say("fpMsg","");
  show($("forgotSheet")); setTimeout(()=>($("fpUser").value?$("fpCode"):$("fpUser")).focus(),60);
};
const fpUsername=()=>{ const u=$("fpUser").value.trim(); if(!/^[A-Za-z0-9_]{3,20}$/.test(u)){ say("fpMsg","Type your NightLane username first.",true); $("fpUser").focus(); return null; } return u; };
$("fpForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const u=fpUsername(); if(!u) return;
  const code=$("fpCode").value.trim(), pw=$("fpPass").value;
  if(code.replace(/[^A-Za-z0-9]/g,"").length<12) return say("fpMsg","Type your whole recovery code (NL-XXXX-XXXX-XXXX).",true);
  if(pw.length<6) return say("fpMsg","New password needs at least 6 characters.",true);
  if(navigator.onLine===false) return say("fpMsg","You're offline. Connect to the internet first.",true);
  $("fpGo").disabled=true; say("fpMsg","Checking your code…");
  try{
    await api.accountRecover(u,code,pw);
    say("fpMsg","Password reset! Logging you in…");
    showSplash("signing you in…");
    await api.signIn(u,pw);
    show($("forgotSheet"),false);
    setTimeout(()=>toast("🛟 You're back in","That recovery code is used up. Make a new one in Profile → 🛟 Recovery code."),2500);
  }catch(err){ hideSplash(); say("fpMsg",err.message,true); }
  finally{ $("fpGo").disabled=false; }
});
$("fpHint").onclick=async()=>{
  const u=fpUsername(); if(!u) return;
  $("fpHint").disabled=true; $("fpHintOut").textContent="Looking…";
  try{ $("fpHintOut").textContent="Your account's email: "+await api.accountHint(u); say("fpMsg",""); }
  catch(err){ $("fpHintOut").textContent=""; say("fpMsg",err.message,true); }
  finally{ $("fpHint").disabled=false; }
};
$("fpEmail").onclick=async()=>{
  const typed=$("email").value.trim();
  const email=typed.includes("@")?typed:prompt("Type the email your account uses:","");
  if(!email) return; if(!/^\S+@\S+\.\S+$/.test(email.trim())) return say("fpMsg","That doesn't look like an email.",true);
  $("fpEmail").disabled=true; say("fpMsg","Sending reset link…");
  try{ await api.resetPassword(email.trim()); say("fpMsg","If that email has an account, a reset link is on its way. Check spam too."); }
  catch(err){ say("fpMsg",/not authorized/i.test(err.message)?"Reset emails aren't working right now. Use your recovery code, or email support@nightlane.chat for help.":/rate limit/i.test(err.message)?"Too many reset emails. Wait a bit and try again.":err.message,true); }
  finally{ $("fpEmail").disabled=false; }
};
$("fpClose").onclick=()=>show($("forgotSheet"),false);
function toast(title,text,onTap){
  const t=el(onTap?"button":"div","toast long"); if(onTap){ t.type="button"; t.onclick=()=>{ t.remove(); onTap(); }; }
  const body=el("span","tbody"); body.append(el("div","ttitle",title),el("div","ttext",text)); t.append(body);
  $("toasts").prepend(t); setTimeout(()=>{ if(t.isConnected){ t.classList.add("out"); setTimeout(()=>t.remove(),260); } },7000);
}

$("amClose").onclick=()=>show($("arcanaSheet"),false);
$("amRetake").onclick=()=>{ show($("arcanaSheet"),false); openQuiz(); };
$("arcanaSheet").addEventListener("click",e=>{ if(e.target.id==="arcanaSheet") show($("arcanaSheet"),false); });

const motionName=()=>motionLess()?"Less motion":motionAlways()?"Always play":"Match my device";
$("animPrefBtn").onclick=()=>{
  // Match my device → Less motion → Always play → back
  const next=motionLess()?"always":motionAlways()?"device":"less"; LS.set("nl-motion",next);
  document.documentElement.classList.toggle("motion-always",next==="always"); document.documentElement.classList.toggle("motion-less",next==="less");
  $("animPrefBtn").textContent="🎞️ Animations: "+motionName();
  if(next==="less") return say("profMsg","Less motion: animations, screen effects, and secrets are calmed down, whatever your device is set to.");
  const on=next==="always";
  say("profMsg",on?"Animations and secrets will play even if your device asks for less motion.":(matchMedia("(prefers-reduced-motion: reduce)").matches?"Following your device: it asks for less motion, so animations and secrets are calmed down.":"Following your device's motion setting."));
};

/* ---------- Secret cheat sheet (admins only; the server decides who's an admin) ----------
   Built from the live secret list every time it opens, so new secrets show up by themselves. */
let isAdmin=false;
async function refreshAdmin(){ isAdmin=false; try{ isAdmin=await api.isAdmin(); }catch(e){} show($("openCheats"),isAdmin); show($("openReports"), isAdmin);
  if(isAdmin){ if(pendingOpenReports){ pendingOpenReports=false; reportNudged=true; openReviews(); } paintReportBadge(); } }
let pendingOpenReports=false;
$("openReports").onclick=()=>{ show($("profile"),false); show($("reviewSheet")); setReviewTab("open"); };
$("reviewClose").onclick=()=>show($("reviewSheet"),false);
$("reviewSheet").addEventListener("click",e=>{ if(e.target.id==="reviewSheet") show($("reviewSheet"),false); });
let reviewTab="open";
const agoText=t=>{ const d=(Date.now()-new Date(t))/1000; return d<60?"just now":d<3600?Math.floor(d/60)+"m ago":d<86400?Math.floor(d/3600)+"h ago":Math.floor(d/86400)+"d ago"; };
async function loadReviews(note){
  const list=$("reviewList"); list.innerHTML=""; say("reviewMsg","Loading…");
  let reports=[];
  try{ reports=await api.listReports(reviewTab==="open"?"open":"handled"); say("reviewMsg",note||""); }
  catch(err){ say("reviewMsg",err.message,true); return; }
  paintReportBadge();
  if(!reports.length){ list.append(el("p","sub",reviewTab==="open"?"No open reports. 🎉":"Nothing handled yet.")); return; }
  // one card per reported message, even if several people reported it
  const groups=new Map();
  reports.forEach(r=>{ const g=groups.get(r.message_id)||{...r,reasons:new Set(),reporters:new Set(),notes:[],latest:r.created_at,count:0}; g.count++; g.reasons.add(r.reason); g.reporters.add(r.reporter_name||"Someone"); if(r.details) g.notes.push(`${r.reporter_name}: ${r.details}`); if(new Date(r.created_at)>new Date(g.latest)) g.latest=r.created_at; groups.set(r.message_id,g); });
  [...groups.values()].sort((a,b)=>new Date(b.latest)-new Date(a.latest)).forEach(g=>{
    const row=el("div","reviewrow");
    const head=el("div","rvhead"); head.append(el("b","",`🚩 ${[...g.reasons].join(", ")}${g.count>1?` ×${g.count}`:""}`),el("small","",`${agoText(g.latest)} · ${g.room_name||"#"+g.room}`)); row.append(head);
    row.append(el("p","rvmsg",`${g.reported_name||"Someone"}: `+(g.message_exists===false?"(message deleted)":`"${g.message_text||(g.message_kind?"a "+g.message_kind:"")}"`)));
    row.append(el("p","sub",`Reported by ${[...g.reporters].join(", ")}`));
    g.notes.forEach(n=>row.append(el("p","sub rvnote","📝 "+n)));
    const ctx=el("div","rvctx hidden"); row.append(ctx);
    const acts=el("div","rvacts");
    if(g.message_exists!==false){
      const see=el("button","ghost","💬 Context"); see.type="button";
      see.onclick=async()=>{ if(!ctx.classList.contains("hidden")){ show(ctx,false); return; } ctx.innerHTML=""; ctx.append(el("p","sub","Loading…")); show(ctx);
        try{ const rows=await api.reportContext(g.message_id); ctx.innerHTML=""; if(!rows.length) ctx.append(el("p","sub","That message is gone."));
          rows.forEach(c=>ctx.append(el("p",c.is_reported?"rvline hit":"rvline",`${c.is_reported?"👉 ":""}${c.user_name||"Someone"}: ${c.text||(c.kind!=="text"?"["+c.kind+"]":"")}`))); }
        catch(err){ ctx.innerHTML=""; ctx.append(el("p","sub",err.message)); } };
      acts.append(see);
    }
    if(reviewTab==="open"){
      if(g.message_exists!==false){ const del=el("button","ghost danger","🗑️ Delete message"); del.type="button";
        del.onclick=async()=>{ if(!confirm(`Delete ${g.reported_name||"this person"}'s message for everyone? This can't be undone.`)) return; del.disabled=true;
          try{ await api.adminDeleteMessage(g.message_id); loadReviews("🗑️ Message deleted for everyone, and the report is closed."); }catch(err){ say("reviewMsg",err.message,true); del.disabled=false; } };
        acts.append(del); }
      const done=el("button","ghost","✓ Dismiss"); done.type="button";
      done.onclick=async()=>{ done.disabled=true; try{ await api.setMessageReportsStatus(g.message_id,"handled"); loadReviews("✓ Dismissed."); }catch(err){ say("reviewMsg",err.message,true); done.disabled=false; } };
      acts.append(done);
    } else {
      const back=el("button","ghost","↩ Reopen"); back.type="button";
      back.onclick=async()=>{ back.disabled=true; try{ await api.setMessageReportsStatus(g.message_id,"open"); loadReviews(); }catch(err){ say("reviewMsg",err.message,true); back.disabled=false; } };
      acts.append(back);
    }
    row.append(acts); list.append(row);
  });
}
function setReviewTab(t){ reviewTab=t; $("reviewTabOpen").classList.toggle("on",t==="open"); $("reviewTabDone").classList.toggle("on",t!=="open"); $("reviewTabOpen").setAttribute("aria-pressed",String(t==="open")); $("reviewTabDone").setAttribute("aria-pressed",String(t!=="open")); loadReviews(); }
$("reviewTabOpen").onclick=()=>setReviewTab("open");
$("reviewTabDone").onclick=()=>setReviewTab("handled");
function openReviews(){ ["profile","roomSheet","msgMenu"].forEach(id=>show($(id),false)); show($("reviewSheet")); setReviewTab("open"); }
let reportNudged=false;
async function paintReportBadge(){
  if(!isAdmin) return;
  const n=await api.countOpenReports().catch(()=>0), btn=$("openReports");
  btn.textContent=n?`📋 Reports (${n} open)`:"📋 Reports"; btn.classList.toggle("alert",!!n);
  if(n&&!reportNudged){ reportNudged=true;   // once per visit: a heads-up that reports are waiting
    const t=el("button","toast"); t.type="button"; const body=el("span","tbody");
    body.append(el("div","ttitle",`🚩 ${n} open report${n>1?"s":""}`),el("div","ttext","Tap to review."));
    t.append(el("span","sx-lock","🚩"),body); t.onclick=()=>{ t.remove(); openReviews(); };
    $("toasts").prepend(t); setTimeout(()=>{ t.classList.add("out"); setTimeout(()=>t.remove(),260); },8000); }
}
const GESTURE_HOW={
  konami:"Swipe ↑ ↑ ↓ ↓ ← → ← → anywhere (arrow keys work on a computer), then double-tap the date stamp or the room name within 10 seconds.",
  moonwink:"Tap the little icon on the date stamp 7 times within 3 seconds.",
  shake:"Shake your phone while a chat is open. (iPhone asks for motion permission first.)",
  combo:"Send 5 messages within 10 seconds.",
  shiny:"Pure luck: about 1 in every 500 messages you send is shiny.",
  lateowl:"Send a message between 3 and 5 AM.",
  credits:"Press and hold the date stamp for about a second."
};
function secretPhrase(re){   // turn a trigger pattern into plain words; (brackets) mean that part is optional
  let t=re.source;
  t=t.replace(/\\\?/g,"\u2047").replace(/\\!/g,"!");                                   // escaped ? kept as a real question mark
  t=t.replace(/\(\^\|\[\^a-z0-9\]\)|\(\^\|\[\^a-z\]\)|\(\[\^a-z0-9\]\|\$\)|\(\[\^a-z\]\|\$\)|\\b/g,"");   // word edges
  t=t.replace(/\(\?![^)]*\)/g,"");                                                          // "not followed by…" checks
  t=t.replace(/\^(\d+)\$/g,"$1 (on its own)").replace(/[\^$]/g,"");
  t=t.replace(/\[- \]\??/g," ").replace(/\[(\w)(\w)\]/g,"$2");
  t=t.replace(/\\s[+*]?/g," ").replace(/\(\?:/g,"(");
  t=t.replace(/([ ,!-])\?/g,"$1").replace(/'\?/g,"'");
  t=t.replace(/([a-z])\{2,\}/gi,"$1$1$1").replace(/\(([^()]*)\)\?/g,"($1)").replace(/([a-z0-9])\?/gi,"($1)");
  t=t.replace(/\|/g," / ").replace(/\\/g,"").replace(/[+*]/g,"").replace(/\u2047/g,"?");
  return t.replace(/\s+/g," ").replace(/\( /g,"(").trim();
}
function secretWhen(sec){
  const w=String(sec.when||"");
  if(/isDm/.test(w)) return "Only works in private chats (DMs).";
  if(/getHours\(\)===0/.test(w)) return "Only works during the midnight hour (12:00–12:59 AM).";
  return w?"Has a special condition.":"";
}
function paintCheats(){
  const q=$("cheatSearch").value.trim().toLowerCase(), onlyMissing=$("cheatFilter").getAttribute("aria-pressed")==="true";
  const found=new Set(foundSecrets()), box=$("cheatList"); box.innerHTML="";
  $("cheatCount").textContent=`You've found ${SECRET_LIST.filter(x=>found.has(x.id)).length} of ${SECRET_LIST.length}. Only you can see this.`;
  let shown=0;
  SECRET_LIST.forEach(sec=>{
    const how=sec.re?secretPhrase(sec.re):GESTURE_HOW[sec.id]||"A special gesture.";
    const hint=HINTS[sec.id]||"", when=secretWhen(sec);
    const unl=(typeof UNLOCKS!=="undefined"?UNLOCKS:[]).filter(u=>u.by?.secret===sec.id).map(u=>u.label);
    if(onlyMissing&&found.has(sec.id)) return;
    if(q&&!(sec.name+" "+sec.id+" "+how+" "+hint).toLowerCase().includes(q)) return;
    shown++;
    const row=el("div","cheat"+(found.has(sec.id)?" got":""));
    const head=el("div","cheat-head"); head.append(el("b","",(found.has(sec.id)?"✓ ":"")+sec.name));
    if(sec.play&&sec.re){ const t=el("button","cheat-test","▶ Test"); t.type="button"; t.setAttribute("aria-label",`Preview ${sec.name}`);
      t.onclick=()=>{ show($("cheatSheet"),false); setTimeout(()=>{ try{ sec.play({id:0,user_id:user.id,room,kind:"text",text:how,created_at:new Date().toISOString()}); }catch(e){} },250); };
      head.append(t); }
    row.append(head, el("div","cheat-how",(sec.re?"Say: ":"How: ")+how));
    if(when) row.append(el("div","cheat-when","⏰ "+when));
    if(hint) row.append(el("div","cheat-hint","💡 "+hint));
    if(unl.length) row.append(el("div","cheat-unl","🎁 Unlocks "+unl.join(", ")));
    box.append(row);
  });
  if(!shown) box.append(el("p","note",onlyMissing&&!q?"You've found them all! 🏆":"No secrets match that."));
}
$("openCheats").onclick=()=>{ if(!isAdmin) return; show($("profile"),false); $("cheatSearch").value=""; paintCheats(); show($("cheatSheet")); };
$("cheatSearch").addEventListener("input",paintCheats);
$("cheatFilter").onclick=()=>{ const on=$("cheatFilter").getAttribute("aria-pressed")!=="true"; $("cheatFilter").setAttribute("aria-pressed",String(on)); $("cheatFilter").classList.toggle("on",on); paintCheats(); };
$("cheatClose").onclick=()=>show($("cheatSheet"),false);

/* ---------- Recovery code (Profile) ---------- */
async function openRecovery(){
  show($("rcCodeBox"),false); say("rcMsg",""); $("rcStatus").textContent="Checking…"; show($("rcSheet"));
  let when=null; try{ when=await api.myRecoveryCodeDate(); }catch(e){ $("rcStatus").textContent="Recovery codes aren't set up yet."; return; }
  $("rcStatus").textContent=when?`✅ You have a recovery code (made ${new Date(when).toLocaleDateString([], {month:"short",day:"numeric",year:"numeric"})}).`:"You don't have a recovery code yet.";
  $("rcMake").textContent=when?"Make a new code":"Make my recovery code";
}
$("openRecovery").onclick=()=>{ show($("profile"),false); openRecovery(); };
$("openCredits").onclick=()=>{ show($("profile"),false); show($("creditsSheet")); };
$("rcMake").onclick=async()=>{
  if($("rcMake").textContent.startsWith("Make a new")&&!confirm("Make a new recovery code? Your old one will stop working.")) return;
  $("rcMake").disabled=true; say("rcMsg","");
  try{
    const code=await api.createRecoveryCode();
    $("rcCode").textContent=code; show($("rcCodeBox"));
    $("rcStatus").textContent="✅ Here's your recovery code. Save it now: screenshot it or put it in your notes. You won't see it again.";
    $("rcMake").textContent="Make a new code";
    try{ LS.set("nl-rc-nudged-"+user.id,"1"); }catch(e){}
  }catch(err){ say("rcMsg","Couldn't make a code: "+err.message,true); }
  finally{ $("rcMake").disabled=false; }
};
$("rcCopy").onclick=async()=>{ try{ await navigator.clipboard.writeText($("rcCode").textContent); say("rcMsg","Copied. Paste it somewhere safe."); }catch(e){ say("rcMsg","Long-press the code to copy it."); } };
$("rcClose").onclick=()=>show($("rcSheet"),false);
$("rcSheet").addEventListener("click",e=>{ if(e.target.id==="rcSheet") show($("rcSheet"),false); });
$("creditsClose").onclick=()=>show($("creditsSheet"),false);
$("creditsSheet").addEventListener("click",e=>{ if(e.target.id==="creditsSheet") show($("creditsSheet"),false); });

/* ================= PROFILE CARD: banner + effect + stickers others see on your profile ================= */
const CARD_BANNERS={
  neon:  {label:"Neon Night", bg:"linear-gradient(135deg,#140A3A 0%,#3b1a6e 45%,#00b8d4 100%)"},
  sunset:{label:"Sunset",     bg:"linear-gradient(135deg,#2b1055 0%,#c2417a 55%,#ff9a3d 100%)"},
  toxic: {label:"Toxic",      bg:"linear-gradient(135deg,#061a0b 0%,#1f7a3a 55%,#c8ff3a 100%)"},
  ocean: {label:"Ocean",      bg:"linear-gradient(135deg,#041a3a 0%,#0b5fa5 55%,#5ee7ff 100%)"},
  sakura:{label:"Sakura",     bg:"linear-gradient(135deg,#3a0f2e 0%,#c65aae 55%,#ffd1e8 100%)"},
  ember: {label:"Ember",      bg:"linear-gradient(135deg,#1a0505 0%,#8a1c1c 55%,#ff8a1f 100%)"},
  void:  {label:"Void",       bg:"radial-gradient(circle at 70% 30%,#3b2d80 0%,#07041A 70%)"},
};
const REL_STATUSES=["Single","Taken","It's complicated","Married","Not looking"];
const CARD_FX={none:"None",sparkle:"✨ Sparkles",snow:"❄️ Snow",hearts:"💖 Hearts",embers:"🔥 Embers",stars:"🌠 Stars"};
const CARD_FX_CHARS={sparkle:"✦",snow:"❄",hearts:"♥",embers:"•",stars:"✧"};
/* social links: we only store usernames and build the address ourselves, so nobody can sneak in a sketchy link */
const CARD_LINKS={
  discord:  {label:"Discord",   icon:"💬", url:null, re:/^[a-z0-9._]{2,32}$/i},
  instagram:{label:"Instagram", icon:"📸", url:h=>"https://instagram.com/"+h, re:/^[a-z0-9._]{1,30}$/i},
  tiktok:   {label:"TikTok",    icon:"🎵", url:h=>"https://www.tiktok.com/@"+h, re:/^[a-z0-9._]{2,24}$/i},
  youtube:  {label:"YouTube",   icon:"▶️", url:h=>"https://www.youtube.com/@"+h, re:/^[a-z0-9._-]{3,30}$/i},
  twitch:   {label:"Twitch",    icon:"🎮", url:h=>"https://www.twitch.tv/"+h, re:/^[a-z0-9_]{3,25}$/i},
  x:        {label:"X / Twitter",icon:"✖️", url:h=>"https://x.com/"+h, re:/^[a-z0-9_]{1,15}$/i},
  steam:    {label:"Steam",     icon:"🕹️", url:h=>"https://steamcommunity.com/id/"+h, re:/^[a-z0-9_-]{2,32}$/i},
  github:   {label:"GitHub",    icon:"🐙", url:h=>"https://github.com/"+h, re:/^[a-z0-9-]{1,39}$/i},
  web:      {label:"Website",   icon:"🌐", url:h=>h, re:null},
};
function cleanLink(k,v){
  if(typeof v!=="string"||!CARD_LINKS[k]) return "";
  v=v.trim(); if(!v) return "";
  if(k==="web"){ try{ if(!/^[a-z]+:/i.test(v)) v="https://"+v; const u=new URL(v); return u.protocol==="https:"&&u.hostname.includes(".")&&!u.username&&!u.password&&u.href.length<=120?u.href:""; }catch(e){ return ""; } }
  if(/\//.test(v)) v=v.split(/[?#]/)[0].split("/").filter(Boolean).pop()||"";   // pasted a whole link → keep the name at the end
  v=v.replace(/^@/,"");
  return CARD_LINKS[k].re.test(v)?v:"";
}
function cleanLinks(o){ const out={}; if(o&&typeof o==="object") Object.keys(CARD_LINKS).forEach(k=>{ const v=cleanLink(k,o[k]); if(v) out[k]=v; }); return Object.keys(out).length?out:null; }
function cleanCard(c){   // only trust known values (it comes from other people's profiles)
  if(!c||typeof c!=="object") return null;
  const out={banner:CARD_BANNERS[c.banner]?c.banner:(c.banner==="img"&&safeImg(c.img)?"img":null), fx:CARD_FX[c.fx]&&c.fx!=="none"?c.fx:null,
    stk:Array.isArray(c.stk)?c.stk.filter(id=>STICKERS[id]&&!STICKERS[id].bond).slice(0,3):[]};
  if(out.banner==="img") out.img=safeImg(c.img);
  const pr=typeof c.pronouns==="string"?c.pronouns.replace(/[\u0000-\u001f<>]/g,"").replace(/\s+/g," ").trim().slice(0,20):"";
  if(pr) out.pronouns=pr;
  if(REL_STATUSES.includes(c.relStatus)) out.relStatus=c.relStatus;
  const ln=cleanLinks(c.links); if(ln) out.links=ln;
  return out.banner||out.fx||out.stk.length||out.pronouns||out.links||out.relStatus?out:null;
}
const cardOf=p=>cleanCard(p?.theme?.card);
function paintCardBanner(box,card){
  box.innerHTML=""; box.className="pcard-banner"; const hasLook=!!(card&&(card.banner||card.fx||card.stk.length)); show(box,hasLook); if(!hasLook) return;
  if(card.banner==="img"&&card.img){ box.style.background=`#07041A url("${card.img.replace(/"/g,"%22")}") center/cover no-repeat`; }
  else box.style.background=(CARD_BANNERS[card.banner]||CARD_BANNERS.neon).bg;
  if(card.fx){ box.classList.add("fx-"+card.fx); const ch=CARD_FX_CHARS[card.fx];
    for(let i=0;i<14;i++){ const s=el("i","pc-p",ch); s.style.left=(4+i*6.8+(i%3)*2)%96+"%"; s.style.animationDelay=(-(i*0.37)%3.2).toFixed(2)+"s"; s.style.animationDuration=(2.6+(i%4)*0.5)+"s"; s.style.fontSize=(10+(i%3)*4)+"px"; box.append(s); } }
  const slots=[["8%","14%",-12],["40%","8%",6],["72%","16%",-4]];
  card.stk.forEach((id,i)=>{ const s=stickerEl(id); s.classList.add("pc-stk"); s.style.left=slots[i][0]; s.style.top=slots[i][1]; s.style.transform=`rotate(${slots[i][2]}deg)`; box.append(s); });
}
let draftCard=null;
function availableCardStickers(){ return Object.keys(STICKERS).filter(id=>!STICKERS[id].bond&&(!STICKERS[id].secret||hasSecret(STICKERS[id].secret))); }
function paintCardSheet(){
  const c=draftCard;
  paintCardBanner($("cardPreview"),cleanCard(c)||{banner:null,fx:null,stk:[]}); show($("cardPreview"),true);
  if(!cleanCard(c)){ $("cardPreview").style.background="repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0 10px,transparent 10px 20px)"; }
  paintFace($("cardFace"),meProfile);
  if(document.activeElement!==$("cardPronouns")) $("cardPronouns").value=c.pronouns||"";
  const rc=$("cardPronounChips"); rc.innerHTML="";
  ["he/him","she/her","they/them","he/they","she/they","any/all"].forEach(t=>{ const b=el("button","cb-chip"+(c.pronouns===t?" on":""),t); b.type="button"; b.onclick=()=>{ draftCard={...draftCard,pronouns:draftCard.pronouns===t?"":t}; $("cardPronouns").value=draftCard.pronouns; paintCardSheet(); }; rc.append(b); });
  const pc = $("cardRelStatusChips"); pc.innerHTML = "";
  ["Single","Taken","It's complicated","Married","Not looking"].forEach(s => {
    const b = el("button", "cb-chip" + (c.relStatus === s ? " on" : ""), s);
    b.type = "button";
    b.onclick = () => {
      draftCard = { ...draftCard, relStatus: draftCard.relStatus === s ? "" : s };
      paintCardSheet();
    };
    pc.append(b);
  });
  const lg=$("cardLinks");
  if(!lg.childElementCount) Object.entries(CARD_LINKS).forEach(([k,d])=>{
    const lab=el("label",null,d.icon+" "+d.label); lab.htmlFor="cardLink-"+k;
    const inp=el("input","field"); inp.id="cardLink-"+k; inp.maxLength=k==="web"?120:60; inp.autocomplete="off"; inp.autocapitalize="off"; inp.spellcheck=false;
    inp.placeholder=k==="web"?"yoursite.com":"username";
    inp.addEventListener("input",()=>{ draftCard={...draftCard,links:{...(draftCard.links||{}),[k]:inp.value}}; });
    lg.append(lab,inp);
  });
  Object.keys(CARD_LINKS).forEach(k=>{ const inp=$("cardLink-"+k); if(document.activeElement!==inp) inp.value=c.links?.[k]||""; });
  const bg=$("cardBanners"); bg.innerHTML="";
  const none=el("button","cb-sw"+(!c.banner?" on":""),"None"); none.type="button"; none.onclick=()=>{ draftCard={...draftCard,banner:null,img:null}; paintCardSheet(); }; bg.append(none);
  Object.entries(CARD_BANNERS).forEach(([id,b])=>{ const s=el("button","cb-sw"+(c.banner===id?" on":"")); s.type="button"; s.style.background=b.bg; s.title=b.label; s.setAttribute("aria-label","Banner: "+b.label); s.onclick=()=>{ draftCard={...draftCard,banner:id,img:null}; paintCardSheet(); }; bg.append(s); });
  const up=el("button","cb-sw up"+(c.banner==="img"?" on":""),c.banner==="img"?"🖼️ ✓":"🖼️ Upload"); up.type="button"; up.onclick=()=>$("cardFile").click(); bg.append(up);
  const gb=el("button","cb-sw up","🎞️ GIF"); gb.type="button"; gb.title="Search for a GIF banner"; gb.onclick=openBannerGifs; bg.append(gb);
  const fx=$("cardFx"); fx.innerHTML="";
  Object.entries(CARD_FX).forEach(([id,label])=>{ const b=el("button","cb-chip"+((c.fx||"none")===id?" on":""),label); b.type="button"; b.onclick=()=>{ draftCard={...draftCard,fx:id==="none"?null:id}; paintCardSheet(); }; fx.append(b); });
  const st=$("cardStk"); st.innerHTML="";
  availableCardStickers().forEach(id=>{ const on=(c.stk||[]).includes(id); const b=el("button","cb-stk"+(on?" on":"")); b.type="button"; b.setAttribute("aria-pressed",String(on)); b.setAttribute("aria-label",STICKERS[id].label); b.append(stickerEl(id));
    b.onclick=()=>{ let list=[...(draftCard.stk||[])]; if(list.includes(id)) list=list.filter(x=>x!==id); else { if(list.length>=3){ say("cardMsg","Up to 3 stickers. Tap one to remove it first.",true); return; } list.push(id); } say("cardMsg",""); draftCard={...draftCard,stk:list}; paintCardSheet(); };
    st.append(b); });
}
function openCardSheet(){ draftCard={banner:null,img:null,fx:null,stk:[],...(meProfile?.theme?.card||{})}; say("cardMsg",""); $("cardLinksBox").open=!!draftCard.links; show($("profile"),false); paintCardSheet(); paintCardPartner(); show($("cardSheet")); loadRel(); }
$("openCard").onclick=openCardSheet;
/* ================= 💞 RELATIONSHIPS: partner tags + mutual friends =================
   The server (relationships.sql) makes sure a partner tag only shows once the other person says yes,
   only between friends who added each other, one partner at a time.
   ✍️ Cole's part builds on these:
     • relPartnerOf(uid)      → Promise: that person's partner id, or null (cached for a minute, safe to call a lot)
     • api.mutualFriends(uid) → Promise: array of ids you BOTH added (empty if none)
     • relName(uid)           → their username (no room nicknames) */


const REL={partner:null,outgoing:null,incoming:[],ready:false,asked:new Set(),cache:new Map()};
const relName=uid=>cache.get(uid)?.username||"Someone";
const relMissing=err=>/rel_|mutual_friends|schema cache|does not exist|Could not find the function/i.test(err?.message||"");
async function loadRel(){
  if(!user) return;
  try{
    const r=await api.relMine();
    Object.assign(REL,{partner:r?.partner||null,outgoing:r?.outgoing||null,incoming:Array.isArray(r?.incoming)?r.incoming:[],ready:true});
    REL.cache.set(user.id,{p:REL.partner,t:Date.now()});
    await ensureProfiles([REL.partner,REL.outgoing,...REL.incoming].filter(Boolean));
  }catch(e){ REL.ready=false; }
  if(!$("cardSheet").classList.contains("hidden")) paintCardPartner();
  relMaybeAsk();
}
async function relPartnerOf(uid){
  if(!uid) return null;
  const hit=REL.cache.get(uid); if(hit&&Date.now()-hit.t<60000) return hit.p;
  try{
    const rows=await api.relPartners([uid]), p=(rows||[]).find(r=>r.user_id===uid)?.partner||null;
    REL.cache.set(uid,{p,t:Date.now()}); if(p) await ensureProfiles([p]); return p;
  }catch(e){ return hit?.p||null; }
}
const relFriends=()=>contactIds.filter(id=>addedMeIds.includes(id)&&!blocked.has(id)&&cache.has(id));
function relRow(uid,text){ const row=el("div","cb-prow"), f=el("span","face sm"); paintFace(f,cache.get(uid)); row.append(f,el("span","",text)); return row; }
function paintCardPartner(){
  const box=$("cardPartner"); if(!box) return; box.innerHTML="";
  if(!REL.ready){ box.append(el("p","sub","Partner tags aren't switched on yet.")); return; }
  if(REL.partner){
    box.append(relRow(REL.partner,`💞 You and ${relName(REL.partner)}`));
    const rm=el("button","ghost cb-pbtn","Remove partner tag"); rm.type="button";
    rm.onclick=()=>{ if(confirm(`Remove the partner tag with ${relName(REL.partner)}? It disappears from both profiles.`)) relAct(()=>api.relClear(),"Partner tag removed."); };
    box.append(rm); return;
  }
  if(REL.outgoing){
    box.append(relRow(REL.outgoing,`⏳ Waiting for ${relName(REL.outgoing)} to say yes`));
    const c=el("button","ghost cb-pbtn","Cancel request"); c.type="button"; c.onclick=()=>relAct(()=>api.relClear(),"Request cancelled."); box.append(c);
  }
  const fr=relFriends().filter(id=>id!==REL.outgoing);
  if(!fr.length){ if(!REL.outgoing) box.append(el("p","sub","You can tag a friend once you've both added each other.")); return; }
  const pick=el("details","cb-ppick"); pick.append(el("summary","",REL.outgoing?"Ask someone else instead":"💞 Tag a partner"));
  const list=el("div","cb-row");
  fr.forEach(uid=>{ const b=el("button","cb-chip cb-pchip"); b.type="button"; const f=el("span","face sm"); paintFace(f,cache.get(uid)); b.append(f,el("span","",relName(uid)));
    b.onclick=()=>relAct(()=>api.relRequest(uid),null,uid); list.append(b); });
  pick.append(list, el("p","sub","They get asked first. Nothing shows until they say yes.")); box.append(pick);
}
async function relAct(fn,okMsg,who){
  say("cardMsg","…");
  try{
    const r=await fn(); REL.cache.clear(); await loadRel(); paintCardPartner();
    say("cardMsg",okMsg||(r==="accepted"?`💞 You and ${relName(who)} are tagged!`:`Asked ${relName(who)}. It shows once they say yes.`));
  }catch(err){ say("cardMsg",relMissing(err)?"Partner tags aren't switched on yet.":err.message,true); }
}
function relMaybeAsk(){   // someone asked you: one friendly yes / no card, once per session per person
  if(!$("relAsk").classList.contains("hidden")) return;
  const from=REL.incoming.find(u=>!REL.asked.has(u)&&cache.has(u)&&!blocked.has(u)); if(!from) return;
  REL.asked.add(from);
  paintFace($("relAskFace"),cache.get(from));
  $("relAskText").textContent=`${relName(from)} wants to show you as their partner. Say yes and it shows on both of your profiles.`;
  $("relAsk").dataset.from=from; show($("relAsk"));
}
async function relAnswer(yes){
  const from=$("relAsk").dataset.from; show($("relAsk"),false); if(!from) return;
  try{ await api.relRespond(from,yes); if(yes){ toast("💞 Tagged!",`You and ${relName(from)} now show as partners.`); if(navigator.vibrate) navigator.vibrate([20,40,20]); } }
  catch(err){ toast("Couldn't answer",relMissing(err)?"Partner tags aren't switched on yet.":err.message); }
  REL.cache.clear(); await loadRel();
}
$("relYes").onclick=()=>relAnswer(true);
$("relNo").onclick=()=>relAnswer(false);
$("relLater").onclick=()=>show($("relAsk"),false);
$("cardPronouns").addEventListener("input",()=>{ draftCard={...draftCard,pronouns:$("cardPronouns").value}; document.querySelectorAll("#cardPronounChips .cb-chip").forEach(b=>b.classList.toggle("on",b.textContent===draftCard.pronouns.trim())); });
$("cardClose").onclick=()=>show($("cardSheet"),false);
$("cardFile").onchange=async e=>{
  const f=e.target.files?.[0]; e.target.value=""; if(!f) return;
  try{
    if(!/^image\//.test(f.type||"")) throw new Error("Pick a picture file.");
    if(f.size>15e6) throw new Error("That picture is over 15 MB. Pick a smaller one.");
    // 🎞️ a GIF keeps moving: cropping redraws it as a still picture, so GIFs (up to 5 MB) skip the cropper and go up as they are
    const gif=f.type==="image/gif"&&f.size<5e6;
    let pic;
    if(gif) pic=f;
    else{
      try{ pic=await openCrop(f,"banner"); }catch(err){ throw new Error("couldn't open that picture"); }
      if(!pic) return say("cardMsg","");   // cancelled
    }
    say("cardMsg",gif?"Uploading your GIF banner…":"Uploading banner…");
    const url=await api.upload("avatars",user.id,pic);
    draftCard={...draftCard,banner:"img",img:url}; paintCardSheet();
    say("cardMsg",gif?"🎞️ GIF banners stay animated (they're centered, not cropped). Hit Save card.":"");
  }catch(err){ say("cardMsg","Couldn't upload: "+err.message,true); }
};
$("cardSave").onclick=async()=>{
  $("cardSave").disabled=true;
  try{
    const bad=Object.entries(draftCard.links||{}).filter(([k,v])=>String(v||"").trim()&&!cleanLink(k,v)).map(([k])=>CARD_LINKS[k]?.label);
    if(bad.length){ $("cardLinksBox").open=true; throw new Error("that "+bad.join(" / ")+" doesn't look right"+(bad.includes("Website")?" (websites need https)":"")+"."); }
    const card=cleanCard(draftCard);
    const theme={...(meProfile?.theme||{})}; if(card) theme.card=card; else delete theme.card;
    await api.saveStyle(user.id,{theme});
    meProfile={...meProfile,theme}; cache.set(user.id,meProfile);
    say("cardMsg","Saved! Your friends see it on your profile."); setTimeout(()=>show($("cardSheet"),false),700);
  }catch(err){ say("cardMsg","Couldn't save: "+err.message,true); }
  finally{ $("cardSave").disabled=false; }
};

$("welcomeClose").onclick=()=>show($("welcomeSheet"),false);
$("welcomeFriends").onclick=()=>{ show($("welcomeSheet"),false); setFrontTab("contacts"); $("contactName").focus(); };
$("welcomeSheet").addEventListener("click",e=>{ if(e.target.id==="welcomeSheet") show($("welcomeSheet"),false); });
$("openTip").onclick=()=>{ show($("profile"),false); show($("tipSheet")); };
$("welcomeTip").onclick=()=>{ show($("welcomeSheet"),false); show($("tipSheet")); };
$("tipClose").onclick=()=>show($("tipSheet"),false);
$("tipSheet").addEventListener("click",e=>{ if(e.target.id==="tipSheet") show($("tipSheet"),false); });


/* ================= FUN STARTERS: guided tour · question of the day · game night · 🎲 surprise me ================= */
/* --- question of the day: the same question for everyone today, a new one at midnight --- */
const QOTD=[
  "What game could you replay forever?","Best anime opening of all time?","What's a hill you'll die on?","Dream vacation, no budget?",
  "What's your comfort show or movie?","Which game world would you actually want to live in?","Most underrated snack?","What song is stuck in your head right now?",
  "If you could master any skill overnight, what would it be?","Pineapple on pizza: yes or no?","What's the best thing that happened to you this week?","Which fictional character is basically you?",
  "What's a game you rage quit and never went back to?","Coffee, tea, or energy drink?","What's your go-to karaoke song?","If you had a theme song, what would it be?",
  "What's one thing you're looking forward to?","Best boss fight you've ever played?","What would your superpower be?","What's the last thing that made you laugh out loud?",
  "Sunrise or sunset?","Which anime deserves a sequel the most?","What's your most used emoji?","What's a weird talent you have?",
  "Favorite fast food order?","What's a game everyone should play at least once?","Night owl or early bird?","What was your first console?",
  "Best movie you watched this year?","What fictional food do you want to try?","If you could swap lives with a character for a day, who?","What's your current obsession?",
  "Cats or dogs?","Which video game soundtrack goes the hardest?","What's a hobby you want to pick up?","Describe your week with a GIF (send one!)",
  "What's your ideal Friday night?","Which villain was actually right?","What's something small that makes your day better?","Best co-op game to play with friends?",
  "What's your most controversial food opinion?","If NightLane had a mascot, what would it be?","What did you want to be when you were a kid?","Which season is the best?",
  "What's a show you'd recommend to everyone here?","What's the hardest achievement you've ever unlocked?","If you started a band, what's the name?","What's a little win you had today?",
  "Who in this chat would survive a zombie apocalypse?","What's your favorite way to waste time?","Spicy or sweet?","Which game character would you date?",
  "What's on your backlog that you keep putting off?","What's your all-time favorite holiday?","What's a movie quote you use way too much?","What's the best gift you've ever gotten?",
];
const dayNumber=()=>{ const d=new Date(); return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5); };
const qotdToday=()=>QOTD[dayNumber()%QOTD.length];
const isGameNight=()=>new Date().getDay()===5;   // Friday
function dailyDismissed(code){ try{ const s=JSON.parse(LS.get("nl-daily-x")||"{}"); return s.day===dayNumber()&&(s.rooms||[]).includes(code); }catch(e){ return false; } }
function dismissDaily(code){ try{ const s=JSON.parse(LS.get("nl-daily-x")||"{}"); const rooms=s.day===dayNumber()?(s.rooms||[]):[]; rooms.push(code); LS.set("nl-daily-x",JSON.stringify({day:dayNumber(),rooms:rooms.slice(-60)})); }catch(e){} }
/* you already answered today's question in this chat (maybe from another device), so the bar can go away */
const isDailyAnswer=t=>typeof t==="string"&&t.startsWith("❓ "+qotdToday());
function answeredDaily(){ const today=new Date().toDateString(); return msgs.some(m=>m.user_id===user?.id&&isDailyAnswer(m.text)&&new Date(m.created_at).toDateString()===today); }
function paintDailyBar(){
  const bar=$("dailyBar"); if(!bar) return;
  const gn=isGameNight();
  if(!room||dailyDismissed(room)||(!gn&&answeredDaily())){ show(bar,false); return; }
  $("dailyIcon").textContent=gn?"🎮":"❓";
  $("dailyLabel").textContent=gn?"Friday game night":"Question of the day";
  $("dailyText").textContent=gn?"Start a game with the crew tonight":qotdToday();
  $("dailyGo").textContent=gn?"Play":"Answer";
  show(bar,true);
}
$("dailyGo").onclick=()=>{
  if(isGameNight()){ openGamesTray(); return; }
  const box=$("box"); box.value="❓ "+qotdToday()+"\n"; box.dispatchEvent(new Event("input")); box.focus();
  try{ box.setSelectionRange(box.value.length,box.value.length); }catch(e){}
};
$("dailyX").onclick=()=>{ if(room) dismissDaily(room); show($("dailyBar"),false); };
function openGamesTray(pick){
  if(!room) return;
  if($("tray").classList.contains("hidden")){ paintStickers(); show($("tray")); $("plusBtn").setAttribute("aria-expanded","true"); }
  $("trayGames").click();
  if(pick){ const b=document.querySelector(`#gameList .gamepick[data-game="${pick}"]`); if(b){ b.classList.remove("flashpick"); void b.offsetWidth; b.classList.add("flashpick"); b.scrollIntoView({block:"nearest"}); } }
}

/* --- 🎲 surprise me: something fun to try right now --- */
const SURPRISE_WORDS=[["let's go","🏆"],["boom","💥"],["congrats","🎉"],["good night","🌠"],["lol","😂"],["lit","🔥"],["mwah","💋"],["love you","💖"]];
const GAME_NAMES={tictactoe:"Tic-tac-toe",kingscourt:"King's Court",eights:"Crazy Eights",liarsdice:"Liar's Dice",mancala:"Mancala",bs:"BS",lucky7:"Lucky 7",mahjong:"Mahjong",go:"Go",blackout:"Blackout"};
let lastSurprise=-1;
function surpriseMe(){
  if(!room) return;
  const opts=["word","game","secret"]; if(isDm&&dmUser) opts.push("bond");
  let k; do{ k=Math.floor(Math.random()*opts.length); }while(k===lastSurprise&&opts.length>1); lastSurprise=k;
  const kind=opts[k];
  if(kind==="word"){
    const [w,e]=SURPRISE_WORDS[Math.floor(Math.random()*SURPRISE_WORDS.length)];
    const box=$("box"); box.value=w; box.dispatchEvent(new Event("input")); box.focus();
    toast("🎲 Try this",`Send "${w}" ${e} and watch the screen.`);
  } else if(kind==="game"){
    const ids=Object.keys(GAME_NAMES), g=ids[Math.floor(Math.random()*ids.length)];
    openGamesTray(g); toast("🎲 Game time",`How about ${GAME_NAMES[g]}? Tap it to challenge ${isDm&&dmUser?nameOf(dmUser):"the room"}.`);
  } else if(kind==="secret"){
    const total=SECRET_LIST.length, found=countFound(foundSecrets());
    toast("🤫 Secret hunt",`NightLane has ${total} hidden secret words and you've found ${found}. Try quoting a famous line from an anime, game or movie.`);
  } else {
    const r=socialLinks.get(dmUser), info=rankFromXp(r?.xp||0);
    toast("✨ Social Bond",info.rank>=10?`You and ${nameOf(dmUser)} are maxed out at rank 10!`:`You and ${nameOf(dmUser)} are rank ${info.rank}. Keep chatting to reach rank ${info.rank+1}.`);
  }
}
$("dailyDice").onclick=surpriseMe;

/* --- guided tour: a quick look at the fun stuff (once for everyone, replay from Tips) --- */
let tourStep=0;
function tourSteps(){
  const found=countFound(foundSecrets()), total=SECRET_LIST.length;
  const bonds=[...socialLinks.entries()].map(([uid,r])=>({uid,rank:rankFromXp(r?.xp||0).rank})).filter(b=>cache.get(b.uid)).sort((a,b)=>b.rank-a.rank);
  const best=bonds[0];
  return [
    {icon:"✨",title:"Secret words",text:`Some words set off effects on everyone's screen. Tap one to see it. There are also ${total} hidden secrets nobody tells you about. You've found ${found}.`,try:true},
    {icon:"🎮",title:"Games in every chat",text:"Tic-tac-toe, King's Court, Crazy Eights, Liar's Dice, Mancala and BS live right inside your chats. In any room or DM, tap ＋ then Games."},
    {icon:"🤝",title:"Social Bonds",text:"Every chat with a friend grows your bond, from rank 1 to 10. Higher ranks unlock DM backgrounds at rank 3 and bubble styles at rank 4. Tap a friend's picture to see yours."+(best?` Your strongest bond right now: ${nameOf(best.uid)}, rank ${best.rank}.`:"")},
    {icon:"❓",title:"Something new every day",text:"Each chat gets a question of the day, Fridays are game night, and the 🎲 button gives you something fun to try whenever things get quiet."},
  ];
}
function paintTour(){
  const steps=tourSteps(), s=steps[tourStep];
  $("tourIcon").textContent=s.icon; $("tourTitle").textContent=s.title; $("tourText").textContent=s.text;
  show($("tourTry"),!!s.try);
  $("tourDots").innerHTML=""; steps.forEach((_,i)=>$("tourDots").append(el("i",i===tourStep?"on":"")));
  show($("tourBack"),tourStep>0);
  $("tourNext").textContent=tourStep===steps.length-1?"Let's go!":"Next";
}
function openTour(){ tourStep=0; paintTour(); show($("tourSheet")); }
function closeTour(){ show($("tourSheet"),false); try{ LS.set("nl-tour-done","1"); }catch(e){} }
$("tourNext").onclick=()=>{ if(tourStep>=tourSteps().length-1){ closeTour(); if(fxEnabled()) FX.play("confetti"); return; } tourStep++; paintTour(); };
$("tourBack").onclick=()=>{ if(tourStep>0){ tourStep--; paintTour(); } };
$("tourSkip").onclick=closeTour;
$("tourTry").querySelectorAll("[data-fx]").forEach(b=>b.onclick=()=>{
  if(!fxEnabled()){ toast("Effects are off","Turn on Screen effects in Profile → 🎨 Look to see them."); return; }
  if(reducedMotion()){ toast("Effects are paused","Your device asks for reduced motion, so effects stay still."); return; }
  FX.play(b.dataset.fx,{text:b.dataset.text||undefined});
});
$("welcomeTour").onclick=()=>{ show($("welcomeSheet"),false); openTour(); };
$("tipTour").onclick=()=>{ show($("tipSheet"),false); openTour(); };
function maybeTour(){   // everyone gets the tour once, after the Welcome intro has been seen
  let done=false, welcomed=false; try{ done=LS.get("nl-tour-done")==="1"; welcomed=!!LS.get("nl-welcome-shown"); }catch(e){}
  if(done||!welcomed) return;
  setTimeout(()=>{ if(!user||document.querySelector(".overlay:not(.hidden)")) return; openTour(); },3500);
}

function maybeWelcome(){
  maybeTour();
  if(LS.get("nl-welcome-shown")) return;
  show($("welcomeSheet"));
  LS.set("nl-welcome-shown","1");
}
// one gentle nudge per account per device, a little after signing in
async function recoveryNudge(){
  if(!user||offlineMode) return; try{ if(LS.get("nl-rc-nudged-"+user.id)) return; }catch(e){ return; }
  try{ if(await api.myRecoveryCodeDate()) { LS.set("nl-rc-nudged-"+user.id,"1"); return; } }catch(e){ return; }
  LS.set("nl-rc-nudged-"+user.id,"1");
  toast("🛟 Never get locked out","Make a recovery code so you can reset your password without email. Tap here.",openRecovery);
}
// Change password while signed in (reuses the reset screen). Handy when reset emails can't be sent.
$("openChangePass").onclick=()=>{ show($("profile"),false); say("recMsg",""); $("newPass").value=""; show($("recover")); setTimeout(()=>$("newPass").focus(),50); };
$("recover").addEventListener("click",e=>{ if(e.target.id==="recover") show($("recover"),false); });
$("recoverForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const pw=$("newPass").value; if(pw.length<6) return say("recMsg","Password needs at least 6 characters.",true);
  $("savePass").disabled=true; say("recMsg","Saving…");
  try{ await api.updatePassword(pw); $("newPass").value=""; say("recMsg","Password saved."); setTimeout(()=>show($("recover"),false),900); }
  catch(err){ say("recMsg",err.message,true); }
  finally{ $("savePass").disabled=false; }
});

