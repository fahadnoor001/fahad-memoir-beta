# CLAUDE.md

Context for Claude Code sessions working on this repository. Read this first before making changes.

## What this repo is

A personal memoir and digital business card for Fahad — a static website (no build step, no framework) with four pages:

- `index.html` — Biography (Houston)
- `powerlifting.html` — Powerlifting
- `growth.html` — Growth
- `contact.html` — Contact

All pages share `styles.css` and `script.js`. `contact.html` has extra styles in `contact.css`. `qr.js` is used on the contact page for a generated QR code.

## Tech stack

- **Vanilla HTML / CSS / JavaScript** — no React, no Vue, no build tools
- **Node.js** only for the dev preview (`server.js` — uses built-in `http` module, no dependencies)
- **No package.json** by design — there's nothing to `npm install`
- **GitHub Pages** for hosting (deployed by `.github/workflows/pages.yml` on every push to `master`)

Live site: https://fahadnoor001.github.io/fahad-memoir/

## Design language (don't break this without asking)

The site follows a **"Monocle Editorial × Ritz-Carlton"** aesthetic. Specific rules established over multiple iterations — violating them means re-doing work:

1. **No `backdrop-filter: blur`** anywhere. Glass cards use solid ivory `#F5F1EB`.
2. **Italic Playfair Display is reserved for accents only** — max 3–4 italic declarations per page. Everything else uses upright Playfair weight 300.
3. **Hard 1px hairline rules in warm charcoal** for section breaks — no gradients.
4. **Chapter markers** appear above each major section (I. Biography, II. Powerlifting, III. Growth, IV. Contact) in Helvetica Neue tiny-caps above a full-width hairline rule.
5. **Hero** is an asymmetric ivory block cutting into the lower third of a full-bleed Houston skyline background. Dark text on ivory, not light text on glass.
6. **Color palette**: ivory `#F5F1EB`, warm charcoal, accent colors only as hairline rules.

When in doubt, match the existing `.hero`, `.credo`, and `.chapter-marker` sections in `styles.css` and `index.html`.

## How to develop

### Local preview
```bash
node server.js
# opens http://localhost:3002
```

No install required — just Node.js.

### Branch workflow

- **`master`** is the deploy branch. Every push to `master` auto-deploys to GitHub Pages (~1–2 min).
- **Never commit directly to `master`.** Always work on a feature branch and open a PR.
- **Branch naming**: `claude/<short-description>-<short-hash>` for Claude-authored work, `feature/<name>` for human-authored work.
- Squash-merge PRs so `master` history stays clean.

### When working from Claude Code on the web (iPhone / remote)

1. Start a session with the repo URL
2. Claude develops on a branch per the system instructions (e.g. `claude/<task>-xxxxx`)
3. Commit + push to the feature branch
4. Open a PR to `master` via the GitHub MCP tools
5. The user reviews on their phone or PC and merges

### When working from Claude Code on the local PC

1. `git pull origin master` first (to get any changes merged from iPhone sessions)
2. Create a branch: `git checkout -b feature/my-change`
3. Edit, preview with `node server.js`, commit
4. `git push -u origin feature/my-change`
5. Open a PR, merge when happy

## Things to avoid

- **Don't add a build system** (Webpack, Vite, etc.) without explicit request. The "no build step" simplicity is intentional.
- **Don't add dependencies** — the site must work as a pile of static files served from any HTTP server.
- **Don't add a CSS framework** (Tailwind, Bootstrap) — the design is hand-crafted.
- **Don't commit the `.netlify/` folder** — it's gitignored. Netlify is no longer used for this project.
- **Don't put secrets in code.** There are no secrets in this repo and there shouldn't be.
- **Don't reintroduce `backdrop-filter: blur`.** Ever.

## File map

```
fahad-memoir/
├── .github/workflows/pages.yml    # GitHub Pages deploy on push to master
├── .claude/launch.json             # Dev preview config for Claude Code
├── assets/
│   ├── houston-skyline.jpg        # Hero background (~147KB)
│   └── profile-photo.jpeg         # Bio portrait (~136KB)
├── index.html                      # Biography page
├── powerlifting.html               # Powerlifting page
├── growth.html                     # Growth page
├── contact.html                    # Contact page
├── styles.css                      # Main stylesheet (shared)
├── contact.css                     # Contact-page-only styles
├── script.js                       # Main JS (shared)
├── qr.js                           # Contact page QR generator
├── server.js                       # Local dev preview server (Node built-ins only)
├── CLAUDE.md                       # This file
├── README.md                       # Human-facing project overview
└── .gitignore
```

## Recent history (for context)

- **Monocle Editorial Pivot** — killed all blur, added chapter markers, redesigned hero as ivory block
- **GitHub Pages deploy workflow added** — auto-deploys master to `fahadnoor001.github.io/fahad-memoir`
