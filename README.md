# TaalumaFlow website

Static site for [talumaflow.com](https://talumaflow.com), served from the `docs/` folder by GitHub Pages.

```
docs/
├── index.html         ← the single page (SEO meta, JSON-LD, all sections)
├── CNAME              ← custom domain (talumaflow.com)
├── favicon.svg        ← site icon
├── og-image.png       ← 1200x630 social share image
├── robots.txt
├── sitemap.xml
├── render.yaml
└── src/
    ├── css/
    │   ├── main.css
    │   └── chat-styles.css
    └── js/
        ├── index.js         ← entry point
        ├── config.js        ← BACKEND_URL and public API endpoints
        ├── pv.js            ← page-view beacon (own script tag, independent of index.js)
        ├── demo.js          ← extraction demo + CSV dashboard
        ├── analytics.js     ← analytics widget
        ├── changelog.js
        ├── erp-capture.js
        ├── chat.js          ← qualifying chatbot
        ├── chat-engine.js   ← semantic similarity (Transformers.js)
        ├── rag-kb.js        ← chatbot knowledge base
        ├── pdf-viewer.js
        ├── sanitize.js
        ├── particles.js
        ├── theme.js
        └── ui.js
```

## Local preview

```
cd docs && python -m http.server 8000
```

Open http://localhost:8000. The page-view script (`src/js/pv.js`) only fires on the production host (talumaflow.com), so local previews send no tracking data.

## Backend

The backend lives in a separate repository, TaalumaOS, and is served at https://api.talumaflow.com. The site reads its address from `BACKEND_URL` in `docs/src/js/config.js`.

## Deploying

Push to `main`; GitHub Pages serves `docs/` at talumaflow.com.

## Releasing

GitHub Pages caches CSS and JS for hours, so every local stylesheet, script tag and JS import carries a `?v=<hash>` query. Run

```
python scripts/bump_asset_version.py
```

before committing any CSS or JS change. It recomputes the version from `docs/src/` and rewrites it in the HTML pages and in the imports between modules, so the HTML always carries the version that matches the files. Commit the result together with the change.
