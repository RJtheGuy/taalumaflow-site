# Deployment Guide

## Static hosting

The site is pure HTML/CSS/JS — no build step required.

### Render (current deployment)
1. Connect GitHub repo in Render dashboard
2. Create a **Static Site**
3. Set:
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.`
4. Auto-deploys on every push to `main`

### GitHub Pages
1. Push repo to GitHub
2. Settings → Pages → Source: Deploy from branch → `main` / `/ (root)`
3. Site live at `https://yourusername.github.io/taalumaflow-site/`
4. Custom domain: Settings → Pages → Custom domain → `talumaflow.com`

### Netlify (drag & drop)
Drag the entire project folder to [netlify.com/drop](https://app.netlify.com/drop).
Or connect the GitHub repo for auto-deploy.

### Cloudflare Pages
Connect GitHub → Build command: *(none)* → Publish directory: `/`

---

## Chat API — securing for production

The chat calls the Anthropic API directly from the browser.
This is fine for demos but exposes the API key in network requests.

**Recommended: proxy through your Django backend**

`erp/views_chat.py`:
```python
import httpx
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

class ChatProxyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        with httpx.Client() as client:
            r = client.post(
                'https://api.anthropic.com/v1/messages',
                headers={
                    'x-api-key': settings.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                json={ **request.data, 'model': 'claude-sonnet-4-6', 'max_tokens': 1000 },
                timeout=30,
            )
        return Response(r.json(), status=r.status_code)
```

`config/urls.py`:
```python
path('api/chat/', ChatProxyView.as_view()),
```

`.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

`src/js/chat.js` — update the fetch URL:
```js
// Change from:
const res = await fetch('https://api.anthropic.com/v1/messages', { ... })
// To:
const res = await fetch('/api/chat/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages }),
})
```

---

## Contact form — connecting to a real backend

Replace the mock handler in `src/js/ui.js` `initContactForm()` with Formspree:

```js
form.addEventListener('submit', async e => {
  e.preventDefault();
  const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new FormData(form),
  });
  if (res.ok) { /* show success */ }
});
```

Get a free form ID at [formspree.io](https://formspree.io).
