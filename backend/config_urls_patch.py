
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
    path('api/auth/', include('erp.auth_urls')),
    path('api/public/', include('erp.urls_public')),   # ← NEW
    path('api/flow/', include('apps.flow.urls')),
    path('api/flow/', include('apps.flow.api.urls')),
    path('api/erp/',  include('erp.urls')),
    path('api/core/', include('apps.core.urls')),

    path('dashboard/', dashboard, name='dashboard'),
]
