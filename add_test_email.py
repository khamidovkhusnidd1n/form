import re

with open('backend/apps/common/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

new_view = '''
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import traceback

@api_view(['GET'])
@permission_classes([AllowAny])
def test_email_view(request):
    try:
        subject = "TEST - UZBA MARKAZ"
        body = "Bu xat tizimni tekshirish uchun jo'natildi."
        from_email = settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL
        
        send_mail(
            subject=subject,
            message=body,
            from_email=from_email,
            recipient_list=[from_email],
            fail_silently=False
        )
        return Response({
            "status": "SUCCESS",
            "message": "Xat muvaffaqiyatli jo'natildi!",
            "settings": {
                "EMAIL_HOST": settings.EMAIL_HOST,
                "EMAIL_PORT": settings.EMAIL_PORT,
                "EMAIL_USE_TLS": settings.EMAIL_USE_TLS,
                "EMAIL_HOST_USER": settings.EMAIL_HOST_USER,
            }
        })
    except Exception as e:
        return Response({
            "status": "ERROR",
            "error_type": type(e).__name__,
            "error_message": str(e),
            "traceback": traceback.format_exc(),
            "settings": {
                "EMAIL_HOST": settings.EMAIL_HOST,
                "EMAIL_PORT": settings.EMAIL_PORT,
                "EMAIL_USE_TLS": settings.EMAIL_USE_TLS,
                "EMAIL_HOST_USER": settings.EMAIL_HOST_USER,
            }
        })
'''
content = content + new_view

with open('backend/apps/common/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

with open('backend/apps/common/urls.py', 'r', encoding='utf-8') as f:
    urls_content = f.read()

urls_content = urls_content.replace(
    "path('makemigrations/', views.run_makemigrations_view, name='makemigrations'),",
    "path('makemigrations/', views.run_makemigrations_view, name='makemigrations'),\n    path('test-email/', views.test_email_view, name='test_email'),"
)

with open('backend/apps/common/urls.py', 'w', encoding='utf-8') as f:
    f.write(urls_content)

print("done")
