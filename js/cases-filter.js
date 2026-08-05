(function () {
  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-case-filter]'));
  var cases = Array.prototype.slice.call(document.querySelectorAll('[data-case-segments]'));
  var counter = document.querySelector('[data-case-count]');

  function applyFilter(segment) {
    var visible = 0;
    cases.forEach(function (item) {
      var show = segment === 'all' || item.dataset.caseSegments.split(' ').indexOf(segment) !== -1;
      item.hidden = !show;
      if (show) visible += 1;
    });
    counter.textContent = visible;
    filters.forEach(function (button) {
      var active = button.dataset.caseFilter === segment;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  filters.forEach(function (button) {
    button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
    button.addEventListener('click', function () { applyFilter(button.dataset.caseFilter); });
  });
}());
