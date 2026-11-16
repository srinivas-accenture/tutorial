/* Week 4: Browser internals — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js. */
JSC.registerWeek({w:4,revision:[
"<b>DOM</b> is a tree of node objects built from HTML. <code>getElementsBy*</code> and <code>children</code> are <i>live</i>; <code>querySelectorAll</code> is a static snapshot. Attributes (initial HTML) and properties (current state) differ.",
"<b>Event flow:</b> capture (top down) → target → bubble (bottom up). <code>stopPropagation</code> stops travelling; <code>stopImmediatePropagation</code> also stops other listeners on the same node; <code>preventDefault</code> cancels the default action.",
"<b>Delegation:</b> one listener on a parent + <code>event.target.closest(selector)</code>. Use <code>focusin/focusout</code> since focus/blur don't bubble.",
"<b>Rendering pipeline:</b> parse → DOM + CSSOM → style → layout → paint → composite. CSS blocks rendering; sync JS blocks parsing (use <code>defer</code>).",
"<b>Cost ladder:</b> layout (reflow) &gt; paint &gt; composite-only (<code>transform</code>, <code>opacity</code>). Avoid <b>layout thrashing</b>: batch reads before writes.",
"<b>Storage:</b> cookies (sent to server, ~4 KB), localStorage/sessionStorage (sync, strings, ~5 MiB), IndexedDB/Cache/OPFS (async, large). Never keep secrets in localStorage.",
"<b>fetch</b> rejects only on network failure; check <code>response.ok</code>. Bodies are single-use streams. <b>CORS</b> is enforced by the browser on <i>responses</i>; non-simple requests trigger an OPTIONS preflight.",
"<b>XSS defenses:</b> textContent over innerHTML, encode output, sanitize if HTML is required, strict CSP with nonces, Trusted Types, HttpOnly cookies.",
"<b>CSRF defenses:</b> SameSite cookies (Lax default), anti-CSRF tokens, Origin checks. CORS is not CSRF protection. Add <code>frame-ancestors</code> against clickjacking."
],days:[
{n:16,title:"The DOM",goal:"Understand the DOM as a live object tree and manipulate it correctly and efficiently.",topics:[
{id:"d16-dom",title:"The DOM",
eli5:`<p>Your web page is like a <b>family tree</b>. The whole page is the great-grandparent, <code>&lt;body&gt;</code> is a child, a <code>&lt;div&gt;</code> inside it is a grandchild, and so on. The <b>DOM</b> is that family tree made of real JavaScript objects, so your code can ask "who are the children of this box?" or "move this kid to another parent", and the screen changes to match.</p>`,
why:`<p>HTML is just text. To change a page after it loads, programs need a live, structured model of it. The <b>Document Object Model</b> is the browser's API for exactly that, standardized so every language and browser agrees.</p>`,
tech:`<ul class="pts"><li>The parser turns HTML into a tree of <b>nodes</b>: <code>Document</code>, <code>Element</code>, <code>Text</code>, <code>Comment</code>, <code>DocumentFragment</code>. It repairs broken HTML (a missing <code>&lt;/p&gt;</code> still produces a tree).</li><li>DOM objects are host objects with a prototype chain: <code>div → HTMLDivElement → HTMLElement → Element → Node → EventTarget → Object</code>.</li><li><b>Selecting:</b> <code>getElementById</code>, <code>querySelector(All)</code> (CSS selectors, <b>static</b> NodeList), <code>getElementsByClassName/TagName</code> and <code>element.children</code> (<b>live</b> HTMLCollection that updates as the DOM changes).</li><li><b>Nodes vs elements:</b> <code>childNodes</code> includes whitespace text nodes; <code>children</code> only elements.</li><li><b>Content:</b> <code>textContent</code> (raw text, safe, no layout), <code>innerText</code> (rendered text, triggers layout), <code>innerHTML</code> (parses HTML: powerful, risky).</li><li><b>Attributes vs properties:</b> attributes are the initial markup (<code>getAttribute</code>); properties are live state (<code>input.value</code>, <code>checked</code>). They often sync but not always.</li><li><b>Readiness:</b> <code>DOMContentLoaded</code> fires when the HTML is parsed (deferred scripts done); <code>load</code> fires after images and subresources.</li></ul>`,
diagram:{html:`<div style="font-family:ui-monospace,monospace;line-height:1.8;text-align:left;display:inline-block">document<br>└─ html<br>&nbsp;&nbsp;&nbsp;├─ head ─ title ─ "My page"<br>&nbsp;&nbsp;&nbsp;└─ body<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─ h1 ─ "Hello"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ ul ─ li, li, li</div>`,steps:["Every tag becomes an element node, every piece of text becomes a text node.","Parent/child/sibling pointers let you walk the tree: <code>parentNode</code>, <code>firstElementChild</code>, <code>nextElementSibling</code>.","Changing the tree (add, remove, move) makes the browser recompute style/layout and repaint (Day 18)."]},
ex:[{t:"Build and walk a tree (on a detached document, safe to run)",code:`const doc = document.implementation.createHTMLDocument("demo");
doc.body.innerHTML = "<ul id='list'> <li>one</li> <li class='x'>two</li> </ul>";
const ul = doc.getElementById("list");
console.log(ul.childNodes.length, ul.children.length);   // text nodes count!
console.log(ul.firstElementChild.textContent, ul.lastElementChild.className);
const li = doc.createElement("li");
li.textContent = "three";
ul.append(li);
console.log([...ul.children].map((e) => e.textContent));
console.log(ul.constructor.name, ul instanceof HTMLElement, ul instanceof Node, ul instanceof EventTarget);`},
{t:"Live vs static collections; attribute vs property",code:`const doc = document.implementation.createHTMLDocument("");
doc.body.innerHTML = "<p>a</p><p>b</p>";
const live = doc.body.getElementsByTagName("p");
const snap = doc.body.querySelectorAll("p");
doc.body.append(doc.createElement("p"));
console.log("live", live.length, "static", snap.length);
const input = doc.createElement("input");
input.setAttribute("value", "initial");
input.value = "typed";
console.log(input.getAttribute("value"), input.value);`}],
browser:`<p>The Elements panel in DevTools is a live view of the DOM (it can differ from "View source" because scripts changed it). Use <code>$0</code> in the console for the selected element. Custom elements and Shadow DOM add encapsulated sub-trees. In Node there is no DOM; use <code>jsdom</code> or <code>happy-dom</code> for tests.</p>`,
gotchas:[`<code>getElementsByClassName</code> returns a <b>live</b> collection: removing items inside a loop over it skips elements. Copy with <code>Array.from</code> first.`,`<code>childNodes</code> includes whitespace text nodes; use <code>children</code>.`,`<code>input.value</code> doesn't change the <code>value</code> attribute once the user (or script) edited the field; use <code>defaultValue</code> for the attribute.`,`<code>NodeList.forEach</code> exists, but <code>HTMLCollection</code> has no <code>forEach</code> or <code>map</code>.`,`<code>innerHTML +=</code> re-parses and destroys existing child nodes (and their listeners).`,`Scripts that run before the element is parsed see <code>null</code>; use <code>defer</code> or <code>DOMContentLoaded</code>.`],
best:[`Prefer <code>textContent</code> and <code>createElement</code>/<code>append</code> for dynamic text; reserve <code>innerHTML</code> for trusted markup.`,`Cache element lookups; select once, reuse.`,`Prefer <code>classList</code> over editing <code>className</code> strings.`],
iq:[["fresher","What is the DOM?","The browser's object representation of a page as a tree of nodes that JavaScript can read and modify."],["mid","NodeList vs HTMLCollection?","querySelectorAll returns a static NodeList (a snapshot); getElementsBy*/children return live HTMLCollections that update automatically. Only NodeList has forEach."],["mid","innerHTML vs textContent vs innerText?","innerHTML parses HTML (XSS risk), textContent is raw text of all descendants (fast, safe), innerText is rendering-aware and triggers layout."],["senior","Attribute vs property?","Attributes live in the markup and are strings; properties are the JS object's state (typed). Some reflect each other (id, href), some are decoupled after interaction (value, checked)."]],
practice:[`Write <code>$(selector, root)</code> and <code>$$(selector, root)</code> helpers returning arrays.`,`Create a function that builds a nested list from an array of objects without using innerHTML.`],
teach:`<p>"The DOM is the page as a family tree of JavaScript objects. You can walk it, add and remove branches, and the screen follows. Some lists are live (they change by themselves), others are snapshots."</p>`},

{id:"d16-dom-ops",title:"Working with the DOM efficiently",
eli5:`<p>Redecorating a room: carrying one chair at a time through the door is slow. Better to <b>pack a box with all the furniture (a fragment) and bring it in once</b>. And don't keep stepping back to check how the room looks after every single chair; do all the moving, then look once.</p>`,
why:`<p>DOM operations are cheap individually, but each change can invalidate styles and layout. Batching writes and creating nodes off-document keeps pages fast.</p>`,
tech:`<ul class="pts"><li><b>DocumentFragment:</b> a lightweight container; append children to it, then insert it once (children move out of the fragment).</li><li><b>Modern insertion:</b> <code>append, prepend, before, after, replaceWith, remove</code> (accept strings or nodes). <code>insertAdjacentHTML</code> for trusted markup. <code>cloneNode(true)</code> deep-copies; <code>&lt;template&gt;</code> holds inert markup you clone.</li><li><b>Styling:</b> toggle CSS classes instead of many inline style writes; <code>element.style</code> writes are cheap but reading computed layout is not (Day 18).</li><li><b>Large lists:</b> virtualize (render only visible rows), paginate, or use <code>content-visibility: auto</code>.</li><li><b>Frameworks</b> batch updates for you (virtual DOM diffing, signals); knowing the raw DOM explains what they optimize.</li></ul>`,
diagram:{html:flow([["create 1000 &lt;li&gt; in a fragment","no layout yet"],["append fragment once","one DOM insertion","g"],["browser: one style + layout pass","w"]])+flow([["append 1000 times into the live DOM","each may invalidate layout","r"]]),steps:["Nodes created and assembled in a fragment aren't part of the page, so nothing is rendered.","One insertion triggers a single recalculation.","Many separate insertions followed by layout reads can cause repeated reflows."]},
ex:[{t:"Fragment batching and template cloning",code:`const doc = document.implementation.createHTMLDocument("");
const ul = doc.createElement("ul");
doc.body.append(ul);
const frag = doc.createDocumentFragment();
for (let i = 1; i <= 3; i++) {
  const li = doc.createElement("li");
  li.textContent = "item " + i;
  frag.append(li);
}
console.log("fragment children:", frag.childNodes.length);
ul.append(frag);
console.log("after insert:", frag.childNodes.length, ul.children.length);
const tpl = doc.createElement("template");
tpl.innerHTML = "<li class='row'><b></b></li>";
const row = tpl.content.cloneNode(true);
row.querySelector("b").textContent = "cloned";
ul.append(row);
console.log(ul.innerHTML);`}],
gotchas:[`After appending a fragment, the fragment is empty: its children moved.`,`<code>innerHTML = ""</code> removes nodes but event listeners attached via JS to removed nodes are garbage collected only if nothing else references them.`,`<code>cloneNode</code> does not copy listeners added with <code>addEventListener</code>.`,`<code>insertAdjacentHTML</code>/<code>innerHTML</code> with user text is an XSS sink.`,`Moving a node (<code>append</code> of an existing node) removes it from the old parent.`],
best:[`Batch DOM writes; read layout values before writing; virtualize big lists.`,`Use <code>&lt;template&gt;</code> for repeated structures; use <code>replaceChildren()</code> to swap content in one operation.`],
iq:[["mid","How do you add 1000 items efficiently?","Build them in a DocumentFragment (or an HTML string via a safe template) and insert once; for very large lists use virtualization."],["senior","Why can DOM updates be slow?","Changes can invalidate style/layout; forced synchronous layout (reading geometry after writing) and repeated invalidations cause reflows and paints. Batch and separate reads from writes."]],
practice:[`Render 10,000 rows with a fragment, then with a windowed (virtual) list that renders ~30 rows.`],
teach:`<p>"Pack all the furniture into a box first, bring it in once, and look at the room after, not between each chair."</p>`}
],quiz:[
{code:`const doc = document.implementation.createHTMLDocument("");
doc.body.innerHTML = "<p>a</p><p>b</p>";
const live = doc.body.getElementsByTagName("p");
const snap = doc.body.querySelectorAll("p");
doc.body.append(doc.createElement("p"));
console.log(live.length, snap.length);`,ans:`3 2`,why:`getElementsByTagName is live, querySelectorAll is a static snapshot.`},
{code:`const doc = document.implementation.createHTMLDocument("");
const i = doc.createElement("input");
i.setAttribute("value", "a");
i.value = "b";
console.log(i.getAttribute("value"), i.value);`,ans:`a b`,why:`Setting the value property doesn't update the attribute once the dirty value flag is set; the attribute holds the initial value.`}]},

{n:17,title:"Events and observers",goal:"Master event propagation and delegation, and use observers instead of polling.",topics:[
{id:"d17-events",title:"Event flow and delegation",
eli5:`<p>Someone shouts in a classroom. First the shout <b>travels down</b> from the principal's office to the classroom to the kid (capture). The kid hears it (target). Then the sound <b>bubbles back up</b> through the classroom to the office (bubble). A teacher in the hallway can listen for shouts from <b>any kid inside</b> with one ear: that's <b>delegation</b>.</p>`,
why:`<p>Pages have thousands of elements. Handling events by propagation lets one listener manage many children, including ones added later, and lets outer components react to inner actions.</p>`,
tech:`<ul class="pts"><li><b>Three phases:</b> <b>capture</b> (window → document → … → parent), <b>target</b>, <b>bubble</b> (parent → … → window). Listeners run in the bubble phase by default; pass <code>{capture: true}</code> to run during capture.</li><li><code>event.target</code> is the element the event started on; <code>event.currentTarget</code> is the element whose listener is running. <code>event.composedPath()</code> shows the whole path (works across Shadow DOM).</li><li><code>preventDefault()</code> cancels the default action (link navigation, form submit); it doesn't stop propagation. <code>stopPropagation()</code> stops moving to other nodes; <code>stopImmediatePropagation()</code> also skips remaining listeners on the same node.</li><li><b>addEventListener options:</b> <code>once</code>, <code>passive</code> (promise not to call preventDefault, so scrolling needn't wait; default true for touch/wheel on window/document/body), <code>signal</code> (remove with AbortController).</li><li><b>Delegation:</b> one listener on a parent: <code>list.addEventListener("click", e =&gt; { const li = e.target.closest("li"); if (li &amp;&amp; list.contains(li)) ... })</code>.</li><li>Events that <b>don't bubble</b>: <code>focus</code>, <code>blur</code>, <code>mouseenter</code>, <code>mouseleave</code>, <code>load</code>, <code>scroll</code> (on elements). Use <code>focusin/focusout</code> or <code>mouseover/mouseout</code>.</li><li>Real user events are dispatched as tasks by the browser; <code>dispatchEvent</code> runs listeners <b>synchronously</b>.</li></ul>`,
diagram:{html:lanes([["1. Capture ↓",["window","document","div#parent","(listeners with capture:true)"]],["2. Target",["button#child","(listeners here, in registration order)"]],["3. Bubble ↑",["div#parent","document","window","(default listeners)"]]]),steps:["The event travels from the root down to the target, giving capture listeners a chance first.","At the target, all listeners run (capture and non-capture, in the order added).","Then the event bubbles back up, running normal listeners on each ancestor.","<code>stopPropagation</code> at any point prevents the remaining nodes from seeing it."]},
ex:[{t:"Capture, target, bubble order",code:`const doc = document.implementation.createHTMLDocument("");
const parent = doc.createElement("div"), child = doc.createElement("button");
parent.append(child); doc.body.append(parent);
parent.addEventListener("click", () => console.log("parent bubble"));
parent.addEventListener("click", () => console.log("parent capture"), true);
child.addEventListener("click", () => console.log("child"));
child.dispatchEvent(new Event("click", { bubbles: true }));`},
{t:"Delegation, stopImmediatePropagation, once",code:`const doc = document.implementation.createHTMLDocument("");
const list = doc.createElement("ul");
list.innerHTML = "<li><b>one</b></li><li>two</li>";
doc.body.append(list);
list.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (li && list.contains(li)) console.log("clicked", li.textContent, "| currentTarget:", e.currentTarget.tagName);
});
list.querySelector("b").dispatchEvent(new Event("click", { bubbles: true }));
const late = doc.createElement("li"); late.textContent = "added later";
list.append(late);
late.dispatchEvent(new Event("click", { bubbles: true }));
const el = doc.createElement("div");
el.addEventListener("x", () => console.log(1));
el.addEventListener("x", (e) => { console.log(2); e.stopImmediatePropagation(); });
el.addEventListener("x", () => console.log(3));
el.dispatchEvent(new Event("x"));
const once = doc.createElement("div");
once.addEventListener("y", () => console.log("once"), { once: true });
once.dispatchEvent(new Event("y")); once.dispatchEvent(new Event("y"));`}],
browser:`<p>Chrome DevTools: Elements → Event Listeners tab shows listeners and whether they are capture/passive. Touch and wheel listeners on the window default to <code>passive</code>, so calling <code>preventDefault()</code> inside them logs a warning. Event handlers run on the main thread: slow handlers hurt Interaction to Next Paint (INP).</p>`,
gotchas:[`<code>removeEventListener</code> needs the <b>same function reference and capture flag</b>; an inline arrow can't be removed (use <code>{signal}</code> or <code>{once}</code>).`,`<code>stopPropagation</code> in a handler can break analytics and delegated handlers elsewhere.`,`With delegation, <code>e.target</code> may be a nested child (the <code>&lt;b&gt;</code>), so use <code>closest()</code>.`,`<code>return false</code> works only for inline <code>on*</code> attributes, not <code>addEventListener</code>.`,`<code>passive: true</code> makes <code>preventDefault()</code> ignored.`,`Forgetting to remove listeners on long-lived targets (window, document) leaks memory.`],
best:[`Prefer delegation for lists and dynamic content; use <code>{ once: true }</code> and <code>{ signal }</code> for cleanup.`,`Keep handlers short; defer heavy work with <code>requestAnimationFrame</code>/<code>scheduler.yield</code>/workers.`,`Use semantic elements (button, a) so keyboard and screen-reader events work for free.`],
iq:[["fresher","What is event bubbling?","After the target handles an event, it propagates up through ancestors, triggering their listeners."],["mid","Capture vs bubble?","Capture goes from the root down to the target, bubble goes from the target back up. Listeners default to bubble; use capture: true for capture."],["mid","What is event delegation and why use it?","Attach one listener to a parent and identify the real source with event.target/closest. Saves memory and handles elements added later."],["senior","target vs currentTarget?","target is the original source of the event; currentTarget is the element the running listener is attached to."]],
practice:[`Build a todo list where one listener handles toggle and delete clicks using <code>data-action</code> attributes.`,`Add listeners with <code>{ signal }</code> and remove them all with one <code>abort()</code>.`],
teach:`<p>"Events travel down to the target, then bubble back up. A parent can catch events from all its children with one listener, which also works for children added later."</p>`},

{id:"d17-observers",title:"Observers and custom events",
eli5:`<p>Instead of asking "is the pizza here yet?" every five seconds (polling), you give the pizza shop your number and they <b>call when it arrives</b>. Observers are exactly that for the page: "tell me when this box scrolls into view", "when its size changes", "when its children change".</p>`,
why:`<p>Polling (<code>setInterval</code> + <code>getBoundingClientRect</code>) wastes CPU and forces layout. Observers let the browser notify you efficiently, in batches, at the right time.</p>`,
tech:`<ul class="pts"><li><b>IntersectionObserver:</b> reports when elements enter/leave the viewport (or a root) by a threshold. Use for lazy loading, infinite scroll, analytics impressions, animations on scroll.</li><li><b>MutationObserver:</b> reports DOM changes (children, attributes, text). Callbacks are batched as <b>microtasks</b>.</li><li><b>ResizeObserver:</b> reports element size changes (responsive components). Writing layout inside the callback can trigger the "ResizeObserver loop" notice.</li><li><b>PerformanceObserver:</b> streams performance entries (LCP, layout shifts, long tasks, INP data) without polling.</li><li><b>Custom events:</b> <code>new CustomEvent("name", {detail, bubbles})</code> with <code>dispatchEvent</code>. Any object can be an event bus by extending <code>EventTarget</code>.</li></ul>`,
diagram:{html:flow([["element scrolls into view"],["browser computes intersections","once per frame, off your hot path","w"],["your callback(entries)","isIntersecting: true","g"],["load image / fetch next page"]]),steps:["You register an element and options once.","The browser checks intersections as part of rendering, without forced layout from your code.","Your callback receives batched entries; you can <code>unobserve</code> the target when done."]},
ex:[{t:"MutationObserver and a custom EventTarget bus (runnable)",code:`const doc = document.implementation.createHTMLDocument("");
const box = doc.createElement("div"); doc.body.append(box);
const mo = new MutationObserver((records) => {
  console.log("mutation records:", records.length, records.map((r) => r.type + ":" + (r.addedNodes[0]?.nodeName || r.attributeName)));
});
mo.observe(box, { childList: true, attributes: true });
box.append(doc.createElement("span"));
box.setAttribute("data-x", "1");
console.log("sync part done (records arrive later, as a microtask)");
class Bus extends EventTarget {
  emit(type, detail){ this.dispatchEvent(new CustomEvent(type, { detail })); }
}
const bus = new Bus();
bus.addEventListener("saved", (e) => console.log("saved event", e.detail));
bus.emit("saved", { id: 7 });`},
{t:"IntersectionObserver for lazy loading (browser page)",code:`const io = new IntersectionObserver((entries, obs) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.src = e.target.dataset.src;   // load the real image
    obs.unobserve(e.target);               // stop watching
  }
}, { rootMargin: "200px" });
document.querySelectorAll("img[data-src]").forEach((img) => io.observe(img));`,run:false}],
gotchas:[`MutationObserver callbacks run as microtasks, so changes you make inside them can recurse infinitely.`,`Observers keep references to targets and callbacks; <code>disconnect()</code> when done.`,`<code>IntersectionObserver</code> reports an initial callback for each target immediately.`,`<code>ResizeObserver</code> doesn't fire for pure transform changes.`,`Custom event names are case-sensitive; <code>detail</code> is the only place for payload.`],
best:[`Use IntersectionObserver for lazy-loading and infinite scroll; native <code>loading="lazy"</code> for images/iframes when enough.`,`Disconnect observers on teardown; avoid layout reads/writes inside ResizeObserver callbacks.`],
iq:[["mid","How would you implement infinite scroll?","Observe a sentinel element at the end of the list with IntersectionObserver; when it intersects, fetch the next page, append, and keep observing (unobserve while loading)."],["senior","Why is MutationObserver better than DOM mutation events?","Mutation events were synchronous and slow; MutationObserver batches records and delivers them as a microtask."]],
practice:[`Lazy-load images with IntersectionObserver and a placeholder.`,`Build a tiny pub/sub using <code>EventTarget</code>.`],
teach:`<p>"Observers are 'call me when it changes' services: scrolled into view, resized, children changed. They're much cheaper than checking over and over."</p>`}
],quiz:[
{code:`const doc = document.implementation.createHTMLDocument("");
const p = doc.createElement("div"), c = doc.createElement("button");
p.append(c); doc.body.append(p);
p.addEventListener("click", () => console.log("parent bubble"));
p.addEventListener("click", () => console.log("parent capture"), true);
c.addEventListener("click", () => console.log("child"));
c.dispatchEvent(new Event("click", { bubbles: true }));`,ans:`parent capture, child, parent bubble`,why:`Capture listeners run on the way down, then the target, then bubble listeners on the way up.`},
{code:`const doc = document.implementation.createHTMLDocument("");
const el = doc.createElement("div");
el.addEventListener("x", () => console.log(1));
el.addEventListener("x", (e) => { console.log(2); e.stopImmediatePropagation(); });
el.addEventListener("x", () => console.log(3));
el.dispatchEvent(new Event("x"));`,ans:`1 2 (3 is skipped)`,why:`stopImmediatePropagation prevents the remaining listeners on the same node from running.`}]},

{n:18,title:"Rendering",goal:"Know exactly how a page goes from bytes to pixels, and what makes it slow.",topics:[
{id:"d18-pipeline",title:"The browser rendering pipeline",
eli5:`<p>Building a house from plans: first you read the <b>blueprint</b> (HTML → DOM), then the <b>paint and style guide</b> (CSS → CSSOM). You combine them to work out what every room looks like (style), measure each room (layout), paint the walls (paint), and finally stack the transparent layers on top of each other on the screen (composite).</p>`,
why:`<p>Every performance problem, "why is my page white for 3 seconds?" or "why does scrolling janks?", maps to a step in this pipeline. Knowing it tells you what to fix.</p>`,
tech:`<ol><li><b>Parse HTML</b> → DOM. A <b>preload scanner</b> looks ahead for scripts, styles and images to start downloads early.</li><li><b>Parse CSS</b> → CSSOM. CSS is <b>render-blocking</b>: the browser won't paint until it has the CSS for what it would show.</li><li><b>JavaScript:</b> classic <code>&lt;script&gt;</code> is <b>parser-blocking</b> (and waits for pending CSS). <code>defer</code> runs after parsing in order; <code>async</code> runs as soon as downloaded, unordered; <code>type="module"</code> is deferred by default.</li><li><b>Style:</b> match selectors, compute final values for each element.</li><li><b>Layout (reflow):</b> compute geometry (size and position) of every box.</li><li><b>Paint:</b> record drawing instructions per layer. <b>Raster</b> turns them into pixels (often on the GPU).</li><li><b>Composite:</b> the compositor thread combines layers (applying transforms, opacity, scrolling) without involving the main thread.</li></ol>
<ul class="pts"><li>The <b>main thread</b> does parsing, JS, style, layout and paint; the <b>compositor</b> thread and GPU handle scrolling and transform/opacity animations, which is why they stay smooth even while JS is busy.</li><li>Metrics: First Contentful Paint (FCP), Largest Contentful Paint (LCP), Interaction to Next Paint (INP), Cumulative Layout Shift (CLS).</li></ul>`,
diagram:{html:flow([["HTML","→ DOM"],["CSS","→ CSSOM","w"],["Style","computed styles"],["Layout","geometry"],["Paint","draw lists","g"],["Composite","layers → screen","g"]]),steps:["HTML and CSS are parsed into two trees that are combined during style calculation.","Layout figures out where everything goes; it is the most expensive step for big pages.","Paint records what to draw; compositing assembles layers on the GPU thread.","JavaScript can invalidate any stage: changing the DOM invalidates style/layout; changing a color only repaints; changing <code>transform</code> only recomposites."]},
ex:[{t:"Script loading modes (HTML)",code:`<!-- blocks HTML parsing while it downloads and runs -->
<script src="a.js"><\/script>
<!-- downloads in parallel, runs after parsing, keeps order -->
<script src="b.js" defer><\/script>
<!-- downloads in parallel, runs as soon as ready, any order -->
<script src="c.js" async><\/script>
<!-- ES module: deferred by default, strict mode, own scope -->
<script type="module" src="d.js"><\/script>`,run:false},
{t:"Ask the browser what it measured (runs on this page)",code:`console.log(performance.getEntriesByType("paint").map((e) => e.name));
const nav = performance.getEntriesByType("navigation")[0];
console.log(nav ? ["domInteractive", "domContentLoadedEventEnd", "loadEventEnd"].map((k) => k + ": " + Math.round(nav[k]) + "ms") : "no navigation entry");
new PerformanceObserver((list) => console.log("observed:", list.getEntries().map((e) => e.entryType))).observe({ type: "paint", buffered: true });`}],
browser:`<p>Chrome DevTools: Performance panel shows Parse HTML, Recalculate Style, Layout, Paint, Composite Layers; Lighthouse reports blocking resources; the Rendering panel's "Paint flashing" and "Layout shift regions" visualize repaints and shifts. Put critical CSS inline or early, defer non-critical JS, and preload the LCP image.</p>`,
gotchas:[`Putting a blocking <code>&lt;script&gt;</code> in the <code>&lt;head&gt;</code> without defer delays all rendering.`,`<code>async</code> scripts that depend on each other break because order is not guaranteed.`,`CSS imported with <code>@import</code> is discovered late; prefer <code>&lt;link&gt;</code>.`,`Web fonts can block text (FOIT) or swap and shift layout; use <code>font-display</code>.`,`Images without width/height cause layout shifts (CLS).`],
best:[`Defer scripts, inline critical CSS, preload the LCP resource, set image dimensions, and keep the main thread free.`,`Animate <code>transform</code> and <code>opacity</code> rather than layout properties.`],
iq:[["fresher","What happens when you type a URL?","DNS, TCP/TLS, HTTP request, response, then the browser parses HTML, builds DOM/CSSOM, runs scripts, lays out and paints."],["mid","What is the critical rendering path?","The sequence of steps from receiving HTML/CSS/JS to first pixels: DOM + CSSOM → render tree/style → layout → paint → composite. Optimize by reducing blocking resources."],["mid","defer vs async?","Both download in parallel. defer runs after the document is parsed, in order; async runs as soon as downloaded, in any order, possibly blocking parsing at that moment."],["senior","Why are transform animations smooth even when JS is busy?","They are handled by the compositor thread on the GPU; no layout or paint is needed once the layer exists."]],
practice:[`Record a Performance profile of a page and label each phase in the flame chart.`,`Convert a slow page to use defer and preload; compare LCP.`],
teach:`<p>"HTML and CSS become two trees; the browser combines them, measures every box, paints, then stacks layers. CSS blocks painting, plain scripts block parsing, defer fixes the second one."</p>`},

{id:"d18-layout",title:"Reflow, repaint and layout thrashing",
eli5:`<p>Moving a wall (reflow) means re-measuring the whole house. Repainting a wall (repaint) just needs paint. Sliding a transparent sticker over the picture (composite) needs neither. <b>Layout thrashing</b> is moving a wall, running to measure the room, moving another wall, measuring again... instead of moving all the walls first and measuring once.</p>`,
why:`<p>The browser delays layout until needed. But if you <b>read</b> a layout value (like <code>offsetHeight</code>) right after <b>writing</b> a style, it must compute layout immediately (forced synchronous layout). Doing that in a loop turns a fast page into a slow one.</p>`,
tech:`<table><tr><th>Cost</th><th>Triggered by</th></tr><tr><td>Layout (reflow) + paint + composite</td><td>width, height, margin, padding, top/left, font-size, display, adding/removing nodes, text changes</td></tr><tr><td>Paint + composite</td><td>color, background, box-shadow, border-radius, visibility</td></tr><tr><td>Composite only</td><td>transform, opacity (and some filters) on their own layer</td></tr></table>
<ul class="pts"><li><b>Forced layout triggers</b> (reads): <code>offsetWidth/Height/Top/Left</code>, <code>clientWidth/Height</code>, <code>scrollTop/Height</code>, <code>getBoundingClientRect()</code>, <code>getComputedStyle()</code> for layout-dependent values, <code>innerText</code>, <code>focus()</code>.</li><li><b>Fix:</b> batch all reads first, then all writes; or schedule writes in <code>requestAnimationFrame</code>.</li><li><code>will-change: transform</code> promotes an element to its own layer (use sparingly; layers cost memory). <code>contain</code> and <code>content-visibility</code> limit how far a change propagates.</li><li>Prefer CSS animations/transitions and the Web Animations API for compositor-driven motion.</li></ul>`,
diagram:{html:flow([["write: el.style.width"],["read: el.offsetWidth","forces layout NOW","r"],["write: next el…"],["read again","forces layout AGAIN","r"]])+flow([["read all widths first"],["write all new widths","one layout later","g"]]),steps:["Writes only mark layout as dirty; the browser would normally compute it once before the next frame.","A read in between forces the browser to recompute layout immediately to give you an up-to-date answer.","Interleaving reads and writes in a loop causes one layout per iteration (thrashing).","Reading everything first and writing afterwards needs only one."]},
ex:[{t:"Simulating thrashing (counts forced layouts, runnable)",code:`let layouts = 0, dirty = false;
const el = {
  set width(v){ dirty = true; },
  get height(){ if (dirty) { layouts++; dirty = false; } return 100; }
};
for (let i = 0; i < 5; i++) { el.width = i; el.height; }      // write, read, write, read ...
console.log("interleaved read/write layouts:", layouts);
layouts = 0; dirty = false;
const heights = [];
for (let i = 0; i < 5; i++) heights.push(el.height);          // all reads first
for (let i = 0; i < 5; i++) el.width = i;                     // then all writes
el.height;                                                    // one final read
console.log("batched layouts:", layouts);`},
{t:"The real-DOM version (browser)",code:`// BAD: forced layout on every iteration
for (const el of items) {
  el.style.width = el.parentNode.offsetWidth / 2 + "px";
}
// GOOD: read first, write after
const widths = items.map((el) => el.parentNode.offsetWidth);
requestAnimationFrame(() => {
  items.forEach((el, i) => { el.style.width = widths[i] / 2 + "px"; });
});`,run:false}],
gotchas:[`Many properties force layout; the canonical list is in Paul Irish's "What forces layout/reflow" gist.`,`Animating <code>top</code>/<code>left</code>/<code>width</code> triggers layout every frame; animate <code>transform</code> instead.`,`<code>will-change</code> on too many elements wastes GPU memory and can make things slower.`,`<code>display: none</code> removes the element from layout; <code>visibility: hidden</code> keeps its space.`,`Layout shifts (CLS) come from late-loaded images, fonts and injected content above existing content.`],
best:[`Separate reads from writes; use rAF for writes tied to visuals; reserve space for images and ads; animate with transform/opacity.`,`Measure with the Performance panel; look for purple "Layout" blocks with a red "forced reflow" warning.`],
iq:[["mid","Reflow vs repaint?","Reflow recomputes geometry; repaint redraws pixels. Reflow always leads to repaint; repaint doesn't require reflow."],["mid","What is layout thrashing and how do you avoid it?","Interleaving DOM writes and layout reads so the browser re-lays-out repeatedly. Batch reads before writes or use requestAnimationFrame."],["senior","Which CSS properties are cheapest to animate and why?","transform and opacity: they can be handled by the compositor without layout or paint, once promoted to a layer."]],
practice:[`Profile a loop that reads and writes layout values and fix it.`,`Replace a left/top animation with a transform-based one and compare frame times.`],
teach:`<p>"Moving walls forces re-measuring the house, so do all the moving first and measure once. Sticker-sliding (transform, opacity) is cheapest."</p>`}
],quiz:[
{code:`const order = [];
requestAnimationFrame(() => order.push("raf"));
setTimeout(() => order.push("timeout"), 0);
Promise.resolve().then(() => order.push("microtask"));
setTimeout(() => console.log("first:", order[0], "| microtask before the others:", order.indexOf("microtask") < order.indexOf("timeout") && order.indexOf("microtask") < order.indexOf("raf")), 100);`,ans:`first: microtask | microtask before the others: true`,why:`Microtasks run right after the current script, before any timer task or rendering step. The relative order of the timeout and rAF depends on when the next frame is due, which is why it isn't printed.`},
{code:`let layouts = 0, dirty = false;
const el = { set w(v){ dirty = true; }, get h(){ if (dirty) { layouts++; dirty = false; } return 1; } };
for (let i = 0; i < 4; i++) { el.w = i; el.h; }
console.log(layouts);`,ans:`4`,why:`Each read after a write forces a fresh layout: this is layout thrashing.`}]},

{n:19,title:"Storage and the network",goal:"Choose the right place to keep data and make network requests correctly, including CORS.",topics:[
{id:"d19-storage",title:"Browser storage",
eli5:`<p>The browser gives you different kinds of storage, like places in a house. <b>Cookies</b> are a note taped to the door that gets handed to the server on every visit. <b>localStorage</b> is a small drawer that stays forever. <b>sessionStorage</b> is a drawer that empties when you close the tab. <b>IndexedDB</b> is a big warehouse with shelves and a catalog.</p>`,
why:`<p>Apps need to remember things: preferences, drafts, offline data. Each storage API has different size, lifetime, security and performance characteristics.</p>`,
tech:`<table><tr><th>Storage</th><th>Size (approx.)</th><th>API</th><th>Sent to server?</th><th>Notes</th></tr><tr><td>Cookies</td><td>~4 KB each</td><td>sync string</td><td>yes, every request</td><td>HttpOnly, Secure, SameSite flags; best for sessions</td></tr><tr><td>localStorage</td><td>~5 MiB / origin</td><td>sync, strings</td><td>no</td><td>persists; blocks main thread; shared by tabs; <code>storage</code> event</td></tr><tr><td>sessionStorage</td><td>~5 MiB / origin</td><td>sync, strings</td><td>no</td><td>per tab, cleared on close</td></tr><tr><td>IndexedDB</td><td>large (quota)</td><td>async, structured data</td><td>no</td><td>transactions, indexes, blobs; works in workers</td></tr><tr><td>Cache API</td><td>large (quota)</td><td>async</td><td>no</td><td>Request/Response pairs; service workers</td></tr><tr><td>OPFS</td><td>large (quota)</td><td>async (sync in workers)</td><td>no</td><td>private file system for the origin</td></tr></table>
<ul class="pts"><li>Quotas are per origin and vary by browser and free disk: Chromium allows up to about 60% of disk per origin for IndexedDB/Cache/OPFS; Firefox about 10% of disk (capped at 10 GiB per group); Safari 17+ allows up to about 60% per origin. Treat numbers as approximate and check MDN.</li><li>Exceeding quota throws <code>QuotaExceededError</code>. <code>navigator.storage.estimate()</code> reports usage and quota; <code>navigator.storage.persist()</code> asks the browser not to evict your data.</li><li>Safari's tracking prevention can delete a site's script-writable storage after 7 days of Safari use without interaction (home-screen web apps are exempt).</li><li><b>Security:</b> any script on the page (including XSS or a compromised npm package) can read localStorage; don't store session tokens or secrets there.</li></ul>`,
diagram:{html:lanes([["Small, sync, simple",["cookies (sent to server)","localStorage (persistent)","sessionStorage (per tab)"]],["Large, async, structured",["IndexedDB (database)","Cache API (responses)","OPFS (files)"]]]),steps:["Use cookies for server-side sessions (HttpOnly), not for bulk data.","Use Web Storage for tiny preferences only; it's synchronous and blocks.","Use IndexedDB/OPFS for offline data, large blobs and anything queried."]},
ex:[{t:"A safe localStorage wrapper (runs here, cleans up after itself)",code:`const store = {
  get(key, fallback = null){ try { const v = localStorage.getItem("demo:" + key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value){ try { localStorage.setItem("demo:" + key, JSON.stringify(value)); return true; } catch (e) { console.log("failed:", e.name); return false; } },
  remove(key){ try { localStorage.removeItem("demo:" + key); } catch {} }
};
store.set("prefs", { theme: "dark", n: 2 });
console.log(store.get("prefs"), store.get("missing", "default"));
localStorage.setItem("demo:n", 1);
console.log(typeof localStorage.getItem("demo:n"));
localStorage.setItem("demo:o", { a: 1 });
console.log(localStorage.getItem("demo:o"));
["prefs", "n", "o"].forEach((k) => store.remove(k));
if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then((e) => console.log("quota is a number:", typeof e.quota === "number"));`}],
browser:`<p>DevTools → Application panel lists every storage type, lets you edit values and simulate quota/clearing. <code>localStorage</code> is shared between tabs of the same origin; listen for the <code>storage</code> event to sync tabs. Private/incognito modes can have smaller quotas or throw on write. Node has no web storage (use files or a database).</p>`,
gotchas:[`<code>localStorage</code> stores only <b>strings</b>: objects become <code>"[object Object]"</code> without <code>JSON.stringify</code>; numbers come back as strings.`,`It is synchronous: large reads/writes block the main thread.`,`<code>localStorage</code> access can throw (private mode, disabled cookies, quota); wrap in try/catch.`,`The <code>storage</code> event fires in <i>other</i> tabs, not the one that made the change.`,`Cookies are sent with every request to the domain, increasing request size.`,`Data can be evicted under storage pressure unless persisted.`],
best:[`Never store auth tokens or personal data in localStorage; use HttpOnly Secure SameSite cookies for sessions.`,`Wrap storage in a helper with try/catch, JSON, versioning and namespacing; use IndexedDB (via a small library) for big or structured data.`],
iq:[["fresher","localStorage vs sessionStorage?","localStorage persists across sessions and tabs of an origin; sessionStorage is per tab and cleared when the tab closes. Both are sync and store strings."],["mid","Why is localStorage a poor place for tokens?","Any JavaScript on the page can read it, so XSS or a malicious dependency steals the token. HttpOnly cookies are not readable by scripts."],["senior","When do you choose IndexedDB?","For large or structured data, offline-first apps, blobs, indexed queries, and when you must avoid blocking the main thread (it is async and works in workers)."]],
practice:[`Sync a theme preference across tabs using the <code>storage</code> event.`,`Store 1 MB of JSON in IndexedDB and read it back by key.`],
teach:`<p>"Cookies ride along to the server. localStorage is a small permanent drawer, sessionStorage a per-tab drawer, IndexedDB a big warehouse. Don't keep secrets where scripts can read them."</p>`},

{id:"d19-fetch",title:"fetch, HTTP and CORS",
eli5:`<p><code>fetch</code> is sending a letter and getting a letter back. Browsers have a strict rule: a web page from <b>site A</b> can't read letters from <b>site B</b> unless site B writes "site A is allowed to read this" on the envelope. That rule is <b>CORS</b>. For risky letters, the browser first sends a polite <b>"may I?"</b> note (a preflight) and waits for the answer.</p>`,
why:`<p>The <b>same-origin policy</b> stops a malicious page from reading your bank's data using your logged-in session. <b>CORS</b> is the controlled way for a server to relax that for specific origins.</p>`,
tech:`<ul class="pts"><li><code>fetch(url, {method, headers, body, signal, credentials, mode, cache})</code> returns a promise of a <code>Response</code>. It <b>rejects only on network failure</b> (or abort/CORS block); a 404 or 500 still resolves. Always check <code>response.ok</code>.</li><li>The body is a <b>one-shot stream</b>: <code>json()</code>, <code>text()</code>, <code>blob()</code>, <code>arrayBuffer()</code> can be read once (clone with <code>response.clone()</code>).</li><li>An <b>origin</b> = scheme + host + port. Different origin → cross-origin.</li><li><b>CORS:</b> the browser adds an <code>Origin</code> header; the server answers with <code>Access-Control-Allow-Origin</code> (an origin or <code>*</code>). Without it, the browser hides the response from your JS (the server still received and processed the request).</li><li><b>Simple requests</b> (GET/HEAD/POST with safelisted headers and content types <code>text/plain</code>, <code>application/x-www-form-urlencoded</code>, <code>multipart/form-data</code>) go straight through. Others (JSON content type, custom headers, PUT/DELETE) trigger an <b>OPTIONS preflight</b>; the server must reply with <code>Access-Control-Allow-Methods/Headers</code> (and optionally <code>Access-Control-Max-Age</code> to cache it).</li><li><b>Credentials</b> (cookies): <code>credentials: "include"</code> requires an explicit origin (not <code>*</code>) and <code>Access-Control-Allow-Credentials: true</code>. Add <code>Vary: Origin</code> when the allowed origin varies.</li><li><code>mode: "no-cors"</code> gives an opaque response you can't read; it is not a fix.</li></ul>`,
diagram:{html:flow([["fetch POST JSON to api.other.com"],["Browser: OPTIONS preflight","Origin, Access-Control-Request-Method/Headers","w"],["Server: 204 + Allow-Origin/Methods/Headers","g"],["Browser: real POST"],["Server: response + Allow-Origin","g"],["JS can read response"]]),steps:["The page asks to send a non-simple request cross-origin.","The browser first sends an OPTIONS preflight asking whether the server allows it.","If the headers permit it, the browser sends the actual request; the response also needs Allow-Origin.","If any CORS header is missing or mismatched, the browser blocks JS from reading the result (you'll see a console error)."]},
ex:[{t:"Request, Response, ok vs rejection, one-shot body (offline, runnable)",code:`(async () => {
  const res = new Response(JSON.stringify({ a: 1 }), { status: 404, headers: { "content-type": "application/json" } });
  console.log("ok:", res.ok, "status:", res.status);          // 404 is NOT a rejection
  const copy = res.clone();
  console.log(await res.json());
  try { await res.json(); } catch (e) { console.log("second read:", e.name); }
  console.log(await copy.text());
  const url = new URL("https://api.example.com/search?q=js&page=2#top");
  console.log(url.origin, url.pathname, url.searchParams.get("q"), Object.fromEntries(url.searchParams));
  const h = new Headers({ "Content-Type": "application/json" });
  console.log(h.get("content-type"), h.has("Authorization"));
  const req = new Request("https://api.example.com/items", { method: "POST", body: JSON.stringify({ n: 1 }), headers: h });
  console.log(req.method, req.url, await req.json());
})();`},
{t:"A robust fetch helper (browser)",code:`async function getJson(url, { signal, timeoutMs = 8000 } = {}) {
  const sig = AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)].filter(Boolean));
  const res = await fetch(url, { signal: sig, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
  return res.json();
}`,run:false}],
browser:`<p>DevTools → Network shows the preflight (OPTIONS) and the real request separately; the Console shows the exact CORS reason. CORS is enforced by browsers only: <code>curl</code>, servers and Node ignore it. The fix is always server-side (send the right headers) or a same-origin proxy, never in client code.</p>`,
gotchas:[`<code>fetch</code> does not reject on HTTP 4xx/5xx; check <code>res.ok</code>.`,`Reading <code>res.json()</code> twice throws "body stream already read".`,`<code>Access-Control-Allow-Origin: *</code> can't be combined with credentials.`,`CORS doesn't protect the server: the request is still sent and handled; it only hides the response from the page (and it's not CSRF protection).`,`Setting <code>Content-Type: application/json</code> turns a simple POST into a preflighted one.`,`Wrong or missing <code>Vary: Origin</code> causes caches to serve a response with the wrong CORS headers.`,`Redirects and cookies interplay with <code>credentials</code> and <code>SameSite</code>; test cross-site flows.`],
best:[`Wrap fetch in a helper that checks <code>ok</code>, parses errors, supports timeout/abort and retries idempotent calls.`,`Allow explicit origins on the server, keep the allowlist tight, and cache preflights with <code>Max-Age</code>.`],
iq:[["fresher","Does fetch reject on a 404?","No. It resolves with ok=false and status 404; it only rejects for network failure, CORS blocks or aborts."],["mid","What is CORS and why does it exist?","A browser mechanism that relaxes the same-origin policy: servers declare which origins may read their responses, protecting users' authenticated data from other sites."],["mid","When does a preflight happen?","For non-simple cross-origin requests: methods other than GET/HEAD/POST, non-safelisted headers, or content types like application/json."],["senior","Is CORS a security feature for servers?","No: it protects users' browsers. Servers must still authenticate/authorize every request; CORS also isn't CSRF protection."]],
practice:[`Write <code>fetchJson</code> with timeout, abort and error body parsing.`,`Reproduce a CORS error with two local servers, then fix it with the right headers.`],
teach:`<p>"fetch only fails if the network fails; a 404 is still an answer, so check ok. CORS is the browser asking the other site 'is this page allowed to read your answer?', with a 'may I?' note first for risky requests."</p>`}
],quiz:[
{code:`localStorage.setItem("q:n", 1);
localStorage.setItem("q:o", { a: 1 });
console.log(typeof localStorage.getItem("q:n"), localStorage.getItem("q:o"));
localStorage.removeItem("q:n"); localStorage.removeItem("q:o");`,ans:`string [object Object]`,why:`Web Storage converts everything to strings. Always JSON.stringify/parse.`},
{code:`(async () => {
  const r = new Response('{"a":1}');
  console.log(r.ok, r.status, await r.json());
  try { await r.json(); } catch (e) { console.log(e.name); }
})();`,ans:`true 200 { a: 1 }, then TypeError`,why:`A response body can only be consumed once; clone the response if you need to read it twice.`}]},

{n:20,title:"Security",goal:"Recognize and prevent the most common web vulnerabilities from the JavaScript side.",topics:[
{id:"d20-xss",title:"XSS, CSP and Trusted Types",
eli5:`<p>XSS is a stranger <b>slipping a sneaky note into your homework</b> that the teacher then reads out loud and obeys. If your page takes text from someone else and treats it as instructions (HTML or JavaScript), their note runs with <b>your page's powers</b>: reading your logged-in data, acting as you.</p>`,
why:`<p>XSS is consistently among the most common web vulnerabilities. Injected script can steal tokens, change what users see, and perform actions as them, because it runs in your origin.</p>`,
tech:`<ul class="pts"><li><b>Types:</b> <b>stored</b> (saved in the database and served to others), <b>reflected</b> (echoed from the URL/request), <b>DOM-based</b> (client JS writes untrusted data into a dangerous sink).</li><li><b>Dangerous sinks:</b> <code>innerHTML</code>, <code>outerHTML</code>, <code>insertAdjacentHTML</code>, <code>document.write</code>, <code>eval</code>, <code>new Function</code>, <code>setTimeout("string")</code>, <code>srcdoc</code>, <code>location = "javascript:..."</code>, event-handler attributes, and framework escape hatches (<code>dangerouslySetInnerHTML</code>, <code>v-html</code>).</li><li><b>Prevention, in order:</b> (1) use safe APIs: <code>textContent</code>, <code>setAttribute</code> for safe attributes, frameworks' default escaping; (2) <b>context-aware output encoding</b> on the server; (3) if you must render HTML, <b>sanitize</b> with a well-maintained library (DOMPurify) or the browser's Sanitizer API where supported, never regex; (4) validate input (defense in depth, not a substitute for encoding).</li><li><b>Content Security Policy (CSP):</b> an HTTP header telling the browser which scripts may run. A strong policy uses <b>nonces or hashes</b> with <code>'strict-dynamic'</code>, forbids <code>'unsafe-inline'</code> and <code>'unsafe-eval'</code>, and sets <code>object-src 'none'</code>, <code>base-uri 'none'</code>. Start with <code>Content-Security-Policy-Report-Only</code>.</li><li><b>Trusted Types</b> (Baseline across browsers since early 2026): with <code>require-trusted-types-for 'script'</code>, assigning a plain string to a dangerous sink throws unless it comes from a policy you defined (e.g. a sanitizer). It turns DOM XSS into a type error you find in testing.</li><li>Also: <b>HttpOnly cookies</b> keep session cookies away from script; keep dependencies updated (supply-chain).</li></ul>`,
diagram:{html:flow([["attacker input: &lt;img src=x onerror=steal()&gt;"],["app puts it into innerHTML","unsafe sink","r"],["browser parses it as HTML","script runs in YOUR origin","r"],["steals data / acts as user","r"]])+flow([["same input"],["app uses textContent","safe sink","g"],["shown as plain text","g"]]),steps:["Untrusted data reaches an HTML/JS-interpreting sink.","The browser can't tell attacker markup from your markup, so it runs it with your origin's privileges.","Safe sinks treat the data as text only, so it can never become markup or code.","CSP and Trusted Types are extra layers that limit damage if a sink slips through."]},
ex:[{t:"Escaping vs textContent vs innerHTML (runs safely on a detached document)",code:`const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const evil = "<img src=x onerror=alert(1)>";
console.log(escapeHTML(evil));
const doc = document.implementation.createHTMLDocument("");
const safe = doc.createElement("div"); safe.textContent = evil;
const unsafe = doc.createElement("div"); unsafe.innerHTML = evil;
console.log(safe.innerHTML);
console.log(unsafe.innerHTML, "| created elements:", unsafe.children.length, "| onerror attr kept:", unsafe.firstChild.hasAttribute("onerror"));`},
{t:"CSP header and Trusted Types policy (reference)",code:`// HTTP response header (nonce must be random per response)
Content-Security-Policy:
  default-src 'self';
  script-src 'nonce-R4nd0m' 'strict-dynamic';
  object-src 'none'; base-uri 'none'; frame-ancestors 'self';
  require-trusted-types-for 'script';

// JS: the only way to produce HTML for sinks
const policy = trustedTypes.createPolicy("app", { createHTML: (s) => DOMPurify.sanitize(s) });
element.innerHTML = policy.createHTML(userHtml);`,run:false}],
gotchas:[`<code>innerHTML</code> with an <code>&lt;img onerror&gt;</code> runs script even though <code>&lt;script&gt;</code> tags inserted via innerHTML don't execute.`,`URLs are sinks too: <code>href="javascript:..."</code> from user data; validate protocols (https/http/mailto only).`,`Encoding must match the context (HTML text, attribute, JS string, URL, CSS) – one escape function isn't enough everywhere.`,`Sanitizing then modifying the HTML (mutation XSS) can reintroduce vulnerabilities.`,`CSP with <code>'unsafe-inline'</code> or wildcard sources gives little protection.`,`Third-party scripts run with full power; use Subresource Integrity (<code>integrity</code>) and review what you load.`],
best:[`Treat all data as untrusted until encoded for its output context; prefer <code>textContent</code> and framework defaults.`,`Deploy a strict nonce-based CSP in report-only mode first, then enforce; add Trusted Types.`,`Set session cookies HttpOnly + Secure + SameSite; keep dependencies updated and audited.`],
iq:[["fresher","What is XSS?","Cross-site scripting: attacker-controlled data gets executed as script in a victim's page, in your site's origin."],["mid","How do you prevent XSS in the browser?","Use textContent/safe APIs, escape for the output context, sanitize unavoidable HTML with DOMPurify, avoid eval/innerHTML with untrusted data, and add CSP and Trusted Types."],["senior","How does a nonce-based CSP work?","The server generates a random nonce per response, puts it in the CSP header and on trusted script tags; the browser runs only scripts with the matching nonce, blocking injected inline scripts. strict-dynamic lets trusted scripts load others."],["architect","How would you roll out CSP on a large legacy site?","Inventory scripts, add report-only CSP with a reporting endpoint, remove inline handlers/eval, introduce nonces via server templates, iterate on violation reports, then enforce, and add Trusted Types for DOM sinks."]],
practice:[`Find the XSS in a small page that renders <code>location.hash</code> via innerHTML and fix it three ways.`,`Write a strict CSP for a simple SPA and test it in report-only mode.`],
teach:`<p>"XSS is a stranger's note getting treated as instructions. Show user text with textContent, never innerHTML. CSP says which scripts are allowed to run, and Trusted Types make unsafe assignments an error."</p>`},

{id:"d20-csrf",title:"CSRF, cookies and auth storage",
eli5:`<p>Imagine you're logged into your bank, and the bank's door recognizes you by a wristband (cookie). A trick website says "click here for a free puppy", and the click secretly makes <b>your browser</b> send "transfer money" to the bank, and your wristband goes along automatically. That's <b>CSRF</b>. The fix: the bank also asks for a secret handshake only the real site knows, and tells browsers not to attach the wristband for strangers (SameSite).</p>`,
why:`<p>Browsers attach cookies automatically to requests to the cookie's domain, even if the request was triggered from another site. Attackers exploit that to perform actions as the logged-in user.</p>`,
tech:`<ul class="pts"><li><b>CSRF:</b> a malicious site causes the victim's browser to send an authenticated state-changing request (form POST, image GET).</li><li><b>Defenses:</b> <b>SameSite cookies</b> (<code>Lax</code> is the default in modern browsers: not sent on cross-site subrequests/POSTs; <code>Strict</code> never cross-site; <code>None; Secure</code> always); <b>anti-CSRF tokens</b> (synchronizer token or double-submit); verify <code>Origin</code>/<code>Referer</code>; require custom headers (JSON API with non-simple headers triggers a preflight); never change state on GET.</li><li><b>Cookie flags:</b> <code>HttpOnly</code> (not readable by JS), <code>Secure</code> (HTTPS only), <code>SameSite</code>, <code>Path</code>, <code>Domain</code>, <code>Max-Age</code>; <code>__Host-</code> prefix enforces Secure, Path=/ and no Domain.</li><li><b>Where to keep auth:</b> HttpOnly Secure SameSite cookie (safe from XSS theft, needs CSRF defense) vs token in JS-readable storage (immune to CSRF, but any XSS steals it). Many apps use short-lived access tokens in memory plus an HttpOnly refresh cookie.</li><li>CORS is <b>not</b> CSRF protection: simple requests are still sent. <b>Clickjacking:</b> use <code>frame-ancestors</code> in CSP (or <code>X-Frame-Options</code>). Also use HTTPS everywhere with HSTS, and Subresource Integrity for CDN scripts.</li></ul>`,
diagram:{html:flow([["You are logged in to bank.com","cookie stored"],["You visit evil.com","w"],["evil.com page auto-submits POST to bank.com/transfer","r"],["Browser attaches bank.com cookie","unless SameSite blocks it","r"],["bank.com processes it","unless a CSRF token is required","r"]]),steps:["Cookies are attached automatically based on the request's destination, not on who initiated it.","SameSite=Lax withholds the cookie from cross-site POSTs and subrequests, breaking the classic attack.","A secret per-session token in the request body/header can't be known by the attacker's page, so forged requests lack it."]},
ex:[{t:"Double-submit token and cookie parsing (runnable)",code:`const makeToken = () => crypto.randomUUID();
const verify = (cookieToken, headerToken) =>
  typeof cookieToken === "string" && cookieToken.length > 0 && cookieToken === headerToken;
const t = makeToken();
console.log("token looks random:", /^[0-9a-f-]{36}$/.test(t));
console.log("matching:", verify(t, t), "| forged:", verify(t, "guess"), "| missing:", verify(t, undefined));
function parseSetCookie(header){
  const [pair, ...attrs] = header.split(";").map((s) => s.trim());
  const [name, value] = pair.split("=");
  const flags = Object.fromEntries(attrs.map((a) => { const [k, v = true] = a.split("="); return [k.toLowerCase(), v]; }));
  return { name, value, ...flags };
}
console.log(parseSetCookie("__Host-sid=abc123; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600"));`}],
gotchas:[`Real <code>Set-Cookie</code> parsing is more complex (quoted values, dates); use a library on the server.`,`<code>SameSite=Lax</code> still sends cookies on top-level GET navigations: never mutate state on GET.`,`Subdomains (<code>evil.example.com</code>) are same-site for SameSite purposes; cookie scoping and <code>__Host-</code> matter.`,`Embedded/cross-site flows (payments, SSO, iframes) need <code>SameSite=None; Secure</code> and extra care.`,`Storing JWTs in localStorage trades CSRF risk for XSS token-theft risk; there is no free lunch.`,`CORS configuration with <code>Allow-Origin: *</code> is irrelevant to CSRF; credentialed requests need explicit origins.`],
best:[`Use HttpOnly + Secure + SameSite=Lax cookies (with <code>__Host-</code> prefix) for sessions plus CSRF tokens for state-changing requests.`,`Make state changes POST/PUT/DELETE only; verify Origin; keep CSP frame-ancestors; rotate/shorten tokens.`],
iq:[["mid","What is CSRF and how do you prevent it?","Forging authenticated requests via the victim's browser. Prevent with SameSite cookies, anti-CSRF tokens, Origin/Referer checks, and no state change on GET."],["mid","Cookie flags and what each does?","HttpOnly: hidden from JS; Secure: HTTPS only; SameSite: restricts cross-site sending; Path/Domain scope; Max-Age/Expires lifetime."],["senior","Cookies vs localStorage for tokens?","Cookies (HttpOnly) resist XSS theft but need CSRF defenses; localStorage tokens avoid CSRF but are stolen by any XSS. Choose based on your threat model; often HttpOnly cookies with SameSite and CSRF tokens."],["architect","How would you design auth for a SPA + API on different subdomains?","Prefer same-site deployment, HttpOnly Secure SameSite cookies for session/refresh, short-lived access tokens, CSRF tokens or custom headers, strict CORS allowlist with credentials, CSP, token rotation, and server-side revocation."]],
practice:[`Add a CSRF token to a form app and show a forged request failing.`,`Compare browser behavior for SameSite=Lax/Strict/None on a cross-site form POST.`],
teach:`<p>"Browsers send your cookie automatically, even when a different site triggers the request. SameSite and secret tokens stop strangers from using your wristband. And CORS is not the fix for this."</p>`}
],quiz:[
{code:`const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
console.log(escapeHTML('<img src=x onerror="alert(1)">'));`,ans:`&amp;lt;img src=x onerror=&amp;quot;alert(1)&amp;quot;&amp;gt;`,why:`Every character that could change the HTML parse is replaced by an entity, so the browser shows the text instead of building an element.`},
{code:`const doc = document.implementation.createHTMLDocument("");
const a = doc.createElement("div"); a.textContent = "<b>hi</b>";
const b = doc.createElement("div"); b.innerHTML = "<b>hi</b>";
console.log(a.innerHTML, "|", b.innerHTML, "|", b.children.length);`,ans:`&lt;b&gt;hi&lt;/b&gt; | <b>hi</b> | 1`,why:`textContent stores the text literally (it is serialized with entities), while innerHTML parses it into a real element.`}]}
]});
