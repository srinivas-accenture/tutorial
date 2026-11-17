/* Day 26 in motion: what Node.js is (V8 + libuv), core modules and process, EventEmitter, a small server,
   never blocking the loop, the Node event loop phases, nextTick vs promises, and setImmediate inside I/O.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day26', {
  kicker: 'JavaScript: Zero to Architect · Day 26',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 26: Node.js, JavaScript outside the browser, and the event loop that drives it.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Node.js', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 26 · JavaScript outside the browser', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['V8 + libuv', 'Core modules', 'The Node event loop'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ architecture */
{ d: 25, title: 'What Node.js is',
  caps: [
    [0.3, 'Node.js is the V8 engine taken out of the browser, plus system APIs for files, network and processes. There is no DOM.'],
    [6.5, 'Your code calls a Node API. A C++ binding hands the work to libuv, the library that runs the event loop.'],
    [12.5, 'libuv uses OS async I/O for network sockets, and a pool of four threads for files, DNS lookups, some crypto and zlib.'],
    [19, 'When the work is done, its callback is queued and runs back on the single main JavaScript thread.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, code = ['import { readFile } from "node:fs/promises";', 'const text = await readFile("notes.txt", "utf8");'];
    K.panel(40, 84, 680, 150, 'app.mjs', { a: K.p(t, 0.2) });
    K.code(code, 66, 140, { size: 20, n: K.typed(t, code, [0.8, 2.6], 26), t: t, a: K.p(t, 0.2), hi: t > 7 && t < 19.5 ? 1 : -1, w: 640 });
    K.box(760, 84, 460, 150, { stroke: P.acc, a: K.p(t, 3.4) });
    K.mark(796, 130, true, 0.85, K.p(t, 3.6)); K.text('files · network · processes', 824, 130, { size: 21, a: K.p(t, 3.6) });
    K.mark(796, 188, false, 0.85, K.p(t, 4.6)); K.text('no DOM, no window', 824, 188, { size: 21, color: P.red, a: K.p(t, 4.6) });
    var B = [['Your JS', 'V8 runs it', 6.7], ['Node APIs', 'fs · http · crypto', 7.6], ['C++ bindings', 'JS ↔ native code', 8.6],
             ['libuv', 'event loop · async I/O', 9.6], ['OS', 'files · sockets', 10.6]];
    var back = K.p(t, 20.4, 0.6);
    B.forEach(function (b, i) {
      var x = 50 + i * 245, q = K.back((t - b[2]) / 0.6), hot = i === 3;
      if (q <= 0) return;
      g.save(); g.translate(x + 100, 340); g.scale(q, q);
      K.box(-100, -50, 200, 100, { stroke: i === 0 && back > 0 ? P.green : hot ? P.warm : P.acc, a: K.clamp(q), lw: i === 0 && back > 0 ? 3 : 2 });
      K.text(b[0], 0, -14, { size: 23, weight: 700, align: 'center', a: K.clamp(q) });
      K.text(b[1], 0, 20, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      g.restore();
      if (i) K.arrow(x - 40, 340, x - 6, 340, { p: K.p(t, b[2] - 0.3, 0.4), color: P.muted });
    });
    var job = K.clamp((t - 8) / 3.6);
    if (t > 8 && t < 12.4) { g.save(); g.globalAlpha *= K.win(t, 8, 12.4); g.fillStyle = P.warm; g.beginPath(); g.arc(150 + job * 980, 282, 8, 0, 7); g.fill(); g.restore(); }
    var d = K.p(t, 12.8);
    K.box(760, 432, 480, 150, { fill: P.code, stroke: P.line, a: d });
    K.arrow(885, 394, 885, 428, { p: K.p(t, 12.8, 0.4), color: P.warm });
    K.arrow(1130, 394, 1130, 428, { p: K.p(t, 13.2, 0.4), color: P.warm });
    K.text('thread pool', 784, 458, { size: 18, weight: 700, color: P.purple, a: K.p(t, 13.4) });
    for (var i = 0; i < 4; i++) {
      var q = K.back((t - 13.8 - i * 0.25) / 0.5);
      if (q > 0) { K.box(784 + i * 58, 482, 48, 44, { stroke: P.purple, a: K.clamp(q) }); K.text('T' + (i + 1), 808 + i * 58, 505, { size: 17, mono: true, align: 'center', a: K.clamp(q) }); }
    }
    K.text('fs · dns.lookup · crypto · zlib', 784, 556, { size: 16, color: P.muted, a: K.p(t, 15.4) });
    K.text('network sockets', 1046, 458, { size: 18, weight: 700, color: P.blue, a: K.p(t, 13.4) });
    K.text('OS async I/O', 1046, 500, { size: 17, a: K.p(t, 14.2) });
    K.text('epoll · kqueue · IOCP', 1046, 530, { size: 16, color: P.muted, a: K.p(t, 14.6) });
    K.curve(800, 395, 470, 600, 150, 395, { p: K.p(t, 19.6, 1.1), color: P.green, lw: 3 });
    K.text('callback queued → runs on the main thread', 420, 552, { size: 18, color: P.green, align: 'center', a: K.p(t, 20.6) });
  } },

/* 3 ─ core modules and process */
{ d: 24, title: 'Core modules and process',
  caps: [
    [0.3, 'Core modules are imported with the node: prefix: fs, path, http, events, stream, crypto, worker_threads and more.'],
    [7, 'process is the running program: argv holds the command-line arguments, env the configuration, exitCode the result.'],
    [13, 'Environment values are always strings. The string "false" is truthy, so compare or parse them explicitly.'],
    [19, 'Node also ships web globals like fetch and URL, plus built-in tools: a test runner, watch mode and .env loading.']],
  draw: function (K, t) {
    var P = K.P, code = ['import { readFile } from "node:fs/promises";', 'const [file] = process.argv.slice(2);', 'if (!file) process.exitCode = 1;',
      'const debug = process.env.DEBUG === "true";', 'const port = Number(process.env.PORT ?? 3000);'];
    K.panel(40, 84, 640, 250, 'cli.mjs');
    K.code(code, 64, 136, { size: 19, lh: 1.55, n: K.typed(t, code, [0.8, 7.4, 9.6, 13.4, 15.8], 28), t: t, w: 610, hi: t > 13.4 ? 3 : t > 7.4 ? 1 : -1 });
    K.mark(648, 238, true, 0.7, K.p(t, 17.6));
    K.box(720, 84, 520, 250, { fill: false, stroke: P.acc, a: K.p(t, 0.9) });
    K.text('Core modules · node:', 744, 112, { size: 19, weight: 700, color: P.acc, a: K.p(t, 0.9) });
    ['fs', 'path', 'http', 'events', 'stream', 'crypto', 'buffer', 'worker_threads', 'child_process'].forEach(function (m, i) {
      var q = K.back((t - 1.4 - i * 0.35) / 0.5);
      if (q > 0) K.chip(m, 812 + (i % 3) * 170, 168 + Math.floor(i / 3) * 56, { s: q, a: K.clamp(q), mono: true, size: 17, stroke: i === 7 ? P.purple : P.acc });
    });
    K.panel(40, 360, 640, 230, 'Terminal', { a: K.p(t, 7.8) });
    var c1 = ['$ node cli.mjs notes.txt'];
    K.code(c1, 64, 400, { size: 19, n: K.typed(t, c1, [8.2], 22), t: t, a: K.p(t, 7.8) });
    K.text('argv → ["/usr/bin/node", "/app/cli.mjs", "notes.txt"]', 64, 452, { size: 17, mono: true, color: P.muted, a: K.p(t, 9.6) });
    var c2 = ['$ DEBUG=false node cli.mjs notes.txt'];
    K.code(c2, 64, 486, { size: 19, n: K.typed(t, c2, [13.8], 26), t: t, a: K.p(t, 13.6, 0.3) });
    K.mark(80, 554, false, 0.75, K.p(t, 15.6));
    K.text('if (process.env.DEBUG) → runs: "false" is truthy', 104, 554, { size: 17, mono: true, color: P.red, a: K.p(t, 15.6) });
    var b = K.p(t, 19.2);
    K.box(720, 360, 520, 230, { fill: false, stroke: P.blue, a: b });
    K.text('web globals', 744, 394, { size: 18, weight: 700, color: P.blue, a: b });
    [['fetch', 790], ['URL', 878], ['AbortController', 1010]].forEach(function (c, i) {
      K.chip(c[0], c[1], 438, { mono: true, size: 17, stroke: P.blue, a: K.p(t, 19.6 + i * 0.4) });
    });
    K.text('built-in tools', 744, 494, { size: 18, weight: 700, color: P.green, a: K.p(t, 21) });
    [['node --test', 814], ['--watch', 936], ['--env-file=.env', 1082]].forEach(function (c, i) {
      K.chip(c[0], c[1], 540, { mono: true, size: 17, stroke: P.green, a: K.p(t, 21.4 + i * 0.4) });
    });
  } },

/* 4 ─ EventEmitter */
{ d: 24, title: 'EventEmitter',
  caps: [
    [0.3, 'EventEmitter is the pattern behind most Node APIs: servers, sockets and streams all emit named events.'],
    [6, 'on registers a listener for an event name. once registers a listener that removes itself after its first call.'],
    [12, 'emit calls every listener for that name, in order, synchronously. The second emit only reaches ship.'],
    [18.5, 'Special case: emitting error with no error listener throws, and can crash the process. Always listen for error.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, code = ['import { EventEmitter } from "node:events";', 'const bus = new EventEmitter();', 'bus.on("order", (id) => console.log("ship", id));',
      'bus.once("order", (id) => console.log("thank", id));', 'bus.emit("order", 7);', 'bus.emit("order", 8);'];
    K.panel(40, 84, 620, 270, 'events.mjs');
    K.code(code, 64, 136, { size: 19, lh: 1.55, n: K.typed(t, code, [0.8, 2.4, 6.3, 8.6, 12.3, 14.8], 30), t: t, w: 590,
      hi: t > 14.8 ? 5 : t > 12.3 ? 4 : t > 8.6 ? 3 : t > 6.3 ? 2 : -1 });
    var hub = K.back((t - 2.8) / 0.6);
    if (hub > 0) {
      g.save(); g.globalAlpha *= K.clamp(hub); g.fillStyle = P.card; g.strokeStyle = P.acc; g.lineWidth = 3;
      g.beginPath(); g.arc(790, 220, 52 * hub, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text('bus', 790, 220, { size: 24, mono: true, weight: 700, align: 'center', a: K.clamp(hub) });
    }
    var pre = K.win(t, 3.4, 6.3);
    ['http.Server', 'net.Socket', 'fs.ReadStream'].forEach(function (c, i) {
      K.chip(c, 1080, 140 + i * 80, { mono: true, size: 18, stroke: P.purple, a: Math.min(pre, K.p(t, 3.4 + i * 0.5)) });
    });
    K.text('all of these are EventEmitters', 1080, 370, { size: 17, color: P.purple, align: 'center', a: Math.min(pre, K.p(t, 5)) });
    var gone = K.p(t, 13.8, 0.8);
    K.arrow(846, 204, 966, 157, { p: K.p(t, 6.6, 0.5), color: P.acc });
    K.box(970, 120, 250, 70, { stroke: P.acc, a: K.p(t, 6.8) });
    K.text('ship', 994, 155, { size: 22, mono: true, a: K.p(t, 6.8) });
    K.text('on', 1196, 155, { size: 17, color: P.muted, align: 'right', a: K.p(t, 6.8) });
    K.arrow(846, 236, 966, 283, { p: K.p(t, 8.9, 0.5), color: P.warm, a: 1 - gone * 0.8 });
    K.box(970, 250, 250, 70, { stroke: P.warm, a: K.p(t, 9.1) * (1 - gone * 0.75), dash: gone > 0.5 ? [6, 6] : null });
    K.text('thank', 994, 285, { size: 22, mono: true, a: K.p(t, 9.1) * (1 - gone * 0.75) });
    K.text('once', 1196, 285, { size: 17, color: P.warm, align: 'right', a: K.p(t, 9.1) * (1 - gone * 0.75) });
    K.text('removed after its first call', 1095, 344, { size: 16, color: P.muted, align: 'center', a: K.win(t, 14.2, 24) });
    function dot(x1, y1, x2, y2, a, c) {
      if (t < a || t > a + 0.9) return; var u = K.clamp((t - a) / 0.8);
      g.save(); g.fillStyle = c; g.beginPath(); g.arc(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, 8, 0, 7); g.fill(); g.restore();
    }
    dot(846, 204, 966, 157, 12.6, P.green); dot(846, 236, 966, 283, 12.6, P.green); dot(846, 204, 966, 157, 15.1, P.green);
    K.panel(700, 400, 540, 190, 'Output', { a: K.p(t, 12.4) });
    [['ship 7', 13.3], ['thank 7', 13.5], ['ship 8', 15.9]].forEach(function (o, i) {
      K.text(o[0], 728, 458 + i * 40, { size: 21, mono: true, a: K.p(t, o[1], 0.3) });
    });
    var e = K.p(t, 18.8);
    K.box(40, 384, 620, 206, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: e });
    K.mark(74, 424, false, 0.8, e);
    K.text('bus.emit("error", new Error("boom"));', 100, 424, { size: 18, mono: true, a: e });
    K.text('no "error" listener → it throws', 100, 462, { size: 18, color: P.red, a: K.p(t, 19.6) });
    var ok = K.p(t, 21.4);
    K.mark(74, 524, true, 0.8, ok);
    K.text('bus.on("error", (err) => log(err));', 100, 524, { size: 18, mono: true, a: ok });
    K.text('handle it, log it, keep running', 100, 558, { size: 17, color: P.green, a: K.p(t, 22) });
  } },

/* 5 ─ a small HTTP server */
{ d: 26, title: 'A small web server',
  caps: [
    [0.3, 'A small web server needs only core modules: createServer from node:http and readFile from node:fs/promises.'],
    [7, 'Each request runs the async handler. While it awaits the file, the one thread is free to start other requests.'],
    [14, 'Configuration comes from environment variables, here PORT, with a sensible default.'],
    [19, 'On SIGTERM, server.close stops new connections and lets in-flight requests finish before the process exits.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, code = ['import { createServer } from "node:http";', 'import { readFile } from "node:fs/promises";', '',
      'const server = createServer(async (req, res) => {', '  const body = await readFile("data.json");', '  res.writeHead(200).end(body);', '});',
      'server.listen(process.env.PORT ?? 3000);', 'process.on("SIGTERM", () => server.close());'];
    K.panel(40, 84, 600, 336, 'server.mjs');
    K.code(code, 64, 134, { size: 19, lh: 1.55, n: K.typed(t, code, [0.8, 2.4, 4, 4.1, 7.2, 9.2, 10.4, 14.2, 19.2], 30), t: t, w: 570,
      hi: t > 19.2 ? 8 : t > 14.2 ? 7 : t > 7.2 ? 4 : -1 });
    var stop = K.p(t, 20, 0.6);
    var sv = K.p(t, 6);
    K.box(880, 110, 180, 170, { stroke: stop > 0.5 ? P.warm : P.acc, a: sv, lw: 2.5 });
    K.text('server', 970, 150, { size: 22, weight: 700, align: 'center', a: sv });
    K.text(stop > 0.5 ? 'closing…' : 'one thread', 970, 182, { size: 17, color: stop > 0.5 ? P.warm : P.muted, align: 'center', a: sv });
    var rq = [['GET /a', 7.4, 10.6], ['GET /b', 8.4, 11.5], ['GET /c', 9.4, 12.4]];
    rq.forEach(function (r, i) {
      var y = 130 + i * 66, q = K.p(t, r[1], 0.4), done = K.p(t, r[2], 0.4);
      K.chip(r[0], 750, y, { mono: true, size: 17, stroke: done > 0.5 ? P.green : P.blue, a: q });
      K.arrow(812, y, 874, y, { p: K.p(t, r[1] + 0.2, 0.4), color: P.blue });
      K.mark(1086, y, true, 0.7, done);
    });
    K.text('responses', 1150, 196, { size: 17, color: P.green, align: 'center', a: K.p(t, 10.8) });
    /* main thread timeline */
    K.text('main thread', 60, 470, { size: 17, weight: 700, color: P.muted, a: K.p(t, 7.4) });
    K.box(60, 488, 580, 34, { fill: P.code, stroke: P.line, r: 6, a: K.p(t, 7.4) });
    rq.forEach(function (r, i) {
      K.box(72 + i * 46, 492, 38, 26, { fill: P.blue, r: 4, a: K.p(t, r[1] + 0.3, 0.3) });
      K.box(420 + i * 46, 492, 38, 26, { fill: P.green, r: 4, a: K.p(t, r[2], 0.3) });
    });
    K.text('free while the files load', 340, 556, { size: 17, color: P.acc, align: 'center', a: K.p(t, 10.2) });
    K.arrow(214, 540, 410, 540, { p: K.p(t, 10.2, 0.6), color: P.acc, lw: 2, head: 10 });
    K.panel(680, 310, 560, 104, 'Terminal', { a: K.p(t, 14.2) });
    var c1 = ['$ PORT=8080 node server.mjs'];
    K.code(c1, 704, 346, { size: 19, n: K.typed(t, c1, [14.6], 26), t: t, a: K.p(t, 14.2) });
    K.text('listening on :8080', 704, 394, { size: 16, mono: true, color: P.muted, a: K.p(t, 16.4) });
    var sg = K.back((t - 19.4) / 0.6);
    if (sg > 0) K.chip('SIGTERM', 760, 490, { s: sg, a: K.clamp(sg), size: 20, weight: 700, mono: true, stroke: P.warm, color: P.warm });
    K.arrow(832, 490, 872, 490, { p: K.p(t, 19.8, 0.4), color: P.warm });
    K.mark(900, 456, false, 0.75, K.p(t, 20.6));
    K.text('new connections refused', 924, 456, { size: 18, a: K.p(t, 20.6) });
    K.mark(900, 500, true, 0.75, K.p(t, 21.8));
    K.text('in-flight requests finish', 924, 500, { size: 18, a: K.p(t, 21.8) });
    K.mark(900, 544, true, 0.75, K.p(t, 23));
    K.text('process exits cleanly', 924, 544, { size: 18, color: P.green, a: K.p(t, 23) });
  } },

/* 6 ─ never block the loop */
{ d: 24, title: 'Never block the loop',
  caps: [
    [0.3, 'There is one main thread. With async I/O, each request needs only short slices of it, so many requests share it.'],
    [7, 'readFileSync, parsing a huge JSON string or a long CPU loop holds that thread. Every other request waits.'],
    [13.5, 'Move CPU-heavy work to worker threads, a job queue or another service, and keep request handlers short.'],
    [19.5, 'In production, measure event-loop delay and alert on spikes: it is the first sign of a blocked loop.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, X0 = 280, X1 = 1220;
    function track(y, label, color, a) {
      K.text(label, 60, y + 30, { size: 19, weight: 700, color: color, a: a, mono: true });
      K.box(X0, y, X1 - X0, 60, { fill: P.code, stroke: P.line, r: 8, a: a });
    }
    track(96, 'async I/O', P.acc, K.p(t, 0.4));
    var ph1 = X0 + (X1 - X0) * K.clamp((t - 1.2) / 5);
    [['A', 300], ['B', 380], ['C', 460], ['A', 640], ['C', 720], ['B', 860]].forEach(function (b) {
      var q = K.clamp((ph1 - b[1]) / 20);
      K.box(b[1], 104, 44, 44, { fill: 'rgba(79,209,197,.25)', stroke: P.acc, r: 6, a: q });
      K.text(b[0], b[1] + 22, 126, { size: 19, weight: 700, align: 'center', a: q });
    });
    if (t > 1.2 && t < 7) K.box(ph1 - 1, 90, 3, 72, { fill: P.warm, r: 1, a: K.win(t, 1.2, 6.8) });
    K.text('each request: a short slice, then await', 750, 186, { size: 17, color: P.acc, align: 'center', a: K.p(t, 5) });
    track(232, 'blocking', P.red, K.p(t, 7.2));
    var ph2 = X0 + (X1 - X0) * K.clamp((t - 7.8) / 5);
    var wA = Math.max(0, Math.min(ph2, 900) - 300);
    K.box(300, 240, wA, 44, { fill: 'rgba(252,129,129,.3)', stroke: P.red, r: 6, a: wA > 4 ? 1 : 0 });
    K.text('A: readFileSync / CPU loop', 316, 262, { size: 18, weight: 700, color: P.ink, a: K.clamp((ph2 - 560) / 40) });
    [['B', 420], ['C', 560]].forEach(function (b, i) {
      var arr = K.clamp((ph2 - b[1]) / 20);
      K.arrow(b[1], 196 + 0, b[1], 236, { p: arr, color: P.warm, a: arr * K.p(t, 8) });
      K.text(b[0] + ' waits', b[1] + 10, 214, { size: 16, color: P.warm, a: arr * K.p(t, 8) });
      var run = K.clamp((ph2 - 910 - i * 54) / 20);
      K.box(910 + i * 54, 240, 44, 44, { fill: 'rgba(246,173,85,.25)', stroke: P.warm, r: 6, a: run });
      K.text(b[0], 932 + i * 54, 262, { size: 19, weight: 700, align: 'center', a: run });
    });
    if (t > 7.8 && t < 13.4) K.box(ph2 - 1, 226, 3, 72, { fill: P.warm, r: 1, a: K.win(t, 7.8, 13.2) });
    K.text('late', 1100, 262, { size: 18, color: P.red, a: K.p(t, 11.8) });
    /* offload */
    var o = K.p(t, 13.6);
    K.box(60, 360, 260, 90, { stroke: P.acc, a: o });
    K.text('main thread', 190, 392, { size: 21, weight: 700, align: 'center', a: o });
    K.text('handles requests', 190, 424, { size: 16, color: P.muted, align: 'center', a: o });
    K.arrow(330, 390, 446, 390, { p: K.p(t, 14.4, 0.5), color: P.purple });
    K.arrow(446, 422, 330, 422, { p: K.p(t, 15.4, 0.5), color: P.green });
    K.text('job', 388, 372, { size: 16, color: P.purple, align: 'center', a: K.p(t, 14.4) });
    K.text('result', 388, 442, { size: 16, color: P.green, align: 'center', a: K.p(t, 15.4) });
    K.box(456, 360, 240, 90, { stroke: P.purple, a: K.p(t, 14.2) });
    K.text('worker thread', 576, 392, { size: 21, weight: 700, align: 'center', a: K.p(t, 14.2) });
    K.text('hashing, resizing…', 576, 424, { size: 16, color: P.muted, align: 'center', a: K.p(t, 14.2) });
    var wc = ['import { Worker } from "node:worker_threads";', 'new Worker("./hash.js", { workerData: file });'];
    K.panel(60, 476, 640, 108, '', { a: K.p(t, 16) });
    K.code(wc, 82, 494, { size: 18, lh: 1.6, n: K.typed(t, wc, [16.3, 17.6], 34), t: t, a: K.p(t, 16) });
    /* event-loop delay */
    var m = K.p(t, 19.8);
    K.box(740, 360, 480, 224, { fill: P.code, stroke: P.line, a: m });
    K.text('event-loop delay (p99)', 764, 390, { size: 19, weight: 700, color: P.muted, a: m });
    var h = K.p(t, 20.6, 0.8), bl = K.p(t, 21.8, 1.2);
    K.text('healthy', 764, 436, { size: 17, a: h }); K.box(870, 424, 30 * h, 24, { fill: P.green, r: 4, a: h });
    K.text('3 ms', 912, 436, { size: 17, mono: true, color: P.green, a: h });
    K.text('blocked', 764, 482, { size: 17, a: bl }); K.box(870, 470, 230 * bl, 24, { fill: P.red, r: 4, a: bl });
    K.text('1900 ms', 1112, 482, { size: 17, mono: true, color: P.red, a: bl });
    K.text('perf_hooks.monitorEventLoopDelay()', 764, 540, { size: 17, mono: true, color: P.acc, a: K.p(t, 22.4) });
  } },

/* 7 ─ loop phases */
{ d: 26, title: 'The Node event loop',
  caps: [
    [0.3, 'Node’s event loop comes from libuv. Each turn visits fixed phases, and each phase has its own queue of callbacks.'],
    [7, 'timers runs expired setTimeout and setInterval callbacks. pending runs some deferred system callbacks.'],
    [12.5, 'poll fetches new I/O events and runs their callbacks. When there is nothing else to do, the loop waits here.'],
    [18, 'check runs setImmediate callbacks, close runs close events such as a closed socket, and the loop starts again.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, cx = 380, cy = 335, R = 185;
    var N = [['timers', 'setTimeout · setInterval', 7.2], ['pending', 'system callbacks', 9.6], ['poll', 'I/O callbacks', 12.7],
             ['check', 'setImmediate', 18.4], ['close', 'close events', 20.9]];
    var ring = K.p(t, 0.5, 1);
    g.save(); g.globalAlpha *= ring; g.strokeStyle = P.line; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke(); g.restore();
    for (var k = 0; k < 5; k++) {
      var m = (-90 + 72 * k + 36) * Math.PI / 180, d = 0.05;
      K.arrow(cx + R * Math.cos(m - d), cy + R * Math.sin(m - d), cx + R * Math.cos(m + d), cy + R * Math.sin(m + d), { color: P.muted, a: K.p(t, 1.4), head: 14 });
    }
    var s = 5 * K.clamp((t - 2.4) / 4) + K.p(t, 9.5, 0.8) + K.p(t, 12.6, 0.8) + K.p(t, 18.3, 0.8) + K.p(t, 20.8, 0.8) + K.p(t, 23.4, 0.8);
    var ang = (-90 + 72 * s) * Math.PI / 180, act = t > 7 ? Math.round(s) % 5 : -1;
    if (t > 2) { g.save(); g.globalAlpha *= K.p(t, 2, 0.4); g.fillStyle = P.warm; g.beginPath(); g.arc(cx + R * Math.cos(ang), cy + R * Math.sin(ang), 11, 0, 7); g.fill(); g.restore(); }
    N.forEach(function (n, i) {
      var a = (-90 + 72 * i) * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), q = K.back((t - 1 - i * 0.35) / 0.5);
      if (q <= 0) return;
      g.save(); g.translate(x, y); g.scale(q, q);
      var on = act === i;
      K.box(-100, -34, 200, 68, { stroke: on ? P.warm : i === 2 ? P.blue : i === 3 ? P.green : P.acc, lw: on ? 3.5 : 2, a: K.clamp(q) });
      K.text(n[0], 0, -10, { size: 22, weight: 700, align: 'center', a: K.clamp(q) });
      K.text(n[1], 0, 16, { size: 16, color: P.muted, align: 'center', a: K.clamp(q) });
      g.restore();
    });
    K.text('one turn of the loop', cx, cy - 14, { size: 19, weight: 700, color: P.muted, align: 'center', a: K.p(t, 2.4) });
    K.text('each phase: a FIFO queue', cx, cy + 16, { size: 17, color: P.muted, align: 'center', a: K.p(t, 4) });
    var D = [['timers', 'expired setTimeout / setInterval'], ['pending', 'some deferred system callbacks'], ['poll', 'new I/O events; waits here when idle'],
             ['check', 'setImmediate callbacks'], ['close', 'socket.on("close") and similar']];
    D.forEach(function (r, i) {
      var y = 100 + i * 94, q = K.p(t, N[i][2], 0.5), on = act === i;
      K.box(720 + (1 - q) * 30, y, 520, 76, { stroke: on ? P.warm : P.line, lw: on ? 3 : 2, a: q });
      K.text((i + 1) + ' · ' + r[0], 744 + (1 - q) * 30, y + 25, { size: 21, weight: 700, color: on ? P.warm : P.ink, a: q });
      K.text(r[1], 744 + (1 - q) * 30, y + 54, { size: 17, mono: i !== 1 && i !== 2, color: P.muted, a: q });
    });
    K.text('waiting for I/O…', cx + 110, cy + 216 - 4, { size: 16, color: P.blue, a: K.win(t, 14.5, 18) });
  } },

/* 8 ─ nextTick and promises */
{ d: 26, title: 'nextTick, promises, timers',
  caps: [
    [0.3, 'Predict the order. This script schedules a timeout, an immediate, a nextTick and a promise, then logs sync.'],
    [7.5, 'Each call only drops its callback into a queue. Just one line, log sync, runs during the main script itself.'],
    [13, 'After the script, and after every callback, Node drains the nextTick queue first, then the promise microtasks.'],
    [19, 'Then the loop starts. From the main module, timeout and immediate can print in either order.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, code = ['setTimeout(() => log("timeout"), 0);', 'setImmediate(() => log("immediate"));', 'process.nextTick(() => log("nextTick"));',
      'Promise.resolve().then(() => log("promise"));', 'log("sync");'];
    var hi = t > 11 && t < 12.4 ? 4 : t > 10.2 && t < 11 ? 3 : t > 9.4 && t < 10.2 ? 2 : t > 8.6 && t < 9.4 ? 1 : t > 7.8 && t < 8.6 ? 0 : -1;
    K.panel(40, 84, 600, 222, 'order.mjs');
    K.code(code, 62, 132, { size: 20, lh: 1.55, n: K.typed(t, code, [0.8, 2, 3.2, 4.4, 5.8], 32), t: t, w: 570, hi: hi });
    var L = [['nextTick queue', P.warm], ['promise microtasks', P.purple], ['timers phase', P.acc], ['check phase', P.green]];
    L.forEach(function (l, i) {
      var y = 120 + i * 78, a = K.p(t, 7.6 + i * 0.2);
      K.box(700, y - 28, 540, 56, { fill: P.code, stroke: l[1], r: 10, a: a });
      K.text(l[0], 722, y, { size: 18, weight: 700, color: l[1], a: a });
    });
    /* code line → lane, appear time, leave time (into Output) */
    var F = [['timeout', 0, 2, 8, 20], ['immediate', 1, 3, 8.8, 21], ['nextTick', 2, 0, 9.6, 13.8], ['promise', 3, 1, 10.4, 15.6]];
    F.forEach(function (f) {
      var ty = 120 + f[2] * 78, u = K.back((t - f[3]) / 0.5), out = K.p(t, f[4], 0.5);
      if (u <= 0) return;
      K.chip(f[0], 1140 + out * 60, ty, { s: u, mono: true, size: 18, stroke: L[f[2]][1], a: (1 - out) * K.clamp(u) });
    });
    K.panel(40, 330, 600, 260, 'Output', { a: K.p(t, 7.6) });
    var O = [['sync', 11.4, P.ink], ['nextTick', 14.2, P.warm], ['promise', 16, P.purple], ['timeout', 20.4, P.acc], ['immediate', 21.4, P.green]];
    O.forEach(function (o, i) { K.text(o[0], 68, 384 + i * 38, { size: 21, mono: true, color: o[2], a: K.p(t, o[1], 0.3) }); });
    K.text('1st', 620, 422, { size: 16, weight: 700, color: P.warm, align: 'right', a: K.p(t, 14.4) });
    K.text('2nd', 620, 460, { size: 16, weight: 700, color: P.purple, align: 'right', a: K.p(t, 16.2) });
    K.text('← either order here', 250, 517, { size: 18, color: P.warm, a: K.p(t, 22.2) });
    K.text('drained after every callback:', 700, 446, { size: 18, color: P.ink, a: K.p(t, 13.2) });
    K.text('nextTick first, then promises', 700, 476, { size: 18, color: P.warm, a: K.p(t, 13.6) });
    var c = K.p(t, 22.6);
    K.box(700, 506, 540, 80, { fill: P.code, stroke: P.line, a: c });
    K.text('setTimeout 0 really waits ≥ 1 ms;', 722, 532, { size: 17, a: c });
    K.text('has 1 ms passed when the loop starts?', 722, 562, { size: 17, color: P.muted, a: c });
  } },

/* 9 ─ inside I/O, and nextTick starvation */
{ d: 25, title: 'Inside an I/O callback',
  caps: [
    [0.3, 'Inside an I/O callback, the order is fixed. The callback itself runs in the poll phase.'],
    [6.5, 'The next phase is check, so the immediate always prints first. The timeout waits for the next turn of the loop.'],
    [13, 'nextTick is not a promise microtask: it has its own queue. Calling it recursively starves I/O completely.'],
    [19, 'Rule of thumb: await for flow, setImmediate to yield inside long loops, nextTick only for rare cases.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, code = ['fs.readFile(file, () => {', '  setTimeout(() => log("timeout"), 0);', '  setImmediate(() => log("immediate"));', '});'];
    K.panel(40, 84, 600, 196, 'io.js');
    K.code(code, 62, 132, { size: 20, lh: 1.55, n: K.typed(t, code, [0.8, 1.8, 3, 4.2], 34), t: t, w: 570, hi: t > 7.4 && t < 9.8 ? 2 : t > 10.4 && t < 13 ? 1 : -1 });
    var names = ['timers', 'pending', 'poll', 'check', 'close'];
    names.forEach(function (n, i) {
      var x = 690 + i * 110, a = K.p(t, 0.6 + i * 0.2);
      K.box(x, 100, 98, 56, { stroke: i === 2 ? P.blue : i === 3 ? P.green : P.line, a: a });
      K.text(n, x + 49, 128, { size: 17, weight: 700, align: 'center', a: a });
      if (i) K.arrow(x - 12, 128, x - 2, 128, { color: P.muted, a: a, head: 8, lw: 2 });
    });
    /* marker: poll → check → (wrap) → timers */
    var px = 959 + 110 * K.p(t, 7, 0.8) - 330 * K.p(t, 10.4, 0.7);
    if (t > 3.6) { g.save(); g.globalAlpha *= K.p(t, 3.6, 0.4); g.fillStyle = P.warm; g.beginPath(); g.moveTo(px, 172); g.lineTo(px - 11, 190); g.lineTo(px + 11, 190); g.closePath(); g.fill(); g.restore(); }
    K.text('callback runs here', 959, 210, { size: 16, color: P.blue, align: 'center', a: K.win(t, 4, 6.8) });
    K.text('next turn', 739, 210, { size: 16, color: P.warm, align: 'center', a: K.win(t, 11, 13) });
    K.panel(690, 236, 550, 120, 'Output', { a: K.p(t, 7) });
    K.text('immediate', 716, 286, { size: 21, mono: true, color: P.green, a: K.p(t, 8.6, 0.3) });
    K.text('always first inside I/O', 1218, 286, { size: 16, color: P.green, align: 'right', a: K.p(t, 9.2) });
    K.text('timeout', 716, 324, { size: 21, mono: true, color: P.acc, a: K.p(t, 11.4, 0.3) });
    /* starvation */
    var s = K.p(t, 13.2);
    K.box(40, 304, 600, 286, { fill: P.code, stroke: P.red, a: s });
    var sc = ['function spin() {', '  process.nextTick(spin);', '}'];
    K.code(sc, 64, 324, { size: 19, lh: 1.5, n: K.typed(t, sc, [13.6, 14.3, 15.2], 30), t: t, a: s });
    var spin = K.p(t, 15.6);
    K.chip('spin()', 110, 486, { mono: true, size: 19, stroke: P.warm, a: spin });
    K.chip('nextTick', 290, 486, { mono: true, size: 19, stroke: P.warm, a: spin });
    K.curve(150, 466, 200, 410, 240, 466, { color: P.warm, a: spin, p: spin, lw: 2.5, head: 10 });
    K.curve(250, 506, 200, 562, 150, 506, { color: P.warm, a: spin, p: K.p(t, 16, 0.6), lw: 2.5, head: 10 });
    if (t > 16.6) {
      var u = ((t - 16.6) * 0.8) % 1, v = u < 0.5 ? u * 2 : (u - 0.5) * 2, top = u < 0.5;
      var x0 = top ? 150 : 250, x2 = top ? 240 : 150, y0 = top ? 466 : 506, y2 = top ? 466 : 506, cy2 = top ? 410 : 562;
      var px = (1 - v) * (1 - v) * x0 + 2 * v * (1 - v) * 200 + v * v * x2, py = (1 - v) * (1 - v) * y0 + 2 * v * (1 - v) * cy2 + v * v * y2;
      g.save(); g.fillStyle = P.warm; g.beginPath(); g.arc(px, py, 6, 0, 7); g.fill(); g.restore();
    }
    K.lock(420, 488, 1, P.red, K.p(t, 16.6));
    K.text('I/O never runs', 446, 486, { size: 19, weight: 700, color: P.red, a: K.p(t, 16.6) });
    K.text('promises loop the same way; setImmediate does not', 64, 560, { size: 16, color: P.muted, a: K.p(t, 17.4) });
    /* rules */
    var R = [['await / promises for flow', true, P.ink], ['setImmediate to yield in long loops', true, P.ink], ['nextTick: rare "after this operation" cases', null, P.warm]];
    K.box(690, 384, 550, 206, { fill: false, stroke: P.acc, a: K.p(t, 19.2) });
    K.text('Rule of thumb', 714, 414, { size: 19, weight: 700, color: P.acc, a: K.p(t, 19.2) });
    R.forEach(function (r, i) {
      var q = K.p(t, 19.6 + i * 1.2), y = 460 + i * 44;
      if (r[1]) K.mark(728, y, true, 0.75, q); else { g.save(); g.globalAlpha *= q; g.fillStyle = P.warm; g.beginPath(); g.arc(728, y, 11, 0, 7); g.fill(); g.restore(); }
      K.text(r[0], 752, y, { size: 18, color: r[2], a: q });
    });
  } },

/* 10 ─ recap */
{ d: 15, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 26 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 104, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Node = V8 + libuv + C++ bindings: fs, http, process, but no DOM',
     'Import core modules with node:, read config from env (strings!)',
     'EventEmitter: on, once, emit, and always handle "error"',
     'Never block the one main thread; offload CPU work to workers',
     'Loop phases: timers, pending, poll, check, close',
     'After every callback: nextTick queue, then promise microtasks'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 26 examples with ▶ Run', 640, 540, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
