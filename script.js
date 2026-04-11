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

  void content.offsetWidth;

  requestAnimationFrame(() => {
    content.classList.remove("start-hidden");
  });
});

document.addEventListener("click", (e) => {
  const link = e.target.closest("nav a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || link.href === location.href) return;
  e.preventDefault();

  const content = document.querySelector(".page-content");
  if (!content) return;

  content.classList.add("fade-out");

  setTimeout(() => {
    window.location.href = href;
  }, 1300); 
});

window.addEventListener("load", () => {
  const content = document.querySelector(".page-content");
  if (!content) return;

  void content.offsetWidth;
  content.classList.remove("fade-out");

setTimeout(() => {
  content.classList.add("fade-in");
}, 300);

});

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

document.addEventListener("DOMContentLoaded", () => {
  const oval = document.querySelector(".oval-container");
  const home = document.getElementById("home");
  const wrapper = document.getElementById("page-wrapper");
  if (!oval || !home || !wrapper) return;

  const imgs = oval.querySelectorAll("img");

  imgs.forEach(img => {
    img.dataset.base = "translate(-50%, -50%)";

    const angle = Math.random() * Math.PI * 2;
    const force = 200 + Math.random() * 300; 

    let x = Math.cos(angle) * force;
    let y = Math.sin(angle) * force;

    if (y > 0) {
      x = x < 0 ? -force : force; 
      y = Math.abs(y) + force; 
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

    const startFade = homeHeight * 0.80;
    const endFade = homeHeight * 0.90;

    let opacity = 1;
    if (scrollY >= startFade) {
      opacity = 1 - (scrollY - startFade) / (endFade - startFade);
      opacity = Math.max(0, Math.min(1, opacity));
    }

    oval.style.opacity = opacity.toFixed(3);
    oval.style.pointerEvents = opacity <= 0 ? "none" : "auto";

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

