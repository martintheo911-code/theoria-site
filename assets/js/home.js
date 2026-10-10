/* THEORIA — page d’accueil */
(function () {
  'use strict';

  const T = window.Theoria, UI = window.TheoriaUI;
  const $ = s => document.querySelector(s);
  const f = T.featured;

  UI.chrome();
  UI.hero($('[data-hero]'), f, 'home');
  UI.ticker($('[data-ticker]'));

  $('[data-tiles]').innerHTML = T.data.spotlight.map(id => T.byId[id]).filter(Boolean).map(UI.tile).join('');

  UI.moments($('[data-moments]'), f, { title: `${f.h.name} – ${f.a.name}, minute par minute`, more: true });
  UI.stats($('[data-stats]'), f, { title: `${f.h.name} – ${f.a.name}`, more: true });
  UI.rail($('[data-rail-section]'), T.matches, { filters: true });

  $('[data-players]').innerHTML = T.data.playersOfWeek.map(id => T.byId[id]).filter(m => m && m.motm).map(UI.playerCard).join('');

  UI.boot();
})();
