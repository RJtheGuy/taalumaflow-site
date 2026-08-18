"""
backend/erp/urls_public.py
────────────────────────────────────────────────────────────────
Public API endpoints for the talumaflow.com website.
No authentication. Rate-limited per IP.

Add to config/urls.py:
    path('api/public/', include('erp.urls_public')),
────────────────────────────────────────────────────────────────
"""
from django.urls import path
from erp.views_public import public_extract, public_health, public_chat

urlpatterns = [
    path('extract/', public_extract, name='public-extract'),
    path('health/',  public_health,  name='public-health'),
    path('chat/',    public_chat,    name='public-chat'),
]
