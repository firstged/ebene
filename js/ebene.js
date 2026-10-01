/* ══════════════════════════════════════════════
   ÉBÈNE — interactions
   Écrit à la main, zéro dépendance.
   ══════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ─────────────────────────────────────────
     À RENSEIGNER : le WhatsApp de l'atelier.
     Format international, sans + ni espaces.
     Gabon = 241. Exemple : "24106123456"
     ───────────────────────────────────────── */
  var WHATSAPP = "24177923883";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function nowMs() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

  /* ══════════ WHATSAPP ══════════ */

  function wireWhatsApp() {
    var ready = WHATSAPP.indexOf("X") === -1;

    $$(".js-wa").forEach(function (a) {
      var prod = a.getAttribute("data-prod");
      var msg = prod
        ? "Bonjour ÉBÈNE, je souhaite commander : " + prod + "."
        : "Bonjour ÉBÈNE, je découvre vos produits et j'aimerais commander.";

      if (!ready) {
        if (a.getAttribute("href") === "#") a.setAttribute("href", "#commander");
        a.setAttribute("title", "Renseigne la constante WHATSAPP dans js/ebene.js");
        return;
      }
      a.setAttribute("href", "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
  }

  /* ══════════ EFFET DE REMPLACEMENT ══════════
     Chaque lettre est doublée dans une fenêtre qui
     glisse : la copie du bas remplace celle du haut,
     avec un décalage lettre à lettre. */

  function buildRoll(el) {
    var txt = el.textContent;
    el.textContent = "";
    Array.prototype.forEach.call(txt, function (ch, i) {
      var cell = document.createElement("span");
      cell.className = "roll-c";
      var inner = document.createElement("span");
      inner.className = "roll-i";
      inner.style.transitionDelay = (i * 0.026).toFixed(3) + "s";
      var a = document.createElement("span");
      var b = document.createElement("span");
      a.textContent = ch;
      b.textContent = ch;
      b.setAttribute("aria-hidden", "true");
      inner.appendChild(a);
      inner.appendChild(b);
      cell.appendChild(inner);
      el.appendChild(cell);
    });
  }

  function initRoll() { $$("[data-roll]").forEach(buildRoll); }

  /* ══════════ DÉCOUPE EN MOTS ══════════ */

  function splitWords(root) {
    var i = 0;

    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var wrap = document.createElement("span");
            wrap.className = "wd";
            var inner = document.createElement("i");
            inner.textContent = p;
            inner.style.transitionDelay = (i * 0.055).toFixed(3) + "s";
            i++;
            wrap.appendChild(inner);
            frag.appendChild(wrap);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          var tag = String(n.tagName).toUpperCase();
          if (tag !== "BR" && tag !== "SVG") walk(n);
        }
      });
    }

    walk(root);
  }

  function initSplit() { $$("[data-split]").forEach(splitWords); }

  /* ══════════ TRACÉS À MAIN LEVÉE ══════════ */

  function initSketch() {
    $$("[data-draw] path, .ring-loop path").forEach(function (p) {
      var len = 400;
      try { len = p.getTotalLength(); } catch (e) { /* valeur de repli */ }
      p.style.setProperty("--len", Math.ceil(len + 2));
    });
  }

  /* ══════════ RÉVÉLATIONS ══════════ */

  function show(node) {
    node.classList.add("is-in");
    if (node.hasAttribute("data-draw")) node.classList.add("is-drawn");
    var fig = node.querySelector("[data-count]");
    if (fig) countUp(fig);
  }

  function initReveal() {
    var targets = $$("[data-rise], [data-split], [data-draw]");

    if (REDUCED || !("IntersectionObserver" in window)) {
      targets.forEach(function (n) { n.classList.add("is-in", "is-drawn"); });
      $$("[data-count]").forEach(function (n) { n.textContent = n.getAttribute("data-count"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        show(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    targets.forEach(function (n) {
      if (n.closest(".hero")) return;      // le héros est révélé par le preloader
      io.observe(n);
    });
  }

  function revealHero() {
    var hero = $(".hero");
    if (!hero) return;
    $$("[data-rise], [data-split], [data-draw]", hero).forEach(show);
  }

  function countUp(node) {
    var target = parseInt(node.getAttribute("data-count"), 10) || 0;
    var dur = 1250, t0 = 0;
    function step(t) {
      if (!t0) t0 = t;
      var p = clamp((t - t0) / dur, 0, 1);
      node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    setTimeout(function () { node.textContent = target; }, dur + 400);
  }

  /* ══════════ « ELLES » ↔ ♀ , « ILS » ↔ ♂ ══════════ */

  function initGender() {
    var gx = $$(".gx");
    if (!gx.length || REDUCED) return;

    var started = false;
    function run() {
      if (started) return;
      started = true;
      var on = false;
      setInterval(function () {
        on = !on;
        gx.forEach(function (el, i) {
          setTimeout(function () { el.classList.toggle("on", on); }, i * 220);
        });
      }, 3000);
    }

    if (!("IntersectionObserver" in window)) { run(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { setTimeout(run, 900); io.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(gx[0]);
  }

  /* ══════════ MENU ══════════ */

  function initMenu() {
    var btn = $("#menuBtn");
    var panel = $("#menuPanel");
    if (!btn || !panel) return;

    var open = false;

    function setOpen(v) {
      if (v === open) return;
      open = v;
      btn.setAttribute("aria-expanded", String(v));
      document.body.classList.toggle("menu-open", v);

      if (v) {
        panel.hidden = false;
        // Le display doit être pris en compte avant que la transition démarre.
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { if (open) panel.classList.add("is-open"); });
        });
        setTimeout(function () { if (open) panel.classList.add("is-open"); }, 70);
      } else {
        panel.classList.remove("is-open");
        setTimeout(function () { if (!open) panel.hidden = true; }, 800);
      }
    }

    btn.addEventListener("click", function () { setOpen(!open); });
    $$("a", panel).forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) setOpen(false);
    });
  }

  /* ══════════ MARQUEE ══════════ */

  function initMarquee() {
    var track = $("#marqTrack");
    if (!track) return;
    var set = $(".marq-set", track);
    if (!set) return;

    var unit = set.scrollWidth;
    if (!unit) return;
    var need = Math.ceil((window.innerWidth * 2) / unit) + 1;
    for (var i = 0; i < need; i++) track.appendChild(set.cloneNode(true));

    if (REDUCED) return;

    var x = 0, last = 0;
    function run(t) {
      if (!last) last = t;
      var dt = Math.min(t - last, 50);
      last = t;
      x -= dt * 0.045;
      if (x <= -unit) x += unit;
      track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
      requestAnimationFrame(run);
    }
    requestAnimationFrame(run);
  }

  /* ══════════ FEUILLES FLOTTANTES ══════════ */

  function initFloat() {
    if (REDUCED) return;
    var leaves = $$("[data-float]").map(function (el) {
      var base = getComputedStyle(el).transform;
      return {
        el: el,
        base: base === "none" ? "" : base,
        ph: (parseFloat(el.getAttribute("data-float")) || 0) * 2.1,
        amp: 7 + Math.random() * 5,
        rot: 1.4 + Math.random() * 1.4
      };
    });
    if (!leaves.length) return;

    var t = 0;
    function run() {
      t += 0.0068;
      leaves.forEach(function (l) {
        var y = Math.sin(t + l.ph) * l.amp;
        var r = Math.sin(t * 0.72 + l.ph) * l.rot;
        l.el.style.transform = l.base + " translateY(" + y.toFixed(2) + "px) rotate(" + r.toFixed(2) + "deg)";
      });
      requestAnimationFrame(run);
    }
    requestAnimationFrame(run);
  }

  /* ══════════ CARTES & BOUTONS VIVANTS ══════════ */

  function follow(el, strength) {
    var raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    function run() {
      x = lerp(x, tx, 0.16);
      y = lerp(y, ty, 0.16);
      el.style.transform = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px)";
      if (Math.abs(x - tx) > 0.09 || Math.abs(y - ty) > 0.09) raf = requestAnimationFrame(run);
      else { el.style.transform = (tx || ty) ? "translate(" + tx + "px," + ty + "px)" : ""; raf = 0; }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(run); }

    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * strength;
      ty = ((e.clientY - r.top) / r.height - 0.5) * strength;
      kick();
    });
    el.addEventListener("mouseleave", function () { tx = 0; ty = 0; kick(); });
  }

  function initLively() {
    if (!FINE || REDUCED) return;
    $$("[data-tilt]").forEach(function (el) { follow(el, 14); });
    $$("[data-mag]").forEach(function (el) { follow(el, 17); });
  }

  /* ══════════ DÉFILEMENT ══════════ */

  function initScroll() {
    var mark = $(".mark");
    var dark = $$(".game, .cta, .foot, .band-bissap");
    var para = $$("[data-parallax]");
    var pending = false;

    function frame() {
      pending = false;

      if (mark) {
        var m = mark.getBoundingClientRect();
        var mid = m.top + m.height / 2;
        var onDark = dark.some(function (s) {
          var r = s.getBoundingClientRect();
          return r.top <= mid && r.bottom >= mid;
        });
        mark.classList.toggle("on-dark", onDark);
      }

      if (!REDUCED) {
        para.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < -220 || r.top > window.innerHeight + 220) return;
          var f = parseFloat(el.getAttribute("data-parallax")) || 0;
          var off = (r.top + r.height / 2 - window.innerHeight / 2) * -f;
          el.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
        });
      }
    }

    window.addEventListener("scroll", function () {
      if (!pending) { pending = true; requestAnimationFrame(frame); }
    }, { passive: true });
    window.addEventListener("resize", frame, { passive: true });
    frame();
  }

  /* ══════════ PRELOADER ══════════ */

  function initPreloader(done) {
    var pre = $("#pre");
    var rect = $("#fillRect");
    var num = $("#preNum");
    if (!pre || !rect || !num) { done(); return; }

    document.body.classList.add("is-locked");

    var TOP = -130, BOTTOM = 85, H = BOTTOM - TOP;
    var p = 0, ready = false, over = false;
    var t0 = nowMs();
    var MIN = REDUCED ? 260 : 2100;

    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fonts.then(function () { ready = true; });
    setTimeout(function () { ready = true; }, 2800);

    // Piloté par setInterval, PAS par requestAnimationFrame : rAF ne se
    // déclenche pas dans un document masqué (onglet en arrière-plan,
    // iframe d'aperçu), ce qui bloquerait le site sur cet écran.
    var tick = setInterval(step, 33);
    var watchdog = setTimeout(function () { p = 100; step(); }, 7000);

    function step() {
      if (over) return;
      var target = clamp(((nowMs() - t0) / MIN) * 100, 0, ready ? 100 : 92);
      p = Math.max(p, lerp(p, target, 0.12));
      if (target >= 99.6 && target - p < 0.4) p = 100;

      num.textContent = Math.round(p);
      var fh = (p / 100) * H;
      rect.setAttribute("y", (BOTTOM - fh).toFixed(2));
      rect.setAttribute("height", fh.toFixed(2));

      if (p >= 99.95) finish();
    }

    function finish() {
      if (over) return;
      over = true;
      clearInterval(tick);
      clearTimeout(watchdog);
      num.textContent = "100";
      rect.setAttribute("y", String(TOP));
      rect.setAttribute("height", String(H));

      setTimeout(function () {
        pre.classList.add("is-out");
        document.body.classList.remove("is-locked");
        done();
        setTimeout(function () { pre.classList.add("is-gone"); }, 1600);
      }, REDUCED ? 60 : 420);
    }

    step();
  }

  /* ══════════════════════════════════════════
     LE JEU — tranche les savons
     Canvas pur, aucune bibliothèque.
     ══════════════════════════════════════════ */

  function initGame() {
    var cv = $("#gameCv");
    var box = $(".game-box");
    if (!cv || !box) return;

    var ctx = cv.getContext("2d");
    if (!ctx) return;

    var elScore = $("#gScore"), elBest = $("#gBest"), elLife = $("#gLife");
    var ov = $("#gameOv"), ovTtl = $("#goTtl"), ovSub = $("#goSub"), ovBtn = $("#gameBtn");

    var W = 0, H = 0, dpr = 1;
    var items = [], bits = [], blade = [];
    var score = 0, lives = 3, playing = false, raf = 0, last = 0, spawnAt = 0, visible = false;

    var best = 0;
    try { best = parseInt(localStorage.getItem("ebene.best") || "0", 10) || 0; } catch (e) { best = 0; }
    elBest.textContent = best;

    var KINDS = [
      { t: "soap", c: "#E8A32E", c2: "#F7D77E", r: 34 },
      { t: "soap", c: "#4F7F3C", c2: "#8FB573", r: 34 },
      { t: "soap", c: "#E8D45C", c2: "#F2E7A0", r: 34 },
      { t: "soap", c: "#D9742C", c2: "#E79A5E", r: 34 },
      { t: "leaf", c: "#4F7F3C", c2: "#8FB573", r: 32 },
      { t: "oil",  c: "#C9A978", c2: "#EFE3CB", r: 32 }
    ];
    var BOMB = { t: "bomb", c: "#C43D2E", c2: "#8E2A1E", r: 28 };

    function size() {
      var r = box.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function reset() {
      items = []; bits = []; blade = [];
      score = 0; lives = 3;
      elScore.textContent = "0";
      elLife.textContent = "● ● ●";
      spawnAt = 0;
    }

    function spawn() {
      var k = Math.random() < 0.17 ? BOMB : KINDS[(Math.random() * KINDS.length) | 0];
      var x = rand(W * 0.14, W * 0.86);
      var peak = rand(H * 0.16, H * 0.42);
      var g = 1400;
      var vy = -Math.sqrt(2 * g * (H - peak));
      items.push({
        x: x, y: H + k.r + 10,
        vx: rand(40, 170) * (x > W / 2 ? -1 : 1),
        vy: vy,
        rot: rand(0, Math.PI * 2),
        vr: rand(-2.4, 2.4),
        k: k, g: g, dead: false
      });
    }

    function burst(o, n) {
      for (var i = 0; i < n; i++) {
        bits.push({
          x: o.x, y: o.y,
          vx: rand(-260, 260), vy: rand(-320, 80),
          r: rand(2.5, 6), life: 1,
          c: Math.random() < 0.5 ? o.k.c : o.k.c2
        });
      }
    }

    function halves(o) {
      [-1, 1].forEach(function (s) {
        bits.push({
          half: true, k: o.k, rot: o.rot, vr: o.vr * 1.6,
          x: o.x, y: o.y,
          vx: o.vx + s * rand(90, 190),
          vy: o.vy * 0.4 - rand(40, 130),
          side: s, life: 1
        });
      });
    }

    /* ---------- dessin ---------- */

    function roundRect(c, x, y, w, h, r) {
      if (c.roundRect) { c.beginPath(); c.roundRect(x, y, w, h, r); return; }
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    function leafPath(c, R) {
      c.beginPath();
      for (var i = -2; i <= 2; i++) {
        var a = i * 0.62;
        var sc = 1 - Math.abs(i) * 0.14;
        var ca = Math.cos(a), sa = Math.sin(a);
        function pt(px, py) { return [px * ca - py * sa, px * sa + py * ca]; }
        var p0 = pt(0, 0);
        var c1 = pt(-0.13 * R * sc, -0.3 * R * sc), c2 = pt(-0.2 * R * sc, -0.72 * R * sc), p1 = pt(0, -R * sc);
        var c3 = pt(0.2 * R * sc, -0.72 * R * sc), c4 = pt(0.13 * R * sc, -0.3 * R * sc);
        c.moveTo(p0[0], p0[1]);
        c.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p1[0], p1[1]);
        c.bezierCurveTo(c3[0], c3[1], c4[0], c4[1], p0[0], p0[1]);
      }
      c.closePath();
    }

    function drawShape(c, k, clipSide) {
      c.lineWidth = 3;
      c.strokeStyle = "#3B2A17";

      if (clipSide) {
        c.beginPath();
        c.rect(clipSide < 0 ? -k.r * 2.2 : 0, -k.r * 2.2, k.r * 2.2, k.r * 4.4);
        c.clip();
      }

      var g;
      if (k.t === "soap") {
        g = c.createLinearGradient(-k.r, -k.r, k.r, k.r);
        g.addColorStop(0, k.c2); g.addColorStop(1, k.c);
        c.fillStyle = g;
        roundRect(c, -k.r, -k.r * 0.62, k.r * 2, k.r * 1.24, 8);
        c.fill(); c.stroke();
      } else if (k.t === "oil") {
        g = c.createLinearGradient(-k.r, -k.r, k.r, k.r);
        g.addColorStop(0, k.c2); g.addColorStop(1, k.c);
        c.fillStyle = g;
        roundRect(c, -k.r * 0.46, -k.r * 0.78, k.r * 0.92, k.r * 1.6, 7);
        c.fill(); c.stroke();
        c.fillStyle = "#3B2A17";
        roundRect(c, -k.r * 0.2, -k.r * 1.04, k.r * 0.4, k.r * 0.3, 3);
        c.fill();
      } else if (k.t === "leaf") {
        c.fillStyle = k.c;
        leafPath(c, k.r * 1.6);
        c.fill();
        c.strokeStyle = k.c2;
        c.lineWidth = 2;
        c.stroke();
      } else {
        // piment : à ne surtout pas trancher
        c.fillStyle = k.c;
        c.beginPath();
        c.moveTo(0, -k.r * 0.7);
        c.bezierCurveTo(k.r * 0.75, -k.r * 0.3, k.r * 0.6, k.r * 0.9, -k.r * 0.1, k.r);
        c.bezierCurveTo(-k.r * 0.5, k.r * 0.5, -k.r * 0.45, -k.r * 0.3, 0, -k.r * 0.7);
        c.closePath();
        c.fill(); c.stroke();
        c.strokeStyle = "#4F7F3C";
        c.lineWidth = 5;
        c.beginPath();
        c.moveTo(0, -k.r * 0.7);
        c.quadraticCurveTo(k.r * 0.2, -k.r * 1.15, k.r * 0.55, -k.r * 1.2);
        c.stroke();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      bits.forEach(function (b) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, b.life);
        if (b.half) {
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rot);
          drawShape(ctx, b.k, b.side);
        } else {
          ctx.fillStyle = b.c;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      items.forEach(function (o) {
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.rotate(o.rot);
        drawShape(ctx, o.k);
        ctx.restore();
      });

      if (blade.length > 1) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (var w = 0; w < 2; w++) {
          ctx.beginPath();
          ctx.moveTo(blade[0].x, blade[0].y);
          for (var i = 1; i < blade.length; i++) ctx.lineTo(blade[i].x, blade[i].y);
          ctx.strokeStyle = w === 0 ? "rgba(251,247,234,.3)" : "#F3BE3C";
          ctx.lineWidth = w === 0 ? 14 : 4;
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    /* ---------- boucle ---------- */

    function step(t) {
      raf = requestAnimationFrame(step);
      if (!last) last = t;
      var dt = Math.min((t - last) / 1000, 0.045);
      last = t;

      if (playing) {
        spawnAt -= dt;
        if (spawnAt <= 0) {
          spawn();
          if (Math.random() < 0.3) spawn();
          spawnAt = Math.max(0.3, rand(0.55, 1.15) - Math.min(score * 0.004, 0.35));
        }
      }

      items.forEach(function (o) {
        o.vy += o.g * dt;
        o.x += o.vx * dt;
        o.y += o.vy * dt;
        o.rot += o.vr * dt;
        if (o.y > H + 90 && o.vy > 0) {
          o.dead = true;
          if (playing && o.k.t !== "bomb") loseLife();
        }
      });
      items = items.filter(function (o) { return !o.dead; });

      bits.forEach(function (b) {
        b.vy += 1500 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.half) { b.rot += b.vr * dt; b.life -= dt * 0.75; }
        else b.life -= dt * 1.5;
      });
      bits = bits.filter(function (b) { return b.life > 0 && b.y < H + 160; });

      if (blade.length) {
        var cut = nowMs() - 110;
        blade = blade.filter(function (p) { return p.t > cut; });
      }

      draw();
    }

    function loseLife() {
      lives--;
      elLife.textContent = lives > 0 ? new Array(lives + 1).join("● ").trim() : "—";
      if (lives <= 0) end("Perdu !", "Trois savons par terre. Score final : " + score + ".");
    }

    /* ---------- lame ---------- */

    function distSeg(a, b, o) {
      var dx = b.x - a.x, dy = b.y - a.y;
      var L = dx * dx + dy * dy;
      var t = L ? clamp(((o.x - a.x) * dx + (o.y - a.y) * dy) / L, 0, 1) : 0;
      return Math.hypot(o.x - (a.x + t * dx), o.y - (a.y + t * dy));
    }

    function addPoint(x, y) {
      blade.push({ x: x, y: y, t: nowMs() });
      if (blade.length > 14) blade.shift();
      if (!playing || blade.length < 2) return;

      var a = blade[blade.length - 2], b = blade[blade.length - 1];
      if (Math.hypot(b.x - a.x, b.y - a.y) < 7) return;

      items.forEach(function (o) {
        if (o.dead || distSeg(a, b, o) > o.k.r) return;
        o.dead = true;
        if (o.k.t === "bomb") {
          burst(o, 26);
          end("Aïe, piment !", "Score final : " + score + ". Les piments, ça ne se tranche pas.");
        } else {
          score++;
          elScore.textContent = score;
          halves(o);
          burst(o, 9);
        }
      });
    }

    var down = false;
    function local(e) {
      var r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    cv.addEventListener("pointerdown", function (e) {
      down = true;
      if (cv.setPointerCapture) { try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
      var p = local(e); addPoint(p.x, p.y);
    });
    cv.addEventListener("pointermove", function (e) {
      if (!down && e.pointerType !== "mouse") return;
      var p = local(e); addPoint(p.x, p.y);
    });
    window.addEventListener("pointerup", function () { down = false; });
    cv.addEventListener("pointerleave", function () { blade = []; });

    /* ---------- états ---------- */

    function setBtnLabel(txt) {
      var inner = $$(".roll-i", ovBtn);
      if (inner.length) {
        // Le bouton porte l'effet de remplacement : on réécrit les deux copies.
        ovBtn.textContent = txt;
        buildRoll(ovBtn);
      } else {
        ovBtn.textContent = txt;
      }
    }

    function start() {
      reset();
      playing = true;
      ov.classList.add("is-hidden");
    }

    function end(ttl, sub) {
      playing = false;
      if (score > best) {
        best = score;
        elBest.textContent = best;
        try { localStorage.setItem("ebene.best", String(best)); } catch (e) { /* stockage indisponible */ }
      }
      ovTtl.textContent = ttl;
      ovSub.textContent = sub;
      setBtnLabel("Rejouer");
      ov.classList.remove("is-hidden");
    }

    ovBtn.addEventListener("click", start);

    size();
    window.addEventListener("resize", size, { passive: true });

    function loop(on) {
      if (on && !raf) { last = 0; raf = requestAnimationFrame(step); }
      else if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { visible = e.isIntersecting; loop(visible); });
      }, { threshold: 0.12 }).observe(box);
    } else {
      visible = true;
      loop(true);
    }

    document.addEventListener("visibilitychange", function () {
      loop(!document.hidden && visible);
    });
  }

  /* ══════════ DÉMARRAGE ══════════ */

  function boot() {
    var yr = $("#yr");
    if (yr) yr.textContent = String(new Date().getFullYear());

    wireWhatsApp();
    initRoll();
    initSplit();
    initSketch();
    initReveal();
    initGender();
    initMenu();
    initFloat();
    initLively();
    initScroll();
    initGame();

    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fonts.then(initMarquee);

    initPreloader(revealHero);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
