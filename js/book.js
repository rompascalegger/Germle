/* ==========================================================================
   Germle – Das Große Lexikon der Keime
   Vollständiges Nachschlagewerk aller Mikroben: Suche, Filter, Steckbriefe.
   Der Codex zeigt, was du entdeckt hast – das Lexikon zeigt, was es gibt.
   ========================================================================== */
'use strict';

const Book = (() => {
  const D = GERMLE_DATA, M = D.MICROBES;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const uniq = f => [...new Set(M.map(f))].sort((a, b) => a.localeCompare(b, 'de'));

  const F = { q: '', type: '', group: '', guild: '', sub: '', hab: '', form: '', ox: '', temp: '', rar: '', only: '', sort: 'name' };
  const IDX = M.map(m => ({ m, k: norm([m.name, m.de, m.guild, m.substrate, m.habitat, m.form, m.fact].join(' ')) }));

  const SORTS = {
    name: (a, b) => a.name.localeCompare(b.name),
    de: (a, b) => a.de.localeCompare(b.de, 'de'),
    rarity: (a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name),
    guild: (a, b) => a.guildGroup.localeCompare(b.guildGroup, 'de') || a.guild.localeCompare(b.guild, 'de') || a.name.localeCompare(b.name),
    substrate: (a, b) => a.substrate.localeCompare(b.substrate, 'de') || a.name.localeCompare(b.name),
    habitat: (a, b) => a.habitat.localeCompare(b.habitat, 'de') || a.name.localeCompare(b.name),
  };

  function filtered(S) {
    const q = norm(F.q.trim());
    const words = q ? q.split(/\s+/) : [];
    return IDX.filter(({ m, k }) => {
      if (words.length && !words.every(w => k.includes(w))) return false;
      if (F.type && m.typeCode !== F.type) return false;
      if (F.group && m.guildGroup !== F.group) return false;
      if (F.guild && m.guild !== F.guild) return false;
      if (F.sub && m.substrateGroup !== F.sub) return false;
      if (F.hab && m.habitatGroup !== F.hab) return false;
      if (F.form && m.form !== F.form) return false;
      if (F.ox && m.oxygen !== F.ox) return false;
      if (F.temp && m.temp !== F.temp) return false;
      if (F.rar && m.rarity !== +F.rar) return false;
      if (F.only === 'found' && !S.discovered[m.id]) return false;
      if (F.only === 'missing' && S.discovered[m.id]) return false;
      if (F.only === 'escaped' && !S.escaped[m.id]) return false;
      return true;
    }).map(x => x.m).sort(SORTS[F.sort]);
  }

  const opt = (list, val, label = x => x) =>
    list.map(x => `<option value="${esc(x)}"${String(val) === String(x) ? ' selected' : ''}>${esc(label(x))}</option>`).join('');

  /* ---------- Steckbrief ---------- */
  function entry(m, S) {
    const rar = D.RARITY[m.rarity], gc = D.GROUP_COLORS[m.guildGroup];
    const known = !!S.discovered[m.id];
    const esc2 = m.oxygen === '—' ? 'wirtsabhängig' : m.oxygen;
    return `<article class="bk-entry${known ? ' known' : ''}${S.escaped[m.id] ? ' esc' : ''}" style="--gc:${gc};--rar:${rar.color}">
      <header>
        <h4><i class="bk-dot"></i>${esc(m.name)}</h4>
        <span class="bk-rar" title="${esc(rar.name)}">${'★'.repeat(m.rarity)}<em>${esc(rar.name)}</em></span>
      </header>
      <p class="bk-de">${esc(m.de)} · <b>${esc(m.type)}</b>${known ? ' · <span class="bk-ok">✓ entdeckt</span>' : S.escaped[m.id] ? ' · <span class="bk-esc">☣ entkommen</span>' : ''}</p>
      <div class="bk-tags">
        <span class="tg guild">🏅 ${esc(m.guild)}<small>${esc(m.guildGroup)}</small></span>
        <span class="tg">🥣 ${esc(m.substrate)}<small>${esc(m.substrateGroup)}</small></span>
        <span class="tg">🫧 ${esc(esc2)}</span>
        <span class="tg">🌡️ ${esc(m.temp)}</span>
        <span class="tg">📍 ${esc(m.habitat)}<small>${esc(m.habitatGroup)}</small></span>
        <span class="tg">🔷 ${esc(m.form)}</span>
      </div>
      <p class="bk-fact">${esc(m.fact)}</p>
    </article>`;
  }

  /* ---------- Panel ---------- */
  function panel(S) {
    const found = Object.keys(S.discovered).length;
    const types = [['', 'Alle Reiche'], ['B', 'Bakterien'], ['A', 'Archaeen'], ['P', 'Pilze'], ['V', 'Viren']];
    return `<div class="bk">
      <h2>📚 Das Große Lexikon der Keime <small>${M.length} Einträge · ${found} entdeckt</small></h2>
      <p class="muted">Jede Mikrobe des Spiels mit Gilde, Nährboden, Ansprüchen und Fundort. Der <b>Codex</b> ist deine Sammlung – das Lexikon ist dein Nachschlagewerk beim Bestimmen.</p>
      <div class="bk-filters">
        <input id="bkQ" type="search" placeholder="Suchen: Name, Gilde, Nährboden, Fakt …" value="${esc(F.q)}" autocomplete="off">
        <select id="bkType">${types.map(([v, l]) => `<option value="${v}"${F.type === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
        <select id="bkGroup"><option value="">Alle Gildengruppen</option>${opt(uniq(m => m.guildGroup), F.group)}</select>
        <select id="bkGuild"><option value="">Alle Gilden</option>${opt(uniq(m => m.guild), F.guild)}</select>
        <select id="bkSub"><option value="">Alle Nährböden</option>${opt(uniq(m => m.substrateGroup), F.sub)}</select>
        <select id="bkHab"><option value="">Alle Lebensräume</option>${opt(uniq(m => m.habitatGroup), F.hab)}</select>
        <select id="bkForm"><option value="">Alle Formen</option>${opt(uniq(m => m.form), F.form)}</select>
        <select id="bkOx"><option value="">O₂ egal</option>${opt(D.OXYGEN, F.ox)}</select>
        <select id="bkTemp"><option value="">Temp. egal</option>${opt(D.TEMPS, F.temp)}</select>
        <select id="bkRar"><option value="">Jede Seltenheit</option>${opt([1, 2, 3, 4, 5], F.rar, r => '★'.repeat(r) + ' ' + D.RARITY[r].name)}</select>
        <select id="bkOnly">
          <option value=""${F.only === '' ? ' selected' : ''}>Alle Einträge</option>
          <option value="found"${F.only === 'found' ? ' selected' : ''}>Nur entdeckte</option>
          <option value="missing"${F.only === 'missing' ? ' selected' : ''}>Nur fehlende</option>
          <option value="escaped"${F.only === 'escaped' ? ' selected' : ''}>Nur entkommene</option>
        </select>
        <select id="bkSort">
          <option value="name"${F.sort === 'name' ? ' selected' : ''}>A–Z (lateinisch)</option>
          <option value="de"${F.sort === 'de' ? ' selected' : ''}>A–Z (deutsch)</option>
          <option value="guild"${F.sort === 'guild' ? ' selected' : ''}>nach Gilde</option>
          <option value="substrate"${F.sort === 'substrate' ? ' selected' : ''}>nach Nährboden</option>
          <option value="habitat"${F.sort === 'habitat' ? ' selected' : ''}>nach Lebensraum</option>
          <option value="rarity"${F.sort === 'rarity' ? ' selected' : ''}>nach Seltenheit</option>
        </select>
        <button class="btn" id="bkReset">Filter zurücksetzen</button>
      </div>
      <div class="bk-count" id="bkCount"></div>
      <div class="bk-list" id="bkList"></div>
      <div class="sheet-actions"><button class="btn" data-act="codex">📖 Codex</button><button class="btn primary" data-act="close">Schließen</button></div>
    </div>`;
  }

  function renderList(S) {
    const list = filtered(S);
    const el = document.getElementById('bkList');
    const cnt = document.getElementById('bkCount');
    if (!el) return;
    cnt.textContent = `${list.length} von ${M.length} Einträgen`;
    el.innerHTML = list.length
      ? list.slice(0, 400).map(m => entry(m, S)).join('')
      : '<p class="muted">Kein Eintrag passt zu diesen Filtern.</p>';
  }

  function bind(S) {
    const map = { bkQ: 'q', bkType: 'type', bkGroup: 'group', bkGuild: 'guild', bkSub: 'sub', bkHab: 'hab', bkForm: 'form', bkOx: 'ox', bkTemp: 'temp', bkRar: 'rar', bkOnly: 'only', bkSort: 'sort' };
    Object.entries(map).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', () => { F[key] = el.value; renderList(S); });
    });
    const r = document.getElementById('bkReset');
    if (r) r.addEventListener('click', () => { Object.keys(F).forEach(k => F[k] = k === 'sort' ? 'name' : ''); open(S); });
    renderList(S);
  }

  let opener = null;
  function open(S) { if (opener) opener(panel(S), 'wide'); bind(S); }
  function init(openModal) { opener = openModal; }

  return { init, open, panel, bind, F };
})();
