/* ==========================================================================
   Germle – Spiellogik (ohne DOM)
   ========================================================================== */
'use strict';

const Germle = (() => {
  const D = GERMLE_DATA;

  /* Alle Balancing-Werte an einem Ort */
  const CFG = {
    SAMPLES_PER_DAY: 3,     // 3 Proben pro Tag
    INTEGRITY: 7,           // Aktionen bis zum Biohazard
    TOKEN_EVERY: 5,         // Entdeckungen bis zur Gratisprobe
    TOKEN_MAX: 3,
    STREAK_TOKEN_EVERY: 3,  // alle 3 Tage Streak = Gratisprobe
    HINT_TYPE_AT: 3,        // nach 3 Aktionen wird der Typ verraten
    HINT_LETTER_AT: 5,      // nach 5 Aktionen der Anfangsbuchstabe
    XP_PER_INTEGRITY: 4,
    GUILD_BONUS: 30,
    GROUP_BONUS: 150,
    SAVE_KEY: 'germle_v1',
  };

  const TITLES = ['Praktikant:in', 'Laborant:in', 'Assistent:in', 'Mikrobiolog:in', 'Virolog:in',
    'Mykolog:in', 'Doktorand:in', 'Postdoc', 'Laborleitung', 'Professor:in', 'Institutsleitung',
    'Nobelpreisträger:in'];

  const byId = Object.fromEntries(D.MICROBES.map(m => [m.id, m]));

  /* ---------- Zeit & Zufall ---------- */
  const pad = n => String(n).padStart(2, '0');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const prevDayKey = key => {
    const [y, m, d] = key.split('-').map(Number);
    return dayKey(new Date(y, m - 1, d - 1));
  };
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- Spielstand ---------- */
  const fresh = () => ({
    v: 1, xp: 0, tokens: 0, meter: 0, streak: 0, best: 0, lastPlay: null,
    discovered: {}, escaped: {}, guildsDone: {}, groupsDone: {},
    stats: { wins: 0, losses: 0, perfect: 0 },
    day: null, sound: true, seenHelp: false,
  });
  let S = load();

  function load() {
    try {
      const raw = localStorage.getItem(CFG.SAVE_KEY);
      if (raw) return Object.assign(fresh(), JSON.parse(raw));
    } catch (e) { /* defekter Spielstand -> neu */ }
    return fresh();
  }
  function save() {
    try { localStorage.setItem(CFG.SAVE_KEY, JSON.stringify(S)); } catch (e) { /* privat-Modus */ }
  }

  function ensureDay() {
    const today = dayKey();
    if (!S.day || S.day.date !== today) {
      // Läuft noch eine Probe von gestern, wird sie in den neuen Tag mitgenommen (kostet nichts).
      const open = S.day && S.day.runs.find(r => r.status === 'active');
      S.day = { date: today, used: 0, runs: open ? [Object.assign(open, { carried: true })] : [] };
      save();
    }
    return S.day;
  }

  const current = () => {
    const d = ensureDay();
    const r = d.runs[d.runs.length - 1];
    return r && r.status === 'active' ? r : null;
  };
  const samplesLeft = () => Math.max(0, CFG.SAMPLES_PER_DAY - ensureDay().used);
  const canStart = () => !current() && (samplesLeft() > 0 || S.tokens > 0);

  /* ---------- Probe ziehen (gewichtet nach Seltenheit) ---------- */
  function pickTarget(seedStr) {
    const r = rng(hash(seedStr));
    const taken = new Set(ensureDay().runs.map(x => x.target));
    let pool = D.MICROBES.filter(m => !S.discovered[m.id] && !taken.has(m.id));
    if (!pool.length) pool = D.MICROBES.filter(m => !taken.has(m.id));
    if (!pool.length) pool = D.MICROBES;
    const total = pool.reduce((s, m) => s + D.RARITY[m.rarity].weight, 0);
    let x = r() * total;
    for (const m of pool) { x -= D.RARITY[m.rarity].weight; if (x <= 0) return m; }
    return pool[pool.length - 1];
  }

  function startSample() {
    if (!canStart()) return null;
    const day = ensureDay();
    const bonus = samplesLeft() === 0;
    if (bonus) S.tokens--; else day.used++;
    const idx = day.runs.length;
    const t = pickTarget(`${day.date}#${idx}#${Object.keys(S.discovered).length}`);
    const run = { target: t.id, status: 'active', integ: CFG.INTEGRITY, actions: [], bonus, idx };
    day.runs.push(run);
    save();
    return run;
  }

  /* ---------- Vergleich ---------- */
  function compare(g, t) {
    const cell = (hit, near, extra) => ({ s: hit ? 'hit' : near ? 'near' : 'miss', ...extra });
    const prok = c => c === 'B' || c === 'A';
    const oi = D.OXYGEN.indexOf(g.oxygen), ot = D.OXYGEN.indexOf(t.oxygen);
    const ti = D.TEMPS.indexOf(g.temp), tt = D.TEMPS.indexOf(t.temp);
    return {
      type: cell(g.typeCode === t.typeCode, prok(g.typeCode) && prok(t.typeCode)),
      guild: cell(g.guild === t.guild, g.guildGroup === t.guildGroup),
      substrate: cell(g.substrate === t.substrate, g.substrateGroup === t.substrateGroup),
      oxygen: cell(g.oxygen === t.oxygen, oi >= 0 && ot >= 0 && Math.abs(oi - ot) === 1),
      temp: cell(g.temp === t.temp, Math.abs(ti - tt) === 1, { dir: tt > ti ? 'up' : tt < ti ? 'down' : '' }),
      habitat: cell(g.habitat === t.habitat, g.habitatGroup === t.habitatGroup),
      form: cell(g.form === t.form, g.formGroup === t.formGroup),
    };
  }

  function testResult(substrate, t) {
    if (substrate === t.substrate) return 'strong';
    if (D.SUBSTRATES[substrate] === t.substrateGroup) return 'weak';
    return 'none';
  }

  /* ---------- Aktionen ---------- */
  function guess(id) {
    const run = current();
    const g = byId[id];
    if (!run || !g) return null;
    if (run.actions.some(a => a.k === 'g' && a.id === id)) return { dup: true };
    const t = byId[run.target];
    const cmp = compare(g, t);
    run.actions.push({ k: 'g', id });
    if (g.id === t.id) return { cmp, ...finish(run, true) };
    run.integ--;
    const res = { cmp, wrong: true };
    if (run.integ <= 0) Object.assign(res, finish(run, false));
    save();
    return res;
  }

  function test(substrate) {
    const run = current();
    if (!run || !D.SUBSTRATES[substrate]) return null;
    if (run.actions.some(a => a.k === 't' && a.s === substrate)) return { dup: true };
    const t = byId[run.target];
    const result = testResult(substrate, t);
    run.actions.push({ k: 't', s: substrate, r: result });
    run.integ--;
    const res = { result };
    if (run.integ <= 0) Object.assign(res, finish(run, false));
    save();
    return res;
  }

  function finish(run, won) {
    const t = byId[run.target];
    run.status = won ? 'won' : 'lost';
    const out = { won, target: t, rewards: [] };
    bumpStreak(out);
    if (won) {
      const isNew = !S.discovered[t.id];
      const nGuesses = run.actions.length;
      let xp = D.RARITY[t.rarity].xp + run.integ * CFG.XP_PER_INTEGRITY;
      if (nGuesses === 1) { xp *= 2; S.stats.perfect++; out.perfect = true; }
      if (!isNew) xp = Math.round(xp / 2);
      out.isNew = isNew;
      out.xp = xp;
      S.stats.wins++;
      if (isNew) {
        S.discovered[t.id] = { d: ensureDay().date, n: nGuesses };
        delete S.escaped[t.id];
        S.meter++;
        if (S.meter >= CFG.TOKEN_EVERY) {
          S.meter = 0;
          if (S.tokens < CFG.TOKEN_MAX) { S.tokens++; out.rewards.push({ kind: 'token', why: `${CFG.TOKEN_EVERY} Entdeckungen` }); }
        }
        // Gilden- und Gruppen-Sets
        if (!S.guildsDone[t.guild] && D.MICROBES.filter(m => m.guild === t.guild).every(m => S.discovered[m.id])) {
          S.guildsDone[t.guild] = true; xp += CFG.GUILD_BONUS;
          out.rewards.push({ kind: 'guild', name: t.guild, xp: CFG.GUILD_BONUS });
        }
        if (!S.groupsDone[t.guildGroup] && D.MICROBES.filter(m => m.guildGroup === t.guildGroup).every(m => S.discovered[m.id])) {
          S.groupsDone[t.guildGroup] = true; xp += CFG.GROUP_BONUS;
          out.rewards.push({ kind: 'group', name: t.guildGroup, xp: CFG.GROUP_BONUS });
        }
      }
      const lvBefore = level().n;
      S.xp += xp;
      out.xp = xp;
      if (level().n > lvBefore) out.levelUp = level();
    } else {
      S.stats.losses++;
      if (!S.discovered[t.id]) S.escaped[t.id] = true;
    }
    save();
    return out;
  }

  function bumpStreak(out) {
    const today = ensureDay().date;
    if (S.lastPlay === today) return;
    S.streak = S.lastPlay === prevDayKey(today) ? S.streak + 1 : 1;
    S.best = Math.max(S.best, S.streak);
    S.lastPlay = today;
    if (S.streak > 1 && S.streak % CFG.STREAK_TOKEN_EVERY === 0 && S.tokens < CFG.TOKEN_MAX) {
      S.tokens++;
      out.rewards.push({ kind: 'token', why: `${S.streak} Tage in Folge` });
    }
  }

  /* ---------- Hinweise ---------- */
  function hints(run) {
    const t = byId[run.target];
    const n = run.actions.length;
    const h = [{ k: 'Fundort', v: t.habitatGroup }];
    h.push(n >= CFG.HINT_TYPE_AT ? { k: 'Typ', v: t.type } : { k: 'Typ', v: `nach ${CFG.HINT_TYPE_AT} Aktionen`, locked: true });
    h.push(n >= CFG.HINT_LETTER_AT ? { k: 'Beginnt mit', v: t.name[0] + '…' } : { k: 'Anfang', v: `nach ${CFG.HINT_LETTER_AT} Aktionen`, locked: true });
    return h;
  }

  /* ---------- Level ---------- */
  const xpFor = n => 30 * (n - 1) * n;   // Level n ab dieser XP
  function level() {
    let n = 1;
    while (S.xp >= xpFor(n + 1)) n++;
    const lo = xpFor(n), hi = xpFor(n + 1);
    return { n, title: TITLES[Math.min(n - 1, TITLES.length - 1)], frac: (S.xp - lo) / (hi - lo), toNext: hi - S.xp };
  }

  /* ---------- Suche ---------- */
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const INDEX = D.MICROBES.map(m => ({ m, k: norm(m.name + ' ' + m.de) }));
  function search(q, exclude = new Set(), limit = 8) {
    const n = norm(q.trim());
    if (!n) return [];
    const words = n.split(/\s+/);
    return INDEX
      .filter(x => !exclude.has(x.m.id) && words.every(w => x.k.includes(w)))
      .map(x => ({ m: x.m, score: x.k.startsWith(n) ? 0 : norm(x.m.de).startsWith(n) ? 1 : 2 }))
      .sort((a, b) => a.score - b.score || a.m.name.localeCompare(b.m.name))
      .slice(0, limit).map(x => x.m);
  }

  /* ---------- Teilen ---------- */
  function shareText() {
    const day = ensureDay();
    const [y, m, d] = day.date.split('-');
    const em = { hit: '🟩', near: '🟨', miss: '⬛' };
    const lines = [`Germle ${d}.${m}.${y} 🧫`];
    day.runs.forEach((r, i) => {
      const t = byId[r.target];
      const head = r.status === 'won' ? `✅ ${r.actions.length}/${CFG.INTEGRITY}` : r.status === 'lost' ? '☣️ Biohazard' : '⏳';
      lines.push(`Probe ${i + 1}${r.bonus ? ' 🎟️' : ''}: ${head}${r.status === 'won' ? ' ' + '★'.repeat(t.rarity) : ''}`);
      r.actions.forEach(a => {
        if (a.k === 't') { lines.push(a.r === 'strong' ? '🧪🟩' : a.r === 'weak' ? '🧪🟨' : '🧪⬛'); return; }
        const c = compare(byId[a.id], t);
        lines.push(['type', 'guild', 'substrate', 'oxygen', 'temp', 'habitat', 'form'].map(k => em[c[k].s]).join(''));
      });
    });
    lines.push(`📖 ${Object.keys(S.discovered).length}/${D.MICROBES.length} · 🔥 ${S.streak}`);
    lines.push('germle.playle.io');
    return lines.join('\n');
  }

  function msToMidnight() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return next - now;
  }

  /* ---------- Debug (nur mit ?dev=1 sichtbar im UI) ---------- */
  const dev = {
    newDay() { S.day = null; ensureDay(); save(); },
    reset() { S = fresh(); save(); },
    reveal() { const r = current(); return r && byId[r.target].name; },
    give(n = 1) { S.tokens = Math.min(CFG.TOKEN_MAX, S.tokens + n); save(); },
  };

  return {
    CFG, D, byId, get S() { return S; }, save, ensureDay, current, samplesLeft, canStart,
    startSample, guess, test, compare, hints, level, search, shareText, msToMidnight, dev, dayKey,
  };
})();
