# Naeim Lotfali — Portfolio

Personal portfolio website for Naeim Lotfali, Flutter & Mobile Application Developer.

A fast, dependency-free static site (plain HTML/CSS/JS) — no build step, no framework.

## Structure

```
naeim-portfolio/
├── index.html           # Single-page site (all sections)
├── css/style.css        # All styles, CSS variables at the top for theming
├── js/main.js           # Nav, scroll effects, reveal animations
└── assets/
    ├── images/          # Profile photo, project screenshots, logos, favicon
    └── docs/            # resume.html — source for the resume PDF
                         # Naeim-Lotfali-Resume.pdf — linked from the Download Resume buttons
```

## Run locally

Just open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

Any static host works. The simplest options:

- **GitHub Pages** — push this folder to a repo named `naeimlotfali.github.io` (or enable Pages on any repo, branch `main`, folder `/`). The site is then live at `https://naeimlotfali.github.io`.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder or connect the repo; no build command needed.

## Updating content

- **Resume**: edit `assets/docs/resume.html`, then regenerate the PDF (keep the filename, or update the links in `index.html`):

  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf=assets/docs/Naeim-Lotfali-Resume.pdf assets/docs/resume.html
  ```

- **Projects**: each project is a `.featured-project`, `.gallery-project`, or `.project-card` block in `index.html`.
- **Galleries**: a `.gallery` element declares its own `data-images`, `data-captions`, and `data-alt`; `js/main.js` wires up every one it finds. Add `.dark` for landscape captures that should be letterboxed rather than cropped.
- **Colors/theme**: edit the CSS variables in the `:root` block of `css/style.css`.
