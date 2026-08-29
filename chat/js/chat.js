/* ============================================
   chat.js — LP JumperChat
   WhatsApp CTAs + tracking (Lead com dedup CAPI) + reveals + a mesa ao vivo
   ============================================ */
(function () {
  'use strict';

  /* ---------- WhatsApp ---------- */
  var utm = (function () {
    var p = new URLSearchParams(window.location.search);
    var bits = [p.get('utm_source'), p.get('utm_campaign')].filter(Boolean);
    return bits.length ? ' [' + bits.join('/') + ']' : '';
  })();
  var waMsg = 'Olá! Vi a página do JumperChat e quero testar a mesa por 15 dias.' + utm + ' [CHAT]';
  document.querySelectorAll('.js-wa').forEach(function (a) {
    a.href = 'https://wa.me/5521964369191?text=' + encodeURIComponent(waMsg);
  });

  /* ---------- tracking: Lead (Pixel + CAPI com dedup) em clique de WhatsApp ---------- */
  function readCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : undefined;
  }
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-cta]');
    if (!el) return;
    var pos = el.getAttribute('data-cta') || 'cta';
    if (typeof gtag === 'function') gtag('event', 'click_cta', { id: 'chat_' + pos });
    if (!el.classList.contains('js-wa')) return;

    var eventId = 'jc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', { content_name: 'chat_' + pos }, { eventID: eventId });
    }
    try {
      var payload = JSON.stringify({
        event_name: 'Lead',
        event_id: eventId,
        event_source_url: location.href,
        fbp: readCookie('_fbp'),
        fbc: readCookie('_fbc'),
        data: { content_name: 'chat_' + pos }
      });
      var sent = false;
      if (navigator.sendBeacon) {
        try { sent = navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' })); } catch (e2) {}
      }
      if (!sent && typeof fetch === 'function') {
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(function () {});
      }
    } catch (e) { /* beacon é best-effort */ }
  });

  /* ---------- reveals ---------- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-anim');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  }

  /* ---------- a mesa ao vivo ---------- */
  var stage = document.getElementById('jc-msgs');
  if (!stage) return;

  var tagEl = document.getElementById('jc-tag');
  var ownerEl = document.getElementById('jc-owner');
  var asEl = document.getElementById('jc-as');
  var badgeEl = document.getElementById('jc-badge');
  var previewEl = document.getElementById('jc-preview');

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.firstElementChild;
  }

  function msgThem(inner) { return el('<div class="jc-msg from-them">' + inner + '</div>'); }
  function msgUs(who, ai, inner) {
    return el('<div class="jc-msg from-us"><span class="who' + (ai ? ' is-ai' : '') + '">' + who + '</span>' + inner + '</div>');
  }
  function eventLine(inner) { return el('<div class="jc-event">' + inner + '</div>'); }
  function wave() {
    var bars = '';
    for (var i = 0; i < 16; i++) bars += '<i></i>';
    return '<span class="jc-audio"><span class="play"></span><span class="wave">' + bars + '</span><span>0:07</span></span>';
  }

  /* roteiro do loop: [delay ms, função que devolve o nó | ação] */
  var script = [
    [600,  function () { return msgThem('Oi! Vocês têm horário amanhã de manhã?'); }],
    [500,  function () { if (previewEl) previewEl.textContent = 'agora · 1 nova mensagem'; }],
    [900,  function () { return msgUs('Recepção', true, 'Oi! Temos sim 😊 Me conta: é sua primeira vez com a gente?'); }],
    [1600, function () { return msgThem(wave() + '<span class="jc-transcript"><b>transcrito pela IA:</b> “É sim! Queria uma limpeza de pele.”</span>'); }],
    [1400, function () {
      if (tagEl) { tagEl.textContent = 'limpeza de pele'; tagEl.classList.add('is-hot'); }
      return eventLine('IA qualificou · etiqueta <b>limpeza de pele</b> · encaminhando ao Comercial');
    }],
    [1300, function () {
      if (ownerEl) { ownerEl.textContent = 'dona: Ana · Comercial'; ownerEl.classList.add('is-set'); }
      if (asEl) asEl.textContent = 'Ana · Comercial';
      if (badgeEl) badgeEl.classList.add('is-clear');
      if (previewEl) previewEl.textContent = 'Comercial · com Ana';
      return eventLine('Conversa transferida para <b>Ana</b> — com o histórico inteiro na tela');
    }],
    [1200, function () { return msgUs('Ana', false, 'Oi, Marina! Ana aqui, do comercial 👋 Amanhã tenho 9h30 ou 11h — qual prefere?'); }],
    [1500, function () { return msgThem('9h30 é perfeito! 🙌'); }]
  ];

  function resetDemo() {
    stage.innerHTML = '';
    if (tagEl) { tagEl.textContent = 'novo contato'; tagEl.classList.remove('is-hot'); }
    if (ownerEl) { ownerEl.textContent = 'sem dono'; ownerEl.classList.remove('is-set'); }
    if (asEl) asEl.textContent = 'IA de recepção';
    if (badgeEl) badgeEl.classList.remove('is-clear');
    if (previewEl) previewEl.textContent = 'agora · novo contato';
  }

  function renderStep(step) {
    var node = step[1]();
    if (node) {
      stage.appendChild(node);
      /* força reflow pra transição de entrada rodar */
      void node.offsetWidth;
      node.classList.add('in-view');
      while (stage.children.length > 6) stage.removeChild(stage.firstChild);
    }
  }

  if (reduced) {
    /* sem animação: renderiza a cena final completa, estática */
    script.forEach(function (s) { renderStep(s); });
    return;
  }

  var idx = 0;
  var timer = null;
  var running = false;

  function tick() {
    if (idx >= script.length) {
      timer = setTimeout(function () { resetDemo(); idx = 0; tick(); }, 5200);
      return;
    }
    var step = script[idx++];
    timer = setTimeout(function () { renderStep(step); tick(); }, step[0]);
  }

  function start() { if (!running) { running = true; resetDemo(); idx = 0; tick(); } }
  function stop() { running = false; clearTimeout(timer); }

  /* roda só com o hero visível; pausa em aba oculta */
  if ('IntersectionObserver' in window) {
    var demoIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
    }, { threshold: 0.25 });
    demoIO.observe(stage);
  } else {
    start();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (stage.getBoundingClientRect().top < window.innerHeight) start();
  });
})();
