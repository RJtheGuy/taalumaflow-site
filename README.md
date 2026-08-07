# TaalumaFlow — Company Website

Marketing and product site for [TaalumaFlow](https://www.talumaflow.com),
an AI automation company based in Milan, Italy.

## Repository structure

```
taalumaflow-site/
├── index.html              ← Entry point (HTML only — no inline CSS or JS)
├── src/
│   ├── css/
│   │   └── main.css        ← All styles + CSS variables (dark/light tokens)
│   └── js/
│       ├── index.js        ← App entry point — wires all modules to DOM
│       ├── particles.js    ← Animated canvas background
│       ├── theme.js        ← Dark/light toggle + localStorage persistence
│       ├── chat.js         ← AI chat logic (inline demo + floating bubble)
│       ├── chatPrompt.js   ← System prompt — EDIT THIS to update bot knowledge
│       └── ui.js           ← Nav, scroll reveal, counters, chart toggle, form
├── public/                 ← Drop favicon.ico and og-image.png here
├── docs/
│   ├── DEPLOYMENT.md       ← Render, GitHub Pages, API proxy setup
│   └── CUSTOMISATION.md    ← Colors, products, copy, chatbot knowledge
├── .gitignore
├── .env.example
└── README.md
```

## Running locally

No build step. No Node. No package.json.

```bash
# Python
python -m http.server 3000

# Node
npx serve .

# VS Code: Install "Live Server", right-click index.html → Open with Live Server
```

> **Note:** Because the JS uses ES modules (`import`/`export`), you must serve
> through a local server — opening `index.html` directly as a `file://` URL
> will block module imports. Any of the commands above works.

## Deploying

### Render (static site)
- Build command: *(leave empty)*
- Publish directory: `.`

### GitHub Pages
Settings → Pages → Source: Deploy from branch → `main` / `/ (root)`

### Netlify / Cloudflare Pages
Connect the GitHub repo. No build command. Publish from root.

## Chatbot knowledge

To update what the AI assistant knows about TaalumaFlow, edit
`src/js/chatPrompt.js` — the `SYSTEM_PROMPT` export.
No other file needs to change.

## Theme

Dark mode is the default (`data-theme="dark"` on `<html>`).
The toggle in the nav switches modes and saves to `localStorage`.

All colours are CSS custom properties in `src/css/main.css`:
- `[data-theme="dark"]` block
- `[data-theme="light"]` block

## Contact

- **Email:** talumaflow@gmail.com
- **WhatsApp:** +39 328 9741517
- **Web:** www.talumaflow.com
- **Social:** @talumaflow
