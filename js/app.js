/* One Lick at a Time — app controller */
(function(){
  const LICKS = window.OLAT_LICKS;
  const engine = new PluckEngine();
  const $ = s=>document.querySelector(s);
  const store = {
    get(k,d){ try{ return JSON.parse(localStorage.getItem("olat."+k)) ?? d; }catch(e){ return d; } },
    set(k,v){ try{ localStorage.setItem("olat."+k, JSON.stringify(v)); }catch(e){} }
  };

  const state = {
    id: LICKS[0].id,
    genre: "All",
    diff: "All",
    mult: 1,
    loop: false,
    learned: new Set(store.get("learned",[])),
    explored: new Set(store.get("explored",[]))
  };
  let tabApi=null, raf=null;

  const genres = ["All", ...Array.from(new Set(LICKS.map(l=>l.genre)))];
  const diffs = ["All","Beginner","Intermediate","Advanced"];

  const idx = id => LICKS.findIndex(l=>l.id===id);
  const lickById = id => LICKS.find(l=>l.id===id);
  function filtered(){
    return LICKS.filter(l=>(state.genre==="All"||l.genre===state.genre)&&(state.diff==="All"||l.difficulty===state.diff));
  }
  function currentLick(){
    let l=lickById(state.id);
    if(!l || !filtered().some(x=>x.id===state.id)){ const f=filtered(); l=f[0]||LICKS[0]; if(l) state.id=l.id; }
    return l;
  }

  /* ---------- filters ---------- */
  function buildFilters(){
    const g=$("#genreFilters"), d=$("#diffFilters");
    g.innerHTML=""; d.innerHTML="";
    genres.forEach(name=>{
      const b=document.createElement("button"); b.className="pill"; b.textContent=name;
      b.setAttribute("aria-pressed", state.genre===name);
      b.onclick=()=>{ state.genre=name; stop(); currentLick(); render(); buildFilters(); };
      g.appendChild(b);
    });
    diffs.forEach(name=>{
      const b=document.createElement("button"); b.className="pill"; b.textContent=name;
      b.setAttribute("aria-pressed", state.diff===name);
      b.onclick=()=>{ state.diff=name; stop(); currentLick(); render(); buildFilters(); };
      d.appendChild(b);
    });
  }

  /* ---------- card ---------- */
  const ICON = {
    play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    stop:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
    loop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    prev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    next:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    dice:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor"/></svg>'
  };

  function render(){
    const l=currentLick();
    state.explored.add(l.id); store.set("explored",[...state.explored]); store.set("last",l.id);
    if(history.replaceState) history.replaceState(null,"", "#"+l.id);

    const num=String(idx(l.id)+1).padStart(2,"0");
    const learned=state.learned.has(l.id);
    const card=$("#card");
    card.classList.remove("flip"); void card.offsetWidth; card.classList.add("flip");
    card.innerHTML=`
      <div class="cardtop">
        <div class="num">${num}</div>
        <div class="titlewrap">
          <h2 class="name">${esc(l.name)}</h2>
          <div class="meta">
            <span class="tag genre">${esc(l.genre)}</span>
            <span class="tag diff-${l.difficulty}">${esc(l.difficulty)}</span>
            <span class="tag">${esc(l.key)}</span>
            <span class="tag">${l.bpm} bpm</span>
          </div>
        </div>
      </div>
      <div class="tabwrap" id="tab"></div>
      <div class="transport">
        <button class="play" id="play" aria-label="Play lick">${ICON.play}</button>
        <div class="tempo">
          <div class="row"><span>Tempo</span><b id="bpmOut">${l.bpm} bpm</b></div>
          <input id="tempo" type="range" min="50" max="130" value="${Math.round(state.mult*100)}" aria-label="Tempo">
        </div>
        <button class="loop" id="loop" aria-pressed="${state.loop}" aria-label="Loop">${ICON.loop}</button>
      </div>
      <div class="section-h">Techniques</div>
      <div class="chips">${l.techniques.map(t=>`<span class="chip">${esc(t)}</span>`).join("")}</div>
      <div class="section-h">How to play it</div>
      <div class="tip">${esc(l.tip)}</div>
      <p class="why"><b>Why it matters.</b> ${esc(l.why)}</p>
      <button class="learn" id="learn" aria-pressed="${learned}">
        ${ICON.check}<span>${learned?"Learned — nice work":"Mark this lick as learned"}</span>
      </button>
    `;
    tabApi = OLAT_renderTab($("#tab"), l);

    $("#play").onclick=togglePlay;
    $("#loop").onclick=()=>{ state.loop=!state.loop; $("#loop").setAttribute("aria-pressed",state.loop); };
    $("#tempo").oninput=e=>{ state.mult=(+e.target.value)/100; $("#bpmOut").textContent=Math.round(l.bpm*state.mult)+" bpm"; };
    $("#learn").onclick=()=>{
      if(state.learned.has(l.id)) state.learned.delete(l.id); else state.learned.add(l.id);
      store.set("learned",[...state.learned]); render(); updateProgress();
      if(state.learned.has(l.id)) toast("🔥 Lick learned! Keep the streak going.");
    };

    // deck nav enable/disable within filtered set
    const f=filtered(); const pos=f.findIndex(x=>x.id===l.id);
    $("#prev").disabled = pos<=0;
    $("#next").disabled = pos>=f.length-1;

    updateProgress();
  }

  function esc(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

  /* ---------- playback ---------- */
  function togglePlay(){ if(engine.playing) stop(); else play(); }
  function play(){
    engine.resume(); // may return a promise; scheduling uses currentTime after
    const go=()=>schedule();
    const p=engine.resume(); if(p&&p.then) p.then(go); else go();
  }
  function schedule(){
    stop(true);
    const l=currentLick();
    const bpm=l.bpm*state.mult, spb=60/bpm;
    const t0=engine.ctx.currentTime+0.09;
    let beat=0, prevFreq=null; const times=[];
    l.notes.forEach(ev=>{
      const when=t0+beat*spb, dur=ev.d*spb; times.push(when);
      if(!ev.r && ev.notes){
        ev.notes.forEach(n=>{
          const freq=OLAT_freqOf(n.s,n.f), tags=n.t||[];
          const o={when, dur:dur*0.95};
          if(tags.includes("pm")) o.palm=true;
          if(tags.includes("b")){ o.bend=n.ba||2; if(tags.includes("r")) o.release=true; }
          else if(tags.includes("r")){ o.bend=n.ba||2; o.startBent=true; }
          if(tags.includes("v")) o.vibrato=true;
          if(tags.includes("sl")&&prevFreq) o.slideFrom=prevFreq;
          if(tags.includes("x")){ o.gain=0.4; o.palm=true; o.dur=dur*0.3; }
          else if(tags.includes("h")||tags.includes("p")) o.gain=0.78;
          engine.note(freq,o); prevFreq=freq;
        });
      }
      beat+=ev.d;
    });
    const total=l.notes.reduce((a,e)=>a+e.d,0);
    engine.playing=true; setPlayBtn(true);
    const endT=t0+total*spb+0.15;
    const tick=()=>{
      if(!engine.playing) return;
      const now=engine.ctx.currentTime;
      if(now>=endT){ if(state.loop){ schedule(); return; } stop(); return; }
      let cur=null; for(let i=0;i<times.length;i++){ if(times[i]<=now+0.02) cur=i; else break; }
      if(tabApi) tabApi.highlight(cur);
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
  }
  function stop(silent){
    engine.playing=false;
    if(raf) cancelAnimationFrame(raf), raf=null;
    engine.stopAll();
    if(tabApi) tabApi.highlight(null);
    setPlayBtn(false);
    if(!silent){}
  }
  function setPlayBtn(on){ const b=$("#play"); if(!b) return; b.innerHTML=on?ICON.stop:ICON.play; b.classList.toggle("playing",on); b.setAttribute("aria-label",on?"Stop":"Play lick"); }

  /* ---------- deck nav ---------- */
  function move(dir){
    const f=filtered(); const pos=f.findIndex(x=>x.id===state.id);
    const np=pos+dir; if(np<0||np>=f.length) return;
    stop(); state.id=f[np].id; render();
  }
  function shuffle(){ const f=filtered(); const pool=f.filter(x=>x.id!==state.id); const pick=(pool.length?pool:f)[Math.floor(Math.random()*(pool.length||f.length))]; stop(); state.id=pick.id; render(); }
  function daily(){ const day=Math.floor(Date.now()/864e5); const l=LICKS[day%LICKS.length]; stop(); state.genre="All"; state.diff="All"; buildFilters(); state.id=l.id; render(); toast("Today's lick: "+l.name); window.scrollTo({top:0,behavior:"smooth"}); }

  /* ---------- progress ---------- */
  function updateProgress(){
    const total=LICKS.length, ex=state.explored.size, le=state.learned.size;
    $("#stExplored").textContent=ex;
    $("#stLearned").textContent=le;
    $("#stTotal").textContent=total;
    $("#bar").style.width=Math.round(ex/total*100)+"%";
    const msg = le===total ? "You've learned every lick in the deck — you're a lead machine. ⚡"
      : le>0 ? `${total-le} licks left to master. One at a time.`
      : "Learn your first lick — hit play and dig in.";
    $("#pgline").textContent=msg;
  }

  /* ---------- sharing ---------- */
  function shareURL(){ return location.origin+location.pathname+"#"+state.id; }
  function shareText(){ const l=currentLick(); return `I'm learning "${l.name}" — a ${l.genre} lead lick — on One Lick at a Time ⚡🎸`; }
  function progressText(){ return `I've explored ${state.explored.size} licks (and nailed ${state.learned.size}) learning lead guitar on One Lick at a Time ⚡🎸`; }

  function wireShare(){
    const url=()=>encodeURIComponent(shareURL());
    const txt=()=>encodeURIComponent(shareText());
    const open=u=>window.open(u,"_blank","noopener");
    $("#shNative").style.display = navigator.share ? "" : "none";
    $("#shNative").onclick=()=>{ navigator.share({title:"One Lick at a Time",text:shareText(),url:shareURL()}).catch(()=>{}); };
    $("#shX").onclick=()=>open(`https://twitter.com/intent/tweet?text=${txt()}&url=${url()}`);
    $("#shFb").onclick=()=>open(`https://www.facebook.com/sharer/sharer.php?u=${url()}`);
    $("#shReddit").onclick=()=>open(`https://www.reddit.com/submit?url=${url()}&title=${txt()}`);
    $("#shWa").onclick=()=>open(`https://wa.me/?text=${txt()}%20${url()}`);
    $("#shTg").onclick=()=>open(`https://t.me/share/url?url=${url()}&text=${txt()}`);
    $("#shCopy").onclick=async()=>{ try{ await navigator.clipboard.writeText(shareText()+" "+shareURL()); toast("Link copied — go share it!"); }catch(e){ toast("Couldn't copy automatically."); } };
    $("#shProgress").onclick=async()=>{
      const payload={title:"One Lick at a Time",text:progressText(),url:location.origin+location.pathname};
      if(navigator.share){ navigator.share(payload).catch(()=>{}); }
      else { try{ await navigator.clipboard.writeText(progressText()+" "+payload.url); toast("Progress copied — brag away!"); }catch(e){} }
    };
  }

  /* ---------- toast ---------- */
  let toastT=null;
  function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2600); }

  /* ---------- init ---------- */
  function init(){
    buildFilters();
    // deep link / restart point
    const hash=location.hash.replace("#","");
    if(hash && lickById(hash)) state.id=hash;
    else { const last=store.get("last",null); if(last&&lickById(last)) state.id=last; }
    $("#prev").innerHTML=ICON.prev+"<span>Prev</span>";
    $("#next").innerHTML="<span>Next</span>"+ICON.next;
    $("#shuffle").innerHTML=ICON.dice+"<span>Surprise me</span>";
    $("#prev").onclick=()=>move(-1);
    $("#next").onclick=()=>move(1);
    $("#shuffle").onclick=shuffle;
    $("#daily").onclick=daily;
    wireShare();
    render();
    window.addEventListener("hashchange",()=>{ const h=location.hash.replace("#",""); if(h&&lickById(h)&&h!==state.id){ stop(); state.id=h; state.genre="All"; state.diff="All"; buildFilters(); render(); }});
    document.addEventListener("keydown",e=>{ if(e.target.tagName==="INPUT")return; if(e.code==="Space"){e.preventDefault();togglePlay();} if(e.key==="ArrowRight")move(1); if(e.key==="ArrowLeft")move(-1); });
    // service worker (ignored gracefully where unsupported)
    if("serviceWorker" in navigator){ window.addEventListener("load",()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); }); }
  }

  document.addEventListener("DOMContentLoaded",init);
})();
