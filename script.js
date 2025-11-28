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
});

document.addEventListener("DOMContentLoaded", () => {
  const homeText = document.getElementById("home-text");
  if (!homeText) return;

  const fadeHeight = window.innerHeight * 0.3 // 60vh

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    // Compute opacity: 1 at top, 0 at fadeHeight
    let opacity = 1 - scrollY / fadeHeight;
    opacity = Math.max(0, Math.min(1, opacity)); // clamp between 0 and 1
    homeText.style.opacity = opacity;
  });
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



// /* FINAL — WORKS 100% WITH YOUR ORIGINAL CSS */
// document.addEventListener("DOMContentLoaded", () => {
//   const oval = document.querySelector(".oval-container");
//   const home = document.getElementById("home");
//   if (!oval || !home) return;

//   const imgs = oval.querySelectorAll("img");

//   imgs.forEach((img, index) => {
//     // Random speed & scale
//     img.dataset.speed = 0.8 + Math.random() * 1.2;
//     const big = Math.random() < 0.25;
//     img.dataset.scale = big ? 3 + Math.random() * 4 : 0.3 + Math.random() * 2;

//     // READ ORIGINAL left position from your CSS (this is the key!)
//     const leftValue = parseFloat(getComputedStyle(img).left);

//     // Decide where it flies OFF TO
//     let targetX = 0;
//     if (leftValue < 30)      targetX = -180;           // far left → HARD LEFT
//     else if (leftValue < 45) targetX = -110 - Math.random()*50;
//     else if (leftValue > 70) targetX = 180;            // far right → HARD RIGHT
//     else if (leftValue > 55) targetX = 110 + Math.random()*50;
//     else                     targetX = (Math.random()-0.5)*80; // center → slight drift

//     img.dataset.targetX = targetX;
//     img.dataset.targetY = -120 - Math.random()*120; // all go up
//   });

//   const tick = () => {
//     const scrolled = Math.max(0, -home.getBoundingClientRect().top);
//     const progress = Math.min(scrolled / (innerHeight * 0.9) / 8, 1);

//     oval.classList.toggle("flying", progress > 0.005);

//     imgs.forEach(img => {
//       const speed = parseFloat(img.dataset.speed);
//       const scale = parseFloat(img.dataset.scale);
//       const tx = parseFloat(img.dataset.targetX);
//       const ty = parseFloat(img.dataset.targetY);

//       let p = progress * speed * 10;
//       p = Math.min(p, 1);
//       const ease = p < 0.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2;

//       // THIS LINE PRESERVES YOUR ORIGINAL translate(-50%, …) FROM CSS
//       img.style.transform = `
//         translate(-50%, 0%)
//         translate(${tx * ease}vw, ${ty * ease}vh)
//         scale(${1 + (scale-1) * ease})
//       `;

//       // Optional fade-out (uncomment if you want)
//       // img.style.opacity = 1 - ease * 0.95;
//       // img.style.filter = `blur(${ease * 12}px)`;
//     });

//     requestAnimationFrame(tick);
//   };

//   requestAnimationFrame(tick);
// });
// document.addEventListener("DOMContentLoaded", () => {
//   const oval = document.querySelector(".oval-container");
//   const home = document.getElementById("home");
//   if (!oval || !home) return;

//   const imgs = oval.querySelectorAll("img");

//   imgs.forEach(img => {
//     // Random speed & scale (exactly like before)
//     img.dataset.speed = 0.7 + Math.random() * 1.6;
//     const biggerChance = Math.random() < 0.25;
//     const randomScale = 0.05 + Math.random() * 3.7;
//     img.dataset.scale = biggerChance ? randomScale * 1.5 : randomScale;

//     // NEW: Determine if image is on left, center, or right
//     const leftPos = parseFloat(img.style.left) || 50;
//     const distanceFromCenter = (leftPos - 50); // negative = left, positive = right

//     // Stronger side push the further from center
//     const sideStrength = Math.abs(distanceFromCenter) / 50; // 0 to ~1
//     const sideDirection = distanceFromCenter < 0 ? -1 : 1; // left = -1, right = +1

//     img.dataset.sidePush = (sideDirection * sideStrength * 80).toFixed(2); // max ±80vw
//   });

//   const originalTransforms = [];
//   requestAnimationFrame(() => {
//     imgs.forEach((img, i) => {
//       const matrix = getComputedStyle(img).transform;
//       if (matrix && matrix !== "none") {
//         const values = matrix.split("(")[1].split(")")[0].split(",");
//         originalTransforms[i] = `translate(${values[4]}px, ${values[5]}px)`;
//       } else {
//         originalTransforms[i] = "translate(0px, 0px)";
//       }
//     });
//   });

//   const update = () => {
//     const homeRect = home.getBoundingClientRect();
//     const scrolled = Math.max(0, -homeRect.top);
//     const maxScroll = innerHeight * 0.9;

//     const progress = Math.min(scrolled / maxScroll / 8, 1);

//     if (progress > 0.006) oval.classList.add("flying");
//     else oval.classList.remove("flying");

//     imgs.forEach(img => {
//       const speed = parseFloat(img.dataset.speed);
//       const finalScale = parseFloat(img.dataset.scale);
//       const sidePush = parseFloat(img.dataset.sidePush) || 0;

//       let p = progress * speed * 10;
//       p = Math.min(Math.max(p, 0), 1);

//       const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
//       const base = originalTransforms[Array.from(imgs).indexOf(img)] || "translate(0px, 0px)";

//       // Main upward fly + smart side drift
//       const flyX = ease * sidePush;           // left/right based on position
//       const flyY = -ease * 180;               // strong upward motion
//       const scale = 1 + (finalScale - 1) * ease;

//       img.style.transform = `${base} translate(${flyX}vw, ${flyY}vh) scale(${scale})`;
//     });

//     requestAnimationFrame(update);
//   };

//   requestAnimationFrame(update);
// });

// /* ======GOING UP EFFECT===================================================
// document.addEventListener("DOMContentLoaded", () => {
//   const oval = document.querySelector(".oval-container");
//   const home = document.getElementById("home");
//   if (!oval || !home) return;

//   const imgs = oval.querySelectorAll("img");

//   imgs.forEach(img => {
//     img.dataset.speed = 0.7 + Math.random() * 1.6;

//     const biggerChance = Math.random() < 0.25; 
//     const randomScale = 0.05 + Math.random() * 3.7;
//     img.dataset.scale = biggerChance ? randomScale * 1.5 : randomScale; 
//   });

//   const originalTransforms = [];
//   requestAnimationFrame(() => {
//     imgs.forEach((img, i) => {
//       const matrix = getComputedStyle(img).transform;
//       if (matrix && matrix !== "none") {
//         const values = matrix.split("(")[1].split(")")[0].split(",");
//         originalTransforms[i] = `translate(${values[4]}px, ${values[5]}px)`;
//       } else {
//         originalTransforms[i] = "translate(0px, 0px)";
//       }
//     });
//   });

//   const update = () => {
//     const homeRect = home.getBoundingClientRect();
//     const scrolled = Math.max(0, -homeRect.top);
//     const maxScroll = innerHeight * 0.9;

//     const progress = Math.min(scrolled / maxScroll / 8, 1);

//     if (progress > 0.006) oval.classList.add("flying");
//     else oval.classList.remove("flying");

//     imgs.forEach((img, i) => {
//       const speed = parseFloat(img.dataset.speed);
//       const finalScale = parseFloat(img.dataset.scale);

//       let p = progress * speed * 10;
//       p = Math.min(Math.max(p, 0), 1);

//       const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
//       const base = originalTransforms[i] || "translate(0px, 0px)";

//       const flyX = 0;
//       const flyY = -ease * 180;

//       const scale = 1 + (finalScale - 1) * ease;

//       img.style.transform = `${base} translate(${flyX}vw, ${flyY}vh) scale(${scale})`;
//       // img.style.opacity = 1 - ease * 0.95;
//       // img.style.filter = `blur(${ease * 12}px)`;
//     });

//     requestAnimationFrame(update);
//   };

//   requestAnimationFrame(update);
// });

// /* ======EXPLOSION EFFECT===================================================
// document.addEventListener("DOMContentLoaded", () => {
//   const oval = document.querySelector(".oval-container");
//   const home = document.getElementById("home");
//   if (!oval || !home) return;

//   const imgs = oval.querySelectorAll("img");

//   imgs.forEach(img => {
//     img.dataset.speed = 0.7 + Math.random() * 1.6;
//     const biggerChance = Math.random() < 0.25;
//     const randomScale = 0.05 + Math.random() * 3.7;
//     img.dataset.scale = biggerChance ? randomScale * 1.5 : randomScale;
//     img.dataset.stretchX = 0.8 + Math.random() * 1.6;
//     img.dataset.stretchY = 0.8 + Math.random() * 1.6;
//     const angle = Math.random() * Math.PI * 2;
//     img.dataset.dirX = Math.cos(angle);
//     img.dataset.dirY = Math.sin(angle);
//   });

//   const originalTransforms = [];
//   requestAnimationFrame(() => {
//     imgs.forEach((img, i) => {
//       const matrix = getComputedStyle(img).transform;
//       if (matrix && matrix !== "none") {
//         const values = matrix.split("(")[1].split(")")[0].split(",");
//         originalTransforms[i] = `translate(${values[4]}px, ${values[5]}px)`;
//       } else {
//         originalTransforms[i] = "translate(0px, 0px)";
//       }
//     });
//   });

//   let opacitySmooth = Array.from({ length: imgs.length }, () => 0);

//   const update = () => {
//     const homeRect = home.getBoundingClientRect();
//     const scrolled = Math.max(0, -homeRect.top);
//     const maxScroll = innerHeight * 0.9;

//     const progress = Math.min(scrolled / maxScroll / 4, 1);

//     imgs.forEach((img, i) => {
//       const speed = parseFloat(img.dataset.speed);
//       const finalScale = parseFloat(img.dataset.scale);
//       const stretchX = parseFloat(img.dataset.stretchX);
//       const stretchY = parseFloat(img.dataset.stretchY);
//       const dirX = parseFloat(img.dataset.dirX);
//       const dirY = parseFloat(img.dataset.dirY);

//       let p = progress * speed * 3;
//       p = Math.min(Math.max(p, 0), 1);
//       const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

//       const base = originalTransforms[i] || "translate(0px, 0px)";

//       const scaleX = 1 + (finalScale - 1) * ease * stretchX;
//       const scaleY = 1 + (finalScale - 1) * ease * stretchY;
//       const moveX = dirX * 20 * ease;
//       const moveY = dirY * 20 * ease;

//       img.style.transform = `${base} translate(${moveX}vw, ${moveY}vh) scale(${scaleX}, ${scaleY})`;

//       const targetOpacity = homeRect.bottom > 0 ? 1 - ease * 0.95 : 0;
//       opacitySmooth[i] += (targetOpacity - opacitySmooth[i]) * 0.08; 
//       img.style.opacity = opacitySmooth[i];

//       img.style.filter = `blur(${ease * 12}px)`;
//     });

//     requestAnimationFrame(update);
//   };

//   requestAnimationFrame(update);
// });




/* MAXIMUM CHAOS EXPLOSION — INSTANT & BRUTAL */
document.addEventListener("DOMContentLoaded", () => {
  const oval = document.querySelector(".oval-container");
  const home = document.getElementById("home");
  if (!oval || !home) return;

  const imgs = oval.querySelectorAll("img");

  imgs.forEach(img => {
    // Save original transform (keeps your oval perfect)
    const orig = getComputedStyle(img).transform;
    img.dataset.base = orig === "none" ? "translate(-50%, 0%)" : orig;

    // EXTREME 360° chaos — way stronger and more random
    const angle = Math.random() * Math.PI * 2;
    const force = 180 + Math.random() * 300; // fly up to 480vw/vh away!
    img.dataset.x = Math.cos(angle) * force;
    img.dataset.y = Math.sin(angle) * force;

    // Super random speed — some fly immediately, some a bit delayed
    img.dataset.speed = 0.5 + Math.random() * 2.4;

    // Wild scale — some become giants, some tiny
    img.dataset.scale = Math.random() < 0.3 
      ? 5 + Math.random() * 10   // massive
      : 0.2 + Math.random() * 2; // small or normal
  });

  const tick = () => {
    const scrolled = Math.max(0, -home.getBoundingClientRect().top);
    // Trigger explosion on the VERY FIRST scroll pixel!
    const progress = Math.min(scrolled / (innerHeight * 0.5), 1); // explodes in first 30vh!

    // Add flying class immediately
    oval.classList.toggle("flying", progress > 0.001);

    imgs.forEach(img => {
      const base = img.dataset.base;
      const x = parseFloat(img.dataset.x);
      const y = parseFloat(img.dataset.y);
      const speed = parseFloat(img.dataset.speed);
      const scale = parseFloat(img.dataset.scale);

      // Progress ramps up FAST
      let p = progress * speed / 2;
      p = Math.min(p, 1);

      // Super snappy ease
      const ease = p < 0.5 
        ? 4 * p * p * p 
        : 1 - Math.pow(-2 * p + 2, 3) / 2;

      img.style.transform = `
        ${base}
        translate(${x * ease}vw, ${y * ease}vh)
        scale(${1 + (scale - 1) * ease})
      `;

      // Instant fade + heavy blur
      // img.style.opacity = 1 - ease;
      // img.style.filter = `blur(${ease * 30}px)`;
    });

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
});