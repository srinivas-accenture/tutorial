/* Week 2: Core language depth — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js. */
JSC.registerWeek({w:2,revision:[
"<b>Closure</b> = function + live reference to its creation scope. Variables are shared, not copied. Each call makes a fresh environment.",
"<b>Prototype chain:</b> reads walk up [[Prototype]] until null; writes create an own property on the object itself. <code>F.prototype</code> is what <code>new F()</code> objects delegate to.",
"<b>new</b> does 4 things: create object, link prototype, run constructor with this, return object (unless constructor returns an object).",
"<b>Classes</b> are syntax over prototypes, plus strict mode, TDZ, non-enumerable methods, <code>#private</code> fields and static blocks. Class instances call overridden methods even from the parent's constructor.",
"<b>Iterator protocol:</b> <code>[Symbol.iterator]()</code> returns <code>{ next() }</code> giving <code>{value, done}</code>. for...of, spread, destructuring, Array.from, Map, Set all use it.",
"<b>Generators</b> pause at yield and are lazy; <code>next(v)</code> sends a value in. <b>Iterator helpers</b> (map/filter/take/drop/toArray) are lazy, unlike array methods.",
"<b>Destructuring defaults</b> apply only to <code>undefined</code>, never to <code>null</code>. Object rest/spread is shallow and copies own enumerable properties.",
"<b>Proxy</b> intercepts operations on an object; always use <code>Reflect</code> inside traps. Private <code>#fields</code> cannot be intercepted.",
"<b>freeze</b> is shallow and silent in sloppy mode (throws in strict). <b>structuredClone</b> is deep but drops prototypes, functions and getters.",
"<b>using</b> / <code>Symbol.dispose</code> (explicit resource management) is Stage 4, expected ES2027, shipped in Chromium; WebKit is still catching up."
],days:[
{n:6,title:"Closures",goal:"Understand the most important idea in JavaScript and use it for private state, caching and factories.",topics:[
{id:"d6-closures",title:"Closures",
eli5:`<p>When a function is born, it packs a <b>backpack</b> with everything it can see at home (the variables around it). Wherever the function travels afterwards, even far away, it carries the backpack and can still open it. Two functions made at the same home share the same backpack; a function made at a different home has its own.</p>`,
why:`<p>Functions need to remember where they came from so callbacks, timers and event handlers can use variables long after the code that created them has finished. Closures give JavaScript private state without classes.</p>`,
tech:`<p>A <b>closure</b> is a function together with a reference to the lexical environment in which it was created. Every function object has an internal <code>[[Environment]]</code> pointing to its creation scope, so lookups continue to work after the outer function has returned.</p>
<ul class="pts"><li>The environment is captured <b>by reference</b> (live), not by copying values: if the outer variable changes later, the closure sees the new value.</li><li>Every <b>call</b> of the outer function creates a <b>new</b> environment, so each returned closure gets its own state.</li><li>Engines (V8) only keep variables that some inner function actually references, in a heap-allocated "context". Everything else stays on the stack.</li><li>A closure keeps its captured variables alive as long as the function itself is reachable (this matters for memory leaks, Day 22).</li></ul>`,
diagram:{html:flow([["makeCounter() called","new environment { count: 0 }","w"],["returns inc()","inc.[[Environment]] → that environment","g"],["makeCounter finished","its stack frame is gone, but the environment lives on"],["inc() called later","count++ updates the same environment"]]),steps:["Each call to <code>makeCounter</code> allocates a fresh environment holding <code>count</code>.","The returned function stores a pointer to that environment.","The outer function's frame is popped, but the environment is still reachable through <code>inc</code>, so it is not garbage collected.","Every call to <code>inc</code> reads and writes the same <code>count</code>."]},
ex:[{t:"Private, independent state",code:`function makeCounter(){
  let count = 0;
  return { inc: () => ++count, get: () => count };
}
const a = makeCounter(), b = makeCounter();
a.inc(); a.inc(); b.inc();
console.log(a.get(), b.get(), typeof a.count);`},
{t:"Live reference, and the classic loop",code:`let x = 1;
const f = () => x;
x = 2;
console.log(f());             // sees the update
const fnsVar = [], fnsLet = [];
for (var i = 0; i < 3; i++) fnsVar.push(() => i);
for (let j = 0; j < 3; j++) fnsLet.push(() => j);
console.log(fnsVar.map(f => f()), fnsLet.map(f => f()));`,note:"<code>let</code> creates a new binding per loop iteration, which is why each closure sees its own value. Before ES2015 the fix was an IIFE."}],
browser:`<p>Event listeners, <code>setTimeout</code> callbacks and promise handlers are all closures. In DevTools' debugger, the <b>Scope</b> panel lists "Closure" entries: those are the captured variables. Keep in mind that a long-lived listener keeps everything it captured alive.</p>`,
gotchas:[`Closures capture <b>variables</b>, not values. A <code>var</code> loop variable is one shared variable.`,`Closures do not capture <code>this</code> (except arrows, which resolve <code>this</code> lexically like any variable).`,`A small closure can keep a huge object alive if it references it; copy out only what you need.`,`Shared environments: two closures created in the same call share their captured variables, so changes by one are seen by the other.`,`Debugging: a variable that is not referenced by any inner function may be optimized away and not appear in the Closure scope.`],
best:[`Use closures for factories, private state, memoization and callbacks.`,`Null out or avoid capturing large objects in long-lived callbacks; remove listeners when done.`,`Prefer <code>let</code>/<code>const</code> in loops.`],
iq:[["fresher","What is a closure?","A function bundled with its surrounding scope, so it can access outer variables even after the outer function has returned."],["fresher","What does this print: for (var i=0;i<3;i++) setTimeout(()=>console.log(i))?","3 3 3: the callbacks run after the loop and share one i. With let it prints 0 1 2. Fix for old code: an IIFE or setTimeout's extra argument."],["mid","How can closures cause memory leaks?","A long-lived function (listener, timer, cache) holds its environment, which keeps all captured variables (and the objects they reference) reachable. Remove listeners, clear timers, avoid capturing big objects."],["senior","How does V8 implement closures?","Variables referenced by inner functions are allocated in a heap 'Context' object chained to the outer context; unreferenced variables stay in registers/stack. Functions hold a pointer to their context."]],
practice:[`Write <code>makeIdGenerator(prefix)</code> returning a function that gives <code>prefix-1</code>, <code>prefix-2</code>, ...`,`Fix the var loop with an IIFE, then with let, and explain the difference.`],
teach:`<p>"A closure is a backpack. A function packs the variables it could see where it was born, and keeps them forever, even if it travels far away. Functions born in the same place share one backpack."</p>`},

{id:"d6-closure-uses",title:"Closure patterns: once, memoize, modules",
eli5:`<p>With a backpack you can build a <b>vending machine</b>: the money inside is hidden, and people can only press the buttons you give them. You can build a <b>notebook that remembers answers</b> so it never recomputes the same sum twice (memoize). And a <b>"do this only once" button</b> that works the first time and then ignores you.</p>`,
why:`<p>Before ES modules and private class fields, closures were the only way to hide data. These patterns are also the most common interview coding questions.</p>`,
tech:`<ul class="pts"><li><b>Module pattern:</b> an IIFE returns an object of public methods; everything else is private.</li><li><b>once(fn):</b> runs fn on the first call and returns the cached result after.</li><li><b>memoize(fn):</b> caches results by argument key. Choose the key carefully (<code>JSON.stringify(args)</code> is simple but slow and ignores functions/undefined; a Map keyed by the single argument is faster).</li><li><b>Partial application / currying:</b> fix some arguments now, supply the rest later. <code>curry(fn)</code> collects arguments until <code>fn.length</code> is reached.</li><li><b>debounce / throttle</b> (Day 23) are closures holding a timer id.</li></ul>`,
diagram:{html:flow([["memoize(fn)","creates cache = new Map()","w"],["returned function(args)"],["cache.has(key)?","yes → return cached","g"],["no → compute, store, return"]]),steps:["The cache lives in the closure, invisible to callers.","Each call checks the cache first.","A hit skips the expensive work; a miss computes and stores.","Caches grow forever unless you bound them (LRU) or key on objects with a WeakMap."]},
ex:[{t:"once, memoize, curry",code:`const once = (fn) => { let done = false, val; return (...a) => done ? val : (done = true, val = fn(...a)); };
const memoize = (fn) => { const c = new Map(); return (x) => c.has(x) ? c.get(x) : (c.set(x, fn(x)), c.get(x)); };
const curry = (fn) => function c(...a){ return a.length >= fn.length ? fn(...a) : (...b) => c(...a, ...b); };
let calls = 0;
const sq = memoize((n) => { calls++; return n * n; });
console.log(sq(4), sq(4), sq(5), calls);
const init = once(() => { console.log("init ran"); return 42; });
console.log(init(), init());
console.log(curry((a, b, c) => a + b + c)(1)(2)(3));`},
{t:"Module pattern",code:`const bank = (function(){
  let balance = 0;               // private
  return {
    deposit(n){ balance += n; return balance; },
    get balance(){ return balance; }
  };
})();
bank.deposit(50);
console.log(bank.balance, bank.hasOwnProperty("balance"));
bank.balance = 999;               // setter missing: ignored in sloppy mode
console.log(bank.balance);`}],
gotchas:[`Memoizing impure functions (time, random, network) returns stale or wrong results.`,`A cache keyed by <code>JSON.stringify</code> treats <code>{a:1,b:2}</code> and <code>{b:2,a:1}</code> as different and fails on cycles.`,`Unbounded memoize caches are a classic memory leak; cap size or use WeakMap for object keys.`,`<code>once</code> wrappers lose <code>this</code> unless you forward it (<code>fn.apply(this, args)</code>).`,`<code>curry</code> depends on <code>fn.length</code>, which ignores default and rest parameters.`],
best:[`Memoize only pure, expensive functions, and bound the cache.`,`Today prefer ES modules and class private fields for encapsulation; keep closures for factories and small helpers.`],
iq:[["mid","Implement memoize.","Hold a Map in a closure; build a key from arguments; return the cached value if present, else compute and store. Mention cache limits and key choice."],["mid","Implement once.","Hold a flag and the result in a closure; run the function the first time and return the stored result afterwards."],["senior","Implement curry and explain fn.length limitations.","Collect args until args.length >= fn.length, then call. Default/rest params are not counted by length, so such functions need an explicit arity argument."]],
practice:[`Write <code>memoizeLRU(fn, max)</code> using Map insertion order.`,`Write <code>pipe(...fns)</code> and <code>partial(fn, ...preset)</code>.`],
teach:`<p>"Because a function keeps its backpack, you can hide data inside it. That gives you counters nobody can tamper with, a 'run only once' button, and a notebook that remembers answers so work isn't repeated."</p>`}
],quiz:[
{code:`function make(){ let n = 0; return { inc: () => ++n, get: () => n }; }
const a = make(), b = make();
a.inc(); a.inc(); b.inc();
console.log(a.get(), b.get());`,ans:`2 1`,why:`Each call to make creates a separate environment, so a and b have independent counters.`},
{code:`let x = 1;
const f = () => x;
x = 2;
console.log(f());`,ans:`2`,why:`The closure holds a live reference to the variable x, not a snapshot of its value at creation time.`}]},

{n:7,title:"Prototypes",goal:"Know how inheritance really works underneath classes.",topics:[
{id:"d7-prototypes",title:"The prototype chain",
eli5:`<p>If you ask a kid "do you know how to ride a bike?" and they don't, they ask their <b>parent</b>. If the parent doesn't know, they ask the <b>grandparent</b>. At the end of the family line there's nobody left to ask and the answer is "no idea" (undefined). Objects work the same way: if a property is not on the object, JavaScript asks its prototype, then that one's prototype, until the chain ends at <code>null</code>.</p>`,
why:`<p>JavaScript chose <b>delegation</b> instead of copying: shared behavior lives once on a prototype object and many objects point at it. It saves memory and lets you change behavior for all instances at once. Classes (ES2015) are a friendlier syntax over exactly this mechanism.</p>`,
tech:`<ul class="pts"><li>Every object has an internal <code>[[Prototype]]</code> link (read with <code>Object.getPrototypeOf(o)</code>; <code>o.__proto__</code> is the legacy accessor).</li><li><b>Read</b> <code>o.x</code>: look at o; if missing, follow [[Prototype]]; repeat; if the chain ends (null) → <code>undefined</code>.</li><li><b>Write</b> <code>o.x = v</code> creates or updates an <i>own</i> property on <code>o</code>, shadowing the inherited one (unless the inherited one is a setter or read-only).</li><li><code>F.prototype</code> (on functions) is the object that becomes the [[Prototype]] of everything made by <code>new F()</code>. It is not F's own prototype: <code>Object.getPrototypeOf(F)</code> is <code>Function.prototype</code>.</li><li><code>a instanceof F</code> checks whether <code>F.prototype</code> is anywhere on a's chain.</li><li><code>Object.create(proto)</code> makes an object with a chosen prototype; <code>Object.create(null)</code> makes a bare dictionary.</li></ul>`,
diagram:{html:flow([["rex","own: name"],["Dog.prototype","bark()","w"],["Animal.prototype","eat()","w"],["Object.prototype","toString(), hasOwnProperty…","g"],["null","end of chain","r"]]),steps:["<code>rex.eat()</code>: not on rex → not on Dog.prototype → found on Animal.prototype.","<code>rex.toString()</code> walks all the way to Object.prototype.","<code>rex.fly</code> reaches <code>null</code> and evaluates to <code>undefined</code>.","Each arrow is the object's [[Prototype]] link."]},
ex:[{t:"Walking the chain",code:`const animal = { eat(){ return "nom"; } };
const dog = Object.create(animal);
dog.bark = () => "woof";
const rex = Object.create(dog);
console.log(rex.eat(), rex.bark(), rex.fly);
console.log(Object.getPrototypeOf(rex) === dog, Object.hasOwn(rex, "eat"));
console.log(Object.getPrototypeOf(Object.prototype));`},
{t:"Reads walk up, writes shadow",code:`const proto = { x: 1 };
const child = Object.create(proto);
child.x++;                  // read 1 from proto, write 2 onto child
console.log(child.x, proto.x, Object.hasOwn(child, "x"));
function A(){}
A.prototype.v = 1;
const a = new A();
A.prototype = { v: 2 };     // replacing the object does not affect existing instances
const b = new A();
console.log(a.v, b.v, a instanceof A, b instanceof A);`}],
browser:`<p>DevTools shows the chain under <code>[[Prototype]]</code> (or <code>__proto__</code>) when you expand an object. DOM objects use it heavily: <code>div → HTMLDivElement.prototype → HTMLElement.prototype → Element.prototype → Node.prototype → EventTarget.prototype → Object.prototype</code>. Polyfills add methods to built-in prototypes.</p>`,
gotchas:[`Mutable objects on a prototype are shared by all instances: <code>Proto.list = []</code> then <code>a.list.push(1)</code> changes it for everyone.`,`Writing to an inherited property creates an own property; it never modifies the prototype (unless you write to the prototype object itself).`,`<code>for...in</code> includes inherited enumerable properties.`,`Changing a prototype after creation (<code>Object.setPrototypeOf</code>) can deoptimize code; set it at creation time.`,`<b>Prototype pollution:</b> merging untrusted JSON into objects with <code>__proto__</code> keys can add properties to <code>Object.prototype</code> and affect the whole app. Use <code>Object.create(null)</code>, Map, or reject <code>__proto__</code> keys.`],
best:[`Prefer <code>Object.getPrototypeOf</code>/<code>Object.create</code> over <code>__proto__</code>.`,`Don't modify built-in prototypes in application code.`,`Put methods on the prototype (or use classes); keep per-instance data as own properties.`],
iq:[["fresher","What is the prototype chain?","The linked series of [[Prototype]] references JavaScript follows when looking up a property that is not on the object itself, ending at null."],["mid","__proto__ vs prototype?","<code>prototype</code> is a property of constructor functions used as the [[Prototype]] of instances; <code>__proto__</code> (legacy) is an accessor exposing an object's actual [[Prototype]]."],["mid","What is the output of rex.fly and how does it work?","undefined: the lookup walks the whole chain and reaches null."],["senior","What is prototype pollution?","Adding properties to Object.prototype via a vulnerable merge/clone/path-set function, affecting every object. Mitigate with null-prototype objects, Map, key allowlists, Object.freeze(Object.prototype) in hardened environments, and validated schemas."]],
practice:[`Implement <code>instanceof</code> as a function <code>myInstanceOf(obj, Ctor)</code>.`,`Write a function that prints an object's full prototype chain.`],
teach:`<p>"If an object doesn't have something, it asks its parent object, then the grandparent, until the chain ends at null. Reading goes up the chain. Writing always lands on the object you wrote to."</p>`},

{id:"d7-new",title:"new, constructors and Object.create",
eli5:`<p>A <b>constructor</b> is a cookie factory. When you say <code>new Cookie("choc")</code>, the factory (1) grabs a blank dough lump, (2) tells the lump "you're a Cookie, ask the cookie recipe book when you don't know something", (3) fills in the lump's own details, and (4) hands you the cookie.</p>`,
why:`<p>Before classes, constructor functions plus <code>new</code> were the way to create many similar objects that share methods. Knowing the steps lets you explain classes, <code>instanceof</code> and many bugs.</p>`,
tech:`<p><code>new F(args)</code> does:</p><ol><li>Create an empty object <code>obj</code>.</li><li>Set <code>obj.[[Prototype]] = F.prototype</code>.</li><li>Call <code>F</code> with <code>this = obj</code>.</li><li>If <code>F</code> returns an <i>object</i>, that object is the result; otherwise return <code>obj</code>.</li></ol>
<ul class="pts"><li>Each <code>F.prototype</code> starts with a <code>constructor</code> property pointing back at <code>F</code> (replace the prototype and you must restore it).</li><li><code>new.target</code> inside a function tells whether it was called with <code>new</code>.</li><li>Classic inheritance: <code>Child.prototype = Object.create(Parent.prototype); Child.prototype.constructor = Child;</code> plus <code>Parent.call(this, ...)</code> in the child constructor.</li><li>Methods defined inside the constructor (<code>this.say = function(){}</code>) create a new function per instance; define them on the prototype to share one.</li></ul>`,
diagram:{html:flow([["1. {} created","empty object"],["2. link prototype","obj → F.prototype","w"],["3. run F with this = obj","fields added","w"],["4. return obj","unless F returned an object","g"]]),steps:["The engine allocates a new empty object.","Its hidden [[Prototype]] is set to <code>F.prototype</code> so inherited methods are found.","The constructor body runs with <code>this</code> pointing at the new object.","The object is returned automatically."]},
ex:[{t:"Implement new yourself, and classic inheritance",code:`function myNew(F, ...args){
  const obj = Object.create(F.prototype);
  const res = F.apply(obj, args);
  return (res !== null && (typeof res === "object" || typeof res === "function")) ? res : obj;
}
function Animal(name){ this.name = name; }
Animal.prototype.speak = function(){ return this.name + " makes a sound"; };
function Dog(name){ Animal.call(this, name); }
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function(){ return Animal.prototype.speak.call(this) + ": woof"; };
const d = myNew(Dog, "Rex");
console.log(d.speak(), d instanceof Animal, d.constructor === Dog);`},
{t:"Constructor returns an object, and new.target",code:`function Odd(){ this.a = 1; return { b: 2 }; }
console.log(new Odd());
function Maybe(){ return new.target ? "with new" : "without new"; }
console.log(new Maybe() instanceof Maybe, Maybe());`}],
gotchas:[`Forgetting <code>new</code> in sloppy mode sets properties on the global object (this = global); in strict mode it throws a TypeError.`,`Overwriting <code>F.prototype = {...}</code> loses the <code>constructor</code> link.`,`A constructor returning a primitive is ignored; returning an object replaces <code>this</code>.`,`Per-instance function properties waste memory compared to prototype methods.`,`Arrow functions and methods are not constructors.`],
best:[`Use <code>class</code> syntax in new code; know the function form for interviews and legacy code.`,`Guard constructors with <code>new.target</code> if misuse is likely.`],
iq:[["fresher","What does the new keyword do?","Creates an object, links its prototype, runs the constructor with this bound to it, and returns it."],["mid","Implement new.","See the example: Object.create(F.prototype), apply F with the new object as this, and return the result if it is an object, else the new object."],["senior","How does Object.create differ from new?","Object.create sets the prototype directly without running any constructor and can create null-prototype objects or take property descriptors."]],
practice:[`Rewrite the Animal/Dog example with <code>class</code> and compare the prototype chains.`,`Make a constructor that works with or without <code>new</code>.`],
teach:`<p>"new makes a blank object, tells it who its recipe book is, lets the constructor fill it in, and hands it back. Classes are just a nicer way to write that."</p>`}
],quiz:[
{code:`function A(){}
A.prototype.v = 1;
const a = new A();
A.prototype = { v: 2 };
const b = new A();
console.log(a.v, b.v, a instanceof A, b instanceof A);`,ans:`1 2 false true`,why:`a keeps pointing at the old prototype object. instanceof compares against the current A.prototype, which is only in b's chain.`},
{code:`const p = { x: 1 };
const c = Object.create(p);
c.x++;
console.log(c.x, p.x, Object.hasOwn(c, 'x'));`,ans:`2 1 true`,why:`c.x++ reads 1 through the prototype, then writes 2 as a new own property on c. The prototype is untouched.`}]},

{n:8,title:"Classes",goal:"Use modern class syntax with full knowledge of what it does underneath.",topics:[
{id:"d8-classes",title:"Classes",
eli5:`<p>A class is a <b>cookie cutter</b>: it describes the shape. Each <code>new</code> call stamps out a cookie (an object). A <b>subclass</b> is a fancier cutter that starts from the basic cutter and adds sprinkles. <code>super</code> means "do the parent's part first".</p>`,
why:`<p>Constructor functions and manual prototype wiring were verbose and error-prone. ES2015 classes give clear syntax for the same prototype mechanism, with stricter safety checks.</p>`,
tech:`<ul class="pts"><li><code>class A { constructor(){} method(){} static s(){} }</code>: methods go on <code>A.prototype</code> (non-enumerable); statics on <code>A</code> itself.</li><li><code>class B extends A</code>: sets <code>B.prototype.[[Prototype]] = A.prototype</code> <b>and</b> <code>B.[[Prototype]] = A</code> (so statics inherit too).</li><li>In a derived constructor you must call <code>super(...)</code> before touching <code>this</code>.</li><li>Differences from functions: class bodies are strict; a class cannot be called without <code>new</code>; declarations are in the TDZ; methods are not enumerable and not constructors.</li><li>Dynamic dispatch: an overridden method is called even from the parent's constructor (but derived fields are not initialized yet).</li><li><code>extends</code> works with any constructor, including built-ins (<code>Array</code>, <code>Error</code>, <code>EventTarget</code>) and expressions (mixins).</li></ul>`,
diagram:{html:lanes([["Instance chain",["rex","→ Dog.prototype","→ Animal.prototype","→ Object.prototype → null"]],["Constructor chain (statics)",["Dog","→ Animal","→ Function.prototype","→ Object.prototype → null"]]]),steps:["<code>extends</code> wires two chains.","The prototype chain makes instance methods inherited.","The constructor chain makes <code>static</code> methods inherited and makes <code>super(...)</code> in the constructor find the parent."]},
ex:[{t:"Inheritance, super and virtual dispatch",code:`class Animal {
  constructor(name){ this.name = name; this.sound = this.noise(); }
  noise(){ return "..."; }
  speak(){ return this.name + ": " + this.sound; }
  static create(n){ return new this(n); }
}
class Dog extends Animal {
  noise(){ return "woof"; }
  speak(){ return super.speak() + "!"; }
}
console.log(Dog.create("Rex").speak());
console.log(Object.getPrototypeOf(Dog) === Animal, typeof Dog);
try { Dog("x"); } catch (e) { console.log(e.name); }`},
{t:"Derived constructors need super first",code:`class P { constructor(){ this.p = 1; } }
class C extends P {
  constructor(){
    try { this.c = 2; } catch (e) { console.log(e.name); }
    super();
    this.c = 2;
  }
}
console.log(new C());`}],
browser:`<p>Custom elements (<code>class MyEl extends HTMLElement</code>) and <code>EventTarget</code>/<code>Error</code> subclasses are the common browser uses. Because class bodies are strict, a handler detached from its instance gets <code>this === undefined</code>.</p>`,
gotchas:[`Overridden methods run during the parent constructor before the child's fields are set.`,`Class fields using arrow functions create one function per instance (but keep <code>this</code> bound).`,`Subclassing built-ins works now; older transpiled code (ES5 targets) broke <code>instanceof</code> for <code>Error</code> subclasses.`,`Classes are not hoisted for use; the name is in the TDZ until the declaration runs.`,`Methods are non-enumerable, so <code>Object.keys(instance)</code> shows only fields.`],
best:[`Prefer composition over deep inheritance; keep hierarchies shallow.`,`Don't call overridable methods from constructors.`,`Use <code>#private</code> fields for encapsulation (next topic).`],
iq:[["fresher","Are JavaScript classes 'real' classes?","They are syntax over prototypes: methods live on the prototype and instances delegate to it."],["mid","What are the differences between class and constructor function?","Strict mode, no calling without new, TDZ, non-enumerable methods, super/extends semantics, private fields and static blocks."],["senior","What happens on extends?","Two links are set: Child.prototype's prototype is Parent.prototype, and Child's own prototype is Parent, so instance and static members both inherit."],["senior","Inheritance vs composition?","Inheritance models is-a and couples classes tightly; composition (objects holding other objects or mixing behaviors) is more flexible and easier to test."]],
practice:[`Build <code>Shape → Circle/Rect</code> with <code>area()</code> and <code>toString()</code>.`,`Create a mixin <code>Serializable(Base)</code> that adds <code>toJSON</code>.`],
teach:`<p>"A class is a cookie cutter. extends makes a fancier cutter based on another. super says 'let the parent do its part'. Under the hood it's still the prototype chain."</p>`},

{id:"d8-private",title:"Private fields, static blocks and accessors",
eli5:`<p>A <b>private field</b> is a diary with a real lock: only the owner (code inside the class) can open it. A <b>getter/setter</b> is a polite receptionist: when someone asks for a value or tries to set it, the receptionist checks the rules first.</p>`,
why:`<p>Underscore names (<code>_secret</code>) were only a convention. <code>#private</code> fields (ES2022) are enforced by the language, so internals can change without breaking users.</p>`,
tech:`<ul class="pts"><li><code>#name</code> declares a private field/method; accessing it outside the class is a <b>SyntaxError</b>. It is per-class, not discoverable by reflection, and not interceptable by Proxy.</li><li>Brand check: <code>#x in obj</code> tests whether an object has the private field (without throwing).</li><li><b>Static blocks</b> <code>static { ... }</code> run once at class definition to initialize static state.</li><li><b>Accessors:</b> <code>get x(){}</code> / <code>set x(v){}</code> define computed properties on the prototype; the <code>accessor</code> keyword (decorators proposal) is not yet standard.</li><li><b>Fields</b> <code>count = 0;</code> are initialized per instance in declaration order after <code>super()</code> returns.</li><li><b>Decorators</b> (<code>@log</code>) are <b>not yet JavaScript</b>: the proposal was moved back to Stage 2.7 in May 2026; TypeScript compiles its own version. Don't rely on them in plain JS.</li></ul>`,
diagram:{html:lanes([["Public (prototype / instance)",["obj.method()","obj.field","visible to everyone"]],["Private (#)",["#secret","only code inside the class body","SyntaxError elsewhere"]]]),steps:["Public members are ordinary properties and can be read, changed, enumerated.","Private names live in a hidden per-class table; access from outside is rejected at parse time.","Even <code>Object.getOwnPropertyNames</code> and Proxy cannot see them."]},
ex:[{t:"Private state, accessors, static block",code:`class Account {
  #balance = 0;
  static #count = 0;
  static total;
  static { Account.total = "init at definition"; }
  constructor(n){ this.#balance = n; Account.#count++; }
  get balance(){ return this.#balance; }
  set balance(v){ if (v < 0) throw new RangeError("negative"); this.#balance = v; }
  static count(){ return Account.#count; }
  static isAccount(o){ return #balance in o; }
}
const a = new Account(10);
a.balance = 25;
console.log(a.balance, Account.count(), Account.total, Account.isAccount(a), Account.isAccount({}));
try { a.balance = -1; } catch (e) { console.log(e.name); }
console.log(Object.keys(a), JSON.stringify(a));`}],
gotchas:[`<code>JSON.stringify</code> ignores private fields; add a <code>toJSON()</code> if you need to serialize them.`,`Private fields are not inherited as accessible names: a subclass can't read the parent's <code>#x</code>.`,`<code>this.#x</code> on an object that is not an instance throws a TypeError at run time.`,`Private fields can't be accessed through a Proxy of the instance (<code>this</code> becomes the proxy, which lacks the private slot).`,`A getter without a setter silently ignores assignments in sloppy mode and throws in strict mode (classes are strict).`],
best:[`Default fields to private; expose the smallest public API.`,`Use brand checks (<code>#x in o</code>) instead of <code>instanceof</code> when you need real instance detection.`,`Avoid decorators in plain JS projects until the proposal ships.`],
iq:[["mid","# private fields vs closure privacy?","Both hide data. # fields are per-instance, enforced by syntax, work with class inheritance and are cheaper than a closure per method; closures work in any function and can be used before classes."],["senior","Can you access a private field with a Proxy?","No. The proxy object has no private slots, so this.#x inside a method called on the proxy throws a TypeError."],["senior","What is a static initialization block for?","Running multi-statement setup for static state at class definition time, including access to private statics."]],
practice:[`Write a <code>Temperature</code> class with a private Celsius value and Fahrenheit getter/setter.`],
teach:`<p>"# makes a field truly private: it's a locked diary only the class can open. Getters and setters let you run checks when someone reads or writes a value."</p>`}
],quiz:[
{code:`class A { constructor(){ this.n = this.name(); } name(){ return 'A'; } }
class B extends A { name(){ return 'B'; } }
console.log(new B().n);`,ans:`B`,why:`Method calls are dispatched on the actual object's prototype chain, so B's override runs even when called from A's constructor.`},
{code:`class C { static #count = 0; static inc(){ return ++C.#count; } }
console.log(C.inc(), C.inc(), typeof C, Object.keys(C));`,ans:`1 2 function []`,why:`Private statics are stored in a hidden slot; classes are functions; private names don't show up as keys.`}]},

{n:9,title:"Iterators and generators",goal:"Understand the protocol behind for...of, spread and async iteration, and write lazy sequences.",topics:[
{id:"d9-iterators",title:"Iterators and iterables",
eli5:`<p>An <b>iterable</b> is a candy dispenser. An <b>iterator</b> is the little lever: each time you press it (<code>next()</code>), one candy pops out, and it tells you when the dispenser is empty. <code>for...of</code> is a kid who keeps pressing until it's empty.</p>`,
why:`<p>Arrays, strings, Maps, Sets, NodeLists and generators all needed one common way to be looped over. The iteration protocol is that contract, and it powers <code>for...of</code>, spread, destructuring, <code>Array.from</code>, <code>Promise.all</code> and more.</p>`,
tech:`<ul class="pts"><li><b>Iterable:</b> an object with a <code>[Symbol.iterator]()</code> method that returns an iterator.</li><li><b>Iterator:</b> an object with <code>next()</code> returning <code>{ value, done }</code>. Optional <code>return()</code> (cleanup on early exit) and <code>throw()</code>.</li><li><code>for...of</code>, spread <code>[...x]</code>, array destructuring, <code>Array.from</code>, <code>new Map/Set(iterable)</code> consume iterables. They call <code>return()</code> if you <code>break</code> or throw out early.</li><li>Plain objects are not iterable; array-likes (<code>{length:2, 0:'a'}</code>) are not either (use <code>Array.from</code>).</li><li>Iteration can be <b>lazy and infinite</b>. <b>Async iterables</b> use <code>[Symbol.asyncIterator]()</code> and <code>for await...of</code>.</li></ul>`,
diagram:{html:flow([["for (const x of obj)"],["obj[Symbol.iterator]()","returns iterator","w"],["it.next()","{ value: 1, done: false }","g"],["…repeat…"],["{ done: true }","loop ends","r"]]),steps:["<code>for...of</code> asks the object for its iterator once.","It repeatedly calls <code>next()</code>.","Each result with <code>done: false</code> binds <code>value</code> to the loop variable.","<code>done: true</code> ends the loop; on <code>break</code> the engine calls <code>iterator.return()</code> so resources can be released."]},
ex:[{t:"A custom iterable, and early exit",code:`class Range {
  constructor(a, b){ this.a = a; this.b = b; }
  [Symbol.iterator](){
    let n = this.a, end = this.b;
    return {
      next: () => n <= end ? { value: n++, done: false } : { value: undefined, done: true },
      return(){ console.log("cleanup"); return { done: true }; }
    };
  }
}
console.log([...new Range(1, 4)]);
for (const n of new Range(1, 10)) { if (n === 2) break; }
const it = [1, 2, 3][Symbol.iterator]();
it.next();
console.log([...it]);`}],
browser:`<p><code>NodeList</code>, <code>HTMLCollection</code>, <code>URLSearchParams</code>, <code>FormData</code> and <code>Headers</code> are iterable; <code>for await...of</code> consumes <code>ReadableStream</code> in current browsers and in Node.</p>`,
gotchas:[`An iterator is single-use; once exhausted it stays done. An iterable can produce a fresh iterator each time.`,`Spreading an infinite iterable hangs the tab.`,`Objects with only <code>length</code> and indices are not iterable; <code>[...arrayLike]</code> throws.`,`<code>for...of</code> over an array uses the array iterator; modifying the array while looping affects the visit.`,`If <code>return()</code> is missing nothing breaks, but resources (files, locks) held by a generator in <code>finally</code> are only released when return is implemented, which generators do automatically.`],
best:[`Implement <code>[Symbol.iterator]</code> as a generator method for simplicity.`,`Use iterators for streams of data you don't want fully in memory.`],
iq:[["fresher","What can you use for...of on?","Any iterable: arrays, strings, Maps, Sets, NodeLists, generators, and objects implementing Symbol.iterator."],["mid","Make an object iterable.","Add a [Symbol.iterator] method returning an object with next(), or make it a generator method *[Symbol.iterator]()."],["senior","What happens when you break out of for...of?","The engine calls iterator.return() (if present) to let the iterator clean up; for generators this runs finally blocks."]],
practice:[`Make a linked list class iterable.`,`Write <code>take(iterable, n)</code> as a generator.`],
teach:`<p>"An iterable hands out a dispenser. The dispenser has one button, next(), that gives you one item and tells you if it's finished. Loops and spread just keep pressing the button."</p>`},

{id:"d9-generators",title:"Generators",
eli5:`<p>A generator is a <b>storyteller who can pause</b>. You say "tell me the next part", they tell one part and stop exactly where they were. Next time you ask, they continue from that spot, remembering everything. You can even whisper an answer back to them while they're paused.</p>`,
why:`<p>Writing iterators by hand needs manual state machines. Generators let you write the loop naturally and let the engine save and restore the position. They also inspired <code>async/await</code>.</p>`,
tech:`<ul class="pts"><li><code>function* g(){ yield 1; yield 2; }</code> returns a generator object (both iterator and iterable). Code runs only when <code>next()</code> is called, up to the next <code>yield</code>.</li><li><code>next(v)</code> sends <code>v</code> in as the result of the paused <code>yield</code> expression (the first <code>next</code> argument is ignored).</li><li><code>return(v)</code> ends the generator (running <code>finally</code>); <code>throw(e)</code> throws at the paused point.</li><li><code>yield* other</code> delegates to another iterable.</li><li><b>Async generators</b> (<code>async function*</code>) yield promises' values and are consumed with <code>for await</code>.</li><li>Great for lazy/infinite sequences, pagination, state machines, and cooperative tasks.</li></ul>`,
diagram:{html:flow([["it = gen()","nothing runs yet"],["it.next()","runs to first yield","w"],["paused","state kept","g"],["it.next(5)","5 becomes the yield result"],["…until return","{ done: true }","r"]]),steps:["Calling the generator function only creates the generator object.","Each <code>next()</code> resumes execution until the next <code>yield</code> (or the end).","The local variables and position are preserved while paused.","The value passed to <code>next(v)</code> becomes the value of the <code>yield</code> expression."]},
ex:[{t:"Lazy infinite sequence",code:`function* fib(){ let [a, b] = [0, 1]; while (true) { yield a; [a, b] = [b, a + b]; } }
function* take(it, n){ let i = 0; for (const x of it) { if (i++ >= n) return; yield x; } }
console.log([...take(fib(), 10)]);`},
{t:"Two-way communication and cleanup",code:`function* g(){
  try {
    const x = yield 1;
    console.log("got", x);
    yield x * 2;
  } finally { console.log("cleanup"); }
}
const i = g();
console.log(i.next("ignored").value);
console.log(i.next(5).value);
console.log(i.return("bye"));`}],
gotchas:[`The first <code>next(arg)</code> argument is discarded.`,`Generators are not restartable: a finished generator stays finished; call the function again for a new one.`,`<code>yield</code> only works directly inside the generator function, not in nested callbacks (like <code>forEach</code>).`,`Arrow functions can't be generators.`,`An unhandled <code>throw</code> inside a generator leaves it finished.`],
best:[`Use generators for lazy pipelines and custom iteration; use <code>async function*</code> for paginated APIs.`,`Keep generator-based coroutines simple; for async flow prefer async/await.`],
iq:[["mid","What is a generator?","A function that can pause at yield and resume later, returning an iterator object; it preserves its local state between calls."],["senior","How are async/await and generators related?","async functions behave like generators driven by promises: each await is like a yield that resumes when the promise settles (this is what libraries like co did before async/await)."],["senior","Output of the two-way example?","1, then 'got 5' and 10, then 'cleanup' and {value:'bye', done:true}: return() triggers finally."]],
practice:[`Write a generator that yields pages from a fake paginated API.`,`Write <code>zip(a, b)</code> as a generator.`],
teach:`<p>"A generator is a storyteller who can pause. Each time you ask for more, they continue exactly where they stopped. That lets you describe endless sequences without making them all at once."</p>`},

{id:"d9-helpers",title:"Iterator helpers (ES2025/26)",
eli5:`<p>Array tricks like <code>map</code> and <code>filter</code> make a whole new row of toys at every step, even if you only want the first three. <b>Iterator helpers</b> are an assembly line that makes toys <b>only when asked</b>, so it stops as soon as you have enough.</p>`,
why:`<p>Chaining <code>map/filter</code> on arrays allocates intermediate arrays and can't handle infinite sources. Iterator helpers add the same vocabulary to iterators, lazily.</p>`,
tech:`<ul class="pts"><li>ES2025 adds to <code>Iterator.prototype</code>: <code>map, filter, take, drop, flatMap, reduce, toArray, forEach, some, every, find</code>, plus <code>Iterator.from()</code>. ES2026 adds <code>Iterator.concat</code>. Others (chunking, join) are proposals.</li><li>Intermediate helpers return a new iterator and do <b>no work</b> until consumed (pulled one item at a time).</li><li>Works on any iterator: generators, <code>array.values()</code>, <code>map.keys()</code>. Arrays themselves are not iterators; call <code>.values()</code> first.</li><li>Support: current Chrome, Firefox, Safari and Node 22+; feature-detect with <code>typeof Iterator</code>.</li></ul>`,
diagram:{html:flow([["source iterator","1, 2, 3, 4, 5, …"],["filter(odd)","pulled lazily","w"],["map(x → x*10)","pulled lazily","w"],["take(2)","stops the chain","g"],["toArray()","[10, 30]"]]),steps:["Nothing runs until <code>toArray()</code> (or another consumer) asks for items.","Each item flows through the whole chain before the next is requested.","<code>take(2)</code> stops pulling after two results, so the infinite source is never fully consumed."]},
ex:[{t:"Lazy chain over an infinite generator",code:`function* naturals(){ let n = 1; while (true) yield n++; }
if (typeof Iterator === "undefined") {
  console.log("Iterator helpers are not available in this browser");
} else {
  const r = naturals().filter((n) => n % 2).map((n) => n * 10).take(3).toArray();
  console.log(r);
  console.log([5, 6, 7].values().drop(1).toArray());
}`}],
gotchas:[`Arrays do not have <code>take</code>/<code>drop</code>; use <code>arr.values().take(n)</code>.`,`Helpers consume the source iterator; reusing it afterwards continues from where it stopped.`,`Because evaluation is lazy, side effects inside <code>map</code> happen in interleaved order, not stage by stage.`,`Feature-detect or polyfill for older Safari/Node versions.`],
best:[`Use lazy helpers for big or infinite data; keep array methods for small arrays where clarity wins.`],
iq:[["mid","Array.map vs iterator.map?","Array.map is eager and allocates a new array; iterator.map is lazy, yields on demand and can work with infinite sources."],["senior","Why do some helpers return iterators and others values?","Transforming helpers (map, filter, take, drop, flatMap) return iterators to stay lazy; consuming helpers (reduce, toArray, some, every, find, forEach) pull values and produce a result."]],
practice:[`Take the first 5 primes from an infinite generator using only helpers.`],
teach:`<p>"Array methods build a full new list at each step. Iterator helpers pull items one at a time through the chain, so they stop early and can even handle never-ending lists."</p>`}
],quiz:[
{code:`const it = [1, 2, 3][Symbol.iterator]();
it.next();
console.log([...it]);`,ans:`[2, 3]`,why:`The iterator already advanced past 1; spreading it consumes the rest.`},
{code:`function* g(){ const x = yield 1; console.log('got', x); yield x * 2; }
const i = g();
console.log(i.next('ignored').value, i.next(5).value, i.next().done);`,ans:`got 5, then: 1 10 true`,why:`The arguments are evaluated left to right: the second next(5) resumes the generator and logs "got 5" before console.log prints its line. The first next argument is ignored, the third next finishes the generator.`}]},

{n:10,title:"Destructuring, Proxy and immutability",goal:"Write concise modern JavaScript, intercept operations with Proxy, and manage mutation safely.",topics:[
{id:"d10-destructuring",title:"Destructuring, spread and rest",
eli5:`<p><b>Destructuring</b> is unpacking a lunchbox: instead of reaching in each time, you say "give me the sandwich and the apple" and both come out into your hands with names. <b>Spread</b> is pouring everything out of one box into another. <b>Rest</b> is "and put whatever is left in this bag".</p>`,
why:`<p>Pulling values out of arrays and objects, passing options and merging data are daily tasks. Destructuring and spread make them short and readable.</p>`,
tech:`<ul class="pts"><li><b>Array destructuring</b> uses the iterator protocol: <code>const [a, , b = 5, ...rest] = arr</code>.</li><li><b>Object destructuring</b> matches by key: <code>const { x, y: renamed, z = 1, ...others } = obj</code>, nested: <code>{ a: { b } }</code>.</li><li><b>Defaults</b> apply only when the value is <code>undefined</code> (not <code>null</code>, 0 or "") and are evaluated lazily.</li><li><b>Spread</b> in arrays works on any iterable; in object literals it copies own enumerable properties (later keys win). It is shallow.</li><li><b>Rest</b> in parameters creates a real array; object rest copies remaining own enumerable properties.</li><li>Swap without a temp: <code>[a, b] = [b, a]</code>.</li></ul>`,
diagram:{html:flow([["{ id: 7, name: 'Ana', tags: [1,2] }"],["const { id, name: n, role = 'user', ...rest }","unpack","w"],["id=7, n='Ana', role='user'","rest = { tags: [1,2] }","g"]]),steps:["Keys are matched by name; <code>name: n</code> renames while extracting.","<code>role</code> is missing (undefined), so its default applies.","<code>rest</code> collects every remaining own enumerable property."]},
ex:[{t:"Defaults, renames, nesting, swap",code:`const { a = 1, b = 2 } = { a: undefined, b: null };
console.log(a, b);
const { user: { name, langs: [first] }, ...others } = { user: { name: "Ana", langs: ["js", "py"] }, id: 9 };
console.log(name, first, others);
let x = 1, y = 2; [x, y] = [y, x];
console.log(x, y);
const merged = { ...{ p: 1, q: 1 }, ...{ q: 2 } };
console.log(merged, [..."hi"], Math.max(...[1, 5, 3]));
function f({ n = 1, m = 2 } = {}){ return n + m; }
console.log(f(), f({ n: 10 }));`}],
gotchas:[`Destructuring <code>null</code> or <code>undefined</code> throws a TypeError; give a default (<code>= {}</code>).`,`Defaults ignore <code>null</code>.`,`A statement starting with <code>{ a } = obj</code> is parsed as a block; wrap in parentheses: <code>({ a } = obj)</code>.`,`Spread is shallow; nested objects stay shared.`,`Spreading a huge array into function arguments can exceed the argument limit (stack error).`],
best:[`Destructure in parameters for option objects, with a default object.`,`Don't over-nest destructuring; it hurts readability.`],
iq:[["fresher","How do you swap two variables?","<code>[a, b] = [b, a]</code>"],["mid","Spread vs rest?","Same ... syntax: spread expands an iterable/object into elements; rest gathers remaining items into an array/object in a parameter list or destructuring pattern."],["mid","When do defaults apply?","Only when the value is undefined, not for null or other falsy values."]],
practice:[`Write <code>pick(obj, ...keys)</code> using destructuring-friendly code.`,`Parse <code>"a=1&b=2"</code> into an object with <code>Object.fromEntries</code>.`],
teach:`<p>"Destructuring unpacks a box into named variables in one line. Spread pours a box out, rest collects the leftovers. Defaults only fill in for 'undefined'."</p>`},

{id:"d10-symbol",title:"Symbols, Proxy and Reflect",
eli5:`<p>A <b>Symbol</b> is a secret name tag nobody else can copy: even two tags that say the same thing are different tags. A <b>Proxy</b> is a <b>receptionist</b> standing in front of a boss: every request goes through them, and they can check it, log it, change it or say no. <b>Reflect</b> is the receptionist's rulebook for "do what would normally happen".</p>`,
why:`<p>Symbols give collision-free property keys and hooks into the language (well-known symbols). Proxy lets frameworks (Vue 3 reactivity, validation layers, ORMs) observe and customize object operations.</p>`,
tech:`<ul class="pts"><li><b>Symbol():</b> unique, never equal to another; not shown by <code>Object.keys</code> or JSON. <code>Symbol.for(key)</code> uses a global registry.</li><li><b>Well-known symbols</b> customize language behavior: <code>Symbol.iterator</code>, <code>asyncIterator</code>, <code>toPrimitive</code>, <code>hasInstance</code>, <code>toStringTag</code>, <code>species</code>.</li><li><b>Proxy:</b> <code>new Proxy(target, handler)</code>. Traps: <code>get, set, has, deleteProperty, ownKeys, getOwnPropertyDescriptor, defineProperty, apply, construct, getPrototypeOf</code>...</li><li><b>Reflect</b> mirrors each trap with the default behavior: use <code>Reflect.get/set(target, key, value, receiver)</code> inside traps to keep correct semantics (including getters and inheritance).</li><li><b>Invariants:</b> a trap may not lie about non-configurable or non-writable properties (it throws a TypeError).</li><li>Private <code>#fields</code> and some built-ins' internal slots (Map, Date) don't work through a Proxy as <code>this</code>.</li></ul>`,
diagram:{html:flow([["code: proxy.age = -5"],["set trap","handler.set(target, 'age', -5, receiver)","w"],["validate","throw RangeError / allow","r"],["Reflect.set(target, …)","default write","g"]]),steps:["Every operation on the proxy is routed to the matching trap.","The trap can validate, log, transform or reject.","If allowed, it forwards to the target with <code>Reflect</code> to keep default semantics and return the correct boolean."]},
ex:[{t:"Validation, default values and negative indices",code:`const guarded = new Proxy({}, {
  set(t, k, v, r){
    if (k === "age" && (!Number.isInteger(v) || v < 0)) throw new RangeError("bad age");
    return Reflect.set(t, k, v, r);
  }
});
guarded.age = 30;
try { guarded.age = -5; } catch (e) { console.log(e.name, guarded.age); }
const at = (arr) => new Proxy(arr, { get: (t, k, r) => (typeof k === "string" && /^-\\d+$/.test(k)) ? t[t.length + +k] : Reflect.get(t, k, r) });
console.log(at([10, 20, 30])[-1]);`},
{t:"A tiny reactive store",code:`function reactive(obj, onChange){
  return new Proxy(obj, {
    set(t, k, v, r){ const old = t[k]; const ok = Reflect.set(t, k, v, r); if (old !== v) onChange(k, old, v); return ok; }
  });
}
const s = reactive({ n: 0 }, (k, o, n) => console.log(k + ": " + o + " -> " + n));
s.n = 1; s.n = 1; s.n = 2;
const id1 = Symbol("id"), id2 = Symbol("id");
console.log(id1 === id2, Symbol.for("x") === Symbol.for("x"), id1.description);`}],
gotchas:[`Forgetting to return <code>true</code> from a <code>set</code> trap throws in strict mode.`,`Not passing <code>receiver</code> to <code>Reflect.get/set</code> breaks getters and inheritance.`,`Proxies are slower than plain objects; avoid them in hot loops.`,`<code>proxy === target</code> is false; identity comparisons and WeakMap keys differ.`,`Symbols are skipped by <code>JSON.stringify</code> and <code>Object.keys</code>; use <code>Object.getOwnPropertySymbols</code>.`],
best:[`Use Proxy for framework-level concerns (reactivity, validation); don't sprinkle it through business code.`,`Always delegate to <code>Reflect</code> for operations you don't customize.`],
iq:[["mid","What is a Symbol used for?","Unique property keys (no collisions, hidden from normal enumeration) and well-known protocols like Symbol.iterator."],["senior","How does Vue 3's reactivity work?","It wraps state in Proxies: get traps record which effects read a property (track), set traps notify those effects (trigger)."],["senior","What are Proxy invariants?","Rules the engine enforces so traps can't contradict reality, e.g. a get trap must return the actual value for a non-writable, non-configurable data property."]],
practice:[`Build a Proxy that logs every property read and write, then make it deep (wrap nested objects lazily).`],
teach:`<p>"A Symbol is a name tag that's always unique. A Proxy is a receptionist in front of an object who can check or change every request. Reflect is how the receptionist does the normal thing."</p>`},

{id:"d10-immutable",title:"Immutability, structuredClone and using",
eli5:`<p><b>Freezing</b> an object is like putting the toys in a glass case: you can look but not touch. But if one toy is a toy box, the box inside is <i>not</i> in the case (shallow). <b>Cloning</b> makes a complete second copy. <b>using</b> is a babysitter promise: "when this scope ends, clean up automatically".</p>`,
why:`<p>Shared mutable data is the root of many bugs, especially in UI state. Knowing exactly what freeze, copy and clone do (and don't do) prevents them. Explicit resource management adds safe cleanup for files, locks and connections.</p>`,
tech:`<ul class="pts"><li><code>Object.freeze</code> (no add/remove/change), <code>seal</code> (no add/remove), <code>preventExtensions</code>. All are <b>shallow</b>. In sloppy mode violations are silent; in strict mode (modules, classes) they throw TypeError.</li><li><b>Immutable updates:</b> create new objects/arrays with spread, <code>map/filter</code>, <code>toSorted</code>, <code>with</code>, <code>toSpliced</code>.</li><li><code>structuredClone(v)</code>: deep copy using the structured clone algorithm. Handles cycles, Date, RegExp, Map, Set, typed arrays, Blob. <b>Throws</b> for functions and DOM nodes; <b>drops</b> the prototype (class instances become plain objects), getters are read as values, property descriptors are lost.</li><li><b>Explicit Resource Management</b> (Stage 4, expected ES2027): <code>using res = getResource();</code> calls <code>res[Symbol.dispose]()</code> when the block ends (even on throw); <code>await using</code> for async disposal; <code>DisposableStack</code> groups cleanups. Shipped in Chromium (134+); Firefox and Safari are still rolling it out (feature-detect <code>Symbol.dispose</code>).</li></ul>`,
diagram:{html:lanes([["Object.freeze(obj)",["obj.a = 1  → blocked","obj.b.c = 1  → allowed (b is not frozen)"]],["structuredClone(obj)",["new independent copy","nested objects copied","functions/DOM → DataCloneError"]],["using x = open()",["block runs","x[Symbol.dispose]() runs at the end"]]]),steps:["Freeze protects one level only; use a recursive helper if you need depth.","Clone when you need to change data without affecting the original.","<code>using</code> guarantees cleanup order (reverse of declaration) even if an exception occurs."]},
ex:[{t:"Freeze is shallow",code:`const o = Object.freeze({ n: 1, inner: { m: 1 } });
o.n = 2; o.inner.m = 2;
console.log(o.n, o.inner.m, Object.isFrozen(o), Object.isFrozen(o.inner));
(function(){ 'use strict'; try { o.n = 3; } catch (e) { console.log(e.name); } })();
const deepFreeze = (x) => (Object.values(x).forEach((v) => typeof v === "object" && v && deepFreeze(v)), Object.freeze(x));
const d = deepFreeze({ a: { b: 1 } }); d.a.b = 9;
console.log(d.a.b);`},
{t:"structuredClone limits",code:`class P { constructor(){ this.x = 1; } get y(){ return 2; } }
const src = { when: new Date(0), set: new Set([1]), p: new P(), self: null };
src.self = src;
const c = structuredClone(src);
console.log(c.when instanceof Date, c.set.has(1), c.p instanceof P, c.self === c);
try { structuredClone({ f(){} }); } catch (e) { console.log(e.name); }`},
{t:"using (feature-detect, shown as text)",code:`// Needs a runtime with explicit resource management (e.g. recent Chromium, Node 24+)
function open(name){
  console.log("open", name);
  return { name, [Symbol.dispose]() { console.log("close", name); } };
}
{
  using a = open("A");
  using b = open("B");
  console.log("working");
}   // prints: close B, then close A`,run:false,note:"Run this in a recent Chrome or Node. If your runtime lacks support, the <code>using</code> keyword is a syntax error, so it cannot be feature-detected inside the same file: check <code>typeof Symbol.dispose</code> and load the code separately or transpile."}],
gotchas:[`<code>Object.freeze</code> does nothing to nested objects, and silently fails in sloppy mode.`,`<code>const</code> + freeze are different: const protects the binding, freeze protects the object.`,`<code>JSON.parse(JSON.stringify(x))</code> is a poor deep clone (loses Dates, undefined, Maps, throws on cycles).`,`<code>structuredClone</code> of a class instance gives a plain object without methods or private fields.`,`Frozen objects can still be replaced wholesale; immutability is a convention across your code.`],
best:[`Treat shared state as immutable; produce new objects on update.`,`Freeze configuration constants (shallow or deep) in development to catch accidental writes.`,`Use <code>structuredClone</code> for plain data; write custom clone logic for class instances.`],
iq:[["fresher","How do you make an object immutable?","Object.freeze (shallow). For nested data, freeze recursively or use immutable update patterns."],["mid","Difference between const and Object.freeze?","const prevents reassigning the variable; freeze prevents changing the object's own properties."],["senior","structuredClone vs JSON clone vs spread?","Spread is shallow; JSON clone is deep for plain JSON data but loses types and fails on cycles; structuredClone is deep, handles more types and cycles but not functions or prototypes."],["senior","What problem does 'using' solve?","Deterministic cleanup of resources in scope, replacing try/finally boilerplate, with correct reverse-order disposal and error handling."]],
practice:[`Write <code>deepFreeze</code> and test it in strict and sloppy mode.`,`Update an item in a nested array in state without mutation.`],
teach:`<p>"Freeze locks one level only. Spread copies one level. structuredClone copies the whole tree but not functions. using is a promise to clean up when the block ends."</p>`}
],quiz:[
{code:`const { a = 1, b = 2 } = { a: undefined, b: null };
console.log(a, b);`,ans:`1 null`,why:`Defaults apply only to undefined, not null.`},
{code:`const o = Object.freeze({ n: 1, inner: { m: 1 } });
o.n = 2; o.inner.m = 2;
console.log(o.n, o.inner.m);`,ans:`1 2`,why:`freeze is shallow and (in sloppy mode) failed writes are silent. The nested object is not frozen.`}]}
]});
