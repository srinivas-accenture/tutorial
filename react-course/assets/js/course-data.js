/* Course map (weeks → days → topics with search keywords), interview map, career ladder and glossary.
   Single source of truth: the sidebar, home page, router and pager all read from here.
   Topic ids must match the ids in content/weekN.js. */
window.JSC = window.JSC || {};
JSC.COURSE=[
{w:1,title:"React foundations",sub:"Why React exists, a Vite + TypeScript setup, JSX, components and props, state and events, the render model, effects and refs",days:[
{n:1,t:"Why React, and your first app",tp:[["d1-why-react","What React solves: declarative UI, components and the virtual DOM","ui = f(state) declarative imperative dom virtual dom library framework spa ecosystem"],["d1-setup","Project setup: Vite, TypeScript, JSX compilation and StrictMode","vite create-vite npm scripts tsconfig jsx runtime babel swc createRoot strictmode devtools project structure"]]},
{n:2,t:"JSX and components",tp:[["d2-jsx","JSX in depth: expressions, conditionals, lists and keys","jsx expression fragment conditional rendering ternary && map key list className style dangerouslySetInnerHTML"],["d2-components-props","Components, props, children and composition","function component props children composition destructuring default props purity reusable component typescript props"]]},
{n:3,t:"State and events",tp:[["d3-state","State with useState: snapshots, batching and immutable updates","usestate state snapshot batching updater function immutable update object array spread re-render"],["d3-events-forms","Events and forms: handlers, controlled and uncontrolled inputs","onclick onchange onsubmit synthetic event preventdefault propagation controlled uncontrolled input form select checkbox"]]},
{n:4,t:"The render model and state design",tp:[["d4-rendering","Rendering: trigger, render, commit, reconciliation and identity","render commit reconciliation diff key identity preserve reset state position re-render parent children"],["d4-state-structure","Structuring state: lifting state, derived values and useReducer","lift state up single source of truth derived state redundant state normalize usereducer reducer action dispatch"]]},
{n:5,t:"Effects and refs",tp:[["d5-effects","Effects with useEffect: synchronising with the outside world","useeffect dependencies cleanup subscription strictmode double invoke race you might not need an effect stale closure"],["d5-refs","Refs and the DOM: useRef, ref as a prop, useLayoutEffect","useref dom ref focus scroll forwardref ref prop useimperativehandle uselayouteffect measure mutable value"]]}]},
{w:2,title:"Building real applications",sub:"Context and state management, data fetching against a FastAPI backend, routing and auth, forms, styling and accessibility, custom hooks and component patterns",days:[
{n:6,t:"Sharing state",tp:[["d6-context","Context: avoiding prop drilling without hurting performance","createcontext usecontext provider prop drilling theme auth split context value memo re-render"],["d6-state-libs","State management: client vs server state, Redux Toolkit, Zustand","redux toolkit rtk slice store zustand jotai global state server state client state url state selector"]]},
{n:7,t:"Data fetching",tp:[["d7-fetching","Fetching data: effects, race conditions, Suspense and use()","fetch useeffect abortcontroller race condition loading error suspense use promise waterfall fastapi cors"],["d7-tanstack-query","TanStack Query: caching, mutations and optimistic updates","react query usequery usemutation querykey cache stale time invalidation optimistic update pagination infinite"]]},
{n:8,t:"Routing and authentication",tp:[["d8-routing","Routing with React Router: nested layouts, params, loaders and actions","react router browserrouter createbrowserrouter route outlet link navlink useparams usenavigate loader action search params"],["d8-auth","Authentication, protected routes and code splitting","auth jwt cookie httponly protected route redirect login refresh token lazy suspense code splitting fastapi"]]},
{n:9,t:"Forms, styling and accessibility",tp:[["d9-forms","Forms at scale: React Hook Form, Zod and React 19 actions","react hook form zod validation useactionstate useformstatus useoptimistic form action server error"],["d9-styling-a11y","Styling and accessibility in React","css modules tailwind css-in-js styled components design tokens accessibility aria label focus portal modal keyboard"]]},
{n:10,t:"Custom hooks and component patterns",tp:[["d10-custom-hooks","Custom hooks and the rules of hooks","rules of hooks custom hook usedebounce uselocalstorage usesyncexternalstore extract logic linter"],["d10-patterns","Component patterns: compound, headless, render props and error boundaries","compound components render props higher-order component hoc headless controlled uncontrolled api error boundary slots"]]}]},
{w:3,title:"Performance, internals and architecture",sub:"Memoisation and the React Compiler, profiling, Fiber and concurrent rendering, SSR and Server Components, testing, TypeScript with React, production architecture and the interview bootcamp",days:[
{n:11,t:"Performance",tp:[["d11-memo","Memoisation: React.memo, useMemo, useCallback and the React Compiler","react.memo usememo usecallback referential equality react compiler unnecessary re-render props stability"],["d11-perf-tools","Measuring performance: Profiler, virtualisation, code splitting and Web Vitals","profiler devtools why did this render virtualization windowing tanstack virtual lazy bundle analyzer lcp inp cls"]]},
{n:12,t:"React internals",tp:[["d12-fiber","Fiber: the work loop, reconciliation and lanes","fiber tree work loop current workinprogress double buffering reconciliation diffing heuristics lanes priority commit phase"],["d12-concurrent","Concurrent React: transitions, deferred values and Suspense","concurrent rendering usetransition starttransition usedeferredvalue suspense boundary interruptible rendering tearing"]]},
{n:13,t:"Server rendering",tp:[["d13-ssr","Rendering strategies: CSR, SSR, SSG, streaming and hydration","client side rendering server side rendering static generation isr streaming hydration mismatch hydrateroot seo"],["d13-rsc","Server Components, Server Functions and Next.js App Router","react server components use client use server server actions next.js app router layout caching rsc payload"]]},
{n:14,t:"Testing and TypeScript",tp:[["d14-testing","Testing React: Vitest, Testing Library, MSW and Playwright","vitest jest react testing library user-event screen getbyrole msw mock service worker playwright e2e"],["d14-typescript-react","TypeScript with React: props, events, generics, refs and context","typescript props type event types generic component ref type context type componentprops discriminated union props"]]},
{n:15,t:"Architecture and interviews",tp:[["d15-architecture","Production architecture: structure, design systems, deployment and monitoring","feature folders design system monorepo micro-frontends env config docker nginx cdn sentry feature flags fastapi"],["d15-interview","Interview bootcamp: machine coding and frontend system design","machine coding round system design frontend interview questions autocomplete infinite scroll trade-offs"]]}]}
];

/* Interview map: [round, what they test, days, how to prepare] */
JSC.EXAM=[
["React fundamentals","JSX, props vs state, keys, controlled inputs, why a component re-rendered","Days 2-4","Explain the render → commit cycle and state snapshots out loud; predict output of small snippets."],
["Hooks deep dive","useEffect dependencies and cleanup, stale closures, refs, custom hooks, rules of hooks","Days 3, 5, 10","Rewrite effects you don't need; build useDebounce, useFetch and useLocalStorage from memory."],
["Machine coding","Build a working widget in 45-90 minutes: todo list, autocomplete, tabs, modal, infinite scroll, form","Days 3-10, 15","Practise each Day 15 exercise against a timer: state shape first, then accessibility, then edge cases."],
["Performance","Unnecessary re-renders, memoisation, virtualisation, code splitting, Web Vitals","Days 11-12","Profile a slow list, fix it, and explain what you measured before and after."],
["Internals and modern React","Fiber, reconciliation, concurrent rendering, Suspense, SSR, hydration, Server Components","Days 12-13","Draw the fiber tree and the hydration timeline; explain when a transition is interrupted."],
["Frontend system design","Architecture of a real app: data layer, caching, routing, auth, testing, deployment, monitoring","Days 6-8, 14-15","Use the Day 15 framework on a news feed, a dashboard and a chat app."]
];

JSC.LADDER=[
["Fresher","Days 1-5","Build components with props and state, render lists with stable keys, handle events and controlled forms, and explain why a component re-renders."],
["Mid-level","Days 1-10","Design state well, use effects only to sync with external systems, fetch and cache data with TanStack Query, route with nested layouts, and write custom hooks."],
["Senior","Days 6-14","Diagnose performance with the Profiler, choose the right state tool, build accessible reusable components, test behaviour (not implementation), and type components precisely."],
["Lead","Days 9-15","Set team conventions (folder structure, design system, lint rules, testing pyramid), review for re-render and effect bugs, and plan migrations (React 19, the Compiler, Router upgrades)."],
["Architect","Days 12-15","Choose CSR/SSR/RSC per route, design the data and caching layer against FastAPI, plan deployment, monitoring and micro-frontend boundaries, and justify the trade-offs."]
];

JSC.GLOSSARY=[
["Component","A function that returns UI (JSX). React calls it to find out what to show."],
["JSX","HTML-like syntax inside JavaScript that compiles to <code>jsx()</code> calls producing React elements."],
["React element","A plain object describing what to render (<code>type</code>, <code>props</code>, <code>key</code>). Cheap to create; not a DOM node."],
["Props","Read-only inputs passed from a parent to a child component."],
["State","Data owned by a component that changes over time; setting it schedules a re-render."],
["Snapshot","The state values for one render. Event handlers see the snapshot of the render they were created in."],
["Batching","React groups several state updates in the same event into one re-render."],
["Render phase","React calls your components and computes what changed. Must be pure; may be repeated or discarded."],
["Commit phase","React applies the changes to the DOM, then runs layout effects and schedules effects."],
["Reconciliation","Comparing the new element tree with the previous one to decide which DOM changes to make."],
["Key","A stable identity for an item in a list, so React can match items between renders."],
["Virtual DOM","Informal name for the in-memory element/fiber tree React diffs instead of touching the real DOM."],
["Fiber","React's internal unit of work: one node per component instance, holding state, props and effects."],
["Lanes","React's bitmask priority system that decides which updates to render first."],
["Hook","A function starting with <code>use</code> that lets components use React features (state, effects, context…)."],
["Rules of hooks","Call hooks only at the top level of components or custom hooks, never conditionally, so their call order is stable."],
["Effect","Code that runs after commit to synchronise with something outside React (network, DOM APIs, subscriptions)."],
["Cleanup function","The function an effect returns; React runs it before the next effect run and on unmount."],
["Stale closure","A function that captured an old render's values and keeps using them."],
["Ref","A mutable box (<code>useRef</code>) that persists across renders without causing re-renders; often holds a DOM node."],
["Controlled input","An input whose value comes from React state and changes only through <code>onChange</code>."],
["Uncontrolled input","An input that keeps its own value in the DOM; you read it with a ref or <code>FormData</code>."],
["Lifting state up","Moving state to the closest common parent so siblings can share it."],
["Derived state","A value computed from props or state during render instead of being stored separately."],
["Reducer","A pure function <code>(state, action) → newState</code> used with <code>useReducer</code>."],
["Context","A way to pass a value deep down the tree without props; every consumer re-renders when the value changes."],
["Prop drilling","Passing props through many layers that don't use them, just to reach a deep child."],
["Server state","Data owned by the backend (cached copies in the client), managed best by tools like TanStack Query."],
["Query key","The array that identifies cached data in TanStack Query, e.g. <code>['todos', userId]</code>."],
["Optimistic update","Showing the expected result immediately and rolling back if the server request fails."],
["Suspense","A boundary that shows a fallback while children wait for code or data to load."],
["Transition","A non-urgent update (<code>startTransition</code>) that React can interrupt to keep the UI responsive."],
["Concurrent rendering","React can prepare several versions of the UI and pause, resume or abandon a render."],
["Memoisation","Caching a result (<code>useMemo</code>), function (<code>useCallback</code>) or component render (<code>React.memo</code>) until inputs change."],
["React Compiler","A build-time tool that adds memoisation automatically to components and hooks that follow the rules of React."],
["Error boundary","A component that catches rendering errors in its subtree and shows a fallback UI."],
["Portal","Rendering children into a different DOM node (e.g. <code>document.body</code>) while keeping React context and events."],
["Code splitting","Loading parts of the bundle on demand, e.g. with <code>React.lazy</code> and dynamic <code>import()</code>."],
["Virtualisation","Rendering only the visible rows of a long list."],
["SSR","Server-side rendering: HTML is generated on the server per request, then hydrated in the browser."],
["SSG","Static site generation: HTML is generated at build time."],
["Hydration","Attaching React's event handlers and state to server-rendered HTML in the browser."],
["Streaming SSR","Sending HTML in chunks as Suspense boundaries resolve, instead of waiting for the whole page."],
["Server Component","A component that runs only on the server (or at build time) and sends a serialised result; its code never ships to the browser."],
["Server Function","A server-side function marked <code>'use server'</code> that client code can call like an async function (Server Actions when used in forms)."],
["StrictMode","A development-only wrapper that double-invokes renders and effects to surface impure code and missing cleanups."],
["Vite","The dev server and bundler most new React apps use: native ES modules in dev, Rollup-based production builds."],
["Testing Library","Tests components through what users see and do (roles, labels, clicks), not implementation details."],
["MSW","Mock Service Worker: intercepts network requests in tests and dev to return mock responses."],
["Web Vitals","User-centric performance metrics: LCP (loading), INP (responsiveness), CLS (visual stability)."]
];
