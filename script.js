document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  const content = document.querySelector(".page-content");

  /* ========== NAV STATE & LIME HIGHLIGHT ========== */
  const setNavState = (state) => {
    nav.classList.remove("home", "about", "contact");
    if (state) nav.classList.add(state);
  };

  const path = location.pathname;
  let currentState = "home";
  if (path.includes("about.html")) currentState = "about";
  else if (path.includes("contact.html")) currentState = "contact";

  const saved = sessionStorage.getItem("navState");
  if (saved && ["home", "about", "contact"].includes(saved)) currentState = saved;
  setNavState(currentState);

  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");
      sessionStorage.setItem("navState",
        href.includes("about.html") ? "about" :
        href.includes("contact.html") ? "contact" : "home"
      );
    });
  });

  /* ========== PROJECTS LOGIC ========== */
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

  /* ---------- CUSTOM CURSOR (ONLY on slider) ---------- */
  const cursor = document.createElement("div");
  cursor.className = "custom-arrow-cursor";
cursor.innerHTML = `
  <img src="right-arrow.png" alt="arrow" class="cursor-arrow">
`;

  document.body.appendChild(cursor);

  const updateCursorPos = (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  };
  const showCursor = () => cursor.style.opacity = "1";
  const hideCursor = () => cursor.style.opacity = "0";

  /* ---------- INTERSECTION OBSERVER ---------- */
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

  /* ---------- SLIDER + DOTS + CURSOR ---------- */
  projects.forEach(project => {
    const slider = project.querySelector(".slider");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(".slide"));
    let currentIndex = 0;

    // Dots
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

    // Click → next slide
    project.addEventListener("click", (e) => {
      if (project.classList.contains("show-info")) return;
      if (e.target.closest(".carousel-dots")) return;
      nextSlide();
    });

    /* ---------- CURSOR ONLY ON SLIDER ---------- */

    // Prevent cursor from showing on project background
    project.addEventListener("mouseenter", hideCursor);

    slider.addEventListener("mouseenter", (e) => {
      if (project.classList.contains("show-info")) return;
      updateCursorPos(e);
      showCursor();
    });

    slider.addEventListener("mousemove", (e) => {
      if (project.classList.contains("show-info")) {
        hideCursor();
        return;
      }

      updateCursorPos(e);

      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;

      const isRight = x > rect.width / 2;
      cursor.classList.toggle("left", !isRight);
      cursor.classList.toggle("right", isRight);
    });

    slider.addEventListener("mouseleave", () => hideCursor());

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
      hideCursor(); // always hide cursor when opening info

      if (!isOpen) {
        currentProject.classList.add("closing-info");
        setTimeout(() => currentProject.classList.remove("closing-info"), 620);
      }
    });

    infoToggle.addEventListener("mouseenter", () => infoName.classList.add("hovered"));
    infoToggle.addEventListener("mouseleave", () => infoName.classList.remove("hovered"));
  }

  /* ---------- HOME TEXT FADE ON SCROLL ---------- */
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
