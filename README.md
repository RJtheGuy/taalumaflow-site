# TaalumaFlow — Website + Public API

```
taalumaflow/
├── frontend/          ← GitHub Pages static site (talumaflow.com)
│   ├── index.html
│   ├── CNAME
│   ├── src/
│   │   ├── css/main.css
│   │   └── js/
│   │       ├── index.js       ← entry point
│   │       ├── config.js      ← SET BACKEND_URL HERE
│   │       ├── demo.js        ← extraction demo + CSV dashboard
│   │       ├── chat.js        ← qualifying chatbot
│   │       ├── chat-engine.js ← semantic similarity (Transformers.js)
│   │       ├── rag-kb.js      ← knowledge base
│   │       ├── particles.js
│   │       ├── theme.js
│   │       └── ui.js
│   └── public/        ← favicon.ico + og-image.png go here
│
└── backend/           ← Add these files to your Django backend
    ├── erp/
    │   ├── views_public.py    ← 3 public endpoints
    │   └── urls_public.py     ← URL patterns
    ├── config_urls_patch.py   ← shows what to add to config/urls.py
    └── env_additions.txt      ← add these to your .env
```

## Setup order

1. Copy `backend/erp/views_public.py` and `backend/erp/urls_public.py`
   to your Django backend
2. Add `path('api/public/', include('erp.urls_public'))` to `config/urls.py`
3. Add env vars from `backend/env_additions.txt` to your `.env`
4. Restart Docker: `docker compose restart backend`
5. Run tunnel: `cloudflared tunnel --url http://localhost:8000`
6. Paste tunnel URL into `frontend/src/js/config.js` → BACKEND_URL
7. Push frontend to GitHub → site live at talumaflow.com
