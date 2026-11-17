/* Day 8 in motion: class syntax over prototypes, class strictness, extends and super, derived constructors, dynamic dispatch, #private fields and accessors, fields and static blocks. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day8', {
  kicker: 'JavaScript: Zero to Architect · Day 8',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 8: classes, and exactly what they build underneath.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Classes', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 8 · Syntax over prototypes', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['class and extends', 'super', '#private fields'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ what a class builds */
{ d: 24, title: 'What a class builds',
  caps: [
    [0.3, 'A class is syntax over the same prototype mechanism you saw yesterday.'],
    [6, 'Methods like speak go on Animal.prototype. Static methods like create live on the class itself.'],
    [12.5, 'The instance holds only its own fields. And typeof Animal is "function": a class is a special constructor.'],
    [18.5, 'Class methods are non-enumerable, so Object.keys(a) shows only name.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['class Animal {', '  constructor(name) { this.name = name; }', '  speak() { return this.name + " speaks"; }', '  static create(n) { return new this(n); }', '}', 'const a = new Animal("Rex");'];
    K.panel(40, 84, 620, 250, 'animal.js');
    K.code(code, 64, 124, { size: 20, n: K.typed(t, code, [0.6, 1.0, 2.0, 3.0, 4.0, 12.6], 45), t: t, hi: t > 12.6 ? 5 : t > 9 && t < 12.5 ? 3 : t > 6 && t < 9 ? 2 : -1, w: 596 });
    var c = K.p(t, 1.4);
    K.box(700, 96, 250, 130, { stroke: P.blue, a: c });
    K.text('Animal', 720, 124, { size: 22, weight: 700, a: c });
    K.text('a function', 720, 158, { size: 17, color: P.muted, a: c });
    K.text('static create()', 720, 196, { size: 18, mono: true, color: P.green, a: K.p(t, 9.4) });
    var pp = K.p(t, 2);
    K.box(990, 96, 250, 130, { stroke: P.warm, a: pp });
    K.text('Animal.prototype', 1010, 124, { size: 20, weight: 700, color: P.warm, a: pp });
    K.text('speak()', 1010, 162, { size: 18, mono: true, a: K.p(t, 6.8) });
    K.text('constructor', 1010, 196, { size: 17, mono: true, color: P.muted, a: K.p(t, 7.4) });
    K.arrow(952, 130, 986, 130, { p: K.p(t, 2.2, 0.4), color: P.warm, lw: 2.5, head: 10 });
    var o = K.back((t - 13) / 0.5);
    if (o > 0) {
      K.box(990, 300, 250, 100, { stroke: P.acc, a: K.clamp(o) });
      K.text('a', 1010, 326, { size: 22, weight: 700, a: K.clamp(o) });
      K.text('name: "Rex"', 1010, 366, { size: 19, mono: true, color: P.warm, a: K.clamp(o) });
    }
    K.arrow(1115, 296, 1115, 232, { p: K.p(t, 13.4, 0.4), color: P.acc, lw: 2.5, head: 10 });
    K.text('[[Prototype]]', 1100, 264, { size: 16, color: P.muted, align: 'right', a: K.p(t, 13.8) });
    var cp = K.p(t, 14.4);
    K.panel(40, 354, 620, 230, 'Console', { a: cp });
    [['typeof Animal', '"function"', 15, 15.6], ['Object.keys(a)', '["name"]', 19, 19.6], ['a.speak()', '"Rex speaks"', 20.4, 21]].forEach(function (r, i) {
      K.text('> ' + r[0], 66, 412 + i * 52, { size: 20, mono: true, color: P.muted, a: K.p(t, r[2], 0.3) });
      K.text(r[1], 380, 412 + i * 52, { size: 20, mono: true, color: P.warm, a: K.p(t, r[3], 0.3) });
    });
    K.text('methods: on the prototype, non-enumerable', 700, 470, { size: 18, color: P.muted, a: K.p(t, 19.4) });
    K.text('fields: own properties, enumerable', 700, 510, { size: 18, color: P.green, a: K.p(t, 20) });
  } },

/* 3 ─ stricter than functions */
{ d: 22, title: 'Classes are stricter',
  caps: [
    [0.3, 'Classes are stricter than constructor functions, in three ways.'],
    [5, 'Calling a class without new throws a TypeError.'],
    [10, 'Class declarations are in the temporal dead zone: using one before its line throws a ReferenceError.'],
    [16, 'Class bodies are always strict, so a method pulled off its instance gets this undefined. Bind it, or use an arrow.']],
  draw: function (K, t) {
    var P = K.P;
    K.chip('function Dog() {}: lenient', 400, 116, { size: 20, stroke: P.line, color: P.muted, a: K.p(t, 0.6) });
    K.chip('class Dog {}: strict', 880, 116, { size: 20, stroke: P.acc, a: K.p(t, 1.2) });
    var R = [['Animal("Rex");', 'TypeError: class constructor needs new', 5.2],
             ['new Pet();  class Pet {}', 'ReferenceError: cannot access Pet before init', 10.2],
             ['const f = a.speak;  f();', 'TypeError: this is undefined inside speak', 16.2]];
    R.forEach(function (r, i) {
      var y = 176 + i * 116, q = K.p(t, r[2], 0.5), e = K.p(t, r[2] + 1, 0.4);
      K.box(40, y, 1200, 96, { fill: P.code, stroke: e > 0.5 ? P.red : P.line, a: q });
      K.code([r[0]], 70, y + 34, { size: 21, n: K.typed(t, [r[0]], [r[2] + 0.1], 30), t: t, a: q });
      K.mark(660, y + 48, false, 0.9, e);
      K.text(r[1], 690, y + 48, { size: 19, color: P.red, a: e });
    });
    var f = ['const f = a.speak.bind(a);', 'speak = () => this.name;  // arrow field'];
    var fp = K.p(t, 19.4);
    K.panel(40, 528, 1200, 60, '', { a: fp, stroke: P.green });
    K.mark(70, 558, true, 0.8, fp);
    K.text(f[0], 100, 558, { size: 19, mono: true, a: fp });
    K.text(f[1], 520, 558, { size: 19, mono: true, a: K.p(t, 20.2) });
  } },

/* 4 ─ extends wires two chains */
{ d: 26, title: 'extends and super',
  caps: [
    [0.3, 'class Dog extends Animal wires two chains at once.'],
    [5.5, 'Instance chain: Dog.prototype links to Animal.prototype, so dogs inherit methods.'],
    [11.5, 'Constructor chain: Dog links to Animal, so static methods like create are inherited too.'],
    [17.5, 'Inside speak, super.speak() calls the parent version. d.speak() returns "Rex speaks!".']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['class Dog extends Animal {', '  speak() { return super.speak() + "!"; }', '}', 'const d = Dog.create("Rex");'];
    K.panel(40, 84, 620, 170, 'dog.js');
    K.code(code, 64, 124, { size: 20, n: K.typed(t, code, [0.6, 1.4, 2.4, 11.8], 40), t: t, hi: t > 17.5 ? 1 : t > 11.8 ? 3 : -1, w: 596 });
    var ex = K.p(t, 5.6);
    K.box(700, 84, 540, 170, { fill: P.code, stroke: P.line, a: ex });
    K.text('extends sets two links', 724, 114, { size: 18, weight: 700, color: P.muted, a: ex });
    K.text('Dog.prototype → Animal.prototype', 724, 160, { size: 19, mono: true, color: P.acc, a: ex });
    K.text('Dog → Animal', 724, 210, { size: 19, mono: true, color: P.purple, a: K.p(t, 11.6) });
    function row(B, y, start, col) {
      B.forEach(function (b, i) {
        if (!b) return;
        var x = 40 + i * 300, q = K.back((t - b[2]) / 0.5); if (q <= 0) return;
        var hot = b[3] ? K.win(t, b[3][0], b[3][1], 0.15) : 0;
        K.box(x, y, 260, 68, { stroke: hot > 0.5 ? P.green : col, lw: hot > 0.5 ? 3.5 : 2, a: K.clamp(q) });
        K.text(b[0], x + 18, y + 22, { size: 19, weight: 700, a: K.clamp(q) });
        K.text(b[1], x + 18, y + 48, { size: 16, mono: true, color: P.muted, a: K.clamp(q) });
        if (i && B[i - 1]) K.arrow(x - 38, y + 34, x - 6, y + 34, { p: K.p(t, Math.max(b[2], B[i - 1][2]) + 0.1, 0.3), color: P.muted, lw: 2.5, head: 10 });
      });
    }
    K.text('Instance chain', 40, 290, { size: 18, weight: 700, color: P.acc, a: K.p(t, 5.6) });
    row([['d', 'name: "Rex"', 12.8, [18, 18.6]], ['Dog.prototype', 'speak()', 5.8, [18.6, 19.6]], ['Animal.prototype', 'speak()', 6.4, [19.6, 21]], ['Object.prototype', 'toString() …', 7]], 306, 0, P.acc);
    K.text('Constructor chain (statics)', 340, 412, { size: 18, weight: 700, color: P.purple, a: K.p(t, 11.6) });
    row([null, ['Dog', 'class Dog', 11.8, [12.2, 12.8]], ['Animal', 'static create()', 12.2, [12.8, 15]], ['Function.prototype', 'call(), bind() …', 12.6]], 428, 0, P.purple);
    K.mark(875, 462, true, 0.75, K.win(t, 13, 17.4));
    K.curve(490, 320, 560, 280, 660, 320, { p: K.p(t, 19, 0.5), color: P.green, dash: [5, 5], lw: 2.5, a: K.win(t, 19, 23.5) });
    K.text('super.speak()', 575, 266, { size: 16, mono: true, color: P.green, align: 'center', a: K.win(t, 19.2, 23.5) });
    K.text('d.speak()  →  "Rex speaks!"', 40, 556, { size: 21, mono: true, color: P.warm, a: K.p(t, 21) });
  } },

/* 5 ─ super first */
{ d: 22, title: 'Derived constructors',
  caps: [
    [0.3, 'A derived constructor must call super before it touches this.'],
    [6, 'Before super runs, this does not exist yet. Touching it throws a ReferenceError.'],
    [12, 'super(name) runs the parent constructor, which creates the object and sets name.'],
    [17, 'Then this is ready, and the child adds its own fields, like breed.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['class Dog extends Animal {', '  constructor(name, breed) {', '    this.breed = breed; // ReferenceError', '    super(name);', '    this.breed = breed; // ok', '  }', '}'];
    K.panel(40, 84, 620, 270, 'dog.js');
    K.code(code, 64, 124, { size: 20, n: K.typed(t, code, [0.6, 1.2, 6.2, 12.2, 17.2, 18, 18.2], 40), t: t, w: 596,
      marks: { 2: t > 7 ? 'rgba(252,129,129,.18)' : null, 3: t > 12.6 && t < 17 ? 'rgba(79,209,197,.16)' : null, 4: t > 17.8 ? 'rgba(104,211,145,.16)' : null } });
    var e = K.p(t, 7.4);
    K.box(40, 374, 620, 100, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: e });
    K.text('ReferenceError: Must call super constructor', 64, 406, { size: 17, mono: true, color: P.red, a: e });
    K.text("in derived class before accessing 'this'", 64, 440, { size: 17, mono: true, color: P.red, a: e });
    K.chip('rule: super(...) first, then this', 340, 530, { size: 20, stroke: P.green, s: K.back((t - 19.4) / 0.5), a: K.p(t, 19.4) });
    var th = K.p(t, 1);
    var ready0 = K.p(t, 13.7, 0.3), ready = K.p(t, 14, 0.5);
    K.chip('this', 780, 120, { mono: true, size: 24, stroke: ready > 0.5 ? P.green : P.warm, color: ready > 0.5 ? P.green : P.warm, a: th, s: 1 + K.win(t, 7, 8, 0.2) * 0.2 });
    K.lock(840, 122, 0.9, P.warm, th * (1 - ready0));
    K.text('not initialised yet', 870, 120, { size: 19, color: P.warm, a: th * (1 - ready0) });
    K.text('ready: points at the new object', 870, 120, { size: 19, color: P.green, a: ready });
    var s = K.p(t, 12.4);
    K.box(700, 180, 540, 100, { stroke: P.blue, a: s });
    K.text('super(name)', 724, 210, { size: 20, mono: true, color: P.blue, a: s });
    K.text('Animal constructor runs: creates the object', 724, 250, { size: 18, a: s });
    K.arrow(970, 284, 970, 316, { p: K.p(t, 13, 0.4), color: P.blue, lw: 2.5, head: 10 });
    var o = K.back((t - 13.2) / 0.5);
    if (o > 0) {
      K.box(760, 320, 420, 140, { stroke: P.acc, lw: 2.5, a: K.clamp(o) });
      K.text('new Dog object', 784, 346, { size: 17, color: P.muted, a: K.clamp(o) });
      K.text('name: "Rex"', 784, 386, { size: 22, mono: true, color: P.warm, a: K.p(t, 13.6) });
      K.text('breed: "lab"', 784, 426, { size: 22, mono: true, color: P.green, a: K.p(t, 17.8) });
    }
    K.curve(750, 136, 640, 250, 756, 360, { p: K.p(t, 14.2, 0.6), color: P.green, lw: 2.5 });
  } },

/* 6 ─ dynamic dispatch */
{ d: 21, title: 'Overrides run early',
  caps: [
    [0.3, 'Method calls dispatch on the real object, even inside the parent constructor.'],
    [6, "new B() runs A's constructor, and this.name() finds B's override first."],
    [12, 'So n is "B". But B\'s own fields are not set yet at that moment: do not call overridable methods from constructors.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['class A {', '  constructor() { this.n = this.name(); }', '  name() { return "A"; }', '}', 'class B extends A { name() { return "B"; } }', 'new B().n;   // "B"'];
    K.panel(40, 84, 620, 240, 'dispatch.js');
    K.code(code, 64, 124, { size: 20, n: K.typed(t, code, [0.6, 1.0, 2.0, 2.6, 2.8, 6.2], 45), t: t, hi: t > 7 && t < 12 ? 1 : t > 6.2 && t < 7 ? 5 : -1, w: 596 });
    var B = [['new B()', 'being built', 0.8], ['B.prototype', 'name() → "B"', 1.4], ['A.prototype', 'name() → "A"', 2]];
    B.forEach(function (b, i) {
      var y = 96 + i * 92, q = K.p(t, b[2]);
      var hot = i === 0 ? K.win(t, 7.6, 8.2, 0.15) : i === 1 ? K.win(t, 8.2, 12, 0.15) : 0;
      K.box(720, y, 520, 64, { stroke: hot > 0.5 ? P.green : i === 2 ? P.purple : P.acc, lw: hot > 0.5 ? 3.5 : 2, a: q * (i === 2 && t > 8.2 ? 0.55 : 1) });
      K.text(b[0], 744, y + 32, { size: 21, weight: 700, a: q });
      K.text(b[1], 960, y + 32, { size: 19, mono: true, color: i === 0 ? P.muted : P.ink, a: q * (i === 0 ? 1 - K.p(t, 8.9, 0.3) : 1) });
      if (i) K.arrow(980, y - 26, 980, y - 4, { p: K.p(t, b[2] + 0.2, 0.3), color: P.muted, lw: 2.5, head: 9 });
    });
    K.text('n: "B"', 960, 128, { size: 21, mono: true, color: P.warm, a: K.p(t, 9.2) });
    K.chip("A's constructor: this.name()", 980, 384, { size: 18, mono: false, stroke: P.purple, a: K.win(t, 6.6, 12) });
    K.mark(1210, 128, false, 0.7, K.win(t, 7.8, 12));
    K.mark(1210, 220, true, 0.7, K.win(t, 8.4, 12));
    var w = K.p(t, 12.4);
    K.box(40, 350, 1200, 234, { fill: 'rgba(252,129,129,.07)', stroke: P.red, a: w });
    var c2 = ['class B extends A {', '  tag = "b";', '  name() { return this.tag; }', '}', 'new B().n;   // undefined: tag not set yet'];
    K.code(c2, 64, 372, { size: 19, lh: 1.5, n: K.typed(t, c2, [12.6, 13.3, 13.8, 14.6, 14.8], 40), t: t, a: w });
    K.text('fields are set after super() returns', 760, 420, { size: 19, color: P.warm, a: K.p(t, 16) });
    K.text('so A cannot see tag yet', 760, 456, { size: 19, color: P.warm, a: K.p(t, 16.6) });
    K.chip('avoid overridable calls in constructors', 960, 530, { size: 18, stroke: P.green, a: K.p(t, 17.4) });
  } },

/* 7 ─ private fields and accessors */
{ d: 26, title: 'Private fields and accessors',
  caps: [
    [0.3, '#balance is a truly private field. Only code inside the class body can read or write it.'],
    [6.5, 'Outside the class, a.#balance is a SyntaxError, reported before any code runs.'],
    [12, 'A getter and setter control access: the setter checks the rule, and a negative value throws a RangeError.'],
    [18.5, '#balance in o is a brand check: is o a real Account? And Object.keys and JSON never show private fields.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['class Account {', '  #balance = 0;', '  get balance() { return this.#balance; }', '  set balance(v) {', '    if (v < 0) throw new RangeError("negative");', '    this.#balance = v;', '  }', '  static isAccount(o) { return #balance in o; }', '}'];
    K.panel(40, 84, 640, 330, 'account.js');
    K.code(code, 62, 122, { size: 19, lh: 1.55, n: K.typed(t, code, [0.5, 0.9, 1.4, 2.4, 2.8, 3.8, 4.3, 4.5, 5.5], 50), t: t, w: 616,
      hi: t > 18.5 ? 7 : t > 14.6 && t < 18.5 ? 4 : t > 12 && t < 14.6 ? 3 : t > 0.9 && t < 6.5 ? 1 : -1 });
    var c2 = ['a.balance = 25;          // ok', 'a.balance = -1;          // RangeError', 'Object.keys(a);          // []', 'Account.isAccount(a);    // true'];
    var mp = K.p(t, 12.4);
    K.panel(40, 434, 640, 150, '', { a: mp });
    K.code(c2, 62, 452, { size: 18, lh: 1.5, n: K.typed(t, c2, [12.6, 14.6, 18.8, 19.8], 34), t: t, a: mp, marks: t > 15.4 ? { 1: 'rgba(252,129,129,.16)' } : null, w: 616 });
    var o = K.p(t, 0.8);
    K.box(720, 84, 520, 160, { stroke: P.acc, a: o });
    K.text('a  (an Account)', 744, 112, { size: 19, weight: 700, a: o });
    K.box(744, 140, 472, 76, { fill: 'rgba(246,173,85,.07)', stroke: P.warm, dash: [7, 5], a: K.p(t, 1.2) });
    K.lock(774, 180, 0.9, P.warm, K.p(t, 1.2));
    var v0 = K.p(t, 13.1, 0.3), v = K.p(t, 13.4, 0.5);
    K.text('#balance: 0', 800, 178, { size: 22, mono: true, color: P.warm, a: K.p(t, 1.2) * (1 - v0) });
    K.text('#balance: 25', 800, 178, { size: 22, mono: true, color: P.warm, a: v });
    K.text('private', 1200, 178, { size: 16, color: P.muted, align: 'right', a: K.p(t, 1.6) });
    var ac = K.p(t, 12.2);
    K.box(720, 260, 520, 90, { stroke: K.win(t, 15, 17) > 0.5 ? P.red : P.blue, a: ac });
    K.text('get balance · set balance', 744, 290, { size: 19, mono: true, color: P.blue, a: ac });
    K.text('set: v < 0 → RangeError', 744, 326, { size: 17, color: P.red, a: K.p(t, 15.2) });
    K.arrow(980, 256, 980, 222, { p: K.p(t, 13, 0.4), color: P.blue, lw: 2.5, head: 10 });
    var r1 = K.p(t, 7);
    K.box(720, 370, 520, 214, { fill: P.code, stroke: P.line, a: r1 });
    K.mark(750, 404, false, 0.8, r1); K.text('a.#balance', 776, 404, { size: 21, mono: true, a: r1 });
    K.text('SyntaxError, before any code runs', 776, 438, { size: 17, color: P.red, a: K.p(t, 7.6) });
    var r2 = K.p(t, 19.2);
    K.mark(750, 494, true, 0.8, r2); K.text('#balance in a  →  true', 776, 494, { size: 21, mono: true, a: r2 });
    K.text('brand check: never throws', 776, 528, { size: 17, color: P.green, a: K.p(t, 19.8) });
    K.text('JSON.stringify(a) → "{}"', 776, 560, { size: 17, mono: true, color: P.muted, a: K.p(t, 20.6) });
  } },

/* 8 ─ fields, static blocks, composition */
{ d: 25, title: 'Fields, statics, composition',
  caps: [
    [0.3, 'A field like count = 0 is created on every instance, right after super returns.'],
    [6, 'Static members live on the class. A static block runs once, when the class is defined, to set them up.'],
    [12.5, 'Keep hierarchies shallow. Composition, objects that hold helpers, is usually more flexible than deep extends chains.'],
    [19, 'Decorators like @log are still a proposal, not standard JavaScript. TypeScript compiles its own version.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['class Config {', '  count = 0;            // per instance', '  static defaults;', '  static #cache = new Map();', '  static {', '    Config.defaults = { lang: "en" };', '  }', '}'];
    K.panel(40, 84, 620, 300, 'config.js');
    K.code(code, 64, 124, { size: 20, lh: 1.55, n: K.typed(t, code, [0.5, 0.8, 6.2, 6.8, 7.6, 8.0, 9.0, 9.1], 45), t: t, w: 596,
      hi: t > 0.8 && t < 6 ? 1 : t > 7.6 && t < 12.5 ? 5 : -1 });
    var cl = K.p(t, 6.4);
    K.box(720, 84, 520, 200, { stroke: P.blue, a: cl });
    K.text('Config  (the class itself)', 744, 112, { size: 19, weight: 700, color: P.blue, a: cl });
    K.text('defaults: { lang: "en" }', 744, 160, { size: 20, mono: true, a: K.p(t, 9.4) });
    K.lock(756, 206, 0.8, P.warm, K.p(t, 7.2));
    K.text('#cache: Map', 778, 206, { size: 20, mono: true, color: P.warm, a: K.p(t, 7.2) });
    K.text('static block ran once, at definition', 744, 252, { size: 17, color: P.green, a: K.p(t, 10) });
    [[720, 1.6], [1000, 2.4]].forEach(function (o, i) {
      var q = K.back((t - o[1]) / 0.5); if (q <= 0) return;
      K.chip('new Config()', o[0] + 120, 314, { size: 17, stroke: P.acc, s: q });
      K.box(o[0], 336, 240, 50, { stroke: P.acc, a: K.clamp(q) });
      K.text('count: 0', o[0] + 120, 361, { size: 20, mono: true, color: P.warm, align: 'center', a: K.clamp(q) });
    });
    var cp = K.p(t, 12.6);
    K.box(40, 410, 1200, 174, { fill: P.code, stroke: P.line, a: cp });
    ['A', 'B', 'C', 'D', 'E'].forEach(function (s, i) {
      var q = K.p(t, 12.8 + i * 0.25);
      K.chip(s, 90 + i * 100, 458, { mono: true, size: 20, stroke: P.red, a: q });
      if (i) K.arrow(90 + i * 100 - 72, 458, 90 + i * 100 - 26, 458, { p: q, color: P.muted, lw: 2, head: 8 });
    });
    K.mark(80, 512, false, 0.75, K.p(t, 14.2)); K.text('deep extends chains: fragile', 104, 512, { size: 18, color: P.red, a: K.p(t, 14.2) });
    K.chip('class Car { engine = new Engine(); }', 920, 458, { mono: true, size: 18, stroke: P.green, a: K.p(t, 15) });
    K.mark(700, 512, true, 0.75, K.p(t, 15.8)); K.text('composition: a car has an engine', 724, 512, { size: 18, color: P.green, a: K.p(t, 15.8) });
    K.chip('@log  ·  not standard JavaScript yet', 640, 556, { size: 18, stroke: P.warm, color: P.warm, s: K.back((t - 19.3) / 0.5), a: K.p(t, 19.3) });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 8 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['class is syntax over prototypes: methods live on the prototype',
     'Classes need new, have strict bodies and sit in the TDZ',
     'extends links instances and statics; super calls the parent',
     'Call super() before using this in a derived constructor',
     '#private fields, accessors, static blocks; prefer composition'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 8 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
