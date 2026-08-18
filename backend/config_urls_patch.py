"""
config/urls.py — UPDATED
Add this one line to your existing urlpatterns list:
    path('api/public/', include('erp.urls_public')),

Full file shown below. Only the public line is new.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import dashboard

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Auth ──────────────────────────────────────────────────
    path('api/auth/', include('erp.auth_urls')),

    # ── Public website API (no auth, rate-limited) ────────────
    path('api/public/', include('erp.urls_public')),   # ← NEW

    # ── Pipeline ──────────────────────────────────────────────
    path('api/flow/', include('apps.flow.urls')),
    path('api/flow/', include('apps.flow.api.urls')),

    # ── ERP ───────────────────────────────────────────────────
    path('api/erp/',  include('erp.urls')),

    # ── Core ──────────────────────────────────────────────────
    path('api/core/', include('apps.core.urls')),

    path('dashboard/', dashboard, name='dashboard'),
]
