/* Week 9: Gap-filler I — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js. */
JSC.registerWeek({w:9,revision:[
"<b>OOP pillars:</b> encapsulation (private <code>#fields</code>, closures), abstraction (hide detail behind a stable interface; <code>new.target</code> for abstract classes), inheritance (<code>extends</code>), polymorphism (same call, different behavior). Prefer composition and mixins over deep hierarchies.",
"<b>SOLID in JS:</b> SRP (one reason to change), OCP (extend by adding, e.g. strategy maps), LSP (subclasses must honor the parent's contract: Square/Rectangle), ISP (small interfaces via duck typing), DIP (inject clock, logger, repo).",
"<b>Functional programming:</b> pure functions, immutable updates, higher-order functions, composition, currying, and <code>Maybe</code>/<code>Result</code> to make absence and errors explicit.",
"<b>Recursion:</b> base case + smaller subproblem; V8 has no tail-call optimization, so deep recursion needs iteration, an explicit stack or a trampoline; memoize overlapping subproblems.",
"<b>Heap</b> = priority queue (O(log n) push/pop): top-k, k-way merge, running median. <b>Trie</b> = prefix tree for autocomplete.",
"<b>Graphs:</b> BFS for shortest path in unweighted graphs, DFS for exploration/cycles, topological sort for dependencies, union-find for connectivity, Dijkstra (heap) for weighted shortest paths.",
"<b>Binary:</b> typed arrays are views on an ArrayBuffer; <code>DataView</code> controls endianness; Uint8Array wraps modulo 256; <code>Math.fround</code> shows float32 loss; use <code>TextEncoder</code> for UTF-8 and base64.",
"<b>Intl:</b> never hand-format numbers, dates, plurals or lists; use <code>Intl.NumberFormat</code>, <code>DateTimeFormat</code>, <code>PluralRules</code>, <code>ListFormat</code>, <code>Collator</code>, <code>Segmenter</code>.",
"<b>Debugging tools:</b> conditional breakpoints, logpoints, exception pausing, async stack traces, source maps, <code>console.table/group/time/assert</code>, Network and Performance panels, <code>node --inspect</code>.",
"<b>Debugging method:</b> reproduce → minimize → hypothesize → bisect (binary search over history or input) → fix → add a regression test."
],days:[
{n:41,title:"Object-oriented programming",goal:"Explain and apply OOP in JavaScript, including its trade-offs, SOLID and class-design interview exercises.",topics:[
{id:"d41-oop-pillars",title:"OOP in JavaScript: the four pillars, composition and mixins",lv:["fresher","mid","senior"],
eli5:`<p>Think of a <b>TV remote</b>. You press "volume up" without knowing the circuits inside (<b>abstraction</b> and <b>encapsulation</b>: the inside is hidden and protected). A "smart remote" is built from the basic remote and adds buttons (<b>inheritance</b>). Press "play" on a DVD player or a streaming stick and each does its own thing (<b>polymorphism</b>: same button, different behavior). And sometimes, instead of building a bigger remote, you just <b>snap together</b> small gadgets (<b>composition</b>).</p>`,
why:`<p>Object-oriented programming organizes code around objects that own their data and behavior. It models real things, hides complexity and lets teams change internals safely. Interviews ask about it constantly, and JavaScript's version (prototypes, closures, classes) differs from Java's, so you must explain it in JavaScript terms.</p>`,
tech:`<table><tr><th>Pillar</th><th>Meaning</th><th>In JavaScript</th></tr><tr><td>Encapsulation</td><td>bundle data with behavior and control access</td><td>private <code>#fields</code>, closures, modules, getters/setters</td></tr><tr><td>Abstraction</td><td>expose a simple interface, hide the details</td><td>public methods, abstract base classes (<code>new.target</code> check), documented contracts</td></tr><tr><td>Inheritance</td><td>reuse and specialize behavior</td><td><code>class B extends A</code> / prototype chain; <code>super</code></td></tr><tr><td>Polymorphism</td><td>one interface, many implementations</td><td>method overriding; duck typing (any object with the right methods works)</td></tr></table>
<ul class="pts"><li><b>JavaScript has no interfaces or true abstract classes;</b> you use duck typing and conventions, and can simulate abstract classes by throwing in the constructor when <code>new.target === Base</code> and in unimplemented methods.</li><li><b>Composition over inheritance:</b> build objects from small behaviors (<code>canFly</code>, <code>canSwim</code>) instead of deep hierarchies. <b>Mixins</b> (<code>const M = Base =&gt; class extends Base {}</code>) add behavior to a class chain; they can collide on method names.</li><li><b>Three ways to create objects:</b> <b>class</b> (methods shared on the prototype, <code>instanceof</code> works, <code>#private</code>), <b>factory function</b> (closures give true privacy, but each instance gets its own method copies, no <code>instanceof</code>), <b>prototype/Object.create</b> (delegation, flexible, less familiar).</li><li><b>Prefer</b> shallow hierarchies (≤ 2 levels), small classes, immutable value objects, and "tell, don't ask".</li></ul>`,
diagram:{html:flow([["Shape (abstract)","area() — contract"],["Circle","#radius, area()","w"],["Rect","w, h, area()","w"]])+flow([["shapes.map(s => s.area())","one call, many behaviors","g"]]),steps:["The base class defines the contract (<code>area()</code>) and cannot be instantiated directly.","Each subclass encapsulates its own data and implements the contract differently.","Calling code depends only on the contract, so new shapes can be added without changing it (polymorphism)."]},
ex:[{t:"Encapsulation, abstraction, inheritance and polymorphism (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
class Shape {
  constructor(){ if (new.target === Shape) throw new TypeError("Shape is abstract"); }
  area(){ throw new Error("not implemented"); }
  describe(){ return this.constructor.name + " area=" + this.area().toFixed(2); }
}
class Circle extends Shape {
  #r;
  constructor(r){ super(); this.#r = r; }
  area(){ return Math.PI * this.#r ** 2; }
  get radius(){ return this.#r; }
}
class Rect extends Shape { constructor(w, h){ super(); this.w = w; this.h = h; } area(){ return this.w * this.h; } }
class Bad extends Shape {}
let blocked = false; try { new Shape(); } catch (e) { blocked = e instanceof TypeError; }
check("abstract class cannot be instantiated", blocked);
check("polymorphism: same call, different behavior", [new Circle(1), new Rect(2, 3)].map((s) => s.describe()).join() === "Circle area=3.14,Rect area=6.00");
const c = new Circle(2);
check("encapsulation: the private field is not reachable", c.r === undefined && Object.keys(c).length === 0 && c.radius === 2);
let msg = ""; try { new Bad().area(); } catch (e) { msg = e.message; }
check("a subclass must implement the abstract method", msg === "not implemented");
check("inheritance: instanceof chain", c instanceof Circle && c instanceof Shape && !(c instanceof Rect));`},
{t:"Composition, mixins and the three ways to build objects (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const canFly = (s) => ({ fly: () => s.name + " flies" });
const canSwim = (s) => ({ swim: () => s.name + " swims" });
const makeDuck = (name) => { const s = { name }; return Object.assign(s, canFly(s), canSwim(s)); };
const Serializable = (Base) => class extends Base { serialize(){ return JSON.stringify(this); } };
const Eq = (Base) => class extends Base { equals(o){ return this.serialize() === o.serialize(); } };
class Point { constructor(x, y){ this.x = x; this.y = y; } }
class SmartPoint extends Eq(Serializable(Point)) {}
const d = makeDuck("Donald");
check("composition: build behavior from small parts", d.fly() === "Donald flies" && d.swim() === "Donald swims");
const p = new SmartPoint(1, 2);
check("mixins add methods to a class chain", p.serialize() === '{"x":1,"y":2}' && p.equals(new SmartPoint(1, 2)) && !p.equals(new SmartPoint(2, 1)));
check("mixed classes still satisfy instanceof for the base", p instanceof Point);
const makeCounter = () => { let n = 0; return { inc: () => ++n }; };       // factory: true privacy, per-instance methods
class Counter { #n = 0; inc(){ return ++this.#n; } }                       // class: shared prototype methods
const f1 = makeCounter(), f2 = makeCounter(), k1 = new Counter(), k2 = new Counter();
check("factory: each instance owns its own method copies", f1.inc !== f2.inc);
check("class: methods are shared on the prototype (cheaper)", k1.inc === k2.inc && Object.getPrototypeOf(k1) === Counter.prototype);
check("factory objects cannot be recognized with instanceof", !(f1 instanceof Object && f1.constructor !== Object));`}],
gotchas:[`Deep inheritance trees become brittle (the "fragile base class" problem): a parent change breaks many children.`,`Overridden methods can be called from a parent constructor before the child's fields exist.`,`Mixins with the same method names silently override each other; order matters.`,`<code>instanceof</code> isn't a safe way to check capabilities; prefer duck typing or brand checks (<code>#x in obj</code>).`,`JavaScript's "private" convention <code>_name</code> is not private; use <code>#name</code> or closures.`,`Getters/setters that do heavy work or have side effects surprise callers.`],
best:[`Prefer composition and small focused objects; keep inheritance to true is-a relationships.`,`Program to an interface (the methods you need), not to a concrete class.`,`Make value objects immutable (<code>Object.freeze</code> or no setters) and validate in the constructor.`],
iq:[["fresher","Explain the four pillars of OOP with JavaScript examples.","Encapsulation: private #fields/closures. Abstraction: expose a simple interface and hide details (abstract base classes). Inheritance: extends/prototype chain. Polymorphism: overridden methods or duck typing so one call works on many types."],["mid","How is inheritance in JavaScript different from Java?","It is prototype-based delegation, not class copying. class is syntax over prototypes; there are no interfaces or true abstract classes, and any object can be the prototype of another."],["senior","Composition vs inheritance: when do you choose each?","Use inheritance for a stable is-a relationship with a shared contract; use composition (mixins, small behavior objects, dependency injection) to combine capabilities flexibly and avoid fragile hierarchies."],["senior","How do you implement an abstract class in JavaScript?","Throw in the constructor when new.target equals the base class and throw 'not implemented' in abstract methods; document the contract. TypeScript adds compile-time abstract classes, plain JS does not."]],
practice:[`Model a <code>PaymentMethod</code> abstraction with <code>Card</code>, <code>Wallet</code> and <code>Bank</code> implementations and a single <code>checkout(method)</code> function.`,`Rewrite a 3-level class hierarchy as composition and compare testability.`],
teach:`<p>"A remote hides the circuits (encapsulation, abstraction), a smart remote extends a basic one (inheritance), pressing play does different things on different devices (polymorphism). In JavaScript, prefer snapping small gadgets together over building tall family trees."</p>`},

{id:"d41-solid",title:"SOLID in JavaScript and class-design exercises",lv:["senior","lead","architect"],
eli5:`<p>SOLID is five <b>house rules for a tidy workshop</b>: each tool does one job (S), you can add new tools without rebuilding the shelf (O), a replacement tool works anywhere the old one did (L), nobody is forced to carry tools they don't use (I), and tools plug into standard sockets instead of being welded to the wall (D).</p>`,
why:`<p>SOLID is a vocabulary for explaining why code is easy or hard to change. Senior and lead interviews use it to probe design judgment, often through "design a parking lot / library / elevator" exercises.</p>`,
tech:`<table><tr><th>Principle</th><th>Idea</th><th>In JavaScript</th></tr><tr><td><b>S</b>ingle Responsibility</td><td>a module has one reason to change</td><td>separate calculation, formatting, I/O and persistence</td></tr><tr><td><b>O</b>pen/Closed</td><td>open for extension, closed for modification</td><td>strategy maps/registries, plugins, higher-order functions</td></tr><tr><td><b>L</b>iskov Substitution</td><td>subtypes must be usable wherever the base is expected</td><td>honor the parent's contract (Square vs Rectangle is the classic violation)</td></tr><tr><td><b>I</b>nterface Segregation</td><td>many small interfaces beat one fat one</td><td>duck typing: require only the methods you call</td></tr><tr><td><b>D</b>ependency Inversion</td><td>depend on abstractions; inject details</td><td>pass clock, logger, repository, fetch as parameters</td></tr></table>
<h5>How to run a class-design exercise</h5><ol><li>Clarify requirements and scope (entities, operations, constraints, scale).</li><li>List nouns (candidate classes) and verbs (methods); decide relationships (has-a, is-a).</li><li>Define the public API first; keep state private.</li><li>Inject dependencies (clock, ID generation, storage) so it's testable.</li><li>Handle errors and edge cases explicitly; write tests.</li><li>Discuss extensions (new vehicle types, pricing rules) and how the design absorbs them (OCP).</li></ol>
<p><b>Balance:</b> SOLID is guidance, not law. In small scripts, extra abstraction costs more than it saves; apply it where change is likely.</p>`,
diagram:{html:lanes([["S",["one reason to change","calc ≠ format ≠ I/O"]],["O",["add, don't edit","strategy map"]],["L",["subtype honors contract","Square ≠ Rectangle"]],["I",["small interfaces","duck typing"]],["D",["inject dependencies","clock, logger, repo"]]]),steps:["Each principle limits a different kind of coupling.","Together they make change cheap: new features add code instead of modifying working code.","Test seams (injected dependencies) are the practical payoff you can demonstrate in an interview."]},
ex:[{t:"SOLID demonstrations (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
// S: separate calculation from presentation
const total = (items) => items.reduce((s, i) => s + i.price * i.qty, 0);
const render = (t) => "Total: $" + t.toFixed(2);
check("SRP: logic and formatting are independently testable", total([{ price: 2.5, qty: 2 }, { price: 1, qty: 1 }]) === 6 && render(6) === "Total: $6.00");
// O: extend by adding entries, never editing price()
const discounts = { none: (p) => p, percent: (p, v) => p * (1 - v / 100), flat: (p, v) => Math.max(0, p - v) };
const price = (p, type, v) => discounts[type](p, v);
discounts.bogo = (p) => p / 2;
check("OCP: new rule added without touching price()", price(100, "percent", 10) === 90 && price(100, "flat", 30) === 70 && price(100, "bogo") === 50);
// L: the classic violation
class Rectangle { constructor(w, h){ this.w = w; this.h = h; } setWidth(w){ this.w = w; } setHeight(h){ this.h = h; } area(){ return this.w * this.h; } }
class Square extends Rectangle { setWidth(w){ this.w = this.h = w; } setHeight(h){ this.w = this.h = h; } }
const grow = (r) => { r.setWidth(5); r.setHeight(2); return r.area(); };
check("LSP violated: Square is not substitutable for Rectangle", grow(new Rectangle(1, 1)) === 10 && grow(new Square(1, 1)) === 4);
class Sq { constructor(s){ this.s = s; } area(){ return this.s ** 2; } }
class Rc { constructor(w, h){ this.w = w; this.h = h; } area(){ return this.w * this.h; } }
const area = (shape) => shape.area();
check("LSP respected with a shared interface instead of forced inheritance", area(new Sq(3)) === 9 && area(new Rc(2, 5)) === 10);
// I: depend only on what you use
const printer = { print: () => "printed" }, scanner = { scan: () => "scanned" };
const multi = { ...printer, ...scanner };
check("ISP: small interfaces compose", typeof printer.scan === "undefined" && multi.scan() === "scanned" && multi.print() === "printed");
// D: inject dependencies
class OrderService {
  constructor({ clock, logger, repo }){ Object.assign(this, { clock, logger, repo }); }
  place(item){ const o = { item, at: this.clock() }; this.repo.save(o); this.logger("placed " + item); return o; }
}
const saved = [], logs = [];
new OrderService({ clock: () => 42, logger: (m) => logs.push(m), repo: { save: (o) => saved.push(o) } }).place("book");
check("DIP: injected dependencies make the service testable", saved[0].at === 42 && logs[0] === "placed book");`},
{t:"Design exercise: a parking lot with an injected clock (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
class ParkingLot {
  #slots; #tickets = new Map(); #now; #rate;
  constructor(n, { now = () => Date.now(), ratePerHour = 10 } = {}){ this.#slots = Array(n).fill(null); this.#now = now; this.#rate = ratePerHour; }
  park(plate){
    if (this.#tickets.has(plate)) throw new Error("already parked");
    const i = this.#slots.indexOf(null);
    if (i < 0) throw new Error("full");
    this.#slots[i] = plate; this.#tickets.set(plate, { slot: i, at: this.#now() });
    return i;
  }
  leave(plate){
    const t = this.#tickets.get(plate);
    if (!t) throw new Error("unknown vehicle");
    this.#slots[t.slot] = null; this.#tickets.delete(plate);
    const hours = Math.max(1, Math.ceil((this.#now() - t.at) / 3600000));
    return hours * this.#rate;
  }
  get free(){ return this.#slots.filter((s) => s === null).length; }
}
const throws = (f) => { try { f(); return null; } catch (e) { return e.message; } };
let clock = 0;
const lot = new ParkingLot(2, { now: () => clock, ratePerHour: 10 });
check("assigns the nearest free slot", lot.park("A") === 0 && lot.park("B") === 1 && lot.free === 0);
check("rejects when full", throws(() => lot.park("C")) === "full");
check("rejects duplicates", throws(() => lot.park("A")) === "already parked");
clock = 90 * 60000;
check("fee rounds partial hours up (90 min = 2 h)", lot.leave("A") === 20);
check("a freed slot is reused", lot.park("C") === 0 && lot.free === 0);
check("minimum charge is one hour", lot.leave("C") === 10);
check("unknown vehicle is rejected", throws(() => lot.leave("Z")) === "unknown vehicle");`}],
gotchas:[`Over-applying SOLID creates abstraction layers nobody needs; apply it where change is likely.`,`Inheritance used for code reuse (not for is-a) is the usual LSP violation.`,`"Dependency injection" does not require a framework: constructor parameters or function arguments are enough in JavaScript.`,`Singletons and global state silently break DIP and make tests order-dependent.`,`A class with "And" or "Manager" in its name usually violates SRP.`],
best:[`Inject time, randomness, IDs and I/O; keep pure logic separate from side effects.`,`State requirements and extension points before drawing classes in a design exercise.`,`Show how a new requirement (new vehicle type, new pricing) would be added without editing existing code.`],
iq:[["senior","Explain the Liskov Substitution Principle with an example.","Anything that works with a Rectangle should work with its subtype. A Square that couples width and height breaks code that sets them independently, so the hierarchy is wrong; model both behind a common area() interface instead."],["senior","How do you apply the Open/Closed Principle in JavaScript?","Use registries or strategy maps, higher-order functions and plugin hooks so new behavior is added as new entries or modules, not by editing a growing switch/if chain."],["architect","Design a parking lot system.","Entities: lot, slot, vehicle, ticket, pricing; API: park/leave/availability; inject clock and pricing strategy; handle full lot, duplicates, lost ticket; extend with vehicle sizes and multiple levels; add concurrency control and persistence for production."],["architect","Design a library management system.","Books and copies, members, loans, reservations, fines; state machine for copy availability; policies as strategies (loan period, fine rules); inject clock and repository; consider search, notifications and concurrency on reservations."]],
practice:[`Add vehicle sizes and a pricing strategy (hourly vs flat) to the ParkingLot without editing existing methods.`,`Design an elevator controller with a clear public API and injected scheduler.`],
teach:`<p>"SOLID: one job per module, add instead of edit, substitutes must behave like the original, small interfaces, and inject dependencies. In JavaScript that's mostly plain functions, maps of strategies and constructor parameters."</p>`}
],quiz:[
{code:`class A { #x = 1; static has(o){ return #x in o; } }
console.log(A.has(new A()), A.has({}), Object.getPrototypeOf(class B extends A {}) === A);`,ans:`true false true`,why:`#x in o is a brand check for the private field. A class that extends A has A as its own prototype (the constructor chain used for statics and super).`},
{code:`class Animal { speak(){ return 'generic'; } intro(){ return 'I say ' + this.speak(); } }
class Dog extends Animal { speak(){ return 'woof'; } }
console.log(new Dog().intro(), '|', new Animal().intro());`,ans:`I say woof | I say generic`,why:`Polymorphism: intro() is inherited, but this.speak() dispatches on the actual object's class, so the Dog override runs.`}]},

{n:42,title:"Functional programming and recursion",goal:"Use functional techniques fluently and understand recursion, its limits in V8, and how to avoid stack overflows.",topics:[
{id:"d42-fp",title:"Functional programming in JavaScript",lv:["mid","senior"],
eli5:`<p>Functional programming is cooking with <b>recipes that always give the same dish from the same ingredients</b> and never mess up your kitchen. You don't change the flour bag (immutability); you pour a new bowl. Small steps get chained like an assembly line (composition). And instead of "might be there, might not", you use clearly labeled boxes: <b>"maybe a value"</b> and <b>"worked or failed"</b>.</p>`,
why:`<p>Pure, immutable, composable code is easier to test, reason about and parallelize, and it is the model behind modern UI state (reducers, signals) and data pipelines. JavaScript supports it well because functions are first-class.</p>`,
tech:`<ul class="pts"><li><b>Pure function:</b> same input → same output, no side effects (no mutation, I/O, randomness, time). Easy to test and memoize.</li><li><b>Immutability:</b> create new values (<code>{...o, x: 1}</code>, <code>toSorted</code>, <code>with</code>) instead of mutating; freeze in development.</li><li><b>Higher-order functions:</b> take or return functions (<code>map/filter/reduce</code>, <code>debounce</code>, <code>once</code>).</li><li><b>Composition:</b> <code>pipe(f, g, h)(x)</code> builds pipelines; <b>currying/partial application</b> adapts functions to fit (data-last style).</li><li><b>Declarative style:</b> describe <i>what</i>, not <i>how</i> (<code>users.filter(active).map(name)</code> instead of loops with mutation).</li><li><b>Maybe/Option:</b> a wrapper that represents a possibly missing value and skips <code>map</code> steps when empty (alternative to scattered null checks). <b>Result/Either:</b> a value that is either success or error, so failures flow through a pipeline without exceptions.</li><li><b>Limits:</b> JavaScript has no tail-call optimization (V8), persistent data structures are libraries (Immer, Immutable.js), and over-abstracting hurts readability; mix styles pragmatically.</li></ul>`,
diagram:{html:flow([["input"],["parse","pure"],["validate","pure","w"],["transform","pure","w"],["format","pure","g"],["output"]]),steps:["Each stage is a pure function from one value to the next.","Because stages have no hidden state, you can test each alone and reorder or reuse them.","Side effects (reading input, writing output) live at the edges."]},
ex:[{t:"Purity, immutability, composition, Maybe and Result (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
// pure vs impure
let counter = 0;
const impure = () => ++counter;
const pure = (n) => n + 1;
check("a pure function is repeatable, an impure one is not", pure(1) === pure(1) && impure() !== impure());
// immutability
const state = Object.freeze({ user: { name: "Ana" }, items: [1, 2] });
const next = { ...state, items: [...state.items, 3] };
check("update by creating new values, original untouched", state.items.length === 2 && next.items.length === 3 && next.user === state.user);
// composition and currying
const pipe = (...f) => (x) => f.reduce((v, fn) => fn(v), x);
const map = (f) => (xs) => xs.map(f), filter = (p) => (xs) => xs.filter(p);
const sumSquaresOfEvens = pipe(filter((n) => n % 2 === 0), map((n) => n * n), (xs) => xs.reduce((a, b) => a + b, 0));
check("pipeline of small pure steps", sumSquaresOfEvens([1, 2, 3, 4]) === 20);
const add = (a) => (b) => a + b;
check("currying and partial application", [1, 2, 3].map(add(10)).join() === "11,12,13");
// Maybe: skip steps when the value is missing
const Maybe = (v) => ({ map: (f) => (v == null ? Maybe(null) : Maybe(f(v))), getOrElse: (d) => (v == null ? d : v) });
check("Maybe follows a present path", Maybe({ a: { b: 5 } }).map((o) => o.a).map((a) => a.b).getOrElse(0) === 5);
check("Maybe short-circuits a missing path without null checks", Maybe({ a: null }).map((o) => o.a).map((a) => a.b).getOrElse(0) === 0);
// Result: errors as values
const Ok = (v) => ({ ok: true, map: (f) => Ok(f(v)), chain: (f) => f(v), unwrap: () => v });
const Err = (e) => ({ ok: false, map: () => Err(e), chain: () => Err(e), unwrap: () => { throw e; } });
const tryCatch = (f) => { try { return Ok(f()); } catch (e) { return Err(e); } };
check("Result success path", tryCatch(() => JSON.parse('{"x":1}')).map((o) => o.x).unwrap() === 1);
const bad = tryCatch(() => JSON.parse("{")).map((o) => o.x);
check("Result failure path skips later steps", bad.ok === false);
const deepFreeze = (o) => (Object.values(o).forEach((v) => typeof v === "object" && v && deepFreeze(v)), Object.freeze(o));
check("deepFreeze protects nested data", Object.isFrozen(deepFreeze({ a: { b: [1] } }).a.b));`}],
gotchas:[`<code>Object.freeze</code> is shallow; frozen state with nested mutation still leaks changes.`,`Chaining <code>map/filter</code> on huge arrays creates intermediate arrays; use iterator helpers or a loop for hot paths.`,`"Pure" functions that read <code>Date.now()</code> or <code>Math.random()</code> are not pure; inject them.`,`Over-using point-free style and tiny helpers makes code unreadable.`,`<code>reduce</code> with spread accumulators is O(n²) (Day 31).`,`Mutating function arguments (<code>arr.sort()</code>, <code>obj.x = 1</code>) is a hidden side effect.`],
best:[`Make functions pure by default; push side effects to the edges (I/O, rendering).`,`Use <code>toSorted</code>, <code>toSpliced</code>, <code>with</code>, spread and <code>structuredClone</code> to avoid mutation.`,`Prefer readable pipelines; name intermediate steps when they carry meaning.`],
iq:[["mid","What is a pure function and why does it matter?","A function whose output depends only on its inputs and which causes no side effects. It is deterministic, easy to test, cacheable and safe to run in parallel."],["senior","Explain currying and composition.","Currying turns f(a, b) into f(a)(b) so you can partially apply; composition chains functions so the output of one feeds the next (pipe/compose). Together they build reusable pipelines."],["senior","What is the Maybe/Option pattern?","A wrapper for a value that may be missing; map applies a function only if the value exists, so null checks are centralized instead of repeated."],["architect","How do functional ideas show up in frontend architecture?","Reducers (pure state transitions), immutable state for cheap change detection, derived/selectors as pure functions, unidirectional data flow, and signals/computed values."]],
practice:[`Write <code>groupBy</code>, <code>pick</code> and <code>zip</code> using only <code>reduce</code> and no mutation of inputs.`,`Rewrite an imperative loop with mutation into a <code>pipe</code> of pure steps.`],
teach:`<p>"Same inputs, same output, no hidden changes. Build new values instead of editing old ones, chain small pure steps, and represent 'might be missing' and 'might fail' as values so pipelines don't need null checks and try/catch everywhere."</p>`},

{id:"d42-recursion",title:"Recursion, stack depth and trampolines",lv:["fresher","mid","senior"],
eli5:`<p>Recursion is <b>Russian nesting dolls</b>: to open the biggest doll you open the next smaller one, and keep going until you reach the tiny solid doll (the <b>base case</b>), then close them back up. Each open doll is waiting on the call stack, and if you have a million dolls the table collapses (<b>stack overflow</b>).</p>`,
why:`<p>Recursion is the natural way to handle trees, nested data, backtracking and divide-and-conquer. Interviewers also probe its limits: stack depth, performance, and conversion to iteration.</p>`,
tech:`<ul class="pts"><li>A recursive function needs a <b>base case</b> and a step that makes the problem <b>smaller</b>. Each call adds a frame to the call stack.</li><li><b>Stack limit:</b> engines allow roughly ten thousand frames (varies by engine and frame size); exceeding it throws <code>RangeError: Maximum call stack size exceeded</code>.</li><li><b>Tail calls:</b> ES2015 specified proper tail-call optimization, but <b>V8 (Chrome, Node) and SpiderMonkey don't implement it</b>; only Safari's JavaScriptCore does. Don't rely on it.</li><li><b>Solutions for deep recursion:</b> convert to a loop; use an <b>explicit stack</b> (array) for tree/graph traversal; use a <b>trampoline</b> (return thunks instead of calling, loop until a value appears).</li><li><b>Overlapping subproblems</b> (naive Fibonacci) are exponential; <b>memoize</b> or use dynamic programming.</li><li><b>Tree recursion</b> (traversal, permutations, subsets, flatten, deep clone) is clearest recursively; mind recursion depth equals tree height.</li></ul>`,
diagram:{html:flow([["sum(3)"],["3 + sum(2)","waits","w"],["2 + sum(1)","waits","w"],["1 + sum(0)","waits","w"],["sum(0) = 0","base case","g"],["unwind: 1, 3, 6","g"]]),steps:["Each call waits for the next one, so frames pile up on the stack.","The base case returns without recursing.","Results flow back up as frames pop, combining values.","If the pile gets too tall, the engine throws RangeError."]},
ex:[{t:"Classic recursion, memoization, depth limits and trampolines (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
check("factorial", factorial(5) === 120 && factorial(0) === 1);
let calls = 0;
const fibNaive = (n) => { calls++; return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2); };
fibNaive(20); const naiveCalls = calls;
const memo = new Map(); let memoCalls = 0;
const fibMemo = (n) => { memoCalls++; if (n < 2) return n; if (memo.has(n)) return memo.get(n); const v = fibMemo(n - 1) + fibMemo(n - 2); memo.set(n, v); return v; };
fibMemo(20);
check("naive fib is exponential (" + naiveCalls + " calls), memoized is linear (" + memoCalls + ")", naiveCalls === 21891 && memoCalls === 39 && fibMemo(20) === 6765);
const flatten = (a) => a.reduce((acc, x) => (Array.isArray(x) ? acc.concat(flatten(x)) : acc.concat(x)), []);
check("recursive flatten", flatten([1, [2, [3, [4]]]]).join() === "1,2,3,4");
const permutations = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
check("permutations of 3 items", permutations([1, 2, 3]).length === 6 && permutations([1, 2, 3])[0].join() === "1,2,3");
const hanoi = (n) => (n === 0 ? 0 : 2 * hanoi(n - 1) + 1);
check("towers of Hanoi moves = 2^n - 1", hanoi(10) === 1023);
const sumTo = (n, acc = 0) => (n === 0 ? acc : sumTo(n - 1, acc + n));   // tail position, but V8 has no TCO
let overflow = ""; try { sumTo(1e6); } catch (e) { overflow = e.name; }
check("deep recursion overflows the stack in V8", overflow === "RangeError");
const trampoline = (f) => (...a) => { let r = f(...a); while (typeof r === "function") r = r(); return r; };
const sumT = trampoline(function s(n, acc = 0){ return n === 0 ? acc : () => s(n - 1, acc + n); });
check("a trampoline handles a million steps without growing the stack", sumT(1e6) === 500000500000);
let list = null; for (let i = 0; i < 100000; i++) list = { v: i, next: list };
const lengthIter = (node) => { const stack = [node]; let n = 0; while (stack.length) { const x = stack.pop(); if (x) { n++; stack.push(x.next); } } return n; };
check("explicit stack walks a 100,000-deep structure iteratively", lengthIter(list) === 100000);`}],
gotchas:[`Missing or unreachable base case causes infinite recursion and RangeError.`,`Tail-recursive code is not safe from stack overflow in V8; don't claim it is.`,`Recursion with array copies (<code>concat</code>, spread) in each frame makes quadratic work.`,`Memoization needs a stable cache key; objects/arrays as keys need a serializer.`,`Mutual recursion and recursion inside callbacks are harder to debug; log depth when needed.`,`JSON.stringify/deepClone on deeply nested or cyclic data can overflow the stack.`],
best:[`Write the base case first, then the recursive step, then test with the smallest and a large input.`,`Convert to iteration or an explicit stack when depth can be large or user-controlled.`,`Memoize overlapping subproblems; mention complexity before and after.`],
iq:[["fresher","What is recursion? What are the two required parts?","A function calling itself on a smaller problem. It needs a base case that stops recursion and a recursive step that progresses toward it."],["mid","Why does fib(n) recursion become slow, and how do you fix it?","It recomputes the same subproblems exponentially many times; memoize or use iteration/dynamic programming to make it linear."],["senior","Does JavaScript optimize tail calls?","The spec describes it, but V8 and SpiderMonkey don't implement it (only Safari does), so deep tail recursion still overflows; use loops, explicit stacks or trampolines."],["senior","How would you flatten arbitrarily nested arrays without recursion?","Use an explicit stack: push the array, pop items, push nested arrays' items back, and collect non-arrays (reverse at the end or use a queue), or use arr.flat(Infinity)."]],
practice:[`Rewrite <code>deepClone</code> with an explicit stack so it can't overflow on deep objects.`,`Implement <code>binarySearch</code> recursively and iteratively and compare.`],
teach:`<p>"Recursion is nesting dolls: open smaller and smaller dolls until the solid one, then close them back up. Too many dolls and the stack collapses; then use a loop, your own stack or a trampoline."</p>`}
],quiz:[
{code:`const add = (a) => (b) => a + b;
console.log([1, 2, 3].map(add(10)), [[1, 2], [3]].flatMap((x) => x), [1, 2, 3, 4].reduce((a, x) => (x % 2 ? a : [...a, x]), []));`,ans:`[11, 12, 13] [1, 2, 3] [2, 4]`,why:`add(10) is a partially applied function; flatMap maps and flattens one level; reduce builds a new array of evens without mutating anything.`},
{code:`const sum = (n, acc = 0) => (n === 0 ? acc : sum(n - 1, acc + n));
try { console.log(sum(1e6)); } catch (e) { console.log(e.name); }`,ans:`RangeError (in V8 browsers and Node)`,why:`The recursion is in tail position, but V8 does not perform tail-call optimization, so one million frames exceed the stack. (Safari's engine would return 500000500000.)`}]},

{n:43,title:"Algorithms II",goal:"Add heaps, tries and graph algorithms to your toolkit, the next tier of interview patterns.",topics:[
{id:"d43-heap-trie",title:"Heaps, priority queues and tries",lv:["mid","senior"],
eli5:`<p>A <b>heap</b> is a waiting line where the <b>most important person is always at the front</b>, even as new people arrive; reorganizing takes only a few hops. A <b>trie</b> is a <b>word tree</b>: every path from the top spells a prefix, so asking "what words start with 'ca'?" means walking down c → a and looking at what hangs below.</p>`,
why:`<p>Priority queues power schedulers, Dijkstra, top-k and streaming medians. Tries power autocomplete, spell-check and routing. JavaScript has neither built in, so interviewers ask you to build them.</p>`,
tech:`<ul class="pts"><li><b>Binary heap:</b> a complete binary tree stored in an array; parent of <code>i</code> is <code>(i-1)&gt;&gt;1</code>, children are <code>2i+1</code>/<code>2i+2</code>. <b>push</b> appends and sifts up; <b>pop</b> moves the last element to the root and sifts down; both O(log n); peek O(1); building from n items O(n).</li><li><b>Uses:</b> top-k (keep a min-heap of size k), k-way merge of sorted lists, scheduling, Dijkstra, <b>running median</b> (a max-heap for the lower half plus a min-heap for the upper half).</li><li><b>Trie:</b> nodes with child maps and an end-of-word flag; insert/search/prefix in O(length of word), independent of the number of words. Space can be large; compress with radix trees.</li><li>Use a comparator so one heap class serves min, max and custom priorities.</li></ul>`,
diagram:{html:flow([["push(1)","append at end"],["sift up","swap with parent while smaller","w"],["pop()","take root, move last to root"],["sift down","swap with smaller child","w"]]),steps:["Both operations restore the heap property by moving one element along a single root-to-leaf path.","The path length is the tree height, about log₂ n, so each operation is O(log n).","The root always holds the minimum (or the maximum with a reversed comparator)."]},
ex:[{t:"MinHeap, top-k, merge and running median (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
class MinHeap {
  constructor(cmp = (a, b) => a - b){ this.a = []; this.cmp = cmp; }
  get size(){ return this.a.length; }
  peek(){ return this.a[0]; }
  push(x){
    const a = this.a; a.push(x); let i = a.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (this.cmp(a[i], a[p]) >= 0) break; [a[i], a[p]] = [a[p], a[i]]; i = p; }
  }
  pop(){
    const a = this.a; if (!a.length) return undefined;
    const top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last; let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;
        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]]; i = m;
      }
    }
    return top;
  }
}
const h = new MinHeap(); [5, 1, 4, 2, 3, 9, 0].forEach((x) => h.push(x));
const out = []; while (h.size) out.push(h.pop());
check("pops in sorted order", out.join() === "0,1,2,3,4,5,9");
const topK = (nums, k) => { const heap = new MinHeap(); for (const n of nums) { heap.push(n); if (heap.size > k) heap.pop(); } return heap.a.sort((x, y) => y - x); };
check("top-k largest with a size-k min-heap", topK([3, 1, 5, 12, 2, 11], 3).join() === "12,11,5");
const mergeSorted = (lists) => {
  const heap = new MinHeap((x, y) => x[0] - y[0]); lists.forEach((l, i) => l.length && heap.push([l[0], i, 0]));
  const res = [];
  while (heap.size) { const [v, i, j] = heap.pop(); res.push(v); if (j + 1 < lists[i].length) heap.push([lists[i][j + 1], i, j + 1]); }
  return res;
};
check("k-way merge of sorted lists", mergeSorted([[1, 4, 7], [2, 5], [0, 9]]).join() === "0,1,2,4,5,7,9");
class RunningMedian {
  constructor(){ this.lo = new MinHeap((a, b) => b - a); this.hi = new MinHeap(); }
  add(x){ (this.lo.size === 0 || x <= this.lo.peek() ? this.lo : this.hi).push(x); if (this.lo.size > this.hi.size + 1) this.hi.push(this.lo.pop()); else if (this.hi.size > this.lo.size) this.lo.push(this.hi.pop()); }
  median(){ return this.lo.size > this.hi.size ? this.lo.peek() : (this.lo.peek() + this.hi.peek()) / 2; }
}
const rm = new RunningMedian(); const meds = [];
[5, 15, 1, 3].forEach((x) => { rm.add(x); meds.push(rm.median()); });
check("running median of a stream", meds.join() === "5,10,5,4");`},
{t:"Trie for autocomplete (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
class Trie {
  constructor(){ this.root = { kids: new Map(), end: false }; }
  insert(w){ let n = this.root; for (const c of w) { if (!n.kids.has(c)) n.kids.set(c, { kids: new Map(), end: false }); n = n.kids.get(c); } n.end = true; }
  #find(p){ let n = this.root; for (const c of p) { n = n.kids.get(c); if (!n) return null; } return n; }
  has(w){ const n = this.#find(w); return !!n && n.end; }
  startsWith(p){ return !!this.#find(p); }
  suggest(p, limit = 5){
    const start = this.#find(p); if (!start) return [];
    const out = [];
    const walk = (n, acc) => { if (out.length >= limit) return; if (n.end) out.push(acc); for (const [c, k] of [...n.kids].sort()) walk(k, acc + c); };
    walk(start, p);
    return out;
  }
}
const t = new Trie(); ["car", "card", "care", "cat", "dog"].forEach((w) => t.insert(w));
check("exact search", t.has("car") && !t.has("ca") && !t.has("cow"));
check("prefix search", t.startsWith("ca") && !t.startsWith("cb"));
check("autocomplete in alphabetical order", t.suggest("car").join() === "car,card,care");
check("limit and unknown prefix", t.suggest("c", 2).join() === "car,card" && t.suggest("x").length === 0);`}],
gotchas:[`Using <code>Array.sort</code> on every insert makes a "priority queue" O(n log n) per operation.`,`Comparators must return a number (negative, zero, positive); returning a boolean is a classic bug.`,`Tries can use a lot of memory for large alphabets; use Map children and consider compression.`,`A heap is not fully sorted: only the root is guaranteed; reading <code>heap.a</code> in order is wrong.`,`Forgetting the empty-heap case in <code>pop</code>/<code>peek</code>.`],
best:[`Implement the heap with a comparator; test with pop-all-and-compare-to-sort.`,`For top-k of a large stream, use a size-k heap, not a full sort.`],
iq:[["mid","How do you find the k largest elements efficiently?","Maintain a min-heap of size k: push each element and pop when the size exceeds k. O(n log k) time, O(k) space."],["senior","Implement a priority queue. Complexities?","Binary heap in an array: push and pop O(log n), peek O(1), heapify O(n)."],["senior","Design autocomplete with a trie.","Insert words with a children map and end flag; to suggest, walk the prefix then DFS in sorted order up to a limit; scale with top-k per node, caching, and a server-side index."],["senior","How do you maintain a running median?","Two heaps: a max-heap for the lower half and a min-heap for the upper half, kept balanced within one element; the median is the top of the larger heap or the average of both tops."]],
practice:[`Add <code>decreaseKey</code> to the heap using an index map.`,`Extend the trie with delete and with top-3 suggestions ranked by frequency.`],
teach:`<p>"A heap is a line where the most important item is always in front, fixed in a few swaps. A trie is a word tree where each path spells a prefix, which makes autocomplete fast."</p>`},

{id:"d43-graphs",title:"Graphs: BFS, DFS, topological sort, union-find, Dijkstra",lv:["mid","senior"],
eli5:`<p>A graph is a <b>map of towns and roads</b>. <b>BFS</b> is spreading out in rings from your town: all neighbors first, then their neighbors, so you find the fewest-stops route. <b>DFS</b> is walking down one road as far as it goes before backtracking. <b>Topological sort</b> is "what must be done before what" (put on socks before shoes). <b>Union-find</b> is a club roster that quickly tells whether two people are in the same club. <b>Dijkstra</b> finds the cheapest route when roads have different lengths.</p>`,
why:`<p>Dependency resolution, routing, social networks, grids, scheduling and build systems are graph problems. A handful of algorithms covers most interview questions.</p>`,
tech:`<ul class="pts"><li><b>Representation:</b> adjacency list (<code>{A:["B","C"]}</code> or a Map) for sparse graphs; adjacency matrix for dense ones. Grids are implicit graphs (4/8 neighbors).</li><li><b>BFS</b> (queue): shortest path in unweighted graphs, level order; O(V+E). Use an index pointer, not <code>shift()</code>.</li><li><b>DFS</b> (recursion or stack): connected components, cycle detection, path finding, flood fill ("number of islands"); O(V+E).</li><li><b>Topological sort</b> (Kahn's algorithm): process nodes with in-degree 0, decrement neighbors; if not all nodes are output, there is a cycle. Used for build order and course schedules.</li><li><b>Union-Find (DSU)</b> with path compression and union by rank: near O(1) amortized connectivity queries; used for components, Kruskal's MST, cycle detection in undirected graphs.</li><li><b>Dijkstra</b> (min-heap): shortest paths with non-negative weights; O((V+E) log V). Negative weights need Bellman-Ford.</li></ul>`,
diagram:{html:flow([["BFS: A"],["ring 1: B, C","queue","w"],["ring 2: D","queue","w"],["shortest path = fewest edges","g"]])+flow([["DFS: A → B → D"],["backtrack","stack / recursion","w"],["→ C","g"]]),steps:["BFS explores in expanding rings, so the first time it reaches a node is via a shortest (fewest-edge) path.","DFS goes deep first and backtracks; it is natural for exploring all possibilities.","Both visit each node and edge once if you track visited nodes."]},
ex:[{t:"Graph toolkit with self-checks",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
class MinHeap {
  constructor(cmp = (a, b) => a - b){ this.a = []; this.cmp = cmp; }
  get size(){ return this.a.length; }
  push(x){ const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (this.cmp(a[i], a[p]) >= 0) break; [a[i], a[p]] = [a[p], a[i]]; i = p; } }
  pop(){ const a = this.a; if (!a.length) return undefined; const top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l; if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r; if (m === i) break; [a[i], a[m]] = [a[m], a[i]]; i = m; } } return top; }
}
const bfsPath = (g, s, t) => {
  const prev = new Map([[s, null]]), q = [s];
  for (let i = 0; i < q.length; i++) { const u = q[i]; if (u === t) break; for (const v of g[u] || []) if (!prev.has(v)) { prev.set(v, u); q.push(v); } }
  if (!prev.has(t)) return null;
  const path = []; for (let n = t; n !== null; n = prev.get(n)) path.push(n);
  return path.reverse();
};
const dfsOrder = (g, s, seen = new Set(), out = []) => { seen.add(s); out.push(s); for (const v of g[s] || []) if (!seen.has(v)) dfsOrder(g, v, seen, out); return out; };
const topo = (g) => {
  const indeg = {}; for (const u in g) { indeg[u] ??= 0; for (const v of g[u]) indeg[v] = (indeg[v] ?? 0) + 1; }
  const q = Object.keys(indeg).filter((k) => !indeg[k]), out = [];
  while (q.length) { const u = q.shift(); out.push(u); for (const v of g[u] || []) if (--indeg[v] === 0) q.push(v); }
  return out.length === Object.keys(indeg).length ? out : null;
};
class DSU {
  constructor(n){ this.p = Array.from({ length: n }, (_, i) => i); this.r = Array(n).fill(0); }
  find(x){ while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x]; } return x; }
  union(a, b){ a = this.find(a); b = this.find(b); if (a === b) return false; if (this.r[a] < this.r[b]) [a, b] = [b, a]; this.p[b] = a; if (this.r[a] === this.r[b]) this.r[a]++; return true; }
}
const dijkstra = (g, s) => {
  const dist = { [s]: 0 }, h = new MinHeap((a, b) => a[0] - b[0]); h.push([0, s]);
  while (h.size) { const [d, u] = h.pop(); if (d > dist[u]) continue; for (const [v, w] of g[u] || []) { const nd = d + w; if (dist[v] === undefined || nd < dist[v]) { dist[v] = nd; h.push([nd, v]); } } }
  return dist;
};
const islands = (grid) => {
  let count = 0; const rows = grid.length, cols = grid[0].length;
  const sink = (r, c) => { const stack = [[r, c]]; while (stack.length) { const [i, j] = stack.pop(); if (i < 0 || j < 0 || i >= rows || j >= cols || grid[i][j] !== 1) continue; grid[i][j] = 0; stack.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]); } };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === 1) { count++; sink(r, c); }
  return count;
};
const g = { A: ["B", "C"], B: ["D"], C: ["D", "E"], D: ["F"], E: ["F"], F: [] };
check("BFS finds a fewest-edges path", bfsPath(g, "A", "F").length === 4 && bfsPath(g, "A", "F")[0] === "A" && bfsPath(g, "F", "A") === null);
check("DFS preorder", dfsOrder(g, "A").join("") === "ABDFCE");
const order = topo(g);
check("topological order respects every edge", order && Object.entries(g).every(([u, vs]) => vs.every((v) => order.indexOf(u) < order.indexOf(v))));
check("a cycle makes topological sort fail", topo({ X: ["Y"], Y: ["X"] }) === null);
const dsu = new DSU(5); dsu.union(0, 1); dsu.union(1, 2); dsu.union(3, 4);
check("union-find: connectivity and component count", dsu.find(0) === dsu.find(2) && dsu.find(0) !== dsu.find(3) && new Set([0, 1, 2, 3, 4].map((x) => dsu.find(x))).size === 2 && dsu.union(0, 2) === false);
const wg = { A: [["B", 4], ["C", 1]], C: [["B", 2], ["D", 7]], B: [["D", 1]], D: [] };
const dist = dijkstra(wg, "A");
check("Dijkstra shortest distances", dist.B === 3 && dist.C === 1 && dist.D === 4);
check("number of islands (grid DFS)", islands([[1, 1, 0, 0], [0, 1, 0, 1], [1, 0, 0, 1], [0, 0, 0, 0]]) === 3);`}],
gotchas:[`Forgetting a visited set causes infinite loops on cyclic graphs.`,`Using <code>queue.shift()</code> in big BFS loops is O(n) per call; use an index pointer.`,`Dijkstra fails with negative edge weights.`,`Recursive DFS overflows the stack on deep graphs; use an explicit stack.`,`Topological sort only exists for directed acyclic graphs; always check for cycles.`,`Grids: check bounds before indexing; mark visited by mutation or a Set (not by revisiting).`],
best:[`State the graph model first (nodes, edges, directed?, weighted?), then choose BFS/DFS/Dijkstra accordingly.`,`Track visited when you enqueue, not when you dequeue, to avoid duplicates in the queue.`],
iq:[["mid","BFS vs DFS?","BFS explores by levels and finds shortest paths in unweighted graphs; DFS explores deeply and suits cycle detection, components and exhaustive search. Both are O(V+E)."],["senior","How do you detect a cycle in a directed graph?","Run Kahn's algorithm and see if all nodes are processed, or DFS with a recursion-stack (three-color) check."],["senior","Explain Dijkstra's algorithm and its complexity.","Greedy expansion from the source using a min-heap keyed by distance; relax edges and push improvements. O((V+E) log V) with non-negative weights."],["senior","What is union-find and where is it used?","A disjoint-set structure with find and union (path compression, union by rank) giving near-constant time connectivity queries; used for components, Kruskal's MST and cycle detection."]],
practice:[`Solve "course schedule" (is there a valid order?) with topological sort.`,`Implement A* by adding a heuristic to Dijkstra on a grid.`],
teach:`<p>"BFS spreads in rings, so it finds the fewest stops. DFS goes deep and backtracks. Topological sort orders tasks by dependency. Union-find tells if two things are connected. Dijkstra finds the cheapest route when roads have different lengths."</p>`}
],quiz:[
{code:`const g = { A: ['B', 'C'], B: ['D'], C: ['D'], D: [] };
const bfs = (s) => { const seen = new Set([s]), q = [s]; for (let i = 0; i < q.length; i++) for (const v of g[q[i]]) if (!seen.has(v)) { seen.add(v); q.push(v); } return q.join(''); };
const dfs = (s, seen = new Set()) => { seen.add(s); let out = s; for (const v of g[s]) if (!seen.has(v)) out += dfs(v, seen); return out; };
console.log(bfs('A'), dfs('A'));`,ans:`ABCD ABDC`,why:`BFS visits A, then its neighbors B and C, then D. DFS goes A → B → D, backtracks, then C.`},
{code:`const p = [0, 1, 2, 3, 4];
const find = (x) => { while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; } return x; };
const union = (a, b) => { p[find(a)] = find(b); };
[[0, 1], [1, 2], [3, 4]].forEach(([a, b]) => union(a, b));
console.log(new Set(p.map((_, i) => find(i))).size);`,ans:`2`,why:`Edges (0,1), (1,2) join nodes 0-2 into one component and (3,4) forms the other, leaving two components.`}]},

{n:44,title:"Binary data and internationalization",goal:"Handle bytes and bits correctly, and format numbers, dates, plurals and text for any locale.",topics:[
{id:"d44-binary",title:"Binary data: typed arrays, DataView, Blob and base64",lv:["mid","senior"],
eli5:`<p>Computers store everything as <b>rows of tiny switches (bits)</b>. An <b>ArrayBuffer</b> is a blank strip of switch boxes. A <b>typed array</b> is a pair of glasses that makes you read the strip in groups: "8 switches at a time as a number" (Uint8Array) or "32 switches at a time as a decimal" (Float32Array). <b>DataView</b> lets you choose the reading order (big-endian or little-endian), like reading a number left-to-right or right-to-left.</p>`,
why:`<p>Files, images, audio, network protocols, WebAssembly and crypto all use raw bytes. Typed arrays make this fast and memory-efficient, and knowing endianness, overflow and encoding avoids subtle bugs.</p>`,
tech:`<ul class="pts"><li><b>ArrayBuffer</b>: fixed-length raw bytes (resizable buffers exist, ES2024). <b>Typed arrays</b> (<code>Uint8Array, Int16Array, Float32Array, BigInt64Array...</code>) are views; several views can share one buffer.</li><li><b>Overflow:</b> typed arrays wrap modulo 2<sup>n</sup> (<code>Uint8Array.of(256)</code> → 0, <code>-1</code> → 255); <code>Uint8ClampedArray</code> clamps to 0–255. <code>Float32Array</code> stores single precision (<code>Math.fround(0.1) !== 0.1</code>).</li><li><b>DataView</b> reads/writes any type at any byte offset with explicit endianness (default big-endian). Typed arrays use the machine's endianness (little on virtually all current devices).</li><li><b>Text:</b> <code>TextEncoder</code> (string → UTF-8 bytes), <code>TextDecoder</code>. Emoji take 4 bytes, so byte length differs from string length.</li><li><b>Base64:</b> <code>btoa/atob</code> work on Latin-1 "binary strings" only; encode Unicode through <code>TextEncoder</code> first. Newer runtimes add <code>Uint8Array.prototype.toBase64/fromBase64</code> (ES2026; feature-detect).</li><li><b>Blob/File:</b> immutable chunks of bytes with a MIME type; <code>blob.slice</code>, <code>text()</code>, <code>arrayBuffer()</code>, <code>stream()</code>; <code>URL.createObjectURL(blob)</code> must be freed with <code>revokeObjectURL</code>. <b>Transfer</b> buffers to workers instead of copying (Day 14).</li><li><b>Bit manipulation:</b> <code>&amp; | ^ ~ &lt;&lt; &gt;&gt; &gt;&gt;&gt;</code> work on 32-bit integers; use bitmasks for flags. <code>&gt;&gt;&gt; 0</code> converts to unsigned.</li></ul>`,
diagram:{html:flow([["ArrayBuffer(4)","[00][00][00][00]"],["Uint8Array view","4 numbers 0–255","w"],["Uint16Array view","2 numbers 0–65535","w"],["DataView","any type, chosen endianness","g"]]),steps:["One buffer can be viewed in different ways without copying.","The same bytes produce different numbers depending on the view.","Endianness decides which byte of a multi-byte number comes first."]},
ex:[{t:"Typed arrays, endianness, overflow, encoding, Blob and flags (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const buf = new ArrayBuffer(4), dv = new DataView(buf), bytes = new Uint8Array(buf);
dv.setUint16(0, 0x0102);
check("DataView defaults to big-endian", bytes[0] === 1 && bytes[1] === 2);
dv.setUint16(2, 0x0102, true);
check("little-endian flag reverses byte order", bytes[2] === 2 && bytes[3] === 1);
check("Uint8Array wraps modulo 256", new Uint8Array([300, -1, 256]).join() === "44,255,0");
check("Uint8ClampedArray clamps instead", new Uint8ClampedArray([300, -5]).join() === "255,0");
check("Float32 loses precision", Math.fround(0.1) !== 0.1 && Math.abs(Math.fround(0.1) - 0.1) < 1e-8);
const shared = new Uint8Array([1, 0, 0, 0]);
check("views share the same bytes", new Uint32Array(shared.buffer)[0] === 1 || new Uint32Array(shared.buffer)[0] === 16777216);
const enc = new TextEncoder().encode("é😀");
check("UTF-8 bytes: é = 2, emoji = 4", enc.length === 6 && new TextDecoder().decode(enc) === "é😀");
const toB64 = (u8) => btoa(String.fromCharCode(...u8));
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
check("base64 round-trip of Unicode text via UTF-8 bytes", new TextDecoder().decode(fromB64(toB64(new TextEncoder().encode("héllo 😀")))) === "héllo 😀");
check("btoa rejects characters above Latin-1", (() => { try { btoa("😀"); return false; } catch (e) { return e.name === "InvalidCharacterError"; } })());
const FLAGS = { READ: 1, WRITE: 2, EXEC: 4 };
let perm = FLAGS.READ | FLAGS.WRITE;
check("bitmask flags", (perm & FLAGS.WRITE) !== 0 && (perm & FLAGS.EXEC) === 0 && ((perm ^= FLAGS.WRITE), perm === 1) && (-1 >>> 0) === 4294967295);
(async () => {
  const blob = new Blob(["hello ", "world"], { type: "text/plain" });
  check("Blob size, type and text()", blob.size === 11 && blob.type === "text/plain" && (await blob.text()) === "hello world");
  check("slice returns a sub-Blob", (await blob.slice(6).text()) === "world");
  check("arrayBuffer() gives bytes", new Uint8Array(await blob.arrayBuffer())[0] === 104);
})();`}],
gotchas:[`<code>btoa("é😀")</code> throws; encode to UTF-8 bytes first.`,`Typed arrays silently wrap on overflow; arithmetic results are not auto-widened.`,`Typed-array endianness follows the platform; use DataView when a file or protocol specifies the order.`,`Bitwise operators coerce to signed 32-bit integers: <code>2**32 | 0</code> is 0 and <code>1 &lt;&lt; 31</code> is negative.`,`Forgetting <code>URL.revokeObjectURL</code> leaks the Blob in memory.`,`<code>String.fromCharCode(...bigArray)</code> can exceed the argument limit; chunk large buffers.`],
best:[`Use TextEncoder/TextDecoder for text, DataView for specified binary formats, typed arrays for bulk numeric work.`,`Transfer ArrayBuffers to workers; stream large Blobs rather than reading them whole.`,`Document bit flags with named constants.`],
iq:[["mid","What is an ArrayBuffer vs a typed array vs DataView?","ArrayBuffer is raw bytes; typed arrays are fixed-type views over it; DataView reads/writes mixed types at offsets with explicit endianness."],["senior","What is endianness and when does it matter?","The byte order of multi-byte numbers. It matters when reading files or network protocols; DataView lets you specify it, typed arrays use the platform order."],["senior","How do you base64-encode a Unicode string in the browser?","Encode to UTF-8 bytes with TextEncoder, convert bytes to a binary string (or use toBase64 where available), then btoa; decode in reverse."]],
practice:[`Parse a small binary header (magic number, version, length) with DataView.`,`Implement a bit set class backed by a Uint32Array.`],
teach:`<p>"Bytes are a strip of switches. Typed arrays are glasses that read the strip in groups, DataView lets you choose the reading order, and text must go through UTF-8 before it becomes bytes. Typed arrays wrap on overflow instead of growing."</p>`},

{id:"d44-intl",title:"Internationalization with Intl",lv:["mid","senior","architect"],
eli5:`<p>People around the world write the same thing differently: "1,234.50" or "1.234,50", "3/4/2026" could be March or April, and "1 file, 2 files" has more forms in some languages (Russian has several). <b>Intl</b> is a built-in <b>translator for formats</b>: you hand it a number or date and a place, and it writes it the way people there expect.</p>`,
why:`<p>Hand-written formatting breaks for real users: wrong separators, wrong date order, wrong plural forms, wrong sorting. <code>Intl</code> ships the locale data (CLDR) in the browser and Node, so you don't need heavy libraries for most formatting.</p>`,
tech:`<table><tr><th>API</th><th>Use</th></tr><tr><td><code>Intl.NumberFormat</code></td><td>numbers, currency, percent, units, compact notation (1.2K)</td></tr><tr><td><code>Intl.DateTimeFormat</code></td><td>dates/times with locale, time zone, calendar, <code>dateStyle/timeStyle</code></td></tr><tr><td><code>Intl.RelativeTimeFormat</code></td><td>"yesterday", "in 3 days"</td></tr><tr><td><code>Intl.PluralRules</code></td><td>which plural category (zero, one, two, few, many, other) applies</td></tr><tr><td><code>Intl.ListFormat</code></td><td>"a, b, and c" / "a, b et c"</td></tr><tr><td><code>Intl.Collator</code></td><td>locale-aware sorting and comparison (<code>localeCompare</code>)</td></tr><tr><td><code>Intl.Segmenter</code></td><td>grapheme/word/sentence boundaries</td></tr><tr><td><code>Intl.DisplayNames</code></td><td>names of languages, regions, currencies</td></tr></table>
<ul class="pts"><li>Always pass an <b>explicit locale</b> (from the user's preference or <code>navigator.languages</code>) and, for dates, an explicit <b>timeZone</b>.</li><li><b>Plurals vary:</b> English has 2 forms (one/other), Russian has one/few/many/other, Arabic has six. Use <code>PluralRules</code> (or ICU MessageFormat libraries) and never <code>n === 1 ? "item" : "items"</code>.</li><li><b>Don't concatenate</b> translated fragments; word order varies. Use full-sentence message templates with placeholders.</li><li><b>Other concerns:</b> right-to-left layouts (<code>dir</code>, logical CSS properties), currency minor units (JPY has none), text expansion (German is longer), locale-aware sorting, time zones and DST, number input parsing, and lazy-loading translation catalogs.</li></ul>`,
diagram:{html:flow([["value + locale + options"],["Intl formatter","uses CLDR data in the engine","w"],["locale-correct string","1.234,50 € / $1,234.50","g"]]),steps:["You provide raw data (never pre-formatted strings) and the user's locale.","The engine applies the right separators, symbols, order and plural rules.","Keep storage in neutral formats (numbers, ISO dates, UTC) and format only for display."]},
ex:[{t:"Formatting, plurals, lists and sorting (self-checking, explicit locales)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const nbsp = (s) => s.normalize("NFKC");
check("US currency", new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(1234.5) === "$1,234.50");
check("German currency uses . and ,", nbsp(new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(1234.5)) === "1.234,50 €");
check("yen has no minor units", new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(1234).replace(/[^0-9]/g, "") === "1234");
check("compact notation", new Intl.NumberFormat("en", { notation: "compact" }).format(1200) === "1.2K");
check("percent", new Intl.NumberFormat("en", { style: "percent" }).format(0.256) === "26%");
check("date in a fixed time zone", new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "medium" }).format(new Date(0)) === "Jan 1, 1970");
const hourIn = (tz) => Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).formatToParts(new Date(Date.UTC(2026, 0, 1))).find((p) => p.type === "hour").value);
check("the same instant differs by time zone (Jan 2026: KL is UTC+8, New York is UTC-5)", hourIn("UTC") === 0 && hourIn("Asia/Kuala_Lumpur") === 8 && hourIn("America/New_York") === 19);
const klHour1970 = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kuala_Lumpur", hour: "numeric", hourCycle: "h23" }).formatToParts(new Date(0)).find((p) => p.type === "hour").value);
check("time zone rules change historically: in 1970 Malaysia was UTC+7:30, not +8", klHour1970 === 7);
check("relative time", new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-1, "day") === "yesterday" && new Intl.RelativeTimeFormat("en").format(3, "day") === "in 3 days");
const enP = new Intl.PluralRules("en"), ruP = new Intl.PluralRules("ru");
check("English has one/other", enP.select(1) === "one" && enP.select(2) === "other");
check("Russian has one/few/many", ruP.select(1) === "one" && ruP.select(2) === "few" && ruP.select(5) === "many");
check("list formatting", new Intl.ListFormat("en", { type: "conjunction" }).format(["a", "b", "c"]) === "a, b, and c");
check("default sort puts ä after z, Collator('de') fixes it", ["z", "ä", "a"].sort().join("") === "azä" && ["z", "ä", "a"].sort(new Intl.Collator("de").compare).join("") === "aäz");
const seg = new Intl.Segmenter("en", { granularity: "word" });
check("word segmentation", [...seg.segment("Hello big world")].filter((s) => s.isWordLike).length === 3);
const plural = (n, forms, locale = "en") => forms[new Intl.PluralRules(locale).select(n)] ?? forms.other;
check("plural helper picks the right form", plural(1, { one: "1 file", other: "n files" }) === "1 file" && plural(0, { one: "1 file", other: "0 files" }) === "0 files");`}],
gotchas:[`<code>n === 1 ? "item" : "items"</code> is wrong for many languages; use PluralRules/ICU.`,`<code>toLocaleString()</code> without arguments uses the runtime's default locale, which differs between server and browser (hydration mismatch).`,`Dates without an explicit time zone use the viewer's zone, so server-rendered and client-rendered text can differ.`,`Time zone offsets change over history (Malaysia was UTC+7:30 until 1982) and with DST law changes, so never hard-code offsets; use IANA zone names.`,`Concatenating translated pieces breaks word order in other languages.`,`Parsing localized numbers back is hard (<code>"1.234,5"</code>); store numbers in neutral form.`,`Intl output (spacing characters, abbreviations) can vary slightly by engine/version; avoid exact-string tests across environments or normalize them.`],
best:[`Pass explicit locale and time zone; cache formatter instances (constructing them is slow).`,`Store data neutrally (numbers, ISO/UTC) and format at the edge.`,`Use full-sentence message templates with ICU plural/select syntax via a library for complex copy.`],
iq:[["mid","How do you format currency and dates for different locales?","Intl.NumberFormat with style currency and Intl.DateTimeFormat with locale and timeZone options; pass the user's locale explicitly."],["senior","Why shouldn't you pluralize with n === 1?","Languages have different plural categories (Russian one/few/many/other, Arabic six). Intl.PluralRules or ICU MessageFormat selects the correct form."],["architect","How would you design i18n for a large web app?","Externalized message catalogs with ICU syntax, locale negotiation (URL/cookie/Accept-Language), lazy-loaded catalogs, Intl for formatting, RTL support with logical CSS, pseudo-localization in tests, explicit time zones and translation workflow tooling."]],
practice:[`Format the same price, date and "N files" message in English, German, Russian and Arabic.`,`Write a <code>formatDuration(ms, locale)</code> using <code>Intl.RelativeTimeFormat</code> and <code>ListFormat</code>.`],
teach:`<p>"Don't write '1,234.50' or 'items' by hand. Intl knows how every locale writes numbers, dates, lists, plurals and sort order. Give it raw data, the user's locale and time zone, and let it format."</p>`}
],quiz:[
{code:`const dv = new DataView(new ArrayBuffer(4));
dv.setUint16(0, 0x0102);
console.log([...new Uint8Array(dv.buffer)], new Uint8Array([300, -1]) + '', Math.fround(0.1) === 0.1);`,ans:`[1, 2, 0, 0] 44,255 false`,why:`DataView writes big-endian by default (01 then 02). Uint8Array wraps modulo 256 (300→44, -1→255). A 32-bit float cannot hold 0.1 exactly.`},
{code:`console.log(new Intl.PluralRules('ru').select(2), new Intl.PluralRules('en').select(2),
  ['z', 'ä', 'a'].sort().join(''), ['z', 'ä', 'a'].sort(new Intl.Collator('de').compare).join(''));`,ans:`few other azä aäz`,why:`Russian has a "few" category for 2–4, English only one/other. The default sort compares UTF-16 code units (ä after z), while Collator('de') sorts by language rules.`}]},

{n:45,title:"Debugging",goal:"Use debugging tools effectively and follow a method that finds bugs systematically.",topics:[
{id:"d45-debug-tools",title:"Debugging tools: DevTools, console and Node inspector",lv:["fresher","mid","senior"],
eli5:`<p>Debugging tools are a <b>pause button and a magnifying glass for your program</b>. Instead of guessing what's happening, you freeze the program on a line, look at every variable, and step forward one line at a time like a slow-motion replay. The console is a notebook where your code can write messages.</p>`,
why:`<p>Print-statement debugging works until it doesn't. Breakpoints, async stack traces, network inspection and source maps let you find in minutes what guessing takes hours to find, and fluency with tools is visible in interviews and real work.</p>`,
tech:`<h5>Sources panel (Chrome/Edge/Firefox)</h5><ul class="pts"><li><b>Breakpoint types:</b> line; <b>conditional</b> (<code>user.id === 42</code>); <b>logpoint</b> (log without editing code); <b>DOM change</b> (subtree/attribute/removal); <b>XHR/fetch</b> by URL; <b>event listener</b> (click, keydown); <b>exception</b> (pause on caught/uncaught).</li><li><b>Stepping:</b> resume, step over, step into, step out; <b>call stack</b> with <b>async stack traces</b> (shows the awaiting chain); <b>Scope</b> panel (local, closure, global); <b>Watch</b> expressions; <b>blackbox</b> library scripts so stepping skips them.</li><li><code>debugger;</code> statement pauses when DevTools is open. <b>Source maps</b> let you debug original TypeScript/bundled code. <b>Local overrides</b> edit files and responses for experiments.</li></ul>
<h5>Console API</h5><ul class="pts"><li><code>console.table(rows)</code>, <code>group/groupEnd</code>, <code>time/timeEnd</code>, <code>count</code>, <code>assert(cond, msg)</code>, <code>trace()</code>, <code>dir(obj)</code>, <code>%c</code> styling, <code>error/warn</code> levels.</li><li>Console helpers: <code>$0</code> (selected element), <code>$_</code> (last result), <code>$$("sel")</code>, <code>copy(obj)</code>, <code>monitorEvents(el, "click")</code>, <code>getEventListeners(el)</code>, <code>debug(fn)</code>, <code>queryObjects(Class)</code>.</li></ul>
<h5>Other panels and Node</h5><ul class="pts"><li><b>Network:</b> waterfall, throttling, blocking requests, "copy as cURL", preserve log, request/response headers and timings.</li><li><b>Application:</b> storage, service workers, cache. <b>Performance/Memory:</b> Days 18–23. <b>Lighthouse</b> for audits. <b>Rendering</b> panel: paint flashing, layout shifts.</li><li><b>Node:</b> <code>node --inspect</code> (attach Chrome DevTools or VS Code), <code>--inspect-brk</code> (pause on first line), VS Code launch configs, <code>NODE_DEBUG</code>, <code>--trace-warnings</code>, <code>--cpu-prof</code>, heap snapshots (Day 22).</li></ul>`,
diagram:{html:flow([["Reproduce the bug"],["Set a breakpoint","conditional / logpoint","w"],["Inspect","scope, call stack, watch","w"],["Step","over / into / out","g"],["Confirm cause","edit in console, re-run","g"]]),steps:["Reproduce reliably first; a flaky bug is hard to debug.","Place a breakpoint near where the state first looks wrong, not where the symptom shows.","Inspect variables and the call stack (including async frames) to see how you got here.","Step to the line where reality diverges from expectation.","Test the fix hypothesis in the console before editing code."]},
ex:[{t:"Structured logging, assertions and error-cause chains (runnable)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const makeLogger = (min = "info", sink = []) => {
  const log = (level) => (msg, ctx = {}) => { if (LEVELS[level] >= LEVELS[min]) sink.push(JSON.stringify({ level, msg, ...ctx })); };
  return { sink, debug: log("debug"), info: log("info"), warn: log("warn"), error: log("error") };
};
const lg = makeLogger("info");
lg.debug("hidden"); lg.info("user logged in", { userId: 42 }); lg.error("payment failed", { orderId: "o1" });
check("log levels filter noise, output is structured JSON", lg.sink.length === 2 && JSON.parse(lg.sink[0]).userId === 42 && JSON.parse(lg.sink[1]).level === "error");
const assert = (cond, msg) => { if (!cond) throw new Error("Assertion failed: " + msg); };
let caught = ""; try { assert(1 + 1 === 3, "math works"); } catch (e) { caught = e.message; }
check("assertions fail loudly at the first wrong assumption", caught === "Assertion failed: math works");
const e = new Error("checkout failed", { cause: new Error("payment declined", { cause: new Error("card expired") }) });
const chain = []; for (let x = e; x; x = x.cause) chain.push(x.message);
check("the cause chain preserves the root problem", chain.join(" <- ") === "checkout failed <- payment declined <- card expired");
check("stack traces name the function and location", typeof new Error("x").stack === "string" && new Error("x").stack.includes("x"));
const timeIt = (fn) => { const t = performance.now(); fn(); return performance.now() - t; };
check("a tiny timing helper (like console.time) returns a number", typeof timeIt(() => Array.from({ length: 1000 }, (_, i) => i)) === "number");`},
{t:"Things to try in DevTools (reference)",code:`// In the console on any page:
$$("img").filter((i) => !i.alt)            // find images without alt text
getEventListeners(document.body)           // see attached listeners
monitorEvents($0, "click")                 // log events on the selected element
console.table(performance.getEntriesByType("resource").map((r) => ({ name: r.name.slice(-30), ms: Math.round(r.duration) })))
console.group("checkout"); console.time("calc"); /* work */ console.timeEnd("calc"); console.groupEnd()

// Conditional breakpoint expression:   order.total > 1000 && user.isGuest
// Logpoint message:                    "cart size", cart.items.length
// Node:   node --inspect-brk app.js    then open chrome://inspect`,run:false}],
gotchas:[`<code>console.log(obj)</code> shows the object's <i>current</i> state when expanded, not when it was logged; log <code>structuredClone(obj)</code> or <code>JSON.stringify</code> to snapshot.`,`Breakpoints in minified code are useless without source maps (and exposing maps publicly leaks source).`,`Pausing on all exceptions is noisy; start with uncaught, then enable caught for a specific bug.`,`Leaving <code>debugger;</code> or noisy logs in production code.`,`Timing bugs (races) change under the debugger; use logpoints and timestamps instead of pausing.`,`Console methods hold references to logged objects, which can look like memory leaks.`],
best:[`Prefer logpoints and conditional breakpoints over editing code to add logs.`,`Use structured logs with levels, request ids and context in production, and keep a debug mode behind a flag.`,`Learn keyboard shortcuts for stepping; use blackboxing and async stack traces.`],
iq:[["fresher","How do you debug a JavaScript bug in the browser?","Reproduce it, open DevTools, set breakpoints near the failing logic, inspect variables and the call stack, step through, and verify the fix in the console."],["mid","What is a conditional breakpoint or logpoint?","A breakpoint that only pauses when an expression is true, or that logs a message without pausing and without changing the source."],["senior","How do you debug a production-only issue?","Reproduce with production-like data using source maps and error monitoring, add structured logs/trace ids, use feature flags and canaries, capture HAR/Performance traces from affected users, and compare environments."]],
practice:[`Debug a deliberately broken sample with only conditional breakpoints and logpoints (no code edits).`,`Attach VS Code to a Node script with <code>--inspect-brk</code> and step through an async function.`],
teach:`<p>"A debugger is a pause button and a magnifying glass: stop on the line, look at every variable and the call stack, step forward one line at a time. Logpoints and conditional breakpoints find the one bad case among thousands."</p>`},

{id:"d45-debug-method",title:"A debugging method: reproduce, minimize, bisect",lv:["fresher","mid","senior","lead"],
eli5:`<p>Finding a bug is like finding which light bulb in a long string of holiday lights is broken. You don't test them one by one; you <b>test the middle</b>: if the lights past the middle are dark, the broken one is in the second half; repeat. Also, first <b>make the problem as small as possible</b> (remove everything that isn't needed) so there's less to search.</p>`,
why:`<p>Great debuggers are systematic. A method turns "I have no idea" into a sequence of small experiments, and it works under pressure and on unfamiliar code. Interviewers often ask "tell me about the hardest bug you've fixed".</p>`,
tech:`<ol><li><b>Reproduce:</b> make it fail on demand; record the exact steps, inputs, environment, versions. If it's intermittent, add logging to capture state when it fails.</li><li><b>Minimize:</b> cut the input, code and dependencies until the smallest case still fails (<b>delta debugging</b>). A minimal repro is half the fix and is what maintainers want.</li><li><b>Hypothesize:</b> form a specific, falsifiable guess ("the cache returns stale data after logout"), and predict what you'd observe.</li><li><b>Experiment:</b> change one thing at a time; use breakpoints, logs, assertions; <b>bisect</b> (binary search) over commits (<code>git bisect</code>), data, code paths or time.</li><li><b>Fix and verify:</b> fix the root cause, not the symptom; write a regression test that fails before the fix.</li><li><b>Prevent:</b> add monitoring, assertions or types so the class of bug is caught earlier; write a short post-mortem for significant bugs.</li></ol>
<h5>Common JavaScript bug classes (check these first)</h5><ul class="pts"><li><b>Async ordering/races:</b> missing <code>await</code>, <code>forEach(async)</code>, stale responses overwriting new ones.</li><li><b>Stale closures and <code>this</code>:</b> captured old values, lost receivers.</li><li><b>Mutation:</b> shared references changed elsewhere, <code>sort</code>/<code>splice</code> on shared arrays.</li><li><b>Coercion and equality:</b> <code>==</code>, falsy checks on <code>0</code>/<code>""</code>, string vs number from inputs/JSON.</li><li><b>Time and floats:</b> time zones, DST, rounding, <code>0.1 + 0.2</code>.</li><li><b>Environment:</b> cache, service worker serving old code, different Node/browser versions, missing env vars.</li></ul>
<p><b>Differential debugging:</b> compare a working and a failing case (versions, environments, inputs) and focus on the first difference. <b>Rubber-duck</b> explain the code aloud; the gap in your explanation is often the bug.</p>`,
diagram:{html:flow([["Reproduce","on demand"],["Minimize","smallest failing case","w"],["Hypothesize","falsifiable guess","w"],["Bisect / experiment","one change at a time","g"],["Fix root cause","+ regression test","g"],["Prevent","monitoring, types, assertions","r"]]),steps:["If you can't reproduce it, you can't know you fixed it.","Shrinking the case removes distractions and often reveals the cause.","Write down a hypothesis and what result would disprove it.","Binary search is the fastest way to localize a change or input that causes failure.","A test that failed before and passes after is your proof."]},
ex:[{t:"Bisect and delta-minimize (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
// git-bisect style: find the first bad version using binary search
function bisect(n, isBad){
  let lo = 0, hi = n - 1, steps = 0;
  while (lo < hi) { const mid = (lo + hi) >> 1; steps++; if (isBad(mid)) hi = mid; else lo = mid + 1; }
  return { first: lo, steps };
}
const r = bisect(1000, (v) => v >= 637);
check("finds the first bad version of 1000", r.first === 637);
check("in about log2(n) steps (" + r.steps + ")", r.steps <= 10);
// delta-style minimization: remove elements while the failure persists
function minimize(input, fails){
  let cur = [...input], changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < cur.length; i++) {
      const trial = [...cur.slice(0, i), ...cur.slice(i + 1)];
      if (fails(trial)) { cur = trial; changed = true; i--; }
    }
  }
  return cur;
}
const buggy = (items) => items.includes(3) && items.includes(7);       // the bug needs both 3 and 7
const failingInput = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const small = minimize(failingInput, buggy);
check("the minimal failing input is just [3, 7]", small.join() === "3,7" && buggy(small));
// differential debugging: find the first differing key between a good and a bad config
const firstDiff = (a, b) => Object.keys({ ...a, ...b }).find((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
check("differential debugging pinpoints the first difference", firstDiff({ a: 1, mode: "fast", c: 3 }, { a: 1, mode: "safe", c: 3 }) === "mode");
// regression test pattern: write the failing case first
const parsePrice = (s) => Math.round(parseFloat(String(s).replace(",", ".")) * 100);
check("regression: comma decimal separators", parsePrice("12,50") === 1250 && parsePrice("0.1") === 10);`}],
gotchas:[`Changing several things at once, so you can't tell what fixed or broke it.`,`Fixing the symptom (null check) instead of the root cause (why it's null).`,`Debugging in a different environment from the one that fails.`,`Not writing a regression test, so the bug returns.`,`Assuming the bug is in the library or the engine; check your code first.`,`Skipping reproduction for "obvious" bugs that turn out not to be obvious.`],
best:[`Write down what you tried and learned; it prevents loops and helps handoffs.`,`Time-box guesses; if 30 minutes pass without a hypothesis that predicts something, return to measuring.`,`Share the minimal repro (CodeSandbox, gist) when asking for help.`],
iq:[["mid","Walk me through how you debug a bug you can't immediately explain.","Reproduce it reliably, minimize the case, form and test hypotheses one at a time, bisect over code/commits/data, fix the root cause, add a regression test, and consider prevention."],["senior","What is git bisect and when do you use it?","Binary search over commit history to find the commit that introduced a regression, given a good and a bad commit and a test; O(log n) steps."],["lead","Tell me about the hardest bug you fixed.","Use STAR: context and impact, how you reproduced and minimized, the hypotheses tested, the root cause, the fix and regression test, and the preventive change. Include numbers and a lesson."]],
practice:[`Take a bug from your own project and write its minimal reproduction in under 20 lines.`,`Use <code>git bisect run</code> with a small test script on a sample repo.`],
teach:`<p>"Make it fail on demand, shrink it to the smallest failing case, guess one specific cause, test the guess by halving the search space, fix the root cause and lock it in with a test."</p>`}
],quiz:[
{code:`const bad = (v) => v >= 37;
let lo = 0, hi = 100, steps = 0;
while (lo < hi) { const mid = (lo + hi) >> 1; steps++; bad(mid) ? (hi = mid) : (lo = mid + 1); }
console.log(lo, steps <= 7);`,ans:`37 true`,why:`Binary search halves the range each step, so 100 candidates need at most about log2(100) ≈ 7 checks.`},
{code:`const e = new Error('top', { cause: new Error('mid', { cause: new Error('root') }) });
const chain = []; for (let x = e; x; x = x.cause) chain.push(x.message);
console.log(chain.join(' <- '));`,ans:`top <- mid <- root`,why:`The cause option chains errors so the original failure isn't lost when you wrap it with context at each layer.`}]}
]});
