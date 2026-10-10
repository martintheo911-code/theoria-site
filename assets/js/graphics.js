/* ==========================================================================
   THEORIA — visuels génératifs
   · Camera      : projection 3D d’un terrain (105 × 68 m)
   · Replay      : reconstitution animée d’un but (hero)
   · poster()    : affiche de match sur canvas (tuiles et cartes)
   · *Svg()      : carte des tirs, courbe xG, mini-terrains, compositions
   ========================================================================== */
(function () {
  'use strict';

  const T = window.Theoria;
  const { rng, clamp, slots } = T;
  const { nf, minute, esc } = T.fmt;
  const L = 105, W = 68;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
  const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function hexRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const rgba = (hex, a) => { const [r, g, b] = hexRgb(hex); return `rgba(${r},${g},${b},${a})`; };
  const lum = hex => { const [r, g, b] = hexRgb(hex); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };

  /* ---------- Géométrie du terrain (en mètres) ---------- */
  function arc(cx, cy, r, a0, a1, n) {
    const p = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return p;
  }
  const PA = Math.acos(5.5 / 9.15);
  // Ordre = ordre d’apparition : le rond central (le Θ de THEORIA) en premier.
  const LINES = [
    arc(L / 2, W / 2, 9.15, -Math.PI / 2, Math.PI * 1.5, 72),
    [[L / 2, 0], [L / 2, W]],
    [[L / 2, 0], [L, 0], [L, W], [L / 2, W]],
    [[L / 2, W], [0, W], [0, 0], [L / 2, 0]],
    [[L, 13.84], [L - 16.5, 13.84], [L - 16.5, 54.16], [L, 54.16]],
    [[0, 13.84], [16.5, 13.84], [16.5, 54.16], [0, 54.16]],
    [[L, 24.84], [L - 5.5, 24.84], [L - 5.5, 43.16], [L, 43.16]],
    [[0, 24.84], [5.5, 24.84], [5.5, 43.16], [0, 43.16]],
    arc(L - 11, 34, 9.15, Math.PI - PA, Math.PI + PA, 24),
    arc(11, 34, 9.15, -PA, PA, 24),
    arc(0, 0, 1, 0, Math.PI / 2, 6), arc(L, 0, 1, Math.PI / 2, Math.PI, 6),
    arc(L, W, 1, Math.PI, Math.PI * 1.5, 6), arc(0, W, 1, Math.PI * 1.5, Math.PI * 2, 6)
  ].map(p => p.map(([x, y]) => [x, y, 0]));

  function goalFrame(x0, dir) {
    const y1 = 30.34, y2 = 37.66, h = 2.44, d = 2 * dir, hb = 2.0;
    const g = [
      [[x0, y1, 0], [x0, y1, h], [x0, y2, h], [x0, y2, 0]],
      [[x0, y1, h], [x0 + d, y1, hb], [x0 + d, y1, 0], [x0, y1, 0]],
      [[x0, y2, h], [x0 + d, y2, hb], [x0 + d, y2, 0], [x0, y2, 0]],
      [[x0 + d, y1, hb], [x0 + d, y2, hb]],
      [[x0 + d, y1, 0], [x0 + d, y2, 0]]
    ];
    const net = [];
    for (let k = 1; k < 6; k++) { const y = y1 + (y2 - y1) * k / 6; net.push([[x0 + d, y, 0], [x0 + d, y, hb]]); }
    for (let k = 1; k < 3; k++) { const z = hb * k / 3; net.push([[x0 + d, y1, z], [x0 + d, y2, z]]); }
    return { frame: g, net };
  }
  const GOALS = [goalFrame(0, -1), goalFrame(L, 1)];

  /* ---------- Caméra ---------- */
  class Camera {
    constructor() { this.az = 0; this.el = 0.5; this.dist = 120; this.focal = 1; this.cx = 0; this.cy = 0; this.update(); }
    update() {
      const ce = Math.cos(this.el), se = Math.sin(this.el), sa = Math.sin(this.az), ca = Math.cos(this.az);
      const d = this.dist;
      this.px = d * ce * sa; this.py = d * se; this.pz = d * ce * ca;
      const fx = -ce * sa, fy = -se, fz = -ce * ca;
      let rx = -fz, rz = fx;
      const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
      this.f = [fx, fy, fz];
      this.r = [rx, 0, rz];
      this.u = [-rz * fy, rz * fx - rx * fz, rx * fy];
      return this;
    }
    project(X, Y, Z, out) {
      const dx = X - this.px, dy = Y - this.py, dz = Z - this.pz;
      const zc = dx * this.f[0] + dy * this.f[1] + dz * this.f[2];
      if (zc < 1) return null;
      const xc = dx * this.r[0] + dz * this.r[2];
      const yc = dx * this.u[0] + dy * this.u[1] + dz * this.u[2];
      out = out || [0, 0, 0];
      out[0] = this.cx + this.focal * xc / zc;
      out[1] = this.cy - this.focal * yc / zc;
      out[2] = zc;
      return out;
    }
    /** Point du terrain en mètres (x le long, y en largeur, h en hauteur). */
    pm(x, y, h, out) { return this.project(x - L / 2, h || 0, y - W / 2, out); }
    /** Cadre le terrain dans le rectangle donné. */
    fit(rx, ry, rw, rh) {
      this.focal = 1; this.cx = 0; this.cy = 0;
      const pts = [[0, 0, 0], [L, 0, 0], [L, W, 0], [0, W, 0], [-2, W / 2, 2.44], [L + 2, W / 2, 2.44]];
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      const P = [0, 0, 0];
      pts.forEach(p => {
        const s = this.pm(p[0], p[1], p[2], P); if (!s) return;
        x0 = Math.min(x0, s[0]); x1 = Math.max(x1, s[0]); y0 = Math.min(y0, s[1]); y1 = Math.max(y1, s[1]);
      });
      const k = Math.min(rw / (x1 - x0), rh / (y1 - y0));
      this.focal = k;
      this.cx = rx + rw / 2 - k * (x0 + x1) / 2;
      this.cy = ry + rh / 2 - k * (y0 + y1) / 2;
      return this;
    }
  }

  const P1 = [0, 0, 0], P2 = [0, 0, 0];

  function strokePath(ctx, cam, pts, t) {
    if (t <= 0) return;
    let lens = pts._lens;
    if (!lens) {
      lens = [0];
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        lens.push(lens[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
      }
      pts._lens = lens;
    }
    const lim = lens[lens.length - 1] * Math.min(1, t);
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < pts.length; i++) {
      let p = pts[i];
      const over = lens[i] > lim;
      if (over) {
        const a = pts[i - 1], k = (lim - lens[i - 1]) / ((lens[i] - lens[i - 1]) || 1);
        p = [a[0] + (p[0] - a[0]) * k, a[1] + (p[1] - a[1]) * k, a[2] + (p[2] - a[2]) * k];
      }
      const s = cam.pm(p[0], p[1], p[2], P1);
      if (!s) { started = false; continue; }
      if (!started) { ctx.moveTo(s[0], s[1]); started = true; } else ctx.lineTo(s[0], s[1]);
      if (over) break;
    }
    ctx.stroke();
  }

  function fillQuad(ctx, cam, q) {
    ctx.beginPath();
    for (let i = 0; i < q.length; i++) {
      const s = cam.pm(q[i][0], q[i][1], q[i][2] || 0, P1); if (!s) return;
      i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]);
    }
    ctx.closePath(); ctx.fill();
  }

  function drawStripes(ctx, cam, color) {
    ctx.fillStyle = color;
    const n = 14;
    for (let i = 0; i < n; i += 2) {
      const x0 = L * i / n, x1 = L * (i + 1) / n;
      fillQuad(ctx, cam, [[x0, 0], [x1, 0], [x1, W], [x0, W]]);
    }
  }

  function drawPitch(ctx, cam, opt) {
    const t = opt.t == null ? 1 : opt.t;
    if (opt.stripes) drawStripes(ctx, cam, opt.stripes);
    ctx.lineWidth = opt.width || 1;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = opt.color;
    LINES.forEach((pts, i) => strokePath(ctx, cam, pts, ease(t * 1.7 - i * 0.055)));
    const gt = ease(t * 1.7 - 0.8);
    if (gt > 0) {
      GOALS.forEach(g => {
        ctx.strokeStyle = opt.color;
        g.frame.forEach(p => strokePath(ctx, cam, p, gt));
        if (opt.net) { ctx.strokeStyle = opt.net; g.net.forEach(p => strokePath(ctx, cam, p, gt)); }
      });
    }
    if (opt.spots && t > 0.6) {
      ctx.fillStyle = opt.color;
      [[11, 34], [L - 11, 34], [L / 2, 34]].forEach(([x, y]) => {
        const s = cam.pm(x, y, 0, P1); if (!s) return;
        ctx.beginPath(); ctx.arc(s[0], s[1], Math.max(1, 0.22 * cam.focal / s[2]), 0, Math.PI * 2); ctx.fill();
      });
    }
  }

  /* ---------- Grain ---------- */
  let noiseCv = null, noiseUrl = null;
  function noise() {
    if (noiseCv) return noiseCv;
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const x = c.getContext('2d'); const img = x.createImageData(160, 160);
    const r = rng('grain');
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return (noiseCv = c);
  }
  function grain(ctx, w, h, a) {
    ctx.save();
    ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(noise(), 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  function noiseURL() {
    if (noiseUrl) return noiseUrl;
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const x = c.getContext('2d'); const img = x.createImageData(160, 160);
    const r = rng('grain-css');
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 26;
    }
    x.putImageData(img, 0, 0);
    try { noiseUrl = c.toDataURL('image/png'); } catch (e) { noiseUrl = ''; }
    return noiseUrl;
  }

  /* ==========================================================================
     Replay — reconstitution schématique d’un but
     Coordonnées internes en % du terrain, l’équipe qui attaque va vers x = 100.
     ========================================================================== */
  class Replay {
    constructor(canvas, match, opts) {
      opts = opts || {};
      this.cv = canvas; this.ctx = canvas.getContext('2d'); this.m = match;
      const goals = match.events.filter(e => e.t === 'goal');
      this.ev = goals.find(e => e.m === (opts.minute != null ? opts.minute : match.replay)) || goals[goals.length - 1] || null;
      this.side = this.ev ? this.ev.side : 'h';
      this.att = match.club(this.side);
      this.def = match.club(this.side === 'h' ? 'a' : 'h');
      this.attColor = this.att.color;
      this.defColor = Math.abs(lum(this.attColor) - lum('#8a8a8d')) < 0.12 ? '#5c5c60' : '#8a8a8d';
      this.cam = new Camera();
      this.scroll = 0; this.ptr = [0, 0]; this.ptrS = [0, 0];
      this.camS = null;
      this.intro = opts.instant ? 1 : 0;
      this.loop = 0; this.time = 0;
      this.onGoal = opts.onGoal || null;
      this.setupTeams();
      this.newPlan();
      this.resize();
      this.running = false;
    }

    setupTeams() {
      const af = slots(this.att.formation, 32, 70, 10);
      const df = slots(this.def.formation, 12, 42, 3);
      this.A = af.map((s, i) => ({ bx: s.x, by: s.y, x: s.x, y: s.y, line: s.line, n: this.att.xi[i] }));
      this.D = df.map((s, i) => ({ bx: 100 - s.x, by: 100 - s.y, x: 100 - s.x, y: 100 - s.y, line: s.line, n: this.def.xi[i] }));
      let si = this.ev ? this.att.xi.indexOf(this.ev.n) : -1;
      if (si <= 0) {
        const last = Number(this.att.formation.split('-').pop());
        si = this.A.length - 1 - Math.floor((last - 1) / 2);
      }
      this.scorer = si;
    }

    newPlan() {
      const r = rng('replay:' + this.m.id + ':' + this.loop);
      this.A.forEach(p => { p.x = p.bx; p.y = p.by; });
      this.D.forEach(p => { p.x = p.bx; p.y = p.by; });
      const n = this.A.length;
      const defN = Number(this.att.formation.split('-')[0]);
      let cur = 1 + Math.floor(r() * defN);
      const chain = [cur];
      const passes = 3 + Math.floor(r() * 3);
      for (let k = 0; k < passes; k++) {
        const c = this.A[cur], prev = chain[chain.length - 2];
        const cands = [];
        for (let i = 1; i < n; i++) {
          if (i === cur || i === this.scorer || i === prev) continue;
          const p = this.A[i];
          const w = Math.max(0.05, (p.bx - c.bx + 22) / 44) * (Math.abs(p.by - c.by) < 55 ? 1 : 0.25);
          cands.push([i, w]);
        }
        let pick = r() * cands.reduce((s, q) => s + q[1], 0), sel = cands[0][0];
        for (const q of cands) { pick -= q[1]; if (pick <= 0) { sel = q[0]; break; } }
        chain.push(sel); cur = sel;
      }
      chain.push(this.scorer);
      const steps = [{ k: 'hold', who: chain[0], dur: 0.7 }];
      for (let i = 1; i < chain.length; i++) {
        const last = i === chain.length - 1;
        steps.push({ k: 'pass', from: chain[i - 1], to: chain[i], last });
        if (!last) steps.push({ k: 'hold', who: chain[i], dur: 0.3 + r() * 0.35 });
      }
      steps.push({ k: 'shot', who: this.scorer, dur: 0.55 });
      steps.push({ k: 'goal', dur: 2.4 });
      steps.push({ k: 'fade', dur: 0.7 });
      this.steps = steps; this.si = 0; this.st = 0; this.entered = false;
      this.r = r;
      this.alpha = this.loop === 0 ? 1 : 0;
      this.spot = this.ev ? { x: this.ev.x, y: this.ev.y } : { x: 84 + r() * 9, y: 38 + r() * 24 };
      this.target = { x: 101.2, y: 50 + (r() - 0.5) * 8.5, h: 0.35 + r() * 1.7 };
      const h0 = this.A[chain[0]];
      this.ball = { x: h0.x + 1.2, y: h0.y, h: 0.11 };
      this.lines = []; this.trail = []; this.flash = 0;
      this.recvIdx = -1; this.recv = null; this.holder = chain[0]; this.celebrate = false;
    }

    enter(s) {
      const r = this.r;
      if (s.k === 'hold') { this.holder = s.who; this.recvIdx = -1; }
      if (s.k === 'pass') {
        this.holder = -1;
        const to = this.A[s.to];
        const p1 = s.last
          ? { x: this.spot.x - 1.5, y: this.spot.y }
          : { x: clamp(to.x + 3 + r() * 6, 6, 92), y: clamp(to.y + (r() - 0.5) * 8, 6, 94) };
        s.p0 = { x: this.ball.x, y: this.ball.y };
        s.p1 = p1;
        const dist = Math.hypot((p1.x - s.p0.x) * 1.05, (p1.y - s.p0.y) * 0.68);
        s.dur = 0.5 + dist / 26;
        s.loft = dist > 30 ? Math.min(7, dist * 0.13) : 0;
        this.recvIdx = s.to; this.recv = p1;
        this.lines.push({ a: s.p0, b: p1, born: this.time, life: s.dur, kind: 'pass' });
      }
      if (s.k === 'shot') {
        this.holder = -1; this.recvIdx = -1;
        s.p0 = { x: this.ball.x, y: this.ball.y };
        s.p1 = this.target;
        this.lines.push({ a: s.p0, b: { x: 100, y: this.target.y }, born: this.time, life: s.dur, kind: 'shot' });
      }
      if (s.k === 'goal') {
        this.flash = 1; this.celebrate = true;
        if (this.onGoal) this.onGoal();
      }
    }

    update(dt) {
      this.time += dt;
      this.intro = Math.min(1, this.intro + dt / 2.6);
      if (this.intro < 0.5) return;
      const s = this.steps[this.si];
      if (!this.entered) { this.enter(s); this.entered = true; }
      this.st += dt;
      const k = Math.min(1, this.st / s.dur);
      const B = this.ball;
      if (s.k === 'hold') {
        const p = this.A[s.who], a = 1 - Math.exp(-dt * 14);
        B.x += (p.x + 1.2 - B.x) * a; B.y += (p.y - B.y) * a; B.h = 0.11;
      } else if (s.k === 'pass') {
        const e = easeIO(k);
        B.x = lerp(s.p0.x, s.p1.x, e); B.y = lerp(s.p0.y, s.p1.y, e);
        B.h = 0.11 + Math.sin(Math.PI * e) * s.loft;
      } else if (s.k === 'shot') {
        const e = 1 - Math.pow(1 - k, 2);
        B.x = lerp(s.p0.x, s.p1.x, e); B.y = lerp(s.p0.y, s.p1.y, e); B.h = lerp(0.11, s.p1.h, e);
      }
      this.movePlayers(dt);
      if (s.k === 'fade') this.alpha = 1 - k; else this.alpha = Math.min(1, this.alpha + dt * 1.6);
      this.flash = Math.max(0, this.flash - dt * 0.75);
      this.trail.push([B.x, B.y, B.h]);
      if (this.trail.length > 28) this.trail.shift();
      if (k >= 1) {
        this.si++; this.st = 0; this.entered = false;
        if (this.si >= this.steps.length) { this.loop++; this.newPlan(); }
      }
    }

    movePlayers(dt) {
      const bx = this.ball.x, by = this.ball.y, t = this.time;
      this.A.forEach((p, i) => {
        let tx, ty, rate = 1.5;
        if (i === 0) { tx = p.bx + (bx - 50) * 0.08; ty = 50 + (by - 50) * 0.12; }
        else {
          tx = p.bx + (bx - 45) * 0.42 + Math.sin(t * 0.6 + i * 1.7) * 1.4;
          ty = p.by + (by - 50) * 0.22 + Math.cos(t * 0.5 + i) * 1.4;
        }
        if (i === this.recvIdx && this.recv) { tx = this.recv.x; ty = this.recv.y; rate = 4.2; }
        if (i === this.holder) { tx = p.x + 2.5; ty = p.y; rate = 1.2; }
        if (this.celebrate && i === this.scorer) { tx = 97; ty = this.spot.y < 50 ? 4 : 96; rate = 1.3; }
        tx = clamp(tx, 2, 98); ty = clamp(ty, 3, 97);
        const a = 1 - Math.exp(-dt * rate);
        p.x += (tx - p.x) * a; p.y += (ty - p.y) * a;
      });
      let near = -1, nd = Infinity;
      if (!this.celebrate) {
        this.D.forEach((p, i) => {
          if (i === 0) return;
          const d = (p.x - bx) ** 2 + ((p.y - by) * 0.65) ** 2;
          if (d < nd) { nd = d; near = i; }
        });
      }
      this.D.forEach((p, i) => {
        let tx, ty, rate = 1.3;
        if (i === 0) { tx = 97.5; ty = 50 + (by - 50) * 0.16; rate = 2.5; }
        else {
          tx = Math.min(94, p.bx + (bx - 55) * 0.25) + Math.sin(t * 0.55 + i * 2.1) * 1.1;
          ty = p.by + (by - 50) * 0.3 + Math.cos(t * 0.45 + i * 1.3) * 1.1;
        }
        if (i === near) { tx = bx + 2.4; ty = by + (50 - by) * 0.06; rate = 2.3; }
        if (this.celebrate) rate = 0.5;
        tx = clamp(tx, 2, 98.5); ty = clamp(ty, 3, 97);
        const a = 1 - Math.exp(-dt * rate);
        p.x += (tx - p.x) * a; p.y += (ty - p.y) * a;
      });
    }

    resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.w = this.cv.clientWidth; this.h = this.cv.clientHeight;
      this.cv.width = Math.max(1, Math.round(this.w * dpr));
      this.cv.height = Math.max(1, Math.round(this.h * dpr));
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setScroll(p) { this.scroll = clamp(p, 0, 1); }
    setPointer(x, y) { this.ptr[0] = x; this.ptr[1] = y; }

    camera(dt) {
      const aspect = this.w / Math.max(1, this.h);
      const portrait = clamp((1.3 - aspect) / 0.75, 0, 1);
      const sc = easeIO(this.scroll);
      const tgt = {
        az: lerp(lerp(-0.3, -1.3, portrait), -0.02, sc) + Math.sin(this.time * 0.13) * 0.05,
        el: lerp(lerp(0.4, 0.5, portrait), 1.36, sc)
      };
      const a = 1 - Math.exp(-dt * 4);
      this.ptrS[0] += (this.ptr[0] - this.ptrS[0]) * a;
      this.ptrS[1] += (this.ptr[1] - this.ptrS[1]) * a;
      tgt.az += this.ptrS[0] * 0.12; tgt.el += this.ptrS[1] * 0.05;
      if (!this.camS) this.camS = Object.assign({}, tgt);
      this.camS.az += (tgt.az - this.camS.az) * a;
      this.camS.el += (tgt.el - this.camS.el) * a;
      const cam = this.cam;
      cam.az = this.camS.az; cam.el = this.camS.el; cam.update();
      const w = this.w, h = this.h;
      if (portrait > 0.5) cam.fit(w * 0.05, h * 0.07, w * 0.9, h * 0.5);
      else cam.fit(w * 0.05, h * 0.1, w * 0.9, h * 0.6);
    }

    /* coordonnées internes (%) → mètres */
    P(x, y, h, out) { return this.cam.pm(x * 1.05, y * 0.68, h, out); }

    render() {
      const ctx = this.ctx, cam = this.cam, w = this.w, h = this.h;
      ctx.clearRect(0, 0, w, h);
      drawPitch(ctx, cam, {
        t: this.intro, color: 'rgba(255,255,255,0.3)', net: 'rgba(255,255,255,0.12)',
        stripes: 'rgba(255,255,255,0.022)', spots: true
      });
      if (this.intro < 0.5) return;
      const A = this.alpha * ease((this.intro - 0.5) * 2.5);
      if (A <= 0.001) return;
      ctx.save();
      ctx.globalAlpha = A;

      // Lignes de passe (la « théorie »)
      this.lines = this.lines.filter(l => this.time - l.born < l.life + 3.2);
      this.lines.forEach(l => {
        const age = this.time - l.born;
        const live = age < l.life;
        const fade = live ? 1 : 1 - (age - l.life) / 3.2;
        const a = this.P(l.a.x, l.a.y, 0, P1), b = this.P(l.b.x, l.b.y, l.kind === 'shot' ? 1 : 0, P2);
        if (!a || !b) return;
        ctx.save();
        ctx.lineWidth = l.kind === 'shot' ? 1.6 : 1.1;
        ctx.strokeStyle = l.kind === 'shot' ? rgba(this.attColor, 0.9 * fade) : `rgba(255,255,255,${0.55 * fade})`;
        if (live && l.kind === 'pass') { ctx.setLineDash([5, 5]); ctx.lineDashOffset = -this.time * 30; }
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        if (l.kind === 'pass') {
          const rr = Math.max(3, 1.2 * cam.focal / b[2]) * (live ? 1 : 1 + (1 - fade) * 0.6);
          ctx.setLineDash([]);
          ctx.beginPath(); ctx.ellipse(b[0], b[1], rr, rr * Math.max(0.25, Math.sin(cam.el)), 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
      });

      // Flash du but
      if (this.flash > 0) {
        ctx.fillStyle = rgba(this.attColor, 0.55 * this.flash);
        fillQuad(ctx, cam, [[L, 30.34, 0], [L, 30.34, 2.44], [L, 37.66, 2.44], [L, 37.66, 0]].map(([x, y, z]) => [x, y, z]));
        const g = cam.pm(L, 34, 0, P1);
        if (g) {
          const rr = (1 - this.flash) * 16 * cam.focal / g[2];
          ctx.strokeStyle = `rgba(255,255,255,${0.7 * this.flash})`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.ellipse(g[0], g[1], rr, rr * Math.max(0.2, Math.sin(cam.el)), 0, 0, Math.PI * 2); ctx.stroke();
        }
      }

      // Joueurs, triés par profondeur
      const list = [];
      this.D.forEach(p => list.push([p, this.defColor, false]));
      this.A.forEach((p, i) => list.push([p, this.attColor, i === this.scorer]));
      list.forEach(it => { const s = this.P(it[0].x, it[0].y, 0, [0, 0, 0]); it.push(s); });
      list.sort((a, b) => (b[3] ? b[3][2] : 0) - (a[3] ? a[3][2] : 0));
      list.forEach(([p, color, star, foot]) => {
        if (!foot) return;
        const k = cam.focal / foot[2];
        const top = this.P(p.x, p.y, 1.38, P1), head = this.P(p.x, p.y, 1.72, P2);
        if (!top || !head) return;
        const lw = Math.max(2.2, 0.48 * k);
        ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = lw;
        const b0y = foot[1] - (foot[1] - top[1]) * 0.12;
        ctx.beginPath(); ctx.moveTo(foot[0], b0y); ctx.lineTo(top[0], top[1]); ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(head[0], head[1], Math.max(1.3, 0.2 * k), 0, Math.PI * 2); ctx.fill();
        if (star && this.si >= this.steps.length - 4) {
          ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1;
          const rr = Math.max(5, 1.1 * k);
          ctx.beginPath(); ctx.ellipse(foot[0], foot[1], rr, rr * Math.max(0.25, Math.sin(cam.el)), 0, 0, Math.PI * 2); ctx.stroke();
        }
      });

      // Ballon : traînée, ombre, ballon
      const tr = this.trail;
      for (let i = 1; i < tr.length; i++) {
        const a = this.P(tr[i - 1][0], tr[i - 1][1], tr[i - 1][2], P1), b = this.P(tr[i][0], tr[i][1], tr[i][2], P2);
        if (!a || !b) continue;
        ctx.strokeStyle = `rgba(255,255,255,${(i / tr.length) * 0.6})`;
        ctx.lineWidth = 1 + (i / tr.length) * 1.4;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      const B = this.ball;
      const sh = this.P(B.x, B.y, 0, P1);
      if (sh && B.h > 0.3) {
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        const k = cam.focal / sh[2];
        ctx.beginPath(); ctx.ellipse(sh[0], sh[1], Math.max(2, 0.35 * k), Math.max(1, 0.35 * k * Math.sin(cam.el)), 0, 0, Math.PI * 2); ctx.fill();
      }
      const bp = this.P(B.x, B.y, B.h + 0.11, P2);
      if (bp) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(bp[0], bp[1], Math.max(2, 0.28 * cam.focal / bp[2]), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    tick(now) {
      const dt = Math.min(0.05, (now - (this._last || now)) / 1000);
      this._last = now;
      this.update(dt);
      this.camera(dt);
      this.render();
    }

    start() {
      if (this.running) return;
      this.running = true; this._last = performance.now();
      const f = now => { if (!this.running) return; this.tick(now); this._raf = requestAnimationFrame(f); };
      this._raf = requestAnimationFrame(f);
    }
    stop() { this.running = false; cancelAnimationFrame(this._raf); }

    /** Image fixe (mouvement réduit) : on avance jusqu’au tir. */
    still() {
      this.intro = 1;
      let guard = 0;
      while (this.steps[this.si].k !== 'shot' && guard++ < 2000) this.update(1 / 30);
      this.alpha = 1;
      this.camS = null; this.camera(1);
      this.render();
    }
  }

  /* ==========================================================================
     Affiches de match (canvas)
     ========================================================================== */
  function glow(ctx, x, y, rad, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, rgba(color, a)); g.addColorStop(0.45, rgba(color, a * 0.32)); g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  let fontReady = null;
  function displayFont() {
    if (!fontReady) {
      fontReady = (document.fonts && document.fonts.load)
        ? Promise.race([document.fonts.load('400 100px Anton'), new Promise(r => setTimeout(r, 2500))]).catch(() => {})
        : Promise.resolve();
    }
    return fontReady;
  }

  function poster(cv, m, tone) {
    const w = cv.clientWidth, h = cv.clientHeight;
    if (w < 2 || h < 2) return false;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const dark = tone !== 'light';
    const r = rng('poster:' + m.id + ':' + tone);
    const hc = m.h.color, ac = m.a.color;
    const ink = dark ? '255,255,255' : '17,17,17';
    const big = Math.max(w, h);

    ctx.fillStyle = dark ? '#0e0e0f' : '#ececec';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = dark ? 'screen' : 'multiply';
    glow(ctx, w * (0.1 + r() * 0.22), h * (0.08 + r() * 0.2), big * 0.95, hc, dark ? 0.9 : 0.62);
    glow(ctx, w * (0.7 + r() * 0.22), h * (0.68 + r() * 0.22), big * 0.85, ac, dark ? 0.75 : 0.5);
    ctx.globalCompositeOperation = 'source-over';

    const cam = new Camera();
    const v = m.poster || 'shots';
    const lineCol = `rgba(${ink},${dark ? 0.32 : 0.3})`;
    const stripes = `rgba(${ink},${dark ? 0.03 : 0.035})`;

    if (v === 'shots') {
      cam.el = 0.88 + r() * 0.22; cam.az = (r() - 0.5) * 0.5; cam.update().fit(w * 0.06, h * 0.08, w * 0.88, h * 0.62);
      drawPitch(ctx, cam, { color: lineCol, stripes, net: `rgba(${ink},0.15)`, spots: true });
      const goalsLast = m.shots.slice().sort((a, b) => a.goal - b.goal);
      goalsLast.forEach(s => {
        const col = s.side === 'h' ? hc : ac;
        const p = cam.pm(s.ax * 1.05, s.ay * 0.68, 0, P1); if (!p) return;
        const k = cam.focal / p[2];
        const rad = (0.5 + Math.sqrt(s.xg) * 2.5) * k;
        if (s.goal) {
          const gx = s.side === 'h' ? L : 0;
          const g = cam.pm(gx, s.ay * 0.68 * 0.3 + 34 * 0.7, 1.1, P2);
          if (g) {
            ctx.strokeStyle = rgba(col, 0.9); ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(g[0], g[1]); ctx.stroke();
          }
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.ellipse(p[0], p[1], rad, rad * Math.sin(cam.el), 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(${ink},0.9)`; ctx.lineWidth = 1.2; ctx.stroke();
        } else {
          ctx.fillStyle = rgba(col, s.on ? 0.3 : 0.12);
          ctx.strokeStyle = rgba(col, s.on ? 0.95 : 0.6); ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.ellipse(p[0], p[1], rad, rad * Math.sin(cam.el), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
      });
    } else if (v === 'network') {
      cam.el = 1.22 + r() * 0.12; cam.az = (r() - 0.5) * 0.3; cam.update().fit(w * 0.07, h * 0.06, w * 0.86, h * 0.66);
      drawPitch(ctx, cam, { color: lineCol, stripes, spots: true });
      const home = slots(m.h.formation, 24, 66, 6).map(s => ({ x: s.x + (r() - 0.5) * 7, y: s.y + (r() - 0.5) * 7 }));
      const away = slots(m.a.formation, 24, 66, 6).map(s => ({ x: 100 - s.x + (r() - 0.5) * 7, y: 100 - s.y + (r() - 0.5) * 7 }));
      const scale = Math.min(w, h) / 420;
      const net = (pts, col, alpha, wmul) => {
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, (pts[i].y - pts[j].y) * 0.7);
          const wt = r();
          if (d > 34 || wt < 0.3) continue;
          const a = cam.pm(pts[i].x * 1.05, pts[i].y * 0.68, 0, P1), b = cam.pm(pts[j].x * 1.05, pts[j].y * 0.68, 0, P2);
          if (!a || !b) continue;
          ctx.strokeStyle = rgba(col, alpha * (0.3 + wt * 0.7)); ctx.lineWidth = (0.6 + wt * 3.6) * scale * wmul;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
        pts.forEach(p => {
          const s = cam.pm(p.x * 1.05, p.y * 0.68, 0, P1); if (!s) return;
          const rad = (3 + r() * 5) * scale * wmul;
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(s[0], s[1], rad, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(${ink},0.85)`; ctx.lineWidth = 1; ctx.stroke();
        });
      };
      net(away, ac, 0.55, 0.6);
      net(home, hc, 0.95, 1);
    } else if (v === 'heat') {
      cam.el = 1.08 + r() * 0.2; cam.az = (r() - 0.5) * 0.4; cam.update().fit(w * 0.06, h * 0.07, w * 0.88, h * 0.64);
      ctx.save();
      ctx.globalCompositeOperation = dark ? 'lighter' : 'multiply';
      const blobs = (col, n, x0, x1, a) => {
        let x = (x0 + x1) / 2, y = 50;
        for (let i = 0; i < n; i++) {
          x = clamp(x + (r() - 0.5) * 22, x0, x1); y = clamp(y + (r() - 0.5) * 34, 6, 94);
          const s = cam.pm(x * 1.05, y * 0.68, 0, P1); if (!s) continue;
          const rad = (6 + r() * 8) * cam.focal / s[2];
          glow(ctx, s[0], s[1], rad, col, a);
        }
      };
      blobs(hc, 46, 38, 96, dark ? 0.3 : 0.32);
      blobs(ac, 26, 4, 60, dark ? 0.24 : 0.26);
      ctx.restore();
      drawPitch(ctx, cam, { color: lineCol, net: `rgba(${ink},0.12)`, spots: true });
    } else {
      cam.el = 0.42 + r() * 0.2; cam.az = (r() - 0.5) * 0.6; cam.update().fit(w * 0.04, h * 0.42, w * 0.92, h * 0.46);
      drawPitch(ctx, cam, { color: `rgba(${ink},0.22)`, stripes, spots: false });
      const fs = Math.min(h * 0.6, w * 0.4);
      ctx.font = `400 ${fs}px Anton, Impact, "Arial Narrow", sans-serif`;
      ctx.textBaseline = 'middle';
      const s0 = String(m.score[0]), s1 = String(m.score[1]);
      const w0 = ctx.measureText(s0).width, w1 = ctx.measureText(s1).width;
      const dash = fs * 0.26, gap = fs * 0.12;
      const total = w0 + w1 + dash + gap * 2;
      let x = (w - total) / 2;
      const y = h * 0.42;
      ctx.fillStyle = hc; ctx.fillText(s0, x, y);
      x += w0 + gap;
      ctx.fillStyle = `rgba(${ink},0.9)`; ctx.fillRect(x, y - fs * 0.03, dash, fs * 0.06);
      x += dash + gap;
      ctx.lineWidth = Math.max(1.5, fs * 0.018); ctx.strokeStyle = ac; ctx.strokeText(s1, x, y);
    }

    if (dark) {
      const g = ctx.createRadialGradient(w / 2, h * 0.45, big * 0.25, w / 2, h / 2, big * 0.85);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    grain(ctx, w, h, dark ? 0.12 : 0.09);
    return true;
  }

  /* ==========================================================================
     SVG
     ========================================================================== */
  function pitchSvg() {
    return '<g class="pl">' +
      '<rect x="0" y="0" width="105" height="68"/>' +
      '<line x1="52.5" y1="0" x2="52.5" y2="68"/>' +
      '<circle cx="52.5" cy="34" r="9.15"/>' +
      '<rect x="0" y="13.84" width="16.5" height="40.32"/>' +
      '<rect x="88.5" y="13.84" width="16.5" height="40.32"/>' +
      '<rect x="0" y="24.84" width="5.5" height="18.32"/>' +
      '<rect x="99.5" y="24.84" width="5.5" height="18.32"/>' +
      '<path d="M16.5 26.688A9.15 9.15 0 0 1 16.5 41.312M88.5 26.688A9.15 9.15 0 0 0 88.5 41.312"/>' +
      '<rect x="-1.8" y="30.34" width="1.8" height="7.32"/>' +
      '<rect x="105" y="30.34" width="1.8" height="7.32"/>' +
      '</g><g class="ps"><circle cx="11" cy="34" r=".5"/><circle cx="94" cy="34" r=".5"/><circle cx="52.5" cy="34" r=".5"/></g>';
  }

  function shotTip(s) {
    const what = s.goal ? 'But' : s.post ? 'Poteau' : s.on ? 'Tir cadré' : 'Tir non cadré';
    return `${minute(s.m)} · ${s.name} · xG ${nf(s.xg, 2)} · ${what}`;
  }

  function shotMapSvg(m) {
    const dots = m.shots.slice().sort((a, b) => a.goal - b.goal).map((s, i) => {
      const r = 0.7 + Math.sqrt(s.xg) * 3.1;
      const cls = `shot shot--${s.side}${s.goal ? ' is-goal' : s.on ? ' is-on' : ''}`;
      return `<circle class="${cls}" cx="${(s.ax * 1.05).toFixed(2)}" cy="${(s.ay * 0.68).toFixed(2)}" r="${r.toFixed(2)}" style="--d:${i * 28}ms" data-tip="${esc(shotTip(s))}" tabindex="0"><title>${esc(shotTip(s))}</title></circle>`;
    }).join('');
    const label = `Carte des tirs : ${m.h.name} ${m.stats.shots[0]} tirs, ${m.a.name} ${m.stats.shots[1]} tirs`;
    return `<svg class="pitch-svg shotmap__svg" viewBox="-3 -3 111 74" role="img" aria-label="${esc(label)}">${pitchSvg()}<g class="shots">${dots}</g></svg>`;
  }

  function xgChartSvg(m) {
    const VW = 640, VH = 300, pl = 40, pr = 84, pt = 16, pb = 34;
    const maxM = m.endMinute;
    const top = Math.max(m.xg[0], m.xg[1]);
    const step = top > 3 ? 1 : 0.5;
    const maxXg = Math.max(step * 2, Math.ceil((top + 0.05) / step) * step);
    const X = v => pl + (VW - pl - pr) * v / maxM;
    const Y = v => VH - pb - (VH - pt - pb) * v / maxXg;
    const path = series => {
      let d = `M${X(0).toFixed(1)} ${Y(0).toFixed(1)}`;
      series.slice(1).forEach(([mm, c]) => { d += `H${X(mm).toFixed(1)}V${Y(c).toFixed(1)}`; });
      return d + `H${X(maxM).toFixed(1)}`;
    };
    let grid = '';
    for (let v = 0; v <= maxXg + 1e-6; v += step) {
      grid += `<line class="gl" x1="${pl}" x2="${VW - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/>` +
        `<text class="tk" x="${pl - 8}" y="${Y(v).toFixed(1)}" text-anchor="end" dy=".35em">${nf(v, 1)}</text>`;
    }
    [0, 15, 30, 45, 60, 75, 90].forEach(v => {
      grid += `<text class="tk" x="${X(v).toFixed(1)}" y="${VH - pb + 20}" text-anchor="middle">${v}’</text>`;
    });
    grid += `<line class="ht" x1="${X(45).toFixed(1)}" x2="${X(45).toFixed(1)}" y1="${pt}" y2="${VH - pb}"/>` +
      `<text class="tk" x="${(X(45) + 6).toFixed(1)}" y="${pt + 10}">Mi-temps</text>`;
    const marks = side => m.xgSeries[side].filter(p => p[2]).map(([mm, c]) =>
      `<circle class="xg-goal xg-goal--${side}" cx="${X(mm).toFixed(1)}" cy="${Y(c).toFixed(1)}" r="5"><title>But · ${minute(mm)}</title></circle>`).join('');
    let yh = Y(m.xg[0]), ya = Y(m.xg[1]);
    if (Math.abs(yh - ya) < 34) { const mid = (yh + ya) / 2, s = yh <= ya ? -1 : 1; yh = mid + s * 17; ya = mid - s * 17; }
    const end = (side, y, val, club) =>
      `<text class="xg-end xg-end--${side}" x="${VW - pr + 10}" y="${y.toFixed(1)}" dy="-.15em">${club.short}</text>` +
      `<text class="xg-val" x="${VW - pr + 10}" y="${y.toFixed(1)}" dy="1.05em">${nf(val, 2)} xG</text>`;
    const label = `Courbe des xG cumulés : ${m.h.name} ${nf(m.xg[0], 2)}, ${m.a.name} ${nf(m.xg[1], 2)}`;
    return `<svg class="xg__svg" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${esc(label)}">` +
      `<g class="xg-grid">${grid}</g>` +
      `<path class="xg-line xg-line--a" d="${path(m.xgSeries.a)}" pathLength="1"/>` +
      `<path class="xg-line xg-line--h" d="${path(m.xgSeries.h)}" pathLength="1"/>` +
      `<g class="xg-marks">${marks('a')}${marks('h')}</g>` +
      end('h', yh, m.xg[0], m.h) + end('a', ya, m.xg[1], m.a) + '</svg>';
  }

  /** Visuel d’un moment clé (fond sombre). */
  function momentSvg(m, e) {
    const abs = (x, y) => (e.side === 'h' ? [x * 1.05, y * 0.68] : [(100 - x) * 1.05, (100 - y) * 0.68]);
    let inner = '';
    if (e.x != null) {
      const [x, y] = abs(e.x, e.y);
      const gx = e.side === 'h' ? 105 : 0;
      const gy = 34 + (y - 34) * 0.15;
      const shot = e.t === 'goal' || e.t === 'chance' || e.t === 'post';
      if (shot) inner += `<line class="mv-traj" x1="${x.toFixed(2)}" y1="${y.toFixed(2)}" x2="${gx}" y2="${gy.toFixed(2)}" pathLength="1"/>`;
      inner += `<circle class="mv-ring" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.5"/>` +
        `<circle class="mv-dot${e.t === 'goal' ? ' is-goal' : ''}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.9"/>`;
    } else if (e.t === 'tactic' && e.form) {
      const s = slots(e.form, 16, 44, 4.5);
      inner += s.map((p, i) => {
        const [x, y] = abs(p.x, p.y);
        return `<circle class="mv-form" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="2" style="--d:${i * 60}ms"/>`;
      }).join('') + `<text class="mv-label" x="${e.side === 'h' ? 74 : 31}" y="37" text-anchor="middle">${esc(e.form)}</text>`;
    } else if (e.t === 'yellow' || e.t === 'red') {
      inner += `<rect class="mv-card mv-card--${e.t}" x="45.5" y="22" width="14" height="20" rx="1.4" transform="rotate(-8 52.5 32)"/>`;
    } else if (e.t === 'sub') {
      inner += `<text class="mv-label" x="52.5" y="30" text-anchor="middle">↑ ${e.in}</text><text class="mv-label is-dim" x="52.5" y="46" text-anchor="middle">↓ ${e.out}</text>`;
    } else {
      inner += `<text class="mv-label" x="52.5" y="39" text-anchor="middle">VAR</text>`;
    }
    return `<svg class="pitch-svg moment__svg" viewBox="-3 -3 111 74" aria-hidden="true">${pitchSvg()}${inner}</svg>`;
  }

  /** Compositions sur un terrain (domicile à gauche). */
  function lineupSvg(m) {
    const team = (club, side) => slots(club.formation, 15, 45, 4.5).map((s, i) => {
      const n = club.xi[i];
      const x = side === 'h' ? s.x * 1.05 : (100 - s.x) * 1.05;
      const y = side === 'h' ? s.y * 0.68 : (100 - s.y) * 0.68;
      const nm = T.lastName(T.playerName(club, n));
      return `<g class="lu lu--${side}" style="--d:${(side === 'h' ? i : i + 11) * 45}ms" data-num="${n}" data-side="${side}">` +
        `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="2.7"/>` +
        `<text class="lu__n" x="${x.toFixed(2)}" y="${y.toFixed(2)}" dy=".36em" text-anchor="middle">${n}</text>` +
        `<text class="lu__name" x="${x.toFixed(2)}" y="${(y + 5.4).toFixed(2)}" text-anchor="middle">${esc(nm)}</text></g>`;
    }).join('');
    return `<svg class="pitch-svg lineup__svg" viewBox="-3 -3 111 74" role="img" aria-label="Compositions de départ : ${esc(m.h.name)} en ${m.h.formation}, ${esc(m.a.name)} en ${m.a.formation}">${pitchSvg()}${team(m.h, 'h')}${team(m.a, 'a')}</svg>`;
  }

  window.TheoriaGfx = {
    Camera, Replay, poster, displayFont, noiseURL,
    pitchSvg, shotMapSvg, xgChartSvg, momentSvg, lineupSvg, ease, easeIO, lerp
  };
})();
