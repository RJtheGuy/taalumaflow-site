import logging
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from apps.flow.services.extractor import extract_order
from apps.flow.services.confidence_scorer import score_extraction
from erp.services.health import check_ollama
from erp.services.kb_service import search_knowledge_base
from erp.throttles import PublicExtractThrottle, PublicChatThrottle

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([PublicExtractThrottle])
def public_extract(request):
    """
    Public order extraction demo.
    """
    text = (request.data.get('text') or '').strip()
    
    if not text:
        return Response({'error': 'text is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(text) > 2000:
        return Response({'error': 'Message too long (max 2000 chars)'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        logger.info(f"[PublicAPI] Extraction request received: {text[:60]}…")

        result = extract_order(text)
        scoring = score_extraction(result)

        payload = {
            'client_name': result.client_name,
            'client_address': result.client_address,
            'client_email': result.client_email,
            'client_phone': result.client_phone,
            'language': result.language,
            'confidence': round(scoring.confidence, 3),
            'missing_fields': scoring.missing_fields,
            'needs_review': scoring.needs_review,
            'items': [
                {
                    'description': item.description,
                    'qty': float(item.qty or 0),
                    'unit_price': float(item.unit_price or 0),
                    'line_total': round(float(item.qty or 0) * float(item.unit_price or 0), 2),
                }
                for item in result.items
            ],
        }

        logger.info(f"[PublicAPI] Extraction success: {len(result.items)} items, confidence={scoring.confidence:.0%}")
        return Response(payload, status=status.HTTP_200_OK)

    except Exception as exc:
        logger.error(f"[PublicAPI] Extraction error: {exc}", exc_info=True)
        return Response(
            {'error': 'Extraction failed — our AI model may be starting up. Try again in 10 seconds.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def public_health(request):
    """
    Healthcheck endpoint to verify Ollama availability.
    """
    try:
        status_info = check_ollama()
        return Response({'ok': True, 'model': status_info.get('model', 'mistral:latest')})
    except Exception as exc:
        logger.warning(f"[PublicAPI] Ollama health check failed: {exc}")
        return Response({'ok': False}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([PublicChatThrottle])
def public_chat(request):
    """
    Server-side KB keyword search for the website chatbot.
    """
    query = (request.data.get('query') or '').strip()
    
    if not query:
        return Response({'error': 'query is required'}, status=status.HTTP_400_BAD_REQUEST)

    answer = search_knowledge_base(query)
    return Response({'answer': answer}, status=status.HTTP_200_OK)