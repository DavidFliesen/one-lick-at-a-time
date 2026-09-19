/* One Lick at a Time — string + amp + pedalboard engine.
 * No samples, no impulse files: everything (drive curve, cab, reverb) is
 * generated in the Web Audio graph so it stays fully offline.
 *
 * Signal path (built once):
 *   voices -> INPUT
 *     -> tight highpass          (tames flub)
 *     -> DRIVE gain -> waveshaper (tube-style soft clip, 4x oversample) -> makeup
 *     -> CABINET  (presence peak + two lowpass stages = dark, fizz-free speaker)
 *     -> TONE     (bass shelf / mid peak / treble shelf)
 *     -> compressor (sustain + glue)
 *     -> FX sends: dry + tape delay (filtered feedback) + chorus + reverb
 *     -> master -> brickwall limiter -> destination
 * setAmp(name) reshapes drive/cab/tone/fx for clean | crunch | hi-gain.
 */
(function(){
  const OPEN = {1:329.63, 2:246.94, 3:196.00, 4:146.83, 5:110.00, 6:82.41}; // high E .. low E
  const freqOf = (s,f)=> OPEN[s] * Math.pow(2, f/12);

  // amp voicings — the "knobs" for each pedal/amp stage
  const AMPS = {
    clean:   { drive:1.5,  makeup:0.95, hp:80,  presence:3.5, cabA:5400, cabB:7200, bass:2.5, mid:0,   treble:3,  compTh:-20, compRatio:3,  compAtt:.004, delay:0.09, dtime:0.30, fb:0.22, chorus:0.20, reverb:0.22, bright:0.62 },
    crunch:  { drive:4.5,  makeup:0.62, hp:88,  presence:4.5, cabA:4300, cabB:5400, bass:1.5, mid:3,   treble:2,  compTh:-23, compRatio:4,  compAtt:.003, delay:0.13, dtime:0.26, fb:0.30, chorus:0.06, reverb:0.16, bright:0.66 },
    "hi-gain":{ drive:9.0, makeup:0.42, hp:115, presence:5.5, cabA:3600, cabB:4300, bass:3,   mid:-2,  treble:3.5,compTh:-27, compRatio:6,  compAtt:.002, delay:0.09, dtime:0.24, fb:0.26, chorus:0.0,  reverb:0.12, bright:0.70 }
  };

  const GENRE_AMP = {
    "Jazz":"clean","Folk":"clean","Ambient":"clean","Pop":"clean","Funk":"clean",
    "Blues":"crunch","Blues-Rock":"crunch","Rock":"crunch","Classic Rock":"crunch",
    "Country":"crunch","Surf":"crunch","Rockabilly":"crunch","Reggae":"crunch",
    "Metal":"hi-gain","Hard Rock":"hi-gain","Shred":"hi-gain"
  };
  const ampForGenre = g => AMPS[GENRE_AMP[g]] ? GENRE_AMP[g] : "crunch";

  class PluckEngine{
    constructor(){ this.ctx=null; this.master=null; this.input=null; this.active=[]; this.ampName="crunch"; this.playing=false; this.nodes={}; }

    ensure(){
      if(this.ctx) return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const N = this.nodes;

      // ---- input bus (all voices land here) ----
      const input = ctx.createGain(); input.gain.value = 0.9;

      // ---- amp: tight highpass -> drive -> soft clip -> makeup ----
      const hp = ctx.createBiquadFilter(); hp.type="highpass"; hp.Q.value=0.7;
      const drive = ctx.createGain();
      const shaper = ctx.createWaveShaper();
      shaper.curve = this._driveCurve();
      try{ shaper.oversample = "4x"; }catch(e){}   // 4x oversampling = smooth, analog, not "digital"
      const makeup = ctx.createGain();

      // ---- cabinet: presence bump + two lowpass stages (steep, dark) ----
      const presence = ctx.createBiquadFilter(); presence.type="peaking"; presence.frequency.value=2400; presence.Q.value=1.1;
      const cabA = ctx.createBiquadFilter(); cabA.type="lowpass"; cabA.Q.value=0.7;
      const cabB = ctx.createBiquadFilter(); cabB.type="lowpass"; cabB.Q.value=0.5;

      // ---- tone stack ----
      const bass = ctx.createBiquadFilter(); bass.type="lowshelf"; bass.frequency.value=110;
      const mid  = ctx.createBiquadFilter(); mid.type="peaking";  mid.frequency.value=650; mid.Q.value=0.8;
      const treble = ctx.createBiquadFilter(); treble.type="highshelf"; treble.frequency.value=3200;

      // ---- glue compressor ----
      const comp = ctx.createDynamicsCompressor(); comp.knee.value=22; comp.release.value=0.25;

      const fxIn = ctx.createGain();

      // ---- pedalboard: dry / delay / chorus / reverb ----
      const dry = ctx.createGain(); dry.gain.value=1;

      // tape-ish delay with a darkened feedback loop
      const dSend = ctx.createGain();
      const delay = ctx.createDelay(1.2); delay.delayTime.value=0.26;
      const fbGain = ctx.createGain(); fbGain.gain.value=0.28;
      const fbLP = ctx.createBiquadFilter(); fbLP.type="lowpass"; fbLP.frequency.value=2600;

      // chorus = short delay whose time is wobbled by an LFO
      const cSend = ctx.createGain();
      const chorus = ctx.createDelay(0.05); chorus.delayTime.value=0.022;
      const lfo = ctx.createOscillator(); lfo.type="sine"; lfo.frequency.value=0.55;
      const lfoGain = ctx.createGain(); lfoGain.gain.value=0.006;

      // reverb (generated impulse — stereo, smooth tail)
      const rSend = ctx.createGain();
      const conv = ctx.createConvolver(); conv.buffer = this._impulse(ctx, 2.0, 2.6);

      const master = ctx.createGain(); master.gain.value=0.72;
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value=-3; limiter.knee.value=0; limiter.ratio.value=20; limiter.attack.value=0.002; limiter.release.value=0.12;

      // ---- wire it up ----
      input.connect(hp); hp.connect(drive); drive.connect(shaper); shaper.connect(makeup);
      makeup.connect(presence); presence.connect(cabA); cabA.connect(cabB);
      cabB.connect(bass); bass.connect(mid); mid.connect(treble); treble.connect(comp);
      comp.connect(fxIn);

      fxIn.connect(dry); dry.connect(master);
      fxIn.connect(dSend); dSend.connect(delay); delay.connect(master);
      delay.connect(fbLP); fbLP.connect(fbGain); fbGain.connect(delay);            // feedback
      fxIn.connect(cSend); cSend.connect(chorus); chorus.connect(master);
      lfo.connect(lfoGain); lfoGain.connect(chorus.delayTime); lfo.start();          // chorus mod
      fxIn.connect(rSend); rSend.connect(conv); conv.connect(master);

      master.connect(limiter); limiter.connect(ctx.destination);

      Object.assign(N, {input,hp,drive,shaper,makeup,presence,cabA,cabB,bass,mid,treble,comp,fxIn,dry,dSend,delay,fbGain,fbLP,cSend,chorus,rSend,conv,master,limiter});
      this.ctx=ctx; this.master=master; this.input=input;
      this._applyAmp();
    }

    resume(){ this.ensure(); if(this.ctx.state==="suspended") return this.ctx.resume(); }

    setAmp(name){ if(name && AMPS[name]) this.ampName=name; if(this.ctx) this._applyAmp(); }

    _applyAmp(){
      const a = AMPS[this.ampName] || AMPS.crunch, N=this.nodes, t=this.ctx.currentTime, S=(p,v)=>{ try{ p.setTargetAtTime(v,t,0.02); }catch(e){ p.value=v; } };
      S(N.drive.gain, a.drive); S(N.makeup.gain, a.makeup);
      S(N.hp.frequency, a.hp);
      S(N.presence.gain, a.presence); S(N.cabA.frequency, a.cabA); S(N.cabB.frequency, a.cabB);
      S(N.bass.gain, a.bass); S(N.mid.gain, a.mid); S(N.treble.gain, a.treble);
      S(N.comp.threshold, a.compTh); S(N.comp.ratio, a.compRatio); S(N.comp.attack, a.compAtt);
      S(N.dSend.gain, a.delay); S(N.delay.delayTime, a.dtime); S(N.fbGain.gain, a.fb);
      S(N.cSend.gain, a.chorus); S(N.rSend.gain, a.reverb);
      this._bright = a.bright;
    }

    _driveCurve(){
      const n=2048, c=new Float32Array(n), k=2.0;
      for(let i=0;i<n;i++){ const x=i/(n-1)*2-1; c[i]=Math.tanh(k*x); } // smooth soft clip
      return c;
    }

    _impulse(ctx, sec, decay){
      const sr=ctx.sampleRate, len=Math.floor(sr*sec), pre=Math.floor(sr*0.012);
      const buf=ctx.createBuffer(2,len,sr);
      for(let c=0;c<2;c++){ const d=buf.getChannelData(c); let last=0;
        for(let i=0;i<len;i++){
          const t=i<pre?0:(i-pre)/(len-pre);
          const w=(Math.random()*2-1);
          last = 0.5*w + 0.5*last;                       // soften the noise -> less metallic tail
          d[i]= last*Math.pow(1-t, decay);
        } }
      return buf;
    }

    _pluckBuffer(freq, seconds, {decay=0.9955, damp=0.5, bright=0.6}={}){
      const ctx=this.ctx, sr=ctx.sampleRate;
      const N=Math.max(2, Math.round(sr/freq));
      const len=Math.max(1, Math.floor(seconds*sr));
      const buf=ctx.createBuffer(1,len,sr);
      const out=buf.getChannelData(0);
      const line=new Float32Array(N);
      // excitation: filtered noise burst + a short pick transient
      let last=0;
      for(let i=0;i<N;i++){ const w=(Math.random()*2-1); last = bright*w + (1-bright)*last; line[i]=last; }
      const clickN=Math.min(N, Math.max(2, Math.round(sr*0.0016)));
      for(let i=0;i<clickN;i++){ line[i]+= (1 - i/clickN)*0.6; } // attack pick click
      let idx=0;
      for(let i=0;i<len;i++){
        const cur=line[idx];
        const nxt=line[(idx+1)%N];
        out[i]=cur;
        line[idx]=(cur*damp + nxt*(1-damp))*decay;
        idx=(idx+1)%N;
      }
      const att=Math.min(len, Math.floor(sr*0.002));
      const rel=Math.min(len, Math.floor(sr*0.03));
      for(let i=0;i<att;i++) out[i]*=i/att;
      for(let i=0;i<rel;i++) out[len-1-i]*=i/rel;
      return buf;
    }

    // schedule one note; opts: {when,dur,bend(semi),release,startBent,vibrato,slideFrom(freq),palm,gain}
    note(freq, opts={}){
      const ctx=this.ctx; if(!ctx) return;
      const when=opts.when ?? ctx.currentTime;
      let dur=opts.dur ?? .4;
      const palm=!!opts.palm;
      const decay = palm?0.986:0.9968;                    // slightly longer sustain; amp/comp lifts the tail
      const bufSec = palm? Math.min(dur,0.18) : dur+0.35;
      const bright = palm?0.72:(this._bright||0.64);
      const buf=this._pluckBuffer(freq, bufSec, {decay, damp: palm?0.35:0.5, bright});
      const src=ctx.createBufferSource(); src.buffer=buf;
      try{ src.detune.value=(Math.random()*2-1)*4; }catch(e){}   // a few cents of life
      const g=ctx.createGain();
      let vol=(opts.gain ?? 0.9); if(palm) vol*=0.7;
      g.gain.setValueAtTime(vol, when);

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

      src.connect(g); g.connect(this.input);
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
  window.OLAT_ampForGenre = ampForGenre;
})();
