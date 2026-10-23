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
  return out;
}

/* save my name style. Pass only what changed, e.g. nsSave({font:"arcade"}) */
async function nsSave(change){
  const before=meProfile?.theme||{};
  const ns={...(before.ns||{}),...change};
  for(const [type,id] of Object.entries(change)){
    if(type==="blend"){ if(!NS_BLEND.includes(id)) throw new Error("Unknown option."); continue; }
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

/* put someone's name font on a big profile name */
function nsNameFont(node,p){
  if(!node) return;
  const s=el("span","ns-nm"); while(node.firstChild&&!node.firstChild.classList?.contains("nl-creator")) s.append(node.firstChild);
  node.querySelector(":scope > .ns-nm")?.remove(); node.prepend(s);
  const f=nsOf(p).font; if(f) s.classList.add("nsf-"+f);
  node.classList.toggle("ns-hasfont",!!f);
}
/* my own profile, and other people's profiles */
const _nsPaintMe=paintMe;
paintMe=function(){ _nsPaintMe(); nsNameFont($("profName"),meProfile); tagName($("profName"),meProfile); paintNsPicker(); };
const _nsPaintPerson=paintPerson;
paintPerson=function(){ const r=_nsPaintPerson.apply(this,arguments); nsNameFont($("personName"),cache.get(personUid)); tagName($("personName"),cache.get(personUid)); return r; };
const _nsProfTab=profTab;
profTab=function(name){ _nsProfTab(name); if(name==="look") paintNsPicker(); };

/* ---------- Look tab: the Name style picker ---------- */
const NS_TYPES=[["font","Font"],["plate","Nameplate"],["wrap","Wrap"],["deco","Decoration"],["fx","Effect"]];
let nsTab="font";

function paintNsPicker(){
  const types=$("nsTypes"); types.innerHTML="";
  NS_TYPES.forEach(([type,label])=>{
    const b=el("button","ns-tab"+(type===nsTab?" on":""),label); b.type="button";
    b.setAttribute("role","tab"); b.setAttribute("aria-selected",String(type===nsTab));
    b.onclick=()=>{ nsTab=type; paintNsPicker(); };
    types.append(b);
  });
  { const cf=nsOf(meProfile).font||"default", c=$("nsCur"); c.innerHTML=""; c.append(el("span","nsf-"+cf,meProfile?.username||"you")); }   // the closed box still shows your current font
  const grid=$("nsGrid"); grid.innerHTML="";
  const cur=nsOf(meProfile)[nsTab]||NS_CATALOG[nsTab][0].id;
  NS_CATALOG[nsTab].forEach(it=>{
    const lock=nsLockLabel(nsTab,it.id);
    const b=el("button","ns-tile"+(it.id===cur?" on":"")+(lock?" locked":"")); b.type="button";
    if(nsTab==="font") b.append(el("span","ns-pv nsf-"+it.id,meProfile?.username||"you"));
    b.append(el("span","ns-name",it.label));
    if(lock) b.append(el("span","ns-lock",lock));
    b.onclick=async()=>{
      if(lock){ nlToast("warn",lock==="NL+"?"That one's NightLane+.":`Unlocks at ${lock}.`); return; }
      try{ await nsSave({[nsTab]:it.id}); paintNsPicker(); nlToast("ok","Saved."); }
      catch(err){ nlToast("err",err.message); }
    };
    grid.append(b);
  });
}

/* the Name style box folds away so the Look tab stays tidy (remembers open/closed on this device) */
{ const box=$("nsBox"); try{ box.open=LS.get("nl-ns-open")==="1"; }catch(e){}
  box.addEventListener("toggle",()=>{ try{ LS.set("nl-ns-open",box.open?"1":"0"); }catch(e){} }); }
