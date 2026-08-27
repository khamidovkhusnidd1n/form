import os
from django.conf import settings
from django.http import HttpResponse


def react_app_view(request):
    try:
        # First try the root directory (cPanel deployment structure)
        with open(os.path.join(settings.BASE_DIR, '..', 'index.html')) as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        try:
            # Fallback to dist/index.html (local dev structure)
            with open(os.path.join(settings.BASE_DIR, '..', 'dist', 'index.html')) as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            return HttpResponse(
                'React build not found. Please run npm run build first.',
                status=501,
            )
