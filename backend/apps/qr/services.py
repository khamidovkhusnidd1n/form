import hashlib
import hmac
from django.conf import settings
from typing import Any


class QRService:
    @staticmethod
    def generate_secure_hash(value: str) -> str:
        key = settings.SECRET_KEY.encode('utf-8')
        return hmac.new(key, value.encode('utf-8'), hashlib.sha256).hexdigest()

    @staticmethod
    def verify_hash(value: str, expected_hash: str) -> bool:
        if not value or not expected_hash:
            return False
        return hmac.compare_digest(QRService.generate_secure_hash(value), expected_hash)

    @staticmethod
    def build_verification_payload(qr_type: str, object_id: int, token: str | None = None) -> dict[str, Any]:
        safe_token = token or f"cf-{qr_type}-{object_id}"
        if not safe_token.startswith("cf-"):
            safe_token = f"cf-{safe_token}"
        hmac_payload = f"{qr_type}:{object_id}:{safe_token}"
        return {
            "type": qr_type,
            "object_id": object_id,
            "token": safe_token,
            "hash": QRService.generate_secure_hash(hmac_payload),
        }

    @staticmethod
    def build_verification_url(base_url: str, qr_type: str, object_id: int, token: str | None = None) -> str:
        payload = QRService.build_verification_payload(qr_type, object_id, token)
        return f"{base_url.rstrip('/')}/verify/{qr_type}/{object_id}?token={payload['token']}&hash={payload['hash']}"
