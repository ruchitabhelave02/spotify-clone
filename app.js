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
let searchInput, albumCards;

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

  // Parse all album cards dynamically from the DOM
  parseSongCards();

  // Load the first track (default)
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

  // Search filter
  if (searchInput) searchInput.addEventListener("input", handleSearch);

  // Active styles for library items/pills
  setupLibraryInteractions();


}

// Parse album cards to build dynamic playlist
function parseSongCards() {
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
    
    // Select song from mapping (wrap around if index exceeds map size)
    const rawPath = localSongs[index % localSongs.length];
    const audioUrl = encodeURI(rawPath);
    
    songDatabase.push({
      id: index,
      title: title,
      artist: artist,
      cover: cover,
      audioUrl: audioUrl
    });
  });
}

// Track Loading & Playback Controls
function loadTrack(index) {
  const track = songDatabase[index];
  if (!track) return;

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

function pauseTrack() {
  audioPlayer.pause();
  isPlaying = false;
  if (playPauseBtn) {
    const img = playPauseBtn.querySelector("img");
    img.src = "./spotifyimages/play_musicbar.png";
    img.alt = "Play";
  }
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
  if (shuffleBtn) {
    shuffleBtn.classList.toggle("active", isShuffle);
  }
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  if (repeatBtn) {
    repeatBtn.classList.toggle("active", isRepeat);
  }
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

// Setup Card interactions
function setupCardInteractions() {
  albumCards.forEach(card => {
    const trackId = parseInt(card.getAttribute("data-track-id"));
    const cardPlayBtn = card.querySelector(".album-play-btn");

    // Click play button on card
    if (cardPlayBtn) {
      cardPlayBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentTrackIndex === trackId) {
          togglePlay();
        } else {
          currentTrackIndex = trackId;
          loadTrack(currentTrackIndex);
          playTrack();
        }
      });
    }

    // Click card wrapper
    card.addEventListener("click", () => {
      if (currentTrackIndex === trackId) {
        togglePlay();
      } else {
        currentTrackIndex = trackId;
        loadTrack(currentTrackIndex);
        playTrack();
      }
    });
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

// Search Bar Filter
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  albumCards.forEach(card => {
    const title = card.querySelector("h3") ? card.querySelector("h3").innerText.toLowerCase() : "";
    const artist = card.querySelector("p") ? card.querySelector("p").innerText.toLowerCase() : "";

    if (title.includes(searchTerm) || artist.includes(searchTerm)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
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
        albumCards.forEach(c => c.style.display = "block");
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

        }, 2500); // Loader visible for 2.5 seconds
    });
});

// window.addEventListener("load", () => {

//     const loader = document.getElementById("loader");
//     const mainContent = document.getElementById("main-content");

//     setTimeout(() => {

//         loader.style.opacity = "0";

//         setTimeout(() => {
//             loader.style.display = "none";
//             mainContent.style.display = "flex";
//         }, 800);

//     }, 2500);

// });