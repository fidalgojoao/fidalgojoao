const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const spotifyToggle = document.querySelector(".spotify-toggle");
const spotifyPlayer = document.querySelector(".spotify-popover");
const spotifyClose = document.querySelector(".spotify-close");
const systemTheme = window.matchMedia("(prefers-color-scheme: light)");
let themeWasManuallyChanged = false;

function applyTheme(theme) {
  root.dataset.theme = theme;
  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  themeColor.setAttribute("content", isDark ? "#09090b" : "#f7f7fb");
}

applyTheme(systemTheme.matches ? "light" : "dark");

themeToggle.addEventListener("click", () => {
  themeWasManuallyChanged = true;
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

systemTheme.addEventListener("change", (event) => {
  if (!themeWasManuallyChanged) {
    applyTheme(event.matches ? "light" : "dark");
  }
});

function setSpotifyPlayer(open) {
  spotifyPlayer.hidden = !open;
  spotifyToggle.setAttribute("aria-expanded", String(open));
  spotifyToggle.setAttribute("aria-label", `${open ? "Close" : "Open"} Spotify player`);
}

spotifyToggle.addEventListener("click", () => {
  setSpotifyPlayer(spotifyPlayer.hidden);
});

spotifyClose.addEventListener("click", () => {
  setSpotifyPlayer(false);
  spotifyToggle.focus();
});

document.addEventListener("click", (event) => {
  if (!spotifyPlayer.hidden && !spotifyPlayer.contains(event.target) && !spotifyToggle.contains(event.target)) {
    setSpotifyPlayer(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !spotifyPlayer.hidden) {
    setSpotifyPlayer(false);
    spotifyToggle.focus();
  }
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("in-view"));
} else {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

const heroVisual = document.querySelector(".hero-visual");
const profileCard = document.querySelector(".profile-card");

if (!reducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
  heroVisual.addEventListener("pointermove", (event) => {
    const bounds = heroVisual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    profileCard.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  });

  heroVisual.addEventListener("pointerleave", () => {
    profileCard.style.removeProperty("transform");
  });
}

document.querySelector("#year").textContent = new Date().getFullYear();
