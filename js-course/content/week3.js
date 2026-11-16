/* Week 3: Async and the runtime — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js. */
JSC.registerWeek({w:3,revision:[
"<b>JavaScript runs one task at a time</b> (run-to-completion). Async work is done by the host (timers, network) and queued back as tasks.",
"<b>Event loop turn:</b> run one task, then drain the <i>entire</i> microtask queue, then (if due) run rendering steps. Then the next task.",
"<b>Microtasks:</b> promise reactions, <code>queueMicrotask</code>, MutationObserver. <b>Tasks:</b> timers, events, message, I/O callbacks.",
"<b>Promise:</b> pending → fulfilled/rejected once. <code>then</code> always returns a new promise; throwing inside becomes a rejection; the executor runs synchronously, reactions run async.",
"<b>await</b> pauses only the async function; the rest resumes in a microtask. <code>forEach(async …)</code> does not wait; use <code>for...of</code> or <code>Promise.all</code>.",
"<b>Combinators:</b> all (fail-fast), allSettled (never rejects), race (first settle), any (first fulfill, AggregateError if none).",
"<b>Timers</b> are minimum delays, nested timers clamp to ≥4 ms, hidden tabs are throttled. Use rAF for visuals and break long tasks to keep INP low.",
"<b>Workers</b> have their own event loop and no DOM; messages are structured-cloned, buffers can be transferred zero-copy.",
"<b>Backpressure</b> in streams stops fast producers from flooding slow consumers. <b>AbortController</b> cancels fetch, listeners and your own async work.",
"<b>Errors:</b> try/catch only sees synchronous throws and awaited rejections; always handle rejections; <code>finally</code> runs last and can override a return; use <code>cause</code> to chain errors."
],days:[
{n:11,title:"Callbacks and Promises",goal:"See why callbacks became painful and how Promises fix control flow and error handling.",topics:[
{id:"d11-callbacks",title:"Callbacks and the problem they solve",
eli5:`<p>At a busy restaurant you leave your phone number and the host <b>calls you back</b> when your table is ready. You don't stand there blocking the door. A callback is "here is my number; call me when you're done".</p><p>It works fine for one thing. But "call me when the table is ready, then call the cab when I finish eating, then call my friend when the cab arrives" becomes a tangle of phone numbers inside phone numbers.</p>`,
why:`<p>JavaScript runs on one thread, so waiting for a network response or a timer must not freeze the page. The host does the waiting and later calls a function you handed it: a <b>callback</b>. It was the only async tool until Promises (ES2015).</p>`,
tech:`<ul class="pts"><li>A callback is just a function passed to another function to be called later. Callbacks can be <b>synchronous</b> (<code>arr.map(fn)</code>) or <b>asynchronous</b> (<code>setTimeout(fn)</code>, event handlers).</li><li>Node's convention: <b>error-first</b> callbacks <code>(err, result) =&gt; {}</code>.</li><li><b>Callback hell:</b> sequential async steps nest deeper and deeper (the "pyramid of doom"), error handling is repeated at every level, and loops/parallelism are hard to write.</li><li><b>Inversion of control:</b> you hand your continuation to code you don't control. It might call it twice, never, too early (synchronously), or too late. Promises guarantee once, always async.</li><li>A function that sometimes calls its callback synchronously and sometimes asynchronously ("releasing Zalgo") makes behavior unpredictable; always be consistently async.</li></ul>`,
diagram:{html:flow([["getUser(id, cb)"],["cb: getOrders(user, cb2)","nest 1","w"],["cb2: getItems(order, cb3)","nest 2","w"],["cb3: …","nest 3, errors handled 3 times","r"]]),steps:["Each step needs the previous step's result, so it is nested inside the previous callback.","Every level needs its own error check.","Promises flatten this into a chain: <code>getUser().then(getOrders).then(getItems).catch(handle)</code>."]},
ex:[{t:"Sync vs async callbacks, and pyramids",code:`console.log("1 start");
[1, 2].forEach((n) => console.log("sync callback", n));
setTimeout(() => console.log("async callback"), 0);
console.log("2 end");
const wait = (ms, cb) => setTimeout(cb, ms);
wait(5, () => { console.log("step A"); wait(5, () => { console.log("step B"); wait(5, () => console.log("step C")); }); });`},
{t:"Error-first callbacks and a once guard",code:`function read(name, cb){
  setTimeout(() => name ? cb(null, "data:" + name) : cb(new Error("no name")), 1);
}
read("x", (err, data) => console.log(err, data));
read("", (err, data) => console.log(err.message, data));
const once = (cb) => { let called = false; return (...a) => { if (called) return; called = true; cb(...a); }; };
const safe = once((v) => console.log("cb", v));
safe(1); safe(2);`}],
browser:`<p>DOM events (<code>addEventListener</code>), <code>setTimeout</code>, <code>XMLHttpRequest</code> and <code>IntersectionObserver</code> are all callback APIs. Node's older APIs (<code>fs.readFile</code>) are callback-based; <code>util.promisify</code> and <code>fs/promises</code> wrap them.</p>`,
gotchas:[`An error thrown inside an async callback can't be caught by a surrounding <code>try/catch</code>; the stack that scheduled it is gone.`,`Calling a callback more than once (or never) is easy to do by accident in branches.`,`<code>this</code> is lost when passing a method as a callback.`,`Callbacks that mutate shared state in a race produce order-dependent bugs.`],
best:[`Prefer Promises/async-await for new code; wrap legacy callback APIs with <code>util.promisify</code> or <code>new Promise</code>.`,`Name callbacks and extract them to flatten nesting; always handle the error argument first.`],
iq:[["fresher","What is a callback?","A function passed to another function to be invoked later, either synchronously (map) or after an async operation (setTimeout)."],["mid","What is callback hell and how do you avoid it?","Deeply nested callbacks for sequential async steps. Avoid with named functions, Promises, and async/await."],["senior","What is inversion of control in callbacks?","You give your continuation to third-party code, trusting it to call it exactly once and asynchronously. Promises remove that trust problem by owning the resolution."]],
practice:[`Convert <code>fs.readFile</code> to a promise-returning function using <code>new Promise</code>.`,`Write <code>parallel(tasks, done)</code> using only callbacks.`],
teach:`<p>"A callback is 'call me back when you're done'. It's simple, but chaining many of them nests deeper and deeper and error handling gets repeated. Promises fix that."</p>`},

{id:"d11-promises",title:"Promises",
eli5:`<p>A Promise is a <b>buzzer</b> from a food stall. When you order, you get the buzzer right away (the promise). The food isn't ready yet (pending). Later the buzzer either <b>rings with your food</b> (fulfilled) or <b>rings with "sorry, sold out"</b> (rejected). Once it has rung, it never rings differently. You can say what to do for each: "when it rings, eat" (<code>then</code>), "if sold out, order something else" (<code>catch</code>).</p>`,
why:`<p>A Promise is an object representing a future value. It standardizes async results so chaining, error propagation and combining work the same everywhere, and it guarantees the reaction runs exactly once and always asynchronously.</p>`,
tech:`<ul class="pts"><li><b>States:</b> pending → fulfilled(value) or rejected(reason). Settling happens once and is permanent.</li><li><code>new Promise((resolve, reject) =&gt; {...})</code>: the <b>executor runs synchronously</b>. Calls after the first resolve/reject are ignored. A throw inside the executor rejects the promise.</li><li><code>p.then(onFul, onRej)</code> <b>always returns a new promise</b>. Its result: the callback's return value (or the settled value of a returned promise/thenable), or a rejection if the callback throws. A missing handler passes the value/error through.</li><li><code>catch(fn)</code> = <code>then(undefined, fn)</code>. <code>finally(fn)</code> runs for either outcome, receives no argument, and passes the original result through (unless it throws).</li><li>Reactions run as <b>microtasks</b>, never synchronously, even for an already-settled promise.</li><li>Unhandled rejections raise <code>unhandledrejection</code> (browser) or <code>process</code> 'unhandledRejection' (Node ≥15 crashes by default).</li></ul>`,
diagram:{html:flow([["pending","no value yet"],["fulfilled","value","g"],["rejected","reason","r"]],{plain:true})+`<p style="text-align:center;margin:12px 0 0">pending → <b>fulfilled</b> or pending → <b>rejected</b> (one way, once)</p>`+flow([["p.then(f)"],["returns new promise p2","chain continues","w"],["f returns v → p2 fulfills with v"],["f throws e → p2 rejects with e","r"]]),steps:["A promise starts pending and moves exactly once to fulfilled or rejected.","<code>then</code> doesn't modify the original promise; it creates a new one that depends on the handler's outcome.","Returning a promise from a handler makes the next link wait for it (flattening).","Errors skip <code>then</code> handlers until a <code>catch</code>/rejection handler is found."]},
ex:[{t:"Chaining, recovery and finally",code:`Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => { throw new Error("boom " + x); })
  .then(() => console.log("skipped"))
  .catch((e) => { console.log("caught", e.message); return 10; })
  .finally(() => console.log("finally (value passes through)"))
  .then((v) => console.log("final value", v));`},
{t:"Executor is synchronous; reactions are not",code:`console.log("1");
const p = new Promise((resolve) => { console.log("2 executor"); resolve("done"); resolve("ignored"); });
p.then((v) => console.log("4", v));
console.log("3");
const wrap = (ms) => new Promise((res) => setTimeout(res, ms, "waited " + ms));
wrap(5).then(console.log);`}],
browser:`<p><code>fetch</code>, <code>navigator.clipboard</code>, <code>Cache</code>, <code>IndexedDB</code> wrappers and most modern Web APIs return promises. Listen for <code>window.addEventListener("unhandledrejection", ...)</code> to report missed errors.</p>`,
gotchas:[`Forgetting <code>return</code> inside a <code>then</code> loses the value and breaks the chain ordering.`,`<code>.then(a).catch(b)</code> is not the same as <code>.then(a, b)</code>: the latter doesn't catch errors thrown in <code>a</code>.`,`Creating a promise "just to wrap" another promise (the explicit construction anti-pattern) loses errors unless forwarded.`,`A rejected promise with no handler by the end of the microtask checkpoint is reported as unhandled even if a handler is attached later.`,`<code>resolve(otherPromise)</code> adopts its state (takes extra microtask ticks).`],
best:[`Always return promises from handlers; end chains with <code>catch</code> (or use async/await with try/catch).`,`Reject with <code>Error</code> objects, not strings.`,`Don't mix callbacks and promises; promisify once at the edge.`],
iq:[["fresher","What are the states of a Promise?","Pending, fulfilled, rejected. Fulfilled and rejected are 'settled' and final."],["mid","What does then return?","A new promise resolved with the handler's return value (or adopting a returned promise), rejected if the handler throws."],["mid","Difference between then(a).catch(b) and then(a, b)?","The catch version also handles errors thrown by a; the two-argument form only handles rejection of the original promise."],["senior","Write a minimal Promise implementation.","Keep state, value and a handlers array; resolve/reject settle once and schedule handlers with queueMicrotask; then returns a new promise and wraps each handler call in try/catch; resolve must handle thenables (the Promise Resolution Procedure)."]],
practice:[`Wrap <code>setTimeout</code> into a <code>sleep(ms)</code> promise.`,`Predict the output order of a chain with throw, catch and finally, then verify.`],
teach:`<p>"A Promise is a buzzer: it rings once, with food or with an apology. then makes a new buzzer so you can chain steps; an error skips ahead until someone catches it."</p>`}
],quiz:[
{code:`console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,ans:`A D C B`,why:`Synchronous code first (A, D). Then microtasks (promise reaction C). Timer callbacks are tasks and run later (B).`},
{code:`Promise.resolve(1)
  .then(x => x + 1)
  .then(x => { throw x; })
  .catch(e => e * 10)
  .finally(() => console.log('fin'))
  .then(v => console.log(v));`,ans:`fin, then 20`,why:`1 → 2 → thrown 2 → catch returns 20 → finally runs and passes 20 through → final then logs 20.`}]},

{n:12,title:"async/await and patterns",goal:"Write readable async code and know when to run things in parallel, with limits, retries and timeouts.",topics:[
{id:"d12-async",title:"async and await",
eli5:`<p>Reading a book, you put a <b>bookmark</b> in when the doorbell rings, go answer it, and when you're back you continue from the bookmark. <code>await</code> is the bookmark: this function pauses there, while the rest of the program keeps running, and it continues when the answer arrives.</p>`,
why:`<p>Promise chains are better than callbacks but still read like plumbing. <code>async/await</code> (ES2017) lets you write asynchronous steps top to bottom with normal <code>try/catch</code>, on top of promises.</p>`,
tech:`<ul class="pts"><li>An <code>async</code> function <b>always returns a promise</b>: returned values are wrapped, thrown errors become rejections.</li><li><code>await x</code> pauses <b>only that function</b> (not the thread). Execution up to the first <code>await</code> is synchronous. The continuation is queued as a microtask when the awaited promise settles; even <code>await 5</code> yields to the microtask queue.</li><li>Errors from awaited rejections can be handled with <code>try/catch/finally</code>.</li><li><b>Sequential vs parallel:</b> <code>await a(); await b();</code> runs one after another; start both first, then await: <code>const [x, y] = await Promise.all([a(), b()])</code>.</li><li>Top-level <code>await</code> works in ES modules (it delays modules that import it).</li><li><code>for await (const x of asyncIterable)</code> consumes async iterables. <code>return await p</code> inside <code>try</code> is needed to catch p's rejection there.</li></ul>`,
diagram:{html:flow([["async function run()","sync part runs"],["await fetchData()","function pauses","w"],["caller continues","rest of program runs","g"],["promise settles","continuation queued as microtask"],["run() resumes after await","w"]]),steps:["The function runs normally until the first <code>await</code>.","At <code>await</code> it returns a pending promise to its caller; the call stack unwinds.","Other code runs while the awaited operation completes elsewhere.","When it settles, the rest of the function is scheduled as a microtask and continues with the result (or throws the rejection)."]},
ex:[{t:"Order of execution and errors",code:`async function a(){ console.log("a1"); await b(); console.log("a2"); }
async function b(){ console.log("b"); }
console.log("start");
a();
Promise.resolve().then(() => console.log("p"));
console.log("end");
(async () => {
  try { await Promise.reject(new Error("x")); }
  catch (e) { console.log("caught", e.message); }
  finally { console.log("finally"); }
})();`},
{t:"Sequential, parallel and the forEach trap",code:`const sleep = (ms, v) => new Promise((r) => setTimeout(r, ms, v));
(async () => {
  let t = performance.now();
  await sleep(30); await sleep(30);
  const seq = performance.now() - t;
  t = performance.now();
  await Promise.all([sleep(30), sleep(30)]);
  const par = performance.now() - t;
  console.log("sequential took at least 60 ms:", seq >= 58);
  console.log("parallel was faster than sequential:", par < seq);
  [1, 2].forEach(async (n) => { await sleep(5); console.log("item", n); });
  console.log("after forEach (did not wait)");
  await sleep(20);
  for (const n of [3, 4]) { await sleep(5); console.log("for-of item", n); }
})();`}],
browser:`<p>Every <code>await</code> returns control to the browser, which can render and handle input, so long <code>await</code> chains keep the page responsive; a long synchronous loop inside an async function does not. In Node, top-level await requires ESM (<code>.mjs</code> or <code>"type":"module"</code>).</p>`,
gotchas:[`<code>array.forEach(async ...)</code> fires everything and doesn't wait; use <code>for...of</code> (sequential) or <code>Promise.all(arr.map(...))</code> (parallel).`,`Accidentally serial code: awaiting inside a loop when iterations are independent.`,`Forgetting <code>await</code> returns a pending promise (truthy!), so <code>if (isAllowed())</code> is always true.`,`An async function that throws before its first await still returns a rejected promise (never throws synchronously).`,`Unawaited promises: errors become unhandled rejections.`,`<code>await</code> in a non-async function (or old script) is a syntax error.`],
best:[`Run independent work in parallel with <code>Promise.all</code>; await sequentially only when steps depend on each other.`,`Wrap awaited code in <code>try/catch</code> at a boundary where you can act on the error.`,`Use lint rules: no-floating-promises, no-await-in-loop (with judgment), require-await.`],
iq:[["fresher","What does async return?","A promise, always."],["mid","Why does 'after forEach' print before the items?","forEach ignores the promises returned by an async callback, so it doesn't wait."],["mid","Predict: start / a() / Promise.then / end.","start, a1, b, end, a2, p. a() runs synchronously until its await; the continuation was queued before the p reaction."],["senior","How does await work under the hood?","It wraps the operand in a promise (PromiseResolve), attaches reaction jobs for the continuation, and the generator-like function state is suspended and resumed from a microtask."]],
practice:[`Rewrite a three-step promise chain using async/await with try/catch/finally.`,`Fix a loop that fetches 50 URLs one by one so it runs 5 at a time.`],
teach:`<p>"await is a bookmark: the function pauses there and the rest of the program carries on. When the answer arrives it continues from the bookmark. forEach doesn't wait for async callbacks, a for loop does."</p>`},

{id:"d12-combinators",title:"Promise combinators and async patterns",
eli5:`<p>Imagine four friends each bring a pizza. <b>all</b>: "start the party when everyone has arrived; cancel if anyone cancels". <b>allSettled</b>: "tell me who came and who didn't". <b>race</b>: "the first to arrive wins". <b>any</b>: "I just need the first pizza that actually arrives".</p>`,
why:`<p>Real apps coordinate many async tasks at once: load several resources, stop at the first response, limit concurrency, retry flaky calls, and time out slow ones.</p>`,
tech:`<table><tr><th>Method</th><th>Fulfills when</th><th>Rejects when</th></tr><tr><td>Promise.all</td><td>all fulfill (array in input order; [] resolves at once)</td><td>first rejection (fail-fast)</td></tr><tr><td>Promise.allSettled</td><td>all settle (array of {status, value|reason}), never rejects</td><td>never</td></tr><tr><td>Promise.race</td><td>first to settle fulfills</td><td>first to settle rejects</td></tr><tr><td>Promise.any</td><td>first fulfillment</td><td>all reject (AggregateError)</td></tr></table>
<ul class="pts"><li><code>Promise.withResolvers()</code> (ES2024) returns <code>{promise, resolve, reject}</code> (the "deferred" pattern). <code>Promise.try(fn)</code> (ES2025) turns a sync-or-async function into a promise safely. <code>Array.fromAsync</code> (ES2026) collects an async iterable.</li><li><b>Concurrency pool:</b> start N workers that pull from a shared queue.</li><li><b>Retry with exponential backoff</b> (plus jitter) for transient failures; <b>timeout</b> via <code>Promise.race</code> with a timer or <code>AbortSignal.timeout(ms)</code>.</li><li>Promise.all does not cancel the losers; use <code>AbortController</code> to stop their work.</li></ul>`,
diagram:{html:lanes([["Promise.all",["A ✓ B ✓ C ✓ → [A,B,C]","A ✓ B ✗ → rejects with B's error now"]],["allSettled",["always an array of outcomes","good for 'best effort' batches"]],["race",["first settled wins","use for timeouts"]],["any",["first success wins","all fail → AggregateError"]]]),steps:["Choose the combinator by the failure policy you want, not by habit.","All of them accept any iterable of promises/values and run their inputs concurrently.","None of them cancels pending work; pair with AbortController when cancellation matters."]},
ex:[{t:"The four combinators",code:`const sleep = (ms, v, fail) => new Promise((res, rej) => setTimeout(fail ? rej : res, ms, v));
(async () => {
  console.log(await Promise.all([sleep(10, "a"), sleep(5, "b"), 3]));
  console.log(await Promise.allSettled([sleep(5, "ok"), sleep(5, "no", true)]));
  console.log(await Promise.race([sleep(20, "slow"), sleep(5, "fast")]));
  console.log(await Promise.any([sleep(5, "e1", true), sleep(10, "winner")]));
  try { await Promise.any([sleep(5, "x", true), sleep(5, "y", true)]); }
  catch (e) { console.log(e.constructor.name, e.errors); }
  console.log(await Promise.all([]));
})();`},
{t:"Concurrency pool, retry and timeout",code:`const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function pool(tasks, limit){
  const results = []; let i = 0, running = 0, maxRunning = 0;
  async function worker(){
    while (i < tasks.length) {
      const idx = i++; running++; maxRunning = Math.max(maxRunning, running);
      results[idx] = await tasks[idx](); running--;
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return { results, maxRunning };
}
async function retry(fn, tries = 3, delay = 2){
  for (let n = 1; ; n++) {
    try { return await fn(n); } catch (e) { if (n >= tries) throw e; await sleep(delay * 2 ** n); }
  }
}
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
(async () => {
  const tasks = [1, 2, 3, 4, 5].map((n) => async () => { await sleep(5); return n * n; });
  console.log(await pool(tasks, 2));
  console.log(await retry(async (n) => { if (n < 3) throw new Error("flaky"); return "ok after " + n; }));
  try { await withTimeout(sleep(50), 10); } catch (e) { console.log(e.message); }
  const { promise, resolve } = Promise.withResolvers ? Promise.withResolvers() : (() => { let resolve; const promise = new Promise((r) => (resolve = r)); return { promise, resolve }; })();
  setTimeout(() => resolve("resolved from outside"), 5);
  console.log(await promise);
})();`}],
gotchas:[`<code>Promise.all</code> rejects early but the other tasks keep running.`,`<code>Promise.race([])</code> never settles; <code>Promise.any([])</code> rejects immediately.`,`Retrying non-idempotent requests (payments) can duplicate effects; use idempotency keys.`,`Backoff without jitter makes many clients retry at the same moment (thundering herd).`,`A <code>Promise.race</code> timeout doesn't cancel the slow work; use <code>AbortSignal</code>.`],
best:[`Pick allSettled for batch jobs where partial success is fine; all for all-or-nothing.`,`Bound concurrency for network and CPU work; add jitter to retries; use <code>AbortSignal.timeout()</code> for deadlines.`],
iq:[["mid","all vs allSettled?","all fails fast on the first rejection and returns values; allSettled waits for everything and reports each outcome without rejecting."],["senior","Implement Promise.all.","Return a new Promise; if the iterable is empty resolve []; for each item Promise.resolve(item).then(v => store at index, count down and resolve when zero, reject on first error)."],["senior","Implement a concurrency limiter.","Maintain a queue and N workers that loop pulling the next task until empty; collect results by index."],["architect","How do you design retries safely?","Retry only idempotent or keyed operations on transient errors (network, 429/503), use exponential backoff with jitter and a max budget, honor Retry-After, add circuit breaking, and log/measure attempts."]],
practice:[`Implement <code>Promise.all</code>, <code>allSettled</code> and <code>race</code> from scratch.`,`Build <code>fetchWithRetry(url, {tries, timeoutMs})</code> using AbortController.`],
teach:`<p>"all is 'everyone or nobody', allSettled is 'give me the report', race is 'first one done', any is 'first one that succeeds'. None of them cancels the others, so use AbortController for that."</p>`}
],quiz:[
{code:`(async () => {
  try { await Promise.reject(new Error('x')); }
  catch (e) { console.log('caught', e.message); }
  finally { console.log('finally'); }
})();
console.log('sync');`,ans:`sync, caught x, finally`,why:`The async function runs synchronously until await, then the rest of the program (sync) runs. The rejection is handled in a microtask afterwards.`},
{code:`const sleep = (ms) => new Promise(r => setTimeout(r, ms));
[1, 2].forEach(async (n) => { await sleep(10); console.log('item', n); });
console.log('after forEach');`,ans:`after forEach, item 1, item 2`,why:`forEach doesn't wait for the promises returned by the async callbacks.`}]},

{n:13,title:"The event loop",goal:"Be able to explain and predict the order of any mix of sync code, promises and timers.",topics:[
{id:"d13-eventloop",title:"The event loop",
eli5:`<p>Picture a kitchen with <b>one chef</b>. The chef can only cook one dish at a time and never walks away mid-dish. Orders (clicks, timers, network replies) pile up on a <b>ticket rail</b>. The chef takes one ticket, cooks it fully, then reads all the <b>urgent sticky notes</b> (promise follow-ups) before the next ticket. Every so often a <b>waiter shows the plates</b> to guests (the screen updates). If the chef spends an hour on one dish, nobody gets served or even sees a plate.</p>`,
why:`<p>JavaScript has one main thread so programs don't need locks. The <b>event loop</b> lets that single thread handle many pending things by never waiting: slow work (timers, network) is done by the host, and results come back as queued jobs.</p>`,
tech:`<p>Components: the <b>call stack</b> (what is running now), <b>Web APIs/host</b> (timers, network, DOM events do their waiting off the main thread), <b>task queues</b> (macrotasks: timers, input events, message events, network callbacks; browsers have several queues with priorities) and the <b>microtask queue</b> (promise reactions, <code>queueMicrotask</code>, MutationObserver).</p>
<p>One turn of the HTML Standard's event loop:</p><ol><li>Pick the oldest task from a task queue and run it to completion.</li><li><b>Microtask checkpoint:</b> run <i>all</i> microtasks until the queue is empty, including ones queued while draining.</li><li>If it is time to render (usually ~every 16.7 ms at 60 Hz, and only if the document is visible): run <code>requestAnimationFrame</code> callbacks, then style, layout, paint, composite.</li><li>Repeat.</li></ol>
<ul class="pts"><li><b>Run-to-completion:</b> nothing interrupts a running task, so a long task blocks input and rendering.</li><li>A microtask that keeps queuing microtasks starves rendering and timers.</li><li><code>requestAnimationFrame</code> is neither a task nor a microtask; it runs in the "update the rendering" step.</li><li>Workers each have their own event loop; Node's loop has phases (Day 26).</li></ul>`,
diagram:{html:lanes([["Call stack",["main()","handler()","(one frame at a time)"]],["Web APIs / host",["timer: 100 ms","fetch in flight","DOM event listeners"]],["Task queue (macrotasks)",["timer callback","click handler","message event"]],["Microtask queue",["promise.then callback","queueMicrotask(fn)"]],["Rendering",["rAF callbacks","style → layout → paint"]]]),steps:["The loop runs one <b>task</b> from the task queue until the stack is empty.","It then runs <b>every microtask</b> until the microtask queue is empty.","If the browser decides to render, it runs rAF callbacks and updates the screen.","It takes the next task. Timers and network results always re-enter as new tasks, so they wait their turn."]},
ex:[{t:"Order of sync, microtasks and tasks",code:`console.log("1 sync");
setTimeout(() => console.log("5 task (timer)"), 0);
Promise.resolve().then(() => console.log("3 microtask (promise)"));
queueMicrotask(() => console.log("4 microtask (queueMicrotask)"));
console.log("2 sync");`},
{t:"A timer cannot interrupt running code",code:`const start = performance.now();
setTimeout(() => {
  const waited = performance.now() - start;
  console.log("timer asked for 0 ms, ran after >= 80 ms:", waited >= 80);
}, 0);
while (performance.now() - start < 80) { /* busy: blocks the loop */ }
console.log("busy loop finished first");`}],
browser:`<p>While a task runs, the browser can't handle clicks or paint (INP and "page is unresponsive" come from long tasks over 50 ms). Chrome DevTools' Performance panel shows tasks as bars; the main thread flame chart lets you find long ones. Hidden tabs throttle timers and skip rendering.</p>`,
gotchas:[`"Macrotask" isn't a spec term (the spec says task), but it's the common interview word.`,`<code>setTimeout(fn, 0)</code> is not immediate: it's at least one task away and subject to clamping (≥4 ms after 5 nested levels).`,`An endless microtask loop (<code>function f(){ Promise.resolve().then(f) }</code>) freezes the page; an endless timer loop doesn't.`,`<code>requestAnimationFrame</code> doesn't run in hidden tabs.`,`In Node, <code>process.nextTick</code> runs before promise microtasks, and the phases differ (Day 26).`],
best:[`Keep tasks short (under ~50 ms): chunk work, use workers for CPU-heavy code, and yield with <code>scheduler.yield()</code> or <code>setTimeout</code>.`,`Use <code>requestAnimationFrame</code> for visual updates and microtasks for "after this synchronous code, before anything else" work.`],
iq:[["fresher","Is JavaScript single-threaded?","The language runs JS on a single main thread per realm; the host (browser/Node) does async work on other threads and queues the results. Workers give extra threads with separate event loops."],["mid","Microtask vs macrotask?","Microtasks (promise reactions, queueMicrotask) run right after the current task and are drained fully before the next task or render. Macrotasks (timers, events, I/O) run one per loop turn."],["senior","Where does rendering happen in the loop?","After a task and its microtasks, if the browser decides it is time to render: rAF callbacks, then style, layout, paint, composite."],["senior","What happens if microtasks keep scheduling microtasks?","The microtask queue never empties, so rendering, timers and input are starved and the page freezes."]],
practice:[`Draw the five lanes for a snippet you write and trace it step by step.`,`Find a long task in DevTools Performance on a real site.`],
teach:`<p>"One chef, a ticket rail, and urgent sticky notes. The chef finishes one ticket, then handles every sticky note, then maybe lets the waiter show the plates. Nothing interrupts the chef, so a slow dish blocks everyone."</p>`},

{id:"d13-puzzles",title:"Microtasks vs macrotasks: output puzzles",
eli5:`<p>Think of cutting in line with a VIP pass. Promise follow-ups have a VIP pass: they go before the next normal ticket. But two VIPs from two different groups take turns, one each, so groups alternate.</p>`,
why:`<p>"What does this print?" is the most common JavaScript interview question. If you can apply three rules reliably, you can answer any of them.</p>`,
tech:`<p><b>The three rules:</b></p><ol><li>Run all synchronous code first (the current task).</li><li>Then drain the microtask queue (promise reactions, queueMicrotask, await continuations), in FIFO order, including newly added ones.</li><li>Then take the next task (timers by delay and order, events), and repeat from rule 1.</li></ol>
<ul class="pts"><li>The Promise executor and the code before the first <code>await</code> are synchronous.</li><li>Each <code>.then</code> link adds one microtask tick; two chains advance <b>alternately</b>.</li><li><code>await p</code> (native promise) continues after about one microtask tick; <code>await nonPromise</code> also one tick.</li><li>After <b>each</b> timer task, microtasks are drained before the next timer task.</li></ul>`,
diagram:{html:flow([["sync code","everything on the stack"],["microtasks","drain until empty","w"],["one task","timer / event","g"],["microtasks again","w"],["next task…"]]),steps:["Always finish the current synchronous run first.","Drain microtasks completely.","Take one task, run it, and drain microtasks again.","Repeat. The pattern is: sync, micro*, task, micro*, task, micro*…"]},
ex:[{t:"Puzzle 1: promise chains interleave",code:`Promise.resolve().then(() => console.log(1)).then(() => console.log(2)).then(() => console.log(3));
Promise.resolve().then(() => console.log("A")).then(() => console.log("B"));`,note:"Expected: 1 A 2 B 3."},
{t:"Puzzle 2: microtasks drain between timers",code:`setTimeout(() => { console.log("t1"); Promise.resolve().then(() => console.log("m1")); }, 0);
setTimeout(() => console.log("t2"), 0);
new Promise((r) => { console.log("exec"); r(); }).then(() => console.log("then"));
console.log("sync");`,note:"Expected: exec, sync, then, t1, m1, t2."},
{t:"Puzzle 3: async/await ordering",code:`async function a(){ console.log("a1"); await b(); console.log("a2"); }
async function b(){ console.log("b"); }
console.log("start");
setTimeout(() => console.log("timeout"), 0);
a();
new Promise((r) => { console.log("p1"); r(); }).then(() => console.log("p2"));
console.log("end");`,note:"Expected: start, a1, b, p1, end, a2, p2, timeout."}],
gotchas:[`Returning a promise from <code>then</code> adds extra ticks (the thenable job), so chains that return promises lag behind plain ones.`,`Interview answers differ between "old" await (3 ticks) and the modern optimized await (1 tick); the modern behavior has been standard since ES2019.`,`Timer order: same delay → insertion order; different delays → shorter first (but clamping can reorder tiny differences).`,`<code>setTimeout</code> inside a microtask still waits for the next task.`],
best:[`When explaining, narrate the three rules aloud and keep a table with columns: sync, microtasks, tasks.`],
iq:[["mid","Print order for the three puzzles above?","1 A 2 B 3; exec sync t1 m1 t2 (with then before t1); start a1 b p1 end a2 p2 timeout."],["senior","Why does a2 print before p2?","The continuation of await b() was queued as a microtask when a() ran, before the p2 reaction was queued."],["senior","Why do two promise chains alternate?","Each then link queues its reaction only after the previous settles, so reactions from different chains interleave in FIFO order."]],
practice:[`Write five of your own puzzles mixing async/await, timers and queueMicrotask; predict, then run.`],
teach:`<p>"Rule: sync first, then all promise follow-ups, then one timer, then promise follow-ups again. Two promise chains take turns."</p>`}
],quiz:[
{code:`console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
queueMicrotask(() => console.log(4));
console.log(5);`,ans:`1 5 3 4 2 (one per line)`,why:`Sync: 1, 5. Microtasks in order queued: 3, 4. Then the timer task: 2.`},
{code:`new Promise((resolve) => { console.log('A'); resolve(); console.log('B'); })
  .then(() => console.log('C'));
console.log('D');`,ans:`A B D C`,why:`The executor is synchronous, and resolve() doesn't stop it; the then callback is a microtask that runs after the current script.`}]},

{n:14,title:"Timers and workers",goal:"Schedule work correctly and use real parallelism when CPU-heavy work threatens responsiveness.",topics:[
{id:"d14-timers",title:"Timers and scheduling",
eli5:`<p><code>setTimeout</code> is an <b>alarm clock that says "no earlier than this"</b>, not "exactly then". If the chef is busy when the alarm rings, you wait. <code>requestAnimationFrame</code> is "tell me right before the next picture is drawn", perfect for animation.</p>`,
why:`<p>Scheduling is how you delay work, repeat it, and break up long jobs so the page stays responsive. The different APIs have different guarantees, so picking the right one matters for performance.</p>`,
tech:`<table><tr><th>API</th><th>Runs</th><th>Use for</th></tr><tr><td>queueMicrotask / promise</td><td>after current task, before anything else</td><td>small follow-up work</td></tr><tr><td>setTimeout(fn, ms)</td><td>a task, ≥ ms later</td><td>delays, yielding</td></tr><tr><td>setInterval(fn, ms)</td><td>repeating task, can drift or pile up</td><td>polling (prefer recursive setTimeout)</td></tr><tr><td>requestAnimationFrame</td><td>before next paint (~60/120 Hz), paused in hidden tabs</td><td>visual updates</td></tr><tr><td>requestIdleCallback</td><td>when idle (not in Safari)</td><td>low-priority work</td></tr><tr><td>scheduler.postTask / scheduler.yield</td><td>prioritized tasks / yield and continue (Chromium)</td><td>splitting long tasks</td></tr></table>
<ul class="pts"><li>Delay is a <b>minimum</b>. Nested timers (depth &gt; 5) clamp to ≥ 4 ms; hidden tabs throttle to about 1 per second (and heavier "intensive throttling" for chained timers after minutes in Chrome).</li><li><code>setInterval</code> ignores how long the callback took; if it takes longer than the interval, runs bunch up. Recursive <code>setTimeout</code> schedules the next run after finishing.</li><li>Always keep the id and <code>clearTimeout</code>/<code>cancelAnimationFrame</code> on cleanup.</li></ul>`,
diagram:{html:flow([["task A runs 120 ms"],["timer (10 ms) due during A","waits in queue","w"],["A ends, microtasks drain"],["timer callback runs at ~120 ms","not 10 ms","r"]]),steps:["The timer is due after 10 ms, but the single thread is busy with task A.","The host puts the callback in the task queue as soon as it is due.","It runs only when the stack is empty and earlier work is done, so the real delay is longer."]},
ex:[{t:"Timer order and chunking long work",code:`setTimeout(() => console.log("t10"), 10);
setTimeout(() => console.log("t0"), 0);
setTimeout(() => console.log("t5"), 5);
(async () => {
  let total = 0, yields = 0;
  const items = Array.from({ length: 5000 }, (_, i) => i);
  for (let i = 0; i < items.length; i += 1000) {
    for (const n of items.slice(i, i + 1000)) total += n;
    yields++; await new Promise((r) => setTimeout(r, 0));   // let the browser breathe
  }
  console.log("sum", total, "chunks", yields);
})();`},
{t:"Recursive setTimeout vs setInterval",code:`let runs = 0;
function tick(){
  runs++;
  if (runs < 3) setTimeout(tick, 5);          // next run scheduled after this one finishes
  else console.log("recursive timeout ran", runs, "times");
}
tick();
let n = 0;
const id = setInterval(() => { if (++n === 3) { clearInterval(id); console.log("interval ran", n, "times"); } }, 5);`}],
browser:`<p>Animations: <code>requestAnimationFrame(step)</code> and compute from the timestamp it passes, not from an assumed 16.7 ms. <code>setTimeout</code> animations stutter because they are not aligned with the display. <code>document.hidden</code> / the Page Visibility API tells you when to pause work. Node has <code>setImmediate</code> and <code>process.nextTick</code> (Day 26).</p>`,
gotchas:[`<code>setTimeout(fn(), 100)</code> calls fn immediately and schedules its return value; pass <code>fn</code> or <code>() =&gt; fn()</code>.`,`Timers in hidden tabs fire late; don't use them for accurate clocks (use <code>Date.now()</code>/<code>performance.now()</code> deltas).`,`Intervals that return a promise (async callbacks) can overlap; guard with a flag or use recursive timeouts.`,`Forgetting to clear timers in components/pages leaks memory and runs stale callbacks.`,`<code>setTimeout</code> max delay is about 24.8 days (2<sup>31</sup>−1 ms); larger values fire immediately.`],
best:[`Prefer recursive <code>setTimeout</code> to <code>setInterval</code> for polling; always store and clear ids.`,`Use rAF for anything visual and cancel it on teardown.`],
iq:[["fresher","Is setTimeout(fn, 1000) exact?","No, it's a minimum delay; the callback runs once the delay has passed and the main thread is free."],["mid","setTimeout vs setInterval vs rAF?","Timeout: one delayed task. Interval: repeating, can drift/stack. rAF: once before the next paint, synced to the display, paused in hidden tabs."],["senior","How do you keep the UI responsive during heavy processing?","Chunk the work and yield between chunks (setTimeout/scheduler.yield), move CPU-bound work to a Web Worker, and avoid long synchronous tasks."]],
practice:[`Build a drift-free clock using <code>performance.now()</code> and recursive timeouts.`,`Write <code>sleep</code>, <code>debounce</code> and <code>throttle</code> (Day 23).`],
teach:`<p>"A timer is an alarm that says 'no earlier than'. If the chef is busy, you wait. For drawing, use requestAnimationFrame: it rings right before the screen refreshes."</p>`},

{id:"d14-workers",title:"Web Workers and concurrency",
eli5:`<p>The chef is busy, so you hire a <b>helper in another room</b> to chop a mountain of onions. You pass notes under the door (messages). The helper can't touch the dining room (no DOM), but the chef keeps serving guests while the helper works.</p>`,
why:`<p>The main thread handles UI, so a heavy calculation freezes the page. Workers provide real parallel threads with separate memory, keeping the page responsive.</p>`,
tech:`<ul class="pts"><li><b>Dedicated Worker</b> (<code>new Worker(url, {type:"module"})</code>), <b>Shared Worker</b> (shared across tabs), <b>Service Worker</b> (network proxy, offline, push; event-driven, not for computation), plus <b>Worklets</b>.</li><li>A worker has its own global (<code>self</code>), event loop and heap. <b>No DOM</b>; it has <code>fetch</code>, timers, IndexedDB, <code>OffscreenCanvas</code>, WebAssembly.</li><li><b>Communication:</b> <code>postMessage(data)</code> uses the <b>structured clone</b> algorithm (copy). <b>Transferables</b> (<code>ArrayBuffer</code>, <code>MessagePort</code>, <code>ImageBitmap</code>, streams) move ownership with zero copy: <code>postMessage(buf, [buf])</code> leaves <code>buf</code> detached (length 0).</li><li><b>SharedArrayBuffer + Atomics</b> share memory; requires cross-origin isolation (COOP + COEP headers).</li><li>Starting a worker costs time and memory; use workers for CPU-bound work (parsing, compression, image processing), not for I/O, which is already async.</li><li>Node: <code>worker_threads</code>; also <code>child_process</code> and <code>cluster</code> for processes.</li></ul>`,
diagram:{html:lanes([["Main thread",["UI, DOM, events","postMessage(job)","onmessage → show result"]],["messages (structured clone / transfer)",["copy: slow for big data","transfer: zero-copy, sender loses it"]],["Worker thread",["own event loop","heavy computation","postMessage(result)"]]]),steps:["The main thread sends a job and keeps handling input.","Data is copied (structured clone) unless you transfer ownership of buffers.","The worker computes in parallel and posts the result back, which arrives as a message event (a task)."]},
ex:[{t:"Transfer vs copy (runs anywhere)",code:`const buf = new ArrayBuffer(8);
const moved = structuredClone(buf, { transfer: [buf] });
console.log("original length:", buf.byteLength, "moved length:", moved.byteLength);
const copy = structuredClone({ a: [1, 2], when: new Date(0) });
console.log(copy);`},
{t:"A worker from a Blob (browser only)",code:`const src = "self.onmessage = (e) => { let s = 0; for (let i = 0; i < e.data; i++) s += i; self.postMessage(s); };";
const worker = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
worker.onmessage = (e) => { console.log("worker result", e.data); worker.terminate(); };
worker.onerror = (e) => console.log("worker error", e.message);
worker.postMessage(1000000);
console.log("main thread keeps running");`,note:"In real projects use <code>new Worker(new URL('./w.js', import.meta.url), { type: 'module' })</code> so bundlers handle it."}],
gotchas:[`Workers cannot access the DOM or <code>window</code>; use <code>self</code>/<code>globalThis</code>.`,`Posting big objects copies them (can be slower than the work itself); transfer buffers instead.`,`A transferred buffer is unusable on the sender (length 0).`,`Functions, DOM nodes and class instances (methods) can't be cloned; send plain data.`,`<code>SharedArrayBuffer</code> needs COOP/COEP headers or it is undefined.`,`Always <code>terminate()</code> workers you no longer need, or reuse a pool.`],
best:[`Use a worker pool (or libraries like Comlink) for repeated jobs; send small messages; transfer large buffers.`,`Keep UI work on the main thread and compute elsewhere; measure first to prove it is CPU-bound.`],
iq:[["fresher","Can a Web Worker update the DOM?","No. It must post messages to the main thread, which updates the DOM."],["mid","What is a transferable object?","An object (like ArrayBuffer) whose ownership moves to the receiver with zero-copy; it becomes unusable (detached) on the sender."],["senior","Worker vs async code?","Async code doesn't add threads; it only avoids blocking while waiting. Workers add parallel CPU capacity but have startup and messaging costs."],["architect","When would you choose SharedArrayBuffer?","For high-throughput shared state between threads (audio, WASM, games), accepting the complexity of Atomics and the need for cross-origin isolation."]],
practice:[`Offload a prime-counting function to a worker and show the page stays interactive.`,`Implement a small worker pool with a task queue.`],
teach:`<p>"A worker is a helper in another room: it can do heavy work while you keep serving customers. It can't touch the dining room, so you pass notes. Big boxes can be handed over instead of photocopied."</p>`}
],quiz:[
{code:`setTimeout(() => console.log('t10'), 10);
setTimeout(() => console.log('t0'), 0);
setTimeout(() => console.log('t5'), 5);`,ans:`t0 t5 t10 (one per line)`,why:`Timers fire in order of their due time; equal delays fire in creation order.`},
{code:`const b = new ArrayBuffer(8);
const c = structuredClone(b, { transfer: [b] });
console.log(b.byteLength, c.byteLength);`,ans:`0 8`,why:`Transferring moves the buffer's memory to the clone and detaches the original.`}]},

{n:15,title:"Streams and errors",goal:"Process data incrementally, cancel async work cleanly, and handle failure deliberately.",topics:[
{id:"d15-streams",title:"Streams and AbortController",
eli5:`<p>A <b>stream</b> is a garden hose: water flows a bit at a time instead of carrying the whole lake in a bucket. If the sink fills up, you turn the tap down (<b>backpressure</b>). <b>AbortController</b> is the "stop!" button you can give to anyone doing work for you.</p>`,
why:`<p>Loading a 2 GB file or a long AI/text response into memory before using it is slow and can crash. Streams process chunks as they arrive. Cancellation prevents wasted work and stale results (like an old search response replacing a new one).</p>`,
tech:`<ul class="pts"><li><b>Web Streams:</b> <code>ReadableStream</code> (source), <code>WritableStream</code> (sink), <code>TransformStream</code> (in-between). Connect with <code>readable.pipeThrough(transform).pipeTo(writable)</code>.</li><li><b>Backpressure:</b> the stream signals how much it can accept (<code>desiredSize</code>/<code>pull</code>); producers should pause when it is full so memory stays bounded.</li><li>A readable can be locked by one reader at a time; <code>tee()</code> splits it into two. <code>fetch(url).then(r =&gt; r.body)</code> is a ReadableStream; <code>TextDecoderStream</code> decodes bytes to text.</li><li>Async iteration <code>for await (const chunk of stream)</code> is supported in modern browsers and Node. Node also has classic <code>stream</code> (Readable/Writable/Transform) and <code>stream/promises.pipeline</code>.</li><li><b>AbortController:</b> <code>const ac = new AbortController(); fetch(url, {signal: ac.signal}); ac.abort();</code> rejects with <code>AbortError</code>. Also usable for <code>addEventListener(..., {signal})</code>, timers (<code>timers/promises</code>) and your own code. <code>AbortSignal.timeout(ms)</code> aborts after a deadline; <code>AbortSignal.any([...])</code> combines signals; <code>signal.throwIfAborted()</code> and <code>signal.reason</code> help cooperative cancellation.</li></ul>`,
diagram:{html:flow([["Source","ReadableStream (fetch body, file)"],["Transform","decode, parse, compress","w"],["Sink","WritableStream (DOM, file)","g"]])+`<p style="text-align:center;margin:10px 0 0">Backpressure flows <b>backwards</b>: slow sink → transform pauses → source pauses.</p>`,steps:["Data moves in chunks through the pipeline.","If the sink is slow, its queue fills and it signals the upstream stage.","Each stage stops pulling, so memory use stays flat.","<code>abort()</code> on a signal cancels the whole pipeline."]},
ex:[{t:"Build, transform and consume a stream",code:`const source = new ReadableStream({
  start(controller){ for (const n of [1, 2, 3, 4]) controller.enqueue(n); controller.close(); }
});
const doubler = new TransformStream({ transform(chunk, controller){ controller.enqueue(chunk * 2); } });
(async () => {
  const reader = source.pipeThrough(doubler).getReader();
  const out = [];
  for (;;) { const { value, done } = await reader.read(); if (done) break; out.push(value); }
  console.log(out);
})();`},
{t:"Cancellation with AbortController",code:`function abortableSleep(ms, signal){
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const id = setTimeout(resolve, ms, "finished");
    signal.addEventListener("abort", () => { clearTimeout(id); reject(signal.reason); }, { once: true });
  });
}
(async () => {
  const ac = new AbortController();
  const p = abortableSleep(1000, ac.signal);
  setTimeout(() => ac.abort(), 10);
  try { await p; } catch (e) { console.log("aborted:", e.name); }
  try { await abortableSleep(1000, AbortSignal.timeout(10)); } catch (e) { console.log("timeout:", e.name); }
})();`}],
browser:`<p>Cancel the previous <code>fetch</code> when the user types a new search: keep the controller in a variable and call <code>abort()</code> before starting the next. Stream a <code>fetch</code> response for progressive rendering or progress bars, and use <code>CompressionStream</code>/<code>DecompressionStream</code> for gzip in the browser.</p>`,
gotchas:[`An aborted <code>fetch</code> rejects with <code>AbortError</code>; treat it as normal control flow, not an error to report.`,`An <code>AbortSignal</code> is one-shot: once aborted it stays aborted; create a new controller for the next operation.`,`A stream that is locked to a reader can't be read by another; call <code>tee()</code> or release the lock.`,`Not respecting backpressure (enqueueing without checking <code>desiredSize</code>) buffers everything in memory.`,`<code>response.json()</code> buffers the whole body; stream it when it's huge.`],
best:[`Pass an <code>AbortSignal</code> through every async API in your layers; abort on unmount/navigation.`,`Use <code>pipeline</code> / <code>pipeTo</code> so errors and cleanup propagate, and prefer streaming for large payloads.`],
iq:[["mid","How do you cancel a fetch?","Pass an AbortSignal from an AbortController and call abort(); the promise rejects with AbortError."],["senior","What is backpressure?","A mechanism where a slow consumer signals a producer to slow down so buffers don't grow unbounded."],["senior","How do you avoid stale search results?","Abort the previous request (or ignore responses whose request id isn't the latest) before issuing a new one; debounce input."]],
practice:[`Stream a large text response and count lines without holding it all in memory.`,`Write <code>fetchJson(url, {signal, timeoutMs})</code> that combines a timeout and a caller signal using <code>AbortSignal.any</code>.`],
teach:`<p>"A stream is a hose, not a bucket: data flows in pieces and the sink can ask the tap to slow down. AbortController is a stop button you pass along so unfinished work can be cancelled."</p>`},

{id:"d15-errors",title:"Error handling",
eli5:`<p>Things go wrong: the milk is spilled. Good cooks <b>notice quickly</b> (throw), <b>say exactly what happened</b> (an Error with a message and the cause), and have a <b>plan</b> (catch and recover, or tell someone). Ignoring spilled milk and pretending everything is fine is how you end up with a sticky floor (silent bugs).</p>`,
why:`<p>Unhandled errors crash programs or silently corrupt state. Predictable error handling makes failures debuggable and recoverable.</p>`,
tech:`<ul class="pts"><li>Throw <code>Error</code> objects (or subclasses) so you get a <code>stack</code> and <code>message</code>. Built-in types: <code>TypeError, RangeError, ReferenceError, SyntaxError, URIError, EvalError, AggregateError</code>.</li><li><code>try/catch/finally</code>: <code>finally</code> always runs, even after <code>return</code>; a <code>return</code> or <code>throw</code> in <code>finally</code> <b>overrides</b> the earlier result. <code>catch</code> binding is optional (<code>catch {</code>).</li><li><b>Error cause</b> (ES2022): <code>new Error("load failed", { cause: err })</code> keeps the original error.</li><li><code>Error.isError(v)</code> (ES2026) reliably detects errors across realms (iframes); <code>instanceof Error</code> fails across realms.</li><li><b>Async errors:</b> <code>try/catch</code> catches an awaited rejection but <b>not</b> a throw inside a later callback (<code>setTimeout</code>, event handler). Unhandled rejections raise the global <code>unhandledrejection</code> event (browser) or crash Node (default since v15).</li><li><b>Global handlers:</b> <code>window.onerror</code>, <code>window.addEventListener("error"/"unhandledrejection")</code>; Node: <code>process.on("uncaughtException"/"unhandledRejection")</code>. Use them to <i>report</i>, not to continue as if nothing happened.</li><li>Distinguish <b>operational errors</b> (network down, bad input: handle) from <b>programmer errors</b> (bugs: fail fast, fix).</li></ul>`,
diagram:{html:flow([["throw new Error('x')"],["nearest try/catch up the call stack","if none: unhandled","w"],["catch handles / rethrows","g"],["finally always runs","last say","r"]]),steps:["A throw unwinds the call stack frame by frame looking for a catch.","If nothing catches it, it becomes an unhandled error (global handler, console, crash in Node).","<code>finally</code> runs on the way out in every case, and may replace the result."]},
ex:[{t:"finally overrides, and error causes",code:`function f(){ try { return "try"; } finally { return "finally"; } }
console.log(f());
class AppError extends Error {
  constructor(msg, opts){ super(msg, opts); this.name = "AppError"; }
}
try {
  try { JSON.parse("{bad json"); }
  catch (e) { throw new AppError("Could not load settings", { cause: e }); }
} catch (e) {
  console.log(e.name, "-", e.message, "| cause:", e.cause.name);
  console.log(e instanceof AppError, e instanceof Error);
}`},
{t:"Async errors and AggregateError",code:`(async () => {
  try { await Promise.all([Promise.resolve(1), Promise.reject(new TypeError("bad")), 3]); }
  catch (e) { console.log("caught:", e.name); }
  try { await Promise.any([Promise.reject(new Error("a")), Promise.reject(new Error("b"))]); }
  catch (e) { console.log(e.name, e.errors.map((x) => x.message)); }
  console.log(typeof Error.isError === "function" ? Error.isError(new RangeError("x")) : "Error.isError not available yet");
})();`}],
browser:`<p>In the browser, <code>window.addEventListener("unhandledrejection", e =&gt; report(e.reason))</code> and <code>"error"</code> events feed monitoring tools. Cross-origin script errors show only "Script error." unless CORS headers and <code>crossorigin</code> are set. Source maps turn minified stacks into readable ones.</p>`,
gotchas:[`Throwing strings or plain objects loses the stack trace; always throw <code>Error</code>.`,`<code>try/catch</code> around a callback-based or event-based async call won't catch its later errors.`,`Swallowing errors with an empty catch hides bugs; at minimum log with context.`,`<code>finally</code> with <code>return</code> silently discards a thrown error.`,`<code>JSON.parse</code>, <code>new URL</code>, <code>decodeURIComponent</code> and property access on null throw synchronously; wrap boundaries, not every line.`,`An unhandled rejection can still occur if you attach the handler too late.`],
best:[`Fail fast on programmer errors; handle operational errors at a layer that can recover; add context with <code>cause</code>.`,`Create a small set of app error classes with codes; never expose raw internal errors to users.`,`Report unhandled errors to monitoring with release and user-session context.`],
iq:[["fresher","What does finally do?","Runs after try/catch whether or not an error occurred, even if there is a return."],["mid","Why doesn't try/catch catch an error inside setTimeout?","The callback runs later on a fresh stack after the try block has finished, so there is no enclosing handler."],["senior","How do you design error handling across a web app?","Typed error classes, handle recoverable errors near the source with retries/fallbacks, centralize reporting (global handlers + monitoring), user-friendly messages, error boundaries in UI frameworks, and consistent API error contracts."]],
practice:[`Write <code>safeJsonParse(str, fallback)</code> and an error class hierarchy for an API client.`,`Add global <code>unhandledrejection</code> logging to a small page.`],
teach:`<p>"Throw real Error objects with a clear message and the original cause. Catch where you can actually do something. finally always runs. try/catch can't see errors thrown later in callbacks, only awaited ones."</p>`}
],quiz:[
{code:`function f(){ try { return 'try'; } finally { return 'finally'; } }
console.log(f());`,ans:`finally`,why:`A return in finally overrides the return from try.`},
{code:`Promise.all([Promise.resolve(1), Promise.reject('x'), new Promise(r => setTimeout(() => r(3), 10))])
  .then(console.log)
  .catch(e => console.log('err', e));`,ans:`err x`,why:`Promise.all rejects as soon as one promise rejects, without waiting for the slow one.`}]}
]});
