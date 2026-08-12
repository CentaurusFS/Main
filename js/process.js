/* Zweite Szene: die Figur geht mit dem Stern in der Hand die vier Phasen ab.
   Sie hält an jeder Station an, der zugehörige Text steht so lange da, und
   zwischen den Stationen zieht sie die Linie weiter. Am Ende bleibt ein
   kleines Sternbild aus vier Punkten stehen. Alles hängt am Scrollstand. */
(function () {
  "use strict";

  var section = document.getElementById("ansatz");
  if (!section || !section.classList.contains("process")) return;

  var stage = section.querySelector(".process-stage");
  var track = section.querySelector(".track");
  var links = document.getElementById("track-links");
  var figure = document.getElementById("figure2");
  var arrow = document.getElementById("arrow-process");
  var gangBild = figure.querySelector(".gait-frame");
  /* Sechs Gangbilder, vorgeladen, damit beim Wechsel nichts blitzt. */
  var GANG = 6;
  var gangBilder = [];
  for (var g = 0; g < GANG; g++) {
    var vor = new Image();
    vor.src = "assets/gait-" + g + ".png";
    gangBilder.push(vor.src);
  }
  var gangIndex = -1;

  function gangSetzen(bild, phase) {
    if (!bild) return;
    var i = Math.round((phase / (Math.PI * 2)) * GANG) % GANG;
    if (i < 0) i += GANG;
    if (i !== gangIndex) {
      gangIndex = i;
      bild.src = gangBilder[i];
    }
  }

  var title = section.querySelector(".process-title");

  var stops = [];
  var steps = [];
  var i;
  for (i = 0; i < 4; i++) {
    stops.push(document.getElementById("stop-" + i));
    steps.push(document.getElementById("step-" + i));
  }

  /* Etwas nach innen gerückt, damit auch der erste und der letzte Text genau
     mittig unter seinem Punkt stehen kann, statt am Rand zu kleben. */
  var STOP_X = [0.2, 0.4, 0.6, 0.8];

  /* Ankunft und Aufbruch je Station, als Anteil am Scrollweg. Zwischen
     Aufbruch und nächster Ankunft wird gelaufen. */
  var ARRIVE = [0.1, 0.32, 0.54, 0.76];
  var LEAVE = [0.22, 0.44, 0.66, 0.9];

  /* An der vierten Station wird der Pfeil abgeschossen. */
  var SHOOT = 0.84;

  function clamp(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeIn(t) {
    return t * t;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  var geo = {};
  var keys = [];

  function measure() {
    geo.w = stage.clientWidth;
    geo.figW = figure.getBoundingClientRect().width || 200;

    /* Die Bahn hängt an der Unterkante der Frage, nicht an einem festen
       Prozentwert: die Frage braucht je nach Breite zwei bis vier Zeilen, und
       die Figur soll darunter laufen statt hineinzutreten. */
    var stageH = stage.clientHeight;
    var below = title ? title.offsetTop + title.offsetHeight : stageH * 0.3;
    var figH = figure.getBoundingClientRect().height || 174;
    var lineY = Math.max(stageH * 0.44, below + 72 + figH);
    lineY = Math.min(lineY, stageH * 0.66);
    track.style.top = lineY + "px";
    section.querySelector(".steps").style.top = lineY + 56 + "px";
    geo.step = geo.figW * 0.34; // Wellenlänge des Auf und Ab
    geo.xs = STOP_X.map(function (f) {
      return f * geo.w;
    });

    /* Der Weg als Stützstellen: laufen, stehen, laufen, stehen … */
    keys = [{ p: 0, x: -geo.figW }];
    for (var n = 0; n < 4; n++) {
      keys.push({ p: ARRIVE[n], x: geo.xs[n] });
      keys.push({ p: LEAVE[n], x: geo.xs[n] });
    }
    /* An der vierten Station bleibt er stehen, statt aus dem Bild zu laufen. */
    keys.push({ p: 1, x: geo.xs[3] });

    /* Die Verbindungslinien zwischen den Stationen, in Pixeln. */
    links.innerHTML = "";
    for (var k = 0; k < 3; k++) {
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", geo.xs[k]);
      line.setAttribute("y1", 0);
      line.setAttribute("x2", geo.xs[k + 1]);
      line.setAttribute("y2", 0);
      line.setAttribute("pathLength", "1");
      line.style.strokeDasharray = "1";
      line.style.strokeDashoffset = "1";
      links.appendChild(line);
    }

    /* Jeder Phasentext wird unter seinem Punkt zentriert und am Rand nur so
       weit hineingeschoben, dass er nicht aus dem Bild läuft. */
    var edge = title ? title.offsetLeft : 20;
    geo.stepX = [];
    for (var s = 0; s < 4; s++) {
      stops[s].style.transform = "translateX(" + geo.xs[s] + "px)";

      var sw = steps[s].offsetWidth;
      var left = geo.xs[s] - sw / 2;
      var max = geo.w - edge - sw;
      geo.stepX.push(Math.max(edge, Math.min(left, Math.max(edge, max))));
    }
  }

  /* Position auf dem Weg. Die Beschleunigung steckt in der Kurve, dadurch
     laufen die Beine von allein aus und wieder an. */
  function posAt(p) {
    if (p <= keys[0].p) return keys[0].x;
    for (var n = 1; n < keys.length; n++) {
      if (p <= keys[n].p) {
        var a = keys[n - 1];
        var b = keys[n];
        if (a.x === b.x) return a.x;
        var t = (p - a.p) / (b.p - a.p);
        return lerp(a.x, b.x, easeInOut(t));
      }
    }
    return keys[keys.length - 1].x;
  }

  /* Die zurückgelegte Strecke bestimmt den Schritttakt. */
  function walked(p) {
    var d = 0;
    var prev = keys[0].x;
    var steps32 = 32;
    for (var n = 0; n <= steps32; n++) {
      var q = (p * n) / steps32;
      var x = posAt(q);
      d += Math.abs(x - prev);
      prev = x;
    }
    return d;
  }

  function render(p) {
    /* Erst aufblenden, wenn der Hero mit seiner Fassung derselben Frage
       durch ist. Sonst steht sie kurz zweimal im Bild. */
    if (title) title.style.opacity = clamp(p / 0.05);

    var x = posAt(p);
    var eps = 0.004;
    var speed = Math.abs(posAt(p + eps) - posAt(p - eps)) / (2 * eps);
    var moving = clamp(speed / (geo.w * 1.2));

    var phase = walked(p) / geo.step;
    /* Dazu ein leichtes Auf und Ab, damit der Gang Gewicht bekommt. */
    var bob = -Math.abs(Math.sin(phase)) * 5 * moving;

    figure.style.transform =
      "translate(" + x + "px," + bob + "px) translate(-50%, -100%)";

    /* Das Gangbild hängt an der zurückgelegten Strecke. Steht er, steht das
       Bild ebenfalls. */
    gangSetzen(gangBild, phase);

    /* Der Pfeil liegt auf der Sehne, bis geschossen wird, danach fliegt er
       nach rechts aus dem Bild. */
    var shot = clamp((p - SHOOT) / 0.14);
    var tipX = x + 0.4939 * geo.figW;
    var tipY = bob - 0.6614 * geo.figW;
    if (arrow) {
      var flyX = lerp(tipX, geo.w + 220, easeIn(shot));
      arrow.style.transform =
        "translate(" + flyX + "px," + tipY + "px) translate(-100%, -50%)";
      /* Er liegt von Anfang an auf der Sehne, geschossen wird erst an der
         vierten Station. */
      arrow.style.opacity = 1;
    }

    for (var n = 0; n < 4; n++) {
      /* Die Station leuchtet auf, sobald die Figur ankommt, und bleibt hell. */
      var lit = clamp((p - (ARRIVE[n] - 0.02)) / 0.05);
      stops[n].style.background = lit > 0 ? "#96d1fd" : "#24374f";
      stops[n].style.opacity = 0.35 + 0.65 * lit;
      stops[n].style.boxShadow =
        "0 0 0 " + 5 * lit + "px rgba(150, 209, 253, " + 0.1 * lit + ")";

      /* Der Text steht, solange die Figur an der Station steht. */
      var inT = clamp((p - (ARRIVE[n] - 0.03)) / 0.05);
      var outT = n === 3 ? 0 : clamp((p - LEAVE[n]) / 0.05);
      var vis = inT * (1 - outT);
      steps[n].style.opacity = vis;
      steps[n].style.transform =
        "translate(" + geo.stepX[n] + "px," + (1 - vis) * 12 + "px)";
    }

    /* Zwischen zwei Stationen zieht die Figur die Linie hinter sich her. */
    var lines = links.childNodes;
    for (var k = 0; k < lines.length; k++) {
      var t = clamp((p - LEAVE[k]) / (ARRIVE[k + 1] - LEAVE[k]));
      lines[k].style.strokeDashoffset = String(1 - t);
    }
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
