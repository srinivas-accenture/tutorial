/* Day 46 in motion: client-side routing with the History API, link interception, history vs hash mode,
   the navigation pipeline, URL / URLSearchParams, encoding, URL state and open redirects.
   Loaded on demand by assets/js/motion.js. */
(function () {
  /* a simple browser window with an address bar */
  function browser(K, x, y, w, h, url, a) {
    var P = K.P, g = K.g;
    K.box(x, y, w, h, { stroke: P.line, a: a });
    [P.red, P.warm, P.green].forEach(function (c, i) { g.save(); g.globalAlpha *= K.clamp(a) * 0.8; g.fillStyle = c; g.beginPath(); g.arc(x + 20 + i * 18, y + 26, 5.5, 0, 7); g.fill(); g.restore(); });
    K.box(x + 80, y + 10, w - 100, 32, { fill: P.code, r: 16, a: a });
    K.text(url, x + 98, y + 27, { size: 18, mono: true, a: a });
  }
  /* character-count based typing starts for a block of code */
  function starts(lines, t0, cps) {
    var s = t0, out = [];
    lines.forEach(function (l) { out.push(s); s += l.length / cps + 0.08; });
    return out;
  }

JSC.motion.define('day46', {
  kicker: 'JavaScript: Zero to Architect · Day 46',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 46: how single-page apps navigate, keep state in the URL, and handle URLs safely.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Routing and URLs', 0, 0, { size: 92, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 46 · Navigating without reloading', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['History API', 'URL · URLSearchParams', 'Safe redirects'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ multi-page vs single-page */
{ d: 23, title: 'Full reload vs single-page app',
  caps: [
    [0.3, 'A classic website asks the server for a whole new HTML page every time you click a link.'],
    [6, 'A single-page app loads once. JavaScript swaps the view and writes the new address into the URL bar.'],
    [12.5, 'Back, bookmarks and shared links must still work. The History API is how the app keeps them working.'],
    [18, 'Every SPA router, like React Router, Vue Router or Angular Router, is built on top of it.']],
  draw: function (K, t) {
    var P = K.P, a1 = K.p(t, 0.3), a2 = K.p(t, 6);
    K.text('Classic multi-page site', 60, 78, { size: 20, weight: 700, color: P.muted, a: a1 });
    browser(K, 60, 96, 540, 270, t < 3.6 ? 'shop.com/page1' : 'shop.com/page2', a1);
    K.box(84, 152, 492, 196, { fill: P.code, a: a1 });
    K.text(t < 3.6 ? 'Page 1' : 'Page 2', 330, 250, { size: 30, weight: 700, align: 'center', a: a1 * (t < 3.2 || t > 4 ? 1 : 0) });
    K.box(60, 96, 540, 270, { fill: '#ffffff', a: K.win(t, 3.2, 4.1, 0.3) * 0.4 });
    K.arrow(220, 372, 220, 446, { p: K.p(t, 1.6, 0.5), color: P.muted });
    K.text('GET /page2', 234, 408, { size: 17, mono: true, color: P.muted, a: K.p(t, 1.8) });
    K.box(160, 452, 340, 78, { stroke: P.purple, a: K.p(t, 1.2) });
    K.text('Server', 330, 491, { size: 22, weight: 700, align: 'center', a: K.p(t, 1.2) });
    K.arrow(440, 446, 440, 372, { p: K.p(t, 2.6, 0.5), color: P.warm });
    K.text('whole new HTML', 454, 408, { size: 17, color: P.warm, a: K.p(t, 2.7) });
    K.text('page blanks and reloads, JS state is lost', 330, 562, { size: 18, color: P.red, align: 'center', a: K.p(t, 4.2) });

    K.text('Single-page app', 680, 78, { size: 20, weight: 700, color: P.acc, a: a2 });
    var sw = K.p(t, 9, 0.6);
    browser(K, 680, 96, 540, 270, t < 9 ? 'shop.com/' : 'shop.com/users/42', a2);
    K.box(704, 152, 492, 196, { fill: P.code, a: a2 });
    K.text('Home view', 950 - sw * 60, 250, { size: 30, weight: 700, align: 'center', a: a2 * (1 - K.p(t, 9, 0.3)) });
    K.text('User 42 view', 1010 - sw * 60, 250, { size: 30, weight: 700, color: P.acc, align: 'center', a: K.p(t, 9.35, 0.4) });
    var r = K.back((t - 7.4) / 0.6);
    if (r > 0) K.chip('router.js', 790, 420, { s: r, mono: true, size: 20, stroke: P.acc });
    K.arrow(790, 396, 790, 372, { p: K.p(t, 8.2, 0.4), color: P.acc, head: 10 });
    K.text('swaps the view + URL, no reload', 870, 420, { size: 18, color: P.green, a: K.p(t, 9.4) });
    [['◀ Back', 790], ['★ Bookmark', 950], ['Share link', 1110]].forEach(function (c, i) {
      var q = K.back((t - 12.8 - i * 0.4) / 0.5);
      if (q > 0) K.chip(c[0], c[1], 494, { s: q, size: 19, stroke: P.green });
    });
    K.text('React Router · Vue Router · Angular Router  →  History API', 950, 566, { size: 18, color: P.blue, align: 'center', a: K.p(t, 18.4) });
  } },

/* 3 ─ pushState / replaceState / popstate */
{ d: 26, title: 'pushState and popstate',
  caps: [
    [0.3, 'history.pushState adds a history entry and changes the address bar. Nothing is loaded from the server.'],
    [6.5, 'replaceState edits the current entry instead of adding one. Neither of them fires an event.'],
    [12, 'When the user presses Back or Forward, the browser fires popstate on the window.'],
    [18, 'You read location and re-render. Because pushState fires nothing, call your render function yourself.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['history.pushState({ id: 42 }, "", "/users/42");', 'history.replaceState(null, "", "/users/42?tab=1");', '',
                'window.addEventListener("popstate", (e) => {', '  render(location.pathname, e.state);', '});'];
    K.panel(40, 86, 620, 268, 'router.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 134, { size: 20, n: K.typed(t, code, [1, 6.8, 8.9, 12.3, 14.1, 15.6]), t: t, w: 600,
      hi: t > 18 ? 4 : t > 12.3 ? 3 : t > 6.8 ? 1 : t > 1 ? 0 : -1, a: K.p(t, 0.2) });

    var rep = t > 7.9, ys = [470, 405, 340];
    var cy = ys[1] + (ys[2] - ys[1]) * K.p(t, 2.4, 0.5) - (ys[2] - ys[1]) * K.p(t, 13.2, 0.5);
    var cur = cy < 372 ? (rep ? '/users/42?tab=1' : '/users/42') : '/home';
    K.box(700, 86, 540, 50, { fill: P.code, stroke: P.line, r: 25, a: K.p(t, 0.2) });
    K.text('app.com' + cur, 724, 111, { size: 20, mono: true, a: K.p(t, 0.2) });
    K.text('Session history', 740, 176, { size: 17, weight: 700, color: P.muted, a: K.p(t, 0.4) });
    [['/', 0.4], ['/home', 0.6], [rep ? '/users/42?tab=1' : '/users/42', 2]].forEach(function (e, i) {
      var q = i < 2 ? K.p(t, e[1]) : K.back((t - e[1]) / 0.5);
      if (q <= 0) return;
      var y = ys[i] - (i === 2 ? (1 - K.clamp(q)) * 30 : 0);
      K.box(740, y - 26, 300, 52, { stroke: i === 2 && K.win(t, 7.9, 10.5) > 0 ? P.warm : P.blue, a: K.clamp(q) });
      K.text(e[0], 760, y, { size: 20, mono: true, a: K.clamp(q) });
    });
    K.arrow(1130, cy, 1052, cy, { color: P.acc, a: K.p(t, 0.6) });
    K.text('current', 1140, cy, { size: 17, color: P.acc, a: K.p(t, 0.6) });
    K.text('push: new entry', 1060, ys[2] - 46, { size: 16, color: P.green, a: K.win(t, 2.4, 6.6) });
    K.text('replace: same entry', 1060, ys[2] - 46, { size: 16, color: P.warm, a: K.win(t, 7.9, 12) });
    K.text('push / replace fire no event', 740, 540, { size: 17, color: P.muted, a: K.p(t, 9.6) });

    var b = K.back((t - 12.3) / 0.5), press = K.win(t, 12.8, 13.3, 0.15);
    if (b > 0) K.chip('◀ Back', 110, 410, { s: b * (1 - press * 0.12), size: 20, stroke: P.blue });
    K.arrow(170, 410, 236, 410, { p: K.p(t, 13.1, 0.4), color: P.warm });
    var pe = K.back((t - 13.4) / 0.5);
    if (pe > 0) K.chip('popstate', 320, 410, { s: pe, mono: true, size: 20, stroke: P.warm, color: P.warm });
    K.arrow(392, 410, 450, 410, { p: K.p(t, 18.3, 0.4), color: P.acc });
    var rr = K.back((t - 18.6) / 0.5);
    if (rr > 0) K.chip('render(path)', 548, 410, { s: rr, mono: true, size: 20, stroke: P.acc });
    var w = K.p(t, 20.2);
    K.box(40, 468, 620, 100, { fill: 'rgba(246,173,85,.10)', stroke: P.warm, a: w });
    K.text('pushState() never fires popstate:', 64, 500, { size: 20, mono: true, color: P.warm, a: w });
    K.text('call render() yourself right after it', 64, 536, { size: 20, color: P.ink, a: w });
  } },

/* 4 ─ intercepting link clicks */
{ d: 24, title: 'Intercepting link clicks',
  caps: [
    [0.3, 'A router listens for clicks on links, using one listener on the whole document.'],
    [5.5, 'It leaves the browser alone for modifier-key clicks, target blank, downloads and links to other origins.'],
    [12, 'For a plain same-origin click, it calls preventDefault and navigates with pushState instead.'],
    [18, 'Keep real anchor tags with an href. A div with a click handler breaks new tabs, keyboards and screen readers.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['document.addEventListener("click", (e) => {', '  const a = e.target.closest("a[href]");', '  if (!a || e.defaultPrevented) return;',
                '  if (e.button !== 0 || e.ctrlKey || e.metaKey', '      || e.shiftKey || e.altKey) return;', '  if (a.target === "_blank") return;',
                '  if (a.hasAttribute("download")) return;', '  const url = new URL(a.href);', '  if (url.origin !== location.origin) return;',
                '  e.preventDefault();', '  navigate(url.pathname + url.search);', '});'];
    var hi = t > 13.4 ? 10 : t > 12.2 ? 9 : t > 9.8 ? 8 : t > 8.6 ? 6 : t > 7.4 ? 5 : t > 6.2 ? 3 : t > 1.5 ? 1 : -1;
    K.panel(40, 76, 600, 362, 'router.js', { a: K.p(t, 0.2) });
    K.code(code, 62, 116, { size: 18, lh: 1.42, n: K.typed(t, code, starts(code, 0.6, 90), 90), t: t, hi: hi, w: 584, a: K.p(t, 0.2) });

    K.text('Who handles the click?', 680, 100, { size: 19, weight: 700, color: P.muted, a: K.p(t, 5.6) });
    [['Ctrl / Cmd / Shift + click', 0, 6.2], ['target="_blank"', 0, 7.4], ['<a download>', 0, 8.6],
     ['href to another origin', 0, 9.8], ['plain click, same origin', 1, 12.3]].forEach(function (r, i) {
      var y = 150 + i * 62, q = K.p(t, r[2], 0.5);
      K.box(680, y - 25, 560, 50, { stroke: r[1] ? P.green : P.line, a: q });
      K.text(r[0], 700, y, { size: 18, mono: i > 0 && i < 4, a: q });
      if (r[1]) K.chip('router: pushState', 1130, y, { size: 17, stroke: P.green, color: P.green, a: K.p(t, r[2] + 0.6) });
      else K.chip('browser', 1170, y, { size: 17, stroke: P.blue, color: P.blue, a: K.p(t, r[2] + 0.4) });
    });

    var a = K.p(t, 18.2), b = K.p(t, 19.2);
    K.box(40, 456, 600, 126, { fill: P.code, stroke: P.line, a: a });
    K.mark(72, 492, true, 0.8, a);
    K.code(['<a href="/users/42">Ana</a>'], 100, 480, { size: 19, a: a });
    K.mark(72, 548, false, 0.8, b);
    K.code(['<div onclick="go(42)">Ana</div>'], 100, 536, { size: 19, a: b });
    K.chip('opens in a new tab', 800, 492, { size: 18, stroke: P.green, a: K.p(t, 19.8) });
    K.chip('works with Enter', 1080, 492, { size: 18, stroke: P.green, a: K.p(t, 20.3) });
    K.chip('announced as a link', 940, 552, { size: 18, stroke: P.green, a: K.p(t, 20.8) });
  } },

/* 5 ─ history mode vs hash mode */
{ d: 25, title: 'History mode vs hash mode',
  caps: [
    [0.3, 'History mode gives clean URLs like /users/42. They look like real pages.'],
    [5.5, 'But on a refresh, the browser asks the server for /users/42. There is no such file, so the server answers 404.'],
    [11.5, 'The fix: the server falls back to index.html for page paths, but still sends real 404s for missing assets and API calls.'],
    [18, 'Hash mode, /#/users/42, needs no server setup: the part after the # is never sent to the server.']],
  draw: function (K, t) {
    var P = K.P, a = K.p(t, 0.3), fix = K.p(t, 13.2);
    K.text('History mode', 60, 78, { size: 20, weight: 700, color: P.acc, a: a });
    K.box(60, 100, 560, 56, { fill: P.code, stroke: P.line, r: 28, a: a });
    K.text('app.com/users/42', 86, 128, { size: 21, mono: true, a: a });
    K.chip('F5 refresh', 540, 128, { size: 16, stroke: P.warm, color: P.warm, a: K.p(t, 5.7) });
    K.arrow(200, 166, 200, 254, { p: K.p(t, 6.2, 0.5) });
    K.text('GET /users/42', 214, 210, { size: 17, mono: true, color: P.muted, a: K.p(t, 6.4) });
    K.box(60, 262, 560, 76, { stroke: P.purple, a: K.p(t, 5.8) });
    K.text('Server', 340, 300, { size: 22, weight: 700, align: 'center', a: K.p(t, 5.8) });
    K.arrow(440, 254, 440, 166, { p: K.p(t, 8, 0.5), color: P.red, a: 1 - fix });
    K.text('404 Not Found', 454, 210, { size: 18, mono: true, color: P.red, a: K.p(t, 8.2) * (1 - fix) });
    K.arrow(440, 254, 440, 166, { color: P.green, a: fix });
    K.text('index.html', 454, 210, { size: 18, mono: true, color: P.green, a: fix });
    K.panel(60, 362, 560, 120, '', { a: K.p(t, 11.6) });
    K.text('/assets/*, /api/*  →  real file or 404', 84, 398, { size: 18, mono: true, color: P.warm, a: K.p(t, 14.4) });
    K.text('any other path     →  index.html', 84, 444, { size: 18, mono: true, color: P.green, a: K.p(t, 12.2) });
    K.mark(80, 526, true, 0.8, K.p(t, 15.6));
    K.text('the router then renders /users/42', 106, 526, { size: 19, a: K.p(t, 15.6) });

    var b = K.p(t, 18.2);
    K.text('Hash mode', 680, 78, { size: 20, weight: 700, color: P.blue, a: b });
    K.box(680, 100, 560, 56, { fill: P.code, stroke: P.line, r: 28, a: b });
    var w = K.text('app.com/', 706, 128, { size: 21, mono: true, a: b });
    K.text('#/users/42', 706 + w, 128, { size: 21, mono: true, color: P.blue, a: b });
    K.arrow(820, 166, 820, 254, { p: K.p(t, 19, 0.5) });
    K.text('GET /', 834, 210, { size: 17, mono: true, color: P.muted, a: K.p(t, 19.2) });
    K.box(680, 262, 560, 76, { stroke: P.purple, a: b });
    K.text('Any static host', 960, 300, { size: 22, weight: 700, align: 'center', a: b });
    K.arrow(1080, 254, 1080, 166, { p: K.p(t, 19.8, 0.5), color: P.green });
    K.text('index.html', 1094, 210, { size: 18, mono: true, color: P.green, a: K.p(t, 20) });
    K.text('#/users/42 stays in the browser:', 700, 398, { size: 19, color: P.blue, a: K.p(t, 20.8) });
    K.text('the router reads location.hash', 700, 434, { size: 19, a: K.p(t, 21.3) });
    K.text('and listens for hashchange', 700, 466, { size: 19, a: K.p(t, 21.3) });
    K.chip('no server config', 820, 530, { size: 18, stroke: P.green, a: K.p(t, 22.2) });
    K.chip('less clean URLs', 1070, 530, { size: 18, stroke: P.warm, a: K.p(t, 22.7) });
  } },

/* 6 ─ the navigation pipeline */
{ d: 31, title: 'One navigation, step by step',
  caps: [
    [0.3, 'Inside the router, one navigation runs as a pipeline. First the path is matched against the route patterns.'],
    [6, 'The pattern /users/:id matches /users/42 and captures id as "42". The query is parsed too. No match means not-found.'],
    [12.5, 'Guards run before the change commits. A guard can cancel, or redirect, like sending a logged-out user to /login.'],
    [19, 'After rendering, update document.title and move focus to the new heading, so screen reader users hear the change.'],
    [25, 'Reset or restore the scroll position, and abort requests the old page started, with an AbortController.']],
  draw: function (K, t) {
    var P = K.P;
    var u = K.back((t - 0.4) / 0.6);
    if (u > 0) K.chip('/users/42?tab=posts', 640, 90, { s: u, mono: true, size: 20, stroke: P.acc });
    var B = [['Match', 6], ['Guards', 12.5], ['Render', 19], ['Title + focus', 19.5], ['Scroll + abort', 25]];
    B.forEach(function (b, i) {
      var x = 50 + i * 245, q = K.p(t, 1 + i * 0.4, 0.5), lit = t > b[1];
      K.box(x, 146, 200, 76, { stroke: lit ? P.acc : P.line, lw: lit ? 2.5 : 2, a: q });
      K.text(b[0], x + 100, 184, { size: 22, weight: 700, color: lit ? P.ink : P.muted, align: 'center', a: q });
      if (i) K.arrow(x - 40, 184, x - 6, 184, { p: K.p(t, 1 + i * 0.4, 0.4), color: P.muted });
    });
    K.curve(560, 104, 200, 100, 150, 140, { p: K.p(t, 3, 0.6), color: P.acc, lw: 2.5 });

    var m = K.p(t, 6.2);
    K.panel(40, 250, 580, 330, 'routes', { a: m });
    [['/', 'home'], ['/users/:id', 'user'], ['/admin', 'admin'], ['/login', 'login'], ['(no match)', 'not-found']].forEach(function (r, i) {
      var y = 306 + i * 40, q = K.p(t, 6.4 + i * 0.25, 0.4), nf = i === 4;
      if (i === 1) K.box(52, y - 18, 556, 36, { fill: 'rgba(79,209,197,.16)', r: 6, a: K.p(t, 7) });
      K.text(r[0], 66, y, { size: 19, mono: true, color: nf ? P.warm : P.ink, a: nf ? K.p(t, 10.6) : q });
      K.text('→  ' + r[1], 280, y, { size: 19, mono: true, color: nf ? P.warm : P.muted, a: nf ? K.p(t, 10.6) : q });
    });
    K.text('params  { id: "42" }', 66, 516, { size: 19, mono: true, color: P.green, a: K.p(t, 7.8) });
    K.text('query   { tab: "posts" }', 66, 552, { size: 19, mono: true, color: P.green, a: K.p(t, 9) });

    var gd = K.p(t, 12.6);
    K.box(660, 250, 580, 160, { stroke: P.line, a: gd });
    K.text('Guard: beforeEach(to)', 680, 276, { size: 17, weight: 700, color: P.muted, a: gd });
    var c1 = K.back((t - 13.2) / 0.5);
    if (c1 > 0) K.chip('/admin', 740, 330, { s: c1, mono: true, size: 20, stroke: P.blue });
    K.arrow(800, 330, 860, 330, { p: K.p(t, 14, 0.4) });
    K.lock(890, 334, 1.1, P.warm, K.p(t, 14.4));
    K.text('logged out', 890, 364, { size: 16, color: P.warm, align: 'center', a: K.p(t, 14.4) });
    K.arrow(920, 330, 990, 330, { p: K.p(t, 15.2, 0.4), color: P.green });
    var c2 = K.back((t - 15.6) / 0.5);
    if (c2 > 0) K.chip('/login', 1050, 330, { s: c2, mono: true, size: 20, stroke: P.green });
    K.text('false = cancel · "/path" = redirect · true = go', 680, 390, { size: 16, color: P.muted, a: K.p(t, 16.6) });

    var af = K.p(t, 19.2);
    K.box(660, 430, 580, 150, { stroke: P.line, a: af });
    K.chip('document.title = "User 42"', 820, 476, { mono: true, size: 17, stroke: P.acc, a: K.p(t, 19.8) });
    K.chip('h1.focus()', 1110, 476, { mono: true, size: 17, stroke: P.acc, a: K.p(t, 21) });
    K.chip('scrollTo(0, 0)', 790, 538, { mono: true, size: 17, stroke: P.purple, a: K.p(t, 25.6) });
    K.chip('controller.abort()', 1050, 538, { mono: true, size: 17, stroke: P.warm, a: K.p(t, 27) });
  } },

/* 7 ─ the URL object */
{ d: 26, title: 'Reading a URL',
  caps: [
    [0.3, 'Never chop URLs apart with string methods. new URL parses an address into named parts.'],
    [5.5, 'protocol, hostname, port, pathname, search and hash. The origin is the scheme, host and port together.'],
    [11.5, 'A base as the second argument resolves relative paths like ../c. Invalid input throws, so test with URL.canParse.'],
    [18, 'searchParams reads the query. Repeated keys need getAll, and a plus sign decodes to a space.']],
  draw: function (K, t) {
    var P = K.P, g = K.g, a = K.p(t, 0.4);
    var S = [['https:', 'protocol', P.acc], ['//', null], ['example.com', 'hostname', P.blue], [':8080', 'port', P.purple],
             ['/a/b', 'pathname', P.green], ['?x=1&x=2&y=a+b', 'search', P.warm], ['#top', 'hash', P.red]];
    g.save(); g.font = '26px Consolas,ui-monospace,Menlo,monospace'; var total = g.measureText(S.map(function (s) { return s[0]; }).join('')).width; g.restore();
    var x = 640 - total / 2, x0 = x, xo = 0, k = 0;
    S.forEach(function (s) {
      var w = K.text(s[0], x, 120, { size: 26, mono: true, color: t > 5.5 && s[1] ? s[2] : P.ink, a: a });
      if (s[1]) {
        var q = K.p(t, 5.8 + k * 0.6, 0.4), row = k % 2 ? 214 : 184;
        K.box(x + 2, 140, w - 4, 4, { fill: s[2], r: 2, a: q });
        K.arrow(x + w / 2, 146, x + w / 2, row - 14, { head: 7, lw: 1.5, color: s[2], a: q });
        K.text(s[1], x + w / 2, row, { size: 17, color: s[2], align: 'center', a: q });
        k++;
      }
      if (s[0] === ':8080') xo = x + w;
      if (s[1] === 'search' && t > 18) K.box(x - 6, 96, w + 12, 50, { fill: false, stroke: P.warm, lw: 2.5, a: K.p(t, 18.2) });
      x += w;
    });
    var oa = K.p(t, 10);
    K.box(x0, 240, xo - x0, 3, { fill: P.warm, r: 2, a: oa });
    K.box(x0, 232, 3, 11, { fill: P.warm, a: oa }); K.box(xo - 3, 232, 3, 11, { fill: P.warm, a: oa });
    K.text('origin', (x0 + xo) / 2, 262, { size: 17, weight: 700, color: P.warm, align: 'center', a: oa });

    var code = ['const u = new URL(href);', 'u.pathname  // "/a/b"', 'u.origin    // "https://example.com:8080"', '',
                'new URL("../c", "https://a.com/b/d/e").href', '// "https://a.com/b/c"', 'URL.canParse("not a url")  // false'];
    K.panel(40, 292, 600, 290, 'url.js', { a: K.p(t, 1) });
    K.code(code, 64, 336, { size: 19, lh: 1.45, n: K.typed(t, code, [1.4, 6.4, 8, 9.8, 11.8, 14, 15.4]), t: t, a: K.p(t, 1) });
    var sp = ['const p = u.searchParams;', 'p.get("x")     // "1"', 'p.getAll("x")  // ["1", "2"]', 'p.get("y")     // "a b"', 'p.has("z")     // false'];
    K.panel(680, 292, 560, 290, 'searchParams', { a: K.p(t, 18.2) });
    K.code(sp, 704, 336, { size: 19, lh: 1.6, n: K.typed(t, sp, [18.5, 19.7, 20.8, 22.2, 23.4]), t: t, a: K.p(t, 18.2),
      hi: t > 22.2 ? 3 : t > 20.8 ? 2 : -1, w: 536 });
  } },

/* 8 ─ encoding and URL state */
{ d: 28, title: 'Encoding and state in the URL',
  caps: [
    [0.3, 'To put one value into a URL, use encodeURIComponent. It escapes the characters with meaning: & = / ? and #.'],
    [6.5, 'encodeURI is for a whole URL, so it leaves those alone. Used on a single value, it breaks your query.'],
    [12.5, 'Even better, let URLSearchParams build the query string. It encodes every value for you.'],
    [18.5, 'Keep UI state like search, filters and page in the query. Use replaceState while typing, and pushState for real steps.'],
    [23.5, 'Then a refresh, a bookmark or a shared link brings back exactly the same view.']],
  draw: function (K, t) {
    var P = K.P;
    var c1 = ['encodeURIComponent("rock&roll")', '// "rock%26roll"', 'encodeURI("rock&roll")', '// "rock&roll"   & is left raw'];
    K.panel(40, 86, 600, 230, 'encode.js', { a: K.p(t, 0.3) });
    K.code(c1, 66, 132, { size: 20, n: K.typed(t, c1, [1, 2.6, 6.8, 8]), t: t, a: K.p(t, 0.3), hi: t > 6.8 ? 2 : t > 1 ? 0 : -1, w: 576 });
    K.box(680, 86, 560, 230, { stroke: P.line, a: K.p(t, 3.2) });
    K.text('What the server reads', 700, 114, { size: 17, weight: 700, color: P.muted, a: K.p(t, 3.2) });
    var r1 = K.p(t, 3.6), r2 = K.p(t, 9.2);
    K.text('?q=rock%26roll', 700, 180, { size: 19, mono: true, a: r1 });
    K.arrow(866, 180, 910, 180, { a: r1, head: 10 });
    K.text('q = "rock&roll"', 924, 180, { size: 19, mono: true, color: P.green, a: r1 });
    K.mark(1206, 180, true, 0.8, K.p(t, 4.2));
    K.text('?q=rock&roll', 700, 252, { size: 19, mono: true, a: r2 });
    K.arrow(866, 252, 910, 252, { a: r2, head: 10 });
    K.text('q = "rock", roll = ""', 924, 252, { size: 19, mono: true, color: P.red, a: r2 });
    K.mark(1206, 252, false, 0.8, K.p(t, 9.8));

    var c2 = ['const q = new URLSearchParams();', 'q.set("q", "rock & roll");', 'q.append("tag", "js");', 'q.toString();', '// "q=rock+%26+roll&tag=js"'];
    K.panel(40, 340, 600, 242, 'query.js', { a: K.p(t, 12.6) });
    K.code(c2, 66, 384, { size: 20, lh: 1.5, n: K.typed(t, c2, starts(c2, 12.9, 30), 30), t: t, a: K.p(t, 12.6) });

    var s = K.p(t, 18.6), qs = ['', 's', 'sh', 'sho', 'shoe'][Math.max(0, Math.min(4, Math.floor((t - 19.2) / 0.45) + 1))];
    if (t < 19.2) qs = '';
    var pg = t > 21.8 ? 2 : 1;
    K.box(680, 340, 560, 242, { stroke: P.line, a: s });
    K.box(700, 356, 520, 44, { fill: P.code, r: 22, a: s });
    K.text('shop.com/list?q=' + qs + '&page=' + pg, 722, 378, { size: 19, mono: true, a: s });
    K.text('typing in the search box', 704, 436, { size: 18, a: K.p(t, 19.2) });
    K.chip('replaceState', 1140, 436, { size: 17, mono: true, stroke: P.blue, color: P.blue, a: K.p(t, 19.6) });
    K.text('clicking to page 2', 704, 488, { size: 18, a: K.p(t, 21.6) });
    K.chip('pushState', 1140, 488, { size: 17, mono: true, stroke: P.green, color: P.green, a: K.p(t, 22) });
    ['refresh', 'bookmark', 'shared link'].forEach(function (c, i) {
      var q = K.back((t - 23.9 - i * 0.4) / 0.5);
      if (q > 0) K.chip(c + ' ✓', 800 + i * 160, 548, { s: q, size: 17, stroke: P.green });
    });
  } },

/* 9 ─ open redirects */
{ d: 26, title: 'Safe redirects',
  caps: [
    [0.3, 'After login, apps often redirect to a next parameter. Following it blindly is called an open redirect.'],
    [6, 'An attacker sends a link on your real domain, with next pointing at a fake site. The victim logs in and lands on it.'],
    [12.5, 'The fix: resolve next against your own origin with new URL, and accept it only if the origin is still yours.'],
    [19, 'That rejects //host, other schemes and backslash tricks, with / as the safe default. Check on the server too.']],
  draw: function (K, t) {
    var P = K.P;
    var c0 = ['const next = params.get("next");', 'location.href = next;   // after login'];
    K.panel(40, 76, 620, 128, 'login.js', { a: K.p(t, 0.3) });
    K.code(c0, 66, 118, { size: 20, n: K.typed(t, c0, [0.8, 2.4]), t: t, a: K.p(t, 0.3), hi: t > 4 ? 1 : -1, w: 596,
      marks: t > 4.4 ? { 1: 'rgba(252,129,129,.2)' } : null });
    K.text('followed blindly', 520, 186, { size: 16, color: P.red, a: K.p(t, 4.6) });
    var l = K.p(t, 6.2), n0 = K.p(t, 1.4) * (1 - K.p(t, 5.6, 0.4));
    K.box(700, 76, 540, 128, { stroke: P.green, a: n0 });
    K.text('A normal login link', 720, 104, { size: 16, weight: 700, color: P.muted, a: n0 });
    K.text('https://app.com/login', 720, 148, { size: 20, mono: true, a: n0 });
    K.text('?next=/dashboard', 720, 178, { size: 20, mono: true, color: P.green, a: n0 });
    K.box(700, 76, 540, 128, { stroke: P.red, a: l });
    K.text('Link the attacker sends', 720, 104, { size: 16, weight: 700, color: P.muted, a: l });
    K.text('https://app.com/login', 720, 148, { size: 20, mono: true, a: l });
    K.text('?next=//evil.com', 720, 178, { size: 20, mono: true, color: P.red, a: l });

    [['Victim clicks', 'a real app.com link', P.blue, 7], ['app.com/login', 'real site, real login', P.green, 8], ['evil.com', 'fake page asks again', P.red, 9.6]].forEach(function (b, i) {
      var x = 40 + i * 410, q = K.back((t - b[3]) / 0.5);
      if (q <= 0) return;
      K.box(x, 228, 380, 84, { stroke: b[2], a: K.clamp(q) });
      K.text(b[0], x + 190, 256, { size: 21, weight: 700, mono: i > 0, align: 'center', color: b[2], a: K.clamp(q) });
      K.text(b[1], x + 190, 290, { size: 17, color: P.muted, align: 'center', a: K.clamp(q) });
      if (i) K.arrow(x - 26, 270, x - 4, 270, { p: K.p(t, b[3] - 0.3, 0.3), color: b[2] });
    });

    var code = ['function safeNext(next) {', '  const t = new URL(next, location.origin);', '  const ok = t.origin === location.origin',
                '    && !next.startsWith("//")', '    && !next.includes("\\\\");', '  return ok ? t.pathname + t.search : "/";', '}'];
    K.panel(40, 334, 700, 248, 'safe-next.js', { a: K.p(t, 12.6) });
    K.code(code, 64, 372, { size: 19, lh: 1.32, n: K.typed(t, code, starts(code, 12.9, 60), 60), t: t, a: K.p(t, 12.6),
      hi: t > 15.4 && t < 19 ? 2 : -1, w: 670 });
    K.text('then validate again on the server', 64, 562, { size: 17, color: P.warm, a: K.p(t, 22.6) });

    K.box(780, 334, 460, 248, { stroke: P.line, a: K.p(t, 16) });
    K.text('input', 800, 360, { size: 16, weight: 700, color: P.muted, a: K.p(t, 16) });
    K.text('result', 1010, 360, { size: 16, weight: 700, color: P.muted, a: K.p(t, 16) });
    [['/dashboard', '"/dashboard"', 1, 16.4], ['//evil.com', '"/"', 0, 19.4], ['https://evil.com', '"/"', 0, 20.1],
     ['javascript:alert(1)', '"/"', 0, 20.8], ['/\\evil.com', '"/"', 0, 21.5]].forEach(function (r, i) {
      var y = 398 + i * 40, q = K.p(t, r[3], 0.4);
      K.text(r[0], 800, y, { size: 17, mono: true, a: q });
      K.text(r[1], 1010, y, { size: 17, mono: true, color: r[2] ? P.green : P.muted, a: q });
      K.mark(1210, y, !!r[2], 0.7, K.p(t, r[3] + 0.3, 0.4));
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 46 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['pushState changes the URL; popstate fires on Back and Forward',
     'Intercept only plain same-origin clicks, and keep real links',
     'History mode needs an index.html fallback; hash mode does not',
     'After navigating: title, focus, scroll, abort stale requests',
     'Parse with URL and URLSearchParams; validate every redirect'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(230, y, true, 0.9, q);
      K.text(s, 262 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 46 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
