/* =========================================================
   PAGE FADE IN / OUT — SINGLE, BULLETPROOF SYSTEM (FIXED)
   ========================================================= */

// FADE OUT — works on ALL nav links (YAM, About, Contact)
document.addEventListener("click", (e) => {
  const link = e.target.closest("nav a");
  if (!link) return;

  e.preventDefault();
  const href = link.getAttribute("href");
  const content = document.querySelector(".page-content");
  if (!content || content.classList.contains("fade-out")) return;

  content.classList.add("fade-out");
  content.classList.remove("show");

  setTimeout(() => {
    window.location.href = href;
  }, 1000);
});

// FADE IN — after full page load (no flash, perfect with custom fonts)
window.addEventListener("load", () => {
  const content = document.querySelector(".page-content");
  if (!content) return;

  // Tiny delay ensures fonts are ready → zero FOUC
  setTimeout(() => {
    window.scrollTo(0, 0); // ← ensures 0,0 even if browser tried to restore
    content.classList.add("fade-in", "show");
  }, 60);
});

/* =========================================================
   NAV STATE + LIME BAR + SMOOTH OPACITY + STICKY HOVER
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  const lime = nav?.querySelector(".lime");
  const links = nav?.querySelectorAll("nav a");

  if (!nav || !lime || links.length !== 3) return;

  const states = ["home", "about", "contact"];

  // Determine current page
  const currentIndex = location.pathname.includes("about.html") ? 1 :
                       location.pathname.includes("contact.html") ? 2 : 0;

  // Instant setup on load (no animation flash)
  nav.classList.add("instant");
  nav.classList.add(states[currentIndex]);
  lime.style.transform = `translateX(${currentIndex * 100}%)`;

  // Current page link starts fully opaque
  links[currentIndex].classList.add("sticky-hover");

  let sliderEnabled = true;

  /* ——— STICKY HOVER: stays opaque after hover ——— */
  links.forEach((link, i) => {
    link.addEventListener("mouseenter", () => {
      links.forEach(l => l.classList.remove("sticky-hover"));
      link.classList.add("sticky-hover");

      if (sliderEnabled) {
        lime.style.transform = `translateX(${i * 100}%)`;
      }
    });
  });

  nav.addEventListener("mouseleave", () => {
    if (sliderEnabled) {
      lime.style.transform = `translateX(${currentIndex * 100}%)`;
    }
  });

  /* ——— CLICK: prepare smooth transition ——— */
  links.forEach((link, i) => {
    link.addEventListener("click", () => {
      if (i === currentIndex) return;

      nav.classList.remove("instant");
      nav.classList.remove(...states);
      nav.classList.add(states[i]);
      lime.style.transform = `translateX(${i * 100}%)`;

      sliderEnabled = false;
      sessionStorage.setItem("navState", states[i]);
    });
  });

  // Re-enable transitions
  requestAnimationFrame(() => {
    nav.classList.remove("instant");
    nav.classList.add("show");
  });
});

/* =========================================================
   PERSIST NAV STATE (backup)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const saved = sessionStorage.getItem("navState");
  if (saved === "home" || saved === "about" || saved === "contact") {
    nav.classList.add(saved);
  }
});

/* =========================================================
   PROJECTS + SLIDER + INFO SYSTEM (UNCHANGED)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const projects = Array.from(document.querySelectorAll(".project"));
  const infoToggle = document.getElementById("info-toggle");
  const infoName = document.getElementById("info-name");
  const infoText = infoName?.querySelector(".info-text");
  const infoContainer = document.querySelector(".info-container");
  const homeText = document.getElementById("home-text");
  const homeSection = document.getElementById("home");
  let currentProject = null;

  /* ---------- CUSTOM CURSOR ---------- */
  const cursor = document.createElement("div");
  cursor.className = "custom-arrow-cursor";
  cursor.innerHTML = `<img src="right-arrow.png" alt="arrow" class="cursor-arrow">`;
  document.body.appendChild(cursor);

  const updateCursorPos = (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  };
  const showCursor = () => cursor.style.opacity = "1";
  const hideCursor = () => cursor.style.opacity = "0";

  /* ---------- OBSERVER ---------- */
  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.intersectionRatio >= 0.55) {
        currentProject = el;
        el.classList.add("in-view");
        if (!infoContainer.classList.contains("visible")) {
          infoContainer.classList.add("visible");
        }
        switch (el.id) {
          case "project1": infoText.textContent = "Animario"; break;
          case "project2": infoText.textContent = "Higher"; break;
          case "project3": infoText.textContent = "Animario"; break;
        }
      } else {
        el.classList.remove("in-view");
        if (currentProject === el) currentProject = null;
        if (!projects.some(p => p.classList.contains("in-view"))) {
          infoContainer.classList.remove("visible");
        }
      }
    });
  }, { threshold: [0, 0.25, 0.5, 0.55, 0.75, 1] });

  projects.forEach(p => projectObserver.observe(p));

  /* ---------- SLIDER ---------- */
  projects.forEach(project => {
    const slider = project.querySelector(".slider");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(".slide"));
    let currentIndex = 0;

    const dotsContainer = document.createElement("div");
    dotsContainer.className = "carousel-dots";

    slides.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = i;
        updateSlide();
      });
      dotsContainer.appendChild(dot);
    });
    slider.after(dotsContainer);

    function updateSlide() {
      slides.forEach((s, idx) => s.classList.toggle("active", idx === currentIndex));
      dotsContainer.querySelectorAll(".dot").forEach((d, idx) => d.classList.toggle("active", idx === currentIndex));
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlide();
    }

    project.addEventListener("click", (e) => {
      if (e.target.closest(".carousel-dots") || project.classList.contains("show-info")) return;
      nextSlide();
    });

    slider.addEventListener("mouseenter", (e) => {
      if (project.classList.contains("show-info")) return;
      updateCursorPos(e);
      showCursor();
    });

    slider.addEventListener("mousemove", (e) => {
      if (project.classList.contains("show-info")) { hideCursor(); return; }
      updateCursorPos(e);
      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      cursor.classList.toggle("left", x <= rect.width / 2);
      cursor.classList.toggle("right", x > rect.width / 2);
    });

    slider.addEventListener("mouseleave", hideCursor);
    updateSlide();
  });

  /* ---------- INFO TOGGLE ---------- */
  if (infoToggle && infoName && infoText) {
    infoToggle.addEventListener("click", () => {
      if (!currentProject) return;
      const open = currentProject.classList.toggle("show-info");
      infoToggle.classList.toggle("hide-mode", open);
      infoName.classList.toggle("open", open);
      infoContainer.classList.toggle("info-open", open);
      document.body.style.overflowY = open ? "hidden" : "scroll";
      hideCursor();
      if (!open) {
        currentProject.classList.add("closing-info");
        setTimeout(() => currentProject.classList.remove("closing-info"), 620);
      }
    });

    infoToggle.addEventListener("mouseenter", () => infoName.classList.add("hovered"));
    infoToggle.addEventListener("mouseleave", () => infoName.classList.remove("hovered"));
  }

  /* ---------- HOME TEXT SCROLL FADE ---------- */
  if (homeText && homeSection) {
    const animate = () => {
      const rect = homeSection.getBoundingClientRect();
      const scrollPast = Math.max(-rect.top, 0);
      const progress = 1 - scrollPast / rect.height;
      const opacity = Math.max(progress, 0);
      const scale = 0.05 + 0.95 * opacity;
      homeText.style.opacity = opacity;
      homeText.style.transform = `scale(${scale})`;
      homeText.style.zIndex = opacity < 1 ? 0 : 1000;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
});

/* =========================================================
   MARQUEE DUPLICATION
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".marquee-single").forEach(marquee => {
    const track = marquee.querySelector(".track");
    const clone = track.cloneNode(true);
    marquee.appendChild(clone);
    void marquee.offsetHeight;
  });
});

/* =========================================================
   FINAL — BULLETPROOF PAGE FADE + NAV SYSTEM (2025)
   ========================================================= */

// FADE OUT — works on ALL nav links
document.addEventListener("click", (e) => {
  const link = e.target.closest("nav a");
  if (!link) return;

  e.preventDefault();
  const href = link.getAttribute("href");
  const content = document.querySelector(".page-content");
  if (!content || content.classList.contains("fade-out")) return;

  content.classList.add("fade-out");
  content.classList.remove("show");

  setTimeout(() => window.location.href = href, 1000);
});

// FADE IN — perfect, no flash
window.addEventListener("load", () => {
  const content = document.querySelector(".page-content");
  if (content) {
    setTimeout(() => content.classList.add("fade-in", "show"), 60);
  }
});

/* =========================================================
   NAV + LIME + OPACITY — FINAL FIXED VERSION (NO STICKY FOREVER)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  const lime = nav?.querySelector(".lime");
  const links = nav?.querySelectorAll("nav a");
  if (!nav || !lime || links.length !== 3) return;

  const states = ["home", "about", "contact"];
  const currentIndex = location.pathname.includes("about.html") ? 1 :
                       location.pathname.includes("contact.html") ? 2 : 0;

  let targetState = sessionStorage.getItem("navTarget");
  let currentStateIndex = targetState ? states.indexOf(targetState) : currentIndex;

  // === 1. INITIAL STATE (instant, no flash) ===
  nav.className = ""; // reset
  nav.classList.add("instant", states[currentStateIndex], "show");
  lime.style.transform = `translateX(${currentStateIndex * 100}%)`;
  links[currentStateIndex].classList.add("sticky-hover");

  // === 2. HOVER BEHAVIOR ===
  links.forEach((link, i) => {
    link.addEventListener("mouseenter", () => {
      // Remove sticky from all, apply to hovered
      links.forEach(l => l.classList.remove("sticky-hover"));
      link.classList.add("sticky-hover");

      // Move lime preview
      lime.style.transform = `translateX(${i * 100}%)`;
    });

    link.addEventListener("click", () => {
      if (i === currentIndex) return;

      sessionStorage.setItem("navTarget", states[i]);
      currentStateIndex = i;

      // Apply final state immediately for next page
      nav.classList.remove(...states);
      nav.classList.add(states[i]);
    });
  });

  // === 3. MOUSE LEAVE NAV → SNAP BACK TO CURRENT PAGE ===
  nav.addEventListener("mouseleave", () => {
    links.forEach(l => l.classList.remove("sticky-hover"));
    links[currentStateIndex].classList.add("sticky-hover");
    lime.style.transform = `translateX(${currentStateIndex * 100}%)`;
  });

  // === 4. Enable transitions after setup ===
  requestAnimationFrame(() => {
    nav.classList.remove("instant");
  });

  // Cleanup
  sessionStorage.removeItem("navTarget");
});