"""
URL configuration for common app (including translation API).
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for viewsets
router = DefaultRouter()
router.register(r'', views.TranslationViewSet, basename='translation')

app_name = 'common'

urlpatterns = [
    # Translation API endpoints
    path('translate/content/', views.translate_content_view, name='translate-content'),
    path('', include(router.urls)),
]
