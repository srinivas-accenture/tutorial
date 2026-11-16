/* Header component: menu button (mobile), brand, breadcrumb, theme toggle. */
(function (J) {
  'use strict';
  var el, crumbs, base = '';

  J.header = {
    mount: function (node) {
      el = node;
      el.innerHTML =
        '<button id="menu" class="btn" aria-label="Open menu" aria-controls="sidebar" aria-expanded="false">☰ Menu</button>' +
        '<a class="up" href="../index.html" title="Back to the list of all tutorials">← All tutorials</a>' +
        '<a class="hbrand" href="#home">Docker: zero to DCA</a>' +
        '<span class="crumbs" id="crumbs"></span>' +
        '<button class="btn" id="theme" title="Toggle light/dark" aria-label="Toggle theme">Theme</button>';
      crumbs = el.querySelector('#crumbs');
    },
    /* view: {name:'home'} or {name:'week', w:3} */
    update: function (view) {
      if (view.name === 'week') {
        var w = J.COURSE[view.w - 1];
        base = '<a href="#home">Home</a> › <a href="#week-' + w.w + '">Week ' + w.w + ': ' + w.title + '</a>';
      } else {
        base = 'Course home';
      }
      crumbs.innerHTML = base;
    },
    /* called while scrolling a week: append the current day */
    setDay: function (d) {
      crumbs.innerHTML = base + (d ? ' › Day ' + d.n + ': ' + d.t : '');
    },
    setMenuOpen: function (open) {
      el.querySelector('#menu').setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  };
})(window.JSC = window.JSC || {});
