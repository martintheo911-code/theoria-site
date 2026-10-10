/* ==========================================================================
   THEORIA — interface
   En-tête, pied de page, intro, et composants partagés par les pages.
   ========================================================================== */
(function () {
  'use strict';

  const T = window.Theoria, G = window.TheoriaGfx, M = window.TheoriaMotion;
  const { nf, minute, typo, esc, dateShort, dateLong } = T.fmt;
  const qs = (s, r) => (r || document).querySelector(s);
  const qsa = (s, r) => Array.from((r || document).querySelectorAll(s));
  const page = document.body.dataset.page;
  const home = page === 'home';
  const H = home ? '' : 'index.html';

  /* ---------- Icônes ---------- */
  const I = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.4 4.5 4.5 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6"/></svg>',
    burger: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V5M6 11l6-6 6 6"/></svg>'
  };
  /** Le Θ : rond central traversé par la ligne médiane. */
  const mark = cls => `<svg class="${cls || ''}" viewBox="0 0 52 72" aria-hidden="true"><ellipse cx="26" cy="36" rx="21" ry="31" pathLength="1"/><line x1="5" y1="36" x2="47" y2="36" pathLength="1"/></svg>`;
  const logo = () => `<span class="logo__t">THE</span><span class="logo__o">${mark()}</span><span class="logo__t">RIA</span>`;

  const btn = (label, href, cls) =>
    `<a class="btn ${cls || ''}" href="${href}" data-magnetic="0.22"><span class="btn__roll"><span data-text="${esc(label)}">${esc(label)}</span></span></a>`;
  const linkArrow = (label, href, cls) =>
    `<a class="link-arrow ${cls || ''}" href="${href}"><span>${esc(label)}</span>${I.arrow}</a>`;
  const lines = arr => arr.map((l, i) => `<span class="line"><span class="line__in" style="--i:${i}">${esc(l)}</span></span>`).join(' ');
  const scorers = (m, side) => {
    const by = {};
    m.events.filter(e => e.t === 'goal' && e.side === side).forEach(e => {
      const k = T.lastName(e.name);
      (by[k] = by[k] || []).push(minute(e.m) + (e.pen ? ' (pen.)' : ''));
    });
    return Object.entries(by).map(([n, mins]) => `${n} ${mins.join(', ')}`).join(' · ');
  };

  /* ==========================================================================
     En-tête
     ========================================================================== */
  function headerHtml() {
    const week = T.matches.filter(m => (T.matches[0].when - m.when) / 864e5 < 7);
    const clubs = Object.values(T.clubs).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    const lastOf = id => T.matches.find(m => m.home === id || m.away === id);
    const f = T.featured;
    return `
    <div class="util">
      <div class="util__inner">
        <p class="util__note">Les résumés de la veille, chaque matin avant 8 h</p>
        <nav class="util__links" aria-label="Liens utiles">
          <a href="${H}#newsletter">Newsletter</a><span aria-hidden="true">|</span>
          <a href="#aide">Aide</a><span aria-hidden="true">|</span>
          <a href="#connexion">S’identifier</a>
        </nav>
      </div>
    </div>
    <div class="nav">
      <div class="nav__inner">
        <a class="logo" href="index.html" aria-label="THEORIA, accueil">${logo()}</a>
        <nav class="nav__menu" aria-label="Navigation principale">
          <ul>
            <li data-mega="resumes"><a class="nav__link" href="${H}#resumes" aria-haspopup="true" aria-expanded="false" aria-controls="mega-resumes">Résumés</a></li>
            <li data-mega="clubs"><a class="nav__link" href="${H}#resumes" aria-haspopup="true" aria-expanded="false" aria-controls="mega-clubs">Clubs</a></li>
            <li><a class="nav__link" href="${H}#chiffres">Chiffres</a></li>
            <li><a class="nav__link" href="${H}#theorie">La théorie</a></li>
            <li><a class="nav__link" href="${H}#joueurs">Joueurs</a></li>
          </ul>
        </nav>
        <div class="nav__tools">
          <div class="search" role="search">
            <label class="sr-only" for="site-search">Rechercher un match ou un club</label>
            <span class="search__icon">${I.search}</span>
            <input id="site-search" class="search__input" type="search" placeholder="Rechercher" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="search-results">
            <ul id="search-results" class="search__results" role="listbox" hidden></ul>
          </div>
          <a class="icon-btn" href="#favoris" aria-label="Favoris">${I.heart}</a>
          <a class="icon-btn" href="#compte" aria-label="Mon compte">${I.user}</a>
          <button class="icon-btn nav__burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-menu">${I.burger}</button>
        </div>
      </div>
      <div class="mega" id="mega-resumes" data-panel="resumes" aria-hidden="true">
        <div class="mega__inner">
          <div class="mega__col">
            <p class="mega__head">Cette semaine</p>
            <ul>${week.map(m => `<li><a href="${m.href}"><span class="mega__score">${m.scoreLine}</span>${esc(m.title)}</a></li>`).join('')}</ul>
          </div>
          <div class="mega__col">
            <p class="mega__head">Compétitions</p>
            <ul>
              <li><a href="${H}#resumes" data-filter-link="*">Tous les résumés</a></li>
              ${T.data.competitions.map(c => `<li><a href="${H}#resumes" data-filter-link="${esc(c)}">${esc(c)}</a></li>`).join('')}
            </ul>
          </div>
          <a class="mega__feature" href="${f.href}" data-spot>
            <span class="mega__media"><canvas data-poster="${f.id}" data-tone="dark"></canvas></span>
            <span class="mega__kicker">À la une · ${esc(f.competition)}</span>
            <span class="mega__title">${esc(f.title)}</span>
          </a>
        </div>
      </div>
      <div class="mega" id="mega-clubs" data-panel="clubs" aria-hidden="true">
        <div class="mega__inner mega__inner--clubs">
          <p class="mega__head">Dernier résumé de chaque club</p>
          <ul class="mega__clubs">${clubs.map(c => { const m = lastOf(c.id); return m ? `<li><a href="${m.href}"><span class="mega__code">${c.short}</span>${esc(c.name)}</a></li>` : ''; }).join('')}</ul>
        </div>
      </div>
    </div>`;
  }

  function mobileMenuHtml() {
    return `
    <div class="mobile-menu__top">
      <a class="logo" href="index.html" aria-label="THEORIA, accueil">${logo()}</a>
      <button class="icon-btn" type="button" data-close-menu aria-label="Fermer le menu">${I.close}</button>
    </div>
    <nav aria-label="Menu mobile">
      <ul class="mobile-menu__main">
        ${[['Résumés', '#resumes'], ['Moments clés', '#moments'], ['Chiffres', '#chiffres'], ['La théorie', '#theorie'], ['Joueurs', '#joueurs'], ['Newsletter', '#newsletter']]
          .map(([l, h], i) => `<li style="--i:${i}"><a href="${H}${h}">${l}${I.right}</a></li>`).join('')}
      </ul>
      <p class="mobile-menu__head">Derniers résumés</p>
      <ul class="mobile-menu__list">
        ${T.matches.slice(0, 5).map((m, i) => `<li style="--i:${i + 6}"><a href="${m.href}"><span class="mega__score">${m.scoreLine}</span><span>${esc(m.title)}</span></a></li>`).join('')}
      </ul>
    </nav>`;
  }

  function chrome() {
    const header = qs('[data-chrome="header"]');
    const footer = qs('[data-chrome="footer"]');
    if (header) {
      header.innerHTML = headerHtml();
      const scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.setAttribute('aria-hidden', 'true');
      header.after(scrim);
      const mm = document.createElement('div');
      mm.className = 'mobile-menu'; mm.id = 'mobile-menu'; mm.setAttribute('aria-hidden', 'true');
      mm.innerHTML = mobileMenuHtml();
      document.body.appendChild(mm);
      qsa('.mega', header).forEach(p => qsa('li', p).forEach((li, i) => li.style.setProperty('--i', Math.min(i, 12))));
      setupMega(header, scrim);
      setupSearch(header);
      setupMobile(header, mm);
      M.header(header);
    }
    if (footer) footer.innerHTML = footerHtml();
    qsa('[data-to-top]').forEach(b => b.addEventListener('click', () => window.scrollTo({ top: 0, behavior: M.reduced ? 'auto' : 'smooth' })));
    qsa('[data-filter-link]').forEach(a => a.addEventListener('click', e => {
      const f = a.dataset.filterLink;
      try { sessionStorage.setItem('theoria-filter', f); } catch (err) { /* stockage indisponible */ }
      if (home && UI.applyFilter) {
        e.preventDefault();
        closeAllMenus();
        UI.applyFilter(f);
        const t = qs('#resumes'); if (t) t.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth' });
      }
    }));
  }

  let closeAllMenus = () => {};

  function setupMega(header, scrim) {
    const items = qsa('[data-mega]', header);
    let open = null, timer = null;
    const set = name => {
      clearTimeout(timer);
      if (open === name) return;
      open = name;
      qsa('.mega', header).forEach(p => {
        const on = p.dataset.panel === name;
        p.classList.toggle('is-open', on);
        p.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (on) mountPosters(p, true);
      });
      items.forEach(li => qs('a', li).setAttribute('aria-expanded', li.dataset.mega === name ? 'true' : 'false'));
      items.forEach(li => li.classList.toggle('is-active', li.dataset.mega === name));
      scrim.classList.toggle('is-on', !!name);
      header.classList.toggle('is-menu-open', !!name);
    };
    const later = () => { clearTimeout(timer); timer = setTimeout(() => set(null), 160); };
    items.forEach(li => {
      li.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') set(li.dataset.mega); });
      li.addEventListener('focusin', () => set(li.dataset.mega));
    });
    qsa('.mega', header).forEach(p => {
      p.addEventListener('pointerenter', () => clearTimeout(timer));
      p.addEventListener('focusin', () => clearTimeout(timer));
    });
    qs('.nav', header).addEventListener('pointerleave', later);
    qsa('.nav__menu > ul > li:not([data-mega]) a, .nav__tools', header).forEach(el => el.addEventListener('pointerenter', () => set(null)));
    header.addEventListener('focusout', e => { if (!header.contains(e.relatedTarget)) later(); });
    scrim.addEventListener('click', () => set(null));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(null); });
    closeAllMenus = () => set(null);
  }

  function setupSearch(header) {
    const input = qs('#site-search', header), list = qs('#search-results', header);
    const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    let active = -1;
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); active = -1; input.removeAttribute('aria-activedescendant'); };
    const mark = () => qsa('[role="option"]', list).forEach((li, i) => {
      li.classList.toggle('is-active', i === active);
      if (i === active) input.setAttribute('aria-activedescendant', li.id);
    });
    input.addEventListener('input', () => {
      const q = norm(input.value.trim());
      if (!q) { close(); return; }
      const res = T.matches.filter(m => norm([m.h.name, m.a.name, m.h.short, m.a.short, m.title, m.competition].join(' ')).includes(q)).slice(0, 6);
      list.innerHTML = res.length
        ? res.map((m, i) => `<li role="option" id="sr-${i}"><a href="${m.href}" tabindex="-1"><span class="mega__score">${m.scoreLine}</span><span class="search__title">${esc(m.title)}</span><span class="search__meta">${esc(m.competition)} · ${dateShort(m.when)}</span></a></li>`).join('')
        : `<li class="search__empty">Aucun résumé ne correspond à « ${esc(input.value.trim())} ».</li>`;
      list.hidden = false; input.setAttribute('aria-expanded', 'true'); active = -1;
    });
    input.addEventListener('keydown', e => {
      const opts = qsa('[role="option"]', list);
      if (e.key === 'ArrowDown' && opts.length) { e.preventDefault(); active = (active + 1) % opts.length; mark(); }
      else if (e.key === 'ArrowUp' && opts.length) { e.preventDefault(); active = (active - 1 + opts.length) % opts.length; mark(); }
      else if (e.key === 'Enter') { const t = opts[Math.max(0, active)]; if (t) { e.preventDefault(); window.location.href = qs('a', t).href; } }
      else if (e.key === 'Escape') { close(); }
    });
    input.addEventListener('blur', () => setTimeout(close, 180));
    input.addEventListener('focus', () => { if (input.value.trim()) input.dispatchEvent(new Event('input')); });
  }

  function setupMobile(header, mm) {
    const burger = qs('.nav__burger', header);
    const set = on => {
      mm.classList.toggle('is-open', on);
      mm.setAttribute('aria-hidden', on ? 'false' : 'true');
      burger.setAttribute('aria-expanded', on ? 'true' : 'false');
      document.documentElement.classList.toggle('is-locked', on);
      if (on) setTimeout(() => qs('[data-close-menu]', mm).focus(), 50); else burger.focus({ preventScroll: true });
    };
    burger.addEventListener('click', () => set(true));
    qs('[data-close-menu]', mm).addEventListener('click', () => set(false));
    qsa('a', mm).forEach(a => a.addEventListener('click', () => { if (mm.classList.contains('is-open')) set(false); }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && mm.classList.contains('is-open')) set(false); });
  }

  /* ==========================================================================
     Pied de page
     ========================================================================== */
  function footerHtml() {
    const col = (title, links) => `<div class="fcol"><h2 class="fcol__title">${title}</h2><ul>${links.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>`;
    return `
    <div class="footer__top">
      <div class="footer__cols">
        ${col('Résumés', [['Cette semaine', H + '#a-la-une'], ['Championnat', H + '#resumes'], ['Coupe', H + '#resumes'], ['Coupe d’Europe', H + '#resumes']])}
        ${col('Aide', [['Questions fréquentes', '#faq'], ['Signaler une erreur', '#erreur'], ['Nous contacter', '#contact']])}
        ${col('THEORIA', [['La méthode', H + '#theorie'], ['Comment on calcule les xG', H + '#chiffres'], ['Rejoindre l’équipe', '#equipe']])}
        ${col('Communauté', [['Newsletter', H + '#newsletter'], ['Instagram', '#instagram'], ['YouTube', '#youtube'], ['X', '#x']])}
      </div>
      <p class="footer__region">${I.globe}<span>France</span></p>
    </div>
    <div class="footer__mark" data-reveal="mark" aria-hidden="true">
      ${'THE'.split('').map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}<span class="footer__o" style="--i:3">${mark()}</span>${'RIA'.split('').map((c, i) => `<span style="--i:${i + 4}">${c}</span>`).join('')}
    </div>
    <div class="footer__bottom">
      <p class="footer__note">Le Θ de THEORIA, c’est le rond central traversé par la ligne médiane : là où chaque match commence.</p>
      <ul class="footer__legal">
        <li>© 2026 THEORIA</li>
        <li><a href="#mentions">Mentions légales</a></li>
        <li><a href="#confidentialite">Confidentialité</a></li>
        <li><a href="#cookies">Cookies</a></li>
      </ul>
      <button class="btn btn--ghost" type="button" data-to-top><span class="btn__roll"><span data-text="Haut de page">Haut de page</span></span>${I.up}</button>
    </div>
    <p class="footer__demo">Démonstration : les clubs, joueurs et matchs présentés sont fictifs.</p>`;
  }

  /* ==========================================================================
     Intro (une fois par session)
     ========================================================================== */
  function intro() {
    const el = qs('[data-intro]');
    const root = document.documentElement;
    const show = root.classList.contains('show-intro') && el && !M.reduced;
    try { sessionStorage.setItem('theoria-intro', '1'); } catch (e) { /* stockage indisponible */ }
    if (!show) {
      root.classList.remove('show-intro');
      if (el) el.remove();
      requestAnimationFrame(() => root.classList.add('is-loaded'));
      return;
    }
    el.innerHTML = `<div class="intro__stage">${mark('intro__mark')}<p class="intro__word">${'THEORIA'.split('').map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</p><p class="intro__tag">Résumés de match</p></div>`;
    root.classList.add('is-intro');
    requestAnimationFrame(() => el.classList.add('is-on'));
    setTimeout(() => { el.classList.add('is-out'); root.classList.add('is-loaded'); root.classList.remove('is-intro'); }, 1450);
    setTimeout(() => { el.remove(); root.classList.remove('show-intro'); }, 2400);
  }

  /* ==========================================================================
     Affiches : dessinées quand leur section approche de l’écran
     ========================================================================== */
  let posterIO = null;
  const pending = new Set();
  function drawPoster(cv) {
    const m = T.byId[cv.dataset.poster]; if (!m) return;
    const go = () => {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv._w === w && cv._h === h) return;
      if (G.poster(cv, m, cv.dataset.tone)) { cv._w = w; cv._h = h; cv.classList.add('is-drawn'); }
    };
    (m.poster === 'score' ? G.displayFont() : Promise.resolve()).then(go);
  }
  function mountPosters(root, now) {
    const cvs = qsa('canvas[data-poster]', root);
    if (now || !('IntersectionObserver' in window)) { cvs.forEach(drawPoster); }
    else {
      if (!posterIO) {
        posterIO = new IntersectionObserver(entries => entries.forEach(en => {
          if (!en.isIntersecting) return;
          posterIO.unobserve(en.target);
          qsa('canvas[data-poster]', en.target).forEach(drawPoster);
        }), { rootMargin: '400px 0px' });
      }
      const groups = new Set(cvs.map(cv => cv.closest('[data-poster-group]') || cv.parentElement));
      groups.forEach(g => posterIO.observe(g));
    }
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(es => es.forEach(e => {
        const cv = e.target; if (cv._w == null) return;
        clearTimeout(cv._t); cv._t = setTimeout(() => drawPoster(cv), 160);
      }));
      cvs.forEach(cv => ro.observe(cv));
    }
  }

  /* ==========================================================================
     Hero
     ========================================================================== */
  function hero(el, m, mode) {
    const isHome = mode === 'home';
    const goal = m.events.filter(e => e.t === 'goal').find(e => e.m === m.replay) || m.events.filter(e => e.t === 'goal').pop();
    el.style.setProperty('--grain', `url("${G.noiseURL()}")`);
    const hud = goal
      ? `<p class="hero__hud" aria-hidden="true"><span class="hud__dot"></span><span>Reconstitution schématique</span><span class="hud__sep"></span><span>But de ${esc(goal.name)}, ${minute(goal.m)}</span><span class="hud__flash" data-hud-flash>But</span></p>`
      : '';
    const kicker = isHome
      ? `À la une · ${esc(m.competition)} · ${esc(m.round)}`
      : `${esc(m.competition)} · ${esc(m.round)} · ${dateLong(m.when)}`;
    if (isHome) {
      el.innerHTML = `
        <canvas class="hero__canvas" aria-hidden="true"></canvas>
        <div class="hero__grain" aria-hidden="true"></div>
        ${hud}
        <div class="hero__inner">
          <p class="hero__kicker hero__fade" style="--i:0">${kicker}</p>
          <p class="hero__match hero__fade" style="--i:1">${esc(m.h.name)} <span>${m.score[0]}–${m.score[1]}</span> ${esc(m.a.name)}</p>
          <h1 class="hero__title"><span class="sr-only">${esc(m.h.name)} – ${esc(m.a.name)} : </span>${lines(m.hero)}</h1>
          <p class="hero__dek hero__fade" style="--i:3">${typo(m.dek)}</p>
          <div class="hero__actions hero__fade" style="--i:4">${btn('Lire le résumé', m.href, 'btn--light')}${linkArrow('Les moments clés', '#moments', 'link-arrow--light')}</div>
        </div>
        <div class="hero__scroll" aria-hidden="true"><span></span></div>`;
    } else {
      el.innerHTML = `
        <canvas class="hero__canvas" aria-hidden="true"></canvas>
        <div class="hero__grain" aria-hidden="true"></div>
        ${hud}
        <div class="hero__inner hero__inner--match">
          <div class="hero__text">
            <p class="hero__kicker hero__fade" style="--i:0">${kicker}</p>
            <p class="hero__teams hero__fade" style="--i:1"><span class="crest">${m.h.short}</span>${esc(m.h.name)}<span class="hero__vs">–</span><span class="crest">${m.a.short}</span>${esc(m.a.name)}</p>
            <h1 class="hero__title hero__title--match">${lines(m.hero)}<span class="sr-only"> : ${esc(m.title)}</span></h1>
            <p class="hero__dek hero__fade" style="--i:3">${typo(m.dek)}</p>
            <p class="hero__scorers hero__fade" style="--i:4"><span><b>${m.h.short}</b> ${esc(scorers(m, 'h')) || '—'}</span><span><b>${m.a.short}</b> ${esc(scorers(m, 'a')) || '—'}</span></p>
          </div>
          <p class="hero__score hero__fade" style="--i:2" aria-label="Score final ${m.score[0]} à ${m.score[1]}">
            <span data-count="${m.score[0]}" data-duration="1200">${m.score[0]}</span><i></i><span data-count="${m.score[1]}" data-duration="1200">${m.score[1]}</span>
          </p>
        </div>
        <div class="hero__scroll" aria-hidden="true"><span></span></div>`;
    }

    const cv = qs('.hero__canvas', el);
    const flash = qs('[data-hud-flash]', el);
    const replay = new G.Replay(cv, m, {
      minute: m.replay,
      onGoal: () => { if (!flash) return; flash.classList.remove('is-on'); void flash.offsetWidth; flash.classList.add('is-on'); }
    });
    if (M.reduced) { replay.still(); }
    else {
      let visible = true;
      const sync = () => { (visible && !document.hidden) ? replay.start() : replay.stop(); };
      document.addEventListener('visibilitychange', sync);
      let start = el.parentElement.offsetTop;
      M.onResize(() => { start = el.parentElement.offsetTop; });
      M.onFrame(y => {
        const h = el.offsetHeight || 1;
        const p = Math.min(1, Math.max(0, y / (start + h)));
        replay.setScroll(p);
        el.style.setProperty('--p', p.toFixed(3));
        const v = p < 1;
        if (v !== visible) { visible = v; sync(); }
      });
      if (M.fine) {
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          replay.setPointer((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
        });
        el.addEventListener('pointerleave', () => replay.setPointer(0, 0));
      }
      sync();
    }
    M.onResize(() => { replay.resize(); if (M.reduced) replay.still(); });
    return replay;
  }

  /* ==========================================================================
     Bandeau des résultats
     ========================================================================== */
  function ticker(el) {
    const item = m => `<a class="ticker__item" href="${m.href}">
        <span class="ticker__code">${m.h.short}</span><span class="ticker__score">${m.score[0]}–${m.score[1]}</span><span class="ticker__code">${m.a.short}</span>
        <span class="ticker__meta">${esc(m.competition)} · ${dateShort(m.when)}</span></a><span class="ticker__sep" aria-hidden="true">${mark()}</span>`;
    el.innerHTML = `<p class="ticker__label">Résultats</p><div class="ticker__viewport"><div class="ticker__track" data-marquee-track><div class="ticker__group">${T.matches.map(item).join('')}</div></div></div>`;
    M.marquee(el);
  }

  /* ==========================================================================
     Tuiles « À la une »
     ========================================================================== */
  function tile(m, i) {
    return `<article class="tile" data-reveal="clip" style="--i:${i}" data-cursor="Lire" data-theme-dark>
      <div class="tile__media" data-spot><canvas data-poster="${m.id}" data-tone="dark"></canvas></div>
      <a class="tile__link" href="${m.href}" aria-label="Lire le résumé : ${esc(m.title)}"></a>
      <div class="tile__body">
        <p class="tile__kicker">${esc(m.competition)} · ${esc(m.round)}</p>
        <h3 class="tile__title">${esc(m.title)}</h3>
        <p class="tile__score"><span>${m.h.short}</span> ${m.score[0]}–${m.score[1]} <span>${m.a.short}</span></p>
        <div class="tile__actions">${btn('Lire le résumé', m.href, 'btn--light')}</div>
      </div>
    </article>`;
  }

  /* ==========================================================================
     Moments clés (défilement horizontal épinglé)
     ========================================================================== */
  function moments(el, m, opts) {
    opts = opts || {};
    const list = m.moments;
    const end = m.endMinute;
    const cards = list.map((e, i) => {
      const club = m.club(e.side);
      const who = e.t === 'sub' ? `${esc(e.inName)} remplace ${esc(e.outName)}`
        : e.name ? `${esc(e.name)} · ${esc(club.name)}` : esc(club.name);
      const xg = e.xg != null ? `<span class="moment__xg">xG ${nf(e.xg, 2)}</span>` : '';
      return `<article class="moment" data-moment="${i}">
        <div class="moment__media">${G.momentSvg(m, e)}</div>
        <div class="moment__head">
          <span class="moment__min">${minute(e.m)}</span>
          <span class="moment__tags"><span class="pill pill--light">${esc(e.label)}</span><span class="moment__state">${m.h.short} ${e.score[0]}–${e.score[1]} ${m.a.short}</span></span>
        </div>
        <h3 class="moment__title">${esc(e.title || e.label)}</h3>
        <p class="moment__text">${typo(e.text || '')}</p>
        <p class="moment__who">${who}${xg}</p>
      </article>`;
    }).join('');
    const markers = list.map((e, i) => `<span class="tl__mark tl__mark--${e.t}" style="--x:${(Math.min(e.m, end) / end * 100).toFixed(2)}%" data-mark="${i}"><i></i><b>${minute(e.m)}</b></span>`).join('');
    el.setAttribute('data-theme-dark', '');
    el.innerHTML = `
      <div class="moments__sticky" data-sticky>
        <div class="moments__head">
          <div>
            <p class="eyebrow eyebrow--light">Moments clés</p>
            <h2 class="sec-title sec-title--light" data-split>${esc(opts.title || `${m.h.name} – ${m.a.name}, minute par minute`)}</h2>
          </div>
          <p class="moments__clock" aria-hidden="true"><span data-clock>${minute(list[0] ? list[0].m : 0)}</span><small data-clock-score>${m.h.short} ${list[0] ? list[0].score.join('–') : '0–0'} ${m.a.short}</small></p>
        </div>
        <div class="moments__track" data-track>
          ${cards}
          <article class="moment moment--end">
            <p class="eyebrow eyebrow--light">Coup de sifflet final</p>
            <p class="moment__final">${m.score[0]}<i></i>${m.score[1]}</p>
            <p class="moment__text">${esc(m.h.name)} – ${esc(m.a.name)} · ${esc(m.competition)}, ${esc(m.round)}</p>
            ${opts.more ? btn('Lire le résumé complet', m.href, 'btn--light') : btn('Voir les chiffres', '#chiffres', 'btn--light')}
          </article>
        </div>
        <div class="moments__timeline" aria-hidden="true">
          <div class="tl"><span class="tl__half" style="left:${(45 / end * 100).toFixed(2)}%"></span><span class="tl__fill" data-tl-fill></span>${markers}</div>
          <div class="tl__ticks"><span style="left:0">0’</span><span style="left:${(45 / end * 100).toFixed(2)}%">Mi-temps</span><span style="left:100%">${minute(end)}</span></div>
        </div>
      </div>`;
    if (!opts.more) {
      const b = qs('.moment--end .btn', el);
      if (b) b.addEventListener('click', e => { const t = qs('#chiffres'); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth' }); } });
    }
    const clock = qs('[data-clock]', el), clockScore = qs('[data-clock-score]', el), fill = qs('[data-tl-fill]', el);
    const cardsEl = qsa('.moment[data-moment]', el), marks = qsa('[data-mark]', el);
    let lastActive = -1;
    const update = p => {
      const n = list.length; if (!n) return;
      const f = Math.min(n - 1, p * (n - 0.35));
      const i = Math.floor(f), k = f - i;
      const a = list[i], b = list[Math.min(n - 1, i + 1)];
      const mm = Math.round(a.m + (b.m - a.m) * Math.max(0, Math.min(1, k)));
      clock.textContent = minute(mm);
      fill.style.transform = `scaleX(${(Math.min(mm, end) / end).toFixed(4)})`;
      const active = Math.min(n - 1, Math.round(f));
      if (active !== lastActive) {
        lastActive = active;
        cardsEl.forEach((c, j) => c.classList.toggle('is-active', j === active));
        marks.forEach((c, j) => { c.classList.toggle('is-past', j <= active); c.classList.toggle('is-active', j === active); });
        clockScore.textContent = `${m.h.short} ${list[active].score.join('–')} ${m.a.short}`;
      }
    };
    update(0);
    M.hscroll(el, update);
  }

  /* ==========================================================================
     Le match en chiffres
     ========================================================================== */
  function stats(el, m, opts) {
    opts = opts || {};
    const s = m.stats;
    const rows = [
      ['Tirs', s.shots], ['Tirs cadrés', s.onTarget], ['Buts attendus (xG)', m.xg, 2], ['Passes', s.passes],
      ['Précision des passes', s.passAcc, 0, ' %'], ['Corners', s.corners], ['Fautes', s.fouls],
      ['Cartons jaunes', m.yellows], ['Hors-jeu', s.offsides]
    ];
    const bar = ([label, v, d, suf], i) => {
      const tot = (v[0] + v[1]) || 1;
      const lead = v[0] === v[1] ? '' : v[0] > v[1] ? ' is-lead-h' : ' is-lead-a';
      return `<li class="bar${lead}" style="--h:${(v[0] / tot).toFixed(3)};--a:${(v[1] / tot).toFixed(3)};--i:${i}">
        <span class="bar__v bar__v--h" data-count="${v[0]}" data-decimals="${d || 0}" data-suffix="${suf || ''}">${nf(v[0], d || 0)}${suf || ''}</span>
        <span class="bar__label">${label}</span>
        <span class="bar__v bar__v--a" data-count="${v[1]}" data-decimals="${d || 0}" data-suffix="${suf || ''}">${nf(v[1], d || 0)}${suf || ''}</span>
        <span class="bar__track bar__track--h"><i></i></span><span class="bar__track bar__track--a"><i></i></span>
      </li>`;
    };
    el.innerHTML = `
      <div class="section__inner">
        <header class="sec-head">
          <div>
            <p class="eyebrow">Le match en chiffres</p>
            <h2 class="sec-title" data-split>${esc(opts.title || 'Ce que le score ne dit pas')}</h2>
          </div>
          ${opts.more ? linkArrow('Résumé complet', m.href) : ''}
        </header>
        <div class="stats__teams" data-reveal="up">
          <p class="stats__team"><span class="key key--h"></span><b>${m.h.short}</b> <span class="stats__name">${esc(m.h.name)}</span></p>
          <p class="stats__score">${m.score[0]}–${m.score[1]}</p>
          <p class="stats__team stats__team--a"><span class="stats__name">${esc(m.a.name)}</span> <b>${m.a.short}</b><span class="key key--a"></span></p>
        </div>
        <div class="stats__grid">
          <div class="stats__col" data-reveal="bars">
            <div class="poss" style="--h:${s.possession[0] / 100};--a:${s.possession[1] / 100}">
              <p class="poss__nums"><span class="poss__n" data-count="${s.possession[0]}" data-suffix=" %">${s.possession[0]} %</span><span class="poss__label">Possession</span><span class="poss__n" data-count="${s.possession[1]}" data-suffix=" %">${s.possession[1]} %</span></p>
              <div class="poss__bar"><span class="poss__h"></span><span class="poss__a"></span></div>
            </div>
            <ul class="bars">${rows.map(bar).join('')}</ul>
          </div>
          <div class="stats__col stats__col--viz">
            <figure class="viz" data-reveal="up" data-xg>
              <figcaption class="viz__cap"><span>Buts attendus cumulés</span><span class="viz__legend"><span><i class="key key--h"></i>${m.h.short}</span><span><i class="key key--a"></i>${m.a.short}</span></span></figcaption>
              <div class="viz__body">${G.xgChartSvg(m)}</div>
            </figure>
            <figure class="viz" data-reveal="up">
              <figcaption class="viz__cap"><span>Carte des tirs</span><span class="viz__legend"><span><i class="dot dot--goal"></i>But</span><span><i class="dot dot--on"></i>Cadré</span><span><i class="dot dot--off"></i>Non cadré</span></span></figcaption>
              <div class="viz__body shotmap" data-reveal="shots">${G.shotMapSvg(m)}</div>
              <p class="viz__note">${m.h.short} attaque vers la droite, ${m.a.short} vers la gauche. Taille des points : probabilité de but (xG).</p>
            </figure>
          </div>
        </div>
      </div>`;

    // Tracé des xG piloté par le scroll
    const fig = qs('[data-xg]', el), lines = qsa('.xg-line', el), marks = qsa('.xg-goal', el);
    const svg = qs('.xg__svg', el);
    const vb = svg.viewBox.baseVal;
    const marksAt = marks.map(c => (parseFloat(c.getAttribute('cx')) - 40) / (vb.width - 40 - 84));
    if (M.reduced) { fig.style.setProperty('--draw', 1); marks.forEach(c => c.classList.add('is-on')); }
    else {
      let last = -1;
      M.onFrame(() => {
        const r = fig.getBoundingClientRect();
        if (r.bottom < 0 || r.top > M.vh) return;
        const p = Math.max(0, Math.min(1, (M.vh * 0.92 - r.top) / (M.vh * 0.6)));
        if (Math.abs(p - last) < 0.002) return;
        last = p;
        fig.style.setProperty('--draw', p.toFixed(3));
        marks.forEach((c, i) => c.classList.toggle('is-on', p >= marksAt[i]));
      });
    }
    setupTips(el);
    return lines;
  }

  /* ---------- Info-bulles ---------- */
  let tipEl = null;
  function setupTips(root) {
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tooltip'; tipEl.setAttribute('role', 'status'); document.body.appendChild(tipEl); }
    const show = t => {
      tipEl.textContent = t.dataset.tip;
      const r = t.getBoundingClientRect();
      tipEl.classList.add('is-on');
      const tw = tipEl.offsetWidth;
      const x = Math.max(8, Math.min(window.innerWidth - tw - 8, r.left + r.width / 2 - tw / 2));
      tipEl.style.transform = `translate(${x}px, ${Math.max(8, r.top - tipEl.offsetHeight - 10)}px)`;
    };
    const hide = () => tipEl.classList.remove('is-on');
    qsa('[data-tip]', root).forEach(t => {
      t.addEventListener('pointerenter', () => show(t));
      t.addEventListener('pointerleave', hide);
      t.addEventListener('focus', () => show(t));
      t.addEventListener('blur', hide);
    });
    window.addEventListener('scroll', hide, { passive: true });
  }

  /* ==========================================================================
     Rail de résumés + filtres
     ========================================================================== */
  function card(m, i) {
    return `<article class="card" data-comp="${esc(m.competition)}" data-cursor="Lire" style="--i:${i || 0}">
      <a class="card__link" href="${m.href}" draggable="false">
        <div class="card__media" data-spot><canvas data-poster="${m.id}" data-tone="${m.tone || 'dark'}"></canvas>
          <span class="pill pill--dark card__pill">${m.scoreLine}</span>
        </div>
        <div class="card__body">
          <h3 class="card__title">${esc(m.title)}</h3>
          <p class="card__meta">${esc(m.competition)} · ${esc(m.round)} · ${dateShort(m.when)}</p>
        </div>
      </a>
    </article>`;
  }

  function rail(el, list, opts) {
    opts = opts || {};
    const counts = {}; list.forEach(m => { counts[m.competition] = (counts[m.competition] || 0) + 1; });
    const comps = T.data.competitions.filter(c => counts[c]);
    el.innerHTML = `
      <div class="section__inner">
        <header class="sec-head">
          <div>
            <p class="eyebrow">${esc(opts.eyebrow || 'Archives')}</p>
            <h2 class="sec-title" data-split>${esc(opts.title || 'Tous les résumés')}</h2>
          </div>
          <div class="rail__ctrl">
            <button class="round" type="button" data-prev aria-label="Résumés précédents">${I.left}</button>
            <button class="round" type="button" data-next aria-label="Résumés suivants">${I.right}</button>
          </div>
        </header>
        ${opts.filters ? `<div class="filters" role="group" aria-label="Filtrer par compétition">
          <button class="tag is-active" type="button" data-filter="*" aria-pressed="true">Tous <span>${list.length}</span></button>
          ${comps.map(c => `<button class="tag" type="button" data-filter="${esc(c)}" aria-pressed="false">${esc(c)} <span>${counts[c]}</span></button>`).join('')}
        </div>` : ''}
      </div>
      <div class="rail" data-rail data-reveal="rail" data-poster-group tabindex="0" aria-label="${esc(opts.title || 'Tous les résumés')}">
        ${list.map(card).join('')}
      </div>`;
    const track = qs('[data-rail]', el);
    const step = () => { const c = qs('.card:not([hidden])', track); return c ? c.offsetWidth + 12 : 300; };
    qs('[data-prev]', el).addEventListener('click', () => track.scrollBy({ left: -step(), behavior: M.reduced ? 'auto' : 'smooth' }));
    qs('[data-next]', el).addEventListener('click', () => track.scrollBy({ left: step(), behavior: M.reduced ? 'auto' : 'smooth' }));
    const syncCtrl = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      qs('[data-prev]', el).disabled = track.scrollLeft <= 2;
      qs('[data-next]', el).disabled = track.scrollLeft >= max;
    };
    track.addEventListener('scroll', syncCtrl, { passive: true });
    M.onResize(syncCtrl);
    setTimeout(syncCtrl, 50);

    // Glisser à la souris
    let down = false, sx = 0, sl = 0, moved = 0;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; sx = e.clientX; sl = track.scrollLeft; moved = 0;
      track.classList.add('is-grabbing');
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('is-grabbing'); });
    track.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);

    if (opts.filters) {
      const tags = qsa('[data-filter]', el);
      const cards = qsa('.card', track);
      const apply = f => {
        tags.forEach(t => { const on = t.dataset.filter === f; t.classList.toggle('is-active', on); t.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        const leaving = cards.filter(c => !c.hidden && f !== '*' && c.dataset.comp !== f);
        const run = () => M.flip(cards, () => {
          cards.forEach(c => { c.hidden = !(f === '*' || c.dataset.comp === f); c.style.opacity = ''; });
          track.scrollLeft = 0;
        });
        if (leaving.length && !M.reduced && Element.prototype.animate) {
          leaving.forEach(c => c.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], { duration: 220, easing: 'ease-in', fill: 'forwards' }));
          setTimeout(() => { leaving.forEach(c => c.getAnimations().forEach(a => a.cancel())); run(); setTimeout(syncCtrl, 800); }, 220);
        } else { run(); syncCtrl(); }
      };
      tags.forEach(t => t.addEventListener('click', () => apply(t.dataset.filter)));
      UI.applyFilter = apply;
      let saved = null;
      try { saved = sessionStorage.getItem('theoria-filter'); sessionStorage.removeItem('theoria-filter'); } catch (e) { /* ignore */ }
      if (saved && (saved === '*' || comps.includes(saved))) apply(saved);
    }
    mountPosters(el);
  }

  /* ==========================================================================
     Joueurs
     ========================================================================== */
  function playerCard(m, i) {
    const club = m.club(m.motm.side), opp = m.club(m.motm.side === 'h' ? 'a' : 'h');
    return `<article class="player" data-reveal="up" style="--i:${i}">
      <a class="player__link" href="${m.href}" data-tilt>
        <div class="player__media" style="--c:${club.color}">
          <span class="player__club">${club.short}</span>
          <span class="player__num player__num--fill" aria-hidden="true">${m.motm.n}</span>
          <span class="player__num player__num--line" aria-hidden="true">${m.motm.n}</span>
          <span class="player__glare" aria-hidden="true"></span>
          <span class="pill pill--dark player__rating" aria-label="Note ${nf(m.motm.rating, 1)} sur 10">${nf(m.motm.rating, 1)}</span>
        </div>
        <div class="player__body">
          <h3 class="player__name">${esc(m.motmName)}</h3>
          <p class="player__meta">${esc(club.name)} · contre ${esc(opp.name)} (${m.score[0]}–${m.score[1]})</p>
          <dl class="player__stats">${m.motm.line.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${typo(v)}</dd></div>`).join('')}</dl>
        </div>
      </a>
    </article>`;
  }

  /* ==========================================================================
     Newsletter
     ========================================================================== */
  function newsletter(root) {
    qsa('.nl-form', root).forEach(form => {
      const input = qs('input', form), msg = qs('.nl-form__msg', form);
      form.addEventListener('submit', e => {
        e.preventDefault();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        form.classList.toggle('is-error', !ok);
        input.setAttribute('aria-invalid', ok ? 'false' : 'true');
        msg.textContent = ok
          ? 'Merci. Les inscriptions ouvrent très bientôt, l’adresse n’a pas encore été enregistrée.'
          : 'Cette adresse ne semble pas complète. Vérifie qu’elle contient un « @ » et un domaine, par exemple nom@mail.fr.';
        msg.textContent = typo(msg.textContent);
      });
    });
  }

  /* ==========================================================================
     Démarrage commun
     ========================================================================== */
  function boot() {
    M.init(document);
    M.cursor();
    M.progress(qs('.progress span'));
    mountPosters(document);
    newsletter(document);
    M.start();
    intro();
  }

  const UI = window.TheoriaUI = {
    I, mark, logo, btn, linkArrow, chrome, hero, ticker, tile, moments, stats, rail, card, playerCard,
    mountPosters, setupTips, boot, scorers
  };
})();
