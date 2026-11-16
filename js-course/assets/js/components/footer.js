/* Footer component: previous/next week pager, footnote and the back-to-top button. */
(function (J) {
  'use strict';
  var pager;

  J.footer = {
    mount: function (node) {
      node.innerHTML =
        '<nav class="pager wrap" aria-label="Week navigation"></nav>' +
        '<p class="fine">JavaScript: Zero to Architect · progress and theme are saved in this browser · press Ctrl/Cmd+P for a clean printable copy of the current week.</p>' +
        '<button id="top" aria-label="Back to top">↑</button>';
      pager = node.querySelector('.pager');
      var top = node.querySelector('#top');
      addEventListener('scroll', function () { top.style.display = scrollY > 600 ? 'block' : 'none'; }, { passive: true });
    },
    update: function (view) {
      var C = J.COURSE;
      if (view.name !== 'week') {
        pager.innerHTML = '<span></span><a href="#week-1">Start: Week 1: ' + C[0].title + ' →</a>';
        return;
      }
      var p = C[view.w - 2], n = C[view.w];
      pager.innerHTML =
        (p ? '<a href="#week-' + p.w + '">← Week ' + p.w + ': ' + p.title + '</a>' : '<a href="#home">← Course home</a>') +
        (n ? '<a href="#week-' + n.w + '">Week ' + n.w + ': ' + n.title + ' →</a>' : '<a href="#home">Back to course home</a>');
    }
  };
})(window.JSC = window.JSC || {});
