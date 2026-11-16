/* Week 13: TypeScript — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js. */
JSC.registerWeek({w:13,revision:[
"<b>What TS is:</b> a static type checker plus a type-stripping compiler. Checking and emitting are separate jobs; fast tools (esbuild, SWC, Vite, Node's built-in type stripping) only strip, so run <code>tsc --noEmit</code> in CI. Types are erased: nothing about them exists at runtime.",
"<b>Structural typing:</b> compatibility is by shape, not name; excess property checks only apply to fresh object literals; <code>Object.keys</code> returns <code>string[]</code> because objects may carry extra keys. Nominal behaviour needs brands or <code>#private</code>.",
"<b>Erasable syntax:</b> <code>enum</code>, <code>namespace</code>, parameter properties and legacy decorators generate code; prefer <code>as const</code> objects and literal unions, and enable <code>erasableSyntaxOnly</code> + <code>verbatimModuleSyntax</code>.",
"<b>Basics:</b> lowercase primitives, literal unions, arrays vs tuples (tuples are arrays at runtime), optional vs <code>| undefined</code>, <code>readonly</code> is compile-time only; <code>interface</code> for extendable/mergeable object contracts, <code>type</code> for unions and computed types; <code>any</code> off-switch vs <code>unknown</code> safe top type vs <code>never</code> empty type.",
"<b>Narrowing:</b> <code>typeof</code> (null is \"object\"!), <code>instanceof</code>, <code>in</code>, equality, truthiness (drops 0 and \"\"), type predicates and assertion functions. Discriminated unions + <code>assertNever</code> make switches exhaustive and illegal states unrepresentable.",
"<b>Functions and classes:</b> overloads only when output depends on input; <code>this</code> parameters; <code>private</code> is compile-time, <code>#private</code> is real; <code>abstract</code>/<code>implements</code> are compile-time contracts; <code>override</code> catches typos.",
"<b>Generics:</b> type variables inferred from arguments; constrain with <code>extends</code>, relate with <code>K extends keyof T</code> and <code>T[K]</code>; a type parameter should appear twice; <code>const</code> type params and <code>NoInfer</code> control inference; erased at runtime, so pass constructors/schemas as values; arrays are (unsoundly) covariant.",
"<b>Deriving types:</b> <code>keyof</code>, type-level <code>typeof</code>, indexed access (<code>(typeof ARR)[number]</code>), <code>Partial/Required/Readonly/Pick/Omit/Record</code>, <code>Exclude/Extract/NonNullable</code>, <code>ReturnType/Parameters/Awaited</code>. Omit doesn't check keys and isn't distributive.",
"<b>Type-level programming:</b> conditional types with <code>infer</code> distribute over naked type parameters (<code>[T]</code> stops it); mapped types with modifiers and <code>as</code> key remapping; template literal types build and parse strings. Test them and watch compile time.",
"<b>Edges and config:</b> external data is <code>unknown</code> until a schema parses it (one schema for check + type); <code>as</code> and <code>!</code> don't check anything; <code>satisfies</code> checks without widening; brands for IDs/validated values. Config: <code>strict</code> (+ <code>noUncheckedIndexedAccess</code>), <code>nodenext</code> for Node vs <code>bundler</code> for apps, <code>.d.ts</code>/augmentation, <code>exports</code> with types first. Migrate leaf-first with a CI ratchet."
],days:[
{n:61,title:"TypeScript foundations",goal:"Understand what TypeScript adds (a static type checker) and what it does not (runtime behaviour), how TS gets turned into JS, and write the everyday types fluently.",topics:[
{id:"d61-ts-why",title:"What TypeScript is: tsc, type erasure and running TS",lv:["fresher","mid","senior","lead"],
eli5:`<p>Imagine a <b>spell-checker</b> for your code. Before you send a letter, it underlines mistakes like "you promised a number here but wrote a word". When you actually post the letter, the red underlines are <b>not</b> printed on the paper; the postman only ever sees the plain letter. TypeScript is that spell-checker for JavaScript: it checks shapes and promises while you write, then throws the notes away (<b>type erasure</b>) and the browser runs plain JavaScript.</p>`,
why:`<p>JavaScript only tells you about <code>undefined is not a function</code> when the line runs, often in production. In a large codebase nobody can keep every object's shape in their head. TypeScript moves a whole class of bugs (typos, wrong arguments, missing null checks, forgotten cases) to <b>edit time</b>, powers autocomplete and safe refactors, and turns types into living documentation. It is now the default for most professional JavaScript work, so interviewers expect you to know both what it catches and what it cannot.</p>`,
tech:`<ul class="pts"><li><b>TypeScript = JavaScript + a static type layer.</b> Every valid JS program is (almost) valid TS. TS adds annotations (<code>let n: number</code>), declarations (<code>interface</code>, <code>type</code>) and a checker. It does <b>not</b> add a new runtime: there is no "TypeScript engine" in browsers or Node.</li><li><b>Two separate jobs:</b> (1) <b>type-check</b>: analyse the whole program and report errors; (2) <b>emit</b>: strip the types (and optionally down-level syntax) to produce <code>.js</code>, plus optional <code>.d.ts</code> declaration files and source maps. By default <code>tsc</code> still emits even if there are type errors (<code>noEmitOnError</code> changes that).</li><li><b>Type erasure:</b> types never exist at runtime. You cannot <code>if (x instanceof MyInterface)</code>; generics are not reified; a value annotated <code>: number</code> that came from <code>JSON.parse</code> can still be a string. Runtime checks need runtime code (Day 64).</li><li><b>Structural typing:</b> compatibility is decided by <b>shape</b>, not by name. A <code>{x, y, z}</code> object is assignable to <code>{x: number; y: number}</code>. Two interfaces with identical members are interchangeable. (Nominal behaviour needs tricks such as branded types or <code>#private</code> fields.)</li><li><b>Soundness is not a goal:</b> TS deliberately trades some soundness for usability (<code>any</code>, type assertions, array index access, method parameter bivariance). Treat it as a very good linter for shapes, not a proof.</li><li><b>Ways to run TS:</b> <code>tsc</code> (checks + emits); fast transpilers that only strip types and never check (esbuild, SWC, Babel, Vite, tsx, Bun, Deno); and <b>Node's built-in type stripping</b>: current Node versions can run <code>node app.ts</code> directly by replacing type annotations with whitespace. Typical setup: a fast stripper for running/bundling and <code>tsc --noEmit</code> in the editor and CI for checking.</li><li><b>Erasable vs non-erasable syntax:</b> most TS is erasable (delete it and valid JS remains). A few older features <b>generate code</b>: <code>enum</code>, <code>namespace</code>/<code>module</code> with values, constructor <b>parameter properties</b> (<code>constructor(private x: number)</code>), <code>import x = require()</code> and legacy <code>experimentalDecorators</code> metadata. Node's stripping mode rejects them; the <code>erasableSyntaxOnly</code> compiler option makes <code>tsc</code> flag them so your code stays "JS + types". Prefer <code>as const</code> objects or string-literal unions over enums in new code.</li><li><b>The compiler itself:</b> <code>tsc</code> is written in TypeScript; Microsoft is porting it to Go (a native compiler, previewed as <code>tsgo</code> and planned as TypeScript 7) for roughly order-of-magnitude faster checks on big codebases. The type system and language are meant to stay the same; check current release notes before relying on specifics.</li></ul>`,
diagram:{html:flow([["app.ts","code + types"],["type checker","tsc / tsgo / editor","w"],["errors","red squiggles, CI fails","r"]])+flow([["app.ts"],["strip / transpile","tsc, esbuild, SWC, Node","w"],["app.js","types erased","g"],["engine","V8 / browser / Node","g"]]),steps:["The checker reads the whole program (and <code>.d.ts</code> files for libraries) and reports errors; it does not change runtime behaviour.","Emit is a separate, mostly mechanical step: delete annotations, maybe down-level syntax, write <code>.js</code> + source maps.","Fast tools do only the second row, file by file, without knowing other files' types; that is why <code>isolatedModules</code>-style rules exist (Day 65).","The engine only ever sees JavaScript, so anything you need to enforce at runtime must be real code."]},
ex:[{t:"TypeScript source and what the type checker does with it (not runnable here)",code:`// greet.ts
interface User { name: string; age?: number }        // only exists at compile time

function greet(u: User): string {
  return "Hi " + u.name.toUpperCase();
}

greet({ name: "Ana" });                // ok
greet({ nme: "Ana" });                 // error: Object literal may only specify known properties
greet({ name: 42 });                   // error: Type 'number' is not assignable to type 'string'

const point3 = { name: "Bo", admin: true };
greet(point3);                         // ok: structural typing, extra props allowed for non-literal values

// Emitted JS (tsc, target ES2022): the interface and annotations are simply gone
// function greet(u) { return "Hi " + u.name.toUpperCase(); }
// greet({ name: "Ana" }); ...

// Running it:
//   tsc --noEmit            -> type-check only (CI, editor)
//   node greet.ts           -> modern Node strips types and runs (no checking!)
//   npx tsc && node dist/greet.js`,run:false},
{t:"The runtime side: erased types, structural typing and what an enum really emits (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);

// What tsc emits for: function greet(u: User): string { return "Hi " + u.name; }
function greet(u) { return "Hi " + u.name; }

// 1) Types are erased: data from outside can break the "promise" silently
const fromApi = JSON.parse('{"name": 42}');         // TS would let you call this a User
check("annotations do not validate: name is really a " + typeof fromApi.name, typeof fromApi.name === "number");
check("greet still runs with the wrong type", greet(fromApi) === "Hi 42");

// 2) Structural typing mirrors JS duck typing: shape matters, not the name
const robot = { name: "R2", beeps: true };
check("any object with a name works (structural)", greet(robot) === "Hi R2");

// 3) enum Color { Red, Green = 5, Blue } emits REAL code (non-erasable syntax):
var Color;
(function (Color) {
  Color[Color["Red"] = 0] = "Red";
  Color[Color["Green"] = 5] = "Green";
  Color[Color["Blue"] = 6] = "Blue";
})(Color || (Color = {}));
check("numeric enums get a reverse mapping", Color.Blue === 6 && Color[6] === "Blue");
check("so the object has 6 keys, not 3", Object.keys(Color).length === 6);

// 4) The erasable alternative: a const object + a union type derived from it
const Colors = Object.freeze({ Red: "red", Green: "green", Blue: "blue" });
// type Color2 = (typeof Colors)[keyof typeof Colors];   // "red" | "green" | "blue"
check("a const object is plain JS with no generated code", Object.keys(Colors).length === 3 && Colors.Red === "red");

// 5) "Type stripping" in miniature: annotations are removed, nothing else changes
const ts = "function add(a: number, b: number): number { return a + b; }";
const js = ts.replace(/: number/g, "");
check("after stripping, the JS runs: " + js, new Function(js + "; return add(2, 3);")() === 5);`}],
browser:`<p>Browsers cannot run <code>.ts</code> files; something must strip types first. In front-end apps the <b>bundler/dev server</b> (Vite, esbuild, webpack + ts-loader/babel, Next.js with SWC) transpiles each file on the fly and usually does <b>not</b> type-check, so run <code>tsc --noEmit</code> (or your editor/CI) separately. In <b>Node</b>, recent versions strip types natively (<code>node file.ts</code>), but only erasable syntax, they do not read <code>tsconfig.json</code>, imports must use real file extensions (<code>./util.ts</code>) and type-only imports must be marked <code>import type</code>. Deno and Bun run TS directly. Libraries still ship compiled <code>.js</code> + <code>.d.ts</code> to npm.</p>`,
gotchas:[`Type errors do not stop emit by default: <code>tsc</code> writes the JS anyway, and fast transpilers never check at all. Without <code>tsc --noEmit</code> in CI, a project can "build" with hundreds of type errors.`,`Types are erased, so <code>JSON.parse</code>, <code>fetch().json()</code>, <code>localStorage</code> and form inputs are unchecked at runtime even when annotated. Validate at the boundary.`,`<code>enum</code>, <code>namespace</code>, parameter properties and legacy decorators emit code; they break Node's type stripping and <code>erasableSyntaxOnly</code>. Numeric enums also accept any number and have reverse mappings.`,`Structural typing means two unrelated types with the same shape are interchangeable (<code>UserId</code> vs <code>OrderId</code> as plain strings); use branded types when that matters.`,`Excess property checks only apply to <b>fresh object literals</b>; the same object stored in a variable first passes with extra properties.`,`TypeScript is intentionally unsound in places (array indexing, assertions, <code>any</code>, bivariant methods); "it compiles" does not mean "it cannot crash".`],
best:[`Separate concerns: a fast transpiler (or Node stripping) to run code, <code>tsc --noEmit</code> to check, both in CI.`,`Write "JavaScript with types": enable <code>erasableSyntaxOnly</code> and <code>verbatimModuleSyntax</code>, prefer unions/<code>as const</code> to enums.`,`Turn on <code>strict</code> from day one in new projects; retrofitting it later costs far more.`,`Validate external data at runtime (schema library) and let the static types flow from the validated result.`],
iq:[["fresher","What is TypeScript and does the browser run it?","A superset of JavaScript that adds static types and a compiler/checker. Browsers and Node run only JavaScript: TS is type-checked at build or edit time and then the types are stripped (erased) to produce JS. Modern Node can strip types itself, but it still does not type-check."],["mid","What is structural typing? Give an example of where it surprises people.","Compatibility depends on shape, not declared names. Any object with name: string satisfies interface User. Surprise: two branded concepts like UserId and OrderId declared as string are interchangeable, and an object with extra properties is assignable when it is not a fresh literal. Nominal-like behaviour needs branding or class #private fields."],["mid","What is type erasure and what are its consequences?","All type information is removed in emit. Consequences: no runtime type checks from annotations, no instanceof on interfaces, generics are not available at runtime, overloads collapse to one implementation, and data from the network must be validated with real code."],["senior","Which TypeScript features are not erasable, and why does it matter now?","enum, namespaces with values, constructor parameter properties, import = require and legacy decorator metadata generate JavaScript. Node's built-in type stripping and other strip-only tools cannot handle them, so modern projects enable erasableSyntaxOnly and use as const objects, unions and explicit fields instead."],["lead","How would you set up type-checking and building for a large monorepo?","Use a fast transpiler per package (esbuild/SWC/Vite or Node stripping) for dev speed; run tsc --noEmit (or tsc -b with project references) in CI and pre-push; enable incremental builds; use isolatedModules/verbatimModuleSyntax so per-file transpilation is safe; consider the native Go compiler preview to cut check times; publish .js + .d.ts for shared libraries."]],
practice:[`Write a 30-line TS file with an <code>interface</code>, a function and an <code>enum</code>; compile with <code>tsc</code> and read the emitted JS. Then replace the enum with an <code>as const</code> object and compare the output.`,`Run the same file with <code>node file.ts</code> on a recent Node; observe the error for the enum and fix it. Turn on <code>erasableSyntaxOnly</code> and see <code>tsc</code> report the same problem.`,`Find three places in an existing JS project where data enters from outside (fetch, storage, env) and write down what a type annotation would and would not guarantee there.`],
teach:`<p>"TypeScript is a spell-checker that reads your whole program and complains about shape mistakes; then the notes are erased and plain JavaScript runs. Checking and stripping are separate jobs, compatibility is by shape, a few old features like enums generate code, and nothing about types protects you at runtime: validate outside data yourself."</p>`},

{id:"d61-ts-basics",title:"Basic types: primitives, arrays, tuples, objects, interface vs type",lv:["fresher","mid","senior"],
eli5:`<p>Types are <b>labels on boxes</b>. A box labelled "number" only takes numbers. A box labelled "list of strings" takes a row of words. A "tuple" is an egg carton with labelled slots: slot 1 is a name, slot 2 is an age. An "object type" is a form with fields: name (required), phone (optional). A <b>union</b> label says "this box holds a cat <i>or</i> a dog".</p>`,
why:`<p>Ninety percent of day-to-day TypeScript is these basics: annotating function parameters, describing objects coming from APIs, and choosing between <code>interface</code> and <code>type</code>. Getting them right (and leaning on inference instead of annotating everything) is what makes code both safe and readable.</p>`,
tech:`<ul class="pts"><li><b>Primitives:</b> <code>string</code>, <code>number</code>, <code>boolean</code>, <code>bigint</code>, <code>symbol</code>, <code>null</code>, <code>undefined</code>. Use the lowercase names, never <code>String</code>/<code>Number</code> (wrapper objects). <b>Literal types:</b> <code>"GET"</code>, <code>42</code>, <code>true</code>; unions of literals model enums: <code>type Method = "GET" | "POST"</code>.</li><li><b>Special types:</b> <code>any</code> (turns checking off, contagious), <code>unknown</code> (anything, but you must narrow before use), <code>never</code> (no value: functions that throw, exhausted unions), <code>void</code> (return value is ignored), <code>object</code> (non-primitive).</li><li><b>Inference:</b> <code>let n = 1</code> is <code>number</code>; <code>const n = 1</code> is the literal <code>1</code>; object literal properties widen (<code>{ method: "GET" }</code> has <code>method: string</code>) unless you use <code>as const</code>. Annotate function parameters and public return types; let locals infer.</li><li><b>Arrays:</b> <code>string[]</code> or <code>Array&lt;string&gt;</code>; <code>readonly string[]</code> / <code>ReadonlyArray&lt;string&gt;</code> forbid mutation <b>at compile time only</b>.</li><li><b>Tuples:</b> fixed-length typed positions: <code>[string, number]</code>, optional <code>[string, number?]</code>, rest <code>[string, ...number[]]</code>, labelled <code>[name: string, age: number]</code>. At runtime they are ordinary arrays (push still works unless <code>readonly</code>).</li><li><b>Object types:</b> <code>{ id: number; name?: string; readonly createdAt: Date }</code>; index signatures <code>{ [key: string]: number }</code> or <code>Record&lt;string, number&gt;</code>. Optional <code>?</code> means "may be missing" (and, without <code>exactOptionalPropertyTypes</code>, also "may be undefined").</li><li><b>Unions and intersections:</b> <code>A | B</code> is "either" (you can only use members common to both until you narrow); <code>A &amp; B</code> is "both" (combine shapes).</li><li><b><code>interface</code> vs <code>type</code>:</b> both describe object shapes. <code>interface</code>: can be <b>extended</b> (<code>extends</code>) and <b>merged</b> (declaring it twice adds members; used to augment library/global types), slightly better error messages and caching for big object hierarchies. <code>type</code> alias: can name <b>anything</b> (unions, tuples, primitives, function types, mapped/conditional types) and composes with <code>&amp;</code>; cannot be reopened. Common guideline: <code>interface</code> for public object contracts, <code>type</code> for unions and computed types; be consistent.</li><li><b>Function types:</b> <code>(a: number, b: number) =&gt; number</code>; <code>as const</code> makes literals deeply readonly and literal-typed.</li></ul>`,
diagram:{html:lanes([["Primitives & literals",["string, number, boolean","bigint, symbol","null, undefined","\"GET\" | \"POST\" (literal union)"]],["Collections",["string[] / Array&lt;string&gt;","readonly string[]","[string, number] tuple","Record&lt;string, number&gt;"]],["Shapes",["interface User { … }","type Point = { … }","A | B (union)","A &amp; B (intersection)"]],["Special",["any: off switch","unknown: safe top type","never: impossible","void: ignored result"]]]),steps:["Start from primitives and literal types; unions of literals replace most enums.","Collections add element types; tuples fix positions and length (at compile time).","Object shapes are described with interface or type and combined with | and &amp;.","<code>unknown</code> and <code>never</code> are the top and bottom of the type system; <code>any</code> escapes it."]},
ex:[{t:"Everyday annotations, inference and interface vs type (not runnable here)",code:`let count = 0;                         // inferred: number
const method = "GET";                  // inferred: "GET" (literal)
const req = { method: "GET" };         // req.method: string (widened)
const req2 = { method: "GET" } as const; // readonly { readonly method: "GET" }

type Method = "GET" | "POST" | "PUT" | "DELETE";
const ids: number[] = [1, 2, 3];
const names: ReadonlyArray<string> = ["a", "b"];
// names.push("c");                     // error: push does not exist on readonly string[]

type Entry = [key: string, value: number];   // labelled tuple
const e: Entry = ["age", 30];
const [k, v] = e;                            // k: string, v: number

interface User {
  readonly id: number;
  name: string;
  email?: string;                       // optional
}
interface Admin extends User { permissions: string[] }

type Shape = { kind: "circle"; r: number } | { kind: "square"; size: number }; // only a type alias can do this
type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date };

// Declaration merging: only interfaces can be reopened
interface Window { appVersion: string }  // adds a property to the global Window type

function area(s: Shape): number {        // parameters annotated, return type checked
  return s.kind === "circle" ? Math.PI * s.r ** 2 : s.size ** 2;
}`,run:false},
{t:"What these types become at runtime: tuples, readonly and optional are all just JavaScript (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);

// const pair: [string, number] = ["age", 30];
const pair = ["age", 30];
pair.push(99);                                       // TS forbids nothing here unless the tuple is readonly
check("a tuple is a normal array at runtime (length now " + pair.length + ")", Array.isArray(pair) && pair.length === 3);

// const names: readonly string[] = ["a", "b"];  readonly is compile-time only
const names = ["a", "b"];
names.push("c");
check("readonly arrays are mutable after erasure", names.length === 3);
const frozen = Object.freeze(["a", "b"]);
let threw = false;
try { (function () { "use strict"; frozen.push("c"); })(); } catch (e) { threw = e instanceof TypeError; }
check("Object.freeze is the runtime equivalent (push throws)", threw);

// interface User { name: string; email?: string }
const a = { name: "Ana" };
const b = { name: "Bo", email: undefined };
check("optional: missing key vs key set to undefined look the same with ?.", a.email === b.email);
check("...but 'in' and Object.keys tell them apart", !("email" in a) && "email" in b && Object.keys(b).length === 2);
check("JSON.stringify drops undefined, so both serialise alike", JSON.stringify(a) === '{"name":"Ana"}' && JSON.stringify(b) === '{"name":"Bo"}');

// literal unions are plain strings: type Method = "GET" | "POST"
const METHODS = ["GET", "POST"];                     // as const in TS gives readonly ["GET", "POST"]
const isMethod = (x) => METHODS.includes(x);         // a runtime check to back the type
check("a literal union needs a runtime list to validate input", isMethod("GET") && !isMethod("get"));

// String vs string: wrapper objects are a trap
const s1 = "hi", s2 = new String("hi");
check("primitive string and String object differ (typeof " + typeof s2 + ")", typeof s1 === "string" && typeof s2 === "object" && s1 !== s2);`}],
browser:`<p>None of these types survive into the browser bundle, so they cost zero bytes, with one exception: anything that compiles to values (enums, namespaces). DOM types come from <code>lib.dom.d.ts</code> (selected with the <code>lib</code> option): <code>document.querySelector("input")</code> is typed <code>HTMLInputElement | null</code> because TS knows the tag map, but <code>querySelector(".x")</code> is just <code>Element | null</code>. In Node, types for built-ins come from the <code>@types/node</code> package, not from the runtime.</p>`,
gotchas:[`<code>String</code>, <code>Number</code>, <code>Boolean</code>, <code>Object</code> (capitalised) are wrapper/object types; use lowercase primitives. <code>{}</code> means "any non-nullish value", not "empty object".`,`Object literal properties widen: <code>const cfg = { mode: "dark" }</code> gives <code>mode: string</code>, which then fails where <code>"dark" | "light"</code> is required; use <code>as const</code> or an annotation.`,`Tuples are arrays at runtime: <code>push</code> on a non-readonly tuple type-checks and changes its length, breaking the "fixed length" assumption.`,`<code>readonly</code> is shallow and compile-time only; nested objects stay mutable and runtime code can still mutate. Use <code>Object.freeze</code> if you need runtime guarantees.`,`Optional <code>name?: string</code> accepts an explicit <code>undefined</code> unless <code>exactOptionalPropertyTypes</code> is on; <code>"name" in obj</code> can then be true with an undefined value.`,`Interface declaration merging can silently combine two unrelated declarations with the same name in the same scope (including globals like <code>Window</code>).`,`Index signatures (<code>Record&lt;string, T&gt;</code>) claim every key exists; reading a missing key is typed <code>T</code> but is <code>undefined</code> at runtime unless <code>noUncheckedIndexedAccess</code> is on.`],
best:[`Annotate parameters and exported return types; let inference handle locals.`,`Model fixed sets as string-literal unions; derive them from an <code>as const</code> array when you also need the values at runtime.`,`Pick a team convention for interface vs type (for example: interface for object contracts, type for unions/utilities) and lint it.`,`Prefer <code>readonly</code> arrays/props in function parameters to communicate "I won't mutate this".`],
iq:[["fresher","What is the difference between any and unknown?","Both accept any value. any disables checking in both directions: you can call or access anything and pass it anywhere, and it spreads. unknown is type-safe: you cannot use it until you narrow it with typeof, instanceof, in, or a validator. Prefer unknown for untrusted data."],["fresher","What is a tuple type and how is it different from an array type?","A tuple fixes the length and the type at each position, e.g. [string, number]; an array has any length of one element type. At runtime both are arrays, so a mutable tuple can still be pushed to."],["mid","interface vs type: when do you use which?","Both describe object shapes. Interfaces support extends and declaration merging (needed to augment library or global types) and give nicer errors for object hierarchies. Type aliases can name unions, tuples, primitives, functions, mapped and conditional types. Common rule: interfaces for public object contracts, types for unions and computed types."],["mid","Why does const x = { kind: 'a' } not satisfy { kind: 'a' | 'b' } sometimes, and how do you fix it?","Object literal properties widen to string because the object is mutable. Fix with an annotation on the variable, as const (readonly literal types), or satisfies to check without widening."],["senior","What does never represent and where does it show up?","The empty type: no value has it. It is the return type of functions that always throw or loop forever, the result of narrowing away every member of a union (used for exhaustiveness checks), an empty union in conditional types, and the type of an intersection of incompatible primitives like string & number."]],
practice:[`Type a <code>Product</code> API response (id, name, price, optional discount, tags tuple <code>[primary: string, ...rest: string[]]</code>) both as an <code>interface</code> and as a <code>type</code>; extend each to <code>DigitalProduct</code>.`,`Declare <code>const ROLES = ["admin", "editor", "viewer"] as const</code> and derive <code>type Role</code> from it; write <code>isRole(x: string): x is Role</code> using the same array.`,`Write five small snippets where inference gives a different type than you expected (widening, <code>const</code> vs <code>let</code>, empty array) and explain each.`],
teach:`<p>"Types are labels on boxes: primitives and literal types, arrays and fixed-slot tuples, object shapes with optional fields, and unions for either-or. Let inference do the local work, annotate the edges, use interface for contracts and type for unions, and remember readonly and tuples are promises to the compiler, not locks at runtime."</p>`}
],quiz:[
{code:`// TS: enum Dir { Up, Down = 5, Left }   compiles to:
var Dir;
(function (Dir) {
  Dir[Dir["Up"] = 0] = "Up";
  Dir[Dir["Down"] = 5] = "Down";
  Dir[Dir["Left"] = 6] = "Left";
})(Dir || (Dir = {}));
console.log(Dir.Left, Dir[5], Object.keys(Dir).length);`,ans:`6 Down 6`,why:`Members after an initialised member auto-increment, so Left is 6. Numeric enums emit a reverse mapping (number to name), so Dir[5] is "Down" and the object has six keys: "0", "5", "6", "Up", "Down", "Left". This generated code is why enums are not erasable syntax.`},
{code:`// TS: const t: [number, string] = [1, "a"];
//     interface User { name: string }
//     const u = JSON.parse('{"name": 7}') as User;
const t = [1, "a"];
t.push(true);
const u = JSON.parse('{"name": 7}');
console.log(t.length, Array.isArray(t), typeof u.name);`,ans:`3 true number`,why:`After type erasure a tuple is an ordinary array (TS even allows push on a non-readonly tuple), and "as User" is only a compile-time claim: the parsed name is still the number 7.`}]},
{n:62,title:"Narrowing and functions",goal:"Let control flow refine types safely, model state with discriminated unions that the compiler checks exhaustively, and type functions and classes precisely.",topics:[
{id:"d62-narrowing",title:"Narrowing, discriminated unions and exhaustiveness",lv:["fresher","mid","senior","lead"],
eli5:`<p>You get a mystery parcel labelled "a toy <i>or</i> a book". You can't read it yet. You shake it, look at the label, check the size, and once you know "it's a book" you can open it to page 1. <b>Narrowing</b> is TypeScript following your checks and remembering "inside this if, it's definitely a book". A <b>discriminated union</b> is when every parcel has a sticker saying exactly what it is, and <b>exhaustiveness</b> is the checklist that shouts if a new kind of parcel arrives and nobody wrote down how to open it.</p>`,
why:`<p>Unions are how real data looks: loading/success/error states, API responses, events, actions in a reducer. Narrowing lets you use them without casts, and exhaustiveness checks turn "we added a new case and forgot to handle it in 14 places" from a production bug into a compile error. This is the single most valuable TypeScript pattern in application code.</p>`,
tech:`<ul class="pts"><li><b>Control-flow analysis:</b> TS tracks the type of a variable through <code>if</code>, <code>switch</code>, <code>return</code>, <code>throw</code>, <code>&amp;&amp;</code>, <code>||</code>, <code>??</code> and assignments. After <code>if (typeof x === "string") return;</code>, <code>x</code> is no longer string.</li><li><b>Built-in guards:</b> <code>typeof</code> (<code>"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"</code>; beware <code>typeof null === "object"</code>), truthiness (also removes <code>0</code> and <code>""</code>!), equality (<code>=== null</code>, <code>== null</code> removes both null and undefined), <code>instanceof</code> (classes), <code>"prop" in obj</code>, <code>Array.isArray</code>.</li><li><b>User-defined type guards:</b> <code>function isFish(p: Pet): p is Fish</code>; the function body is trusted, so a wrong guard lies to the compiler. Recent TS versions can <b>infer</b> simple type predicates (e.g. <code>arr.filter(x =&gt; x !== undefined)</code> now gives <code>T[]</code>). <b>Assertion functions:</b> <code>function assert(c: unknown, msg?: string): asserts c</code> and <code>asserts x is T</code> narrow after the call.</li><li><b>Discriminated (tagged) unions:</b> each member has a common literal property (<code>kind</code>, <code>type</code>, <code>status</code>). Checking it narrows to that member: <code>switch (s.kind) { case "circle": s.r }</code>. Destructured discriminants also narrow in modern TS.</li><li><b>Exhaustiveness:</b> in the <code>default</code> branch the value has type <code>never</code> if every case was handled. <code>const _x: never = s;</code> or <code>assertNever(s)</code> fails to compile when a new member is added, and throws at runtime if bad data slips in. Alternatives: <code>switch(true)</code>, the <code>noFallthroughCasesInSwitch</code> and <code>switch-exhaustiveness-check</code> lint rule, or a lookup object typed <code>Record&lt;Kind, Handler&gt;</code>.</li><li><b>Make illegal states unrepresentable:</b> prefer <code>{status:"loading"} | {status:"ok", data} | {status:"error", error}</code> over <code>{loading: boolean; data?: T; error?: E}</code> which allows nonsense like loading and error at once.</li><li><b>Narrowing limits:</b> narrowing of a mutable property is reset after function calls that might mutate it (and not reset in some cases where it should, a known unsoundness); narrowing inside callbacks works for <code>const</code> but not for reassigned <code>let</code> variables (newer versions preserve narrowing after the last assignment in more cases).</li></ul>`,
diagram:{html:flow([["state: RemoteData","loading | ok | error"],["switch (state.status)","discriminant","w"],["case 'ok' → state.data","narrowed","g"],["default → never","assertNever","r"]]),steps:["The union lists every legal state, each tagged with a literal <code>status</code>.","Checking the tag narrows the variable to exactly one member, unlocking its fields.","If all members are handled, the remaining type is <code>never</code>.","Adding a new member makes the <code>never</code> assignment fail to compile everywhere it is not handled; at runtime <code>assertNever</code> throws on corrupt data."]},
ex:[{t:"Narrowing techniques, type predicates and exhaustive switches (not runnable here)",code:`type RemoteData<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; error: Error };

function assertNever(x: never): never {
  throw new Error("Unhandled case: " + JSON.stringify(x));
}

function render(s: RemoteData<string[]>): string {
  switch (s.status) {
    case "idle":    return "Press load";
    case "loading": return "Loading…";
    case "ok":      return s.data.join(", ");     // s is { status: "ok"; data: string[] }
    case "error":   return "Error: " + s.error.message;
    default:        return assertNever(s);        // add a "stale" member -> compile error here
  }
}

function len(x: string | string[] | null | undefined) {
  if (x == null) return 0;                // removes null AND undefined
  if (typeof x === "string") return x.length;
  return x.length;                        // string[]
}

interface Fish { swim(): void } interface Bird { fly(): void }
function isFish(p: Fish | Bird): p is Fish { return "swim" in p; }
const pets: (Fish | Bird)[] = [];
const fish = pets.filter(isFish);         // Fish[]
const defined = [1, undefined, 2].filter((x) => x !== undefined); // number[] (inferred predicate)

function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== "string") throw new TypeError("expected string");
}`,run:false},
{t:"Runtime side: guards, a tagged-union reducer and assertNever catching bad data (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
function assertNever(x) { throw new Error("Unhandled case: " + JSON.stringify(x)); }

// type Shape = { kind: "circle"; r: number } | { kind: "rect"; w: number; h: number }
function area(s) {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2;
    case "rect": return s.w * s.h;
    default: return assertNever(s);      // never at compile time; a real throw at runtime
  }
}
check("circle and rect are handled", Math.round(area({ kind: "circle", r: 1 }) * 100) === 314 && area({ kind: "rect", w: 2, h: 3 }) === 6);
let msg = "";
try { area(JSON.parse('{"kind":"triangle","b":2}')); } catch (e) { msg = e.message; }
check("unexpected data from outside fails loudly, not silently", msg === 'Unhandled case: {"kind":"triangle","b":2}');

// Truthiness narrowing removes 0 and "" too: a classic bug
const label = (count) => (count ? count + " items" : "no count");
check("truthiness treats 0 as missing (bug!)", label(0) === "no count");
const label2 = (count) => (count != null ? count + " items" : "no count");
check("== null only removes null and undefined", label2(0) === "0 items" && label2(undefined) === "no count");

// typeof null === "object": guard for objects must exclude null
const isObject = (v) => typeof v === "object" && v !== null;
check("typeof null is 'object', so check !== null", typeof null === "object" && !isObject(null) && isObject({}));

// A user-defined guard: function isUser(v: unknown): v is User
const isUser = (v) => isObject(v) && typeof v.name === "string" && (v.age === undefined || typeof v.age === "number");
const raw = [{ name: "Ana" }, { name: 3 }, null, { name: "Bo", age: 30 }];
check("filter(isUser) keeps only valid users", raw.filter(isUser).map((u) => u.name).join() === "Ana,Bo");

// Reducer over a discriminated union of actions
function reducer(state, action) {
  switch (action.type) {
    case "add": return { ...state, items: [...state.items, action.item] };
    case "remove": return { ...state, items: state.items.filter((i) => i !== action.item) };
    case "clear": return { ...state, items: [] };
    default: return assertNever(action);
  }
}
const s = [{ type: "add", item: "a" }, { type: "add", item: "b" }, { type: "remove", item: "a" }].reduce(reducer, { items: [] });
check("reducer handles every action type", s.items.join() === "b");`}],
browser:`<p>Narrowing is purely compile-time, but its runtime twins are the same in browser and Node: <code>typeof</code>, <code>instanceof</code>, <code>in</code>, <code>Array.isArray</code>. Beware <code>instanceof</code> across realms: an array or error from an iframe, a <code>postMessage</code>-cloned object or (in Node) a <code>vm</code> context fails <code>instanceof Array</code>/<code>Error</code>; prefer <code>Array.isArray</code> and duck-typed guards. DOM code narrows a lot: <code>if (el instanceof HTMLInputElement) el.value</code>, <code>event.target</code> is only <code>EventTarget | null</code> until you narrow.</p>`,
gotchas:[`Truthiness checks (<code>if (x)</code>) also remove <code>0</code>, <code>""</code>, <code>NaN</code> and <code>false</code>; use <code>!= null</code> when you mean "not missing".`,`<code>typeof x === "object"</code> includes <code>null</code> and arrays; check <code>x !== null</code> and <code>Array.isArray</code>.`,`A user-defined type guard is trusted blindly: <code>(x): x is User =&gt; true</code> compiles and lies. Keep guards small and tested.`,`Narrowing of object properties can be invalidated (or wrongly kept) across function calls; copy to a <code>const</code> before using it in callbacks.`,`Exhaustiveness only works if the default branch actually uses the value as <code>never</code>; a plain <code>default: return null</code> silently swallows new cases.`,`Discriminants must be literal types; <code>kind: string</code> does not narrow. Values parsed from JSON have <code>string</code> unless validated into the union.`,`<code>instanceof</code> fails across realms (iframes, workers after structured clone) and for interfaces (they don't exist at runtime).`],
best:[`Model state as discriminated unions with a literal tag; make illegal states unrepresentable.`,`End every switch over a union with <code>assertNever</code> (or enable a lint rule for exhaustiveness).`,`Write runtime guards for <code>unknown</code> input and let narrowing flow from them; avoid casts.`,`Prefer <code>== null</code> / <code>??</code> over truthiness when 0 or "" are valid values.`],
iq:[["fresher","What is type narrowing?","TypeScript refines a variable's type inside a branch based on runtime checks it understands: typeof, instanceof, in, equality, truthiness, Array.isArray, discriminant checks and type predicates. After if (typeof x === 'string') the variable is string in that block."],["mid","What is a discriminated union and why is it useful?","A union of object types that share a literal property (the discriminant), like status: 'loading' | 'ok' | 'error'. Checking the discriminant narrows to one member so its fields become available without casts, and it makes illegal combinations impossible to represent."],["mid","How do you make a switch exhaustive?","Handle every member and in default assign the value to never (const _: never = x) or call assertNever(x: never). When a new member is added the default branch receives that member instead of never and the code fails to compile; at runtime assertNever throws on unexpected data."],["senior","What is the difference between a type predicate and an assertion function?","A type predicate (x is T) returns boolean and narrows in the true branch of the caller's condition. An assertion function (asserts x is T or asserts cond) returns void and throws otherwise; code after the call is narrowed. Both are trusted by the compiler, so their implementation must be correct."],["lead","How would you model an async request state in a shared UI library?","A generic discriminated union RemoteData&lt;T, E&gt; with idle/loading/success/failure (optionally refreshing with stale data), helper constructors, a fold/match function requiring a handler per case, and exhaustive switches enforced by lint. This prevents boolean soup (isLoading + error + data) and makes every consumer handle every state."]],
practice:[`Convert a component's <code>{isLoading, error, data}</code> state into a discriminated union and fix every place the compiler now complains about.`,`Write <code>match(value, { circle: s =&gt; …, rect: s =&gt; … })</code> typed so that a missing handler is a compile error.`,`Write a type guard <code>isApiError(e: unknown): e is { code: string; message: string }</code> and unit-test it with 6 tricky inputs (null, arrays, wrong types).`],
teach:`<p>"Narrowing is TypeScript reading your if-statements. Give every variant of your data a literal tag, switch on the tag, and end with assertNever so adding a variant breaks the build instead of production. Guards you write yourself are trusted, so keep them honest."</p>`},

{id:"d62-functions-classes",title:"Typing functions and classes",lv:["fresher","mid","senior"],
eli5:`<p>A function type is the <b>instruction card on a vending machine</b>: "put in a coin (number) and a button code (string), you get a snack (Snack)". Optional parameters are buttons you may skip. <b>Overloads</b> are a machine with two cards: "coins in, snack out" <i>or</i> "card in, receipt out". A class type is the <b>blueprint</b> for many machines, with some parts behind a panel (<code>private</code>) and some in a welded box nobody can open (<code>#private</code>).</p>`,
why:`<p>Functions and classes are the API surface of every module. Typing them well gives callers autocomplete, catches wrong arguments, and documents behaviour. Interviewers also love the subtle bits: overloads vs unions, <code>this</code> typing, <code>private</code> vs <code>#private</code>, and what <code>abstract</code> and <code>implements</code> actually guarantee.</p>`,
tech:`<ul class="pts"><li><b>Parameters and returns:</b> <code>function f(a: number, b?: string, c = 10, ...rest: boolean[]): void</code>. Optional <code>?</code> params must come after required ones; defaults infer their type. Annotate return types on exported functions so accidental changes are caught.</li><li><b>Function types:</b> <code>type Handler = (e: Event) =&gt; void</code>; call signatures in object types <code>{ (x: number): string; displayName: string }</code>; construct signatures <code>new (...args: any[]) =&gt; T</code>. A <code>void</code>-returning callback type accepts functions that return something (so <code>arr.forEach(x =&gt; list.push(x))</code> is fine).</li><li><b>Overloads:</b> several signatures followed by one implementation whose signature is not visible to callers. Use them when the return type depends on the argument shape; prefer a union parameter or generics when the return type does not change. Order: most specific first.</li><li><b><code>this</code> parameters:</b> <code>function onClick(this: HTMLButtonElement, e: MouseEvent)</code>: a fake first parameter, erased in emit, that types <code>this</code> and stops the function being called detached. <code>noImplicitThis</code> (part of strict) flags untyped <code>this</code>.</li><li><b>Classes:</b> fields must be declared and (with <code>strictPropertyInitialization</code>) initialised or marked <code>!</code>. <b>Access modifiers</b> <code>public</code>/<code>protected</code>/<code>private</code> are <b>compile-time only</b>: the property is a normal property at runtime (visible in <code>JSON.stringify</code>, reachable with <code>obj["secret"]</code>). <b><code>#private</code></b> fields are a JavaScript feature with real runtime privacy (and brand-check semantics: <code>#x in obj</code>). <code>readonly</code> fields can only be assigned in the constructor.</li><li><b>Parameter properties</b> <code>constructor(private db: Db)</code> declare and assign a field in one go, but they are non-erasable syntax; write the field explicitly in "erasable-only" codebases.</li><li><b><code>abstract</code>:</b> abstract classes cannot be instantiated (compile-time) and abstract members must be implemented by subclasses. At runtime it is an ordinary class. <code>override</code> keyword (with <code>noImplicitOverride</code>) catches typos in overridden method names.</li><li><b><code>implements</code>:</b> checks that a class satisfies an interface; it does not change the class type or provide implementations, and parameter types are not inferred from it. Classes are also structurally typed: an object literal with the same public shape is assignable to a class type (unless it has private/#private members).</li><li><b>Method vs function property variance:</b> methods declared with method syntax are checked bivariantly (unsound but convenient); <code>strictFunctionTypes</code> checks function-typed properties contravariantly.</li></ul>`,
diagram:{html:lanes([["Compile-time only",["public / protected / private","readonly","abstract","implements","this: T parameter","overload signatures"]],["Real JavaScript",["#private fields","static members","getters / setters","default parameters","rest parameters","class fields"]],["Generates code (not erasable)",["constructor(private x: T)","legacy experimentalDecorators metadata"]]]),steps:["Left column disappears entirely after erasure; it only guides the checker.","Middle column is plain modern JavaScript; TS merely types it.","Right column produces JS that did not exist in your source; avoid it if you use type stripping."]},
ex:[{t:"Function signatures, overloads, this parameters and class features (not runnable here)",code:`// Overloads: return type depends on input
function parse(input: string): object;
function parse(input: Uint8Array): object;
function parse(input: string, reviver: (k: string, v: unknown) => unknown): object;
function parse(input: string | Uint8Array, reviver?: (k: string, v: unknown) => unknown): object {
  const text = typeof input === "string" ? input : new TextDecoder().decode(input);
  return JSON.parse(text, reviver);
}

function format(n: number, digits = 2, ...units: string[]): string {
  return n.toFixed(digits) + (units[0] ?? "");
}

function onClick(this: HTMLButtonElement, e: MouseEvent) {
  this.disabled = true;                   // this is typed; erased in emit
}

interface Repo<T> { find(id: string): Promise<T | undefined> }

abstract class Shape {
  abstract area(): number;
  describe(): string { return this.constructor.name + " " + this.area().toFixed(1); }
}

class Circle extends Shape implements Repo<Circle> {
  static count = 0;
  readonly r: number;
  private cache = new Map<string, Circle>();   // compile-time privacy
  #secret = "real privacy";                    // runtime privacy
  constructor(r: number) { super(); this.r = r; Circle.count++; }
  override area() { return Math.PI * this.r ** 2; }
  async find(id: string) { return this.cache.get(id); }
}

// new Shape();            // error: Cannot create an instance of an abstract class
// circle.cache            // error: Property 'cache' is private
// circle["cache"]         // allowed! bracket access escapes private (by design)`,run:false},
{t:"Runtime side: private vs #private, abstract guards, emitted parameter properties and overload dispatch (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);

// class Account { private balance = 0; #pin = "1234"; constructor(private owner: string) {} }
// compiles (roughly) to:
class Account {
  #pin = "1234";
  constructor(owner) {
    this.owner = owner;               // parameter property: generated assignment
    this.balance = 0;                 // 'private' is just a normal property now
  }
  checkPin(p) { return p === this.#pin; }
  static isAccount(o) { return #pin in o; }    // brand check with a #private field
}
const acc = new Account("ana");
check("TS 'private' is visible at runtime", acc["balance"] === 0 && JSON.stringify(acc) === '{"owner":"ana","balance":0}');
check("#private is truly hidden (not in keys or JSON)", !Object.keys(acc).includes("#pin") && acc.checkPin("1234"));
check("#x in obj is a reliable nominal brand check", Account.isAccount(acc) && !Account.isAccount({ owner: "x", balance: 0 }));

// abstract class Shape { abstract area(): number }  -> an ordinary class at runtime
class Shape {
  constructor() { if (new.target === Shape) throw new TypeError("Shape is abstract"); }
  describe() { return this.constructor.name + ":" + this.area(); }
}
class Square extends Shape { constructor(s) { super(); this.s = s; } area() { return this.s * this.s; } }
let blocked = false;
try { new Shape(); } catch (e) { blocked = e instanceof TypeError; }
check("abstractness can be enforced at runtime with new.target", blocked && new Square(3).describe() === "Square:9");

// Overloads collapse into ONE implementation that inspects its arguments
function len(x) {                                   // len(s: string): number; len(a: unknown[]): number
  if (typeof x === "string") return [...x].length;  // count code points
  if (Array.isArray(x)) return x.length;
  throw new TypeError("unsupported");
}
check("one implementation serves every overload", len("héllo") === 5 && len([1, 2]) === 2);

// this parameter: erased, but the bug it prevents is real
const counter = { n: 0, inc() { "use strict"; this.n++; return this.n; } };   // strict mode, as in modules/classes
const detached = counter.inc;
let lost = false;
try { detached(); } catch (e) { lost = e instanceof TypeError; }
check("calling a method detached loses 'this' (what this: T params guard against)", lost && counter.inc() === 1);

// default + rest parameters are real JS
function fmt(n, digits = 2, ...units) { return n.toFixed(digits) + (units[0] ?? ""); }
check("default and rest parameters", fmt(3.14159) === "3.14" && fmt(2, 0, "kg", "lb") === "2kg");`}],
browser:`<p><code>#private</code> fields, static blocks, class fields and <code>new.target</code> are supported by all evergreen browsers and current Node, so <code>tsc</code> with a modern <code>target</code> emits them as-is; with an old target it down-levels <code>#private</code> to <code>WeakMap</code>s (slower, bigger). TS's <code>useDefineForClassFields</code> (default with modern targets) makes field semantics match the JS standard (<code>Object.defineProperty</code>), which matters when a subclass field shadows a base accessor. Event handlers typed with <code>this: HTMLElement</code> match how the DOM calls listeners.</p>`,
gotchas:[`<code>private</code> is compile-time only: bracket access, <code>JSON.stringify</code>, <code>Object.keys</code> and plain JS callers all see it. Use <code>#private</code> for real encapsulation.`,`Overload implementation signatures are invisible to callers; callers must match one of the overload signatures, and the implementation must be compatible with all of them (TS checks this loosely).`,`Optional parameter <code>b?: string</code> and <code>b: string | undefined</code> differ: the second must still be passed explicitly.`,`<code>implements</code> does not give contextual types to method parameters; they still need annotations (otherwise implicit any).`,`Method shorthand in interfaces is checked bivariantly, so <code>(x: Dog) =&gt; void</code> can sneak in where <code>(x: Animal) =&gt; void</code> is needed; use function-property syntax for stricter checks.`,`Parameter properties and <code>experimentalDecorators</code> are not erasable and change field initialisation order; standard (TC39) decorators are supported natively in recent TS without the flag.`,`<code>strictPropertyInitialization</code> errors on fields set in a helper called by the constructor; use a definite assignment <code>field!: T</code> only if you truly guarantee it.`],
best:[`Annotate exported function return types; let internal arrow functions infer.`,`Prefer a union or generic over overloads unless the return type genuinely depends on the input.`,`Use <code>#private</code> for runtime-sensitive state, <code>readonly</code> for immutability intent, and <code>override</code> with <code>noImplicitOverride</code>.`,`Prefer composition and small interfaces over deep abstract class hierarchies.`],
iq:[["fresher","How do you type optional and default parameters?","Optional parameters use ? (b?: string) and must follow required ones; their type includes undefined. Default parameters (c = 10) are optional for callers and their type is inferred from the default."],["mid","private vs #private in TypeScript?","private is a TypeScript access modifier checked only at compile time; the field is a normal property at runtime and can be read via bracket access or serialised. #private is a JavaScript private field: truly inaccessible outside the class at runtime, not enumerable, not in JSON, and supports #x in obj brand checks. #private also makes the class nominal for typing."],["mid","When would you use function overloads?","When the return type or parameter relationship depends on which arguments are passed, e.g. createElement('a') returns HTMLAnchorElement. Write signatures from most specific to least, then one implementation. If the return type does not change, a union parameter or generic is simpler."],["senior","What does a this parameter do?","It is a fake first parameter (this: HTMLElement) that types this inside the function and is erased in emit. Callers must invoke it with a matching this, so passing it detached or calling it on the wrong object becomes a compile error."],["senior","Abstract class vs interface: when do you choose each?","An interface is a pure compile-time contract with no runtime footprint and supports multiple implementation. An abstract class is a real runtime class that can share implementation and state and forces subclasses to implement abstract members, but allows single inheritance only. Use interfaces for contracts, abstract classes when shared behaviour is genuinely needed (often composition is better)."]],
practice:[`Write <code>createElement</code> overloads for <code>"a"</code>, <code>"input"</code> and a generic fallback, returning the right element types.`,`Implement a <code>Stack&lt;T&gt;</code> class with <code>#items</code>, a <code>readonly</code> capacity, <code>push/pop/peek</code>, and an <code>Iterable&lt;T&gt;</code> implementation via <code>implements</code>.`,`Take a class using parameter properties and rewrite it in erasable syntax; compile both and compare the emitted JS.`],
teach:`<p>"Type the inputs and outputs of every public function; overloads only when the output depends on the input. In classes, private is a polite sign, #private is a locked door, abstract and implements are compile-time promises, and parameter properties quietly generate code."</p>`}
],quiz:[
{code:`// TS: function f(x: string | string[] | null) {
//       if (typeof x === "object") return x?.length ?? "null";
//       return x.toUpperCase();
//     }
function f(x) {
  if (typeof x === "object") return x?.length ?? "null";
  return x.toUpperCase();
}
console.log(f("ab"), f(["a", "b", "c"]), f(null));`,ans:`AB 3 null`,why:`typeof narrows string to the second branch. typeof "object" matches both arrays and null, which is why TypeScript narrows x to string[] | null there and forces the ?. check: the array gives 3, null falls through ?? to "null".`},
{code:`// TS: class A { private secret = 1; #hard = 2; }
class A { #hard = 2; constructor() { this.secret = 1; } }
const a = new A();
console.log(a["secret"], JSON.stringify(a), Object.keys(a).length, "#hard" in a);`,ans:`1 {"secret":1} 1 false`,why:`TS private is erased to a normal property, so bracket access, JSON and Object.keys see it. The #hard field is a real JavaScript private field: not a key, not serialised, and the string "#hard" is not a property name.`}]},
{n:63,title:"Generics",goal:"Write reusable, type-safe functions and types with generics and constraints, and derive types from other types and values instead of repeating them.",topics:[
{id:"d63-generics",title:"Generics and constraints",lv:["mid","senior","lead"],
eli5:`<p>A <b>lunchbox with a label slot</b>. The box works the same for sandwiches or sushi, but once you slide in a card saying "sushi", everyone knows that what comes <i>out</i> is sushi. A generic function is that box: <code>first&lt;T&gt;</code> says "whatever kind of list you give me, I return one of that kind". A <b>constraint</b> is a rule on the card: "only foods that fit in the fridge" (<code>T extends { id: string }</code>).</p>`,
why:`<p>Without generics you either duplicate code per type or fall back to <code>any</code> and lose all safety: <code>first(users)</code> would return <code>any</code>, and typos on the result go unnoticed. Generics are how <code>Array&lt;T&gt;</code>, <code>Promise&lt;T&gt;</code>, <code>Map&lt;K, V&gt;</code>, React hooks, ORMs and API clients keep the relationship between input and output types. Library and platform engineers write them daily; everyone reads them.</p>`,
tech:`<ul class="pts"><li><b>Type parameters</b> are variables for types: <code>function identity&lt;T&gt;(x: T): T</code>. They are usually <b>inferred</b> from arguments (<code>identity(3)</code> gives <code>3</code>/<code>number</code>); pass them explicitly only when inference cannot (<code>useState&lt;User | null&gt;(null)</code>).</li><li><b>Generic types:</b> <code>interface Box&lt;T&gt; { value: T }</code>, <code>type Result&lt;T, E = Error&gt; = { ok: true; value: T } | { ok: false; error: E }</code>, generic classes <code>class Cache&lt;K, V&gt;</code>. Defaults (<code>E = Error</code>) work like default parameters.</li><li><b>Constraints:</b> <code>&lt;T extends { length: number }&gt;</code> lets the body use <code>.length</code> while preserving the caller's exact type. <code>&lt;K extends keyof T&gt;</code> ties one parameter to another: <code>get&lt;T, K extends keyof T&gt;(o: T, k: K): T[K]</code>.</li><li><b>Inference details:</b> literal types widen unless constrained or marked <code>const</code> type parameters (<code>function f&lt;const T&gt;(x: T)</code> infers <code>readonly ["a","b"]</code> instead of <code>string[]</code>). <code>NoInfer&lt;T&gt;</code> stops a parameter from being an inference site (e.g. a default value that must match a list).</li><li><b>Rule of thumb:</b> a type parameter should appear at least twice (relating inputs to outputs or inputs to each other). <code>function log&lt;T&gt;(x: T): void</code> gains nothing over <code>unknown</code>. Don't use generics just to avoid writing a union.</li><li><b>Variance:</b> how <code>Box&lt;Dog&gt;</code> relates to <code>Box&lt;Animal&gt;</code>. Read-only positions are covariant, function parameters contravariant, read-write invariant. TS infers it structurally; you can annotate <code>in</code>/<code>out</code> on type parameters for clarity and speed. Arrays are (unsoundly) covariant: <code>Dog[]</code> is assignable to <code>Animal[]</code>, after which pushing a Cat type-checks.</li><li><b>Erasure:</b> generics vanish at runtime: you cannot do <code>new T()</code> or <code>x instanceof T</code>; pass a constructor or a validator as a value (<code>parse&lt;T&gt;(schema: Schema&lt;T&gt;)</code>).</li><li><b>Generic patterns:</b> <code>Result</code>/<code>Option</code> types, typed event emitters (<code>on&lt;K extends keyof Events&gt;(k: K, fn: (p: Events[K]) =&gt; void)</code>), typed fetch wrappers, repositories, builders, <code>pipe</code>/<code>compose</code>.</li></ul>`,
diagram:{html:flow([["call: get(user, 'email')"],["infer T = User","from argument 1","w"],["infer K = 'email'","constraint K extends keyof User","w"],["return T[K]","= string | undefined","g"]]),steps:["Type arguments are inferred from the call's arguments, left to right.","Constraints are checked: <code>'email'</code> must be one of <code>keyof User</code>, so typos fail.","The return type is computed from the inferred parameters (an indexed access type).","At runtime this is just <code>(o, k) =&gt; o[k]</code>; all of the above was compile-time."]},
ex:[{t:"Generic functions, constraints, defaults, const type parameters and a typed event emitter (not runnable here)",code:`function first<T>(xs: readonly T[]): T | undefined { return xs[0]; }
const n = first([1, 2, 3]);          // number | undefined

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
longest("abc", "de");                 // string
longest([1, 2], [3]);                 // number[]
// longest(1, 2);                     // error: number has no length

function get<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
const user = { name: "Ana", age: 30 };
get(user, "age");                     // number
// get(user, "agee");                 // error: '"agee"' is not assignable to '"name" | "age"'

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function routes<const T extends readonly string[]>(paths: T): T { return paths; }
const r = routes(["/", "/about"]);    // readonly ["/", "/about"] instead of string[]

function pick<T extends string>(options: T[], fallback: NoInfer<T>): T { return options[0] ?? fallback; }
// pick(["a", "b"], "c");             // error thanks to NoInfer: "c" is not "a" | "b"

type Events = { login: { userId: string }; logout: undefined };
class Emitter<E extends Record<string, unknown>> {
  private handlers: { [K in keyof E]?: ((p: E[K]) => void)[] } = {};
  on<K extends keyof E>(k: K, fn: (p: E[K]) => void) { (this.handlers[k] ??= []).push(fn); }
  emit<K extends keyof E>(k: K, p: E[K]) { this.handlers[k]?.forEach((fn) => fn(p)); }
}
const bus = new Emitter<Events>();
bus.on("login", (p) => p.userId.toUpperCase());   // p is { userId: string }
// bus.emit("login", { id: 1 });                    // error`,run:false},
{t:"Runtime side: generic helpers are ordinary functions; pass schemas/constructors because T is erased (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);

// type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }
const Ok = (value) => ({ ok: true, value });
const Err = (error) => ({ ok: false, error });
// function map<T, U, E>(r: Result<T, E>, f: (t: T) => U): Result<U, E>
const map = (r, f) => (r.ok ? Ok(f(r.value)) : r);
const parseIntSafe = (s) => (/^-?\\d+$/.test(s) ? Ok(Number(s)) : Err("not an int: " + s));
check("map transforms Ok values", map(parseIntSafe("21"), (n) => n * 2).value === 42);
check("map passes Err through untouched", map(parseIntSafe("x"), (n) => n * 2).error === "not an int: x");

// function groupBy<T, K extends PropertyKey>(xs: T[], key: (x: T) => K): Record<K, T[]>
const groupBy = (xs, key) => xs.reduce((acc, x) => ((acc[key(x)] ??= []).push(x), acc), {});
const people = [{ n: "Ana", team: "a" }, { n: "Bo", team: "b" }, { n: "Cy", team: "a" }];
const g = groupBy(people, (p) => p.team);
check("groupBy keeps the element type in each bucket", g.a.map((p) => p.n).join() === "Ana,Cy" && g.b.length === 1);

// Typed emitter: the generic types vanish, the Map remains
class Emitter {
  #h = new Map();
  on(k, fn) { (this.#h.get(k) ?? this.#h.set(k, []).get(k)).push(fn); return () => this.off(k, fn); }
  off(k, fn) { this.#h.set(k, (this.#h.get(k) ?? []).filter((f) => f !== fn)); }
  emit(k, p) { (this.#h.get(k) ?? []).forEach((fn) => fn(p)); }
}
const bus = new Emitter(); const seen = [];
const off = bus.on("login", (p) => seen.push(p.userId));
bus.emit("login", { userId: "u1" }); off(); bus.emit("login", { userId: "u2" });
check("emitter delivers, and unsubscribe works", seen.join() === "u1");

// T is erased: you can't write new T() or x instanceof T. Pass the constructor as a value:
// function create<T>(Ctor: new () => T): T { return new Ctor(); }
const create = (Ctor) => new Ctor();
class Point { x = 0; y = 0; }
check("pass constructors explicitly instead of new T()", create(Point) instanceof Point);

// Array covariance hole: const dogs: Dog[] = []; const animals: Animal[] = dogs; animals.push(cat);
const dogs = [{ bark: () => "woof" }];
const animals = dogs;                       // TS allows this assignment
animals.push({ meow: () => "meow" });       // and this push
const broken = dogs.filter((d) => typeof d.bark !== "function").length;
check("arrays are covariant (unsound): a 'Dog[]' now holds " + broken + " non-dog", broken === 1);`}],
browser:`<p>Generics have no runtime footprint in any environment; the emitted JS is identical to hand-written untyped code. What does differ is where type information comes from: browser APIs are generic in <code>lib.dom.d.ts</code> (<code>querySelector&lt;K extends keyof HTMLElementTagNameMap&gt;</code>, <code>CustomEvent&lt;T&gt;</code>, <code>Map&lt;K, V&gt;</code>), and Node's in <code>@types/node</code> (<code>EventEmitter</code> generics, <code>Buffer</code>). Typed fetch wrappers like <code>getJson&lt;T&gt;(url)</code> are a common trap: the <code>T</code> is a promise from you, not a check; pair them with a runtime schema.</p>`,
gotchas:[`<code>fetchJson&lt;User&gt;(url)</code> that returns <code>res.json() as T</code> is an unchecked cast with a generic disguise; nothing validates the data.`,`A type parameter used only once (only in the return type, or only in a parameter) is a smell; it either lies (return-only) or adds nothing (param-only).`,`Generics vanish at runtime: no <code>new T()</code>, no <code>instanceof T</code>, no <code>typeof T</code> on values. Pass constructors, keys or schemas as values.`,`Inference widens literals: <code>useState("idle")</code> gives <code>string</code>; pass an explicit type or use <code>const</code> type parameters.`,`Array covariance is unsound: assign <code>Dog[]</code> to <code>Animal[]</code>, push a Cat, and <code>dogs</code> now contains a cat. Prefer <code>readonly</code> arrays in parameters.`,`<code>&lt;T,&gt;</code> or <code>&lt;T extends unknown&gt;</code> is required for generic arrow functions in <code>.tsx</code> files, otherwise it parses as JSX.`],
best:[`Let callers' arguments drive inference; add explicit type arguments only when needed.`,`Constrain type parameters to exactly what the body needs (<code>extends { id: string }</code>), no more.`,`Use defaults (<code>E = Error</code>) for ergonomic generic types, and <code>NoInfer</code>/<code>const</code> parameters to control inference.`,`If a generic needs runtime knowledge of <code>T</code>, accept a schema/constructor/key parameter that carries it.`],
iq:[["mid","What problem do generics solve?","They let one function or type work with many types while preserving the relationship between inputs and outputs. first<T>(xs: T[]): T keeps User in and User out, whereas any loses the type and a union cannot express 'the same type as the input'."],["mid","What does T extends keyof U mean?","A constraint: T must be one of U's property-name literal types. It is used to type key-based access, e.g. get<T, K extends keyof T>(o: T, k: K): T[K], so typos in keys fail to compile and the return type is the property type."],["senior","Explain variance and give an unsound example in TypeScript.","Variance describes how subtyping of type arguments carries over to the generic type: covariant (read-only producers), contravariant (consumers like function parameters), invariant (read-write). TS treats arrays as covariant, so const animals: Animal[] = dogs; animals.push(cat) compiles and corrupts dogs. Method syntax parameters are bivariant, another deliberate hole."],["senior","Why can't you write new T() and what do you do instead?","Type parameters are erased; at runtime there is no T value. Pass a constructor (Ctor: new () => T), a factory function, or a schema object that can both construct/validate and carry the static type (e.g. a zod schema with z.infer)."],["lead","How do you keep generic library types maintainable for a team?","Keep public signatures simple with few parameters and good defaults, constrain precisely, hide complex conditional types behind named aliases, test types with type-level assertions (expectTypeOf, tsd or @ts-expect-error tests), document inference behaviour, and watch compile-time performance with --extendedDiagnostics."]].map(function(q){return [q[0],q[1].replace(/</g,"&lt;").replace(/>/g,"&gt;"),q[2].replace(/</g,"&lt;").replace(/>/g,"&gt;")]}),
practice:[`Write <code>pipe(value, ...fns)</code> with overloads for up to 4 functions so that each function's input type is the previous output.`,`Type <code>createStore&lt;S, A extends { type: string }&gt;(reducer, initial)</code> returning <code>getState</code>, <code>dispatch</code> and <code>subscribe</code>.`,`Write a typed <code>memoize&lt;A extends unknown[], R&gt;(fn: (...a: A) =&gt; R)</code> and verify with <code>@ts-expect-error</code> tests that wrong argument types fail.`],
teach:`<p>"Generics are type variables: they let a function say 'whatever you give me, I give back the same kind'. Infer them from arguments, constrain them to what you use, make each one appear at least twice, and remember they are erased: if you need T at runtime, pass something real that represents it."</p>`},

{id:"d63-utility-types",title:"keyof, typeof, indexed access and utility types",lv:["mid","senior","lead"],
eli5:`<p>Instead of drawing a new map for every trip, you take the one big map and <b>fold it</b>: "only show the roads I need" (<code>Pick</code>), "hide the toll roads" (<code>Omit</code>), "every road is optional today" (<code>Partial</code>). <code>keyof</code> reads the <b>list of street names</b>, <code>typeof</code> traces a map from a real place you already have, and indexed access asks "what kind of road is Main Street?" (<code>Roads["main"]</code>).</p>`,
why:`<p>Duplicated type declarations drift apart: the <code>User</code> type, the <code>UpdateUserInput</code>, the form state and the API DTO slowly disagree. Type operators let you <b>derive</b> types from a single source of truth (often a value, like a config object or a schema), so a change in one place flows everywhere. Utility types are also everywhere in library typings you will read.</p>`,
tech:`<ul class="pts"><li><b><code>keyof T</code></b>: union of T's property names as literal types (<code>keyof {a: 1; b: 2}</code> is <code>"a" | "b"</code>). With an index signature it includes <code>string</code> (and <code>number</code>) instead.</li><li><b>Type-level <code>typeof</code></b>: gets the type of a <b>value</b>: <code>typeof config</code>, <code>typeof fetchUser</code>. Combine: <code>keyof typeof config</code>. Different from the runtime <code>typeof</code> operator (same keyword, different context).</li><li><b>Indexed access</b> <code>T["key"]</code>, <code>T["a" | "b"]</code>, <code>T[number]</code> (element type of an array/tuple), <code>T[keyof T]</code> (union of value types). Classic pattern: <code>const ROLES = ["admin", "user"] as const; type Role = (typeof ROLES)[number];</code></li><li><b>Object utilities:</b> <code>Partial&lt;T&gt;</code>, <code>Required&lt;T&gt;</code>, <code>Readonly&lt;T&gt;</code>, <code>Pick&lt;T, K&gt;</code>, <code>Omit&lt;T, K&gt;</code>, <code>Record&lt;K, V&gt;</code>.</li><li><b>Union utilities:</b> <code>Exclude&lt;U, X&gt;</code>, <code>Extract&lt;U, X&gt;</code>, <code>NonNullable&lt;T&gt;</code>.</li><li><b>Function/class utilities:</b> <code>ReturnType&lt;F&gt;</code>, <code>Parameters&lt;F&gt;</code>, <code>ConstructorParameters&lt;C&gt;</code>, <code>InstanceType&lt;C&gt;</code>, <code>Awaited&lt;T&gt;</code> (unwraps promises recursively), <code>ThisParameterType</code>.</li><li><b>String utilities:</b> <code>Uppercase</code>, <code>Lowercase</code>, <code>Capitalize</code>, <code>Uncapitalize</code> (Day 64).</li><li><b>Gotchas in the definitions:</b> <code>Omit&lt;T, K&gt;</code> accepts any key (typos are silent) and is <b>not distributive</b> over unions (it flattens a discriminated union into one object); <code>Partial</code> is shallow; <code>Record&lt;string, V&gt;</code> claims every key exists.</li><li><b>Why <code>Object.keys(obj)</code> is <code>string[]</code></b>, not <code>(keyof T)[]</code>: structural typing means an object may have more keys than its type lists, so the narrower type would be a lie.</li></ul>`,
diagram:{html:flow([["const config = {…} as const","single source of truth (a value)"],["typeof config","type of the value","w"],["keyof typeof config","'port' | 'host'","w"],["(typeof config)['port']","8080","g"],["Pick / Omit / Partial","derived DTOs, forms, patches","g"]]),steps:["Start from a value or one canonical type.","<code>typeof</code> lifts a value into the type world.","<code>keyof</code> and indexed access slice it into keys and value types.","Utility types build every related shape, so changes propagate automatically."]},
ex:[{t:"Deriving types instead of repeating them (not runnable here)",code:`interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  createdAt: Date;
}

type UserKeys = keyof User;                       // "id" | "name" | "email" | "role" | "createdAt"
type Role = User["role"];                         // "admin" | "editor" | "viewer"
type NewUser = Omit<User, "id" | "createdAt">;    // what the client sends
type UserPatch = Partial<Pick<User, "name" | "email">>;
type UserSummary = Readonly<Pick<User, "id" | "name">>;
type ByRole = Record<Role, User[]>;               // every role key required

const STATUSES = ["draft", "published", "archived"] as const;
type Status = (typeof STATUSES)[number];          // "draft" | "published" | "archived"

const config = { port: 8080, host: "localhost", features: { beta: true } } as const;
type Config = typeof config;
type Port = Config["port"];                       // 8080

async function fetchUser(id: string) { return { id, name: "Ana" }; }
type Fetched = Awaited<ReturnType<typeof fetchUser>>;   // { id: string; name: string }
type FetchArgs = Parameters<typeof fetchUser>;          // [id: string]

type Shape = { kind: "c"; r: number } | { kind: "s"; size: number };
type NoKind = Omit<Shape, "kind">;                // { } ... Omit flattens unions! (only common keys survive)
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type Fixed = DistributiveOmit<Shape, "kind">;     // { r: number } | { size: number }`,run:false},
{t:"Runtime counterparts: pick, omit, partial patches and why Object.keys is string[] (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);

// function pick<T, K extends keyof T>(o: T, ...keys: K[]): Pick<T, K>
const pick = (o, ...keys) => Object.fromEntries(keys.filter((k) => k in o).map((k) => [k, o[k]]));
// function omit<T, K extends keyof T>(o: T, ...keys: K[]): Omit<T, K>
const omit = (o, ...keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k)));

const user = { id: "u1", name: "Ana", email: "a@x.io", role: "admin" };
check("pick builds Pick<User, 'id' | 'name'>", JSON.stringify(pick(user, "id", "name")) === '{"id":"u1","name":"Ana"}');
check("omit builds Omit<User, 'email'>", Object.keys(omit(user, "email")).join() === "id,name,role");

// Partial<T> patch: undefined is allowed (without exactOptionalPropertyTypes) and spread copies it!
const update = (obj, patch) => ({ ...obj, ...patch });
const p = update(user, { name: undefined });
check("a Partial patch with undefined erases the value", p.name === undefined && "name" in p);
const updateSafe = (obj, patch) => ({ ...obj, ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) });
check("filter undefined (or enable exactOptionalPropertyTypes)", updateSafe(user, { name: undefined }).name === "Ana");

// Why Object.keys returns string[]: structural typing allows extra keys
// type Point = { x: number; y: number }; const p3 = { x: 1, y: 2, label: "A" }; const pt: Point = p3;
const pt = { x: 1, y: 2, label: "A" };
const sum = Object.keys(pt).reduce((s, k) => s + pt[k], 0);
check("a 'Point' can carry extra keys, so summing keys gives " + JSON.stringify(sum), sum === "3A");

// const STATUSES = ["draft", "published"] as const; type Status = (typeof STATUSES)[number]
const STATUSES = Object.freeze(["draft", "published", "archived"]);
const isStatus = (s) => STATUSES.includes(s);
check("one array gives both the type (via typeof) and the runtime check", isStatus("draft") && !isStatus("deleted"));

// Record<Role, User[]> forces every key; build it from the role list so none is missing
const ROLES = ["admin", "editor", "viewer"];
const byRole = Object.fromEntries(ROLES.map((r) => [r, []]));
[user, { id: "u2", role: "viewer" }].forEach((u) => byRole[u.role].push(u.id));
check("Record with all keys initialised", Object.keys(byRole).length === 3 && byRole.editor.length === 0 && byRole.viewer[0] === "u2");`}],
browser:`<p>These operators are compile-time only, identical for browser and Node. They shine on platform typings: <code>keyof HTMLElementTagNameMap</code> is every HTML tag name, <code>HTMLElementEventMap["click"]</code> is <code>MouseEvent</code>, <code>Parameters&lt;typeof fetch&gt;[1]</code> is <code>RequestInit | undefined</code>, and <code>ReturnType&lt;typeof setTimeout&gt;</code> is <code>number</code> in the browser but <code>NodeJS.Timeout</code> in Node, which is exactly why portable code uses <code>ReturnType&lt;typeof setTimeout&gt;</code> instead of hard-coding either.</p>`,
gotchas:[`<code>Omit&lt;T, "typo"&gt;</code> compiles without complaint (K is <code>keyof any</code>); write a strict variant if typos matter.`,`<code>Omit</code>/<code>Pick</code> on a union is not distributive: it collapses a discriminated union to its common keys. Use a distributive conditional wrapper.`,`<code>Partial</code>, <code>Readonly</code> and <code>Required</code> are shallow; nested objects keep their original modifiers.`,`<code>Object.keys</code>/<code>Object.entries</code> return <code>string</code> keys because objects can have extra properties; casting to <code>(keyof T)[]</code> is a lie that bites with structural typing.`,`<code>keyof</code> a type with a string index signature is <code>string | number</code> (numeric keys are allowed on string index signatures).`,`<code>ReturnType&lt;typeof overloadedFn&gt;</code> picks the <b>last</b> overload signature.`,`Type-level <code>typeof</code> only works on identifiers/property paths, not on arbitrary expressions (<code>typeof f()</code> is invalid; use <code>ReturnType</code>).`],
best:[`Pick one source of truth (a schema, a const array, an interface) and derive the rest.`,`Prefer <code>as const</code> arrays plus <code>(typeof X)[number]</code> to enums for value lists.`,`Name derived types (<code>type UserPatch = …</code>) instead of inlining long utility chains in signatures.`,`Use <code>Awaited&lt;ReturnType&lt;typeof fn&gt;&gt;</code> to type results of functions you don't own instead of copying their shapes.`],
iq:[["mid","What do keyof and typeof do at the type level?","keyof T produces a union of T's property names as literal types. Type-level typeof takes a value identifier and gives its type. Together, keyof typeof obj gives the keys of a runtime object, which is how you derive types from a config value."],["mid","Explain Partial, Pick, Omit and Record.","Partial<T> makes all properties optional, Pick<T, K> keeps only keys K, Omit<T, K> removes keys K, Record<K, V> builds an object type with keys K and values V. All are mapped types defined in lib.es5.d.ts; Partial is shallow and Omit does not check that K exists."],["senior","Why does Object.keys(obj) return string[] instead of (keyof T)[]?","Because TypeScript is structural: a value of type T may have additional properties not declared in T (e.g. an object with extra fields assigned through a variable). Returning (keyof T)[] would let you index with keys that have unknown value types. Cast only when you control the object's creation."],["senior","How do you get the union of values from an as const array or object?","For an array: (typeof ARR)[number]. For an object: (typeof OBJ)[keyof typeof OBJ]. as const keeps the literal types and makes them readonly, so the derived union contains the exact literals."],["lead","Your team keeps separate User, CreateUserDto, UpdateUserDto and form types that drift. What do you propose?","Choose a single source of truth, ideally a runtime schema (zod/valibot/JSON Schema) or one domain interface, then derive variants with Omit, Pick, Partial and mapped types, generate API types from OpenAPI where applicable, and add type tests so changes to the source surface everywhere at compile time."]].map(function(q){return [q[0],q[1].replace(/</g,"&lt;").replace(/>/g,"&gt;"),q[2].replace(/</g,"&lt;").replace(/>/g,"&gt;")]}),
practice:[`Given an <code>Order</code> interface, derive <code>CreateOrder</code>, <code>OrderPatch</code>, <code>OrderRow</code> (all strings, for CSV) and <code>OrderStatus</code> without restating any property.`,`Write <code>StrictOmit&lt;T, K extends keyof T&gt;</code> and <code>DistributiveOmit</code>; show with <code>@ts-expect-error</code> where each differs from built-in <code>Omit</code>.`,`Type a <code>getConfig(key)</code> function over an <code>as const</code> config object so the return type is the exact value type of that key.`],
teach:`<p>"Don't write the same shape twice. keyof lists the keys, typeof lifts a value into a type, T[K] reads a property type, and Partial, Pick, Omit, Record, ReturnType and Awaited fold one source of truth into every variant you need. Remember Omit doesn't check keys and Object.keys is string[] because objects can carry extras."</p>`}
],quiz:[
{code:`// TS: type Point = { x: number; y: number };
//     const p3 = { x: 1, y: 2, z: 3 };
//     const p: Point = p3;          // OK: structural, not a fresh literal
const p3 = { x: 1, y: 2, z: 3 };
const p = p3;
let sum = 0;
for (const k of Object.keys(p)) sum += p[k];
console.log(Object.keys(p).length, sum);`,ans:`3 6`,why:`Assigning a non-literal object with extra properties to Point is allowed, so at runtime the "Point" still has z. That is exactly why Object.keys returns string[] rather than ("x" | "y")[]: the type does not list every key that may exist.`},
{code:`// TS: function update<T>(obj: T, patch: Partial<T>): T { return { ...obj, ...patch }; }
//     const u2 = update({ name: "Ana", age: 30 }, { age: undefined });   // compiles
function update(obj, patch) { return { ...obj, ...patch }; }
const u2 = update({ name: "Ana", age: 30 }, { age: undefined });
console.log(u2.age, "age" in u2, Object.keys(u2).length);`,ans:`undefined true 2`,why:`Partial&lt;T&gt; makes age optional, which (without exactOptionalPropertyTypes) also allows an explicit undefined. Object spread copies own properties including undefined values, so the patch overwrites 30 with undefined while the key stays present.`}]},
{n:64,title:"Advanced types",goal:"Compute types with conditional, mapped and template literal types, and keep the type system honest where untrusted data enters the program.",topics:[
{id:"d64-conditional-mapped",title:"Conditional, mapped and template literal types",lv:["senior","lead","architect"],
eli5:`<p>Types can be <b>little machines</b>. A conditional type is a sorting machine: "if the parcel is a box, put it on belt A, otherwise belt B". A mapped type is a <b>photocopier with a stamp</b>: copy every field of a form and stamp each one "optional" or "read-only". A template literal type is a <b>label maker</b>: give it "click" and it prints "onClick". You only use these machines to <i>build</i> labels; nothing about them reaches the running program.</p>`,
why:`<p>Library typings (React, Prisma, tRPC, routers, form libraries, zod) rely on these to turn a single definition into precise types for every use: route params from a path string, getters from a model, event-handler names from event names. Senior engineers need to read them, write small ones, and know when type-level cleverness costs more (compile time, error messages, onboarding) than it saves.</p>`,
tech:`<ul class="pts"><li><b>Conditional types:</b> <code>T extends U ? X : Y</code>, evaluated when T is known. <b><code>infer</code></b> captures a part of the matched type: <code>T extends Promise&lt;infer V&gt; ? V : T</code>, <code>T extends (...a: infer A) =&gt; infer R ? …</code>, <code>T extends readonly (infer E)[] ? E : never</code>.</li><li><b>Distribution:</b> when the checked type is a <b>naked type parameter</b> and receives a union, the conditional is applied to each member and the results are unioned: <code>ToArray&lt;string | number&gt;</code> = <code>string[] | number[]</code>. Wrap in a tuple to disable it: <code>[T] extends [U] ? …</code>. <code>never</code> is the empty union, so a distributive conditional over <code>never</code> yields <code>never</code>. <code>Exclude</code>, <code>Extract</code>, <code>NonNullable</code> are built on distribution.</li><li><b>Mapped types:</b> <code>{ [K in keyof T]: T[K] }</code> iterates keys. Modifiers: <code>?</code>, <code>readonly</code>, and removal with <code>-?</code> / <code>-readonly</code> (<code>Required</code>, <code>Mutable</code>). <b>Key remapping</b> with <code>as</code>: rename keys or drop them by mapping to <code>never</code> (<code>[K in keyof T as T[K] extends Function ? never : K]</code>). Homomorphic mapped types (over <code>keyof T</code>) preserve optional/readonly modifiers and map arrays/tuples to arrays/tuples.</li><li><b>Template literal types:</b> <code>\`on\${Capitalize&lt;E&gt;}\`</code>, string unions multiply out (<code>\`\${"a"|"b"}-\${"x"|"y"}\`</code> gives 4 members), and with <code>infer</code> they parse strings: extract <code>:id</code> params from <code>"/users/:id"</code>. Intrinsics: <code>Uppercase</code>, <code>Lowercase</code>, <code>Capitalize</code>, <code>Uncapitalize</code>. Patterns like <code>\`/users/\${number}\`</code> validate string formats loosely.</li><li><b>Recursive types:</b> <code>DeepPartial</code>, <code>DeepReadonly</code>, JSON value types, path strings (<code>"a.b.c"</code>). TS has recursion depth limits (and tail-recursion optimisation for conditional types); deep recursion slows the checker and produces "type instantiation is excessively deep" errors.</li><li><b>Cost and judgment:</b> type-level code is code: test it (<code>expectTypeOf</code>, <code>@ts-expect-error</code>), name intermediate types, profile with <code>--extendedDiagnostics</code>/<code>--generateTrace</code>, and prefer a simpler, slightly less precise type when the clever one makes errors unreadable. The runtime still needs real code that does what the type claims.</li></ul>`,
diagram:{html:flow([["ToArray&lt;string | number&gt;"],["distribute","per union member","w"],["string extends unknown ? string[]","w"],["number extends unknown ? number[]","w"],["string[] | number[]","union of results","g"]])+flow([["\"/users/:id/posts/:pid\""],["match \`\${string}:\${infer P}/\${infer Rest}\`","template literal + infer","w"],["recurse on Rest","w"],["\"id\" | \"pid\"","g"]]),steps:["A conditional on a naked type parameter distributes over unions, one member at a time.","Results are unioned; members mapping to <code>never</code> disappear (that is how <code>Exclude</code> works).","Template literal patterns with <code>infer</code> pull substrings out of string literal types.","Recursion walks the rest of the string until no pattern matches."]},
ex:[{t:"Conditional types with infer, distribution, mapped types with key remapping, template literal parsing (not runnable here)",code:`type IsString<T> = T extends string ? true : false;
type A = IsString<"x">;                       // true
type ToArray<T> = T extends unknown ? T[] : never;
type B = ToArray<string | number>;            // string[] | number[]   (distributive)
type NoDist<T> = [T] extends [unknown] ? T[] : never;
type C = NoDist<string | number>;             // (string | number)[]

type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type UnwrapAll<T> = T extends Promise<infer V> ? UnwrapAll<V> : T;   // like Awaited
type FnArgs<F> = F extends (...args: infer A) => unknown ? A : never;

type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
type G = Getters<{ name: string; age: number }>;   // { getName: () => string; getAge: () => number }
type DataOnly<T> = { [K in keyof T as T[K] extends Function ? never : K]: T[K] };

type Handlers = { [E in "click" | "focus" as \`on\${Capitalize<E>}\`]: (e: Event) => void };
// { onClick: ...; onFocus: ... }

type Params<S extends string> =
  S extends \`\${string}:\${infer P}/\${infer Rest}\` ? P | Params<\`/\${Rest}\`>
  : S extends \`\${string}:\${infer P}\` ? P
  : never;
type P = Params<"/users/:id/posts/:postId">;   // "id" | "postId"
declare function route<S extends string>(path: S, h: (p: Record<Params<S>, string>) => void): void;
route("/users/:id", (p) => p.id);              // p.idd would be an error

type DeepReadonly<T> =
  T extends (...a: any[]) => any ? T
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;`,run:false},
{t:"Runtime twins: the code those types describe (route params, getters, handler names, deep freeze) (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// type Params<"/users/:id/posts/:postId"> = "id" | "postId"
const paramNames = (path) => path.split("/").filter((s) => s.startsWith(":")).map((s) => s.slice(1));
check("route param names from a path", paramNames("/users/:id/posts/:postId").join("|") === "id|postId");
const matchRoute = (pattern, url) => {
  const ps = pattern.split("/"), us = url.split("/");
  if (ps.length !== us.length) return null;
  const out = {};
  for (let i = 0; i < ps.length; i++) {
    if (ps[i].startsWith(":")) out[ps[i].slice(1)] = decodeURIComponent(us[i]);
    else if (ps[i] !== us[i]) return null;
  }
  return out;                                // typed Record<Params<S>, string> in TS
};
const m = matchRoute("/users/:id/posts/:postId", "/users/42/posts/7");
check("matching yields exactly the typed keys", m && m.id === "42" && m.postId === "7" && Object.keys(m).length === 2);

// type Getters<T> = { [K in keyof T as \`get\${Capitalize<K>}\`]: () => T[K] }
const toGetters = (o) => Object.fromEntries(Object.keys(o).map((k) => ["get" + cap(k), () => o[k]]));
const g = toGetters({ name: "Ana", age: 30 });
check("mapped type with key remapping = Object.fromEntries + rename", Object.keys(g).join() === "getName,getAge" && g.getAge() === 30);

// type Handlers = { [E in Events as \`on\${Capitalize<E>}\`]: ... } -- unions multiply in template literals
const events = ["click", "focus"], phases = ["start", "end"];
const names = events.flatMap((e) => phases.map((p) => \`on\${cap(e)}\${cap(p)}\`));
check("template literal unions multiply out (2 x 2 = " + names.length + ")", names.join() === "onClickStart,onClickEnd,onFocusStart,onFocusEnd");

// type DataOnly<T> drops function-valued keys (mapping them to never)
const dataOnly = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v !== "function"));
check("filtering keys by value type", Object.keys(dataOnly({ id: 1, save() {}, name: "x" })).join() === "id,name");

// type DeepReadonly<T>: the runtime version is a recursive freeze
const deepFreeze = (o) => { Object.values(o).forEach((v) => typeof v === "object" && v !== null && deepFreeze(v)); return Object.freeze(o); };
const cfg = deepFreeze({ db: { host: "h", ports: [1, 2] } });
check("deep freeze reaches nested objects and arrays", Object.isFrozen(cfg.db) && Object.isFrozen(cfg.db.ports));

// Distribution in miniature: apply per member, union the results, drop 'never'
const exclude = (union, excluded) => union.filter((t) => !excluded.includes(t));   // Exclude<U, X>
check("Exclude<'a' | 'b' | 'c', 'b'> behaves like a filter", exclude(["a", "b", "c"], ["b"]).join("|") === "a|c");`}],
browser:`<p>No runtime cost anywhere: these types are erased like all others. The cost is at <b>build/edit time</b>: deep conditional types slow the language service in VS Code and the CI check. Frameworks use them heavily for browser concerns (typed router params, typed DOM event maps like <code>HTMLElementEventMap</code>, typed CSS custom properties via template literals) and for Node (typed environment variables, typed RPC). If editor responsiveness drops, inspect with <code>tsc --extendedDiagnostics</code> or <code>--generateTrace</code>.</p>`,
gotchas:[`Distribution only happens on a <b>naked</b> type parameter; <code>T[] extends …</code> or <code>[T] extends …</code> does not distribute, and <code>boolean</code> is the union <code>true | false</code>, so it distributes too.`,`A distributive conditional over <code>never</code> returns <code>never</code>, not your "else" branch; check <code>[T] extends [never]</code> to detect never.`,`Mapped types over <code>keyof T</code> keep optional/readonly modifiers; mapping over a plain union of keys (<code>K in "a" | "b"</code>) does not.`,`<code>infer</code> in a union-of-function position picks the last overload; inference from overloaded functions is limited.`,`Recursive types hit depth limits ("excessively deep") and can slow the editor dramatically on big unions.`,`Template literal types over <code>number</code> or <code>string</code> are loose: <code>\`/users/\${number}\`</code> accepts <code>"/users/1e3"</code> and <code>"/users/-0.5"</code>.`,`Clever types do not make the runtime correct: the implementation still needs casts internally, so test the runtime and the types separately.`],
best:[`Reach for built-ins first (<code>Awaited</code>, <code>ReturnType</code>, <code>Partial</code>…), then small named helpers, and only then custom type machinery.`,`Write type tests (<code>expectTypeOf</code>, <code>@ts-expect-error</code>) for every non-trivial type utility.`,`Keep public APIs simple; hide complex types in internals and give users readable error messages.`,`Measure compile performance when adding recursive or highly distributive types.`],
iq:[["senior","What is a distributive conditional type?","A conditional type whose checked type is a naked type parameter. When instantiated with a union, it is evaluated for each member separately and the results are unioned. ToArray<string | number> gives string[] | number[]. Wrap both sides in a tuple ([T] extends [U]) to treat the union as a whole."],["senior","What does infer do?","It declares a type variable inside the extends clause of a conditional type that TypeScript fills in by pattern matching: T extends Promise<infer V> ? V : T extracts the resolved type; it also works in function parameters, return types, array elements and template literal patterns."],["senior","How would you implement Partial, Required, Readonly and Pick yourself?","Partial<T> = { [K in keyof T]?: T[K] }; Required<T> = { [K in keyof T]-?: T[K] }; Readonly<T> = { readonly [K in keyof T]: T[K] }; Pick<T, K extends keyof T> = { [P in K]: T[P] }. They are homomorphic mapped types, except Pick, which maps over the given keys."],["lead","How can a router type its handlers' params from a path string?","With template literal types and infer: recursively match the path against patterns like `${string}:${infer P}/${infer Rest}` to collect param names into a union, then type the handler's params as Record<Params<Path>, string>. The runtime matcher must produce exactly those keys."],["architect","When is advanced type-level programming a bad idea?","When it makes errors unreadable, slows the compiler or editor, is understood by one person, or claims guarantees the runtime does not provide. Prefer simple explicit types at module boundaries, push complex types into well-tested libraries, and measure check time in CI."]].map(function(q){return [q[0],q[1].replace(/</g,"&lt;").replace(/>/g,"&gt;"),q[2].replace(/</g,"&lt;").replace(/>/g,"&gt;")]}),
practice:[`Implement <code>DeepPartial&lt;T&gt;</code> that leaves functions and arrays sensible, and test it with <code>@ts-expect-error</code>.`,`Write <code>PathKeys&lt;T&gt;</code> producing <code>"a" | "a.b" | "a.b.c"</code> for nested objects, then a <code>get(obj, path)</code> whose return type follows the path; implement the runtime too.`,`Type an event bus where <code>on("user:created", fn)</code> infers the payload from a map and <code>\`\${Entity}:\${Action}\`</code> names are generated from two unions.`],
teach:`<p>"Conditional types are if-statements for types, with infer to pull pieces out; they distribute over unions. Mapped types copy every key with a stamp, and as can rename or drop keys. Template literal types build and parse strings. Use them to derive precise types from one definition, test them, and keep the runtime doing what they promise."</p>`},

{id:"d64-type-safety",title:"Type safety at the edges: unknown, assertions, satisfies and runtime validation",lv:["mid","senior","lead","architect"],
eli5:`<p>Your house (the program) has a front door (where data arrives: APIs, forms, files). Inside, everyone trusts the labels on boxes. <b>Type assertions</b> (<code>as</code>) are writing a label yourself without looking inside. <b>Validation</b> is opening the box at the door and checking. <code>unknown</code> means "unopened box, look before you touch"; <code>any</code> means "pretend it's whatever you like", which is how glass ends up in the cereal box. A <b>brand</b> is a stamp the inspector puts on boxes that passed: "checked email".</p>`,
why:`<p>Static types only describe what the compiler can see. Every serious production type bug comes from the edges: <code>JSON.parse</code>, <code>fetch</code>, env vars, <code>localStorage</code>, <code>postMessage</code>, third-party SDKs with wrong typings, and casts that "shut the compiler up". Knowing how to keep the inside of a program trustworthy is what separates seniors from people who just add <code>as any</code>.</p>`,
tech:`<ul class="pts"><li><b><code>any</code> vs <code>unknown</code>:</b> <code>any</code> disables checking and leaks (properties of <code>any</code> are <code>any</code>, it is assignable to everything). <code>unknown</code> accepts everything but allows nothing until narrowed. Use <code>unknown</code> for untrusted input and in <code>catch (e)</code> (<code>useUnknownInCatchVariables</code>, part of strict). Lint against <code>any</code> (<code>no-explicit-any</code>, <code>no-unsafe-*</code> rules).</li><li><b>Type assertions</b> <code>x as T</code>: tell the compiler "trust me"; no runtime conversion or check. TS only allows assertions between sufficiently related types; <code>x as unknown as T</code> forces anything (a red flag in review). <code>as const</code> is different: it narrows to literal readonly types and is safe.</li><li><b>Non-null assertion</b> <code>x!</code>: removes <code>null | undefined</code> from the type; crashes later if wrong. Prefer narrowing, <code>?.</code>/<code>??</code>, or an explicit throw with a message.</li><li><b><code>satisfies</code></b>: <code>const routes = {...} satisfies Record&lt;string, Route&gt;</code> checks the value against a type <b>without widening</b> it: you keep the literal key names and value types for inference while still getting errors for typos and missing fields. Annotation (<code>: T</code>) widens to T; <code>as T</code> skips checks; <code>satisfies T</code> checks and keeps precision.</li><li><b>Branded (nominal) types:</b> <code>type UserId = string &amp; { readonly __brand: "UserId" }</code>. Only a validating constructor (<code>toUserId(s): UserId</code>) produces one, so you cannot pass an <code>OrderId</code> or raw string by mistake. Zero runtime cost: at runtime it is the same string. Variants: <code>unique symbol</code> brands; class <code>#private</code> brands.</li><li><b>Runtime validation:</b> parse, don't validate: convert <code>unknown</code> into a trusted type once at the boundary and pass the typed result inward. Schema libraries (zod, valibot, ArkType, TypeBox/JSON Schema with ajv; Standard Schema is an emerging common interface) give both the runtime check and the static type (<code>z.infer&lt;typeof User&gt;</code>), so they never drift. Validate env/config at startup and fail fast.</li><li><b>Other escape hatches:</b> <code>// @ts-ignore</code> (silences the next line forever), <code>// @ts-expect-error</code> (errors if there is no error: safer, self-cleaning), <code>declare</code> for globals, and wrong <code>.d.ts</code> files from libraries (verify suspicious typings).</li></ul>`,
diagram:{html:flow([["fetch / JSON / env / form","unknown","r"],["schema.parse()","runtime check at the door","w"],["typed domain values","User, Email (branded)","g"],["core logic","no casts, no any","g"]]),steps:["Everything entering the process starts as <code>unknown</code>, whatever the library typings claim.","A schema validates and converts it once, failing loudly with a path to the bad field.","The parse result carries an accurate static type (and brands where meaning matters).","Inner code trusts types without re-checking; casts and <code>any</code> stay out of the core."]},
ex:[{t:"unknown, as, !, satisfies and brands compared (not runnable here)",code:`const raw: unknown = JSON.parse(text);
// raw.name;                                  // error: 'raw' is of type 'unknown'
if (typeof raw === "object" && raw !== null && "name" in raw && typeof raw.name === "string") {
  raw.name.toUpperCase();                     // narrowed, safe
}

const user = JSON.parse(text) as User;        // compiles; zero checking (JSON.parse returns any anyway)
const el = document.getElementById("app")!;   // non-null assertion: crashes later if missing

type Route = { path: string; auth: boolean };
const routes = {
  home: { path: "/", auth: false },
  admin: { path: "/admin", auth: true },
  // typo: { pth: "/x", auth: false },        // error caught by satisfies
} satisfies Record<string, Route>;
routes.admin.path;                            // keys stay precise: "home" | "admin"
const r2: Record<string, Route> = routes;     // an annotation would have widened keys to string

type Brand<T, B extends string> = T & { readonly __brand: B };
type Email = Brand<string, "Email">;
type UserId = Brand<string, "UserId">;
function toEmail(s: string): Email {
  if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(s)) throw new Error("invalid email");
  return s as Email;                          // the ONLY place the cast is allowed
}
declare function sendWelcome(to: Email, id: UserId): void;
// sendWelcome("x@y.io", "u1");               // error: string is not Email

// With a schema library (zod-style), one definition gives the check and the type:
// const UserSchema = z.object({ id: z.string(), email: z.string().email(), age: z.number().int().optional() });
// type User = z.infer<typeof UserSchema>;
// const u = UserSchema.parse(await res.json());   // throws with a path on bad data

try { risky(); } catch (e) {                  // e: unknown under strict
  const msg = e instanceof Error ? e.message : String(e);
}`,run:false},
{t:"A tiny schema validator with inferred-style results, branded values, and why 'as' and '!' don't protect you (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
class ValidationError extends Error { constructor(path, msg) { super(path + ": " + msg); this.path = path; } }
const fail = (path, msg) => { throw new ValidationError(path, msg); };

// A minimal zod-like API: each schema has parse(value, path) -> typed value
const s = {
  string: () => ({ parse: (v, p = "$") => (typeof v === "string" ? v : fail(p, "expected string")) }),
  number: () => ({ parse: (v, p = "$") => (typeof v === "number" && Number.isFinite(v) ? v : fail(p, "expected number")) }),
  literal: (...vals) => ({ parse: (v, p = "$") => (vals.includes(v) ? v : fail(p, "expected one of " + vals.join("|"))) }),
  optional: (inner) => ({ parse: (v, p = "$") => (v === undefined ? undefined : inner.parse(v, p)) }),
  array: (item) => ({ parse: (v, p = "$") => (Array.isArray(v) ? v.map((x, i) => item.parse(x, p + "[" + i + "]")) : fail(p, "expected array")) }),
  object: (shape) => ({
    parse(v, p = "$") {
      if (typeof v !== "object" || v === null || Array.isArray(v)) fail(p, "expected object");
      const out = {};
      for (const k of Object.keys(shape)) { const val = shape[k].parse(v[k], p + "." + k); if (val !== undefined) out[k] = val; }
      return out;                                       // unknown keys are stripped
    }
  }),
  brand: (inner, test, label) => ({ parse: (v, p = "$") => { const x = inner.parse(v, p); return test(x) ? x : fail(p, "invalid " + label); } })
};
const safeParse = (schema, v) => { try { return { success: true, data: schema.parse(v) }; } catch (e) { if (e instanceof ValidationError) return { success: false, error: e.message }; throw e; } };

// type Email = string & { __brand: "Email" }   -> at runtime just a validated string
const Email = s.brand(s.string(), (x) => /^[^@ ]+@[^@ ]+[.][^@ ]+$/.test(x), "email");
const User = s.object({ id: s.string(), email: Email, role: s.literal("admin", "viewer"), tags: s.optional(s.array(s.string())) });
// type User = Infer<typeof User>  -> { id: string; email: Email; role: "admin" | "viewer"; tags?: string[] }

const good = safeParse(User, JSON.parse('{"id":"u1","email":"a@x.io","role":"admin","isAdmin":true}'));
check("valid input parses and unknown keys are stripped", good.success && good.data.email === "a@x.io" && !("isAdmin" in good.data));
const bad = safeParse(User, JSON.parse('{"id":"u1","email":"a@x.io","role":"root"}'));
check("bad enum value reports a path: " + bad.error, !bad.success && bad.error === "$.role: expected one of admin|viewer");
const bad2 = safeParse(User, { id: "u1", email: "nope", role: "viewer" });
check("brand check rejects an invalid email", !bad2.success && bad2.error === "$.email: invalid email");
const bad3 = safeParse(User, { id: "u1", email: "a@x.io", role: "viewer", tags: ["ok", 5] });
check("nested array errors point at the element", bad3.error === "$.tags[1]: expected string");
check("a branded value is a plain string at runtime (zero cost)", typeof good.data.email === "string");

// 'as' is not a conversion: const n = JSON.parse('"42"') as number
const n = JSON.parse('"42"');
check("'as number' leaves a string, so + concatenates", n + 1 === "421");

// '!' is a promise, not a check: document.getElementById("missing")!.textContent
const lookup = new Map([["a", { name: "A" }]]);
let crashed = false;
try { lookup.get("b").name; } catch (e) { crashed = e instanceof TypeError; }
check("a wrong non-null assertion crashes later with a TypeError", crashed);

// Validate config at startup: env values are always strings
const Config = s.object({ PORT: s.brand(s.string(), (x) => /^[0-9]+$/.test(x), "port") });
const cfg = safeParse(Config, { PORT: "80a" });
check("fail fast on bad configuration", !cfg.success && cfg.error === "$.PORT: invalid port");`}],
browser:`<p>The browser is the biggest edge: <code>fetch().json()</code>, <code>localStorage</code>, URL params, <code>postMessage</code> (always check <code>event.origin</code> and validate <code>event.data</code>), and DOM lookups (<code>querySelector</code> returns <code>T | null</code>). Validation libraries add bundle weight, so pick a tree-shakeable one (valibot-style) or validate on the server and keep a thin check client-side. In Node, the edges are request bodies, env vars (<code>process.env.X</code> is <code>string | undefined</code>), files and queues; validate config once at startup and exit with a clear error.</p>`,
gotchas:[`<code>JSON.parse</code>, <code>res.json()</code> and many SDK methods return <code>any</code>, which silently converts to whatever you assign; treat them as <code>unknown</code> (wrap them or use lint rules like <code>no-unsafe-assignment</code>).`,`<code>as</code> never converts: <code>"42" as unknown as number</code> is still a string at runtime, so <code>+</code> concatenates.`,`<code>x!</code> hides nulls until they crash somewhere else, usually with a less helpful error than an explicit check.`,`<code>satisfies</code> does not change the variable's type to the target; if you need the wider type (e.g. to add keys later), use an annotation.`,`<code>@ts-ignore</code> silences errors forever, even after the cause is fixed or changes; prefer <code>@ts-expect-error</code> with a comment.`,`Brands are only as good as their constructor: one stray <code>"x" as Email</code> breaks the guarantee; restrict casts to the factory and lint the rest.`,`Validation that only checks "is an object" and then casts gives a false sense of safety; validate every field you read, including nested arrays.`],
best:[`Treat all external data as <code>unknown</code> and parse it at the boundary with a schema that also produces the static type.`,`Ban <code>any</code> and unchecked <code>as</code> in core code via lint; allow them only in small, reviewed adapter modules.`,`Use <code>satisfies</code> for config/route/lookup tables; brands for IDs, units and validated strings.`,`Fail fast: validate env/config at startup, return precise error paths to API clients (422 with field paths).`],
iq:[["fresher","What is the difference between any and unknown?","any turns off type checking and can be used and assigned anywhere; unknown can hold anything but must be narrowed before use. Use unknown for untrusted data so the compiler forces you to check it."],["mid","What does 'as' do at runtime?","Nothing. A type assertion only changes the compile-time type; no conversion or check happens. JSON.parse('\"42\"') as number is still a string, so arithmetic with + concatenates. Assertions are for cases where you know more than the compiler, not for validating data."],["mid","What problem does satisfies solve?","It checks that an expression conforms to a type without changing the inferred type. With a config object you get typo and missing-field errors from the target type while keeping literal keys and value types for later inference, which an annotation would widen away."],["senior","What are branded types and when would you use them?","A primitive intersected with a unique marker (string & { __brand: 'UserId' }) so structurally identical values become incompatible. Use them for IDs, currencies/units and validated values like Email; only a validating constructor creates them, and they cost nothing at runtime."],["lead","How do you make an API client type-safe end to end?","Share or generate a contract (OpenAPI/JSON Schema, tRPC, or shared zod schemas), validate responses at runtime at the client boundary (at least in development and for critical paths), derive TS types from the schema, model errors as typed results, and keep casts confined to the generated adapter layer."],["architect","Static types vs runtime validation: where do you draw the line?","Static types for everything inside trust boundaries; runtime validation at every boundary where data crosses process, network, storage or user input, and also between independently deployed services. Use one schema to produce both, version contracts, and monitor validation failures as a signal of contract drift."]].map(function(q){return [q[0],q[1].replace(/</g,"&lt;").replace(/>/g,"&gt;"),q[2].replace(/</g,"&lt;").replace(/>/g,"&gt;")]}),
practice:[`Extend the tiny validator above with <code>s.union</code>, <code>s.record</code> and a type-level <code>Infer&lt;S&gt;</code> in a <code>.ts</code> file so the static type follows the schema.`,`Add brands <code>UserId</code> and <code>OrderId</code> to a small codebase and fix every place the compiler finds where they were mixed up.`,`Find every <code>as</code>, <code>!</code> and <code>any</code> in a project (<code>grep</code> or lint rules); classify each as justified, replaceable by narrowing, or replaceable by validation, and fix five.`],
teach:`<p>"Inside the house, trust the labels; at the door, open the boxes. Everything from outside is unknown until a schema parses it into a real type. as and ! are promises with no checks, any switches the checker off, satisfies checks without widening, and brands stamp values that passed inspection."</p>`}
],quiz:[
{code:`// TS: type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
//     the runtime that implements Getters<{ name: string; age: number }>:
const toGetters = (o) => Object.fromEntries(Object.keys(o).map((k) => ["get" + k[0].toUpperCase() + k.slice(1), () => o[k]]));
const g = toGetters({ name: "Ana", age: 30 });
console.log(Object.keys(g).join(","), g.getAge(), \`on\${"click"[0].toUpperCase()}lick\`);`,ans:`getName,getAge 30 onClick`,why:`The mapped type with key remapping describes exactly this Object.fromEntries rename, and keys keep insertion order. Template literal types mirror template literal strings: the type \`on\${Capitalize&lt;"click"&gt;}\` is "onClick", just like the runtime string.`},
{code:`// TS: const n = JSON.parse('"42"') as number;   // compiles: no error
//     const m = Number(JSON.parse('"42"'));      // an actual conversion
const n = JSON.parse('"42"');
const m = Number(JSON.parse('"42"'));
console.log(n + 1, typeof n, m + 1);`,ans:`421 string 43`,why:`A type assertion only changes what the compiler believes; the parsed value is still the string "42", so + concatenates. Converting (or validating) requires real runtime code such as Number().`}]},
{n:65,title:"TypeScript in real projects",goal:"Configure TypeScript correctly for apps and libraries, understand modules and declaration files, and plan an incremental JavaScript-to-TypeScript migration; finish with an interview round.",topics:[
{id:"d65-tsconfig",title:"tsconfig, strictness, modules and declaration files",lv:["mid","senior","lead","architect"],
eli5:`<p><code>tsconfig.json</code> is the <b>settings panel of the spell-checker</b>: how strict to be ("flag every maybe-missing value"), which dictionary to use (browser words, Node words), what kind of letters to write out (old or new JavaScript, <code>import</code> or <code>require</code>). Declaration files (<code>.d.ts</code>) are <b>instruction leaflets</b> that come with a library: they describe its buttons without containing the machine.</p>`,
why:`<p>Most "TypeScript is annoying" stories are actually configuration problems: wrong module settings causing import errors, missing <code>strict</code> letting nulls through, broken library types, slow builds in monorepos. Leads and architects own these settings, and library authors must ship correct <code>.d.ts</code> files and <code>exports</code> maps or every consumer suffers.</p>`,
tech:`<ul class="pts"><li><b>Strictness:</b> <code>"strict": true</code> enables the family: <code>noImplicitAny</code>, <code>strictNullChecks</code> (the big one: <code>null</code>/<code>undefined</code> are separate types), <code>strictFunctionTypes</code>, <code>strictBindCallApply</code>, <code>strictPropertyInitialization</code>, <code>noImplicitThis</code>, <code>useUnknownInCatchVariables</code>, <code>alwaysStrict</code> (and new strict checks as they are added). Worth adding: <code>noUncheckedIndexedAccess</code> (index reads include <code>undefined</code>), <code>exactOptionalPropertyTypes</code>, <code>noImplicitOverride</code>, <code>noFallthroughCasesInSwitch</code>, <code>noImplicitReturns</code>.</li><li><b>Output:</b> <code>target</code> (syntax level emitted, e.g. ES2022), <code>lib</code> (which built-in APIs exist: <code>ES2023</code>, <code>DOM</code>, <code>DOM.Iterable</code>, <code>WebWorker</code>), <code>outDir</code>/<code>rootDir</code>, <code>sourceMap</code>, <code>declaration</code>/<code>declarationMap</code>, <code>noEmit</code> (check only, when a bundler emits).</li><li><b>Modules:</b> <code>module</code> + <code>moduleResolution</code> must match how code runs. Node apps/libraries: <code>"module": "nodenext"</code> (ESM vs CJS decided per file by <code>package.json "type"</code> and <code>.mts/.cts</code>; relative ESM imports need extensions). Bundled apps: <code>"module": "preserve"</code> or <code>"esnext"</code> with <code>"moduleResolution": "bundler"</code> (extensionless imports, <code>exports</code> conditions). <code>verbatimModuleSyntax</code>: imports/exports are emitted exactly as written, so type-only imports must say <code>import type</code>; it replaces older <code>importsNotUsedAsValues</code>/<code>isolatedModules</code> concerns for single-file transpilers. <code>esModuleInterop</code> adds helpers so <code>import fs from "fs"</code> works with CommonJS.</li><li><b>Running .ts directly:</b> <code>allowImportingTsExtensions</code> (with <code>noEmit</code>) or <code>rewriteRelativeImportExtensions</code> (rewrites <code>./x.ts</code> to <code>./x.js</code> on emit) plus <code>erasableSyntaxOnly</code> match Node's type stripping.</li><li><b>Paths:</b> <code>paths</code> aliases (<code>"@/*": ["./src/*"]</code>) only affect type resolution; the bundler/runtime must be configured too (or use package.json <code>imports</code> with <code>#src/*</code>, which both understand).</li><li><b>Scale:</b> <code>extends</code> shared base configs (e.g. <code>@tsconfig/strictest</code>, <code>@tsconfig/node-lts</code>), <code>incremental</code>, <b>project references</b> (<code>composite</code>, <code>tsc -b</code>) to build monorepo packages in dependency order, <code>skipLibCheck</code> to skip checking <code>node_modules</code> declarations, <code>isolatedDeclarations</code> so other tools can generate <code>.d.ts</code> per file. Newer releases (6.0) deprecate several legacy options (such as ES5 targets and old <code>node</code>/<code>classic</code> resolution) ahead of the Go-based TypeScript 7; check the release notes for your version.</li><li><b>Declaration files:</b> <code>.d.ts</code> contain only types. Sources: bundled with the package (<code>"types"</code> / <code>exports</code> <code>"types"</code> condition, listed <b>first</b>), DefinitelyTyped (<code>@types/x</code>), or your own: <code>declare module "untyped-lib" { … }</code>, <code>declare module "*.svg"</code> for assets, <b>module augmentation</b> (<code>declare module "express" { interface Request { user?: User } }</code>), <code>declare global { interface Window { … } }</code> (file must be a module). Dual ESM/CJS packages need separate <code>.d.mts</code>/<code>.d.cts</code> or correct conditions; check with "Are the types wrong?" (<code>@arethetypeswrong/cli</code>).</li></ul>`,
diagram:{html:lanes([["Front-end app (Vite etc.)",["module: preserve / esnext","moduleResolution: bundler","noEmit: true (bundler emits)","lib: DOM, ES2023","verbatimModuleSyntax","strict + noUncheckedIndexedAccess"]],["Node service",["module: nodenext","outDir: dist (or run .ts directly)","types: [\"node\"]","rewriteRelativeImportExtensions","erasableSyntaxOnly","strict"]],["Published library",["module: nodenext","declaration + declarationMap","exports with \"types\" first","isolatedDeclarations","test with attw / publint","no DOM unless needed"]]]),steps:["Pick module settings that mirror the real runtime: a bundler, Node, or both (library).","Apps usually let the bundler emit and use <code>tsc --noEmit</code> for checking.","Libraries emit JS + <code>.d.ts</code> and must describe ESM/CJS entry points correctly in <code>exports</code>.","Strict flags are the same everywhere: turn them on and keep them on."]},
ex:[{t:"A strict tsconfig for a Node service, plus declaration file patterns (not runnable here)",code:`// tsconfig.json
{
  "extends": "@tsconfig/node-lts/tsconfig.json",   // shared base config
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "module": "nodenext",                // ESM/CJS per package.json "type" and .mts/.cts
    "target": "es2022",
    "verbatimModuleSyntax": true,        // forces 'import type' for types
    "erasableSyntaxOnly": true,          // no enums/namespaces/param properties
    "rewriteRelativeImportExtensions": true,  // import "./db.ts" -> "./db.js" in output
    "outDir": "dist", "rootDir": "src",
    "sourceMap": true, "declaration": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}

// src/types/env.d.ts: augment a global
declare global {
  namespace NodeJS { interface ProcessEnv { DATABASE_URL?: string } }
}
export {};                               // makes this file a module so 'declare global' is allowed

// src/types/vendor.d.ts: type an untyped dependency
declare module "legacy-color" {
  export function parse(input: string): { r: number; g: number; b: number } | null;
}
declare module "*.svg" { const url: string; export default url; }

// Module augmentation: add a property to a library's interface
import "express";
declare module "express" { interface Request { user?: { id: string } } }

// package.json for a dual library: "types" must come first in each condition block
// "exports": { ".": { "import": { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
//                     "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" } } }`,run:false},
{t:"Runtime side: what interop helpers and exports conditions actually do, and the bug noUncheckedIndexedAccess prevents (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);

// esModuleInterop: import fs from "fs" compiles to roughly __importDefault(require("fs")).default
const __importDefault = (mod) => (mod && mod.__esModule ? mod : { default: mod });
const cjsModule = { readFile: () => "data" };                         // module.exports = {...}
const esmCompiled = { __esModule: true, default: { hello: () => "hi" } };
check("CommonJS exports become the default import", __importDefault(cjsModule).default.readFile() === "data");
check("compiled ESM keeps its real default", __importDefault(esmCompiled).default.hello() === "hi");

// How Node/bundlers resolve package.json "exports": walk conditions in OBJECT KEY ORDER
function resolveExports(exportsField, subpath, conditions) {
  const isSubpathMap = typeof exportsField === "object" && Object.keys(exportsField).some((k) => k.startsWith("."));
  const entry = isSubpathMap ? exportsField[subpath] : subpath === "." ? exportsField : undefined;
  const pick = (t) => {
    if (typeof t === "string") return t;
    if (t && typeof t === "object") for (const [k, v] of Object.entries(t)) if (k === "default" || conditions.includes(k)) { const r = pick(v); if (r) return r; }
    return undefined;
  };
  return pick(entry);
}
const good = { ".": { import: { types: "./index.d.mts", default: "./index.mjs" }, require: { types: "./index.d.cts", default: "./index.cjs" } }, "./utils": "./utils.js" };
check("ESM runtime picks the .mjs", resolveExports(good, ".", ["import", "node"]) === "./index.mjs");
check("TypeScript (types condition) picks the .d.cts for require", resolveExports(good, ".", ["types", "require", "node"]) === "./index.d.cts");
check("plain string subpath export", resolveExports(good, "./utils", ["import"]) === "./utils.js");
check("unexported subpaths are blocked", resolveExports(good, "./internal", ["import"]) === undefined);
const wrongOrder = { ".": { default: "./index.js", types: "./index.d.ts" } };
check("'types' listed after 'default' is never reached (a classic broken package)", resolveExports(wrongOrder, ".", ["types"]) === "./index.js");

// noUncheckedIndexedAccess: without it, scores["bob"] is typed number
const scores = { ana: 10 };
const list = [1, 2, 3];
let crashed = false;
try { scores["bob"].toFixed(1); } catch (e) { crashed = e instanceof TypeError; }
check("index reads can be undefined at runtime", scores.bob === undefined && list[5] === undefined && crashed);
check("the flag forces a fallback like this", (scores["bob"] ?? 0) + 1 === 1);

// verbatimModuleSyntax: 'import type' lines are dropped entirely, value imports are kept as written
const src = ['import type { User } from "./types.ts";', 'import { db } from "./db.ts";'];
const emitted = src.filter((l) => !l.startsWith("import type")).map((l) => l.replace('.ts"', '.js"'));
check("type-only imports vanish; .ts specifiers are rewritten", emitted.length === 1 && emitted[0] === 'import { db } from "./db.js";');`}],
browser:`<p>For the browser, the bundler is the runtime that matters: use <code>"moduleResolution": "bundler"</code>, <code>"noEmit": true</code>, include <code>DOM</code> in <code>lib</code>, and let Vite/esbuild/SWC transpile (they ignore most tsconfig options except a few like <code>jsx</code>, <code>paths</code> in some setups, <code>useDefineForClassFields</code>, <code>experimentalDecorators</code>). Don't include <code>@types/node</code> in browser code or <code>setTimeout</code> will be typed as Node's. For Node, use <code>nodenext</code> so TypeScript enforces the same ESM/CJS rules Node does (file extensions, <code>"type": "module"</code>, no <code>require</code> of ESM in older versions); if you run <code>.ts</code> with Node's type stripping, remember Node ignores <code>tsconfig.json</code> entirely (no <code>paths</code>, no down-levelling).</p>`,
gotchas:[`<code>paths</code> aliases don't exist at runtime; without bundler or runtime config the emitted <code>import "@/x"</code> fails. Prefer package.json <code>imports</code> (<code>#x</code>) which TS, Node and bundlers all understand.`,`<code>moduleResolution: "node"</code> (node10) does not understand <code>exports</code> maps; modern packages resolve wrongly or fall back to old entry points. Use <code>nodenext</code> or <code>bundler</code>.`,`<code>skipLibCheck</code> hides errors in all <code>.d.ts</code> files, including your own hand-written ones; keep your declarations in checked <code>.ts</code> files where possible.`,`<code>declare global</code> only works in a module file; in a script file the declarations are already global (and an accidental top-level <code>import</code> changes that).`,`<code>target</code> controls syntax only; it does not polyfill APIs. Using <code>Array.prototype.findLast</code> with a lib that includes it type-checks but still crashes on old runtimes.`,`In an <code>exports</code> condition block, <code>"types"</code> must come before <code>"default"</code> (conditions are matched in object order).`,`Turning on <code>strict</code> late creates thousands of errors; plan it as a migration (Day 65 topic 2), not a flag flip.`],
best:[`Share a strict base config across the org and extend it per package; keep overrides rare and commented.`,`Mirror the runtime: <code>nodenext</code> for Node, <code>bundler</code> + <code>noEmit</code> for bundled apps.`,`Enable <code>verbatimModuleSyntax</code>, <code>isolatedModules</code>-compatible code and <code>erasableSyntaxOnly</code> so any transpiler (or Node) can process files one at a time.`,`For libraries: emit <code>.d.ts</code>, set <code>exports</code> with <code>types</code> first, and verify with <code>attw</code>/<code>publint</code> in CI.`],
iq:[["mid","What does strict: true enable and which single flag matters most?","A family of checks: noImplicitAny, strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitThis, useUnknownInCatchVariables, alwaysStrict and newer strict checks. strictNullChecks matters most: without it null and undefined are assignable to everything, so the most common runtime crash is invisible."],["mid","What is a .d.ts file and where do types for a library come from?","A declaration file containing only type information (no implementation). Types come from the package itself (types field or the types condition in exports), from DefinitelyTyped @types packages, or from your own declare module blocks for untyped code or asset imports."],["senior","module: nodenext vs moduleResolution: bundler?","nodenext models Node exactly: package.json type and .mts/.cts decide ESM vs CJS, relative ESM imports need file extensions, exports/imports maps are honoured. bundler models tools like Vite/esbuild: ESM syntax, extensionless and directory imports allowed, exports conditions honoured. Use nodenext for code Node runs (and libraries), bundler for bundled apps."],["senior","What is module augmentation and when do you need it?","Reopening a module's or the global scope's interfaces from your code via declare module 'x' { interface ... } or declare global { ... }, relying on interface declaration merging. Used to add request.user to Express, custom properties to Window, theme types to UI libraries, or env vars to ProcessEnv."],["lead","How do you speed up type-checking in a large monorepo?","Project references with composite and tsc -b so packages build incrementally in dependency order; incremental builds with cached .tsbuildinfo; skipLibCheck; isolatedDeclarations so declaration emit can be parallelised; avoid huge unions and deep recursive types; profile with --extendedDiagnostics/--generateTrace; and evaluate the Go-based native compiler preview for big speedups."],["architect","How do you publish a TypeScript library that works for ESM, CommonJS and bundlers?","Build ESM (and CJS if needed) with matching .d.mts/.d.cts declarations, describe them with exports conditions (types first, then import/require/default), avoid non-erasable syntax and global augmentations, declare peerDependencies, add sideEffects for tree-shaking, and verify with attw, publint and consumer smoke tests in CI."]].map(function(q){return [q[0],q[1].replace(/</g,"&lt;").replace(/>/g,"&gt;"),q[2].replace(/</g,"&lt;").replace(/>/g,"&gt;")]}),
practice:[`Create a minimal Node project with <code>"type": "module"</code>, <code>nodenext</code> and two files; break and fix imports (missing extension, <code>import type</code>, CommonJS dependency) to see each error.`,`Write a <code>.d.ts</code> for a small untyped npm package and an augmentation that adds <code>user</code> to Express's <code>Request</code>.`,`Turn on <code>noUncheckedIndexedAccess</code> in an existing project; count the errors and categorise how many were real bugs.`],
teach:`<p>"tsconfig is the checker's settings panel: turn strict on and keep it on, make module settings match how the code really runs (nodenext for Node, bundler for apps), let the bundler emit while tsc only checks, and ship libraries with .d.ts files and an exports map that lists types first."</p>`},

{id:"d65-ts-migration",title:"Migrating JavaScript to TypeScript and TS interview round",lv:["mid","senior","lead","architect"],
eli5:`<p>Renovating a house while people live in it. You don't knock it all down: you start with the <b>foundation and pipes</b> (small shared utilities with no dependencies), one room at a time, putting up "under renovation" signs (<code>// @ts-expect-error</code>) where needed and never letting the number of signs grow. Some rooms just get <b>sticky notes</b> (JSDoc comments) instead of a full rebuild, and that's fine.</p>`,
why:`<p>Most companies have large JavaScript codebases that are migrating, or have finished migrating "loosely" with <code>any</code> everywhere. Leads are asked to plan this without freezing feature work, and interviews often include "how would you migrate X" plus rapid-fire TypeScript questions. This topic closes the week with both.</p>`,
tech:`<ul class="pts"><li><b>Step 0: tooling in place.</b> Add TypeScript, a tsconfig with <code>allowJs</code> (compile JS alongside TS) and <code>noEmit</code> if a bundler builds; run <code>tsc --noEmit</code> in CI from day one even if it checks nothing yet. Install <code>@types/*</code> for dependencies.</li><li><b>Step 1: check JS without renaming.</b> <code>checkJs</code> (or <code>// @ts-check</code> per file) type-checks JavaScript using inference and <b>JSDoc</b> types: <code>/** @param {string} id @returns {Promise&lt;User&gt;} */</code>, <code>@typedef</code>, <code>@type</code>, <code>@template</code>, and <code>import("./types").User</code>. Some projects stay on JSDoc + <code>.d.ts</code> permanently (no build step).</li><li><b>Step 2: rename incrementally, leaves first.</b> Convert modules with no internal dependencies first (utils, types, API clients), then work up the import graph; shared types early pay off everywhere. Keep PRs small: rename + minimal types, then tighten. Codemods (e.g. Airbnb's ts-migrate) can bulk-rename and insert <code>any</code>/<code>@ts-expect-error</code> to get green fast, but then you own a cleanup backlog.</li><li><b>Step 3: strictness ratchet.</b> Either start with <code>strict</code> on and suppress existing errors (<code>@ts-expect-error</code> with a ticket reference) or turn flags on one by one (<code>noImplicitAny</code> then <code>strictNullChecks</code>, the most work). Track counts of <code>any</code>, suppressions and errors per directory; CI fails if a count goes <b>up</b>. Tools like type-coverage report the percentage of typed identifiers.</li><li><b>Boundaries first:</b> type and validate the API layer, env/config and storage early; this is where types prevent real incidents. Generate types from OpenAPI/GraphQL/DB schemas instead of hand-writing them.</li><li><b>People and process:</b> a short style guide (interface vs type, no enums, no <code>any</code> without comment), lint rules (<code>typescript-eslint</code> recommended-type-checked), pairing/office hours, and celebrating deleted suppressions. Don't block features: "new files must be TS" is a common first rule.</li><li><b>Common traps:</b> converting dynamic patterns (mixins, heavily overloaded functions, objects built up property by property) needs refactoring, not just annotations; tests should run against compiled output or a TS-aware runner (Vitest, Jest with SWC/ts-jest, Node's test runner with type stripping).</li></ul><p><b>Interview round:</b> the questions below cover the whole week, from fresher to architect. Answer each aloud in under a minute, then compare.</p>`,
diagram:{html:flow([["JS + allowJs","tsc --noEmit in CI"],["@ts-check + JSDoc","types without renaming","w"],["rename leaves → roots",".js → .ts, small PRs","w"],["strict + ratchet","suppressions only go down","w"],["typed boundaries","schemas, generated types","g"]]),steps:["Get the toolchain and CI check running before changing any code.","JSDoc + checkJs gives most of the benefit with zero renames.","Convert from the leaves of the import graph upward, so converted files import typed code.","Make strictness a one-way ratchet tracked in CI, and prioritise boundaries where bugs enter."]},
ex:[{t:"JSDoc-typed JavaScript checked by TypeScript, and a migration tsconfig (not runnable here)",code:`// @ts-check
/** @typedef {{ id: string; name: string; email?: string }} User */
/** @typedef {import("./api-types").Order} Order */

/**
 * @param {User[]} users
 * @param {string} id
 * @returns {User | undefined}
 */
export function findUser(users, id) {
  return users.find((u) => u.id === id);
}

/**
 * @template T
 * @param {T[]} xs
 * @returns {T | undefined}
 */
export const first = (xs) => xs[0];

/** @type {Map<string, Order>} */
const cache = new Map();

// findUser([{ id: 1 }], "1");   // error in the editor: number is not assignable to string

// tsconfig.json during migration
// {
//   "compilerOptions": {
//     "allowJs": true, "checkJs": false,     // opt in per file with // @ts-check
//     "noEmit": true,                         // the bundler still builds
//     "strict": true,                         // strict for .ts files from the start
//     "skipLibCheck": true
//   },
//   "include": ["src"]
// }
// Suppress pre-existing errors with a ticket, never silently:
// // @ts-expect-error TODO(PAY-123): legacy shape, remove after API v2`,run:false},
{t:"Planning the migration: leaf-first order from the import graph and a CI ratchet (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);

// JSDoc-typed JS runs unchanged: types live in comments
/** @param {number} a @param {number} b @returns {number} */
const add = (a, b) => a + b;
check("JSDoc types cost nothing at runtime", add(2, 3) === 5);

// 1) Leaf-first order: convert modules whose imports are already converted
const graph = {                                  // module -> modules it imports
  "app.js": ["routes.js", "config.js"],
  "routes.js": ["api.js", "utils.js"],
  "api.js": ["http.js", "types.js"],
  "http.js": ["utils.js"],
  "config.js": ["utils.js"],
  "utils.js": [], "types.js": []
};
function migrationOrder(g) {
  const out = [], state = {};
  const visit = (m, stack = []) => {
    if (state[m] === "done") return;
    if (state[m] === "visiting") throw new Error("cycle: " + [...stack, m].join(" -> "));
    state[m] = "visiting";
    for (const dep of g[m] ?? []) visit(dep, [...stack, m]);
    state[m] = "done"; out.push(m);
  };
  Object.keys(g).sort().forEach((m) => visit(m));
  return out;
}
const order = migrationOrder(graph);
const before = (a, b) => order.indexOf(a) < order.indexOf(b);
check("every module comes after everything it imports: " + order.join(", "),
  Object.entries(graph).every(([m, deps]) => deps.every((d) => before(d, m))));
check("leaves first, entry point last", ["utils.js", "types.js"].includes(order[0]) && order[order.length - 1] === "app.js");
let cycle = "";
try { migrationOrder({ "a.js": ["b.js"], "b.js": ["a.js"] }); } catch (e) { cycle = e.message; }
check("cycles are reported (convert those modules together)", cycle === "cycle: a.js -> b.js -> a.js");

// 2) Ratchet: counts of errors / suppressions / any may only go down
const baseline = { "src/api": { errors: 12, suppressions: 30, any: 41 }, "src/ui": { errors: 0, suppressions: 5, any: 9 } };
function ratchet(base, now) {
  const problems = [];
  for (const [dir, counts] of Object.entries(now))
    for (const [k, v] of Object.entries(counts)) {
      const was = base[dir]?.[k] ?? 0;
      if (v > was) problems.push(dir + " " + k + " " + was + " -> " + v);
    }
  return problems;
}
check("progress passes the ratchet", ratchet(baseline, { "src/api": { errors: 8, suppressions: 30, any: 35 }, "src/ui": { errors: 0, suppressions: 4, any: 9 } }).length === 0);
const regress = ratchet(baseline, { "src/api": { errors: 8, suppressions: 31, any: 35 }, "src/ui": { errors: 0, suppressions: 5, any: 9 }, "src/new": { errors: 0, suppressions: 0, any: 2 } });
check("new suppressions or 'any' fail CI: " + regress.join("; "), regress.length === 2 && regress[0] === "src/api suppressions 30 -> 31" && regress[1] === "src/new any 0 -> 2");

// 3) Progress metric
const files = { ts: 140, jsChecked: 35, js: 25 };
const pct = Math.round((files.ts / (files.ts + files.jsChecked + files.js)) * 100);
check("progress report: " + pct + "% converted, " + files.jsChecked + " more files checked via JSDoc", pct === 70);`}],
browser:`<p>Migration is easiest when the build already uses a bundler that strips types per file (Vite, esbuild, SWC, Next.js): <code>.ts</code> and <code>.js</code> files can live side by side and nothing about the shipped bundle changes. For Node services, either compile to <code>dist</code> with <code>tsc</code>, run through a loader such as tsx, or rely on Node's type stripping (requires erasable syntax and explicit <code>.ts</code> import extensions, which can make a large rename noisier). JSDoc-only typing needs no build step at all, which is why some libraries and browser-only projects stay on it.</p>`,
gotchas:[`Bulk codemods that insert <code>any</code> everywhere produce "TypeScript in name only"; schedule and measure the cleanup or the codebase stays untyped.`,`Turning on <code>strictNullChecks</code> late is the most expensive step; enabling it early (even with suppressions) prevents new debt.`,`<code>@ts-ignore</code> stays forever; <code>@ts-expect-error</code> fails once the error is fixed, so suppressions clean themselves up.`,`Converting from the root (entry points) first means typed files import untyped modules and everything is <code>any</code>; go leaf-first.`,`Hand-written API types drift from the backend; generate them from OpenAPI/GraphQL schemas or share runtime schemas.`,`Dynamic JS patterns (mixins, monkey-patching, objects built incrementally, string-keyed dispatch) need refactoring, not just annotations.`,`Changing file extensions breaks imports in some setups (Node ESM requires explicit extensions; Jest configs, path aliases); budget for tooling fixes.`],
best:[`Run <code>tsc --noEmit</code> in CI from the first day; new files in TS; never let error/suppression/<code>any</code> counts rise.`,`Start with shared types, utilities and the API/data boundary where type errors cause real incidents.`,`Prefer many small rename-and-type PRs over a "big bang" branch that blocks the team.`,`Write a one-page TS style guide and enforce it with typescript-eslint's type-checked rules.`],
iq:[["fresher","Is TypeScript code slower than JavaScript at runtime?","No. Types are erased; the emitted JavaScript is essentially what you would write by hand. The costs are build/check time and, for non-erasable features like enums, a little generated code."],["fresher","What is the difference between interface and type, in one sentence?","Interfaces describe object shapes and can be extended and merged; type aliases can name any type including unions, tuples and computed types but cannot be reopened."],["mid","How does TypeScript know the type inside an if (typeof x === 'string') block?","Control-flow narrowing: the checker follows conditions, returns and assignments and refines the variable's declared union to the members compatible with the check."],["mid","How would you type a function that returns the value of a given key of an object?","function get<T, K extends keyof T>(obj: T, key: K): T[K] — the constraint ensures the key exists and the indexed access type gives the exact property type."],["senior","How would you migrate a 200k-line JavaScript app to TypeScript without stopping feature work?","Add tsconfig with allowJs and a CI tsc --noEmit step; new code in TS; enable checkJs/JSDoc on critical modules; convert leaf modules first in small PRs; turn on strict early with tracked suppressions; type boundaries (API, config, storage) with schemas or generated types; ratchet any/suppression counts down in CI; train the team with a style guide and lint rules."],["senior","Explain what satisfies, as, and a type annotation each do to a config object.","An annotation checks the value and widens the variable to the annotated type (losing literal keys). as asserts the type with little checking. satisfies checks the value against the type but keeps the more precise inferred type for later use."],["lead","When would you choose JSDoc-typed JavaScript over .ts files?","For libraries or tools that want no build step, for gradual adoption in a legacy codebase, or where runtime source must stay plain JS. Trade-offs: more verbose syntax, some advanced features are awkward, and you still need tsc (checkJs, declaration emit) in CI."],["architect","How do you keep types and runtime behaviour in sync across a frontend, a backend and shared packages?","One source of truth for contracts (OpenAPI/JSON Schema, protobuf, or shared runtime schemas), generated or inferred TS types on both sides, runtime validation at every network boundary, versioned contracts with compatibility checks in CI, shared strict tsconfig bases, project references, and type tests for public packages."]].map(function(q){return [q[0],q[1].replace(/</g,"&lt;").replace(/>/g,"&gt;"),q[2].replace(/</g,"&lt;").replace(/>/g,"&gt;")]}),
practice:[`Take a small JS project (or a week's exercises): add <code>// @ts-check</code> and JSDoc to three files, then convert one to <code>.ts</code> with strict on.`,`Write a migration plan for a real or imaginary codebase: order of modules, CI checks, metrics, strictness timeline, and how you will handle third-party types.`,`Interview drill: answer the eight questions above aloud in 8 minutes total; record yourself and fix the two weakest answers.`],
teach:`<p>"Migrate like renovating a lived-in house: tools and CI first, JSDoc where it's cheap, rename from the leaves of the import graph upward, strict mode early with suppressions that can only go down, and type the boundaries first. In interviews, explain each TypeScript concept in one sentence, then give the runtime consequence."</p>`}
],quiz:[
{code:`// TS (esModuleInterop): import cfg from "./config.cjs";  import lib from "./lib.mjs";
//     compile roughly to __importDefault(require(...)).default:
var __importDefault = (mod) => (mod && mod.__esModule ? mod : { default: mod });
const cjs = { port: 8080 };                                  // module.exports = { port: 8080 }
const esm = { __esModule: true, default: { name: "lib" } };  // compiled ESM with export default
console.log(__importDefault(cjs).default.port, __importDefault(esm).default.name, __importDefault(cjs).port);`,ans:`8080 lib undefined`,why:`CommonJS module.exports has no __esModule marker, so the interop helper wraps it as { default: module.exports }: the default import is the whole exports object and there is no top-level port. Compiled ESM already has __esModule, so its real default export is used.`},
{code:`// TS without noUncheckedIndexedAccess: scores["bob"] is typed number, so this compiles:
//     const scores: Record<string, number> = { ana: 10 };  scores["bob"].toFixed(1);
const scores = { ana: 10 };
const xs = [1, 2, 3];
console.log(scores["bob"], xs[5], (scores["bob"] ?? 0) + 1);
try { scores["bob"].toFixed(1); } catch (e) { console.log(e.constructor.name); }`,ans:`undefined undefined 1, TypeError`,why:`Index signatures and array indexing claim every key exists, but missing keys read as undefined at runtime and calling a method on undefined throws a TypeError. noUncheckedIndexedAccess adds | undefined to those reads so the compiler forces the ?? fallback.`}]}
]});
