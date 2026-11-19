# Naeim Lotfali — Portfolio

Personal portfolio for Naeim Lotfali, Flutter & Mobile Application Developer.

A fast, dependency-free static site (plain HTML/CSS/JS) — no build step, no framework. Light and dark themes, keyboard- and screen-reader-friendly, with all content readable even if JavaScript fails.

## Structure

```
naeim-portfolio/
├── index.html           # Single-page site (all sections)
├── css/style.css        # All styles; design tokens at the top of the file
├── js/main.js           # Theme toggle, mobile menu, nav highlighting, galleries, lightbox
└── assets/
    ├── images/          # Portrait, project screenshots, icons, favicon, og.png
    └── docs/            # resume.html  → source for the résumé PDF
                         # og.html      → source for assets/images/og.png (social card)
                         # Naeim-Lotfali-Resume.pdf — linked from the Résumé buttons
```

## Run locally

Open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

Any static host works.

- **GitHub Pages** — this repo already has a workflow (`.github/workflows/static.yml`) that deploys `main`.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder or connect the repo; no build command needed.

## Updating content

- **Résumé**: edit `assets/docs/resume.html`, then regenerate the PDF (keep the filename, or update the links in `index.html`):

  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf=assets/docs/Naeim-Lotfali-Resume.pdf assets/docs/resume.html
  ```

- **Social card**: edit `assets/docs/og.html`, then regenerate `assets/images/og.png` (1200×630):

  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1200,630 --virtual-time-budget=8000 --screenshot=assets/images/og.png assets/docs/og.html
  ```

- **Featured projects** (`#work`): each is an `<article class="case">` — a left column with role, year, status and links, and a right column with the media, a short summary, highlights and stack.
- **Open-source packages** (`#open-source`): one `<li class="oss-row">` each.
- **Earlier work** (`#earlier`): one `<li class="arch">` each. Give the thumbnail button `data-zoom` and `data-caption` to make it open in the lightbox; use `arch-thumb--icon` for items that only have an app icon.
- **Galleries**: a `<figure data-gallery>` declares its own `data-images`, `data-captions` and `data-alt` (pipe-separated); `js/main.js` wires up every one it finds. Modifiers: `gallery--phones` (tall phone mock-ups, letterboxed) and `gallery--dark` (landscape game captures, letterboxed). Without a modifier, screenshots are cropped to fit.
- **Colours / type**: edit the custom properties in the `:root` blocks of `css/style.css` (light, `[data-theme='dark']`, and the matching `prefers-color-scheme` block).
