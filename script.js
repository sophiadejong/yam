document.addEventListener("DOMContentLoaded", () => {
  const projects = Array.from(document.querySelectorAll(".project"));
  const infoToggle = document.getElementById("info-toggle");
  const infoName = document.getElementById("info-name");
  const infoText = infoName?.querySelector(".info-text");
  const infoContainer = document.querySelector(".info-container");
  const homeText = document.getElementById("home-text");
  const homeSection = document.getElementById("home");
  let currentProject = null;

  // Global mouse X – updated on any mousemove
  let globalMouseX = 0;
  document.addEventListener("mousemove", (e) => {
    globalMouseX = e.clientX;
  });

  /* ---------- IntersectionObserver for projects ---------- */
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
  }, { root: null, threshold: [0, 0.25, 0.5, 0.55, 0.75, 1] });

  projects.forEach(p => projectObserver.observe(p));

  /* ---------- Carousel arrows + dots ---------- */
  projects.forEach(project => {
    const track = project.querySelector(".carousel-track");
    if (!track) return;
    const images = Array.from(track.children);
    let currentIndex = 0;
    const carouselEl = project.querySelector(".carousel");

    // ---- Create dots ----
    const dotsContainer = document.createElement("div");
    dotsContainer.className = "carousel-dots";
    images.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = i;
        updateSlide();
      });
      dotsContainer.appendChild(dot);
    });
    if (carouselEl) carouselEl.after(dotsContainer);

    // ---- Update slide function ----
    function updateSlide() {
      const slideWidth = carouselEl.clientWidth;
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      const dots = dotsContainer.querySelectorAll(".dot");
      dots.forEach((d, idx) => d.classList.toggle("active", idx === currentIndex));
    }

    // ---- Helper: generate arrow cursor based on position ----
    const generateCursor = (isRight) => {
      const arrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3C3C3C" width="48" height="48"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>`.trim();
      const transform = isRight ? '' : 'rotate(180 32 32)';
      const svgCursor = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><g transform="${transform}">${arrowSvg}</g></svg>`.trim();
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svgCursor)}") 32 32, auto`;
    };

    // ---- State tracking ----
    let lastCursor = null;
    let rafId = null;

    const updateCursor = () => {
      if (project.classList.contains("show-info")) {
        if (lastCursor !== "default") {
          project.style.cursor = "default";
          lastCursor = "default";
        }
        return;
      }

      const rect = project.getBoundingClientRect();
      const x = globalMouseX - rect.left;
      const isRight = x > rect.width / 2;
      const newCursor = generateCursor(isRight);

      if (lastCursor !== newCursor) {
        project.style.cursor = newCursor;
        lastCursor = newCursor;
      }
    };

    const startCursorLoop = () => {
      if (rafId) return;
      const loop = () => {
        updateCursor();
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    };

    const stopCursorLoop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastCursor = null;
    };

    // ---- Events ----
    project.addEventListener("mouseenter", () => {
      if (!project.classList.contains("show-info")) {
        startCursorLoop();
      }
    });

    project.addEventListener("mouseleave", () => {
      stopCursorLoop();
      project.style.cursor = "auto";
    });

    project.addEventListener("mousemove", () => {
      if (!project.classList.contains("show-info") && !rafId) {
        updateCursor();
      }
    });

    // ---- Click arrows (DISABLED when info is open) ----
    project.addEventListener("click", (e) => {
      if (project.classList.contains("show-info")) return;

      const rect = project.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x > rect.width / 2) currentIndex = (currentIndex + 1) % images.length;
      else currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateSlide();
    });

    // ---- Handle resize ----
    window.addEventListener("resize", updateSlide);

    // ---- Preload images ----
    let loaded = 0;
    if (images.length === 0) updateSlide();
    images.forEach(img => {
      if (img.complete) {
        loaded++;
        if (loaded === images.length) updateSlide();
      } else {
        img.addEventListener("load", () => {
          loaded++;
          if (loaded === images.length) updateSlide();
        });
      }
    });
  });

  /* ---------- Info toggle behavior ---------- */
  if (infoToggle && infoName && infoText) {
    infoToggle.addEventListener("click", () => {
      if (!currentProject) return;
      const isOpen = currentProject.classList.toggle("show-info");
      infoToggle.classList.toggle("hide-mode", isOpen);
      infoName.classList.toggle("open", isOpen);
      document.body.style.overflowY = isOpen ? "hidden" : "scroll";

      // ADD CLASS TO CONTAINER TO CONTROL HOVER BEHAVIOR
      infoContainer.classList.toggle("info-open", isOpen);

      if (isOpen) {
        currentProject.style.cursor = "default";
        infoName.classList.remove("hovered");
      } else {
        // Force immediate correct cursor on close
        const rect = currentProject.getBoundingClientRect();
        const x = globalMouseX - rect.left;
        const isRight = x > rect.width / 2;
        const cursor = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><g transform="${isRight ? '' : 'rotate(180 32 32)'}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3C3C3C" width="48" height="48"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></g></svg>`;
        currentProject.style.cursor = `url("data:image/svg+xml;utf8,${encodeURIComponent(cursor)}") 32 32, auto`;
      }
    });

    infoToggle.addEventListener("mouseenter", () => {
      if (!infoName.classList.contains("open")) infoName.classList.add("hovered");
    });
    infoToggle.addEventListener("mouseleave", () => {
      if (!infoName.classList.contains("open")) infoName.classList.remove("hovered");
    });
    infoName.addEventListener("mouseenter", () => {
      if (infoName.classList.contains("open")) infoName.classList.remove("hovered");
    });
  }

  /* ---------- Smooth home-text fade + scale behind first project ---------- */
  if (homeText && homeSection) {
    const fadeHomeText = () => {
      const rect = homeSection.getBoundingClientRect();
      const scrollPast = Math.max(-rect.top, 0);
      const homeHeight = rect.height;

      const progress = 1 - scrollPast / homeHeight;
      const opacity = Math.max(progress, 0);
      const scale = 0.05 + 0.95 * opacity;

      homeText.style.opacity = opacity;
      homeText.style.transform = `scale(${scale})`;
      homeText.style.zIndex = opacity < 1 ? 0 : 1000;

      requestAnimationFrame(fadeHomeText);
    };
    requestAnimationFrame(fadeHomeText);
  }
});