/* ===== Name Styles (2026.10.22a) =====
   Step 1: the catalog, who can wear what, saving, and the >_ CREATOR tag.
   Your picks are saved inside your profile theme as theme.ns = {font, plate, wrap, deco, fx, blend},
   so everyone who can see your profile sees your style.
   tier: "free" · {level:n} (Level road) · "plus" (NightLane+)
   ⚠️ If you change which items are "plus", update the list in name-styles.sql too. */

const NS_CATALOG={
  font:[
    {id:"default",   label:"Default",     tier:"free"},
    {id:"arcade",    label:"Arcade",      tier:{level:2}},
    {id:"terminal",  label:"Terminal",    tier:{level:3}},
    {id:"racer",     label:"Racer",       tier:{level:4}},
    {id:"comic",     label:"Comic",       tier:{level:5}},
    {id:"billboard", label:"Billboard",   tier:{level:6}},
    {id:"marker",    label:"Marker",      tier:{level:7}},
    {id:"script",    label:"Script",      tier:{level:9}},
    {id:"creep",     label:"Creep",       tier:{level:11}},
    {id:"prism",     label:"Prism",       tier:{level:13}},
    {id:"headbang",  label:"Head Bang",   tier:{level:15}},
    {id:"prismflow", label:"Prism Flow",  tier:"plus"},
    {id:"fireice",   label:"Fire & Ice",  tier:"plus"},
    {id:"neontube",  label:"Neon Tube",   tier:"plus"},
    {id:"glitch",    label:"Glitch",      tier:"plus"},
  ],
  plate:[
    {id:"none",       label:"None",             tier:"free"},
    {id:"moonstars",  label:"Moon & Stars",     tier:"free"},
    {id:"neonstrip",  label:"Neon Strip",       tier:{level:3}},
    {id:"nightrain",  label:"Night Rain",       tier:{level:5}},
    {id:"citylights", label:"City Lights",      tier:{level:7}},
    {id:"burningcity",label:"Burning City",     tier:{level:8}},
    {id:"glitchbar",  label:"Glitch Bar",       tier:{level:9}},
    {id:"synthwave",  label:"Synthwave Sunset", tier:{level:12}},
    {id:"northern",   label:"Northern Lights",  tier:{level:12}},
    {id:"eclipse",    label:"Eclipse",          tier:{level:14}},
    {id:"holofoil",   label:"Holo Foil",        tier:"plus"},
    {id:"datastream", label:"Data Stream",      tier:"plus"},
    {id:"snowfox",    label:"Snow Fox",         tier:"plus"},
    {id:"olympus",    label:"Olympus",          tier:"plus"},
  ],
  wrap:[
    {id:"none",      label:"None",         tier:"free"},
    {id:"circuit",   label:"Circuit Edge", tier:{level:4}},
    {id:"hazard",    label:"Hazard Tape",  tier:{level:6}},
    {id:"neonpulse", label:"Neon Pulse",   tier:{level:10}},
    {id:"starfield", label:"Starfield",    tier:"plus"},
    {id:"electric",  label:"Electric",     tier:"plus"},
  ],
  deco:[
    {id:"none",          label:"None",            tier:"free"},
    {id:"mooncloud",     label:"Moon Cloud",      tier:"free"},
    {id:"constellation", label:"Constellation",   tier:"free"},
    {id:"soulfire",      label:"Soul Fire",       tier:{level:5}},
    {id:"nightbloom",    label:"Night Bloom",     tier:"plus"},
    {id:"planet",        label:"Planet",          tier:"plus"},
    {id:"heartchain",    label:"Heart Chain",     tier:"plus"},
    {id:"snowfox",       label:"Snow Fox",        tier:"plus"},
    {id:"eclipse",       label:"Eclipse",         tier:"plus"},
    {id:"tarot",         label:"Celestial Tarot", tier:"plus"},
    {id:"breach",        label:"Neon Breach",     tier:"plus"},
  ],
  fx:[
    {id:"none",      label:"None",            tier:"free"},
    {id:"starfall",  label:"Starfall",        tier:{level:7}},
    {id:"soulcrown", label:"Soul Fire Crown", tier:{level:9}},
    {id:"tarot",     label:"Celestial Tarot", tier:"plus"},
    {id:"breach",    label:"Neon Breach",     tier:"plus"},
    {id:"synthrise", label:"Synth Rise",      tier:"plus"},
  ],
};
const NS_BLEND=["blend","deco"];   // frame + decoration: Blend (default) or Decoration only

const nsItem=(type,id)=>(NS_CATALOG[type]||[]).find(x=>x.id===id)||null;
const isCreator=p=>p?.badge==="creator";
const hasPlus=p=>!!(p?.plus||isCreator(p));

/* can *I* wear this? (the creator can wear everything, for testing) */
function nsCanWear(type,id){
  const it=nsItem(type,id); if(!it) return false;
  if(isCreator(meProfile)) return true;
  if(it.tier==="free") return true;
  if(it.tier==="plus") return hasPlus(meProfile);
  if(it.tier.level) return myLevel()>=it.tier.level;
  return false;
}
/* what to show on the lock: "", "LV 8" or "NL+" */
const nsLockLabel=(type,id)=>{ if(nsCanWear(type,id)) return ""; const t=nsItem(type,id)?.tier; return t==="plus"?"NL+":t?.level?"LV "+t.level:""; };

/* ---------- font colour ---------- */
const NS_COLORFUL=["default","arcade","terminal","racer","comic","billboard","marker","script","creep","headbang","neontube","glitch"];   // gradient fonts (Prism, Fire & Ice) keep their own colours
const NS_SWATCHES=["#00F0FF","#FF4FD8","#F3FF3A","#39FF9A","#FF8A3D","#FF3B3B","#9B7BFF","#F4F7FF"];
/* too dark to read on NightLane's night sky? brighten it a little (mix toward white until it reads) */
function nsLum(h){ const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4); return .2126*c[0]+.7152*c[1]+.0722*c[2]; }
function nsReadable(hex){
  const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255), mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn;
  let h=0, l=(mx+mn)/2; const sat=d?d/(1-Math.abs(2*l-1)):0;
  if(d) h=mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4;
  const toHex=L=>{ const c=(1-Math.abs(2*L-1))*sat, x=c*(1-Math.abs(h%2-1)), m=L-c/2;
    const [R,G,B]=h<1?[c,x,0]:h<2?[x,c,0]:h<3?[0,c,x]:h<4?[0,x,c]:h<5?[x,0,c]:[c,0,x];
    return "#"+[R,G,B].map(v=>Math.round((v+m)*255).toString(16).padStart(2,"0")).join(""); };
  let out=hex.toLowerCase();
  while((nsLum(out)+.05)/(.0025+.05)<4.5&&l<.95){ l+=.03; out=toHex(l); }   // keep the hue, just raise the lightness until it reads on the night sky
  return out;
}

/* someone's name style, cleaned up (unknown ids are dropped; NL+ only shows if they have it) */
function nsOf(p){
  const raw=p?.theme?.ns; if(!raw||typeof raw!=="object") return {};
  const out={};
  for(const type of Object.keys(NS_CATALOG)){
    const it=nsItem(type,raw[type]); if(!it||it.id==="none"||it.id==="default") continue;
    if(it.tier==="plus"&&!hasPlus(p)) continue;
    out[type]=it.id;
  }
  out.blend=NS_BLEND.includes(raw.blend)?raw.blend:"blend";
  if(/^#[0-9a-f]{6}$/i.test(raw.color||"")) out.color=nsReadable(raw.color);
  return out;
}

/* save my name style. Pass only what changed, e.g. nsSave({font:"arcade"}) */
async function nsSave(change){
  const before=meProfile?.theme||{};
  const ns={...(before.ns||{}),...change};
  for(const [type,id] of Object.entries(change)){
    if(type==="blend"){ if(!NS_BLEND.includes(id)) throw new Error("Unknown option."); continue; }
    if(type==="color"){ if(id!==null&&!/^#[0-9a-f]{6}$/i.test(id)) throw new Error("That colour didn't work."); continue; }
    if(!nsCanWear(type,id)) throw new Error(nsLockLabel(type,id)==="NL+"?"That one is NightLane+.":"Keep levelling up to unlock that one.");
  }
  const theme={...before,ns};
  meProfile={...meProfile,theme}; cache.set(user.id,meProfile);
  try{ await api.saveStyle(user.id,{theme}); }
  catch(err){ meProfile={...meProfile,theme:before}; cache.set(user.id,meProfile); throw err; }
  paintMe(); if(room){ repaintFaces(user.id); renderAll(false); }
  return ns;
}

/* ---------- the >_ CREATOR tag ---------- */
function creatorTag(small){
  const t=el("span","nl-creator"+(small?" s":"")); t.title="Made NightLane";
  const w=el("span","cr-w","CREATOR"); w.dataset.t="CREATOR";
  t.append(el("span","cr-p",">_"),w,el("i","cr-cur")); t.setAttribute("aria-label","Creator");
  return t;
}
/* add (or remove) the tag after a name element */
function tagName(node,p,small){
  if(!node) return; node.querySelector(":scope > .nl-creator")?.remove();
  if(isCreator(p)&&(small||frameOf(p)!=="creator")) node.append(creatorTag(small));
}

/* write a name into node in a font. Most fonts are just a class; Fire & Ice needs 3 layers (fire, ice, seam) */
function nsFontText(node,text,font,color){
  if(font) node.classList.add("nsf-"+font);
  node.dataset.nsf=font||"";
  if(color&&NS_COLORFUL.includes(font||"default")){ node.style.setProperty("--nsc",color); if(!font) node.style.color=color; }   // no font picked: just colour the normal name
  if(font!=="fireice"){ node.append(text); return node; }
  const fire=el("span","fi-fire"), ice=el("span","fi-ice"), seam=el("span","fi-seam");
  [fire,ice].forEach(l=>l.append(el("span","fi-g",text),el("span","fi-t",text)));   // fi-g = the glow behind, fi-t = the rock / crystal texture
  ice.setAttribute("aria-hidden","true"); seam.setAttribute("aria-hidden","true");
  node.append(fire,ice,seam); return node;
}
/* put someone's name font on a big profile name */
function nsNameFont(node,p){
  if(!node) return;
  node.querySelector(":scope > .ns-nm")?.remove();
  let text=""; while(node.firstChild&&!node.firstChild.classList?.contains("nl-creator")){ text+=node.firstChild.textContent; node.firstChild.remove(); }
  const ns=nsOf(p), f=ns.font; node.prepend(nsFontText(el("span","ns-nm"),text,f,ns.color));
  node.classList.toggle("ns-hasfont",!!(f||ns.color));
}
/* the nameplate strip under a big profile name (nothing if they haven't picked one) */
function nsProfStrip(nameNode,p){
  if(!nameNode||typeof nsPlateStrip!=="function") return;
  const old=nameNode.nextElementSibling; if(old?.classList.contains("nsp-prof")) old.remove();
  const st=nsPlateStrip(p,"@"+(p?.username||"")); if(st){ st.classList.add("nsp-prof"); nameNode.after(st); }
}
/* my own profile, and other people's profiles */
const _nsPaintMe=paintMe;
paintMe=function(){ _nsPaintMe(); nsNameFont($("profName"),meProfile); tagName($("profName"),meProfile); nsProfStrip($("profName"),meProfile); paintNsPicker(); };
const _nsPaintPerson=paintPerson;
paintPerson=function(){ const r=_nsPaintPerson.apply(this,arguments); nsNameFont($("personName"),cache.get(personUid)); tagName($("personName"),cache.get(personUid)); nsProfStrip($("personName"),cache.get(personUid)); return r; };
const _nsProfTab=profTab;
profTab=function(name){ _nsProfTab(name); if(name==="look") paintNsPicker(); };

/* ---------- Look tab: the Name style picker ---------- */
const NS_TYPES=[["font","Font"],["plate","Nameplate"],["wrap","Wrap"],["deco","Decoration"],["fx","Effect"]];
let nsTab="font";
const NS_BUILT=["font","plate"];   // tabs whose looks are live in the app (add each one as it ships)

function paintNsPicker(){
  const types=$("nsTypes"); types.innerHTML="";
  NS_TYPES.forEach(([type,label])=>{
    const b=el("button","ns-tab"+(type===nsTab?" on":""),label); b.type="button";
    b.setAttribute("role","tab"); b.setAttribute("aria-selected",String(type===nsTab));
    b.onclick=()=>{ nsTab=type; paintNsPicker(); };
    types.append(b);
  });
  const myNs=nsOf(meProfile);
  { const cf=myNs.font||"default", c=$("nsCur"); c.innerHTML=""; c.append(nsFontText(el("span"),meProfile?.username||"you",cf,myNs.color)); }   // the closed box still shows your current font
  const grid=$("nsGrid"); grid.innerHTML="";
  grid.classList.toggle("wide",nsTab==="plate");
  if(!NS_BUILT.includes(nsTab)) grid.append(el("p","ns-soon",`🚧 ${NS_TYPES.find(t=>t[0]===nsTab)[1]}s are still being built. You can pick one now and it'll show up as soon as they land.`));
  const cur=nsOf(meProfile)[nsTab]||NS_CATALOG[nsTab][0].id;
  NS_CATALOG[nsTab].forEach(it=>{
    const lock=nsLockLabel(nsTab,it.id);
    const b=el("button","ns-tile"+(it.id===cur?" on":"")+(lock?" locked":"")); b.type="button";
    if(nsTab==="font") b.append(nsFontText(el("span","ns-pv"),meProfile?.username||"you",it.id,myNs.color));
    if(nsTab==="plate"){ const fake={...meProfile,plus:true,theme:{...(meProfile?.theme||{}),ns:{...(meProfile?.theme?.ns||{}),plate:it.id}}};
      b.append(nsPlateStrip(fake,"online")||nsFontText(el("div","nsp-strip"),meProfile?.username||"you",myNs.font,myNs.color)); }
    b.append(el("span","ns-name",it.label));
    if(lock) b.append(el("span","ns-lock",lock));
    b.onclick=async()=>{
      if(lock){ nlToast("warn",lock==="NL+"?"That one's NightLane+.":`Unlocks at ${lock}.`); return; }
      try{ await nsSave({[nsTab]:it.id}); paintNsPicker(); nlToast("ok","Saved."); }
      catch(err){ nlToast("err",err.message); }
    };
    grid.append(b);
  });
  nsPaintColor(myNs);
}
/* the colour row under the font tiles */
let nsColorDraft=null;   // a custom colour you're still dragging around (not saved yet)
function nsPreviewColor(c){   // recolour every preview in the box without saving
  const rc=nsReadable(c);
  $("nsBox").querySelectorAll("[data-nsf]").forEach(n=>{ if(NS_COLORFUL.includes(n.dataset.nsf||"default")) n.style.setProperty("--nsc",rc); });
}
function nsPaintColor(myNs){
  let row=$("nsColor"); if(!row){ row=el("div","ns-color"); row.id="nsColor"; $("nsGrid").after(row); }
  show(row,nsTab==="font"); if(nsTab!=="font") return;
  if(nsColorDraft){ nsPreviewColor(nsColorDraft); return; }   // mid-pick: don't rebuild the colour wheel under your finger
  row.innerHTML="";
  const raw=meProfile?.theme?.ns?.color||null, font=myNs.font||"default";
  row.append(el("span","lbl","Colour"));
  const pick=async c=>{ nsColorDraft=null; try{ await nsSave({color:c}); paintNsPicker(); nlToast("ok","Saved."); }catch(err){ paintNsPicker(); nlToast("err",err.message); } };
  const def=el("button","ns-sw def"+(raw?"":" on"),"✕"); def.type="button"; def.title="Font's own colour"; def.setAttribute("aria-label","Font's own colour"); def.onclick=()=>pick(null); row.append(def);
  NS_SWATCHES.forEach(c=>{ const b=el("button","ns-sw"+(raw===c?" on":"")); b.type="button"; b.style.setProperty("--c",c); b.setAttribute("aria-label","Colour "+c); b.onclick=()=>pick(c); row.append(b); });
  /* any colour: dragging only previews; nothing saves until you tap SAVE COLOUR */
  const any=el("label","ns-sw any"+(raw&&!NS_SWATCHES.includes(raw)?" on":"")); any.title="Any colour"; const inp=document.createElement("input"); inp.type="color"; inp.value=raw||"#00f0ff"; inp.setAttribute("aria-label","Any colour");
  const bar=el("div","ns-cdraft hidden"), chip=el("i","ns-cchip"), save=el("button","ns-csave","SAVE COLOUR"), undo=el("button","ns-cundo","CANCEL");
  save.type="button"; undo.type="button"; bar.append(chip,save,undo);
  const preview=()=>{ nsColorDraft=inp.value.toLowerCase(); chip.style.background=nsReadable(nsColorDraft); show(bar,true); nsPreviewColor(nsColorDraft); };
  inp.addEventListener("input",preview); inp.addEventListener("change",preview);
  save.onclick=()=>pick(nsColorDraft);
  undo.onclick=()=>{ nsColorDraft=null; paintNsPicker(); };
  any.append(inp); row.append(any,bar);
  if(!NS_COLORFUL.includes(font)) row.append(el("span","ns-cnote",`${nsItem("font",font)?.label} keeps its own colours. Your colour shows on the other fonts.`));
  else if(raw&&nsReadable(raw)!==raw.toLowerCase()) row.append(el("span","ns-cnote","That colour is too dark to read here, so NightLane brightens it a little."));
}

/* the Name style box folds away so the Look tab stays tidy (remembers open/closed on this device) */
{ const box=$("nsBox"); try{ box.open=LS.get("nl-ns-open")==="1"; }catch(e){}
  box.addEventListener("toggle",()=>{ try{ LS.set("nl-ns-open",box.open?"1":"0"); }catch(e){} }); }
