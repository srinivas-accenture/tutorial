/* Week 1: React foundations — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js.
   The week revision sheet is built from each day's "rev" bullets. */
JSC.registerWeek({w:1,days:[
/* ===== Day 1 ===== */
{
  n: 1,
  title: "Why React, and your first app",
  goal: `<b>By the end of today</b> you can explain why React exists (UI as a function of state, components, element trees and diffing) without repeating the "virtual DOM is faster" myth, place React correctly next to Next.js, Vue, Svelte and Angular, and run a Vite + TypeScript React app whose JSX you can compile in your head, whose StrictMode double-renders you understand, and whose <code>/api</code> calls reach a FastAPI backend on port 8000 without a CORS error.`,
  rev: [
    `<b>UI = f(state).</b> You describe what the screen should look like for the current state; React works out which DOM operations get from the old screen to the new one. Imperative code (vanilla DOM) describes the <i>steps</i>; declarative code describes the <i>result</i>. Bugs from forgetting to update one part of the DOM disappear because every render recomputes the whole description.`,
    `<b>Elements, not "a faster DOM".</b> JSX compiles to <code>jsx(type, props, key)</code> calls (automatic runtime, <code>react/jsx-runtime</code>) that return plain, immutable objects: <code>{ $$typeof, type, key, props }</code>. React compares the new element tree with what it rendered last time (reconciliation) and commits only the differences. The "virtual DOM" is that tree of objects; its value is a declarative programming model with good-enough performance, not beating hand-written DOM code.`,
    `<b>Library, not framework.</b> React handles components, state and rendering. Routing, data fetching, forms, build tooling and server rendering come from the ecosystem or from a framework built on React (Next.js, React Router v7 framework mode). Vue and Angular ship more built in; Svelte compiles components away; Angular is a full framework. React 19 is the current major line.`,
    `<b>Vite setup:</b> <code>npm create vite@latest my-app -- --template react-ts</code>; <code>npm run dev</code> (dev server on 5173, native ESM, Fast Refresh), <code>npm run build</code> (<code>tsc -b</code> type-check, then a production bundle in <code>dist/</code>), <code>npm run preview</code> (serve <code>dist/</code> locally). Vite does not type-check during dev; the build script and your editor do. Create React App is deprecated; do not start new projects with it.`,
    `<b>StrictMode, env vars, proxy.</b> In development only, <code>&lt;StrictMode&gt;</code> renders components twice, runs effects setup → cleanup → setup, and double-invokes state initialisers/updaters to expose impure code. Client env vars are <code>import.meta.env.VITE_*</code>, inlined at build time and visible to anyone, so never secrets; <code>process.env</code> does not exist in browser code. <code>server.proxy</code> in <code>vite.config.ts</code> forwards <code>/api</code> to <code>http://localhost:8000</code> so the browser sees one origin and CORS never triggers in dev.`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d1-why-react",
      title: "What React solves: declarative UI, components and the virtual DOM",
      lv: ["fresher", "mid", "senior", "architect"],
      eli5: `<p>Imagine you are directing a play, and the stage crew can only follow step-by-step orders: "move the chair two metres left", "turn off lamp 3", "hand the actor the red hat". For a short scene this is fine. For a three-hour play with fifty actors, you will eventually forget an order, and the actor ends up wearing the red hat in a scene where it should be blue. That is building a web page with plain DOM code: <b>you</b> must remember every change, in the right order, forever.</p>
<p>React lets you work like a set designer instead. For each moment of the play you hand over a <b>photograph of how the stage should look</b>. A clever stage manager compares the new photo with the stage as it is right now and moves only what is different: the chair, not the whole set. You never write "move the chair"; you just draw the chair in its new place.</p>
<p>The photographs are built from reusable <b>pieces</b> ("a chair", "a table with two chairs", "the kitchen scene"), just like LEGO. In React those pieces are <b>components</b>. And the photo is not the real stage; it is a cheap sketch on paper. Comparing two sketches is quick, and only then does the crew touch the heavy furniture. That sketch is what people call the <b>virtual DOM</b>.</p>
<p>The trick is not that the stage manager moves furniture faster than a good crew with perfect orders. The trick is that <b>you</b> stop writing orders, so you stop making ordering mistakes.</p>`,
      what: `<p><b>React</b> is a JavaScript library for building user interfaces out of <b>components</b>: functions that take inputs (<b>props</b>) and their own remembered values (<b>state</b>) and return a description of the UI. When state changes, React calls the affected components again, gets a new description, compares it with the previous one, and applies the minimum set of changes to the real DOM. The whole model fits in one line: <code>UI = f(state)</code>.</p>
<h5>Imperative vs declarative</h5>
<ul class="pts">
<li><b>Imperative</b> code says <i>how</i>: "create an <code>&lt;li&gt;</code>, set its text, append it to the list, update the counter span, clear the input, and if the list was empty hide the empty-state message". Every event handler must know every place in the DOM that depends on the data it changed.</li>
<li><b>Declarative</b> code says <i>what</i>: "given these todos, the screen is a list with one item per todo, a counter showing <code>todos.length</code>, and an empty message if there are none". Event handlers only change the data. Rendering is derived, so it cannot drift out of sync.</li>
<li>The number of transitions between UI states grows much faster than the number of states. Imperative code has to handle transitions (n states can mean up to n×(n-1) edges); declarative code handles states (n descriptions). That is the core reason React scales to large UIs and big teams.</li>
</ul>
<h5>Components</h5>
<ul class="pts">
<li>A component is a <b>function that returns JSX</b>: <code>function TodoList({ todos }: Props) { return &lt;ul&gt;…&lt;/ul&gt; }</code>. Names start with a capital letter so JSX can tell <code>&lt;TodoList /&gt;</code> (your component) from <code>&lt;ul&gt;</code> (a DOM tag).</li>
<li>Components <b>compose</b>: an <code>App</code> renders a <code>Header</code>, a <code>TodoForm</code> and a <code>TodoList</code>; the list renders many <code>TodoItem</code>s. The UI becomes a tree you can reason about piece by piece. (Day 2 covers props, children and composition in depth.)</li>
<li>Components must be <b>pure during rendering</b>: same props and state in, same JSX out, no side effects such as mutating outside variables or calling <code>fetch</code> in the function body. Side effects go in event handlers or effects (Day 5). Purity is what lets React render a component twice, pause a render, or throw one away.</li>
<li>State lives inside components via hooks such as <code>useState</code> (Day 3). Changing state is the <i>only</i> way to ask React to update the screen.</li>
</ul>
<h5>Elements and the "virtual DOM"</h5>
<ul class="pts">
<li>JSX like <code>&lt;h1 className="title"&gt;Hello&lt;/h1&gt;</code> compiles to a function call that returns a <b>React element</b>: a plain, frozen (in development) JavaScript object such as <code>{ $$typeof: Symbol(react.transitional.element), type: "h1", key: null, props: { className: "title", children: "Hello" } }</code>. It is a <i>description</i>, not a DOM node, and creating one is cheap.</li>
<li>For a component element, <code>type</code> is the function itself (<code>type: TodoList</code>). Creating <code>&lt;TodoList /&gt;</code> does <b>not</b> call <code>TodoList</code>; React calls it later, when it renders that part of the tree.</li>
<li>"Virtual DOM" is an informal name for this tree of element objects (plus React's internal bookkeeping, the <b>fiber</b> tree). The React docs barely use the term today; they talk about <b>rendering</b> (calling components to get elements) and <b>committing</b> (applying the differences to the DOM). Day 4 covers render and commit; Day 12 covers fibers.</li>
<li><b>Reconciliation</b> is the comparison step. React uses heuristics, not a general tree diff: if an element at the same position has the same <code>type</code> (and <code>key</code>), React keeps the existing DOM node and component state and only updates changed props; if the type differs, it throws away that whole subtree and builds a new one. Keys identify items in lists so reordering does not confuse identity (Day 2 and Day 4).</li>
</ul>
<h5>What the virtual DOM is <i>not</i></h5>
<ul class="pts">
<li>It is <b>not faster than the DOM</b>. It is extra work on top of the DOM: build objects, compare them, then do the DOM operations you would have done by hand. Carefully written imperative code is always at least as fast. React's claim is that the declarative model gives you <i>good enough</i> performance by default, and lets you optimise the hot spots (Day 11).</li>
<li>It is <b>not a copy of the whole DOM</b> kept in sync. It is the output of your components, and React only re-renders the subtree under the component whose state changed.</li>
<li>It is <b>not the only way</b> to be declarative. Svelte compiles components into direct DOM update code; Solid and Angular's signals track fine-grained dependencies so only the exact text node that depends on a value is updated. Vue uses a virtual DOM optimised by its template compiler.</li>
</ul>
<h5>Library vs framework, and where React sits</h5>
<ul class="pts">
<li>A <b>library</b> is code you call; a <b>framework</b> calls your code and decides the structure (routing, data loading, build, server). React on its own is a library: it renders components and manages their state. It does not include a router, an HTTP client, a form system or a build tool. You can mount it into one <code>&lt;div&gt;</code> of an existing server-rendered page.</li>
<li>That said, React does "call your code" (it decides when to render your components), and modern React includes features that need a framework to be fully used (Server Components, Server Functions: Day 13). So "React is a library" is true but incomplete; the React docs recommend starting new full apps with a framework, while a Vite single-page app (what this course builds) remains a fully supported choice, especially behind a separate API such as FastAPI.</li>
<li><b>Next.js</b>: a framework <i>built on</i> React (routing by folders, server rendering, Server Components, deployment conventions). Not a competitor; it uses React. <b>React Router v7</b> can also act as a framework ("framework mode", the successor to Remix).</li>
<li><b>Vue</b>: a progressive framework with HTML-like templates, reactive state (refs, proxies) and an official router and store; uses a compiler-optimised virtual DOM. <b>Svelte</b>: a compiler; components compile to imperative DOM code, no runtime virtual DOM, reactivity via "runes" in Svelte 5. <b>Angular</b>: a full, opinionated framework from Google (DI, router, forms, HTTP client, CLI), TypeScript first, moving to signals for change detection.</li>
<li><b>React Native</b> uses the same component model but renders to native mobile views instead of the DOM; <code>react</code> (components, hooks, reconciliation) is separate from the <b>renderer</b> (<code>react-dom</code>, React Native). That split is why you import <code>createRoot</code> from <code>react-dom/client</code>, not from <code>react</code>.</li>
</ul>
<h5>Versions</h5>
<p>React 19 is the current major version; minor releases (19.1, 19.2, …) have added features without breaking changes. React 19 brought Actions (<code>useActionState</code>, <code>useOptimistic</code>, <code>useFormStatus</code>), the <code>use</code> API, <code>ref</code> as a regular prop, <code>&lt;Context&gt;</code> as a provider, and document metadata tags. The <b>React Compiler</b>, which memoises components automatically at build time, is a separate, opt-in build plugin (Day 11). Exact feature availability depends on the minor version you install, so check the release notes for your version rather than trusting a blog post.</p>`,
      why: `<p>Before React (2013), the common approaches were hand-written DOM manipulation, jQuery, and two-way-binding frameworks such as AngularJS and Backbone views. The pain they shared was <b>keeping the DOM in sync with data</b>.</p>
<ul class="pts">
<li><b>jQuery-style code</b> scattered DOM updates across event handlers. Add a feature ("show unread count in the tab title") and you had to find every handler that changes unread messages and add a line to each. Miss one and the UI lies. Facebook's famous example was the chat unread-count badge that kept showing the wrong number.</li>
<li><b>Two-way binding</b> (AngularJS 1.x) synced models and views automatically, but changes could cascade in both directions (a watcher updates a model that triggers another watcher), making data flow hard to trace in big apps, and its dirty-checking got slow with many bindings.</li>
<li><b>String templates</b> (re-render the HTML string and set <code>innerHTML</code>) were declarative but destroyed and recreated DOM nodes, losing focus, cursor position, scroll position and input values, and were slow and unsafe (XSS) if you were careless.</li>
</ul>
<p>React's bet was: <b>re-render everything conceptually, but only touch the DOM where something actually changed</b>. You get the simplicity of "just re-render the template" with none of the lost-focus problems, because unchanged DOM nodes are kept. Add <b>one-way data flow</b> (data goes down as props, changes go up via callbacks) and <b>components as functions</b>, and large teams can work on separate parts of a UI without stepping on each other.</p>
<p>For you, building a React → FastAPI → Redis → PostgreSQL app, the payoff is concrete: when the <code>/api/todos</code> response arrives, you put it in state and the list, the counters, the empty-state message and the "clear completed" button all update correctly, because each of them is computed from that state rather than patched by hand.</p>`,
      diagram: {
        html: flow([
          ["Event", "click, input, fetch response", "w"],
          ["setState", "new state value", "w"],
          ["Render", "call components → new element tree", "g"],
          ["Reconcile", "compare with previous tree", "g"],
          ["Commit", "minimal DOM mutations", "g"],
          ["Browser paints", "user sees new UI", ""]
        ]) + lanes([
          ["Imperative (vanilla DOM)", ["Handler changes data", "Handler also creates/removes nodes", "Handler updates counter text", "Handler toggles empty message", "Forget one step → UI out of sync"]],
          ["Declarative (React)", ["Handler changes state only", "Component returns UI for that state", "React diffs old vs new elements", "React patches the DOM", "UI always derived from state"]]
        ]),
        steps: [
          `Something happens: the user clicks "Add", types in an input, or a <code>fetch('/api/todos')</code> to FastAPI resolves. Your event handler calls a state setter such as <code>setTodos(next)</code>. It does not touch the DOM.`,
          `React schedules a <b>render</b>: it calls the component that owns that state (and, by default, its children) again. Each call returns a fresh tree of element objects describing the UI for the new state.`,
          `React <b>reconciles</b>: walking the new tree against the previous one, same type at the same position means "update props on the existing node"; different type means "replace the subtree"; keys match list items across reorders.`,
          `React <b>commits</b>: it applies only the needed DOM operations (insert one <code>&lt;li&gt;</code>, change one text node) in a single synchronous batch, then runs effects. The input you were typing in keeps its focus because its DOM node was never replaced.`,
          `The browser paints. In the imperative column every handler must remember every dependent DOM update; in the declarative column the handler changes state and the rest is derived, which is why the declarative version stays correct as features are added.`
        ]
      },
      ex: [
        {
          t: "The imperative way: a vanilla JS todo list",
          lang: "js",
          code: `// index.html has: <form id="f"><input id="title" /><button>Add</button></form>
//                 <p id="count"></p> <p id="empty">Nothing to do!</p> <ul id="list"></ul>
const todos = [];
const form = document.getElementById('f');
const input = document.getElementById('title');
const list = document.getElementById('list');
const count = document.getElementById('count');
const empty = document.getElementById('empty');

function updateCount() {
  const open = todos.filter((t) => !t.done).length;
  count.textContent = open + ' open of ' + todos.length;
  empty.hidden = todos.length > 0;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const todo = { id: crypto.randomUUID(), title: input.value.trim(), done: false };
  if (!todo.title) return;
  todos.push(todo);

  // Step 1: build the DOM for the new item by hand
  const li = document.createElement('li');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.addEventListener('change', () => {
    todo.done = box.checked;
    li.style.textDecoration = todo.done ? 'line-through' : 'none';
    updateCount();                 // Step 2: remember to update the counter...
  });
  const del = document.createElement('button');
  del.textContent = 'Delete';
  del.addEventListener('click', () => {
    todos.splice(todos.indexOf(todo), 1);
    li.remove();
    updateCount();                 // ...here too...
  });
  li.append(box, ' ' + todo.title + ' ', del);
  list.append(li);

  input.value = '';
  updateCount();                   // ...and here. Forget one call and the UI lies.
});
updateCount();`,
          note: `<p>Count the places that must stay consistent: the <code>todos</code> array, each <code>&lt;li&gt;</code>, its strike-through style, the counter text, and the empty message. Every handler must update all of them. Now add "Clear completed", "Filter: active/done" and "load initial todos from <code>/api/todos</code>": each feature touches every handler. This is the problem React was built for.</p>`
        },
        {
          t: "The declarative way: the same feature in React",
          lang: "tsx",
          code: `// src/App.tsx
import { useState } from 'react';

type Todo = { id: string; title: string; done: boolean };

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');

  // Derived values: computed from state on every render, never stored separately
  const open = todos.filter((t) => !t.done).length;

  function add() {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTodos([...todos, { id: crypto.randomUUID(), title: trimmed, done: false }]);
    setTitle('');
  }

  function toggle(id: string) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <main>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <button>Add</button>
      </form>

      <p>{open} open of {todos.length}</p>
      {todos.length === 0 && <p>Nothing to do!</p>}

      <ul>
        {todos.map((t) => (
          <li key={t.id} style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} /> {t.title}{' '}
            <button type="button" onClick={() => remove(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}`,
          out: `Typing "Buy milk" and pressing Enter shows:
1 open of 1
[ ] Buy milk [Delete]
Ticking the box strikes it through and the counter becomes "0 open of 1".`,
          note: `<p>The handlers only change state; they never mention the counter, the empty message or any DOM node. The JSX is a function of <code>todos</code> and <code>title</code>, so adding a filter or "clear completed" means adding state and changing what is returned, not hunting through handlers. Do not worry yet about <code>useState</code>, keys or controlled inputs: Day 2 covers lists and keys, Day 3 covers state and forms.</p>`
        },
        {
          t: "What an element really is: log it",
          lang: "tsx",
          code: `// src/ElementDemo.tsx
import { createElement } from 'react';

function Badge({ label }: { label: string }) {
  console.log('Badge rendered');
  return <span className="badge">{label}</span>;
}

const fromJsx = <h1 className="title">Hello</h1>;
const fromCall = createElement('h1', { className: 'title' }, 'Hello');
const component = <Badge label="new" />;

console.log(fromJsx);
console.log(fromCall);
console.log(component.type === Badge, component.props);
console.log(Object.isFrozen(fromJsx)); // true in development builds

export default function ElementDemo() {
  return component; // only now, when React renders it, does Badge run
}`,
          out: `{ $$typeof: Symbol(react.transitional.element), type: 'h1', key: null,
  props: { className: 'title', children: 'Hello' }, _owner: null, _store: {…} }
{ $$typeof: Symbol(react.transitional.element), type: 'h1', key: null,
  props: { className: 'title', children: 'Hello' }, _owner: null, _store: {…} }
true { label: 'new' }
true
Badge rendered        <- only after ElementDemo is rendered on the page`,
          note: `<p>An element is a plain object: <code>type</code> (a string for DOM tags, the function for components), <code>key</code>, and <code>props</code> (with <code>children</code> inside props). Development builds add debug fields such as <code>_owner</code> and <code>_store</code>; the exact extra fields vary by version. In React 19 the <code>$$typeof</code> symbol is <code>react.transitional.element</code> (it was <code>react.element</code> before), and <code>ref</code> lives in <code>props</code>. Note that <code>"Badge rendered"</code> is not logged when <code>&lt;Badge /&gt;</code> is <i>created</i>, only when React renders it.</p>`
        },
        {
          t: "UI = f(state): one component, many states",
          lang: "tsx",
          code: `// src/OrderStatus.tsx
type Status = 'idle' | 'loading' | 'error' | 'shipped';

type Props = { status: Status; trackingCode?: string; onRetry: () => void };

// A pure function of its inputs: same props in, same elements out.
export function OrderStatus({ status, trackingCode, onRetry }: Props) {
  if (status === 'idle') return <p>Place an order to see its status.</p>;
  if (status === 'loading') return <p aria-busy="true">Checking with the server…</p>;
  if (status === 'error')
    return (
      <p role="alert">
        Could not load the order. <button onClick={onRetry}>Retry</button>
      </p>
    );
  return <p>Shipped! Tracking code: <code>{trackingCode}</code></p>;
}

// Usage: the parent only decides WHICH state we are in.
// <OrderStatus status="error" onRetry={refetch} />
// <OrderStatus status="shipped" trackingCode="ZX-1042" onRetry={refetch} />`,
          note: `<p>There is no code here that "hides the spinner and shows the error". Each state has exactly one description, and moving between states is React's job. Interviewers like this framing: <b>you enumerate states, not transitions</b>. Modelling status as a union type (rather than separate <code>isLoading</code>/<code>isError</code> booleans that can both be <code>true</code>) is a state-design habit Day 4 builds on.</p>`
        },
        {
          t: "Diffing in action: re-rendering does not recreate unchanged DOM",
          lang: "tsx",
          code: `// src/DiffDemo.tsx
import { useEffect, useRef, useState } from 'react';

export default function DiffDemo() {
  const [ticks, setTicks] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTicks((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Record the DOM node the first time, then compare on every commit
    if (!firstInput.current) firstInput.current = inputRef.current;
    console.log('same <input> node as the first render?', firstInput.current === inputRef.current);
  });

  return (
    <div>
      <p>Seconds: {ticks}</p>
      {/* Type here: your text and cursor survive every re-render */}
      <input ref={inputRef} placeholder="type while the clock ticks" />
    </div>
  );
}`,
          out: `same <input> node as the first render? true
same <input> node as the first render? true
same <input> node as the first render? true
... (once per second)`,
          note: `<p>The component re-renders every second and returns a brand-new element tree each time, yet the <code>&lt;input&gt;</code> DOM node is the same object, so focus, cursor position and typed text are preserved. Only the text node inside <code>&lt;p&gt;</code> changes. Open DevTools' Elements panel: only the number flashes. That is reconciliation: same type at the same position means "keep the node, update props". <code>useRef</code> and <code>useEffect</code> are covered on Day 5; here they are just instruments.</p>`
        },
        {
          t: "React as a library: mount a widget into an existing server-rendered page",
          lang: "tsx",
          code: `// src/widget.tsx: React owns ONE element; the rest of the page is plain HTML
// (for example, a Jinja2 template served by FastAPI) and React never touches it.
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

function LikeButton({ initial }: { initial: number }) {
  const [likes, setLikes] = useState(initial);
  return <button onClick={() => setLikes(likes + 1)}>Like ({likes})</button>;
}

// <div id="like-root" data-likes="41"></div> exists somewhere in the server HTML
const host = document.getElementById('like-root');
if (host) {
  createRoot(host).render(
    <StrictMode>
      <LikeButton initial={Number(host.dataset.likes ?? 0)} />
    </StrictMode>,
  );
}`,
          note: `<p>This is what "library" means in practice: you decide where React runs and how much of the page it owns. You can have several independent roots on one page. Teams migrating a legacy jQuery or server-rendered app usually start like this, one widget at a time. A framework such as Next.js inverts the relationship: it owns the routing, the HTML document and the server, and calls your components.</p>`
        },
        {
          t: "Composition: the todo app split into components",
          lang: "tsx",
          code: `// src/TodoApp.tsx
import { useState } from 'react';

type Todo = { id: string; title: string; done: boolean };

function Counter({ todos }: { todos: Todo[] }) {
  const open = todos.filter((t) => !t.done).length;
  return <p>{open} open of {todos.length}</p>;
}

function TodoItem({ todo, onToggle }: { todo: Todo; onToggle: (id: string) => void }) {
  return (
    <li>
      <label>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        {todo.title}
      </label>
    </li>
  );
}

function TodoList({ todos, onToggle }: { todos: Todo[]; onToggle: (id: string) => void }) {
  if (todos.length === 0) return <p>Nothing to do!</p>;
  return <ul>{todos.map((t) => <TodoItem key={t.id} todo={t} onToggle={onToggle} />)}</ul>;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', title: 'Read Day 1', done: true },
    { id: '2', title: 'Scaffold the Vite app', done: false },
  ]);
  const toggle = (id: string) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  // State lives in the closest common parent; children get data down, callbacks up.
  return (
    <section>
      <Counter todos={todos} />
      <TodoList todos={todos} onToggle={toggle} />
    </section>
  );
}`,
          out: `1 open of 2
[x] Read Day 1
[ ] Scaffold the Vite app`,
          note: `<p>This is <b>one-way data flow</b>: <code>TodoApp</code> owns the state; <code>Counter</code> and <code>TodoList</code> receive it as props; <code>TodoItem</code> reports a change by calling <code>onToggle</code>, and the owner updates state. Because <code>Counter</code> derives its numbers from the same array, it can never disagree with the list. Day 2 covers props and composition; Day 4 covers where state should live.</p>`
        }
      ],
      internals: `<p>Here is what React actually does with the todo app, at the level of detail you need on Day 1. Days 4 and 12 go deeper.</p>
<h5>1. JSX becomes element objects</h5>
<p>The compiler turns each JSX tag into a call such as <code>jsx("li", { children: … }, t.id)</code>. At runtime that call returns an element object. Elements are immutable descriptions; you never change one, you produce new ones on the next render. They are cheap: a few properties, no DOM access.</p>
<h5>2. The <code>$$typeof</code> field is a security feature</h5>
<p>React refuses to render an object as an element unless its <code>$$typeof</code> is the expected <code>Symbol</code>. JSON cannot contain Symbols, so if an attacker gets a server to return <code>{"type":"script","props":{…}}</code> and your code accidentally renders that object, React throws instead of treating it as an element. Text in JSX (<code>{todo.title}</code>) is always inserted as a text node, never parsed as HTML, which is why React apps are XSS-resistant by default (until someone uses <code>dangerouslySetInnerHTML</code>, Day 2).</p>
<h5>3. Packages: <code>react</code> vs <code>react-dom</code></h5>
<p><code>react</code> contains the element factory, hooks and the public API; it knows nothing about the DOM. The reconciler and scheduler live inside the <b>renderer</b> package: <code>react-dom</code> for browsers, React Native for mobile, and others (three.js via react-three-fiber, terminals via Ink). <code>createRoot</code> comes from <code>react-dom/client</code> because creating a root means "attach this reconciler to that DOM container". This split is why the same mental model works on many platforms.</p>
<h5>4. Fibers: React's working copy</h5>
<p>Elements are thrown away after every render, so React needs a persistent structure to remember things between renders: which DOM node belongs to which component, the state of each <code>useState</code> call, pending effects. That structure is the <b>fiber tree</b>: one fiber object per component instance or host element, linked as child/sibling/return pointers. On each update React builds a work-in-progress version of the tree by comparing new elements with existing fibers. When people say "virtual DOM", the fiber tree is the closest real thing. State is stored on the fiber, not in your function, which is why your component function can be called again and still "remember" values.</p>
<h5>5. Reconciliation heuristics</h5>
<ul class="pts">
<li>A general algorithm for the minimum edit between two trees is roughly O(n³). React makes it O(n) with two assumptions: elements of <b>different types</b> produce different trees (so it replaces rather than diffs them), and <b>keys</b> mark which children are the same across renders.</li>
<li>Consequence 1: changing <code>&lt;div&gt;</code> to <code>&lt;section&gt;</code> around a form, or switching between two different component types at the same spot, unmounts everything inside and <b>resets its state</b>.</li>
<li>Consequence 2: using array indexes as keys in a list that can be reordered or filtered makes React reuse the wrong items' state (checked boxes appear to "jump"). Day 2 and Day 4 show this live.</li>
</ul>
<h5>6. Render and commit are separate phases</h5>
<p>The <b>render phase</b> calls your components and computes differences; it touches no DOM, so React can do it twice (StrictMode), pause it, or discard it (concurrent rendering, Day 12). The <b>commit phase</b> applies DOM mutations synchronously, attaches refs, and then runs layout effects and (afterwards) normal effects. This separation is why render must be pure: React may run it without ever committing the result.</p>
<h5>7. Batching</h5>
<p>Several <code>setState</code> calls in the same event (or the same tick, in promises and timeouts too since React 18) are batched into one render. In the todo app, <code>setTodos(…)</code> and <code>setTitle('')</code> in <code>add()</code> produce a single re-render and a single commit, not two. Day 3 covers this.</p>`,
      prod: `<p>In a real React + FastAPI product, the declarative model shows its value and its sharp edges.</p>
<ul class="pts">
<li><b>Server data is state too.</b> The list of todos comes from <code>GET /api/todos</code> (FastAPI reads it from Redis or PostgreSQL). Once it is in React state (or, better, in a server-state cache such as TanStack Query, Day 7), every part of the UI derived from it stays consistent automatically. Teams that copy server data into several separate pieces of state recreate the jQuery sync problem; keep one source of truth and derive the rest.</li>
<li><b>Re-render cost is real but usually small.</b> React re-renders a component and its descendants when its state changes. For 99% of screens that is microseconds. It becomes a problem on huge lists (10,000 table rows), expensive calculations during render, or state placed too high (a top-level input that re-renders the whole app on each keystroke). The fixes (moving state down, memoisation, virtualisation) are on Day 11. Measure with the React DevTools Profiler before optimising.</li>
<li><b>React is not your whole architecture.</b> Because it is a library, a production app is React plus decisions: router (React Router v7, Day 8), server state (TanStack Query, Day 7), forms (React Hook Form + Zod, Day 9), styling, testing (Day 14), build and deployment (Day 15). Architects are often asked "why not Next.js?" A reasonable answer for an internal dashboard behind login with a Python API: a Vite SPA is simpler to host (static files on a CDN or nginx), SEO does not matter, and the backend team already owns FastAPI; a public, SEO-sensitive, content-heavy site is where server rendering (Day 13) earns its complexity.</li>
<li><b>Incremental adoption.</b> Many companies run React inside a legacy page (Django/Jinja templates, a PHP app) via several <code>createRoot</code> islands. It works, but each root is a separate tree: they cannot share context, so shared state must go through a store or the URL.</li>
<li><b>Upgrades.</b> React majors are rare and come with codemods and deprecation warnings in the previous minor. React 19 removed long-deprecated APIs (for example <code>ReactDOM.render</code>, string refs, <code>propTypes</code> checks on function components). An old tutorial using <code>ReactDOM.render(&lt;App /&gt;, el)</code> will not work on React 19; use <code>createRoot</code>.</li>
<li><b>What goes wrong at scale:</b> components that do side effects during render (fetching in the function body, mutating module-level arrays), giant "god components" with 20 <code>useState</code> calls, and state duplicated between components that drifts apart. All three violate <code>UI = f(state)</code>; the rest of this course is largely about not doing them.</li>
</ul>`,
      iq: [
        ["fresher", "What is React, and what does \"declarative\" mean?", `<p>React is a JavaScript library for building UIs from components. Declarative means you describe <b>what</b> the UI should look like for the current state (JSX returned from a component), and React figures out <b>how</b> to update the DOM to match. In imperative code you write the DOM operations yourself (<code>createElement</code>, <code>appendChild</code>, set <code>textContent</code>).</p><p>Avoid the vague answer "React makes things faster". The point is correctness and maintainability: the UI is derived from state, so it cannot drift out of sync.</p>`],
        ["fresher", "What is the virtual DOM? Is it faster than the real DOM?", `<p>It is an in-memory tree of plain JavaScript objects (React elements) describing the UI, plus React's internal fiber tree. On each update React builds a new element tree, compares it with the previous one (reconciliation) and applies only the differences to the real DOM.</p><p>It is <b>not</b> faster than the DOM: it is extra work on top of the DOM operations. The tempting answer "the DOM is slow so React avoids it" is wrong; React still performs the same DOM updates in the end. Its benefit is that you get a declarative model with acceptable performance, and it avoids needless DOM work compared with naively re-rendering everything via <code>innerHTML</code>.</p>`],
        ["fresher", "What is a component? Why must its name start with a capital letter?", `<p>A component is a JavaScript function that takes props and returns JSX (React elements). Components can render other components, so a UI becomes a tree of reusable pieces.</p><p>JSX uses the case of the tag to decide the element type: lowercase <code>&lt;button&gt;</code> compiles to the string <code>"button"</code> (a DOM tag); capitalised <code>&lt;Button&gt;</code> compiles to a reference to the variable <code>Button</code> (your function). A lowercase component name would be treated as an unknown HTML tag and React would warn.</p>`],
        ["mid", "Is React a library or a framework? Where does Next.js fit?", `<p>React itself is a library: it handles rendering components and their state. It has no built-in router, data-fetching layer, build tool or server. You can mount it into a single element of an existing page. Next.js is a <b>framework built on React</b>: it adds file-based routing, server rendering, Server Components, bundling and deployment conventions. React Router v7 in framework mode plays a similar role.</p><p>A nuanced answer earns points: React does invert control (it decides when to call your components), and modern features like Server Components need framework integration, so the React team recommends a framework for new full-stack apps; a Vite SPA is still a legitimate choice when you have a separate API (e.g. FastAPI) and do not need SSR.</p>`],
        ["mid", "What does a React element look like, and what is the difference between an element and a component?", `<p>An element is an immutable object like <code>{ $$typeof: Symbol(react.transitional.element), type: 'h1', key: null, props: { className: 'title', children: 'Hello' } }</code> (React 19 symbol name; dev builds add debug fields). It is the output of JSX.</p><p>A component is the function that <b>produces</b> elements. <code>&lt;Badge /&gt;</code> creates an element whose <code>type</code> is the <code>Badge</code> function; creating it does not call <code>Badge</code>. React calls the function when it renders that element. Candidates often say "JSX creates DOM nodes" or "JSX calls the component", both wrong.</p>`],
        ["mid", "How does React decide what to update in the DOM? What happens if you change the element type at the same position?", `<p>Reconciliation compares the new element tree with the previous fibers position by position. Same type (and same key) means: keep the DOM node and component instance (with its state), update changed props, recurse into children. Different type means: unmount the old subtree (destroying its DOM and state) and mount a new one. Keys identify children in lists.</p><p>So switching <code>&lt;div&gt;</code> to <code>&lt;section&gt;</code> around a form, or rendering <code>&lt;LoginForm /&gt;</code> vs <code>&lt;SignupForm /&gt;</code> at the same spot, resets everything inside, including typed input. This is a heuristic that makes diffing O(n) instead of the O(n³) general tree-edit problem.</p>`],
        ["mid", "Why must React components be pure during render?", `<p>Because React may call them more often than you expect: twice in StrictMode development, multiple times when a concurrent render is interrupted and restarted, or without committing the result at all. If rendering mutates outside variables, fetches data or writes to <code>localStorage</code>, those side effects run an unpredictable number of times.</p><p>Pure rendering (same props/state → same JSX, no side effects) is what lets React safely retry, pause and discard work. Side effects belong in event handlers (preferred) or <code>useEffect</code> (for syncing with external systems).</p>`],
        ["senior", "Compare React's rendering model with Svelte's and with signals-based frameworks (Solid, Angular signals). What are the trade-offs?", `<p><b>React</b> re-runs component functions on state change and diffs element trees: coarse-grained. Simple mental model (components are just functions of state, values are plain JS), excellent tooling and ecosystem, but unnecessary re-renders are possible and sometimes need memoisation (or the React Compiler).</p><p><b>Svelte</b> compiles components into code that updates exactly the affected DOM nodes; no runtime virtual DOM, small bundles, but more "compiler magic" and its reactivity rules live in the compiler (runes in Svelte 5). <b>Signals</b> (Solid, Angular, Vue's refs, Preact signals) track which computations read which values and update only those, so components run once and updates are fine-grained; the cost is a different mental model (reading a signal subscribes, destructuring can break reactivity).</p><p>A good senior answer avoids "X is faster": in real apps, network, bundle size and bad state design dominate. Choose based on team skills, ecosystem needs (React has the deepest), hiring and platform targets (React Native).</p>`],
        ["senior", "A colleague says 'React re-renders the whole page on every state change'. How do you correct them precisely?", `<p>React re-renders the component whose state changed <b>and its descendants</b> (unless a child is memoised and its props are unchanged, or the compiler skips it). Ancestors and siblings are not re-rendered. "Re-render" means calling the component functions and diffing elements, not recreating the DOM: the commit phase only touches nodes whose output changed.</p><p>So two things are wrong in the statement: the scope (subtree, not page) and the cost (function calls plus diff, not DOM rebuilds). Re-renders only matter for performance when the subtree is large or render is expensive; measure with the Profiler (Day 11).</p>`],
        ["architect", "Your company has a server-rendered Jinja2 app on FastAPI and wants to move to React. What adoption strategy do you propose?", `<p>Avoid a big-bang rewrite. Options in increasing commitment:</p><ul><li><b>Islands:</b> mount React widgets into existing pages with <code>createRoot</code> on specific elements, built by Vite with a manifest so FastAPI templates can include the right hashed bundles. Low risk, but separate roots cannot share context.</li><li><b>Strangler by route:</b> build new sections as a Vite SPA served under a path (e.g. <code>/app/*</code>), talking to FastAPI JSON endpoints under <code>/api</code> on the same origin via the reverse proxy; migrate pages one at a time.</li><li><b>Framework (Next.js or React Router framework mode)</b> only if SSR/SEO or streaming genuinely matters; it adds a Node server tier next to Python.</li></ul><p>Decide the API contract first (OpenAPI from FastAPI → generated TypeScript types), auth (httpOnly cookie sessions keep same-origin simple, Day 8) and a design system, so each migrated page is consistent. The wrong answer is "rewrite everything in Next.js" without considering hosting, team skills and the existing Python stack.</p>`]
      ],
      gotchas: [
        `<b>Creating an element does not render it.</b> <code>const el = &lt;Expensive /&gt;</code> is just an object; <code>Expensive</code> runs only if React renders <code>el</code>. Conversely, calling a component as a function (<code>{Expensive()}</code>) bypasses React: its hooks attach to the parent, which breaks the rules of hooks when used conditionally.`,
        `<b>Elements are frozen in development.</b> <code>el.props.title = 'x'</code> throws (or silently fails outside strict mode JS) because dev builds freeze elements and their props. To change an element, create a new one (or use <code>cloneElement</code>, rarely needed).`,
        `<b>The "virtual DOM is faster" myth</b> leads to bad decisions, like assuming React will make a slow page fast. A page that is slow because it renders 50,000 rows or makes 30 sequential API calls stays slow in React.`,
        `<b>Changing the wrapper type resets state.</b> Conditionally wrapping content (<code>{isCard ? &lt;Card&gt;{form}&lt;/Card&gt; : form}</code>) changes the tree shape, so the form's state is lost when <code>isCard</code> flips. Same position + same type is what preserves state.`,
        `<b>Text is escaped, attributes are not magically safe.</b> <code>{userInput}</code> in JSX is inserted as text (safe). But <code>&lt;a href={userInput}&gt;</code> with <code>javascript:alert(1)</code> is still dangerous; recent React versions warn about or block <code>javascript:</code> URLs, but validate URLs from users anyway.`,
        `<b>React only owns what is inside its root.</b> If jQuery or a third-party script mutates DOM nodes React rendered, the next commit may overwrite those changes or crash with "Failed to execute 'removeChild'". Give such libraries their own element via a ref and let them own it (Day 5).`,
        `<b>Old tutorials are everywhere.</b> Class components, <code>ReactDOM.render</code>, <code>import React from 'react'</code> in every file, Create React App and <code>propTypes</code> are legacy. React 19 removed several of these; if a snippet uses them, translate it to function components, <code>createRoot</code> and TypeScript types.`
      ],
      best: [
        `Think in <b>states, not transitions</b>: list the states a piece of UI can be in (idle, loading, error, success), model them explicitly (a union type), and write one description per state.`,
        `Keep a <b>single source of truth</b> and derive everything else during render (counts, filtered lists, "is form valid"). Never store a value in state that you can compute from other state or props.`,
        `Keep render <b>pure</b>: no fetching, no mutation of outside variables, no timers in the component body. Handle user actions in event handlers; sync with external systems in effects.`,
        `Split UI into <b>small components with clear props</b>; put state in the closest common parent of the components that need it; pass data down and callbacks up.`,
        `Learn the <b>React docs (react.dev)</b> mental model and vocabulary (render, commit, state as a snapshot, "you might not need an effect"). Interviewers increasingly use that vocabulary, and it replaces older class-era advice.`,
        `When choosing between React, a React framework, Vue, Svelte or Angular for a team, weigh <b>ecosystem, hiring, existing backend and rendering needs</b> over micro-benchmarks.`
      ],
      lab: [
        `Create a plain <code>vanilla.html</code> file (no build tool) with the vanilla todo list from the first example. Add a "Clear completed" button. Count how many places you had to edit and note any bug you hit (for example, the counter not updating).`,
        `In your Vite app (set it up in the next topic), replace <code>src/App.tsx</code> with the React todo list from the second example. Add the same "Clear completed" button: <code>setTodos(todos.filter((t) =&gt; !t.done))</code>. Compare the size of the change with the vanilla version.`,
        `Add <code>console.log(&lt;h1 className="x"&gt;Hi&lt;/h1&gt;)</code> and <code>console.log(&lt;App /&gt;)</code> at the bottom of <code>main.tsx</code>. Inspect both objects in the browser console: find <code>type</code>, <code>props</code>, <code>key</code> and <code>$$typeof</code>. Confirm <code>type</code> is a string in one and a function in the other.`,
        `Add the <code>DiffDemo</code> component, type into the input while the clock ticks, and open DevTools → Elements. Watch which nodes flash. Then change the <code>&lt;div&gt;</code> wrapper to render <code>{ticks % 2 === 0 ? &lt;div&gt;…&lt;/div&gt; : &lt;section&gt;…&lt;/section&gt;}</code> with the same children and watch your typed text disappear every second.`,
        `<b>Done when:</b> the React todo app adds, toggles, deletes and clears todos with a correct counter; you can point to <code>type</code>/<code>props</code> on a logged element; and you can explain, in one sentence each, why the input kept its text in the first <code>DiffDemo</code> and lost it after the <code>div</code>/<code>section</code> change.`
      ],
      teach: `<p>"React exists because keeping the screen in sync with data by hand does not scale. In plain JavaScript, every click handler has to remember every piece of the page that depends on the data it changed: add a todo, and you must also update the counter, the empty message and the filter. Forget one and the page lies.</p>
<p>React flips this around: <b>UI equals a function of state</b>. A component is a function that returns a description of what the screen should look like for the current state. Event handlers only change state. React then calls the component again, gets a new description, compares it with the old one and changes only the DOM nodes that differ.</p>
<p>Those descriptions are called elements: plain objects with a <code>type</code>, <code>props</code> and a <code>key</code>. JSX is just syntax for creating them. People call the tree of elements the virtual DOM, but it is not faster than the DOM; it is extra work that buys you a simple, declarative model while keeping DOM updates small.</p>
<p>React is a library: it renders components and nothing else. Routing, data fetching and server rendering come from the ecosystem or from frameworks built on React, like Next.js. Vue, Svelte and Angular solve the same problem with templates, compilers or signals; React's strengths are its simple 'components are functions' model and its huge ecosystem."</p>`
    },

    /* ------------------------------------------------------------------ */
    {
      id: "d1-setup",
      title: "Project setup: Vite, TypeScript, JSX compilation and StrictMode",
      lv: ["fresher", "mid", "senior", "lead"],
      eli5: `<p>Browsers only understand plain JavaScript, HTML and CSS. But you want to write TypeScript (JavaScript with type labels) and JSX (HTML-looking tags inside JavaScript). So you need a <b>kitchen</b> that takes your raw ingredients and turns them into something the browser can eat.</p>
<p><b>Vite</b> is that kitchen. While you are cooking (development), it serves each dish the moment you ask for it, freshly prepared, and when you change the recipe it swaps the plate on the table without clearing the whole table (that is "hot reloading": your page updates but keeps what you typed). When you are ready to open the restaurant (production), it packs everything into a few neat, small boxes in a <code>dist</code> folder.</p>
<p><b>StrictMode</b> is a strict food inspector who only visits during development. To check that your recipe gives the same dish every time, the inspector cooks it <b>twice</b>. If the two plates differ, something in your recipe has a hidden side effect. That is why you sometimes see a <code>console.log</code> printed twice: it is the inspector, not a bug in React. Customers (production users) never see the inspector.</p>
<p>And the <b>proxy</b> is a waiter. Your React app lives at one address (port 5173) and your FastAPI kitchen at another (port 8000). Browsers are suspicious of food from a different address, so the waiter carries orders from 5173 to 8000 for you, and the browser thinks everything came from one place.</p>`,
      what: `<p>A modern React project is your source code plus a <b>build tool</b> that compiles TypeScript and JSX, serves the app during development, and bundles it for production. The standard choice for a client-rendered React app is <b>Vite</b>. <b>Create React App (CRA) is deprecated</b>; the React team stopped recommending it and it is in maintenance mode, so treat it as legacy: you may meet it in old projects, but do not start new ones with it.</p>
<h5>Creating the app</h5>
<ul class="pts">
<li><code>npm create vite@latest my-app -- --template react-ts</code> scaffolds a React + TypeScript project. The <code>--</code> passes <code>--template</code> through npm to <code>create-vite</code>. Then <code>cd my-app</code>, <code>npm install</code>, <code>npm run dev</code>. Use a current LTS release of Node.js; recent Vite versions refuse to run on old Node versions and print the required range.</li>
<li>There is also <code>react-swc-ts</code>, which uses <code>@vitejs/plugin-react-swc</code> (SWC, a Rust compiler) instead of <code>@vitejs/plugin-react</code> (Babel-based for the React-specific transforms). Both are fine; the Babel plugin is needed if you want Babel plugins such as the React Compiler (Day 11). Exact defaults change between create-vite releases, so read the generated <code>vite.config.ts</code>.</li>
</ul>
<h5>The generated files</h5>
<ul class="pts">
<li><code>index.html</code>: the real entry point, at the project root (not in <code>public/</code>). It contains <code>&lt;div id="root"&gt;&lt;/div&gt;</code> and <code>&lt;script type="module" src="/src/main.tsx"&gt;</code>. Vite reads it, follows the imports, and rewrites the script tag to point at hashed bundles at build time.</li>
<li><code>src/main.tsx</code>: finds <code>#root</code>, calls <code>createRoot(…)</code> from <code>react-dom/client</code>, and renders <code>&lt;StrictMode&gt;&lt;App /&gt;&lt;/StrictMode&gt;</code>.</li>
<li><code>src/App.tsx</code>: the root component (the demo counter); <code>App.css</code> and <code>index.css</code>: plain CSS imported from TS (Vite injects it); <code>src/assets/</code>: files imported from code (they get hashed names); <code>public/</code>: files copied as-is and served from <code>/</code> (favicon, <code>robots.txt</code>).</li>
<li><code>vite.config.ts</code>: plugins (<code>react()</code>), dev server options (port, proxy), build options.</li>
<li><code>tsconfig.json</code> references <code>tsconfig.app.json</code> (your <code>src/</code> code: DOM types, <code>"jsx": "react-jsx"</code>, <code>strict</code>, <code>noEmit</code>, <code>moduleResolution: "bundler"</code>) and <code>tsconfig.node.json</code> (for <code>vite.config.ts</code>, which runs in Node). Two configs because the browser code and the config file run in different environments.</li>
<li>Type declarations for Vite's client features (<code>import.meta.env</code>, importing <code>.svg</code>/<code>.css</code>) come from <code>vite/client</code>: either a <code>src/vite-env.d.ts</code> with <code>/// &lt;reference types="vite/client" /&gt;</code> or a <code>"types": ["vite/client"]</code> entry in <code>tsconfig.app.json</code>, depending on the template version.</li>
<li><code>eslint.config.js</code>: ESLint flat config with <code>typescript-eslint</code>, <code>eslint-plugin-react-hooks</code> and <code>eslint-plugin-react-refresh</code>.</li>
</ul>
<h5>npm scripts</h5>
<ul class="pts">
<li><code>npm run dev</code> → <code>vite</code>: dev server at <code>http://localhost:5173</code>. Serves source files as native ES modules, transforming each on request; pre-bundles dependencies from <code>node_modules</code>; <b>Fast Refresh</b> swaps edited components in place while preserving their state.</li>
<li><code>npm run build</code> → <code>tsc -b &amp;&amp; vite build</code>: first a full TypeScript type-check (build mode over the referenced projects, emitting nothing), then a production bundle into <code>dist/</code>: minified, tree-shaken, code-split, hashed filenames, <code>process.env.NODE_ENV</code>-style dev checks removed so React runs its production build.</li>
<li><code>npm run preview</code> → <code>vite preview</code>: serves the built <code>dist/</code> locally (port 4173) so you can test the production build. It is not a production server; in production, <code>dist/</code> is static files behind nginx, a CDN, or FastAPI's <code>StaticFiles</code> (Day 15).</li>
<li><code>npm run lint</code> → <code>eslint .</code>.</li>
</ul>
<h5>How JSX is compiled (automatic runtime)</h5>
<ul class="pts">
<li>With <code>"jsx": "react-jsx"</code> (TypeScript) or the React plugin's default, JSX uses the <b>automatic runtime</b>: the compiler inserts <code>import { jsx, jsxs } from "react/jsx-runtime"</code> and turns <code>&lt;h1 className="t"&gt;Hi&lt;/h1&gt;</code> into <code>jsx("h1", { className: "t", children: "Hi" })</code>. <code>jsxs</code> is used when there are several static children (passed as an array). In development, <code>jsxDEV</code> from <code>react/jsx-dev-runtime</code> is used and also receives source location for better warnings.</li>
<li><code>key</code> is passed as a separate argument, not inside props: <code>jsx(TodoItem, { todo: t }, t.id)</code>. That is why a component cannot read <code>props.key</code>.</li>
<li>The old <b>classic runtime</b> compiled to <code>React.createElement(type, props, ...children)</code>, which is why old code had <code>import React from 'react'</code> at the top of every file. With the automatic runtime that import is unnecessary.</li>
<li>Vite's dev transform only <b>strips</b> TypeScript types; it does not type-check. Type errors show in your editor and in <code>npm run build</code> (<code>tsc -b</code>), not in the browser. Many teams also run <code>tsc -b</code> in CI or a pre-commit hook.</li>
</ul>
<h5><code>createRoot</code> and <code>StrictMode</code></h5>
<ul class="pts">
<li><code>createRoot(container)</code> creates a React root attached to a DOM node and returns an object with <code>render(element)</code> and <code>unmount()</code>. It replaced the legacy <code>ReactDOM.render</code> (removed in React 19) and enables concurrent features. For server-rendered HTML you would use <code>hydrateRoot</code> instead (Day 13).</li>
<li><code>&lt;StrictMode&gt;</code> enables extra <b>development-only</b> checks for its subtree. It: (1) calls your component functions <b>twice</b> per render (and initialiser/updater functions passed to <code>useState</code>, <code>useReducer</code>, <code>useMemo</code>) and discards one result, to surface impure render code; (2) on mount, runs every effect's setup, then its cleanup, then setup again, to surface effects with missing cleanup (Day 5); (3) similarly re-runs ref callbacks (React 19); (4) warns about deprecated APIs. None of this happens in a production build.</li>
<li>React DevTools greys out logs from the second render by default (configurable), and React 18+ no longer silences them as React 17 did, so you will see doubled logs. That is expected, not a bug, and removing <code>StrictMode</code> to "fix" it hides real bugs.</li>
</ul>
<h5>Tooling</h5>
<ul class="pts">
<li><b>React DevTools</b> (browser extension for Chrome, Firefox and Edge): a <b>Components</b> tab showing the component tree with props, state and hooks (editable live), the owner chain, and "highlight updates when components render"; a <b>Profiler</b> tab for recording renders and timings (Day 11).</li>
<li><b>ESLint</b> with <code>eslint-plugin-react-hooks</code>: <code>rules-of-hooks</code> (error: hooks only at the top level of components and custom hooks) and <code>exhaustive-deps</code> (warn: effect/memo dependency arrays must list what they use). Recent versions of the plugin also ship rules derived from the React Compiler; which rules are in the preset depends on the plugin version. <code>eslint-plugin-react-refresh</code> warns when a file exports non-components alongside components, which breaks Fast Refresh.</li>
</ul>
<h5>Environment variables</h5>
<ul class="pts">
<li>Vite loads <code>.env</code>, <code>.env.local</code>, <code>.env.[mode]</code>, <code>.env.[mode].local</code> (mode is <code>development</code> for <code>dev</code>, <code>production</code> for <code>build</code>, or <code>--mode staging</code>). Only variables prefixed <code>VITE_</code> are exposed to client code, as <code>import.meta.env.VITE_API_URL</code>. Built-ins: <code>import.meta.env.MODE</code>, <code>DEV</code>, <code>PROD</code>, <code>BASE_URL</code>, <code>SSR</code>.</li>
<li>Values are <b>replaced statically at build time</b> and end up as plain strings in the JavaScript bundle. Anyone can read them in DevTools. <b>Never put secrets</b> (API keys with spending power, database URLs, JWT signing keys) in <code>VITE_*</code> variables. Secrets belong in FastAPI's environment.</li>
<li><code>process.env</code> is a Node.js object; it does not exist in the browser and Vite does not polyfill it for your code. <code>process.env.REACT_APP_X</code> is CRA convention and is <code>undefined</code> or a <code>ReferenceError</code> in Vite.</li>
</ul>
<h5>Dev proxy to FastAPI</h5>
<p>Your app runs on <code>http://localhost:5173</code> and FastAPI on <code>http://localhost:8000</code>: different ports are different <b>origins</b>, so a direct <code>fetch('http://localhost:8000/api/todos')</code> triggers CORS checks. Setting <code>server.proxy</code> in <code>vite.config.ts</code> makes the Vite dev server forward <code>/api/*</code> to port 8000. The browser only ever talks to 5173 (same origin), so no CORS, and your code uses relative URLs (<code>fetch('/api/todos')</code>) that also work in production when nginx serves the app and proxies <code>/api</code> to FastAPI on the same domain.</p>`,
      why: `<p>Browsers cannot run JSX or TypeScript, and shipping hundreds of separate source files to users is slow. You need compilation and bundling. For years React's answer was <b>Create React App</b>: a webpack-based setup hidden behind <code>react-scripts</code>. It made starting easy but became slow (cold starts of tens of seconds on big apps, slow rebuilds), hard to customise without "ejecting", and fell behind on maintenance. The React team deprecated it, pointing to frameworks or build tools such as Vite.</p>
<p><b>Vite</b> fixed the dev-loop problem by not bundling in development at all: modern browsers support ES modules natively, so Vite serves each file on demand, compiled by a very fast native-code transformer, and only pre-bundles dependencies once. Startup is near-instant and edits appear in milliseconds. Production still gets a fully optimised bundle.</p>
<p><b>TypeScript</b> exists because large React codebases pass a lot of data through props; types catch "this component expected <code>todo.title</code> but got <code>todo.name</code>" at compile time instead of in production. <b>The automatic JSX runtime</b> exists to remove the <code>import React</code> boilerplate and allow future optimisations in how elements are created. <b>StrictMode</b> exists because concurrent rendering (Day 12) assumes pure components and cleaned-up effects; the double invocation makes those bugs visible on your machine instead of as rare production glitches. The <b>dev proxy</b> exists because the browser's same-origin policy makes split frontend/backend dev servers awkward, and configuring permissive CORS just for development tends to leak into production.</p>`,
      diagram: {
        html: flow([
          ["index.html", "script type=module → /src/main.tsx", ""],
          ["Vite dev server :5173", "transform TSX on request, strip types", "g"],
          ["JSX → jsx() calls", "react/jsx-runtime (automatic)", "g"],
          ["main.tsx", "createRoot(#root).render(StrictMode → App)", "w"],
          ["Browser", "DOM + React DevTools", ""],
          ["fetch('/api/todos')", "Vite proxy → FastAPI :8000", "w"]
        ], { v: false }) + lanes([
          ["npm run dev", ["vite: native ESM, no bundle", "Fast Refresh keeps state", "No type-check (editor does it)", "StrictMode double renders ON", "server.proxy active"]],
          ["npm run build", ["tsc -b: type-check, fails on errors", "vite build: bundle, minify, hash", "VITE_* vars inlined as strings", "React production build", "Output: dist/"]],
          ["npm run preview", ["Serves dist/ on :4173", "Test the real bundle locally", "Not a production server", "Deploy dist/ to nginx/CDN (Day 15)"]]
        ]),
        steps: [
          `<code>npm run dev</code> starts Vite on port 5173. The browser requests <code>/</code>; Vite serves <code>index.html</code>, which loads <code>/src/main.tsx</code> as an ES module.`,
          `For each requested <code>.tsx</code> file, Vite strips the types and compiles JSX to <code>jsxDEV(...)</code> calls imported from <code>react/jsx-dev-runtime</code>, injects Fast Refresh hooks, and rewrites bare imports like <code>react</code> to pre-bundled files. No type-checking happens here.`,
          `<code>main.tsx</code> runs: <code>createRoot(document.getElementById('root')!)</code> attaches React to the empty div, and <code>render(&lt;StrictMode&gt;&lt;App /&gt;&lt;/StrictMode&gt;)</code> renders the tree. StrictMode renders each component twice and runs effects setup → cleanup → setup (development only).`,
          `The app calls <code>fetch('/api/todos')</code>. The request goes to 5173 (same origin, no CORS); the proxy rule for <code>/api</code> forwards it to <code>http://localhost:8000/api/todos</code>, where FastAPI answers from Redis or PostgreSQL.`,
          `When you edit <code>App.tsx</code>, Vite pushes the new module over a WebSocket and Fast Refresh re-renders the component in place, keeping its state. For release, <code>npm run build</code> type-checks, bundles to <code>dist/</code>, inlines <code>VITE_*</code> variables, and <code>npm run preview</code> lets you test that output.`
        ]
      },
      ex: [
        {
          t: "Scaffold, install and run",
          lang: "sh",
          code: `node --version                     # use a current LTS release
npm create vite@latest todo-web -- --template react-ts
cd todo-web
npm install
npm run dev

# other scripts
npm run build      # tsc -b && vite build  -> dist/
npm run preview    # serve dist/ on http://localhost:4173
npm run lint       # eslint .`,
          out: `  VITE v… ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help`,
          note: `<p>Depending on the create-vite version, the scaffolder may ask a few interactive questions (or offer to install and start for you). <code>--host</code> exposes the dev server on your LAN (useful to test on a phone; also needed inside Docker). The version number and timing will differ on your machine.</p>`
        },
        {
          t: "The generated project tree",
          lang: "text",
          code: `todo-web/
├── index.html              <- entry point: <div id="root"> + <script type="module" src="/src/main.tsx">
├── package.json            <- scripts and dependencies (react, react-dom, vite, typescript, eslint…)
├── vite.config.ts          <- plugins, dev server, proxy, build options
├── tsconfig.json           <- "references" to the two configs below
├── tsconfig.app.json       <- src/: DOM lib, jsx: react-jsx, strict, noEmit
├── tsconfig.node.json      <- vite.config.ts: runs in Node
├── eslint.config.js        <- flat config: typescript-eslint, react-hooks, react-refresh
├── public/
│   └── vite.svg            <- copied as-is, served at /vite.svg
└── src/
    ├── main.tsx            <- createRoot + StrictMode
    ├── App.tsx             <- root component
    ├── App.css
    ├── index.css
    ├── assets/react.svg    <- imported from code -> hashed URL in the build
    └── vite-env.d.ts       <- /// <reference types="vite/client" /> (older templates;
                               newer ones use "types": ["vite/client"] in tsconfig.app.json)`,
          note: `<p>The exact file list varies slightly between create-vite versions; what matters is the role of each file. In a real project you will add <code>src/features/…</code>, <code>src/api/…</code> and so on (Day 15 covers project structure).</p>`
        },
        {
          t: "package.json: the scripts",
          lang: "json",
          code: `{
  "name": "todo-web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}`,
          note: `<p><code>"type": "module"</code> makes <code>.js</code> config files (such as <code>eslint.config.js</code>) ES modules. The real file also lists <code>dependencies</code> (<code>react</code>, <code>react-dom</code>) and <code>devDependencies</code> (<code>vite</code>, <code>@vitejs/plugin-react</code>, <code>typescript</code>, <code>@types/react</code>, <code>@types/react-dom</code>, ESLint packages). Note that <code>build</code> runs <code>tsc -b</code> first: if types are wrong, no bundle is produced.</p>`
        },
        {
          t: "tsconfig.app.json essentials (abridged)",
          lang: "json",
          code: `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}`,
          note: `<p><code>noEmit</code>: TypeScript only checks; Vite produces the JavaScript. <code>"jsx": "react-jsx"</code> selects the automatic runtime. <code>verbatimModuleSyntax</code> means type-only imports must be written <code>import type { Todo } from './types'</code>, because the transpiler removes or keeps imports file by file without type information. Exact targets and flags (for example <code>erasableSyntaxOnly</code>, which forbids <code>enum</code>) vary by template version; the generated file also includes a few more options and may contain comments (tsconfig files accept them, unlike <code>package.json</code>).</p>`
        },
        {
          t: "main.tsx and a minimal App.tsx",
          lang: "tsx",
          code: `// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// The "!" tells TypeScript we are sure #root exists (index.html contains it).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// src/App.tsx
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <main>
      <h1>Todo web</h1>
      <p>Mode: {import.meta.env.MODE}</p>
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count} times</button>
    </main>
  );
}`,
          out: `Todo web
Mode: development
[Clicked 0 times]`,
          note: `<p>No <code>import React from 'react'</code> is needed: the automatic runtime imports what it needs. Importing <code>./App.tsx</code> with the extension is allowed because of <code>allowImportingTsExtensions</code> (Vite resolves it either way). Edit the <code>&lt;h1&gt;</code> text after clicking a few times: Fast Refresh updates the heading and the count stays where it was.</p>`
        },
        {
          t: "What JSX compiles to (automatic runtime)",
          lang: "js",
          code: `// INPUT (TodoItem.tsx)
// function TodoItem({ todo }) {
//   return (
//     <li className={todo.done ? 'done' : ''}>
//       <input type="checkbox" checked={todo.done} readOnly />
//       {todo.title}
//     </li>
//   );
// }
// const list = todos.map((t) => <TodoItem key={t.id} todo={t} />);

// OUTPUT (production transform, types removed)
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';

function TodoItem({ todo }) {
  return _jsxs('li', {                       // jsxs: several static children
    className: todo.done ? 'done' : '',
    children: [
      _jsx('input', { type: 'checkbox', checked: todo.done, readOnly: true }),
      todo.title,
    ],
  });
}
const list = todos.map((t) => _jsx(TodoItem, { todo: t }, t.id)); // key = 3rd argument

// OLD classic runtime, for comparison (needed "import React" in every file):
// React.createElement('li', { className: ... }, React.createElement('input', {...}), todo.title)`,
          note: `<p>Three things to notice. Children go <b>inside props</b> as <code>children</code> (a single value or an array). The <b>key</b> is a separate argument, so it never reaches your component's props. Lowercase tags become strings; capitalised tags become variable references (<code>TodoItem</code>). In development the call is <code>jsxDEV(type, props, key, isStaticChildren, source, self)</code> from <code>react/jsx-dev-runtime</code>, with extra debug information. You can paste JSX into the Babel REPL or the TypeScript playground (with <code>jsx: react-jsx</code>) to see this yourself.</p>`
        },
        {
          t: "StrictMode: why your log runs twice (and what it catches)",
          lang: "tsx",
          code: `// src/StrictDemo.tsx
import { useEffect, useState } from 'react';

let renderCount = 0;          // module-level variable: mutating it during render is impure
const visited: string[] = [];

export default function StrictDemo() {
  renderCount++;                              // BUG: side effect during render
  visited.push('render');                     // BUG: mutating shared state during render
  console.log('render #' + renderCount);

  const [items] = useState(() => {
    console.log('initialiser runs');          // also double-invoked in dev
    return ['a', 'b'];
  });

  useEffect(() => {
    console.log('effect setup: subscribe');
    return () => console.log('effect cleanup: unsubscribe');
  }, []);

  return <p>{items.join(', ')} (renders so far: {visited.length})</p>;
}`,
          out: `npm run dev, first load (abridged; React DevTools greys out the extra logs):
render #1
initialiser runs        (logged more than once in dev)
render #2
effect setup: subscribe
effect cleanup: unsubscribe
effect setup: subscribe

npm run build && npm run preview:
render #1
initialiser runs
effect setup: subscribe`,
          note: `<p>In development StrictMode calls the component (and the <code>useState</code> initialiser) an extra time and keeps one result, then simulates an unmount/remount of effects. Pure code behaves identically either way; the impure module-level counter advances twice per render in dev, revealing the bug. The effect sequence proves the cleanup works: if you forgot it, you would see two live subscriptions. The exact order of interleaved logs can vary slightly between React versions. Day 5 covers effects and cleanup properly.</p>`
        },
        {
          t: "vite.config.ts: dev proxy to FastAPI on port 8000",
          lang: "ts",
          code: `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Any request starting with /api is forwarded to FastAPI.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Only if FastAPI routes do NOT start with /api (e.g. @app.get("/todos")):
        // rewrite: (path) => path.replace(/^\\/api/, ''),
      },
    },
  },
});`,
          note: `<p>The browser calls <code>http://localhost:5173/api/todos</code>; Vite forwards it to <code>http://localhost:8000/api/todos</code>. <code>changeOrigin</code> sets the <code>Host</code> header to the target. If your FastAPI app mounts routes under <code>/api</code> (for example <code>app.include_router(router, prefix="/api")</code>), no rewrite is needed and production nginx can use the same paths. The proxy only exists in the Vite dev server (and <code>vite preview</code>); it is not part of <code>dist/</code>.</p>`
        },
        {
          t: "Calling the API through the proxy, with a typed env var",
          lang: "tsx",
          code: `// .env                 (committed: non-secret defaults)
// VITE_API_BASE=/api
// .env.production.local (not committed; *.local is in .gitignore)
// VITE_API_BASE=https://api.example.com/api

// src/vite-env.d.ts (or any .d.ts included by tsconfig.app.json)
// interface ImportMetaEnv { readonly VITE_API_BASE: string }
// interface ImportMeta { readonly env: ImportMetaEnv }

// src/HealthCheck.tsx
import { useEffect, useState } from 'react';

type Health = { status: string; db: string; cache: string };

const API = import.meta.env.VITE_API_BASE ?? '/api';

export default function HealthCheck() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch(API + '/health')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json() as Promise<Health>;
      })
      .then((data) => { if (!ignore) setHealth(data); })
      .catch((e: unknown) => { if (!ignore) setError(String(e)); });
    return () => { ignore = true; };   // StrictMode's extra cleanup makes this matter
  }, []);

  if (error) return <p role="alert">API down: {error}</p>;
  if (!health) return <p>Checking API…</p>;
  return <p>API {health.status}, Postgres {health.db}, Redis {health.cache}</p>;
}`,
          out: `Checking API…
API ok, Postgres ok, Redis ok

(Network tab: GET http://localhost:5173/api/health 200, sent twice in dev
 because StrictMode runs the effect twice; the first result is ignored.)`,
          note: `<p>The matching FastAPI endpoint might be <code>@app.get("/api/health")</code> returning <code>{"status": "ok", "db": "ok", "cache": "ok"}</code> after pinging PostgreSQL and Redis. The <code>ignore</code> flag is the standard pattern for avoiding race conditions in fetch effects (Day 7 replaces this with TanStack Query). <code>VITE_API_BASE</code> is not a secret: it is visible in the built JavaScript, which is fine for a URL.</p>`
        },
        {
          t: "ESLint flat config with the React hooks plugin",
          lang: "js",
          code: `// eslint.config.js (similar to what create-vite generates; check your version's file)
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      'react-hooks/rules-of-hooks': 'error',     // hooks only at top level
      'react-hooks/exhaustive-deps': 'warn',     // complete dependency arrays
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);`,
          out: `$ npm run lint
src/Broken.tsx   (a file where useState was placed inside an if)
  12:5  error  React Hook "useState" is called conditionally.
               React Hooks must be called in the exact same order in every component render
               react-hooks/rules-of-hooks`,
          note: `<p>The generated config may use the plugin's preset (for example <code>reactHooks.configs['recommended-latest']</code> or a newer flat preset name) instead of listing rules; preset names have changed between plugin versions, which is why listing the two core rules explicitly is the most portable form. Newer plugin versions add compiler-derived rules (for example flagging impure code during render); enable them when your team is ready. Treat <code>rules-of-hooks</code> errors as build-breaking in CI.</p>`
        },
        {
          t: "Running the FastAPI side for the proxy",
          lang: "sh",
          code: `# terminal 1: backend (from the FastAPI project)
uvicorn app.main:app --reload --port 8000

# terminal 2: frontend
npm run dev

# check the proxy without the browser
curl -i http://localhost:5173/api/health
curl -i http://localhost:8000/api/health   # same response, straight from FastAPI`,
          out: `HTTP/1.1 200 OK
content-type: application/json
...
{"status":"ok","db":"ok","cache":"ok"}`,
          note: `<p>If the first <code>curl</code> returns Vite's <code>index.html</code> or a 404, the proxy key does not match the path. If it returns <code>502</code>/<code>ECONNREFUSED</code> in the Vite terminal, FastAPI is not running on 8000 (or is bound to a different host; inside Docker, <code>localhost</code> means the container itself, so target the service name, e.g. <code>http://api:8000</code>).</p>`
        }
      ],
      internals: `<h5>Vite in development</h5>
<p>Vite runs a Node HTTP server with a plugin pipeline. When the browser requests <code>/src/App.tsx</code>, Vite reads the file, runs it through the transform chain (TypeScript stripping and JSX compilation by a fast native transformer, plus the React plugin's Fast Refresh instrumentation) and returns JavaScript with <code>Content-Type: text/javascript</code>. Bare imports such as <code>import { useState } from 'react'</code> are rewritten to URLs of <b>pre-bundled</b> dependencies (CommonJS packages converted to ESM and many small files merged once, then cached in <code>node_modules/.vite</code>). That is why the first start after installing a package may say "optimizing dependencies" and later starts are instant.</p>
<h5>Fast Refresh</h5>
<p>The React plugin wraps each module so it registers its components with React's refresh runtime. When you save a file, Vite's HMR sends the new module over a WebSocket; if the module only exports components, React swaps the function implementations and re-renders them <b>keeping hook state</b>, as long as the hook order did not change. If the file also exports non-component values (constants, helpers, contexts), the boundary cannot be safely hot-swapped and Vite falls back to reloading the importers or the whole page, losing state; <code>eslint-plugin-react-refresh</code> warns about this.</p>
<h5>Vite in production</h5>
<p><code>vite build</code> bundles with a Rollup-compatible bundler (Rollup historically; newer Vite versions are moving to the Rust-based Rolldown), tree-shakes unused exports, minifies, splits code at dynamic <code>import()</code>s, emits content-hashed filenames (<code>assets/index-4f9c1a.js</code>) so they can be cached forever, and rewrites <code>index.html</code> to reference them. It replaces <code>import.meta.env.*</code> with literal values and sets the production mode so <code>react</code> and <code>react-dom</code> resolve to their production builds (no dev warnings, no double rendering, no <code>jsxDEV</code>).</p>
<h5>The JSX runtime</h5>
<p><code>react/jsx-runtime</code> exports <code>jsx</code>, <code>jsxs</code> and <code>Fragment</code>. Both functions build the element object; <code>jsxs</code> marks the children array as static so React does not warn about missing keys for children you wrote literally in JSX (keys are only needed for arrays you create dynamically, e.g. with <code>map</code>). The dev variant <code>jsxDEV</code> records the source location and owner for component stacks in warnings and DevTools. Because the import is injected by the compiler, the TypeScript setting <code>jsx</code> and the bundler's JSX setting must agree; a mismatch produces errors like "React is not defined" (classic runtime expected <code>React</code> in scope).</p>
<h5>What <code>createRoot</code> does</h5>
<p><code>createRoot(container)</code> creates a <b>FiberRoot</b> (the root's bookkeeping object) and a root fiber, marks the container, and installs React's event listeners on the <b>root container</b> (React uses event delegation: one listener per event type on the root, not one per element; Day 3). <code>root.render(&lt;App /&gt;)</code> schedules an update on the root; React renders the tree into fibers, builds the DOM nodes off-screen, and appends them into the container in the commit phase. Calling <code>render</code> again with new elements reconciles against the existing tree; <code>root.unmount()</code> tears everything down and runs cleanups.</p>
<h5>How StrictMode double-invokes</h5>
<p>StrictMode sets a flag on the fibers in its subtree. In development builds, when React renders such a fiber it calls the component function a second time (with console methods marked so DevTools can dim the second call's logs) and uses one result. During mount it runs passive and layout effects, then immediately runs their cleanups and runs them again, simulating the component being unmounted and remounted, which is exactly what will happen with future features that preserve state while hiding UI (for example the <code>&lt;Activity&gt;</code> component in newer React 19 releases). In React 19, during the double render <code>useMemo</code> and <code>useCallback</code> reuse the first call's result. Production builds contain none of this code.</p>
<h5>How the proxy works</h5>
<p>Vite's <code>server.proxy</code> is backed by an HTTP proxy middleware in the dev server. For a request matching <code>/api</code>, the dev server opens its own server-side connection to <code>localhost:8000</code>, copies the method, headers and body, and streams the response back. CORS is a <b>browser</b> rule about cross-origin responses; a server-to-server request is not subject to it, and the browser only sees a same-origin response from 5173. WebSockets can be proxied with <code>ws: true</code>.</p>`,
      prod: `<ul class="pts">
<li><b>Same-origin in production too.</b> The dev proxy mirrors the production layout most teams want: nginx (or a CDN plus a load balancer) serves <code>dist/</code> at <code>https://app.example.com/</code> and forwards <code>/api/</code> to the FastAPI service. Same origin means no CORS preflights, and httpOnly session cookies just work (Day 8). If the frontend and API must live on different domains, configure FastAPI's <code>CORSMiddleware</code> with an explicit list of origins, never <code>allow_origins=["*"]</code> with credentials.</li>
<li><b>SPA fallback.</b> Client-side routes such as <code>/todos/42</code> do not exist as files in <code>dist/</code>. The production server must return <code>index.html</code> for unknown non-API paths (nginx <code>try_files $uri /index.html;</code>), otherwise a page refresh gives a 404. The Vite dev server does this automatically, so the bug only appears after deployment.</li>
<li><b>Env vars are baked in.</b> <code>VITE_*</code> values are inlined at <b>build</b> time, so one <code>dist/</code> cannot be promoted from staging to production with different values. Teams either build once per environment, or use relative URLs (<code>/api</code>) so no per-environment value is needed, or load a small <code>/config.json</code> at startup for runtime config. And a secret in a <code>VITE_</code> variable is a leaked secret: it is in a public JavaScript file. Keys for OpenAI, Stripe secret keys or database credentials belong behind FastAPI.</li>
<li><b>Type-check in CI.</b> Because the dev server does not type-check, broken types can sit unnoticed until <code>npm run build</code>. Run <code>npm run build</code> (or <code>tsc -b</code>) and <code>npm run lint</code> in CI on every pull request.</li>
<li><b>Caching.</b> Hashed asset files can be cached for a year (<code>Cache-Control: public, max-age=31536000, immutable</code>); <code>index.html</code> must not be cached long (<code>no-cache</code>), or users keep loading old bundle names after a deploy.</li>
<li><b>Source maps and monitoring.</b> Production stack traces are minified. Generate source maps (<code>build.sourcemap</code>) and upload them to your error tracker (e.g. Sentry) instead of serving them publicly if you do not want your source visible (Day 15).</li>
<li><b>StrictMode stays on.</b> It costs nothing in production. Teams that remove it because "the API gets called twice in dev" are hiding effect bugs that will reappear as race conditions. Fix the effect (cleanup, ignore flag) or move data fetching to TanStack Query (Day 7).</li>
<li><b>Migrating from CRA.</b> Typical steps: move <code>public/index.html</code> to the root and add the module script; rename <code>REACT_APP_*</code> to <code>VITE_*</code> and <code>process.env</code> to <code>import.meta.env</code>; replace <code>%PUBLIC_URL%</code>; move the <code>proxy</code> field of <code>package.json</code> to <code>server.proxy</code>; replace Jest with Vitest if desired (Day 14).</li>
</ul>`,
      iq: [
        ["fresher", "How do you create a new React app today? Why not Create React App?", `<p>For a client-rendered app: <code>npm create vite@latest my-app -- --template react-ts</code>, then <code>npm install</code> and <code>npm run dev</code>. For a full-stack app with server rendering, a framework such as Next.js or React Router (framework mode).</p><p>CRA is deprecated: it was slow (webpack-based dev server), hard to configure without ejecting and no longer actively developed. Saying "CRA is the official way" is an outdated answer that interviewers notice.</p>`],
        ["fresher", "What does JSX compile to?", `<p>With the automatic runtime, to calls of <code>jsx</code>/<code>jsxs</code> imported from <code>react/jsx-runtime</code>: <code>&lt;h1 className="t"&gt;Hi&lt;/h1&gt;</code> becomes <code>jsx("h1", { className: "t", children: "Hi" })</code>, which returns a plain element object. With the classic runtime it was <code>React.createElement("h1", { className: "t" }, "Hi")</code>, which is why old files needed <code>import React</code>.</p><p>JSX is not HTML and is not a template string; it is syntax sugar for function calls, so it can be assigned to variables, returned and passed as props.</p>`],
        ["fresher", "Why does my console.log in a component print twice?", `<p>Because the app is wrapped in <code>&lt;StrictMode&gt;</code> and running in development. StrictMode intentionally calls component functions twice (and runs effects setup → cleanup → setup on mount) to reveal impure rendering and missing effect cleanup. It does not happen in production builds.</p><p>The wrong fix is deleting <code>&lt;StrictMode&gt;</code>; the right response is to make sure render is pure and effects clean up after themselves.</p>`],
        ["mid", "What are the three main npm scripts in a Vite project and what does each do?", `<p><code>dev</code> runs the Vite dev server (native ESM, on-demand transforms, Fast Refresh, proxy). <code>build</code> runs <code>tsc -b</code> to type-check and then <code>vite build</code> to produce an optimised bundle in <code>dist/</code> (minified, tree-shaken, hashed, env vars inlined). <code>preview</code> serves <code>dist/</code> locally to test the production build.</p><p>Key detail: Vite does not type-check in dev; esbuild-style transforms just strip types. If you skip <code>tsc</code> in the build or CI, type errors can ship. And <code>preview</code> is not a production server.</p>`],
        ["mid", "How do environment variables work in Vite? Can I put my API key there?", `<p>Vite loads <code>.env</code>, <code>.env.local</code>, <code>.env.[mode]</code> and <code>.env.[mode].local</code>, and exposes only variables prefixed <code>VITE_</code> as <code>import.meta.env.VITE_X</code>. They are replaced at build time with string literals in the bundle. <code>process.env</code> is not available in browser code.</p><p>So no secrets: anything in a <code>VITE_</code> variable is readable by every user in the downloaded JavaScript. Keep secret keys on the FastAPI side and have the frontend call your API, which calls the third party. The non-prefixed variables in <code>.env</code> are not exposed, which is the point of the prefix.</p>`],
        ["mid", "Your React app on localhost:5173 gets a CORS error calling FastAPI on localhost:8000. How do you fix it in development, and what about production?", `<p>In development, add a proxy in <code>vite.config.ts</code>: <code>server.proxy['/api'] = { target: 'http://localhost:8000', changeOrigin: true }</code> and call relative URLs (<code>fetch('/api/todos')</code>). The browser sees one origin; the dev server forwards the request server-to-server, where CORS does not apply.</p><p>In production, ideally serve the SPA and the API from the same origin (nginx serves <code>dist/</code> and proxies <code>/api</code>). If they must be cross-origin, configure FastAPI's <code>CORSMiddleware</code> with explicit origins. Disabling CORS in the browser or using <code>allow_origins=["*"]</code> with credentials are wrong answers: one does not work for users, the other is rejected by browsers or unsafe.</p>`],
        ["mid", "What is the difference between createRoot and the old ReactDOM.render?", `<p><code>createRoot(container)</code> (from <code>react-dom/client</code>, React 18+) returns a root object; you call <code>root.render(&lt;App /&gt;)</code> and later <code>root.unmount()</code>. It enables concurrent rendering features and automatic batching everywhere. <code>ReactDOM.render(&lt;App /&gt;, container)</code> was the legacy API that ran React in legacy (synchronous) mode; it was deprecated in 18 and removed in React 19. For server-rendered HTML you use <code>hydrateRoot</code> instead (Day 13).</p>`],
        ["senior", "Exactly what does StrictMode double-invoke, and why does each check exist?", `<p>In development only: (1) component function bodies, and functions passed to <code>useState</code>, <code>useReducer</code> and <code>useMemo</code> (initialisers, reducers, updaters) are called twice, to catch impure render logic; (2) every effect runs setup, cleanup, setup on mount, to catch effects that do not clean up (duplicate subscriptions, leaked timers, double-POSTs); (3) ref callbacks are run an extra time (React 19); (4) deprecated API usage is warned about.</p><p>The reason is forward compatibility: concurrent rendering may render a component and discard it, and features that preserve state for hidden UI unmount/remount effects. Code that survives StrictMode survives those. Note it does <b>not</b> double-invoke event handlers, so a non-idempotent POST in a click handler is fine; a POST in an effect is the smell.</p>`],
        ["senior", "Why does a Vite + TypeScript project have tsconfig.json, tsconfig.app.json and tsconfig.node.json?", `<p>They describe two different environments. <code>tsconfig.app.json</code> covers <code>src/</code>: browser code with <code>DOM</code> types, JSX, <code>vite/client</code> types. <code>tsconfig.node.json</code> covers <code>vite.config.ts</code>, which runs in Node and needs Node types but not DOM types. <code>tsconfig.json</code> is a solution file with <code>references</code> to both, and <code>tsc -b</code> builds/checks each project. This prevents browser code from accidentally using Node APIs (and vice versa) type-wise.</p>`],
        ["lead", "What would you put in place for a new team's React + Vite + FastAPI repo on day one?", `<p>Vite <code>react-ts</code> template with <code>strict</code> TypeScript; ESLint with <code>react-hooks</code> rules as errors in CI and Prettier for formatting; CI running <code>npm ci</code>, <code>lint</code>, <code>tsc -b</code>, tests (Vitest, Day 14) and <code>build</code> on every PR; a <code>/api</code> dev proxy and relative API URLs so dev matches production's same-origin layout; <code>.env</code> for non-secret defaults, <code>.env*.local</code> git-ignored, a typed <code>ImportMetaEnv</code>; API types generated from FastAPI's OpenAPI schema; StrictMode on; an <code>.nvmrc</code> or <code>engines</code> field pinning the Node version; and a decision record for router, server state and styling. The aim is to make the right thing the default so reviews focus on product code.</p>`],
        ["architect", "The ops team wants to build the frontend once and deploy the same artifact to staging and production, but Vite inlines env vars at build time. How do you design runtime configuration?", `<p>Options: (1) avoid environment-specific values entirely with relative URLs (<code>/api</code>) and same-origin deployment, which covers most cases; (2) serve a small <code>/config.json</code> (or a <code>window.__CONFIG__</code> script generated by the container entrypoint or by FastAPI) and load it before rendering, typed and validated (e.g. with Zod); (3) template placeholders replaced at container start (fragile with hashed, minified files). Option 1 or 2 is preferred; keep secrets out of all of them because anything the browser receives is public. Rebuilding per environment is acceptable but breaks "what you tested is what you ship".</p>`]
      ],
      gotchas: [
        `<b><code>process.env</code> is undefined in Vite.</b> It is a Node global. Use <code>import.meta.env.VITE_X</code>. A variable without the <code>VITE_</code> prefix is silently <code>undefined</code> on the client, and you must restart the dev server after editing <code>.env</code> files.`,
        `<b>All env values are strings.</b> <code>VITE_FEATURE_X=false</code> gives the string <code>"false"</code>, which is truthy. Compare explicitly: <code>import.meta.env.VITE_FEATURE_X === 'true'</code>.`,
        `<b>The dev server does not type-check.</b> The page runs fine with type errors; <code>npm run build</code> then fails. Keep the editor's TypeScript errors visible and run <code>tsc -b</code> in CI.`,
        `<b>StrictMode double effects mean double requests in dev.</b> A <code>useEffect</code> that POSTs (e.g. "mark notification read") will fire twice in development. That is StrictMode telling you the effect is not safe to re-run; such actions usually belong in an event handler.`,
        `<b>The proxy only exists in dev (and preview).</b> Code that works on 5173 can fail after deployment if production does not proxy <code>/api</code> the same way. Also, FastAPI's automatic trailing-slash redirect (<code>/api/todos</code> → <code>/api/todos/</code>) can return an absolute <code>Location</code> pointing at port 8000, sending the browser around the proxy; match the trailing slash exactly.`,
        `<b>Inside Docker, <code>localhost</code> is the container.</b> A proxy target of <code>http://localhost:8000</code> in a containerised Vite dev server points at itself. Use the Compose service name (<code>http://api:8000</code>) and run Vite with <code>--host</code>.`,
        `<b>Mixed exports break Fast Refresh.</b> A file exporting both a component and a constant or context object makes Vite reload the page and lose state. Move non-component exports to their own module.`,
        `<b><code>verbatimModuleSyntax</code> requires <code>import type</code></b> for type-only imports. <code>import { Todo } from './types'</code> where <code>Todo</code> is a type causes a TypeScript error in this template; write <code>import type { Todo } from './types'</code>.`
      ],
      best: [
        `Start new SPAs with <b>Vite's <code>react-ts</code> template</b> and keep <code>strict: true</code>; do not use Create React App for new work.`,
        `Keep <b><code>&lt;StrictMode&gt;</code></b> enabled and fix what it reveals instead of removing it.`,
        `Use <b>relative API URLs and a dev proxy</b> so development mirrors a same-origin production setup; keep CORS configuration for the cases that really are cross-origin.`,
        `Treat every <b><code>VITE_*</code></b> variable as public; type them in an <code>ImportMetaEnv</code> declaration, commit <code>.env</code> with safe defaults, git-ignore <code>*.local</code>.`,
        `Run <b><code>lint</code>, <code>tsc -b</code> and <code>build</code> in CI</b>, with <code>rules-of-hooks</code> as an error. Install React DevTools in every developer's browser.`,
        `Pin the <b>Node version</b> (<code>.nvmrc</code> or <code>engines</code>) and commit the lockfile; use <code>npm ci</code> in CI for reproducible installs.`
      ],
      lab: [
        `Scaffold <code>todo-web</code> with <code>npm create vite@latest todo-web -- --template react-ts</code>, run <code>npm install</code> and <code>npm run dev</code>, and open <code>http://localhost:5173</code>. Install the React DevTools extension and find <code>App</code> in the Components tab; change the count state from DevTools.`,
        `Add <code>console.log('App render')</code> to <code>App</code>. Note it prints twice per render in dev (one dimmed). Run <code>npm run build &amp;&amp; npm run preview</code> and confirm it prints once on port 4173. Look inside <code>dist/assets/</code> and find your component code, minified, with <code>jsx(</code> calls.`,
        `Create a minimal FastAPI app with <code>@app.get("/api/health")</code> returning <code>{"status": "ok", "db": "ok", "cache": "ok"}</code>, run it with <code>uvicorn main:app --reload --port 8000</code>, then add the <code>server.proxy</code> block to <code>vite.config.ts</code> and restart <code>npm run dev</code>.`,
        `Add the <code>HealthCheck</code> component with <code>VITE_API_BASE=/api</code> in <code>.env</code> and the <code>ImportMetaEnv</code> typing. First try <code>fetch('http://localhost:8000/api/health')</code> directly and read the CORS error in the console; then switch back to the relative URL.`,
        `Run <code>npm run lint</code>, then deliberately call <code>useState</code> inside an <code>if</code> and run it again to see the <code>rules-of-hooks</code> error; also introduce a type error and confirm the dev server still runs but <code>npm run build</code> fails.`,
        `<b>Done when:</b> the page shows "API ok, Postgres ok, Redis ok" via <code>/api/health</code> on port 5173 with no CORS error; the Network tab shows the request going to <code>localhost:5173</code>; you can explain why the request appears twice in dev and once in preview; and lint and build both catch the bugs you introduced.`
      ],
      teach: `<p>"A React project needs a build tool because browsers cannot run TypeScript or JSX. Today that tool is Vite; Create React App is deprecated. One command, <code>npm create vite@latest my-app -- --template react-ts</code>, gives you <code>index.html</code> as the entry, <code>main.tsx</code> which calls <code>createRoot</code> and renders <code>App</code> inside <code>StrictMode</code>, and a <code>vite.config.ts</code>.</p>
<p>There are three scripts. <code>dev</code> starts a server that compiles each file on request and hot-swaps components without losing state; it does not type-check. <code>build</code> type-checks with <code>tsc</code> and then bundles into <code>dist</code>. <code>preview</code> serves that bundle so you can test it.</p>
<p>JSX is just function calls: <code>&lt;h1&gt;Hi&lt;/h1&gt;</code> becomes <code>jsx('h1', { children: 'Hi' })</code> from <code>react/jsx-runtime</code>, which returns an element object. That is why you no longer import React in every file.</p>
<p>StrictMode, in development only, renders components twice and runs effects, their cleanup, and the effects again. If a log prints twice, that's StrictMode checking your code is pure, not a bug.</p>
<p>Finally, config. Only <code>VITE_</code>-prefixed variables reach the browser, through <code>import.meta.env</code>, and they are baked into public JavaScript, so never secrets; <code>process.env</code> doesn't exist there. And to talk to FastAPI on port 8000 without CORS errors, add a proxy for <code>/api</code> in <code>vite.config.ts</code> and use relative URLs, which also matches how nginx serves the app in production."</p>`
    }
  ],
  quiz: [
    {
      q: `What does this JSX compile to with the automatic runtime (production transform), and what does <code>Greeting</code> receive as props?`,
      code: `const el = <Greeting key="g1" name="Ada">Welcome back</Greeting>;`,
      lang: "tsx",
      ans: `<code>jsx(Greeting, { name: "Ada", children: "Welcome back" }, "g1")</code>, with <code>jsx</code> imported from <code>react/jsx-runtime</code>. <code>Greeting</code> receives <code>{ name: "Ada", children: "Welcome back" }</code>, no <code>key</code>.`,
      why: `Capitalised tags compile to a reference to the variable, children go inside props as <code>children</code>, and <code>key</code> is passed as a separate third argument that React uses for identity, so it never appears in props (React warns if you try to read <code>props.key</code>). Also note: this line only creates an element object; <code>Greeting</code> is not called until React renders <code>el</code>.`
    },
    {
      q: `A fresher reports: "React is broken, my log prints twice and my analytics endpoint gets two hits on page load." It only happens with <code>npm run dev</code>. What is going on, and what is the right fix?`,
      code: `// main.tsx renders <StrictMode><App /></StrictMode>
export default function App() {
  console.log('App rendered');
  useEffect(() => {
    fetch('/api/analytics/page-view', { method: 'POST' });
  }, []);
  return <h1>Home</h1>;
}`,
      lang: "tsx",
      ans: `StrictMode (development only) calls <code>App</code> twice per render and runs the effect setup → cleanup → setup on mount. The log is harmless; the double POST shows the effect is not safe to re-run.`,
      why: `Removing StrictMode hides the symptom. The production build runs each once, but the same non-idempotent pattern would misbehave whenever the component remounts (navigation, future features that unmount/remount hidden UI). Options: make the endpoint idempotent (send a page-view id), dedupe with a ref or a module-level flag for truly once-per-app-load logic, or trigger the POST from the router's navigation event. Day 5 covers effects in depth.`
    },
    {
      q: `This worked in an old Create React App project. After migrating to Vite the page crashes with <code>ReferenceError: process is not defined</code>. Fix it.`,
      code: `// .env
REACT_APP_API_URL=/api

// src/api.ts
export const API_URL = process.env.REACT_APP_API_URL;`,
      lang: "ts",
      ans: `Rename the variable to <code>VITE_API_URL=/api</code> and read it as <code>import.meta.env.VITE_API_URL</code>; restart the dev server.`,
      why: `<code>process</code> is a Node.js global. CRA's webpack config replaced <code>process.env.REACT_APP_*</code> at build time; Vite does not, and only exposes variables prefixed <code>VITE_</code> on <code>import.meta.env</code>. Unprefixed variables are deliberately not exposed so you don't leak server-side values. Add <code>readonly VITE_API_URL: string</code> to <code>ImportMetaEnv</code> for typing.`
    },
    {
      q: `A teammate adds the payment provider's secret key to the frontend so the React app can create charges directly. Code review: approve?`,
      code: `// .env.production
VITE_PAYMENTS_SECRET_KEY=sk_live_51H...

// src/pay.ts
fetch('https://api.payments.example/v1/charges', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + import.meta.env.VITE_PAYMENTS_SECRET_KEY },
  body: JSON.stringify({ amount: 4999 }),
});`,
      lang: "ts",
      ans: `Reject, and rotate the key if it was ever built or deployed. <code>VITE_*</code> values are inlined into the public JavaScript bundle.`,
      why: `Anyone can open DevTools → Sources (or download <code>dist/assets/index-*.js</code>) and read the key, then create charges with it. Move the call to FastAPI: the React app calls <code>POST /api/payments</code>, FastAPI validates the user and amount and calls the provider with the secret from its own environment. Only publishable keys designed to be public may live in <code>VITE_*</code> variables.`
    },
    {
      q: `The React app on <code>http://localhost:5173</code> shows "Access to fetch at 'http://localhost:8000/api/todos' from origin 'http://localhost:5173' has been blocked by CORS policy". FastAPI serves <code>GET /api/todos</code>. What do you change for development?`,
      code: `// src/TodoList.tsx
fetch('http://localhost:8000/api/todos').then((r) => r.json()).then(setTodos);`,
      lang: "tsx",
      ans: `Add <code>server: { proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } } }</code> to <code>vite.config.ts</code>, restart Vite, and call <code>fetch('/api/todos')</code>.`,
      why: `Different ports are different origins, so the browser enforces CORS. With the proxy, the browser makes a same-origin request to 5173 and Vite forwards it server-to-server, where CORS does not apply. The relative URL also matches a production setup where nginx serves the SPA and proxies <code>/api</code> to FastAPI. Adding <code>CORSMiddleware</code> would also work, but is unnecessary when production is same-origin, and a permissive dev CORS config tends to leak into production.`
    },
    {
      q: `What does this log, and does it run <code>Panel</code>?`,
      code: `function Panel() {
  console.log('Panel runs');
  return <section>Panel</section>;
}

const a = <Panel />;
const b = <Panel />;
console.log(typeof a, a.type === Panel, a === b);`,
      lang: "tsx",
      ans: `It logs <code>object true false</code>, and "Panel runs" is never printed.`,
      why: `JSX creates element objects: <code>type</code> is the <code>Panel</code> function itself, and each JSX expression creates a new object, so <code>a !== b</code> even though they describe the same thing. Creating an element never calls the component; React calls <code>Panel</code> only when an element is rendered inside a root. This is the "virtual DOM" in miniature: cheap descriptions first, component execution and DOM work later.`
    }
  ]
},
/* ===== Day 2 ===== */
{
  n: 2,
  title: "JSX and components",
  goal: `<b>By the end of today</b> you can read any JSX and say exactly what JavaScript it compiles to and what it renders, including the awkward cases (<code>0 &amp;&amp;</code>, <code>null</code>, index keys, raw HTML); and you can split a real screen backed by a FastAPI endpoint into small, pure, well-typed components that talk to each other only through props, children and callbacks.`,
  rev: [
    `<b>JSX is syntax for function calls.</b> <code>&lt;Card title="Hi"&gt;x&lt;/Card&gt;</code> compiles (automatic runtime) to <code>jsx(Card, { title: "Hi", children: "x" })</code>, which returns a plain, immutable <b>element object</b> <code>{ type, key, props }</code>. Rules follow from that: one root value per expression (use <code>&lt;&gt;…&lt;/&gt;</code>), every tag closed, attributes are JS property names (<code>className</code>, <code>htmlFor</code>, <code>onClick</code>, <code>tabIndex</code>; <code>aria-*</code>/<code>data-*</code> stay hyphenated), <code>style</code> takes an object, and braces take <b>expressions only</b> (no <code>if</code>/<code>for</code>/<code>const</code>).`,
    `<b>What renders:</b> strings and numbers render as text (escaped, never parsed as HTML); <code>true</code>, <code>false</code>, <code>null</code>, <code>undefined</code> and <code>""</code> render nothing; <b><code>0</code> and <code>NaN</code> render as text</b>, so <code>{items.length &amp;&amp; &lt;List/&gt;}</code> shows "0". Plain objects throw "Objects are not valid as a React child". Use a ternary, <code>items.length &gt; 0 &amp;&amp;</code>, or an early <code>return null</code>.`,
    `<b>Keys</b> identify list items between renders among their siblings. Use a stable id from the data (the PostgreSQL primary key the FastAPI endpoint returns). Index keys are only safe for static lists that are never reordered, filtered or prepended; otherwise state (input text, focus, open/closed) stays with the <i>position</i> and appears on the wrong row. <code>key</code> is not a prop: the child cannot read it.`,
    `<b>Components</b> are capitalised functions that take one read-only <code>props</code> object and return JSX. Destructure with defaults (<code>{ size = "md" }</code>; <code>defaultProps</code> is removed for function components in React 19). Type props with a <code>type</code> or <code>interface</code>; <code>children: ReactNode</code>; extend native elements with <code>ComponentProps&lt;"button"&gt;</code> and spread the rest.`,
    `<b>Composition over configuration:</b> pass JSX through <code>children</code> or named slot props (<code>header</code>, <code>sidebar</code>), pass callbacks (<code>onSelect</code>) for child-to-parent communication, and keep render <b>pure</b>: same props → same JSX, no mutation of props or outside variables, no fetches or timers in the body (StrictMode calls components twice in development to expose this).`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d2-jsx",
      title: "JSX in depth: expressions, conditionals, lists and keys",
      lv: ["fresher", "mid", "senior"],
      eli5: `<p>Imagine ordering furniture by filling in a form rather than building it yourself. The form looks like a picture of the finished room ("a table here, two chairs there, a lamp on the table"), but it is really a list of instructions the factory reads. JSX is that form: it <i>looks</i> like HTML, but the build tool turns every tag into a JavaScript function call that creates a small description object. React (the factory) reads the descriptions and builds or updates the real DOM.</p>
<p>Because the form is JavaScript underneath, you can write <i>calculations</i> on it inside curly braces: "put <code>{user.name}</code> here", "if the user is an admin, add a badge". But you can only write things that produce a value (expressions), not whole instructions like "repeat this five times" (statements), because each blank on the form needs one answer.</p>
<p>Lists are like a row of identical chairs. If you want the factory to know which chair is which when you rearrange the room, you have to put a name tag on each one: that is the <code>key</code>. If you label them "first chair, second chair" (the index) and then insert a new chair at the front, every label now points at a different chair, and the cushion that was on Ana's chair ends up on Ben's.</p>`,
      what: `<p><b>JSX</b> is a syntax extension to JavaScript that lets you write element trees with XML-like tags. It is not HTML and not a template language; it is compiled away before the browser sees it. In a Vite react-ts app, esbuild (or SWC with the SWC plugin) compiles <code>.tsx</code> with the <b>automatic JSX runtime</b> (<code>"jsx": "react-jsx"</code> in <code>tsconfig</code>): each tag becomes a call to <code>jsx()</code> or <code>jsxs()</code> imported from <code>react/jsx-runtime</code>. That is why you no longer need <code>import React from "react"</code> at the top of every file (you did with the old "classic" runtime, which compiled to <code>React.createElement</code>).</p>
<p>The call returns a <b>React element</b>: a small plain object such as <code>{ $$typeof, type: "h1", key: null, props: { className: "title", children: "Hi" } }</code>. Elements are cheap, immutable descriptions of what you want on screen; creating one does nothing to the DOM. Rendering, diffing and committing happen later (Day 4).</p>
<h4>The rules, and why each exists</h4>
<ul class="pts">
<li><b>One root per expression.</b> A component returns one value, and <code>return &lt;h1/&gt;&lt;p/&gt;</code> would be two function calls side by side, which is not valid JavaScript. Wrap siblings in a <b>Fragment</b>: <code>&lt;&gt;…&lt;/&gt;</code> (no DOM node is created). Use the long form <code>&lt;Fragment key={id}&gt;</code> when you need a key, because the short syntax cannot take attributes.</li>
<li><b>Every tag must close.</b> <code>&lt;img /&gt;</code>, <code>&lt;br /&gt;</code>, <code>&lt;input /&gt;</code>. The parser needs to know where <code>children</code> ends.</li>
<li><b>Attributes are DOM property names in camelCase.</b> <code>class</code> → <code>className</code> and <code>for</code> → <code>htmlFor</code> (both are reserved words in JS), <code>onclick</code> → <code>onClick</code>, <code>tabindex</code> → <code>tabIndex</code>, <code>maxlength</code> → <code>maxLength</code>. Exceptions: <code>aria-*</code> and <code>data-*</code> keep their hyphens.</li>
<li><b><code>style</code> takes an object</b>, not a string: <code>style={{ marginTop: 8, backgroundColor: "red" }}</code>. The outer braces mean "JS expression", the inner ones are the object literal. Numeric values get <code>px</code> appended for length properties (<code>marginTop: 8</code> → <code>8px</code>) but not for unitless ones (<code>opacity</code>, <code>zIndex</code>, <code>flexGrow</code>, <code>lineHeight</code>). CSS custom properties are written as strings: <code>{ "--accent": "#0a7" }</code>.</li>
<li><b>String literals vs expressions.</b> <code>title="Users"</code> passes a string; <code>count={3}</code> passes a number; <code>disabled</code> alone means <code>disabled={true}</code>. Anything else goes in braces.</li>
<li><b>Comments</b> inside JSX are written <code>{/* like this */}</code>.</li>
</ul>
<h4>Embedding expressions</h4>
<p>Inside <code>{ }</code> you can put any JavaScript <b>expression</b>: variables, property access, function calls, arithmetic, template literals, ternaries, <code>&amp;&amp;</code>/<code>||</code>/<code>??</code>, <code>.map()</code>, even other JSX. You cannot put <b>statements</b>: <code>if</code>, <code>for</code>, <code>while</code>, <code>switch</code>, <code>const x = …</code>, <code>return</code>. The reason is mechanical: braces become a function argument or an object property value, and a statement is not a value. When you need statement logic, do it above the <code>return</code> (assign to a variable, early-return) or move it into a helper function or a child component.</p>
<h4>What each value renders as</h4>
<ul class="pts">
<li><b>string, number</b> (including bigint): rendered as a text node, <b>escaped</b>. <code>{"&lt;b&gt;hi&lt;/b&gt;"}</code> shows the literal characters, never bold text.</li>
<li><b><code>true</code>, <code>false</code>, <code>null</code>, <code>undefined</code></b>: render nothing. This is what makes <code>cond &amp;&amp; &lt;X/&gt;</code> work.</li>
<li><b><code>""</code></b>: renders nothing visible (an empty string).</li>
<li><b><code>0</code>, <code>NaN</code></b>: they are numbers, so they render as "0" and "NaN". This is the source of the most famous JSX bug.</li>
<li><b>Arrays</b> (and other iterables): each item is rendered in order. Items that are elements need a <code>key</code>.</li>
<li><b>Elements</b>: rendered as their component or DOM node.</li>
<li><b>Plain objects, Dates, functions</b>: not renderable. Objects throw <i>"Objects are not valid as a React child"</i>; a function as a child is ignored with a warning. Convert first: <code>{date.toLocaleDateString()}</code>, <code>{JSON.stringify(obj)}</code>. (Promises are a special case in React 19 with <code>use</code>/Suspense, covered on Day 7.)</li>
</ul>
<h4>Conditional rendering patterns</h4>
<ul class="pts">
<li><b>Ternary</b> <code>{isAdmin ? &lt;AdminBar/&gt; : &lt;UserBar/&gt;}</code>: either/or.</li>
<li><b>Logical AND</b> <code>{error &amp;&amp; &lt;Alert&gt;{error}&lt;/Alert&gt;}</code>: show or nothing. Safe only when the left side is a boolean, string or object/null. If it can be a number, convert: <code>{items.length &gt; 0 &amp;&amp; …}</code> or <code>{!!count &amp;&amp; …}</code>.</li>
<li><b>Nullish/OR fallback</b> <code>{user.nickname ?? user.name}</code>.</li>
<li><b>Early return</b> at the top of the component: <code>if (!user) return null;</code> or <code>if (status === "loading") return &lt;Spinner/&gt;;</code>. This is often the cleanest pattern for loading/error/empty states.</li>
<li><b>Variable</b>: <code>let content; if (…) content = &lt;A/&gt;; else content = &lt;B/&gt;;</code> then <code>{content}</code>.</li>
<li><b>Lookup object</b> for many cases: <code>const icon = { active: "●", disabled: "○" }[status]</code>.</li>
<li><b>Returning <code>null</code></b> from a component renders nothing but the component still exists in the tree (its state survives, Day 4).</li>
</ul>
<h4>Lists and keys</h4>
<p>To render a collection, transform data into elements with <code>array.map()</code> (filter and sort <i>before</i> mapping). Each element in the array needs a <code>key</code> that is <b>unique among its siblings</b> and <b>stable across renders</b>. React uses keys to match the items in the new list with the items in the previous one, so it can move, insert or remove DOM nodes and keep each item's state attached to the right item.</p>
<ul class="pts">
<li><b>Best key:</b> the database id the API returns (<code>user.id</code> from PostgreSQL via FastAPI), or another natural unique field (an email, a slug).</li>
<li><b>Never</b> generate keys during render (<code>key={Math.random()}</code>, <code>key={crypto.randomUUID()}</code>): every render gets new keys, so every item is destroyed and recreated, losing focus and state and costing performance.</li>
<li><b>Index keys</b> (<code>key={i}</code>, also what React falls back to when you omit the key, plus a warning) are fine only when the list is static: never reordered, filtered, or inserted into anywhere except the end, and items hold no state. Otherwise state stays attached to the position, not the data.</li>
<li>If items have no id (for example rows the user is adding client-side), give them one when you <i>create</i> them (<code>crypto.randomUUID()</code> in the event handler), not when you render them.</li>
<li>Keys only need to be unique among siblings, not globally. The same id can appear in two different lists.</li>
<li><code>key</code> is consumed by React; it is not passed into the child's props. If the child needs the id, pass it separately: <code>&lt;UserRow key={u.id} id={u.id} /&gt;</code>.</li>
</ul>
<h4>Raw HTML: <code>dangerouslySetInnerHTML</code></h4>
<p>Because React escapes every string, there is exactly one way to inject HTML markup: <code>&lt;div dangerouslySetInnerHTML={{ __html: html }} /&gt;</code>. The awkward name and the <code>__html</code> wrapper object are deliberate friction. React sets <code>innerHTML</code> on that node and does not manage its children (you cannot also pass <code>children</code>). If <code>html</code> contains anything a user controlled (a comment body, a profile bio, a Markdown render), you must <b>sanitise</b> it first (for example with DOMPurify) or you have a stored XSS hole.</p>`,
      why: `<p>Before JSX, there were two common ways to build UI in JavaScript. One was string templates (<code>'&lt;li&gt;' + name + '&lt;/li&gt;'</code>, Handlebars, Mustache, jQuery <code>.html()</code>): readable, but they produce strings that the browser must parse, they are unsafe by default (forget to escape once and you have XSS), and they cannot hold event handlers or component state. The other was imperative DOM calls (<code>document.createElement</code>, <code>appendChild</code>, <code>addEventListener</code>): safe and precise, but verbose and impossible to read as a picture of the UI.</p>
<p>React's original insight was that the UI description should be <b>JavaScript values</b>, so you get the full language (variables, functions, <code>map</code>, types) with no separate template syntax to learn. <code>React.createElement("li", null, name)</code> did that, but nested calls are hard to read. JSX is the sugar that gives you the readability of HTML with the semantics of function calls. Because the result is data rather than a string, React can escape text automatically, attach real event handlers, type-check props with TypeScript, and diff the old and new descriptions to compute minimal DOM updates.</p>
<p>Conditionals and lists are just JavaScript in JSX, which is why React has no <code>v-if</code>, <code>*ngFor</code> or <code>{{#each}}</code>. Keys exist because a diff of two arrays is ambiguous: if the old list is <code>[A, B]</code> and the new one is <code>[X, A, B]</code>, did A change into X, or was X inserted? Without identity, React must guess by position. Keys remove the guess.</p>`,
      diagram: {
        html: flow([
          ["JSX source", "&lt;li key={u.id}&gt;{u.name}&lt;/li&gt;", "w"],
          ["Compiler (esbuild/SWC)", "automatic runtime", ""],
          ["jsx(\"li\", {children}, u.id)", "plain function call", ""],
          ["Element object", "{ type: \"li\", key: \"42\", props }", "g"],
          ["React render + reconcile", "match by type + key", ""],
          ["DOM", "text node, escaped", "g"]
        ]),
        steps: [
          "You write JSX in a <code>.tsx</code> file. It is not valid JavaScript; the browser never sees it.",
          "Vite's compiler rewrites each tag into a call to <code>jsx()</code>/<code>jsxs()</code> from <code>react/jsx-runtime</code>. Attributes become a props object; nested content becomes <code>props.children</code>; <code>key</code> is passed as a separate argument.",
          "At runtime the call returns an immutable element object. Expressions in braces are evaluated right here, as ordinary arguments.",
          "React renders the tree and, for lists, matches each new child to the previous one by <b>type and key</b> among siblings. Matched items keep their DOM nodes and state; unmatched ones are created or removed.",
          "React DOM writes the result: strings become text nodes (never parsed as HTML), attributes are set as properties/attributes, and only <code>dangerouslySetInnerHTML</code> uses <code>innerHTML</code>."
        ]
      },
      ex: [
        {
          t: "What JSX compiles to",
          lang: "tsx",
          code: `// src/Greeting.tsx: what you write
export function Greeting({ name, unread }: { name: string; unread: number }) {
  return (
    <section className="greeting">
      <h1>Hello, {name}</h1>
      <p>You have {unread} unread messages</p>
    </section>
  );
}

// Roughly what the compiler emits (automatic runtime, simplified):
//
// import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// export function Greeting({ name, unread }) {
//   return _jsxs("section", {
//     className: "greeting",
//     children: [
//       _jsxs("h1", { children: ["Hello, ", name] }),
//       _jsxs("p", { children: ["You have ", unread, " unread messages"] }),
//     ],
//   });
// }
//
// jsxs = "static children array" (keys not required, the compiler knows the
// children are fixed); jsx = a single child or a dynamic one.`,
          out: `<section class="greeting"><h1>Hello, Ana</h1><p>You have 3 unread messages</p></section>`,
          note: `<p>Paste any component into the Babel REPL (babeljs.io/repl, preset "react" with runtime "automatic") to see the real output. Notice that <code>{name}</code> is just an array item: braces are a hole where an ordinary JavaScript value goes. Also notice <code>className</code>: it is the property name, which React DOM writes as the <code>class</code> attribute.</p>`
        },
        {
          t: "The syntax rules in one component",
          lang: "tsx",
          code: `// src/ContactField.tsx
import type { CSSProperties } from "react";

const hintStyle: CSSProperties = {
  marginTop: 4,          // number → "4px"
  fontSize: "0.85rem",   // strings pass through unchanged
  opacity: 0.8,          // unitless property: no "px"
};

export function ContactField() {
  return (
    // Two siblings need one root: a Fragment adds no DOM node
    <>
      {/* class → className, for → htmlFor */}
      <label htmlFor="email" className="field-label">
        Email
      </label>
      {/* every tag closes; attributes are camelCase; aria-/data- keep hyphens */}
      <input
        id="email"
        type="email"
        maxLength={120}
        autoComplete="email"
        required
        aria-describedby="email-hint"
        data-testid="email-input"
      />
      <p id="email-hint" style={hintStyle}>
        We never share it.
      </p>
      {/* CSS custom properties need a cast in TypeScript */}
      <div style={{ "--accent": "#0a7" } as CSSProperties} className="swatch" />
    </>
  );
}`,
          out: `<label for="email" class="field-label">Email</label>
<input id="email" type="email" maxlength="120" autocomplete="email" required="" aria-describedby="email-hint" data-testid="email-input">
<p id="email-hint" style="margin-top: 4px; font-size: 0.85rem; opacity: 0.8;">We never share it.</p>
<div class="swatch" style="--accent: #0a7;"></div>`,
          note: `<p>Writing <code>class=</code> still works in the browser, but React logs <i>"Invalid DOM property 'class'. Did you mean 'className'?"</i> and TypeScript rejects it. Writing <code>style="color:red"</code> throws, because React expects an object. The <code>as CSSProperties</code> cast is needed because <code>CSSProperties</code> does not list custom properties by default.</p>`
        },
        {
          t: "Expressions yes, statements no",
          lang: "tsx",
          code: `// src/OrderSummary.tsx
type Order = { id: number; total: number; createdAt: string; items: string[]; coupon?: string };

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
}

export function OrderSummary({ order }: { order: Order }) {
  // Statement logic lives ABOVE the return
  let shipping: string;
  if (order.total >= 999) shipping = "Free shipping";
  else shipping = "Shipping: " + formatMoney(49);

  const created = new Date(order.createdAt);

  return (
    <article>
      <h2>Order #{order.id}</h2>
      {/* function calls, arithmetic, template literals are expressions */}
      <p>Total: {formatMoney(order.total)}</p>
      <p>{\`\${order.items.length} item\${order.items.length === 1 ? "" : "s"}\`}</p>
      {/* a Date object is NOT renderable; render a string instead */}
      <p>Placed {created.toLocaleDateString("en-IN")}</p>
      <p>{shipping}</p>
      {/* ?? for fallbacks */}
      <p>Coupon: {order.coupon ?? "none"}</p>

      {/* These would NOT compile:
          {if (order.coupon) { <p>…</p> }}
          {for (const i of order.items) <li>{i}</li>}
          {const x = 1}                                           */}
    </article>
  );
}`,
          out: `Order #1042
Total: ₹1,250.00
3 items
Placed 16/11/2026
Free shipping
Coupon: none`,
          note: `<p>If you write <code>{created}</code> instead of a formatted string, React throws <i>"Objects are not valid as a React child (found: [object Date])"</i>.</p>`
        },
        {
          t: "Conditional rendering, including the 0 && pitfall",
          lang: "tsx",
          code: `// src/Inbox.tsx
type Props = {
  unread: number;
  error: string | null;
  isAdmin: boolean;
  user: { name: string } | null;
};

export function Inbox({ unread, error, isAdmin, user }: Props) {
  // Early return: nothing to show without a user
  if (!user) return null;

  return (
    <div>
      {/* either/or */}
      {isAdmin ? <span className="badge">Admin</span> : <span>Member</span>}

      {/* show or nothing: error is string | null, safe */}
      {error && <p role="alert">{error}</p>}

      {/* BUG: when unread === 0 this renders the text "0" */}
      {unread && <p>{unread} new messages</p>}

      {/* FIX 1: compare to get a real boolean */}
      {unread > 0 && <p>{unread} new messages</p>}

      {/* FIX 2: a ternary with an explicit null */}
      {unread ? <p>{unread} new messages</p> : null}
    </div>
  );
}

// <Inbox unread={0} error={null} isAdmin={false} user={{ name: "Ana" }} />`,
          out: `<div><span>Member</span>0</div>`,
          note: `<p><code>0 &amp;&amp; anything</code> evaluates to <code>0</code>, and <code>0</code> is a number, which React renders. The stray "0" is a classic production bug in badges and counters. In React Native it is worse: a raw string outside <code>&lt;Text&gt;</code> crashes the app. Lint rule <code>react/jsx-no-leaked-render</code> (eslint-plugin-react) catches it.</p>`
        },
        {
          t: "Lists with stable keys from the API",
          lang: "tsx",
          code: `// src/UserTable.tsx
// Shape returned by FastAPI: GET /api/users -> { items: User[], total: number }
export type User = { id: number; name: string; email: string; active: boolean };

export function UserTable({ users }: { users: User[] }) {
  // filter/sort BEFORE map; copy before sort (sort mutates)
  const visible = users
    .filter((u) => u.active)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  if (visible.length === 0) return <p>No active users.</p>;

  return (
    <table>
      <tbody>
        {visible.map((u) => (
          // key = primary key from PostgreSQL: unique and stable
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Several elements per item: use the long Fragment form to hold the key
import { Fragment } from "react";

export function Glossary({ terms }: { terms: { id: string; term: string; def: string }[] }) {
  return (
    <dl>
      {terms.map((t) => (
        <Fragment key={t.id}>
          <dt>{t.term}</dt>
          <dd>{t.def}</dd>
        </Fragment>
      ))}
    </dl>
  );
}`,
          note: `<p>Imports are hoisted, so placing <code>import { Fragment }</code> mid-file works, but in real code keep imports at the top. With <code>users.toSorted(...)</code> (ES2023) you can skip the <code>.slice()</code> if your <code>lib</code> setting includes ES2023. Forgetting the key logs <i>"Each child in a list should have a unique "key" prop"</i> with the component stack.</p>`
        },
        {
          t: "Why index keys break: state follows the position",
          lang: "tsx",
          code: `// src/KeyDemo.tsx: run it, type in the first box, then click "Add to top"
import { useState } from "react"; // useState is Day 3; here it just holds the list

type Item = { id: string; label: string };

function Row({ label }: { label: string }) {
  // An uncontrolled input: the DOM node itself holds what you typed
  return (
    <li>
      {label}: <input placeholder="note" />
    </li>
  );
}

export function KeyDemo() {
  const [items, setItems] = useState<Item[]>([
    { id: "a", label: "Ana" },
    { id: "b", label: "Ben" },
  ]);

  function addToTop() {
    // the id is created when the DATA is created, not during render
    setItems([{ id: crypto.randomUUID(), label: "New" }, ...items]);
  }

  return (
    <div>
      <button onClick={addToTop}>Add to top</button>
      <h3>key = index (broken)</h3>
      <ul>{items.map((it, i) => <Row key={i} label={it.label} />)}</ul>
      <h3>key = id (correct)</h3>
      <ul>{items.map((it) => <Row key={it.id} label={it.label} />)}</ul>
    </div>
  );
}`,
          out: `Before (typed "hello" next to Ana in both lists):
  index list: Ana: [hello]   Ben: [ ]
  id list:    Ana: [hello]   Ben: [ ]
After "Add to top":
  index list: New: [hello]   Ana: [ ]   Ben: [ ]   <- text stayed at position 0
  id list:    New: [ ]       Ana: [hello]   Ben: [ ]`,
          note: `<p>With index keys, the old row with key <code>0</code> (Ana's input) is matched with the new row with key <code>0</code> (New). React keeps the DOM node, so the typed text stays, and only updates the label. A new row with key <code>2</code> is appended at the end. With id keys, React sees that <code>"a"</code> and <code>"b"</code> still exist, moves nothing, and inserts one new <code>&lt;li&gt;</code> at the top. The same bug affects checkboxes, focus, animations and any child with <code>useState</code>.</p>`
        },
        {
          t: "Escaping by default, and dangerouslySetInnerHTML done safely",
          lang: "tsx",
          code: `// npm install dompurify
// (recent DOMPurify versions ship their own TypeScript types;
//  older ones needed: npm install -D @types/dompurify)
import DOMPurify from "dompurify";

// A comment body stored in PostgreSQL, submitted by a user
const body = '<img src=x onerror="alert(document.cookie)"> <b>Nice post</b>';

export function CommentText() {
  // Safe: React renders this as TEXT; the browser shows the tags literally
  return <p>{body}</p>;
}

export function CommentHtmlUnsafe() {
  // XSS: the onerror handler runs in every reader's browser
  return <div dangerouslySetInnerHTML={{ __html: body }} />;
}

export function CommentHtmlSafe({ html }: { html: string }) {
  // Sanitise at render time (or on the server before storing; ideally both)
  const clean = DOMPurify.sanitize(html);
  return <div className="prose" dangerouslySetInnerHTML={{ __html: clean }} />;
}`,
          out: `CommentText shows:      <img src=x onerror="alert(document.cookie)"> <b>Nice post</b>
CommentHtmlUnsafe:      broken image + alert() fires
CommentHtmlSafe:        broken image (onerror stripped) + bold "Nice post"`,
          note: `<p>Escaping covers <b>text content and attribute values</b>, not every injection route. A user-supplied URL in <code>href</code> can still be <code>javascript:…</code>: React 19 blocks <code>javascript:</code> URLs in <code>href</code>/<code>src</code>-style attributes (older versions only warned), but validate URL schemes yourself anyway (allow <code>http:</code>/<code>https:</code>/<code>mailto:</code>). Spreading untrusted objects as props (<code>{...userJson}</code>) can also smuggle in <code>dangerouslySetInnerHTML</code>.</p>`
        },
        {
          t: "Realistic: loading, error, empty and data states for /api/users",
          lang: "tsx",
          code: `// src/features/users/UsersPanel.tsx
// The fetch itself is Day 7 (TanStack Query). Here the parent passes a status
// object so we can focus purely on rendering every state correctly.
export type User = { id: number; name: string; email: string; role: "admin" | "member" };

export type UsersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; users: User[]; total: number };

export function UsersPanel({ state }: { state: UsersState }) {
  // Early returns read top-to-bottom like a checklist
  if (state.status === "loading") return <p aria-busy="true">Loading users…</p>;
  if (state.status === "error") return <p role="alert">Could not load users: {state.message}</p>;

  const { users, total } = state; // narrowed to the success branch
  if (users.length === 0) return <p>No users yet. Invite someone.</p>;

  return (
    <section>
      <h2>
        Users <small>({total})</small>
      </h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <strong>{u.name}</strong> <span>{u.email}</span>
            {u.role === "admin" && <span className="badge">admin</span>}
          </li>
        ))}
      </ul>
      {total > users.length && <p>Showing {users.length} of {total}</p>}
    </section>
  );
}`,
          out: `Users (57)
• Ana Rao ana@example.com [admin]
• Ben Iyer ben@example.com
Showing 2 of 57`,
          note: `<p>The discriminated union makes impossible states (an error <i>and</i> a list) unrepresentable, and TypeScript narrows <code>state</code> after each early return. Note that <code>total &gt; users.length &amp;&amp;</code> is a comparison, so it is a boolean, never a stray number.</p>`
        }
      ],
      internals: `<p><b>The element object.</b> <code>jsx(type, config, maybeKey)</code> copies <code>config</code> into a new <code>props</code> object, takes <code>key</code> out (it is passed as a separate argument by the compiler, and coerced to a string), and returns <code>{ $$typeof, type, key, props }</code>. <code>$$typeof</code> is a <code>Symbol</code> (in React 19 it is <code>Symbol.for("react.transitional.element")</code>; earlier versions used <code>"react.element"</code>). Because JSON cannot contain Symbols, an attacker who manages to get a JSON object rendered as a child cannot forge a valid element: React rejects it. In development, React also <code>Object.freeze</code>s the element and its <code>props</code>, which is why mutating props throws in dev.</p>
<p><b>Where <code>ref</code> and <code>key</code> go.</b> In React 19, <code>ref</code> is an ordinary prop for function components (reading <code>element.ref</code> is deprecated). <code>key</code> is never in <code>props</code>. If you spread an object that contains <code>key</code> (<code>&lt;Row {...item} /&gt;</code> where <code>item.key</code> exists), the compiler cannot extract it statically and falls back to <code>createElement</code> semantics; React warns that a props object containing a "key" prop is being spread into JSX. Pass <code>key</code> explicitly.</p>
<p><b><code>jsx</code> vs <code>jsxs</code>.</b> When the compiler sees several literal children, it emits <code>jsxs</code> with a <code>children</code> array: those children are static, so no keys are needed. When a single child expression evaluates to an array at runtime (the result of <code>.map</code>), it goes through <code>jsx</code>, and React's dev build validates that every element in that array has a key. This is why <code>&lt;p&gt;{a}{b}&lt;/p&gt;</code> never warns but <code>&lt;ul&gt;{list.map(...)}&lt;/ul&gt;</code> does.</p>
<p><b>Children reconciliation.</b> When React reconciles an array of children, it first walks old and new children in parallel while keys match. On the first mismatch, it puts the remaining old fibers in a <code>Map</code> keyed by <code>key</code> (or by index when no key), then for each new child looks up a fiber with the same key <b>and</b> the same <code>type</code>. A hit is reused (DOM node and state preserved, possibly moved); a miss creates a new fiber; leftovers are deleted. This is O(n), and it is why keys must be stable: an unstable key turns every update into delete + create (Day 4 and Day 12 go deeper).</p>
<p><b>Rendering primitives.</b> In the reconciler, <code>typeof child === "string" || "number" || "bigint"</code> becomes a host text fiber; booleans, <code>null</code> and <code>undefined</code> are treated as empty slots (they still occupy a position, which is why <code>{cond &amp;&amp; &lt;A/&gt;}&lt;B/&gt;</code> keeps <code>B</code> at the same index whether <code>cond</code> is true or false). A text fiber is committed with <code>document.createTextNode</code> or by setting <code>textContent</code>, so the string is never parsed as HTML. <code>dangerouslySetInnerHTML</code> is a special prop that React DOM applies by assigning <code>node.innerHTML = props.dangerouslySetInnerHTML.__html</code>; React then treats that node as having no React-managed children.</p>
<p><b>Attributes.</b> React DOM maps prop names to attributes/properties (<code>className</code> → <code>class</code>, <code>htmlFor</code> → <code>for</code>), sets <code>style</code> via <code>node.style[prop] = value</code> (and <code>style.setProperty</code> for custom properties), appending <code>px</code> to numbers unless the property is in its unitless list. Event props such as <code>onClick</code> are not set as attributes at all; React attaches one listener per event type at the root container and dispatches to your handlers (Day 3).</p>`,
      prod: `<p><b>The 0 bug ships more than you think.</b> Counters, badges and "N results" banners built with <code>{count &amp;&amp; …}</code> pass review because test data always has items. Then a new user with zero notifications sees a lonely "0" in the header. Turn on <code>react/jsx-no-leaked-render</code> or adopt a team rule: the left side of <code>&amp;&amp;</code> in JSX must be a boolean.</p>
<p><b>Keys come from the backend.</b> In a React → FastAPI → PostgreSQL stack, every list the API returns should carry a stable id (the primary key, or a UUID). Make it part of your Pydantic response model and the generated TypeScript type. Watch for endpoints that return computed rows without ids (report aggregates, search suggestions): either add a deterministic id server-side (e.g. <code>f"{date}-{region}"</code>) or build a composite key client-side from fields that are unique together. Duplicate keys (two rows with the same id because a JOIN fanned out) cause React to warn and can make rows disappear or duplicate on update; that is a backend bug surfacing in the UI.</p>
<p><b>Index keys and pagination.</b> Infinite scroll that prepends new items ("3 new posts") or a table the user can sort client-side with index keys produces the "my expanded row/selected checkbox moved to another row" bug report. It is hard to reproduce because it only appears with stateful rows.</p>
<p><b>Rich text.</b> CMS content, Markdown comments and email previews are where <code>dangerouslySetInnerHTML</code> appears. Policy that scales: sanitise on the server when content is written (Python <code>nh3</code> or <code>bleach</code> in FastAPI) <i>and</i> on the client before injecting (DOMPurify), set a Content Security Policy that forbids inline scripts, and grep for <code>dangerouslySetInnerHTML</code> in code review. A Markdown renderer that produces React elements (such as <code>react-markdown</code>) avoids raw HTML entirely.</p>
<p><b>Large lists.</b> Rendering 10,000 rows with <code>map</code> is correct but slow: every row is a component, a fiber and DOM nodes. Paginate on the server (FastAPI <code>limit</code>/<code>offset</code> or cursor), or virtualise the list (Day 11). Keys still matter in virtualised lists.</p>`,
      iq: [
        ["fresher", "What is JSX, and does the browser understand it?", "<p>JSX is a syntax extension that lets you describe UI with XML-like tags inside JavaScript. The browser does not understand it; a compiler (esbuild or SWC in Vite, Babel elsewhere) turns each tag into a function call (<code>jsx()</code> from <code>react/jsx-runtime</code>, or <code>React.createElement</code> in the classic runtime) that returns a plain element object. The tempting wrong answer, \"JSX is HTML inside JavaScript\", misses that attributes are JS property names, braces hold JS expressions, and the output is data, not markup.</p>"],
        ["fresher", "Why must a component return a single root element, and how do you avoid an extra <code>&lt;div&gt;</code>?", "<p>Because JSX compiles to a function call, and a function returns one value: two adjacent tags would be two calls with nothing joining them. Wrap siblings in a Fragment (<code>&lt;&gt;…&lt;/&gt;</code>), which groups them without adding a DOM node. Use <code>&lt;Fragment key={id}&gt;</code> when mapping, since the short syntax cannot take a key. Returning an array also works but then every item needs a key.</p>"],
        ["fresher", "Why <code>className</code> instead of <code>class</code>?", "<p>JSX attributes become keys of a JavaScript props object, and React follows DOM property names (<code>element.className</code>, <code>label.htmlFor</code>). <code>class</code> and <code>for</code> are also reserved words in JavaScript. React DOM writes <code>className</code> out as the <code>class</code> attribute. Using <code>class</code> happens to work at runtime but warns and fails type-checking.</p>"],
        ["fresher", "What does <code>{count &amp;&amp; &lt;Badge count={count} /&gt;}</code> render when <code>count</code> is 0, and how do you fix it?", "<p>It renders the text <b>0</b>. <code>&amp;&amp;</code> returns its left operand when it is falsy, so the expression evaluates to <code>0</code>, and React renders numbers (only <code>true</code>/<code>false</code>/<code>null</code>/<code>undefined</code> render nothing). Fix with a boolean condition: <code>count &gt; 0 &amp;&amp; …</code>, <code>!!count &amp;&amp; …</code>, or a ternary returning <code>null</code>. The tempting answer \"nothing, because 0 is falsy\" confuses JavaScript truthiness with React's rendering rules.</p>"],
        ["mid", "What is a key, and why is using the array index often wrong?", "<p>A key is a sibling-unique, stable identity that tells React which item in the new list corresponds to which item in the previous render. React preserves DOM nodes and component state per key. With index keys, identity is the position: when you insert at the front, sort or filter, each position now holds different data, but React keeps the old state at that position, so typed text, checkboxes, focus and child state appear on the wrong row, and React re-renders/patches every row instead of moving one. Index keys are acceptable only for static lists that never reorder and hold no state. Random keys are worse: every render remounts everything.</p>"],
        ["mid", "Can you put an <code>if</code> statement or a <code>for</code> loop inside JSX? What do you do instead?", "<p>No. Braces in JSX accept expressions only, because their content becomes a function argument or object property value. Use a ternary or <code>&amp;&amp;</code> for conditions, <code>.map()</code> for loops, compute values in variables above the <code>return</code>, use early returns for whole-component branches, or extract a helper/child component. An IIFE inside JSX works but is a code smell.</p>"],
        ["mid", "Does React protect against XSS? Where does that protection end?", "<p>React escapes all strings rendered as text and sets attribute values without HTML parsing, so <code>{userInput}</code> is safe. The protection ends at: <code>dangerouslySetInnerHTML</code> (sanitise with DOMPurify or avoid it); URL attributes with user input (<code>javascript:</code> URLs; React 19 blocks them in <code>href</code>, older versions only warned, so validate schemes anyway); spreading untrusted objects as props; direct DOM manipulation via refs (<code>ref.current.innerHTML</code>); and server-rendered HTML or inline scripts built from strings. Defence in depth: server-side sanitising and a CSP.</p>"],
        ["senior", "Why does <code>&lt;p&gt;{a}{b}&lt;/p&gt;</code> never warn about keys, while <code>&lt;ul&gt;{items.map(...)}&lt;/ul&gt;</code> does?", "<p>The compiler sees two literal child positions in the first case and emits <code>jsxs(\"p\", { children: [a, b] })</code>: a static children array whose length and order are fixed by the source code, so position is a valid identity. In the second case, there is one child expression that evaluates to an array at runtime; its length and order can change between renders, so React validates that every element in it has a key. Static siblings are identified by position; dynamic arrays need keys.</p>"],
        ["senior", "You see a list where expanding a row sometimes expands a different row after the data refreshes from the API. What do you investigate?", "<p>Identity. Check the keys: index keys, keys built from non-unique fields (name), keys generated during render (<code>Math.random()</code>, <code>crypto.randomUUID()</code> in <code>map</code>), or duplicate ids from the backend (a JOIN that fans out rows). Also check where the \"expanded\" state lives: if it is stored by index in a parent (<code>expandedIndex</code>), it breaks when order changes even with good keys; store the item id instead. Fix by keying on the PostgreSQL primary key and storing selection by id.</p>"],
        ["lead", "How would you set team standards around JSX to prevent the common bugs?", "<p>Lint: <code>eslint-plugin-react</code> rules such as <code>jsx-key</code>, <code>no-array-index-key</code>, <code>jsx-no-leaked-render</code>, <code>no-danger</code> (with a reviewed allowlist), plus <code>eslint-plugin-react-hooks</code>. Types: <code>strict</code> TypeScript and generated API types so ids are guaranteed on list items. Review checklist: boolean left-hand sides of <code>&amp;&amp;</code>, stable keys, every <code>dangerouslySetInnerHTML</code> goes through a shared <code>SafeHtml</code> component that sanitises. Backend contract: every collection item has an id. These rules are cheap to enforce and catch the bugs that pass tests with happy-path data.</p>"]
      ],
      gotchas: [
        "<code>{list.length &amp;&amp; &lt;List/&gt;}</code> renders <b>0</b> for an empty list; <code>{NaN &amp;&amp; …}</code> renders <b>NaN</b>. Only <code>false</code>, <code>null</code>, <code>undefined</code>, <code>true</code> and <code>\"\"</code> render nothing.",
        "<code>key</code> is not a prop. <code>props.key</code> is <code>undefined</code> inside the child (and React warns if you try to read it). Pass the id as a separate prop if the child needs it.",
        "<code>key={Math.random()}</code> or <code>key={crypto.randomUUID()}</code> inside <code>map</code> remounts every item on every render: inputs lose focus and typed text, effects re-run, performance collapses.",
        "<code>array.sort()</code> and <code>array.reverse()</code> mutate. Calling them on a prop or on state inside render mutates data you do not own; copy first (<code>[...arr].sort()</code>) or use <code>toSorted()</code>.",
        "Whitespace: JSX trims lines that contain only whitespace and newlines, so <code>&lt;b&gt;Hi&lt;/b&gt;</code> on one line followed by <code>{name}</code> on the next renders \"Hi\" and the name with <b>no space</b>. Add <code>{\" \"}</code> explicitly.",
        "Returning <code>undefined</code> from a component is allowed in React 18+, but forgetting the <code>return</code> in a multi-line arrow with braces (<code>items.map(i =&gt; { &lt;li/&gt; })</code>) silently renders nothing. Use parentheses <code>=&gt; ( … )</code>.",
        "<code>style=\"color: red\"</code> throws: React expects an object. And <code>style={{ width: \"100\" }}</code> sets an invalid value (no unit) that the browser ignores; use the number <code>100</code> or <code>\"100px\"</code>.",
        "Boolean attributes: <code>disabled={false}</code> removes the attribute (good), but <code>aria-hidden={false}</code> renders <code>aria-hidden=\"false\"</code> because ARIA attributes take string values. Know which kind you are setting.",
        "A <code>&lt;Fragment&gt;</code> wrapper changes nothing in the DOM, but swapping between <code>&lt;&gt;&lt;A/&gt;&lt;/&gt;</code> and <code>&lt;div&gt;&lt;A/&gt;&lt;/div&gt;</code> changes the tree structure, which resets <code>A</code>'s state (Day 4)."
      ],
      best: [
        "Key list items by the database id the API returns; make ids part of the API contract so the frontend never has to invent them.",
        "Keep the left side of <code>&amp;&amp;</code> boolean (<code>x &gt; 0</code>, <code>Boolean(x)</code>, <code>x != null</code>); use a ternary with <code>null</code> when in doubt.",
        "Prefer early returns for loading / error / empty states, and keep the main <code>return</code> for the happy path. Model the states as a discriminated union so TypeScript enforces each branch.",
        "Move non-trivial logic out of JSX: compute derived values (filtered lists, labels, formatted dates) in variables above the <code>return</code> or in small pure helpers. Nested ternaries more than one level deep should become a variable, a lookup object or a child component.",
        "Never pass user-controlled HTML to <code>dangerouslySetInnerHTML</code> without sanitising; wrap the only allowed use in one reviewed component.",
        "Use Fragments rather than wrapper <code>div</code>s that exist only to satisfy the single-root rule; extra divs break flex/grid layouts and table/list semantics (a <code>div</code> inside <code>&lt;tr&gt;</code> or <code>&lt;ul&gt;</code> is invalid HTML)."
      ],
      lab: [
        "In your Vite app, create <code>src/day2/Inbox.tsx</code> from the conditional-rendering example and render it from <code>App.tsx</code> with <code>unread={0}</code>. Confirm the stray \"0\" appears, then apply each fix and confirm it disappears.",
        "Create <code>src/day2/KeyDemo.tsx</code> from the index-key example. Type text into the first input of both lists, click \"Add to top\", and observe that the text moves to the \"New\" row only in the index-keyed list. Open React DevTools → Components and select the rows to see their keys.",
        "Create a <code>mock-users.ts</code> with 5 users shaped like a FastAPI response (<code>{ items, total }</code>, each user with <code>id</code>, <code>name</code>, <code>email</code>, <code>role</code>) and render them with the <code>UsersPanel</code> example. Pass each of the three states (<code>loading</code>, <code>error</code>, <code>success</code> with an empty and a non-empty list) and check the output of each.",
        "Remove the <code>key</code> from the <code>&lt;li&gt;</code> in <code>UsersPanel</code> and read the console warning; then give two users the same id and read the duplicate-key warning. Restore the code.",
        "Install DOMPurify (<code>npm install dompurify</code>), render the malicious comment body through both <code>CommentHtmlUnsafe</code> and <code>CommentHtmlSafe</code>, and confirm in the Elements panel that the sanitised version has no <code>onerror</code> attribute.",
        "<b>Done when:</b> you can predict, before saving, exactly what each of your components renders for 0, empty, null and error inputs; the key demo shows the bug only in the index list; there are no key warnings in the console; and the unsafe comment triggers an alert while the safe one does not."
      ],
      teach: `<p>"JSX looks like HTML, but it is really function calls. The compiler turns every tag into <code>jsx(type, props)</code>, which returns a small plain object called an element. That one fact explains all the rules: you need one root because a function returns one value, so use a Fragment; attributes are JavaScript property names, so it is <code>className</code> and <code>htmlFor</code>; <code>style</code> is an object; and inside curly braces you can only put expressions, never <code>if</code> or <code>for</code>, because braces become a function argument.</p>
<p>For conditions I use a ternary, <code>&amp;&amp;</code> or an early return. The trap is that React renders numbers, so <code>count &amp;&amp; …</code> shows a zero when count is zero; always make the left side a real boolean. Only <code>false</code>, <code>null</code>, <code>undefined</code> and <code>true</code> render nothing.</p>
<p>For lists I map data to elements and give each one a key, ideally the database id from the API. The key is how React knows which item is which between renders. If I use the index and then insert at the top, state such as typed text stays at the position and appears on the wrong row. Finally, React escapes every string, so rendering user input is safe; the one escape hatch, <code>dangerouslySetInnerHTML</code>, must only receive sanitised HTML."</p>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: "d2-components-props",
      title: "Components, props, children and composition",
      lv: ["fresher", "mid", "senior", "lead"],
      eli5: `<p>Think of LEGO. A component is a brick design: "a 2x4 red brick", "a window piece", "a door". You do not build a house by carving one giant block of plastic; you snap small, well-understood pieces together, and the same window piece is used in the house, the shop and the castle.</p>
<p>Props are the settings you choose when you take a brick out of the box: colour, size, label. The brick does not repaint itself after you have chosen; if you want a blue one, you take a different one out of the box (the parent passes new props). That is why props are read-only.</p>
<p><code>children</code> is the gap in a frame piece: a picture frame does not care what photo you put inside it, it just provides the border. A <code>Card</code> component works the same way: it provides the box, the padding and the shadow, and whatever you place between <code>&lt;Card&gt;</code> and <code>&lt;/Card&gt;</code> goes in the middle. And when a piece needs to tell the builder something ("I was clicked"), the builder hands it a walkie-talkie: a function prop such as <code>onSelect</code>.</p>`,
      what: `<p>A <b>component</b> is a JavaScript function whose name starts with a capital letter, which takes a single argument (the <b>props</b> object) and returns something renderable: JSX, a string, a number, <code>null</code>, or an array/fragment. You never call it yourself; you write <code>&lt;UserCard user={u} /&gt;</code> and React calls <code>UserCard({ user: u })</code> when it renders that part of the tree.</p>
<h4>Why the capital letter matters</h4>
<p>The JSX compiler decides the element <code>type</code> from the first letter: <code>&lt;button&gt;</code> becomes the string <code>"button"</code> (a host DOM element), while <code>&lt;Button&gt;</code> becomes a reference to the variable <code>Button</code>. Write <code>&lt;userCard /&gt;</code> and React tries to create an unknown DOM tag named <code>usercard</code>, with a warning, and your function is never called. Member expressions also work: <code>&lt;Icons.Check /&gt;</code>, <code>&lt;Tabs.Panel /&gt;</code>.</p>
<h4>Props</h4>
<ul class="pts">
<li><b>One object, created by the parent</b> on every render: every JSX attribute becomes a property; content between the tags becomes <code>props.children</code>.</li>
<li><b>Read-only.</b> A component must never assign to <code>props.x</code> or mutate objects it received (<code>props.user.name = …</code>, <code>props.items.push(…)</code>). The parent owns that data. In development React freezes the props object, so a direct assignment throws a <code>TypeError</code> (ES modules run in strict mode); nested objects are not frozen, so mutating them fails silently and corrupts the parent's data. To change what is shown, the owner changes its state (Day 3) and passes new props down.</li>
<li><b>Any value</b>: strings, numbers, booleans, objects, arrays, functions, other elements, components.</li>
<li><b>Destructure in the signature</b> for readability: <code>function Avatar({ src, size = 40 }: AvatarProps)</code>. Default values apply when the prop is <code>undefined</code> (missing), not when it is <code>null</code>. In React 19, <code>Component.defaultProps</code> is no longer supported for function components; defaults in destructuring are the standard.</li>
<li><b>Rest and spread</b>: <code>function Button({ variant, ...rest })</code> then <code>&lt;button {...rest} /&gt;</code> forwards everything else (event handlers, <code>aria-*</code>, <code>type</code>, <code>disabled</code>). Order matters: later props win.</li>
<li><b>Special names</b>: <code>key</code> is consumed by React and never reaches props. <code>ref</code>, in React 19, is passed to function components as a regular prop (before React 19 you needed <code>forwardRef</code>; Day 5 covers refs).</li>
</ul>
<h4>Typing props in TypeScript</h4>
<ul class="pts">
<li><b><code>type</code> or <code>interface</code></b>: both work for props. <code>interface</code> supports <code>extends</code> and declaration merging; <code>type</code> supports unions and intersections (<code>type Props = A &amp; ({ kind: "link"; href: string } | { kind: "button" })</code>). Pick one convention per codebase; many teams use <code>type</code> because unions are common in props.</li>
<li><b>Optional props</b> with <code>?</code>: <code>size?: "sm" | "md" | "lg"</code>. Pair with a default in destructuring so the body sees a non-optional value.</li>
<li><b>Children</b>: <code>children: ReactNode</code> (import <code>type ReactNode</code> from <code>"react"</code>, or write <code>React.ReactNode</code>). <code>ReactNode</code> accepts elements, strings, numbers, booleans, <code>null</code>, <code>undefined</code> and arrays of those. Use <code>ReactElement</code> only if you truly require a single element. <code>PropsWithChildren&lt;P&gt;</code> adds an optional <code>children</code> to <code>P</code>.</li>
<li><b>Extending native elements</b>: <code>type ButtonProps = ComponentProps&lt;"button"&gt; &amp; { variant?: "primary" | "ghost" }</code> gives your component every attribute a real <code>&lt;button&gt;</code> accepts (<code>onClick</code>, <code>disabled</code>, <code>type</code>, <code>aria-*</code>, …). <code>ComponentPropsWithoutRef&lt;"button"&gt;</code> excludes <code>ref</code> if you do not forward it. Use <code>Omit&lt;ComponentProps&lt;"input"&gt;, "size"&gt;</code> when your prop name clashes with a native one.</li>
<li><b>Function props</b>: <code>onSelect: (id: number) =&gt; void</code>. For DOM-event-shaped callbacks, reuse React's types: <code>onClick?: ComponentProps&lt;"button"&gt;["onClick"]</code> or <code>(e: React.MouseEvent&lt;HTMLButtonElement&gt;) =&gt; void</code>.</li>
<li><b><code>React.FC</code></b>: optional. Since the React 18 type definitions it no longer adds an implicit <code>children</code>, so the old objection is gone; plain function declarations with a typed props parameter are still the most common style and support generics more easily.</li>
</ul>
<h4>Children and composition</h4>
<p><code>children</code> is just a prop whose value is whatever you put between the tags. It lets a component be a <b>container</b> that does not know its contents: <code>Card</code>, <code>Modal</code>, <code>Layout</code>, <code>Panel</code>. When a container needs several holes, use <b>named slot props</b> that accept <code>ReactNode</code>: <code>&lt;Layout sidebar={&lt;Nav/&gt;} header={&lt;TopBar/&gt;}&gt;…&lt;/Layout&gt;</code>. This is <b>composition</b>: building specialised UI by combining general components, instead of adding a boolean prop for every variation (<code>showHeader</code>, <code>headerIcon</code>, <code>headerAction</code>, …). React has no inheritance model for components; composition covers what inheritance would.</p>
<p>Composition also reduces prop drilling: if a <code>Page</code> passes <code>user</code> through <code>Layout</code> only so that <code>Layout</code> can pass it to <code>Avatar</code>, let <code>Page</code> render <code>&lt;Layout header={&lt;Avatar user={user}/&gt;}&gt;</code> instead. <code>Layout</code> no longer needs to know about users at all. (Context, Day 6, is for when this is not enough.)</p>
<h4>Passing functions as props</h4>
<p>Data flows <b>down</b> through props. Events flow <b>up</b> through callbacks: the parent passes a function, and the child calls it. Convention: the prop is named <code>onSomething</code> (<code>onSelect</code>, <code>onDelete</code>), and the parent's implementation is named <code>handleSomething</code>. The child reports <i>what happened</i> (<code>onDelete(user.id)</code>); the parent decides <i>what to do</i> (call <code>DELETE /api/users/{id}</code>, update state).</p>
<h4>Purity</h4>
<p>React requires components to be <b>pure functions of their props (and state and context)</b> during render: given the same inputs they return the same JSX, and they do not change anything that existed before the call. Concretely, while rendering, do not: mutate props or module-level variables, write to <code>localStorage</code>, start fetches, set timers, change the DOM directly, or log analytics events. Creating and mutating <i>local</i> variables made during this render is fine. Side effects belong in event handlers (first choice) or effects (Day 5). React relies on this: it may call your component more than once, skip calls, or render in a different order (concurrent rendering, Day 12), and <code>&lt;StrictMode&gt;</code> deliberately calls component functions twice in development to surface impurity. The React Compiler (Day 11) also assumes purity when it auto-memoises.</p>
<h4>How to split a screen into components</h4>
<ul class="pts">
<li>Draw boxes around the mockup. Each box that has a single responsibility, repeats, or has its own states is a candidate component.</li>
<li>Name them after what they are in the product (<code>UserRow</code>, <code>RoleBadge</code>), not how they look (<code>BlueBox</code>).</li>
<li>Separate <b>data-owning</b> components (fetch, hold state, handle events; one per screen or feature) from <b>presentational</b> ones (receive props, render, report events). Presentational components are easy to test, reuse and put in Storybook.</li>
<li>Stop splitting when a piece has no reason to exist alone. A 10-line component used once is not a problem; a 400-line component with five concerns is.</li>
</ul>`,
      why: `<p>Without components, a UI is one large template or one large script. The jQuery-era "user list" page was a few hundred lines of DOM manipulation where the avatar markup, the role badge styling and the delete-button handler were all intertwined, copy-pasted wherever a user appeared, and changed in five places when the design changed. There was no unit smaller than the page to reason about, test or reuse.</p>
<p>Components give you <b>encapsulation</b> (markup, styling hooks and behaviour for one concept in one place), <b>reuse</b> (the same <code>Avatar</code> in the header, the list and the comment thread), and a <b>contract</b> (the props type) that documents and enforces how a piece may be used. Props make data flow explicit and one-directional: to know why a <code>UserRow</code> shows what it shows, you look at what its parent passed. That makes UIs predictable in a way two-way binding and global DOM mutation were not.</p>
<p>Children and composition exist because "configurable" components grow without limit: a <code>Card</code> with a <code>title</code>, then <code>titleIcon</code>, <code>subtitle</code>, <code>footerButtons</code>, <code>hideBorder</code>… Letting callers pass JSX into holes keeps the component small and the call site flexible. Purity exists because React needs freedom to decide <i>when</i> to render (batching, interruption, retries, double-invocation in development); that is only safe if rendering is a calculation with no side effects.</p>`,
      diagram: {
        html: lanes([
          ["UserListPage (owns data)", ["receives users from the API (Day 7: TanStack Query)", "handleSelect(id), handleDelete(id)", "renders Layout + UserList"]],
          ["Props flow down ↓", ["users: User[]", "selectedId: number | null", "onSelect, onDelete (functions)", "children / slot props (JSX)"]],
          ["Presentational children", ["Layout (header, sidebar, children)", "UserList → UserRow × n (key = user.id)", "UserRow → Avatar, RoleBadge, Button"]],
          ["Events flow up ↑", ["Button onClick → UserRow calls onDelete(user.id)", "parent decides: DELETE /api/users/{id}", "new data → new props → re-render"]]
        ]),
        steps: [
          "The data-owning component (one per screen) holds or fetches the data, here the <code>{ items, total }</code> returned by FastAPI <code>GET /api/users</code>.",
          "It renders presentational components and passes data down as props, plus callback functions for anything the children may report.",
          "Each child receives a read-only props object, renders purely from it, and composes smaller children (<code>Avatar</code>, <code>RoleBadge</code>) the same way. Containers such as <code>Layout</code> and <code>Card</code> receive JSX through <code>children</code> or slot props.",
          "When the user acts, a child calls a callback prop with the relevant id. The owner performs the side effect (API call, state update), which produces new props, and React re-renders the affected subtree."
        ]
      },
      ex: [
        {
          t: "A first component, and why the capital letter matters",
          lang: "tsx",
          code: `// src/components/Avatar.tsx
type AvatarProps = { name: string; src?: string; size?: number };

export function Avatar({ name, src, size = 40 }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return src ? (
    <img className="avatar" src={src} alt={name} width={size} height={size} />
  ) : (
    <span className="avatar avatar--initials" style={{ width: size, height: size }} aria-label={name}>
      {initials}
    </span>
  );
}

// src/App.tsx
import { Avatar } from "./components/Avatar";

export default function App() {
  return (
    <div>
      <Avatar name="Ana Rao" />                 {/* React calls Avatar({ name: "Ana Rao" }) */}
      <Avatar name="Ben Iyer" size={64} src="/img/ben.png" />
      {/* <avatar name="x" />  -> unknown DOM tag "avatar", function never called */}
    </div>
  );
}`,
          out: `<span class="avatar avatar--initials" style="width: 40px; height: 40px;" aria-label="Ana Rao">AR</span>
<img class="avatar" src="/img/ben.png" alt="Ben Iyer" width="64" height="64">`,
          note: `<p>You render a component with JSX, never by calling it (<code>{Avatar({ name })}</code>). Calling it directly runs it as part of the <i>parent's</i> render: it gets no fiber of its own, any hooks inside it attach to the parent, and React DevTools cannot see it.</p>`
        },
        {
          t: "Props are read-only: the mutation bug and the fix",
          lang: "tsx",
          code: `// src/components/TagList.tsx
type TagListProps = { tags: string[]; title: string };

// BUG: mutates data owned by the parent
export function TagListBad(props: TagListProps) {
  props.tags.sort();                    // sorts the PARENT's array in place
  // props.title = props.title.trim();  // TypeError in dev: props object is frozen
  return (
    <ul aria-label={props.title}>
      {props.tags.map((t) => <li key={t}>{t}</li>)}
    </ul>
  );
}

// FIX: derive new values; never touch what you received
export function TagList({ tags, title }: TagListProps) {
  const sorted = [...tags].sort();      // local copy: mutating it is fine
  const label = title.trim();
  return (
    <ul aria-label={label}>
      {sorted.map((t) => <li key={t}>{t}</li>)}
    </ul>
  );
}

// Make the contract visible in the type (optional but useful):
type StrictTagListProps = { readonly tags: readonly string[]; readonly title: string };
export function TagListStrict({ tags }: StrictTagListProps) {
  // tags.sort();  // TS error: Property 'sort' does not exist on type 'readonly string[]'
  return <p>{tags.length} tags</p>;
}`,
          out: `TagListBad: the parent's array is now sorted too; if the parent renders it elsewhere, that list changes order.
TagList: parent's array untouched.`,
          note: `<p>The frozen-props <code>TypeError</code> only happens for direct assignments to the props object and only in development. Nested mutation (<code>props.tags.sort()</code>, <code>props.user.name = …</code>) is silent in both dev and prod, which is why <code>readonly</code> types and code review matter.</p>`
        },
        {
          t: "Typing props: type vs interface, optional props, unions, children",
          lang: "tsx",
          code: `// src/components/Alert.tsx
import type { ReactNode } from "react";

// interface: good for object shapes and extension
interface AlertBaseProps {
  title: string;
  children?: ReactNode;          // optional: an Alert may have only a title
}

// type: needed for unions
type Tone = "info" | "success" | "warning" | "error";

type AlertProps = AlertBaseProps & {
  tone?: Tone;                   // optional, defaulted below
  // A discriminated union: if dismissible, onDismiss is REQUIRED
} & ({ dismissible?: false } | { dismissible: true; onDismiss: () => void });

export function Alert(props: AlertProps) {
  const { title, children, tone = "info" } = props;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={"alert alert--" + tone}>
      <strong>{title}</strong>
      {children && <div className="alert__body">{children}</div>}
      {props.dismissible && (
        <button type="button" aria-label="Dismiss" onClick={props.onDismiss}>
          ×
        </button>
      )}
    </div>
  );
}

// Usage
export function Demo() {
  return (
    <>
      <Alert title="Saved" tone="success" />
      <Alert title="Could not reach the API" tone="error" dismissible onDismiss={() => console.log("closed")}>
        FastAPI returned 503. Retrying in 5 seconds.
      </Alert>
      {/* <Alert title="x" dismissible />  TS error: onDismiss is missing */}
    </>
  );
}`,
          note: `<p><code>props.dismissible &amp;&amp; …</code> narrows the union so <code>props.onDismiss</code> is known to exist. Destructuring <code>dismissible</code> and <code>onDismiss</code> separately would lose that narrowing in older TypeScript versions, which is why the example reads them from <code>props</code>. <code>{children &amp;&amp; …}</code> is safe here only because a number child would be unusual; if numbers are possible, use <code>children != null</code>.</p>`
        },
        {
          t: "Extending a native element with ComponentProps&lt;'button'&gt;",
          lang: "tsx",
          code: `// src/components/Button.tsx
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  type = "button",          // safer default than the browser's "submit"
  ...rest                   // onClick, aria-*, form, name, ref (React 19), …
}: ButtonProps) {
  const classes = ["btn", "btn--" + variant, "btn--" + size, className].filter(Boolean).join(" ");
  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? "Working…" : children}
    </button>
  );
}

// Usage: every native button prop is typed and forwarded
// <Button variant="danger" onClick={() => remove(user.id)} aria-label={"Delete " + user.name}>Delete</Button>
// <Button type="submit" form="user-form" loading={isSaving}>Save</Button>`,
          out: `<button type="button" class="btn btn--danger btn--md" aria-label="Delete Ana Rao">Delete</button>`,
          note: `<p>Spread <code>{...rest}</code> <b>first</b>, then set the props you control, so a caller cannot accidentally override <code>className</code> merging or the <code>disabled</code> logic. Defaulting <code>type</code> to <code>"button"</code> prevents the classic bug where any button inside a <code>&lt;form&gt;</code> submits it. In React 19, <code>ref</code> is included in <code>ComponentProps&lt;"button"&gt;</code> and is forwarded by the spread; on React 18 you would need <code>forwardRef</code>.</p>`
        },
        {
          t: "Children and composition: Card and Layout with slots",
          lang: "tsx",
          code: `// src/components/Card.tsx
import type { ReactNode } from "react";

type CardProps = {
  title?: ReactNode;        // a slot: string or any JSX
  actions?: ReactNode;      // another slot
  children: ReactNode;      // the main hole
};

export function Card({ title, actions, children }: CardProps) {
  return (
    <section className="card">
      {(title || actions) && (
        <header className="card__header">
          {title && <h2 className="card__title">{title}</h2>}
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}

// src/components/Layout.tsx
type LayoutProps = { header: ReactNode; sidebar?: ReactNode; children: ReactNode };

export function Layout({ header, sidebar, children }: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout__header">{header}</header>
      {sidebar && <aside className="layout__sidebar">{sidebar}</aside>}
      <main className="layout__main">{children}</main>
    </div>
  );
}

// Usage: Layout and Card know nothing about users
// <Layout header={<TopBar user={me} />} sidebar={<NavLinks />}>
//   <Card title="Team" actions={<Button size="sm">Invite</Button>}>
//     <UserList users={users} onSelect={setSelectedId} />
//   </Card>
// </Layout>`,
          note: `<p>Because <code>Page</code> builds <code>&lt;TopBar user={me} /&gt;</code> itself and hands the finished element to <code>Layout</code>, <code>Layout</code> does not need a <code>user</code> prop. That is composition removing prop drilling. The two components are in two files; if you put them in one, import <code>ReactNode</code> once.</p>`
        },
        {
          t: "Functions as props: data down, events up",
          lang: "tsx",
          code: `// src/features/users/UserRow.tsx
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/Button";
import type { User } from "./types";

type UserRowProps = {
  user: User;
  selected: boolean;
  onSelect: (id: number) => void;   // the child reports WHAT happened…
  onDelete: (id: number) => void;
};

export function UserRow({ user, selected, onSelect, onDelete }: UserRowProps) {
  return (
    <li className={selected ? "row row--selected" : "row"} aria-selected={selected}>
      <button type="button" className="row__main" onClick={() => onSelect(user.id)}>
        <Avatar name={user.name} size={32} />
        <span>{user.name}</span>
      </button>
      <Button variant="danger" size="sm" onClick={() => onDelete(user.id)} aria-label={"Delete " + user.name}>
        Delete
      </Button>
    </li>
  );
}

// In the parent, which decides WHAT TO DO:
// function handleDelete(id: number) {
//   if (!confirm("Delete this user?")) return;
//   void fetch(\`/api/users/\${id}\`, { method: "DELETE" });   // Day 7 does this properly
// }
// <UserRow user={u} selected={u.id === selectedId} onSelect={setSelectedId} onDelete={handleDelete} />`,
          note: `<p><code>onClick={() =&gt; onSelect(user.id)}</code> passes a new arrow function; that is normal and cheap. Do <b>not</b> write <code>onClick={onSelect(user.id)}</code>: that <i>calls</i> <code>onSelect</code> during render (an impure render that may loop if it updates state) and passes its return value as the handler.</p>`
        },
        {
          t: "Purity: impure render vs pure render",
          lang: "tsx",
          code: `// src/components/Purity.tsx
let renderCount = 0;                      // module-level variable

// IMPURE: output depends on hidden mutable state, and render has side effects
export function TicketImpure({ title }: { title: string }) {
  renderCount++;                          // mutates something outside the call
  document.title = title;                 // touches the DOM during render
  localStorage.setItem("lastTicket", title);
  return <p>#{renderCount} {title}</p>;   // StrictMode in dev shows #2, #4, #6…
}

// PURE: same props → same JSX. Anything that varies is an input.
type TicketProps = { number: number; title: string; createdAt: string };

export function Ticket({ number, title, createdAt }: TicketProps) {
  const created = new Date(createdAt).toLocaleString("en-IN"); // local, derived: fine
  return (
    <p>
      #{number} {title} <time dateTime={createdAt}>{created}</time>
    </p>
  );
}
// Side effects move OUT of render:
// - to event handlers (onClick → save, track analytics), or
// - to an effect when syncing with an external system (Day 5:
//   useEffect(() => { document.title = title; }, [title])).`,
          out: `TicketImpure under <StrictMode> in development: "#2 Fix login" on first paint, because React called the function twice.
Ticket: "#17 Fix login 16/11/2026, 10:30:00" every time for the same props.`,
          note: `<p>Reading <code>Date.now()</code> or <code>Math.random()</code> during render is also impure (the output changes for the same props). If a component needs "now", pass it in or compute it in an event/effect. Local mutation is fine: <code>const rows = []; for (…) rows.push(&lt;li key=…/&gt;)</code> creates and mutates data born inside this render.</p>`
        },
        {
          t: "Realistic: splitting a FastAPI-backed UserList screen",
          lang: "tsx",
          code: `// ---------- src/features/users/types.ts ----------
// Mirrors the FastAPI Pydantic response model for GET /api/users
export type Role = "admin" | "member" | "viewer";
export type User = { id: number; name: string; email: string; role: Role; active: boolean };
export type UserPage = { items: User[]; total: number };

// ---------- src/features/users/RoleBadge.tsx ----------
import type { Role } from "./types";
const LABEL: Record<Role, string> = { admin: "Admin", member: "Member", viewer: "Read-only" };
export function RoleBadge({ role }: { role: Role }) {
  return <span className={"badge badge--" + role}>{LABEL[role]}</span>;
}

// ---------- src/features/users/EmptyState.tsx ----------
import type { ReactNode } from "react";
export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <p>{title}</p>
      {action}
    </div>
  );
}

// ---------- src/features/users/UserList.tsx (presentational) ----------
import type { User } from "./types";
import { UserRow } from "./UserRow";             // from the previous example
import { EmptyState } from "./EmptyState";

type UserListProps = {
  users: User[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
};

export function UserList({ users, selectedId, onSelect, onDelete }: UserListProps) {
  if (users.length === 0) return <EmptyState title="No users match your filters." />;
  return (
    <ul className="user-list">
      {users.map((u) => (
        <UserRow key={u.id} user={u} selected={u.id === selectedId} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </ul>
  );
}

// ---------- src/features/users/UserListPage.tsx (owns data + events) ----------
import { useState } from "react";                // Day 3
import type { UserPage } from "./types";
import { UserList } from "./UserList";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

// Day 7 replaces this prop with useQuery({ queryKey: ["users"], queryFn: … })
export function UserListPage({ page }: { page: UserPage }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  function handleDelete(id: number) {
    console.log("DELETE /api/users/" + id);     // real call + cache update: Day 7
  }

  return (
    <Card
      title={<>Users <small>({page.total})</small></>}
      actions={<Button size="sm" onClick={() => console.log("invite")}>Invite</Button>}
    >
      <UserList users={page.items} selectedId={selectedId} onSelect={setSelectedId} onDelete={handleDelete} />
    </Card>
  );
}`,
          out: `Users (3)                                  [Invite]
 (AR) Ana Rao      [Delete]
 (BI) Ben Iyer     [Delete]   <- highlighted after click
 (CM) Chen Ma      [Delete]`,
          note: `<p>This is several files shown together; each <code>// ----------</code> block is its own module with its own imports. Only <code>UserListPage</code> knows about state and the API; <code>UserList</code>, <code>UserRow</code>, <code>RoleBadge</code>, <code>Avatar</code>, <code>Card</code> and <code>Button</code> are pure and can be rendered in a test or Storybook with plain props. Use <code>RoleBadge</code> inside <code>UserRow</code> as an exercise.</p>`
        }
      ],
      internals: `<p><b>A component is an element type.</b> <code>&lt;UserRow user={u} /&gt;</code> produces <code>{ type: UserRow, props: { user: u } }</code>; the function itself is the <code>type</code>. When React reconciles, it creates a <b>fiber</b> for that element with the tag <i>FunctionComponent</i>, and during the render phase calls <code>UserRow(props)</code> (in the reconciler this is <code>renderWithHooks</code>, which also sets up the hooks list for that fiber). The returned elements become that fiber's children, and React recurses. The DOM is touched only later, in the commit phase (Day 4, Day 12).</p>
<p><b>Identity is by reference.</b> React decides "same component as last time" by comparing <code>type</code> with <code>===</code>, plus the position and key. If you define a component <i>inside</i> another component (<code>function Parent() { function Row() {…} return &lt;Row/&gt;; }</code>), <code>Row</code> is a new function on every render, so React sees a different type, unmounts the old subtree and mounts a new one, losing state and focus every time. Always define components at module top level.</p>
<p><b>Props objects are new every render.</b> Each time the parent renders, JSX creates a fresh props object (and fresh arrow functions, arrays and objects inside it). React's default is to re-render all children of a component that rendered, regardless of whether props changed. <code>React.memo</code> can skip a child when its props are shallowly equal, which is where stable references start to matter (Day 11); the React Compiler can automate that memoisation for components that follow the rules.</p>
<p><b><code>children</code> is ordinary.</b> The compiler puts nested content into <code>props.children</code>: a single child is the value itself, multiple static children are an array. There is nothing special about it at runtime; a <code>sidebar</code> prop holding JSX works identically. Elements in <code>children</code> are created by the <i>parent</i> (the component whose JSX they appear in), which is why a <code>Layout</code> re-rendering does not necessarily re-render the <code>children</code> it was given: their elements are the same objects as last time, and React bails out on identical element references (Day 4 uses this for performance). The legacy <code>Children</code> utilities and <code>cloneElement</code> exist but are discouraged; prefer explicit props.</p>
<p><b>Dev-time enforcement.</b> In development, React freezes each element and its props object, warns on missing keys, and under <code>StrictMode</code> calls every component function twice per render (discarding one result) to surface impure renders. In React 19, <code>propTypes</code> checks are no longer run and <code>defaultProps</code> is ignored for function components; TypeScript and default parameters replace them.</p>`,
      prod: `<p><b>Component boundaries follow features.</b> In a React + FastAPI product, a typical layout is <code>src/components/</code> (design-system primitives: <code>Button</code>, <code>Card</code>, <code>Avatar</code>) and <code>src/features/users/</code> (feature components, types, API hooks). The <code>User</code> type should be generated from FastAPI's OpenAPI schema (for example with <code>openapi-typescript</code>) rather than hand-written, so that when the backend renames <code>full_name</code> the TypeScript build breaks in every component that uses it (Day 14). Converting snake_case to camelCase happens once at the API boundary, not in components.</p>
<p><b>Primitives extend native props.</b> Design-system components built with <code>ComponentProps&lt;"button"&gt;</code> and a rest spread keep accessibility attributes, <code>data-testid</code>, form attributes and refs working for every caller. Primitives that accept only a hand-picked list of props are the most common source of "I can't add <code>aria-label</code> to this" tickets and of forks of the component.</p>
<p><b>Composition beats configuration at scale.</b> A shared <code>Table</code> that grew 40 boolean props over two years is a recognisable failure mode: every new screen adds a flag, combinations are untested, and nobody dares change it. Slot props (<code>toolbar</code>, <code>emptyState</code>, <code>renderRow</code>) or compound components (Day 10) keep the core small.</p>
<p><b>Impurity bugs surface late.</b> A component that increments a module-level counter, sorts a prop in place, or fires an analytics event in its body works in a quick demo, then shows double counts under StrictMode, wrong ordering after a cache refresh (TanStack Query returns the same cached array to every subscriber, so in-place sort affects every screen), or duplicated events when concurrent rendering retries a render. Treat props and query data as immutable.</p>
<p><b>Splitting by data ownership.</b> One data-owning component per screen (or per independently loading region) that talks to the API, and a tree of presentational components below it, gives a natural testing split: presentational pieces with plain props in Vitest + Testing Library, and the owner with MSW mocking <code>/api/users</code> (Day 14).</p>`,
      iq: [
        ["fresher", "What is the difference between props and state?", "<p>Props are inputs passed <i>to</i> a component by its parent; the component reads them but must not change them. State is data a component <i>owns</i> and can update (with <code>useState</code>, Day 3), which triggers a re-render. A child's props are frequently the parent's state. The tempting wrong answer \"props can't change\" is imprecise: props change over time when the parent re-renders with new values; the child just cannot change them itself.</p>"],
        ["fresher", "Why must component names start with a capital letter?", "<p>The JSX compiler uses the first letter to decide the element type: lowercase becomes a string (a built-in DOM tag such as <code>\"div\"</code>), capitalised becomes a reference to the variable in scope. <code>&lt;myButton/&gt;</code> therefore creates an unknown DOM element named <code>mybutton</code>, with a warning, and never calls your function.</p>"],
        ["fresher", "What is <code>children</code>, and when would you use it?", "<p><code>children</code> is the prop that holds whatever is nested between a component's opening and closing tags. Use it for container components that should not know their content: <code>Card</code>, <code>Modal</code>, <code>Layout</code>, <code>Button</code> labels. Type it as <code>ReactNode</code>. For more than one hole, use additional props that accept <code>ReactNode</code> (slots), such as <code>header</code> or <code>footer</code>.</p>"],
        ["mid", "How does a child component send data back to its parent?", "<p>The parent passes a function as a prop (<code>onSelect</code>, <code>onChange</code>), and the child calls it with the data (<code>onSelect(user.id)</code>). Data flows down via props; events flow up via callbacks. The parent then updates its state, which flows back down as new props. The wrong answers are mutating a prop object so the parent \"sees\" the change (breaks immutability, the parent will not re-render) or reaching into the parent through refs.</p>"],
        ["mid", "How do you set default values for props in a modern function component?", "<p>Use default values in destructuring: <code>function Button({ size = \"md\", variant = \"primary\" }: Props)</code>, and mark those props optional in the type. Defaults apply when the value is <code>undefined</code>, not <code>null</code>. <code>Component.defaultProps</code> was the class-era mechanism; React 19 no longer applies it to function components, so code relying on it silently loses its defaults after an upgrade.</p>"],
        ["mid", "How would you type a <code>Button</code> component so it accepts every attribute a native button does, plus a <code>variant</code>?", "<p><code>type ButtonProps = ComponentProps&lt;\"button\"&gt; &amp; { variant?: \"primary\" | \"ghost\" }</code>, destructure your own props, collect the rest with <code>...rest</code>, and spread it onto the <code>&lt;button&gt;</code> before your controlled props. Use <code>Omit&lt;…, \"name\"&gt;</code> if a custom prop collides with a native one, and <code>ComponentPropsWithoutRef</code> if you deliberately do not forward refs. Hand-listing <code>onClick</code>, <code>disabled</code> and so on is the tempting wrong approach: it drops <code>aria-*</code>, <code>form</code>, <code>data-*</code> and every attribute you forgot.</p>"],
        ["senior", "What does it mean for a component to be pure, and why does React care?", "<p>Given the same props, state and context, it returns the same JSX, and it does not modify anything that existed before it was called (props, module variables, the DOM, storage, network). React cares because it controls when and how often render runs: it may render twice (StrictMode in development), discard a render and retry (concurrent rendering, Suspense), skip renders (<code>memo</code>, the Compiler), or render in a different order. Those optimisations are only correct if render is a calculation. Side effects belong in event handlers or effects. Mutating local variables created during render is fine.</p>"],
        ["senior", "Why is defining a component inside another component a bug?", "<p>Every render of the outer component creates a new inner function, so the element <code>type</code> is a different reference each time. React compares types with <code>===</code>, sees a different component, and unmounts the old subtree and mounts a new one: state is lost, inputs lose focus, effects re-run, and it is slow. Define components at module scope and pass what they need as props.</p>"],
        ["lead", "A shared <code>DataTable</code> has 35 boolean and config props and every team adds more. How do you fix the API?", "<p>Move from configuration to composition: keep a small core (data, columns, row key) and expose slots for the varying parts (<code>toolbar</code>, <code>emptyState</code>, <code>renderCell</code>, <code>rowActions</code>), or a compound API (<code>&lt;Table&gt;&lt;Table.Header/&gt;&lt;Table.Body/&gt;&lt;/Table&gt;</code>, Day 10) or a headless hook (TanStack Table style) where teams own the markup. Deprecate flags gradually with codemods, keep native-prop pass-through for accessibility, and document recipes. The tempting answer \"split it into DataTableV2 with different flags\" repeats the problem.</p>"],
        ["architect", "How do you keep component props and the FastAPI backend contract in sync across many teams?", "<p>Treat the OpenAPI schema FastAPI generates from Pydantic models as the source of truth and generate TypeScript types (and optionally a typed client) in CI. Feature components consume those generated types at the boundary, map them once into UI-friendly shapes if needed (camelCase, dates parsed), and presentational components declare narrow props (<code>Pick&lt;User, \"name\" | \"role\"&gt;</code>) so they do not depend on the whole API shape. A backend change then fails the frontend build instead of production. Combine with contract tests or MSW handlers generated from the same schema.</p>"]
      ],
      gotchas: [
        "<code>onClick={onDelete(user.id)}</code> calls the function during render and passes its return value; write <code>onClick={() =&gt; onDelete(user.id)}</code>.",
        "Defaults in destructuring apply to <code>undefined</code> only. If the API sends <code>null</code> for a missing avatar, <code>{ src = \"/default.png\" }</code> does not kick in; normalise <code>null</code> at the API boundary or use <code>src ?? \"/default.png\"</code>.",
        "Spread order matters: <code>&lt;button className=\"btn\" {...rest}&gt;</code> lets a caller's <code>className</code> replace yours; <code>&lt;button {...rest} className=…&gt;</code> lets yours win. Merge deliberately.",
        "<code>{...props}</code> onto a DOM element forwards non-DOM props too (<code>variant</code>, <code>loading</code>), causing \"React does not recognize the <code>loading</code> prop on a DOM element\" warnings. Destructure your custom props out before spreading.",
        "A component defined inside another component is a new type every render: its state resets and inputs lose focus on every keystroke.",
        "In development the props object is frozen, so <code>props.x = 1</code> throws; nested objects are <b>not</b> frozen, so <code>props.user.name = \"x\"</code> silently corrupts the parent's (and possibly the query cache's) data.",
        "<code>children</code> can be a single element, a string, an array, <code>false</code> or <code>undefined</code>. Code like <code>children.map(...)</code> or <code>children.length</code> breaks; render it as-is, or accept an explicit array prop if you need to iterate.",
        "Do not call a component as a function (<code>{UserRow({ user })}</code>). It works until the component uses a hook, then hooks attach to the parent and break the rules of hooks when the call is conditional."
      ],
      best: [
        "Keep components small and named after domain concepts; one data-owning component per screen, presentational components below it.",
        "Destructure props in the signature with defaults; type them with a single <code>Props</code> type per component, and export it if callers need it.",
        "Build primitives on native props (<code>ComponentProps&lt;\"button\"&gt;</code> + rest spread) so accessibility and form attributes always work; default <code>type=\"button\"</code>.",
        "Prefer <code>children</code> and slot props over boolean configuration flags; reach for compound components (Day 10) when slots are not enough.",
        "Name callback props <code>onX</code> and handlers <code>handleX</code>; children report events with ids, parents decide what to do.",
        "Keep render pure: no mutation of props or outer variables, no fetches, timers, storage writes or analytics in the body. Keep <code>&lt;StrictMode&gt;</code> on in development to catch violations.",
        "Generate prop-facing data types from the FastAPI OpenAPI schema instead of hand-writing them."
      ],
      lab: [
        "Create <code>src/components/Avatar.tsx</code>, <code>Button.tsx</code> and <code>Card.tsx</code> from the examples. Render a few variants in <code>App.tsx</code>, and confirm in the Elements panel that <code>aria-label</code> and <code>data-testid</code> passed to <code>Button</code> reach the DOM.",
        "Create <code>src/features/users/</code> with <code>types.ts</code>, <code>RoleBadge.tsx</code>, <code>EmptyState.tsx</code>, <code>UserRow.tsx</code>, <code>UserList.tsx</code> and <code>UserListPage.tsx</code>. Add <code>RoleBadge</code> to <code>UserRow</code>. Feed <code>UserListPage</code> a mock <code>{ items, total }</code> object shaped like the FastAPI response.",
        "Click rows and Delete buttons: selection should highlight the clicked row, and the console should log <code>DELETE /api/users/&lt;id&gt;</code> with the right id. Pass an empty <code>items</code> array and confirm the empty state renders.",
        "Break purity on purpose: in <code>UserList</code>, add <code>users.sort((a, b) =&gt; a.name.localeCompare(b.name))</code> and render the same mock array in a second place in <code>App</code> in its original order. Observe both lists reorder. Fix it with a copy.",
        "Try to break the types: render <code>&lt;Alert title=\"x\" dismissible /&gt;</code> without <code>onDismiss</code>, pass <code>variant=\"pink\"</code> to <code>Button</code>, and write <code>&lt;userRow /&gt;</code>. Run <code>npx tsc -b</code> (or watch your editor) and read each error.",
        "<b>Done when:</b> the user list renders from mock data through at least five components, no component except <code>UserListPage</code> holds state, <code>npx tsc -b</code> passes with no errors, the console has no React warnings, and you can point to where data flows down and where each event flows up."
      ],
      teach: `<p>"A component is a capitalised function that takes one props object and returns JSX. The capital letter matters because the compiler treats lowercase tags as DOM elements. Props are the component's inputs and they are read-only: the parent owns that data, and if something needs to change, the owner updates its state and passes new props down. I destructure props in the signature with default values, and in TypeScript I describe them with a type: optional props with a question mark, <code>children</code> as <code>ReactNode</code>, and for primitives like a Button I extend <code>ComponentProps&lt;"button"&gt;</code> and spread the rest so every native attribute still works.</p>
<p>Data goes down through props; events come back up through callback props like <code>onSelect</code>: the child says what happened, the parent decides what to do, for example call DELETE on the FastAPI endpoint. For reuse I prefer composition: a Card or Layout takes <code>children</code> and slot props, so it doesn't need a flag for every variation, and I avoid prop drilling by passing finished elements.</p>
<p>And components must be pure: same props in, same JSX out, no mutation and no side effects during render, because React may render more than once; StrictMode double-calls components in development to prove it. In practice I split a screen into one data-owning component and a tree of small presentational ones that are trivial to test."</p>`
    }
  ],
  quiz: [
    {
      q: `A notification bell shows a stray <b>0</b> next to the icon for new users. What renders, and what is the fix?`,
      code: `function Bell({ count }: { count: number }) {
  return (
    <button aria-label="Notifications">
      🔔 {count && <span className="badge">{count}</span>}
    </button>
  );
}
// <Bell count={0} />`,
      lang: "tsx",
      ans: `It renders "🔔 0". Use <code>{count &gt; 0 &amp;&amp; …}</code> or a ternary returning <code>null</code>.`,
      why: `<p><code>0 &amp;&amp; x</code> evaluates to <code>0</code>, and React renders numbers as text. Only <code>false</code>, <code>true</code>, <code>null</code>, <code>undefined</code> and <code>""</code> render nothing. The left side of <code>&amp;&amp;</code> in JSX should always be a real boolean.</p>`
    },
    {
      q: `A todo list renders an uncontrolled <code>&lt;input&gt;</code> per row. The user types "buy milk" next to the first todo, then adds a new todo at the top. The text "buy milk" now appears next to the <i>new</i> todo. Why?`,
      code: `{todos.map((todo, i) => (
  <li key={i}>
    {todo.title} <input placeholder="notes" />
  </li>
))}`,
      lang: "tsx",
      ans: `Index keys: the input's DOM state stays with key <code>0</code>, which is now the new todo. Key by <code>todo.id</code>.`,
      why: `<p>React matches old and new children by key. Old key <code>0</code> (the first todo, with "buy milk" typed into its DOM input) matches new key <code>0</code> (the new todo), so React keeps that <code>&lt;li&gt;</code> and its input and only updates the title text. With <code>key={todo.id}</code>, React would see the existing ids, keep their rows, and insert a fresh row at the top. Ids should be assigned when the todo is created (by the API or <code>crypto.randomUUID()</code> in the handler), never during render.</p>`
    },
    {
      q: `This component is used in two places on the dashboard with the same <code>users</code> array (from the TanStack Query cache). After it renders, the <i>other</i> list, which was supposed to be in API order, is also sorted. Find the bug.`,
      code: `function SortedUsers({ users }: { users: User[] }) {
  users.sort((a, b) => a.name.localeCompare(b.name));
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}`,
      lang: "tsx",
      ans: `<code>sort()</code> mutates the prop in place, which is the shared cached array. Use <code>[...users].sort(…)</code> or <code>users.toSorted(…)</code>.`,
      why: `<p>Props are read-only and render must be pure. The props object is frozen in development, but the array inside it is not, so the mutation is silent. Every consumer of the same array reference (another component, the query cache) now sees sorted data. Copy before sorting; mutating a copy created during this render is fine.</p>`
    },
    {
      q: `What does this render?`,
      code: `function Profile() {
  const user = { name: "Ana", joined: new Date("2024-01-01") };
  return (
    <div>
      {user.name}
      {false}
      {null}
      {undefined}
      {user.joined}
    </div>
  );
}`,
      lang: "tsx",
      ans: `It throws: "Objects are not valid as a React child (found: [object Date])".`,
      why: `<p><code>false</code>, <code>null</code> and <code>undefined</code> render nothing, and <code>"Ana"</code> renders as text, but a <code>Date</code> is an object, and plain objects are not renderable. Render a string instead: <code>{user.joined.toLocaleDateString()}</code>. TypeScript catches this in most cases because <code>Date</code> is not assignable to <code>ReactNode</code>.</p>`
    },
    {
      q: `Every time the user types a character into the search box, the input loses focus. Why?`,
      code: `function UsersScreen({ users }: { users: User[] }) {
  const [query, setQuery] = useState("");

  function SearchBox() {
    return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
  }

  return (
    <>
      <SearchBox />
      <UserList users={users.filter((u) => u.name.includes(query))} />
    </>
  );
}`,
      lang: "tsx",
      ans: `<code>SearchBox</code> is defined inside <code>UsersScreen</code>, so it is a new component type on every render; React unmounts and remounts the input each keystroke.`,
      why: `<p>React decides whether an element is "the same component" by comparing its <code>type</code> by reference. A function declared inside another component is recreated on every render, so React destroys the old <code>&lt;input&gt;</code> (and its focus) and mounts a new one. Move <code>SearchBox</code> to module scope and pass <code>value</code> and <code>onChange</code> as props.</p>`
    },
    {
      q: `A designer wants the shared <code>Card</code> to support an optional header icon, an optional "View all" link and an optional menu. A teammate proposes adding <code>showIcon</code>, <code>iconName</code>, <code>showViewAll</code>, <code>viewAllHref</code> and <code>menuItems</code> props. Which approach would you choose?`,
      ans: `Add slot props instead: <code>title?: ReactNode</code> and <code>actions?: ReactNode</code> (plus <code>children</code>), and let callers pass the icon, link or menu as JSX.`,
      why: `<p>Composition keeps <code>Card</code> small and stable: it controls the layout and styling of the header area, while callers decide what goes in it. Flag-based configuration grows with every new request, produces untested combinations, and couples the primitive to every feature. Reach for compound components (Day 10) if the slots need to share state.</p>`
    }
  ]
},
/* ===== Day 3 ===== */
{
  n: 3,
  title: "State and events",
  goal: `<b>By the end of today</b> you can explain why a component needs <code>useState</code> instead of a local variable, predict exactly what a click handler that calls a setter several times will render, update objects and arrays immutably without reaching for mutation, and build a typed login form (controlled inputs, loading and error state) that posts to a FastAPI <code>/api/login</code> endpoint.`,
  rev: [
    `<b>State is memory React keeps for a component instance</b>, outside the function. Local variables are recreated on every call and changing them does not trigger a render. <code>const [x, setX] = useState(initial)</code> returns the value <i>for this render</i> and a stable setter that queues an update and schedules a re-render.`,
    `<b>State is a snapshot.</b> Inside one render, <code>count</code> is a constant. <code>setCount(count + 1)</code> three times queues "replace with 1" three times, so the result is +1. <code>setCount(c =&gt; c + 1)</code> three times queues three functions, each applied to the previous result, so the result is +3. Reading <code>count</code> right after calling the setter still gives the old value.`,
    `<b>Batching:</b> React waits until the event handler finishes, then processes all queued updates in one render. Since React 18 with <code>createRoot</code>, this automatic batching also applies inside <code>setTimeout</code>, promises and native event listeners. <code>flushSync</code> opts out (rarely needed).`,
    `<b>Immutable updates:</b> React compares old and new state with <code>Object.is</code>. Mutating an object or array and passing the same reference back is "no change", so nothing re-renders. Create new values: <code>{...obj, k: v}</code>, <code>[...arr, x]</code>, <code>arr.map</code>, <code>arr.filter</code>, <code>arr.toSorted()</code>; copy every level you change in nested data. Immer lets you write "mutating" code that produces immutable copies.`,
    `<b>Events and forms:</b> pass a function (<code>onClick={handle}</code>), don't call it (<code>onClick={handle()}</code>). React attaches one listener per event type to the root container and hands you a <code>SyntheticEvent</code>. Controlled input: <code>value</code> + <code>onChange</code>, state is the source of truth. Uncontrolled: <code>defaultValue</code> + read with <code>FormData</code> or a ref on submit. Never let <code>value</code> switch between <code>undefined</code> and a string.`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d3-state",
      title: "State with useState: snapshots, batching and immutable updates",
      lv: ["fresher", "mid", "senior"],
      eli5: `<p>Imagine a component is a photographer who is asked, over and over, "take a picture of the screen right now". Each picture is a render. The photographer has no memory: every time they are called, they start from scratch. If they scribbled "count = 3" on a napkin during the last picture, that napkin was thrown away the moment the picture was taken.</p>
<p>So React keeps a <b>locker</b> for each component on the screen. Before taking a picture, the photographer opens their locker and reads "count is 3". That is <code>useState</code>: it hands you what is in the locker for <i>this</i> picture. The setter function is a note you slip into the locker saying "next time, count should be 4". You do not change the picture you are holding; you ask for a new one.</p>
<p>Two consequences follow. First, if you slip three notes that all say "make it 1" (because you read 0 from the locker), the next picture shows 1, not 3. If instead your notes say "add one to whatever is there", the next picture shows 3. Second, if you secretly scribble on the object inside the locker instead of putting in a new one, React looks, sees the same object it put there, and decides nothing changed. It does not take a new picture.</p>`,
      what: `<p><code>useState</code> is a Hook that gives a function component a piece of <b>state</b>: a value React stores on the component's behalf, which survives between renders and which, when changed through its setter, causes React to render that component again.</p>
<p><b>The shape of the API.</b></p>
<ul class="pts">
<li><code>const [value, setValue] = useState(initialValue)</code>. The array is destructured; you choose the names. Convention: <code>[thing, setThing]</code>.</li>
<li><code>initialValue</code> is used <b>only on the first render</b> (the mount). On later renders the argument is ignored; React returns the stored value instead. Changing the prop you passed as the initial value later does not reset the state (Day 4 shows how to reset with a <code>key</code>).</li>
<li><code>setValue(next)</code> queues "replace the state with <code>next</code>". <code>setValue(prev =&gt; next)</code> queues an <b>updater function</b> that React calls with the latest queued state.</li>
<li>The setter returns nothing and does not change <code>value</code> in the currently running code. It schedules a re-render; in that next render, <code>useState</code> returns the new value.</li>
<li>The setter's identity is <b>stable</b>: it is the same function on every render, so it is safe to omit from dependency arrays and to pass to children.</li>
<li><code>useState(() =&gt; compute())</code>: if you pass a function, React treats it as an <b>initializer</b> and calls it only on mount (lazy initial state). Note: pass the function, do not call it.</li>
</ul>
<p><b>Why a local variable does not work.</b> A component is a plain function that React calls each time it needs the UI. A <code>let count = 0</code> inside it is created fresh on each call and thrown away after. Changing it in a click handler changes a variable that no future render will ever see, and nothing tells React to render again. State solves both problems: React <i>retains</i> the value across calls, and the setter <i>triggers</i> a render.</p>
<p><b>State as a snapshot.</b> Each render is a function call with its own constants. When you click, the handler that runs is the one created during the render that is on screen, so it closes over that render's <code>count</code>. Calling <code>setCount(count + 1)</code> does not mutate that constant; it asks for a future render. That is why:</p>
<ul class="pts">
<li><code>setCount(count + 1); setCount(count + 1); setCount(count + 1);</code> with <code>count === 0</code> queues "set to 1" three times. Result: <b>1</b>.</li>
<li><code>setCount(c =&gt; c + 1)</code> three times queues three updaters. React applies them in order: 0→1→2→3. Result: <b>3</b>.</li>
<li><code>setCount(count + 5); setCount(c =&gt; c + 1);</code> gives 6: replace with 5, then add 1.</li>
<li><code>setCount(c =&gt; c + 1); setCount(42);</code> gives 42: a plain value replaces whatever came before.</li>
<li><code>setCount(count + 1); console.log(count);</code> logs the <b>old</b> value. So does a <code>setTimeout</code> that reads <code>count</code> later: it reads the snapshot it closed over.</li>
</ul>
<p><b>When to use an updater.</b> Use <code>prev =&gt; …</code> whenever the next value is computed from the previous one and more than one update could be queued before the next render: multiple calls in one handler, updates from timers or async code that may race, or code in a <code>useCallback</code>/effect where you do not want <code>count</code> as a dependency. When you are setting a value that does not depend on the previous one (<code>setName(e.target.value)</code>), pass the value. Convention for the parameter name: the first letter of the state (<code>c</code>, <code>prev</code>, <code>items</code>).</p>
<p><b>Batching.</b> React does not re-render after each setter call. It collects all updates queued during the current event (and, since React 18 with <code>createRoot</code>, during the same macrotask or microtask: timeouts, promise callbacks, native listeners) and processes them in a single render. Two benefits: you never see a half-updated UI where <code>firstName</code> changed but <code>lastName</code> did not, and you avoid wasted renders. Batching is not "debouncing": updates from two separate clicks are never merged; each user event is handled on its own. In legacy <code>ReactDOM.render</code> (removed in React 19), only updates inside React event handlers were batched; that is the "React 17 vs 18 batching" interview question.</p>
<p><b>Bailing out.</b> If the new value is the same as the current one according to <code>Object.is</code>, React skips re-rendering the component's children and effects. (React may still call the component function once before deciding to bail out; do not rely on "the function is never called".) <code>Object.is</code> is like <code>===</code> except <code>Object.is(NaN, NaN)</code> is true and <code>Object.is(0, -0)</code> is false.</p>
<p><b>Immutable updates.</b> Because comparison is by reference, an object or array in state must be treated as <b>read-only</b>. To change it, create a new one:</p>
<table class="tbl"><tr><th>Goal</th><th>Avoid (mutates)</th><th>Prefer (new value)</th></tr>
<tr><td>Change a field</td><td><code>user.name = n</code></td><td><code>{...user, name: n}</code></td></tr>
<tr><td>Nested field</td><td><code>user.address.city = c</code></td><td><code>{...user, address: {...user.address, city: c}}</code></td></tr>
<tr><td>Add item</td><td><code>push</code>, <code>unshift</code></td><td><code>[...arr, x]</code>, <code>[x, ...arr]</code></td></tr>
<tr><td>Remove item</td><td><code>splice</code>, <code>pop</code></td><td><code>arr.filter(i =&gt; i.id !== id)</code></td></tr>
<tr><td>Replace / edit item</td><td><code>arr[i] = x</code>, <code>arr[i].done = true</code></td><td><code>arr.map(i =&gt; i.id === id ? {...i, done: true} : i)</code></td></tr>
<tr><td>Insert at index</td><td><code>splice(i, 0, x)</code></td><td><code>[...arr.slice(0, i), x, ...arr.slice(i)]</code> or <code>arr.toSpliced(i, 0, x)</code></td></tr>
<tr><td>Sort / reverse</td><td><code>sort()</code>, <code>reverse()</code></td><td><code>arr.toSorted(cmp)</code>, <code>arr.toReversed()</code>, or <code>[...arr].sort(cmp)</code></td></tr>
</table>
<p>Spread is <b>shallow</b>: <code>{...user}</code> copies the top level only; <code>user.address</code> is still the same object. That is fine as long as you copy every level on the path to the thing you change, and leave untouched branches shared (structural sharing). <code>toSorted</code>, <code>toReversed</code>, <code>toSpliced</code> and <code>with</code> are ES2023 "change array by copy" methods; they work in current browsers, but TypeScript only knows about them if your <code>tsconfig</code> <code>lib</code> includes <code>ES2023</code> (or later).</p>
<p><b>State is per component instance.</b> Render <code>&lt;Counter /&gt;</code> twice and you get two independent counters. State is not tied to the function, nor to a variable, but to the component's <i>position in the tree</i>. Remove it and its state is destroyed; render the same component at the same position and the state is kept (Day 4 goes deep on identity, keys and resets). State is also private: a parent cannot read a child's state; to share it you lift it up (Day 4) or use context (Day 6).</p>
<p><b>Typing <code>useState</code> in TypeScript.</b> Usually inference is enough: <code>useState(0)</code> is <code>number</code>, <code>useState("")</code> is <code>string</code>. Supply the type argument when the initial value does not describe all future values:</p>
<ul class="pts">
<li><code>useState&lt;User | null&gt;(null)</code>: without the generic, TS infers <code>null</code> and you cannot set a user later.</li>
<li><code>useState&lt;string[]&gt;([])</code>: without it, an empty array literal is inferred as <code>never[]</code>.</li>
<li><code>useState&lt;"idle" | "saving" | "error"&gt;("idle")</code>: a string union, so typos are compile errors.</li>
<li><code>useState&lt;number&gt;()</code> with no argument gives <code>number | undefined</code>. Prefer an explicit initial value or <code>null</code>.</li>
</ul>
<p><b>Immer.</b> For deeply nested updates, the <code>immer</code> library (and its <code>use-immer</code> hook) lets you write <code>draft.address.city = c</code> on a proxy draft; Immer records the changes and returns a new, structurally shared object. Redux Toolkit uses Immer inside its reducers (Day 6). It is a convenience, not a different model: the result is still a new immutable value.</p>`,
      why: `<p>Without state, a React component could only render what it was given. Interactive UI (a counter, an open/closed menu, the text in a search box, a list fetched from <code>/api/todos</code>) needs memory that survives between renders <i>and</i> a way to tell React "the UI is now out of date".</p>
<p>Before React, you kept that memory wherever you could: global variables, data attributes, the DOM itself (read <code>input.value</code> when you need it). Updating the screen was manual: after changing the data, you also had to find and patch every DOM node that showed it. Forget one and the UI lies. jQuery-era bugs were mostly "the data says X but the screen says Y".</p>
<p><code>useState</code> moves that to a declarative model: you change the data through the setter; React re-runs your component to describe the new UI and patches the DOM for you. The snapshot semantics and immutability are not arbitrary rules; they are what make this cheap and predictable. Because a render sees a fixed snapshot, the UI it describes is internally consistent. Because changes produce new references, React (and <code>React.memo</code>, <code>useMemo</code>, the React Compiler, TanStack Query, Redux selectors) can detect change with a single reference comparison instead of a deep walk of your data.</p>
<p>Batching exists for the same reason: one event usually changes several pieces of state, and you want one consistent render, not a flicker of intermediate states and a render per setter.</p>`,
      diagram: {
        html: flow([
          ["1. Event", "user clicks; handler from the current render runs with count = 0", "w"],
          ["2. Queue", "setCount(c =&gt; c + 1) appends an update to this hook's queue; nothing changes yet"],
          ["3. Batch", "handler finishes; React schedules one render for all queued updates"],
          ["4. Render", "Counter() is called again; useState processes the queue and returns 1", "g"],
          ["5. Commit", "React diffs the new JSX and updates the text node in the DOM", "g"]
        ], { v: true }),
        steps: [
          "The click handler is a closure created during the render currently on screen, so it sees that render's <code>count</code> (a snapshot). Calling the setter does not modify this variable.",
          "Each setter call appends an update object (a value or an updater function) to the queue that belongs to this particular <code>useState</code> call on this component instance, and marks the component as needing work.",
          "React waits for the handler (and any other code in the same task) to finish. All queued updates across all components are processed in one render pass: this is automatic batching.",
          "React calls your component again. When it reaches <code>useState</code>, it starts from the stored value and applies the queued updates in order: values replace, functions are called with the previous result. If the result is <code>Object.is</code>-equal to the old state, React can bail out.",
          "React compares the new element tree with the previous one and applies the minimal DOM changes (Day 4: render vs commit). Only after this does the screen show the new value."
        ]
      },
      ex: [
        {
          t: "Why a local variable does not work, and the useState fix",
          lang: "tsx",
          code: `// Broken: the variable resets on every render, and changing it never triggers one.
export function BrokenCounter() {
  let count = 0;
  function handleClick() {
    count = count + 1;
    console.log("count is now", count); // logs 1, 1, 1 ... (if a render ever happened, it would reset to 0)
  }
  return <button onClick={handleClick}>Clicked {count} times</button>; // always shows 0
}

// Fixed: React stores the value for this component instance and re-renders when it changes.
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}`,
          out: `BrokenCounter: the label stays "Clicked 0 times"; the console logs "count is now 1" on every click.
Counter: the label increments 1, 2, 3 ... on each click.`,
          note: `<p>Two separate failures in the broken version: the value is not <b>retained</b> (each call starts with <code>let count = 0</code>), and the change is not <b>observed</b> (assigning a local variable does not tell React anything). <code>useState</code> fixes both.</p>`
        },
        {
          t: "State as a snapshot: three setter calls, one increment",
          lang: "tsx",
          code: `import { useState } from "react";

export function SnapshotDemo() {
  const [count, setCount] = useState(0);

  function addThreeWrong() {
    setCount(count + 1); // count is 0 in this render: queue "set to 1"
    setCount(count + 1); // count is still 0: queue "set to 1"
    setCount(count + 1); // queue "set to 1"
    console.log("after setters:", count); // 0: this render's snapshot
  }

  function addThreeRight() {
    setCount(c => c + 1); // queue "c => c + 1"
    setCount(c => c + 1);
    setCount(c => c + 1);
  }

  function alertLater() {
    setCount(count + 5);
    setTimeout(() => alert("count was " + count), 2000); // still the old snapshot
  }

  return (
    <div>
      <p>{count}</p>
      <button onClick={addThreeWrong}>+3 (wrong)</button>
      <button onClick={addThreeRight}>+3 (right)</button>
      <button onClick={alertLater}>+5 and alert later</button>
    </div>
  );
}`,
          out: `Start at 0.
Click "+3 (wrong)":  shows 1, console logs "after setters: 0"
Click "+3 (right)":  shows 4
Click "+5 and alert later": shows 9 immediately; 2 seconds later the alert says "count was 4"`,
          note: `<p>The alert is the most surprising line for newcomers: by the time it fires the screen shows 9, but the closure belongs to the render where <code>count</code> was 4. This is not a bug; it is what makes each render's event handlers consistent with what that render displayed. If you truly need "the latest value" inside a long-lived callback, use a ref (Day 5), not a stale state variable.</p>`
        },
        {
          t: "How React processes a queue of mixed updates",
          lang: "tsx",
          code: `import { useState } from "react";

export function QueueDemo() {
  const [n, setN] = useState(0);

  function handleClick() {
    setN(n + 5);       // "replace with 5"         -> 5
    setN(prev => prev + 1); // "add 1 to previous"  -> 6
    setN(42);          // "replace with 42"        -> 42
    setN(prev => prev * 2); // "double previous"    -> 84
  }

  return <button onClick={handleClick}>n = {n}</button>;
}

// What React does during the next render, roughly:
// let state = 0;                         // stored value
// for (const update of queue) {
//   state = typeof update === "function" ? update(state) : update;
// }
// return [state, setN];                  // 84`,
          out: `First click: n = 84`,
          note: `<p>Updater functions must be <b>pure</b>: they may run more than once. In development under <code>&lt;StrictMode&gt;</code> React deliberately calls updaters (and initializers, and your component) twice to surface impurity; only one result is used. Never call <code>fetch</code>, push to an outer array, or log analytics inside an updater.</p>`
        },
        {
          t: "Automatic batching: one render, even in timeouts and promises",
          lang: "tsx",
          code: `import { useState } from "react";
import { flushSync } from "react-dom";

export function BatchingDemo() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  console.log("render", a, b);

  function inHandler() {
    setA(x => x + 1);
    setB(x => x + 1); // one render, not two
  }

  function inTimeout() {
    setTimeout(() => {
      setA(x => x + 1);
      setB(x => x + 1); // React 18+ with createRoot: still one render
    }, 0);
  }

  async function afterFetch() {
    const res = await fetch("/api/health");
    setA(res.ok ? 1 : -1);
    setB(res.status); // also batched, after the await
  }

  function unbatched() {
    flushSync(() => setA(x => x + 1)); // render + commit happens synchronously here
    // the DOM already shows the new "a" at this line
    setB(x => x + 1);                  // a second render
  }

  return (
    <div>
      <p>a = {a}, b = {b}</p>
      <button onClick={inHandler}>handler</button>
      <button onClick={inTimeout}>timeout</button>
      <button onClick={afterFetch}>fetch</button>
      <button onClick={unbatched}>flushSync</button>
    </div>
  );
}`,
          out: `handler   -> console: "render 1 1"                 (one render)
timeout   -> console: "render 2 2"                 (one render)
fetch     -> console: "render 1 200"               (one render after the await)
flushSync -> console: "render 2 200", "render 2 201" (two renders)
(In development with StrictMode, each render is logged twice.)`,
          note: `<p>Note that code after an <code>await</code> runs in a later microtask, so the updates before and after an <code>await</code> are in different batches. <code>flushSync</code> is an escape hatch for when you must read the updated DOM immediately (e.g. scroll to a just-added item); it hurts performance and is rarely needed.</p>`
        },
        {
          t: "Lazy initial state and typing useState",
          lang: "tsx",
          code: `import { useState } from "react";

type User = { id: number; email: string; displayName: string };
type Draft = { title: string; body: string };

function readDraft(): Draft {
  // Runs only on mount when passed as a function.
  const raw = localStorage.getItem("post-draft");
  if (!raw) return { title: "", body: "" };
  try {
    return JSON.parse(raw) as Draft;
  } catch {
    return { title: "", body: "" };
  }
}

export function Editor() {
  // Wrong: readDraft() would run on EVERY render; the result is ignored after the first.
  // const [draft, setDraft] = useState(readDraft());

  // Right: pass the function itself. React calls it once.
  const [draft, setDraft] = useState(readDraft);

  // Generic needed: the initial value null does not describe a future User.
  const [user, setUser] = useState<User | null>(null);

  // Generic needed: [] would otherwise be never[].
  const [tags, setTags] = useState<string[]>([]);

  // A union makes impossible states impossible to type.
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function loadMe() {
    setStatus("loading");
    const res = await fetch("/api/me");
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setUser((await res.json()) as User);
    setStatus("idle");
  }

  return (
    <section>
      <button onClick={loadMe} disabled={status === "loading"}>Load profile</button>
      {status === "error" && <p role="alert">Could not load profile</p>}
      {user && <p>Signed in as {user.displayName}</p>}
      <input
        value={draft.title}
        onChange={e => setDraft({ ...draft, title: e.target.value })}
        onBlur={() => localStorage.setItem("post-draft", JSON.stringify(draft))}
      />
      <p>{tags.length} tags</p>
      <button onClick={() => setTags(t => [...t, "react"])}>Add tag</button>
    </section>
  );
}`,
          note: `<p><code>useState(readDraft)</code> and <code>useState(() =&gt; readDraft())</code> are equivalent. A consequence of the "function means initializer" rule: if you want to <b>store a function</b> in state, wrap it: <code>useState(() =&gt; myFn)</code> and <code>setFn(() =&gt; otherFn)</code>; otherwise React calls it. The fetch here runs from a click handler; fetching on mount belongs to Days 5 and 7.</p>`
        },
        {
          t: "Updating objects and nested objects immutably",
          lang: "tsx",
          code: `import { useState } from "react";

type Address = { city: string; zip: string };
type Profile = { name: string; email: string; address: Address; prefs: { newsletter: boolean } };

const initial: Profile = {
  name: "Asha",
  email: "asha@example.com",
  address: { city: "Pune", zip: "411001" },
  prefs: { newsletter: false },
};

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile>(initial);

  // Mutation: same reference, Object.is(old, new) === true, React bails out. Screen does not change.
  function renameBroken(name: string) {
    profile.name = name;
    setProfile(profile);
  }

  // Top-level field: copy the object, override one key.
  function rename(name: string) {
    setProfile(p => ({ ...p, name }));
  }

  // Nested field: copy every level on the path to the change.
  function setCity(city: string) {
    setProfile(p => ({ ...p, address: { ...p.address, city } }));
  }

  // A generic field setter with a typed key (computed property name).
  function setField<K extends "name" | "email">(key: K, value: string) {
    setProfile(p => ({ ...p, [key]: value }));
  }

  function toggleNewsletter() {
    setProfile(p => ({ ...p, prefs: { ...p.prefs, newsletter: !p.prefs.newsletter } }));
  }

  return (
    <form>
      <input value={profile.name} onChange={e => rename(e.target.value)} />
      <input value={profile.email} onChange={e => setField("email", e.target.value)} />
      <input value={profile.address.city} onChange={e => setCity(e.target.value)} />
      <label>
        <input type="checkbox" checked={profile.prefs.newsletter} onChange={toggleNewsletter} />
        Newsletter
      </label>
      <button type="button" onClick={() => renameBroken("Mutated")}>Broken rename</button>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </form>
  );
}`,
          out: `Typing in any input updates the JSON preview immediately.
"Broken rename" changes the object in memory but the screen does not update,
until some other state change causes a render, which then suddenly shows "Mutated".`,
          note: `<p>The delayed appearance is the classic symptom of mutation: the data <i>was</i> changed, React simply did not know. That "it shows up later, on an unrelated click" behaviour is why mutation bugs are hard to trace. After <code>setCity</code>, <code>newProfile.prefs === oldProfile.prefs</code> is still true: untouched branches are shared, which is exactly what memoised children want.</p>`
        },
        {
          t: "Updating arrays: add, remove, edit, insert, sort",
          lang: "tsx",
          code: `import { useState } from "react";

type Todo = { id: number; title: string; done: boolean };

let nextId = 4;

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, title: "Read Day 3", done: true },
    { id: 2, title: "Build the login form", done: false },
    { id: 3, title: "Explain batching out loud", done: false },
  ]);

  const add = (title: string) =>
    setTodos(ts => [...ts, { id: nextId++, title, done: false }]);

  const addFirst = (title: string) =>
    setTodos(ts => [{ id: nextId++, title, done: false }, ...ts]);

  const remove = (id: number) =>
    setTodos(ts => ts.filter(t => t.id !== id));

  const toggle = (id: number) =>
    setTodos(ts => ts.map(t => (t.id === id ? { ...t, done: !t.done } : t)));

  const insertAt = (index: number, title: string) =>
    setTodos(ts => [...ts.slice(0, index), { id: nextId++, title, done: false }, ...ts.slice(index)]);

  // ES2023 copy methods. Needs "lib": ["ES2023", ...] in tsconfig for the types.
  const sortByTitle = () =>
    setTodos(ts => ts.toSorted((a, b) => a.title.localeCompare(b.title)));

  // Equivalent without ES2023:
  const sortByTitleCompat = () =>
    setTodos(ts => [...ts].sort((a, b) => a.title.localeCompare(b.title)));

  // Bug: sort() mutates in place AND returns the same array. Same reference => no re-render.
  const sortBroken = () => {
    todos.sort((a, b) => a.title.localeCompare(b.title));
    setTodos(todos);
  };

  return (
    <div>
      <button onClick={() => add("New task")}>Add</button>
      <button onClick={() => addFirst("Urgent task")}>Add first</button>
      <button onClick={() => insertAt(1, "Inserted")}>Insert at 1</button>
      <button onClick={sortByTitle}>Sort</button>
      <button onClick={sortByTitleCompat}>Sort (compat)</button>
      <button onClick={sortBroken}>Sort (broken)</button>
      <ul>
        {todos.map(t => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              {t.title}
            </label>
            <button onClick={() => remove(t.id)}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
          note: `<p>Copying an array with <code>[...ts]</code> or <code>map</code> copies the array, not the items: <code>ts.map(t =&gt; t)</code> still holds the same todo objects. So <code>ts.map(t =&gt; { t.done = true; return t; })</code> is still a mutation of shared items (and a common bug); always return a new item object for the ones you change. A module-level <code>nextId</code> is fine for a demo; real ids come from the server or <code>crypto.randomUUID()</code>.</p>`
        },
        {
          t: "State is per instance, and private",
          lang: "tsx",
          code: `import { useState } from "react";

function Counter({ label }: { label: string }) {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      {label}: {count}
    </button>
  );
}

export function App() {
  const [showB, setShowB] = useState(true);
  return (
    <>
      <Counter label="A" />
      {showB && <Counter label="B" />}
      <label>
        <input type="checkbox" checked={showB} onChange={e => setShowB(e.target.checked)} />
        Show B
      </label>
    </>
  );
}`,
          out: `Click A three times, B once: "A: 3", "B: 1" (independent).
Uncheck "Show B", then check it again: "B: 0" (its state was destroyed on unmount).`,
          note: `<p>Each rendered <code>&lt;Counter /&gt;</code> gets its own hook storage on its own fiber. Removing B from the tree discards that storage. Day 4 explains the rule precisely (same component at the same position keeps state; keys change identity).</p>`
        },
        {
          t: "Immer for deeply nested updates (optional)",
          lang: "tsx",
          code: `// npm install immer use-immer
import { useImmer } from "use-immer";

type Board = {
  columns: { id: string; title: string; cards: { id: string; text: string; votes: number }[] }[];
};

export function RetroBoard() {
  const [board, updateBoard] = useImmer<Board>({
    columns: [
      { id: "good", title: "Went well", cards: [{ id: "c1", text: "Fast deploys", votes: 0 }] },
      { id: "bad", title: "To improve", cards: [] },
    ],
  });

  function vote(columnId: string, cardId: string) {
    updateBoard(draft => {
      const card = draft.columns.find(c => c.id === columnId)?.cards.find(c => c.id === cardId);
      if (card) card.votes += 1; // "mutate" the draft; Immer produces a new immutable board
    });
  }

  // The same update by hand, for comparison:
  // setBoard(b => ({
  //   ...b,
  //   columns: b.columns.map(col => col.id !== columnId ? col : {
  //     ...col,
  //     cards: col.cards.map(card => card.id !== cardId ? card : { ...card, votes: card.votes + 1 }),
  //   }),
  // }));

  return (
    <div>
      {board.columns.map(col => (
        <section key={col.id}>
          <h3>{col.title}</h3>
          {col.cards.map(card => (
            <button key={card.id} onClick={() => vote(col.id, card.id)}>
              {card.text} ({card.votes})
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}`,
          note: `<p>Immer is worth it when updates go three or more levels deep. Inside the recipe you may either mutate the draft or return a new value, not both. If your nested state keeps getting deeper, consider <b>normalising</b> it instead (Day 4): store cards in a map by id so updates are one level deep.</p>`
        }
      ],
      internals: `<p><b>Where state lives.</b> Each component instance on screen is backed by a <b>fiber</b> (Day 12). A fiber has a <code>memoizedState</code> field which, for function components, points to a <b>linked list of hooks</b> in the order they were called. A component with <code>useState</code>, <code>useState</code>, <code>useEffect</code> has three hook nodes. On every render React walks this list in step with your hook calls: the first <code>useState</code> call reads node 1, the second reads node 2. This is why hooks must be called unconditionally and in the same order (the "rules of hooks", Day 10): there are no names, only positions.</p>
<p><b>What the setter is.</b> On mount, React creates the hook node with <code>memoizedState = initial</code> and an update <b>queue</b>, and returns a <code>dispatch</code> function bound to <i>this fiber</i> and <i>this queue</i>. That binding is why the setter identity is stable and why calling it from anywhere (a timeout, a promise) updates the right component instance.</p>
<p><b>What a setter call does.</b> Calling <code>setCount(action)</code> creates an update object <code>{ action, lane, next }</code>, where the <b>lane</b> is its priority (a click is a discrete, high-priority event; an update inside <code>startTransition</code> gets a transition lane, Day 12). It appends the update to the hook's circular pending queue, marks the fiber and its ancestors as having pending work, and asks the scheduler to process the root. It does not render synchronously. Batching falls out of this design: several setter calls just append several updates and request the same root render, which happens once the current task yields.</p>
<p><b>The eager bailout.</b> When a setter is called and the fiber has no other pending work, React can compute the new state immediately (calling the updater eagerly) and compare it with <code>Object.is</code>. If it is equal, React does not even schedule a render. When that fast path is not available, React renders the component, finds the state unchanged, and bails out of rendering its children. That is why the docs say React "may still need to call your component" before skipping.</p>
<p><b>Processing the queue in render.</b> During the next render, <code>useState</code> (internally <code>updateReducer</code>, because <code>useState</code> is a <code>useReducer</code> with a built-in reducer <code>(state, action) =&gt; typeof action === "function" ? action(state) : action</code>) walks the pending updates. Updates whose lane is included in this render are applied in order; lower-priority ones are skipped and kept for a later render, with the queue rebased so that the final result is the same as if they had all run in order. This is how a transition update can be interrupted by an urgent one without corrupting state.</p>
<p><b>Why mutation breaks it.</b> Every later optimisation (the eager bailout, <code>React.memo</code> comparing props, <code>useMemo</code> and effect dependency arrays, the React Compiler's memoisation, and concurrent rendering which may render with an old and a new state side by side) assumes that a state value never changes after it is created. Mutating it makes the "current" and "work-in-progress" trees share one changed object, so React cannot tell what changed and old renders can observe new data.</p>
<p><b>StrictMode double calls.</b> In development, <code>&lt;StrictMode&gt;</code> calls component bodies, <code>useState</code> initializers and updater functions twice and discards one result. Pure code behaves identically; impure code (an updater that pushes into an outer array, an initializer that increments a counter) shows duplicated effects, which is the point.</p>`,
      prod: `<p>In a React + FastAPI product, local state is for <b>UI state</b> owned by one component or a small subtree: input values, whether a dialog is open, the selected tab, a sort order, an in-progress draft. Data that comes from the API (<code>/api/orders</code>, cached by Redis, stored in PostgreSQL) is <b>server state</b>: copying it into <code>useState</code> and keeping it fresh by hand quickly becomes a cache with no invalidation. Day 7 moves that to TanStack Query; Day 6 discusses global client state.</p>
<p><b>Bugs that reach production:</b></p>
<ul class="pts">
<li><b>Lost updates</b> from stale snapshots: a "like" button that does <code>setLikes(likes + 1)</code> inside an async callback after the request resolves; two quick clicks both read the same old value. Fix: updater functions, or better, take the count from the server response.</li>
<li><b>Mutation that "sometimes" works</b>: <code>items.push(x); setItems(items)</code> appears to work when an unrelated state change in the same handler forces a render, then breaks after a refactor removes it. Lint rules and Immer help; TypeScript <code>readonly</code> arrays (<code>ReadonlyArray&lt;Todo&gt;</code>) make <code>push</code>/<code>sort</code> compile errors.</li>
<li><b>Double submission</b>: a submit button that sets <code>loading</code> to true but is not <code>disabled</code>, or a guard that reads the stale <code>loading</code> snapshot. Disable the button from state, and make the FastAPI endpoint idempotent where it matters (idempotency key in a header, unique constraint in PostgreSQL).</li>
<li><b>Redundant and derived state</b>: storing <code>fullName</code> next to <code>firstName</code> and <code>lastName</code>, or <code>filteredTodos</code> next to <code>todos</code> and <code>filter</code>. They drift apart. Compute during render instead (Day 4).</li>
<li><b>Giant state objects at the top</b>: one <code>useState</code> holding the whole page means every keystroke re-renders the whole page. Keep state as close as possible to where it is used, split unrelated state, and measure before memoising (Day 11).</li>
<li><b>Initial state from props</b>: <code>useState(props.user.name)</code> captures the first value only. When the user switches to a different record, the form still shows the old name. Either key the component by id (<code>&lt;EditUser key={user.id} /&gt;</code>) or don't copy the prop.</li>
</ul>
<p>At scale, teams standardise on: unions for status (<code>"idle" | "loading" | "error" | "success"</code>) instead of several booleans, updater functions whenever the next value depends on the previous one, <code>useReducer</code> (Day 4) when several pieces of state change together, and Immer only where nesting is unavoidable.</p>`,
      iq: [
        ["fresher", "Why can't you store a counter in a normal local variable inside a component?", `<p>Two reasons. A component is a function React calls on every render, so <code>let count = 0</code> is re-created and reset each time: the value is not <b>retained</b>. And assigning to a local variable does not notify React, so no re-render is <b>triggered</b>. <code>useState</code> keeps the value on the component instance (outside the function) and its setter schedules a render. Moving the variable outside the component "works" but is shared by every instance and still does not trigger renders, so it is not an answer.</p>`],
        ["fresher", "What does <code>useState</code> return, and when is the initial value used?", `<p>A two-element array: the current state value for this render and a setter function. The initial value is used only on the first render (mount); later renders ignore the argument and return the stored value. That is why changing the prop you passed as the initial value does not update the state. If computing the initial value is expensive, pass a function (<code>useState(() =&gt; compute())</code>) so it runs only once.</p>`],
        ["fresher", "A handler calls <code>setCount(count + 1)</code> three times. The count was 0. What is shown after the click, and how do you make it 3?", `<p>It shows 1. Within a render <code>count</code> is a constant (a snapshot), so all three calls queue "set to 1". To add three, use the updater form <code>setCount(c =&gt; c + 1)</code> three times: React queues three functions and applies each to the result of the previous one. The tempting answer "3, because each call updates count" is wrong because the setter never changes the variable in the running code.</p>`],
        ["mid", "What is automatic batching, and what changed in React 18?", `<p>Batching is grouping several state updates into one re-render. React has always batched updates inside its own event handlers. Before React 18 (legacy <code>ReactDOM.render</code>), updates inside <code>setTimeout</code>, promise callbacks or native event listeners were <i>not</i> batched: each setter caused a synchronous render. Since React 18 with <code>createRoot</code>, all updates are batched automatically regardless of where they originate. To force a synchronous update you use <code>flushSync</code> from <code>react-dom</code>. Batching does not merge separate user events: two clicks are two batches.</p>`],
        ["mid", "Why doesn't <code>items.push(newItem); setItems(items)</code> re-render, and how do you fix it?", `<p>React compares the new state with the old using <code>Object.is</code>. <code>push</code> mutates the existing array, so the setter receives the same reference, React sees "no change" and bails out. Fix: create a new array, <code>setItems(prev =&gt; [...prev, newItem])</code>. The same applies to objects (<code>{...obj, key: value}</code>) and nested data (copy every level on the path). A related trap: <code>sort()</code> and <code>reverse()</code> also mutate; use <code>toSorted()</code>/<code>toReversed()</code> or sort a copy.</p>`],
        ["mid", "When should you use the updater form of the setter?", `<p>When the next state is derived from the previous state and the current snapshot might be stale: several updates in one handler, updates from timers, intervals, websockets or after an <code>await</code>, and callbacks memoised with <code>useCallback</code> where you don't want the state in the dependency list. For values that don't depend on the previous one (<code>setQuery(e.target.value)</code>), a plain value is clearer. Updaters must be pure because React may call them twice in StrictMode and may replay them when rebasing.</p>`],
        ["mid", "How do you type <code>useState</code> for a value that starts as <code>null</code> or an empty array?", `<p>Pass the type argument: <code>useState&lt;User | null&gt;(null)</code> and <code>useState&lt;string[]&gt;([])</code>. Without it, TypeScript infers the type from the initial value: <code>null</code> (so you can never set a user) and <code>never[]</code> (so you can't add strings). For finite statuses use a union: <code>useState&lt;"idle" | "loading" | "error"&gt;("idle")</code>. Avoid <code>useState&lt;User&gt;({} as User)</code>: it lies to the compiler and crashes at runtime on <code>user.address.city</code>.</p>`],
        ["senior", "Explain how React stores state for a function component and why hooks must be called in the same order.", `<p>Each rendered component instance has a fiber. Its <code>memoizedState</code> holds a linked list of hook nodes in call order. Each <code>useState</code> node stores the current value and a queue of pending updates; the setter is a dispatch function bound to that fiber and queue. On re-render React walks the list in step with your calls; hooks are identified purely by position. If a hook is called conditionally, every later hook reads the wrong node (e.g. your second <code>useState</code> gets the first one's value), so the rules of hooks require unconditional, top-level calls. This also explains why the setter is stable and why state is per instance: it is attached to the fiber, not to the function.</p>`],
        ["senior", "Under concurrent rendering, why is immutability more than a style preference?", `<p>With concurrent features (transitions, Suspense), React may start rendering with new state, pause, render something urgent with the committed state, and then resume or discard the first render. Both the current tree and the work-in-progress tree can reference state values simultaneously. If code mutates a state object, the "old" tree observes the new data, renders become inconsistent (tearing within your own state), and React's skip logic (<code>Object.is</code> bailouts, <code>memo</code>, dependency arrays, the React Compiler's cached values) can't detect the change. Immutable values make each render a consistent snapshot and make change detection a reference check.</p>`],
        ["lead", "A teammate proposes one big <code>useState</code> object for an entire settings page \"to keep things in one place\". What do you advise?", `<p>Group state by what changes together, not by page. One big object means every keystroke re-creates the object and re-renders everything that reads it, invites mutation bugs in nested updates, and makes it easy to store derived or server data next to UI state. I'd recommend: server data via TanStack Query (Day 7); form fields via a form library such as React Hook Form for anything non-trivial (Day 9); several small <code>useState</code> calls colocated where they're used; <code>useReducer</code> when transitions between fields have rules (Day 4). A single object is fine when the fields really are one unit (e.g. <code>{x, y}</code> of a pointer).</p>`],
        ["architect", "How would you explain the trade-off between React's snapshot/immutable model and a mutable reactive model (signals, MobX, Vue refs)?", `<p>React re-runs component functions with immutable snapshots and diffs the output; change detection is coarse (component level) but simple, and every render is a pure, consistent view, which enables concurrent rendering, time slicing and replaying renders safely. Signal/observable models track fine-grained dependencies at runtime and mutate in place, updating exactly the affected DOM nodes with less re-execution, but they make "what did this render see" harder to reason about and complicate interruptible rendering. React closes much of the performance gap with memoisation and the React Compiler rather than switching models. For an architecture decision, the more important factors are team familiarity, ecosystem (Query, Router, RHF), and keeping server state out of component state entirely.</p>`]
      ],
      gotchas: [
        `<b>The setter does not change the variable.</b> <code>setCount(5); console.log(count)</code> logs the old value. So does any closure (timeout, promise, event subscription) created during that render. If you need the new value right away, compute it into a local: <code>const next = count + 1; setCount(next); doSomething(next);</code>.`,
        `<b><code>useState(expensive())</code> calls <code>expensive</code> every render</b>, and throws the result away after the first. Pass the function: <code>useState(expensive)</code>. Conversely, to store a function as state you must wrap it: <code>setHandler(() =&gt; fn)</code>.`,
        `<b><code>sort()</code>, <code>reverse()</code>, <code>splice()</code>, <code>push()</code> mutate.</b> <code>todos.sort(...)</code> returns the same array, so <code>setTodos(todos.sort(...))</code> does not re-render. <code>[...todos].sort()</code> or <code>todos.toSorted()</code> (TypeScript needs <code>lib</code> ES2023) are safe.`,
        `<b>Spread is shallow.</b> <code>const copy = [...todos]; copy[0].done = true;</code> still mutates the todo object shared with the previous state. Copy the items you change: <code>todos.map(t =&gt; t.id === id ? {...t, done: true} : t)</code>.`,
        `<b><code>Object.is</code>, not deep equality.</b> <code>setUser({...user})</code> with nothing changed still re-renders (new reference). <code>setFilters(sameObject)</code> after mutating it does not. Setting state to an equal primitive (<code>setOpen(true)</code> when already true) bails out.`,
        `<b>Updates after <code>await</code> are a separate batch</b> from those before it. A handler that sets <code>loading</code> true, awaits, then sets data and <code>loading</code> false renders twice; that is expected and correct.`,
        `<b>The initial value is read once.</b> <code>useState(props.initialName)</code> does not follow later prop changes. Either don't copy props into state, or reset with a <code>key</code> (Day 4).`,
        `<b>Updaters run twice in StrictMode (development).</b> <code>setItems(prev =&gt; { prev.push(x); return [...prev]; })</code> adds the item twice in dev because the updater mutates <code>prev</code>. Updaters must be pure.`,
        `<b>Setting state during render</b> unconditionally (<code>setCount(count + 1)</code> in the component body) causes "Too many re-renders". The only legitimate pattern is a guarded update to adjust state when a prop changes, and Day 4 shows why deriving is usually better.`
      ],
      best: [
        `Use the updater form whenever the next value depends on the previous one; use a plain value otherwise.`,
        `Keep state minimal: don't store anything you can compute from props or other state during render.`,
        `Treat state as read-only. Prefer <code>map</code>/<code>filter</code>/spread/<code>toSorted</code>; reach for Immer when updates are three or more levels deep, or normalise the data.`,
        `Type state explicitly when the initial value does not describe it (<code>null</code>, <code>[]</code>), and model statuses as string unions rather than multiple booleans that can contradict each other.`,
        `Colocate state with the component that uses it; split unrelated values into separate <code>useState</code> calls; group values that always change together.`,
        `Keep server data out of <code>useState</code> in real apps; use a server-state library (Day 7) and keep <code>useState</code> for UI state.`
      ],
      lab: [
        `In your Vite react-ts app, create <code>src/day3/SnapshotDemo.tsx</code> with the three-button snapshot demo above. Render it from <code>App.tsx</code>. Before clicking, write down what you expect each button to show, then verify.`,
        `Add <code>console.log("render", count)</code> to the component body and observe how many times it logs per click with and without <code>&lt;StrictMode&gt;</code> in <code>main.tsx</code>. Explain the difference.`,
        `Build <code>TodoList.tsx</code> with typed state <code>useState&lt;Todo[]&gt;</code>: add, toggle, remove and sort. Implement sort twice: once with <code>todos.sort</code> + <code>setTodos(todos)</code>, and once correctly. Observe the broken one not re-rendering until you toggle an item.`,
        `Change the state type to <code>ReadonlyArray&lt;Todo&gt;</code> (and the item type to <code>Readonly&lt;Todo&gt;</code>). Confirm that the broken sort and any <code>t.done = …</code> now fail to compile. If <code>toSorted</code> is flagged as unknown, add <code>"ES2023"</code> to <code>lib</code> in <code>tsconfig.app.json</code>.`,
        `Add a profile editor with a nested <code>address</code> object. Update <code>address.city</code> immutably, then log <code>old.prefs === next.prefs</code> inside the updater to see structural sharing.`,
        `Add a "+1 after 2 s" button that uses <code>setTimeout</code>. Click it three times quickly using <code>setCount(count + 1)</code>, then with <code>setCount(c =&gt; c + 1)</code>.`,
        `<b>Done when:</b> you predicted every result correctly before clicking, the broken sort is a compile error under <code>ReadonlyArray</code>, and the timeout button reaches +3 only with the updater form.`
      ],
      teach: `<p>"A React component is just a function, and React calls it every time it needs the UI. So a normal variable inside it is reset on every call, and changing it doesn't tell React anything. <code>useState</code> fixes that: React keeps the value outside the function, per component instance, and gives you a setter that says 'please render again with this new value'.</p>
<p>The important mental model is that each render is a snapshot. Inside one render, <code>count</code> is a constant. If I call <code>setCount(count + 1)</code> three times with count 0, I've asked for '1' three times, so I get 1. If I want to build on the previous value, I pass a function, <code>setCount(c =&gt; c + 1)</code>, and React chains them, so I get 3.</p>
<p>React doesn't re-render after each setter. It batches all the updates from one event into one render, and since React 18 that's true even in timeouts and promises.</p>
<p>Finally, React decides whether something changed with <code>Object.is</code>, which is a reference check. If I mutate an array and pass the same array back, React thinks nothing changed. So I always create new objects and arrays: spread, <code>map</code>, <code>filter</code>, <code>toSorted</code>, copying every level I change. That rule is also what makes memoisation and concurrent rendering work."</p>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: "d3-events-forms",
      title: "Events and forms: handlers, controlled and uncontrolled inputs",
      lv: ["fresher", "mid", "senior"],
      eli5: `<p>Think of a hotel. Instead of putting a receptionist outside every guest room, the hotel has one front desk in the lobby. When a guest rings from room 304, the call goes to the front desk, which looks up "who in the chain from room 304 up to the lobby wants to hear about this?" and passes the message to each of them in turn. That is how React handles events: one listener at the root, which finds and calls your <code>onClick</code> handlers.</p>
<p>Forms are about who holds the pen. With a <b>controlled</b> input, React holds the pen: the input shows exactly what state says, and every keystroke is a request ("the user wants it to say 'ab'") that you approve by updating state. With an <b>uncontrolled</b> input, the browser holds the pen: the input keeps its own text, and you only read it when the form is submitted.</p>
<p>Both are fine. The controlled way lets you react to every keystroke (validation, formatting, enabling a button). The uncontrolled way is simpler and does less work when you only care about the final answer.</p>`,
      what: `<p><b>Event handlers.</b> In JSX you attach handlers with camelCase props: <code>onClick</code>, <code>onChange</code>, <code>onSubmit</code>, <code>onKeyDown</code>, <code>onFocus</code>, <code>onBlur</code>, <code>onPointerDown</code>. The value is a <b>function</b>:</p>
<ul class="pts">
<li><code>onClick={handleClick}</code> passes the function. React calls it later, on click, with the event.</li>
<li><code>onClick={() =&gt; remove(todo.id)}</code> passes an inline arrow so you can supply arguments.</li>
<li><code>onClick={handleClick()}</code> <b>calls</b> it during render and passes its return value (usually <code>undefined</code>). If it sets state, you get an infinite loop: "Too many re-renders".</li>
<li>Handlers are defined inside the component so they can read props and state (from that render's snapshot). By convention name them <code>handleX</code>, and name props that accept handlers <code>onX</code>: <code>&lt;Toolbar onSave={handleSave} /&gt;</code>.</li>
<li>Event handlers are the right place for side effects (fetch, navigation, analytics). Unlike the render body, they don't need to be pure.</li>
<li>Only built-in elements (<code>&lt;button&gt;</code>, <code>&lt;input&gt;</code>) know what <code>onClick</code> means. On your own components, <code>onClick</code> is just a prop that you must forward.</li>
</ul>
<p><b>Synthetic events.</b> React passes a <code>SyntheticEvent</code>, a cross-browser wrapper with the same interface as the native event (<code>target</code>, <code>currentTarget</code>, <code>preventDefault()</code>, <code>stopPropagation()</code>, <code>key</code>, <code>clientX</code>…) and the original in <code>e.nativeEvent</code>. Since React 17, events are no longer pooled, so you can read <code>e.target.value</code> after an <code>await</code>; <code>e.persist()</code> exists but does nothing.</p>
<p><b>Delegation.</b> React does not attach a listener to each button. When you call <code>createRoot(container)</code>, React registers one listener per supported event type on the <b>root container</b> (since React 17; before that, on <code>document</code>). When a native event bubbles up to the root, React finds the fiber for the target DOM node, walks up the fiber tree collecting matching handlers (<code>onClickCapture</code> top-down, then <code>onClick</code> bottom-up), and calls them. Propagation follows the <b>React tree</b>, so events from a portal (Day 9) bubble to their React parent even if the DOM node lives elsewhere.</p>
<p><b>Propagation and default behaviour.</b></p>
<ul class="pts">
<li><code>e.stopPropagation()</code> stops the event from reaching handlers on ancestors. Use it sparingly: it breaks "click outside to close" logic and analytics listeners further up.</li>
<li><code>e.preventDefault()</code> stops the browser's default action: a form submit reloading the page, a link navigating, a checkbox toggling. Returning <code>false</code> from a handler does <b>not</b> do this in React.</li>
<li>Capture-phase variants: <code>onClickCapture</code>, <code>onKeyDownCapture</code>. They run before bubble handlers, top-down; useful for logging or intercepting.</li>
<li>React's <code>onChange</code> fires on every input change (like the native <code>input</code> event), not only on blur like the native <code>change</code> event. <code>onFocus</code>/<code>onBlur</code> bubble in React (they use <code>focusin</code>/<code>focusout</code>). <code>onScroll</code> does not bubble in React 17+.</li>
</ul>
<p><b>Typing events in TypeScript.</b> When the handler is written inline, the type is inferred from the prop. When it is a separate function, annotate it:</p>
<table class="tbl"><tr><th>Event</th><th>Type</th><th>Useful fields</th></tr>
<tr><td>Text input / textarea / select change</td><td><code>React.ChangeEvent&lt;HTMLInputElement&gt;</code> (or <code>HTMLTextAreaElement</code>, <code>HTMLSelectElement</code>)</td><td><code>e.target.value</code>, <code>e.target.checked</code>, <code>e.target.valueAsNumber</code></td></tr>
<tr><td>Form submit</td><td><code>React.FormEvent&lt;HTMLFormElement&gt;</code></td><td><code>e.preventDefault()</code>, <code>e.currentTarget</code> (the form)</td></tr>
<tr><td>Click</td><td><code>React.MouseEvent&lt;HTMLButtonElement&gt;</code></td><td><code>e.currentTarget</code>, <code>e.button</code>, <code>e.shiftKey</code></td></tr>
<tr><td>Key</td><td><code>React.KeyboardEvent&lt;HTMLInputElement&gt;</code></td><td><code>e.key</code>, <code>e.nativeEvent.isComposing</code></td></tr>
<tr><td>Handler prop type</td><td><code>React.ChangeEventHandler&lt;HTMLInputElement&gt;</code>, <code>React.MouseEventHandler&lt;HTMLButtonElement&gt;</code></td><td>for typing a whole function or a prop</td></tr>
</table>
<p>Prefer <code>e.currentTarget</code> (the element the handler is attached to, typed precisely) over <code>e.target</code> (whatever was actually clicked, possibly a child span). For change events React's types make <code>e.target</code> the element type too, which is why <code>e.target.value</code> works there.</p>
<p><b>Controlled inputs.</b> The input's displayed value comes from state, and <code>onChange</code> updates state. State is the single source of truth.</p>
<ul class="pts">
<li>Text, email, password, number: <code>value={text}</code> + <code>onChange={e =&gt; setText(e.target.value)}</code>. <code>value</code> is always a string, even for <code>type="number"</code>; use <code>e.target.valueAsNumber</code> or parse, and keep the raw string in state if you need to allow intermediate input like <code>"-"</code> or <code>"1."</code>.</li>
<li>Checkbox: <code>checked={bool}</code> + <code>e.target.checked</code> (not <code>value</code>).</li>
<li>Radio group: each radio has <code>checked={choice === "x"}</code> and the same <code>name</code>.</li>
<li>Select: put <code>value</code> on the <code>&lt;select&gt;</code>, not <code>selected</code> on an option. For <code>multiple</code>, <code>value</code> is a string array.</li>
<li>Textarea: <code>value</code> prop, not children.</li>
<li>File input: always uncontrolled (its value is read-only for security). Read <code>e.target.files</code>.</li>
</ul>
<p>Controlled inputs let you validate as the user types, transform input (upper-case, strip spaces), disable submit until valid, and reset or prefill programmatically. The cost: every keystroke re-renders the component holding the state.</p>
<p><b>Uncontrolled inputs.</b> The DOM keeps the value. You set an initial value with <code>defaultValue</code>/<code>defaultChecked</code> and read on submit, either with <code>new FormData(e.currentTarget)</code> (requires <code>name</code> attributes) or with a ref (Day 5). Less code and no re-render per keystroke; but you can't easily react to each change, and resetting means <code>form.reset()</code> or remounting with a new <code>key</code>.</p>
<p><b>The controlled/uncontrolled switch warning.</b> React decides whether an input is controlled by whether <code>value</code> (or <code>checked</code>) is not <code>undefined</code>/<code>null</code>. If it starts as <code>undefined</code> (e.g. <code>value={user.nickname}</code> where nickname is missing, or <code>useState()</code> with no initial value) and later becomes a string, React warns: <i>"A component is changing an uncontrolled input to be controlled…"</i>. Fix: always provide a defined value (<code>value={nickname ?? ""}</code>, <code>useState("")</code>). Passing <code>value</code> without <code>onChange</code> gives a different warning: the field becomes read-only; add <code>onChange</code>, or use <code>readOnly</code> or <code>defaultValue</code>.</p>
<p><b>Submitting forms.</b> Use <code>&lt;form onSubmit&gt;</code> with a <code>type="submit"</code> button rather than an <code>onClick</code> on the button: you get Enter-to-submit and native validation (<code>required</code>, <code>type="email"</code>, <code>minLength</code>) for free. Call <code>e.preventDefault()</code> first, or the browser does a full-page navigation. Note that a <code>&lt;button&gt;</code> inside a form defaults to <code>type="submit"</code>; give other buttons <code>type="button"</code>.</p>
<p><b>React 19 form actions (basics).</b> In React 19, <code>&lt;form action={fn}&gt;</code> accepts a function. On submit React calls <code>fn(formData)</code> for you (no <code>preventDefault</code> needed), runs it inside a transition, and after it completes successfully resets uncontrolled fields. The function may be async. Day 9 covers the companion hooks (<code>useActionState</code>, <code>useFormStatus</code>, <code>useOptimistic</code>) and React Hook Form + Zod for validation at scale; today you only need to recognise the pattern.</p>`,
      why: `<p>Browsers already have events and forms, so why does React wrap them? Three problems.</p>
<p><b>Consistency and cost.</b> Historically, browsers disagreed on event names and behaviour (<code>change</code> firing on blur vs input, focus events not bubbling). React normalises them into one API. And attaching thousands of listeners to rows of a table is expensive to set up and tear down on every update; one delegated listener per event type at the root costs nothing per element.</p>
<p><b>Fitting events into the render model.</b> React needs to know when an event starts and ends so it can batch the state updates made inside, assign them a priority (a click is urgent), and keep propagation following the component tree (including portals), not just the DOM.</p>
<p><b>Forms as state.</b> In the jQuery era, the DOM was the source of truth: to know what the user typed you queried the input, and to prefill or reset a form you poked the DOM. That works until the same value must appear in two places, be validated live, or be restored after navigation. Controlled inputs make the value ordinary React state, so the UI is a function of state like everything else. Uncontrolled inputs remain for cases where the DOM's own state is enough, and React 19's form actions bring back some of the simplicity of plain HTML forms while keeping React in charge.</p>`,
      diagram: {
        html: lanes([
          ["Browser (DOM)", ["user clicks &lt;span&gt; inside &lt;button&gt;", "native click event created", "capture: window → document → root", "bubble: span → button → … → root container"]],
          ["React root listener", ["one listener per event type on the root container", "finds the fiber for the target node", "collects onClickCapture (top-down) and onClick (bottom-up) along the fiber path", "wraps the native event in a SyntheticEvent"]],
          ["Your handlers", ["Button onClick runs: setCount(c =&gt; c + 1)", "Card onClick runs (unless stopPropagation)", "updates are queued, not applied", "handler returns"]],
          ["After dispatch", ["React processes queued updates in one batched render", "commit: DOM patched", "browser paints", "default action (e.g. submit) happens unless preventDefault was called"]]
        ]),
        steps: [
          "The browser dispatches a native event that bubbles up to the root container where React registered a single listener at <code>createRoot</code> time.",
          "React maps the event target to its fiber and walks up the React tree (not the DOM tree; this matters for portals) collecting capture and bubble handlers for that event type.",
          "React calls the handlers in order with a <code>SyntheticEvent</code>. <code>stopPropagation()</code> stops the walk; <code>preventDefault()</code> calls the native method so the browser skips its default action.",
          "State updates made by any of the handlers are batched. Once dispatch finishes, React renders once and commits the DOM changes; discrete events like clicks and key presses are processed at high priority so the next frame reflects them."
        ]
      },
      ex: [
        {
          t: "Passing handlers, not calling them",
          lang: "tsx",
          code: `import { useState } from "react";

export function HandlerBasics() {
  const [log, setLog] = useState<string[]>([]);

  function handleSave() {
    setLog(l => [...l, "saved"]);
  }

  function handleDelete(id: number) {
    setLog(l => [...l, "deleted " + id]);
  }

  return (
    <div>
      {/* Correct: pass the function */}
      <button onClick={handleSave}>Save</button>

      {/* Correct: wrap to pass arguments */}
      <button onClick={() => handleDelete(42)}>Delete 42</button>

      {/* WRONG: calls handleSave during render. It sets state, which renders,
          which calls it again ... "Too many re-renders" */}
      {/* <button onClick={handleSave()}>Save</button> */}

      {/* WRONG (type error under strict TS too): handleDelete receives the event, not an id */}
      {/* <button onClick={handleDelete}>Delete</button> */}

      <ul>{log.map((entry, i) => <li key={i}>{entry}</li>)}</ul>
    </div>
  );
}`,
          note: `<p>TypeScript catches the second mistake: <code>onClick</code> expects <code>(e: MouseEvent&lt;HTMLButtonElement&gt;) =&gt; void</code>, and a function taking a <code>number</code> is not assignable. The first mistake type-checks only if the call returns something assignable (here <code>void</code>, which is not assignable to a handler, so TS flags it too). Using the index as key is acceptable here because the log is append-only.</p>`
        },
        {
          t: "Propagation, preventDefault and capture",
          lang: "tsx",
          code: `export function Card({ onOpen, onDelete }: { onOpen: () => void; onDelete: () => void }) {
  return (
    <div
      className="card"
      onClickCapture={() => console.log("1. card capture")}
      onClick={() => {
        console.log("3. card bubble: open details");
        onOpen();
      }}
    >
      <h3>Order #1042</h3>
      <button
        type="button"
        onClick={e => {
          console.log("2. delete button");
          e.stopPropagation(); // don't also open the card
          onDelete();
        }}
      >
        Delete
      </button>
      {/* A link that should not navigate (e.g. handled client-side) */}
      <a
        href="/orders/1042"
        onClick={e => {
          e.preventDefault();   // stop navigation
          e.stopPropagation();  // and don't open the card twice
          onOpen();
        }}
      >
        Details
      </a>
    </div>
  );
}`,
          out: `Click "Delete":       1. card capture / 2. delete button          (no "3.")
Click the card body:  1. card capture / 3. card bubble: open details`,
          note: `<p><code>stopPropagation</code> did not stop the capture handler: capture runs before the event reaches the button. Prefer designs that don't need <code>stopPropagation</code> (e.g. don't nest interactive elements inside a clickable card; make the title a link instead). Nesting a <code>&lt;button&gt;</code> inside an <code>&lt;a&gt;</code> or vice versa is invalid HTML and an accessibility problem.</p>`
        },
        {
          t: "Typing event handlers in TypeScript",
          lang: "tsx",
          code: `import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent, type MouseEvent } from "react";

export function TypedSearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(20);

  // Separate functions need explicit event types.
  function handleQueryChange(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }

  function handleLimitChange(e: ChangeEvent<HTMLInputElement>) {
    const n = e.target.valueAsNumber; // NaN when the field is empty
    setLimit(Number.isNaN(n) ? 0 : n);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Ignore Enter while an IME (Japanese/Chinese input) is composing text.
    if (e.key === "Escape" && !e.nativeEvent.isComposing) setQuery("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSearch(query.trim());
  }

  function handleClear(e: MouseEvent<HTMLButtonElement>) {
    console.log("clicked", e.currentTarget.name); // currentTarget is HTMLButtonElement
    setQuery("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={handleQueryChange} onKeyDown={handleKeyDown} />
      <input type="number" min={1} max={100} value={limit} onChange={handleLimitChange} />
      {/* Inline handlers infer their types from the prop: */}
      <button type="button" name="clear" onClick={handleClear}>Clear</button>
      <button type="submit" disabled={query.trim() === ""}>Search</button>
    </form>
  );
}`,
          note: `<p>Importing the types with <code>import { type ChangeEvent }</code> is equivalent to writing <code>React.ChangeEvent</code> with <code>import type React from "react"</code>. Hover over an inline handler's <code>e</code> in your editor to learn the right type for anything unfamiliar. A controlled number input bound to a number has a quirk: clearing it shows 0 immediately; if that's annoying, keep the raw string in state and parse on submit.</p>`
        },
        {
          t: "Controlled inputs: text, textarea, checkbox, radio, select",
          lang: "tsx",
          code: `import { useState } from "react";

type Plan = "free" | "pro" | "team";
type Signup = {
  name: string;
  bio: string;
  plan: Plan;
  country: string;
  acceptTerms: boolean;
  interests: string[];
};

const INTERESTS = ["react", "fastapi", "postgres"] as const;

export function SignupForm() {
  const [form, setForm] = useState<Signup>({
    name: "",
    bio: "",
    plan: "free",
    country: "IN",
    acceptTerms: false,
    interests: [],
  });

  function toggleInterest(tag: string, on: boolean) {
    setForm(f => ({
      ...f,
      interests: on ? [...f.interests, tag] : f.interests.filter(t => t !== tag),
    }));
  }

  const canSubmit = form.name.trim().length >= 2 && form.acceptTerms;

  return (
    <form onSubmit={e => { e.preventDefault(); console.log(form); }}>
      <label>
        Name
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </label>

      <label>
        Bio
        {/* value prop, not children */}
        <textarea
          value={form.bio}
          maxLength={280}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
        />
        <small>{280 - form.bio.length} characters left</small>
      </label>

      <fieldset>
        <legend>Plan</legend>
        {(["free", "pro", "team"] as const).map(p => (
          <label key={p}>
            <input
              type="radio"
              name="plan"
              value={p}
              checked={form.plan === p}
              onChange={() => setForm(f => ({ ...f, plan: p }))}
            />
            {p}
          </label>
        ))}
      </fieldset>

      <label>
        Country
        {/* value on the select, not "selected" on an option */}
        <select
          value={form.country}
          onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
        >
          <option value="IN">India</option>
          <option value="US">United States</option>
          <option value="DE">Germany</option>
        </select>
      </label>

      <fieldset>
        <legend>Interests</legend>
        {INTERESTS.map(tag => (
          <label key={tag}>
            <input
              type="checkbox"
              checked={form.interests.includes(tag)}
              onChange={e => toggleInterest(tag, e.target.checked)}
            />
            {tag}
          </label>
        ))}
      </fieldset>

      <label>
        {/* checkbox: checked + e.target.checked */}
        <input
          type="checkbox"
          checked={form.acceptTerms}
          onChange={e => setForm(f => ({ ...f, acceptTerms: e.target.checked }))}
        />
        I accept the terms
      </label>

      <button type="submit" disabled={!canSubmit}>Create account</button>
    </form>
  );
}`,
          note: `<p>Watch one subtle thing in the updater: <code>setForm(f =&gt; ({ ...f, name: e.target.value }))</code> reads <code>e.target.value</code> inside the updater, which React may call later. That is safe since React 17 (no event pooling) and because <code>e.target</code> is the same input, but the clearer habit is to read it first: <code>const v = e.target.value; setForm(f =&gt; ({...f, name: v}))</code>. <code>canSubmit</code> is derived during render, not stored in state.</p>`
        },
        {
          t: "Uncontrolled inputs with FormData and defaultValue",
          lang: "tsx",
          code: `import { useState, type FormEvent } from "react";

type Feedback = { email: string; rating: number; comment: string; subscribe: boolean };

export function FeedbackForm({ defaultEmail }: { defaultEmail: string }) {
  const [submitted, setSubmitted] = useState<Feedback | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;            // the <form>; capture it before any await
    const data = new FormData(form);         // reads every named field

    // FormData values are FormDataEntryValue (string | File) or null.
    const feedback: Feedback = {
      email: String(data.get("email") ?? ""),
      rating: Number(data.get("rating")),
      comment: String(data.get("comment") ?? ""),
      subscribe: data.get("subscribe") === "on", // unchecked boxes are simply absent
    };
    setSubmitted(feedback);
    form.reset(); // back to the defaultValue / defaultChecked values
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" defaultValue={defaultEmail} required />
      <select name="rating" defaultValue="5">
        <option value="5">Excellent</option>
        <option value="3">OK</option>
        <option value="1">Poor</option>
      </select>
      <textarea name="comment" defaultValue="" />
      <label>
        <input name="subscribe" type="checkbox" defaultChecked />
        Email me updates
      </label>
      <input name="attachment" type="file" /> {/* file inputs are always uncontrolled */}
      <button type="submit">Send</button>
      {submitted && <pre>{JSON.stringify(submitted, null, 2)}</pre>}
    </form>
  );
}`,
          out: `Submitting with defaults shows:
{ "email": "<defaultEmail>", "rating": 5, "comment": "", "subscribe": true }`,
          note: `<p>No state per field, no re-render per keystroke. <code>Object.fromEntries(new FormData(form))</code> is a quick way to get a plain object, but it loses repeated keys (multi-select, checkbox groups) and gives you strings; use <code>data.getAll("tags")</code> for those, and validate with Zod on real forms (Day 9). Changing <code>defaultEmail</code> after mount does <b>not</b> update the field: <code>defaultValue</code> is read once. Remount with a <code>key</code> to reset it.</p>`
        },
        {
          t: "Login form: controlled inputs posting to FastAPI /api/login",
          lang: "tsx",
          code: `import { useState, type FormEvent } from "react";

type LoginResponse = { access_token: string; token_type: string };
type Status = "idle" | "submitting";

// FastAPI returns { detail: "..." } for HTTPException,
// and { detail: [{ loc, msg, type }, ...] } for 422 validation errors.
function errorMessage(body: unknown, status: number): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: unknown };
      if (typeof first.msg === "string") return first.msg;
    }
  }
  return status === 401 ? "Invalid email or password" : "Login failed (HTTP " + status + ")";
}

export function LoginForm({ onLoggedIn }: { onLoggedIn: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submitting = status === "submitting";
  const canSubmit = email.includes("@") && password.length >= 8 && !submitting;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // if the API also sets an httpOnly cookie (Day 8)
        body: JSON.stringify({ email, password }),
      });
      const body: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(errorMessage(body, res.status));
        setPassword(""); // don't keep a rejected password around
        return;
      }
      onLoggedIn((body as LoginResponse).access_token);
    } catch {
      setError("Cannot reach the server. Check your connection and try again.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <h2>Sign in</h2>
      <label>
        Email
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={submitting}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={submitting}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={!canSubmit}>
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}`,
          note: `<p>Things worth copying: a status union instead of <code>isLoading</code> + <code>isError</code> booleans; the button disabled from state so double clicks can't post twice; errors cleared at the start of each attempt and announced with <code>role="alert"</code>; <code>finally</code> so the form never gets stuck in "submitting"; parsing FastAPI's two error shapes. Where to store the token and how to protect routes is Day 8; for production, an httpOnly cookie set by FastAPI is usually preferable to keeping a token in JavaScript.</p>`
        },
        {
          t: "The FastAPI side and the Vite proxy",
          lang: "py",
          code: `# app/main.py  (pip install fastapi uvicorn pydantic[email])
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr

app = FastAPI()

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

@app.post("/api/login", response_model=TokenOut)
async def login(body: LoginIn) -> TokenOut:
    user = await authenticate(body.email, body.password)   # your PostgreSQL lookup + password hash check
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenOut(access_token=create_access_token(user.id))

# --- vite.config.ts (frontend) ---------------------------------------------
# export default defineConfig({
#   plugins: [react()],
#   server: { proxy: { "/api": "http://localhost:8000" } },
# })`,
          note: `<p>With the proxy, the browser calls <code>/api/login</code> on the Vite origin and Vite forwards it to Uvicorn, so there is no CORS in development (Day 7 covers CORS for deployed setups). Note this endpoint takes JSON. FastAPI's <code>OAuth2PasswordRequestForm</code> instead expects form-encoded <code>username</code> and <code>password</code> fields; if your backend uses it, send <code>new URLSearchParams({ username: email, password })</code> as the body.</p>`
        },
        {
          t: "React 19: &lt;form action={fn}&gt; basics",
          lang: "tsx",
          code: `import { useState } from "react";

export function NewsletterForm() {
  const [message, setMessage] = useState<string | null>(null);

  // React 19: the form calls this with the FormData. No preventDefault needed.
  async function subscribe(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setMessage(res.ok ? "Subscribed " + email : "Could not subscribe");
  }

  return (
    <form action={subscribe}>
      {/* uncontrolled: React resets it after the action succeeds */}
      <input name="email" type="email" required />
      <button type="submit">Subscribe</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}`,
          out: `After a successful submit the email field is cleared and "Subscribed ..." appears.`,
          note: `<p>What React does: intercepts the submit, builds <code>FormData</code>, calls your function inside a transition, and resets uncontrolled fields when it completes. You still have no pending state or error handling here; React 19's <code>useActionState</code> and <code>useFormStatus</code> add those, and Day 9 covers them with React Hook Form + Zod. This requires React 19 and <code>@types/react</code> 19; in React 18 a function <code>action</code> is not supported.</p>`
        },
        {
          t: "Fixing the uncontrolled-to-controlled warning",
          lang: "tsx",
          code: `import { useState } from "react";

type Profile = { name: string; nickname?: string };

export function NicknameField({ profile }: { profile: Profile }) {
  // Bug 1: no initial value -> value is undefined -> uncontrolled.
  // After the first keystroke it becomes a string -> controlled -> warning:
  // "A component is changing an uncontrolled input to be controlled..."
  const [bad, setBad] = useState<string>();

  // Fix: always start with a defined value.
  const [good, setGood] = useState("");

  // Bug 2: optional field from the API is undefined.
  // <input value={profile.nickname} ... />   // same warning once it gets a value
  // Fix: coalesce.
  const [nickname, setNickname] = useState(profile.nickname ?? "");

  return (
    <>
      <input value={bad} onChange={e => setBad(e.target.value)} />  {/* warns */}
      <input value={good} onChange={e => setGood(e.target.value)} />
      <input value={nickname} onChange={e => setNickname(e.target.value)} />

      {/* Bug 3: value without onChange -> read-only field + warning. */}
      {/* <input value={profile.name} /> */}
      <input value={profile.name} readOnly />                 {/* intentionally read-only */}
      <input defaultValue={profile.name} />                   {/* or uncontrolled with an initial value */}
    </>
  );
}`,
          note: `<p>Rule: for any given input, decide once. Controlled means <code>value</code> is never <code>undefined</code> or <code>null</code> for its whole lifetime; uncontrolled means you never pass <code>value</code>, only <code>defaultValue</code>. The same applies to <code>checked</code> vs <code>defaultChecked</code> on checkboxes.</p>`
        }
      ],
      internals: `<p><b>Listener registration.</b> When you call <code>createRoot(container)</code>, React calls <code>listenToAllSupportedEvents(container)</code>: for each native event name it knows (click, keydown, input, change, focusin, pointerdown, …) it adds a capture and a bubble listener to the container. Non-bubbling events such as <code>scroll</code> on elements are handled with listeners on the target. This is why two React apps (or React and jQuery) can coexist on one page since React 17: each root only listens on its own container instead of <code>document</code>.</p>
<p><b>Dispatching.</b> When a native event reaches the root listener, React gets the target node, reads the fiber stored on it (React keeps an internal key on each DOM node pointing to its fiber), then walks <code>fiber.return</code> up to the root, collecting <code>onX</code> or <code>onXCapture</code> props from host-component fibers. Because the walk follows the fiber tree, portal children bubble to their React parents. A plugin system maps native events to React events: React's <code>onChange</code> is produced by a "change event plugin" that listens to <code>input</code>, <code>change</code>, <code>click</code> (for checkboxes/radios) and others, and normalises them so <code>onChange</code> fires on every edit. <code>onMouseEnter</code>/<code>onMouseLeave</code> are synthesised from <code>mouseover</code>/<code>mouseout</code>.</p>
<p><b>Priority and batching.</b> The listener is wrapped according to the event's priority: discrete events (click, keydown, input) get the highest (sync) lane, continuous events (mousemove, scroll, pointermove) a lower one. Updates made during dispatch are batched and, for discrete events, flushed synchronously at the end of the event (in a microtask) so that the UI reflects a click before the next event is handled. That guarantees, for example, that a "submit" button disabled in response to a click is disabled before a second click can be processed.</p>
<p><b>Controlled inputs.</b> For a controlled <code>&lt;input value&gt;</code>, the browser updates the DOM value first when the user types. React fires <code>onChange</code>; your handler queues a state update. After the event, React checks the input: if the DOM value no longer matches the <code>value</code> prop of the committed tree (for example because your handler rejected the change and didn't update state), React restores the DOM value to the prop. That is what "React controls the input" means at the DOM level, and why a <code>value</code> without <code>onChange</code> makes the field impossible to edit. If the state update is delayed (an async gap or a low-priority transition), the caret can jump to the end because React rewrites the value; keep input state updates synchronous and urgent.</p>
<p><b>Form actions.</b> In React 19, when a <code>&lt;form&gt;</code>'s <code>action</code> is a function, React handles the submit event, calls <code>preventDefault</code>, creates <code>FormData</code> (including the submitter button's name/value), and runs your function in a transition so the UI stays responsive and pending state can be tracked by <code>useFormStatus</code>. After the action's transition completes, React resets the form, which affects only uncontrolled fields.</p>`,
      prod: `<p>In a React + FastAPI product, forms are where users spend their time and where most bugs are reported. Patterns that hold up:</p>
<ul class="pts">
<li><b>Small forms</b> (login, search, newsletter): controlled inputs with <code>useState</code>, or uncontrolled + <code>FormData</code>. Both are fine. Disable submit while pending, show server errors next to the form, and send <code>autoComplete</code> attributes so password managers work.</li>
<li><b>Large forms</b> (onboarding, settings with 30 fields, dynamic field arrays): React Hook Form (largely uncontrolled under the hood, so typing does not re-render the whole form) with a Zod schema shared in spirit with your Pydantic model. Day 9.</li>
<li><b>Server validation is authoritative.</b> Client-side checks are UX; FastAPI's Pydantic validation is the real gate. Map FastAPI's <code>422</code> <code>detail[].loc</code> to field names to show errors next to the right input.</li>
<li><b>Double submits</b>: disable the button from state, and for payments or orders send an idempotency key the backend can store (Redis with a TTL is a common choice) so a retried request is not processed twice.</li>
<li><b>Search-as-you-type</b>: a controlled input updates immediately; the request is debounced (Day 10 <code>useDebounce</code>) and cancelled when stale (Day 7 race conditions), so Redis-cached FastAPI endpoints are not hammered on every keystroke.</li>
<li><b>Accessibility</b>: every input has a <code>&lt;label&gt;</code>, errors use <code>role="alert"</code> or <code>aria-describedby</code>, and submit works with Enter because you used a real <code>&lt;form&gt;</code>. Clickable <code>&lt;div&gt;</code>s with <code>onClick</code> are not keyboard accessible; use <code>&lt;button&gt;</code> (Day 9).</li>
<li><b>Performance</b>: a controlled input whose state lives at the top of a big page re-renders the whole page per keystroke. Push state down into the form component, or use uncontrolled inputs. Measure with the Profiler (Day 11) before memoising.</li>
</ul>
<p>Things that go wrong at scale: a third-party widget that calls <code>stopPropagation</code> and silently breaks your "click outside" dropdown logic; analytics added via <code>onClickCapture</code> at the app root that throws and blocks every click; and IME users (Chinese, Japanese, Korean) whose Enter key, used to confirm a character, submits the form because a <code>keydown</code> handler ignored <code>isComposing</code>.</p>`,
      iq: [
        ["fresher", "What is the difference between <code>onClick={handleClick}</code> and <code>onClick={handleClick()}</code>?", `<p>The first passes the function so React calls it when the click happens. The second calls it immediately during render and passes its return value. If <code>handleClick</code> sets state, that causes a render, which calls it again: "Too many re-renders". To pass arguments, wrap it: <code>onClick={() =&gt; handleClick(id)}</code>.</p>`],
        ["fresher", "What is a controlled input? What is an uncontrolled input?", `<p>A controlled input gets its displayed value from React state via <code>value</code> (or <code>checked</code>) and reports changes through <code>onChange</code>, which updates state; React state is the source of truth. An uncontrolled input keeps its own value in the DOM; you give it an initial <code>defaultValue</code> and read it when needed via <code>FormData</code> or a ref. Controlled is better for live validation, formatting and programmatic resets; uncontrolled is simpler and avoids a re-render per keystroke.</p>`],
        ["fresher", "Why do you call <code>e.preventDefault()</code> in an <code>onSubmit</code> handler?", `<p>Because the browser's default action for a form submit is to navigate (a GET or POST to the form's action URL), which reloads the page and wipes your React app's state. <code>preventDefault()</code> cancels that so you can handle the submit with <code>fetch</code>. Returning <code>false</code> from the handler does not do this in React. With React 19's <code>&lt;form action={fn}&gt;</code>, React prevents the default for you.</p>`],
        ["mid", "What is a SyntheticEvent and how does React's event delegation work?", `<p>A <code>SyntheticEvent</code> is React's cross-browser wrapper around the native event with the same interface and the native event at <code>e.nativeEvent</code>. React doesn't attach listeners to each element; since React 17 it registers one listener per event type on the root container. When an event bubbles to the root, React finds the target's fiber, walks up the React tree collecting capture and bubble handlers, and calls them. Because it follows the React tree, events from portals bubble to React ancestors. Event pooling was removed in React 17, so the event can be used asynchronously.</p>`],
        ["mid", "What causes the warning \"A component is changing an uncontrolled input to be controlled\" and how do you fix it?", `<p>React treats an input as uncontrolled when <code>value</code> is <code>undefined</code> or <code>null</code>. If the first render passes <code>undefined</code> (e.g. <code>useState()</code> without an initial value, or an optional API field) and a later render passes a string, the input switches mode. Fix by always passing a defined value: <code>useState("")</code>, <code>value={user.nickname ?? ""}</code>. The tempting fix of adding <code>defaultValue</code> as well is wrong: an input must be one or the other.</p>`],
        ["mid", "How do you type a change handler and a submit handler in TypeScript?", `<p><code>function onChange(e: React.ChangeEvent&lt;HTMLInputElement&gt;)</code> (or <code>HTMLSelectElement</code>/<code>HTMLTextAreaElement</code>), and <code>function onSubmit(e: React.FormEvent&lt;HTMLFormElement&gt;)</code>. Prop types use the handler aliases: <code>onChange: React.ChangeEventHandler&lt;HTMLInputElement&gt;</code>. Prefer <code>e.currentTarget</code> for the element the handler is attached to; for a form submit, <code>new FormData(e.currentTarget)</code>. Inline handlers don't need annotations; types are inferred from the prop.</p>`],
        ["mid", "When would you choose <code>e.stopPropagation()</code>, and what problems can it cause?", `<p>When a nested interactive element must not trigger its ancestor's handler, e.g. a delete button inside a clickable card. The problem is that it also hides the event from everything above: "click outside to close" handlers, analytics, keyboard shortcut managers. Alternatives: check <code>e.target</code> in the parent, restructure so interactive elements aren't nested, or use capture-phase handlers for global concerns. It also doesn't stop capture handlers on ancestors, which already ran.</p>`],
        ["senior", "Controlled vs uncontrolled for a 40-field settings form: how do you decide, and what's the performance story?", `<p>With 40 controlled fields in one <code>useState</code> at the form root, every keystroke re-renders the entire form; usually fine on desktop but noticeable on low-end devices or with heavy field components. Options: keep state controlled but split the form into memoised sections; use uncontrolled inputs and read with <code>FormData</code>; or use React Hook Form, which registers uncontrolled inputs and only re-renders subscribed parts, while still supporting validation (Zod), dirty tracking and field arrays. I'd choose React Hook Form + Zod for that size, and plain controlled state for forms of a few fields. Measure with the Profiler rather than assuming.</p>`],
        ["senior", "Why did React 17 move event listeners from <code>document</code> to the root container, and what changed for applications?", `<p>Attaching to <code>document</code> meant multiple React versions or roots on the same page interfered (one root's <code>stopPropagation</code> affected another), and mixing React with non-React code was awkward: a native <code>document</code> listener ran in a confusing order relative to React handlers. Attaching to each root container makes roots independent and enables gradual upgrades and micro-frontends. Visible changes: <code>e.stopPropagation()</code> in React now also stops native listeners on <code>document</code>; code that relied on <code>document.addEventListener</code> firing before React handlers may need <code>{ capture: true }</code>. Pooling was removed in the same release and <code>onScroll</code> stopped bubbling.</p>`],
        ["lead", "How do you design form error handling between a React client and a FastAPI backend?", `<p>Treat the server as the source of truth and define a contract. FastAPI returns <code>422</code> with <code>detail: [{loc, msg, type}]</code> for schema errors and <code>HTTPException</code> with <code>detail: string</code> for business errors; standardise a single error shape (e.g. <code>{code, message, fields: {name: msg}}</code>) with an exception handler, document it in OpenAPI, and generate TS types from it. On the client, map field errors to inputs (<code>aria-invalid</code>, <code>aria-describedby</code>), show a form-level <code>role="alert"</code> for others, keep entered values on failure (except passwords), and distinguish network failures from 4xx/5xx. Validate client-side with Zod for fast feedback, but never rely on it.</p>`],
        ["architect", "React 19 introduced form actions. How do they change the architecture of form handling compared to <code>onSubmit</code> + <code>useState</code>?", `<p><code>&lt;form action={fn}&gt;</code> moves submission plumbing into React: it builds <code>FormData</code>, runs the function in a transition (so pending state is tracked and the UI stays responsive), resets uncontrolled fields on success, and in frameworks with Server Functions can call server code directly and work before hydration (progressive enhancement). Paired with <code>useActionState</code>/<code>useFormStatus</code>/<code>useOptimistic</code> (Day 9), much of the manual <code>loading</code>/<code>error</code> state disappears. For a Vite SPA talking to FastAPI the action is still a client function calling <code>fetch</code>, so the main benefits are less boilerplate and transition semantics, not server execution. I'd adopt it for simple forms and keep React Hook Form where complex client validation, dirty tracking or field arrays are required; the two can be combined.</p>`]
      ],
      gotchas: [
        `<b><code>onChange</code> in React fires on every keystroke</b>, unlike the native <code>change</code> event which fires on blur. If you port vanilla JS code that expected blur semantics, use <code>onBlur</code>.`,
        `<b>A <code>&lt;button&gt;</code> inside a form is <code>type="submit"</code> by default.</b> A "Cancel" or "Add row" button without <code>type="button"</code> submits the form.`,
        `<b>Input values are always strings.</b> <code>e.target.value</code> on <code>type="number"</code> is <code>"42"</code>, and <code>""</code> when empty. <code>valueAsNumber</code> gives <code>NaN</code> for empty. Unchecked checkboxes are absent from <code>FormData</code>; checked ones without a <code>value</code> give <code>"on"</code>.`,
        `<b>Reading <code>e.currentTarget</code> after an <code>await</code></b>: React sets it while dispatching; after the handler returns it is <code>null</code>. Capture <code>const form = e.currentTarget</code> before awaiting.`,
        `<b><code>value</code> without <code>onChange</code></b> makes a read-only field that silently ignores typing (with a console warning). Use <code>readOnly</code> or <code>defaultValue</code> if that's intended.`,
        `<b>Switching between controlled and uncontrolled</b> (<code>value</code> going from <code>undefined</code> to a string) triggers a warning and inconsistent behaviour. Initialise with <code>""</code> and coalesce optional data with <code>?? ""</code>.`,
        `<b><code>defaultValue</code> is read once.</b> Updating the prop after mount does nothing. Load data first and then render the form, or remount with <code>key={record.id}</code>.`,
        `<b>Enter during IME composition</b> fires <code>keydown</code> with <code>key === "Enter"</code>; check <code>e.nativeEvent.isComposing</code> before treating it as "submit".`,
        `<b><code>stopPropagation()</code> doesn't stop capture handlers</b> on ancestors (they already ran) and does stop React handlers <i>and</i> native <code>document</code> listeners above the root, which can break third-party "click outside" logic.`
      ],
      best: [
        `Use a real <code>&lt;form&gt;</code> with <code>onSubmit</code> (or a React 19 <code>action</code>) and <code>type="submit"</code>; you get Enter-to-submit, native constraint validation and better accessibility.`,
        `Pass handlers (<code>onClick={handleX}</code>), name them <code>handleX</code>, and name handler props <code>onX</code>.`,
        `Pick controlled or uncontrolled per input and keep it that way; initialise controlled values to <code>""</code>, <code>false</code> or <code>[]</code>.`,
        `Model submission with a status union, disable submit while pending, clear errors on each attempt, and always reset status in <code>finally</code>.`,
        `Derive validity (<code>canSubmit</code>) during render instead of storing it; validate on the client for UX and on the server (Pydantic) for correctness.`,
        `Type separate handlers with <code>React.ChangeEvent&lt;T&gt;</code>/<code>React.FormEvent&lt;HTMLFormElement&gt;</code> and prefer <code>e.currentTarget</code>.`,
        `Avoid <code>stopPropagation</code> unless you must; prefer non-nested interactive elements.`
      ],
      lab: [
        `In your Vite react-ts app, add a Vite proxy: <code>server: { proxy: { "/api": "http://localhost:8000" } }</code>. Start a FastAPI app with the <code>/api/login</code> endpoint above (a stub <code>authenticate</code> that accepts one hard-coded email/password is fine).`,
        `Build <code>src/day3/LoginForm.tsx</code> with controlled email and password inputs, a <code>Status</code> union, an <code>error</code> state, and the submit handler. Render it from <code>App.tsx</code> and log the token in <code>onLoggedIn</code>.`,
        `Test the paths: wrong password (expect the 401 message), an invalid email with <code>noValidate</code> removed vs present (browser validation vs FastAPI's 422 message), stop the FastAPI server (expect the network error message), and double-click Sign in (Network tab should show one request).`,
        `Add a <code>delay</code> to the FastAPI endpoint (<code>await asyncio.sleep(2)</code>) and confirm the button shows "Signing in..." and the inputs are disabled while pending.`,
        `Build the uncontrolled <code>FeedbackForm</code> with <code>FormData</code>. Add <code>console.log("render")</code> to both forms and compare how often each renders while you type.`,
        `Create the uncontrolled-to-controlled warning on purpose with <code>useState&lt;string&gt;()</code>, read the console message, then fix it.`,
        `If you are on React 19, convert the newsletter form to <code>&lt;form action={subscribe}&gt;</code> and observe that the field is cleared after a successful submit.`,
        `<b>Done when:</b> all four login paths show the correct message, only one request is sent per submit, the controlled form logs a render per keystroke while the uncontrolled one does not, and there are no warnings in the console.`
      ],
      teach: `<p>"In React you attach handlers with props like <code>onClick</code> and <code>onSubmit</code>, and you pass a function, not a call: <code>onClick={handleSave}</code>. If you write <code>handleSave()</code>, it runs during render.</p>
<p>React doesn't put a listener on every button. It puts one listener per event type on the root of the app, and when an event bubbles up, it figures out which components were on the path and calls their handlers with a synthetic event. That's why propagation follows the component tree, and why all the state updates from one event are batched into one render. <code>preventDefault</code> stops the browser's default, like a form reloading the page; <code>stopPropagation</code> stops parents from hearing the event.</p>
<p>For forms there are two styles. Controlled: the input's <code>value</code> comes from state and <code>onChange</code> updates state, so React is the source of truth and I can validate on every keystroke. Uncontrolled: the DOM keeps the value, I set <code>defaultValue</code>, and I read everything with <code>FormData</code> on submit. The one rule is never to switch: if <code>value</code> starts as <code>undefined</code> and later becomes a string, React warns.</p>
<p>A real login form is controlled inputs plus a status and an error: on submit I prevent the default, set submitting, post to FastAPI, show the server's error message or hand back the token, and reset status in <code>finally</code>. React 19 adds <code>&lt;form action={fn}&gt;</code>, which does the <code>FormData</code> and reset for me; Day 9 builds on that."</p>`
    }
  ],
  quiz: [
    {
      q: `The count starts at 0. The user clicks the button once. What does the button show, and what does the console log?`,
      code: `function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => {
      setCount(count + 1);
      setCount(count + 1);
      setCount(count + 1);
      console.log(count);
    }}>
      {count}
    </button>
  );
}`,
      lang: "tsx",
      ans: `The button shows <b>1</b>; the console logs <b>0</b>.`,
      why: `<p><code>count</code> is the snapshot from the render that created this handler, so it is 0 throughout. Each call queues "replace with 1". After the handler, React renders once (batching) and the result is 1. The <code>console.log</code> runs before that render, and in any case reads the constant from this render.</p>`
    },
    {
      q: `Same component, but the handler is changed as below. The count starts at 0. What does the button show after one click?`,
      code: `onClick={() => {
  setCount(count + 5);
  setCount(c => c + 1);
  setCount(c => c * 2);
}}`,
      lang: "tsx",
      ans: `<b>12</b>.`,
      why: `<p>React processes the queue in order: "replace with 5" gives 5, then <code>c =&gt; c + 1</code> gives 6, then <code>c =&gt; c * 2</code> gives 12. A plain value replaces whatever came before it; an updater is applied to the result so far. If the order were <code>c =&gt; c + 1</code> then <code>setCount(42)</code>, the answer would be 42.</p>`
    },
    {
      q: `This "add item" button seems broken: clicking it does nothing visible. But when the user then toggles the unrelated "dark mode" checkbox, all the added items suddenly appear. Explain.`,
      code: `function List() {
  const [items, setItems] = useState<string[]>(["a"]);
  const [dark, setDark] = useState(false);
  return (
    <div className={dark ? "dark" : ""}>
      <button onClick={() => { items.push("new"); setItems(items); }}>Add</button>
      <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />
      <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}`,
      lang: "tsx",
      ans: `<code>push</code> mutates the existing array and <code>setItems</code> receives the same reference, so React bails out. The toggle triggers a real render, which then reads the mutated array.`,
      why: `<p>React compares state with <code>Object.is</code>. Same array, so "no change", no render. The data in memory did change, so the next render for any reason displays it. Fix: <code>setItems(prev =&gt; [...prev, "new"])</code>. (With <code>ReadonlyArray&lt;string&gt;</code> as the state type, the <code>push</code> would be a compile error.) Also note that using the index as key is only acceptable because items are never reordered or removed.</p>`
    },
    {
      q: `The user clicks "Increment" three times quickly (within one second), then waits. What do the alerts show, and what is on the screen at the end?`,
      code: `function Delayed() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setTimeout(() => {
      setCount(count + 1);
      alert(count);
    }, 3000);
  }
  return <button onClick={handleClick}>Increment ({count})</button>;
}`,
      lang: "tsx",
      ans: `All three alerts show <b>0</b>, and the screen ends at <b>Increment (1)</b>.`,
      why: `<p>Each click happens before any timeout fires, so all three handlers were created by the render with <code>count === 0</code>. Each timeout closes over that 0, queues "set to 1" and alerts 0. Fix: <code>setCount(c =&gt; c + 1)</code> ends at 3 (the alerts would still show the stale 0, because the closure still reads the old snapshot).</p>`
    },
    {
      q: `The user clicks the "Delete" button inside the card once. Which lines are logged, in what order?`,
      code: `function Card() {
  return (
    <div
      onClickCapture={() => console.log("A")}
      onClick={() => console.log("B")}
    >
      <button onClick={e => { console.log("C"); e.stopPropagation(); }}>
        Delete
      </button>
    </div>
  );
}`,
      lang: "tsx",
      ans: `<b>A</b>, then <b>C</b>. "B" is never logged.`,
      why: `<p>React collects capture handlers top-down first, so the div's <code>onClickCapture</code> runs before the button's handler. Then bubble handlers run bottom-up: the button logs C and calls <code>stopPropagation</code>, which prevents the div's <code>onClick</code>. <code>stopPropagation</code> cannot "un-run" capture handlers that already fired.</p>`
    },
    {
      q: `A profile form shows a console warning as soon as the user types the first character into the nickname field, and the team asks which approach to choose to fix it. What is the warning, and what is the right fix?`,
      code: `type Profile = { name: string; nickname?: string };

function EditProfile({ profile }: { profile: Profile }) {
  const [nickname, setNickname] = useState(profile.nickname);
  return <input value={nickname} onChange={e => setNickname(e.target.value)} />;
}`,
      lang: "tsx",
      ans: `"A component is changing an uncontrolled input to be controlled". Fix: <code>useState(profile.nickname ?? "")</code>.`,
      why: `<p>When <code>nickname</code> is missing, <code>value</code> is <code>undefined</code>, which React treats as uncontrolled. After one keystroke it becomes a string, so the input switches to controlled. Always give a controlled input a defined value. Adding <code>defaultValue</code> as well is wrong (an input is one or the other). Also note that <code>useState(profile.nickname ?? "")</code> only reads the prop on mount; if the same form is reused for another profile, render it with <code>key={profile.id}</code> so the state resets.</p>`
    }
  ]
},
/* ===== Day 4 ===== */
{
  n: 4,
  title: "The render model and state design",
  goal: `<b>By the end of today</b> you can explain exactly when and why React re-renders a component, predict whether state survives a UI change (same type at the same position keeps it; a different type or a new <code>key</code> resets it), and design component state that is minimal, non-contradictory and owned in one place, choosing between <code>useState</code> and a typed <code>useReducer</code> deliberately.`,
  rev: [
    `<b>Trigger → render → commit.</b> A render is triggered by the initial <code>root.render()</code> or a state update (<code>setState</code>, <code>dispatch</code>, a changed context value, an external store via <code>useSyncExternalStore</code>). Rendering = React <i>calling your components</i> and diffing the returned elements. Commit = applying only the DOM changes that the diff found, then attaching refs and running layout effects; the browser paints; then <code>useEffect</code> runs.`,
    `<b>Re-render causes:</b> own state change, a parent re-rendering (children re-render by default, whether or not their props changed), a context value it reads changing. A prop change is <b>not</b> a trigger by itself: props only change because the parent rendered. Setting state to an <code>Object.is</code>-equal value bails out. Render must be pure: same props/state/context in, same JSX out, no side effects (StrictMode double-calls components in development to expose impurity).`,
    `<b>Identity and reconciliation:</b> state lives in React's tree, tied to a <i>position</i>. Same component type at the same position → kept (props updated). Different type at that position (or a different wrapper element above it) → the whole subtree is unmounted and its state destroyed. A different <code>key</code> → treated as a different component → remount. Use <code>&lt;Profile key={userId} /&gt;</code> to reset deliberately. Never define a component inside another component: it is a new type every render, so it remounts and loses state and focus.`,
    `<b>State design:</b> group values that change together; replace contradictory booleans with one <code>status</code> union; never store what you can compute during render (derived state); store IDs, not copies of objects; flatten (normalise) deep trees into maps by id. Don't copy props into state (it ignores later prop changes); name it <code>initialX</code> or use a <code>key</code>.`,
    `<b>Lifting state up</b> moves state to the closest common parent so there is a single source of truth; children become <i>controlled</i> (<code>value</code> + <code>onChange</code> props). <b><code>useReducer</code></b> moves update logic into a pure <code>(state, action) =&gt; newState</code> function; in TypeScript model actions as a discriminated union with an exhaustive <code>never</code> check. Prefer it when many handlers update related fields or the next state depends on the previous one in non-trivial ways.`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d4-rendering",
      title: "Rendering: trigger, render, commit, reconciliation and identity",
      lv: ["fresher", "mid", "senior", "lead"],
      eli5: `<p>Think of a restaurant. A customer places an <b>order</b> (that's the <i>trigger</i>). The chef in the kitchen <b>prepares the dish</b> (that's the <i>render</i>): she reads the order and works out what should be on the plate. Finally a waiter <b>carries it to the table</b> (that's the <i>commit</i>): only then does the customer see anything.</p>
<p>The clever part: if the customer only asked for more salt, the waiter doesn't clear the table and bring a whole new set of plates. He adds salt to the plate that's already there. React works the same way. Your components describe what the screen <i>should</i> look like; React compares that with what it looked like last time and only touches the pieces of the page that actually changed.</p>
<p>And each dish remembers things (is it hot? has the customer eaten half?). React remembers your component's state by <b>where it sits on the table</b>. If the same kind of dish stays in the same spot, it keeps its memory. If you swap it for a different dish, or put a new label (a <code>key</code>) on it, React treats it as a brand new dish and its memory starts fresh.</p>`,
      what: `<p>"Rendering" in React has a narrow, precise meaning: <b>React calling your component functions</b> to find out what the UI should be. It is not the same as updating the screen. Every update goes through three steps.</p>
<h5>The three steps</h5>
<ul class="pts">
<li><b>1. Trigger.</b> Something tells React that work is needed: the initial <code>createRoot(el).render(&lt;App /&gt;)</code>, or a state update somewhere in the tree (<code>setState</code>, a <code>useReducer</code> <code>dispatch</code>, a new context value, a subscribed external store changing). React <i>queues</i> the update; it does not render synchronously inside your event handler. Several updates in the same event (and, since React 18, in timeouts and promises too) are batched into one render (Day 3).</li>
<li><b>2. Render.</b> React calls the component that owns the updated state, then, recursively, the components it returns. Each call returns <b>React elements</b>: plain objects such as <code>{ type: Counter, key: null, props: { fancy: true } }</code>. React compares (reconciles) the new elements with the previous tree to work out what changed. Nothing on screen has changed yet, and because of concurrent features this phase may be paused, restarted or thrown away (Day 12).</li>
<li><b>3. Commit.</b> React applies the minimal set of changes to the DOM in one synchronous pass: insert new nodes, remove deleted ones, update only the attributes and text that differ. It then attaches refs and runs <code>useLayoutEffect</code> callbacks. The browser paints, and after that React runs <code>useEffect</code> callbacks (Day 5).</li>
</ul>
<h5>What causes a component to re-render</h5>
<ul class="pts">
<li><b>Its own state changes</b> (<code>useState</code> / <code>useReducer</code>). If the new value is identical to the current one by <code>Object.is</code>, React bails out and does not re-render the children. (React may occasionally call the component once more before deciding to bail out; that is harmless if render is pure.)</li>
<li><b>Its parent re-renders.</b> This is the one people forget. By default, when a component renders, <b>every component it returns renders too</b>, whether their props changed or not. A child that takes no props at all still re-renders. <code>React.memo</code> and the React Compiler can skip unchanged children (Day 11), but that is an optimisation, not the default.</li>
<li><b>A context it reads changes</b> (<code>useContext</code> / <code>use</code>): every consumer of that context re-renders when the provider's <code>value</code> changes by <code>Object.is</code>, even through a <code>memo</code> boundary (Day 6).</li>
<li><b>An external store it subscribes to</b> via <code>useSyncExternalStore</code> (what Redux, Zustand and friends use; Day 6 and Day 10).</li>
<li><b>Not: "its props changed".</b> Props are an <i>input</i> to a render, not a trigger. A child's props can only change because its parent rendered and produced new elements. Mutating a props object from outside does nothing; there is no subscription on props.</li>
</ul>
<h5>Render must be pure</h5>
<p>Because React may call your component many times, at moments you don't control, and may discard a render it started, a component must behave like a pure function of its inputs (props, state, context): same inputs, same JSX, and <b>no side effects during render</b>. No mutating variables or objects that existed before the render, no <code>fetch</code>, no writing to <code>localStorage</code>, no <code>document.title = …</code>. Creating and mutating <i>local</i> variables inside the render is fine. Side effects belong in event handlers (first choice) or effects. In development, <code>&lt;StrictMode&gt;</code> calls your components (and reducers, state initialisers and updater functions) twice to surface impurity.</p>
<h5>Reconciliation: identity is type + position (+ key)</h5>
<p>State does not live "inside" your function. It lives in React's internal tree, attached to a slot, and React matches each new element to an old slot using simple, fast heuristics instead of a general tree diff:</p>
<ul class="pts">
<li><b>Same type at the same position → same component.</b> React keeps the instance (and all of its state and its DOM), and just passes the new props. <code>{fancy ? &lt;Counter fancy /&gt; : &lt;Counter /&gt;}</code> keeps the counter's state: it's a <code>Counter</code> in the first child slot either way.</li>
<li><b>Different type at the same position → destroy and recreate.</b> React unmounts the old subtree (running cleanups, removing DOM, discarding <i>all</i> state below it) and mounts the new one from scratch. That includes wrapper changes: switching <code>&lt;div&gt;&lt;Counter /&gt;&lt;/div&gt;</code> to <code>&lt;section&gt;&lt;Counter /&gt;&lt;/section&gt;</code> resets the counter, because the slot above it changed type.</li>
<li><b>Position is position in the returned tree, not in your source code.</b> <code>{a &amp;&amp; &lt;X /&gt;}{!a &amp;&amp; &lt;X /&gt;}</code> creates two separate child slots (one is always <code>false</code>, which still occupies its slot), so toggling <code>a</code> moves <code>X</code> between slots and resets it.</li>
<li><b>Keys override position.</b> Among siblings, React matches by <code>key</code> instead of index. A different key means a different component, even at the same position and of the same type. That makes the key a deliberate <b>reset button</b>: <code>&lt;Profile key={userId} user={user} /&gt;</code> gives each user a fresh <code>Profile</code> with fresh state. In lists (Day 2) stable keys let React move items and their state instead of re-creating them.</li>
<li><b>Component identity is the function reference.</b> If you declare <code>function Row() {…}</code> <i>inside</i> another component, every render creates a new function, so the type is different every time and React remounts it on every keystroke: state is lost, inputs lose focus, effects re-run. Declare components at module top level.</li>
</ul>
<h5>The DOM is only touched where something changed</h5>
<p>"Re-render" sounds expensive, but rendering is just calling functions and comparing objects. If a component re-renders and returns the same output, React makes <b>no DOM changes at all</b>. When something differs, React updates exactly that attribute or text node; an <code>&lt;input&gt;</code> React kept keeps its focus, cursor position and typed value. This is why re-renders are usually cheap and why you should not try to prevent them all; Day 11 covers when it is worth it.</p>`,
      why: `<p>Before React, UI code mixed "what should be on screen" with "how to change the screen": find the node, set its text, toggle a class, remember to remove the old listener. Every new state needed new hand-written transitions, and bugs came from the DOM and your data drifting apart.</p>
<p>React's bargain is: <b>you describe the UI for the current state; React works out the transitions</b>. That only works if React can (1) re-run your description cheaply whenever state changes (render), (2) work out the minimal set of DOM operations (reconciliation), and (3) apply them consistently in one go (commit). The split into phases is what lets React batch updates, avoid half-updated screens, and, with concurrent rendering, prepare a new UI in the background without blocking typing.</p>
<p>A fully general tree diff is O(n³); far too slow for UIs. So React uses heuristics that are O(n): elements of different types produce different trees, and keys identify children across renders. Those heuristics are exactly what decide whether your state survives, which is why "identity" is a design concept you need to understand, not an implementation detail. The bugs it explains are some of the most common in real apps: a form that keeps the previous user's draft, an input that loses focus on every keystroke, a component that "randomly" resets.</p>`,
      diagram: {
        html: flow([["Trigger", "initial render, setState, dispatch, context change", "w"], ["Render", "React calls components, gets elements, diffs against the previous tree", ""], ["Commit", "minimal DOM changes, refs attached, layout effects", "g"], ["Paint + effects", "browser paints, then useEffect callbacks run", ""]]) +
          lanes([["Same type, same position", ["Instance kept", "State preserved", "DOM node reused, props updated"]], ["Different type at that position", ["Old subtree unmounted (cleanups run)", "All state below is destroyed", "New subtree mounted fresh"]], ["Same type, different key", ["Treated as a different component", "Remount with fresh state", "Use it to reset on purpose"]]]),
        steps: [
          `<b>Trigger:</b> a state setter is called in an event handler. React marks that component's fiber as needing work and schedules a render; more updates in the same event are batched into the same render.`,
          `<b>Render:</b> React calls the updated component, then each child it returns (children re-render by default). For each returned element it compares <code>type</code> and <code>key</code> with the element previously at that position to decide keep, update, or replace.`,
          `<b>Reconcile:</b> same type + key → keep the instance and its state, update props. Different type or key → mark the old subtree for deletion and create a new one with fresh state.`,
          `<b>Commit:</b> React walks the list of changes and applies them to the DOM in one synchronous pass, changing only the attributes and text that differ; then it attaches refs and runs layout effects.`,
          `<b>After paint:</b> the browser draws the frame, then React runs <code>useEffect</code> callbacks. If they set state, the cycle starts again.`
        ]
      },
      ex: [
        {
          t: "Who re-renders? Children render with their parent even when their props didn't change",
          lang: "tsx",
          code: `// src/RenderDemo.tsx
import { useState } from "react";

function Child({ label }: { label: string }) {
  console.log("render Child", label);
  return <p>{label}</p>;
}

function NoProps() {
  console.log("render NoProps");
  return <p>I take no props at all.</p>;
}

export default function Parent() {
  const [count, setCount] = useState(0);
  console.log("render Parent", count);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count}</button>
      <button onClick={() => setCount(count)}>Set the same value</button>
      <Child label="always the same" />
      <NoProps />
    </div>
  );
}`,
          out: `Initial mount (StrictMode off):
render Parent 0
render Child always the same
render NoProps

Click "Clicked 0":
render Parent 1
render Child always the same
render NoProps

Click "Set the same value":
(nothing: Object.is(1, 1) is true, React bails out)`,
          note: `<p>Neither <code>Child</code> nor <code>NoProps</code> received new props, yet both re-rendered: they are inside <code>Parent</code>'s output, and a rendering parent renders its children. The DOM, however, was only changed in one place: the button's text node. Turn on React DevTools → Settings → "Highlight updates when components render" to see this visually. With <code>&lt;StrictMode&gt;</code> on, each render is called twice in development (React 19 DevTools dims the second log).</p>`
        },
        {
          t: "Children passed in from above don't re-render when the wrapper's state changes",
          lang: "tsx",
          code: `// src/ColorPickerDemo.tsx
import { useState, type ReactNode } from "react";

function ExpensiveTree() {
  console.log("render ExpensiveTree");
  return <ul>{Array.from({ length: 500 }, (_, i) => <li key={i}>Row {i}</li>)}</ul>;
}

// Owns fast-changing state but receives its content as a prop
function ColorFrame({ children }: { children: ReactNode }) {
  const [color, setColor] = useState("#3366ff");
  return (
    <div style={{ border: \`4px solid \${color}\`, padding: 8 }}>
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <ColorFrame>
      <ExpensiveTree />
    </ColorFrame>
  );
}`,
          out: `Dragging the colour picker:
(ColorFrame renders on every change; "render ExpensiveTree" is logged only once, on mount)`,
          note: `<p>The <code>&lt;ExpensiveTree /&gt;</code> element object was created by <code>App</code>, which never re-rendered. <code>ColorFrame</code> returns the <i>same</i> element object it was given as <code>children</code>, and when React meets an element whose props object is identical to last time (and there is no pending update or context change for it), it skips that subtree. This "lift the content up / pass it as children" restructuring is often a better fix than <code>memo</code>.</p>`
        },
        {
          t: "Same type at the same position: state is preserved",
          lang: "tsx",
          code: `// src/PreserveDemo.tsx
import { useState } from "react";

function Counter({ fancy }: { fancy: boolean }) {
  const [n, setN] = useState(0);
  return (
    <button className={fancy ? "fancy" : undefined} onClick={() => setN(n + 1)}>
      {fancy ? "Fancy" : "Plain"} counter: {n}
    </button>
  );
}

export default function App() {
  const [fancy, setFancy] = useState(false);
  return (
    <div>
      {fancy ? <Counter fancy={true} /> : <Counter fancy={false} />}
      <label>
        <input type="checkbox" checked={fancy} onChange={(e) => setFancy(e.target.checked)} />
        Fancy
      </label>
    </div>
  );
}`,
          out: `Click the counter 3 times -> "Plain counter: 3"
Tick "Fancy"                -> "Fancy counter: 3"   (state kept)`,
          note: `<p>The two branches look different in your source, but React never sees your <code>if</code>/ternary. It only sees the returned tree: "a <code>div</code> whose first child is a <code>Counter</code>". Same type, same slot → same instance; only the <code>fancy</code> prop changed.</p>`
        },
        {
          t: "Three ways to accidentally reset state",
          lang: "tsx",
          code: `// src/ResetDemo.tsx  (Counter from the previous example, moved to src/Counter.tsx and exported)
import { useState } from "react";
import { Counter } from "./Counter";

export default function App() {
  const [on, setOn] = useState(false);

  return (
    <>
      {/* 1. Different wrapper type above the Counter: div vs section */}
      {on ? (
        <div><Counter fancy={true} /></div>
      ) : (
        <section><Counter fancy={false} /></section>
      )}

      {/* 2. Two separate slots: the false branch still occupies a slot */}
      {on && <Counter fancy={true} />}
      {!on && <Counter fancy={false} />}

      {/* 3. Different component types at the same position */}
      {on ? <Counter fancy={true} /> : <p>Counter hidden</p>}

      <button onClick={() => setOn(!on)}>Toggle</button>
    </>
  );
}`,
          out: `Increment each counter, then press Toggle:
1 -> resets to 0 (div replaced by section, whole subtree remounted)
2 -> resets to 0 (Counter moved from slot 2 to slot 3)
3 -> unmounted; toggling back mounts a new Counter at 0`,
          note: `<p>In case 2 the fragment's children are <code>[false, &lt;Counter/&gt;]</code> and then <code>[&lt;Counter/&gt;, false]</code>: the Counter changes slot, so React sees "slot 2: Counter → nothing" (unmount) and "slot 3: nothing → Counter" (mount). Compare with the single ternary in the previous example, which keeps one slot.</p>`
        },
        {
          t: "Reset on purpose with a key: <Profile key={userId} />",
          lang: "tsx",
          code: `// src/ProfileDemo.tsx
import { useState } from "react";

type User = { id: number; name: string };

const USERS: User[] = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
  { id: 3, name: "Linus" },
];

function Profile({ user }: { user: User }) {
  // A draft message that belongs to THIS user only
  const [draft, setDraft] = useState("");
  return (
    <section>
      <h2>{user.name}</h2>
      <textarea
        value={draft}
        placeholder={\`Message \${user.name}\`}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button onClick={() => setDraft("")}>Send to {user.name}</button>
    </section>
  );
}

export default function UserBrowser() {
  const [selectedId, setSelectedId] = useState(USERS[0].id);
  const user = USERS.find((u) => u.id === selectedId) ?? USERS[0];

  return (
    <div>
      <nav>
        {USERS.map((u) => (
          <button key={u.id} onClick={() => setSelectedId(u.id)}>{u.name}</button>
        ))}
      </nav>
      {/* Without the key, a half-typed message to Ada would still be there for Grace */}
      <Profile key={user.id} user={user} />
    </div>
  );
}`,
          out: `Type "hi Ada" -> click Grace -> textarea is empty again
(without key={user.id}: the textarea would still say "hi Ada" under the heading "Grace")`,
          note: `<p>Changing the key tells React "this is a different <code>Profile</code>". The old one unmounts (its effects clean up) and a new one mounts with <code>useState("")</code> again. This is the idiomatic way to reset <i>all</i> state of a subtree when an identity (user, document, product) changes; no effect that watches <code>userId</code> and clears fields is needed. Note: the key is not a prop; <code>Profile</code> cannot read it.</p>`
        },
        {
          t: "The bug: defining a component inside a component",
          lang: "tsx",
          code: `// src/InnerComponentBug.tsx
import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  // BUG: a brand-new function (= a new component TYPE) on every render
  function SearchBox() {
    return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
  }

  return (
    <div>
      <SearchBox />
      <p>Searching for: {query}</p>
    </div>
  );
}

// ---------------------------------------------------------------
// FIX: declare it at module level and pass what it needs as props
type SearchBoxProps = { value: string; onChange: (v: string) => void };

export function SearchBoxFixed({ value, onChange }: SearchBoxProps) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}

export function SearchPageFixed() {
  const [query, setQuery] = useState("");
  return (
    <div>
      <SearchBoxFixed value={query} onChange={setQuery} />
      <p>Searching for: {query}</p>
    </div>
  );
}`,
          out: `Buggy version: type one letter -> the input loses focus after every keystroke
Fixed version: typing works normally`,
          note: `<p>Each keystroke sets state, <code>SearchPage</code> re-renders, and <code>SearchBox</code> is a new function object. React compares <code>type</code> by reference: <code>oldSearchBox !== newSearchBox</code>, so it unmounts the old input (destroying focus) and mounts a new one. The same happens with any state inside the inner component: it resets every render. Calling a helper as a plain function, <code>{renderSearchBox()}</code>, does not have this problem because no component boundary is created, but a top-level component is clearer.</p>`
        },
        {
          t: "Impure render: mutating something outside the component",
          lang: "tsx",
          code: `// src/ImpureDemo.tsx
// BUG: render mutates a module-level variable
let guest = 0;

function CupBuggy() {
  guest = guest + 1;              // side effect during render
  return <h3>Tea cup for guest #{guest}</h3>;
}

export function TeaSetBuggy() {
  return (<><CupBuggy /><CupBuggy /><CupBuggy /></>);
}

// FIX: the value is an input (prop), so render is a pure function of it
function Cup({ guest }: { guest: number }) {
  return <h3>Tea cup for guest #{guest}</h3>;
}

export function TeaSet() {
  return (<><Cup guest={1} /><Cup guest={2} /><Cup guest={3} /></>);
}`,
          out: `Buggy, StrictMode on (dev): guest #2, #4, #6 (each component is called twice)
Buggy, after any re-render: the numbers keep growing
Fixed: guest #1, #2, #3 every time`,
          note: `<p>StrictMode's double render did not cause the bug; it <b>revealed</b> it. In production, React can also call a component more than once (an interrupted concurrent render is discarded and restarted), so impure renders produce real, intermittent bugs. Local mutation is fine: building an array with <code>push</code> inside the render, from data created in that render, is pure from the outside.</p>`
        },
        {
          t: "In a router app: same route, new id, same component instance",
          lang: "tsx",
          code: `// npm install react-router
// src/routes/ProductEditorRoute.tsx
import { useState } from "react";
import { useParams } from "react-router";

function ProductEditor({ productId }: { productId: string }) {
  // Local, unsaved edits for one product
  const [note, setNote] = useState("");
  return (
    <form>
      <h2>Editing product {productId}</h2>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} />
    </form>
  );
}

// Route config: { path: "/products/:id", element: <ProductEditorRoute /> }
export default function ProductEditorRoute() {
  const { id } = useParams();
  if (!id) return null;
  // Navigating /products/1 -> /products/2 renders the SAME route element at the
  // same position, so without a key React would keep the editor and its state.
  return <ProductEditor key={id} productId={id} />;
}`,
          out: `Without key: type a note on /products/1, click a link to /products/2 -> the note is still there
With key={id}: the editor remounts with an empty note for product 2`,
          note: `<p>This is the single most common identity bug in real apps. React Router (like any router) reuses the route's component when only a param changes; that is the right default for performance, and the key is how you opt into "a different entity means different state". Day 8 covers routing in depth.</p>`
        }
      ],
      internals: `<p><b>Elements are descriptions.</b> JSX compiles (via the automatic runtime, Day 1) to calls like <code>jsx(Counter, { fancy: true })</code>, which return an immutable object with <code>$$typeof</code>, <code>type</code>, <code>key</code> and <code>props</code> (in React 19, <code>ref</code> is read from props). Elements are cheap and thrown away each render. They are not instances and hold no state.</p>
<p><b>Fibers are the instances.</b> For each mounted component or host element, React keeps a <b>fiber</b>: a mutable object recording its type, key, props, the DOM node (for host components), links to parent/child/sibling fibers, and, for function components, <code>memoizedState</code>: the linked list of hooks in call order. That list is where your <code>useState</code> values actually live. "State is tied to a position" really means "state is stored on a fiber, and React decides whether to reuse that fiber by matching type and key at that position".</p>
<p><b>Two trees.</b> React keeps the <i>current</i> fiber tree (what is on screen) and builds a <i>work-in-progress</i> tree during render, reusing (cloning) fibers it can keep. When a component renders, React reconciles its returned children against the current fiber's children: for a single child it compares <code>key</code> then <code>type</code>; for arrays it walks in order and, as soon as keys stop matching, falls back to a map keyed by <code>key</code> (or index) so items can be moved. A match reuses the fiber (state kept); a mismatch marks the old fiber for <b>deletion</b> and creates a new one (state lost). Unchanged subtrees can be skipped entirely: if a fiber has no pending update, its props object is the same reference as before and no context it reads changed, React "bails out" and reuses the existing child fibers without calling the component. That is why the <code>children</code> example above works.</p>
<p><b>Flags and commit.</b> During render, fibers are tagged with flags such as Placement (insert), Update (props changed: React has already computed the changed DOM properties) and ChildDeletion. The commit phase walks the tree and applies those flags to the DOM in one synchronous pass, then swaps the work-in-progress tree to become <i>current</i>. Only the commit touches the DOM, and the render phase never does, which is why the render phase can be interrupted and retried without visible tearing. In React 18+ <b>concurrent</b> renders (transitions, Suspense) the render phase can yield to the browser between units of work; the commit never yields. Lanes, priorities and the scheduler are Day 12's topic.</p>
<p><b>StrictMode extras</b> (development only): double-invoking component bodies, <code>useState</code>/<code>useMemo</code>/<code>useReducer</code> initialisers and reducers, and mounting each component, unmounting it and mounting it again to check effects clean up properly. None of this happens in a production build.</p>`,
      prod: `<p><b>Where this shows up in a React + FastAPI product:</b></p>
<ul class="pts">
<li><b>Entity switches keep stale state.</b> <code>/orders/:id</code> → <code>/orders/:id2</code>, a side panel showing the "selected customer", a chat window per conversation: all reuse the same component at the same position. Symptoms: half-filled forms, open dropdowns and scroll positions carried to the wrong record; worse, a <code>PATCH /api/orders/41</code> sent with edits made while looking at order 42's heading. Fix: <code>key={entityId}</code> on the editor boundary, and keep server data in a cache keyed by id (TanStack Query, Day 7) rather than in local state.</li>
<li><b>Inline component definitions in tables and lists.</b> Defining <code>const Cell = () =&gt; …</code> inside a table component, or creating a styled component inside render, remounts every cell on each render: inputs lose focus, row-level state resets, and performance collapses on large tables. Lint for it; code review for it. (Passing a render function that you <i>call</i>, like <code>renderCell(row)</code>, is fine.)</li>
<li><b>State too high in the tree.</b> A search box whose state lives in <code>App</code> re-renders the whole page on every keystroke. Usually still fast, because React only renders, it doesn't rebuild the DOM, but in large dashboards it shows up as typing lag (poor INP). The first fix is structural: move state down to where it's used, or pass slow content as <code>children</code>. Memoisation is the second tool (Day 11).</li>
<li><b>Impure renders in production.</b> Generating IDs with <code>Math.random()</code> during render (use <code>useId</code>), reading <code>Date.now()</code> to decide what to show without storing it, logging analytics events from the render body (they double-fire, or fire on renders that never committed). Analytics and API calls go in event handlers or effects.</li>
<li><b>Debugging.</b> React DevTools: "Highlight updates when components render" shows which components re-render; the Profiler (with "Record why each component rendered while profiling" enabled) tells you whether a render was caused by state, props, a parent or a context. If a component <i>remounts</i> unexpectedly, look for a changing key (for example <code>key={Math.random()}</code> or <code>key={index}</code> on a re-ordered list), a changing wrapper type, or a component defined inside another.</li>
</ul>
<p><b>Scale consideration:</b> because identity drives state, it is also part of your <b>component API design</b>. A component library that changes its internal wrapper (<code>div</code> → <code>Fragment</code>) between minor versions can reset consumers' nested state. Treat structural changes around stateful children as potentially breaking.</p>`,
      iq: [
        ["fresher", "What are the three steps React goes through to update the screen?", `<p><b>Trigger</b> (initial render or a state update is queued), <b>render</b> (React calls your components and compares the returned elements with the previous tree) and <b>commit</b> (React applies the minimal DOM changes, attaches refs, runs layout effects; then the browser paints and <code>useEffect</code> runs). The tempting wrong answer is "render means updating the DOM": rendering is only calling your functions; the DOM is touched only in commit, and only where something changed.</p>`],
        ["fresher", "Does a child component re-render when its props change?", `<p>The precise answer: a child re-renders <b>when its parent re-renders</b> (by default, regardless of whether its props changed), when its own state changes, or when a context it reads changes. Props changing is not a trigger by itself; props can only change <i>because</i> the parent rendered. So "re-renders only when props change" is wrong in both directions: unchanged props still re-render, and a mutated props object without a parent render does nothing. Only <code>React.memo</code> (or the React Compiler) makes a component skip rendering when props are shallow-equal.</p>`],
        ["fresher", "Why must a component's render be pure?", `<p>React may call a component many times, in any order relative to siblings, and may discard renders it started (concurrent rendering, Suspense). If rendering has side effects (mutating outside variables, fetching, logging analytics), those effects happen an unpredictable number of times, including for UI that never reached the screen. Pure render also enables skipping work (memo, the Compiler) and StrictMode's double-call checks in development. Side effects go in event handlers or effects.</p>`],
        ["mid", "When is a component's state preserved and when is it reset?", `<p>State is attached to a position in the render tree. It is <b>preserved</b> while the same component type is rendered at the same position (with the same key). It is <b>reset</b> when the type at that position changes, when any ancestor at that position changes type (e.g. <code>div</code> → <code>section</code>), when the component is removed, or when its <code>key</code> changes. The common misconception is that state belongs to the JSX line in your source; React only sees the returned tree, so <code>{cond ? &lt;A x /&gt; : &lt;A y /&gt;}</code> keeps state while <code>{cond &amp;&amp; &lt;A /&gt;}{!cond &amp;&amp; &lt;A /&gt;}</code> resets it.</p>`],
        ["mid", "How do you reset a component's state when, say, the selected user changes?", `<p>Give it a key derived from the identity: <code>&lt;Profile key={userId} user={user} /&gt;</code>. A new key makes React unmount the old instance and mount a fresh one, resetting every piece of state in the subtree and re-running effects. The tempting alternative, a <code>useEffect</code> that watches <code>userId</code> and calls several <code>setX("")</code>, is worse: it renders once with stale state first (a visible flash), it's easy to miss a field, and it's an effect for something that isn't synchronising with an external system. If you only need to adjust <i>one</i> value, you can also compute it during render or store the previous prop and adjust during render, but the key is the clean default.</p>`],
        ["mid", "An input loses focus after every keystroke. What's the likely cause?", `<p>Almost always the input lives in a component that is <b>defined inside another component</b> (or created dynamically during render), so its type is a new function on each render and React remounts it, destroying the DOM input and its focus. Other causes: a key that changes every render (<code>key={Math.random()}</code>, or a key including the input's own value), or a conditional that swaps the wrapper element type. Fix by moving the component to module scope and passing data as props, and by using stable keys.</p>`],
        ["mid", "If a parent re-renders 100 times, does React touch the DOM 100 times?", `<p>No. Each render produces new element objects, but React only commits the differences. If the output is identical, the commit makes no DOM changes. If one text value changed, only that text node is updated. Additionally, multiple <code>setState</code> calls in the same event are batched into one render. Re-renders cost JavaScript time (calling components and diffing), not DOM time, which is why they are usually cheap and why "prevent all re-renders" is the wrong goal.</p>`],
        ["senior", "Explain how React decides whether to reuse a fiber during reconciliation, and why it doesn't do a full tree diff.", `<p>For each child position React compares the new element with the existing fiber: if the <code>key</code> matches and the <code>type</code> is identical (by reference for components, string for host elements) the fiber is reused and receives the new props; otherwise the old fiber (and its subtree) is deleted and a new one created. For arrays React first walks in order, then builds a map of remaining old children by key (or index) so keyed items can move. A general minimal tree edit distance is roughly O(n³); React's two heuristics (different types produce different trees; keys identify children) make it O(n) and are almost always right for UIs. The cost is that you must express identity correctly: unstable keys or changing wrapper types cause remounts the algorithm won't "see through".</p>`],
        ["senior", "Why does passing content as children sometimes prevent re-renders, even without memo?", `<p>When a stateful wrapper re-renders, its <code>children</code> prop still holds the element objects created by <i>its</i> parent, which did not re-render. React sees a fiber whose new props object is the same reference as before, with no pending updates and no changed context, and bails out without calling that component. So restructuring <code>&lt;Wrapper&gt;&lt;Slow /&gt;&lt;/Wrapper&gt;</code> (state in Wrapper) instead of rendering <code>&lt;Slow /&gt;</code> inside the stateful component gives memo-like behaviour for free. The wrong mental model is "memo is the only way to skip children".</p>`],
        ["lead", "How would you set team conventions to prevent identity-related bugs in a large codebase?", `<p>(1) Lint: <code>eslint-plugin-react-hooks</code> plus a rule against nested component definitions (e.g. <code>react/no-unstable-nested-components</code> from <code>eslint-plugin-react</code>) and against array-index keys on dynamic lists. (2) Convention: any component that holds local state about a server entity is keyed by that entity's id at its boundary (route elements, side panels, modals). (3) Keep server data in a query cache keyed by id, not copied into local state. (4) Treat changes to the wrapper structure around stateful children in shared components as breaking. (5) Review checklist and a DevTools "highlight updates" pass on key screens. The point is to make identity explicit, not something people rediscover per bug.</p>`],
        ["architect", "Why is the render/commit split important for concurrent rendering, and what does it demand of application code?", `<p>Because render produces only a description and touches no shared mutable state, React can start rendering an update, yield to the browser for urgent input, abandon or restart that work, and commit only a consistent, complete tree. The commit is synchronous so users never see a half-applied UI. This only holds if application code respects the contract: pure renders, idempotent initialisers and reducers, side effects only in handlers/effects, and external mutable stores read via <code>useSyncExternalStore</code> to avoid tearing. Violations show up as intermittent, hard-to-reproduce bugs once transitions and Suspense are in use, which is why StrictMode's checks are worth keeping on in development. Day 12 goes into the mechanics.</p>`]
      ],
      gotchas: [
        `<b>Every component in the returned subtree re-renders</b> when a parent renders, including components that take no props. Rendering a child is not proof that something changed; check DevTools before optimising.`,
        `<b><code>false</code>, <code>null</code> and <code>undefined</code> still occupy a child slot.</b> <code>{a &amp;&amp; &lt;X /&gt;}{!a &amp;&amp; &lt;X /&gt;}</code> is two slots, so toggling resets <code>X</code>; a single ternary is one slot and preserves it.`,
        `<b>Keys are only compared among siblings.</b> They don't have to be globally unique, and a key does not let React preserve state when a component moves to a different parent.`,
        `<b>Setting state to the same value</b> (by <code>Object.is</code>) bails out, but mutating an object and setting the same reference also bails out, so the UI doesn't update (<code>user.tags.push(x); setUser(user)</code>). Always create a new object (Day 3).`,
        `<b>Wrapping a stateful child in a new element</b> (adding a <code>&lt;div&gt;</code> for styling, switching a <code>&lt;Fragment&gt;</code> for a <code>&lt;div&gt;</code> in one branch) changes the tree above it and resets its state.`,
        `<b>A key is not a prop.</b> The child can't read <code>props.key</code>; pass the id separately if the child needs it (<code>&lt;Row key={id} id={id} /&gt;</code>).`,
        `<b>Unmounting destroys state,</b> including scroll position inside, uncontrolled input values and running timers' owners. If you need to hide a stateful panel temporarily and keep its state, keep it mounted and hide it with CSS, or lift the state up. React 19.2 adds an <code>&lt;Activity&gt;</code> component aimed at this; check the version you're on before relying on it.`,
        `<b>Higher-order components called during render</b> (<code>const Enhanced = withAuth(Page)</code> inside a component) create a new type every render, with the same remount bug as nested component definitions. Call HOCs at module scope.`
      ],
      best: [
        `Declare every component at module top level; never inside another component, hook or loop.`,
        `Use <code>key={entityId}</code> at the boundary of anything that holds local state about one entity (editors, detail panels, chat windows, route elements with params) to reset on purpose.`,
        `Keep renders pure: compute from props/state, no side effects; put side effects in event handlers first, effects second. Keep <code>&lt;StrictMode&gt;</code> on in development.`,
        `Keep state as low in the tree as possible and pass slow, independent content as <code>children</code>; reach for <code>memo</code> only after measuring (Day 11).`,
        `When a component unexpectedly resets, check in order: a changing key, a changing wrapper type, a nested component definition, a conditional that moves it between slots.`,
        `Use React DevTools "Highlight updates" and the Profiler's "why did this render" rather than guessing about re-renders.`
      ],
      lab: [
        `In your Vite app, create <code>src/RenderDemo.tsx</code> from the first example, render it from <code>App</code>, and open the console. Click both buttons and confirm which components log and when the "same value" click logs nothing.`,
        `Install React DevTools in your browser, enable "Highlight updates when components render", and watch which boxes flash when you click. Then inspect the DOM in the Elements panel and confirm only the button's text node changes.`,
        `Build the <code>Counter</code>/<code>fancy</code> demo, increment, toggle and confirm state is kept. Then change the ternary to the <code>div</code>/<code>section</code> version and to the two <code>&amp;&amp;</code> slots version, and predict before each toggle whether the count survives.`,
        `Build the <code>UserBrowser</code> + <code>Profile</code> example. First remove <code>key={user.id}</code>, type a draft, switch users and observe the leaked draft. Put the key back and confirm the reset.`,
        `Write the buggy <code>SearchPage</code> with an inner <code>SearchBox</code>; type and observe focus loss. Move <code>SearchBox</code> to module scope and pass props.`,
        `<b>Done when:</b> you can predict, for any of the toggles above, whether state survives before you click, and you can explain the result in terms of type, position and key.`
      ],
      teach: `<p>"React updates the screen in three steps. <b>Trigger</b>: something sets state. <b>Render</b>: React calls your components to get a description of the UI, and compares it with the last one. <b>Commit</b>: it changes only the bits of the DOM that differ. Rendering is just calling functions, so it's cheap, and it must be pure: no side effects in the component body.</p>
<p>A component re-renders when its own state changes, when its parent renders, or when a context it uses changes. Not 'when its props change': props only change because the parent rendered, and children render with their parent by default.</p>
<p>The key idea is <b>identity</b>. State isn't inside your function; React stores it at a position in its tree. Same component type in the same spot means same state. Different type, a different wrapper, or a different <code>key</code> means unmount and start fresh. So I use <code>key={userId}</code> when I <i>want</i> to reset a form for a new user, and I never define a component inside another component, because then it's a new type every render and it remounts on every keystroke."</p>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: "d4-state-structure",
      title: "Structuring state: lifting state, derived values and useReducer",
      lv: ["fresher", "mid", "senior", "lead", "architect"],
      eli5: `<p>Imagine a family whiteboard in the kitchen with the shopping list. If Mum keeps a list on her phone, Dad keeps one in his notebook, and the kids write on the whiteboard, sooner or later the lists disagree and nobody knows which is right. The fix is <b>one list in one place</b> that everyone reads from and writes to. In React that is "lifting state up" to a shared parent: a <b>single source of truth</b>.</p>
<p>Also, don't write down things you can work out. If the list says "eggs, milk, bread", you don't also write "3 items": you can count. If you do write it, someday someone adds butter and forgets to change the 3. In React that's <b>derived state</b>: compute it, don't store it.</p>
<p>And when the rules for changing the list get complicated ("if we already have milk, increase the amount; if the amount hits zero, cross it off"), you put the rules on a card next to the whiteboard so everyone follows the same ones. That card is a <b>reducer</b>: people just say what happened ("we bought milk"), and the card decides how the list changes.</p>`,
      what: `<p>Once you know how state works (Day 3) and where it lives (the render tree, earlier today), the next skill is <b>deciding what state to have and where to put it</b>. Most React bugs that aren't identity bugs are state-shape bugs: two values that disagree, a copy that went stale, a flag that contradicts another flag.</p>
<h5>Five principles for state shape</h5>
<ul class="pts">
<li><b>Group related state.</b> If two values always change together (x and y of a pointer, page and pageSize), keep them in one object so you can't update one and forget the other.</li>
<li><b>Avoid contradictions.</b> <code>isLoading</code>, <code>isError</code> and <code>isSuccess</code> as three booleans allow 8 combinations, most of them impossible ("loading and error"). Use one <code>status: "idle" | "loading" | "error" | "success"</code> field, ideally as a TypeScript discriminated union that carries only the data valid in each state.</li>
<li><b>Avoid redundant (derived) state.</b> If a value can be computed from props or other state during render (<code>fullName</code> from first/last name, a filtered list from items + filter, a total from cart lines), compute it. Storing it means keeping it in sync forever, and the usual way people sync it, a <code>useEffect</code>, renders once with the stale value and then again.</li>
<li><b>Avoid duplication.</b> Don't store the same entity twice (a <code>selectedProduct</code> object <i>and</i> the <code>products</code> array that contains it): after editing one, the other is stale. Store the <code>selectedId</code> and look the object up during render.</li>
<li><b>Avoid deep nesting; normalise.</b> Deeply nested state is painful to update immutably (you copy every level). For trees or relational data, store a flat map by id with child id arrays: <code>{ byId: Record&lt;number, Node&gt;, rootIds: number[] }</code>. Same idea as normalising tables in PostgreSQL.</li>
</ul>
<p>The test for each piece of state: <i>Is it constant over time? Is it passed in as a prop? Can I compute it from other state or props?</i> If any answer is yes, it isn't state.</p>
<h5>Lifting state up and a single source of truth</h5>
<p>When two components need the same changing data (a search box and the table it filters), the state must live in their <b>closest common parent</b>. The parent passes the value down and passes a callback down so children can request changes. Each piece of state has exactly one owner; everyone else receives it via props. This is "one-way data flow": data down, events up. If the shared data is needed far away, lifting it high can lead to prop drilling; Day 6 covers context and state libraries for that.</p>
<h5>Controlled vs uncontrolled components (as a design choice)</h5>
<p>Day 3 used these words for inputs. The same idea applies to <b>your own components</b>: a component is <b>uncontrolled</b> if it owns its state internally (a <code>Panel</code> with its own <code>isOpen</code>), and <b>controlled</b> if the parent owns the state and passes it in with a change callback (<code>isOpen</code> + <code>onToggle</code> props). Uncontrolled is easier to use but the parent can't coordinate it ("only one panel open at a time", "reset all filters"). Controlled is maximally flexible but needs more wiring. Lifting state up is precisely converting a child from uncontrolled to controlled. Libraries often support both (<code>value</code>/<code>defaultValue</code>); Day 10 covers that API pattern.</p>
<h5>useReducer: consolidating update logic</h5>
<p><code>const [state, dispatch] = useReducer(reducer, initialState)</code> keeps state like <code>useState</code>, but instead of calling setters with new values you <b>dispatch actions</b> describing <i>what happened</i> (<code>{ type: "added", product }</code>), and a <b>reducer</b>, <code>(state, action) =&gt; nextState</code>, decides <i>how state changes</i>. Rules:</p>
<ul class="pts">
<li><b>Reducers must be pure:</b> no mutation of <code>state</code> (return a new object), no fetch, no timers, no <code>Math.random()</code>/<code>Date.now()</code> (pass such values in the action). StrictMode calls reducers twice in development to catch impurity.</li>
<li><b>Name actions after events, not setters:</b> <code>"qtyChanged"</code>, <code>"checkedOut"</code> rather than <code>"setItems"</code>. This keeps the "how" in one place.</li>
<li><b>Type actions as a discriminated union</b> in TypeScript, switch on <code>action.type</code>, and add a <code>default</code> case assigning to <code>never</code> so adding an action without handling it is a compile error.</li>
<li><b><code>dispatch</code> has a stable identity</b> across renders, so it is safe to pass down or omit from effect dependencies.</li>
<li><b>Lazy init:</b> <code>useReducer(reducer, arg, init)</code> calls <code>init(arg)</code> once on mount (e.g. to read <code>localStorage</code>).</li>
</ul>
<p><b>Choose <code>useReducer</code></b> when several values change together in response to the same events, when many event handlers modify state in related ways, when the next state depends on the previous one with non-trivial rules, or when you want to unit-test the logic as a plain function. <b>Stay with <code>useState</code></b> for independent, simple values (an open flag, an input's text). They are equivalent in power; it's a readability choice, and you can mix them in one component.</p>
<h5>The "copy props into state" anti-pattern</h5>
<p><code>const [color, setColor] = useState(props.color)</code> only reads <code>props.color</code> on the first render; later prop changes are ignored, so the component silently shows stale data. Either use the prop directly (it's not state), or, if you really want an editable copy seeded once, name the prop <code>initialColor</code>/<code>defaultColor</code> to make that explicit, and use a <code>key</code> to reset the copy when the identity changes.</p>`,
      why: `<p>A component's state is the part of your program that changes over time, and changing things are where bugs live. Every extra piece of state is another thing that can be wrong, and every duplicated or derived value is a synchronisation obligation you must honour in every handler, forever. Teams that store "a filtered list" and "a total" and "the selected object" end up writing effects to keep them in sync, which add renders, flicker and race conditions.</p>
<p>Before React encouraged one-way data flow, UIs (jQuery, two-way-bound frameworks) often kept the same value in several widgets and in a model, synchronised by events firing in all directions. When something displayed the wrong value it was very hard to tell <i>who</i> had changed it. React's answer is structural: every piece of state has one owner, data flows down, change requests flow up as callbacks, and anything computable is computed. That makes the UI a function of a small, well-defined state, which is easy to reason about, test and debug.</p>
<p><code>useReducer</code> exists because as components grow, update logic spreads across many handlers ("add to cart" in three places, each with slightly different rules). Pulling it into a pure reducer puts all transitions in one function you can read top to bottom and test without rendering anything. It's the same idea as Redux (Day 6), scoped to one component.</p>`,
      diagram: {
        html: lanes([["FilterableProductTable (owner)", ["state: filterText", "state: inStockOnly", "state: load status + products", "derives: visibleProducts"]], ["SearchBar (controlled)", ["props: filterText, inStockOnly", "props: onFilterTextChange, onInStockOnlyChange", "no state of its own"]], ["ProductTable (pure)", ["props: products (already filtered)", "groups rows by category", "no state of its own"]]]) +
          flow([["User types \"app\"", "input onChange", "w"], ["onFilterTextChange(\"app\")", "callback up to owner", ""], ["setFilterText", "owner state changes", ""], ["Owner re-renders", "derives the filtered list", ""], ["Props flow down", "SearchBar shows \"app\", table shows matches", "g"]]),
        steps: [
          `<b>Identify the state:</b> the product list from FastAPI, the filter text and the "in stock only" checkbox. The filtered list is <i>not</i> state: it can be computed from the other three.`,
          `<b>Find the owner:</b> both <code>SearchBar</code> (shows the filter) and <code>ProductTable</code> (uses it) need the filter, so it lives in their closest common parent, <code>FilterableProductTable</code>.`,
          `<b>Data flows down:</b> the owner passes <code>filterText</code> to <code>SearchBar</code> as a value and passes the derived <code>visibleProducts</code> to <code>ProductTable</code>.`,
          `<b>Events flow up:</b> <code>SearchBar</code> calls <code>onFilterTextChange</code>; the owner updates its state; React re-renders the owner and its children with consistent values. There is one source of truth, so the box and the table can never disagree.`
        ]
      },
      ex: [
        {
          t: "Derived state: compute it, don't store and sync it",
          lang: "tsx",
          code: `// src/NameForm.tsx
import { useEffect, useState } from "react";

// BAD: fullName is redundant state kept in sync by an effect
export function NameFormBad() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    setFullName(\`\${first} \${last}\`.trim()); // extra render, one frame of stale UI
  }, [first, last]);

  return (
    <>
      <input value={first} onChange={(e) => setFirst(e.target.value)} />
      <input value={last} onChange={(e) => setLast(e.target.value)} />
      <p>Hello, {fullName}</p>
    </>
  );
}

// GOOD: computed during render, always correct, no extra render
export function NameForm() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const fullName = \`\${first} \${last}\`.trim();

  return (
    <>
      <input value={first} onChange={(e) => setFirst(e.target.value)} />
      <input value={last} onChange={(e) => setLast(e.target.value)} />
      <p>Hello, {fullName}</p>
    </>
  );
}`,
          note: `<p>The bad version renders twice per keystroke: first with the old <code>fullName</code> (committed to the screen), then again after the effect. With more derived values the effects start chaining. If a computation is genuinely expensive, wrap it in <code>useMemo</code> (Day 11), which is still derived, still not state.</p>`
        },
        {
          t: "Contradictions and duplication: one status union, store the id not the object",
          lang: "tsx",
          code: `// src/state-shapes.ts
type Product = { id: number; name: string; price: number };

// BAD: 3 booleans = 8 combinations, most impossible
type RequestBad = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: Product[];
  error?: string;
};

// GOOD: only valid states are representable
export type Request =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; products: Product[] };

// BAD: duplication. selected is a COPY of an element of products.
// After editing products[3].price, selected.price is stale.
type SelectionBad = { products: Product[]; selected: Product | null };

// GOOD: store the id; look the object up during render
export type Selection = { products: Product[]; selectedId: number | null };

export function selectedProduct(s: Selection): Product | undefined {
  return s.products.find((p) => p.id === s.selectedId);
}

// Usage in a component:
// const view = request.status === "success" ? request.products : [];
// TypeScript only lets you read .products after narrowing on status.
export type { RequestBad, SelectionBad };`,
          note: `<p>Discriminated unions turn "impossible states" into type errors. In JSX you narrow with <code>if (req.status === "error") return &lt;p&gt;{req.message}&lt;/p&gt;</code>; TypeScript knows <code>message</code> exists only in that branch.</p>`
        },
        {
          t: "The FastAPI endpoint behind the product list",
          lang: "py",
          code: `# backend/app/routers/products.py   (Python, FastAPI + Pydantic v2)
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/products", tags=["products"])

class ProductOut(BaseModel):
    id: int
    name: str
    category: str
    price: float
    in_stock: bool

@router.get("", response_model=list[ProductOut])
async def list_products() -> list[ProductOut]:
    # In the full stack: check Redis first, fall back to PostgreSQL, cache the result.
    return [
        ProductOut(id=1, name="Apple", category="Fruits", price=0.5, in_stock=True),
        ProductOut(id=2, name="Dragonfruit", category="Fruits", price=2.0, in_stock=True),
        ProductOut(id=3, name="Passionfruit", category="Fruits", price=1.2, in_stock=False),
        ProductOut(id=4, name="Spinach", category="Vegetables", price=1.8, in_stock=True),
        ProductOut(id=5, name="Pumpkin", category="Vegetables", price=3.5, in_stock=False),
    ]`,
          out: `GET /api/products ->
[{"id":1,"name":"Apple","category":"Fruits","price":0.5,"in_stock":true}, ...]`,
          note: `<p>For a small catalogue, filtering on the client is fine and instant. For thousands of rows you'd send the filter to the server (<code>GET /api/products?q=app&amp;in_stock=true</code>) and the filter state would naturally move into the URL (Day 8) and a query key (Day 7). The TypeScript type below mirrors the snake_case JSON exactly; mapping to camelCase is a separate decision.</p>`
        },
        {
          t: "Lifting state up: a filterable product list backed by FastAPI",
          lang: "tsx",
          code: `// src/products/FilterableProductTable.tsx
// Assumes a Vite dev proxy (server.proxy in vite.config.ts) forwards /api to FastAPI on :8000.
import { useEffect, useState } from "react";

export type Product = { id: number; name: string; category: string; price: number; in_stock: boolean };

type Load =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; products: Product[] };

// ---- Controlled child: no state, value + callbacks from the owner
type SearchBarProps = {
  filterText: string;
  inStockOnly: boolean;
  onFilterTextChange: (text: string) => void;
  onInStockOnlyChange: (value: boolean) => void;
};

function SearchBar({ filterText, inStockOnly, onFilterTextChange, onInStockOnlyChange }: SearchBarProps) {
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()}>
      <input
        type="search"
        aria-label="Filter products"
        placeholder="Search..."
        value={filterText}
        onChange={(e) => onFilterTextChange(e.target.value)}
      />
      <label>
        <input type="checkbox" checked={inStockOnly} onChange={(e) => onInStockOnlyChange(e.target.checked)} />
        Only show products in stock
      </label>
    </form>
  );
}

// ---- Pure child: renders what it is given
function ProductTable({ products }: { products: Product[] }) {
  if (products.length === 0) return <p>No products match.</p>;
  const categories = [...new Set(products.map((p) => p.category))];
  return (
    <table>
      <thead><tr><th>Name</th><th>Price</th></tr></thead>
      {categories.map((category) => (
        <tbody key={category}>
          <tr><th colSpan={2}>{category}</th></tr>
          {products.filter((p) => p.category === category).map((p) => (
            <tr key={p.id}>
              <td style={{ color: p.in_stock ? undefined : "crimson" }}>{p.name}</td>
              <td>\${p.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}

// ---- The owner: single source of truth for the filter and the data
export default function FilterableProductTable() {
  const [filterText, setFilterText] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [load, setLoad] = useState<Load>({ status: "loading" });

  // Minimal fetch; Day 5 explains effects and Day 7 replaces this with TanStack Query.
  useEffect(() => {
    let ignore = false;
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json() as Promise<Product[]>;
      })
      .then((products) => { if (!ignore) setLoad({ status: "success", products }); })
      .catch((err: unknown) => {
        if (!ignore) setLoad({ status: "error", message: err instanceof Error ? err.message : String(err) });
      });
    return () => { ignore = true; };
  }, []);

  if (load.status === "loading") return <p>Loading products...</p>;
  if (load.status === "error") return <p role="alert">Could not load products: {load.message}</p>;

  // Derived during render: never stored in state
  const q = filterText.trim().toLowerCase();
  const visibleProducts = load.products.filter(
    (p) => (!inStockOnly || p.in_stock) && p.name.toLowerCase().includes(q),
  );

  return (
    <div>
      <SearchBar
        filterText={filterText}
        inStockOnly={inStockOnly}
        onFilterTextChange={setFilterText}
        onInStockOnlyChange={setInStockOnly}
      />
      <ProductTable products={visibleProducts} />
      <p>{visibleProducts.length} of {load.products.length} products</p>
    </div>
  );
}`,
          out: `Type "fruit"  -> Dragonfruit, Passionfruit (Fruits)
Tick in stock -> Dragonfruit only
"1 of 5 products"`,
          note: `<p>Notice the <code>\$</code> before <code>{p.price…}</code>: in JSX text that is a literal dollar sign followed by an expression, not a template literal. The design decisions: the filter lives in the owner because two children need it; <code>visibleProducts</code> and the count are derived; the load state is a union so "loading with products" can't exist; the children hold no state, which makes them trivial to test and reuse. The early returns come <i>after</i> all hooks are called, as the rules of hooks require.</p>`
        },
        {
          t: "Controlled vs uncontrolled versions of your own component",
          lang: "tsx",
          code: `// src/Accordion.tsx
import { useState, type ReactNode } from "react";

// UNCONTROLLED: each panel owns its open state. Easy to use, but the parent
// cannot enforce "only one open at a time".
export function PanelUncontrolled({ title, children }: { title: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <section>
      <button aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>{title}</button>
      {isOpen && <div>{children}</div>}
    </section>
  );
}

// CONTROLLED: the parent owns the state and passes it in.
type PanelProps = { title: string; isOpen: boolean; onToggle: () => void; children: ReactNode };

export function Panel({ title, isOpen, onToggle, children }: PanelProps) {
  return (
    <section>
      <button aria-expanded={isOpen} onClick={onToggle}>{title}</button>
      {isOpen && <div>{children}</div>}
    </section>
  );
}

export default function ProductFaq() {
  // One number instead of N booleans: "only one open" is now impossible to violate
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items = [
    { title: "Shipping", body: "We ship within 2 working days." },
    { title: "Returns", body: "Return within 30 days for a refund." },
    { title: "Warranty", body: "Two years on all electronics." },
  ];
  return (
    <>
      {items.map((item, i) => (
        <Panel
          key={item.title}
          title={item.title}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        >
          {item.body}
        </Panel>
      ))}
    </>
  );
}`,
          note: `<p>Moving <code>isOpen</code> out of <code>Panel</code> into the parent <i>is</i> lifting state up. The parent's state shape also applies the "avoid contradictions" principle: a single <code>openIndex</code> instead of an array of booleans means two panels can never be open at once.</p>`
        },
        {
          t: "useReducer with a typed discriminated-union action",
          lang: "ts",
          code: `// src/cart/cartReducer.ts
export type CartLine = { productId: number; name: string; price: number; qty: number };
export type CartState = { lines: CartLine[]; coupon: string | null };

export type CartAction =
  | { type: "added"; product: { id: number; name: string; price: number } }
  | { type: "qtyChanged"; productId: number; qty: number }
  | { type: "removed"; productId: number }
  | { type: "couponApplied"; code: string }
  | { type: "cleared" };

export const emptyCart: CartState = { lines: [], coupon: null };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "added": {
      const exists = state.lines.some((l) => l.productId === action.product.id);
      if (exists) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.productId === action.product.id ? { ...l, qty: l.qty + 1 } : l,
          ),
        };
      }
      const { id, name, price } = action.product;
      return { ...state, lines: [...state.lines, { productId: id, name, price, qty: 1 }] };
    }
    case "qtyChanged": {
      if (action.qty <= 0) {
        return { ...state, lines: state.lines.filter((l) => l.productId !== action.productId) };
      }
      return {
        ...state,
        lines: state.lines.map((l) => (l.productId === action.productId ? { ...l, qty: action.qty } : l)),
      };
    }
    case "removed":
      return { ...state, lines: state.lines.filter((l) => l.productId !== action.productId) };
    case "couponApplied":
      return { ...state, coupon: action.code.trim().toUpperCase() || null };
    case "cleared":
      return emptyCart;
    default: {
      // If a new action type is added to CartAction and not handled, this line fails to compile.
      const unhandled: never = action;
      throw new Error(\`Unhandled action: \${JSON.stringify(unhandled)}\`);
    }
  }
}`,
          note: `<p>Inside each <code>case</code>, TypeScript narrows <code>action</code> so <code>action.product</code> only exists in <code>"added"</code>. Every branch returns a <b>new</b> object and copies only what changed; untouched lines keep their identity (useful for <code>memo</code> later). Braces around <code>case</code> bodies scope the <code>const</code>s.</p>`
        },
        {
          t: "Using the reducer in a component (derived totals, stable dispatch, lazy init)",
          lang: "tsx",
          code: `// src/cart/Cart.tsx
import { useReducer } from "react";
import { cartReducer, emptyCart, type CartState } from "./cartReducer";

function loadCart(storageKey: string): CartState {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as CartState) : emptyCart;
  } catch {
    return emptyCart;
  }
}

const CATALOGUE = [
  { id: 1, name: "Apple", price: 0.5 },
  { id: 4, name: "Spinach", price: 1.8 },
];

export default function Cart() {
  // init function runs once on mount: loadCart("cart")
  const [cart, dispatch] = useReducer(cartReducer, "cart", loadCart);

  // Derived, not stored
  const itemCount = cart.lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = cart.lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const discount = cart.coupon === "SAVE10" ? subtotal * 0.1 : 0;

  return (
    <div>
      {CATALOGUE.map((p) => (
        <button key={p.id} onClick={() => dispatch({ type: "added", product: p })}>
          Add {p.name}
        </button>
      ))}
      <ul>
        {cart.lines.map((l) => (
          <li key={l.productId}>
            {l.name}{" "}
            <input
              type="number"
              min={0}
              aria-label={\`Quantity of \${l.name}\`}
              value={l.qty}
              onChange={(e) => dispatch({ type: "qtyChanged", productId: l.productId, qty: Number(e.target.value) })}
            />
            <button onClick={() => dispatch({ type: "removed", productId: l.productId })}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={() => dispatch({ type: "couponApplied", code: "save10" })}>Apply SAVE10</button>
      <p>{itemCount} items, total {(subtotal - discount).toFixed(2)}</p>
      <button onClick={() => dispatch({ type: "cleared" })}>Clear</button>
    </div>
  );
}`,
          out: `Add Apple, Add Apple, Add Spinach -> "3 items, total 2.80"
Apply SAVE10                      -> "3 items, total 2.52"`,
          note: `<p>Saving the cart back to <code>localStorage</code> is a side effect and does not belong in the reducer; it goes in an effect (Day 5) or, for a logged-in user, a <code>PUT /api/cart</code> mutation (Day 7). With React 19's type definitions, let TypeScript infer <code>useReducer</code>'s types from the typed reducer rather than passing explicit generic arguments; the generic signature changed from React 18's types.</p>`
        },
        {
          t: "Reducers are plain functions: unit-test them with Vitest",
          lang: "ts",
          code: `// src/cart/cartReducer.test.ts   (npm install -D vitest)
import { describe, expect, it } from "vitest";
import { cartReducer, emptyCart } from "./cartReducer";

const apple = { id: 1, name: "Apple", price: 0.5 };

describe("cartReducer", () => {
  it("adds a new line, then increments it", () => {
    const s1 = cartReducer(emptyCart, { type: "added", product: apple });
    const s2 = cartReducer(s1, { type: "added", product: apple });
    expect(s2.lines).toEqual([{ productId: 1, name: "Apple", price: 0.5, qty: 2 }]);
  });

  it("removes a line when qty goes to 0", () => {
    const s1 = cartReducer(emptyCart, { type: "added", product: apple });
    const s2 = cartReducer(s1, { type: "qtyChanged", productId: 1, qty: 0 });
    expect(s2.lines).toHaveLength(0);
  });

  it("never mutates the previous state", () => {
    const before = cartReducer(emptyCart, { type: "added", product: apple });
    const frozen = structuredClone(before);
    cartReducer(before, { type: "added", product: apple });
    expect(before).toEqual(frozen);
  });
});`,
          out: `npx vitest run
 ✓ src/cart/cartReducer.test.ts (3 tests)`,
          note: `<p>No rendering, no DOM, no mocks: one of the biggest practical benefits of moving logic into a reducer. Day 14 covers component tests with React Testing Library.</p>`
        },
        {
          t: "Anti-pattern: copying props into state (and the three fixes)",
          lang: "tsx",
          code: `// src/PriceTag.tsx
import { useState } from "react";

// BUG: price is read once, on mount. When the parent passes a new price
// (e.g. after a refetch from /api/products), this keeps showing the old one.
export function PriceTagBad({ price }: { price: number }) {
  const [shown] = useState(price);
  return <span>{shown.toFixed(2)}</span>;
}

// FIX 1: it isn't state at all; use the prop (and derive from it)
export function PriceTag({ price, currency }: { price: number; currency: string }) {
  const label = new Intl.NumberFormat("en", { style: "currency", currency }).format(price);
  return <span>{label}</span>;
}

// FIX 2: you WANT an editable copy seeded once: say so in the prop name
export function PriceEditor({ initialPrice, onSave }: { initialPrice: number; onSave: (p: number) => void }) {
  const [draft, setDraft] = useState(String(initialPrice));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(Number(draft)); }}>
      <input inputMode="decimal" value={draft} onChange={(e) => setDraft(e.target.value)} />
      <button>Save</button>
    </form>
  );
}

// FIX 3: reset that copy when the entity changes, with a key at the call site:
//   <PriceEditor key={product.id} initialPrice={product.price} onSave={save} />`,
          note: `<p>The "initial" prefix documents that later changes are intentionally ignored. Avoid the tempting fourth "fix", a <code>useEffect(() =&gt; setDraft(String(price)), [price])</code>: it renders stale first and it also wipes the user's edits whenever the parent re-fetches.</p>`
        },
        {
          t: "Normalising nested state: a category tree stored flat",
          lang: "ts",
          code: `// src/categories/state.ts
// Nested (hard to update: deleting a deep node means copying every ancestor)
type CategoryNested = { id: number; title: string; children: CategoryNested[] };

// Normalised: a flat map by id, children referenced by id
export type Category = { id: number; title: string; childIds: number[] };
export type CategoryState = { byId: Record<number, Category>; rootIds: number[] };

export function removeCategory(state: CategoryState, parentId: number | null, id: number): CategoryState {
  // 1. collect the id and all its descendants
  const toDelete: number[] = [];
  const stack = [id];
  while (stack.length > 0) {
    const current = stack.pop()!;
    toDelete.push(current);
    stack.push(...(state.byId[current]?.childIds ?? []));
  }
  // 2. copy only what changes: the map (minus deleted ids) and one parent
  const byId = { ...state.byId };
  for (const d of toDelete) delete byId[d];
  if (parentId === null) {
    return { byId, rootIds: state.rootIds.filter((r) => r !== id) };
  }
  const parent = byId[parentId];
  byId[parentId] = { ...parent, childIds: parent.childIds.filter((c) => c !== id) };
  return { byId, rootIds: state.rootIds };
}

export type { CategoryNested };`,
          note: `<p><code>delete</code> on <code>byId</code> is fine because it's a <i>new</i> object created in this function (local mutation). This is the same shape a FastAPI endpoint returning rows with <code>parent_id</code> from PostgreSQL maps to naturally, and it's what Redux Toolkit's <code>createEntityAdapter</code> produces (Day 6).</p>`
        }
      ],
      internals: `<p><b><code>useState</code> is <code>useReducer</code>.</b> Internally, <code>useState</code> is implemented as a reducer hook with a built-in reducer that does roughly <code>(state, action) =&gt; typeof action === "function" ? action(state) : action</code>. Both store a hook object on the component's fiber (in the <code>memoizedState</code> linked list) holding the current state and an <b>update queue</b>. Calling <code>setX</code> or <code>dispatch</code> appends an update to that queue and schedules a render; it does not run your reducer immediately in the general case.</p>
<p><b>When the reducer runs.</b> During the next render, when your component calls <code>useReducer</code> again, React processes the queued actions in order through the reducer passed <i>in that render</i>, producing the new state. That's why a reducer must be pure: it can run during render, more than once in StrictMode, and (with concurrent rendering and priority lanes) the same queue may be re-processed if a render is interrupted. For <code>useState</code> React can sometimes compute the next value eagerly at the time of the call, to bail out early when it's identical; that optimisation is an implementation detail.</p>
<p><b>Bail-out.</b> If the computed next state is <code>Object.is</code>-equal to the current state, React skips re-rendering that component's children. This is why a reducer that mutates and returns the same <code>state</code> object appears to "do nothing": the change happened, but React sees the same reference. It's also why "return <code>state</code> unchanged for unknown/no-op actions" is an effective optimisation.</p>
<p><b><code>dispatch</code> and setters are stable</b>: React creates them once when the hook mounts and returns the same function every render, so they never need to be in dependency arrays and passing them to memoised children doesn't break memoisation.</p>
<p><b>Lifting state up, mechanically.</b> Moving state to a parent changes which fiber holds the hook, and therefore which subtree re-renders on change: the owner and everything below it. That is the cost side of lifting: the higher the state, the bigger the render. Deriving instead of storing has no such cost at the fiber level: a derived value is just a local variable recomputed each render, with no hook slot, no update queue and no extra commit.</p>`,
      prod: `<p><b>How this plays out in a React + FastAPI app:</b></p>
<ul class="pts">
<li><b>Server state vs client state.</b> The biggest state-design decision in production: data that comes from FastAPI (products, orders, the current user) is <i>server state</i>, a cache of something PostgreSQL owns. Copying it into <code>useState</code>/<code>useReducer</code> creates exactly the duplication problem from today: it goes stale on refetch, and two screens hold two copies. In real apps it lives in TanStack Query (Day 7), keyed by URL/params; component state holds only UI state (open panels, drafts, selected id).</li>
<li><b>Filters belong in the URL</b> once users expect to share or bookmark them: <code>/products?q=app&amp;in_stock=1</code>. The URL becomes the single source of truth, read with <code>useSearchParams</code> (Day 8), and the same params become the TanStack Query key and FastAPI query parameters. Lifting state up "past the component tree" into the URL is a common evolution of the filterable table.</li>
<li><b>Status unions mirror API contracts.</b> Model request and entity states as unions (<code>"draft" | "submitted" | "approved"</code>) that match the backend's Pydantic enums; generate the TS types from FastAPI's OpenAPI schema (e.g. with <code>openapi-typescript</code>) so the frontend can't drift from the backend.</li>
<li><b>Reducers for multi-step flows.</b> Checkout wizards, multi-field editors with undo, and complex forms (when not using React Hook Form, Day 9) benefit from a reducer: all transitions in one tested function, and actions you can log to Sentry breadcrumbs when a user reports "it got into a weird state".</li>
<li><b>What goes wrong at scale:</b> state lifted to <code>App</code> "just in case" (every keystroke re-renders the app); <code>useEffect</code> chains that keep derived state in sync (cascading renders, flicker); editable copies of server data with no key (stale edits saved to the wrong record); one giant reducer for the whole page that every team edits (split by feature, or move to a store with slices, Day 6).</li>
</ul>`,
      iq: [
        ["fresher", "What does \"lifting state up\" mean and when do you do it?", `<p>Moving state from a child into the closest common parent of all components that need it, then passing the value down as props and passing callbacks down so children can request changes. You do it when two or more siblings must stay in sync (a search box and the list it filters). The tempting wrong approach, keeping state in each child and syncing them with effects or refs, creates two sources of truth that can disagree.</p>`],
        ["fresher", "What is derived state, and why shouldn't you store it?", `<p>A value that can be computed from props or existing state (a filtered list, a total, a full name). Storing it means every update must remember to update it too, and syncing it with <code>useEffect</code> renders a stale value first and costs an extra render. Compute it during render; if it's expensive, memoise with <code>useMemo</code>, which is still derivation, not state.</p>`],
        ["fresher", "What is the difference between useState and useReducer?", `<p>Both hold state and trigger re-renders. <code>useState</code> gives you a setter you call with the next value (or an updater function). <code>useReducer</code> gives you <code>dispatch</code>; you send an action object and a pure <code>reducer(state, action)</code> computes the next state. Same power, different organisation: <code>useReducer</code> centralises update logic, which helps when many handlers update related state. It isn't "for big state" per se; a single complex field with rules can justify it, and a large set of independent fields may not.</p>`],
        ["mid", "What's wrong with useState(props.initialValue) and useState(props.value)?", `<p>The initial value argument is only used on the first render. With <code>props.value</code> the component ignores later changes to the prop and shows stale data: a mirrored prop. If you only need to display it, use the prop directly. If you need an editable copy seeded once, name it <code>initialValue</code>/<code>defaultValue</code> (making the "ignore updates" behaviour explicit) and reset it by giving the component a <code>key</code> when the identity changes. Syncing with an effect is the tempting but wrong fix: a stale render, and it overwrites user edits on every parent re-render or refetch.</p>`],
        ["mid", "How would you model the state of a data request in TypeScript?", `<p>As a discriminated union: <code>{ status: "loading" } | { status: "error"; message: string } | { status: "success"; data: T }</code>. It makes impossible combinations unrepresentable (loading <i>and</i> error), and TypeScript narrows on <code>status</code> so you can only read <code>data</code> in the success branch. Separate booleans (<code>isLoading</code>, <code>isError</code>) allow contradictory states and force null checks everywhere. In practice TanStack Query gives you this shape (<code>isPending</code>/<code>isError</code>/<code>isSuccess</code> derived from one <code>status</code>, Day 7).</p>`],
        ["mid", "Why must a reducer be pure, and what happens if it mutates state?", `<p>React runs reducers during rendering, possibly more than once (StrictMode in development, retried concurrent renders), so side effects would repeat and results must be deterministic. If it mutates and returns the same object, <code>Object.is(prev, next)</code> is true and React bails out: the UI doesn't update even though the data changed, and other holders of the old reference see it change underneath them. Return new objects; pass non-deterministic values (ids, timestamps) in the action from the event handler.</p>`],
        ["senior", "When would you choose useReducer over useState, and when is it overkill?", `<p>Choose it when several pieces of state change together in response to the same events, when the next state depends on the previous one via non-trivial rules (cart quantities, wizard steps, undo stacks), when many handlers duplicate update logic, or when you want to unit-test transitions as a pure function and log actions. It's overkill for independent simple values (a toggle, an input string) where the reducer becomes a boilerplate wrapper around setters ("setName", "setEmail" actions are a smell). A hybrid is fine. Also note it's local: if many components need it, combine with context (Day 6) or move to a store.</p>`],
        ["senior", "How do you make a reducer's action type exhaustive in TypeScript?", `<p>Define actions as a discriminated union on <code>type</code>, <code>switch (action.type)</code>, and in the <code>default</code> branch assign <code>action</code> to a variable of type <code>never</code>. If someone adds a new variant without a case, <code>action</code> is no longer <code>never</code> there and compilation fails. Throwing at runtime in that branch also protects against untyped dispatches. Returning <code>state</code> in <code>default</code> without the check silently swallows unhandled actions.</p>`],
        ["senior", "Where should the state for a filterable, paginated product list backed by FastAPI live?", `<p>Split by kind. The <b>filter and page</b> are UI state shared by the filter controls and the table, so at minimum they're lifted to the common parent; if users should be able to share, bookmark or go back, they belong in the URL search params as the single source of truth. The <b>products</b> are server state: they belong in a query cache keyed by the filter params (<code>["products", { q, page }]</code>), fetched from <code>GET /api/products?q=&amp;page=</code>, not copied into component state. Visible rows, counts and "has next page" are derived. The tempting wrong design is one component with <code>useState</code> for products, filtered products and page, synced by effects.</p>`],
        ["lead", "How would you review a PR whose component has twelve useState calls and four useEffects that keep them in sync?", `<p>First classify each value: constant, prop, derivable, server state, or genuine UI state. Typically derived values become local variables (and their effects disappear), server data moves to a query hook, contradictory flags collapse into a status union, duplicated objects become ids, and the remaining related UI state either groups into an object or moves into a typed reducer with event-named actions and unit tests. Check where the state lives: lower it if only one subtree uses it, lift it if siblings duplicate it. The result is usually fewer renders, no flicker and testable logic. I'd also add the "you might not need an effect" check (Day 5) to the review checklist.</p>`],
        ["architect", "How do the state-structure principles scale from one component to an application architecture?", `<p>They're the same rules at different radii. Single source of truth: each fact has one owner, which might be a component, the URL, a client store, the server cache or the database. Avoid duplication: the frontend doesn't copy server state into client stores; it caches it with explicit invalidation. Normalise: entity caches keyed by id (like PostgreSQL tables) rather than nested blobs. Avoid contradictions: shared status enums and generated types from the FastAPI OpenAPI schema. Derive rather than store: selectors and computed views rather than denormalised copies. Reducers and event-named actions scale into stores (Redux Toolkit) and audit trails. The architectural job is to assign ownership of each category (UI, URL, client-global, server) and enforce it with tooling and conventions so teams don't reinvent sync logic.</p>`]
      ],
      gotchas: [
        `<b>Early returns must come after all hooks.</b> In the product table, <code>if (load.status === "loading") return …</code> is placed after every hook call; putting it before a <code>useState</code> breaks the rules of hooks (Day 10).`,
        `<b>A reducer that forgets to <code>return</code> in a case</b> falls through to the next case (or returns <code>undefined</code>, wiping state). Use braces per case, lint for fall-through, and the <code>never</code> check.`,
        `<b><code>dispatch</code> doesn't change state immediately.</b> Reading <code>state</code> right after <code>dispatch(…)</code> in the same handler gives the old snapshot, exactly like <code>useState</code> (Day 3). If you need the next value, compute it with <code>reducer(state, action)</code> yourself.`,
        `<b>Lazy init gotcha:</b> <code>useReducer(reducer, loadCart("cart"))</code> calls <code>loadCart</code> on every render (the result is ignored after the first). Use the three-argument form <code>useReducer(reducer, "cart", loadCart)</code>, or <code>useState(() =&gt; …)</code>.`,
        `<b>Normalised maps keyed by number</b> become string keys at runtime (<code>Object.keys</code> returns strings). Use <code>Map</code> or convert when iterating; TypeScript's <code>Record&lt;number, T&gt;</code> hides this.`,
        `<b>Lifting state up widens the re-render.</b> Every keystroke in a lifted filter re-renders the whole owner subtree. Usually fine; if it lags, keep the input's text local and lift only a debounced or submitted value, or use <code>useDeferredValue</code> (Day 12).`,
        `<b>Storing a selected object instead of its id</b> goes stale after an edit or a refetch, and can point at an item that was deleted. Store <code>selectedId</code> and look it up; handle "not found".`,
        `<b>Generic arguments to <code>useReducer</code>:</b> code written for React 18's type definitions (<code>useReducer&lt;Reducer&lt;S, A&gt;&gt;(…)</code>) may not compile with React 19's <code>@types/react</code>, whose generics changed. Let inference work from a typed reducer function.`
      ],
      best: [
        `For each candidate state ask: constant? a prop? computable? server data? Only what's left is component state.`,
        `Model mutually exclusive states as a <code>status</code> discriminated union; never as several booleans.`,
        `Store ids, not copies of objects; normalise trees and relational data into <code>byId</code> maps.`,
        `Put shared state in the closest common parent, pass value + callback down, keep children stateless when possible; move it into the URL when users should be able to share it.`,
        `Use <code>useReducer</code> with event-named, typed actions and an exhaustive <code>never</code> check for related, rule-heavy updates; unit-test the reducer.`,
        `Never mirror props in state; use the prop, or name it <code>initialX</code> and reset with a <code>key</code>.`,
        `Keep server data in a query cache (Day 7), not in <code>useState</code>.`
      ],
      lab: [
        `In your FastAPI backend, add the <code>GET /api/products</code> route from the example; in <code>vite.config.ts</code> add <code>server: { proxy: { "/api": "http://localhost:8000" } }</code> and restart Vite. Check <code>http://localhost:5173/api/products</code> returns JSON.`,
        `Build <code>FilterableProductTable</code>. First write it "wrong" on purpose: give <code>SearchBar</code> its own <code>filterText</code> state and notice the table can't see it. Then lift the state into the owner and pass value + callbacks.`,
        `Add a "results: X of Y" line. Implement it first with <code>useState</code> + <code>useEffect</code>, add a <code>console.log</code> in render, and count the renders per keystroke. Replace it with a derived variable and count again.`,
        `Implement <code>cartReducer</code> with the discriminated-union actions, then add a new action <code>{ type: "decremented"; productId: number }</code> to the union <i>without</i> handling it and confirm <code>tsc</code> (or your editor) reports the <code>never</code> error. Handle it.`,
        `Write the three Vitest tests for the reducer and run <code>npx vitest run</code>. Then deliberately change the <code>"added"</code> case to <code>push</code> into <code>state.lines</code> and watch the "never mutates" test fail.`,
        `<b>Done when:</b> the filter box and table never disagree, the count is derived (one render per keystroke), the cart reducer is exhaustive and its tests pass.`
      ],
      teach: `<p>"Before writing <code>useState</code>, I ask what the state really is. If it's constant, it's not state. If it comes from a prop, it's not state. If I can compute it from other state, like a filtered list or a total, I compute it during render. If it comes from the server, it goes in a query cache. What's left is real UI state.</p>
<p>Then I shape it: related values grouped together, one <code>status</code> union instead of contradicting booleans, ids instead of copies of objects, flat maps instead of deep trees. And I never copy a prop into state: it'll go stale.</p>
<p>Where does it live? In the closest common parent of everything that needs it. That parent passes the value down and a callback down; children are controlled. One source of truth, so the search box and the table can't disagree.</p>
<p>When the update rules get complicated, I use <code>useReducer</code>: handlers dispatch actions that describe what happened, and one pure, typed, tested reducer decides the next state. In TypeScript the actions are a discriminated union with a <code>never</code> check, so a new action can't be forgotten."</p>`
    }
  ],
  quiz: [
    {
      q: `The user increments the counter to 5, then ticks the checkbox. What does the counter show?`,
      code: `function App() {
  const [isPaused, setIsPaused] = useState(false);
  return (
    <div>
      {isPaused ? <p>See you later!</p> : <Counter />}
      <label>
        <input type="checkbox" checked={isPaused} onChange={(e) => setIsPaused(e.target.checked)} />
        Take a break
      </label>
    </div>
  );
}
// Then the user unticks the checkbox again.`,
      lang: "tsx",
      ans: `While paused, there is no counter. After unticking, the counter shows 0.`,
      why: `At the first child slot of the <code>div</code>, the type changes from <code>Counter</code> to <code>p</code>, so React unmounts <code>Counter</code> and destroys its state. Unticking mounts a brand-new <code>Counter</code> with its initial state. To keep the count, either keep <code>Counter</code> mounted (hide it with CSS) or lift the count into <code>App</code>.`
    },
    {
      q: `Clicking a contact in the sidebar shows their chat. A user types a message to Alice, then clicks Bob, and the half-typed message to Alice appears in Bob's box. Find the bug and give the idiomatic fix.`,
      code: `function Messenger() {
  const [to, setTo] = useState(contacts[0]);
  return (
    <div>
      <ContactList contacts={contacts} onSelect={setTo} />
      <Chat contact={to} />
    </div>
  );
}

function Chat({ contact }: { contact: Contact }) {
  const [text, setText] = useState("");
  return <textarea value={text} placeholder={"Chat to " + contact.name} onChange={(e) => setText(e.target.value)} />;
}`,
      lang: "tsx",
      ans: `<code>Chat</code> stays at the same position with the same type, so its state is preserved across contacts. Render <code>&lt;Chat key={to.id} contact={to} /&gt;</code>.`,
      why: `React only sees "a <code>Chat</code> in the second slot" before and after the click, so it reuses the instance and only updates the <code>contact</code> prop. A key derived from the contact's id makes each contact a distinct component identity, so switching unmounts the old chat and mounts a fresh one with an empty draft. A <code>useEffect</code> that clears <code>text</code> when <code>contact</code> changes is the tempting alternative but shows the stale text for one render and is more code. (If you <i>wanted</i> per-contact drafts preserved, you'd lift them into a <code>Record&lt;contactId, string&gt;</code> in <code>Messenger</code>.)`
    },
    {
      q: `A colleague wrote this filterable list. Typing works, but they report that the visible list "lags one step behind" in a screen recording and that the component renders twice per keystroke. What would you change?`,
      code: `function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState<Product[]>(products);

  useEffect(() => {
    setVisible(products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())));
  }, [products, query]);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>{visible.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
    </>
  );
}`,
      lang: "tsx",
      ans: `Delete the <code>visible</code> state and the effect; compute <code>const visible = products.filter(…)</code> during render.`,
      why: `<code>visible</code> is derived state. Each keystroke first renders and commits with the old <code>visible</code> (the "one step behind" frame), then the effect runs after paint, sets state, and triggers a second render. Computing it during render is always in sync, renders once and is less code. If filtering were genuinely expensive, wrap it in <code>useMemo(() =&gt; …, [products, query])</code>, still derived, not state.`
    },
    {
      q: `Clicking "Add" a second time for the same product does nothing on screen, although a <code>console.log(state)</code> inside the reducer shows the quantity increasing. Why?`,
      code: `function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "added": {
      const line = state.lines.find((l) => l.productId === action.product.id);
      if (line) {
        line.qty += 1;
        return state;
      }
      return { ...state, lines: [...state.lines, { productId: action.product.id, name: action.product.name, price: action.product.price, qty: 1 }] };
    }
    default:
      return state;
  }
}`,
      lang: "ts",
      ans: `The reducer mutates the existing line and returns the same <code>state</code> object, so React sees no change and bails out.`,
      why: `React compares the reducer's return value with the current state using <code>Object.is</code>. Same reference → no re-render. The mutation also corrupts the previous state (and in StrictMode the doubled reducer call adds 2 to the mutated object). Fix: return a new state with a new <code>lines</code> array and a new object for the changed line: <code>{ ...state, lines: state.lines.map(l =&gt; l.productId === id ? { ...l, qty: l.qty + 1 } : l) }</code>. The first add worked only because that branch already created new objects. Also note the <code>default: return state</code> hides unhandled actions; an exhaustive <code>never</code> check would catch them at compile time.`
    },
    {
      q: `Every time the user types a character in the email field, the field loses focus. Why, and how do you fix it?`,
      code: `function SignupForm() {
  const [email, setEmail] = useState("");

  const Field = ({ label }: { label: string }) => (
    <label>
      {label}
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
    </label>
  );

  return <form><Field label="Email" /></form>;
}`,
      lang: "tsx",
      ans: `<code>Field</code> is a new component type on every render, so React unmounts and remounts it (and its <code>&lt;input&gt;</code>) on every keystroke.`,
      why: `Setting <code>email</code> re-renders <code>SignupForm</code>, which creates a new <code>Field</code> arrow function. React compares element types by reference; a different function is a different type, so the old subtree is destroyed (the DOM input, with focus, is removed) and a new one inserted. Move <code>Field</code> to module scope and pass <code>value</code> and <code>onChange</code> as props.`
    },
    {
      q: `<code>PriceBadge</code> is rendered inside a product page. After the admin changes a price and the page refetches <code>/api/products/7</code>, the heading shows the new price but the badge still shows the old one. What's wrong?`,
      code: `function PriceBadge({ price }: { price: number }) {
  const [amount] = useState(price);
  return <span className="badge">\${amount.toFixed(2)}</span>;
}`,
      lang: "tsx",
      ans: `The prop is copied into state; <code>useState(price)</code> only uses <code>price</code> on the first render.`,
      why: `On later renders React returns the stored <code>amount</code> and ignores the new argument, so the badge is stuck at the mount-time price. There's no reason for state here: render <code>{price.toFixed(2)}</code> directly. If an editable copy were actually needed, name the prop <code>initialPrice</code> and reset with a <code>key</code>, rather than syncing with an effect.`
    }
  ]
},
/* ===== Day 5 ===== */
{
  n: 5,
  title: "Effects and refs",
  goal: `<b>By the end of today</b> you can use <code>useEffect</code> to keep a component synchronised with something outside React (a WebSocket to FastAPI, a window event, the document title, a chart library), predict exactly when setup and cleanup run, explain the StrictMode double run, and recognise the effects you should delete. You can also use <code>useRef</code> for values that must survive renders without causing them, reach into the DOM to focus, scroll and measure, pass a <code>ref</code> as a plain prop in React 19, and pick <code>useLayoutEffect</code> when a measurement must happen before the browser paints.`,
  rev: [
    `<b>Effects synchronise, they don't "run on mount".</b> <code>useEffect(setup, deps)</code> runs <code>setup</code> after React commits to the DOM (usually after paint). No array: after every commit. <code>[]</code>: after the first commit only. <code>[a, b]</code>: when any dep differs from last time by <code>Object.is</code>. If <code>setup</code> returns a function, React calls it before the next setup (with the <i>old</i> values) and on unmount.`,
    `<b>StrictMode in development</b> runs every effect setup → cleanup → setup once on mount, to prove your cleanup undoes your setup. Two WebSocket connections in the FastAPI log, or two "mounted" logs, mean the check is working; fix missing cleanup, don't add a "did it run" ref guard. Production runs effects once.`,
    `<b>You might not need an effect:</b> derive values during render instead of copying them into state; put logic caused by a specific user action in the event handler; reset state on identity change with <code>key</code>; compute chains of updates in one handler. Effects are for external systems. Fetching in an effect needs an <code>ignore</code> flag or <code>AbortController</code> (Day 7 goes further, TanStack Query replaces most of it).`,
    `<b>Stale closures:</b> an effect sees the props and state of the render that created it. Listing every reactive value in deps (the <code>react-hooks/exhaustive-deps</code> lint rule) keeps it fresh. Avoid re-running with updater functions (<code>setN(n =&gt; n + 1)</code>), by moving objects/functions inside the effect, or (React 19.2+) <code>useEffectEvent</code> for non-reactive logic.`,
    `<b>Refs:</b> <code>useRef(init)</code> returns the same <code>{ current }</code> box every render; writing it does <b>not</b> re-render. Use it for interval ids, DOM nodes, third-party instances. Don't read or write <code>ref.current</code> during render (only in effects and handlers). React 19 passes <code>ref</code> to function components as a normal prop (<code>forwardRef</code> is legacy); callback refs may return a cleanup; <code>useImperativeHandle</code> exposes a narrow API; <code>useLayoutEffect</code> measures before paint.`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d5-effects",
      title: "Effects with useEffect: synchronising with the outside world",
      lv: ["fresher", "mid", "senior", "lead"],
      eli5: `<p>Imagine a shop window dresser. The shop owner (your component) decides <i>what</i> the window should say today: "Sale on shoes". That decision is pure: it's just a sign on paper. Separately, someone has to go and actually turn on the neon "SALE" light outside, which is wired to the street's power grid that the owner doesn't control.</p>
<p>An <b>effect</b> is that second job. After the window has been rearranged (React has committed the DOM), the effect looks at the plan and makes the outside world match: switch on the right light, subscribe to the right newspaper, open the right phone line. When the plan changes (the sale moves from shoes to hats), the effect first <b>undoes</b> the old arrangement (switches the shoe light off, the <b>cleanup</b>) and then does the new one.</p>
<p>The <b>dependency array</b> is the list of things on the plan that the light depends on. If none of them changed since last time, the dresser doesn't touch the wiring at all. And in development, React's <b>StrictMode</b> is an inspector who, on day one, makes the dresser switch the light on, off, and on again, just to prove the "off" switch actually works.</p>`,
      what: `<p>An <b>effect</b> is code that runs <i>after</i> React has committed a render to the screen, in order to <b>synchronise</b> the component with a system React doesn't manage: a network connection, a browser API, a timer, a non-React widget, the document title, analytics. Rendering must stay pure (Day 4); effects are the sanctioned place for side effects that are caused by <i>rendering itself</i> rather than by a particular user action.</p>
<pre><code>useEffect(setup, dependencies?)</code></pre>
<ul class="pts">
<li><b><code>setup</code></b> is a function that performs the synchronisation. It may return a <b>cleanup</b> function that undoes it. It must not be <code>async</code> itself (an async function returns a Promise, and React expects a cleanup function or nothing); call an async function from inside instead.</li>
<li><b>No dependency array</b>: the effect runs after <i>every</i> commit of this component. Rarely what you want.</li>
<li><b><code>[]</code></b>: runs after the first commit only (plus the StrictMode re-run in development); its cleanup runs on unmount. It means "this effect uses no reactive values", not "componentDidMount". If the lint rule says you use a prop inside, <code>[]</code> is a lie.</li>
<li><b><code>[a, b]</code></b>: after each commit, React compares every dep with its value from the previous render using <code>Object.is</code>. If all are the same, the effect is skipped. If any differs, React runs the <i>previous</i> cleanup, then the new setup.</li>
<li><b><code>Object.is</code></b> is identity for objects, arrays and functions. <code>{}</code> created during render is a new object every render, so an effect depending on it re-runs every render. Primitives compare by value (and <code>Object.is(NaN, NaN)</code> is <code>true</code>, <code>Object.is(0, -0)</code> is <code>false</code>).</li>
</ul>
<p><b>Cleanup timing.</b> Cleanup runs (1) before the effect re-runs because a dep changed, using the props and state <i>from the render that created it</i>, and (2) when the component unmounts. The rule to aim for: <b>setup → cleanup → setup</b> must leave the world in the same state as a single <b>setup</b>. Connect/disconnect, subscribe/unsubscribe, add/remove listener, start/clear timer, create/destroy widget, start/abort request.</p>
<p><b>StrictMode.</b> In development, when <code>&lt;StrictMode&gt;</code> wraps your app (the Vite template does this in <code>main.tsx</code>, Day 1), React mounts each component, immediately simulates an unmount (runs every effect cleanup) and mounts it again (runs every setup). Components also render twice. Nothing of this happens in a production build. Its purpose is to surface missing cleanups now instead of on the user's machine when a route changes or a feature like <code>&lt;Activity&gt;</code> (added in React 19.2) hides and shows a subtree.</p>
<p><b>Think in synchronisation, not lifecycle.</b> Don't ask "what should happen on mount?". Ask "what external thing must match which props/state, and how do I start and stop that?". Each effect should describe <b>one</b> independent synchronisation process. A component that connects to a chat room and logs analytics needs two effects, not one effect with an <code>if</code>.</p>
<p><b>Reactive values and stale closures.</b> Props, state and anything computed from them during render are <i>reactive</i>: they can change between renders. Every effect closure captures the values of the render that created it. If an effect reads <code>roomId</code> but doesn't list it, it keeps talking to the old room: a <b>stale closure</b>. The <code>react-hooks/exhaustive-deps</code> ESLint rule (included in the Vite react-ts template) finds these. Treat its warnings as errors: the deps array is not a choice, it is a description of what the code reads. To make an effect run less often, change the code so it reads fewer reactive values:</p>
<ul class="pts">
<li>Use an <b>updater function</b>: <code>setCount(c =&gt; c + 1)</code> doesn't read <code>count</code>.</li>
<li>Move objects and functions <b>inside</b> the effect, or depend on their primitive fields (<code>options.category</code> instead of <code>options</code>).</li>
<li>Move values that don't depend on props/state <b>outside</b> the component.</li>
<li>Split non-reactive logic out with <b><code>useEffectEvent</code></b> (see below).</li>
</ul>
<p><b>You might not need an effect.</b> The React docs have a whole page with this title, and it is the most common senior-level review comment on React code. If no external system is involved, you probably don't need an effect:</p>
<ul class="pts">
<li><b>Derived values</b>: <code>const fullName = first + ' ' + last</code> during render; not <code>useEffect(() =&gt; setFullName(...), [first, last])</code>, which renders twice and is briefly wrong. If it's expensive, <code>useMemo</code> (Day 11).</li>
<li><b>Event-specific logic</b>: "send a POST when the user clicks Buy" belongs in <code>onClick</code>. An effect that watches <code>purchased</code> state fires again on remount, on StrictMode, on refresh with restored state.</li>
<li><b>Resetting state when a prop changes</b>: render <code>&lt;Profile key={userId} /&gt;</code> so React gives the new user a fresh component instance (Day 4), instead of an effect that clears state after the wrong state has already rendered once.</li>
<li><b>Chains of effects</b>: effect A sets state that triggers effect B that sets state for effect C. Each link is an extra render and a place to be stale. Compute the next state in one event handler or reducer.</li>
<li><b>Notifying a parent</b>: call <code>onChange(next)</code> in the same handler that calls <code>setValue(next)</code>, not in an effect watching <code>value</code>.</li>
<li><b>Subscribing to an external store</b>: prefer <code>useSyncExternalStore</code>, which is built for it and is safe with concurrent rendering.</li>
</ul>
<p><b>Fetching in effects.</b> It works, but you must handle races: responses can arrive out of order when <code>userId</code> changes quickly. Use a local <code>ignore</code> flag set in cleanup, or an <code>AbortController</code> whose <code>abort()</code> is the cleanup. You also get no caching, no deduplication and a request waterfall per nested component. Day 7 covers this in depth and replaces most of it with TanStack Query or framework loaders.</p>
<p><b><code>useEffectEvent</code></b> (stable in React 19.2; before that it was experimental only, so check your installed version) lets you extract a function that always sees the <i>latest</i> props/state but is <i>not</i> reactive: you don't list it in deps and changing what it reads doesn't re-run the effect. Classic case: reconnect when <code>roomId</code> changes, but use the current <code>theme</code> to style a "connected" toast without reconnecting when the theme changes. Only call the returned function from inside effects, never during render or pass it to other components.</p>
<p><b><code>useEffect</code> vs <code>useLayoutEffect</code>.</b> Both run after React has mutated the DOM. <code>useLayoutEffect</code> runs synchronously <i>before the browser paints</i>, so you can measure layout and set state without the user seeing an intermediate frame; it blocks painting, so keep it short. <code>useEffect</code> normally runs after paint, so it doesn't delay the frame. (React may flush passive effects earlier, for example after a discrete input like a click, but you must not rely on that.) Default to <code>useEffect</code>; the refs topic below shows when layout effects are right. A third variant, <code>useInsertionEffect</code>, exists for CSS-in-JS libraries to inject styles and is not for application code.</p>`,
      why: `<p>React's core contract is <code>UI = f(state)</code>: render is a pure calculation that React may call more than once, pause, or throw away. That's what makes concurrent rendering, StrictMode checks and the React Compiler possible. But real apps must talk to things that are not pure: open a WebSocket to FastAPI, start a timer, set <code>document.title</code>, create a Leaflet map. Doing that during render would open a socket every time React <i>thinks</i> about the UI, including renders that are never committed.</p>
<p>Before hooks, class components split this across <code>componentDidMount</code>, <code>componentDidUpdate</code> and <code>componentWillUnmount</code>. One concern (the chat connection) was smeared across three methods, and the most common bug was forgetting <code>componentDidUpdate</code>: the component connected to room 1 on mount, the user switched to room 2, and it stayed connected to room 1. Unrelated concerns (connection + analytics + title) were mixed inside the same methods.</p>
<p><code>useEffect</code> fixes both: one effect = one synchronisation process, with setup and cleanup next to each other, and the dependency array makes "re-sync when this changes" the default instead of something you remember to write. The trade-off is that effects are easy to overuse; a lot of code written in 2019-2021 used them for data transformation and event handling, which is why the React docs now push hard on "you might not need an effect".</p>`,
      diagram: {
        html: flow([
          ["Trigger", "setState / new props", "w"],
          ["Render", "pure: call component, compute JSX", ""],
          ["Commit", "mutate DOM, attach refs", ""],
          ["Layout effects", "cleanup old, run new (before paint)", "w"],
          ["Paint", "browser draws the frame", "g"],
          ["Passive effects", "useEffect: cleanup prev deps, then setup", "g"]
        ]),
        steps: [
          `Something triggers a render: a state update, new props from a parent, or the initial <code>root.render()</code>.`,
          `React calls your component. It returns JSX and registers each <code>useEffect</code> call (setup function + deps) on the component's fiber. Nothing runs yet.`,
          `In the commit phase React applies DOM changes and attaches refs, then runs <code>useLayoutEffect</code> cleanups/setups synchronously.`,
          `The browser paints the new frame; the user sees the updated UI.`,
          `React flushes passive effects: for each effect whose deps changed (by <code>Object.is</code>), it runs the previous cleanup (with old values) and then the new setup. On unmount, only cleanups run. In development StrictMode adds one extra cleanup + setup on mount.`
        ]
      },
      ex: [
        {
          t: "The smallest useful effect: keep document.title in sync",
          lang: "tsx",
          code: `import { useEffect, useState } from 'react';

export function Inbox() {
  const [unread, setUnread] = useState(3);

  // document.title is outside React: React only manages the DOM inside #root.
  useEffect(() => {
    document.title = unread > 0 ? \`(\${unread}) Inbox\` : 'Inbox';
  }, [unread]); // re-sync only when unread changes

  return (
    <section>
      <p>{unread} unread</p>
      <button onClick={() => setUnread(u => Math.max(0, u - 1))}>Mark one read</button>
    </section>
  );
}`,
          out: "Tab title: (3) Inbox → click → (2) Inbox → ... → Inbox",
          note: `<p>No cleanup is needed: setting the title again simply overwrites it. Notice what is <i>not</i> in the effect: the label text is derived during render. Only the part that touches a non-React system lives in the effect.</p>`
        },
        {
          t: "The three dependency forms, and the order of setup and cleanup",
          lang: "tsx",
          code: `import { useEffect } from 'react';

export function Probe({ a, b }: { a: number; b: string }) {
  useEffect(() => {
    console.log('A: after every commit');
  }); // no array

  useEffect(() => {
    console.log('B: first commit only');
    return () => console.log('B cleanup: unmount');
  }, []);

  useEffect(() => {
    console.log('C: setup with', a, b);
    return () => console.log('C cleanup with', a, b); // sees the OLD a, b
  }, [a, b]);

  return <p>{a} {b}</p>;
}

// Parent renders <Probe a={1} b="x" />, then <Probe a={2} b="x" />,
// then <Probe a={2} b="x" /> again (same values), then unmounts it.`,
          out: `-- mount (production build) --
A: after every commit
B: first commit only
C: setup with 1 x
-- a: 1 -> 2 --
C cleanup with 1 x
A: after every commit
C: setup with 2 x
-- same props again --
A: after every commit
-- unmount --
B cleanup: unmount
C cleanup with 2 x`,
          note: `<p>Within a commit React runs all the cleanups that are due before any of the new setups, and runs effects in the order they were declared. Effect C was skipped on the third render because <code>Object.is(2, 2)</code> and <code>Object.is('x', 'x')</code> are both true. In development under StrictMode, the mount section is followed by an extra <code>B cleanup</code>, <code>C cleanup with 1 x</code>, then all three setups again.</p>`
        },
        {
          t: "Subscribing to a browser event with cleanup",
          lang: "tsx",
          code: `import { useEffect, useState } from 'react';

export function ConnectionBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    function handleOnline() { setOnline(true); }
    function handleOffline() { setOnline(false); }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      // must remove the SAME function references that were added
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // the handlers only call stable setters, so nothing reactive is read

  if (online) return null;
  return <div role="status">You are offline. Changes will sync when you reconnect.</div>;
}`,
          note: `<p>Without the cleanup, every mount (and every StrictMode re-run) would add another pair of listeners that call <code>setOnline</code> on an unmounted component forever: a leak. State setters from <code>useState</code> are guaranteed stable, so they never need to be deps. For reading an external store like this one, <code>useSyncExternalStore(subscribe, () =&gt; navigator.onLine)</code> is the purpose-built alternative and avoids a render with a stale initial value.</p>`
        },
        {
          t: "A WebSocket to a FastAPI endpoint, re-connecting when the order changes",
          lang: "tsx",
          code: `import { useEffect, useState } from 'react';

type OrderEvent = { orderId: string; status: 'placed' | 'paid' | 'shipped'; at: string };
type ConnState = 'connecting' | 'open' | 'closed';

export function OrderStatusFeed({ orderId }: { orderId: string }) {
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [conn, setConn] = useState<ConnState>('connecting');

  useEffect(() => {
    let active = true; // flips to false in cleanup, so late events from this socket are ignored
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = \`\${proto}://\${window.location.host}/api/ws/orders/\${encodeURIComponent(orderId)}\`;
    const ws = new WebSocket(url);

    ws.onopen = () => { if (active) setConn('open'); };
    ws.onmessage = (e: MessageEvent<string>) => {
      if (!active) return;
      const evt = JSON.parse(e.data) as OrderEvent;
      setEvents(prev => [...prev, evt]); // updater: no need to depend on events
    };
    ws.onclose = () => { if (active) setConn('closed'); };

    return () => {
      active = false;
      ws.close(); // undo exactly what setup did
    };
  }, [orderId]);

  return (
    <section>
      <p>Connection: {conn}</p>
      <ol>{events.map(e => <li key={e.at}>{e.status} at {e.at}</li>)}</ol>
    </section>
  );
}

// Parent: give each order its own instance so events/conn start fresh.
// <OrderStatusFeed key={orderId} orderId={orderId} />`,
          note: `<p>In development with StrictMode the FastAPI log shows connect → disconnect → connect, and the browser console may say the first socket was "closed before the connection is established". That's expected. The <code>active</code> flag matters because the first socket's <code>close</code> event fires asynchronously, possibly after the second socket opened; without the flag it could set <code>conn</code> to <code>'closed'</code> while the live socket is open. Resetting <code>events</code> on order change is done with <code>key</code>, not with <code>setEvents([])</code> inside the effect.</p>`
        },
        {
          t: "The other side: FastAPI endpoint and the Vite dev proxy",
          lang: "py",
          code: `# backend/app/ws.py  (FastAPI; Redis pub/sub fans events out across workers)
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import redis.asyncio as redis

router = APIRouter()
r = redis.from_url("redis://redis:6379")

@router.websocket("/api/ws/orders/{order_id}")
async def order_events(websocket: WebSocket, order_id: str):
    await websocket.accept()
    pubsub = r.pubsub()
    await pubsub.subscribe(f"orders:{order_id}")
    try:
        async for msg in pubsub.listen():
            if msg["type"] == "message":
                await websocket.send_text(msg["data"].decode())
    except WebSocketDisconnect:
        pass
    finally:
        await pubsub.unsubscribe(f"orders:{order_id}")
        await pubsub.aclose()`,
          note: `<p>Every React cleanup has a mirror on the server: when the browser closes the socket, FastAPI must release the Redis subscription. A missing cleanup on either side shows up in production as a slowly growing number of open subscriptions. In the Vite config below, <code>ws: true</code> makes the dev proxy forward WebSocket upgrades so the browser can use a same-origin URL.</p>`
        },
        {
          t: "vite.config.ts: proxy /api (HTTP and WebSocket) to FastAPI in development",
          lang: "ts",
          code: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true, ws: true },
    },
  },
});`
        },
        {
          t: "Fetching in an effect without races: ignore flag and AbortController",
          lang: "tsx",
          code: `import { useEffect, useState } from 'react';

type User = { id: number; name: string; email: string };

async function fetchUser(id: number, signal?: AbortSignal): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`, { signal });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return (await res.json()) as User;
}

// Version 1: ignore flag. The request still completes, its result is dropped.
export function UserName({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    let ignore = false;
    fetchUser(userId).then(u => { if (!ignore) setUser(u); });
    return () => { ignore = true; };
  }, [userId]);
  return <span>{user?.name ?? '…'}</span>;
}

// Version 2: AbortController. The browser cancels the request too.
export function UserCard({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchUser(userId, controller.signal)
      .then(setUser)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return; // expected on cleanup
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => controller.abort();
  }, [userId]);

  if (error) return <p role="alert">{error}</p>;
  if (!user) return <p>Loading…</p>;
  return <p>{user.name} ({user.email})</p>;
}`,
          note: `<p>Without either guard: user clicks user 1, then user 2; the request for user 1 is slow and lands last, so the card shows user 2's id with user 1's name. Note this still shows the <i>previous</i> user while the next loads (render <code>key={userId}</code> to reset), has no cache, and runs twice in StrictMode development. Day 7 deals with all of that.</p>`
        },
        {
          t: "Stale closure: the counter that sticks at 1",
          lang: "tsx",
          code: `import { useEffect, useState } from 'react';

export function BrokenTicker() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setCount(count + 1); // 'count' is the 0 captured by the first render, forever
    }, 1000);
    return () => window.clearInterval(id);
  }, []); // eslint: React Hook useEffect has a missing dependency: 'count'
  return <p>{count}</p>;
}

export function Ticker() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setCount(c => c + 1); // reads the latest state from React, not from the closure
    }, 1000);
    return () => window.clearInterval(id);
  }, []); // honest: the effect reads nothing reactive now
  return <p>{count}</p>;
}`,
          out: "BrokenTicker: 0, 1, 1, 1, 1 ...\nTicker:       0, 1, 2, 3, 4 ...",
          note: `<p>"Fixing" the broken version by adding <code>count</code> to deps also works, but it tears down and recreates the interval every second. The updater function removes the dependency instead of hiding it.</p>`
        },
        {
          t: "Object dependency causing an infinite loop, and the fix",
          lang: "tsx",
          code: `import { useEffect, useState } from 'react';

type Product = { id: number; name: string };
declare function searchProducts(q: { category: string; limit: number }): Promise<Product[]>;

export function ProductsBroken({ category }: { category: string }) {
  const [items, setItems] = useState<Product[]>([]);
  const query = { category, limit: 20 }; // NEW object on every render

  useEffect(() => {
    let ignore = false;
    searchProducts(query).then(r => { if (!ignore) setItems(r); });
    return () => { ignore = true; };
  }, [query]); // Object.is(prevQuery, query) is always false
  // render -> effect -> fetch -> setItems(new array) -> render -> new query -> effect -> ...

  return <ul>{items.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}

export function Products({ category }: { category: string }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    let ignore = false;
    const query = { category, limit: 20 }; // created inside: not a dependency
    searchProducts(query).then(r => { if (!ignore) setItems(r); });
    return () => { ignore = true; };
  }, [category]); // a primitive: re-runs only when the category really changes

  return <ul>{items.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}`,
          note: `<p>(<code>declare function</code> stands in for your API module.) The same happens with a function defined in the component body and listed as a dep. Options, in order of preference: create it inside the effect; depend on its primitive fields; hoist it outside the component if it doesn't use props/state; as a last resort memoise it with <code>useMemo</code>/<code>useCallback</code> (Day 11). The lint rule warns about this exact pattern ("The 'query' object makes the dependencies of useEffect change on every render").</p>`
        },
        {
          t: "You might not need an effect: four rewrites",
          lang: "tsx",
          code: `import { useState } from 'react';

type Todo = { id: number; text: string; done: boolean };

// 1. Derived value: compute during render.
export function TodoList({ todos, showDone }: { todos: Todo[]; showDone: boolean }) {
  // BAD: const [visible, setVisible] = useState<Todo[]>([]);
  //      useEffect(() => setVisible(todos.filter(...)), [todos, showDone]);
  const visible = showDone ? todos : todos.filter(t => !t.done);
  return <ul>{visible.map(t => <li key={t.id}>{t.text}</li>)}</ul>;
}

// 2. Event-specific logic: do it in the handler that caused it.
export function BuyButton({ productId }: { productId: number }) {
  // BAD: const [bought, setBought] = useState(false);
  //      useEffect(() => { if (bought) fetch('/api/orders', ...) }, [bought]);
  async function handleBuy() {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
  }
  return <button onClick={handleBuy}>Buy</button>;
}

// 3. Reset all state when identity changes: use key in the parent.
function CommentBox({ postId }: { postId: number }) {
  // BAD: useEffect(() => setDraft(''), [postId]);  (renders the old draft once first)
  const [draft, setDraft] = useState('');
  return <textarea aria-label={\`Comment on post \${postId}\`} value={draft} onChange={e => setDraft(e.target.value)} />;
}
export function PostPage({ postId }: { postId: number }) {
  return <CommentBox key={postId} postId={postId} />;
}

// 4. Chain of effects -> one handler computes everything.
export function Quiz({ total }: { total: number }) {
  const [answered, setAnswered] = useState(0);
  const [finished, setFinished] = useState(false);
  // BAD: useEffect(() => { if (answered === total) setFinished(true) }, [answered, total]);
  function handleAnswer() {
    const next = answered + 1;
    setAnswered(next);
    if (next === total) setFinished(true); // same event, same render batch
  }
  return finished ? <p>Done!</p> : <button onClick={handleAnswer}>Answer ({answered}/{total})</button>;
}`,
          note: `<p>Each BAD version renders twice per change (once with stale derived state, once corrected), and the purchase one even fires a POST when the component remounts with <code>bought</code> restored. In #4, <code>finished</code> could itself be derived (<code>answered === total</code>); it's kept as state only to show the handler pattern.</p>`
        },
        {
          t: "useEffectEvent: read the latest value without re-running the effect (React 19.2+)",
          lang: "tsx",
          code: `import { useEffect, useEffectEvent } from 'react';

type Theme = 'light' | 'dark';

function showToast(message: string, theme: Theme) {
  console.log(\`[toast:\${theme}] \${message}\`);
}

export function ChatRoom({ roomId, theme }: { roomId: string; theme: Theme }) {
  // Not reactive: always sees the latest theme, never causes a reconnect.
  const onConnected = useEffectEvent(() => {
    showToast(\`Connected to \${roomId}\`, theme);
  });

  useEffect(() => {
    const ws = new WebSocket(\`ws://\${window.location.host}/api/ws/rooms/\${roomId}\`);
    ws.onopen = () => onConnected();
    return () => ws.close();
  }, [roomId]); // theme is NOT a dependency, and onConnected must not be listed

  return <h2>#{roomId}</h2>;
}`,
          out: "Switching theme: no reconnect.  Switching room: reconnect, toast uses current theme.",
          note: `<p><code>useEffectEvent</code> is exported from <code>react</code> starting with React 19.2; in older versions the import fails. You also need an <code>eslint-plugin-react-hooks</code> version that knows about it, otherwise the lint rule may ask you to add <code>onConnected</code> to deps. Before it existed people used a "latest ref" (<code>ref.current = theme</code> in an effect), shown in the refs topic.</p>`
        }
      ],
      internals: `<p><b>Effects are data attached to the fiber.</b> Each component instance is a fiber (Day 12 goes deep). Its hooks form a linked list in call order, stored on <code>fiber.memoizedState</code>; that's why hooks can't be called conditionally. A <code>useEffect</code> call creates (on mount) or updates (on re-render) an <i>effect object</i> roughly shaped like <code>{ tag, create, deps, inst: { destroy }, next }</code>, and these objects are also linked into a circular list on the fiber's <code>updateQueue</code>. <code>tag</code> combines a kind flag (passive for <code>useEffect</code>, layout for <code>useLayoutEffect</code>, insertion for <code>useInsertionEffect</code>) and a <code>HasEffect</code> flag meaning "this one must fire in this commit".</p>
<p><b>Deps comparison happens during render.</b> On re-render, React compares the new deps array with the stored one, element by element, using <code>Object.is</code> (an internal function called <code>areHookInputsEqual</code>). If equal, it pushes the effect without <code>HasEffect</code>, so the commit skips it. If not, it sets <code>HasEffect</code> and marks the fiber with a <code>Passive</code> flag. No deps array means the comparison is skipped and <code>HasEffect</code> is always set. Mismatched array lengths produce a development warning.</p>
<p><b>Commit phase ordering.</b> After render, React commits in sub-phases: <i>before mutation</i> (e.g. snapshotting), <i>mutation</i> (DOM inserts/updates/deletions; layout effect cleanups; ref detaching), <i>layout</i> (ref attaching, <code>useLayoutEffect</code> setups), all synchronously. Passive effects are then scheduled as a separate task via React's scheduler, which typically lets the browser paint first. When they flush, React walks the tree and runs <b>all</b> passive cleanups that are due, then <b>all</b> passive setups, children before parents (a parent's effect can rely on its children's effects having run). Before React starts any new render it flushes pending passive effects, so effects from one commit never interleave with the next render.</p>
<p><b>Unmount.</b> When a fiber is deleted, React runs its effect cleanups (layout ones during mutation, passive ones in the passive flush) using the <code>destroy</code> function that the last setup returned. That function closes over the values of the render that created it, which is why cleanup "sees old props".</p>
<p><b>StrictMode double invoke.</b> In development, for a newly mounted tree inside <code>&lt;StrictMode&gt;</code>, React runs the normal mount, then deliberately calls the unmount logic for layout and passive effects on those fibers and then the mount logic again (internally a "double invoke effects in DEV" pass). Components are also rendered twice to flush out impure render code; in React 19 the second render reuses <code>useMemo</code>/<code>useCallback</code> results from the first. Production builds strip all of this.</p>
<p><b><code>useEffectEvent</code></b> returns a function whose identity you don't rely on (don't put it in deps); React updates the implementation it points at during the commit, so it reads the latest committed props and state when an effect calls it. Calling it during render is not allowed (React reports an error in development; check your version for the exact behaviour).</p>`,
      prod: `<p><b>Real-time features over FastAPI.</b> Order tracking, notifications and dashboards are the main legitimate effect users in a React → FastAPI → Redis → PostgreSQL app. Typical production shape: the effect opens one WebSocket (or <code>EventSource</code> for server-sent events) per logical channel, closes it in cleanup, and pushes incoming messages into state or into the TanStack Query cache. Behind it, each Uvicorn worker subscribes to Redis pub/sub so any worker can deliver any event. What goes wrong at scale: no cleanup → every route change leaks a socket, and the server's connection count climbs until the load balancer or worker hits a file-descriptor limit; no reconnect with backoff → a deploy disconnects everyone and they never come back; reconnect without jitter → every client hammers the server at the same second after a deploy (thundering herd). Wrap this in a custom hook (Day 10) so cleanup and backoff are written once.</p>
<p><b>Analytics and side effects that fire twice.</b> "Page viewed" events in an effect fire twice in development and on every remount in production. Teams usually decide: page views tracked by the router (navigation event), clicks tracked in handlers, deduplicated server-side by an event id. Never "fix" the StrictMode double run with a <code>hasRun</code> ref; that only hides the missing idempotency.</p>
<p><b>Effects as a performance smell.</b> Profiling large apps often shows render cascades: effect sets state → re-render → another effect sets state. Each costs a full render and commit, and during the gap the UI shows inconsistent data. Code review rule of thumb used by many teams: every <code>useEffect</code> in a PR must name the external system it synchronises with; if it can't, rewrite it as derived state, a handler, or a <code>key</code>.</p>
<p><b>Data fetching.</b> Hand-written fetch effects in many components lead to duplicate requests for the same <code>/api/users/me</code>, request waterfalls (parent fetches, renders child, child fetches), and no caching, which pushes load onto FastAPI and PostgreSQL that Redis was supposed to absorb. Production apps standardise on TanStack Query or route loaders (Days 7 and 8) and keep raw effects for subscriptions and integrations.</p>
<p><b>Tooling.</b> Keep <code>react-hooks/exhaustive-deps</code> at <code>error</code> in CI. Disabling it with a comment is a code-review flag: the right fix is almost always restructuring. Newer versions of <code>eslint-plugin-react-hooks</code> also ship React Compiler-powered rules (for example, flagging synchronous <code>setState</code> calls at the top of an effect); check the version you install.</p>`,
      iq: [
        ["fresher", "What is the difference between <code>useEffect(fn)</code>, <code>useEffect(fn, [])</code> and <code>useEffect(fn, [a])</code>?", `<p>No array: runs after every commit. <code>[]</code>: runs after the first commit only, cleanup on unmount. <code>[a]</code>: runs after the first commit and after any commit where <code>a</code> changed by <code>Object.is</code>, running the previous cleanup first. The tempting wrong answer is "<code>[]</code> is componentDidMount": it's actually a claim that the effect reads no reactive values; if it does, it's a stale-closure bug, and in development StrictMode runs it twice anyway.</p>`],
        ["fresher", "When does the cleanup function of an effect run?", `<p>Before the effect runs again because its deps changed (with the values from the render that created that effect), and when the component unmounts. In development StrictMode it also runs once right after the first mount. It does <i>not</i> run "after every render" for an effect whose deps didn't change.</p>`],
        ["mid", "My effect logs twice and my FastAPI server sees two WebSocket connections in development. Is React broken?", `<p>No. <code>&lt;StrictMode&gt;</code> in development mounts, simulates unmount (runs cleanups) and remounts every component to check that cleanup really undoes setup. If the server sees connect, disconnect, connect, everything works. If it sees two connections that stay open, the cleanup is missing. The wrong fixes are removing StrictMode or adding a <code>useRef</code> "already ran" guard: both hide a bug that will appear in production on remounts, fast refresh and route changes.</p>`],
        ["mid", "What is a stale closure in an effect, and how do you fix it without disabling the lint rule?", `<p>Each render creates new functions that capture that render's props and state. An effect that reads <code>count</code> but has <code>[]</code> deps keeps the first render's <code>count</code> forever (e.g. an interval doing <code>setCount(count + 1)</code> sticks at 1). Fixes: include the value in deps (correct but may re-subscribe too often), remove the need to read it with an updater (<code>setCount(c =&gt; c + 1)</code>), move objects/functions into the effect, or, for logic that should see the latest value but not trigger a re-run, <code>useEffectEvent</code> (React 19.2+) or a latest-value ref. Suppressing the warning just freezes the bug in place.</p>`],
        ["mid", "Why does putting an object or function in the dependency array often cause an infinite loop?", `<p>Deps are compared with <code>Object.is</code>, which is identity for objects. An object literal or inline function created during render is new every render, so the effect runs after every render. If the effect also sets state (e.g. fetch then <code>setItems</code> with a new array), that state change triggers a render, which creates a new object, which re-runs the effect: a loop. Fix by creating the object inside the effect, depending on primitives, hoisting constants out of the component, or memoising as a last resort.</p>`],
        ["senior", "Give examples of effects you would remove in code review, and what you'd replace them with.", `<p>(1) Copying props into state or computing filtered/derived lists in an effect: compute during render, <code>useMemo</code> if expensive. (2) Watching a state flag to send a POST: move the request into the event handler that set the flag. (3) Clearing a form when <code>userId</code> changes: <code>key={userId}</code>. (4) Chains of effects setting state that triggers other effects: compute everything in one handler or reducer. (5) Calling <code>onChange</code> from an effect that watches internal state: call it in the handler. (6) Fetching in many components: TanStack Query. The test I apply: name the external system; if there isn't one, it isn't an effect.</p>`],
        ["senior", "Explain the race condition in fetch-in-effect and two ways to prevent it.", `<p>If <code>userId</code> changes from 1 to 2 and the request for 1 resolves after the one for 2, the later <code>setUser</code> overwrites the newer data. Effects don't cancel automatically. Fix 1: a local <code>let ignore = false</code> set to <code>true</code> in cleanup, and only <code>setState</code> when <code>!ignore</code>. Fix 2: an <code>AbortController</code>; cleanup calls <code>abort()</code>, which also frees the connection, and you ignore the resulting <code>AbortError</code>. A common wrong answer is "use async/await so it's sequential": await doesn't order two independent effect runs.</p>`],
        ["senior", "<code>useEffect</code> vs <code>useLayoutEffect</code>: when do they run, and when would you choose the layout version?", `<p>Both run after DOM mutations in the commit. <code>useLayoutEffect</code> runs synchronously before the browser paints, so measuring layout and setting state there produces a re-render that also completes before paint: no visible flicker (tooltips, popovers, auto-sizing). It blocks paint, so heavy work there causes jank. <code>useEffect</code> usually runs after paint and is the default. Also, layout effects do nothing useful during server rendering (React warns in older versions), another reason not to default to them.</p>`],
        ["senior", "What problem does <code>useEffectEvent</code> solve?", `<p>Effects must list every reactive value they read. Sometimes part of the effect's logic reads a value that should <i>not</i> cause re-synchronisation, e.g. reconnecting on <code>roomId</code> but using the current <code>theme</code> for a "connected" toast. <code>useEffectEvent</code> wraps that logic in a function that always sees the latest committed values and is excluded from deps. It's stable in React 19.2 (experimental earlier). It isn't a general escape hatch: only call it from effects, and don't use it to hide values that genuinely should re-run the effect.</p>`],
        ["lead", "How would you set team conventions to keep effects from becoming the main source of bugs?", `<p>Lint: <code>exhaustive-deps</code> as error, disables require a comment and reviewer sign-off. Architecture: data fetching only through TanStack Query/loaders; real-time subscriptions through a small set of tested custom hooks (<code>useOrderEvents</code>) with cleanup, reconnect and backoff; third-party widgets through wrapper components. Review checklist: each effect names its external system, has a symmetric cleanup, and survives StrictMode. Keep StrictMode on in development and in tests. Measure: count of <code>useEffect</code> per feature is a useful trend metric.</p>`],
        ["architect", "Your dashboard opens a WebSocket per widget and the FastAPI tier is running out of connections. How do you redesign it?", `<p>Move from per-component connections to one multiplexed connection per tab: a single client module owns the socket (opened once, reference counted, closed when the last subscriber leaves), and components subscribe to topics through a hook built on <code>useSyncExternalStore</code> or by feeding messages into the TanStack Query cache. Server side, FastAPI workers subscribe to Redis channels per topic on demand and route messages to sockets. Add heartbeat, reconnect with exponential backoff and jitter, and resume from a last-event id so reconnects don't lose updates. Consider SSE if traffic is one-way. The React lesson: effects are per component, but connections are an app-level resource, so give them an app-level owner.</p>`]
      ],
      gotchas: [
        `<b>An <code>async</code> function can't be the setup.</b> <code>useEffect(async () =&gt; {...})</code> returns a Promise, which React treats as an invalid cleanup (it warns). Define <code>async function load() {}</code> inside and call it.`,
        `<b>Cleanup closes over old values.</b> Reading <code>ref.current</code> for a DOM node inside cleanup may give you the new node or <code>null</code>; copy it to a local variable in setup if cleanup needs it. The lint rule warns about this.`,
        `<b>Setting state on every run creates loops.</b> An effect with no deps (or an unstable dep) that calls <code>setState</code> with a new object/array renders forever. Setting the <i>same</i> primitive value bails out, which is why some loops only appear with objects.`,
        `<b>StrictMode doubles more than effects.</b> Component bodies, <code>useState</code> initialisers, <code>useMemo</code> callbacks and reducers run twice in development. Side effects in any of them (a POST, an increment of a module variable) show up twice. React 19 may dim or show the duplicate render's <code>console.log</code> depending on version and DevTools settings, so don't rely on log counts.`,
        `<b>Effects don't run on the server.</b> In SSR (Day 13), neither <code>useEffect</code> nor <code>useLayoutEffect</code> runs during server rendering. Anything read in an effect (window size, <code>localStorage</code>) is unavailable in the server HTML, and reading it during render causes hydration mismatches.`,
        `<b>Dep comparison is shallow.</b> Mutating an array in place (<code>items.push(x)</code>) and calling <code>setItems(items)</code> neither re-renders nor re-runs effects depending on <code>items</code>: same reference. Immutable updates (Day 3) are what make deps work.`,
        `<b>Hidden <code>&lt;Activity&gt;</code> subtrees clean up effects.</b> With React 19.2's <code>&lt;Activity mode="hidden"&gt;</code> React keeps state but runs effect cleanups, re-running setups when shown again. Code that only behaves correctly when mounted once breaks there too.`
      ],
      best: [
        `One effect per external system; name it in a comment if it isn't obvious. Split unrelated synchronisations into separate effects.`,
        `Write the cleanup first and check that setup → cleanup → setup equals one setup. Keep StrictMode on in development.`,
        `Treat the dependency array as derived from the code, never edited to control behaviour. Change the code (updaters, moving values inside or outside, <code>useEffectEvent</code>) when it re-runs too often.`,
        `Before writing an effect, ask: can this be computed during render, done in a handler, or solved with <code>key</code>? Only external systems need effects.`,
        `Guard async results with an <code>ignore</code> flag or <code>AbortController</code>; prefer TanStack Query for server data.`,
        `Extract recurring effects (sockets, media queries, intervals, outside-click) into custom hooks so cleanup and edge cases live in one tested place (Day 10).`
      ],
      lab: [
        `In your Vite react-ts app, create <code>src/Probe.tsx</code> from the "three dependency forms" example. Render it from <code>App</code> with a button that increments <code>a</code> and another that toggles whether <code>Probe</code> is mounted. Watch the console in dev (StrictMode on), then run <code>npm run build &amp;&amp; npm run preview</code> and compare: the extra cleanup/setup on mount disappears.`,
        `Build <code>ConnectionBanner</code>. In DevTools Network tab, toggle "Offline" and confirm the banner appears and disappears. Then delete the cleanup function, toggle the component's mount a few times, and use a <code>console.log</code> in <code>handleOffline</code> to see handlers accumulate. Restore the cleanup.`,
        `Add a FastAPI WebSocket endpoint (any echo or timer that sends JSON every second) at <code>/api/ws/orders/{order_id}</code>, configure the Vite proxy with <code>ws: true</code>, and build <code>OrderStatusFeed</code>. Watch Uvicorn's log: connect/disconnect/connect in dev. Add a select that switches between two order ids and verify the old socket closes each time.`,
        `Recreate <code>BrokenTicker</code>, observe it stick at 1 and read the lint warning. Fix it with the updater form. Then create <code>ProductsBroken</code> against a FastAPI <code>/api/products</code> endpoint, watch the Network tab fill with requests, and fix it.`,
        `Find one effect in your project (or a past one) that has no external system, and rewrite it as derived state, a handler, or <code>key</code>.`,
        `<b>Done when:</b> the console order in dev and preview matches your prediction, the server shows exactly one live socket per mounted feed, the ticker counts up, the products endpoint is called once per category change, and you can say for every remaining <code>useEffect</code> which external system it synchronises with.`
      ],
      teach: `<p>"Rendering in React must be pure: given props and state, return JSX, touch nothing else. But apps have to talk to things React doesn't control: a WebSocket, a timer, the page title, a chart library. <code>useEffect</code> is where that happens. React renders, commits to the DOM, the browser paints, and then React runs your effects.</p>
<p>An effect is a synchronisation: setup makes the outside world match the current props and state, and the function you return, the cleanup, undoes it. The dependency array lists the reactive values the effect reads. After each render React compares them with <code>Object.is</code>; if something changed it runs the old cleanup and the new setup. No array means every render, an empty array means only the first.</p>
<p>In development, StrictMode runs setup, cleanup, setup on mount to prove the cleanup works, so two connections in the server log is a feature, not a bug. If an effect reads a value it doesn't list, it sees a stale snapshot; the lint rule catches that. Objects and functions created in render change identity every time, which can cause loops, so create them inside the effect.</p>
<p>And most importantly: if there's no external system, you don't need an effect. Derive values in render, handle user actions in handlers, reset state with a key, and leave data fetching to a library."</p>`
    },

    /* ------------------------------------------------------------------ */
    {
      id: "d5-refs",
      title: "Refs and the DOM: useRef, ref as a prop, useLayoutEffect",
      lv: ["fresher", "mid", "senior"],
      eli5: `<p>State is like the scoreboard in a stadium: every time it changes, the whole crowd looks up and the display is redrawn. A <b>ref</b> is like a sticky note in the referee's pocket. The referee can write on it any time ("timer started at 14:02", "the ball is under seat 12B"), and it's still there next minute, but writing on it doesn't make anyone redraw the scoreboard.</p>
<p>A <b>DOM ref</b> is a sticky note that React itself fills in: "the actual input box on the screen is <i>this</i> one". With it you can do things React's declarative style doesn't cover, like "put the cursor in this box now" or "how tall is this tooltip?".</p>
<p>The rule is: you look at the sticky note when something <i>happens</i> (a click, an effect), never while you're still drawing the scoreboard. While drawing, the note might not be filled in yet, and React doesn't redraw when it changes, so reading it then gives you yesterday's answer.</p>`,
      what: `<p><b><code>useRef(initialValue)</code></b> returns a plain object <code>{ current: initialValue }</code>. React gives you the <b>same object</b> on every render of that component instance. You can read and write <code>ref.current</code> freely, and <b>changing it does not trigger a re-render</b>. It's a box that survives renders but sits outside the render data flow.</p>
<ul class="pts">
<li><b>State vs ref vs local variable.</b> State: survives renders, changing it re-renders, read it during render. Ref: survives renders, changing it doesn't re-render, read it in handlers/effects. Local <code>let</code>: reset every render. Use a ref when the value is needed by handlers or effects but not by the JSX: interval/timeout ids, a WebSocket or chart instance, the previous value of something, an <code>AbortController</code>, "is a drag in progress".</li>
<li><b>Don't read or write <code>ref.current</code> during render</b> (except lazy initialisation, below). Render must be pure; a ref read during render isn't tracked, so the UI won't update when it changes, and with concurrent rendering a render may be discarded after you mutated the ref. The React Compiler and newer lint rules flag this. Only exception: <code>if (ref.current === null) ref.current = createExpensiveThing();</code> to initialise once.</li>
<li><b>TypeScript (React 19 types):</b> <code>useRef&lt;HTMLInputElement&gt;(null)</code> gives <code>RefObject&lt;HTMLInputElement | null&gt;</code>; <code>useRef&lt;number | null&gt;(null)</code> for ids. React 19 types require an argument to <code>useRef</code> and make <code>current</code> always writable.</li>
</ul>
<p><b>DOM refs.</b> Pass a ref object to a host element: <code>&lt;input ref={inputRef} /&gt;</code>. During commit, after the DOM node exists, React sets <code>inputRef.current = node</code>; when the element is removed it sets it back to <code>null</code>. Typical uses:</p>
<ul class="pts">
<li><b>Focus</b>: <code>inputRef.current?.focus()</code> in a click handler or effect (or <code>autoFocus</code> for the simple on-mount case).</li>
<li><b>Scroll</b>: <code>el.scrollIntoView({ block: 'nearest' })</code>, <code>el.scrollTop = el.scrollHeight</code> for chat logs.</li>
<li><b>Measure</b>: <code>getBoundingClientRect()</code>, <code>offsetHeight</code>, <code>ResizeObserver</code>.</li>
<li><b>Media and browser APIs</b>: <code>video.play()</code>, <code>dialog.showModal()</code>, <code>canvas.getContext('2d')</code>.</li>
<li><b>Third-party libraries</b>: hand a container node to Chart.js, Leaflet, Monaco, a D3 chart; keep the library instance in another ref.</li>
</ul>
<p>Don't use refs to change what React renders (setting <code>textContent</code>, removing nodes React owns): React will overwrite or crash on it at the next commit. Touch only things React doesn't manage (focus, scroll, measuring, empty containers you gave to a library).</p>
<p><b>Ref as a prop (React 19).</b> In React 19, function components receive <code>ref</code> like any other prop: <code>function TextField({ ref, ...props }: { ref?: Ref&lt;HTMLInputElement&gt; })</code> and forward it to an inner element. Before React 19, <code>ref</code> was stripped from props, so you had to wrap the component in <b><code>forwardRef((props, ref) =&gt; ...)</code></b>. <code>forwardRef</code> still works in 19 and you'll see it in most existing code and libraries; the React team has said it will be deprecated in a future version. Class components still receive <code>ref</code> as the instance, not as a prop.</p>
<p><b>Callback refs.</b> Instead of an object you can pass a function: <code>ref={node =&gt; {...}}</code>. React calls it with the node after attaching and (classically) with <code>null</code> when detaching. If the function identity changes between renders, React calls the old one with <code>null</code> and the new one with the node, so wrap it in <code>useCallback</code> or define it outside when that matters. Use cases: refs for a dynamic list (store nodes in a <code>Map</code>), measuring a node the moment it appears, attaching an observer. <b>React 19 adds ref cleanup functions</b>: a callback ref may return a function, and React calls that function on detach <i>instead of</i> calling the ref with <code>null</code>. Because of this, the React 19 TypeScript types reject callback refs that implicitly return a value (<code>ref={n =&gt; (x = n)}</code>); use a block body.</p>
<p><b><code>useImperativeHandle(ref, () =&gt; handle, deps)</code></b> customises what the parent's ref receives. Instead of exposing the raw <code>&lt;input&gt;</code>, a <code>SearchBox</code> can expose only <code>{ focus, clear }</code>. Use it sparingly: it's for imperative actions (focus, scroll to, play) that can't be expressed as props. If you're tempted to expose <code>open()</code>/<code>close()</code>, an <code>isOpen</code> prop is usually better.</p>
<p><b><code>useLayoutEffect</code> for measuring.</b> When you must measure rendered layout and then adjust (tooltip that flips above/below, auto-sizing text, scroll position restore), do it in <code>useLayoutEffect</code>: it runs after DOM mutation and ref attachment but before paint. A <code>setState</code> inside it causes a synchronous re-render that also completes before paint, so the user never sees the wrong position. With <code>useEffect</code>, the first frame may paint in the wrong place and then jump.</p>
<p><b><code>flushSync</code></b> (from <code>react-dom</code>) forces React to apply a state update synchronously. Combined with a ref, it handles "add a message, then scroll to it" in the same handler. Use it rarely; it defeats batching.</p>`,
      why: `<p>React is declarative: you describe the UI and React makes the DOM match. That covers almost everything, but some browser capabilities are inherently <i>imperative</i> commands with no state to describe: "focus now", "scroll this into view", "play", "how big are you?". And some values must persist across renders without being UI: a timer id, a socket, a chart instance. Putting those in state would cause pointless re-renders (and in the timer case, a render per tick just to store an id); putting them in a local variable loses them on the next render; putting them in a module variable shares them across every instance of the component.</p>
<p>Before hooks, class components kept such values as instance fields (<code>this.timerId</code>) and used <code>React.createRef()</code> or string refs (<code>ref="input"</code>, long removed) for DOM nodes. <code>useRef</code> gives function components the same "instance field" capability. <code>forwardRef</code> existed because function components had no instance and React stripped <code>ref</code> from props; React 19 removes that special case, so design-system components (<code>Button</code>, <code>TextField</code>) can accept <code>ref</code> like any prop. <code>useImperativeHandle</code> exists so components can offer imperative capabilities without leaking their internals, keeping encapsulation.</p>`,
      diagram: {
        html: lanes([
          ["State (useState)", ["Survives re-renders", "Setter schedules a re-render", "Read during render: yes", "Snapshot per render", "For: anything the JSX shows"]],
          ["Ref (useRef)", ["Survives re-renders (same object)", "Writing .current: no re-render", "Read during render: no (handlers, effects)", "Always the latest value", "For: ids, instances, DOM nodes, previous value"]],
          ["Local variable", ["Reset on every render", "Changing it: nothing happens", "Read during render: yes", "Lives for one render", "For: values derived from props/state"]]
        ]) + flow([
          ["Render", "ref.current not touched", ""],
          ["Mutation", "DOM updated; old refs set to null / cleanup", "w"],
          ["Layout", "new refs attached; useLayoutEffect: measure, setState", "w"],
          ["Paint", "user sees final layout", "g"],
          ["useEffect", "focus, subscribe, init libraries", "g"]
        ]),
        steps: [
          `Choose the box: state if the JSX shows it, ref if only handlers/effects need it and changing it shouldn't re-render, local variable if it's derived from this render.`,
          `During render React doesn't touch refs; you shouldn't either. On first render a DOM ref is still <code>null</code>.`,
          `In the commit's mutation phase React updates the DOM and detaches refs of removed nodes (setting <code>current</code> to <code>null</code>, or calling a callback ref's cleanup in React 19).`,
          `In the layout phase React attaches refs to new nodes, then runs <code>useLayoutEffect</code>: measuring here and calling <code>setState</code> re-renders synchronously before paint.`,
          `After paint, <code>useEffect</code> runs: refs are populated, so it can focus, subscribe or hand the node to a library, and clean up on unmount.`
        ]
      },
      ex: [
        {
          t: "Focus an input from a button (the classic DOM ref)",
          lang: "tsx",
          code: `import { useRef } from 'react';

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null); // RefObject<HTMLInputElement | null>

  function handleClick() {
    inputRef.current?.focus(); // in a handler: the node exists
  }

  return (
    <div>
      <input ref={inputRef} type="search" placeholder="Search orders" />
      <button onClick={handleClick}>Focus search</button>
    </div>
  );
}`,
          note: `<p>The optional chain is there because TypeScript can't know the node is mounted; at click time it is. To focus on mount instead, either use the <code>autoFocus</code> attribute or <code>useEffect(() =&gt; { inputRef.current?.focus(); }, [])</code>.</p>`
        },
        {
          t: "A ref does not re-render; state does",
          lang: "tsx",
          code: `import { useRef, useState } from 'react';

export function Counters() {
  const [stateCount, setStateCount] = useState(0);
  const refCount = useRef(0);

  return (
    <div>
      <button onClick={() => setStateCount(c => c + 1)}>state: {stateCount}</button>
      <button
        onClick={() => {
          refCount.current += 1;
          console.log('ref is now', refCount.current);
        }}
      >
        ref (shown on next render)
      </button>
      {/* Don't do this: reading ref.current during render.
          It's only correct by accident, when something else re-renders. */}
    </div>
  );
}`,
          out: "Click 'ref' 3 times: console logs 1, 2, 3; the screen does not change.\nClick 'state': re-render; anything reading the ref would now show 3.",
          note: `<p>This is why "my ref changed but the UI didn't update" is not a bug: the ref is designed not to notify React. If the screen needs it, it's state.</p>`
        },
        {
          t: "Storing an interval id: a stopwatch",
          lang: "tsx",
          code: `import { useEffect, useRef, useState } from 'react';

export function Stopwatch() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null); // the id is not UI: a ref

  function stopTimer() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function handleStart() {
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    stopTimer(); // avoid two intervals if Start is clicked twice
    intervalRef.current = window.setInterval(() => setNow(Date.now()), 10);
  }

  // Clear on unmount so the interval doesn't outlive the component.
  useEffect(() => () => stopTimer(), []); // eslint may ask for stopTimer; see note

  const seconds = startedAt !== null && now !== null ? (now - startedAt) / 1000 : 0;

  return (
    <div>
      <p>{seconds.toFixed(2)} s</p>
      <button onClick={handleStart}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}`,
          note: `<p><code>window.setInterval</code> returns a <code>number</code> in the DOM typings (a bare <code>setInterval</code> can resolve to Node's <code>Timeout</code> type if <code>@types/node</code> is installed). The lint rule will say <code>stopTimer</code> is a missing dependency because it's a function declared in the component; you can inline the clearing logic into the cleanup to satisfy it. Here the cleanup should read the <i>latest</i> id, which is exactly what a ref gives.</p>`
        },
        {
          t: "React 19: ref as a plain prop (and the forwardRef version you'll meet in older code)",
          lang: "tsx",
          code: `import { forwardRef, useRef } from 'react';
import type { ComponentProps, Ref } from 'react';

// React 19: ref is just a prop on function components.
type TextFieldProps = Omit<ComponentProps<'input'>, 'ref'> & {
  label: string;
  ref?: Ref<HTMLInputElement>;
};

export function TextField({ label, ref, ...inputProps }: TextFieldProps) {
  return (
    <label>
      {label}
      <input ref={ref} {...inputProps} />
    </label>
  );
}

// React 18 and earlier (still works in 19, planned for deprecation):
export const LegacyTextField = forwardRef<HTMLInputElement, { label: string }>(
  function LegacyTextField({ label }, ref) {
    return (
      <label>
        {label}
        <input ref={ref} />
      </label>
    );
  },
);

export function LoginForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!emailRef.current?.value) emailRef.current?.focus(); // focus the first invalid field
      }}
    >
      <TextField label="Email" ref={emailRef} type="email" name="email" />
      <button type="submit">Sign in</button>
    </form>
  );
}`,
          note: `<p>With React 19 types, <code>ComponentProps&lt;'input'&gt;</code> already includes <code>ref</code>; the <code>Omit</code> plus explicit <code>ref</code> just makes it visible. If you're on React 18, passing <code>ref</code> to a plain function component gives a warning and <code>ref</code> is <code>undefined</code> in props. Library code that must support both versions keeps <code>forwardRef</code>.</p>`
        },
        {
          t: "useImperativeHandle: expose focus() and clear(), not the whole input",
          lang: "tsx",
          code: `import { useImperativeHandle, useRef } from 'react';
import type { Ref } from 'react';

export type SearchBoxHandle = { focus: () => void; clear: () => void };

type SearchBoxProps = {
  ref?: Ref<SearchBoxHandle>;
  onSearch: (q: string) => void;
};

export function SearchBox({ ref, onSearch }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
    clear() {
      if (inputRef.current) inputRef.current.value = '';
      onSearch('');
    },
  }), [onSearch]);

  return <input ref={inputRef} type="search" onChange={e => onSearch(e.target.value)} />;
}

export function OrdersToolbar() {
  const boxRef = useRef<SearchBoxHandle>(null);
  return (
    <div>
      <SearchBox ref={boxRef} onSearch={q => console.log('search', q)} />
      <button onClick={() => boxRef.current?.clear()}>Reset</button>
      <button onClick={() => boxRef.current?.focus()}>Find</button>
    </div>
  );
}`,
          note: `<p>The parent can't call <code>boxRef.current.style</code> or read the value: the component chose its public API. The input here is uncontrolled (Day 3), which is why <code>clear()</code> writes the DOM value; React doesn't manage <code>value</code> for it, so this doesn't fight React.</p>`
        },
        {
          t: "Callback refs: a ref per list item, with React 19 ref cleanup",
          lang: "tsx",
          code: `import { useRef } from 'react';

type Message = { id: number; text: string };

export function MessageList({ messages }: { messages: Message[] }) {
  // One ref holding a Map of id -> node; created once (lazy init pattern).
  const nodesRef = useRef<Map<number, HTMLLIElement> | null>(null);
  function getNodes() {
    if (nodesRef.current === null) nodesRef.current = new Map();
    return nodesRef.current;
  }

  function scrollTo(id: number) {
    getNodes().get(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  return (
    <>
      <button onClick={() => messages[0] && scrollTo(messages[0].id)}>Oldest</button>
      <ul style={{ maxHeight: 200, overflowY: 'auto' }}>
        {messages.map(m => (
          <li
            key={m.id}
            ref={node => {
              if (node) getNodes().set(m.id, node);
              // React 19: returning a function makes React call it on detach
              // instead of calling this ref with null.
              return () => {
                getNodes().delete(m.id);
              };
            }}
          >
            {m.text}
          </li>
        ))}
      </ul>
    </>
  );
}`,
          note: `<p>You can't call <code>useRef</code> inside <code>map</code> (rules of hooks), so a Map in a single ref is the standard pattern. The inline function is a new identity every render, so React detaches and re-attaches it on each render (cheap here). In React 18 the returned function is ignored and the ref is called with <code>null</code> instead, so code for 18 checks <code>node === null</code> to delete.</p>`
        },
        {
          t: "Callback ref + ResizeObserver: measure a node whenever its size changes",
          lang: "tsx",
          code: `import { useCallback, useState } from 'react';

export function useElementSize<T extends HTMLElement>() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Stable identity, so React attaches it once per node, not every render.
  const ref = useCallback((node: T | null) => {
    if (!node) return;
    const observer = new ResizeObserver(entries => {
      const box = entries[0]?.contentRect;
      if (box) setSize({ width: box.width, height: box.height });
    });
    observer.observe(node);
    return () => observer.disconnect(); // React 19 ref cleanup
  }, []);

  return [ref, size] as const;
}

export function Panel() {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  return (
    <div ref={ref} style={{ resize: 'horizontal', overflow: 'auto', border: '1px solid #ccc' }}>
      {width < 400 ? 'Compact layout' : 'Wide layout'} ({Math.round(width)}px)
    </div>
  );
}`,
          note: `<p>A callback ref fires exactly when the node appears or disappears, even if it's conditionally rendered later; a <code>useEffect</code> with <code>[]</code> would miss a node that mounts after the component's first render. (Custom hooks are Day 10.) For pure CSS layout switches, container queries may make this unnecessary.</p>`
        },
        {
          t: "useLayoutEffect: position a tooltip before the browser paints",
          lang: "tsx",
          code: `import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

function Tooltip({ target, children }: { target: DOMRect; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    // DOM is updated and the ref attached, but nothing is painted yet.
    if (ref.current) setHeight(ref.current.getBoundingClientRect().height);
  }, []);

  // Prefer above the target; flip below if it would go off-screen.
  let top = target.top - height - 8;
  if (top < 0) top = target.bottom + 8;

  return (
    <div
      ref={ref}
      role="tooltip"
      style={{ position: 'fixed', left: target.left, top, background: '#222', color: '#fff', padding: 6 }}
    >
      {children}
    </div>
  );
}

export function HelpButton() {
  const [rect, setRect] = useState<DOMRect | null>(null);
  return (
    <>
      <button
        onPointerEnter={e => setRect(e.currentTarget.getBoundingClientRect())}
        onPointerLeave={() => setRect(null)}
      >
        What's this?
      </button>
      {rect && <Tooltip target={rect}>Orders are synced from FastAPI every 30 s.</Tooltip>}
    </>
  );
}`,
          note: `<p>Sequence: first render with <code>height = 0</code> → commit → layout effect measures and sets height → synchronous re-render with the correct <code>top</code> → paint. The user only sees the final position. Swap in <code>useEffect</code> and on a slow device you can see the tooltip flash at the wrong place first. Production apps usually use a positioning library (Floating UI) that does this plus collision handling.</p>`
        },
        {
          t: "flushSync + ref: append a chat message and scroll to it",
          lang: "tsx",
          code: `import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

type Msg = { id: number; text: string };

export function ChatLog() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  function send() {
    const msg = { id: Date.now(), text: draft };
    // Commit the new <li> to the DOM right now...
    flushSync(() => {
      setMessages(prev => [...prev, msg]);
      setDraft('');
    });
    // ...so the DOM already contains it here.
    listRef.current?.lastElementChild?.scrollIntoView({ block: 'end' });
  }

  return (
    <div>
      <ul ref={listRef} style={{ height: 160, overflowY: 'auto' }}>
        {messages.map(m => <li key={m.id}>{m.text}</li>)}
      </ul>
      <input value={draft} onChange={e => setDraft(e.target.value)} aria-label="Message" />
      <button onClick={send} disabled={!draft}>Send</button>
    </div>
  );
}`,
          note: `<p>Without <code>flushSync</code>, the scroll would run before React re-renders (state updates are batched until the handler returns), so it would scroll to the previous last message. An alternative without <code>flushSync</code> is an effect on <code>[messages.length]</code> that scrolls; it's preferable when messages also arrive from a WebSocket rather than only from this handler.</p>`
        },
        {
          t: "Integrating a non-React library: Chart.js with a ref and two effects",
          lang: "tsx",
          code: `// npm install chart.js
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

type Point = { label: string; value: number };

export function LatencyChart({ points }: { points: Point[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<'line', number[], string> | null>(null);

  // Effect 1: create the chart once, destroy it on unmount.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const chart = new Chart<'line', number[], string>(canvas, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'p95 latency (ms)', data: [] }] },
      options: { animation: false, responsive: true, maintainAspectRatio: false },
    });
    chartRef.current = chart;
    return () => {
      chart.destroy(); // frees the canvas so StrictMode's second setup can reuse it
      chartRef.current = null;
    };
  }, []);

  // Effect 2: push new data into the existing chart instead of recreating it.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.labels = points.map(p => p.label);
    chart.data.datasets[0].data = points.map(p => p.value);
    chart.update();
  }, [points]);

  return (
    <div style={{ position: 'relative', height: 240 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}`,
          note: `<p>Effects run in order, so on mount effect 1 creates the chart before effect 2 fills it; under StrictMode, cleanup destroys it and both setups run again. Forget <code>destroy()</code> and Chart.js throws "Canvas is already in use" on the second setup. React only renders the empty <code>&lt;canvas&gt;</code>; everything inside belongs to the library. The same shape works for Leaflet, Mapbox, Monaco or D3: container ref, instance ref, create/destroy effect, update effect.</p>`
        },
        {
          t: "Latest-value ref and previous-value ref (pre-useEffectEvent patterns)",
          lang: "tsx",
          code: `import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Keep a callback fresh without re-subscribing (what useEffectEvent replaces in 19.2+).
export function useInterval(callback: () => void, ms: number) {
  const latest = useRef(callback);
  useLayoutEffect(() => {
    latest.current = callback; // written after commit, never during render
  });
  useEffect(() => {
    const id = window.setInterval(() => latest.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

// Show the previous price next to the current one.
export function PriceTicker({ price }: { price: number }) {
  const prevRef = useRef<number | null>(null);
  const [prev, setPrev] = useState<number | null>(null);
  useEffect(() => {
    setPrev(prevRef.current); // state, because the JSX shows it
    prevRef.current = price;
  }, [price]);
  return <p>{price} {prev !== null && (price > prev ? '▲' : price < prev ? '▼' : '')}</p>;
}`,
          note: `<p>The latest-ref pattern was common in libraries for years; prefer <code>useEffectEvent</code> where your React version has it. For the previous-value case the React docs suggest an even simpler option: store <code>prevPrice</code> in state and compare during render (<code>if (price !== prevPrice) { setPrevPrice(price); ... }</code>), which avoids the extra effect render. The version above is shown because it's what you'll find in existing code.</p>`
        }
      ],
      internals: `<p><b><code>useRef</code> is the simplest hook.</b> On mount React creates <code>{ current: initialValue }</code> and stores it in the hook's <code>memoizedState</code> slot in the fiber's hook list. On every update it just returns that same object. There's no queue, no comparison and no scheduling: writing <code>.current</code> is an ordinary JavaScript property assignment React never hears about. That's both the feature (no re-render) and the danger (React can't keep it consistent with concurrent rendering; a render that is thrown away may already have mutated it). In development React may freeze or warn about some misuse, and the React Compiler assumes refs aren't read during render when it memoises.</p>
<p><b>How the <code>ref</code> attribute is attached.</b> When an element has a <code>ref</code>, React marks the fiber with a <code>Ref</code> flag during render if the ref changed. In the commit's mutation phase it detaches the old ref (sets <code>current = null</code>, calls a callback ref with <code>null</code>, or in React 19 calls the cleanup the callback returned). In the layout phase, after DOM nodes are inserted, it attaches the new one (<code>commitAttachRef</code>): for a host component the value is the DOM node, for a class component the instance. This is why refs are populated by the time <code>useLayoutEffect</code> and <code>useEffect</code> run, and null during the first render.</p>
<p><b>Ref as a prop.</b> Before React 19, <code>createElement</code>/the JSX runtime pulled <code>ref</code> (like <code>key</code>) out of props into a separate field on the element, and only <code>forwardRef</code> components received it as a second argument. In React 19 <code>ref</code> stays in <code>props</code> for function components; <code>element.ref</code> access is deprecated. For host elements React still reads it and attaches the DOM node.</p>
<p><b><code>useImperativeHandle</code></b> is implemented as a layout effect: in the layout phase it calls your <code>create</code> function and assigns the result to the ref (object or callback), and on cleanup it resets the ref. That's why the parent's ref is filled in at the same time as a DOM ref would be, and why its deps behave like effect deps.</p>
<p><b><code>useLayoutEffect</code> and synchronous re-render.</b> Layout effects run inside the same synchronous commit. If one calls <code>setState</code>, React schedules the update in the synchronous lane and processes it before yielding to the browser, so the extra render and commit happen before paint. That's the guarantee tooltip measurement depends on, and also why expensive layout effects cause dropped frames. <code>flushSync</code> uses the same synchronous lane to render and commit on demand.</p>
<p><b>StrictMode and refs.</b> In React 19 development, StrictMode also double-invokes callback refs on initial mount (attach, detach, attach), mirroring the effect check, so callback refs with side effects need a symmetric cleanup too.</p>`,
      prod: `<p><b>Design systems.</b> Every reusable <code>Button</code>, <code>TextField</code>, <code>Select</code> in a component library must forward its ref, or consumers can't focus it, measure it, or use it as an anchor for popovers and tooltips (Radix, Floating UI and React Hook Form's <code>register</code> all rely on refs). In a React 19 codebase that's just a <code>ref</code> prop; libraries supporting React 18 too still ship <code>forwardRef</code>. Forgetting it is a common accessibility bug: "focus the first invalid field on submit" silently does nothing.</p>
<p><b>Accessibility and focus management.</b> Real products use DOM refs most for focus: move focus into a dialog when it opens and back to the trigger when it closes, focus the error summary after a failed FastAPI validation response (422), restore scroll position when the user navigates back to a long orders list. These are imperative by nature and live in effects or handlers. Native <code>&lt;dialog&gt;</code> with <code>ref.current.showModal()</code> handles much of the focus trapping for you.</p>
<p><b>Third-party integrations.</b> Dashboards built on a FastAPI metrics API commonly embed Chart.js/ECharts, maps (Leaflet/Mapbox), rich text or code editors (Monaco, TipTap). The production bugs are almost always lifecycle bugs: instance created twice (StrictMode without destroy), instance recreated on every data change (a 60 fps chart re-instantiated per WebSocket message), event listeners on the library never removed, or React state and library state drifting. The pattern of a container ref, an instance ref, a create/destroy effect and a separate update effect keeps it predictable; wrap it once per library.</p>
<p><b>Layout effects at scale.</b> <code>useLayoutEffect</code> in a list of 500 rows that each measure themselves forces 500 synchronous layout reads (and potentially layout thrashing if they interleave reads and writes), blocking paint. Virtualised lists (TanStack Virtual) measure only visible rows. With SSR (Day 13), layout effects don't run on the server, so measured UI renders unmeasured in the HTML; plan for an initial unmeasured state.</p>
<p><b>Refs as hidden state.</b> A frequent code-review finding in larger teams: values stored in refs to "avoid re-renders" that actually feed the UI (a ref-based <code>isLoading</code>, a ref holding the selected tab) and then show stale screens. The rule: if the user can see it, it's state.</p>`,
      iq: [
        ["fresher", "What is the difference between <code>useRef</code> and <code>useState</code>?", `<p>Both persist across renders. Updating state via its setter schedules a re-render and the new value is visible on the next render. Mutating <code>ref.current</code> changes the value immediately and triggers nothing. Use state for anything the UI shows; use a ref for values only handlers/effects need (timer ids, DOM nodes, instances). The tempting wrong answer, "refs are faster state", leads to UIs that don't update.</p>`],
        ["fresher", "How do you focus an input when a button is clicked?", `<p>Create <code>const inputRef = useRef&lt;HTMLInputElement&gt;(null)</code>, attach it with <code>&lt;input ref={inputRef} /&gt;</code>, and in the click handler call <code>inputRef.current?.focus()</code>. Not <code>document.getElementById</code>: it breaks with multiple instances and bypasses React's knowledge of which node belongs to which component.</p>`],
        ["mid", "Why shouldn't you read or write <code>ref.current</code> during render?", `<p>Render must be pure and may run multiple times or be discarded in concurrent rendering. A write during render can persist from a render that never committed; a read during render isn't tracked, so when the ref changes the component doesn't re-render and shows a stale value. DOM refs are also <code>null</code> during the first render because the node doesn't exist yet. Read and write them in event handlers and effects. The one accepted exception is lazy initialisation (<code>if (ref.current === null) ref.current = new Thing()</code>).</p>`],
        ["mid", "How do you pass a ref to your own function component? What changed in React 19?", `<p>In React 19 a function component receives <code>ref</code> as a normal prop, so you destructure it and put it on the inner element (type it as <code>Ref&lt;HTMLInputElement&gt;</code>). Before 19, <code>ref</code> was stripped from props and you had to wrap the component in <code>forwardRef((props, ref) =&gt; ...)</code>. <code>forwardRef</code> still works in 19 and is expected to be deprecated later; libraries supporting React 18 keep using it.</p>`],
        ["mid", "What is a callback ref and when would you use one instead of a ref object?", `<p>A function passed to <code>ref</code>; React calls it with the node when attached and (pre-19, or without a returned cleanup) with <code>null</code> when detached. Use it when you need to act at the moment a node appears (measure, observe) even if it mounts conditionally later, or when you need refs for a dynamic list (store nodes in a Map). React 19 lets it return a cleanup function. Gotcha: an inline callback is a new function each render, so React detaches/re-attaches every render; memoise with <code>useCallback</code> if that's expensive.</p>`],
        ["senior", "When is <code>useImperativeHandle</code> appropriate, and when is it a design smell?", `<p>Appropriate for genuinely imperative capabilities that can't be expressed as state: focus, select text, scroll to an item, play/pause media, reset an uncontrolled form. It lets the component expose a narrow API rather than its DOM node. It's a smell when used to drive state that should be props (<code>modalRef.current.open()</code> instead of <code>&lt;Modal open={isOpen}&gt;</code>): the parent can no longer render the UI from its state, and it breaks React's data flow and testability.</p>`],
        ["senior", "A tooltip flickers at the wrong position for one frame. Why, and how do you fix it?", `<p>It measures in <code>useEffect</code>, which runs after the browser has painted the first (unpositioned) frame, then sets state and re-renders: the user sees both frames. Move the measurement to <code>useLayoutEffect</code>: it runs after DOM mutation but before paint, and a <code>setState</code> there is processed synchronously, so only the final position is painted. Keep it cheap because it blocks paint, and remember it doesn't run during SSR. In production, Floating UI does this for you.</p>`],
        ["senior", "How do you integrate a non-React library like a chart or map into a React component?", `<p>Render an empty container element and keep a ref to it; in an effect with <code>[]</code>, create the library instance on that node, store it in another ref, and destroy it in cleanup (which also makes StrictMode's double setup safe). Push prop changes into the instance from a separate effect (<code>chart.update()</code>) rather than recreating it. Never let React render children inside the container the library owns. Wrap it as a component so the rest of the app stays declarative.</p>`],
        ["lead", "Your team stores lots of values in refs \"for performance\". What's your guidance?", `<p>Refs are for values that don't affect output. If a value is shown on screen or decides what renders, it must be state; otherwise screens go stale and bugs depend on unrelated re-renders. If re-renders are the actual problem, measure with the Profiler and fix with state colocation, splitting components, memoisation or the React Compiler (Day 11). Also enforce the "no ref reads during render" lint rules, since the Compiler relies on it.</p>`]
      ],
      gotchas: [
        `<b>DOM refs are <code>null</code> during the first render</b> and after the element unmounts. Conditionally rendered elements make <code>ref.current</code> null whenever they're hidden; always null-check.`,
        `<b>A ref object in deps doesn't work as a trigger.</b> <code>useEffect(..., [ref.current])</code> captures the value at render time and the effect won't re-run when <code>current</code> changes later. Use a callback ref or state to react to a node appearing.`,
        `<b><code>useRef(new Map())</code> creates a new Map every render</b> (and throws it away). Harmless for cheap objects, wasteful for expensive ones; use the lazy-init pattern (<code>if (ref.current === null)</code>).`,
        `<b>Callback refs and implicit returns.</b> In React 19, a returned function is treated as cleanup, and the types reject <code>ref={n =&gt; (this.x = n)}</code>-style implicit returns. Always use a block body for callback refs.`,
        `<b>Changing DOM that React owns.</b> Setting <code>innerHTML</code>, removing children, or reordering nodes React rendered leads to "Failed to execute 'removeChild'" errors or your changes being overwritten. Only touch focus/scroll/measurement, or containers React leaves empty.`,
        `<b>Refs to custom components get <code>undefined</code> unless forwarded.</b> <code>&lt;MyButton ref={r} /&gt;</code> fills <code>r</code> only if <code>MyButton</code> passes <code>ref</code> to something (React 19 prop, <code>forwardRef</code>, or <code>useImperativeHandle</code>).`,
        `<b>Reading layout forces a reflow.</b> <code>getBoundingClientRect()</code> after a style change makes the browser compute layout synchronously. Batch reads before writes; don't measure in loops of hundreds of items.`
      ],
      best: [
        `If the screen shows it, use state; use refs only for values that handlers and effects need.`,
        `Read and write refs in handlers and effects, not during render; null-check DOM refs.`,
        `Forward <code>ref</code> from every reusable leaf component (inputs, buttons) so consumers can focus and anchor to them; in React 19 just accept a <code>ref</code> prop.`,
        `Prefer props over imperative handles; when you do use <code>useImperativeHandle</code>, expose the smallest possible API.`,
        `Use <code>useLayoutEffect</code> only for measure-then-adjust before paint; use <code>useEffect</code> for everything else.`,
        `Wrap each third-party widget in one component with a container ref, an instance ref, a create/destroy effect and an update effect.`
      ],
      lab: [
        `Build <code>SearchBar</code> and confirm the button focuses the input. Then add <code>useEffect(() =&gt; { inputRef.current?.focus(); }, [])</code> and see it focus on load.`,
        `Build <code>Stopwatch</code>. Click Start twice quickly and confirm only one interval runs (time doesn't accelerate). Unmount it from a parent toggle and use the Performance panel or a <code>console.log</code> in the interval to confirm it stopped.`,
        `Create <code>TextField</code> with a <code>ref</code> prop (React 19) and a <code>LoginForm</code> that focuses the empty email field on submit. Check <code>package.json</code> for your React version; if you're on 18, switch the component to <code>forwardRef</code>.`,
        `Build <code>HelpButton</code> with <code>Tooltip</code>. In DevTools, set CPU throttling to 6x slowdown, switch <code>useLayoutEffect</code> to <code>useEffect</code>, and look for the one-frame jump; switch back.`,
        `<code>npm install chart.js</code>, build <code>LatencyChart</code>, and feed it a new point every second (a <code>setInterval</code> in the parent, or from your FastAPI WebSocket of the effects lab). Remove <code>chart.destroy()</code> and read the error StrictMode surfaces; put it back.`,
        `<b>Done when:</b> focus works from button, on load and on invalid submit; the stopwatch never runs two intervals and stops on unmount; the tooltip never visibly jumps under throttling; and the chart updates live with no "Canvas is already in use" error in development.`
      ],
      teach: `<p>"<code>useRef</code> gives a component a box, <code>{ current }</code>, that is the same object on every render. You can change what's in it any time, and React doesn't re-render. That's the difference from state: state is for things the screen shows, refs are for things only your handlers and effects need, like a timer id, a socket, a chart instance.</p>
<p>The most common ref is a DOM ref. Put <code>ref={inputRef}</code> on an element and after commit React sets <code>inputRef.current</code> to the real DOM node, so you can focus it, scroll it, or measure it. Do that in handlers or effects, never during render, because during render the node may not exist and React won't re-render when a ref changes.</p>
<p>To let a parent reach into your component, in React 19 you just accept <code>ref</code> as a prop and pass it down; older code uses <code>forwardRef</code>. If you want to expose less than the raw node, <code>useImperativeHandle</code> lets you hand out, say, just <code>focus</code> and <code>clear</code>. Callback refs are functions React calls when the node appears, useful for lists and observers, and in React 19 they can return a cleanup.</p>
<p>Finally, when you need to measure and reposition before the user sees anything, like a tooltip, use <code>useLayoutEffect</code>: it runs after the DOM updates but before paint. And to embed a library like Chart.js, give it a container ref, create it in an effect, destroy it in the cleanup."</p>`
    }
  ],
  quiz: [
    {
      q: `This component freezes the tab and the Network panel fills with requests to <code>/api/orders</code>. Why?`,
      code: `function Orders({ status }: { status: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const filters = { status, page: 1 };

  useEffect(() => {
    fetch('/api/orders?status=' + filters.status)
      .then(r => r.json())
      .then(setOrders);
  }, [filters]);

  return <OrderTable orders={orders} />;
}`,
      lang: "tsx",
      ans: `An infinite loop: <code>filters</code> is a new object every render, so the effect runs after every render, and each run sets <code>orders</code> to a new array, which causes another render.`,
      why: `<p>Deps are compared with <code>Object.is</code>; two object literals are never identical. Fetch → <code>setOrders(newArray)</code> → render → new <code>filters</code> → effect again. Fix: depend on the primitive (<code>[status]</code>) and build the query inside the effect, and add an <code>ignore</code> flag or <code>AbortController</code> for races. Better still for server data: TanStack Query with <code>queryKey: ['orders', status]</code> (Day 7).</p>`
    },
    {
      q: `A chat screen lets the user switch rooms. After switching a few times, each new message appears several times and the FastAPI server reports many open sockets for one user. Find the bug.`,
      code: `function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<string[]>([]);
  useEffect(() => {
    const ws = new WebSocket('/api/ws/rooms/' + roomId);
    ws.onmessage = e => setMessages(m => [...m, e.data]);
  }, [roomId]);
  return <MessageList messages={messages} />;
}`,
      lang: "tsx",
      ans: `The effect has no cleanup, so every previous socket stays open and keeps appending messages. Return <code>() =&gt; ws.close()</code>.`,
      why: `<p>When <code>roomId</code> changes React runs the previous effect's cleanup before the new setup; with no cleanup, nothing closes the old connection. Each switch adds one more live socket, and sockets for the same room deliver duplicates. StrictMode would have shown this immediately in development as two connections on mount. Also, older browsers only accept an absolute <code>ws://</code>/<code>wss://</code> URL in <code>new WebSocket</code> (recent ones also accept relative URLs), so building it from <code>window.location</code> is the safe choice. Use <code>key={roomId}</code> on the component to reset <code>messages</code> per room.</p>`
    },
    {
      q: `The button logs the right numbers but the text on screen stays at "Clicked 0 times". Why?`,
      code: `function ClickCounter() {
  const clicks = useRef(0);
  return (
    <button onClick={() => { clicks.current++; console.log(clicks.current); }}>
      Clicked {clicks.current} times
    </button>
  );
}`,
      lang: "tsx",
      ans: `Mutating a ref doesn't trigger a re-render, and the JSX reads the ref during render. Use <code>useState</code> for a value the UI shows.`,
      why: `<p><code>useRef</code> returns a plain mutable object React never watches. The component rendered once with <code>0</code> and nothing has asked React to render again. If something else re-rendered it, the text would suddenly jump, which is worse: correctness depending on unrelated updates. Reading <code>ref.current</code> during render is itself against the rules. Replace with <code>const [clicks, setClicks] = useState(0)</code> and <code>setClicks(c =&gt; c + 1)</code>.</p>`
    },
    {
      q: `In development, "Dashboard mounted" is logged twice and the analytics backend receives two <code>page_view</code> events. A teammate proposes the fix below. What do you say?`,
      code: `const sent = useRef(false);
useEffect(() => {
  if (sent.current) return;
  sent.current = true;
  console.log('Dashboard mounted');
  track('page_view', { page: 'dashboard' });
}, []);`,
      lang: "tsx",
      ans: `The double run is StrictMode's development-only mount → unmount → mount check, not a bug. Don't guard it with a ref; send page views from a navigation/route event (or make them idempotent), and leave the effect without a guard.`,
      why: `<p>Production runs the effect once per mount. The ref guard hides the check without fixing anything; it also doesn't help with real remounts (navigating away and back creates a new instance with a new ref) and hides genuine missing-cleanup bugs. For analytics, the React docs' advice is that sending twice in development is acceptable, or track from the router's navigation event and deduplicate server-side by event id. For effects with real resources, the answer is a cleanup that undoes setup.</p>`
    },
    {
      q: `The Escape key should close the panel only when <code>open</code> is true, but after opening the panel Escape never closes it. Why?`,
      code: `function Panel() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return <>{/* toggle button and panel */}</>;
}`,
      lang: "tsx",
      ans: `Stale closure: the listener was created in the first render, where <code>open</code> is <code>false</code>, and <code>[]</code> means it is never replaced. Add <code>open</code> to deps (or drop the check and call <code>setOpen(false)</code> unconditionally).`,
      why: `<p>The effect reads <code>open</code>, so the lint rule flags it as a missing dependency. With <code>[open]</code>, React removes the old listener and adds one that sees the current value each time <code>open</code> changes. Here the condition is unnecessary anyway: <code>setOpen(false)</code> when already closed bails out without re-rendering, which lets you keep <code>[]</code> honestly. With React 19.2+ you could also move the logic into a <code>useEffectEvent</code>.</p>`
    },
    {
      q: `A popover measures its own height to decide whether to open above or below its trigger. On slower laptops users see it flash below and then jump above. Which hook should the measurement use?`,
      code: `useEffect(() => {
  const h = popoverRef.current!.getBoundingClientRect().height;
  setPlacement(triggerRect.top > h ? 'above' : 'below');
}, [triggerRect]);`,
      lang: "tsx",
      ans: `<code>useLayoutEffect</code>: it runs after the DOM is updated but before the browser paints, and a state update inside it re-renders synchronously, so only the final placement is ever painted.`,
      why: `<p><code>useEffect</code> usually runs after paint, so the first frame shows the default <code>'below'</code> placement and the correction arrives one frame later. The layout version blocks paint until the measurement and re-render are done, so keep it cheap. Also replace the non-null assertion with a null check, and in production consider Floating UI, which handles flipping, shifting and scroll containers.</p>`
    }
  ]
}
]});
