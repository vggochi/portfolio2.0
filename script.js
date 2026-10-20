
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

// Ano automático
$("#currentYear").textContent = new Date().getFullYear();

// Menu para celular
const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

$$("a", navLinks).forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

// Navbar com fundo ao rolar
const navbar = $(".navbar");

function updateNavbar() {
  navbar.classList.toggle("scrolled", window.scrollY > 35);
}

window.addEventListener("scroll", updateNavbar, { passive: true });
updateNavbar();

// Animações de entrada conforme a página é rolada
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add("visible");

    // Anima as barras de habilidades quando entram na tela
    if (entry.target.classList.contains("skills-panel")) {
      $$(".skill", entry.target).forEach((skill, index) => {
        const bar = $(".skill-track span", skill);
        const level = Math.max(0, Math.min(100, Number(skill.dataset.level) || 0));

        setTimeout(() => {
          bar.style.width = `${level}%`;
        }, index * 130);
      });
    }

    observer.unobserve(entry.target);
  });
}, {
  threshold: 0.12,
  rootMargin: "0px 0px -35px 0px"
});

$$(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
  revealObserver.observe(element);
});

// Inclinação 3D dos cartões
const canUseTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canUseTilt && !reduceMotion) {
  $$(".tilt-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 10;
      const rotateX = (0.5 - y) * 8;

      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;

      card.style.setProperty("--mouse-x", `${x * 100}%`);
      card.style.setProperty("--mouse-y", `${y * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });

  // A esfera acompanha suavemente o movimento do ponteiro
  const scene = $("#coreScene");
  const heroVisual = $(".hero-visual");

  heroVisual.addEventListener("pointermove", event => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    scene.style.transform =
      `rotateY(${x * 16}deg) rotateX(${-y * 12}deg)`;
  });

  heroVisual.addEventListener("pointerleave", () => {
    scene.style.transform = "";
  });

  // Brilho ambiente acompanha o mouse
  const glow = $(".cursor-glow");

  window.addEventListener("pointermove", event => {
    glow.style.setProperty("--mx", `${event.clientX}px`);
    glow.style.setProperty("--my", `${event.clientY}px`);
  }, { passive: true });
}

// Filtro de certificados e insígnias
const tabButtons = $$(".tab-button");
const achievementCards = $$(".achievements-grid [data-type]");

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    tabButtons.forEach(tab => {
      const active = tab === button;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-pressed", String(active));
    });

    achievementCards.forEach(card => {
      const show = filter === "all" || card.dataset.type === filter;
      card.classList.toggle("hidden", !show);
    });
  });
});

// Fundo de partículas: animação em Canvas
const canvas = $("#universe");
const ctx = canvas.getContext("2d", { alpha: true });

let width = 0;
let height = 0;
let particles = [];
let animationFrame = 0;
let lastFrame = 0;

const smallScreen = window.matchMedia("(max-width: 680px)").matches;
const particleCount = reduceMotion ? 0 : smallScreen ? 38 : 75;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.4,
    speed: Math.random() * 0.25 + 0.08,
    phase: Math.random() * Math.PI * 2,
    alpha: Math.random() * 0.48 + 0.12
  }));
}

function drawParticles(timestamp = 0) {
  animationFrame = requestAnimationFrame(drawParticles);

  // Limita a frequência para reduzir o custo em telas de alta taxa de atualização
  if (timestamp - lastFrame < 30) return;
  lastFrame = timestamp;

  ctx.clearRect(0, 0, width, height);

  particles.forEach(particle => {
    particle.y -= particle.speed;
    particle.phase += 0.012;

    if (particle.y < -5) {
      particle.y = height + 5;
      particle.x = Math.random() * width;
    }

    const shimmer =
      particle.alpha * (0.7 + Math.sin(particle.phase) * 0.3);

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(111, 183, 255, ${shimmer})`;
    ctx.fill();
  });
}

resizeCanvas();

if (particleCount > 0) {
  drawParticles();
}

// Recalcula o fundo quando a janela muda de tamanho
let resizeTimeout;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    resizeCanvas();
  }, 120);
}, { passive: true });

// Economiza recursos quando a aba não está visível
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
    return;
  }

  if (particleCount > 0) {
    lastFrame = 0;
    drawParticles();
  }
});
