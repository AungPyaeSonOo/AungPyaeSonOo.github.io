document.documentElement.classList.add("js");

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const yearElement = document.getElementById("year");
const profilePhoto = document.getElementById("profile-photo");

/* ---------------------------------------------------------
   Current year
   --------------------------------------------------------- */
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------
   Mobile navigation
   --------------------------------------------------------- */
function closeMenu() {
  if (!menuToggle || !navLinks) return;

  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

/* ---------------------------------------------------------
   Profile photo fallback
   If assets/profile.jpg is missing or fails to load,
   the "AP" initials remain visible.
   --------------------------------------------------------- */
if (profilePhoto) {
  const showLoadedPhoto = () => {
    profilePhoto.classList.add("loaded");
  };

  const hideBrokenPhoto = () => {
    profilePhoto.style.display = "none";
  };

  if (profilePhoto.complete) {
    if (profilePhoto.naturalWidth > 0) {
      showLoadedPhoto();
    } else {
      hideBrokenPhoto();
    }
  } else {
    profilePhoto.addEventListener("load", showLoadedPhoto, { once: true });
    profilePhoto.addEventListener("error", hideBrokenPhoto, { once: true });
  }
}

/* ---------------------------------------------------------
   Scroll reveal animations
   --------------------------------------------------------- */
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealItems.length) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("in-view");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}
