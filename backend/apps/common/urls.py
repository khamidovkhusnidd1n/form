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
    path('migrate/', views.run_migrations_view, name='run-migrations'),
    path('makemigrations/', views.run_makemigrations_view, name='run-makemigrations'),
    path('test-email/', views.test_email_view, name='test_email'),
    path('reset-admin/', views.reset_admin_view, name='reset-admin'),
    path('', include(router.urls)),
]
