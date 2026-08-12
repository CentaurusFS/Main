/* Der Hero-Satz korrigiert sich selbst. Erst liest man die bequeme Fassung,
   dann streicht sie sich durch und die genauere schiebt sich daneben. */
(function () {
  "use strict";

  var edit = document.getElementById("edit");
  if (!edit) return;

  var box = edit.querySelector(".edit-new");
  var word = box.firstElementChild;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Die Breite des Zielworts wird gemessen, damit max-width auf einen echten
     Wert laufen kann statt auf einen geratenen. */
  function measure() {
    var previous = box.style.maxWidth;
    box.style.transition = "none";
    box.style.maxWidth = "none";
    var w = word.getBoundingClientRect().width;
    box.style.maxWidth = previous;
    // Erzwingt einen Reflow, bevor die Übergänge wieder scharf gestellt werden.
    void box.offsetWidth;
    box.style.transition = "";
    edit.style.setProperty("--edit-width", Math.ceil(w) + "px");
  }

  measure();

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(measure, 150);
  });

  if (reduced) {
    document.body.classList.add("no-anim");
    edit.classList.add("is-struck", "is-corrected");
    return;
  }

  /* 1,4 Sekunden reichen, um den Satz einmal zu lesen. Erst danach wird er
     korrigiert, sonst geht die Pointe verloren. */
  window.setTimeout(function () {
    edit.classList.add("is-struck");
    window.setTimeout(function () {
      edit.classList.add("is-corrected");
    }, 420);
  }, 1400);
})();
