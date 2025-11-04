document.addEventListener("DOMContentLoaded", () => {
  const projects = document.querySelectorAll(".project");
  const infoToggle = document.getElementById("info-toggle");
  const projectsSection = document.getElementById("projects");

  /* ---- Scroll-in blur effect ---- */
  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => entry.target.classList.toggle("in-view", entry.isIntersecting)),
    { threshold: 0.5 }
  );
  projects.forEach(project => observer.observe(project));

  /* ---- Carousel + Cursor + Dots logic ---- */
  projects.forEach(project => {
    const track = project.querySelector(".carousel-track");
    const images = Array.from(track.children);
    let currentIndex = 0;

    /* ---- Create Dots ---- */
    const dotsContainer = document.createElement("div");
    dotsContainer.classList.add("carousel-dots");
    images.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      if (i === 0) dot.classList.add("active");
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", e => {
        e.stopPropagation();
        currentIndex = i;
        updateSlide();
      });
    });
    project.querySelector(".carousel").after(dotsContainer);

    function updateSlide() {
      const slideWidth = project.querySelector(".carousel").clientWidth;
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      updateDots();
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll(".dot");
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    }

    /* ---- Dynamic Cursor ---- */
    project.addEventListener("mousemove", e => {
      const rect = project.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const direction = x > rect.width / 2 ? "→" : "←";

      // ✅ FIXED: Centered SVG cursor
      const svgCursor = `
        <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
          <circle cx='32' cy='32' r='28' fill='white' fill-opacity='0.7'/>
          <text x='32' y='43' text-anchor='middle'
                font-size='32' font-family='Arial' fill='#3C3C3C'>${direction}</text>
        </svg>
      `.trim();

      project.style.cursor = `url("data:image/svg+xml;utf8,${encodeURIComponent(svgCursor)}") 32 32, auto`;
    });

    /* ---- Click Navigation ---- */
    project.addEventListener("click", e => {
      const rect = project.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (x > rect.width / 2) {
        currentIndex = (currentIndex + 1) % images.length;
      } else {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
      }
      updateSlide();
    });

    window.addEventListener("resize", updateSlide);
  });

  /* ---- Info Toggle ---- */
  if (infoToggle) {
    infoToggle.addEventListener("click", () => {
      const currentProject = Array.from(projects).find(project => {
        const rect = project.getBoundingClientRect();
        return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
      });
      if (!currentProject) return;

      currentProject.classList.toggle("show-info");

      if (currentProject.classList.contains("show-info")) {
        infoToggle.textContent = "Info X";
        infoToggle.classList.add("hide-mode");
      } else {
        infoToggle.classList.remove("hide-mode");
        switch (currentProject.id) {
          case "project1": infoToggle.textContent = "Animario +"; break;
          case "project2": infoToggle.textContent = "Higher +"; break;
          case "project3": infoToggle.textContent = "Animario +"; break;
        }
      }
    });
  }

  /* ---- Update info-toggle text based on visible project ---- */
  const projectObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains("show-info")) {
          switch (entry.target.id) {
            case "project1": infoToggle.textContent = "Animario +"; break;
            case "project2": infoToggle.textContent = "Higher +"; break;
            case "project3": infoToggle.textContent = "Animario +"; break;
          }
        }
      });
    },
    { threshold: 0.5 }
  );
  projects.forEach(project => projectObserver.observe(project));

  /* ---- Show info-toggle after scrolling into projects section ---- */
  if (projectsSection && infoToggle) {
    window.addEventListener("scroll", () => {
      const rect = projectsSection.getBoundingClientRect();
      const sectionHeight = projectsSection.offsetHeight;
      const scrollY = window.innerHeight - rect.top;

      if (scrollY >= sectionHeight * 0.3) {
        infoToggle.classList.add("visible");
        infoToggle.style.position = "fixed";
        infoToggle.style.bottom = "2%";
        infoToggle.style.left = "50%";
        infoToggle.style.transform = "translateX(-50%)";
      } else {
        infoToggle.classList.remove("visible");
        infoToggle.style.position = "absolute";
        infoToggle.style.bottom = "20px";
        infoToggle.style.left = "50%";
        infoToggle.style.transform = "translateX(-50%)";
      }
    });

    infoToggle.classList.remove("visible");
  }

  /* ---- Email Copy + Fade + Hover Color Animation ---- */
  const emailElement = document.getElementById("email");

  if (emailElement) {
    const originalEmail = emailElement.textContent.trim();
    emailElement.style.cursor = "pointer";

    emailElement.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(originalEmail);

        // Fade out
        emailElement.classList.add("fade-out");

        // After fade-out, show "Copied!"
        setTimeout(() => {
          emailElement.textContent = "Copied!";
          emailElement.classList.remove("fade-out");
          emailElement.classList.add("copied");
        }, 300);

        // Restore original email after 1.5s
        setTimeout(() => {
          emailElement.classList.add("fade-out");
          setTimeout(() => {
            emailElement.textContent = originalEmail;
            emailElement.classList.remove("fade-out", "copied");
          }, 300);
        }, 1500);
      } catch (err) {
        console.error("Failed to copy email:", err);
      }
    });
  }
});
