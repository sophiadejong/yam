document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("page-wrapper");
  const projects = Array.from(document.querySelectorAll(".project"));
  const infoToggle = document.getElementById("info-toggle");
  const infoName = document.getElementById("info-name");
  const infoText = infoName?.querySelector(".info-text");
  const infoContainer = document.querySelector(".info-container");
  let currentProject = null;

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

      const anyInView = projects.some(p => p.classList.contains("in-view"));
      infoContainer.classList.toggle("visible", anyInView);
    },
    {
      root: wrapper,
      rootMargin: "-30% 0px -20% 0px",  
      threshold: 0
    }
  );

  projects.forEach(p => projectObserver.observe(p));

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

    // Desktop click navigation (left / right half)
    project.addEventListener("click", (e) => {
      if (e.target.closest(".carousel-dots") || project.classList.contains("show-info")) return;

      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (x <= rect.width / 2) prevSlide();
      else nextSlide();
    });

    // Desktop cursor
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

    // ==================== SIMPLE MOBILE SWIPE (Safe for Desktop) ====================
    let touchStartX = 0;

    slider.addEventListener("touchstart", (e) => {
      if (project.classList.contains("show-info")) return;
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener("touchend", (e) => {
      if (project.classList.contains("show-info")) return;

      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) < 50) return; // ignore small taps

      if (diff > 0) {
        nextSlide();   // swipe left → next
      } else {
        prevSlide();   // swipe right → previous
      }
    }, { passive: true });

    updateSlide();
  });

  // ==================== INFO TOGGLE ====================
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