/* ==========================================================================
   Germle – Petrischale (Canvas) und Mikroskop-Ansicht
   ========================================================================== */
'use strict';

const Dish = (() => {
  const W = 420, C = W / 2, RIM = 196, AGAR = 182;
  let cv, cx, dpr = 1;
  let st = { seed: 1, color: '#7be3a0', growth: 0, cracks: 0, tests: [], mode: 'idle' };
  let shown = 0, colonies = [], crackPaths = [], wigglers = [], t0 = performance.now(), shake = 0, raf = 0;

  function prng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function build(seed) {
    const r = prng(seed);
    colonies = [];
    const centers = Array.from({ length: 4 }, () => {
      const a = r() * Math.PI * 2, d = r() * 70;
      return [C + Math.cos(a) * d, C + Math.sin(a) * d];
    });
    for (let i = 0; i < 46; i++) {
      const c = centers[i % centers.length];
      const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * (40 + i * 2.6);
      colonies.push({ x: c[0] + Math.cos(a) * d, y: c[1] + Math.sin(a) * d, r: 5 + r() * 16, ph: r() * 6.28, order: i });
    }
    crackPaths = Array.from({ length: 7 }, () => {
      const a = r() * Math.PI * 2;
      const pts = [];
      let rad = RIM + 2, ang = a;
      const steps = 4 + Math.floor(r() * 5);
      for (let k = 0; k <= steps; k++) {
        pts.push([C + Math.cos(ang) * rad, C + Math.sin(ang) * rad]);
        rad -= 14 + r() * 26; ang += (r() - 0.5) * 0.35;
      }
      return pts;
    });
    wigglers = Array.from({ length: 26 }, () => ({ a: r() * 6.28, d: r() * AGAR * 0.85, s: 0.2 + r() * 0.6, ph: r() * 6.28 }));
  }

  function init(canvas) {
    cv = canvas; cx = cv.getContext('2d');
    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = W * dpr;
    };
    fit(); window.addEventListener('resize', fit);
    build(1);
    loop();
  }

  function set(next) {
    if (next.seed !== undefined && next.seed !== st.seed) { build(next.seed); shown = 0; }
    st = Object.assign({}, st, next);
  }
  const bump = (amt = 10) => { shake = Math.max(shake, amt); };

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const m = v => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f))));
    return `rgb(${m(r)},${m(g)},${m(b)})`;
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    if (document.hidden) return;
    const t = (performance.now() - t0) / 1000;
    const target = st.mode === 'lost' ? 1.45 : st.growth;
    shown += (target - shown) * 0.06;
    shake *= 0.88;

    const g = cx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, W);
    g.save();
    if (shake > 0.3) g.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

    // Schatten & Glasrand
    g.beginPath(); g.arc(C, C + 6, RIM + 6, 0, 7); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
    const glass = g.createRadialGradient(C - 60, C - 70, 20, C, C, RIM + 8);
    glass.addColorStop(0, 'rgba(220,255,250,.20)'); glass.addColorStop(1, 'rgba(150,220,210,.10)');
    g.beginPath(); g.arc(C, C, RIM + 6, 0, 7); g.fillStyle = glass; g.fill();
    g.lineWidth = 3; g.strokeStyle = 'rgba(190,255,240,.55)'; g.stroke();

    // Agar
    const agar = g.createRadialGradient(C - 40, C - 50, 10, C, C, AGAR);
    const lost = st.mode === 'lost';
    agar.addColorStop(0, lost ? '#ffcf8a' : '#f2d38c'); agar.addColorStop(1, lost ? '#c9772f' : '#cf9e4d');
    g.beginPath(); g.arc(C, C, AGAR, 0, 7); g.fillStyle = agar; g.fill();

    g.save();
    g.beginPath(); g.arc(C, C, lost ? W : AGAR, 0, 7); g.clip();

    // Nährboden-Testplättchen
    st.tests.forEach((tt, i) => {
      const a = -Math.PI / 2 + i * (Math.PI * 2 / 7);
      const x = C + Math.cos(a) * 138, y = C + Math.sin(a) * 138;
      if (tt.r !== 'none') {
        const rr = (tt.r === 'strong' ? 30 : 19) + Math.sin(t * 2 + i) * 1.5;
        const hg = g.createRadialGradient(x, y, 4, x, y, rr);
        hg.addColorStop(0, shade(st.color, 0.15)); hg.addColorStop(1, shade(st.color, -0.35));
        g.beginPath(); g.arc(x, y, rr, 0, 7); g.fillStyle = hg; g.globalAlpha = 0.9; g.fill(); g.globalAlpha = 1;
      } else {
        g.beginPath(); g.arc(x, y, 24, 0, 7); g.fillStyle = 'rgba(255,250,230,.35)'; g.fill();
      }
      g.beginPath(); g.arc(x, y, 9, 0, 7); g.fillStyle = '#fffdf6'; g.fill();
      g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.25)'; g.stroke();
      g.fillStyle = '#3a2a10'; g.font = '700 8px JetBrains Mono, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(tt.s.replace('Wirt: ', '').slice(0, 3), x, y + 0.5);
    });

    // Kolonien
    if (st.mode !== 'idle') {
      const n = Math.floor(3 + Math.min(shown, 1.45) * 32);
      for (const c of colonies) {
        if (c.order >= n) break;
        const born = Math.min(1, (n - c.order) / 3);
        const rr = c.r * (0.45 + shown * 0.8) * born + Math.sin(t * 1.6 + c.ph) * 0.8;
        const sx = lost ? C + (c.x - C) * (1 + (shown - 1) * 0.9) : c.x;
        const sy = lost ? C + (c.y - C) * (1 + (shown - 1) * 0.9) : c.y;
        const cg = g.createRadialGradient(sx - rr * 0.3, sy - rr * 0.3, rr * 0.1, sx, sy, rr);
        cg.addColorStop(0, shade(st.color, 0.45)); cg.addColorStop(0.7, st.color); cg.addColorStop(1, shade(st.color, -0.4));
        g.beginPath(); g.arc(sx, sy, Math.max(1, rr), 0, 7); g.fillStyle = cg; g.fill();
      }
      // Wuselnde Zellen
      g.fillStyle = shade(st.color, -0.5);
      wigglers.forEach(w => {
        const a = w.a + t * w.s * 0.3, d = w.d + Math.sin(t * 2 + w.ph) * 6;
        g.globalAlpha = 0.5;
        g.beginPath(); g.ellipse(C + Math.cos(a) * d, C + Math.sin(a) * d, 2.4, 1.2, a * 3, 0, 7); g.fill();
      });
      g.globalAlpha = 1;
    }
    g.restore();

    // Risse
    const nc = lost ? 7 : st.cracks;
    for (let i = 0; i < nc; i++) {
      const p = crackPaths[i];
      g.beginPath(); g.moveTo(p[0][0], p[0][1]);
      for (let k = 1; k < p.length; k++) g.lineTo(p[k][0], p[k][1]);
      g.lineWidth = 3.5; g.strokeStyle = 'rgba(20,10,0,.35)'; g.stroke();
      g.lineWidth = 1.6; g.strokeStyle = 'rgba(235,255,250,.9)'; g.stroke();
    }

    // Glanz
    g.beginPath(); g.arc(C, C, RIM - 8, Math.PI * 1.08, Math.PI * 1.42);
    g.lineWidth = 8; g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,.18)'; g.stroke();

    if (st.mode === 'won') {
      g.beginPath(); g.arc(C, C, RIM + 4, 0, 7);
      g.lineWidth = 6 + Math.sin(t * 4) * 2; g.strokeStyle = 'rgba(120,255,190,.75)'; g.stroke();
    }
    if (lost) {
      g.fillStyle = `rgba(255,30,50,${0.15 + Math.sin(t * 9) * 0.1})`;
      g.fillRect(0, 0, W, W);
    }
    g.restore();
  }

  return { init, set, bump };
})();

/* ---------- Mikroskop: zeigt die Form einer entdeckten Mikrobe ---------- */
const Micro = (() => {
  function draw(canvas, m, color) {
    const s = 160, d = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = s * d; canvas.height = s * d;
    const g = canvas.getContext('2d');
    g.setTransform(d, 0, 0, d, 0, 0);
    let seed = 0; for (const ch of m.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const r = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    // Helle Färbung -> Dunkelfeld, dunkle Färbung -> Hellfeld
    const n = parseInt(color.slice(1), 16);
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    const dark = lum > 0.62;
    const bg = g.createRadialGradient(80, 80, 10, 80, 80, 80);
    bg.addColorStop(0, dark ? '#1c2a2c' : '#f8fbf3'); bg.addColorStop(1, dark ? '#070d0e' : '#b9c9be');
    g.fillStyle = '#05090a'; g.fillRect(0, 0, s, s);
    g.beginPath(); g.arc(80, 80, 76, 0, 7); g.fillStyle = bg; g.fill();
    g.save(); g.beginPath(); g.arc(80, 80, 76, 0, 7); g.clip();
    g.fillStyle = color; g.strokeStyle = color; g.lineCap = 'round';
    const rnd = (a, b) => a + r() * (b - a);
    const N = 9;
    for (let i = 0; i < N; i++) {
      const x = rnd(20, 140), y = rnd(20, 140), a = rnd(0, 6.28);
      g.save(); g.translate(x, y); g.rotate(a);
      shape(g, m.form, rnd, color);
      g.restore();
    }
    g.restore();
    g.beginPath(); g.arc(80, 80, 76, 0, 7); g.lineWidth = 3; g.strokeStyle = '#1b2b2e'; g.stroke();
  }

  function shape(g, form, rnd, color) {
    switch (form) {
      case 'Kokke': g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill(); g.beginPath(); g.arc(11, 1, 6, 0, 7); g.fill(); break;
      case 'Stäbchen': rod(g, 22, 7); break;
      case 'Spirille': g.lineWidth = 3.4; g.beginPath(); for (let x = -16; x <= 16; x++) g.lineTo(x, Math.sin(x / 3) * 5); g.stroke(); break;
      case 'Filament': for (let k = 0; k < 4; k++) { g.save(); g.translate(k * 14 - 21, 0); rod(g, 12, 6); g.restore(); } break;
      case 'Quadrat': g.fillRect(-9, -9, 18, 18); break;
      case 'Hefe': g.beginPath(); g.ellipse(0, 0, 10, 8, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(12, -5, 5, 4, 0, 0, 7); g.fill(); break;
      case 'Hyphe': case 'Plasmodium':
        g.lineWidth = 2.4; g.beginPath(); g.moveTo(-20, 0); g.lineTo(20, 0); g.moveTo(-5, 0); g.lineTo(4, -12); g.moveTo(8, 0); g.lineTo(16, 11); g.stroke();
        g.beginPath(); g.arc(4, -14, 3.5, 0, 7); g.fill(); break;
      case 'Fruchtkörper': g.beginPath(); g.ellipse(0, -4, 14, 8, 0, Math.PI, 0); g.fill(); g.fillRect(-3, -4, 6, 14); break;
      case 'Spore': g.beginPath(); g.ellipse(0, 0, 7, 5, 0, 0, 7); g.fill(); g.lineWidth = 1.5; g.beginPath(); g.moveTo(7, 0); g.quadraticCurveTo(14, 4, 20, -2); g.stroke(); break;
      case 'Flechte': for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(Math.cos(k * 1.25) * 7, Math.sin(k * 1.25) * 7, 5, 0, 7); g.fill(); } break;
      case 'Kopf-Schwanz':
        poly(g, 6, 7, -9); g.fill(); g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -2); g.lineTo(0, 10); g.stroke();
        g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 10); g.lineTo(-8, 16); g.moveTo(0, 10); g.lineTo(8, 16); g.moveTo(0, 10); g.lineTo(-4, 17); g.moveTo(0, 10); g.lineTo(4, 17); g.stroke(); break;
      case 'Ikosaeder': poly(g, 6, 8, 0); g.fill(); break;
      case 'Riesenkapsid': poly(g, 6, 15, 0); g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.25)'; g.stroke(); break;
      case 'Helikal': case 'Stabkapsid': g.fillRect(-15, -3, 30, 6); break;
      case 'Faden': g.lineWidth = 2; g.beginPath(); g.moveTo(-22, 0); g.bezierCurveTo(-8, -8, 8, 8, 22, 0); g.stroke(); break;
      case 'Hülle': g.beginPath(); g.arc(0, 0, 8, 0, 7); g.fill(); g.lineWidth = 1.4; for (let k = 0; k < 10; k++) { const a = k * 0.628; g.beginPath(); g.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); g.lineTo(Math.cos(a) * 12, Math.sin(a) * 12); g.stroke(); } break;
      case 'Spindel': g.beginPath(); g.ellipse(0, 0, 12, 6, 0, 0, 7); g.fill(); g.lineWidth = 1.2; g.beginPath(); g.moveTo(12, 0); g.lineTo(17, 0); g.stroke(); break;
      case 'Amphore': g.beginPath(); g.ellipse(0, 0, 14, 8, 0, 0, 7); g.fill(); g.fillStyle = '#000'; g.fillRect(12, -2, 4, 4); g.fillStyle = color; break;
      case 'Flasche': g.beginPath(); g.ellipse(-3, 0, 9, 6, 0, 0, 7); g.fill(); g.fillRect(4, -2, 10, 4); break;
      case 'Projektil': g.beginPath(); g.moveTo(-10, -5); g.lineTo(6, -5); g.arc(6, 0, 5, -Math.PI / 2, Math.PI / 2); g.lineTo(-10, 5); g.closePath(); g.fill(); break;
      case 'Kapsidlos': g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, 0, 10, 5, 0, 0, 7); g.stroke(); break;
      default: g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill();
    }
  }
  function rod(g, len, w) {
    g.beginPath(); g.moveTo(-len / 2 + w / 2, -w / 2); g.lineTo(len / 2 - w / 2, -w / 2);
    g.arc(len / 2 - w / 2, 0, w / 2, -Math.PI / 2, Math.PI / 2); g.lineTo(-len / 2 + w / 2, w / 2);
    g.arc(-len / 2 + w / 2, 0, w / 2, Math.PI / 2, Math.PI * 1.5); g.fill();
  }
  function poly(g, n, r, oy) {
    g.beginPath();
    for (let k = 0; k < n; k++) { const a = k * Math.PI * 2 / n - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r + oy); }
    g.closePath();
  }
  return { draw };
})();
