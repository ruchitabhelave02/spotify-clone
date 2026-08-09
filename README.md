
#  Spotify Web Player Clone

A spotify inspired clone of the Spotify Web Player UI — built with vanilla HTML, CSS, and JavaScript. Fully responsive across mobile, tablet, and desktop, with a working audio player (play/pause, next/prev, shuffle, repeat, seek, and volume).

##  Live Demo

Experience the Spotify Web Player Clone live:

**[ View Live Demo](https://spotify-clone-lyart.vercel.app/)**

##  Features

- **Functional music player** — play/pause, next/previous track, shuffle, repeat, seekable progress bar, and volume control
- **Dynamic track loading** — songs are parsed straight from the DOM (album cards + quick picks) into a playlist database
- **Mini-player** — Compact player interface that allows users to continue controlling music while browsing the application
- **Fullscreen player** — Dedicated fullscreen music player with expanded track information and playback controls
- **Responsive layout** — dedicated experiences for mobile (bottom nav), tablet (collapsible icon rail), and desktop (full sidebar)
- **Collapsible sidebar** — toggle between the full library view and a compact icon rail
- **Rich micro-interactions** — hover tooltips, animated "now playing" equalizer bars, marquee scrolling for long titles, dynamic accent-color backgrounds on hover, and a smooth soft-seek timeline
- **Search & filter** — instantly filter your library by playlists/artists, and search tracks by title or artist


##  Tech Stack

- **HTML5** — semantic structure
- **CSS3** — custom properties, flexbox/grid, media queries (`style.css` + `responsive.css`)
- **Vanilla JavaScript** — no frameworks, powers the entire audio engine and UI state (`app.js`)
- **Font Awesome** & **Bootstrap Icons** for iconography
- **Google Fonts (Poppins)** for typography

##  Screenshots

### Desktop
![Desktop Preview](https://github.com/ruchitabhelave02/spotify-clone/blob/main/desktop_View.png)

### Mobile
![Mobile Preview](https://github.com/ruchitabhelave02/spotify-clone/blob/main/Mobile_View.png)

###  MiniPlayer
![MiniPlayer](https://github.com/ruchitabhelave02/spotify-clone/blob/main/Miniplayer_view.png)

### FullScreen
![Fullscreen](https://github.com/ruchitabhelave02/spotify-clone/blob/main/fullscreen_view.png)

##  Project Structure

```
├── index.html          # Markup & page structure
├── style.css            # Core styles
├── responsive.css       # Mobile/tablet/desktop breakpoints
├── app.js                # Audio engine, UI state, and interactions
├── spotifyimages/       # Icons, covers, and UI images
└── songs/                # Local audio files (.mp3)
```

##  Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/ruchitabhelave02/spotify-clone.git
   cd spotify-clone
   ```
2. **Add your assets**
   Make sure the `spotifyimages/` and `songs/` folders are populated (image and audio files aren't tracked if excluded via `.gitignore`).
3. **Run it**
   Just open `index.html` in your browser — no build step or server required.

   > Tip: for the best experience (and to avoid any local file-access quirks), serve it with a lightweight server:
   > ```bash
   > npx serve .
   > ```

##  Usage

- Click any **album card** or **quick pick** to start playback
- Use the **player bar** at the bottom to control playback, seek, and adjust volume
- Use the **search bar** in the navbar to filter songs by title/artist
- Click the **collapse icon** in the sidebar header to switch to the compact icon rail

##   License

This project is for educational purposes. All Spotify trademarks, logos, and brand assets belong to Spotify AB.

##   Author

**Ruchita Bhelave**

- GitHub: [Ruchita Bhelave](https://github.com/ruchitabhelave02)
- LinkedIn: [Ruchita Bhelave](https://www.linkedin.com/in/ruchita-bhelave-b73137290/)

