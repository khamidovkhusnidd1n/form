from django.http import JsonResponse
from .services import QRService


def verify_qr(request, qr_type, object_id):
    token = request.GET.get('token', '')
    expected_hash = request.GET.get('hash', '')
    payload = QRService.build_verification_payload(qr_type, object_id, token)
    is_valid = QRService.verify_hash(token, expected_hash) and payload['hash'] == expected_hash
    return JsonResponse({'valid': is_valid, 'type': qr_type, 'object_id': object_id})
