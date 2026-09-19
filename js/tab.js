/* Renders a lick's events into an interactive 6-string tab grid. */
(function(){
  const LABELS = ["e","B","G","D","A","E"]; // string 1..6 top to bottom
  const GLYPH = { b:"b", r:"r", sl:"/", v:"~", h:"h", p:"p", x:"x" };

  function cellText(note){
    if(note.f===undefined) return "";
    let t = String(note.f);
    if(note.t){
      for(const tag of note.t){ if(GLYPH[tag] && tag!=="pm") { t += GLYPH[tag]; } }
    }
    return t;
  }

  function render(container, lick){
    container.innerHTML="";
    const grid=document.createElement("div");
    grid.className="tabgrid";
    const labelGrid=document.createElement("div");
    labelGrid.className="tabgrid lbl";

    // label column
    for(let s=1;s<=6;s++){
      const c=document.createElement("div");
      c.className="cell lbl-c";
      c.textContent=LABELS[s-1];
      labelGrid.appendChild(c);
    }
    container.appendChild(labelGrid);

    // event columns
    lick.notes.forEach((ev,ei)=>{
      const byString={};
      if(!ev.r && ev.notes) ev.notes.forEach(n=> byString[n.s]=n);
      for(let s=1;s<=6;s++){
        const c=document.createElement("div");
        c.className="cell"; c.dataset.ev=ei;
        const n=byString[s];
        const span=document.createElement("span");
        span.className="fret";
        if(ev.r && s===3){ c.classList.add("rest"); span.textContent="·"; }
        else if(n){ span.textContent=cellText(n); }
        else { span.textContent=""; span.style.background="transparent"; }
        c.appendChild(span);
        grid.appendChild(c);
      }
    });
    container.appendChild(grid);
    return { highlight(ei){
      container.querySelectorAll(".cell.on").forEach(c=>c.classList.remove("on"));
      if(ei==null) return;
      container.querySelectorAll('.cell[data-ev="'+ei+'"]').forEach(c=>{
        if(c.querySelector(".fret") && c.querySelector(".fret").textContent) c.classList.add("on");
      });
      // keep active column in view
      const first=container.querySelector('.cell[data-ev="'+ei+'"]');
      if(first) first.scrollIntoView({inline:"center", block:"nearest", behavior:"smooth"});
    }};
  }

  window.OLAT_renderTab = render;
})();
