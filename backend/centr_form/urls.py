from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/accounts/', include('apps.accounts.urls')),
    path('api/v1/events/', include('apps.events.urls')),
    path('api/v1/applications/', include('apps.applications.urls')),
    path('api/v1/faqs/', include('apps.faqs.urls')),
    path('api/v1/dashboard/', include('apps.dashboard.urls')),
    path('api/v1/qr/', include('apps.qr.urls')),
    path('api/v1/settings/', include('apps.settings_app.urls')),
    path('api/v1/common/', include('apps.common.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from .views import react_app_view
import os
from django.views.static import serve

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, '..', 'dist', 'assets')}),
    re_path(r'^(?!api/|media/|static/).*$', react_app_view),
]
