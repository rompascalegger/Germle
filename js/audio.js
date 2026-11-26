/* ==========================================================================
   Germle – Synthetisierte Töne (WebAudio, keine Dateien)
   ========================================================================== */
'use strict';

const Sfx = (() => {
  let ctx = null, master = null, on = true, sirenNodes = null;

  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, { type = 'sine', vol = 0.5, at = 0, slide = 0 } = {}) {
    if (!on || !ac()) return;
    const t0 = ctx.currentTime + at;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  function noise(dur, { vol = 0.4, at = 0, freq = 1800 } = {}) {
    if (!on || !ac()) return;
    const t0 = ctx.currentTime + at;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
    g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0);
  }

  const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];

  return {
    get on() { return on; },
    set on(v) { on = !!v; if (!on) this.stopSiren(); },
    unlock() { ac(); },
    click() { tone(900, 0.05, { type: 'triangle', vol: 0.2 }); },
    drip() { tone(1200, 0.12, { type: 'sine', vol: 0.3, slide: -700 }); },
    near(step = 0) { tone(notes[Math.min(step, 7)], 0.12, { type: 'triangle', vol: 0.25 }); },
    wrong() { tone(160, 0.25, { type: 'sawtooth', vol: 0.18, slide: -60 }); noise(0.12, { vol: 0.15, freq: 400 }); },
    crack() { noise(0.25, { vol: 0.5, freq: 3200 }); tone(90, 0.3, { type: 'square', vol: 0.12, slide: -40 }); },
    grow() { tone(220, 0.35, { type: 'sine', vol: 0.15, slide: 120 }); },
    win(rarity = 1) {
      const seq = [0, 2, 4, 5 + Math.min(rarity, 2)];
      seq.forEach((n, i) => tone(notes[n], 0.22, { type: 'triangle', vol: 0.32, at: i * 0.09 }));
      if (rarity >= 4) [7, 5, 7].forEach((n, i) => tone(notes[n] * 2, 0.3, { type: 'sine', vol: 0.18, at: 0.4 + i * 0.12 }));
    },
    coin() { tone(1318, 0.08, { type: 'square', vol: 0.12 }); tone(1760, 0.18, { type: 'square', vol: 0.12, at: 0.07 }); },
    level() { [0, 2, 4, 7].forEach((n, i) => tone(notes[n], 0.3, { type: 'sawtooth', vol: 0.12, at: i * 0.11 })); },
    siren() {
      if (!on || !ac() || sirenNodes) return;
      const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 780;
      lfo.type = 'triangle'; lfo.frequency.value = 0.9; lg.gain.value = 320;
      lfo.connect(lg); lg.connect(o.frequency);
      g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.2);
      o.connect(g); g.connect(master);
      o.start(); lfo.start();
      sirenNodes = { o, lfo, g };
      noise(0.6, { vol: 0.7, freq: 2500 });
    },
    stopSiren() {
      if (!sirenNodes || !ctx) return;
      const { o, lfo, g } = sirenNodes;
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      o.stop(ctx.currentTime + 0.35); lfo.stop(ctx.currentTime + 0.35);
      sirenNodes = null;
    },
  };
})();
