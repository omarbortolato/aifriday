/* ============================================================
   AI FRIDAY — interactions
   ============================================================ */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navbar scroll + active link ---------- */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navLinksWrap = document.getElementById("navLinks");
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id], header[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));

  function onScroll() {
    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");

    var y = window.scrollY + 140;
    var current = "";
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= y) current = sections[i].id;
    }
    navLinks.forEach(function (a) {
      var href = a.getAttribute("href").slice(1);
      a.classList.toggle("active", href === current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinksWrap.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { nav.classList.remove("open"); navToggle.setAttribute("aria-expanded", "false"); }
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.innerHTML = target + (suffix ? '<span class="suffix">' + suffix + "</span>" : ""); return; }
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(2, -10 * p); // ease-out-expo
      var val = Math.round(target * eased);
      el.innerHTML = val + (suffix ? '<span class="suffix">' + suffix + "</span>" : "");
      if (p < 1) requestAnimationFrame(step);
      else el.innerHTML = target + (suffix ? '<span class="suffix">' + suffix + "</span>" : "");
    }
    requestAnimationFrame(step);
  }
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { animateCount(en.target); countIO.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach(function (el) { countIO.observe(el); });

  /* ---------- Form validation ---------- */
  var form = document.getElementById("contactForm");
  var success = document.getElementById("formSuccess");
  function validateField(field) {
    var input = field.querySelector("input, textarea");
    var ok = true;
    if (input.hasAttribute("required") && !input.value.trim()) ok = false;
    if (input.type === "email" && input.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) ok = false;
    field.classList.toggle("invalid", !ok);
    return ok;
  }
  if (form) {
    form.querySelectorAll(".field input, .field textarea").forEach(function (input) {
      input.addEventListener("blur", function () { validateField(input.closest(".field")); });
      input.addEventListener("input", function () {
        var f = input.closest(".field");
        if (f.classList.contains("invalid")) validateField(f);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = Array.prototype.slice.call(form.querySelectorAll(".field"));
      var allOk = true;
      fields.forEach(function (f) { if (!validateField(f)) allOk = false; });
      if (!allOk) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }
      form.style.display = "none";
      success.classList.add("show");
    });
  }

  /* ============================================================
     Hero particle network
     ============================================================ */
  var canvas = document.getElementById("particles");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, nodes = [];
    var COLORS = ["#7c3aed", "#06b6d4"];

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
      resize();
      var count = Math.min(80, Math.floor((w * h) / 14000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.6 + 0.8,
          c: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x, dy = n.y - m.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.globalAlpha = (1 - dist / 150) * 0.28;
            ctx.strokeStyle = "#7c3aed";
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 0.6;
      for (var k = 0; k < nodes.length; k++) {
        var p = nodes[k];
        ctx.beginPath(); ctx.fillStyle = p.c;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    init();
    draw();
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(init, 200); });
  }

  /* ---------- Hero illustration orbit nodes ---------- */
  var heroNodes = document.getElementById("heroNodes");
  if (heroNodes) {
    var rings = [{ r: 150, n: 8, op: 0.5 }, { r: 110, n: 6, op: 0.7 }, { r: 70, n: 4, op: 0.9 }];
    var colors = ["#06b6d4", "#7c3aed", "#10b981"];
    var svgNS = "http://www.w3.org/2000/svg";
    rings.forEach(function (ring, ri) {
      for (var i = 0; i < ring.n; i++) {
        var ang = (i / ring.n) * Math.PI * 2 + ri * 0.4;
        var cx = 240 + Math.cos(ang) * ring.r;
        var cy = 240 + Math.sin(ang) * ring.r;
        var line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", 240); line.setAttribute("y1", 240);
        line.setAttribute("x2", cx); line.setAttribute("y2", cy);
        line.setAttribute("stroke", colors[ri % colors.length]);
        line.setAttribute("stroke-opacity", "0.15");
        line.setAttribute("stroke-width", "1");
        heroNodes.appendChild(line);
        var c = document.createElementNS(svgNS, "circle");
        c.setAttribute("cx", cx); c.setAttribute("cy", cy);
        c.setAttribute("r", 3.5 + (2 - ri));
        c.setAttribute("fill", colors[ri % colors.length]);
        c.setAttribute("opacity", ring.op);
        c.style.transformOrigin = cx + "px " + cy + "px";
        c.style.animation = "heroPulse " + (2 + Math.random() * 2).toFixed(2) + "s ease-in-out " + (Math.random()).toFixed(2) + "s infinite";
        heroNodes.appendChild(c);
      }
    });
  }

  /* ============================================================
     Ambassador network graph (built + animated on reveal)
     ============================================================ */
  var stage = document.getElementById("networkStage");
  var svg = document.getElementById("networkSvg");
  if (stage && svg) {
    var NS = "http://www.w3.org/2000/svg";
    var gLines = document.getElementById("netLines");
    var gColl = document.getElementById("netColleagues");
    var gNodes = document.getElementById("netNodes");
    var funcs = ["Sales", "HR", "Legal", "Finance", "Operations", "IT", "Marketing", "Logistics"];
    var CX = 220, CY = 220, R = 150;
    var built = false;

    function buildGraph() {
      if (built) return; built = true;
      funcs.forEach(function (label, i) {
        var ang = (i / funcs.length) * Math.PI * 2 - Math.PI / 2;
        var x = CX + Math.cos(ang) * R;
        var y = CY + Math.sin(ang) * R;

        // line center -> ambassador
        var line = document.createElementNS(NS, "line");
        line.setAttribute("x1", CX); line.setAttribute("y1", CY);
        line.setAttribute("x2", x); line.setAttribute("y2", y);
        line.setAttribute("stroke", "#7c3aed");
        line.setAttribute("stroke-width", "1.4");
        var len = Math.hypot(x - CX, y - CY);
        line.setAttribute("stroke-dasharray", len);
        line.setAttribute("stroke-dashoffset", reduceMotion ? 0 : len);
        line.style.transition = "stroke-dashoffset 0.7s ease " + (0.3 + i * 0.08) + "s";
        line.style.strokeOpacity = "0.4";
        gLines.appendChild(line);

        // colleagues (small dots around ambassador)
        var cc = 3;
        for (var k = 0; k < cc; k++) {
          var ca = ang + (k - 1) * 0.42;
          var cr = 34;
          var clx = x + Math.cos(ca) * cr;
          var cly = y + Math.sin(ca) * cr;
          var cl = document.createElementNS(NS, "line");
          cl.setAttribute("x1", x); cl.setAttribute("y1", y);
          cl.setAttribute("x2", clx); cl.setAttribute("y2", cly);
          cl.setAttribute("stroke", "#94a3b8"); cl.setAttribute("stroke-width", "0.8");
          cl.setAttribute("stroke-opacity", "0");
          cl.style.transition = "stroke-opacity 0.5s ease " + (0.9 + i * 0.08) + "s";
          gColl.appendChild(cl);
          var dot = document.createElementNS(NS, "circle");
          dot.setAttribute("cx", clx); dot.setAttribute("cy", cly);
          dot.setAttribute("r", 2.4);
          dot.setAttribute("fill", "#cbd5e1"); dot.setAttribute("fill-opacity", "0");
          dot.style.transition = "fill-opacity 0.5s ease " + (0.9 + i * 0.08) + "s";
          gColl.appendChild(dot);
          requestAnimationFrame(function () { cl.setAttribute("stroke-opacity", "0.25"); dot.setAttribute("fill-opacity", "0.7"); });
        }

        // ambassador node
        var grp = document.createElementNS(NS, "g");
        grp.setAttribute("transform", "translate(" + x + "," + y + ")");
        grp.style.transformBox = "fill-box";
        var node = document.createElementNS(NS, "circle");
        node.setAttribute("r", 15);
        node.setAttribute("fill", "#0c0c17");
        node.setAttribute("stroke", "#06b6d4");
        node.setAttribute("stroke-width", "1.6");
        node.setAttribute("filter", "url(#glow)");
        node.style.transformOrigin = x + "px " + y + "px";
        if (!reduceMotion) {
          node.style.transform = "scale(0)";
          node.style.transition = "transform 0.5s cubic-bezier(.34,1.56,.64,1) " + (i * 0.08) + "s";
          node.style.animationName = "";
        }
        grp.appendChild(node);
        var txt = document.createElementNS(NS, "text");
        txt.setAttribute("x", x); txt.setAttribute("y", y + 3.5);
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("fill", "#e2e8f0");
        txt.setAttribute("font-family", "Inter, sans-serif");
        txt.setAttribute("font-size", "8.5");
        txt.setAttribute("font-weight", "600");
        txt.textContent = label;
        txt.setAttribute("opacity", reduceMotion ? "1" : "0");
        txt.style.transition = "opacity 0.4s ease " + (0.4 + i * 0.08) + "s";
        gNodes.appendChild(grp);
        gNodes.appendChild(txt);

        requestAnimationFrame(function () {
          line.setAttribute("stroke-dashoffset", 0);
          node.style.transform = "scale(1)";
          txt.setAttribute("opacity", "1");
          node.classList.add("amb-pulse");
        });
      });
    }

    if (reduceMotion) {
      buildGraph();
    } else {
      var graphIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { buildGraph(); graphIO.unobserve(en.target); }
        });
      }, { threshold: 0.3 });
      graphIO.observe(stage);
    }
  }
})();
