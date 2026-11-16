/* Week 1: Foundations — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js. */
JSC.registerWeek({w:1,revision:[
"<b>8 types:</b> string, number, bigint, boolean, undefined, symbol, null, object. <code>typeof null</code> is \"object\" (legacy bug).",
"<b>var</b> function-scoped, hoisted as undefined. <b>let/const</b> block-scoped, in the TDZ until their line runs. <b>const</b> freezes the binding, not the value.",
"<b>Coercion:</b> <code>+</code> concatenates if either side becomes a string; every other math operator converts to number. Use <code>===</code>; the only common <code>==</code> idiom is <code>x == null</code>.",
"<b>Floats:</b> <code>0.1+0.2 !== 0.3</code>. Compare with an epsilon, or use integers (cents) or BigInt.",
"<b>this</b> priority: new, then call/apply/bind, then obj.method(), then default (undefined in strict mode). Arrows keep the outer <code>this</code>.",
"<b>Hoisting:</b> function declarations are fully hoisted, var is undefined until assigned, let/const/class throw in the TDZ.",
"<b>Strings</b> are UTF-16: <code>'😀'.length === 2</code>. Use spread or Intl.Segmenter for characters/graphemes.",
"<b>Arrays:</b> default sort is lexicographic; <code>map(parseInt)</code> breaks; holes are skipped by forEach/map; prefer toSorted/toReversed/with.",
"<b>Objects:</b> key order is integer keys ascending, then strings by insertion, then symbols. Spread and Object.assign copy shallowly.",
"<b>Dates:</b> months are 0-based and date-only ISO strings parse as UTC. Prefer Temporal where available (Safari still needs a polyfill)."
],days:[
/* ================= DAY 1 ================= */
{n:1,title:"Getting started: values and variables",goal:"Know what JavaScript is, where it runs, how names hold values, and the eight data types.",topics:[
{id:"d1-intro",title:"What JavaScript is and how it runs",
eli5:`<p>A web page is like a house. <b>HTML</b> is the walls and rooms, <b>CSS</b> is the paint and furniture, and <b>JavaScript</b> is the electricity: it makes the lights turn on when you press a switch.</p><p>Inside your browser lives a very fast reader called the <b>engine</b>. You write instructions in JavaScript, and the engine reads them and does them, one step at a time, very quickly.</p>`,
why:`<p>In 1995 Brendan Eich created JavaScript at Netscape in about ten days so web pages could react to users without a server round trip. The name was marketing (it has nothing to do with Java). The language was standardized as <b>ECMAScript</b> (ECMA-262) and is evolved by the <b>TC39</b> committee, with a new edition every June since ES2015.</p>`,
tech:`<p>JavaScript is a dynamically typed, garbage-collected, multi-paradigm language. Source text goes through an <b>engine</b>: V8 (Chrome, Edge, Node.js, Deno), SpiderMonkey (Firefox) or JavaScriptCore (Safari). Modern engines parse to an AST, compile to bytecode, run it in an interpreter, and compile hot code to optimized machine code (JIT). It is <i>not</i> simply "interpreted" or "compiled": it is both.</p>
<p>The language itself (ECMAScript) defines types, operators, functions, objects, promises and modules. It does <b>not</b> define <code>document</code>, <code>fetch</code>, <code>setTimeout</code> or <code>console</code>: those are <b>host APIs</b> provided by the browser or Node. Your code runs on a single main thread, which is why the event loop (Week 3) matters.</p>
<h5>Three ways to run code</h5><ul class="pts"><li>Browser DevTools console (F12 → Console).</li><li>A page: <code>&lt;script src="app.js" defer&gt;&lt;/script&gt;</code> or <code>&lt;script type="module"&gt;</code>.</li><li>Node.js: <code>node file.js</code>.</li></ul>`,
diagram:{html:flow([["Source code","your .js file"],["Parser","tokens → AST"],["Interpreter","bytecode, collects type feedback","w"],["Optimizing compiler","hot code → machine code","g"],["CPU runs it"]]),steps:["The engine parses your text into an Abstract Syntax Tree (and reports syntax errors here, before anything runs).","The AST becomes compact bytecode that the interpreter runs immediately, so start-up is fast.","While running, the engine records which types each operation sees (feedback).","Functions called many times are compiled to optimized machine code using that feedback.","If a guess turns out wrong (a different type shows up), the engine <b>deoptimizes</b> back to bytecode. Day 21 covers this."]},
ex:[{t:"Your first program",code:`console.log("Hello, JavaScript");
console.log(2 + 3);
console.log(typeof globalThis); // works in browsers and Node`},
{t:"Sloppy vs strict mode",code:`function sloppy(){ undeclared = 5; return typeof undeclared; }
function strict(){
  'use strict';
  try { undeclared2 = 5; } catch (e) { return e.name; }
}
console.log(sloppy());  // silently creates a global
console.log(strict());  // throws instead`,note:"ES modules and class bodies are always strict. Add <code>'use strict'</code> to old scripts."}],
browser:`<p>Put scripts at the end of <code>&lt;body&gt;</code> or use <code>defer</code> so the DOM exists when the code runs. Plain <code>&lt;script&gt;</code> blocks HTML parsing while it downloads and runs. In browsers the global object is <code>window</code>; in Node it is <code>global</code>; <code>globalThis</code> works everywhere.</p>`,
gotchas:[`JavaScript is not Java. Different language, different design.`,`<code>setTimeout</code>, <code>fetch</code> and the DOM are host APIs, not part of the language. A Node program has no <code>document</code>.`,`A syntax error anywhere stops the whole script from running at all (parse happens first); a runtime error stops only from that line on.`,`Automatic semicolon insertion (ASI) can change meaning, for example a <code>return</code> followed by a newline returns undefined. Pick a style (with semicolons or without) and use a linter.`],
best:[`Use ES modules (<code>type="module"</code>) for new code; they are strict by default.`,`Develop with the DevTools open; read error messages fully, they include file and line.`,`Learn the language first, frameworks second.`],
iq:[["fresher","Is JavaScript compiled or interpreted?","Both. Engines use an interpreter for fast start-up and a JIT compiler for hot code. Saying only \"interpreted\" is the common wrong answer."],["mid","What is the difference between JavaScript and ECMAScript?","ECMAScript is the specification (ECMA-262). JavaScript is the implementation family plus host APIs (DOM, timers) that are not in the spec."],["senior","What does strict mode change?","Silent errors become exceptions (assigning to undeclared variables, writing to read-only properties), <code>this</code> is undefined in plain function calls instead of the global object, duplicate parameter names and <code>with</code> are disallowed, and <code>arguments</code> is no longer aliased to parameters."]],
practice:[`Open DevTools and run <code>typeof window</code>, <code>typeof document</code>, <code>typeof require</code>. Then run <code>node -e "console.log(typeof window)"</code>. Explain the difference.`,`Create an HTML file with a script using <code>defer</code> that changes the page title.`],
teach:`<p>"HTML is the skeleton, CSS the skin, JavaScript the muscles. Your browser has a built-in engine that reads JavaScript, translates it into machine instructions, and speeds up the parts you repeat. The language is the standard; the browser adds extras like the page and timers."</p>`},

{id:"d1-vars",title:"Variables: var, let, const",
eli5:`<p>A variable is a <b>labeled box</b>. You write a name on the box and put something inside. <code>let</code> is a box where you can swap the contents. <code>const</code> is a box where the label is glued on so you can never move the label to another box, but if the box holds a toy chest you can still rearrange the toys inside it. <code>var</code> is an old, leaky kind of box that we avoid.</p>`,
why:`<p>Early JavaScript only had <code>var</code>, which is function-scoped and hoisted, causing bugs in loops and blocks. ES2015 added <code>let</code> and <code>const</code> with block scope and the temporal dead zone to make code predictable.</p>`,
tech:`<table><tr><th></th><th>var</th><th>let</th><th>const</th></tr><tr><td>Scope</td><td>function</td><td>block</td><td>block</td></tr><tr><td>Hoisting</td><td>yes, initialized to undefined</td><td>yes, but in TDZ</td><td>yes, but in TDZ</td></tr><tr><td>Re-declare in same scope</td><td>allowed</td><td>SyntaxError</td><td>SyntaxError</td></tr><tr><td>Re-assign</td><td>yes</td><td>yes</td><td>no (TypeError)</td></tr><tr><td>Top-level creates window property</td><td>yes (scripts)</td><td>no</td><td>no</td></tr></table>
<p><code>const</code> protects the <b>binding</b> (the name-to-value link), not the value. <code>const list = []; list.push(1)</code> is fine. Use <code>Object.freeze</code> for shallow immutability (Day 10).</p>`,
diagram:{html:flow([["let count = 1","name → box"],["count = 2","same box, new value"],["const PI = 3.14","name glued to box","g"],["PI = 3","TypeError","r"]]),steps:["<code>let</code> creates a binding you can reassign.","Reassignment changes what the binding points to.","<code>const</code> requires an initial value and cannot be reassigned.","Trying to reassign throws a TypeError at run time."]},
ex:[{t:"Scope difference",code:`{
  var a = 1;
  let b = 2;
  const c = 3;
}
console.log(typeof a);  // var leaks out of the block
console.log(typeof b);  // let does not
console.log(typeof c);`},
{t:"const does not freeze objects",code:`const user = { name: "Asha" };
user.name = "Ravi";           // allowed
try { user = {}; } catch (e) { console.log(e.name); }
console.log(user.name);`}],
browser:`<p>In a classic script, top-level <code>var x</code> becomes <code>window.x</code>, but top-level <code>let</code>/<code>const</code> live in a separate script-scope declarative record and do not. In ES modules, nothing at top level is global.</p>`,
gotchas:[`<code>const</code> does not mean immutable. Arrays and objects stay mutable.`,`<code>var</code> in loops: all closures share one variable (Day 6).`,`A <code>let</code> declaration directly under <code>case</code> shares the whole switch block; wrap cases in braces.`,`Declaring without a keyword (<code>x = 5</code>) creates a global in sloppy mode and throws in strict mode.`,`A <code>for (let i...)</code> loop creates a fresh <code>i</code> per iteration.`],
best:[`Default to <code>const</code>; use <code>let</code> only when you must reassign; never use <code>var</code> in new code.`,`Declare variables as close to first use as possible.`,`Use descriptive names; camelCase for variables, UPPER_SNAKE for true constants.`],
iq:[["fresher","Difference between var, let and const?","Scope (function vs block), hoisting behavior (undefined vs TDZ), re-declaration and re-assignment rules. Mention that const protects the binding, not the contents."],["mid","Is let hoisted?","Yes. The binding is created when the scope is entered but stays uninitialized (temporal dead zone) until the declaration executes. Access before that throws ReferenceError."],["senior","Why does a top-level var appear on window but let does not?","var declarations in global scripts go into the global object's environment record; let/const go into a separate declarative environment record layered on top, so they are global-scoped but not properties of the global object."]],
practice:[`Predict, then run: <code>console.log(a); var a = 1;</code> and <code>console.log(b); let b = 1;</code>.`,`Convert a small old script from var to const/let and explain each choice.`],
teach:`<p>"A variable is a labeled box. let lets you swap the contents, const nails the label to the box. const does not make the contents unchangeable: it only stops you re-pointing the name. Use const by default."</p>`},

{id:"d1-types",title:"Data types and typeof",
eli5:`<p>Everything you can hold in JavaScript is one of two kinds. <b>Simple things</b> (a number, a word, yes/no) are like a coin: if you give your friend a coin, you each have your own coin. <b>Complicated things</b> (objects, lists) are like a house: if you give a friend the address, you both point to the same house, and if they paint it, your house is painted too.</p>`,
why:`<p>JavaScript separates <b>primitives</b> (immutable values) from <b>objects</b> (mutable, identity-based). Understanding this one split explains copying bugs, equality, and why <code>===</code> on two equal-looking arrays is false.</p>`,
tech:`<p>There are 7 primitives plus object: <b>string, number, bigint, boolean, undefined, symbol, null</b> and <b>object</b> (arrays, functions, dates, maps and so on are all objects). Primitives are compared by value and are immutable (<code>"abc"[0] = "x"</code> does nothing). Objects are compared by <b>reference</b>.</p>
<ul class="pts"><li><code>undefined</code>: "no value was assigned". <code>null</code>: "intentionally no value".</li><li><code>typeof</code> returns one of: "string", "number", "bigint", "boolean", "undefined", "symbol", "function", "object". <code>typeof null</code> is <code>"object"</code>, a bug kept forever for compatibility.</li><li>Primitives have temporary <b>wrapper objects</b> so <code>"hi".length</code> works; <code>new String("hi")</code> creates an actual object, which you should avoid.</li></ul>`,
diagram:{html:lanes([["Primitives (copied by value)",["let a = 5","let b = a  → b gets its own 5","b = 9 → a is still 5"]],["Objects (copied by reference)",["const x = {n:1}","const y = x → y holds the same address","y.n = 9 → x.n is 9 too"]]]),steps:["Assigning a primitive copies the value itself.","Assigning an object copies only the reference (the address).","Both references see changes made through either one.","To get an independent copy you must clone explicitly (Day 5 and Day 10)."]},
ex:[{t:"typeof table",code:`console.log(typeof "x", typeof 1, typeof 1n, typeof true);
console.log(typeof undefined, typeof null, typeof Symbol());
console.log(typeof {}, typeof [], typeof function(){}, typeof NaN);
console.log(Array.isArray([]), Number.isNaN(NaN));`},
{t:"Value vs reference",code:`let a = 5, b = a; b = 9;
const x = { n: 1 }, y = x; y.n = 9;
console.log(a, b);
console.log(x.n, x === y, {n:9} === {n:9});`}],
gotchas:[`<code>typeof null === "object"</code>; check null with <code>=== null</code>.`,`<code>typeof NaN === "number"</code>. NaN means "not a valid number" but its type is number.`,`<code>typeof []</code> is "object"; use <code>Array.isArray</code>.`,`<code>typeof undeclared</code> is safe ("undefined") but <code>typeof</code> of a let variable in its TDZ throws.`,`Strings are immutable: methods return new strings.`,`Passing an object to a function passes a copy of the reference ("call by sharing"): mutating it is visible outside, reassigning the parameter is not.`],
best:[`Use <code>===</code> and explicit checks (<code>Array.isArray</code>, <code>Number.isNaN</code>, <code>=== null</code>).`,`Never create primitives with <code>new String/Number/Boolean</code>.`],
iq:[["fresher","How many data types does JavaScript have?","Eight: seven primitives (string, number, bigint, boolean, undefined, symbol, null) plus object."],["mid","Why is typeof null 'object'?","In the original engine a value's type tag for objects was 0 and null was the null pointer (all zero bits), so it got the object tag. It was never fixed because it would break existing code."],["senior","Is JavaScript pass-by-reference?","No. It is pass-by-value where the value of an object variable is a reference (call by sharing). You can mutate the shared object but cannot rebind the caller's variable."]],
practice:[`Write a function <code>typeOf(v)</code> that returns "null", "array", or the typeof result.`,`Show with code that two identical-looking objects are not equal.`],
teach:`<p>"Simple values are copied like coins. Objects are shared like house addresses. typeof tells you the kind, except it calls null an object by mistake."</p>`}
],quiz:[
{code:`console.log(typeof null, typeof undefined, typeof NaN, typeof [], typeof function(){});`,ans:`object undefined number object function`,why:`null reports "object" (legacy bug), NaN is of type number, arrays are objects, functions get their own "function" result.`},
{code:`const a = { n: 1 }; const b = a; b.n = 2;
let x = 1; let y = x; y = 2;
console.log(a.n, x);`,ans:`2 1`,why:`The object is shared through the reference, so a.n changes. The number was copied, so x stays 1.`}]},

/* ================= DAY 2 ================= */
{n:2,title:"Numbers, coercion and control flow",goal:"Understand how numbers really work, how JavaScript converts types, and how to direct program flow.",topics:[
{id:"d2-numbers",title:"Numbers, operators and floating point",
eli5:`<p>Computers count in twos (0 and 1), not tens. Trying to write one-tenth in twos is like trying to write one-third in decimals: 0.3333... it never ends, so the computer rounds. When you add two rounded things, the tiny mistakes show up: 0.1 + 0.2 is a hair more than 0.3.</p>`,
why:`<p>JavaScript has one number type for everything: a 64-bit IEEE-754 double. That keeps the language simple but means integers above 2<sup>53</sup> lose precision and decimals cannot be exact. <b>BigInt</b> (ES2020) exists for big integers.</p>`,
tech:`<p>A double has 1 sign bit, 11 exponent bits and 52 fraction bits. It can represent integers exactly up to <code>Number.MAX_SAFE_INTEGER</code> (2<sup>53</sup>−1 = 9007199254740991). Special values: <code>NaN</code> (never equal to itself), <code>Infinity</code>, <code>-Infinity</code> and <code>-0</code>.</p>
<ul class="pts"><li><code>%</code> keeps the sign of the dividend: <code>-5 % 3 === -2</code>.</li><li><code>**</code> is exponent; <code>Math.trunc</code> removes the fraction; <code>Math.round(-0.5)</code> is <code>-0</code>.</li><li><code>Number("")</code> is 0, <code>Number("abc")</code> is NaN, <code>parseInt("12px")</code> is 12, <code>Number("12px")</code> is NaN.</li><li>BigInt literals end with <code>n</code>; you cannot mix BigInt and Number in arithmetic (TypeError).</li><li>ES2026 adds <code>Math.sumPrecise()</code> for exact summation (check browser support).</li></ul>`,
diagram:{html:flow([["Sign","1 bit"],["Exponent","11 bits","w"],["Fraction (mantissa)","52 bits","g"]],{plain:true})+`<p style="text-align:center;margin:10px 0 0">value = (−1)<sup>sign</sup> × 1.fraction × 2<sup>exponent−1023</sup></p>`,steps:["The sign bit says positive or negative.","The exponent scales the number up or down by powers of two.","The fraction stores the significant digits. 52 bits means about 15–17 decimal digits of precision.","Numbers like 0.1 have infinite binary fractions, so they are rounded to the nearest representable value."]},
ex:[{t:"Float errors and safe comparison",code:`console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(Math.abs((0.1 + 0.2) - 0.3) < Number.EPSILON);
console.log((0.1 + 0.2).toFixed(2));        // string!
console.log(Number.MAX_SAFE_INTEGER + 2);   // precision lost`},
{t:"BigInt, NaN, -0",code:`console.log(2n ** 64n);
try { 1n + 1; } catch (e) { console.log(e.name); }
console.log(NaN === NaN, Object.is(NaN, NaN), Number.isNaN("abc"), isNaN("abc"));
console.log(Object.is(0, -0), 1 / -0, -5 % 3);`}],
browser:`<p>Same everywhere. <code>Intl.NumberFormat</code> formats for display: <code>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(1234.5)</code>. Never use floats for money in code: store integer minor units (cents) or a decimal library.</p>`,
gotchas:[`<code>toFixed</code> returns a <b>string</b> and rounds the binary value (<code>1.005.toFixed(2)</code> is "1.00").`,`Global <code>isNaN("abc")</code> coerces to number first (true); <code>Number.isNaN("abc")</code> is false.`,`<code>[NaN].includes(NaN)</code> is true but <code>indexOf(NaN)</code> is -1.`,`Bitwise operators convert to 32-bit integers: <code>2**32 | 0</code> is 0.`,`<code>parseInt(0.0000005)</code> is 5 (string conversion gives "5e-7").`],
best:[`Compare floats with a tolerance; keep money in integers; use BigInt for IDs beyond 2<sup>53</sup>.`,`Always pass the radix: <code>parseInt(s, 10)</code>, or prefer <code>Number(s)</code> when the whole string must be numeric.`],
iq:[["fresher","Why is 0.1 + 0.2 not 0.3?","Binary floating point cannot represent 0.1 or 0.2 exactly, so the sum is the nearest double, 0.30000000000000004."],["mid","What is the largest safe integer and what happens beyond it?","2^53 − 1. Beyond it, not every integer is representable, so different integers can compare equal (9007199254740993 === 9007199254740992). Use BigInt."],["senior","How would you handle currency?","Store integer minor units (or use a decimal library), do arithmetic on integers, format only at the edge with Intl.NumberFormat."]],
practice:[`Write <code>almostEqual(a, b)</code> using a relative tolerance.`,`Compute 30! with BigInt.`],
teach:`<p>"Computers count in twos, so some decimals can't be written exactly, like one-third in decimals. That's why 0.1 + 0.2 is slightly off. For exact whole numbers beyond 9 quadrillion, use BigInt."</p>`},

{id:"d2-coercion",title:"Type coercion and equality",
eli5:`<p>Imagine a translator who always tries to be helpful. If you hand them a number where a word is needed, they quietly turn it into a word. Usually that is fine, but sometimes they guess wrong and surprise you. <code>===</code> means "same kind AND same value, no translating". <code>==</code> means "let the translator try to make them match first".</p>`,
why:`<p>JavaScript was designed for non-programmers wiring up pages, so operators silently convert types. The rules are fully specified (abstract operations ToPrimitive, ToNumber, ToString, ToBoolean), so every "weird" result is explainable.</p>`,
tech:`<h5>The four conversions</h5><ul class="pts"><li><b>ToBoolean</b>: exactly 8 falsy values: <code>false, 0, -0, 0n, "", null, undefined, NaN</code> (plus the legacy <code>document.all</code>). Everything else, including <code>"0"</code>, <code>[]</code> and <code>{}</code>, is truthy.</li><li><b>ToNumber</b>: <code>""→0, " 12 "→12, "abc"→NaN, true→1, null→0, undefined→NaN, []→0, [5]→5, {}→NaN</code>.</li><li><b>ToString</b>: arrays join with commas (<code>[1,2]→"1,2"</code>), plain objects give "[object Object]".</li><li><b>ToPrimitive</b>: for objects, calls <code>[Symbol.toPrimitive]</code>, or <code>valueOf</code>/<code>toString</code> in an order set by the hint ("number", "string", "default").</li></ul>
<h5>Operators</h5><ul class="pts"><li><code>+</code>: after ToPrimitive, if either side is a string, concatenate; else add as numbers. All of <code>- * / %</code> convert to numbers.</li><li><code>==</code>: if same type, same as <code>===</code>. <code>null == undefined</code> is true (and equal to nothing else). Otherwise string/boolean/object operands are converted toward number or primitive.</li><li>Relational <code>&lt; &gt; &lt;= &gt;=</code> use ToNumber (unless both are strings), so <code>null &gt;= 0</code> is true while <code>null == 0</code> is false.</li></ul>`,
diagram:{html:flow([["a == b"],["same type?","yes → compare like ==="],["null or undefined?","equal only to each other","w"],["else convert toward number / primitive","then compare","g"]]),steps:["If both have the same type, loose equality behaves like strict equality.","<code>null</code> and <code>undefined</code> only equal each other (and themselves).","Booleans become numbers (true→1, false→0) before comparing.","Objects are converted with ToPrimitive and then compared again."]},
ex:[{t:"Predict, then run",code:`console.log("5" + 2, "5" - 2, "5" * "2", true + 1);
console.log([] + [], [] + {}, [1,2] + [3]);
console.log(0 == "", 0 == "0", "" == "0");
console.log(null == undefined, null == 0, null >= 0);
console.log([] == ![], NaN == NaN);`,note:"<code>0 == \"\"</code> and <code>0 == \"0\"</code> are true but <code>\"\" == \"0\"</code> is false: == is not transitive."},
{t:"Custom ToPrimitive",code:`const money = {
  amount: 42,
  [Symbol.toPrimitive](hint){ return hint === "string" ? "$42" : this.amount; }
};
console.log(money + 1, String(money), money * 2);`}],
gotchas:[`<code>{} + []</code> at the start of a console line is parsed as an empty block plus <code>+[]</code> → 0.`,`<code>"0"</code> and <code>[]</code> are truthy in <code>if</code>, but <code>[] == false</code> is true.`,`Unary plus converts: <code>+"3"</code> is 3, <code>+[]</code> is 0, <code>+{}</code> is NaN, <code>+new Date()</code> is a timestamp.`,`<code>Date</code> uses hint "string" for <code>+</code>, other objects use "default" (number-first).`,`<code>1 &lt; 2 &lt; 3</code> is true but <code>3 &gt; 2 &gt; 1</code> is false (true &gt; 1 → 1 &gt; 1).`],
best:[`Use <code>===</code> / <code>!==</code>. The one accepted idiom is <code>x == null</code> meaning "null or undefined".`,`Convert explicitly: <code>Number(x)</code>, <code>String(x)</code>, <code>Boolean(x)</code> (or <code>!!x</code>).`,`Use <code>??</code> when 0 or "" are valid values (Day 2 control flow).`],
iq:[["fresher","== vs ===?","=== compares type and value with no conversion; == converts types first. Prefer ===."],["mid","What are the falsy values?","false, 0, -0, 0n, \"\", null, undefined, NaN (and document.all for legacy)."],["mid","Why is [] == ![] true?","![] is false. Then [] == false: false becomes 0, [] becomes \"\" via ToPrimitive and then 0, so 0 == 0."],["senior","How does an object become a primitive?","ToPrimitive: if the object has Symbol.toPrimitive it is called with a hint; otherwise valueOf then toString for 'number'/'default', toString then valueOf for 'string'. The first primitive result is used, else TypeError."]],
practice:[`Explain each line of the example output using the rules above.`,`Write an object that equals 10 when used in math and "ten" in a template string.`],
teach:`<p>"JavaScript tries to be helpful and converts types for you. There are only eight false-ish values. + glues text if either side is text; everything else does math. Use triple equals so no guessing happens."</p>`},

{id:"d2-control",title:"Control flow and loops",
eli5:`<p>A program is a recipe. <b>if</b> is "if the oven is hot, put the cake in". <b>switch</b> is a menu of choices. <b>Loops</b> are "stir ten times" (for), "stir until smooth" (while), and "go through every egg in the basket" (for...of).</p>`,
why:`<p>Without branching and repetition a program is a fixed list of steps. Modern JavaScript adds short-circuit operators that act as compact conditionals.</p>`,
tech:`<ul class="pts"><li><b>Branching:</b> <code>if/else</code>, <code>switch</code> (uses strict equality; falls through without <code>break</code>), ternary <code>a ? b : c</code>.</li><li><b>Short-circuit:</b> <code>a || b</code> returns the first truthy value; <code>a &amp;&amp; b</code> returns the first falsy value; <code>a ?? b</code> returns b only when a is null/undefined. Assignment forms: <code>||=</code>, <code>&amp;&amp;=</code>, <code>??=</code>.</li><li><b>Optional chaining:</b> <code>obj?.a?.[0]?.()</code> returns undefined instead of throwing when a link is null/undefined.</li><li><b>Loops:</b> <code>for</code>, <code>while</code>, <code>do...while</code>, <code>for...of</code> (iterates <i>values</i> of iterables), <code>for...in</code> (iterates enumerable string <i>keys</i>, including inherited ones), plus <code>break</code>, <code>continue</code>, and labels.</li></ul>`,
diagram:{html:flow([["init"],["test condition","false → exit loop","w"],["body","break / continue","g"],["update"]]),steps:["The initializer runs once.","The condition is tested before every iteration.","If true, the body runs. <code>continue</code> jumps to the update; <code>break</code> leaves the loop.","The update runs, then the cycle returns to the test."]},
ex:[{t:"|| vs ??",code:`const count = 0, name = "";
console.log(count || 10, count ?? 10);
console.log(name || "anon", name ?? "anon");
const cfg = {};
cfg.retries ??= 3;
console.log(cfg, cfg.db?.host);`},
{t:"for...of vs for...in",code:`const arr = ["a", "b"];
arr.extra = "x";
for (const v of arr) console.log("of", v);
for (const k in arr) console.log("in", k);`},
{t:"switch fallthrough",code:`function f(x){
  const out = [];
  switch (x) {
    case 1: out.push("one");
    case 2: out.push("two"); break;
    default: out.push("other");
  }
  return out;
}
console.log(f(1), f(2), f(9));`}],
gotchas:[`<code>forEach</code>, <code>map</code> and friends cannot be stopped with <code>break</code>; use <code>for...of</code>, <code>some</code> or <code>every</code>.`,`<code>for...in</code> on arrays gives string indices and includes custom/inherited enumerable properties.`,`<code>x || default</code> wrongly replaces 0, "" and false; use <code>??</code>.`,`<code>await</code> inside <code>forEach</code> does not pause the loop. Use <code>for...of</code>.`,`A <code>let</code> loop variable is fresh per iteration (closures capture each one separately).`],
best:[`Prefer <code>for...of</code> and array methods over index loops; guard conditions early and return (fewer nested ifs).`,`Use labels sparingly; extract a function instead.`],
iq:[["fresher","for...in vs for...of?","for...in enumerates keys (including inherited enumerable ones); for...of iterates values of an iterable via its iterator."],["mid","|| vs ??","|| falls back on any falsy value; ?? only on null or undefined."],["senior","Why can't you break out of forEach?","forEach calls your callback per element; return only exits that call. Use a loop or some/every. Throwing works but is a hack."]],
practice:[`Write FizzBuzz three ways: if/else, switch(true), and a lookup table.`,`Flatten an object path safely with optional chaining.`],
teach:`<p>"if/else chooses a path, loops repeat. for...of walks the items, for...in walks the labels. || means 'first truthy', ?? means 'first not-missing'."</p>`}
],quiz:[
{code:`console.log(0.1 + 0.2 === 0.3, [] + [], [] == ![], null >= 0, "5" - 2, "5" + 2);`,ans:`false (empty string) true true 3 52`,why:`Floating point error; two empty arrays become "" and concatenate to ""; [] == ![] converts to 0 == 0; null becomes 0 in a relational comparison; "-" converts to number; "+" concatenates because one side is a string. (The empty string prints as nothing, so you see two spaces.)`},
{code:`console.log([10, 1, 2].sort(), [10, 1, 2].sort((a, b) => a - b), ['1','2','3'].map(parseInt));`,ans:`[1, 10, 2] [1, 2, 10] [1, NaN, NaN]`,why:`The default sort compares as strings. map passes (value, index, array), so parseInt receives the index as the radix: parseInt("2", 1) is NaN, parseInt("3", 2) is NaN.`}]},

/* ================= DAY 3 ================= */
{n:3,title:"Functions, scope and hoisting",goal:"Master functions as values, how names are looked up, and what really happens before your code runs.",topics:[
{id:"d3-functions",title:"Functions in depth",
eli5:`<p>A function is a <b>recipe card</b>. You write the steps once and give the card a name. Every time you say "make pancakes" you follow the card. You can hand different ingredients (parameters) to the same card, and it hands back a result (the return value).</p>`,
why:`<p>Functions let you reuse code and name ideas. In JavaScript they are also <b>values</b> (first-class): you can store them in variables, pass them to other functions and return them. This one fact powers callbacks, closures, promises and most of the language.</p>`,
tech:`<ul class="pts"><li><b>Declaration:</b> <code>function add(a,b){...}</code> (hoisted whole). <b>Expression:</b> <code>const add = function(a,b){...}</code>. <b>Arrow:</b> <code>const add = (a,b) =&gt; a+b</code>.</li><li><b>Arrow functions</b> have no own <code>this</code>, <code>arguments</code>, <code>super</code> or <code>new.target</code>, and cannot be called with <code>new</code>.</li><li><b>Parameters:</b> defaults (<code>(a, b = 2)</code>, evaluated at call time), rest (<code>(...args)</code> is a real array), and destructuring.</li><li>Missing arguments are <code>undefined</code>; extra arguments are ignored (but available via <code>arguments</code> in non-arrow functions).</li><li>A function without <code>return</code> returns <code>undefined</code>. <code>fn.length</code> is the number of parameters before the first default/rest.</li><li><b>IIFE:</b> <code>(function(){...})()</code> creates a private scope immediately (less needed now that modules and blocks exist).</li></ul>`,
diagram:{html:flow([["call add(2, 3)"],["new execution context","a=2, b=3","w"],["run body"],["return 5","context removed from stack","g"]]),steps:["A call pushes a new execution context (a frame) onto the call stack.","Parameters become local bindings.","The body runs; nested calls push more frames.","<code>return</code> pops the frame and hands the value back."]},
ex:[{t:"Defaults, rest, first-class functions",code:`function greet(name = "friend", ...rest) {
  return "Hi " + name + " +" + rest.length;
}
console.log(greet(), greet("Ana", 1, 2, 3));
const twice = (f) => (x) => f(f(x));
console.log(twice((n) => n * 3)(2));`},
{t:"Arrow vs regular: arguments and returning objects",code:`function reg(){ return arguments.length; }
const arrow = () => ({ ok: true });   // parentheses return an object literal
console.log(reg(1,2,3), arrow());
let n = 0;
function counter(step = ++n){ return step; }
console.log(counter(), counter(), counter());`}],
browser:`<p>Event handlers, <code>setTimeout</code> and <code>fetch().then</code> all take functions: that is the callback model. The browser calls your function later, when the stack is empty (Week 3).</p>`,
gotchas:[`Arrow functions returning an object literal need parentheses: <code>() =&gt; ({a:1})</code>, otherwise the braces are a block.`,`Default parameter expressions run on every call and can see earlier parameters, but not variables declared in the body.`,`A function declaration inside an <code>if</code> block behaves differently in sloppy and strict mode; avoid it.`,`<code>return</code> followed by a new line returns undefined (ASI).`,`Calling a function with <code>new</code> that is an arrow or method throws TypeError.`],
best:[`Keep functions small and single-purpose; prefer pure functions (same input, same output, no side effects).`,`Use rest parameters instead of <code>arguments</code>; name arrow callbacks when debugging matters.`,`Limit parameters (3 or fewer) or pass an options object.`],
iq:[["fresher","Function declaration vs expression?","Declarations are hoisted with their body so they can be called before they appear; expressions are values assigned to a variable and exist only after that line runs."],["mid","How do arrow functions differ from normal ones?","No own this/arguments/super/new.target, not constructible, no prototype property, concise body syntax. this comes lexically."],["senior","What are first-class and higher-order functions?","First-class: functions are values. Higher-order: functions that take or return functions (map, debounce, compose). Together they enable closures, currying and middleware."]],
practice:[`Write <code>compose(...fns)</code> and <code>pipe(...fns)</code>.`,`Write <code>sum(...nums)</code> without using <code>arguments</code>.`],
teach:`<p>"A function is a named recipe card. In JavaScript the card itself is a thing you can pass around, which is why callbacks work. Arrows are short cards that borrow 'this' from where they were written."</p>`},

{id:"d3-scope",title:"Scope and the scope chain",
eli5:`<p>Imagine looking for your shoes. First you check your <b>room</b>. Not there? Check the <b>house</b>. Not there? Check the <b>neighborhood</b>. You never look into a neighbor's house, and the neighbors can't see inside your room. Scope is the "where can I look for names" rule, and the scope chain is the order: closest place first, then outward.</p>`,
why:`<p>Scope prevents names from colliding and lets code hide its internals. JavaScript uses <b>lexical (static) scope</b>: where a function is <i>written</i> decides what it can see, not where it is called.</p>`,
tech:`<ul class="pts"><li><b>Global</b> (script level), <b>module</b> (file level), <b>function</b> (every function body) and <b>block</b> (<code>{}</code> for let/const/class).</li><li>Each scope has an <b>environment record</b> (a map of names to values) and a link to its <b>outer environment</b>. Name lookup walks that chain outward until found, else <code>ReferenceError</code>.</li><li><b>Shadowing:</b> an inner name hides an outer one with the same name.</li><li>The chain is fixed when a function is <i>created</i> (this is the basis of closures).</li></ul>`,
diagram:{html:`<div style="border:2px solid var(--ink);border-radius:10px;padding:10px"><b>Global</b>: x = "global"<div style="border:2px solid var(--accent);border-radius:8px;padding:10px;margin:8px 0 0"><b>outer()</b>: x = "outer", y = 1<div style="border:2px solid var(--warm);border-radius:8px;padding:10px;margin:8px 0 0"><b>inner()</b>: z = 2<br>looks up <code>x</code> → not here → outer → found "outer"</div></div></div>`,steps:["<code>inner</code> looks for <code>x</code> in its own scope: not found.","It follows its outer link to <code>outer</code>'s scope: found, stop.","If it had not been there, it would go to Global; if still missing, ReferenceError.","Inner scopes can read outer ones, never the reverse."]},
ex:[{t:"Lexical scope",code:`const x = "global";
function outer(){
  const x = "outer";
  function inner(){ return x; }   // resolves where it was WRITTEN
  return inner;
}
function caller(){ const x = "caller"; return outer()(); }
console.log(caller());`},
{t:"Block scope",code:`const fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
const fns2 = [];
for (let j = 0; j < 3; j++) fns2.push(() => j);
console.log(fns.map(f => f()), fns2.map(f => f()));`}],
browser:`<p>Classic scripts share one global scope across all <code>&lt;script&gt;</code> tags (name collisions are real). ES modules each get their own scope. Browser DevTools show the active scope chain (Local, Closure, Script, Global) in the debugger's Scope panel.</p>`,
gotchas:[`Accidental globals: assigning to an undeclared name in sloppy mode creates a global.`,`<code>var</code> ignores blocks, so a variable declared in an <code>if</code> leaks to the whole function.`,`Function parameters and the function body share scope unless defaults are used, in which case a separate parameter scope exists.`,`Dynamic scope (where the function is called from) does not exist in JavaScript; <code>this</code> is the dynamic part.`,`Inside <code>eval</code> or <code>with</code> (sloppy mode) scope analysis breaks; never use them.`],
best:[`Keep scopes small; avoid globals; use modules for isolation.`,`Do not shadow names unless intentionally; enable the no-shadow lint rule.`],
iq:[["fresher","What is scope?","The region of code where a name is visible. JavaScript has global, function, block and module scope."],["mid","What is lexical scope?","Name resolution is decided by the position of code in the source, fixed at creation time, not by who calls the function."],["senior","Describe the scope chain in terms of the spec.","Each execution context has a LexicalEnvironment: an environment record plus an [[OuterEnv]] reference. Resolution of an identifier reference walks outward through those records until a binding is found."]],
practice:[`Predict the output of nested functions that shadow names, then verify in the DevTools Scope panel.`],
teach:`<p>"Names are looked up like shoes: my room, then the house, then the neighborhood. Where a function is written decides what it can see, not where it's called."</p>`},

{id:"d3-hoisting",title:"Hoisting and the temporal dead zone",
eli5:`<p>Before a teacher starts class, they read the attendance list so they know every name. You don't have to be in your seat yet, but your name is on the list. <b>Hoisting</b> is that list reading. With <code>var</code> you are marked "here, but empty" right away. With <code>let</code> and <code>const</code> you are on the list but told "wait outside" until your turn: that's the <b>dead zone</b>.</p>`,
why:`<p>JavaScript runs in two phases per scope: a <b>creation phase</b> that registers declarations, and an <b>execution phase</b>. Hoisting is a side effect of that. It let mutual recursion and function-first code styles work, but made <code>var</code> confusing, so TDZ was added for let/const/class.</p>`,
tech:`<table><tr><th>Declaration</th><th>Hoisted?</th><th>Value before its line</th></tr><tr><td>function declaration</td><td>yes, fully</td><td>the function itself</td></tr><tr><td>var</td><td>yes</td><td>undefined</td></tr><tr><td>let / const / class</td><td>yes (binding exists)</td><td>uninitialized: ReferenceError (TDZ)</td></tr><tr><td>function expression / arrow</td><td>name follows var/let/const rules</td><td>undefined or TDZ</td></tr></table>
<p>If a function declaration and a <code>var</code> share a name, the function wins at creation, then any later assignment overwrites it. Imports are hoisted too (modules link before execution).</p>`,
diagram:{html:flow([["1. Creation phase","scan scope; register names","w"],["var → undefined<br>function → its body<br>let/const → TDZ"],["2. Execution phase","run lines in order; initialize let/const when reached","g"]]),steps:["The engine scans the scope and creates every binding.","<code>var</code> bindings start as <code>undefined</code>; function declarations get their function object.","<code>let</code>, <code>const</code> and <code>class</code> bindings exist but cannot be touched yet.","Execution proceeds; reaching the declaration line ends the dead zone."]},
ex:[{t:"What does each line do?",code:`console.log(typeof hoisted, typeof notHoisted);
function hoisted(){ return 1; }
var notHoisted = function(){};
try { console.log(late); } catch (e) { console.log(e.name + ": " + e.message); }
let late = "now ready";
console.log(late);`},
{t:"TDZ is by time, not position",code:`function show(){ return value; }   // fine to write before the declaration
try { show(); } catch (e) { console.log(e.name); }
let value = 42;
console.log(show());`}],
gotchas:[`<code>typeof x</code> is "undefined" for an undeclared name but <b>throws</b> if x is in its TDZ.`,`Default parameters have their own TDZ: <code>function f(a = b, b){}</code> throws when called without a.`,`<code>class</code> declarations are not usable before the line that defines them.`,`A function declared inside a block is hoisted to the block's top (strict mode) but has legacy semantics in sloppy mode.`,`Hoisting moves <i>declarations</i>, not initializations: <code>var a = 1</code> hoists only the <code>var a</code> part.`],
best:[`Declare before use; use <code>const</code>/<code>let</code> so mistakes fail loudly instead of giving undefined.`,`Rely on function-declaration hoisting only for readability (main logic at the top, helpers below).`],
iq:[["fresher","What is hoisting?","Declarations are registered at the start of their scope before code executes, so some names can be used before their line."],["mid","Are let and const hoisted?","Yes, but they are uninitialized until the declaration runs (TDZ), so early access throws a ReferenceError."],["senior","What does the engine do between 'creation' and 'execution'?","Creates the environment record: params and var names set to undefined, function declarations instantiated, lexical declarations marked uninitialized. Execution then initializes lexical bindings when their declaration statements evaluate."]],
practice:[`Write snippets that show each row of the hoisting table and run them.`],
teach:`<p>"Before running, JavaScript reads the name list. var names are on the list as 'empty', functions are fully ready, let and const names are on the list but locked until their line."</p>`}
],quiz:[
{code:`console.log(typeof f, typeof g);
function f(){}
var g = function(){};`,ans:`function undefined`,why:`The function declaration is fully hoisted; for the var, only the name is hoisted (as undefined) and the assignment happens later.`},
{code:`let v = 'outer';
function t(){
  try { console.log(v); } catch (e) { console.log(e.name); }
  let v = 'inner';
}
t();`,ans:`ReferenceError`,why:`The inner let v shadows the outer one for the whole function body, so reading v before its declaration hits the temporal dead zone instead of seeing 'outer'.`}]},

/* ================= DAY 4 ================= */
{n:4,title:"this, strings and regular expressions",goal:"Know exactly how this is decided, how text really works (UTF-16), and how to use regexes safely.",topics:[
{id:"d4-this",title:"The this keyword",
eli5:`<p><code>this</code> is the word <b>"me"</b>. When I say "me", it means whoever is speaking. If Ana says "my name", it's Ana's name; if Ravi says it, Ravi's. A normal function figures out "me" when it is <i>called</i>, by looking at who called it. An arrow function is like a parrot that repeats the "me" of the place it was born.</p>`,
why:`<p><code>this</code> lets one function serve many objects (methods, constructors, event handlers). Because it is bound at call time rather than write time, it is also the most common source of bugs.</p>`,
tech:`<p>For non-arrow functions, <code>this</code> is decided at the call site, using these rules in priority order:</p><ol><li><b>new</b>: <code>this</code> is the newly created object.</li><li><b>Explicit</b>: <code>fn.call(obj)</code>, <code>fn.apply(obj)</code>, <code>fn.bind(obj)</code> (bound functions ignore later rebinding).</li><li><b>Implicit</b>: <code>obj.method()</code> → <code>this</code> is <code>obj</code> (the object before the dot).</li><li><b>Default</b>: plain call → <code>undefined</code> in strict mode, <code>globalThis</code> in sloppy mode.</li></ol><p><b>Arrow functions</b> skip all of that and use the <code>this</code> of the enclosing scope, fixed when the arrow is created. In ES modules and classes, code is strict, so a lost <code>this</code> becomes undefined. DOM event handlers (non-arrow) get <code>this === event.currentTarget</code>.</p>`,
diagram:{html:flow([["Called with new?","this = new object"],["call / apply / bind?","this = given object","w"],["obj.method() ?","this = obj","g"],["otherwise","strict: undefined, sloppy: global","r"]],{v:true}),steps:["Check top to bottom; the first rule that matches decides <code>this</code>.","An arrow function never reaches this chart: it takes <code>this</code> from its surrounding scope.","Pulling a method off its object (<code>const f = obj.method</code>) removes the 'before the dot', so rule 3 no longer applies."]},
ex:[{t:"The four rules and the lost this",code:`'use strict';
const person = {
  name: "Ana",
  hi(){ return this && this.name; },
  later(){ return [1].map(() => this.name); },   // arrow keeps this
  broken(){ return [1].map(function(){ return this; }); }
};
const hi = person.hi;
console.log(person.hi());          // implicit
console.log(hi());                 // default (strict)
console.log(hi.call({ name: "Ravi" }));   // explicit
console.log(person.later());
console.log(person.broken());
function P(n){ this.n = n; }
console.log(new P(7).n);`}],
browser:`<p>In a browser event listener written as <code>el.addEventListener("click", function(){ this })</code>, <code>this</code> is the element. With an arrow it is the outer <code>this</code> (often <code>window</code> or undefined). At the top of a classic script <code>this === window</code>; at the top of an ES module it is <code>undefined</code>; in CommonJS it is <code>module.exports</code>.</p>`,
gotchas:[`Passing a method as a callback (<code>setTimeout(obj.method)</code>, <code>arr.map(obj.method)</code>) loses <code>this</code>.`,`<code>bind</code> returns a new function; a bound function can't be re-bound with call/apply, but <code>new</code> overrides the bound <code>this</code>.`,`Arrow functions in object literals do not get the object as <code>this</code>.`,`Class fields defined with arrows (<code>handler = () =&gt; {...}</code>) create a per-instance function (extra memory) but fix <code>this</code>.`,`<code>call</code> with <code>null</code> in sloppy mode gives the global object.`],
best:[`Use arrow functions for callbacks inside methods; use regular methods on objects/classes.`,`Bind once (constructor or class field) when passing methods around.`,`Prefer plain functions with explicit parameters when you don't need <code>this</code>.`],
iq:[["fresher","What is this in JavaScript?","A keyword referring to the execution context's object, determined by how a function is called (or lexically for arrows)."],["mid","Explain call, apply and bind.","call invokes with this and individual args; apply invokes with this and an args array; bind returns a new function with this (and optionally leading args) fixed."],["mid","Write a bind polyfill.","<pre><code>Function.prototype.myBind = function (ctx, ...pre) {\n  const fn = this;\n  function bound(...args) {\n    return fn.apply(this instanceof bound ? this : ctx, [...pre, ...args]);\n  }\n  bound.prototype = Object.create(fn.prototype);\n  return bound;\n};</code></pre>Handle partial application, support new, keep the prototype."],["senior","Why do arrow functions not have their own this?","They were designed for callbacks: they resolve this like any other variable through the scope chain, so there is nothing to bind."]],
practice:[`Fix a class whose method loses <code>this</code> when used as an event handler in three different ways.`,`Implement <code>call</code> and <code>apply</code> polyfills.`],
teach:`<p>"this means 'me'. For a normal function, 'me' is whoever called it: the thing before the dot. Take the function out of the object and nobody is calling it, so 'me' is lost. Arrow functions don't have their own 'me', they borrow it from outside."</p>`},

{id:"d4-strings",title:"Strings, Unicode and template literals",
eli5:`<p>A string is a <b>necklace of beads</b>, each bead a letter. Most beads are one piece, but fancy emoji beads are two glued pieces. If you count pieces you get 2; if you count beads you get 1. Strings can't be changed: to "change" a necklace you make a new one.</p>`,
why:`<p>JavaScript strings are sequences of 16-bit UTF-16 code units, chosen when Unicode had under 65,536 characters. Today emoji and many scripts need two units (a <b>surrogate pair</b>), so naive length and indexing break on them.</p>`,
tech:`<ul class="pts"><li>Strings are immutable. Methods like <code>slice</code>, <code>replace</code>, <code>toUpperCase</code> return new strings.</li><li><code>length</code> counts <b>code units</b>, not characters. <code>[...str]</code> and <code>for...of</code> iterate <b>code points</b>. <code>Intl.Segmenter</code> iterates <b>grapheme clusters</b> (what users see as one character, e.g. a family emoji).</li><li>Use <code>"\\u{1F600}"</code> escapes; <code>normalize("NFC")</code> before comparing accented text; <code>localeCompare</code> for locale sorting.</li><li>Methods: <code>at(-1)</code>, <code>slice</code> (negatives ok), <code>substring</code>, <code>padStart</code>, <code>replaceAll</code>, <code>includes</code>, <code>startsWith</code>, <code>split</code>, <code>trim</code>, <code>isWellFormed()</code> (ES2024). Avoid the deprecated <code>substr</code>.</li><li><b>Template literals</b> (backtick strings) allow multi-line text and <code>\${expression}</code> interpolation; <b>tagged templates</b> pass the pieces to a function.</li></ul>`,
diagram:{html:flow([["\"a😀\"","what you see: 2 characters"],["UTF-16 units","a | D83D | DE00","w"],["length","3 code units","r"],["[...str].length","2 code points","g"]]),steps:["The emoji needs more than 16 bits, so it is stored as two code units (a surrogate pair).","<code>length</code> counts code units, so it reports 3.","Spread and <code>for...of</code> understand surrogate pairs and give 2 items.","Combining sequences (flags, skin tones, family emoji) can still be several code points: use <code>Intl.Segmenter</code>."]},
ex:[{t:"Length lies, and case mapping surprises",code:`const s = "a😀";
console.log(s.length, [...s].length);
console.log("ß".toUpperCase(), "İ".toLowerCase().length);
console.log("abc".at(-1), "abcdef".slice(-3, -1), "x".padStart(3, "0"));
const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
console.log([...seg.segment("👨‍👩‍👧")].length, [..."👨‍👩‍👧"].length);`},
{t:"Template literals and tags",code:`const who = "world", n = 3;
console.log(\`Hello \${who}, \${n * 2} items\`);
function upper(strings, ...vals){
  return strings.raw.map((s, i) => s + (vals[i] ? String(vals[i]).toUpperCase() : "")).join("");
}
console.log(upper\`hi \${who}!\`);`}],
browser:`<p>The DOM and URLs use UTF-16 strings; <code>encodeURIComponent</code> encodes text for URLs; <code>TextEncoder</code>/<code>TextDecoder</code> convert to and from UTF-8 bytes (what the network uses). <code>btoa</code> only handles Latin-1; encode Unicode first.</p>`,
gotchas:[`<code>"😀".length</code> is 2; <code>"😀".split("")</code> breaks the pair into two invalid halves.`,`<code>"é"</code> can be one code point or two (e + combining accent); <code>"é" === "é"</code> may be false without <code>normalize</code>.`,`<code>"ß".toUpperCase()</code> is "SS", so length can change.`,`<code>sort()</code> on strings is by code unit, not alphabet; use <code>localeCompare</code> or <code>Intl.Collator</code>.`,`String concatenation in a loop is fine in modern engines (ropes), but build large output with arrays and <code>join</code> if profiling shows a problem.`],
best:[`Use template literals for interpolation; never build HTML or SQL by concatenating untrusted strings.`,`Count user-visible characters with <code>Intl.Segmenter</code>, not <code>length</code>.`,`Normalize before comparing or storing user text.`],
iq:[["fresher","Are strings mutable?","No. Every string method returns a new string."],["mid","Why is '😀'.length 2?","Strings are UTF-16 code units. Characters above U+FFFF use two units (a surrogate pair)."],["senior","How do you reverse a string correctly?","Not with split(''). Segment into graphemes with Intl.Segmenter, reverse the segments, and join; spread alone fails for combining sequences."]],
practice:[`Write <code>truncate(str, n)</code> that never cuts an emoji in half.`,`Implement a tagged template that escapes HTML in its values.`],
teach:`<p>"A string is a necklace you can't edit. JavaScript counts in 16-bit pieces, so an emoji is two pieces. To count what people see, use Intl.Segmenter."</p>`},

{id:"d4-regex",title:"Regular expressions",
eli5:`<p>A regular expression is a <b>pattern stamp</b>. Instead of searching for the exact word "cat", you describe a shape: "three letters, starting with c, ending with t". Then you press the stamp over a page and it highlights everything that fits the shape.</p>`,
why:`<p>Searching, validating and extracting from text is constant work. Regular expressions describe patterns compactly and are built into the language and every browser.</p>`,
tech:`<ul class="pts"><li>Literal <code>/ab+c/gi</code> or <code>new RegExp("ab+c", "gi")</code>. Flags: <code>g</code> global, <code>i</code> ignore case, <code>m</code> multiline, <code>s</code> dot matches newline, <code>u</code> Unicode, <code>v</code> Unicode sets (ES2024), <code>y</code> sticky, <code>d</code> indices.</li><li>Building blocks: classes <code>\\d \\w \\s</code>, quantifiers <code>* + ? {n,m}</code> (add <code>?</code> for lazy), groups <code>(…)</code>, named groups <code>(?&lt;year&gt;\\d{4})</code>, alternation <code>|</code>, lookahead <code>(?=…)</code>, lookbehind <code>(?&lt;=…)</code>, backreference <code>\\1</code>.</li><li>Methods: <code>re.test(s)</code>, <code>s.match(re)</code>, <code>s.matchAll(re)</code> (needs g), <code>s.replace(re, fn)</code>, <code>s.split(re)</code>.</li><li>ES2025: inline modifiers <code>(?i:…)</code>, duplicate named groups in different alternatives, and <code>RegExp.escape(str)</code> to safely embed literal text.</li></ul>`,
diagram:{html:flow([["/(?&lt;y&gt;\\d{4})-(?&lt;m&gt;\\d{2})/"],["engine scans text left to right","tries to match at each position","w"],["match found","groups.y, groups.m","g"]]),steps:["The pattern compiles to a small program (and may be JIT-compiled).","At each starting position the engine tries to follow the pattern, backtracking when a choice fails.","On success, captures are returned. Nested quantifiers can backtrack exponentially on failure (ReDoS)."]},
ex:[{t:"Named groups, matchAll, replace callback",code:`const re = /(?<y>\\d{4})-(?<m>\\d{2})/g;
const text = "2026-03 and 2027-11";
for (const m of text.matchAll(re)) console.log(m.groups.y, m.groups.m);
console.log(text.replace(re, (_, y, m) => m + "/" + y));
console.log("a1b22".replace(/\\d+/g, (d) => "<" + d + ">"));`},
{t:"The lastIndex trap with g and test()",code:`const re = /a/g;
console.log(re.test("a"), re.test("a"), re.test("a"));
re.lastIndex = 0;
console.log(re.test("a"));
console.log(typeof RegExp.escape === "function" ? RegExp.escape("1+1=2?") : "RegExp.escape not available here");`,note:"<code>RegExp.escape</code> deliberately escapes a leading digit (as <code>\\x31</code>) and some punctuation like <code>=</code>, so the result is safe anywhere in a pattern. The odd-looking output is correct."}],
browser:`<p>The same engine rules apply in Node. The <code>pattern</code> attribute on <code>&lt;input&gt;</code> uses the <code>v</code> flag semantics in current browsers. Regexes run on the main thread, so a slow pattern freezes the page.</p>`,
gotchas:[`A regex with the <code>g</code> or <code>y</code> flag keeps state in <code>lastIndex</code>; reusing it with <code>test()</code> alternates true/false.`,`Catastrophic backtracking (ReDoS): patterns like <code>(a+)+$</code> on long non-matching input can take exponential time. Never run untrusted patterns or complex ones on untrusted text.`,`<code>.</code> doesn't match newlines unless <code>s</code> flag; <code>^</code>/<code>$</code> match only string ends unless <code>m</code>.`,`<code>\\w</code> is ASCII-only; use <code>\\p{L}</code> with the <code>u</code> flag for letters in any language.`,`<code>str.replace("a","b")</code> with a string replaces only the first match; use <code>replaceAll</code> or a global regex.`],
best:[`Prefer named groups for readability; anchor patterns; keep them simple and tested.`,`Use <code>RegExp.escape</code> (or a small helper) when building patterns from user input.`,`Don't validate emails or HTML with a single clever regex; use simple checks plus server verification, or a parser.`],
iq:[["fresher","How do you test whether a string contains digits?","<code>/\\d/.test(str)</code>."],["mid","Why does a global regex alternate true/false with test()?","The g flag makes the regex stateful: each test starts at lastIndex and updates it. After a failure it resets to 0."],["senior","What is ReDoS and how do you avoid it?","Regular expression Denial of Service: nested/overlapping quantifiers cause exponential backtracking. Avoid ambiguous nested quantifiers, bound input length, use atomic-like constructs where supported, or use a linear-time engine for untrusted patterns."]],
practice:[`Write a regex that captures the key and value from <code>key=value; key2=value2</code> using matchAll.`,`Write a function that converts <code>snake_case</code> to <code>camelCase</code> with one replace.`],
teach:`<p>"A regex is a pattern stamp for text. Flags change how it stamps. Careful: the g flag remembers where it stopped, and tricky patterns can freeze the page."</p>`}
],quiz:[
{code:`'use strict';
const o = { n: 'o', f(){ return this && this.n; } };
const f = o.f;
console.log(o.f(), f(), f.bind({ n: 'b' })());`,ans:`o undefined b`,why:`o.f() has the object before the dot. The extracted f() has no receiver, so in strict mode this is undefined (the && short-circuits to undefined). bind sets this explicitly.`},
{code:`console.log('😀'.length, [...'😀'].length, 'ß'.toUpperCase(), 'abc'.at(-1));`,ans:`2 1 SS c`,why:`The emoji is one code point but two UTF-16 code units; uppercase of ß is SS; at(-1) counts from the end.`}]},

/* ================= DAY 5 ================= */
{n:5,title:"Arrays, objects, collections and dates",goal:"Handle JavaScript's workhorse data structures correctly, including all the surprising parts.",topics:[
{id:"d5-arrays",title:"Arrays and their methods",
eli5:`<p>An array is a <b>row of numbered lockers</b>, starting at locker 0. You can add a locker at the end or the start, look inside any locker by its number, and walk down the row doing something to each locker's contents.</p>`,
why:`<p>Ordered lists are everywhere: rows from a server, items in a cart. Arrays are objects with integer keys and a magic <code>length</code>, and engines optimize them into real contiguous memory when you use them normally.</p>`,
tech:`<table><tr><th>Goal</th><th>Method</th><th>Mutates?</th></tr><tr><td>Add/remove end</td><td>push / pop</td><td>yes</td></tr><tr><td>Add/remove start</td><td>unshift / shift</td><td>yes</td></tr><tr><td>Transform</td><td>map, flatMap</td><td>no</td></tr><tr><td>Select</td><td>filter, find, findLast, some, every, includes, indexOf</td><td>no</td></tr><tr><td>Combine</td><td>reduce, flat, concat, join</td><td>no</td></tr><tr><td>Sort / reverse</td><td>sort, reverse (mutate) vs toSorted, toReversed (copy)</td><td>see left</td></tr><tr><td>Edit</td><td>splice (mutates) vs toSpliced, with (copy)</td><td>see left</td></tr><tr><td>Create</td><td>Array.from, Array.of, Array(n).fill()</td><td>-</td></tr></table>
<ul class="pts"><li>Default <code>sort()</code> converts items to strings and compares UTF-16 order. Always pass a comparator for numbers. Sort is stable since ES2019.</li><li><b>Holes</b> (sparse arrays) come from <code>Array(3)</code>, <code>delete arr[i]</code> or assigning past the end. <code>forEach/map/filter</code> skip holes; <code>for...of</code> and spread turn them into <code>undefined</code>.</li><li><code>reduce</code> without an initial value uses the first element and throws on an empty array.</li><li><code>at(-1)</code> reads from the end. Array-likes (<code>arguments</code>, NodeList) are not arrays; convert with <code>Array.from</code>.</li></ul>`,
diagram:{html:flow([["[3, 1, 2]","source"],["filter(n => n > 1)","[3, 2]","w"],["map(n => n * 10)","[30, 20]","w"],["reduce((a, b) => a + b, 0)","50","g"]]),steps:["Each step produces a new value; the original array is untouched.","Chaining reads like a pipeline: select, transform, combine.","For huge data, remember each step allocates an intermediate array (iterator helpers on Day 9 avoid this)."]},
ex:[{t:"Sort and map surprises",code:`console.log([10, 9, 1].sort());
console.log([10, 9, 1].toSorted((a, b) => a - b));
console.log(["10", "10", "10"].map(parseInt));
const a = [3, 1, 2];
const b = a.toSorted();
console.log(a, b);
console.log(a.at(-1), a.includes(NaN), [NaN].includes(NaN), [NaN].indexOf(NaN));`},
{t:"Holes",code:`const sparse = [1, , 3];
console.log(sparse.length, sparse);
sparse.forEach((v, i) => console.log("forEach", i, v));
console.log([...sparse]);
console.log(Array(3).fill(0), Array.from({ length: 3 }, (_, i) => i * i));`}],
gotchas:[`Default <code>sort()</code> is lexicographic: <code>[10,9,1].sort()</code> gives <code>[1,10,9]</code>.`,`<code>["1","2","3"].map(parseInt)</code> is <code>[1, NaN, NaN]</code>.`,`<code>arr.length = 0</code> empties the array in place; it is also writable to truncate.`,`<code>Array(3).map(...)</code> does nothing (holes). Use <code>Array.from({length:3}, fn)</code> or <code>fill</code> first.`,`<code>typeof []</code> is "object". <code>[] + []</code> is "".`,`<code>reduce</code> on an empty array without initial value throws TypeError.`,`<code>const arr = [...]</code> only freezes the binding; <code>sort</code>, <code>reverse</code>, <code>splice</code> mutate in place.`],
best:[`Prefer non-mutating methods (<code>toSorted</code>, <code>toReversed</code>, <code>with</code>, <code>toSpliced</code>) when state is shared.`,`Always give <code>reduce</code> an initial value; always give <code>sort</code> a comparator.`,`Avoid <code>delete arr[i]</code>; use <code>splice</code> or <code>filter</code>.`],
iq:[["fresher","How do you remove duplicates from an array?","<code>[...new Set(arr)]</code> (primitives). For objects, use a Map keyed by an id."],["mid","map vs forEach?","map returns a new array of results; forEach returns undefined and is for side effects."],["mid","Implement Array.prototype.map and reduce.","Loop over own indices that exist (<code>i in this</code>), call the callback with (value, index, array), collect results. For reduce handle the no-initial-value case by seeding with the first existing element and throw on empty."],["senior","Why is shift() slow on huge arrays?","It must move every remaining element down one slot (O(n)); engines mitigate with tricks for small arrays. Use an index pointer or a queue structure for large queues."]],
practice:[`Implement <code>flatten(arr, depth)</code> without <code>flat</code>.`,`Group an array of orders by customer with reduce, then with <code>Object.groupBy</code>.`],
teach:`<p>"An array is a row of numbered lockers starting at zero. Some tools change the row (push, sort), some give you a new row (map, filter, toSorted). Default sort treats everything as words, so always pass a comparison for numbers."</p>`},

{id:"d5-objects",title:"Objects, property order and copying",
eli5:`<p>An object is a <b>labeled drawer unit</b>: each drawer has a name (the key) and holds something (the value). A <b>shallow copy</b> photocopies the unit's labels but both units still point to the same inner boxes. A <b>deep copy</b> rebuilds everything inside too.</p>`,
why:`<p>Objects model real things and are the base of almost everything in JavaScript (arrays, functions and classes are objects). They are dynamic: properties can be added or removed at any time, which has performance consequences (Day 21).</p>`,
tech:`<ul class="pts"><li>Keys are strings or symbols (numbers become strings). Shorthand <code>{a, b}</code>, computed keys <code>{[k]: v}</code>, methods <code>{f(){}}</code>, getters/setters.</li><li><b>Key order:</b> integer-like keys ascending, then string keys in insertion order, then symbols in insertion order.</li><li><code>Object.keys/values/entries</code> list own enumerable string keys. <code>for...in</code> also walks inherited enumerable keys. <code>Reflect.ownKeys</code> lists everything own.</li><li>Check keys with <code>Object.hasOwn(obj, k)</code> (not <code>in</code>, which includes the prototype chain).</li><li><b>Copy:</b> spread <code>{...a}</code> and <code>Object.assign</code> are shallow. <code>structuredClone</code> is deep (Day 10). <code>JSON.parse(JSON.stringify(x))</code> loses undefined, functions, Dates, Maps and throws on cycles.</li><li><code>Object.groupBy(items, fn)</code> (ES2024) returns a <b>null-prototype</b> object; <code>Map.groupBy</code> allows any key type.</li><li>Property descriptors: <code>writable, enumerable, configurable</code>; <code>Object.defineProperty</code>.</li></ul>`,
diagram:{html:lanes([["original",["{ name: 'Ana', tags ─┐"]],["shallow copy (spread)",["{ name: 'Ana', tags ─┐"]],["shared inner array",["tags: ['a','b']  ← both point here"]]]),steps:["Spread copies the top-level property values.","For nested objects/arrays, the value is a reference, so both copies reference the same inner object.","Mutating <code>copy.tags.push('c')</code> changes the original too. Use <code>structuredClone</code> for an independent copy."]},
ex:[{t:"Key order",code:`const o = { b: 1, 2: "two", a: 2, 1: "one", [Symbol("s")]: 0 };
console.log(Object.keys(o));
console.log(Reflect.ownKeys(o).length);
const grouped = Object.groupBy([1, 2, 3, 4], (n) => (n % 2 ? "odd" : "even"));
console.log(grouped, Object.getPrototypeOf(grouped));`},
{t:"Shallow vs deep",code:`const orig = { name: "Ana", tags: ["a"] };
const shallow = { ...orig };
const deep = structuredClone(orig);
shallow.tags.push("b");
console.log(orig.tags, deep.tags);
console.log(Object.hasOwn(orig, "name"), "toString" in orig, Object.hasOwn(orig, "toString"));`}],
gotchas:[`<code>for...in</code> includes inherited enumerable properties; filter with <code>hasOwn</code> or use <code>Object.keys</code>.`,`Spread and <code>Object.assign</code> are shallow; later keys overwrite earlier ones; getters are invoked and copied as values.`,`<code>Object.groupBy</code> result has no prototype, so <code>result.hasOwnProperty</code> doesn't exist; use <code>Object.hasOwn</code>.`,`Using user input as keys on a plain <code>{}</code> risks prototype pollution (<code>__proto__</code>); use <code>Map</code> or <code>Object.create(null)</code>.`,`<code>JSON.stringify</code> drops undefined, functions and symbols, turns NaN into null, and throws on BigInt and cycles.`,`<code>delete</code> on hot objects can make them slow (Day 21); set to undefined or use a Map.`],
best:[`Treat objects as immutable in shared state: copy with spread, update with new objects.`,`Use <code>Map</code> for dictionaries with arbitrary keys; use <code>Object.hasOwn</code> for checks.`,`Use <code>structuredClone</code> for deep copies of plain data.`],
iq:[["fresher","How do you check if an object has a property?","<code>Object.hasOwn(obj, 'key')</code> for own properties, <code>'key' in obj</code> to include the prototype chain."],["mid","Shallow vs deep copy?","Shallow copies the top level only, nested objects remain shared. Deep copy recursively duplicates. Use structuredClone for plain data."],["senior","What is the key iteration order?","Integer-like keys ascending, then other string keys in creation order, then symbols in creation order. for...in follows the same order and then up the prototype chain."]],
practice:[`Write <code>deepClone</code> that handles cycles (WeakMap), Date, Map and Set.`,`Write <code>pick(obj, keys)</code> and <code>omit(obj, keys)</code>.`],
teach:`<p>"An object is a drawer unit with labels. Copying with spread copies the labels, but nested drawers are still shared. Number-like labels always come first in order."</p>`},

{id:"d5-collections",title:"Map, Set, WeakMap and WeakSet",
eli5:`<p>A <b>Set</b> is a bag of unique stickers: you can't have two identical ones. A <b>Map</b> is a coat-check: you hand over anything (even an object) and get a ticket, and later the ticket gets that exact thing back. A <b>WeakMap</b> is a coat-check that throws away the coat when the owner leaves the building.</p>`,
why:`<p>Plain objects only take string/symbol keys, carry inherited properties and have no size. <code>Map</code> and <code>Set</code> fix that: any key type, guaranteed insertion order, fast add/delete, and <code>size</code>.</p>`,
tech:`<ul class="pts"><li><b>Map:</b> <code>set/get/has/delete/size/clear</code>, iterates in insertion order as <code>[key, value]</code>. Keys use SameValueZero (<code>NaN</code> equals <code>NaN</code>, <code>+0</code> equals <code>-0</code>), objects compared by identity.</li><li><b>Set:</b> unique values. ES2025 adds <code>union, intersection, difference, symmetricDifference, isSubsetOf, isSupersetOf, isDisjointFrom</code>.</li><li><b>WeakMap/WeakSet:</b> keys must be objects (or non-registered symbols); they don't prevent garbage collection, are not iterable and have no size. Use them for private data or caches keyed by objects.</li><li><b>WeakRef/FinalizationRegistry</b> exist but cleanup timing is not guaranteed; avoid depending on them.</li><li>ES2026 proposes <code>getOrInsert</code> / <code>getOrInsertComputed</code> on Map and WeakMap (feature-detect before using).</li></ul>`,
diagram:{html:lanes([["Map",["key can be anything","insertion ordered","size property"]],["Set",["unique values only","insertion ordered","fast has()"]],["WeakMap / WeakSet",["object keys only","not iterable, no size","entry vanishes when the key is garbage collected"]]]),steps:["Choose Map/Set for general collections.","Choose WeakMap/WeakSet when you attach data to objects you don't own and must not keep them alive."]},
ex:[{t:"Map vs object, Set operations",code:`const m = new Map([[NaN, "nan"], [{}, "obj"]]);
console.log(m.get(NaN), m.get({}), m.size);
const a = new Set([1, 2, 3]), b = new Set([3, 4]);
if (a.union) {
  console.log(a.union(b), a.intersection(b), a.difference(b));
} else {
  console.log([...new Set([...a, ...b])], [...a].filter((x) => b.has(x)));
}
console.log([...new Set([1, 1, 2, 2, 3])]);`},
{t:"WeakMap for private data",code:`const priv = new WeakMap();
class Counter {
  constructor(){ priv.set(this, { n: 0 }); }
  inc(){ return ++priv.get(this).n; }
}
const c = new Counter();
c.inc();
console.log(c.inc(), Object.keys(c));`}],
gotchas:[`Maps do not serialize with <code>JSON.stringify</code> (they become <code>{}</code>); convert with <code>Object.fromEntries(map)</code>.`,`Two equal-looking objects are two keys in a Set/Map.`,`WeakMap keys cannot be primitives (TypeError).`,`Modifying a Map/Set while iterating is allowed and new entries are visited; deleting an unvisited entry skips it.`,`Set method support: Baseline in current browsers and Node 22+; feature-detect on older runtimes.`],
best:[`Use <code>Set</code> for membership tests (O(1)) instead of <code>array.includes</code> in loops.`,`Use <code>Map</code> for dynamic keys; use plain objects for fixed-shape records.`,`Prefer WeakMap over a hidden property to attach metadata to objects you don't own.`],
iq:[["fresher","Map vs Object?","Map accepts any key type, keeps insertion order, has size, and has no inherited keys; objects only use strings/symbols and have a prototype."],["mid","What makes WeakMap 'weak'?","Its keys are held weakly: if nothing else references the key object, the entry can be garbage collected. That is why it isn't iterable."],["senior","How would you implement an LRU cache?","A Map keeps insertion order: on get, delete and re-set the key to mark it most recent; on set, if over capacity, delete the first key from <code>map.keys().next().value</code>."]],
practice:[`Implement an LRU cache with Map.`,`Find all pairs of users who share a tag using Set intersection.`],
teach:`<p>"Set is a bag of unique things. Map is a coat-check that takes any key. WeakMap lets go of the coat when nobody else holds the owner."</p>`},

{id:"d5-dates",title:"Dates and Temporal",
eli5:`<p>Telling time across the world is tricky: when it is morning in Kuala Lumpur it is night in New York. The old <code>Date</code> tool is like a single clock that sometimes guesses your city. The new <b>Temporal</b> tool has separate clocks for "just a calendar day", "a time on a wall", and "an exact moment", so it never guesses.</p>`,
why:`<p><code>Date</code> (1995, copied from Java) is mutable, has 0-based months, parses inconsistently and has no real time zone support. <b>Temporal</b> (Stage 4 in March 2026, expected in ES2027) fixes all of this with immutable types and explicit zones.</p>`,
tech:`<h5>Date quirks</h5><ul class="pts"><li><code>new Date(2026, 0, 1)</code> is January 1 (<b>month is 0-based</b>); day-of-month is 1-based.</li><li>Overflow rolls: <code>new Date(2026, 1, 31)</code> becomes March 3.</li><li><code>new Date("2026-01-01")</code> (date only) is parsed as <b>UTC</b>; <code>new Date("2026-01-01T00:00")</code> (date-time) is <b>local</b>. This changes the displayed day in negative-offset zones.</li><li>A Date is a timestamp (ms since 1970-01-01 UTC); getters like <code>getHours()</code> use the local zone.</li><li>Setters mutate the date in place.</li></ul>
<h5>Temporal types</h5><ul class="pts"><li><code>Temporal.PlainDate</code> (calendar date), <code>PlainTime</code>, <code>PlainDateTime</code>, <code>ZonedDateTime</code> (exact time in a named zone), <code>Instant</code> (exact moment), <code>Duration</code>. All are immutable.</li><li>Status (Nov 2026): Firefox 139+, Chrome/Edge 144+, Node 26; <b>Safari stable has not shipped it</b>, so use <code>@js-temporal/polyfill</code> for broad support.</li></ul>`,
diagram:{html:flow([["Instant","exact moment, no zone"],["+ time zone","Asia/Kuala_Lumpur","w"],["ZonedDateTime","wall clock + zone","g"],["PlainDate","just the calendar day"]]),steps:["Store exact moments as Instant (or UTC ISO strings) in your database.","Convert to a ZonedDateTime with the user's zone only for display or calendar math.","Use PlainDate for birthdays and holidays where no time zone applies."]},
ex:[{t:"Date quirks",code:`const d = new Date(2026, 1, 31);
console.log(d.getMonth(), d.getDate());
console.log(new Date(2026, 0, 1).getMonth());
const a = new Date("2026-01-01");
const b = new Date("2026-01-01T00:00");
console.log(a.toISOString());
console.log(a.getTime() === b.getTime());   // equal only if your zone is UTC`},
{t:"Temporal (feature-detected)",code:`if (typeof Temporal === "undefined") {
  console.log("Temporal is not available in this browser yet; use a polyfill.");
} else {
  console.log(Temporal.PlainDate.from("2026-01-31").add({ months: 1 }).toString());
  const zdt = Temporal.Instant.from("2026-06-01T00:00:00Z").toZonedDateTimeISO("Asia/Kuala_Lumpur");
  console.log(zdt.hour, zdt.toString());
}`}],
browser:`<p><code>Intl.DateTimeFormat</code> and <code>toLocaleString(locale, {timeZone})</code> format dates for display. Never build date strings by hand. Always send ISO 8601 (UTC) over APIs. Daylight saving changes mean "add 24 hours" and "add 1 day" are different operations in Temporal.</p>`,
gotchas:[`Months are 0-based, days are 1-based; years from 0-99 map to 1900-1999 in the constructor.`,`<code>new Date("2026-3-5")</code> and other non-ISO formats are implementation-defined.`,`<code>date.getYear()</code> is deprecated; use <code>getFullYear()</code>.`,`<code>Date</code> arithmetic across DST can be off by an hour if you add fixed milliseconds.`,`Comparing Dates with <code>===</code> compares object identity; compare <code>getTime()</code> values.`],
best:[`Store and transmit UTC ISO strings; convert to local only for display.`,`Use <code>Intl</code> for formatting; use Temporal (or a polyfill) for new calendar logic.`,`Mock time in tests instead of calling <code>Date.now()</code> everywhere.`],
iq:[["fresher","Why does new Date(2026, 12, 1) show January 2027?","Months are 0-based (0-11); 12 overflows into the next year's January."],["mid","How does Date parse '2026-01-01' vs '2026-01-01T00:00'?","Date-only ISO strings are UTC; date-time strings without an offset are local time."],["senior","Why is Temporal better than Date?","Immutable, explicit types for the different concepts (date, time, instant, zoned), real time zone and calendar support, nanosecond precision, correct arithmetic across DST, and strict parsing."]],
practice:[`Write <code>daysBetween(a, b)</code> with Date, then with Temporal.PlainDate.`,`Format a timestamp for users in three time zones with Intl.DateTimeFormat.`],
teach:`<p>"The old Date is one clock that guesses. Months start at zero. Temporal gives separate types for a calendar day, a wall-clock time and an exact moment, so you never mix them up. Safari still needs a polyfill."</p>`}
],quiz:[
{code:`const o = { b: 1, 2: 'x', a: 2, 1: 'y' };
console.log(Object.keys(o));`,ans:`["1", "2", "b", "a"]`,why:`Integer-like keys come first in ascending order, then string keys in insertion order.`},
{code:`const a = [1, 2, 3]; const b = a; const c = [...a];
b.push(4);
console.log(a.length, c.length, Array(3).map(() => 1));`,ans:`4 3 [<3 empty items>]`,why:`b is the same array as a; c is a shallow copy. map skips holes, so the sparse array stays empty.`}]}
]});
