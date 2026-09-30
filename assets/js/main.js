/* ==========================================================================
   Toss Away Junk Removal — site scripts
   Vanilla JS, no dependencies. Progressive enhancement only:
   every form works without JavaScript.
   ========================================================================== */
(function () {
  'use strict';

  var LEAD_ENDPOINT = 'https://vision.leadrai.com/api/forms/7c1f8e2c4785535f315d31cdf34aaa7a';

  /* Flag the document so scroll-reveal styles only apply when JS is running.
     Without this, a script failure would leave content permanently hidden. */
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-reveal');
  }

  /* ---------------------------------------------------------------- Nav */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var drawer = document.getElementById('mobile-nav');
    if (!toggle || !drawer) return;

    function close() {
      drawer.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1000) close();
    });
  }

  /* ------------------------------------------------------------- Header */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------ Reveals */
  function initReveals() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(items, function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(el);
    });
  }

  /* --------------------------------------------------- Counting numbers */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        if (isNaN(target)) return;
        var start = null;
        var dur = 1100;
        function tick(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });

    Array.prototype.forEach.call(nums, function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------------- Forms */
  function showStatus(form, type, message) {
    var box = form.querySelector('.form-status');
    if (!box) return;
    box.classList.remove('form-status--ok', 'form-status--err');
    box.classList.add(type === 'ok' ? 'form-status--ok' : 'form-status--err');
    box.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (type === 'ok'
        ? '<path d="M20 6 9 17l-5-5"/>'
        : '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>') +
      '</svg><span>' + message + '</span>';
    box.classList.add('is-visible');
  }

  function initForms() {
    var forms = document.querySelectorAll('form[data-lead-form]');
    var submitted = new URLSearchParams(window.location.search).get('submitted') === '1';

    Array.prototype.forEach.call(forms, function (form) {
      /* Stamp the current page so the visitor returns here after posting. */
      var pageField = form.querySelector('input[name="_page"]');
      if (pageField) pageField.value = window.location.href;

      /* Plain (no-JS) submissions come back with ?submitted=1 */
      if (submitted) {
        showStatus(form, 'ok', 'Thanks, your message was sent. We’ll get back to you shortly — usually the same day.');
      }

      form.addEventListener('submit', function (e) {
        if (!window.fetch || !window.FormData) return; /* let the browser post normally */
        e.preventDefault();

        if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

        var btn = form.querySelector('[type="submit"]');
        var label = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        var data = {};
        new FormData(form).forEach(function (value, key) {
          if (key === '_gotcha') return;
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            data[key] = [].concat(data[key], value);
          } else {
            data[key] = value;
          }
        });
        data._page = window.location.href;

        fetch(LEAD_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        })
          .then(function (res) {
            return res.json().catch(function () { return { ok: res.ok }; });
          })
          .then(function (json) {
            if (!json || json.ok !== true) throw new Error('Submission rejected');
            showStatus(form, 'ok', 'Thanks, your message was sent. We’ll get back to you shortly — usually the same day.');
            form.reset();
            var pf = form.querySelector('input[name="_page"]');
            if (pf) pf.value = window.location.href;
            var box = form.querySelector('.form-status');
            if (box && typeof box.scrollIntoView === 'function') {
              box.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          })
          .catch(function () {
            showStatus(form, 'err',
              'Sorry — something went wrong sending your request. Please call us at (503) 428-4945 and we’ll take care of it.');
          })
          .then(function () {
            if (btn) { btn.disabled = false; btn.textContent = label; }
          });
      });
    });
  }

  /* --------------------------------------------------------- Year stamp */
  function initYear() {
    var els = document.querySelectorAll('[data-year]');
    var y = new Date().getFullYear();
    Array.prototype.forEach.call(els, function (el) { el.textContent = y; });
  }

  /* ----------------------------------------------------- Prefill select */
  function initPrefill() {
    var service = new URLSearchParams(window.location.search).get('service');
    if (!service) return;
    var select = document.querySelector('select[name="Service needed"]');
    if (!select) return;
    Array.prototype.forEach.call(select.options, function (opt) {
      if (opt.value.toLowerCase() === service.toLowerCase()) select.value = opt.value;
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initNav();
    initHeader();
    initReveals();
    initCounters();
    initForms();
    initYear();
    initPrefill();
  });
})();
