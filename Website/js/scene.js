/* Die Szene im Hero: das Strichmännchen läuft herein, bückt sich, hebt den
   Stern auf. Im Knall wird daraus der Zentaur aus dem Logo, und der Stern
   setzt sich als Spitze auf seinen Pfeil. Nichts läuft von allein, jede Pose
   hängt am Scrollstand, vorwärts wie rückwärts. */
(function () {
  "use strict";

  var hero = document.getElementById("hero");
  if (!hero) return;

  var stage = hero.querySelector(".hero-stage");
  var figure = document.getElementById("figure");
  var figSvg = figure.querySelector("svg");
  var upper = figure.querySelector(".fig-upper");
  var legA = figure.querySelector(".leg-a");
  var legB = figure.querySelector(".leg-b");
  var armA = figure.querySelector(".arm-a");
  var armB = figure.querySelector(".arm-b");
  var centaur = document.getElementById("centaur");
  var gangBild = centaur.querySelector(".gait-frame");
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

  var star = document.getElementById("star");
  var glow = document.getElementById("star-glow");
  var bang = document.getElementById("bang");
  var copy = document.getElementById("hero-copy");
  var titel = document.getElementById("hero-title");
  var titelNeu = document.getElementById("hero-next");
  var sub = hero.querySelector(".hero-sub");
  var stamp = hero.querySelector(".stamp");
  var hint = document.getElementById("scroll-hint");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Die Stationen der Szene als Anteil am Scrollweg. Der Vorlauf bis 0,08
     bleibt leer: erst steht die Seite still, dann kommt das Männchen herein. */
  var WALK_START = 0.08;
  var WALK_END = 0.52;
  var BEND_END = 0.62;
  var LIFT_END = 0.74;

  /* Maße aus dem Logo: die Pfeilspitze liegt bei 99,4 Prozent der Breite und
     23,9 Prozent der Höhe des Zentauren. */
  var TIP_X = 0.4939;
  var TIP_Y = 0.6614;

  function clamp(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  var geo = {};

  function measure() {
    geo.w = stage.clientWidth;
    geo.h = stage.clientHeight;
    geo.ground = geo.h * 0.34;
    geo.figW = figSvg.getBoundingClientRect().width || 56;
    geo.scale = geo.figW / 40; // Die Zeichnung ist 40 Einheiten breit.
    geo.cW = centaur.getBoundingClientRect().width || 200;
    geo.starX = geo.w * (geo.w < 700 ? 0.6 : 0.66);
    geo.startX = -geo.figW;
    geo.stopX = geo.starX - geo.figW * 0.5;
    geo.step = geo.figW * 0.42; // Schrittlänge
  }

  function render(p) {
    var walkT = clamp((p - WALK_START) / (WALK_END - WALK_START));
    var bendT = clamp((p - WALK_END) / (BEND_END - WALK_END));
    var liftT = clamp((p - BEND_END) / (LIFT_END - BEND_END));
    var bangT = clamp((p - LIFT_END) / (1 - LIFT_END));

    var x = lerp(geo.startX, geo.stopX, walkT);

    /* Der Gang hängt an der zurückgelegten Strecke, nicht an der Uhr. */
    var phase = (x - geo.startX) / geo.step;
    var swing = Math.sin(phase) * 26 * (1 - bendT);

    var legAdeg = lerp(swing, 16, bendT);
    var legBdeg = lerp(-swing, -12, bendT);
    /* Im Gehen hängen beide Arme gerade herunter und schwingen mit. Beim
       Bücken greift der vordere steil nach unten zum Stern. */
    var armAdeg = lerp(-swing * 0.6, -33, bendT);
    var armBdeg = lerp(swing * 0.6, -18, bendT);

    var upperDeg = lerp(lerp(0, 48, bendT), -6, liftT);
    /* Beim Aufrichten schwenkt der Arm nach vorn oben, nicht über den Kopf. */
    armAdeg = lerp(armAdeg, -74, liftT);
    armBdeg = lerp(armBdeg, -26, liftT);

    var bob = -Math.abs(Math.sin(phase)) * geo.scale * 1.2 * (1 - bendT);

    figure.style.transform =
      "translate(" + x + "px," + (geo.ground + bob) + "px)";
    upper.style.transform = "rotate(" + upperDeg + "deg)";
    legA.style.transform = "rotate(" + legAdeg + "deg)";
    legB.style.transform = "rotate(" + legBdeg + "deg)";
    armA.style.transform = "rotate(" + armAdeg + "deg)";
    armB.style.transform = "rotate(" + armBdeg + "deg)";

    /* Der Stern hängt an den Fingerspitzen, ein Stück vor der Hand. */
    var handX = x + 18 * geo.scale;
    var handY = geo.ground - 45 * geo.scale;

    var starX = lerp(geo.starX, handX, easeOut(liftT));
    var starY = lerp(geo.ground, handY, easeOut(liftT));

    var grow = easeOut(walkT);
    var starScale = lerp(0.12, 1, grow) * lerp(1, 1.45, liftT);
    var starSpin = (1 - grow) * -140;

    /* Im Knall wird aus dem Männchen der Zentaur, und der Stern wandert aus
       der Hand auf die Spitze seines Pfeils. */
    var morph = clamp((bangT - 0.04) / 0.3);
    var fade = 1 - clamp((bangT - 0.02) / 0.28);

    /* Nach der Verwandlung läuft er weiter, bis er rechts aus dem Bild ist. */
    var abgang = clamp((bangT - 0.34) / 0.66);
    var cx = lerp(geo.stopX, geo.w + geo.cW, easeOut(abgang));
    var cBob =
      -Math.abs(Math.sin((cx - geo.stopX) / (geo.cW * 0.34))) *
      geo.cW *
      0.022 *
      (abgang > 0 && abgang < 1 ? 1 : 0);

    var tipX = cx + TIP_X * geo.cW;
    var tipY = geo.ground + cBob - TIP_Y * geo.cW;

    centaur.style.transform =
      "translate(" + cx + "px," + (geo.ground + cBob) +
      "px) translate(-50%, -100%)";

    /* Das Gangbild hängt an der zurückgelegten Strecke. */
    gangSetzen(gangBild, (cx - geo.stopX) / (geo.cW * 0.3));
    centaur.style.opacity = morph;
    figure.style.opacity = fade;

    starX = lerp(starX, tipX, morph);
    starY = lerp(starY, tipY, morph);

    star.style.transform =
      "translate(" + starX + "px," + starY + "px) scale(" + starScale +
      ") rotate(" + starSpin + "deg)";
    star.style.opacity = Math.max((0.06 + 0.94 * grow) * fade, morph);
    if (glow) glow.style.opacity = (0.08 + 0.72 * grow) * (1 - 0.8 * morph);

    /* Der Knall geht von der Hand aus, wächst über den Schirm und verglüht. */
    var bangScale = 0.15 + 44 * easeOut(bangT);
    var bangAlpha =
      bangT <= 0 ? 0 : bangT < 0.28 ? bangT / 0.28 : 1 - (bangT - 0.28) / 0.5;
    bang.style.transform =
      "translate(" + (handX - 20) + "px," + (handY - 20) + "px) scale(" +
      bangScale + ")";
    bang.style.opacity = (reduced ? 0.3 : 1) * clamp(bangAlpha);

    /* Aus demselben Punkt entsteht der Sternenhimmel. */
    if (window.CentaurusSky) {
      window.CentaurusSky.set(clamp(bangT / 0.55), handX / geo.w, handY / geo.h);
    }

    /* Im Licht löst der neue Titel den alten ab, an genau derselben Stelle.
       Untertitel und Ortszeile gehen mit dem alten Titel. */
    var raus = clamp((p - LIFT_END) / 0.09);
    var rein = clamp((p - LIFT_END - 0.05) / 0.11);

    titel.style.opacity = 1 - raus;
    titel.style.transform = "translateY(" + -12 * raus + "px)";
    if (sub) sub.style.opacity = 1 - raus;
    if (stamp) stamp.style.opacity = 1 - raus;

    titelNeu.style.opacity = rein;
    titelNeu.style.transform = "translateY(" + (1 - rein) * 14 + "px)";

    if (hint) hint.style.opacity = 1 - clamp(p / 0.06);
  }

  var ticking = false;

  function update() {
    ticking = false;
    var rect = hero.getBoundingClientRect();
    var span = hero.offsetHeight - stage.offsetHeight;
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
