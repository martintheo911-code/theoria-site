/* ==========================================================================
   THEORIA — moteur d’animation
   Une seule boucle requestAnimationFrame lit la position de scroll et
   alimente tous les effets liés au défilement. Tout est désactivé ou
   simplifié quand l’utilisateur préfère réduire les animations.
   ========================================================================== */
(function () {
  'use strict';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const nf = (v, d) => Number(v).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

  const M = { reduced, fine, y: window.scrollY, vh: window.innerHeight, vw: window.innerWidth, vel: 0, subs: [], resizeSubs: [], docH: 0 };

  /* ---------- Boucle ---------- */
  let lastY = window.scrollY, lastT = performance.now(), running = false;
  function frame(now) {
    const dt = clamp((now - lastT) / 1000, 0.001, 0.05); lastT = now;
    const y = window.scrollY;
    const v = (y - lastY) / dt; lastY = y;
    M.vel += (v - M.vel) * (1 - Math.exp(-dt * 10));
    M.moved = y !== M.y; M.y = y;
    for (let i = 0; i < M.subs.length; i++) M.subs[i](y, dt);
    requestAnimationFrame(frame);
  }
  M.onFrame = fn => { M.subs.push(fn); };
  M.onResize = fn => { M.resizeSubs.push(fn); };
  M.start = () => { if (running) return; running = true; requestAnimationFrame(t => { lastT = t; frame(t); }); };

  let rt, lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const wChanged = window.innerWidth !== lastW; lastW = window.innerWidth;
      M.vh = window.innerHeight; M.vw = window.innerWidth;
      M.resizeSubs.forEach(f => f(wChanged));
    }, 140);
  });
  const measureDoc = () => { M.docH = document.documentElement.scrollHeight; };
  if ('ResizeObserver' in window) new ResizeObserver(measureDoc).observe(document.body);
  measureDoc();

  /* ---------- Découpage en mots ---------- */
  M.split = function (el) {
    if (el.dataset.splitDone) return el.querySelectorAll('.w');
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(ch => {
        if (ch.nodeType === 3) {
          const parts = ch.textContent.split(/( +|\n+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(p => {
            if (!p) return;
            if (/^[ \n]+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const wi = document.createElement('span'); wi.className = 'wi';
            wi.style.setProperty('--i', i++); wi.textContent = p;
            w.appendChild(wi); frag.appendChild(w);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR' && !ch.classList.contains('w')) walk(ch);
      });
    };
    walk(el);
    el.dataset.splitDone = '1';
    return el.querySelectorAll('.w');
  };

  /* ---------- Apparitions ---------- */
  let revealIO = null;
  M.reveal = function (root) {
    root = root || document;
    root.querySelectorAll('[data-split]').forEach(M.split);
    const els = root.querySelectorAll('[data-reveal]:not(.is-in), [data-split]:not(.is-in)');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
    if (!revealIO) {
      revealIO = new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        en.target.dispatchEvent(new CustomEvent('reveal'));
        revealIO.unobserve(en.target);
      }), { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    }
    els.forEach(e => revealIO.observe(e));
  };

  /* ---------- Compteurs ---------- */
  M.counters = function (root) {
    const els = (root || document).querySelectorAll('[data-count]');
    const fmt = el => v => nf(v, +(el.dataset.decimals || 0)) + (el.dataset.suffix || '');
    if (reduced || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target, to = parseFloat(el.dataset.count), f = fmt(el), t0 = performance.now();
      const dur = +(el.dataset.duration || 1500);
      const step = now => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
        el.textContent = f(to * e);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.4 });
    els.forEach(el => { el.textContent = fmt(el)(0); io.observe(el); });
  };

  /* ---------- Parallaxe ---------- */
  M.parallax = function (root) {
    if (reduced) return;
    const els = Array.from((root || document).querySelectorAll('[data-parallax]'));
    if (!els.length) return;
    M.onFrame(() => {
      els.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > M.vh + 100) return;
        const c = r.top + r.height / 2 - M.vh / 2;
        el.style.transform = `translate3d(0,${(-c * parseFloat(el.dataset.parallax)).toFixed(1)}px,0)`;
      });
    });
  };

  /* ---------- Texte qui s’allume au scroll ---------- */
  M.highlight = function (el) {
    const words = Array.from(M.split(el));
    if (reduced) { words.forEach(w => w.classList.add('is-lit')); return; }
    let last = -1;
    M.onFrame(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > M.vh + 50) return;
      const p = clamp((M.vh * 0.82 - r.top) / (r.height + M.vh * 0.22), 0, 1);
      const n = Math.round(p * words.length);
      if (n === last) return;
      for (let i = 0; i < words.length; i++) words[i].classList.toggle('is-lit', i < n);
      last = n;
    });
  };

  /* ---------- Défilement horizontal épinglé ---------- */
  M.hscroll = function (section, onProgress) {
    const sticky = section.querySelector('[data-sticky]');
    const track = section.querySelector('[data-track]');
    const mq = window.matchMedia('(min-width: 768px)');
    let pinned = false, dist = 0, cur = 0, target = 0, first = true;
    function layout() {
      pinned = mq.matches && !reduced;
      section.classList.toggle('is-pinned', pinned);
      if (pinned) {
        track.style.transform = '';
        const last = track.lastElementChild;
        const pr = parseFloat(getComputedStyle(track).paddingRight) || 0;
        dist = Math.max(0, last.offsetLeft + last.offsetWidth + pr - sticky.clientWidth);
        section.style.height = (dist + M.vh) + 'px';
      } else {
        section.style.height = '';
        track.style.transform = '';
      }
      first = true;
    }
    layout();
    M.onResize(layout);
    mq.addEventListener ? mq.addEventListener('change', layout) : mq.addListener(layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

    M.onFrame((y, dt) => {
      if (!pinned) return;
      const r = section.getBoundingClientRect();
      if (r.bottom < -10 || r.top > M.vh + 10) { if (!first) return; }
      target = clamp(-r.top / Math.max(1, r.height - M.vh), 0, 1);
      cur = first ? target : cur + (target - cur) * (1 - Math.exp(-dt * 9));
      first = false;
      track.style.transform = `translate3d(${(-cur * dist).toFixed(1)}px,0,0)`;
      onProgress && onProgress(cur);
    });
    track.addEventListener('scroll', () => {
      if (pinned) return;
      const max = track.scrollWidth - track.clientWidth;
      onProgress && onProgress(max > 0 ? track.scrollLeft / max : 0);
    }, { passive: true });
    return { layout };
  };

  /* ---------- Boutons magnétiques ---------- */
  M.magnetic = function (root) {
    if (!fine || reduced) return;
    (root || document).querySelectorAll('[data-magnetic]').forEach(el => {
      if (el._mag) return; el._mag = 1;
      const s = parseFloat(el.dataset.magnetic) || 0.3;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${(x * s).toFixed(1)}px,${(y * s * 1.2).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  };

  /* ---------- Inclinaison 3D + reflet ---------- */
  M.tilt = function (root) {
    if (!fine || reduced) return;
    (root || document).querySelectorAll('[data-tilt]').forEach(el => {
      if (el._tilt) return; el._tilt = 1;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--rx', ((0.5 - py) * 9).toFixed(2) + 'deg');
        el.style.setProperty('--ry', ((px - 0.5) * 11).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        el.classList.add('is-tilting');
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
      });
    });
  };

  /* ---------- Lumière qui suit le pointeur ---------- */
  M.spot = function (root) {
    if (!fine) return;
    (root || document).querySelectorAll('[data-spot]').forEach(el => {
      if (el._spot) return; el._spot = 1;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      });
    });
  };

  /* ---------- Curseur ---------- */
  M.cursor = function () {
    const c = document.querySelector('.cursor'), lab = document.querySelector('.cursor-label');
    if (!c || !lab || !fine || reduced) { if (c) c.remove(); if (lab) lab.remove(); return; }
    const text = lab.querySelector('span');
    const both = (cls, on) => { c.classList.toggle(cls, on); lab.classList.toggle(cls, on); };
    let x = -100, y = -100, cx = x, cy = y, lx = x, ly = y;
    window.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY; both('is-on', true);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => both('is-on', false));
    document.addEventListener('pointerover', e => {
      const el = e.target.closest ? e.target : e.target.parentElement;
      if (!el || !el.closest) return;
      const t = el.closest('[data-cursor]');
      const a = el.closest('a, button, input, label, [role="button"], [data-tip]');
      const label = t && !(a && a.closest('.btn, .tag, .round'));
      if (label) text.textContent = t.dataset.cursor;
      both('is-label', !!label);
      both('is-link', !!a && !label);
      both('on-dark', !!el.closest('[data-theme-dark]'));
    });
    document.addEventListener('pointerdown', () => both('is-down', true));
    document.addEventListener('pointerup', () => both('is-down', false));
    M.onFrame((_, dt) => {
      const k = 1 - Math.exp(-dt * 24), k2 = 1 - Math.exp(-dt * 11);
      cx += (x - cx) * k; cy += (y - cy) * k;
      lx += (x - lx) * k2; ly += (y - ly) * k2;
      c.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      lab.style.transform = `translate3d(${lx.toFixed(1)}px,${ly.toFixed(1)}px,0)`;
    });
  };

  /* ---------- Bandeau défilant (vitesse liée au scroll) ---------- */
  M.marquee = function (el) {
    const track = el.querySelector('[data-marquee-track]');
    const group = track && track.firstElementChild;
    if (!group) return;
    if (reduced) { el.classList.add('is-static'); return; }
    let gw = 0;
    const build = () => {
      Array.from(track.children).slice(1).forEach(n => n.remove());
      gw = group.getBoundingClientRect().width;
      const copies = Math.ceil(el.clientWidth / Math.max(1, gw)) + 1;
      for (let i = 0; i < copies; i++) {
        const c = group.cloneNode(true); c.setAttribute('aria-hidden', 'true');
        c.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
        track.appendChild(c);
      }
    };
    build();
    M.onResize(build);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    let x = 0, dir = -1, hover = false, skew = 0;
    el.addEventListener('pointerenter', () => { hover = true; });
    el.addEventListener('pointerleave', () => { hover = false; });
    M.onFrame((_, dt) => {
      const v = M.vel;
      if (Math.abs(v) > 40) dir = v > 0 ? -1 : 1;
      const speed = (hover ? 14 : 55) + Math.min(1100, Math.abs(v) * 0.4);
      x += dir * speed * dt;
      if (gw > 0) { while (x <= -gw) x += gw; while (x > 0) x -= gw; }
      skew += (clamp(-v * 0.004, -7, 7) - skew) * (1 - Math.exp(-dt * 8));
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    });
  };

  /* ---------- En-tête : masqué à la descente, visible à la remontée ---------- */
  M.header = function (header) {
    let last = window.scrollY;
    M.onFrame(y => {
      if (Math.abs(y - last) < 3) return;
      const down = y > last;
      header.classList.toggle('is-scrolled', y > 40);
      if (header.classList.contains('is-menu-open')) { last = y; return; }
      if (y < 140 || !down) header.classList.remove('is-hidden');
      else header.classList.add('is-hidden');
      last = y;
    });
  };

  /* ---------- Barre de progression ---------- */
  M.progress = function (bar) {
    if (!bar) return;
    M.onFrame(y => {
      const max = Math.max(1, M.docH - M.vh);
      bar.style.transform = `scaleX(${clamp(y / max, 0, 1).toFixed(4)})`;
    });
  };

  /* ---------- FLIP : réorganisation animée ---------- */
  M.flip = function (items, mutate) {
    if (reduced || !Element.prototype.animate) { mutate(); return; }
    const first = new Map(items.map(el => [el, el.hidden ? null : el.getBoundingClientRect()]));
    mutate();
    items.forEach((el, i) => {
      if (el.hidden) return;
      const f = first.get(el), l = el.getBoundingClientRect();
      if (!f) {
        el.animate([{ opacity: 0, transform: 'translateY(24px) scale(.96)' }, { opacity: 1, transform: 'none' }],
          { duration: 700, delay: i * 40, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
        return;
      }
      const dx = f.left - l.left, dy = f.top - l.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }],
        { duration: 750, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
  };

  /* ---------- Initialisation d’un sous-arbre ---------- */
  M.init = function (root) {
    root = root || document;
    document.documentElement.classList.add('motion-ready');
    if (reduced) document.documentElement.classList.add('reduced');
    M.reveal(root);
    M.counters(root);
    M.parallax(root);
    M.magnetic(root);
    M.tilt(root);
    M.spot(root);
    root.querySelectorAll('[data-highlight]').forEach(M.highlight);
  };

  window.TheoriaMotion = M;
})();
