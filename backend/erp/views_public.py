"""
backend/erp/views_public.py
────────────────────────────────────────────────────────────────
Three public endpoints for the talumaflow.com website demos.
No authentication required. Rate-limited per IP.
CORS restricted to talumaflow.com and localhost (dev).

Endpoints:
  POST /api/public/extract/   ← order extraction demo
  POST /api/public/chat/      ← chatbot KB fallback (server-side)
  GET  /api/public/health/    ← is Ollama up?
────────────────────────────────────────────────────────────────
"""
import json
import time
import logging
from collections import defaultdict

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.views.decorators.cache import never_cache

logger = logging.getLogger(__name__)

# ── CORS ─────────────────────────────────────────────────────
ALLOWED_ORIGINS = {
    'https://talumaflow.com',
    'https://www.talumaflow.com',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
}


def _cors(response, origin='*'):
    response['Access-Control-Allow-Origin']  = origin
    response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


def _cors_preflight(origin):
    res = JsonResponse({}, status=204)
    return _cors(res, origin)


def _get_origin(request):
    origin = request.headers.get('Origin', '')
    return origin if origin in ALLOWED_ORIGINS else 'https://talumaflow.com'


# ── Rate limiting (simple in-memory, per IP) ─────────────────
_rate_store: dict = defaultdict(list)


def _rate_limit(ip: str, limit: int = 10, window: int = 60) -> bool:
    """Return True if request is allowed, False if rate limit exceeded."""
    now = time.time()
    _rate_store[ip] = [t for t in _rate_store[ip] if now - t < window]
    if len(_rate_store[ip]) >= limit:
        return False
    _rate_store[ip].append(now)
    return True


def _get_ip(request) -> str:
    xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
    return xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR', '')


# ── /api/public/extract/ ─────────────────────────────────────
@csrf_exempt
@never_cache
def public_extract(request):
    origin = _get_origin(request)

    if request.method == 'OPTIONS':
        return _cors_preflight(origin)

    if request.method != 'POST':
        return _cors(JsonResponse({'error': 'POST required'}, status=405), origin)

    ip = _get_ip(request)
    if not _rate_limit(ip, limit=10, window=60):
        logger.warning(f"[PublicAPI] Rate limit hit: {ip}")
        return _cors(
            JsonResponse({'error': 'Rate limit exceeded — try again in a minute.'}, status=429),
            origin
        )

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return _cors(JsonResponse({'error': 'Invalid JSON'}, status=400), origin)

    text = (body.get('text') or '').strip()
    if not text:
        return _cors(JsonResponse({'error': 'text is required'}, status=400), origin)
    if len(text) > 2000:
        return _cors(JsonResponse({'error': 'Message too long (max 2000 chars)'}, status=400), origin)

    try:
        from apps.flow.services.extractor import extract_order
        from apps.flow.services.confidence_scorer import score_extraction

        logger.info(f"[PublicAPI] Extraction request from {ip}: {text[:60]}…")

        result  = extract_order(text)
        scoring = score_extraction(result)

        result.confidence     = scoring.confidence
        result.missing_fields = scoring.missing_fields

        payload = {
            'client_name'   : result.client_name,
            'client_address': result.client_address,
            'client_email'  : result.client_email,
            'client_phone'  : result.client_phone,
            'language'      : result.language,
            'confidence'    : round(scoring.confidence, 3),
            'missing_fields': scoring.missing_fields,
            'needs_review'  : scoring.needs_review,
            'items': [
                {
                    'description': i.description,
                    'qty'        : float(i.qty or 0),
                    'unit_price' : float(i.unit_price or 0),
                    'line_total' : round(float(i.qty or 0) * float(i.unit_price or 0), 2),
                }
                for i in result.items
            ],
        }

        logger.info(
            f"[PublicAPI] Extracted {len(result.items)} items, "
            f"confidence={scoring.confidence:.0%} from {ip}"
        )

        return _cors(JsonResponse(payload), origin)

    except Exception as exc:
        logger.error(f"[PublicAPI] Extraction error: {exc}")
        return _cors(
            JsonResponse({'error': 'Extraction failed — our AI model may be starting up. Try again in 10 seconds.'}, status=500),
            origin
        )


# ── /api/public/health/ ──────────────────────────────────────
@csrf_exempt
@never_cache
def public_health(request):
    origin = _get_origin(request)
    if request.method == 'OPTIONS':
        return _cors_preflight(origin)

    try:
        from erp.services.health import check_ollama
        status = check_ollama()
        return _cors(JsonResponse({'ok': True, 'model': status.get('model', 'mistral:latest')}), origin)
    except Exception:
        return _cors(JsonResponse({'ok': False}), origin)


# ── /api/public/chat/ ────────────────────────────────────────
@csrf_exempt
@never_cache
def public_chat(request):
    """
    Server-side KB keyword search for the website chatbot.
    Returns the best matching answer from a curated knowledge base.
    No LLM involved — fast, free, no hallucination.
    """
    origin = _get_origin(request)

    if request.method == 'OPTIONS':
        return _cors_preflight(origin)

    if request.method != 'POST':
        return _cors(JsonResponse({'error': 'POST required'}, status=405), origin)

    ip = _get_ip(request)
    if not _rate_limit(ip, limit=30, window=60):
        return _cors(JsonResponse({'error': 'Too many requests'}, status=429), origin)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return _cors(JsonResponse({'error': 'Invalid JSON'}, status=400), origin)

    query = (body.get('query') or '').strip().lower()
    if not query:
        return _cors(JsonResponse({'error': 'query is required'}, status=400), origin)

    answer = _kb_search(query)
    return _cors(JsonResponse({'answer': answer}), origin)


# ── Server-side KB (mirrors rag-kb.js) ───────────────────────
_KB = [
    {
        'keywords': ['get started', 'start', 'begin', 'how do i', 'first step',
                     'come iniziare', 'onboard', 'try', 'how does it work'],
        'answer': "Great question! Here's how to get started:\n\n1. Book a free 30-minute call — we look at your current process honestly\n2. We build a prototype with your actual data (2 weeks)\n3. You see real output before committing\n\n📧 talumaflow@gmail.com\n📱 +39 328 9741517"
    },
    {
        'keywords': ['taalumamail', 'mail', 'order', 'ordine', 'whatsapp',
                     'fattura', 'invoice', 'preventivo', 'extraction', 'pdf'],
        'answer': "TaalumaMail reads WhatsApp/email orders, extracts every item and price, generates a fattura or preventivo PDF, and sends it back — automatically.\n\n• Runs on YOUR server — no cloud\n• Works with Italian, English, mixed messages\n• Connects to Odoo, SAP, or any ERP\n\nMessage → invoice in under 10 seconds."
    },
    {
        'keywords': ['chatbot', 'bot', 'assistant', 'conversational', 'ai chat'],
        'answer': "We build custom AI chatbots trained on your specific business — your products, FAQs, ordering flow.\n\n• Italian and English by default\n• Deploys on website, WhatsApp Business, Slack\n• This demo is an example of what we build!"
    },
    {
        'keywords': ['dashboard', 'analytics', 'data', 'kpi', 'report', 'forecast'],
        'answer': "We build dashboards on your actual data — sales trends, inventory forecasting, custom KPIs.\n\nWe handle the data science. You get clean, readable answers connected to your existing ERP or spreadsheets."
    },
    {
        'keywords': ['price', 'cost', 'pricing', 'quanto costa', 'budget', 'how much'],
        'answer': "Pricing is scoped per project:\n\n• TaalumaMail: from €2,000 one-time\n• Custom chatbot: from €1,500\n• Dashboard project: from €1,200\n\nBest way to get a real number: 30-minute call.\n📧 talumaflow@gmail.com"
    },
    {
        'keywords': ['privacy', 'data', 'gdpr', 'cloud', 'secure', 'on-premise', 'safe'],
        'answer': "Everything runs on YOUR hardware. The AI model runs locally via Ollama — your client orders never leave your network.\n\nGDPR-compliant by design. You own the data, the model, and the server."
    },
    {
        'keywords': ['contact', 'call', 'demo', 'speak', 'email', 'phone', 'whatsapp'],
        'answer': "Let's talk! 📞\n\n📧 talumaflow@gmail.com\n📱 WhatsApp: +39 328 9741517\n🌍 www.talumaflow.com\n📸 @talumaflow\n\nWe start with a free 30-min call — no pitch, just an honest look at whether AI helps your process."
    },
    {
        'keywords': ['who', 'team', 'about', 'data scientist', 'company', 'milan'],
        'answer': "We're data scientists based in Milan, Italy.\n\nWe got tired of AI demos that don't survive contact with real business data — so we build tools that actually work in production.\n\nNo buzzwords. No overselling. If AI won't help your problem, we say so."
    },
]

_FALLBACK = (
    "I don't have a specific answer for that one! 😊\n\n"
    "For anything detailed:\n📧 talumaflow@gmail.com\n📱 +39 328 9741517\n\n"
    "Or scroll down and fill the contact form — we respond within a few hours."
)


def _kb_search(query: str) -> str:
    best = None
    best_score = 0
    for entry in _KB:
        score = sum(1 for kw in entry['keywords'] if kw in query)
        if score > best_score:
            best_score = score
            best = entry
    return best['answer'] if best_score > 0 else _FALLBACK
