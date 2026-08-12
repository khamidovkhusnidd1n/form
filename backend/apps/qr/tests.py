import unittest

from apps.qr.services import QRService


class QRServiceTests(unittest.TestCase):
    def test_builds_secure_verification_payload(self):
        payload = QRService.build_verification_payload("certificate", 42, "demo")

        self.assertEqual(payload["type"], "certificate")
        self.assertEqual(payload["object_id"], 42)
        self.assertTrue(payload["token"].startswith("cf-"))
        self.assertEqual(len(payload["hash"]), 64)

    def test_verifies_hash_consistently(self):
        token = "cf-demo-123"
        hashed = QRService.generate_secure_hash(token)

        self.assertTrue(QRService.verify_hash(token, hashed))
        self.assertFalse(QRService.verify_hash("different", hashed))
