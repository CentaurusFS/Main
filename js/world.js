/* Dritte Szene: ein Flug über die Stadt. Bewegt wird nicht die Stadt, sondern
   die Kamera: sie zoomt an einer Station hinein, wieder heraus, fliegt weiter
   und zoomt erneut hinein. Alles hängt am Scrollstand. */
(function () {
  "use strict";

  var section = document.getElementById("arbeit");
  if (!section || !section.classList.contains("world")) return;

  var stage = section.querySelector(".world-stage");
  var city = document.getElementById("city");
  var scrim = document.getElementById("world-scrim");
  var arrow = document.getElementById("arrow-city");


  var cards = [];
  var i;
  for (i = 0; i < 5; i++) {
    var el = document.getElementById("card-" + i);
    if (!el) break;
    cards.push(el);
  }

  /* Die Stadt ist 2400 mal 1000 Einheiten groß. Das sind die Punkte, auf die
     die Kamera scharf stellt, in genau dieser Reihenfolge. */
  var W = 2400;
  var H = 1000;
  var MARKS = [
    { x: 320, y: 755 }, // Autohaus
    { x: 760, y: 745 }, // Werkhalle
    { x: 1180, y: 560 }, // Baukran
    { x: 1620, y: 780 }, // Logistik
    { x: 2140, y: 750 } // Hof
  ];

  /* Der Pfeil fliegt auf gleicher Höhe quer durch die Stadt, von links außen
     bis rechts außen. Die Bahn ist so gelegt, dass er dabei immer in der Nähe
     des Kamerablicks bleibt. */
  /* 700 von 1000 Einheiten: mitten zwischen den Dächern, gut hundert
     Einheiten über der Bodenlinie. Sichtbar bleibt er bei jeder Station,
     das Band reicht von 555 bis 847. */
  var ARROW_Y = 700;

  var ARROW_VON = -320;
  var ARROW_BIS = 2760;

  /* Ankunft und Abflug je Station. Dazwischen zieht die Kamera zurück. */
  var ARRIVE = [0.09, 0.26, 0.43, 0.6, 0.77];
  var LEAVE = [0.19, 0.36, 0.53, 0.7, 0.89];

  function clamp(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  var geo = {};
  var keys = [];

  function measure() {
    geo.w = stage.clientWidth;
    geo.h = stage.clientHeight;

    /* Übersicht: die ganze Stadt passt ins Bild. Nahaufnahme: gut das
       Zweieinhalbfache davon. */
    geo.out = Math.min(geo.w / W, geo.h / H) * 0.92;
    geo.mid = geo.out * 1.25;
    geo.in = geo.out * 2.7;

    var center = { x: W / 2, y: 640 };

    /* a ist der senkrechte Blickanker: 0,44 heißt oberes Drittel. Er bleibt
       über die ganze Szene gleich, die Kamera hebt sich am Ende nicht. */
    keys = [{ p: 0, x: center.x, y: center.y, s: geo.out, a: 0.44 }];
    for (var n = 0; n < MARKS.length; n++) {
      keys.push({ p: ARRIVE[n], x: MARKS[n].x, y: MARKS[n].y, s: geo.in, a: 0.44 });
      keys.push({ p: LEAVE[n], x: MARKS[n].x, y: MARKS[n].y, s: geo.in, a: 0.44 });

      /* Zwischen zwei Stationen geht die Kamera hoch und zeigt die Strecke. */
      if (n < MARKS.length - 1) {
        keys.push({
          p: (LEAVE[n] + ARRIVE[n + 1]) / 2,
          x: (MARKS[n].x + MARKS[n + 1].x) / 2,
          y: (MARKS[n].y + MARKS[n + 1].y) / 2 - 90,
          s: geo.mid,
          a: 0.44
        });
      }
    }
    keys.push({ p: 1, x: center.x, y: center.y, s: geo.out, a: 0.44 });
  }

  function camAt(p) {
    if (p <= keys[0].p) return keys[0];
    for (var n = 1; n < keys.length; n++) {
      if (p <= keys[n].p) {
        var a = keys[n - 1];
        var b = keys[n];
        var t = easeInOut((p - a.p) / (b.p - a.p));
        return {
          x: lerp(a.x, b.x, t),
          y: lerp(a.y, b.y, t),
          a: lerp(a.a, b.a, t),
          /* Der Maßstab wird logarithmisch überblendet, sonst wirkt das
             Heranfahren am Ende zäh und am Anfang zu schnell. */
          s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), t))
        };
      }
    }
    return keys[keys.length - 1];
  }

  function render(p) {
    var c = camAt(p);
    var tx = geo.w / 2 - c.x * c.s;
    /* Der Blickpunkt liegt im oberen Drittel, dadurch bleibt die untere Hälfte
       für den Text frei. */
    var ty = geo.h * c.a - c.y * c.s;

    city.style.transform =
      "translate(" + tx + "px," + ty + "px) scale(" + c.s + ")";

    var lesbar = 0;
    if (arrow) {
      var ax = lerp(ARROW_VON, ARROW_BIS, p);
      arrow.style.transform =
        "translate(" + ax + "px," + ARROW_Y + "px) translate(-100%, -50%)";
    }

    for (var n = 0; n < cards.length; n++) {
      var inT = clamp((p - (ARRIVE[n] - 0.04)) / 0.06);
      var outT = clamp((p - LEAVE[n]) / 0.05);
      var vis = inT * (1 - outT);
      cards[n].style.opacity = vis;
      cards[n].style.transform = "translateY(" + (1 - vis) * 14 + "px)";
      if (vis > lesbar) lesbar = vis;
    }

    /* Der Schleier folgt dem sichtbarsten Text. */
    if (scrim) scrim.style.opacity = lesbar;
  }

  var ticking = false;

  function update() {
    ticking = false;
    var rect = section.getBoundingClientRect();
    var span = section.offsetHeight - stage.offsetHeight;
    var p = span <= 0 ? 0 : clamp(-rect.top / span);
    render(p);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    measure();
    update();
  });

  measure();
  update();
})();
