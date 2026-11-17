/* Day 24 in motion: what bundlers do, tree-shaking and side effects, script loading (classic, defer, async, module), code splitting, resource hints, hashed caching and bundle analysis.
   Each scene: d = seconds, caps = [[start, caption]], draw(K, t) paints the scene at local time t.
   Canvas is 1280×720; keep content above y≈600 (captions live below). Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day24', {
  kicker: 'JavaScript: Zero to Architect · Day 24',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 24: what bundlers do, why tree-shaking works, and how to load code in the right order and size.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Bundling and loading', 0, 0, { size: 88, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 24 · Ship less, load smarter', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['Module graph', 'Tree-shaking', 'Code splitting'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ what a bundler does */
{ d: 24, title: 'What a bundler does',
  caps: [
    [0.3, 'Modern apps are hundreds of modules, written in TypeScript or JSX, plus npm packages. Browsers need something leaner.'],
    [6.5, 'A bundler starts at an entry file and follows every import to build the module graph.'],
    [12, 'It transforms files along the way, then emits a few chunks: minified, with content hashes and source maps.'],
    [18, 'Vite now bundles with Rolldown, written in Rust. esbuild, webpack and Rspack do the same job.']],
  draw: function (K, t) {
    var P = K.P;
    var files = ['main.ts', 'App.tsx', 'router.ts', 'cart.ts', 'api.ts', 'Chart.tsx', 'utils.ts', 'styles.css', 'lodash-es', 'date-fns'];
    files.forEach(function (f, i) {
      var q = K.p(t, 0.6 + i * 0.15, 0.4) * (1 - K.p(t, 6.4) * 0.65), x = 60 + (i % 5) * 120, y = 110 + Math.floor(i / 5) * 52;
      K.chip(f, x + 50, y, { size: 15, mono: true, stroke: i > 7 ? P.purple : P.line, a: q });
    });
    /* module graph */
    var N = [['main.ts', 330, 250, 6.8], ['App.tsx', 200, 340, 7.6], ['router.ts', 460, 340, 7.9], ['cart.ts', 130, 440, 8.6], ['api.ts', 300, 440, 8.9], ['Chart.tsx', 520, 440, 9.2], ['lodash-es', 300, 530, 9.8]];
    var E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [4, 6]];
    E.forEach(function (e) { var a = N[e[0]], b = N[e[1]]; K.arrow(a[1], a[2] + 18, b[1], b[2] - 20, { p: K.p(t, b[3] - 0.2, 0.4), color: P.muted, head: 9, lw: 2 }); });
    N.forEach(function (n, i) { K.chip(n[0], n[1], n[2], { size: 17, mono: true, stroke: i ? (i === 6 ? P.purple : P.acc) : P.warm, a: K.p(t, n[3], 0.4) }); });
    K.text('entry', 410, 250, { size: 16, color: P.warm, a: K.p(t, 7.2) });
    /* pipeline */
    var S = [['transform', 'TS · JSX · CSS', 12.2], ['minify', 'shorter names', 13.2], ['hash + map', 'app.8f2a.js', 14.2]];
    S.forEach(function (s, i) {
      var q = K.p(t, s[2]), y = 110 + i * 100;
      K.box(700, y - 36, 240, 72, { stroke: P.acc, a: q });
      K.text(s[0], 820, y - 10, { size: 20, weight: 700, align: 'center', a: q });
      K.text(s[1], 820, y + 18, { size: 16, mono: i === 2, color: P.muted, align: 'center', a: q });
      if (i) K.arrow(820, y - 62, 820, y - 40, { p: q, color: P.muted, head: 9 });
    });
    K.arrow(600, 340, 694, 140, { p: K.p(t, 12, 0.5), color: P.acc });
    K.text('dist/', 1010, 92, { size: 18, weight: 700, color: P.muted, a: K.p(t, 15) });
    ['index.html', 'app.8f2a.js', 'vendor.c1d9.js', 'chart.77b0.js', 'app.8f2a.js.map'].forEach(function (f, i) {
      K.chip(f, 1110, 132 + i * 46, { size: 16, mono: true, stroke: i === 4 ? P.line : P.green, a: K.p(t, 15.2 + i * 0.3) });
    });
    ['Vite + Rolldown', 'esbuild', 'webpack', 'Rspack'].forEach(function (s, i) {
      K.chip(s, 760 + (i % 2) * 260, 430 + Math.floor(i / 2) * 60, { size: 19, stroke: i ? P.blue : P.acc, a: K.p(t, 18.4 + i * 0.4) });
    });
  } },

/* 3 ─ tree-shaking */
{ d: 25, title: 'Tree-shaking',
  caps: [
    [0.3, 'Tree-shaking removes exports that nothing imports. The app imports add from math, so sub and mul can go.'],
    [7, 'It works because import and export are static: the bundler sees what is used without running any code.'],
    [13, 'CommonJS is dynamic. require can run anywhere, with any string, so it cannot be shaken reliably.'],
    [19, 'Watch whole-library imports. Importing all of lodash pulls everything; lodash-es or a single path does not.']],
  draw: function (K, t) {
    var P = K.P;
    var app = ['// app.js', 'import { add } from "./math.js";', 'add(2, 3);'];
    K.panel(40, 80, 560, 160, 'app.js', { a: K.p(t, 0.3) });
    K.code(app, 64, 124, { size: 20, n: K.typed(t, app, [0.4, 0.8, 2], 40), t: t, a: K.p(t, 0.3) });
    K.panel(660, 80, 580, 160, 'math.js', { a: K.p(t, 0.3) });
    var ex = ['export const add = (a, b) => a + b;', 'export const sub = (a, b) => a - b;', 'export const mul = (a, b) => a * b;'];
    var shake = K.p(t, 3.4, 0.8);
    ex.forEach(function (l, i) {
      var dead = i > 0, a = K.p(t, 0.6) * (dead ? 1 - shake * 0.75 : 1);
      K.code([l], 684, 124 + i * 34, { size: 19, a: a, marks: dead && t > 3.4 ? { 0: 'rgba(252,129,129,.14)' } : (!dead && t > 2.6 ? { 0: 'rgba(104,211,145,.14)' } : null), w: 548 });
    });
    K.chip('bundle: add only', 950, 272, { size: 18, stroke: P.green, color: P.green, a: K.p(t, 4.6) });
    var st = K.p(t, 7.2);
    K.box(40, 300, 580, 130, { stroke: P.green, a: st });
    K.text('ES modules: static', 64, 330, { size: 21, weight: 700, color: P.green, a: st });
    K.text('top level only, string literals,', 64, 368, { size: 19, a: K.p(t, 8) });
    K.text('known at build time', 64, 400, { size: 19, a: K.p(t, 8) });
    var cj = K.p(t, 13.2);
    K.box(660, 300, 580, 130, { stroke: P.red, a: cj });
    K.text('CommonJS: dynamic', 684, 330, { size: 21, weight: 700, color: P.red, a: cj });
    K.code(['if (cond) require("./" + name);', 'module.exports[key] = fn;'], 684, 356, { size: 19, n: K.typed(t, ['if (cond) require("./" + name);', 'module.exports[key] = fn;'], [13.6, 15], 34), t: t, a: cj });
    var lo = K.p(t, 19.2);
    K.mark(64, 480, false, 0.8, lo); K.code(['import _ from "lodash";'], 92, 468, { size: 19, a: lo });
    K.text('whole library, ~70 KB', 620, 480, { size: 18, color: P.red, a: lo });
    K.mark(64, 536, true, 0.8, K.p(t, 20.2)); K.code(['import { debounce } from "lodash-es";'], 92, 524, { size: 19, a: K.p(t, 20.2) });
    K.text('just what you use', 620, 536, { size: 18, color: P.green, a: K.p(t, 20.2) });
  } },

/* 4 ─ side effects */
{ d: 21, title: 'Side effects',
  caps: [
    [0.3, 'Some modules do work just by being imported: they register a global, patch a prototype, or import CSS.'],
    [6.5, 'Setting sideEffects to false in package.json promises that unused modules can be dropped entirely.'],
    [13, 'It is a promise. If some files do have side effects, such as CSS, list them, or they may silently disappear.']],
  draw: function (K, t) {
    var P = K.P;
    var se = ['// polyfills.js', 'Array.prototype.last ??= function () {', '  return this[this.length - 1];', '};', 'import "./theme.css";'];
    K.panel(40, 80, 600, 250, 'side effects on import', { a: K.p(t, 0.3) });
    K.code(se, 64, 124, { size: 20, lh: 1.5, n: K.typed(t, se, [0.6, 1.2, 2.2, 3, 4], 36), t: t, a: K.p(t, 0.3) });
    K.text('runs the moment it is imported', 340, 360, { size: 18, color: P.warm, align: 'center', a: K.p(t, 4.6) });
    var pk = ['{', '  "name": "my-lib",', '  "type": "module",', '  "sideEffects": false', '}'];
    var pk2 = ['{', '  "name": "my-lib",', '  "type": "module",', '  "sideEffects": ["*.css", "./src/polyfills.js"]', '}'];
    var swap = K.p(t, 13.2, 0.4), swap2 = K.p(t, 13.7, 0.4);
    K.panel(680, 80, 560, 250, 'package.json', { a: K.p(t, 6.6) });
    K.code(pk, 704, 124, { size: 20, lh: 1.5, n: K.typed(t, pk, [6.8, 7.2, 7.6, 8, 9], 40), t: t, a: K.p(t, 6.6) * (1 - swap), hi: t > 8.4 && t < 13 ? 3 : -1, w: 520 });
    K.code(pk2, 704, 124, { size: 17, lh: 1.76, a: swap2, hi: 3, w: 520 });
    var mods = [['math.js', true], ['format.js', false], ['theme.css', false]];
    mods.forEach(function (m, i) {
      var x = 760 + i * 170, q = K.p(t, 9.6 + i * 0.4), drop = !m[1] && t > 10.8;
      K.chip(m[0], x, 410, { size: 18, mono: true, stroke: m[1] ? P.green : drop ? P.red : P.line, a: q * (drop && i === 1 ? 0.5 : 1) });
    });
    K.text('unused modules dropped', 930, 460, { size: 17, color: P.muted, align: 'center', a: K.p(t, 11) });
    K.mark(1100, 380, false, 0.75, K.win(t, 11.2, 13.6));
    K.text('theme.css vanished from the build!', 930, 500, { size: 18, color: P.red, align: 'center', a: K.win(t, 11.4, 14) });
    K.text('listed files are always kept', 930, 500, { size: 18, color: P.green, align: 'center', a: K.p(t, 15) });
    K.mark(1100, 380, true, 0.75, K.p(t, 15));
  } },

/* 5 ─ script loading */
{ d: 24, title: 'defer, async, module',
  caps: [
    [0.3, 'A classic script tag blocks HTML parsing while the script downloads and runs.'],
    [6, 'defer downloads in parallel and runs after parsing, in document order.'],
    [11.5, 'async also downloads in parallel, but runs as soon as it arrives, in any order. Fine for independent scripts.'],
    [18, 'Module scripts are deferred by default, strict, and have their own scope. nomodule is the legacy fallback.']],
  draw: function (K, t) {
    var P = K.P;
    var R = [['<script>', 0.4], ['<script defer>', 6.2], ['<script async>', 11.7], ['<script type="module">', 18.2]];
    function bar(x, y, w, col, st, label) { var q = K.p(t, st, 0.8); if (q > 0) K.box(x, y, w * q, 28, { fill: col, r: 5, a: 0.85 }); if (label && q > 0.9) K.text(label, x + w / 2, y + 14, { size: 15, weight: 700, color: P.bg, align: 'center' }); }
    R.forEach(function (r, i) {
      var y = 90 + i * 118, a = K.p(t, r[1]);
      K.text(r[0], 40, y + 34, { size: 19, mono: true, color: i === 3 ? P.purple : P.ink, a: a });
      if (a <= 0) return;
      var x0 = 360, st = r[1] + 0.3;
      if (i === 0) { bar(x0, y + 6, 200, P.green, st, 'parse HTML'); bar(x0 + 200, y + 40, 200, P.blue, st + 0.8, 'download'); bar(x0 + 400, y + 40, 120, P.warm, st + 1.6, 'run'); bar(x0 + 520, y + 6, 340, P.green, st + 2.2, 'parse HTML');
        K.text('parsing paused', 660, y + 20, { size: 16, color: P.red, align: 'center', a: K.p(t, 3) }); }
      if (i === 1 || i === 3) { bar(x0, y + 6, 640, P.green, st, 'parse HTML'); bar(x0 + 120, y + 40, 220, P.blue, st + 0.6, 'download'); bar(x0 + 640, y + 40, 120, P.warm, st + 1.6, 'run'); }
      if (i === 2) { bar(x0, y + 6, 300, P.green, st, 'parse HTML'); bar(x0 + 120, y + 40, 180, P.blue, st + 0.6, 'download'); bar(x0 + 300, y + 74, 120, P.warm, st + 1.4, 'run'); bar(x0 + 420, y + 6, 220, P.green, st + 2, 'parse');
        K.text('parsing paused while it runs', 40, y + 66, { size: 16, color: P.warm, a: K.p(t, st + 2) }); }
    });
    K.text('runs after parsing, in order', 40, 274, { size: 16, color: P.green, a: K.p(t, 8.4) });
    K.text('strict · own scope · deferred', 40, 510, { size: 16, color: P.purple, a: K.p(t, 20.2) });
  } },

/* 6 ─ code splitting */
{ d: 24, title: 'Code splitting',
  caps: [
    [0.3, 'Code splitting loads only what the current screen needs. A dynamic import creates a split point.'],
    [6.5, 'When the user clicks Reports, import fetches the reports chunk and returns a promise for the module.'],
    [13, 'Split by route and by heavy feature, such as charts, editors and modals. The chunk is cached for next time.'],
    [18.5, 'But do not over-split: chunk A needing B needing C becomes a slow request waterfall.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['button.addEventListener("click", async () => {', '  const { renderReport } =', '    await import("./reports.js");', '  renderReport();', '});'];
    K.panel(40, 80, 640, 250, 'main.js', { a: K.p(t, 0.3) });
    K.code(code, 64, 124, { size: 20, lh: 1.55, n: K.typed(t, code, [0.6, 2, 2.8, 4, 4.6], 40), t: t, a: K.p(t, 0.3), hi: t > 2.8 && t < 13 ? 2 : -1, w: 600 });
    var ini = K.p(t, 1.4);
    K.text('initial load', 740, 100, { size: 18, color: P.muted, a: ini });
    K.box(740, 118, 300, 40, { fill: P.acc, r: 6, a: ini * 0.8 });
    K.text('main.4c1e.js  60 KB', 890, 138, { size: 16, weight: 700, color: P.bg, align: 'center', a: ini });
    var click = K.p(t, 7, 0.3);
    K.chip('Reports', 800, 220, { size: 20, stroke: P.warm, a: K.p(t, 6.6), s: 1 - 0.1 * K.win(t, 7, 7.6, 0.2) });
    K.arrow(870, 220, 940, 220, { p: K.p(t, 7.4, 0.4), color: P.warm });
    K.box(950, 196, 280 * K.p(t, 7.8, 1.2), 48, { fill: P.warm, r: 6, a: click * 0.8 });
    K.text('reports.9d3a.js  140 KB', 1090, 220, { size: 16, weight: 700, color: P.bg, align: 'center', a: K.p(t, 9) });
    K.text('Promise → module namespace', 1090, 272, { size: 16, mono: true, color: P.muted, align: 'center', a: K.p(t, 9.6) });
    ['/settings route', 'chart library', 'rich editor', 'modal'].forEach(function (s, i) {
      K.chip(s, 160 + i * 190, 380, { size: 18, stroke: P.acc, a: K.p(t, 13.4 + i * 0.4) });
    });
    K.chip('cached by hashed name', 1040, 330, { size: 17, stroke: P.green, color: P.green, a: K.p(t, 15.4) });
    var w = K.p(t, 18.8);
    K.text('waterfall', 40, 460, { size: 18, color: P.red, a: w });
    [['a.js', 0], ['b.js', 1], ['c.js', 2]].forEach(function (c, i) {
      var q = K.p(t, 19 + i * 0.7, 0.6);
      K.box(160 + i * 220, 440 + i * 40, 210 * q, 32, { fill: P.red, r: 5, a: w * 0.7 });
      K.text(c[0], 180 + i * 220, 456 + i * 40, { size: 16, mono: true, weight: 700, color: P.bg, a: q });
    });
    K.chip('fix: preload known dependencies, or group them', 1040, 520, { size: 17, stroke: P.green, a: K.p(t, 21.4) });
  } },

/* 7 ─ resource hints */
{ d: 23, title: 'Resource hints',
  caps: [
    [0.3, 'Resource hints tell the browser what is coming. preload fetches something needed now, like the LCP image or a critical font.'],
    [7.5, 'modulepreload fetches a module and its imports early. preconnect warms up a connection to another origin.'],
    [13.5, 'prefetch fetches what the next navigation will probably need, at low priority.'],
    [18, 'Give the LCP image fetchpriority high. Preloading too much steals bandwidth from it.']],
  draw: function (K, t) {
    var P = K.P;
    var L = [['<link rel="preload" href="/hero.avif" as="image">', 0.8, 'needed now', P.warm],
             ['<link rel="preload" href="/inter.woff2" as="font" crossorigin>', 2.4, 'needed now', P.warm],
             ['<link rel="modulepreload" href="/app.8f2a.js">', 7.8, 'module + imports', P.purple],
             ['<link rel="preconnect" href="https://cdn.example.com">', 9.8, 'connection', P.blue],
             ['<link rel="prefetch" href="/reports.9d3a.js">', 13.8, 'next page, low', P.muted],
             ['<img src="/hero.avif" fetchpriority="high">', 18.3, 'LCP image first', P.green]];
    K.panel(40, 80, 1200, 360, 'index.html · <head>', { a: K.p(t, 0.4) });
    L.forEach(function (l, i) {
      var y = 124 + i * 50, q = K.p(t, l[1], 0.4);
      K.code([l[0]], 64, y, { size: 18, n: K.typed(t, [l[0]], [l[1]], 50), t: t, a: K.p(t, 0.4) * K.p(t, l[1] - 0.1, 0.1) });
      K.chip(l[2], 1110, y + 12, { size: 16, stroke: l[3], color: l[3], a: K.p(t, l[1] + 0.8) });
    });
    var bw = K.p(t, 19.6);
    K.text('bandwidth', 40, 488, { size: 18, color: P.muted, a: bw });
    K.box(180, 470, 1060, 36, { fill: P.code, r: 6, a: bw });
    K.box(180, 470, 300, 36, { fill: P.green, r: 6, a: bw * 0.8 });
    K.text('LCP image', 330, 488, { size: 16, weight: 700, color: P.bg, align: 'center', a: bw });
    [['font', 160, P.warm], ['8 extra preloads', 560, P.red]].forEach(function (s, i) {
      var x = i ? 650 : 484;
      K.box(x, 470, s[1], 36, { fill: s[2], r: 6, a: K.p(t, 20.2 + i * 0.4) * 0.75 });
      K.text(s[0], x + s[1] / 2, 488, { size: 16, weight: 700, color: P.bg, align: 'center', a: K.p(t, 20.2 + i * 0.4) });
    });
    K.text('too many preloads compete with the LCP image', 640, 546, { size: 18, color: P.red, align: 'center', a: K.p(t, 21) });
  } },

/* 8 ─ hashed caching */
{ d: 24, title: 'Caching with content hashes',
  caps: [
    [0.3, 'Name files by their content: app dot 8f2a dot js. Change one byte, and the hash changes.'],
    [7, 'Hashed files can be cached for a year with Cache-Control immutable. The browser never asks for them again.'],
    [13.5, 'The HTML is served with no-cache, so users pick up the new file names right after a deploy.'],
    [19, 'An old open page may then ask for a chunk that no longer exists. Catch the import error and reload.']],
  draw: function (K, t) {
    var P = K.P;
    var ch = K.p(t, 3.4, 0.6);
    K.chip('app.js', 160, 120, { size: 20, mono: true, stroke: P.line, a: K.p(t, 0.5) });
    K.arrow(230, 120, 330, 120, { p: K.p(t, 1, 0.4), color: P.muted });
    K.chip('app.8f2a.js', 440, 120, { size: 20, mono: true, stroke: P.green, a: K.p(t, 1.4) * (1 - ch) });
    K.chip('app.b71c.js', 440, 120, { size: 20, mono: true, stroke: P.warm, a: ch });
    K.text('one byte changed → new name', 760, 120, { size: 18, color: P.warm, a: K.p(t, 4) });
    var c1 = K.p(t, 7.2);
    K.box(40, 180, 600, 170, { stroke: P.green, a: c1 });
    K.text('/assets/app.b71c.js', 64, 212, { size: 19, mono: true, a: c1 });
    K.code(['Cache-Control: public, max-age=31536000,', '               immutable'], 64, 240, { size: 18, a: K.p(t, 7.8), n: K.typed(t, ['Cache-Control: public, max-age=31536000,', '               immutable'], [7.8, 9.4], 50), t: t });
    K.text('cached 1 year, never revalidated', 64, 324, { size: 17, color: P.green, a: K.p(t, 10.4) });
    var c2 = K.p(t, 13.8);
    K.box(680, 180, 560, 170, { stroke: P.blue, a: c2 });
    K.text('/index.html', 704, 212, { size: 19, mono: true, a: c2 });
    K.code(['Cache-Control: no-cache'], 704, 240, { size: 18, a: c2 });
    K.text('revalidated on every visit', 704, 290, { size: 17, color: P.blue, a: K.p(t, 14.8) });
    K.text('→ points at app.b71c.js', 704, 324, { size: 17, color: P.muted, a: K.p(t, 15.4) });
    var e = K.p(t, 19.2);
    var code = ['try { await import("./chart.77b0.js"); }', 'catch { location.reload(); }   // stale chunk after a deploy'];
    K.panel(40, 390, 1200, 120, '', { a: e });
    K.code(code, 64, 408, { size: 20, n: K.typed(t, code, [19.4, 21], 44), t: t, a: e });
    K.chip('or keep old chunks on the server for a while', 640, 552, { size: 18, stroke: P.acc, a: K.p(t, 22.4) });
  } },

/* 9 ─ analyze */
{ d: 21, title: 'What is in your bundle?',
  caps: [
    [0.3, 'Use a bundle analyzer to see what is really inside your JavaScript. One big dependency often dominates.'],
    [7, 'Judge the compressed size and the parse cost, not the raw file size. Third-party scripts often dominate main-thread time.'],
    [14, 'Target modern browsers with browserslist, so you do not ship syntax transforms and polyfills nobody needs.']],
  draw: function (K, t) {
    var P = K.P;
    var T = [[40, 80, 520, 320, 'moment + locales  290 KB', P.red, 0.8], [564, 80, 300, 200, 'chart.js  180 KB', P.warm, 1.4], [868, 80, 372, 200, 'your app code  150 KB', P.acc, 2],
             [564, 284, 200, 116, 'react-dom', P.blue, 2.6], [768, 284, 260, 116, 'polyfills  60 KB', P.purple, 3.2], [1032, 284, 208, 116, 'utils', P.green, 3.6]];
    T.forEach(function (b) {
      var q = K.p(t, b[6]);
      K.box(b[0], b[1], b[2], b[3], { fill: b[5], r: 8, a: q * 0.28 });
      K.box(b[0], b[1], b[2], b[3], { fill: false, stroke: b[5], r: 8, a: q });
      K.text(b[4], b[0] + 16, b[1] + 26, { size: 17, weight: 700, a: q });
    });
    K.text('swap for Temporal or date-fns', 300, 360, { size: 18, color: P.red, align: 'center', a: K.p(t, 4.6) });
    var s = K.p(t, 7.2);
    [['raw', '880 KB', P.muted], ['gzip / brotli', '260 KB', P.green], ['parse + run on a phone', '≈ 900 ms', P.warm]].forEach(function (r, i) {
      var q = K.p(t, 7.4 + i * 0.8);
      K.text(r[0], 64, 450 + i * 40, { size: 19, a: q * s });
      K.text(r[1], 560, 450 + i * 40, { size: 19, mono: true, color: r[2], align: 'right', a: q * s });
    });
    var b = K.p(t, 14.2);
    K.panel(640, 420, 600, 150, '.browserslistrc', { a: b });
    K.code(['> 0.5%, last 2 versions, not dead'], 664, 466, { size: 20, n: K.typed(t, ['> 0.5%, last 2 versions, not dead'], [14.6], 30), t: t, a: b });
    K.text('modern syntax ships as is', 664, 530, { size: 17, color: P.green, a: K.p(t, 16.4) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 24 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Bundlers build a module graph, transform, minify, hash and split',
     'Tree-shaking needs static ESM and honest sideEffects',
     'defer and module keep order after parsing; async does not',
     'import() splits code; preload what is needed now, prefetch what is next',
     'Hashed files cached for a year; HTML revalidated'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(200, y, true, 0.9, q);
      K.text(s, 232 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 24 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
