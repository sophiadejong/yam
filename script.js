/* =========================================================
   PAGE-CONTENT FADE ONLY (NO OTHER FADES ANYWHERE)
   ========================================================= */
/* FADE OUT ON NAV CLICK (runs on DOMContentLoaded) */
document.addEventListener("DOMContentLoaded", () => {
  const content = document.querySelector(".page-content");
  if (!content) return;

  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");

      content.classList.remove("show");
      content.classList.add("fade-out");

      setTimeout(() => {
        window.location.href = href;
      }, 1000);
    });
  });
});

/* FADE IN ON PAGE LOAD — only after EVERYTHING is fully loaded */
window.onload = () => {
  const content = document.querySelector(".page-content");
  if (!content) return;

  content.classList.add("fade-in");

  requestAnimationFrame(() => {
    content.classList.add("show");
  });
};

/* =========================================================
   NAV STATE + LIME BAR (NO FADING EVER)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  const lime = nav.querySelector(".lime");
  const links = nav.querySelectorAll("nav a");

  if (!nav || !lime || links.length !== 3) return;

  const states = ["home", "about", "contact"];

  // Determine current page index
  const current = location.pathname.includes("about")
    ? 1
    : location.pathname.includes("contact")
    ? 2
    : 0;

  // Set instantly without animation
  nav.classList.add("instant");
  nav.classList.add(states[current]);
  lime.style.transform = `translateX(${current * 100}%)`;

  let sliderEnabled = true;

  // Hover slide
  links.forEach((link, i) => {
    link.addEventListener("mouseenter", () => {
      if (sliderEnabled) lime.style.transform = `translateX(${i * 100}%)`;
    });
  });

  // Reset on leave
  nav.addEventListener("mouseleave", () => {
    if (sliderEnabled) lime.style.transform = `translateX(${current * 100}%)`;
  });

  // Freeze on click
  links.forEach((link, i) => {
    link.addEventListener("click", () => {
      sliderEnabled = false;
      lime.style.transform = `translateX(${i * 100}%)`;

      nav.classList.remove("home", "about", "contact");
      nav.classList.add(states[i]);
    });
  });

  requestAnimationFrame(() => {
    nav.classList.remove("instant");
    nav.classList.add("show");
  });
});


/* =========================================================
   NAV STATE SAVE THROUGH NAVIGATION (NO FADES)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");

  const setNavState = (state) => {
    nav.classList.remove("home", "about", "contact");
    if (state) nav.classList.add(state);
  };

  let state = "home";
  const path = location.pathname;

  if (path.includes("about")) state = "about";
  if (path.includes("contact")) state = "contact";

  const saved = sessionStorage.getItem("navState");
  if (saved) state = saved;

  setNavState(state);

  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");

      sessionStorage.setItem(
        "navState",
        href.includes("about") ? "about" :
        href.includes("contact") ? "contact" :
        "home"
      );
    });
  });
});


/* =========================================================
   PROJECTS + SLIDER + INFO SYSTEM
   (UNTOUCHED — NO FADES ADDED)
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

  let globalMouseX = 0;
  document.addEventListener("mousemove", (e) => { globalMouseX = e.clientX; });

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

        const anyVisible = projects.some(p => p.classList.contains("in-view"));
        if (!anyVisible) infoContainer.classList.remove("visible");
      }
    });
  }, { threshold: [0,0.25,0.5,0.55,0.75,1] });

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
      slides.forEach((s, idx) =>
        s.classList.toggle("active", idx === currentIndex)
      );

      dotsContainer.querySelectorAll(".dot").forEach((d, idx) =>
        d.classList.toggle("active", idx === currentIndex)
      );
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlide();
    }

    project.addEventListener("click", (e) => {
      if (e.target.closest(".carousel-dots")) return;
      if (project.classList.contains("show-info")) return;
      nextSlide();
    });

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

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".marquee").forEach(marquee => {
    const track = marquee.querySelector(".track");

    const gap = parseInt(getComputedStyle(marquee).getPropertyValue("--gap")) || 0;

    // real width of the row
    const trackWidth = track.scrollWidth;

    // pass width to CSS
    marquee.style.setProperty("--track-width", (trackWidth + gap) + "px");

    // duplicate
    const clone = track.cloneNode(true);
    clone.classList.add("clone");

    clone.style.position = "absolute";
    clone.style.left = (trackWidth + gap) + "px";

    marquee.appendChild(clone);
  });
});



