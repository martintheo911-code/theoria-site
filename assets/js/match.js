/* THEORIA — page résumé de match (match.html#identifiant-du-match) */
(function () {
  'use strict';

  const T = window.Theoria, UI = window.TheoriaUI, G = window.TheoriaGfx, M = window.TheoriaMotion;
  const { esc, typo, nf, dateLong, minute } = T.fmt;
  const $ = s => document.querySelector(s);

  const fromHash = () => decodeURIComponent((window.location.hash || '').slice(1));
  const id = fromHash();
  const m = T.byId[id] || T.featured;

  // Un autre résumé demandé depuis cette page : on recharge proprement.
  window.addEventListener('hashchange', () => {
    const next = fromHash();
    if (T.byId[next] && next !== m.id) window.location.reload();
  });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  document.title = `${m.h.short} ${m.score[0]}–${m.score[1]} ${m.a.short} · ${m.title} | THEORIA`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', m.dek);

  UI.chrome();
  UI.hero($('[data-hero]'), m, 'match');

  /* ---------- Sous-navigation ---------- */
  const sub = $('[data-subnav]');
  const sections = [['recit', 'Résumé'], ['moments', 'Moments clés'], ['chiffres', 'Chiffres'], ['analyse', 'Analyse'], ['compos', 'Compositions']];
  sub.innerHTML = `<div class="subnav__inner">
    <p class="subnav__score"><b>${m.h.short}</b> ${m.score[0]}–${m.score[1]} <b>${m.a.short}</b></p>
    <ul>${sections.map(([sid, l]) => `<li><button type="button" class="tag" data-go="${sid}">${l}</button></li>`).join('')}</ul>
  </div>`;
  sub.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
    const t = document.getElementById(b.dataset.go);
    if (!t) return;
    const y = t.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: y, behavior: M.reduced ? 'auto' : 'smooth' });
  }));
  if ('IntersectionObserver' in window) {
    const btns = Object.fromEntries(Array.from(sub.querySelectorAll('[data-go]')).map(b => [b.dataset.go, b]));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      Object.values(btns).forEach(b => b.classList.remove('is-active'));
      if (btns[e.target.id]) btns[e.target.id].classList.add('is-active');
    }), { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(([sid]) => { const s = document.getElementById(sid); if (s) io.observe(s); });
  }

  /* ---------- Récit ---------- */
  const goals = side => m.events.filter(e => e.t === 'goal' && e.side === side);
  const fiche = [
    ['Compétition', `${m.competition} · ${m.round}`],
    ['Date', `${dateLong(m.when)}, ${m.kickoff.replace(':', ' h ')}`],
    ['Stade', m.h.stadium],
    ['Affluence', `${nf(m.attendance)} spectateurs`],
    ['Arbitre', m.referee],
    ['Mi-temps', `${m.h.short} ${m.ht[0]}–${m.ht[1]} ${m.a.short}`],
    ['xG', `${nf(m.xg[0], 2)} – ${nf(m.xg[1], 2)}`]
  ];
  $('[data-recit]').innerHTML = `
    <div class="section__inner recit">
      <div class="recit__main">
        <p class="eyebrow">Le résumé</p>
        <h2 class="recit__title" data-split>${esc(m.title)}</h2>
        <div class="recit__body">
          ${m.storyHtml.map((p, i) => `<p class="${i === 0 ? 'recit__lead' : ''}" data-reveal="up" style="--i:${i}">${p}</p>`).join('')}
        </div>
      </div>
      <aside class="fiche" data-reveal="up" aria-label="Fiche du match">
        <p class="fiche__title">Fiche du match</p>
        <dl>${fiche.map(([k, v]) => `<div><dt>${k}</dt><dd>${typo(esc(v))}</dd></div>`).join('')}</dl>
        <div class="fiche__goals">
          <p><b>${m.h.short}</b> ${goals('h').map(e => `${esc(T.lastName(e.name))} ${minute(e.m)}`).join(', ') || 'Aucun but'}</p>
          <p><b>${m.a.short}</b> ${goals('a').map(e => `${esc(T.lastName(e.name))} ${minute(e.m)}`).join(', ') || 'Aucun but'}</p>
        </div>
      </aside>
    </div>`;

  /* ---------- Moments, chiffres ---------- */
  UI.moments($('[data-moments]'), m, {});
  UI.stats($('[data-stats]'), m, {});

  /* ---------- Analyse ---------- */
  $('[data-analyse]').innerHTML = `
    <div class="manifesto__inner">
      <p class="eyebrow eyebrow--light">La théorie</p>
      <p class="manifesto__text" data-highlight>${m.analysisText}</p>
      <p class="manifesto__sign">Lecture THEORIA · ${esc(m.h.name)} – ${esc(m.a.name)}</p>
    </div>`;

  /* ---------- Compositions ---------- */
  const xiList = side => {
    const c = m.club(side);
    return `<div class="xi" data-side="${side}">
      <p class="xi__head"><b>${c.short}</b> ${esc(c.name)} <span>${c.formation}</span></p>
      <ol>${c.xi.map(n => `<li data-num="${n}"><span class="xi__n">${n}</span>${esc(T.playerName(c, n))}</li>`).join('')}</ol>
    </div>`;
  };
  const motmClub = m.motm ? m.club(m.motm.side) : null;
  $('[data-compos]').innerHTML = `
    <div class="section__inner">
      <header class="sec-head">
        <div><p class="eyebrow">Compositions</p><h2 class="sec-title" data-split>Les onze de départ</h2></div>
      </header>
      <div class="compos">
        <figure class="lineup" data-reveal="lineup">${G.lineupSvg(m)}</figure>
        <div class="compos__side">
          ${xiList('h')}${xiList('a')}
          ${m.motm ? `<div class="motm" data-reveal="up">
            <p class="eyebrow">Homme du match</p>
            <p class="motm__name">${esc(m.motmName)}</p>
            <p class="motm__meta">${esc(motmClub.name)} · n° ${m.motm.n}</p>
            <p class="motm__rating"><span data-count="${m.motm.rating}" data-decimals="1">${nf(m.motm.rating, 1)}</span><small>/10</small></p>
            <dl class="player__stats">${m.motm.line.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${typo(v)}</dd></div>`).join('')}</dl>
          </div>` : ''}
        </div>
      </div>
    </div>`;
  // Survol croisé : liste ↔ terrain
  const compos = $('[data-compos]');
  compos.addEventListener('pointerover', e => {
    const t = e.target.closest('[data-num]'); if (!t) return;
    const side = t.closest('[data-side]').dataset.side, n = t.dataset.num;
    compos.querySelectorAll('.is-hot').forEach(x => x.classList.remove('is-hot'));
    compos.querySelectorAll(`[data-side="${side}"][data-num="${n}"], [data-side="${side}"] [data-num="${n}"]`).forEach(x => x.classList.add('is-hot'));
  });
  compos.addEventListener('pointerleave', () => compos.querySelectorAll('.is-hot').forEach(x => x.classList.remove('is-hot')));

  /* ---------- À voir aussi ---------- */
  const others = T.matches.filter(x => x.id !== m.id);
  UI.rail($('[data-rail-section]'), others, { eyebrow: 'À voir aussi', title: 'Les autres résumés' });

  UI.boot();
})();
