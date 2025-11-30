/* =========================================================
   DYNAMIC VH FIX + MOBILE RE-SNAP ON RESIZE
   ========================================================= */
(function () {
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  window.addEventListener('load', setVH);
  window.addEventListener('resize', setVH);
  setVH();
})();

/* Optional: re-snap to current project when viewport resizes */
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const current = document.querySelector('.project.in-view');
    if (current) {
      current.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
    }
  }, 150);
});

/* =========================================================
   PAGE FADE IN / OUT
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
   NAV STATE + LIME BAR
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

  requestAnimationFrame(() => nav.classList.remove("instant"));
  sessionStorage.removeItem("navTarget");
});

/* =========================================================
   PROJECTS + SLIDER + INFO SYSTEM
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const projects = Array.from(document.querySelectorAll(".project"));
  const infoToggle = document.getElementById("info-toggle");
  const infoName = document.getElementById("info-name");
  const infoText = infoName?.querySelector(".info-text");
  const infoContainer = document.querySelector(".info-container");

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

  /* =========================================================
     INFO TOGGLE — FIXED VERSION (FREEZES ONLY WRAPPER)
     ========================================================= */
  const wrapper = document.getElementById("page-wrapper");
  let lockedScrollY = 0;

  if (infoToggle && infoName && infoText) {
    infoToggle.addEventListener("click", () => {
      if (!currentProject) return;

      const open = currentProject.classList.toggle("show-info");
      infoToggle.classList.toggle("hide-mode", open);
      infoName.classList.toggle("open", open);
      infoContainer.classList.toggle("info-open", open);

      document.body.classList.toggle("info-open", open);

      if (open) {
        lockedScrollY = window.scrollY;

        wrapper.style.position = "fixed";
        wrapper.style.top = `-${lockedScrollY}px`;
        wrapper.style.left = "0";
        wrapper.style.right = "0";
      } else {
        wrapper.style.position = "";
        wrapper.style.top = "";
        wrapper.style.left = "";
        wrapper.style.right = "";

        window.scrollTo({ top: lockedScrollY, behavior: "instant" });

        currentProject.classList.add("closing-info");
        setTimeout(() => currentProject.classList.remove("closing-info"), 620);
      }

      hideCursor();
    });

    infoToggle.addEventListener("mouseenter", () => infoName.classList.add("hovered"));
    infoToggle.addEventListener("mouseleave", () => infoName.classList.remove("hovered"));
  }

  /* ---------- HOME TEXT SCROLL FADE ---------- */
  const homeText = document.getElementById("home-text");
  if (homeText) {
    const fadeHeight = window.innerHeight * 0.3;
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      let opacity = 1 - scrollY / fadeHeight;
      opacity = Math.max(0, Math.min(1, opacity));
      homeText.style.opacity = opacity;
    });
  }
});

/* =========================================================
   OVAL CHAOS ANIMATION
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const oval = document.querySelector(".oval-container");
  const home = document.getElementById("home");
  const projectsSection = document.getElementById("projects");
  if (!oval || !home || !projectsSection) return;

  const imgs = oval.querySelectorAll("img");

  imgs.forEach(img => {
    const orig = getComputedStyle(img).transform;
    img.dataset.base = orig === "none" ? "translate(-50%, 0%)" : orig;

    const angle = Math.random() * Math.PI * 2;
    const force = 180 + Math.random() * 300;
    img.dataset.x = Math.cos(angle) * force;
    img.dataset.y = Math.sin(angle) * force;
    img.dataset.speed = 0.5 + Math.random() * 2.4;
    img.dataset.scale = Math.random() < 0.3 
      ? 5 + Math.random() * 10 
      : 0.2 + Math.random() * 2;
  });

  const tick = () => {
    const homeRect = home.getBoundingClientRect();
    const projectsRect = projectsSection.getBoundingClientRect();

    const scrolledFromHome = Math.max(0, -homeRect.top);
    const explosionProgress = Math.min(scrolledFromHome / (innerHeight * 0.6), 1);

    const scrolledIntoProjects = Math.max(0, window.innerHeight - projectsRect.top);
    const percentIntoProjects = scrolledIntoProjects / (projectsRect.height + window.innerHeight);
    const isPast15PercentIntoProjects = percentIntoProjects >= 0.15;

    oval.style.opacity = isPast15PercentIntoProjects ? "0" : "1";
    oval.style.pointerEvents = isPast15PercentIntoProjects ? "none" : "auto";
    oval.classList.toggle("flying", explosionProgress > 0.001);

    if (!isPast15PercentIntoProjects) {
      imgs.forEach(img => {
        const base = img.dataset.base;
        const x = parseFloat(img.dataset.x);
        const y = parseFloat(img.dataset.y);
        const speed = parseFloat(img.dataset.speed);
        const scale = parseFloat(img.dataset.scale);

        let p = explosionProgress * speed / 2;
        p = Math.min(p, 1);

        const ease = p < 0.5 
          ? 4 * p * p * p 
          : 1 - Math.pow(-2 * p + 2, 3) / 2;

        img.style.transform = `
          ${base}
          translate(${x * ease}vw, ${y * ease}vh)
          scale(${1 + (scale - 1) * ease})
        `;
      });
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
});
