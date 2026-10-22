const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const spotifyToggle = document.querySelector(".spotify-toggle");
const spotifyPlayer = document.querySelector(".spotify-popover");
const spotifyClose = document.querySelector(".spotify-close");
const spotifyEmbedHost = document.querySelector("#spotify-embed");
const spotifyEmbedShell = document.querySelector(".spotify-embed-shell");
const spotifyPrevious = document.querySelector(".spotify-previous");
const spotifyNext = document.querySelector(".spotify-next");
const spotifyTrackStatus = document.querySelector(".spotify-track-status");
const audioVisualizer = document.querySelector(".audio-visualizer");
const systemTheme = window.matchMedia("(prefers-color-scheme: light)");
let themeWasManuallyChanged = false;
let spotifyController;
let spotifyTrackIndex = 0;
let spotifyPlayWhenReady = false;
let spotifySwitchTimeout;

const spotifyTracks = [
  {
    name: "Instant Crush",
    url: "https://open.spotify.com/track/2cGxRwrMyEAp8dEbuZaVv6?utm_source=generator&theme=0&si=af6c673476194188"
  },
  {
    name: "Get Lucky",
    url: "https://open.spotify.com/track/69kOkLUCkxIZYexIgSG8rq?utm_source=generator&theme=0&si=df044c543a0e47cc"
  }
];

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

function setSpotifyPlaying(playing) {
  audioVisualizer.classList.toggle("is-playing", playing);
}

function updateSpotifyTrackUi() {
  spotifyPrevious.hidden = spotifyTrackIndex === 0;
  spotifyNext.hidden = spotifyTrackIndex === spotifyTracks.length - 1;
  spotifyTrackStatus.querySelector("b").textContent = spotifyTracks[spotifyTrackIndex].name;
  spotifyNext.setAttribute("aria-label", `Play ${spotifyTracks[Math.min(spotifyTracks.length - 1, spotifyTrackIndex + 1)].name}`);
  spotifyPrevious.setAttribute("aria-label", `Play ${spotifyTracks[Math.max(0, spotifyTrackIndex - 1)].name}`);
}

function loadSpotifyTrack(index, play = true) {
  if (!spotifyController || index < 0 || index >= spotifyTracks.length || index === spotifyTrackIndex) return;
  window.clearTimeout(spotifySwitchTimeout);
  spotifyController.pause();
  spotifyPlayWhenReady = play;
  setSpotifyPlaying(false);
  spotifyEmbedShell.classList.add("is-changing");

  spotifySwitchTimeout = window.setTimeout(() => {
    spotifyTrackIndex = index;
    spotifyController.loadEntity(spotifyTracks[index].url);
    updateSpotifyTrackUi();
  }, 170);
}

spotifyToggle.addEventListener("click", () => {
  const willOpen = spotifyPlayer.hidden;
  setSpotifyPlayer(willOpen);
});

spotifyPrevious.addEventListener("click", () => loadSpotifyTrack(spotifyTrackIndex - 1));
spotifyNext.addEventListener("click", () => loadSpotifyTrack(spotifyTrackIndex + 1));

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

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  IFrameAPI.createController(
    spotifyEmbedHost,
    { width: "100%", height: 152, url: spotifyTracks[0].url },
    (controller) => {
      spotifyController = controller;
      controller.addListener("ready", () => {
        spotifyEmbedShell.classList.remove("is-changing");
        if (spotifyPlayWhenReady) {
          spotifyPlayWhenReady = false;
          controller.play();
        }
      });
      controller.addListener("playback_update", (event) => {
        setSpotifyPlaying(!event.data.isPaused && !event.data.isBuffering);
      });
    }
  );
};

const spotifyApiScript = document.createElement("script");
spotifyApiScript.src = "https://open.spotify.com/embed/iframe-api/v1";
spotifyApiScript.async = true;
document.head.append(spotifyApiScript);
updateSpotifyTrackUi();

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

const overviewGrid = document.querySelector(".overview-grid");
const swipeCue = document.querySelector(".swipe-cue");

if (overviewGrid && swipeCue) {
  let swipeFrame;
  const overviewCards = [...overviewGrid.querySelectorAll(".overview-card")];
  const previousCardButton = swipeCue.querySelector(".cue-left");
  const nextCardButton = swipeCue.querySelector(".cue-right");

  const getCurrentCardIndex = () => {
    const gridCenter = overviewGrid.getBoundingClientRect().left + overviewGrid.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    overviewCards.forEach((card, index) => {
      const bounds = card.getBoundingClientRect();
      const distance = Math.abs(bounds.left + bounds.width / 2 - gridCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  };

  const scrollToCard = (index) => {
    const card = overviewCards[index];
    if (!card) return;

    const gridBounds = overviewGrid.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    const targetLeft = overviewGrid.scrollLeft + cardBounds.left - gridBounds.left - (overviewGrid.clientWidth - cardBounds.width) / 2;
    overviewGrid.scrollTo({ left: targetLeft, behavior: reducedMotion.matches ? "auto" : "smooth" });
  };

  const updateSwipeCue = () => {
    const currentIndex = getCurrentCardIndex();
    const isStart = currentIndex === 0;
    const isEnd = currentIndex === overviewCards.length - 1;
    swipeCue.classList.toggle("is-start", isStart);
    swipeCue.classList.toggle("is-end", isEnd);
    previousCardButton.disabled = isStart;
    nextCardButton.disabled = isEnd;
  };

  previousCardButton.addEventListener("click", () => scrollToCard(Math.max(0, getCurrentCardIndex() - 1)));
  nextCardButton.addEventListener("click", () => scrollToCard(Math.min(overviewCards.length - 1, getCurrentCardIndex() + 1)));

  overviewGrid.addEventListener("scroll", () => {
    cancelAnimationFrame(swipeFrame);
    swipeFrame = requestAnimationFrame(updateSwipeCue);
  }, { passive: true });

  window.addEventListener("resize", updateSwipeCue);
  window.addEventListener("load", updateSwipeCue);
  requestAnimationFrame(updateSwipeCue);
}
