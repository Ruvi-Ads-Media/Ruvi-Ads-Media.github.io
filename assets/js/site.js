/* Ruvi Ads Media · site.js
   Menu do celular, destino dos botões de contato, vídeos sob demanda, aviso de cookies e rastreamento.
   Sem bibliotecas. As configurações abaixo são o único lugar que precisa mudar. */

// ===== Configuração =====================================================

// IDs públicos do Meta Pixel e do GA4 (ex.: '123456789012345' e 'G-XXXXXXXXXX'). Vazio = a tag não carrega.
var META_PIXEL_ID = '';
var GA4_ID = '';

// Destino dos botões "Quero crescer com a Ruvi" e "Falar com a Ruvi": 'instagram' ou 'whatsapp'.
// WhatsApp: número só com dígitos, com 55 e DDD (ex.: '5511999999999'). Sem número, os botões vão para o Instagram.
var CTA = {
  destino: 'instagram',
  instagram: 'https://www.instagram.com/ruviadsmedia/',
  whatsapp: {
    numero: '',
    mensagem: 'Olá! Vim pelo site da Ruvi e quero entender como vocês podem ajudar meu salão.'
  }
};

// ========================================================================

(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // ----- Menu do celular -----
  var botao = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (botao && menu) {
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
  }

  // ----- Botões de contato -----
  var destinoCta = CTA.destino === 'whatsapp' && CTA.whatsapp.numero ? 'whatsapp' : 'instagram';
  var sufixo = { hero: ' (topo)', contato: ' (contato)' };
  document.querySelectorAll('[data-cta]').forEach(function (link) {
    var local = link.getAttribute('data-cta');
    link.href = destinoCta === 'whatsapp'
      ? 'https://wa.me/' + CTA.whatsapp.numero + '?text=' + encodeURIComponent(CTA.whatsapp.mensagem + (sufixo[local] || ''))
      : CTA.instagram;
    link.addEventListener('click', function () { trackContato(local, destinoCta); });
  });

  // ----- Vídeos de case: o embed sai do <template> só quando a caixa chega perto da tela -----
  var caixas = document.querySelectorAll('.video:not([hidden])');
  var montar = function (caixa) {
    var modelo = caixa.querySelector('template');
    if (!modelo) return;
    var conteudo = modelo.content.cloneNode(true);
    // Scripts clonados de <template> não rodam; recria cada um para o player do VTurb carregar.
    conteudo.querySelectorAll('script').forEach(function (velho) {
      var novo = document.createElement('script');
      Array.prototype.forEach.call(velho.attributes, function (a) { novo.setAttribute(a.name, a.value); });
      novo.text = velho.text;
      velho.replaceWith(novo);
    });
    modelo.replaceWith(conteudo);
  };
  if (caixas.length) {
    if ('IntersectionObserver' in window) {
      var observador = new IntersectionObserver(function (itens) {
        itens.forEach(function (item) {
          if (item.isIntersecting) { observador.unobserve(item.target); montar(item.target); }
        });
      }, { rootMargin: '300px 0px' });
      caixas.forEach(function (c) { observador.observe(c); });
    } else {
      caixas.forEach(montar);
    }
  }

  // ----- Consentimento (LGPD): nenhuma tag carrega antes de "Aceitar" -----
  var CHAVE = 'ruvi_consent';
  var VALIDADE_MS = 365 * 24 * 60 * 60 * 1000;
  var consentimento = lerConsentimento(); // 'aceito' | 'recusado' | null
  var tagsCarregadas = false;

  function lerConsentimento() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (salvo && (salvo.valor === 'aceito' || salvo.valor === 'recusado') &&
          Date.now() - new Date(salvo.data).getTime() < VALIDADE_MS) return salvo.valor;
    } catch (e) { /* armazenamento bloqueado: pergunta de novo a cada visita */ }
    return null;
  }

  function carregarScript(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  function concederTags() {
    var permitido = { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' };
    if (tagsCarregadas) {
      if (window.gtag) window.gtag('consent', 'update', permitido);
      if (window.fbq) window.fbq('consent', 'grant');
      return;
    }
    tagsCarregadas = true;

    if (GA4_ID) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      window.gtag('consent', 'update', permitido);
      window.gtag('js', new Date());
      window.gtag('config', GA4_ID); // envia o page_view
      carregarScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID));
    }

    if (META_PIXEL_ID) {
      // Fila padrão do Meta Pixel: guarda as chamadas até o fbevents.js chegar.
      var fbq = window.fbq = function () {
        if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments); else fbq.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
      carregarScript('https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', META_PIXEL_ID);
      fbq('track', 'PageView');
    }
  }

  // Chamada em todo clique de botão de contato. O link do Instagram do rodapé não conta como conversão.
  function trackContato(local, destino) {
    if (consentimento !== 'aceito') return;
    if (window.fbq) window.fbq('track', 'Contact');
    if (window.gtag) window.gtag('event', 'contato_clique', { local: local, destino: destino });
  }

  // Aviso de cookies removido a pedido da Priscila (29/10/2026). Sem aviso não há aceite,
  // então nenhuma tag carrega, mesmo com os IDs preenchidos. Para medir, o aviso precisa voltar (LGPD).
  if (consentimento === 'aceito') concederTags();
})();
