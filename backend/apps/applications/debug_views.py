from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Application
from django.db.models import Q

class DebugMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        apps_by_user = Application.objects.filter(user=user)
        apps_by_email = Application.objects.filter(email__iexact=user.email)
        apps_combined = Application.objects.filter(Q(user=user) | Q(email__iexact=user.email))
        
        return Response({
            "user_id": user.id,
            "user_email": user.email,
            "user_username": getattr(user, 'username', None),
            "apps_by_user_count": apps_by_user.count(),
            "apps_by_email_count": apps_by_email.count(),
            "apps_combined_count": apps_combined.count(),
            "apps_by_user_ids": list(apps_by_user.values_list('application_id', flat=True)),
            "apps_by_email_ids": list(apps_by_email.values_list('application_id', flat=True)),
            "all_apps_in_db": Application.objects.count()
        })
