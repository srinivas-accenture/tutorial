/* App core: hash router, on-demand week loading, progress, and page-wide event handling.

   Routes (all on index.html, so the page never reloads):
     #home  #ladder  #glossary          course home (optionally scrolled to a section)
     #week-3                            top of a week
     #day-12  #d12-async  #revision-w3  a day / topic / revision sheet; the week is looked up
   Week content lives in content/weekN.js and is added with a <script> tag the first time it is
   needed. Plain scripts (not fetch or ES modules) keep everything working when the course is
   opened straight from disk via file://. */
(function (J) {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function store(k, v) {
    try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); }
    catch (e) { return null; }
  }

  J.totalDays = function () { return J.COURSE.reduce(function (a, w) { return a + w.days.length; }, 0); };

  /* ---------- lookup tables: which week owns a day or topic ---------- */
  var dayWeek = {}, topicWeek = {}, dayMeta = {};
  J.COURSE.forEach(function (w) {
    w.days.forEach(function (d) { dayWeek[d.n] = w.w; dayMeta[d.n] = d; d.tp.forEach(function (t) { topicWeek[t[0]] = w.w; }); });
  });

  function resolve(hash) {
    var h = decodeURIComponent((hash || '').replace(/^#\/?/, '')), m;
    if (!h || h === 'home') return { name: 'home' };
    if (h === 'ladder' || h === 'glossary') return { name: 'home', anchor: h };
    if ((m = /^week-?(\d+)$/.exec(h)) && J.COURSE[m[1] - 1]) return { name: 'week', w: +m[1] };
    if ((m = /^day-(\d+)$/.exec(h)) && dayWeek[m[1]]) return { name: 'week', w: dayWeek[m[1]], anchor: h };
    if ((m = /^revision-w(\d+)$/.exec(h)) && J.COURSE[m[1] - 1]) return { name: 'week', w: +m[1], anchor: h };
    if (topicWeek[h]) return { name: 'week', w: topicWeek[h], anchor: h };
    return { name: 'home' };
  }

  /* ---------- week loader ---------- */
  var weeks = {}, loading = {};
  J.registerWeek = function (W) { weeks[W.w] = W; };
  function loadWeek(n) {
    if (weeks[n]) return Promise.resolve(weeks[n]);
    if (loading[n]) return loading[n];
    loading[n] = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = 'content/week' + n + '.js';
      s.onload = function () { weeks[n] ? res(weeks[n]) : rej(new Error('content/week' + n + '.js loaded but did not register')); };
      s.onerror = function () { delete loading[n]; s.remove(); rej(new Error('Could not load content/week' + n + '.js')); };
      document.head.appendChild(s);
    });
    return loading[n];
  }

  /* ---------- views ---------- */
  var main, current = null, token = 0, io = null;

  function renderHome() {
    main.innerHTML = '';
    main.appendChild(document.importNode($('#home-tpl').content, true));
    var C = J.COURSE;
    $('#grid', main).innerHTML = C.map(function (w) {
      return '<div class="wkcard"><h3><a href="#week-' + w.w + '" style="color:inherit;text-decoration:none">Week ' + w.w + ': ' + w.title + '</a></h3><div class="sub">' + w.sub + '</div>' +
        w.days.map(function (d) {
          return '<div class="dd"><b><a href="#day-' + d.n + '">Day ' + d.n + ': ' + d.t + '</a></b><br><span>' +
            d.tp.map(function (t) { return '<a href="#' + t[0] + '">' + t[1] + '</a>'; }).join('') + '</span></div>';
        }).join('') + '</div>';
    }).join('');
    $('#ladtbl tbody', main).innerHTML = J.LADDER.map(function (r) { return '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('');
    $('#glos tbody', main).innerHTML = J.GLOSSARY.map(function (r) { return '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td></tr>'; }).join('');
    var last = lastVisited(), cont = $('#cont', main);
    if (last && cont) { cont.href = last; cont.hidden = false; }
    document.title = 'JavaScript: Zero to Architect';
  }

  function watchTopics(w) {
    if (io) io.disconnect();
    io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        J.sidebar.setActive(en.target.id);
        var d = en.target.closest('.day');
        if (d) J.header.setDay(dayMeta[d.id.slice(4)]);
      });
    }, { rootMargin: '-10% 0px -80% 0px' });
    $$('.topic', main).forEach(function (t) { io.observe(t); });
  }

  /* jump: true after a new view is rendered (no point smooth-scrolling through a page that just appeared) */
  function scrollTo(anchor, jump) {
    var el = anchor && document.getElementById(anchor), how = jump ? 'instant' : 'auto';
    if (el) el.scrollIntoView({ behavior: how }); else window.scrollTo({ top: 0, behavior: how });
  }

  function route() {
    var view = resolve(location.hash), my = ++token;
    document.body.classList.remove('nav'); J.header.setMenuOpen(false);
    var key = view.name === 'week' ? 'w' + view.w : 'home';

    if (key === current) { scrollTo(view.anchor); return; }

    if (view.name === 'home') {
      if (io) io.disconnect();
      renderHome(); finish(view, key); scrollTo(view.anchor, true);
      return;
    }
    main.innerHTML = '<p class="loading">Loading Week ' + view.w + '…</p>';
    loadWeek(view.w).then(function (W) {
      if (my !== token) return;                          /* user navigated again meanwhile */
      main.innerHTML = J.renderWeek(W);
      document.title = 'Week ' + W.w + ': ' + J.COURSE[W.w - 1].title + ' | JavaScript Zero to Architect';
      finish(view, key); progress(); watchTopics(W.w);
      store('jsc-last', '#week-' + W.w);
      requestAnimationFrame(function () { scrollTo(view.anchor, true); });
    }).catch(function (err) {
      if (my !== token) return;
      main.innerHTML = '<div class="wrap errbox"><h2>Could not load this week</h2><p>' + J.esc(err.message) +
        '</p><p>Check that the <code>content/</code> folder sits next to <code>index.html</code>.</p><p><a href="#home">← Course home</a></p></div>';
      current = null;
    });
  }

  function finish(view, key) {
    current = key;
    J.header.update(view); J.sidebar.update(view); J.footer.update(view);
    main.focus({ preventScroll: true });
  }

  /* ---------- progress ---------- */
  function progress() {
    var done = store('jsc-done') || [];
    $$('[data-done]', main).forEach(function (b) {
      var n = +b.dataset.done, on = done.indexOf(n) > -1;
      b.textContent = on ? '✓ Day ' + n + ' complete (click to undo)' : 'Mark Day ' + n + ' complete';
    });
    J.sidebar.setProgress(done);
  }

  /* 'week3.html' (old multi-page format) → '#week-3' */
  function lastVisited() {
    var l = store('jsc-last'); if (!l) return null;
    var m = /week(\d+)\.html/.exec(l); return m ? '#week-' + m[1] : (l.charAt(0) === '#' ? l : null);
  }

  /* ---------- one delegated click handler for the whole app ---------- */
  function onClick(e) {
    var t = e.target, d = document, b;
    var chrome = t.closest && t.closest('#site-header, #site-footer');  /* lesson examples may reuse these ids */
    if (chrome && t.id === 'theme') {
      var n = d.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      d.documentElement.dataset.theme = n; store('jsc-theme', n);
    }
    if (chrome && t.id === 'menu') { var open = d.body.classList.toggle('nav'); J.header.setMenuOpen(open); }
    else if (d.body.classList.contains('nav') && !t.closest('#sidebar')) { d.body.classList.remove('nav'); J.header.setMenuOpen(false); }  /* tap outside closes the mobile menu */
    if (chrome && t.id === 'top') window.scrollTo({ top: 0 });
    if (t.dataset && t.dataset.done) {
      var k = +t.dataset.done, a = store('jsc-done') || [], i = a.indexOf(k);
      if (i > -1) a.splice(i, 1); else a.push(k);
      store('jsc-done', a); progress();
    }
    if (t.classList.contains('run')) { var ex = t.closest('.ex'); J.run(ex.querySelector('code').textContent, ex.querySelector('.out')); }
    if (t.getAttribute && t.getAttribute('role') === 'tab') {
      var tp = t.closest('.topic'), eli = t.classList.contains('t-eli');
      $$('.tabs button', tp).forEach(function (x) { x.setAttribute('aria-selected', x === t); });
      $('.p-eli', tp).hidden = !eli; $('.p-tech', tp).hidden = eli;
    }
    /* clicking the link for the hash we're already on: hashchange won't fire, so scroll ourselves */
    if ((b = t.closest && t.closest('a[href^="#"]')) && b.getAttribute('href') === location.hash) {
      e.preventDefault(); route();
    }
  }

  /* ---------- boot ---------- */
  function init() {
    main = $('#main');
    J.header.mount($('#site-header'));
    J.sidebar.mount($('#sidebar'));
    J.footer.mount($('#site-footer'));
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav')) { document.body.classList.remove('nav'); J.header.setMenuOpen(false); }
    });
    addEventListener('hashchange', route);
    progress();
    route();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window.JSC = window.JSC || {});
