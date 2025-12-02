/* =========================================================
   DYNAMIC VH FIX
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

window.addEventListener("load", () => {
  const content = document.querySelector(".page-content");
  if (!content) return;

  // Forzamos que el navegador calcule el layout real (con la altura completa de #home y los ovales)
  void content.offsetWidth;

  // Quitamos la clase en el siguiente frame → así el navegador ya ha medido todo correctamente
  requestAnimationFrame(() => {
    content.classList.remove("start-hidden");
  });
});


/* =========================================================
   PAGE FADE OUT — FINALLY FIXED & WORKING
   ========================================================= */
/* =========================================================
   SMOOTH PAGE FADE-OUT — no violence, just elegance
   ========================================================= */
document.addEventListener("click", (e) => {
  const link = e.target.closest("nav a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || link.href === location.href) return;
  e.preventDefault();

  const content = document.querySelector(".page-content");
  if (!content) return;

  // fade out
  content.classList.add("fade-out");

  setTimeout(() => {
    window.location.href = href;
  }, 1300); // slightly above 1.2s
});


/* =========================================================
   PAGE FADE IN — keep your original 1-second delay
   ========================================================= */
window.addEventListener("load", () => {
  const content = document.querySelector(".page-content");
  if (!content) return;

  // Force reflow + clean state
  void content.offsetWidth;
  content.classList.remove("fade-out");

setTimeout(() => {
  content.classList.add("fade-in");
}, 300);

});

/* =========================================================
   NAV STATE
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  const lime = nav?.querySelector(".lime");
  const links = nav?.querySelectorAll("nav a");
  if (!nav || !lime || links.length !== 3) return;

  const states = ["home", "about", "contact"];
  const currentIndex =
    location.pathname.includes("about") ? 1 :
    location.pathname.includes("contact") ? 2 : 0;

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
   PROJECTS + SLIDER + INFO
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("page-wrapper");
  const projects = Array.from(document.querySelectorAll(".project"));
  const infoToggle = document.getElementById("info-toggle");
  const infoName = document.getElementById("info-name");
  const infoText = infoName?.querySelector(".info-text");
  const infoContainer = document.querySelector(".info-container");
  let currentProject = null;

  /* ---------- CUSTOM CURSOR ---------- */
  const cursor = document.createElement("div");
  cursor.className = "custom-arrow-cursor";
  cursor.innerHTML = `<img src="right-arrow.png" class="cursor-arrow">`;
  document.body.appendChild(cursor);

  const updateCursorPos = (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  };
  const showCursor = () => cursor.style.opacity = "1";
  const hideCursor = () => cursor.style.opacity = "0";

  /* ---------- OBSERVER FOR PROJECT VIEW (NOW SYNCHRONIZED WITH OVALS) ---------- */
  const projectObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const el = entry.target;

        if (entry.isIntersecting) {
          el.classList.add("in-view");
          currentProject = el;

          infoContainer.classList.add("visible");

          switch (el.id) {
            case "project1": infoText.textContent = "Animario"; break;
            case "project2": infoText.textContent = "At.Par"; break;
            case "project3": infoText.textContent = "Creaxures"; break;
            case "project4": infoText.textContent = "Higher"; break;
            case "project5": infoText.textContent = "Monaileona"; break;
            case "project6": infoText.textContent = "Musa"; break;
            case "project7": infoText.textContent = "Smol Studios"; break;
            case "project8": infoText.textContent = "Split Hazard"; break;
          }
        } else {
          el.classList.remove("in-view");
          if (currentProject === el) currentProject = null;
        }
      });

      // Update info bar visibility
      const anyInView = projects.some(p => p.classList.contains("in-view"));
      infoContainer.classList.toggle("visible", anyInView);
    },
    {
      root: wrapper,
      rootMargin: "-45% 0px -45% 0px",  // Triggers early — syncs perfectly with oval hide
      threshold: 0
    }
  );

  projects.forEach(p => projectObserver.observe(p));

  /* ---------- SLIDER (IMAGES + VIDEOS) ---------- */
  projects.forEach(project => {
    const slider = project.querySelector(".slider");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(".slide"));
    let currentIndex = slides.findIndex(s => s.classList.contains("active"));
    if (currentIndex === -1) currentIndex = 0;

    const dots = document.createElement("div");
    dots.className = "carousel-dots";
    slides.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "dot" + (i === currentIndex ? " active" : "");
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = i;
        updateSlide();
      });
      dots.appendChild(dot);
    });
    slider.after(dots);

    function updateSlide() {
      slides.forEach((s, idx) => {
        const isActive = idx === currentIndex;
        s.classList.toggle("active", isActive);

        if (s.tagName === "VIDEO") {
          if (isActive) {
            s.currentTime = 0;
            s.play();
          } else {
            s.pause();
            s.currentTime = 0;
          }
        }
      });

      dots.querySelectorAll(".dot").forEach((d, idx) =>
        d.classList.toggle("active", idx === currentIndex)
      );
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlide();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlide();
    }

    project.addEventListener("click", (e) => {
      if (e.target.closest(".carousel-dots") || project.classList.contains("show-info")) return;

      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (x <= rect.width / 2) prevSlide();
      else nextSlide();
    });

    slider.addEventListener("mouseenter", (e) => {
      if (!project.classList.contains("show-info")) {
        updateCursorPos(e);
        showCursor();
      }
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
  let lockedScrollY = 0;
  const isTouch = matchMedia("(pointer: coarse)").matches;

  if (infoToggle && infoName && infoText) {
    infoToggle.addEventListener("click", () => {
      if (!currentProject) return;

      const open = currentProject.classList.toggle("show-info");

      infoToggle.classList.toggle("hide-mode", open);
      infoName.classList.toggle("open", open);
      infoContainer.classList.toggle("info-open", open);

      if (open) {
        lockedScrollY = wrapper.scrollTop;
        document.body.classList.add("no-scroll");
        wrapper.classList.add("freeze");
      } else {
        document.body.classList.remove("no-scroll");
        wrapper.classList.remove("freeze");
        wrapper.scrollTo({ top: lockedScrollY, behavior: "instant" });

        currentProject.classList.add("closing-info");
        setTimeout(() => currentProject.classList.remove("closing-info"), 620);
      }

      hideCursor();
    });

    if (!isTouch) {
      infoToggle.addEventListener("mouseenter", () => infoName.classList.add("hovered"));
      infoToggle.addEventListener("mouseleave", () => infoName.classList.remove("hovered"));
    }
  }

  /* ---------- HOME TEXT FADE ---------- */
  const homeText = document.getElementById("home-text");
  if (homeText) {
    const fadeHeight = window.innerHeight * 0.3;
    wrapper.addEventListener("scroll", () => {
      const y = wrapper.scrollTop;
      let opacity = 1 - y / fadeHeight;
      opacity = Math.max(0, Math.min(1, opacity));
      homeText.style.opacity = opacity;
    });
  }
});

/* =========================================================
   OVAL CHAOS — NOW PERFECTLY SYNCED WITH FIRST PROJECT
   ========================================================= */
// document.addEventListener("DOMContentLoaded", () => {
//   const oval = document.querySelector(".oval-container");
//   const home = document.getElementById("home");
//   const wrapper = document.getElementById("page-wrapper");
//   if (!oval || !home || !wrapper) return;

//   const imgs = oval.querySelectorAll("img");

//   imgs.forEach(img => {
//     img.dataset.base = "translate(-50%, -50%)";

//     const angle = Math.random() * Math.PI * 2;
//     const force = 180 + Math.random() * 300;

//     img.dataset.x = Math.cos(angle) * force;
//     img.dataset.y = Math.sin(angle) * force;
//     img.dataset.speed = 0.5 + Math.random() * 2.4;
//     img.dataset.scale = Math.random() < 0.3
//       ? 5 + Math.random() * 10
//       : 0.2 + Math.random() * 2;
//   });

//   const tick = () => {
//     const scrollY = wrapper.scrollTop;
//     const homeHeight = home.offsetHeight;

//     const triggerHideAt = homeHeight * 0.8;
//     const shouldHide = scrollY > triggerHideAt;

//     oval.style.opacity = shouldHide ? "0" : "1";
//     oval.style.pointerEvents = shouldHide ? "none" : "auto";

//     // ✅ CHAOS BEGINS AS SOON AS YOU SCROLL
//     const progress = Math.max(0, Math.min(1, scrollY / window.innerHeight));

//     if (!shouldHide && progress > 0.001) {
//       imgs.forEach(img => {
//         const x = parseFloat(img.dataset.x);
//         const y = parseFloat(img.dataset.y);
//         const speed = parseFloat(img.dataset.speed);
//         const scale = parseFloat(img.dataset.scale);

//         let t = Math.min(progress * speed * 0.6, 1);
//         const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

//         img.style.transform = `
//           ${img.dataset.base}
//           translate(${x * ease}vw, ${y * ease}vh)
//           scale(${1 + (scale - 1) * ease})
//         `;
//       });
//     } else if (!shouldHide) {
//       imgs.forEach(img => img.style.transform = img.dataset.base);
//     }

//     requestAnimationFrame(tick);
//   };

//   if (wrapper.scrollTop === 0) {
//     oval.style.opacity = "1";
//     oval.style.pointerEvents = "auto";
//     imgs.forEach(img => img.style.transform = img.dataset.base);
//   }

//   requestAnimationFrame(tick);
// });

// document.addEventListener("DOMContentLoaded", () => {
//   const oval = document.querySelector(".oval-container");
//   const home = document.getElementById("home");
//   const wrapper = document.getElementById("page-wrapper");
//   if (!oval || !home || !wrapper) return;

//   const imgs = oval.querySelectorAll("img");

//   imgs.forEach(img => {
//     img.dataset.base = "translate(-50%, -50%)";

//     const angle = Math.random() * Math.PI * 2;
//     const force = 180 + Math.random() * 300;

//     img.dataset.x = Math.cos(angle) * force;
//     img.dataset.y = Math.sin(angle) * force;
//     img.dataset.speed = 0.5 + Math.random() * 2.4;
//     img.dataset.scale =
//       Math.random() < 0.3 ? 5 + Math.random() * 10 : 0.2 + Math.random() * 2;
//   });

//   const tick = () => {
//     const scrollY = wrapper.scrollTop;
//     const homeHeight = home.offsetHeight;

//     // ----------------------------
//     // ⭐ NEW: SMOOTH 95% FADE LOGIC
//     // ----------------------------
//     const startFade = homeHeight * 0.95; // 95%
//     const endFade = homeHeight * 1.05;   // fully hidden shortly after

//     let opacity = 1;

//     if (scrollY >= startFade) {
//       opacity = 1 - (scrollY - startFade) / (endFade - startFade);
//       opacity = Math.max(0, Math.min(1, opacity));
//     }

//     oval.style.opacity = opacity.toFixed(3);
//     oval.style.pointerEvents = opacity <= 0 ? "none" : "auto";

//     // --------------------------------
//     // ORIGINAL CHAOS TRANSFORM HANDLING
//     // --------------------------------
//     const progress = Math.max(0, Math.min(1, scrollY / window.innerHeight));

//     if (opacity > 0 && progress > 0.001) {
//       imgs.forEach(img => {
//         const x = parseFloat(img.dataset.x);
//         const y = parseFloat(img.dataset.y);
//         const speed = parseFloat(img.dataset.speed);
//         const scale = parseFloat(img.dataset.scale);

//         let t = Math.min(progress * speed * 0.6, 1);
//         const ease =
//           t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

//         img.style.transform = `
//           ${img.dataset.base}
//           translate(${x * ease}vw, ${y * ease}vh)
//           scale(${1 + (scale - 1) * ease})
//         `;
//       });
//     } else if (opacity > 0) {
//       imgs.forEach(img => (img.style.transform = img.dataset.base));
//     }

//     requestAnimationFrame(tick);
//   };

//   if (wrapper.scrollTop === 0) {
//     oval.style.opacity = "1";
//     oval.style.pointerEvents = "auto";
//     imgs.forEach(img => (img.style.transform = img.dataset.base));
//   }

//   requestAnimationFrame(tick);
// });

document.addEventListener("DOMContentLoaded", () => {
  const oval = document.querySelector(".oval-container");
  const home = document.getElementById("home");
  const wrapper = document.getElementById("page-wrapper");
  if (!oval || !home || !wrapper) return;

  const imgs = oval.querySelectorAll("img");

  imgs.forEach(img => {
    img.dataset.base = "translate(-50%, -50%)";

    const angle = Math.random() * Math.PI * 2;
    const force = 200 + Math.random() * 300; // larger to ensure offscreen

    let x = Math.cos(angle) * force;
    let y = Math.sin(angle) * force;

    // ✅ Force downward images away from center toward corners
    if (y > 0) {
      x = x < 0 ? -force : force; // push fully left or right
      y = Math.abs(y) + force; // make sure it ends below viewport
    }

    img.dataset.x = x;
    img.dataset.y = y;
    img.dataset.speed = 0.5 + Math.random() * 2.4;
    img.dataset.scale =
      Math.random() < 0.3 ? 5 + Math.random() * 10 : 0.2 + Math.random() * 2;
  });

  const tick = () => {
    const scrollY = wrapper.scrollTop;
    const homeHeight = home.offsetHeight;

    // ----------------------------
    // ⭐ Smooth fade out at 95% scroll
    // ----------------------------
    const startFade = homeHeight * 0.80;
    const endFade = homeHeight * 0.90;

    let opacity = 1;
    if (scrollY >= startFade) {
      opacity = 1 - (scrollY - startFade) / (endFade - startFade);
      opacity = Math.max(0, Math.min(1, opacity));
    }

    oval.style.opacity = opacity.toFixed(3);
    oval.style.pointerEvents = opacity <= 0 ? "none" : "auto";

    // --------------------------------
    // ⭐ Chaos transform
    // --------------------------------
    const progress = Math.max(0, Math.min(1, scrollY / window.innerHeight));

    if (opacity > 0 && progress > 0.001) {
      imgs.forEach(img => {
        const x = parseFloat(img.dataset.x);
        const y = parseFloat(img.dataset.y);
        const speed = parseFloat(img.dataset.speed);
        const scale = parseFloat(img.dataset.scale);

        let t = Math.min(progress * speed * 0.6, 0.6);
        const ease =
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        img.style.transform = `
          ${img.dataset.base}
          translate(${x * ease}vw, ${y * ease}vh)
          scale(${1 + (scale - 1) * ease})
        `;
      });
    } else if (opacity > 0) {
      imgs.forEach(img => (img.style.transform = img.dataset.base));
    }

    requestAnimationFrame(tick);
  };

  if (wrapper.scrollTop === 0) {
    oval.style.opacity = "1";
    oval.style.pointerEvents = "auto";
    imgs.forEach(img => (img.style.transform = img.dataset.base));
  }

  requestAnimationFrame(tick);
});

