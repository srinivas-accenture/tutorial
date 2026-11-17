/* Day 51 in motion: HTTP APIs in Node (verbs, status codes, middleware, errors), streams, pipeline and backpressure, CLIs. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day51', {
  kicker: 'JavaScript: Zero to Architect · Day 51',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 51: building HTTP APIs in Node, moving big data with streams, and writing command-line tools.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Node APIs', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 51 · Servers, streams and CLIs', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['HTTP APIs', 'Streams and backpressure', 'CLIs'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ a server and the verbs */
{ d: 25, title: 'An HTTP server in Node',
  caps: [
    [0.3, "Node's http module hands you a raw request and response. Frameworks like Express, Fastify and Hono add routing and middleware."],
    [8, 'HTTP verbs carry meaning. GET reads data and is safe. POST creates something, and it is not idempotent.'],
    [14, 'PUT replaces and DELETE removes. Both are idempotent: sending them twice leaves the same result as sending them once.'],
    [20, 'So a retried POST can charge a card twice, unless the client sends an idempotency key.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['import { createServer } from "node:http";', '', 'createServer((req, res) => {', '  res.writeHead(200, { "content-type":', '    "application/json" });',
                '  res.end(JSON.stringify({ ok: true }));', '}).listen(3000);'];
    K.panel(40, 84, 640, 270, 'server.mjs', { a: K.p(t, 0.2) });
    K.code(code, 66, 134, { size: 20, lh: 1.5, n: K.typed(t, code, [0.6, 2.1, 2.2, 3.2, 4.5, 5.4, 6.8], 30), t: t, a: K.p(t, 0.2) });
    /* request / response */
    var c1 = K.back((t - 1.6) / 0.5);
    if (c1 > 0) { K.chip('client', 790, 132, { s: c1, size: 19, stroke: P.blue }); K.chip('server :3000', 1130, 132, { s: c1, size: 19, mono: true, stroke: P.acc }); }
    K.arrow(845, 118, 1050, 118, { p: K.p(t, 2.4, 0.6), color: P.blue });
    K.text('GET /healthz', 948, 96, { size: 16, mono: true, color: P.blue, align: 'center', a: K.p(t, 2.6) });
    K.arrow(1050, 148, 845, 148, { p: K.p(t, 4, 0.6), color: P.green });
    K.text('200 { "ok": true }', 948, 172, { size: 16, mono: true, color: P.green, align: 'center', a: K.p(t, 4.3) });
    ['Express', 'Fastify', 'Hono', 'Koa'].forEach(function (f, i) {
      K.chip(f, 100 + i * 108, 392, { size: 17, stroke: P.purple, a: K.p(t, 5.4 + i * 0.3) });
    });
    K.text('add routing + middleware', 468, 392, { size: 17, color: P.muted, a: K.p(t, 6.6) });
    /* verbs table */
    var hd = K.p(t, 8.2);
    K.text('verb', 750, 226, { size: 16, color: P.muted, weight: 700, a: hd });
    K.text('meaning', 850, 226, { size: 16, color: P.muted, weight: 700, a: hd });
    K.text('idempotent', 1160, 226, { size: 16, color: P.muted, weight: 700, align: 'center', a: hd });
    var V = [['GET', 'read · safe', 1, 8.6], ['POST', 'create / action', 0, 10], ['PUT', 'replace', 1, 14.3], ['PATCH', 'partial update', 2, 15.4], ['DELETE', 'remove', 1, 16.5]];
    V.forEach(function (v, i) {
      var y = 270 + i * 56, q = K.p(t, v[3]), hot = i === 1 && t > 20;
      K.box(724, y - 24, 516, 48, { fill: hot ? 'rgba(246,173,85,.12)' : P.card, stroke: hot ? P.warm : P.line, a: q });
      K.text(v[0], 744, y, { size: 19, mono: true, weight: 700, color: v[2] === 1 ? P.green : v[2] === 0 ? P.warm : P.blue, a: q });
      K.text(v[1], 850, y, { size: 19, a: q });
      if (v[2] === 2) K.text('not guaranteed', 1160, y, { size: 16, color: P.muted, align: 'center', a: K.p(t, v[3] + 0.4) });
      else K.mark(1160, y, v[2] === 1, 0.8, K.p(t, v[3] + 0.4));
    });
    /* retry */
    var r = K.p(t, 20.2);
    K.box(40, 440, 640, 148, { fill: P.code, stroke: P.line, a: r });
    K.mark(66, 474, false, 0.8, K.p(t, 20.6)); K.text('POST /payments  sent twice', 92, 474, { size: 18, mono: true, a: K.p(t, 20.6) });
    K.text('charged twice', 656, 474, { size: 18, color: P.red, align: 'right', a: K.p(t, 21.2) });
    K.mark(66, 520, true, 0.8, K.p(t, 22.2)); K.text('Idempotency-Key: 7f3a', 92, 520, { size: 18, mono: true, color: P.acc, a: K.p(t, 22.2) });
    K.text('charged once', 656, 520, { size: 18, color: P.green, align: 'right', a: K.p(t, 22.8) });
    K.text('the server stores the key and replays the first response', 66, 562, { size: 16, color: P.muted, a: K.p(t, 23.2) });
  } },

/* 3 ─ status codes */
{ d: 25, title: 'Honest status codes',
  caps: [
    [0.3, 'Answer with an honest status code. 200 is OK, 201 means created and comes with a Location header, 204 is success with no body.'],
    [7.5, '400 means the request is malformed. 422 means it is well formed, but the data is invalid.'],
    [13, "401 means we don't know who you are. 403 means we know you, and you are not allowed."],
    [18.5, '404 not found, 409 conflict, and 429 too many requests with Retry-After. 500 is for our own bugs, with no internals leaked.']],
  draw: function (K, t) {
    var P = K.P;
    function card(x, y, w, code, name, note, col, st, mono) {
      var q = K.back((t - st) / 0.5); if (q <= 0) return;
      var a = K.clamp(q * 1.5);
      K.g.save(); K.g.translate(x + w / 2, y + 50); K.g.scale(0.85 + 0.15 * q, 0.85 + 0.15 * q); K.g.translate(-x - w / 2, -y - 50);
      K.box(x, y, w, 100, { stroke: col, a: a });
      K.text(code, x + 20, y + 34, { size: 30, weight: 800, mono: true, color: col, a: a });
      K.text(name, x + 92, y + 35, { size: 20, weight: 700, a: a });
      K.text(note, x + 20, y + 74, { size: 16, mono: !!mono, color: P.muted, a: a });
      K.g.restore();
    }
    card(60, 80, 348, '200', 'OK', 'success with a body', P.green, 1);
    card(466, 80, 348, '201', 'Created', 'Location: /users/2', P.green, 2.6, true);
    card(872, 80, 348, '204', 'No Content', 'success, empty body', P.green, 5);
    card(60, 200, 560, '400', 'Bad Request', '{ "name": "Bo"     <- broken JSON', P.warm, 7.8, true);
    card(660, 200, 560, '422', 'Unprocessable Content', '{ "name": "" }     <- invalid data', P.warm, 10, true);
    K.text('vs', 640, 250, { size: 18, color: P.muted, align: 'center', a: K.p(t, 10.2) });
    card(60, 320, 560, '401', 'Unauthorized', 'no token or a bad one: who are you?', P.warm, 13.3);
    card(660, 320, 560, '403', 'Forbidden', 'valid token, but not allowed', P.warm, 15.2);
    K.text('vs', 640, 370, { size: 18, color: P.muted, align: 'center', a: K.p(t, 15.4) });
    card(60, 440, 262, '404', 'Not Found', 'no such resource', P.warm, 18.8);
    card(362, 440, 262, '409', 'Conflict', 'version clash', P.warm, 19.8);
    card(664, 440, 262, '429', 'Too Many', 'Retry-After: 30', P.warm, 20.8, true);
    card(966, 440, 262, '500', 'Server Error', 'no internals leaked', P.red, 22.2);
  } },

/* 4 ─ middleware */
{ d: 27, title: 'Middleware order',
  caps: [
    [0.3, 'Middleware are functions that take a context and next. Each one can act before and after the rest of the chain.'],
    [7, 'Order matters. The logger is outermost, so it sees the final status of every request, even failed ones.'],
    [13.5, 'The error handler wraps everything that can throw. Auth rejects with 401 before any handler runs.'],
    [19.5, 'Validation rejects bad bodies at the edge, so the handler only deals with the happy path.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['const logger = async (ctx, next) => {', '  const start = Date.now();', '  await next();  // rest of the chain', '  log(ctx.status, Date.now() - start);', '};',
                'app.use(logger).use(errorHandler)', '   .use(auth).use(validate);'];
    K.panel(40, 84, 580, 270, 'app.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 132, { size: 19, lh: 1.5, n: K.typed(t, code, [0.6, 1.6, 2.4, 3.4, 4.5, 4.6, 5.5], 40), t: t, a: K.p(t, 0.2),
      hi: t > 7.4 && t < 13 ? 0 : t > 3 && t < 7 ? 2 : -1, w: 560 });
    /* before / after */
    var b = K.p(t, 2.6);
    K.chip('before next()', 120, 410, { size: 17, mono: true, stroke: P.acc, a: b });
    K.arrow(200, 410, 236, 410, { p: K.p(t, 3), color: P.muted });
    K.box(244, 386, 170, 48, { fill: P.code, stroke: P.line, dash: [6, 6], a: K.p(t, 3.2) });
    K.text('rest of chain', 329, 410, { size: 17, color: P.muted, align: 'center', a: K.p(t, 3.2) });
    K.arrow(420, 410, 456, 410, { p: K.p(t, 3.6), color: P.muted });
    K.chip('after next()', 536, 410, { size: 17, mono: true, stroke: P.acc, a: K.p(t, 3.8) });
    K.text('one function wraps everything registered after it', 60, 470, { size: 17, color: P.muted, a: K.p(t, 4.6) });
    /* onion */
    var L = [['logger · request id', P.blue, 7.2], ['error handler', P.red, 13.6], ['auth · 401 / 403', P.warm, 15.2], ['validate · 400 / 422', P.purple, 19.6]];
    L.forEach(function (l, i) {
      var x = 650 + i * 36, y = 84 + i * 52, w = 590 - i * 72, h = 500 - i * 104, q = K.p(t, l[2]);
      K.box(x, y, w, h, { fill: i ? 'rgba(10,17,25,.5)' : P.card, stroke: l[1], a: q, lw: 2.5 });
      K.text(l[0], x + 18, y + 24, { size: 18, weight: 700, color: l[1], a: q });
    });
    K.text('next() runs the rest of the chain in here', 945, 330, { size: 17, color: P.muted, align: 'center', a: K.win(t, 7.8, 13.4) });
    var hq = K.back((t - 20.8) / 0.5);
    if (hq > 0) { K.box(794, 292, 302, 84, { stroke: P.green, a: K.clamp(hq) }); K.text('handler', 945, 334, { size: 22, weight: 700, align: 'center', a: K.clamp(hq) }); }
    /* travelling requests: down to a depth, then back out with a status */
    function trip(t0, yEnd, col, status) {
      var u = t - t0; if (u < 0 || u > 2.8) return;
      var y = u < 1.2 ? 66 + (yEnd - 66) * K.ease(u / 1.2) : yEnd - (yEnd - 66) * K.ease((u - 1.4) / 1.2);
      g.save(); g.globalAlpha *= K.clamp(Math.min(u / 0.2, (2.8 - u) / 0.2)); g.fillStyle = col; g.beginPath(); g.arc(1140, y, 10, 0, 7); g.fill(); g.restore();
      if (u > 1.2) K.text(status, 1162, y, { size: 19, mono: true, weight: 700, color: col, a: K.clamp((u - 1.2) / 0.3) * K.clamp((2.8 - u) / 0.3) });
    }
    trip(8.4, 520, P.warm, '404');
    trip(16, 196, P.red, '401');
    trip(22, 300, P.green, '201');
    K.text('log: GET /users/9 -> 404', 668, 560, { size: 17, mono: true, color: P.blue, a: K.win(t, 10.8, 15.8) });
    K.text('log: GET /admin/stats -> 401', 668, 560, { size: 17, mono: true, color: P.blue, a: K.win(t, 18.4, 21.8) });
    K.text('log: POST /users -> 201', 668, 560, { size: 17, mono: true, color: P.blue, a: K.p(t, 24.6) });
  } },

/* 5 ─ errors */
{ d: 25, title: 'Errors that do not leak',
  caps: [
    [0.3, 'Handlers throw typed errors that carry a status. One error handler turns them into a consistent JSON response.'],
    [7, 'An unexpected error becomes a plain 500. The stack trace and any secrets go to your logs, never to the client.'],
    [13.5, "The log line carries the request id, so you can match a user's report to the exact failure."],
    [18.5, 'Read request bodies with a size limit: 413 if the body is too large, and 400 if the JSON does not parse.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['class HttpError extends Error {', '  constructor(status, message) {', '    super(message);', '    this.status = status;', '  }', '}', 'throw new HttpError(404, "user not found");'];
    K.panel(40, 84, 560, 266, 'errors.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 132, { size: 19, lh: 1.5, n: K.typed(t, code, [0.6, 1.5, 2.4, 3, 3.7, 3.9, 4.1], 36), t: t, a: K.p(t, 0.2), hi: t > 5.4 && t < 7 ? 6 : -1, w: 540 });
    var crash = ['throw new Error("db password is hunter2");'];
    K.panel(40, 370, 560, 70, '', { a: K.p(t, 7.2), stroke: P.red });
    K.code(crash, 66, 393, { size: 19, n: K.typed(t, crash, [7.4], 36), t: t, a: K.p(t, 7.2) });
    K.arrow(608, 172, 712, 172, { p: K.p(t, 5.2, 0.5), color: P.acc });
    K.text('error handler', 660, 150, { size: 16, color: P.acc, align: 'center', a: K.p(t, 5.2) });
    /* client view */
    var cv = K.p(t, 5.6), late = K.p(t, 9, 0.3), gone = K.p(t, 8.6, 0.3);
    K.box(720, 84, 520, 170, { stroke: P.line, a: cv });
    K.text('Client sees', 744, 110, { size: 17, weight: 700, color: P.muted, a: cv });
    K.text('HTTP 404', 744, 150, { size: 20, mono: true, color: P.warm, a: cv * (1 - gone) });
    K.text('{ "error": "user not found" }', 744, 186, { size: 19, mono: true, a: cv * (1 - gone) });
    K.text('HTTP 500', 744, 150, { size: 20, mono: true, color: P.red, a: late });
    K.text('{ "error": "internal error" }', 744, 186, { size: 19, mono: true, a: late });
    K.mark(1208, 110, true, 0.8, K.p(t, 10));
    K.text('no stack, no secrets', 1190, 110, { size: 16, color: P.green, align: 'right', a: K.p(t, 10) });
    /* server log */
    var lg = K.p(t, 10.6);
    K.box(720, 280, 520, 170, { fill: P.code, stroke: P.line, a: lg });
    K.text('Server log · stderr', 744, 306, { size: 17, weight: 700, color: P.muted, a: lg });
    K.text('msg: db password is hunter2', 744, 380, { size: 17, mono: true, a: K.p(t, 11) });
    K.text('stack: at handler (app.js:42)', 744, 414, { size: 17, mono: true, color: P.muted, a: K.p(t, 11.6) });
    K.text('id: req-8   level: error', 744, 346, { size: 17, mono: true, a: K.p(t, 13.8), color: P.acc });
    K.text('x-request-id: req-8', 744, 222, { size: 19, mono: true, color: P.acc, a: K.p(t, 14.2) });
    K.box(736, 205, 228, 34, { fill: false, stroke: P.acc, a: K.p(t, 15), r: 8 });
    K.box(736, 330, 112, 32, { fill: false, stroke: P.acc, a: K.p(t, 15), r: 8 });
    K.arrow(850, 238, 800, 330, { p: K.p(t, 15.2, 0.6), color: P.acc, dash: [6, 6], lw: 2 });
    K.text('same id in both places', 1000, 267, { size: 16, color: P.acc, a: K.p(t, 15.6) });
    /* body limit */
    var bl = K.p(t, 18.8), n = Math.max(0, Math.min(11, Math.floor((t - 19) * 5)));
    K.text('body', 40, 500, { size: 18, weight: 700, color: P.muted, a: bl });
    for (var i = 0; i < n; i++) K.box(110 + i * 52, 486, 46, 28, { fill: i >= 10 ? P.red : P.acc, r: 5, a: 0.85 });
    K.box(626, 474, 3, 52, { fill: P.red, r: 1, a: bl });
    K.text('1 MB limit', 626, 464, { size: 16, color: P.red, align: 'center', a: bl });
    K.text('413 Payload Too Large', 840, 500, { size: 19, mono: true, weight: 700, color: P.red, a: K.p(t, 21.2) });
    K.text('{ "name": "Bo"', 110, 556, { size: 19, mono: true, a: K.p(t, 22) });
    K.arrow(290, 556, 340, 556, { p: K.p(t, 22.3), color: P.muted });
    K.text('JSON.parse throws', 352, 556, { size: 18, color: P.muted, a: K.p(t, 22.4) });
    K.text('400 Bad Request', 840, 556, { size: 19, mono: true, weight: 700, color: P.warm, a: K.p(t, 22.8) });
  } },

/* 6 ─ readFile vs streams */
{ d: 21, title: 'Why streams',
  caps: [
    [0.3, 'Reading a 5 GB log with readFile loads every byte into memory at once. A big enough file crashes the process.'],
    [7.5, 'A stream reads the file in small chunks, 64 KB at a time, and hands each chunk on as soon as it arrives.'],
    [13.5, 'Memory stays flat no matter how big the file is, and the first result comes after one chunk, not after the whole file.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var c1 = ['const data = await readFile("big.log");', '// all 5 GB in one Buffer'];
    var c2 = ['const src = createReadStream("big.log");', 'for await (const chunk of src) work(chunk);'];
    K.panel(40, 84, 580, 112, 'readFile', { a: K.p(t, 0.2) });
    K.code(c1, 64, 126, { size: 20, lh: 1.5, n: K.typed(t, c1, [0.6, 2], 32), t: t, a: K.p(t, 0.2) });
    K.panel(660, 84, 580, 112, 'stream', { a: K.p(t, 7.6), stroke: P.acc });
    K.code(c2, 684, 126, { size: 20, lh: 1.5, n: K.typed(t, c2, [7.8, 9.2], 32), t: t, a: K.p(t, 7.6) });
    function chart(cx, a) {
      K.box(cx, 216, 580, 260, { fill: P.code, stroke: P.line, a: a });
      g.save(); g.globalAlpha *= a; g.strokeStyle = P.muted; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + 50, 250); g.lineTo(cx + 50, 446); g.lineTo(cx + 556, 446); g.stroke(); g.restore();
      K.text('memory', cx + 60, 240, { size: 16, color: P.muted, a: a });
      K.text('time', cx + 556, 462, { size: 16, color: P.muted, align: 'right', a: a });
      K.box(cx + 50, 286, 506, 2, { fill: P.red, r: 1, a: a * 0.8 });
      K.text('memory limit', cx + 556, 272, { size: 16, color: P.red, align: 'right', a: a });
    }
    chart(40, K.p(t, 1.2)); chart(660, K.p(t, 8.4));
    /* readFile: memory climbs with the file */
    var q = K.clamp((t - 2) / 2.6);
    if (q > 0) { g.save(); g.strokeStyle = P.warm; g.lineWidth = 4; g.beginPath(); g.moveTo(90, 446); g.lineTo(90 + 320 * q, 446 - 196 * q); g.stroke(); g.restore(); }
    K.mark(440, 350, false, 0.9, K.p(t, 4.8));
    K.text('out of memory', 464, 350, { size: 19, color: P.red, a: K.p(t, 4.8) });
    /* stream: flat sawtooth */
    var q2 = K.clamp((t - 9.6) / 4);
    if (q2 > 0) {
      g.save(); g.strokeStyle = P.green; g.lineWidth = 4; g.beginPath();
      for (var x = 0; x <= 500 * q2; x += 4) { var y = 420 - 10 * ((x % 50) / 50); if (x === 0) g.moveTo(710 + x, y); else g.lineTo(710 + x, y); }
      g.stroke(); g.restore();
    }
    K.text('flat: one 64 KB chunk at a time', 720, 330, { size: 18, color: P.green, a: K.p(t, 13.8) });
    K.box(740, 360, 2, 86, { fill: P.green, r: 1, a: K.p(t, 15) });
    K.text('first result after chunk 1', 754, 380, { size: 16, color: P.green, a: K.p(t, 15) });
    /* bottom strips */
    var s1 = K.p(t, 2.4);
    K.box(60, 500, 170, 70, { stroke: P.line, a: s1 }); K.text('big.log · 5 GB', 145, 535, { size: 17, align: 'center', a: s1 });
    K.arrow(240, 535, 316, 535, { p: K.p(t, 2.8), color: P.warm });
    var grow = K.clamp((t - 3) / 2);
    K.box(326, 500, 50 + 244 * grow, 70, { fill: 'rgba(246,173,85,.15)', stroke: P.warm, a: K.p(t, 3) });
    K.text('one giant Buffer', 340, 535, { size: 17, color: P.warm, a: K.p(t, 4.2) });
    var s2 = K.p(t, 10);
    K.box(680, 500, 110, 70, { stroke: P.line, a: s2 }); K.text('big.log', 735, 535, { size: 17, align: 'center', a: s2 });
    K.box(1130, 500, 110, 70, { stroke: P.acc, a: s2 }); K.text('your code', 1185, 535, { size: 17, align: 'center', a: s2 });
    if (t > 10.4) for (var k = 0; k < 3; k++) {
      var f = ((t - 10.4) * 0.45 + k / 3) % 1, cx = 800 + 256 * f;
      K.box(cx, 518, 64, 34, { fill: P.card, stroke: P.acc, r: 6, a: K.clamp(Math.min(f / 0.12, (1 - f) / 0.12)) });
      K.text('64 KB', cx + 32, 535, { size: 16, mono: true, align: 'center', a: K.clamp(Math.min(f / 0.12, (1 - f) / 0.12)) });
    }
  } },

/* 7 ─ pipeline and backpressure */
{ d: 26, title: 'pipeline and backpressure',
  caps: [
    [0.3, 'Chain streams with pipeline: read the file, keep only the error lines, gzip them and write the result. It is one awaitable call.'],
    [7, 'If the disk is slow, its buffer fills up and write returns false. The pipeline pauses the source until drain fires.'],
    [14.5, 'That is backpressure. The slowest stage sets the pace, so data never piles up in memory in between.'],
    [20, 'Prefer pipeline over .pipe(). pipe does not forward errors or clean up, so one failure can leave streams open.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['import { pipeline } from "node:stream/promises";', 'await pipeline(', '  createReadStream("big.log"), onlyErrors,', '  createGzip(), createWriteStream("errors.gz"));'];
    K.panel(40, 84, 1200, 186, 'big-log.mjs', { a: K.p(t, 0.2) });
    K.code(code, 66, 132, { size: 22, lh: 1.5, n: K.typed(t, code, [0.6, 2.4, 3, 4.6], 30), t: t, a: K.p(t, 0.2) });
    var te = t < 9 ? t : t < 12 ? 9 : 9 + (t - 12) * 0.5;
    var B = [['createReadStream', 'source', P.acc], ['onlyErrors', 'Transform', P.purple], ['createGzip()', 'Transform', P.purple], ['createWriteStream', 'slow disk', P.warm]];
    B.forEach(function (b, i) {
      var x = 50 + i * 310, q = K.back((t - 1.4 - i * 0.5) / 0.5); if (q <= 0) return;
      K.box(x, 330, 220, 80, { stroke: b[2], a: K.clamp(q) });
      K.text(b[0], x + 110, 358, { size: 18, mono: true, weight: 700, align: 'center', a: K.clamp(q) });
      K.text(b[1], x + 110, 388, { size: 16, color: i === 3 ? P.warm : P.muted, align: 'center', a: K.clamp(q) });
      if (i < 3) {
        var g0 = x + 224, g1 = x + 306;
        K.box(g0, 369, g1 - g0, 2, { fill: P.line, r: 1, a: K.clamp(q) });
        if (t > 3) for (var k = 0; k < 2; k++) {
          var f = (te * 0.8 + k * 0.5) % 1;
          K.box(g0 + (g1 - g0 - 18) * f, 361, 18, 18, { fill: P.acc, r: 4, a: K.clamp(Math.min(f / 0.15, (1 - f) / 0.15)) * K.p(t, 3) });
        }
      }
    });
    /* buffer gauge on the writer */
    var f = t < 5 ? 0.35 : t < 9 ? 0.35 + 0.65 * (t - 5) / 4 : t < 12 ? 1 - 0.6 * (t - 9) / 3 : 0.45 + 0.08 * Math.sin(t * 2);
    var ga = K.p(t, 7.2);
    K.text('buffer', 970, 434, { size: 16, color: P.muted, align: 'right', a: ga });
    K.box(980, 425, 220, 18, { fill: P.code, stroke: P.line, r: 6, a: ga });
    K.box(980, 425, 220 * f, 18, { fill: f > 0.95 ? P.red : P.warm, r: 6, a: ga });
    K.text('write() returns false', 1090, 470, { size: 17, mono: true, color: P.red, align: 'center', a: K.win(t, 8.8, 12.2) });
    K.text("'drain': resume", 1090, 470, { size: 17, mono: true, color: P.green, align: 'center', a: K.win(t, 12.4, 19.6) });
    K.curve(1090, 326, 640, 250, 190, 326, { p: K.p(t, 9.2, 0.8), color: P.red, dash: [7, 7], lw: 2.5, a: 1 - K.p(t, 12) });
    K.text('pause the source', 640, 306, { size: 17, color: P.red, align: 'center', a: K.p(t, 9.6) * (1 - K.p(t, 12)) });
    K.text('the slowest stage sets the pace', 500, 470, { size: 20, color: P.acc, align: 'center', a: K.p(t, 14.8) });
    /* pipe vs pipeline */
    var c = K.p(t, 20.2);
    K.box(40, 500, 1200, 90, { fill: P.code, stroke: P.line, a: c });
    K.mark(66, 524, false, 0.8, K.p(t, 20.4));
    K.text('src.pipe(gzip).pipe(dest)', 92, 524, { size: 19, mono: true, a: K.p(t, 20.4) });
    K.text('errors not forwarded, nothing cleaned up', 470, 524, { size: 18, color: P.red, a: K.p(t, 21) });
    K.mark(66, 566, true, 0.8, K.p(t, 22));
    K.text('await pipeline(src, gzip, dest)', 92, 566, { size: 19, mono: true, a: K.p(t, 22) });
    K.text('errors, cleanup and backpressure in one place', 470, 566, { size: 18, color: P.green, a: K.p(t, 22.6) });
  } },

/* 8 ─ chunk boundaries */
{ d: 22, title: 'Chunk boundaries',
  caps: [
    [0.3, "Chunks don't respect lines. One chunk can end in the middle of a line, and the next chunk finishes it."],
    [7, 'So a line splitter keeps the unfinished tail in a buffer, and joins it to the next chunk.'],
    [13, 'Characters split too: the euro sign is three bytes in UTF-8. Decode chunks with a TextDecoder in stream mode.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['let buf = "";', 'for await (const chunk of src) {', '  buf += chunk;', '  const parts = buf.split("\\n");', '  buf = parts.pop();  // keep the tail',
                '  for (const l of parts) emit(l);', '}', 'if (buf) emit(buf);  // flush'];
    K.panel(40, 84, 580, 300, 'lines.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 132, { size: 19, lh: 1.5, n: K.typed(t, code, [0.6, 1, 1.9, 2.4, 3.3, 4.35, 5.3, 5.4], 40), t: t, a: K.p(t, 0.2),
      hi: t > 11.2 && t < 13 ? 7 : t > 9.4 && t < 11.2 ? 5 : t > 7.4 && t < 9.4 ? 4 : -1, w: 560 });
    /* the two chunks */
    var ch = K.p(t, 0.8);
    K.text('chunk 1', 680, 100, { size: 16, color: P.muted, a: ch });
    K.box(680, 114, 250, 56, { stroke: P.acc, a: ch }); K.text('ab\\ncd', 805, 142, { size: 24, mono: true, align: 'center', a: ch });
    K.text('chunk 2', 970, 100, { size: 16, color: P.muted, a: K.p(t, 1.4) });
    K.box(970, 114, 250, 56, { stroke: P.acc, a: K.p(t, 1.4) }); K.text('ef\\ng', 1095, 142, { size: 24, mono: true, align: 'center', a: K.p(t, 1.4) });
    /* naive split */
    var fade = 1 - 0.6 * K.p(t, 7), nv = K.p(t, 2.6) * fade;
    K.text('split each chunk:', 680, 214, { size: 17, color: P.muted, a: nv });
    [['ab', 0], ['cd', 1], ['ef', 1], ['g', 0]].forEach(function (c, i) {
      K.chip(c[0], 850 + i * 92, 214, { size: 20, mono: true, stroke: c[1] ? P.red : P.line, color: c[1] ? P.red : P.ink, a: K.p(t, 3 + i * 0.3) * fade });
    });
    K.mark(700, 256, false, 0.8, K.p(t, 4.4) * fade);
    K.text('"cdef" was cut in two', 726, 256, { size: 18, color: P.red, a: K.p(t, 4.4) * fade });
    /* buffer + output */
    var bb = K.p(t, 7.4);
    K.text('buf', 680, 330, { size: 18, weight: 700, color: P.warm, a: bb });
    K.box(730, 306, 220, 48, { fill: P.code, stroke: P.warm, a: bb });
    var inBuf = t < 9.4 ? 'cd' : t < 10.2 ? 'cdef' : t < 11.6 ? 'g' : '';
    var bufA = t < 9.4 ? K.p(t, 7.8) : t < 10.2 ? K.p(t, 9.4, 0.3) : t < 11.6 ? K.p(t, 10.4, 0.3) : 0;
    if (inBuf) K.text('"' + inBuf + '"', 840, 330, { size: 21, mono: true, color: P.warm, align: 'center', a: bufA });
    K.text('tail kept until the next chunk', 970, 330, { size: 16, color: P.muted, a: K.p(t, 8.2) });
    K.text('lines:', 680, 398, { size: 18, weight: 700, color: P.muted, a: K.p(t, 7.8) });
    [['ab', 7.9], ['cdef', 10.2], ['g', 11.6]].forEach(function (o, i) {
      var q = K.back((t - o[1]) / 0.5); if (q > 0) K.chip(o[0], 780 + i * 120, 398, { s: q, size: 20, mono: true, stroke: P.green });
    });
    K.mark(1160, 398, true, 0.9, K.p(t, 12));
    /* bytes */
    var u = K.p(t, 13.2);
    K.panel(40, 430, 1200, 158, '', { a: u });
    K.text('chunk 1', 66, 462, { size: 16, color: P.muted, a: u });
    K.text('chunk 2', 400, 462, { size: 16, color: P.muted, a: u });
    ['31', '30', 'E2', '82'].forEach(function (h, i) {
      var hot = i >= 2; K.box(134 + i * 62, 446, 54, 34, { fill: P.card, stroke: hot ? P.warm : P.line, r: 6, a: K.p(t, 13.4 + i * 0.15) });
      K.text(h, 161 + i * 62, 463, { size: 18, mono: true, align: 'center', color: hot ? P.warm : P.ink, a: K.p(t, 13.4 + i * 0.15) });
    });
    ['AC', '21'].forEach(function (h, i) {
      var hot = i === 0; K.box(468 + i * 62, 446, 54, 34, { fill: P.card, stroke: hot ? P.warm : P.line, r: 6, a: K.p(t, 14 + i * 0.15) });
      K.text(h, 495 + i * 62, 463, { size: 18, mono: true, align: 'center', color: hot ? P.warm : P.ink, a: K.p(t, 14 + i * 0.15) });
    });
    K.text('"10€!" in UTF-8: € is E2 82 AC', 680, 463, { size: 18, color: P.warm, a: K.p(t, 14.6) });
    K.mark(66, 516, false, 0.8, K.p(t, 15.8));
    K.text('chunk.toString()', 92, 516, { size: 19, mono: true, a: K.p(t, 15.8) });
    K.text('"10�" + "�!"', 600, 516, { size: 19, mono: true, color: P.red, a: K.p(t, 16.4) });
    K.mark(66, 560, true, 0.8, K.p(t, 17.6));
    K.text('decoder.decode(chunk, { stream: true })', 92, 560, { size: 19, mono: true, a: K.p(t, 17.6) });
    K.text('"10€!"', 600, 560, { size: 19, mono: true, color: P.green, a: K.p(t, 18.2) });
  } },

/* 9 ─ CLIs */
{ d: 25, title: 'Command-line tools',
  caps: [
    [0.3, 'A CLI is a program you drive with arguments. util.parseArgs reads them with explicit types, so flags are never guessed.'],
    [7.5, 'Print results to stdout and diagnostics to stderr, so the output can be piped into the next tool.'],
    [13.5, 'Exit code 0 means success and anything else means failure. Scripts and CI pipelines read that code.'],
    [19, 'Set process.exitCode instead of calling process.exit: exit can cut off output that is still being written.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['import { parseArgs } from "node:util";', 'const { values, positionals } = parseArgs({', '  options: { out: { type: "string" } },', '  allowPositionals: true });',
                'try {', '  await run(positionals[0], values.out);', '  console.log("done");         // stdout', '} catch (err) {', '  console.error(err.message);  // stderr', '  process.exitCode = 1;', '}'];
    var st = [], a0 = 0.6; code.forEach(function (l) { st.push(a0); a0 += l.length / 55 + 0.1; });
    K.panel(40, 84, 640, 362, 'big-log.mjs', { a: K.p(t, 0.2) });
    K.code(code, 66, 130, { size: 19, lh: 1.45, n: K.typed(t, code, st, 55), t: t, a: K.p(t, 0.2), w: 620,
      hi: t > 19.4 ? 9 : t > 13.8 ? 9 : t > 10.5 ? 8 : t > 7.8 ? 6 : -1 });
    /* terminal */
    var cmd = ['$ big-log app.log --out e.gz'];
    K.panel(720, 84, 520, 210, 'Terminal', { a: K.p(t, 0.6) });
    K.code(cmd, 744, 122, { size: 19, n: K.typed(t, cmd, [3.4], 24), t: t, a: K.p(t, 0.6) });
    K.text('values', 744, 176, { size: 18, mono: true, color: P.muted, a: K.p(t, 4.8) });
    K.text('{ out: "e.gz" }', 900, 176, { size: 18, mono: true, color: P.acc, a: K.p(t, 4.8) });
    K.text('positionals', 744, 210, { size: 18, mono: true, color: P.muted, a: K.p(t, 5.4) });
    K.text('[ "app.log" ]', 900, 210, { size: 18, mono: true, color: P.acc, a: K.p(t, 5.4) });
    K.text('$ echo $?', 744, 256, { size: 19, mono: true, a: K.p(t, 14) });
    K.text('0', 900, 256, { size: 19, mono: true, weight: 700, color: P.green, a: K.p(t, 14.8) });
    /* stdout / stderr */
    var pa = K.p(t, 7.8);
    K.box(720, 324, 150, 110, { stroke: P.acc, a: pa }); K.text('big-log', 795, 379, { size: 19, mono: true, weight: 700, align: 'center', a: pa });
    K.arrow(876, 350, 1004, 340, { p: K.p(t, 8.4, 0.5), color: P.green });
    K.text('stdout', 936, 326, { size: 16, mono: true, color: P.green, align: 'center', a: K.p(t, 8.4) });
    K.box(1012, 316, 228, 48, { stroke: P.green, a: K.p(t, 8.8) }); K.text('| next tool / file', 1126, 340, { size: 16, mono: true, align: 'center', a: K.p(t, 8.8) });
    K.arrow(876, 410, 1004, 418, { p: K.p(t, 10.4, 0.5), color: P.warm });
    K.text('stderr', 936, 438, { size: 16, mono: true, color: P.warm, align: 'center', a: K.p(t, 10.4) });
    K.box(1012, 394, 228, 48, { stroke: P.warm, a: K.p(t, 10.8) }); K.text('screen / logs', 1126, 418, { size: 16, align: 'center', a: K.p(t, 10.8) });
    /* exit codes */
    K.chip('0 = success', 820, 500, { size: 18, stroke: P.green, a: K.p(t, 15.4) });
    K.chip('non-zero = failure', 1070, 500, { size: 18, stroke: P.red, a: K.p(t, 16) });
    K.text('shells, scripts and CI read this code', 980, 556, { size: 17, color: P.muted, align: 'center', a: K.p(t, 16.8) });
    /* exit vs exitCode */
    K.mark(66, 500, false, 0.8, K.p(t, 19.4));
    K.text('process.exit(1)', 92, 500, { size: 19, mono: true, a: K.p(t, 19.4) });
    K.text('may cut off pending output', 330, 500, { size: 17, color: P.red, a: K.p(t, 20) });
    K.mark(66, 552, true, 0.8, K.p(t, 21));
    K.text('process.exitCode = 1', 92, 552, { size: 19, mono: true, a: K.p(t, 21) });
    K.text('finish writing, then exit', 330, 552, { size: 17, color: P.green, a: K.p(t, 21.6) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 51 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 100, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Verbs and honest status codes: 201, 400 vs 422, 401 vs 403',
     'Middleware order: logger, error handler, auth, validation',
     'Typed errors in one handler; a 500 never leaks internals',
     'Streams and pipeline: flat memory, backpressure, cleanup',
     'Buffer partial lines and bytes across chunk boundaries',
     'CLIs: parseArgs, stdout vs stderr, exit codes'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(240, y, true, 0.9, q);
      K.text(s, 272 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 51 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
