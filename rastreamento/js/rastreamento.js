/* ============================================
   rastreamento.js — LP Rastreamento Avançado
   WhatsApp CTAs + tracking (Lead com dedup CAPI) + reveals + monitor de eventos
   ============================================ */
(function () {
  'use strict';

  /* ---------- WhatsApp ---------- */
  var utm = (function () {
    var p = new URLSearchParams(window.location.search);
    var bits = [p.get('utm_source'), p.get('utm_campaign')].filter(Boolean);
    return bits.length ? ' [' + bits.join('/') + ']' : '';
  })();
  var waMsg = 'Olá! Vi a página de Rastreamento Avançado da Jumper e quero um diagnóstico do meu rastreamento.' + utm + ' [RASTREAMENTO]';
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
    if (typeof gtag === 'function') gtag('event', 'click_cta', { id: 'rastreamento_' + pos });
    if (!el.classList.contains('js-wa')) return;

    var eventId = 'rs-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', { content_name: 'rastreamento_' + pos }, { eventID: eventId });
    }
    try {
      var payload = JSON.stringify({
        event_name: 'Lead',
        event_id: eventId,
        event_source_url: location.href,
        fbp: readCookie('_fbp'),
        fbc: readCookie('_fbc'),
        data: { content_name: 'rastreamento_' + pos }
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

  /* ---------- monitor de eventos ---------- */
  var feed = document.getElementById('rs-feed');
  if (!feed) return;

  var countEl = document.getElementById('rs-count');
  var recEl = document.getElementById('rs-recovered');
  var count = 1284;   /* ponto de partida plausível do dia */
  var recovered = 412;

  /* [nome, valor?, selos[], recuperado?] — selos: ok, warn, dedup */
  var EVENTS = [
    ['PageView', null, [['web', 'ok'], ['server', 'ok']], false],
    ['view_item', null, [['web', 'ok'], ['server', 'ok']], false],
    ['AddToCart', 'R$ 189,90', [['web ✗ adblock', 'warn'], ['server ✓', 'ok'], ['recuperado', 'ok']], true],
    ['begin_checkout', null, [['iOS', 'warn'], ['cookie first-party ✓', 'ok']], true],
    ['Purchase', 'R$ 487,90', [['web', 'ok'], ['server', 'ok'], ['deduplicado', 'dedup']], false],
    ['Lead', null, [['web', 'ok'], ['server', 'ok'], ['deduplicado', 'dedup']], false],
    ['add_payment_info', null, [['web ✗ adblock', 'warn'], ['server ✓', 'ok'], ['recuperado', 'ok']], true],
    ['Purchase', 'R$ 1.240,00', [['Safari', 'warn'], ['first-party ✓', 'ok'], ['deduplicado', 'dedup']], true]
  ];

  function makeEvt(spec) {
    var d = document.createElement('div');
    d.className = 'rs-evt' + (spec[3] ? ' is-recovered' : '');
    var html = '<span class="name">' + spec[0] + '</span>';
    if (spec[1]) html += '<span class="val">' + spec[1] + '</span>';
    spec[2].forEach(function (b) { html += '<span class="b ' + b[1] + '">' + b[0] + '</span>'; });
    d.innerHTML = html;
    return d;
  }

  function pushEvt(spec) {
    var node = makeEvt(spec);
    feed.appendChild(node);
    void node.offsetWidth;
    node.classList.add('in-view');
    while (feed.children.length > 7) feed.removeChild(feed.firstChild);
    count += 1;
    if (spec[3]) recovered += 1;
    if (countEl) countEl.textContent = count.toLocaleString('pt-BR');
    if (recEl) recEl.textContent = recovered.toLocaleString('pt-BR');
  }

  if (reduced) {
    EVENTS.slice(0, 6).forEach(pushEvt);
    return;
  }

  var idx = 0;
  var timer = null;
  var running = false;

  function tick() {
    var delay = 900 + Math.floor(((idx * 7919) % 100) / 100 * 1400); /* 0.9–2.3s, determinístico */
    timer = setTimeout(function () {
      pushEvt(EVENTS[idx % EVENTS.length]);
      idx += 1;
      tick();
    }, delay);
  }
  function start() { if (!running) { running = true; tick(); } }
  function stop() { running = false; clearTimeout(timer); }

  if ('IntersectionObserver' in window) {
    var monIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
    }, { threshold: 0.25 });
    monIO.observe(feed);
  } else {
    start();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (feed.getBoundingClientRect().top < window.innerHeight) start();
  });
})();
