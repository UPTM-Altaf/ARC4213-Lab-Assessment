// Lightweight progressive enhancement only — the page works fully without this file.

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var panels = document.querySelectorAll('.panel');
  var navLinks = document.querySelectorAll('.filetree .file');

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.target === id);
    });
  }

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });

    panels.forEach(function (panel) {
      if (reduceMotion) {
        panel.classList.add('in-view');
      } else {
        revealObserver.observe(panel);
      }
      navObserver.observe(panel);
    });
  } else {
    panels.forEach(function (panel) { panel.classList.add('in-view'); });
  }
})();
