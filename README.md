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
    └── docs/            # Resume PDF (linked from the Download Resume buttons)
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

- **Resume**: replace `assets/docs/Naeim-Lotfali-Resume.pdf` (keep the filename, or update the links in `index.html`).
- **Projects**: each project is a `.featured-project` or `.project-card` block in `index.html`.
- **Colors/theme**: edit the CSS variables in the `:root` block of `css/style.css`.
