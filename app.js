// Spotify Web Player - Audio Engine and UI Controller

// 1. Dynamic Song Database and Playback State
let songDatabase = [];
let currentTrackIndex = 0; 
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let previousVolume = 0.5;

// Create Audio element
const audioPlayer = new Audio();
audioPlayer.volume = 0.5; // Default volume

// 2. DOM Elements
let playPauseBtn, prevBtn, nextBtn, shuffleBtn, repeatBtn;
let trackTitle, trackArtist, trackCover, likeBtn;
let progressSlider, currentTimeLabel, totalTimeLabel, timelineTooltip;
let volumeBtn, volumeSlider;
let fullscreenPlayerEl, fsCollapseBtn, fsPlayingFromLabel, fsPlayingFromTitle;
let fsCover, fsTrackTitle, fsTrackArtist, fsLikeBtn;
let fsProgressSlider, fsCurrentTime, fsTotalTime;
let fsShuffleBtn, fsPrevBtn, fsPlayBtn, fsNextBtn, fsRepeatBtn;
let searchInput, albumCards,quickCards;

// Initialize Player
function initPlayer() {
  // Bind DOM elements
  playPauseBtn = document.getElementById("play-pause-btn");
  prevBtn = document.getElementById("prev-btn");
  nextBtn = document.getElementById("next-btn");
  shuffleBtn = document.getElementById("shuffle-btn");
  repeatBtn = document.getElementById("repeat-btn");

  trackTitle = document.getElementById("player-track-title");
  trackArtist = document.getElementById("player-track-artist");
  trackCover = document.getElementById("player-track-cover");
  likeBtn = document.getElementById("player-like-btn");

  progressSlider = document.getElementById("progress-slider");
  currentTimeLabel = document.getElementById("current-time");
  totalTimeLabel = document.getElementById("total-time");
  timelineTooltip = document.getElementById("timeline-tooltip");

  volumeBtn = document.getElementById("volume-btn");
  volumeSlider = document.getElementById("volume-slider");

  searchInput = document.getElementById("search-input");
  albumCards = document.querySelectorAll(".album-card");
  quickCards = document.querySelectorAll(".quick-card");

setupTabletTooltips();
setupSidebarToggle(); 
setupIconTooltips();
setupSideTooltips(); 
setupMobileMiniPlayerButton();
setupFullScreenPlayer(); 
setupMobileLibraryView();
setupMobileSearchView()
setupDesktopSearchDropdown();
  // Parse all album cards dynamically from the DOM
  parseSongCards();
  // Restore the last played track (if any) instead of always defaulting to index 0
  const savedIndex = parseInt(localStorage.getItem("lastTrackIndex"));
  if (!isNaN(savedIndex) && songDatabase[savedIndex]) {
    currentTrackIndex = savedIndex;
  }

  if (songDatabase.length > 0) {
    loadTrack(currentTrackIndex);
  }
  updateVolumeUI(audioPlayer.volume);

  // Setup Event Listeners
  if (playPauseBtn) playPauseBtn.addEventListener("click", togglePlay);
  if (prevBtn) prevBtn.addEventListener("click", prevTrack);
  if (nextBtn) nextBtn.addEventListener("click", nextTrack);
  if (shuffleBtn) shuffleBtn.addEventListener("click", toggleShuffle);
  if (repeatBtn) repeatBtn.addEventListener("click", toggleRepeat);

  // Seek bar events
  if (progressSlider) {
    // Keep tooltip behavior
    progressSlider.addEventListener("mousemove", handleTimelineHover);
    progressSlider.addEventListener("mouseleave", handleTimelineLeave);

    // Soft sliding seeking
    progressSlider.addEventListener("pointerdown", handleTimelinePointerDown);
  }
progressSlider.addEventListener("mouseenter", () => {
    updateSliderGradient(progressSlider, progressSlider.value);
});

progressSlider.addEventListener("mouseleave", () => {
    updateSliderGradient(progressSlider, progressSlider.value);
});

volumeSlider.addEventListener("mouseenter", () => {
    updateSliderGradient(volumeSlider, volumeSlider.value);
});

volumeSlider.addEventListener("mouseleave", () => {
    updateSliderGradient(volumeSlider, volumeSlider.value);
});

  // Volume events
  if (volumeSlider) volumeSlider.addEventListener("input", handleVolumeInput);
  if (volumeBtn) volumeBtn.addEventListener("click", toggleMute);

  // Audio object events
  audioPlayer.addEventListener("timeupdate", updateProgressBar);
  audioPlayer.addEventListener("loadedmetadata", updateDuration);
  audioPlayer.addEventListener("ended", handleTrackEnded);

  // Setup Card Clicks & Hover bindings
  setupCardInteractions();
  setupQuickCardInteractions();

  // // Search filter
  // if (searchInput) searchInput.addEventListener("input", handleSearch);

  // Active styles for library items/pills
  setupLibraryInteractions();


}

// Parse album cards to build dynamic playlist
function parseSongCards() {
  const cardColorPalette = ["#7b3f61","#4a3b6b","#1e5631","#8a3b52","#2c4b6e","#6e2c3e","#5e2530","#4b2a4d"];
  const localSongs = [
    "songs/Humdard  Song  Ek Villain.mp3",
    "songs/Dooron Dooron .mp3",
    "songs/Main Koi Aisa Geet Gaoon.mp3",
    "songs/Itna na mujhse tu pyar badha.mp3",
    "songs/Iqlipse Nova.mp3",
    "songs/Bairan.mp3",
    "songs/Khat .mp3",
    "songs/Song Tum Tak .mp3",
    "songs/Vaaroon.mp3",
    "songs/Iktara.mp3",
    "songs/Prem Ki Leela.mp3",
    "songs/Safar.mp3",
    "songs/Saiyaara.mp3",
    "songs/AUR - Tu hai kahan.mp3",
    "songs/Chand Mera Dil .mp3",
    "songs/Dil Lagana Mana Tha .mp3",
    "songs/O Saathi .mp3",
    "songs/maula maula re.mp3",
    "songs/Tum Ho Toh.mp3",
    "songs/Rebel.mp3",
    "songs/Ilahi Song.mp3",
    "songs/Finding Her.mp3",
    "songs/Yeh Ishq Hai.mp3",
    "songs/Ishq Hai.mp3",
    "songs/JO TUM MERE HO.mp3",
    "songs/Sun Raha Hai Na Tu.mp3",
    "songs/Raanjhan.mp3",
    "songs/Arijit Singh - Tera Chehra.mp3",
    "songs/YOUNG GOAT.mp3",
    "songs/Bekhayali.mp3"
  ];
  songDatabase = [];

  albumCards.forEach((card, index) => {
    card.setAttribute("data-track-id", index);

    const h3Element = card.querySelector("h3");
    const pElement = card.querySelector("p");
    const imgElement = card.querySelector("img");

    const title = h3Element ? h3Element.innerText.trim() : "Unknown Song";
    const artist = pElement ? pElement.innerText.trim() : "Unknown Artist";
    const cover = imgElement ? imgElement.getAttribute("src") : "spotifyimages/logo.png";

    const rawPath = localSongs[index % localSongs.length];
    const audioUrl = encodeURI(rawPath);

    const color = card.getAttribute("data-color") || cardColorPalette[index % cardColorPalette.length];

    let sectionName = "Album";
    const albumContainer = card.closest(".album-container");
    if (albumContainer) {
      let prev = albumContainer.previousElementSibling;
      while (prev && !prev.classList.contains("section-title")) {
        prev = prev.previousElementSibling;
      }
      if (prev) {
        const h2 = prev.querySelector("h2");
        if (h2) sectionName = h2.innerText.trim();
      }
    }

    songDatabase.push({
      id: index,
      title: title,
      artist: artist,
      cover: cover,
      audioUrl: audioUrl,
      color: color,
      playingFromLabel: `PLAYING FROM ${sectionName.toUpperCase()}`,
      playingFromTitle: title
    });
  });

  quickCards.forEach((card) => {
    const trackId = songDatabase.length;
    card.setAttribute("data-track-id", trackId);

    const title = card.getAttribute("data-title") || card.querySelector("span")?.innerText.trim() || "Unknown Song";
    const artist = card.getAttribute("data-artist") || "Unknown Artist";
    const cover = card.getAttribute("data-cover") || card.querySelector("img")?.getAttribute("src");
    const rawSong = card.getAttribute("data-song");
    const color = card.getAttribute("data-color") || cardColorPalette[trackId % cardColorPalette.length];

    songDatabase.push({
      id: trackId,
      title: title,
      artist: artist,
      cover: cover,
      audioUrl: rawSong ? encodeURI(rawSong) : encodeURI(localSongs[trackId % localSongs.length]),
      color: color,
      playingFromLabel: "PLAYING FROM ALBUM",
      playingFromTitle: title
    });
  });
}
// Clone the desktop sidebar's lib-list items into the mobile library page once
function populateMobileLibList() {
  const mobileLibList = document.getElementById("mobile-lib-list");
  if (!mobileLibList) return;
  mobileLibList.innerHTML = "";
  const desktopItems = document.querySelectorAll("#full-sidebar .lib-item");
  desktopItems.forEach(item => {
    mobileLibList.appendChild(item.cloneNode(true));
  });
}
function setupDesktopSearchDropdown() {
  const searchBox = document.querySelector(".search-box");
  const dropdown = document.getElementById("desktop-search-dropdown");
  const resultsContainer = document.getElementById("desktop-search-results");
  const resultsHeading = document.getElementById("desktop-search-results-heading");
  const input = document.getElementById("search-input");

  if (!searchBox || !dropdown || !input) return;

  function render(query) {
    renderSearchResultsInto(resultsContainer, resultsHeading, query, () => {
      render(input.value.trim());
    });
  }

  input.addEventListener("focus", () => {
    if (isMobileView()) return;
    dropdown.style.display = "block";
    render(input.value.trim());
  });

  input.addEventListener("input", () => {
    if (isMobileView()) return;
    render(input.value.trim());
  });

  // Close dropdown when clicking anywhere outside the search box
  document.addEventListener("click", (e) => {
    if (!searchBox.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
}
function renderSearchResultsInto(container, headingEl, query, onRerender) {
  if (!container) return;
  container.innerHTML = "";

  let matches;

  if (!query) {
    if (headingEl) headingEl.innerText = "Recents";
    const recentIds = getRecentSearches();
    matches = recentIds.map(id => songDatabase.find(t => t.id === id)).filter(Boolean);
  } else {
    if (headingEl) headingEl.innerText = "Results";
    const lowerQuery = query.toLowerCase();
    matches = songDatabase.filter(track =>
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery)
    );
  }

  if (matches.length === 0 && !query) {
    const empty = document.createElement("p");
    empty.style.color = "#b3b3b3";
    empty.style.fontSize = "14px";
    empty.style.padding = "8px 0";
    empty.innerText = "Songs you play will appear here.";
    container.appendChild(empty);
    return;
  }

  matches.forEach(track => {
    const row = document.createElement("div");
    row.className = "mobile-search-result-item";
    row.setAttribute("data-track-id", track.id);

    const isNowPlaying = track.id === currentTrackIndex;

    row.innerHTML = `
      <img src="${track.cover}" class="mobile-search-result-img" alt="">
      <div class="mobile-search-result-text">
        <div class="mobile-search-result-title ${isNowPlaying ? 'now-playing' : ''}">${track.title}</div>
        <div class="mobile-search-result-subtitle">Song • ${track.artist}</div>
      </div>
      <div class="mobile-search-result-actions">
        <i class="bi bi-plus-circle" data-action="add"></i>
        <i class="bi bi-x-lg" data-action="remove"></i>
      </div>
    `;

    row.addEventListener("click", (e) => {
      const iconTarget = e.target.closest("i");
      if (iconTarget) {
          e.stopPropagation();
        if (iconTarget.getAttribute("data-action") === "remove") {
          removeFromRecentSearches(track.id);
          onRerender();
        }
        return;
      }

      if (currentTrackIndex === track.id) {
        if (!isPlaying) playTrack();
      } else {
        currentTrackIndex = track.id;
        loadTrack(currentTrackIndex);
        playTrack();
      }
      addToRecentSearches(track.id);
      if (isMobileView()) openFullScreenPlayer();
      onRerender();
    });

    container.appendChild(row);
  });
}
function setupMobileLibraryView() {
  const navLinks = document.querySelectorAll(".mobile-nav a");
  const topbarDefault = document.getElementById("mobile-topbar-default");
  const topbarLibrary = document.getElementById("mobile-topbar-library");
  const libraryPage = document.getElementById("mobile-library-page");
  const mobileLibList = document.getElementById("mobile-lib-list");
  const quickSection = document.querySelector(".quick-section");
  const sectionTitles = document.querySelectorAll(".content > .section-title, .content > .album-container");
  const contentFooter = document.querySelector(".content-footer");

  if (!navLinks.length || !libraryPage) return;

  function showLibraryView() {
    if (!isMobileView()) return;
    populateMobileLibList();

    if (topbarDefault) topbarDefault.style.display = "none";
    if (topbarLibrary) topbarLibrary.style.display = "flex";

    if (quickSection) quickSection.style.display = "none";
    sectionTitles.forEach(el => el.style.display = "none");
    if (contentFooter) contentFooter.style.display = "none";

    libraryPage.style.display = "block";

    document.querySelectorAll(".album-container").forEach(el => el.style.display = "none");
    document.querySelectorAll(".section-title").forEach(el => el.style.display = "none");
  }

  function showHomeView() {
    if (topbarDefault) topbarDefault.style.display = "flex";
    if (topbarLibrary) topbarLibrary.style.display = "none";

    if (quickSection) quickSection.style.display = "block";
    if (contentFooter) contentFooter.style.display = "block";

    libraryPage.style.display = "none";

    document.querySelectorAll(".album-container").forEach(el => el.style.display = "flex");
    document.querySelectorAll(".section-title").forEach(el => el.style.display = "flex");
  }

  // Filter pills inside the mobile library page (Playlists / Artists)
  const mobileLibPills = document.querySelectorAll(".mobile-lib-pill");
  mobileLibPills.forEach(pill => {
    pill.addEventListener("click", () => {
      mobileLibPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      const filter = pill.getAttribute("data-filter");
      const items = mobileLibList.querySelectorAll(".lib-item");
      items.forEach(item => {
        if (filter === "artists") {
          item.style.display = item.classList.contains("artist") ? "flex" : "none";
        } else {
          item.style.display = "flex";
        }
      });
    });
  });
}

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem("recentSearchIds")) || [];
  } catch {
    return [];
  }
}

function addToRecentSearches(trackId) {
  let recents = getRecentSearches();
  recents = recents.filter(id => id !== trackId); // remove if already present
  recents.unshift(trackId); // add to front
  recents = recents.slice(0, 10); // cap at 10
  localStorage.setItem("recentSearchIds", JSON.stringify(recents));
}

function removeFromRecentSearches(trackId) {
  let recents = getRecentSearches();
  recents = recents.filter(id => id !== trackId);
  localStorage.setItem("recentSearchIds", JSON.stringify(recents));
}

function setupMobileSearchView() {
  const navLinks = document.querySelectorAll(".mobile-nav a");
  const topbarDefault = document.getElementById("mobile-topbar-default");
  const topbarLibrary = document.getElementById("mobile-topbar-library");
  const topbarSearch = document.getElementById("mobile-topbar-search");
  const searchPage = document.getElementById("mobile-search-page");
  const libraryPage = document.getElementById("mobile-library-page");
  const searchBoxTrigger = document.getElementById("mobile-search-box-trigger");
  const searchInputPage = document.getElementById("mobile-search-input-page");
  const mobileSearchInput = document.getElementById("mobile-search-input");
  const searchBackBtn = document.getElementById("mobile-search-back-btn");
  const resultsContainer = document.getElementById("mobile-search-results");
  const resultsHeading = document.getElementById("mobile-search-results-heading");
  const quickSection = document.querySelector(".quick-section");
  const contentFooter = document.querySelector(".content-footer");

  if (!navLinks.length || !searchPage) return;

  function hideAllMobilePages() {
    if (topbarDefault) topbarDefault.style.display = "none";
    if (topbarLibrary) topbarLibrary.style.display = "none";
    if (topbarSearch) topbarSearch.style.display = "none";
    if (searchPage) searchPage.style.display = "none";
    if (libraryPage) libraryPage.style.display = "none";
    document.querySelectorAll(".album-container").forEach(el => el.style.display = "none");
    document.querySelectorAll(".section-title").forEach(el => el.style.display = "none");
    if (quickSection) quickSection.style.display = "none";
    if (contentFooter) contentFooter.style.display = "none";
  }

  function showHomeView() {
    hideAllMobilePages();
    if (topbarDefault) topbarDefault.style.display = "flex";
    if (quickSection) quickSection.style.display = "block";
    if (contentFooter) contentFooter.style.display = "block";
    document.querySelectorAll(".album-container").forEach(el => el.style.display = "flex");
    document.querySelectorAll(".section-title").forEach(el => el.style.display = "flex");
  }

  function showLibraryView() {
    hideAllMobilePages();
    if (topbarLibrary) topbarLibrary.style.display = "flex";
    if (libraryPage) libraryPage.style.display = "block";
    populateMobileLibList();
  }

  function showSearchView() {
    hideAllMobilePages();
    if (topbarSearch) topbarSearch.style.display = "flex";
    if (searchPage) searchPage.style.display = "block";
  }

  function renderSearchResults(query) {
    renderSearchResultsInto(resultsContainer, resultsHeading, query, () => {
      renderSearchResults(mobileSearchInput ? mobileSearchInput.value.trim() : "");
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const label = link.querySelector("span")?.innerText.trim().toLowerCase();

      if (label === "your library") {
        showLibraryView();
      } else if (label === "home") {
        showHomeView();
      } else if (label === "search") {
        showSearchView();
      }

      const contentPanel = document.querySelector(".content");
      if (contentPanel) contentPanel.scrollTo({ top: 0, behavior: "auto" });
    });
  });

  if (searchBoxTrigger) {
    searchBoxTrigger.addEventListener("click", () => {
      searchInputPage.style.display = "flex";
      renderSearchResults("");
      if (mobileSearchInput) {
        mobileSearchInput.value = "";
        mobileSearchInput.focus();
      }
    });
  }

  if (searchBackBtn) {
    searchBackBtn.addEventListener("click", () => {
      searchInputPage.style.display = "none";
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener("input", (e) => {
      renderSearchResults(e.target.value.trim());
    });
  }
}

function applyMobilePlayerColors(color) {
  const playerEl = document.querySelector(".player");
  console.log("applyMobilePlayerColors called with:", color, "| isMobileView:", isMobileView());

  if (!isMobileView()) {
    if (playerEl) playerEl.style.background = "";
    if (fullscreenPlayerEl) fullscreenPlayerEl.style.background = "";
    return;
  }

  const darker = mixColor(color, "#1a1a1a", 0.5);
  console.log("Computed darker shade:", darker);

  if (playerEl) {
    playerEl.style.background = `linear-gradient(135deg, ${color}, ${darker})`;
  }
  if (fullscreenPlayerEl) {
    fullscreenPlayerEl.style.background = `linear-gradient(180deg, ${color} 0%, #1a1a1a 55%, #121212 100%)`;
  }
}


// Track Loading & Playback Controls
function loadTrack(index) {
  const track = songDatabase[index];
  if (!track) return;
  localStorage.setItem("lastTrackIndex", index);
  audioPlayer.src = track.audioUrl;
  
  // Update Playbar UI
  if (trackTitle) {
    trackTitle.innerHTML = `<span class="scroll-inner">${track.title}</span>`;
  }
  if (trackArtist) {
    trackArtist.innerHTML = `<span class="scroll-inner">${track.artist}</span>`;
  }
  if (trackCover) trackCover.src = track.cover;

  // Reset progress UI
  if (progressSlider) progressSlider.value = 0;
  if (currentTimeLabel) currentTimeLabel.innerText = "0:00";
  if (totalTimeLabel) totalTimeLabel.innerText = "0:00";
  updateSliderGradient(progressSlider, 0);
  updateMobileProgressBar(0); 
  if (fsCover) fsCover.src = track.cover;
  if (fsTrackTitle) fsTrackTitle.innerText = track.title;
  if (fsTrackArtist) fsTrackArtist.innerText = track.artist;
  if (fsPlayingFromLabel) fsPlayingFromLabel.innerText = track.playingFromLabel || "PLAYING FROM ALBUM";
  if (fsPlayingFromTitle) fsPlayingFromTitle.innerText = track.playingFromTitle || track.title;
  if (fsProgressSlider) {
    fsProgressSlider.value = 0;
    fsProgressSlider.style.background = `rgba(255,255,255,0.35)`;
  }
  if (fsCurrentTime) fsCurrentTime.innerText = "0:00";
  if (fsTotalTime) fsTotalTime.innerText = "0:00";
  console.log("Loading track:", track.title, "| color:", track.color);
  applyMobilePlayerColors(track.color || "#7b3f61");
  // Sync active states across cards
  syncCardActiveStates();

  // Update scroll marquee state
  updateFooterScrollState();

}

function playTrack() {
  audioPlayer.play()
    .then(() => {
      isPlaying = true;
      if (playPauseBtn) {
        const img = playPauseBtn.querySelector("img");
          img.src = "./spotifyimages/pause_musicbar.png";
          img.alt = "Pause";
      }
      syncMobilePlayIcon();
      if (fsPlayBtn) fsPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      const playerLeft = document.querySelector(".player-left");
      if (playerLeft) {
        playerLeft.style.visibility = "visible";
      }
      syncCardActiveStates();
      updateFooterScrollState();
    })
    .catch(err => {
      console.warn("Audio playback failed or was interrupted:", err);
    });
}
window.addEventListener("resize", () => {
  const track = songDatabase[currentTrackIndex];
  if (track) applyMobilePlayerColors(track.color || "#7b3f61");
});

function pauseTrack() {
  audioPlayer.pause();
  isPlaying = false;
  if (playPauseBtn) {
    const img = playPauseBtn.querySelector("img");
    img.src = "./spotifyimages/play_musicbar.png";
    img.alt = "Play";
  }
  syncMobilePlayIcon();
  if (fsPlayBtn) fsPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  syncCardActiveStates();
  updateFooterScrollState();
}

function togglePlay() {
  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
}

function nextTrack() {
  if (songDatabase.length === 0) return;
  if (isShuffle) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * songDatabase.length);
    } while (randomIndex === currentTrackIndex && songDatabase.length > 1);
    currentTrackIndex = randomIndex;
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % songDatabase.length;
  }
  loadTrack(currentTrackIndex);
  playTrack();
}

function prevTrack() {
  if (songDatabase.length === 0) return;
  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
  } else {
    currentTrackIndex = (currentTrackIndex - 1 + songDatabase.length) % songDatabase.length;
    loadTrack(currentTrackIndex);
    playTrack();
  }
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  if (shuffleBtn) shuffleBtn.classList.toggle("active", isShuffle);
  if (fsShuffleBtn) fsShuffleBtn.classList.toggle("active", isShuffle);
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  if (repeatBtn) repeatBtn.classList.toggle("active", isRepeat);
  if (fsRepeatBtn) fsRepeatBtn.classList.toggle("active", isRepeat);
}

// Time and Seek Progression
function updateProgressBar() {
  if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;

  const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  if (progressSlider) {
    progressSlider.value = progressPercent;
    updateSliderGradient(progressSlider, progressPercent);
  }
  if (currentTimeLabel) {
    currentTimeLabel.innerText = formatTime(audioPlayer.currentTime);
  }
  if (fsProgressSlider) {
    fsProgressSlider.value = progressPercent;
    fsProgressSlider.style.background = `linear-gradient(to right, #ffffff ${progressPercent}%, rgba(255,255,255,0.35) ${progressPercent}%)`;
  }
  if (fsCurrentTime) fsCurrentTime.innerText = formatTime(audioPlayer.currentTime);
  updateMobileProgressBar(progressPercent); 
}

// Timeline Hover Tooltip logic
function handleTimelineHover(e) {
  if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;

  const rect = progressSlider.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const width = rect.width;
  const ratio = Math.max(0, Math.min(1, mouseX / width));
  const hoverTimeSeconds = ratio * audioPlayer.duration;
  
  if (timelineTooltip) {
    timelineTooltip.innerText = formatTime(hoverTimeSeconds);
    timelineTooltip.style.left = `${ratio * 100}%`;
    timelineTooltip.classList.add("visible");
  }
}

function handleTimelineLeave() {
  if (timelineTooltip) {
    timelineTooltip.classList.remove("visible");
  }
}

function updateDuration() {
  if (totalTimeLabel && audioPlayer.duration && !isNaN(audioPlayer.duration)) {
    totalTimeLabel.innerText = formatTime(audioPlayer.duration);
  }
  if (fsTotalTime && audioPlayer.duration && !isNaN(audioPlayer.duration)) {
    fsTotalTime.innerText = formatTime(audioPlayer.duration);
  }
}

// Soft sliding seeking for progress slider
let isSeekingProgress = false;
let rafSeekId = null;
let seekAnimFromPercent = 0;
let seekAnimToPercent = 0;
let seekAnimStartTs = 0;
const SOFT_SEEK_DURATION_MS = 180; // feel: soft, not instant

function percentToTimeSeconds(percent) {
  if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return 0;
  return (percent / 100) * audioPlayer.duration;
}

function timeSecondsToPercent(seconds) {
  if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return 0;
  return (seconds / audioPlayer.duration) * 100;
}

function animateSeekPercent(targetPercent) {
  if (!progressSlider) return;
  if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;

  const startPercent = Number(progressSlider.value) || 0;
  seekAnimFromPercent = startPercent;
  seekAnimToPercent = Math.max(0, Math.min(100, targetPercent));
  seekAnimStartTs = performance.now();

  const step = (now) => {
    const t = Math.min(1, (now - seekAnimStartTs) / SOFT_SEEK_DURATION_MS);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);
    const currentPercent = seekAnimFromPercent + (seekAnimToPercent - seekAnimFromPercent) * eased;

    // UI updates (smooth)
    progressSlider.value = currentPercent;
    updateSliderGradient(progressSlider, currentPercent);

    // Label updates (smooth)
    if (currentTimeLabel) {
      const sec = percentToTimeSeconds(currentPercent);
      currentTimeLabel.innerText = formatTime(sec);
    }

    // Apply audio time gently while dragging
    // (keeps it in sync without harsh jumping)
    audioPlayer.currentTime = percentToTimeSeconds(currentPercent);

    if (t < 1) {
      rafSeekId = requestAnimationFrame(step);
    } else {
      rafSeekId = null;
    }
  };

  if (rafSeekId) cancelAnimationFrame(rafSeekId);
  rafSeekId = requestAnimationFrame(step);
}

function handleTimelinePointerDown(e) {
  if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;
  if (!progressSlider) return;

  e.preventDefault();
  isSeekingProgress = true;
  progressSlider.classList.add("soft-dragging");

  // capture pointer so drag continues outside the slider
  try {
    progressSlider.setPointerCapture(e.pointerId);
  } catch {}

  const updateFromPointer = (clientX) => {
    const rect = progressSlider.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetPercent = ratio * 100;
    animateSeekPercent(targetPercent);

    // keep tooltip aligned
    if (timelineTooltip) {
      const hoverSeconds = ratio * audioPlayer.duration;
      timelineTooltip.innerText = formatTime(hoverSeconds);
      timelineTooltip.style.left = `${ratio * 100}%`;
      timelineTooltip.classList.add("visible");
    }
  };

  updateFromPointer(e.clientX);

  const onPointerMove = (ev) => {
    if (!isSeekingProgress) return;
    updateFromPointer(ev.clientX);
  };

  const onPointerUp = (ev) => {
    if (!isSeekingProgress) return;
    isSeekingProgress = false;
    progressSlider.classList.remove("soft-dragging");

    // finalize exact position
    const rect = progressSlider.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
    const finalPercent = ratio * 100;

    if (rafSeekId) {
      cancelAnimationFrame(rafSeekId);
      rafSeekId = null;
    }

    progressSlider.value = finalPercent;
    updateSliderGradient(progressSlider, finalPercent);

    if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
      audioPlayer.currentTime = percentToTimeSeconds(finalPercent);
    }

    if (timelineTooltip) {
      // hide when leaving interaction
      timelineTooltip.classList.remove("visible");
    }

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  };

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
}


function handleTrackEnded() {
  if (isRepeat) {
    audioPlayer.currentTime = 0;
    playTrack();
  } else {
    nextTrack();
  }
}

// Helper: Format Seconds to MM:SS
function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Volume Mechanics
function handleVolumeInput(e) {
  const volumeValue = e.target.value / 100;
  audioPlayer.volume = volumeValue;
  updateVolumeUI(volumeValue);
}

function updateVolumeUI(volume) {
  if (volumeSlider) {
    const percent = volume * 100;
    volumeSlider.value = percent;
    updateSliderGradient(volumeSlider, percent);
  }

  // Update volume icon class and tooltip
  if (volumeBtn) {
    let iconHTML = '';
    let tooltipText = 'Mute';
    if (volume === 0) {
      iconHTML = '<i class="bi bi-volume-down-xmark"></i>';
      tooltipText = 'Unmute';
    } else if (volume < 0.3) {
      iconHTML = '<i class="bi bi-volume-off"></i>';
    } else if (volume < 0.7) {
      iconHTML = '<i class="bi bi-volume-down"></i>';
    } else {
      iconHTML = '<i class="bi bi-volume-up"></i>';
    }
    volumeBtn.innerHTML = iconHTML;
    volumeBtn.setAttribute("data-tooltip", tooltipText);
  }
}

function toggleMute() {
  if (audioPlayer.volume > 0) {
    previousVolume = audioPlayer.volume;
    audioPlayer.volume = 0;
    updateVolumeUI(0);
  } else {
    audioPlayer.volume = previousVolume;
    updateVolumeUI(previousVolume);
  }
}

// Updates the thin progress line inside the mobile floating mini-player
function updateMobileProgressBar(percent) {
  const fill = document.querySelector(".mobile-progress-fill");
  if (fill) {
    fill.style.width = `${percent}%`;
  }
}
// Set range slider background gradients dynamically to simulate filled green bar
function updateSliderGradient(slider, percent) {
  if (!slider) return;

  const fillColor = slider.matches(":hover") ? "#1ed760" : "#ffffff";

  slider.style.background = `
    linear-gradient(
      to right,
      ${fillColor} 0%,
      ${fillColor} ${percent}%,
      #4d4d4d ${percent}%,
      #4d4d4d 100%
    )
  `;
}
function isMobileView() {
  return window.matchMedia("(max-width: 768px)").matches;
}
function setupCardInteractions() {
  albumCards.forEach(card => {
    const trackId = parseInt(card.getAttribute("data-track-id"));
    const cardPlayBtn = card.querySelector(".album-play-btn");

    if (cardPlayBtn) {
      cardPlayBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentTrackIndex === trackId) {
          if (isMobileView()) {
            if (!isPlaying) playTrack();
            openFullScreenPlayer();
          } else {
            togglePlay();
          }
        } else {
          currentTrackIndex = trackId;
          loadTrack(currentTrackIndex);
          playTrack();
          if (isMobileView()) openFullScreenPlayer();
        }
      });
    }

    card.addEventListener("click", () => {
      if (currentTrackIndex === trackId) {
        if (isMobileView()) {
          if (!isPlaying) playTrack();
          openFullScreenPlayer();
        } else {
          togglePlay();
        }
      } else {
        currentTrackIndex = trackId;
        loadTrack(currentTrackIndex);
        playTrack();
        if (isMobileView()) openFullScreenPlayer();
      }
    });
  });
}

// Blends a hex color toward a target hex color by a weight (0 = original, 1 = target)
function mixColor(hex, targetHex, weight) {
  const r1 = parseInt(hex.slice(1, 3), 16);
  const g1 = parseInt(hex.slice(3, 5), 16);
  const b1 = parseInt(hex.slice(5, 7), 16);

  const r2 = parseInt(targetHex.slice(1, 3), 16);
  const g2 = parseInt(targetHex.slice(3, 5), 16);
  const b2 = parseInt(targetHex.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * weight);
  const g = Math.round(g1 + (g2 - g1) * weight);
  const b = Math.round(b1 + (b2 - b1) * weight);

  return `rgb(${r}, ${g}, ${b})`;
}


// ---- Manual JS-driven gradient/color animation (avoids browser gradient-transition bugs) ----

let currentAccentStops = [hexToRgb("#181818"), hexToRgb("#181818"), hexToRgb("#121212")];
let accentAnimFrame = null;

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

function rgbToCss(rgb) {
  return `rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`;
}

function lerpColor(c1, c2, t) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t
  ];
}

// Writes the SAME computed colors to header + section in the SAME frame — guaranteed sync
function paintAccent(stopsRgb) {
  const header = document.querySelector(".quick-header");
  const section = document.querySelector(".quick-section");
  const c1 = rgbToCss(stopsRgb[0]);
  const c2 = rgbToCss(stopsRgb[1]);
  const c3 = rgbToCss(stopsRgb[2]);

  if (header) header.style.background = c1;
  if (section) {
    section.style.background = `linear-gradient(to bottom, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
  }
}

function animateAccentTo(targetStopsRgb, duration = 600) {
  if (accentAnimFrame) cancelAnimationFrame(accentAnimFrame);

  const startStops = currentAccentStops.map(c => c.slice());
  const startTime = performance.now();

  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic

    const interpolated = startStops.map((startColor, i) =>
      lerpColor(startColor, targetStopsRgb[i], eased)
    );

    paintAccent(interpolated);

    if (t < 1) {
      accentAnimFrame = requestAnimationFrame(step);
    } else {
      currentAccentStops = targetStopsRgb.map(c => c.slice());
      accentAnimFrame = null;
    }
  }

  accentAnimFrame = requestAnimationFrame(step);
}

// Utility: darkens/lightens a hex color by a percent (-100 to 100)
function shadeColor(hex, percent) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.min(255, Math.max(0, r + Math.round((percent / 100) * 255)));
  g = Math.min(255, Math.max(0, g + Math.round((percent / 100) * 255)));
  b = Math.min(255, Math.max(0, b + Math.round((percent / 100) * 255)));

  return `rgb(${r}, ${g}, ${b})`;
}
// Quick Picks Card interactions
function setupQuickCardInteractions() {
  quickCards.forEach(card => {
    const trackId = parseInt(card.getAttribute("data-track-id"));
    const playBtn = card.querySelector(".quick-play");

    // Inject the green "now playing" animated bars once per card
    if (!card.querySelector(".quick-eq")) {
      const eq = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      eq.setAttribute("class", "quick-eq");
      eq.setAttribute("viewBox", "0 0 14 14");

      const barWidths = [2, 2, 2, 2];
      const barX = [0, 4, 8, 12];
      barWidths.forEach((w, i) => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", barX[i]);
        rect.setAttribute("y", "0");
        rect.setAttribute("width", w);
        rect.setAttribute("height", "14");
        eq.appendChild(rect);
      });

      card.appendChild(eq);
    }
// Track hover state so CSS can decide: show button on hover, show icon otherwise
    card.addEventListener("mouseenter", () => {
      card.classList.add("hovering");
      const color = card.getAttribute("data-color");
      if (color) {
        const base = hexToRgb(color);
        const pageBg = hexToRgb("#121212");
        const midStop = lerpColor(base, pageBg, 0.55);
        animateAccentTo([base, midStop, pageBg], 600);
      }
    });
    card.addEventListener("mouseleave", () => {
  card.classList.remove("hovering");
  const defaultStops = [hexToRgb("#181818"), hexToRgb("#181818"), hexToRgb("#121212")];
  animateAccentTo(defaultStops, 600);
});

    const handlePlay = (e) => {
  if (e) e.stopPropagation();
  if (currentTrackIndex === trackId) {
    if (isMobileView()) {
      if (!isPlaying) playTrack();
      openFullScreenPlayer();
    } else {
      togglePlay();
    }
  } else {
    currentTrackIndex = trackId;
    loadTrack(currentTrackIndex);
    playTrack();
    if (isMobileView()) openFullScreenPlayer();
  }
};

    if (playBtn) playBtn.addEventListener("click", handlePlay);
    card.addEventListener("click", handlePlay);
  });
}

// Active Card State Management
function syncCardActiveStates() {
  albumCards.forEach(card => {
    const trackId = parseInt(card.getAttribute("data-track-id"));
    const cardPlayBtn = card.querySelector(".album-play-btn");
    const titleText = card.querySelector("h3");

    if (trackId === currentTrackIndex && isPlaying) {
      card.classList.add("playing-card");
      
      if (cardPlayBtn) {
        cardPlayBtn.style.opacity = "1";
        cardPlayBtn.style.transform = "translateY(0)";
        cardPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      }
    } else {
      card.classList.remove("playing-card");
      if (cardPlayBtn) {
        cardPlayBtn.style.opacity = "";
        cardPlayBtn.style.transform = "";
        cardPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    }
  });
  // NEW: same logic for Quick Picks cards
  quickCards.forEach(card => {
    const trackId = parseInt(card.getAttribute("data-track-id"));
    const quickPlayBtn = card.querySelector(".quick-play");

    if (trackId === currentTrackIndex && isPlaying) {
      card.classList.add("playing-card");
      if (quickPlayBtn) {
        quickPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      }
    } else {
      card.classList.remove("playing-card");
      if (quickPlayBtn) {
        quickPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    }
  });
}

// Footer Scroll / Marquee State Management
function updateFooterScrollState() {
  setTimeout(() => {
    checkAndSetupScroll(trackTitle);
    checkAndSetupScroll(trackArtist);
  }, 50);
}

function checkAndSetupScroll(element) {
  if (!element) return;
  const inner = element.querySelector(".scroll-inner");
  if (!inner) return;

  inner.classList.remove("animating");
  
  const parentWidth = element.clientWidth;
  const innerWidth = inner.offsetWidth;

  if (innerWidth > parentWidth && isPlaying) {
    inner.style.setProperty("--container-width", `${parentWidth}px`);
    inner.classList.add("animating");
  }
}



// Sidebar Pills & Interactions
function setupLibraryInteractions() {
  if (likeBtn) {
    likeBtn.addEventListener("click", () => {
      likeBtn.classList.toggle("active");
      const isLiked = likeBtn.classList.contains("active");
      likeBtn.innerHTML = isLiked ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-regular fa-plus"></i>';
      likeBtn.setAttribute("data-tooltip", isLiked ? "Remove from Liked Songs" : "Add to Liked Songs");
    });
  }

  // Library pills filtering with click-to-deactivate
  const libPills = document.querySelectorAll(".lib-pill");
  libPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const wasActive = pill.classList.contains("active");
      
      libPills.forEach(p => p.classList.remove("active"));
      
      let filterType = "all";
      if (!wasActive) {
        pill.classList.add("active");
        filterType = pill.innerText.toLowerCase();
      }
      
      const items = document.querySelectorAll(".lib-item");
      items.forEach(item => {
        if (filterType === "playlists") {
          if (item.classList.contains("playlist") || item.classList.contains("folder")) {
            item.style.display = "flex";
          } else {
            item.style.display = "none";
          }
        } else if (filterType === "artists") {
          if (item.classList.contains("artist")) {
            item.style.display = "flex";
          } else {
            item.style.display = "none";
          }
        } else {
          item.style.display = "flex";
        }
      });
    });
  });

  // Home button action (scroll to top)
  const homeBtn = document.querySelector(".home-icon");
  const contentPanel = document.querySelector(".content");

  if (homeBtn && contentPanel) {
    homeBtn.addEventListener("click", () => {
      contentPanel.scrollTo({ top: 0, behavior: "smooth" });
      if (searchInput) {
        searchInput.value = "";
      }
    });
  }
}


// Run Player on DOM Content Loaded
document.addEventListener("DOMContentLoaded", initPlayer);
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    const mainContent = document.getElementById("main-content");

    window.addEventListener("load", () => {
        setTimeout(() => {
            loader.style.opacity = "0";

            setTimeout(() => {
                loader.style.display = "none";
                mainContent.style.display = "flex";
            }, 800);

        }, 1000); // Loader visible for 1 seconds
    });
});

function setupTabletTooltips() {
  const wraps = document.querySelectorAll(".tablet-icon-wrap");
  const EDGE_MARGIN = 8;

  wraps.forEach(wrap => {
    const tooltip = wrap.querySelector(".tablet-tooltip");
    if (!tooltip) return;

    document.body.appendChild(tooltip);

    wrap.addEventListener("mouseenter", () => {
      const rect = wrap.getBoundingClientRect();

      // Render first so we can measure real height
      tooltip.style.left = (rect.right + 14) + "px";
      tooltip.style.top = "0px";
      tooltip.style.transform = "none";
      tooltip.classList.add("visible");

      const tooltipHeight = tooltip.offsetHeight;
      let idealTop = rect.top + rect.height / 2 - tooltipHeight / 2;

      const maxTop = window.innerHeight - tooltipHeight - EDGE_MARGIN;
      idealTop = Math.max(EDGE_MARGIN, Math.min(idealTop, maxTop));

      tooltip.style.top = `${idealTop}px`;
    });

    wrap.addEventListener("mouseleave", () => {
      tooltip.classList.remove("visible");
    });
  });
}
// Sidebar collapse/expand toggle (Your Library <-> tablet icon rail)
function setupSidebarToggle() {
  const fullSidebar = document.getElementById("full-sidebar");
  const tabletSidebar = document.getElementById("tablet-sidebar");
  const collapseBtn = document.getElementById("collapse-sidebar-btn");
  const expandBtn = document.getElementById("expand-sidebar-btn");

  if (!fullSidebar || !tabletSidebar || !collapseBtn || !expandBtn) return;

  collapseBtn.addEventListener("click", () => {
    fullSidebar.classList.add("manually-hidden");
    tabletSidebar.classList.add("manually-shown");
  });

  expandBtn.addEventListener("click", () => {
    fullSidebar.classList.remove("manually-hidden");
    tabletSidebar.classList.remove("manually-shown");
  });
}
// Show mobile-only compact controls (device, like/plus, play-pause) inside player-right
let mobilePlayIcon = null;
let mobileLikeIcon = null;

function setupMobileMiniPlayerButton() {
  const playerRight = document.querySelector(".player-right");
  if (!playerRight || document.getElementById("mobile-play-btn")) return;

  // Device button — forwards to the real device/repeat control
  const deviceBtn = document.createElement("button");
  deviceBtn.id = "mobile-device-btn";
  deviceBtn.className = "mobile-icon-btn";
  deviceBtn.setAttribute("aria-label", "Connect to a device");
  deviceBtn.innerHTML = '<img src="./spotifyimages/device.png" alt="Device">';
  deviceBtn.addEventListener("click", () => {
    if (repeatBtn) repeatBtn.click();
  });

  // Like / plus button — forwards to the real like control
  const mobileLikeBtn = document.createElement("button");
  mobileLikeBtn.id = "mobile-like-btn";
  mobileLikeBtn.className = "mobile-icon-btn";
  mobileLikeBtn.setAttribute("aria-label", "Add to Liked Songs");
  mobileLikeBtn.innerHTML = '<i class="fa-regular fa-plus"></i>';
  mobileLikeIcon = mobileLikeBtn.querySelector("i");
  mobileLikeBtn.addEventListener("click", () => {
    if (likeBtn) likeBtn.click();
    syncMobileLikeIcon();
  });

  // Play/pause button — drives playback directly
  const btn = document.createElement("button");
  btn.id = "mobile-play-btn";
  btn.className = "mobile-play-btn";
  btn.setAttribute("aria-label", "Play");
  btn.innerHTML = '<i class="fa-solid fa-play"></i>';
  mobilePlayIcon = btn.querySelector("i");
  btn.addEventListener("click", togglePlay);

  playerRight.appendChild(deviceBtn);
  playerRight.appendChild(mobileLikeBtn);
  playerRight.appendChild(btn);

  syncMobileLikeIcon();
  syncMobilePlayIcon();
}
 function setupFullScreenPlayer() {
  fullscreenPlayerEl = document.getElementById("mobile-fullscreen-player");
  fsCollapseBtn = document.getElementById("fs-collapse-btn");
  fsPlayingFromLabel = document.getElementById("fs-playing-from-label");
  fsPlayingFromTitle = document.getElementById("fs-playing-from-title");
  fsCover = document.getElementById("fs-cover");
  fsTrackTitle = document.getElementById("fs-track-title");
  fsTrackArtist = document.getElementById("fs-track-artist");
  fsLikeBtn = document.getElementById("fs-like-btn");
  fsProgressSlider = document.getElementById("fs-progress-slider");
  fsCurrentTime = document.getElementById("fs-current-time");
  fsTotalTime = document.getElementById("fs-total-time");
  fsShuffleBtn = document.getElementById("fs-shuffle-btn");
  fsPrevBtn = document.getElementById("fs-prev-btn");
  fsPlayBtn = document.getElementById("fs-play-btn");
  fsNextBtn = document.getElementById("fs-next-btn");
  fsRepeatBtn = document.getElementById("fs-repeat-btn");

  if (!fullscreenPlayerEl) return;

  if (fsCollapseBtn) {
    fsCollapseBtn.addEventListener("click", () => {
      fullscreenPlayerEl.classList.remove("open");
    });
  }

  if (fsPlayBtn) fsPlayBtn.addEventListener("click", togglePlay);
  if (fsPrevBtn) fsPrevBtn.addEventListener("click", prevTrack);
  if (fsNextBtn) fsNextBtn.addEventListener("click", nextTrack);
  if (fsShuffleBtn) fsShuffleBtn.addEventListener("click", toggleShuffle);
  if (fsRepeatBtn) fsRepeatBtn.addEventListener("click", toggleRepeat);

  if (fsLikeBtn) {
    fsLikeBtn.addEventListener("click", () => {
      if (likeBtn) likeBtn.click();
      const isLiked = likeBtn && likeBtn.classList.contains("active");
      fsLikeBtn.innerHTML = isLiked
        ? '<i class="bi bi-check-circle-fill"></i>'
        : '<i class="bi bi-plus-circle"></i>';
    });
  }

  if (fsProgressSlider) {
    fsProgressSlider.addEventListener("input", (e) => {
      if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;
      const percent = e.target.value;
      audioPlayer.currentTime = (percent / 100) * audioPlayer.duration;
    });
  }

  // Tap the mini player (not its buttons) to reopen full screen
  const playerFooter = document.querySelector(".player");
  if (playerFooter) {
    playerFooter.addEventListener("click", (e) => {
      if (!isMobileView()) return;
      if (e.target.closest("button") || e.target.closest("input")) return;
      openFullScreenPlayer();
    });
  }
}

function openFullScreenPlayer() {
  if (!fullscreenPlayerEl || !isMobileView()) return;
  fullscreenPlayerEl.classList.add("open");
}
// Keep the mobile play/pause icon in sync with playback state
function syncMobilePlayIcon() {
  if (!mobilePlayIcon) return;
  mobilePlayIcon.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
}

// Keep the mobile like icon in sync with the real like button
function syncMobileLikeIcon() {
  if (!mobileLikeIcon || !likeBtn) return;
  const isLiked = likeBtn.classList.contains("active");
  mobileLikeIcon.className = isLiked ? "fa-solid fa-circle-check" : "fa-regular fa-plus";
}
function setupIconTooltips() {
  const wraps = document.querySelectorAll(".lib-collapse-icon, .lib-btn, .lib-btn-plus");
  const EDGE_MARGIN = 8; // minimum gap from viewport edge

  wraps.forEach(wrap => {
    const tooltip = wrap.querySelector(".icon-tooltip");
    if (!tooltip) return;

    document.body.appendChild(tooltip);

    wrap.addEventListener("mouseenter", () => {
      const rect = wrap.getBoundingClientRect();

      // Make it visible first (off-screen calc) so we can measure real width
      tooltip.style.left = "0px";
      tooltip.style.top = `${rect.top - 36}px`;
      tooltip.style.transform = "translateX(0)";
      tooltip.classList.add("visible");

      // Now measure actual rendered width
      const tooltipWidth = tooltip.offsetWidth;
      let idealLeft = rect.left + rect.width / 2 - tooltipWidth / 2;

      // Clamp so it never overflows either edge
      const maxLeft = window.innerWidth - tooltipWidth - EDGE_MARGIN;
      idealLeft = Math.max(EDGE_MARGIN, Math.min(idealLeft, maxLeft));

      tooltip.style.left = `${idealLeft}px`;
    });

    wrap.addEventListener("mouseleave", () => {
      tooltip.classList.remove("visible");
    });
  });
}
function setupSideTooltips() {
  const wraps = document.querySelectorAll(".tablet-logo, .tablet-add-btn");
  const EDGE_MARGIN = 8;
  const GAP = 14;

  wraps.forEach(wrap => {
    const tooltip = wrap.querySelector(".side-tooltip");
    if (!tooltip) return;

    document.body.appendChild(tooltip);

    wrap.addEventListener("mouseenter", () => {
      const rect = wrap.getBoundingClientRect();

      tooltip.style.left = `${rect.right + GAP}px`;
      tooltip.style.top = "0px";
      tooltip.classList.add("visible");

      const tooltipHeight = tooltip.offsetHeight;
      let idealTop = rect.top + rect.height / 2 - tooltipHeight / 2;
      const maxTop = window.innerHeight - tooltipHeight - EDGE_MARGIN;
      idealTop = Math.max(EDGE_MARGIN, Math.min(idealTop, maxTop));

      tooltip.style.top = `${idealTop}px`;
    });

    wrap.addEventListener("mouseleave", () => {
      tooltip.classList.remove("visible");
    });
  });
}