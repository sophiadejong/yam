/* =========================================================
   PAGE FADE IN / OUT — SINGLE, BULLETPROOF SYSTEM (FIXED)
   ========================================================= */

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

window.addEventListener("load", () => {
  const content = document.querySelector(".page-content");
  if (!content) return;

  setTimeout(() => {
    window.scrollTo(0, 0);
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

  const currentIndex = location.pathname.includes("about.html") ? 1 :
                       location.pathname.includes("contact.html") ? 2 : 0;

  nav.classList.add("instant");
  nav.classList.add(states[currentIndex]);
  lime.style.transform = `translateX(${currentIndex * 100}%)`;

  links[currentIndex].classList.add("sticky-hover");

  let sliderEnabled = true;

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

window.addEventListener("load", () => {
  const content = document.querySelector(".page-content");
  if (content) {
    setTimeout(() => content.classList.add("fade-in", "show"), 60);
  }
});

/* =========================================================
   NAV + LIME + OPACITY — FINAL FIXED VERSION
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

  nav.className = "";
  nav.classList.add("instant", states[currentStateIndex], "show");
  lime.style.transform = `translateX(${currentStateIndex * 100}%)`;
  links[currentStateIndex].classList.add("sticky-hover");

  links.forEach((link, i) => {
    link.addEventListener("mouseenter", () => {
      links.forEach(l => l.classList.remove("sticky-hover"));
      link.classList.add("sticky-hover");
      lime.style.transform = `translateX(${i * 100}%)`;
    });

    link.addEventListener("click", () => {
      if (i === currentIndex) return;

      sessionStorage.setItem("navTarget", states[i]);
      currentStateIndex = i;

      nav.classList.remove(...states);
      nav.classList.add(states[i]);
    });
  });

  nav.addEventListener("mouseleave", () => {
    links.forEach(l => l.classList.remove("sticky-hover"));
    links[currentStateIndex].classList.add("sticky-hover");
    lime.style.transform = `translateX(${currentStateIndex * 100}%)`;
  });

  requestAnimationFrame(() => {
    nav.classList.remove("instant");
  });

  sessionStorage.removeItem("navTarget");
});

/* =========================================================
   OVAL IMAGES — FLY STRAIGHT UP ON SCROLL — 3× SLOWER FROM THE START
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const oval = document.querySelector(".oval-container");
  const home = document.getElementById("home");
  if (!oval || !home) return;

  const imgs = oval.querySelectorAll("img");

  // 1. Random speed & final scale for each image
  imgs.forEach(img => {
    img.dataset.speed = 0.7 + Math.random() * 1.6;
    img.dataset.scale = 0.05 + Math.random() * 3.7;
  });

  // 2. Capture original CSS transforms once
  const originalTransforms = [];
  requestAnimationFrame(() => {
    imgs.forEach((img, i) => {
      const matrix = getComputedStyle(img).transform;
      if (matrix && matrix !== "none") {
        const values = matrix.split("(")[1].split(")")[0].split(",");
        originalTransforms[i] = `translate(${values[4]}px, ${values[5]}px)`;
      } else {
        originalTransforms[i] = "translate(0px, 0px)";
      }
    });
  });

  // 3. Main animation loop — 3× SLOWER
  const update = () => {
    const homeRect = home.getBoundingClientRect();
    const scrolled = Math.max(0, -homeRect.top);
    const maxScroll = innerHeight * 0.9;

    // ← THIS IS THE KEY CHANGE: divide by 3 → 3× slower progression
    const progress = Math.min(scrolled / maxScroll / 3, 1);

    // Lower threshold so the "flying" class still activates early
    if (progress > 0.006) oval.classList.add("flying");
    else oval.classList.remove("flying");

    imgs.forEach((img, i) => {
      const speed = parseFloat(img.dataset.speed);
      const finalScale = parseFloat(img.dataset.scale);

      // We multiply the individual speed back by ~3 so each image still feels unique
      let p = progress * speed * 3;
      p = Math.min(Math.max(p, 0), 1);

      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      const base = originalTransforms[i] || "translate(0px, 0px)";

      // Fly straight up (negative Y)
      const flyX = 0;
      const flyY = -ease * 180;        // same distance, just reached much slower
      const scale = 1 + (finalScale - 1) * ease;

      img.style.transform = `${base} translate(${flyX}vw, ${flyY}vh) scale(${scale})`;
      img.style.opacity = 1 - ease * 0.95;
      img.style.filter = `blur(${ease * 12}px)`;
    });

    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
});