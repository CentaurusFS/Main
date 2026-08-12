/* Das Logo zwischen Stadt und Formular tritt auf, statt einfach dazustehen:
   Es steigt auf und wird hell, während man in seine Fläche hineinscrollt.
   Wie überall auf der Seite hängt das am Scrollstand, nicht an der Uhr. */
(function () {
  "use strict";

  var mark = document.querySelector(".mark");
  if (!mark) return;

  var bild = mark.querySelector("img");
  if (!bild) return;

  function clamp(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  var ticking = false;

  function update() {
    ticking = false;
    var rect = mark.getBoundingClientRect();
    var hoehe = window.innerHeight || 800;

    /* Null, solange der Abschnitt unter dem Bildrand liegt. Eins, sobald er
       eine halbe Bildhöhe weit hereingekommen ist. */
    var t = clamp((hoehe - rect.top) / (hoehe * 0.55));

    bild.style.opacity = 0.92 * t;
    bild.style.transform =
      "translateY(" + (1 - t) * 26 + "px) scale(" + (0.965 + 0.035 * t) + ")";
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
