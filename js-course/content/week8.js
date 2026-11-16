/* Week 8: Interview bootcamp II — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js. */
JSC.registerWeek({w:8,revision:[
"<b>Design framework:</b> requirements → architecture → data/API → performance, accessibility, security → observability and rollout. State assumptions and give rough numbers.",
"<b>Estimation:</b> requests/s = users × requests per user ÷ 86,400; multiply by a peak factor (2–5×); a CDN hit rate divides origin load; connections ÷ per-server capacity = servers.",
"<b>Feed:</b> cursor pagination, dedupe on merge, optimistic updates with rollback, virtualization. <b>Chat:</b> sequence numbers + reorder buffer, idempotent client ids, reconnect with capped exponential backoff and jitter.",
"<b>Real-time choice:</b> polling (simple), SSE (server → client), WebSocket (two-way). Collaboration: OT (transform concurrent ops) or CRDTs (merge in any order, commutative/associative/idempotent).",
"<b>Offline:</b> service worker lifecycle (install, activate, fetch); strategies: cache-first, network-first, stale-while-revalidate; an IndexedDB outbox with idempotent ids for writes.",
"<b>Performance triage:</b> measure in the field → pick the failing metric → find the cause (TTFB, image, blocking JS, long tasks, layout shifts) → fix → verify.",
"<b>Reliability:</b> feature flags with stable hashing, canary releases, fast rollback, circuit breakers (closed → open → half-open), SLOs and error budgets, graceful degradation.",
"<b>Behavioral:</b> STAR(R) with numbers and ownership (\"I\"), one lesson learned. Prepare 7 stories: bug, performance win, conflict, failure, ambiguity, mentoring, influence.",
"<b>Decisions:</b> write an ADR for one-way doors; decide quickly on two-way doors; use weighted criteria but expose the weights, because the weights are the real argument.",
"<b>Final week:</b> mock rounds out loud, a weak-area plan from a self-assessment, a day-before checklist, and questions to ask the interviewer."
],days:[
{n:36,title:"Frontend system design toolkit",goal:"Run a structured design discussion, size a system with rough numbers, and walk through two classic designs.",topics:[
{id:"d36-sd-toolkit",title:"The design toolkit and back-of-envelope estimation",lv:["senior","lead","architect"],
eli5:`<p>Planning a big school trip: before booking buses you ask <b>how many kids, how far, how long, what if it rains</b>. Then you do quick sums: 200 kids ÷ 50 seats = 4 buses (plus one spare). System design is that: ask, then do rough arithmetic so your plan fits real numbers instead of guesses.</p>`,
why:`<p>Design interviews (and real design reviews) reward structure and proportion: clear requirements, rough numbers, trade-offs, and the riskiest parts examined first. Over-engineering for imaginary scale is as bad as ignoring scale.</p>`,
tech:`<h5>The framework (use it every time)</h5><ol><li><b>Requirements:</b> functional (what), non-functional (latency, availability, scale, offline, accessibility, i18n, browser/device support), out of scope.</li><li><b>Architecture:</b> components and boundaries; rendering strategy; state ownership; caching layers (browser, CDN, server); data flow diagram.</li><li><b>Data model and API:</b> entities, endpoints or channels, pagination, error contract, real-time vs polling, consistency expectations.</li><li><b>Cross-cutting:</b> performance (budgets, virtualization, debounce/cancel), accessibility (keyboard, ARIA), security (XSS, CSRF, auth), privacy.</li><li><b>Observability and rollout:</b> metrics, logs, RUM, error tracking, feature flags, experiments, rollback.</li></ol>
<h5>Back-of-envelope numbers</h5><ul class="pts"><li>Seconds per day ≈ 86,400. Average RPS = daily requests ÷ 86,400. <b>Peak</b> ≈ 2–5× average.</li><li>Bandwidth = RPS × payload size. A <b>CDN hit rate</b> of 90% leaves 10% for the origin.</li><li>Concurrent connections (WebSocket) ≈ peak concurrent users; one server may handle tens of thousands (tune and measure).</li><li>Latency budget example for a 200 ms interaction: DNS 20 + TLS 40 + server 60 + network 30 + render 50.</li><li>Rule of thumb for the browser: stay under a 50 ms long-task limit per chunk of work; 16 ms per frame for animation.</li></ul>
<p>Always say the assumptions out loud ("assuming 1M daily users and 20 requests each…"), and round aggressively; the point is orders of magnitude.</p>`,
diagram:{html:flow([["1 Requirements","functional + non-functional"],["2 Architecture","components, rendering, caching","w"],["3 Data + API","entities, pagination, realtime","w"],["4 Cross-cutting","perf, a11y, security","g"],["5 Operate","metrics, flags, rollback","g"]]),steps:["Spend the first 5–8 minutes on requirements and scope; it prevents wasted design.","Draw the main boxes and arrows before details.","Define data and API shapes early; most frontend problems are data-flow problems.","Go deep on the riskiest 1–2 areas and say why they are risky.","Close with how you'd measure success and ship safely."]},
ex:[{t:"Estimation helpers with checks",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const estimate = ({ dau, reqPerUser, kb, peak = 3, cacheHit = 0 }) => {
  const avg = (dau * reqPerUser) / 86400, pk = avg * peak;
  return { avgRps: avg, peakRps: pk, originPeakRps: pk * (1 - cacheHit), peakMBps: (pk * kb) / 1024 };
};
const e = estimate({ dau: 1e6, reqPerUser: 20, kb: 50, peak: 3, cacheHit: 0.9 });
console.log("avg RPS", e.avgRps.toFixed(0), "| peak RPS", e.peakRps.toFixed(0), "| origin peak RPS", e.originPeakRps.toFixed(0), "| peak MB/s", e.peakMBps.toFixed(1));
check("average requests per second", Math.round(e.avgRps) === 231);
check("peak requests per second", Math.round(e.peakRps) === 694);
check("90% CDN hit rate leaves ~69 origin RPS", Math.round(e.originPeakRps) === 69);
check("peak bandwidth in MB/s", e.peakMBps.toFixed(1) === "33.9");
const fits = (parts, budget) => { const total = Object.values(parts).reduce((s, x) => s + x, 0); return { total, ok: total <= budget, slack: budget - total }; };
const lat = fits({ dns: 20, tls: 40, server: 60, network: 30, render: 50 }, 200);
check("latency budget met exactly", lat.total === 200 && lat.ok && lat.slack === 0);
check("over-budget design is detected", !fits({ server: 150, render: 100 }, 200).ok);
const servers = (peakConns, perServer) => Math.ceil(peakConns / perServer);
check("WebSocket servers for 10% of 1M users at 50k each", servers(1e6 * 0.1, 50000) === 2);
check("always round servers up", servers(50001, 50000) === 2);`}],
gotchas:[`Skipping requirements and drawing boxes immediately.`,`Fake precision: say "about 230 RPS", not "231.48".`,`Designing for 100x the stated scale adds cost without value; design for the stated scale and describe how it would grow.`,`Forgetting peak vs average, the long tail (p95/p99), and failure modes.`,`Ignoring the client: device, network, bundle size, accessibility.`],
best:[`Write assumptions on the board; revisit them when constraints change.`,`Give two options for the hardest decision, compare, then choose.`,`Always include "how we'd know it's working" (metrics) and "how we'd roll back".`],
iq:[["senior","Walk me through how you approach a design problem.","Clarify requirements and constraints; sketch components and data flow; define API/data; deep-dive on risky areas (performance, consistency, offline); cover accessibility and security; finish with metrics, rollout and failure modes."],["architect","How do you estimate capacity for a feature?","Daily users × actions ÷ 86,400 for average RPS, multiply by a peak factor, multiply by payload for bandwidth, adjust by cache hit rate, divide connections by per-server limits, then validate by load testing."],["architect","How do you decide how much design is enough?","Match the depth to the cost of being wrong: reversible, low-cost decisions get a sentence; irreversible or expensive ones get an ADR, estimates and a review."]],
practice:[`Estimate RPS, bandwidth and servers for a feed used by 5M daily users.`,`Redo the five-step framework on a design you built, and find what you skipped.`],
teach:`<p>"Ask what we're building and how big, do quick arithmetic with round numbers, draw the boxes, define the data, check performance, access and security, and say how we'll measure and roll back."</p>`},

{id:"d36-feed-chat",title:"Design a news feed and a chat app",lv:["senior","lead","architect"],
eli5:`<p>A <b>feed</b> is a never-ending scroll of cards; you keep a bookmark (cursor) so you never see the same card twice, and when you tap "like" the heart fills <i>instantly</i> (even before the post office confirms), and un-fills if the letter got lost. A <b>chat</b> is a conversation by mail where letters can arrive out of order, so every letter has a number and you hold early arrivals until the earlier ones show up.</p>`,
why:`<p>These two are among the most common frontend design prompts. They exercise pagination, optimistic updates, ordering, reconnection, caching and rendering performance.</p>`,
tech:`<h5>News feed</h5><ul class="pts"><li><b>Data:</b> feed items with stable ids, author, content, counts, timestamps. <b>API:</b> <code>GET /feed?cursor=&amp;limit=20</code> returning <code>{items, nextCursor}</code>. Cursor pagination stays correct as new posts arrive.</li><li><b>Loading:</b> IntersectionObserver sentinel at the bottom triggers the next page; <b>dedupe by id</b> when merging pages; skeletons and reserved image sizes (no layout shift); prefetch the next page when idle.</li><li><b>Rendering:</b> windowing/virtualization for long sessions; lazy images (<code>loading="lazy"</code>, <code>srcset</code>); avoid re-rendering the whole list on a like.</li><li><b>Interactions:</b> <b>optimistic updates</b> with rollback on failure; send idempotent requests; "new posts" banner instead of jumping the scroll position.</li><li><b>Caching:</b> stale-while-revalidate (show cached feed instantly, refresh in the background); keep scroll position when navigating back.</li><li><b>Edge cases:</b> deleted posts, duplicate ids, offline, slow network, very long text, embedded media, accessibility (focus order, feed role, keyboard shortcuts).</li></ul>
<h5>Chat app</h5><ul class="pts"><li><b>Transport:</b> WebSocket for two-way, with fallback (SSE + POST or long polling). Heartbeats detect dead connections.</li><li><b>Ordering:</b> the server assigns increasing <b>sequence numbers</b> per conversation; the client buffers out-of-order messages and releases them in order; detect gaps and request the missing range.</li><li><b>Reliability:</b> each outgoing message has a <b>client-generated id</b> (idempotency); states <i>sending → sent → delivered → failed</i> with retry; the server dedupes by client id.</li><li><b>Reconnect:</b> capped <b>exponential backoff with jitter</b>; on reconnect, sync from the last seen sequence number.</li><li><b>UI:</b> virtualized message list anchored to the bottom, unread markers, typing indicators (throttled), presence (low frequency), scroll-to-bottom only if the user is at the bottom.</li><li><b>Scale notes:</b> connection count drives server count; fan-out for groups; push notifications when offline.</li></ul>`,
diagram:{html:flow([["send message","clientId = c42, local state 'sending'"],["WebSocket → server","assigns seq = 17","w"],["ack(c42, seq 17)","state 'sent'","g"],["broadcast seq 17","other clients"],["client: reorder buffer","release in seq order","g"]]),steps:["The sender shows the message immediately using a client-generated id.","The server persists it, assigns the next sequence number and acknowledges the client id.","Receivers may get messages out of order after reconnects; a buffer holds seq 19 until 18 arrives.","If the socket drops, the client reconnects with backoff and asks for everything after the last seq it saw."]},
ex:[{t:"Feed: dedupe on merge and optimistic like with rollback",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const mergePages = (existing, incoming) => { const seen = new Set(existing.map((p) => p.id)); return [...existing, ...incoming.filter((p) => !seen.has(p.id))]; };
check("merge dedupes overlapping ids and keeps order", mergePages([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }]).map((p) => p.id).join() === "1,2,3");
const state = { likes: { a: 1 } };
async function like(id, api){
  const before = state.likes[id] ?? 0;
  state.likes[id] = before + 1;                 // optimistic: update the UI immediately
  try { await api(id); } catch { state.likes[id] = before; }   // roll back on failure
}
(async () => {
  const p = like("a", async () => {});
  check("optimistic: count changes before the server answers", state.likes.a === 2);
  await p;
  check("success keeps the new count", state.likes.a === 2);
  await like("a", async () => { throw new Error("network"); });
  check("failure rolls back to the previous count", state.likes.a === 2);
})();`},
{t:"Chat: ordering buffer, idempotent sends, reconnect backoff",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const createInbox = (deliver) => {
  let next = 1; const buf = new Map();
  return {
    push(seq, msg){ if (seq < next || buf.has(seq)) return false; buf.set(seq, msg); while (buf.has(next)) { deliver(buf.get(next)); buf.delete(next); next++; } return true; },
    get pending(){ return buf.size; }
  };
};
const got = [], inbox = createInbox((m) => got.push(m));
inbox.push(2, "b"); inbox.push(3, "c");
check("out-of-order messages are held back", got.length === 0 && inbox.pending === 2);
inbox.push(1, "a");
check("released in sequence order once the gap closes", got.join() === "a,b,c" && inbox.pending === 0);
check("duplicates and old sequence numbers are ignored", inbox.push(2, "b") === false && got.length === 3);
const seenIds = new Set();
const receive = (m) => { if (seenIds.has(m.clientId)) return false; seenIds.add(m.clientId); return true; };
check("a resent message is deduped by client id", receive({ clientId: "c1" }) && !receive({ clientId: "c1" }));
const delay = (n, { base = 1000, max = 30000, rand = Math.random } = {}) => Math.min(max, base * 2 ** n) * (0.5 + rand() / 2);
check("backoff doubles and is capped", [0, 1, 2, 3, 4, 5, 6].map((n) => delay(n, { rand: () => 1 })).join() === "1000,2000,4000,8000,16000,30000,30000");
check("jitter lower bound is half the delay", delay(2, { rand: () => 0 }) === 2000);
check("jitter keeps delays inside [half, full]", Array.from({ length: 100 }, () => delay(3)).every((d) => d >= 4000 && d <= 8000));`}],
gotchas:[`Offset pagination in a live feed shows duplicates or skips items; use cursors.`,`Auto-scrolling to new content steals the user's position; show a "new posts" banner.`,`Optimistic updates without rollback and error messaging leave the UI lying.`,`Using timestamps for ordering fails across clients/clock skew; use server sequence numbers.`,`Reconnecting without jitter makes thousands of clients retry at once after an outage.`,`Treating "sent" as "delivered": the states are different.`],
best:[`Name the ordering and idempotency mechanisms explicitly; interviewers listen for them.`,`Virtualize long lists and reserve media dimensions.`,`Sync by "last seen sequence" after reconnect rather than resending everything.`],
iq:[["senior","Design infinite scroll for a feed.","Cursor pagination, IntersectionObserver sentinel, dedupe on merge, windowing for DOM size, skeletons and reserved image sizes, prefetch next page, scroll restoration, cancel stale requests, handle errors and empty states."],["architect","How do you guarantee message order and no duplicates in chat?","Server-assigned per-conversation sequence numbers; client reorder buffer and gap detection; client-generated idempotency ids so retries are deduped; resync from the last seen sequence after reconnect."],["architect","What happens when a user goes offline mid-conversation?","Queue outgoing messages in an outbox (persisted), show 'sending', reconnect with backoff and jitter, flush in order with client ids, then sync missed messages from the last seq."]],
practice:[`Add gap detection that requests missing sequence numbers when a hole persists for more than 2 seconds.`,`Write the optimistic UI states for sending, sent, failed and retry in a small state machine.`],
teach:`<p>"A feed uses bookmarks (cursors), dedupes pages and updates hearts optimistically with rollback. A chat numbers every message, holds early ones until earlier ones arrive, gives each send a unique id so retries aren't duplicated, and reconnects with growing random pauses."</p>`}
],quiz:[
{code:`console.log(Math.round(1e6 * 20 / 86400), Math.round(1e6 * 20 / 86400 * 3));`,ans:`231 694`,why:`20 million requests per day is about 231 per second on average; a 3x peak factor gives about 694. The point is orders of magnitude, so say "about 230 average, 700 peak".`},
{code:`console.log([0, 1, 2, 3, 4].map((n) => Math.min(30000, 1000 * 2 ** n)));`,ans:`[1000, 2000, 4000, 8000, 16000]`,why:`Exponential backoff doubles the wait each attempt until it reaches the cap (30 s here). In production add jitter so clients do not retry in lockstep.`}]},

{n:37,title:"Real-time and offline systems",goal:"Choose the right real-time transport, reason about collaboration algorithms, and design offline-first behavior.",topics:[
{id:"d37-realtime",title:"Real-time and collaborative systems",lv:["senior","architect"],
eli5:`<p>Real-time options are like ways to get news: <b>keep asking "anything new?"</b> (polling), <b>a radio the station talks into</b> (SSE: server speaks, you listen), or <b>a phone call</b> (WebSocket: both talk any time). When two people edit the same sentence at once, you need rules so both end with the <b>same text</b>: either <b>adjust positions</b> as edits arrive (OT) or use <b>special numbers that always merge cleanly</b> (CRDTs).</p>`,
why:`<p>Collaborative editors, dashboards, chats and games need updates pushed in real time, and multi-user editing needs conflict resolution that converges. These topics separate senior answers from basic ones.</p>`,
tech:`<table><tr><th>Transport</th><th>Direction</th><th>Notes</th></tr><tr><td>Polling</td><td>client asks</td><td>simplest, wasteful, higher latency; fine for slow-changing data</td></tr><tr><td>Long polling</td><td>client asks, server holds</td><td>emulates push through proxies</td></tr><tr><td>SSE (EventSource)</td><td>server → client</td><td>auto-reconnect, last-event-id, text over HTTP, works with HTTP/2</td></tr><tr><td>WebSocket</td><td>two-way</td><td>low latency, binary; needs heartbeats, reconnect, backpressure handling, sticky/scaling considerations</td></tr><tr><td>WebTransport / WebRTC</td><td>two-way (UDP-like / P2P)</td><td>games, media; more complex</td></tr></table>
<ul class="pts"><li><b>Operational concerns:</b> heartbeats/ping-pong, reconnect with capped backoff + jitter, resume from last event id/sequence, backpressure (don't flood slow clients), authentication on connect and token refresh, fan-out at scale (pub/sub backplane), and rate limits.</li><li><b>OT (operational transformation):</b> concurrent operations are <b>transformed</b> against each other (for example shifting an insert position) so every site converges; needs a central server ordering ops (used by Google Docs-style editors).</li><li><b>CRDTs:</b> data types whose merge is <b>commutative, associative and idempotent</b>, so replicas converge regardless of order or duplication (counters, LWW registers, sets, sequences like RGA/Yjs/Automerge). Good for offline-first and peer-to-peer; cost: metadata growth and tombstones.</li><li><b>Clocks:</b> wall clocks skew; use logical clocks (Lamport/vector) or hybrid clocks, plus a deterministic tie-breaker (replica id).</li><li><b>Presence/cursors</b> are ephemeral: send at low frequency, don't persist.</li></ul>`,
diagram:{html:lanes([["OT (transform ops)",["Site A: insert 'b' @1","Site B: insert 'd' @2","B's op is shifted to @3 after A's op","both end with 'abcd'"]],["CRDT (merge states)",["replica 1: {a:3}","replica 2: {b:2}","merge = per-key max","order doesn't matter → same result"]]]),steps:["OT keeps operations as edits and rewrites them so applying them in different orders gives the same document.","A CRDT designs the data so that merging states is always safe: duplicates and reordering don't matter.","Both need a deterministic rule for ties and a plan for history growth."]},
ex:[{t:"CRDTs converge in any order; OT shifts positions (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
// G-Counter CRDT: each replica increments its own slot; merge = per-key max
const gMerge = (a, b) => { const out = { ...a }; for (const k of Object.keys(b)) out[k] = Math.max(out[k] || 0, b[k]); return out; };
const gValue = (o) => Object.values(o).reduce((s, x) => s + x, 0);
const same = (x, y) => JSON.stringify(Object.entries(x).sort()) === JSON.stringify(Object.entries(y).sort());
const A = { a: 3 }, B = { b: 2 }, C = { a: 1, c: 5 };
check("merge is commutative", same(gMerge(A, B), gMerge(B, A)));
check("merge is associative", same(gMerge(gMerge(A, B), C), gMerge(A, gMerge(B, C))));
check("merge is idempotent (duplicates are harmless)", same(gMerge(A, A), A));
check("any merge order gives the same total (10)", gValue(gMerge(gMerge(A, B), C)) === 10 && gValue(gMerge(gMerge(C, A), B)) === 10);
// Last-writer-wins register with a deterministic tie-break
const lww = (x, y) => (x.t !== y.t ? (x.t > y.t ? x : y) : x.id > y.id ? x : y);
check("LWW: later timestamp wins", lww({ t: 2, id: "a", v: "new" }, { t: 1, id: "b", v: "old" }).v === "new");
check("LWW: tie is broken by replica id the same way on every replica", lww({ t: 1, id: "a", v: "x" }, { t: 1, id: "b", v: "y" }).v === "y" && lww({ t: 1, id: "b", v: "y" }, { t: 1, id: "a", v: "x" }).v === "y");
// Operational transformation for concurrent inserts
const apply = (s, op) => s.slice(0, op.pos) + op.text + s.slice(op.pos);
const transform = (op, against) => (against.pos < op.pos || (against.pos === op.pos && against.id < op.id) ? { ...op, pos: op.pos + against.text.length } : op);
const opA = { id: "A", pos: 1, text: "b" }, opB = { id: "B", pos: 2, text: "d" };
const siteA = apply(apply("ac", opA), transform(opB, opA));
const siteB = apply(apply("ac", opB), transform(opA, opB));
check("OT: both sites converge on the same document", siteA === "abcd" && siteB === "abcd");
// Choosing a transport
const choose = ({ bidirectional, msgsPerSec, binary = false }) => (bidirectional || binary ? "WebSocket" : msgsPerSec < 0.1 ? "Polling" : "SSE");
check("transport choices", choose({ bidirectional: true, msgsPerSec: 5 }) === "WebSocket" && choose({ bidirectional: false, msgsPerSec: 2 }) === "SSE" && choose({ bidirectional: false, msgsPerSec: 0.01 }) === "Polling");`}],
gotchas:[`Using wall-clock timestamps alone for conflict resolution loses edits when clocks skew.`,`WebSockets without heartbeats leave zombie connections that look open for minutes.`,`Sending every keystroke or cursor move unthrottled floods the server and other clients.`,`CRDT histories and tombstones grow; plan garbage collection or snapshots.`,`Real-time at scale needs a pub/sub backplane (Redis, Kafka, managed services); a single process doesn't scale.`,`Auth: tokens expire while a socket stays open; re-authenticate or reconnect.`],
best:[`Pick the simplest transport that meets requirements: SSE or polling before WebSocket when updates are one-way or infrequent.`,`Use proven collaboration libraries (Yjs, Automerge) rather than inventing a CRDT/OT.`,`Always design reconnect + resync from a sequence/cursor.`],
iq:[["senior","WebSocket vs SSE vs polling?","Polling is simplest but wasteful; SSE gives one-way server push with auto-reconnect over HTTP; WebSocket gives two-way low-latency channels but needs more operational care (heartbeats, scaling, backpressure)."],["architect","OT vs CRDT?","OT transforms operations and typically needs a central ordering server, with compact history; CRDTs make merge order-independent, good for offline and P2P, at the cost of metadata and tombstones."],["architect","How do you design a collaborative editor?","Sequence CRDT or OT on a WebSocket channel, optimistic local apply, presence/cursors as ephemeral messages, snapshots + incremental updates for load, offline queue and resync, access control, and performance for large documents."]],
practice:[`Implement a PN-Counter (increments and decrements) as two G-Counters and test convergence.`,`Add heartbeats and reconnect with a resume cursor to a WebSocket wrapper.`],
teach:`<p>"Polling asks repeatedly, SSE is a radio, WebSocket is a phone call. For shared editing, OT rewrites concurrent edits so everyone ends the same; CRDTs are data that merges safely in any order."</p>`},

{id:"d37-offline",title:"Offline-first apps and PWAs",lv:["senior","architect"],
eli5:`<p>Offline-first is <b>packing a lunchbox</b>: the app keeps what you need in a bag so you can still eat when the cafeteria (network) is closed. It writes your changes into an <b>outbox</b> notebook, and when the cafeteria reopens it hands them over in order, with a number on each note so nothing is delivered twice.</p>`,
why:`<p>Networks are slow, flaky and sometimes absent. Offline-first apps feel instant, survive tunnels and bad Wi-Fi, and are more reliable. The design problem is staying correct when data changes in two places.</p>`,
tech:`<ul class="pts"><li><b>Service worker:</b> a background script that acts as a programmable network proxy. Lifecycle: <b>register → install</b> (precache the app shell) <b>→ waiting → activate</b> (delete old caches; <code>clients.claim()</code>) <b>→ fetch</b> events. Updates install in the background and take over after old tabs close (or with <code>skipWaiting</code>, carefully).</li><li><b>Caching strategies:</b> <b>cache-first</b> (static assets), <b>network-first</b> (fresh data, fall back to cache), <b>stale-while-revalidate</b> (instant then update), <b>network-only/cache-only</b>. Use versioned cache names and Workbox for production.</li><li><b>Storage:</b> Cache API for responses, <b>IndexedDB</b> for app data and the outbox, quotas apply (Day 19).</li><li><b>Writes:</b> queue mutations in an <b>outbox</b> with idempotent ids; flush on reconnect; Background Sync (where supported) can retry when connectivity returns.</li><li><b>Conflicts:</b> last-write-wins (simple, loses data), field-level merge, version vectors/ETags with user resolution, or CRDTs for automatic merging.</li><li><b>UX:</b> show offline state, queued changes and sync status; never silently drop edits; test with DevTools offline mode and throttling.</li><li><b>Security:</b> service workers need HTTPS; a bad service worker can serve stale or broken code for a long time: ship a kill-switch/versioning plan.</li></ul>`,
diagram:{html:flow([["register SW"],["install","precache app shell","w"],["activate","delete old caches","w"],["fetch event","strategy decides","g"],["offline write","outbox in IndexedDB"],["back online","flush with idempotent ids","g"]]),steps:["The service worker is installed once and precaches the shell so the app loads offline.","On activation it removes caches from older versions.","Every request passes through the fetch handler, which applies a caching strategy per request type.","Writes made offline go to an outbox and are retried safely when the network returns."]},
ex:[{t:"Caching strategies and an outbox, simulated and self-checked",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const makeCache = () => { const m = new Map(); return { get: (k) => m.get(k), put: (k, v) => m.set(k, v), has: (k) => m.has(k) }; };
async function cacheFirst(cache, key, net){ if (cache.has(key)) return cache.get(key); const v = await net(key); cache.put(key, v); return v; }
async function networkFirst(cache, key, net){
  try { const v = await net(key); cache.put(key, v); return v; }
  catch { if (cache.has(key)) return cache.get(key); throw new Error("offline and not cached"); }
}
async function staleWhileRevalidate(cache, key, net){
  const hit = cache.get(key);
  const refresh = net(key).then((v) => { cache.put(key, v); return v; });
  return hit !== undefined ? { value: hit, refresh } : { value: await refresh, refresh };
}
function createOutbox(send){
  const q = []; let n = 0;
  return {
    add(op){ q.push({ id: ++n, op }); },
    async flush(){ const failed = []; for (const item of q.splice(0)) { try { await send(item); } catch { failed.push(item); } } q.push(...failed); return q.length; },
    get size(){ return q.length; }
  };
}
(async () => {
  let hits = 0; const net = async (k) => { hits++; return "net:" + k; };
  const c1 = makeCache();
  await cacheFirst(c1, "/logo", net); await cacheFirst(c1, "/logo", net);
  check("cache-first goes to the network only once", hits === 1);
  const c2 = makeCache(); c2.put("/api", "cached");
  const offline = async () => { throw new Error("offline"); };
  check("network-first falls back to the cache when offline", (await networkFirst(c2, "/api", offline)) === "cached");
  check("network-first with no cache fails clearly", (await networkFirst(makeCache(), "/x", offline).catch((e) => e.message)) === "offline and not cached");
  const c3 = makeCache(); c3.put("/feed", "v1");
  const r = await staleWhileRevalidate(c3, "/feed", async () => "v2");
  check("stale-while-revalidate answers instantly with the stale value", r.value === "v1");
  await r.refresh;
  check("the cache is updated in the background", c3.get("/feed") === "v2");
  const sent = []; let failOnce = true;
  const outbox = createOutbox(async (it) => { if (it.id === 2 && failOnce) { failOnce = false; throw new Error("offline"); } sent.push(it.id); });
  outbox.add("a"); outbox.add("b"); outbox.add("c");
  const left = await outbox.flush();
  check("a failed item stays queued while others go through", left === 1 && sent.join() === "1,3");
  await outbox.flush();
  check("retried later, every id delivered exactly once", sent.join() === "1,3,2" && outbox.size === 0);
})();`},
{t:"Service worker skeleton (reference)",code:`// sw.js
const VERSION = "v3";
const SHELL = ["/", "/app.js", "/styles.css", "/offline.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open("shell-" + VERSION).then((c) => c.addAll(SHELL)));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)))));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;                       // never cache writes
  if (url.pathname.startsWith("/api/")) {                       // network-first for data
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else {                                                      // cache-first for the shell
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
  }
});

// page: navigator.serviceWorker.register("/sw.js");`,run:false}],
gotchas:[`A service worker caching HTML aggressively can pin users to an old version; version caches and keep a kill-switch.`,`Cache-first for API data serves stale data forever; choose strategy per resource.`,`Never cache non-GET requests or personalized responses in shared caches.`,`Offline writes need idempotent ids or retries duplicate data.`,`iOS and other browsers have different PWA/Background Sync support; feature-detect.`,`Storage can be evicted; treat the server as the source of truth.`],
best:[`Precache a small app shell; use stale-while-revalidate for content and network-first for important data.`,`Show sync state in the UI; keep the outbox in IndexedDB; test offline and flaky networks regularly.`,`Use Workbox for caching logic in production.`],
iq:[["senior","Explain the service worker lifecycle.","Register, install (precache), waiting until old clients close (or skipWaiting), activate (clean old caches), then it controls fetches. Updates repeat the cycle in the background."],["architect","How do you design offline writes?","Persist an outbox in IndexedDB with client-generated idempotent ids, show pending state, flush in order on reconnect (Background Sync where available), server dedupes by id and returns canonical state, with a conflict strategy (versions/ETags or CRDTs)."],["architect","Which caching strategy for which resource?","Hashed static assets: cache-first. HTML/app shell: network-first or stale-while-revalidate with versioning. API reads: stale-while-revalidate or network-first. Writes: never cached; queued."]],
practice:[`Add a service worker with an offline fallback page to a small site and test it in DevTools offline mode.`,`Implement last-write-wins and field-level merge for the outbox conflicts and compare.`],
teach:`<p>"Keep a lunchbox of the app and recent data for when the network is gone; write changes into an outbox with numbered notes and send them when the network returns. Pick cache-first, network-first or stale-while-revalidate per resource."</p>`}
],quiz:[
{code:`const lww = (x, y) => x.t !== y.t ? (x.t > y.t ? x : y) : (x.id > y.id ? x : y);
console.log(lww({ t: 1, id: 'a', v: 'x' }, { t: 1, id: 'b', v: 'y' }).v);`,ans:`y`,why:`Timestamps tie, so the deterministic tie-breaker (higher replica id) decides. Every replica picks the same winner, which is what makes them converge.`},
{code:`const merge = (a, b) => Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map(k => [k, Math.max(a[k] || 0, b[k] || 0)]));
const total = (o) => Object.values(o).reduce((s, x) => s + x, 0);
console.log(total(merge({ a: 2, b: 1 }, { a: 1, b: 3 })), total(merge({ a: 1, b: 3 }, { a: 2, b: 1 })));`,ans:`5 5`,why:`Per-key max is commutative, so merge order does not matter: both give {a: 2, b: 3}, total 5. Idempotency also means receiving the same state twice is harmless.`}]},

{n:38,title:"Performance cases and reliability",goal:"Diagnose a slow page systematically and ship changes safely with measurement and fast rollback.",topics:[
{id:"d38-perf-playbook",title:"Performance playbook: why is the page slow?",lv:["senior","lead","architect"],
eli5:`<p>When a car is slow you don't just replace parts. A good mechanic <b>listens and measures first</b> (is it the engine, tires or brakes?), fixes the biggest problem, and test-drives again. For a slow page: look at what real visitors experience, decide <b>which of three things</b> is bad (shows up late, reacts late, jumps around), find the cause with a profiler, fix it, and check again.</p>`,
why:`<p>"The page is slow, what do you do?" tests whether you have a method or just a bag of tips. A good answer starts with measurement, names the metric, narrows the cause and verifies the fix.</p>`,
tech:`<h5>Triage flow</h5><ol><li><b>Define "slow":</b> which page/route, which users, which device/network? Look at <b>field data</b> (RUM/CrUX) at p75/p95.</li><li><b>Pick the failing metric:</b> LCP (loading), INP (responsiveness), CLS (stability); also TTFB and total JS.</li><li><b>Reproduce in the lab</b> with CPU/network throttling on a mid-range device profile; record a Performance trace and a Lighthouse run.</li><li><b>Find the cause</b> using the table below; confirm with evidence (waterfall, flame chart, coverage).</li><li><b>Fix the biggest contributor first</b>; change one thing at a time.</li><li><b>Verify</b> in the lab, ship behind a flag/canary, and confirm in field data; add a budget to prevent regression.</li></ol>
<table><tr><th>Symptom</th><th>Likely causes</th><th>Fixes</th></tr><tr><td>High TTFB (&gt; 800 ms)</td><td>slow backend, no CDN/cache, cold starts, redirects</td><td>CDN + cache headers, optimize queries, edge rendering, remove redirects</td></tr><tr><td>Slow LCP, image</td><td>large/unoptimized hero, discovered late, lazy-loaded above the fold</td><td>preload, <code>fetchpriority="high"</code>, AVIF/WebP, correct sizes, no lazy on LCP</td></tr><tr><td>Slow LCP, text</td><td>render-blocking CSS/JS, web font delay, client-only rendering</td><td>inline critical CSS, defer JS, font-display/preload, SSR/SSG</td></tr><tr><td>Poor INP</td><td>long tasks, heavy handlers, big hydration, huge DOM</td><td>yield/split tasks, workers, debounce, reduce hydration, virtualize, <code>content-visibility</code></td></tr><tr><td>High CLS</td><td>images/ads without size, late fonts, injected banners</td><td>width/height or aspect-ratio, reserve slots, font <code>size-adjust</code>, transform animations</td></tr><tr><td>Large JS</td><td>unneeded dependencies, no code splitting</td><td>bundle analysis, tree-shake, lazy routes, replace heavy libraries</td></tr></table>
<h5>Telling the story</h5><p>A strong answer includes numbers: "LCP p75 was 4.8 s on mid-range Android; the trace showed a 900 KB hero image discovered after render-blocking scripts; I preloaded it, converted to AVIF, deferred scripts; LCP fell to 2.1 s and conversion rose 6%."</p>`,
diagram:{html:flow([["Field data: which metric fails?","LCP / INP / CLS"],["Lab repro with throttling","trace + waterfall","w"],["Root cause","table lookup + evidence","w"],["Fix the biggest item","one change at a time","g"],["Verify + budget","field data, CI gate","g"]]),steps:["Start with real-user data so you fix what users actually feel.","Reproduce on a slow device profile; your laptop hides most problems.","Match symptoms to causes, but prove it with traces.","Ship the single most impactful fix, behind a flag.","Confirm in the field and prevent regressions with budgets."]},
ex:[{t:"A tiny triage rules engine with checks",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
function diagnose(m){
  const out = [];
  if (m.lcp > 2500) {
    if (m.ttfb > 800) out.push("LCP: slow server response (TTFB): add CDN/caching, optimize the backend");
    else if (m.lcpType === "image") out.push("LCP: hero image: preload it, fetchpriority=high, compress (AVIF), correct size");
    else out.push("LCP: render-blocking CSS/JS or client-only rendering: inline critical CSS, defer JS, consider SSR");
  }
  if (m.inp > 200) out.push(m.longTasks > 0 ? "INP: long tasks on interaction: split work (yield), use a worker, reduce hydration" : "INP: slow rendering after input: reduce DOM size and layout work");
  if (m.cls > 0.1) out.push("CLS: reserve space (width/height, aspect-ratio), avoid inserting above existing content, tune fonts");
  if (!out.length) out.push("Vitals look good at p75: check the tail (p95) and specific routes");
  return out;
}
const has = (list, text) => list.some((l) => l.includes(text));
check("slow server → TTFB advice first", has(diagnose({ lcp: 4200, ttfb: 1500 }), "TTFB"));
check("fast server + image LCP → image advice", has(diagnose({ lcp: 3000, ttfb: 300, lcpType: "image" }), "hero image"));
check("fast server + text LCP → blocking resources advice", has(diagnose({ lcp: 3000, ttfb: 300, lcpType: "text" }), "render-blocking"));
check("bad INP with long tasks → split work", has(diagnose({ inp: 450, longTasks: 6 }), "long tasks"));
check("bad INP without long tasks → rendering cost", has(diagnose({ inp: 450, longTasks: 0 }), "slow rendering"));
check("bad CLS → reserve space", has(diagnose({ cls: 0.3 }), "reserve space"));
check("multiple problems produce multiple recommendations", diagnose({ lcp: 4000, ttfb: 1000, inp: 300, longTasks: 1, cls: 0.2 }).length === 3);
check("good vitals → look at the tail", has(diagnose({ lcp: 1800, inp: 120, cls: 0.02 }), "tail"));`}],
gotchas:[`Optimizing lab scores while field data regresses.`,`Fixing several things at once so you can't tell what worked.`,`Testing only on a fast laptop and fast Wi-Fi.`,`Lazy-loading the LCP image (a common self-inflicted wound).`,`Third-party scripts often dominate main-thread time; audit them.`,`Percentiles: averages hide the slow tail; use p75 and p95.`],
best:[`Always start with field data; always state numbers before and after.`,`Add performance budgets and RUM alerts to keep the gains.`],
iq:[["senior","The homepage is slow. What do you do?","Check field data (p75 LCP/INP/CLS, TTFB), reproduce with throttling, trace the main thread and waterfall, identify the biggest cause (server, image, blocking JS, long tasks, shifts), fix one thing at a time, verify with lab and field data, and add a budget."],["architect","How do you build a culture of performance?","RUM and dashboards owned by teams, budgets in CI, performance in definition of done, regular profiling of key journeys, shared tooling, and publishing wins with business metrics."],["lead","LCP is 4.8 s because of a hero image. Plan?","Preload with fetchpriority high, serve AVIF/WebP at the right size via srcset, remove lazy loading from it, inline critical CSS and defer scripts, verify with a throttled trace, ship behind a flag, confirm in CrUX/RUM."]],
practice:[`Take a real site, record a Performance trace with 4x CPU throttling and write a one-paragraph diagnosis with numbers.`,`Extend <code>diagnose</code> with a rule for JavaScript size and third-party scripts.`],
teach:`<p>"Don't guess: look at real users, find which of the three vitals fails, trace the cause, fix the biggest thing, and prove it with numbers before and after."</p>`},

{id:"d38-reliability",title:"Reliability, security and safe rollout",lv:["senior","lead","architect"],
eli5:`<p>Opening a new shop wing safely: let a <b>few customers try it first</b> (canary), have a <b>big red button to close it</b> (rollback), put a <b>fuse in the wiring</b> that cuts power if something keeps failing so the whole building doesn't burn (circuit breaker), and have <b>smoke alarms</b> (monitoring) that tell you quickly.</p>`,
why:`<p>Most outages come from changes. Senior engineers reduce risk with progressive delivery, quick rollback, graceful degradation and observability, and consider security as part of reliability.</p>`,
tech:`<ul class="pts"><li><b>Feature flags:</b> decouple deploy from release; percentage rollouts use a <b>stable hash</b> of user id + flag name so each user gets a consistent experience; remove flags after rollout (flag debt).</li><li><b>Canary / progressive delivery:</b> release to 1% → 10% → 50% → 100% while watching error rate, latency and business metrics; <b>auto-rollback</b> on SLO burn.</li><li><b>Rollback readiness:</b> immutable builds, backwards-compatible API/DB changes (expand → migrate → contract), kill-switches for risky features, keep old chunks available for users with open tabs.</li><li><b>Circuit breaker:</b> states <i>closed</i> (normal) → <i>open</i> (fail fast after N failures) → <i>half-open</i> (probe after a cooldown); protects dependencies and users from retry storms. Combine with timeouts, retries with backoff, bulkheads and fallbacks.</li><li><b>Graceful degradation:</b> show cached/stale data, disable non-essential widgets, clear error states.</li><li><b>SLIs/SLOs and error budgets:</b> define user-centric indicators (availability, latency, Web Vitals); when the budget burns, slow releases and fix reliability.</li><li><b>Incident response:</b> detect → triage → mitigate (rollback/flag off) → communicate → post-incident review (blameless) with action items.</li><li><b>Security threat modeling (STRIDE) for the frontend:</b> Spoofing (auth/session), Tampering (client-side validation is not security), Repudiation (audit logs), Information disclosure (tokens, PII in logs/storage), Denial of service (expensive queries, rate limits), Elevation of privilege (authorization on the server for every action).</li></ul>`,
diagram:{html:flow([["deploy dark","flag off"],["1% canary","watch errors + latency","w"],["10% → 50%","SLO healthy?","w"],["100%","remove flag later","g"],["SLO burning","auto-rollback / flag off","r"]]),steps:["Ship code turned off so deploy risk is separate from release risk.","Expose it to a tiny stable cohort and watch the metrics that matter.","Increase gradually; any breach triggers a rollback or kill-switch.","After full rollout, delete the flag to avoid long-term complexity."]},
ex:[{t:"Stable percentage rollout and a circuit breaker (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const bucket = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h % 100; };   // FNV-1a
const enabled = (flag, user, pct) => bucket(flag + ":" + user) < pct;
check("same user always gets the same answer", enabled("new-checkout", "u1", 50) === enabled("new-checkout", "u1", 50));
const users = Array.from({ length: 1000 }, (_, i) => "user" + i);
check("0% enables nobody, 100% enables everybody", users.every((u) => !enabled("f", u, 0)) && users.every((u) => enabled("f", u, 100)));
const on20 = users.filter((u) => enabled("f", u, 20)).length;
check("20% rollout is roughly 20% of users (" + on20 + "/1000)", on20 > 140 && on20 < 260);
check("raising the percentage never removes a user", users.filter((u) => enabled("f", u, 10)).every((u) => enabled("f", u, 30)));
check("different flags bucket users differently", users.some((u) => enabled("a", u, 50) !== enabled("b", u, 50)));
function circuitBreaker(fn, { threshold = 3, cooldown = 1000, now = () => Date.now() } = {}){
  let fails = 0, state = "closed", openedAt = 0;
  const run = async (...a) => {
    if (state === "open") { if (now() - openedAt >= cooldown) state = "half-open"; else throw new Error("circuit open"); }
    try { const r = await fn(...a); fails = 0; state = "closed"; return r; }
    catch (e) { fails++; if (state === "half-open" || fails >= threshold) { state = "open"; openedAt = now(); } throw e; }
  };
  run.state = () => state;
  return run;
}
(async () => {
  let clock = 0, calls = 0, failing = true;
  const flaky = async () => { calls++; if (failing) throw new Error("down"); return "ok"; };
  const br = circuitBreaker(flaky, { threshold: 3, cooldown: 1000, now: () => clock });
  for (let i = 0; i < 3; i++) await br().catch(() => {});
  check("opens after 3 consecutive failures", br.state() === "open" && calls === 3);
  const msg = await br().catch((e) => e.message);
  check("open circuit fails fast without calling the service", msg === "circuit open" && calls === 3);
  clock = 1000; failing = false;
  check("after the cooldown a probe succeeds and closes the circuit", (await br()) === "ok" && br.state() === "closed" && calls === 4);
  failing = true; clock = 2000;
  for (let i = 0; i < 3; i++) await br().catch(() => {});
  check("opens again after new failures", br.state() === "open");
  clock = 3000; await br().catch(() => {});
  check("a failed probe re-opens immediately", br.state() === "open");
})();`}],
gotchas:[`Feature flags that are never removed pile up into untestable combinations.`,`Random per-request rollout (instead of a stable hash) gives users flickering experiences.`,`Rolling back code without rolling back incompatible data/API changes fails; make changes backwards compatible.`,`Retries without a circuit breaker or budget amplify outages (retry storms).`,`Client-side checks are UX, not security: authorize every action on the server.`,`Alerting on causes (CPU) instead of user symptoms creates noise and misses real incidents.`],
best:[`Ship dark, canary, observe, expand; keep a kill-switch for risky features.`,`Define SLOs for user-visible behavior and use error budgets to balance speed and stability.`,`Run blameless post-incident reviews and track action items to completion.`],
iq:[["senior","How do you release a risky change safely?","Behind a feature flag, canary to a small stable cohort, monitor error rate/latency/business metrics against SLOs, expand gradually, keep rollback or a kill-switch ready, and clean up the flag afterwards."],["architect","What is a circuit breaker and when do you use it?","A wrapper that stops calling a failing dependency after repeated failures (open), probes after a cooldown (half-open) and resumes on success (closed); used to fail fast, protect services and prevent retry storms."],["architect","How do you make deployments reversible?","Immutable artifacts, backwards-compatible schema and API changes (expand/migrate/contract), versioned assets with old chunks retained, flags to disable features instantly, and automated rollback on SLO burn."]],
practice:[`Add a half-open probe limit (allow only one trial request) to the circuit breaker.`,`Write a rollout plan with percentages, metrics, owners and rollback criteria for a risky feature.`],
teach:`<p>"Ship it switched off, turn it on for a few users with a stable hash, watch the gauges, grow slowly, and keep a red button. A circuit breaker stops hammering a broken service."</p>`}
],quiz:[
{code:`const diag = (m) => [m.lcp > 2500 && (m.ttfb > 800 ? 'server' : 'frontend'), m.cls > 0.1 && 'layout shift'].filter(Boolean);
console.log(diag({ lcp: 3000, ttfb: 1200, cls: 0.05 }), diag({ lcp: 3000, ttfb: 200, cls: 0.2 }));`,ans:`["server"] ["frontend", "layout shift"]`,why:`Check TTFB before blaming the frontend: if the server answer is already slow, front-end fixes alone cannot rescue LCP. The second page has a fast server, so the LCP cause is on the front end, plus a separate CLS issue.`},
{code:`const bucket = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h % 100; };
console.log(bucket('flag:u1') === bucket('flag:u1'), bucket('flag:u1') < 100);`,ans:`true true`,why:`A hash of the flag and user id is deterministic, so each user keeps the same experience across requests, and the bucket is always between 0 and 99, which allows percentage rollouts.`}]},

{n:39,title:"Leadership and decisions",goal:"Tell strong stories, make and defend architecture decisions, and show senior judgment.",topics:[
{id:"d39-behavioral",title:"Behavioral and leadership interviews",lv:["mid","senior","lead","architect"],
eli5:`<p>A behavioral interview asks "tell me about a time when…". Good answers are <b>little movies with a beginning, a middle and an end</b>: what was going on, what <i>you</i> did, how it turned out (with numbers), and what you learned. Like telling a friend about the day you fixed a flat tire in the rain: short, clear, and you're the hero of your own story, without ignoring the people who helped.</p>`,
why:`<p>Senior roles are won or lost on judgment, communication and ownership. Interviewers use stories as evidence of how you behave under ambiguity, conflict, failure and pressure.</p>`,
tech:`<h5>STAR+R</h5><ul class="pts"><li><b>Situation:</b> one or two sentences of context (scale, stakes, team size).</li><li><b>Task:</b> what you were responsible for.</li><li><b>Action:</b> the bulk of the answer: <i>what you did</i> and why (use "I" for your actions; credit the team honestly).</li><li><b>Result:</b> measurable outcome (numbers, time, money, quality) and business impact.</li><li><b>Reflection:</b> what you learned or would change.</li></ul>
<h5>Your story bank (prepare 7, each reusable for several questions)</h5><table><tr><th>Story</th><th>Shows</th></tr><tr><td>Hard bug you diagnosed</td><td>systematic debugging, tools, persistence</td></tr><tr><td>Performance or quality win with numbers</td><td>impact, measurement</td></tr><tr><td>Disagreement with a peer/manager</td><td>communication, data over ego, commitment after decisions</td></tr><tr><td>A failure or incident you caused or handled</td><td>ownership, blameless learning, prevention</td></tr><tr><td>Ambiguous project you shaped</td><td>scoping, trade-offs, stakeholder alignment</td></tr><tr><td>Mentoring or raising the team's level</td><td>leadership, multiplying impact</td></tr><tr><td>Influencing without authority / a technical decision (ADR)</td><td>architecture judgment, persuasion</td></tr></table>
<h5>What each level is evaluated on</h5><ul class="pts"><li><b>Mid:</b> reliable delivery, learns fast, communicates blockers.</li><li><b>Senior:</b> owns ambiguous problems end to end, makes trade-offs, mentors.</li><li><b>Lead:</b> sets team standards, grows people, balances delivery and debt, manages conflict.</li><li><b>Architect:</b> cross-team influence, long-term vision, risk management, decisions with documented trade-offs, aligning technology with business goals.</li></ul>
<p><b>Rules:</b> be specific and honest, include numbers, keep answers to 2–3 minutes, never blame others, and prefer stories where you changed your mind or learned something. Use real stories from your own experience; never invent.</p>`,
diagram:{html:flow([["Situation","context + stakes"],["Task","your responsibility","w"],["Action","what YOU did and why","g"],["Result","numbers + impact","g"],["Reflection","what you'd change","r"]]),steps:["Set the scene in two sentences; do not start with the backstory of the company.","Say what you owned and what success meant.","Spend most of the time on your decisions and actions, including alternatives you rejected.","Quantify the result; if you can't, describe observable change.","End with a lesson; it shows growth and self-awareness."]},
ex:[{t:"A story linter: does your answer have the ingredients? (runnable)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const lint = (s) => {
  const low = s.toLowerCase();
  const w = low.match(/[a-z']+/g) || [];
  const metrics = (s.match(/[0-9]+([.][0-9]+)?%?/g) || []).length;
  const I = w.filter((x) => x === "i").length, we = w.filter((x) => x === "we").length;
  return {
    words: w.length, metrics,
    ownership: I >= we,
    hasResult: /(reduced|improved|increased|saved|shipped|cut|grew)/.test(low),
    hasLesson: /(learned|next time|would change|retrospective)/.test(low)
  };
};
const story = "Situation: our checkout page had an LCP of 4.8 s. I profiled it, found a 900 KB hero image and render-blocking scripts. I preloaded the image, deferred the scripts and cut LCP to 2.1 s, which improved conversion by 6%. I learned to measure field data first.";
const r = lint(story);
console.log(r);
check("has measurable numbers", r.metrics >= 3);
check("shows personal ownership (I over we)", r.ownership);
check("states a result", r.hasResult);
check("includes a lesson", r.hasLesson);
check("fits roughly in 30-60 seconds when spoken", r.words > 20 && r.words < 150);
const weak = lint("We worked hard and it went well.");
check("a vague story is flagged", weak.metrics === 0 && !weak.hasResult && !weak.hasLesson && !weak.ownership);`}],
gotchas:[`Saying "we" for everything hides your contribution; saying "I" for everything sounds arrogant. Be precise about your role.`,`Blaming a person or team in a conflict story is a red flag.`,`Stories without numbers or outcomes sound like activity, not impact.`,`Rambling past 3 minutes: practice with a timer.`,`Inventing or exaggerating stories collapses under follow-up questions.`,`For failure stories, don't pick a fake weakness; pick a real mistake and show the fix and prevention.`],
best:[`Write each story in STAR+R form with 2–3 numbers; rehearse aloud; tailor the emphasis to the role.`,`Prepare follow-ups: "what would you do differently?", "what did you disagree on?", "how did you measure it?".`,`Ask about team and engineering practices to show judgment.`],
iq:[["mid","Tell me about a time you disagreed with a teammate.","Describe the technical disagreement, how you gathered data or prototypes, how you listened to their view, what was decided, and the outcome; show that you committed to the decision."],["senior","Tell me about a time you made a mistake in production.","Context and impact, how you detected and mitigated quickly (rollback/flag), the root cause without blame, the fix, and the preventive changes (tests, alerts, process) with the result."],["lead","How do you handle underperformance on your team?","Clarify expectations with specifics, understand root causes, give frequent feedback and support, set a time-bound plan with checkpoints, document, and involve HR/management if needed, while treating the person with respect."],["architect","Tell me about influencing a decision across teams without authority.","Frame the shared problem, gather data, build a prototype or ADR, listen to constraints, find allies, offer an incremental path, and measure results; explain the outcome and what you'd change."]],
practice:[`Write all 7 stories in STAR+R with numbers and time yourself to 2–3 minutes each.`,`Have a friend interrupt with follow-up questions and practice staying calm and specific.`],
teach:`<p>"Tell a short story: what was happening, what I owned, what I did and why, what changed (with numbers), and what I learned. Use real stories, own your part, and never blame people."</p>`},

{id:"d39-decisions",title:"Architecture decisions and trade-off debates",lv:["lead","architect"],
eli5:`<p>Choosing a family car vs a sports car vs a minivan: there's no "best car", only the best <b>for your family's needs</b>. Good architects write down <b>what they chose, what they rejected, and why</b>, so that later people understand and can change it when the family grows. Some choices (which shirt) can be undone tomorrow; some (buying a house) can't, so those deserve more thinking.</p>`,
why:`<p>Architect-level interviews ask you to choose, defend and communicate decisions under uncertainty. Writing decisions down (ADRs) prevents re-arguing and preserves context.</p>`,
tech:`<h5>ADR (Architecture Decision Record) template</h5><ul class="pts"><li><b>Title and status</b> (proposed, accepted, superseded).</li><li><b>Context:</b> the problem, constraints, forces (team size, deadlines, scale, skills).</li><li><b>Options considered</b> with pros and cons.</li><li><b>Decision</b> and the main reason.</li><li><b>Consequences:</b> what becomes easier/harder, risks, how we'll know it's wrong (revisit triggers), migration/rollback plan.</li></ul>
<h5>One-way vs two-way doors</h5><p><b>Two-way doors</b> (reversible, cheap) are decided quickly by the owner; <b>one-way doors</b> (hard or expensive to reverse: data models, public APIs, core framework, vendor lock-in) deserve an ADR, review and a prototype.</p>
<h5>Common debates (state criteria, not slogans)</h5><table><tr><th>Debate</th><th>Favors option A when…</th><th>Favors option B when…</th></tr><tr><td>Monorepo vs polyrepo</td><td>many packages change together, shared tooling, atomic refactors</td><td>independent teams/lifecycles, strong separate ownership, simple repos</td></tr><tr><td>SSR vs CSR</td><td>SEO, fast first paint, content sites</td><td>app behind login, rich interactivity, simple hosting</td></tr><tr><td>REST vs GraphQL</td><td>simple resources, caching, public APIs</td><td>many clients with varied data needs, aggregation across services (needs cost controls)</td></tr><tr><td>TypeScript vs JS (+JSDoc)</td><td>large teams, long-lived code, refactoring safety</td><td>small scripts, prototypes, build-free workflows</td></tr><tr><td>Micro-frontends vs modular monolith</td><td>many teams needing independent deploys</td><td>fewer teams; simplicity and consistent UX matter more</td></tr><tr><td>Build vs buy</td><td>differentiating capability, tight control</td><td>commodity capability, time-to-market, support burden</td></tr><tr><td>Global store vs local/server state</td><td>truly shared client state</td><td>most state is local or server cache</td></tr></table>
<p><b>How to argue:</b> restate the goal, list constraints, show 2–3 options, score against explicit criteria (make the <b>weights</b> visible, because disagreements are usually about weights), pick one, state risks and the signal that would make you change your mind.</p>`,
diagram:{html:flow([["Problem + constraints"],["2–3 options","with pros/cons","w"],["Criteria + weights","made explicit","w"],["Decision + ADR","why, risks, revisit trigger","g"],["Review later","signals say wrong? supersede","r"]]),steps:["Write the problem and the real constraints (people, time, scale).","Compare a small number of real options, including 'do nothing'.","Expose the criteria and weights; most debates are weight debates.","Record the decision, the reasons and when to revisit it.","If signals show it is wrong, write a new ADR that supersedes the old one."]},
ex:[{t:"Weighted decision matrix and the door rule (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const score = (options, weights) => Object.entries(options)
  .map(([name, s]) => ({ name, total: Object.keys(weights).reduce((t, k) => t + weights[k] * s[k], 0) }))
  .sort((a, b) => b.total - a.total);
const options = {
  "Modular monolith":   { autonomy: 3, perf: 4, simplicity: 5, cost: 4 },
  "Micro-frontends":    { autonomy: 5, perf: 2, simplicity: 2, cost: 2 },
  "Monorepo + packages": { autonomy: 4, perf: 4, simplicity: 4, cost: 4 }
};
const balanced = score(options, { autonomy: 5, perf: 3, simplicity: 4, cost: 2 });
console.log(balanced);
check("balanced weights: monorepo + packages ranks first", balanced[0].name === "Monorepo + packages" && balanced[0].total === 56);
check("micro-frontends rank last under balanced weights", balanced[2].name === "Micro-frontends" && balanced[2].total === 43);
const autonomyFirst = score(options, { autonomy: 20, perf: 1, simplicity: 1, cost: 1 });
check("if team autonomy dominates, micro-frontends win (weights are the argument)", autonomyFirst[0].name === "Micro-frontends");
const decide = ({ reversible, costToChange }) => (reversible && costToChange === "low" ? "decide quickly, note it in one sentence" : "write an ADR and get a review");
check("two-way door is decided fast", decide({ reversible: true, costToChange: "low" }).startsWith("decide quickly"));
check("one-way door gets an ADR", decide({ reversible: false, costToChange: "low" }).includes("ADR") && decide({ reversible: true, costToChange: "high" }).includes("ADR"));`}],
gotchas:[`Treating a trade-off as a verdict ("X is always better"); say "for this context".`,`Hidden weights: stakeholders disagree because they weigh criteria differently; surface them.`,`Deciding irreversible things casually, or agonizing over reversible ones.`,`Resume-driven choices: new technology without a problem it solves.`,`ADRs written after the fact with no real alternatives are just documentation theater.`,`No revisit trigger: decisions fossilize.`],
best:[`Keep ADRs short (one page), in the repo, numbered and immutable (supersede rather than edit).`,`Include "do nothing" as an option and name the signals that would change the decision.`,`Bias toward boring technology unless the problem needs something novel.`],
iq:[["architect","Monorepo vs polyrepo?","Monorepo suits many related packages with shared tooling and atomic changes (needs caching, ownership, boundaries); polyrepo suits independent lifecycles and teams. Decide by change coupling, team structure and tooling maturity."],["architect","How do you decide between building and buying?","Build what differentiates the business or needs deep control; buy commodity capabilities for speed and support. Compare total cost over time, lock-in, security/compliance and team capacity; check an exit strategy."],["lead","What goes in an ADR?","Context and constraints, options with pros/cons, the decision and reason, consequences and risks, rollout/rollback, and revisit triggers; status and date."],["architect","How do you handle a disagreement on a technical direction?","Agree on the goal and constraints, make criteria and weights explicit, prototype or measure the riskiest assumption, document with an ADR, decide who owns the call, and commit together while defining a revisit point."]],
practice:[`Write an ADR for a real decision you made (framework, state library, repo layout).`,`Run the decision matrix with two different weight sets and explain what changed.`],
teach:`<p>"There's no best choice, only the best for this situation. Write down options and reasons, show the weights, decide fast on reversible choices and carefully on irreversible ones, and say what would change your mind."</p>`}
],quiz:[
{code:`const opts = { A: [3, 5], B: [4, 4] }, w = [7, 3];
console.log(Object.entries(opts).map(([k, s]) => [k, s.reduce((t, x, i) => t + x * w[i], 0)]));`,ans:`[["A", 36], ["B", 40]]`,why:`A scores 3×7 + 5×3 = 36 and B scores 4×7 + 4×3 = 40. Changing the weights can reverse the winner, which is why you should make the weights explicit when presenting a decision.`},
{code:`const decide = (reversible, cost) => reversible && cost === 'low' ? 'decide fast' : 'write an ADR';
console.log(decide(true, 'low'), '|', decide(false, 'low'));`,ans:`decide fast | write an ADR`,why:`Reversible, low-cost choices (two-way doors) should not be slowed down; hard-to-reverse ones deserve a recorded, reviewed decision.`}]},

{n:40,title:"Final gauntlet",goal:"Do a last rapid review of everything, assess weak spots honestly, and walk into the interview with a plan.",topics:[
{id:"d40-rapid-fire",title:"Rapid-fire round: one-line answers",lv:["fresher","mid","senior","lead","architect"],
eli5:`<p>Flash cards. Cover the answer, say it out loud in <b>one breath</b>, then check. If you can say it simply, you understand it; if you need five sentences, go back to that day and re-read the 5-year-old tab.</p>`,
tech:`<p><b>How to use this round:</b> set a timer for 20 minutes; read the question, answer aloud in about 15–20 seconds, then open the answer and mark ✓ or ✗. Re-do the ✗ ones tomorrow. Answers are intentionally short, because in a real interview you add one example and one pitfall.</p><p>The badge shows the level where the question is commonly asked; <b>every level is expected to know the levels below it</b>. Topics link back to their days: language (Days 1–10), async (11–15), browser (16–20), engine/modules (21–25), Node/architecture (26–29).</p>`,
diagram:{html:flow([["Read question"],["Answer aloud in 20 s","one breath","w"],["Open the answer","✓ or ✗","g"],["Re-do the ✗ tomorrow","spaced repetition","r"]]),steps:["Speaking aloud exposes gaps that reading hides.","Short answers force you to find the core idea.","Marking misses creates your personal revision list.","Repeating misses after a day beats re-reading everything."]},
ex:[],
gotchas:[`One-line answers are the opening, not the whole answer: in the interview add an example, a pitfall and a trade-off.`,`If an answer feels memorized, ask yourself "why?" three times.`],
best:[`Do a rapid-fire round every morning in the last week; add your own questions.`],
iq:[
["fresher","var vs let vs const?","Scope (function vs block), hoisting behavior (undefined vs TDZ), and reassignment: const protects the binding, not the contents."],
["fresher","What is a closure?","A function plus a live reference to the variables of the scope where it was created."],
["fresher","== vs ===?","=== compares without coercion; == converts types first. Prefer ===."],
["fresher","null vs undefined?","undefined: no value assigned; null: intentional empty. typeof null is 'object' (legacy bug)."],
["fresher","What is hoisting?","Declarations are registered at scope creation: var as undefined, functions fully, let/const in the TDZ."],
["fresher","Arrow vs regular functions?","Arrows have no own this/arguments/new.target and can't be constructors; this is lexical."],
["fresher","What is the DOM?","The browser's live object tree of the page that JavaScript can read and change."],
["fresher","What is event bubbling?","After the target handles an event it propagates up through ancestors; delegation uses this."],
["fresher","JSON.stringify pitfalls?","Drops undefined/functions/symbols, NaN becomes null, Dates become strings, throws on cycles and BigInt."],
["fresher","Why is 0.1 + 0.2 not 0.3?","Binary floating point can't represent 0.1 or 0.2 exactly."],
["mid","call vs apply vs bind?","call: this + args list; apply: this + args array; bind: returns a new function with this (and preset args) fixed."],
["mid","How does the prototype chain work?","Lookups walk [[Prototype]] links to null; writes create own properties."],
["mid","Promise states and then()?","pending → fulfilled/rejected once; then returns a new promise; callbacks run as microtasks."],
["mid","Event loop order?","Sync code, then all microtasks, then (maybe render) one task, repeat."],
["mid","debounce vs throttle?","Debounce runs after calls stop; throttle runs at most once per interval."],
["mid","localStorage vs cookies?","localStorage: sync strings, not sent to the server, readable by any script; cookies are sent with requests and can be HttpOnly."],
["mid","What is CORS?","A browser rule: a page may read another origin's response only if that server allows it via headers; non-simple requests get a preflight."],
["mid","defer vs async?","Both download in parallel; defer runs after parsing in order, async runs when ready in any order."],
["mid","Reflow vs repaint?","Reflow recomputes layout; repaint redraws pixels. transform/opacity can skip both."],
["mid","Shallow vs deep copy?","Shallow copies the top level (nested objects shared); deep copies recursively (structuredClone for plain data)."],
["senior","Microtask starvation?","Endless microtasks keep the queue non-empty, so rendering and timers never run."],
["senior","When use WeakMap?","To attach data to objects without keeping them alive; keys must be objects and entries vanish when keys are collected."],
["senior","Hidden classes?","V8 shapes shared by objects with the same property history; stable shapes keep property access fast."],
["senior","Common memory leaks?","Forgotten timers/listeners, detached DOM, unbounded caches, closures holding big data, accidental globals."],
["senior","ESM vs CJS?","ESM is static with live read-only bindings, async, strict, top-level await; CJS is dynamic and copies values."],
["senior","What does tree-shaking need?","Static ES module imports/exports and side-effect-free modules (sideEffects flag)."],
["senior","XSS vs CSRF defenses?","XSS: encode/textContent, sanitize, CSP, Trusted Types. CSRF: SameSite cookies, tokens, Origin checks."],
["senior","Core Web Vitals thresholds?","LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile."],
["senior","Why does hydration hurt INP?","The page looks ready but JavaScript must re-run and attach handlers, blocking the main thread."],
["senior","Idempotency key?","A client-supplied id that makes retries of unsafe requests safe: the server returns the stored result for repeats."],
["senior","Cursor vs offset pagination?","Cursor continues from a position and stays stable under inserts; offset can skip/duplicate and gets slow."],
["lead","How do you introduce linting/TypeScript to a team?","Start with agreed rules, automate in editor/CI, adopt incrementally with allowJs, fix by area, and measure friction."],
["lead","Code review priorities?","Correctness, design/maintainability, tests, security, performance, then style (automated)."],
["lead","How do you handle tech debt?","Make it visible, quantify its cost, reserve capacity, fix it alongside feature work, and prioritize by risk and change frequency."],
["lead","Migration strategy?","Incremental, behind adapters/flags, with tests, metrics, a rollback path and a removal date."],
["lead","What do you track for team health?","Delivery (lead time, deploy frequency, change failure rate, time to restore), quality, and developer experience."],
["architect","SSR vs CSR vs SSG?","SSR: HTML per request; CSR: in the browser; SSG: pre-built. Choose by freshness, SEO, personalization and cost; mix per route."],
["architect","When micro-frontends?","When many teams need independent deploys; otherwise a modular monolith is simpler."],
["architect","Monorepo trade-offs?","Atomic changes and shared tooling vs need for caching, boundaries and ownership at scale."],
["architect","SLO and error budget?","An SLO is a target for user-visible reliability; the error budget is the allowed failure that guides release speed."],
["architect","Feature flags + canary?","Decouple deploy from release; expose to a stable cohort, watch SLOs, expand or roll back."],
["architect","CRDT vs OT?","CRDTs merge in any order (offline/P2P, metadata cost); OT transforms operations, usually with a central server."],
["architect","Offline conflict strategies?","Last-write-wins (lossy), field-level merge, versions/ETags with user resolution, or CRDTs."],
["architect","REST vs GraphQL vs BFF?","REST for simple/cacheable resources; GraphQL for flexible multi-client queries (with cost controls); BFF to shape data per UI."],
["architect","Design system governance?","Tokens, versioned releases, contribution process, accessibility and visual regression tests, deprecation policy and adoption metrics."],
["architect","Observability stack?","Logs, metrics, traces (OpenTelemetry), RUM for Web Vitals and errors with source maps, dashboards and SLO alerts."]
],
practice:[`Do all 50 in two sessions of 25; write your ✗ list and revisit those days.`,`Add 10 of your own questions from your real projects.`],
teach:`<p>"If you can answer in one breath, you understand it. If you can then add one example and one pitfall, you can teach it."</p>`},

{id:"d40-final",title:"Mock plan, rubric and day-before checklist",lv:["fresher","mid","senior","lead","architect"],
eli5:`<p>Before a big match, athletes <b>scrimmage</b> (practice games), look at the <b>scoreboard of their weak spots</b>, sleep well and pack their bag the night before. This lesson is your scrimmage plan: practice rounds, an honest self-score, and a checklist so nothing silly goes wrong on the day.</p>`,
why:`<p>Preparation fails when it is unfocused. A schedule built from your honest weak spots, with realistic mock rounds, converts the course into interview performance.</p>`,
tech:`<h5>Mock rounds (do each at least twice, out loud, timed)</h5><table><tr><th>Round</th><th>Format</th><th>Material</th></tr><tr><td>Language + output puzzles</td><td>30 min, 8–10 snippets</td><td>Day 31 drills, rapid-fire</td></tr><tr><td>Coding (utilities/polyfills)</td><td>45 min, 1–2 problems</td><td>Days 32–34</td></tr><tr><td>UI machine coding</td><td>60 min, 1 widget</td><td>Day 35</td></tr><tr><td>Frontend system design</td><td>45 min</td><td>Days 36–38 (feed, chat, autocomplete, offline)</td></tr><tr><td>Behavioral / leadership</td><td>45 min</td><td>Day 39 story bank</td></tr></table>
<h5>Scoring rubric (rate yourself 1–5 per row; ask a friend to rate you too)</h5><table><tr><th>Dimension</th><th>5 means</th></tr><tr><td>Correctness</td><td>works for edge cases, no hand-waving</td></tr><tr><td>Communication</td><td>structured, thinks aloud, checks understanding</td></tr><tr><td>Trade-offs</td><td>names alternatives and costs unprompted</td></tr><tr><td>Testing mindset</td><td>states tests/edge cases and verifies</td></tr><tr><td>Depth</td><td>explains why, including browser/engine behavior</td></tr><tr><td>Ownership and impact (behavioral)</td><td>specific actions, numbers, lessons</td></tr></table>
<h5>Final-week plan</h5><ul class="pts"><li><b>Days −7 to −4:</b> self-assessment, then deep review of your weakest areas; two mock rounds per day.</li><li><b>Days −3 to −2:</b> rapid-fire, polyfill re-implementations from a blank file, 2 system-design talks, story rehearsal.</li><li><b>Day −1:</b> light review of the cheat sheet (Day 30), pack logistics, sleep.</li></ul>
<h5>Day-before and day-of checklist</h5><ul class="pts"><li>Test camera, microphone, internet, editor/online IDE, a second device as backup; close notifications.</li><li>Water, a notepad, your story bank and the cheat sheet nearby (if allowed).</li><li>Clarify before coding; think aloud; state complexity; test with edge cases; ask clarifying questions in design.</li><li>If you blank: restate the problem, write the brute force, ask for a hint; stay calm.</li><li><b>Ask the interviewer:</b> team structure and engineering practices, how success is measured in six months, biggest technical challenges, how decisions are made, on-call and release process, growth paths.</li><li>Afterwards: write down every question you were asked and how it went; add misses to your rapid-fire list.</li></ul>`,
diagram:{html:flow([["Self-assess","score 12 areas honestly"],["Plan","weak areas → days to revisit","w"],["Mock rounds","out loud, timed","w"],["Review","rubric + friend feedback","g"],["Rest + checklist","day before","g"]]),steps:["Honest scoring beats confident guessing; weak areas get the most time.","The plan converts scores into specific course days.","Mock rounds simulate pressure and reveal communication gaps.","Review with a rubric and a second opinion.","Rest and logistics protect performance on the day."]},
ex:[{t:"Self-assessment to study plan (runnable, self-checked)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const areas = {
  "Language core": [1, 2, 3, 4],
  "Objects, prototypes, classes": [5, 7, 8],
  "Closures, iterators, Proxy": [6, 9, 10],
  "Async and event loop": [11, 12, 13, 14, 15],
  "Browser and rendering": [16, 17, 18],
  "Storage, network, security": [19, 20],
  "Engine, memory, performance": [21, 22, 23],
  "Modules, bundling, Node": [24, 25, 26],
  "Testing, tooling, patterns, state": [27, 28],
  "Architecture and system design": [29, 36, 37, 38],
  "Coding rounds": [31, 32, 33, 34, 35],
  "Leadership and behavioral": [39, 40]
};
const plan = (scores, threshold = 3) => Object.entries(scores).filter(([, s]) => s <= threshold).sort((a, b) => a[1] - b[1]).flatMap(([k]) => areas[k]);
const myScores = { "Async and event loop": 2, "Coding rounds": 3, "Language core": 5, "Architecture and system design": 4 };
const days = plan(myScores);
console.log("revisit days, weakest first:", days.join(", "));
check("weakest area comes first", days.slice(0, 5).join() === "11,12,13,14,15");
check("areas scoring above the threshold are skipped", !days.includes(1) && !days.includes(36));
check("threshold can be raised to include more areas", plan(myScores, 4).includes(36));
check("every course day from 1 to 40 belongs to some area", [...new Set(Object.values(areas).flat())].length >= 38);
const total = Object.values(myScores).reduce((a, b) => a + b, 0) / Object.keys(myScores).length;
check("average self-score is computed", total === 3.5);`}],
gotchas:[`Practicing silently: the interview is spoken. Record yourself.`,`Only practicing what you're already good at.`,`Memorizing solutions instead of the patterns behind them.`,`Neglecting sleep and logistics in the last 24 hours.`,`Not asking questions: it signals low interest and costs you information about the team.`],
best:[`Run at least 5 full mock rounds with a friend before the real thing.`,`After each real interview, write a debrief and update your plan.`],
iq:[["lead","How do you prepare for a technical interview in one week?","Self-assess, focus on weak areas, run daily timed mock rounds out loud (coding, design, behavioral), rehearse stories, review the cheat sheet, and rest the day before."],["architect","What questions would you ask your interviewer?","How decisions and trade-offs are made, how architecture is documented and evolved, release and incident processes, performance and reliability goals, team structure, and what success looks like in the first year."]],
practice:[`Fill the self-assessment honestly today and schedule the first three study blocks in your calendar.`,`Book two mock interviews with friends or peers this week.`],
teach:`<p>"Score yourself honestly, spend time where you're weakest, practice out loud under time pressure, get feedback with a rubric, and protect your sleep and setup before the day."</p>`}
],quiz:[
{code:`const a = [1, 2, 3]; const b = a.map(async (x) => x * 2);
console.log(Array.isArray(b), b[0] instanceof Promise);
Promise.all(b).then(console.log);`,ans:`true true, then [2, 4, 6]`,why:`An async callback always returns a promise, so map produces an array of promises, not numbers. Promise.all turns it into one promise of the values.`},
{code:`console.log([..."abc"].map((c, i, arr) => arr[arr.length - 1 - i]).join(''),
  [1, [2, [3]]].flat(Infinity),
  Object.entries({ b: 1, a: 2 }).sort(([k], [l]) => k.localeCompare(l)).map(([k]) => k).join(''));`,ans:`cba [1, 2, 3] ab`,why:`The first reverses by index lookup, flat(Infinity) flattens fully, and sorting entries by key with localeCompare yields "ab". These small combinations are typical of final-round warm-ups.`}]}
]});
