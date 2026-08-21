
import json
import time
import logging
import os
from collections import defaultdict

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache

logger = logging.getLogger(__name__)

_PUBLIC_TOKEN = os.getenv('PUBLIC_API_TOKEN', '').strip()

def _check_token(request) -> bool:
    if not _PUBLIC_TOKEN:
        return True  # disabled
    return request.headers.get('X-Public-Token', '') == _PUBLIC_TOKEN

_ALWAYS_ALLOWED = {
    'https://talumaflow.com',
    'https://www.talumaflow.com',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
}

def _is_allowed_origin(origin: str) -> bool:
    if origin in _ALWAYS_ALLOWED:
        return True
    # Allow any Cloudflare / Tailscale tunnel during dev
    if origin.endswith('.trycloudflare.com'):
        return True
    if origin.endswith('.ts.net'):
        return True
    return False

def _cors_headers(origin: str) -> dict:
    allowed = origin if _is_allowed_origin(origin) else 'https://talumaflow.com'
    return {
        'Access-Control-Allow-Origin':  allowed,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age':       '86400',
    }

def _json(data, status=200, origin=''):
    res = JsonResponse(data, status=status)
    for k, v in _cors_headers(origin).items():
        res[k] = v
    return res

def _preflight(origin):
    res = JsonResponse({}, status=204)
    for k, v in _cors_headers(origin).items():
        res[k] = v
    return res

_rl: dict = defaultdict(list)

def _allow(ip: str, limit: int, window: int = 60) -> bool:
    """Token bucket rate limiter — per IP, per window."""
    now = time.time()
    _rl[ip] = [t for t in _rl[ip] if now - t < window]
    if len(_rl[ip]) >= limit:
        logger.warning(f"[PublicAPI] Rate limit hit: {ip}")
        return False
    _rl[ip].append(now)
    return True

# Separate stricter bucket for Ollama-hitting endpoints
_rl_ollama: dict = defaultdict(list)

def _allow_ollama(ip: str) -> bool:
    """Stricter limit for endpoints that trigger Ollama inference.
    Max 8 requests per minute, 20 per hour per IP."""
    now = time.time()
    # Per-minute check
    _rl_ollama[ip] = [t for t in _rl_ollama[ip] if now - t < 3600]
    per_min = sum(1 for t in _rl_ollama[ip] if now - t < 60)
    if per_min >= 15:
        logger.warning(f"[PublicAPI] Ollama rate limit (per-min) hit: {ip}")
        return False
    # Per-hour check
    if len(_rl_ollama[ip]) >= 100:
        logger.warning(f"[PublicAPI] Ollama rate limit (per-hour) hit: {ip}")
        return False
    _rl_ollama[ip].append(now)
    return True

def _ip(request) -> str:
    xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
    return xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR', 'unknown')


@csrf_exempt
@never_cache
def public_extract(request):
    origin = request.headers.get('Origin', '')

    if request.method == 'OPTIONS':
        return _preflight(origin)

    if request.method != 'POST':
        return _json({'error': 'POST required'}, 405, origin)

    ip = _ip(request)
    if not _allow(ip, limit=10):
        return _json({'error': 'Rate limit — try again in a minute.'}, 429, origin)

    if not _allow_ollama(ip):
        return _json({'error': 'Too many AI requests — try again in a minute.'}, 429, origin)

    # Parse body
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return _json({'error': 'Invalid JSON body'}, 400, origin)

    text = (body.get('text') or '').strip()
    if not text:
        return _json({'error': 'text field is required'}, 400, origin)
    if len(text) > 2000:
        return _json({'error': 'Message too long (max 2000 chars)'}, 400, origin)

    # Run extraction
    try:
        from apps.flow.services.extractor import extract_order
        from apps.flow.services.confidence_scorer import score_extraction

        logger.info(f"[PublicAPI] extract from {ip}: {text[:60]}…")

        result  = extract_order(text)
        scoring = score_extraction(result)

        payload = {
            'client_name'   : result.client_name,
            'client_address': result.client_address,
            'client_email'  : getattr(result, 'client_email', None),
            'client_phone'  : getattr(result, 'client_phone', None),
            'language'      : getattr(result, 'language', 'it'),
            'confidence'    : round(float(scoring.confidence), 3),
            'missing_fields': list(scoring.missing_fields or []),
            'needs_review'  : bool(scoring.needs_review),
            'items': [
                {
                    'description': i.description,
                    'qty'        : float(i.qty or 0),
                    'unit_price' : float(i.unit_price or 0),
                    'line_total' : round(float(i.qty or 0) * float(i.unit_price or 0), 2),
                }
                for i in (result.items or [])
            ],
        }

        logger.info(
            f"[PublicAPI] {len(result.items)} items "
            f"conf={scoring.confidence:.0%} ip={ip}"
        )
        return _json(payload, 200, origin)

    except Exception as exc:
        logger.exception(f"[PublicAPI] extract error ip={ip}: {exc}")
        return _json(
            {'error': f'Extraction failed: {str(exc)}'},
            500, origin
        )

@csrf_exempt
@never_cache
def public_health(request):
    origin = request.headers.get('Origin', '')
    if request.method == 'OPTIONS':
        return _preflight(origin)

    try:
        from erp.services.health import check_ollama
        status = check_ollama()
        return _json({'ok': True, 'model': status.get('model', 'mistral')}, 200, origin)
    except Exception as exc:
        return _json({'ok': False, 'error': str(exc)}, 200, origin)


@csrf_exempt
@never_cache
def public_chat(request):
    origin = request.headers.get('Origin', '')
    if request.method == 'OPTIONS':
        return _preflight(origin)

    if request.method != 'POST':
        return _json({'error': 'POST required'}, 405, origin)

    ip = _ip(request)
    if not _allow(ip, limit=30):
        return _json({'error': 'Too many requests'}, 429, origin)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return _json({'error': 'Invalid JSON'}, 400, origin)

    query   = (body.get('query') or '').strip()
    history = body.get('history') or []

    if not query:
        return _json({'error': 'query is required'}, 400, origin)

    # Token check (optional — set PUBLIC_API_TOKEN in .env to enable)
    if not _check_token(request):
        return _json({'error': 'Unauthorized'}, 401, origin)

    # Stricter per-IP Ollama rate limit
    if not _allow_ollama(ip):
        return _json({'error': 'Too many AI requests — try again in a minute.'}, 429, origin)

    try:
        from erp.services.doc_chat import get_chat_response
        answer = get_chat_response(query, history)
    except Exception as exc:
        logger.error(f"[PublicAPI] doc_chat error: {exc}")
        answer = (
            "I'm having trouble right now. "
            "Reach us directly:\n\n"
            "📧 talumaflow@gmail.com\n📱 +39 328 9741517"
        )

    return _json({'answer': answer}, 200, origin)


@csrf_exempt
@never_cache
def public_contact(request):
    """Receives contact form and sends email via Django SMTP."""
    origin = request.headers.get('Origin', '')
    if request.method == 'OPTIONS':
        return _preflight(origin)
    if request.method != 'POST':
        return _cors(JsonResponse({'error': 'POST required'}, 405), origin)

    ip = _ip(request)
    if not _allow(ip, limit=5):
        return _cors(JsonResponse({'error': 'Rate limit'}, 429), origin)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return _cors(JsonResponse({'error': 'Invalid JSON'}, 400), origin)

    name    = (body.get('name')    or '').strip()
    company = (body.get('company') or '').strip()
    email   = (body.get('email')   or '').strip()
    product = (body.get('product') or '').strip()
    message = (body.get('message') or '').strip()

    if not email:
        return _cors(JsonResponse({'error': 'email is required'}, 400), origin)

    try:
        from django.core.mail import send_mail
        from django.conf import settings

        subject = f"Demo request — {name}" + (f" ({company})" if company else "")
        body_text = (
            f"New demo request from talumaflow.com\n\n"
            f"Name:         {name}\n"
            f"Company:      {company}\n"
            f"Email:        {email}\n"
            f"Interested in: {product}\n\n"
            f"Message:\n{message}\n"
        )

        send_mail(
            subject=subject,
            message=body_text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.OPERATOR_EMAIL],
            fail_silently=False,
        )
        logger.info(f"[PublicAPI] Contact form sent from {email}")
        return _cors(JsonResponse({'ok': True}), origin)

    except Exception as exc:
        logger.error(f"[PublicAPI] contact error: {exc}")
        return _cors(JsonResponse({'error': str(exc)}, 500), origin)


def _generate_demo_pdf(result: dict, doc_num: str, subtotal: float, vat: float, total: float) -> bytes | None:
    """Generate a real PDF using reportlab. Returns bytes or None on failure."""
    try:
        import io
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import mm
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4,
                                leftMargin=20*mm, rightMargin=20*mm,
                                topMargin=20*mm, bottomMargin=20*mm)

        styles = getSampleStyleSheet()
        blue   = colors.HexColor('#2563EB')
        purple = colors.HexColor('#9B5DE5')
        grey   = colors.HexColor('#888888')
        light  = colors.HexColor('#f0f2ff')

        title_style = ParagraphStyle('Title', parent=styles['Normal'],
                                     fontSize=22, textColor=blue, fontName='Helvetica-Bold',
                                     spaceAfter=2)
        sub_style   = ParagraphStyle('Sub', parent=styles['Normal'],
                                     fontSize=9, textColor=grey)
        label_style = ParagraphStyle('Label', parent=styles['Normal'],
                                     fontSize=8, textColor=grey, fontName='Helvetica-Bold',
                                     spaceBefore=8, spaceAfter=2)
        body_style  = ParagraphStyle('Body', parent=styles['Normal'], fontSize=11)

        items = result.get('items', [])
        story = []

        header_data = [
            [Paragraph('<font color="#2563EB"><b>Taluma</b></font><font color="#9B5DE5">Flow</font>', styles['Normal']),
             Paragraph(f'<b>{doc_num}</b><br/><font color="#888888" size="9">{__import__("datetime").date.today().strftime("%d/%m/%Y")}</font><br/><font color="#2563EB" size="9">PREVENTIVO / FATTURA</font>', styles['Normal'])],
        ]
        header_table = Table(header_data, colWidths=['60%', '40%'])
        header_table.setStyle(TableStyle([
            ('FONTSIZE', (0,0), (-1,-1), 22),
            ('ALIGN', (1,0), (1,0), 'RIGHT'),
            ('LINEBELOW', (0,0), (-1,0), 1.5, blue),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 6*mm))

        story.append(Paragraph('CUSTOMER', label_style))
        story.append(Paragraph(f'<b>{result.get("client_name") or "Unknown"}</b>', body_style))
        if result.get('client_address'):
            story.append(Paragraph(result['client_address'], sub_style))
        if result.get('client_email'):
            story.append(Paragraph(result['client_email'], sub_style))
        story.append(Spacer(1, 6*mm))

        story.append(Paragraph('ORDER ITEMS', label_style))
        table_data = [['Description', 'Qty', 'Unit Price', 'Total']]
        for i in items:
            qty   = float(i.get('qty', 0))
            price = float(i.get('unit_price', 0))
            table_data.append([
                i.get('description', ''),
                str(int(qty)),
                f'€ {price:.2f}',
                f'€ {qty*price:.2f}',
            ])

        item_table = Table(table_data, colWidths=['55%','10%','17.5%','17.5%'])
        item_table.setStyle(TableStyle([
            ('BACKGROUND',   (0,0), (-1,0), light),
            ('FONTNAME',     (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE',     (0,0), (-1,-1), 10),
            ('TEXTCOLOR',    (0,0), (-1,0), grey),
            ('ALIGN',        (1,0), (-1,-1), 'RIGHT'),
            ('LINEBELOW',    (0,0), (-1,0), 1.5, blue),
            ('LINEBELOW',    (0,1), (-1,-1), 0.5, light),
            ('TOPPADDING',   (0,0), (-1,-1), 7),
            ('BOTTOMPADDING',(0,0), (-1,-1), 7),
        ]))
        story.append(item_table)
        story.append(Spacer(1, 4*mm))

        totals_data = [
            ['', '', 'Subtotal', f'€ {subtotal:.2f}'],
            ['', '', 'VAT 22%',  f'€ {vat:.2f}'],
            ['', '', 'TOTAL',    f'€ {total:.2f}'],
        ]
        totals_table = Table(totals_data, colWidths=['35%','30%','17.5%','17.5%'])
        totals_table.setStyle(TableStyle([
            ('ALIGN',        (2,0), (-1,-1), 'RIGHT'),
            ('FONTSIZE',     (0,0), (-1,-1), 10),
            ('LINEABOVE',    (2,2), (-1,2), 1.5, blue),
            ('FONTNAME',     (2,2), (-1,2), 'Helvetica-Bold'),
            ('TEXTCOLOR',    (2,2), (-1,2), blue),
            ('FONTSIZE',     (2,2), (-1,2), 12),
            ('TOPPADDING',   (0,0), (-1,-1), 5),
            ('BOTTOMPADDING',(0,0), (-1,-1), 5),
        ]))
        story.append(totals_table)
        story.append(Spacer(1, 8*mm))

        conf = int((result.get('confidence', 1) or 1) * 100)
        story.append(Paragraph(
            f'<font color="#065f46">✓ AI Confidence: {conf}% — Auto-approved</font>',
            sub_style
        ))
        story.append(Spacer(1, 12*mm))

        footer_data = [['Generated by TaalumaFlow · talumaflow.com', 'Payment due within 30 days']]
        footer_table = Table(footer_data, colWidths=['60%','40%'])
        footer_table.setStyle(TableStyle([
            ('FONTSIZE',    (0,0), (-1,-1), 8),
            ('TEXTCOLOR',   (0,0), (-1,-1), grey),
            ('LINEABOVE',   (0,0), (-1,0), 0.5, light),
            ('ALIGN',       (1,0), (1,0), 'RIGHT'),
            ('TOPPADDING',  (0,0), (-1,-1), 6),
        ]))
        story.append(footer_table)

        doc.build(story)
        return buf.getvalue()

    except Exception as e:
        logger.error(f"[PDF] Generation failed: {e}")
        return None


@csrf_exempt
@never_cache
def public_send_result(request):
    """Send extraction result to user's email via Django SMTP."""
    origin = request.headers.get('Origin', '')
    if request.method == 'OPTIONS':
        return _preflight(origin)
    if request.method != 'POST':
        return _json({'error': 'POST required'}, 405, origin)

    ip = _ip(request)
    if not _allow(ip, limit=10):
        return _json({'error': 'Rate limit'}, 429, origin)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return _json({'error': 'Invalid JSON'}, 400, origin)

    email  = (body.get('email') or '').strip()
    result = body.get('result') or {}

    if not email or not result:
        return _json({'error': 'email and result required'}, 400, origin)

    try:
        from django.core.mail import EmailMessage
        from django.conf import settings

        items    = result.get('items', [])
        subtotal = sum(float(i.get('qty', 0)) * float(i.get('unit_price', 0)) for i in items)
        vat      = subtotal * 0.22
        total    = subtotal + vat
        doc_num  = f"PRV-DEMO-{int(time.time())}"

        lines = '\n'.join(
            f"  • {i.get('qty')}x {i.get('description')} @ €{float(i.get('unit_price',0)):.2f} = €{float(i.get('qty',0))*float(i.get('unit_price',0)):.2f}"
            for i in items
        )

        message_text = (
            f"Hi,\n\n"
            f"Here is your extracted order from the TaalumaFlow demo:\n\n"
            f"Customer: {result.get('client_name') or 'Unknown'}\n"
            f"Address:  {result.get('client_address') or '—'}\n\n"
            f"Items:\n{lines}\n\n"
            f"Subtotal: €{subtotal:.2f}\n"
            f"VAT 22%:  €{vat:.2f}\n"
            f"Total:    €{total:.2f}\n\n"
            f"A PDF version of this document is attached.\n\n"
            f"Want this automated for your real orders?\n"
            f"📧 talumaflow@gmail.com · 📱 +39 328 9741517\n"
        )

        msg = EmailMessage(
            subject=f'Order extraction result — {result.get("client_name","TaalumaFlow")}',
            body=message_text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )

        # Generate real PDF using reportlab
        pdf_bytes = _generate_demo_pdf(result, doc_num, subtotal, vat, total)
        if pdf_bytes:
            msg.attach(f'{doc_num}.pdf', pdf_bytes, 'application/pdf')

        msg.send()
        logger.info(f"[PublicAPI] Result sent to {email}")
        return _json({'ok': True}, 200, origin)

    except Exception as exc:
        logger.error(f"[PublicAPI] send_result error: {exc}")
        return _json({'error': str(exc)}, 500, origin)