/* Loaded in <head> so the saved theme applies before first paint (no light/dark flash). */
(function () {
  var t = null;
  try { t = JSON.parse(localStorage.getItem('rcc-theme')); } catch (e) { /* storage blocked */ }
  if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = t;
})();
