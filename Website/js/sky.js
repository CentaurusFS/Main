/* Der Sternenhimmel. Er existiert erst, wenn der Knall ihn erzeugt: alle
   Sterne starten im Ursprung des Knalls und fliegen auf ihre Plätze.
   Gesteuert wird das von scene.js über CentaurusSky.set(). */
(function () {
  "use strict";

  var canvas = document.getElementById("sky");
  if (!canvas) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Deterministischer Zufall: der Himmel sieht bei jedem Laden gleich aus. */
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  var layers = [
    { count: 80, drift: 0.0022, size: 1.35, alpha: 0.66 },
    { count: 120, drift: 0.0012, size: 0.95, alpha: 0.44 },
    { count: 180, drift: 0.0006, size: 0.65, alpha: 0.28 }
  ];

  layers.forEach(function (layer, i) {
    var r = rng(4370 + i * 911);
    layer.stars = [];
    for (var n = 0; n < layer.count; n++) {
      layer.stars.push({ x: r(), y: r(), t: r() * 6.28 });
    }
  });

  /* Auf der Startseite entsteht der Himmel erst im Knall. Auf allen anderen
     Seiten ist er längst da. */
  var level = document.getElementById("hero") ? 0 : 1;
  var originX = 0.5;
  var originY = 0.35;
  var drawn = false;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function setup() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: rect.width, h: rect.height };
  }

  var state = setup();
  var start = 0;

  function draw(time) {
    var ctx = state.ctx;
    var w = state.w;
    var h = state.h;
    ctx.clearRect(0, 0, w, h);

    if (level <= 0) return;

    var e = easeOut(level);
    var cx = originX * w;
    var cy = originY * h;

    layers.forEach(function (layer) {
      for (var i = 0; i < layer.stars.length; i++) {
        var s = layer.stars[i];
        var fy = ((s.y + (reduced ? 0 : time * layer.drift * 0.00004)) % 1.15) - 0.075;
        var x = cx + (s.x * w - cx) * e;
        var y = cy + (fy * h - cy) * e;
        var twinkle = reduced ? 1 : 0.75 + 0.25 * Math.sin(time * 0.0009 + s.t);
        ctx.globalAlpha = layer.alpha * twinkle * level;
        ctx.beginPath();
        ctx.arc(x, y, layer.size * (0.35 + 0.65 * e), 0, 6.2832);
        ctx.fillStyle = s.t > 4.6 ? "#96d1fd" : "#ffffff";
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  }

  function loop(time) {
    if (!start) start = time;
    /* Solange kein Himmel da ist, wird nur einmal geleert statt gezeichnet. */
    if (level > 0 || drawn) {
      draw(time - start);
      drawn = level > 0;
    }
    window.requestAnimationFrame(loop);
  }

  window.requestAnimationFrame(loop);

  window.addEventListener("resize", function () {
    state = setup();
  });

  window.CentaurusSky = {
    set: function (value, ox, oy) {
      level = value < 0 ? 0 : value > 1 ? 1 : value;
      if (typeof ox === "number") originX = ox;
      if (typeof oy === "number") originY = oy;
    }
  };
})();
