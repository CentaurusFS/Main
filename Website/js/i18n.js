/* Sprachumschaltung. Deutsch steht im HTML, Englisch in js/lang/en.js.
   Umgeschaltet wird nur der Text in bestehenden Elementen, dadurch bleiben
   alle Szenen und ihre Bindungen erhalten. */
(function () {
  "use strict";

  var dict = window.CENTAURUS_EN || {};
  var nodes = document.querySelectorAll("[data-t], [data-t-html]");
  var buttons = document.querySelectorAll(".lang button");
  var STORE = "centaurus-sprache";

  /* Die deutsche Fassung wird beim Laden eingesammelt, damit das Zurück-
     schalten nichts erfindet. */
  var de = [];
  Array.prototype.forEach.call(nodes, function (el) {
    var isHtml = el.hasAttribute("data-t-html");
    de.push({
      el: el,
      key: isHtml ? el.getAttribute("data-t-html") : el.getAttribute("data-t"),
      html: isHtml,
      value: isHtml ? el.innerHTML : el.textContent
    });
  });

  var current = "de";

  function apply(lang) {
    current = lang === "en" ? "en" : "de";

    de.forEach(function (item) {
      var value = current === "en" ? dict[item.key] : item.value;
      if (value == null) return;
      if (item.html) {
        item.el.innerHTML = value;
      } else {
        item.el.textContent = value;
      }
    });

    document.documentElement.lang = current;

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.setAttribute(
        "aria-pressed",
        btn.getAttribute("data-lang") === current ? "true" : "false"
      );
    });

    /* Die Szenen messen Textbreiten und Höhen selbst nach. */
    window.dispatchEvent(new Event("resize"));
  }

  window.CentaurusI18n = {
    /* Für Texte, die erst im Betrieb entstehen, etwa Formularmeldungen. */
    t: function (key, german) {
      return current === "en" && dict[key] ? dict[key] : german;
    },
    lang: function () {
      return current;
    }
  };

  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang");
      try {
        window.localStorage.setItem(STORE, lang);
      } catch (e) {
        /* Privater Modus: dann eben nur für diesen Besuch. */
      }
      apply(lang);
    });
  });

  var saved = null;
  try {
    saved = window.localStorage.getItem(STORE);
  } catch (e) {
    saved = null;
  }
  if (saved === "en") apply("en");
})();
