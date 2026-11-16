/* Week 12: HTML & CSS foundations — content only. Rendered by assets/js/render.js; loaded on demand by assets/js/app.js. */
JSC.registerWeek({w:12,revision:[
"<b>Semantic HTML:</b> doctype, <code>lang</code>, charset and viewport first; landmarks (<code>&lt;header&gt;</code> banner, <code>&lt;nav&gt;</code>, one <code>&lt;main&gt;</code>, <code>&lt;aside&gt;</code>, <code>&lt;footer&gt;</code> contentinfo; header/footer inside article/section aren't landmarks); one h1 and headings without skipped levels; real <code>&lt;button&gt;</code>/<code>&lt;a&gt;</code> instead of clickable divs; ARIA adds meaning, never behavior.",
"<b>Forms:</b> visible <code>&lt;label for&gt;</code> for every control (placeholder is not a label); right <code>type</code>/<code>inputmode</code>/<code>autocomplete</code>; fieldset + legend for groups; constraint validation (<code>validity</code>, <code>setCustomValidity</code>, <code>:user-invalid</code>); only named, enabled controls submit; <code>requestSubmit()</code> over <code>submit()</code>; always validate on the server.",
"<b>Images and media:</b> width/height on every image (aspect-ratio reserves space, no CLS); srcset with <code>w</code> descriptors + <code>sizes</code>; <code>&lt;picture&gt;</code> for AVIF/WebP and art direction; lazy-load below the fold, never the LCP image (use <code>fetchpriority=\"high\"</code>); meaningful alt or <code>alt=\"\"</code> for decoration; captions for video.",
"<b>Cascade:</b> origin/importance → inline style → <code>@layer</code> (later wins, unlayered beats all, !important reverses) → specificity (IDs, classes, types; <code>:is</code> = max argument, <code>:where</code> = 0) → scope proximity → order. Text properties inherit; <code>initial</code> ≠ browser default (<code>revert</code> is).",
"<b>Box model:</b> <code>border-box</code> globally; vertical margins collapse (not in flex/grid; <code>flow-root</code> stops it); % padding is based on width; positioning: relative/absolute/fixed/sticky and their containing blocks (transform captures fixed children); z-index only competes within a stacking context (created by z-index, opacity, transform, isolation, fixed/sticky); use the top layer for overlays.",
"<b>Flexbox:</b> one dimension; size = basis, then grow shares free space, shrink removes overflow weighted by shrink × basis; <code>flex: 1</code> = <code>1 1 0%</code>, <code>flex: auto</code> = <code>1 1 auto</code>; <code>min-width: 0</code> fixes overflow from long content; <code>margin-left: auto</code> pushes; order is visual only.",
"<b>Grid:</b> two dimensions; <code>fr</code> shares leftover space; <code>1fr</code> = <code>minmax(auto, 1fr)</code> (use <code>minmax(0, 1fr)</code>); <code>repeat(auto-fit, minmax(min(15rem, 100%), 1fr))</code> for galleries; named areas; <code>1 / -1</code> spans; subgrid aligns card parts.",
"<b>Responsive:</b> intrinsic first, container queries for components (<code>container-type: inline-size</code>, <code>cqi</code>), media queries for page layout and preferences (color scheme, reduced motion, hover/pointer); rem for type and breakpoints; <code>clamp()</code> with a rem term; <code>svh/dvh</code> for mobile heights; logical properties for RTL.",
"<b>Modern CSS:</b> custom properties cascade and inherit at runtime (fallback only when undefined; bad values are invalid at computed time → unset); <code>@property</code> for typed, animatable tokens; <code>:has()</code> styles parents from child state; native nesting (<code>&amp;</code> is not concatenation); <code>oklch()</code>, <code>color-mix()</code>, relative colors, <code>light-dark()</code>.",
"<b>Motion and architecture:</b> animate <code>transform</code>/<code>opacity</code> (compositor), avoid layout properties; <code>@starting-style</code> + <code>allow-discrete</code> for entry/exit; View Transitions as progressive enhancement; always honor <code>prefers-reduced-motion</code>. Architecture: layers + tokens + one component strategy (BEM, utilities, CSS Modules or <code>@scope</code>), enforced by linting; keep render-blocking CSS small and use <code>content-visibility</code>/<code>contain</code> for big pages."
],days:[
{n:56,title:"Semantic HTML",goal:"Write HTML that means something: correct document structure, landmarks, headings, forms and media that work for every user, every device and every crawler.",topics:[
{id:"d56-semantic-html",title:"Semantic HTML: document structure, landmarks and headings",lv:["fresher","mid","senior"],
eli5:`<p>A book has a <b>cover</b>, a <b>table of contents</b>, <b>chapters</b> with titles, and an <b>index</b> at the back. You can find things fast because every part has a known job. A web page is the same: <code>&lt;header&gt;</code> is the cover, <code>&lt;nav&gt;</code> is the table of contents, <code>&lt;main&gt;</code> holds the chapters, <code>&lt;h1&gt;</code>–<code>&lt;h6&gt;</code> are the chapter and section titles and <code>&lt;footer&gt;</code> is the back page. If you build the whole book out of plain blank pages (<code>&lt;div&gt;</code>s), it might <i>look</i> the same, but a blind reader's screen reader, a search engine and even your future self can't find anything.</p>`,
why:`<p>HTML is the contract between your page and everything that reads it: browsers (default behavior, focus, keyboard support), assistive technology (the <b>accessibility tree</b> is built from your elements), search engines and link previews, reader modes, translation tools and AI agents. Choosing the right element gives you behavior and accessibility <i>for free</i>; choosing <code>&lt;div&gt;</code> means re-implementing it by hand and usually getting it wrong. Accessibility is also a legal requirement in many markets (WCAG 2.2 AA is the usual target, e.g. under the European Accessibility Act).</p>`,
tech:`<ul class="pts"><li><b>Document skeleton:</b> <code>&lt;!DOCTYPE html&gt;</code> (standards mode, not quirks mode), <code>&lt;html lang="en"&gt;</code> (pronunciation, translation, hyphenation), <code>&lt;meta charset="utf-8"&gt;</code> first in <code>&lt;head&gt;</code>, <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code>, a unique <code>&lt;title&gt;</code>, then CSS, then scripts with <code>defer</code> or <code>type="module"</code>.</li><li><b>Landmarks</b> (screen-reader users jump between them): <code>&lt;header&gt;</code> = <i>banner</i> only when it is not inside <code>&lt;article&gt;/&lt;aside&gt;/&lt;main&gt;/&lt;nav&gt;/&lt;section&gt;</code>; <code>&lt;nav&gt;</code> = navigation; <code>&lt;main&gt;</code> = main (exactly one visible per page); <code>&lt;aside&gt;</code> = complementary; <code>&lt;footer&gt;</code> = contentinfo (same scoping rule as header); <code>&lt;form&gt;</code> and <code>&lt;section&gt;</code> become landmarks only when they have an accessible name (<code>aria-label</code>/<code>aria-labelledby</code>); <code>&lt;search&gt;</code> = search.</li><li><b>Sectioning content:</b> <code>&lt;article&gt;</code> is self-contained and would make sense syndicated on its own (a post, a product card, a comment); <code>&lt;section&gt;</code> is a thematic group that should have a heading; <code>&lt;div&gt;</code> is for styling hooks with no meaning.</li><li><b>Headings:</b> one <code>&lt;h1&gt;</code> describing the page, then nested levels without skipping (h2 → h3, not h2 → h4). The "outline algorithm" where every <code>&lt;section&gt;</code> restarts at h1 was <b>never implemented</b> by browsers or screen readers and has been removed from the spec, so the heading level you write is the level users get. Choose levels for structure, then style them with CSS.</li><li><b>Text semantics:</b> <code>&lt;p&gt;</code>, <code>&lt;ul&gt;/&lt;ol&gt;/&lt;li&gt;</code>, <code>&lt;dl&gt;/&lt;dt&gt;/&lt;dd&gt;</code> (key–value pairs), <code>&lt;blockquote&gt;</code>/<code>&lt;cite&gt;</code>, <code>&lt;figure&gt;</code>/<code>&lt;figcaption&gt;</code>, <code>&lt;time datetime="2026-11-16"&gt;</code>, <code>&lt;abbr&gt;</code>, <code>&lt;code&gt;</code>/<code>&lt;kbd&gt;</code>/<code>&lt;pre&gt;</code>, <code>&lt;strong&gt;</code> (importance) vs <code>&lt;b&gt;</code> (stylistic offset), <code>&lt;em&gt;</code> (stress) vs <code>&lt;i&gt;</code> (alternate voice), <code>&lt;mark&gt;</code>, <code>&lt;address&gt;</code> (contact info for the nearest article/body).</li><li><b>Interactive elements:</b> <code>&lt;a href&gt;</code> navigates, <code>&lt;button&gt;</code> does something. Both are focusable and keyboard-operable out of the box (Enter for links; Enter and Space for buttons). A <code>&lt;div onclick&gt;</code> is not focusable, has no role and ignores the keyboard. <code>&lt;button&gt;</code> defaults to <code>type="submit"</code> inside forms. <code>&lt;details&gt;/&lt;summary&gt;</code> gives a native disclosure; <code>&lt;dialog&gt;</code> with <code>showModal()</code> gives a modal with focus handling, Esc to close and an inert background; the <code>popover</code> attribute gives light-dismiss popups in the top layer.</li><li><b>ARIA's first rule:</b> don't use ARIA if a native element exists. ARIA changes only what assistive tech is told; it adds <b>no behavior</b> (<code>role="button"</code> doesn't make a div focusable or clickable by keyboard). "No ARIA is better than bad ARIA."</li><li><b>Metadata that matters:</b> <code>&lt;meta name="description"&gt;</code>, <code>&lt;link rel="canonical"&gt;</code>, Open Graph tags for link previews, <code>&lt;link rel="icon"&gt;</code>, structured data (JSON-LD) for rich results, <code>&lt;meta name="color-scheme" content="light dark"&gt;</code>.</li></ul>`,
diagram:{html:lanes([["&lt;header&gt; (banner)",["logo / site name","&lt;nav&gt; (navigation)","&lt;search&gt; form"]],["&lt;main&gt; (main)",["&lt;h1&gt; page title","&lt;article&gt; + &lt;h2&gt;","&lt;section&gt; + &lt;h3&gt;","&lt;figure&gt; + &lt;figcaption&gt;"]],["&lt;aside&gt; (complementary)",["related links","&lt;h2&gt; heading"]],["&lt;footer&gt; (contentinfo)",["&lt;address&gt;","legal links"]]]),steps:["The browser turns elements into a DOM tree and, from it, an <b>accessibility tree</b> of roles, names and states.","Landmarks (banner, navigation, main, complementary, contentinfo) let screen-reader users jump straight to a region.","Headings form a second navigation layer: users list all headings and jump by level, so levels must nest without gaps.","Inside <code>&lt;article&gt;</code> or <code>&lt;section&gt;</code>, <code>&lt;header&gt;</code>/<code>&lt;footer&gt;</code> are just groups, not page landmarks."]},
ex:[{t:"A tiny landmark and heading auditor (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const html = '<header><a href="/">Shop</a><nav aria-label="Primary"><a href="/new">New</a></nav></header>' +
  '<main><h1>Running shoes</h1>' +
  '<article><header><h2>Trail Pro</h2></header><p>Grippy.</p><h4>Specs</h4><footer>In stock</footer></article>' +
  '<section aria-label="Reviews"><h2>Reviews</h2><img src="x.png"></section>' +
  '<div class="btn" onclick="buy()">Buy</div></main>' +
  '<aside><h2>Related</h2></aside><footer>(c) 2026</footer>';
const doc = new DOMParser().parseFromString(html, "text/html");

// implicit roles for the landmark elements (header/footer only count at "page" level)
const scoped = "article, aside, main, nav, section";
const landmark = (el) => {
  const tag = el.localName;
  if (tag === "main") return "main";
  if (tag === "nav") return "navigation";
  if (tag === "aside") return "complementary";
  if (tag === "header" && !el.parentElement.closest(scoped)) return "banner";
  if (tag === "footer" && !el.parentElement.closest(scoped)) return "contentinfo";
  if ((tag === "section" || tag === "form") && (el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby"))) return "region/form";
  return null;
};
const found = [...doc.body.querySelectorAll("*")].map(landmark).filter(Boolean);
console.log("landmarks:", found.join(", "));
check("page-level header and footer are banner and contentinfo", found.filter((r) => r === "banner").length === 1 && found.filter((r) => r === "contentinfo").length === 1);
check("the article's own header/footer are NOT landmarks", found.length === 6);

// heading levels must not skip (h2 -> h4 is a skip)
const levels = [...doc.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.localName[1]);
const skips = levels.filter((l, i) => i > 0 && l > levels[i - 1] + 1);
console.log("heading levels:", levels.join(" "));
check("auditor detects the h2 -> h4 skip", skips.length === 1 && skips[0] === 4);
check("exactly one h1", levels.filter((l) => l === 1).length === 1);

// images need alt; clickable divs are not buttons
const noAlt = [...doc.images].filter((img) => !img.hasAttribute("alt"));
check("auditor finds the image without alt", noAlt.length === 1);
const fakeButtons = [...doc.querySelectorAll("[onclick]")].filter((el) => !/^(button|a|input|select|textarea|summary)$/.test(el.localName));
check("auditor finds the div pretending to be a button", fakeButtons.length === 1 && fakeButtons[0].tabIndex === -1);
const real = document.createElement("button");
check("a real <button> is focusable by default (tabIndex 0)", real.tabIndex === 0);`},
{t:"Native beats custom: button vs div, details, dialog (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const box = document.createElement("div");
box.innerHTML = '<form><input name="q" value="shoes"><button>Search</button><button type="button">Clear</button></form>' +
  '<details><summary>Shipping</summary><p>Free over $50</p></details>' +
  '<dialog><p>Saved!</p><form method="dialog"><button value="ok">OK</button></form></dialog>';
document.body.append(box);
const [submitBtn, plainBtn] = box.querySelectorAll("form:first-child button");
check("a <button> in a form defaults to type=submit", submitBtn.type === "submit");
check("type=button opts out of submitting", plainBtn.type === "button");
let submits = 0;
box.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); submits++; });
submitBtn.click();      // click() on a submit button submits its form
plainBtn.click();
check("only the submit button submitted the form", submits === 1);

const details = box.querySelector("details");
check("<details> starts closed", details.open === false);
box.querySelector("summary").click();
check("clicking <summary> toggles it, no JS needed", details.open === true);

const dialog = box.querySelector("dialog");
dialog.showModal();
check("showModal() opens the dialog in the top layer", dialog.open && dialog.matches(":modal"));
dialog.querySelector("button").click();   // form method=dialog closes it and sets returnValue
check("form method=dialog closes it with returnValue", !dialog.open && dialog.returnValue === "ok");
box.remove();`},
{t:"A well-structured page skeleton (reference HTML)",code:`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Trail Pro running shoe | Shop</title>
  <meta name="description" content="Lightweight trail shoe with a grippy outsole.">
  <link rel="canonical" href="https://shop.example/shoes/trail-pro">
  <link rel="stylesheet" href="/app.css">
  <script type="module" src="/app.js"><\/script>   <!-- modules are deferred -->
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header>
    <a href="/">Shop</a>
    <nav aria-label="Primary"><ul><li><a href="/new" aria-current="page">New</a></li></ul></nav>
    <search><form action="/search"><label for="q">Search</label><input id="q" name="q" type="search"></form></search>
  </header>
  <main id="main">
    <h1>Trail Pro</h1>
    <article>
      <h2>Specs</h2>
      <dl><dt>Weight</dt><dd>280 g</dd><dt>Drop</dt><dd>6 mm</dd></dl>
      <p>Released <time datetime="2026-03-01">March 2026</time>.</p>
    </article>
    <section aria-labelledby="rev"><h2 id="rev">Reviews</h2>...</section>
  </main>
  <aside aria-label="Related products">...</aside>
  <footer><address><a href="mailto:help@shop.example">help@shop.example</a></address></footer>
</body>
</html>`,run:false}],
browser:`<p>In Chrome/Edge DevTools open <b>Elements → Accessibility</b> and enable the full-page accessibility tree to see roles and computed names; Firefox has a dedicated <b>Accessibility</b> panel with a "Check for issues" audit; Safari's Elements panel shows role and label per node. Lighthouse and axe DevTools catch missing alt text, labels, contrast and landmark issues (automated tools find roughly a third of real problems, so also test with a keyboard and a screen reader: VoiceOver on macOS/iOS, NVDA on Windows, TalkBack on Android). <code>&lt;search&gt;</code>, <code>popover</code> and <code>&lt;dialog&gt;</code> are supported in all current engines. Node has no DOM: server-side rendering (Week 6) produces this HTML as strings, and tools like jsdom or happy-dom emulate the DOM for tests but don't compute layout or a full accessibility tree.</p>`,
gotchas:[`<code>&lt;header&gt;</code> and <code>&lt;footer&gt;</code> are landmarks only at page level; inside <code>&lt;article&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;aside&gt;</code> or <code>&lt;nav&gt;</code> they are plain groups.`,`<code>&lt;section&gt;</code> without an accessible name is not a landmark; wrapping everything in sections adds nothing.`,`The HTML "document outline" (sections resetting heading levels) never worked in any screen reader and was removed from the spec; an <code>&lt;h1&gt;</code> inside a nested section is still announced as level 1.`,`<code>&lt;button&gt;</code> inside a <code>&lt;form&gt;</code> defaults to <code>type="submit"</code>; a "Cancel" button without <code>type="button"</code> submits the form.`,`<code>display: contents</code> historically removed elements from the accessibility tree (lists, tables, buttons); engines have fixed most cases, but test before using it on semantic elements.`,`<code>role="button"</code> on a div adds no keyboard support or focusability; you must add <code>tabindex="0"</code>, Enter/Space handlers and disabled logic yourself (so just use <code>&lt;button&gt;</code>).`,`Positive <code>tabindex</code> values (1, 2, ...) override the natural order and create chaos; use only <code>0</code> and <code>-1</code>.`,`Links that look like buttons and buttons that navigate confuse users: "where am I going" (link) vs "what will happen" (button).`],
best:[`Start with the right element; reach for ARIA only to describe things HTML can't (live regions, tabs, combobox state) and follow the ARIA Authoring Practices patterns.`,`Exactly one <code>&lt;main&gt;</code>, one <code>&lt;h1&gt;</code>, headings in order, labelled <code>&lt;nav&gt;</code>s when there is more than one, and a "skip to content" link.`,`Keep DOM order equal to visual and reading order; never fix order only with CSS (<code>order</code>, grid placement) because keyboard and screen-reader order follows the DOM.`,`Automate checks (axe in unit/E2E tests, Lighthouse CI), then do manual keyboard and screen-reader passes for key flows.`],
iq:[["fresher","What is semantic HTML and why does it matter?","Using elements for their meaning (nav, main, article, button, h1–h6) instead of generic divs. It gives built-in behavior (focus, keyboard, form submission), builds a correct accessibility tree for assistive tech, helps SEO and link previews, and makes code easier to read and style."],["fresher","Difference between <code>&lt;article&gt;</code>, <code>&lt;section&gt;</code> and <code>&lt;div&gt;</code>?","article is self-contained content that makes sense on its own (post, card, comment); section is a thematic grouping that normally has a heading; div has no meaning and is used for styling or scripting hooks."],["mid","What are landmarks and how do screen-reader users use them?","Regions with roles (banner, navigation, main, complementary, contentinfo, search, region, form) derived from header, nav, main, aside, footer, search and named section/form. Screen readers list them and jump between them, like a table of contents for the page; headings provide the second level of navigation."],["mid","Why is <code>&lt;div onclick&gt;</code> worse than <code>&lt;button&gt;</code>?","The div is not focusable, has no role, ignores Enter/Space, isn't disabled by fieldset, doesn't participate in forms and is invisible to voice-control users. Fixing all that needs tabindex, role, key handlers and state, which a button gives for free."],["senior","When is ARIA appropriate and what are its risks?","When native HTML can't express a pattern (tabs, combobox, tree, live regions, aria-expanded on a custom disclosure). ARIA only changes the accessibility tree, not behavior, so wrong or partial ARIA misleads users (e.g. role=menu without arrow-key support). Prefer native elements, follow APG patterns and test with real screen readers."],["lead","How would you raise the accessibility baseline of a large app?","Agree a target (WCAG 2.2 AA), build accessible primitives once in the design system (button, dialog, menu, form field), add axe to unit/E2E tests and Lighthouse CI, lint JSX/templates, include keyboard and screen-reader checks in the definition of done, train the team and track issues like bugs with severity."]],
practice:[`Take any page you built earlier in this course and run the auditor example on its <code>document.body.innerHTML</code>; fix every skip, missing alt and fake button.`,`Navigate a news site using only the keyboard and then with a screen reader's landmark and heading lists; write down three things that helped and three that blocked you.`,`Rebuild a "card" component that is a clickable div into an <code>&lt;article&gt;</code> with a real link in its heading (and a stretched pseudo-element for the click area).`],
teach:`<p>"HTML is a book's structure: cover, contents, chapters, back page. Use header, nav, main, aside and footer for the regions, one h1 and nested headings for the chapters, and real buttons and links for actions. The browser gives you keyboard support and a screen-reader map for free; a div gives you nothing."</p>`},

{id:"d56-html-media-forms",title:"Forms, images and media markup",lv:["fresher","mid","senior"],
eli5:`<p>A form is a <b>paper form at the post office</b>: every box has a printed label next to it, some boxes only accept dates or numbers, related boxes are grouped in a bordered area with a title ("Sender's address"), and the clerk checks it before accepting it. Pictures on a page are like <b>photos in a newspaper</b>: the editor picks the right size for the page (not a giant poster squeezed small), keeps a space of the right shape so the text doesn't jump when the photo arrives, and writes a caption for readers who can't see it.</p>`,
why:`<p>Forms are where users give you money and data; bad form markup loses both (wrong keyboards on mobile, labels that don't announce, validation nobody can read). Images are usually the largest bytes on a page and the most common Largest Contentful Paint (LCP) element, and images without dimensions are a top cause of Cumulative Layout Shift (CLS). Correct markup fixes both with no JavaScript.</p>`,
tech:`<ul class="pts"><li><b>Labels:</b> every control needs an accessible name. Prefer <code>&lt;label for="id"&gt;</code> (or wrapping the input); clicking the label focuses/toggles the control, enlarging the hit target. Placeholder is <b>not</b> a label (it disappears and often has poor contrast). Use <code>aria-describedby</code> for hints and error text.</li><li><b>Input types</b> give the right mobile keyboard, built-in validation and pickers: <code>email</code>, <code>tel</code>, <code>url</code>, <code>number</code> (only for real quantities, not card numbers or zip codes), <code>date</code>/<code>time</code>/<code>datetime-local</code>, <code>search</code>, <code>range</code>, <code>color</code>, <code>file</code> (with <code>accept</code>, <code>multiple</code>), <code>checkbox</code>/<code>radio</code>. Add <code>inputmode</code> (e.g. <code>numeric</code>) and <code>autocomplete</code> tokens (<code>email</code>, <code>given-name</code>, <code>one-time-code</code>, <code>new-password</code>) so browsers and password managers can fill fields.</li><li><b>Grouping:</b> <code>&lt;fieldset&gt;</code> + <code>&lt;legend&gt;</code> groups related controls (radio groups, an address); the legend is announced with each control; <code>&lt;fieldset disabled&gt;</code> disables every control inside. <code>&lt;select&gt;</code>/<code>&lt;optgroup&gt;</code>, <code>&lt;datalist&gt;</code> for suggestions, <code>&lt;output&gt;</code> for computed results, <code>&lt;textarea&gt;</code>.</li><li><b>Constraint validation:</b> <code>required</code>, <code>min/max/step</code>, <code>minlength/maxlength</code>, <code>pattern</code>, typed inputs. JS API: <code>el.validity</code> (<code>valueMissing</code>, <code>typeMismatch</code>, <code>patternMismatch</code>, <code>rangeUnderflow</code>, <code>tooShort</code>, <code>customError</code>...), <code>checkValidity()</code>, <code>reportValidity()</code>, <code>setCustomValidity(msg)</code>; CSS <code>:invalid</code>, <code>:user-invalid</code> (only after the user interacts), <code>:required</code>, <code>:placeholder-shown</code>. <code>novalidate</code> turns off the native UI when you render your own errors. <b>Always validate again on the server.</b></li><li><b>Submission:</b> only controls with a <code>name</code> that are not disabled are submitted; <code>new FormData(form)</code> mirrors that; unchecked checkboxes send nothing. <code>method</code>, <code>action</code>, <code>enctype="multipart/form-data"</code> for files; <code>formaction</code>/<code>formmethod</code> on a specific button; <code>form.requestSubmit()</code> runs validation and fires submit (<code>form.submit()</code> skips both).</li><li><b>Responsive images:</b> <code>srcset</code> with <b>width descriptors</b> (<code>img-480.jpg 480w, img-960.jpg 960w</code>) plus <code>sizes</code> (how wide the image will be displayed, e.g. <code>(min-width: 60rem) 50vw, 100vw</code>) lets the browser pick the best file for the layout and device pixel ratio; <b>density descriptors</b> (<code>1x, 2x</code>) suit fixed-size images. <code>&lt;picture&gt;</code> with <code>&lt;source type="image/avif"&gt;</code>/<code>webp</code> does format fallback, and <code>&lt;source media&gt;</code> does art direction (a different crop on mobile). The inner <code>&lt;img&gt;</code> is required and carries alt, width, height and loading.</li><li><b>Layout stability:</b> always set <code>width</code> and <code>height</code> attributes (the intrinsic size); browsers map them to <code>aspect-ratio</code> so space is reserved before the file loads even with CSS <code>width: 100%; height: auto</code>. Missing dimensions cause CLS.</li><li><b>Loading:</b> <code>loading="lazy"</code> for below-the-fold images and iframes; <b>never</b> lazy-load the LCP/hero image; give it <code>fetchpriority="high"</code> instead (and maybe a preload). <code>decoding="async"</code> lets decoding happen off the critical path.</li><li><b>Alt text:</b> describe the image's <i>purpose</i> in context ("Trail Pro shoe, side view, orange"); <code>alt=""</code> for purely decorative images so screen readers skip them; for a linked image, alt describes the destination; complex charts need a longer description nearby. Missing alt makes screen readers read the file name.</li><li><b>Video and audio:</b> <code>&lt;video controls width height poster preload="metadata"&gt;</code> with multiple <code>&lt;source type&gt;</code> and <code>&lt;track kind="captions" srclang="en"&gt;</code> (WebVTT). Autoplay is only allowed when <code>muted</code> (plus <code>playsinline</code> on iOS); respect reduced motion for background video; provide transcripts for audio.</li></ul>`,
diagram:{html:flow([["&lt;picture&gt;","sources in order"],["&lt;source type=avif&gt;","supported? use it","g"],["&lt;source type=webp&gt;","fallback format","w"],["&lt;img srcset sizes&gt;","pick file by width × DPR","w"],["reserve box","width/height → aspect-ratio","g"],["load (lazy or eager)","LCP image: eager + fetchpriority=high","r"]]),steps:["The browser walks <code>&lt;source&gt;</code> elements top to bottom and uses the first whose <code>type</code>/<code>media</code> matches.","From the chosen <code>srcset</code>, it combines <code>sizes</code> (display width) with the device pixel ratio to choose a candidate file.","The <code>&lt;img&gt;</code> element is always the one rendered; it carries alt, width, height, loading and decoding.","Dimensions reserve layout space immediately, so text doesn't jump when the image arrives (no CLS)."]},
ex:[{t:"Labels, constraint validation, fieldset and FormData (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const form = document.createElement("form");
form.noValidate = true;     // we read validity ourselves instead of showing native bubbles
form.innerHTML =
  '<label for="em">Email</label><input id="em" name="email" type="email" required>' +
  '<label>Age <input name="age" type="number" min="18" max="120"></label>' +
  '<label for="zip">ZIP</label><input id="zip" name="zip" pattern="[0-9]{5}" inputmode="numeric" autocomplete="postal-code">' +
  '<fieldset id="ship"><legend>Shipping</legend><input name="street" value="1 Main St"></fieldset>' +
  '<label><input type="checkbox" name="news"> Newsletter</label>' +
  '<input value="no name, never submitted">';
document.body.append(form);
const $ = (s) => form.querySelector(s);

check("label[for] is linked to its control", $('label[for="em"]').control === $("#em"));
check("wrapping a control in <label> also links it", $('input[name="age"]').labels.length === 1);
check("empty required field: valueMissing", $("#em").validity.valueMissing);
$("#em").value = "ana-at-example";
check("bad email: typeMismatch", $("#em").validity.typeMismatch && !$("#em").checkValidity());
$("#em").value = "ana@example.com";
$('input[name="age"]').value = "16";
check("number below min: rangeUnderflow", $('input[name="age"]').validity.rangeUnderflow);
$('input[name="age"]').value = "30";
$("#zip").value = "12ab5";
check("pattern is anchored to the whole value: patternMismatch", $("#zip").validity.patternMismatch);
$("#zip").value = "12345";
$("#zip").setCustomValidity("We don't ship to that ZIP yet");
check("setCustomValidity makes a field invalid (customError)", $("#zip").validity.customError && !form.checkValidity());
$("#zip").setCustomValidity("");      // empty string clears the custom error
check("clearing the custom message makes the form valid", form.checkValidity());

let fd = new FormData(form);
console.log("submitted keys:", [...fd.keys()].join(", "));
check("unchecked checkbox and unnamed input are not submitted", !fd.has("news") && [...fd.keys()].length === 4);
$("#ship").disabled = true;
fd = new FormData(form);
check("<fieldset disabled> disables (and drops) everything inside", $('input[name="street"]').matches(":disabled") && !fd.has("street"));
form.remove();`},
{t:"Image dimensions prevent layout shift; srcset picks a candidate (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const svg = (w, h, c) => "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><rect width="100%" height="100%" fill="' + c + '"/></svg>');
const wrap = document.createElement("div");
wrap.style.cssText = "position:absolute;left:-9999px;top:0;width:320px";
document.body.append(wrap);

// 1) width/height attributes become an aspect-ratio before the image has loaded
const withDims = document.createElement("img");
withDims.width = 1600; withDims.height = 900;
withDims.style.cssText = "display:block;width:100%;height:auto";
const noDims = document.createElement("img");
noDims.style.cssText = "display:block;width:100%;height:auto";
withDims.alt = noDims.alt = "";
wrap.append(withDims, noDims);
console.log("computed aspect-ratio:", getComputedStyle(withDims).aspectRatio);
check("with width/height: 320px wide reserves 180px of height before any src loads", Math.round(withDims.getBoundingClientRect().height) === 180);
check("without dimensions: no space is reserved (content will jump later)", noDims.getBoundingClientRect().height < 30);

// 2) srcset with density descriptors: the browser picks by devicePixelRatio
const img = document.createElement("img");
img.alt = "demo";
img.srcset = svg(100, 50, "red") + " 1x, " + svg(200, 100, "blue") + " 2x";
img.src = svg(100, 50, "red");
wrap.append(img);
img.decode().then(() => {
  const picked = img.currentSrc.includes("blue") ? "2x (blue)" : "1x (red)";
  console.log("devicePixelRatio", devicePixelRatio, "-> browser chose", picked, "; natural size", img.naturalWidth + "x" + img.naturalHeight);
  check("currentSrc is one of the srcset candidates", /red|blue/.test(decodeURIComponent(img.currentSrc)));
  check("naturalWidth is density-corrected (a 200px file used as 2x reports 100)", img.naturalWidth === 100);
  check("native lazy loading is supported", "loading" in HTMLImageElement.prototype);
}).catch((e) => console.log("decode failed:", e.message))
  .finally(() => wrap.remove());`,note:`The candidate choice belongs to the browser: usually the one closest to <code>devicePixelRatio</code>, but it may pick a denser file (for example one it already has, or on a fast connection). That freedom is the point of <code>srcset</code>: you describe the files, the browser decides.`},
{t:"Production markup: responsive picture, accessible form, captioned video (reference HTML)",code:`<!-- Hero (likely LCP): eager, high priority, modern formats, art-directed crop on small screens -->
<picture>
  <source media="(max-width: 40rem)" type="image/avif"
          srcset="hero-sq-480.avif 480w, hero-sq-960.avif 960w" sizes="100vw">
  <source type="image/avif" srcset="hero-960.avif 960w, hero-1920.avif 1920w" sizes="(min-width: 75rem) 1200px, 100vw">
  <source type="image/webp" srcset="hero-960.webp 960w, hero-1920.webp 1920w" sizes="(min-width: 75rem) 1200px, 100vw">
  <img src="hero-1920.jpg" width="1920" height="1080" alt="Runner on a ridge trail at sunrise"
       fetchpriority="high" decoding="async">
</picture>

<!-- Below the fold: lazy, dimensions always set -->
<img src="card-480.jpg" srcset="card-480.jpg 480w, card-960.jpg 960w" sizes="(min-width: 60rem) 33vw, 100vw"
     width="480" height="320" alt="" loading="lazy">   <!-- decorative: empty alt -->

<form action="/checkout" method="post" novalidate>
  <fieldset>
    <legend>Delivery</legend>
    <label for="name">Full name</label>
    <input id="name" name="name" autocomplete="name" required aria-describedby="name-err">
    <p id="name-err" class="error" hidden>Please enter your name.</p>
    <label for="tel">Phone <span class="hint">(for the courier)</span></label>
    <input id="tel" name="tel" type="tel" autocomplete="tel">
  </fieldset>
  <fieldset>
    <legend>Speed</legend>
    <label><input type="radio" name="speed" value="std" checked> Standard</label>
    <label><input type="radio" name="speed" value="exp"> Express</label>
  </fieldset>
  <button>Place order</button>
</form>

<video controls width="1280" height="720" poster="intro.jpg" preload="metadata">
  <source src="intro.av1.mp4" type='video/mp4; codecs="av01.0.05M.08"'>
  <source src="intro.h264.mp4" type="video/mp4">
  <track kind="captions" src="intro.en.vtt" srclang="en" label="English" default>
  <a href="intro.h264.mp4">Download the video</a>
</video>`,run:false}],
browser:`<p>DevTools <b>Network</b> panel shows which <code>srcset</code> candidate was downloaded (hover an <code>&lt;img&gt;</code> in Elements to see rendered vs intrinsic size and <code>currentSrc</code>); <b>Performance</b> and the Lighthouse report flag the LCP element, layout shifts and "image elements do not have explicit width and height"; Chrome's <b>Rendering → Layout Shift Regions</b> highlights shifts live. Native validation bubbles and date pickers look different in every browser and can't be fully styled; teams often keep the native validation API but render their own error messages. <code>:user-invalid</code>, <code>loading="lazy"</code> and <code>fetchpriority</code> work in all current engines. Customizable <code>&lt;select&gt;</code> (<code>appearance: base-select</code>) is shipping in Chromium and in progress elsewhere, so treat it as progressive enhancement. On the server (Node), you receive forms as <code>application/x-www-form-urlencoded</code> or <code>multipart/form-data</code>; <code>await request.formData()</code> parses both in Node's fetch-compatible <code>Request</code>.</p>`,
gotchas:[`<code>placeholder</code> is not a label: it vanishes on typing, is often low contrast and isn't reliably announced.`,`<code>type="number"</code> is for quantities; for card numbers, ZIP codes or phone numbers use <code>type="text"</code> + <code>inputmode="numeric"</code> (number inputs drop leading zeros, accept "e", and change on mouse-wheel).`,`<code>pattern</code> is implicitly anchored (<code>^(?:...)$</code>) and compiled with the <code>v</code> flag, so some characters must be escaped inside character classes.`,`<code>form.submit()</code> skips validation and the submit event; use <code>form.requestSubmit()</code>.`,`Disabled fields are not submitted; use <code>readonly</code> if the value must be sent but not edited.`,`A <code>srcset</code> with <code>w</code> descriptors but no <code>sizes</code> assumes <code>100vw</code>, so small thumbnails download huge files.`,`<code>loading="lazy"</code> on the hero image delays LCP; lazy-loading needs layout to know the image is near the viewport.`,`Images without <code>width</code>/<code>height</code> (or an aspect-ratio) shift content when they load and hurt CLS.`,`Missing <code>alt</code> makes screen readers read the file name; <code>alt="image of..."</code> is redundant because the role already says "image".`],
best:[`Visible labels for every control, grouped with fieldset/legend; errors linked via <code>aria-describedby</code>, shown next to the field and summarized at the top on submit.`,`Use the right <code>type</code>, <code>inputmode</code> and <code>autocomplete</code> on every field; never block paste in password fields.`,`Every <code>&lt;img&gt;</code> gets width, height and a deliberate alt; responsive images use srcset + sizes and modern formats via <code>&lt;picture&gt;</code>.`,`Hero image: eager + <code>fetchpriority="high"</code>; everything below the fold: <code>loading="lazy"</code>; captions for video and transcripts for audio.`],
iq:[["fresher","How do you associate a label with an input and why?","<code>&lt;label for=\"id\"&gt;</code> matching the input's id, or wrapping the input inside the label. It gives the control an accessible name screen readers announce, and clicking the label focuses or toggles the control (bigger hit target)."],["mid","Explain srcset and sizes.","srcset lists candidate files with their widths (480w, 960w) or densities (1x, 2x). sizes tells the browser how wide the image will display at each breakpoint (before CSS loads). The browser multiplies display width by device pixel ratio and picks a suitable candidate, possibly considering cache and network."],["mid","How do you prevent images from causing layout shift?","Set width and height attributes (browsers derive aspect-ratio from them) or CSS aspect-ratio, and size with width:100%; height:auto. Reserve space for ads/embeds too, and avoid inserting content above existing content after load."],["senior","How does the constraint validation API work and when would you bypass native UI?","Attributes (required, pattern, min, type) set validity flags readable through el.validity; checkValidity/reportValidity evaluate them; setCustomValidity adds custom errors; :user-invalid styles fields after interaction. Teams use novalidate to render consistent, accessible inline errors while still using the validity API, and always validate again on the server."],["senior","How would you optimize the LCP image of a product page?","Identify it (Lighthouse/Performance panel), serve AVIF/WebP via picture with a right-sized srcset/sizes, don't lazy-load it, add fetchpriority=high (and preload if it's discovered late, e.g. a CSS background), set dimensions, serve from a CDN with caching, and avoid client-side rendering delays before the img exists."],["lead","What would you put in a team's form guidelines?","Visible labels, fieldset/legend for groups, correct type/inputmode/autocomplete, validate on blur and submit (not on every keystroke), error messages linked with aria-describedby plus an error summary, don't disable the submit button silently, keep server validation authoritative, test with keyboard and screen readers."]],
practice:[`Build a sign-up form with email, password (with <code>autocomplete="new-password"</code>), date of birth and a terms checkbox; render your own accessible errors using the <code>validity</code> API and <code>novalidate</code>.`,`Take a page with large images, add width/height, srcset/sizes and a <code>&lt;picture&gt;</code> with AVIF; compare bytes downloaded and CLS before and after in Lighthouse.`,`Add WebVTT captions to a short video and check that they toggle on in two browsers.`],
teach:`<p>"Forms are post-office forms: a printed label on every box, boxes that only accept the right kind of answer, bordered groups with titles, and a clerk who checks it (the browser, then always the server). Images are newspaper photos: pick the right size with srcset and sizes, keep a space the right shape with width and height, and write a caption with alt."</p>`}
],quiz:[
{code:`const i = document.createElement('input');
i.setAttribute('type', 'telephone');
console.log(document.createElement('button').type, i.type, i.getAttribute('type'));`,ans:`submit text telephone`,why:`A button's type defaults to "submit". The <code>type</code> property reflects only known values, so the invalid "telephone" falls back to "text", while <code>getAttribute</code> returns exactly what was written. (The correct type is <code>tel</code>.)`},
{code:`const d = new DOMParser().parseFromString('<label for="e">Email</label><input id="e" type="email" required value="not-an-email">', 'text/html');
const input = d.querySelector('input');
console.log(d.querySelector('label').control === input, input.validity.typeMismatch, input.checkValidity(), input.labels.length);`,ans:`true true false 1`,why:`<code>label.control</code> finds the input by its id; the value isn't a valid email so <code>typeMismatch</code> is true and <code>checkValidity()</code> returns false; <code>input.labels</code> lists the one associated label.`}]},

{n:57,title:"CSS core: cascade and box model",goal:"Predict which CSS rule wins and why, control it with layers instead of specificity wars, and reason precisely about box sizes, positioning and stacking.",topics:[
{id:"d57-cascade",title:"The cascade, specificity, inheritance and @layer",lv:["fresher","mid","senior","lead"],
eli5:`<p>Imagine several people giving a child instructions about what to wear. The <b>browser</b> has defaults ("wear clothes"), the <b>parent</b> (your stylesheet) has rules, and the <b>child</b> can have personal needs ("I need my glasses", user styles). When two instructions clash, there's a fixed order for who wins: first <i>who said it and how firmly</i> (origin and <code>!important</code>), then <i>which team they belong to</i> (layers), then <i>how specific they were</i> ("the kid in the red hat" beats "all kids"), and finally <i>who spoke last</i>. Some things, like the family's language, are <b>inherited</b> by the child automatically; others, like a coat, are not.</p>`,
why:`<p>Almost every "CSS is broken" bug is a cascade bug: a rule that doesn't apply because something more specific, later or in a different layer wins. Teams that don't understand the cascade escalate with <code>!important</code> and ever-longer selectors until the stylesheet is unmaintainable. <code>@layer</code> (supported in all modern browsers) finally lets you control priority by <i>architecture</i> rather than by selector weight.</p>`,
tech:`<ul class="pts"><li><b>Cascade order</b> (first difference decides): 1) <b>origin and importance</b>: transitions &gt; important user-agent &gt; important user &gt; important author &gt; animations &gt; normal author &gt; normal user &gt; normal user-agent; 2) <b>context</b> (shadow DOM: for normal rules the outer context wins, for !important the inner one); 3) <b>element-attached styles</b> (the <code>style</code> attribute beats selector rules of the same origin/importance); 4) <b>cascade layers</b>; 5) <b>specificity</b>; 6) <b>scope proximity</b> (<code>@scope</code>, Day 60); 7) <b>order of appearance</b>.</li><li><b>Specificity</b> is a triple (A, B, C): A = ID selectors; B = classes, attribute selectors and pseudo-classes; C = type selectors and pseudo-elements. Compared column by column, so <code>#a</code> (1,0,0) beats <code>.a.b.c.d.e.f.g.h.i.j.k</code> (0,11,0). The universal selector <code>*</code> and combinators add nothing.</li><li><b>Functional pseudo-classes:</b> <code>:is()</code>, <code>:not()</code> and <code>:has()</code> take the specificity of their <b>most specific argument</b> (<code>:is(#a, p)</code> counts as an ID even when it matched via <code>p</code>); <code>:where()</code> is always <b>zero</b>, ideal for resets and library defaults that should be easy to override. <code>:nth-child(2 of .x)</code> adds its selector's specificity too.</li><li><b>Cascade layers:</b> <code>@layer reset, base, components, utilities;</code> declares the order up front; later layers beat earlier ones <b>regardless of specificity</b>; <b>unlayered styles beat all layers</b>; for <code>!important</code> declarations the order <b>reverses</b> (an important rule in <code>reset</code> beats an important rule in <code>utilities</code>), which lets low layers protect essentials. Import third-party CSS into a layer: <code>@import url(lib.css) layer(vendor);</code>.</li><li><b>Inheritance:</b> mostly text-related properties inherit (<code>color</code>, <code>font-*</code>, <code>line-height</code>, <code>letter-spacing</code>, <code>visibility</code>, <code>cursor</code>, <code>list-style</code>, custom properties); box-related ones don't (<code>margin</code>, <code>padding</code>, <code>border</code>, <code>background</code>, <code>width</code>, <code>display</code>). A rule that matches an element always beats an inherited value, whatever the parent's specificity.</li><li><b>CSS-wide keywords:</b> <code>inherit</code> (take the parent's computed value), <code>initial</code> (the property's spec initial value, e.g. <code>display: inline</code>), <code>unset</code> (inherit if inherited, else initial), <code>revert</code> (roll back to the previous <b>origin</b>, usually the browser default), <code>revert-layer</code> (roll back to the previous <b>layer</b>). <code>all: unset</code> / <code>all: revert</code> reset everything.</li><li><b>Value stages:</b> declared → cascaded (winner) → specified (after defaulting) → <b>computed</b> (relative units resolved where possible; this is what inherits) → used (after layout, e.g. % widths in px) → actual. <code>getComputedStyle</code> returns "resolved" values: used values for some layout properties (width, height, margins), computed for others.</li><li><b>Debugging rules:</b> a declaration that loses is shown struck through in DevTools; invalid declarations are dropped at parse time (and a property that is valid at parse time but invalid at computed time, e.g. a bad <code>var()</code>, falls back to inherit/initial).</li></ul>`,
diagram:{html:flow([["origin + !important","UA / user / author","r"],["inline style attribute","style=\"...\"","w"],["@layer order","later wins; unlayered last","w"],["specificity","(IDs, classes, types)","w"],["scope proximity","@scope","w"],["source order","last one wins","g"]]),steps:["The browser collects every declaration that applies to the element for a given property.","It compares them stage by stage from left to right; the <b>first</b> stage that differs decides the winner and later stages are never consulted.","So a later layer beats an earlier layer even if the earlier one has an ID selector, and an unlayered rule beats both.","If nothing declares the property, inherited properties take the parent's computed value; others use their initial value."]},
ex:[{t:"A specificity calculator verified against the real cascade (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
// Simplified calculator: handles ids, classes, attributes, pseudo-classes, pseudo-elements,
// types, and :is/:not/:has (max of arguments) and :where (zero).
function specificity(sel){
  let a = 0, b = 0, c = 0;
  sel = sel.replace(/:where\\((?:[^()]|\\([^()]*\\))*\\)/g, "");                // :where() counts nothing
  sel = sel.replace(/:(is|not|has)\\(((?:[^()]|\\([^()]*\\))*)\\)/g, (_, fn, args) => {
    const best = args.split(",").map((s) => specificity(s.trim())).sort(cmp).pop();
    a += best[0]; b += best[1]; c += best[2]; return "";
  });
  a += (sel.match(/#[\\w-]+/g) || []).length;
  b += (sel.match(/\\.[\\w-]+|\\[[^\\]]*\\]|(?<!:):(?!:)[\\w-]+(\\([^)]*\\))?/g) || []).length;
  c += (sel.match(/::[\\w-]+|(?:^|[\\s>+~(])[a-z][\\w-]*/gi) || []).length;
  return [a, b, c];
}
function cmp(x, y){ return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; }
const cases = [
  ["p", [0, 0, 1]], ["ul li a", [0, 0, 3]], [".nav .item", [0, 2, 0]], ["#main", [1, 0, 0]],
  ["a[href]:hover", [0, 2, 1]], ["p::first-line", [0, 0, 2]], [":is(#a, .b) p", [1, 0, 1]],
  [":where(#a, .b) p", [0, 0, 1]], ["li:not(.done)", [0, 1, 1]], ["*", [0, 0, 0]]
];
for (const [sel, want] of cases) check(sel.padEnd(18) + " -> (" + specificity(sel) + ")", specificity(sel).join() === want.join());

// Now prove the order with the real browser: which color wins?
const host = document.createElement("div");
host.id = "spec-demo";
host.innerHTML = '<ul class="nav"><li class="item"><a href="#" class="link">x</a></li></ul>';
const style = document.createElement("style");
style.textContent =
  "#spec-demo .nav .item .link.link { color: rgb(0, 128, 0) }" +    /* (1,4,0) */
  "#spec-demo a { color: rgb(255, 0, 0) }" +                       /* (1,0,1) loses to more classes */
  ":where(#spec-demo) .link { color: rgb(0, 0, 255) }";              /* (0,1,0) */
document.body.append(style, host);
const color = getComputedStyle(host.querySelector("a")).color;
check("same ID count: the rule with more classes wins (" + color + ")", color === "rgb(0, 128, 0)");
host.querySelector("a").style.color = "rgb(1, 2, 3)";
check("the style attribute beats every selector", getComputedStyle(host.querySelector("a")).color === "rgb(1, 2, 3)");
style.remove(); host.remove();`},
{t:"Layers, !important reversal, inheritance and the CSS-wide keywords (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const host = document.createElement("div");
host.id = "layer-demo";
host.innerHTML = '<p class="msg">Hello <em>there</em></p><p class="note">Note</p><button class="ok-btn">OK</button>';
const style = document.createElement("style");
style.textContent = [
  "@layer reset, base, components;",                                   // order declared once, up front
  "@layer components { .msg { color: rgb(0, 0, 255) } }",
  "@layer base { #layer-demo p.msg { color: rgb(255, 0, 0) } }",       // higher specificity, earlier layer
  "#layer-demo .note { color: rgb(0, 128, 0) }",                       // unlayered
  "@layer components { #layer-demo #layer-demo .note { color: rgb(255, 0, 255) } }",
  "@layer reset { #layer-demo .ok-btn { font-weight: 700 !important } }",
  "@layer components { #layer-demo .ok-btn { font-weight: 300 !important } }",
  "#layer-demo { color: rgb(10, 20, 30); border: 2px solid; font-size: 20px }"
].join("\\n");
document.body.append(style, host);
const cs = (sel) => getComputedStyle(host.querySelector(sel));

check("a later layer beats an earlier layer despite lower specificity", cs(".msg").color === "rgb(0, 0, 255)");
check("unlayered styles beat any layer, even a more specific selector", cs(".note").color === "rgb(0, 128, 0)");
check("!important reverses layer order: the earlier layer (reset) wins", cs(".ok-btn").fontWeight === "700");
check("color inherits from the parent into <em>", cs("em").color === "rgb(0, 0, 255)");
check("border does not inherit", cs("em").borderTopStyle === "none" && cs(".msg").borderTopStyle === "none");

const em = host.querySelector("em");
em.style.color = "initial";   // initial value of color is CanvasText (black in light mode), not the parent's
console.log("color: initial ->", getComputedStyle(em).color);
em.style.color = "unset";     // color inherits, so unset behaves like inherit
check("unset on an inherited property = inherit", getComputedStyle(em).color === "rgb(0, 0, 255)");
em.style.display = "block";
em.style.display = "initial"; // initial display is inline, NOT the element's default
check("display: initial is inline", getComputedStyle(em).display === "inline");
const div = document.createElement("div"); host.append(div);
div.style.display = "initial";
check("...even for a div (use revert to get the browser default 'block')", getComputedStyle(div).display === "inline");
div.style.display = "revert";
check("display: revert rolls back to the user-agent stylesheet", getComputedStyle(div).display === "block");
console.log("font-size inherits as a computed px value:", getComputedStyle(div).fontSize);
style.remove(); host.remove();`},
{t:"A layered stylesheet architecture (reference CSS)",code:`/* app.css: declare the order once, at the very top */
@layer reset, vendor, base, layout, components, utilities;

@import url("normalize.css") layer(reset);
@import url("datepicker.css") layer(vendor);     /* third-party can't out-specify you anymore */

@layer base {
  :where(h1, h2, h3) { line-height: 1.2; text-wrap: balance; }
  :where(a) { color: var(--link); }
  :where(:focus-visible) { outline: 3px solid var(--focus) !important; }  /* important in a low layer = protected */
}

@layer components {
  .card { padding: 1rem; border-radius: .5rem; }
  .card .title { font-size: 1.25rem; }
}

@layer utilities {
  .mt-0 { margin-top: 0; }         /* beats .card .title without !important: later layer */
  .hidden { display: none; }
}

/* unlayered: emergency overrides and legacy code you are migrating */
.legacy-widget { color: red; }`,run:false}],
browser:`<p>In DevTools <b>Elements → Styles</b>, rules are listed in cascade order, losing declarations are struck through, layers are shown as headings (Chrome/Edge/Firefox/Safari all display <code>@layer</code>), and hovering a selector shows its specificity in Chromium. The <b>Computed</b> tab lists the final value and, when expanded, every rule that tried to set it. Firefox marks inactive declarations (e.g. <code>width</code> on an inline element) with an explanation. <code>@layer</code>, <code>:is()</code>, <code>:where()</code>, <code>revert-layer</code> are supported in all current engines. There is no cascade in Node; but build tools (PostCSS, Lightning CSS) parse and transform CSS on the server, and CSS-in-JS libraries generate class names whose specificity you should understand.</p>`,
gotchas:[`Specificity is not base 10: one ID beats any number of classes; one class beats any number of type selectors.`,`<code>:is(#id, .x)</code> has ID specificity even when it matched through <code>.x</code>; use <code>:where()</code> for zero.`,`Unlayered styles beat <b>every</b> layer; moving only part of your CSS into layers can suddenly make the rest win.`,`<code>!important</code> reverses layer order and origin order; an important declaration in your reset layer beats important utilities.`,`Inline <code>style</code> attributes beat selectors (only <code>!important</code> author rules beat them); JS that sets <code>el.style</code> can silently override your stylesheet.`,`<code>initial</code> means the spec's initial value (<code>display: initial</code> is <code>inline</code>), not the browser default; use <code>revert</code> for that.`,`Inherited values lose to any rule that targets the element directly, even <code>* { color: black }</code> (that's why universal-selector color resets break inheritance).`,`An invalid declaration is dropped silently; one bad value inside a shorthand drops the whole shorthand.`],
best:[`Keep specificity low and flat (single classes); reserve IDs for anchors and JS hooks, not styling.`,`Declare an explicit <code>@layer</code> order at the top; put resets, vendor CSS, base, components and utilities in layers; use <code>:where()</code> in base styles.`,`Treat <code>!important</code> as a code smell outside utilities and accessibility guards; document every use.`,`Use DevTools' struck-through declarations and the Computed tab before changing selectors; fix the cause, don't out-specify it.`],
iq:[["fresher","How is CSS specificity calculated?","As a triple (IDs, classes/attributes/pseudo-classes, types/pseudo-elements), compared left to right. Inline styles beat selectors; !important changes the origin/importance stage, which is evaluated before specificity. The universal selector and combinators add nothing."],["mid","What's the difference between :is() and :where()?","Both match if any argument matches and are forgiving of invalid selectors. :is() takes the specificity of its most specific argument; :where() always has zero specificity, which makes it ideal for defaults that should be easy to override."],["mid","Which properties inherit, and what do inherit/initial/unset/revert do?","Mostly text properties (color, font, line-height, visibility, cursor, custom properties) inherit; box properties don't. inherit forces the parent's value, initial uses the spec initial value, unset is inherit-or-initial depending on the property, revert rolls back to the previous origin (usually the UA style) and revert-layer to the previous layer."],["senior","Explain cascade layers and how !important interacts with them.","@layer groups rules into ordered layers; the layer order is compared before specificity, so later layers win regardless of selector weight, and unlayered styles beat all layers. For !important declarations the order reverses: earlier layers win, so a reset layer can protect essentials like focus outlines."],["senior","A teammate's rule doesn't apply. How do you debug it?","Check it's actually loaded and valid (Styles panel shows it; invalid values are flagged), see if it's struck through and by what, compare origin/importance, inline styles, layer, specificity and order, check whether the property applies to the element (Firefox's inactive CSS), and inspect computed values. Then fix the architecture rather than adding !important."],["lead","How would you migrate a large legacy stylesheet with specificity wars?","Declare a layer order, move the legacy CSS into a low layer (or keep it unlayered temporarily if it must win), write new components in a components layer with single-class selectors and :where() defaults, add stylelint rules (max specificity, no IDs, no !important), and delete legacy rules as components are migrated."]],
practice:[`Extend the specificity calculator to handle <code>:nth-child(2 of .x)</code> and compare it against DevTools' specificity tooltip for 10 selectors from a real site.`,`Take a stylesheet with three <code>!important</code>s and refactor it into layers so none are needed.`,`Write a "what wins?" quiz of 5 rule pairs for a colleague, then verify each answer with <code>getComputedStyle</code>.`],
teach:`<p>"When two CSS rules fight, the browser asks in order: who said it and how firmly (origin, !important), was it inline, which layer, how specific, and finally who spoke last. The first question that has a winner ends the fight. Layers let you decide the order by architecture, and inheritance hands text styles down to children unless something targets them directly."</p>`},

{id:"d57-box-model",title:"Box model, display, positioning and stacking contexts",lv:["fresher","mid","senior"],
eli5:`<p>Every element is a <b>framed picture</b>: the picture itself (content), the white mat around it (padding), the frame (border), and the empty wall space you leave around it (margin). <code>box-sizing</code> decides whether the size on the label means "the picture" or "the whole framed thing". Positioning is about where you hang it: in the normal row (static), nudged a bit (relative), pinned to a specific spot on a board (absolute), taped to the window glass (fixed) or a sticky note that slides until it hits the top edge (sticky). Stacking is which picture overlaps which, and pictures inside a sealed <b>display case</b> (a stacking context) can never poke out above pictures in a case stacked higher.</p>`,
why:`<p>Layouts break in surprising ways when you can't predict box sizes: widths that overflow by the padding, vertical gaps that "disappear" (margin collapsing), absolutely positioned elements that attach to the wrong ancestor, and the classic "z-index: 9999 doesn't work" bug. All of these are fully deterministic once you know the rules.</p>`,
tech:`<ul class="pts"><li><b>Box model:</b> content → padding → border → margin. With the default <code>box-sizing: content-box</code>, <code>width</code> is the content only, so <code>width: 100%; padding: 1rem</code> overflows its parent; <code>box-sizing: border-box</code> makes width include padding and border. Most projects set <code>*, *::before, *::after { box-sizing: border-box }</code>. Percentage padding and margin (even vertical) are relative to the containing block's <b>width</b>.</li><li><b>Margin collapsing:</b> adjacent vertical margins of block boxes in normal flow combine into the larger one (30px + 20px = 30px gap), between siblings and between a parent and its first/last child when nothing (border, padding, inline content, a new formatting context) separates them. Negative margins add. It never happens in flex or grid containers, for floats, absolutely positioned boxes, or horizontally.</li><li><b>Display:</b> outer type (how it participates: <code>block</code>, <code>inline</code>) + inner type (how children lay out: <code>flow</code>, <code>flow-root</code>, <code>flex</code>, <code>grid</code>, <code>table</code>). Inline boxes ignore <code>width</code>/<code>height</code> and vertical margins; <code>inline-block</code> respects them. <code>display: none</code> removes the box (and from the accessibility tree); <code>visibility: hidden</code> keeps the space; <code>display: contents</code> removes only the element's own box. <code>display: flow-root</code> creates a new <b>block formatting context</b> (BFC) that contains floats and stops margin collapse through it.</li><li><b>Positioning:</b> <code>static</code> (normal flow; <code>top/left</code> ignored); <code>relative</code> (offset visually, original space kept; becomes a containing block for absolute children); <code>absolute</code> (removed from flow, positioned against the nearest <b>positioned</b> ancestor's padding box, or the initial containing block); <code>fixed</code> (relative to the viewport, <b>unless</b> an ancestor has <code>transform</code>, <code>filter</code>, <code>perspective</code>, <code>contain: paint</code>/<code>layout</code> or <code>will-change</code> of those, which then becomes its containing block); <code>sticky</code> (relative until a scroll threshold, then sticks within its parent; breaks when an ancestor has <code>overflow: hidden/auto</code> or the parent is too short). <code>inset: 0</code> is shorthand for top/right/bottom/left.</li><li><b>Stacking contexts:</b> <code>z-index</code> works on positioned elements and flex/grid items. Elements are painted per stacking context; a child's z-index only competes <b>inside</b> its parent context. New contexts are created by: root, positioned + z-index other than auto, <code>position: fixed/sticky</code>, flex/grid item with z-index, <code>opacity</code> &lt; 1, <code>transform</code>, <code>filter</code>, <code>backdrop-filter</code>, <code>mix-blend-mode</code>, <code>isolation: isolate</code>, <code>contain: paint</code>, <code>will-change</code> of those, and the <b>top layer</b> (dialog, popover, fullscreen) sits above everything.</li><li><b>Painting order inside a context:</b> background/border of the root → negative z-index → in-flow blocks → floats → inline content → z-index 0/auto positioned → positive z-index.</li><li><b>Overflow:</b> <code>visible</code>, <code>hidden</code> (still scrollable by script), <code>clip</code> (no scroll container), <code>scroll</code>, <code>auto</code>. Any value other than visible/clip creates a scroll container, which affects sticky positioning. <code>min-width: 0</code> / <code>overflow-wrap: anywhere</code> fix long-word overflow.</li><li><b>Sizing keywords:</b> <code>min-content</code>, <code>max-content</code>, <code>fit-content</code>; <code>aspect-ratio</code>; <code>min()/max()/clamp()</code> (Day 59).</li></ul>`,
diagram:{html:flow([["margin","transparent; can collapse","w"],["border","part of border-box"],["padding","takes the background"],["content","width/height with content-box","g"]],{plain:false})+'<br>'+lanes([["root stacking context",["header z-index:10","modal parent z-index:1 → its child z-index:9999 still under header"]],["new context created by",["position + z-index","opacity &lt; 1, transform, filter","isolation: isolate","fixed / sticky","top layer (dialog, popover)"]]]),steps:["Size = content (+ padding + border if <code>border-box</code>); margins sit outside and may collapse vertically.","An element's z-index is compared only with siblings in the same stacking context.","If a parent forms a context with z-index 1, nothing inside it can appear above a sibling context with z-index 2.","Fix overlap bugs by finding which ancestor creates the context (DevTools Layers / 3D view), or use the top layer for modals and popovers."]},
ex:[{t:"Box sizing, margin collapsing and inline boxes measured (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const root = document.createElement("div");
root.style.cssText = "position:absolute;left:-9999px;top:0;width:400px;font:16px/1 sans-serif";
root.innerHTML =
  '<div id="cb" style="box-sizing:content-box;width:200px;padding:20px;border:5px solid">c</div>' +
  '<div id="bb" style="box-sizing:border-box;width:200px;padding:20px;border:5px solid">b</div>' +
  '<div id="pct" style="width:50%;padding-top:25%"></div>' +
  '<div id="a" style="margin-bottom:30px;height:10px"></div><div id="b" style="margin-top:20px;height:10px"></div>' +
  '<div id="flex" style="display:flex;flex-direction:column"><div id="c" style="margin-bottom:30px;height:10px"></div><div id="d" style="margin-top:20px;height:10px"></div></div>' +
  '<div id="parent" style="background:#eee"><div id="child" style="margin-top:40px;height:10px"></div></div>' +
  '<span id="inl" style="width:300px;height:300px;margin-top:50px">inline</span>';
document.body.append(root);
const r = (id) => root.querySelector("#" + id).getBoundingClientRect();

check("content-box: 200 + 2*20 padding + 2*5 border = 250px wide", r("cb").width === 250);
check("border-box: the declared 200px includes padding and border", r("bb").width === 200);
check("vertical % padding is relative to the container WIDTH (25% of 400 = 100px)", r("pct").height === 100);
check("sibling margins collapse to the larger one: gap 30, not 50", r("b").top - r("a").bottom === 30);
check("no collapsing inside a flex container: gap 50", r("d").top - r("c").bottom === 50);
check("a child's top margin escapes its parent (parent moved down, no gap inside)", r("child").top === r("parent").top);
const parent = root.querySelector("#parent");
parent.style.display = "flow-root";   // new block formatting context: contains the margin
check("display:flow-root keeps the margin inside the parent", r("child").top - r("parent").top === 40);
check("inline elements ignore width and height", r("inl").width < 300 && r("inl").height < 300);
root.querySelector("#inl").style.display = "inline-block";
check("inline-block respects width and height", r("inl").width === 300 && r("inl").height === 300);
root.remove();`},
{t:"Why z-index: 9999 loses: stacking contexts and the containing block (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const root = document.createElement("div");
root.style.cssText = "position:fixed;left:0;top:0;width:200px;height:200px;z-index:2147483000";
root.innerHTML =
  '<div id="header" style="position:absolute;inset:0 0 auto 0;height:100px;z-index:10;background:navy"></div>' +
  '<div id="card" style="position:relative;z-index:1">' +
  '  <div id="menu" style="position:absolute;top:0;left:0;width:100px;height:150px;z-index:9999;background:orange"></div>' +
  '</div>';
document.body.append(root);
const at = (x, y) => document.elementFromPoint(x, y).id;

check("the menu (z-index 9999) is still UNDER the header", at(50, 50) === "header");
check("below the header, the menu is visible", at(50, 120) === "menu");
const card = root.querySelector("#card");
card.style.zIndex = "auto";     // card no longer forms a stacking context...
check("remove the parent's context: now 9999 competes with 10 and wins", at(50, 50) === "menu");
card.style.opacity = "0.99";    // ...but opacity < 1 creates one again (with z-index auto -> painted at 0)
check("opacity < 1 silently creates a new stacking context", at(50, 50) === "header");
card.style.opacity = "";
card.style.isolation = "isolate";
check("isolation:isolate does the same, on purpose", at(50, 50) === "header");

// transform turns an ancestor into the containing block for position:fixed children
const t = document.createElement("div");
t.style.cssText = "position:absolute;left:-9999px;top:300px;width:100px;height:100px";
t.innerHTML = '<div style="position:fixed;top:0;left:0;width:10px;height:10px"></div>';
document.body.append(t);
const fixedKid = t.firstChild;
check("normally position:fixed is relative to the viewport", fixedKid.getBoundingClientRect().top === 0);
t.style.transform = "translateZ(0)";
check("a transformed ancestor captures position:fixed descendants", fixedKid.getBoundingClientRect().top === t.getBoundingClientRect().top);
root.remove(); t.remove();`,note:`This is why modals and dropdowns are moved to the end of <code>&lt;body&gt;</code> (portals) or, better, rendered in the <b>top layer</b> with <code>&lt;dialog&gt;.showModal()</code> or the <code>popover</code> attribute, which sits above every stacking context.`},
{t:"Reusable layout primitives (reference CSS)",code:`*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; min-height: 100dvh; }
img, picture, video, canvas, svg { display: block; max-width: 100%; height: auto; }

/* contain floats / stop margin collapse without hacks */
.flow-root { display: flow-root; }

/* vertical rhythm without collapsing surprises: margins only between siblings */
.stack > * + * { margin-block-start: var(--space, 1rem); }

/* sticky header: needs a top, and no overflow:hidden ancestor */
.site-header { position: sticky; top: 0; z-index: 10; }

/* overlay that covers its positioned parent */
.card { position: relative; isolation: isolate; }      /* own stacking context, z-index stays local */
.card__link::after { content: ""; position: absolute; inset: 0; } /* whole card clickable */

/* z-index scale instead of random numbers */
:root { --z-dropdown: 100; --z-sticky: 200; --z-toast: 300; }

/* visually hidden but available to screen readers */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
           overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }`,run:false}],
browser:`<p>DevTools shows the box model diagram in <b>Elements → Computed</b> (hover areas to highlight margin/padding on the page); Firefox and Chrome badge flex/grid/scroll containers in the DOM tree. Chrome/Edge <b>Layers</b> panel and the <b>3D View</b> visualize stacking contexts and z-order; Firefox explains why a property has no effect (e.g. <code>z-index</code> on a static element). Hover an element to see its margin (orange) and padding (green). Behavior is consistent across modern engines; old differences (IE's quirks-mode box model) only appear without a <code>&lt;!DOCTYPE html&gt;</code>. Node doesn't do layout: jsdom returns zeros for <code>getBoundingClientRect</code>, so layout tests need a real browser (Playwright, Vitest browser mode).</p>`,
gotchas:[`<code>width: 100%</code> plus padding overflows with <code>content-box</code>; use <code>border-box</code> globally.`,`Vertical margins collapse (siblings, parent/first child, empty blocks); not in flex/grid, not horizontally. A child's top margin can push its parent down.`,`Percent padding/margin top and bottom are based on the containing block's <b>width</b>.`,`<code>z-index</code> on a <code>position: static</code> block does nothing (it works on flex and grid items though).`,`<code>opacity</code>, <code>transform</code>, <code>filter</code>, <code>will-change</code> create stacking contexts; adding an animation can change overlap.`,`<code>transform</code>/<code>filter</code>/<code>contain</code> on an ancestor breaks <code>position: fixed</code> (it becomes relative to that ancestor).`,`<code>position: sticky</code> fails if an ancestor has <code>overflow: hidden/auto</code>, if no <code>top</code> is set, or if the parent is no taller than the sticky element.`,`<code>height: 100vh</code> on mobile ignores the collapsing browser toolbar; use <code>100dvh</code>/<code>100svh</code> (Day 59).`],
best:[`Global <code>border-box</code>; spacing via <code>gap</code> or a "stack" pattern instead of margins on every element.`,`Keep a small z-index scale in custom properties; use <code>isolation: isolate</code> on components so their z-indexes stay local.`,`Use the top layer (<code>&lt;dialog&gt;</code>, <code>popover</code>) for overlays instead of z-index escalation.`,`Prefer flex/grid for layout; reserve absolute positioning for overlays, badges and decorations.`],
iq:[["fresher","Explain the CSS box model and box-sizing.","Content, padding, border and margin. With content-box (default) width/height set the content size and padding/border are added; with border-box they include padding and border, so a 200px box stays 200px. Margins are always outside."],["mid","What is margin collapsing and how do you prevent it?","Adjacent vertical margins of blocks in normal flow merge into the largest one (siblings, parent/first-last child, empty blocks). Prevent with padding/border on the parent, display: flow-root, or by using flex/grid containers (no collapsing) and gap."],["mid","Difference between relative, absolute, fixed and sticky?","relative offsets the element visually while keeping its space and becomes a containing block; absolute removes it from flow and positions it against the nearest positioned ancestor; fixed positions against the viewport (unless an ancestor has transform/filter/contain); sticky is relative until a scroll threshold, then sticks within its parent."],["senior","Why might z-index: 9999 not put an element on top?","z-index only competes within the same stacking context. If an ancestor creates a context (positioned + z-index, opacity < 1, transform, filter, isolation, fixed/sticky), the child can't escape above siblings of that ancestor with a higher z-index. Fix by changing the ancestor, moving the element (portal) or using the top layer."],["senior","What is a block formatting context and when do you need one?","An independent layout region for block boxes: it contains its floats, prevents margin collapse with its children and doesn't overlap floats. Created by display: flow-root, overflow other than visible/clip, floats, absolute positioning, flex/grid items, inline-block, contain: layout. flow-root is the side-effect-free way."],["lead","How do you keep z-index manageable across a large app?","Define a documented scale (tokens), isolate components with isolation: isolate so local z-indexes don't leak, use the top layer for dialogs/popovers/toasts, ban arbitrary values with stylelint, and review overlay patterns centrally in the design system."]],
practice:[`Recreate the "9999 loses" demo in a page, then fix it three different ways (remove the context, portal to body, popover).`,`Build a sticky table header inside a scrolling container and make it break, then explain why (overflow ancestor, missing top, parent height).`,`Measure five elements with DevTools' box model panel and predict their <code>getBoundingClientRect()</code> before checking.`],
teach:`<p>"Every element is a framed picture: content, mat, frame, wall space. border-box means the label size includes the frame. Vertical wall space between pictures overlaps (collapses). Position decides where you hang it, and z-index only matters inside the same display case; a case with opacity, transform or a z-index seals everything in it."</p>`}
],quiz:[
{code:`const s = document.createElement('style');
s.textContent = '#q1 p { color: rgb(255, 0, 0) } :where(#q1) p.x { color: rgb(0, 128, 0) } .y.x { color: rgb(0, 0, 255) }';
const d = document.createElement('div'); d.id = 'q1'; d.innerHTML = '<p class="x y">hi</p>';
document.body.append(s, d);
console.log(getComputedStyle(d.firstChild).color);
s.remove(); d.remove();`,ans:`rgb(255, 0, 0)`,why:`Specificities: <code>#q1 p</code> = (1,0,1); <code>:where(#q1) p.x</code> = (0,1,1) because <code>:where()</code> counts nothing; <code>.y.x</code> = (0,2,0). The single ID wins over any number of classes, regardless of source order.`},
{code:`const s = document.createElement('style');
s.textContent = '@layer base, theme; @layer theme { .t { color: rgb(0, 0, 255); border: 1px solid } } @layer base { #q2 .t { color: rgb(255, 0, 0) } }';
const d = document.createElement('div'); d.id = 'q2'; d.innerHTML = '<p class="t"><span>x</span></p>';
document.body.append(s, d);
const span = d.querySelector('span');
console.log(getComputedStyle(span).color, getComputedStyle(span).borderTopStyle);
s.remove(); d.remove();`,ans:`rgb(0, 0, 255) none`,why:`<code>theme</code> is declared after <code>base</code>, so it wins even though <code>#q2 .t</code> is more specific. The span inherits <code>color</code> from the paragraph, but <code>border</code> is not inherited, so its style is the initial value <code>none</code>.`}]},

{n:58,title:"Layout",goal:"Build any layout with Flexbox (one dimension) and Grid (two dimensions), predict exactly how space is distributed, and pick the right tool for each job.",topics:[
{id:"d58-flexbox",title:"Flexbox",lv:["fresher","mid","senior"],
eli5:`<p>Picture kids sitting on a <b>bench</b>. Each kid has a size they'd like (<code>flex-basis</code>). If the bench is longer than all the kids together, the extra room is shared out, and some kids are told "you get two shares, you get one" (<code>flex-grow</code>). If the bench is too short, everyone squeezes in, bigger kids squeeze more (<code>flex-shrink</code>), but nobody can squeeze smaller than their own body unless you allow it (<code>min-width: 0</code>). You can also turn the bench vertical, decide whether kids bunch at one end or spread out (<code>justify-content</code>), and how they line up head-height (<code>align-items</code>).</p>`,
why:`<p>Flexbox solved the layout problems that took hacks for a decade: vertical centering, equal-height columns, a footer pushed to the bottom, nav bars with items on both ends, and components that adapt to unknown content sizes. It is the default tool for components and one-dimensional rows or columns.</p>`,
tech:`<ul class="pts"><li><b>Axes:</b> <code>display: flex</code> makes a flex container; <code>flex-direction</code> (<code>row</code> default, <code>column</code>, <code>*-reverse</code>) sets the <b>main axis</b>; the cross axis is perpendicular. <code>justify-content</code> works on the main axis, <code>align-items</code>/<code>align-self</code> on the cross axis, <code>align-content</code> on lines when wrapping. In <code>row</code>, the main axis follows the writing direction (right-to-left in Arabic).</li><li><b>Sizing algorithm:</b> 1) each item's <b>hypothetical size</b> = <code>flex-basis</code> (or its width/height if basis is <code>auto</code>, or its content size if that is also auto), clamped by min/max; 2) free space = container − sum of sizes − gaps; 3) positive free space is shared in proportion to <code>flex-grow</code>; negative free space is removed in proportion to <code>flex-shrink × flex-basis</code> (big items shrink more); 4) min/max constraints are re-applied and the loop repeats for frozen items.</li><li><b>The <code>flex</code> shorthand:</b> <code>flex: 1</code> = <code>1 1 0%</code> (ignore content, share all space equally); <code>flex: auto</code> = <code>1 1 auto</code> (start from content size, share the remainder); <code>flex: none</code> = <code>0 0 auto</code> (rigid); <code>flex: initial</code> = <code>0 1 auto</code> (the default: don't grow, may shrink). Prefer the shorthand; the defaults differ from what the longhands imply.</li><li><b>The <code>min-width: auto</code> trap:</b> flex items can't shrink below their min-content size by default, so long words, URLs, <code>&lt;pre&gt;</code> blocks or wide tables overflow the container. Fix with <code>min-width: 0</code> (or <code>overflow: hidden</code>) on the item, plus <code>overflow-wrap: anywhere</code> or text truncation.</li><li><b>Spacing and alignment:</b> <code>gap</code> (row and column) is the clean way to space items; <code>margin-inline-start: auto</code> pushes an item (and everything after it) to the far end; <code>align-items: stretch</code> (default) makes equal-height items; <code>place-items: center</code>/<code>justify-content: center; align-items: center</code> centers; <code>align-items: baseline</code> aligns text baselines.</li><li><b>Wrapping:</b> <code>flex-wrap: wrap</code> creates new lines; each line is sized independently (items in different lines don't align into columns: use Grid for that). <code>flex: 1 1 15rem</code> + wrap gives a simple responsive row that needs no media query.</li><li><b>Order and accessibility:</b> <code>order</code> and <code>*-reverse</code> change only the visual order; keyboard focus and screen readers follow the DOM, so avoid reordering meaningful content.</li><li><b>Typical patterns:</b> nav bar (logo left, links right with <code>margin-left: auto</code>), media object (image + text with <code>flex: 1; min-width: 0</code>), sticky footer (<code>body { display:flex; flex-direction:column; min-height:100dvh } main { flex: 1 }</code>), input with button, centered hero, card footer pinned to the bottom (<code>margin-top: auto</code> in a column).</li></ul>`,
diagram:{html:flow([["container 600px","gap 0"],["bases 100 + 100 + 100","free space = 300","w"],["grow 1 : 2 : 3","300 split into 50 / 100 / 150","w"],["final 150 / 200 / 250","clamped by min/max","g"]])+'<br>'+flow([["container 300px"],["bases 200 + 400","overflow = 300","r"],["shrink 1 × basis","weights 200 : 400","w"],["final 100 / 200","bigger item shrinks more","g"]]),steps:["Start from <code>flex-basis</code> (or width, or content size).","Positive free space is divided by <code>flex-grow</code> ratios.","Negative free space is removed in proportion to <code>flex-shrink × basis</code>.","No item shrinks below its <code>min-width</code>, which is <code>auto</code> (its min-content size) unless you set <code>min-width: 0</code>."]},
ex:[{t:"The flex algorithm, measured (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const make = (css, items) => {
  const box = document.createElement("div");
  box.style.cssText = "position:absolute;left:-9999px;top:0;display:flex;font:16px monospace;" + css;
  box.innerHTML = items.map((s) => '<div style="' + s + '"></div>').join("");
  document.body.append(box);
  return box;
};
const widths = (box) => [...box.children].map((c) => Math.round(c.getBoundingClientRect().width));

let b = make("width:600px", ["flex:1 1 100px", "flex:2 1 100px", "flex:3 1 100px"]);
console.log("grow 1:2:3 from 100px bases ->", widths(b).join(", "));
check("free space 300 shared 1:2:3 = +50/+100/+150", widths(b).join() === "150,200,250");
b.remove();

b = make("width:300px", ["flex:0 1 200px", "flex:0 1 400px"]);
console.log("shrink from 200 + 400 into 300 ->", widths(b).join(", "));
check("shrinking is weighted by shrink x basis (bigger items lose more)", widths(b).join() === "100,200");
b.remove();

b = make("width:300px", ["flex:1", "flex:2"]);
b.children[0].textContent = "a long label";      // content is ignored because flex:1 means basis 0%
check("flex:1 is 1 1 0%: sizes follow the ratio, not the content (100/200)", widths(b).join() === "100,200" && getComputedStyle(b.children[0]).flexBasis === "0%");
b.children[0].style.flex = "auto"; b.children[1].style.flex = "auto";
check("flex:auto starts from content size, so the item with text is wider", widths(b)[0] > widths(b)[1]);
b.remove();

b = make("width:120px", ["flex:1", "flex:1"]);
b.children[0].textContent = "Supercalifragilistic";  // one unbreakable word
const [w1] = widths(b);
check("min-width:auto: the item refuses to shrink below its longest word (" + w1 + "px)", w1 > 60);
b.children[0].style.minWidth = "0"; b.children[0].style.overflow = "hidden";
check("min-width:0 lets it shrink to its fair share", widths(b)[0] === 60);
b.remove();

b = make("width:400px;gap:10px", ["width:50px", "width:50px;margin-left:auto", "width:50px"]);
const xs = [...b.children].map((c) => Math.round(c.getBoundingClientRect().left - b.getBoundingClientRect().left));
check("margin-left:auto pushes that item and the rest to the end (" + xs.join(", ") + ")", xs.join() === "0,290,350");
b.remove();

b = make("width:300px;height:100px;align-items:center;justify-content:center", ["width:40px;height:20px"]);
const c = b.firstChild.getBoundingClientRect(), p = b.getBoundingClientRect();
check("centering both ways: justify-content + align-items", c.left - p.left === 130 && c.top - p.top === 40);
b.remove();`},
{t:"Wrapping lines are independent; order is visual only (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const box = document.createElement("div");
box.style.cssText = "position:absolute;left:-9999px;top:0;width:330px;display:flex;flex-wrap:wrap;gap:10px";
box.innerHTML = ["A", "B", "C", "D", "E"].map((t) => '<button style="flex:1 1 100px">' + t + "</button>").join("");
document.body.append(box);
const rects = [...box.children].map((el) => el.getBoundingClientRect());
const rows = new Set(rects.map((r) => Math.round(r.top))).size;
console.log("widths:", rects.map((r) => Math.round(r.width)).join(", "), "in", rows, "rows");
check("3 items fit per 330px line (3x100 + 2x10 gaps)", rows === 2);
check("each line grows separately: last line's 2 items are wider than the first line's 3", rects[4].width > rects[0].width);
box.children[0].style.order = "1";       // move A to the end visually
const visual = [...box.children].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left).map((e) => e.textContent).join("");
const dom = [...box.children].map((e) => e.textContent).join("");
console.log("visual order:", visual, " DOM/tab order:", dom);
check("order changes what you see but not keyboard/screen-reader order", visual === "BCDEA" && dom === "ABCDE");
box.remove();`},
{t:"Everyday flexbox patterns (reference CSS)",code:`/* nav bar: logo left, links right */
.nav { display: flex; align-items: center; gap: 1rem; }
.nav .account { margin-inline-start: auto; }

/* media object: avatar + text that can truncate */
.media { display: flex; gap: .75rem; align-items: flex-start; }
.media > img { flex: none; width: 48px; height: 48px; }
.media > .body { flex: 1; min-width: 0; }            /* the crucial min-width: 0 */
.media .title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* sticky footer */
body { display: flex; flex-direction: column; min-height: 100dvh; }
main { flex: 1; }

/* card whose button sits at the bottom whatever the text length */
.card { display: flex; flex-direction: column; }
.card .actions { margin-block-start: auto; }

/* responsive row without media queries */
.tiles { display: flex; flex-wrap: wrap; gap: 1rem; }
.tiles > * { flex: 1 1 15rem; }

/* input + button */
.search { display: flex; }
.search input { flex: 1; min-width: 0; }`,run:false}],
browser:`<p>Click the <b>flex</b> badge next to a container in Chrome/Edge/Firefox DevTools to overlay the main axis, free space and gaps; Chrome has a flexbox editor for trying <code>justify-content</code>/<code>align-items</code> visually and Firefox's flex inspector explains how each item's final size was computed (base size, grow/shrink, min clamping). Flexbox, <code>gap</code> in flex and the alignment properties are supported everywhere. In Node there's no layout engine; React Native and some terminal/PDF renderers (Yoga) implement Flexbox outside the browser with slightly different defaults (e.g. React Native defaults to <code>flex-direction: column</code>).</p>`,
gotchas:[`<code>flex: 1</code> means <code>1 1 0%</code>, not "grow"; with long content in one item, ratios hold only until <code>min-width: auto</code> kicks in.`,`Flex items don't shrink below min-content: long words, URLs, code blocks and tables overflow until you set <code>min-width: 0</code> on the item.`,`<code>flex-shrink</code> is weighted by basis, so two items with <code>flex-shrink: 1</code> don't shrink equally.`,`<code>justify-content</code> has no effect if any item grows (no free space left); use margins or grid.`,`Wrapped lines are independent: items on different lines don't line up in columns; use Grid for 2D alignment.`,`<code>order</code> and <code>row-reverse</code> change visual order only; tab order follows the DOM (WCAG "meaningful sequence").`,`<code>height: 100%</code> on a child of a flex item needs the item to have a definite height; in a stretched flex item it usually works, inside wrapped lines it may not.`,`Images as flex items may stretch (<code>align-items: stretch</code>) or shrink unexpectedly; set <code>flex: none</code> or <code>align-self</code>.`],
best:[`Use Flexbox for one-dimensional distribution (rows of controls, toolbars, stacks) and Grid for two-dimensional page and card layouts.`,`Use <code>gap</code> for spacing, the <code>flex</code> shorthand for sizing, and <code>min-width: 0</code> on flexible items with text.`,`Keep the DOM in reading order; use alignment, not <code>order</code>, for visual tweaks.`,`Prefer intrinsic, wrap-based responsiveness (<code>flex: 1 1 15rem</code>) before adding breakpoints.`],
iq:[["fresher","How do you center an element horizontally and vertically?","Make the parent display: flex (or grid) with justify-content: center and align-items: center (or place-items: center for grid). For a single absolutely positioned element: inset: 0; margin: auto with a defined size."],["mid","What does flex: 1 expand to and how is it different from flex: auto?","flex: 1 is 1 1 0%: start from zero and share all space by ratio, so items are equal regardless of content. flex: auto is 1 1 auto: start from the content/width and share only the leftover, so bigger content stays bigger."],["mid","Why does my flex item overflow its container with a long URL?","Flex items have min-width: auto, which means they can't shrink below their min-content width (the unbreakable URL). Set min-width: 0 (or overflow other than visible) on the item and allow wrapping with overflow-wrap: anywhere or truncate with text-overflow."],["senior","Explain how flex-shrink distributes negative space.","The overflow is distributed in proportion to flex-shrink multiplied by each item's flex basis, so larger items shrink more; items hitting their min size are frozen and the remaining overflow is redistributed among the rest."],["senior","When would you choose Grid over Flexbox?","When you need alignment in two dimensions (rows and columns lining up), explicit placement or overlapping, named areas, or layout driven by the container rather than the content. Flexbox is content-out and one-dimensional; Grid is layout-in and two-dimensional."]],
practice:[`Build a header with logo, centered search box and right-aligned account menu using only flex and <code>margin: auto</code>; make the search shrink with <code>min-width: 0</code>.`,`Recreate the shrink calculation by hand for bases 150/300/450 in a 600px container, then verify with the example.`,`Build a chat message list where your messages align right and others left, with timestamps baseline-aligned.`],
teach:`<p>"Flexbox is kids on a bench. Each wants a size (basis); extra space is shared by grow ratios; missing space is taken by shrink times size, but nobody goes below their own body width unless you say min-width: 0. Justify works along the bench, align across it, and gap keeps them from touching."</p>`},

{id:"d58-grid",title:"CSS Grid",lv:["fresher","mid","senior","lead"],
eli5:`<p>Grid is a <b>chessboard you design yourself</b>. You decide how many columns and rows there are and how wide each is ("this column is 200px, the other two share the rest"), then you place pieces on squares, or let a piece cover several squares. You can even give regions names ("header", "sidebar", "main") and draw the board as a little picture. Unlike the bench (Flexbox), rows and columns always line up across the whole board.</p>`,
why:`<p>Page layouts, dashboards, card galleries, forms with aligned labels and magazine-style designs are two-dimensional. Before Grid they needed float hacks or nested flex rows that couldn't align across rows. Grid also enables responsive layouts with no media queries (<code>auto-fit</code> + <code>minmax()</code>) and, with <code>subgrid</code>, aligns content across sibling cards.</p>`,
tech:`<ul class="pts"><li><b>Tracks:</b> <code>display: grid; grid-template-columns: 200px 1fr 2fr; grid-template-rows: auto 1fr auto;</code>. The <b><code>fr</code></b> unit shares the leftover space after fixed tracks and gaps. <code>repeat(3, 1fr)</code>, <code>minmax(12rem, 1fr)</code>, <code>fit-content(20rem)</code>, <code>min-content</code>/<code>max-content</code>/<code>auto</code> sizes.</li><li><b><code>1fr</code> is really <code>minmax(auto, 1fr)</code>:</b> a track can't shrink below its content's min size, so a long word or wide image makes "equal" columns unequal; use <code>minmax(0, 1fr)</code> for truly equal columns.</li><li><b>Responsive without breakpoints:</b> <code>repeat(auto-fill, minmax(12rem, 1fr))</code> creates as many columns as fit; <code>auto-fill</code> keeps empty tracks, <code>auto-fit</code> collapses empty tracks so existing items stretch. Guard tiny screens with <code>minmax(min(12rem, 100%), 1fr)</code>.</li><li><b>Placement:</b> by line numbers (<code>grid-column: 1 / 3</code>, <code>1 / -1</code> = full width, <code>span 2</code>), by named lines (<code>[content-start]</code>), or by <b>named areas</b>: <code>grid-template-areas: "head head" "side main" "foot foot";</code> + <code>grid-area: main</code>. Items without placement are auto-placed in order; <code>grid-auto-flow: dense</code> back-fills holes (but changes visual order).</li><li><b>Implicit grid:</b> items beyond the explicit tracks create implicit rows/columns sized by <code>grid-auto-rows</code>/<code>grid-auto-columns</code> (e.g. <code>grid-auto-rows: minmax(100px, auto)</code>).</li><li><b>Alignment:</b> <code>justify-items</code>/<code>align-items</code> (items inside their cells; default stretch), <code>justify-content</code>/<code>align-content</code> (the whole grid inside the container), <code>place-self</code> per item, <code>gap</code>/<code>row-gap</code>/<code>column-gap</code>.</li><li><b>Overlap:</b> place several items in the same cell (e.g. text over an image using <code>grid-area: 1 / 1</code>); later items paint on top, adjustable with <code>z-index</code>. This replaces many absolute-positioning hacks.</li><li><b><code>subgrid</code></b> (all modern engines): <code>grid-template-rows: subgrid</code> on a nested grid makes its rows use the parent's tracks, so titles, text and buttons line up across a row of cards regardless of content length.</li><li><b>Grid vs Flexbox:</b> Grid is "layout first" (the container defines tracks, content fills them) and two-dimensional; Flexbox is "content first" and one-dimensional. Real pages use Grid for the macro layout and Flexbox inside components. Upcoming: <b>masonry</b>-style layouts ("grid lanes") are being standardized and shipping behind flags or in some engines; treat as progressive enhancement.</li></ul>`,
diagram:{html:'<div style="display:grid;grid-template-columns:120px 1fr;grid-template-rows:auto 1fr auto;gap:6px;max-width:460px;margin:0 auto;font:13px system-ui,sans-serif"><div class="fb" style="grid-column:1/-1">header <small>grid-area: head (1 / 1 / 2 / 3)</small></div><div class="fb w">sidebar <small>120px</small></div><div class="fb g" style="min-height:70px">main <small>1fr = all leftover width</small></div><div class="fb" style="grid-column:1/-1">footer <small>grid-column: 1 / -1</small></div></div>',steps:["The container defines column and row tracks; <code>fr</code> shares space left after fixed tracks and gaps.","Grid lines are numbered from 1 (and from -1 at the end), so <code>1 / -1</code> spans the full width.","Named areas let you draw the layout as text and rearrange it per breakpoint without touching HTML.","Items you don't place are auto-placed into the next free cells, creating implicit rows as needed."]},
ex:[{t:"Tracks, fr, auto-fill vs auto-fit, areas and spans measured (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const grid = (css, n, itemCss = []) => {
  const g = document.createElement("div");
  g.style.cssText = "position:absolute;left:-9999px;top:0;display:grid;" + css;
  for (let i = 0; i < n; i++) { const d = document.createElement("div"); d.style.cssText = itemCss[i] || ""; d.textContent = i; g.append(d); }
  document.body.append(g); return g;
};
const cols = (g) => getComputedStyle(g).gridTemplateColumns;
const w = (el) => Math.round(el.getBoundingClientRect().width);

let g = grid("width:420px;gap:10px;grid-template-columns:100px 1fr 2fr", 3);
console.log("100px 1fr 2fr in 420px with gaps ->", cols(g));
check("fr shares what is left after fixed tracks and gaps (300 -> 100 + 200)", cols(g) === "100px 100px 200px");
g.remove();

g = grid("width:450px;grid-template-columns:repeat(auto-fill, minmax(100px, 1fr))", 2);
console.log("auto-fill ->", cols(g));
check("auto-fill keeps 4 tracks even with 2 items (items stay 112.5px)", cols(g).split(" ").length === 4 && w(g.children[0]) === 113);
g.style.gridTemplateColumns = "repeat(auto-fit, minmax(100px, 1fr))";
console.log("auto-fit  ->", cols(g));
check("auto-fit collapses empty tracks so the 2 items stretch to 225px", w(g.children[0]) === 225);
g.remove();

g = grid("width:300px;grid-template-columns:1fr 1fr", 2);
g.children[0].textContent = "Pneumonoultramicroscopicsilicovolcanoconiosis";
check("1fr is minmax(auto, 1fr): long content makes 'equal' columns unequal", w(g.children[0]) > w(g.children[1]));
g.style.gridTemplateColumns = "minmax(0, 1fr) minmax(0, 1fr)";
check("minmax(0, 1fr) gives truly equal columns", w(g.children[0]) === 150 && w(g.children[1]) === 150);
g.remove();

g = grid('width:400px;grid-template-columns:100px 1fr;grid-template-rows:50px 200px 30px;grid-template-areas:"head head" "side main" "foot foot"', 4,
  ["grid-area:head", "grid-area:side", "grid-area:main", "grid-area:foot"]);
const [head, side, main, foot] = [...g.children].map((c) => c.getBoundingClientRect());
check("named areas: header spans both columns", Math.round(head.width) === 400);
check("main sits right of the 100px sidebar and is 300 x 200", main.left - side.left === 100 && main.width === 300 && main.height === 200);
check("footer is the third row", foot.top - head.top === 250);
g.remove();

g = grid("width:300px;grid-template-columns:repeat(3, 1fr);grid-auto-rows:40px", 5, ["grid-column:span 2", "", "grid-column:1 / -1"]);
const r = [...g.children].map((c) => c.getBoundingClientRect());
check("span 2 + auto-placement; 1 / -1 spans the full row; implicit rows are 40px", Math.round(r[0].width) === 200 && Math.round(r[2].width) === 300 && r[2].top - r[0].top === 40 && g.getBoundingClientRect().height === 120);
g.remove();`},
{t:"subgrid: align card parts across siblings (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
if (!CSS.supports("grid-template-rows", "subgrid")) console.log("subgrid is not supported in this browser (skipping)");
else {
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:absolute;left:-9999px;top:0;width:400px;display:grid;grid-template-columns:repeat(2, 1fr);gap:10px;font:16px/20px sans-serif";
  const card = (title) => '<article style="display:grid;grid-row:span 2;grid-template-rows:subgrid;row-gap:0"><h3 style="margin:0">' + title + '</h3><p style="margin:0">Body</p></article>';
  wrap.innerHTML = card("Short") + card("A much longer title that wraps onto several lines");
  document.body.append(wrap);
  const bodies = wrap.querySelectorAll("p");
  const tops = [...bodies].map((p) => Math.round(p.getBoundingClientRect().top));
  console.log("body tops with subgrid:", tops.join(", "));
  check("both card bodies start at the same y: rows are shared with the parent grid", tops[0] === tops[1]);
  wrap.querySelectorAll("article").forEach((a) => { a.style.gridTemplateRows = "auto 1fr"; });
  const tops2 = [...bodies].map((p) => Math.round(p.getBoundingClientRect().top));
  console.log("body tops without subgrid:", tops2.join(", "));
  check("without subgrid each card sizes its own rows, so bodies misalign", tops2[0] !== tops2[1]);
  wrap.remove();
}`},
{t:"Page layout, gallery and overlay patterns (reference CSS)",code:`/* Holy-grail page layout, rearranged per breakpoint with areas only */
.page {
  display: grid; min-height: 100dvh; gap: 1rem;
  grid-template: "head" auto "main" 1fr "side" auto "foot" auto / minmax(0, 1fr);
}
@media (min-width: 60rem) {
  .page { grid-template: "head head" auto "side main" 1fr "foot foot" auto / 16rem minmax(0, 1fr); }
}
.page > header { grid-area: head; } .page > main { grid-area: main; }
.page > aside  { grid-area: side; } .page > footer { grid-area: foot; }

/* Gallery with no media queries, safe on tiny screens */
.gallery { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr)); }

/* Content column with full-bleed escape hatch */
.article { display: grid; grid-template-columns: [full-start] 1fr [content-start] min(65ch, 100% - 2rem) [content-end] 1fr [full-end]; }
.article > * { grid-column: content; }
.article > .full-bleed { grid-column: full; }

/* Text over image without position:absolute */
.hero { display: grid; }
.hero > * { grid-area: 1 / 1; }
.hero > .caption { align-self: end; z-index: 1; }

/* Form with aligned labels */
.form { display: grid; grid-template-columns: max-content 1fr; gap: .5rem 1rem; align-items: baseline; }`,run:false}],
browser:`<p>Click the <b>grid</b> badge in Elements to overlay track sizes, line numbers, line names and area names (Firefox pioneered this; Chrome/Edge/Safari have equivalents with a Layout pane for toggling multiple grids). Grid, <code>gap</code>, <code>minmax()</code>, <code>auto-fit</code> and <code>subgrid</code> are supported in all current engines; masonry/"grid lanes" layout is still being standardized and isn't universally available, so ship it behind <code>@supports</code> with a regular grid fallback. As with Flexbox, Node has no layout engine; test grid behavior in a real browser.</p>`,
gotchas:[`<code>1fr</code> = <code>minmax(auto, 1fr)</code>: long words, wide images or <code>&lt;pre&gt;</code> blow out "equal" columns; use <code>minmax(0, 1fr)</code>.`,`<code>auto-fill</code> vs <code>auto-fit</code> differ only when there are fewer items than tracks: fill keeps empty tracks, fit collapses them.`,`<code>minmax(250px, 1fr)</code> overflows on screens narrower than 250px; wrap the minimum in <code>min(250px, 100%)</code>.`,`<code>grid-auto-flow: dense</code> and explicit placement can make visual order differ from DOM/tab order.`,`Percent row heights and <code>height: 100%</code> need a definite container height; <code>1fr</code> rows need the grid to have a height to share.`,`Grid items are blockified: <code>display: inline</code> children become blocks, and margins don't collapse.`,`Negative line numbers (<code>-1</code>) refer to the explicit grid only, not implicit tracks.`],
best:[`Grid for macro layout and 2D components; Flexbox inside components; both with <code>gap</code>.`,`Name areas or lines for readable layouts; change layouts per breakpoint by redefining areas, not by moving HTML.`,`Use intrinsic patterns (<code>auto-fit</code>, <code>minmax</code>, <code>min()</code>) first and breakpoints second.`,`Use <code>subgrid</code> to align repeated components (cards, forms) instead of fixed heights.`],
iq:[["fresher","What does the fr unit do?","It represents a fraction of the leftover space in the grid container after fixed-size tracks and gaps are subtracted. 1fr 2fr splits the remainder one-third / two-thirds."],["mid","Difference between auto-fill and auto-fit?","Both create as many tracks as fit. With fewer items than tracks, auto-fill keeps the empty tracks (items keep their minimum-ish size), while auto-fit collapses the empty tracks to zero so the existing items stretch to fill the row."],["mid","Why are my 1fr columns not equal?","1fr has an automatic minimum (minmax(auto, 1fr)), so a track can't be smaller than its content's min-content size. A long word or image forces it wider. Use minmax(0, 1fr) and handle overflow inside the item."],["senior","What problem does subgrid solve?","Nested grids normally define their own tracks, so parts of sibling cards (titles, bodies, buttons) don't line up when content length differs. subgrid lets the nested grid adopt the parent's row or column tracks, so the parts share track sizes and align across cards without fixed heights."],["senior","How do you build a responsive layout with minimal media queries?","Intrinsic sizing: repeat(auto-fit, minmax(min(15rem, 100%), 1fr)) for galleries, flex-wrap with flex-basis for rows, clamp() for type and spacing, container queries for components, and only a few page-level breakpoints that redefine grid-template-areas."],["lead","How would you define layout primitives for a design system?","A small set of composable primitives (Stack, Cluster, Sidebar, Switcher, Grid, Center, Cover) built on flex/grid with gap and custom-property tokens, documented with examples, so product teams compose layouts instead of writing ad-hoc CSS; components then only handle their own internals."]],
practice:[`Build a dashboard: header, collapsible sidebar, main area with a 12-column grid of widgets that span 3/6/12 columns at different container widths.`,`Build a product-card gallery with <code>subgrid</code> so images, titles, prices and buttons align across each row.`,`Recreate a magazine layout with an image and a caption overlapping using grid areas only (no absolute positioning).`],
teach:`<p>"Grid is a chessboard you design: say how many columns and rows and how wide each is, with fr meaning 'a share of what's left'. Then place pieces by line numbers or named areas, or let them auto-place. Rows and columns always line up across the board, which is exactly what Flexbox can't do."</p>`}
],quiz:[
{code:`const box = document.createElement('div');
box.style.cssText = 'display:flex;width:300px;position:absolute;left:-9999px';
box.innerHTML = '<div style="flex:1">a much longer label</div><div style="flex:2">b</div>';
document.body.append(box);
const [a, b] = box.children;
console.log(a.style.flexBasis, a.offsetWidth, b.offsetWidth);
box.remove();`,ans:`0% 100 200`,why:`<code>flex: 1</code> expands to <code>flex-grow: 1; flex-shrink: 1; flex-basis: 0%</code>. With a zero basis, the content size is ignored and all 300px are shared 1:2 (the label is still short enough not to hit <code>min-width: auto</code>).`},
{code:`const g = document.createElement('div');
g.style.cssText = 'display:grid;width:420px;gap:10px;grid-template-columns:100px 1fr 2fr;position:absolute;left:-9999px';
g.append(document.createElement('div'));
document.body.append(g);
const cols = () => getComputedStyle(g).gridTemplateColumns;
console.log(cols());
g.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
console.log(cols());
g.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
console.log(cols());
g.remove();`,ans:`100px 100px 200px / 205px 205px / 420px 0px (one per line)`,why:`First: 420 − 100 − 2×10 gaps = 300px of free space, shared 1:2. Then two 150px tracks fit (2×150 + 10 ≤ 420, three would need 470), and they grow to (420 − 10) / 2 = 205px each. With <code>auto-fit</code> the empty second track (and its gap) collapses to 0, so the single item gets the full 420px.`}]},

{n:59,title:"Responsive and modern CSS",goal:"Build interfaces that adapt to any screen, container, language direction and user preference, using the modern CSS features that replaced most preprocessor and JavaScript tricks.",topics:[
{id:"d59-responsive",title:"Responsive design: media queries, container queries, units and clamp()",lv:["fresher","mid","senior"],
eli5:`<p>Think of <b>water</b>: pour it into a glass, a bowl or a bottle and it takes the shape of the container. A responsive page behaves like water. <b>Media queries</b> ask "how big is the whole room (the screen)?"; <b>container queries</b> ask "how big is the box I've been put in?", which is smarter, because the same card can sit in a wide main column or a narrow sidebar. Units like <code>rem</code> and <code>clamp()</code> are like saying "make the text this size, but never smaller than <i>this</i> or bigger than <i>that</i>". And logical properties say "start" and "end" instead of "left" and "right", so the page also works for languages written right to left.</p>`,
why:`<p>Most traffic is mobile, screens range from watches to ultrawide monitors, users zoom text to 200%, and components are reused in containers of every size. Hard-coded pixel layouts break in all of these situations. Modern responsive CSS (container queries, <code>clamp()</code>, intrinsic layouts, logical properties and preference queries) adapts with far less code and fewer breakpoints than the old "mobile, tablet, desktop" approach, and is required for WCAG reflow (320 CSS px wide without horizontal scrolling) and text-resize criteria.</p>`,
tech:`<ul class="pts"><li><b>Viewport meta:</b> <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code> or mobile browsers render at ~980px and shrink. Never disable zoom (<code>user-scalable=no</code>).</li><li><b>Media queries:</b> <code>@media (min-width: 48rem) { ... }</code>; range syntax <code>@media (48rem &lt;= width &lt; 64rem)</code>; mobile-first means base styles for small screens and <code>min-width</code> queries layering on enhancements. Breakpoints in <code>em</code>/<code>rem</code> respect the user's font-size setting. Media queries can't use custom properties.</li><li><b>Preference and capability queries:</b> <code>prefers-color-scheme</code>, <code>prefers-reduced-motion</code>, <code>prefers-contrast</code>, <code>forced-colors</code> (Windows high contrast), <code>prefers-reduced-transparency</code>, <code>hover: hover</code> and <code>pointer: coarse/fine</code> (touch vs mouse; prefer these over guessing from width), <code>orientation</code>, <code>resolution</code>, <code>print</code>. In JS: <code>matchMedia(q).matches</code> and its <code>change</code> event.</li><li><b>Container queries:</b> mark a container with <code>container-type: inline-size</code> (optionally <code>container-name</code>, or shorthand <code>container: card / inline-size</code>), then <code>@container card (min-width: 30rem) { ... }</code> styles its <b>descendants</b> based on the container's width. Container units <code>cqi</code>/<code>cqb</code>/<code>cqw</code>/<code>cqh</code>/<code>cqmin</code> are % of the container. A container can't style itself from its own query, and <code>inline-size</code> containment means its width can't depend on its content. <b>Style queries</b> (<code>@container style(--variant: compact)</code>) for custom properties work in Chromium and Safari; check support before relying on them. Scroll-state queries (stuck/snapped) are Chromium-only so far.</li><li><b>Units:</b> <code>px</code> (CSS pixel, not device pixel), <code>rem</code> (root font size, usually 16px: use for type and spacing so zoom/text-size settings scale everything), <code>em</code> (current font size; compounds when nested; good for padding that tracks a component's text), <code>%</code> (of the containing block), <code>ch</code> (width of "0": <code>max-width: 65ch</code> for readable lines), <code>vw/vh</code>, and the <b>dynamic viewport</b> units <code>svh</code> (small: toolbars shown), <code>lvh</code> (large), <code>dvh</code> (tracks the toolbar) to fix the mobile <code>100vh</code> bug. <code>lh</code>/<code>rlh</code> = line-height units.</li><li><b>Math functions:</b> <code>calc()</code>, <code>min()</code>, <code>max()</code>, <code>clamp(MIN, PREFERRED, MAX)</code>. Fluid type: <code>font-size: clamp(1rem, 0.9rem + 0.8vw, 1.5rem)</code>; always include a <code>rem</code> term so zoom still works (pure <code>vw</code> text doesn't scale with zoom, a WCAG failure). Fluid width: <code>width: min(100% - 2rem, 70rem)</code>.</li><li><b>Logical properties:</b> <code>margin-inline-start</code> instead of <code>margin-left</code>, <code>padding-block</code>, <code>inset-inline-end</code>, <code>border-start-start-radius</code>, <code>inline-size</code>/<code>block-size</code>, <code>text-align: start</code>. They follow <code>dir="rtl"</code> (Arabic, Hebrew) and vertical <code>writing-mode</code> automatically, so one stylesheet serves every language. Set <code>dir</code> in HTML (not just CSS <code>direction</code>).</li><li><b>Intrinsic first:</b> flex-wrap, <code>auto-fit</code> grids, <code>max-width</code> instead of <code>width</code>, <code>aspect-ratio</code>, responsive images (Day 56). Breakpoints are where the <b>content</b> breaks, not device sizes.</li></ul>`,
diagram:{html:lanes([["@media (the viewport)",["page layout: 1 → 2 → 3 columns","navigation: hamburger vs bar","prefers-reduced-motion / color-scheme","hover / pointer capability"]],["@container (the parent box)",["card: stacked → side-by-side","widget in sidebar vs main","cqi units for fluid component type"]],["intrinsic (no query)",["flex-wrap + basis","repeat(auto-fit, minmax())","clamp() type and spacing","max-width: 65ch"]]]),steps:["Start intrinsic: let flex/grid and <code>clamp()</code> adapt without any query.","Use container queries for components, so they adapt wherever they're placed.","Use media queries for page-level layout and for user preferences and device capabilities.","Use logical properties everywhere so RTL and vertical writing modes work without overrides."]},
ex:[{t:"Container queries, cqi units, clamp() and media queries measured (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const style = document.createElement("style");
style.textContent = [
  ".cq-wrap { container: card / inline-size; }",
  ".cq-card { display: grid; gap: 8px; }",
  ".cq-title { font-size: clamp(16px, 10cqi, 32px); }",
  "@container card (min-width: 400px) { .cq-card { grid-template-columns: 120px 1fr; } }"
].join("\\n");
const wrap = document.createElement("div");
wrap.className = "cq-wrap";
wrap.style.cssText = "position:absolute;left:-9999px;top:0;width:300px";
wrap.innerHTML = '<div class="cq-card"><img alt="" width="120" height="80"><h3 class="cq-title">Trail Pro</h3></div>';
document.body.append(style, wrap);
const card = wrap.firstChild, title = wrap.querySelector("h3");
const columns = () => getComputedStyle(card).gridTemplateColumns.split(" ").length;

check("300px container: stacked (1 column)", columns() === 1);
wrap.style.width = "500px";
check("500px container: side by side (2 columns) - same viewport, different container", columns() === 2);
const sizes = [100, 250, 500].map((w) => { wrap.style.width = w + "px"; return getComputedStyle(title).fontSize; });
console.log("clamp(16px, 10cqi, 32px) at 100/250/500px containers ->", sizes.join(" / "));
check("clamp() floors at 16px, scales with the container, caps at 32px", sizes.join() === "16px,25px,32px");

// media queries: same values from JS
const w = innerWidth;
check("matchMedia sees the same width as CSS ('(min-width: " + w + "px)' matches)", matchMedia("(min-width: " + w + "px)").matches && !matchMedia("(min-width: " + (w + 1) + "px)").matches);
check("range syntax works too", matchMedia("(width >= " + (w - 1) + "px)").matches);
console.log("user preferences right now:", {
  dark: matchMedia("(prefers-color-scheme: dark)").matches,
  reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  hoverCapable: matchMedia("(hover: hover)").matches,
  coarsePointer: matchMedia("(pointer: coarse)").matches
});
check("dynamic viewport units are supported", CSS.supports("height", "100dvh") && CSS.supports("height", "100svh"));
style.remove(); wrap.remove();`},
{t:"rem vs em, logical properties in RTL (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
const box = document.createElement("div");
box.style.cssText = "position:absolute;left:-9999px;top:0;width:300px;font-size:20px";
box.innerHTML =
  '<ul style="font-size:1.5em"><li style="font-size:1.5em"><span id="em">em</span></li></ul>' +
  '<ul style="font-size:1.5rem"><li style="font-size:1.5rem"><span id="rem">rem</span></li></ul>' +
  '<p id="ltr" style="margin:0;margin-inline-start:20px;padding-inline-end:5px;text-align:start">Hello</p>' +
  '<p id="rtl" dir="rtl" style="margin:0;margin-inline-start:20px;padding-inline-end:5px;text-align:start">مرحبا</p>';
document.body.append(box);
const cs = (id) => getComputedStyle(box.querySelector("#" + id));
console.log("root font-size:", root + "px; nested 1.5em ->", cs("em").fontSize, "; nested 1.5rem ->", cs("rem").fontSize);
check("em compounds: 20 x 1.5 x 1.5 = 45px", cs("em").fontSize === "45px");
check("rem doesn't compound: always 1.5 x root", parseFloat(cs("rem").fontSize) === root * 1.5);
check("LTR: margin-inline-start is margin-left", cs("ltr").marginLeft === "20px" && cs("ltr").paddingRight === "5px");
check("RTL: the same rule becomes margin-right / padding-left", cs("rtl").marginRight === "20px" && cs("rtl").marginLeft === "0px" && cs("rtl").paddingLeft === "5px");
check("text-align:start follows the direction", cs("rtl").direction === "rtl" && cs("ltr").textAlign === "start");
box.remove();`},
{t:"A responsive component and page (reference CSS)",code:`/* Mobile-first page shell with rem-based breakpoints */
.shell { display: grid; gap: 1rem; padding-inline: max(1rem, env(safe-area-inset-left)); }
@media (min-width: 48rem) { .shell { grid-template-columns: 16rem minmax(0, 1fr); } }
@media (min-width: 80rem) { .shell { grid-template-columns: 16rem minmax(0, 1fr) 20rem; } }

/* Component adapts to wherever it is placed */
.product { container: product / inline-size; }
.product__inner { display: grid; gap: 1rem; }
@container product (min-width: 32rem) {
  .product__inner { grid-template-columns: 12rem 1fr; align-items: start; }
}
.product__title { font-size: clamp(1.1rem, 0.9rem + 2cqi, 1.75rem); }

/* Fluid type and spacing that still respect zoom */
:root {
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --step-3: clamp(1.75rem, 1.4rem + 1.8vw, 2.75rem);
  --space-m: clamp(1rem, 0.8rem + 1vw, 1.5rem);
}
.prose { max-inline-size: 65ch; margin-inline: auto; }

/* Full-height hero that respects mobile toolbars */
.hero { min-block-size: 100svh; }

/* Logical properties: works in LTR and RTL unchanged */
.callout { border-inline-start: 4px solid var(--accent); padding-inline: 1rem 0.5rem; }
.icon-after { margin-inline-start: .5ch; }

/* Capabilities, not widths */
@media (hover: hover) and (pointer: fine) { .row:hover .row__actions { opacity: 1; } }
@media (pointer: coarse) { .btn { min-block-size: 44px; } }   /* comfortable touch targets */
@media (forced-colors: active) { .btn { border: 1px solid ButtonText; } }`,run:false}],
browser:`<p>Use DevTools <b>device mode</b> (Ctrl/Cmd+Shift+M) to test widths, DPR and touch; the Elements panel shows a <b>container</b> badge and highlights which <code>@container</code> rules match; <b>Rendering → Emulate CSS media feature</b> toggles <code>prefers-color-scheme</code>, <code>prefers-reduced-motion</code>, <code>forced-colors</code> and more. Also test browser zoom at 200% and a 320px-wide viewport (WCAG reflow). Size container queries, container units, range syntax, dynamic viewport units and logical properties are supported in all current engines; container <b>style</b> queries and scroll-state queries are not yet universal. On the server (Node), you can't know the viewport: send the same HTML/CSS and let CSS adapt; client hints (<code>Sec-CH-Viewport-Width</code>, Chromium-only) are a hint, not a layout strategy.</p>`,
gotchas:[`Without the viewport meta tag, phones render a ~980px desktop layout and scale it down, so your media queries never match.`,`<code>100vh</code> on mobile is the <i>large</i> viewport and hides content behind toolbars; use <code>svh</code>/<code>dvh</code>.`,`Text sized only in <code>vw</code> doesn't grow with zoom (WCAG 1.4.4 failure); always mix in <code>rem</code> inside <code>clamp()</code>.`,`<code>em</code> compounds through nesting (lists in lists get bigger and bigger); <code>em</code> in media queries is relative to the initial font size, not your root rule.`,`An element can't query itself: <code>@container</code> styles descendants of the container. Inline-size containment also means the container's width can't come from its children (it may collapse to 0 inside a shrink-to-fit parent).`,`Width-based "mobile vs desktop" guesses are wrong for tablets with keyboards and small laptop windows; use <code>hover</code>/<code>pointer</code> for input capabilities.`,`<code>left</code>/<code>right</code>, <code>margin-left</code> and <code>text-align: left</code> break RTL layouts; logical properties don't.`,`Custom properties can't be used inside media query conditions (<code>@media (min-width: var(--bp))</code> is invalid).`],
best:[`Mobile-first, intrinsic layouts first, container queries for components, media queries for page layout and preferences.`,`<code>rem</code> for type, spacing and breakpoints; <code>clamp()</code> with a <code>rem</code> term for fluid sizes; <code>ch</code> for line length.`,`Logical properties by default; set <code>lang</code> and <code>dir</code> on <code>&lt;html&gt;</code>.`,`Test at 320px, 200% zoom, landscape phones, touch and keyboard, RTL and forced-colors.`],
iq:[["fresher","What is the difference between rem, em and px?","px is a fixed CSS pixel. rem is relative to the root element's font size (usually 16px), so it scales with user settings and doesn't compound. em is relative to the element's own font size (or the parent's for font-size itself), so it compounds when nested."],["mid","Media queries vs container queries?","Media queries respond to the viewport or device (width, preferences, pointer). Container queries respond to the size of an ancestor container marked with container-type, so a component adapts to the space it's given wherever it's placed. Use media queries for page layout and preferences, container queries for reusable components."],["mid","How does clamp() help with fluid typography?","clamp(min, preferred, max) returns the preferred value bounded by min and max. clamp(1rem, 0.9rem + 1vw, 1.5rem) grows smoothly with the viewport but never below 1rem or above 1.5rem; the rem part keeps it scaling with zoom."],["senior","Why use logical properties?","They map to physical sides based on writing mode and direction, so margin-inline-start is left in English and right in Arabic, and block/inline swap in vertical writing modes. One stylesheet supports every language and avoids RTL override files."],["senior","What's the problem with 100vh on mobile and how do you fix it?","Mobile browsers' toolbars expand and collapse; vh historically equals the largest viewport, so 100vh content is hidden behind the toolbar. Use svh (smallest viewport, always visible), lvh, or dvh (updates with the toolbar; can cause relayout while scrolling)."],["lead","How would you define a responsive strategy for a design system?","Fluid type and space scales with clamp() as tokens, a few rem-based page breakpoints, container queries inside components, layout primitives using intrinsic sizing, logical properties throughout, preference queries (motion, color scheme, contrast), and a test matrix (320px, zoom 200%, RTL, touch, forced colors) in visual regression tests."]],
practice:[`Build a product card that is stacked below 30rem, side-by-side above, and adds a third "specs" column above 50rem, using only container queries; place it in a sidebar and in main to see both.`,`Create a fluid type scale (5 steps) with <code>clamp()</code> and test it at 320px, 1440px and 200% zoom.`,`Convert a stylesheet from physical to logical properties and test it with <code>&lt;html dir="rtl"&gt;</code>.`],
teach:`<p>"Be like water. Start with layouts that bend on their own (wrap, auto-fit, clamp). Let components ask their container how big it is (container queries), let the page ask the screen and the user's preferences (media queries), size things in rem so zoom works, and say start/end instead of left/right so every language fits."</p>`},

{id:"d59-modern-css",title:"Modern CSS: custom properties, :has(), nesting and color functions",lv:["mid","senior","lead"],
eli5:`<p>Custom properties are <b>labelled paint pots</b>: you name a pot "brand blue" once, and every wall that uses that pot changes when you repaint the pot, even while the house is lived in (at runtime). <code>:has()</code> lets you say "paint the <i>box</i> red if it <b>has</b> a broken toy inside", so a parent can react to its children for the first time. Nesting lets you write instructions grouped by room instead of repeating the room's name on every line. And the new color functions are a <b>paint mixer</b>: "mix this blue with 20% white" or "the same color but darker", right in CSS.</p>`,
why:`<p>For years teams needed Sass for variables and nesting, JavaScript for "style the parent when a child is checked/invalid/empty", and design tools for color variations. All of that is now native: custom properties power theming and design tokens at runtime, <code>:has()</code> removes a whole class of JS state toggling, nesting is supported everywhere, and <code>oklch()</code>/<code>color-mix()</code>/relative colors generate accessible palettes and themes (including dark mode with <code>light-dark()</code>).</p>`,
tech:`<ul class="pts"><li><b>Custom properties:</b> <code>--brand: oklch(55% 0.2 260);</code> used with <code>var(--brand, fallback)</code>. They <b>cascade and inherit</b> like normal properties (scope them to <code>:root</code>, a theme class or a component), are resolved at <b>computed-value time</b> (not preprocessor time), and can be read/written from JS: <code>el.style.setProperty('--x', '10px')</code>, <code>getComputedStyle(el).getPropertyValue('--x')</code>. Unregistered values are just token streams: <code>--size: 20</code> then <code>calc(var(--size) * 1px)</code>.</li><li><b>Invalid at computed-value time:</b> if <code>var()</code> substitutes something invalid (e.g. a color into <code>margin</code>), the declaration doesn't fall back to an earlier rule; the property becomes <code>unset</code> (inherited or initial). Fallbacks only apply when the variable is missing.</li><li><b><code>@property</code></b> registers a typed custom property: <code>@property --angle { syntax: '&lt;angle&gt;'; inherits: false; initial-value: 0deg; }</code>. Registered properties are type-checked, computed (e.g. <code>calc()</code> is resolved), can opt out of inheritance and can be <b>transitioned/animated</b> (gradients, progress rings), which unregistered ones can't.</li><li><b><code>:has()</code></b>, the "parent selector" (all modern engines): <code>.card:has(img)</code>, <code>form:has(:user-invalid) .submit</code>, <code>label:has(+ input:required)</code> (previous sibling), <code>body:has(dialog[open])</code> (scroll lock), quantity queries <code>ul:has(&gt; li:nth-child(6))</code>. Specificity = its most specific argument. Avoid very broad selectors like <code>body:has(*:hover)</code> on huge DOMs (invalidation cost). Use <code>@supports selector(:has(a))</code> to gate.</li><li><b>Other modern selectors:</b> <code>:is()</code>/<code>:where()</code> (Day 57), <code>:focus-visible</code> (keyboard focus rings only), <code>:focus-within</code>, <code>:user-invalid</code>, <code>:nth-child(2 of .selected)</code>, <code>:not(a, b)</code> lists, <code>:popover-open</code>, <code>:modal</code>.</li><li><b>Native nesting:</b> <code>.card { padding: 1rem; &amp;:hover { ... } .title { ... } @media (width &gt; 40rem) { ... } }</code>. <code>&amp;</code> refers to the parent selector (and is behaves like <code>:is(parent)</code>, so specificity follows <code>:is</code> rules); <code>.theme-dark &amp;</code> puts the parent last. Unlike Sass, you can't concatenate strings (<code>&amp;__title</code> is not BEM concatenation).</li><li><b>Color:</b> <code>oklch(L C H)</code> is perceptually uniform (equal L steps look equally lighter; great for palettes and contrast) and reaches wide-gamut P3 colors; <code>color-mix(in oklch, var(--brand) 80%, white)</code> mixes; <b>relative color syntax</b> derives variants: <code>oklch(from var(--brand) calc(l - 0.1) c h)</code> (darker), <code>rgb(from var(--brand) r g b / 50%)</code> (transparent). <code>light-dark(#111, #eee)</code> picks by <code>color-scheme</code>. <code>currentColor</code> reuses the text color.</li><li><b>Also worth knowing (2026):</b> <code>@supports</code> for feature detection; <code>text-wrap: balance</code> (headings) and <code>pretty</code> (paragraphs); <code>accent-color</code> to theme native checkboxes; <code>interpolate-size: allow-keywords</code>/<code>calc-size()</code> to animate to <code>height: auto</code> (Chromium so far); CSS <b>anchor positioning</b> (<code>anchor-name</code>/<code>position-anchor</code>) for tooltips and popovers, landed across engines recently, so verify support for your audience; scroll-driven animations (Day 60).</li></ul>`,
diagram:{html:flow([[":root tokens","--brand: oklch(55% .2 260)"],[".theme-dark overrides","--brand: oklch(75% .15 260)","w"],["component","color-mix(in oklch, var(--brand) 20%, white)","w"],["state via :has()",".card:has(:checked) { --brand: ... }","g"],["computed value","resolved per element at runtime","g"]]),steps:["Design tokens live in custom properties on <code>:root</code>.","Themes and components override them in narrower scopes; inheritance passes them down.","Derived colors are computed in CSS with <code>color-mix()</code> or relative color syntax, so changing one token updates the whole palette.","<code>:has()</code> lets an ancestor change its tokens based on its descendants' state, without JavaScript."]},
ex:[{t:"Custom properties, @property, :has() and nesting in the live cascade (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const style = document.createElement("style");
style.textContent = [
  "@property --mc-angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }",
  ".mc { --gap: 8px; --brand: rgb(0, 0, 255); padding: var(--gap); color: var(--brand); }",
  ".mc.dense { --gap: 2px; }",                                        // override the token, not the property
  ".mc .badge { border: 1px solid var(--brand); margin: var(--brand); }",  // invalid at computed time
  ".mc:has(input:checked) { --brand: rgb(0, 128, 0); }",            // parent reacts to child state
  ".mc:has(> img) { outline: 3px solid; }",
  ".mc { & .title { font-weight: 700; } &.dense .title { font-weight: 300; } }"   // native nesting
].join("\\n");
const el = document.createElement("div");
el.className = "mc";
el.style.cssText = "position:absolute;left:-9999px";
el.innerHTML = '<span class="badge">new</span><h3 class="title">T</h3><label><input type="checkbox"> pick</label>';
document.body.append(style, el);
const cs = (s) => getComputedStyle(s ? el.querySelector(s) : el);

check("var() resolves the token: padding 8px, color blue", cs().paddingTop === "8px" && cs().color === "rgb(0, 0, 255)");
el.classList.add("dense");
check("overriding the variable in a narrower scope changes every use", cs().paddingTop === "2px");
check("custom properties inherit into children", cs(".badge").borderTopColor === "rgb(0, 0, 255)");
check("a color substituted into margin is invalid at computed time -> margin falls back to initial 0", cs(".badge").marginTop === "0px");
el.querySelector("input").checked = true;
check(":has(input:checked) restyles the PARENT (and its children via the token)", cs().color === "rgb(0, 128, 0)" && cs(".badge").borderTopColor === "rgb(0, 128, 0)");
check(":has(> img) does not match yet", cs().outlineStyle === "none");
el.append(document.createElement("img"));
check("adding a direct img child makes :has(> img) match", cs().outlineStyle === "solid");
check("nesting: & .title and &.dense .title both work", cs(".title").fontWeight === "300");
el.classList.remove("dense");
check("...and without .dense the outer nested rule applies", cs(".title").fontWeight === "700");

el.style.setProperty("--mc-angle", "calc(90deg + 0.5turn)");
el.style.setProperty("--raw", "calc(90deg + 0.5turn)");
console.log("registered --mc-angle:", cs().getPropertyValue("--mc-angle"), "| unregistered --raw:", cs().getPropertyValue("--raw"));
check("@property values are typed and computed (270deg)", cs().getPropertyValue("--mc-angle") === "270deg");
check("inherits:false: children get the initial value", cs(".title").getPropertyValue("--mc-angle") === "0deg");
style.remove(); el.remove();`},
{t:"Color math: oklch, color-mix, relative colors and light-dark (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const el = document.createElement("div");
document.body.append(el);
const color = (v, scheme) => { el.style.colorScheme = scheme || "light"; el.style.color = ""; el.style.color = v; return getComputedStyle(el).color; };
const show = (v) => console.log(v.padEnd(48), "->", color(v));
[
  "oklch(70% 0.15 200)",
  "color-mix(in srgb, red 50%, blue)",
  "color-mix(in oklch, red, blue)",
  "rgb(from red r g 255)",
  "oklch(from #3366ff calc(l - 0.2) c h)",
  "rgb(from rgb(255 0 0) r g b / 50%)"
].forEach(show);
check("color-mix in sRGB averages the channels", color("color-mix(in srgb, red 50%, blue)") === "color(srgb 0.5 0 0.5)");
check("relative color: keep r and g, set b to 255 (red -> magenta)", color("rgb(from red r g 255)") === "color(srgb 1 0 1)");
const L = (v) => parseFloat(color(v).match(/oklch\\(([\\d.]+)/)[1]);
check("relative oklch: lower lightness by 0.2 keeps hue", Math.abs(L("oklch(from oklch(0.7 0.1 250) calc(l - 0.2) c h)") - 0.5) < 1e-6);
check("light-dark() follows color-scheme (light)", color("light-dark(rgb(0, 0, 0), rgb(255, 255, 255))", "light") === "rgb(0, 0, 0)");
check("light-dark() follows color-scheme (dark)", color("light-dark(rgb(0, 0, 0), rgb(255, 255, 255))", "dark") === "rgb(255, 255, 255)");
check("feature detection with CSS.supports", CSS.supports("color", "oklch(50% 0.1 200)") && CSS.supports("selector(:has(a))"));
el.remove();`,note:`Mixing in <code>oklch</code> keeps the mix vivid (red + blue gives a saturated purple), while sRGB mixing goes through duller midpoints. Because oklch lightness is perceptual, "L 0.2 lower" looks equally darker for every hue, which makes generated hover/active states consistent.`},
{t:"A token-based, themeable component with modern CSS (reference CSS)",code:`@layer tokens, components;

@layer tokens {
  :root {
    color-scheme: light dark;
    --brand: oklch(55% 0.19 260);
    --surface: light-dark(oklch(99% 0 0), oklch(20% 0.01 260));
    --text: light-dark(oklch(20% 0.02 260), oklch(95% 0.01 260));
    --radius: .5rem;
  }
  [data-theme="forest"] { --brand: oklch(55% 0.15 150); }   /* re-theme = change one token */
}

@property --progress { syntax: "<percentage>"; inherits: false; initial-value: 0%; }

@layer components {
  .button {
    --_bg: var(--brand);                                    /* private, component-scoped token */
    background: var(--_bg);
    color: white;
    border-radius: var(--radius);
    transition: background-color .15s;

    &:hover { --_bg: oklch(from var(--brand) calc(l - 0.08) c h); }
    &:active { --_bg: color-mix(in oklch, var(--brand) 80%, black); }
    &:focus-visible { outline: 3px solid color-mix(in oklch, var(--brand) 60%, white); outline-offset: 2px; }
    &[aria-disabled="true"] { --_bg: oklch(from var(--brand) l 0 h); cursor: not-allowed; }   /* grayscale */
  }

  .field:has(:user-invalid) { --brand: oklch(55% 0.2 25); }      /* red when the child input is invalid */
  .field:has(:focus-visible) label { color: var(--brand); }

  .ring {                                                       /* animatable thanks to @property */
    background: conic-gradient(var(--brand) var(--progress), transparent 0);
    transition: --progress .6s ease;
  }
}

@supports not selector(:has(a)) { /* fallback styles for old browsers */ }`,run:false}],
browser:`<p>DevTools shows custom properties in Styles (hover a <code>var()</code> to see its resolved value; click to jump to the definition), flags invalid-at-computed-time values, shows color swatches with a picker that converts between hex, rgb, hsl, oklch and display-p3, and lists registered <code>@property</code> rules. Custom properties, <code>@property</code>, <code>:has()</code>, native nesting, <code>oklch()</code>, <code>color-mix()</code>, relative color syntax and <code>light-dark()</code> are all supported in current Chrome, Edge, Firefox and Safari; anchor positioning, <code>calc-size()</code> and style queries are newer, so check your browser analytics and use <code>@supports</code>. In Node/build tooling, Lightning CSS or PostCSS can down-level nesting and some color functions for older targets (e.g. via a browserslist query).</p>`,
gotchas:[`<code>var()</code> fallbacks apply only when the variable is <b>undefined</b>; a defined but wrong value makes the property invalid at computed time (it becomes <code>unset</code>, not the previous rule's value).`,`Unregistered custom properties can't be transitioned or animated (they flip at 50%); register them with <code>@property</code>.`,`Custom properties can't be used in media query conditions or selectors, and <code>--x: 10</code> with <code>var(--x)px</code> doesn't concatenate; use <code>calc(var(--x) * 1px)</code>.`,`Custom property names are case-sensitive (<code>--Brand</code> ≠ <code>--brand</code>).`,`Nesting's <code>&amp;</code> is not string concatenation: <code>&amp;__title</code> is not BEM; and nested selectors have <code>:is()</code>-style specificity (the max of a selector list).`,`Broad <code>:has()</code> selectors on <code>body</code>/<code>html</code> can trigger expensive style invalidation on large, frequently changing DOMs.`,`<code>:has()</code> can't be nested inside another <code>:has()</code>, and pseudo-elements aren't allowed inside it.`,`Mixing colors in sRGB gives muddy midpoints and uneven lightness; prefer <code>in oklch</code> or <code>in oklab</code>. Out-of-gamut oklch values are clipped on sRGB screens.`],
best:[`Model design tokens as custom properties (global → semantic → component), override tokens rather than properties, and prefix private component tokens (<code>--_bg</code>).`,`Register animatable or typed tokens with <code>@property</code>; keep JS interaction to <code>setProperty</code> on a token.`,`Use <code>:has()</code> for state-driven styling instead of toggling classes from JS when the state already lives in the DOM (checked, invalid, open, empty).`,`Build palettes in <code>oklch</code>, derive states with relative colors/<code>color-mix()</code>, and verify contrast for every theme.`],
iq:[["mid","How do CSS custom properties differ from Sass variables?","Sass variables are compiled away at build time and are static. Custom properties live in the browser: they cascade, inherit, can be scoped to elements, changed at runtime (media queries, :hover, JS) and read with getComputedStyle, which enables theming and dark mode without rebuilding CSS."],["mid","What is :has() and give three uses.","A relational pseudo-class that matches an element if the relative selector inside matches something relative to it: a 'parent selector'. Uses: .card:has(img) layout variants, form:has(:user-invalid) to show an error summary, body:has(dialog[open]) to lock scrolling, label:has(+ input:required) for previous-sibling styling."],["senior","What does 'invalid at computed-value time' mean?","Because var() is substituted after the cascade, the browser can't drop a declaration at parse time. If the substituted value is invalid for the property, the declaration still wins the cascade but the property behaves as unset (inherit or initial), rather than falling back to an earlier valid declaration. @property registration and type-checked tokens reduce this risk."],["senior","Why would you use oklch() and color-mix() for a design system?","OKLCH is perceptually uniform: equal lightness steps look equal across hues, so generated scales and hover/active states are consistent and contrast is predictable, and it can express wide-gamut colors. color-mix() and relative color syntax derive variants from one token at runtime, so themes change by editing a few base tokens."],["lead","How would you roll out modern CSS features safely across a product?","Check usage analytics against support data (Baseline status), progressive enhancement with @supports and fallbacks, build-time transforms where cheap (nesting via Lightning CSS), lint for unsupported features against a browserslist target, visual regression tests across engines, and document which features are allowed in the design-system guidelines."],["architect","How would you design theming for a multi-brand white-label app?","Three-tier tokens as custom properties: primitive palette (oklch), semantic tokens (surface, text, accent, danger) and component tokens; brands and color schemes override only semantic tokens in a [data-brand] or layer scope; derive states with color-mix/relative color; ship tokens from a single source (JSON → CSS/iOS/Android); validate contrast automatically per brand and scheme; no runtime CSS-in-JS needed."]],
practice:[`Build a theme switcher with three brand themes and light/dark using only custom properties, <code>light-dark()</code> and one <code>data-theme</code> attribute.`,`Replace a JS "toggle class on parent when checkbox changes" with a <code>:has()</code> selector; then make an error summary appear when any field is <code>:user-invalid</code>.`,`Animate a circular progress ring using a registered <code>--progress</code> property and a <code>conic-gradient</code>.`],
teach:`<p>"Custom properties are labelled paint pots: repaint the pot and every wall changes, live. :has() finally lets a box react to what's inside it. Nesting groups rules by component. And the new color functions are a mixer: start from one brand color in oklch and derive lighter, darker and transparent versions right in CSS."</p>`}
],quiz:[
{code:`const d = document.createElement('div');
d.style.cssText = 'font-size:20px;position:absolute;left:-9999px';
d.innerHTML = '<p style="font-size:1.5em;padding:1em;margin:1rem 0 0">x</p>';
document.body.append(d);
const cs = getComputedStyle(d.firstChild);
console.log(cs.fontSize, cs.paddingTop, cs.marginTop);
d.remove();`,ans:`30px 30px 16px`,why:`<code>font-size: 1.5em</code> is relative to the parent's 20px, giving 30px; <code>padding: 1em</code> is relative to the element's <i>own</i> font size (30px); <code>1rem</code> uses the root element's font size, which is the 16px default on this page.`},
{code:`const d = document.createElement('div');
d.style.cssText = '--size: 20; --c: red; width: calc(var(--size) * 1px); color: var(--missing, var(--c)); margin-top: var(--c);';
document.body.append(d);
const cs = getComputedStyle(d);
console.log(cs.width, cs.color, cs.marginTop);
d.remove();`,ans:`20px rgb(255, 0, 0) 0px`,why:`Multiplying the unitless token by <code>1px</code> gives 20px. <code>--missing</code> is undefined, so its fallback (<code>var(--c)</code>, red) is used. <code>margin-top: red</code> is invalid at computed-value time, so margin-top becomes <code>unset</code>, i.e. its initial value 0px.`}]},

{n:60,title:"Motion and CSS architecture",goal:"Add motion that is smooth, purposeful and respectful of user preferences, and organize CSS so it scales across teams and stays fast.",topics:[
{id:"d60-css-motion",title:"Transitions, animations and View Transitions",lv:["mid","senior","lead"],
eli5:`<p>A <b>transition</b> is a door with a slow-close hinge: you say where the door should end up, and it glides there instead of slamming. An <b>animation</b> is a dance routine written down step by step (keyframes) that can loop and play by itself. A <b>View Transition</b> is a magician's trick: the browser takes a photo of the old scene, you change the scene behind a curtain, and then it smoothly morphs the photo into the new scene. Some moves are easy for the browser (sliding and fading a finished picture, done by a separate helper called the compositor), while others (changing an object's size) force it to redraw the whole room every frame, which looks jerky.</p>`,
why:`<p>Motion explains change: where a panel came from, what was added, which item you selected. Done badly it's janky (dropped frames), slow (blocking interaction), or harmful: large movement can trigger nausea and migraines for people with vestibular disorders, which is why <code>prefers-reduced-motion</code> exists (WCAG 2.3.3). Knowing which properties are cheap to animate is also a classic performance interview topic.</p>`,
tech:`<ul class="pts"><li><b>Transitions:</b> <code>transition: transform .2s ease-out, opacity .2s;</code> animates between two computed values when a property changes (class toggle, <code>:hover</code>). Needs a start and end value: nothing animates from <code>display: none</code> or to <code>height: auto</code> by default. Events: <code>transitionrun</code>, <code>transitionstart</code>, <code>transitionend</code> (once per property, not fired if interrupted), <code>transitioncancel</code>. Avoid <code>transition: all</code>.</li><li><b>Entry/exit animations:</b> <code>@starting-style { opacity: 0 }</code> defines the "before" value for elements that just appeared (inserted or <code>display: none</code> → <code>block</code>); <code>transition-behavior: allow-discrete</code> lets <code>display</code> and <code>overlay</code> flip at the right moment so popovers and dialogs can animate out. Animating to <code>height: auto</code> needs <code>interpolate-size: allow-keywords</code> or <code>calc-size()</code> (Chromium so far) or the grid <code>0fr → 1fr</code> trick.</li><li><b>Keyframe animations:</b> <code>@keyframes pulse { from {...} 50% {...} to {...} }</code> + <code>animation: pulse 1s ease-in-out infinite alternate both;</code> (name, duration, easing, delay, iterations, direction, fill-mode, play-state). Events: <code>animationstart</code>/<code>iteration</code>/<code>end</code>. Easing: <code>ease</code>, <code>cubic-bezier()</code>, <code>steps()</code>, and <code>linear()</code> for springs and bounces.</li><li><b>Web Animations API:</b> <code>el.animate(keyframes, { duration, easing, fill })</code> returns an <code>Animation</code> with <code>play/pause/reverse/finish/cancel</code>, <code>currentTime</code>, <code>playbackRate</code> and a <code>finished</code> promise; <code>el.getAnimations()</code> also returns CSS transitions and animations (<code>CSSTransition</code>, <code>CSSAnimation</code>), so JS can await or scrub them.</li><li><b>The rendering pipeline:</b> style → layout → paint → composite. Animating <code>width</code>, <code>height</code>, <code>top</code>, <code>left</code>, <code>margin</code>, <code>font-size</code> triggers <b>layout</b> every frame; <code>background</code>, <code>color</code>, <code>box-shadow</code> trigger <b>paint</b>; <code>transform</code> and <code>opacity</code> (and usually <code>filter</code>) can run on the <b>compositor</b> thread, staying smooth even when the main thread is busy. So: move with <code>translate</code>, resize with <code>scale</code>, fade with <code>opacity</code>. <code>will-change: transform</code> promotes a layer ahead of time; use sparingly (each layer costs GPU memory) and remove when done.</li><li><b>Reduced motion:</b> <code>@media (prefers-reduced-motion: reduce)</code> → replace movement with fades or instant changes, stop autoplaying/parallax/looping animations; in JS check <code>matchMedia('(prefers-reduced-motion: reduce)')</code>. Reduce, don't necessarily remove: a quick fade still communicates change. Also avoid flashing more than three times per second (WCAG 2.3.1).</li><li><b>View Transitions:</b> same-document (SPA): <code>document.startViewTransition(() =&gt; updateDOM())</code> snapshots the old state, runs your update, then cross-fades old → new; give elements a <code>view-transition-name</code> to morph them individually (a thumbnail growing into a hero image), style with <code>::view-transition-old(name)</code>/<code>::view-transition-new(name)</code>/<code>::view-transition-group(name)</code>. It returns an object with <code>updateCallbackDone</code>, <code>ready</code>, <code>finished</code> and <code>skipTransition()</code>. Cross-document (MPA): <code>@view-transition { navigation: auto; }</code> on both pages of a same-origin navigation. Same-document transitions work in all current engines; cross-document ones are in Chromium and Safari, so feature-detect and treat them as enhancement.</li><li><b>Scroll-driven animations:</b> <code>animation-timeline: scroll()</code> (progress of a scroller) or <code>view()</code> (element entering/leaving the viewport) runs keyframes off the main thread for reading-progress bars and reveal effects; not in every engine yet, so gate with <code>@supports (animation-timeline: view())</code>.</li></ul>`,
diagram:{html:flow([["style","recalc selectors","w"],["layout","width, height, top, left, margin, font-size","r"],["paint","color, background, box-shadow, border-radius","w"],["composite","transform, opacity (filter)","g"]])+'<br>'+flow([["startViewTransition(cb)"],["snapshot old","screenshot of named parts","w"],["cb() updates DOM","rendering paused","w"],["snapshot new","live","w"],["animate ::view-transition-*","cross-fade / morph","g"]]),steps:["Changing a layout property re-runs layout, paint and composite every frame (expensive, main thread).","Paint-only properties skip layout but still repaint pixels on the main thread.","<code>transform</code> and <code>opacity</code> can be animated by the compositor alone, so they stay smooth even when JavaScript is busy.","A View Transition captures before/after snapshots and animates pseudo-elements, so the DOM update itself can be instant."]},
ex:[{t:"Transitions and animations are inspectable and scrubbable from JS (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const el = document.createElement("div");
el.style.cssText = "position:absolute;left:-9999px;width:50px;height:50px";
document.body.append(el);

// 1) A CSS transition shows up as a CSSTransition you can pause and scrub
el.style.transition = "opacity 1s linear";
el.style.opacity = "1";
getComputedStyle(el).opacity;           // force a style flush so the start value is "seen"
el.style.opacity = "0";                 // now this is a change -> transition starts
const [t] = el.getAnimations();
check("changing opacity created a " + (t && t.constructor.name), t instanceof CSSTransition && t.transitionProperty === "opacity");
t.pause(); t.currentTime = 250;
check("scrubbed to 25% of a linear 1 -> 0 fade: opacity 0.75", getComputedStyle(el).opacity === "0.75");
t.cancel();

// 2) Coming from display:none there is no "before" style, so nothing transitions
el.style.transition = "none"; el.style.opacity = "1"; getComputedStyle(el).opacity;
el.style.transition = "opacity 1s linear";
el.style.display = "none";
getComputedStyle(el).opacity;           // the browser now "sees" the element as display:none
el.style.display = "block";
el.style.opacity = "0";
check("from display:none there's no start value, so no transition", el.getAnimations().length === 0);

// 3) Web Animations API with a compositor-friendly property
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const a = el.animate(
  [{ transform: "translateX(0)" }, { transform: "translateX(100px)" }],
  { duration: reduce ? 0 : 1000, easing: "linear", fill: "forwards" }
);
a.pause(); a.currentTime = reduce ? 0 : 500;
console.log("reduced motion:", reduce, "| transform mid-way:", getComputedStyle(el).transform);
check("WAAPI: halfway through translateX(0 -> 100px) is 50px", reduce || getComputedStyle(el).transform === "matrix(1, 0, 0, 1, 50, 0)");
a.finish();
check("finish() jumps to the end and fill:forwards keeps it", getComputedStyle(el).transform === "matrix(1, 0, 0, 1, 100, 0)" && a.playState === "finished");
a.cancel();

// 4) transitionend fires once per property
el.style.transition = "opacity 60ms, transform 60ms";
el.style.opacity = "1"; el.style.transform = "none"; getComputedStyle(el).opacity;
const ended = [];
let done;
const bothEnded = new Promise((r) => { done = r; });
el.addEventListener("transitionend", (e) => { ended.push(e.propertyName); if (ended.length === 2) done(); });
el.style.opacity = "0.5"; el.style.transform = "scale(2)";
const timeout = new Promise((r) => setTimeout(r, 2500));   // safety net if frames are throttled
return Promise.race([bothEnded, timeout]).then(() => {
  console.log("transitionend events:", ended.join(", "));
  check("one transitionend per transitioned property", ended.length === 2 && ended.includes("opacity") && ended.includes("transform"));
  el.remove();
});`},
{t:"A View Transition around a DOM update, with a fallback (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
const list = document.createElement("ul");
list.style.cssText = "position:absolute;left:-9999px";
list.innerHTML = '<li style="view-transition-name: vt-demo-a">A</li><li style="view-transition-name: vt-demo-b">B</li>';
document.body.append(list);

function update(){ list.prepend(list.lastElementChild); }   // swap order: the "state change"

function withTransition(fn){
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) { fn(); return null; }   // progressive enhancement
  return document.startViewTransition(fn);
}

return (async () => {
  const vt = withTransition(update);
  if (vt) {
    await vt.updateCallbackDone;            // DOM is updated (snapshots taken around it)
    check("the update callback ran inside the transition", list.textContent === "BA");
    try { await vt.ready; console.log("pseudo-element tree created; animation running"); }
    catch (e) { console.log("transition skipped (" + e.name + "), DOM still updated"); }
    await vt.finished.catch(() => {});
    check("finished resolves after the animation", true);
  } else {
    console.log("View Transitions unavailable or reduced motion: updated instantly");
    check("fallback still updates the DOM", list.textContent === "BA");
  }
  list.remove();
})();`,note:`Unique <code>view-transition-name</code>s let each item morph from its old position to its new one; duplicate names on visible elements make the browser skip the transition. Keep the update callback fast: rendering is paused until it finishes.`},
{t:"Motion patterns done right (reference CSS)",code:`/* Hover lift: compositor-only properties */
.card { transition: transform .2s ease-out, box-shadow .2s ease-out; }
.card:hover { transform: translateY(-2px); }
/* cheaper shadow: fade a pre-rendered shadow layer instead of animating box-shadow */
.card::after { content: ""; position: absolute; inset: 0; box-shadow: 0 8px 24px rgb(0 0 0 / .2); opacity: 0; transition: opacity .2s; }
.card:hover::after { opacity: 1; }

/* Popover / dialog entry and exit, including display:none */
[popover], dialog {
  transition: opacity .2s, translate .2s, display .2s allow-discrete, overlay .2s allow-discrete;
  opacity: 0; translate: 0 8px;
}
:popover-open, dialog[open] { opacity: 1; translate: 0 0; }
@starting-style { :popover-open, dialog[open] { opacity: 0; translate: 0 8px; } }

/* Spring-like easing with linear() */
.toast { animation: slide-in .5s linear(0, 0.6 25%, 1.05 50%, 0.99 75%, 1) both; }
@keyframes slide-in { from { translate: 0 100%; } }

/* Reading progress bar driven by scroll (enhancement) */
@supports (animation-timeline: scroll()) {
  .progress { transform-origin: 0 50%; animation: grow linear both; animation-timeline: scroll(root); }
  @keyframes grow { from { transform: scaleX(0); } }
}

/* Cross-document view transitions (MPA), opt-in on both pages */
@view-transition { navigation: auto; }
.product-hero { view-transition-name: product-hero; }

/* Respect user preferences: reduce, don't necessarily remove */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important;
                           transition-duration: .01ms !important; scroll-behavior: auto !important; }
  ::view-transition-group(*) { animation: none !important; }
}`,run:false}],
browser:`<p>DevTools <b>Animations</b> panel (Chrome/Edge) records, slows down and scrubs CSS/WAAPI animations and View Transitions; the <b>Performance</b> panel shows long frames, layout and paint per frame; <b>Rendering → Paint flashing</b> and <b>Layer borders</b> reveal what repaints and which layers exist; <b>Emulate prefers-reduced-motion</b> lets you test the reduced variant. Firefox and Safari have equivalent animation inspectors. Transitions, keyframes, WAAPI, <code>@starting-style</code>, <code>linear()</code> and same-document View Transitions work in all current engines; cross-document View Transitions and scroll-driven animations aren't universal yet. Node has no rendering, but frameworks expose View Transitions in their routers (e.g. a <code>viewTransition</code> option on navigation) that call the same browser API.</p>`,
gotchas:[`Setting a start value and end value in the same task doesn't transition: styles are batched. Force a style flush (read <code>getComputedStyle</code>), use <code>@starting-style</code>, or a double <code>requestAnimationFrame</code>.`,`Nothing transitions from <code>display: none</code> or to <code>height: auto</code> by default; use <code>@starting-style</code> + <code>allow-discrete</code>, and <code>interpolate-size</code>/grid tricks for auto sizes.`,`<code>transitionend</code> fires once per property (and per longhand for shorthands like <code>padding</code>) and not at all if the transition is interrupted or the element is hidden.`,`Animating <code>width/height/top/left/margin</code> causes layout every frame; <code>box-shadow</code> and <code>filter: blur()</code> with big radii are expensive to paint.`,`<code>will-change</code> on many elements wastes GPU memory and can blur text; it also creates a stacking context and a containing block for fixed children.`,`<code>animation-fill-mode</code> defaults to <code>none</code>: the element snaps back to its original style when the animation ends unless you use <code>forwards</code>/<code>both</code> (or set the final style).`,`View Transitions block rendering during the update callback; slow callbacks freeze the page. Duplicate <code>view-transition-name</code>s on visible elements abort the transition.`,`Ignoring <code>prefers-reduced-motion</code> can make users physically ill; and auto-playing motion longer than 5 seconds needs a pause control (WCAG 2.2.2).`],
best:[`Animate <code>transform</code> and <code>opacity</code>; keep UI transitions short (100–300 ms) with ease-out for entering and ease-in for leaving.`,`Respect <code>prefers-reduced-motion</code> globally and per component; prefer fades over movement in the reduced variant.`,`Use View Transitions for state and route changes as progressive enhancement, with unique names and fast update callbacks.`,`Profile with the Performance and Animations panels on a throttled CPU before shipping complex motion.`],
iq:[["mid","Transition vs animation?","A transition interpolates between two states when a property changes (needs a trigger, runs once). A keyframe animation runs a defined sequence of keyframes by itself, can loop, alternate, delay and has fill modes. Both can be controlled from JS via getAnimations()."],["mid","Which CSS properties are cheap to animate and why?","transform and opacity (often filter) because they can be handled by the compositor without re-running layout or paint; the GPU just moves/blends existing layers. Properties like width, top or margin trigger layout, and color/background/box-shadow trigger paint, every frame on the main thread."],["senior","How do you animate an element appearing from display: none, or a popover closing?","Use @starting-style to define the initial values for the entry, and transition display (and overlay for top-layer elements) with transition-behavior: allow-discrete so display flips to none only at the end of the exit. Alternatively use WAAPI and set display after the finished promise."],["senior","What are View Transitions and how do they work?","An API that snapshots the old view, runs your DOM update (startViewTransition callback) or navigation (cross-document with @view-transition), snapshots the new view, then animates a tree of ::view-transition pseudo-elements between them, cross-fading by default and morphing elements with matching view-transition-name. It's an enhancement: without support, the update still happens."],["senior","How do you support users who prefer reduced motion?","Read prefers-reduced-motion in CSS and JS, replace large movement, parallax, zooms and auto-playing loops with fades or instant changes, turn off smooth scrolling, disable or simplify view transitions, and provide pause controls for any auto-playing content."],["lead","What motion guidelines would you set for a design system?","Duration and easing tokens (e.g. --dur-fast 120ms, --ease-out), a short list of approved patterns (enter/exit, expand, reorder, page transition), compositor-only properties, mandatory reduced-motion variants, performance budgets (no long frames on mid-range devices), and shared primitives (a transition helper wrapping startViewTransition with fallbacks)."]],
practice:[`Build an accordion that animates open and closed to its natural height, with a reduced-motion variant, using <code>interpolate-size</code> where supported and the grid <code>0fr → 1fr</code> trick elsewhere.`,`Add a View Transition to a list filter so remaining items glide into place (unique <code>view-transition-name</code> per item).`,`Animate the same card with <code>left</code> and with <code>transform</code>; record both in the Performance panel with 4× CPU throttling and compare frames.`],
teach:`<p>"Transitions are slow-close hinges between two states; animations are written-down dance routines; View Transitions photograph the old scene, swap it, and morph to the new one. Move things with transform and fade with opacity because the compositor can do those alone, and always offer a calmer version for people who prefer reduced motion."</p>`},

{id:"d60-css-architecture",title:"CSS architecture: BEM, utility-first, CSS Modules and @scope",lv:["senior","lead","architect"],
eli5:`<p>CSS is a <b>shared kitchen</b>. Every class name is a label on a jar, and anyone can reach into any jar. In a tiny kitchen that's fine; in a restaurant with fifty cooks, someone changes "the sauce" and every dish tastes different. Architectures are kitchen rules: <b>BEM</b> writes the dish name on every jar ("pasta__sauce"); <b>utility-first</b> keeps only small single-ingredient jars ("salt", "pepper") and combines them on the plate; <b>CSS Modules</b> gives each cook a private shelf with automatic labels nobody else can use; <b>@scope</b> draws a chalk circle on the counter: "these rules only apply inside this area, and not inside that bowl in the middle".</p>`,
why:`<p>CSS has one global namespace and the cascade, so in large codebases styles leak, specificity escalates, nobody dares delete anything and the stylesheet only grows. Choosing an architecture is a team-scale decision affecting performance (bytes, selector cost), developer speed, design consistency and how safely you can change things. Interviews at senior+ levels ask you to compare these approaches and justify one.</p>`,
tech:`<ul class="pts"><li><b>BEM</b> (Block__Element--Modifier): <code>.card</code>, <code>.card__title</code>, <code>.card--featured</code>. Flat single-class specificity, explicit ownership, readable HTML; no tooling needed. Costs: verbose names, discipline required (nothing enforces it), and global names can still collide across teams (prefix with a namespace, e.g. <code>.c-card</code>). Related methodologies: ITCSS (layered ordering: settings → tools → generic → elements → objects → components → utilities, the ancestor of <code>@layer</code> thinking), SMACSS, OOCSS ("separate structure from skin").</li><li><b>Utility-first</b> (Tailwind and similar): small single-purpose classes (<code>flex gap-4 p-4 rounded-lg text-sm</code>) generated from design tokens; only used classes are emitted. Pros: no naming, styles live next to markup, consistent tokens, CSS size plateaus as the app grows, dead CSS disappears with the markup. Cons: noisy markup, a learning curve, harder theming of third-party markup, and you still need components (in your framework) to avoid duplication.</li><li><b>CSS Modules</b>: <code>import styles from './Card.module.css'</code>; the build rewrites <code>.title</code> to a unique name (<code>Card_title__x7a1</code>) and exports the mapping, giving <b>local scope by default</b> with plain CSS; <code>:global()</code> escapes. Zero runtime, works with SSR, supported by every major bundler. Composition via <code>composes</code>.</li><li><b>CSS-in-JS</b>: runtime libraries (styled-components, Emotion) inject styles while rendering, which costs main-thread time and complicates streaming SSR and React Server Components; the trend is toward <b>zero-runtime</b> options that extract static CSS at build time (vanilla-extract, Panda, StyleX, Linaria) or back to CSS Modules/utility CSS.</li><li><b>Native scoping:</b> <code>@scope (.card) to (.card__content) { img { ... } }</code> limits rules to a subtree with a lower boundary ("donut scope", so nested components' slots aren't affected), and adds <b>scope proximity</b> to the cascade: when specificity ties, the rule whose scope root is closer wins (nested light/dark themes work as expected). Selectors inside don't gain specificity from the scope root (<code>:scope</code> adds pseudo-class weight only if you use it). An inline <code>&lt;style&gt;</code> with a bare <code>@scope { }</code> scopes to its parent element. Support is now in all major engines but recent, so check your audience. <b>Shadow DOM</b> gives full encapsulation for web components (styles don't leak in or out; theming via custom properties and <code>::part()</code>).</li><li><b>Layering it together:</b> <code>@layer reset, tokens, base, layout, components, utilities, overrides;</code> + tokens as custom properties + components (BEM, Modules or scope) + a small utility layer; enforce with stylelint (selector class pattern, max specificity, no IDs, no <code>!important</code> outside utilities, property order).</li><li><b>CSS performance:</b> CSS is <b>render-blocking</b>: keep critical CSS small (inline above-the-fold CSS for landing pages, load the rest normally), avoid <code>@import</code> chains (serial downloads), split CSS per route, minify and compress (Brotli), remove unused CSS (coverage tab), and cache with hashed filenames. Rendering cost: selector matching is rarely the bottleneck; huge DOMs, layout thrashing and expensive paint (big shadows, blurs, fixed backgrounds) are. Use <code>content-visibility: auto</code> + <code>contain-intrinsic-size</code> to skip rendering off-screen sections, <code>contain: layout paint</code> to isolate widgets, and avoid forcing synchronous layout in JS loops. Fonts: <code>font-display: swap</code>, preload the critical font, <code>size-adjust</code> fallbacks to avoid CLS.</li></ul>`,
diagram:{html:lanes([["BEM",[".card__title--big","global names, by convention","no build step"]],["Utility-first",["class=\"p-4 flex gap-2\"","tokens → generated classes","CSS size plateaus"]],["CSS Modules",[".title → .Card_title_x7a1","local by default, build step","zero runtime"]],["@scope / Shadow DOM",["@scope (.card) to (.slot)","native subtree limits + proximity","shadow: full encapsulation"]]]),steps:["All approaches fight the same problems: global names, specificity escalation, leakage and dead code.","BEM and utilities rely on conventions/tooling; Modules and Shadow DOM enforce isolation; @scope adds native subtree boundaries to the cascade.","Most mature systems combine them: tokens + layers + scoped components + a few utilities.","Whatever you pick, enforce it with linting and a design system, not with code review alone."]},
ex:[{t:"A mini CSS Modules compiler and a BEM linter (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
// Hash file path + class name -> stable unique class, like a bundler does.
const hash = (s) => { let h = 5381; for (const ch of s) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0; return h.toString(36).slice(0, 5); };
function compileModule(file, css){
  const map = {};
  const out = css.replace(/:global\\(\\.([\\w-]+)\\)|\\.([a-zA-Z_][\\w-]*)/g, (m, globalName, local) => {
    if (globalName) return "." + globalName;                       // :global(.x) stays as written
    map[local] ??= file.replace(/\\W/g, "_") + "_" + local + "__" + hash(file + local);
    return "." + map[local];
  });
  return { css: out, classes: map };
}
const card = compileModule("Card.module.css", ".title { color: rgb(0, 0, 255) } .title:hover { color: navy } :global(.dark) .title { color: white }");
const list = compileModule("List.module.css", ".title { color: rgb(255, 0, 0) }");
console.log(card.css);
console.log("exports:", JSON.stringify(card.classes));
check("same class name in two files -> two different generated names", card.classes.title !== list.classes.title);
check("generated names are deterministic (stable across builds)", compileModule("Card.module.css", ".title{}").classes.title === card.classes.title);
check(":global() escapes local scoping", card.css.includes(".dark ."));

const style = document.createElement("style");
style.textContent = card.css + list.css;
const host = document.createElement("div");
host.innerHTML = '<h3 class="' + card.classes.title + '">card</h3><h3 class="' + list.classes.title + '">list</h3><h3 class="title">global</h3>';
host.style.color = "rgb(0, 128, 0)";
document.body.append(style, host);
const colors = [...host.children].map((h) => getComputedStyle(h).color);
check("each component only gets its own styles", colors[0] === "rgb(0, 0, 255)" && colors[1] === "rgb(255, 0, 0)");
check("a plain .title elsewhere is untouched (no leakage)", colors[2] === "rgb(0, 128, 0)");
style.remove(); host.remove();

// BEM: block, block__element, block--modifier, block__element--modifier (lowercase, hyphenated words)
const BEM = /^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$/;
const names = ["card", "card__title", "card--featured", "card__title--large", "site-nav__item", "card__title__icon", "Card", "card_title", "card--"];
const bad = names.filter((n) => !BEM.test(n));
console.log("rejected:", bad.join(", "));
check("linter rejects nested elements, capitals, single underscores and empty modifiers", bad.join() === "card__title__icon,Card,card_title,card--");`},
{t:"@scope: donut scopes and proximity beating source order (self-checking)",code:`const check = (name, ok) => console.log((ok ? "pass  " : "FAIL  ") + name);
if (typeof CSSScopeRule === "undefined") console.log("@scope is not supported in this browser (skipping)");
else {
  const style = document.createElement("style");
  style.textContent = [
    "@scope (.sc-card) to (.sc-slot) { img { outline: 4px solid; } p { color: rgb(0, 0, 255); } }",
    "@scope (.sc-light) { p.t { color: rgb(0, 0, 0); } }",
    "@scope (.sc-dark)  { p.t { color: rgb(255, 255, 255); } }",   // later in source, same specificity
    ".sc-plain-dark p.t { color: rgb(255, 255, 255); } .sc-plain-light p.t { color: rgb(0, 0, 0); }"
  ].join("\\n");
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;left:-9999px;color:rgb(0, 128, 0)";
  host.innerHTML =
    '<div class="sc-card"><img alt=""><p>card text</p>' +
    '  <div class="sc-slot"><img alt=""><p>slotted content from another component</p></div></div>' +
    '<div class="sc-dark"><div class="sc-light"><p class="t">nested light inside dark</p></div></div>' +
    '<div class="sc-plain-light"><div class="sc-plain-dark"><p class="t">plain selectors</p></div></div>';
  document.body.append(style, host);
  const [img1, img2] = host.querySelectorAll(".sc-card img");
  const [p1, p2] = host.querySelectorAll(".sc-card p");
  check("inside the scope: rules apply", getComputedStyle(img1).outlineStyle === "solid" && getComputedStyle(p1).color === "rgb(0, 0, 255)");
  check("below the lower boundary (.sc-slot): rules stop (donut scope)", getComputedStyle(img2).outlineStyle === "none" && getComputedStyle(p2).color === "rgb(0, 128, 0)");
  const scoped = getComputedStyle(host.querySelector(".sc-light p")).color;
  check("proximity: the nearer scope root (.sc-light) wins over later source order -> " + scoped, scoped === "rgb(0, 0, 0)");
  const plain = getComputedStyle(host.querySelector(".sc-plain-dark p")).color;
  check("without @scope, source order decides and the outer theme wrongly wins -> " + plain, plain === "rgb(0, 0, 0)");
  style.remove(); host.remove();
}`},
{t:"Choosing and enforcing an architecture; CSS performance checklist (reference)",code:`/* 1) One entry stylesheet with an explicit layer order */
@layer reset, tokens, base, layout, components, utilities, overrides;

/* 2) Component written with BEM inside a layer, or scoped natively */
@layer components {
  .c-card { display: grid; gap: var(--space-s); }
  .c-card__title { font: var(--font-heading); }
  .c-card--featured { border: 2px solid var(--brand); }

  @scope (.c-tabs) to (.c-tabs__panel) {   /* tab chrome only; never style panel content */
    :scope { display: grid; }
    button[aria-selected="true"] { border-block-end: 2px solid var(--brand); }
  }
}

/* 3) Rendering performance */
.feed-item { content-visibility: auto; contain-intrinsic-size: auto 320px; } /* skip off-screen work */
.widget { contain: layout paint; }                                           /* isolate a busy widget */

/* .stylelintrc (enforcement), sketched as comments:
   selector-class-pattern: BEM regex       selector-max-id: 0
   selector-max-specificity: "0,3,0"       declaration-no-important: true (except utilities layer)
   no-descending-specificity: true          color-no-hex: true (tokens only) */

/* index.html: critical CSS inline, the rest non-blocking for this route
   <style> ~10 KB of above-the-fold rules </style>
   <link rel="stylesheet" href="/app.4f9c1e.css">            hashed, long-cached, Brotli
   <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin> */`,run:false}],
browser:`<p>Chrome/Edge DevTools <b>Coverage</b> tab shows unused CSS bytes per file; <b>Performance → Selector stats</b> (enable in settings) shows the slowest selectors during style recalculation; the Performance panel shows "Recalculate Style" and "Layout" costs and forced reflows; Lighthouse flags render-blocking stylesheets and unused CSS. <code>@scope</code> is supported in all current major engines but arrived recently in some, so check your browser analytics or keep a BEM/Modules fallback; <code>content-visibility</code> and <code>contain</code> work everywhere. On the Node side, the architecture lives in the build: Vite/webpack/Rspack/Turbopack handle CSS Modules, PostCSS/Lightning CSS handle nesting, prefixes and minification, Tailwind scans templates to generate utilities, and SSR frameworks inline critical CSS.</p>`,
gotchas:[`BEM is only a convention: nothing stops <code>.card .title h3</code>; enforce with stylelint's class pattern and max specificity.`,`Nested BEM elements (<code>.card__body__title</code>) mirror DOM depth and break on refactor; keep elements one level under the block.`,`Utility classes can't style markup you don't control (CMS HTML, third-party widgets) without extra tooling; keep a small component/prose layer.`,`Dynamic class names (<code>"text-" + color</code>) are invisible to utility-class scanners and get purged; use complete class strings.`,`CSS Modules hash class names but not element selectors: <code>.title h3</code> inside a module still affects nested components' h3s; and <code>:global</code> rules leak by design.`,`Runtime CSS-in-JS injects styles during render, adding main-thread cost and complicating SSR streaming and server components.`,`<code>@scope</code> doesn't add the scope root's specificity, and proximity only matters when specificity ties; it also isn't encapsulation (outside rules still reach in).`,`<code>@import</code> inside CSS serializes downloads; one huge global CSS file blocks rendering of every route.`],
best:[`Pick one primary approach per codebase, write it down (ADR), and enforce it with linting and design-system components.`,`Combine layers + tokens + scoped components + a minimal utility layer; keep selectors flat and specificity low.`,`Treat CSS like code: delete with the component (co-location), measure unused bytes, and keep critical CSS small.`,`Use <code>content-visibility</code>/<code>contain</code> for long pages and widgets; profile style and layout before micro-optimizing selectors.`],
iq:[["senior","Compare BEM, utility-first CSS and CSS Modules.","BEM: naming convention for flat, explicit, global classes; no tooling, relies on discipline. Utility-first: tiny token-based classes composed in markup; no naming, consistent design and small CSS, but verbose markup and needs components for reuse. CSS Modules: write normal CSS, the build makes class names locally unique; isolation by default with zero runtime, but needs a bundler and doesn't scope element selectors."],["senior","What does @scope add that BEM doesn't?","Native subtree limits with lower boundaries (donut scope) so a component's styles stop at slots containing other components, and scope proximity in the cascade so the nearest scope wins on ties (nested themes). It lets you use simple selectors like img or p inside a component without leaking or long names."],["senior","Why is CSS render-blocking and how do you reduce its impact?","The browser won't paint until it has the CSSOM for stylesheets in the head, to avoid flashes of unstyled content. Reduce impact by keeping CSS small, splitting it per route, inlining critical CSS for key landing pages, avoiding @import chains, compressing and caching with hashed names, and removing unused CSS."],["lead","Your app's CSS is 900 KB and nobody dares delete anything. What do you do?","Measure (coverage per route, duplication analysis), introduce @layer with legacy in a low layer, adopt one architecture for new code (Modules or utilities + design-system components), co-locate CSS with components so it's deleted with them, add stylelint, visual regression tests to make deletion safe, and burn down legacy route by route with a size budget in CI."],["lead","Runtime CSS-in-JS vs zero-runtime approaches?","Runtime libraries generate and inject styles during render: flexible (props-based styles) but cost main-thread time, hurt INP/hydration, and complicate streaming SSR and server components. Zero-runtime (CSS Modules, vanilla-extract, StyleX, Tailwind) extract static CSS at build time and use custom properties for dynamic values, so they're the default choice for performance-sensitive apps."],["architect","How would you design the styling architecture for a multi-team, multi-app platform?","A versioned design system with tokens as custom properties (multi-brand), a shared layer order, components delivered as framework components or web components (Shadow DOM where isolation matters), scoped styles (Modules or @scope) and a shared utility set, CSS budgets and linting in CI, visual regression testing, and clear ownership; micro-frontends get prefixed/scoped styles so teams can deploy independently without leaking."]],
practice:[`Refactor one component three ways (BEM, utility classes, CSS Module) and compare markup readability, CSS bytes and how easy it is to delete.`,`Use <code>@scope (.tabs) to (.tabs__panel)</code> to style a tabs component whose panels contain other components; prove the inner components are unaffected.`,`Run DevTools Coverage on a real site you work on, list the three biggest unused-CSS sources and propose a plan to remove them.`],
teach:`<p>"CSS is a shared kitchen where every jar is reachable by everyone. BEM writes the dish name on every jar, utilities keep only single-ingredient jars, CSS Modules gives each cook a private labelled shelf, and @scope draws a chalk circle with a hole in the middle. Pick one, enforce it with tools, layer it, and keep the CSS that blocks the first paint small."</p>`}
],quiz:[
{code:`const el = document.createElement('div');
document.body.append(el);
const a = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, easing: 'linear', fill: 'forwards' });
a.pause(); a.currentTime = 250;
console.log(getComputedStyle(el).opacity, a.playState);
a.finish();
console.log(getComputedStyle(el).opacity, a.playState);
el.remove();`,ans:`0.25 paused, then 1 finished`,why:`Pausing and setting <code>currentTime</code> scrubs a linear 0 → 1 fade to 25%. <code>finish()</code> jumps to the end; because of <code>fill: 'forwards'</code> the final value (1) is kept and the play state is "finished". Without the fill it would snap back to the element's own opacity (also 1 here, but for a different reason).`},
{code:`const s = document.createElement('style');
s.textContent = '@scope (.light) { p { color: rgb(0, 0, 0) } } @scope (.dark) { p { color: rgb(255, 255, 255) } } @scope (.card) to (.slot) { em { color: rgb(255, 0, 0) } }';
const d = document.createElement('div'); d.style.color = 'rgb(0, 0, 255)';
d.innerHTML = '<div class="dark"><div class="light"><p>a</p></div></div><div class="card"><em>b</em><div class="slot"><em>c</em></div></div>';
document.body.append(s, d);
const [b, c] = d.querySelectorAll('em');
console.log(getComputedStyle(d.querySelector('p')).color, getComputedStyle(b).color, getComputedStyle(c).color);
s.remove(); d.remove();`,ans:`rgb(0, 0, 0) rgb(255, 0, 0) rgb(0, 0, 255)`,why:`Both <code>p</code> rules have the same specificity, so <b>scope proximity</b> decides: <code>.light</code> is the nearer root, beating the later <code>.dark</code> rule. The first <code>em</code> is inside the <code>.card</code> scope; the second is below the <code>.slot</code> lower boundary, so it isn't matched and inherits blue from the wrapper.`}]}
]});
