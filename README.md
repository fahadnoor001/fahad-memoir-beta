# fahad-memoir

Personal memoir and digital business card for Fahad Noor Mohammed. A hand-crafted static website — no build step, no framework, no dependencies.

**Live site:** https://fahadnoor001.github.io/fahad-memoir/

## Stack

- Vanilla HTML / CSS / JavaScript
- GitHub Pages for hosting (auto-deployed on push to `master`)
- Node.js only for the local dev preview (uses Node built-ins, no `npm install`)

## Pages

| Page | File |
| --- | --- |
| Biography | `index.html` |
| Powerlifting | `powerlifting.html` |
| Growth | `growth.html` |
| Contact | `contact.html` |

## Local development

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ (any recent version works — only used for the built-in `http` module)
- [Git](https://git-scm.com/download/win) (Windows) or system git (macOS/Linux)

### Run the dev preview
```bash
git clone https://github.com/fahadnoor001/fahad-memoir.git
cd fahad-memoir
node server.js
```

Then open http://localhost:3002 in your browser.

That's it. No install step, no bundler, no watchers.

## Workflow

This repo is worked on from three contexts:

1. **Local PC (Windows)** — Claude Code CLI or direct editing in VS Code
2. **iPhone on the go** — Claude Code on the web (claude.ai/code)
3. **Anywhere with a browser** — directly editing on github.com

All three push to the same `master` branch through feature-branch PRs.

### Branch convention
- `master` — production, deployed to GitHub Pages
- `claude/<task>-<hash>` — Claude-authored work branches
- `feature/<name>` — human-authored work branches

### Deploy
Every push to `master` triggers `.github/workflows/pages.yml`, which publishes to GitHub Pages. Typical deploy time: 1–2 minutes.

## For contributors (and future Claude sessions)

See [`CLAUDE.md`](./CLAUDE.md) for:
- Design language rules (ivory, no blur, italic reserved for accents, etc.)
- Architectural decisions that must not be broken
- Branch and commit conventions
- File map

## License

All rights reserved — this is a personal site.
