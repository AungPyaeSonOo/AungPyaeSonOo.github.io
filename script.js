document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   CURRENT YEAR
   ============================================================ */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
const progressBar = document.getElementById("scroll-progress");

if (progressBar) {
  const updateProgress = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? doc.scrollTop / max : 0;
    progressBar.style.transform = `scaleX(${ratio})`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

/* ============================================================
   MOBILE NAVIGATION
   ============================================================ */
const navToggle = document.getElementById("nav-toggle");
const navList = document.getElementById("nav-list");

function closeNav() {
  if (!navToggle || !navList) return;
  navList.classList.remove("open");
  navToggle.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation menu");
}

if (navToggle && navList) {
  navToggle.addEventListener("click", () => {
    const isOpen = navList.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  navList.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

/* ============================================================
   SCROLL SPY — active nav link
   ============================================================ */
const sections = Array.from(document.querySelectorAll("main section[id]"));
const navLinks = Array.from(document.querySelectorAll(".nav-link"));

if (sections.length && navLinks.length) {
  const setActive = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
    });
  };

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => spy.observe(section));
  }
}

/* ============================================================
   PROFILE PHOTO — fallback to initials
   ============================================================ */
const profilePhoto = document.getElementById("profile-photo");

if (profilePhoto) {
  const onLoad = () => profilePhoto.classList.add("loaded");
  const onError = () => { profilePhoto.style.display = "none"; };

  if (profilePhoto.complete) {
    if (profilePhoto.naturalWidth > 0) onLoad();
    else onError();
  } else {
    profilePhoto.addEventListener("load", onLoad, { once: true });
    profilePhoto.addEventListener("error", onError, { once: true });
  }
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealEls.length && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in-view"));
}

/* ============================================================
   STAT COUNTERS
   ============================================================ */
const counters = document.querySelectorAll(".stat-value[data-count]");

function animateCount(el) {
  const target = Number(el.dataset.count) || 0;
  if (reduceMotion || target === 0) {
    el.textContent = target;
    return;
  }

  const duration = 1300;
  const start = performance.now();
  const suffix = target < 10 ? "0" : "";

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = suffix ? String(value).padStart(2, "0") : value;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

if (counters.length) {
  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => countObserver.observe(counter));
  } else {
    counters.forEach(animateCount);
  }
}

/* ============================================================
   3D TILT + SPOTLIGHT — project cards
   ============================================================ */
const tiltCards = document.querySelectorAll("[data-tilt]");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (tiltCards.length && finePointer && !reduceMotion) {
  const MAX_TILT = 8;

  tiltCards.forEach((card) => {
    let frame = null;

    const handleMove = (event) => {
      if (frame) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        const ry = (px - 0.5) * MAX_TILT * 2;
        const rx = (0.5 - py) * MAX_TILT * 2;

        card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
        card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
        card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      });
    };

    const handleLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    };

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", handleLeave);
  });
}

/* ============================================================
   SPOTLIGHT — about card (no tilt)
   ============================================================ */
const glowCards = document.querySelectorAll(".glass-card");

if (glowCards.length && finePointer && !reduceMotion) {
  glowCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}
