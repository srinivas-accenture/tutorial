/* Week 11: Gap-filler III — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js. */
JSC.registerWeek({w:11,revision:[
"<b>HTTP API:</b> correct verbs and status codes (201 + Location, 204, 400 vs 422, 401 vs 403, 404, 409, 429, 500); middleware order matters (logger → error handler → auth → handlers); never leak internal errors; validate input at the edge; cursor pagination; idempotency keys.",
"<b>Node I/O:</b> use streams and <code>pipeline</code> for large data so memory stays flat and backpressure works; <code>fs/promises</code>; <code>Buffer</code> for bytes; CLIs: argv, exit codes, stdin/stdout, <code>util.parseArgs</code>.",
"<b>Databases:</b> parameterized queries stop SQL injection; indexes turn scans into lookups; solve N+1 with batching/joins; transactions give atomicity; optimistic concurrency (version column) prevents lost updates; pool connections.",
"<b>Caching:</b> cache-aside with TTL; protect against stampedes (single-flight, jittered TTLs); HTTP caching with <code>Cache-Control</code> and ETag/304; invalidation is the hard part (version keys, tags, short TTLs).",
"<b>Git and CI:</b> history is a DAG; merge-base finds the common ancestor; conventional commits drive semantic versions; pipelines: install (<code>npm ci</code>), lint, types, tests, build, audit, deploy; immutable artifacts; trunk-based with flags.",
"<b>Deployment:</b> 12-factor (config in env, stateless, logs to stdout, disposability); validate config at startup (env values are strings!); handle SIGTERM and drain in-flight requests; small non-root container images; static + CDN vs containers vs serverless/edge.",
"<b>WebAssembly:</b> compiled, sandboxed, typed (i32/i64/f32/f64) with linear memory; JS ↔ Wasm calls and strings cross via memory; growing memory detaches old buffers. <b>Atomics</b> give race-free operations on integer typed arrays (compareExchange for locks).",
"<b>Compilers/ASTs:</b> tokenize → parse (precedence climbing) → AST → transform/analyze → generate/evaluate. Linters, bundlers, Babel and TypeScript all work on ASTs with visitors.",
"<b>End-to-end thinking:</b> every feature touches requirements, routing, forms, API, auth, data, caching, tests, delivery, observability, accessibility, performance and security; write them down before coding.",
"<b>Scope note:</b> React/TypeScript are intentionally not covered here; the same ideas (state, routing, forms, a11y, performance) apply in any framework."
],days:[
{n:51,title:"Node APIs and streams",goal:"Build and reason about an HTTP API in Node, and process data with streams instead of loading it all.",topics:[
{id:"d51-node-http",title:"Building an HTTP API in Node",lv:["mid","senior","lead"],
eli5:`<p>An API server is a <b>restaurant counter</b>. Customers (clients) hand over a slip (request) saying what they want; the counter checks they're allowed in (auth), reads the slip carefully (validation), gets the dish (business logic and database) and hands back a plate with a clear note: "here you go" (200), "we made it for you" (201), "that's not on the menu" (404), "your slip is wrong" (400/422) or "kitchen problem, sorry" (500, without telling them the kitchen's secrets).</p>`,
why:`<p>Most JavaScript roles touch a backend. Knowing HTTP semantics, middleware, error handling and API design is essential for full-stack interviews and for building frontends that work well with servers.</p>`,
tech:`<ul class="pts"><li><b>Node core:</b> <code>http.createServer((req, res) =&gt; {...})</code> gives a raw request/response; frameworks (Express, Fastify, Hono, Koa) add routing, middleware, body parsing and ergonomics. The concepts below apply to all.</li><li><b>HTTP semantics:</b> <b>GET</b> (safe, idempotent), <b>POST</b> (create/action, not idempotent), <b>PUT</b> (replace, idempotent), <b>PATCH</b> (partial), <b>DELETE</b> (idempotent).</li><li><b>Status codes:</b> 200 OK, <b>201 Created + Location</b>, 204 No Content, 301/302/304, <b>400</b> malformed, <b>401</b> unauthenticated, <b>403</b> forbidden, <b>404</b> not found, <b>409</b> conflict, <b>422</b> validation failed, <b>429</b> too many requests (+ Retry-After), <b>500</b> server error, 503 unavailable.</li><li><b>Middleware:</b> functions <code>(ctx, next)</code> forming a chain; <b>order matters</b>: logging/request-id (outermost) → error handler → security headers/CORS/rate limit → authentication → body parsing/validation → routes.</li><li><b>Errors:</b> throw typed errors (<code>HttpError(status, message)</code>); a central handler maps them to responses; <b>never leak internals</b> (stack traces, SQL, secrets) in 500s; log details with the request id instead.</li><li><b>Body handling:</b> collect chunks with a <b>size limit</b>, parse JSON safely (400 on malformed), validate with a schema (zod/ajv/valibot), respond with consistent error shapes (RFC 9457 problem details).</li><li><b>Production habits:</b> structured logs with request ids, timeouts, rate limiting, CORS allowlists, compression, health endpoints (<code>/healthz</code>), graceful shutdown (Day 53), config from environment, idempotency keys for POSTs that charge money (Day 29), cursor pagination, API versioning, OpenAPI docs.</li></ul>`,
diagram:{html:flow([["request"],["logger","request id; logs status after next()","w"],["error handler","catches everything below","w"],["auth","401 / 403","w"],["validate body","400 / 422","w"],["handler","200 / 201 / 404","g"],["response"]]),steps:["The outermost middleware sees the final status, so it can log every request, including failed ones.","The error handler converts thrown errors to safe responses and hides internals for unexpected ones.","Authentication and validation reject bad requests before business logic runs.","Handlers only handle the happy path and throw typed errors for failures."]},
ex:[{t:"A framework-free app: router, middleware chain and error handling (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const compile = (pattern) => {
  const keys = [];
  const re = new RegExp("^" + pattern.replace(/:([A-Za-z_]+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) + "/?$");
  return (path) => { const m = re.exec(path); return m ? Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) : null; };
};
class HttpError extends Error { constructor(status, message, expose = true){ super(message); this.status = status; this.expose = expose; } }
function createApp(){
  const mw = [], routes = [];
  const app = {
    use(f){ mw.push(f); return app; },
    route(method, path, handler){ routes.push({ method, match: compile(path), handler }); return app; },
    async handle(req){
      const res = { status: 200, headers: {}, body: null };
      const ctx = { req, res, params: {}, state: {} };
      let i = -1;
      const next = async () => {
        i++;
        if (i < mw.length) return mw[i](ctx, next);
        for (const r of routes) { if (r.method !== req.method) continue; const params = r.match(req.path); if (params) { ctx.params = params; return r.handler(ctx); } }
        res.status = 404; res.body = { error: "not found" };
      };
      await next();
      return res;
    }
  };
  return app;
}
const log = []; let counter = 0;
const logger = async (ctx, next) => { ctx.state.id = "req-" + ++counter; await next(); ctx.res.headers["x-request-id"] = ctx.state.id; log.push(ctx.req.method + " " + ctx.req.path + " " + ctx.res.status); };
const errorHandler = async (ctx, next) => {
  try { await next(); }
  catch (e) { ctx.res.status = e.status || 500; ctx.res.body = { error: e.expose ? e.message : "internal error" }; }
};
const auth = async (ctx, next) => { if (ctx.req.path.startsWith("/admin") && ctx.req.headers?.authorization !== "Bearer ok") throw new HttpError(401, "unauthorized"); await next(); };
const db = new Map([["1", { id: "1", name: "Ana" }]]);
const app = createApp().use(logger).use(errorHandler).use(auth)
  .route("GET", "/users/:id", async (ctx) => { const u = db.get(ctx.params.id); if (!u) throw new HttpError(404, "user not found"); ctx.res.body = u; })
  .route("POST", "/users", async (ctx) => {
    const { name } = ctx.req.body || {};
    if (typeof name !== "string" || !name.trim()) throw new HttpError(422, "name is required");
    const id = String(db.size + 1); db.set(id, { id, name });
    ctx.res.status = 201; ctx.res.headers.location = "/users/" + id; ctx.res.body = db.get(id);
  })
  .route("GET", "/admin/stats", async (ctx) => { ctx.res.body = { users: db.size }; })
  .route("GET", "/boom", async () => { throw new Error("db password is hunter2"); });
(async () => {
  const r1 = await app.handle({ method: "GET", path: "/users/1" });
  check("GET a resource: 200 and the body", r1.status === 200 && r1.body.name === "Ana");
  check("the request id header is added by the outer middleware", r1.headers["x-request-id"] === "req-1");
  const r2 = await app.handle({ method: "GET", path: "/users/9" });
  check("missing resource: 404 with a clear message", r2.status === 404 && r2.body.error === "user not found");
  const r3 = await app.handle({ method: "POST", path: "/users", body: { name: "Bo" } });
  check("create: 201 with Location and the new resource", r3.status === 201 && r3.headers.location === "/users/2" && r3.body.name === "Bo");
  const r4 = await app.handle({ method: "POST", path: "/users", body: { name: "  " } });
  check("validation failure: 422", r4.status === 422 && r4.body.error === "name is required");
  const r5 = await app.handle({ method: "GET", path: "/nope" });
  check("unknown route: 404", r5.status === 404 && r5.body.error === "not found");
  const r6 = await app.handle({ method: "GET", path: "/admin/stats", headers: {} });
  check("protected route without a token: 401", r6.status === 401);
  const r7 = await app.handle({ method: "GET", path: "/admin/stats", headers: { authorization: "Bearer ok" } });
  check("protected route with a token: 200", r7.status === 200 && r7.body.users === 2);
  const r8 = await app.handle({ method: "GET", path: "/boom" });
  check("unexpected errors become a generic 500 and never leak internals", r8.status === 500 && r8.body.error === "internal error" && !JSON.stringify(r8).includes("hunter2"));
  check("every request is logged with its final status, even failures", log.length === 8 && log[1] === "GET /users/9 404" && log[7] === "GET /boom 500");
  check("error responses also carry the request id", r8.headers["x-request-id"] === "req-8");
})();`},
{t:"The same ideas on the real Node http module (reference)",code:`// server.mjs
import { createServer } from "node:http";

async function readJson(req, limit = 1_000_000){
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error("payload too large"), { status: 413, expose: true });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "null"); }
  catch { throw Object.assign(new Error("invalid JSON"), { status: 400, expose: true }); }
}

const server = createServer(async (req, res) => {
  const id = crypto.randomUUID();
  const send = (status, body, headers = {}) => { res.writeHead(status, { "content-type": "application/json", "x-request-id": id, ...headers }); res.end(JSON.stringify(body)); };
  try {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "GET" && url.pathname === "/healthz") return send(200, { ok: true });
    if (req.method === "POST" && url.pathname === "/users") { const body = await readJson(req); /* validate, insert */ return send(201, { id: 1, ...body }, { location: "/users/1" }); }
    send(404, { error: "not found" });
  } catch (e) {
    console.error(JSON.stringify({ id, level: "error", msg: e.message, stack: e.stack }));
    send(e.status || 500, { error: e.expose ? e.message : "internal error" });
  }
});
server.requestTimeout = 30_000;
server.listen(process.env.PORT ?? 3000);
process.on("SIGTERM", () => server.close(() => process.exit(0)));`,run:false}],
gotchas:[`Registering the error handler after the routes (or inside the chain) so it never sees errors; order matters.`,`Returning stack traces or SQL errors to clients leaks internals; log them server-side with a request id.`,`<code>400</code> vs <code>422</code>: malformed syntax vs well-formed but invalid data; <code>401</code> vs <code>403</code>: not authenticated vs not allowed.`,`Parsing request bodies without a size limit enables memory exhaustion.`,`Forgetting that <code>POST</code> isn't idempotent: client retries can duplicate effects without idempotency keys.`,`CORS "fixes" with <code>*</code> and credentials; use an allowlist and test preflights (Day 19).`,`Blocking the event loop with sync I/O or CPU-heavy JSON/crypto work freezes every request.`],
best:[`Keep handlers thin; put logic in services and make them testable without HTTP.`,`Validate at the boundary with a schema; return a consistent error format; document with OpenAPI.`,`Add request ids, structured logs, timeouts, rate limits and health checks from day one.`],
iq:[["mid","How does middleware work and why does order matter?","Each middleware receives (ctx, next) and can act before and after the rest of the chain. Order determines what runs when: the outermost sees final results (logging), error handlers must wrap what can throw, and auth must run before handlers."],["senior","How do you design error handling in an API?","Throw typed errors with status and an expose flag, handle them in one middleware that maps to a consistent JSON shape, hide internals for unexpected errors, log with a request id, and use appropriate status codes (400, 401, 403, 404, 409, 422, 429, 500)."],["architect","Design a production-ready REST API for orders.","Resource-oriented routes, auth and authorization, schema validation, idempotency keys on POST, cursor pagination, ETags and caching, rate limits, consistent errors, versioning, OpenAPI contract, structured logs/metrics/traces, timeouts and graceful shutdown, and a rollout/rollback plan."]],
practice:[`Add a rate-limiting middleware (token bucket from Day 34) keyed by client id and verify 429 with a <code>Retry-After</code> header.`,`Add <code>PATCH /users/:id</code> with ETag/If-Match optimistic concurrency returning 412 or 409 on conflict.`],
teach:`<p>"An API is a restaurant counter: check who you are, read the slip, fetch the dish, and answer with an honest status code. Put the logger outside the error handler, never show the kitchen's secrets, and keep each station small."</p>`},

{id:"d51-node-streams-files",title:"Streams, files and CLIs in Node",lv:["mid","senior"],
eli5:`<p>Moving water from a lake to a field: you can carry it in one giant bucket (load the whole file in memory, which breaks for a big lake) or run a <b>pipe</b> so water flows steadily. If the field fills up, a good pipe has a tap that slows the flow (<b>backpressure</b>). A command-line tool is a program you talk to by typing arguments and reading its output.</p>`,
why:`<p>Reading a 5 GB log with <code>readFile</code> crashes the process. Streams keep memory flat, work with network and compression, and are the basis of HTTP bodies, file I/O and many tools. CLIs are the glue of build and deployment workflows.</p>`,
tech:`<ul class="pts"><li><b>Node streams:</b> <code>Readable</code>, <code>Writable</code>, <code>Duplex</code>, <code>Transform</code> (object mode available). <b>Prefer <code>stream/promises.pipeline(src, ...transforms, dest)</code></b>: it forwards errors, cleans up and respects backpressure. <code>for await (const chunk of readable)</code> works, and Node interoperates with Web Streams (<code>Readable.toWeb/fromWeb</code>).</li><li><b>Backpressure:</b> <code>writable.write()</code> returns <code>false</code> when its buffer is full; wait for <code>"drain"</code>. A stream with a small <code>highWaterMark</code> pulls from its source only as fast as the consumer reads.</li><li><b>Files:</b> <code>fs/promises</code> (<code>readFile, writeFile, readdir, stat, rm, mkdir</code>), <code>createReadStream/createWriteStream</code> for big files, <code>readline</code> for line-by-line, <code>fs.watch</code>; write atomically (temp file then rename) to avoid half-written files.</li><li><b>Buffers:</b> <code>Buffer</code> is a <code>Uint8Array</code> subclass: <code>Buffer.from(str, "utf8")</code>, <code>buf.toString("base64")</code>; multi-byte characters can be split across chunks, so use <code>StringDecoder</code>/<code>TextDecoder</code> with <code>{stream: true}</code> when decoding chunks.</li><li><b>zlib:</b> <code>createGzip()</code>/<code>createGunzip()</code> (browsers: <code>CompressionStream</code>).</li><li><b>CLIs:</b> <code>process.argv</code> (or built-in <code>util.parseArgs</code>), <code>process.stdin/stdout/stderr</code> (results to stdout, logs/errors to stderr), <b>exit codes</b> (0 success, non-zero failure; set <code>process.exitCode</code> and let the loop drain), signals (<code>SIGINT/SIGTERM</code>), shebang <code>#!/usr/bin/env node</code> with <code>bin</code> in package.json, <code>--help</code> text, <code>NO_COLOR</code>.</li><li><b>Other:</b> <code>child_process</code> (<code>spawn</code> for streams, <code>execFile</code> over <code>exec</code> to avoid shell injection), <code>worker_threads</code> for CPU work.</li></ul>`,
diagram:{html:flow([["createReadStream(big.log)","64 KB chunks"],["Transform: split lines","buffers partial lines","w"],["Transform: filter / map","w"],["createGzip()","w"],["createWriteStream(out.gz)","slow disk → backpressure","r"]]),steps:["Data moves in small chunks, so memory stays flat regardless of file size.","A line splitter must buffer a partial line across chunk boundaries.","If the destination is slow, it stops accepting data and the pause propagates back to the source.","<code>pipeline</code> handles errors and cleanup in one place."]},
ex:[{t:"Web Streams equivalents: line splitting, gzip and backpressure (self-checking; the same ideas apply to Node streams)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const linesStream = () => {
  let buf = "";
  return new TransformStream({
    transform(chunk, controller){ buf += chunk; const parts = buf.split("\\n"); buf = parts.pop(); for (const l of parts) controller.enqueue(l); },
    flush(controller){ if (buf) controller.enqueue(buf); }
  });
};
const collect = async (readable) => { const out = []; const r = readable.getReader(); for (;;) { const { done, value } = await r.read(); if (done) break; out.push(value); } return out; };
const parseArgs = (argv) => {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) { const [k, v] = a.slice(2).split("="); if (v !== undefined) out[k] = v; else if (argv[i + 1] && !argv[i + 1].startsWith("-")) out[k] = argv[++i]; else out[k] = true; }
    else if (a.startsWith("-") && a.length > 1) for (const f of a.slice(1)) out[f] = true;
    else out._.push(a);
  }
  return out;
};
(async () => {
  const src = new ReadableStream({ start(c){ c.enqueue("alpha\\nbe"); c.enqueue("ta\\ngam"); c.enqueue("ma\\n"); c.enqueue("tail-without-newline"); c.close(); } });
  const lines = await collect(src.pipeThrough(linesStream()));
  check("a line splitter must buffer partial lines across chunks", lines.join("|") === "alpha|beta|gamma|tail-without-newline");
  const text = "abc".repeat(1000);
  const gz = await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
  check("gzip shrinks repetitive data a lot (" + text.length + " -> " + gz.byteLength + " bytes)", gz.byteLength < text.length / 10);
  const back = await new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
  check("gunzip restores the original exactly", back === text);
  let pulled = 0;
  const producer = new ReadableStream({ pull(c){ pulled++; c.enqueue(pulled); if (pulled >= 1000) c.close(); } }, { highWaterMark: 2 });
  const reader = producer.getReader(); let consumed = 0;
  for (let i = 0; i < 3; i++) { await reader.read(); consumed++; await new Promise((r) => setTimeout(r, 5)); }
  check("backpressure: a slow consumer keeps the producer from racing ahead (pulled " + pulled + " for " + consumed + " reads)", pulled <= consumed + 3 && pulled < 10);
  const args = parseArgs(["--port", "8080", "-vq", "--name=x", "file.txt", "--dry-run"]);
  check("CLI argument parsing", args.port === "8080" && args.v === true && args.q === true && args.name === "x" && args["dry-run"] === true && args._.join() === "file.txt");
  check("ambiguity: a boolean flag before a positional swallows it as its value", parseArgs(["--dry-run", "file.txt"])["dry-run"] === "file.txt");
})();`},
{t:"Node stream pipeline, readline and a CLI skeleton (reference)",code:`// big-log.mjs
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import readline from "node:readline";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({ options: { out: { type: "string" }, help: { type: "boolean", short: "h" } }, allowPositionals: true });
if (values.help || !positionals[0]) { console.error("usage: big-log <file> --out out.gz"); process.exitCode = 2; }
else {
  const onlyErrors = new Transform({
    transform(chunk, _enc, cb){ cb(null, chunk.toString().split("\\n").filter((l) => l.includes("ERROR")).join("\\n")); }
  });
  try {
    await pipeline(createReadStream(positionals[0]), onlyErrors, createGzip(), createWriteStream(values.out ?? "errors.gz"));
    console.log("done");                                    // results on stdout
  } catch (err) { console.error(err.message); process.exitCode = 1; }   // errors on stderr, non-zero exit code
}

// Line by line without loading the file:
// for await (const line of readline.createInterface({ input: createReadStream("big.log") })) { ... }`,run:false}],
gotchas:[`<code>fs.readFile</code> on huge files loads everything into memory; use streams or readline.`,`<code>.pipe()</code> doesn't forward errors or clean up; use <code>pipeline</code>.`,`Splitting text per chunk breaks lines and multi-byte characters at chunk boundaries.`,`Ignoring the return value of <code>write()</code> lets memory grow unbounded when the consumer is slow.`,`<code>process.exit()</code> inside a stream callback can truncate pending output; set <code>process.exitCode</code> instead.`,`Using <code>exec</code> with user input invites shell injection; use <code>execFile</code>/<code>spawn</code> with an args array.`,`CLI flags: a boolean flag followed by a positional can be parsed as the flag's value; use <code>--</code> or <code>util.parseArgs</code> with explicit types.`],
best:[`Use <code>stream/promises.pipeline</code> and async iteration; keep transforms small and testable.`,`Write results to stdout and diagnostics to stderr; return meaningful exit codes; support <code>--help</code>.`,`Write files atomically (temp + rename) and clean up partial output on failure.`],
iq:[["mid","Why use streams instead of readFile?","Streams process data in chunks, keeping memory use constant for large inputs, start producing output earlier and support backpressure; readFile loads the whole file."],["senior","What is backpressure and how does Node handle it?","A slow consumer signals a fast producer to pause. write() returns false when the buffer is full and 'drain' signals readiness; pipeline wires this up automatically."],["senior","How do you build a robust CLI?","Parse args (util.parseArgs), validate input, print results to stdout and errors to stderr, set exit codes, handle SIGINT/SIGTERM, provide --help, and use streams for large inputs."]],
practice:[`Write a CLI that counts the 10 most frequent words in a large file using <code>readline</code> and a Map.`,`Convert a script that uses <code>readFileSync</code> + <code>split</code> into a streaming version and compare peak memory.`],
teach:`<p>"Don't carry the lake in a bucket: run a pipe. Data flows in small chunks, a slow field turns the tap down (backpressure), and pipeline cleans up. CLIs print results to stdout, errors to stderr, and tell the shell success or failure with an exit code."</p>`}
],quiz:[
{code:`console.log(Object.fromEntries(new URLSearchParams('a=1&b=2&a=3')), new Response(null, { status: 204 }).ok, new Response('x', { status: 301 }).ok);`,ans:`{ a: "3", b: "2" } true false`,why:`fromEntries keeps the last duplicate key. Response.ok is true only for statuses 200–299, so 204 is ok and 301 is not.`},
{code:`const lines = []; let buf = '';
for (const chunk of ['ab\\ncd', 'ef\\ng']) { buf += chunk; const parts = buf.split('\\n'); buf = parts.pop(); lines.push(...parts); }
lines.push(buf);
console.log(lines);`,ans:`["ab", "cdef", "g"]`,why:`A chunk boundary can split a line ("cd" + "ef"), so the incomplete tail is kept in a buffer until the next chunk completes it.`}]},

{n:52,title:"Databases and caching",goal:"Use databases safely and efficiently, and add caching without creating stale-data or stampede problems.",topics:[
{id:"d52-databases",title:"Databases for JavaScript developers",lv:["mid","senior","architect"],
eli5:`<p>A database is a <b>giant organized filing room</b>. An <b>index</b> is the alphabetical tab system: finding "Smith" takes a moment instead of reading every folder. A <b>transaction</b> is "do all these steps or none": moving money out of one account and into another must not stop halfway. <b>SQL injection</b> is a trickster writing extra orders onto your request slip; the fix is to hand over the slip and the customer's answers in <b>separate envelopes</b> (parameters).</p>`,
why:`<p>Backend performance and correctness mostly come down to data access. Interviews ask about indexes, transactions, N+1 queries and injection because they separate people who've operated real systems from those who've only followed tutorials.</p>`,
tech:`<ul class="pts"><li><b>Relational (SQL):</b> tables, rows, keys, joins, constraints; strong consistency and transactions (PostgreSQL, MySQL, SQLite). <b>NoSQL families:</b> document (MongoDB), key-value (Redis, DynamoDB), wide-column (Cassandra), graph (Neo4j); choose by access patterns, consistency needs and scale, not fashion.</li><li><b>Indexes</b> (usually B-trees) turn full table scans into logarithmic lookups; add them for columns used in <code>WHERE</code>, <code>JOIN</code>, <code>ORDER BY</code>; they cost write speed and storage; composite index order matters; check plans with <code>EXPLAIN</code>.</li><li><b>Transactions (ACID):</b> atomicity (all or nothing), consistency, isolation, durability. <b>Isolation levels</b> trade anomalies for concurrency: read committed, repeatable read, serializable (anomalies: dirty read, non-repeatable read, phantom, lost update, write skew).</li><li><b>Concurrency control:</b> pessimistic locks (<code>SELECT ... FOR UPDATE</code>) vs <b>optimistic</b> (a <code>version</code> column; update with <code>WHERE version = ?</code> and retry on conflict).</li><li><b>N+1 queries:</b> one query for a list plus one per item; fix with joins, <code>IN (...)</code> batching, DataLoader-style batching or eager loading.</li><li><b>SQL injection:</b> never concatenate input into SQL; use <b>parameterized queries/prepared statements</b> (values travel separately from the statement text); also least-privilege DB users.</li><li><b>Practicalities:</b> connection <b>pooling</b> (don't open one per request), migrations (expand → migrate → contract for zero downtime), keyset pagination, soft vs hard deletes, timestamps in UTC, money as integers/decimals, backups and restore tests.</li><li><b>ORMs/query builders</b> (Prisma, Drizzle, Knex, TypeORM, Sequelize) speed development but can hide N+1 and inefficient SQL; know the SQL they generate.</li></ul>`,
diagram:{html:flow([["query: WHERE email = ?"],["no index","scan all rows: O(n)","r"],["with index","B-tree lookup: O(log n)","g"]])+flow([["list 5 posts: 1 query"],["author per post: +5 queries","N+1","r"],["batch authors: 1 query","2 total","g"]]),steps:["Without an index the database examines every row; the cost grows with table size.","An index keeps keys sorted so it can jump straight to matches.","The N+1 pattern multiplies round trips; batching collapses them into a constant number.","Both problems are invisible in small test data and painful in production."]},
ex:[{t:"SQL injection, indexes, N+1, transactions and optimistic locking as runnable simulations (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
// 1. SQL injection: string concatenation vs parameters
const unsafe = (name) => "SELECT * FROM users WHERE name = '" + name + "'";
const safe = (name) => ({ text: "SELECT * FROM users WHERE name = $1", values: [name] });
const attack = "x' OR '1'='1";
check("concatenation lets input rewrite the query", unsafe(attack) === "SELECT * FROM users WHERE name = 'x' OR '1'='1'");
check("parameterized queries keep input as data, never as SQL", safe(attack).text === "SELECT * FROM users WHERE name = $1" && safe(attack).values[0] === attack);
// 2. Index vs full scan
const rows = Array.from({ length: 10000 }, (_, i) => ({ id: i, email: "u" + i + "@x.com" }));
let scanned = 0;
const scan = (email) => { for (const r of rows) { scanned++; if (r.email === email) return r; } return null; };
const index = new Map(rows.map((r) => [r.email, r]));
let lookups = 0;
const viaIndex = (email) => { lookups++; return index.get(email) ?? null; };
const target = "u9999@x.com";
check("same answer, very different cost (" + scan(target).id + " via " + scanned + " row checks vs " + (viaIndex(target), lookups) + " lookup)", scanned === 10000 && lookups === 1 && scan(target) === viaIndex(target));
// 3. N+1 vs batching
let queries = 0;
const data = { posts: Array.from({ length: 5 }, (_, i) => ({ id: i + 1, authorId: (i % 2) + 1 })), authors: new Map([[1, "Ana"], [2, "Bo"]]) };
const q = {
  allPosts(){ queries++; return data.posts; },
  author(id){ queries++; return data.authors.get(id); },
  authorsIn(ids){ queries++; return new Map(ids.map((id) => [id, data.authors.get(id)])); }
};
queries = 0; const slow = q.allPosts().map((p) => ({ ...p, author: q.author(p.authorId) })); const slowQueries = queries;
queries = 0; const posts = q.allPosts(); const authors = q.authorsIn([...new Set(posts.map((p) => p.authorId))]);
const fast = posts.map((p) => ({ ...p, author: authors.get(p.authorId) })); const fastQueries = queries;
check("N+1 needs 1 + 5 = 6 queries, batching needs 2, results identical", slowQueries === 6 && fastQueries === 2 && JSON.stringify(slow) === JSON.stringify(fast));
// 4. Transaction: atomic transfer with rollback
const accounts = { a: 100, b: 50 };
const transfer = (from, to, amt) => {
  const snapshot = { ...accounts };
  try { accounts[from] -= amt; if (accounts[from] < 0) throw new Error("insufficient funds"); accounts[to] += amt; }
  catch (e) { Object.assign(accounts, snapshot); throw e; }
};
transfer("a", "b", 30);
check("a successful transfer moves money", accounts.a === 70 && accounts.b === 80);
let msg = ""; try { transfer("a", "b", 500); } catch (e) { msg = e.message; }
check("a failed transfer rolls back completely", msg === "insufficient funds" && accounts.a === 70 && accounts.b === 80);
// 5. Optimistic concurrency (lost update prevention)
const store = { version: 1, data: "a" };
const update = (expectedVersion, data) => { if (store.version !== expectedVersion) throw new Error("conflict"); store.data = data; return ++store.version; };
const first = update(1, "from writer 1");
let conflict = ""; try { update(1, "from writer 2"); } catch (e) { conflict = e.message; }
check("the second writer holding a stale version is rejected instead of overwriting", first === 2 && conflict === "conflict" && store.data === "from writer 1");
check("after re-reading the new version the retry succeeds", update(2, "writer 2 retried") === 3);`},
{t:"Real SQL and driver usage (reference)",code:`-- Index for a hot query, and check that it is used
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20;

-- Keyset pagination (stable and fast; no OFFSET scan)
SELECT * FROM orders WHERE user_id = $1 AND (created_at, id) < ($2, $3) ORDER BY created_at DESC, id DESC LIMIT 20;

-- Optimistic concurrency
UPDATE docs SET body = $1, version = version + 1 WHERE id = $2 AND version = $3;   -- 0 rows updated => conflict

// Node (pg): parameters, transaction, pool
import pg from "pg";
const pool = new pg.Pool({ max: 10 });
const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);     // never concatenate
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amt, from]);
  await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amt, to]);
  await client.query("COMMIT");
} catch (e) { await client.query("ROLLBACK"); throw e; } finally { client.release(); }`,run:false}],
gotchas:[`Building SQL with string concatenation or template literals, even after "escaping".`,`Missing indexes on foreign keys and filter columns; or too many indexes slowing writes.`,`<code>OFFSET</code> pagination scans and discards rows (slow on deep pages) and shifts under concurrent inserts; use keyset pagination.`,`N+1 hides inside ORMs and GraphQL resolvers; log query counts per request.`,`Long transactions hold locks and cause contention; keep them short and avoid network calls inside them.`,`Storing money as floats; storing local times instead of UTC.`,`Opening a connection per request exhausts the database; use a pool and close idle clients.`],
best:[`Parameterize everything; use least-privilege DB credentials; back up and test restores.`,`Index for your access patterns, verify with EXPLAIN, and monitor slow queries and per-request query counts.`,`Use optimistic concurrency for user edits and short transactions for invariants; migrate with expand/contract.`],
iq:[["mid","How do you prevent SQL injection?","Use parameterized queries/prepared statements so user input is sent as values, not SQL text; use ORMs/query builders correctly, validate input, and run with least-privilege database accounts."],["senior","What is the N+1 problem and how do you fix it?","One query for a list followed by one query per item. Fix with joins, IN-list batching, eager loading or a DataLoader that batches and caches per request."],["senior","Explain transaction isolation levels and a lost update.","Isolation levels trade anomalies for concurrency (read committed, repeatable read, serializable). A lost update happens when two transactions read the same value and both write back; prevent with locking, serializable isolation or optimistic versioning."],["architect","SQL or NoSQL for a new product?","Start from access patterns, consistency and query needs: relational for structured data, transactions and flexible queries; document/key-value for simple access patterns at scale or flexible schemas; often a relational core plus cache/search stores."]],
practice:[`Take a slow query, add the right composite index and prove it with <code>EXPLAIN ANALYZE</code>.`,`Implement keyset pagination with a stable tiebreaker and write tests for inserts during paging.`],
teach:`<p>"An index is the alphabetical tab system, a transaction is all-or-nothing, and parameters keep a trickster from rewriting your query. Count queries per request to catch N+1, and use version numbers so two editors can't silently overwrite each other."</p>`},

{id:"d52-caching",title:"Caching layers and invalidation",lv:["mid","senior","architect"],
eli5:`<p>Caching is keeping a <b>copy of the answer nearby</b> so you don't walk to the library each time. The hard parts: the copy can get <b>out of date</b> (invalidation), and if the copy expires at the exact moment 1,000 people ask, they all run to the library together (<b>stampede</b>). The fix is one person fetches while everybody else waits for that same answer.</p>`,
why:`<p>Caching is the biggest performance lever on both client and server and the biggest source of subtle bugs. Interviewers ask about strategies, invalidation, HTTP caching headers and stampedes to see if you understand trade-offs, not just "use Redis".</p>`,
tech:`<ul class="pts"><li><b>Layers (closest to farthest):</b> browser memory/HTTP cache/service worker → CDN/edge → reverse proxy → application cache (in-process, Redis/Memcached) → database buffer/query caches.</li><li><b>Patterns:</b> <b>cache-aside</b> (app checks cache, loads from DB on miss, then fills cache; most common), <b>read-through</b>, <b>write-through</b> (write cache and DB together), <b>write-behind</b> (async DB write; risk of loss), <b>refresh-ahead</b>.</li><li><b>HTTP caching:</b> <code>Cache-Control: max-age=60</code> (browser), <code>s-maxage</code> (shared caches), <code>immutable</code> (hashed assets), <code>no-cache</code> (store but revalidate), <code>no-store</code> (never store), <code>stale-while-revalidate</code>, <code>private</code>/<code>public</code>. <b>Validators:</b> <code>ETag</code> + <code>If-None-Match</code> and <code>Last-Modified</code> + <code>If-Modified-Since</code> yield <b>304 Not Modified</b> (no body). <code>Vary</code> declares which request headers change the response.</li><li><b>Invalidation strategies:</b> TTL (simple, bounded staleness), explicit purge on write, <b>versioned keys</b> (<code>user:42:v7</code>, hashed filenames: never need to purge), tag-based purge at the CDN, event-driven invalidation. "There are only two hard things: cache invalidation and naming things."</li><li><b>Stampede (thundering herd) protection:</b> <b>single-flight</b> (coalesce concurrent misses into one load), <b>jittered TTLs</b> (avoid synchronized expiry), locks/leases, serve-stale-while-revalidate, negative caching (cache "not found" briefly).</li><li><b>Design questions:</b> what is the staleness budget? What is the key (include user, locale, params)? What is the eviction policy (LRU/LFU)? What if the cache is down (degrade, don't fail)? Never cache personalized responses in shared caches without <code>Vary</code>/<code>private</code>.</li></ul>`,
diagram:{html:flow([["request"],["cache hit?","yes → return fast","g"],["miss → single-flight load","one DB call for N waiters","w"],["fill cache with jittered TTL","w"],["respond"]]),steps:["Most requests are answered from the cache.","On a miss, concurrent requests for the same key share one load instead of each hitting the database.","The value is stored with a TTL plus random jitter so many keys don't expire together.","Staleness is bounded by the TTL and by explicit invalidation on writes."]},
ex:[{t:"Cache-aside with TTL, single-flight, ETags and Cache-Control (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Cache-aside with TTL and an injected clock
const makeCache = (now, ttl) => {
  const m = new Map();
  return { get(k){ const e = m.get(k); if (!e) return undefined; if (now() >= e.exp) { m.delete(k); return undefined; } return e.v; }, set(k, v, t = ttl){ m.set(k, { v, exp: now() + t }); } };
};
let clock = 0, dbCalls = 0;
const cache = makeCache(() => clock, 1000);
const db = async (id) => { dbCalls++; return { id, name: "user" + id }; };
const getUser = async (id) => { const hit = cache.get(id); if (hit !== undefined) return hit; const v = await db(id); cache.set(id, v); return v; };
// Single-flight: coalesce concurrent misses
const singleFlight = (fn) => { const inflight = new Map(); return (k) => { if (inflight.has(k)) return inflight.get(k); const p = fn(k).finally(() => inflight.delete(k)); inflight.set(k, p); return p; }; };
// ETag / conditional GET
const etagOf = (body) => { let h = 2166136261; for (const c of body) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return '"' + h.toString(16) + '"'; };
const serve = (body, ifNoneMatch) => { const etag = etagOf(body); return ifNoneMatch === etag ? { status: 304, etag, body: null } : { status: 200, etag, body }; };
// Cache-Control parsing and freshness
const parseCC = (h) => Object.fromEntries(h.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).map((d) => { const [k, v] = d.split("="); return [k, v === undefined ? true : isNaN(v) ? v : Number(v)]; }));
const state = (cc, age) => {
  if (cc["no-store"]) return "never cached";
  if (cc["no-cache"]) return "must revalidate";
  const fresh = cc["max-age"] ?? 0;
  if (age < fresh) return "fresh";
  if (age < fresh + (cc["stale-while-revalidate"] ?? 0)) return "serve stale + revalidate";
  return "stale: revalidate";
};
const jitter = (ttl, rand = Math.random) => Math.round(ttl * (0.9 + rand() * 0.2));
(async () => {
  await getUser(1); await getUser(1);
  check("cache-aside: the second read does not hit the database", dbCalls === 1);
  clock = 1500; await getUser(1);
  check("after the TTL the entry expires and is reloaded", dbCalls === 2);
  let loads = 0;
  const load = singleFlight(async (k) => { loads++; await sleep(10); return "value:" + k; });
  const results = await Promise.all(Array.from({ length: 50 }, () => load("hot")));
  check("single-flight: 50 concurrent misses cause 1 load (" + loads + ")", loads === 1 && results.every((r) => r === "value:hot"));
  await load("hot");
  check("after completing, the next miss loads again (entry removed)", loads === 2);
  const first = serve("<html>v1</html>");
  const repeat = serve("<html>v1</html>", first.etag);
  const changed = serve("<html>v2</html>", first.etag);
  check("conditional GET: unchanged content returns 304 with no body", first.status === 200 && repeat.status === 304 && repeat.body === null);
  check("changed content returns 200 with a new ETag", changed.status === 200 && changed.etag !== first.etag);
  const cc = parseCC("public, max-age=60, stale-while-revalidate=30");
  check("Cache-Control parsing", cc.public === true && cc["max-age"] === 60 && cc["stale-while-revalidate"] === 30 && parseCC("immutable, max-age=31536000").immutable === true);
  check("freshness states over time", state(cc, 10) === "fresh" && state(cc, 70) === "serve stale + revalidate" && state(cc, 120) === "stale: revalidate");
  check("no-store and no-cache differ", state(parseCC("no-store"), 0) === "never cached" && state(parseCC("no-cache"), 0) === "must revalidate");
  check("jittered TTLs stay within +/-10% and spread out", [0, 0.5, 1].map((r) => jitter(1000, () => r)).join() === "900,1000,1100");
})();`}],
gotchas:[`Caching without a clear invalidation or staleness policy; "we'll purge manually" doesn't scale.`,`A cache key that omits something the response depends on (user, locale, feature flags) serves the wrong data to the wrong people.`,`<code>no-cache</code> does not mean "don't cache" (that's <code>no-store</code>); it means revalidate before use.`,`Synchronized expiry or a cold cache after a deploy causes stampedes that take the database down.`,`Caching errors or empty results for too long; use short negative-cache TTLs.`,`Treating the cache as the source of truth: it can be evicted or lost at any time.`,`Caching personalized responses at a CDN without <code>Cache-Control: private</code>/<code>Vary</code> leaks data between users.`],
best:[`Define the staleness budget per data type, then pick TTL, versioning or event-driven invalidation to meet it.`,`Add single-flight, jittered TTLs and stale-while-revalidate for hot keys; make the system work (slower) when the cache is down.`,`Use hashed filenames with <code>immutable</code> for assets; short TTL or revalidation for HTML and APIs.`],
iq:[["mid","Explain cache-aside.","The application checks the cache first; on a miss it loads from the database, stores the result in the cache with a TTL and returns it; writes update the database and invalidate or update the cache."],["senior","What is a cache stampede and how do you prevent it?","Many requests miss at once (expiry or cold start) and all hit the backend. Prevent with single-flight/request coalescing, jittered TTLs, locks, stale-while-revalidate and pre-warming."],["senior","no-cache vs no-store vs max-age?","no-store: never store; no-cache: store but revalidate each time (ETag/304); max-age: fresh for N seconds without contacting the origin."],["architect","Design caching for a high-traffic product page.","CDN cache with s-maxage and stale-while-revalidate for the shell, ETags, personalized parts fetched separately (private) or via edge includes, application cache with single-flight for price/stock, versioned keys and event-driven purge on updates, and monitoring of hit rate and origin load."]],
practice:[`Add stale-while-revalidate to the cache-aside helper (serve stale instantly, refresh in the background).`,`Design cache keys and invalidation for a search results page with filters and user locale.`],
teach:`<p>"Keep a copy nearby, decide how stale it may get, share one fetch among everyone who asks at once, spread out expiry times so everyone doesn't return at the same moment, and never trust the cache as the only copy."</p>`}
],quiz:[
{code:`const q = (name) => "SELECT * FROM u WHERE name = '" + name + "'";
console.log(q("o'brien"));
console.log(q("x' OR '1'='1"));`,ans:`SELECT * FROM u WHERE name = 'o'brien' (a syntax error), then ... name = 'x' OR '1'='1' (matches every row)`,why:`Concatenation breaks even on innocent input (an apostrophe) and lets malicious input change the query's meaning. Parameterized queries avoid both.`},
{code:`const posts = Array.from({ length: 5 });
let queries = 1; posts.forEach(() => queries++);
const batched = 2;
console.log(queries, batched);`,ans:`6 2`,why:`N+1: one query for the list plus one per item (6 for 5 posts). Batching authors in a single IN query keeps it at 2 regardless of list size.`}]},

{n:53,title:"Git, CI and deployment",goal:"Understand version control, automated pipelines and how code reaches production safely.",topics:[
{id:"d53-git-ci",title:"Git workflows and CI pipelines",lv:["fresher","mid","senior","lead"],
eli5:`<p>Git is a <b>time machine with parallel timelines</b>. Every save (commit) points to the one before it; a branch is just a sticky note on one of those saves. <b>Merging</b> joins two timelines with a "join" save; <b>rebasing</b> replays your saves on top of the latest ones for a straight line. <b>CI</b> is a robot that, every time someone proposes a change, builds and tests it on a clean machine and says "safe" or "not safe".</p>`,
why:`<p>Every team uses Git and CI. Understanding the commit graph, branching strategies and pipeline design is expected for mid-to-lead roles, and is how fast teams ship small changes safely.</p>`,
tech:`<ul class="pts"><li><b>Model:</b> commits form a <b>DAG</b> (each commit points to its parent(s)); a <b>branch</b> is a movable pointer; <b>HEAD</b> is where you are; the <b>index/staging area</b> is what the next commit will contain. <code>reflog</code> remembers where HEAD has been (your safety net).</li><li><b>Integrating:</b> <b>merge</b> (preserves history, creates a merge commit unless fast-forward), <b>rebase</b> (rewrites your commits onto a new base for linear history; never rebase shared branches), <b>squash merge</b> (one commit per PR), <b>cherry-pick</b>, <b>revert</b> (safe undo on shared history), <b>reset</b> (move the branch pointer; destructive if pushed). <b>merge-base</b> = the common ancestor used by 3-way merges.</li><li><b>Useful tools:</b> <code>stash</code>, <code>bisect</code> (binary search for the bad commit, Day 45), <code>blame</code>, <code>restore</code>, interactive rebase to tidy commits, hooks (lint-staged/husky), <code>.gitignore</code>, signed commits.</li><li><b>Branching strategies:</b> <b>trunk-based development</b> (short-lived branches, merge to main daily, feature flags; best for CD) vs GitFlow (long-lived develop/release branches; heavier).</li><li><b>Conventional Commits</b> (<code>feat:</code>, <code>fix:</code>, <code>feat!:</code> or <code>BREAKING CHANGE</code>) drive <b>semantic versioning</b> and changelogs automatically (semantic-release, changesets).</li><li><b>CI pipeline stages:</b> checkout → install (<code>npm ci</code> with cache) → lint → type-check → unit tests → build → integration/e2e → security audit → publish artifact; run in parallel where possible; <b>required checks + code review</b> gate merges; <b>CD</b> deploys the same immutable artifact to environments with approvals and automated rollback.</li><li><b>Good practice:</b> small PRs, fast pipelines (&lt; 10 minutes), flaky-test quarantine, secrets via the CI secret store (never in the repo), protected branches, CODEOWNERS.</li></ul>`,
diagram:{html:flow([["A"],["B"],["C","feature"],["D","main"],["E = merge(C, D)","merge-base = B","w"]])+flow([["push / PR"],["CI: install → lint → types → test → build","clean machine","w"],["review + required checks","g"],["merge → deploy artifact","g"]]),steps:["Two branches diverged from B; a three-way merge uses B (the merge-base) plus both tips.","Rebase instead replays C's changes on top of D for a straight line.","CI proves each change on a clean environment with the same steps every time.","Only green, reviewed changes merge; the build artifact that passed is what gets deployed."]},
ex:[{t:"Conventional commits to semantic versions, and merge-base on a commit DAG (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const parseCommit = (msg) => {
  const first = msg.split(String.fromCharCode(10))[0];
  const m = /^([a-z]+)(\\([^)]*\\))?(!)?: (.+)$/.exec(first);
  if (!m) return { type: "other", breaking: false, subject: first };
  return { type: m[1], scope: m[2] ? m[2].slice(1, -1) : undefined, breaking: !!m[3] || msg.includes("BREAKING CHANGE"), subject: m[4] };
};
const nextVersion = (v, msgs) => {
  const [M, m, p] = v.split(".").map(Number), cs = msgs.map(parseCommit);
  if (cs.some((c) => c.breaking)) return [M + 1, 0, 0].join(".");
  if (cs.some((c) => c.type === "feat")) return [M, m + 1, 0].join(".");
  if (cs.some((c) => c.type === "fix" || c.type === "perf")) return [M, m, p + 1].join(".");
  return v;
};
const changelog = (msgs) => {
  const groups = {};
  for (const c of msgs.map(parseCommit)) { if (c.type === "other") continue; (groups[c.type] ??= []).push((c.scope ? c.scope + ": " : "") + c.subject); }
  return groups;
};
const c1 = parseCommit("feat(api)!: drop the v1 endpoint");
check("parsing type, scope, breaking marker and subject", c1.type === "feat" && c1.scope === "api" && c1.breaking && c1.subject === "drop the v1 endpoint");
check("BREAKING CHANGE in the body also counts", parseCommit("fix: x" + String.fromCharCode(10) + "BREAKING CHANGE: y").breaking);
check("fix and docs only: patch bump", nextVersion("1.4.2", ["fix: a", "docs: b"]) === "1.4.3");
check("any feat: minor bump", nextVersion("1.4.2", ["fix: a", "feat: b"]) === "1.5.0");
check("any breaking change: major bump", nextVersion("1.4.2", ["feat: b", "refactor!: c"]) === "2.0.0");
check("only chores: no release", nextVersion("1.4.2", ["chore: deps", "docs: readme"]) === "1.4.2");
check("changelog groups by type", JSON.stringify(changelog(["feat(ui): dark mode", "fix: crash", "feat: export", "wip stuff"])) === '{"feat":["ui: dark mode","export"],"fix":["crash"]}');
const dag = { A: [], B: ["A"], C: ["B"], D: ["B"], E: ["C", "D"], F: ["D"] };      // commit -> parents
const ancestors = (c, seen = new Set()) => { if (seen.has(c)) return seen; seen.add(c); for (const p of dag[c]) ancestors(p, seen); return seen; };
const mergeBase = (x, y) => { const ax = ancestors(x), q = [y], seen = new Set(); for (let i = 0; i < q.length; i++) { const c = q[i]; if (seen.has(c)) continue; seen.add(c); if (ax.has(c)) return c; q.push(...dag[c]); } return null; };
check("merge-base of two diverged branches is their common ancestor", mergeBase("C", "F") === "B" && mergeBase("E", "F") === "D");
check("fast-forward is possible when one tip is an ancestor of the other", ancestors("E").has("B") && !ancestors("B").has("E"));`},
{t:"A CI workflow (reference)",code:`# .github/workflows/ci.yml
name: ci
on: { pull_request: {}, push: { branches: [main] } }
concurrency: { group: ci-\${{ github.ref }}, cancel-in-progress: true }
jobs:
  test:
    runs-on: ubuntu-latest
    strategy: { matrix: { node: [24, 26] } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: \${{ matrix.node }}, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck --if-present
      - run: npm test -- --coverage
      - run: npm run build
      - run: npm audit --audit-level=high
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production        # requires approval; secrets live in the environment
    steps:
      - uses: actions/download-artifact@v4   # deploy the SAME artifact that passed tests
      - run: ./scripts/deploy.sh`,run:false}],
gotchas:[`Rebasing or force-pushing shared branches rewrites history for everyone; only rebase your own unpublished work.`,`<code>git reset --hard</code> discards work; recover from <code>git reflog</code> if needed.`,`Long-lived branches cause painful merges; integrate small changes frequently.`,`Secrets committed to Git live in history forever; rotate them and rewrite history only as a last step.`,`CI that differs from local (Node version, OS, caches) causes "works on my machine"; pin versions and use <code>npm ci</code>.`,`Flaky tests erode trust; quarantine and fix them rather than rerunning until green.`,`Rebuilding artifacts per environment means you deploy something different from what you tested.`],
best:[`Use small PRs, protected main, required checks and code review; prefer trunk-based development with feature flags.`,`Adopt Conventional Commits or changesets to automate versioning and changelogs.`,`Keep CI fast, deterministic and reproducible; build once, promote the same artifact.`],
iq:[["fresher","Merge vs rebase?","Merge joins histories with a merge commit and preserves the real timeline; rebase replays your commits on a new base for a linear history. Don't rebase commits others have pulled."],["mid","What does a CI pipeline do?","On each change it builds and tests on a clean machine (install, lint, types, tests, build, audit), reports status, gates merges, and can publish artifacts."],["senior","How would you automate releases and versioning?","Use Conventional Commits with semantic-release or changesets to compute the next semver, generate the changelog, tag, publish and deploy from CI with provenance."],["lead","Trunk-based vs GitFlow?","Trunk-based uses short-lived branches merged to main frequently behind feature flags, enabling continuous delivery; GitFlow uses long-lived develop/release branches, adding overhead and merge pain, suited to scheduled releases."]],
practice:[`Set up a CI workflow that lints, tests and builds on every PR with an npm cache, and make it a required check.`,`Use <code>git bisect run</code> with a test script to find a regression, then write the revert commit message in Conventional Commits style.`],
teach:`<p>"Commits form a graph of saves; branches are sticky notes; merge joins timelines and rebase replays yours on top. A CI robot builds and tests every change on a clean machine, and conventional commit messages let tools pick the next version number."</p>`},

{id:"d53-containers-deploy",title:"Containers, 12-factor and deployment",lv:["mid","senior","lead","architect"],
eli5:`<p>A <b>container</b> is a <b>shipping container for software</b>: the app and everything it needs, sealed, so it runs the same on your laptop and in the cloud. <b>12-factor</b> are house rules for apps that move well: keep settings outside the box (environment), don't store things inside the box (stateless), write a diary to the screen (logs to stdout), and be fine with being stopped and started often. <b>Graceful shutdown</b> is closing a shop politely: stop letting new customers in, finish serving the ones inside, then lock up.</p>`,
why:`<p>Writing code is half the job; running it reliably is the other half. Interviewers for senior roles expect you to know how apps are packaged, configured and rolled out, and how to avoid dropping requests during deploys.</p>`,
tech:`<ul class="pts"><li><b>Docker for Node:</b> <b>multi-stage builds</b> (build stage with dev dependencies, runtime stage with only production files), small base images (<code>node:24-slim</code>/alpine/distroless), copy <code>package*.json</code> first to cache installs, <code>npm ci --omit=dev</code>, <code>.dockerignore</code>, run as a <b>non-root</b> user, <code>HEALTHCHECK</code>, set <code>NODE_ENV=production</code>, and run <code>node</code> directly (or <code>tini</code>) as PID 1 so signals reach it.</li><li><b>12-factor essentials:</b> config in <b>environment variables</b> (validate at startup), stateless processes (state in databases/caches), logs as an event stream on stdout/stderr, dev/prod parity, disposability (fast start, graceful stop), backing services as attached resources, one codebase with many deploys.</li><li><b>Env values are strings:</b> <code>"false"</code> is truthy; parse and validate explicitly and fail fast with a clear list of problems.</li><li><b>Graceful shutdown:</b> on <code>SIGTERM</code> stop accepting new work (fail readiness), finish in-flight requests with a timeout, close pools, then exit; orchestrators send SIGTERM then SIGKILL after a grace period.</li><li><b>Hosting models:</b> <b>static hosting + CDN</b> (SPAs, SSG), <b>PaaS</b> (Heroku-style), <b>containers</b> (ECS/Kubernetes/Cloud Run), <b>serverless</b> functions (scale to zero, cold starts, time/memory limits, no local state) and <b>edge runtimes</b> (very low latency, restricted APIs). Choose by traffic shape, latency, cost, ops capacity and runtime limits.</li><li><b>Release strategies</b> (Day 38): rolling, blue-green (switch traffic between two stacks), canary, feature flags. <b>Zero-downtime DB changes:</b> expand → migrate → contract; keep old and new code compatible during rollout.</li><li><b>Operate:</b> health/readiness probes, resource limits, autoscaling, secrets from a secret manager, immutable images tagged by commit SHA, infrastructure as code (Terraform), observability (Day 29).</li></ul>`,
diagram:{html:flow([["SIGTERM received"],["stop accepting new requests","readiness fails","w"],["finish in-flight work","with a timeout","w"],["close DB pool, flush logs","g"],["exit 0","SIGKILL if too slow","r"]]),steps:["The orchestrator signals the process to stop before killing it.","The app removes itself from load balancing and refuses new work.","In-flight requests complete (or hit a deadline) so users don't see errors.","Resources are closed cleanly and the process exits."]},
ex:[{t:"Config validation and graceful shutdown (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const loadConfig = (env, schema) => {
  const cfg = {}, errors = [];
  for (const [k, s] of Object.entries(schema)) {
    const raw = env[k];
    if (raw === undefined || raw === "") { if ("default" in s) cfg[k] = s.default; else if (s.required) errors.push(k + " is required"); continue; }
    if (s.type === "number") { const n = Number(raw); if (!Number.isFinite(n)) { errors.push(k + " must be a number"); continue; } cfg[k] = n; }
    else if (s.type === "boolean") { if (raw !== "true" && raw !== "false") { errors.push(k + ' must be "true" or "false"'); continue; } cfg[k] = raw === "true"; }
    else cfg[k] = raw;
    if (s.oneOf && !s.oneOf.includes(cfg[k])) errors.push(k + " must be one of " + s.oneOf.join("|"));
  }
  if (errors.length) throw new Error("Invalid configuration: " + errors.join("; "));
  return cfg;
};
const schema = { PORT: { type: "number", default: 3000 }, DEBUG: { type: "boolean", default: false }, DATABASE_URL: { required: true }, NODE_ENV: { oneOf: ["development", "production", "test"], default: "development" } };
const ok = loadConfig({ PORT: "8080", DEBUG: "false", DATABASE_URL: "postgres://x" }, schema);
check("values are coerced from strings, with defaults applied", ok.PORT === 8080 && ok.DEBUG === false && ok.NODE_ENV === "development");
check('the classic bug: Boolean("false") is true, so parse explicitly', Boolean("false") === true && ok.DEBUG === false);
let msg = ""; try { loadConfig({ PORT: "abc", DEBUG: "yes", NODE_ENV: "staging" }, schema); } catch (e) { msg = e.message; }
check("startup fails fast with every problem listed", msg.includes("PORT must be a number") && msg.includes('DEBUG must be "true" or "false"') && msg.includes("DATABASE_URL is required") && msg.includes("NODE_ENV must be one of"));
function createLifecycle(){
  let inflight = 0, closing = false; const waiters = [];
  const settle = () => { if (closing && inflight === 0) waiters.splice(0).forEach((r) => r()); };
  return {
    async run(task){ if (closing) throw new Error("shutting down"); inflight++; try { return await task(); } finally { inflight--; settle(); } },
    shutdown(){ closing = true; return new Promise((r) => { waiters.push(r); settle(); }); },
    get inflight(){ return inflight; }
  };
}
(async () => {
  const life = createLifecycle();
  const done = [];
  const t1 = life.run(async () => { await sleep(15); done.push("t1"); });
  const t2 = life.run(async () => { await sleep(5); done.push("t2"); });
  const stopping = life.shutdown();
  let refused = ""; try { await life.run(async () => {}); } catch (e) { refused = e.message; }
  check("after SIGTERM new work is refused", refused === "shutting down");
  await stopping;
  check("shutdown resolves only after in-flight work finished", done.join() === "t2,t1" && life.inflight === 0);
  await Promise.all([t1, t2]);
  const idle = createLifecycle();
  check("shutting down an idle service resolves immediately", (await Promise.race([idle.shutdown().then(() => "done"), sleep(50).then(() => "timeout")])) === "done");
})();`},
{t:"A production Dockerfile for Node (reference)",code:`# syntax=docker/dockerfile:1
FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                              # cached unless package files change
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package.json ./
USER node                               # never run as root
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://localhost:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]          # exec form: node is PID 1 and receives SIGTERM

# .dockerignore:  node_modules  .git  .env  dist  coverage`,run:false}],
gotchas:[`Running as root and copying <code>.env</code> or secrets into images; secrets belong in a secret manager or runtime env.`,`Using <code>CMD npm start</code> (shell form) means signals may not reach Node, so graceful shutdown never runs.`,`Environment variables are strings; <code>process.env.DEBUG = "false"</code> is truthy.`,`Local file storage inside a container is lost on restart and not shared between replicas.`,`Cold starts and execution-time limits in serverless affect design (keep functions small, reuse connections carefully).`,`Tagging images <code>latest</code> makes rollbacks and audits impossible; tag by commit SHA.`,`Forgetting readiness vs liveness probes: one decides routing, the other decides restarts.`],
best:[`Build once, run anywhere: immutable images tagged by commit, configuration from the environment, validated at startup.`,`Handle SIGTERM and drain in-flight requests; set sensible timeouts and resource limits.`,`Pick the hosting model by workload; keep the app stateless so any model works.`],
iq:[["mid","What are the 12-factor principles you rely on most?","Config in the environment, stateless processes, logs to stdout, dev/prod parity, disposability (fast start and graceful shutdown), and treating backing services as attached resources."],["senior","How do you do a zero-downtime deploy?","Rolling or blue-green/canary releases behind a load balancer with readiness probes, graceful shutdown of old instances, backwards-compatible schema changes (expand/migrate/contract), and fast rollback."],["architect","Serverless vs containers?","Serverless gives scale-to-zero and low ops for spiky or event-driven work but has cold starts, limits and vendor coupling; containers offer control, steady performance and portability at the cost of more operations. Choose by traffic shape, latency, cost and team skills."]],
practice:[`Write a Dockerfile for a Node API, measure the image size before and after multi-stage and slim base images.`,`Add SIGTERM handling and a readiness endpoint to an HTTP server and verify no requests are dropped during a rolling restart.`],
teach:`<p>"A container ships the app with everything it needs. Keep settings in the environment (as strings you must parse), keep the app stateless, log to the screen, and when told to stop, finish serving the customers inside before closing."</p>`}
],quiz:[
{code:`const bump = (v, commits) => { const [M, m, p] = v.split('.').map(Number); if (commits.some(c => c.includes('!:'))) return [M + 1, 0, 0].join('.'); if (commits.some(c => c.startsWith('feat'))) return [M, m + 1, 0].join('.'); return [M, m, p + 1].join('.'); };
console.log(bump('1.2.3', ['fix: a']), bump('1.2.3', ['feat: b', 'fix: a']), bump('1.2.3', ['feat!: c']));`,ans:`1.2.4 1.3.0 2.0.0`,why:`A fix bumps the patch, a feature bumps the minor (resetting patch), and a breaking change bumps the major (resetting the others).`},
{code:`const dag = { D: ['B', 'C'], B: ['A'], C: ['A'], A: [] };
const anc = (c, s = new Set()) => { for (const p of dag[c]) { s.add(p); anc(p, s); } return s; };
console.log([...anc('D')].sort().join(''), anc('D').size);`,ans:`ABC 3`,why:`D is a merge commit with parents B and C, which both descend from A, so D has exactly three ancestors in the graph.`}]},

{n:54,title:"Advanced runtime and tools",goal:"Know where JavaScript meets low-level systems (WebAssembly, atomics) and how the tools you use every day actually work.",topics:[
{id:"d54-wasm-concurrency",title:"WebAssembly, SharedArrayBuffer and Atomics",lv:["senior","architect"],
eli5:`<p><b>WebAssembly</b> is a <b>second, very fast language the browser understands</b>, like a pre-assembled engine you can plug into your JavaScript car. It only knows numbers; for anything fancy like text, you and the engine share a <b>notebook (memory)</b> and agree where to write. <b>Atomics</b> are the "one at a time" rules for several workers sharing that notebook so they don't scribble over each other.</p>`,
why:`<p>Some work (codecs, image processing, physics, crypto, porting existing C/C++/Rust libraries) is better done in compiled code. Understanding how JS and WebAssembly interact, and how threads share memory safely, rounds out an architect's view of the platform.</p>`,
tech:`<ul class="pts"><li><b>WebAssembly (Wasm):</b> a compact binary format with a stack-based instruction set, compiled ahead of time from Rust, C/C++, Go, AssemblyScript and others; validated, <b>sandboxed</b>, near-native speed with predictable performance. Runs in browsers, Node, Deno and edge runtimes (and outside browsers via WASI).</li><li><b>Loading:</b> <code>WebAssembly.instantiateStreaming(fetch("x.wasm"), imports)</code> (or <code>instantiate(bytes)</code>), then call <code>instance.exports.fn(...)</code>. <b>Imports</b> let Wasm call JS functions.</li><li><b>Types:</b> only <code>i32, i64 (BigInt in JS), f32, f64</code> (plus reference types). <b>i32 arithmetic wraps</b> (two's complement).</li><li><b>Linear memory:</b> <code>WebAssembly.Memory</code> is a resizable <code>ArrayBuffer</code> counted in 64 KiB pages. <b>Strings, arrays and structs cross the boundary through memory</b> (pointer + length; glue code generated by wasm-bindgen/Emscripten). <code>memory.grow()</code> <b>detaches the old buffer</b>; re-create typed-array views after growing.</li><li><b>When it helps:</b> CPU-bound numeric kernels, existing native libraries, consistent performance. <b>When it doesn't:</b> DOM-heavy code, small functions called very frequently (boundary overhead), anything the JIT already handles well. Always benchmark.</li><li><b>Shared memory:</b> <code>SharedArrayBuffer</code> lets workers share bytes without copying; it requires <b>cross-origin isolation</b> (COOP/COEP headers). Unsynchronized access causes data races.</li><li><b>Atomics:</b> operations on integer typed arrays: <code>add/sub/and/or/xor</code>, <code>load/store</code>, <code>exchange</code>, <code>compareExchange</code> (the basis of locks), <code>wait/notify</code> (blocking waits only in workers), <code>waitAsync</code> (non-blocking). Atomics make single operations indivisible and enforce ordering.</li></ul>`,
diagram:{html:lanes([["JavaScript",["calls exports.add(2, 3)","reads results from memory","provides imports"]],["WebAssembly module",["typed functions (i32, f64…)","linear memory (64 KiB pages)","sandboxed, validated"]],["Shared memory",["SharedArrayBuffer + Atomics","workers read/write safely","needs COOP + COEP"]]]),steps:["JavaScript instantiates the module and calls exported functions with numbers.","Complex data is exchanged by writing to shared linear memory and passing pointers.","With SharedArrayBuffer, multiple workers can use the same memory; Atomics provide safe, ordered operations.","Growing memory invalidates old buffer views; refresh them."]},
ex:[{t:"A hand-assembled Wasm module, memory growth and Atomics (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
// The smallest useful module: exports add(i32, i32) -> i32
const bytes = new Uint8Array([0,97,115,109,1,0,0,0,1,7,1,96,2,127,127,1,127,3,2,1,0,7,7,1,3,97,100,100,0,0,10,9,1,7,0,32,0,32,1,106,11]);
check("the bytes form a valid WebAssembly module", WebAssembly.validate(bytes));
const mem = new WebAssembly.Memory({ initial: 1, maximum: 3 });
const before = mem.buffer;
check("memory starts at one 64 KiB page", before.byteLength === 65536);
new Uint8Array(mem.buffer)[0] = 42;
check("JS can read and write linear memory through typed arrays", new Uint8Array(mem.buffer)[0] === 42);
const oldPages = mem.grow(1);
check("grow returns the previous size in pages and enlarges the memory", oldPages === 1 && mem.buffer.byteLength === 131072);
check("growing detaches the old buffer, so re-create your views", before.byteLength === 0 && new Uint8Array(mem.buffer)[0] === 42);
let tooBig = ""; try { mem.grow(5); } catch (e) { tooBig = e.name; }
check("growing past the maximum throws", tooBig === "RangeError");
const a = new Int32Array(2);
check("Atomics.add returns the OLD value", Atomics.add(a, 0, 5) === 0 && Atomics.load(a, 0) === 5);
check("compareExchange only writes when the expected value matches", Atomics.compareExchange(a, 0, 5, 9) === 5 && a[0] === 9 && Atomics.compareExchange(a, 0, 5, 1) === 9 && a[0] === 9);
const lock = new Int32Array(1);
const tryLock = () => Atomics.compareExchange(lock, 0, 0, 1) === 0;
const unlock = () => Atomics.store(lock, 0, 0);
check("a compareExchange spin-lock: first acquirer wins, second fails until release", tryLock() && !tryLock() && (unlock(), tryLock()));
(async () => {
  const { instance } = await WebAssembly.instantiate(bytes);
  check("calling a Wasm export from JS", instance.exports.add(2, 3) === 5);
  check("i32 arithmetic wraps like two's complement", instance.exports.add(2147483647, 1) === -2147483648);
  console.log("SharedArrayBuffer available here:", typeof SharedArrayBuffer === "function", "| cross-origin isolated:", self.crossOriginIsolated === true);
})();`}],
gotchas:[`Calling tiny Wasm functions from JS in a hot loop can be slower than staying in JS because of boundary overhead; batch the work.`,`After <code>memory.grow()</code> existing <code>ArrayBuffer</code>/typed-array views become detached (length 0).`,`Wasm integers are 32-bit (i64 maps to BigInt); overflow wraps silently.`,`<code>SharedArrayBuffer</code> is unavailable without COOP/COEP cross-origin isolation, which can break third-party embeds and OAuth popups.`,`Atomics fix single operations only; multi-step invariants still need locks or a different design.`,`<code>Atomics.wait</code> blocks the thread and is not allowed on the main thread; use <code>waitAsync</code> there.`,`Wasm doesn't automatically make code faster; measure against optimized JS first.`],
best:[`Use Wasm for isolated compute-heavy modules behind a small JS API; use libraries to generate bindings.`,`Prefer message passing and transferables for concurrency; use shared memory only where measurements justify the complexity.`,`Load with <code>instantiateStreaming</code> and cache the compiled module.`],
iq:[["senior","When would you use WebAssembly?","For CPU-bound numeric kernels, codecs, image/video processing, cryptography or porting existing C/C++/Rust libraries where predictable near-native speed matters; not for DOM-heavy or chatty code."],["senior","How do strings cross the JS/Wasm boundary?","Wasm only has numeric types, so you encode the string into linear memory (UTF-8) and pass a pointer and length; glue code (wasm-bindgen/Emscripten) automates this."],["architect","What does cross-origin isolation enable and cost?","It enables SharedArrayBuffer and high-resolution timers by isolating the browsing context group (COOP + COEP headers), at the cost of restricting cross-origin popups and embeds that don't opt in."]],
practice:[`Compile a small Rust or AssemblyScript function to Wasm and call it from the browser; benchmark against JS for 1e7 iterations.`,`Implement a worker-pool counter using <code>SharedArrayBuffer</code> and <code>Atomics.add</code> (needs cross-origin isolation).`],
teach:`<p>"WebAssembly is a fast engine you plug into JavaScript: it only speaks numbers and shares a notebook (memory) with JS. Atomics are the one-at-a-time rules for several workers writing in the same notebook."</p>`},

{id:"d54-compilers-ast",title:"How tools work: tokenizer, parser, AST",lv:["senior","lead","architect"],
eli5:`<p>When you read "2 + 3 × 4" your brain splits it into pieces (<b>tokens</b>), groups them with the right priority (× before +) into a <b>tree</b>, and then works out the answer from the bottom. Tools like linters, Prettier, Babel, TypeScript and bundlers do exactly that with code: read the text, build a tree (the <b>AST</b>), look at or change the tree, and write it out again.</p>`,
why:`<p>Understanding ASTs demystifies the toolchain (ESLint rules, codemods, Babel plugins, minifiers, bundlers) and lets you write your own transformations. It's also a favorite "how would you build a calculator/parser" interview question.</p>`,
tech:`<ol><li><b>Tokenizing (lexing):</b> turn characters into tokens (numbers, identifiers, operators, strings), skipping whitespace and comments.</li><li><b>Parsing:</b> turn tokens into a tree following the grammar. For expressions, <b>precedence climbing / Pratt parsing</b> handles operator priority and associativity (left for <code>- /</code>, right for <code>^</code> and assignment).</li><li><b>AST:</b> a tree of nodes like <code>{type: "Bin", op: "+", left, right}</code>; it drops syntax noise (parentheses, semicolons) but keeps structure and source locations.</li><li><b>Analyze/transform:</b> a <b>visitor</b> walks the tree: lint rules report patterns (<code>no-var</code>, division by zero), codemods rewrite nodes, minifiers fold constants and rename variables, bundlers find <code>import</code>s for tree-shaking (Day 24), TypeScript checks types.</li><li><b>Generate/evaluate:</b> print code from the tree (Prettier, Babel), compile to bytecode (V8, Day 21), or interpret directly.</li></ol>
<ul class="pts"><li><b>Real tools:</b> parsers like Acorn, Babel parser, SWC, Oxc, and TypeScript's compiler produce ESTree-style ASTs; AST Explorer (astexplorer.net) lets you inspect them.</li><li><b>Error handling:</b> good parsers report the position and expected token; recoverable parsing powers editor features.</li><li><b>Source maps</b> map generated code back to original positions so debuggers show your source (Day 45).</li></ul>`,
diagram:{html:flow([["\"1 + 2 * x\""],["tokens","1 + 2 * x","w"],["AST","+(1, *(2, x))","g"],["transform","fold constants / lint","w"],["evaluate or print","g"]]),steps:["The tokenizer produces a flat list: number, plus, number, times, identifier.","The parser uses precedence so 2 * x groups before the addition, giving a tree.","Passes walk the tree to analyze or rewrite it (for example folding 2 * 3 into 6).","Finally the tree is evaluated, printed back as source or compiled."]},
ex:[{t:"A tokenizer, precedence-climbing parser, evaluator, constant folder and visitor (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const tokenize = (src) => {
  const t = []; let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " ") { i++; continue; }
    if ("+-*/()^".includes(c)) { t.push({ type: "op", v: c }); i++; continue; }
    if ((c >= "0" && c <= "9") || c === ".") { let j = i; while (j < src.length && ((src[j] >= "0" && src[j] <= "9") || src[j] === ".")) j++; t.push({ type: "num", v: parseFloat(src.slice(i, j)) }); i = j; continue; }
    if (/[a-z_]/i.test(c)) { let j = i; while (j < src.length && /[a-z0-9_]/i.test(src[j])) j++; t.push({ type: "id", v: src.slice(i, j) }); i = j; continue; }
    throw new SyntaxError("Unexpected character '" + c + "' at " + i);
  }
  return t;
};
const PREC = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
const parse = (tokens) => {
  let p = 0; const peek = () => tokens[p], next = () => tokens[p++];
  const primary = () => {
    const t = next();
    if (!t) throw new SyntaxError("Unexpected end of input");
    if (t.type === "num") return { type: "Num", v: t.v };
    if (t.type === "id") return { type: "Var", name: t.v };
    if (t.v === "(") { const e = expr(0); const c = next(); if (!c || c.v !== ")") throw new SyntaxError("Expected )"); return e; }
    if (t.v === "-") return { type: "Neg", arg: expr(3) };
    throw new SyntaxError("Unexpected '" + t.v + "'");
  };
  const expr = (min) => {
    let left = primary();
    for (;;) {
      const t = peek();
      if (!t || t.type !== "op" || !(t.v in PREC) || PREC[t.v] < min) break;
      next();
      const right = expr(t.v === "^" ? PREC[t.v] : PREC[t.v] + 1);   // ^ is right-associative
      left = { type: "Bin", op: t.v, left, right };
    }
    return left;
  };
  const ast = expr(0);
  if (p < tokens.length) throw new SyntaxError("Unexpected '" + tokens[p].v + "'");
  return ast;
};
const evaluate = (n, env = {}) => {
  switch (n.type) {
    case "Num": return n.v;
    case "Var": if (!(n.name in env)) throw new ReferenceError(n.name + " is not defined"); return env[n.name];
    case "Neg": return -evaluate(n.arg, env);
    case "Bin": { const a = evaluate(n.left, env), b = evaluate(n.right, env); return n.op === "+" ? a + b : n.op === "-" ? a - b : n.op === "*" ? a * b : n.op === "/" ? a / b : a ** b; }
  }
};
const print = (n) => (n.type === "Num" ? String(n.v) : n.type === "Var" ? n.name : n.type === "Neg" ? "(-" + print(n.arg) + ")" : "(" + print(n.left) + " " + n.op + " " + print(n.right) + ")");
const fold = (n) => {
  if (n.type === "Bin") { const l = fold(n.left), r = fold(n.right); return l.type === "Num" && r.type === "Num" ? { type: "Num", v: evaluate({ type: "Bin", op: n.op, left: l, right: r }) } : { ...n, left: l, right: r }; }
  if (n.type === "Neg") { const a = fold(n.arg); return a.type === "Num" ? { type: "Num", v: -a.v } : { ...n, arg: a }; }
  return n;
};
const walk = (n, visit) => { visit(n); if (n.left) walk(n.left, visit); if (n.right) walk(n.right, visit); if (n.arg) walk(n.arg, visit); };
const calc = (s, env) => evaluate(parse(tokenize(s)), env);
const throwsType = (f) => { try { f(); return null; } catch (e) { return e.constructor.name + ": " + e.message; } };
check("precedence: * before +", calc("1 + 2 * 3") === 7);
check("parentheses override precedence", calc("(1 + 2) * 3") === 9);
check("^ is right-associative: 2^3^2 = 2^9", calc("2 ^ 3 ^ 2") === 512);
check("- and / are left-associative", calc("10 - 4 - 3") === 3 && calc("8 / 2 / 2") === 2);
check("unary minus binds looser than ^: -2^2 = -4", calc("-2 ^ 2") === -4 && calc("2 * -3") === -6);
check("variables from an environment", calc("x * (y + 1)", { x: 3, y: 4 }) === 15);
check("the AST is a tree with explicit grouping", print(parse(tokenize("1 + 2 * 3 - 4"))) === "((1 + (2 * 3)) - 4)");
check("a bad character is a SyntaxError with its position", throwsType(() => tokenize("2 $ 3")) === "SyntaxError: Unexpected character '$' at 2");
check("incomplete input is a SyntaxError", throwsType(() => parse(tokenize("1 +"))) === "SyntaxError: Unexpected end of input");
check("unbalanced parentheses are reported", throwsType(() => parse(tokenize("(1 + 2"))) === "SyntaxError: Expected )");
check("trailing junk is reported", throwsType(() => parse(tokenize("1 2"))) === "SyntaxError: Unexpected '2'");
check("unknown variables are a ReferenceError", throwsType(() => calc("z + 1")) === "ReferenceError: z is not defined");
check("constant folding simplifies what it can", print(fold(parse(tokenize("2 * 3 + x")))) === "(6 + x)" && print(fold(parse(tokenize("-(1 + 2) * x")))) === "(-3 * x)");
const counts = {}; walk(parse(tokenize("1 + 2 * x")), (n) => (counts[n.type] = (counts[n.type] || 0) + 1));
check("a visitor can count node types", JSON.stringify(counts) === '{"Bin":2,"Num":2,"Var":1}');
const flagged = []; walk(parse(tokenize("10 / 0 + 4 / 2")), (n) => { if (n.type === "Bin" && n.op === "/" && n.right.type === "Num" && n.right.v === 0) flagged.push(print(n)); });
check("a lint rule: detect division by a constant zero", flagged.join() === "(10 / 0)");`}],
gotchas:[`Hand-rolled regex "parsers" break on nesting, strings and comments; use a real parser for real code.`,`Operator precedence and associativity bugs (<code>2^3^2</code>, <code>-2^2</code>) are classic parser mistakes; test them.`,`ASTs differ between tools (ESTree vs Babel vs TypeScript); plugins are tied to one shape.`,`Transformations must preserve semantics: folding <code>1/0</code>, reordering side effects or removing "unused" code with side effects changes behavior.`,`Source maps are needed to debug transformed code; losing them makes production errors unreadable.`,`Parsing untrusted input needs depth/size limits to avoid stack overflow or ReDoS.`],
best:[`Use established parsers (Acorn, Babel, SWC, Oxc, TypeScript) and AST Explorer to understand structure before writing a transform.`,`Write tests for precedence, associativity and error messages; keep transforms small and composable.`,`Prefer codemods (jscodeshift, ast-grep) for large refactors; review diffs.`],
iq:[["senior","What are the phases of a compiler or interpreter?","Tokenize the source, parse tokens into an AST, analyze/transform (type checking, optimization, linting), then generate code or interpret the tree."],["senior","How do you handle operator precedence in a parser?","Use precedence climbing (Pratt parsing): parse a primary expression, then keep consuming operators whose precedence is at least the minimum, recursing with a higher minimum for left-associative operators and the same for right-associative ones."],["architect","How do ESLint, Babel and bundlers use ASTs?","They parse source into an AST and run visitors: ESLint rules report patterns, Babel plugins rewrite nodes, bundlers analyze imports/exports for tree-shaking and code splitting, and minifiers fold constants and rename identifiers."]],
practice:[`Extend the parser with function calls (<code>max(1, 2)</code>), comparison operators and a ternary expression.`,`Write an ESLint-style rule (using the visitor) that flags <code>x == null</code> mixed with <code>===</code> in the same file.`],
teach:`<p>"Split the text into tokens, group them by priority into a tree, then walk the tree to run, check or rewrite it. Linters, Prettier, Babel and bundlers all do read-tree-write; the tree is just how the code is understood."</p>`}
],quiz:[
{code:`const bytes = new Uint8Array([0,97,115,109,1,0,0,0,1,7,1,96,2,127,127,1,127,3,2,1,0,7,7,1,3,97,100,100,0,0,10,9,1,7,0,32,0,32,1,106,11]);
WebAssembly.instantiate(bytes).then(({ instance }) => console.log(instance.exports.add(2, 3), instance.exports.add(2 ** 31 - 1, 1)));`,ans:`5 -2147483648`,why:`Wasm i32 addition wraps around in two's complement, so the largest signed 32-bit integer plus one becomes the smallest.`},
{code:`const a = new Int32Array(2);
console.log(Atomics.add(a, 0, 5), Atomics.load(a, 0), Atomics.compareExchange(a, 0, 5, 9), a[0], Atomics.compareExchange(a, 0, 5, 1), a[0]);`,ans:`0 5 5 9 9 9`,why:`add returns the previous value (0) and stores 5. compareExchange returns the old value and only writes when it equals the expected one: the first call succeeds (5 → 9), the second expects 5 but sees 9 and changes nothing.`}]},

{n:55,title:"Capstone II",goal:"Connect everything end to end, then run a final review of the new material and update your study plan.",topics:[
{id:"d55-integration",title:"End-to-end blueprint: a feature through every layer",lv:["senior","lead","architect"],
eli5:`<p>Building one small feature, like a task list app, touches <b>everything you learned</b>: how pages change (routing), how people type things in (forms), how the app talks to the server (API), who is allowed (auth), where data lives (database and cache), how you know it works (tests), how it gets out the door (delivery), and how you notice trouble (monitoring). A <b>blueprint</b> is a checklist so you don't forget a room before you start building.</p>`,
why:`<p>Real work, and senior interviews, are about connecting layers and making consistent decisions across them. A written blueprint prevents the classic failures: no pagination, secrets in the client, no rollback, no accessibility and no performance budget.</p>`,
tech:`<h5>Example: "Tasks" feature (list, create, complete, share)</h5><table><tr><th>Layer</th><th>Decisions to write down</th></tr><tr><td>Requirements</td><td>who, what, scale (users, tasks per user), offline? sharing? SLOs (p95 API latency, availability), out of scope</td></tr><tr><td>Routing (Day 46)</td><td>routes <code>/tasks</code>, <code>/tasks/:id</code>, filters in the query string, 404 and login redirect with safe <code>next</code></td></tr><tr><td>Forms (Day 47)</td><td>native validation, accessible errors, server errors mapped to fields, double-submit protection</td></tr><tr><td>API (Days 29, 51)</td><td>REST resources, cursor pagination, idempotency key on create, consistent error shape, ETag + If-Match for updates, rate limits</td></tr><tr><td>Auth (Day 50)</td><td>session cookie (HttpOnly, Secure, SameSite) or OAuth + PKCE; CSRF token; authorization check on every request (owner/shared)</td></tr><tr><td>Data (Day 52)</td><td>tables + indexes (user_id, created_at), keyset pagination, parameterized queries, optimistic version column, migrations (expand/contract)</td></tr><tr><td>Caching</td><td>HTTP cache headers for static assets (immutable, hashed), SWR on the client, short server cache with single-flight for hot reads</td></tr><tr><td>Offline (Day 37)</td><td>service worker shell, IndexedDB outbox with idempotent ids, conflict policy</td></tr><tr><td>Testing (Day 27)</td><td>unit (logic), integration (API + DB), a few e2e journeys, accessibility checks, contract tests</td></tr><tr><td>Delivery (Day 53)</td><td>CI pipeline, immutable image, config from env validated at startup, feature flag, canary, rollback plan, graceful shutdown</td></tr><tr><td>Observability (Day 29)</td><td>structured logs with request id, metrics, traces, RUM for Web Vitals, error tracking with source maps, alerts on SLO burn</td></tr><tr><td>Accessibility (Day 48)</td><td>semantic HTML, keyboard support, focus management on route changes, live regions, contrast</td></tr><tr><td>Performance (Day 23)</td><td>budgets (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, JS KB), code splitting, virtualization for long lists</td></tr><tr><td>Security (Days 20, 50)</td><td>XSS-safe rendering, CSP + Trusted Types, SRI, header baseline, dependency audit, secrets never in the bundle</td></tr></table>
<p>Use this as a pre-build checklist, a design-review template and an interview framework: choose a feature, walk the layers out loud, and name the riskiest decision in each.</p>`,
diagram:{html:flow([["Browser UI","routing, forms, a11y, perf"],["API","auth, validation, pagination, idempotency","w"],["Data + cache","indexes, transactions, TTL, single-flight","w"],["Pipeline","CI → artifact → canary → rollback","g"],["Observability","logs, metrics, traces, RUM, SLOs","g"]]),steps:["Every request crosses the same layers; a weakness in one shows up everywhere.","The API is the contract between UI and data: validate, authorize, paginate, make writes idempotent.","The data layer must be indexed, transactional where needed and cached carefully.","Delivery and observability close the loop so changes are safe and problems are visible."]},
ex:[{t:"A blueprint linter: does your design cover the layers? (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const REQUIRED = ["requirements", "routing", "forms", "api", "auth", "data", "caching", "testing", "delivery", "observability", "accessibility", "performance", "security"];
const empty = (v) => !v || (Array.isArray(v) ? v.length === 0 : Object.keys(v).length === 0);
const lintBlueprint = (bp) => {
  const issues = [];
  for (const k of REQUIRED) if (empty(bp[k])) issues.push("missing section: " + k);
  if (bp.api && !bp.api.pagination) issues.push("api: choose a pagination strategy (cursor recommended)");
  if (bp.api && !bp.api.idempotency) issues.push("api: unsafe operations need idempotency keys");
  if (bp.auth && bp.auth.tokenStorage === "localStorage") issues.push("auth: tokens in localStorage are readable by XSS");
  if (bp.performance && !bp.performance.budgets) issues.push("performance: define budgets (LCP/INP/CLS, JS KB)");
  if (bp.testing && !bp.testing.e2e) issues.push("testing: add e2e tests for critical journeys");
  if (bp.delivery && !bp.delivery.rollback) issues.push("delivery: define a rollback path");
  return issues;
};
const tasks = {
  requirements: ["lists, create, complete, share", "10k users, p95 < 300 ms"],
  routing: { routes: ["/tasks", "/tasks/:id"], state: "filters in the query string" },
  forms: { validation: "native + server mapping", errors: "aria-describedby" },
  api: { pagination: "cursor", idempotency: "Idempotency-Key on POST", errors: "problem+json" },
  auth: { session: "HttpOnly Secure SameSite cookie", csrf: "token", tokenStorage: "cookie" },
  data: { indexes: ["user_id, created_at"], concurrency: "version column" },
  caching: { assets: "immutable + hashed", reads: "SWR + single-flight" },
  testing: { unit: true, integration: true, e2e: ["create and complete a task"] },
  delivery: { ci: "lint, types, test, build", flag: "tasks-v2", rollback: "redeploy previous image" },
  observability: { logs: "structured + request id", rum: "web-vitals", alerts: "SLO burn" },
  accessibility: { keyboard: true, focus: "heading on route change" },
  performance: { budgets: { lcp: 2500, inp: 200, cls: 0.1, jsKB: 170 } },
  security: { csp: "nonce + strict-dynamic", headers: "baseline", audit: "npm audit in CI" }
};
check("a complete blueprint has no findings", lintBlueprint(tasks).length === 0);
const weak = { requirements: ["todo app"], api: {}, auth: { tokenStorage: "localStorage" }, performance: { note: "fast" }, testing: { unit: true }, delivery: { ci: "yes" } };
const issues = lintBlueprint(weak);
check("missing layers are reported", issues.includes("missing section: routing") && issues.includes("missing section: security") && issues.includes("missing section: api"));
check("risky choices are flagged", issues.some((i) => i.includes("localStorage")) && issues.some((i) => i.includes("pagination")) && issues.some((i) => i.includes("idempotency")));
check("process gaps are flagged", issues.some((i) => i.includes("budgets")) && issues.some((i) => i.includes("e2e")) && issues.some((i) => i.includes("rollback")));
check("fixing the findings clears them", lintBlueprint({ ...tasks, auth: { ...tasks.auth, tokenStorage: "cookie" } }).length === 0 && lintBlueprint({ ...tasks, delivery: { ci: "x" } }).includes("delivery: define a rollback path"));`}],
gotchas:[`Designing the UI first and discovering missing API capabilities (pagination, idempotency, error shapes) late.`,`Treating security, accessibility and performance as "later" tasks; they shape architecture.`,`No rollback or feature-flag plan for a risky release.`,`Testing only the happy path and only at one layer.`,`Skipping observability until the first incident.`],
best:[`Write the blueprint before coding and revisit it at review; keep decisions short, with reasons and revisit triggers (ADRs).`,`Prototype the riskiest layer first (offline sync, real-time, payments), not the easiest.`,`Make every layer observable and every release reversible.`],
iq:[["architect","Walk me through designing a small feature end to end.","Requirements and SLOs; routes and state in the URL; forms and accessibility; API contract with pagination, idempotency and errors; auth and authorization; data model, indexes and concurrency; caching; tests; CI/CD with flags and rollback; observability; performance and security budgets."],["lead","How do you make sure nothing important is forgotten?","Use a design checklist/blueprint covering each layer, review it with the team, record decisions as ADRs, and turn the cross-cutting concerns (security, accessibility, performance, observability) into acceptance criteria."],["architect","Which layer would you prototype first and why?","The one with the highest risk or uncertainty (for example offline conflict resolution, real-time sync or a third-party integration) so surprises surface early."]],
practice:[`Fill in this blueprint for a feature you care about (a chat, a store checkout, a note app) and run it through the linter above.`,`Present the blueprint in 10 minutes to a friend and have them poke at the weakest layer.`],
teach:`<p>"One small feature touches every layer: pages, forms, API, auth, data, cache, tests, delivery, monitoring. A blueprint is a checklist so you don't forget a room: write each layer's key decision and what could go wrong before you build."</p>`},

{id:"d55-final-review",title:"Final review: rapid-fire and updated study plan",lv:["fresher","mid","senior","lead","architect"],
eli5:`<p>Same trick as Day 40: cover the answer, say it in one breath, then peek. These flash cards cover the topics added in Weeks 9–11. Then update your <b>scoreboard</b> and pick your weakest areas to revisit.</p>`,
tech:`<p><b>How to use:</b> a 20-minute timed round: read the question, answer aloud in about 15–20 seconds, check, mark ✓/✗, and re-do the ✗ ones tomorrow. Then run the updated self-assessment below: score each area 1–5 honestly and it returns the course days to revisit, weakest first.</p><p><b>Scope reminder:</b> React and TypeScript were intentionally left out of this course. The ideas here (state, routing, forms, accessibility, performance, security, testing, delivery) transfer directly to any framework you add next; learn them on top of this foundation.</p>`,
diagram:{html:flow([["Rapid-fire (36 questions)"],["Self-assess 1–5","16 areas","w"],["Plan: weakest first","days to revisit","g"],["Mock rounds","Day 40 plan","g"]]),steps:["Short answers expose gaps quickly.","Honest scores beat confident guesses.","The plan turns scores into specific days, weakest first.","Finish with the timed mock rounds from Day 40."]},
ex:[{t:"Updated self-assessment: scores in, study plan out (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const areas = {
  "Language core (types, scope, this, closures)": [1, 2, 3, 4, 6],
  "Objects, prototypes, classes, OOP and SOLID": [5, 7, 8, 41],
  "Functional programming and recursion": [42],
  "Iterators, generators, Proxy, immutability": [9, 10],
  "Async and the event loop": [11, 12, 13, 14, 15],
  "DOM, events and rendering": [16, 17, 18],
  "Routing, URLs and forms": [46, 47],
  "Storage, network, security and auth": [19, 20, 50],
  "Accessibility and Web Components": [35, 48],
  "Engine, memory, performance": [21, 22, 23],
  "Modules, bundling, Node and APIs": [24, 25, 26, 51],
  "Databases, caching and data": [52],
  "Algorithms and data structures": [34, 43],
  "Binary data, Intl and debugging": [44, 45],
  "Testing, Git, CI and deployment": [27, 53],
  "Architecture, design and leadership": [28, 29, 36, 37, 38, 39, 55]
};
const plan = (scores, threshold = 3) => Object.entries(scores).filter(([, s]) => s <= threshold).sort((a, b) => a[1] - b[1]).flatMap(([k]) => areas[k]);
const scores = { "Databases, caching and data": 2, "Routing, URLs and forms": 3, "Language core (types, scope, this, closures)": 5, "Algorithms and data structures": 4 };
const days = plan(scores);
console.log("revisit these days, weakest first:", days.join(", "));
check("the weakest area comes first", days[0] === 52);
check("areas above the threshold are skipped", !days.includes(1) && !days.includes(43));
check("raising the threshold includes more areas", plan(scores, 4).includes(34) && plan(scores, 4).includes(43));
const allDays = [...new Set(Object.values(areas).flat())];
check("the plan maps to real course days (1-55)", allDays.every((d) => d >= 1 && d <= 55));
check("coverage: the areas reference " + allDays.length + " distinct days", allDays.length >= 35);
const avg = (o) => Object.values(o).reduce((a, b) => a + b, 0) / Object.keys(o).length;
check("average score helps track progress over time", avg(scores) === 3.5);`}],
gotchas:[`Re-reading is not reviewing: answer aloud first.`,`Only practicing your strongest areas feels productive but doesn't move your interview results.`,`Learning a framework before the underlying platform concepts makes interviews harder.`],
best:[`Repeat the self-assessment every week and watch the weak areas shrink; book real mock interviews.`,`Add React and TypeScript on top of this foundation when you're ready; the platform knowledge is what makes them easy.`],
iq:[
["fresher","What is OOP and its four pillars?","Organizing code around objects: encapsulation, abstraction, inheritance, polymorphism. In JavaScript: private #fields/closures, simple public interfaces, extends/prototypes, overriding and duck typing."],
["mid","Composition vs inheritance?","Composition combines small behaviors flexibly; inheritance models a stable is-a relationship but couples classes. Prefer composition."],
["mid","What is a pure function?","Same input gives the same output with no side effects; easy to test, cache and compose."],
["mid","Why doesn't V8 optimize tail calls?","It isn't implemented in V8 or SpiderMonkey (only Safari), so deep recursion overflows; use loops, explicit stacks or trampolines."],
["senior","Liskov Substitution in one sentence?","Anything that works with the base type must keep working with its subtypes, so subclasses can't break the parent's contract (Square/Rectangle)."],
["senior","Heap complexities?","push and pop O(log n), peek O(1), heapify O(n); use for top-k, merging sorted lists, scheduling and running median."],
["senior","BFS vs DFS vs Dijkstra?","BFS: shortest path in unweighted graphs; DFS: exploration/cycles/components; Dijkstra: shortest path with non-negative weights using a min-heap."],
["mid","Typed arrays vs DataView?","Typed arrays are fixed-type views with platform endianness; DataView reads mixed types at offsets with explicit endianness."],
["mid","Why use Intl instead of manual formatting?","It handles locale-specific separators, symbols, dates, plurals, lists and sorting correctly using built-in locale data."],
["senior","How do you debug systematically?","Reproduce, minimize, hypothesize, bisect (history or input), fix the root cause, add a regression test."],
["mid","How does client-side routing work?","Intercept links, pushState to change the URL, render the matching view, handle popstate for back/forward, and serve index.html for deep links on the server; manage title and focus."],
["senior","What is an open redirect?","Redirecting to a user-supplied URL; prevent by allowing only same-origin relative paths resolved against your origin."],
["mid","What does FormData skip?","Unchecked checkboxes/radios, disabled controls and unnamed fields."],
["senior","Why can't you trust file.type?","It comes from the user's system and can be spoofed; the server must inspect content and enforce limits."],
["senior","What are the WCAG principles?","Perceivable, Operable, Understandable, Robust (POUR); minimum text contrast is 4.5:1 (3:1 for large text)."],
["senior","Shadow DOM benefits and pitfalls?","Encapsulated DOM and styles with slots and parts; pitfalls: ARIA ID references across boundaries, theming needs CSS variables/parts, composed events for crossing the boundary."],
["mid","Canvas vs SVG?","SVG: retained, accessible, scalable shapes; Canvas: immediate-mode pixels for many objects, games and image processing, with manual accessibility."],
["senior","How should you use device APIs like geolocation?","Feature-detect, ask in context after a user gesture, handle denial and errors, provide a fallback and clean up watches."],
["architect","Sessions vs JWT?","Sessions are simple and revocable (cookie + server state); JWTs are signed claims for distributed verification but hard to revoke; pin algorithms and keep them short-lived."],
["architect","Why PKCE?","It binds the authorization code to a one-time verifier so an intercepted code is useless; required for public clients like SPAs."],
["architect","How do you store passwords?","Unique salt plus a slow, memory-hard hash (Argon2id, scrypt, bcrypt, or PBKDF2 with high iterations), constant-time comparison, rate limiting and MFA/passkeys."],
["senior","Which security headers matter most?","CSP (nonce-based), HSTS, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, COOP; plus SRI for third-party scripts and secure cookie flags."],
["mid","Middleware order in an API?","Logger/request id (outermost), error handler, security/CORS/rate limit, authentication, body parsing/validation, routes."],
["senior","401 vs 403; 400 vs 422?","401: not authenticated; 403: authenticated but not allowed; 400: malformed request; 422: well-formed but fails validation."],
["mid","Why use streams in Node?","Constant memory for large data, earlier output and backpressure; use pipeline for error handling and cleanup."],
["mid","How do you prevent SQL injection?","Parameterized queries/prepared statements, least-privilege accounts, and validated input."],
["senior","N+1 and its fix?","One query per item after a list query; fix with joins, IN-batching, eager loading or DataLoader."],
["senior","Cache stampede protection?","Single-flight, jittered TTLs, locks and stale-while-revalidate."],
["mid","no-cache vs no-store?","no-cache: store but revalidate before use; no-store: never store."],
["mid","Merge vs rebase?","Merge preserves history with a merge commit; rebase replays commits for a linear history; never rebase shared branches."],
["senior","How do conventional commits drive releases?","feat → minor, fix → patch, breaking change → major; tools compute the version and changelog automatically."],
["senior","Name 12-factor essentials for Node services.","Config in env (validated), stateless processes, logs to stdout, dev/prod parity, graceful shutdown, backing services as resources."],
["architect","Why graceful shutdown?","Stop accepting new work, finish in-flight requests, close resources, then exit, so deploys don't drop requests."],
["senior","When use WebAssembly?","CPU-bound kernels, codecs, porting native libraries; not for DOM-heavy or chatty code."],
["senior","What do Atomics provide?","Indivisible, ordered operations on shared integer memory (add, compareExchange, wait/notify), the building blocks of locks."],
["senior","What is an AST used for?","Linters, formatters, transpilers, bundlers and minifiers parse code into a tree and analyze or transform it with visitors."],
["architect","How would you design a feature end to end?","Write a blueprint across requirements, routing, forms, API, auth, data, caching, tests, delivery, observability, accessibility, performance and security; prototype the riskiest layer first."]
],
practice:[`Do all 36 questions in two timed sessions; write the ✗ list and revisit those days.`,`Run the self-assessment above, then book two mock interviews around your weakest two areas.`],
teach:`<p>"Say the answer in one breath, then add an example and a pitfall. Score yourself honestly, spend your time where you're weakest, and bolt React or TypeScript on later; the platform is the hard part."</p>`}
],quiz:[
{code:`console.log([1, 2, 3].map((x) => x * 2).reduce((a, b) => a + b), typeof null, [...new Set('mississippi')].join(''), Number('12px'), parseInt('12px'));`,ans:`12 object misp NaN 12`,why:`map doubles then reduce sums to 12; typeof null is "object"; a Set keeps first occurrences m, i, s, p; Number rejects trailing text while parseInt reads the leading digits.`},
{code:`Promise.race([Promise.resolve(1), new Promise((r) => setTimeout(r, 0, 2))]).then(console.log);
setTimeout(() => console.log('t'), 0);
queueMicrotask(() => console.log('m'));`,ans:`m, 1, t`,why:`The race settles through microtasks: the queueMicrotask callback queued after race's internal reaction logs first, then the race result (1), and only then the timer task.`}]}
]});
