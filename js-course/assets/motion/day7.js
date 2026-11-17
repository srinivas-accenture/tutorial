/* Day 7 in motion: the prototype chain, shadowing, constructors and F.prototype, what new does, instanceof, classic inheritance, Object.create(null) and prototype pollution. Loaded on demand by assets/js/motion.js. */
JSC.motion.define('day7', {
  kicker: 'JavaScript: Zero to Architect · Day 7',
  poster: 3,
  scenes: [

/* 1 ─ title */
{ d: 7, title: 'Welcome',
  caps: [[0.8, 'Day 7: prototypes, the mechanism underneath every object and every class.']],
  draw: function (K, t) {
    var g = K.g, P = K.P, s = K.back((t - 0.2) / 0.9);
    g.save(); g.translate(640, 230); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    K.text('Prototypes', 0, 0, { size: 104, weight: 800, align: 'center', a: K.clamp(t / 0.6) }); g.restore();
    K.text('Day 7 · How objects share behaviour', 640, 330, { size: 34, color: P.acc, align: 'center', a: K.p(t, 0.9, 0.7) });
    ['The prototype chain', 'new, step by step', 'Object.create'].forEach(function (c, i) {
      var q = K.back((t - 1.8 - i * 0.35) / 0.6);
      if (q > 0) K.chip(c, 380 + i * 260, 440, { s: q, a: K.clamp(q * 2), size: 21, stroke: P.acc });
    });
  } },

/* 2 ─ the chain */
{ d: 26, title: 'The prototype chain',
  caps: [
    [0.3, 'Every object has a hidden link, [[Prototype]], to another object or to null.'],
    [6, 'Object.create(proto) makes a new object whose prototype is proto. So rex links to dog, and dog links to animal.'],
    [12, 'Reading rex.eat(): not on rex, not on dog, found on animal. The lookup walks up the chain.'],
    [18.5, 'rex.fly walks all the way to null and gives undefined. No error, just undefined.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const animal = { eat() { return "nom"; } };', 'const dog = Object.create(animal);', 'dog.bark = () => "woof";', 'const rex = Object.create(dog);', 'rex.eat();   // "nom"', 'rex.fly;     // undefined'];
    K.panel(40, 84, 620, 250, 'chain.js');
    K.code(code, 64, 124, { size: 20, n: K.typed(t, code, [0.6, 6.2, 7.4, 8.4, 12.2, 18.6], 36), t: t, hi: t > 18.6 ? 5 : t > 12.2 ? 4 : -1, w: 596 });
    var lp = K.p(t, 12.2);
    K.panel(40, 354, 620, 230, 'lookup', { a: lp });
    var eatA = 1 - K.p(t, 18.3, 0.3);
    [['rex: no own eat', false, 12.8], ['dog: no eat', false, 13.6], ['animal: eat found → "nom"', true, 14.4]].forEach(function (r, i) {
      var a = K.p(t, r[2], 0.3) * eatA; K.mark(74, 410 + i * 46, r[1], 0.75, a);
      K.text(r[0], 100, 410 + i * 46, { size: 19, mono: true, color: r[1] ? P.green : P.ink, a: a });
    });
    [['rex, dog, animal: no fly', false, 19.6], ['Object.prototype: no fly', false, 20.4], ['null: end → undefined', false, 21.2]].forEach(function (r, i) {
      var a = K.p(t, r[2], 0.3); K.mark(74, 410 + i * 46, false, 0.75, a);
      K.text(r[0], 100, 410 + i * 46, { size: 19, mono: true, color: i === 2 ? P.red : P.ink, a: a });
    });
    var B = [['rex', '(no own props)', 9.0, P.acc], ['dog', 'bark()', 6.8, P.acc], ['animal', 'eat()', 1.6, P.acc], ['Object.prototype', 'toString() …', 2.2, P.purple], ['null', 'end of chain', 2.8, P.red]];
    var scan = [[[12.6, 13.4], [18.9, 19.4]], [[13.4, 14.2], [19.4, 19.9]], [[14.2, 18.2], [19.9, 20.4]], [[20.4, 20.9]], [[20.9, 26]]];
    B.forEach(function (b, i) {
      var y = 96 + i * 88, q = K.back((t - b[2]) / 0.5), hot = 0;
      if (q <= 0) return;
      scan[i].forEach(function (w) { hot = Math.max(hot, K.win(t, w[0], w[1], 0.15)); });
      var found = i === 2 && t > 14.2 && t < 18.2;
      K.g.save(); K.g.translate(980, y + 31); K.g.scale(q, q); K.g.translate(-980, -y - 31);
      K.box(720, y, 520, 62, { stroke: hot > 0.5 ? (found ? P.green : P.warm) : b[3], lw: hot > 0.5 ? 3.5 : 2, a: K.clamp(q) });
      K.text(b[0], 742, y + 31, { size: 22, weight: 700, color: i === 4 ? P.red : P.ink, a: K.clamp(q) });
      var pa = i === 1 ? K.p(t, 7.9) : 1;
      K.text(b[1], 960, y + 31, { size: i === 0 || i === 4 ? 17 : 19, mono: i > 0 && i < 4, color: P.muted, a: K.clamp(q) * pa });
      K.g.restore();
      if (i) K.arrow(980, y - 24, 980, y - 4, { p: K.p(t, Math.max(b[2], B[i - 1][2]) + 0.2, 0.3), color: P.muted, lw: 2.5, head: 9 });
    });
    K.text('[[Prototype]]', 1000, 348, { size: 16, color: P.muted, a: K.p(t, 2.6) });
    var mk = [[0, 13.0, 18.2, false], [1, 13.8, 18.2, false], [2, 14.6, 18.2, true], [0, 19.1, 26, false], [1, 19.6, 26, false], [2, 20.1, 26, false], [3, 20.6, 26, false], [4, 21.1, 26, false]];
    mk.forEach(function (m) { K.mark(1206, 127 + m[0] * 88, m[3], 0.75, K.win(t, m[1], m[2], 0.3)); });
  } },

/* 3 ─ reads walk up, writes shadow */
{ d: 22, title: 'Reads walk up, writes stay',
  caps: [
    [0.3, 'Reads walk up the chain, but writes always land on the object you wrote to.'],
    [6, 'child.x++ first reads x. child has no own x, so it gets 1 from proto.'],
    [11.5, 'Then it writes 2 as a new own property on child. This is shadowing: proto.x is still 1.'],
    [17.5, "Object.hasOwn tells you whether a property is the object's own, not inherited."]],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const proto = { x: 1 };', 'const child = Object.create(proto);', 'child.x++;', 'console.log(child.x, proto.x);  // 2 1', 'Object.hasOwn(child, "x");      // true'];
    K.panel(40, 84, 620, 236, 'shadow.js');
    K.code(code, 64, 124, { size: 20, n: K.typed(t, code, [0.6, 1.4, 6.2, 14.4, 17.8], 32), t: t, hi: t > 17.8 ? 4 : t > 14.4 ? 3 : t > 6.2 ? 2 : -1, w: 596 });
    var sp = K.p(t, 6.4);
    K.panel(40, 340, 620, 244, 'child.x++ in three steps', { a: sp });
    [['1  read   child.x → proto.x = 1', 6.6, P.ink], ['2  add    1 + 1 = 2', 10.4, P.ink], ['3  write  child.x = 2  (own)', 12, P.green], ['proto.x is untouched: 1', 13.6, P.warm]].forEach(function (r, i) {
      K.text(r[0], 66, 396 + i * 44, { size: 20, mono: i < 3, color: r[2], a: K.p(t, r[1], 0.4) });
    });
    var c = K.p(t, 1.6), pr = K.p(t, 0.8);
    K.box(760, 96, 440, 140, { stroke: P.acc, a: c });
    K.text('child', 784, 126, { size: 22, weight: 700, a: c });
    var own0 = K.p(t, 11.8, 0.25), own = K.p(t, 12.05, 0.4);
    K.text('(no own props)', 784, 190, { size: 18, color: P.muted, a: c * (1 - own0) });
    K.text('x: 2', 784, 190, { size: 28, mono: true, color: P.green, a: own });
    K.chip('own', 900, 190, { size: 16, stroke: P.green, color: P.green, a: Math.min(own, K.p(t, 12.4)), s: 1 + K.win(t, 17.8, 19.4) * 0.15 });
    K.arrow(980, 240, 980, 322, { p: K.p(t, 1.9, 0.4), color: P.muted });
    K.text('[[Prototype]]', 1000, 282, { size: 16, color: P.muted, a: K.p(t, 2.2) });
    K.box(760, 326, 440, 140, { stroke: P.purple, a: pr });
    K.text('proto', 784, 356, { size: 22, weight: 700, a: pr });
    K.text('x: 1', 784, 420, { size: 28, mono: true, color: P.warm, a: pr });
    K.box(770, 398, 110, 46, { fill: false, stroke: P.warm, a: K.win(t, 6.6, 8.2) + K.win(t, 13.6, 15.4) });
    var fly = K.p(t, 7.2, 1.2), fa = K.win(t, 7.2, 11.9, 0.3), plus0 = K.p(t, 10.4, 0.2), plus = K.p(t, 10.6, 0.3);
    var fy = 420 - fly * 230;
    K.chip('1', 1100, fy, { mono: true, size: 24, stroke: P.warm, color: P.warm, a: fa * (1 - plus0) });
    K.chip('2', 1100, fy, { mono: true, size: 24, stroke: P.green, color: P.green, a: fa * plus });
    K.text('read', 1150, 300, { size: 17, color: P.warm, a: K.win(t, 7.4, 10.4) });
    var h = K.p(t, 17.8);
    K.chip('own → Object.hasOwn is true', 980, 516, { size: 18, stroke: P.green, a: h });
    K.chip('inherited → false', 980, 566, { size: 18, stroke: P.line, color: P.muted, a: K.p(t, 18.6) });
  } },

/* 4 ─ constructor functions and F.prototype */
{ d: 24, title: 'Constructors and F.prototype',
  caps: [
    [0.3, 'Constructor functions have a prototype property: the object that instances made with new will link to.'],
    [7, 'Methods go on Dog.prototype, so one bark function is shared by every dog.'],
    [13, 'Each instance keeps only its own data, here name, and delegates bark to the prototype.'],
    [18.5, 'Dog.prototype.constructor points back at Dog. And Dog.prototype is not the prototype of Dog itself.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function Dog(name) {', '  this.name = name;', '}', 'Dog.prototype.bark = function () {', '  return this.name + ": woof";', '};', 'const a = new Dog("Rex");', 'const b = new Dog("Bo");'];
    K.panel(40, 84, 600, 330, 'dog.js');
    K.code(code, 64, 124, { size: 20, lh: 1.55, n: K.typed(t, code, [0.6, 1.2, 1.8, 7.2, 8.2, 9.1, 13.2, 14.2], 36), t: t, hi: t > 13.2 && t < 18.5 ? (t > 14.2 ? 7 : 6) : t > 7.2 && t < 13 ? 3 : -1, w: 576 });
    var d = K.p(t, 1.4);
    K.box(700, 96, 200, 90, { stroke: P.blue, a: d });
    K.text('Dog', 724, 126, { size: 22, weight: 700, a: d });
    K.text('a function', 724, 160, { size: 17, color: P.muted, a: d });
    var pp = K.p(t, 2.4);
    K.box(980, 96, 260, 160, { stroke: P.warm, a: pp });
    K.text('Dog.prototype', 1000, 122, { size: 21, weight: 700, color: P.warm, a: pp });
    K.text('bark()', 1000, 162, { size: 20, mono: true, a: K.p(t, 8.4) });
    K.text('one shared function', 1000, 194, { size: 16, color: P.green, a: K.p(t, 9.6) });
    K.text('constructor: Dog', 1000, 228, { size: 17, mono: true, color: P.blue, a: K.p(t, 18.8) });
    K.arrow(902, 150, 976, 150, { p: K.p(t, 2.6, 0.4), color: P.warm, lw: 2.5, head: 10 });
    K.text('prototype', 940, 130, { size: 16, color: P.warm, align: 'center', a: K.p(t, 2.8) });
    K.curve(980, 236, 900, 250, 860, 190, { p: K.p(t, 19.2, 0.6), color: P.blue, lw: 2.5, dash: [6, 5] });
    [[700, 'a', 'name: "Rex"', 13.4], [1000, 'b', 'name: "Bo"', 14.4]].forEach(function (o) {
      var q = K.back((t - o[3]) / 0.5); if (q <= 0) return;
      K.g.save(); K.g.translate(o[0] + 120, 385); K.g.scale(q, q); K.g.translate(-o[0] - 120, -385);
      K.box(o[0], 330, 240, 110, { stroke: P.acc, a: K.clamp(q) });
      K.text(o[1], o[0] + 20, 358, { size: 22, weight: 700, a: K.clamp(q) });
      K.text(o[2], o[0] + 20, 404, { size: 20, mono: true, color: P.warm, a: K.clamp(q) });
      K.g.restore();
    });
    K.arrow(860, 330, 1030, 262, { p: K.p(t, 13.9, 0.5), color: P.acc, lw: 2.5, head: 10 });
    K.arrow(1120, 330, 1110, 262, { p: K.p(t, 14.9, 0.5), color: P.acc, lw: 2.5, head: 10 });
    K.text('[[Prototype]]', 1132, 298, { size: 16, color: P.muted, a: K.p(t, 15.2) });
    var n = K.p(t, 19.6);
    K.text('Object.getPrototypeOf(Dog) === Function.prototype', 700, 500, { size: 18, mono: true, a: n });
    K.text('Dog.prototype is for instances, not for Dog', 700, 540, { size: 18, color: P.warm, a: K.p(t, 20.4) });
  } },

/* 5 ─ what new does */
{ d: 27, title: 'What new does',
  caps: [
    [0.3, 'new Dog("Rex") runs four steps. One: create a brand-new empty object.'],
    [6, 'Two: link its [[Prototype]] to Dog.prototype, so bark will be found.'],
    [11, 'Three: call Dog with this set to the new object. The body adds name.'],
    [16, 'Four: return the object, unless the constructor itself returned a different object.'],
    [21.5, 'Forget new and this is undefined in strict mode, so Dog throws a TypeError. Classes always require new.']],
  draw: function (K, t) {
    var P = K.P, c = ['const rex = new Dog("Rex");'];
    K.panel(40, 84, 600, 72, '');
    K.code(c, 64, 106, { size: 22, n: K.typed(t, c, [0.5], 30), t: t });
    var S = [['Create an empty object', 1.2], ['Link [[Prototype]] → Dog.prototype', 6.2], ['Call Dog with this = the object', 11.2], ['Return it (unless Dog returns an object)', 16.2]];
    var act = t > 16 ? 3 : t > 11 ? 2 : t > 6 ? 1 : 0;
    S.forEach(function (s, i) {
      var q = K.p(t, s[1], 0.5), y = 206 + i * 76;
      K.box(40, y - 30, 600, 60, { stroke: i === act && t < 21.5 ? P.acc : P.line, fill: i === act && t < 21.5 ? 'rgba(79,209,197,.08)' : P.card, a: q });
      K.chip(String(i + 1), 76, y, { size: 20, stroke: P.acc, color: P.acc, a: q });
      K.text(s[0], 110, y, { size: 21, a: q });
    });
    var w = K.p(t, 21.8);
    K.box(40, 498, 600, 86, { fill: 'rgba(252,129,129,.10)', stroke: P.red, a: w });
    K.mark(76, 526, false, 0.8, w);
    K.text('Dog("Rex")  // without new', 104, 526, { size: 19, mono: true, a: w });
    K.text('TypeError: cannot set properties of undefined', 76, 562, { size: 17, mono: true, color: P.red, a: K.p(t, 22.6) });
    var pp = K.p(t, 0.8);
    K.box(980, 96, 260, 100, { stroke: P.warm, a: pp });
    K.text('Dog.prototype', 1000, 124, { size: 21, weight: 700, color: P.warm, a: pp });
    K.text('bark()', 1000, 164, { size: 20, mono: true, a: pp });
    var o = K.back((t - 1.6) / 0.6);
    if (o > 0) {
      K.g.save(); K.g.translate(860, 320); K.g.scale(o, o); K.g.translate(-860, -320);
      K.box(720, 250, 280, 140, { stroke: t > 11.4 && t < 16 ? P.warm : P.acc, lw: 2.5, a: K.clamp(o) });
      K.text('new object', 740, 276, { size: 17, color: P.muted, a: K.clamp(o) });
      var nm0 = K.p(t, 12.3, 0.3), nm = K.p(t, 12.6, 0.5);
      K.text('{ }', 860, 330, { size: 30, mono: true, align: 'center', a: K.clamp(o) * (1 - nm0) });
      K.text('name: "Rex"', 860, 330, { size: 24, mono: true, color: P.warm, align: 'center', a: nm });
      K.g.restore();
    }
    K.arrow(940, 250, 1040, 202, { p: K.p(t, 6.6, 0.5), color: P.warm });
    K.text('[[Prototype]]', 1060, 236, { size: 16, color: P.muted, a: K.p(t, 7) });
    var th = K.back((t - 11.4) / 0.5);
    if (th > 0) K.chip('this', 1130, 330, { mono: true, size: 22, stroke: P.warm, color: P.warm, s: th });
    K.arrow(1090, 330, 1006, 330, { p: K.p(t, 11.7, 0.4), color: P.warm });
    K.text('Dog body: this.name = name', 860, 420, { size: 17, mono: true, color: P.muted, align: 'center', a: K.win(t, 12.2, 16) });
    var r = K.back((t - 16.4) / 0.5);
    if (r > 0) K.chip('rex', 760, 470, { mono: true, size: 24, stroke: P.acc, s: r });
    K.arrow(790, 450, 830, 396, { p: K.p(t, 16.8, 0.4), color: P.acc });
    K.text('returned and stored in rex', 830, 470, { size: 18, color: P.green, a: K.p(t, 17.2) });
    K.text('if Dog returned an object, rex would get that instead', 700, 530, { size: 16, color: P.muted, a: K.p(t, 18.4) });
  } },

/* 6 ─ instanceof */
{ d: 22, title: 'instanceof',
  caps: [
    [0.3, "a instanceof F asks one question: is F.prototype anywhere on a's prototype chain?"],
    [6.5, 'rex instanceof Dog is true. rex instanceof Object is true too, one step further up.'],
    [12.5, 'Replace Dog.prototype with a new object, and existing instances are no longer instanceof Dog.'],
    [18.5, 'Read the link with Object.getPrototypeOf. The __proto__ accessor is legacy.']],
  draw: function (K, t) {
    var P = K.P;
    var repl0 = K.p(t, 12.9, 0.3), repl = K.p(t, 13.2, 0.5);
    var B = [['rex', P.acc], ['Dog.prototype', P.warm], ['Object.prototype', P.purple], ['null', P.red]];
    var scan = [[[7, 7.6]], [[7.6, 8.8], [9.2, 9.7], [10.8, 11.2]], [[9.7, 10.6], [11.2, 11.6]], [[11.6, 12.4]]];
    B.forEach(function (b, i) {
      var x = 60 + i * 300, q = K.p(t, 0.8 + i * 0.3), hot = 0;
      scan[i].forEach(function (w) { hot = Math.max(hot, K.win(t, w[0], w[1], 0.15)); });
      K.box(x, 96, 260, 70, { stroke: hot > 0.5 ? (i === 3 ? P.red : P.green) : b[1], lw: hot > 0.5 ? 3.5 : 2, a: q });
      if (i === 1) {
        K.text(b[0], x + 130, 131, { size: 21, weight: 700, align: 'center', a: q * (1 - repl0) });
        K.text('old prototype object', x + 130, 131, { size: 19, weight: 700, color: P.warm, align: 'center', a: repl });
      } else K.text(b[0], x + 130, 131, { size: 21, weight: 700, align: 'center', color: i === 3 ? P.red : P.ink, a: q });
      if (i) K.arrow(x - 38, 131, x - 6, 131, { p: K.p(t, 1 + i * 0.3, 0.3), color: P.muted, lw: 2.5, head: 10 });
    });
    K.mark(450, 96, true, 0.7, K.win(t, 8, 13.2));
    K.mark(750, 96, true, 0.7, K.win(t, 10.1, 13.2));
    K.mark(1050, 96, false, 0.7, K.win(t, 11.8, 13.2));
    K.chip('Object.getPrototypeOf(rex)', 400, 214, { mono: true, size: 18, stroke: P.green, a: K.p(t, 18.8) });
    K.chip('rex.__proto__  (legacy)', 860, 214, { mono: true, size: 18, stroke: P.line, color: P.muted, a: K.p(t, 19.6) });
    var code = ['rex instanceof Dog;     // true', 'rex instanceof Object;  // true', 'rex instanceof Array;   // false'];
    K.panel(40, 256, 620, 166, 'instanceof.js', { a: K.p(t, 6.4) });
    K.code(code, 64, 296, { size: 20, n: K.typed(t, code, [6.6, 9.0, 10.6], 40), t: t, a: K.p(t, 6.4), hi: t > 10.6 && t < 12.5 ? 2 : t > 9 && t < 10.6 ? 1 : t > 6.6 && t < 9 ? 0 : -1, w: 596 });
    var qa = K.p(t, 0.8);
    K.box(700, 256, 540, 166, { fill: P.code, stroke: P.acc, a: qa });
    K.text('a instanceof F', 970, 312, { size: 26, mono: true, align: 'center', a: qa });
    K.text("is F.prototype on a's chain?", 970, 366, { size: 22, color: P.acc, align: 'center', a: K.p(t, 1.6) });
    var c2 = ['Dog.prototype = { bark() {} };   // replaced', 'rex instanceof Dog;              // false', 'new Dog("Bo") instanceof Dog;    // true'];
    K.panel(40, 442, 1200, 142, '', { a: K.p(t, 12.6) });
    K.code(c2, 64, 460, { size: 19, lh: 1.55, n: K.typed(t, c2, [12.8, 14.6, 15.8], 40), t: t, a: K.p(t, 12.6) });
    K.text('rex still links to the old object', 1200, 480, { size: 18, color: P.warm, align: 'right', a: K.p(t, 15.2) });
    K.text('instanceof checks the current Dog.prototype', 1200, 520, { size: 18, color: P.muted, align: 'right', a: K.p(t, 16.6) });
  } },

/* 7 ─ classic inheritance */
{ d: 26, title: 'Inheritance without classes',
  caps: [
    [0.3, 'Inheritance before classes: Dog.prototype is created from Animal.prototype with Object.create.'],
    [7, 'Restore the constructor link, and call Animal with this inside Dog, so the parent sets name.'],
    [13, "d.speak() finds Dog's version first. It can still call the parent's version explicitly."],
    [19, 'This is exactly the chain that class Dog extends Animal builds for you. That is tomorrow.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['function Animal(name) { this.name = name; }', 'Animal.prototype.speak = function () {', '  return this.name + " makes a sound";', '};',
      'function Dog(name) { Animal.call(this, name); }', 'Dog.prototype = Object.create(Animal.prototype);', 'Dog.prototype.constructor = Dog;',
      'Dog.prototype.speak = function () {', '  return Animal.prototype.speak.call(this) + ": woof";', '};', 'const d = new Dog("Rex");'];
    var hl = t > 13.2 && t < 19 ? 8 : t > 10 && t < 13 ? 4 : t > 7.2 && t < 10 ? 6 : t > 4.1 && t < 7 ? 5 : -1;
    K.panel(40, 84, 700, 390, 'inherit.js');
    K.code(code, 62, 122, { size: 19, lh: 1.55, n: K.typed(t, code, [0.5, 1.4, 2.2, 3.0, 3.1, 4.1, 7.2, 13.2, 13.95, 15.1, 15.2], 50), t: t, hi: hl, w: 676 });
    var op = K.p(t, 15.8);
    K.panel(40, 494, 700, 90, '', { a: op });
    K.text('d.speak()  →  "Rex makes a sound: woof"', 64, 539, { size: 20, mono: true, a: K.p(t, 16.4) });
    var B = [['d', 15.6, P.acc], ['Dog.prototype', 4.6, P.warm], ['Animal.prototype', 1.6, P.purple], ['Object.prototype', 1.9, P.line]];
    B.forEach(function (b, i) {
      var y = 96 + i * 100, q = K.back((t - b[1]) / 0.5); if (q <= 0) return;
      var hot = i === 0 ? K.win(t, 16.4, 17, 0.15) : i === 1 ? K.win(t, 17, 19, 0.15) : 0;
      K.g.save(); K.g.translate(1010, y + 35); K.g.scale(q, q); K.g.translate(-1010, -y - 35);
      K.box(780, y, 460, 70, { stroke: hot > 0.5 ? P.green : b[2], lw: hot > 0.5 ? 3.5 : 2, a: K.clamp(q) });
      K.text(b[0], 800, y + 35, { size: 21, weight: 700, a: K.clamp(q) });
      K.g.restore();
      if (i) K.arrow(1010, y - 28, 1010, y - 4, { p: K.p(t, Math.max(b[1], B[i - 1][1]) + 0.2, 0.3), color: P.muted, lw: 2.5, head: 9 });
    });
    K.text('name: "Rex"', 1060, 131, { size: 18, mono: true, color: P.warm, a: K.p(t, 15.8) });
    K.text('constructor', 1060, 218, { size: 17, mono: true, color: P.blue, a: K.p(t, 7.6) });
    K.text('speak()', 1060, 244, { size: 17, mono: true, color: P.green, a: K.p(t, 14.4) });
    K.text('speak()', 1060, 331, { size: 18, mono: true, a: K.p(t, 2) });
    K.text('toString() …', 1060, 431, { size: 18, mono: true, color: P.muted, a: K.p(t, 2.2) });
    K.curve(1140, 244, 1220, 290, 1140, 326, { p: K.p(t, 17.8, 0.5), color: P.green, dash: [5, 5], lw: 2.5, head: 10 });
    K.text('Animal.call(this, name)', 1010, 488, { size: 17, mono: true, color: P.blue, align: 'center', a: K.win(t, 10, 13) });
    var cl = K.back((t - 19.4) / 0.5);
    if (cl > 0) K.chip('class Dog extends Animal { … }', 1010, 520, { mono: true, size: 18, stroke: P.acc, s: cl });
    K.text('builds this same chain · Day 8', 1010, 566, { size: 17, color: P.muted, align: 'center', a: K.p(t, 20) });
  } },

/* 8 ─ null prototypes and pollution */
{ d: 25, title: 'Object.create(null) and pollution',
  caps: [
    [0.3, 'Object.create(null) makes a bare dictionary: no prototype, so no inherited keys like toString.'],
    [6.5, 'Prototype pollution: a naive deep merge of untrusted JSON follows the __proto__ key into Object.prototype.'],
    [13, 'Now every object in the app inherits isAdmin. Reject __proto__ keys, or use Map or null-prototype objects.'],
    [19.5, 'And never add methods to built-in prototypes in application code.']],
  draw: function (K, t) {
    var P = K.P;
    var code = ['const dict = Object.create(null);', 'dict.toString;      // undefined', '"toString" in {};   // true'];
    K.panel(40, 84, 600, 170, 'dict.js');
    K.code(code, 64, 124, { size: 20, n: K.typed(t, code, [0.6, 2.4, 4.0], 34), t: t });
    var a1 = K.p(t, 1.2), a2 = K.p(t, 1.8);
    K.box(680, 96, 170, 60, { stroke: P.acc, a: a1 }); K.text('{ }', 765, 126, { size: 22, mono: true, align: 'center', a: a1 });
    K.arrow(856, 126, 896, 126, { p: K.p(t, 1.4, 0.3), color: P.muted, lw: 2.5, head: 10 });
    K.box(900, 96, 340, 60, { stroke: P.purple, a: a1 }); K.text('Object.prototype: toString …', 920, 126, { size: 18, a: a1 });
    K.box(680, 180, 170, 60, { stroke: P.green, a: a2 }); K.text('dict', 765, 210, { size: 22, mono: true, align: 'center', a: a2 });
    K.arrow(856, 210, 896, 210, { p: K.p(t, 2, 0.3), color: P.muted, lw: 2.5, head: 10 });
    K.box(900, 180, 120, 60, { stroke: P.red, a: a2 }); K.text('null', 960, 210, { size: 22, weight: 700, color: P.red, align: 'center', a: a2 });
    K.text('a clean map: no inherited keys', 1040, 210, { size: 16, color: P.green, a: K.p(t, 3) });
    var c2 = ['const input = JSON.parse(\'{"__proto__": {"isAdmin": true}}\');', 'naiveDeepMerge({}, input);', '({}).isAdmin;   // true, for every object!'];
    var mp = K.p(t, 6.6);
    K.panel(40, 274, 780, 150, 'merge.js', { a: mp });
    K.code(c2, 64, 312, { size: 18, n: K.typed(t, c2, [6.8, 9.0, 13.2], 36), t: t, a: mp, marks: t > 14.4 ? { 2: 'rgba(252,129,129,.18)' } : null, w: 756 });
    var op = K.p(t, 9.6);
    K.box(860, 274, 380, 110, { stroke: t > 10.4 ? P.red : P.purple, lw: t > 10.4 ? 3 : 2, a: op });
    K.text('Object.prototype', 880, 304, { size: 21, weight: 700, a: op });
    K.text('isAdmin: true', 880, 348, { size: 21, mono: true, color: P.red, a: K.p(t, 10.4) });
    K.curve(664, 296, 770, 236, 856, 300, { p: K.p(t, 9.8, 0.6), color: P.red, dash: [6, 5], lw: 2.5, a: 1 - K.p(t, 13, 0.4) });
    ['user', 'config', '{ }'].forEach(function (s, i) {
      var x = 920 + i * 120, q = K.p(t, 13.4 + i * 0.3);
      K.chip(s, x, 444, { mono: true, size: 18, stroke: P.red, a: q });
      K.arrow(x, 424, x, 390, { p: K.p(t, 13.6 + i * 0.3, 0.3), color: P.red, lw: 2, head: 9 });
    });
    K.text('all inherit isAdmin', 1040, 494, { size: 17, color: P.red, align: 'center', a: K.p(t, 14.4) });
    var f = K.p(t, 15.4);
    K.box(40, 444, 780, 140, { fill: 'rgba(104,211,145,.08)', stroke: P.green, a: f });
    K.text('Defences', 64, 472, { size: 18, weight: 700, color: P.green, a: f });
    K.chip('skip __proto__, constructor keys', 240, 520, { size: 17, stroke: P.green, a: K.p(t, 15.8) });
    K.chip('Map or Object.create(null)', 590, 520, { size: 17, stroke: P.green, a: K.p(t, 16.4) });
    K.chip('validate input with a schema', 240, 562, { size: 17, stroke: P.green, a: K.p(t, 17) });
    var nb = K.p(t, 19.8);
    K.mark(880, 552, false, 0.8, nb);
    K.text('Array.prototype.myFn = …', 906, 552, { size: 18, mono: true, color: P.red, a: nb });
  } },

/* 9 ─ recap */
{ d: 14, title: 'Recap',
  caps: [[0.5, 'Recap. Now open the Day 7 topics below and run every example yourself.']],
  draw: function (K, t) {
    var P = K.P;
    K.text('Recap', 640, 112, { size: 48, weight: 800, align: 'center', a: K.p(t, 0.2) });
    ['Reads walk up the [[Prototype]] chain until null',
     'Writes create own properties that shadow inherited ones',
     'new: create, link to F.prototype, run F with this, return',
     'instanceof checks whether F.prototype is on the chain',
     'Object.create(null) for dictionaries; beware prototype pollution'].forEach(function (s, i) {
      var q = K.p(t, 1.2 + i * 1.1, 0.5), y = 190 + i * 66;
      K.mark(220, y, true, 0.9, q);
      K.text(s, 252 - (1 - q) * 20, y, { size: 24, a: q });
    });
    K.chip('Next: run the Day 7 examples with ▶ Run', 640, 545, { size: 22, stroke: P.acc, color: P.acc, s: K.back((t - 8) / 0.6), a: K.p(t, 8) });
  } }
  ]
});
