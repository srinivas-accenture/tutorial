/* Day 65 in motion: strict tsconfig, module settings that mirror the runtime, import type and erasable syntax, .d.ts files, exports, migration and an interview round. Loaded on demand by assets/js/motion.js. */
(function () {
  function col(x, c, s) { return x + c * s * 0.55; }
  function squig(K, x0, x1, y, a, color) {
    if (a <= 0) return; var g = K.g; g.save(); g.globalAlpha *= K.clamp(a); g.strokeStyle = color || K.P.red; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0, y + 1.5); for (var i = 1; x0 + i * 4 <= x1 + 2; i++) g.lineTo(x0 + i * 4, y + (i % 2 ? -1.5 : 1.5)); g.stroke(); g.restore();
  }
  function band(K, x, y, c0, c1, s, color, a) {
    if (a <= 0) return; K.box(col(x, c0, s) - 2, y - 3, (c1 - c0) * s * 0.55 + 4, s * 1.3, { fill: color, r: 4, a: a });
  }
  function tip(K, x, y, w, lines, a, ok) {
    if (a <= 0) return; var P = K.P, h = 30 + lines.length * 28;
    K.box(x, y, w, h, { fill: ok ? 'rgba(104,211,145,.10)' : 'rgba(252,129,129,.12)', stroke: ok ? P.green : P.red, a: a });
    K.mark(x + 24, y + 29, !!ok, 0.7, a);
    lines.forEach(function (l, i) { K.text(l, x + 48, y + 29 + i * 28, { size: 17, mono: true, color: i ? P.ink : (ok ? P.green : P.red), a: a }); });
  }

JSC.motion.define('day65', {
  kicker: 'JavaScript: Zero to Architect · Day 65',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 65: TypeScript in real projects. Configuration, modules, declaration files, migration, and an interview round.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Real projects', 0, 0, { size: 100, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 65 · TypeScript in real projects', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['tsconfig', 'Modules & .d.ts', 'Migration'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ strict */
{ d: 24, title: 'Turn on strict',
  caps: [
    [0.3, 'tsconfig.json is the settings panel of the checker. The first setting to turn on is strict.'],
    [6.5, 'strict switches on a family of checks. The big one is strictNullChecks: null and undefined become separate types.'],
    [13, 'So find returns User or undefined, and using the result unchecked is flagged.'],
    [18.5, 'noUncheckedIndexedAccess goes further: reading scores["bob"] may give undefined too.']],
  draw: function (K, t) {
    var P = K.P, cfg = ['{', '  "compilerOptions": {', '    "strict": true,', '    "noUncheckedIndexedAccess": true,', '    "exactOptionalPropertyTypes": true,', '    "noImplicitOverride": true', '  }', '}'];
    var hi = t > 18.6 ? 3 : t > 1.8 ? 2 : -1;
    K.panel(40, 80, 520, 500, 'tsconfig.json', { a: K.p(t, 0.2) });
    K.code(cfg, 66, 128, { size: 20, n: K.typed(t, cfg, [0.5, 0.7, 1.4, 2.6, 3.8, 5, 5.8, 5.9], 40), t: t, hi: hi, w: 490 });
    K.text('strict family', 920, 100, { size: 18, weight: 700, color: P.muted, align: 'center', a: K.p(t, 6.6) });
    ['noImplicitAny', 'strictNullChecks', 'strictFunctionTypes', 'strictBindCallApply', 'strictPropertyInitialization', 'useUnknownInCatchVariables'].forEach(function (s, i) {
      var big = i === 1, q = K.back((t - 7 - i * 0.35) / 0.5);
      if (q > 0) K.chip(s, 760 + (i % 2) * 320, 142 + Math.floor(i / 2) * 46, { size: 16, mono: true, stroke: big ? P.warm : P.acc, color: big ? P.warm : P.ink, s: q, a: K.clamp(q) });
    });
    var u = K.p(t, 13.2), C = ['const u = users.find((u) => u.id === id);', 'u.name;'];
    K.panel(600, 262, 640, 120, 'users.ts', { a: u });
    K.code(C, 626, 302, { size: 19, lh: 1.5, n: K.typed(t, C, [13.4, 15.4], 34), t: t, a: u });
    K.text('u: User | undefined', 1220, 302 + 38, { size: 16, mono: true, color: P.warm, align: 'right', a: K.win(t, 14.8, 18.4) });
    squig(K, col(626, 0, 19), col(626, 1, 19), 302 + 28 + 21, K.p(t, 16, 0.3));
    tip(K, 600, 396, 640, ["'u' is possibly 'undefined'.  ts(18048)"], K.p(t, 16.4), false);
    var s = K.p(t, 19.2), S = ['scores["bob"].toFixed(1);'];
    K.panel(600, 470, 640, 110, 'with noUncheckedIndexedAccess', { a: s });
    K.code(S, 626, 510, { size: 19, n: K.typed(t, S, [19.4], 30), t: t, a: s });
    squig(K, col(626, 0, 19), col(626, 13, 19), 510 + 22, K.p(t, 20.8, 0.3));
    K.text("Object is possibly 'undefined'.", 626, 556, { size: 17, mono: true, color: P.red, a: K.p(t, 21.2) });
  } },

/* 3 ─ modules mirror the runtime */
{ d: 24, title: 'Mirror the runtime',
  caps: [
    [0.3, 'Module settings must mirror how your code really runs.'],
    [6, 'A Node.js service uses module nodenext: ESM or CommonJS is decided per file, exactly as Node.js decides.'],
    [12, 'A bundled app uses moduleResolution bundler with noEmit: the bundler writes the JavaScript, tsc only checks.'],
    [18, 'Share one strict base config across the team, and extend it in every package.']],
  draw: function (K, t) {
    var P = K.P;
    function lane(x, title, lines, flow, at, c) {
      var a = K.p(t, at);
      K.box(x, 84, 580, 370, { fill: false, stroke: c, a: K.p(t, 0.4) });
      K.text(title, x + 24, 112, { size: 22, weight: 700, color: c, a: K.p(t, 0.4) });
      K.code(lines, x + 26, 150, { size: 20, lh: 1.5, n: K.typed(t, lines, [at + 0.2, at + 1.2, at + 2, at + 2.8], 34), t: t, a: a });
      flow.forEach(function (f, i) {
        var q = K.p(t, at + 3.6 + i * 0.5), fx = x + 70 + i * 145;
        K.chip(f, fx, 380, { size: 16, mono: true, stroke: i === 1 ? P.warm : P.line, a: q });
        if (i) K.arrow(fx - 145 + 52, 380, fx - 54, 380, { color: P.muted, lw: 2, head: 8, a: q });
      });
    }
    lane(40, 'Node.js service', ['"module": "nodenext",', '"target": "es2022",', '"outDir": "dist",', '"types": ["node"]'], ['src/*.ts', 'tsc', 'dist/*.js', 'node'], 6.2, P.green);
    K.text('tsc emits the JavaScript', 330, 426, { size: 17, color: P.muted, align: 'center', a: K.p(t, 10.4) });
    lane(660, 'Bundled app (Vite)', ['"module": "preserve",', '"moduleResolution": "bundler",', '"noEmit": true,', '"lib": ["DOM", "ES2023"]'], ['src/*.ts', 'Vite', 'bundle.js', 'browser'], 12.2, P.blue);
    K.text('tsc --noEmit only checks', 950, 426, { size: 17, color: P.muted, align: 'center', a: K.p(t, 16.4) });
    var b = K.back((t - 18.2) / 0.6);
    if (b > 0) K.chip('tsconfig.base.json · strict', 260, 530, { size: 19, mono: true, stroke: P.acc, s: b, a: K.clamp(b) });
    K.arrow(420, 530, 560, 530, { p: K.p(t, 18.8, 0.5), color: P.acc });
    K.text('"extends"', 490, 506, { size: 16, mono: true, color: P.acc, align: 'center', a: K.p(t, 19) });
    ['apps/web', 'services/api', 'packages/ui'].forEach(function (s, i) {
      K.chip(s, 660 + i * 200, 530, { size: 18, mono: true, stroke: P.line, a: K.p(t, 19.2 + i * 0.4) });
    });
  } },

/* 4 ─ import type and erasable syntax */
{ d: 24, title: 'JavaScript with types',
  caps: [
    [0.3, 'With verbatimModuleSyntax, what you write is what is emitted. Type-only imports must say import type.'],
    [6.5, 'At build time, import type lines vanish completely, and value imports stay exactly as written.'],
    [12.5, 'erasableSyntaxOnly forbids enums, namespaces and parameter properties, so any tool can simply strip types.'],
    [18.5, 'That is exactly the subset Node.js can run directly.']],
  draw: function (K, t) {
    var P = K.P, A = ['import type { User } from "./types.ts";', 'import { db } from "./db.ts";', 'export const find = (id: string): User =>', '  db.get(id);'];
    K.panel(40, 80, 600, 220, 'server.ts', { a: K.p(t, 0.2) });
    band(K, 66, 124, 0, 11, 20, 'rgba(79,209,197,.25)', K.win(t, 2, 6.4));
    var st = K.p(t, 7, 0.7);
    if (st > 0) K.arrow(64, 136, 64 + 39 * 11 * st, 136, { color: P.red, lw: 2.5, head: 0.1 });
    K.code(A, 66, 124, { size: 20, lh: 1.5, n: K.typed(t, A, [0.5, 1.8, 2.8, 4.2], 34), t: t });
    K.text('vanishes', 622, 124 + 10, { size: 16, color: P.red, align: 'right', a: K.p(t, 7.4) });
    K.arrow(644, 190, 676, 190, { p: K.p(t, 8, 0.4), color: P.warm });
    var B = ['import { db } from "./db.js";', 'export const find = (id) =>', '  db.get(id);'];
    K.panel(680, 80, 560, 220, 'server.js', { a: K.p(t, 8) });
    band(K, 706, 124, 20, 27, 20, 'rgba(246,173,85,.25)', K.p(t, 10.6));
    K.code(B, 706, 124, { size: 20, lh: 1.5, n: K.typed(t, B, [8.4, 9.4, 10.4], 34), t: t, a: K.p(t, 8) });
    K.text('.ts rewritten to .js', 1220, 254, { size: 16, color: P.warm, align: 'right', a: K.p(t, 11) });

    var e = K.p(t, 12.6);
    K.panel(40, 324, 1200, 256, 'erasableSyntaxOnly: true', { a: e });
    [['enum Color { Red }', 'const Color = { Red: "red" } as const;', 13], ['namespace Util { }', 'export function util() { }', 14.2], ['constructor(private x: number) {}', 'x; constructor(x) { this.x = x; }', 15.4]].forEach(function (r, i) {
      var y = 372 + i * 46, q = K.p(t, r[2]);
      K.code([r[0]], 90, y, { size: 19, a: q });
      squig(K, 90, 90 + r[0].length * 10.45, y + 22, K.p(t, r[2] + 0.4, 0.3));
      K.mark(70, y + 10, false, 0.6, q);
      K.arrow(470, y + 10, 520, y + 10, { color: P.muted, lw: 2, head: 8, a: K.p(t, r[2] + 0.6) });
      K.mark(556, y + 10, true, 0.6, K.p(t, r[2] + 0.8));
      K.code([r[1]], 580, y, { size: 19, a: K.p(t, r[2] + 0.8) });
    });
    K.text("TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.", 70, 528, { size: 16, mono: true, color: P.red, a: K.p(t, 16.6) });
    K.chip('exactly what Node.js strips and runs', 1000, 556, { size: 17, stroke: P.green, a: K.p(t, 18.8) });
  } },

/* 5 ─ declaration files */
{ d: 24, title: 'Declaration files',
  caps: [
    [0.3, 'A declaration file, ending in .d.ts, holds only types: the shape of code that lives somewhere else.'],
    [7, 'Most packages ship their own. For the rest, install community types from DefinitelyTyped: the @types packages.'],
    [12.5, 'For an untyped dependency, write declare module, and describe just the parts you use.'],
    [18.5, 'Module augmentation adds fields to a library type, such as user on the Express request.']],
  draw: function (K, t) {
    var P = K.P, A = ['export declare function parse(', '  input: string', '): { r: number; g: number; b: number } | null;'];
    K.panel(40, 80, 600, 180, 'index.d.ts', { a: K.p(t, 0.2) });
    K.code(A, 66, 124, { size: 19, lh: 1.5, n: K.typed(t, A, [0.6, 2, 2.8], 34), t: t });
    K.text('types only, no code', 620, 234, { size: 16, color: P.acc, align: 'right', a: K.p(t, 4.4) });
    K.arrow(644, 170, 676, 170, { p: K.p(t, 4.8, 0.4), color: P.muted });
    var B = ['export function parse(input) {', '  /* the real code */', '}'];
    K.panel(680, 80, 560, 180, 'index.js', { a: K.p(t, 4.8) });
    K.code(B, 706, 124, { size: 19, lh: 1.5, n: K.typed(t, B, [5, 5.8, 6.4], 40), t: t, a: K.p(t, 4.8) });
    K.chip('ships its own .d.ts', 340, 296, { size: 18, stroke: P.green, a: K.p(t, 7.4) });
    K.chip('npm i -D @types/node', 640, 296, { size: 18, mono: true, stroke: P.blue, a: K.p(t, 9.4) });
    K.text('DefinitelyTyped', 920, 296, { size: 18, color: P.muted, a: K.p(t, 10) });

    var c = K.p(t, 12.6), C = ['declare module "legacy-color" {', '  export function parse(s: string):', '    { r: number; g: number; b: number } | null;', '}'];
    K.panel(40, 336, 600, 244, 'vendor.d.ts', { a: c });
    K.code(C, 66, 380, { size: 19, lh: 1.5, n: K.typed(t, C, [12.8, 14.2, 15.4, 16.8], 40), t: t, a: c });
    K.text('import { parse } from "legacy-color" now type-checks', 66, 548, { size: 16, color: P.green, a: K.p(t, 17) });
    var d = K.p(t, 18.6), D = ['import "express";', 'declare module "express" {', '  interface Request {', '    user?: { id: string };', '  }', '}'];
    K.panel(680, 336, 560, 244, 'express.d.ts', { a: d });
    K.code(D, 706, 376, { size: 19, lh: 1.4, n: K.typed(t, D, [18.8, 19.6, 20.6, 21.4, 22.4, 22.5], 40), t: t, a: d });
    band(K, 706, 376 + 3 * 26.6, 4, 26, 19, 'rgba(104,211,145,.22)', K.p(t, 22.6));
  } },

/* 6 ─ exports */
{ d: 22, title: 'Publishing a library',
  caps: [
    [0.3, 'A library ships JavaScript plus .d.ts files, and points to both from package.json exports.'],
    [6, 'Tools walk the conditions in key order and take the first one that matches.'],
    [11.5, 'So types must come first. Listed after default, it is never reached, and TypeScript is left guessing.'],
    [17, 'Emit declarations with declaration: true, and test the package from both import and require.']],
  draw: function (K, t) {
    var P = K.P, E = ['"exports": {', '  ".": {', '    "import": {', '      "types": "./dist/index.d.mts",', '      "default": "./dist/index.mjs"', '    },',
      '    "require": {', '      "types": "./dist/index.d.cts",', '      "default": "./dist/index.cjs"', '    }', '  }', '}'];
    var hl = t > 9.4 ? 7 : t > 8.2 ? 4 : t > 6.6 ? 3 : -1;
    K.panel(40, 80, 640, 500, 'package.json', { a: K.p(t, 0.2) });
    K.code(E, 66, 124, { size: 19, lh: 1.5, n: K.typed(t, E, [0.5, 0.8, 1.1, 1.6, 2.4, 3.2, 3.3, 3.7, 4.5, 5.2, 5.3, 5.4], 44), t: t, hi: hl, w: 610 });
    [['TypeScript · import', 'index.d.mts', 6.6, P.acc], ['Node.js · import', 'index.mjs', 8.2, P.green], ['TypeScript · require', 'index.d.cts', 9.4, P.acc]].forEach(function (r, i) {
      var y = 110 + i * 60, q = K.p(t, r[2]);
      K.chip(r[0], 840, y, { size: 17, stroke: r[3], a: q });
      K.arrow(946, y, 990, y, { color: P.muted, lw: 2, head: 8, a: q });
      K.text(r[1], 1004, y, { size: 18, mono: true, color: r[3], a: K.p(t, r[2] + 0.4) });
    });
    var w = K.p(t, 11.6), W = ['".": {', '  "default": "./index.js",', '  "types": "./index.d.ts"', '}'];
    K.panel(720, 296, 520, 196, 'a broken package', { a: w, stroke: P.red });
    K.code(W, 746, 336, { size: 19, lh: 1.4, n: K.typed(t, W, [11.8, 12.4, 13.4, 14.4], 40), t: t, a: w, marks: t > 14.8 ? { 2: 'rgba(252,129,129,.2)' } : null, w: 490 });
    K.mark(760, 462, false, 0.7, K.p(t, 15)); K.text('"types" is never reached', 784, 462, { size: 18, color: P.red, a: K.p(t, 15) });
    K.chip('"declaration": true', 860, 540, { size: 17, mono: true, stroke: P.acc, a: K.p(t, 17.4) });
    K.chip('test import + require', 1110, 540, { size: 17, stroke: P.acc, a: K.p(t, 18.2) });
  } },

/* 7 ─ migration plan */
{ d: 26, title: 'Migrating to TypeScript',
  caps: [
    [0.3, 'Migrating a big JavaScript codebase is renovating a house while people live in it. No big rewrite.'],
    [6.5, 'First the tooling: allowJs, and tsc --noEmit in CI from day one.'],
    [12, 'Then // @ts-check and JSDoc comments give you types without renaming anything.'],
    [18, 'Rename files from the leaves of the import graph upward: utilities first, the entry point last.']],
  draw: function (K, t) {
    var P = K.P;
    [['allowJs + CI', 'tsc --noEmit', 6.6], ['@ts-check', 'JSDoc types', 12.2], ['leaves first', '.js → .ts', 18.2], ['strict', 'ratchet', 22.6], ['boundaries', 'typed APIs', 23.4]].forEach(function (s, i) {
      var x = 40 + i * 245, q = K.back((t - s[2]) / 0.6); if (q <= 0) return;
      K.g.save(); K.g.translate(x + 110, 140); K.g.scale(q, q);
      K.box(-110, -44, 220, 88, { stroke: P.acc, a: K.clamp(q) });
      K.text((i + 1) + ' · ' + s[0], 0, -12, { size: 20, weight: 700, align: 'center', a: K.clamp(q) });
      K.text(s[1], 0, 20, { size: 16, mono: true, color: P.muted, align: 'center', a: K.clamp(q) });
      K.g.restore();
      if (i) K.arrow(x - 22, 140, x - 4, 140, { color: P.muted, lw: 2, head: 8, a: K.clamp(q) });
    });
    var N = { app: [640, 260, 23.8], routes: [430, 350, 22.6], config: [860, 350, 21], api: [330, 440, 21.8], http: [580, 440, 21], utils: [760, 530, 19.2], types: [300, 530, 19.6] };
    var E = [['app', 'routes'], ['app', 'config'], ['routes', 'api'], ['routes', 'utils'], ['api', 'http'], ['api', 'types'], ['http', 'utils'], ['config', 'utils']];
    var ga = K.p(t, 0.8);
    E.forEach(function (e) {
      var a = N[e[0]], b = N[e[1]], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy);
      K.arrow(a[0] + dx / L * 60, a[1] + dy / L * 26, b[0] - dx / L * 64, b[1] - dy / L * 28, { color: P.line, lw: 2, head: 9, a: ga });
    });
    Object.keys(N).forEach(function (k) {
      var n = N[k], done = K.p(t, n[2], 0.5), name = k + (done > 0.5 ? '.ts' : '.js');
      K.chip(name, n[0], n[1], { size: 19, mono: true, stroke: done > 0.5 ? P.acc : P.warm, color: done > 0.5 ? P.acc : P.ink, a: ga, s: 1 + 0.15 * Math.sin(Math.PI * K.clamp((t - n[2]) / 0.6)) });
    });
    K.text('leaves: nothing to wait for', 1020, 530, { size: 17, color: P.acc, a: K.p(t, 19.4) });
    K.text('entry point: last', 820, 260, { size: 17, color: P.acc, a: K.p(t, 24) });
    K.text('import graph', 90, 260, { size: 18, weight: 700, color: P.muted, a: ga });
  } },

/* 8 ─ JSDoc + ratchet */
{ d: 24, title: 'JSDoc and the ratchet',
  caps: [
    [0.3, 'With // @ts-check, a plain .js file is checked using types written in JSDoc comments.'],
    [6.5, 'Errors appear in the editor exactly as in TypeScript files, and the code still runs unchanged.'],
    [12.5, 'Suppress old errors only with @ts-expect-error and a ticket, never silently.'],
    [18, 'A CI ratchet lets the counts of errors, suppressions and any only go down.']],
  draw: function (K, t) {
    var P = K.P, A = ['// @ts-check', '/** @param {User[]} users @param {string} id */', 'export function findUser(users, id) {', '  return users.find((u) => u.id === id);', '}', 'findUser(list, 42);'];
    var hi = t > 6.6 ? 5 : t > 1.4 ? 1 : -1;
    K.panel(40, 80, 640, 300, 'users.js', { a: K.p(t, 0.2) });
    K.code(A, 66, 124, { size: 19, lh: 1.6, n: K.typed(t, A, [0.4, 1.4, 3, 4.2, 5.4, 6.8], 40), t: t, hi: hi, w: 610 });
    squig(K, col(66, 15, 19), col(66, 17, 19), 124 + 5 * 30 + 21, K.p(t, 7.8, 0.3));
    tip(K, 40, 400, 640, ["Argument of type 'number' is not", "assignable to parameter of type 'string'."], K.p(t, 8.2), false);
    K.text('runs as plain JavaScript: the types are comments', 66, 528, { size: 17, color: P.green, a: K.p(t, 10) });

    var s = K.p(t, 12.6), S = ['// @ts-expect-error TODO(PAY-123): old API', 'legacyCall(oldShape);'];
    K.panel(720, 80, 520, 150, 'suppressions', { a: s });
    K.code(S, 744, 122, { size: 17, lh: 1.6, n: K.typed(t, S, [12.8, 14.6], 40), t: t, a: s });
    K.mark(760, 200, true, 0.6, K.p(t, 15.4)); K.text('ticket, and fails once fixed', 780, 200, { size: 16, color: P.green, a: K.p(t, 15.4) });
    K.mark(1040, 200, false, 0.6, K.p(t, 16.2)); K.text('// @ts-ignore', 1060, 200, { size: 16, mono: true, color: P.red, a: K.p(t, 16.2) });

    var r = K.p(t, 18.2);
    K.box(720, 256, 520, 324, { stroke: P.purple, a: r });
    K.text('CI ratchet', 744, 284, { size: 20, weight: 700, color: P.purple, a: r });
    K.text('baseline → now', 1216, 284, { size: 16, color: P.muted, align: 'right', a: r });
    [['errors', 12, 8, true], ['suppressions', 30, 31, false], ['any', 41, 35, true]].forEach(function (m, i) {
      var y = 340 + i * 76, q = K.p(t, 18.8 + i * 0.6), w0 = m[1] * 6, w1 = m[2] * 6;
      K.text(m[0], 744, y, { size: 18, color: P.ink, a: q });
      K.box(900, y - 22, w0, 14, { fill: P.line, r: 4, a: q });
      K.box(900, y + 2, w1 * K.p(t, 19.2 + i * 0.6, 0.8), 14, { fill: m[3] ? P.green : P.red, r: 4, a: q });
      K.text(m[1] + ' → ' + m[2], 900, y + 34, { size: 16, mono: true, color: m[3] ? P.green : P.red, a: K.p(t, 19.8 + i * 0.6) });
      K.mark(1210, y, m[3], 0.7, K.p(t, 20 + i * 0.6));
    });
    K.text('CI fails: suppressions went up', 980, 562, { size: 17, color: P.red, align: 'center', a: K.p(t, 21.6) });
  } },

/* 9 ─ interview round */
{ d: 24, title: 'Interview round',
  caps: [
    [0.3, 'Interview round. Is TypeScript slower at runtime? No. Types are erased, and the output is the JavaScript you would write by hand.'],
    [7, 'any versus unknown? any switches checking off. unknown must be narrowed before you can use it.'],
    [13, 'What does strict enable? A family of checks, and strictNullChecks matters most.'],
    [18.5, 'How would you migrate? CI first, JSDoc, leaves first, strict early, and a ratchet.']],
  draw: function (K, t) {
    var P = K.P;
    [['Is TypeScript slower at runtime?', ['No. Types are erased; the output', 'is the JS you would write by hand.'], 0.6, P.acc],
     ['any vs unknown?', ['any switches checking off.', 'unknown must be narrowed first.'], 7.2, P.warm],
     ['What does strict enable?', ['A family of checks;', 'strictNullChecks matters most.'], 13.2, P.purple],
     ['How would you migrate?', ['CI first, JSDoc, leaves first,', 'strict early, and a ratchet.'], 18.7, P.green]].forEach(function (c, i) {
      var x = 40 + (i % 2) * 610, y = 84 + Math.floor(i / 2) * 256, q = K.back((t - c[2]) / 0.6);
      if (q <= 0) return;
      K.g.save(); K.g.translate(x + 295, y + 116); K.g.scale(q, q); K.g.translate(-x - 295, -y - 116);
      K.box(x, y, 590, 232, { stroke: c[3], a: K.clamp(q) });
      K.text('Q' + (i + 1), x + 28, y + 40, { size: 20, weight: 800, color: c[3], a: K.clamp(q) });
      K.text(c[0], x + 76, y + 40, { size: 23, weight: 700, a: K.clamp(q) });
      K.g.restore();
      c[1].forEach(function (l, j) { K.text(l, x + 76, y + 110 + j * 40, { size: 21, color: P.ink, a: K.p(t, c[2] + 1.6 + j * 0.6) }); });
      K.mark(x + 44, y + 110, true, 0.8, K.p(t, c[2] + 1.6));
    });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 65 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['strict on from day one, plus noUncheckedIndexedAccess',
     'Module settings mirror the runtime: nodenext or bundler',
     'import type + erasableSyntaxOnly: JavaScript with types',
     '.d.ts files describe code; "types" first in exports',
     'Migrate leaves first, with CI checks and a ratchet'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(250, y, true, 0.9, q);
      K.text(s, 282 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 65 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
})();
