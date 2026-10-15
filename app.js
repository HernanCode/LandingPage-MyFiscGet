/* =====================================================================
   MyFiscoGest — Landing
   JS mínimo: año del footer, reveal on scroll y formulario de contacto.
   ---------------------------------------------------------------------
   ★ EDITAR: aquí abajo está el email de contacto del formulario.
     Cámbialo por el tuyo. (También aparece en <meta name="contact-email">).
   ===================================================================== */
const CONFIG = {
  contactEmail: 'hola@myfiscogest.com'
};

(function () {
  'use strict';

  /* --- Año dinámico en el footer --- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* --- Header fijo: fondo translúcido al hacer scroll --- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var navTick = false;
    var updateNav = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 16);
      navTick = false;
    };
    window.addEventListener('scroll', function () {
      if (!navTick) { navTick = true; requestAnimationFrame(updateNav); }
    }, { passive: true });
    updateNav();
  }

  /* --- Reveal on scroll (suave) --- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* --- Revelado por palabras del titular --- */
  var wordHeads = document.querySelectorAll('[data-reveal-words]');
  if (!reduce && 'IntersectionObserver' in window) {
    var wo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          wo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    wordHeads.forEach(function (el) { wo.observe(el); });
  } else {
    wordHeads.forEach(function (el) { el.classList.add('in'); });
  }

  /* --- Formulario de contacto ---
     No hay backend: compone un mailto: con los datos y abre el
     cliente de correo del visitante.
     ★ PARA CONECTAR UN ENDPOINT REAL (p.ej. Formspree): sustituye el
       bloque "window.location.href = mailto;" por un fetch(POST) al
       endpoint. El resto (validación, chips, estado) ya sirve tal cual. */
  var form = document.getElementById('contact-form');
  if (form) {
    var choices = Array.prototype.slice.call(form.querySelectorAll('.choice'));
    var topicHidden = form.querySelector('input[name="topic"]');
    var chipsWrap = form.querySelector('.chips-input');

    function setTopic(value) {
      if (topicHidden) topicHidden.value = value;
      choices.forEach(function (c) {
        var on = c.getAttribute('data-value') === value;
        c.setAttribute('aria-checked', on ? 'true' : 'false');
        c.tabIndex = on ? 0 : -1;
      });
    }

    choices.forEach(function (c) {
      c.addEventListener('click', function () { setTopic(c.getAttribute('data-value')); });
    });

    if (chipsWrap) {
      chipsWrap.addEventListener('keydown', function (e) {
        var k = choices.indexOf(document.activeElement);
        if (k === -1) return;
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setTopic(document.activeElement.getAttribute('data-value'));
          return;
        }
        var nk = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nk = (k + 1) % choices.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nk = (k - 1 + choices.length) % choices.length;
        if (nk !== null) {
          e.preventDefault();
          choices[nk].focus();
          setTopic(choices[nk].getAttribute('data-value'));
        }
      });
    }

    function showError(name, msg) {
      var field = form.querySelector('[name="' + name + '"]');
      var wrap = field ? field.closest('.cfield') : null;
      var err = form.querySelector('[data-error-for="' + name + '"]');
      if (wrap) wrap.classList.toggle('has-error', !!msg);
      if (err) err.textContent = msg || '';
    }

    function validate() {
      var ok = true;
      var name = form.querySelector('#name').value.trim();
      var email = form.querySelector('#email').value.trim();
      var message = form.querySelector('#message').value.trim();

      if (!name) { showError('name', 'Dime tu nombre.'); ok = false; } else { showError('name', ''); }
      if (!email) { showError('email', 'Necesito tu email.'); ok = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('email', 'Revisa el formato del email.'); ok = false; }
      else { showError('email', ''); }
      if (!message) { showError('message', 'Escribe un mensaje.'); ok = false; } else { showError('message', ''); }
      return ok;
    }

    ['name', 'email', 'message'].forEach(function (id) {
      var el = form.querySelector('#' + id);
      if (el) el.addEventListener('input', function () { showError(id, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        var firstBad = form.querySelector('.cfield.has-error input, .cfield.has-error textarea');
        if (firstBad) firstBad.focus();
        return;
      }

      var data = new FormData(form);
      var name = String(data.get('name') || '').trim();
      var email = String(data.get('email') || '').trim();
      var topic = String(data.get('topic') || '').trim();
      var message = String(data.get('message') || '').trim();

      var subject = '[MyFiscoGest] ' + (topic || 'Consulta') + (name ? ' — ' + name : '');
      var body =
        'Nombre: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Motivo: ' + topic + '\n\n' +
        message + '\n';

      var mailto = 'mailto:' + CONFIG.contactEmail +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      var status = document.getElementById('form-status');
      var btn = form.querySelector('.cform__submit');
      if (btn) btn.classList.add('is-loading');

      window.location.href = mailto;

      if (status) {
        status.textContent = 'Abriendo tu cliente de correo… Si no se abre, escríbeme a ' + CONFIG.contactEmail + '.';
      }
      setTimeout(function () { if (btn) btn.classList.remove('is-loading'); }, 1500);
    });
  }

  /* --- Ilustración del CTA: se dibuja el trazo al entrar --- */
  var ctaArt = document.querySelector('.cta-art');
  if (ctaArt) {
    var draws = Array.prototype.slice.call(ctaArt.querySelectorAll('.draw'));
    var canDraw = !reduce && draws.length && typeof draws[0].getTotalLength === 'function';
    function finishArt() { ctaArt.classList.add('in'); draws.forEach(function (p) { p.style.strokeDashoffset = 0; }); }
    if (canDraw) {
      draws.forEach(function (p, i) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        p.style.transitionDelay = (i * 0.07) + 's';
      });
      if ('IntersectionObserver' in window) {
        var aio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) { finishArt(); aio.unobserve(ctaArt); } });
        }, { threshold: 0.3 });
        aio.observe(ctaArt);
      } else {
        finishArt();
      }
    } else {
      ctaArt.classList.add('in');
    }
  }

  /* --- Panel de contacto (dialog) ---
     Si el navegador no soporta <dialog>, el formulario se muestra en
     línea dentro de la sección CTA. */
  var dialog = document.getElementById('contact-dialog');
  var openers = document.querySelectorAll('[data-open-contact]');
  var lastOpener = null;
  var supportsDialog = !!(dialog && typeof dialog.showModal === 'function');

  function openContact(e) {
    if (e && e.currentTarget) lastOpener = e.currentTarget;
    if (!supportsDialog) {
      if (dialog) dialog.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    if (!dialog.open) dialog.showModal();
    var first = dialog.querySelector('#name');
    if (first) setTimeout(function () { first.focus(); }, 40);
  }

  openers.forEach(function (b) { b.addEventListener('click', openContact); });

  if (dialog) {
    var closeBtn = dialog.querySelector('#cmodal-close');
    if (closeBtn) closeBtn.addEventListener('click', function () { dialog.close(); });

    // Cerrar al hacer click fuera del panel
    dialog.addEventListener('click', function (e) {
      var r = dialog.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) dialog.close();
    });

    // Al cerrar (Escape, ×, click fuera) devolvemos el foco al botón
    dialog.addEventListener('close', function () {
      if (lastOpener && lastOpener.focus) lastOpener.focus();
    });

    if (!supportsDialog) {
      dialog.setAttribute('open', '');
      dialog.classList.add('cmodal--inline');
      if (closeBtn) closeBtn.style.display = 'none';
      var ctaSection = document.querySelector('.cta');
      if (ctaSection) ctaSection.appendChild(dialog);
    }
  }

  /* =====================================================================
     Funcionalidades — pestañas de la ventana de app
     ===================================================================== */
  var features = document.getElementById('funciones');
  if (features) {
    var tabs = Array.prototype.slice.call(features.querySelectorAll('.tab'));
    var views = Array.prototype.slice.call(features.querySelectorAll('.app-view'));
    var winTitle = features.querySelector('[data-window-title]');
    var currentTab = 0;
    var autoTimer = null;
    var userInteracted = false;
    var sectionVisible = false;

    function selectTab(i) {
      currentTab = i;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      views.forEach(function (v, k) { v.classList.toggle('is-active', k === i); });
      if (winTitle && tabs[i]) winTitle.textContent = tabs[i].getAttribute('data-title') || '';
    }

    function startAuto() {
      if (reduce || userInteracted || autoTimer) return;
      autoTimer = setInterval(function () {
        selectTab((currentTab + 1) % tabs.length);
      }, 6000);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { userInteracted = true; stopAuto(); selectTab(i); });
    });

    var tablist = features.querySelector('.tabs');
    if (tablist) {
      tablist.addEventListener('keydown', function (e) {
        var k = tabs.indexOf(document.activeElement);
        if (k === -1) return;
        var nk = null;
        if (e.key === 'ArrowRight') nk = (k + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') nk = (k - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') nk = 0;
        else if (e.key === 'End') nk = tabs.length - 1;
        if (nk !== null) { e.preventDefault(); userInteracted = true; stopAuto(); selectTab(nk); tabs[nk].focus(); }
      });
    }

    var win = features.querySelector('.app-window');
    if (win) {
      win.addEventListener('mouseenter', stopAuto);
      win.addEventListener('mouseleave', function () { if (sectionVisible && !userInteracted) startAuto(); });
    }

    if ('IntersectionObserver' in window) {
      var fio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          sectionVisible = en.isIntersecting;
          if (sectionVisible) startAuto(); else stopAuto();
        });
      }, { threshold: 0.35 });
      fio.observe(features);
    }

    // Entrada de la ventana
    var stage = features.querySelector('.features-stage');
    if (stage) {
      if (!reduce && 'IntersectionObserver' in window) {
        var sio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) { stage.classList.add('in'); sio.unobserve(stage); } });
        }, { threshold: 0.15 });
        sio.observe(stage);
      } else {
        stage.classList.add('in');
      }
    }
  }

  /* =====================================================================
     Cómo empezar — scrollytelling
     ===================================================================== */
  var setup = document.getElementById('empezar');
  if (setup) {
    var mqStatic = window.matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce)');
    var stepItems = setup.querySelectorAll('.setup-item');
    var scenes = setup.querySelectorAll('.scene');
    var progressFill = setup.querySelector('.setup-progress__fill');
    var activeStep = -1;
    var played = {};
    var timers = [];

    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function showFinalTerminal(term) {
      if (!term) return;
      term.querySelectorAll('.t-cmd .t-text').forEach(function (t) { t.textContent = t.getAttribute('data-full'); });
      term.querySelectorAll('.t-line').forEach(function (l) { l.classList.add('show'); });
    }
    function showFinalScene(scene) {
      if (!scene) return;
      scene.querySelectorAll('.terminal').forEach(showFinalTerminal);
      scene.querySelectorAll('.diagram__node, .diagram__link').forEach(function (n) { n.classList.add('on'); });
    }

    function typeTerminal(term, done) {
      if (!term) { if (done) done(); return; }
      var cmds = Array.prototype.slice.call(term.querySelectorAll('.t-cmd'));
      term.querySelectorAll('.t-line').forEach(function (l) { l.classList.remove('show'); });
      cmds.forEach(function (c) { c.querySelector('.t-text').textContent = ''; });

      var i = 0;
      function nextCmd() {
        if (i >= cmds.length) { if (done) done(); return; }
        var cmd = cmds[i];
        var textEl = cmd.querySelector('.t-text');
        var full = textEl.getAttribute('data-full') || '';
        cmd.classList.add('show');
        var j = 0;
        (function tick() {
          textEl.textContent = full.slice(0, j);
          j++;
          if (j <= full.length) {
            later(tick, 26);
          } else {
            var node = cmd.nextElementSibling;
            while (node && node.classList.contains('t-out')) { node.classList.add('show'); node = node.nextElementSibling; }
            i++;
            later(nextCmd, 320);
          }
        })();
      }
      nextCmd();
    }

    function lightDiagram(scene) {
      var ids = ['0', '1', '2', '3', '4'];
      ids.forEach(function (id, k) {
        later(function () {
          var node = scene.querySelector('.diagram__node[data-node="' + id + '"]');
          var link = scene.querySelector('.diagram__link[data-node="' + id + '"]');
          if (node) node.classList.add('on');
          if (link) link.classList.add('on');
        }, k * 250);
      });
    }

    function setActive(step, prev) {
      stepItems.forEach(function (it, i) { it.classList.toggle('is-active', i === step); });
      scenes.forEach(function (s, i) { s.classList.toggle('is-active', i === step); });
      if (progressFill) progressFill.style.height = ((step + 1) / 3 * 100) + '%';

      clearTimers();
      var scene = scenes[step];
      if (!scene) return;

      // Al retroceder o revisitar un paso ya reproducido, mostramos el estado final.
      if ((prev !== -1 && step < prev) || played[step]) {
        showFinalScene(scene);
        return;
      }
      played[step] = true;

      if (scene.classList.contains('scene--terminal')) {
        typeTerminal(scene.querySelector('.terminal'));
      } else if (scene.classList.contains('scene--docker')) {
        typeTerminal(scene.querySelector('.terminal'), function () { lightDiagram(scene); });
      }
      // scene--app se anima por CSS al recibir .is-active
    }

    function update() {
      if (mqStatic.matches) return;
      var rect = setup.getBoundingClientRect();
      var vh = window.innerHeight;
      if (rect.bottom <= 0 || rect.top >= vh) return; // fuera de vista
      var height = setup.offsetHeight;
      var top = window.scrollY + rect.top;
      var progress = (window.scrollY - top) / (height - vh);
      progress = Math.max(0, Math.min(1, progress));
      var step = Math.min(2, Math.floor(progress * 3));
      if (step !== activeStep) {
        var prev = activeStep;
        activeStep = step;
        setActive(step, prev);
      }
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      if (mqStatic.matches) { applyStatic(); }
      else { activeStep = -1; update(); }
    });

    function applyStatic() {
      clearTimers();
      scenes.forEach(function (s) { s.classList.add('is-active'); showFinalScene(s); });
      stepItems.forEach(function (it) { it.classList.add('is-active'); });
    }

    // Click en un paso → scroll suave a su tramo
    stepItems.forEach(function (it) {
      var btn = it.querySelector('.setup-item__btn');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var step = parseInt(it.getAttribute('data-step'), 10) || 0;
        var rect = setup.getBoundingClientRect();
        var top = window.scrollY + rect.top;
        var height = setup.offsetHeight;
        var vh = window.innerHeight;
        var target = top + (step / 3) * (height - vh) + 4;
        window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
      });
    });

    // Botones "Copiar" (texto real, copiable)
    setup.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var term = btn.closest('.terminal');
        var text = Array.prototype.map.call(term.querySelectorAll('.t-cmd .t-text'), function (t) {
          return t.getAttribute('data-full');
        }).join('\n');
        var original = btn.textContent;
        var done = function () {
          btn.textContent = 'Copiado ✓';
          later(function () { btn.textContent = original; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, done);
        } else {
          done();
        }
      });
    });

    if (mqStatic.matches) { applyStatic(); } else { update(); }
  }
})();
