/* Week 6: Node, tooling and architecture — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js. */
JSC.registerWeek({w:6,revision:[
"<b>Node = V8 + libuv + C++ bindings.</b> It has no DOM; it adds <code>fs</code>, <code>http</code>, <code>process</code>, <code>Buffer</code>, streams, workers. Never block the loop with sync I/O or CPU work in a server.",
"<b>Node loop phases:</b> timers → pending → poll → check (<code>setImmediate</code>) → close. Between callbacks: <code>process.nextTick</code> queue first, then promise microtasks. In an I/O callback, <code>setImmediate</code> always beats <code>setTimeout(0)</code>.",
"<b>Testing:</b> many fast unit tests, fewer integration, few e2e. Test behavior, not implementation; keep tests deterministic (fake time, no real network).",
"<b>Tooling:</b> ESLint 10 flat config finds bugs, Prettier formats, TypeScript types vanish at runtime (validate input at boundaries), lockfiles and <code>npm ci</code> make installs reproducible.",
"<b>Patterns</b> are vocabulary, not goals: Observer, Strategy, Middleware, Factory, Adapter, Facade, DI. Prefer composition and plain functions.",
"<b>State:</b> separate server cache, UI, URL and form state. Reducers are pure; derive instead of duplicating; signals give fine-grained updates.",
"<b>Rendering strategy</b> follows content freshness, SEO and interactivity: SSG for static, SSR for dynamic+SEO, CSR for app-like, ISR/streaming/islands to mix. Hydration cost shows up in INP.",
"<b>Micro-frontends</b> solve team autonomy, not technical elegance: they add shared-dependency, styling and consistency cost.",
"<b>API design:</b> cursor pagination over offset, idempotency keys for unsafe retries, consistent error contract, versioning plan, caching with ETags.",
"<b>Observability:</b> logs + metrics + traces (OpenTelemetry), real-user monitoring, source maps for errors, SLOs and budgets, gradual rollout with feature flags."
],days:[
{n:26,title:"Node.js",goal:"Use Node.js confidently and understand how its event loop differs from the browser's.",topics:[
{id:"d26-node",title:"Node.js essentials",
eli5:`<p>The browser is a <b>shop window</b> where JavaScript can only touch what's in the shop (the page). <b>Node.js</b> is JavaScript in the <b>back office</b>: it can open the filing cabinets (files), answer the phone (network), and run the whole business, but there's no shop window to decorate.</p>`,
why:`<p>In 2009 Node took Chrome's V8 engine out of the browser and added system APIs plus an event-driven I/O library (libuv). It made JavaScript a server language, and today it also powers build tools, CLIs and test runners.</p>`,
tech:`<ul class="pts"><li><b>Architecture:</b> V8 (runs JS) + <b>libuv</b> (event loop, async I/O, thread pool) + C++ bindings + the Node standard library.</li><li><b>Core modules</b> (import with the <code>node:</code> prefix): <code>fs</code>/<code>fs/promises</code>, <code>path</code>, <code>os</code>, <code>http</code>/<code>https</code>, <code>events</code> (<code>EventEmitter</code>), <code>stream</code>, <code>buffer</code> (<code>Buffer</code>, a <code>Uint8Array</code> subclass), <code>crypto</code>, <code>url</code>, <code>util</code>, <code>worker_threads</code>, <code>child_process</code>, <code>cluster</code>, <code>test</code>.</li><li><b>Globals:</b> <code>process</code> (<code>argv</code>, <code>env</code>, <code>exit</code>, <code>stdin/stdout</code>, signals), <code>Buffer</code>, timers, and web-compatible globals like <code>fetch</code>, <code>AbortController</code>, <code>structuredClone</code>, <code>URL</code>, <code>WebSocket</code>.</li><li><b>Versions (Nov 2026):</b> Node 26 is Active LTS (since 28 Oct 2026, V8 14.6, Temporal enabled by default), Node 24 is Maintenance LTS, Node 22 reaches end of life on 30 Apr 2027. From Node 27 there is one major release per year and every release becomes LTS. Check <code>nodejs.org</code> for the current schedule.</li><li><b>Modern built-ins:</b> <code>node --test</code> (test runner), <code>--watch</code>, <code>--env-file=.env</code>, the permission model (<code>--permission</code>), and running TypeScript with erasable syntax by type stripping on recent versions.</li><li><b>Never block the loop:</b> avoid <code>readFileSync</code>/heavy CPU loops in a server; offload with <code>worker_threads</code>, a queue, or a separate service.</li><li><b>Operational basics:</b> read config from env vars, handle <code>SIGTERM</code> for graceful shutdown, log structured JSON, exit with a non-zero code on fatal errors, and let a process manager/orchestrator restart.</li></ul>`,
diagram:{html:flow([["Your JS","V8 executes it"],["Node APIs","fs, http, crypto…","w"],["C++ bindings"],["libuv","event loop + thread pool","g"],["OS","sockets, files, timers"]]),steps:["Your code calls a Node API such as <code>fs.promises.readFile</code>.","Node's C++ binding hands the work to libuv.","libuv performs it with OS async facilities (network) or its thread pool (file system, some crypto/dns).","When done, a callback/promise resolution is queued back to the event loop and runs on the main JS thread."]},
ex:[{t:"A tiny EventEmitter (the pattern behind streams, servers and most Node APIs) (runnable)",code:`class Emitter {
  #h = new Map();
  on(t, f){ (this.#h.get(t) ?? this.#h.set(t, []).get(t)).push(f); return this; }
  once(t, f){ const w = (...a) => { this.off(t, w); f(...a); }; return this.on(t, w); }
  off(t, f){ this.#h.set(t, (this.#h.get(t) ?? []).filter((x) => x !== f)); return this; }
  emit(t, ...a){
    const list = this.#h.get(t) ?? [];
    if (t === "error" && !list.length) throw a[0];          // Node: unhandled 'error' event throws
    [...list].forEach((f) => f(...a));                       // copy: handlers may unsubscribe while emitting
    return list.length > 0;
  }
}
const e = new Emitter();
e.on("data", (x) => console.log("data", x));
e.once("data", (x) => console.log("once", x));
console.log(e.emit("data", 1), e.emit("data", 2), e.emit("nobody"));
try { e.emit("error", new Error("unhandled error event")); } catch (err) { console.log("threw:", err.message); }`},
{t:"A small server with graceful shutdown (Node, reference)",code:`// server.mjs  (run: node --env-file=.env server.mjs)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/health") { res.writeHead(200).end("ok"); return; }
    const data = await readFile(new URL("./data.json", import.meta.url), "utf8");   // async, never readFileSync here
    res.writeHead(200, { "content-type": "application/json" }).end(data);
  } catch (err) {
    console.error(JSON.stringify({ level: "error", msg: err.message }));
    res.writeHead(500).end("internal error");
  }
});
server.listen(process.env.PORT ?? 3000);
process.on("SIGTERM", () => server.close(() => process.exit(0)));   // finish in-flight requests`,run:false}],
browser:`<p>Shared code between Node and the browser: language features, <code>fetch</code>, <code>URL</code>, <code>AbortController</code>, <code>structuredClone</code>, Web Streams, <code>crypto.subtle</code>, <code>TextEncoder</code>. Different: no DOM/<code>window</code> in Node (use <code>globalThis</code>); no <code>fs</code>/<code>process</code> in browsers. Isomorphic code must avoid environment-specific globals or feature-detect them.</p>`,
gotchas:[`<code>fs.readFileSync</code>, <code>JSON.parse</code> of huge input and CPU loops block <i>every</i> request.`,`An uncaught exception or unhandled rejection crashes the process by default (Node ≥ 15); handle and log, then restart cleanly.`,`<code>process.exit()</code> can cut off pending writes; prefer setting <code>process.exitCode</code> and letting the loop drain.`,`<code>process.env</code> values are always strings (<code>"false"</code> is truthy).`,`<code>Buffer</code> and <code>Uint8Array</code> byte counts differ from string lengths for non-ASCII text.`,`Streams must handle <code>error</code> events and backpressure; use <code>stream/promises.pipeline</code>.`,`CPU-bound work and single-process limits need workers, clusters or horizontal scaling.`],
best:[`Use <code>node:</code> imports, async APIs, structured logging and env-based config; validate input at the boundary.`,`Handle SIGTERM/SIGINT for graceful shutdown; set memory limits and monitor event-loop lag.`,`Use the LTS line in production and pin the version (<code>.nvmrc</code>/<code>engines</code>).`],
iq:[["fresher","What is Node.js?","A JavaScript runtime built on V8 with libuv for async I/O, letting JavaScript run outside the browser (servers, tools, CLIs)."],["mid","Why is Node good for I/O-heavy workloads but not CPU-heavy ones?","Async I/O doesn't block the single JS thread, so many connections can be handled concurrently; CPU-bound JavaScript blocks the loop, so it should go to worker threads or other services."],["senior","What is EventEmitter and how is it used?","The base class for event-driven APIs: on/once/off/emit. Streams, servers and sockets inherit from it; the special 'error' event throws if unhandled."],["architect","How would you scale a Node service?","Stateless processes behind a load balancer, horizontal scaling (containers), clustering/worker threads for CPU use, caching and queues for heavy work, observability for event-loop lag, graceful shutdown and health checks."]],
practice:[`Write a CLI that reads a file with <code>fs/promises</code>, counts words, and exits with a proper code.`,`Add a graceful-shutdown handler to a small HTTP server and test with <code>kill -TERM</code>.`],
teach:`<p>"Node is JavaScript in the back office: it can use files and the network but there's no web page. One thread runs your code and hands slow jobs to helpers, so never make that one thread do slow work itself."</p>`},

{id:"d26-nodeloop",title:"The Node event loop",
eli5:`<p>The browser's chef has tickets and sticky notes. Node's chef works in a <b>circular kitchen with stations</b>: the timer station, the incoming-orders station, the "do it right after" station, and the cleanup station. After finishing <b>any single dish</b>, the chef first reads the super-urgent <b>"nextTick" notes</b>, then the normal sticky notes (promises), then moves on.</p>`,
why:`<p>Node uses libuv's event loop, which has explicit <b>phases</b>. Knowing them explains the order of <code>setTimeout</code>, <code>setImmediate</code>, <code>process.nextTick</code> and promises, a classic Node interview topic.</p>`,
tech:`<p>One loop iteration passes through these phases (each has a FIFO queue of callbacks):</p><ol><li><b>timers</b>: expired <code>setTimeout</code>/<code>setInterval</code> callbacks.</li><li><b>pending callbacks</b>: some deferred system callbacks.</li><li><b>idle, prepare</b>: internal.</li><li><b>poll</b>: retrieve new I/O events and run their callbacks; may wait here when nothing else is scheduled.</li><li><b>check</b>: <code>setImmediate</code> callbacks.</li><li><b>close callbacks</b>: e.g. <code>socket.on("close")</code>.</li></ol>
<ul class="pts"><li><b>Between every callback</b> (and after the main script), Node drains the <code>process.nextTick</code> queue <b>first</b>, then the <b>promise microtask</b> queue, repeating until both are empty. So <code>nextTick</code> beats promises.</li><li><code>setTimeout(fn, 0)</code> vs <code>setImmediate(fn)</code> from the main module: order is <b>non-deterministic</b> (depends on process timing). Inside an I/O callback, <code>setImmediate</code> <b>always</b> runs first.</li><li><b>Thread pool</b> (default 4 threads, <code>UV_THREADPOOL_SIZE</code>): <code>fs</code>, <code>dns.lookup</code>, <code>crypto.pbkdf2/scrypt/randomBytes</code>, <code>zlib</code>. Network sockets use OS async mechanisms (epoll/kqueue/IOCP) and don't use the pool.</li><li>Recursive <code>process.nextTick</code> calls starve the loop (I/O never runs); recursive <code>setImmediate</code> doesn't.</li></ul>`,
diagram:{html:flow([["timers","setTimeout / setInterval"],["pending callbacks"],["poll","I/O callbacks; waits for events","w"],["check","setImmediate","g"],["close callbacks"]])+`<p style="text-align:center;margin:10px 0 0">after the main script and after <b>each</b> callback: <b>nextTick queue → promise microtasks</b> (repeat until empty)</p>`,steps:["The loop visits phases in a fixed order, running every callback queued for that phase.","After each callback, Node runs all <code>process.nextTick</code> callbacks and then all promise jobs.","In the poll phase, if immediates are scheduled it proceeds to check instead of waiting, which is why immediate beats timeout inside I/O callbacks.","Then the loop starts again with timers."]},
ex:[{t:"A simplified model of Node's ordering (runnable simulation, not real Node)",code:`function simulate(script){
  const q = { tick: [], micro: [], timers: [], immediates: [] }, log = [];
  const n = { log: (m) => log.push(m), nextTick: (f) => q.tick.push(f), promise: (f) => q.micro.push(f), timeout: (f) => q.timers.push(f), immediate: (f) => q.immediates.push(f) };
  const drain = () => { do { while (q.tick.length) q.tick.shift()(); while (q.micro.length) q.micro.shift()(); } while (q.tick.length || q.micro.length); };
  script(n); drain();                                         // main script, then nextTick, then promises
  for (let i = 0; i < 5 && (q.timers.length || q.immediates.length); i++) {
    q.timers.splice(0).forEach((f) => { f(); drain(); });      // timers phase
    q.immediates.splice(0).forEach((f) => { f(); drain(); });  // check phase
  }
  return log;
}
console.log(simulate((n) => {
  n.timeout(() => n.log("timeout"));
  n.immediate(() => n.log("immediate"));
  n.nextTick(() => n.log("nextTick"));
  n.promise(() => { n.log("promise"); n.nextTick(() => n.log("nextTick queued from a promise")); });
  n.log("sync");
}));`,note:"In real Node, <code>timeout</code> vs <code>immediate</code> from the main module can print in either order; the simulation always visits timers first."},
{t:"Real Node code to run and predict (reference)",code:`// order.js  (node order.js)
const fs = require("node:fs");
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));
console.log("sync");
// sync, nextTick, promise, then timeout/immediate in either order

fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout (in I/O)"), 0);
  setImmediate(() => console.log("immediate (in I/O)"));     // always first inside an I/O callback
});`,run:false}],
gotchas:[`Many tutorials say "nextTick is a microtask": it isn't; it has its own queue that runs before promise microtasks.`,`<code>setImmediate</code> is poorly named: it runs <i>after</i> the poll phase, and <code>nextTick</code> runs "immediately" after the current operation.`,`Timers are not exact; the poll phase can delay them.`,`Long synchronous callbacks delay every phase ("event loop lag"); monitor with <code>perf_hooks.monitorEventLoopDelay</code>.`,`Thread pool saturation (4 slow fs/crypto calls) can delay unrelated file operations.`],
best:[`Use promises/async-await for flow; reserve <code>nextTick</code> for rare "after this operation" needs; use <code>setImmediate</code> to yield to I/O in long loops.`,`Measure event-loop delay in production and alert on spikes.`],
iq:[["mid","nextTick vs setImmediate vs setTimeout(0)?","nextTick runs right after the current operation before the loop continues (and before promises); setImmediate runs in the check phase of the current iteration; setTimeout(0) runs in the timers phase of a later (or same) iteration."],["senior","Print order for sync, nextTick, promise, timeout, immediate?","sync, nextTick, promise, then timeout and immediate (order of those two is not guaranteed from the main module, but immediate is always first inside an I/O callback)."],["senior","What uses the libuv thread pool?","fs, dns.lookup, some crypto (pbkdf2, scrypt, randomBytes) and zlib. Sockets use OS-level async I/O instead."],["architect","How do you detect an overloaded Node process?","Measure event-loop delay/utilization, p99 latency, heap and GC metrics, and thread pool queue time; scale out or offload CPU work."]],
practice:[`Run the reference snippet in Node and explain each line of output.`,`Block the loop with a 2-second sync loop and measure the delay with <code>monitorEventLoopDelay</code>.`],
teach:`<p>"Node's loop has stations in a fixed order: timers, I/O, immediates, cleanup. After every single callback, Node reads the nextTick notes first, then promise notes. nextTick always beats promises."</p>`}
],quiz:[
{code:`const target = new EventTarget();
let n = 0;
target.addEventListener("x", () => n++, { once: true });
target.dispatchEvent(new Event("x"));
target.dispatchEvent(new Event("x"));
console.log(n);`,ans:`1`,why:`The once option removes the listener after its first call, the same idea as EventEmitter.once in Node.`},
{code:`console.log(new TextEncoder().encode("héllo").length, "héllo".length);`,ans:`6 5`,why:`UTF-8 uses two bytes for é, so the byte length (what Buffer and the network deal with) differs from the string length.`}]},

{n:27,title:"Testing and tooling",goal:"Build confidence in your code with tests, and set up the toolchain that keeps a codebase healthy.",topics:[
{id:"d27-testing",title:"Testing JavaScript",
eli5:`<p>Tests are a <b>checklist a robot follows every time you change something</b>: "does the toy still light up, does the button still click?" Without it you'd have to check everything by hand and you'd miss things. Good tests check what the toy <i>does</i>, not how it's glued inside.</p>`,
why:`<p>Software changes constantly. Automated tests make change safe, document behavior, and catch regressions before users do. In dynamic JavaScript, where nothing is checked until the code runs, they matter even more.</p>`,
tech:`<ul class="pts"><li><b>Test pyramid:</b> many fast <b>unit</b> tests, fewer <b>integration</b> tests (modules/API/DB together), few <b>end-to-end</b> tests (real browser, e.g. Playwright). Component tests sit between unit and integration.</li><li><b>Tools (late 2026):</b> <b>Vitest 5</b> (Vite-powered, Jest-compatible API, stable Browser Mode), Node's built-in <b>node:test</b> (<code>node --test</code>), Jest, Playwright for e2e/component testing, Testing Library for DOM behavior, MSW for network mocking, fast-check for property-based tests.</li><li><b>Structure:</b> Arrange–Act–Assert; one behavior per test; descriptive names.</li><li><b>Test doubles:</b> <b>stub</b> (canned answers), <b>spy</b> (records calls), <b>mock</b> (expects calls), <b>fake</b> (simplified working implementation). Mock at boundaries (network, time, randomness), not your own internals.</li><li><b>Determinism:</b> fake timers for time, inject clocks/IDs, avoid shared state between tests, never hit real networks. Flaky tests are bugs; fix or delete.</li><li><b>Async tests:</b> return or <code>await</code> the promise; otherwise the test passes before assertions run.</li><li><b>Coverage</b> shows what code ran, not what was verified. Use it to find gaps, not as a target. Be cautious with snapshot tests: they are easy to approve blindly.</li><li><b>TDD</b>: write a failing test, make it pass, refactor.</li></ul>`,
diagram:{html:`<div style="display:flex;flex-direction:column;align-items:center;gap:6px;font-weight:600"><div class="fb r" style="width:30%">E2E (few, slow, realistic)</div><div class="fb w" style="width:55%">Integration (some)</div><div class="fb g" style="width:85%">Unit (many, fast, isolated)</div></div>`,steps:["The base is wide: lots of cheap, fast tests give quick feedback.","Higher layers are more realistic but slower and flakier, so keep them few and focused on critical user journeys.","Most bugs should be caught as low in the pyramid as possible."]},
ex:[{t:"A mini test framework: how Vitest/Jest work inside (runnable)",code:`function createRunner(){
  const tests = [];
  return {
    it: (name, fn) => tests.push({ name, fn }),
    async run(){
      const out = [];
      for (const t of tests) {
        try { await t.fn(); out.push("pass  " + t.name); }
        catch (e) { out.push("FAIL  " + t.name + " (" + e.message + ")"); }
      }
      return out;
    }
  };
}
const expect = (a) => ({
  toBe: (b) => { if (!Object.is(a, b)) throw new Error("expected " + b + " but got " + a); },
  toEqual: (b) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error("objects differ"); },
  toThrow: () => { try { a(); } catch { return; } throw new Error("did not throw"); }
});
const spy = (impl = () => {}) => { const s = (...args) => { s.calls.push(args); return impl(...args); }; s.calls = []; return s; };
const { it, run } = createRunner();
const add = (a, b) => a + b;
it("adds numbers", () => expect(add(2, 3)).toBe(5));
it("floats need care", () => expect(add(0.1, 0.2)).toBe(0.3));
it("throws on bad input", () => expect(() => JSON.parse("{")).toThrow());
it("calls the callback once", () => { const cb = spy(); [1].forEach(cb); expect(cb.calls.length).toBe(1); });
it("awaits async work", async () => { const v = await Promise.resolve(42); expect(v).toBe(42); });
run().then((r) => r.forEach((l) => console.log(l)));`,note:"One test fails on purpose, so you can see what a failing report looks like. Fix it by comparing with a tolerance."},
{t:"The same with node:test and Vitest (reference)",code:`// math.test.js  (run: node --test)
import { test } from "node:test";
import assert from "node:assert/strict";
import { add } from "./math.js";
test("adds numbers", () => { assert.equal(add(2, 3), 5); });

// search.test.js  (run: npx vitest)
import { describe, it, expect, vi } from "vitest";
describe("debounce", () => {
  it("runs once after the delay", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d(); d(); d();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});`,run:false}],
gotchas:[`A test that doesn't <code>await</code> its promise (or forget <code>return</code>) passes without checking anything.`,`Testing implementation details (private functions, exact calls) makes refactors break tests without catching bugs.`,`Over-mocking leaves tests green while real integrations fail.`,`Shared mutable state between tests causes order-dependent failures.`,`Real time, random and network make tests flaky: inject or fake them.`,`<code>toBe</code> on objects compares identity; use <code>toEqual</code>/<code>deepStrictEqual</code>.`],
best:[`Follow the pyramid; test behavior through public interfaces; keep tests fast and independent; run them in CI on every PR.`,`Write a failing test first when fixing a bug so it never returns.`,`Prefer realistic user-level tests (Testing Library/Playwright) for UI.`],
iq:[["fresher","Why write tests?","To catch regressions, document behavior and make changes safe."],["mid","Mock vs stub vs spy?","Stub returns canned data; spy records calls while delegating; mock sets expectations on calls (often verified at the end). Fakes are working simplified implementations."],["senior","How do you test code that uses timers or fetch?","Use fake timers (vi.useFakeTimers/node:test mock timers), inject dependencies, and mock the network at the boundary (MSW or a fake fetch) rather than internal functions."],["architect","How do you keep a large test suite healthy?","Pyramid balance, deterministic tests, parallel runs and sharding, flaky-test quarantine with owners, coverage used diagnostically, contract tests between services, and fast CI feedback."]],
practice:[`Add tests for <code>debounce</code> with fake timers and for a function that calls <code>fetch</code> using an injected fake.`,`Extend the mini framework with <code>beforeEach</code> and <code>describe</code>.`],
teach:`<p>"Tests are a robot checklist that re-checks everything on every change. Test what the code does, not how it's built; fake the clock and the network; and keep most tests small and fast."</p>`},

{id:"d27-tooling",title:"Linting, formatting and TypeScript in context",
eli5:`<p>Writing code is like writing an essay with a team. A <b>formatter</b> is a robot that makes everyone use the same spacing and style so you don't argue about it. A <b>linter</b> is a proofreader that spots likely mistakes. <b>TypeScript</b> is a labeling machine that checks "this box is for numbers" before the code ever runs, but the labels are peeled off when it ships. <b>Lockfiles</b> are a shopping list with exact brands so everyone buys the same things.</p>`,
why:`<p>Because JavaScript is dynamic, many bugs only appear at runtime. Tooling catches them earlier, keeps style consistent, and makes dependencies reproducible across machines and CI.</p>`,
tech:`<ul class="pts"><li><b>ESLint 10</b> (Feb 2026): <b>flat config only</b>: <code>eslint.config.js</code>, searched from each linted file's directory; <code>.eslintrc.*</code> and <code>.eslintignore</code> are no longer supported; requires Node ≥ 20.19. Catches bugs (unused vars, unreachable code, floating promises with typed rules).</li><li><b>Prettier</b> (or Biome/dprint) formats code; keep style decisions out of review. ESLint = correctness, Prettier = formatting. <b>Oxlint/Biome</b> are fast Rust alternatives.</li><li><b>Package managers:</b> npm, pnpm (fast, strict, workspaces), Yarn, Bun. A <b>lockfile</b> pins exact versions; use <code>npm ci</code> in CI for reproducible installs. <b>Semver:</b> <code>^1.2.3</code> allows minor/patch updates, <code>~1.2.3</code> only patches. Run <code>npm audit</code>, use provenance, and keep dependencies minimal (supply-chain risk).</li><li><b>Git hooks:</b> lint-staged + husky (or simple-git-hooks) run checks before commit; CI is the real gate.</li><li><b>TypeScript</b> adds static types that are <b>erased at runtime</b>. Check with <code>tsc --noEmit</code>; adopt gradually (<code>allowJs</code>, JSDoc types). Because types vanish, validate untrusted data (API responses, user input) at runtime with a schema library (zod, valibot). Recent Node versions can run erasable TypeScript directly via type stripping, and bundlers/Vite transpile it without type-checking.</li><li><b>Also:</b> <code>.editorconfig</code>, <code>engines</code> field and <code>.nvmrc</code> to pin Node, <code>package.json</code> scripts as the standard entry points, source maps for debugging.</li></ul>`,
diagram:{html:flow([["write code"],["editor: Prettier + ESLint","instant feedback","g"],["pre-commit: lint-staged","fast checks on changed files","w"],["CI: lint, types, tests, build","the real gate","r"],["deploy"]]),steps:["Fast checks run in the editor as you type.","Pre-commit hooks stop obvious problems early but can be bypassed.","CI runs everything on a clean machine with <code>npm ci</code>, so it can't be skipped.","Only code that passes the same checks for everyone is deployed."]},
ex:[{t:"A mini semver range matcher (runnable)",code:`const parse = (v) => v.split(".").map(Number);
function satisfies(version, range){
  const op = /^[\\^~]/.test(range) ? range[0] : "";
  const [M, m, p] = parse(op ? range.slice(1) : range);
  const [a, b, c] = parse(version);
  const atLeast = a > M || (a === M && (b > m || (b === m && c >= p)));
  if (op === "^") return atLeast && a === M;                // (real semver treats 0.x specially)
  if (op === "~") return atLeast && a === M && b === m;
  return version === range;
}
console.log(satisfies("1.9.0", "^1.2.3"), satisfies("2.0.0", "^1.2.3"), satisfies("1.2.9", "~1.2.3"), satisfies("1.3.0", "~1.2.3"));`},
{t:"ESLint 10 flat config and package scripts (reference)",code:`// eslint.config.js  (flat config only in ESLint 10)
import js from "@eslint/js";
import globals from "globals";
export default [
  { ignores: ["dist/**", "coverage/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: { ...globals.browser } },
    rules: { "no-unused-vars": "error", eqeqeq: ["error", "always", { null: "ignore" }], "no-var": "error", "prefer-const": "error" }
  }
];

// package.json (excerpt)
{
  "scripts": { "lint": "eslint .", "format": "prettier --write .", "typecheck": "tsc --noEmit", "test": "vitest run", "ci": "npm run lint && npm run typecheck && npm test" },
  "engines": { "node": ">=24" }
}`,run:false}],
gotchas:[`Types protect you only inside your code; data from the network can still violate them. Validate at boundaries.`,`<code>any</code> silently disables type checking; enable <code>strict</code> and avoid <code>any</code>.`,`<code>npm install</code> may change the lockfile; CI should use <code>npm ci</code>.`,`Auto-fixing lint rules that conflict with the formatter causes churn; use <code>eslint-config-prettier</code> or let the formatter own style.`,`A caret range pulls minor updates automatically, so a lockfile and a test suite are your safety net.`,`Postinstall scripts and typosquatted packages are real supply-chain risks.`],
best:[`Automate formatting and linting in the editor and CI; pin Node and dependency versions; commit the lockfile.`,`Adopt TypeScript or JSDoc types for shared code; validate runtime data with schemas.`,`Keep the dependency tree small and audited; prefer well-maintained packages.`],
iq:[["fresher","Linter vs formatter?","A linter finds likely bugs and rule violations (ESLint); a formatter rewrites code layout consistently (Prettier)."],["mid","What does the lockfile do?","Pins exact resolved versions of all dependencies so installs are reproducible; commit it and use npm ci in CI."],["senior","TypeScript types disappear at runtime: so what?","They only help at compile time; external data must be validated at runtime (zod/valibot), and build tools only strip types unless you run tsc --noEmit."],["architect","How do you standardize tooling across many repos?","Shared config packages (ESLint/Prettier/tsconfig), a monorepo or templates, Renovate/Dependabot, central CI templates, pinned Node, and docs plus automated enforcement."]],
practice:[`Migrate a small project's ESLint config to flat config.`,`Add <code>tsc --noEmit</code> with <code>checkJs</code> to a JS project and fix the first 10 errors.`],
teach:`<p>"Formatters make code look the same, linters spot likely mistakes, types label data before it runs (but labels disappear when it ships), and lockfiles make everyone install the same versions."</p>`}
],quiz:[
{code:`const results = [];
const it = (name, fn) => { try { fn(); results.push(name + ": pass"); } catch { results.push(name + ": fail"); } };
it("adds", () => { if (1 + 1 !== 2) throw 0; });
it("floats", () => { if (0.1 + 0.2 !== 0.3) throw 0; });
console.log(results);`,ans:`["adds: pass", "floats: fail"]`,why:`The floating-point assertion fails: 0.1 + 0.2 is 0.30000000000000004. A test framework is just try/catch around each test function.`},
{code:`const parse = (v) => v.split(".").map(Number);
const ok = (v, r) => { const [M, m, p] = parse(r.slice(1)), [a, b, c] = parse(v); const ge = a > M || (a === M && (b > m || (b === m && c >= p))); return r[0] === "^" ? ge && a === M : ge && a === M && b === m; };
console.log(ok("1.9.0", "^1.2.3"), ok("2.0.0", "^1.2.3"), ok("1.2.9", "~1.2.3"), ok("1.3.0", "~1.2.3"));`,ans:`true false true false`,why:`Caret allows any compatible minor/patch update within the same major; tilde allows only patch updates within the same minor.`}]},

{n:28,title:"Patterns and state",goal:"Use common design patterns idiomatically in JavaScript and structure application state sensibly.",topics:[
{id:"d28-patterns",title:"Design patterns in JavaScript",
eli5:`<p>Patterns are <b>named recipes</b> for problems cooks keep running into. "Observer" is the doorbell: lots of people can subscribe to hear it. "Strategy" is choosing a different cooking method for the same dish. "Middleware" is an assembly line where each worker does a step and passes it on. Knowing the names lets teammates say "use the doorbell recipe" instead of explaining for ten minutes.</p>`,
why:`<p>Patterns are shared vocabulary for common solutions. In JavaScript, with first-class functions and closures, many classic patterns become small functions rather than class hierarchies.</p>`,
tech:`<table><tr><th>Pattern</th><th>Idea</th><th>JavaScript example</th></tr><tr><td>Module</td><td>encapsulate private state, expose an API</td><td>ES modules, closures</td></tr><tr><td>Factory</td><td>functions that create configured objects</td><td><code>createStore()</code>, <code>new Foo()</code> wrappers</td></tr><tr><td>Singleton</td><td>one shared instance</td><td>a module's exports (module cache)</td></tr><tr><td>Observer / Pub-Sub</td><td>subscribers react to events</td><td><code>EventTarget</code>, EventEmitter, stores</td></tr><tr><td>Strategy</td><td>swap algorithms behind one interface</td><td>pass a function (<code>sort(compareFn)</code>)</td></tr><tr><td>Decorator</td><td>wrap to add behavior</td><td>higher-order functions (memoize, retry, logging)</td></tr><tr><td>Middleware / Chain</td><td>pipeline with <code>next()</code></td><td>Express, Koa, Redux middleware</td></tr><tr><td>Adapter</td><td>translate one interface to another</td><td>wrap an API client to your app's types</td></tr><tr><td>Facade</td><td>simple front for a complex subsystem</td><td>an <code>api.js</code> hiding fetch details</td></tr><tr><td>Command</td><td>an action as data (undo/redo, queues)</td><td>Redux actions</td></tr><tr><td>Dependency Injection</td><td>pass dependencies in instead of importing</td><td>function params, constructor args (easy testing)</td></tr><tr><td>Proxy / Iterator</td><td>covered Days 9–10</td><td><code>Proxy</code>, generators</td></tr></table>
<ul class="pts"><li><b>Prefer composition over inheritance</b>: build behavior by combining small functions/objects.</li><li><b>Anti-patterns:</b> god objects/modules, global mutable singletons that make tests order-dependent, deep inheritance trees, premature abstraction ("rule of three": abstract after the third repetition).</li><li>Patterns are tools, not goals: choose them when the problem appears.</li></ul>`,
diagram:{html:flow([["request"],["logger middleware","before / after","w"],["auth middleware","before / after","w"],["handler","g"],["auth after"],["logger after"]]),steps:["Middleware wraps the handler like onion layers.","Each layer runs its 'before' code, calls <code>next()</code>, and then runs its 'after' code once the inner layers finish.","The same shape is used by Express, Koa and Redux middleware."]},
ex:[{t:"Observer, middleware and strategy in plain functions (runnable)",code:`const createEmitter = () => {
  const m = new Map();
  return {
    on(t, f){ (m.get(t) || m.set(t, new Set()).get(t)).add(f); return () => m.get(t).delete(f); },
    emit(t, ...a){ [...(m.get(t) || [])].forEach((f) => f(...a)); }
  };
};
const bus = createEmitter();
const off = bus.on("saved", (id) => console.log("listener got", id));
bus.emit("saved", 1); off(); bus.emit("saved", 2);
const compose = (...mw) => (ctx) => { let i = -1; const next = async () => { i++; if (i < mw.length) await mw[i](ctx, next); }; return next(); };
const log = [];
compose(
  async (c, next) => { log.push("logger before"); await next(); log.push("logger after"); },
  async (c, next) => { log.push("auth before"); await next(); log.push("auth after"); },
  async (c) => { log.push("handler " + c.path); }
)({ path: "/home" }).then(() => console.log(log));
const strategies = { flat: (p) => p - 5, percent: (p) => p * 0.9 };
console.log(strategies.flat(100), strategies.percent(100));`}],
gotchas:[`Subscribing without unsubscribing leaks listeners (Day 22); iterating and mutating the subscriber list at once skips handlers: copy before emitting.`,`A Singleton via module state is shared across tests; provide a reset or inject it.`,`Over-abstraction (factories of factories) hurts readability more than duplication.`,`Class hierarchies deeper than two levels usually signal a missing composition.`,`Middleware that forgets to call <code>next()</code> silently stops the chain.`],
best:[`Prefer small functions and composition; reach for classes when you need identity and encapsulated state.`,`Inject dependencies (clock, fetch, logger) so code is testable; keep modules cohesive.`,`Name patterns in code review to communicate intent, but only add them for real problems.`],
iq:[["mid","Explain the Observer pattern.","A subject keeps a list of subscribers and notifies them on changes. In JS: EventTarget/EventEmitter or a store with subscribe(). Always provide unsubscribe."],["senior","How is the Singleton pattern implemented in JS?","Usually a module that exports an instance (ES modules are evaluated once and cached). Risks: hidden global state and test coupling; prefer dependency injection."],["senior","What is middleware?","A chain of functions each receiving (ctx, next) that can act before and after the rest of the chain, used for logging, auth, error handling."],["architect","Composition vs inheritance?","Composition combines small independent behaviors and avoids tight coupling and fragile base classes; use inheritance only for true is-a relationships with a stable base."]],
practice:[`Implement <code>pipe</code>/<code>compose</code> and a retry decorator.`,`Build a tiny Express-like router with middleware.`],
teach:`<p>"Patterns are named recipes: Observer is a doorbell many can listen to, Strategy swaps a method, Middleware is an assembly line. In JavaScript most of them are just functions."</p>`},

{id:"d28-state",title:"State management concepts",
eli5:`<p>State is <b>what the app remembers right now</b>: what's typed in the box, which tab is open, what the server last said. Trouble starts when the <b>same fact is written on many sticky notes</b> around the house and they disagree. The fix: keep one official copy, change it in one clear way, and let everything else <b>read</b> or <b>calculate</b> from it.</p>`,
why:`<p>As UIs grow, scattered mutable state causes inconsistent screens and hard-to-trace bugs. State management is about deciding <i>where</i> each piece of state lives and <i>how</i> it changes.</p>`,
tech:`<ul class="pts"><li><b>Kinds of state:</b> <b>UI</b> (open modal, hover), <b>form</b> (draft values, validation), <b>URL</b> (route, filters; share-able), <b>server cache</b> (data fetched from APIs: owned by the server), <b>global client</b> (auth user, theme). Keep each in the simplest place that works: local first, lift up when shared.</li><li><b>Single source of truth + derived state:</b> store the minimum, compute the rest (selectors, memoized). Duplicated state drifts.</li><li><b>Unidirectional flow (Redux/Flux):</b> view dispatches an <b>action</b> → pure <b>reducer</b> <code>(state, action) =&gt; newState</code> → store notifies subscribers → view re-renders. Pure reducers + immutable updates make changes predictable, testable and time-travel debuggable.</li><li><b>Server state</b> needs caching, deduplication, staleness and background refetch: use a dedicated library (TanStack Query, SWR) instead of copying API data into a global store.</li><li><b>Fine-grained reactivity (signals):</b> reading a value inside an effect registers a dependency; writes re-run only dependents (the idea behind Vue, Solid, Preact signals, Angular signals; Proxies or getters implement tracking). There is also a TC39 signals proposal.</li><li><b>State machines</b> (XState) model complex flows explicitly (idle → loading → success/error) and make impossible states impossible.</li><li><b>Patterns:</b> normalization (store entities by id), optimistic updates with rollback, event sourcing, command/undo stacks.</li></ul>`,
diagram:{html:flow([["View","user clicks"],["dispatch(action)","{ type: 'inc' }","w"],["reducer(state, action)","pure function","g"],["new state","immutable","g"],["subscribers notified","view re-renders"]]),steps:["The only way to change state is to dispatch an action describing what happened.","A pure reducer computes the next state from the previous state and the action, without mutating anything.","If the state reference changed, subscribers run and the UI updates.","Because every change is an explicit action, you can log, replay and test them."]},
ex:[{t:"A Redux-style store with a memoized selector (runnable)",code:`function createStore(reducer, init){
  let state = init; const subs = new Set();
  return {
    getState: () => state,
    dispatch(a){ const next = reducer(state, a); if (next !== state) { state = next; subs.forEach((f) => f(state)); } return a; },
    subscribe(f){ subs.add(f); return () => subs.delete(f); }
  };
}
const reducer = (s, a) => a.type === "add" ? { ...s, items: [...s.items, a.item] } : a.type === "clear" ? { ...s, items: [] } : s;
let computed = 0;
const selectTotal = (() => { let lastIn, lastOut; return (s) => { if (s.items !== lastIn) { lastIn = s.items; computed++; lastOut = s.items.reduce((t, i) => t + i.price, 0); } return lastOut; }; })();
const store = createStore(reducer, { items: [], user: "ana" });
store.subscribe((s) => console.log("changed ->", s.items.length, "items"));
store.dispatch({ type: "add", item: { price: 5 } });
store.dispatch({ type: "add", item: { price: 7 } });
store.dispatch({ type: "unknown" });                  // same state: no notification
console.log("total", selectTotal(store.getState()), selectTotal(store.getState()), "| computed", computed, "time(s)");`},
{t:"A tiny signal and effect (runnable)",code:`let active = null;
const signal = (v) => {
  const subs = new Set();
  return {
    get(){ if (active) subs.add(active); return v; },
    set(n){ if (!Object.is(n, v)) { v = n; [...subs].forEach((f) => f()); } }
  };
};
const effect = (fn) => { const run = () => { active = run; try { fn(); } finally { active = null; } }; run(); };
const count = signal(0), label = signal("clicks");
effect(() => console.log(label.get() + ":", count.get()));
count.set(1); count.set(1); count.set(2); label.set("taps");`}],
gotchas:[`Mutating state in place (<code>state.items.push</code>) breaks change detection and memoization; always create new objects/arrays.`,`Copying server data into global client state causes stale duplicates; keep server cache separate.`,`Putting everything in a global store makes components hard to reuse; keep state local until it must be shared.`,`Derived values stored as state get out of sync; compute them.`,`Subscriber lists mutated during notification skip or double-run handlers; iterate over a copy.`,`Over-eager re-rendering: selecting too much state re-renders everything; select the minimum.`],
best:[`Local state first; lift or globalize only when needed; use URL state for shareable views; use a server-state library for API data.`,`Keep reducers pure, state serializable and minimal, and derive everything else.`,`Model complex flows as state machines to eliminate impossible states.`],
iq:[["mid","What is a reducer and why must it be pure?","A function (state, action) => newState. Purity makes updates predictable, testable and enables replay and memoization by reference equality."],["senior","Why not store API responses in Redux?","They are server-owned and need caching, staleness, refetch and deduplication. Libraries like TanStack Query handle these; copying creates drift."],["architect","How do you choose a state management approach for a large app?","Classify state (UI, form, URL, server, global), use the simplest tool per class (local state, URL, server-state library, a small global store), enforce unidirectional data flow and clear ownership, and measure rendering cost."]],
practice:[`Add middleware (logging, async actions) to the store above.`,`Build a derived <code>computed()</code> on top of signals.`],
teach:`<p>"Keep one official copy of each fact, change it only through clear actions with pure functions, and calculate everything else from it. Server data is a cache, not your own state."</p>`}
],quiz:[
{code:`const subs = [];
const on = (f) => (subs.push(f), () => subs.splice(subs.indexOf(f), 1));
let off;
off = on(() => { console.log("a"); off(); });
on(() => console.log("b"));
subs.forEach((f) => f());`,ans:`a (and b is skipped!)`,why:`The first handler removes itself while forEach is iterating, shifting the array, so the second handler is skipped. Iterate over a copy: [...subs].forEach(...).`},
{code:`const reducer = (s, a) => a.type === "inc" ? { ...s, n: s.n + 1 } : s;
const s0 = { n: 0 };
const s1 = reducer(s0, { type: "inc" });
const s2 = reducer(s1, { type: "noop" });
console.log(s0.n, s1.n, s1 === s2, s0 === s1);`,ans:`0 1 true false`,why:`A pure reducer returns a new object when something changed (s1 !== s0, s0 untouched) and the same reference when nothing changed (s2 === s1), which enables cheap change detection.`}]},

{n:29,title:"Architecture",goal:"Choose rendering strategies, decide on micro-frontends, and design APIs and delivery for scale.",topics:[
{id:"d29-rendering",title:"SSR, CSR, SSG, ISR and micro-frontends",
eli5:`<p>Where do you cook the meal? <b>CSR</b>: send guests the raw ingredients and a recipe, they cook at their table (slow to start, flexible afterwards). <b>SSR</b>: the kitchen cooks each plate when ordered. <b>SSG</b>: meals pre-cooked and ready on the shelf (fastest, but what if the menu changes?). <b>ISR</b>: pre-cooked, but the kitchen quietly refreshes the shelf now and then. And <b>micro-frontends</b>: a food court where different kitchens (teams) run their own stalls.</p>`,
why:`<p>Where and when HTML is produced affects load speed, SEO, personalization, cost and complexity. Different pages in the same product often deserve different strategies.</p>`,
tech:`<table><tr><th>Strategy</th><th>HTML produced</th><th>Strengths</th><th>Costs</th></tr><tr><td>CSR</td><td>in the browser</td><td>simple hosting, rich app feel after load</td><td>slow LCP, SEO risk, blank screen until JS runs</td></tr><tr><td>SSR</td><td>on the server per request</td><td>fast first paint, SEO, personalization</td><td>server cost/latency (TTFB), <b>hydration</b> cost hurts INP</td></tr><tr><td>SSG</td><td>at build time</td><td>cheapest, fastest, CDN-cacheable</td><td>stale until rebuild; build time grows</td></tr><tr><td>ISR / on-demand revalidation</td><td>static, regenerated in the background</td><td>static speed with fresh-enough data</td><td>freshness vs cache complexity</td></tr><tr><td>Streaming SSR / islands / server components</td><td>progressively; only interactive parts hydrate</td><td>less JS to hydrate, faster perceived load</td><td>more architectural complexity</td></tr></table>
<ul class="pts"><li><b>Hydration</b> attaches event handlers to server HTML; the page looks ready but may not respond until JS runs (hurts INP). Mitigate with less JS, islands/partial hydration, resumability, streaming.</li><li><b>Choose by:</b> content freshness, SEO need, personalization, traffic shape, team skills, infra budget. Marketing pages → SSG; product pages → ISR/SSR; dashboards behind login → CSR (or SSR shell).</li></ul>
<h5>Micro-frontends</h5><table><tr><th>Approach</th><th>Main risk</th></tr><tr><td>Build-time packages (shared npm libs)</td><td>coupled releases</td></tr><tr><td>Runtime composition (Module Federation, import maps)</td><td>shared-dependency version conflicts</td></tr><tr><td>Web Components</td><td>styling and SSR friction</td></tr><tr><td>iframes</td><td>strongest isolation but poor UX/performance</td></tr><tr><td>Server-side / edge composition</td><td>operational complexity</td></tr></table>
<ul class="pts"><li>Use micro-frontends for <b>team autonomy at scale</b> (independent deploys, ownership), not for technical elegance: costs include duplicated dependencies, inconsistent UX, cross-app communication, routing, and observability.</li><li>Needs: a shared design system, contracts (events/props/URL), versioning and a performance budget. Conway's law: architecture mirrors team structure.</li></ul>`,
diagram:{html:flow([["Is the content the same for everyone?"],["Yes, rarely changes","SSG","g"],["Yes, changes often","ISR / SSR + CDN cache","w"],["No (personalized)","SSR + streaming or CSR behind login","r"]],{plain:true})+`<p style="text-align:center;margin:12px 0 0">…then ask: is SEO important? how much JS must be interactive at first paint?</p>`,steps:["Start from freshness and personalization, since they decide whether HTML can be pre-built.","Then consider SEO and the performance budget: SSR/SSG for crawlable, fast first loads.","Reduce hydration with islands, streaming and code splitting if interactivity cost (INP) is high.","Mix strategies per route; there's no single winner."]},
ex:[{t:"A decision helper (runnable)",code:`function chooseRendering({ personalized, seo, changesOften, interactiveHeavy }){
  if (!personalized && !changesOften) return "SSG (build once, serve from CDN)";
  if (!personalized && changesOften) return "ISR or SSR behind a CDN with short cache + revalidation";
  if (personalized && seo) return "SSR + streaming; cache public parts, hydrate only interactive islands";
  return interactiveHeavy ? "CSR app shell (behind login) with code splitting" : "SSR or CSR; choose by team skills";
}
console.log("docs site:", chooseRendering({ personalized: false, seo: true, changesOften: false }));
console.log("news site:", chooseRendering({ personalized: false, seo: true, changesOften: true }));
console.log("shop product page:", chooseRendering({ personalized: true, seo: true, changesOften: true }));
console.log("analytics dashboard:", chooseRendering({ personalized: true, seo: false, interactiveHeavy: true }));`},
{t:"A micro-frontend contract with a Web Component (reference)",code:`// Team A publishes a custom element; the shell only knows the contract
class CartWidget extends HTMLElement {
  static observedAttributes = ["user-id"];
  connectedCallback(){ this.render(); }
  attributeChangedCallback(){ this.render(); }
  render(){ this.innerHTML = "<button>Cart (" + (this.getAttribute("items") ?? 0) + ")</button>"; }
}
customElements.define("team-cart", CartWidget);

// Shell: compose by markup, communicate by events (no shared globals)
// <team-cart user-id="42"></team-cart>
document.addEventListener("cart:item-added", (e) => console.log("shell saw", e.detail));
// inside the widget:  this.dispatchEvent(new CustomEvent("cart:item-added", { detail: { sku: "A1" }, bubbles: true, composed: true }));`,run:false}],
gotchas:[`Hydration mismatches (server and client render different HTML) cause errors and flicker; avoid random/time-dependent output during render.`,`SSR doesn't automatically mean fast: slow data fetching on the server raises TTFB.`,`SSG with thousands of pages can make builds very slow; use on-demand/ISR generation.`,`Caching personalized HTML publicly leaks one user's data to another; mark responses properly (<code>Cache-Control: private</code>/<code>Vary</code>).`,`Micro-frontends sharing a framework version across teams can couple deployments again.`,`Starting with micro-frontends for a small team multiplies complexity without the benefit.`],
best:[`Choose per route; measure LCP/INP by strategy; cache aggressively at the CDN where content isn't user-specific.`,`Adopt micro-frontends only when independent deployment across many teams is a real bottleneck; define contracts and a shared design system first.`],
iq:[["mid","CSR vs SSR?","CSR renders in the browser after JS loads (slow first paint, SEO challenges); SSR renders HTML on the server per request (fast first paint, needs hydration)."],["senior","What is hydration and what is its cost?","Attaching event listeners/state to server-rendered HTML. It re-executes component code in the browser, delaying interactivity and hurting INP; reduce with islands, streaming and less JS."],["architect","Pick a rendering strategy for an e-commerce site.","SSG/ISR for category and marketing pages, SSR (cached, with personalized islands) for product pages needing fresh price/stock and SEO, CSR for account/checkout where SEO doesn't matter, with CDN caching, CWV budgets and performance monitoring."],["architect","When would you choose micro-frontends for 8 teams?","When teams need independent release cycles and ownership of distinct domains, with a strong platform team providing a design system, contracts, shared tooling and performance guardrails; otherwise a modular monolith/monorepo is simpler."]],
practice:[`Take three routes of a product and assign and justify a rendering strategy for each.`,`Sketch a micro-frontend contract (events, props, routes) for two teams.`],
teach:`<p>"Decide where to cook the page: in the browser, on the server per request, ahead of time, or ahead-of-time-with-refreshes. Mix them per page. Micro-frontends are for many teams needing independence, not for making the code look clever."</p>`},

{id:"d29-scale",title:"Monorepos, API design and observability",
eli5:`<p>A <b>monorepo</b> is one big toolbox for many projects with a smart foreman who only re-tests the tools that changed. <b>API design</b> is writing clear, forgiving instructions for how programs talk to each other (ask for the "next page" with a bookmark, not "page 40", and if you accidentally press "pay" twice, you're charged once). <b>Observability</b> is having windows and gauges in the factory so you can see what's wrong without opening the machines.</p>`,
why:`<p>At scale, the hard problems are about people and change: many teams, many services, constant releases. Repository structure, stable contracts and visibility into production determine whether you can move fast safely.</p>`,
tech:`<h5>Monorepos</h5><ul class="pts"><li>Many packages/apps in one repo using <b>workspaces</b> (pnpm/npm/yarn). A <b>task graph</b> tool (<b>Nx</b>, <b>Turborepo</b>) runs builds/tests in dependency order with <b>local/remote caching</b> and <b>affected-only</b> CI.</li><li>Benefits: atomic cross-package changes, shared tooling, easy refactors. Needs: clear <b>ownership</b> (CODEOWNERS), <b>module boundaries</b> enforced by lint rules, versioning (changesets) and fast CI.</li></ul>
<h5>API design (client's view)</h5><ul class="pts"><li><b>REST:</b> resource nouns, correct verbs/status codes, consistent error contract (e.g. RFC 9457 problem details), validation, versioning strategy, rate limits, caching (<code>ETag</code>, <code>Cache-Control</code>).</li><li><b>Pagination:</b> <b>cursor</b> pagination is stable under inserts/deletes; <b>offset</b> can skip or duplicate items and gets slow on big tables.</li><li><b>Idempotency:</b> safe retries need <code>Idempotency-Key</code> for unsafe operations (payments); PUT/DELETE are idempotent by definition.</li><li><b>GraphQL/BFF:</b> GraphQL gives clients flexible queries but needs caching, auth and query-cost controls; a <b>Backend-for-Frontend</b> shapes data for one UI. <b>Contract-first</b> with OpenAPI/schemas generates types and mocks.</li></ul>
<h5>Observability</h5><ul class="pts"><li>The three pillars: <b>logs</b> (structured JSON events), <b>metrics</b> (aggregated numbers), <b>traces</b> (one request across services). <b>OpenTelemetry</b> is the vendor-neutral standard for emitting them.</li><li><b>Frontend:</b> RUM for Web Vitals and errors (with source maps and release tags), session replay (privacy-aware), long-task and API-latency tracking.</li><li><b>SLIs/SLOs and error budgets</b> define "good enough"; alert on user-impacting symptoms. Use <b>feature flags</b>, canary releases and fast rollback to reduce deploy risk.</li></ul>`,
diagram:{html:lanes([["Monorepo",["apps/web, apps/admin","packages/ui, packages/api-client","task graph + cache + affected CI"]],["API contract",["cursor pagination","idempotency keys","consistent errors + versions"]],["Observability",["logs (events)","metrics (numbers)","traces (request path)","RUM + errors"]]]),steps:["The repo structure lets teams share code and still build only what changed.","The API contract is the stable boundary between teams and between frontend and backend.","Telemetry closes the loop: you ship, observe, and can prove whether the change helped."]},
ex:[{t:"Cursor pagination vs offset pagination (runnable)",code:`let items = Array.from({ length: 6 }, (_, i) => ({ id: i + 1 }));          // ids 1..6, newest last
const byOffset = (offset, limit) => items.slice(offset, offset + limit).map((i) => i.id);
const byCursor = (afterId, limit) => items.filter((i) => i.id > afterId).slice(0, limit).map((i) => i.id);
const p1o = byOffset(0, 3);
const p1c = byCursor(0, 3);
items = [{ id: 0 }, ...items];                                             // a new item is inserted at the front
console.log("offset page 2:", byOffset(3, 3), "(repeats", p1o[2] + ")");
console.log("cursor page 2:", byCursor(p1c[p1c.length - 1], 3), "(no duplicates)");`},
{t:"Idempotency keys (runnable)",code:`const seen = new Map();
let charges = 0;
function pay(key, amount){
  if (seen.has(key)) return { ...seen.get(key), replayed: true };       // same key: return the stored result
  charges++;
  const result = { chargeId: "ch_" + charges, amount };
  seen.set(key, result);
  return result;
}
console.log(pay("order-42", 10));
console.log(pay("order-42", 10));                                        // client retry after a timeout
console.log(pay("order-43", 10));
console.log("total charges:", charges);`}],
gotchas:[`Monorepos without boundaries become a tangled monolith; enforce import rules and ownership.`,`Offset pagination with changing data skips/duplicates items; deep offsets are slow.`,`Retrying non-idempotent calls without a key can double-charge or double-create.`,`High-cardinality metric labels (user ids) explode storage costs; put details in logs/traces.`,`Logging sensitive data (tokens, PII) is a security incident; scrub and sample.`,`Alerting on causes (CPU) instead of user symptoms (error rate, latency) creates noise.`,`Changing an API response shape without versioning/deprecation breaks clients silently.`],
best:[`Use workspaces plus a caching task runner; keep boundaries and ownership explicit; automate releases (changesets).`,`Design APIs contract-first with cursor pagination, idempotency keys, consistent errors and a deprecation policy.`,`Instrument with OpenTelemetry, define SLOs, upload source maps per release, and deploy behind feature flags with canaries.`],
iq:[["senior","Cursor vs offset pagination?","Cursor uses an opaque position (last seen id/timestamp) so pages are stable when data changes and queries use indexes; offset is simple but can skip or repeat rows and degrades for large offsets."],["senior","How do you make a POST safe to retry?","Require an idempotency key; store the result keyed by it for a time window and return the stored result on replays."],["architect","Design the observability for a SPA + API platform.","RUM with web-vitals and error tracking tagged by release/route, trace propagation from browser to backend with OpenTelemetry, structured logs with correlation ids, SLOs for key journeys, dashboards and alerts on symptoms, source maps uploaded in CI, feature flags and canary rollout."],["architect","When is a monorepo the right choice?","When many packages change together and share tooling; invest in a task-graph cache, affected-only CI, ownership and boundaries. For few independent teams with separate lifecycles, polyrepos can be simpler."]],
practice:[`Convert a small multi-app project to a pnpm workspace with Turborepo caching.`,`Design the pagination, error and idempotency contract for a "create order" endpoint.`],
teach:`<p>"A monorepo with a smart foreman rebuilds only what changed. APIs should paginate with bookmarks and make retries safe with idempotency keys. And you need gauges (logs, metrics, traces) to see problems in production."</p>`}
],quiz:[
{code:`const seen = new Map();
const pay = (key, amt) => { if (seen.has(key)) return seen.get(key); const r = { charged: amt }; seen.set(key, r); return r; };
const a = pay("k1", 10), b = pay("k1", 10), c = pay("k2", 10);
console.log(a === b, a === c);`,ans:`true false`,why:`The same idempotency key returns the stored result (no second charge); a new key creates a new one.`},
{code:`let items = [1, 2, 3, 4, 5, 6];
const page1 = items.slice(0, 3);
items.unshift(0);
const page2 = items.slice(3, 6);
console.log(page1, page2);`,ans:`[1, 2, 3] [3, 4, 5]`,why:`Inserting at the front shifts everything, so offset pagination repeats item 3. A cursor ("after id 3") would continue correctly with 4, 5, 6.`}]},

{n:30,title:"Capstone",goal:"Put everything together: practice interviews at every level, design a system out loud, and keep a one-page cheat sheet.",topics:[
{id:"d30-mock",title:"Mock interview bank",
eli5:`<p>A mock interview is a <b>dress rehearsal</b>. You say the answers out loud, to a friend or a mirror, before the real show. If you can explain the answer to a 5-year-old and then to an expert, you really know it. Try the question first, <i>then</i> open the answer.</p>`,
why:`<p>Knowing something and explaining it under pressure are different skills. This bank collects the questions that decide most JavaScript interviews, grouped by level, with answer outlines that mirror what interviewers look for.</p>`,
tech:`<p><b>How to practice:</b> 1) read the question; 2) answer aloud for 60–90 seconds (definition, how it works, example, pitfall); 3) open the model answer and note what you missed; 4) for coding questions, write the solution without looking, then run the tests below.</p>
<p><b>What interviewers score:</b> correctness, clarity, trade-offs, edge cases, testing mindset, and honest "I'd measure that" answers. At senior and architect levels, they weigh <b>requirements gathering, trade-offs and risk</b> more than API trivia. Always say <i>why</i>, not just <i>what</i>.</p>
<p>Open each question below, grouped by the colored level badge. Use the Days column in the career ladder on the home page to review gaps.</p>`,
diagram:{html:flow([["Clarify","restate the problem, ask constraints"],["Answer","definition → how → example","w"],["Edge cases","what breaks? what about errors?","w"],["Trade-offs","alternatives and when not to use","g"],["Test / measure","how would you verify?","g"]]),steps:["Clarify before solving; interviewers reward good questions.","Give a structured answer: concept, mechanism, small example.","Name edge cases and failure modes unprompted.","Discuss trade-offs and alternatives, especially at senior+ levels.","Close with how you'd test or measure it."]},
ex:[{t:"Polyfill workbench: Promise.all, deepClone, flatten with self-checks (runnable)",code:`const sleep = (ms, v) => new Promise((r) => setTimeout(r, ms, v));
const promiseAll = (items) => new Promise((resolve, reject) => {
  const arr = [...items];
  if (!arr.length) return resolve([]);
  const out = new Array(arr.length); let left = arr.length;
  arr.forEach((p, i) => Promise.resolve(p).then((v) => { out[i] = v; if (--left === 0) resolve(out); }, reject));
});
const deepClone = (v, seen = new WeakMap()) => {
  if (v === null || typeof v !== "object") return v;
  if (seen.has(v)) return seen.get(v);
  if (v instanceof Date) return new Date(v);
  if (v instanceof RegExp) return new RegExp(v.source, v.flags);
  if (v instanceof Map) { const m = new Map(); seen.set(v, m); v.forEach((x, k) => m.set(deepClone(k, seen), deepClone(x, seen))); return m; }
  if (v instanceof Set) { const s = new Set(); seen.set(v, s); v.forEach((x) => s.add(deepClone(x, seen))); return s; }
  const out = Array.isArray(v) ? [] : Object.create(Object.getPrototypeOf(v));
  seen.set(v, out);
  for (const k of Reflect.ownKeys(v)) out[k] = deepClone(v[k], seen);
  return out;
};
const flatten = (a, d = 1) => a.reduce((acc, x) => Array.isArray(x) && d > 0 ? acc.concat(flatten(x, d - 1)) : acc.concat([x]), []);
const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
(async () => {
  check("all keeps input order", JSON.stringify(await promiseAll([sleep(10, "a"), "b", sleep(1, "c")])) === '["a","b","c"]');
  check("all resolves [] for empty input", (await promiseAll([])).length === 0);
  try { await promiseAll([sleep(5, 1), Promise.reject("no")]); check("all rejects", false); } catch (e) { check("all rejects with the first error", e === "no"); }
  const o = { d: new Date(0), m: new Map([[1, { x: 1 }]]) }; o.self = o;
  const c = deepClone(o);
  check("clone handles cycles", c.self === c && c !== o);
  check("clone copies Date", c.d instanceof Date && c.d !== o.d);
  check("clone deep-copies Map values", c.m.get(1) !== o.m.get(1));
  check("flatten depth 2", JSON.stringify(flatten([1, [2, [3, [4]]]], 2)) === "[1,2,3,[4]]");
})();`}],
gotchas:[`Memorized answers collapse under follow-up questions; practice explaining <i>why</i>.`,`Don't claim certainty about engine internals you haven't measured; say "implementation-dependent".`,`For polyfills, mention the edge cases (empty input, ordering, errors, <code>this</code>, <code>new</code>) before coding.`,`At senior levels, jumping straight to tools before requirements is the most common failure.`],
best:[`Practice out loud and time yourself; keep a personal list of questions you missed and re-do them after a week.`,`Prepare 3 stories (a bug you diagnosed, a performance win, a design trade-off) with numbers.`],
iq:[
["fresher","What are the differences between var, let and const, and what is the TDZ?","Scope (function vs block), hoisting (var initialized to undefined; let/const exist but are uninitialized until their declaration, the temporal dead zone), re-declaration and re-assignment rules, const protects the binding not the contents."],
["fresher","What does [1,2,3].map(parseInt) return and why?","[1, NaN, NaN]. map passes (value, index, array), so parseInt gets the index as the radix: parseInt('2', 1) and parseInt('3', 2) are NaN."],
["fresher","Explain closures with the classic var-in-a-loop problem.","A closure keeps a live reference to its creation scope. With var, all callbacks share one variable (prints 3 3 3); with let each iteration has its own binding (0 1 2). Old fix: an IIFE."],
["fresher","== vs ===, and name the falsy values.","=== no coercion; == coerces. Falsy: false, 0, -0, 0n, '', null, undefined, NaN."],
["fresher","What is the difference between null and undefined?","undefined means no value was assigned; null is an intentional empty value. typeof null is 'object' (legacy bug). null == undefined is true; === is false."],
["mid","State the four rules for this and write a bind polyfill.","new > explicit (call/apply/bind) > implicit (obj.method) > default (undefined in strict). Arrows use lexical this. Bind: return a function that applies the original with the bound this plus partial args, supports new via instanceof check and keeps the prototype."],
["mid","Debounce vs throttle: implement both.","Debounce: clearTimeout + setTimeout in a closure, run after quiet. Throttle: track last run time (or a timer) and run at most once per interval. Add cancel/flush and forward this/args."],
["mid","Explain event delegation and capture vs bubble.","Events travel capture (down) → target → bubble (up). Delegation attaches one listener to a parent and uses event.target.closest(selector); good for dynamic lists and fewer listeners."],
["mid","Predict: sync log, setTimeout 0, Promise.then, queueMicrotask.","Sync first, then microtasks in queue order (promise then, queueMicrotask), then the timer task."],
["mid","How does the prototype chain work, and what does new do?","Property lookup walks [[Prototype]] links to null; writes create own properties. new creates an object, links it to F.prototype, runs F with this, and returns the object unless F returns an object."],
["senior","Implement Promise.all (and allSettled, a concurrency pool, a retry with backoff).","See the workbench: preserve order by index, resolve [] for empty, wrap values with Promise.resolve, reject on first rejection. Pool: N workers pulling from a shared queue. Retry: loop with exponential backoff plus jitter, only for idempotent operations."],
["senior","Write deepClone. When is structuredClone enough?","Handle cycles with a WeakMap, Date, RegExp, Map, Set, arrays, prototypes. structuredClone covers plain data, cycles, Date/Map/Set/typed arrays but throws on functions/DOM and drops prototypes and getters."],
["senior","Compare the browser and Node event loops.","Browser: task → microtasks → render steps (rAF, style, layout, paint). Node: libuv phases (timers, pending, poll, check, close) with the nextTick queue then promise microtasks drained after every callback; setImmediate vs setTimeout order depends on context."],
["senior","How do you find and fix a memory leak?","Reproduce, confirm growth in the Performance monitor, take heap snapshots (three-snapshot technique), inspect Detached nodes and the Retainers path, then remove the reference: clear timers/listeners, bound caches, null out references, use WeakMap."],
["senior","What are hidden classes and inline caches?","V8 shapes objects with the same property history to enable fast offset access; ICs cache the shapes seen at each site (mono/poly/megamorphic). Keep shapes stable: same init order, no delete, homogeneous arrays."],
["senior","How do you secure a SPA against XSS and CSRF?","textContent/framework escaping, sanitize needed HTML, strict nonce-based CSP, Trusted Types, HttpOnly Secure SameSite cookies, CSRF tokens/Origin checks, dependency hygiene, no secrets in localStorage."],
["lead","Plan a migration from CommonJS to ESM, or Date to Temporal.","Audit usage, add tests, upgrade tooling, convert leaf modules first, handle interop (dynamic import, exports map, createRequire), provide a polyfill where Safari lacks Temporal, migrate incrementally behind adapters, measure, and set a removal date."],
["lead","Define your team's quality gates.","Formatter + ESLint flat config, type checks, unit/integration/e2e per the pyramid, coverage as a diagnostic, CI with npm ci, performance and bundle budgets, dependency review, code ownership, PR templates."],
["lead","Code-review checklist for a UI component.","Correctness and edge cases, accessibility, layout thrashing, event-listener and timer cleanup, XSS sinks, unnecessary re-renders, error and loading states, test coverage, bundle impact."],
["architect","Pick a rendering strategy for an e-commerce site and justify it against Core Web Vitals.","Per-route strategy: SSG/ISR for catalog, cached SSR with personalized islands for product pages, CSR for account/checkout; CDN caching, image optimization and preloading for LCP, minimal hydration for INP, reserved space for CLS; RUM to verify."],
["architect","Should 8 teams adopt micro-frontends?","Only if independent deploys and domain ownership are real bottlenecks and a platform team provides a design system, contracts, performance budgets and observability; otherwise start with a modular monorepo."],
["architect","Design a performance budget and RUM pipeline.","Define per-route budgets (JS KB, LCP, INP, CLS), collect field data with web-vitals into an analytics endpoint tagged by release/device, dashboard p75, CI gates with Lighthouse CI/size-limit, alert on regressions, and review quarterly."]
],
practice:[`Run the polyfill workbench above; then re-implement each function from a blank file.`,`Record yourself answering 5 random questions; review for structure and edge cases.`],
teach:`<p>"Answer in layers: definition, how it works, small example, pitfall, trade-off. At senior levels start with requirements and constraints, not tools."</p>`},

{id:"d30-system",title:"System design walkthrough",
eli5:`<p>Designing a system is like planning a school trip. First <b>ask what the trip is for</b> (requirements). Then draw the <b>route</b> (architecture), decide <b>what to pack</b> (data and APIs), think about <b>what could go wrong</b> (performance, accessibility, security), and <b>how you'll know it went well</b> (observability). Doing it in that order keeps you from buying tickets for the wrong destination.</p>`,
why:`<p>Frontend system design interviews (and real design reviews) test whether you can structure an ambiguous problem, make trade-offs, and anticipate failure, not whether you can recite one right answer.</p>`,
tech:`<h5>A five-step framework</h5><ol><li><b>Requirements:</b> functional (what it does), non-functional (latency, scale, offline, accessibility, i18n, browser support), out of scope.</li><li><b>Architecture:</b> components and boundaries, rendering strategy, state ownership, caching layers.</li><li><b>Data model and API:</b> entities, endpoints, pagination, real-time vs polling, error contract.</li><li><b>Performance, accessibility, security:</b> budgets, virtualization, debounce/cancel, ARIA and keyboard, XSS/CSRF, privacy.</li><li><b>Observability and rollout:</b> metrics, error tracking, feature flags, experiments, rollback.</li></ol>
<h5>Worked example: search autocomplete</h5><ul class="pts"><li><b>Requirements:</b> suggestions within ~100 ms perceived, keyboard navigable, works on slow networks, accessible, no flicker, handles 1M queries/day.</li><li><b>Architecture:</b> input component → debounced query → API (<code>GET /suggest?q=&amp;limit=8</code>) → in-memory/LRU cache keyed by query → results list. Prefix cache (popular queries) and a CDN for common prefixes; abort stale requests; ignore out-of-order responses.</li><li><b>Edge cases:</b> IME composition (don't query mid-composition), empty and error states, very fast typing, offline, special characters, rate limiting, duplicates, pasted text, RTL.</li><li><b>Accessibility:</b> the ARIA combobox pattern (<code>role="combobox"</code>, <code>aria-expanded</code>, <code>aria-controls</code>, <code>aria-activedescendant</code>), arrow keys/Enter/Escape, announcements for result counts.</li><li><b>Performance:</b> ≤ 150–300 ms debounce, small payloads, virtualize if many rows, preconnect to the API, measure INP of typing.</li><li><b>Security/privacy:</b> escape rendered suggestions (XSS), don't log sensitive queries, throttle abusive clients.</li></ul>
<h5>Other classic prompts</h5><ul class="pts"><li><b>News feed:</b> cursor pagination + infinite scroll with IntersectionObserver, windowing, optimistic likes, skeletons, stale-while-revalidate cache, image lazy loading and dimension reservation.</li><li><b>Collaborative editor:</b> operational transform or CRDTs, WebSocket sync, presence, offline queue and conflict resolution, undo stacks.</li><li><b>Design system / micro-frontend platform:</b> tokens, versioning, contracts, visual regression tests, governance.</li></ul>`,
diagram:{html:flow([["keystroke"],["debounce ~200 ms","skip while composing (IME)","w"],["cache hit?","LRU by prefix","g"],["fetch /suggest (abort previous)","w"],["ignore stale responses","r"],["render combobox list","ARIA + keyboard","g"]]),steps:["Typing is debounced so only meaningful queries go out; IME composition is respected.","A client cache answers repeated or backspaced queries instantly.","On a miss, abort the previous in-flight request and fetch the new one.","If an old response arrives late it must not overwrite a newer one: compare request ids.","The list renders with proper roles, keyboard handling and announcements."]},
ex:[{t:"Autocomplete core: cache + stale-response protection (runnable)",code:`const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const api = async (q) => { await sleep(q.length === 1 ? 30 : 5); return [q + "1", q + "2"]; };   // short queries answer slowly
function createAutocomplete(){
  let latest = 0;
  const cache = new Map();
  return async function search(q){
    const id = ++latest;
    if (cache.has(q)) return cache.get(q);
    const res = await api(q);
    cache.set(q, res);
    if (id !== latest) return null;                    // a newer query exists: drop this stale result
    return res;
  };
}
(async () => {
  const s = createAutocomplete();
  const p1 = s("a"), p2 = s("ab");                    // "a" is slower and finishes after "ab"
  console.log(await p1, await p2);
  console.log(await s("ab"));                         // served from cache
})();`}],
gotchas:[`Jumping into components before clarifying requirements and scale.`,`Forgetting out-of-order responses (race conditions) in any async search.`,`Ignoring accessibility and keyboard behavior; for autocomplete it is a core requirement.`,`Not stating trade-offs (e.g. client cache freshness vs speed).`,`Over-engineering for scale that wasn't asked for; stay proportional to the requirements.`],
best:[`Draw the data flow; list assumptions aloud; give numbers (latency, payload, request rate) even if rough.`,`Finish with risks, metrics and an incremental rollout plan.`],
iq:[["architect","Design autocomplete for a large e-commerce search box.","Use the framework: requirements and budgets; debounced input, abort/ignore stale, LRU + prefix cache, CDN for popular prefixes; API with limit and ranking; ARIA combobox and keyboard support; escape output; metrics for latency, zero-result rate and INP; experiment behind a flag."],["architect","How would you design a news feed with infinite scroll?","Cursor pagination, IntersectionObserver sentinel, windowing to cap DOM size, skeletons and reserved image space for CLS, optimistic updates, request cancellation and caching with SWR, offline fallback, and metrics for LCP/INP and scroll jank."],["architect","How do you approach an open-ended design question?","Clarify requirements and constraints, state assumptions, outline the architecture, deep-dive into the riskiest parts, discuss trade-offs and alternatives, then cover observability, rollout and failure modes."]],
practice:[`Design a typeahead for 10 million users on paper in 30 minutes using the five steps; then compare with the example.`,`Sketch the component tree, state ownership and API for a news feed.`],
teach:`<p>"Ask what we're building, draw the route, decide what to pack, think about what can go wrong, and say how we'd know it works. And never forget old responses arriving late."</p>`},

{id:"d30-cheat",title:"Final cheat sheet",
eli5:`<p>A cheat sheet is a <b>pocket map</b>. You've walked the whole country in 30 days; the map just reminds you where the big roads are. Look at it before an interview, and if you can explain each line in one sentence to a 5-year-old, you've got it.</p>`,
tech:`<h5>Language</h5><table><tr><th>Topic</th><th>Remember</th></tr><tr><td>Types</td><td>7 primitives + object; <code>typeof null</code> = "object"; NaN !== NaN; floats are IEEE-754 (0.1+0.2); BigInt for big integers</td></tr><tr><td>Falsy (8)</td><td>false, 0, -0, 0n, "", null, undefined, NaN</td></tr><tr><td>Equality / coercion</td><td>Use ===; <code>+</code> concatenates if either side is a string; <code>x == null</code> idiom; <code>null >= 0</code> true</td></tr><tr><td>Declarations</td><td>var function-scoped + hoisted as undefined; let/const block-scoped + TDZ; const freezes the binding only</td></tr><tr><td>this</td><td>new > call/apply/bind > obj.method() > default (undefined in strict); arrows are lexical</td></tr><tr><td>Closures</td><td>function + live reference to creation scope; each call = new environment; var loop shares one binding</td></tr><tr><td>Prototypes</td><td>reads walk the chain to null, writes create own properties; classes are syntax over prototypes; <code>#private</code> is real privacy</td></tr><tr><td>Arrays</td><td>default sort is string order; toSorted/toReversed/with copy; holes skipped by forEach/map; map(parseInt) trap</td></tr><tr><td>Objects</td><td>key order: integer keys, strings, symbols; spread is shallow; <code>Object.hasOwn</code>; structuredClone for deep copies (no functions)</td></tr><tr><td>Iteration</td><td>iterable → <code>[Symbol.iterator]()</code> → <code>next()</code>; generators are lazy; iterator helpers are lazy</td></tr><tr><td>Newer features (Nov 2026)</td><td>ES2025/ES2026 shipped; Temporal and <code>using</code> are Stage 4 for ES2027 (Safari lacks Temporal); decorators are a proposal (Stage 2.7)</td></tr></table>
<h5>Async and runtime</h5><table><tr><th>Topic</th><th>Remember</th></tr><tr><td>Event loop order</td><td>sync → all microtasks → (render if due) → next task → microtasks…</td></tr><tr><td>Microtasks</td><td>promise reactions, queueMicrotask, await continuations, MutationObserver; tasks: timers, events, I/O</td></tr><tr><td>Promises</td><td>settle once; then returns a new promise; executor sync; all (fail-fast), allSettled, race, any</td></tr><tr><td>async/await</td><td>pauses the function, not the thread; forEach doesn't wait; parallelize with Promise.all</td></tr><tr><td>Workers / streams</td><td>workers: own loop, no DOM, structured clone or transfer; streams add backpressure; AbortController cancels</td></tr><tr><td>Node loop</td><td>timers → pending → poll → check (setImmediate) → close; nextTick before promises</td></tr></table>
<h5>Browser</h5><table><tr><th>Topic</th><th>Remember</th></tr><tr><td>Events</td><td>capture → target → bubble; delegate with closest(); stopImmediatePropagation; passive listeners</td></tr><tr><td>Rendering</td><td>DOM + CSSOM → style → layout → paint → composite; CSS blocks render, sync JS blocks parse; defer</td></tr><tr><td>Cost ladder</td><td>layout &gt; paint &gt; composite-only (transform, opacity); batch reads before writes</td></tr><tr><td>Storage</td><td>cookies (sent to server, ~4 KB), localStorage/sessionStorage (sync, strings, ~5 MiB), IndexedDB/Cache/OPFS (async, large)</td></tr><tr><td>fetch / CORS</td><td>fetch rejects only on network failure; check ok; preflight for non-simple requests; CORS is browser-enforced, not CSRF protection</td></tr><tr><td>Security</td><td>textContent not innerHTML; strict CSP + Trusted Types; HttpOnly Secure SameSite cookies; CSRF tokens; no secrets in localStorage</td></tr></table>
<h5>Engine and performance</h5><table><tr><th>Topic</th><th>Remember</th></tr><tr><td>V8</td><td>Ignition → Sparkplug → Maglev → TurboFan; deopt when assumptions break; stable shapes, no delete, dense homogeneous arrays</td></tr><tr><td>GC</td><td>reachability from roots; young gen Scavenger, old gen Mark-Compact (concurrent/incremental); leaks = unintended references</td></tr><tr><td>Web Vitals (p75)</td><td>LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; measure in the field (RUM)</td></tr><tr><td>Bundling</td><td>tree-shaking needs static ESM + sideEffects flag; split with import(); hash filenames for immutable caching</td></tr><tr><td>Modules</td><td>ESM: static, live bindings, strict, TLA; CJS: dynamic, copies; require(esm) only without top-level await</td></tr></table>
<h5>Architecture</h5><table><tr><th>Topic</th><th>Remember</th></tr><tr><td>Rendering</td><td>SSG static, ISR refreshed static, SSR per request, CSR in the browser; hydration hurts INP; mix per route</td></tr><tr><td>Micro-frontends</td><td>for team autonomy; shared deps, UX consistency and ops cost</td></tr><tr><td>State</td><td>local first; separate server cache; pure reducers; derive, don't duplicate</td></tr><tr><td>APIs</td><td>cursor pagination, idempotency keys, consistent errors, versioning, ETags</td></tr><tr><td>Observability</td><td>logs + metrics + traces (OpenTelemetry), RUM, source maps, SLOs, feature flags and canaries</td></tr></table>
<h5>Your 30-day checklist</h5><ul class="pts"><li>I can predict the output of mixed sync/promise/timer code and explain why.</li><li>I can write bind, debounce, throttle, memoize, curry, Promise.all and deepClone from memory.</li><li>I can diagnose a slow page and a leaking page using DevTools.</li><li>I can secure a page against XSS/CSRF and explain CORS.</li><li>I can choose a rendering strategy and defend the trade-offs.</li><li>I can teach any topic in two minutes using the 5-year-old and technical versions.</li></ul>`,
diagram:{html:flow([["Foundations","Wk 1"],["Core depth","Wk 2","w"],["Async + runtime","Wk 3","w"],["Browser","Wk 4","g"],["Engine + modules","Wk 5","g"],["Node + architecture","Wk 6","r"]]),steps:["Each week builds on the last: language, then deeper language, then async, then the browser, then the engine, then systems.","Revisit the weekly revision sheets and re-run the quizzes before interviews."]},
ex:[],gotchas:[`Version-dependent facts (browser support, tool versions, Node LTS lines) change; re-check MDN and nodejs.org before quoting them.`],best:[`Re-teach one topic per day for a week after finishing the course; teaching is the best test.`],iq:[["architect","Teach me the event loop in two minutes.","One chef (call stack) takes one ticket (task) at a time; when finished, handles all urgent sticky notes (microtasks) before the next ticket; the waiter occasionally shows plates (rendering). Slow dishes block everyone, so keep tasks short and use workers for heavy computing."]],
practice:[`Print this page (Ctrl/Cmd+P) and keep it beside you during mock interviews.`,`Pick the three weakest rows in the tables and revisit those days.`],
teach:`<p>"The whole course in one sentence: JavaScript runs one thing at a time, remembers where functions came from, delegates through prototypes, and talks to the outside world through queues; everything else is how browsers, engines and teams make that fast, safe and maintainable."</p>`}
],quiz:[
{code:`console.log("1");
setTimeout(() => console.log("2"), 0);
(async () => { console.log("3"); await null; console.log("4"); })();
Promise.resolve().then(() => console.log("5"));
console.log("6");`,ans:`1 3 6 4 5 2 (one per line)`,why:`Sync: 1, 3 (the async function runs until its first await), 6. Microtasks in queue order: the await continuation (4), then the promise reaction (5). Finally the timer task (2).`},
{code:`const o = {
  n: 1,
  f(){ return [1, 2].map(function(){ return this?.n; }); },
  g(){ return [1, 2].map(() => this.n); }
};
console.log(o.f(), o.g());`,ans:`[undefined, undefined] [1, 1]`,why:`The regular callback's this is not o (global object in sloppy mode, undefined in strict), so n is undefined; the arrow function inherits this from g, which is o.`}]}
]});
