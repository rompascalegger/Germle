/* ==========================================================================
   Germle – Errungenschaften
   Jede Errungenschaft: id, Titel, Beschreibung, Icon, Stufe, Ziel-Zähler.
   p(S, D) liefert den Fortschritt 0..goal – daraus ergibt sich alles Weitere.
   ========================================================================== */
'use strict';

const Achievements = (() => {
  const D = GERMLE_DATA;
  const M = D.MICROBES;

  const countType = (S, t) => M.filter(m => m.typeCode === t && S.discovered[m.id]).length;
  const countWhere = (S, f) => M.filter(m => f(m) && S.discovered[m.id]).length;
  const found = S => Object.keys(S.discovered).length;

  /* tier: 1 Bronze, 2 Silber, 3 Gold, 4 Platin */
  const LIST = [
    // --- Einstieg ---
    { id: 'first', t: 'Erster Ausstrich', d: 'Bestimme deine erste Mikrobe.', i: '🧫', tier: 1, goal: 1, p: S => found(S) },
    { id: 'ten', t: 'Laborroutine', d: 'Entdecke 10 Mikroben.', i: '🔬', tier: 1, goal: 10, p: S => found(S) },
    { id: 'fifty', t: 'Sammlung im Aufbau', d: 'Entdecke 50 Mikroben.', i: '📚', tier: 2, goal: 50, p: S => found(S) },
    { id: 'hundred', t: 'Hundert Kulturen', d: 'Entdecke 100 Mikroben.', i: '💯', tier: 2, goal: 100, p: S => found(S) },
    { id: 'half', t: 'Halbzeit', d: `Entdecke die Hälfte aller ${M.length} Mikroben.`, i: '🌓', tier: 3, goal: Math.ceil(M.length / 2), p: S => found(S) },
    { id: 'all', t: 'Vollständiges Lexikon', d: 'Entdecke jede einzelne Mikrobe.', i: '🏆', tier: 4, goal: M.length, p: S => found(S) },

    // --- Reiche ---
    { id: 'bact25', t: 'Bakteriologie', d: 'Entdecke 25 Bakterien.', i: '🦠', tier: 1, goal: 25, p: S => countType(S, 'B') },
    { id: 'bactall', t: 'Bakterienmeister:in', d: 'Entdecke alle Bakterien.', i: '🦠', tier: 4, goal: M.filter(m => m.typeCode === 'B').length, p: S => countType(S, 'B') },
    { id: 'arch5', t: 'Urzeit-Jäger:in', d: 'Entdecke 5 Archaeen.', i: '🏺', tier: 1, goal: 5, p: S => countType(S, 'A') },
    { id: 'archall', t: 'Archaeologie', d: 'Entdecke alle Archaeen.', i: '🏺', tier: 3, goal: M.filter(m => m.typeCode === 'A').length, p: S => countType(S, 'A') },
    { id: 'fung15', t: 'Mykologie-Kurs', d: 'Entdecke 15 Pilze.', i: '🍄', tier: 1, goal: 15, p: S => countType(S, 'P') },
    { id: 'fungall', t: 'Pilzkenner:in', d: 'Entdecke alle Pilze.', i: '🍄', tier: 4, goal: M.filter(m => m.typeCode === 'P').length, p: S => countType(S, 'P') },
    { id: 'vir15', t: 'Virologie-Praktikum', d: 'Entdecke 15 Viren.', i: '🧬', tier: 1, goal: 15, p: S => countType(S, 'V') },
    { id: 'virall', t: 'Virolog:in', d: 'Entdecke alle Viren.', i: '🧬', tier: 4, goal: M.filter(m => m.typeCode === 'V').length, p: S => countType(S, 'V') },
    { id: 'quartet', t: 'Vier Reiche', d: 'Entdecke mindestens je ein Bakterium, Archaeon, einen Pilz und ein Virus.', i: '🀄', tier: 2, goal: 4, p: S => ['B', 'A', 'P', 'V'].filter(t => countType(S, t) > 0).length },

    // --- Gilden & Kreisläufe ---
    { id: 'guild1', t: 'Erste Gilde', d: 'Vervollständige eine Gilde.', i: '🏅', tier: 1, goal: 1, p: S => Object.keys(S.guildsDone).length },
    { id: 'guild10', t: 'Gildenrat', d: 'Vervollständige 10 Gilden.', i: '🏅', tier: 2, goal: 10, p: S => Object.keys(S.guildsDone).length },
    { id: 'guildall', t: 'Gildenmeister:in', d: 'Vervollständige alle Gilden.', i: '🎖️', tier: 4, goal: new Set(M.map(m => m.guild)).size, p: S => Object.keys(S.guildsDone).length },
    { id: 'group1', t: 'Erster Kreislauf', d: 'Vervollständige eine ganze Gildengruppe.', i: '♻️', tier: 2, goal: 1, p: S => Object.keys(S.groupsDone).length },
    { id: 'nitro', t: 'Stickstoffkreislauf', d: 'Entdecke alle Mikroben der Gruppe Stickstoff.', i: '💨', tier: 3, goal: M.filter(m => m.guildGroup === 'Stickstoff').length, p: S => countWhere(S, m => m.guildGroup === 'Stickstoff') },
    { id: 'sulfur', t: 'Schwefelkreislauf', d: 'Entdecke alle Mikroben der Gruppe Schwefel.', i: '🌋', tier: 3, goal: M.filter(m => m.guildGroup === 'Schwefel').length, p: S => countWhere(S, m => m.guildGroup === 'Schwefel') },
    { id: 'iron', t: 'Eisenzeit', d: 'Entdecke alle Mikroben der Gruppe Eisen & Metalle.', i: '⛏️', tier: 3, goal: M.filter(m => m.guildGroup === 'Eisen & Metalle').length, p: S => countWhere(S, m => m.guildGroup === 'Eisen & Metalle') },
    { id: 'methane', t: 'Sumpfgas', d: 'Entdecke alle Mikroben der Gruppe Methan & Gase.', i: '🔥', tier: 3, goal: M.filter(m => m.guildGroup === 'Methan & Gase').length, p: S => countWhere(S, m => m.guildGroup === 'Methan & Gase') },
    { id: 'light', t: 'Photosynthese', d: 'Entdecke alle lichtnutzenden Mikroben.', i: '☀️', tier: 3, goal: M.filter(m => m.guildGroup === 'Licht').length, p: S => countWhere(S, m => m.guildGroup === 'Licht') },
    { id: 'ferment', t: 'Gärkeller', d: 'Entdecke alle Mikroben der Gruppe Gärung.', i: '🍺', tier: 3, goal: M.filter(m => m.guildGroup === 'Gärung').length, p: S => countWhere(S, m => m.guildGroup === 'Gärung') },
    { id: 'symbio', t: 'Gute Nachbarn', d: 'Entdecke alle Symbionten.', i: '🤝', tier: 3, goal: M.filter(m => m.guildGroup === 'Symbiose').length, p: S => countWhere(S, m => m.guildGroup === 'Symbiose') },
    { id: 'extremo', t: 'Grenzgänger:in', d: 'Entdecke alle Extremophilen.', i: '🧊', tier: 3, goal: M.filter(m => m.guildGroup === 'Extremophile').length, p: S => countWhere(S, m => m.guildGroup === 'Extremophile') },
    { id: 'wood', t: 'Totholz', d: 'Entdecke alle Mikroben der Gruppe Holz & Fäule.', i: '🪵', tier: 3, goal: M.filter(m => m.guildGroup === 'Holz & Fäule').length, p: S => countWhere(S, m => m.guildGroup === 'Holz & Fäule') },

    // --- Nährböden & Lebensräume ---
    { id: 'subs10', t: 'Nährbodenkunde', d: 'Entdecke Mikroben mit 10 verschiedenen Nährböden.', i: '🧪', tier: 2, goal: 10, p: S => new Set(M.filter(m => S.discovered[m.id]).map(m => m.substrate)).size },
    { id: 'subsall', t: 'Alles verwertbar', d: 'Entdecke zu jeder Nährbodengruppe mindestens eine Mikrobe.', i: '🥣', tier: 3, goal: new Set(Object.values(D.SUBSTRATES)).size, p: S => new Set(M.filter(m => S.discovered[m.id]).map(m => m.substrateGroup)).size },
    { id: 'habitats', t: 'Weltreisende', d: 'Entdecke Mikroben aus jedem Lebensraum-Typ.', i: '🗺️', tier: 3, goal: new Set(Object.values(D.HABITATS)).size, p: S => new Set(M.filter(m => S.discovered[m.id]).map(m => m.habitatGroup)).size },
    { id: 'anaerob', t: 'Ohne Luft', d: 'Entdecke 20 anaerobe Mikroben.', i: '🚫', tier: 2, goal: 20, p: S => countWhere(S, m => m.oxygen === 'anaerob') },
    { id: 'hyper', t: 'Kochfest', d: 'Entdecke 10 hyperthermophile Mikroben.', i: '♨️', tier: 2, goal: 10, p: S => countWhere(S, m => m.temp === 'hyperthermophil') },
    { id: 'psychro', t: 'Eiskalt', d: 'Entdecke 8 psychrophile Mikroben.', i: '❄️', tier: 2, goal: 8, p: S => countWhere(S, m => m.temp === 'psychrophil') },
    { id: 'sediment', t: 'Im Schlamm', d: 'Entdecke 15 Mikroben aus Sediment.', i: '🪸', tier: 2, goal: 15, p: S => countWhere(S, m => m.habitat === 'Sediment') },
    { id: 'forms', t: 'Formenlehre', d: 'Entdecke 15 verschiedene Zell- oder Virionformen.', i: '🔷', tier: 2, goal: 15, p: S => new Set(M.filter(m => S.discovered[m.id]).map(m => m.form)).size },

    // --- Seltenheit ---
    { id: 'rare5', t: 'Glücksgriff', d: 'Entdecke 5 seltene Mikroben (★★★ oder besser).', i: '💎', tier: 2, goal: 5, p: S => countWhere(S, m => m.rarity >= 3) },
    { id: 'epic5', t: 'Epische Kultur', d: 'Entdecke 5 epische Mikroben (★★★★).', i: '🟣', tier: 3, goal: 5, p: S => countWhere(S, m => m.rarity === 4) },
    { id: 'legend1', t: 'Legende im Glas', d: 'Entdecke eine legendäre Mikrobe (★★★★★).', i: '🌟', tier: 3, goal: 1, p: S => countWhere(S, m => m.rarity === 5) },
    { id: 'legend10', t: 'Legendäre Sammlung', d: 'Entdecke 10 legendäre Mikroben.', i: '👑', tier: 4, goal: 10, p: S => countWhere(S, m => m.rarity === 5) },

    // --- Spielweise ---
    { id: 'perfect1', t: 'Volltreffer', d: 'Bestimme eine Mikrobe beim ersten Versuch.', i: '🎯', tier: 2, goal: 1, p: S => S.stats.perfect },
    { id: 'perfect10', t: 'Diagnostisches Auge', d: 'Schaffe 10 Volltreffer.', i: '🎯', tier: 3, goal: 10, p: S => S.stats.perfect },
    { id: 'wins25', t: 'Fleißige Laborarbeit', d: 'Bestimme 25 Proben erfolgreich.', i: '✅', tier: 2, goal: 25, p: S => S.stats.wins },
    { id: 'wins100', t: 'Institutslegende', d: 'Bestimme 100 Proben erfolgreich.', i: '✅', tier: 4, goal: 100, p: S => S.stats.wins },
    { id: 'hazard1', t: 'Erster Ausbruch', d: 'Erlebe deinen ersten Biohazard-Alarm.', i: '☣️', tier: 1, goal: 1, p: S => S.stats.losses },
    { id: 'hazard10', t: 'Dekontaminationsroutine', d: 'Überstehe 10 Biohazard-Alarme.', i: '🧯', tier: 2, goal: 10, p: S => S.stats.losses },
    { id: 'tests50', t: 'Plättchenleger:in', d: 'Trage 50 Nährboden-Plättchen auf.', i: '🧫', tier: 2, goal: 50, p: S => S.stats.tests || 0 },
    { id: 'clean10', t: 'Saubere Schale', d: 'Gewinne 10-mal mit mindestens 5 Integritätspunkten.', i: '✨', tier: 3, goal: 10, p: S => S.stats.clean || 0 },

    // --- Treue ---
    { id: 'streak3', t: 'Drei Tage am Stück', d: 'Erreiche einen Streak von 3 Tagen.', i: '🔥', tier: 1, goal: 3, p: S => S.best },
    { id: 'streak7', t: 'Laborwoche', d: 'Erreiche einen Streak von 7 Tagen.', i: '🔥', tier: 2, goal: 7, p: S => S.best },
    { id: 'streak30', t: 'Monat im Labor', d: 'Erreiche einen Streak von 30 Tagen.', i: '🔥', tier: 4, goal: 30, p: S => S.best },
    { id: 'token3', t: 'Vorratskammer', d: 'Horte 3 Gratisproben gleichzeitig.', i: '🎟️', tier: 2, goal: 3, p: S => S.stats.maxTokens || 0 },

    // --- Geheim ---
    { id: 'secret1', t: 'Schwarzmarkt-Agar', d: 'Finde den geheimen Knopf im Labor.', i: '🕳️', tier: 2, goal: 1, secret: true, p: S => S.stats.secrets || 0 },
    { id: 'secret7', t: 'Stammkunde', d: 'Nutze den geheimen Knopf an 7 Tagen.', i: '🗝️', tier: 3, goal: 7, secret: true, p: S => S.stats.secrets || 0 },
    { id: 'level5', t: 'Beförderung', d: 'Erreiche Laborlevel 5.', i: '⬆️', tier: 2, goal: 5, p: () => Germle.level().n },
    { id: 'level10', t: 'Laborleitung', d: 'Erreiche Laborlevel 10.', i: '🎓', tier: 3, goal: 10, p: () => Germle.level().n },
    { id: 'level12', t: 'Nobelpreis', d: 'Erreiche Laborlevel 12.', i: '🥇', tier: 4, goal: 12, p: () => Germle.level().n },
  ];

  const TIERS = [null,
    { name: 'Bronze', color: '#cd853f' },
    { name: 'Silber', color: '#c8d4d8' },
    { name: 'Gold', color: '#ffc845' },
    { name: 'Platin', color: '#7bf0ff' },
  ];

  const byId = Object.fromEntries(LIST.map(a => [a.id, a]));

  function state(a, S) {
    const cur = Math.max(0, Math.min(a.goal, a.p(S, D) || 0));
    return { cur, done: cur >= a.goal, frac: cur / a.goal };
  }

  /* Prüft alles und liefert die neu freigeschalteten Errungenschaften */
  function check(S) {
    S.achv = S.achv || {};
    const fresh = [];
    LIST.forEach(a => {
      if (S.achv[a.id]) return;
      if (state(a, S).done) { S.achv[a.id] = Germle.dayKey(); fresh.push(a); }
    });
    return fresh;
  }

  const progress = S => ({ done: LIST.filter(a => S.achv && S.achv[a.id]).length, total: LIST.length });

  return { LIST, TIERS, byId, state, check, progress };
})();
