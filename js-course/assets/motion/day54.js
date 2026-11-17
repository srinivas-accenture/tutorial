/* Day 54 in motion: WebAssembly basics and linear memory, SharedArrayBuffer and Atomics, and how tools tokenize, parse and walk an AST. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day54', {
  kicker: 'JavaScript: Zero to Architect · Day 54',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 54: where JavaScript meets low-level code, and how the tools you use every day read your programs.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Under the hood', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 54 · Advanced runtime and tools', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['WebAssembly', 'Atomics', 'Parsers and ASTs'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ what wasm is */
{ d: 24, title: 'WebAssembly',
  caps: [
    [0.3, 'WebAssembly is a compact binary format. You compile Rust, C or C++ ahead of time, and the engine validates it and runs it in a sandbox.'],
    [7.5, 'JavaScript loads a module with instantiateStreaming, then calls its exported functions like normal functions.'],
    [13.5, 'Wasm only knows numbers: i32, i64, f32 and f64. An i64 arrives in JavaScript as a BigInt, and i32 math wraps around.'],
    [19, 'It shines for CPU-heavy kernels and existing native libraries, not for DOM work or tiny functions called constantly. Benchmark first.']],
  draw: function (K, t) {
    var P = K.P;
    K.chip('Rust · C · C++', 130, 140, { size: 18, stroke: P.purple, a: K.p(t, 0.6) });
    K.arrow(212, 140, 262, 140, { p: K.p(t, 1.2), color: P.muted });
    K.box(270, 112, 130, 56, { stroke: P.line, a: K.p(t, 1.4) }); K.text('compiler', 335, 140, { size: 18, weight: 700, align: 'center', a: K.p(t, 1.4) });
    K.arrow(406, 140, 456, 140, { p: K.p(t, 2), color: P.muted });
    K.chip('add.wasm', 530, 140, { size: 18, mono: true, stroke: P.warm, color: P.warm, a: K.p(t, 2.4) });
    K.text('00 61 73 6D 01 00 00 00 …', 530, 186, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 2.8) });
    K.arrow(604, 140, 664, 140, { p: K.p(t, 3.4), color: P.muted });
    K.box(672, 108, 240, 64, { stroke: P.acc, a: K.p(t, 3.6) }); K.text('engine: validate,', 792, 130, { size: 17, align: 'center', a: K.p(t, 3.6) }); K.text('compile', 792, 152, { size: 17, align: 'center', a: K.p(t, 3.6) });
    K.arrow(918, 140, 968, 140, { p: K.p(t, 4.4), color: P.muted });
    K.box(976, 100, 264, 80, { fill: 'rgba(79,209,197,.06)', stroke: P.green, dash: [7, 6], a: K.p(t, 4.8) });
    K.text('sandbox: no access', 1108, 128, { size: 17, color: P.green, align: 'center', a: K.p(t, 4.8) });
    K.text('except what you import', 1108, 154, { size: 17, color: P.green, align: 'center', a: K.p(t, 5.2) });
    var code = ['const { instance } = await WebAssembly', '  .instantiateStreaming(fetch("add.wasm"), imports);', 'instance.exports.add(2, 3);'];
    K.panel(40, 220, 700, 146, 'main.js', { a: K.p(t, 7.6) });
    K.code(code, 64, 262, { size: 19, lh: 1.45, n: K.typed(t, code, [7.8, 9, 10.6], 40), t: t, a: K.p(t, 7.6) });
    K.panel(780, 220, 460, 146, 'Console', { a: K.p(t, 8) });
    K.text('> instance.exports.add(2, 3)', 804, 268, { size: 18, mono: true, a: K.p(t, 11.2) });
    K.text('5', 804, 306, { size: 22, mono: true, weight: 700, color: P.warm, a: K.p(t, 12) });
    ['i32', 'i64', 'f32', 'f64'].forEach(function (c, i) { K.chip(c, 90 + i * 100, 412, { size: 20, mono: true, stroke: P.acc, a: K.p(t, 13.8 + i * 0.3) }); });
    K.text('i64  ↔  BigInt in JavaScript', 480, 412, { size: 19, color: P.blue, a: K.p(t, 15.6) });
    K.text('i32: 2147483647 + 1  →  -2147483648   (wraps around)', 60, 462, { size: 19, mono: true, color: P.warm, a: K.p(t, 17) });
    [['numeric kernels', P.green], ['image and video codecs', P.green], ['existing native libs', P.green], ['DOM-heavy code', P.red], ['tiny calls in hot loops', P.red]].forEach(function (c, i) {
      K.chip(c[0], [130, 350, 580, 820, 1060][i], 540, { size: 17, stroke: c[1], a: K.p(t, 19.3 + i * 0.6) });
    });
  } },

/* 3 ─ linear memory */
{ d: 25, title: 'Linear memory',
  caps: [
    [0.3, 'A module\'s memory is one big ArrayBuffer called linear memory. It is counted in pages of 64 KiB.'],
    [6.5, 'Strings and arrays cross the boundary through it: JavaScript writes the bytes, then passes a pointer and a length.'],
    [13, 'memory.grow() detaches the old buffer. A typed array made before is now empty, so create your views again.'],
    [19, 'Glue code from tools like wasm-bindgen or Emscripten does this bookkeeping for you.']],
  draw: function (K, t) {
    var P = K.P, i;
    var ma = K.p(t, 0.6);
    K.text('linear memory: one ArrayBuffer, grows in 64 KiB pages', 60, 96, { size: 17, weight: 700, color: P.muted, a: ma });
    var H = ['68', '65', '6C', '6C', '6F'];
    for (i = 0; i < 24; i++) {
      var x = 60 + i * 47, inS = i >= 8 && i < 13, w = inS ? K.p(t, 9 + (i - 8) * 0.35, 0.3) : 0;
      K.box(x, 118, 43, 46, { fill: inS && w > 0.5 ? 'rgba(246,173,85,.22)' : P.code, stroke: inS && w > 0.5 ? P.warm : P.line, r: 5, lw: 1.5, a: ma * K.p(t, 0.6 + i * 0.03) });
      if (inS) K.text(H[i - 8], x + 21, 141, { size: 16, mono: true, align: 'center', color: P.warm, a: w });
    }
    K.text('0', 60, 182, { size: 16, mono: true, color: P.muted, a: ma });
    K.text('ptr = 1024', 436, 192, { size: 16, mono: true, color: P.warm, a: K.p(t, 10.8) });
    K.box(436, 172, 231, 3, { fill: P.warm, a: K.p(t, 11.2) });
    K.text('len = 5', 667, 192, { size: 16, mono: true, color: P.warm, a: K.p(t, 11.2) });
    var code = ['const bytes = new TextEncoder().encode("hello");', 'new Uint8Array(memory.buffer, ptr, bytes.length)', '  .set(bytes);', 'exports.count_vowels(ptr, bytes.length); // 2'];
    K.panel(40, 220, 660, 150, 'strings.js', { a: K.p(t, 6.8) });
    K.code(code, 64, 260, { size: 18, lh: 1.4, n: K.typed(t, code, [7, 8.2, 9.4, 10.2], 44), t: t, a: K.p(t, 6.8) });
    K.box(740, 232, 200, 64, { stroke: P.blue, a: K.p(t, 7) }); K.text('JavaScript', 840, 264, { size: 19, weight: 700, align: 'center', a: K.p(t, 7) });
    K.box(1040, 232, 200, 64, { stroke: P.purple, a: K.p(t, 7) }); K.text('Wasm', 1140, 264, { size: 19, weight: 700, align: 'center', a: K.p(t, 7) });
    K.arrow(944, 254, 1036, 254, { p: K.p(t, 11.4), color: P.warm });
    K.text('1024, 5', 990, 318, { size: 17, mono: true, color: P.warm, align: 'center', a: K.p(t, 11.4) });
    K.arrow(1036, 280, 944, 280, { p: K.p(t, 12.2), color: P.green });
    K.text('only numbers cross', 990, 350, { size: 16, color: P.muted, align: 'center', a: K.p(t, 12.4) });
    var g2 = ['const view = new Uint8Array(memory.buffer);', 'memory.grow(1);', 'view.length;   // 0: detached!', 'const fresh = new Uint8Array(memory.buffer);'];
    K.panel(40, 396, 660, 150, 'grow.js', { a: K.p(t, 13.2), stroke: P.red });
    K.code(g2, 64, 436, { size: 18, lh: 1.4, n: K.typed(t, g2, [13.4, 14.6, 15.4, 16.6], 44), t: t, a: K.p(t, 13.2), marks: t > 15.6 ? { 2: 'rgba(252,129,129,.2)' } : null, w: 640 });
    K.mark(760, 440, false, 0.8, K.p(t, 15.8)); K.text('old view: length 0', 786, 440, { size: 18, color: P.red, a: K.p(t, 15.8) });
    K.mark(760, 490, true, 0.8, K.p(t, 17.4)); K.text('new view over the bigger buffer', 786, 490, { size: 18, color: P.green, a: K.p(t, 17.4) });
    K.chip('wasm-bindgen · Emscripten: generated glue handles pointers, strings and views', 640, 572, { size: 17, stroke: P.acc, a: K.p(t, 19.4) });
  } },

/* 4 ─ shared memory and races */
{ d: 25, title: 'Shared memory',
  caps: [
    [0.3, 'Workers normally exchange data with postMessage, which copies it. A SharedArrayBuffer lets them share the same bytes, with no copy.'],
    [7, 'Sharing memory needs cross-origin isolation: the page must be served with the COOP and COEP headers.'],
    [12.5, 'Without synchronization you get data races. Two workers running count++ can both read 5 and both write 6.'],
    [19, 'Atomics.add makes the read, the add and the write one indivisible step, so no update is lost.']],
  draw: function (K, t) {
    var P = K.P;
    var A = K.p(t, 0.6);
    [['main thread', 100], ['worker 1', 180], ['worker 2', 260]].forEach(function (b, i) {
      K.box(60, b[1] - 26, 180, 52, { stroke: i ? P.purple : P.blue, a: A }); K.text(b[0], 150, b[1], { size: 18, weight: 700, align: 'center', a: A });
    });
    K.text('postMessage(data): a copy', 270, 140, { size: 17, mono: true, color: P.muted, a: K.win(t, 1.2, 4.4) });
    var sh = K.p(t, 4.4);
    K.box(420, 120, 220, 160, { stroke: P.warm, fill: 'rgba(246,173,85,.08)', a: sh });
    K.text('SharedArrayBuffer', 530, 146, { size: 17, weight: 700, color: P.warm, align: 'center', a: sh });
    K.box(480, 184, 100, 64, { fill: P.code, stroke: P.line, a: sh }); K.text('count', 530, 172, { size: 16, mono: true, color: P.muted, align: 'center', a: sh });
    var val = t < 13.6 ? '5' : t < 16.6 ? '6' : t < 20.4 ? '6' : '7';
    K.text(val, 530, 218, { size: 26, mono: true, weight: 700, align: 'center', color: t > 20.4 ? P.green : t > 16.4 ? P.red : P.ink, a: sh });
    [100, 180, 260].forEach(function (y, i) { K.arrow(244, y, 414, 160 + i * 40, { p: K.p(t, 4.8 + i * 0.2), color: P.warm, lw: 2 }); });
    K.text('same bytes, no copy', 530, 300, { size: 16, color: P.warm, align: 'center', a: K.p(t, 5.4) });
    var hd = ['Cross-Origin-Opener-Policy: same-origin', 'Cross-Origin-Embedder-Policy: require-corp'];
    K.panel(680, 84, 560, 110, 'response headers', { a: K.p(t, 7.2) });
    K.code(hd, 704, 124, { size: 17, lh: 1.45, n: K.typed(t, hd, [7.4, 8.8], 40), t: t, a: K.p(t, 7.2) });
    K.text('crossOriginIsolated === true', 704, 226, { size: 18, mono: true, color: P.green, a: K.p(t, 10.6) });
    /* race */
    var r = K.p(t, 12.8);
    K.box(40, 330, 600, 254, { fill: P.code, stroke: P.line, a: r });
    K.text('worker 1', 130, 356, { size: 17, weight: 700, color: P.purple, align: 'center', a: r });
    K.text('worker 2', 330, 356, { size: 17, weight: 700, color: P.purple, align: 'center', a: r });
    K.text('count', 530, 356, { size: 17, weight: 700, color: P.muted, align: 'center', a: r });
    [['read 5', '', '5', 13.2], ['', 'read 5', '5', 14.2], ['write 6', '', '6', 15.2], ['', 'write 6', '6', 16.2]].forEach(function (s, i) {
      var y = 396 + i * 34, q = K.p(t, s[3]);
      K.text(s[0], 130, y, { size: 18, mono: true, align: 'center', a: q });
      K.text(s[1], 330, y, { size: 18, mono: true, align: 'center', a: q });
      K.text(s[2], 530, y, { size: 18, mono: true, align: 'center', color: i === 3 ? P.red : P.ink, a: q });
    });
    K.mark(70, 552, false, 0.8, K.p(t, 17)); K.text('two increments, but count is 6, not 7', 96, 552, { size: 18, color: P.red, a: K.p(t, 17) });
    var fix = ['const view = new Int32Array(sab);', 'Atomics.add(view, 0, 1);', '// read + add + write as one step'];
    K.panel(680, 330, 560, 150, 'counter.js', { a: K.p(t, 19.2), stroke: P.green });
    K.code(fix, 704, 372, { size: 18, lh: 1.45, n: K.typed(t, fix, [19.4, 20.4, 21.2], 40), t: t, a: K.p(t, 19.2) });
    K.mark(704, 520, true, 0.8, K.p(t, 22)); K.text('two increments, count is 7', 730, 520, { size: 18, color: P.green, a: K.p(t, 22) });
  } },

/* 5 ─ locks */
{ d: 23, title: 'Locks with Atomics',
  caps: [
    [0.3, 'compareExchange is the building block of locks: set the value to 1 only if it is still 0, and return what was there.'],
    [7, 'If it was already 1, someone else holds the lock. The worker sleeps with Atomics.wait until the holder calls Atomics.notify.'],
    [14, 'Atomics.wait blocks, so browsers forbid it on the main thread. There, use waitAsync, which returns a promise instead.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const UNLOCKED = 0, LOCKED = 1;', 'function lock(view) {', '  while (Atomics.compareExchange(view, 0,', '      UNLOCKED, LOCKED) !== UNLOCKED) {',
                '    Atomics.wait(view, 0, LOCKED);   // sleep', '  }', '}', 'function unlock(view) {', '  Atomics.store(view, 0, UNLOCKED);', '  Atomics.notify(view, 0, 1);   // wake one', '}'];
    var st = [], a0 = 0.5; code.forEach(function (l) { st.push(a0); a0 += l.length / 60 + 0.08; });
    K.panel(40, 84, 640, 340, 'lock.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 126, { size: 18, lh: 1.4, n: K.typed(t, code, st, 60), t: t, a: K.p(t, 0.2), w: 620,
      hi: t > 10 && t < 12 ? 9 : t > 7.4 && t < 10 ? 4 : t > 2 && t < 6.5 ? 2 : -1 });
    var v = t < 3.2 ? 0 : t < 10.2 ? 1 : t < 11.4 ? 0 : 1;
    K.text('lock word', 960, 104, { size: 17, color: P.muted, align: 'center', a: K.p(t, 1) });
    K.box(900, 120, 120, 90, { stroke: v ? P.warm : P.green, fill: P.code, a: K.p(t, 1) });
    K.text(String(v), 960, 166, { size: 40, mono: true, weight: 800, align: 'center', color: v ? P.warm : P.green, a: K.p(t, 1) });
    K.box(720, 250, 200, 56, { stroke: P.blue, a: K.p(t, 1.6) }); K.text('worker A', 820, 278, { size: 18, weight: 700, align: 'center', a: K.p(t, 1.6) });
    K.box(1040, 250, 200, 56, { stroke: P.purple, a: K.p(t, 6.8) }); K.text('worker B', 1140, 278, { size: 18, weight: 700, align: 'center', a: K.p(t, 6.8) });
    K.arrow(820, 246, 900, 196, { p: K.p(t, 2.4), color: P.blue, lw: 2 });
    K.text('got 0: lock acquired', 820, 330, { size: 16, color: P.green, align: 'center', a: K.win(t, 3.4, 10.2) });
    K.text('unlock + notify', 820, 330, { size: 16, color: P.acc, align: 'center', a: K.p(t, 10.2) });
    K.arrow(1140, 246, 1022, 196, { p: K.p(t, 7.4), color: P.purple, lw: 2 });
    K.text('got 1: busy, wait()', 1140, 330, { size: 16, color: P.warm, align: 'center', a: K.win(t, 8, 11.2) });
    K.text('z z z', 1140, 358, { size: 18, color: P.muted, align: 'center', a: K.win(t, 8.6, 11.2) });
    K.text('woken, lock acquired', 1140, 330, { size: 16, color: P.green, align: 'center', a: K.p(t, 11.6) });
    var b = K.p(t, 14.2);
    K.box(40, 450, 1200, 134, { fill: P.code, stroke: P.line, a: b });
    K.mark(66, 486, false, 0.8, K.p(t, 14.4));
    K.text('Atomics.wait(view, 0, 1)', 92, 486, { size: 19, mono: true, a: K.p(t, 14.4) });
    K.text('on the browser main thread: throws, it would freeze the page', 420, 486, { size: 18, color: P.red, a: K.p(t, 15.2) });
    K.mark(66, 540, true, 0.8, K.p(t, 16.6));
    K.text('await Atomics.waitAsync(view, 0, 1).value', 92, 540, { size: 19, mono: true, a: K.p(t, 16.6) });
    K.text('a promise: the page stays responsive', 600, 540, { size: 18, color: P.green, a: K.p(t, 17.4) });
  } },

/* 6 ─ tokenizer */
{ d: 23, title: 'Step 1: tokenize',
  caps: [
    [0.3, 'ESLint, Prettier, Babel, bundlers, TypeScript and the engine itself all start the same way: they parse your code.'],
    [6.5, 'First, a tokenizer turns characters into tokens: identifiers, numbers, operators. Whitespace and comments are dropped.'],
    [13.5, 'Each token keeps its type, its text and its position, so an error can point at the exact line and column.']],
  draw: function (K, t) {
    var P = K.P;
    ['ESLint', 'Prettier', 'Babel', 'bundlers', 'TypeScript', 'V8'].forEach(function (c, i) { K.chip(c, 160 + i * 190, 110, { size: 18, stroke: P.purple, a: K.p(t, 0.8 + i * 0.3) }); });
    ['source', 'tokens', 'AST', 'transform', 'output'].forEach(function (c, i) {
      var x = 200 + i * 220, on = i === 1 && t > 6.6;
      K.chip(c, x, 190, { size: 19, stroke: on ? P.warm : P.acc, color: on ? P.warm : P.ink, a: K.p(t, 3 + i * 0.3) });
      if (i < 4) K.arrow(x + 56, 190, x + 160, 190, { p: K.p(t, 3.2 + i * 0.3), color: P.muted });
    });
    var src = 'total = 1 + 2 * x;  // sum', n = Math.max(0, Math.min(src.length, Math.floor((t - 6.8) * 14)));
    K.panel(40, 236, 1200, 76, '', { a: K.p(t, 6.6) });
    K.text(src.slice(0, n), 70, 274, { size: 28, mono: true, a: K.p(t, 6.6) });
    var T = [['ident', 'total', '1:1'], ['op', '=', '1:7'], ['num', '1', '1:9'], ['op', '+', '1:11'], ['num', '2', '1:13'], ['op', '*', '1:15'], ['ident', 'x', '1:17'], ['punct', ';', '1:18']];
    T.forEach(function (k, i) {
      var x = 60 + i * 140, q = K.back((t - 9.2 - i * 0.35) / 0.5); if (q <= 0) return;
      var col = k[0] === 'num' ? P.warm : k[0] === 'op' ? P.blue : k[0] === 'ident' ? P.acc : P.muted;
      K.g.save(); K.g.translate(x + 60, 380); K.g.scale(q, q); K.g.translate(-x - 60, -380);
      K.box(x, 338, 120, 84, { stroke: col, a: K.clamp(q) });
      K.text(k[0], x + 60, 358, { size: 16, color: col, align: 'center', a: K.clamp(q) });
      K.text(k[1], x + 60, 396, { size: 24, mono: true, weight: 700, align: 'center', a: K.clamp(q) });
      K.g.restore();
      K.text(k[2], x + 60, 442, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 14 + i * 0.2) });
    });
    K.text('whitespace and the comment are dropped', 640, 480, { size: 18, color: P.muted, align: 'center', a: K.p(t, 12.4) });
    K.text('SyntaxError: Unexpected token (1:15)', 640, 548, { size: 20, mono: true, color: P.red, align: 'center', a: K.p(t, 16.6) });
  } },

/* 7 ─ parser */
{ d: 26, title: 'Step 2: parse',
  caps: [
    [0.3, 'Next, the parser builds a tree from the tokens, following the grammar. Precedence decides what groups first.'],
    [7, 'Times binds tighter than plus, so 2 * x becomes a subtree and plus becomes the root.'],
    [13, 'Precedence climbing, or Pratt parsing, does this with one loop and a table of binding powers, plus left or right associativity.'],
    [19.5, 'The result is an abstract syntax tree: parentheses and semicolons are gone, but structure and source locations remain.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    ['1', '+', '2', '*', 'x'].forEach(function (c, i) { K.chip(c, 120 + i * 80, 112, { size: 22, mono: true, stroke: i % 2 ? P.blue : P.warm, a: K.p(t, 0.6 + i * 0.2) }); });
    K.arrow(520, 112, 590, 112, { p: K.p(t, 1.8), color: P.muted });
    K.chip('parser', 640, 112, { size: 19, stroke: P.acc, a: K.p(t, 2) });
    K.text('follows the grammar and the precedence rules', 700, 112, { size: 17, color: P.muted, a: K.p(t, 3) });
    function node(x, y, l, col, st) {
      var q = K.back((t - st) / 0.5); if (q <= 0) return;
      g.save(); g.globalAlpha *= K.clamp(q); g.fillStyle = P.card; g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 26 * q, 0, 7); g.fill(); g.stroke(); g.restore();
      K.text(l, x, y + 1, { size: 22, mono: true, weight: 700, align: 'center', a: K.clamp(q) });
    }
    var N = { plus: [300, 210], one: [190, 300], times: [410, 300], two: [340, 390], x: [480, 390] };
    function edge(a, b, st) { K.arrow(N[a][0], N[a][1] + 26, N[b][0], N[b][1] - 26, { p: K.p(t, st), color: P.line, head: 0.1, lw: 2.5 }); }
    edge('plus', 'one', 8.6); edge('plus', 'times', 8.6); edge('times', 'two', 7.8); edge('times', 'x', 7.8);
    node(N.times[0], N.times[1], '*', P.blue, 7.4); node(N.two[0], N.two[1], '2', P.warm, 7.6); node(N.x[0], N.x[1], 'x', P.acc, 7.6);
    node(N.plus[0], N.plus[1], '+', P.blue, 8.4); node(N.one[0], N.one[1], '1', P.warm, 8.6);
    K.text('1 + (2 * x)', 300, 452, { size: 20, mono: true, color: P.green, align: 'center', a: K.p(t, 10) });
    K.text('not (1 + 2) * x', 520, 160, { size: 17, mono: true, color: P.red, a: K.p(t, 10.6) });
    /* binding powers */
    var bp = K.p(t, 13.2);
    K.box(680, 200, 560, 190, { fill: P.code, stroke: P.line, a: bp });
    K.text('operator', 704, 226, { size: 16, weight: 700, color: P.muted, a: bp });
    K.text('binding power', 860, 226, { size: 16, weight: 700, color: P.muted, a: bp });
    K.text('associativity', 1060, 226, { size: 16, weight: 700, color: P.muted, a: bp });
    [['+  -', '10', 'left', 13.6], ['*  /', '20', 'left', 14.2], ['**', '30', 'right', 14.8]].forEach(function (r, i) {
      var y = 266 + i * 40, q = K.p(t, r[3]);
      K.text(r[0], 704, y, { size: 20, mono: true, color: P.blue, a: q });
      K.text(r[1], 860, y, { size: 20, mono: true, color: P.warm, a: q });
      K.text(r[2], 1060, y, { size: 18, a: q });
    });
    K.text('8 - 3 - 2   →  (8 - 3) - 2 = 3', 700, 424, { size: 18, mono: true, a: K.p(t, 16.2) });
    K.text('2 ** 3 ** 2 →  2 ** (3 ** 2) = 512', 700, 458, { size: 18, mono: true, a: K.p(t, 17.2) });
    var ast = ['{ type: "Binary", op: "+", loc: "1:1",', '  left: { type: "Num", value: 1 },', '  right: { type: "Binary", op: "*", left: { type: "Num", value: 2 }, right: { type: "Id", name: "x" } } }'];
    K.panel(40, 488, 1200, 100, '', { a: K.p(t, 19.8) });
    K.code(ast, 60, 498, { size: 16, lh: 1.4, n: K.typed(t, ast, [20, 20.9, 21.8], 70), t: t, a: K.p(t, 19.8) });
  } },

/* 8 ─ visitors */
{ d: 25, title: 'Step 3: walk the tree',
  caps: [
    [0.3, 'Then tools walk the tree with a visitor: one function per node type, called as the walk reaches each node.'],
    [7, 'A lint rule visits nodes and reports patterns, like a var declaration or a division by zero.'],
    [13, 'A transform rewrites nodes. Constant folding turns 2 * 3 into 6. Codemods, minifiers and Babel plugins all work this way.'],
    [19.5, 'Finally the tree is printed back as code, compiled to bytecode, or evaluated directly.']],
  draw: function (K, t) {
    var P = K.P, g = K.g;
    var code = ['traverse(ast, {', '  VariableDeclaration(node) {', '    if (node.kind === "var") report(node, "no-var");', '  },', '  Binary(node) {',
                '    if (node.op === "/" && isZero(node.right))', '      report(node, "division by zero");', '  },', '});'];
    var st = [], a0 = 0.5; code.forEach(function (l) { st.push(a0); a0 += l.length / 60 + 0.08; });
    K.panel(40, 84, 620, 270, 'lint-rule.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 126, { size: 17, lh: 1.42, n: K.typed(t, code, st, 60), t: t, a: K.p(t, 0.2), w: 600,
      hi: t > 9.6 && t < 13 ? 5 : t > 7.4 && t < 9.6 ? 2 : -1 });
    var N = [[960, 112, 'Program'], [820, 196, 'VarDecl'], [1100, 196, 'Binary /'], [1040, 284, '10'], [1160, 284, '0']];
    var E = [[0, 1], [0, 2], [2, 3], [2, 4]];
    var walk = t > 2 && t < 7.2 ? Math.floor((t - 2) / 1) : -1;
    E.forEach(function (e) { K.arrow(N[e[0]][0], N[e[0]][1] + 20, N[e[1]][0], N[e[1]][1] - 20, { p: K.p(t, 1.2), color: P.line, head: 0.1, lw: 2 }); });
    N.forEach(function (n, i) {
      var on = walk === i, bad = (i === 1 && t > 8) || (i === 2 && t > 10.2), w = i < 3 ? 120 : 64;
      K.box(n[0] - w / 2, n[1] - 20, w, 40, { stroke: bad ? P.red : on ? P.warm : P.acc, fill: on ? 'rgba(246,173,85,.2)' : P.card, r: 8, a: K.p(t, 1) });
      K.text(n[2], n[0], n[1], { size: 17, mono: true, align: 'center', a: K.p(t, 1) });
    });
    K.text('var ratio = 10 / 0;', 960, 340, { size: 19, mono: true, color: P.muted, align: 'center', a: K.p(t, 1.4) });
    K.chip('no-var', 820, 244, { size: 16, mono: true, stroke: P.red, color: P.red, a: K.p(t, 8.2) });
    K.chip('division by zero', 1170, 150, { size: 16, mono: true, stroke: P.red, color: P.red, a: K.p(t, 10.4) });
    /* transform */
    var tr = K.p(t, 13.2);
    K.text('const area = 2 * 3;', 60, 400, { size: 21, mono: true, a: tr });
    K.arrow(330, 400, 400, 400, { p: K.p(t, 14.4), color: P.green });
    K.text('const area = 6;', 416, 400, { size: 21, mono: true, color: P.green, a: K.p(t, 14.8) });
    K.text('Binary * (2, 3)  →  Num 6', 700, 400, { size: 18, mono: true, color: P.muted, a: K.p(t, 15.4) });
    ['codemods', 'minifiers', 'Babel plugins', 'tree-shaking'].forEach(function (c, i) { K.chip(c, 130 + i * 190, 458, { size: 17, stroke: P.purple, a: K.p(t, 16.2 + i * 0.4) }); });
    /* output */
    K.chip('AST', 110, 540, { size: 19, mono: true, stroke: P.acc, a: K.p(t, 19.8) });
    [['print: Prettier, Babel', 20.4], ['compile: V8 bytecode', 21.2], ['evaluate: interpreter', 22]].forEach(function (c, i) {
      var x = 360 + i * 300;
      K.arrow(150, 540, x - 118, 540, { p: K.p(t, c[1]), color: P.muted, a: i ? 0 : 1 });
      K.chip(c[0], x, 540, { size: 17, stroke: P.green, a: K.p(t, c[1]) });
    });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 54 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 100, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Wasm: compiled, sandboxed, numbers only (i32, i64, f32, f64)',
     'Data crosses via linear memory; grow() detaches old views',
     'SharedArrayBuffer needs COOP + COEP; races need Atomics',
     'compareExchange builds locks; waitAsync on the main thread',
     'Tools tokenize, then parse with precedence into an AST',
     'Visitors lint and transform; then print, compile or run'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1, 0.5), y = 170 + i * 58;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 54 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
