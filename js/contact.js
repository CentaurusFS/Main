/* Kontaktformular. Versand über Web3Forms, ohne eigenen Server.
   TODO vor dem Livegang: den echten Zugangsschlüssel aus dem Web3Forms-Konto
   hier eintragen. Solange er fehlt, meldet das Formular einen Fehler. */
var WEB3FORMS_KEY = "HIER-DEN-WEB3FORMS-SCHLUESSEL-EINTRAGEN";

(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var button = form.querySelector(".submit");

  function t(key, german) {
    return window.CentaurusI18n ? window.CentaurusI18n.t(key, german) : german;
  }

  function say(text, isError) {
    status.textContent = text;
    status.classList.toggle("is-error", !!isError);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    /* Die Falle für Bots: ausgefüllt heißt kein Mensch. Wir tun so, als sei
       alles gut, und schicken nichts. */
    if (form.elements.firma_zusatz.value) {
      say(t("st_thanks", "Danke, wir melden uns."));
      return;
    }

    /* Pflicht sind Name, E-Mail und die Einwilligung. */
    if (!form.checkValidity()) {
      say(t("st_required", "Bitte Name und E-Mail eintragen und der Verarbeitung zustimmen."), true);
      form.reportValidity();
      return;
    }

    var data = new FormData(form);
    data.delete("firma_zusatz");
    data.append("access_key", WEB3FORMS_KEY);
    data.append("subject", "Anfrage über centaurus-advisory.de");
    data.append("from_name", "Centaurus Advisory Website");

    button.disabled = true;
    say(t("st_sending", "Wird gesendet …"));

    window
      .fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (result && result.success) {
          form.reset();
          say(t("st_thanks", "Danke, wir melden uns. Meist am selben Tag."));
        } else {
          say(
            t(
              "st_fail",
              "Das hat nicht geklappt. Schreiben Sie uns bitte direkt an info@centaurus-advisory.de."
            ),
            true
          );
        }
      })
      .catch(function () {
        say(
          t(
            "st_offline",
            "Keine Verbindung. Schreiben Sie uns bitte direkt an info@centaurus-advisory.de."
          ),
          true
        );
      })
      .then(function () {
        button.disabled = false;
      });
  });
})();
