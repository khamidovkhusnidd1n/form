import hmac
from django.http import JsonResponse
from .services import QRService
from apps.certificates.models import Certificate
from apps.invitations.models import Invitation


def verify_qr(request, qr_type, object_id):
    token = request.GET.get('token', '')
    expected_hash = request.GET.get('hash', '')
    if not token or not expected_hash:
        return JsonResponse({'valid': False, 'type': qr_type, 'object_id': object_id, 'detail': 'Token va xesh majburiy'}, status=400)

    payload = QRService.build_verification_payload(qr_type, object_id, token)
    is_valid_hash = hmac.compare_digest(payload['hash'], expected_hash)
    if not is_valid_hash:
        return JsonResponse({'valid': False, 'type': qr_type, 'object_id': object_id, 'detail': 'Yaroqsiz imzo'}, status=400)

    exists = False
    try:
        if qr_type == 'certificate':
            exists = Certificate.objects.filter(id=object_id).exists()
        elif qr_type == 'invitation':
            exists = Invitation.objects.filter(id=object_id).exists()
    except Exception:
        exists = False

    return JsonResponse({'valid': exists, 'type': qr_type, 'object_id': object_id})
