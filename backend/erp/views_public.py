import json
import time
import logging
from collections import defaultdict

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
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
    response['Access-Control-Allow-Origin'] = origin
    response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


def _cors_preflight(origin):
    res = JsonResponse({}, status=204)
    return _cors(res, origin)


def _get_origin(request):
    origin = request.headers.get('Origin', '')
    return origin if origin in ALLOWED_ORIGINS else 'https://talumaflow.com'


# ── Rate limiting ────────────────────────────────────────────
_rate_store: dict = defaultdict(list)


def _rate_limit(ip: str, limit: int = 10, window: int = 60) -> bool:
    now = time.time()
    _rate_store[ip] = [t for t in _rate_store[ip] if now - t < window]
    if len(_rate_store[ip]) >= limit:
        return False
    _rate_store[ip].append(now)
    return True


def _get_ip(request) -> str:
    xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
    return xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR', '')


# ── Server-side Knowledge Base ───────────────────────────────
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
    {
        'keywords': ['service', 'services', 'offer', 'what do you do', 'solutions', 'products', 'build'],
        'answer': "We provide three core AI solutions:\n\n1. TaalumaMail: Automatic extraction of orders/invoices from WhatsApp & Email\n2. Custom AI Chatbots: Trained on your private business data\n3. Data Dashboards: Analytics and forecasting tied to your ERP\n\n📧 talumaflow@gmail.com\n📱 +39 328 9741517"
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


# ── /api/public/extract/ (TaalumaMail Extraction Demo) ────────
@csrf_exempt
@never_cache
def public_extract(request):
    """
    Extracts structured order details (items, quantities, totals)
    from raw text using Ollama.
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

    text = (body.get('text') or body.get('prompt') or '').strip()
    if not text:
        return _cors(JsonResponse({'error': 'text is required'}, status=400), origin)

    system_prompt = (
        "You are an order extraction engine. Extract items, quantities, unit prices, "
        "and client details from the input text and return ONLY valid JSON."
    )

    try:
        from erp.services.health import call_ollama
        llm_response = call_ollama(prompt=text, system=system_prompt)
        return _cors(JsonResponse({'result': llm_response}), origin)
    except Exception as exc:
        logger.error(f"[PublicAPI] Extraction failed: {exc}")
        return _cors(JsonResponse({'error': 'Extraction service unavailable'}, status=500), origin)


# ── /api/public/chat/ (Website Chatbot Demo) ────────────────
@csrf_exempt
@never_cache
def public_chat(request):
    """
    Handles chatbot queries via fast KB matching, falling back
    to Ollama LLM for unmatched queries.
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

    query = (body.get('query') or body.get('prompt') or '').strip().lower()
    system_prompt = body.get('system_prompt', '')

    if not query:
        return _cors(JsonResponse({'error': 'query is required'}, status=400), origin)

    # 1. Static KB Search
    answer = _kb_search(query)

    # 2. Ollama LLM Fallback
    if answer == _FALLBACK:
        try:
            from erp.services.health import call_ollama
            llm_response = call_ollama(prompt=query, system=system_prompt)
            if llm_response:
                answer = llm_response
        except Exception as exc:
            logger.error(f"[PublicAPI] Ollama call failed: {exc}")

    return _cors(JsonResponse({'answer': answer}), origin)


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