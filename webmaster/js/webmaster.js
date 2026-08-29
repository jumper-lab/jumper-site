/* ============================================
   webmaster.js — LP Jumper Webmaster (protótipo Fable, ato II)
   Camada 1: lógica de produto (nichos, datas, WhatsApp, contador)
   Camada 2: cinematografia GSAP/Lenis (progressive enhancement —
   sem GSAP ou com prefers-reduced-motion, a página é 100% estática e legível)
   ============================================ */
(function () {
  'use strict';

  /* ================= CAMADA 1 — PRODUTO ================= */

  var NICHES = {
    food:      { chip: 'Restaurante', term: 'um restaurante',             search: 'um restaurante',        model: 'Food Menu',     modelFor: 'pra restaurantes, padarias e delivery',       demo: '/webmaster/demos/virilhatos/',    demoName: "Virilhato's",     demoFor: 'restaurante · brasa & técnica francesa', shot: '/webmaster/img/hero-food.webp', shotWide: '/webmaster/img/site-food.webp' },
    laundry:   { chip: 'Lavanderia',  term: 'uma lavanderia',             search: 'uma lavanderia',        model: 'Wash & Fold',   modelFor: 'pra lavanderias e serviços de bairro',        demo: '/webmaster/demos/lavou/',         demoName: 'Lavou',           demoFor: 'lavanderia urbana · Pinheiros',          shot: '/webmaster/img/hero-laundry.webp', shotWide: '/webmaster/img/site-laundry.webp' },
    clinic:    { chip: 'Clínica',     term: 'uma clínica',                search: 'uma clínica',           model: 'Clean Service', modelFor: 'pra clínicas e consultórios',                 demo: '/webmaster/demos/salles/',        demoName: 'Clínica Salles',  demoFor: 'dermatologia · Pinheiros, SP',           shot: '/webmaster/img/hero-clinic.webp', shotWide: '/webmaster/img/site-clinic.webp' },
    gamehouse: { chip: 'Locadora',    term: 'uma locadora de jogos',      search: 'uma locadora de jogos', model: 'Play Space',    modelFor: 'pra locadoras, ludotecas e espaços de lazer', demo: '/webmaster/demos/grifo-dourado/', demoName: 'O Grifo Dourado', demoFor: 'locadora de jogos · Curitiba',           shot: '/webmaster/img/hero-gamehouse.webp', shotWide: '/webmaster/img/site-gamehouse.webp' },
    legal:     { chip: 'Advocacia',   term: 'um escritório de advocacia', search: 'um advogado',           model: 'Pro Legal',     modelFor: 'pra advogados, contadores e consultores', demo: '/webmaster/demos/pro-legal/',      demoName: 'Athos Advocacia', demoFor: 'direito empresarial · contratos e tributário' },
    beauty:    { chip: 'Beleza',      term: 'um espaço de estética',      search: 'um salão',              model: 'Beauty Clinic', modelFor: 'pra estética, clínicas e salões',           demo: '/webmaster/demos/beauty-clinic/',  demoName: 'Ateliê Flor',     demoFor: 'estética facial · bem-estar' }
  };
  /* ordem: Virilhato's, Lavou, Salles, Grifo (demos reais); mockups por último */
  var ORDER = ['food', 'laundry', 'clinic', 'gamehouse', 'legal', 'beauty'];
  var current = 'food';

  /* o que mostrar no telefone do hero: screenshot do site real (demo) ou mockup CSS */
  function screenFor(key, variant) {
    var src = variant === 'wide' ? NICHES[key].shotWide : NICHES[key].shot;
    if (src) {
      var img = document.createElement('img');
      img.className = variant === 'wide' ? 'wm-shot is-wide-shot' : 'wm-shot is-phone-shot';
      img.src = src;
      img.alt = 'Prévia do site ' + (NICHES[key].demoName || NICHES[key].model);
      img.decoding = 'async';
      if (variant === 'wide') img.loading = 'lazy';
      else img.fetchPriority = 'high';
      return img;
    }
    return cloneMini(key);
  }

  function heroPreviewFor(key) {
    if (!NICHES[key].demo) return screenFor(key);

    var frame = document.createElement('iframe');
    frame.className = 'hero-phone-live';
    frame.title = 'Prévia mobile do site ' + (NICHES[key].demoName || NICHES[key].model);
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.src = NICHES[key].demo;
    frame.addEventListener('load', function () { initHeroPhoneFrame(frame); }, { once: true });
    return frame;
  }

  function buildPreviewFor(key) {
    if (!NICHES[key].demo) return screenFor(key);

    var frame = document.createElement('iframe');
    frame.className = 'hero-phone-live build-phone-live';
    frame.title = 'Prévia mobile do site ' + (NICHES[key].demoName || NICHES[key].model);
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.src = NICHES[key].demo;
    frame.addEventListener('load', function () {
      sizeHeroPhoneFrame(frame);
      try {
        var doc = frame.contentDocument;
        var style = doc.createElement('style');
        style.textContent = [
          'html{scroll-behavior:auto!important;}',
          'html,body{overflow-x:hidden!important;scrollbar-width:none!important;}',
          'html::-webkit-scrollbar,body::-webkit-scrollbar{display:none!important;width:0!important;height:0!important;}',
          'body{box-sizing:border-box!important;}'
        ].join('');
        doc.head.appendChild(style);
        frame.contentWindow.scrollTo(0, 0);
      } catch (e) { /* iframe same-origin em dev/prod */ }
    }, { once: true });
    return frame;
  }

  function demoAddressFor(key) {
    var label = NICHES[key].demoName || NICHES[key].model;
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '')
      .replace(/^o(?=grifo)/, '') + '.com.br';
  }

  function baPreviewFor(key) {
    if (!NICHES[key].demo) return screenFor(key, 'wide');

    var shell = document.createElement('div');
    shell.className = 'ba-live-window';

    var chrome = document.createElement('div');
    chrome.className = 'ba-live-chrome';
    chrome.innerHTML =
      '<span class="ba-live-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="ba-live-address">' + demoAddressFor(key) + '</span>' +
      '<span class="ba-live-status" aria-hidden="true">resultado final</span>';

    var frame = document.createElement('iframe');
    frame.className = 'ba-live-frame';
    frame.title = 'Prévia em janela do site ' + (NICHES[key].demoName || NICHES[key].model);
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.src = NICHES[key].demo;
    frame.addEventListener('load', function () {
      sizeBaLiveFrame(shell);
      try {
        var doc = frame.contentDocument;
        doc.documentElement.style.scrollBehavior = 'auto';
        doc.documentElement.style.scrollbarWidth = 'none';
        doc.body.style.scrollbarWidth = 'none';
        frame.contentWindow.scrollTo(0, 0);
      } catch (e) { /* iframe same-origin em dev/prod */ }
    }, { once: true });

    shell.appendChild(chrome);
    shell.appendChild(frame);
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () { sizeBaLiveFrame(shell); });
      ro.observe(shell);
      shell._cleanup = function () { ro.disconnect(); };
    } else {
      var onResize = function () { sizeBaLiveFrame(shell); };
      window.addEventListener('resize', onResize);
      shell._cleanup = function () { window.removeEventListener('resize', onResize); };
    }
    requestAnimationFrame(function () { sizeBaLiveFrame(shell); });
    return shell;
  }

  function sizeBaLiveFrame(shell) {
    if (!shell || !shell.isConnected) return;
    var frame = shell.querySelector('.ba-live-frame');
    if (!frame) return;
    var chrome = shell.querySelector('.ba-live-chrome');
    var chromeHeight = chrome ? chrome.getBoundingClientRect().height : 34;
    var availableWidth = Math.max(1, shell.clientWidth);
    var availableHeight = Math.max(1, shell.clientHeight - chromeHeight);
    var previewWidth = availableWidth < 1120 ? 1360 : availableWidth;
    var scale = availableWidth / previewWidth;
    frame.style.setProperty('--ba-preview-scale', scale);
    frame.style.width = Math.ceil(previewWidth) + 'px';
    frame.style.height = Math.ceil(availableHeight / scale) + 'px';
  }

  function sizeHeroPhoneFrame(frame) {
    if (!frame || !frame.parentElement) return 1;
    var screen = frame.parentElement;
    var mobileWidth = 390;
    var safeTop = parseFloat(getComputedStyle(screen).getPropertyValue('--hero-phone-safe-top')) || 0;
    var previewInset = parseFloat(getComputedStyle(screen).getPropertyValue('--hero-phone-preview-inset')) || 0;
    var viewportHeight = parseFloat(getComputedStyle(screen).getPropertyValue('--hero-phone-viewport-height')) || 0;
    var availableWidth = Math.max(1, screen.clientWidth - previewInset * 2);
    var availableHeight = Math.max(1, screen.clientHeight - safeTop - previewInset * 2);
    var scale = availableWidth / mobileWidth;
    var frameHeight = Math.ceil(availableHeight / scale);
    var offsetX = previewInset;
    var offsetY = safeTop + previewInset;
    if (viewportHeight) {
      scale = Math.min(scale, availableHeight / viewportHeight);
      frameHeight = viewportHeight;
      offsetX += Math.max(0, (availableWidth - mobileWidth * scale) / 2);
      offsetY += Math.max(0, (availableHeight - viewportHeight * scale) / 2);
    }
    frame.style.setProperty('--hero-phone-scale', scale);
    frame.style.left = offsetX + 'px';
    frame.style.top = offsetY + 'px';
    frame.style.width = mobileWidth + 'px';
    frame.style.height = frameHeight + 'px';
    return scale;
  }

  function initHeroPhoneFrame(frame) {
    sizeHeroPhoneFrame(frame);
    var start = 0;
    var duration = 5800;
    function tick(now) {
      if (!frame.isConnected || document.hidden) return;
      if (!start) start = now;
      var p = Math.min(1, (now - start) / duration);
      var eased = 0.5 - Math.cos(p * Math.PI) / 2;
      try {
        var doc = frame.contentDocument;
        var max = Math.max(0, Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight) - frame.contentWindow.innerHeight);
        frame.contentWindow.scrollTo(0, max * Math.min(0.34, eased * 0.34));
      } catch (e) { /* iframe same-origin em dev/prod */ }
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () {
    document.querySelectorAll('.hero-phone-live').forEach(sizeHeroPhoneFrame);
  });

  /* minis existentes são dos nichos originais; mapeia/faz fallback pras chaves novas */
  var MINI_ALIAS = { clinic: 'clean', gamehouse: 'shop' };
  function cloneMini(key) {
    var t = document.getElementById('mini-' + (MINI_ALIAS[key] || key))
         || document.getElementById('mini-food');
    return t ? t.content.firstElementChild.cloneNode(true) : null;
  }

  var utm = (function () {
    var p = new URLSearchParams(window.location.search);
    var bits = [p.get('utm_source'), p.get('utm_campaign')].filter(Boolean);
    return bits.length ? ' [' + bits.join('/') + ']' : '';
  })();

  var WM_VARIANT = window.WM_VARIANT || null; /* setado pelo script inline do <head> */
  var nichePicked = false;

  function waHref(niche, model) {
    var msg = 'Olá! Vi o Jumper Webmaster e quero meu site por R$ 2.980*.';
    /* na variante A o picker sai da página e o carrossel não roda —
       só afirma o nicho se o visitante escolheu de fato */
    if (WM_VARIANT !== 'a' || nichePicked || model) msg += ' Tenho ' + NICHES[niche].term + '.';
    if (model) msg += ' Quero começar com o modelo ' + model + '.';
    msg += utm;
    if (WM_VARIANT) msg += ' [WM-' + WM_VARIANT.toUpperCase() + ']';
    return 'https://wa.me/5521964369191?text=' + encodeURIComponent(msg);
  }

  function refreshWaLinks() {
    document.querySelectorAll('.js-wa').forEach(function (a) {
      a.href = waHref(a.getAttribute('data-niche') || current, a.getAttribute('data-model') || null);
    });
  }

  var heroScreen = document.getElementById('hero-screen');
  var baAfter = document.getElementById('ba-after');
  var buildScreen = document.getElementById('build-screen');
  var phoneTag = document.getElementById('phone-tag');

  function setNiche(key) {
    current = key;
    document.body.setAttribute('data-niche', key);

    document.querySelectorAll('[data-niche-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-niche-btn') === key));
    });

    [
      [heroScreen, heroPreviewFor(key)],
      [baAfter, baPreviewFor(key)],
      [buildScreen, buildPreviewFor(key)]
    ].forEach(function (pair) {
      var mount = pair[0], node = pair[1];
      if (!mount) return;
      mount.classList.add('swap');
      setTimeout(function () {
        if (mount._cleanup) {
          mount._cleanup();
          mount._cleanup = null;
        }
        mount.innerHTML = '';
        if (node) mount.appendChild(node);
        if (node && node._cleanup) mount._cleanup = node._cleanup;
        mount.classList.remove('swap');
      }, 180);
    });

    document.querySelectorAll('.js-model-name').forEach(function (el) { el.textContent = NICHES[key].model; });
    document.querySelectorAll('.js-model-for').forEach(function (el) { el.textContent = NICHES[key].modelFor; });
    document.querySelectorAll('.js-niche-search').forEach(function (el) { el.textContent = NICHES[key].search; });
    /* tarjinha do telefone: nome real do negócio (demos) ou nome do modelo (mockups) */
    if (phoneTag) {
      phoneTag.innerHTML = NICHES[key].demoName
        ? '<b>' + NICHES[key].demoName + '</b> · ' + NICHES[key].demoFor
        : 'Modelo <b>' + NICHES[key].model + '</b> · ponto de partida ' + NICHES[key].modelFor;
    }
    document.querySelectorAll('.model-card').forEach(function (c) {
      c.classList.toggle('is-active', c.getAttribute('data-model-key') === key);
    });
    refreshWaLinks();
  }

  var HERO_CAROUSEL_MS = 6000;
  var heroCarouselTimer = null;
  var heroCarouselVisible = true;
  var heroCarouselReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function nextHeroNiche() {
    var next = (ORDER.indexOf(current) + 1) % ORDER.length;
    setNiche(ORDER[next]);
  }
  function stopHeroCarousel() {
    if (!heroCarouselTimer) return;
    clearInterval(heroCarouselTimer);
    heroCarouselTimer = null;
  }
  function startHeroCarousel() {
    if (heroCarouselReduced || heroCarouselTimer || !heroCarouselVisible) return;
    heroCarouselTimer = setInterval(nextHeroNiche, HERO_CAROUSEL_MS);
  }
  function restartHeroCarousel() {
    stopHeroCarousel();
    startHeroCarousel();
  }

  document.querySelectorAll('[data-niche-btn]').forEach(function (b) {
    b.addEventListener('click', function () {
      nichePicked = true;
      setNiche(b.getAttribute('data-niche-btn'));
      restartHeroCarousel();
    });
  });

  /* grid de modelos */
  var grid = document.getElementById('models-grid');
  if (grid) {
    ORDER.forEach(function (key) {
      var card = document.createElement('div');
      card.className = 'model-card';
      card.setAttribute('data-model-key', key);
      var screen = document.createElement('div');
      screen.className = 'model-screen';
      if (NICHES[key].demo) {
        /* vitrine viva: iframe real, carregado só quando o card chega perto da tela */
        screen.className += ' has-preview';
        var poster = NICHES[key].shotWide ? screenFor(key, 'wide') : null;
        if (poster && poster.tagName !== 'DIV') {
          poster.className += ' model-live-poster';
          screen.appendChild(poster);
        }
        var frame = document.createElement('iframe');
        frame.className = 'model-live';
        frame.title = 'Prévia ao vivo do site ' + (NICHES[key].demoName || NICHES[key].model);
        frame.loading = 'eager';
        frame.tabIndex = -1;
        frame.setAttribute('aria-hidden', 'true');
        frame.setAttribute('data-src', NICHES[key].demo);
        screen.appendChild(frame);
        var over = document.createElement('a');
        over.className = 'model-preview-link';
        over.href = NICHES[key].demo;
        over.target = '_blank';
        over.rel = 'noopener';
        over.setAttribute('data-cta', 'preview-' + key);
        over.setAttribute('aria-label', 'Ver o site ' + NICHES[key].model + ' ao vivo');
        over.innerHTML = '<span class="model-preview-badge">Ver ao vivo ↗</span>';
        screen.appendChild(over);
      } else {
        var mini = cloneMini(key);
        if (mini) screen.appendChild(mini);
      }
      var info = document.createElement('div');
      info.className = 'model-info';
      var demoLink = NICHES[key].demo
        ? '<a class="model-demo" data-cta="demo-' + key + '" target="_blank" rel="noopener" href="' + NICHES[key].demo + '">Ver demo ao vivo</a>'
        : '';
      /* card com demo mostra o negócio REAL; sem demo, o nome do modelo-base */
      var title = NICHES[key].demoName || NICHES[key].model;
      var subtitle = NICHES[key].demoFor || NICHES[key].modelFor;
      info.innerHTML =
        '<h3>' + title + '</h3>' +
        '<p>' + subtitle + '</p>' +
        '<div class="model-actions">' +
          '<a class="model-cta js-wa" data-niche="' + key + '" data-model="' + NICHES[key].model + '" data-cta="modelo-' + key + '" target="_blank" rel="noopener" href="#">Começar com este modelo</a>' +
          demoLink +
        '</div>';
      card.appendChild(screen);
      card.appendChild(info);
      grid.appendChild(card);
    });

    var modelOriginalCards = Array.prototype.slice.call(grid.children);
    var modelLoopClones = [];
    function cloneModelCard(card, side) {
      var clone = card.cloneNode(true);
      clone.classList.add('is-clone');
      clone.setAttribute('data-clone-side', side);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
      clone.querySelectorAll('a, button').forEach(function (el) { el.tabIndex = -1; });
      clone.querySelectorAll('.model-screen.is-live-loaded').forEach(function (screen) {
        screen.classList.remove('is-live-loaded');
      });
      clone.querySelectorAll('.model-live').forEach(function (frame) {
        var src = frame.getAttribute('data-src') || frame.getAttribute('src');
        frame.removeAttribute('src');
        frame.classList.remove('is-loaded', 'is-pan-only');
        frame.loading = 'lazy';
        if (src) frame.setAttribute('data-src', src);
      });
      return clone;
    }
    if (modelOriginalCards.length > 0) {
      var loopFrag = document.createDocumentFragment();
      modelOriginalCards.forEach(function (card) {
        var clone = cloneModelCard(card, 'loop');
        modelLoopClones.push(clone);
        loopFrag.appendChild(clone);
      });
      grid.appendChild(loopFrag);
    }

    var liveFrames = Array.prototype.slice.call(grid.querySelectorAll('.model-live[data-src]'));
    var modelMiniScrolls = Array.prototype.slice.call(grid.querySelectorAll('.model-screen .mini-scroll'));
    var MODEL_PREVIEW_PX_PER_SECOND = 9;

    function previewOffset(target, max, now) {
      if (!target._previewClock) target._previewClock = now;
      if (max <= 0) return 0;
      var traveled = ((now - target._previewClock) / 1000) * MODEL_PREVIEW_PX_PER_SECOND;
      var loop = max * 2;
      var phase = traveled % loop;
      return phase <= max ? phase : loop - phase;
    }

    function initMiniPreviewScroll(scrollEl) {
      var raf = 0;
      var visible = !('IntersectionObserver' in window);

      function maxScroll() {
        var holder = scrollEl.closest('.model-screen');
        if (!holder) return 0;
        return Math.max(0, scrollEl.scrollHeight - holder.clientHeight);
      }

      function tick(now) {
        raf = 0;
        if (!visible || document.hidden) return;
        scrollEl.style.transform = 'translate3d(0,' + (-previewOffset(scrollEl, maxScroll(), now)) + 'px,0)';
        raf = requestAnimationFrame(tick);
      }
      function play() {
        if (raf || document.hidden) return;
        raf = requestAnimationFrame(tick);
      }
      function stop() {
        if (!raf) return;
        cancelAnimationFrame(raf);
        raf = 0;
      }

      if ('IntersectionObserver' in window) {
        var miniIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            visible = en.isIntersecting;
            if (visible) play();
            else stop();
          });
        }, { threshold: 0.12 });
        miniIo.observe(scrollEl.closest('.model-screen') || scrollEl);
      } else {
        play();
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
        else if (visible) play();
      });
    }

    modelMiniScrolls.forEach(initMiniPreviewScroll);

    function initLiveFrameScroll(frame, idx) {
      var raf = 0;
      var visible = !('IntersectionObserver' in window);

      function maxScroll() {
        try {
          var doc = frame.contentDocument;
          if (!doc) return 0;
          return Math.max(
            0,
            Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight) - frame.contentWindow.innerHeight
          );
        } catch (e) {
          return 0;
        }
      }

      function tick(now) {
        raf = 0;
        if (!visible || document.hidden) return;
        var max = maxScroll();
        if (max > 8) {
          frame.classList.remove('is-pan-only');
          try { frame.contentWindow.scrollTo(0, previewOffset(frame, max, now)); } catch (e) { /* iframe pode falhar se mudar origem */ }
        } else if (frame._previewClock && now - frame._previewClock > 900) {
          frame.classList.add('is-pan-only');
          return;
        }
        raf = requestAnimationFrame(tick);
      }

      function play() {
        if (raf || document.hidden) return;
        raf = requestAnimationFrame(tick);
      }
      function stop() {
        if (!raf) return;
        cancelAnimationFrame(raf);
        raf = 0;
      }

      try {
        var doc = frame.contentDocument;
        if (doc) {
          doc.documentElement.style.scrollBehavior = 'auto';
          doc.documentElement.style.scrollbarWidth = 'none';
          doc.body.style.scrollbarWidth = 'none';
        }
      } catch (e) { /* same-origin esperado em dev/prod */ }

      if ('IntersectionObserver' in window) {
        var scrollIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            visible = en.isIntersecting;
            if (visible) play();
            else stop();
          });
        }, { threshold: 0.12 });
        scrollIo.observe(frame);
      } else {
        play();
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
        else if (visible) play();
      });
    }

    var loadLiveFrame = function (frame) {
      if (!frame || frame.getAttribute('src')) return;
      var target = frame.getAttribute('data-src');
      var expectedPath = new URL(target, window.location.href).pathname;
      frame.addEventListener('load', function () {
        var loadedPath = '';
        try { loadedPath = frame.contentWindow.location.pathname; } catch (e) { loadedPath = expectedPath; }
        if (loadedPath !== expectedPath) return;
        frame.classList.add('is-loaded');
        if (frame.parentElement) frame.parentElement.classList.add('is-live-loaded');
        initLiveFrameScroll(frame, liveFrames.indexOf(frame));
      });
      frame.src = target;
      frame.removeAttribute('data-src');
    };
    if ('IntersectionObserver' in window) {
      var liveIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          loadLiveFrame(en.target);
          liveIo.unobserve(en.target);
        });
      }, { rootMargin: '700px 0px', threshold: 0.01 });
      liveFrames.forEach(function (frame) { liveIo.observe(frame); });
    } else {
      liveFrames.forEach(loadLiveFrame);
    }

    var carousel = grid.closest('.models-carousel');
    if (carousel) {
      var prevBtn = carousel.querySelector('.models-prev');
      var nextBtn = carousel.querySelector('.models-next');
      var CAROUSEL_SPEED = 46;
      var autoplayRaf = 0;
      var lastAutoplayFrame = 0;
      var carouselPaused = false;
      var carouselVisible = true;
      var carouselReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var carouselX = 0;
      var manualMoving = false;
      var manualTimer = 0;
      var resizeTimer = 0;

      var scrollStep = function () {
        var card = modelOriginalCards[0] || grid.querySelector('.model-card');
        if (!card) return Math.max(320, grid.clientWidth * 0.9);
        var styles = window.getComputedStyle(grid);
        var gap = parseFloat(styles.columnGap || styles.gap) || 20;
        return card.getBoundingClientRect().width + gap;
      };

      var sequenceWidth = function () {
        if (!modelOriginalCards.length || !modelLoopClones.length) return 0;
        return Math.max(0, modelLoopClones[0].offsetLeft - modelOriginalCards[0].offsetLeft);
      };
      var normalizeLoop = function () {
        var span = sequenceWidth();
        if (span <= 0) return;
        carouselX = grid.scrollLeft;
        while (carouselX >= span) {
          carouselX -= span;
        }
        while (carouselX < 0) {
          carouselX += span;
        }
        if (Math.abs(grid.scrollLeft - carouselX) > 0.5) {
          grid.scrollLeft = carouselX;
        }
      };
      var canAutoplay = function () {
        return !carouselReduced && carouselVisible && !carouselPaused && !document.hidden;
      };
      var stopAutoplay = function () {
        if (!autoplayRaf) return;
        cancelAnimationFrame(autoplayRaf);
        autoplayRaf = 0;
        lastAutoplayFrame = 0;
      };
      var autoplayTick = function (now) {
        autoplayRaf = 0;
        if (!canAutoplay()) {
          lastAutoplayFrame = 0;
          return;
        }
        if (!lastAutoplayFrame) lastAutoplayFrame = now;
        var delta = Math.min(80, now - lastAutoplayFrame);
        lastAutoplayFrame = now;
        var span = sequenceWidth();
        carouselX += (CAROUSEL_SPEED * delta) / 1000;
        if (span > 0) {
          while (carouselX >= span) carouselX -= span;
          while (carouselX < 0) carouselX += span;
        }
        grid.scrollLeft = carouselX;
        autoplayRaf = requestAnimationFrame(autoplayTick);
      };
      var startAutoplay = function () {
        if (autoplayRaf || !canAutoplay()) return;
        lastAutoplayFrame = 0;
        autoplayRaf = requestAnimationFrame(autoplayTick);
      };
      var pauseForManualMove = function () {
        manualMoving = true;
        carouselPaused = true;
        stopAutoplay();
        clearTimeout(manualTimer);
        manualTimer = window.setTimeout(function () {
          normalizeLoop();
          manualMoving = false;
          carouselPaused = false;
          startAutoplay();
        }, 950);
      };
      var goCarousel = function (dir) {
        pauseForManualMove();
        normalizeLoop();
        var span = sequenceWidth();
        if (dir < 0 && span > 0 && grid.scrollLeft < scrollStep() * 1.2) {
          carouselX = grid.scrollLeft + span;
          grid.scrollLeft = carouselX;
        }
        grid.scrollBy({ left: dir * scrollStep(), behavior: 'smooth' });
        window.setTimeout(function () {
          carouselX = grid.scrollLeft;
          normalizeLoop();
        }, 820);
      };
      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          goCarousel(-1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          goCarousel(1);
        });
      }
      grid.addEventListener('scroll', function () {
        if (!autoplayRaf && !manualMoving) normalizeLoop();
      }, { passive: true });
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
          carouselX = 0;
          grid.scrollLeft = carouselX;
          normalizeLoop();
        }, 180);
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stopAutoplay();
        else startAutoplay();
      });
      requestAnimationFrame(function () {
        carouselX = 0;
        grid.scrollLeft = carouselX;
        carousel.classList.add('is-ready');
        startAutoplay();
      });
    }
  }

  /* datas reais */
  function fmtLong(d) {
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  var D0 = new Date();
  function dayDate(n) { return new Date(D0.getTime() + n * 864e5); }
  function fill(cls, txt) {
    document.querySelectorAll('.' + cls).forEach(function (el) { el.textContent = txt; });
  }
  fill('js-d0', fmtLong(D0));
  fill('js-d7', fmtLong(dayDate(7)));
  fill('js-d14', fmtLong(dayDate(14)));
  fill('js-d0-day', String(D0.getDate()).padStart(2, '0'));
  fill('js-d7-day', String(dayDate(7).getDate()).padStart(2, '0'));
  fill('js-d14-day', String(dayDate(14).getDate()).padStart(2, '0'));

  /* contador de vagas (?vagas=N) */
  var vagas = 47;
  var qs = new URLSearchParams(window.location.search).get('vagas');
  if (qs && !isNaN(qs)) vagas = Math.max(0, Math.min(50, parseInt(qs, 10)));
  fill('js-vagas', String(vagas));
  document.querySelectorAll('.js-lot-fill').forEach(function (el) {
    el.style.width = ((50 - vagas) / 50 * 100) + '%';
  });

  /* antes/depois */
  var range = document.getElementById('ba-range');
  var baCompare = document.getElementById('ba');
  var before = document.getElementById('ba-before');
  var handle = document.getElementById('ba-handle');
  if (range && before && handle) {
    var setBa = function (v) {
      var pct = v + '%';
      if (baCompare) baCompare.style.setProperty('--ba-split', pct);
      handle.style.left = pct;
    };
    range.addEventListener('input', function () { setBa(range.value); });
    setBa(50);
  }

  /* prova ao vivo */
  window.addEventListener('load', function () {
    setTimeout(function () {
      try {
        var nav = performance.getEntriesByType('navigation')[0];
        if (nav && nav.loadEventEnd > 0) {
          fill('js-load', (nav.loadEventEnd / 1000).toFixed(1).replace('.', ',') + 's');
        }
        var bytes = performance.getEntriesByType('resource').reduce(function (sum, r) {
          return sum + (r.transferSize || 0);
        }, 0) + (nav ? (nav.transferSize || 0) : 0);
        if (bytes > 0) fill('js-weight', Math.max(1, Math.round(bytes / 1024)) + ' KB');
      } catch (e) { /* medidores são cosméticos */ }
    }, 0);
  });

  /* tracking de conversão — Lead (Pixel + CAPI, dedup por event_id) só em clique de WhatsApp */
  function readCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : undefined;
  }
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-cta]');
    if (!el) return;
    var pos = el.getAttribute('data-cta') || 'cta';
    var variant = WM_VARIANT || undefined;
    if (typeof gtag === 'function') gtag('event', 'click_cta', { id: 'webmaster_' + pos, niche: current, wm_variant: variant });
    if (!el.classList.contains('js-wa')) return;

    var eventId = 'wm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', { content_name: 'webmaster_' + pos, wm_variant: variant }, { eventID: eventId });
    }
    try {
      var payload = JSON.stringify({
        event_name: 'Lead',
        event_id: eventId,
        event_source_url: location.href,
        variant: variant,
        fbp: readCookie('_fbp'),
        fbc: readCookie('_fbc'),
        data: { content_name: 'webmaster_' + pos }
      });
      var sent = false;
      if (navigator.sendBeacon) {
        try { sent = navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' })); } catch (e2) {}
      }
      if (!sent && typeof fetch === 'function') {
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(function () {});
      }
    } catch (e) { /* beacon é best-effort — o clique nunca pode quebrar */ }
  });

  setNiche('food');

  var heroEl = document.getElementById('hero');
  if (heroEl && !heroCarouselReduced) {
    if ('IntersectionObserver' in window) {
      var heroCarouselObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          heroCarouselVisible = entry.isIntersecting;
          if (heroCarouselVisible) startHeroCarousel();
          else stopHeroCarousel();
        });
      }, { threshold: 0.3 });
      heroCarouselObserver.observe(heroEl);
    } else {
      startHeroCarousel();
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopHeroCarousel();
      else startHeroCarousel();
    });
  }

  /* ---------- dois cortes: traffic (leve, padrão) × flagship (pirotécnico) ---------- */
  var params = new URLSearchParams(window.location.search);
  /* corte padrão = traffic (leve, mobile-safe, roda o tráfego pago).
     O corte flagship (scroll-video do Sobrevoo) é acessível por ?cut=flagship. */
  var CUT = params.get('cut') === 'flagship' ? 'flagship' : 'traffic';
  document.body.setAttribute('data-cut', CUT);

  /* ================= CAMADA 2 — CINEMATOGRAFIA ================= */

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var cinematic = CUT === 'flagship';

  /* reveals básicos: IO puro, funciona com ou sem GSAP */
  if (!reduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-anim');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  }

  if (reduced || !hasGsap) return; /* página estática completa a partir daqui */

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  var ST = window.ScrollTrigger;

  /* ---------- Lenis: scroll com inércia ---------- */
  var lenis = null;
  if (cinematic && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    /* âncoras internas passam pelo Lenis */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) { ev.preventDefault(); lenis.scrollTo(target, { offset: -64 }); }
      });
    });
  }

  /* ---------- O PORTFÓLIO: cena HTML leve, sem image sequence pesado ---------- */
  (function sobrevoo() {
    var sec = document.querySelector('.wm-sobrevoo');
    if (!sec) return;
    sec.classList.add('is-live');

    if (window.matchMedia('(pointer: fine)').matches) {
      sec.addEventListener('pointermove', function (ev) {
        var r = sec.getBoundingClientRect();
        var x = ((ev.clientX - r.left) / Math.max(1, r.width)) - 0.5;
        var y = ((ev.clientY - r.top) / Math.max(1, r.height)) - 0.5;
        sec.style.setProperty('--pf-x', x.toFixed(3));
        sec.style.setProperty('--pf-y', y.toFixed(3));
      });
      sec.addEventListener('pointerleave', function () {
        sec.style.setProperty('--pf-x', '0');
        sec.style.setProperty('--pf-y', '0');
      });
    }
  })();

  /* ---------- util: quebrar texto em palavras preservando <b>/<em> ---------- */
  function splitWords(el) {
    var frag = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function walk(node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); }
          else {
            var s = document.createElement('span');
            s.className = 'w';
            s.textContent = part;
            frag.appendChild(s);
          }
        });
      } else if (node.nodeType === 1) {
        var innerFrag = document.createDocumentFragment();
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          var sub = document.createElement('div');
          sub.appendChild(child.cloneNode(true));
          splitWords(sub);
          while (sub.firstChild) innerFrag.appendChild(sub.firstChild);
        });
        node.innerHTML = '';
        node.appendChild(innerFrag);
        frag.appendChild(node.cloneNode(true));
      }
    });
    el.innerHTML = '';
    el.appendChild(frag);
  }

  /* ---------- HERO: entrada orquestrada + preço que despenca ---------- */
  var headline = document.querySelector('.wm-headline');
  if (headline) splitWords(headline);

  var priceEl = document.querySelector('.wm-price-num');
  var wasEl = document.querySelector('.wm-price-was');

  var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro
    .from('.wm-hero .sec-eyebrow', { y: 16, opacity: 0, duration: 0.5 }, 0.05)
    .from('.wm-hero .wm-headline .w', { y: 34, opacity: 0, duration: 0.7, stagger: 0.045 }, 0.15)
    .from('.wm-hero .wm-price-pair', { y: 24, opacity: 0, duration: 0.6 }, 0.55)
    .from('.wm-hero .wm-claim, .wm-hero .wm-picker, .wm-hero .wm-ctas, .wm-hero .wm-fineprint, .wm-hero-rail', {
      y: 18, opacity: 0, duration: 0.55, stagger: 0.08
    }, 0.7)
    .from('.wm-phone', { y: 46, opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.5)
    .from('.wm-phone-tag', { y: 12, opacity: 0, duration: 0.5 }, 1.05);

  /* o preço cai de 7.000 pra 2.980 na frente do prospect */
  if (priceEl) {
    var price = { v: 7000 };
    intro.to(price, {
      v: 2980,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: function () {
        priceEl.textContent = Math.round(price.v).toLocaleString('pt-BR');
      },
      onComplete: function () { if (wasEl) wasEl.classList.add('struck'); }
    }, 0.75);
  }

  /* parallax sutil do telefone no scroll */
  if (cinematic) {
    gsap.to('.wm-phone', {
      y: -40,
      ease: 'none',
      scrollTrigger: { trigger: '.wm-hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- ESPELHO: o texto acende conforme o scroll ---------- */
  var scene = document.querySelector('.wm-scene');
  if (cinematic && scene) {
    scene.classList.remove('rv');
    splitWords(scene);
    gsap.fromTo('.wm-scene .w',
      { opacity: 0.14 },
      {
        opacity: 1,
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: { trigger: scene, start: 'top 78%', end: 'bottom 42%', scrub: true }
      });
  }

  /* ---------- A CONSTRUÇÃO: 14 dias em um scroll (desktop) ---------- */
  var buildPin = document.querySelector('.build-pin');
  if (buildPin && window.innerWidth >= 900) {
    document.body.classList.add('has-build');

    var dayNum = document.getElementById('build-day-num');
    var dateEl = document.getElementById('build-date');
    var state = { day: 0 };

    var steps = gsap.utils.toArray('.build-step');
    var files = gsap.utils.toArray('.bfile');
    var wires = gsap.utils.toArray('.build-wire > i');
    var logs = gsap.utils.toArray('.build-log span');
    var buildWire = document.querySelector('.build-wire');

    gsap.set(steps, { opacity: 0, y: 22 });
    gsap.set(steps[0], { opacity: 1, y: 0 });
    gsap.set('.build-wire', { autoAlpha: 1 });
    gsap.set('.build-screen', { autoAlpha: 0 });
    gsap.set('.build-done', { opacity: 0, y: 14 });
    gsap.set(logs, { opacity: 0 });

    function updateBuildStatus(progress) {
      if (!buildWire) return;
      var status = 'aguardando seus dados_';
      if (progress >= 0.16) status = 'recebendo arquivos_';
      if (progress >= 0.48) status = 'montando estrutura_';
      if (progress >= 0.66) status = 'aplicando identidade_';
      if (progress >= 0.82) status = 'testando responsivo_';
      if (progress >= 0.94) status = 'preparando deploy_';
      buildWire.setAttribute('data-status', status);
    }

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: buildPin,
        start: 'top top+=64',
        end: '+=320%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1
      },
      defaults: { ease: 'none' }
    });
    tl.eventCallback('onUpdate', function () { updateBuildStatus(tl.progress()); });

    function stepSwap(from, to, at) {
      tl.to(steps[from], { opacity: 0, y: -22, duration: 0.06 }, at);
      tl.to(steps[to], { opacity: 1, y: 0, duration: 0.06 }, at + 0.02);
    }

    /* relógio de dias: 0 → 14, com data real acompanhando */
    tl.to(state, {
      day: 14,
      duration: 1,
      onUpdate: function () {
        var d = Math.round(state.day);
        if (dayNum) dayNum.textContent = String(d).padStart(2, '0');
        if (dateEl) dateEl.textContent = fmtLong(dayDate(d));
      }
    }, 0);
    tl.to('#build-fill', { width: '100%', duration: 1 }, 0);

    /* fase 1 → 2: os arquivos do cliente voam pro telefone
       (todos "moram" no centro do stage; nascem espalhados e convergem) */
    stepSwap(0, 1, 0.10);
    var scatter = [
      { x: -250, y: -170 }, { x: -290, y: 30 }, { x: 235, y: -150 },
      { x: 255, y: 120 }, { x: -200, y: 200 }
    ];
    files.forEach(function (f, i) {
      var s = scatter[i % scatter.length];
      tl.fromTo(f,
        { x: s.x, y: s.y, opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.04 },
        0.12 + i * 0.045);
      tl.to(f, { x: 0, y: 0, opacity: 0, scale: 0.7, duration: 0.1, ease: 'power1.in' }, 0.2 + i * 0.045);
    });

    /* fase 2 → 3: a IA constrói — log + wireframe + pintura */
    stepSwap(1, 2, 0.52);
    [0.54, 0.62, 0.70, 0.78, 0.86, 0.975].forEach(function (at, i) {
      if (logs[i]) tl.to(logs[i], { opacity: 1, duration: 0.025 }, at);
    });
    wires.forEach(function (w, i) {
      tl.from(w, { scaleX: 0, transformOrigin: 'left center', duration: 0.05 }, 0.56 + i * 0.04);
    });

    /* fase 3 → 4: no ar */
    stepSwap(2, 3, 0.965);
    tl.to('.build-wire', { autoAlpha: 0, duration: 0.045 }, 0.956);
    tl.to('.build-screen', { autoAlpha: 1, duration: 0.05 }, 0.965);
    tl.to('.build-phone', { scale: 1.012, duration: 0.06, ease: 'power1.out' }, 0.972);
    tl.to('.build-done', { opacity: 1, y: 0, duration: 0.06 }, 0.978);
  }

  /* ---------- MODELOS: galeria horizontal pinada (desktop) ---------- */
  var modelsSec = document.querySelector('.wm-models');
  if (cinematic && modelsSec && grid && window.innerWidth >= 1080) {
    document.body.classList.add('has-track');
    var getX = function () { return -(grid.scrollWidth - modelsSec.querySelector('.wrap').offsetWidth); };
    gsap.to(grid, {
      x: getX,
      ease: 'none',
      scrollTrigger: {
        trigger: modelsSec,
        start: 'top top',
        end: function () { return '+=' + (-getX() + window.innerHeight * 0.4); },
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true
      }
    });
  }

  /* ---------- contagens que sobem quando entram em cena ---------- */
  gsap.utils.toArray('[data-count-to]').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-count-to'));
    var prefix = el.getAttribute('data-count-prefix') || '';
    var suffix = el.getAttribute('data-count-suffix') || '';
    var obj = { v: 0 };
    gsap.to(obj, {
      v: to,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: function () {
        el.textContent = prefix + Math.round(obj.v).toLocaleString('pt-BR') + suffix;
      }
    });
  });

  ST.refresh();
})();

/* ============================================
   VSL — Cloudflare Stream: eventos de vídeo + reveal da variante B
   Ativa sozinho quando existe <iframe id="wm-vsl-iframe"> na página.
   Fora do IIFE principal de propósito: roda mesmo sem GSAP /
   com prefers-reduced-motion (o IIFE acima tem return precoce).
   ============================================ */
(function () {
  'use strict';

  var iframe = document.getElementById('wm-vsl-iframe');
  if (!iframe) return;

  var html = document.documentElement;
  var variant = window.WM_VARIANT || null;
  var REVEAL_AT = 143; /* 2:23 — momento em que a oferta entra na VSL */

  function track(name, params) {
    var p = params || {};
    if (variant) p.wm_variant = variant;
    if (typeof gtag === 'function') gtag('event', name, p);
    if (typeof fbq === 'function') fbq('trackCustom', name, p);
  }

  var revealed = html.classList.contains('wm-revealed');
  function reveal() {
    if (variant !== 'b' || revealed) return;
    revealed = true;
    html.classList.add('wm-revealed');
    try { localStorage.setItem('wm_vsl_revealed', '1'); } catch (e) {}
    track('vsl_reveal', {});
    if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
    /* a página inteira voltou acima e abaixo do player —
       scroll suave até a oferta pra ancorar o visitante nela */
    var offer = document.getElementById('vsl-offer');
    if (offer) {
      setTimeout(function () {
        try { offer.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
      }, 150);
    }
  }

  var sdk = document.createElement('script');
  sdk.src = 'https://embed.cloudflarestream.com/embed/sdk.latest.js';
  sdk.async = true;
  sdk.onload = function () {
    if (typeof window.Stream !== 'function') return;
    var player = window.Stream(iframe);
    var played = false;
    var fired = {};

    player.addEventListener('play', function () {
      if (played) return;
      played = true;
      track('video_play', {});
    });

    player.addEventListener('timeupdate', function () {
      var t = player.currentTime || 0;
      if (t >= REVEAL_AT) reveal();
      var d = player.duration || 0;
      if (!d) return;
      var pct = (t / d) * 100;
      [25, 50, 75, 95].forEach(function (m) {
        if (pct >= m && !fired[m]) {
          fired[m] = true;
          track('video_progress', { percent: m });
        }
      });
    });

    player.addEventListener('ended', function () {
      track('video_complete', {});
      reveal(); /* rede de segurança: vídeo acabou = oferta vista */
    });
  };
  document.head.appendChild(sdk);
})();
