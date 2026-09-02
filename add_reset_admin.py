import re

with open('backend/apps/common/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

new_view = '''
from django.contrib.auth import get_user_model
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def reset_admin_view(request):
    try:
        User = get_user_model()
        user, created = User.objects.get_or_create(username='admin')
        user.set_password('Markaz2026!')
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return Response({
            "status": "SUCCESS",
            "message": "Muvaffaqiyatli! Login: admin, Parol: Markaz2026!"
        })
    except Exception as e:
        return Response({
            "status": "ERROR",
            "error_message": str(e)
        })
'''
content = content + new_view

with open('backend/apps/common/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

with open('backend/apps/common/urls.py', 'r', encoding='utf-8') as f:
    urls_content = f.read()

urls_content = urls_content.replace(
    "path('test-email/', views.test_email_view, name='test_email'),",
    "path('test-email/', views.test_email_view, name='test_email'),\n    path('reset-admin/', views.reset_admin_view, name='reset-admin'),"
)

with open('backend/apps/common/urls.py', 'w', encoding='utf-8') as f:
    f.write(urls_content)

print("done")
