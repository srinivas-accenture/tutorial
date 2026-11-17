/* Day 25 in motion: ES modules vs CommonJS (syntax, three loading phases, live bindings, module rules, cycles), interop, package exports, dynamic import and import attributes.
   Each scene: d = seconds, caps = [[start, caption]], draw(K, t) paints the scene at local time t.
   Canvas is 1280×720; keep content above y≈600 (captions live below). Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day25', {
  kicker: 'JavaScript: Zero to Architect · Day 25',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 25: ES modules and CommonJS in depth, how they differ, and how they work together.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Modules', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 25 · import, require and everything between', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['ES modules', 'CommonJS', 'Interop'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ two systems */
{ d: 22, title: 'Two module systems',
  caps: [
    [0.3, 'For years JavaScript had no module system. Node invented CommonJS in 2009, and ES2015 standardized ES modules.'],
    [7, 'CommonJS uses require and module.exports. ES modules use import and export.'],
    [13, 'ES modules are static, load asynchronously, always run in strict mode, and allow top-level await.']],
  draw: function (K, t) {
    var P = K.P;
    K.box(100, 120, 1080, 4, { fill: P.line, r: 2, a: K.p(t, 0.4) });
    [['1995', 'globals only', 220, 0.6, P.muted], ['2009', 'Node: CommonJS', 520, 1.6, P.warm], ['2015', 'ES modules', 820, 3, P.acc], ['today', 'ESM everywhere', 1080, 4.4, P.green]].forEach(function (m) {
      var q = K.p(t, m[3]);
      K.g.save(); K.g.globalAlpha *= q; K.g.fillStyle = m[4]; K.g.beginPath(); K.g.arc(m[2], 122, 9, 0, 7); K.g.fill(); K.g.restore();
      K.text(m[0], m[2], 92, { size: 19, weight: 700, color: m[4], align: 'center', a: q });
      K.text(m[1], m[2], 156, { size: 17, color: P.muted, align: 'center', a: q });
    });
    var cj = ['// math.cjs', 'const { round } = require("./util.cjs");', 'module.exports = { add };'];
    var es = ['// math.js', 'import { round } from "./util.js";', 'export function add(a, b) { … }'];
    K.panel(40, 200, 580, 160, 'CommonJS', { a: K.p(t, 7.2) });
    K.code(cj, 64, 244, { size: 19, n: K.typed(t, cj, [7.4, 7.8, 9.2], 40), t: t, a: K.p(t, 7.2) });
    K.panel(660, 200, 580, 160, 'ES module', { a: K.p(t, 8.6) });
    K.code(es, 684, 244, { size: 19, n: K.typed(t, es, [8.8, 9.2, 10.6], 40), t: t, a: K.p(t, 8.6) });
    var R = [['structure', 'dynamic, runtime calls', 'static, analyzed first'], ['loading', 'synchronous', 'asynchronous, in parallel'], ['strict mode', 'opt-in', 'always'], ['top-level await', 'no', 'yes']];
    R.forEach(function (r, i) {
      var q = K.p(t, 13.3 + i * 0.8), y = 400 + i * 44;
      K.text(r[0], 40, y, { size: 19, weight: 700, color: P.muted, a: q });
      K.text(r[1], 330, y, { size: 19, color: P.warm, align: 'center', a: q });
      K.text(r[2], 950, y, { size: 19, color: P.acc, align: 'center', a: q });
    });
  } },

/* 3 ─ three phases */
{ d: 25, title: 'How ES modules load',
  caps: [
    [0.3, 'An ES module graph loads in three phases. First, construction: find, fetch and parse every file before running any code.'],
    [7.5, 'Second, instantiation: create the exports and link each import to them. No values yet, only connections.'],
    [13.5, 'Third, evaluation: run the code, dependencies first, and each module exactly once.'],
    [19, 'Import the same module twice and you get the same cached instance. Its body ran only once.']],
  draw: function (K, t) {
    var P = K.P;
    var ph = [['1 · Construction', 'fetch + parse', 0.6, P.warm], ['2 · Instantiation', 'link bindings', 7.7, P.purple], ['3 · Evaluation', 'run once, deps first', 13.7, P.green]];
    ph.forEach(function (p, i) {
      var x = 40 + i * 410, q = K.p(t, p[2]), on = t > p[2] && (i === 2 || t < ph[i + 1][2]);
      K.box(x, 80, 380, 70, { stroke: p[3], lw: on ? 3.5 : 2, fill: on ? 'rgba(255,255,255,.04)' : P.card, a: q });
      K.text(p[0], x + 24, 106, { size: 21, weight: 700, color: p[3], a: q });
      K.text(p[1], x + 24, 132, { size: 16, color: P.muted, a: q });
    });
    /* graph */
    var N = [['main.js', 640, 220, 1], ['cart.js', 420, 340, 2], ['api.js', 860, 340, 2.4], ['util.js', 640, 460, 3]];
    var E = [[0, 1], [0, 2], [1, 3], [2, 3]];
    E.forEach(function (e) { var a = N[e[0]], b = N[e[1]]; K.arrow(a[1] + (b[1] - a[1]) * 0.18, a[2] + 22, b[1] - (b[1] - a[1]) * 0.18, b[2] - 22, { p: K.p(t, b[3], 0.4), color: t > 8.4 ? P.purple : P.muted, dash: t > 8.4 ? null : [6, 6] }); });
    var order = [3, 1, 2, 0];
    N.forEach(function (n, i) {
      var q = K.p(t, n[3], 0.4), ev = K.p(t, 14.4 + order.indexOf(i) * 0.9, 0.4);
      K.chip(n[0], n[1], n[2], { size: 20, mono: true, stroke: ev > 0.5 ? P.green : P.warm, a: q });
      if (ev > 0) K.text(String(order.indexOf(i) + 1), n[1] + 74, n[2] - 20, { size: 18, weight: 800, color: P.green, a: ev });
    });
    K.text('parsed, not run', 1020, 220, { size: 17, color: P.warm, a: K.win(t, 4, 7.5) });
    K.text('imports → exports, still empty', 1020, 220, { size: 17, color: P.purple, a: K.win(t, 8.6, 13.5) });
    K.text('util.js runs first', 1020, 220, { size: 17, color: P.green, a: K.p(t, 15) });
    var c = K.p(t, 19.2);
    K.box(40, 500, 1200, 80, { fill: P.code, stroke: P.line, a: c });
    K.code(['const m1 = await import("./util.js");', 'const m2 = await import("./util.js");  m1 === m2  // true'], 64, 512, { size: 18, lh: 1.5, a: c, n: K.typed(t, ['const m1 = await import("./util.js");', 'const m2 = await import("./util.js");  m1 === m2  // true'], [19.4, 20.6], 50), t: t });
  } },

/* 4 ─ live bindings */
{ d: 23, title: 'Live bindings vs copies',
  caps: [
    [0.3, 'An ES import is a live, read-only view of the exported variable. When count changes, every importer sees it.'],
    [7.5, 'CommonJS destructuring copies the value at that moment. Later changes do not show up.'],
    [14, 'Imported bindings are read-only. Assigning to count throws a TypeError, so call a function the module exports.']],
  draw: function (K, t) {
    var P = K.P;
    var a = ['// counter.js', 'export let count = 0;', 'export function inc() { count++; }'];
    var b = ['// main.js', 'import { count, inc } from "./counter.js";', 'inc();', 'console.log(count);   // 1'];
    K.panel(40, 80, 580, 150, 'counter.js', { a: K.p(t, 0.3) });
    K.code(a, 64, 124, { size: 19, n: K.typed(t, a, [0.4, 0.8, 1.6], 40), t: t, a: K.p(t, 0.3) });
    K.panel(40, 250, 580, 180, 'main.js', { a: K.p(t, 2.4) });
    K.code(b, 64, 294, { size: 19, n: K.typed(t, b, [2.5, 2.9, 4.2, 4.8], 40), t: t, a: K.p(t, 2.4), hi: t > 15 ? -1 : t > 4.8 ? 3 : -1, w: 540 });
    /* window diagram */
    var w = K.p(t, 3.4), inc = t > 4.4;
    K.box(700, 90, 220, 110, { stroke: P.acc, a: w });
    K.text('count', 810, 120, { size: 18, color: P.muted, align: 'center', a: w });
    K.text(inc ? '1' : '0', 810, 160, { size: 34, weight: 800, mono: true, color: inc ? P.green : P.ink, align: 'center', a: w });
    K.box(1010, 90, 220, 110, { stroke: P.acc, dash: [6, 6], a: w });
    K.text('main sees', 1120, 120, { size: 18, color: P.muted, align: 'center', a: w });
    K.text(inc ? '1' : '0', 1120, 160, { size: 34, weight: 800, mono: true, color: inc ? P.green : P.ink, align: 'center', a: w });
    K.arrow(1004, 145, 926, 145, { p: K.p(t, 3.8, 0.4), color: P.acc });
    K.text('live view', 965, 220, { size: 17, color: P.acc, align: 'center', a: K.p(t, 4) });
    /* copy */
    var c = ['const lib = require("./counter.cjs");', 'const { count } = lib;   // copy: 0', 'lib.inc();', 'count     // still 0'];
    var cp = K.p(t, 7.7);
    K.panel(660, 250, 580, 180, 'CommonJS', { a: cp });
    K.code(c, 684, 294, { size: 19, n: K.typed(t, c, [7.9, 9, 10.6, 11.4], 40), t: t, a: cp, hi: t > 11.8 && t < 14 ? 3 : -1, w: 540 });
    var e = K.p(t, 14.4);
    K.box(40, 460, 1200, 110, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: e });
    K.code(['count = 5;   // in main.js'], 64, 478, { size: 20, a: e });
    K.text('TypeError: Assignment to constant variable.', 64, 540, { size: 20, mono: true, color: P.red, a: K.p(t, 15.2) });
    K.chip('call inc() instead', 1060, 515, { size: 19, stroke: P.green, color: P.green, a: K.p(t, 17) });
  } },

/* 5 ─ module rules */
{ d: 24, title: 'Module rules',
  caps: [
    [0.3, 'Node picks the module type from the type field in package.json, or from the .mjs and .cjs extensions.'],
    [6.5, 'In an ES module, top-level this is undefined, and there is no __dirname. Use import.meta.dirname instead.'],
    [13, 'Imports need full paths with extensions, and import declarations are hoisted, so they cannot be conditional.'],
    [18.5, 'In the browser, use script type module, and an import map to give bare names like lodash a URL.']],
  draw: function (K, t) {
    var P = K.P;
    var F = [['"type": "module"', '.js = ESM', P.acc, 0.6], ['file.mjs', 'always ESM', P.acc, 2.2], ['file.cjs', 'always CommonJS', P.warm, 3.4]];
    F.forEach(function (f, i) {
      var x = 40 + i * 410, q = K.p(t, f[3]);
      K.box(x, 80, 380, 90, { stroke: f[2], a: q });
      K.text(f[0], x + 24, 112, { size: 21, mono: true, a: q });
      K.text(f[1], x + 24, 146, { size: 18, color: f[2], a: q });
    });
    var m = ['console.log(this);              // undefined', 'console.log(typeof __dirname);  // "undefined"', 'import.meta.dirname   // "/app/src"', 'import.meta.url       // "file:///app/src/x.js"'];
    K.panel(40, 200, 620, 190, 'x.js (ESM)', { a: K.p(t, 6.6) });
    K.code(m, 64, 244, { size: 18, n: K.typed(t, m, [6.8, 8.4, 10.2, 11.4], 44), t: t, a: K.p(t, 6.6) });
    var r = K.p(t, 13.2);
    K.panel(700, 200, 540, 190, 'paths', { a: r });
    K.mark(724, 252, false, 0.7, K.p(t, 13.6)); K.code(['import { x } from "./util";'], 750, 240, { size: 19, a: K.p(t, 13.6) });
    K.mark(724, 300, true, 0.7, K.p(t, 14.4)); K.code(['import { x } from "./util.js";'], 750, 288, { size: 19, a: K.p(t, 14.4) });
    K.mark(724, 348, false, 0.7, K.p(t, 15.6)); K.code(['if (dev) import "./debug.js";'], 750, 336, { size: 19, a: K.p(t, 15.6) });
    K.text('SyntaxError: use import() instead', 970, 410, { size: 16, color: P.red, align: 'center', a: K.p(t, 16.4) });
    var h = ['<script type="importmap">', '  { "imports": { "lodash": "/vendor/lodash-es/lodash.js" } }', '</script>', '<script type="module" src="/app.js"></script>'];
    K.panel(40, 430, 1200, 150, '', { a: K.p(t, 18.8) });
    K.code(h, 64, 446, { size: 18, lh: 1.45, n: K.typed(t, h, [19, 19.8, 21.6, 22], 60), t: t, a: K.p(t, 18.8) });
  } },

/* 6 ─ circular imports */
{ d: 21, title: 'Circular imports',
  caps: [
    [0.3, 'Cycles are allowed: a.js imports b.js, and b.js imports a.js.'],
    [6, 'But b runs before a has finished. Reading a let from a throws: the binding is still in its temporal dead zone.'],
    [13.5, 'The usual fix is to move the shared code into a third module, so the graph has no cycle.']],
  draw: function (K, t) {
    var P = K.P;
    var a = ['// a.js', 'import { b } from "./b.js";', 'export let a = "A";'];
    var b = ['// b.js', 'import { a } from "./a.js";', 'console.log(a);   // ReferenceError', 'export let b = "B";'];
    K.panel(40, 80, 560, 150, 'a.js', { a: K.p(t, 0.3) });
    K.code(a, 64, 124, { size: 19, n: K.typed(t, a, [0.5, 0.9, 2], 40), t: t, a: K.p(t, 0.3), marks: t > 7 && t < 13.5 ? { 2: 'rgba(147,164,184,.12)' } : null, w: 520 });
    K.panel(680, 80, 560, 190, 'b.js', { a: K.p(t, 1.2) });
    K.code(b, 704, 124, { size: 19, n: K.typed(t, b, [1.4, 1.8, 6.4, 7.8], 40), t: t, a: K.p(t, 1.2), marks: t > 9 && t < 13.5 ? { 2: 'rgba(252,129,129,.2)' } : null, w: 520 });
    K.curve(600, 160, 640, 110, 680, 160, { p: K.p(t, 3, 0.5), color: P.warm });
    K.curve(680, 200, 640, 250, 600, 200, { p: K.p(t, 3.6, 0.5), color: P.warm });
    K.text('cycle', 640, 285, { size: 17, color: P.warm, align: 'center', a: K.p(t, 4) * (1 - K.p(t, 13.6)) });
    var e = K.p(t, 9.4);
    K.box(40, 310, 1200, 70, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: e * (1 - K.p(t, 13.4)) });
    K.text("ReferenceError: Cannot access 'a' before initialization", 64, 345, { size: 20, mono: true, color: P.red, a: e * (1 - K.p(t, 13.4)) });
    var f = K.p(t, 13.8);
    [['a.js', 300, P.acc], ['b.js', 980, P.acc], ['shared.js', 640, P.green]].forEach(function (n, i) {
      K.chip(n[0], n[1], i === 2 ? 530 : 420, { size: 20, mono: true, stroke: n[2], a: K.p(t, 14 + i * 0.6) });
    });
    K.arrow(330, 440, 580, 512, { p: K.p(t, 15.4, 0.5), color: P.green });
    K.arrow(950, 440, 700, 512, { p: K.p(t, 15.8, 0.5), color: P.green });
    K.text('no cycle', 640, 455, { size: 17, color: P.green, align: 'center', a: K.p(t, 16.6) * f });
  } },

/* 7 ─ interop */
{ d: 25, title: 'ESM and CommonJS together',
  caps: [
    [0.3, 'ES modules can import CommonJS. The default import is module.exports; named imports are only a best-effort guess.'],
    [7.5, 'CommonJS can always reach an ES module with await import. That works everywhere.'],
    [13, 'Since Node 22.12, require of an ES module also works, as long as its graph has no top-level await.'],
    [19, 'Otherwise it throws ERR_REQUIRE_ASYNC_MODULE. And in ESM, createRequire gives you a require function when you need one.']],
  draw: function (K, t) {
    var P = K.P;
    function card(x, y, w, h, title, col, a) { K.box(x, y, w, h, { stroke: col, a: a }); K.text(title, x + 24, y + 28, { size: 19, weight: 700, color: col, a: a }); }
    var e1 = K.p(t, 0.5);
    card(40, 80, 600, 200, 'in an ES module', P.acc, e1);
    K.mark(70, 140, true, 0.7, K.p(t, 1)); K.code(['import pkg from "legacy-cjs";'], 94, 128, { size: 19, a: K.p(t, 1) });
    K.code(['const { helper } = pkg;'], 94, 168, { size: 19, a: K.p(t, 2.2) });
    K.text('pkg === module.exports', 94, 226, { size: 17, color: P.green, a: K.p(t, 3) });
    K.text('import { helper } from: best effort', 94, 256, { size: 16, color: P.warm, a: K.p(t, 4.6) });
    var c1 = K.p(t, 7.7);
    card(680, 80, 560, 200, 'in a CommonJS file', P.warm, c1);
    K.mark(710, 140, true, 0.7, K.p(t, 8.2)); K.code(['await import("esm-only")'], 734, 128, { size: 19, a: K.p(t, 8.2) });
    K.text('works everywhere', 1220, 140, { size: 16, color: P.green, align: 'right', a: K.p(t, 9.4) });
    K.mark(710, 196, true, 0.7, K.p(t, 13.3)); K.code(['require("esm-lib")'], 734, 184, { size: 19, a: K.p(t, 13.3) });
    K.text('Node 22.12+, no top-level await', 734, 236, { size: 16, color: P.green, a: K.p(t, 14.2) });
    var x = K.p(t, 19.2);
    K.box(680, 310, 560, 90, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: x });
    K.text('require(esm with top-level await)', 704, 338, { size: 18, mono: true, a: x });
    K.text('ERR_REQUIRE_ASYNC_MODULE', 704, 374, { size: 19, mono: true, weight: 700, color: P.red, a: K.p(t, 19.8) });
    var cr = ['import { createRequire } from "node:module";', 'const require = createRequire(import.meta.url);'];
    K.panel(40, 310, 600, 120, '', { a: K.p(t, 21) });
    K.code(cr, 64, 330, { size: 17, n: K.typed(t, cr, [21.2, 22.6], 50), t: t, a: K.p(t, 21) });
    K.chip('ESM → CJS: easy', 320, 500, { size: 19, stroke: P.acc, a: K.p(t, 5.4) });
    K.chip('CJS → ESM: import(), or require() if sync', 900, 500, { size: 19, stroke: P.warm, a: K.p(t, 16) });
  } },

/* 8 ─ package exports and the dual package hazard */
{ d: 25, title: 'Package exports',
  caps: [
    [0.3, 'The exports field in package.json tells each loader which file to use, with import, require and types conditions.'],
    [7.5, 'It also blocks deep imports that are not listed, so the package controls its public surface.'],
    [13, 'Ship both builds, and one app may load both copies: two instances, two caches, and instanceof checks fail.'],
    [19.5, 'That is the dual package hazard. Prefer ESM-first packages, and test both entry points in CI.']],
  draw: function (K, t) {
    var P = K.P;
    var pk = ['"exports": {', '  ".": {', '    "types":   "./dist/index.d.ts",', '    "import":  "./dist/index.js",', '    "require": "./dist/index.cjs"', '  },', '  "./utils": "./dist/utils.js"', '}'];
    K.panel(40, 80, 620, 330, 'package.json', { a: K.p(t, 0.3) });
    K.code(pk, 64, 122, { size: 19, lh: 1.45, n: K.typed(t, pk, [0.5, 0.8, 1.2, 2.4, 3.6, 4.6, 4.8, 5.2], 50), t: t, a: K.p(t, 0.3),
      hi: t > 2.6 && t < 3.8 ? 3 : t > 3.8 && t < 5 ? 4 : t > 1.4 && t < 2.6 ? 2 : -1, w: 590 });
    [['TypeScript', 2, 210, P.blue], ['import', 3, 250, P.acc], ['require()', 4, 290, P.warm]].forEach(function (r) {
      var q = K.p(t, r[1] + 0.6);
      K.chip(r[0], 800, r[2] - 50, { size: 17, stroke: r[3], a: q });
    });
    var dp = K.p(t, 7.8);
    K.mark(946, 140, true, 0.7, dp); K.code(['"my-lib/utils"'], 970, 128, { size: 18, a: dp });
    K.mark(946, 190, false, 0.7, K.p(t, 8.8)); K.code(['"my-lib/dist/internal.js"'], 970, 178, { size: 18, a: K.p(t, 8.8) });
    K.text('ERR_PACKAGE_PATH_NOT_EXPORTED', 1240, 226, { size: 16, mono: true, color: P.red, align: 'right', a: K.p(t, 9.6) });
    /* dual hazard */
    var h = K.p(t, 13.2);
    K.box(700, 270, 540, 300, { stroke: P.red, a: h });
    K.text('one app, two copies', 724, 298, { size: 19, weight: 700, color: P.red, a: h });
    K.chip('your code: import', 860, 350, { size: 17, stroke: P.acc, a: K.p(t, 13.6) });
    K.chip('a dependency: require', 1090, 350, { size: 17, stroke: P.warm, a: K.p(t, 14) });
    K.box(760, 410, 180, 70, { stroke: P.acc, a: K.p(t, 14.4) }); K.text('index.js', 850, 434, { size: 17, mono: true, align: 'center', a: K.p(t, 14.4) }); K.text('cache A', 850, 460, { size: 16, color: P.muted, align: 'center', a: K.p(t, 14.4) });
    K.box(1000, 410, 180, 70, { stroke: P.warm, a: K.p(t, 14.8) }); K.text('index.cjs', 1090, 434, { size: 17, mono: true, align: 'center', a: K.p(t, 14.8) }); K.text('cache B', 1090, 460, { size: 16, color: P.muted, align: 'center', a: K.p(t, 14.8) });
    K.arrow(850, 370, 850, 404, { p: K.p(t, 14.4, 0.3), color: P.acc, head: 9 }); K.arrow(1090, 370, 1090, 404, { p: K.p(t, 14.8, 0.3), color: P.warm, head: 9 });
    K.text('err instanceof MyError  // false', 970, 530, { size: 17, mono: true, color: P.red, align: 'center', a: K.p(t, 16) });
    K.chip('ESM-first', 200, 470, { size: 19, stroke: P.green, a: K.p(t, 19.8) });
    K.chip('test both entry points in CI', 430, 530, { size: 19, stroke: P.green, a: K.p(t, 20.4) });
  } },

/* 9 ─ dynamic import and attributes */
{ d: 23, title: 'import() and import attributes',
  caps: [
    [0.3, 'Dynamic import works in both systems. It returns a promise for the module namespace object.'],
    [6.5, 'Import attributes tell the loader how to treat a file: with type json loads JSON as data, never as code.'],
    [13, 'Without the attribute, importing JSON fails. The dynamic form takes the attribute as a second argument.'],
    [18.5, 'Newer ideas like import defer, for lazy evaluation, are still proposals. Check support before relying on them.']],
  draw: function (K, t) {
    var P = K.P;
    var d = ['const ns = await import("./chart.js");', 'ns.default      // default export', 'ns.renderChart  // named export'];
    K.panel(40, 80, 600, 170, 'dynamic', { a: K.p(t, 0.3) });
    K.code(d, 64, 124, { size: 19, n: K.typed(t, d, [0.5, 2, 3.2], 40), t: t, a: K.p(t, 0.3) });
    K.box(700, 90, 540, 150, { stroke: P.acc, a: K.p(t, 2.4) });
    K.text('Module namespace', 724, 118, { size: 19, weight: 700, color: P.acc, a: K.p(t, 2.4) });
    K.text('default: ƒ', 724, 162, { size: 19, mono: true, a: K.p(t, 2.8) });
    K.text('renderChart: ƒ', 724, 200, { size: 19, mono: true, a: K.p(t, 3.4) });
    K.text('sealed, read-only', 1220, 200, { size: 16, color: P.muted, align: 'right', a: K.p(t, 4.2) });
    var j = ['import config from "./config.json" with { type: "json" };', 'config.port   // 3000'];
    K.panel(40, 280, 1200, 120, 'import attributes', { a: K.p(t, 6.6) });
    K.code(j, 64, 322, { size: 19, n: K.typed(t, j, [6.8, 9.4], 44), t: t, a: K.p(t, 6.6) });
    K.chip('data, never executed', 1080, 350, { size: 17, stroke: P.green, a: K.p(t, 10.4) });
    var x = K.p(t, 13.2);
    K.mark(64, 446, false, 0.75, x); K.code(['import config from "./config.json";'], 90, 434, { size: 19, a: x });
    K.text('TypeError: needs type "json"', 1220, 446, { size: 17, color: P.red, align: 'right', a: K.p(t, 14) });
    K.mark(64, 494, true, 0.75, K.p(t, 15.4)); K.code(['await import("./config.json", { with: { type: "json" } })'], 90, 482, { size: 19, a: K.p(t, 15.4) });
    K.chip('import defer: proposal, check support', 640, 554, { size: 18, stroke: P.warm, a: K.p(t, 18.8) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 25 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['ESM: static, async, strict, top-level await; CJS: dynamic and sync',
     'Construction, instantiation, evaluation; each module runs once',
     'Imports are live, read-only bindings; require gives copies',
     'ESM imports CJS; CJS uses import(), or require() when sync',
     'exports map per condition; beware the dual package hazard'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(200, y, true, 0.9, q);
      K.text(s, 232 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 25 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
