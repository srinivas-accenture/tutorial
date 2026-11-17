/* Sidebar component: topic search, progress bar and the week/day/topic tree. */
(function (J) {
  'use strict';
  var el;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || el).querySelectorAll(s)); };

  function tree() {
    return J.COURSE.map(function (w) {
      return '<details class="wk" data-week="' + w.w + '"><summary>Week ' + w.w + ': ' + w.title + '</summary>' +
        w.days.map(function (d) {
          return '<details class="dy" data-day="' + d.n + '"><summary>Day ' + d.n + ': ' + d.t + '<span class="tick" hidden>✓</span></summary><ul>' +
            d.tp.map(function (t) {
              return '<li data-k="' + J.esc((t[1] + ' ' + d.t + ' ' + (t[2] || '')).toLowerCase()) + '"><a href="#' + t[0] + '" data-id="' + t[0] + '">' + t[1] + '</a></li>';
            }).join('') + '</ul></details>';
        }).join('') + '</details>';
    }).join('');
  }

  function search(q) {
    q = q.trim().toLowerCase();
    $$('li').forEach(function (li) { li.classList.toggle('hide', !!q && li.dataset.k.indexOf(q) < 0); });
    $$('details.dy').forEach(function (d) { var any = $$('li:not(.hide)', d).length > 0; d.classList.toggle('hide', !any); if (q) d.open = any; });
    $$('details.wk').forEach(function (d) { var any = $$('details.dy:not(.hide)', d).length > 0; d.classList.toggle('hide', !any); if (q) d.open = any; });
  }

  J.sidebar = {
    mount: function (node) {
      el = node;
      el.innerHTML =
        '<div class="tools"><input id="search" type="search" placeholder="Search topics…" aria-label="Search topics"></div>' +
        '<div class="prog"><i id="pbar"></i></div><div class="proglabel" id="plabel"></div>' + tree();
      el.querySelector('#search').addEventListener('input', function (e) { search(e.target.value); });
    },
    /* open the current week's branch, close the others (unless the user is searching) */
    update: function (view) {
      if (el.querySelector('#search').value) return;
      $$('details.wk').forEach(function (d) { d.open = view.name === 'week' && +d.dataset.week === view.w; });
      if (view.name !== 'week') this.setActive(null);
    },
    setActive: function (id) {
      $$('a.on').forEach(function (a) { a.classList.remove('on'); });
      if (!id) return;
      var a = el.querySelector('a[data-id="' + id + '"]');
      if (!a) return;
      a.classList.add('on');
      var dy = a.closest('details.dy');
      if (dy && !dy.open && !el.querySelector('#search').value) dy.open = true;
    },
    setProgress: function (done) {
      $$('details.dy').forEach(function (d) { d.querySelector('.tick').hidden = done.indexOf(+d.dataset.day) < 0; });
      el.querySelector('#pbar').style.width = (done.length / J.totalDays() * 100) + '%';
      el.querySelector('#plabel').textContent = done.length + ' of ' + J.totalDays() + ' days complete';
    }
  };
})(window.JSC = window.JSC || {});
