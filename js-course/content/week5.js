/* Week 5: Engine, performance and modules — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js. */
JSC.registerWeek({w:5,revision:[
"<b>V8 tiers:</b> Ignition (bytecode + type feedback) → Sparkplug (baseline) → Maglev (mid-tier) → TurboFan (speculative peak). A failed assumption causes <b>deoptimization</b> back to bytecode.",
"<b>Shapes:</b> objects built the same way share a hidden class. Keep field order stable, initialize all fields up front, avoid <code>delete</code> and holes. Inline caches go monomorphic → polymorphic → megamorphic.",
"<b>GC:</b> reachability from roots, not reference counting. Young generation: fast parallel Scavenger. Old generation: concurrent/incremental Mark-Compact. You cannot force GC in browsers.",
"<b>Leaks</b> = unintended reachability: listeners, timers, closures, detached DOM, unbounded caches. Find with the 3-snapshot technique and the retainers path.",
"<b>Core Web Vitals (p75):</b> LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. Lab tools find causes; field data (CrUX/RUM) tells the truth.",
"<b>Debounce</b> waits for quiet; <b>throttle</b> limits rate; <b>virtualization</b> renders only visible rows; both timer helpers are closures.",
"<b>Tree-shaking</b> needs static ESM and side-effect-free modules (<code>\"sideEffects\": false</code>). CommonJS can't be shaken reliably.",
"<b>Loading:</b> <code>defer</code>/<code>module</code> keep order after parsing, <code>async</code> doesn't. <code>import()</code> splits code. Hash filenames for immutable caching.",
"<b>ESM</b> = static, async, live read-only bindings, strict, top-level await, evaluated once. <b>CJS</b> = dynamic <code>require</code>, copies of values, sync.",
"<b>Interop:</b> <code>import</code> of CJS gets <code>module.exports</code> as default; <code>require(esm)</code> works only for modules without top-level await; use the <code>exports</code> field for dual packages."
],days:[
{n:21,title:"Inside V8",goal:"Know how an engine turns JavaScript into fast machine code, and what makes it slow down.",topics:[
{id:"d21-v8",title:"How V8 runs your code",
eli5:`<p>Learning a recipe: the first time you cook it, you <b>read each step slowly</b> (interpreter). If you make it every week, you <b>memorize it</b> so it goes faster (compiler). If you make it every day, you <b>set up an assembly line</b> that assumes the ingredients are always the same (optimizing compiler). But the day someone swaps sugar for salt, the assembly line breaks and you go back to reading the recipe (deoptimization).</p>`,
why:`<p>JavaScript is dynamic: any variable can change type at any time. Naively that is very slow. Engines solve it with <b>just-in-time (JIT) compilation</b> that watches the code run, guesses types, and generates fast machine code for the guess, with a safety net.</p>`,
tech:`<p>V8 (Chrome, Edge, Node, Deno) has four tiers:</p><ol><li><b>Ignition</b>: parses to an AST and then <b>bytecode</b>, interprets it, and collects <b>type feedback</b> (which types/shapes each operation saw).</li><li><b>Sparkplug</b> (2021): a very fast baseline compiler that turns bytecode into machine code without optimization.</li><li><b>Maglev</b> (2023): a mid-tier optimizing compiler, quick to compile, uses feedback for moderate speedups.</li><li><b>TurboFan</b>: the top-tier optimizer; slower to compile, produces the fastest code using <b>speculative optimization</b> (inlining, type specialization, escape analysis).</li></ol>
<ul class="pts"><li><b>Tier-up</b> happens when a function becomes hot (call counts, loop iterations, feedback stability). Exact thresholds are internal and change between versions; treat published numbers (for example tens, hundreds and thousands of invocations) as illustrative.</li><li><b>Deoptimization:</b> optimized code has guards (for example "the argument is a small integer"). When a guard fails, V8 discards that machine code and returns to the interpreter, then may re-optimize later with updated feedback.</li><li>Startup tricks: <b>lazy parsing</b> (the preparser only checks syntax of functions not yet called), <b>code caching</b> across loads, bytecode flushing for cold functions.</li><li><b>WebAssembly</b> bypasses much of this: it is validated and compiled directly with predictable performance.</li><li>Other engines have the same idea: SpiderMonkey (Baseline + Ion), JavaScriptCore (LLInt, Baseline, DFG, FTL).</li></ul>`,
diagram:{html:flow([["Source → Parser","AST"],["Ignition","bytecode interpreter + feedback","w"],["Sparkplug","baseline machine code"],["Maglev","mid-tier optimized","g"],["TurboFan","peak, speculative","g"]])+`<p style="text-align:center;margin:10px 0 0">hot ↑ &nbsp;&nbsp; guard fails → <b>deoptimize</b> ↓ back to bytecode</p>`,steps:["Every function starts in the interpreter, which is quick to start and records which types it sees.","Frequently run code is compiled to machine code by progressively smarter compilers.","TurboFan assumes the observed types will continue and inserts cheap guard checks.","If a surprise type arrives, the guard fails, the optimized code is thrown away (deopt) and execution resumes in the interpreter."]},
ex:[{t:"Watching the engine (Node, shown as reference)",code:`// Node.js flags for V8 internals
node --trace-opt --trace-deopt app.js        // log optimizations and deopts
node --allow-natives-syntax app.js           // enables %-intrinsics for experiments

// in app.js (experiments only, never ship):
function add(a, b){ return a + b; }
for (let i = 0; i < 1e6; i++) add(i, 1);     // numbers only: stable feedback
console.log(%GetOptimizationStatus(add));    // bit flags: is it optimized?
add("a", "b");                               // new types: may cause a deopt`,run:false,note:"Chrome has similar tools: DevTools Performance panel (JIT/GC activity) and <code>chrome://tracing</code>."},
{t:"Type-stable vs type-unstable code (conceptual)",code:`// Friendly to the optimizer: same types every call, same object shapes
function distance(p){ return Math.hypot(p.x, p.y); }
distance({ x: 1, y: 2 });
distance({ x: 3, y: 4 });

// Hostile: the same function sees many shapes and types
distance({ x: 1, y: 2 });
distance({ y: 2, x: 1 });         // different property order, different shape
distance({ x: "1", y: 2 });       // string instead of number
distance({ x: 1, y: 2, z: 3 });   // extra property, yet another shape
console.log("see the next topic for why shapes matter");`}],
browser:`<p>The engine runs on the main thread (JIT compilation itself uses background threads). Large JavaScript bundles cost <b>parse and compile time</b> on slow phones even before your code runs; ship less JS, use code splitting and the <code>Cache-Control</code> + code cache. In DevTools Performance, "Compile Script", "Parse" and "Evaluate Script" show this cost.</p>`,
gotchas:[`Microbenchmarks in the console often measure the interpreter or warm-up, not realistic optimized speed; benchmark real workloads with warm-up and many iterations.`,`Optimized code can be slower than expected if it deoptimizes repeatedly ("deopt loops").`,`<code>try/catch</code>, <code>arguments</code> and <code>eval</code> are no longer the blanket "deoptimizers" old blog posts claim; check current V8 behavior instead of folklore.`,`Premature micro-optimization hurts readability; measure first.`,`Thresholds and tier names change between V8 versions; rely on the concepts.`],
best:[`Write boring, type-consistent code; keep object shapes uniform; avoid reshaping objects after creation.`,`Reduce shipped JavaScript; measure with real devices and the Performance panel before optimizing.`],
iq:[["mid","Is JavaScript interpreted or compiled?","Both: V8 interprets bytecode first (Ignition) and JIT-compiles hot functions to machine code (Sparkplug, Maglev, TurboFan)."],["senior","What is deoptimization?","When assumptions made by optimized code (types, shapes) are violated, V8 discards the optimized code and falls back to the interpreter, possibly re-optimizing later."],["senior","Why does feeding a function different types hurt?","The optimizer specializes for observed types; polymorphic or megamorphic feedback produces slower generic code or triggers deopts."],["architect","How do you reduce JS startup cost?","Ship less code (tree-shaking, code splitting), defer non-critical scripts, avoid big synchronous initialization, use code caching/long-lived caching with hashed filenames, and move work off the main thread."]],
practice:[`Run a hot function with <code>--trace-opt --trace-deopt</code> and cause a deopt by changing the argument type.`,`Compare parse/compile time of a large bundle in the DevTools Performance panel on a throttled CPU.`],
teach:`<p>"V8 first reads your code slowly, watches what happens, then compiles the frequently-used parts into fast machine code that assumes the types stay the same. If they change, it throws that fast code away and starts again."</p>`},

{id:"d21-shapes",title:"Hidden classes and inline caches",
eli5:`<p>Imagine labeled lunchboxes. If every lunchbox has the sandwich on the left and the apple on the right, you can grab the apple without looking. If every lunchbox is packed differently, you must open each one and search. A <b>hidden class</b> is "this is the standard lunchbox layout"; an <b>inline cache</b> is your memory that "apples are on the right".</p>`,
why:`<p>Objects are dictionaries in theory (property name → value), and a hash lookup for every <code>obj.x</code> would be slow. V8 instead gives objects with the same layout a shared <b>hidden class</b> (a "Map"/shape) so property access becomes a fixed memory offset.</p>`,
tech:`<ul class="pts"><li>Every object points to a <b>hidden class</b> describing its property names and offsets. Adding a property creates a <b>transition</b> to a new hidden class. Objects created the same way (same properties, <b>same order</b>) share one.</li><li><b>Inline caches (IC)</b> sit at each property-access site in the bytecode and remember the shape(s) seen and the offsets: <b>monomorphic</b> (1 shape) is fastest, <b>polymorphic</b> (2–4) slower, <b>megamorphic</b> (many) falls back to a slow generic lookup.</li><li><b>Dictionary mode:</b> <code>delete</code> on a property, adding many properties dynamically, or very large objects can switch an object to a slow hash-table representation.</li><li><b>Array element kinds:</b> V8 tracks <code>PACKED_SMI</code> (small integers) → <code>PACKED_DOUBLE</code> → <code>PACKED</code> (anything) and <code>HOLEY_*</code> variants. Transitions are one-way (they never go back), and holey arrays need extra hole checks.</li><li><b>Smi vs HeapNumber:</b> small integers are stored unboxed; doubles are boxed on the heap (with optimizations in optimized code).</li><li>Classes and constructors help: they initialize fields in a fixed order, giving a stable shape.</li></ul>`,
diagram:{html:flow([["{}","shape S0"],["+ x","S1 {x}","w"],["+ y","S2 {x,y}","w"]])+flow([["{}","shape S0"],["+ y","S3 {y}","r"],["+ x","S4 {y,x} (different!)","r"]]),steps:["Each added property moves the object along a transition tree of shapes.","Objects with the same property history end at the same shape and are accessed with the same fast path.","Adding the same properties in a different order creates a different shape, so call sites that see both become polymorphic.","Too many shapes at one site makes it megamorphic and slow."]},
ex:[{t:"Observable consequences (runnable)",code:`const a = { x: 1, y: 2 };
const b = { y: 2, x: 1 };
console.log(Object.keys(a).join(), "|", Object.keys(b).join(), "| JSON equal:", JSON.stringify(a) === JSON.stringify(b));
class Point { constructor(x, y){ this.x = x; this.y = y; } }   // same shape for every instance
const pts = Array.from({ length: 3 }, (_, i) => new Point(i, i * 2));
console.log(pts.map((p) => Object.keys(p).join()).join(" "));
const arr = [1, 2, 3];
arr[10] = 4;                                   // creates holes: array becomes HOLEY
console.log(arr.length, 3 in arr, arr.indexOf(undefined), arr.includes(undefined));`},
{t:"Checking shapes in Node (reference)",code:`// node --allow-natives-syntax shapes.js
const a = { x: 1, y: 2 };
const b = { x: 3, y: 4 };
const c = { y: 5, x: 6 };
console.log(%HaveSameMap(a, b));   // true  (same properties, same order)
console.log(%HaveSameMap(a, c));   // false (different order = different hidden class)
delete a.x;                        // may switch a to slow dictionary mode
console.log(%HasFastProperties(a));`,run:false}],
gotchas:[`<code>delete obj.prop</code> on hot objects can trigger dictionary mode; set to <code>undefined</code> or use <code>Map</code>.`,`Conditional property addition (<code>if (x) this.a = 1; else this.b = 2;</code>) gives instances different shapes.`,`Creating arrays with <code>new Array(n)</code> makes them holey; prefer <code>[]</code> + push or <code>Array.from</code>.`,`Mixing integers and doubles transitions the elements kind permanently; mixing in other types goes to generic PACKED.`,`Don't over-apply this: it matters in hot code paths, not in typical app code. Profile first.`],
best:[`Initialize all properties in the constructor in the same order; use classes for hot data objects.`,`Keep arrays homogeneous and dense; avoid <code>delete</code> and holes; use Map for dynamic keys.`],
iq:[["senior","What are hidden classes?","V8's internal shape descriptors (Maps) shared by objects created with the same properties in the same order, enabling fast offset-based property access."],["senior","Monomorphic vs polymorphic vs megamorphic?","Property-access sites that have seen 1 shape, a few shapes, or many; speed degrades in that order."],["architect","How do you design data structures with the engine in mind?","Stable shapes (fixed fields in constructors), no deletes, homogeneous arrays, avoid megamorphic call sites for hot paths, benchmark with realistic data, and move to typed arrays/WASM for numeric kernels."]],
practice:[`Write two versions of a hot loop: one over uniform objects, one over objects with randomly ordered keys; compare with a benchmark (many iterations, warm-up first).`],
teach:`<p>"Objects built the same way share a layout, like identical lunchboxes, so the engine can grab properties instantly. Packing them differently or throwing items out mid-way makes it search every time."</p>`}
],quiz:[
{code:`const a = { x: 1, y: 2 }, b = { y: 2, x: 1 };
console.log(Object.keys(a).join(), Object.keys(b).join(), JSON.stringify(a) === JSON.stringify(b));`,ans:`x,y y,x false`,why:`Same data, different insertion order: the objects have different hidden classes, and their key order and JSON text differ.`},
{code:`const arr = [1, 2, 3]; arr[10] = 4;
console.log(arr.length, 3 in arr, arr.indexOf(undefined), arr.includes(undefined));`,ans:`11 false -1 true`,why:`Index 3 is a hole. indexOf skips holes (no match), includes treats holes as undefined. Holey arrays are also slower internally.`}]},

{n:22,title:"Memory",goal:"Understand how memory is reclaimed and how to find and fix leaks in real applications.",topics:[
{id:"d22-gc",title:"Garbage collection",
eli5:`<p>Imagine a kid's room full of toys. A janitor walks in and asks: <b>"which toys can the kid still reach starting from their hands and the toy shelf?"</b> Every toy that can't be reached from anywhere (lost under the bed, no string attached to it) is thrown away. Toys tied together in a loop but unreachable from the kid also go. That's garbage collection: reachability, not counting who likes which toy.</p>`,
why:`<p>JavaScript has no <code>free()</code>. The engine automatically reclaims memory for objects your program can no longer reach, so you avoid manual memory bugs, but you still control <i>what stays reachable</i>.</p>`,
tech:`<ul class="pts"><li><b>Reachability:</b> a value is alive if it can be reached from a <b>root</b> (global object, current call stack variables, active closures' scopes, registers, DOM-held references). Everything else is garbage, including cycles. (Reference counting, which can't free cycles, is not used.)</li><li><b>Mark-and-sweep:</b> mark everything reachable from roots, then free the rest. <b>Mark-compact</b> also moves survivors together to fight fragmentation.</li><li><b>Generational hypothesis:</b> most objects die young. V8's heap splits into a <b>young generation</b> (small "nursery" and "intermediate" semi-spaces) collected frequently by the <b>Scavenger</b> (a parallel, copying collector, very fast), and an <b>old generation</b> collected less often by <b>Mark-Compact</b>. Objects surviving a couple of scavenges are promoted.</li><li><b>Orinoco</b> (V8's modern GC) reduces pauses with <b>parallel</b> (several threads at once), <b>incremental</b> (small slices) and <b>concurrent</b> (background thread while JS runs) techniques: concurrent marking and sweeping, parallel scavenging and compaction.</li><li>You cannot trigger GC from page code. Node with <code>--expose-gc</code> allows <code>global.gc()</code> for experiments; DevTools has a trash-can button.</li><li><b>Weak references:</b> <code>WeakMap</code>/<code>WeakSet</code> don't keep keys alive. <code>WeakRef</code> and <code>FinalizationRegistry</code> are optional; their timing is unpredictable and may never run, so never rely on them for correctness.</li><li>Large <code>ArrayBuffer</code> memory lives outside the JS heap but is tied to GC of its wrapper object.</li></ul>`,
diagram:{html:flow([["Roots","global, stack, closures"],["mark reachable","A → B → C","g"],["unreachable","D ⇄ E (cycle), F","r"],["sweep","D, E, F freed","r"]])+lanes([["Young generation",["new objects","Scavenger: fast, frequent","survivors move on"]],["Old generation",["long-lived objects","Mark-Compact: concurrent + incremental","less frequent"]]]),steps:["The collector starts from the roots and follows every reference, marking what it finds.","Unmarked objects are unreachable, even if they reference each other (cycles don't keep themselves alive).","New objects are collected cheaply in the young generation; the survivors are promoted to the old generation.","Work is spread across threads and slices so the main thread pauses only briefly."]},
ex:[{t:"A tiny mark-and-sweep simulator (runnable)",code:`function collect(roots, heap){
  const marked = new Set();
  const stack = [...roots];
  while (stack.length) {
    const n = stack.pop();
    if (marked.has(n)) continue;
    marked.add(n);
    for (const r of heap[n].refs) stack.push(r);
  }
  return Object.keys(heap).filter((n) => !marked.has(n));
}
const heap = {
  A: { refs: ["B"] }, B: { refs: ["C"] }, C: { refs: [] },
  D: { refs: ["E"] }, E: { refs: ["D"] },     // a cycle nobody can reach
  F: { refs: [] }
};
console.log("garbage:", collect(["A"], heap));
heap.A.refs.push("D");                          // now D is reachable again
console.log("garbage after linking A -> D:", collect(["A"], heap));`},
{t:"Weak references",code:`const cache = new WeakMap();
let key = { id: 1 };
cache.set(key, "metadata");
console.log(cache.has(key), typeof WeakRef, typeof FinalizationRegistry);
const ref = new WeakRef(key);
console.log(ref.deref() === key);        // still reachable via 'key'
try { for (const x of cache) {} } catch (e) { console.log(e.name, "- WeakMap is not iterable"); }`}],
browser:`<p>Chrome DevTools: the <b>Performance</b> panel's memory checkbox shows the heap sawtooth (growth then drops at GC); <b>Memory</b> panel takes heap snapshots; the trash can button forces a GC. Node: <code>process.memoryUsage()</code> reports <code>heapUsed</code>; <code>--max-old-space-size</code> sets the old-space limit. Browser tabs may be killed under memory pressure.</p>`,
gotchas:[`"I set it to null, so it's freed" is only true if nothing else references the object.`,`Closures keep the entire captured context chain alive.`,`GC pauses can still cause jank: allocate less in hot paths (reuse objects/typed arrays in animation loops).`,`<code>WeakRef.deref()</code> may return undefined at any time after the object becomes unreachable; <code>FinalizationRegistry</code> callbacks may not run.`,`A growing heap graph with a saw-tooth is normal; a staircase that never drops is a leak.`],
best:[`Don't try to outsmart the GC; reduce allocations in hot loops, scope variables tightly, and drop references to big data when done.`,`Use WeakMap/WeakSet to attach metadata without leaking.`],
iq:[["mid","How does JavaScript garbage collection work?","Automatic memory management by reachability: objects reachable from roots stay, others are reclaimed (mark-and-sweep/compact)."],["senior","Explain generational GC in V8.","Young generation collected often with a fast parallel copying Scavenger; survivors promote to the old generation, collected less often with concurrent, incremental Mark-Compact."],["senior","Why isn't reference counting used?","It can't collect cycles and costs on every assignment; tracing collectors handle cycles and have better throughput."]],
practice:[`Take a heap snapshot before and after an action in a small app and compare object counts.`,`Extend the simulator with a young/old generation.`],
teach:`<p>"The janitor keeps every toy you can still reach from your hands or the shelf and throws away the rest, even toys tangled together in a loop. You can't tell the janitor when to come, but you decide what stays reachable."</p>`},

{id:"d22-leaks",title:"Memory leaks and how to find them",
eli5:`<p>A leak is a balloon you forgot you were holding by a string: it floats there forever, so the janitor thinks you still want it. Common strings: <b>a timer that never stops</b>, <b>a listener nobody removed</b>, <b>a notebook that only ever gets longer</b>, and <b>a photo of a page you already closed</b>.</p>`,
why:`<p>In a long-lived single-page app, small leaks per navigation add up to slow, janky or crashing tabs. A leak is not "memory not freed" but <b>memory still reachable that you no longer need</b>.</p>`,
tech:`<table><tr><th>Cause</th><th>Why it leaks</th><th>Fix</th></tr><tr><td>Event listeners on long-lived targets</td><td>listener closure keeps component state alive</td><td><code>removeEventListener</code> / <code>{signal}</code></td></tr><tr><td>Timers/intervals/rAF</td><td>callback + closure retained until cleared</td><td><code>clearInterval</code> in teardown</td></tr><tr><td>Detached DOM nodes</td><td>JS variable references nodes removed from the document</td><td>null the reference, use WeakRef/WeakMap</td></tr><tr><td>Unbounded caches/arrays/Maps</td><td>grow forever</td><td>LRU/size limits, WeakMap for object keys</td></tr><tr><td>Closures capturing big objects</td><td>whole scope retained</td><td>capture only what you need</td></tr><tr><td>Accidental globals</td><td>root references never die</td><td>strict mode/modules</td></tr><tr><td>Observers/subscriptions not disconnected</td><td>subscriber list holds callbacks</td><td><code>disconnect()</code>/unsubscribe</td></tr><tr><td>Promises that never settle</td><td>pending reactions keep closures alive</td><td>timeouts, AbortSignal</td></tr></table>
<h5>Finding leaks (Chrome DevTools)</h5><ol><li><b>Performance monitor</b>: watch JS heap size, DOM nodes and event listeners climb after repeating an action.</li><li><b>Three-snapshot technique:</b> take snapshot 1, perform the action, take snapshot 2, perform it again, take snapshot 3. In snapshot 3 choose "Objects allocated between Snapshot 1 and 2"; objects still present are suspects.</li><li>Filter by <b>"Detached"</b> to find nodes not in the document; open the <b>Retainers</b> panel to see the reference chain that keeps an object alive.</li><li><b>Allocation instrumentation on timeline</b> / sampling profiler shows what allocates and what survives.</li><li>Node: <code>node --inspect</code> + DevTools, <code>process.memoryUsage()</code>, <code>v8.writeHeapSnapshot()</code>, <code>--heapsnapshot-near-heap-limit</code>.</li></ol>`,
diagram:{html:flow([["Snapshot 1","baseline"],["do action","open/close modal"],["Snapshot 2"],["do action again"],["Snapshot 3","compare 1→2 survivors","w"],["Retainers path","who still holds it?","r"]]),steps:["Take a baseline snapshot after warm-up so one-time allocations don't mislead you.","Repeat the suspicious action and snapshot again; leaked objects accumulate each time.","Use the comparison view to find classes that keep growing.","Open an object's retainers to see the chain from a root (a listener, a global, a timer) that keeps it alive, then break that link."]},
ex:[{t:"Bounded cache (LRU) vs unbounded growth (runnable)",code:`class LRU {
  constructor(max){ this.max = max; this.map = new Map(); }
  get(k){ if (!this.map.has(k)) return undefined; const v = this.map.get(k); this.map.delete(k); this.map.set(k, v); return v; }
  set(k, v){ this.map.delete(k); this.map.set(k, v); if (this.map.size > this.max) this.map.delete(this.map.keys().next().value); }
}
const unbounded = new Map(), lru = new LRU(100);
for (let i = 0; i < 10000; i++) { unbounded.set("k" + i, { i }); lru.set("k" + i, { i }); }
console.log("unbounded size:", unbounded.size, "| LRU size:", lru.map.size, "| oldest evicted:", lru.get("k0") === undefined);`},
{t:"Listener cleanup with AbortController (runnable, counts via a wrapper)",code:`const target = new EventTarget();
let active = 0;
const origAdd = target.addEventListener.bind(target);
function mount(){
  const ac = new AbortController();
  active++;
  ac.signal.addEventListener("abort", () => active--);
  origAdd("tick", () => { /* holds component state */ }, { signal: ac.signal });
  return () => ac.abort();                // teardown removes the listener
}
const unmounts = Array.from({ length: 5 }, mount);
console.log("mounted components:", active);
unmounts.forEach((u) => u());
console.log("after teardown:", active);`},
{t:"The classic leaks (what NOT to write, browser)",code:`// 1. interval never cleared
function startPolling(){ setInterval(() => refresh(bigData), 1000); }
// 2. listener on window never removed
function mountWidget(){ window.addEventListener("resize", () => draw(bigData)); }
// 3. DOM node kept in a long-lived variable after removal
const cache = []; function show(){ const el = document.createElement("div"); cache.push(el); document.body.append(el); el.remove(); }`,run:false}],
gotchas:[`<code>console.log(obj)</code> keeps objects alive while DevTools is open; test with the console closed or log strings.`,`A "leak" in a single snapshot may just be cache warm-up; always compare repeated actions.`,`Frameworks usually clean up for you, except what you attach manually to <code>window</code>, <code>document</code>, timers, observers or third-party libraries.`,`Detached DOM nodes retained by a closure can keep entire subtrees alive.`,`Large <code>ArrayBuffer</code>/<code>Blob</code> and object URLs (<code>URL.createObjectURL</code>) need explicit <code>revokeObjectURL</code>.`],
best:[`Pair every subscribe/addEventListener/setInterval/observe with a teardown; use <code>AbortController</code> for listeners.`,`Bound caches (LRU, TTL); prefer WeakMap for per-object metadata.`,`Add memory checks to long-running e2e tests (repeat navigation 50 times and compare heap).`],
iq:[["mid","Name common causes of memory leaks in JS.","Forgotten timers and listeners, detached DOM nodes, unbounded caches, closures holding large data, accidental globals, un-disconnected observers."],["senior","How do you find a memory leak?","Reproduce in a loop, use the Performance monitor to confirm growth, take heap snapshots (three-snapshot technique), look at objects allocated between snapshots, check Detached nodes, then read the Retainers path to find what holds them."],["architect","How do you prevent leaks across a large SPA?","Lifecycle conventions (every effect has cleanup), AbortController signals, bounded caches, lint rules, automated heap-growth regression tests in CI, and production monitoring of memory trends."]],
practice:[`Create a leaky page (interval + detached nodes), find it with snapshots, and fix it.`,`Write a <code>createSubscriptions()</code> helper that tracks cleanups and disposes them all at once.`],
teach:`<p>"A leak isn't lost memory; it's memory you can still reach by accident: a timer you forgot to stop, a listener nobody removed, a list that only grows. Find it by comparing snapshots and following the retainer chain."</p>`}
],quiz:[
{code:`const wm = new WeakMap();
try { for (const x of wm) {} } catch (e) { console.log(e.name); }`,ans:`TypeError`,why:`WeakMap is deliberately not iterable: its entries can disappear whenever GC runs, so enumeration would be non-deterministic.`},
{code:`function f(){ const big = new Array(1e6).fill(0); return () => big.length; }
const g = f();
console.log(g());`,ans:`1000000`,why:`The returned closure references big, so the whole array stays alive for as long as g is reachable. This is how closures can retain large data.`}]},

{n:23,title:"Performance",goal:"Measure real user experience, find the actual bottleneck, and apply the right pattern.",topics:[
{id:"d23-vitals",title:"Core Web Vitals and profiling",
eli5:`<p>Web Vitals are three questions a visitor silently asks: <b>"Did the main thing show up fast?"</b> (LCP), <b>"When I tap, does it react right away?"</b> (INP), and <b>"Does the page stay still instead of jumping around?"</b> (CLS). A stopwatch in your lab only tells part of the truth; asking real visitors gives the real answer.</p>`,
why:`<p>Performance is user experience and business outcome. Google uses Core Web Vitals as search signals, and they correlate with conversion. You can't improve what you don't measure on real devices.</p>`,
tech:`<table><tr><th>Metric</th><th>Measures</th><th>Good (p75)</th><th>Poor</th><th>Typical causes</th></tr><tr><td>LCP</td><td>loading: when the largest element is painted</td><td>≤ 2.5 s</td><td>&gt; 4 s</td><td>slow TTFB, render-blocking CSS/JS, huge hero image, client-only rendering</td></tr><tr><td>INP</td><td>responsiveness: latency of interactions across the visit (replaced FID on 12 March 2024)</td><td>≤ 200 ms</td><td>&gt; 500 ms</td><td>long tasks, heavy event handlers, hydration, large DOM</td></tr><tr><td>CLS</td><td>visual stability: unexpected layout shifts</td><td>≤ 0.1</td><td>&gt; 0.25</td><td>images/ads without dimensions, late fonts, injected banners</td></tr></table>
<ul class="pts"><li><b>Field data</b> (real users): CrUX (Chrome UX Report), Search Console, and your own <b>RUM</b> with the <code>web-vitals</code> library; scores are judged at the <b>75th percentile</b>. <b>Lab data</b> (Lighthouse, WebPageTest, DevTools) is reproducible and great for debugging but is a single synthetic run.</li><li><b>Profiling workflow:</b> record in DevTools Performance with CPU throttling (4x/6x) and network throttling; look for <b>long tasks</b> (&gt;50 ms, red corners), expand the flame chart, use the Bottom-Up/Call Tree tabs to find self-time hot spots; the <b>Long Animation Frames</b> API attributes jank to scripts; the Network panel shows the waterfall and priorities.</li><li><b>Budgets:</b> set limits for JS size, LCP, INP and enforce in CI (Lighthouse CI).</li></ul>`,
diagram:{html:lanes([["LCP: loaded?",["server fast (TTFB)","critical CSS inline","hero image preloaded"]],["INP: responsive?",["no long tasks","small event handlers","less hydration work"]],["CLS: stable?",["width/height on images","reserve ad space","font-display swap + size-adjust"]]]),steps:["Pick the failing metric from field data first; don't optimize blindly.","Reproduce in the lab with throttling; use the Performance panel to find the cause.","Fix the biggest contributor, ship, and confirm the improvement in field data (it takes about 28 days to fully show in CrUX)."]},
ex:[{t:"Classify metrics against the thresholds (runnable)",code:`const T = { LCP: [2500, 4000], INP: [200, 500], CLS: [0.1, 0.25] };
const classify = (metric, value) => {
  const [good, poor] = T[metric];
  return value <= good ? "good" : value <= poor ? "needs improvement" : "poor";
};
console.log(classify("LCP", 2400), "|", classify("LCP", 3200), "|", classify("INP", 650), "|", classify("CLS", 0.08), "|", classify("CLS", 0.3));
console.log("long-task and shift observers supported here:",
  PerformanceObserver.supportedEntryTypes.includes("longtask"),
  PerformanceObserver.supportedEntryTypes.includes("layout-shift"),
  PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint"));`},
{t:"Measuring in the field (browser)",code:`import { onLCP, onINP, onCLS } from "web-vitals";
function send(metric){
  navigator.sendBeacon("/analytics", JSON.stringify({ name: metric.name, value: metric.value, id: metric.id, page: location.pathname }));
}
onLCP(send); onINP(send); onCLS(send);

// Raw API: observe long tasks
new PerformanceObserver((list) => list.getEntries().forEach((e) => console.log("long task", e.duration)))
  .observe({ type: "longtask", buffered: true });`,run:false}],
gotchas:[`Lighthouse scores aren't the Core Web Vitals; they are lab estimates. Pages can pass Lighthouse and fail in the field.`,`INP considers all interactions in a visit, not just the first; it's dominated by main-thread work after input.`,`CLS from late-loading fonts or images below the fold still counts when it shifts visible content.`,`Throttle CPU: your dev machine is much faster than the median phone.`,`Optimizing the lab metric while ignoring the field regression is a classic mistake.`],
best:[`Collect RUM, segment by device/network/route, and prioritize the worst p75.`,`Optimize LCP resource discovery (preload, fetchpriority="high"), break up long tasks, reserve space for media.`,`Set and enforce performance budgets in CI.`],
iq:[["mid","What are Core Web Vitals?","LCP (loading), INP (responsiveness), CLS (visual stability), measured in the field at the 75th percentile with good thresholds of 2.5 s, 200 ms and 0.1."],["senior","How do you debug a poor INP?","Reproduce the slow interaction with CPU throttling, record a Performance profile, find the long task after input, break it up (yield), reduce handler and rendering work, defer non-critical work, and verify with field data."],["architect","How would you set up a performance program?","RUM for Web Vitals + business metrics, dashboards by route/device, budgets and Lighthouse CI gates, ownership per team, regression alerts, and periodic profiling of key journeys."]],
practice:[`Add the <code>web-vitals</code> library to a demo page and log the three metrics.`,`Record a Performance trace with 4x CPU throttling and identify the longest task.`],
teach:`<p>"Three visitor questions: did the main thing appear fast, does it react when I tap, does it stay still. Measure with real users, find the cause with a profiler, fix the biggest piece, and check again."</p>`},

{id:"d23-patterns",title:"Performance patterns: debounce, throttle, virtualization",
eli5:`<p><b>Debounce</b> is an elevator door that waits until people stop walking in before it closes. <b>Throttle</b> is a ticket machine that gives out at most one ticket per second no matter how many people press the button. <b>Virtualization</b> is a window onto a long scroll: you only paint what's visible through the window, not the whole scroll.</p>`,
why:`<p>Events like <code>input</code>, <code>scroll</code> and <code>resize</code> fire dozens of times per second. Running expensive work each time wastes CPU and hurts responsiveness. These patterns limit how often or how much work is done.</p>`,
tech:`<ul class="pts"><li><b>Debounce(fn, ms):</b> run only after calls have stopped for <code>ms</code>. Use for search-as-you-type, autosave, resize end. Variants: leading edge, trailing edge, <code>cancel()</code>, <code>flush()</code>.</li><li><b>Throttle(fn, ms):</b> run at most once per <code>ms</code>. Use for scroll position, mouse move, rate-limited analytics. Prefer <code>requestAnimationFrame</code> for visual updates.</li><li><b>Virtualization (windowing):</b> render only rows in the viewport (+ overscan) using fixed or measured heights and a spacer for the total height. Libraries: TanStack Virtual, react-window; or native <code>content-visibility: auto</code>.</li><li><b>Other patterns:</b> lazy-load images/routes, <code>requestIdleCallback</code> for low-priority work, batching DOM writes, caching (HTTP cache, stale-while-revalidate), image formats (AVIF/WebP) and <code>srcset</code>, <code>preload</code>/<code>prefetch</code>, Web Workers for CPU work, memoization.</li><li><b>Cancel stale work:</b> pair debounce with <code>AbortController</code> so late responses can't overwrite fresh ones.</li></ul>`,
diagram:{html:lanes([["Debounce",["events: x x x x . . . run","runs once after quiet"]],["Throttle",["events: x x x x x x x x","run: ^ . . ^ . . ^","at most once per interval"]],["Virtualization",["100,000 rows in data","~30 rows in the DOM","scroll → swap rows"]]]),steps:["Debounce delays until activity stops, so a burst becomes a single call.","Throttle allows a steady trickle during the burst.","Virtualization keeps DOM size constant regardless of data size, so layout and memory stay cheap."]},
ex:[{t:"debounce and throttle from scratch (runnable)",code:`const debounce = (fn, ms) => { let t; const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; d.cancel = () => clearTimeout(t); return d; };
const throttle = (fn, ms) => { let last = 0; return (...a) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...a); } }; };
let d = 0, t = 0;
const deb = debounce(() => d++, 20), thr = throttle(() => t++, 20);
for (let i = 0; i < 5; i++) { deb(); thr(); }                 // a burst of 5 calls
setTimeout(() => console.log("after burst: debounced ran", d, "| throttled ran", t), 60);`},
{t:"Windowing math for virtualization (runnable)",code:`function visibleRange({ scrollTop, rowHeight, viewportHeight, total, overscan = 3 }){
  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const last = Math.min(total - 1, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan);
  return { first, last, rendered: last - first + 1, spacerTop: first * rowHeight, totalHeight: total * rowHeight };
}
console.log(visibleRange({ scrollTop: 0, rowHeight: 40, viewportHeight: 400, total: 100000 }));
console.log(visibleRange({ scrollTop: 40000, rowHeight: 40, viewportHeight: 400, total: 100000 }));`}],
gotchas:[`Debounced handlers lose their last <code>this</code>/arguments if you don't forward them; arrow functions capture the wrong <code>this</code> (use a regular function if you need the caller's <code>this</code>).`,`Debouncing search too long makes the UI feel laggy (150–300 ms is typical); throttling scroll for visuals is worse than using rAF.`,`Virtualized lists break Ctrl+F, accessibility (use proper roles/aria-rowcount) and variable heights unless measured.`,`Creating a new debounced function on every render (in UI frameworks) defeats it; create it once.`,`Time-based throttle uses <code>Date.now()</code>, which can jump if the clock changes; use <code>performance.now()</code>.`],
best:[`Debounce input-driven requests and cancel stale ones; throttle or rAF scroll/resize visuals; virtualize lists over a few hundred rows.`,`Measure first; native CSS (<code>content-visibility</code>, <code>contain</code>, <code>loading="lazy"</code>) is often enough.`],
iq:[["mid","Debounce vs throttle?","Debounce runs after a burst ends (once); throttle runs at a fixed maximum rate during the burst."],["mid","Implement debounce.","Keep a timer in a closure; on each call clear it and set a new timeout to call fn with the latest args after the delay; add cancel."],["senior","How would you render a 100,000-row table?","Virtualize: compute the visible window from scroll position and row height, render those rows with a spacer for total height, reuse DOM nodes, keep data outside the DOM, add keyboard/ARIA support."]],
practice:[`Add leading/trailing options to your debounce and a <code>flush()</code> method.`,`Build a fixed-height virtual list in plain DOM that renders 30 rows for 100,000 items.`],
teach:`<p>"Debounce waits until the noise stops. Throttle allows one per tick. Virtualization paints only the rows you can see. All three do less work for the same user experience."</p>`}
],quiz:[
{code:`const T = { LCP: [2500, 4000], INP: [200, 500], CLS: [0.1, 0.25] };
const classify = (m, v) => v <= T[m][0] ? "good" : v <= T[m][1] ? "needs improvement" : "poor";
console.log(classify("LCP", 2500), classify("INP", 201), classify("CLS", 0.26));`,ans:`good needs improvement poor`,why:`Thresholds are inclusive at "good": 2500 ms is still good, 201 ms is just over, and 0.26 exceeds the 0.25 "poor" line.`},
{code:`const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
let calls = 0;
const d = debounce(() => calls++, 20);
d(); d(); d();
setTimeout(() => console.log(calls), 60);`,ans:`1`,why:`Each call resets the timer; only the last one runs after 20 ms of quiet.`}]},

{n:24,title:"Bundling and loading",goal:"Understand what bundlers do, why tree-shaking works, and how to load code in the right order and size.",topics:[
{id:"d24-bundling",title:"Bundling and tree-shaking",
eli5:`<p>Imagine moving house. You have thousands of loose items (files). A <b>bundler</b> packs them into a few labeled boxes (bundles) so the truck makes fewer trips. <b>Tree-shaking</b> is checking each box and throwing out the stuff you never use. <b>Minification</b> is vacuum-packing what's left.</p>`,
why:`<p>Browsers once needed few, small, compatible files. Modern code is split into hundreds of modules, written in new syntax and TypeScript/JSX, with npm packages. Bundlers transform and combine it into optimized assets for production (and give fast feedback in development).</p>`,
tech:`<ul class="pts"><li>A bundler builds a <b>module graph</b> from an entry point, transforms files (TypeScript, JSX, CSS), resolves imports, then <b>emits chunks</b> with <b>minification</b>, <b>content hashes</b> and <b>source maps</b>.</li><li><b>Tree-shaking</b> removes unused exports. It relies on <b>static</b> <code>import</code>/<code>export</code> (analyzable at build time) and on knowing modules are <b>side-effect free</b>: set <code>"sideEffects": false</code> (or a list) in <code>package.json</code>. CommonJS (<code>require</code>/<code>module.exports</code>) is dynamic, so it can't be shaken reliably.</li><li><b>Scope hoisting</b> (module concatenation) flattens modules into one scope to reduce wrapper overhead.</li><li><b>Code splitting</b> via dynamic <code>import()</code> and shared-chunk extraction.</li><li><b>Tooling (late 2026):</b> <b>Vite 8</b> uses Rolldown (Rust, Rollup-compatible) as its single bundler for dev and build; esbuild, Rollup, webpack, Parcel, Turbopack, Rspack are other options. Dev servers serve native ES modules and transform on demand.</li><li><b>Targets and polyfills:</b> <code>browserslist</code> decides how much syntax is down-leveled; ship modern code to modern browsers and only polyfill what you use.</li></ul>`,
diagram:{html:flow([["entry.js","imports a, b"],["module graph","parse + resolve","w"],["tree-shake","drop unused exports","r"],["split + minify + hash","app.8f2a.js, vendor.c1d9.js","g"],["dist/"]]),steps:["The bundler starts at your entry file and follows every <code>import</code> statically.","It builds a complete dependency graph and transforms files along the way.","Exports that nothing imports (and that have no side effects) are removed.","The result is split into hashed chunks so browsers can cache them forever and only refetch what changed."]},
ex:[{t:"A toy tree-shaker: which exports survive? (runnable)",code:`const modules = {
  "math.js":  { exports: ["add", "sub", "mul"], sideEffects: false },
  "utils.js": { exports: ["slug", "log"], sideEffects: true },       // log() runs on import
  "app.js":   { imports: { "math.js": ["add"], "utils.js": ["slug"] } }
};
function shake(mods, entry){
  const used = {};
  for (const [file, names] of Object.entries(mods[entry].imports)) used[file] = new Set(names);
  return Object.entries(mods).filter(([f]) => f !== entry).map(([file, m]) => ({
    file,
    kept: m.exports.filter((e) => used[file]?.has(e)),
    removed: m.exports.filter((e) => !used[file]?.has(e) && !m.sideEffects),
    module: used[file] ? "included" : "dropped"
  }));
}
console.log(shake(modules, "app.js"));`},
{t:"package.json and what blocks tree-shaking (reference)",code:`// package.json
{ "name": "my-lib", "type": "module", "sideEffects": false,
  "exports": { ".": { "import": "./dist/index.js", "require": "./dist/index.cjs" } } }

// Shakeable: named static exports
export const add = (a, b) => a + b;
export const mul = (a, b) => a * b;

// Hard to shake: dynamic access, CJS, side effects at top level
module.exports = { add, mul };
const fn = lib[someName];                 // dynamic property access
polyfill();                               // top-level side effect`,run:false}],
browser:`<p>Use the bundle analyzer (rollup-plugin-visualizer, webpack-bundle-analyzer, <code>source-map-explorer</code>) to see what's in your JS. Unminified, uncompressed size isn't what users download: check gzip/brotli sizes and the actual parse/execute cost. Watch for accidentally bundling a whole library for one function (<code>import _ from "lodash"</code> vs <code>import debounce from "lodash/debounce"</code> or <code>lodash-es</code>).</p>`,
gotchas:[`Barrel files (<code>index.js</code> that re-export everything) can defeat tree-shaking or slow dev servers if modules have side effects.`,`<code>"sideEffects": false</code> is a promise; if a module registers a global or imports CSS, mark it as having side effects or it may be dropped.`,`CommonJS dependencies and dynamic <code>require</code> bloat bundles.`,`Minification can break code relying on <code>Function.name</code> or <code>toString</code>.`,`Source maps in production can expose your source code; upload them to your error tracker instead of serving them publicly.`],
best:[`Prefer ESM-first libraries; import specific functions; analyze bundles in CI and set size budgets.`,`Use content hashes with long-lived <code>Cache-Control: immutable</code>; split vendor and app code sensibly.`,`Target modern browsers; avoid shipping unneeded polyfills.`],
iq:[["mid","What does a bundler do?","Resolves the module graph, transforms code (TS/JSX), combines modules into chunks, minifies, adds hashes and source maps, and can split code for lazy loading."],["senior","How does tree-shaking work and when does it fail?","It uses static analysis of ES module imports/exports to drop unused exports and side-effect-free modules. It fails with CommonJS, dynamic access, top-level side effects or incorrect sideEffects flags."],["architect","How would you keep bundle size from growing?","Budgets and CI checks (size-limit/Lighthouse CI), bundle analyzer reviews, lint rules against heavy imports, dependency review, dynamic imports for routes/features, and modern build targets."]],
practice:[`Analyze a real project bundle and remove the largest avoidable dependency.`,`Create a tiny library with named exports and prove unused functions are absent from a built app.`],
teach:`<p>"A bundler packs many files into a few boxes, throws away what you never use (tree-shaking), and vacuum-packs the rest. It can only throw things away if it can see clearly what's used, which is why static imports matter."</p>`},

{id:"d24-loading",title:"Script loading and code splitting",
eli5:`<p>Don't carry every book to class on day one. Bring the <b>books you need right now</b>, and fetch the others when the lesson needs them (<b>code splitting</b>). Tell the school ahead of time which books you'll probably want (<b>preload / prefetch</b>). And label each book with its edition number so you only buy it again when it changes (<b>content hashing</b>).</p>`,
why:`<p>Every kilobyte of JavaScript costs download, parse, compile and execute time. Loading only what the current screen needs, in the right order, is the biggest lever for fast first load.</p>`,
tech:`<ul class="pts"><li><b>Script tags:</b> classic (blocking), <code>defer</code> (parallel download, run after parsing in order), <code>async</code> (run when ready, unordered), <code>type="module"</code> (deferred, strict, own scope), <code>nomodule</code> (legacy fallback).</li><li><b>Dynamic <code>import()</code></b> returns a promise for the module namespace and creates a split point: <code>const { chart } = await import("./chart.js")</code>. Use for routes, modals, heavy libraries, and below-the-fold features.</li><li><b>Resource hints:</b> <code>preload</code> (needed now: fonts, LCP image, critical script), <code>modulepreload</code> (ES module + deps), <code>prefetch</code> (likely next navigation, low priority), <code>preconnect</code>/<code>dns-prefetch</code>; <code>fetchpriority="high"</code> for the LCP image.</li><li><b>Caching:</b> hashed filenames + <code>Cache-Control: public, max-age=31536000, immutable</code>; HTML with <code>no-cache</code> so users pick up new hashes; service workers for offline.</li><li><b>Third-party scripts:</b> load with <code>async</code>/<code>defer</code>, delay until interaction (facades), audit regularly; they often dominate main-thread time.</li><li><b>Failure handling:</b> chunk requests can fail after a deploy (old chunk names): catch the import error and reload or retry.</li><li><b>HTTP/2 and HTTP/3</b> multiplex requests, so "bundle everything" matters less; moderate chunking wins.</li></ul>`,
diagram:{html:flow([["initial load","main + route chunk","g"],["user clicks 'Reports'"],["import('./reports.js')","fetch + run chunk","w"],["feature renders","cached for next time","g"]]),steps:["The first page loads only the code it needs.","A user action triggers a dynamic import, which fetches an extra chunk.","The browser caches the chunk (by its hashed name), so later uses are instant.","<code>prefetch</code> can fetch it during idle time before the click."]},
ex:[{t:"Dynamic import and live module graphs (runnable via Blob URLs)",code:`(async () => {
  console.log("before import");
  const m = await import("data:text/javascript,export const hello = (n) => 'hello ' + n; export default 7");
  console.log(m.hello("world"), m.default, Object.keys(m));
  console.log("import returned a module namespace:", Object.prototype.toString.call(m));
})();
console.log("sync code finishes first");`},
{t:"Resilient lazy loading (browser)",code:`async function lazy(loader, retries = 1){
  try { return await loader(); }
  catch (err) {
    if (retries > 0) return lazy(loader, retries - 1);
    location.reload();                    // stale chunk after a deploy: get fresh HTML
    throw err;
  }
}
button.addEventListener("click", async () => {
  const { renderChart } = await lazy(() => import("./chart.js"));
  renderChart();
});
link.addEventListener("mouseenter", () => import("./chart.js"), { once: true });   // warm up on intent`,run:false}],
gotchas:[`<code>import()</code> is asynchronous; code after it must wait for the promise.`,`Over-splitting creates request waterfalls (chunk A needs B needs C); preload known dependencies or group them.`,`<code>async</code> scripts that depend on each other break; use <code>defer</code> or modules.`,`Preloading too many resources steals bandwidth from the LCP resource.`,`<code>import()</code> of a URL path depends on the module base URL and bundler configuration.`],
best:[`Split by route and by heavy feature; keep the critical path small; preload the LCP image and critical font.`,`Version assets with content hashes and cache them for a year; never cache HTML aggressively.`],
iq:[["mid","defer vs async vs module?","defer and modules download in parallel and run after parsing in order; async runs ASAP in any order; modules are also strict and have their own scope."],["senior","How do you implement code splitting?","Use dynamic import() at route or feature boundaries; the bundler emits separate chunks; combine with preload/prefetch and error handling for failed chunks."],["architect","How would you design an asset caching strategy?","Content-hashed immutable assets with 1-year cache, short-lived or revalidated HTML, CDN in front, service worker only when you need offline, and a deploy strategy that keeps old chunks available for a while."]],
practice:[`Convert a heavy chart library import into a lazy-loaded chunk and measure the initial bundle change.`,`Add <code>preload</code> for the LCP image and compare LCP in Lighthouse.`],
teach:`<p>"Load only what the current screen needs, fetch other pieces when they're needed, hint to the browser what's coming, and name files by their content so they can be cached forever."</p>`}
],quiz:[
{code:`console.log(typeof require, typeof module, typeof exports);`,ans:`undefined undefined undefined`,why:`These CommonJS globals exist in Node, not in browsers. Browser code uses ES modules; bundlers rewrite require for you.`},
{code:`(async () => {
  console.log("before");
  const m = await import("data:text/javascript,export default 7");
  console.log(m.default);
  console.log("after");
})();
console.log("sync end");`,ans:`before, sync end, 7, after`,why:`import() returns a promise, so the async function pauses at await and the synchronous code after the call runs first.`}]},

{n:25,title:"Modules",goal:"Understand ES modules and CommonJS deeply, including their differences and interoperability.",topics:[
{id:"d25-esm",title:"ES modules vs CommonJS",
eli5:`<p>Two ways of sharing Lego sets. <b>CommonJS</b>: you get a <b>photocopy</b> of the instruction sheet at the moment you ask for it; later changes to the original don't show up. <b>ES modules</b>: you get a <b>window</b> to the original sheet, so you always see the current version (but you can only look, not edit). ES modules also plan the whole shopping list before building anything.</p>`,
why:`<p>JavaScript had no module system for 20 years, so Node invented CommonJS (2009) and browsers used globals and AMD. ES2015 standardized <b>ES modules</b> (ESM) for all environments, with static structure that enables tree-shaking, parallel loading and better tooling.</p>`,
tech:`<table><tr><th></th><th>ES modules</th><th>CommonJS</th></tr><tr><td>Syntax</td><td><code>import</code>/<code>export</code></td><td><code>require()</code>/<code>module.exports</code></td></tr><tr><td>Structure</td><td>static (analyzed before running)</td><td>dynamic (runtime calls)</td></tr><tr><td>Loading</td><td>async, parallel graph</td><td>sync, blocks</td></tr><tr><td>Bindings</td><td><b>live, read-only</b> views</td><td><b>copies</b> of values (objects shared)</td></tr><tr><td>Strict mode</td><td>always</td><td>opt-in</td></tr><tr><td>Top-level await</td><td>yes</td><td>no</td></tr><tr><td>Top-level <code>this</code></td><td>undefined</td><td><code>module.exports</code></td></tr><tr><td>Per-file vars</td><td><code>import.meta.url</code>, <code>.dirname</code>, <code>.filename</code></td><td><code>__dirname</code>, <code>__filename</code></td></tr><tr><td>Tree-shakeable</td><td>yes</td><td>mostly no</td></tr></table>
<h5>How ESM loads (three phases)</h5><ol><li><b>Construction:</b> find and fetch every file in the graph (<code>import</code> statements are hoisted and static), parse each into a module record.</li><li><b>Instantiation:</b> allocate memory for exports and link imports to them (live bindings, no values yet).</li><li><b>Evaluation:</b> run module code, dependencies first, each module <b>exactly once</b> (the module map caches it). Cycles are allowed: you may see uninitialized (TDZ) bindings.</li></ol>
<ul class="pts"><li>Node decides module type by <code>"type": "module"</code> in package.json or the <code>.mjs</code>/<code>.cjs</code> extension. Browsers use <code>&lt;script type="module"&gt;</code> (and import maps to map bare specifiers like <code>"lodash"</code> to URLs).</li><li>Imports need full paths with extensions in Node and browsers (bundlers relax this).</li></ul>`,
diagram:{html:flow([["1. Construction","fetch + parse the whole graph","w"],["2. Instantiation","create bindings, link imports to exports","w"],["3. Evaluation","run each module once, deps first","g"]]),steps:["The loader discovers all dependencies statically before running any code, so it can fetch them in parallel.","Exports and imports are connected by reference: an import is a read-only view of the exporting module's variable.","Modules execute in dependency order, once; later imports reuse the cached module instance."]},
ex:[{t:"Live bindings vs copied values (runnable with Blob modules)",code:`(async () => {
  const mk = (src) => URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
  const a = mk("export let count = 0; export function inc(){ count++; }");
  const b = mk('import { count, inc } from "' + a + '"; export const run = () => { const before = count; inc(); return [before, count]; };');
  const { run } = await import(b);
  console.log("ESM live binding [before, after]:", run());
  // CommonJS-style: destructuring copies the value at that moment
  const lib = { count: 0, inc(){ this.count++; } };
  const { count } = lib;
  lib.inc();
  console.log("copied value:", count, "| property now:", lib.count);
})();`},
{t:"Strictness, top-level this and a one-time evaluation",code:`(async () => {
  const t = await import("data:text/javascript,export default typeof this");
  console.log("top-level this in a module:", t.default, "| in this script:", typeof this);
  delete globalThis.__evals;
  const src = "globalThis.__evals = (globalThis.__evals || 0) + 1; export const id = Math.random();";
  const url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
  const m1 = await import(url), m2 = await import(url);
  console.log("same module instance:", m1 === m2, "| times its body ran:", globalThis.__evals);
})();`}],
browser:`<p>In HTML: <code>&lt;script type="module" src="app.js"&gt;&lt;/script&gt;</code> (deferred by default; each module executes once even if included twice). Modules are fetched with CORS and need to be served over HTTP (not <code>file://</code>). <code>&lt;script type="importmap"&gt;</code> maps bare specifiers. In Node (current LTS 26 and 24), <code>import</code> works in <code>.mjs</code> or with <code>"type":"module"</code>; use <code>import.meta.dirname</code> instead of <code>__dirname</code>.</p>`,
gotchas:[`Imported bindings are read-only: assigning to them throws a TypeError (but you can mutate the object they point to).`,`Circular imports can give <code>undefined</code>/TDZ errors depending on evaluation order.`,`Default and named exports are different things: <code>import x from</code> vs <code>import { x } from</code>.`,`<code>export default function(){}</code> exports a value, so renaming it requires changing import names consistently; many style guides prefer named exports.`,`<code>import</code> declarations are hoisted: you can't conditionally import with the static syntax (use <code>import()</code>).`,`Top-level await in a module blocks modules that import it.`],
best:[`Use ESM for new code and publish ESM (with CJS only if needed); prefer named exports; keep modules small and cycle-free.`,`Avoid side effects at import time; export functions instead.`],
iq:[["fresher","What is the difference between import and require?","import is static ES module syntax (async, live bindings, strict); require is CommonJS (sync, dynamic, copies)."],["mid","What are live bindings?","An import is a read-only reference to the exporting module's variable, so it reflects later changes, unlike a CommonJS copy."],["senior","Describe how ES modules are loaded.","Construction (fetch and parse the static graph), instantiation (create and link bindings), and evaluation (run each module once in dependency order)."],["senior","Why does a circular import sometimes give undefined?","The importing module may run before the exporting module finished evaluating, so the binding is still uninitialized (TDZ for let/const/class, undefined for var/function in some cases)."]],
practice:[`Create two modules importing each other and observe the behavior; fix by extracting shared code.`,`Convert a small CommonJS script to ESM and replace <code>__dirname</code>.`],
teach:`<p>"CommonJS hands you a photocopy at the moment you ask; ES modules give you a window onto the original. ESM plans the whole graph first, then runs each file once, which also lets tools throw away what's unused."</p>`},

{id:"d25-interop",title:"Interop, dynamic import and import attributes",
eli5:`<p>Two groups speak different dialects (ESM and CommonJS). Mostly they can talk through a translator, but a few things get lost in translation. The translator is allowed to read the other dialect's book (<code>require(esm)</code> now works for books with no "wait for it" chapters), and the book's cover page (<code>package.json exports</code>) tells each reader which edition to take.</p>`,
why:`<p>npm has millions of CommonJS packages and a growing number of ESM-only ones. Mixing them used to cause many painful errors (<code>ERR_REQUIRE_ESM</code>). Knowing the rules saves hours.</p>`,
tech:`<ul class="pts"><li><b>ESM importing CJS:</b> <code>import pkg from "cjs-pkg"</code> gives <code>module.exports</code> as the default; named imports work only when Node's static analysis can detect them (best-effort), so <code>import pkg from</code> then destructure is safest.</li><li><b>CJS loading ESM:</b> <code>require(esm)</code> is supported without a flag from Node 22.12 and in current LTS lines, <b>for modules without top-level await</b>; otherwise it throws <code>ERR_REQUIRE_ASYNC_MODULE</code>. <code>await import()</code> works everywhere and is the portable option.</li><li><b>Package <code>exports</code> field</b> chooses files by condition: <code>"import"</code>, <code>"require"</code>, <code>"types"</code>, <code>"default"</code>, plus subpath exports; it also blocks deep imports not listed. A <b>dual package hazard</b> is loading both copies (ESM and CJS) and ending up with two instances of shared state.</li><li><b>Import attributes</b> (ES2025): <code>import data from "./config.json" with { type: "json" }</code> loads JSON modules safely; also <code>with { type: "css" }</code> in some browsers. Dynamic form: <code>import("./x.json", { with: { type: "json" } })</code>.</li><li><b>Tools:</b> <code>import.meta.resolve()</code> resolves a specifier; <code>module.createRequire(import.meta.url)</code> gives <code>require</code> inside ESM; browsers use <b>import maps</b> for bare specifiers.</li><li><code>import defer</code> (lazy evaluation) is a Stage 3 proposal with no browser or Node support yet: don't use it in production.</li></ul>`,
diagram:{html:lanes([["ESM file",["import x from 'cjs' ✓","await import('cjs') ✓","require() ✗ (use createRequire)"]],["CJS file",["require('cjs') ✓","await import('esm') ✓ (always)","require('esm') ✓ if no top-level await"]],["package.json exports",["'import' → ./esm/index.js","'require' → ./cjs/index.cjs","'types' → ./index.d.ts"]]]),steps:["ESM can import CJS freely, with the default import being <code>module.exports</code>.","CJS can load ESM with dynamic <code>import()</code> anywhere, or <code>require()</code> when the ESM graph is synchronous.","The <code>exports</code> map tells each loader which entry file to use; keep both builds behaviorally identical and avoid shared mutable state."]},
ex:[{t:"JSON modules via import attributes (runnable, with fallback)",code:`(async () => {
  try {
    const cfg = await import('data:application/json,{"name":"demo","port":3000}', { with: { type: "json" } });
    console.log("JSON module default export:", cfg.default);
  } catch (e) {
    console.log("import attributes not supported here:", e.name);
  }
  try { await import('data:application/json,{"x":1}'); }
  catch (e) { console.log("without 'with { type: \\"json\\" }':", e.name); }
})();`},
{t:"Dual-package layout and interop cheatsheet (reference)",code:`// package.json of a dual package
{
  "name": "my-lib", "version": "2.0.0", "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "require": "./dist/index.cjs" },
    "./utils": "./dist/utils.js"
  }
}

// ESM -> CJS dependency
import pkg from "legacy-cjs";          // pkg === module.exports
const { helper } = pkg;

// CJS -> ESM (portable)
const { default: esmThing } = await import("esm-only");   // inside an async function

// ESM needing require/__dirname
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const dir = import.meta.dirname;`,run:false}],
gotchas:[`<code>ERR_REQUIRE_ESM</code> / <code>ERR_REQUIRE_ASYNC_MODULE</code>: you required an ESM module that uses top-level await or your runtime is older; switch to dynamic import.`,`<code>__dirname</code> and <code>require</code> are not defined in ESM.`,`Default-export interop can yield <code>module.default.default</code> in some transpiled code; check with <code>esModuleInterop</code>/bundler settings.`,`Dual-package hazard: separate CJS and ESM instances break singletons (instanceof, caches).`,`File extensions are mandatory in Node ESM (<code>./file.js</code>), and the <code>exports</code> map blocks undeclared deep imports.`,`JSON import without the attribute fails; the attribute syntax needs current browsers/Node.`],
best:[`Ship ESM-first (with a CJS build only if your users need it) and test both entry points in CI.`,`Use <code>exports</code> with conditions and <code>types</code> first; avoid mutable module-level state in dual packages.`,`Use dynamic <code>import()</code> for portability between module systems.`],
iq:[["mid","How do you use an ESM-only package from CommonJS?","Use dynamic import() (works everywhere), or require() if your Node version supports it and the module has no top-level await."],["senior","What is the dual package hazard?","Shipping both ESM and CJS builds can cause an app to load both, creating two separate module instances and breaking shared state or instanceof checks."],["senior","What do import attributes do?","They tell the loader how to interpret a module, e.g. with { type: 'json' } to load JSON as a module safely instead of executing it as script."],["architect","How do you migrate a large Node codebase from CJS to ESM?","Move to ESM-compatible tooling first, convert leaf modules, add exports maps, replace __dirname/require with import.meta/createRequire, use dynamic import for stragglers, publish dual or ESM-only with a clear major version, and test both."]],
practice:[`Create a tiny package with an <code>exports</code> map and consume it from an ESM and a CJS script.`,`Replace a JSON <code>fs.readFile</code> with a JSON import.`],
teach:`<p>"ESM can import CJS easily; CJS reaches ESM with dynamic import. The package's exports map tells each side which file to load. Don't ship two copies that both get loaded, and remember JSON needs an import attribute."</p>`}
],quiz:[
{code:`(async () => {
  const t = await import("data:text/javascript,export default typeof this");
  console.log(t.default, typeof this);
})();`,ans:`undefined object`,why:`Module code is strict and its top-level this is undefined. The plain script here runs as sloppy code where this is the global object.`},
{code:`(async () => {
  const mk = (s) => URL.createObjectURL(new Blob([s], { type: "text/javascript" }));
  const a = mk("export let n = 0; export const inc = () => { n++; };");
  const b = mk('import { n, inc } from "' + a + '"; inc(); export const seen = n;');
  console.log((await import(b)).seen);
})();`,ans:`1`,why:`The import binding n is live: after inc() runs, n in module b reflects the updated value (a CommonJS copy would still be 0).`}]}
]});
