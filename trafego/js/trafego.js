/* ============================================
   trafego.js — LP Gestão de Tráfego
   Camadas: (1) produto — chips de nicho + painel
            (2) radar canvas — o raio do negócio
            (3) cinematografia — reveals + counters
   Progressive enhancement: sem JS, a página funciona estática.
   ============================================ */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header: esconde a marca no topo, onde o hero já exibe o wordmark. */
  var headerBrand = document.querySelector('.site-header .brand');
  if (headerBrand) {
    var brandTicking = false;

    function syncHeaderBrand() {
      headerBrand.classList.toggle('is-hidden', window.scrollY <= 24);
      brandTicking = false;
    }

    syncHeaderBrand();
    window.addEventListener('scroll', function () {
      if (brandTicking) return;
      brandTicking = true;
      requestAnimationFrame(syncHeaderBrand);
    }, { passive: true });
  }

  /* --------------------------------------------
     CAMADA 1 — Nichos (produto)
     -------------------------------------------- */

  var NICHES = {
    restaurante: {
      momento: 'Fome, agora, perto.',
      canal: 'Google Pesquisa + Meta no raio das unidades.',
      medida: 'Pedidos, ligações, rotas e reservas.',
      case: '<b>Almanara</b> — campanhas por localização, com cobertura em 100% das regiões com unidades.',
      blips: 16
    },
    estetica: {
      momento: 'Desejo, confiança e decisão local.',
      canal: 'Google (intenção) + Meta (descoberta e prova social).',
      medida: 'Agendamentos, avaliações e mensagens qualificadas.',
      case: '<b>Dra. Roseli Siqueira</b> — funil medido do anúncio à consulta.',
      blips: 10
    },
    varejo: {
      momento: 'Necessidade, desejo e conveniência.',
      canal: 'Google Pesquisa + Meta segmentado por região.',
      medida: 'Rotas, ligações, mensagens e visitas à loja.',
      case: '<b>Moldura Minuto</b> — varejo de bairro com campanha de raio.',
      blips: 12
    },
    academia: {
      momento: 'Segunda-feira, verão, recomeço.',
      canal: 'Meta (gera demanda) + Google (captura).',
      medida: 'Visitas agendadas e matrículas.',
      case: '<b>iZi Gym</b> — funil medido por etapa: anúncio → WhatsApp → visita → matrícula.',
      blips: 14
    },
    imobiliaria: {
      momento: 'Mudança de vida + oportunidade certa.',
      canal: 'Meta (descoberta) + Google (intenção por região).',
      medida: 'Leads qualificados, visitas agendadas e propostas.',
      case: '<b>Fit alto</b> — segmentação por região, faixa de preço e intenção; case específico sob consulta.',
      blips: 15
    }
  };

  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-niche]'));
  var panelFields = {
    momento: document.querySelector('[data-np="momento"]'),
    canal: document.querySelector('[data-np="canal"]'),
    medida: document.querySelector('[data-np="medida"]'),
    case: document.querySelector('[data-np="case"]')
  };
  var currentNiche = 'restaurante';

  function setNiche(key) {
    var data = NICHES[key];
    if (!data) return;
    currentNiche = key;

    chips.forEach(function (chip) {
      var active = chip.getAttribute('data-niche') === key;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    Object.keys(panelFields).forEach(function (field) {
      var el = panelFields[field];
      if (!el) return;
      el.innerHTML = data[field];
      el.classList.remove('is-swapping');
      // reflow para reiniciar a animação
      void el.offsetWidth;
      el.classList.add('is-swapping');
    });

    if (window.JumperRadar) {
      window.JumperRadar.setDensity(data.blips);
      window.JumperRadar.burst();
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      setNiche(chip.getAttribute('data-niche'));
    });
  });

  /* --------------------------------------------
     CAMADA 2 — Radar canvas ("o raio")
     Anéis 1/3/5 km · varredura · blips = clientes
     -------------------------------------------- */

  var radarCanvas = document.getElementById('radar');

  function initRadar(canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var size = 0;
    var blipTarget = NICHES[currentNiche].blips;
    var blips = [];
    var sweep = 0;
    var last = 0;
    var running = true;
    var raf = null;

    var ORANGE = '250, 71, 33';

    function resize() {
      var rect = canvas.getBoundingClientRect();
      size = Math.max(1, Math.min(rect.width, rect.height));
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnBlip() {
      var angle = Math.random() * Math.PI * 2;
      // distribuição com mais densidade perto do centro (como na vida real)
      var r = (0.18 + 0.82 * Math.sqrt(Math.random())) * 0.92;
      return { angle: angle, r: r, life: 0, ttl: 3.5 + Math.random() * 3 };
    }

    function syncBlips() {
      while (blips.length < blipTarget) blips.push(spawnBlip());
      if (blips.length > blipTarget) blips.length = blipTarget;
    }

    function draw(dt) {
      var c = size / 2;
      var R = c * 0.94;

      ctx.clearRect(0, 0, size, size);

      // anéis
      var rings = [1 / 3, 2 / 3, 1];
      ctx.lineWidth = 1;
      rings.forEach(function (f) {
        ctx.beginPath();
        ctx.arc(c, c, R * f, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,' + (f === 1 ? 0.18 : 0.10) + ')';
        ctx.stroke();
      });

      // labels de distância
      ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.textAlign = 'left';
      ctx.fillText('1 km', c + R / 3 + 6, c - 6);
      ctx.fillText('3 km', c + (2 * R) / 3 + 6, c - 6);
      ctx.fillText('5 km', c + R - 34, c - 6);

      // cruz central sutil
      ctx.beginPath();
      ctx.moveTo(c - R, c); ctx.lineTo(c + R, c);
      ctx.moveTo(c, c - R); ctx.lineTo(c, c + R);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.stroke();

      // varredura (sweep) — arco com gradiente cônico aproximado
      sweep += dt * 0.55; // rad/s
      var sweepSpan = Math.PI / 3.2;
      var steps = 26;
      for (var i = 0; i < steps; i++) {
        var a0 = sweep - (sweepSpan * i) / steps;
        var a1 = sweep - (sweepSpan * (i + 1)) / steps;
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.arc(c, c, R, a1, a0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(' + ORANGE + ',' + (0.10 * (1 - i / steps)).toFixed(3) + ')';
        ctx.fill();
      }
      // linha viva da varredura
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.lineTo(c + Math.cos(sweep) * R, c + Math.sin(sweep) * R);
      ctx.strokeStyle = 'rgba(' + ORANGE + ',0.55)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // blips — clientes em potencial pulsando
      for (var b = 0; b < blips.length; b++) {
        var blip = blips[b];
        blip.life += dt;
        if (blip.life > blip.ttl) {
          blips[b] = spawnBlip();
          continue;
        }
        var fadeIn = Math.min(1, blip.life / 0.6);
        var fadeOut = Math.min(1, (blip.ttl - blip.life) / 0.9);
        var alpha = Math.min(fadeIn, fadeOut);

        var x = c + Math.cos(blip.angle) * blip.r * R;
        var y = c + Math.sin(blip.angle) * blip.r * R;

        // pulso quando a varredura passa por cima
        var dAngle = Math.atan2(Math.sin(blip.angle - sweep), Math.cos(blip.angle - sweep));
        var near = Math.abs(dAngle) < 0.10;
        if (near) blip.hit = 1;
        blip.hit = Math.max(0, (blip.hit || 0) - dt * 1.4);

        var baseR = 2.2 + blip.hit * 2.4;
        ctx.beginPath();
        ctx.arc(x, y, baseR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + ORANGE + ',' + (0.55 * alpha + blip.hit * 0.45).toFixed(3) + ')';
        ctx.fill();

        if (blip.hit > 0.01) {
          ctx.beginPath();
          ctx.arc(x, y, baseR + 8 * (1 - blip.hit), 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(' + ORANGE + ',' + (blip.hit * 0.5).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // centro — o negócio
      var pulse = 1 + 0.12 * Math.sin(last * 0.004);
      ctx.beginPath();
      ctx.arc(c, c, 5 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(c, c, 12 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function frame(t) {
      if (!running) return;
      var dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      draw(dt);
      raf = requestAnimationFrame(frame);
    }

    resize();
    syncBlips();

    if (REDUCED) {
      // frame estático
      last = 1000;
      sweep = 0.8;
      draw(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', function () {
      resize();
      if (REDUCED) draw(0);
    });

    // pausa quando fora da viewport (economia de bateria)
    if ('IntersectionObserver' in window && !REDUCED) {
      new IntersectionObserver(function (entries) {
        var visible = entries[0].isIntersecting;
        if (visible && !running) {
          running = true;
          raf = requestAnimationFrame(frame);
        } else if (!visible && running) {
          running = false;
          if (raf) cancelAnimationFrame(raf);
        }
      }, { threshold: 0.05 }).observe(canvas);
    }

    return {
      setDensity: function (n) { blipTarget = n; syncBlips(); },
      burst: function () {
        // alguns blips novos "acendem" na troca de nicho
        for (var i = 0; i < Math.min(4, blips.length); i++) {
          blips[i] = spawnBlip();
          blips[i].hit = 1;
        }
      }
    };
  }

  if (radarCanvas) {
    try {
      window.JumperRadar = initRadar(radarCanvas);
    } catch (e) {
      // canvas indisponível — esconde o radar, painel continua funcionando
      radarCanvas.style.display = 'none';
    }
  }

  // estado inicial do painel
  setNiche('restaurante');

  /* --------------------------------------------
     CAMADA 3 — Cinematografia (reveals + counters)
     -------------------------------------------- */

  // reveals
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !REDUCED) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  // counters
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (REDUCED) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var start = null;
    var dur = 1600;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  // tracking de CTA (Pixel/GA quando publicar)
  document.querySelectorAll('[data-cta]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (typeof fbq === 'function') { fbq('track', 'Lead'); }
      if (typeof gtag === 'function') { gtag('event', 'click_cta', { id: 'trafego_cta' }); }
    });
  });

})();
