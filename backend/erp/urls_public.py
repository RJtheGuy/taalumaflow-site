
from django.urls import path
from erp.views_public import public_extract, public_health, public_chat

urlpatterns = [
    path('extract/', public_extract, name='public-extract'),
    path('health/',  public_health,  name='public-health'),
    path('chat/',    public_chat,    name='public-chat'),
]
