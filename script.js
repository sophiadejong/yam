document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");

  /* ========== SMOOTH FADE NAV HIGHLIGHT ========== */
  const setNavState = (state) => {
    nav.classList.remove("home", "about", "contact");
    if (state) nav.classList.add(state);
  };

  // Determine current page
  const path = location.pathname;
  let currentState = "home";
  if (path.includes("about.html")) currentState = "about";
  else if (path.includes("contact.html")) currentState = "contact";

  // Apply saved state from previous navigation (for perfect fade)
  const saved = sessionStorage.getItem("navState");
  if (saved && ["home", "about", "contact"].includes(saved)) {
    currentState = saved;
  }

  setNavState(currentState);

  // Save next state when clicking any nav link
  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");
      if (href.includes("about.html")) sessionStorage.setItem("navState", "about");
      else if (href.includes("contact.html")) sessionStorage.setItem("navState", "contact");
      else sessionStorage.setItem("navState", "home");
    });
  });

  /* ========== YOUR ORIGINAL CODE (100% UNCHANGED) ========== */
  const projects = Array.from(document.querySelectorAll(".project"));
  const infoToggle = document.getElementById("info-toggle");
  const infoName = document.getElementById("info-name");
  const infoText = infoName?.querySelector(".info-text");
  const infoContainer = document.querySelector(".info-container");
  const homeText = document.getElementById("home-text");
  const homeSection = document.getElementById("home");
  let currentProject = null;

  let globalMouseX = 0;
  document.addEventListener("mousemove", (e) => { globalMouseX = e.clientX; });

  /* ---------- Project in-view detection ---------- */
  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.intersectionRatio >= 0.55) {
        currentProject = el;
        el.classList.add("in-view");
        if (!infoContainer.classList.contains("visible")) infoContainer.classList.add("visible");

        switch (el.id) {
          case "project1": infoText.textContent = "Animario"; break;
          case "project2": infoText.textContent = "Higher"; break;
          case "project3": infoText.textContent = "Animario"; break;
        }
      } else {
        el.classList.remove("in-view");
        if (currentProject === el) currentProject = null;
        const anyVisible = projects.some(p => p.classList.contains("in-view"));
        if (!anyVisible) infoContainer.classList.remove("visible");
      }
    });
  }, { threshold: [0, 0.25, 0.5, 0.55, 0.75, 1] });

  projects.forEach(p => projectObserver.observe(p));

  /* ---------- Manual Slider + Dots (NO AUTOPLAY) ---------- */
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
      dot.addEventListener("click", () => {
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
      if (project.classList.contains("show-info")) return;
      if (e.target.closest(".carousel-dots")) return;
      nextSlide();
    });

    // Custom left/right arrow cursor
    let lastCursor = null;
    let rafId = null;

    const generateCursor = (isRight) => {
      const arrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3C3C3C" width="32" height="32"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>`;
      const transform = isRight ? '' : 'rotate(180 12 12)';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><g transform="${transform}">${arrowSvg}</g></svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 20 20, auto`;
    };

    const updateCursor = () => {
      if (project.classList.contains("show-info")) {
        project.style.cursor = "default";
        return;
      }
      const rect = project.getBoundingClientRect();
      const x = globalMouseX - rect.left;
      const newCursor = generateCursor(x > rect.width / 2);
      if (lastCursor !== newCursor) {
        project.style.cursor = newCursor;
        lastCursor = newCursor;
      }
    };

    project.addEventListener("mouseenter", () => {
      if (!project.classList.contains("show-info")) {
        const loop = () => { updateCursor(); rafId = requestAnimationFrame(loop); };
        rafId = requestAnimationFrame(loop);
      }
    });

    project.addEventListener("mouseleave", () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      project.style.cursor = "auto";
    });

    updateSlide();
  });

  /* ---------- INFO TOGGLE ---------- */
  if (infoToggle && infoName && infoText) {
    infoToggle.addEventListener("click", () => {
      if (!currentProject) return;

      const isOpen = currentProject.classList.toggle("show-info");
      infoToggle.classList.toggle("hide-mode", isOpen);
      infoName.classList.toggle("open", isOpen);
      document.body.style.overflowY = isOpen ? "hidden" : "scroll";
      infoContainer.classList.toggle("info-open", isOpen);

      if (!isOpen) {
        currentProject.classList.add("closing-info");
        setTimeout(() => currentProject.classList.remove("closing-info"), 620);
      }

      if (!isOpen) {
        const rect = currentProject.getBoundingClientRect();
        const x = globalMouseX - rect.left;
        currentProject.style.cursor = generateCursor(x > rect.width / 2);
      }
    });

    infoToggle.addEventListener("mouseenter", () => {
      infoName.classList.add("hovered");
    });
    infoToggle.addEventListener("mouseleave", () => {
      infoName.classList.remove("hovered");
    });
  }

  /* ---------- Home text fade & scale ---------- */
  if (homeText && homeSection) {
    const fade = () => {
      const rect = homeSection.getBoundingClientRect();
      const scrollPast = Math.max(-rect.top, 0);
      const progress = 1 - scrollPast / rect.height;
      const opacity = Math.max(progress, 0);
      const scale = 0.05 + 0.95 * opacity;

      homeText.style.opacity = opacity;
      homeText.style.transform = `scale(${scale})`;
      homeText.style.zIndex = opacity < 1 ? 0 : 1000;
      requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
  }
});