/* Ruvi Ads Media · site.js
   Menu do celular. Sem bibliotecas. */

(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var botao = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (!botao || !menu) return;

  var aberto = function () { return botao.getAttribute('aria-expanded') === 'true'; };
  var definir = function (abrir) {
    menu.classList.toggle('aberto', abrir);
    botao.setAttribute('aria-expanded', String(abrir));
    botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    if (abrir) { var primeiro = menu.querySelector('a'); if (primeiro) primeiro.focus(); }
  };
  botao.addEventListener('click', function () { definir(!aberto()); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) definir(false); });
  document.addEventListener('click', function (e) {
    if (aberto() && !menu.contains(e.target) && !botao.contains(e.target)) definir(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && aberto()) { definir(false); botao.focus(); }
  });
  window.matchMedia('(min-width:901px)').addEventListener('change', function (m) { if (m.matches) definir(false); });
})();
