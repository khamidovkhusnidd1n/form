import uuid
import qrcode
import io
import logging
from django.db import DatabaseError
from django.core.files.base import ContentFile
from django.conf import settings
from .models import Certificate


logger = logging.getLogger(__name__)


def get_event_partners(event):
    """Return event logos without preventing certificate issuance during a pending migration."""
    try:
        return [{'name': partner.name, 'logo': partner.logo} for partner in event.partners.all()]
    except DatabaseError:
        logger.warning('Hamkorlar jadvali hali tayyor emas; sertifikat logolarsiz yaratildi')
        return []

def generate_certificate(application):
    # Reuse existing certificate if it already has a file
    existing = Certificate.objects.filter(application=application).first()
    if existing and existing.pdf_file:
        if not application.certificate_pdf:
            application.certificate_pdf = existing.pdf_file
            application.save(update_fields=['certificate_pdf'])
        return existing
        
    # Generate unique token
    token = str(uuid.uuid4())
    
    # Generate QR Code
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://form.uzbamalaka.uz').rstrip('/')
    verify_url = f"{frontend_url}/certificate/verify/{token}"
    qr = qrcode.QRCode(version=1, box_size=10, border=1)
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    qr_io = io.BytesIO()
    qr_img.save(qr_io, format="PNG")
    qr_io.seek(0)
    
    from .layout import render_certificate
    from django.utils import timezone
    cert_num = existing.certificate_number if existing and existing.certificate_number else f"CF-{application.id}-{uuid.uuid4().hex[:8].upper()}"
    pdf_bytes = render_certificate(
        full_name=application.full_name, event_title=application.event.title,
        date=timezone.localdate().strftime("%d.%m.%Y"), number=cert_num,
        verify_url=verify_url,
        partners=get_event_partners(application.event),
    )

    # Create/update Certificate record (same number as printed on the PDF)
    # Never deliver a PDF whose verification token was not saved successfully.
    cert = existing or Certificate(application=application)
    cert.certificate_number = cert.certificate_number or cert_num
    cert.verification_token = token
    cert.status = Certificate.Status.ISSUED
    cert.qr_code.save(f"qr_{token}.png", ContentFile(qr_io.getvalue()), save=False)
    cert.pdf_file.save(f"cert_{token}.pdf", ContentFile(pdf_bytes), save=False)
    cert.save()
    application.certificate_pdf = cert.pdf_file

    application.save(update_fields=['certificate_pdf'])
    return cert


