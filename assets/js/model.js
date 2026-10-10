/* ==========================================================================
   THEORIA — modèle
   Transforme les données brutes (data.js) en matchs prêts à afficher :
   effectifs, tirs, xG, score courant, textes formatés.
   ========================================================================== */
(function () {
  'use strict';

  const D = window.THEORIA_DATA;

  /* ---------- Hasard déterministe (même graine → même résultat) ---------- */
  function seedFrom(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(str) {
    let a = seedFrom(String(str));
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const gauss = r => (r() + r() + r() - 1.5) / 1.5;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- Formations ----------
     Numéros dans l’ordre : gardien, puis chaque ligne de haut en bas
     (de la gauche vers la droite de l’équipe quand elle attaque vers x = 100). */
  const FORMATIONS = {
    '4-3-3':   [1, 3, 5, 4, 2, 8, 6, 10, 11, 9, 7],
    '4-2-3-1': [1, 3, 5, 4, 2, 8, 6, 11, 10, 7, 9],
    '4-4-2':   [1, 3, 5, 4, 2, 11, 8, 6, 7, 10, 9],
    '3-4-3':   [1, 15, 4, 5, 3, 8, 6, 2, 11, 9, 7],
    '3-5-2':   [1, 15, 4, 5, 3, 8, 6, 10, 2, 11, 9]
  };

  /** Positions (en % du terrain) d’une formation qui attaque vers x = 100. */
  function slots(formation, x0, x1, gkX) {
    const lines = formation.split('-').map(Number);
    const out = [{ x: gkX, y: 50, line: 0 }];
    lines.forEach((n, li) => {
      const x = lines.length === 1 ? x0 : x0 + (x1 - x0) * li / (lines.length - 1);
      const spread = n === 1 ? 0 : n === 2 ? 30 : n === 3 ? 54 : n === 4 ? 70 : 80;
      for (let i = 0; i < n; i++) {
        out.push({ x, y: n === 1 ? 50 : 50 - spread / 2 + spread * i / (n - 1), line: li + 1 });
      }
    });
    return out;
  }

  /* ---------- Effectifs générés ---------- */
  const FIRST = ['Adam', 'Amine', 'Arthur', 'Axel', 'Bilal', 'Clément', 'Cyril', 'Diego', 'Dylan', 'Élie', 'Ethan', 'Fabio', 'Gabin', 'Hamza', 'Isaac', 'Jad', 'Jules', 'Kais', 'Léo', 'Liam', 'Louis', 'Mael', 'Marco', 'Matteo', 'Milan', 'Nael', 'Nils', 'Olivier', 'Raphaël', 'Rémi', 'Sami', 'Thiago', 'Tom', 'Valentin', 'William', 'Younes', 'Zinedine', 'Aaron', 'Bryan', 'Joris'];
  const LAST = ['Aubert', 'Barbier', 'Bertin', 'Blanchard', 'Bouvier', 'Caron', 'Charpentier', 'Colin', 'Diallo', 'Dupuis', 'Faure', 'Fleury', 'Gauthier', 'Guérin', 'Hubert', 'Jacquet', 'Joly', 'Klein', 'Lacroix', 'Laurent', 'Lebrun', 'Lefèvre', 'Marchand', 'Martel', 'Masson', 'Meunier', 'Morel', 'Noël', 'Pages', 'Picard', 'Poirier', 'Riviere', 'Roche', 'Roussel', 'Schmitt', 'Tessier', 'Vincent', 'Barros', 'Mendy', 'Okoro', 'Santos', 'Varga', 'Yilmaz', 'Zeller'];

  const used = new Set();
  Object.values(D.clubs).forEach(c => Object.values(c.names || {}).forEach(n => used.add(n)));

  Object.keys(D.clubs).forEach(id => {
    const c = D.clubs[id];
    c.id = id;
    c.xi = (FORMATIONS[c.formation] || FORMATIONS['4-3-3']).slice();
    c.roster = {};
    const r = rng('squad:' + id);
    const nums = Array.from(new Set(c.xi.concat([12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])));
    nums.forEach(n => {
      if (c.names && c.names[n]) { c.roster[n] = c.names[n]; return; }
      let name, tries = 0;
      do {
        name = FIRST[Math.floor(r() * FIRST.length)] + ' ' + LAST[Math.floor(r() * LAST.length)];
      } while (used.has(name) && ++tries < 60);
      used.add(name);
      c.roster[n] = name;
    });
  });

  const playerName = (club, n) => (club.roster && club.roster[n]) || ('N° ' + n);
  const lastName = full => full.split(' ').slice(1).join(' ') || full;

  /* ---------- xG ----------
     Modèle logistique simple : distance au but et angle d’ouverture. */
  function xgAt(x, y) {
    const dx = Math.max(0.5, (100 - x) * 1.05);
    const dy = (y - 50) * 0.68;
    const d = Math.hypot(dx, dy);
    const ang = Math.abs(Math.atan2(dy + 3.66, dx) - Math.atan2(dy - 3.66, dx));
    return 1 / (1 + Math.exp(0.9 + 0.11 * d - 1.5 * ang));
  }

  /* ---------- Formatage ---------- */
  const nf = (v, d = 0) => Number(v).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const minute = m => (m > 90 ? '90+' + (m - 90) : String(m)) + '’';
  const dLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
  /** Espaces insécables avant : ; ! ? et à l’intérieur des guillemets. */
  const typo = s => String(s)
    .replace(/ ([:;!?])/g, ' $1')
    .replace(/« /g, '« ').replace(/ »/g, ' »')
    .replace(/(\d) (%|xG|mètres|minutes)/g, '$1 $2');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const EVENT_LABEL = {
    goal: 'But', pen: 'Penalty', chance: 'Arrêt', post: 'Poteau', yellow: 'Carton jaune',
    red: 'Carton rouge', sub: 'Remplacement', tactic: 'Tactique', var: 'VAR'
  };

  /* ---------- Construction d’un match ---------- */
  function build(m) {
    m.h = D.clubs[m.home];
    m.a = D.clubs[m.away];
    m.club = side => (side === 'h' ? m.h : m.a);
    m.when = new Date(m.date + 'T' + (m.kickoff || '20:00') + ':00');
    m.events = m.events.slice().sort((p, q) => p.m - q.m);

    // Tirs : actions réelles + tirs générés pour coller aux statistiques
    const r = rng('shots:' + m.id);
    const shots = [];
    ['h', 'a'].forEach((side, i) => {
      const club = m.club(side);
      const real = m.events.filter(e => e.side === side && (e.t === 'goal' || e.t === 'chance' || e.t === 'post'));
      real.forEach(e => shots.push({
        m: e.m, side, n: e.n, x: e.x, y: e.y,
        goal: e.t === 'goal', on: e.t !== 'post', post: e.t === 'post', pen: !!e.pen,
        xg: e.pen ? 0.78 : xgAt(e.x, e.y), real: true
      }));
      const extra = Math.max(0, m.stats.shots[i] - real.length);
      const onLeft = m.stats.onTarget[i] - real.filter(e => e.t !== 'post').length;
      const shooters = club.xi.slice(-6);
      const taken = new Set(real.map(e => e.m));
      for (let k = 0; k < extra; k++) {
        let x, y;
        if (r() < 0.58) { x = 84 + r() * 12; y = 50 + gauss(r) * 20; }
        else { x = 66 + r() * 18; y = 50 + gauss(r) * 32; }
        y = clamp(y, 8, 92);
        let min, guard = 0;
        do { min = 1 + Math.floor(r() * 90); } while (taken.has(min) && ++guard < 40);
        taken.add(min);
        shots.push({ m: min, side, n: shooters[Math.floor(r() * shooters.length)], x, y, goal: false, on: k < onLeft, xg: xgAt(x, y) });
      }
    });
    // Total d’xG imposé : on ajuste les tirs générés, jamais les actions réelles.
    if (m.stats.xg) {
      ['h', 'a'].forEach((side, i) => {
        const gen = shots.filter(s => s.side === side && !s.real);
        const fixed = shots.filter(s => s.side === side && s.real).reduce((t, s) => t + s.xg, 0);
        const need = m.stats.xg[i] - fixed;
        if (!gen.length) return;
        if (need <= gen.length * 0.01) { gen.forEach(s => { s.xg = 0.01; }); return; }
        for (let pass = 0; pass < 8; pass++) {
          const sum = gen.reduce((t, s) => t + s.xg, 0);
          const k = need / sum;
          gen.forEach(s => { s.xg = clamp(s.xg * k, 0.01, 0.62); });
        }
      });
    }
    shots.forEach(s => {
      s.ax = s.side === 'h' ? s.x : 100 - s.x;  // coordonnées absolues :
      s.ay = s.side === 'h' ? s.y : 100 - s.y;  // domicile attaque vers la droite
      s.name = playerName(m.club(s.side), s.n);
    });
    shots.sort((p, q) => p.m - q.m);
    m.shots = shots;

    // xG cumulés
    const cum = { h: 0, a: 0 };
    m.xgSeries = { h: [[0, 0]], a: [[0, 0]] };
    shots.forEach(s => {
      cum[s.side] += s.xg;
      m.xgSeries[s.side].push([s.m, cum[s.side], s.goal]);
    });
    m.xg = [cum.h, cum.a];
    m.endMinute = Math.max(90, ...m.events.map(e => e.m), ...shots.map(s => s.m));

    // Score courant et noms
    const sc = [0, 0];
    m.events.forEach(e => {
      if (e.t === 'goal') sc[e.side === 'h' ? 0 : 1]++;
      e.score = sc.slice();
      const club = m.club(e.side);
      if (e.n) e.name = playerName(club, e.n);
      if (e.a) e.assist = playerName(club, e.a);
      if (e.in) e.inName = playerName(club, e.in);
      if (e.out) e.outName = playerName(club, e.out);
      e.label = e.pen ? EVENT_LABEL.pen : EVENT_LABEL[e.t];
      if (e.t === 'goal') {
        const s = shots.find(x => x.real && x.goal && x.m === e.m && x.side === e.side);
        if (s) e.xg = s.xg;
      }
    });
    if (sc[0] !== m.score[0] || sc[1] !== m.score[1]) {
      console.warn('[THEORIA] Score incohérent pour', m.id, sc, m.score);
    }
    m.moments = m.events.filter(e => e.key);
    m.yellows = [0, 0]; m.reds = [0, 0];
    m.events.forEach(e => {
      if (e.t === 'yellow') m.yellows[e.side === 'h' ? 0 : 1]++;
      if (e.t === 'red') m.reds[e.side === 'h' ? 0 : 1]++;
    });

    // Textes
    const tokens = s => typo(String(s).split('{xgH}').join(nf(m.xg[0], 1)).split('{xgA}').join(nf(m.xg[1], 1)));
    m.storyHtml = m.story.map(tokens);
    m.analysisText = tokens(m.analysis);
    m.scoreLine = `${m.h.short} ${m.score[0]}–${m.score[1]} ${m.a.short}`;
    m.href = 'match.html#' + m.id;
    m.motmName = m.motm ? playerName(m.club(m.motm.side), m.motm.n) : '';
    return m;
  }

  const matches = D.matches.map(build).sort((p, q) => q.when - p.when);
  const byId = Object.fromEntries(matches.map(m => [m.id, m]));

  window.Theoria = {
    data: D, clubs: D.clubs, matches, byId,
    featured: byId[D.featured] || matches[0],
    rng, gauss, clamp, slots, xgAt, playerName, lastName,
    fmt: { nf, minute, typo, esc, dateLong: d => dLong.format(d), dateShort: d => dShort.format(d) },
    EVENT_LABEL
  };
})();
