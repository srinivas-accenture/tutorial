/* Day 41 in motion: the four OOP pillars in JavaScript, composition and mixins, three ways to build objects, SOLID and a class-design exercise.
   Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day41', {
  kicker: 'JavaScript: Zero to Architect · Day 41',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 41: object-oriented programming in JavaScript, from the four pillars to SOLID design.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Object-oriented', 0, 0, { size: 96, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 41 · Classes, composition and SOLID', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['The four pillars', 'Composition and mixins', 'SOLID design'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 360 + i * 280, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ encapsulation and abstraction */
{ d: 25, title: 'Encapsulation and abstraction',
  caps: [
    [0.3, 'Object-oriented code bundles data with the behaviour that uses it. In JavaScript, a class is the usual way to do that.'],
    [6.5, 'Encapsulation: a #private field can only be read by code inside the class body.'],
    [13, 'Abstraction: callers use a small public interface, area() and radius, and never touch the internals.'],
    [19, 'The old _name convention is not private at all. Use #fields or closures for real privacy.']],
  draw: function (K, t) {
    var P = K.P, code = ['class Circle {', '  #r;', '  constructor(r) { this.#r = r; }', '  get radius() { return this.#r; }', '  area() { return Math.PI * this.#r ** 2; }', '}'];
    var hi = t > 13.2 ? (t > 16 ? 4 : 3) : t > 6.8 ? 1 : -1;
    K.panel(40, 90, 620, 270, 'circle.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 140, { size: 22, n: K.typed(t, code, [0.8, 1.6, 2.2, 3.4, 4.6, 5.8], 30), t: t, hi: hi, w: 590 });
    var o = K.p(t, 2.6);
    K.box(720, 90, 500, 300, { stroke: P.acc, a: o });
    K.text('c = new Circle(2)', 744, 120, { size: 19, mono: true, color: P.muted, a: o });
    var pv = K.p(t, 7.2);
    K.box(760, 150, 420, 110, { fill: P.code, stroke: P.warm, dash: [8, 6], a: pv });
    K.lock(800, 200, 1, P.warm, pv);
    K.text('#r: 2', 830, 200, { size: 26, mono: true, color: P.warm, a: pv });
    K.text('private: only the class body', 960, 200, { size: 17, color: P.muted, a: pv });
    var pub = K.p(t, 13.4), glow = t > 13.4 && t < 19 ? P.green : P.acc;
    K.text('public interface', 970, 290, { size: 17, color: P.muted, align: 'center', a: pub });
    K.chip('area()', 880, 340, { mono: true, size: 21, stroke: glow, s: K.back((t - 13.6) / 0.5), a: pub });
    K.chip('radius', 1060, 340, { mono: true, size: 21, stroke: glow, s: K.back((t - 14) / 0.5), a: pub });
    K.panel(40, 390, 620, 200, 'Console', { a: K.p(t, 8.6) });
    var L = [['c.radius', '2', 9, P.ink], ['c.area()', '12.57', 10, P.ink], ['c.r', 'undefined', 11, P.muted], ['c.#r', 'SyntaxError outside the class', 12, P.red]];
    L.forEach(function (l, i) {
      var y = 440 + i * 38, q = K.p(t, l[2], 0.4);
      K.text(l[0], 66, y, { size: 20, mono: true, a: q });
      K.text('→ ' + l[1], 200, y, { size: 20, mono: true, color: l[3], a: q });
    });
    K.mark(630, 554, false, 0.75, K.p(t, 12.2));
    var cw = K.win(t, 14.4, 19.2);
    K.chip('caller', 970, 470, { size: 20, stroke: P.blue, a: cw });
    K.arrow(930, 450, 885, 372, { p: K.p(t, 14.8, 0.4), color: P.green, a: cw });
    K.arrow(1010, 450, 1055, 372, { p: K.p(t, 15, 0.4), color: P.green, a: cw });
    K.text('no idea how area is computed', 970, 530, { size: 17, color: P.muted, align: 'center', a: cw });
    var u = K.p(t, 19.4);
    K.box(700, 420, 540, 160, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: u });
    K.code(['this._r = r;  // only a naming hint', 'c._r = -5;    // anyone can do this'], 724, 440, { size: 20, a: u });
    K.mark(1210, 492, false, 0.8, K.p(t, 20.4));
    K.chip('#r or a closure: truly private', 970, 544, { size: 18, stroke: P.green, a: K.p(t, 21.4) });
  } },

/* 3 ─ abstract base and inheritance */
{ d: 25, title: 'Abstract classes and inheritance',
  caps: [
    [0.3, 'JavaScript has no abstract keyword. A base class can throw when new.target is itself, and in methods it leaves unimplemented.'],
    [7, 'Inheritance: class Circle extends Shape, and super() must run the parent constructor before this is used.'],
    [13, 'Under the hood this is the prototype chain: c.area() is looked up on c, then Circle.prototype, then Shape.prototype.'],
    [19.5, 'So c instanceof Circle and c instanceof Shape are both true. A class is syntax over prototypes.']],
  draw: function (K, t) {
    var P = K.P, code = ['class Shape {', '  constructor() {', '    if (new.target === Shape)', '      throw new TypeError("abstract");', '  }',
      '  area() { throw new Error("not implemented"); }', '}', 'class Circle extends Shape {', '  #r;', '  constructor(r) { super(); this.#r = r; }',
      '  area() { return Math.PI * this.#r ** 2; }', '}'];
    var st = [0.6, 0.9, 1.3, 1.8, 2.3, 2.5, 3.2, 7.2, 7.8, 8.2, 9.4, 10.4];
    var hi = t > 19.5 ? -1 : t > 13.2 ? 10 : t > 9 ? 9 : t > 7.4 ? 7 : t > 3.6 ? 2 : -1;
    K.panel(40, 90, 640, 470, 'shapes.js', { a: K.p(t, 0.2) });
    K.code(code, 64, 136, { size: 20, lh: 1.6, n: K.typed(t, code, st, 40), t: t, hi: hi, w: 610 });
    var e = K.win(t, 4, 13);
    K.chip('new Shape()', 840, 130, { mono: true, size: 21, stroke: P.red, a: e });
    K.arrow(920, 130, 960, 130, { p: K.p(t, 4.4, 0.4), color: P.red, a: e });
    K.text('TypeError: abstract', 976, 130, { size: 20, mono: true, color: P.red, a: K.p(t, 4.8) * e });
    var f = K.win(t, 8.4, 13);
    [['new Circle(2)', P.acc], ['super() → Shape constructor', P.purple], ['new.target is Circle  ✓', P.green], ['then this.#r = 2', P.warm]].forEach(function (c, i) {
      var q = K.p(t, 8.6 + i * 0.9, 0.4) * f, y = 220 + i * 80;
      K.chip(c[0], 980, y, { mono: i !== 2, size: 20, stroke: c[1], a: q });
      if (i) K.arrow(980, y - 56, 980, y - 26, { p: K.p(t, 8.4 + i * 0.9, 0.4), color: P.muted, a: f });
    });
    var B = [['c', '{ #r: 2 }', 13.4], ['Circle.prototype', 'area()', 14.2], ['Shape.prototype', 'area()', 15], ['Object.prototype', 'toString()', 15.8]];
    B.forEach(function (b, i) {
      var y = 110 + i * 100, q = K.p(t, b[2], 0.5), found = i === 1 && t > 17.2;
      K.box(760, y, 440, 64, { stroke: found ? P.green : i ? P.line : P.acc, lw: found ? 3 : 2, a: q });
      K.text(b[0], 784, y + 32, { size: 21, mono: true, weight: 700, a: q });
      K.text(b[1], 1176, y + 32, { size: 19, mono: true, align: 'right', color: found ? P.green : P.muted, a: q });
      if (i) K.arrow(980, y - 34, 980, y - 6, { p: K.p(t, b[2] - 0.2, 0.4), color: P.muted });
    });
    K.text('[[Prototype]] links', 1000, 192, { size: 16, color: P.muted, a: K.p(t, 14.4) });
    K.text('c.area(): not on c… found on Circle.prototype', 760, 520, { size: 18, color: P.green, a: K.win(t, 16.6, 19.4) });
    var r = K.p(t, 19.8);
    K.mark(774, 506, true, 0.8, r); K.text('c instanceof Circle  // true', 800, 506, { size: 19, mono: true, a: r });
    var r2 = K.p(t, 20.8);
    K.mark(774, 552, true, 0.8, r2); K.text('c instanceof Shape   // true', 800, 552, { size: 19, mono: true, a: r2 });
  } },

/* 4 ─ polymorphism */
{ d: 23, title: 'Polymorphism',
  caps: [
    [0.3, 'Polymorphism: one call, many behaviours. s.area() runs the version that belongs to each object.'],
    [8, 'The caller depends only on the contract, so a new Triangle class plugs in without editing it.'],
    [15, 'JavaScript also has duck typing: any object with an area method works, even without extends.']],
  draw: function (K, t) {
    var P = K.P, code = ['const shapes = [new Circle(1), new Rect(2, 3)];', 'shapes.map((s) => s.area());   // [3.14, 6]'];
    K.panel(40, 90, 1200, 130, 'polymorphism.js', { a: K.p(t, 0.2) });
    K.code(code, 66, 132, { size: 22, n: K.typed(t, code, [0.6, 2.4], 34), t: t });
    var q0 = K.back((t - 3.2) / 0.5);
    if (q0 > 0) K.chip('s.area()', 200, 410, { s: q0, mono: true, size: 26, stroke: P.acc });
    var R = [['Circle', 'π · r²', '3.14', P.acc, 3.8, false], ['Rect', 'w · h', '6', P.acc, 4.8, false],
             ['Triangle', '½ · b · h', '6', P.blue, 9.2, false], ['{ area: () => 9 }', 'no extends', '9', P.purple, 15.6, true]];
    R.forEach(function (r, i) {
      var y = 290 + i * 80, q = K.p(t, r[4], 0.5);
      K.arrow(290, 410, 520, y, { p: K.p(t, r[4] - 0.2, 0.5), color: r[3], dash: r[5] ? [7, 6] : null });
      K.box(530, y - 30, 380, 60, { stroke: r[3], dash: r[5] ? [7, 6] : null, a: q });
      K.text(r[0], 552, y, { size: 21, mono: true, weight: 700, a: q });
      K.text(r[1], 888, y, { size: 19, align: 'right', color: P.muted, a: q });
      K.arrow(920, y, 990, y, { p: K.p(t, r[4] + 0.6, 0.4), color: P.muted });
      K.text(r[2], 1010, y, { size: 24, mono: true, color: P.warm, a: K.p(t, r[4] + 0.9) });
    });
    K.text('new class, caller unchanged', 1060, 450, { size: 17, color: P.blue, a: K.p(t, 10.4) });
    K.box(70, 470, 260, 80, { fill: P.code, stroke: P.line, a: K.p(t, 11) });
    K.text('contract: area()', 200, 498, { size: 18, align: 'center', a: K.p(t, 11) });
    K.lock(200, 528, 0.7, P.green, K.p(t, 11.6));
    K.text('duck typing', 1060, 530, { size: 17, color: P.purple, a: K.p(t, 16.6) });
  } },

/* 5 ─ composition and mixins */
{ d: 27, title: 'Composition and mixins',
  caps: [
    [0.3, 'Deep hierarchies get brittle: change a parent and many children break. This is the fragile base class problem.'],
    [7, 'Composition builds objects from small behaviours instead. canFly and canSwim snap together into a duck.'],
    [14, 'A mixin is a function that takes a class and returns a subclass. Stack them like Eq(Serializable(Point)).'],
    [21, 'If two mixins define the same method name, the outer one silently wins, so order matters.']],
  draw: function (K, t) {
    var P = K.P, dim = 1 - K.p(t, 7, 0.8) * 0.6;
    var T = [['Animal', 320, 120, 0], ['Bird', 200, 210, 1], ['Fish', 440, 210, 1], ['Penguin', 120, 300, 2], ['Duck', 280, 300, 2]];
    var hot = t > 3.2 && t < 7.4;
    T.forEach(function (n, i) {
      var q = K.p(t, 0.6 + i * 0.4, 0.4) * dim, bad = hot && (i === 0 || i === 1 || i === 3 || i === 4) && t > 3.6 + n[3] * 0.6;
      if (i) { var par = i < 3 ? T[0] : T[1]; K.arrow(par[1], par[2] + 24, n[1], n[2] - 24, { p: K.p(t, 0.6 + i * 0.4, 0.4), color: bad ? P.red : P.muted, a: dim }); }
      K.chip(n[0], n[1], n[2], { size: 20, stroke: bad ? P.red : P.line, a: q });
    });
    K.text('Animal changes → every child at risk', 330, 376, { size: 17, color: P.red, align: 'center', a: K.p(t, 3.6) * dim });
    K.text('penguins inherit fly()', 120, 336, { size: 16, color: P.warm, align: 'center', a: K.win(t, 5, 7.6) });
    var c1 = K.back((t - 7.6) / 0.5), c2 = K.back((t - 8.2) / 0.5);
    if (c1 > 0) K.chip('canFly → fly()', 150, 430, { s: c1, size: 19, mono: true, stroke: P.blue });
    if (c2 > 0) K.chip('canSwim → swim()', 380, 430, { s: c2, size: 19, mono: true, stroke: P.blue });
    var m = K.p(t, 9.2, 0.6);
    K.arrow(170, 455, 250, 488, { p: m, color: P.blue }); K.arrow(370, 455, 300, 488, { p: m, color: P.blue });
    K.box(150, 495, 250, 50, { stroke: P.green, a: K.p(t, 9.8) });
    K.text('duck: fly() + swim()', 275, 520, { size: 19, mono: true, align: 'center', a: K.p(t, 9.8) });
    K.text('Object.assign(s, canFly(s), canSwim(s))', 40, 572, { size: 18, mono: true, color: P.muted, a: K.p(t, 10.6) });
    var code = ['const Serializable = (Base) =>', '  class extends Base { serialize() { … } };', 'const Eq = (Base) =>', '  class extends Base { equals(o) { … } };', 'class SmartPoint', '  extends Eq(Serializable(Point)) {}'];
    K.panel(620, 90, 620, 260, 'mixins.js', { a: K.p(t, 14) });
    K.code(code, 644, 134, { size: 20, lh: 1.55, n: K.typed(t, code, [14.3, 15.2, 16.4, 16.9, 17.8, 18.3], 40), t: t, hi: t > 18.2 && t < 21 ? 5 : -1, w: 590, a: K.p(t, 14) });
    var C = [['SmartPoint', P.acc], ['Eq', P.purple], ['Serializable', P.purple], ['Point', P.blue]];
    C.forEach(function (c, i) {
      var x = 660 + i * 148, q = K.p(t, 19 + i * 0.4, 0.4);
      K.box(x, 380, 132, 56, { stroke: c[1], a: q });
      K.text(c[0], x + 66, 408, { size: c[0].length > 10 ? 16 : 18, mono: true, align: 'center', a: q });
      if (i) K.arrow(x - 14, 408, x - 2, 408, { p: q, color: P.muted, head: 8, lw: 2 });
    });
    K.text('each mixin is a link in the class chain', 930, 460, { size: 16, color: P.muted, align: 'center', a: K.p(t, 20.4) });
    var w = K.p(t, 21.4);
    K.box(640, 490, 580, 92, { fill: 'rgba(246,173,85,.10)', stroke: P.warm, a: w });
    K.text('A(B(Base)): both define save()', 664, 518, { size: 19, mono: true, a: w });
    K.text('→ A.save wins; B.save is shadowed', 664, 556, { size: 19, mono: true, color: P.warm, a: K.p(t, 22.6) });
  } },

/* 6 ─ three ways to build objects */
{ d: 25, title: 'Three ways to build objects',
  caps: [
    [0.3, 'There are three ways to build objects. A class keeps one copy of each method on the prototype, and instanceof works.'],
    [7.5, 'A factory function returns an object literal. Its closure gives true privacy, but every instance gets its own method copies.'],
    [14.5, 'Object.create links a new object straight to a prototype you choose: plain delegation, no constructor.'],
    [20, 'Prefer classes for many instances, factories for flexible private state. Keep hierarchies shallow either way.']],
  draw: function (K, t) {
    var P = K.P;
    var cols = [
      ['class', ['class Counter {', '  #n = 0;', '  inc() { return ++this.#n; }', '}'], 0.6],
      ['factory', ['const makeCounter = () => {', '  let n = 0;', '  return { inc: () => ++n };', '};'], 7.8],
      ['Object.create', ['const proto = {', '  inc() { return ++this.n; }', '};', 'const c = Object.create(proto);', 'c.n = 0;'], 14.8]];
    var rows = [['shared methods', [true, false, true]], ['instanceof', [true, false, false]], ['private state', [true, true, false]]];
    cols.forEach(function (c, i) {
      var x = 40 + i * 410, s0 = c[2], a = K.p(t, s0 - 0.2), pick = i === 0 && t > 20.2;
      K.panel(x, 90, 390, 230, c[0], { a: a, stroke: pick ? P.acc : P.line });
      K.code(c[1], x + 20, 132, { size: 19, lh: 1.5, n: K.typed(t, c[1], c[1].map(function (_, k) { return s0 + 0.3 + k * 0.9; }), 36), t: t, a: a });
      rows.forEach(function (r, k) {
        var y = 488 + k * 38, q = K.p(t, s0 + 4.4 + k * 0.5, 0.4);
        K.mark(x + 26, y, r[1][i], 0.65, q);
        K.text(r[0], x + 48, y, { size: 18, color: r[1][i] ? P.ink : P.muted, a: q });
      });
    });
    /* memory pictures */
    var q1 = K.p(t, 3.2);
    ['k1', 'k2'].forEach(function (n, i) { K.chip(n, 90 + i * 110, 360, { mono: true, size: 18, stroke: P.acc, a: q1 }); K.arrow(90 + i * 110, 380, 230 - i * 20, 410, { p: K.p(t, 3.6, 0.4), color: P.muted, lw: 2, head: 9 }); });
    K.box(110, 412, 260, 42, { stroke: P.green, a: K.p(t, 4) });
    K.text('Counter.prototype.inc', 240, 433, { size: 16, mono: true, align: 'center', a: K.p(t, 4) });
    var q2 = K.p(t, 10.4);
    ['f1', 'f2'].forEach(function (n, i) {
      var x = 520 + i * 180;
      K.chip(n, x, 360, { mono: true, size: 18, stroke: P.warm, a: q2 });
      K.arrow(x, 380, x, 406, { p: K.p(t, 10.8, 0.4), color: P.muted, lw: 2, head: 9 });
      K.box(x - 75, 410, 150, 42, { stroke: P.warm, a: K.p(t, 11.2) });
      K.text('inc copy ' + (i + 1), x, 431, { size: 16, mono: true, align: 'center', a: K.p(t, 11.2) });
    });
    var q3 = K.p(t, 17);
    K.chip('c', 960, 360, { mono: true, size: 18, stroke: P.blue, a: q3 });
    K.arrow(990, 360, 1060, 360, { p: K.p(t, 17.4, 0.4), color: P.blue, lw: 2, head: 9 });
    K.box(1070, 340, 150, 42, { stroke: P.blue, a: K.p(t, 17.8) }); K.text('proto.inc', 1145, 361, { size: 16, mono: true, align: 'center', a: K.p(t, 17.8) });
    K.text('delegates', 1025, 410, { size: 16, color: P.muted, align: 'center', a: K.p(t, 18) });
  } },

/* 7 ─ SOLID: S and O */
{ d: 25, title: 'SOLID: S and O',
  caps: [
    [0.3, 'SOLID is five design rules. S is single responsibility: a module has one reason to change.'],
    [7, 'So keep calculation, formatting and saving apart. Each part can be tested and changed on its own.'],
    [13.5, 'O is open/closed: extend by adding, not editing. A new discount is a new entry in a strategy map.'],
    [20, 'price() never changes. New behaviour arrives as new code, not as another branch in a growing switch.']],
  draw: function (K, t) {
    var P = K.P;
    var L = [['S', 'Single responsibility'], ['O', 'Open/closed'], ['L', 'Liskov substitution'], ['I', 'Interface segregation'], ['D', 'Dependency inversion']];
    L.forEach(function (l, i) {
      var x = 140 + i * 250, q = K.back((t - 0.8 - i * 0.3) / 0.5), on = (i === 0 && t > 1.5 && t < 13.5) || (i === 1 && t > 13.5);
      if (q <= 0) return;
      K.box(x - 110, 80, 220, 104, { stroke: on ? P.acc : P.line, lw: on ? 3 : 2, a: K.clamp(q) });
      K.text(l[0], x, 116, { size: 38, weight: 800, align: 'center', color: on ? P.acc : P.ink, a: K.clamp(q) });
      K.text(l[1], x, 160, { size: 16, align: 'center', color: P.muted, a: K.clamp(q) });
    });
    var big = K.p(t, 3.4) * (1 - K.p(t, 7.6, 0.6));
    K.box(60, 250, 520, 70, { stroke: P.red, a: big });
    K.text('checkout(): calc + format + save', 320, 285, { size: 21, mono: true, align: 'center', a: big });
    K.text('three reasons to change', 320, 345, { size: 17, color: P.red, align: 'center', a: big });
    var S = [['total(items)', '→ 6', P.acc], ['render(6)', '→ "Total: $6.00"', P.blue], ['save(order)', '→ database', P.purple]];
    S.forEach(function (s, i) {
      var y = 270 + i * 100, q = K.p(t, 7.8 + i * 0.6, 0.5);
      K.box(60, y - 32, 520, 64, { stroke: s[2], a: q });
      K.text(s[0], 84, y, { size: 21, mono: true, a: q });
      K.text(s[1], 560, y, { size: 19, mono: true, align: 'right', color: P.muted, a: q });
      K.mark(36, y, true, 0.6, K.p(t, 10 + i * 0.4));
    });
    var code = ['const discounts = {', '  percent: (p, v) => p * (1 - v / 100),', '  flat: (p, v) => Math.max(0, p - v),', '};', 'discounts.bogo = (p) => p / 2;  // new',
      'const price = (p, k, v) =>', '  discounts[k](p, v);'];
    K.panel(640, 220, 600, 290, 'pricing.js', { a: K.p(t, 13.6) });
    K.code(code, 664, 262, { size: 20, lh: 1.5, n: K.typed(t, code, [13.9, 14.4, 15.4, 16.3, 16.8, 18, 18.6], 40), t: t, hi: t > 17.2 && t < 20 ? 4 : -1, w: 570, a: K.p(t, 13.6) });
    K.lock(1206, 490, 0.8, P.green, K.p(t, 20.4));
    K.text('price(100, "bogo")  →  50', 660, 560, { size: 21, mono: true, color: P.green, a: K.p(t, 20.6) });
    K.text('unchanged', 1180, 560, { size: 17, color: P.green, align: 'right', a: K.p(t, 21.2) });
  } },

/* 8 ─ SOLID: L, I and D */
{ d: 28, title: 'SOLID: L, I and D',
  caps: [
    [0.3, 'L is Liskov substitution: a subtype must work anywhere its parent does. Square extends Rectangle breaks that.'],
    [7.5, 'grow sets width 5, then height 2. A Rectangle gives 10, a Square gives 4. The hierarchy is wrong.'],
    [14.5, 'I is interface segregation: depend only on the methods you call. Small interfaces compose.'],
    [20.5, 'D is dependency inversion: pass the clock, logger and repository in, so tests can inject fakes.']],
  draw: function (K, t) {
    var P = K.P, code = ['class Square extends Rectangle {', '  setWidth(w) { this.w = this.h = w; }', '  setHeight(h) { this.w = this.h = h; }', '}',
      'const grow = (r) => {', '  r.setWidth(5); r.setHeight(2);', '  return r.area();', '};'];
    K.chip('L', 70, 112, { size: 22, weight: 800, stroke: P.acc, a: K.p(t, 0.3) });
    K.panel(40, 140, 580, 290, 'liskov.js', { a: K.p(t, 0.5) });
    K.code(code, 64, 184, { size: 20, lh: 1.5, n: K.typed(t, code, [0.9, 1.9, 3, 4, 7.7, 8.4, 9.4, 10], 40), t: t, hi: t > 8.4 && t < 14.5 ? 5 : t > 1.8 && t < 7.5 ? 1 : -1, w: 550 });
    var r1 = K.p(t, 10.6), r2 = K.p(t, 11.8);
    K.mark(60, 466, true, 0.75, r1); K.text('grow(new Rectangle(1, 1))  →  10', 86, 466, { size: 19, mono: true, a: r1 });
    K.mark(60, 506, false, 0.75, r2); K.text('grow(new Square(1, 1))     →  4', 86, 506, { size: 19, mono: true, color: P.red, a: r2 });
    K.text('fix: no extends, share an area() interface', 60, 556, { size: 18, color: P.green, a: K.p(t, 12.8) });
    var ia = K.p(t, 14.6);
    K.chip('I', 690, 112, { size: 22, weight: 800, stroke: P.acc, a: ia });
    K.chip('printer { print }', 830, 170, { mono: true, size: 18, stroke: P.blue, a: K.p(t, 15) });
    K.chip('scanner { scan }', 1090, 170, { mono: true, size: 18, stroke: P.blue, a: K.p(t, 15.5) });
    var mm = K.p(t, 16.6);
    K.arrow(870, 196, 940, 240, { p: mm, color: P.blue, lw: 2 }); K.arrow(1050, 196, 990, 240, { p: mm, color: P.blue, lw: 2 });
    K.chip('{ ...printer, ...scanner }', 965, 266, { mono: true, size: 18, stroke: P.green, a: K.p(t, 17.2) });
    K.text('a function that prints needs only print()', 965, 318, { size: 17, color: P.muted, align: 'center', a: K.p(t, 18) });
    var da = K.p(t, 20.6);
    K.chip('D', 690, 372, { size: 22, weight: 800, stroke: P.acc, a: da });
    K.box(740, 350, 280, 70, { stroke: P.acc, a: da });
    K.text('OrderService', 880, 385, { size: 21, mono: true, weight: 700, align: 'center', a: da });
    var real = 1 - K.p(t, 24.4, 0.6);
    [['clock', 'Date.now', '() => 42'], ['logger', 'console.log', 'logs.push'], ['repo', 'database', 'in-memory']].forEach(function (d, i) {
      var y = 460 + i * 44, q = K.p(t, 21.2 + i * 0.5, 0.4);
      K.text(d[0], 760, y, { size: 19, mono: true, color: P.warm, a: q });
      K.arrow(840, y, 900, y, { p: q, color: P.muted, lw: 2, head: 9 });
      K.text(d[1], 916, y, { size: 19, mono: true, a: q * real });
      K.text(d[2], 916, y, { size: 19, mono: true, color: P.green, a: K.p(t, 24.6 + i * 0.3) });
    });
    K.text('test fakes', 1140, 504, { size: 17, color: P.green, align: 'center', a: K.p(t, 25.4) });
  } },

/* 9 ─ class-design exercise */
{ d: 27, title: 'Design exercise: a parking lot',
  caps: [
    [0.3, 'Class-design interviews follow a method: clarify requirements, list nouns and verbs, then define the public API first.'],
    [7.5, 'Keep state private and inject the clock, so a test can control time.'],
    [13, 'Handle edge cases explicitly: a full lot, a duplicate plate, an unknown vehicle.'],
    [19.5, 'With the fake clock at 90 minutes, the fee rounds up to two hours: 20. SOLID is guidance, not law.']],
  draw: function (K, t) {
    var P = K.P;
    var M = ['Clarify requirements', 'Nouns → classes, verbs → methods', 'Public API first', 'Private state, inject deps', 'Edge cases and tests', 'Discuss extensions'];
    var cur = t > 19.5 ? 5 : t > 13 ? 4 : t > 7.5 ? 3 : t > 4.5 ? 2 : t > 2.5 ? 1 : 0;
    M.forEach(function (m, i) {
      var y = 120 + i * 62, q = K.p(t, 0.6 + i * 0.35, 0.4), on = i === cur;
      K.box(40, y - 24, 470, 48, { stroke: on ? P.acc : P.line, fill: on ? 'rgba(79,209,197,.10)' : P.card, a: q });
      K.text((i + 1) + '. ' + m, 60, y, { size: 19, color: on ? P.ink : P.muted, weight: on ? 700 : 400, a: q });
    });
    var code = ['const lot = new ParkingLot(2, { now: () => clock });', 'lot.park("A");    // slot 0', 'lot.park("B");    // slot 1',
      'lot.park("C");    // Error: full', 'lot.park("A");    // Error: already parked', 'lot.leave("Z");   // Error: unknown vehicle', 'clock = 90 * 60000;', 'lot.leave("A");   // 20'];
    K.panel(540, 90, 700, 300, 'parking.js', { a: K.p(t, 3) });
    K.code(code, 564, 134, { size: 20, lh: 1.5, n: K.typed(t, code, [3.3, 8, 9.2, 13.3, 15, 16.6, 19.8, 21], 40), t: t, a: K.p(t, 3),
      hi: t > 21 ? 7 : t > 16.6 && t < 19.5 ? 5 : t > 15 && t < 19.5 ? 4 : t > 13.3 ? 3 : t > 7.8 && t < 13 ? 0 : -1, w: 670,
      marks: t > 14.2 && t < 19.5 ? { 3: 'rgba(252,129,129,.18)' } : null });
    var sl = K.p(t, 9);
    [['slot 0', 'A', 9.6, 20.6], ['slot 1', 'B', 10.4, 99]].forEach(function (s, i) {
      var x = 560 + i * 200, q = K.back((t - s[2]) / 0.5), gone = K.p(t, s[3], 0.6);
      K.box(x, 410, 180, 120, { fill: false, stroke: P.line, dash: [8, 6], a: sl });
      K.text(s[0], x + 90, 430, { size: 16, color: P.muted, align: 'center', a: sl });
      if (q > 0) K.chip(s[1], x + 90, 480 + gone * 40, { s: q, size: 26, mono: true, stroke: P.acc, a: 1 - gone });
    });
    var c = K.back((t - 13.6) / 0.5);
    if (c > 0) K.chip('C', 1000, 470, { s: c, size: 26, mono: true, stroke: P.red });
    K.mark(1040, 446, false, 0.7, K.p(t, 14.2));
    K.text('full', 1000, 516, { size: 17, color: P.red, align: 'center', a: K.p(t, 14.2) });
    var ck = K.p(t, 7.8);
    K.chip(t > 20 ? 'clock: 90 min' : 'clock: 0', 1150, 470, { mono: true, size: 18, stroke: t > 20 ? P.warm : P.blue, a: ck });
    K.text('injected', 1150, 516, { size: 16, color: P.muted, align: 'center', a: ck });
    K.text('fee = ceil(90 / 60) × 10 = 20', 560, 568, { size: 20, mono: true, color: P.green, a: K.p(t, 21.6) });
    K.chip('SOLID: guidance, not law', 275, 530, { size: 18, stroke: P.warm, a: K.p(t, 23.6) });
  } },

/* 10 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 41 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Encapsulation with #private fields, abstraction with a small public API',
     'Inheritance is the prototype chain; polymorphism is one call, many behaviours',
     'Prefer composition and mixins over deep class hierarchies',
     'class, factory or Object.create: shared methods vs closure privacy',
     'SOLID: one job, add not edit, substitutable, small interfaces, inject deps'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(190, y, true, 0.9, q);
      K.text(s, 222 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 41 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
