/* Day 15 in motion: streams as a hose, building and reading a stream, backpressure, AbortController and signals,
   throwing real errors, finally, error causes and classes, async errors and global handlers.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day15', {
  kicker: 'JavaScript: Zero to Architect · Day 15',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 15: process data piece by piece, cancel async work cleanly, and handle failure on purpose.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Streams & Errors', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 15 · Flow, cancel, fail well', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Streams · backpressure', 'AbortController', 'Error handling'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 370 + i * 270, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ a hose, not a bucket */
{ d: 23, title: 'Streams: a hose, not a bucket',
  caps: [
    [0.3, 'A stream is a hose, not a bucket. Instead of loading everything into memory, you handle data chunk by chunk as it arrives.'],
    [8, 'Web Streams have three parts: a ReadableStream source, a TransformStream in the middle, and a WritableStream sink.'],
    [15, 'Connect them with pipeThrough and pipeTo. A fetch response body is already a ReadableStream.']],
  draw: function (K, t) {
    var P = K.P;
    /* bucket vs hose */
    var a = K.p(t, 0.6);
    K.text('bucket', 60, 110, { size: 20, weight: 700, color: P.red, a: a });
    K.code(['await res.json()'], 160, 98, { size: 19, a: a });
    var fill = K.p(t, 1, 3.5);
    K.box(400, 92, 300, 36, { fill: P.code, stroke: P.red, r: 8, a: a });
    K.box(402, 94, 296 * fill, 32, { fill: P.red, r: 7, a: a * 0.6 });
    K.text('2 GB in memory before the first byte is used', 720, 110, { size: 17, color: P.red, a: K.p(t, 3) });
    var h = K.p(t, 4);
    K.text('hose', 60, 170, { size: 20, weight: 700, color: P.green, a: h });
    K.code(['res.body'], 160, 158, { size: 19, a: h });
    K.box(400, 152, 820, 36, { fill: P.code, stroke: P.green, r: 8, a: h });
    for (var i = 0; i < 7; i++) {
      var x = 410 + ((t * 120 + i * 118) % 800);
      if (t > 4.4) K.box(x, 160, 40, 20, { fill: P.green, r: 5, a: h * 0.85 });
    }
    K.text('small, steady memory', 1210, 214, { size: 16, color: P.green, align: 'right', a: K.p(t, 5.6) });
    /* pipeline */
    var S = [['ReadableStream', 'source: fetch body, file', P.blue, 8.4], ['TransformStream', 'decode, parse, compress', P.warm, 10], ['WritableStream', 'sink: file, DOM, socket', P.green, 11.6]];
    S.forEach(function (s, i) {
      var q = K.back((t - s[3]) / 0.6), x = 60 + i * 420;
      if (q <= 0) return;
      K.g.save(); K.g.translate(x + 170, 320); K.g.scale(q, q); K.g.translate(-x - 170, -320);
      K.box(x, 268, 340, 104, { stroke: s[2], a: K.clamp(q) });
      K.text(s[0], x + 170, 304, { size: 22, weight: 700, mono: true, color: s[2], align: 'center', a: K.clamp(q) });
      K.text(s[1], x + 170, 340, { size: 17, color: P.muted, align: 'center', a: K.clamp(q) });
      K.g.restore();
      if (i) K.arrow(x - 76, 320, x - 8, 320, { p: K.p(t, s[3] - 0.2, 0.4), color: P.muted });
    });
    var c = K.p(t, 15.2), code = ['const res = await fetch("/big.log");', 'await res.body', '  .pipeThrough(new TextDecoderStream())', '  .pipeTo(lineCounter);'];
    K.panel(60, 404, 760, 176, 'pipe.js', { a: c });
    K.code(code, 86, 446, { size: 20, lh: 1.45, n: K.typed(t, code, [15.4, 16.8, 17.6, 19], 34), t: t, a: c });
    K.text('res.body is a ReadableStream', 1030, 470, { size: 18, color: P.blue, align: 'center', a: K.p(t, 17) });
    K.text('errors and cleanup flow through the pipe', 1030, 510, { size: 16, color: P.muted, align: 'center', a: K.p(t, 19.6) });
  } },

/* 3 ─ build and read a stream */
{ d: 24, title: 'Build and read a stream',
  caps: [
    [0.3, 'Here a ReadableStream enqueues four numbers, then closes. A TransformStream doubles every chunk.'],
    [9, 'A reader pulls chunks one at a time. Each read gives a value, until done is true.'],
    [17, 'Modern browsers and Node also let you loop over a stream with for await.']],
  draw: function (K, t) {
    var P = K.P, code = ['const source = new ReadableStream({', '  start(c) { [1, 2, 3, 4].forEach((n) => c.enqueue(n)); c.close(); }', '});',
      'const doubler = new TransformStream({', '  transform(chunk, c) { c.enqueue(chunk * 2); }', '});',
      'const reader = source.pipeThrough(doubler).getReader();', 'for (;;) {', '  const { value, done } = await reader.read();', '  if (done) break;  out.push(value);', '}'];
    var hi = t > 17 ? -1 : t > 9.2 ? 8 : t > 4.4 ? 4 : t > 1.2 ? 1 : -1;
    K.panel(40, 84, 820, 420, 'stream.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 126, { size: 18, lh: 1.6, n: K.typed(t, code, [0.6, 1, 3, 3.3, 4.2, 5.6, 9.2, 10.4, 10.8, 12, 13], 50), t: t, hi: hi, w: 790, a: K.p(t, 0.2) });
    /* chunk flow on the right */
    var a = K.p(t, 2.2);
    K.text('source', 920, 112, { size: 17, weight: 700, color: P.blue, a: a });
    K.text('×2', 1052, 112, { size: 17, weight: 700, color: P.warm, a: K.p(t, 5) });
    K.text('reader', 1150, 112, { size: 17, weight: 700, color: P.green, a: K.p(t, 9.4) });
    [1, 2, 3, 4].forEach(function (n, i) {
      var y = 160 + i * 64, q = K.back((t - 2.4 - i * 0.4) / 0.4);
      if (q > 0) K.chip(String(n), 945, y, { mono: true, size: 20, stroke: P.blue, s: q });
      K.arrow(980, y, 1040, y, { p: K.p(t, 6 + i * 0.5, 0.4), color: P.warm, lw: 2, head: 9 });
      var d = K.back((t - 6.3 - i * 0.5) / 0.4);
      if (d > 0) K.chip(String(n * 2), 1075, y, { mono: true, size: 20, stroke: P.warm, s: d });
      K.arrow(1110, y, 1150, y, { p: K.p(t, 10.4 + i * 1.3, 0.4), color: P.green, lw: 2, head: 9 });
      K.mark(1180, y, true, 0.6, K.p(t, 10.8 + i * 1.3));
    });
    var r = ['{ value: 2, done: false }', '{ value: 4, done: false }', '{ value: 6, done: false }', '{ value: 8, done: false }', '{ done: true }'];
    var k = Math.floor((t - 10.6) / 1.3);
    if (t > 10.6 && t < 17) K.text('read() → ' + r[Math.min(4, k)], 920, 430, { size: 16, mono: true, color: k >= 4 ? P.warm : P.ink });
    K.text('out = [2, 4, 6, 8]', 1050, 470, { size: 20, mono: true, color: P.green, align: 'center', a: K.p(t, 16.2) });
    var f = K.p(t, 17.2), fa = ['for await (const chunk of source.pipeThrough(doubler)) out.push(chunk);'];
    K.panel(40, 524, 1200, 62, '', { a: f, stroke: P.green });
    K.code(fa, 64, 542, { size: 19, n: K.typed(t, fa, [17.6], 40), t: t, a: f });
  } },

/* 4 ─ backpressure */
{ d: 23, title: 'Backpressure',
  caps: [
    [0.3, 'What if the source is faster than the sink? Without limits, chunks pile up in memory.'],
    [7.5, 'Backpressure flows backwards. The slow sink’s queue fills up, and it signals upstream to pause.'],
    [15, 'Each stage stops pulling, so memory stays flat. pipeTo and Node’s pipeline handle this for you.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var B = [['fast source', 60, P.blue], ['transform', 480, P.warm], ['slow sink', 900, P.green]];
    B.forEach(function (b, i) {
      var a = K.p(t, 0.4 + i * 0.3);
      K.box(b[1], 110, 320, 110, { stroke: b[2], a: a });
      K.text(b[0], b[1] + 160, 140, { size: 21, weight: 700, color: b[2], align: 'center', a: a });
      if (i) K.arrow(b[1] - 90, 165, b[1] - 10, 165, { color: P.muted, a: a });
    });
    /* queue in front of the sink: grows without backpressure, then capped */
    var bp = K.p(t, 8, 1), grow = K.clamp((t - 1.2) / 6);
    var n = Math.floor(grow * 12 * (1 - bp) + Math.min(4, grow * 12) * bp);
    K.text('queue', 640, 262, { size: 17, color: P.muted, align: 'center', a: K.p(t, 1) });
    for (var i = 0; i < 12; i++) {
      if (i >= n) break;
      K.box(140 + i * 86, 286, 74, 40, { fill: i >= 4 ? 'rgba(252,129,129,.35)' : 'rgba(99,179,237,.35)', stroke: i >= 4 ? P.red : P.blue, r: 6 });
    }
    K.text('memory keeps growing', 640, 360, { size: 18, color: P.red, align: 'center', a: K.win(t, 4, 8.4) });
    /* the backwards signal */
    var sig = K.p(t, 8.6, 1.2);
    K.curve(1060, 230, 760, 470, 220, 230, { p: sig, color: P.warm, dash: [8, 6], lw: 3 });
    K.text('desiredSize ≤ 0: please pause', 640, 400, { size: 19, color: P.warm, align: 'center', a: K.p(t, 9.6) });
    K.chip('paused', 220, 196, { size: 17, stroke: P.warm, color: P.warm, a: K.p(t, 10.6) });
    K.chip('paused', 640, 196, { size: 17, stroke: P.warm, color: P.warm, a: K.p(t, 11) });
    /* memory graph */
    var ga = K.p(t, 15.2);
    K.box(60, 452, 560, 130, { fill: P.code, stroke: P.line, a: ga });
    K.text('memory', 80, 474, { size: 15, color: P.muted, a: ga });
    if (ga > 0) {
      g.save(); g.globalAlpha *= ga; g.lineWidth = 3;
      g.strokeStyle = P.red; g.beginPath(); g.moveTo(80, 570); g.lineTo(600, 470); g.stroke();
      g.strokeStyle = P.green; g.beginPath(); g.moveTo(80, 570); g.lineTo(180, 540); g.lineTo(600, 540); g.stroke(); g.restore();
    }
    K.text('no backpressure', 170, 474, { size: 15, color: P.red, a: ga });
    K.text('with backpressure: flat', 330, 474, { size: 15, color: P.green, a: ga });
    var c = K.p(t, 16.4), code = ['await readable.pipeTo(writable);', '// Node: await pipeline(src, transform, dest);'];
    K.panel(660, 452, 580, 130, '', { a: c });
    K.code(code, 684, 478, { size: 18, lh: 1.6, n: K.typed(t, code, [16.6, 18], 34), t: t, a: c });
  } },

/* 5 ─ AbortController */
{ d: 25, title: 'AbortController',
  caps: [
    [0.3, 'AbortController is a stop button that you can hand to any async work.'],
    [5.5, 'Pass its signal to fetch. Calling abort makes that fetch reject with an AbortError.'],
    [12, 'Use it to cancel the previous search when the user types again, so a stale response never replaces a newer one.'],
    [19.5, 'Treat AbortError as normal control flow, not as a failure to report.']],
  draw: function (K, t) {
    var P = K.P, code = ['let ac;', 'async function search(q) {', '  ac?.abort();               // cancel the previous one', '  ac = new AbortController();', '  try {',
      '    const res = await fetch(`/api?q=${q}`, { signal: ac.signal });', '    show(await res.json());', '  } catch (e) {', '    if (e.name !== "AbortError") report(e);', '  }', '}'];
    var hi = t > 19.5 ? 8 : t > 12.4 ? 2 : t > 5.6 ? 5 : t > 1.4 ? 3 : -1;
    K.panel(40, 84, 760, 420, 'search.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 126, { size: 18, lh: 1.6, n: K.typed(t, code, [0.6, 0.8, 1.2, 1.6, 2.2, 2.6, 3.6, 4, 4.3, 4.8, 4.9], 60), t: t, hi: hi, w: 730, a: K.p(t, 0.2) });
    var b = K.back((t - 0.8) / 0.6);
    if (b > 0) {
      K.g.save(); K.g.globalAlpha *= K.clamp(b); K.g.fillStyle = P.red; K.g.beginPath(); K.g.arc(1010, 150, 42 * b, 0, 7); K.g.fill(); K.g.restore();
      K.text('STOP', 1010, 151, { size: 20, weight: 800, color: P.bg, align: 'center', a: K.clamp(b) });
    }
    K.text('ac.abort()', 1010, 216, { size: 19, mono: true, align: 'center', a: K.p(t, 2) });
    var f = K.p(t, 6.4);
    K.text('fetch → rejects: AbortError', 1010, 262, { size: 18, mono: true, color: P.red, align: 'center', a: f });
    /* search box typing */
    var s = K.p(t, 12.4), q = ['j', 'ja', 'jav', 'java'], k = Math.max(0, Math.min(3, Math.floor((t - 12.8) / 1.2)));
    K.box(840, 300, 400, 48, { fill: P.code, stroke: P.blue, a: s });
    K.text(t > 12.8 ? q[k] : '', 860, 324, { size: 20, mono: true, a: s });
    q.forEach(function (w, i) {
      var y = 376 + i * 34, on = K.p(t, 12.8 + i * 1.2, 0.3), killed = i < 3 && t > 12.8 + (i + 1) * 1.2;
      K.text('GET ?q=' + w, 860, y, { size: 17, mono: true, color: killed ? P.muted : P.green, a: on });
      if (killed) { K.box(856, y - 1, 150, 2, { fill: P.red, r: 1, a: on }); K.text('aborted', 1030, y, { size: 16, color: P.red, a: on }); }
      if (i === 3) K.text('shown', 1030, y, { size: 16, color: P.green, a: K.p(t, 17.6) });
    });
    var n = K.p(t, 19.8);
    K.box(40, 524, 1200, 60, { fill: 'rgba(104,211,145,.08)', stroke: P.green, a: n });
    K.mark(72, 554, true, 0.8, n);
    K.text('AbortError means "we cancelled on purpose": skip error reporting', 100, 554, { size: 19, a: n });
  } },

/* 6 ─ signals everywhere */
{ d: 24, title: 'Signals everywhere',
  caps: [
    [0.3, 'AbortSignal.timeout aborts after a deadline. AbortSignal.any combines several signals into one.'],
    [8, 'A signal can also remove event listeners. And your own async functions can honour it: check it, and listen for its abort event.'],
    [17, 'A signal is one-shot. Once aborted it stays aborted, so create a new controller for the next operation.']],
  draw: function (K, t) {
    var P = K.P;
    var c1 = ['fetch(url, { signal: AbortSignal.timeout(5000) });', 'const signal = AbortSignal.any([userSignal, AbortSignal.timeout(5000)]);'];
    K.panel(40, 84, 1200, 110, '', { a: K.p(t, 0.2) });
    K.code(c1, 64, 102, { size: 19, lh: 1.6, n: K.typed(t, c1, [0.6, 3.6], 40), t: t, a: K.p(t, 0.2) });
    K.text('deadline', 1210, 117, { size: 16, color: P.warm, align: 'right', a: K.p(t, 2.4) });
    K.text('user OR deadline', 1210, 149, { size: 16, color: P.warm, align: 'right', a: K.p(t, 5.8) });
    var c2 = ['el.addEventListener("click", onClick, { signal });  // abort() removes it'];
    K.panel(40, 214, 1200, 60, '', { a: K.p(t, 8.2) });
    K.code(c2, 64, 232, { size: 19, n: K.typed(t, c2, [8.4], 50), t: t, a: K.p(t, 8.2) });
    var c3 = ['function abortableSleep(ms, signal) {', '  return new Promise((resolve, reject) => {', '    signal.throwIfAborted();', '    const id = setTimeout(resolve, ms);',
      '    signal.addEventListener("abort", () => {', '      clearTimeout(id); reject(signal.reason);', '    }, { once: true });', '  });', '}'];
    var a3 = K.p(t, 10.4);
    K.panel(40, 294, 760, 290, 'your own code', { a: a3 });
    K.code(c3, 64, 334, { size: 17, lh: 1.5, n: K.typed(t, c3, [10.6, 11.2, 12, 12.8, 13.6, 14.4, 15.2, 15.8, 16], 50), t: t, hi: t > 12 && t < 13.6 ? 2 : t > 14.4 && t < 17 ? 5 : -1, w: 730, a: a3 });
    /* one-shot */
    var s = K.p(t, 17.2);
    K.box(840, 294, 400, 290, { fill: P.code, stroke: P.red, a: s });
    K.text('one-shot', 1040, 322, { size: 20, weight: 700, color: P.red, align: 'center', a: s });
    K.text('signal.aborted', 870, 372, { size: 18, mono: true, a: s });
    K.text('false', 1200, 372, { size: 18, mono: true, color: P.green, align: 'right', a: s * (1 - K.p(t, 18.4, 0.3)) });
    K.text('true', 1200, 372, { size: 18, mono: true, color: P.red, align: 'right', a: K.p(t, 18.4, 0.3) });
    K.text('ac.abort()', 870, 420, { size: 18, mono: true, color: P.warm, a: K.p(t, 18) });
    K.text('stays aborted forever', 870, 470, { size: 18, color: P.muted, a: K.p(t, 19) });
    K.chip('next job: new AbortController()', 1040, 534, { mono: true, size: 15, stroke: P.green, a: K.p(t, 20) });
  } },

/* 7 ─ throw real errors, finally */
{ d: 25, title: 'Throw errors, and finally',
  caps: [
    [0.3, 'Always throw Error objects, not strings. You get a name, a message and a stack trace.'],
    [7, 'Built-in types tell you what went wrong: TypeError, RangeError, SyntaxError, and more.'],
    [13, 'finally always runs, even after a return. A return inside finally overrides the earlier result, so f returns "finally".']],
  draw: function (K, t) {
    var P = K.P;
    var bad = K.p(t, 0.6), good = K.p(t, 2.6);
    K.box(40, 84, 580, 150, { fill: P.code, stroke: P.red, a: bad });
    K.code(['throw "load failed";'], 64, 106, { size: 20, a: bad });
    K.mark(78, 180, false, 0.8, K.p(t, 1.6)); K.text('a bare string: no stack, no name', 104, 180, { size: 18, color: P.red, a: K.p(t, 1.6) });
    K.box(660, 84, 580, 150, { fill: P.code, stroke: P.green, a: good });
    K.code(['throw new Error("load failed");'], 684, 106, { size: 20, a: good });
    K.text('e.name     "Error"', 700, 160, { size: 17, mono: true, a: K.p(t, 3.6) });
    K.text('e.message  "load failed"', 700, 186, { size: 17, mono: true, a: K.p(t, 4.2) });
    K.text('e.stack    at load (app.js:12)…', 700, 212, { size: 17, mono: true, color: P.muted, a: K.p(t, 4.8) });
    [['TypeError', 'null.x, wrong type'], ['RangeError', 'bad length or radix'], ['SyntaxError', 'JSON.parse("{bad")'], ['ReferenceError', 'undefined name'], ['AggregateError', 'Promise.any all failed']].forEach(function (e, i) {
      var q = K.back((t - 7.4 - i * 0.6) / 0.5), x = 40 + i * 244;
      if (q <= 0) return;
      K.chip(e[0], x + 112, 280, { mono: true, size: 17, stroke: P.red, s: q });
      K.text(e[1], x + 112, 318, { size: 15, color: P.muted, align: 'center', a: K.clamp(q) });
    });
    var c = K.p(t, 13.2), code = ['function f() {', '  try { return "try"; }', '  finally { return "finally"; }', '}', 'f();   // "finally"'];
    K.panel(40, 360, 640, 222, 'finally.js', { a: c });
    K.code(code, 66, 402, { size: 20, lh: 1.5, n: K.typed(t, code, [13.4, 14, 15.2, 16.4, 16.6], 34), t: t, hi: t > 17.4 ? 2 : -1, w: 600, a: c });
    K.text('try returns "try"…', 720, 410, { size: 19, a: K.p(t, 15) });
    K.text('…finally runs on the way out…', 720, 456, { size: 19, color: P.warm, a: K.p(t, 16.4) });
    K.text('…and its return wins.', 720, 502, { size: 19, color: P.red, a: K.p(t, 18) });
    K.text('a return in finally can even swallow a thrown error', 720, 552, { size: 16, color: P.muted, a: K.p(t, 19.6) });
  } },

/* 8 ─ cause and classes */
{ d: 23, title: 'Error cause and classes',
  caps: [
    [0.3, 'Wrap low-level errors with context. The cause option keeps the original error attached.'],
    [8, 'A small error class with its own name lets callers check what failed, with instanceof.'],
    [15, 'Error.isError, new in ES2026, detects errors reliably, even across iframes where instanceof fails.']],
  draw: function (K, t) {
    var P = K.P, code = ['try {', '  JSON.parse("{bad json");', '} catch (e) {', '  throw new AppError("Could not load settings", { cause: e });', '}'];
    K.panel(40, 84, 860, 200, 'settings.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 126, { size: 18, lh: 1.6, n: K.typed(t, code, [0.6, 1, 2, 2.4, 3.6], 60), t: t, hi: t > 1 && t < 8 ? 3 : -1, w: 830, a: K.p(t, 0.2) });
    var cl = ['class AppError extends Error {', '  constructor(msg, opts) { super(msg, opts); this.name = "AppError"; }', '}'];
    K.panel(40, 300, 860, 120, '', { a: K.p(t, 8.2) });
    K.code(cl, 64, 316, { size: 18, lh: 1.6, n: K.typed(t, cl, [8.4, 9.4, 10.8], 60), t: t, hi: t > 9.4 && t < 15 ? 1 : -1, w: 830, a: K.p(t, 8.2) });
    /* nested error boxes */
    var o = K.p(t, 4.2);
    K.box(940, 84, 300, 200, { stroke: P.warm, a: o });
    K.text('AppError', 960, 110, { size: 20, weight: 700, color: P.warm, a: o });
    K.text('Could not load settings', 960, 140, { size: 15, a: o });
    var i2 = K.p(t, 5.4);
    K.box(960, 168, 260, 96, { fill: P.code, stroke: P.red, a: i2 });
    K.text('.cause: SyntaxError', 978, 194, { size: 16, mono: true, color: P.red, a: i2 });
    K.text('Unexpected token b…', 978, 226, { size: 15, mono: true, color: P.muted, a: i2 });
    K.text('context + original', 1090, 306, { size: 16, color: P.muted, align: 'center', a: K.p(t, 6.4) });
    var ch = ['e instanceof AppError   // true', 'e instanceof Error      // true', 'e.cause.name            // "SyntaxError"'];
    var c = K.p(t, 11.6);
    K.panel(40, 440, 660, 142, '', { a: c });
    K.code(ch, 64, 456, { size: 19, lh: 1.55, n: K.typed(t, ch, [11.8, 12.8, 13.8], 40), t: t, a: c });
    var x = K.p(t, 15.2);
    K.box(740, 440, 500, 142, { fill: P.code, stroke: P.acc, a: x });
    K.code(['Error.isError(err)   // true'], 764, 458, { size: 19, a: x });
    K.mark(770, 516, true, 0.7, K.p(t, 16.4)); K.text('works across iframes and realms', 794, 516, { size: 17, a: K.p(t, 16.4) });
    K.mark(770, 546, false, 0.7, K.p(t, 17.6)); K.text('instanceof Error can fail there', 794, 546, { size: 17, color: P.red, a: K.p(t, 17.6) });
  } },

/* 9 ─ async errors and global handlers */
{ d: 25, title: 'Async errors and global handlers',
  caps: [
    [0.3, 'try/catch catches an awaited rejection, but not a throw inside a later callback such as setTimeout.'],
    [8.5, 'Report whatever slips through with global handlers: error and unhandledrejection in the browser, process events in Node.'],
    [16.5, 'Handle operational errors, like a network failure, where you can recover. Programmer errors are bugs: fail fast, and fix them.']],
  draw: function (K, t) {
    var P = K.P;
    var a = ['try { await fetchUser(); }', 'catch (e) { /* caught */ }'], b = ['try { setTimeout(() => { throw err; }); }', 'catch (e) { /* never runs */ }'];
    K.panel(40, 84, 580, 120, '', { a: K.p(t, 0.4), stroke: P.green });
    K.code(a, 64, 108, { size: 19, lh: 1.6, n: K.typed(t, a, [0.6, 1.6], 40), t: t, a: K.p(t, 0.4) });
    K.mark(590, 112, true, 0.8, K.p(t, 3));
    K.panel(660, 84, 580, 120, '', { a: K.p(t, 3.6), stroke: P.red });
    K.code(b, 684, 108, { size: 19, lh: 1.6, n: K.typed(t, b, [3.8, 5.2], 40), t: t, a: K.p(t, 3.6) });
    K.mark(1210, 112, false, 0.8, K.p(t, 6.4));
    K.text('the callback runs later, on a fresh stack', 950, 228, { size: 16, color: P.red, align: 'center', a: K.p(t, 6.8) });
    var g = K.p(t, 8.7), code = ['window.addEventListener("error", (e) => report(e.error));', 'window.addEventListener("unhandledrejection", (e) => report(e.reason));', '// Node: process.on("uncaughtException" | "unhandledRejection", …)'];
    K.panel(40, 258, 1200, 140, 'global handlers: report, then fail safely', { a: g });
    K.code(code, 64, 300, { size: 19, lh: 1.5, n: K.typed(t, code, [9, 10.6, 12.4], 44), t: t, a: g });
    var o = K.p(t, 16.7), p = K.p(t, 18.8);
    K.box(40, 420, 580, 162, { stroke: P.warm, a: o });
    K.text('Operational error', 64, 448, { size: 21, weight: 700, color: P.warm, a: o });
    K.text('network down, bad input, timeout', 64, 486, { size: 17, color: P.muted, a: o });
    K.text('→ handle: retry, fallback, tell the user', 64, 530, { size: 18, a: K.p(t, 17.6) });
    K.box(660, 420, 580, 162, { stroke: P.red, a: p });
    K.text('Programmer error', 684, 448, { size: 21, weight: 700, color: P.red, a: p });
    K.text('undefined is not a function, wrong arguments', 684, 486, { size: 17, color: P.muted, a: p });
    K.text('→ a bug: fail fast, report, fix the code', 684, 530, { size: 18, a: K.p(t, 19.6) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 15 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Streams move data in chunks: source, transform, sink',
     'Backpressure pauses fast producers, so memory stays flat',
     'AbortController and signals cancel fetch, listeners, your code',
     'Throw Error objects; finally runs last; add a cause',
     'try/catch sees awaited errors; report the rest globally'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(210, y, true, 0.9, q);
      K.text(s, 242 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 15 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
