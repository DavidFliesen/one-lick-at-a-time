/* Karplus-Strong plucked-string engine — no samples, fully offline. */
(function(){
  const OPEN = {1:329.63, 2:246.94, 3:196.00, 4:146.83, 5:110.00, 6:82.41}; // high E .. low E
  const freqOf = (s,f)=> OPEN[s] * Math.pow(2, f/12);

  class PluckEngine{
    constructor(){ this.ctx=null; this.master=null; this.active=[]; }
    ensure(){
      if(this.ctx) return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const master = ctx.createGain(); master.gain.value = 0.9;
      const lp = ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=5200; lp.Q.value=0.6;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value=-18; comp.knee.value=24; comp.ratio.value=3; comp.attack.value=.003; comp.release.value=.25;
      // light algorithmic reverb for "room/amp" space
      const conv = ctx.createConvolver(); conv.buffer = this._impulse(ctx, 1.3, 2.4);
      const wet = ctx.createGain(); wet.gain.value=0.16;
      const dry = ctx.createGain(); dry.gain.value=1;
      master.connect(lp); lp.connect(comp);
      comp.connect(dry); dry.connect(ctx.destination);
      comp.connect(conv); conv.connect(wet); wet.connect(ctx.destination);
      this.ctx=ctx; this.master=master;
    }
    resume(){ this.ensure(); if(this.ctx.state==="suspended") return this.ctx.resume(); }
    _impulse(ctx, sec, decay){
      const sr=ctx.sampleRate, len=Math.floor(sr*sec);
      const buf=ctx.createBuffer(2,len,sr);
      for(let c=0;c<2;c++){ const d=buf.getChannelData(c);
        for(let i=0;i<len;i++){ d[i]=(Math.random()*2-1)*Math.pow(1-i/len, decay); } }
      return buf;
    }
    _pluckBuffer(freq, seconds, {decay=0.9955, damp=0.5, bright=0.5}={}){
      const ctx=this.ctx, sr=ctx.sampleRate;
      const N=Math.max(2, Math.round(sr/freq));
      const len=Math.max(1, Math.floor(seconds*sr));
      const buf=ctx.createBuffer(1,len,sr);
      const out=buf.getChannelData(0);
      const line=new Float32Array(N);
      // noise burst, lightly low-passed for warmth
      let last=0;
      for(let i=0;i<N;i++){ const w=(Math.random()*2-1); last = bright*w + (1-bright)*last; line[i]=last; }
      let idx=0;
      for(let i=0;i<len;i++){
        const cur=line[idx];
        const nxt=line[(idx+1)%N];
        out[i]=cur;
        line[idx]=(cur*damp + nxt*(1-damp))*decay;
        idx=(idx+1)%N;
      }
      // attack + release envelope
      const att=Math.min(len, Math.floor(sr*0.002));
      const rel=Math.min(len, Math.floor(sr*0.03));
      for(let i=0;i<att;i++) out[i]*=i/att;
      for(let i=0;i<rel;i++) out[len-1-i]*=i/rel;
      return buf;
    }
    // schedule a single note; opts: {when, dur, bend(semi), vibrato(bool), slideFrom(freq), palm(bool), gain}
    note(freq, opts={}){
      const ctx=this.ctx; if(!ctx) return;
      const when=opts.when ?? ctx.currentTime;
      let dur=opts.dur ?? .4;
      const palm=!!opts.palm;
      const decay = palm?0.986:0.9955;
      const bufSec = palm? Math.min(dur,0.18) : dur+0.25;
      const buf=this._pluckBuffer(freq, bufSec, {decay, damp: palm?0.35:0.5, bright: palm?0.7:0.5});
      const src=ctx.createBufferSource(); src.buffer=buf;
      const g=ctx.createGain();
      let vol=(opts.gain ?? 0.9); if(palm) vol*=0.7;
      g.gain.setValueAtTime(vol, when);
      // pitch automation
      const pr=src.playbackRate;
      if(opts.slideFrom){ pr.setValueAtTime(opts.slideFrom/freq, when); pr.linearRampToValueAtTime(1, when+Math.min(dur*0.5,0.14)); }
      else pr.setValueAtTime(1, when);
      if(opts.bend){
        const tgt=Math.pow(2, opts.bend/12);
        if(opts.startBent){
          pr.setValueAtTime(tgt, when);
          pr.linearRampToValueAtTime(1, when+Math.min(dur*0.6,dur));
        } else {
          pr.setValueAtTime(1, when);
          pr.linearRampToValueAtTime(tgt, when+Math.min(dur*0.45,0.5));
          if(opts.release) pr.linearRampToValueAtTime(1, when+Math.min(dur*0.85,dur));
        }
      }
      if(opts.vibrato){
        const steps=24, span=Math.max(0.12, dur), base=pr.value||1;
        const start=when+Math.min(0.12,dur*0.3);
        const curve=new Float32Array(steps+1);
        for(let i=0;i<=steps;i++) curve[i]=base*(1+0.028*Math.sin(i/steps*Math.PI*2*Math.max(2,span*5)));
        try{ pr.setValueCurveAtTime(curve, start, Math.max(0.12, span-0.12)); }catch(e){}
      }
      src.connect(g); g.connect(this.master);
      src.start(when);
      src.stop(when+bufSec+0.05);
      this.active.push(src);
      src.onended=()=>{ const i=this.active.indexOf(src); if(i>=0) this.active.splice(i,1); };
      return src;
    }
    stopAll(){ this.active.slice().forEach(s=>{ try{s.stop();}catch(e){} }); this.active.length=0; }
  }

  window.PluckEngine = PluckEngine;
  window.OLAT_freqOf = freqOf;
})();
