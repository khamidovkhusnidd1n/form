
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from .models import Certificate

class VerifyCertificateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token, *args, **kwargs):
        try:
            cert = Certificate.objects.get(verification_token=token)
            if cert.status == Certificate.Status.REVOKED or cert.revoked_at is not None:
                return Response({'valid': False, 'message': 'Ushbu sertifikat bekor qilingan (Revoked)'}, status=status.HTTP_400_BAD_REQUEST)
                
            return Response({
                'valid': True,
                'name': cert.application.full_name,
                'date': cert.created_at.date().isoformat(),
                'id': cert.certificate_number,
                'event': cert.application.event.title,
            }, status=status.HTTP_200_OK)
        except Certificate.DoesNotExist:
            return Response({'valid': False, 'message': 'Sertifikat topilmadi (Not Found)'}, status=status.HTTP_404_NOT_FOUND)
