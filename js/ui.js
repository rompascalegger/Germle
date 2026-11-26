/* ==========================================================================
   Germle – Oberfläche
   ========================================================================== */
'use strict';

(() => {
  const G = Germle, D = G.D, CFG = G.CFG;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DEV = new URLSearchParams(location.search).has('dev');
  const COLS = ['type', 'guild', 'substrate', 'oxygen', 'temp', 'habitat', 'form'];
  const VAL = { type: 'type', guild: 'guild', substrate: 'substrate', oxygen: 'oxygen', temp: 'temp', habitat: 'habitat', form: 'form' };
  const colorOf = m => D.GROUP_COLORS[m.guildGroup] || '#8fe';
  const seedOf = id => { let h = 7; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

  let lastRowCount = 0, selIdx = 0, suggestions = [];

  /* ---------------- Kopfzeile & Tagesleiste ---------------- */
  function renderTop() {
    const S = G.S, lv = G.level();
    $('lvlNum').textContent = lv.n;
    $('lvlTitle').textContent = lv.title;
    $('xpFill').style.width = (lv.frac * 100).toFixed(1) + '%';
    $('pillLevel').title = `${S.xp} XP · noch ${lv.toNext} XP bis Level ${lv.n + 1}`;
    $('streakNum').textContent = S.streak;
    $('tokenNum').textContent = S.tokens;
    $('pillTokens').classList.toggle('glow', S.tokens > 0);
    $('codexNum').textContent = Object.keys(S.discovered).length;
    $('codexTotal').textContent = '/' + D.MICROBES.length;
    const ap = Achievements.progress(S);
    $('achvNum').textContent = ap.done;
    $('achvTotal').textContent = '/' + ap.total;
    $('btnSound').textContent = S.sound ? '🔊' : '🔇';
  }

  function renderDay() {
    const day = G.ensureDay();
    const pips = [];
    const normal = day.runs.filter(r => !r.bonus && !r.carried);
    for (let i = 0; i < CFG.SAMPLES_PER_DAY; i++) {
      const r = normal[i];
      pips.push(pip(r, i + 1, false));
    }
    day.runs.filter(r => r.bonus || r.carried).forEach(r => pips.push(pip(r, '🎟', true)));
    $('samplePips').innerHTML = `<span class="samples-lbl">Proben heute</span>` + pips.join('');
    const m = G.S.meter;
    $('meterTrack').innerHTML = Array.from({ length: CFG.TOKEN_EVERY }, (_, i) => `<i class="${i < m ? 'on' : ''}"></i>`).join('');
    $('meterTxt').textContent = `${m}/${CFG.TOKEN_EVERY}`;
    $('meterTrack').parentElement.classList.toggle('almost', m === CFG.TOKEN_EVERY - 1);
  }
  function pip(r, label, bonus) {
    const st = !r ? 'free' : r.status;
    const ico = st === 'won' ? '✓' : st === 'lost' ? '☣' : st === 'active' ? '🧫' : label;
    const tt = st === 'won' ? 'Entdeckt' : st === 'lost' ? 'Biohazard' : st === 'active' ? 'Läuft' : 'Verfügbar';
    return `<span class="pip ${st}${bonus ? ' bonus' : ''}" title="${tt}">${ico}</span>`;
  }

  /* ---------------- Labor ---------------- */
  function viewRun() {
    const day = G.ensureDay();
    return G.current() || day.runs[day.runs.length - 1] || null;
  }

  function render() {
    renderTop();
    renderDay();
    const run = viewRun();
    const active = !!(run && run.status === 'active');
    $('lab').classList.toggle('is-active', active);
    $('guessBox').hidden = !active;
    $('testBox').hidden = !active;
    renderIdle(run);

    if (!run) {
      Dish.set({ mode: 'idle', tests: [], cracks: 0, growth: 0 });
      $('dishLabel').textContent = 'Keine Probe';
      $('intCells').innerHTML = cells(CFG.INTEGRITY);
      $('hints').innerHTML = '';
      $('gridBody').innerHTML = '';
      $('gridEmpty').hidden = false;
      lastRowCount = 0;
      return;
    }
    const t = G.byId[run.target];
    const tests = run.actions.filter(a => a.k === 't');
    Dish.set({
      seed: seedOf(t.id), color: colorOf(t), mode: run.status === 'active' ? 'active' : run.status,
      growth: (CFG.INTEGRITY - run.integ) / CFG.INTEGRITY,
      cracks: run.integ <= 3 ? 4 - run.integ : 0, tests,
    });
    $('dishLabel').innerHTML = run.status === 'won' ? `✓ ${esc(t.name)}`
      : run.status === 'lost' ? `☣ Entkommen: ${esc(t.name)}`
      : `Probe ${run.idx + 1}${run.bonus ? ' · Gratis' : ''} · unbekannt`;
    $('intCells').innerHTML = cells(run.integ);
    $('intCells').parentElement.classList.toggle('danger', run.integ <= 2 && active);

    const hs = G.hints(run);
    $('hints').innerHTML = hs.map(h => `<span class="hint${h.locked ? ' locked' : ''}"><small>${esc(h.k)}</small>${esc(h.v)}</span>`).join('')
      + `<span class="hint swatch"><small>Kolonie</small><i style="background:${colorOf(t)}"></i></span>`;

    // Teststreifen
    $('testList').innerHTML = tests.map(a => `<span class="tchip ${a.r}">${esc(a.s)} · ${a.r === 'strong' ? 'starkes Wachstum' : a.r === 'weak' ? 'schwaches Wachstum' : 'kein Wachstum'}</span>`).join('');
    fillTestSelect(tests.map(a => a.s));

    // Tabelle
    const rows = run.actions.filter(a => a.k === 'g');
    $('gridEmpty').hidden = rows.length > 0;
    const fresh = rows.length > lastRowCount;
    $('gridBody').innerHTML = rows.slice().reverse().map((a, i) => row(G.byId[a.id], t, fresh && i === 0)).join('');
    lastRowCount = rows.length;
  }

  const cells = n => Array.from({ length: CFG.INTEGRITY }, (_, i) => `<i class="${i < n ? 'ok' : 'gone'}"></i>`).join('');

  function row(g, t, animate) {
    const c = G.compare(g, t);
    const tds = COLS.map((k, i) => {
      let v = g[VAL[k]];
      if (k === 'temp' && c.temp.dir) v += c.temp.dir === 'up' ? ' ↑' : ' ↓';
      return `<td class="c ${c[k].s}${animate ? ' flip' : ''}" style="${animate ? `animation-delay:${i * 90}ms` : ''}">${esc(v)}</td>`;
    }).join('');
    return `<tr><th scope="row"><b>${esc(g.name)}</b><small>${esc(g.de)}</small></th>${tds}</tr>`;
  }

  function fillTestSelect(used) {
    const sel = $('testSel');
    const prev = sel.value;
    const groups = {};
    Object.entries(D.SUBSTRATES).forEach(([s, grp]) => (groups[grp] = groups[grp] || []).push(s));
    sel.innerHTML = Object.entries(groups).map(([grp, list]) =>
      `<optgroup label="${esc(grp)}">${list.map(s => `<option value="${esc(s)}"${used.includes(s) ? ' disabled' : ''}>${esc(s)}${used.includes(s) ? ' ✓' : ''}</option>`).join('')}</optgroup>`).join('');
    if (prev && !used.includes(prev)) sel.value = prev;
    if (sel.selectedOptions[0] && sel.selectedOptions[0].disabled) {
      const first = [...sel.options].find(o => !o.disabled); if (first) sel.value = first.value;
    }
  }

  /* ---------------- Ruhe-Panel (Start / Countdown) ---------------- */
  function renderIdle(run) {
    const idle = $('idle');
    if (G.current()) { idle.hidden = true; return; }
    idle.hidden = false;
    const left = G.samplesLeft(), tokens = G.S.tokens;
    const day = G.ensureDay();
    let html = '';
    if (left > 0) {
      html += `<div class="idle-cta"><h2>${day.runs.length ? 'Nächste Probe bereit' : 'Willkommen im Labor'}</h2>
        <p>Noch <b>${left}</b> von ${CFG.SAMPLES_PER_DAY} Proben heute. Unentdeckte Mikroben warten …</p>
        <button class="btn primary big" data-act="start">🧫 Probe ${day.runs.length + 1} entnehmen</button></div>`;
    } else if (tokens > 0) {
      html += `<div class="idle-cta"><h2>Alle Tagesproben verbraucht</h2>
        <p>Du hast <b>${tokens}</b> Gratisprobe${tokens > 1 ? 'n' : ''}.</p>
        <button class="btn gold big" data-act="start">🎟️ Gratisprobe einlösen</button></div>`;
    } else {
      html += `<div class="idle-cta"><h2>Labor geschlossen</h2>
        <p>Neue Proben in</p><div class="countdown" id="countdown">--:--:--</div>
        <p class="muted">Gratis-Meter: ${G.S.meter}/${CFG.TOKEN_EVERY} – ${CFG.TOKEN_EVERY - G.S.meter} Entdeckung${CFG.TOKEN_EVERY - G.S.meter === 1 ? '' : 'en'} bis zur nächsten Gratisprobe.</p></div>`;
    }
    if (day.runs.some(r => r.status !== 'active')) {
      html += `<div class="idle-actions"><button class="btn" data-act="share">📋 Ergebnis teilen</button><button class="btn" data-act="codex">📖 Codex</button></div>`;
    }
    if (DEV) html += `<div class="idle-actions dev"><button class="btn" data-act="dev-day">Dev: neuer Tag</button><button class="btn" data-act="dev-token">Dev: +Gratis</button><button class="btn" data-act="dev-reset">Dev: Reset</button></div>`;
    idle.innerHTML = html;
    tickCountdown();
  }

  function tickCountdown() {
    const el = $('countdown');
    if (!el) return;
    const ms = G.msToMidnight();
    const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
    el.textContent = [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
    if (ms < 1500) setTimeout(render, 1600);
  }

  /* ---------------- Aktionen ---------------- */
  function start() {
    Sfx.unlock();
    const r = G.startSample();
    if (!r) return;
    Sfx.drip();
    lastRowCount = 0;
    render();
    $('dishWrap').classList.remove('pop'); void $('dishWrap').offsetWidth; $('dishWrap').classList.add('pop');
    setTimeout(() => $('guessInput').focus(), 50);
  }

  function doGuess(id) {
    Sfx.unlock();
    const res = G.guess(id);
    if (!res) return;
    if (res.dup) { toast('Schon bestimmt.'); return; }
    closeSuggest();
    $('guessInput').value = '';
    after(res);
  }

  function doTest() {
    Sfx.unlock();
    const s = $('testSel').value;
    const res = G.test(s);
    if (!res) return;
    if (res.dup) { toast('Dieser Nährboden wurde schon getestet.'); return; }
    if (res.result === 'strong') Sfx.near(6); else if (res.result === 'weak') Sfx.near(2); else Sfx.wrong();
    after(res);
  }

  function after(res) {
    render();
    if (res.cmp && !res.won) {
      const hits = COLS.filter(k => res.cmp[k].s === 'hit').length;
      COLS.forEach((k, i) => setTimeout(() => res.cmp[k].s === 'hit' ? Sfx.near(i) : res.cmp[k].s === 'near' ? Sfx.click() : null, i * 90));
      if (hits >= 5) toast('So nah! 🔬');
    }
    if (res.wrong || res.result) {
      Dish.bump(res.won === false ? 30 : 6);
      setTimeout(() => Sfx.grow(), 200);
      const run = viewRun();
      if (run && run.status === 'active' && run.integ <= 3) { setTimeout(() => Sfx.crack(), 350); document.body.classList.add('shake'); setTimeout(() => document.body.classList.remove('shake'), 400); }
      if (run && run.status === 'active' && run.integ === 1) toast('⚠ Die Schale hält nur noch eine Aktion!', 'warn');
    }
    if (res.won === true) setTimeout(() => winSheet(res), 700);
    if (res.won === false) setTimeout(() => hazard(res), 500);
    if (res.achv && res.achv.length) announce(res.achv, res.won === false ? 2600 : 2000);
  }

  /* Freigeschaltete Errungenschaften nacheinander einblenden */
  function announce(list, delay) {
    list.forEach((a, i) => setTimeout(() => {
      const tier = Achievements.TIERS[a.tier];
      const el = document.createElement('div');
      el.className = 'toast achv';
      el.style.setProperty('--tc', tier.color);
      el.innerHTML = `<span class="ac-ico">${a.i}</span><span><small>Errungenschaft · ${esc(tier.name)}</small><b>${esc(a.t)}</b></span>`;
      $('toasts').appendChild(el);
      Sfx.coin();
      setTimeout(() => el.classList.add('out'), 3200);
      setTimeout(() => el.remove(), 3700);
    }, delay + i * 900));
  }

  /* ---------------- Gewinn ---------------- */
  function winSheet(res) {
    const t = res.target, rar = D.RARITY[t.rarity];
    Sfx.win(t.rarity);
    confetti(t.rarity >= 4 ? 220 : 90, rar.color);
    const rewards = res.rewards.map(r =>
      r.kind === 'token' ? `<li class="rw token">🎟️ Gratisprobe erhalten! <small>${esc(r.why)}</small></li>`
      : r.kind === 'guild' ? `<li class="rw">🏅 Gilde komplett: <b>${esc(r.name)}</b> <small>+${r.xp} XP</small></li>`
      : `<li class="rw big">🏆 Gildengruppe komplett: <b>${esc(r.name)}</b> <small>+${r.xp} XP</small></li>`).join('');
    openModal(`
      <div class="card rar${t.rarity}" style="--rar:${rar.color}">
        <div class="card-top"><span class="tag">${res.isNew ? '✨ NEU ENTDECKT' : 'Erneut bestimmt'}</span><span class="rar-name">${'★'.repeat(t.rarity)} ${rar.name}</span></div>
        <canvas class="micro" id="microCv" width="160" height="160"></canvas>
        <h2 class="latin">${esc(t.name)}</h2>
        <p class="de">${esc(t.de)}</p>
        ${attrs(t)}
        <p class="fact">💡 ${esc(t.fact)}</p>
        ${res.perfect ? '<p class="perfect">🎯 VOLLTREFFER – beim ersten Versuch! XP ×2</p>' : ''}
        <div class="xp-gain">+<span id="xpCount">0</span> XP</div>
        ${rewards ? `<ul class="rewards">${rewards}</ul>` : ''}
      </div>
      <div class="sheet-actions"><button class="btn" data-act="codex">📖 Codex</button><button class="btn primary" data-act="close">Weiter</button></div>`, 'win');
    Micro.draw($('microCv'), t, colorOf(t));
    countUp($('xpCount'), res.xp);
    if (res.rewards.some(r => r.kind === 'token')) setTimeout(() => Sfx.coin(), 600);
    if (res.levelUp) setTimeout(() => { Sfx.level(); toast(`⬆ Level ${res.levelUp.n}: ${res.levelUp.title}`, 'gold'); }, 1100);
    renderTop();
  }

  function attrs(t) {
    const rows = [['Typ', t.type], ['Gilde', `${t.guild} <small>(${esc(t.guildGroup)})</small>`], ['Nährboden', esc(t.substrate)],
      ['Sauerstoff', esc(t.oxygen === '—' ? 'wirtsabhängig' : t.oxygen)], ['Temperatur', esc(t.temp)], ['Habitat', esc(t.habitat)], ['Form', esc(t.form)]];
    return `<dl class="attrs">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  }

  function countUp(el, to) {
    const t0 = performance.now();
    const step = now => { const f = Math.min(1, (now - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - f, 3))); if (f < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------------- Biohazard (Game Over) ---------------- */
  function hazard(res) {
    const t = res.target;
    Sfx.crack();
    Sfx.siren();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
    $('hzReveal').innerHTML = `<p>Entkommene Mikrobe:</p><b>${esc(t.name)}</b><small>${esc(t.de)} · ${esc(t.guild)}</small>
      ${res.rewards.length ? `<p class="hz-rw">${res.rewards.map(r => '🎟️ ' + esc(r.why) + ': Gratisprobe').join('<br>')}</p>` : ''}
      <p class="hz-note">Sie bleibt unentdeckt und kann wieder auftauchen.</p>`;
    $('hazard').classList.add('on');
    $('hazard').setAttribute('aria-hidden', 'false');
    document.body.classList.add('alarm');
    setTimeout(() => $('hzBtn').focus(), 100);
  }
  function endHazard() {
    Sfx.stopSiren();
    $('hazard').classList.remove('on');
    $('hazard').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('alarm');
    render();
  }

  /* ---------------- Codex ---------------- */
  function codex(filter = '') {
    const S = G.S;
    const groups = {};
    D.MICROBES.forEach(m => (groups[m.guildGroup] = groups[m.guildGroup] || []).push(m));
    const total = D.MICROBES.length, found = Object.keys(S.discovered).length;
    const body = Object.entries(groups).map(([grp, list]) => {
      const got = list.filter(m => S.discovered[m.id]).length;
      const tiles = list.map(m => {
        const d = S.discovered[m.id];
        if (d) return `<button class="tile rar${m.rarity}" data-act="detail" data-id="${m.id}" style="--rar:${D.RARITY[m.rarity].color}"><b>${esc(m.name)}</b><small>${esc(m.guild)}</small></button>`;
        return `<div class="tile locked${S.escaped[m.id] ? ' escaped' : ''}" title="${S.escaped[m.id] ? 'Entkommen' : 'Unentdeckt'}"><b>${S.escaped[m.id] ? '☣ ' : ''}???</b><small>${esc(m.guild)}</small></div>`;
      }).join('');
      return `<section class="cx-group" style="--gc:${D.GROUP_COLORS[grp]}">
        <h3><i></i>${esc(grp)}<span>${got}/${list.length}${S.groupsDone[grp] ? ' 🏆' : ''}</span></h3>
        <div class="cx-bar"><i style="width:${(got / list.length * 100).toFixed(1)}%"></i></div>
        <div class="tiles">${tiles}</div></section>`;
    }).join('');
    openModal(`<h2>📖 Codex <small>${found}/${total} · ${(found / total * 100).toFixed(1)} %</small></h2>
      <p class="muted">Jede Kachel ist eine Mikrobe. Die Gilde ist sichtbar – die Art musst du in der Petrischale entdecken.</p>
      <div class="cx-bar main"><i style="width:${(found / total * 100).toFixed(1)}%"></i></div>
      <div class="codex">${body}</div>
      <div class="sheet-actions"><button class="btn" data-act="book">📚 Lexikon</button><button class="btn" data-act="achv">🏅 Errungenschaften</button><button class="btn primary" data-act="close">Schließen</button></div>`, 'wide');
  }

  function detail(id) {
    const m = G.byId[id], rar = D.RARITY[m.rarity], d = G.S.discovered[id];
    openModal(`<div class="card rar${m.rarity}" style="--rar:${rar.color}">
        <div class="card-top"><span class="tag">Entdeckt am ${esc(d.d.split('-').reverse().join('.'))}</span><span class="rar-name">${'★'.repeat(m.rarity)} ${rar.name}</span></div>
        <canvas class="micro" id="microCv" width="160" height="160"></canvas>
        <h2 class="latin">${esc(m.name)}</h2><p class="de">${esc(m.de)}</p>
        ${attrs(m)}<p class="fact">💡 ${esc(m.fact)}</p></div>
      <div class="sheet-actions"><button class="btn" data-act="codex">◀ Codex</button><button class="btn primary" data-act="close">Schließen</button></div>`, 'win');
    Micro.draw($('microCv'), m, colorOf(m));
  }

  /* ---------------- Errungenschaften ---------------- */
  function achievements() {
    const S = G.S, p = Achievements.progress(S);
    const byTier = { 1: [], 2: [], 3: [], 4: [] };
    Achievements.LIST.forEach(a => byTier[a.tier].push(a));
    const body = [4, 3, 2, 1].map(tier => {
      const T = Achievements.TIERS[tier];
      const items = byTier[tier].map(a => {
        const st = Achievements.state(a, S);
        const when = S.achv && S.achv[a.id];
        return `<li class="ac ${st.done ? 'done' : ''}" style="--tc:${T.color}">
          <span class="ac-ico">${st.done ? a.i : '🔒'}</span>
          <span class="ac-txt"><b>${esc(a.t)}</b><small>${esc(a.d)}</small>
            <span class="ac-bar"><i style="width:${(st.frac * 100).toFixed(1)}%"></i></span></span>
          <span class="ac-num">${st.done ? (when ? esc(String(when).split('-').reverse().join('.')) : '✓') : `${st.cur}/${a.goal}`}</span>
        </li>`;
      }).join('');
      const done = byTier[tier].filter(a => S.achv && S.achv[a.id]).length;
      return `<section class="ac-group"><h3 style="--tc:${T.color}"><i></i>${T.name}<span>${done}/${byTier[tier].length}</span></h3><ul class="ac-list">${items}</ul></section>`;
    }).join('');
    openModal(`<h2>🏅 Errungenschaften <small>${p.done}/${p.total}</small></h2>
      <div class="cx-bar main"><i style="width:${(p.done / p.total * 100).toFixed(1)}%"></i></div>
      ${body}
      <div class="sheet-actions"><button class="btn" data-act="book">📚 Lexikon</button><button class="btn primary" data-act="close">Schließen</button></div>`, 'wide');
  }

  /* ---------------- Anleitung & Statistik ---------------- */
  function help() {
    const swatches = Object.entries(D.GROUP_COLORS).map(([k, c]) => `<span class="sw"><i style="background:${c}"></i>${esc(k)}</span>`).join('');
    openModal(`<h2>🧫 So funktioniert Germle</h2>
      <ol class="howto">
        <li><b>${CFG.SAMPLES_PER_DAY} Proben pro Tag.</b> Jede enthält eine unbekannte Mikrobe – Bakterium, Archaeon, Pilz oder Virus.</li>
        <li><b>Bestimmen:</b> Rate eine Art. Sieben Spalten zeigen, wie nah du bist: 🟩 Treffer, 🟨 gleiche Gruppe oder Nachbarstufe, ⬛ falsch.</li>
        <li><b>Nährboden-Test:</b> Trage ein Plättchen auf (z. B. Nitrat, Eisen(II), Sulfat, Licht). Starkes Wachstum = genau ihr Nährboden, schwach = gleiche Stoffgruppe. Viren wachsen nur auf ihrem Wirt.</li>
        <li><b>Achtung:</b> Jede falsche Bestimmung und jeder Test kostet 1 Integrität. Bei 0 sprengt die Kolonie die Schale – <b>☣ BIOHAZARD ALARM</b>, die Probe ist verloren.</li>
        <li><b>Hinweise:</b> Fundort sofort, Typ nach ${CFG.HINT_TYPE_AT} Aktionen, Anfangsbuchstabe nach ${CFG.HINT_LETTER_AT}. Die <b>Koloniefarbe</b> verrät die Gildengruppe:</li>
      </ol>
      <div class="swatches">${swatches}</div>
      <ul class="howto plain">
        <li>🎟️ <b>Gratisprobe:</b> Alle ${CFG.TOKEN_EVERY} Entdeckungen und alle ${CFG.STREAK_TOKEN_EVERY} Tage Streak – max. ${CFG.TOKEN_MAX} lagerbar.</li>
        <li>⭐ Seltene Mikroben bringen mehr XP. Restintegrität gibt Bonus, ein Volltreffer verdoppelt.</li>
        <li>🏅 Komplette Gilden und Gildengruppen geben Extra-XP.</li>
        <li>🎯 Ziel: den Codex mit allen ${D.MICROBES.length} Mikroben füllen.</li>
        <li>📚 <b>Lexikon:</b> Nachschlagewerk aller ${D.MICROBES.length} Keime – such und filtere beim Bestimmen nach Gilde, Nährboden oder Lebensraum.</li>
        <li>🏅 <b>Errungenschaften:</b> ${Achievements.LIST.length} Auszeichnungen von Bronze bis Platin.</li>
      </ul>
      <div class="sheet-actions"><button class="btn primary" data-act="close">Los geht's</button></div>`);
  }

  function stats() {
    const S = G.S, s = S.stats;
    openModal(`<h2>📊 Laborbuch</h2>
      <div class="stats">
        <div><b>${S.streak}</b><small>Tage in Folge</small></div>
        <div><b>${S.best}</b><small>Bester Streak</small></div>
        <div><b>${s.wins}</b><small>Bestimmt</small></div>
        <div><b>${s.losses}</b><small>Biohazards</small></div>
        <div><b>${s.perfect}</b><small>Volltreffer</small></div>
        <div><b>${S.xp}</b><small>XP gesamt</small></div>
      </div>
      <div class="sheet-actions"><button class="btn primary" data-act="close">Schließen</button></div>`);
  }

  /* ---------------- Modal / Toast / Konfetti ---------------- */
  function openModal(html, cls = '') {
    $('sheet').className = 'sheet ' + cls;
    $('sheet').innerHTML = html;
    $('modal').classList.add('on');
    $('modal').setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    $('modal').classList.remove('on');
    $('modal').setAttribute('aria-hidden', 'true');
    render();
  }

  function toast(msg, kind = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.textContent = msg;
    $('toasts').appendChild(el);
    setTimeout(() => el.classList.add('out'), 2400);
    setTimeout(() => el.remove(), 2900);
  }

  const fx = $('fx'), fg = fx.getContext('2d');
  let parts = [], fxOn = false;
  function confetti(n, color) {
    fx.width = innerWidth; fx.height = innerHeight;
    const cols = [color, '#5ff2a0', '#ffe15a', '#ff6b8a', '#6ad0ff', '#ffffff'];
    for (let i = 0; i < n; i++) parts.push({
      x: innerWidth / 2, y: innerHeight * 0.4, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 3,
      r: 3 + Math.random() * 5, c: cols[i % cols.length], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4, life: 1,
      round: Math.random() < 0.4,
    });
    if (!fxOn) { fxOn = true; requestAnimationFrame(fxLoop); }
  }
  function fxLoop() {
    fg.clearRect(0, 0, fx.width, fx.height);
    parts = parts.filter(p => p.life > 0);
    parts.forEach(p => {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life -= 0.008;
      fg.save(); fg.globalAlpha = Math.max(0, p.life); fg.translate(p.x, p.y); fg.rotate(p.a); fg.fillStyle = p.c;
      if (p.round) { fg.beginPath(); fg.arc(0, 0, p.r * 0.7, 0, 7); fg.fill(); } else fg.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      fg.restore();
    });
    if (parts.length) requestAnimationFrame(fxLoop); else { fxOn = false; fg.clearRect(0, 0, fx.width, fx.height); }
  }

  async function share() {
    const txt = G.shareText();
    try { await navigator.clipboard.writeText(txt); toast('Ergebnis kopiert 📋'); }
    catch (e) { openModal(`<h2>Ergebnis</h2><textarea class="share" readonly>${esc(txt)}</textarea><div class="sheet-actions"><button class="btn primary" data-act="close">Schließen</button></div>`); }
  }

  /* ---------------- Vorschläge (Autocomplete) ---------------- */
  function updateSuggest() {
    const run = G.current();
    const q = $('guessInput').value;
    const used = new Set(run ? run.actions.filter(a => a.k === 'g').map(a => a.id) : []);
    suggestions = G.search(q, used);
    selIdx = 0;
    const ul = $('suggest');
    if (!suggestions.length) { ul.classList.remove('on'); ul.innerHTML = q.trim() ? '<li class="none">Keine Mikrobe gefunden</li>' : ''; if (q.trim()) ul.classList.add('on'); return; }
    ul.innerHTML = suggestions.map((m, i) => `<li role="option" data-id="${m.id}" class="${i === 0 ? 'sel' : ''}">
      <b>${esc(m.name)}</b><small>${esc(m.de)} · ${esc(m.type)}</small>${G.S.discovered[m.id] ? '<em>✓</em>' : ''}</li>`).join('');
    ul.classList.add('on');
  }
  function moveSel(d) {
    if (!suggestions.length) return;
    selIdx = (selIdx + d + suggestions.length) % suggestions.length;
    [...$('suggest').children].forEach((li, i) => li.classList.toggle('sel', i === selIdx));
  }
  function closeSuggest() { $('suggest').classList.remove('on'); }

  /* ---------------- Ereignisse ---------------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act !== 'close') Sfx.click();
    if (act === 'start') start();
    else if (act === 'share') share();
    else if (act === 'codex') codex();
    else if (act === 'book') Book.open(G.S);
    else if (act === 'achv') achievements();
    else if (act === 'detail') detail(b.dataset.id);
    else if (act === 'close') closeModal();
    else if (act === 'dev-day') { G.dev.newDay(); render(); }
    else if (act === 'dev-token') { G.dev.give(1); render(); }
    else if (act === 'dev-reset') { if (confirm('Spielstand wirklich löschen?')) { G.dev.reset(); render(); } }
  });

  $('guessInput').addEventListener('input', updateSuggest);
  $('guessInput').addEventListener('focus', () => { if ($('guessInput').value) updateSuggest(); });
  $('guessInput').addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (suggestions[selIdx]) doGuess(suggestions[selIdx].id); }
    else if (e.key === 'Escape') closeSuggest();
  });
  $('suggest').addEventListener('mousedown', e => {
    const li = e.target.closest('li[data-id]');
    if (li) { e.preventDefault(); doGuess(li.dataset.id); }
  });
  $('guessInput').addEventListener('blur', () => setTimeout(closeSuggest, 120));
  $('guessBtn').addEventListener('click', () => { if (suggestions[selIdx]) doGuess(suggestions[selIdx].id); else { updateSuggest(); toast('Wähle eine Mikrobe aus der Liste.'); } });
  $('testBtn').addEventListener('click', doTest);
  $('hzBtn').addEventListener('click', endHazard);
  $('modal').addEventListener('click', e => { if (e.target === $('modal')) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('modal').classList.contains('on')) closeModal();
    if (e.key === 'Escape' && $('hazard').classList.contains('on')) endHazard();
  });

  $('btnHelp').addEventListener('click', help);
  $('btnBook').addEventListener('click', () => Book.open(G.S));
  $('pillAchv').addEventListener('click', achievements);
  $('pillCodex').addEventListener('click', codex);
  $('pillStreak').addEventListener('click', stats);
  $('pillLevel').addEventListener('click', stats);
  $('pillTokens').addEventListener('click', () => toast(`🎟️ ${G.S.tokens} Gratisprobe(n). Gratis-Meter ${G.S.meter}/${CFG.TOKEN_EVERY}.`));
  $('btnSound').addEventListener('click', () => { G.S.sound = !G.S.sound; Sfx.on = G.S.sound; G.save(); renderTop(); });
  $('brand').addEventListener('click', e => { e.preventDefault(); });

  let shownDay = G.dayKey();
  setInterval(() => {
    tickCountdown();
    if (G.dayKey() !== shownDay) { shownDay = G.dayKey(); render(); toast('🌅 Neuer Tag – 3 frische Proben!', 'gold'); }
  }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

  /* ---------------- Start ---------------- */
  Sfx.on = G.S.sound;
  Book.init(openModal);
  Dish.init($('dish'));
  // Nachrüsten: Errungenschaften, die ein alter Spielstand schon erfüllt
  const pending = Achievements.check(G.S);
  if (pending.length) G.save();
  render();
  if (pending.length && G.S.seenHelp) announce(pending, 900);
  if (!G.S.seenHelp) { G.S.seenHelp = true; G.save(); help(); }
  if (DEV) window.germle = G;
})();
