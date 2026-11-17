/* Week 3: Performance, internals and architecture — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js.
   The week revision sheet is built from each day's "rev" bullets. */
JSC.registerWeek({w:3,days:[
/* ===== Day 11 ===== */
{
  n: 11,
  title: "Performance",
  goal: "<b>By the end of today</b> you can tell a harmless re-render from one that hurts users, fix the harmful ones with the right tool (restructuring, <code>memo</code>, <code>useMemo</code>, <code>useCallback</code> or the React Compiler), and prove the fix with the Profiler, Web Vitals and a bundle report instead of guessing.",
  rev: [
    "Re-renders are not bugs. They become a problem only when a render or commit is slow enough to be felt (dropped frames, poor INP). <b>Measure first</b> in a production build with the React DevTools Profiler.",
    "<code>React.memo</code> skips a re-render when every prop is <code>Object.is</code>-equal to last time. A new object, array, function or JSX <code>children</code> on each parent render defeats it; <code>useMemo</code>/<code>useCallback</code> keep those references stable.",
    "Before memoising, try structure: <b>move state down</b> into the component that needs it, or <b>lift content up</b> by passing expensive subtrees as <code>children</code>, so they are not re-created when the state changes.",
    "The React Compiler (Babel plugin) memoises components and hooks automatically at build time if your code follows the Rules of React; <code>\"use no memo\"</code> opts a function out. Keep existing manual memo until you have measured.",
    "Big wins outside memo: virtualise long lists (TanStack Virtual), split code with <code>lazy</code> + <code>Suspense</code> and route-level lazy routes, inspect the bundle (rollup-plugin-visualizer), size and prioritise images, and track LCP / INP / CLS from real users with <code>web-vitals</code>."
  ],
  topics: [
    {
      id: "d11-memo",
      title: "Memoisation: React.memo, useMemo, useCallback and the React Compiler",
      lv: ["fresher", "mid", "senior", "lead"],
      eli5: `<p>Imagine a teacher who re-grades every student's homework each time <i>any</i> student hands in a new page. Most of the papers have not changed, so most of that work is wasted. A smarter teacher keeps a sticky note on each paper: "graded, answer was 8/10, inputs were these pages". If the pages are the same as last time, the teacher just reads the sticky note.</p>
<p>That sticky note is <b>memoisation</b>: remember the result of some work together with the inputs it depended on, and reuse the result when the inputs have not changed. <code>React.memo</code> puts a sticky note on a whole component, <code>useMemo</code> on a calculated value, <code>useCallback</code> on a function.</p>
<p>The catch: the teacher compares pages by <i>identity</i>, not by reading them. If a student hands in a freshly photocopied page with the exact same words, it is a "different page" and the teacher re-grades. In JavaScript, <code>{}</code> or <code>() =&gt; {}</code> written inside a component is a fresh photocopy every render. Most memo bugs are exactly that.</p>
<p>Also, sticky notes are not free: writing and checking them takes time too. For a one-line paper, just re-grade it. The React Compiler is like an assistant who adds the right sticky notes for you automatically, as long as your students (components) follow the house rules.</p>`,
      what: `<h5>First: what a re-render is, and when it is a problem</h5>
<p>A component re-renders when (1) its own state changes, (2) a context it reads changes, or (3) its parent re-renders. Rule 3 is the one that surprises people: by default, <b>when a parent renders, every child it returns renders too</b>, whether or not the child's props changed. React then diffs the new output against the old and touches the DOM only where something differs.</p>
<ul class="pts">
<li>Most re-renders are <b>cheap</b>: calling a function that returns a few elements costs microseconds. If nothing changed, the commit phase does almost nothing to the DOM.</li>
<li>A re-render is a <b>problem</b> when it is <b>slow</b> (a big subtree, an expensive calculation, a chart, a 2,000-row table) <b>and frequent</b> (on every keystroke, every scroll event, every websocket tick). The symptom users feel is input lag: typing in a search box stutters, which shows up as a poor <b>INP</b> (Interaction to Next Paint).</li>
<li>The budget: at 60 Hz the browser has about 16 ms per frame for everything (your JS, style, layout, paint). An interaction that blocks the main thread for 100+ ms is noticeable.</li>
<li>So the order is: notice slowness → <b>measure</b> (the Profiler, topic 2 today) → find which component is slow and why it rendered → fix the cause. Wrapping everything in <code>memo</code> "just in case" adds code and comparison cost and often does nothing because the props are not stable anyway.</li>
</ul>
<h5>Referential equality: the foundation of all memoisation</h5>
<p>React compares dependencies and props with <code>Object.is</code>. For primitives (string, number, boolean, null, undefined) that means "same value". For objects, arrays and functions it means "the same reference in memory".</p>
<ul class="pts">
<li><code>Object.is(3, 3)</code> is <code>true</code>; <code>Object.is("a", "a")</code> is <code>true</code>.</li>
<li><code>Object.is({}, {})</code> is <code>false</code>; <code>Object.is([], [])</code> is <code>false</code>; <code>Object.is(() =&gt; 1, () =&gt; 1)</code> is <code>false</code>.</li>
<li>Every time a component function runs, object literals, array literals, arrow functions and JSX elements written in its body are <b>new</b>. So <code>style={{ color: "red" }}</code>, <code>onClick={() =&gt; save(id)}</code>, <code>options={["a","b"]}</code> and <code>children={&lt;Icon /&gt;}</code> are a different reference on each render.</li>
<li><code>Object.is</code> differs from <code>===</code> only for <code>NaN</code> (equal to itself) and <code>+0</code>/<code>-0</code> (not equal). That rarely matters, but it is why React says "Object.is" and not "===".</li>
</ul>
<h5><code>React.memo</code>: skip re-rendering a component when its props are the same</h5>
<ul class="pts">
<li><code>const Row = memo(function Row(props) { … })</code> returns a new component type. When the parent re-renders, React compares each prop of the new props object with the previous one using <code>Object.is</code> (a <b>shallow</b> comparison: one level deep, key by key). If all are equal, React reuses the previous output and does not call <code>Row</code>.</li>
<li>It only blocks re-renders caused by the <b>parent</b>. A memoised component still re-renders when its <b>own state</b> changes or a <b>context it reads</b> (<code>useContext</code>/<code>use</code>) changes.</li>
<li>Optional second argument: a <b>custom comparator</b> <code>arePropsEqual(prevProps, nextProps)</code> that returns <code>true</code> when the props are equal (skip render). Note the polarity: it is "are equal", the opposite of the old class <code>shouldComponentUpdate</code>. If you write one, you must compare <b>every</b> prop including functions; ignoring a callback prop leads to stale closures. Avoid deep-equality comparators: they can be slower than the render they skip, and they freeze if data is huge.</li>
<li><code>memo</code> is a <b>performance hint</b>, not a guarantee. React may still render the component; never rely on it for correctness.</li>
</ul>
<h5><code>useMemo</code>: cache a calculated value between renders</h5>
<ul class="pts">
<li><code>const visible = useMemo(() =&gt; filterOrders(orders, query), [orders, query])</code>. On the first render React calls the function and stores the result with the dependency array. On later renders, if every dependency is <code>Object.is</code>-equal to last time, React returns the stored result; otherwise it calls the function again.</li>
<li>Two legitimate uses: (1) skipping an <b>expensive calculation</b> (sorting/filtering thousands of items, building a chart dataset, parsing a big document); (2) keeping an object/array <b>reference stable</b> because it is passed to a <code>memo</code> child, used as an effect dependency, or put in a context value.</li>
<li>"Expensive" is something you can measure: wrap it in <code>console.time</code>; if it takes about 1 ms or more, memoising is reasonable. <code>useMemo(() =&gt; a + b, [a, b])</code> or <code>useMemo(() =&gt; items.length, [items])</code> is pure overhead.</li>
<li>It is a cache with a size of one, scoped to one component instance. It is not a global cache, and React may throw it away (for example, a component that suspends during its first mount loses it). Your code must still work if the function is re-run.</li>
<li>In Strict Mode during development, React calls your calculation <b>twice</b> to help you spot impurity. The function must be pure: no fetching, no mutation, no setting state.</li>
</ul>
<h5><code>useCallback</code>: cache a function between renders</h5>
<ul class="pts">
<li><code>const onSelect = useCallback((id: string) =&gt; setSelected(id), [])</code> returns the <b>same function</b> object until a dependency changes. It is exactly <code>useMemo(() =&gt; fn, deps)</code>.</li>
<li>It does <b>not</b> make the function faster and does not avoid creating the closure (the arrow function is still created each render; React just returns the old one). Its only value is <b>reference stability</b> for a consumer that cares: a <code>memo</code> child, an effect dependency array, or a custom hook's returned API.</li>
<li>If the callback reads state, either list that state in the dependencies or use the functional updater (<code>setCount(c =&gt; c + 1)</code>) so the dependency list can stay empty.</li>
<li>A <code>useCallback</code> passed to a plain <code>&lt;button onClick&gt;</code> or a non-memoised child achieves nothing.</li>
</ul>
<h5>Why memo "breaks": the usual culprits</h5>
<ul class="pts">
<li><b>Inline objects/arrays</b>: <code>&lt;Chart options={{ stacked: true }} /&gt;</code> creates a new object each render. Hoist constants outside the component, or <code>useMemo</code> if they depend on props/state.</li>
<li><b>Inline functions</b>: <code>&lt;Row onClick={() =&gt; open(id)} /&gt;</code>. Use <code>useCallback</code>, or pass <code>id</code> and a stable <code>onOpen</code> and let the row call <code>onOpen(id)</code>.</li>
<li><b>JSX children</b>: <code>&lt;Card&gt;&lt;p&gt;Hi&lt;/p&gt;&lt;/Card&gt;</code> passes <code>children</code> as a fresh element object every render, so a memoised <code>Card</code> always sees a changed prop.</li>
<li><b>Spreading big objects</b>: <code>&lt;Row {...order} /&gt;</code> is fine if <code>order</code> fields are primitives, but if it includes a nested <code>customer</code> object that is re-created by a mapping step, every row re-renders.</li>
<li><b>Data re-created upstream</b>: <code>const rows = data.map(toRow)</code> without <code>useMemo</code> gives brand new row objects on each render even when <code>data</code> is unchanged. TanStack Query's structural sharing keeps <code>data</code> stable between refetches with identical JSON (Day 7), but your own <code>map</code> does not.</li>
<li><b>Context</b>: a memoised child that calls <code>useContext(ThemeContext)</code> re-renders when the provider value changes, and the provider value <code>{ theme, setTheme }</code> written inline is new every render of the provider's parent (Day 8).</li>
</ul>
<h5>Alternatives that need no memo at all</h5>
<ul class="pts">
<li><b>Move state down</b>: if only a search box needs <code>query</code>, put the state inside <code>&lt;SearchBox&gt;</code> instead of the page. Typing then re-renders only the box, not the page's heavy siblings.</li>
<li><b>Lift content up (children as props)</b>: if a component with frequently changing state must <i>wrap</i> something expensive, accept the expensive part as <code>children</code>. The parent that creates <code>&lt;ExpensiveTree /&gt;</code> does not re-render when the wrapper's state changes, so the <code>children</code> element is the same object and React skips it.</li>
<li><b>Split contexts</b> or use a selector-based store (Day 8) so a fast-changing value does not re-render every consumer.</li>
<li><b>Keys</b>: stable keys (Day 3) let React keep and reuse list items instead of re-mounting them, which is far more expensive than a re-render.</li>
</ul>
<h5>The React Compiler: automatic memoisation at build time</h5>
<ul class="pts">
<li>A build-time tool (distributed as <code>babel-plugin-react-compiler</code>) that analyses your components and hooks and inserts fine-grained memoisation for you: values, callbacks and even individual JSX elements are cached and only recomputed when what they depend on changes. In practice it gives the effect of <code>memo</code>/<code>useMemo</code>/<code>useCallback</code> everywhere they would help, often more granular than you would write by hand (it can memoise after an early return or inside conditional JSX, where hooks cannot go).</li>
<li>It relies on the <b>Rules of React</b>: components and hooks are pure during render, props and state are treated as immutable, hooks are called unconditionally at the top level, and values passed to JSX/hooks are not mutated afterwards. When it detects code it cannot safely analyse (for example mutating a prop, reading a ref during render), it <b>skips that component</b> and leaves it as it was rather than miscompiling it.</li>
<li><b>Opt-out</b>: a <code>"use no memo"</code> directive at the top of a function (or file) tells the compiler to leave it alone, as an escape hatch while you investigate a problem. There is also an opt-in mode (<code>compilationMode: "annotation"</code> with a <code>"use memo"</code> directive) for incremental adoption.</li>
<li><b>Status (hedged)</b>: the compiler spent a long time in beta/RC and has since been declared stable by the React team; it targets React 19 natively and can support React 17/18 through a runtime package plus a <code>target</code> option. The exact package versions, the ESLint integration (the compiler-powered rules now live in <code>eslint-plugin-react-hooks</code>) and the way Vite wires it in have changed across releases, so follow the current "React Compiler: Installation" docs rather than a blog post.</li>
<li><b>Should you delete manual <code>useMemo</code>/<code>useCallback</code> once it is on?</b> For new code, you can mostly stop writing them. For existing code, the React team's guidance is to <b>leave existing memoisation in place</b> unless you have tested removing it: the compiler's output may differ subtly (for example, an effect that depended on a manually memoised value might fire more or less often). Remove manual memo incrementally, with tests and profiling. Manual <code>useMemo</code> is still the right tool as an explicit "effect dependency must be stable" guarantee in a few places.</li>
</ul>`,
      why: `<p>React's model is "UI is a function of state": when state changes, re-run the components and let React work out the DOM changes. This is what makes React simple to reason about, but it is deliberately coarse: changing one piece of state at the top of a tree re-runs everything below it. For 95% of UIs that is fine. For the other 5% (a dashboard with a 2,000-row orders grid, a chart that rebuilds its dataset, an editor that re-parses on every keystroke) the repeated work becomes visible lag.</p>
<p>Before hooks, class components offered <code>shouldComponentUpdate</code> and <code>PureComponent</code> for this. Function components needed equivalents: <code>React.memo</code> (component level), <code>useMemo</code> (value level) and <code>useCallback</code> (function level). They solve the problem, but they push work onto the developer: you must spot the hot path, keep dependency arrays correct (the <code>react-hooks/exhaustive-deps</code> lint rule helps), and keep every prop in the chain stable. Miss one inline object and the whole effort is silently wasted. Teams oscillate between "memo nothing" and "memo everything", and both are wrong.</p>
<p>Without memoisation tools, your only options would be restructuring (still the best first choice) or moving work outside React. With them, you can surgically cut the expensive branch out of a re-render. The React Compiler exists because doing this by hand is tedious and error-prone: a compiler can see every reference in a component and memoise exactly what is needed, consistently, and keep the "just write plain code" model that made React attractive in the first place.</p>`,
      diagram: {
        html: flow([
          ["Parent state changes", "setQuery('ab')", "w"],
          ["Parent renders", "new props objects for children"],
          ["Child wrapped in memo?", "no → render child"],
          ["Shallow compare props", "Object.is on each key", "g"],
          ["All equal → bail out", "reuse previous output, skip subtree", "g"],
          ["Any prop new reference", "inline {} / () =&gt; / children → render", "r"]
        ], { v: true }) + lanes([
          ["Stabilise the inputs", ["hoist constants out of the component", "useMemo for derived objects/arrays", "useCallback for handlers passed to memo children", "functional updaters to keep deps empty"]],
          ["Avoid the render instead", ["move state down to where it is used", "pass expensive JSX as children", "split context / use selectors", "stable keys in lists"]],
          ["Let the build do it", ["React Compiler (Babel plugin)", "follows Rules of React", "\"use no memo\" escape hatch", "lint rules in eslint-plugin-react-hooks"]]
        ]),
        steps: [
          `State changes in a parent (the orders page) because the user typed in the search box. React schedules a render starting at that component.`,
          `React calls the parent function. Every object literal, arrow function and JSX element in its body is created anew, including the props objects for each child.`,
          `For a plain child, React simply calls it. For a <code>memo</code> child, React first compares the old and new props key by key with <code>Object.is</code>, or runs your custom <code>arePropsEqual</code>.`,
          `If every prop is equal and the child has no pending state update or changed context, React <b>bails out</b>: it reuses the child's previous fiber subtree and does not call the child or anything below it.`,
          `If any prop is a fresh reference (inline object, inline callback, JSX children), the comparison fails and the child renders normally. Memo cost was paid and nothing was saved.`,
          `The cure is either to make the inputs stable (hoist, <code>useMemo</code>, <code>useCallback</code>), to restructure so the expensive child is not re-created at all, or to let the React Compiler insert the memoisation at build time.`
        ]
      },
      ex: [
        {
          t: "See the problem: a parent re-render re-renders every child",
          lang: "tsx",
          code: `import { useState } from "react";

function SlowList({ items }: { items: string[] }) {
  console.log("SlowList render");
  // Simulate an expensive render (do NOT do this in real code)
  const start = performance.now();
  while (performance.now() - start < 30) { /* burn 30 ms */ }
  return (
    <ul>
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

const ITEMS = ["Alpha", "Beta", "Gamma"]; // hoisted: same array every render

export function Page() {
  const [query, setQuery] = useState("");
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <SlowList items={ITEMS} />
    </>
  );
}`,
          out: `Every keystroke logs "SlowList render" and blocks the main thread ~30 ms.
Typing feels sticky even though SlowList's props never changed.`,
          note: `<p><code>SlowList</code> does not use <code>query</code>, but because <code>Page</code> re-renders on every keystroke, so does <code>SlowList</code>. In development, Strict Mode may log twice; that is expected.</p>`
        },
        {
          t: "Fix 1 without memo: move state down",
          lang: "tsx",
          code: `import { useState } from "react";
import { SlowList } from "./SlowList";

const ITEMS = ["Alpha", "Beta", "Gamma"];

function SearchBox() {
  const [query, setQuery] = useState(""); // state lives where it is used
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

export function Page() {
  return (
    <>
      <SearchBox />
      <SlowList items={ITEMS} />
    </>
  );
}`,
          out: `Typing re-renders only SearchBox. "SlowList render" logs once on mount.`,
          note: `<p>This is the cheapest fix: no comparison cost, no dependency arrays. Ask "who actually needs this state?" before reaching for <code>memo</code>.</p>`
        },
        {
          t: "Fix 2 without memo: lift content up (children as props)",
          lang: "tsx",
          code: `import { useState, type ReactNode } from "react";
import { SlowList } from "./SlowList";

const ITEMS = ["Alpha", "Beta", "Gamma"];

// The wrapper owns fast-changing state (mouse position) but must surround the list.
function TrackMouse({ children }: { children: ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div onPointerMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      <p>
        Pointer at {pos.x}, {pos.y}
      </p>
      {children}
    </div>
  );
}

export function Page() {
  // Page creates <SlowList /> once per Page render, not per pointer move.
  return (
    <TrackMouse>
      <SlowList items={ITEMS} />
    </TrackMouse>
  );
}`,
          out: `Moving the pointer re-renders TrackMouse only. SlowList does not re-render.`,
          note: `<p>When <code>TrackMouse</code> re-renders, its <code>children</code> prop is the <b>same element object</b> that <code>Page</code> created earlier, because <code>Page</code> did not re-render. React sees the identical element and skips it. This is the "lift content up" pattern; it is why layout components that take <code>children</code> are naturally cheap.</p>`
        },
        {
          t: "React.memo, and how an inline object breaks it",
          lang: "tsx",
          code: `import { memo, useMemo, useState } from "react";

type ChartOptions = { stacked: boolean; currency: string };

const RevenueChart = memo(function RevenueChart({
  points,
  options,
}: {
  points: number[];
  options: ChartOptions;
}) {
  console.log("RevenueChart render");
  return <pre>{JSON.stringify({ points, options })}</pre>;
});

const POINTS = [120, 340, 290];

export function Dashboard({ currency }: { currency: string }) {
  const [tick, setTick] = useState(0);

  // BROKEN: new object every render, memo never skips
  // const options = { stacked: true, currency };

  // FIXED: same object until currency changes
  const options = useMemo(() => ({ stacked: true, currency }), [currency]);

  return (
    <>
      <button onClick={() => setTick((t) => t + 1)}>Refresh clock ({tick})</button>
      <RevenueChart points={POINTS} options={options} />
    </>
  );
}`,
          out: `With the BROKEN line: every click logs "RevenueChart render".
With the FIXED line: "RevenueChart render" logs once; clicks only update the button.`,
          note: `<p><code>POINTS</code> is hoisted so it is always the same array. <code>options</code> depends on a prop, so it cannot be hoisted; <code>useMemo</code> keeps it stable. Both are needed: one unstable prop is enough to defeat <code>memo</code>.</p>`
        },
        {
          t: "useCallback for handlers passed to memoised rows",
          lang: "tsx",
          code: `import { memo, useCallback, useState } from "react";

type Order = { id: string; customer: string; total: number };

const OrderRow = memo(function OrderRow({
  order,
  selected,
  onSelect,
}: {
  order: Order;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  console.log("row", order.id);
  return (
    <tr
      aria-selected={selected}
      onClick={() => onSelect(order.id)} // inline here is fine: <tr> is not memoised
      style={{ background: selected ? "#eef" : undefined }}
    >
      <td>{order.customer}</td>
      <td>{order.total.toFixed(2)}</td>
    </tr>
  );
});

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Stable across renders: no dependencies because the setter is stable
  const handleSelect = useCallback((id: string) => setSelectedId(id), []);

  return (
    <table>
      <tbody>
        {orders.map((o) => (
          <OrderRow
            key={o.id}
            order={o}
            selected={o.id === selectedId}
            onSelect={handleSelect}
          />
        ))}
      </tbody>
    </table>
  );
}`,
          out: `Clicking a row logs only the previously selected row and the newly selected row,
not all N rows, because only their "selected" prop changed.`,
          note: `<p>Two details make this work: the row receives a <b>primitive</b> <code>selected</code> boolean (not the whole <code>selectedId</code>, which would change for every row), and <code>onSelect</code> is stable. Passing <code>onSelect={() =&gt; setSelectedId(o.id)}</code> from the parent would re-render every row on every click.</p>`
        },
        {
          t: "useMemo for a genuinely expensive calculation (and measuring it)",
          lang: "tsx",
          code: `import { useMemo, useState } from "react";

type Order = { id: string; customer: string; total: number; createdAt: string };

function summarise(orders: Order[], query: string) {
  console.time("summarise");
  const q = query.trim().toLowerCase();
  const filtered = orders.filter((o) => o.customer.toLowerCase().includes(q));
  const sorted = [...filtered].sort((a, b) => b.total - a.total);
  const revenue = sorted.reduce((sum, o) => sum + o.total, 0);
  console.timeEnd("summarise");
  return { top: sorted.slice(0, 50), revenue, count: sorted.length };
}

export function OrdersReport({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");
  const [showTax, setShowTax] = useState(false);

  // Recomputes only when orders or query change, NOT when showTax toggles
  const summary = useMemo(() => summarise(orders, query), [orders, query]);
  const displayRevenue = showTax ? summary.revenue * 1.18 : summary.revenue; // trivial: no memo

  return (
    <section>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Customer" />
      <label>
        <input type="checkbox" checked={showTax} onChange={(e) => setShowTax(e.target.checked)} /> incl. tax
      </label>
      <p>
        {summary.count} orders, revenue {displayRevenue.toFixed(2)}
      </p>
      <ol>
        {summary.top.map((o) => (
          <li key={o.id}>
            {o.customer}: {o.total}
          </li>
        ))}
      </ol>
    </section>
  );
}`,
          out: `With 50,000 orders: "summarise: 18.4ms" logs on typing, nothing logs when toggling tax.
(Numbers depend on your machine; measure with CPU throttling in DevTools for realism.)`,
          note: `<p>Note what is <b>not</b> memoised: <code>displayRevenue</code> is one multiplication. Memoising it would cost more than it saves. If typing is still slow after this, the fix is not more memo but deferring the work (<code>useDeferredValue</code>, Day 12) or doing the filtering on the FastAPI side.</p>`
        },
        {
          t: "Custom comparator: the right way and the stale-closure trap",
          lang: "tsx",
          code: `import { memo } from "react";

type Point = { t: number; v: number };
type Props = { series: Point[]; version: number; onHover: (p: Point) => void };

function Sparkline({ series, onHover }: Props) {
  return (
    <svg width={120} height={30}>
      {series.map((p, i) => (
        <circle key={i} cx={i * 4} cy={30 - p.v} r={1.5} onMouseEnter={() => onHover(p)} />
      ))}
    </svg>
  );
}

// The server sends a "version" that bumps whenever the series changes,
// so we compare that instead of deep-comparing thousands of points.
export const MemoSparkline = memo(Sparkline, (prev, next) => {
  return prev.version === next.version && prev.onHover === next.onHover;
  // WRONG would be: return prev.version === next.version;
  // That ignores onHover: the component keeps calling an old callback
  // that closes over old state (a stale closure).
});`,
          note: `<p>Return <code>true</code> to <b>skip</b> the render. Compare every prop, including functions. Comparing a cheap version/ETag beats deep equality, which can cost more than the render.</p>`
        },
        {
          t: "Stable context value so consumers do not all re-render",
          lang: "tsx",
          code: `import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";

type Cart = { items: string[]; add: (id: string) => void };
export const CartContext = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const add = useCallback((id: string) => setItems((prev) => [...prev, id]), []);

  // Without useMemo, this object is new whenever CartProvider re-renders
  // (for example, because ITS parent re-rendered), and every consumer re-renders.
  const value = useMemo(() => ({ items, add }), [items, add]);

  return <CartContext value={value}>{children}</CartContext>;
}`,
          note: `<p><code>&lt;CartContext value&gt;</code> as a provider is React 19 syntax; on React 18 write <code>&lt;CartContext.Provider value={value}&gt;</code>. Note that this stabilises the value only across <i>unrelated</i> re-renders; when <code>items</code> changes, all consumers still re-render. Splitting into an items context and an actions context (Day 8) fixes that.</p>`
        },
        {
          t: "Turning on the React Compiler in a Vite app",
          lang: "sh",
          code: `npm install -D babel-plugin-react-compiler@latest
npm install -D eslint-plugin-react-hooks@latest`,
          note: `<p>Then add the Babel plugin through the Vite React plugin (next example). If you are on React 17/18 you also need the <code>react-compiler-runtime</code> package and a <code>target</code> option; on React 19 nothing else is needed. Check the current installation docs: the Vite integration has changed between <code>@vitejs/plugin-react</code> major versions.</p>`
        },
        {
          t: "vite.config.ts with the compiler (Babel-based @vitejs/plugin-react)",
          lang: "ts",
          code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        // The compiler should run first in the Babel pipeline
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});`,
          out: `In React DevTools, compiled components show a "Memo ✨" badge.`,
          note: `<p>This is the documented setup for the Babel-based <code>@vitejs/plugin-react</code>. If your version of the plugin no longer exposes a <code>babel</code> option, follow the compiler docs for your Vite version instead of forcing it. Projects using <code>@vitejs/plugin-react-swc</code> need a different route because the compiler is a Babel plugin.</p>`
        },
        {
          t: "What the compiler does with your code (simplified) and the opt-out",
          lang: "tsx",
          code: `// You write plain code:
export function OrderSummary({ orders, currency }: { orders: { total: number }[]; currency: string }) {
  const total = orders.reduce((s, o) => s + o.total, 0);
  const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(total);
  return <p className="summary">Total: {formatted}</p>;
}

// Conceptually, the compiler emits something like this (real output differs):
//   const $ = _c(4);                       // per-instance cache slots
//   let formatted;
//   if ($[0] !== orders || $[1] !== currency) {
//     const total = orders.reduce(...);
//     formatted = new Intl.NumberFormat(...).format(total);
//     $[0] = orders; $[1] = currency; $[2] = formatted;
//   } else { formatted = $[2]; }
//   let jsx;  // the <p> element is cached on 'formatted' too
//   ...

// Escape hatch while you debug a compiler-related issue:
export function LegacyWidget() {
  "use no memo";
  // ...code the compiler should leave untouched
  return null;
}`,
          note: `<p>The compiler caches values and JSX in a per-component cache array (via an internal hook), comparing the inputs each render. Because it caches the returned JSX element, an unchanged child element is the same object as last time, which gives the same bail-out as <code>memo</code>. <code>"use no memo"</code> is meant to be temporary; fix the underlying rule violation and remove it.</p>`
        }
      ],
      internals: `<p><b>Where the bail-out happens.</b> During the render phase, React walks the fiber tree calling <code>beginWork</code> on each fiber (Day 12 covers the work loop). For every fiber, React checks whether it can skip: if the <b>props object is the same reference</b> as last time (<code>oldProps === newProps</code>), no context it depends on changed, and it has no pending update in the current render lanes, React <b>bails out</b> and either clones the existing child fibers or, if nothing below has pending work, skips the whole subtree. This identity check is free and automatic; it is why "lift content up" works with no <code>memo</code> at all: a <code>children</code> element created by a parent that did not re-render is the same object, so its props object is the same reference.</p>
<p><b>What <code>memo</code> adds.</b> A normal parent render creates new elements, so the props object is always a new reference and the free check fails. <code>memo(Component)</code> makes React create a <code>MemoComponent</code> fiber (or the optimised <code>SimpleMemoComponent</code> when there is no custom comparator and no <code>defaultProps</code>). In its <code>beginWork</code> path React runs <code>shallowEqual(prevProps, nextProps)</code> (or your comparator); <code>shallowEqual</code> checks that both objects have the same keys and that each value is <code>Object.is</code>-equal. If equal and there is no pending update/context change, React takes the same bail-out path. Note the <code>ref</code> is also compared (in React 19 <code>ref</code> is an ordinary prop for function components).</p>
<p><b>How <code>useMemo</code>/<code>useCallback</code> are stored.</b> Each hook call corresponds to a node in the fiber's linked list of hooks (<code>memoizedState</code>). For <code>useMemo</code>, the node stores <code>[value, deps]</code>. On update, React compares each new dependency with the previous one using <code>Object.is</code> (<code>areHookInputsEqual</code>); if all match it returns the stored value without calling your function. <code>useCallback</code> stores <code>[callback, deps]</code> and returns the stored callback. This is why hooks must be called in the same order every render: React finds "the useMemo slot" by position in the list.</p>
<p><b>The compiler's cache.</b> The React Compiler turns your component into code that calls an internal hook (exported from <code>react/compiler-runtime</code>, usually imported as <code>_c</code>) to get a fixed-size array of cache slots for this component instance, stored on the fiber like any hook state. Each reactive scope (a group of values computed together) is guarded by <code>if ($[i] !== dep)</code> checks. Because it analyses data flow at compile time, it can memoise below an early return or in branches, which hook-based <code>useMemo</code> cannot. It only does this when its analysis says the code is pure; components it cannot prove safe are left uncompiled, which is why following the Rules of React (and the lint rules that check them) matters.</p>
<p><b>What memo never skips.</b> State updates scheduled on the memoised component itself, and context changes: when a provider's value changes, React walks down and marks every consumer fiber with work (context propagation), regardless of memo. Memo also does nothing for the <b>commit phase</b> of components that did render: if a re-render really changes 2,000 DOM nodes, you need fewer nodes (virtualisation, next topic), not memo.</p>`,
      prod: `<p>In a React → FastAPI dashboard, the hot spots are predictable: <b>tables</b> (orders, users, audit logs), <b>charts</b> (Recharts/ECharts components that rebuild datasets), <b>forms with live validation</b>, and anything driven by <b>frequent updates</b> (websocket prices, polling every few seconds, pointer tracking). These are where memo pays off; a settings page with ten fields is not.</p>
<ul class="pts">
<li><b>Data from the server.</b> TanStack Query (Day 7) returns the same <code>data</code> reference when a refetch produces identical JSON (structural sharing), and keeps unchanged nested objects identical even when part of the response changes. That makes <code>memo</code> on rows effective. Your own transformation (<code>data.map(toViewModel)</code>) breaks it unless wrapped in <code>useMemo</code> or moved into the query's <code>select</code> option (keep <code>select</code> stable too: define it outside the component or with <code>useCallback</code>).</li>
<li><b>Server-side work beats client-side memo.</b> If the client filters/sorts 50,000 orders, the real fix is pagination and filtering in FastAPI (<code>/api/orders?q=&amp;sort=&amp;page=</code>) backed by PostgreSQL indexes, with Redis caching hot queries. Memo is for the remaining client-side cost.</li>
<li><b>Design-system components</b> (Button, Icon, Tooltip) are rendered thousands of times. Keep them cheap rather than memoised; memoising leaf components whose props are usually inline adds comparison cost for no benefit.</li>
<li><b>Team conventions.</b> Common, sensible rules: enable <code>react-hooks/exhaustive-deps</code> as an error; memoise only with a Profiler screenshot or a comment explaining why; prefer structure (state down, children up) in code review; for context providers, always memoise the value. A lead should push back on blanket <code>useCallback</code> on every handler: it hurts readability and often does nothing.</li>
<li><b>Adopting the compiler.</b> Treat it as a migration: enable the lint rules first and fix violations, roll out per directory or behind <code>compilationMode: "annotation"</code>, run the test suite and E2E tests, compare Profiler recordings before and after, and keep <code>"use no memo"</code> for anything that misbehaves until fixed. Libraries that rely on mutation (some older form and table libraries) are the usual sources of surprises.</li>
<li><b>What goes wrong at scale.</b> Over-memoisation hides bugs: a wrong dependency array produces stale data that only shows up for some users; a custom comparator that ignores a callback causes "it saved the old value" tickets. Memory is rarely a problem, but memoising huge derived arrays in hundreds of rows adds up. And memo work done in development with Strict Mode and DevTools open gives misleading timings: always confirm in a production build.</li>
</ul>`,
      iq: [
        ["fresher", "When does a React function component re-render?", "When its own state changes, when a context it reads changes, or when its parent re-renders. The last one is the surprising one: by default a child re-renders whenever its parent does, even if its props are identical. Props changing is <b>not</b> the trigger by itself; the tempting answer \"when its props change\" is wrong because props can only change when the parent renders, and the child re-renders on parent render regardless."],
        ["fresher", "What is the difference between <code>useMemo</code> and <code>useCallback</code>?", "<code>useMemo(fn, deps)</code> calls <code>fn</code> and caches its <b>return value</b>; <code>useCallback(fn, deps)</code> caches the <b>function itself</b>. <code>useCallback(fn, deps)</code> is equivalent to <code>useMemo(() =&gt; fn, deps)</code>. Neither makes the code inside faster on a cache miss; <code>useCallback</code> does not even avoid creating the closure. Their value is skipping work or keeping a reference stable."],
        ["mid", "You wrapped a child in <code>React.memo</code> but the Profiler shows it still re-renders on every parent update. What do you check?", "Look at which prop changed (enable \"Record why each component rendered\" in the Profiler). Usual causes: an inline object/array (<code>style={{…}}</code>, <code>options={{…}}</code>), an inline callback, JSX <code>children</code> (a new element every render), a derived array re-created by <code>map</code>/<code>filter</code> in the parent, or a context the child consumes changing. Fix by hoisting constants, <code>useMemo</code>/<code>useCallback</code> in the parent, or restructuring. Memo also never blocks re-renders from the child's own state or context."],
        ["mid", "Should you wrap every component in <code>memo</code> and every function in <code>useCallback</code>?", "No. Each memo costs a props comparison and makes code harder to read, and it only helps if all props are actually stable, which they often are not. Most renders are cheap. Memoise when a measured component is slow and re-renders with unchanged props, or when stability is needed for an effect dependency or a context value. The tempting \"it can't hurt\" is wrong: it costs comparisons and memory, hides dependency bugs, and gives false confidence. Restructuring (state down, children up) is often a better first move. With the React Compiler you get the benefits without the manual noise."],
        ["mid", "Explain \"move state down\" and \"lift content up\" and why they avoid re-renders without memo.", "Move state down: put state in the smallest component that needs it, so updates re-render only that subtree. Lift content up: when a stateful wrapper must surround expensive content, have the wrapper accept it as <code>children</code>. The element is created by the parent that owns it; when only the wrapper's state changes, that parent did not re-render, so <code>children</code> is the same element object. React sees identical props and bails out automatically, with no shallow comparison needed."],
        ["senior", "How does <code>memo</code>'s custom comparator work, and what is the risk?", "<code>memo(Component, arePropsEqual)</code>: React calls <code>arePropsEqual(prev, next)</code>; returning <code>true</code> means \"equal, skip the render\" (opposite polarity to <code>shouldComponentUpdate</code>). Risks: forgetting a prop (especially a callback) produces stale closures, so the component calls an old handler with old state; deep comparison can cost more than rendering and scales badly with data size. Prefer comparing cheap signals (an id, a version number, an <code>updatedAt</code>) and include every function prop."],
        ["senior", "A memoised child consumes a context whose provider value is <code>{ user, logout }</code>. When does the child re-render and how do you reduce it?", "It re-renders whenever the provider's value reference changes; memo does not help because context propagation marks consumers directly. If the provider writes <code>value={{ user, logout }}</code> inline, the value changes on every provider render. Fix: <code>useMemo</code> the value (with <code>logout</code> from <code>useCallback</code>). If consumers only need <code>logout</code>, split into two contexts (state and actions) so changes to <code>user</code> do not re-render action-only consumers, or use a store with selectors (Zustand, <code>useSyncExternalStore</code>)."],
        ["senior", "What is the React Compiler and what does it need from your code?", "A build-time Babel plugin that automatically memoises components and hooks: it analyses data flow and caches values, callbacks and JSX elements, recomputing only when their inputs change, often more granularly than manual <code>useMemo</code>. It requires the Rules of React: pure render, no mutation of props/state/values after they are used in JSX, hooks called unconditionally, no reading/writing refs during render. When it cannot prove safety it skips the component. <code>\"use no memo\"</code> opts a function out. It has been declared stable, but details of installation change; check the docs."],
        ["lead", "Your team turns on the React Compiler. Should they remove all existing <code>useMemo</code>/<code>useCallback</code>?", "Not as a big-bang change. The guidance is that new code can rely on the compiler, but existing manual memoisation should be left in place unless removal is tested, because the compiler's memoisation may not match exactly, and code that depended on a stable reference (an effect dependency, a subscription key) could change behaviour. Remove incrementally with tests and before/after Profiler recordings. Also roll out the lint rules first, fix violations, and adopt per directory or with annotation mode."],
        ["lead", "How would you set a team policy on memoisation in code review?", "Principles: measure before optimising (a Profiler recording or a timed calculation in the PR); prefer structural fixes; memoise context values always; memoise when passing objects/functions to memoised children or effect deps; never use deep-compare comparators casually; keep <code>exhaustive-deps</code> as an error. If the compiler is enabled, stop adding manual memo in new code except for explicit stability guarantees. The point is a consistent, explainable rule instead of each developer's taste."],
        ["architect", "A product dashboard with live price updates every 500 ms feels sluggish. Where does memoisation fit among the possible fixes?", "Start with architecture: where does the update enter the tree? If a websocket message updates state at the top of the page, everything re-renders twice a second. Better: keep live data in an external store and subscribe at the leaf (selectors or <code>useSyncExternalStore</code>) so only affected cells render; throttle/batch updates to animation frames; virtualise the grid; move aggregation to the backend (FastAPI computing aggregates, Redis pub/sub fan-out). Memo and the compiler then trim remaining waste. Memoisation is a local optimisation; it cannot fix a data flow that invalidates the whole tree."]
      ],
      gotchas: [
        "<code>memo</code> compares props <b>shallowly</b>: <code>{ filters: { status: \"paid\" } }</code> with a re-created inner object fails even though it is \"the same\". Mutating an object in place and passing it again does the opposite: memo skips and the UI shows stale data.",
        "JSX passed as <code>children</code> (or any prop like <code>icon={&lt;Star /&gt;}</code>) is a new object every render of the parent, so it defeats <code>memo</code> on the receiving component.",
        "<code>useMemo</code>/<code>useCallback</code> with a missing dependency return stale values silently. With an object dependency created during render (<code>[{ id }]</code>) they recompute every time, also silently.",
        "In Strict Mode development builds, <code>useMemo</code> and <code>useState</code> initialisers run twice and components render twice; timings and logs in dev are not representative of production.",
        "<code>memo</code> does not prevent re-renders from the component's own state or from context; a memoised component that reads a frequently changing context re-renders every time.",
        "<code>memo</code> on a component whose parent always passes a new callback is pure overhead. Profile a \"memoised\" component before assuming it skips.",
        "Do not rely on <code>useMemo</code> for correctness (for example, to create a singleton connection or an ID once). React may discard the cache; use <code>useState</code>/<code>useRef</code> initialisers or module scope for that.",
        "The React Compiler silently skips components that break the Rules of React; you get no speed-up there unless you check the lint output or DevTools badges."
      ],
      best: [
        "Measure first (Profiler, <code>console.time</code>) in a production-like build; optimise the components that are both slow and frequent.",
        "Prefer structural fixes: move state down, lift content up with <code>children</code>, split contexts, and avoid storing derived data in state.",
        "Hoist constant objects, arrays and functions out of components; use <code>useMemo</code>/<code>useCallback</code> only when a consumer needs a stable reference or the calculation is measurably expensive.",
        "Pass primitives to memoised rows (<code>selected={id === selectedId}</code>) rather than whole parent state, so only the affected rows see a change.",
        "Always memoise context provider values; split state and actions into separate contexts when consumers differ.",
        "Keep <code>react-hooks/exhaustive-deps</code> on; never silence it to \"fix\" an infinite loop. Use functional updaters to keep dependencies small.",
        "Adopt the React Compiler incrementally behind lint rules and tests; keep existing manual memo until proven unnecessary; use <code>\"use no memo\"</code> only as a temporary escape hatch."
      ],
      lab: [
        "In your Vite react-ts app, create <code>OrdersPage</code> with a search <code>&lt;input&gt;</code> (state in the page) and an <code>OrdersTable</code> rendering 2,000 fake orders (<code>Array.from({ length: 2000 }, …)</code>) as <code>OrderRow</code> components. Add <code>console.count(\"row\")</code> in the row.",
        "Type in the search box and note the count increases by 2,000 per keystroke. Open React DevTools → Profiler, enable \"Record why each component rendered\", record typing, and note the commit duration.",
        "Wrap <code>OrderRow</code> in <code>memo</code>, pass an inline <code>onSelect={() =&gt; …}</code> and confirm that nothing improves. Then switch to a <code>useCallback</code> handler plus a primitive <code>selected</code> prop and re-record.",
        "Remove the memo again and instead move the search state into a <code>SearchBox</code> component (or make filtering use <code>useMemo</code> keyed on the query) and compare. Write down which approach gave which commit duration.",
        "Optional: install <code>babel-plugin-react-compiler</code>, enable it in <code>vite.config.ts</code>, remove your manual memo in a branch, and check for the compiler badge in DevTools and the new Profiler numbers.",
        "<b>Done when:</b> clicking a row re-renders only two rows (the old and new selection), typing in the search box no longer re-renders unaffected rows, and you can show before/after Profiler commit times."
      ],
      teach: `<p>"By default, when a React component renders, all its children render too. That is usually fine because rendering is just calling functions. It becomes a problem only when a component is slow and renders often, so first I measure with the Profiler.</p>
<p>If something is slow, I first try structure: move the state down to the component that uses it, or pass the expensive part in as <code>children</code> so it isn't re-created. If that does not work, I use memoisation. <code>React.memo</code> skips a child's render when every prop is the same reference, compared with <code>Object.is</code>. That is the catch: an inline object, an inline arrow function or JSX children are new every render, so memo fails. <code>useMemo</code> keeps a computed value or object stable and skips expensive calculations; <code>useCallback</code> keeps a function stable. They are only useful when someone cares about that stability.</p>
<p>Memo never stops re-renders from the component's own state or from context. Finally, the React Compiler does all this automatically at build time, as long as my code follows the Rules of React; I can opt a component out with <code>"use no memo"</code>, and I would keep existing manual memo until I have tested removing it."</p>`
    },
    {
      id: "d11-perf-tools",
      title: "Measuring performance: Profiler, virtualisation, code splitting and Web Vitals",
      lv: ["mid", "senior", "lead", "architect"],
      eli5: `<p>A doctor does not prescribe medicine before taking your temperature and running tests. Performance work is the same: <b>measure, then treat, then measure again</b>. Guessing ("it's probably re-renders") leads to the wrong medicine, like memoising everything when the real problem was a 2 MB JavaScript bundle or a huge hero image.</p>
<p>Your instruments: the <b>React Profiler</b> is an X-ray of React itself (which components rendered, how long, and why). The browser's <b>Performance panel</b> is a full-body scan (JavaScript, layout, paint, network). <b>Web Vitals</b> are the patient's own report from home: how fast the page appeared (LCP), how quickly it responded to taps (INP), and whether things jumped around (CLS), measured on real users' phones.</p>
<p>The treatments are just as concrete. For a 10,000-row list, only draw the 30 rows that fit on screen (<b>virtualisation</b>), like a train window that shows only the scenery right outside. For a big app, only send the code for the page the user opened (<b>code splitting</b>), like a restaurant that cooks dishes when ordered instead of bringing out the whole menu at once.</p>`,
      what: `<h5>Rule zero: measure a production build</h5>
<ul class="pts">
<li>The development build of React is much slower: it includes extra checks and warnings, Strict Mode double-renders components and double-runs effects (mount, unmount, mount), components are not minified, and Vite serves unbundled ES modules. A page that feels slow in <code>npm run dev</code> may be fine in production, and timings from dev are misleading.</li>
<li>For realistic numbers run <code>npm run build &amp;&amp; npm run preview</code> and use Chrome DevTools with <b>CPU throttling</b> (4x or 6x slowdown) and network throttling to approximate a mid-range phone. Your developer laptop is not your user's device.</li>
<li>Note: the React DevTools Profiler does not work on a plain production build because profiling hooks are stripped; you need a <b>profiling build</b> (see the <code>react-dom/profiling</code> alias below) or test in dev and confirm in prod with the Performance panel.</li>
</ul>
<h5>React DevTools Profiler</h5>
<ul class="pts">
<li>Install the React Developer Tools browser extension; it adds <b>Components</b> and <b>Profiler</b> tabs. Click record, perform the slow interaction, stop.</li>
<li>Each bar at the top is a <b>commit</b> (React applying a render to the DOM). Tall/yellow bars are slow commits. Select one to inspect it.</li>
<li><b>Flamegraph</b>: the component tree for that commit; width is render time including children, colour shows self time (yellow slow, blue/green fast, grey "did not render"). Great for "which part of the tree rendered".</li>
<li><b>Ranked</b>: components sorted by their own render time in that commit. Great for "which single component is expensive".</li>
<li><b>"Record why each component rendered while profiling"</b> (Profiler settings, gear icon): hovering a component then shows the reason: "Props changed: (onSelect, options)", "Hook 2 changed", "Context changed", "The parent component rendered". This is the fastest way to find the unstable prop that breaks <code>memo</code>.</li>
<li><b>"Highlight updates when components render"</b> (Components settings): flashes a border on every rendering component, a quick visual check for "why is the whole page lighting up when I type?".</li>
<li>Recent React/DevTools versions also offer a <b>Timeline</b> view (scheduling, Suspense, transitions) and, as a React 19.2 addition, custom React tracks in the Chrome Performance panel. Treat the exact feature set as version-dependent.</li>
</ul>
<h5>The <code>&lt;Profiler&gt;</code> component: measuring in code</h5>
<ul class="pts">
<li><code>&lt;Profiler id="OrdersTable" onRender={onRender}&gt;…&lt;/Profiler&gt;</code> calls <code>onRender(id, phase, actualDuration, baseDuration, startTime, commitTime)</code> every time that subtree commits.</li>
<li><code>phase</code> is <code>"mount"</code>, <code>"update"</code> or <code>"nested-update"</code>. <code>actualDuration</code> is time spent rendering the subtree for this commit (lower with good memoisation); <code>baseDuration</code> is an estimate of rendering the whole subtree without any memoisation (worst case).</li>
<li>It is disabled in production builds by default. To use it in production (for example, sampling real users), alias <code>react-dom/client</code> to <code>react-dom/profiling</code> in your bundler; this adds overhead, so do it in a dedicated build or sample a small percentage.</li>
<li>Uses: automated performance tests (assert <code>actualDuration</code> stays under a budget), logging slow commits to your monitoring, comparing before/after a refactor.</li>
</ul>
<h5>Chrome Performance panel</h5>
<ul class="pts">
<li>Records everything on the main thread: scripting, style recalculation, layout, paint, and network. Long tasks (over 50 ms) are flagged with red corners; the summary breaks time into Scripting / Rendering / Painting.</li>
<li>Use it when the React Profiler looks fine but the page is still slow: the problem may be layout thrashing, huge DOM size, expensive CSS, a third-party script, or garbage collection.</li>
<li>Newer Chrome versions show Core Web Vitals (LCP, INP, CLS) live in the Performance panel and let you see which interaction produced a slow INP.</li>
</ul>
<h5>Web Vitals: what users experience</h5>
<ul class="pts">
<li><b>LCP</b> (Largest Contentful Paint): time until the largest image or text block in the viewport is rendered. Good is ≤ 2.5 s. Hurt by large bundles that must run before anything renders (client-rendered apps), slow APIs, and big unoptimised hero images.</li>
<li><b>INP</b> (Interaction to Next Paint): roughly the worst latency from a user interaction (click, tap, key press) to the next frame being painted, across the page's lifetime. Good is ≤ 200 ms. This is the metric React re-render problems damage. INP <b>replaced FID</b> (First Input Delay) as a Core Web Vital in 2024; FID only measured the delay before the first handler started, INP covers all interactions and the whole processing and rendering time.</li>
<li><b>CLS</b> (Cumulative Layout Shift): how much visible content moves unexpectedly. Good is ≤ 0.1. Caused by images without dimensions, late-loading banners, spinners replaced by taller content, and web fonts.</li>
<li>Others worth tracking: <b>TTFB</b> (time to first byte, your FastAPI/CDN response) and <b>FCP</b> (first contentful paint).</li>
<li>Lab tools (Lighthouse, the Performance panel) are reproducible but synthetic; <b>field data</b> (real user monitoring, RUM) via the <code>web-vitals</code> library or Chrome UX Report is what matters. INP in particular can only be measured meaningfully in the field.</li>
</ul>
<h5>List virtualisation (windowing)</h5>
<ul class="pts">
<li>Rendering 10,000 rows creates 10,000+ components and tens of thousands of DOM nodes: slow mount, slow updates, heavy memory, sluggish scrolling. Memo cannot fix this; the DOM itself is the cost.</li>
<li>Virtualisation renders only the rows visible in the scroll viewport plus a small <b>overscan</b>, positions them absolutely (or with transforms) inside a spacer element with the full height, and swaps rows as you scroll. DOM size stays constant (~30-50 rows) regardless of data size.</li>
<li>Libraries: <b>TanStack Virtual</b> (<code>@tanstack/react-virtual</code>, headless hook <code>useVirtualizer</code>, supports dynamic row heights, horizontal and grid layouts) and <b>react-window</b> (component-based; its API changed significantly in its newer major version, so follow the docs for the version you install).</li>
<li>Trade-offs: browser find-in-page (Ctrl+F) does not see off-screen rows; accessibility needs care (<code>aria-rowcount</code>/<code>aria-rowindex</code>); variable heights need measurement; sticky headers and scroll restoration need extra work. Often pagination or infinite loading (Day 7's <code>useInfiniteQuery</code>) plus virtualisation is the right combination.</li>
</ul>
<h5>Code splitting</h5>
<ul class="pts">
<li>By default Vite bundles all statically imported code into the initial JavaScript. Every kilobyte must be downloaded, parsed and executed before your client-rendered app shows anything, which hurts LCP, especially on mobile.</li>
<li><code>const Reports = lazy(() =&gt; import("./Reports"))</code> creates a component whose code is loaded on first render. The dynamic <code>import()</code> makes Vite emit a separate chunk. Wrap it in <code>&lt;Suspense fallback={…}&gt;</code> to show a placeholder while the chunk loads. The module must have a <b>default export</b> (or you map a named export: <code>import("./Reports").then(m =&gt; ({ default: m.Reports }))</code>). Declare <code>lazy</code> components at module top level, never inside a component.</li>
<li><b>Route-level splitting</b> is the highest-value split: each page becomes its own chunk. React Router v7's data routers support a <code>lazy</code> property on route objects that loads the component (and loader/action) only when the route matches, and can do so in parallel with data loading (Day 6).</li>
<li>Also split <b>heavy, rarely used widgets</b>: a rich text editor, a charting library, a PDF viewer, an admin-only panel. Prefetch on hover or idle when you can predict the next navigation, to hide the delay.</li>
<li>Do not over-split: dozens of tiny chunks add request overhead and waterfalls (chunk A loads, renders, then requests chunk B).</li>
</ul>
<h5>Bundle analysis</h5>
<ul class="pts">
<li>For Vite, <code>rollup-plugin-visualizer</code> generates an interactive treemap (<code>stats.html</code>) of what is inside each chunk, with gzip/brotli sizes. Look for: whole libraries imported for one function (lodash, moment, icon packs), duplicate copies of a dependency at different versions, dev-only code shipped to production, and large JSON/locale data.</li>
<li>Fixes: import specific modules (<code>lodash-es</code> with named imports, or native APIs), switch to lighter libraries (<code>date-fns</code> or <code>Intl</code> instead of moment), lazy-load the heavy parts, and set a <b>size budget</b> checked in CI.</li>
</ul>
<h5>Other everyday wins</h5>
<ul class="pts">
<li><b>Images</b>: often the LCP element and the biggest bytes. Serve modern formats (AVIF/WebP), responsive sizes (<code>srcSet</code> + <code>sizes</code>), always set <code>width</code>/<code>height</code> (or CSS <code>aspect-ratio</code>) to prevent CLS, <code>loading="lazy"</code> for below-the-fold images, and <code>fetchPriority="high"</code> (never lazy) for the hero image.</li>
<li><b>Layout thrashing</b>: alternating DOM writes and reads (<code>el.style.height = …</code> then <code>el.offsetHeight</code> in a loop) forces the browser to recalculate layout repeatedly. Batch reads, then writes; use <code>useLayoutEffect</code> only when you must measure before paint; prefer CSS transforms for animation; use <code>ResizeObserver</code> instead of polling sizes.</li>
<li><b>Debouncing input</b>: when each keystroke triggers expensive work or an API call, debounce (wait until typing pauses, e.g. 300 ms) or throttle. For server search, debounce the request (and let TanStack Query cancel stale ones). For in-memory filtering, React's own tools are often better: <code>useDeferredValue</code> and <code>startTransition</code> keep the input responsive while a heavy render runs at lower priority. <b>Day 12</b> covers transitions and deferred values in depth.</li>
<li><b>Avoid unnecessary work entirely</b>: derive data instead of syncing it with effects (Day 5), avoid effect chains that cause extra renders, and paginate on the server.</li>
</ul>`,
      why: `<p>Performance intuition is notoriously wrong. Developers blame "too many re-renders" when the real cause is a 1.5 MB bundle; they memoise a component that takes 0.2 ms while a 40 ms layout thrash goes unnoticed; they optimise on a fast laptop and never see what a mid-range Android phone experiences. Without measurement, optimisation is guesswork that adds complexity and often makes no difference.</p>
<p>The tools exist because each layer has its own costs. React's render and commit work is invisible to generic browser tools at the component level, so React provides the Profiler. Browser work (layout, paint, long tasks) is invisible to React, so you need the Performance panel. And lab measurements on your machine do not represent users, so Google defined <b>Core Web Vitals</b> (which also influence search ranking) and the <code>web-vitals</code> library to collect them from real sessions.</p>
<p>The structural fixes exist because some costs cannot be optimised away inside React at all. No amount of memoisation makes 10,000 DOM rows cheap; only not rendering them (virtualisation) does. No component optimisation helps if users wait four seconds for JavaScript to download; only shipping less up front (code splitting, bundle analysis) does. Before single-page apps, the server sent HTML per page and these problems were smaller; client-rendered React apps took on the job of loading and running the whole UI, so they must manage that cost deliberately (Day 13 covers server rendering as another answer).</p>`,
      diagram: {
        html: flow([
          ["Symptom", "slow load, laggy typing, jank on scroll", "w"],
          ["Field data", "web-vitals: LCP / INP / CLS by page", "g"],
          ["Reproduce in lab", "prod build + CPU throttle"],
          ["Diagnose", "React Profiler / Performance panel / bundle treemap"],
          ["Fix the cause", "split, virtualise, restructure, memo", "g"],
          ["Measure again", "compare before vs after, add a budget", "g"]
        ]) + lanes([
          ["Slow load (LCP)", ["bundle too big → route-level lazy, visualizer", "hero image → size, format, fetchPriority", "API waterfall → parallel loaders, caching", "consider SSR (Day 13)"]],
          ["Slow interaction (INP)", ["Profiler: which component, why it rendered", "move state down / memo / compiler", "useDeferredValue, transitions (Day 12)", "debounce expensive handlers"]],
          ["Big lists / jank", ["virtualise (TanStack Virtual)", "paginate on FastAPI", "avoid layout thrash", "CSS transforms for animation"]],
          ["Layout shift (CLS)", ["width/height on images", "reserve space for async content", "skeletons with real dimensions", "font-display strategy"]]
        ]),
        steps: [
          `Start from a symptom reported by users or monitoring, ideally backed by <b>field data</b>: the <code>web-vitals</code> library sending LCP, INP and CLS per route to your backend or analytics tells you which page and which metric is bad.`,
          `Reproduce in the lab against a <b>production build</b> (<code>vite build</code> + <code>vite preview</code>) with CPU and network throttling, so you see what a typical user sees rather than dev-mode overhead.`,
          `Diagnose with the right instrument: the React Profiler (flamegraph, ranked, "why did this render") for render cost; the Performance panel for long tasks, layout and paint; the bundle treemap for load size; the Network panel for waterfalls.`,
          `Apply the fix that matches the cause: code splitting and image work for LCP; restructuring, memoisation, deferring or debouncing for INP; virtualisation for huge lists; reserved dimensions for CLS.`,
          `Measure again with the same steps and compare. Lock the gain in with a budget: a bundle size check in CI, a Profiler-based test, or alerting on field INP/LCP regressions.`
        ]
      },
      ex: [
        {
          t: "Measure the real build, not dev",
          lang: "sh",
          code: `npm run build      # vite build: minified, production React, no Strict Mode double calls
npm run preview    # serves dist/ on http://localhost:4173

# Then in Chrome DevTools:
#  Performance panel -> CPU: 4x slowdown, Network: Fast 4G -> Record -> interact -> Stop
#  Lighthouse panel  -> Mobile -> Analyze page load (LCP, CLS, TBT; lab only)`,
          out: `vite v... building for production...
dist/index.html                   0.46 kB
dist/assets/index-B2c9x1.css      4.10 kB │ gzip:   1.40 kB
dist/assets/index-Dk3l8aQ.js    612.30 kB │ gzip: 189.70 kB
(!) Some chunks are larger than 500 kB after minification.`,
          note: `<p>Vite's own warning about chunks over 500 kB is a useful first signal that code splitting is needed. Sizes shown are illustrative.</p>`
        },
        {
          t: "The &lt;Profiler&gt; component: log slow commits",
          lang: "tsx",
          code: `import { Profiler, type ProfilerOnRenderCallback } from "react";
import { OrdersTable } from "./OrdersTable";

const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (actualDuration > 16) {
    console.warn(
      "[slow commit]",
      { id, phase, actual: actualDuration.toFixed(1), base: baseDuration.toFixed(1), startTime, commitTime }
    );
  }
};

export function OrdersPage() {
  return (
    <Profiler id="OrdersTable" onRender={onRender}>
      <OrdersTable />
    </Profiler>
  );
}`,
          out: `[slow commit] { id: "OrdersTable", phase: "update", actual: "48.2", base: "51.0", ... }`,
          note: `<p><code>actualDuration</code> close to <code>baseDuration</code> means memoisation is not saving anything in this subtree. A large gap means bail-outs are working. In a normal production build, <code>onRender</code> is not called; see the next example.</p>`
        },
        {
          t: "A profiling production build with Vite",
          lang: "ts",
          code: `// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias:
      mode === "profiling"
        ? { "react-dom/client": "react-dom/profiling" } // profiling-enabled renderer
        : {},
  },
}));

// package.json scripts:
//   "build:profile": "vite build --mode profiling"`,
          note: `<p>The profiling build keeps the timing hooks so the DevTools Profiler and <code>&lt;Profiler onRender&gt;</code> work against minified production code. It is slightly slower than the normal build, so do not ship it to all users. Check the React docs for the exact alias for your React version.</p>`
        },
        {
          t: "Collect Web Vitals from real users and send them to FastAPI",
          lang: "ts",
          code: `// npm install web-vitals
// src/vitals.ts
import { onCLS, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

function send(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,        // "LCP" | "INP" | "CLS" | "TTFB"
    value: metric.value,      // ms (CLS is unitless)
    rating: metric.rating,    // "good" | "needs-improvement" | "poor"
    id: metric.id,            // unique per page load, for de-duplication
    navigationType: metric.navigationType,
    path: location.pathname,
  });
  // sendBeacon survives page unload; fall back to fetch keepalive
  if (!navigator.sendBeacon("/api/vitals", body)) {
    void fetch("/api/vitals", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
  }
}

export function reportWebVitals() {
  onLCP(send);
  onINP(send);
  onCLS(send);
  onTTFB(send);
}

// src/main.tsx:  reportWebVitals();  after createRoot(...).render(...)`,
          note: `<p>Note there is no <code>onFID</code>: FID was retired in favour of INP and removed from recent versions of the library. CLS and INP are reported when the page is hidden (tab switch, navigation), which is why <code>sendBeacon</code> is used. <code>sendBeacon</code> with a string body sends <code>text/plain</code>; make the FastAPI endpoint read the raw body.</p>`
        },
        {
          t: "FastAPI endpoint that receives vitals",
          lang: "py",
          code: `# app/routers/vitals.py  (Python, shown for the full picture)
import json
from fastapi import APIRouter, Request

router = APIRouter()

@router.post("/api/vitals", status_code=204)
async def vitals(request: Request) -> None:
    data = json.loads(await request.body())   # accepts text/plain from sendBeacon
    # Push to your metrics system: Prometheus histogram per (name, path),
    # or a Redis stream consumed by a worker that writes to PostgreSQL.
    # Report the 75th percentile per page: that is how Core Web Vitals are judged.`,
          note: `<p>Core Web Vitals thresholds are assessed at the <b>75th percentile</b> of page loads. Aggregating p75 per route and device type turns raw beacons into something you can alert on.</p>`
        },
        {
          t: "Virtualise a 10,000-row list with TanStack Virtual",
          lang: "tsx",
          code: `// npm install @tanstack/react-virtual
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

type Order = { id: string; customer: string; total: number };

export function VirtualOrders({ orders }: { orders: Order[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // px per row
    overscan: 8,            // extra rows above/below the viewport
  });

  return (
    <div ref={parentRef} style={{ height: 480, overflow: "auto" }} role="list">
      {/* Spacer with the full height so the scrollbar is correct */}
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((item) => {
          const order = orders[item.index];
          return (
            <div
              key={order.id}
              role="listitem"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: item.size,
                transform: \`translateY(\${item.start}px)\`,
              }}
            >
              {order.customer}: {order.total.toFixed(2)}
            </div>
          );
        })}
      </div>
    </div>
  );
}`,
          out: `DOM contains ~30 row elements regardless of whether orders has 100 or 100,000 items.
Mount time drops from hundreds of ms to a few ms.`,
          note: `<p>For variable-height rows, pass <code>ref={virtualizer.measureElement}</code> and <code>data-index={item.index}</code> on each row so the virtualiser measures actual sizes. Keys use the data id so React keeps row state attached to the right order while rows are recycled.</p>`
        },
        {
          t: "Code splitting a heavy widget with lazy + Suspense",
          lang: "tsx",
          code: `import { lazy, Suspense, useState } from "react";

// Declared at module level: one lazy component, created once.
// The chart library is only downloaded when RevenueChart first renders.
const RevenueChart = lazy(() => import("./RevenueChart")); // RevenueChart.tsx must "export default"

// Named export? Map it to default:
const PdfViewer = lazy(() =>
  import("./PdfViewer").then((m) => ({ default: m.PdfViewer }))
);

export function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  return (
    <>
      <button
        onClick={() => setShowChart(true)}
        onMouseEnter={() => void import("./RevenueChart")} // prefetch on hover
      >
        Show revenue
      </button>
      {showChart && (
        <Suspense fallback={<div style={{ height: 320 }}>Loading chart…</div>}>
          <RevenueChart />
        </Suspense>
      )}
      <Suspense fallback={<p>Loading viewer…</p>}>
        <PdfViewer />
      </Suspense>
    </>
  );
}`,
          note: `<p>The fallback reserves the chart's height to avoid a layout shift. Calling <code>import()</code> early on hover starts the download; the module cache means the later <code>lazy</code> load reuses it. Add an error boundary (Day 10) around lazy content: chunk loads can fail after a deploy that removed old files.</p>`
        },
        {
          t: "Route-level splitting with React Router v7",
          lang: "tsx",
          code: `import { createBrowserRouter, RouterProvider } from "react-router";
import { RootLayout } from "./RootLayout";
import { HomePage } from "./HomePage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    HydrateFallback: () => <p>Loading…</p>,
    children: [
      { index: true, Component: HomePage }, // in the main bundle
      {
        path: "reports",
        // Loaded only when /reports matches; loader and component arrive together
        lazy: async () => {
          const m = await import("./routes/reports");
          return { Component: m.ReportsPage, loader: m.reportsLoader };
        },
      },
      {
        path: "admin",
        lazy: async () => {
          const { AdminPage } = await import("./routes/admin");
          return { Component: AdminPage };
        },
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}`,
          note: `<p>Each route module becomes its own chunk. Because the router knows which route is matching before rendering, it can fetch the route's code and data in parallel instead of render-then-fetch waterfalls. The exact shape of <code>lazy</code> (function vs per-property object) has evolved in v7; check the docs for your minor version.</p>`
        },
        {
          t: "Bundle analysis with rollup-plugin-visualizer",
          lang: "ts",
          code: `// npm install -D rollup-plugin-visualizer
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "stats.html", // written next to the project root
      template: "treemap",
      gzipSize: true,
      brotliSize: true,
      open: true,             // open in the browser after build
    }),
  ],
});`,
          out: `After "npm run build", stats.html opens: a treemap where each rectangle is a module,
sized by bytes. Typical finds: moment + all locales (~300 kB), a full icon pack,
two versions of the same date library.`,
          note: `<p>Keep the plugin behind an environment flag or a separate script if you do not want the report on every build. Pair it with a CI budget so regressions are caught in pull requests.</p>`
        },
        {
          t: "Images: avoid CLS, prioritise LCP, lazy-load the rest",
          lang: "tsx",
          code: `export function ProductHero() {
  return (
    <img
      src="/img/hero-1200.avif"
      srcSet="/img/hero-600.avif 600w, /img/hero-1200.avif 1200w, /img/hero-2000.avif 2000w"
      sizes="(max-width: 700px) 100vw, 1200px"
      width={1200}
      height={600}            // reserves space: no layout shift
      fetchPriority="high"     // likely the LCP element: fetch it first
      alt="Dashboard showing monthly revenue"
    />
  );
}

export function Thumbnail({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} width={160} height={120} loading="lazy" decoding="async" />;
}`,
          note: `<p>Never <code>loading="lazy"</code> the LCP image: it delays exactly the paint you are measured on. <code>fetchPriority</code> is the React prop for the HTML <code>fetchpriority</code> attribute.</p>`
        },
        {
          t: "Layout thrashing and the fix",
          lang: "ts",
          code: `// BAD: read-write-read-write forces a synchronous layout on every iteration
function equaliseBad(cards: HTMLElement[]) {
  for (const card of cards) {
    const h = card.offsetHeight;           // READ (forces layout)
    card.style.height = h + 20 + "px";      // WRITE (invalidates layout)
  }
}

// GOOD: all reads first, then all writes: one layout
function equaliseGood(cards: HTMLElement[]) {
  const heights = cards.map((c) => c.offsetHeight); // READS
  cards.forEach((c, i) => {
    c.style.height = heights[i] + 20 + "px";        // WRITES
  });
}`,
          note: `<p>In the Performance panel the bad version shows many purple "Layout" blocks with a "Forced reflow" warning. In React this usually appears in <code>useLayoutEffect</code> code that measures elements, or in third-party DOM libraries. Better still, solve sizing with CSS (grid, flex, <code>aspect-ratio</code>).</p>`
        },
        {
          t: "Debouncing a search that calls FastAPI",
          lang: "tsx",
          code: `import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id); // reset the timer on every change
  }, [value, delayMs]);
  return debounced;
}

export function CustomerSearch() {
  const [text, setText] = useState("");
  const q = useDebouncedValue(text, 300);

  const { data, isPending } = useQuery({
    queryKey: ["customers", q],
    queryFn: async ({ signal }) => {
      const res = await fetch(\`/api/customers?q=\${encodeURIComponent(q)}\`, { signal });
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return (await res.json()) as { id: string; name: string }[];
    },
    enabled: q.length >= 2,
  });

  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search customers" />
      {q.length >= 2 && isPending && <p>Searching…</p>}
      <ul>{data?.map((c) => <li key={c.id}>{c.name}</li>)}</ul>
    </>
  );
}`,
          note: `<p>The input stays instant (its own state updates every keystroke), while the request fires only after 300 ms of quiet. Passing <code>signal</code> lets TanStack Query abort superseded requests. For in-memory filtering without a network call, prefer <code>useDeferredValue</code> (Day 12) over a timer.</p>`
        }
      ],
      internals: `<p><b>How the Profiler gets its numbers.</b> In development and profiling builds, React records timestamps around each fiber's render (<code>actualStartTime</code>, <code>actualDuration</code>, <code>selfBaseDuration</code>, <code>treeBaseDuration</code> fields on the fiber). When a commit finishes, React calls <code>onRender</code> for each <code>&lt;Profiler&gt;</code> in the committed tree with the accumulated durations, and notifies the DevTools hook (<code>__REACT_DEVTOOLS_GLOBAL_HOOK__</code>), which snapshots the tree to build flamegraphs. "Why did this render" works by DevTools comparing the previous and current fiber's props, state hooks and context for each component. In the standard production build these fields and calls are compiled out, which is why profiling requires a special build.</p>
<p><b>Why virtualisation works.</b> Rendering cost in React scales with the number of fibers that render, and commit/browser cost scales with the number of DOM nodes inserted, updated and laid out. A virtualiser keeps a small window of indices in state, listens to the scroll container's <code>scroll</code> events (passive) and a <code>ResizeObserver</code>, and recalculates which indices intersect the viewport. Only when the visible range changes does it re-render; React then reconciles a list of ~30 keyed items: some unmounted, some mounted, the rest moved by changing <code>transform</code>, which only affects compositing, not layout.</p>
<p><b>How <code>lazy</code> loads code.</b> <code>lazy(load)</code> returns a special component type holding a status (uninitialised, pending, resolved, rejected). The first time React renders it, it calls <code>load()</code>; while the promise is pending, rendering the lazy component <b>suspends</b> (throws the promise internally), so React shows the nearest <code>&lt;Suspense&gt;</code> fallback and retries when the promise resolves. The result is cached on the lazy object, so later renders are synchronous. On the build side, Vite/Rollup sees the dynamic <code>import()</code> and emits a separate chunk, plus <code>modulepreload</code> hints for that chunk's own dependencies when it loads.</p>
<p><b>Where INP time goes.</b> An interaction's latency = input delay (main thread busy with something else) + processing time (your event handlers, React's render and commit for the resulting update) + presentation delay (style, layout, paint of the next frame). React state updates from discrete events (clicks, key presses) are processed synchronously at high priority, so a slow render directly adds to processing time. Transitions (Day 12) mark updates as interruptible so React can yield to the browser between fibers, letting the next frame paint sooner.</p>
<p><b>Dev vs prod differences in React.</b> The development build adds prop-type and key warnings, component stack tracking, Strict Mode double invocation of renders, initialisers and effects, and DevTools/profiling instrumentation; the production build strips them via <code>process.env.NODE_ENV</code> checks that the bundler replaces and dead-code-eliminates. Vite dev also serves hundreds of unbundled modules over the network. These are why dev timings can be several times slower than production.</p>`,
      prod: `<p>In a React → FastAPI → Redis → PostgreSQL product, performance work sits across the stack, and the frontend lead must know which layer owns each metric.</p>
<ul class="pts">
<li><b>LCP</b> is usually dominated by the JavaScript bundle (a client-rendered SPA shows nothing until it executes), the first API call (<code>/api/me</code> and the dashboard query), and the hero image. Fixes: route-level splitting, a CDN with long-cache hashed assets and Brotli compression (Day 15), starting critical fetches early (route loaders or prefetching in parallel with code, not in a <code>useEffect</code> after render), Redis-cached API responses so TTFB is low, and SSR/streaming for public pages (Day 13).</li>
<li><b>INP</b> is dominated by your components: heavy tables and charts re-rendering on input, synchronous filtering of large arrays, third-party scripts (analytics, chat widgets) competing for the main thread. Fixes: today's memo/structure work, virtualisation, transitions/deferred values, debouncing, moving work to the server or a Web Worker.</li>
<li><b>CLS</b> comes from images without dimensions, skeletons that do not match content height, banners/cookie bars injected at the top, and late web fonts.</li>
<li><b>Monitoring</b>: send <code>web-vitals</code> beacons to FastAPI (or use a RUM product such as Sentry, Datadog or a similar service) and chart p75 per route, device class and release. Alert on regressions after deploys. Correlate slow INP with the interaction target (the attribution build of <code>web-vitals</code> reports which element and which phase was slow).</li>
<li><b>Budgets in CI</b>: fail a PR if the main chunk grows beyond a threshold; run Lighthouse CI on key pages; keep a small set of Profiler-based benchmarks for critical components (the orders grid with 1,000 rows must commit an update in under X ms on CI hardware, tracked as a trend rather than a strict gate because CI timing is noisy).</li>
<li><b>What goes wrong at scale</b>: a deploy removes old chunks and users with an open tab get "Failed to fetch dynamically imported module" when navigating; handle it with an error boundary that offers a reload (or a router-level retry). Over-splitting causes request waterfalls on slow networks. Virtualised tables break browser search and screen readers if not designed for them. Teams optimise lab Lighthouse scores while field INP stays poor because real users have slower devices and more data.</li>
</ul>`,
      iq: [
        ["fresher", "What is code splitting and how do you do it in React?", "Splitting the JavaScript into chunks so users download only what the current page needs. In React you use <code>lazy(() =&gt; import(\"./Page\"))</code> with a <code>&lt;Suspense fallback&gt;</code>; the bundler (Vite) turns each dynamic <code>import()</code> into a separate file loaded on demand. The best place is at route level, since each page is a natural boundary. It improves initial load (LCP) at the cost of a short wait when the chunk is first needed."],
        ["fresher", "What are LCP, INP and CLS?", "Core Web Vitals. <b>LCP</b>: when the largest visible content element painted (good ≤ 2.5 s); measures loading. <b>INP</b>: latency from user interactions to the next paint, roughly the worst across the visit (good ≤ 200 ms); measures responsiveness. <b>CLS</b>: how much visible content shifts unexpectedly (good ≤ 0.1); measures visual stability. INP replaced FID, which only measured the delay before the first interaction's handler started."],
        ["mid", "How do you find out why a component re-rendered?", "React DevTools Profiler: enable \"Record why each component rendered while profiling\", record the interaction, select the commit, hover the component: it shows \"props changed (x, y)\", \"hooks changed\", \"context changed\" or \"parent rendered\". The flamegraph shows what rendered, the ranked view shows the slowest. \"Highlight updates\" gives a quick visual. Logging in the component body works too but is noisy and doubled by Strict Mode in dev."],
        ["mid", "A page shows 10,000 rows and scrolling and filtering are slow. Will <code>React.memo</code> fix it?", "Not really. Memo can skip re-rendering unchanged rows, but you still mount and keep 10,000 row components and tens of thousands of DOM nodes, which makes the first render, memory, layout and scrolling slow. The fix is virtualisation (TanStack Virtual or react-window): render only visible rows plus overscan. Often combine it with server-side pagination/filtering in FastAPI so the client does not hold all rows at all. Memo on the rows is a useful complement, not the solution."],
        ["mid", "Why can you not trust performance measurements from <code>npm run dev</code>?", "The development build of React includes warnings, extra checks and Strict Mode double rendering and double effects; it is not minified; Vite serves unbundled modules; and DevTools instrumentation adds overhead. It can be several times slower. Measure with <code>vite build</code> + <code>vite preview</code> and CPU throttling, and use a profiling build if you need the React Profiler against production code."],
        ["senior", "What does the <code>&lt;Profiler&gt;</code> component's <code>actualDuration</code> vs <code>baseDuration</code> tell you?", "<code>actualDuration</code> is the time spent rendering the subtree in this commit; <code>baseDuration</code> estimates the cost of rendering the whole subtree with no memoisation (the sum of the most recent render times of every component). If actual ≈ base on updates, memoisation is not helping; if actual is much lower, bail-outs work. <code>onRender</code> only fires in development or a profiling build, so production use needs the <code>react-dom/profiling</code> alias and sampling."],
        ["senior", "INP is poor on the search page but the React Profiler shows commits of only 20 ms. Where do you look next?", "INP includes input delay and presentation delay, not just React render. Use the Performance panel on a throttled production build: look for long tasks before the handler (third-party scripts, a timer, a JSON parse), the handler itself (synchronous filtering, sorting), forced layouts in effects (layout thrash), heavy style recalculation from a large DOM, and paint cost. Field attribution from <code>web-vitals</code> shows which element and phase are slow. Fixes range from yielding (transitions, splitting work) to removing third-party script cost."],
        ["senior", "How would you handle a \"failed to fetch dynamically imported module\" error after a deploy?", "It happens when an open tab references chunk names from the previous deploy that the server no longer has. Mitigations: keep old hashed assets on the CDN for a while (do not delete on deploy); wrap lazy routes in an error boundary or router <code>errorElement</code> that offers or performs a one-time reload; detect new versions (a version endpoint or a service worker) and refresh at the next navigation. Retrying the same import usually fails because the browser caches the failed module."],
        ["lead", "How would you set up performance governance for a team building a large React dashboard?", "Define budgets (initial JS gzip size, LCP/INP p75 targets per key route). Enforce in CI: bundle size checks, Lighthouse CI on critical pages, visualizer reports on PRs that add dependencies. Monitor in production with <code>web-vitals</code> RUM per route and release, with alerts on regressions. Provide patterns: route-level lazy loading, a virtualised table component in the design system, image component with dimensions, lint rules for hooks. Review dependencies before adding them. Make performance part of the definition of done, not a quarterly firefight."],
        ["architect", "A client-rendered React + FastAPI app has a 4 s LCP on mobile. Walk through your approach.", "Measure field p75 by route and device first; in the lab, use a throttled production build and look at the waterfall. Typical chain: HTML → large JS bundle → render → <code>useEffect</code> fetch → API → render content → hero image. Fix each link: cut and split the bundle (route-level lazy, remove heavy deps), start data fetching in parallel with code (route loaders, prefetch, or preload hints), make the API fast (Redis cache, PostgreSQL indexes, compress responses, CDN with HTTP/2 or HTTP/3), prioritise and size the LCP image. If the page is public or SEO-sensitive, consider SSR/streaming or static generation (Day 13) so HTML contains content before JS runs. Re-measure after each step."],
        ["architect", "When would you choose virtualisation, pagination or infinite scroll for a large dataset?", "Pagination: users need to jump to pages, share URLs, or data is huge and queried with filters (FastAPI + PostgreSQL keyset pagination scale best). Infinite scroll: feed-like browsing; combine with virtualisation so the DOM does not grow forever, and keep scroll position on back navigation. Virtualisation alone (all data client-side): datasets of thousands of rows that are already loaded and need fast scroll, sort and selection, for example a spreadsheet-like grid. Consider accessibility, find-in-page and printing, which virtualisation weakens."]
      ],
      gotchas: [
        "The React DevTools Profiler and <code>&lt;Profiler onRender&gt;</code> do nothing in a normal production build; you need a profiling build (<code>react-dom/profiling</code> alias), and that build is slightly slower.",
        "Strict Mode double-renders in development, so render counts and timings in dev are inflated and logs appear twice; compare like with like.",
        "<code>lazy</code> must be called at module top level. Calling it inside a component creates a new lazy type every render, which remounts the subtree and re-suspends forever.",
        "<code>lazy</code> expects a module with a <b>default</b> export; for named exports map them: <code>.then(m =&gt; ({ default: m.Name }))</code>.",
        "Lazy-loading the LCP image or the above-the-fold route defeats the purpose; split what is not needed for the first paint.",
        "Virtualised lists lose browser find-in-page and can confuse screen readers; rows recycled with index keys can show the wrong state.",
        "Lighthouse does not measure INP (it reports Total Blocking Time as a lab proxy); INP needs real interactions, ideally from field data.",
        "Debouncing with a timer inside a component without cleanup fires stale callbacks after unmount; always clear the timeout in the effect cleanup."
      ],
      best: [
        "Measure → fix → measure again, on a production build with CPU throttling, and keep the before/after numbers in the PR.",
        "Track LCP, INP and CLS from real users with <code>web-vitals</code>, aggregated at p75 per route and release, with alerts on regressions.",
        "Split at the route level first, then lazy-load heavy rarely used widgets; prefetch likely next routes on hover or idle; wrap lazy content in error boundaries.",
        "Run a bundle treemap whenever a dependency is added, and enforce a bundle size budget in CI.",
        "Virtualise lists beyond a few hundred rows, and paginate/filter on the FastAPI side when the dataset is large.",
        "Give every image dimensions, serve responsive modern formats, lazy-load below-the-fold images and prioritise the LCP image.",
        "Keep input handlers light: debounce network calls, defer heavy renders (Day 12), and batch DOM reads before writes."
      ],
      lab: [
        "In your Vite app, run <code>npm run build &amp;&amp; npm run preview</code>. Open Lighthouse (mobile) and record LCP, CLS and Total Blocking Time. Note the JS chunk sizes printed by the build.",
        "Install <code>rollup-plugin-visualizer</code>, add it to <code>vite.config.ts</code>, rebuild and open <code>stats.html</code>. Identify the three largest modules.",
        "Convert two routes (for example Reports and Settings) to lazy routes with React Router's <code>lazy</code>, or <code>lazy()</code> + <code>&lt;Suspense&gt;</code>. Rebuild and confirm new chunks appear and the main chunk shrank.",
        "Render 10,000 fake orders in a plain list; record mount and scroll in the Performance panel with 4x CPU throttling. Then replace it with the <code>useVirtualizer</code> version and record again.",
        "Install <code>web-vitals</code>, add <code>reportWebVitals()</code> that logs (or posts to <code>/api/vitals</code>) LCP, INP and CLS; click around and switch tabs to see INP and CLS reported.",
        "<b>Done when:</b> you have a short table of before/after numbers (main chunk size, LCP from Lighthouse, mount time and DOM node count for the list, logged INP) and every change in it is backed by a measurement."
      ],
      teach: `<p>"Performance work starts with measurement, and on a production build, because the dev build with Strict Mode is much slower. For React rendering I use the DevTools Profiler: the flamegraph shows what rendered, the ranked view shows the slowest component, and the 'why did this render' setting tells me which prop or hook changed. The <code>&lt;Profiler&gt;</code> component gives the same numbers in code. For everything outside React (layout, paint, long tasks) I use Chrome's Performance panel.</p>
<p>What users feel is captured by Web Vitals: LCP for loading, INP for responsiveness (it replaced FID), and CLS for layout shifts. I collect them from real users with the <code>web-vitals</code> library and look at the 75th percentile.</p>
<p>Then I match the fix to the cause. Slow load: code splitting with <code>lazy</code> and <code>Suspense</code>, ideally per route, plus a bundle treemap to remove heavy dependencies, and properly sized images. Slow interactions: restructure or memoise the expensive components, debounce network calls, and use transitions. Huge lists: virtualise, so only the visible rows exist in the DOM. Then I measure again to prove it helped."</p>`
    }
  ],
  quiz: [
    {
      q: "The developer wrapped <code>ProductGrid</code> in <code>React.memo</code>, but the Profiler shows it re-renders every time the cart count changes. Why, and what is the smallest fix?",
      code: `const ProductGrid = memo(function ProductGrid({ products, filters }: {
  products: Product[];
  filters: { inStock: boolean; sort: "price" | "name" };
}) {
  /* renders 300 product cards */
});

function Shop({ products }: { products: Product[] }) {
  const [cartCount, setCartCount] = useState(0);
  return (
    <>
      <CartBadge count={cartCount} onAdd={() => setCartCount((c) => c + 1)} />
      <ProductGrid products={products} filters={{ inStock: true, sort: "price" }} />
    </>
  );
}`,
      lang: "tsx",
      ans: "<code>filters</code> is an inline object, a new reference on every <code>Shop</code> render, so the shallow comparison fails. Hoist it to a module constant (or <code>useMemo</code> it if it depends on state).",
      why: "<code>memo</code> compares each prop with <code>Object.is</code>. <code>products</code> is stable (same prop from the parent), but <code>{ inStock: true, sort: \"price\" }</code> is created fresh each render. Since the values are constant, <code>const DEFAULT_FILTERS = { inStock: true, sort: \"price\" } as const;</code> outside the component is the cleanest fix. Alternatively, move <code>cartCount</code> state down into the cart area so <code>Shop</code> does not re-render at all."
    },
    {
      q: "A code review finds this. What would you say?",
      code: `function OrderHeader({ order }: { order: Order }) {
  const title = useMemo(() => "Order #" + order.id, [order.id]);
  const isPaid = useMemo(() => order.status === "paid", [order.status]);
  const handleClick = useCallback(() => console.log(order.id), [order.id]);
  return <h2 onClick={handleClick}>{title} {isPaid && "✓"}</h2>;
}`,
      lang: "tsx",
      ans: "Remove all three. They memoise trivial work and a handler passed to a plain DOM element, so they add overhead and noise without benefit.",
      why: "String concatenation and a comparison take nanoseconds; the dependency comparison and hook bookkeeping cost about the same or more. <code>useCallback</code> only helps when the function's identity matters to a consumer (a <code>memo</code> child or an effect dependency); <code>&lt;h2 onClick&gt;</code> does not care. Keep <code>useMemo</code> for measurably expensive calculations or for references that must stay stable. With the React Compiler enabled, none of this would be written by hand anyway."
    },
    {
      q: "An admin page renders all 10,000 audit log rows from <code>/api/audit</code>. Scrolling is janky and the first render takes almost a second. A teammate proposes wrapping <code>AuditRow</code> in <code>memo</code>. Which approach would you choose?",
      ans: "Virtualise the list (for example TanStack Virtual's <code>useVirtualizer</code>) and, ideally, paginate or filter on the FastAPI side. Memo alone will not fix it.",
      why: "The cost is the sheer number of components and DOM nodes: mounting 10,000 rows, keeping them in memory, and laying them out on scroll. <code>memo</code> only skips <i>re-renders</i> of unchanged rows; it does nothing for the initial mount or DOM size. Virtualisation keeps ~30-50 rows in the DOM at any time. Server-side pagination (keyset pagination in PostgreSQL) or <code>useInfiniteQuery</code> reduces the data transferred too. Memo on rows can be a complement once virtualised."
    },
    {
      q: "What does this log when you click the button three times (production build), and why?",
      code: `const Child = memo(function Child({ children }: { children: ReactNode }) {
  console.log("Child render");
  return <div>{children}</div>;
});

export function Parent() {
  const [n, setN] = useState(0);
  return (
    <>
      <button onClick={() => setN(n + 1)}>{n}</button>
      <Child>
        <span>static text</span>
      </Child>
    </>
  );
}`,
      lang: "tsx",
      ans: "\"Child render\" four times: once on mount and once per click. <code>memo</code> does not help because <code>children</code> is a new element each time.",
      why: "JSX <code>&lt;span&gt;static text&lt;/span&gt;</code> compiles to a <code>jsx()</code> call that returns a new object every time <code>Parent</code> renders, so <code>children</code> fails the <code>Object.is</code> check. Fixes: hoist the element (<code>const label = &lt;span&gt;static text&lt;/span&gt;;</code> at module level), <code>useMemo</code> it, or restructure so the stateful button is a separate component and <code>Parent</code> does not re-render. The React Compiler would cache that JSX element automatically. (In development with Strict Mode you may also see the log doubled per render.)"
    },
    {
      q: "After adding <code>const Settings = lazy(() =&gt; import(\"./Settings\"))</code> <i>inside</i> the <code>App</code> component body, the settings page flickers its loading fallback and loses form input whenever <code>App</code> re-renders. What is wrong?",
      code: `export function App() {
  const [theme, setTheme] = useState("light");
  const Settings = lazy(() => import("./Settings"));
  return (
    <Suspense fallback={<Spinner />}>
      <Settings theme={theme} onTheme={setTheme} />
    </Suspense>
  );
}`,
      lang: "tsx",
      ans: "<code>lazy</code> is called on every render, creating a new component type each time, so React unmounts and remounts <code>Settings</code> (losing state) and suspends again. Move the <code>lazy</code> call to module top level.",
      why: "React decides whether to keep a component's state by comparing element <code>type</code>s. A new lazy object per render is a different type, so the old subtree is destroyed and the new lazy component starts in the pending state, showing the fallback until the (cached) module resolves. Declaring <code>const Settings = lazy(...)</code> once at module scope gives a stable type; the chunk loads once and later renders are synchronous."
    },
    {
      q: "Your monitoring shows good Lighthouse scores, but field data has INP p75 of 450 ms on the orders page. A teammate says \"Lighthouse is green, so it is fine.\" How do you respond and what do you do?",
      ans: "Field data wins. Lighthouse runs on a simulated load without real interactions and cannot measure INP. Investigate with <code>web-vitals</code> attribution and a throttled production-build trace of the slow interaction.",
      why: "Lighthouse reports Total Blocking Time as a lab proxy; INP depends on real interactions on real devices with real data volumes. Use the attribution build of <code>web-vitals</code> to see which element and phase (input delay, processing, presentation) is slow, reproduce with 4-6x CPU throttling on <code>vite build</code> + <code>preview</code>, then profile with the React Profiler and Performance panel. Typical fixes: restructure/memoise the heavy table, virtualise, debounce the filter call, defer the heavy render with a transition (Day 12), and remove third-party script work from the main thread."
    }
  ]
},
/* ===== Day 12 ===== */
{
  n: 12,
  title: "React internals",
  goal: `<b>By the end of today</b> you can draw the fiber tree, walk through the work loop (<code>beginWork</code> / <code>completeWork</code>), explain why the render phase can be interrupted but the commit phase cannot, and say how lanes decide what React renders first. You can also use <code>useTransition</code>, <code>useDeferredValue</code>, Suspense boundaries and <code>useSyncExternalStore</code> to keep a big FastAPI-backed screen responsive, and explain what "concurrent" does and does not mean.`,
  rev: [
    `<b>Fiber</b> (React 16+) replaced the recursive stack reconciler. A fiber is a plain object per component or host node, linked by <code>child</code> / <code>sibling</code> / <code>return</code>. It holds <code>type</code>, <code>key</code>, <code>stateNode</code>, <code>pendingProps</code> / <code>memoizedProps</code>, <code>memoizedState</code> (for function components, the head of the hook list), <code>flags</code>, <code>lanes</code> and <code>alternate</code>. Because the tree is a linked list, React walks it with a loop it can pause, instead of recursion it cannot.`,
    `<b>Double buffering:</b> <code>current</code> is the tree on screen; <code>workInProgress</code> is built from it through <code>alternate</code>. The <b>render phase</b> (<code>beginWork</code> going down, <code>completeWork</code> coming up) is pure and can be paused, restarted or thrown away. The <b>commit phase</b> runs synchronously: before mutation, mutation (DOM writes), swap <code>root.current</code>, layout (<code>useLayoutEffect</code>, refs). Passive effects (<code>useEffect</code>) run after that.`,
    `<b>Diffing heuristics, O(n):</b> different <code>type</code> means throw away the subtree and rebuild it; the same type at the same position (or with the same <code>key</code>) means reuse the fiber and its state. Hooks are a linked list on the fiber, matched by call order, and that is the reason for the rules of hooks. <b>Lanes</b> are bits in a 31-bit mask. Discrete input (click, keypress) is the most urgent, then continuous input, then default, then transitions, then idle. The <b>Scheduler</b> yields to the browser every few milliseconds.`,
    `<b>Concurrent features:</b> <code>startTransition</code> / <code>useTransition</code> mark an update as non-urgent: it can be interrupted, it shows <code>isPending</code>, and it keeps the old UI instead of falling back to Suspense. <code>useDeferredValue(value)</code> renders an urgent pass with the old value, then a background pass with the new one. Neither one debounces network requests. You can't drive a controlled input's own value from a transition.`,
    `<b>Suspense</b> shows the nearest boundary's fallback while children wait (lazy code, <code>use(promise)</code>, <code>useSuspenseQuery</code>); nest boundaries to reveal UI in stages, and use <code>key</code> to reset. <b>Tearing</b> happens when an external store changes during an interruptible render. <code>useSyncExternalStore</code> prevents it by forcing a synchronous re-render. Concurrency is <b>not</b> multithreading: one main thread, with cooperative yields between fibers.`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d12-fiber",
      title: "Fiber: the work loop, reconciliation and lanes",
      lv: ["mid", "senior", "lead", "architect"],
      eli5: `<p>Imagine you are painting a mural and someone keeps asking you questions. With the old method, you had to finish the <i>whole</i> mural before you could answer anyone, so they stood there waiting while you painted. React's old reconciler worked like this: once it started updating the page, it couldn't stop until it was done, and the browser had to wait, including for your keystrokes.</p>
<p>With Fiber, React writes each part of the job on its own sticky note ("paint the header", "paint the list", "paint item 3") and keeps the notes linked in order. Now it can do a few notes, look up, answer a question (handle a click or keypress), and then carry on from exactly the note where it stopped. If the plan changes halfway through, it can throw the unfinished notes away and start again.</p>
<p>It also has two canvases. The one on the wall is what visitors see (the <b>current</b> tree). It paints the next version on a second canvas in the back room (the <b>work-in-progress</b> tree). Only when that one is completely finished does it swap them in one quick move. Visitors never see half a painting.</p>
<p>Finally, some notes are marked <b>urgent</b> (someone typed a letter) and some are <b>can wait</b> (re-sort a big list). React always does the urgent notes first. These priority marks are called <b>lanes</b>.</p>`,
      what: `<p><b>Fiber</b> is the name of React's reconciler architecture (since React 16) and of the data structure it is built on. A <b>fiber</b> is a plain JavaScript object that represents one unit of work. There is one fiber for each component instance, host element (<code>&lt;div&gt;</code>), text node, fragment, Suspense boundary, context provider and so on. Fibers form a tree, but it is stored as a <b>linked list</b>: each fiber points to its first <code>child</code>, its next <code>sibling</code> and its parent (<code>return</code>).</p>
<p><b>A warning before the details:</b> everything below describes React's <i>implementation</i>, not its public API. Field names, phase boundaries and lane constants have changed between React 16, 17, 18 and 19, and they will keep changing. Learn the <i>model</i>: interviews test the model, and it is what predicts behaviour. Don't write code that depends on these internals.</p>
<h5>The fields worth knowing</h5>
<ul class="pts">
<li><b><code>tag</code></b>: what kind of fiber this is (FunctionComponent, HostComponent, HostText, HostRoot, SuspenseComponent, ContextProvider, and so on). The reconciler switches on it.</li>
<li><b><code>type</code></b> and <b><code>key</code></b>: for a component, the function itself (<code>App</code>); for a host element, the string <code>'div'</code>. Together with the position, these two decide whether a fiber can be reused on the next render.</li>
<li><b><code>stateNode</code></b>: the "real thing" behind the fiber. For a host fiber that is the DOM node; for a class component it is the instance; for the root it is the <code>FiberRoot</code>. Function components have none.</li>
<li><b><code>child</code>, <code>sibling</code>, <code>return</code></b>: the linked-list tree. <code>return</code> is named that way because it is where work "returns to" when a fiber is finished, like a return address on a call stack.</li>
<li><b><code>pendingProps</code> / <code>memoizedProps</code></b>: the props this render was started with, and the props used last time it finished. If they are the same object and nothing else changed, React can <b>bail out</b> and skip the fiber.</li>
<li><b><code>memoizedState</code></b>: for a function component, the <b>head of its hook linked list</b>. Each hook node holds its own state and a <code>next</code> pointer. For a class it is <code>this.state</code>; for the root it holds the rendered element.</li>
<li><b><code>updateQueue</code></b>: pending updates (for classes and the root), and for function components the list of effects to run.</li>
<li><b><code>flags</code></b> (called <code>effectTag</code> before React 17) and <b><code>subtreeFlags</code></b>: bit flags for the work needed at commit, such as <code>Placement</code> (insert), <code>Update</code>, <code>ChildDeletion</code>, <code>Ref</code> and <code>Passive</code> (has a <code>useEffect</code>). <code>subtreeFlags</code> (React 18+) lets the commit phase skip clean subtrees. It replaced the older "effect list".</li>
<li><b><code>lanes</code> / <code>childLanes</code></b>: bitmasks of pending update priorities on this fiber, and anywhere below it. If both are empty, the whole subtree can be skipped.</li>
<li><b><code>alternate</code></b>: the link between a fiber and its counterpart in the other tree (current ⇄ workInProgress).</li>
</ul>
<h5>Two trees: current and workInProgress (double buffering)</h5>
<p>React keeps at most two versions of each fiber. The <b>current</b> tree describes what is on screen. When an update is scheduled, React builds a <b>workInProgress</b> tree. For every fiber it touches, it calls <code>createWorkInProgress(current)</code>, which reuses <code>current.alternate</code> if one exists (so React isn't allocating a new tree every render), copies the fields, and applies the new props. When the workInProgress tree is complete and committed, the root pointer flips: <code>root.current = finishedWork</code>. The old current tree becomes the alternate pool for the next render. This is the same idea as double buffering in graphics: draw off-screen, then swap.</p>
<h5>The work loop</h5>
<p>Rendering is a depth-first walk, written as a <b>loop</b>, not as recursion:</p>
<ul class="pts">
<li><b><code>performUnitOfWork(fiber)</code></b> calls <b><code>beginWork</code></b>. For a function component that means calling the component with its props (running the hooks) and <b>reconciling</b> the returned elements against the old child fibers. It returns the first child, if there is one.</li>
<li>When a fiber has no child, React calls <b><code>completeUnitOfWork</code></b>, which runs <b><code>completeWork</code></b>. For a host element on mount, this creates the DOM node and appends the already-created child DOM nodes to it, off-screen. On update, it works out which DOM props changed. It also bubbles <code>subtreeFlags</code> and <code>childLanes</code> up. Then React moves to the <code>sibling</code>, or climbs to <code>return</code> and completes that.</li>
<li>Two variants of the loop exist. <code>workLoopSync</code> runs until the tree is done. <code>workLoopConcurrent</code> checks <code>shouldYield()</code> between fibers and stops when its time slice is used up. The slice is about 5 ms by default, though the exact value is an implementation detail. Because the "stack" is just the fiber pointers, stopping means remembering one variable (<code>workInProgress</code>) and resuming later.</li>
</ul>
<h5>Render phase vs commit phase</h5>
<ul class="pts">
<li><b>Render phase</b> (<code>beginWork</code>/<code>completeWork</code>): calls your components and computes changes. It must be <b>pure</b>, because React may pause it, restart it from scratch when a higher-priority update arrives, or throw the result away entirely. Nothing in this phase is visible to the user.</li>
<li><b>Commit phase</b>: applies the result. It runs <b>synchronously and cannot be interrupted</b>, because a half-applied DOM would be inconsistent. In current versions it has three sub-phases. <b>Before mutation</b> reads the DOM before it changes (<code>getSnapshotBeforeUpdate</code>). <b>Mutation</b> inserts, updates and removes DOM nodes, detaches old refs, runs <code>useInsertionEffect</code> and cleans up layout effects. Then <code>root.current</code> is swapped. <b>Layout</b> attaches refs and runs <code>useLayoutEffect</code> setups and <code>componentDidMount/Update</code>, before the browser paints. <b>Passive effects</b> (<code>useEffect</code>) are scheduled to run afterwards, normally after paint. React 18+ flushes them synchronously for updates caused by discrete input such as clicks.</li>
</ul>
<h5>Reconciliation: the diffing heuristics</h5>
<p>A general algorithm that finds the minimum edits between two trees is about O(n³). React gets O(n) by making two assumptions (introduced on Day 4; here is the mechanism):</p>
<ul class="pts">
<li><b>Different <code>type</code> means a different tree.</b> If <code>&lt;UserPanel&gt;</code> becomes <code>&lt;AdminPanel&gt;</code>, or <code>&lt;div&gt;</code> becomes <code>&lt;section&gt;</code>, at the same position, React does not compare their children. It deletes the old subtree (unmounting it and losing its state) and mounts the new one.</li>
<li><b>Keys identify children among siblings.</b> <code>reconcileChildrenArray</code> first walks old and new children in parallel while their keys match. On the first mismatch, it puts the remaining old fibers into a <code>Map</code> by key (or by index if they have no key) and looks each new child up there. A fiber with the same key and type is reused and keeps its state. Old fibers that are never matched get deleted.</li>
<li><b>Moves are detected with one index</b> (<code>lastPlacedIndex</code>). A reused fiber whose old index is lower than the last placed one is marked to move. That is cheap, but moving the <i>last</i> item to the front makes React move every other node instead of just one.</li>
<li>Diffing only compares <b>siblings at the same level</b>. It never notices that a subtree moved to a different parent; that becomes a delete plus an insert.</li>
</ul>
<h5>Hooks are a linked list on the fiber</h5>
<p>When a function component renders, React sets a "current fiber" and a dispatcher: a mount version of the hooks the first time, an update version afterwards. The first time, each <code>useState</code>/<code>useEffect</code>/<code>useMemo</code> call <b>appends</b> a hook node to <code>fiber.memoizedState</code>. On later renders, each call takes the <b>next node in the list</b>. Nothing identifies a hook except its <b>position</b>. Call hooks conditionally and the second render takes the wrong nodes: <code>useState('Pune')</code> receives the node that belonged to <code>useState(31)</code>. React checks for this in development and throws "Rendered more/fewer hooks than during the previous render", and the lint rule catches it earlier. That is the reason for the <b>rules of hooks</b>: call them at the top level, in the same order, every render.</p>
<h5>The Scheduler and lanes</h5>
<ul class="pts">
<li>The <b>Scheduler</b> is a separate package (<code>scheduler</code>). It keeps a priority queue (a min-heap) of tasks and runs them in small chunks, scheduling the next chunk as a macrotask, with <code>MessageChannel</code> in browsers. It does <b>not</b> use <code>requestIdleCallback</code>: that fires too rarely and its timing is unpredictable.</li>
<li><b>Lanes</b> are React's priority model inside the reconciler (React 17+, replacing "expiration times"). A lane is one bit in a 31-bit integer, and a set of lanes is a bitmask, so "merge", "contains" and "most urgent" are single bitwise operations. From most to least urgent, the lane groups are roughly: <code>SyncLane</code> (discrete events: click, keydown), <code>InputContinuousLane</code> (pointer move, scroll), <code>DefaultLane</code> (updates outside events, such as fetch callbacks and timers), several <code>TransitionLanes</code>, <code>RetryLanes</code> (Suspense retries), <code>IdleLane</code>, and <code>OffscreenLane</code> (hidden content). The exact list and the number of transition lanes differ by version.</li>
<li>When you call <code>setState</code>, React picks a lane from the context: inside a click handler it is discrete, inside <code>startTransition</code> it is a transition. React marks the fiber's <code>lanes</code> and the <code>childLanes</code> of every ancestor, then schedules the root. Each render works on the highest-priority lanes that are pending. If an urgent update arrives during a transition render, React <b>abandons</b> the work-in-progress, renders the urgent update, and then restarts the transition.</li>
<li><b>Starvation:</b> a lane that keeps getting interrupted eventually <b>expires</b>, and React then renders it synchronously so that it can't wait forever. Lanes that belong together can be <b>entangled</b> so they always render together.</li>
</ul>`,
      why: `<p>Before React 16, the reconciler was the <b>stack reconciler</b>. It walked the element tree with ordinary recursive function calls: <code>updateComponent</code> → render → <code>updateChildren</code> → ... Recursion uses the JavaScript call stack, and you can't pause a call stack halfway, save it, run something else and come back. So once an update began, React had to finish reconciling the whole tree before the browser could handle input or paint. A 2,000-row table that took 120 ms to reconcile blocked the main thread for 120 ms. Typing stuttered, animations dropped frames, and nothing else could take priority.</p>
<p>The React team wanted several features that recursion made impossible:</p>
<ul class="pts">
<li><b>Interruptible rendering:</b> split the work into units and yield to the browser between them.</li>
<li><b>Priorities:</b> a keystroke should overtake a background re-render of a list.</li>
<li><b>Discardable work:</b> start rendering a new screen, abandon it if the user changes their mind, and never show half of it.</li>
<li><b>Suspense:</b> stop rendering a subtree that is waiting for data or code, show a fallback, and resume later.</li>
<li><b>Returning arrays and fragments, portals, and error boundaries</b>: easier to support with a uniform fiber model.</li>
</ul>
<p>Fiber is essentially a <b>re-implementation of the call stack as a heap-allocated linked list</b> that React controls. Each fiber is like a stack frame (function, arguments = props, local state = hooks, return address = <code>return</code>), but React decides when to start, pause, resume or drop it. Fiber shipped in React 16, but the reconciler still ran synchronously by default for years. Time-slicing and priorities became user-visible only through the concurrent features of React 18 (<code>createRoot</code>, transitions). That is the subject of the next topic.</p>`,
      diagram: {
        html: flow([
          ["setState / root.render", "React picks a lane (Sync, Default, Transition...) and marks the fiber and its ancestors", "w"],
          ["Render phase", "work loop: beginWork down, completeWork up; builds workInProgress from current via alternate", "g"],
          ["Yield?", "concurrent lanes: check shouldYield() between fibers; higher-priority update restarts the work", "w"],
          ["Commit phase", "synchronous: before mutation, mutation (DOM), swap root.current, layout (refs, useLayoutEffect)", "r"],
          ["Passive effects", "useEffect cleanups then setups, normally after paint", ""]
        ], { v: true }) +
        lanes([
          ["current (on screen)", ["HostRoot", "App", "ul", "Item key=a / Item key=b", "flags: none"]],
          ["workInProgress (being built)", ["HostRoot (alternate)", "App (alternate)", "ul (alternate)", "Item key=b (reused), Item key=c (Placement)", "Item key=a: ChildDeletion on ul"]],
          ["Fiber links", ["child: first child only", "sibling: next child", "return: parent", "alternate: twin in the other tree", "memoizedState: hook 1 → hook 2 → ..."]]
        ]),
        steps: [
          `An update arrives. React picks a <b>lane</b> from the context (a click is discrete, <code>startTransition</code> is a transition), adds it to the fiber's <code>lanes</code> and its ancestors' <code>childLanes</code>, and asks the Scheduler to process the root.`,
          `<b>beginWork</b> runs top-down. Fibers with no pending lanes and unchanged props <b>bail out</b> (and skip their whole subtree if <code>childLanes</code> is empty too). Components that need rendering are called, and their returned elements are diffed against the old child fibers by type and key.`,
          `<b>completeWork</b> runs bottom-up. It creates or updates DOM nodes off-screen and bubbles <code>subtreeFlags</code> and <code>childLanes</code> to the parent. In a concurrent render, React checks <code>shouldYield()</code> after each fiber and pauses if the slice is used up. An urgent update can make it throw this tree away and start again.`,
          `When the root completes, <b>commit</b> runs in one synchronous pass. It applies DOM mutations, flips <code>root.current</code> to the finished tree, then runs layout effects and attaches refs. The browser paints.`,
          `Passive effects (<code>useEffect</code>) run. Any state they set schedules a new update, and the cycle starts again. The old current tree is now the alternate, and React reuses its objects next time.`
        ]
      },
      ex: [
        {
          t: "A runnable mini reconciler (simplified model, run with Node)",
          lang: "js",
          code: `// mini-fiber.js: a SIMPLIFIED teaching model of React's Fiber reconciler.
// Not React's real code. No hooks, lanes, bailouts or moves; "commit" logs instead of touching a DOM.
const Placement = 1, Update = 2, Deletion = 4;

function h(type, props, ...children) {
  const { key = null, ...rest } = props || {};
  const kids = children.flat().map(c => typeof c === 'object' ? c
    : { type: 'TEXT', key: null, props: { nodeValue: String(c), children: [] } });
  return { type, key: key == null ? null : String(key), props: { ...rest, children: kids } };
}

let currentRoot = null;   // the tree on screen ("current")
let wipRoot = null;       // the tree being built ("workInProgress")
let nextUnit = null;      // the next fiber to work on
let deletions = [];
const BUDGET = 3;         // fibers per time slice (React uses roughly 5 ms, not a count)

function render(element, onDone) {
  wipRoot = { tag: 'root', type: 'root', key: null, pendingProps: { children: [element] },
              alternate: currentRoot, return: null, child: null, sibling: null, flags: 0 };
  deletions = [];
  nextUnit = wipRoot;
  console.log('--- render phase (interruptible) ---');
  workLoop(onDone);
}

function workLoop(onDone) {
  let done = 0;
  while (nextUnit && done < BUDGET) { nextUnit = performUnitOfWork(nextUnit); done++; }
  if (nextUnit) {                       // out of budget: yield, resume later
    console.log('  .. yield to the browser after ' + done + ' fibers');
    setTimeout(() => workLoop(onDone), 0);
    return;
  }
  commitRoot();                         // whole tree done: commit in one go
  if (onDone) onDone();
}

function performUnitOfWork(fiber) {
  beginWork(fiber);
  if (fiber.child) return fiber.child;  // go down first
  let node = fiber;
  while (node) {
    completeWork(node);                 // nothing below: complete, then try the sibling
    if (node.sibling) return node.sibling;
    node = node.return;                 // no sibling: climb back up and complete the parent
  }
  return null;
}

function beginWork(fiber) {
  console.log('  begin    ' + label(fiber));
  const children = typeof fiber.type === 'function'
    ? [fiber.type(fiber.pendingProps)]  // "call the component"
    : fiber.pendingProps.children;
  reconcileChildren(fiber, children);
}

function completeWork(fiber) {
  console.log('  complete ' + label(fiber));
  fiber.memoizedProps = fiber.pendingProps;
}

function reconcileChildren(wip, elements) {
  const track = wip.tag === 'root' || wip.alternate != null;  // on mount, only the top gets Placement
  const old = new Map();
  let o = wip.alternate ? wip.alternate.child : null, i = 0;
  while (o) { old.set(o.key != null ? o.key : 'idx' + i, o); o = o.sibling; i++; }

  let prev = null;
  elements.forEach((el, idx) => {
    const k = el.key != null ? el.key : 'idx' + idx;
    const match = old.get(k);
    let fiber;
    if (match && match.type === el.type) {          // same type + key: reuse, maybe update
      old.delete(k);
      fiber = { type: el.type, key: el.key, pendingProps: el.props, alternate: match,
                return: wip, child: null, sibling: null,
                flags: hostPropsChanged(match.memoizedProps, el.props, el.type) ? Update : 0 };
    } else {                                         // new type or new key: create
      fiber = { type: el.type, key: el.key, pendingProps: el.props, alternate: null,
                return: wip, child: null, sibling: null, flags: track ? Placement : 0 };
    }
    if (prev) prev.sibling = fiber; else wip.child = fiber;
    prev = fiber;
  });
  old.forEach(f => { f.flags = Deletion; deletions.push(f); });  // leftovers are removed
}

function hostPropsChanged(a, b, type) {
  if (typeof type === 'function') return false;     // only host nodes have DOM work
  if (type === 'TEXT') return a.nodeValue !== b.nodeValue;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  keys.delete('children');
  return [...keys].some(k => a[k] !== b[k]);
}

function commitRoot() {
  console.log('--- commit phase (synchronous) ---');
  deletions.forEach(f => console.log('  DELETE ' + html(f)));
  walk(wipRoot.child);
  currentRoot = wipRoot;                // the swap: workInProgress becomes current
  wipRoot = null;
}

function walk(fiber) {
  while (fiber) {
    if (fiber.flags & Placement) console.log('  INSERT ' + html(fiber));
    else {
      if (fiber.flags & Update) console.log('  UPDATE ' + label(fiber) + ' ' + summary(fiber));
      walk(fiber.child);                // a placed subtree is inserted whole; no need to descend
    }
    fiber = fiber.sibling;
  }
}

function label(f) {
  const name = typeof f.type === 'function' ? f.type.name : f.type;
  return f.type === 'TEXT' ? '"' + f.pendingProps.nodeValue + '"' : '<' + name + (f.key ? ' key=' + f.key : '') + '>';
}
function summary(f) {
  return f.type === 'TEXT' ? '"' + f.alternate.memoizedProps.nodeValue + '" -> "' + f.pendingProps.nodeValue + '"' : 'props changed';
}
function html(f) {
  if (f.type === 'TEXT') return f.pendingProps.nodeValue;
  let inner = '', c = f.child;
  while (c) { inner += html(c); c = c.sibling; }
  return typeof f.type === 'function' ? inner : '<' + f.type + '>' + inner + '</' + f.type + '>';
}

// ---- demo ----
function Item({ text }) { return h('li', null, text); }
function App({ items }) {
  return h('ul', null, items.map(it => h(Item, { key: it.id, text: it.text })));
}

render(h(App, { items: [{ id: 'a', text: 'Apples' }, { id: 'b', text: 'Bananas' }] }), () => {
  render(h(App, { items: [{ id: 'b', text: 'Bananas!' }, { id: 'c', text: 'Cherries' }] }));
});`,
          out: `--- render phase (interruptible) ---
  begin    <root>
  begin    <App>
  begin    <ul>
  .. yield to the browser after 3 fibers
  begin    <Item key=a>
  begin    <li>
  begin    "Apples"
  complete "Apples"
  complete <li>
  complete <Item key=a>
  .. yield to the browser after 3 fibers
  begin    <Item key=b>
  begin    <li>
  begin    "Bananas"
  complete "Bananas"
  complete <li>
  complete <Item key=b>
  complete <ul>
  complete <App>
  complete <root>
--- commit phase (synchronous) ---
  INSERT <ul><li>Apples</li><li>Bananas</li></ul>
--- render phase (interruptible) ---
  begin    <root>
  ... (same walk over App, ul, Item key=b, Item key=c) ...
--- commit phase (synchronous) ---
  DELETE <li>Apples</li>
  UPDATE "Bananas!" "Bananas" -> "Bananas!"
  INSERT <li>Cherries</li>`,
          note: `<p>Save it as <code>mini-fiber.js</code> and run <code>node mini-fiber.js</code>. This is a <b>simplified model</b> for intuition. What it gets right: the tree is a linked list (<code>child</code>/<code>sibling</code>/<code>return</code>); the walk is a loop that can stop after any fiber and resume (the <code>setTimeout</code> plays the role of the Scheduler); begin goes down and complete goes up; children are matched by key and type; and nothing is "applied" until the whole tree has been rendered and committed in one go. Notice that on mount only the top fiber is flagged <code>Placement</code>. Its subtree is built off-screen and inserted once, just as React does. What it leaves out: hooks, lanes, bailouts, the <code>lastPlacedIndex</code> move logic, <code>subtreeFlags</code>, effects, and real DOM work. Try changing <code>BUDGET</code>, or swapping <code>key: it.id</code> for no key, and predict the output first.</p>`
        },
        {
          t: "Why the rules of hooks exist: hooks as a linked list (simplified model, Node)",
          lang: "js",
          code: `// hooks-list.js: a SIMPLIFIED model of how a fiber stores hooks as a linked list.
// Real React keeps more fields per hook and switches "dispatchers" for mount vs update.
const fiber = { memoizedState: null };   // head of this component's hook list
let current = null, wipHook = null, isMount = true;

function nextHook() {
  if (isMount) {                           // mount: append a new node to the list
    const hook = { memoizedState: undefined, next: null };
    if (wipHook) wipHook.next = hook; else fiber.memoizedState = hook;
    wipHook = hook;
    return hook;
  }
  current = current ? current.next : fiber.memoizedState;  // update: walk the list in order
  if (!current) throw new Error('Rendered more hooks than during the previous render.');
  return current;
}

function useState(initial) {
  const hook = nextHook();
  if (isMount) hook.memoizedState = initial;
  const setState = v => { hook.memoizedState = v; };
  return [hook.memoizedState, setState];
}

function renderComponent(Component, props) {
  current = null; wipHook = null;
  const out = Component(props);
  isMount = false;
  return out;
}

function Profile({ showAge }) {
  const [name] = useState('Asha');
  if (showAge) { var [age] = useState(31); }   // breaks the rules of hooks on purpose
  const [city] = useState('Pune');
  return name + ' / ' + (showAge ? age : '-') + ' / ' + city;
}

console.log(renderComponent(Profile, { showAge: true }));   // mount: 3 hooks in the list
console.log(renderComponent(Profile, { showAge: false }));  // update: only 2 hooks called`,
          out: `Asha / 31 / Pune
Asha / - / 31`,
          note: `<p>On the second render <code>city</code> is <code>31</code>, because the third <code>useState</code> call read the second node in the list. React does not know hook names, only their order. Real React detects the mismatch in development: it compares each hook's type with the previous render and warns or throws, for example "Rendered fewer hooks than expected". <code>eslint-plugin-react-hooks</code> catches it before you run anything. Day 10 covers the rules from the user's side; this is why they exist.</p>`
        },
        {
          t: "Lanes are bitmasks: merge, test and pick the most urgent (illustrative values, Node)",
          lang: "js",
          code: `// lanes.js: lanes are bits in a 31-bit integer. Values are ILLUSTRATIVE, not React's exact constants.
const NoLanes        = 0b0000000;
const SyncLane       = 0b0000001;   // discrete input: click, keydown
const InputContLane  = 0b0000010;   // continuous input: pointermove, scroll
const DefaultLane    = 0b0000100;   // updates outside events (setTimeout, fetch callbacks)
const TransitionLane = 0b0001000;   // startTransition / useDeferredValue
const IdleLane       = 0b1000000;

const merge = (a, b) => a | b;                // add a lane to a set
const includes = (set, lane) => (set & lane) !== 0;
const highestPriority = set => set & -set;    // lowest set bit = most urgent lane
const remove = (set, lanes) => set & ~lanes;

let pending = NoLanes;
pending = merge(pending, TransitionLane);     // user typed: filter the big list in a transition
pending = merge(pending, SyncLane);           // ...and the keystroke itself is urgent

console.log('pending      ', pending.toString(2).padStart(7, '0'));
console.log('render first ', highestPriority(pending).toString(2).padStart(7, '0'), '(SyncLane)');
pending = remove(pending, highestPriority(pending));
console.log('then         ', highestPriority(pending).toString(2).padStart(7, '0'), '(TransitionLane)');
console.log('has default? ', includes(pending, DefaultLane));`,
          out: `pending       0001001
render first  0000001 (SyncLane)
then          0001000 (TransitionLane)
has default?  false`,
          note: `<p>This is why React uses bits. A fiber's pending work, a root's pending work, and "which lanes this render covers" are all integers, and the checks the reconciler makes thousands of times per render are a single <code>&amp;</code> or <code>|</code>. Lower bits mean higher priority, so <code>x &amp; -x</code> (the lowest set bit) is the most urgent pending lane. The older "expiration time" model (React 16) couldn't represent "these specific priorities but not those" cheaply, and lanes can. The real constants and helpers live in <code>ReactFiberLane.js</code> in the React source, and they change between versions.</p>`
        },
        {
          t: "Type and position decide identity: a component defined inside a component",
          lang: "tsx",
          code: `import { useState } from 'react';

// BUG: Row is a NEW function on every render of List.
export function List({ items }: { items: string[] }) {
  const [filter, setFilter] = useState('');

  function Row({ text }: { text: string }) {
    const [editing, setEditing] = useState(false);   // lost on every keystroke!
    return (
      <li onDoubleClick={() => setEditing(true)}>
        {editing ? <input defaultValue={text} autoFocus /> : text}
      </li>
    );
  }

  return (
    <>
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter" />
      <ul>
        {items.filter(i => i.includes(filter)).map(i => <Row key={i} text={i} />)}
      </ul>
    </>
  );
}

// FIX: declare components at module level, so type is the same function every render.
function StableRow({ text }: { text: string }) {
  const [editing, setEditing] = useState(false);
  return (
    <li onDoubleClick={() => setEditing(true)}>
      {editing ? <input defaultValue={text} autoFocus /> : text}
    </li>
  );
}

export function FixedList({ items }: { items: string[] }) {
  const [filter, setFilter] = useState('');
  return (
    <>
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter" />
      <ul>
        {items.filter(i => i.includes(filter)).map(i => <StableRow key={i} text={i} />)}
      </ul>
    </>
  );
}`,
          note: `<p>The first rule of diffing is that a different <code>type</code> means a different tree. In <code>List</code>, <code>Row</code> is a brand-new function object on every render. Even with a stable <code>key</code>, the old fiber's <code>type !== element.type</code>, so React deletes every row (state, DOM node, focus) and mounts new ones on every keystroke. Double-click a row and start typing in the filter: edit mode disappears. <code>FixedList</code> keeps <code>StableRow</code> as the same function, so React reuses the fibers and their hook lists. The same mechanism explains why <code>{cond ? &lt;A /&gt; : &lt;B /&gt;}</code> resets state, and why <code>key={userId}</code> deliberately resets a form.</p>`
        },
        {
          t: "Observe the commit phase ordering: render, refs, layout effects, effects",
          lang: "tsx",
          code: `import { useEffect, useLayoutEffect, useState } from 'react';

function Child({ n }: { n: number }) {
  console.log('render Child', n);
  useLayoutEffect(() => {
    console.log('layout effect Child');
    return () => console.log('layout cleanup Child');
  }, [n]);
  useEffect(() => {
    console.log('effect Child');
    return () => console.log('effect cleanup Child');
  }, [n]);
  return <div ref={el => { if (el) console.log('ref attached:', el.tagName); }}>n = {n}</div>;
}

export function Parent() {
  const [n, setN] = useState(0);
  console.log('render Parent', n);
  useLayoutEffect(() => { console.log('layout effect Parent'); }, [n]);
  useEffect(() => { console.log('effect Parent'); }, [n]);
  return (
    <>
      <button onClick={() => setN(x => x + 1)}>+1</button>
      <Child n={n} />
    </>
  );
}`,
          out: `(mount, without StrictMode)
render Parent 0
render Child 0
ref attached: DIV
layout effect Child
layout effect Parent
effect Child
effect Parent

(after clicking +1)
render Parent 1
render Child 1
layout cleanup Child
ref attached: DIV
layout effect Child
layout effect Parent
effect cleanup Child
effect Child
effect Parent`,
          note: `<p>Renders go parent to child (<code>beginWork</code> goes down). Effects go child to parent, because they are committed in completion order (bottom-up). Layout cleanups run in the mutation sub-phase. Refs and layout effects run in the layout sub-phase, before paint. Passive effects come last. Two details to note. First, an inline ref callback is a new function each render, so on every update React calls the old one with <code>null</code> and the new one with the node; returning a cleanup function from a ref callback (React 19) changes that. Second, in development <code>StrictMode</code> adds extra renders and effect runs, so compare against the output above with it switched off. The exact interleaving is an implementation detail; what matters for interviews is the guaranteed order: render, then DOM mutation, then layout effects, then passive effects.</p>`
        },
        {
          t: "Peek at a real fiber from the browser console (development only, internal API)",
          lang: "js",
          code: `// In Chrome DevTools: select a DOM element in the Elements panel, then in the Console:
const fiberKey = Object.keys($0).find(k => k.startsWith('__reactFiber$'));
const fiber = $0[fiberKey];
console.log(fiber.tag, fiber.type, fiber.key, fiber.memoizedProps);

// Walk up the return pointers and print component names (the "component stack").
const names = [];
for (let f = fiber; f; f = f.return) {
  if (typeof f.type === 'function') names.push(f.type.displayName || f.type.name);
}
console.log(names.join(' <- '));

// The alternate is the same fiber in the other tree (may be null right after mount).
console.log('has alternate:', fiber.alternate !== null);

// For a function component fiber, memoizedState is the first hook node.
const comp = (function find(f) { while (f && typeof f.type !== 'function') f = f.return; return f; })(fiber);
let hook = comp && comp.memoizedState, i = 0;
while (hook) { console.log('hook', i++, hook.memoizedState); hook = hook.next; }`,
          out: `5 'li' '42' {children: 'Bananas', className: 'row'}
ProductRow <- ProductList <- ProductsPage <- App
has alternate: true
hook 0 false
hook 1 {current: null}`,
          note: `<p>React attaches an ordinary expando property named <code>__reactFiber$&lt;random&gt;</code> to each DOM node it owns. This is exactly how React DevTools and error messages find the component stack. Use it here only to <b>see</b> the structure: <code>tag</code> 5 is <code>HostComponent</code> in current versions, <code>return</code> leads up the tree, and the hook list is real. Never rely on it in application code. The property name, the tag numbers and the hook node shape are internal and change between versions (the sample output is illustrative).</p>`
        }
      ],
      internals: `<p><b>Where a render actually starts.</b> <code>createRoot(container)</code> creates a <code>FiberRoot</code> (the <code>stateNode</code> of the <code>HostRoot</code> fiber) and attaches one delegated listener per event type to the container. When you call <code>setCount(1)</code> inside a click, the hook's <code>dispatchSetState</code> does the following:</p>
<ul class="pts">
<li>It asks <code>requestUpdateLane(fiber)</code> for a lane. If it is inside a transition, a transition lane; otherwise the current event priority, which is <code>SyncLane</code> for a click.</li>
<li>It may try an <b>eager bailout</b>. If the fiber has no pending updates, React computes the new state immediately, and if <code>Object.is(new, old)</code> it does nothing at all. If that shortcut isn't available, the update is queued, the component renders, and React bails out of its children if the state turned out to be equal. This is why "setting the same state" sometimes logs one extra render.</li>
<li>It queues the update on the hook's circular <code>queue.pending</code> list, marks <code>fiber.lanes</code> (and <code>alternate.lanes</code>), walks <code>return</code> pointers up to the root setting <code>childLanes</code>, and calls <code>ensureRootIsScheduled</code>. Sync work is flushed in a microtask at the end of the event, which is how <b>automatic batching</b> works: several <code>setState</code> calls in one handler produce one render.</li>
</ul>
<p><b>Bailouts are what make React fast.</b> In <code>beginWork</code>, if <code>oldProps === newProps</code> (same object reference), legacy context hasn't changed, the type is the same, and the fiber has no work in the current render lanes, React calls <code>bailoutOnAlreadyFinishedWork</code>. If <code>childLanes</code> also doesn't intersect the render lanes, it returns <code>null</code> and <b>skips the whole subtree</b>. Otherwise it clones the children and continues downwards. Props are compared by reference, and a parent render creates new props objects, which is why a parent render re-renders children by default. <code>React.memo</code> swaps the reference check for a shallow comparison (Day 11). Context consumers are found by walking the subtree from the provider and marking lanes on matching fibers, so they re-render even under a bailed-out parent.</p>
<p><b>The concurrent loop.</b> <code>performWorkOnRoot</code> (whose name has varied across versions) decides between <code>renderRootSync</code> and <code>renderRootConcurrent</code>. It renders concurrently, with time slicing, only if the lanes allow it: transitions, retries and idle work do; Sync and, in React 18/19 defaults, Default lanes don't. So a plain <code>setState</code> in a click under <code>createRoot</code> is still rendered synchronously. Concurrency is something you opt into per update. During a concurrent render, <code>workLoopConcurrent</code> runs <code>performUnitOfWork</code> while <code>!shouldYield()</code>. <code>shouldYield</code> returns true once the current slice has run for about 5 ms. React then returns to the Scheduler, which posts a <code>MessageChannel</code> message, lets the browser handle input and paint, and resumes the same <code>workInProgress</code> pointer. If a higher-priority lane has been scheduled in the meantime, <code>prepareFreshStack</code> throws away the work-in-progress tree and starts over from the root with the urgent lanes.</p>
<p><b>Commit, in more detail.</b> <code>commitRoot</code> runs <code>commitBeforeMutationEffects</code>, then <code>commitMutationEffects</code>. That pass walks only subtrees whose <code>subtreeFlags</code> include mutation flags, removes deleted subtrees (running unmount effects and detaching refs), inserts <code>Placement</code> nodes with <code>insertBefore</code>/<code>appendChild</code>, and applies prop diffs computed during <code>completeWork</code>. Next comes <code>root.current = finishedWork</code>, then <code>commitLayoutEffects</code>. Passive effects are scheduled with the Scheduler, or flushed synchronously at the end of commit when the update came from a discrete event, and flushed before any new render starts anyway. Effects always see a fully committed DOM.</p>
<p><b>Suspense and errors in the fiber model.</b> When a component throws a promise (or <code>use()</code> suspends), React unwinds to the nearest <code>SuspenseComponent</code> fiber, marks it to show its fallback, and attaches a "ping" to the promise that schedules a retry lane. Errors thrown during render unwind to the nearest error boundary the same way. Unwinding is just a walk up the <code>return</code> pointers. This is something the recursive stack reconciler could not do cleanly.</p>
<p><b>Version notes.</b> The effect list became <code>subtreeFlags</code> in React 18. Expiration times became lanes in React 17. Hook implementation details, the number of transition lanes, the yield interval and function names such as <code>performWorkOnRoot</code> have all changed over time. If you need the truth for your version, read <code>packages/react-reconciler/src</code> on the matching tag of the React repository.</p>`,
      prod: `<p>You never touch fibers in application code, but the model explains most performance and correctness bugs seen in production React apps, including a React → FastAPI → Redis → PostgreSQL product.</p>
<ul class="pts">
<li><b>"The whole page re-renders when I type"</b> means state lives too high, so <code>beginWork</code> calls every component under it with new props and can't bail out. Push state down, pass <code>children</code> through (elements created by a parent that didn't re-render keep the same props reference and bail out), or memoise (Day 11). The Profiler's flamegraph is literally the fiber tree, coloured by how long <code>beginWork</code> took.</li>
<li><b>Long tasks and INP.</b> A synchronous render of a 5,000-row orders table returned by <code>/api/orders</code> is one long task. Interaction to Next Paint suffers because the browser can't respond until the commit finishes. Fiber gives you two levers: render less (virtualise, paginate on the FastAPI side with <code>LIMIT/OFFSET</code> or keyset pagination in PostgreSQL), or mark the expensive update as a transition so it renders in slices and yields to input (next topic).</li>
<li><b>Lost state and remounts.</b> Unstable keys (<code>Math.random()</code>, or the index in a list that can be reordered), components defined inside components, and conditionally swapping wrapper types (<code>&lt;div&gt;</code> vs <code>&lt;section&gt;</code>) all make React delete and recreate subtrees. Symptoms: inputs lose focus, an effect re-subscribes to a WebSocket on every render, and the "Order details" panel refetches because its query component remounted. Use the database id from PostgreSQL as the key.</li>
<li><b>Impure renders break under concurrency.</b> A render that mutates a module-level cache, logs analytics, or increments a counter runs more than once (StrictMode, abandoned transitions, Suspense retries). Move side effects into effects or event handlers. In particular, never start a <code>fetch</code> during render without a cache, because each retry fires another request to FastAPI.</li>
<li><b>Layout effects block paint.</b> Heavy work in <code>useLayoutEffect</code> runs in the synchronous commit, before paint. Keep it to measurements (Day 5).</li>
<li><b>Upgrades.</b> When you upgrade React, read the changelog for timing changes: effect flush timing, StrictMode behaviour, Suspense throttling. Code that accidentally depended on internals (refs read during render, effect order between siblings) is what breaks.</li>
</ul>`,
      iq: [
        ["fresher", "What is reconciliation in React?", `<p>Reconciliation is the process of comparing the new element tree returned by your components with the previous one, and working out the minimum set of changes to apply to the DOM. React uses heuristics (same type + same key = update in place; a different type = replace the subtree) to do it in O(n). The tempting wrong answer is "React re-renders the DOM every time state changes". It re-runs components, but it touches only the DOM nodes that actually changed.</p>`],
        ["mid", "What are the render phase and the commit phase, and why must rendering be pure?", `<p>In the render phase React calls components and diffs the result. Nothing is visible yet, and in concurrent rendering this phase can be paused, restarted or discarded. In the commit phase React applies DOM changes, then runs layout effects and refs synchronously, and runs passive effects afterwards. Because a render can run several times for one commit (StrictMode, interrupted transitions, Suspense retries), side effects in render would happen several times or for UI that never appears. Side effects belong in event handlers or effects. "Render runs once per state change" is not a guarantee.</p>`],
        ["mid", "Why does React need keys, and what goes wrong with index keys?", `<p>Among siblings, React matches old and new children by key (or by index if there is none). A stable key lets it reuse the right fiber, so state, DOM node and focus follow the item. With index keys, inserting at the top or reordering shifts every index. Each fiber then receives a different item's props, while keeping its old state and uncontrolled input values, so you see wrong text in inputs and checkboxes on the wrong rows. Index keys are fine only for static lists that are never reordered, filtered or prepended to. Random keys are worse than index keys, because they remount every row on every render.</p>`],
        ["senior", "What is a fiber, and why did React replace the stack reconciler with it?", `<p>A fiber is a JavaScript object representing one unit of work: a component instance or host node, with <code>type</code>, <code>key</code>, props, state (the hook list), effect <code>flags</code>, priority <code>lanes</code>, and <code>child</code>/<code>sibling</code>/<code>return</code> links plus an <code>alternate</code>. The stack reconciler used recursion, so an update could not be paused once it began, and a large tree blocked the main thread. Fiber re-implements the call stack as a linked list React controls. React can do one fiber, yield to the browser, resume, prioritise urgent work, and throw away an unfinished tree. That is the foundation for transitions, Suspense and time slicing. A common misconception is that Fiber made React multithreaded or "made the virtual DOM faster". It made rendering <i>interruptible</i>, which is a different thing.</p>`],
        ["senior", "Explain current vs workInProgress and the alternate pointer.", `<p>React keeps two fiber trees. <code>current</code> matches what is on screen; <code>workInProgress</code> is the next version being built. Each fiber's <code>alternate</code> points at its twin, so building the next tree mostly reuses objects from the tree before last (double buffering). The render phase only mutates the workInProgress tree, so an interrupted or discarded render leaves the screen and <code>current</code> untouched. In commit, after the DOM mutations, React sets <code>root.current = finishedWork</code>, and the trees swap roles. This is why the UI is never shown half-updated.</p>`],
        ["senior", "How are hooks stored, and how does that explain the rules of hooks?", `<p>For a function component, <code>fiber.memoizedState</code> points to a linked list of hook objects, one per hook call, in call order. On mount each call appends a node. On update each call takes the next node. Hooks have no names or ids, so if a hook is called conditionally, or inside a loop with a changing count, every later hook reads the wrong node: state shifts between variables, or React detects a count mismatch and throws. So hooks must be called unconditionally at the top level of a component or custom hook. "React parses your function to find hooks" is wrong; it is purely call order at runtime.</p>`],
        ["lead", "What are lanes, and how does React decide which update to render first?", `<p>Lanes are priorities represented as bits in a 31-bit integer. Each update gets a lane based on context: discrete events (click, keypress) get the sync lane, continuous events (scroll, pointer move) get the input-continuous lane, other updates get the default lane, and updates inside <code>startTransition</code> get one of several transition lanes. Fibers record pending lanes, and ancestors record <code>childLanes</code>, so React can skip subtrees with no work. Each render processes the highest-priority pending lanes. If an urgent lane arrives during a transition render, React discards that work-in-progress, renders the urgent update, and restarts the transition. Lanes that wait too long expire and render synchronously, which prevents starvation. Bitmasks make merging and checking sets of priorities single operations, which the older expiration-time model couldn't express.</p>`],
        ["architect", "Can React interrupt a slow component in the middle of rendering it? What does that mean for designing a heavy screen?", `<p>No. React can yield only <b>between</b> fibers. A component function that takes 200 ms (a big synchronous computation, or parsing a 10 MB JSON blob) blocks the thread for 200 ms whatever its priority, because JavaScript can't be pre-empted. Time slicing helps when the work is <b>spread across many cheap components</b>, such as 2,000 rows that each take 0.1 ms. So design for many small units: move heavy computation to the server (FastAPI plus PostgreSQL aggregation, with Redis caching the result), to a Web Worker, or memoise it. Virtualise long lists so fewer fibers exist at all, and use transitions to make the remaining work yieldable. Saying "concurrent mode fixes slow components" is the tempting wrong answer.</p>`],
        ["senior", "What happens in the commit phase, in order?", `<p>It runs synchronously in sub-phases. <b>Before mutation</b> reads the DOM snapshot (<code>getSnapshotBeforeUpdate</code>). <b>Mutation</b> applies deletions, insertions and attribute and text updates, detaches old refs, runs <code>useInsertionEffect</code> and layout-effect cleanups. Then <code>root.current</code> switches to the finished tree. <b>Layout</b> attaches refs and runs <code>useLayoutEffect</code> setups and class lifecycle methods, children before parents, before the browser paints. Afterwards come <b>passive effects</b>: <code>useEffect</code> cleanups, then setups, usually after paint, but flushed synchronously for discrete events in React 18+. It can't be interrupted, because a partially mutated DOM would be visible and inconsistent.</p>`],
        ["architect", "Why does React's diff run in O(n), and what does it give up to get there?", `<p>Exact tree edit distance is about O(n³), far too slow for UI. React assumes two things. Elements of different types produce different trees, so it never compares their children. And developers mark stable identity among siblings with keys. It also compares only siblings at the same level. The costs: moving a subtree to a new parent is a full unmount and remount (state lost); changing a wrapper's type remounts everything inside it; and reordering is handled with a single <code>lastPlacedIndex</code> pass, so moving the last item to the front moves every other DOM node. In practice these cases are rare, or you can steer them with keys, and the predictability is worth more than an optimal diff.</p>`]
      ],
      gotchas: [
        `<b>The fiber is the state, not the function.</b> State lives on the fiber at a position in the tree. Render the same component in two places and you get two independent states. Move it to another position, or change its parent's type, and its state is gone.`,
        `<b>Setting the same state can still log one render.</b> The eager <code>Object.is</code> bailout works only when the fiber has no pending updates. Otherwise React renders the component, sees the state is equal, and bails out of its children. Don't treat "it rendered" as proof that something changed.`,
        `<b>Moving the last item of a keyed list to the front</b> moves every other DOM node, because of the single-pass <code>lastPlacedIndex</code> heuristic. Moving the first item to the end moves just one. This rarely matters, but it explains odd animation and focus behaviour in drag-and-drop lists.`,
        `<b>A render can run without a commit.</b> Interrupted transitions, StrictMode double render, Suspense and error retries all produce renders whose result is thrown away. Counting renders with a module variable, or firing analytics in render, gives wrong numbers.`,
        `<b><code>createRoot</code> doesn't make every update concurrent.</b> Sync and default lanes still render without time slicing. Only transitions and deferred values (and Suspense retries) are rendered in slices. A click that triggers a 300 ms render is still a 300 ms long task.`,
        `<b>Internals are not API.</b> <code>__reactFiber$...</code>, <code>_owner</code>, fiber <code>tag</code> numbers and the <code>__SECRET_INTERNALS...</code> object (renamed in React 19) have broken libraries before. Tools that read them, such as some state-inspection and animation libraries, have to ship patches for every React major.`,
        `<b>"Virtual DOM" is a fuzzy term.</b> The React element tree is cheap, immutable description; the fiber tree is the mutable, long-lived work structure. In interviews, saying React "diffs the new elements against the current fibers" is more accurate than "diffs two virtual DOMs".`
      ],
      best: [
        `Learn the model (fiber tree, two phases, lanes, hook list) and use it to <b>predict</b> behaviour. Don't depend on internal names or fields in code.`,
        `Keep renders <b>pure and cheap</b>: no side effects, no heavy synchronous computation in one component. Spread work across many small components, or move it off the main thread or to the FastAPI side.`,
        `Give list items <b>stable, unique keys</b> from your data (the PostgreSQL primary key). Never use random keys, and avoid index keys for lists that change order.`,
        `Declare components at <b>module level</b>, and keep wrapper element types stable across conditions, so React can reuse fibers and keep state. Change <code>key</code> deliberately when you <i>want</i> a reset.`,
        `When you investigate slowness, read the Profiler flamegraph as the fiber tree: find which fibers didn't bail out and why ("props changed", "hooks changed", "parent rendered"). Fix structure first, then memoise.`,
        `Keep <code>useLayoutEffect</code> for synchronous DOM measurement only. Everything else goes in <code>useEffect</code>, so the synchronous commit stays short.`
      ],
      lab: [
        `Save the <b>mini reconciler</b> from the Code section as <code>mini-fiber.js</code> outside your Vite app and run <code>node mini-fiber.js</code>. Change <code>BUDGET</code> to <code>1</code> and to <code>100</code> and watch where the yields happen. Then remove <code>key: it.id</code> from <code>App</code>, predict the commit output (index matching: an UPDATE of "Apples" to "Bananas!" and so on), and run it to check.`,
        `Run <code>hooks-list.js</code>, and then fix <code>Profile</code> so it always calls all three hooks and only <i>displays</i> age conditionally. Confirm that the second line now prints <code>Asha / - / Pune</code>.`,
        `In your Vite app (React 19, <code>npm run dev</code>), add the <b>Parent/Child effect-order</b> component. Temporarily remove <code>&lt;StrictMode&gt;</code> from <code>main.tsx</code>, click <b>+1</b>, and compare the console with the expected output. Put StrictMode back and explain the extra lines.`,
        `Render a 300-item list of products from <code>/api/products</code> (or a local array) with <b>index keys</b>, an uncontrolled <code>&lt;input type="checkbox" /&gt;</code> in each row, and a "Shuffle" button. Check a few boxes and shuffle; the checks stay on the wrong rows. Switch to <code>key={product.id}</code> and repeat.`,
        `Open React DevTools → Profiler, record typing into a filter box above the list, and identify which components rendered and why. Then select a list item in the Elements panel and run the fiber-peeking snippet to print its component stack and hook values.`,
        `<b>Done when:</b> you can draw, from memory, the current and workInProgress trees for <code>App → ul → [Item a, Item b]</code> with <code>child</code>/<code>sibling</code>/<code>return</code>/<code>alternate</code> arrows; explain why the conditional hook printed <code>31</code> as the city; and name the commit sub-phases in order with one thing that happens in each.`
      ],
      teach: `<p>"Before React 16, React reconciled with recursion. Recursion can't be paused, so a big update blocked the browser until it finished. Fiber fixed that by turning the call stack into a linked list of objects React controls. Each fiber is one component or DOM node, with a type, a key, props, the component's hooks as a linked list, flags for the DOM work it needs, priority lanes, and pointers to its first child, its next sibling and its parent.</p>
<p>Rendering is a loop over that list. <code>beginWork</code> goes down, calling components and diffing their children by type and key. <code>completeWork</code> comes back up, preparing DOM nodes off-screen. It builds a second tree, the work-in-progress, alongside the current one. Because it's a loop, React can stop between fibers, let the browser handle a keystroke, and carry on, or throw the whole thing away if something more urgent comes in. How urgent an update is gets recorded as a lane, a bit in a bitmask: clicks are top priority and transitions come lower.</p>
<p>When the tree is finished, React commits it in one synchronous pass: DOM mutations, swap the current pointer, layout effects and refs, then passive effects. So the render phase can be interrupted and must be pure; the commit phase can't be interrupted. And hooks are matched purely by call order in that linked list, which is the whole reason for the rules of hooks."</p>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: "d12-concurrent",
      title: "Concurrent React: transitions, deferred values and Suspense",
      lv: ["mid", "senior", "lead", "architect"],
      eli5: `<p>You are a waiter in a busy restaurant. A customer asks for a glass of water (quick, urgent) while you are in the middle of carefully setting a table for twelve (slow, not urgent). A bad waiter finishes the whole table first while the customer sits there thirsty. A good waiter puts the cutlery down, brings the water, and goes back to the table.</p>
<p>Concurrent React is the good waiter. You tell React which updates are "set the big table" jobs by wrapping them in <b>startTransition</b>. When you type into a search box, the letter appearing in the box is the glass of water; re-filtering 5,000 products is the big table. React shows the letter immediately and works on the list in the gaps. If you type another letter, it drops the half-set table and starts again with the new search.</p>
<p><b>Suspense</b> is the "your food is coming" sign. If part of the page is waiting for data or code, React shows a placeholder for just that part. And if you're <i>switching</i> to a new page inside a transition, React keeps showing the old page (perhaps a bit dimmed) until the new one is ready, instead of blanking the screen with a spinner.</p>
<p>One thing it is <b>not</b>: a second waiter. There is still only one waiter (one JavaScript thread). Concurrency here means smart switching between jobs, not doing two jobs at once.</p>`,
      what: `<p><b>Concurrent rendering</b> means React can prepare more than one version of the UI at the same time: an urgent update can be rendered and committed while a less urgent render is paused or in progress. It is built on Fiber's interruptible work loop and lanes (previous topic). In React 18 and later it is <b>not a mode you switch on</b>. <code>createRoot</code> enables the concurrent renderer, but an update is rendered concurrently only when you use a <b>concurrent feature</b>: <code>startTransition</code>, <code>useTransition</code>, <code>useDeferredValue</code>, Suspense, and the Suspense-based APIs built on them. Everything else behaves as it always did, apart from automatic batching. The legacy <code>ReactDOM.render</code> root had none of this and was removed in React 19.</p>
<h5>Transitions: <code>useTransition</code> and <code>startTransition</code></h5>
<ul class="pts">
<li><code>const [isPending, startTransition] = useTransition()</code>. Every state update made <b>synchronously inside</b> the callback you pass to <code>startTransition</code> is marked as a transition: low-priority, interruptible, and allowed to be abandoned if newer input arrives. The callback itself runs immediately; it is not delayed like <code>setTimeout</code>.</li>
<li><code>isPending</code> is <code>true</code> from the moment the transition starts until its result commits. React first does a quick urgent render with <code>isPending = true</code> (so you can show a spinner or dim the old content), then renders the transition in the background.</li>
<li>The standalone <code>import { startTransition } from 'react'</code> does the same without <code>isPending</code>. It is useful outside components, such as in a router or a store.</li>
<li><b>React 19: async transitions ("Actions").</b> You can pass an <code>async</code> function. <code>isPending</code> stays true until the returned promise settles. One documented limitation: state updates made <b>after an <code>await</code></b> are not automatically part of the transition, so wrap them in another <code>startTransition</code>. Day 9 covers Actions with forms.</li>
<li><b>A transition can't drive a controlled input's own value.</b> The input must show every keystroke immediately. Keep the input's state urgent and put only the expensive derived update in the transition, or use <code>useDeferredValue</code>.</li>
<li>Transitions <b>don't show already-visible Suspense fallbacks</b>. If a transition update causes an already-revealed boundary to suspend, React keeps showing the old UI (with <code>isPending</code>) until the new content is ready, instead of replacing it with a spinner.</li>
</ul>
<h5><code>useDeferredValue</code></h5>
<ul class="pts">
<li><code>const deferred = useDeferredValue(value)</code> returns the previous value during the urgent render, then schedules a background render in which it returns the new value. That background render is interruptible: if <code>value</code> changes again, React abandons it and starts over with the newest value.</li>
<li>Use it when you <b>receive</b> a value (for example a prop) and don't own the <code>setState</code> call that produces it. <code>useTransition</code> wraps the <i>update</i>; <code>useDeferredValue</code> wraps the <i>value</i>.</li>
<li><code>value !== deferred</code> tells you the displayed result is stale, so you can dim it.</li>
<li>It only helps if the expensive child <b>can skip the urgent render</b>: wrap it in <code>memo</code>, so that during the urgent pass (where it receives the old deferred value) it bails out. The React Compiler (Day 11) may do this memoisation for you.</li>
<li><b>React 19</b> added an optional second argument: <code>useDeferredValue(value, initialValue)</code>. On the initial render it returns <code>initialValue</code>, then renders again in the background with <code>value</code>. This is useful to show something cheap (such as an empty string) on first paint. Check that your React version and types include it.</li>
<li>It is <b>not a debounce</b>. There is no fixed delay: on a fast device the deferred render happens almost immediately, and it doesn't reduce the number of network requests if the deferred value is a query key. Use a debounce (Day 10) for that.</li>
</ul>
<h5>Suspense boundaries</h5>
<ul class="pts">
<li><code>&lt;Suspense fallback={...}&gt;</code> shows its fallback while any component inside it is <b>suspended</b>, meaning it is waiting on lazy code (<code>React.lazy</code>), a promise read with <code>use()</code>, or a Suspense-enabled data source such as TanStack Query's <code>useSuspenseQuery</code> or a framework loader. Data fetched in <code>useEffect</code> does <b>not</b> trigger Suspense (Day 7).</li>
<li>The <b>nearest</b> boundary above the suspended component is the one that shows its fallback. <b>Nested boundaries</b> reveal the UI in stages: the page shell first, then the summary, then a slow chart. Everything inside one boundary is revealed <b>together</b>, so a boundary is a design decision about what should appear as a unit.</li>
<li>When an <b>already-visible</b> boundary suspends because of an urgent update, React shows the fallback again, and the content "flashes". When it suspends because of a <b>transition</b>, React keeps the old content and doesn't commit until the new content is ready. A <b>newly mounted</b> boundary inside a transition still shows its own fallback, so transitions avoid flicker for content that is already on screen, not for content that is appearing for the first time.</li>
<li>Give the boundary (or the component inside) a <code>key</code> tied to the entity, such as <code>key={orderId}</code>, to deliberately reset and show the fallback when you navigate to a different item.</li>
</ul>
<h5>Tearing and <code>useSyncExternalStore</code></h5>
<p><b>Tearing</b> is a visual inconsistency where different parts of the UI show different values of the same data in one commit. It can happen only with concurrent rendering: React renders component A reading <code>store.value = 1</code>, yields, the store changes to 2 (a WebSocket message arrives), then React renders component B reading 2. Both are committed together, so the screen shows two different "truths". React state and context never tear, because React controls their updates. <b>External mutable stores</b> (a global object, Redux or Zustand stores, <code>window</code> values) can. <code>useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)</code> fixes it. React reads the snapshot during render, checks it again before commit, and if the store changed mid-render it <b>re-renders synchronously</b>, giving up concurrency for that update to stay consistent. <code>getSnapshot</code> must return the same value (by <code>Object.is</code>) when nothing changed. Return a cached object or a primitive, not a fresh object, or React will loop. Redux, Zustand and similar libraries use this hook internally. Day 10 builds custom hooks with it.</p>
<h5>What concurrency is not</h5>
<ul class="pts">
<li><b>Not multithreading.</b> Everything still runs on the main thread. React interleaves work by yielding <b>between fibers</b>; it can't pre-empt a running component function.</li>
<li><b>Not faster in total.</b> The same amount of work (often slightly more, because of abandoned renders) is done. It is spread out and prioritised so the page <b>feels</b> responsive, which improves INP.</li>
<li><b>Not automatic.</b> You choose which updates are non-urgent.</li>
<li><b>Not a data-fetching library.</b> Suspense coordinates loading states; caching and deduplication come from TanStack Query, a framework, or your own cache.</li>
</ul>
<h5><code>&lt;Activity&gt;</code> (React 19.2; check your version)</h5>
<p><code>&lt;Activity mode="visible" | "hidden"&gt;</code> became a stable API in React 19.2, after a long time as experimental "Offscreen" / <code>unstable_Activity</code>. Hidden children stay mounted with their <b>state preserved</b>, but they are visually hidden, their effects are cleaned up (and re-created when they are shown again), and updates inside them are rendered at the lowest priority. Use cases: tabs that keep their form state and scroll position, or pre-rendering a screen the user is likely to open next. Confirm the exact behaviour against the docs for your version before relying on it.</p>`,
      why: `<p>Before React 18, every update had the same priority and rendered synchronously. The classic symptom was a search box above a big list. Each keystroke set state, React re-rendered the list (say 150 ms), and only after that commit could the browser paint the new character. Typing fell behind and characters appeared in bursts. Developers worked around it with:</p>
<ul class="pts">
<li><b>Debouncing or throttling</b>: wait 300 ms after typing stops. The list update is delayed even on a fast machine, and once it starts it still blocks input.</li>
<li><b>Splitting state by hand</b> and scheduling the expensive part with <code>setTimeout</code> or <code>requestIdleCallback</code>. It is fragile, can't be interrupted once started, and stale renders can overwrite newer ones.</li>
<li><b>Spinners everywhere.</b> Every navigation replaced the current screen with a loading state, even when the next screen would be ready in 100 ms, so the page flashed constantly.</li>
</ul>
<p>Concurrent features give React the information it lacked: <i>which updates are urgent</i>. Urgent ones (typing, clicking, pressing) commit immediately. Transitions render in the background in small slices, are discarded when superseded, and keep the old UI on screen while they wait for data or code. Suspense makes loading states declarative and lets you design <i>where</i> they appear, instead of scattering <code>if (loading)</code> checks through the tree. <code>useSyncExternalStore</code> exists because once rendering can pause, reading mutable external data during render is no longer safe.</p>`,
      diagram: {
        html: lanes([
          ["Urgent (SyncLane)", ["keystroke: setText('ca')", "render input + spinner (isPending = true)", "commit immediately", "browser paints the new character"]],
          ["Transition (TransitionLane)", ["setQuery('ca') inside startTransition", "render list in ~5 ms slices, yielding between fibers", "new keystroke? abandon and restart with 'cat'", "commit when done: isPending = false"]],
          ["Suspense in a transition", ["new tab's data not ready: component suspends", "already-visible boundary keeps old UI", "isPending shows progress instead", "promise resolves: retry, then commit"]]
        ]) + flow([
          ["Keystroke", "urgent update", "w"],
          ["Urgent render + commit", "input shows the letter", "g"],
          ["Transition render", "interruptible, background", ""],
          ["Commit list", "or abandon if a newer keystroke arrived", "g"]
        ]),
        steps: [
          `The user types. The handler makes an <b>urgent</b> update for the input (<code>setText</code>) and a <b>transition</b> update for the expensive part (<code>startTransition(() =&gt; setQuery(...))</code>). The two get different lanes.`,
          `React renders and commits the urgent lane first. The input shows the new character, and <code>isPending</code> becomes <code>true</code> so the old list can be dimmed. This commit is small and fast.`,
          `React then renders the transition lane with time slicing. It yields every few milliseconds so the browser can process the next keystroke. If a new keystroke arrives, the half-built tree is thrown away and the transition restarts with the latest query.`,
          `If something inside an already-visible Suspense boundary suspends during the transition (lazy code or data), React <b>doesn't</b> show the fallback. It keeps the old UI and waits, retrying when the promise resolves.`,
          `When the transition render completes, React commits it in one synchronous pass. The list updates and <code>isPending</code> returns to <code>false</code>, and no intermediate states were ever shown.`
        ]
      },
      ex: [
        {
          t: "The problem: an expensive list makes typing lag",
          lang: "tsx",
          code: `// src/products/SlowList.tsx
import { memo } from 'react';

export type Product = { id: number; name: string; category: string };

function SlowRow({ product }: { product: Product }) {
  const start = performance.now();
  while (performance.now() - start < 0.3) {
    // simulate an expensive row: 0.3 ms each, ~600 ms for 2,000 rows
  }
  return <li>{product.name} <small>{product.category}</small></li>;
}

export const SlowList = memo(function SlowList({ products, query }: { products: Product[]; query: string }) {
  const q = query.trim().toLowerCase();
  const visible = products.filter(p => p.name.toLowerCase().includes(q));
  return <ul>{visible.map(p => <SlowRow key={p.id} product={p} />)}</ul>;
});

// src/products/LaggySearch.tsx
import { useState } from 'react';
import { SlowList, type Product } from './SlowList';

export const PRODUCTS: Product[] = Array.from({ length: 2000 }, (_, i) => ({
  id: i,
  name: \`Product \${i}\`,
  category: i % 2 ? 'tools' : 'garden',
}));

export function LaggySearch() {
  const [query, setQuery] = useState('');
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products" />
      <SlowList products={PRODUCTS} query={query} />
    </>
  );
}`,
          out: `Typing "12" quickly: the input freezes, then both characters appear at once.
Performance panel: one long task (~hundreds of ms) per keystroke.`,
          note: `<p>Every keystroke is an urgent update, and the input and the list are in the <b>same render</b>. The browser can't paint the new character until all the rows have rendered and committed. <code>memo</code> on <code>SlowList</code> doesn't help, because <code>query</code> really did change. The busy loop is only there to make the cost visible on a fast laptop; in real apps the cost comes from many rows, rich cells, charts, or a large derived computation. (The two files are shown together; split them as the comments indicate.)</p>`
        },
        {
          t: "Fix 1: useDeferredValue with a memoised child",
          lang: "tsx",
          code: `// src/products/DeferredSearch.tsx
import { useDeferredValue, useState } from 'react';
import { SlowList } from './SlowList';
import { PRODUCTS } from './LaggySearch';

export function DeferredSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);   // lags behind query during typing
  const isStale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products" />
      <div style={{ opacity: isStale ? 0.5 : 1, transition: 'opacity 0.2s 0.1s' }} aria-busy={isStale}>
        {/* memo(SlowList) bails out in the urgent render because deferredQuery is unchanged */}
        <SlowList products={PRODUCTS} query={deferredQuery} />
      </div>
    </>
  );
}`,
          out: `Typing is smooth; the list dims slightly and catches up a moment later.
Typing "123" fast may skip the renders for "1" and "12" entirely.`,
          note: `<p>Each keystroke now produces two renders. The <b>urgent</b> one has <code>query = "12"</code> and <code>deferredQuery = "1"</code> (the old value). <code>SlowList</code> receives the same props, so <code>memo</code> skips it, and the input commits in a millisecond. The <b>background</b> one has <code>deferredQuery = "12"</code>, renders the list in interruptible slices, and is abandoned if you keep typing. Without <code>memo</code> (or the React Compiler), the urgent render would re-render the slow list with the old value and you would gain nothing. The CSS transition delay avoids a dimming flicker on fast updates.</p>`
        },
        {
          t: "Fix 2: useTransition with split state, plus isPending",
          lang: "tsx",
          code: `// src/products/TransitionSearch.tsx
import { useState, useTransition, type ChangeEvent } from 'react';
import { SlowList } from './SlowList';
import { PRODUCTS } from './LaggySearch';

export function TransitionSearch() {
  const [text, setText] = useState('');      // urgent: what the input shows
  const [query, setQuery] = useState('');    // non-urgent: what the list filters by
  const [isPending, startTransition] = useTransition();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setText(next);                             // must stay urgent (controlled input)
    startTransition(() => {
      setQuery(next);                          // may be interrupted and restarted
    });
  }

  return (
    <>
      <input value={text} onChange={handleChange} placeholder="Search products" />
      {isPending && <span role="status">Updating…</span>}
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        <SlowList products={PRODUCTS} query={query} />
      </div>
    </>
  );
}`,
          note: `<p>Use this form when <b>you own the update</b>. Note the two pieces of state. If you wrote <code>startTransition(() =&gt; setText(next))</code> and used <code>text</code> for both the input and the list, the input's value would update only when the transition commits, and the controlled input would feel broken: characters lag or vanish. Read <code>e.target.value</code> into a variable <b>before</b> the transition; don't read the event inside a deferred callback. <code>isPending</code> is true from the urgent render until the transition commits.</p>`
        },
        {
          t: "Realistic: FastAPI results with TanStack Query, deferred filtering and server search",
          lang: "tsx",
          code: `// src/products/api.ts
import type { Product } from './SlowList';

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(\`GET \${url} failed: \${res.status}\`);
  return res.json() as Promise<T>;
}

export const searchProducts = (q: string, signal?: AbortSignal) =>
  fetchJson<Product[]>(\`/api/products?q=\${encodeURIComponent(q)}&limit=200\`, signal);

// src/products/CatalogSearch.tsx
import { useDeferredValue, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SlowList, type Product } from './SlowList';
import { fetchJson, searchProducts } from './api';

const EMPTY: Product[] = [];

// A) Catalogue small enough to load once (FastAPI + Redis-cached JSON): filter on the client.
export function ClientFilteredCatalog() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { data, isPending: isLoading, error } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: ({ signal }) => fetchJson<Product[]>('/api/products', signal),
    staleTime: 5 * 60_000,
  });
  if (isLoading) return <p>Loading catalogue…</p>;
  if (error) return <p role="alert">{error.message}</p>;
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter" />
      <SlowList products={data ?? EMPTY} query={deferredQuery} />
    </>
  );
}

// B) Catalogue too big for the browser: let PostgreSQL search; keep old results while typing.
export function ServerSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { data, isFetching } = useQuery({
    queryKey: ['products', 'search', deferredQuery],
    queryFn: ({ signal }) => searchProducts(deferredQuery, signal),
    placeholderData: keepPreviousData,     // show previous results instead of an empty list
    staleTime: 30_000,
  });
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" />
      <div style={{ opacity: isFetching || query !== deferredQuery ? 0.6 : 1 }}>
        <SlowList products={data ?? EMPTY} query="" />
      </div>
    </>
  );
}`,
          note: `<p>Requires <code>npm install @tanstack/react-query</code> and a <code>QueryClientProvider</code> (Day 7). Two naming traps: TanStack Query's <code>isPending</code> means "no data yet" and has nothing to do with <code>useTransition</code>'s <code>isPending</code>, so rename it. And <code>data ?? EMPTY</code> uses a module-level constant so the memoised list doesn't receive a new <code>[]</code> on every render. Variant A is the pure concurrent-rendering case: the network is done once, and the deferred value keeps the client-side filter off the urgent path. Variant B shows the limit of <code>useDeferredValue</code>. It reduces <b>render</b> work, but it isn't a debounce, so a fast typist on a fast machine can still send a request per keystroke. TanStack Query aborts superseded requests through <code>signal</code>, and FastAPI and Redis absorb repeats, but for an expensive PostgreSQL search add a real debounce (Day 10's <code>useDebounce</code>) to the query key.</p>`
        },
        {
          t: "Suspense: lazy tabs that keep the old tab visible, using a transition",
          lang: "tsx",
          code: `// src/dashboard/Dashboard.tsx
// Each tab file (./tabs/Overview.tsx etc.) has a default-exported component.
import { lazy, Suspense, useState, useTransition } from 'react';

const Overview = lazy(() => import('./tabs/Overview'));
const Orders = lazy(() => import('./tabs/Orders'));
const Analytics = lazy(() => import('./tabs/Analytics'));

const TABS = ['overview', 'orders', 'analytics'] as const;
type Tab = (typeof TABS)[number];

export function Dashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [isPending, startTransition] = useTransition();

  function select(next: Tab) {
    startTransition(() => setTab(next));   // without this: fallback flashes on every first visit
  }

  return (
    <>
      <nav aria-busy={isPending}>
        {TABS.map(t => (
          <button key={t} aria-pressed={tab === t} onClick={() => select(t)}>{t}</button>
        ))}
        {isPending && <span role="status"> Loading…</span>}
      </nav>
      <Suspense fallback={<p>Loading dashboard…</p>}>
        <div style={{ opacity: isPending ? 0.7 : 1 }}>
          {tab === 'overview' && <Overview />}
          {tab === 'orders' && <Orders />}
          {tab === 'analytics' && <Analytics />}
        </div>
      </Suspense>
    </>
  );
}`,
          out: `First load: "Loading dashboard…" once, then Overview.
Click "analytics" (chunk not yet loaded): Overview stays visible, dimmed, "Loading…" next to the tabs,
then Analytics replaces it. Without startTransition: Overview disappears and "Loading dashboard…" flashes.`,
          note: `<p>The <code>&lt;Suspense&gt;</code> boundary is already showing content. A <b>transition</b> that makes it suspend doesn't bring the fallback back: React keeps the committed UI and waits for the lazy chunk. An <b>urgent</b> <code>setTab</code> would replace the whole tab area with the fallback. React Router v7 applies the same idea to navigations; check its docs for how navigations relate to transitions in your version. Preloading the chunk on hover (<code>import('./tabs/Analytics')</code>) makes the wait shorter still.</p>`
        },
        {
          t: "Nested Suspense boundaries with useSuspenseQuery, reset per entity",
          lang: "tsx",
          code: `// src/orders/OrderPage.tsx
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { fetchJson } from '../products/api';

type Order = { id: number; customer: string; total: number; status: string };
type OrderLine = { id: number; sku: string; qty: number; price: number };

function OrderHeader({ id }: { id: number }) {
  const { data: order } = useSuspenseQuery({
    queryKey: ['orders', id],
    queryFn: ({ signal }) => fetchJson<Order>(\`/api/orders/\${id}\`, signal),
  });
  return <h2>Order #{order.id}: {order.customer} ({order.status})</h2>;
}

function OrderLines({ id }: { id: number }) {
  const { data: lines } = useSuspenseQuery({
    queryKey: ['orders', id, 'lines'],
    queryFn: ({ signal }) => fetchJson<OrderLine[]>(\`/api/orders/\${id}/lines\`, signal),
  });
  return (
    <table>
      <tbody>
        {lines.map(l => (
          <tr key={l.id}><td>{l.sku}</td><td>{l.qty}</td><td>{l.price.toFixed(2)}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

export function OrderPage({ orderId }: { orderId: number }) {
  return (
    // key: switching to a different order resets both boundaries and shows skeletons again
    <Suspense key={orderId} fallback={<p>Loading order…</p>}>
      <OrderHeader id={orderId} />
      <Suspense fallback={<p>Loading lines…</p>}>
        <OrderLines id={orderId} />
      </Suspense>
    </Suspense>
  );
}`,
          note: `<p>The outer boundary waits for the header; the inner one lets the (often slower) lines arrive later without holding back the header. React 19 also changed how siblings inside a suspended boundary are handled: it shows the fallback sooner, then "pre-warms" the remaining siblings. Treat the exact timing as version-dependent. One trap: the two queries here are <b>siblings at different levels</b>. <code>OrderLines</code> is inside the inner boundary, so it starts rendering in the same pass and the two requests run in parallel. If you put <code>OrderLines</code> <i>inside</i> <code>OrderHeader</code>'s output, the second request couldn't start until the first had resolved: a waterfall. Prefetch both in a route loader, or use <code>useSuspenseQueries</code>, when they are independent. Wrap the page in an error boundary (Day 10) to handle failed fetches.</p>`
        },
        {
          t: "Tearing-safe external store with useSyncExternalStore",
          lang: "ts",
          code: `// src/store/cartStore.ts
import { useSyncExternalStore } from 'react';

type Listener = () => void;
type CartState = { items: number; currency: string };

function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getSnapshot: () => state,                    // same object until set() is called
    setState(update: (prev: T) => T) {
      state = update(state);                     // always a NEW object: immutable updates
      listeners.forEach(l => l());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}

export const cartStore = createStore<CartState>({ items: 0, currency: 'INR' });

// Select a primitive: Object.is comparison is stable, so no extra renders and no loop.
export function useCartCount(): number {
  return useSyncExternalStore(cartStore.subscribe, () => cartStore.getSnapshot().items);
}

// WRONG: returns a new object every call. React detects that getSnapshot is not cached
// and re-renders in a loop (with a console error in development).
// export const useCartBad = () =>
//   useSyncExternalStore(cartStore.subscribe, () => ({ ...cartStore.getSnapshot() }));

// Usage, e.g. from a WebSocket message or any non-React code:
// cartStore.setState(s => ({ ...s, items: s.items + 1 }));`,
          note: `<p>If the store changes while a concurrent render is in progress, <code>useSyncExternalStore</code> notices that the snapshot differs, discards the inconsistent render and re-renders <b>synchronously</b>, so every component in the commit sees the same value. The price is that updates to the store can't be transitions: they always render urgently. Keep the subscription stable (a module-level function, as here). An inline <code>subscribe</code> would resubscribe on every render. For SSR, pass a third <code>getServerSnapshot</code> argument. Day 10 shows the same hook for browser APIs such as <code>navigator.onLine</code>.</p>`
        },
        {
          t: "Async transitions (React 19) and Activity (React 19.2), both version-dependent",
          lang: "tsx",
          code: `// Requires React 19 for async startTransition, React 19.2+ for <Activity>.
import { Activity, useState, useTransition } from 'react';

function SettingsForm() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save(name: string) {
    startTransition(async () => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      // Updates after an await are not automatically in the transition: wrap them again.
      startTransition(() => {
        if (res.ok) { setSaved(true); setError(null); } else { setError(\`Save failed (\${res.status})\`); }
      });
    });
  }

  return (
    <form onSubmit={e => { e.preventDefault(); save(new FormData(e.currentTarget).get('name') as string); }}>
      <input name="name" defaultValue="" />
      <button disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
      {saved && <p>Saved.</p>}
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

function Notes() {
  const [text, setText] = useState('');   // preserved while hidden
  return <textarea value={text} onChange={e => setText(e.target.value)} />;
}

export function Workspace() {
  const [tab, setTab] = useState<'settings' | 'notes'>('settings');
  return (
    <>
      <button onClick={() => setTab('settings')}>Settings</button>
      <button onClick={() => setTab('notes')}>Notes</button>
      <Activity mode={tab === 'settings' ? 'visible' : 'hidden'}><SettingsForm /></Activity>
      <Activity mode={tab === 'notes' ? 'visible' : 'hidden'}><Notes /></Activity>
    </>
  );
}`,
          note: `<p>If your installed <code>react</code> / <code>@types/react</code> don't export <code>Activity</code>, you are on a version before 19.2. Use conditional rendering instead (which loses state) or lift the state up. With <code>&lt;Activity mode="hidden"&gt;</code>, the textarea's text survives switching tabs, effects inside the hidden tree are cleaned up while it is hidden, and its updates render at the lowest priority. In real form code, prefer the form <code>action</code> / <code>useActionState</code> pattern from Day 9; it is built on the same async transitions.</p>`
        }
      ],
      internals: `<p><b>How a transition gets its lane.</b> <code>startTransition(fn)</code> sets a global "current transition" (<code>ReactSharedInternals.T</code> in React 19; older versions used other names), runs <code>fn</code> synchronously, and restores the previous value. Any <code>setState</code> called while it is set asks <code>requestUpdateLane</code> for a lane, and gets a <b>transition lane</b> instead of the event's priority. That is why only <i>synchronous</i> updates inside the callback are marked: by the time code after an <code>await</code> runs, the global has been restored. (React 19 tracks the async action's promise for <code>isPending</code>, but updates after the <code>await</code> still need wrapping.) <code>useTransition</code>'s <code>isPending</code> is itself a piece of state: React sets it to <code>true</code> at urgent priority and back to <code>false</code> in the transition lane, so it flips back exactly when the transition commits.</p>
<p><b>How <code>useDeferredValue</code> works.</b> During a render, the hook checks whether the current render lanes include only urgent lanes. If they do and the value changed, it returns the <b>previous</b> value and schedules a deferred render (a transition lane, or an offscreen lane if the tree is hidden). In that later render, it returns the new value. So it is two renders with different lanes, and the second is interruptible like any transition. There is no timer anywhere.</p>
<p><b>Time slicing and interruption.</b> Transition lanes render with <code>workLoopConcurrent</code>, which checks <code>shouldYield()</code> between fibers (Fiber topic). When an urgent update is scheduled during that render, the root has a higher-priority lane pending. On the next yield, React sees this, throws away the work-in-progress tree with <code>prepareFreshStack</code>, renders and commits the urgent lane, and then starts the transition again from scratch, now including the latest state. Because the current tree was never touched, nothing visible is lost. This is why transitions require pure renders.</p>
<p><b>Suspense mechanics.</b> A component suspends by throwing a thenable (<code>use()</code>, <code>lazy</code>, Suspense-enabled libraries). React unwinds to the nearest <code>SuspenseComponent</code> fiber. Then:</p>
<ul class="pts">
<li>If the render was <b>urgent</b>, or the boundary is new, React commits the boundary in its fallback state. The primary children are kept in a hidden <code>Offscreen</code> fiber, so their state is preserved if they had already mounted.</li>
<li>If the render is a <b>transition</b> and the boundary is already showing content, React <b>suspends the commit</b> instead. The old tree stays current, and the root records the transition as suspended.</li>
<li>React attaches a <b>ping</b> listener to the thenable. When it resolves, React schedules a retry (in a retry lane, or by re-rendering the transition) and renders again. The thenable now returns a value.</li>
<li>React <b>throttles</b> successive reveals of nested boundaries (a few hundred ms), so content doesn't pop in one line at a time. In React 19, when a boundary suspends, React commits the fallback without first rendering the remaining siblings, then "pre-warms" them in the background. The exact policy differs across versions.</li>
</ul>
<p><b>How <code>useSyncExternalStore</code> prevents tearing.</b> On render, the hook calls <code>getSnapshot()</code> and stores the value. If the render is concurrent, React also records a consistency check on the fiber. Before committing, React calls <code>getSnapshot()</code> again for each such fiber. If any value differs, the store changed mid-render, so React discards the result and re-renders the tree <b>synchronously</b>, where no yield can happen and tearing is impossible. When the store notifies subscribers, the update is scheduled at sync priority. So updates from external stores can't be deferred, though <code>useDeferredValue</code> on the selected value still can be.</p>
<p><b>Activity / Offscreen.</b> Internally <code>&lt;Activity mode="hidden"&gt;</code> is an <code>OffscreenComponent</code> fiber. In hidden mode, React hides the host nodes, disconnects effects and schedules the subtree's updates in <code>OffscreenLane</code>, the lowest priority, so it is pre-rendered only when the main thread is idle. Suspense uses the same fiber type to keep hidden primary children alive.</p>`,
      prod: `<p>In a React → FastAPI → Redis → PostgreSQL product, concurrent features are mostly about <b>responsiveness under real data sizes</b> and <b>calm loading states</b>.</p>
<ul class="pts">
<li><b>Search and filter screens.</b> Decide where the work belongs first. Fewer than about 10,000 small records, loaded once and cached in Redis by FastAPI, can be filtered on the client with <code>useDeferredValue</code> and a virtualised list (Day 11). Larger data sets should be searched in PostgreSQL (with indexes such as <code>pg_trgm</code> or full-text search), with the API paginated and the hot queries cached in Redis. The client then uses a debounced query key, <code>keepPreviousData</code>, and a deferred value for rendering. Transitions don't make a 50,000-row DOM acceptable.</li>
<li><b>Navigation.</b> Route changes and tab switches are the textbook transition: keep the old screen and show a top progress bar via <code>isPending</code>, instead of a full-page spinner. Routers and frameworks (React Router, Next.js) build this in. Know what yours does so you don't double-wrap or fight it.</li>
<li><b>Skeleton design.</b> Place Suspense boundaries deliberately: one for the page shell, one per independent panel, none per tiny widget (that leads to "popcorn" UI). Make fallbacks the same size as the content to avoid layout shift (CLS). Pair every data boundary with an error boundary so a FastAPI 500 shows a retryable message for that panel rather than a blank page.</li>
<li><b>Measuring.</b> Concurrency improves <b>INP</b> by keeping the main thread responsive. Measure it with real-user monitoring (<code>web-vitals</code>) and the Performance panel, before and after. Total CPU time doesn't drop, and it can rise slightly because of abandoned renders, so on low-end Android devices the big win usually comes from rendering less.</li>
<li><b>External state.</b> Redux Toolkit, Zustand and similar libraries are tearing-safe because they use <code>useSyncExternalStore</code>, but their updates are always urgent. Real-time feeds (a WebSocket pushing order statuses) that trigger heavy renders should push into a store, and the expensive view should read a <code>useDeferredValue</code> of the selected slice.</li>
<li><b>Common production bugs:</b> renders that fire analytics or mutate caches (repeated by restarts); <code>fetch</code> called during render without a cache (a new promise every render, so it suspends forever and floods the API with requests); transitions wrapped around the controlled input's own state (laggy input); and fallbacks that flash for 50 ms on fast networks. Fix that last one with transitions, or by preloading, not with artificial delays.</li>
</ul>`,
      iq: [
        ["mid", "What does useTransition do, and when would you use it?", `<p>It returns <code>[isPending, startTransition]</code>. State updates inside <code>startTransition</code> are marked non-urgent: React renders them in the background, interruptibly, and lets urgent updates such as typing and clicks go first. <code>isPending</code> lets you show that work is in progress while the old UI stays visible. Use it for expensive re-renders triggered by user actions: filtering a big list, switching tabs, navigation. It does <b>not</b> make the work itself faster, and it can't be used for the controlled input's own value.</p>`],
        ["mid", "useTransition vs useDeferredValue: which do you choose?", `<p>Both mark work as non-urgent. Use <code>useTransition</code> when you own the state update (in a handler, you can wrap <code>setQuery</code>) and you want <code>isPending</code>. Use <code>useDeferredValue</code> when you only receive a value, such as a prop or the result of a hook, and want the expensive render that depends on it to lag behind. With <code>useDeferredValue</code>, the expensive child must be memoised (or compiled with the React Compiler) so it can skip the urgent render. Otherwise you get two expensive renders instead of one.</p>`],
        ["mid", "Is useDeferredValue the same as debouncing?", `<p>No. A debounce waits a fixed time after the last change, and the work then still runs uninterrupted. <code>useDeferredValue</code> has no delay: it starts the background render immediately and abandons it if the value changes again. So it adapts to the device: fast machines see almost no lag, and slow ones skip intermediate values. It doesn't reduce network requests if the deferred value feeds a query key, so use a real debounce for that. You often combine them: debounce the request, defer the rendering.</p>`],
        ["senior", "A developer wraps setText for a controlled input in startTransition and the input now feels broken. Why?", `<p>A controlled input must show the value React renders. If <code>setText</code> is a transition, the input's own value is updated only when that transition commits, and it can be interrupted repeatedly by new keystrokes. Meanwhile the DOM input and React's state drift apart, so characters appear late, jump, or the caret moves. The fix is to split the state: keep <code>setText</code> urgent for the input, and put the expensive derived update (<code>setQuery</code>) in the transition. Or keep a single state and render the list from <code>useDeferredValue(text)</code>.</p>`],
        ["senior", "What is tearing, and how does useSyncExternalStore prevent it?", `<p>Tearing is when different components in one commit show different values of the same external data. It becomes possible with concurrent rendering, because React can yield midway through a render, and an external mutable store can change before the remaining components read it. React-managed state can't tear. <code>useSyncExternalStore(subscribe, getSnapshot)</code> reads a snapshot during render and checks it again before commit. If the value changed, React throws away the render and re-renders synchronously, so everything is consistent. <code>getSnapshot</code> must return a cached or immutable value (stable under <code>Object.is</code>), otherwise React re-renders endlessly. State libraries such as Redux and Zustand rely on it.</p>`],
        ["senior", "Why does a Suspense fallback flash when switching tabs, and how do you stop it?", `<p>The tab switch is an urgent update, and the new tab suspends (a lazy chunk or data). An already-visible boundary that suspends from an urgent update must show its fallback, so the current content is replaced by a spinner. Wrap the switch in <code>startTransition</code>: then React keeps the old content committed and waits, and you show <code>isPending</code> inline. Also preload the chunk or data on hover. Two traps: a <i>newly mounted</i> boundary still shows its fallback even in a transition, and an artificial minimum delay only hides the problem.</p>`],
        ["lead", "Is concurrent React multithreaded? Does it make rendering faster?", `<p>Neither. Everything still runs on the main JavaScript thread. "Concurrent" means React can work on several versions of the UI by interleaving: it renders in small slices, yields between fibers, prioritises urgent updates, and discards outdated work. Total work is the same or slightly higher. What improves is responsiveness (input is handled during long renders) and perceived performance (no unnecessary fallbacks). A single slow component still blocks the thread, because React can't interrupt a running function. For real parallelism, use Web Workers or move the work to the server.</p>`],
        ["architect", "Design a responsive product search over 2 million products for a React + FastAPI + PostgreSQL + Redis app.", `<p>Put the heavy work where it belongs. PostgreSQL does the search (trigram or full-text indexes, keyset pagination, a <code>limit</code> of maybe 50). FastAPI exposes <code>/api/products?q=&amp;cursor=</code>, and Redis caches popular queries for a short TTL. On the client: an urgent controlled input; a debounced query key (around 250 ms) so you don't send a request per keystroke; TanStack Query with <code>keepPreviousData</code>, abort signals and <code>staleTime</code>; and a virtualised results list, so only about 30 rows exist as fibers. Concurrent features are the last mile. <code>useDeferredValue</code> or a transition keeps rendering a new page of results from blocking typing, and a transition keeps the old results visible instead of falling back to a spinner. Measure INP and p95 API latency. The wrong answer is "wrap it in startTransition and render all 2 million rows".</p>`],
        ["architect", "How do Suspense boundaries affect loading UX and data-fetching architecture?", `<p>A boundary defines a <b>unit of reveal</b>: everything inside appears together. A few deliberate boundaries (shell, main content, independent side panels) give a calm, staged load. Too many give "popcorn" UI and layout shift. Too few mean one slow panel holds back the whole page. Because components suspend while they render, sequential suspensions create <b>waterfalls</b> (a child can't start fetching until its parent has resolved), so start fetches early: route loaders, prefetching with <code>queryClient.ensureQueryData</code>, or rendering independent queries as siblings. Pair each boundary with an error boundary, key boundaries by entity to reset them, and use transitions for navigation so revealed content isn't replaced by fallbacks. On the server, the same boundaries become the streaming units for SSR (Day 13).</p>`]
      ],
      gotchas: [
        `<b>Only synchronous updates inside the callback are transitions.</b> <code>startTransition(() =&gt; setTimeout(() =&gt; setX(1)))</code> marks nothing. With an async callback (React 19), updates after <code>await</code> must be wrapped in <code>startTransition</code> again.`,
        `<b><code>useDeferredValue</code> without memoisation does nothing useful.</b> If the expensive child isn't <code>memo</code>-wrapped (or compiled), the urgent render re-renders it with the old value anyway, and you pay twice.`,
        `<b>Passing a new object or array to <code>useDeferredValue</code> every render</b> (<code>useDeferredValue({ q })</code>) makes it schedule a background render every time, because the value is never <code>Object.is</code>-equal. Defer primitives, or memoised values.`,
        `<b>Two different <code>isPending</code>s.</b> <code>useTransition</code>'s <code>isPending</code> means "a transition hasn't committed yet". TanStack Query's <code>isPending</code> means "this query has no data yet". Rename one when you use both.`,
        `<b>Suspense needs a cached promise.</b> <code>use(fetch(url))</code> inside a component creates a new promise every render. It suspends, retries, creates another promise, and so on forever. Promises must come from a cache, a framework, or a library.`,
        `<b>Transitions don't hide fallbacks for new boundaries.</b> A boundary mounting for the first time inside a transition still shows its fallback. Only content that is already visible is kept.`,
        `<b>External store updates are always synchronous.</b> A busy WebSocket pushing into Zustand or Redux re-renders at urgent priority. Defer the expensive consumer with <code>useDeferredValue</code> on the selected value, or batch and throttle the messages.`,
        `<b>StrictMode and abandoned renders run your component more often.</b> Logging "rendered" in a transition-heavy screen can show far more renders than commits. That is expected and harmless, as long as rendering is pure.`
      ],
      best: [
        `<b>Fix the work before hiding it.</b> Virtualise, paginate on the FastAPI side, memoise, and move heavy computation off the main thread. Then use transitions or deferred values for the work that remains.`,
        `Keep input state urgent. Use <code>useTransition</code> when you own the expensive update; use <code>useDeferredValue</code> (with a memoised child) when you only receive the value.`,
        `Show staleness with <code>isPending</code> or <code>value !== deferred</code> (dim, an inline spinner, a progress bar) instead of replacing content with a fallback.`,
        `Treat Suspense boundaries as a UX decision: few, deliberate, sized like their content, each paired with an error boundary, and keyed by entity when the entity changes.`,
        `Start data fetching early (loaders, prefetch, sibling queries) to avoid Suspense waterfalls, and use a Suspense-capable cache (TanStack Query's <code>useSuspenseQuery</code>, or your framework) rather than ad-hoc promises.`,
        `Read external mutable data only through <code>useSyncExternalStore</code> (or a library that uses it), with stable <code>subscribe</code> and cached snapshots.`,
        `Hedge version-specific features in your code base: check that <code>Activity</code>, <code>useDeferredValue</code>'s <code>initialValue</code> and async transitions exist in your React version before adopting them, and record the minimum version in <code>package.json</code>.`
      ],
      lab: [
        `In your Vite app, add <code>SlowList.tsx</code> and <code>LaggySearch.tsx</code> from the Code section and render <code>&lt;LaggySearch /&gt;</code>. Type quickly and record a trace in the Chrome Performance panel with 4x CPU throttling. Note the long tasks per keystroke.`,
        `Add <code>DeferredSearch</code> and <code>TransitionSearch</code> and render them one at a time. Repeat the trace and compare long-task durations and how the input feels. Then remove <code>memo</code> from <code>SlowList</code> and observe that <code>DeferredSearch</code> lags again. Explain why.`,
        `Break <code>TransitionSearch</code> on purpose: use one state for both the input and the list and wrap its setter in <code>startTransition</code>. Type quickly, describe the symptom, then restore the split state.`,
        `Build the <code>Dashboard</code> with three lazy tabs. To exaggerate the load, make one tab's module wait before it resolves: <code>lazy(() =&gt; new Promise(r =&gt; setTimeout(r, 1500)).then(() =&gt; import('./tabs/Analytics')))</code>. Compare an urgent <code>setTab</code> with the transition version: one flashes the fallback, the other keeps the old tab.`,
        `Create <code>cartStore.ts</code>, show <code>useCartCount()</code> in a header badge and in a sidebar, and update the store from a <code>setInterval</code> every 50 ms while you type in the transition search. Both always show the same count. Then try the "WRONG" snapshot version and read the console error.`,
        `<b>Done when:</b> typing in the search stays smooth under 4x throttling with both fixes; tab switches keep the previous tab visible with an inline "Loading…"; and you can explain, without notes, why the controlled input broke, why <code>memo</code> was required for the deferred value, and what <code>useSyncExternalStore</code> does when the store changes mid-render.`
      ],
      teach: `<p>"Concurrent React is about priorities, not threads. Since React 18, when you call <code>createRoot</code>, React can render a low-priority update in the background, in small slices, and drop it if something more urgent happens. But only updates you mark as non-urgent are rendered that way.</p>
<p>There are two ways to mark them. <code>useTransition</code> gives you <code>startTransition</code>, which you wrap around a state update you own, such as setting the filter query, and an <code>isPending</code> flag to dim the old results. <code>useDeferredValue</code> takes a value and gives you a version of it that lags behind. The urgent render uses the old value, so a memoised expensive child can skip it, and the background render catches up. Neither one is a debounce, and neither can drive a controlled input's own value: the input has to stay urgent.</p>
<p>Suspense is the loading story. Inside a boundary, a component waiting for lazy code or Suspense-enabled data shows the nearest fallback. If the update is a transition, React keeps the content that's already on screen instead of flashing a spinner. And since rendering can now pause, external stores could tear, with two components showing different values, so stores are read through <code>useSyncExternalStore</code>, which re-renders synchronously if the store changed mid-render. It's still one thread throughout. React just decides what to do first."</p>`
    }
  ],
  quiz: [
    {
      q: `A product list of 3,000 rows loads from <code>/api/products</code>. Typing in the search box above it lags badly: characters appear in bursts. The list component is already wrapped in <code>memo</code>. What is the smallest change that keeps typing smooth, and why doesn't <code>memo</code> help on its own?`,
      code: `function Search({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ProductList products={products} query={query} />   {/* memo'd, but slow */}
    </>
  );
}`,
      lang: "tsx",
      ans: `Pass a deferred value: <code>const deferredQuery = useDeferredValue(query)</code> and render <code>&lt;ProductList query={deferredQuery} /&gt;</code> (optionally dimming while <code>query !== deferredQuery</code>).`,
      why: `<code>memo</code> skips a render only when the props are unchanged, and <code>query</code> changes on every keystroke, so the slow list renders in the same urgent render as the input. With <code>useDeferredValue</code>, the urgent render passes the old query, so <code>memo</code> bails out and the input commits immediately. The list then renders in an interruptible background pass that is abandoned when you type again. Splitting the state and using <code>startTransition</code> works equally well. Rendering fewer rows (virtualisation) is the complementary fix.`
    },
    {
      q: `A teammate "optimised" a search input with a transition. Now the input drops and reorders characters when you type fast. Find the bug.`,
      code: `function Search() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <input
        value={query}
        onChange={e => startTransition(() => setQuery(e.target.value))}
      />
      {isPending && <Spinner />}
      <Results query={query} />
    </>
  );
}`,
      lang: "tsx",
      ans: `The controlled input's own value is updated inside a transition. Keep the input state urgent and transition only the expensive state.`,
      why: `Transition updates are deferred and can be interrupted, so the value React renders into the <code>&lt;input&gt;</code> falls behind what the user typed, and React keeps resetting it. Fix: <code>const [text, setText] = useState('')</code> for the input, with <code>setText(v)</code> called urgently; then <code>startTransition(() =&gt; setQuery(v))</code> for <code>&lt;Results&gt;</code>. Read <code>e.target.value</code> into <code>v</code> first. Alternatively keep one state and render <code>&lt;Results query={useDeferredValue(query)} /&gt;</code> with a memoised <code>Results</code>.`
    },
    {
      q: `Clicking between the "Orders" and "Analytics" tabs makes the whole content area flash "Loading…" for a fraction of a second every time a tab is opened for the first time, even though the previous tab was fully rendered. What causes it, and how do you keep the old tab visible?`,
      code: `const Analytics = lazy(() => import('./tabs/Analytics'));
const Orders = lazy(() => import('./tabs/Orders'));

function Tabs() {
  const [tab, setTab] = useState<'orders' | 'analytics'>('orders');
  return (
    <>
      <button onClick={() => setTab('orders')}>Orders</button>
      <button onClick={() => setTab('analytics')}>Analytics</button>
      <Suspense fallback={<p>Loading…</p>}>
        {tab === 'orders' ? <Orders /> : <Analytics />}
      </Suspense>
    </>
  );
}`,
      lang: "tsx",
      ans: `<code>setTab</code> is urgent, so when the lazy tab suspends, the already-visible boundary must show its fallback. Wrap the switch in a transition: <code>startTransition(() =&gt; setTab(t))</code>, and show <code>isPending</code> next to the buttons.`,
      why: `For an urgent update React can't wait, so it replaces the boundary's content with the fallback. For a transition, React keeps the committed UI on screen until the new tab's code (or data) is ready, then commits in one go. Preloading the chunk on hover or focus shortens the wait further. Artificial "minimum spinner time" hacks hide the symptom and make the page slower.`
    },
    {
      q: `What does this log, in order, when "Go" is clicked? (No StrictMode.)`,
      code: `function Page() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [isPending, startTransition] = useTransition();
  console.log('render', { a, b, isPending });
  return (
    <button onClick={() => {
      setA(1);
      startTransition(() => setB(1));
    }}>Go</button>
  );
}`,
      lang: "tsx",
      ans: `<code>render {a: 1, b: 0, isPending: true}</code> then <code>render {a: 1, b: 1, isPending: false}</code>`,
      why: `The two updates get different lanes. The urgent pass processes the sync lane: <code>a</code> becomes 1, and <code>isPending</code> becomes <code>true</code>, while the transition update to <code>b</code> is skipped and stays queued. That render commits. Then React renders the transition lane, applying <code>b = 1</code> and resetting <code>isPending</code> to <code>false</code> in the same lane, and commits again. A common wrong answer is a single render with <code>{a: 1, b: 1}</code>. Automatic batching merges updates of the <i>same</i> priority; a transition is deliberately split out.`
    },
    {
      q: `A header badge and a sidebar both read the cart count from a module-level object updated by a WebSocket. During heavy transitions, QA occasionally sees the header say 3 and the sidebar say 4 in the same frame. Which hook fixes this, and what must its snapshot function do?`,
      code: `export const cart = { items: 0 };
socket.onmessage = e => { cart.items = JSON.parse(e.data).items; notify(); };

function useCartCount() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribe(force), []);
  return cart.items;   // read a mutable global during render
}`,
      lang: "tsx",
      ans: `Use <code>useSyncExternalStore(subscribe, () =&gt; cart.items)</code>. The snapshot must return a value that is stable (by <code>Object.is</code>) while the store hasn't changed: a primitive, or a cached/immutable object.`,
      why: `This is <b>tearing</b>. A concurrent render yields between components, the WebSocket mutates <code>cart.items</code> in between, and the two components read different values but are committed together. <code>useSyncExternalStore</code> checks the snapshot again before commit and re-renders synchronously if it changed, so all readers agree. Returning a fresh object from <code>getSnapshot</code> (for example <code>{ ...cart }</code>) would make React think the store always changed and loop. Better still, make the store immutable (replace the object on every change), as Redux and Zustand do.`
    },
    {
      q: `An architect proposes: "Our 400 ms dashboard render blocks the page. Let's upgrade to createRoot and wrap the update in startTransition, because concurrent React runs it on another thread." What is wrong with the claim, and when would the transition actually help?`,
      ans: `Concurrent React is single-threaded. A transition helps only if the 400 ms is spread across many components, so that React can yield between fibers. It can't split one 400 ms component.`,
      why: `React yields only between units of work (fibers). If most of the cost is one function (a large synchronous aggregation, or parsing a huge payload), it blocks the main thread whatever its priority. Then the fix is structural: aggregate in PostgreSQL and cache the result in Redis behind FastAPI, compute in a Web Worker, memoise, or virtualise. If the cost is 2,000 cheap widgets, a transition will slice it and keep input responsive. The total work doesn't shrink, though, and <code>createRoot</code> alone makes nothing concurrent.`
    }
  ]
},
/* ===== Day 13 ===== */
{
  n: 13,
  title: "Server rendering",
  goal: `<b>By the end of today</b> you can choose between CSR, SSR, SSG, ISR and streaming per route and defend the choice with TTFB, LCP, SEO and server-cost arguments; explain hydration (and fix a mismatch) from first principles; and describe React Server Components, Server Functions and the Next.js App Router accurately enough to decide whether your FastAPI product needs them at all.`,
  rev: [
    `<b>Rendering strategies:</b> CSR ships an empty shell and renders in the browser; SSR renders HTML per request; SSG renders at build time; ISR (a Next.js feature) re-generates static pages in the background after a revalidation window; streaming SSR sends the HTML shell first and flushes <code>&lt;Suspense&gt;</code> boundaries as their data resolves. Choose <b>per route</b>, not per app.`,
    `<b>Hydration</b> = React on the client renders the same tree again, <i>claims</i> the server's DOM nodes instead of creating new ones, and attaches event handlers. APIs: <code>renderToString</code> (legacy, no streaming), <code>renderToPipeableStream</code> (Node), <code>renderToReadableStream</code> (Web streams), <code>hydrateRoot</code> on the client. The first client render must produce exactly the server's output.`,
    `<b>Mismatch causes:</b> <code>Date.now()</code>/<code>Math.random()</code> in render, <code>typeof window</code> branches, locale/time-zone formatting, invalid HTML nesting, browser extensions. Fixes: pass the value from the server, render client-only bits after mount (<code>useEffect</code> or <code>useSyncExternalStore</code> with a server snapshot), and <code>suppressHydrationWarning</code> only for one element's unavoidable text.`,
    `<b>Server Components</b> run only on the server (or at build), can be <code>async</code>, read data directly, and ship <b>zero JS</b>; they cannot use state, effects or browser APIs. <code>'use client'</code> marks the <b>boundary</b>: that module and its imports become client code. Props crossing it must be serialisable; server components can still be passed in as <code>children</code>.`,
    `<b>Server Functions</b> (<code>'use server'</code>) are <b>public HTTP endpoints</b>: validate input (Zod) and authorise on every call. Next.js App Router: <code>layout</code>, <code>page</code>, <code>loading</code>, <code>error</code>, <code>route</code> files in <code>app/</code>. Caching defaults are version-dependent (Next.js 15 made <code>fetch</code> uncached by default): always check the docs for your version.`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d13-ssr",
      title: "Rendering strategies: CSR, SSR, SSG, streaming and hydration",
      lv: ["mid", "senior", "lead", "architect"],
      eli5: `<p>Imagine ordering flat-pack furniture. With <b>client-side rendering</b> the shop sends you a box of parts and an instruction booklet. Nothing is usable until <i>you</i> assemble it at home. If your tools are slow (a cheap phone), you sit on the floor for a while.</p>
<p>With <b>server-side rendering</b> the shop assembles the wardrobe in the warehouse and delivers it built. You can see it and put clothes in it immediately. But the doors are not yet attached to their hinges: a technician (the JavaScript) arrives a moment later and "wires it up" so the doors actually open. That wiring-up is called <b>hydration</b>.</p>
<p><b>Static generation</b> is a showroom piece built once, before anyone ordered, and copied for everyone: very fast, but it shows the same thing to every customer. <b>Streaming</b> is the shop delivering the frame first and the drawers as soon as each is ready, instead of waiting for the slowest drawer.</p>
<p>And a <b>hydration mismatch</b>? The technician arrives with a manual that describes a slightly different wardrobe (say, a clock on the door showing a different time). He can't wire it up safely, so he rebuilds that part from scratch, which is slow and confusing.</p>`,
      what: `<p><b>Rendering strategy</b> answers one question: <i>where and when is the HTML for this page produced?</i> React itself can render in the browser (to DOM) or on a server (to an HTML string or stream). Frameworks combine these into strategies.</p>
<h5>The five strategies</h5>
<ul class="pts">
<li><b>CSR (client-side rendering)</b>: the server returns a near-empty <code>index.html</code> (<code>&lt;div id="root"&gt;&lt;/div&gt;</code> and a script tag). The browser downloads the JS, runs it, fetches data from <code>/api/...</code>, then renders. This is what a Vite app is by default, and what you have built all course.</li>
<li><b>SSR (server-side rendering)</b>: on each request a Node (or edge) server runs your components, produces HTML with real content, and sends it. The browser shows it immediately, then downloads the same JS and <b>hydrates</b>.</li>
<li><b>SSG (static site generation)</b>: the SSR step runs <b>at build time</b> for a known set of URLs; the output is plain <code>.html</code> files on a CDN. Zero server cost per request; content is as fresh as the last build.</li>
<li><b>ISR (incremental static regeneration)</b>: a Next.js feature (not a React API). A page is served statically, and after a revalidation window the next request still gets the stale page while a fresh version is regenerated in the background (stale-while-revalidate for HTML). Some hosts and frameworks have equivalents under other names.</li>
<li><b>Streaming SSR</b>: the server sends the HTML <b>shell</b> as soon as it is ready (layout, nav, <code>&lt;Suspense&gt;</code> fallbacks) and then streams the content of each Suspense boundary as its data resolves, in the same HTTP response. The slow part no longer holds up the fast part.</li>
</ul>
<h5>How they compare</h5>
<table class="tbl"><tr><th></th><th>CSR</th><th>SSR</th><th>SSG</th><th>ISR</th><th>Streaming SSR</th></tr>
<tr><td>TTFB (time to first byte)</td><td>Very fast (static file)</td><td>Slowest: waits for data + render</td><td>Very fast (CDN)</td><td>Very fast (CDN)</td><td>Fast: shell flushes early</td></tr>
<tr><td>FCP (first contentful paint)</td><td>Late: after JS runs</td><td>Early</td><td>Early</td><td>Early</td><td>Early (shell + fallbacks)</td></tr>
<tr><td>LCP (largest contentful paint)</td><td>Late: JS + API round trip</td><td>Good if data is fast</td><td>Best</td><td>Best</td><td>Good: hero content can be in the shell</td></tr>
<tr><td>Time to interactive</td><td>After JS + render</td><td>After JS + hydration</td><td>After JS + hydration</td><td>After JS + hydration</td><td>Per boundary (selective hydration)</td></tr>
<tr><td>SEO / link previews</td><td>Weakest</td><td>Strong</td><td>Strong</td><td>Strong</td><td>Strong</td></tr>
<tr><td>Freshness</td><td>Live</td><td>Live</td><td>As of last build</td><td>Stale up to window</td><td>Live</td></tr>
<tr><td>Server cost</td><td>Static hosting only</td><td>CPU per request</td><td>Build time only</td><td>Occasional regeneration</td><td>CPU per request, longer-held connections</td></tr>
<tr><td>Personalised per user</td><td>Yes</td><td>Yes</td><td>No (client-fetch the personal bits)</td><td>No</td><td>Yes</td></tr></table>
<p>Note: "TTI" is a classic lab metric; today's Core Web Vitals are LCP, INP and CLS (Day 11). SSR improves LCP but can <i>hurt</i> INP if a big hydration task blocks the main thread right when the user first taps.</p>
<h5>The React APIs</h5>
<ul class="pts">
<li><code>renderToString(element)</code> from <code>react-dom/server</code>: synchronous, returns a complete HTML string. No streaming, and Suspense boundaries that suspend render their <b>fallback</b> into the HTML. Fine for tiny cases and tests; considered legacy for real SSR.</li>
<li><code>renderToPipeableStream(element, options)</code>: Node streams. Returns <code>{ pipe, abort }</code>. Callbacks: <code>onShellReady</code> (start piping: streaming), <code>onAllReady</code> (everything resolved: use for crawlers or SSG), <code>onShellError</code>, <code>onError</code>. Option <code>bootstrapScripts</code> injects the client entry.</li>
<li><code>renderToReadableStream(element, options)</code>: the Web Streams version for Deno, Bun, Cloudflare Workers and other edge runtimes. Returns a <code>Promise&lt;ReadableStream&gt;</code>; <code>await stream.allReady</code> waits for everything.</li>
<li><code>prerender</code> / <code>prerenderToNodeStream</code> from <code>react-dom/static</code> (React 19): render to static HTML <i>waiting for all data</i>, intended for SSG. Newer React releases add more pre-render/resume APIs; check the docs for your version before relying on them.</li>
<li><code>hydrateRoot(container, element, options)</code> from <code>react-dom/client</code>: the client counterpart of <code>createRoot(...).render(...)</code> when HTML already exists. Options include <code>onRecoverableError</code> (where hydration mismatches are reported) and, in React 19, <code>onCaughtError</code>/<code>onUncaughtError</code>.</li>
</ul>
<h5>Hydration, precisely</h5>
<p>Hydration is <b>not</b> "attaching listeners to existing HTML". React renders your whole component tree on the client <i>again</i> (running your components, hooks and all) and, instead of creating DOM nodes in the commit phase, it walks the existing DOM in parallel and <b>claims</b> each node for the matching fiber. Then it attaches its delegated event listeners at the root and runs effects. So the client must download the JS for every hydrated component and spend CPU rendering it once more. SSR gives you early pixels, not free interactivity.</p>
<p>The rule that follows: <b>the first client render must produce the same output as the server render</b>. Anything that differs between the two environments causes a <b>hydration mismatch</b>:</p>
<ul class="pts">
<li><b>Time and randomness</b>: <code>Date.now()</code>, <code>new Date().toLocaleTimeString()</code>, <code>Math.random()</code>, <code>crypto.randomUUID()</code> in render. (Use <code>useId</code> for ids: it is stable across server and client.)</li>
<li><b>Environment checks</b>: <code>typeof window !== "undefined" ? A : B</code>, <code>localStorage</code> reads, <code>matchMedia</code>, <code>navigator.language</code> in render.</li>
<li><b>Locale and time zone</b>: <code>Intl.NumberFormat()</code> or <code>toLocaleDateString()</code> without an explicit locale and <code>timeZone</code>: the server (often UTC, <code>en-US</code>) and the user's browser disagree.</li>
<li><b>Invalid HTML nesting</b>: <code>&lt;div&gt;</code> inside <code>&lt;p&gt;</code>, <code>&lt;a&gt;</code> inside <code>&lt;a&gt;</code>, a <code>&lt;tr&gt;</code> without <code>&lt;tbody&gt;</code>. The browser's HTML parser "repairs" the server HTML, so the DOM no longer matches what React expects.</li>
<li><b>Browser extensions</b> (password managers, translators, Grammarly) that inject attributes or nodes before React hydrates. React 19 is more tolerant: it skips unexpected tags inserted into <code>&lt;head&gt;</code> and <code>&lt;body&gt;</code> by third-party scripts, but attributes on your own elements can still trigger warnings.</li>
</ul>
<p>What happens on a mismatch: for text content, React cannot trust the server DOM, so it reports a recoverable error (via <code>onRecoverableError</code>, and in development a console diff) and <b>re-renders on the client</b> from the nearest <code>&lt;Suspense&gt;</code> boundary above the mismatch (or the whole root if there is none), discarding that server HTML. Attribute mismatches are only warned about in development and <b>are not patched</b>: the stale attribute simply stays in the DOM. Both are bugs: one costs performance, the other leaves wrong UI.</p>
<h5>The fixes</h5>
<ul class="pts">
<li><b>Make the value identical</b>: compute it on the server and pass it down (serialised into the page), or format with an explicit locale and <code>timeZone</code>.</li>
<li><b>Two-pass render for client-only UI</b>: render a neutral placeholder on the server and the first client render, then switch after mount with <code>useEffect</code> (or <code>useSyncExternalStore</code> with a <code>getServerSnapshot</code>). This causes one extra render but no mismatch.</li>
<li><code>suppressHydrationWarning</code> on <b>one element</b> whose text is unavoidably different (a timestamp). It works one level deep, only silences the warning, and React does <b>not</b> patch the text: an escape hatch, not a fix.</li>
<li><b>Lazy client-only components</b>: render them only after mount, or (in frameworks) use the framework's "no SSR" option.</li>
</ul>
<h5>Selective hydration</h5>
<p>Since React 18, each <code>&lt;Suspense&gt;</code> boundary is hydrated as an independent unit. With streaming, React can hydrate the shell before a slow boundary's HTML has even arrived; boundaries hydrate as their HTML and code arrive; and if the user clicks inside a boundary that is not yet hydrated, React <b>raises that boundary's priority</b> and hydrates it first (and, for discrete events like clicks, generally replays the event afterwards). Hydration also yields to the browser between units of work (concurrent rendering, Day 12), so one huge page no longer means one huge blocking task.</p>
<h5>Where your stack fits</h5>
<p>The running example (Vite SPA → FastAPI → Redis → PostgreSQL) is <b>CSR</b>. FastAPI (Python) cannot run React components, so SSR means adding a JavaScript server: a framework (Next.js, or React Router v7 in framework mode) or a hand-rolled Node server. The question is never "is SSR better?" but "which routes need HTML on first byte, and is that worth a second runtime?"</p>`,
      why: `<p>For years the default React app was pure CSR, and it has real strengths: one static bundle on a CDN, an API server that only speaks JSON, no Node in production, and fast navigation once loaded. FastAPI + Vite is exactly this architecture, and for a logged-in dashboard it is often the right one.</p>
<p>But CSR has three structural costs that no amount of tuning removes:</p>
<ul class="pts">
<li><b>A waterfall before the first meaningful pixel</b>: HTML → JS bundle (parse, execute) → API request → render. On a mid-range phone over 4G, the white screen or spinner can last seconds. LCP suffers directly.</li>
<li><b>Content that isn't in the HTML</b>: Googlebot does render JavaScript, but in a deferred second pass with resource limits. Most other crawlers, and almost all <b>link-preview scrapers</b> (Slack, WhatsApp, LinkedIn, X), read only the initial HTML: no <code>&lt;title&gt;</code>, no Open Graph tags, no preview card.</li>
<li><b>Everything depends on JS succeeding</b>: a failed chunk download, an old browser or an exception before render means a blank page.</li>
</ul>
<p>Classic SSR (PHP, Rails, Django templates) never had these problems but had no rich client-side interactivity without a second code base (jQuery sprinkles). <b>Isomorphic / universal rendering</b> (one React tree, rendered on the server for the first paint and hydrated on the client) was the answer. Then <code>renderToString</code>'s weaknesses showed up at scale: the server had to fetch <i>all</i> data before sending a single byte, and the client had to hydrate the <i>whole</i> page before any of it was interactive. React 18's streaming SSR and selective hydration exist to break both "all-or-nothing" steps, and Server Components (next topic) go further by not sending some components' JS at all.</p>`,
      diagram: {
        html: flow([["Request", "GET /products/42", "w"], ["Server renders shell", "layout, nav, fallbacks"], ["Flush HTML", "browser paints (FCP)", "g"], ["Stream boundaries", "as data resolves"], ["JS loads", "hydrateRoot"], ["Hydrate per boundary", "clicked one first", "g"]]) +
          lanes([
            ["CSR (Vite SPA)", ["HTML: empty <code>#root</code>", "Download + run JS", "<code>fetch('/api/...')</code>", "Render: first content", "Interactive"]],
            ["SSR (renderToString)", ["Server fetches ALL data", "Render full HTML", "Browser paints content", "Download JS", "Hydrate WHOLE page", "Interactive"]],
            ["Streaming SSR", ["Shell flushed fast", "Paint shell + fallbacks", "Boundaries stream in", "Hydrate boundaries independently", "Interactive progressively"]]
          ]),
        steps: [
          "The server starts rendering the tree. Anything outside a <code>&lt;Suspense&gt;</code> boundary that suspends would block the shell, so slow data lives <i>inside</i> boundaries.",
          "When the shell is ready, <code>onShellReady</code> fires and the server pipes HTML: the browser can parse and paint the layout and fallbacks while the server keeps working.",
          "As each boundary's data resolves, the server writes its HTML at the end of the stream with a tiny inline script that swaps it into the fallback's place, still in the same response.",
          "The client bundle (from <code>bootstrapScripts</code>) calls <code>hydrateRoot</code>. React renders the tree again and claims existing DOM nodes instead of creating them.",
          "Each boundary hydrates independently; a user interaction inside an unhydrated boundary bumps its priority. Mismatches inside a boundary force a client re-render of that boundary only."
        ]
      },
      ex: [
        {
          t: "1. The CSR baseline you already have (Vite)",
          lang: "html",
          code: `<!-- index.html: what the server (or CDN, or FastAPI StaticFiles) actually sends -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Shop</title>
    <script type="module" crossorigin src="/assets/index-3f9a1c.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
          out: "View source shows no products, no headings, no prices. Everything appears only after the JS runs and /api/products returns.",
          note: `<p>This is the page a crawler or a Slack link preview sees. <code>main.tsx</code> calls <code>createRoot(document.getElementById("root")!).render(&lt;App /&gt;)</code>, which <b>creates</b> every DOM node. Hydration replaces exactly that call with <code>hydrateRoot</code>, which <b>reuses</b> nodes the server already produced.</p>`
        },
        {
          t: "2. renderToString: React on the server in 6 lines",
          lang: "tsx",
          code: `// render-demo.tsx
// npm install react react-dom && npm install -D tsx @types/react-dom
// run: npx tsx render-demo.tsx
import { renderToString } from "react-dom/server";

function Greeting({ name }: { name: string }) {
  return <h1 className="title">Hello, {name}</h1>;
}

console.log(renderToString(<Greeting name="Asha" />));`,
          out: `<h1 class="title">Hello, <!-- -->Asha</h1>`,
          note: `<p>Three things to notice. <code>className</code> became <code>class</code>. No event handlers or effects ran: the server output is pure HTML. And React inserted <code>&lt;!-- --&gt;</code> between the two adjacent text nodes (<code>"Hello, "</code> and <code>{name}</code>) so the client can split them back into the same two text nodes during hydration. If <code>tsx</code> reports "React is not defined", add <code>"jsx": "react-jsx"</code> to the <code>compilerOptions</code> of the <code>tsconfig.json</code> it picks up.</p>`
        },
        {
          t: "3. Streaming SSR with renderToPipeableStream (Express)",
          lang: "tsx",
          code: `// server.tsx  (npm install express && npm install -D tsx @types/express)
import express from "express";
import { renderToPipeableStream } from "react-dom/server";
import { App } from "./src/App";

const app = express();
app.use("/assets", express.static("dist/client/assets"));

// Last middleware: handle every other GET with React.
app.use((req, res) => {
  let didError = false;

  const { pipe, abort } = renderToPipeableStream(<App url={req.url} />, {
    bootstrapScripts: ["/assets/client.js"],
    onShellReady() {
      // The shell (outside every Suspense boundary) is ready: start streaming.
      res.statusCode = didError ? 500 : 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      pipe(res);
    },
    onShellError(error) {
      // Nothing could be rendered: send a minimal fallback page.
      console.error("shell failed", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send("<!doctype html><p>Something went wrong.</p>");
    },
    onError(error) {
      // Errors inside Suspense boundaries: logged; the client retries rendering them.
      didError = true;
      console.error(error);
    },
  });

  // Don't hold the connection forever: remaining boundaries fall back to client rendering.
  setTimeout(() => abort(), 10_000);
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
          note: `<p>Here <code>App</code> renders the <b>whole document</b> (<code>&lt;html&gt;</code>, <code>&lt;head&gt;</code>, <code>&lt;body&gt;</code>), which is what <code>renderToPipeableStream</code> expects. For a crawler you could wait for <code>onAllReady</code> instead of <code>onShellReady</code> so the response contains every boundary's final HTML. Building <code>client.js</code>, CSS links and asset hashes is the part frameworks do for you; Vite's SSR guide shows the manual wiring, and React Router v7 framework mode or Next.js do it out of the box.</p>`
        },
        {
          t: "4. The shared App: where the Suspense boundaries go",
          lang: "tsx",
          code: `// src/App.tsx
import { Suspense, lazy } from "react";

const Reviews = lazy(() => import("./Reviews")); // slow: its own chunk and its own data

export function App({ url }: { url: string }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Product 42 | Shop</title>
        <meta name="description" content="Ergonomic chair, free delivery" />
      </head>
      <body>
        <header>Shop (you are at {url})</header>
        <main>
          {/* In the shell: painted on the first flush, good for LCP and SEO */}
          <h1>Ergonomic chair</h1>
          <p>INR 12,499</p>

          {/* Streams later; hydrates independently */}
          <Suspense fallback={<p>Loading reviews…</p>}>
            <Reviews productId={42} />
          </Suspense>
        </main>
      </body>
    </html>
  );
}`,
          out: "First flush: header, title, price and the 'Loading reviews…' fallback. Later in the same response: the reviews HTML plus a small inline script that swaps it in.",
          note: `<p>Decide what goes in the shell deliberately: the LCP element, the <code>&lt;h1&gt;</code> and the metadata belong there; personalised or slow widgets go inside boundaries. An error thrown inside a boundary on the server does not kill the page: the fallback is sent and the client tries to render that boundary itself.</p>`
        },
        {
          t: "5. The client entry: hydrateRoot with error reporting",
          lang: "tsx",
          code: `// src/client.tsx  (built by Vite to /assets/client.js)
import { hydrateRoot } from "react-dom/client";
import { App } from "./App";

hydrateRoot(document, <App url={window.location.pathname} />, {
  onRecoverableError(error, errorInfo) {
    // Hydration mismatches and server-boundary errors land here in production.
    console.warn("recoverable", error, errorInfo.componentStack);
    // reportToSentry(error, { extra: { componentStack: errorInfo.componentStack } });
  },
});`,
          note: `<p>Two details matter. The element passed to <code>hydrateRoot</code> must render the same tree as the server did: here the server used <code>req.url</code> (path plus query) while the client uses <code>pathname</code> only, which mismatches as soon as there is a query string. Pass the <i>same</i> value; frameworks serialise it for you. And never call <code>createRoot</code> on server-rendered HTML: it discards the markup and renders from scratch, which works but throws away every SSR benefit.</p>`
        },
        {
          t: "6. Hydration mismatches and their fixes",
          lang: "tsx",
          code: `import { useEffect, useState, useSyncExternalStore } from "react";

// BUG: server renders 10:00:01, client renders 10:00:03 -> text mismatch.
export function BadClock() {
  return <span>{new Date().toLocaleTimeString()}</span>;
}

// FIX A: value comes from the server, formatted with explicit locale + time zone.
const fmt = new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" });
export function OrderTime({ placedAt }: { placedAt: string }) {
  return <time dateTime={placedAt}>{fmt.format(new Date(placedAt))}</time>;
}

// FIX B: two-pass render for genuinely client-only values.
export function LocalClock() {
  const [now, setNow] = useState<Date | null>(null); // same on server and first client render
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{now ? now.toLocaleTimeString() : "--:--"}</span>;
}

// FIX C: "am I hydrated?" without an effect, via useSyncExternalStore.
const noop = () => () => {};
export function useIsClient(): boolean {
  return useSyncExternalStore(noop, () => true, () => false); // client snapshot, server snapshot
}
export function ThemeIcon() {
  const isClient = useIsClient();
  const dark = isClient && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return <span aria-hidden>{dark ? "moon" : "sun"}</span>;
}

// ESCAPE HATCH: one element, unavoidable difference, warning silenced (not patched).
export function RenderedAt() {
  return <small suppressHydrationWarning>{new Date().toISOString()}</small>;
}`,
          note: `<p><code>useSyncExternalStore</code> uses <code>getServerSnapshot</code> on the server <b>and during hydration</b>, then switches to the client snapshot, so <code>ThemeIcon</code> hydrates as "sun" and re-renders immediately if needed. Every two-pass fix causes a visible flip for the client-only part; for theme, prefer a CSS media query or a cookie the server can read so the first HTML is already right.</p>`
        },
        {
          t: "7. Shipping server data to the client safely",
          lang: "tsx",
          code: `// On the server: embed the data the first client render needs.
type Product = { id: number; name: string; price: number };

function serialize(data: unknown): string {
  // Escape "<" so a value like "</script><script>alert(1)</script>" can't break out.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function DataScript({ product }: { product: Product }) {
  return (
    <script
      id="__DATA__"
      type="application/json"
      dangerouslySetInnerHTML={{ __html: serialize(product) }}
    />
  );
}

// On the client, before hydrateRoot:
// const product = JSON.parse(document.getElementById("__DATA__")!.textContent!) as Product;
// hydrateRoot(document, <App url={location.pathname} product={product} />);`,
          note: `<p>This is the hand-rolled version of what every SSR framework does (Next.js pages router <code>__NEXT_DATA__</code>, TanStack Query <code>dehydrate</code>/<code>HydrationBoundary</code>, React Router loader data). Without it, the client renders without data, mismatches, and refetches. Escaping <code>&lt;</code> is a real XSS defence: product names, reviews and usernames are user input.</p>`
        }
      ],
      internals: `<p><b>Server side.</b> React DOM's server renderer (internally called Fizz) walks the element tree without fibers or a DOM: it calls your components, runs <code>useState</code> initialisers and <code>useMemo</code> once, ignores <code>useEffect</code> and <code>useLayoutEffect</code> entirely, and writes HTML chunks into a buffer. When a component suspends (a lazy component that isn't loaded, or <code>use(promise)</code> on a pending promise), Fizz writes the nearest <code>&lt;Suspense&gt;</code> fallback in its place, wrapped in comment markers, and parks that subtree as a pending task. When the promise resolves it renders the subtree, appends the HTML to the stream inside a hidden container, and adds a tiny inline script that moves it into place. The exact marker format and script names are implementation details (currently comment nodes such as <code>&lt;!--$--&gt;</code>, <code>&lt;!--$?--&gt;</code>, <code>&lt;!--/$--&gt;</code>), but they explain why hand-editing streamed HTML (for example by a proxy that rewrites the body) breaks hydration.</p>
<p><b>Client side.</b> <code>hydrateRoot</code> creates a FiberRoot exactly like <code>createRoot</code> but flags it as hydrating. During the render phase, when <code>beginWork</code> reaches a host component it tries to <b>claim the next hydratable DOM node</b>: if the tag (and, for text, the content) matches, the fiber's <code>stateNode</code> points at the existing node and nothing is created. In <code>completeWork</code> React compares props with the existing attributes (in development, to warn) and attaches the fiber reference to the DOM node. The commit phase then skips DOM insertion for claimed nodes and runs layout effects and effects as usual. Events: since React 17 listeners are attached once at the root container, so "attaching handlers" is really "the root now knows which fiber owns each node".</p>
<p><b>Dehydrated boundaries.</b> A Suspense boundary from the server starts as a special <b>dehydrated</b> fiber that just points at the comment-delimited DOM range. It is hydrated later as a separate unit of work at a lower priority. If a discrete event (a click) targets a node inside a dehydrated boundary, React synchronously attempts to hydrate that boundary and then dispatches the event; this is the "selective hydration" behaviour. If hydration of a boundary finds a mismatch, React throws away that boundary's server DOM and client-renders it (reported through <code>onRecoverableError</code>); with no boundary above, the whole root is client-rendered.</p>
<p><b>Why <code>useEffect</code> is the client-only escape.</b> Effects never run on the server and run on the client <i>after</i> hydration has committed. So state set in an effect produces a second, normal client render that is compared against the already-hydrated DOM, never against server HTML. <code>useSyncExternalStore</code> achieves the same with <code>getServerSnapshot</code>: React uses the server snapshot during hydration and re-renders if the client snapshot differs.</p>
<p><b>Cost model.</b> SSR moves the first render to the server; it does not remove the client render. Bytes of JS and hydration CPU are still proportional to the number of hydrated components. This is the exact cost Server Components attack: components that never hydrate send no JS.</p>`,
      prod: `<h5>FastAPI + Vite SPA vs Next.js in front of FastAPI</h5>
<table class="tbl"><tr><th></th><th>Vite SPA + FastAPI</th><th>Next.js (BFF) + FastAPI</th></tr>
<tr><td>Runtimes in production</td><td>Static files (CDN, nginx, or FastAPI <code>StaticFiles</code>) + Python</td><td>Node (or edge) server + Python</td></tr>
<tr><td>Request path</td><td>Browser → <code>/api</code> → FastAPI</td><td>Browser → Next → FastAPI over the private network (and optionally browser → FastAPI directly)</td></tr>
<tr><td>Auth</td><td>HttpOnly cookie or token sent to FastAPI (Day 8)</td><td>Session cookie on the Next domain; Next forwards a token to FastAPI server-to-server</td></tr>
<tr><td>First paint</td><td>After JS + API</td><td>HTML with data</td></tr>
<tr><td>Ops burden</td><td>Lowest</td><td>One more service to scale, monitor, deploy and secure</td></tr>
<tr><td>Best for</td><td>Dashboards, internal tools, apps behind login</td><td>Marketing, catalogue, content, public SEO pages, mixed apps</td></tr></table>
<p>The <b>BFF (backend for frontend)</b> pattern: the Next.js server becomes a thin backend owned by the frontend team. It aggregates several FastAPI calls into one page render, hides internal URLs and service tokens, and shapes data for the UI. FastAPI stays the system of record (business rules, validation, PostgreSQL, Redis). Do not let business logic leak into the BFF just because it is convenient: two places enforcing rules drift.</p>
<h5>Deciding per route</h5>
<ul class="pts">
<li><b>Public, indexable, mostly the same for everyone</b> (home, pricing, blog, docs): SSG, or ISR / CDN caching if it changes.</li>
<li><b>Public, needs fresh data per request</b> (product page with stock, search results): SSR or streaming SSR with the hero in the shell, cached at the CDN for a few seconds if acceptable.</li>
<li><b>Behind login, highly interactive</b> (dashboard, editor, admin): CSR is fine; SEO is irrelevant and users return often with a warm cache. Optimise bundle size and API latency instead.</li>
<li><b>Hybrid</b>: React Router v7 framework mode and Next.js both let you choose per route. A common setup is static marketing pages plus a CSR app under <code>/app</code>.</li>
</ul>
<h5>What goes wrong at scale</h5>
<ul class="pts">
<li><b>SSR server as a bottleneck</b>: rendering is CPU-bound and single-threaded per Node process. A slow FastAPI call inside the shell holds a connection and delays TTFB for every user. Put timeouts on server-side fetches and keep slow calls inside Suspense boundaries.</li>
<li><b>Double fetching</b>: the server fetches data, the client doesn't receive it, and refetches on mount. Serialise it (example 7) or use your data library's hydration support.</li>
<li><b>Leaking per-user state across requests</b>: a module-level cache or a singleton QueryClient on the server shares data between users. Create per-request instances.</li>
<li><b>Caching personalised HTML</b>: a CDN caching an SSR page that contains a user's name. Mark personalised responses <code>Cache-Control: private</code> or <code>no-store</code>.</li>
<li><b>Mismatches hidden in production</b>: the detailed diff is dev-only. Wire <code>onRecoverableError</code> to Sentry so you can see that a locale bug is silently client-rendering your whole product page for every Indian user.</li>
<li><b>SEO realities</b>: SSR helps indexing reliability and link previews, but rankings depend on content, links and Core Web Vitals. React 19 lets components render <code>&lt;title&gt;</code> and <code>&lt;meta&gt;</code> that are hoisted into <code>&lt;head&gt;</code>; on a CSR app that still only helps crawlers that execute JS.</li>
</ul>`,
      iq: [
        ["fresher", "What is the difference between client-side rendering and server-side rendering?", `<p>In <b>CSR</b> the server sends an almost empty HTML page and a JS bundle; the browser runs React, fetches data and builds the DOM. In <b>SSR</b> the server runs React per request and sends HTML that already contains the content; the browser paints it immediately, then loads the JS and <b>hydrates</b> it to make it interactive.</p><p>The tempting wrong answer is "SSR means no JavaScript on the client". The same components still download and run on the client for hydration; SSR changes <i>when the first pixels appear</i>, not how much JS you ship.</p>`],
        ["fresher", "What is hydration?", `<p>Hydration is React taking over server-rendered HTML: <code>hydrateRoot</code> renders the component tree on the client, matches each fiber to the existing DOM node instead of creating a new one, and attaches event handling and effects. Until it finishes, the page is visible but buttons don't respond.</p><p>It is not just "adding event listeners": React re-runs your components, which is why the client render must produce the same output as the server.</p>`],
        ["mid", "What causes a hydration mismatch and how do you fix one?", `<p>Anything that renders differently on the server and the first client render: <code>Date.now()</code>/<code>Math.random()</code> in render, <code>typeof window</code> or <code>localStorage</code> branches, locale or time-zone formatting without explicit options, invalid HTML nesting (<code>&lt;div&gt;</code> in <code>&lt;p&gt;</code>), and browser extensions modifying the DOM.</p><p>Fixes: make the value identical (pass it from the server, format with explicit locale and <code>timeZone</code>), use <code>useId</code> for ids, render client-only values after mount with <code>useEffect</code> or <code>useSyncExternalStore</code> with a server snapshot, and fix the HTML nesting. <code>suppressHydrationWarning</code> is only for a single element's unavoidable text, like a timestamp. Silencing the warning globally is wrong because React does not patch the text: the user sees stale content or, for text, React client-renders the boundary at a performance cost.</p>`],
        ["mid", "Compare renderToString and renderToPipeableStream.", `<p><code>renderToString</code> is synchronous and returns the whole HTML at once. It cannot wait for data inside Suspense (it renders fallbacks), and nothing reaches the browser until everything is rendered. <code>renderToPipeableStream</code> streams: it flushes the shell on <code>onShellReady</code>, then streams each Suspense boundary as it resolves, and supports <code>onAllReady</code> when you need the complete document (crawlers, static generation). It enables selective hydration on the client. <code>renderToReadableStream</code> is the same idea for Web Streams runtimes (edge, Deno, Bun).</p>`],
        ["mid", "Google can execute JavaScript. Do we still need SSR for SEO?", `<p>Often yes, for three reasons. Googlebot renders JS in a deferred pass with limited resources, so content can be indexed later or partially. Most other crawlers and almost all link-preview scrapers (Slack, WhatsApp, LinkedIn) don't execute JS, so a CSR page shows no title, description or image in previews. And Core Web Vitals (LCP especially) are a ranking signal, and CSR usually has worse LCP.</p><p>But for pages behind login, SEO is irrelevant, so "we need SSR for SEO" is not an argument for the dashboard.</p>`],
        ["senior", "Explain streaming SSR and selective hydration. What problems do they solve?", `<p>Classic SSR is all-or-nothing twice: the server must fetch <i>all</i> data before sending any HTML, and the client must hydrate the <i>whole</i> page before any of it is interactive. With streaming SSR, <code>&lt;Suspense&gt;</code> boundaries split the page: the shell (with fallbacks) is flushed early, and each boundary's HTML streams in the same response when its data resolves. With selective hydration, each boundary hydrates independently, the shell can hydrate before slow boundaries' HTML arrives, and a user interaction inside an unhydrated boundary raises its priority. Hydration work also yields to the browser.</p><p>The architectural consequence is that boundary placement becomes a performance decision: what is in the shell determines TTFB and LCP; what is in boundaries determines progressive interactivity.</p>`],
        ["senior", "Our SSR page has fast LCP but terrible INP on mobile. Why might that be?", `<p>SSR shows content early, which invites users to tap, but the page is not interactive until hydration finishes. Hydration of a large tree is a long main-thread task (download, parse, execute the bundle, render every component). Taps during that time wait (or, inside dehydrated boundaries, trigger synchronous hydration). Fixes: reduce the JS that hydrates (code split, move non-interactive parts to Server Components or plain HTML), add Suspense boundaries so hydration is chunked and selective, defer third-party scripts, and check for mismatches that force expensive client re-renders.</p><p>The wrong conclusion is "SSR is slower than CSR": the problem is hydration cost, which CSR pays too, only later.</p>`],
        ["lead", "We have a Vite SPA on FastAPI. Marketing wants SEO for product pages. What do you propose?", `<p>Decide per route, not "rewrite in Next.js". Options in increasing cost:</p><ul class="pts"><li>Prerender the handful of static marketing pages at build time (SSG) and keep the SPA for the app.</li><li>For product pages, introduce an SSR layer only for the public routes (React Router v7 framework mode or Next.js) that calls FastAPI server-to-server, with CDN caching where staleness is acceptable.</li><li>Keep the authenticated app as CSR under <code>/app</code>.</li></ul><p>Call out the costs: a Node runtime to operate, per-request CPU, a BFF boundary that must not duplicate FastAPI's business rules, mismatch monitoring, and per-request isolation of caches. Measure LCP and indexing before and after so the change is justified by data.</p>`],
        ["architect", "When is CSR the right architecture in 2026?", `<p>When the app is behind authentication, highly interactive and visited repeatedly (dashboards, admin, editors, internal tools). SEO doesn't matter, the bundle is cached after the first visit, there is no Node server to run, the API is the only backend, and deployment is a static upload. Many such teams gain more from smaller bundles, fast APIs (FastAPI + Redis), route-level code splitting and data prefetching than from SSR.</p><p>The tempting wrong answer is "SSR is always better": it adds a runtime, a caching layer, hydration bugs and server cost, which only pay off where first-load content and discoverability matter.</p>`]
      ],
      gotchas: [
        `<b><code>useEffect</code> and <code>useLayoutEffect</code> never run on the server.</b> Code that "works in the SPA" because it reads <code>localStorage</code> in an effect is fine; code that reads it in a <code>useState</code> initialiser or in render crashes the server with <code>ReferenceError: localStorage is not defined</code>.`,
        `<b><code>suppressHydrationWarning</code> is one level deep and does not fix anything.</b> It silences the warning for that element's own text/attributes; children are still checked, and React leaves the server's value in the DOM.`,
        `<b>Invalid HTML nesting is a mismatch even if your JSX is consistent.</b> The browser's parser closes a <code>&lt;p&gt;</code> when it sees a <code>&lt;div&gt;</code>, so the DOM React finds differs from what it rendered. The dev error names the nesting; fix the markup.`,
        `<b>A mismatch with no Suspense boundary above it client-renders the whole root.</b> One <code>toLocaleString()</code> in the footer can turn your entire SSR page into CSR for users in another locale, with no visible error in production unless you report <code>onRecoverableError</code>.`,
        `<b>Status codes and redirects must be decided before the shell flushes.</b> Once HTML is piped, headers are sent; a "not found" discovered inside a streaming boundary can no longer become a 404. Do auth and existence checks before rendering (that's what route loaders and framework conventions are for).`,
        `<b>Module-level state is shared between requests on the server.</b> A <code>const cache = new Map()</code> at the top of a module is per-tab in the browser but per-process on the server: user A's data can appear in user B's HTML.`,
        `<b>CSS-in-JS libraries need SSR integration</b> (style collection and injection) or you get a flash of unstyled content and class-name mismatches; CSS Modules and Tailwind don't (Day 9).`
      ],
      best: [
        `Choose the strategy <b>per route</b> and write it down: public and static → SSG; public and fresh → (streaming) SSR with CDN caching; private and interactive → CSR.`,
        `Put the LCP element, the <code>&lt;h1&gt;</code> and metadata in the <b>shell</b>; wrap slow or personalised widgets in <code>&lt;Suspense&gt;</code> boundaries with layout-stable fallbacks (no CLS).`,
        `Keep the first client render <b>pure and deterministic</b>: no time, randomness, <code>window</code>, or implicit locale; use <code>useId</code> for ids; move client-only reads to effects or <code>useSyncExternalStore</code>.`,
        `Report <code>onRecoverableError</code> to your error tracker and treat hydration mismatches as bugs with an SLO, not noise.`,
        `Serialise server data into the page (escaping <code>&lt;</code>) or use your data library's hydration APIs so the client doesn't refetch.`,
        `Put timeouts on every server-side call to FastAPI and abort the render after a deadline; never let one slow dependency hold every SSR request.`,
        `Prefer a framework (React Router v7 framework mode, Next.js) over a hand-rolled SSR server for production; hand-roll once to learn.`
      ],
      lab: [
        `In a scratch folder, install <code>react</code>, <code>react-dom</code>, <code>tsx</code> and <code>@types/react-dom</code>, then run example 2 with <code>npx tsx render-demo.tsx</code>. Change the JSX to <code>{"Hello, " + name}</code> and note that the <code>&lt;!-- --&gt;</code> marker disappears. Explain why.`,
        `In your Vite app, open the production build (<code>npm run build &amp;&amp; npm run preview</code>), use "View page source" and confirm the content is not in the HTML. Run Lighthouse on mobile and record FCP and LCP.`,
        `Create a tiny SSR project from Vite's SSR template (<code>npm create vite@latest</code> lists SSR templates under "Others", or follow Vite's SSR guide) and add <code>&lt;BadClock /&gt;</code> from example 6. Load the page and read the hydration error in the console.`,
        `Fix it three ways in turn: pass the time from the server, use the two-pass <code>LocalClock</code>, and use <code>suppressHydrationWarning</code>. For each, note whether the user sees a flicker.`,
        `Add a <code>&lt;div&gt;</code> inside a <code>&lt;p&gt;</code> and observe the different error. Then add a <code>&lt;Suspense&gt;</code> boundary around a lazy component and watch the streamed chunk arrive in the Network tab (the response keeps loading after first paint).`,
        `<b>Done when:</b> the SSR page hydrates with zero console errors, view-source shows the real content, and you can explain in one sentence each why each of your three clock fixes avoids the mismatch.`
      ],
      teach: `<p>"Every React page needs HTML, and the only question is where and when it's produced. In client-side rendering, which is what a Vite app does, the server sends an empty div and a bundle; the user waits for JS and an API call before seeing anything, and link previews see nothing. In server-side rendering, a Node server runs the same components per request and sends real HTML, so pixels appear immediately. Static generation does that at build time, and Next.js's ISR regenerates static pages in the background.</p>
<p>The catch is hydration. The browser still downloads the JavaScript, React renders the whole tree again, and instead of creating DOM nodes it claims the ones the server sent. That only works if the first client render is identical to the server's, so <code>Date.now()</code>, <code>window</code> checks or locale-dependent formatting in render cause hydration mismatches; React then throws away that part of the server HTML and renders it on the client.</p>
<p>React 18 made this incremental: streaming sends the shell first and each Suspense boundary when its data is ready, and selective hydration hydrates boundaries independently, prioritising the one you click. In my FastAPI stack I'd keep the logged-in dashboard as a Vite SPA and only add a server-rendering layer for public pages where first paint and SEO actually matter."</p>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: "d13-rsc",
      title: "Server Components, Server Functions and Next.js App Router",
      lv: ["mid", "senior", "lead", "architect"],
      eli5: `<p>Think of a restaurant. The <b>kitchen</b> has the fridge, the knives and the recipes; customers never see them. The <b>dining table</b> has the salt shaker and the buttons to call the waiter: things the customer touches.</p>
<p><b>Server Components</b> are the kitchen. They cook the food (read the database, call the FastAPI service, use secret keys) and send out a finished plate. The plate arrives; the knives and the fridge never leave the kitchen. <b>Client Components</b> are the things on the table that the customer can actually interact with: a counter, a dropdown, a "like" button.</p>
<p>The <code>'use client'</code> line is the <b>serving hatch</b> between kitchen and dining room. Only things that can be put on a plate can pass through it: food, a note, a menu card (plain data). You can't pass the stove (a function) or the chef (a live database connection) through the hatch.</p>
<p><b>Server Functions</b> are the order slips the customer hands back to the kitchen ("add a note to my order"). Anyone in the restaurant can write an order slip, including someone who isn't your customer, so the kitchen must check every slip before cooking.</p>`,
      what: `<p><b>React Server Components (RSC)</b> are components that run <b>only on the server</b> (per request, or once at build time) and are never hydrated. Their output is sent to the client as a serialised description of the UI (the <b>RSC payload</b>), not as JavaScript. They are a React feature, but you use them through a framework that implements the bundler and router integration; today that mainly means the <b>Next.js App Router</b>. (React Router has been adding RSC support too; treat that as new and check its docs.)</p>
<h5>The mental model: two kinds of component</h5>
<table class="tbl"><tr><th></th><th>Server Component (default in <code>app/</code>)</th><th>Client Component (<code>'use client'</code>)</th></tr>
<tr><td>Runs</td><td>Server (request time or build time) only</td><td>Server for the SSR HTML, then in the browser (hydrated)</td></tr>
<tr><td>Can be <code>async</code> / <code>await</code> data</td><td>Yes: <code>await fetch(...)</code>, query a DB, read files</td><td>No async components; fetch in effects or a data library, or <code>use(promise)</code></td></tr>
<tr><td><code>useState</code>, <code>useEffect</code>, <code>useReducer</code>, context consumers</td><td>No</td><td>Yes</td></tr>
<tr><td>Event handlers (<code>onClick</code>)</td><td>No</td><td>Yes</td></tr>
<tr><td>Browser APIs</td><td>No</td><td>Yes (after mount)</td></tr>
<tr><td>Secrets, env vars, server-only libraries</td><td>Yes</td><td>Never</td></tr>
<tr><td>JS sent to the browser</td><td>None for the component itself</td><td>Its code and everything it imports</td></tr></table>
<h5>The <code>'use client'</code> boundary</h5>
<ul class="pts">
<li><code>'use client'</code> at the top of a file marks a <b>module boundary</b>: that file and everything it imports become part of the client bundle. You don't put it on every interactive file, only on the entry points that server components import.</li>
<li>It does <b>not</b> mean "render only in the browser". Client Components are still rendered to HTML on the server during SSR and then hydrated. Everything from the previous topic about mismatches applies to them.</li>
<li>A server component can import and render a client component. A client component <b>cannot import</b> a server component (the import would turn it into client code), but it can receive one as <b>props</b>, usually <code>children</code>: <code>&lt;Tabs&gt;&lt;OrdersTable /&gt;&lt;/Tabs&gt;</code> where <code>Tabs</code> is a client component and <code>OrdersTable</code> is a server component. The server renders <code>OrdersTable</code> and passes the result in.</li>
<li>Push the boundary <b>down to the leaves</b>: keep the page and layout as server components and make only the like button, the filter dropdown or the chart client components.</li>
</ul>
<h5>Props across the boundary must be serialisable</h5>
<p>Props from a server component to a client component travel in the RSC payload. Allowed: strings, numbers, bigint, booleans, <code>null</code>/<code>undefined</code>, plain objects and arrays of these, <code>Date</code>, <code>Map</code>, <code>Set</code>, typed arrays, JSX (including rendered server components), Promises (the client can <code>use()</code> them), and Server Functions. Not allowed: ordinary functions (event handlers, callbacks, formatters), class instances (an ORM model, an <code>Intl.NumberFormat</code>), symbols not created with <code>Symbol.for</code>. The error you will see says functions cannot be passed to Client Components unless marked with <code>'use server'</code>.</p>
<h5>Server Functions (<code>'use server'</code>)</h5>
<ul class="pts">
<li>An <code>async</code> function in a file (or function body) marked <code>'use server'</code> runs on the server but can be <b>called from the client</b>. The framework replaces it in the client bundle with a reference; calling it sends a POST with the serialised arguments and returns the serialised result.</li>
<li>React's docs call them <b>Server Functions</b>; when used as a form <code>action</code> (or called inside a transition / action) they are called <b>Server Actions</b>. They integrate with React 19's <code>&lt;form action={fn}&gt;</code>, <code>useActionState</code> and <code>useFormStatus</code> (Day 9), and forms work before JS loads (progressive enhancement).</li>
<li><b>Security: every Server Function is a public HTTP endpoint.</b> The fact that the button is only rendered for admins means nothing: anyone can replay the request with any arguments. Validate inputs (Zod), authenticate and authorise on every call, and never trust hidden form fields. Keep react and next patched: the RSC protocol itself has had serious security fixes (a critical one was disclosed in late 2025).</li>
<li>They are designed for <b>mutations</b>. For reading data, fetch in a server component; for a public API used by mobile apps or other services, keep a real endpoint (FastAPI, or a Next route handler).</li>
</ul>
<h5>The Next.js App Router</h5>
<ul class="pts">
<li>Routes are folders in <code>app/</code>; special files give each segment its behaviour: <code>page.tsx</code> (the route's UI; makes the folder routable), <code>layout.tsx</code> (wraps child segments and <b>persists</b> across navigation: it doesn't re-render or lose state when you move between its children), <code>loading.tsx</code> (an automatic <code>&lt;Suspense&gt;</code> fallback for the segment), <code>error.tsx</code> (an error boundary; must be a client component), <code>not-found.tsx</code>, and <code>route.ts</code> (a <b>route handler</b>: an HTTP endpoint exporting <code>GET</code>, <code>POST</code> … that use the Web <code>Request</code>/<code>Response</code> APIs).</li>
<li>Dynamic segments use brackets: <code>app/orders/[id]/page.tsx</code>. In Next.js 15+, <code>params</code> and <code>searchParams</code> are <b>Promises</b> you <code>await</code>, and <code>cookies()</code>/<code>headers()</code> from <code>next/headers</code> are async (they were synchronous in 14).</li>
<li>Everything in <code>app/</code> is a server component by default. Client navigation fetches the RSC payload for the new route segments, not a whole HTML page, so layouts and client state survive.</li>
</ul>
<h5>Caching: version-dependent, hedge everything</h5>
<p>Next.js layers several caches on top of React: request memoisation of <code>fetch</code> during one render, a persistent <b>data cache</b> for <code>fetch</code> results, a <b>full route cache</b> for statically rendered routes, and a client-side <b>router cache</b>. The defaults have changed between major versions, which is why so many blog posts contradict each other. In <b>Next.js 15</b>, <code>fetch</code> requests and <code>GET</code> route handlers are no longer cached by default and the client router cache no longer reuses page segments by default; Next.js 14 cached far more aggressively. Newer releases also introduce an opt-in <code>'use cache'</code> directive model. Rules that hold regardless: opt in or out explicitly (<code>fetch(url, { cache: "no-store" })</code>, <code>fetch(url, { next: { revalidate: 60 } })</code>, <code>export const revalidate = 60</code> in a segment), invalidate after mutations with <code>revalidatePath</code>/<code>revalidateTag</code> from <code>next/cache</code>, and read the caching page of the docs <b>for the exact version you run</b>. React's own <code>cache()</code> (from <code>react</code>, server components only) memoises a function for the duration of one request, which is how you dedupe a "get current user" call made by several components.</p>`,
      why: `<p>SSR solved first paint but not the cost of JavaScript. Every component on the page, including a static article body, a pricing table or a markdown renderer that will never change after load, still had to be downloaded, parsed and hydrated. Libraries used only for rendering (a date library, a syntax highlighter, a markdown parser) ended up in the bundle even though the browser only needed their <i>output</i>.</p>
<p>Data fetching had a parallel problem. In an SPA, components fetch in effects or with TanStack Query: the browser does request → JS → API call → render, often in <b>waterfalls</b> (parent renders, then child fetches). Each fetch crosses the public internet from a phone, and needs a public, authenticated, CORS-enabled endpoint shaped for that one screen. With SSR frameworks, data loading moved to route-level functions (<code>getServerSideProps</code> in the old Pages Router, loaders in React Router), which works but separates the data from the component that uses it.</p>
<p>Server Components address both. Components that only display data run where the data is (next to FastAPI and PostgreSQL, over a fast private network), can <code>await</code> it directly in the component, and send only their result. Their dependencies never reach the browser. Interactivity is opted into, island by island, with <code>'use client'</code>. Server Functions complete the loop for mutations: a form can call server code without you hand-writing an endpoint, a client fetch wrapper and cache invalidation.</p>
<p>The trade-off is real: a server is now part of every render, the mental model has two environments, and framework caching becomes part of correctness. That is why "should we use RSC?" is an architecture question, not a default.</p>`,
      diagram: {
        html: flow([["Request /orders", "browser or client navigation", "w"], ["Server Components run", "await FastAPI, read cookies"], ["RSC payload", "UI tree + client refs + props"], ["SSR (first load)", "payload → HTML", "g"], ["Browser", "loads client chunks, hydrates islands"], ["Server Function", "POST: validate, authorise, revalidate", "r"]]) +
          lanes([
            ["Server only (no JS shipped)", ["<code>layout.tsx</code>, <code>page.tsx</code>", "<code>async</code> data reads from FastAPI", "Secrets, <code>server-only</code> modules", "Markdown / date libraries for display"]],
            ["The boundary", ["<code>'use client'</code> file", "Props: serialisable data only", "Server components passed as <code>children</code>", "Server Functions passed as props"]],
            ["Client (SSR'd + hydrated)", ["<code>useState</code>, effects, handlers", "Forms with <code>useActionState</code>", "Charts, dropdowns, modals", "TanStack Query for live data"]]
          ]),
        steps: [
          "A request (or a client-side navigation) reaches the Next.js server. It matches the URL to segments in <code>app/</code> and renders their layouts and page as server components, awaiting data where needed.",
          "When the renderer reaches a client component, it does not run it as part of the RSC render; it writes a <b>reference</b> (module id + export name) and the serialised props into the RSC payload.",
          "On a first load, the payload is also rendered to HTML (SSR, running the client components on the server) and streamed, with the payload embedded so the client can hydrate. On client navigation, only the payload is fetched.",
          "In the browser, React reads the payload, loads the client components' chunks and hydrates only those islands. Server component output is plain DOM with no JS behind it.",
          "A form submits to a Server Function: the client sends a POST with an action id and serialised arguments; the server runs it (it must validate and authorise), can revalidate data, and responds with the result and an updated payload."
        ]
      },
      ex: [
        {
          t: "1. App Router layout for the orders feature",
          lang: "text",
          code: `app/
  layout.tsx                 root layout: <html>, <body>, providers (server component)
  page.tsx                   "/"
  providers.tsx              'use client': QueryClientProvider, ThemeProvider
  orders/
    layout.tsx               persists across /orders and /orders/[id]
    page.tsx                 "/orders"      server component: list from FastAPI
    loading.tsx              Suspense fallback for this segment
    error.tsx                'use client' error boundary for this segment
    actions.ts               'use server': addNote, cancelOrder
    [id]/
      page.tsx               "/orders/42"
      not-found.tsx
  api/
    health/
      route.ts               GET /api/health (route handler)
lib/
  fastapi.ts                 import "server-only": typed fetch to FastAPI`,
          note: `<p>Watch for a URL clash: if Next serves <code>/api/...</code> route handlers and FastAPI is also exposed under <code>/api</code> through the same domain, decide which owns the prefix (for example, proxy only <code>/api/v1/*</code> to FastAPI, or give FastAPI its own internal hostname).</p>`
        },
        {
          t: "2. A typed, server-only client for FastAPI",
          lang: "ts",
          code: `// lib/fastapi.ts   (npm install server-only)
import "server-only"; // build error if a client component ever imports this file
import { cookies } from "next/headers";

const API_URL = process.env.API_URL!; // e.g. http://fastapi:8000 on the private network (no NEXT_PUBLIC_ prefix)

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = (await cookies()).get("session")?.value; // async in Next.js 15+
  const res = await fetch(API_URL + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: "Bearer " + session } : {}),
      ...init.headers,
    },
    cache: "no-store", // be explicit: per-user data must never be shared via a cache
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return (await res.json()) as T;
}`,
          note: `<p>This is the BFF seam: the browser never sees <code>API_URL</code> or talks to FastAPI directly for these pages. FastAPI still validates the token and enforces permissions; Next.js just forwards identity. <code>process.env.API_URL</code> is only readable on the server; only variables prefixed <code>NEXT_PUBLIC_</code> are inlined into client bundles.</p>`
        },
        {
          t: "3. An async Server Component page that reads FastAPI directly",
          lang: "tsx",
          code: `// app/orders/page.tsx  (Server Component: no directive needed)
import Link from "next/link";
import { api } from "@/lib/fastapi";
import { StatusFilter } from "./status-filter";

type Order = { id: number; customer: string; total: number; status: "open" | "shipped" | "cancelled"; placedAt: string };

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>; // a Promise in Next.js 15+
}) {
  const { status } = await searchParams;
  const qs = status ? "?status=" + encodeURIComponent(status) : "";
  const orders = await api<Order[]>("/api/orders" + qs);

  return (
    <section>
      <h1>Orders</h1>
      {/* Client island: receives only serialisable props */}
      <StatusFilter current={status ?? "all"} />
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            <Link href={"/orders/" + o.id}>#{o.id}</Link> {o.customer}: {inr.format(o.total)}
          </li>
        ))}
      </ul>
    </section>
  );
}`,
          out: "The browser receives HTML for the list and zero JS for OrdersPage. The Intl formatter, the API helper and the types stay on the server.",
          note: `<p>No <code>useEffect</code>, no loading state, no client fetch: the component awaits its data. While it awaits, <code>app/orders/loading.tsx</code> (if present) is streamed as the fallback. Note the formatter is created and used on the server; passing <code>inr</code> itself as a prop to a client component would fail (class instance).</p>`
        },
        {
          t: "4. The client island, and a server component passed as children",
          lang: "tsx",
          code: `// app/orders/status-filter.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ReactNode } from "react";

export function StatusFilter({ current }: { current: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function onChange(next: string) {
    const sp = new URLSearchParams(params.toString());
    if (next === "all") sp.delete("status");
    else sp.set("status", next);
    // Navigation re-runs the server component with the new searchParams.
    startTransition(() => router.push("/orders?" + sp.toString()));
  }

  return (
    <select value={current} onChange={(e) => onChange(e.target.value)} aria-busy={isPending}>
      <option value="all">All</option>
      <option value="open">Open</option>
      <option value="shipped">Shipped</option>
    </select>
  );
}

// A client "shell" that accepts server-rendered content as a slot.
export function Collapsible({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details>
      <summary>{title}</summary>
      {children}
    </details>
  );
}

// Usage inside a SERVER component:
//   <Collapsible title="Shipping history">
//     <ShippingHistory orderId={42} />   <- async server component, rendered on the server
//   </Collapsible>`,
          note: `<p><code>Collapsible</code> owns interactivity; <code>ShippingHistory</code> keeps its data access and dependencies on the server. That only works because the server component is passed as <code>children</code>: if <code>Collapsible</code>'s file imported <code>ShippingHistory</code>, it would be pulled into the client bundle, and an <code>async</code> component there is not supported. (A plain <code>&lt;details&gt;</code> needs no JS at all; it stands in for a real accordion or tab component.) Components using <code>useSearchParams</code> may need a <code>&lt;Suspense&gt;</code> boundary above them for static rendering; Next reports this at build time.</p>`
        },
        {
          t: "5. Dynamic route with loading, error and not-found",
          lang: "tsx",
          code: `// app/orders/[id]/page.tsx
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/fastapi";
import { NoteForm } from "./note-form";

type OrderDetail = { id: number; customer: string; notes: { id: number; text: string }[] };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  let order: OrderDetail;
  try {
    order = await api<OrderDetail>("/api/orders/" + orderId);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e; // goes to the nearest error.tsx
  }

  return (
    <article>
      <h1>Order #{order.id} for {order.customer}</h1>
      <ul>{order.notes.map((n) => <li key={n.id}>{n.text}</li>)}</ul>
      <NoteForm orderId={order.id} />
    </article>
  );
}

// app/orders/loading.tsx
export default function Loading() {
  return <p aria-busy="true">Loading orders…</p>;
}

// app/orders/error.tsx
"use client"; // error boundaries must be client components

export default function OrdersError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert">
      <p>Could not load orders.</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}`,
          note: `<p>Three files shown together for reading; each lives in its own file and the <code>"use client"</code> directive must be the first statement of <code>error.tsx</code>. In production, the <code>error.message</code> of a server-side error is replaced with a generic message plus a <code>digest</code> you can match to server logs, so secrets in error messages are not leaked to the browser. The exact props of <code>error.tsx</code> have been stable through Next.js 15; check your version's docs.</p>`
        },
        {
          t: "6. A Server Action: validate, authorise, mutate via FastAPI, revalidate",
          lang: "ts",
          code: `// app/orders/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/fastapi";
import { getCurrentUser } from "@/lib/auth"; // your own helper: reads the session, returns the user or null

const NoteInput = z.object({
  orderId: z.coerce.number().int().positive(),
  text: z.string().trim().min(1, "Note is empty").max(500),
});

export type NoteState = { ok: boolean; error?: string };

export async function addNote(_prev: NoteState, formData: FormData): Promise<NoteState> {
  // 1. Authenticate: this function is reachable by anyone who can send a POST.
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  // 2. Validate: never trust the form, including hidden fields.
  const parsed = NoteInput.safeParse({
    orderId: formData.get("orderId"),
    text: formData.get("text"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  // 3. Authorise + mutate: FastAPI checks this user may write to this order.
  try {
    await api("/api/orders/" + parsed.data.orderId + "/notes", {
      method: "POST",
      body: JSON.stringify({ text: parsed.data.text }),
    });
  } catch (e) {
    if (e instanceof ApiError && (e.status === 403 || e.status === 404)) return { ok: false, error: "Not allowed." };
    throw e;
  }

  // 4. Invalidate whatever Next.js may have cached for this page.
  revalidatePath("/orders/" + parsed.data.orderId);
  return { ok: true };
}`,
          note: `<p>Authorisation lives in FastAPI (the system of record) and is re-checked there, not just in the action. The action's job is input validation, identity, and cache invalidation. Return expected errors as values; throw only unexpected ones (they hit <code>error.tsx</code>). Only <code>async</code> exports are allowed from a <code>'use server'</code> file, which is why the schema is not exported.</p>`
        },
        {
          t: "7. Calling the action from a client form with useActionState",
          lang: "tsx",
          code: `// app/orders/[id]/note-form.tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addNote, type NoteState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Saving…" : "Add note"}</button>;
}

export function NoteForm({ orderId }: { orderId: number }) {
  const [state, formAction] = useActionState<NoteState, FormData>(addNote, { ok: false });

  return (
    <form action={formAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <label>
        Note <textarea name="text" required maxLength={500} />
      </label>
      <SubmitButton />
      {state.error && <p role="alert">{state.error}</p>}
      {state.ok && <p role="status">Saved.</p>}
    </form>
  );
}`,
          note: `<p>The client imports <code>addNote</code>, but the bundle only contains a reference to it; the Zod schema and the API helper stay on the server. The form works before hydration (progressive enhancement) because it is a real <code>&lt;form&gt;</code> posting to the action. The hidden <code>orderId</code> can be edited in DevTools, which is exactly why the action and FastAPI re-check ownership. React 19 hooks recap: Day 9.</p>`
        },
        {
          t: "8. Route handlers, and explicit caching choices",
          lang: "ts",
          code: `// app/api/health/route.ts
export async function GET() {
  return Response.json({ ok: true, at: new Date().toISOString() });
}

// app/api/webhooks/payments/route.ts
export async function POST(request: Request) {
  const raw = await request.text(); // verify the provider's signature on the raw body
  // ...verify, then forward to FastAPI or enqueue...
  return new Response(null, { status: 204 });
}

// Caching knobs (behaviour and defaults differ by Next.js version; check your docs):
//   await fetch(url, { cache: "no-store" });             // always fresh
//   await fetch(url, { next: { revalidate: 300 } });     // reuse for up to 5 minutes
//   await fetch(url, { next: { tags: ["products"] } });  // later: revalidateTag("products")
//   export const revalidate = 300;                       // segment-level, in page/layout files`,
          note: `<p>Route handlers are for things that are genuinely HTTP endpoints: webhooks, health checks, OAuth callbacks, files. If FastAPI already exposes the endpoint, don't duplicate it in Next. And because caching defaults changed (Next.js 15 stopped caching <code>fetch</code> and <code>GET</code> handlers by default), always state your intent explicitly in code so an upgrade cannot silently change behaviour.</p>`
        }
      ],
      internals: `<p><b>Two module graphs.</b> An RSC-aware bundler builds the app twice: a server graph (resolving imports with the <code>react-server</code> export condition, where hooks like <code>useState</code> are not available) and a client graph. When the server graph meets a <code>'use client'</code> file it doesn't include its code for execution in the RSC render; it records a <b>client reference</b> (module id, export name and the chunks needed). When the client graph meets a <code>'use server'</code> file it does the inverse: each export is replaced with a <b>server reference</b>, a stub that knows an action id and how to POST arguments. That is why importing a server-only file into a client component is a build-time concern, and why the <code>server-only</code> package works: it throws when resolved in the client graph.</p>
<p><b>The RSC payload.</b> Rendering server components does not produce HTML; it produces a streamed, line-oriented serialisation of the element tree (internally "Flight"). Host elements become JSON-like tuples (type, key, props); client components become references to chunks; props are serialised with React's rules (so Dates, Maps, Sets, Promises and nested JSX survive, functions don't); server-component output is inlined as already-rendered elements. Because it is streamed in chunks, a pending <code>async</code> component under a <code>&lt;Suspense&gt;</code> boundary becomes a placeholder row filled in later. The exact wire format is an implementation detail; what matters is that the browser receives <i>results</i> for server components and <i>code + props</i> for client components.</p>
<p><b>RSC and SSR are separate steps.</b> On a first load the pipeline is: RSC render → payload → SSR of that payload (running client components on the server with <code>react-dom/server</code>) → HTML stream, with the payload embedded in script tags. The client then calls the equivalent of <code>hydrateRoot</code> using the embedded payload, so it doesn't re-run any server component. On a client navigation, Next fetches only the payload for the changed segments and React reconciles it into the existing tree: layouts that didn't change are preserved, and client component state inside them survives.</p>
<p><b>Server Functions on the wire.</b> Submitting <code>&lt;form action={serverFn}&gt;</code> before hydration posts a normal form (with a hidden field identifying the action). After hydration React intercepts the submit, serialises the arguments, and calls the endpoint inside a transition; the response can contain both the return value and an updated RSC payload (for example after <code>revalidatePath</code>), so the UI refreshes in the same round trip. Closed-over values in inline server functions are serialised and (in Next.js) encrypted into the page, but they are still client-supplied data from a security point of view.</p>
<p><b>Why no state or effects.</b> A server component runs once per request (or once at build) and its output is frozen into the payload; there is no fiber kept alive on the server to update, nothing to re-render when state changes, and no browser to run effects in. Re-rendering a server component means a new request (navigation, <code>router.refresh()</code>, or revalidation after an action).</p>`,
      prod: `<h5>When RSC fits, and when a SPA + FastAPI is better</h5>
<table class="tbl"><tr><th>Choose Next.js App Router (RSC)</th><th>Keep Vite SPA + FastAPI</th></tr>
<tr><td>Public, content-heavy or SEO-relevant pages</td><td>Authenticated dashboards and internal tools</td></tr>
<tr><td>Big display-only dependencies (markdown, syntax highlighting, date and i18n libraries)</td><td>Highly interactive screens where almost everything is a client component anyway</td></tr>
<tr><td>Many backend calls per page that benefit from server-side aggregation (BFF)</td><td>One clean REST/JSON API used by web, mobile and partners</td></tr>
<tr><td>Team willing to own a Node service and the framework's caching model</td><td>Team wants static hosting and a single backend language</td></tr></table>
<p>A useful heuristic: if most of your components would carry <code>'use client'</code>, you are paying for RSC's complexity without getting its benefit. Conversely, for a catalogue or docs site, RSC can remove most of the JS.</p>
<h5>Using FastAPI from Server Components</h5>
<ul class="pts">
<li>Call FastAPI over the <b>private network</b> (<code>http://fastapi:8000</code> in Docker Compose or Kubernetes); don't round-trip through the public load balancer.</li>
<li>Forward identity explicitly (the session cookie or a token derived from it) and keep <b>authorisation in FastAPI</b>. Next is a client of your API, not a replacement for its permission checks.</li>
<li>Generate TypeScript types from FastAPI's OpenAPI schema (for example with <code>openapi-typescript</code>) so server components and actions are typed end to end.</li>
<li>Put timeouts on every call (<code>AbortSignal.timeout</code>) and wrap slow sections in <code>&lt;Suspense&gt;</code> or <code>loading.tsx</code>; a slow FastAPI endpoint otherwise blocks the whole segment.</li>
<li>Keep the existing FastAPI <code>/api</code> for mobile apps and third parties; Server Functions are an implementation detail of the web UI, not a public API contract.</li>
<li>Mixing with TanStack Query is fine: server components for the initial render, client components with TanStack Query for live, polled or optimistic data (Day 7), optionally prefetching on the server and passing state via its hydration helpers.</li>
</ul>
<h5>What goes wrong in real projects</h5>
<ul class="pts">
<li><b>Accidental client bundles</b>: one <code>'use client'</code> too high (on a layout) turns the whole subtree into client code. Check the build output's per-route JS sizes in review.</li>
<li><b>Secrets in the bundle</b>: a developer renames <code>STRIPE_SECRET_KEY</code> to <code>NEXT_PUBLIC_STRIPE_SECRET_KEY</code> to "fix" an <code>undefined</code> in a client component. Use <code>server-only</code> in modules that touch secrets, and scan bundles in CI.</li>
<li><b>Unprotected Server Actions</b>: authorisation checked in the UI only. Treat every action like a FastAPI route: auth dependency, validation, rate limiting where needed, audit logging for destructive actions.</li>
<li><b>Cache confusion after upgrades</b>: data that was cached in Next.js 14 becomes fresh (and slower, with more FastAPI load) in 15, or the reverse when a team opts in. Be explicit per fetch and load-test FastAPI after framework upgrades.</li>
<li><b>Per-user data in shared caches</b>: anything read with cookies must not be stored in a cross-user cache. Keep personalised fetches <code>no-store</code> and put Redis caching where it belongs: in FastAPI, keyed correctly.</li>
<li><b>Server waterfalls</b>: sequential <code>await</code>s in nested server components recreate the client waterfall on the server. Start independent requests in parallel (<code>Promise.all</code>) or push them into sibling Suspense boundaries.</li>
</ul>`,
      iq: [
        ["fresher", "What is the difference between a Server Component and a Client Component?", `<p>A Server Component runs only on the server, can be <code>async</code> and read data or secrets directly, and sends its rendered output, not its code, to the browser. It cannot use state, effects, event handlers or browser APIs. A Client Component is marked with <code>'use client'</code> (or imported by one), is rendered to HTML on the server and then hydrated in the browser, and can use hooks and handlers.</p><p>The common wrong answer is "client components only render in the browser": they are still SSR'd in frameworks like Next.js, so hydration rules apply.</p>`],
        ["fresher", "What does 'use client' do, and where do you put it?", `<p>It marks a module as the entry point of client code: that file and everything it imports are bundled for the browser, and server components can render it with serialisable props. You put it at the top of files that need interactivity and are imported from server components, as low in the tree as possible (the button, not the page). You don't need it in every client file, only at the boundary.</p>`],
        ["mid", "Why can't I pass an onClick function from a Server Component to a Client Component?", `<p>Props crossing the boundary are serialised into the RSC payload and sent over the network. A function is code with a closure; it can't be serialised. Pass data instead and define the handler inside the client component, or pass a Server Function (marked <code>'use server'</code>), which is serialised as a reference to a server endpoint. The same applies to class instances like an <code>Intl.NumberFormat</code> or an ORM object: pass plain data.</p>`],
        ["mid", "How do you render a Server Component inside a Client Component?", `<p>You don't import it in the client file (that would make it client code, and async components aren't supported there). Instead the parent server component passes it as a prop, usually <code>children</code>: <code>&lt;ClientTabs&gt;&lt;ServerOrders /&gt;&lt;/ClientTabs&gt;</code>. The server renders <code>ServerOrders</code> and the client component receives already-rendered output as a slot. This is how context providers in <code>layout.tsx</code> wrap server-rendered pages.</p>`],
        ["mid", "What are Server Actions and what security concerns do they raise?", `<p>Server Functions are async functions marked <code>'use server'</code> that run on the server but can be called from the client; used as a form <code>action</code> (or inside a transition) they are called Server Actions. The framework turns each into an endpoint and replaces it in the client bundle with a reference.</p><p>Security: each one is a <b>public HTTP endpoint</b>. Anyone can call it with any arguments, regardless of whether your UI shows the button. So you authenticate, authorise (does this user own this order?), validate every argument (Zod), and never trust hidden fields or closed-over values supplied via the client. The tempting wrong answer, "they're safe because they're server code", is how IDOR bugs ship.</p>`],
        ["senior", "Explain the RSC payload and how it relates to SSR.", `<p>The RSC payload is a streamed serialisation of the rendered server component tree: host elements with props, references (module id + export) to client components with their serialised props, and placeholders for pending Suspense content. It is not HTML. On first load, the framework SSRs that payload to HTML (running client components on the server) and embeds the payload so the client can hydrate without re-running server components. On client navigation it fetches only the payload and reconciles it, preserving layouts and client state. RSC decides <i>which code ships</i>; SSR decides <i>whether the first response has HTML</i>. They are complementary, not alternatives.</p>`],
        ["senior", "How does caching work in the Next.js App Router?", `<p>I'd answer carefully, because defaults are version-dependent. There is per-render request memoisation of <code>fetch</code>, a persistent data cache for <code>fetch</code> results, a full route cache for statically rendered routes, and a client router cache. Next.js 14 cached aggressively by default; Next.js 15 changed defaults so <code>fetch</code> and <code>GET</code> route handlers are not cached unless you opt in, and newer releases add a <code>'use cache'</code> directive model. In practice: state intent explicitly (<code>cache: "no-store"</code>, <code>next: { revalidate }</code>, tags), invalidate after mutations with <code>revalidatePath</code>/<code>revalidateTag</code>, never cache personalised data across users, and verify against the docs for the version in <code>package.json</code>.</p>`],
        ["lead", "Our team wants to move from a Vite SPA on FastAPI to Next.js App Router. How do you evaluate it?", `<p>Start from the problems, not the framework: are we suffering from LCP, SEO, bundle size or API waterfalls, and on which routes? Then check fit: if most screens are authenticated and highly interactive, most components would be client components and RSC buys little. Costs: a Node service to run and monitor, a BFF layer and its auth forwarding, the caching model, two-environment mental model, and framework upgrade churn. A low-risk path is incremental: put Next in front of public routes first, keep FastAPI as the only system of record and the public API, keep the dashboard as is, measure Web Vitals and FastAPI load, then decide on the rest.</p>`],
        ["architect", "Where should business logic live in a Next.js + FastAPI architecture?", `<p>In FastAPI. It owns validation, authorisation, transactions, PostgreSQL and Redis, and it serves every client (web, mobile, partners, jobs). The Next.js server is a BFF: it composes and shapes data for screens, forwards identity, handles rendering, caching and UI-level validation for good error messages. Server Actions should be thin adapters that validate input, call FastAPI, and revalidate. If permission checks or pricing rules start appearing only in Next, the mobile app and the public API will diverge from the web, and security reviews must cover two codebases. The tempting answer "Server Actions replace the API" is fine for a small all-in-one app, not for a platform with multiple clients.</p>`]
      ],
      gotchas: [
        `<b><code>'use client'</code> components still render on the server.</b> Accessing <code>window</code> in their render body crashes SSR or causes hydration mismatches, exactly as in the previous topic.`,
        `<b>The boundary is about imports, not nesting.</b> A component without the directive becomes client code if it is imported from a client file. The same <code>Badge</code> can be a server component in one place and a client component in another.`,
        `<b>Context does not work in server components.</b> Providers are client components (put them in a <code>providers.tsx</code> with <code>'use client'</code> and wrap <code>children</code> in the root layout); server components can't read context. Use React's <code>cache()</code> for per-request shared data on the server instead.`,
        `<b>Only <code>NEXT_PUBLIC_</code> env vars reach the client</b>, and they are inlined at <b>build time</b>. Changing them in the runtime environment does nothing without a rebuild, and anything with that prefix is public.`,
        `<b>Every Server Function is an endpoint, even unused-looking ones.</b> Exports from a <code>'use server'</code> file that are referenced by client code are callable with arbitrary arguments; closure values and hidden inputs are client-controlled data.`,
        `<b>Layouts don't re-render on navigation between their children</b>, so a layout can't read the current pathname or <code>searchParams</code> to highlight a nav item; use a small client component with <code>usePathname</code>.`,
        `<b><code>redirect()</code> and <code>notFound()</code> work by throwing.</b> Calling them inside a <code>try</code> whose <code>catch</code> swallows everything silently breaks them; re-throw or call them outside the <code>try</code>.`,
        `<b>Next.js 15 made <code>params</code>, <code>searchParams</code>, <code>cookies()</code> and <code>headers()</code> async.</b> Tutorials written for 14 show synchronous access; follow the docs for your version (Next ships a codemod for the upgrade).`
      ],
      best: [
        `Default to server components; add <code>'use client'</code> at the <b>smallest interactive leaf</b>, and pass server-rendered content into client shells via <code>children</code>.`,
        `Mark modules that touch secrets or the database with <code>import "server-only"</code>, and never prefix secrets with <code>NEXT_PUBLIC_</code>.`,
        `Treat every Server Action like a FastAPI route: authenticate, authorise, validate with Zod, return expected errors as values, and log destructive operations.`,
        `Keep business rules in FastAPI; keep the Next layer a thin BFF with typed clients generated from OpenAPI.`,
        `Be explicit about caching on every <code>fetch</code> and segment, and re-read the caching docs on every major Next.js upgrade.`,
        `Avoid server waterfalls: parallelise independent awaits and give slow data its own Suspense boundary or <code>loading.tsx</code>.`,
        `Watch the per-route JS size in the build output; a sudden jump usually means a <code>'use client'</code> moved up the tree.`
      ],
      lab: [
        `Create a Next.js app with <code>npx create-next-app@latest</code> (TypeScript, App Router). Note the Next.js version in <code>package.json</code> and keep its docs open; examples here assume 15 or later.`,
        `Run your FastAPI backend (or a stub endpoint returning a list of orders) and build <code>lib/fastapi.ts</code> (example 2) and <code>app/orders/page.tsx</code> (example 3). Confirm in DevTools that no request to FastAPI is made from the browser.`,
        `Add <code>useState</code> to the page, read the error, then move the interactive bit into <code>status-filter.tsx</code> with <code>'use client'</code>. Try passing a function prop from the page to it and read that error too.`,
        `Add <code>loading.tsx</code> and <code>error.tsx</code>; make FastAPI sleep 2 seconds, then return 500, and watch both appear.`,
        `Implement <code>addNote</code> (example 6) and <code>NoteForm</code> (example 7). Then, from the browser console or by editing the hidden input, submit a note for an order the user does not own and verify FastAPI rejects it.`,
        `Import <code>lib/fastapi.ts</code> from a client component and confirm the <code>server-only</code> build error.`,
        `<b>Done when:</b> the orders list renders from FastAPI via a server component, the filter and note form work with JS disabled for the form, a tampered request is rejected with "Not allowed.", and you can point at each file and say whether it runs on the server, the client, or both.`
      ],
      teach: `<p>"Server Components split React into two kinds of component. Server components are the default in the Next.js App Router: they run only on the server, can be async and await data directly, from FastAPI or a database, can use secrets, and send their rendered result, not their code, to the browser. They can't use state, effects or event handlers. When you need interactivity, you put <code>'use client'</code> at the top of a file; that's a boundary, so that file and its imports go to the browser, still SSR'd and then hydrated.</p>
<p>What crosses the boundary is serialised into the RSC payload, so props must be plain data: no functions, no class instances. But you can pass a server component to a client component as <code>children</code>, which is how interactive shells wrap server-rendered content.</p>
<p>For mutations there are Server Functions, marked <code>'use server'</code>. A form can call one directly with <code>useActionState</code>, and it works before JavaScript loads. The crucial thing is that each is a public endpoint, so validate and authorise every time. The App Router gives you layouts that persist, pages, loading and error files per segment, and route handlers. Caching is the part that changed most between versions; Next 15 stopped caching fetch by default, so I always set it explicitly. For a FastAPI product, I'd use this for public, content-heavy pages with FastAPI behind it as the system of record, and keep the logged-in dashboard as a SPA unless there's a measured reason to move."</p>`
    }
  ],
  quiz: [
    {
      q: `A teammate adds a quantity picker to a Next.js App Router page. The dev server shows an error instead of the page. What is wrong, and what is the smallest correct fix?`,
      code: `// app/cart/page.tsx
import { useState } from "react";

export default async function CartPage() {
  const res = await fetch(process.env.API_URL + "/api/cart", { cache: "no-store" });
  const cart: { sku: string; name: string; qty: number }[] = await res.json();
  const [qty, setQty] = useState(1);

  return (
    <ul>
      {cart.map((item) => (
        <li key={item.sku}>
          {item.name} <button onClick={() => setQty(qty + 1)}>{qty}</button>
        </li>
      ))}
    </ul>
  );
}`,
      lang: "tsx",
      ans: `Files in <code>app/</code> are Server Components by default, and Server Components cannot use <code>useState</code> or event handlers. Extract a small <code>'use client'</code> <code>QtyPicker</code> and keep the page on the server.`,
      why: `<p>The error tells you that <code>useState</code> only works in Client Components. Adding <code>'use client'</code> to the page is the tempting fix, but it fails: client components can't be <code>async</code>, and it would ship the whole page (and the <code>API_URL</code> access) to the browser. The right shape is to keep <code>CartPage</code> as an async server component that fetches the cart, and render <code>&lt;QtyPicker sku={item.sku} initial={item.qty} /&gt;</code> from a separate file that starts with <code>'use client'</code> and owns the state. The bug also hides a logic error: one <code>qty</code> shared by every row. In the client component each row gets its own state.</p>`
    },
    {
      q: `This footer is server-rendered and hydrated. In development the console shows a hydration error; in production some users in India see the footer flicker, and Sentry shows a recoverable error on every page view. Why, and how do you fix it?`,
      code: `export function Footer() {
  return (
    <footer>
      <p>Page generated at {new Date().toLocaleString()}</p>
    </footer>
  );
}`,
      lang: "tsx",
      ans: `The server and the first client render produce different text (different moment, and the server's locale/time zone vs the browser's), so hydration fails and React client-renders the nearest Suspense boundary, or the whole root if there is none.`,
      why: `<p>Even with the same clock, <code>toLocaleString()</code> on a UTC server with an <code>en-US</code> locale differs from an <code>en-IN</code> browser in Asia/Kolkata. React can't claim the text node, reports the mismatch through <code>onRecoverableError</code>, discards the server HTML for that region and renders it on the client: wasted work and a visible flicker. Fixes, best first: compute the timestamp on the server and render it with an explicit locale and <code>timeZone</code> (identical on both sides, passed down as data); or render a placeholder and set the client time in <code>useEffect</code>; or, if a differing timestamp is genuinely acceptable, put <code>suppressHydrationWarning</code> on that one <code>&lt;p&gt;</code>, knowing React keeps the server's text. Wrapping the footer in its own <code>&lt;Suspense&gt;</code> also limits the blast radius of any future mismatch.</p>`
    },
    {
      q: `A client component needed to create a Stripe payment intent. <code>process.env.STRIPE_SECRET_KEY</code> was <code>undefined</code> in the browser, so a developer renamed the variable as below. The feature now works. What happened?`,
      code: `// app/checkout/pay-button.tsx
"use client";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!;

export function PayButton({ amount }: { amount: number }) {
  async function pay() {
    await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: { Authorization: "Bearer " + stripeKey },
      body: new URLSearchParams({ amount: String(amount), currency: "inr" }),
    });
  }
  return <button onClick={pay}>Pay</button>;
}`,
      lang: "tsx",
      ans: `The secret key is now inlined into the public JavaScript bundle at build time. Anyone can read it from DevTools. Rotate the key immediately and move the call to the server.`,
      why: `<p><code>NEXT_PUBLIC_</code> (like <code>VITE_</code> in a Vite app) means "copy this value into client code": it was <code>undefined</code> precisely to protect the secret. The fix is architectural: the browser calls a Server Action (or FastAPI) that validates the amount <b>on the server</b> (never trust the client's <code>amount</code>), creates the payment intent with the secret key, and returns only the client secret meant for the browser. Put the Stripe helper in a module that starts with <code>import "server-only"</code> so this mistake becomes a build error, and add a CI check that scans built bundles for key patterns. Treat the exposed key as compromised: rotate it, don't just redeploy.</p>`
    },
    {
      q: `A server component passes props to a client chart. The page fails with an error about passing functions and objects to Client Components. Which props are the problem, and how do you fix them?`,
      code: `// app/reports/page.tsx (Server Component)
import { SalesChart } from "./sales-chart"; // 'use client'

export default async function ReportsPage() {
  const rows: { day: string; total: number }[] = await getSales();
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

  return (
    <SalesChart
      rows={rows}
      generatedAt={new Date()}
      formatValue={(n: number) => money.format(n)}
      onPointClick={(day: string) => console.log("clicked", day)}
    />
  );
}`,
      lang: "tsx",
      ans: `<code>formatValue</code> and <code>onPointClick</code> are functions, which can't be serialised into the RSC payload. <code>rows</code> (plain data) and <code>generatedAt</code> (a <code>Date</code>) are fine.`,
      why: `<p>Everything a server component passes to a client component is serialised and sent over the network. Plain objects, arrays, primitives, <code>Date</code>, <code>Map</code>/<code>Set</code>, JSX and Promises survive; functions don't (and neither would the <code>Intl.NumberFormat</code> instance itself). Fix by moving behaviour to where it runs: create the formatter and the click handler <b>inside</b> <code>SalesChart</code>, and pass configuration as data (<code>currency="INR"</code>, <code>locale="en-IN"</code>). If the click must do something on the server, pass a Server Function (<code>'use server'</code>), which is serialised as a reference. The tempting fix, marking <code>ReportsPage</code> <code>'use client'</code>, would ship the data fetching and its secrets to the browser and break the <code>async</code> component.</p>`
    },
    {
      q: `The "Delete order" button is only rendered for admins, so the team considers this Server Action safe. A pen tester deletes another customer's order as a normal user. How?`,
      code: `// app/orders/actions.ts
"use server";
import { revalidatePath } from "next/cache";

export async function deleteOrder(orderId: number) {
  await fetch(process.env.API_URL + "/internal/orders/" + orderId, {
    method: "DELETE",
    headers: { "X-Service-Token": process.env.SERVICE_TOKEN! },
  });
  revalidatePath("/orders");
}`,
      lang: "ts",
      ans: `A Server Action is a public HTTP endpoint. Hiding the button is not authorisation: any user can replay the action's POST with any <code>orderId</code>, and the action calls FastAPI with a privileged service token and no user identity.`,
      why: `<p>The tester triggers any action once (or reads the client bundle), copies the request, changes the argument and sends it. Nothing checks who is calling or whether <code>orderId</code> is even a number. Worse, the action uses a service token against an internal route, so FastAPI can't enforce per-user permissions either: the classic confused-deputy setup. Fix: inside the action, get the current user from the session and reject if absent; validate <code>orderId</code> with Zod; call FastAPI's normal endpoint <b>with the user's identity</b> so FastAPI's own authorisation (admin role, ownership) decides; log the deletion. UI checks are for user experience; server checks are for security.</p>`
    },
    {
      q: `An App Router dashboard takes 3 seconds to show anything, even the navigation. The slow part is a FastAPI recommendations endpoint. Which design would you choose?`,
      code: `// app/dashboard/layout.tsx
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await api<User>("/api/me");                       // 50 ms
  const recs = await api<Rec[]>("/api/recommendations");          // 3 s
  return (
    <div>
      <Nav user={user} />
      <aside><Recommendations items={recs} /></aside>
      <main>{children}</main>
    </div>
  );
}`,
      lang: "tsx",
      ans: `Move the slow fetch out of the layout's critical path: make <code>Recommendations</code> an async server component that fetches its own data and render it inside <code>&lt;Suspense fallback={…}&gt;</code>. The shell (nav and page) then streams immediately and the aside streams in when ready.`,
      why: `<p>Everything awaited before the layout returns is part of the shell, so the whole response waits for the slowest call, and both calls run sequentially (a server-side waterfall). With <code>&lt;Suspense&gt;&lt;Recommendations /&gt;&lt;/Suspense&gt;</code>, streaming SSR flushes the nav and page first and sends the recommendations later in the same response; selective hydration means the nav is interactive without waiting for it. Also add a timeout on the FastAPI call and consider caching recommendations in Redis on the FastAPI side. Making the whole dashboard a client component with a spinner would also "fix" the blank screen, but it gives up server-side data access and adds a client waterfall.</p>`
    }
  ]
},
/* ===== Day 14 ===== */
{
  n: 14,
  title: "Testing and TypeScript",
  goal: `<b>By the end of today</b> you can set up Vitest, React Testing Library, user-event and MSW in a Vite app, write behaviour-focused tests for components that fetch from FastAPI (including TanStack Query), add a Playwright smoke suite in CI, and type a React codebase with confidence: props, native element props, events, hooks, context, generic components and discriminated-union props, with API types generated from FastAPI's OpenAPI schema and validated at runtime.`,
  rev: [
    `<b>Testing trophy:</b> static checks (TypeScript, ESLint) at the base, a thin layer of unit tests for pure logic, the <b>bulk in integration tests</b> (a component plus its children, hooks and providers, with only the network mocked), and a few Playwright <b>end-to-end</b> tests for critical journeys. Test behaviour the user can observe, not implementation details.`,
    `<b>Query priority in Testing Library:</b> <code>getByRole</code> (with <code>{ name }</code>) → <code>getByLabelText</code> → <code>getByPlaceholderText</code> → <code>getByText</code> → <code>getByDisplayValue</code> → <code>getByAltText</code>/<code>getByTitle</code> → <code>getByTestId</code> last. <code>getBy</code> throws on 0 or &gt;1 matches, <code>queryBy</code> returns <code>null</code> (for asserting absence), <code>findBy</code> returns a promise that retries (for async UI).`,
    `<b>Interactions and async:</b> <code>const user = userEvent.setup()</code> before render, then <code>await user.click(...)</code> / <code>await user.type(...)</code>. Wait for async UI with <code>await screen.findByRole(...)</code> or <code>await waitFor(() =&gt; expect(...))</code>. A "not wrapped in act(...)" warning means a state update happened that your test did not wait for.`,
    `<b>Network mocking:</b> MSW v2 intercepts at the network layer: <code>http.get('*/api/users', () =&gt; HttpResponse.json(data))</code>, <code>setupServer(...handlers)</code> from <code>msw/node</code>, <code>listen</code>/<code>resetHandlers</code>/<code>close</code> in setup, <code>server.use(...)</code> to override per test. With TanStack Query: a <b>fresh <code>QueryClient</code> per test</b> with <code>retry: false</code>.`,
    `<b>TypeScript + React:</b> props as <code>type</code> aliases, <code>children: ReactNode</code>, extend native props with <code>ComponentPropsWithoutRef&lt;'button'&gt;</code>, events as <code>ChangeEvent&lt;HTMLInputElement&gt;</code>, DOM refs as <code>useRef&lt;HTMLInputElement&gt;(null)</code>, context as <code>createContext&lt;T | null&gt;(null)</code> plus a hook that throws, generic components (<code>function List&lt;T&gt;</code>), discriminated unions for variant-dependent props, <code>as const</code> and <code>satisfies</code>; API types generated from FastAPI's OpenAPI and validated at runtime with Zod.`
  ],
  topics: [
    {
      id: "d14-testing",
      title: "Testing React: Vitest, Testing Library, MSW and Playwright",
      lv: ["fresher", "mid", "senior", "lead"],
      eli5: `<p>Think about how a car company tests a new car. Engineers put a single brake pad on a bench and squeeze it a million times: that is a <b>unit test</b>. Then they mount the whole brake system (pedal, hydraulics, pads, discs) on a rig and press the pedal: that is an <b>integration test</b>. Finally, a test driver takes the finished car around a track: that is an <b>end-to-end test</b>. Bench tests are cheap and fast; track days are slow and expensive, so you do a lot of the first, a reasonable amount of the second, and only a few of the third.</p>
<p>React Testing Library tests the way a <b>driver</b> would, not the way a mechanic would. A driver doesn't open the bonnet to check which wire carries the brake signal; they press the pedal and check the car stops. Likewise, your test finds the button labelled "Save" the way a user (or a screen reader) would, clicks it, and checks that "Saved" appears. It doesn't care whether you used <code>useState</code> or <code>useReducer</code> inside. That is why you can rebuild the engine (refactor) without rewriting the tests.</p>
<p>Your React app talks to a FastAPI kitchen through a hatch in the wall (the network). In tests you don't want a real kitchen with real cooks (a real server, Redis, PostgreSQL). <b>MSW</b> puts a pretend cook behind the hatch: when the app asks for <code>/api/users</code>, the pretend cook slides back a plate of JSON. The app can't tell the difference, so you're testing your real code all the way up to the hatch.</p>
<p>And <b>Playwright</b> is the track day: a real browser, a real build of your app, clicking through "log in, open a project, rename it" exactly as a person would.</p>`,
      what: `<p>Testing a React app means checking, automatically, that what the user sees and can do matches what you intended. In a modern Vite project the standard stack is:</p>
<ul class="pts">
<li><b>Vitest</b>: the test runner. It finds <code>*.test.ts(x)</code> files, runs them in parallel worker processes, and gives you <code>describe</code>/<code>it</code>/<code>expect</code>, mocks (<code>vi.fn</code>, <code>vi.spyOn</code>, <code>vi.mock</code>), fake timers and snapshots. Its API is deliberately close to Jest's. The big win is that it reuses your <b>Vite config and transform pipeline</b>, so TSX, path aliases, <code>import.meta.env</code> and ESM work in tests exactly as in the app, without a separate Babel setup.</li>
<li><b>jsdom</b>: a JavaScript implementation of the DOM and many browser APIs that runs inside Node. Setting <code>environment: 'jsdom'</code> gives your tests a <code>document</code> and <code>window</code>. It has <b>no layout engine</b> (every element is 0×0, no CSS cascade for visibility from stylesheets you don't load), no real navigation, and some APIs (<code>IntersectionObserver</code>, <code>ResizeObserver</code>, <code>matchMedia</code>) are missing and must be stubbed. <code>happy-dom</code> is a faster, less complete alternative.</li>
<li><b>React Testing Library (RTL)</b>: <code>render()</code> mounts a component into a container in <code>document.body</code> using <code>createRoot</code>; <code>screen</code> exposes queries bound to <code>document.body</code>. Since RTL v16, <code>@testing-library/dom</code> is a peer dependency you install yourself.</li>
<li><b>@testing-library/jest-dom</b>: extra matchers like <code>toBeInTheDocument()</code>, <code>toBeDisabled()</code>, <code>toHaveTextContent()</code>, <code>toHaveValue()</code>, <code>toBeVisible()</code>, <code>toHaveAccessibleName()</code>. Import <code>@testing-library/jest-dom/vitest</code> in a setup file to register them with Vitest's <code>expect</code> (and their types).</li>
<li><b>@testing-library/user-event</b> (v14): simulates full interactions (pointer down, focus, pointer up, click; key down, input, key up per character) rather than firing a single synthetic event. All its methods are <b>async</b>.</li>
<li><b>MSW (Mock Service Worker) v2</b>: declares request handlers (<code>http.get</code>, <code>http.post</code>, …) that return <code>HttpResponse</code> objects. In the browser it runs in a Service Worker; in Node (Vitest) <code>setupServer</code> from <code>msw/node</code> patches the request modules (<code>fetch</code>, <code>http</code>, <code>XMLHttpRequest</code>) in the process. Your code calls the real <code>fetch</code>; MSW answers.</li>
<li><b>Playwright</b>: drives real Chromium, Firefox and WebKit for end-to-end tests against a running app, with auto-waiting locators, tracing and parallel workers.</li>
</ul>
<h5>Pyramid vs trophy</h5>
<p>The classic <b>testing pyramid</b> says: many unit tests, fewer integration tests, very few E2E tests. For frontends, Kent C. Dodds' <b>testing trophy</b> shifts the weight: a wide base of <b>static analysis</b> (TypeScript and ESLint catch typos and wrong props for free), a modest layer of <b>unit</b> tests (pure functions, reducers, formatters, custom hooks with tricky logic), the <b>largest layer of integration tests</b> (render a feature component with its real children, real hooks, real router/query providers, and mock only the network), and a thin top of <b>E2E</b>. The reasoning: "the more your tests resemble the way your software is used, the more confidence they can give you". A component test that renders <code>&lt;UserList /&gt;</code> with the real <code>useQuery</code> and an MSW-mocked <code>/api/users</code> catches far more real bugs per line than ten tests that each mock a hook.</p>
<h5>Queries: how to find things</h5>
<p>Every query comes in variants: <code>getBy*</code> (exactly one match, else throws with a helpful DOM dump), <code>getAllBy*</code> (one or more), <code>queryBy*</code>/<code>queryAllBy*</code> (returns <code>null</code>/<code>[]</code> instead of throwing: use only to assert something is <b>absent</b>), and <code>findBy*</code>/<code>findAllBy*</code> (returns a promise; retries until it matches or times out, 1000 ms by default). The recommended priority, most to least preferred:</p>
<ul class="pts">
<li><b><code>getByRole(role, { name })</code></b>: queries the accessibility tree. <code>getByRole('button', { name: 'Save' })</code>, <code>getByRole('heading', { level: 2, name: 'Projects' })</code>, <code>getByRole('textbox', { name: 'Email' })</code>, <code>getByRole('checkbox', { checked: true })</code>. If you can't find it by role, a screen-reader user probably can't either. That's a bug, not a testing inconvenience.</li>
<li><b><code>getByLabelText</code></b>: form fields via their <code>&lt;label&gt;</code>, <code>aria-label</code> or <code>aria-labelledby</code>.</li>
<li><b><code>getByPlaceholderText</code></b>: only if there's no label (and there should be one).</li>
<li><b><code>getByText</code></b>: non-interactive content (paragraphs, list items).</li>
<li><b><code>getByDisplayValue</code></b>: the current value of a filled-in input/select.</li>
<li><b><code>getByAltText</code>, <code>getByTitle</code></b>: images and titled elements.</li>
<li><b><code>getByTestId</code></b> last: for things with no accessible handle (a canvas wrapper, a chart). It couples the test to a <code>data-testid</code> attribute the user never sees.</li>
</ul>
<p>Text matchers can be a string (exact, whole-text, whitespace-normalised by default), a regex (<code>/saved/i</code>) or a function <code>(content, element) =&gt; boolean</code>. Use <code>within(element)</code> to scope queries to part of the page, for example <code>within(screen.getByRole('row', { name: /ada/i })).getByRole('button', { name: 'Delete' })</code>.</p>
<h5>Interactions: user-event v14</h5>
<p>Create a session with <code>const user = userEvent.setup()</code> <b>before</b> rendering, then <code>await</code> every call: <code>user.click</code>, <code>user.dblClick</code>, <code>user.type(el, 'text')</code>, <code>user.clear</code>, <code>user.selectOptions</code>, <code>user.keyboard('{Enter}')</code>, <code>user.tab()</code>, <code>user.hover</code>, <code>user.upload</code>. <code>fireEvent.click</code> from RTL dispatches one DOM event; <code>user.click</code> dispatches the whole sequence a browser would (pointerdown, mousedown, focus, pointerup, mouseup, click), respects <code>disabled</code> and <code>pointer-events: none</code>, and moves focus. Prefer user-event; reach for <code>fireEvent</code> only for events user-event doesn't model (a custom event, a <code>scroll</code>).</p>
<h5>Async UI</h5>
<ul class="pts">
<li><b><code>await screen.findByRole(...)</code></b>: wait for something to appear (data loaded, toast shown).</li>
<li><b><code>await waitFor(() =&gt; expect(x).toBe(y))</code></b>: retry an assertion until it passes (default timeout 1000 ms, interval 50 ms). Put <b>only assertions</b> inside, never clicks or other side effects, because the callback may run many times.</li>
<li><b><code>await waitForElementToBeRemoved(() =&gt; screen.queryByText('Loading…'))</code></b>: wait for a spinner to go.</li>
<li>Asserting absence after an async change: <code>await waitFor(() =&gt; expect(screen.queryByRole('dialog')).not.toBeInTheDocument())</code>.</li>
</ul>
<h5>Mocking: from narrow to wide</h5>
<ul class="pts">
<li><code>vi.fn()</code>: a stand-alone mock function, typically passed as a callback prop (<code>onSubmit</code>) so you can assert <code>toHaveBeenCalledWith</code>.</li>
<li><code>vi.spyOn(obj, 'method')</code>: wraps an existing method (e.g. <code>console.error</code>, <code>window.localStorage.setItem</code>); restore with <code>mockRestore()</code> or <code>restoreMocks: true</code> in config.</li>
<li><code>vi.mock('./module', factory)</code>: replaces a whole module. It is <b>hoisted</b> above imports. Use sparingly for things you truly can't run (analytics SDKs, a WebSocket client). Mocking your own API module or your own hooks is the classic way to get green tests and a broken app.</li>
<li><b>MSW</b>: mock at the <b>network boundary</b>. Everything above it (your fetch wrapper, error handling, JSON parsing, TanStack Query, the component) is real code under test.</li>
</ul>
<h5>Hooks, act, snapshots</h5>
<p><code>renderHook(() =&gt; useThing(), { wrapper })</code> renders a hook inside a tiny test component and gives you <code>result.current</code> and <code>rerender(newProps)</code>. Use it for reusable hooks with real logic; for hooks that exist only to serve one component, test through the component. <code>act()</code> tells React "apply all updates and effects scheduled inside this callback before I assert". RTL already wraps <code>render</code>, user-event and its async utilities in <code>act</code>, so you rarely call it yourself, except when you drive time or an external store directly (for example <code>act(() =&gt; vi.advanceTimersByTime(300))</code>). Snapshot tests (<code>toMatchSnapshot</code>, <code>toMatchInlineSnapshot</code>) store serialized output and fail on any diff: useful for small, stable serialisations (an error message formatter, a generated query string), weak for large component trees.</p>
<h5>End-to-end with Playwright</h5>
<p>Playwright tests launch the built (or dev) app in real browsers. Locators mirror RTL's philosophy: <code>page.getByRole('button', { name: 'Sign in' })</code>, <code>page.getByLabel('Email')</code>. Every action and web-first assertion (<code>await expect(locator).toBeVisible()</code>) <b>auto-waits</b>, so you never sleep. <code>page.route()</code> can stub specific network calls, but the real value of E2E is running against a real FastAPI + PostgreSQL stack (in CI via Docker Compose) for a handful of critical journeys: sign-in, the core create/edit flow, checkout.</p>`,
      why: `<p>Before Testing Library, the dominant React testing tool was <b>Enzyme</b>. It encouraged <i>shallow rendering</i> (render one level, stub the children) and poking at internals: <code>wrapper.state('isOpen')</code>, <code>wrapper.instance().handleClick()</code>, <code>wrapper.find('MyChild').props()</code>. Those tests broke every time you refactored (class to hooks, splitting a component), even though the user-visible behaviour hadn't changed, and they stayed green when the behaviour <i>was</i> broken (the handler existed, but the button wasn't wired to it). Enzyme also depended on React internals through adapters and never got an official adapter for React 18. Testing Library's answer was a deliberately limited API: you can only reach what a user can reach.</p>
<p>The second problem was <b>tooling friction</b>. Jest with Create React App meant a Babel transform separate from your build, slow cold starts, and pain with ESM-only packages. Vite projects would need a second, divergent transform config just for tests. <b>Vitest</b> runs on Vite's own pipeline, so one config serves dev, build and test, and watch mode re-runs only affected tests.</p>
<p>The third was <b>network mocking</b>. Teams wrote <code>global.fetch = jest.fn().mockResolvedValue({ json: () =&gt; ... })</code> in every test. That couples every test to the transport (switch to axios or add a header and fifty tests break), fakes the <code>Response</code> shape by hand (forgetting <code>ok</code> and <code>status</code>), and never exercises your real error handling. <b>MSW</b> moves the mock to where the real boundary is: the HTTP request. The same handlers can power tests, Storybook and local development before the FastAPI endpoint exists.</p>
<p>Finally, unit and integration tests in jsdom can't tell you that the production bundle loads, that the CSS doesn't hide the button, that the cookie-based auth with FastAPI actually works across a redirect, or that Safari behaves. That's what a small <b>Playwright</b> suite is for.</p>`,
      diagram: {
        html: flow([
          ["Test file", "render(&lt;UserList /&gt;) in fresh QueryClient", "g"],
          ["Component", "useQuery → fetch('/api/users')", ""],
          ["MSW (msw/node)", "intercepts the request, matches http.get('*/api/users')", "w"],
          ["HttpResponse.json", "real Response with status + JSON body", ""],
          ["React re-renders", "isPending → success, list in the DOM", ""],
          ["Assertions", "await findByRole('list') · user.click · expect", "g"]
        ]) + lanes([
          ["Static (base)", ["TypeScript strict", "ESLint + jsx-a11y", "generated API types"]],
          ["Unit", ["pure functions, reducers", "custom hooks via renderHook", "Vitest, fast, many"]],
          ["Integration (most)", ["feature component + real children", "real providers, MSW network", "RTL + user-event"]],
          ["E2E (few)", ["Playwright, real browsers", "real FastAPI in CI", "sign-in, core flows"]]
        ]),
        steps: [
          "The test renders the real component inside the same providers the app uses (a fresh <code>QueryClient</code>, a memory router if needed). Nothing inside the component is mocked.",
          "The component's effect or <code>useQuery</code> calls the real <code>fetch</code>. MSW has patched the request layer in Node, so the request is matched against your handlers instead of leaving the process.",
          "The matching handler returns <code>HttpResponse.json(...)</code>: a real <code>Response</code> object. Your fetch wrapper checks <code>res.ok</code>, parses JSON and throws on errors exactly as in production.",
          "React processes the state update and re-renders. Because this happens asynchronously, the test waits with <code>findBy*</code>/<code>waitFor</code>, which poll the DOM inside <code>act</code>.",
          "The test interacts like a user (<code>await user.click</code>) and asserts on what's visible. The lanes below show where each kind of test sits in the trophy: most of your confidence should come from the integration column."
        ]
      },
      ex: [
        {
          t: "Install and configure Vitest, jsdom, Testing Library and jest-dom",
          lang: "sh",
          code: `# from your Vite react-ts project
npm install -D vitest jsdom \\
  @testing-library/react @testing-library/dom \\
  @testing-library/user-event @testing-library/jest-dom \\
  msw

# package.json scripts (add these)
#   "test": "vitest",
#   "test:run": "vitest run",
#   "coverage": "vitest run --coverage"
# coverage needs: npm install -D @vitest/coverage-v8`,
          note: `<p><code>vitest</code> with no arguments starts watch mode locally and switches to a single run automatically when it detects CI. <code>vitest run</code> always runs once. <code>@testing-library/dom</code> is listed explicitly because RTL v16 made it a peer dependency.</p>`
        },
        {
          t: "vite.config.ts and the test setup file",
          lang: "ts",
          code: `// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:8000' }, // FastAPI in dev
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,          // vi.spyOn mocks are restored after each test
    css: false,                  // don't process CSS in unit tests
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();               // unmount everything rendered in this test
  server.resetHandlers();  // drop per-test overrides added with server.use()
});
afterAll(() => server.close());`,
          note: `<p>Importing <code>defineConfig</code> from <code>vitest/config</code> gives you a typed <code>test</code> block. We don't enable <code>globals: true</code>; tests import <code>describe/it/expect</code> explicitly, so we call <code>cleanup()</code> ourselves (RTL only auto-registers cleanup when a global <code>afterEach</code> exists). <code>onUnhandledRequest: 'error'</code> makes any request without a handler fail loudly instead of silently hitting the network. Also exclude test files from the app's <code>tsconfig.app.json</code> or add <code>"types": ["vitest/globals"]</code> only if you turn globals on.</p>`
        },
        {
          t: "A first component test: roles, user-event and jest-dom matchers",
          lang: "tsx",
          code: `// src/components/Counter.tsx
import { useState } from 'react';

export function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);
  return (
    <section aria-label="Counter">
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <button onClick={() => setCount(initial)} disabled={count === initial}>
        Reset
      </button>
    </section>
  );
}

// src/components/Counter.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments, then resets to the initial value', async () => {
    const user = userEvent.setup();
    render(<Counter initial={2} />);

    expect(screen.getByText('Count: 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Increment' }));
    expect(screen.getByText('Count: 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByText('Count: 2')).toBeInTheDocument();
  });
});`,
          out: ` ✓ src/components/Counter.test.tsx (1 test) 41ms
 Test Files  1 passed (1)
      Tests  1 passed (1)`,
          note: `<p><code>&lt;p&gt;Count: {count}&lt;/p&gt;</code> produces two text nodes ("Count: " and "3") in the <i>same</i> element, and <code>getByText</code> joins an element's own text nodes, so <code>'Count: 3'</code> matches. If the number were wrapped in <code>&lt;strong&gt;</code>, it would not (see the quiz). Nothing here touches <code>useState</code> directly: rewrite it with <code>useReducer</code> and the test still passes.</p>`
        },
        {
          t: "Testing a form: labels, typing, callback props and validation",
          lang: "tsx",
          code: `// src/features/auth/LoginForm.tsx
import { useState, type FormEvent } from 'react';

export type Credentials = { email: string; password: string };

export function LoginForm({ onSubmit }: { onSubmit: (c: Credentials) => void }) {
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    if (!email.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    setError(null);
    onSubmit({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Sign in" noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" />
      {error && <p role="alert">{error}</p>}
      <button type="submit">Sign in</button>
    </form>
  );
}

// src/features/auth/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits trimmed credentials', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), '  ada@example.com ');
    await user.type(screen.getByLabelText('Password'), 's3cret');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@example.com', password: 's3cret' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error and does not submit an invalid email', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});`,
          note: `<p>The second test submits with <kbd>Enter</kbd> from the focused field: user-event performs implicit form submission like a browser, so you test the keyboard path for free. <code>queryByRole</code> is used only for the absence assertion. <code>noValidate</code> turns off native constraint validation so our own message is the one shown, in the browser and in jsdom alike. Day 9 builds the same form with React Hook Form + Zod; the test would not change at all, which is the point.</p>`
        },
        {
          t: "MSW v2: handlers for the FastAPI endpoints and a Node server",
          lang: "ts",
          code: `// src/api/client.ts  (the app's real fetch wrapper)
const API_BASE: string = import.meta.env.VITE_API_BASE ?? window.location.origin;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(\`\${API_BASE}\${path}\`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null;
    throw new ApiError(res.status, body?.detail ?? \`Request failed (\${res.status})\`);
  }
  return (await res.json()) as T;
}

// src/test/handlers.ts
import { http, HttpResponse } from 'msw';

export type User = { id: number; name: string; email: string };

export const users: User[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
];

export const handlers = [
  http.get('*/api/users', () => HttpResponse.json(users)),

  http.get('*/api/users/:userId', ({ params }) => {
    const user = users.find((u) => u.id === Number(params.userId));
    return user
      ? HttpResponse.json(user)
      : HttpResponse.json({ detail: 'User not found' }, { status: 404 });
  }),

  http.post('*/api/users', async ({ request }) => {
    const body = (await request.json()) as Omit<User, 'id'>;
    return HttpResponse.json({ id: 3, ...body }, { status: 201 });
  }),
];

// src/test/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);`,
          note: `<p>Why <code>window.location.origin</code>? In the browser, <code>/api/users</code> and <code>http://localhost:5173/api/users</code> are the same request (Vite proxies it to FastAPI). In Node, <code>fetch</code> has no page URL to resolve a relative path against, so a bare <code>fetch('/api/users')</code> can throw "Failed to parse URL". Building an absolute URL from <code>location.origin</code> (jsdom sets one, <code>http://localhost:3000</code> by default in Vitest) works in both. The <code>*/api/...</code> handler paths match any origin. Error bodies mirror FastAPI's <code>{"detail": ...}</code> shape so the real error path is exercised.</p>`
        },
        {
          t: "Testing a component that fetches with TanStack Query (success, error, mutation)",
          lang: "tsx",
          code: `// src/features/users/UserList.tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

type User = { id: number; name: string; email: string };

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: () => api<User[]>('/api/users') });
}

export function UserList() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error } = useUsers();
  const invite = useMutation({
    mutationFn: (email: string) =>
      api<User>('/api/users', { method: 'POST', body: JSON.stringify({ name: 'Invited', email }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  if (isPending) return <p>Loading users…</p>;
  if (isError) return <p role="alert">Could not load users: {error.message}</p>;

  return (
    <>
      <ul aria-label="Users">
        {data.map((u) => <li key={u.id}>{u.name}</li>)}
      </ul>
      <button onClick={() => invite.mutate('grace@example.com')} disabled={invite.isPending}>
        Invite Grace
      </button>
      {invite.isSuccess && <p role="status">Invitation sent</p>}
    </>
  );
}

// src/test/utils.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

export function renderWithClient(ui: ReactElement) {
  const client = createTestQueryClient(); // fresh cache for every test
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { client, ...render(ui, { wrapper: Wrapper }) };
}

// src/features/users/UserList.test.tsx
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../test/server';
import { renderWithClient } from '../../test/utils';
import { UserList } from './UserList';

describe('UserList', () => {
  it('shows users returned by the API', async () => {
    renderWithClient(<UserList />);
    expect(screen.getByText('Loading users…')).toBeInTheDocument();

    const list = await screen.findByRole('list', { name: 'Users' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('shows the FastAPI error detail on a 500', async () => {
    server.use(
      http.get('*/api/users', () =>
        HttpResponse.json({ detail: 'Database unavailable' }, { status: 500 }),
      ),
    );
    renderWithClient(<UserList />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Database unavailable');
  });

  it('posts an invitation with the right body', async () => {
    let sentBody: unknown;
    server.use(
      http.post('*/api/users', async ({ request }) => {
        sentBody = await request.json();
        return HttpResponse.json({ id: 9, name: 'Invited', email: 'grace@example.com' }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderWithClient(<UserList />);

    await user.click(await screen.findByRole('button', { name: 'Invite Grace' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Invitation sent');
    expect(sentBody).toEqual({ name: 'Invited', email: 'grace@example.com' });
  });
});`,
          note: `<p>Two TanStack Query rules for tests (Day 7 covers the library itself). <b>Fresh client per test</b>: a shared client carries cached data from one test into the next, so tests pass or fail depending on order. <b><code>retry: false</code></b>: the default is 3 retries with exponential backoff, so an error test would sit in <code>isPending</code> for several seconds and <code>findByRole('alert')</code> would time out. The mutation test asserts on the <i>request body the server received</i>, which is more meaningful than asserting that a mocked function was called.</p>`
        },
        {
          t: "renderHook, act and fake timers for a custom hook",
          lang: "tsx",
          code: `// src/hooks/useDebouncedValue.ts
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

// src/hooks/useDebouncedValue.test.ts
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('only publishes the latest value after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'ab' });
    rerender({ value: 'abc' });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('abc');
  });
});

// The same hook through TanStack Query: renderHook with a wrapper
// import { waitFor } from '@testing-library/react';
// const client = createTestQueryClient();
// const { result } = renderHook(() => useUsers(), {
//   wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
// });
// await waitFor(() => expect(result.current.isSuccess).toBe(true));
// expect(result.current.data?.map((u) => u.name)).toEqual(['Ada Lovelace', 'Alan Turing']);`,
          note: `<p>This is one of the few places you call <code>act</code> yourself: advancing fake timers fires <code>setDebounced</code> outside anything RTL wrapped, and <code>act</code> makes React flush that update before the next line. Mixing fake timers with user-event needs <code>userEvent.setup({ advanceTimers: vi.advanceTimersByTime })</code>, otherwise user-event's internal delays wait on timers that never advance. The test file is <code>.ts</code> because it contains no JSX; the commented TanStack example would need <code>.tsx</code>.</p>`
        },
        {
          t: "Snapshots: where they help and where they hurt",
          lang: "tsx",
          code: `// Good: a small, stable, meaningful serialisation
import { describe, expect, it } from 'vitest';
import { buildUserQuery } from './buildUserQuery';

describe('buildUserQuery', () => {
  it('serialises filters the way FastAPI expects', () => {
    expect(buildUserQuery({ role: 'admin', page: 2, tags: ['a', 'b'] }))
      .toMatchInlineSnapshot('"role=admin&page=2&tags=a&tags=b"');
  });
});

// Weak: a whole page tree. Any className or wrapper change fails it,
// reviewers press "u" to update without reading, and it never checks behaviour.
// const { asFragment } = renderWithClient(<UsersPage />);
// expect(asFragment()).toMatchSnapshot();

// Better for UI: assert the specific things that matter
// expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
// expect(screen.getByRole('button', { name: 'Invite' })).toBeEnabled();`,
          note: `<p><code>buildUserQuery</code> would be a few lines of <code>URLSearchParams</code>; FastAPI reads repeated keys (<code>tags=a&amp;tags=b</code>) into a <code>list[str]</code> query parameter, so the snapshot documents a real contract. Inline snapshots are written into the test file by Vitest on first run (<code>vitest -u</code> updates them), so they're reviewed in the diff like code.</p>`
        },
        {
          t: "Playwright: config with a dev server and two end-to-end tests",
          lang: "ts",
          code: `// npm init playwright@latest   (creates config, e2e folder, installs browsers)

// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});

// e2e/auth.spec.ts
import { expect, test } from '@playwright/test';

test('a user can sign in and see their projects', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Password').fill('s3cret');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/projects$/);
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
});

test('shows a banner when the projects API is down', async ({ page }) => {
  await page.route('**/api/projects', (route) =>
    route.fulfill({ status: 503, json: { detail: 'Service unavailable' } }),
  );
  await page.goto('/projects');
  await expect(page.getByRole('alert')).toContainText('Service unavailable');
});`,
          note: `<p>The first test assumes a real FastAPI is reachable through the Vite proxy with a seeded user. The second stubs one endpoint with <code>page.route</code> to force a state that's hard to produce for real. Every <code>expect(locator)</code> retries until it passes or times out (5 s by default), so there are no sleeps. <code>trace: 'on-first-retry'</code> records a trace (DOM snapshots, network, console) you open with <code>npx playwright show-trace</code> when CI fails.</p>`
        },
        {
          t: "CI: GitHub Actions running type-check, Vitest and Playwright",
          lang: "yaml",
          code: `# .github/workflows/frontend.yml
name: frontend
on:
  pull_request:
  push:
    branches: [main]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx tsc -b          # static layer of the trophy
      - run: npm run lint
      - run: npx vitest run --coverage

  e2e:
    runs-on: ubuntu-latest
    needs: unit
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Start FastAPI, Redis and PostgreSQL
        run: docker compose -f docker-compose.ci.yml up -d --wait
      - run: npx playwright install --with-deps chromium webkit
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: \${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7`,
          note: `<p>Unit and integration tests run on every push in seconds; the E2E job only starts if they pass. <code>docker compose up --wait</code> blocks until the services' health checks pass (the backend's compose file needs healthchecks for that). Uploading the HTML report (with traces) even when tests fail is what makes CI failures debuggable.</p>`
        },
        {
          t: "Contract testing against FastAPI's OpenAPI schema",
          lang: "sh",
          code: `# 1. Export the schema from the FastAPI app (no server needed)
cd backend
python -c "import json; from app.main import app; print(json.dumps(app.openapi()))" > ../frontend/openapi.json

# 2. Generate TypeScript types from it
cd ../frontend
npm install -D openapi-typescript
npx openapi-typescript ./openapi.json -o src/api/schema.d.ts

# 3. In CI: regenerate, then fail if the committed types are stale or the app no longer compiles
npx openapi-typescript ./openapi.json -o src/api/schema.d.ts
git diff --exit-code src/api/schema.d.ts
npx tsc -b`,
          note: `<p>This turns "the backend renamed <code>full_name</code> to <code>display_name</code>" from a production bug into a red CI build: the generated type changes, <code>tsc</code> fails everywhere the old field is used. Pair it with MSW handlers typed from the same schema (next topic shows how to read types out of <code>schema.d.ts</code>), so your mocks can't drift from the real API either. For stricter consumer-driven contracts across teams, tools like Pact exist; on the backend side, schema-based fuzzers (for example Schemathesis) check that FastAPI actually honours its own OpenAPI document.</p>`
        }
      ],
      internals: `<p><b>What <code>render</code> does.</b> RTL creates a <code>&lt;div&gt;</code>, appends it to <code>document.body</code>, calls <code>createRoot(container)</code> and <code>root.render(ui)</code> inside <code>act()</code>. Because it's wrapped in <code>act</code>, React synchronously flushes the render, the commit and all effects (<code>useEffect</code> included) before <code>render</code> returns. So right after <code>render</code> the DOM shows the first committed state (often a loading state) and effects have run. <code>cleanup()</code> unmounts every root and removes the containers.</p>
<p><b>What <code>act</code> is.</b> In a browser, React schedules work with its scheduler (a <code>MessageChannel</code>-based task loop) and the work happens "later". In tests that's a problem: you'd assert before React has finished. When the global flag <code>IS_REACT_ACT_ENVIRONMENT</code> is true (RTL sets it), React pushes scheduled work into an <b>act queue</b> instead of the scheduler; when the outermost <code>act</code> scope exits, React drains the queue: renders, commits, runs effects, repeats until stable. If a state update happens while <b>no</b> act scope is active (a fetch resolved after your test stopped waiting, a timer fired), React logs "An update to UserList inside a test was not wrapped in act(...)". The fix is almost never to add <code>act</code> manually; it's to <b>wait for the final UI</b> with <code>findBy</code>/<code>waitFor</code> (which run their polling inside <code>act</code>), or to make sure the test doesn't end while requests are in flight. In React 19, <code>act</code> is exported from <code>react</code>; the old <code>react-dom/test-utils</code> export is deprecated, and RTL's re-export handles this for you.</p>
<p><b>How <code>getByRole</code> works.</b> <code>@testing-library/dom</code> walks the DOM, computes each element's role (explicit <code>role</code> attribute, or the implicit ARIA role: <code>&lt;button&gt;</code> is button, <code>&lt;ul&gt;</code> is list, <code>&lt;a href&gt;</code> is link, <code>&lt;input type="checkbox"&gt;</code> is checkbox) and, when you pass <code>name</code>, computes the <b>accessible name</b> using the accname algorithm (via <code>dom-accessibility-api</code>): <code>aria-labelledby</code>, then <code>aria-label</code>, then <code>&lt;label&gt;</code>, then content. By default it excludes elements hidden from the accessibility tree (<code>display: none</code>, <code>hidden</code>, <code>aria-hidden</code>), which requires computed styles; that's why <code>getByRole</code> is noticeably slower than <code>getByText</code> on huge trees. It's still the right default.</p>
<p><b>How <code>findBy</code>/<code>waitFor</code> poll.</b> <code>waitFor</code> runs your callback immediately, then again on every DOM mutation (a <code>MutationObserver</code> on the container) and every 50 ms, until it doesn't throw or the timeout (1000 ms) passes, then throws the last error with a DOM dump. <code>findBy*</code> is literally <code>waitFor(() =&gt; getBy*(...))</code>.</p>
<p><b>How user-event works.</b> It dispatches real DOM events in browser order, checks pointer-events and disabled state, moves focus, and for typing it updates the input's value through the native value setter and dispatches <code>input</code> events. React listens for <code>input</code>/<code>change</code> at the root (event delegation) and its <code>onChange</code> fires, so the controlled component re-renders. It awaits between steps (a microtask by default, or <code>delay</code>), which is why every call is async and why it needs to be told about fake timers.</p>
<p><b>How MSW intercepts in Node.</b> <code>setupServer</code> uses the <code>@mswjs/interceptors</code> package to patch <code>globalThis.fetch</code>, the <code>http</code>/<code>https</code> modules and <code>XMLHttpRequest</code>. Each outgoing request is turned into a standard Fetch <code>Request</code>, matched against handlers (most recently added first, so <code>server.use</code> overrides win), and the handler's <code>Response</code> is returned to the caller. No port is opened. In the browser, <code>setupWorker</code> registers a Service Worker that intercepts real network requests and messages the page to resolve them, which is why the same handlers work in Storybook and in dev.</p>
<p><b>Vitest's runtime.</b> Each test file runs in an isolated module graph inside a worker (threads or forks pool), with modules transformed by Vite's plugins (esbuild for TS/JSX, plus <code>@vitejs/plugin-react</code>). <code>vi.mock</code> calls are hoisted to the top of the file by a transform, so they apply before imports are evaluated. Files run in parallel; tests within a file run sequentially by default.</p>`,
      prod: `<p><b>What a healthy React + FastAPI test suite looks like.</b> In a mid-sized product (say 150 screens), a typical shape is: TypeScript strict plus ESLint on every commit; a few hundred Vitest files mostly at the feature level (<code>ProjectSettings.test.tsx</code> renders the whole settings page with MSW); a handful of hook and utility tests; and 20 to 60 Playwright specs for the journeys that make money or would page someone (sign-in and token refresh, create/edit/delete of the core entity, billing, permissions). Unit+integration run in under two minutes on CI; E2E runs on every PR against a Docker Compose stack (FastAPI, Redis, PostgreSQL with a seeded schema) and nightly across browsers.</p>
<p><b>Shared test infrastructure is a product.</b> Put a <code>renderApp(ui, { route, user, queryClient })</code> helper in <code>src/test/</code> that wraps <code>QueryClientProvider</code>, a memory router (<code>createMemoryRouter</code> from React Router), the auth context with a fake user, theme, and i18n. Keep MSW handlers per feature (<code>handlers/users.ts</code>, <code>handlers/projects.ts</code>) with <b>factories</b> (<code>buildUser({ role: 'admin' })</code>) instead of giant fixture files. Type handlers from the generated OpenAPI types so a backend change breaks mocks at compile time. Reuse the same handlers in Storybook and in a "mock backend" dev mode so frontend work isn't blocked on endpoints.</p>
<p><b>What goes wrong at scale.</b></p>
<ul class="pts">
<li><b>Flaky tests.</b> Usual causes: shared <code>QueryClient</code> or module-level state leaking between tests; asserting before async work settles (missing <code>await</code> on <code>user.click</code> or <code>findBy</code>); real timers and <code>Date.now()</code> (pin time with <code>vi.setSystemTime</code>); order-dependent MSW overrides when <code>resetHandlers</code> is missing. In Playwright: shared test users mutated by parallel tests (create data per test via the API), and arbitrary <code>waitForTimeout</code> sleeps. Quarantine and fix; never accept a flaky suite, because people stop trusting red builds.</li>
<li><b>Over-mocking.</b> Tests that <code>vi.mock</code> your own hooks pass while the real hook is broken. Rule: mock at process boundaries (network, time, randomness, browser APIs jsdom lacks), not between your own modules.</li>
<li><b>Slow suites.</b> jsdom setup and <code>getByRole</code> on big trees dominate. Use Vitest's parallelism, avoid rendering the entire app shell in every test, use <code>getByRole</code> with a scoped <code>within</code>, and consider <code>happy-dom</code> if compatible. Shard Playwright across CI machines (<code>--shard=1/4</code>).</li>
<li><b>Coverage theatre.</b> Enforcing 90% line coverage pushes people to test trivial getters and snapshot everything. Track coverage trends and review untested critical paths instead.</li>
<li><b>Contract drift.</b> MSW mocks written by hand describe what the frontend developer <i>believed</i> the API returned. When FastAPI changes a Pydantic model, unit tests stay green and production breaks. Generated types plus a CI regeneration check close that gap, and a few E2E tests against the real backend catch what types can't (auth, CORS, cookies, status codes).</li>
<li><b>Visual regressions.</b> jsdom has no layout, so a CSS change that hides the submit button passes every RTL test. Playwright's <code>toHaveScreenshot()</code> or a hosted visual-diff service covers that, at the cost of baseline maintenance.</li>
</ul>`,
      iq: [
        ["fresher", "What is the difference between <code>getBy</code>, <code>queryBy</code> and <code>findBy</code>?", "<p><code>getBy*</code> returns the single matching element synchronously and <b>throws</b> if there are zero or more than one. <code>queryBy*</code> returns <code>null</code> when nothing matches, so it's for asserting absence: <code>expect(screen.queryByRole('alert')).not.toBeInTheDocument()</code>. <code>findBy*</code> returns a <b>promise</b> that retries until the element appears (default 1 s), for async UI. The tempting mistake is using <code>queryBy</code> everywhere \"to be safe\": you lose <code>getBy</code>'s descriptive error and DOM dump, and a typo in the query silently passes a <code>not.toBeInTheDocument()</code> check.</p>"],
        ["fresher", "Why does Testing Library recommend <code>getByRole</code> over <code>getByTestId</code>?", "<p><code>getByRole('button', { name: 'Save' })</code> finds the element the way assistive technology and users perceive it, so the test also verifies accessibility (it's a real button, it has an accessible name) and survives markup refactors. <code>data-testid</code> is invisible to users: the test passes even if the \"button\" is a <code>&lt;div&gt;</code> with no keyboard support and no label. Test IDs are a last resort for elements with no accessible handle (a chart canvas).</p>"],
        ["mid", "Why use <code>userEvent</code> instead of <code>fireEvent</code>? And why must it be awaited?", "<p><code>fireEvent.click</code> dispatches one <code>click</code> event. A real click is pointerdown, mousedown, focus change, pointerup, mouseup, click, and it doesn't happen at all on a disabled button or under <code>pointer-events: none</code>. user-event v14 simulates that whole sequence and those checks, and typing goes key by key through <code>keydown</code>/<code>input</code>/<code>keyup</code>, so bugs in focus handling, <code>onKeyDown</code> or disabled states surface. Its methods are async (they yield between steps and wrap work in <code>act</code>), so a missing <code>await</code> lets the test assert before the interaction finished, often producing act warnings or false passes. Create the instance with <code>userEvent.setup()</code> before render.</p>"],
        ["mid", "You see \"Warning: An update to UserList inside a test was not wrapped in act(...)\". What does it mean and how do you fix it?", "<p>A state update happened while no <code>act</code> scope was active, typically because a fetch or timer resolved <b>after</b> the test's last awaited step, so the test asserted on an intermediate state (or ended) while React was still working. Fix it by waiting for the final UI: <code>await screen.findByText('Ada')</code> or <code>await waitFor(...)</code>, or by awaiting the user-event call that triggered it. Wrapping random lines in <code>act()</code> silences the warning without guaranteeing you assert on the right state; it's the tempting wrong fix. Manual <code>act</code> is legitimate when you drive something RTL doesn't know about, like <code>vi.advanceTimersByTime</code> or an external store.</p>"],
        ["mid", "How do you test a component that calls a FastAPI endpoint?", "<p>Render the real component and mock the <b>network</b> with MSW: a handler <code>http.get('*/api/users', () =&gt; HttpResponse.json([...]))</code> registered via <code>setupServer</code> in the setup file, <code>server.use(...)</code> to override for error cases (<code>HttpResponse.json({ detail: '...' }, { status: 500 })</code>), and <code>findBy*</code> to wait for the result. If it uses TanStack Query, wrap it in a fresh <code>QueryClient</code> with <code>retry: false</code>. Mocking <code>fetch</code> with <code>vi.fn</code> or <code>vi.mock</code>-ing your API module is the tempting alternative, but it couples tests to the transport, skips your real error handling, and lets the mock's shape drift from the real API.</p>"],
        ["mid", "Why create a new <code>QueryClient</code> in every test, and why turn retries off?", "<p>The <code>QueryClient</code> holds the cache. Shared across tests, test B can see test A's cached <code>['users']</code> data and skip the request entirely, so results depend on execution order. Retries default to 3 with exponential backoff, so a test for the error state waits several seconds and usually times out the 1 s <code>findBy</code>. A per-test client with <code>retry: false</code> makes tests isolated and fast. A module-level <code>new QueryClient()</code> in <code>test-utils</code> is the subtle version of this bug.</p>"],
        ["senior", "Explain the testing trophy. How would you split effort between unit, integration and E2E tests for a React + FastAPI product?", "<p>The trophy puts static analysis at the base (TypeScript strict, ESLint, generated API types: cheap, catches whole bug classes), a modest unit layer for pure logic and reusable hooks, the <b>largest share in integration tests</b> (feature-level components with real children, hooks and providers, network mocked with MSW), and a thin E2E layer with Playwright for critical journeys against a real backend. Integration tests give the best confidence per cost: they exercise the wiring where most UI bugs live, yet run in milliseconds. E2E catches what jsdom can't (real CSS, routing, cookies/CORS with FastAPI, browser differences) but is slow and flakier, so keep it to journeys you'd page someone for. The pyramid's \"mostly unit tests\" advice, applied to components, tends to produce shallow tests of implementation details that break on refactor and miss integration bugs.</p>"],
        ["senior", "A test suite is green but production is broken: the users page crashes because FastAPI now returns <code>{ items, total }</code> instead of an array. How do you prevent this class of bug?", "<p>The mocks encoded an outdated contract. Fixes, in layers: (1) <b>generate types</b> from FastAPI's OpenAPI with <code>openapi-typescript</code> and regenerate in CI with <code>git diff --exit-code</code>, so the change fails <code>tsc</code> in every consumer; (2) <b>type the MSW handlers</b> from those types so mocks can't return a shape the schema doesn't allow; (3) <b>validate at runtime</b> at the API boundary with Zod so a mismatch produces a clear error and telemetry instead of a crash deep in render; (4) a few <b>E2E tests against the real backend</b>; (5) API versioning or additive-only changes on the backend. \"Write more unit tests\" is the wrong answer: more tests against the same wrong mock add nothing.</p>"],
        ["lead", "How do you keep a large frontend test suite fast and non-flaky across 20 engineers?", "<p>Standards and infrastructure, not heroics. Provide a shared <code>renderApp</code> helper (fresh QueryClient, memory router, auth fixture), per-feature MSW handlers with typed factories, and <code>onUnhandledRequest: 'error'</code>. Lint rules: <code>eslint-plugin-testing-library</code> and <code>jest-dom</code> (flags missing awaits, <code>getBy</code> for absence, <code>container.querySelector</code>). Ban sleeps; pin time with <code>vi.setSystemTime</code>. Track flaky tests (Playwright retries reveal them in reports), quarantine with an owner and deadline, and treat flake rate as a metric. Shard Playwright, run E2E on merge queue rather than every push if needed, and keep E2E data isolated (create per test via API). Review tests in code review for behaviour focus. The trap is chasing a coverage percentage: it rewards quantity over confidence.</p>"],
        ["architect", "Where would you put contract testing between a React frontend and several FastAPI services, and what are the trade-offs versus E2E tests?", "<p>Make the <b>OpenAPI document the contract</b>: each FastAPI service publishes it as a build artifact; the frontend generates types (and optionally a typed client such as <code>openapi-fetch</code>) and CI fails on breaking diffs; backend CI runs schema conformance tests (property-based tools like Schemathesis) to prove the service honours its schema, and a breaking-change detector on the schema diff gates merges. For multiple consumer teams, consumer-driven contracts (Pact) let each consumer state exactly which fields it relies on, so providers know what they can change. Contract tests are fast, precise and run per service without a full environment; E2E tests verify the integrated system (auth, CORS, infra, data) but are slow, flaky and give poor failure localisation. Use contracts for shape compatibility and a small E2E suite for wiring; relying on E2E alone for API compatibility doesn't scale past a few services.</p>"]
      ],
      gotchas: [
        "<b>Text split across elements:</b> <code>&lt;p&gt;Total: &lt;strong&gt;42&lt;/strong&gt;&lt;/p&gt;</code> can't be found with <code>getByText('Total: 42')</code>, because the default matcher only looks at each element's <i>own</i> text nodes. Use <code>expect(screen.getByRole(...)).toHaveTextContent('Total: 42')</code> on a containing element, or a function matcher.",
        "<b>Forgetting <code>await</code></b> on <code>user.click</code> or on <code>expect(await screen.findBy...)</code> produces tests that pass by accident or fail intermittently, plus act warnings. The <code>eslint-plugin-testing-library</code> rules catch most of these.",
        "<b>Relative URLs in Node:</b> <code>fetch('/api/users')</code> works in the browser but has no base URL in Node, so tests can fail with \"Failed to parse URL\" before MSW sees the request. Build absolute URLs from <code>window.location.origin</code> or a configured base.",
        "<b><code>waitFor</code> with side effects:</b> putting <code>user.click</code> or <code>fireEvent</code> inside the callback runs them repeatedly. Only assertions go inside <code>waitFor</code>. An empty <code>waitFor(() =&gt; {})</code> waits for nothing.",
        "<b>jsdom gaps:</b> no layout (<code>getBoundingClientRect</code> returns zeros), no <code>IntersectionObserver</code>, <code>ResizeObserver</code>, <code>matchMedia</code> or <code>scrollIntoView</code>. Components using them crash in tests until you stub them in the setup file. Virtualised lists may render zero rows because the container height is 0.",
        "<b><code>vi.mock</code> is hoisted:</b> it runs before your imports, so a factory can't reference variables declared in the test file unless you create them with <code>vi.hoisted()</code>. Module mocks also leak across tests in the same file unless reset.",
        "<b>Fake timers and promises:</b> <code>vi.useFakeTimers()</code> also fakes <code>Date</code> and can stall user-event and <code>waitFor</code> polling. Pass <code>advanceTimers: vi.advanceTimersByTime</code> to <code>userEvent.setup</code> and restore real timers in <code>afterEach</code>.",
        "<b>A green E2E test with <code>page.route</code> everywhere</b> is a slow integration test. If every API call is stubbed, you're not testing the FastAPI integration (cookies, CORS, real status codes) that E2E is supposed to cover."
      ],
      best: [
        "Test behaviour the user can observe: what's on screen, what's announced, what request is sent. Never assert on state variables, hook call counts or component instance methods.",
        "Query by role and accessible name first; treat \"I can't find it by role\" as an accessibility bug to fix in the component.",
        "Mock at the network boundary with MSW, with handlers typed from FastAPI's generated OpenAPI types, and set <code>onUnhandledRequest: 'error'</code>.",
        "One shared render helper that wraps all app providers, creating a fresh <code>QueryClient</code> (retries off) and router per test.",
        "Write one integration test per user-facing behaviour (happy path, validation error, server error, empty state) rather than one test per function.",
        "Keep Playwright for a small set of critical journeys against a real backend; use auto-waiting locators and web-first assertions, never fixed sleeps; upload traces in CI.",
        "Run <code>tsc</code>, lint, Vitest and Playwright in CI on every PR; regenerate API types in CI and fail on drift."
      ],
      lab: [
        "In your Vite react-ts app, install <code>vitest jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom msw</code>, add the <code>test</code> block to <code>vite.config.ts</code> and create <code>src/test/setup.ts</code> as in the examples. Add <code>\"test\": \"vitest\"</code> to <code>package.json</code>.",
        "Write <code>Counter.test.tsx</code> using only <code>getByRole</code>/<code>getByText</code> and user-event. Then refactor <code>Counter</code> to <code>useReducer</code> and confirm the test still passes without changes.",
        "Create <code>src/test/handlers.ts</code> and <code>server.ts</code> with handlers for <code>GET /api/users</code> (mirroring your FastAPI response) and wire them into the setup file. Build <code>UserList</code> with TanStack Query and test the loading, success and 500-error states using <code>renderWithClient</code> and <code>server.use</code>.",
        "Deliberately break things: remove <code>retry: false</code> and watch the error test time out; share one <code>QueryClient</code> across tests and observe order-dependent results; remove an <code>await</code> and read the act warning. Restore each fix.",
        "Run <code>npm init playwright@latest</code>, point <code>webServer</code> at <code>npm run dev</code>, and write one spec that loads the users page and checks a heading with <code>getByRole</code>.",
        "Export FastAPI's <code>openapi.json</code>, run <code>npx openapi-typescript</code> to generate <code>src/api/schema.d.ts</code>, and use its <code>User</code> schema type in your MSW handlers.",
        "<b>Done when:</b> <code>npx vitest run</code> passes with no act warnings in the output, changing a field name in the FastAPI Pydantic model and regenerating types makes <code>npx tsc -b</code> fail in both the component and the MSW handlers, and <code>npx playwright test</code> passes in at least one browser."
      ],
      teach: `<p>"Frontend tests should give you confidence that the app works for users, so we write them the way users use the app. The shape I aim for is the testing trophy: TypeScript and ESLint at the base, a few unit tests for pure logic, most of the effort in integration tests, and a handful of end-to-end tests.</p>
<p>The integration test is the workhorse. With Vitest and React Testing Library I render a real feature component, say the users page, inside the same providers the app uses: a fresh TanStack Query client with retries off, and a router. I find elements by role and accessible name, the way a screen reader would, so <code>getByRole('button', { name: 'Invite' })</code>, and I interact with user-event, awaiting every click and keystroke. Because data arrives asynchronously, I wait with <code>findBy</code> or <code>waitFor</code>; if React warns about act, it means my test didn't wait for something.</p>
<p>I don't mock my own modules. I mock the network with MSW: handlers like <code>http.get('/api/users')</code> return <code>HttpResponse.json</code>, so my fetch wrapper, error handling and query cache all run for real. For error cases I override one handler with a 500 and a FastAPI-style <code>detail</code>.</p>
<p>On top, Playwright runs a few critical journeys in real browsers against a real FastAPI stack in CI, with traces uploaded when something fails. And to stop the mocks drifting from the backend, I generate TypeScript types from FastAPI's OpenAPI schema and fail CI if they change unexpectedly."</p>`
    },
    {
      id: "d14-typescript-react",
      title: "TypeScript with React: props, events, generics, refs and context",
      lv: ["fresher", "mid", "senior", "lead"],
      eli5: `<p>Imagine every component is a vending machine with a slot on the front. The <b>props type</b> is the label printed above the slot: "takes 2-euro coins and 5-euro notes, nothing else". Without the label, people push in buttons, keys and foreign coins, and you only find out when the machine jams in front of a customer. With the label, TypeScript is the attendant standing next to the machine, stopping wrong coins <i>before</i> they go in, which in code means a red squiggle in your editor rather than a crash in production.</p>
<p>Some machines are clever: a coffee machine has a "milk" option, but the milk-amount dial only appears if you picked milk. That's a <b>discriminated union</b>: the props you're allowed to pass depend on a choice you made. And some machines are general-purpose lockers that hold "whatever you put in, and give exactly that back": that's a <b>generic component</b> like <code>List&lt;T&gt;</code>, which works for users, projects or invoices, and always hands you back the same kind of thing you gave it.</p>
<p>One warning: the label only describes what the <i>machine expects</i>. When a delivery arrives from outside (JSON from your FastAPI server), TypeScript can't open the box at runtime; it just trusts whatever you told it the box contains. That's why, at the border with the outside world, we also use a scanner (Zod) that checks the contents for real.</p>`,
      what: `<p>TypeScript adds static types to JavaScript; for React that means checking, at compile time, that components receive the props they expect, that event handlers use the right event and element types, that state, refs and context hold what you think, and that data from the server is the shape you code against. In a Vite <code>react-ts</code> app, Vite only <b>strips</b> types (via esbuild) and never type-checks; type-checking happens in your editor and when you run <code>tsc -b</code> (the template's <code>build</code> script runs it before <code>vite build</code>). The React types come from <code>@types/react</code> and <code>@types/react-dom</code>.</p>
<h5>Props</h5>
<ul class="pts">
<li>Declare props with a <code>type</code> alias (or <code>interface</code>; both work, pick one convention). Destructure with defaults: <code>function Avatar({ size = 32, user }: AvatarProps)</code>. Optional props use <code>?</code>; their type inside the component is <code>T | undefined</code> unless defaulted.</li>
<li>Use <b>string literal unions</b> instead of <code>string</code> for closed sets: <code>size: 'sm' | 'md' | 'lg'</code>. Autocomplete and typo protection for free.</li>
<li><code>children: ReactNode</code> accepts anything React can render: elements, strings, numbers, <code>null</code>, <code>undefined</code>, booleans, arrays and (in React 19 types) promises for use with Suspense. Use <code>ReactElement</code> only when you really require a single element (for example, to <code>cloneElement</code> it).</li>
<li>Callback props are function types: <code>onSelect: (id: number) =&gt; void</code>. Name them <code>onX</code>; type the handlers you implement as <code>handleX</code>.</li>
</ul>
<h5>Extending native element props</h5>
<p>Design-system components wrap native elements and should accept everything the native element does (<code>type</code>, <code>aria-*</code>, <code>onClick</code>, <code>form</code>, <code>data-*</code>). The helpers:</p>
<ul class="pts">
<li><code>ComponentPropsWithoutRef&lt;'button'&gt;</code>: all props of a <code>&lt;button&gt;</code> except <code>ref</code>.</li>
<li><code>ComponentProps&lt;'input'&gt;</code>: all props of an input. In React 19, where <code>ref</code> is a normal prop for function components, this includes <code>ref</code>, so spreading <code>...rest</code> onto the <code>&lt;input&gt;</code> forwards the ref without <code>forwardRef</code>. (In React 18 you still need <code>forwardRef</code>, and <code>ComponentPropsWithRef</code>.)</li>
<li><code>ComponentProps&lt;typeof Button&gt;</code>: extract the props of an existing component (handy for wrappers and for third-party components that don't export their props type).</li>
<li>Use <code>Omit&lt;ComponentProps&lt;'input'&gt;, 'size'&gt;</code> when your prop name collides with a native one with a different type.</li>
</ul>
<h5>Events</h5>
<p>React's event types are generic over the element: <code>ChangeEvent&lt;HTMLInputElement&gt;</code>, <code>FormEvent&lt;HTMLFormElement&gt;</code>, <code>MouseEvent&lt;HTMLButtonElement&gt;</code>, <code>KeyboardEvent&lt;HTMLInputElement&gt;</code>, <code>FocusEvent</code>, <code>DragEvent</code>, <code>PointerEvent</code>. They're React's synthetic event types, imported from <code>react</code>, not the DOM's global <code>MouseEvent</code> (a common accidental mismatch). Handler shorthand types exist too: <code>ChangeEventHandler&lt;HTMLInputElement&gt;</code>. <code>e.currentTarget</code> is typed as the element the handler is attached to; <code>e.target</code> is typed as <code>EventTarget</code> for most events (it could be any descendant), except <code>ChangeEvent</code> where it's the element. When you write a handler inline (<code>onChange={(e) =&gt; setQuery(e.target.value)}</code>), the type is inferred from context; annotate only when the handler is declared separately.</p>
<h5>Hooks</h5>
<ul class="pts">
<li><b><code>useState</code></b> infers from the initial value: <code>useState(0)</code> is <code>number</code>. Pass the type when the initial value is narrower than the real one: <code>useState&lt;User | null&gt;(null)</code>, <code>useState&lt;Status&gt;('idle')</code>, <code>useState&lt;string[]&gt;([])</code> (otherwise <code>[]</code> becomes <code>never[]</code>).</li>
<li><b><code>useReducer</code></b>: type the reducer's parameters (<code>(state: State, action: Action): State</code>) with <code>Action</code> as a <b>discriminated union</b>; the hook infers the rest. A <code>never</code> check in the <code>default</code> branch makes adding an action without handling it a compile error.</li>
<li><b><code>useRef</code></b> has two jobs. For DOM refs: <code>useRef&lt;HTMLInputElement&gt;(null)</code>, and <code>ref.current</code> is <code>HTMLInputElement | null</code>, so you write <code>ref.current?.focus()</code>. For mutable instance values: <code>useRef&lt;number | null&gt;(null)</code> for a timer id, <code>useRef(0)</code> for a counter. In <code>@types/react</code> 18, <code>useRef&lt;T&gt;(null)</code> returned a read-only <code>RefObject</code> (assigning <code>.current</code> was an error), so you had to write <code>useRef&lt;T | null&gt;(null)</code> for mutable refs; the React 19 types make all refs mutable and require an initial argument.</li>
<li><b>Custom hooks</b> returning tuples need <code>as const</code> (or an explicit tuple return type), otherwise <code>return [value, setValue]</code> is inferred as an array of a union.</li>
</ul>
<h5>Context</h5>
<p><code>createContext&lt;AuthContextValue | null&gt;(null)</code> plus a custom hook that throws when the value is <code>null</code> (<code>useAuth()</code>) gives consumers a non-nullable type and a clear error when someone forgets the provider. The alternative, <code>createContext&lt;AuthContextValue&gt;({} as AuthContextValue)</code>, lies to the compiler: consumers outside the provider get <code>undefined</code> functions at runtime.</p>
<h5>Generic components</h5>
<p>A component can be a generic function: <code>function List&lt;T&gt;(props: ListProps&lt;T&gt;)</code>. TypeScript infers <code>T</code> from the props at the call site (<code>items={users}</code> makes <code>T = User</code>), and then checks that <code>renderItem</code>, <code>getKey</code> and <code>onSelect</code> agree with it. You can constrain with <code>T extends { id: string | number }</code>. In <code>.tsx</code> files, an arrow function generic must be written <code>&lt;T,&gt;</code> (or <code>&lt;T extends unknown&gt;</code>) because <code>&lt;T&gt;</code> parses as a JSX tag.</p>
<h5>Discriminated union props</h5>
<p>When which props are valid depends on a "mode" prop, model it as a union of object types sharing a literal discriminant: <code>{ variant: 'link'; href: string } | { variant: 'button'; onClick: () =&gt; void }</code>. TypeScript rejects <code>href</code> on a button variant, requires it on the link variant, and narrows inside the component after <code>if (props.variant === 'link')</code>. Use <code>prop?: never</code> to explicitly forbid a prop in one branch. This replaces the "bag of optional props" anti-pattern where every combination is allowed and half of them are meaningless.</p>
<h5><code>as const</code> and <code>satisfies</code></h5>
<ul class="pts">
<li><b><code>as const</code></b> makes a literal deeply <code>readonly</code> and keeps literal types: <code>['viewer', 'editor', 'admin'] as const</code> has type <code>readonly ['viewer', 'editor', 'admin']</code>, so <code>(typeof ROLES)[number]</code> is the union <code>'viewer' | 'editor' | 'admin'</code>. One source of truth for runtime values and types. Also used for TanStack Query key factories and tuple-returning hooks.</li>
<li><b><code>satisfies</code></b> (TypeScript 4.9+) checks a value against a type <i>without widening</i> it to that type: <code>const variantClass = {...} satisfies Record&lt;Variant, string&gt;</code> errors if a variant is missing or misspelled, yet keeps the exact keys and literal types for inference. A type annotation (<code>const x: Record&lt;Variant, string&gt; = ...</code>) would check but forget the precise type.</li>
</ul>
<h5>Typing API responses from FastAPI</h5>
<p><code>await res.json()</code> is typed <code>any</code> (strictly, <code>Promise&lt;any&gt;</code>). Writing <code>as User[]</code> is an assertion, not a check. Two complementary tools: <b>generate types</b> from FastAPI's OpenAPI schema with <code>openapi-typescript</code> (Pydantic models become <code>components['schemas']['UserOut']</code>, endpoints become <code>paths['/api/users']['get']</code>), so compile-time types match the server; and <b>validate at runtime</b> with Zod at the boundary (<code>UserSchema.parse(json)</code>, <code>type User = z.infer&lt;typeof UserSchema&gt;</code>), so a deploy mismatch fails loudly at the fetch, not as <code>undefined is not a function</code> in a component three levels down.</p>
<h5><code>React.FC</code>, <code>JSX.Element</code>, <code>ReactElement</code>, <code>ReactNode</code></h5>
<ul class="pts">
<li><b><code>React.FC&lt;Props&gt;</code></b> types a function component via its variable. It's legal and since the React 18 types no longer adds an implicit <code>children</code>, but many teams prefer plain function declarations: they're simpler, work with generics (you can't make a <code>const X: FC&lt;Props&lt;T&gt;&gt;</code> generic), are hoisted, and show the props type right in the signature.</li>
<li><b><code>ReactNode</code></b>: anything renderable. Use for <code>children</code> and "slot" props.</li>
<li><b><code>ReactElement</code></b>: the object returned by JSX (<code>{ type, props, key }</code>). <b><code>JSX.Element</code></b> is <code>ReactElement&lt;any, any&gt;</code>. In the React 19 types the global <code>JSX</code> namespace was removed; use <code>React.JSX.Element</code> or <code>import type { JSX } from 'react'</code>. You rarely need to annotate component return types at all; let them infer.</li>
</ul>`,
      why: `<p>React's props are the API between components. In plain JavaScript that API is invisible: you learn a component takes <code>onSelect(id)</code> rather than <code>onSelect(user)</code> by reading its source or by a runtime crash. PropTypes (the pre-TypeScript solution) checked props at runtime in development only, couldn't describe function signatures or generics, and were deprecated, then removed for function components in React 19. In a large app, renaming a prop or changing a callback signature meant grep-and-pray across hundreds of files.</p>
<p>TypeScript moves that knowledge into the type system: every call site is checked, refactors are mechanical (rename symbol, follow the red), editors autocomplete props and event fields, and impossible states can be made unrepresentable with unions. For a FastAPI shop there's a bonus: the backend already has a precise schema (Pydantic models exported as OpenAPI), so the frontend can derive its API types instead of hand-writing and drifting from them.</p>
<p>What TypeScript does not solve is runtime data. Types are erased at build time; JSON from the network, <code>localStorage</code>, URL params and <code>postMessage</code> are <code>unknown</code> in reality no matter what you cast them to. That's why the modern pattern is "generated types for development, runtime validation at the boundary".</p>`,
      diagram: {
        html: flow([
          ["FastAPI + Pydantic", "UserOut, ProjectIn …", "w"],
          ["/openapi.json", "the contract", ""],
          ["openapi-typescript", "→ src/api/schema.d.ts", ""],
          ["API layer", "fetch + Zod parse at the boundary", "g"],
          ["Hooks", "useQuery&lt;User[]&gt;, useReducer&lt;State, Action&gt;", ""],
          ["Components", "typed props, events, refs, context", "g"]
        ]) + lanes([
          ["Compile time (tsc)", ["props and children", "event and element types", "generic components infer T", "discriminated unions narrow", "generated API types"]],
          ["Runtime (in the browser)", ["types are erased", "JSON is really unknown", "Zod parse validates shape", "errors surface at the fetch, not in render"]]
        ]),
        steps: [
          "FastAPI derives an OpenAPI document from your Pydantic models and route signatures. That document is the contract between backend and frontend.",
          "<code>openapi-typescript</code> converts it into TypeScript types. Regenerating in CI means any backend shape change becomes a compile error in the components that depend on it.",
          "At runtime, the API layer is the only place untyped data enters. It parses responses with Zod (or at least checks <code>res.ok</code> and narrows), so everything above it can trust its types.",
          "Hooks carry those types forward: <code>useQuery</code> infers <code>data</code> from the <code>queryFn</code>, reducers use discriminated-union actions, refs know their element type.",
          "Components declare props precisely (unions, generics, native element props). The left lane is everything <code>tsc</code> checks; the right lane is the reminder that none of it exists at runtime."
        ]
      },
      ex: [
        {
          t: "Typing props: aliases, optional props, defaults, unions and children",
          lang: "tsx",
          code: `import type { ReactNode } from 'react';

type Size = 'sm' | 'md' | 'lg';

type CardProps = {
  title: string;
  subtitle?: string;            // string | undefined inside the component
  size?: Size;                  // only these three values allowed
  footer?: ReactNode;           // a "slot": any renderable content
  children: ReactNode;          // required content
};

export function Card({ title, subtitle, size = 'md', footer, children }: CardProps) {
  return (
    <article className={\`card card-\${size}\`}>
      <header>
        <h2>{title}</h2>
        {subtitle && <p className="muted">{subtitle}</p>}
      </header>
      <div className="card-body">{children}</div>
      {footer !== undefined && <footer>{footer}</footer>}
    </article>
  );
}

// Usage
export function ProjectCard() {
  return (
    <Card title="Billing service" size="lg" footer={<a href="/projects/7">Open</a>}>
      <p>FastAPI · PostgreSQL · Redis</p>
    </Card>
  );
}

// <Card title="x" size="xl">…</Card>
//   error: Type '"xl"' is not assignable to type 'Size | undefined'.
// <Card title="x" />
//   error: Property 'children' is missing in type '{ title: string; }' …`,
          note: `<p><code>footer !== undefined</code> rather than <code>footer &amp;&amp;</code>: with <code>ReactNode</code> a caller could pass <code>0</code>, and <code>{0 &amp;&amp; …}</code> renders a stray "0". Notice there's no return type annotation; TypeScript infers it, which also keeps the React 19 vs 18 return-type differences out of your way.</p>`
        },
        {
          t: "Extending native element props: a Button and a TextField",
          lang: "tsx",
          code: `import { useId, type ComponentProps, type ComponentPropsWithoutRef } from 'react';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  loading = false,
  type = 'button',              // safer default than the native "submit"
  disabled,
  className,
  children,
  ...rest                       // onClick, aria-*, form, data-*, title …
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={['btn', \`btn-\${variant}\`, className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? 'Working…' : children}
    </button>
  );
}

// React 19: ref is a regular prop, and ComponentProps<'input'> includes it.
type TextFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, ...rest }: TextFieldProps) {
  const id = useId();
  const errorId = \`\${id}-error\`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}               // includes ref in React 19
      />
      {error && <p id={errorId} className="error">{error}</p>}
    </div>
  );
}

// Usage: every native prop is available and type-checked
// <Button variant="danger" onClick={() => deleteProject(7)} aria-label="Delete project">Delete</Button>
// <TextField label="Email" type="email" autoComplete="username" ref={emailRef} />`,
          note: `<p>In React 18, a function component can't receive <code>ref</code> as a prop; you'd wrap <code>TextField</code> in <code>forwardRef&lt;HTMLInputElement, TextFieldProps&gt;</code>. In React 19 that's no longer needed and <code>forwardRef</code> is expected to be deprecated in a future version; check your installed <code>@types/react</code> major version matches your React major, because the ref typing differs. Put <code>{...rest}</code> before props you must control (<code>type</code>, <code>disabled</code>) so callers can't silently override them, or after props you want overridable.</p>`
        },
        {
          t: "Event and handler types",
          lang: "tsx",
          code: `import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

type Sort = 'name' | 'created_at';

type SearchBarProps = {
  onSearch: (query: string, sort: Sort) => void;
  onClear?: () => void;
};

export function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('name');

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);              // target is HTMLInputElement for ChangeEvent
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setQuery('');
      onClear?.();
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSearch(query.trim(), sort);
  }

  function handleClearClick(e: MouseEvent<HTMLButtonElement>) {
    e.currentTarget.blur();                // currentTarget is typed as the button
    setQuery('');
    onClear?.();
  }

  return (
    <form role="search" onSubmit={handleSubmit}>
      <input aria-label="Search users" value={query} onChange={handleChange} onKeyDown={handleKeyDown} />
      {/* inline handlers are inferred from context: e is ChangeEvent<HTMLSelectElement> */}
      <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
        <option value="name">Name</option>
        <option value="created_at">Newest</option>
      </select>
      <button type="button" onClick={handleClearClick}>Clear</button>
      <button type="submit">Search</button>
    </form>
  );
}`,
          note: `<p>Every event type is imported from <code>react</code> with <code>type</code>: the Vite template enables <code>verbatimModuleSyntax</code>, so type-only imports must be marked. Without the import, <code>MouseEvent</code> would silently resolve to the DOM's global <code>MouseEvent</code>, which isn't generic and lacks React's synthetic fields. <code>e.target.value as Sort</code> is a reasonable assertion here only because the options are hard-coded; for anything user-controlled, validate instead.</p>`
        },
        {
          t: "Typing useState, useReducer and useRef",
          lang: "tsx",
          code: `import { useEffect, useReducer, useRef, useState } from 'react';

type User = { id: number; name: string };

// useState: give the type when the initial value is narrower than the real one
function useSelection() {
  const [selected, setSelected] = useState<User | null>(null);
  const [tags, setTags] = useState<string[]>([]);   // without <string[]> this is never[]
  return { selected, setSelected, tags, setTags };
}

// useReducer: discriminated-union state and actions
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; users: User[] }
  | { status: 'error'; message: string };

type Action =
  | { type: 'fetch' }
  | { type: 'resolved'; users: User[] }
  | { type: 'rejected'; message: string };

function assertNever(x: never): never {
  throw new Error('Unhandled action: ' + JSON.stringify(x));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'fetch':
      return { status: 'loading' };
    case 'resolved':
      return { status: 'success', users: action.users };   // action narrowed
    case 'rejected':
      return { status: 'error', message: action.message };
    default:
      return assertNever(action);   // adding an Action member without a case is a compile error
  }
}

export function UsersPanel() {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' });
  const { selected } = useSelection();

  // DOM ref: starts null, React fills it after commit
  const searchRef = useRef<HTMLInputElement>(null);
  // Mutable value ref: holds a timer id across renders
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    searchRef.current?.focus();                 // current is HTMLInputElement | null
    pollRef.current = window.setInterval(() => dispatch({ type: 'fetch' }), 30_000);
    return () => {
      if (pollRef.current !== null) window.clearInterval(pollRef.current);
    };
  }, []);

  return (
    <section>
      <input ref={searchRef} aria-label="Search" />
      {state.status === 'success' && <p>{state.users.length} users</p>}
      {state.status === 'error' && <p role="alert">{state.message}</p>}
      {selected && <p>Selected: {selected.name}</p>}
    </section>
  );
}`,
          note: `<p><code>state.users</code> is only accessible after checking <code>state.status === 'success'</code>; TypeScript won't let you read data in the error state. <code>window.setInterval</code> (not bare <code>setInterval</code>) returns <code>number</code>; if <code>@types/node</code> is visible to this file, bare <code>setInterval</code> resolves to Node's overload returning <code>NodeJS.Timeout</code>, a classic surprise. <code>ReturnType&lt;typeof setInterval&gt;</code> sidesteps it.</p>`
        },
        {
          t: "Typing context with a non-null hook",
          lang: "tsx",
          code: `import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type AuthUser = { id: number; email: string; roles: Array<'viewer' | 'editor' | 'admin'> };

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async login(email, password) {                     // parameter types come from AuthContextValue
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',                        // FastAPI sets an httpOnly cookie
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Invalid email or password');
        setUser((await res.json()) as AuthUser);         // better: validate with Zod (see below)
      },
      async logout() {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        setUser(null);
      },
    }),
    [user],
  );

  // React 19: <AuthContext> works as a provider; in React 18 use <AuthContext.Provider>
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;                                            // narrowed to AuthContextValue
}

// Consumers never deal with null:
// const { user, logout } = useAuth();`,
          note: `<p>The <code>null</code> default plus a throwing hook turns "forgot the provider" from a mysterious <code>Cannot read properties of undefined</code> into an immediate, named error, and consumers get a non-nullable type. Avoid <code>createContext({} as AuthContextValue)</code>: it compiles, and then <code>login</code> is <code>undefined</code> at runtime outside the provider. Day 6 covers context design; here we only care about its types.</p>`
        },
        {
          t: "Generic components: List&lt;T&gt; and Select&lt;T&gt;",
          lang: "tsx",
          code: `import { useId, useState, type Key, type ReactNode } from 'react';

type ListProps<T> = {
  items: readonly T[];
  getKey: (item: T) => Key;
  renderItem: (item: T) => ReactNode;
  empty?: ReactNode;
};

export function List<T>({ items, getKey, renderItem, empty = <p>Nothing here yet.</p> }: ListProps<T>) {
  if (items.length === 0) return <>{empty}</>;
  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;
}

type SelectProps<T> = {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getKey: (option: T) => string | number;
};

export function Select<T>({ label, options, value, onChange, getLabel, getKey }: SelectProps<T>) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value === null ? '' : String(getKey(value))}
        onChange={(e) => {
          const next = options.find((o) => String(getKey(o)) === e.target.value);
          if (next !== undefined) onChange(next);   // hands back a T, not a string
        }}
      >
        <option value="" disabled>Choose…</option>
        {options.map((o) => (
          <option key={getKey(o)} value={String(getKey(o))}>{getLabel(o)}</option>
        ))}
      </select>
    </div>
  );
}

// Usage: T is inferred as Project / Owner from the props
type Project = { id: number; name: string; ownerId: number };
type Owner = { id: number; name: string };

export function ProjectPicker({ projects, owners }: { projects: Project[]; owners: Owner[] }) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const visible = owner ? projects.filter((p) => p.ownerId === owner.id) : projects;
  return (
    <>
      <Select label="Owner" options={owners} value={owner} onChange={setOwner}
              getLabel={(o) => o.name} getKey={(o) => o.id} />
      <List items={visible} getKey={(p) => p.id} renderItem={(p) => p.name} />
      {/* renderItem={(p) => p.title}  error: Property 'title' does not exist on type 'Project' */}
    </>
  );
}

// Arrow-function form in a .tsx file needs the trailing comma:
// export const Chips = <T,>({ items }: { items: readonly T[] }) => <span>{items.length}</span>;`,
          note: `<p>Inside <code>Select</code>, the component knows nothing about <code>T</code>, so it can only use the accessor functions it was given; that's what makes it reusable. <code>readonly T[]</code> lets callers pass both mutable arrays and <code>as const</code> tuples. <code>React.memo</code> and <code>forwardRef</code> lose the generic parameter of a wrapped component; the usual workaround is a type assertion on the result (<code>as typeof List</code>), another reason React 19's ref-as-prop is welcome.</p>`
        },
        {
          t: "Discriminated union props: variant-dependent props",
          lang: "tsx",
          code: `import type { ReactNode } from 'react';

type LinkAction = {
  kind: 'link';
  href: string;
  external?: boolean;
  onClick?: never;            // explicitly forbidden in this branch
};

type ButtonAction = {
  kind: 'button';
  onClick: () => void;
  disabled?: boolean;
  href?: never;
};

type ActionProps = (LinkAction | ButtonAction) & { children: ReactNode };

export function Action(props: ActionProps) {
  if (props.kind === 'link') {
    // props is LinkAction & { children } here
    return (
      <a href={props.href}
         target={props.external ? '_blank' : undefined}
         rel={props.external ? 'noreferrer' : undefined}>
        {props.children}
      </a>
    );
  }
  // props is ButtonAction & { children } here
  return (
    <button type="button" onClick={props.onClick} disabled={props.disabled}>
      {props.children}
    </button>
  );
}

// Valid
// <Action kind="link" href="/docs">Docs</Action>
// <Action kind="button" onClick={() => refetch()}>Retry</Action>

// Compile errors
// <Action kind="link">Docs</Action>                        // href is missing
// <Action kind="button" href="/x" onClick={save}>Save</Action> // href not allowed on a button

// A second common shape: a dialog whose confirm props only exist in "confirm" mode
type DialogProps =
  | { mode: 'info'; title: string; onClose: () => void }
  | { mode: 'confirm'; title: string; onClose: () => void; onConfirm: () => Promise<void>; confirmLabel: string };`,
          note: `<p>Notice we don't destructure the props in the signature. If you write <code>function Action({ kind, href, onClick }: ActionProps)</code>, <code>href</code> is a property that doesn't exist on every member, so destructuring it is an error, and even with <code>?: never</code> padding the extracted variables don't narrow as reliably as <code>props.x</code>. Narrow first, then destructure inside the branch. TypeScript does narrow destructured discriminants in simple <code>const</code> cases, but the <code>props.kind</code> style is clearer and robust.</p>`
        },
        {
          t: "as const and satisfies: one source of truth for values and types",
          lang: "ts",
          code: `// Roles: runtime array and type union from one declaration
export const ROLES = ['viewer', 'editor', 'admin'] as const;
export type Role = (typeof ROLES)[number];          // 'viewer' | 'editor' | 'admin'

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

// satisfies: checked against the type, but the precise type is kept
type Variant = 'primary' | 'secondary' | 'danger';

export const variantClass = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-100 text-gray-900',
  danger: 'bg-red-600 text-white',
} satisfies Record<Variant, string>;
// Missing 'danger' or a typo like 'primay' is a compile error,
// and variantClass.primary is still known to exist (no undefined in the type).

export const routes = {
  home: '/',
  projects: '/projects',
  project: '/projects/:projectId',
} as const satisfies Record<string, \`/\${string}\`>;
// routes.project has the literal type '/projects/:projectId'
// Adding { settings: 'settings' } (no leading slash) fails to compile.

// TanStack Query key factory with readonly tuple keys
const userKeysAll = ['users'] as const;
export const userKeys = {
  all: userKeysAll,
  list: (filters: { role?: Role; page: number }) => [...userKeysAll, 'list', filters] as const,
  detail: (id: number) => [...userKeysAll, 'detail', id] as const,
};
// userKeys.detail(7) has type readonly ['users', 'detail', number]

// A tuple-returning custom hook needs as const too
export function useToggle(initial = false) {
  let value = initial;
  const toggle = () => { value = !value; };
  return [value, toggle] as const;   // readonly [boolean, () => void], not (boolean | (() => void))[]
}`,
          note: `<p>The <code>useToggle</code> body is deliberately simplified to show the return type only; a real one uses <code>useState</code>. The point is the inference: without <code>as const</code>, destructuring <code>const [on, toggle] = useToggle()</code> gives both variables the union type and calling <code>toggle()</code> is an error. <code>satisfies</code> needs TypeScript 4.9 or newer, which every current Vite template ships.</p>`
        },
        {
          t: "Typing API responses from FastAPI: generated types and Zod at the boundary",
          lang: "ts",
          code: `// 1) Generated from FastAPI's /openapi.json:
//    npx openapi-typescript ./openapi.json -o src/api/schema.d.ts
import type { components, paths } from './schema';

export type UserOut = components['schemas']['UserOut'];
type ListUsersResponse =
  paths['/api/users']['get']['responses'][200]['content']['application/json'];

// 2) Runtime validation with Zod (npm install zod)
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  full_name: z.string().nullable(),            // Pydantic: full_name: str | None
  role: z.enum(['viewer', 'editor', 'admin']),
  created_at: z.string(),                      // ISO datetime string in JSON
});
export type User = z.infer<typeof UserSchema>;

const UsersPageSchema = z.object({
  items: z.array(UserSchema),
  total: z.number().int(),
  page: z.number().int(),
});
export type UsersPage = z.infer<typeof UsersPageSchema>;

// Optional: a compile-time guard that the Zod schema and the OpenAPI type agree
type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export const usersPageMatchesSchema: Equals<UsersPage, ListUsersResponse> = true;

export async function fetchUsers(page: number): Promise<UsersPage> {
  const res = await fetch(\`/api/users?page=\${page}\`, { credentials: 'include' });
  if (!res.ok) throw new Error(\`GET /api/users failed with \${res.status}\`);
  const json: unknown = await res.json();
  const parsed = UsersPageSchema.safeParse(json);
  if (!parsed.success) {
    // report to Sentry etc. with parsed.error.issues; this is a contract violation
    throw new Error('Unexpected response shape from /api/users');
  }
  return parsed.data;
}

// In a component: data is UsersPage, inferred all the way through TanStack Query
// const { data } = useQuery({ queryKey: ['users', page], queryFn: () => fetchUsers(page) });`,
          note: `<p>The generated <code>paths</code>/<code>components</code> names depend on your FastAPI routes and Pydantic model names (FastAPI may name schemas like <code>UserOut</code> or <code>Page_UserOut_</code> for generics); open <code>schema.d.ts</code> to see yours. The <code>Equals</code> guard fails compilation if the hand-written Zod schema drifts from the generated type; tools also exist that generate Zod schemas from OpenAPI directly. Libraries like <code>openapi-fetch</code> build a fully typed client from the same <code>paths</code> type, if you'd rather not write fetch wrappers. Parsing every large list response has a CPU cost; many teams validate in development and staging and sample in production.</p>`
        },
        {
          t: "React.FC vs function declarations, and ReactNode vs ReactElement vs JSX.Element",
          lang: "tsx",
          code: `import { cloneElement, type FC, type JSX, type ReactElement, type ReactNode } from 'react';

// Works, but common team guidance is to prefer plain functions:
export const BadgeFC: FC<{ label: string }> = ({ label }) => <span className="badge">{label}</span>;

// Preferred: plain function, props visible in the signature, can be generic
export function Badge({ label }: { label: string }) {
  return <span className="badge">{label}</span>;
}

// ReactNode: anything renderable (children, slots)
type PanelProps = { header: ReactNode; children: ReactNode };
export function Panel({ header, children }: PanelProps) {
  return <section><header>{header}</header>{children}</section>;
}

// ReactElement: when you need an actual element object (e.g. to clone it)
type TooltipProps = { text: string; children: ReactElement<{ 'aria-describedby'?: string }> };
export function Tooltip({ text, children }: TooltipProps) {
  const id = 'tip-' + text.length;     // simplified; use useId() in real code
  return (
    <>
      {cloneElement(children, { 'aria-describedby': id })}
      <span role="tooltip" id={id}>{text}</span>
    </>
  );
}

// JSX.Element: the type of a JSX expression. React 19 types removed the
// global JSX namespace, so import it from 'react' (or write React.JSX.Element).
export function renderEmptyState(): JSX.Element {
  return <p>No projects yet.</p>;
}

// <Panel header="Settings">…</Panel>       ok: a string is a ReactNode
// <Tooltip text="Copy">Copy</Tooltip>      error: a string is not a ReactElement`,
          note: `<p>Rules of thumb: accept <code>ReactNode</code>, return whatever is inferred, and use <code>ReactElement</code> only for APIs that manipulate elements (<code>cloneElement</code> is itself a legacy-leaning API; Day 10 shows slot and render-prop alternatives). In React 19's types, <code>ReactElement</code>'s props default to <code>unknown</code> rather than <code>any</code>, so code that read <code>element.props.foo</code> without a type parameter may now fail to compile.</p>`
        }
      ],
      internals: `<p><b>How TypeScript checks JSX.</b> With <code>"jsx": "react-jsx"</code>, <code>&lt;Card title="x"&gt;…&lt;/Card&gt;</code> is checked as a call to <code>Card</code> with a props object <code>{ title: "x", children: … }</code>. For an intrinsic element like <code>&lt;button&gt;</code>, TypeScript looks up <code>JSX.IntrinsicElements['button']</code>, which <code>@types/react</code> defines as <code>DetailedHTMLProps&lt;ButtonHTMLAttributes&lt;HTMLButtonElement&gt;, HTMLButtonElement&gt;</code>; that's where <code>ComponentProps&lt;'button'&gt;</code> gets its answer. For components, it checks the first parameter's type; for generic components, it runs normal generic inference against the attributes, exactly like a function call. The <code>key</code> prop is handled specially (<code>JSX.IntrinsicAttributes</code>), which is why components never see <code>key</code> in props. Since TypeScript 5.1, the allowed component return types come from <code>JSX.ElementType</code>, which is what let the React types accept components returning strings, arrays or <code>undefined</code>.</p>
<p><b>Where the types live.</b> React itself ships no TypeScript declarations; <code>@types/react</code> (DefinitelyTyped) describes React's API, and its major version should match React's. The React 19 types introduced breaking changes: <code>useRef</code> requires an argument and all <code>RefObject</code>s are mutable (<code>MutableRefObject</code> is deprecated); the global <code>JSX</code> namespace was removed in favour of <code>React.JSX</code>; <code>ReactElement</code> props default to <code>unknown</code>; ref callbacks that implicitly return something are an error (because returning a function now means "cleanup"); and <code>propTypes</code>/<code>defaultProps</code> on function components are gone. A community codemod (<code>types-react-codemod</code>) automates most migrations. Treat the exact list as "check the React 19 upgrade guide for your version".</p>
<p><b>Erasure.</b> Vite's esbuild transform deletes types file by file without looking at other files, which is why <code>isolatedModules</code> is on and why the template enables <code>verbatimModuleSyntax</code> (type-only imports must say <code>import type</code>, so the transpiler knows to drop them) and, in recent templates, <code>erasableSyntaxOnly</code> (forbids TS features that emit runtime code: <code>enum</code>, <code>namespace</code> with values, constructor parameter properties). Use string-literal unions and <code>as const</code> objects instead of enums. Nothing of your types reaches the browser; React at runtime knows only the props object it receives.</p>
<p><b>Narrowing.</b> Discriminated unions work because TypeScript tracks control flow: after <code>if (props.kind === 'link')</code> the type of <code>props</code> in that block is the union member whose <code>kind</code> is the literal <code>'link'</code>. That requires the discriminant to be a <b>literal type</b>, which is why <code>as const</code> matters when building such objects outside JSX (a plain <code>{ kind: 'link' }</code> assigned to a <code>let</code> widens to <code>string</code>). The <code>never</code> trick for exhaustiveness relies on the same analysis: after all cases are handled, the remaining type is <code>never</code>, and anything else isn't assignable to it.</p>
<p><b>Generics and hooks.</b> <code>useState&lt;S&gt;(initial: S | (() =&gt; S))</code> infers <code>S</code> from the argument; <code>useQuery</code> infers <code>TData</code> from your <code>queryFn</code>'s return type, which is why typing the fetch function (or validating with Zod) types every consumer without annotations. <code>useContext(Ctx)</code> returns exactly the type parameter of <code>createContext</code>, including <code>| null</code> if you put it there; the throwing hook narrows it once for everyone.</p>`,
      prod: `<p><b>Configuration.</b> Production React + FastAPI teams run <code>"strict": true</code> plus <code>noUncheckedIndexedAccess</code> (array and record lookups become <code>T | undefined</code>, catching a real class of bugs) and the template's <code>noUnusedLocals</code>/<code>noUnusedParameters</code>. <code>tsc -b</code> runs in CI and in the build script; editors show errors live. Because Vite doesn't type-check during dev, some teams add <code>vite-plugin-checker</code> to surface type errors in the browser overlay.</p>
<p><b>The API layer is where types are won or lost.</b> The pattern that scales: FastAPI publishes <code>openapi.json</code>; the frontend generates <code>schema.d.ts</code> with <code>openapi-typescript</code> (committed, regenerated in CI with a diff check); a thin typed client (<code>openapi-fetch</code> or a hand-written wrapper) is the only code that calls <code>fetch</code>; Zod validates responses where data is critical or comes from less-trusted sources; TanStack Query hooks expose typed <code>data</code>; components never see <code>any</code>. Ban <code>any</code> via ESLint (<code>@typescript-eslint/no-explicit-any</code>) and review every <code>as</code> assertion: each is a place where you told the compiler to stop checking.</p>
<p><b>Design systems.</b> Shared components extend native props (<code>ComponentPropsWithoutRef&lt;'button'&gt;</code>), use unions for variants (driven by an <code>as const</code> token map checked with <code>satisfies</code>), discriminated unions where props depend on a mode, and generic data components (<code>Table&lt;T&gt;</code>, <code>Select&lt;T&gt;</code>, <code>Combobox&lt;T&gt;</code>). Polymorphic <code>as</code> props (<code>&lt;Text as="label" htmlFor="x"&gt;</code>) are possible but the types get heavy and slow the compiler; many libraries prefer an <code>asChild</code>/slot pattern instead.</p>
<p><b>What goes wrong at scale.</b></p>
<ul class="pts">
<li><b>Type-check time.</b> Very large unions (thousands of icon names), deeply recursive generics and huge generated schema types make the editor sluggish and <code>tsc</code> slow. Split into project references, avoid computing types from enormous literal objects, and measure with <code>tsc --extendedDiagnostics</code>.</li>
<li><b>Lying types.</b> <code>as User</code> on fetch results, <code>{} as Ctx</code> defaults, non-null assertions (<code>ref.current!</code>) sprinkled to silence errors. Each one is a runtime crash waiting for a backend change. Count them in code review like you'd count TODOs.</li>
<li><b>Drift between Pydantic and TS.</b> Hand-written interfaces go stale; a field FastAPI makes optional (<code>str | None</code>) arrives as <code>null</code> and a component calls <code>.toUpperCase()</code> on it. Generated types make <code>null</code> visible; Zod makes it fail at the boundary.</li>
<li><b>Upgrades.</b> A React major upgrade is usually also an <code>@types/react</code> major upgrade with its own breaking changes (React 19's ref and JSX namespace changes broke many libraries' types). Mismatched <code>@types/react</code> versions in a monorepo produce baffling "two different types with this name exist" errors; pin and dedupe them.</li>
<li><b>Dates and numbers from JSON.</b> FastAPI serialises <code>datetime</code> as ISO strings and <code>Decimal</code> often as strings. A TS type saying <code>Date</code> or <code>number</code> is wrong unless you transform; Zod's <code>z.coerce.date()</code> or a <code>transform</code> makes the conversion explicit.</li>
</ul>`,
      iq: [
        ["fresher", "How do you type a component's props, including <code>children</code>?", "<p>Declare a <code>type</code> (or <code>interface</code>) and annotate the parameter: <code>type CardProps = { title: string; size?: 'sm' | 'md'; children: ReactNode }</code>, then <code>function Card({ title, size = 'md', children }: CardProps)</code>. <code>ReactNode</code> covers everything renderable (elements, strings, numbers, null, arrays). Using <code>JSX.Element</code> for children is the tempting wrong choice: it rejects plain strings and <code>null</code>, so <code>&lt;Card&gt;Hello&lt;/Card&gt;</code> fails to compile.</p>"],
        ["fresher", "What's the type of an <code>onChange</code> handler for a text input?", "<p><code>(e: ChangeEvent&lt;HTMLInputElement&gt;) =&gt; void</code>, with <code>ChangeEvent</code> imported from <code>react</code>; <code>e.target.value</code> is a <code>string</code>. Or use the alias <code>ChangeEventHandler&lt;HTMLInputElement&gt;</code>. If the handler is inline in JSX you don't annotate it at all: the type is inferred from the <code>onChange</code> prop. A common mistake is using the DOM's global <code>Event</code> or <code>MouseEvent</code> types, which aren't React's synthetic event types.</p>"],
        ["mid", "Why does <code>const ref = useRef&lt;HTMLInputElement&gt;(null); ref.current.focus();</code> fail to compile, and what's the fix?", "<p><code>ref.current</code> is <code>HTMLInputElement | null</code>: it's <code>null</code> during the first render and after unmount, and only set after React commits. Under <code>strict</code>, calling <code>.focus()</code> on a possibly-null value is error TS18047 (\"'ref.current' is possibly 'null'\"). Use <code>ref.current?.focus()</code> or an explicit <code>if (ref.current)</code> check, inside an effect or handler (not during render). Writing <code>ref.current!.focus()</code> compiles but just moves the crash to runtime if the element is conditionally rendered.</p>"],
        ["mid", "How do you build a reusable <code>Button</code> that accepts all native button props plus a <code>variant</code>?", "<p><code>type ButtonProps = ComponentPropsWithoutRef&lt;'button'&gt; &amp; { variant?: 'primary' | 'danger' }</code>, destructure your own props and spread <code>...rest</code> onto the <code>&lt;button&gt;</code>. Callers get every native attribute (<code>type</code>, <code>aria-*</code>, <code>onClick</code>, <code>form</code>) with correct types. Use <code>Omit</code> when a custom prop name clashes with a native one. To accept a ref, React 19 lets you use <code>ComponentProps&lt;'button'&gt;</code> (which includes <code>ref</code>) and spread it; in React 18 you need <code>forwardRef</code>. Re-declaring <code>onClick</code>, <code>disabled</code>, etc. by hand is the tempting approach that inevitably misses attributes.</p>"],
        ["mid", "How do you type a context so consumers don't have to handle <code>null</code>?", "<p>Create it as <code>createContext&lt;Value | null&gt;(null)</code> and export a hook: <code>const ctx = useContext(Ctx); if (!ctx) throw new Error('useX must be used inside &lt;XProvider&gt;'); return ctx;</code>. The hook's return type is <code>Value</code>, and forgetting the provider fails immediately with a clear message. Defaulting with <code>{} as Value</code> type-checks but means consumers outside the provider get undefined functions at runtime, the opposite of what types are for.</p>"],
        ["senior", "When would you use a discriminated union for props, and how does it compare to many optional props?", "<p>When valid props depend on a mode: a link vs a button, an info vs confirm dialog, a controlled vs uncontrolled input. <code>{ kind: 'link'; href: string } | { kind: 'button'; onClick: () =&gt; void }</code> makes impossible combinations unrepresentable: TypeScript requires <code>href</code> for links, rejects it on buttons (add <code>href?: never</code> to forbid explicitly), and narrows inside the component after checking <code>props.kind</code>. A bag of optional props (<code>href?</code>, <code>onClick?</code>, <code>isLink?</code>) type-checks every nonsense combination and pushes the validation to runtime. Caveat: don't destructure non-shared props in the parameter list; narrow first.</p>"],
        ["senior", "What's the difference between <code>satisfies</code>, a type annotation, and <code>as</code>?", "<p>A type annotation (<code>const x: T = v</code>) checks <code>v</code> against <code>T</code> and then the variable <b>is</b> <code>T</code>, losing the more precise inferred type (literal keys, specific values). <code>as T</code> is an assertion: it tells the compiler to trust you, with only a weak sanity check, so it can hide real errors. <code>v satisfies T</code> checks <code>v</code> against <code>T</code> (missing or misspelled keys are errors) but keeps <code>v</code>'s own precise type. Ideal for config maps like <code>{ primary: '...', danger: '...' } satisfies Record&lt;Variant, string&gt;</code> and for <code>as const satisfies</code> route tables.</p>"],
        ["senior", "How do you type API responses from a FastAPI backend? Is <code>res.json() as User[]</code> enough?", "<p>No. <code>as</code> only silences the compiler; if the backend returns <code>{ items, total }</code> or a <code>null</code> field, the app crashes somewhere far from the cause. Generate compile-time types from FastAPI's OpenAPI schema with <code>openapi-typescript</code> (and regenerate in CI so drift breaks the build), and validate at runtime at the boundary with Zod: <code>UsersPageSchema.parse(await res.json())</code>, deriving the TS type with <code>z.infer</code>. Optionally add a compile-time equality check between the Zod-inferred type and the generated type. Everything above the API layer then works with trustworthy types.</p>"],
        ["lead", "Why do many teams avoid <code>React.FC</code>? Should we ban it?", "<p>Historically <code>FC</code> added an implicit <code>children</code> prop (removed in the React 18 types), interacted badly with <code>defaultProps</code>, and can't express generic components (<code>const List: FC&lt;ListProps&lt;T&gt;&gt;</code> has nowhere to declare <code>T</code>). Plain function declarations are simpler, hoisted, generic-friendly and show the props type at the definition. Today <code>FC</code> is harmless for non-generic components, so the real issue is consistency: pick one style in the lint config (the community leans towards plain functions) rather than litigating it in reviews. A hard ban with a codemod is fine if the team agrees; arguing that <code>FC</code> is \"wrong\" is overstated.</p>"],
        ["architect", "Design the type-safety story from PostgreSQL to the React UI for a FastAPI + React product. Where can it break?", "<p>Database schema (SQLAlchemy/Alembic) → Pydantic response models (the API's real contract, validated on the way out by FastAPI) → <code>openapi.json</code> published per service as a build artifact → generated TS types and a typed client in the frontend, regenerated in CI with breaking-change detection on the schema diff → runtime validation (Zod) at the frontend boundary for critical or third-party data → TanStack Query hooks inferring <code>data</code> → strictly typed components with no <code>any</code>. Break points: hand-written frontend types or <code>as</code> casts; Pydantic models that don't match what the ORM returns (FastAPI catches this as a 500, not a contract change); serialisation details types don't capture (datetimes as strings, Decimals as strings, <code>None</code> vs omitted); version skew between deployed frontend and backend (old bundles cached in browsers calling new APIs), which needs additive-only API evolution or versioning; and generic Pydantic models producing awkward schema names. Types give compile-time confidence within one deploy; runtime validation and compatible API evolution cover the gaps between deploys.</p>"]
      ],
      gotchas: [
        "<b><code>useState([])</code> is <code>never[]</code></b>: <code>setItems([user])</code> then fails with \"Type 'User' is not assignable to type 'never'\". Always pass the type for empty collections: <code>useState&lt;User[]&gt;([])</code>.",
        "<b>Generic arrows in <code>.tsx</code>:</b> <code>const List = &lt;T&gt;(props: Props&lt;T&gt;) =&gt; …</code> is parsed as a JSX tag. Write <code>&lt;T,&gt;</code>, <code>&lt;T extends unknown&gt;</code>, or use a function declaration.",
        "<b>React 18 vs 19 ref types:</b> with <code>@types/react</code> 18, <code>useRef&lt;number&gt;(null)</code> returns a read-only <code>RefObject</code>, so <code>ref.current = 5</code> errors (\"Cannot assign to 'current' because it is a read-only property\"); write <code>useRef&lt;number | null&gt;(null)</code>. React 19 types make refs mutable and make <code>useRef()</code> with no argument an error.",
        "<b><code>verbatimModuleSyntax</code> and <code>erasableSyntaxOnly</code></b> in recent Vite templates: type-only imports must use <code>import type</code> (or inline <code>type</code>), and enums, namespaces and constructor parameter properties are rejected. Use unions and <code>as const</code> objects.",
        "<b>Destructuring discriminated-union props</b> in the parameter list breaks narrowing or doesn't compile for props that only exist on some members. Keep <code>props</code> whole, narrow on the discriminant, then destructure.",
        "<b>The global <code>MouseEvent</code>/<code>KeyboardEvent</code></b> are DOM types. If you forget to import React's versions, handlers type-check against the wrong type, and <code>MouseEvent&lt;HTMLButtonElement&gt;</code> errors with \"Type 'MouseEvent' is not generic\".",
        "<b><code>setTimeout</code> return type</b> is <code>NodeJS.Timeout</code> when Node types leak into browser code. Use <code>window.setTimeout</code> or <code>ReturnType&lt;typeof setTimeout&gt;</code>.",
        "<b>Types don't exist at runtime:</b> a value typed <code>Date</code> from JSON is really a string; <code>number</code> fields from Python <code>Decimal</code> may be strings; FastAPI's <code>None</code> becomes <code>null</code>, not <code>undefined</code>. Generated types and Zod make this explicit."
      ],
      best: [
        "Turn on <code>strict</code> (plus <code>noUncheckedIndexedAccess</code> if you can) and run <code>tsc -b</code> in CI; treat type errors as build failures.",
        "Prefer plain function components with a named props type; let return types infer; accept <code>ReactNode</code> for content.",
        "Wrap native elements by extending <code>ComponentPropsWithoutRef&lt;'x'&gt;</code> / <code>ComponentProps&lt;'x'&gt;</code> and spreading the rest, instead of re-declaring native props.",
        "Model modes with discriminated unions, both for props and for reducer state/actions, with a <code>never</code> exhaustiveness check.",
        "Create contexts with <code>| null</code> and expose a throwing hook; never default with <code>{} as T</code>.",
        "Generate API types from FastAPI's OpenAPI, keep one typed API layer, validate untrusted data with Zod, and review every <code>as</code> and <code>!</code>.",
        "Use <code>as const</code> for value lists that also define types, and <code>satisfies</code> for config objects that must conform to a shape without losing precision."
      ],
      lab: [
        "In your Vite react-ts app, open <code>tsconfig.app.json</code>, confirm <code>strict</code> is on, and add <code>\"noUncheckedIndexedAccess\": true</code>. Run <code>npx tsc -b</code> and fix any new errors (each is a real <code>undefined</code> you weren't handling).",
        "Build <code>Button</code> (extending <code>ComponentPropsWithoutRef&lt;'button'&gt;</code>) and <code>TextField</code> (with <code>ComponentProps&lt;'input'&gt;</code> and a forwarded ref). In a form, focus the email field on mount with <code>useRef&lt;HTMLInputElement&gt;(null)</code>.",
        "Write a generic <code>Select&lt;T&gt;</code> and use it with two different object types; confirm that a wrong property in <code>getLabel</code> is a compile error and that <code>onChange</code> receives the object, not a string.",
        "Convert a component with optional props <code>href?</code> and <code>onClick?</code> into a discriminated union <code>Action</code>, and verify both invalid combinations fail to compile.",
        "Create an <code>AuthProvider</code> with <code>createContext&lt;AuthContextValue | null&gt;(null)</code> and a throwing <code>useAuth</code>; render a consumer outside the provider and read the error.",
        "Export FastAPI's <code>openapi.json</code>, generate <code>src/api/schema.d.ts</code> with <code>npx openapi-typescript</code>, write a Zod schema for one response, and add the <code>Equals</code> compile-time check between the two.",
        "<b>Done when:</b> <code>npx tsc -b</code> passes with zero <code>any</code> in your API layer; renaming a field in the Pydantic model and regenerating types produces compile errors in the components that use it; and a manually corrupted response (change the MSW handler from Part 1 to return a wrong shape) is rejected by Zod with a clear error rather than crashing during render."
      ],
      teach: `<p>"TypeScript in React is about making component APIs explicit and checked. Props are a type alias: required and optional fields, string-literal unions for things like size and variant, and <code>children</code> as <code>ReactNode</code>, which accepts anything React can render.</p>
<p>When I wrap a native element, like a design-system button, I extend <code>ComponentPropsWithoutRef&lt;'button'&gt;</code> and spread the rest, so callers get every native attribute for free. Events are React's generic types: <code>ChangeEvent&lt;HTMLInputElement&gt;</code>, <code>FormEvent&lt;HTMLFormElement&gt;</code>. Hooks mostly infer, but I give <code>useState</code> a type when the initial value is narrower, like <code>null</code> or an empty array, and DOM refs are <code>useRef&lt;HTMLInputElement&gt;(null)</code>, so <code>current</code> can be null and I use optional chaining.</p>
<p>For context I create it with <code>| null</code> and export a hook that throws if the provider is missing, so consumers get a non-null type. For reusable data components I write generics, like <code>Select&lt;T&gt;</code>, and TypeScript infers <code>T</code> from the options. When props depend on a mode, a link versus a button, I use a discriminated union so invalid combinations don't compile. <code>as const</code> and <code>satisfies</code> let one object be both a runtime value and a precise type.</p>
<p>The boundary matters most: types vanish at runtime, so I generate API types from FastAPI's OpenAPI schema and validate responses with Zod. And I'd avoid <code>React.FC</code> mostly for consistency and generics: plain functions are simpler."</p>`
    }
  ],
  quiz: [
    {
      q: `This test fails with "Unable to find an element with the text: Total: 42". The UI clearly shows "Total: 42". Why, and what's the fix?`,
      code: `function CartSummary({ total }: { total: number }) {
  return <p className="summary">Total: <strong>{total}</strong></p>;
}

it('shows the total', () => {
  render(<CartSummary total={42} />);
  expect(screen.getByText('Total: 42')).toBeInTheDocument();
});`,
      lang: "tsx",
      ans: `The text is split across two elements. Assert on the container's full text instead, e.g. <code>expect(screen.getByText(/total:/i)).toHaveTextContent('Total: 42')</code>.`,
      why: `<p><code>getByText</code>'s default matcher checks each element's <b>own</b> text nodes: the <code>&lt;p&gt;</code> has "Total: " (its child text node) and the <code>&lt;strong&gt;</code> has "42". No single element owns "Total: 42". <code>toHaveTextContent</code> uses <code>textContent</code>, which includes descendants. Alternatives: a function matcher <code>getByText((_, el) =&gt; el?.textContent === 'Total: 42' &amp;&amp; el.tagName === 'P')</code>, or give the summary an accessible handle (<code>role="status"</code>, <code>aria-label</code>) and query by role. Compare with <code>&lt;p&gt;Count: {count}&lt;/p&gt;</code>, which works: two text nodes in the <i>same</i> element are joined.</p>`
    },
    {
      q: `All tests pass, but in production the users page shows a blank screen with "data.map is not a function". The backend team recently added pagination. What went wrong with this test strategy?`,
      code: `vi.mock('../api/users', () => ({
  fetchUsers: vi.fn().mockResolvedValue([
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Alan' },
  ]),
}));

it('lists users', async () => {
  renderWithClient(<UsersPage />);
  expect(await screen.findByText('Ada')).toBeInTheDocument();
});`,
      lang: "tsx",
      ans: `The test mocks your own API module with a hand-written shape, so it never exercises the real contract. FastAPI now returns <code>{ items, total, page }</code>; the mock still returns an array.`,
      why: `<p>Mocking internal modules tests "if <code>fetchUsers</code> returned this, the page would render", which is true and useless. Fixes: mock the <b>network</b> with MSW so <code>fetchUsers</code>, parsing and error handling run for real; type MSW handlers with types generated from FastAPI's OpenAPI (<code>openapi-typescript</code>) and regenerate in CI, so the pagination change becomes a compile error in both the handler and the component; validate responses with Zod so a mismatch fails loudly at the boundary; keep a Playwright smoke test against the real backend. More unit tests with the same mock wouldn't help.</p>`
    },
    {
      q: `With <code>@types/react</code> 18 and <code>strict</code> on, this hook produces two type errors. What are they and how do you fix each?`,
      code: `function useAutoFocusAndPoll() {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number>(null);

  useEffect(() => {
    inputRef.current.focus();
    timerRef.current = window.setInterval(() => console.log('poll'), 5000);
    return () => window.clearInterval(timerRef.current ?? undefined);
  }, []);

  return inputRef;
}`,
      lang: "tsx",
      ans: `(1) <code>inputRef.current</code> is possibly <code>null</code>: use <code>inputRef.current?.focus()</code>. (2) <code>timerRef.current</code> is read-only: declare it as <code>useRef&lt;number | null&gt;(null)</code>.`,
      why: `<p>A DOM ref is <code>null</code> until React attaches it, so <code>current</code> is typed <code>HTMLInputElement | null</code> and calling a method needs a check. In the React 18 types, <code>useRef&lt;T&gt;(null)</code> where <code>T</code> doesn't include <code>null</code> picks the overload returning a read-only <code>RefObject&lt;T&gt;</code> (meant for DOM refs that React owns), so assigning <code>timerRef.current</code> fails with "Cannot assign to 'current' because it is a read-only property". Including <code>null</code> in the type parameter selects the <code>MutableRefObject</code> overload. In the React 19 types all refs are mutable, so error (2) disappears, but error (1) remains in both. Using <code>inputRef.current!.focus()</code> compiles but crashes if the input is conditionally rendered.</p>`
    },
    {
      q: `The error-state test times out after 1000 ms even though the MSW override returns a 500 immediately. The success test in the same file passes. Why?`,
      code: `const queryClient = new QueryClient();   // module level in test-utils.tsx

export function renderWithClient(ui: ReactElement) {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

it('shows an error on 500', async () => {
  server.use(http.get('*/api/users', () => HttpResponse.json({ detail: 'boom' }, { status: 500 })));
  renderWithClient(<UserList />);
  expect(await screen.findByRole('alert')).toBeInTheDocument();
});`,
      lang: "tsx",
      ans: `Two problems: TanStack Query's default <b>3 retries with backoff</b> keep the query pending for several seconds, and the <b>shared client</b> leaks cache between tests. Create a new <code>QueryClient</code> per test with <code>retry: false</code>.`,
      why: `<p>With default options the failed query is retried (delays of roughly 1 s, 2 s, 4 s) before <code>isError</code> becomes true, so <code>findByRole</code>'s 1000 ms timeout expires first. The module-level client is a second bug: if the success test ran first, the error test may render cached users from it and never even fetch, or vice versa, making results depend on order. A <code>renderWithClient</code> that builds <code>new QueryClient({ defaultOptions: { queries: { retry: false } } })</code> inside the function fixes both. Raising the <code>findBy</code> timeout to 10 seconds is the tempting wrong fix: slow tests, same order-dependence.</p>`
    },
    {
      q: `This generic component compiles in a <code>.ts</code> utility file, but when moved into <code>List.tsx</code> TypeScript reports "JSX element 'T' has no corresponding closing tag". What's happening?`,
      code: `export const List = <T>({ items, render }: { items: T[]; render: (item: T) => ReactNode }) => (
  <ul>{items.map((item, i) => <li key={i}>{render(item)}</li>)}</ul>
);`,
      lang: "tsx",
      ans: `In <code>.tsx</code>, <code>&lt;T&gt;</code> at the start of an arrow function is parsed as a JSX opening tag. Write <code>&lt;T,&gt;</code> or <code>&lt;T extends unknown&gt;</code>, or use <code>function List&lt;T&gt;(...)</code>.`,
      why: `<p>TSX has to disambiguate type parameters from JSX; a lone <code>&lt;T&gt;</code> looks like an element. The trailing comma (or an <code>extends</code> constraint) tells the parser it's a type parameter list. A function declaration avoids the issue entirely and is the more common style for generic components. Separately, the index as <code>key</code> is fine only for static lists; a <code>getKey</code> prop (as in today's <code>List&lt;T&gt;</code>) is better for lists that reorder.</p>`
    },
    {
      q: `A teammate's form test passes locally but logs "An update to SaveButton inside a test was not wrapped in act(...)" and occasionally fails in CI. Find the bug.`,
      code: `it('saves the project', async () => {
  const user = userEvent.setup();
  renderWithClient(<ProjectForm projectId={7} />);
  user.click(await screen.findByRole('button', { name: 'Save' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Saved');
});`,
      lang: "tsx",
      ans: `<code>user.click</code> isn't awaited. Write <code>await user.click(...)</code>.`,
      why: `<p>user-event v14 methods return promises. Without <code>await</code>, the click sequence runs concurrently with the next line, outside the act scope RTL's await would have provided, so React's state updates (button disabled, mutation started) happen "unwrapped" and the warning appears. It often still passes because <code>findByRole('status')</code> keeps polling, but timing differences on slower CI machines expose it. Wrapping the click in <code>act()</code> manually is the tempting wrong fix; awaiting is the right one. The <code>testing-library/await-async-events</code> ESLint rule catches this automatically.</p>`
    }
  ]
},
/* ===== Day 15 ===== */
{
  n: 15,
  title: "Architecture and interviews",
  goal: `<b>By the end of today</b> you can lay out a React codebase that a team of twenty can work in without stepping on each other, ship it as a cache-friendly nginx container behind the same reverse proxy as your FastAPI backend, and watch it in production with Sentry, flags and budgets. You can also walk into a frontend interview with a repeatable method for the machine-coding round, a framework for frontend system design, and crisp answers to the classic React questions.`,
  rev: [
    `<b>Structure by feature, not by file type:</b> <code>src/app</code> (bootstrap, providers, router), <code>src/features/&lt;name&gt;</code> (components, hooks, api, types, exposed through an <code>index.ts</code>), <code>src/shared</code> (ui kit, api client, lib). Imports flow <code>app → features → shared</code>, never backwards and never into another feature's internals; enforce it with ESLint, not code review.`,
    `<b>Typed API layer:</b> generate types from FastAPI's <code>/openapi.json</code> with <code>openapi-typescript</code>, call through one client (<code>openapi-fetch</code> or your own wrapper), and wrap calls in TanStack Query hooks per feature. Regenerate in CI and fail the build when the contract drifts.`,
    `<b>Build-time vs runtime config:</b> <code>import.meta.env.VITE_*</code> is string-replaced at build time and is public. For "build once, deploy everywhere", serve a <code>/config.js</code> (generated by the container at start) that sets <code>window.__APP_CONFIG__</code>, loaded before the bundle and never cached.`,
    `<b>Deploy:</b> multi-stage Dockerfile (node builds <code>dist/</code> → nginx serves it). nginx: <code>try_files $uri $uri/ /index.html</code> for SPA routes, <code>Cache-Control: immutable, max-age=1y</code> for hashed <code>/assets/</code> (with <code>=404</code> for misses), <code>no-cache</code> for <code>index.html</code>, <code>/api/</code> proxied to FastAPI so everything is same-origin (no CORS). Then Sentry with hidden source maps, feature flags, budgets, CSP.`,
    `<b>Interviews:</b> machine coding = clarify → state shape → components → happy path → edge cases (race, empty, error, slow) → a11y → tests. System design = requirements → component tree → data model/API → state and caching → performance → a11y/i18n → testing → deployment/monitoring. Always state the trade-off you chose and why.`
  ],
  topics: [
    {
      id: "d15-architecture",
      title: "Production architecture: structure, design systems, deployment and monitoring",
      lv: ["mid", "senior", "lead", "architect"],
      eli5: `<p>Think of a big hospital. If every doctor kept their tools wherever they liked, nobody could find anything and every new hire would spend a month learning where the bandages are. So hospitals are organised into <b>departments</b> (cardiology, radiology, emergency), each with its own rooms and staff, plus <b>shared services</b> everyone uses (the pharmacy, the lab, the lifts). A cardiologist can send a patient to radiology through the front desk, but they do not wander in and rearrange radiology's cupboards.</p>
<p>A large React app is the same. Each <b>feature</b> (orders, users, billing) is a department with its own components, hooks and API calls. The <b>shared</b> folder is the pharmacy: buttons, inputs, the HTTP client. Features talk to each other through a front desk (an <code>index.ts</code> that says what is public), never by reaching into each other's internals.</p>
<p>Then the hospital needs a building and utilities. For us that is the <b>deployment</b>: the app is built once into plain files, put into a small nginx "building", and placed behind the same front door as the FastAPI backend. Finally there are <b>monitors</b> on the walls (Sentry for errors, analytics for usage, budgets that beep when the bundle gets too fat) and <b>switches</b> (feature flags) that let you turn a new ward on for a few patients first.</p>`,
      what: `<p><b>Production architecture</b> for a React SPA is the set of decisions that let many people change the code safely and let the result run fast, observably and securely for real users. It has two halves: the <b>code architecture</b> (how the source is organised and what may depend on what) and the <b>delivery architecture</b> (how it is built, configured, served, cached, monitored and rolled out). Earlier days gave you the pieces (Day 7 TanStack Query, Day 8 routing and code splitting, Day 9 styling and accessibility, Day 11 performance, Day 14 testing and TypeScript); today is about assembling them.</p>
<h5>1. Feature-based folder structure</h5>
<p>Grouping by file type (<code>components/</code>, <code>hooks/</code>, <code>services/</code>) works for ten files and collapses at five hundred: every change touches four folders and nothing tells you what belongs together. <b>Group by feature</b> instead:</p>
<ul class="pts">
<li><code>src/app/</code>: the composition root. <code>main.tsx</code>, providers (QueryClient, auth, theme, flags), the router definition, global error boundary, global styles. Only this layer knows about every feature.</li>
<li><code>src/features/&lt;feature&gt;/</code>: one business capability: <code>components/</code>, <code>hooks/</code>, <code>api.ts</code> (query/mutation hooks), <code>types.ts</code>, <code>routes.tsx</code> (its route objects, lazily loaded), tests next to the code. An <code>index.ts</code> is its <b>public API</b>: the only file other code may import.</li>
<li><code>src/shared/</code>: things with no business knowledge. <code>shared/ui</code> (the design system or a wrapper around one), <code>shared/api</code> (the HTTP client and generated OpenAPI types), <code>shared/lib</code> (date formatting, <code>cn()</code>, hooks like <code>useDebouncedValue</code>), <code>shared/config</code>.</li>
<li><code>src/pages/</code> or route modules (optional): thin screens that compose several features. Many teams let <code>features/*/routes.tsx</code> play this role.</li>
</ul>
<p>Variants of this exist under names like <b>Feature-Sliced Design</b> (layers: app, pages, widgets, features, entities, shared) or "bulletproof-react". The names matter less than the rule they share.</p>
<h5>2. Boundaries and import rules</h5>
<ul class="pts">
<li><b>Dependencies point one way:</b> <code>app → pages → features → shared</code>. <code>shared</code> never imports a feature; a feature never imports <code>app</code>.</li>
<li><b>Features do not import each other's internals.</b> If <code>orders</code> needs a user avatar, it imports <code>UserAvatar</code> from <code>@/features/users</code> (the index), or the thing moves down to <code>shared</code>, or a page composes both. Cross-feature imports are where cycles and "change one thing, break three teams" come from.</li>
<li><b>Enforce mechanically:</b> ESLint <code>no-restricted-imports</code> patterns for the simple cases, <code>eslint-plugin-boundaries</code> or <code>dependency-cruiser</code> for layered rules and cycle detection. A rule in a wiki is a suggestion; a rule in CI is architecture.</li>
<li><b>Path alias</b> <code>@/</code> → <code>src/</code> (Vite <code>resolve.alias</code> plus <code>tsconfig</code> <code>paths</code>) so imports describe <i>what</i> you depend on rather than how many <code>../</code> it takes.</li>
<li>Be careful with barrel files (<code>index.ts</code> re-exporting everything): one per feature as a public API is good; giant barrels in <code>shared</code> slow down dev-server startup and test runs and can defeat tree-shaking when modules have side effects.</li>
</ul>
<h5>3. A typed API layer from FastAPI's OpenAPI</h5>
<p>FastAPI already publishes a precise contract at <code>/openapi.json</code>, derived from your Pydantic models. Do not hand-write <code>interface User</code> in TypeScript and hope it matches. Instead:</p>
<ul class="pts">
<li><b>Generate types</b>: <code>openapi-typescript</code> turns the schema into a <code>paths</code> type (every route, method, parameter, body and response) and a <code>components</code> type (every Pydantic schema). Pure types, zero runtime.</li>
<li><b>One client</b>: <code>openapi-fetch</code> (a tiny typed <code>fetch</code> wrapper built for those types) or your own <code>request()</code> function. The client owns base URL, credentials, auth header or cookie handling, JSON parsing, error normalisation and request IDs.</li>
<li><b>Per-feature hooks</b>: <code>features/users/api.ts</code> exports <code>useUser(id)</code>, <code>useUpdateUser()</code> built on TanStack Query (Day 7), with query keys defined in one factory. Components never call <code>fetch</code> directly.</li>
<li><b>Contract checks in CI</b>: regenerate the types from the backend's schema; if the diff is non-empty, the frontend and backend have drifted and <code>tsc</code> tells you exactly where. Alternatives: Orval or Hey API (<code>@hey-api/openapi-ts</code>) generate full clients and even TanStack Query hooks; the trade-off is more generated code you do not own.</li>
</ul>
<h5>4. Design systems and component libraries</h5>
<ul class="pts">
<li><b>Design tokens</b> (colour, spacing, radius, typography, motion) as CSS custom properties are the foundation; components consume tokens, never raw hex values (Day 9).</li>
<li><b>Build vs adopt</b>: a headless library (Radix UI, React Aria, Headless UI) gives you accessible behaviour (focus management, keyboard, ARIA) and you supply styles; shadcn/ui copies Radix-based components into your repo so you own them; a full kit (MUI, Mantine, Chakra, Ant Design) is fastest to start and hardest to make look like your brand. Writing an accessible combobox, date picker or menu from scratch is a multi-week project; buy the behaviour, own the look.</li>
<li><b>Storybook</b> is the workshop: each component rendered in isolation in every state (stories), with docs, controls, accessibility checks (the a11y addon runs axe), interaction tests, and visual regression (Chromatic or Playwright screenshots). Stories double as test fixtures.</li>
<li>The design system lives in <code>shared/ui</code> in a single app, or in its own package (<code>packages/ui</code>) when several apps share it, with semantic versioning and a changelog.</li>
</ul>
<h5>5. Monorepos (briefly)</h5>
<p>When you have several deployables that share code (a customer app, an admin app, a design system, a generated API client), a <b>monorepo</b> keeps them in one repository with one lockfile. <b>pnpm workspaces</b> link local packages (<code>"@acme/ui": "workspace:*"</code>); <b>Turborepo</b> (or Nx) runs tasks in dependency order, in parallel, and caches outputs locally or remotely so CI only rebuilds what changed. You get atomic cross-package changes and no "publish, bump, reinstall" loop. You pay with tooling complexity and the need for code-ownership rules. One app plus one backend does not need a monorepo; the FastAPI service and the React app can still live in one repo as two folders.</p>
<h5>6. Micro-frontends: when they are worth it</h5>
<p>A <b>micro-frontend</b> architecture splits the UI into separately built and <b>separately deployed</b> applications composed at runtime: by route (nginx sends <code>/billing</code> to another app), by iframe, by web components, or by <b>Module Federation</b> (a host loads JavaScript modules from remote builds at runtime and shares singletons like <code>react</code>; available for Vite through community plugins such as <code>@module-federation/vite</code>, for webpack and Rspack natively).</p>
<ul class="pts">
<li><b>Worth it when</b> the problem is organisational: many autonomous teams (think 5+ teams, 50+ engineers) on one product surface who are blocked by a shared release train, or a migration where a legacy app and a new app must coexist for a year.</li>
<li><b>Not worth it</b> for a single team, for "it might scale someday", or to mix frameworks for fun. Costs: duplicated dependencies and larger downloads, version skew between React copies (two Reacts means broken hooks and context), cross-app state and routing coordination, inconsistent UX, much harder local dev, testing and debugging.</li>
<li>The cheaper alternatives come first: a modular monolith with enforced boundaries, a monorepo with per-package ownership, and route-level code splitting. These give 80% of the independence at 10% of the cost.</li>
</ul>
<h5>7. Environment configuration: build time vs runtime</h5>
<ul class="pts">
<li><b>Build time</b>: Vite statically replaces <code>import.meta.env.VITE_*</code> (and <code>MODE</code>, <code>DEV</code>, <code>PROD</code>, <code>BASE_URL</code>) when bundling. The value is baked into the JS. Only variables prefixed with <code>VITE_</code> are exposed, and <b>everything exposed is public</b>: anyone can read it in DevTools. Never put secrets in a frontend env var.</li>
<li>Build-time config forces <b>one build per environment</b>, which breaks the "build once, promote the same artifact" principle: the image you tested in staging is not the image you run in production.</li>
<li><b>Runtime config</b>: the container generates <code>/config.js</code> at start from its environment variables (a script in nginx's <code>/docker-entrypoint.d/</code>, or nginx <code>sub_filter</code> injecting into <code>index.html</code>), which sets <code>window.__APP_CONFIG__</code>. <code>index.html</code> loads it with a classic <code>&lt;script&gt;</code> before the module bundle, and it is served with <code>no-store</code>. A typed <code>config.ts</code> merges it with defaults. Same image, different config per environment.</li>
<li>Rule of thumb: values that vary per deployment (API origin, Sentry DSN, environment name, analytics key) are runtime; values that are part of the code version (app version, commit SHA for Sentry releases) are build time.</li>
</ul>
<h5>8. Build and deploy</h5>
<ul class="pts">
<li><b>Multi-stage Dockerfile</b>: stage 1 <code>node</code> runs <code>npm ci</code> and <code>npm run build</code> (which runs <code>tsc -b &amp;&amp; vite build</code> in the Vite template); stage 2 <code>nginx:alpine</code> copies only <code>dist/</code>. Final image: about 20-50 MB, no Node, no source, no <code>node_modules</code>. The Docker course covers layers, caching, BuildKit and image hardening in depth.</li>
<li><b>nginx config</b>: SPA fallback (<code>try_files $uri $uri/ /index.html</code>) so a refresh on <code>/orders/42</code> serves the app instead of 404; long-lived <code>immutable</code> caching for content-hashed files in <code>/assets/</code>; <code>no-cache</code> for <code>index.html</code> so a new deploy is picked up on the next navigation; gzip (or brotli via a module, or pre-compressed files); security headers.</li>
<li><b>Same origin with FastAPI</b>: a reverse proxy (nginx itself, Traefik, Caddy, an ingress or a cloud load balancer) routes <code>/api/*</code> to FastAPI and everything else to the SPA. The browser sees one origin, so no CORS preflights, cookies just work with <code>SameSite=Lax</code>, and CSP <code>connect-src 'self'</code> covers the API.</li>
<li><b>CDN</b>: put static assets (or the whole SPA) on a CDN (CloudFront, Cloudflare, Fastly, or object storage plus CDN). Hashed assets cache at the edge forever; invalidate only <code>index.html</code> on deploy. Keep the previous release's assets available for a while so users with an old <code>index.html</code> open do not hit 404 on lazy chunks.</li>
</ul>
<h5>9. Operating it: monitoring, flags, analytics, budgets, security, i18n</h5>
<ul class="pts">
<li><b>Error monitoring</b> (Sentry, or Datadog RUM, Rollbar, Bugsnag): captures uncaught errors, unhandled rejections and React render errors with breadcrumbs, browser, release and user context. Upload <b>source maps</b> at build time (tagged with the release) and do not serve them publicly (<code>build.sourcemap: "hidden"</code>, then delete after upload). Use React 19's root error callbacks (<code>onCaughtError</code>, <code>onUncaughtError</code>, <code>onRecoverableError</code>) or Sentry's error boundary so nothing is swallowed. Propagate a trace header to FastAPI so a frontend error links to the backend span.</li>
<li><b>Feature flags</b>: decouple deploy from release. Ship code dark, enable for staff, then 5%, then everyone; kill-switch instantly without a redeploy. Evaluate on the server where possible (FastAPI returns flags for the current user); vendors include LaunchDarkly, Unleash, GrowthBook, Flagsmith, with OpenFeature as a vendor-neutral API. Flags are debt: each one gets an owner and a removal date.</li>
<li><b>Analytics</b>: a single typed <code>track(event, props)</code> facade so the vendor (PostHog, Amplitude, Segment, GA4) can change; respect consent; send page views from the router; never send PII you would not want leaked.</li>
<li><b>Performance budgets</b>: numbers that fail CI: initial JS (for example 170-200 KB gzip), LCP, INP and CLS targets (Day 11), number of requests. Tools: <code>size-limit</code>, Lighthouse CI, bundle visualisers, and real-user Web Vitals sent to analytics.</li>
<li><b>Security headers and CSP</b>: <code>Content-Security-Policy</code> (no <code>unsafe-inline</code> scripts, <code>connect-src</code> limited to self and your monitoring endpoint, <code>frame-ancestors 'none'</code>), <code>X-Content-Type-Options: nosniff</code>, <code>Referrer-Policy</code>, <code>Permissions-Policy</code>, HSTS at the TLS terminator. React escapes text by default; CSP is the safety net for the day someone adds <code>dangerouslySetInnerHTML</code> or a malicious dependency.</li>
<li><b>i18n</b>: if you will ever need more than one language, decide early: extract strings into message catalogues (react-i18next or FormatJS/<code>react-intl</code>), lazy-load locales per language, use <code>Intl.DateTimeFormat</code>/<code>Intl.NumberFormat</code>/<code>Intl.PluralRules</code> instead of string concatenation, and design layouts that survive 30% longer German text and right-to-left scripts (<code>dir="rtl"</code>, logical CSS properties).</li>
</ul>`,
      why: `<p>A React tutorial app has one developer, one environment and no users. A real product has the opposite: many developers changing code concurrently, several environments, thousands of browsers you do not control, and a backend contract that changes every sprint. Without deliberate architecture, the same failure modes appear in almost every company:</p>
<ul class="pts">
<li><b>The ball of mud</b>: everything imports everything; a change to a "shared" util breaks three screens; nobody can delete code because nobody knows who uses it; onboarding takes months.</li>
<li><b>Contract drift</b>: FastAPI renames <code>full_name</code> to <code>name</code>; the TypeScript interface still says <code>full_name</code>; the bug is found by a customer.</li>
<li><b>"Works on staging"</b>: the production build was a different build (different env vars baked in), so testing staging proved nothing.</li>
<li><b>Deploy-day breakage</b>: users get a stale <code>index.html</code> pointing at deleted chunks ("Failed to fetch dynamically imported module"), or a refresh on a deep link returns nginx's 404 page.</li>
<li><b>Flying blind</b>: errors happen only in Safari 16 on iOS and nobody knows until support tickets pile up; minified stack traces like <code>a.b is not a function at t (index-3f9a.js:1:48213)</code> are useless without source maps.</li>
<li><b>Slow creep</b>: every sprint adds 15 KB; nobody notices until LCP is 5 seconds on mid-range Android.</li>
</ul>
<p>Before this discipline existed, frontends were deployed by copying files to an FTP server and "monitoring" meant users emailing screenshots. The practices in this topic are the accumulated fixes for those failures; senior and architect interviews probe them because they distinguish someone who has shipped and operated an app from someone who has only built one.</p>`,
      diagram: {
        html: lanes([
          ["Code (src/)", ["<code>app/</code>: main.tsx, providers, router, error boundary", "<code>features/orders</code>, <code>features/users</code> … each with <code>index.ts</code> as public API", "<code>shared/ui</code> (design system), <code>shared/api</code> (client + generated OpenAPI types), <code>shared/lib</code>", "Imports: app → features → shared (ESLint-enforced)"]],
          ["Build (CI)", ["Generate API types from FastAPI <code>/openapi.json</code>; <code>tsc</code> fails on drift", "Lint, Vitest, Playwright, Storybook a11y", "<code>vite build</code> → hashed <code>dist/assets/*</code>; size budget check", "Upload hidden source maps to Sentry (release = git SHA)", "<code>docker build</code>: node stage → nginx stage"]],
          ["Run (prod)", ["Reverse proxy / CDN: <code>/api/*</code> → FastAPI, else → nginx SPA", "nginx: SPA fallback, immutable assets, no-cache index.html, CSP", "<code>/config.js</code> generated at container start", "FastAPI → Redis cache → PostgreSQL"]],
          ["Observe and release", ["Sentry errors + traces (frontend span → FastAPI span)", "Web Vitals and product analytics", "Feature flags: staff → 5% → 100%, kill switch", "Budgets and alerts in CI and dashboards"]]
        ]) + flow([["Browser", "https://app.example.com", "w"], ["Reverse proxy / CDN", "TLS, routing, edge cache", ""], ["nginx (SPA)", "static dist/, /config.js", "g"], ["FastAPI at /api", "uvicorn, JSON", "g"], ["Redis → PostgreSQL", "cache, data", ""]]),
        steps: [
          "Developers work inside a feature folder; ESLint rejects imports that cross feature internals or point upwards (shared → features).",
          "CI regenerates the TypeScript API types from FastAPI's OpenAPI schema, so a backend contract change becomes a compile error in exactly the components it affects.",
          "<code>vite build</code> emits content-hashed assets; the source maps are uploaded to Sentry and removed from the image; the size budget is checked.",
          "A multi-stage Dockerfile produces a small nginx image containing only <code>dist/</code>. The same image is promoted from staging to production; per-environment values come from <code>/config.js</code> generated at container start.",
          "In production, the reverse proxy sends <code>/api/*</code> to FastAPI and the rest to nginx, so the browser sees a single origin (no CORS). nginx serves <code>index.html</code> for unknown paths (client routing) and caches hashed assets for a year.",
          "Errors, traces, Web Vitals and product events stream back; feature flags let you release the new code to a fraction of users and turn it off without a deploy."
        ]
      },
      ex: [
        {
          t: "A feature-based folder structure",
          lang: "text",
          code: `src/
  app/
    main.tsx              # createRoot, Sentry init, providers
    providers.tsx         # QueryClientProvider, AuthProvider, FlagsProvider
    router.tsx            # createBrowserRouter: composes feature routes (lazy)
    RootErrorBoundary.tsx
  features/
    orders/
      index.ts            # PUBLIC API: export { ordersRoutes, OrderStatusBadge }
      routes.tsx          # route objects; pages loaded with lazy()
      api.ts              # orderKeys factory, useOrders(), useCreateOrder()
      types.ts            # derived from generated OpenAPI types
      components/
        OrdersTable.tsx
        OrdersTable.test.tsx
        OrderStatusBadge.tsx
      hooks/
        useOrderFilters.ts
    users/
      index.ts
      ...
  shared/
    ui/                   # Button, Input, Dialog, Combobox, tokens.css (+ *.stories.tsx)
    api/
      client.ts           # the one HTTP client
      schema.d.ts         # GENERATED from FastAPI /openapi.json; never edited by hand
      errors.ts
    lib/                  # cn(), formatMoney(), useDebouncedValue()
    config/
      config.ts           # typed runtime config (window.__APP_CONFIG__)
public/
  config.js               # dev defaults; replaced at container start in prod`,
          note: `<p>Read the tree as a dependency diagram: <code>app</code> knows every feature, a feature knows <code>shared</code>, <code>shared</code> knows nothing above it. Tests live next to the code they test. The generated schema lives in <code>shared/api</code> because every feature uses it. When you delete the <code>orders</code> feature you delete one folder and one line in the router; that is the test of a good structure.</p>`
        },
        {
          t: "Enforcing the boundaries with ESLint (flat config excerpt) and the @/ alias",
          lang: "js",
          code: `// eslint.config.js  (add these objects to the array your template already exports)
const boundaries = [
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            // allow "@/features/orders" (the index) but not "@/features/orders/components/X"
            group: ["@/features/*/*"],
            message: "Import a feature only through its public index: '@/features/<name>'.",
          },
          {
            group: ["../../*"],
            message: "Use the '@/...' alias instead of deep relative imports.",
          },
        ],
      }],
    },
  },
  {
    // shared/ is the bottom layer: it must not know about features or the app shell
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{ group: ["@/features/*", "@/features", "@/app/*"], message: "shared/ must not import from features/ or app/." }],
      }],
    },
  },
];

export default [/* ...the template's existing config objects..., */ ...boundaries];

// vite.config.ts:   resolve: { alias: { "@": path.resolve(__dirname, "src") } }
// tsconfig.app.json: "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["src/*"] } }`,
          note: `<p>The second config object for <code>src/shared/**</code> replaces the rule options from the first for those files (later flat-config objects win for the same rule), which is what you want. Inside a feature, use relative imports (<code>./components/OrdersTable</code>); the pattern only blocks the alias path into <i>another</i> feature's internals. For layered rules ("pages may import features, features may import entities…") and cycle detection, move up to <code>eslint-plugin-boundaries</code> or <code>dependency-cruiser</code>. In Vite configs that are ES modules, <code>__dirname</code> is not defined in plain Node ESM, but Vite's config loader provides it when it bundles the config; <code>fileURLToPath(new URL("./src", import.meta.url))</code> is the portable alternative.</p>`
        },
        {
          t: "A typed API layer generated from FastAPI's OpenAPI schema",
          lang: "ts",
          code: `// 1) Generate types (run against the dev server or a schema file exported in CI):
//    npm install openapi-fetch
//    npm install -D openapi-typescript
//    npx openapi-typescript http://localhost:8000/openapi.json -o src/shared/api/schema.d.ts
//    (add it as a script: "gen:api": "openapi-typescript ... -o src/shared/api/schema.d.ts")

// src/shared/api/client.ts
import createClient from "openapi-fetch";
import type { paths, components } from "./schema";
import { config } from "@/shared/config/config";

export const api = createClient<paths>({
  baseUrl: config.apiOrigin,     // "" or same origin in prod: FastAPI routes already start with /api
  credentials: "include",        // send the httpOnly session cookie (Day 8)
});

export type Schemas = components["schemas"];

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super("API error " + status);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// src/features/users/api.ts
import { queryOptions, useQuery } from "@tanstack/react-query";
import { api, ApiError, type Schemas } from "@/shared/api/client";

export type User = Schemas["UserOut"];          // the Pydantic model name on the FastAPI side

export const userKeys = {
  all: ["users"] as const,
  detail: (id: number) => [...userKeys.all, "detail", id] as const,
};

export function userQuery(id: number) {
  return queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: async ({ signal }) => {
      const { data, error, response } = await api.GET("/api/users/{user_id}", {
        params: { path: { user_id: id } },     // typo in "user_id" or a string id = compile error
        signal,
      });
      if (error !== undefined || data === undefined) throw new ApiError(response.status, error);
      return data;                              // typed as UserOut
    },
  });
}

export function useUser(id: number) {
  return useQuery(userQuery(id));
}`,
          note: `<p>The path string, the parameter names, the response shape and the error shape all come from FastAPI's schema. If the backend renames <code>UserOut.full_name</code>, regenerating <code>schema.d.ts</code> turns every <code>user.full_name</code> in the frontend into a red squiggle. Use <code>import type</code> for the generated file: it contains only types. Exposing <code>userQuery()</code> as <code>queryOptions</code> lets route loaders prefetch with <code>queryClient.ensureQueryData(userQuery(id))</code> (Day 8) and components read with <code>useQuery</code>. <code>ApiError</code> declares its fields explicitly rather than using constructor parameter properties, which recent Vite templates reject with <code>erasableSyntaxOnly</code>.</p>`
        },
        {
          t: "Build-time env vs runtime config (build once, deploy everywhere)",
          lang: "ts",
          code: `// src/vite-env.d.ts : build-time variables (baked into the bundle, PUBLIC)
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;   // set by CI: the git SHA, used as the Sentry release
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// src/shared/config/config.ts : runtime config (per deployment, still PUBLIC)
export type AppConfig = {
  apiOrigin: string;       // "" means same origin
  sentryDsn: string;       // "" disables Sentry
  environment: "development" | "staging" | "production";
  analyticsKey: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
  }
}

const defaults: AppConfig = {
  apiOrigin: "",
  sentryDsn: "",
  environment: "development",
  analyticsKey: "",
};

export const config: AppConfig = { ...defaults, ...window.__APP_CONFIG__ };
export const appVersion = import.meta.env.VITE_APP_VERSION ?? "dev";

/* index.html: load the runtime config BEFORE the module bundle
   <script src="/config.js"></script>
   <script type="module" src="/src/main.tsx"></script>

   public/config.js (dev default; overwritten in the container):
   window.__APP_CONFIG__ = { environment: "development" };
*/`,
          note: `<p>A classic (non-module) script executes before deferred module scripts, so <code>window.__APP_CONFIG__</code> is set by the time <code>config.ts</code> runs. Both mechanisms are <b>public</b>: they end up in the browser. Secrets (database URLs, API keys with write access, the Sentry auth token) belong in FastAPI or in CI, never in either file. The typed <code>config</code> object is the only place the rest of the app reads configuration, which also makes it trivial to stub in tests.</p>`
        },
        {
          t: "Generating /config.js when the nginx container starts",
          lang: "sh",
          code: `#!/bin/sh
# nginx/40-app-config.sh -> copied to /docker-entrypoint.d/ (must be executable)
# The official nginx image runs every executable *.sh in /docker-entrypoint.d/ before starting nginx.
set -eu

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = {
  apiOrigin: "\${API_ORIGIN:-}",
  sentryDsn: "\${SENTRY_DSN:-}",
  environment: "\${APP_ENV:-production}",
  analyticsKey: "\${ANALYTICS_KEY:-}"
};
EOF

echo "40-app-config.sh: wrote config.js for APP_ENV=\${APP_ENV:-production}"`,
          note: `<p>This is "window config injected by the web server". The same image runs in staging with <code>APP_ENV=staging</code> and in production with <code>APP_ENV=production</code>. An alternative is nginx <code>sub_filter</code> replacing a placeholder in <code>index.html</code>, but a separate file is easier to cache-control and to debug (open <code>/config.js</code> in the browser). If you use a non-root image such as <code>nginxinc/nginx-unprivileged</code>, make sure the html directory is writable by the nginx user, or write the file to another location and serve it with an <code>alias</code>.</p>`
        },
        {
          t: "Multi-stage Dockerfile: node builds, nginx serves",
          lang: "dockerfile",
          code: `# syntax=docker/dockerfile:1

# ---- stage 1: build the SPA ----
FROM node:22-alpine AS build
WORKDIR /app
# install deps first so this layer is cached until the lockfile changes
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_APP_VERSION=dev
ENV VITE_APP_VERSION=$VITE_APP_VERSION
# Vite template: "build": "tsc -b && vite build"  -> type errors fail the image build
RUN npm run build

# ---- stage 2: serve static files ----
FROM nginx:1.27-alpine AS runtime
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --chmod=755 nginx/40-app-config.sh /docker-entrypoint.d/40-app-config.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1`,
          out: `$ docker build --build-arg VITE_APP_VERSION=$(git rev-parse --short HEAD) -t acme/web:1.4.0 .
$ docker image ls acme/web
REPOSITORY   TAG     SIZE
acme/web     1.4.0   ~50MB    (nginx:alpine + your dist/; no node, no node_modules, no src)`,
          note: `<p>Add a <code>.dockerignore</code> with <code>node_modules</code>, <code>dist</code>, <code>.git</code> and <code>.env*</code> so the build context is small and local files never leak into the image. Upload source maps to Sentry inside the build stage (the auth token as a BuildKit secret, not an <code>ARG</code>), and make sure <code>*.map</code> files are deleted before <code>dist/</code> is copied. The Docker course covers BuildKit secrets, cache mounts (<code>--mount=type=cache,target=/root/.npm</code>), non-root images and scanning. Pin the base images to the versions you test with; the tags shown are examples.</p>`
        },
        {
          t: "nginx: SPA fallback, caching rules, /api proxy to FastAPI, security headers",
          lang: "text",
          code: `# nginx/security-headers.conf  (included in every location that sets add_header)
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.ingest.sentry.io; frame-ancestors 'none'; base-uri 'self'; object-src 'none'" always;

# nginx/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml;

  location = /healthz { access_log off; return 200 "ok"; }

  # Hashed build output (index-3f9a1c.js): cache forever. A MISSING chunk must be a real 404,
  # never index.html, or the browser tries to execute HTML as JavaScript.
  location /assets/ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    include /etc/nginx/snippets/security-headers.conf;
  }

  # Runtime config: never cached
  location = /config.js {
    add_header Cache-Control "no-store" always;
    include /etc/nginx/snippets/security-headers.conf;
  }

  # FastAPI behind the same origin (service "api" in Compose / Kubernetes)
  location /api/ {
    proxy_pass http://api:8000;          # no URI part: /api/users is forwarded as /api/users
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
  }

  # Everything else is a client-side route: serve the app shell, always revalidate it
  location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache" always;
    include /etc/nginx/snippets/security-headers.conf;
  }
}`,
          note: `<p>Three rules carry most of the value. <b>SPA fallback</b>: unknown paths return <code>index.html</code> so React Router can render <code>/orders/42</code> after a refresh. <b>Two cache classes</b>: hashed assets are immutable for a year; <code>index.html</code> is <code>no-cache</code> (the browser may store it but must revalidate, so a deploy is visible on the next load). <b>Same origin</b>: <code>/api/</code> goes to FastAPI. Two nginx traps are handled here: <code>add_header</code> in a <code>location</code> <i>replaces</i> all <code>add_header</code> directives inherited from <code>server</code> (hence the include in each location), and without <code>always</code> headers are not added to error responses. Adjust the CSP <code>connect-src</code> to your actual Sentry ingest host (or route Sentry through your own <code>/api</code> with its <code>tunnel</code> option). On the FastAPI side, run uvicorn with <code>--proxy-headers</code> and trusted <code>--forwarded-allow-ips</code> so it sees the real scheme and client IP.</p>`
        },
        {
          t: "Local production-like stack with Compose (reverse proxy in front of SPA and FastAPI)",
          lang: "yaml",
          code: `# compose.yaml : the nginx web container is also the reverse proxy for /api
services:
  web:
    build:
      context: ./frontend
      args:
        VITE_APP_VERSION: local
    ports:
      - "8080:80"
    environment:
      APP_ENV: staging
      SENTRY_DSN: ""
    depends_on:
      - api
  api:
    build: ./backend          # FastAPI: uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers
    environment:
      DATABASE_URL: postgresql+psycopg://app:app@db:5432/app
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis
  redis:
    image: redis:7-alpine
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:`,
          out: `$ docker compose up --build
$ curl -I http://localhost:8080/orders/42      -> 200, Cache-Control: no-cache (index.html)
$ curl -I http://localhost:8080/assets/index-3f9a1c.js  -> 200, Cache-Control: public, max-age=31536000, immutable
$ curl -I http://localhost:8080/assets/missing.js       -> 404
$ curl    http://localhost:8080/api/health              -> {"status":"ok"}  (from FastAPI)`,
          note: `<p>Only <code>web</code> publishes a port; <code>api</code>, <code>redis</code> and <code>db</code> are reachable only on the Compose network, by service name. In Kubernetes the same split is an Ingress with two paths; in a cloud setup it is a load balancer or CDN with path-based behaviours. Health checks, restart policies and <code>depends_on</code> conditions are covered in the Docker course.</p>`
        },
        {
          t: "Sentry: init, React 19 root error hooks, and hidden source maps",
          lang: "tsx",
          code: `// npm install @sentry/react
// npm install -D @sentry/vite-plugin   (and @types/node if your vite.config.ts uses process.env)

// src/app/main.tsx
import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { config, appVersion } from "@/shared/config/config";
import { App } from "./App";

if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.environment,
    release: appVersion,                       // must match the release used for the source-map upload
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,                     // sample 10% of page loads / navigations
    tracePropagationTargets: [/^\\/api\\//],     // add trace headers to same-origin /api calls only
    sendDefaultPii: false,
  });
}

createRoot(document.getElementById("root")!, {
  // React 19 root options; Sentry provides a handler factory for them
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/* vite.config.ts (excerpt)
import { sentryVitePlugin } from "@sentry/vite-plugin";
export default defineConfig({
  build: { sourcemap: "hidden" },          // .map files emitted, but no sourceMappingURL comment
  plugins: [
    react(),
    sentryVitePlugin({                      // keep it after the other plugins
      org: "acme",
      project: "web",
      authToken: process.env.SENTRY_AUTH_TOKEN,          // CI secret, never VITE_*
      release: { name: process.env.VITE_APP_VERSION },
      sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
    }),
  ],
});
*/`,
          note: `<p><code>tracePropagationTargets</code> limits trace headers to your own API, so third-party requests are not sent extra headers (which could also trigger CORS preflights). The root error options (<code>onUncaughtError</code>, <code>onCaughtError</code>, <code>onRecoverableError</code>) are React 19 additions to <code>createRoot</code>; <code>Sentry.reactErrorHandler()</code> exists in recent <code>@sentry/react</code> versions; check the Sentry React docs for your version, and use <code>Sentry.ErrorBoundary</code> around route trees for a fallback UI. <code>"hidden"</code> source maps plus delete-after-upload means Sentry can de-minify stack traces but the public cannot download your original source.</p>`
        },
        {
          t: "Feature flags from FastAPI, and a design-system Button with a Storybook story",
          lang: "tsx",
          code: `// src/shared/flags/flags.tsx : flags evaluated by FastAPI for the current user
import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

type Flags = Record<string, boolean>;
const FlagsContext = createContext<Flags>({});

export function FlagsProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({
    queryKey: ["flags"],
    queryFn: async (): Promise<Flags> => {
      const res = await fetch("/api/flags", { credentials: "include" });
      if (!res.ok) return {};                 // fail closed: unknown flag = off
      return (await res.json()) as Flags;
    },
    staleTime: 5 * 60_000,
  });
  // React 19: the context object itself is the provider
  return <FlagsContext value={data ?? {}}>{children}</FlagsContext>;
}

export function useFlag(name: string): boolean {
  return useContext(FlagsContext)[name] === true;
}

// usage in a feature
// const newCheckout = useFlag("new-checkout");
// return newCheckout ? <CheckoutV2 /> : <CheckoutV1 />;

// src/shared/ui/Button.tsx
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger";
export type ButtonProps = ComponentProps<"button"> & { variant?: Variant };

export function Button({ variant = "secondary", type = "button", className, ...rest }: ButtonProps) {
  const classes = ["btn", "btn-" + variant, className].filter(Boolean).join(" ");
  return <button type={type} className={classes} {...rest} />;
}

// src/shared/ui/Button.stories.tsx  (npx storybook@latest init)
import type { Meta, StoryObj } from "@storybook/react-vite";   // "@storybook/react" in older versions
import { Button } from "./Button";

const meta = {
  component: Button,
  args: { children: "Save changes" },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;
export const Primary: Story = { args: { variant: "primary" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete order" } };
export const Disabled: Story = { args: { disabled: true } };`,
          note: `<p>In a real file the stories live in their own module (shown together here for brevity). Evaluating flags on the server keeps targeting rules (user ids, percentages, plans) private and gives one consistent answer for frontend and API. Fail closed: when the flags request fails, new code stays off. The Storybook import path depends on the Storybook major version and framework package; <code>storybook init</code> sets it up for Vite. On React 18 write <code>&lt;FlagsContext.Provider value=…&gt;</code>.</p>`
        },
        {
          t: "Monorepo: pnpm workspaces + Turborepo, and a performance budget",
          lang: "yaml",
          code: `# pnpm-workspace.yaml
packages:
  - "apps/*"        # apps/web (customer SPA), apps/admin
  - "packages/*"    # packages/ui (design system), packages/api-client (generated), packages/eslint-config

# apps/web/package.json (excerpt, shown as YAML for brevity)
#   dependencies:
#     "@acme/ui": "workspace:*"
#     "@acme/api-client": "workspace:*"
#   size-limit:
#     - path: "dist/assets/*.js"
#       limit: "200 kB"            # gzip by default; CI fails when exceeded

# turbo.json (Turborepo 2 uses "tasks"; v1 called it "pipeline")
# {
#   "tasks": {
#     "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
#     "test":  { "dependsOn": ["^build"] },
#     "lint":  {},
#     "dev":   { "cache": false, "persistent": true }
#   }
# }

# commands
#   pnpm install                      # one lockfile for every package
#   pnpm turbo run build              # builds packages/ui before apps/web; cached on re-run
#   pnpm --filter @acme/web dev       # run one app
#   pnpm turbo run build --filter=...[origin/main]   # only what changed since main, plus dependents`,
          note: `<p><code>"^build"</code> means "build my dependencies first". Turborepo hashes inputs (files, env, lockfile) and replays cached outputs and logs on a hit, locally or from a remote cache, which is where CI time savings come from. Install <code>size-limit</code> and its preset (<code>@size-limit/file</code> or <code>@size-limit/preset-app</code>) to use the budget; Lighthouse CI covers LCP/INP/CLS-style budgets on a real page load.</p>`
        }
      ],
      internals: `<p><b>What <code>vite build</code> actually produces.</b> Vite (Rollup under the hood, with Rolldown arriving in newer versions) starts from <code>index.html</code>, follows imports, and emits <code>dist/index.html</code> plus <code>dist/assets/*.[hash].js|css</code>. The hash is derived from the file's content, so a file name changes if and only if its content changes. That is what makes <code>Cache-Control: immutable</code> safe: a given URL will never contain different bytes. Every dynamic <code>import()</code> (for example from <code>lazy()</code> routes, Day 8) becomes a separate chunk; Vite injects <code>modulepreload</code> hints for a chunk's dependencies. <code>import.meta.env.VITE_X</code> is replaced by a string literal during the build, which also lets the minifier delete dead branches like <code>if (import.meta.env.DEV)</code>.</p>
<p><b>Why a stale index.html breaks lazy routes.</b> <code>index.html</code> references <code>index-AAA.js</code>, which contains <code>import("./OrdersPage-BBB.js")</code>. After a deploy, the server has <code>OrdersPage-CCC.js</code>. A user who loaded the old app an hour ago clicks "Orders": the browser requests <code>OrdersPage-BBB.js</code>. If old assets were deleted, that is a 404 (or worse, your SPA fallback returns <code>index.html</code> with status 200 and the browser reports a MIME-type or syntax error). Fixes: keep previous releases' assets for days (CDN or object storage makes this free), return a real 404 under <code>/assets/</code>, and on a chunk-load error do a one-time full reload (Vite dispatches a <code>vite:preloadError</code> event on <code>window</code> you can listen to).</p>
<p><b>How config.js gets in before the app.</b> The browser parses <code>index.html</code>: a classic <code>&lt;script src="/config.js"&gt;</code> without <code>async</code>/<code>defer</code> blocks parsing until it runs; <code>&lt;script type="module"&gt;</code> is deferred by default and runs after parsing. So <code>window.__APP_CONFIG__</code> always exists when your modules evaluate. The nginx image's entrypoint (<code>/docker-entrypoint.sh</code>) runs executable scripts in <code>/docker-entrypoint.d/</code> in sort order, then <code>exec</code>s nginx, so the file is written once per container start.</p>
<p><b>How the OpenAPI types work.</b> <code>openapi-typescript</code> emits nested TypeScript types: <code>paths["/api/users/{user_id}"]["get"]["parameters"]["path"]</code>, <code>...["responses"][200]["content"]["application/json"]</code>. <code>openapi-fetch</code>'s <code>GET</code> is a generic function whose first argument is constrained to the keys of <code>paths</code> that have a <code>get</code>; TypeScript then infers the options and return type from that key. At runtime it is just <code>fetch</code> with path-parameter substitution and JSON parsing: a couple of kilobytes. All the safety is compile-time, which is why regenerating in CI matters.</p>
<p><b>How error monitoring sees React errors.</b> The SDK patches <code>window.onerror</code> and <code>onunhandledrejection</code>, wraps <code>fetch</code>/XHR, timers and event listeners for breadcrumbs. React itself catches render errors: if an error boundary catches it, React 19 calls the root's <code>onCaughtError</code>; if nothing catches it, React unmounts the root and calls <code>onUncaughtError</code>; errors React recovered from (for example a hydration mismatch that fell back to client rendering) go to <code>onRecoverableError</code>. In React 18 caught errors were re-reported through <code>console.error</code> and monitoring had to rely on boundaries. Stack frames arrive minified (<code>index-3f9a.js:1:48213</code>); Sentry looks up the uploaded source map for that release and file to recover the original file, line and function.</p>
<p><b>How Module Federation shares React.</b> Each remote build emits a small <code>remoteEntry.js</code> manifest. At runtime the host loads it, negotiates <code>shared</code> modules (by package name and semver range), and loads exposed modules on demand. React must be a <b>singleton</b>: if the host and a remote each load their own copy, hooks fail with "Invalid hook call" because the dispatcher lives in the module instance, and context created in one copy is invisible to the other.</p>`,
      prod: `<p><b>A realistic setup for the running example</b> (React SPA → FastAPI → Redis → PostgreSQL) at a company with three frontend teams:</p>
<ul class="pts">
<li>One repo per deployable or one monorepo with <code>apps/web</code>, <code>apps/admin</code>, <code>packages/ui</code>, <code>packages/api-client</code>, <code>services/api</code> (FastAPI). CODEOWNERS maps <code>features/billing/**</code> to the billing team.</li>
<li>CI on every PR: install (cached), <code>gen:api</code> from the PR's backend schema (or the deployed staging schema), <code>tsc</code>, ESLint (with boundary rules), Vitest, Storybook build plus a11y checks, Playwright smoke tests against a preview deployment, <code>size-limit</code>. Merge to main builds one image tagged with the git SHA.</li>
<li>Deploy: the same image goes to staging, then production, with environment-specific <code>/config.js</code>. Rollback is "run the previous tag". Because assets are hashed and the CDN keeps old ones, users mid-session keep working.</li>
<li>Release: risky changes behind flags, rolled out by percentage while watching Sentry error rate and Web Vitals for the flagged cohort. Error alerts route to the owning team based on the feature folder in the stack trace.</li>
</ul>
<p><b>What goes wrong at scale:</b></p>
<ul class="pts">
<li><b>The "shared" dumping ground</b>: <code>shared/</code> grows business logic ("shared/utils/orderHelpers.ts") because it is the only place everyone can import from. Rule: if it knows about orders, it lives in the orders feature.</li>
<li><b>Generated types not regenerated</b>: the schema file goes stale because generation is a manual step. Make it a CI check (generate, then <code>git diff --exit-code</code>).</li>
<li><b>Cache headers inverted</b>: <code>index.html</code> cached for a day by a CDN default means the deploy is invisible for a day; hashed assets with <code>no-cache</code> means every visit revalidates dozens of files. Check with <code>curl -I</code> after every infrastructure change.</li>
<li><b>Source maps public</b>: shipping <code>.map</code> files publishes your original source. Hidden maps plus upload plus delete.</li>
<li><b>CSP added late</b>: a strict CSP on an existing app breaks inline scripts, third-party widgets and styles. Start in <code>Content-Security-Policy-Report-Only</code> mode, collect reports, then enforce.</li>
<li><b>Flag sprawl</b>: two hundred flags, nobody knows which are permanent; combinations nobody tested. Track flags with owners and expiry; delete the losing branch after rollout.</li>
<li><b>Micro-frontends by fashion</b>: a team of eight splits into four micro-frontends, then spends a quarter on shared-dependency versioning and a design system that renders differently in each. Reverse the decision before it calcifies.</li>
<li><b>Monitoring noise</b>: browser extensions, bots and cancelled requests flood Sentry. Filter with <code>ignoreErrors</code>/<code>denyUrls</code>, sample traces, and treat <code>AbortError</code> as expected.</li>
</ul>`,
      iq: [
        ["mid", "How would you structure the folders of a large React application, and why?", `<p><b>By feature</b>: <code>app/</code> (bootstrap, providers, router), <code>features/&lt;name&gt;/</code> (components, hooks, api, types, tests, and an <code>index.ts</code> public API), <code>shared/</code> (design system, HTTP client, generic utilities). Dependencies flow one way: app → features → shared. Code that changes together lives together, a feature can be deleted or handed to another team as one folder, and boundaries can be enforced by lint rules.</p><p>The tempting answer "components/, hooks/, services/, utils/" (by type) is fine for small apps but scatters every feature across four folders and gives no rule about what may depend on what, so it degrades into a ball of mud.</p>`],
        ["mid", "What is the difference between build-time and runtime configuration in a Vite app? How do you deploy the same build to staging and production?", `<p><code>import.meta.env.VITE_*</code> values are replaced with literals at build time, so they are frozen into the bundle; changing them means rebuilding. To promote one artifact across environments, serve a small <code>/config.js</code> generated at container start from environment variables (or injected by nginx) that sets <code>window.__APP_CONFIG__</code>, load it before the bundle, never cache it, and read it through a typed config module.</p><p>Both are public. The wrong answer is "put secrets in <code>.env</code>": anything the browser receives can be read by the user.</p>`],
        ["mid", "Your SPA works locally, but after deploying behind nginx, refreshing /orders/42 gives a 404. Why, and what is the fix?", `<p>The browser requests <code>/orders/42</code> from the server; there is no such file, so nginx returns 404. Client-side routing only works once <code>index.html</code> and the JS have loaded. Fix: <code>try_files $uri $uri/ /index.html;</code> so unknown paths serve the app shell and React Router renders the route (and renders its own not-found UI for truly unknown routes).</p><p>Keep that fallback out of <code>/assets/</code> (use <code>try_files $uri =404</code>), otherwise a missing chunk is answered with HTML and the browser fails with a confusing MIME or syntax error. Switching to <code>HashRouter</code> is the tempting workaround but gives ugly URLs and loses server-side visibility of paths.</p>`],
        ["senior", "How do you cache a React SPA correctly at nginx or a CDN?", `<p>Two classes. <b>Hashed assets</b> (<code>/assets/index-3f9a.js</code>): <code>Cache-Control: public, max-age=31536000, immutable</code>, because the name changes whenever the content does. <b>Entry documents</b> (<code>index.html</code>, <code>/config.js</code>, service worker): <code>no-cache</code> or <code>no-store</code>, so clients revalidate and pick up a deploy on the next load. API responses are FastAPI's decision (usually <code>no-store</code> or short private caching with ETags).</p><p>Also keep old assets available after a deploy so open tabs can still lazy-load their chunks, and invalidate only <code>index.html</code> on the CDN. Caching <code>index.html</code> "for performance" is the classic mistake: it pins users to an old release.</p>`],
        ["senior", "How do you keep the frontend in sync with a FastAPI backend's types?", `<p>Treat FastAPI's OpenAPI schema as the contract: generate TypeScript types with <code>openapi-typescript</code> (or a full client with Orval/Hey API), call through a typed client such as <code>openapi-fetch</code>, and wrap calls in per-feature TanStack Query hooks. In CI, regenerate from the backend's schema and fail if the generated file differs or <code>tsc</code> fails. Keep runtime validation (Zod) for the boundaries where you do not control the server or the data is critical, since types alone do not check what actually arrives.</p><p>Hand-written interfaces are the tempting shortcut; they drift silently the first time someone renames a Pydantic field.</p>`],
        ["senior", "Explain a production Dockerfile for a React app and what nginx does in it.", `<p>Multi-stage: a <code>node</code> stage copies <code>package.json</code> and the lockfile, runs <code>npm ci</code> (cached layer), copies the source and runs the build (type-check plus <code>vite build</code>). A <code>nginx:alpine</code> stage copies only <code>dist/</code> and the nginx config. The final image has no Node, source or dev dependencies, so it is small and has a tiny attack surface. nginx serves static files with SPA fallback, correct cache headers, compression and security headers, exposes a health endpoint, and can proxy <code>/api</code> to FastAPI so the app is same-origin.</p><p>Running <code>vite preview</code> or <code>npm run dev</code> in production is the wrong answer: <code>preview</code> is documented as a local preview server, not a production server, and the dev server is not built for it at all.</p>`],
        ["senior", "How do you monitor errors in a production React app, and why do you need source maps?", `<p>An SDK such as Sentry captures global errors, unhandled rejections and React render errors (React 19's <code>onCaughtError</code>/<code>onUncaughtError</code> root options, or error boundaries) with breadcrumbs, release, environment and user context, plus performance traces linked to FastAPI through propagated trace headers. Production code is minified, so stack traces point to <code>index-3f9a.js:1:48213</code>; uploading source maps for the exact release lets the service show the original file and line. Generate maps as <code>hidden</code>, upload them in CI, and do not deploy them publicly.</p><p>Relying on <code>console.error</code> or users' bug reports is the tempting non-answer: most errors are never reported.</p>`],
        ["lead", "What are feature flags for, and what are their risks?", `<p>They separate <b>deploy</b> (code is in production) from <b>release</b> (users see it): trunk-based development with unfinished work hidden, staged rollouts by percentage or cohort, kill switches, A/B experiments, and per-customer entitlements. Evaluate on the server for consistency and privacy, fail closed, and log exposure for analysis.</p><p>Risks: combinatorial states nobody tested, stale flags becoming permanent complexity, flicker if flags load after first paint (load them before rendering the gated UI or render a neutral state), and security confusion: a client-side flag hides UI but does not protect data, so the API must enforce the same rule.</p>`],
        ["architect", "When would you choose micro-frontends, and when would you push back?", `<p>Choose them for organisational reasons: many autonomous teams on one product who need independent deploys and are blocked by a shared release train, or a long migration where old and new apps must coexist. Prefer route-level composition (each team owns whole URLs) over fine-grained widget composition, share a design system and a single React singleton, and define contracts for routing, auth and events.</p><p>Push back for one or two teams, or when the motivation is technology variety. The costs are real: duplicated dependencies, version skew (two Reacts break hooks and context), inconsistent UX, complex local dev and end-to-end testing. A modular monolith with enforced boundaries, or a monorepo with ownership and cached builds, usually solves the actual problem far more cheaply.</p>`],
        ["architect", "Design the delivery pipeline and runtime topology for a React + FastAPI product.", `<p>CI per PR: generate API types, type-check, lint (boundaries), unit and component tests, Storybook a11y, preview deployment with Playwright smoke tests, bundle budget. Main branch: build one immutable image per commit (frontend nginx image, backend image), upload hidden source maps tagged with the SHA, promote the same images through staging to production with runtime config. Topology: CDN or load balancer terminating TLS (HSTS) → path routing: <code>/api/*</code> to FastAPI replicas (uvicorn behind the proxy with proxy headers), everything else to the SPA (or straight from object storage); FastAPI uses Redis for cache, sessions and rate limits, PostgreSQL for data. Observability: Sentry/OpenTelemetry traces from browser to API to database, Web Vitals RUM, structured logs with request IDs. Release with flags; rollback by redeploying the previous tag; keep old assets for in-flight sessions.</p><p>The weak answer covers only "build and copy to a server"; the interviewer is listening for artifact promotion, cache strategy, same-origin routing, observability and rollback.</p>`],
        ["lead", "How do you enforce architectural rules across a team of twenty frontend developers?", `<p>Make the rules executable: ESLint boundaries (<code>no-restricted-imports</code>, <code>eslint-plugin-boundaries</code>), <code>dependency-cruiser</code> for cycles, TypeScript <code>strict</code>, CODEOWNERS for review routing, a generated API client, a shared ESLint/TS config package, PR templates and a short architecture decision record (ADR) for each significant choice. Use code review for judgment calls, not for rules a tool can check.</p><p>"We have a wiki page about it" is the tempting answer; wiki rules erode within months.</p>`]
      ],
      gotchas: [
        `<b><code>add_header</code> inheritance in nginx:</b> as soon as a <code>location</code> has any <code>add_header</code>, it inherits <i>none</i> from the <code>server</code> block. Adding <code>Cache-Control</code> to <code>/assets/</code> silently drops your CSP there unless you repeat it (an <code>include</code> snippet). Also add <code>always</code>, or headers are missing on 4xx/5xx responses.`,
        `<b>SPA fallback must not cover assets:</b> with <code>try_files $uri /index.html</code> on everything, a missing <code>/assets/chunk.js</code> returns HTML with status 200. The browser reports "Failed to load module script: expected a JavaScript module but the server responded with a MIME type of text/html" and Sentry gets a confusing error. Use <code>try_files $uri =404</code> under <code>/assets/</code>.`,
        `<b><code>VITE_</code> variables are public and frozen:</b> putting an API secret in <code>VITE_STRIPE_SECRET</code> publishes it. And changing an env var on the running container does nothing to <code>import.meta.env</code>: the value was replaced at build time.`,
        `<b>Entry-point scripts must be executable:</b> the nginx image's entrypoint ignores non-executable files in <code>/docker-entrypoint.d/</code> (it logs that it is ignoring them). Use <code>COPY --chmod=755</code> or <code>chmod +x</code>, and use LF line endings: a script saved with Windows CRLF fails with "not found" or <code>set: illegal option -</code>.`,
        `<b>proxy_pass trailing slash changes the path:</b> <code>location /api/ { proxy_pass http://api:8000; }</code> forwards <code>/api/users</code> unchanged; <code>proxy_pass http://api:8000/;</code> (with a URI) replaces the matched prefix and forwards <code>/users</code>. Pick one deliberately and match FastAPI's router prefix or <code>root_path</code>.`,
        `<b>A path alias needs two configs:</b> <code>@/</code> must be declared for Vite (<code>resolve.alias</code>) and for TypeScript (<code>paths</code>), and for Vitest it comes from the Vite config. Missing one gives "works in the editor, fails in the build" or the reverse. The <code>vite-tsconfig-paths</code> plugin reads <code>paths</code> for you.`,
        `<b>Two copies of React:</b> a linked local package (<code>npm link</code>, a workspace with its own <code>react</code> dependency, or a federated remote) that bundles its own React causes "Invalid hook call". Libraries declare <code>react</code> as a <code>peerDependency</code>; apps dedupe (<code>resolve.dedupe: ["react", "react-dom"]</code> in Vite) and federation marks it a singleton.`,
        `<b>Strict CSP and inline things:</b> <code>script-src 'self'</code> blocks inline <code>&lt;script&gt;</code> tags (so <code>config.js</code> must be a file, not inline), <code>javascript:</code> URLs and <code>eval</code>. Some CSS-in-JS libraries inject <code>&lt;style&gt;</code> tags and need <code>style-src 'unsafe-inline'</code> or nonces. Roll out with <code>Report-Only</code> first.`
      ],
      best: [
        `Organise by feature with a public <code>index.ts</code> per feature, and enforce import direction with ESLint in CI from day one; retrofitting boundaries onto a mature codebase is painful.`,
        `Generate API types from FastAPI's OpenAPI schema and make drift a CI failure; components never call <code>fetch</code> directly, they use per-feature query hooks.`,
        `Build once, promote the same image through environments; keep per-environment values in runtime config and secrets out of the frontend entirely.`,
        `Serve hashed assets as immutable for a year and <code>index.html</code>/<code>config.js</code> as no-cache; keep previous assets available after each deploy; put <code>/api</code> on the same origin.`,
        `Ship with error monitoring, hidden source maps tied to a release, real-user Web Vitals, and a bundle budget that fails CI; alert by owning team.`,
        `Use feature flags for risky changes with an owner and expiry per flag; enforce permissions on the API, not just by hiding UI.`,
        `Adopt accessible headless primitives for complex widgets, document every shared component in Storybook with a11y checks, and choose i18n early if you will need it.`,
        `Default to a modular monolith; reach for a monorepo when you have several deployables sharing code, and for micro-frontends only when team autonomy demands independent deploys.`
      ],
      lab: [
        `In your Vite app, create <code>src/app</code>, <code>src/features/users</code>, <code>src/shared/{ui,api,lib,config}</code>. Move existing code into them, add the <code>@/</code> alias in <code>vite.config.ts</code> and <code>tsconfig.app.json</code>, and give <code>features/users</code> an <code>index.ts</code> exporting only its routes and one component.`,
        `Add the two <code>no-restricted-imports</code> config objects. Deliberately import <code>@/features/users/components/UserCard</code> from another feature and confirm <code>npm run lint</code> fails with your message; fix it by importing from the index.`,
        `Run your FastAPI backend, then <code>npx openapi-typescript http://localhost:8000/openapi.json -o src/shared/api/schema.d.ts</code>. Build the <code>api</code> client and a <code>useUser(id)</code> hook. Rename a field in a Pydantic model, regenerate, and watch <code>tsc</code> point at every affected component.`,
        `Add <code>public/config.js</code>, the typed <code>config.ts</code>, and the <code>&lt;script src="/config.js"&gt;</code> tag. Write the Dockerfile, <code>nginx/default.conf</code>, the security-headers snippet and <code>40-app-config.sh</code>, plus a <code>.dockerignore</code>. Build with <code>docker build -t web .</code>.`,
        `Run it with Compose next to FastAPI. Check with <code>curl -I</code>: a deep link returns 200 with <code>no-cache</code>; a file in <code>/assets/</code> has <code>immutable</code>; a missing asset is 404; <code>/config.js</code> shows the <code>APP_ENV</code> you passed; <code>/api/health</code> reaches FastAPI. Restart with a different <code>APP_ENV</code> and confirm the same image reports the new environment in the UI.`,
        `<b>Done when:</b> lint blocks a cross-feature deep import, the API types are generated and used, one Docker image serves the app with the four <code>curl</code> checks passing, and changing <code>APP_ENV</code> requires only a container restart, not a rebuild.`
      ],
      teach: `<p>"Production architecture for a React app has two halves. The first is code structure. I organise by feature: an <code>app</code> folder that wires providers and the router, a folder per business feature that owns its components, hooks and API calls and exposes a small public index, and a <code>shared</code> folder with the design system and the HTTP client. Imports flow in one direction, and a lint rule enforces it, so teams don't trip over each other.</p>
<p>The API layer is generated from FastAPI's OpenAPI schema, so if the backend renames a field, TypeScript tells me exactly which components break, before a customer does.</p>
<p>The second half is delivery. A multi-stage Docker build compiles the app with Node and copies only the static files into nginx. nginx does three things: it serves <code>index.html</code> for any route so client routing survives a refresh, it caches hashed assets forever but never caches <code>index.html</code>, and it sits next to FastAPI under one origin, with <code>/api</code> proxied, so there's no CORS. Environment-specific values come from a <code>config.js</code> written when the container starts, so the image I tested in staging is the exact image in production.</p>
<p>Finally, operations: Sentry with hidden source maps so stack traces are readable, feature flags so I can release to five percent and switch off without a deploy, and budgets in CI so the bundle doesn't quietly double. Micro-frontends I keep for when the team structure really needs independent deploys, not before."</p>`
    },
    {
      id: "d15-interview",
      title: "Interview bootcamp: machine coding and frontend system design",
      lv: ["fresher", "mid", "senior", "lead", "architect"],
      eli5: `<p>A cooking competition has rounds. First the judges ask you questions ("why do you rest meat?"). Then a <b>skills test</b>: make an omelette in 20 minutes while they watch. Then, for head-chef candidates, a <b>menu design</b> round: plan a restaurant's kitchen for 300 covers a night. Finally they chat with you to see whether you would be good to work with.</p>
<p>The judges are not only tasting the omelette. They watch whether you <b>asked</b> how the customer likes it, whether you laid out your tools before cracking eggs, whether you kept the station clean, and whether you talked them through what you were doing. A slightly imperfect omelette with a clear process beats a perfect one made in stressed silence.</p>
<p>Frontend interviews work the same way: <b>fundamentals</b> questions, a <b>machine-coding</b> round (build an autocomplete in 45 minutes), a <b>system design</b> round for senior roles (design a news feed), and a <b>behavioural</b> conversation. Today you learn a recipe for each round so you never stare at a blank editor.</p>`,
      what: `<h5>1. How frontend interviews are structured</h5>
<ul class="pts">
<li><b>Fundamentals</b> (all levels): JavaScript (closures, <code>this</code>, the event loop, promises), browser (DOM, events, rendering, storage, CORS, security), CSS (layout, specificity), and React (rendering, hooks, state, effects, performance). Usually a conversation or quick quiz, sometimes "what does this code log?". The classic React questions are collected in the interview-questions section below.</li>
<li><b>Machine coding / UI coding</b> (fresher to senior): 45-90 minutes to build a working component or mini-app in a sandbox or your own editor: autocomplete, infinite scroll, todo, tabs, modal, star rating, pagination, file explorer, data table with sort and filter, a form wizard. Evaluated on working code, state design, edge cases, accessibility, code quality and communication.</li>
<li><b>JavaScript utilities</b> (often combined): implement <code>debounce</code>, <code>throttle</code>, <code>Promise.all</code>, deep clone, an event emitter, <code>curry</code>.</li>
<li><b>Frontend system design</b> (senior and above, sometimes mid): 45-60 minutes, mostly whiteboard: design a news feed, chat app, Google Docs-like editor, e-commerce product page, autocomplete at scale. Evaluated on structure, trade-offs and depth where it matters.</li>
<li><b>Behavioural / leadership</b>: past projects, conflicts, ownership, mentoring, a failure you learned from. Use STAR (Situation, Task, Action, Result) with concrete numbers. At lead and architect level, expect "tell me about a technical decision you reversed" and "how did you get buy-in for a migration".</li>
</ul>
<h5>2. A machine-coding method (say it out loud)</h5>
<ul class="pts">
<li><b>Clarify (3-5 min).</b> Restate the task. Ask: what data and API shape? how many items? mobile? which interactions are must-have (keyboard? mouse? touch)? is there a backend or should I mock it? What is out of scope? Write the agreed requirements as a checklist at the top of the file.</li>
<li><b>State shape (3 min).</b> List the minimal state and what is derived. For autocomplete: <code>query</code>, <code>results</code>, <code>status</code>, <code>activeIndex</code>, <code>open</code>; derived: <code>showList</code>, active option id. Saying "this is derived, so it is not state" is a strong signal (Day 4).</li>
<li><b>Component tree (2 min).</b> Sketch it: <code>Autocomplete</code> → <code>input</code> + <code>Listbox</code> → <code>Option</code>. Decide which component owns which state and what the props/callbacks are.</li>
<li><b>Happy path first (15-25 min).</b> Get something working end to end, ugly is fine. Mock the API with a small async function if there is no backend. Commit mentally to "working, then good".</li>
<li><b>Edge cases (10 min).</b> Empty input, no results, error, slow network, out-of-order responses, rapid typing, double submission, very long lists, unmount during a request. Name each one even if you only have time to fix some.</li>
<li><b>Accessibility (5 min).</b> Semantic elements, labels, keyboard support, focus management, ARIA roles where native semantics are missing, live regions for async status. This is where many candidates lose senior-level points.</li>
<li><b>Tests and wrap-up (5 min).</b> Write or describe two or three tests (Testing Library: type, see options, press keys). Close with what you would do with more time: caching, virtualisation, extracting a hook, i18n.</li>
</ul>
<p>Throughout: <b>narrate</b> (the interviewer grades thinking they can hear), keep functions small, name things well, use TypeScript types for the data, and do not gold-plate styling.</p>
<h5>3. Worked solution: debounced autocomplete against /api/search</h5>
<p>Requirements agreed: suggestions from <code>GET /api/search?q=&amp;limit=8</code> (FastAPI; Redis may cache popular prefixes, PostgreSQL full-text or trigram index behind it), start at 2 characters, debounce 300 ms, never show results for an older query, arrow keys and Enter to choose, Escape to close, mouse click works, screen readers announce options and result counts. Key decisions:</p>
<ul class="pts">
<li><b>Debounce the value, not the handler:</b> a <code>useDebouncedValue(query, 300)</code> hook (Day 10) keeps the input fully controlled and responsive while the network effect depends on the debounced term.</li>
<li><b>Race safety:</b> each effect run creates an <code>AbortController</code>; the cleanup aborts it when the term changes or the component unmounts. So a slow response for "re" can never overwrite results for "rea" (Day 7). Belt and braces: ignore data if <code>signal.aborted</code>.</li>
<li><b>Caching:</b> a <code>Map</code> in a ref caches results per term, so backspacing is instant. In an app with TanStack Query, <code>useQuery({ queryKey: ["search", term], enabled: term.length &gt;= 2, placeholderData: keepPreviousData })</code> gives you caching, deduplication and cancellation for free; in an interview, show you know both.</li>
<li><b>Keyboard and ARIA (combobox pattern):</b> the input has <code>role="combobox"</code>, <code>aria-expanded</code>, <code>aria-controls</code> (the listbox id), <code>aria-autocomplete="list"</code> and <code>aria-activedescendant</code> (the active option id). Focus stays in the input; the "active" option is virtual. Options are <code>role="option"</code> with <code>aria-selected</code>. A polite live region announces "8 suggestions".</li>
<li><b>Mouse vs blur:</b> clicking an option blurs the input first, which would close the list before the click lands. <code>onMouseDown={e =&gt; e.preventDefault()}</code> on options keeps focus in the input.</li>
</ul>
<h5>4. Worked solution: infinite-scroll feed with IntersectionObserver</h5>
<ul class="pts">
<li><b>API</b>: cursor pagination, <code>GET /api/feed?cursor=…&amp;limit=20</code> returning <code>{ items, nextCursor }</code>. Cursors (an opaque encoding of the last item's sort key) are stable when new posts are inserted at the top; offset pagination duplicates or skips items when the list shifts.</li>
<li><b>Trigger</b>: a sentinel <code>&lt;div&gt;</code> after the last item, observed with <code>IntersectionObserver</code> and a <code>rootMargin</code> of a few hundred pixels so the next page loads before the user reaches the end. No scroll listeners, no layout reads on every scroll event.</li>
<li><b>Guards</b>: an in-flight ref prevents double loads (the observer can fire again before state updates), <code>hasMore</code> stops at the end, items are de-duplicated by id, errors show a Retry button, and a visible "Load more" button keeps the feed usable for keyboard users and when the observer is unavailable.</li>
<li><b>Scale</b>: after a few hundred items, DOM size hurts. Virtualise (TanStack Virtual, Day 11), or cap pages kept in memory (TanStack Query's <code>maxPages</code>). Restore scroll position when the user navigates back (React Router's <code>ScrollRestoration</code> plus cached data).</li>
</ul>
<h5>5. Shorter outlines for other classic prompts</h5>
<ul class="pts">
<li><b>Todo list</b>: state <code>todos: {id, text, done}[]</code> and <code>filter</code>; derived visible list and counts. <code>useReducer</code> with a discriminated-union action type. Stable ids from <code>crypto.randomUUID()</code> as keys (never the index once items can be removed or reordered). Edge cases: trim and reject empty, edit in place (Enter saves, Escape cancels), persist to <code>localStorage</code>, a11y: a real <code>&lt;form&gt;</code>, labelled checkbox per item.</li>
<li><b>Tabs</b>: state <code>activeIndex</code>. ARIA: <code>role="tablist"</code>, <code>tab</code> with <code>aria-selected</code> and <code>aria-controls</code>, <code>tabpanel</code> with <code>aria-labelledby</code>. Roving <code>tabIndex</code> (active tab 0, others -1), arrows/Home/End move focus. Decide: keep inactive panels mounted (preserve state) or unmount them (save memory).</li>
<li><b>Modal</b>: prefer native <code>&lt;dialog&gt;</code> with <code>showModal()</code>: it renders in the top layer, makes the rest of the page inert, handles Escape and focus. Otherwise: portal (Day 9), focus trap, restore focus to the trigger on close, <code>aria-modal</code>, label via <code>aria-labelledby</code>, lock body scroll, backdrop click to close.</li>
<li><b>Star rating</b>: really a radio group: <code>value</code>, <code>hover</code> (derived display = hover ?? value). Native radio inputs give keyboard arrows and form integration for free; stars are visual only (<code>aria-hidden</code>), each radio has an accessible label "3 stars". Support read-only and half stars as follow-ups.</li>
<li><b>Pagination</b>: state lives in the URL (<code>?page=3</code> via <code>useSearchParams</code>) so it is shareable and survives refresh. A pure <code>pageRange(current, total)</code> function produces <code>[1, "gap", 4, 5, 6, "gap", 20]</code> and is trivially unit-tested. <code>&lt;nav aria-label="Pagination"&gt;</code>, <code>aria-current="page"</code>, disabled Prev/Next at the ends, <code>keepPreviousData</code> to avoid flashing.</li>
</ul>
<h5>6. Frontend system design: a framework</h5>
<ul class="pts">
<li><b>Requirements (5 min)</b>: functional (what users do) and non-functional (devices, scale, latency targets, offline, SEO, a11y level, locales, real-time). Agree scope: "posts, likes, comments count, infinite feed, new-posts indicator; out of scope: post creation editor, DMs".</li>
<li><b>Architecture and component tree (5-10 min)</b>: rendering strategy (CSR, SSR, streaming, RSC; Day 13), routes, and a tree: <code>FeedPage</code> → <code>NewPostsBanner</code>, <code>FeedList</code> (virtualised) → <code>PostCard</code> → <code>PostHeader</code>, <code>PostMedia</code>, <code>PostActions</code>.</li>
<li><b>Data model and API (5-10 min)</b>: entities and their fields; endpoints, pagination (cursor), real-time (polling vs SSE vs WebSocket), error shapes. Normalise or not.</li>
<li><b>State and caching (5-10 min)</b>: server state in TanStack Query (infinite query, stale times, optimistic likes, invalidation), client state local (composer text, expanded comments), URL state (filters, tab). Where the cache lives, how it is updated by real-time events.</li>
<li><b>Performance (5-10 min)</b>: virtualisation, image strategy (responsive <code>srcset</code>, lazy loading, fixed aspect ratio to avoid CLS, CDN with resizing), code splitting (media viewer, comments), prefetch next page, Web Vitals targets, skeletons.</li>
<li><b>Accessibility and i18n</b>: feed semantics (<code>&lt;article&gt;</code> per post, headings, focus not lost when items load), keyboard actions, live region for "12 new posts", reduced motion; localised dates and counts with <code>Intl</code>, RTL.</li>
<li><b>Testing</b>: unit (pure helpers), component (PostCard states with MSW), integration (feed scroll and like flow), E2E smoke (Playwright), visual regression for the design system.</li>
<li><b>Deployment and observability</b>: CDN for assets and media, feature flags for ranking experiments, Sentry, RUM Web Vitals, analytics for impressions (batched with <code>navigator.sendBeacon</code>).</li>
</ul>
<p>Drive the conversation: propose a default, state the trade-off, and ask "do you want me to go deeper on real-time updates or on performance?". The interviewer is assessing judgment and breadth first, then depth in one or two areas.</p>`,
      why: `<p>Interviews exist because companies cannot watch you work for a month before hiring. Each round is a proxy: fundamentals for "does this person understand the tools or just copy patterns", machine coding for "can they deliver a working, robust feature under mild pressure", system design for "can they make decisions whose consequences last years", behavioural for "will the team be better with them".</p>
<p>Without a method, capable developers fail these proxies for avoidable reasons: they start typing before clarifying and build the wrong thing; they spend 30 minutes on CSS; they forget out-of-order responses (the single most common autocomplete bug); they produce a combobox no screen reader can use; in system design they list technologies instead of making decisions. Interviewers see the same mistakes all day, so a structured approach is immediately recognisable as seniority.</p>
<p>The method also mirrors real work. Clarify, design state, build the happy path, harden edge cases, make it accessible, test it, ship and observe: that is the same loop as every feature in your React + FastAPI product. Practising it for interviews makes you better at the job, and vice versa.</p>`,
      diagram: {
        html: flow([["Clarify", "requirements, API shape, scope", "w"], ["State shape", "minimal state, derived values", ""], ["Components", "tree, ownership, props", ""], ["Happy path", "working end to end", "g"], ["Edge cases", "race, empty, error, slow", "r"], ["A11y", "roles, keyboard, focus, live", ""], ["Tests + wrap-up", "RTL tests, next steps", "g"]]) + lanes([
          ["Requirements", ["Functional: browse feed, like, see counts, new-posts banner", "Non-functional: mobile, 3G, LCP under 2.5 s, a11y AA, 10 locales", "Out of scope: editor, DMs"]],
          ["Components + API", ["FeedPage → NewPostsBanner, FeedList → PostCard", "GET /api/feed?cursor&amp;limit → {items, nextCursor}", "POST /api/posts/{id}/like; SSE /api/feed/stream"]],
          ["State + perf", ["TanStack useInfiniteQuery; optimistic like", "Virtualised list, lazy images, fixed aspect ratios", "Prefetch next page via IntersectionObserver"]],
          ["Quality + ops", ["Feed/article semantics, live region, keyboard", "Intl dates and numbers; RTL", "MSW component tests, Playwright smoke, Sentry, RUM"]]
        ]),
        steps: [
          "<b>Clarify</b> before coding: restate the task, confirm data shape and must-have interactions, write the checklist at the top of the file.",
          "<b>State shape</b>: list minimal state and derive everything else; decide which component owns it.",
          "<b>Happy path</b>: get it working end to end with a real or mocked API, then commit to it before polishing.",
          "<b>Edge cases</b>: out-of-order responses, empty, error, loading, rapid input, unmount. Fix the dangerous ones, name the rest.",
          "<b>Accessibility and tests</b>: roles, labels, keyboard, focus, live regions; two or three Testing Library tests or a clear description of them.",
          "For <b>system design</b>, walk the lanes left to right: requirements, component tree and API, state and performance, then quality and operations, going deep where the interviewer steers."
        ]
      },
      ex: [
        {
          t: "Machine coding 1: a race-safe, accessible, debounced autocomplete (full solution)",
          lang: "tsx",
          code: `// src/shared/lib/useDebouncedValue.ts
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);              // every keystroke restarts the timer
  }, [value, delayMs]);
  return debounced;
}

// src/features/search/Autocomplete.tsx
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";

export type Suggestion = { id: number; label: string };
type Status = "idle" | "loading" | "success" | "error";

type Props = {
  onSelect: (item: Suggestion) => void;
  label?: string;
  minChars?: number;
};

export function Autocomplete({ onSelect, label = "Search", minChars = 2 }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const cache = useRef(new Map<string, Suggestion[]>());
  const inputId = useId();
  const listboxId = useId();
  const term = useDebouncedValue(query.trim(), 300);

  useEffect(() => {
    if (term.length < minChars) {
      setResults([]);
      setStatus("idle");
      return;
    }
    const cached = cache.current.get(term);
    if (cached) {
      setResults(cached);
      setStatus("success");
      setActiveIndex(-1);
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    const url = new URL("/api/search", window.location.origin);
    url.searchParams.set("q", term);
    url.searchParams.set("limit", "8");

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json() as Promise<Suggestion[]>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;   // a newer term already took over
        cache.current.set(term, data);
        setResults(data);
        setStatus("success");
        setActiveIndex(-1);
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");   // aborts are expected, not errors
      });

    return () => controller.abort();             // term changed or unmounted: cancel the old request
  }, [term, minChars]);

  const showList = open && term.length >= minChars && results.length > 0;
  const optionId = (i: number) => listboxId + "-opt-" + i;

  function choose(item: Suggestion) {
    setQuery(item.label);
    setOpen(false);
    setActiveIndex(-1);
    onSelect(item);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();                       // don't move the caret
        if (!open) {
          setOpen(true);
          return;
        }
        if (results.length > 0) setActiveIndex((i) => (i + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (results.length > 0) setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
        break;
      case "Enter": {
        const item = results[activeIndex];
        if (showList && item) {
          e.preventDefault();                     // don't submit a surrounding form
          choose(item);
        }
        break;
      }
      case "Escape":
        if (open) setOpen(false);
        else setQuery("");                        // second Escape clears, like native search inputs
        setActiveIndex(-1);
        break;
    }
  }

  let announcement = "";
  if (status === "loading") announcement = "Searching";
  else if (status === "error") announcement = "Search failed";
  else if (showList) announcement = results.length + " suggestions available";

  return (
    <div className="autocomplete">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-activedescendant={showList && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      <ul id={listboxId} role="listbox" aria-label={label + " suggestions"} hidden={!showList}>
        {results.map((item, i) => (
          <li
            key={item.id}
            id={optionId(i)}
            role="option"
            aria-selected={i === activeIndex}
            className={i === activeIndex ? "active" : undefined}
            onMouseDown={(e) => e.preventDefault()}   // keep focus in the input so blur doesn't close first
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => choose(item)}
          >
            {item.label}
          </li>
        ))}
      </ul>
      {open && status === "success" && results.length === 0 && (
        <p className="hint">No matches for "{term}"</p>
      )}
      {status === "error" && <p className="error">Could not load suggestions. Keep typing to retry.</p>}
      <div role="status" aria-live="polite" className="sr-only">{announcement}</div>
    </div>
  );
}`,
          out: `Type "r"            -> nothing (below minChars)
Type "re", "rea"    -> one request after 300 ms of quiet: GET /api/search?q=rea&limit=8
Slow "re" response  -> aborted by cleanup; can never overwrite "rea" results
ArrowDown x2, Enter -> second suggestion chosen; input shows its label; list closes
Backspace to "re"   -> instant (served from the per-term cache)
Screen reader       -> "Search, combobox, expanded", "8 suggestions available", "React Query, 2 of 8"`,
          note: `<p>Walk the interviewer through the decisions in this order: debounced value (fewer requests, controlled input stays snappy), abort in cleanup (race safety, also handles unmount), cache by term, derived <code>showList</code> (not state), the combobox ARIA contract with <code>aria-activedescendant</code> (focus never leaves the input), and the <code>mousedown</code> trick. The <code>sr-only</code> class is the usual visually-hidden utility from Day 9. <code>useId</code> values are meant for attributes like <code>id</code> and <code>aria-*</code>, not CSS selectors. Follow-ups to offer: highlight the matched substring, group results, minimum query cost on the FastAPI side (prefix index, Redis caching of hot prefixes, rate limiting), and replacing the effect with TanStack Query. Some newer versions of the React hooks lint rules warn about calling <code>setState</code> synchronously inside an effect; the early-return branches here could instead be derived during render, which is a good refinement to mention.</p>`
        },
        {
          t: "Testing the autocomplete: Vitest + Testing Library + user-event + MSW",
          lang: "tsx",
          code: `// src/features/search/Autocomplete.test.tsx
// npm install -D vitest jsdom @testing-library/react @testing-library/user-event msw
// vitest config: test: { environment: "jsdom" } (Day 14)
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { setupServer } from "msw/node";
import { Autocomplete } from "./Autocomplete";

const server = setupServer(
  http.get("*/api/search", async ({ request }) => {
    const q = new URL(request.url).searchParams.get("q") ?? "";
    if (q === "re") await delay(800);           // the stale request is slow
    return HttpResponse.json([
      { id: 1, label: q + " one" },
      { id: 2, label: q + " two" },
    ]);
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

it("shows suggestions and selects one with the keyboard", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<Autocomplete onSelect={onSelect} />);

  const input = screen.getByRole("combobox", { name: "Search" });
  await user.type(input, "rea");

  const options = await screen.findAllByRole("option");
  expect(options).toHaveLength(2);
  expect(input.getAttribute("aria-expanded")).toBe("true");

  await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
  expect(onSelect).toHaveBeenCalledWith({ id: 2, label: "rea two" });
  expect((input as HTMLInputElement).value).toBe("rea two");
});

it("never shows results for an older query", async () => {
  const user = userEvent.setup();
  render(<Autocomplete onSelect={() => {}} />);
  const input = screen.getByRole("combobox", { name: "Search" });

  await user.type(input, "re");
  await new Promise((r) => setTimeout(r, 350));  // debounce fires: slow "re" request starts
  await user.type(input, "a");                    // term becomes "rea": "re" is aborted

  expect(await screen.findByRole("option", { name: "rea one" })).toBeTruthy();
  await new Promise((r) => setTimeout(r, 900));  // let the slow "re" response time pass
  expect(screen.queryByRole("option", { name: "re one" })).toBeNull();
});`,
          out: ` ✓ shows suggestions and selects one with the keyboard
 ✓ never shows results for an older query
 Test Files  1 passed (1)`,
          note: `<p>The handler path <code>*/api/search</code> matches any origin, which suits the component building an absolute URL from <code>window.location.origin</code> (jsdom provides <code>http://localhost:3000</code> by default). The second test is the one interviewers love: it proves the race fix. Real timers keep it simple; with fake timers you must pass <code>advanceTimers</code> to <code>userEvent.setup</code>. If your Vitest config has <code>globals: true</code>, Testing Library cleans up automatically and the explicit <code>cleanup()</code> is redundant. The race test takes about 1.5 s, well within Vitest's default 5 s test timeout; in a large suite, prefer fake timers or a shorter delay.</p>`
        },
        {
          t: "Machine coding 2: infinite-scroll feed with IntersectionObserver (no libraries)",
          lang: "tsx",
          code: `// src/features/feed/Feed.tsx
import { useCallback, useEffect, useRef, useState } from "react";

type Post = { id: string; author: string; text: string; createdAt: string };
type FeedPage = { items: Post[]; nextCursor: string | null };

async function fetchFeed(cursor: string | null, signal?: AbortSignal): Promise<FeedPage> {
  const url = new URL("/api/feed", window.location.origin);
  url.searchParams.set("limit", "20");
  if (cursor) url.searchParams.set("cursor", cursor);
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return (await res.json()) as FeedPage;
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const inFlight = useRef(false);                 // synchronous guard: state updates are not immediate
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (inFlight.current || !hasMore) return;
    inFlight.current = true;
    setStatus("loading");
    try {
      const page = await fetchFeed(cursor);
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.items.filter((p) => !seen.has(p.id))];   // de-duplicate
      });
      setCursor(page.nextCursor);
      setHasMore(page.nextCursor !== null);
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }, [cursor, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || status === "error") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: "600px 0px" },                // start loading well before the end
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore, status]);

  return (
    <section aria-label="News feed" aria-busy={status === "loading"}>
      {posts.map((post) => (
        <article key={post.id} className="post">
          <h2>{post.author}</h2>
          <p>{post.text}</p>
          <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString()}</time>
        </article>
      ))}

      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />

      {status === "loading" && <p role="status">Loading more posts…</p>}
      {status === "error" && (
        <p role="alert">
          Could not load posts. <button onClick={() => void loadMore()}>Retry</button>
        </p>
      )}
      {status === "idle" && hasMore && posts.length > 0 && (
        <button onClick={() => void loadMore()}>Load more</button>
      )}
      {!hasMore && <p>You're all caught up.</p>}
    </section>
  );
}`,
          out: `Mount               -> observer fires immediately (sentinel visible) -> GET /api/feed?limit=20
Page 1 renders      -> loadMore identity changes -> new observer; sentinel now off-screen -> waits
Scroll near bottom  -> GET /api/feed?limit=20&cursor=eyJpZCI6...  (once, guarded by inFlight)
Network error       -> observer stops (status=error), Retry button shown
nextCursor = null   -> "You're all caught up." and no more observing`,
          note: `<p>Points to say out loud: an observer fires once immediately after <code>observe()</code> with the current intersection state, so if a short page leaves the sentinel visible, the re-created observer loads the next page automatically until the viewport is filled. The <code>inFlight</code> ref closes the gap between "request started" and "state updated", which a <code>status</code> check alone cannot (the closure sees the old status). Pausing observation on error prevents a retry storm. Unmounting mid-request is harmless in React 18+ (the update is ignored); pass an <code>AbortSignal</code> if you want to cancel the network work too. On the FastAPI side the cursor is typically a base64-encoded <code>(created_at, id)</code> tuple used in a <code>WHERE (created_at, id) &lt; (...)</code> keyset query, which stays fast on deep pages where <code>OFFSET</code> gets slower.</p>`
        },
        {
          t: "The same feed with TanStack Query's useInfiniteQuery and a reusable observer hook",
          lang: "tsx",
          code: `// npm install @tanstack/react-query   (Day 7 covers the QueryClientProvider setup)
import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

type Post = { id: string; author: string; text: string };
type FeedPage = { items: Post[]; nextCursor: string | null };

async function fetchFeed(cursor: string | null, signal: AbortSignal): Promise<FeedPage> {
  const url = new URL("/api/feed", window.location.origin);
  url.searchParams.set("limit", "20");
  if (cursor) url.searchParams.set("cursor", cursor);
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return (await res.json()) as FeedPage;
}

function useOnVisible(onVisible: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef(onVisible);
  useEffect(() => {
    latest.current = onVisible;                 // always call the newest callback
  });
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) latest.current();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);
  return ref;
}

export function FeedWithQuery() {
  const { data, status, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam, signal }) => fetchFeed(pageParam, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,   // null = no more pages
  });

  const sentinel = useOnVisible(() => void fetchNextPage(), hasNextPage && !isFetchingNextPage);

  if (status === "pending") return <p role="status">Loading feed…</p>;
  if (status === "error") return <button onClick={() => void refetch()}>Retry</button>;

  return (
    <section aria-label="News feed" aria-busy={isFetchingNextPage}>
      {data.pages.flatMap((page) => page.items).map((post) => (
        <article key={post.id}>
          <h2>{post.author}</h2>
          <p>{post.text}</p>
        </article>
      ))}
      <div ref={sentinel} aria-hidden="true" style={{ height: 1 }} />
      {isFetchingNextPage && <p role="status">Loading more…</p>}
      {!hasNextPage && <p>You're all caught up.</p>}
    </section>
  );
}`,
          note: `<p>TanStack Query brings what the hand-written version lacks: deduplication of concurrent page fetches, caching so "back" navigation shows the feed instantly, cancellation via <code>signal</code>, retries, and refetch on focus. In v5, <code>initialPageParam</code> is required and returning <code>null</code> or <code>undefined</code> from <code>getNextPageParam</code> sets <code>hasNextPage</code> to false. Toggling <code>enabled</code> re-creates the observer, and its immediate first callback keeps loading while the sentinel is still visible. In an interview, build the hand-written version if asked to "not use libraries", then say this is what you would ship.</p>`
        },
        {
          t: "Outlines in code: todo reducer, star rating, pagination range",
          lang: "tsx",
          code: `import { useReducer, useState } from "react";

// ---- Todo: discriminated-union reducer, stable ids as keys ----
type Todo = { id: string; text: string; done: boolean };
type Action =
  | { type: "add"; text: string }
  | { type: "toggle"; id: string }
  | { type: "remove"; id: string }
  | { type: "edit"; id: string; text: string };

export function todosReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add": {
      const text = action.text.trim();
      return text ? [...state, { id: crypto.randomUUID(), text, done: false }] : state;
    }
    case "toggle":
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case "remove":
      return state.filter((t) => t.id !== action.id);
    case "edit":
      return state.map((t) => (t.id === action.id ? { ...t, text: action.text } : t));
  }
}

export function TodoApp() {
  const [todos, dispatch] = useReducer(todosReducer, []);
  const [draft, setDraft] = useState("");
  const remaining = todos.filter((t) => !t.done).length;   // derived, not state
  return (
    <section aria-label="Todos">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          dispatch({ type: "add", text: draft });
          setDraft("");
        }}
      >
        <label htmlFor="new-todo">New todo</label>
        <input id="new-todo" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => dispatch({ type: "toggle", id: t.id })} />
              {t.text}
            </label>
            <button aria-label={"Delete " + t.text} onClick={() => dispatch({ type: "remove", id: t.id })}>×</button>
          </li>
        ))}
      </ul>
      <p>{remaining} left</p>
    </section>
  );
}

// ---- Star rating: a radio group with visual stars ----
type StarRatingProps = { value: number; onChange: (v: number) => void; max?: number; name?: string };

export function StarRating({ value, onChange, max = 5, name = "rating" }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  return (
    <fieldset className="stars" onMouseLeave={() => setHover(null)}>
      <legend>Rating</legend>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <label key={n} onMouseEnter={() => setHover(n)}>
          <input
            type="radio"
            className="sr-only"
            name={name}
            value={n}
            checked={value === n}
            onChange={() => onChange(n)}
          />
          <span aria-hidden="true">{n <= shown ? "★" : "☆"}</span>
          <span className="sr-only">{n === 1 ? "1 star" : n + " stars"}</span>
        </label>
      ))}
    </fieldset>
  );
}

// ---- Pagination: a pure, unit-testable range function ----
export function pageRange(current: number, total: number, siblings = 1): (number | "gap")[] {
  if (total <= 1) return [1];
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const out: (number | "gap")[] = [1];
  if (start > 2) out.push("gap");
  for (let p = start; p <= end; p++) out.push(p);
  if (end < total - 1) out.push("gap");
  out.push(total);
  return out;
}`,
          out: `pageRange(5, 10)  -> [1, "gap", 4, 5, 6, "gap", 10]
pageRange(1, 10)  -> [1, 2, "gap", 10]
pageRange(3, 10)  -> [1, 2, 3, 4, "gap", 10]
pageRange(1, 1)   -> [1]`,
          note: `<p>The reducer's <code>switch</code> is exhaustive over the union, so TypeScript knows every path returns (add a <code>default</code> with a <code>never</code> check if you want a compile error when a new action type is added). In the star rating, the native radios give arrow-key navigation, a single tab stop and form participation for free; the stars are decoration. For pagination, render the range inside <code>&lt;nav aria-label="Pagination"&gt;</code> with <code>aria-current="page"</code> on the current link and keep <code>page</code> in the URL with <code>useSearchParams</code> (Day 8). A refinement interviewers like: when a "gap" would hide exactly one page, show that page number instead.</p>`
        },
        {
          t: "Outlines in code: accessible tabs (roving tabindex) and a modal with native &lt;dialog&gt;",
          lang: "tsx",
          code: `import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

// ---- Tabs ----
type Tab = { id: string; label: string; content: ReactNode };

export function Tabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    let next: number;
    if (e.key === "ArrowRight") next = (active + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (active - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();              // focus follows selection (automatic activation)
  }

  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={baseId + "-tab-" + i}
            aria-selected={i === active}
            aria-controls={baseId + "-panel-" + i}
            tabIndex={i === active ? 0 : -1}         // roving tabindex: one tab stop for the whole list
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.id}
          role="tabpanel"
          id={baseId + "-panel-" + i}
          aria-labelledby={baseId + "-tab-" + i}
          hidden={i !== active}                    // stays mounted: inner state survives tab switches
          tabIndex={0}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}

// ---- Modal: native <dialog> handles top layer, inert background, Escape and focus ----
type ModalProps = { open: boolean; onClose: () => void; title: string; children: ReactNode };

export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}                             // fires on Escape and on dialog.close()
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // click on the backdrop area
      }}
    >
      <h2 id={titleId}>{title}</h2>
      {children}
      <button type="button" onClick={onClose}>Close</button>
    </dialog>
  );
}`,
          note: `<p>The ref callback uses a block body so it returns nothing: in React 19 a ref callback may return a cleanup function, and TypeScript rejects an implicit non-function return. With <code>showModal()</code>, browsers move focus into the dialog and return it to the previously focused element when it closes. The backdrop check works because clicks on the <code>::backdrop</code> are dispatched to the <code>&lt;dialog&gt;</code> element itself; if your dialog has no padding wrapper, clicks on its own padding also count, so put content inside an inner <code>&lt;div&gt;</code>. Day 9 covers the portal plus focus-trap version for when you cannot use <code>&lt;dialog&gt;</code>.</p>`
        },
        {
          t: "System design: news feed data model, API contract and optimistic like",
          lang: "ts",
          code: `// ---- Data model (mirrors FastAPI's Pydantic schemas; generate in real life, Day 15 architecture) ----
type Author = { id: string; name: string; avatarUrl: string };
type Media = { url: string; width: number; height: number; alt: string };   // dimensions -> no CLS
type Post = {
  id: string;
  author: Author;
  text: string;
  media: Media[];
  createdAt: string;        // ISO 8601; format on the client with Intl
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
};
type FeedPage = { items: Post[]; nextCursor: string | null };

/* ---- API contract ----
   GET  /api/feed?cursor=<opaque>&limit=20   -> FeedPage        (keyset pagination; Redis caches hot pages)
   POST /api/posts/{id}/like                 -> { likeCount, likedByMe }   (idempotent PUT/DELETE also fine)
   GET  /api/feed/stream                     -> text/event-stream: { type: "new_posts", count }   (SSE)
   Errors: { detail: string } with proper status codes (FastAPI default shape)                        */

// ---- Optimistic like across all loaded pages (TanStack Query v5) ----
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";

const feedKey = ["feed"] as const;
type FeedData = InfiniteData<FeedPage, string | null>;

async function likePost(id: string): Promise<{ likeCount: number; likedByMe: boolean }> {
  const res = await fetch("/api/posts/" + encodeURIComponent(id) + "/like", { method: "POST" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json() as Promise<{ likeCount: number; likedByMe: boolean }>;
}

function updatePost(data: FeedData | undefined, id: string, fn: (p: Post) => Post): FeedData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((p) => (p.id === id ? fn(p) : p)),
    })),
  };
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: likePost,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: feedKey });          // don't let a refetch overwrite us
      const previous = qc.getQueryData<FeedData>(feedKey);
      qc.setQueryData<FeedData>(feedKey, (old) =>
        updatePost(old, id, (p) => ({
          ...p,
          likedByMe: !p.likedByMe,
          likeCount: p.likeCount + (p.likedByMe ? -1 : 1),
        })),
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(feedKey, ctx.previous);   // roll back
    },
    onSuccess: (server, id) => {
      qc.setQueryData<FeedData>(feedKey, (old) => updatePost(old, id, (p) => ({ ...p, ...server })));
    },
  });
}`,
          note: `<p>This is the depth an interviewer wants in the "state and caching" part of the design: a cursor-paginated cache, an optimistic update applied across every loaded page, rollback on error, and reconciliation with the server's numbers on success. Notice we do <i>not</i> invalidate the whole infinite query after a like: that would refetch every loaded page in sequence. Real-time "new posts" arrive over SSE as a count; the UI shows a "12 new posts" banner instead of inserting items under the reader's eyes (which would shift content and break scroll position).</p>`
        },
        {
          t: "System design: the component tree and where each kind of state lives",
          lang: "text",
          code: `<FeedPage>                         route /feed (lazy chunk); reads ?tab=following from URL state
  <FeedHeader />                   tabs: For you | Following  (URL state, shareable)
  <NewPostsBanner />               SSE count -> "12 new posts" button; click = refetch first page + scroll top
  <FeedList>                       useInfiniteQuery(["feed", tab]); virtualised (TanStack Virtual)
    <PostCard post={post}>         memoised; receives a stable post object from the cache
      <PostHeader />               avatar (lazy img, fixed size), name, <time> via Intl.RelativeTimeFormat
      <PostText />                 "see more" expand: local UI state
      <PostMedia />                srcset + sizes, aspect-ratio box, loading="lazy" (not for the first post: LCP)
      <PostActions />              like (optimistic mutation), comment count, share (navigator.share fallback)
    </PostCard>
    <Sentinel />                   IntersectionObserver -> fetchNextPage
  </FeedList>
  <CommentsDrawer />               lazy-loaded on first open; ?post=123 in URL so Back closes it

State map
  server state : TanStack Query  (feed pages, post details, comments)  -- never copied into useState
  URL state    : tab, open post id                                     -- shareable, survives refresh
  local UI     : expanded text, hover, composer draft                   -- useState in the leaf
  global client: auth user, theme, feature flags                       -- context (rarely changes)

Non-functional targets
  LCP < 2.5 s on mid-range mobile; INP < 200 ms; CLS < 0.1
  initial JS budget ~170 KB gzip; feed route chunk separate; images via CDN with resizing
  a11y: each post an <article> with a heading; actions are <button>s with labels; live region for new posts`,
          note: `<p>Present this in the interview as a drawing, then narrate the state map: it answers "where does each piece of state live and why" in one glance, which is the most common senior-level probe. Rendering strategy is a follow-up worth raising: a logged-in feed is personalised and not SEO-relevant, so CSR with a fast shell is reasonable; a public profile page might use SSR or SSG (Day 13).</p>`
        }
      ],
      internals: `<p><b>What really happens in the autocomplete when you type "rea".</b> Each keystroke calls <code>setQuery</code>; React re-renders <code>Autocomplete</code> (input stays responsive because the render is cheap). <code>useDebouncedValue</code>'s effect runs after each commit: the cleanup clears the previous timeout and a new 300 ms timeout is scheduled. Only after 300 ms without keystrokes does <code>setDebounced("rea")</code> run, which re-renders with a new <code>term</code>; the fetch effect's dependency changed, so React first runs the previous effect's cleanup (<code>controller.abort()</code> on the "re" request if one is in flight), then the new effect body. An aborted <code>fetch</code> rejects with an <code>AbortError</code> <code>DOMException</code>; the <code>catch</code> sees <code>signal.aborted === true</code> and ignores it. This ordering (cleanup of the old effect before the new effect, both after commit) is the guarantee your race safety rests on (Day 5).</p>
<p><b>Why <code>aria-activedescendant</code> instead of moving focus.</b> Real DOM focus stays on the <code>&lt;input&gt;</code> so typing continues to work; the attribute tells assistive technology which descendant is "active", and screen readers announce that option when the attribute value changes. That is why each option needs a stable, unique <code>id</code>, which <code>useId</code> provides (it is derived from the component's position in the tree, so it is also consistent between server and client rendering).</p>
<p><b>Why the observer approach is cheap.</b> <code>IntersectionObserver</code> callbacks are computed by the browser as part of its rendering steps, off your scroll handlers. A scroll listener that calls <code>getBoundingClientRect()</code> forces layout on every event (dozens per second) and runs on the main thread, competing with React renders and hurting INP. With the observer, React only does work when a page actually needs loading. Each appended page triggers a render of the list; with stable keys React reconciles existing <code>&lt;article&gt;</code> fibers as unchanged (and <code>memo</code>ised cards skip rendering entirely), creating fibers and DOM nodes only for the new items.</p>
<p><b>Why the in-flight guard is a ref.</b> State updates are queued and applied on the next render, and the observer's callback closes over the <code>loadMore</code> from the render that created it. Two intersection callbacks in quick succession would both see <code>status === "idle"</code>. A ref is a mutable box shared by all renders, updated synchronously, so the second call sees <code>true</code> immediately.</p>
<p><b>How interviewers actually score.</b> Most companies use a rubric with four to six dimensions: problem solving (clarifying, decomposition), technical competence (correct React, state design), code quality (naming, structure, types), edge cases and robustness, accessibility and UX, communication. A working but silent solution often scores lower than an 80% solution with clear reasoning, explicit trade-offs and named edge cases. In system design the rubric shifts to scoping, breadth, depth on the chosen areas, and trade-off articulation.</p>`,
      prod: `<p>Both worked examples are miniature versions of production features in the running app:</p>
<ul class="pts">
<li><b>Search in production</b>: FastAPI's <code>/api/search</code> hits a PostgreSQL trigram or full-text index (or a dedicated engine such as OpenSearch/Meilisearch), with Redis caching popular prefixes for seconds to minutes and rate limiting per user. The client adds: TanStack Query instead of a hand-rolled cache, <code>placeholderData: keepPreviousData</code> to avoid flicker, highlighting, recent searches, analytics on selected suggestions, and Sentry breadcrumbs. Accessible comboboxes are hard enough that teams usually adopt one from React Aria, Radix-based kits or Downshift, and keep their own only for unusual behaviour.</li>
<li><b>Feeds in production</b>: keyset pagination in PostgreSQL (fast on deep pages), cached first pages, virtualisation once the DOM grows, image CDN with resizing and <code>srcset</code>, prefetch of the next page on idle, scroll restoration on Back, impression tracking batched with <code>sendBeacon</code>, and "N new posts" rather than live insertion.</li>
<li><b>Interviews at scale</b>: companies standardise rubrics, so interviewers expect the same signals regardless of the prompt. Bring a template in your head: requirements comment block, types first, state list, then code. For take-home assignments, add a README with decisions and trade-offs, tests, and a short "what I would do next"; that README is often what gets you to the next round.</li>
<li><b>What goes wrong for candidates</b>: over-engineering (Redux for a todo), under-engineering (no error state, no race handling), pasting a library they cannot explain, ignoring keyboard users, and in system design, spending 20 minutes on requirements or naming technologies without saying why. For architect roles, not discussing team structure, migration paths and cost.</li>
</ul>`,
      iq: [
        ["fresher", "What is the virtual DOM, and is it why React is fast?", `<p>The "virtual DOM" is the tree of plain JavaScript objects (React elements) that your components return on each render. React compares the new tree with the previous one (reconciliation) and applies only the necessary changes to the real DOM in the commit phase. Internally React works on a fiber tree that keeps state and effects per component instance (Day 12).</p><p>It is not magic speed: diffing has a cost and hand-written DOM updates can be faster. Its real value is the programming model, describing UI as a function of state and letting React compute minimal updates, with good enough performance by default. Saying "the virtual DOM makes React faster than the DOM" is the tempting wrong answer.</p>`],
        ["fresher", "Why does React need keys in lists, and why is the array index a bad key?", `<p>Keys tell reconciliation which child in the new list corresponds to which child in the old list, so React can preserve state and DOM for moved items and only create or remove the ones that changed. With index keys, inserting, removing or reordering items shifts the indexes: React reuses the wrong component instances, so local state (input text, checkboxes, focus) appears on the wrong row, and more DOM is updated than necessary.</p><p>Use a stable id from the data (database id, <code>crypto.randomUUID()</code> on creation). Index is acceptable only for static lists that never reorder or filter. Generating <code>Math.random()</code> keys during render is worse than index: every render remounts everything.</p>`],
        ["mid", "Explain reconciliation. How does React decide whether to update or remount a component?", `<p>React compares the new element tree with the current one, top-down. At each position: if the element type is the same (same component function or same tag), it keeps the instance (state preserved) and updates props; if the type differs, it unmounts the old subtree (state destroyed) and mounts a new one. Children in lists are matched by key. These heuristics make diffing O(n) instead of the O(n³) general tree diff (Day 4, Day 12).</p><p>Consequences interviewers probe: defining a component inside another component creates a new type on every render, so its subtree remounts and loses state; changing a <code>key</code> deliberately resets a component; rendering <code>&lt;A /&gt;</code> vs <code>&lt;B /&gt;</code> at the same spot discards state.</p>`],
        ["mid", "What is the difference between useEffect and useLayoutEffect?", `<p>Both run after React commits DOM changes. <code>useLayoutEffect</code> runs synchronously after the DOM is mutated and <b>before the browser paints</b>, so you can measure layout (<code>getBoundingClientRect</code>) and set state that re-renders before the user sees anything: tooltip positioning, avoiding flicker. <code>useEffect</code> runs after paint (usually), so it does not block the frame: data fetching, subscriptions, logging, timers.</p><p>Default to <code>useEffect</code>; <code>useLayoutEffect</code> blocks painting and does nothing on the server (React warns in older versions when it runs during SSR). The tempting wrong answer "useLayoutEffect runs before render" is false: both run after render and commit.</p>`],
        ["mid", "When do React.memo, useMemo and useCallback actually help?", `<p><code>React.memo</code> skips re-rendering a component when its props are shallowly equal to last time. <code>useMemo</code> caches a computed value and <code>useCallback</code> caches a function between renders, until dependencies change. They help when (1) a component is expensive to render and its parent re-renders often with the same props, so memo plus stable props (via <code>useMemo</code>/<code>useCallback</code>) lets it skip, (2) a computation is genuinely expensive, or (3) a value is a dependency of an effect and must keep identity.</p><p>They do not help when the props change anyway (a new object literal every render defeats <code>memo</code>), and they add comparison cost and noise. Measure with the Profiler first. The React Compiler (Day 11) can insert this memoisation automatically; check its status for your React version.</p>`],
        ["mid", "Context or Redux (or Zustand)? How do you choose?", `<p>Context is a dependency-injection mechanism, not a state manager: it passes a value down without prop drilling, and every consumer re-renders when the value changes. It is ideal for values that change rarely (theme, current user, locale, feature flags). Redux Toolkit or Zustand are stores with selectors: components subscribe to slices and re-render only when their slice changes; you also get devtools, middleware and predictable updates for complex, frequently changing client state.</p><p>And most "global state" is actually server state, which belongs in TanStack Query, not Redux or context (Day 6, Day 7). The tempting wrong answer "Context replaces Redux" ignores the re-render behaviour at scale.</p>`],
        ["mid", "Compare CSR, SSR and SSG. What is hydration?", `<p><b>CSR</b>: the server sends an almost empty HTML shell plus JS; the browser renders everything. Simple hosting, slower first content, weak SEO for crawlers that do not run JS. <b>SSR</b>: the server renders HTML per request, so content appears fast and is crawlable, then JS loads and <b>hydrates</b>: React attaches event handlers and state to the existing DOM instead of recreating it (<code>hydrateRoot</code>). <b>SSG</b>: HTML is rendered at build time, served from a CDN; fastest, but content is as fresh as the last build (ISR-style revalidation mitigates that). Streaming SSR sends HTML in chunks around Suspense boundaries.</p><p>Hydration mismatches occur when server and client render different output (dates, <code>Math.random</code>, <code>window</code> checks). "SSR is always faster" is wrong: time-to-interactive still waits for JS, and server cost rises (Day 13).</p>`],
        ["fresher", "Why doesn't state update immediately after calling setState?", `<p>Each render sees a <b>snapshot</b> of state. <code>setCount(count + 1)</code> queues an update for the next render; inside the current event handler, <code>count</code> still holds the old value. React batches multiple updates in the same event (and, since React 18, in timeouts and promises too) into one render. To update based on the latest queued value use the updater form <code>setCount(c =&gt; c + 1)</code>; to react to the new value, compute it directly or use it in the next render.</p><p>Calling <code>setCount(count + 1)</code> three times increments by one, not three: the classic trap. <code>setState</code> is not "async" in the promise sense; there is nothing to <code>await</code>.</p>`],
        ["mid", "What causes a component to re-render?", `<p>Its own state changes, its parent re-renders (by default children re-render regardless of whether props changed), or a context it reads changes. Props changing is not a separate trigger: props only change because the parent re-rendered. A re-render means calling the function and diffing; it does not necessarily touch the DOM.</p><p>To limit re-renders: move state down to where it is used, lift content up and pass it as <code>children</code> (children created by the parent keep their identity), split contexts, use selectors in stores, and memo where measured. "A component re-renders only when its props change" is the tempting wrong answer.</p>`],
        ["senior", "What is a stale closure in React, and how do you fix one?", `<p>Every render creates new functions that capture that render's props and state. If a function from an old render keeps running (an interval set up in an effect with <code>[]</code> dependencies, a subscription callback, a debounced handler), it keeps seeing old values: for example an interval logging <code>count</code> forever prints 0.</p><p>Fixes: include the values in the effect's dependency array (the linter tells you), use the updater form of <code>setState</code> so you do not need the value, store the latest value or callback in a ref updated in an effect (the "latest ref" pattern used in <code>useOnVisible</code> above), or use React's <code>useEffectEvent</code> where available (check whether it is stable in your React version). Disabling the exhaustive-deps lint rule is the tempting non-fix.</p>`],
        ["senior", "What do error boundaries catch, and what do they not catch?", `<p>Error boundaries catch errors thrown during rendering, in lifecycle methods and in constructors of the tree below them, and show a fallback UI instead of unmounting the whole app. They are still class components (<code>static getDerivedStateFromError</code>, <code>componentDidCatch</code>) or a library wrapper like <code>react-error-boundary</code>.</p><p>They do <b>not</b> catch errors in event handlers (use try/catch), in async code like <code>setTimeout</code> or promise callbacks outside rendering, errors in the boundary itself, or server-side rendering errors. Errors from async work can be routed into a boundary by setting state that throws during render, or via TanStack Query's <code>throwOnError</code>. React 19 also adds root-level <code>onCaughtError</code>/<code>onUncaughtError</code> for reporting.</p>`],
        ["senior", "What is concurrent rendering, and when would you use useTransition?", `<p>React can prepare a new render in the background, yield to the browser between units of work, and abandon or restart it if more urgent updates arrive; renders are interruptible, commits are not. <code>useTransition</code> (or <code>startTransition</code>) marks an update as non-urgent: typing in a filter input updates the input immediately (urgent) while the expensive filtered list renders as a transition and can be interrupted by the next keystroke; <code>isPending</code> lets you show a subtle indicator. <code>useDeferredValue</code> does the same from the consumer side.</p><p>It does not make slow code faster or replace debouncing network requests: transitions are about rendering priority, not about how often you call the API (Day 12).</p>`],
        ["senior", "Why does StrictMode run my effects twice in development?", `<p>In development, StrictMode mounts each component, immediately simulates an unmount (running effect cleanups) and mounts again. It also double-invokes render functions and some initialisers. This surfaces effects without proper cleanup (duplicate subscriptions, leaked intervals, requests without abort) and impure renders, because a future React feature (preserving state across hide/show, as with <code>&lt;Activity&gt;</code>) relies on effects being safely re-runnable. It does not happen in production builds.</p><p>The fix is to write a correct cleanup, not to remove StrictMode or add a "has run" ref guard, which hides the bug.</p>`],
        ["senior", "Server Components vs SSR: what is the difference?", `<p>SSR renders client components to HTML on the server for the first load; the same components then hydrate and run in the browser, so their code ships to the client. React Server Components run <b>only</b> on the server (at request or build time): they can read databases or call internal APIs directly, their code and dependencies never ship to the browser, and they send a serialised component payload that the client merges into the tree. Client components (marked <code>"use client"</code>) are still SSR'd and hydrated. RSC requires a framework that supports it (Next.js App Router and others) (Day 13).</p><p>"RSC is just SSR" is the tempting wrong answer; the bundle-size and data-access model are the point.</p>`],
        ["lead", "In a machine-coding round, what do interviewers evaluate beyond 'does it work'?", `<p>Clarifying questions and scoping; a sensible state shape with derived values not duplicated; component decomposition; correct effects with cleanup; edge cases (race conditions, empty, error, loading, rapid input); accessibility (semantics, labels, keyboard, focus, ARIA where needed); readable code with types; testing approach; and communication: narrating decisions and trade-offs, accepting hints, and stating what you would do with more time.</p><p>Spending the first 20 minutes on styling, or reaching for a library you cannot explain, are the common ways to lose points despite a working result.</p>`],
        ["architect", "Design the frontend for a news feed. Walk me through your approach.", `<p>Requirements: browse an infinite personalised feed, like posts, see comment counts, new-posts indicator; mobile-first, LCP under 2.5 s, accessible, localised. Architecture: CSR app shell (personalised, not SEO-critical) with route-level splitting; component tree <code>FeedPage → NewPostsBanner, FeedList (virtualised) → PostCard → Header/Media/Actions</code>. API: cursor-paginated <code>GET /api/feed</code>, <code>POST /api/posts/{id}/like</code>, SSE for new-post counts. State: TanStack <code>useInfiniteQuery</code> for pages, optimistic likes updating all pages, URL state for tab and open post, local UI state in leaves. Performance: virtualisation, image CDN with <code>srcset</code> and fixed aspect ratios, prefetch next page, memoised cards, budgets. A11y/i18n: articles with headings, keyboard actions, live region for new posts, <code>Intl</code> formatting, RTL. Testing: MSW component tests, Playwright smoke. Ops: flags for ranking experiments, Sentry, RUM, batched impression analytics.</p><p>Then go deep where asked (real-time consistency, scroll restoration, offline). Listing technologies without the "why" is the failure mode.</p>`],
        ["mid", "Controlled vs uncontrolled inputs: which would you use and when?", `<p>Controlled: React state is the source of truth (<code>value</code> + <code>onChange</code>), which enables instant validation, formatting, conditional UI and derived values, at the cost of a render per keystroke. Uncontrolled: the DOM holds the value (<code>defaultValue</code>, read via a ref or <code>FormData</code> on submit), which is simpler and cheaper for large forms. React Hook Form is uncontrolled-first for performance; React 19 form actions read <code>FormData</code> (Day 9).</p><p>Switching an input from uncontrolled to controlled (value going from <code>undefined</code> to a string) triggers a React warning: initialise controlled state with <code>""</code>, not <code>undefined</code>.</p>`]
      ],
      gotchas: [
        `<b>Out-of-order responses</b> are the number-one autocomplete bug. Debouncing reduces requests but does not fix ordering: two requests can still be in flight. Abort (or ignore) the previous request in the effect cleanup.`,
        `<b>Blur closes the list before the click lands:</b> the input's <code>blur</code> fires on <code>mousedown</code> on an option, so the option unmounts before <code>click</code>. Prevent default on the option's <code>mousedown</code>, or handle selection on <code>mousedown</code>/<code>pointerdown</code>.`,
        `<b>IntersectionObserver fires on <code>observe()</code></b> with the current state, and re-creating observers (because the callback changed) re-fires it. Without an in-flight guard you load the same page twice; with a guard, this behaviour usefully keeps loading until the viewport is full.`,
        `<b>Offset pagination on a live feed</b> duplicates items when new posts arrive at the top (everything shifts down by one). Use cursors, and still de-duplicate by id on the client.`,
        `<b><code>role="combobox"</code> is not enough:</b> without <code>aria-expanded</code>, <code>aria-controls</code>, <code>aria-activedescendant</code> and unique option ids, screen readers cannot follow the virtual focus. The ARIA Authoring Practices Guide (APG) combobox pattern is the reference; test with an actual screen reader if you can.`,
        `<b>Index keys in the todo list</b> look fine until you delete the first item: uncontrolled inputs or local state in rows shift to the wrong item. Interviewers often delete an item specifically to check.`,
        `<b>Debouncing a handler created on every render</b> (<code>onChange={debounce(fn, 300)}</code>) creates a new debounced function per render, so nothing is debounced. Debounce the value with a hook, or memoise the debounced function with <code>useMemo</code>/a ref and cancel it on unmount.`,
        `<b>Optimistic updates without cancellation:</b> if a background refetch is in flight when you optimistically update, it can land afterwards and overwrite your change. <code>cancelQueries</code> in <code>onMutate</code> prevents that.`
      ],
      best: [
        `Start every machine-coding answer with a requirements comment and a state list; say which values are derived and therefore not state.`,
        `Get a working happy path within the first half of the time, then harden: races, empty, error, loading, unmount. Name the edge cases you do not have time to fix.`,
        `Build accessibility in, not on: labels, semantic elements, keyboard support and live regions are part of "working" for senior roles.`,
        `Keep side effects in effects with cleanup, data in TanStack Query in real code, pure helpers (like <code>pageRange</code>) separate and unit-tested.`,
        `In system design, drive the structure (requirements → tree → API → state → performance → a11y/i18n → testing → deployment), propose defaults with trade-offs, and offer the interviewer a choice of deep dives.`,
        `Practise with a timer: build the autocomplete, feed, tabs, modal, star rating and pagination from a blank Vite project in 45 minutes each, then review against the checklist.`,
        `Answer theory questions with definition, mechanism, a concrete example, and the common misconception; that four-part shape works from fresher to architect.`
      ],
      lab: [
        `Add a <code>/api/search</code> endpoint to your FastAPI backend (or an MSW handler in the browser) that filters a list of 1,000 names by prefix and randomly delays 100-1,200 ms. Build the <code>Autocomplete</code> from scratch with a 45-minute timer, narrating aloud or recording yourself.`,
        `In the browser's Network tab with throttling enabled, type quickly and confirm earlier requests show as cancelled and the list never shows results for an older term. Navigate the list with the keyboard and test with a screen reader (NVDA, VoiceOver or Narrator).`,
        `Write the two Testing Library tests, including the race test with a delayed handler. Then deliberately remove the <code>controller.abort()</code> cleanup and the <code>aborted</code> check, and confirm the race test fails.`,
        `Add <code>/api/feed</code> with cursor pagination (keyset query over <code>(created_at, id)</code>) and build the infinite <code>Feed</code>; then rebuild it with <code>useInfiniteQuery</code> and add the optimistic like.`,
        `Do a 45-minute mock system-design session for "design a news feed" (or "design a chat app") with a friend or by recording yourself, following the eight-part framework and drawing the component tree and state map.`,
        `<b>Done when:</b> the autocomplete passes both tests (and fails the race test without the abort), works fully by keyboard with correct screen-reader announcements, the feed loads pages without duplicates or double requests, and you can explain all of it in under five minutes.`
      ],
      teach: `<p>"Frontend interviews have four kinds of rounds: fundamentals, machine coding, system design for senior roles, and behavioural. For machine coding I use the same seven steps every time: clarify the requirements, write down the minimal state and what's derived, sketch the component tree, get the happy path working, then handle edge cases, accessibility and tests.</p>
<p>Take autocomplete. I keep the input controlled and debounce the <i>value</i>, not the handler. The fetch runs in an effect keyed on the debounced term, and the cleanup aborts the previous request. That's the key point, because debouncing alone doesn't stop a slow old response from overwriting a newer one. For accessibility it's the combobox pattern: <code>role="combobox"</code> on the input, a listbox with options, and <code>aria-activedescendant</code> so focus stays in the input while the arrow keys move a virtual highlight.</p>
<p>Infinite scroll is a sentinel element watched by an IntersectionObserver with a generous root margin, cursor pagination from the API, a ref to stop double-loading, and virtualisation when the list gets long.</p>
<p>For system design I walk through requirements, the component tree, the data model and API, where each kind of state lives, performance, accessibility and i18n, testing, and deployment. At each step I state the trade-off I'm making and ask the interviewer where to go deeper. They're grading the reasoning more than the final diagram."</p>`
    }
  ],
  quiz: [
    {
      q: `Interview follow-up on your autocomplete: "There is no AbortController here. The user types <code>re</code>, waits 350 ms, then types <code>a</code>. The <code>re</code> request takes 900 ms, the <code>rea</code> request takes 100 ms. What does the user see at the end, and how do you fix it?"`,
      code: `useEffect(() => {
  if (term.length < 2) return;
  fetch("/api/search?q=" + encodeURIComponent(term))
    .then((r) => r.json() as Promise<Suggestion[]>)
    .then((data) => setResults(data));
}, [term]);`,
      lang: "tsx",
      ans: `They briefly see the "rea" results, then they are replaced by the stale "re" results, which stay on screen.`,
      why: `Both requests are in flight; the responses resolve in the order the network delivers them, and the last <code>setResults</code> wins. Debouncing reduced the number of requests but did not make them ordered. Fix: create an <code>AbortController</code> in the effect and abort it in the cleanup (or use an <code>ignore</code> flag set in the cleanup), so when <code>term</code> changes React cancels the old request before starting the new one. Also handle <code>!r.ok</code> and ignore the <code>AbortError</code>. With TanStack Query the query key <code>["search", term]</code> keeps results per term, so the stale response is stored under its own key and never displayed for the new term.`
    },
    {
      q: `Follow-up on your infinite feed: "In the Network tab I can see <code>/api/feed?cursor=abc</code> requested twice and some posts appear twice. Find the bug."`,
      code: `const loadMore = useCallback(async () => {
  if (status === "loading" || !hasMore) return;
  setStatus("loading");
  const page = await fetchFeed(cursor);
  setPosts((prev) => [...prev, ...page.items]);
  setCursor(page.nextCursor);
  setHasMore(page.nextCursor !== null);
  setStatus("idle");
}, [cursor, hasMore, status]);`,
      lang: "tsx",
      ans: `The guard reads <code>status</code> from the render that created the callback, so two observer callbacks before the re-render both pass the check; and there is no de-duplication.`,
      why: `<code>setStatus("loading")</code> does not change the <code>status</code> variable in the current closure; it schedules a render. IntersectionObserver can fire twice in quick succession (for example on <code>observe()</code> and again after a layout shift, or an old and a new observer during re-creation), and both calls see <code>"idle"</code>. Use a ref (<code>inFlight.current</code>) that is set synchronously, de-duplicate items by id when appending, and add error handling with <code>try/finally</code> so the guard is always released. <code>useInfiniteQuery</code> deduplicates concurrent <code>fetchNextPage</code> calls for you.`
    },
    {
      q: `Interviewer, during the todo round: "Delete the first todo." Each row renders <code>&lt;input defaultValue={todo.text} /&gt;</code> for inline editing and uses <code>key={index}</code>. What happens on screen?`,
      code: `{todos.map((todo, index) => (
  <li key={index}>
    <input defaultValue={todo.text} />
    <button onClick={() => remove(todo.id)}>Delete</button>
  </li>
))}`,
      lang: "tsx",
      ans: `The last row disappears visually and the first row still shows the deleted todo's text: the inputs show the wrong values.`,
      why: `After deletion, the remaining items get indexes 0..n-2. React matches by key, so it keeps the DOM inputs for keys 0..n-2 and removes key n-1 (the last row). Uncontrolled inputs keep their DOM value (<code>defaultValue</code> only applies on mount), so row 0 still displays the deleted text. With controlled inputs the values would be right but any local state or focus would still shift. Fix: <code>key={todo.id}</code> with a stable id from creation (<code>crypto.randomUUID()</code>).`
    },
    {
      q: `System-design follow-up: "After each deploy, some users get a blank screen and Sentry shows <code>TypeError: Failed to fetch dynamically imported module: /assets/OrdersPage-3fa1c2.js</code>. Why, and what do you change?"`,
      ans: `Users with an older <code>index.html</code> (an open tab or a cached copy) request lazy chunks from the previous build that no longer exist on the server.`,
      why: `Chunk names are content hashes; a deploy produces new names and, if the old <code>dist/</code> is replaced, the old chunks 404 (or, with a careless SPA fallback, return <code>index.html</code> as HTML). Fixes: serve <code>index.html</code> with <code>Cache-Control: no-cache</code>; keep the previous releases' assets available for a while (CDN or object storage, or copy them forward in the image); under <code>/assets/</code> use <code>try_files $uri =404</code>; and on chunk-load failure (Vite's <code>vite:preloadError</code> event, or a <code>lazy()</code> wrapper catching the import error) reload the page once, guarding against reload loops with a <code>sessionStorage</code> flag. Wrap lazy routes in an error boundary with a "new version available, reload" message.`
    },
    {
      q: `Architecture follow-up: "Your team sets <code>VITE_API_URL</code> and <code>VITE_SENTRY_DSN</code> in <code>.env.staging</code> and <code>.env.production</code> and builds two Docker images. The platform team asks you to promote one image from staging to production instead. What do you change, and is anything in those files secret?"`,
      ans: `Move per-environment values to runtime config (<code>/config.js</code> generated at container start, read through a typed config module) and build once; and nothing in a frontend env file can be secret.`,
      why: `<code>import.meta.env.VITE_*</code> is replaced with literals during <code>vite build</code>, so each image is tied to one environment and the tested artifact is not the deployed one. Instead, the nginx entrypoint writes <code>window.__APP_CONFIG__</code> from container environment variables into <code>/config.js</code>, loaded by a classic script before the bundle and served <code>no-store</code>. Keep build-time variables only for things that belong to the code version (app version, commit SHA for Sentry releases). Even simpler for the API URL: put FastAPI behind the same origin at <code>/api</code> and drop the variable entirely. A Sentry DSN is designed to be public; anything genuinely secret must live in FastAPI or CI.`
    },
    {
      q: `Fundamentals follow-up: "Your tooltip component measures its anchor with <code>getBoundingClientRect()</code> in <code>useEffect</code> and then sets its position. Users see it flash in the top-left corner for a frame. What would you change, and what is the cost?"`,
      code: `function Tooltip({ anchor, text }: { anchor: HTMLElement; text: string }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    const r = anchor.getBoundingClientRect();
    setPos({ top: r.bottom + 8, left: r.left });
  }, [anchor]);
  return <div className="tooltip" style={{ position: "fixed", ...pos }}>{text}</div>;
}`,
      lang: "tsx",
      ans: `Use <code>useLayoutEffect</code>, so the measurement and the re-render with the correct position happen before the browser paints.`,
      why: `<code>useEffect</code> usually runs after paint, so the first frame shows the tooltip at <code>{0, 0}</code>; the corrected render arrives a frame later. <code>useLayoutEffect</code> runs after DOM mutation but before paint, and a state update inside it is processed synchronously, so the user only ever sees the final position. The cost: it blocks painting, so keep the work small, and it does not run during server rendering. Production alternatives: CSS anchor positioning where supported, or a positioning library such as Floating UI (which also handles flipping and scrolling).`
    }
  ]
}
]});
