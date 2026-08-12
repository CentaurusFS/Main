/* Verhalten der Kopfzeile: Schleier beim Scrollen, Mobilmenü, Sprachumschalter. */
(function () {
  "use strict";

  /* Beim Neuladen fängt die Seite oben an. Sonst stellt der Browser den alten
     Scrollstand wieder her und man landet mitten in einer Szene. */
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  window.addEventListener("load", function () {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  });

  var nav = document.getElementById("nav");
  var links = document.getElementById("nav-links");
  var toggle = document.querySelector(".nav-toggle");

  /* Ab 24 px Scrollweg legt sich der Schleier unter die Zeile, damit die
     Schrift auch über hellen Sternen lesbar bleibt. */
  if (nav) {
    var solid = function () {
      nav.classList.toggle("is-solid", window.scrollY > 24);
    };
    window.addEventListener("scroll", solid, { passive: true });
    solid();
  }

  /* Mobilmenü */
  if (toggle && links) {
    var label = function (key, german) {
      return window.CentaurusI18n
        ? window.CentaurusI18n.t(key, german)
        : german;
    };

    var setOpen = function (open) {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open
        ? label("close", "Schließen")
        : label("menu", "Menü");
      document.body.style.overflow = open ? "hidden" : "";
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* Die Sprachumschaltung selbst liegt in js/i18n.js. */
})();
