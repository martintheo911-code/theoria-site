/* ==========================================================================
   FOOD — moteur d’animation
   Une seule boucle requestAnimationFrame lit le scroll et alimente tous les
   effets liés au défilement. Tout est désactivé ou simplifié quand le
   visiteur préfère réduire les animations.
   ========================================================================== */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const ART = window.FOOD_ART || {};

  const M = { y: window.scrollY, vh: window.innerHeight, vw: window.innerWidth, vel: 0, subs: [], resizeSubs: [] };

  /* ---------- Boucle ---------- */
  let lastY = window.scrollY, lastT = performance.now();
  function frame(now) {
    const dt = clamp((now - lastT) / 1000, 0.001, 0.05); lastT = now;
    const y = window.scrollY;
    M.vel += ((y - lastY) / dt - M.vel) * (1 - Math.exp(-dt * 10)); lastY = y;
    M.dir = y > M.y ? 1 : y < M.y ? -1 : M.dir || 1;
    M.y = y;
    for (let i = 0; i < M.subs.length; i++) M.subs[i](y, dt);
    requestAnimationFrame(frame);
  }
  const onFrame = fn => M.subs.push(fn);
  const onResize = fn => M.resizeSubs.push(fn);
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { M.vh = window.innerHeight; M.vw = window.innerWidth; M.resizeSubs.forEach(f => f()); }, 140);
  });
  const inView = (r, margin) => r.bottom > -(margin || 0) && r.top < M.vh + (margin || 0);

  /* ---------- Illustrations et photos ---------- */
  function art() {
    $$('[data-logo]').forEach(el => { if (ART.logo) el.innerHTML = ART.logo; });
    $$('[data-art]').forEach(el => { if (ART[el.dataset.art]) el.innerHTML = ART[el.dataset.art]; });
    // Chaque visuel montre son illustration tant que la photo n’est pas là.
    $$('[data-media]').forEach(fig => {
      const img = $('img', fig), name = fig.dataset.media;
      if (ART[name]) {
        const a = document.createElement('span');
        a.className = 'media__art'; a.setAttribute('aria-hidden', 'true'); a.innerHTML = ART[name];
        fig.insertBefore(a, fig.firstChild);
      }
      if (!img) return;
      const ok = () => fig.classList.add('has-photo');
      const ko = () => fig.classList.add('is-empty');
      if (img.complete) (img.naturalWidth ? ok : ko)();
      img.addEventListener('load', ok);
      img.addEventListener('error', ko);
    });
  }

  /* ---------- Texte roulant ---------- */
  function rolls() {
    $$('.btn, .nav__link').forEach(el => {
      if (el.children.length) return;
      const t = el.textContent.trim();
      el.innerHTML = '';
      const r = document.createElement('span'); r.className = 'roll';
      const i = document.createElement('span'); i.className = 'roll__in'; i.dataset.text = t; i.textContent = t;
      r.appendChild(i); el.appendChild(r);
      el.setAttribute('aria-label', t);
    });
  }

  /* ---------- Découpage en mots / lettres ---------- */
  function split(el, mode) {
    if (el.dataset.splitDone) return [];
    const units = [];
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            if (mode === 'light') {
              const w = document.createElement('span'); w.className = 'lw'; w.textContent = p;
              units.push(w); frag.appendChild(w); return;
            }
            const w = document.createElement('span'); w.className = 'w';
            if (mode === 'chars') {
              Array.from(p).forEach(c => {
                const s = document.createElement('span'); s.className = 'c';
                s.style.setProperty('--i', i++); s.textContent = c; w.appendChild(s);
              });
            } else {
              const wi = document.createElement('span'); wi.className = 'wi';
              wi.style.setProperty('--i', i++); wi.textContent = p; w.appendChild(wi);
            }
            units.push(w); frag.appendChild(w);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) {
          if (ch.classList.contains('inl')) units.push(ch);
          else if (ch.tagName !== 'BR') walk(ch);
        }
      });
    };
    walk(el);
    el.dataset.splitDone = '1';
    return units;
  }

  /* ---------- Apparitions ---------- */
  function reveal() {
    $$('[data-split]').forEach(el => split(el, el.dataset.split));
    const els = $$('[data-reveal], [data-split]').filter(el => !el.closest('[data-hero]'));
    const settle = el => {
      if (!el.hasAttribute('data-tilt')) return;
      const d = parseFloat(getComputedStyle(el).getPropertyValue('--i')) || 0;
      setTimeout(() => el.classList.add('is-settled'), reduced ? 0 : 1300 + d * 110);
    };
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(e => { e.classList.add('is-in'); settle(e); }); return; }
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in'); settle(en.target);
      en.target.dispatchEvent(new CustomEvent('reveal'));
      io.unobserve(en.target);
    }), { rootMargin: '0px 0px -10% 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Intro puis hero ---------- */
  function intro(done) {
    if (!root.classList.contains('show-intro')) { done(); return; }
    try { sessionStorage.setItem('food-intro', '1'); } catch (e) {}
    setTimeout(done, 2300);
    setTimeout(() => root.classList.remove('show-intro'), 3250);
  }

  function hero() {
    const sec = $('[data-hero]'); if (!sec) return;
    const title = $('.hero__title', sec), card = $('[data-hero-card]', sec);
    split(title, 'chars');
    intro(() => { sec.classList.add('is-ready'); title.classList.add('is-in'); });

    // Vidéo facultative : elle ne s’affiche que si assets/video/ferme.mp4 joue vraiment.
    const v = $('[data-hero-video]', sec);
    if (v && !reduced) {
      v.addEventListener('playing', () => card.classList.add('has-video'));
      window.addEventListener('load', () => { v.preload = 'auto'; const p = v.play(); if (p) p.catch(() => {}); });
    }
    if (reduced) return;

    const floats = $$('.float', sec), fields = $('[data-fields]', sec);
    let tx = 0, ty = 0, cx = 0, cy = 0;
    sec.addEventListener('pointermove', e => { tx = e.clientX / M.vw - .5; ty = e.clientY / M.vh - .5; });
    sec.addEventListener('pointerleave', () => { tx = ty = 0; });
    onFrame((y, dt) => {
      const r = sec.getBoundingClientRect();
      if (!inView(r)) return;
      sec.style.setProperty('--p', clamp(-r.top / r.height, 0, 1).toFixed(4));
      const k = 1 - Math.exp(-dt * 4);
      cx = lerp(cx, tx, k); cy = lerp(cy, ty, k);
      floats.forEach(f => {
        const d = parseFloat(f.dataset.depth);
        f.style.setProperty('--px', (-cx * d * 60).toFixed(1) + 'px');
        f.style.setProperty('--py', (-cy * d * 60 + y * d * .25).toFixed(1) + 'px');
      });
      fields.style.setProperty('--fx', (cx * 30).toFixed(1) + 'px');
      fields.style.setProperty('--fy', (cy * 30 - y * .15).toFixed(1) + 'px');
    });
  }

  /* ---------- Bandeau citron ---------- */
  function marquee() {
    const el = $('[data-marquee]'); if (!el) return;
    const group = $('.marquee__group', el);
    const track = document.createElement('div'); track.className = 'marquee__track';
    el.insertBefore(track, group); track.appendChild(group);
    const fill = () => {
      while (track.children.length > 1) track.removeChild(track.lastChild);
      const n = Math.max(2, Math.ceil(M.vw / group.offsetWidth) + 1);
      for (let i = 1; i < n; i++) { const c = group.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }
    };
    fill(); onResize(fill);
    if (document.fonts) document.fonts.ready.then(fill);
    if (reduced) return;
    let x = 0, dir = 1;
    onFrame((y, dt) => {
      const w = group.offsetWidth; if (!w) return;
      if (Math.abs(M.vel) > 30) dir = M.vel > 0 ? 1 : -1;
      x -= dir * (40 + Math.min(Math.abs(M.vel) * .35, 700)) * dt;
      if (x <= -w) x += w; else if (x > 0) x -= w;
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    });
  }

  /* ---------- En-tête, progression, rubrique courante ---------- */
  function header() {
    const h = $('[data-header]'), bar = $('.progress span');
    let acc = 0;
    onFrame((y, dt) => {
      const max = document.documentElement.scrollHeight - M.vh;
      bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
      if (root.classList.contains('menu-open')) return;
      acc = clamp(acc + M.vel * dt, -60, 60);
      if (y < 300 || acc < -30) h.classList.remove('is-hidden');
      else if (acc > 30) h.classList.add('is-hidden');
    });
    if (!('IntersectionObserver' in window)) return;
    const links = $$('.nav__link');
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(a => { const s = $(a.getAttribute('href')); if (s) io.observe(s); });
  }

  /* ---------- Manifeste qui s’allume ---------- */
  function manifesto() {
    const el = $('[data-light]'); if (!el) return;
    const units = split(el, 'light');
    if (reduced) { units.forEach(u => u.classList.add('is-lit')); return; }
    let lit = -1;
    onFrame(() => {
      const r = el.getBoundingClientRect();
      if (!inView(r, 200)) return;
      const p = clamp((M.vh * .82 - r.top) / (r.height + M.vh * .3), 0, 1);
      const n = Math.round(p * units.length);
      if (n === lit) return;
      lit = n;
      units.forEach((u, i) => u.classList.toggle('is-lit', i < n));
    });
  }

  /* ---------- Bandeau géant lié au scroll ---------- */
  function bigline() {
    const el = $('[data-bigline]'); if (!el || reduced) return;
    const rows = $$('.bigline__row', el);
    onFrame(() => {
      const r = el.getBoundingClientRect();
      if (!inView(r, 100)) return;
      const c = r.top + r.height / 2 - M.vh / 2;
      rows.forEach(row => {
        const s = parseFloat(row.dataset.speed), base = -(row.offsetWidth - M.vw) / 2;
        row.style.transform = `translate3d(${(base + c * s).toFixed(1)}px,0,0)`;
      });
    });
  }

  /* ---------- Traction asine : piste épinglée et âne qui laboure ---------- */
  function furrow() {
    const sec = $('[data-furrow]'); if (!sec || reduced) return;
    sec.classList.add('is-pinned');
    const pin = $('.furrow__pin', sec), track = $('[data-furrow-track]', sec);
    const ground = $('.furrow__ground', sec), donkey = $('[data-donkey]', sec);
    const trail = $('[data-trail]', sec), sproutsBox = $('[data-sprouts]', sec);
    donkey.innerHTML = ART.attelage || '';
    const legs = $$('.d-leg', donkey).map(g => ({ g, pv: g.dataset.pivot }));
    const phases = [0, Math.PI, Math.PI, 0];   // trot : pattes en diagonale ensemble
    let travel = 0, sprouts = [], lastX = null, phase = 0, amp = 0;

    const layout = () => {
      travel = Math.max(0, track.scrollWidth - M.vw);
      sec.style.height = (pin.offsetHeight + travel) + 'px';
      sproutsBox.innerHTML = '';
      const gw = ground.clientWidth;
      sprouts = [];
      for (let x = 70; x < gw - 30; x += 46 + Math.round(Math.random() * 24)) {
        const s = document.createElement('span');
        s.className = 'sprout'; s.style.left = x + 'px';
        s.style.setProperty('--k', (.7 + Math.random() * .6).toFixed(2));
        s.innerHTML = ART.pousse || '';
        sproutsBox.appendChild(s); sprouts.push({ x, el: s, up: false });
      }
    };
    layout(); onResize(layout);
    if (document.fonts) document.fonts.ready.then(layout);

    onFrame((y, dt) => {
      const r = sec.getBoundingClientRect();
      if (!inView(r)) return;
      const p = clamp(-r.top / Math.max(1, r.height - pin.offsetHeight), 0, 1);
      track.style.transform = `translate3d(${(-p * travel).toFixed(1)}px,0,0)`;

      const gw = ground.clientWidth, dw = donkey.offsetWidth;
      const x = 10 + p * (gw - dw - 20);
      const dx = lastX === null ? 0 : x - lastX; lastX = x;
      phase += dx / 9;
      amp = lerp(amp, clamp(Math.abs(dx) / (dt * 120), 0, 1), 1 - Math.exp(-dt * 8));
      legs.forEach((l, i) => {
        const a = Math.sin(phase + phases[i]) * 22 * amp;
        l.g.setAttribute('transform', `rotate(${a.toFixed(2)} ${l.pv})`);
      });
      donkey.style.setProperty('--dx', x.toFixed(1) + 'px');
      donkey.style.setProperty('--dy', (-Math.abs(Math.sin(phase)) * 4 * amp).toFixed(2) + 'px');
      const end = x + dw * .145;   // le soc de la charrue
      trail.style.setProperty('--tw', Math.max(0, end).toFixed(1) + 'px');
      sprouts.forEach(s => {
        const up = s.x < end - 30;
        if (up !== s.up) { s.up = up; s.el.classList.toggle('is-up', up); }
      });
    });
  }

  /* ---------- Cartes inclinées ---------- */
  function tilt() {
    if (!fine || reduced) return;
    $$('[data-tilt]').forEach(el => {
      const k = el.matches('[data-hero-card]') ? .6 : 1;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((px - .5) * 12 * k).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - py) * 10 * k).toFixed(2) + 'deg');
        el.style.setProperty('--lift', '-6px');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => {
        ['--rx', '--ry'].forEach(v => el.style.setProperty(v, '0deg'));
        el.style.setProperty('--lift', '0px');
      });
    });
  }

  /* ---------- Boutons magnétiques ---------- */
  function magnetic() {
    $$('.btn').forEach(el => el.addEventListener('pointerenter', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
    if (!fine || reduced) return;
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate3d(${(x * .25).toFixed(1)}px,${(y * .35).toFixed(1)}px,0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Compteurs ---------- */
  function counters() {
    const els = $$('[data-count]');
    if (reduced || !('IntersectionObserver' in window)) return;
    const fmt = (el, v) => Math.round(v).toLocaleString('fr-FR') + (el.dataset.suffix || '');
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target, to = parseFloat(el.dataset.count), t0 = performance.now();
      const step = now => {
        const k = Math.min(1, (now - t0) / 1600), e = 1 - Math.pow(1 - k, 4);
        el.textContent = fmt(el, to * e);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: .5 });
    els.forEach(el => { el.textContent = fmt(el, 0); io.observe(el); });
  }

  /* ---------- Saisons ---------- */
  function seasons() {
    const sec = $('[data-seasons]'); if (!sec) return;
    const tabs = $$('[role="tab"]', sec), pill = $('.tabs__pill', sec);
    const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
    const tones = { sage: 'var(--sage)', sky: 'var(--sky)', peach: 'var(--peach)', ash: 'var(--ash)' };
    panels.forEach(p => {
      const a = $('.season__art', p); if (ART[p.dataset.veg]) a.innerHTML = ART[p.dataset.veg];
      $$('.chips li', p).forEach((li, i) => li.style.setProperty('--i', i));
    });
    const place = () => {
      const t = tabs.find(b => b.getAttribute('aria-selected') === 'true'); if (!t) return;
      pill.style.setProperty('--l', t.offsetLeft + 'px'); pill.style.setProperty('--t', t.offsetTop + 'px');
      pill.style.setProperty('--w', t.offsetWidth + 'px'); pill.style.setProperty('--h', t.offsetHeight + 'px');
    };
    const select = (i, focus) => {
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
        panels[j].classList.remove('is-active');
      });
      void panels[i].offsetWidth;                 // relance les animations
      panels[i].classList.add('is-active');
      sec.style.setProperty('--season-bg', tones[panels[i].dataset.tone] || tones.sage);
      place();
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', e => {
        const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (n === undefined) return;
        e.preventDefault(); select((n + tabs.length) % tabs.length, true);
      });
    });
    const month = new Date().getMonth();
    select(Math.max(0, panels.findIndex(p => p.dataset.months.split(',').map(Number).includes(month))));
    onResize(place);
    if (document.fonts) document.fonts.ready.then(place);
  }

  /* ---------- Mosaïque en parallaxe ---------- */
  function mosaic() {
    if (reduced) return;
    const cols = $$('.mosaic__col');
    if (!cols.length) return;
    const box = cols[0].parentElement;
    onFrame(() => {
      const r = box.getBoundingClientRect();
      if (!inView(r, 200)) return;
      const c = r.top + r.height / 2 - M.vh / 2;
      cols.forEach(col => { col.style.transform = `translate3d(0,${(c * parseFloat(col.dataset.speed)).toFixed(1)}px,0)`; });
    });
  }

  /* ---------- Badge tournant ---------- */
  function badge() {
    const el = $('[data-badge]'); if (!el || reduced) return;
    const ring = $('.badge__ring', el);
    let a = 0, hover = false;
    el.addEventListener('pointerenter', () => { hover = true; });
    el.addEventListener('pointerleave', () => { hover = false; });
    onFrame((y, dt) => {
      a = (a + dt * ((hover ? 60 : 14) + Math.min(Math.abs(M.vel) * .08, 160)) * (M.dir || 1)) % 360;
      ring.style.setProperty('--rot', a.toFixed(2) + 'deg');
    });
  }

  /* ---------- Logo géant du pied de page ---------- */
  function footerGiant() {
    const box = $('[data-footer-giant]'); if (!box || reduced) return;
    const rays = $$('.logo-rays path', box), letters = $('.logo-letters', box);
    if (!letters) return;
    onFrame(() => {
      const r = box.getBoundingClientRect();
      if (!inView(r, 100)) return;
      const p = clamp((M.vh - r.top) / (r.height * 1.1), 0, 1);
      letters.style.setProperty('--ly', ((1 - p) * 60).toFixed(1) + '%');
      rays.forEach((ray, i) => {
        const mid = Math.abs(i - (rays.length - 1) / 2) / ((rays.length - 1) / 2);
        const k = clamp(p * 1.8 - .5 - mid * .35, 0, 1);
        ray.style.setProperty('--ray', k.toFixed(3));
        ray.style.setProperty('--ray-o', k.toFixed(3));
      });
    });
  }

  /* ---------- Curseur ---------- */
  function cursor() {
    if (!fine || reduced) return;
    root.classList.add('has-cursor');
    const c = $('.cursor'), label = $('.cursor__label', c);
    let tx = -100, ty = -100, x = -100, y = -100;
    window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    document.addEventListener('pointerleave', () => { tx = ty = -100; });
    document.addEventListener('pointerover', e => {
      const t = e.target;
      const lab = t.closest('[data-cursor]');
      c.classList.toggle('is-label', !!lab);
      if (lab) label.textContent = lab.dataset.cursor;
      c.classList.toggle('is-link', !lab && !!t.closest('a, button, [role="tab"], .chips li'));
      c.classList.toggle('is-dark', !!t.closest('[data-dark], .menu'));
    });
    onFrame((s, dt) => {
      const k = 1 - Math.exp(-dt * 18);
      x = lerp(x, tx, k); y = lerp(y, ty, k);
      c.style.setProperty('--cx', x.toFixed(1) + 'px');
      c.style.setProperty('--cy', y.toFixed(1) + 'px');
    });
  }

  /* ---------- Copier l’adresse ---------- */
  function copy() {
    $$('[data-copy]').forEach(btn => btn.addEventListener('click', () => {
      const msg = $('.visit__msg'), text = btn.dataset.copy;
      const say = t => { msg.textContent = t; clearTimeout(btn._t); btn._t = setTimeout(() => { msg.textContent = ''; }, 4000); };
      const fallback = () => {
        const addr = $('.visit__address'), r = document.createRange();
        r.selectNodeContents(addr);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        say('Adresse sélectionnée : copiez-la avec Ctrl+C ou Cmd+C.');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => say('Adresse copiée.'), fallback);
      else fallback();
    }));
  }

  /* ---------- Menu mobile ---------- */
  function menu() {
    const btn = $('[data-burger]'), m = $('[data-menu]'); if (!btn || !m) return;
    const label = $('.sr-only', btn);
    const set = open => {
      btn.setAttribute('aria-expanded', open);
      label.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
      root.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        m.hidden = false;
        $('[data-header]').classList.remove('is-hidden');
        requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add('is-open')));
      } else {
        m.classList.remove('is-open');
        setTimeout(() => { if (!m.classList.contains('is-open')) m.hidden = true; }, reduced ? 0 : 800);
      }
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    $$('a', m).forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
    onResize(() => { if (M.vw > 980 && btn.getAttribute('aria-expanded') === 'true') set(false); });
  }

  /* ---------- Démarrage ---------- */
  art();
  rolls();
  hero();
  reveal();
  marquee();
  header();
  manifesto();
  bigline();
  furrow();
  tilt();
  magnetic();
  counters();
  seasons();
  mosaic();
  badge();
  footerGiant();
  cursor();
  copy();
  menu();
  requestAnimationFrame(t => { lastT = t; frame(t); });
})();
