import random
import logging
import uuid
import qrcode
import io
import os
from django.core.files.base import ContentFile
from django.conf import settings
from .models import Certificate
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from PIL import Image

logger = logging.getLogger(__name__)


def generate_certificate(application):
    # Reuse existing certificate if it already has a file
    try:
        existing = Certificate.objects.filter(application=application).first()
    except Exception:
        logger.exception("Certificate jadvalini o'qib bo'lmadi (migratsiya qilinmaganmi?)")
        existing = None
    if existing and existing.pdf_file:
        if not application.certificate_pdf:
            application.certificate_pdf = existing.pdf_file
            application.save(update_fields=['certificate_pdf'])
        return existing
        
    # Generate unique token
    token = str(uuid.uuid4())
    
    # Generate QR Code
    verify_url = f"{settings.FRONTEND_URL}/certificate/verify/{token}" if hasattr(settings, 'FRONTEND_URL') else f"https://form.uzbamalaka.uz/certificate/verify/{token}"
    qr = qrcode.QRCode(version=1, box_size=10, border=1)
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    qr_io = io.BytesIO()
    qr_img.save(qr_io, format="PNG")
    qr_io.seek(0)
    
    # We will generate a PDF certificate with reportlab
    pdf_io = io.BytesIO()
    width, height = landscape(A4)
    c = canvas.Canvas(pdf_io, pagesize=landscape(A4))
    
    # Background Color (Very light blue/grey)
    c.setFillColorRGB(0.97, 0.98, 1.0)
    c.rect(0, 0, width, height, stroke=0, fill=1)
    
    # Draw border
    c.setStrokeColorRGB(0.1, 0.2, 0.5) # dark blue
    c.setLineWidth(4)
    c.rect(20, 20, width - 40, height - 40)
    
    c.setStrokeColorRGB(0.8, 0.6, 0.2) # gold/bronze
    c.setLineWidth(1.5)
    c.rect(28, 28, width - 56, height - 56)

    # Logo
    logo_path = os.path.join(settings.BASE_DIR, 'static', 'images', 'logo.png')
    from reportlab.lib.utils import ImageReader
    if os.path.exists(logo_path):
        c.drawImage(logo_path, width/2 - 45, height - 130, width=90, height=90, mask='auto')

    # Top Text
    c.setFont("Times-Bold", 14)
    c.setFillColorRGB(0.1, 0.2, 0.5)
    top_text = "O'ZBEKISTON BADIIY AKADEMIYASI HUZURIDAGI"
    c.drawCentredString(width/2, height - 160, top_text)
    
    c.setFont("Times-Bold", 12)
    top_text2 = "BADIIY TA'LIM YO'NALISHLARIDA PEDAGOG VA MUTAXASSIS KADRLARNI"
    c.drawCentredString(width/2, height - 180, top_text2)
    top_text3 = "QAYTA TAYYORLASH HAMDA ULARNING MALAKASINI OSHIRISH MARKAZI"
    c.drawCentredString(width/2, height - 200, top_text3)

    # SERTIFIKAT
    c.setFont("Times-Bold", 46)
    c.setFillColorRGB(0.7, 0.5, 0.1) # gold
    c.drawCentredString(width/2, height - 280, "SERTIFIKAT")

    # Body
    c.setFont("Times-Italic", 20)
    c.setFillColorRGB(0, 0, 0)
    c.drawCentredString(width/2, height - 330, "Ushbu sertifikat")
    
    # Name
    c.setFont("Times-BoldItalic", 32)
    c.setFillColorRGB(0.1, 0.2, 0.5)
    c.drawCentredString(width/2, height - 380, application.full_name)
    
    # Reason
    c.setFont("Times-Italic", 18)
    c.setFillColorRGB(0, 0, 0)
    if application.event:
        c.drawCentredString(width/2, height - 420, f"\"{application.event.title}\"")
        c.drawCentredString(width/2, height - 445, "mavzusidagi tadbirda faol ishtiroki uchun berildi.")
    else:
        c.drawCentredString(width/2, height - 420, "malaka oshirish kursini muvaffaqiyatli")
        c.drawCentredString(width/2, height - 445, "tamomlaganligi uchun berildi.")

    # Bottom details (Date, Number)
    c.setFont("Times-Roman", 12)
    import datetime
    today = datetime.date.today().strftime("%d.%m.%Y")
    
    # Generate certificate number dynamically
    cert_num = f"CF-{application.id}-{random.randint(1000, 9999)}"
    
    c.drawString(150, 100, f"Sana: {today}")
    c.drawString(150, 80, f"Qayd raqami: {cert_num}")
    
    # Director signature placeholder
    c.drawCentredString(width - 200, 100, "Markaz direktori: _________________")
    
    # Add QR code image
    qr_reader = ImageReader(qr_io)
    c.drawImage(qr_reader, 40, 40, width=90, height=90)
    
    c.showPage()
    c.save()
    pdf_io.seek(0)
    
    pdf_bytes = pdf_io.getvalue()

    # Create/update Certificate record (same number as printed on the PDF)
    cert = None
    try:
        cert = existing or Certificate(application=application)
        cert.certificate_number = cert.certificate_number or cert_num
        cert.verification_token = token
        cert.status = Certificate.Status.ISSUED
        cert.qr_code.save(f"qr_{token}.png", ContentFile(qr_io.getvalue()), save=False)
        cert.pdf_file.save(f"cert_{token}.pdf", ContentFile(pdf_bytes), save=False)
        cert.save()
        application.certificate_pdf = cert.pdf_file
    except Exception:
        # Certificate table problem: still give the applicant the PDF
        logger.exception("Certificate yozuvini saqlab bo'lmadi, PDF to'g'ridan-to'g'ri ariza ga biriktiriladi")
        application.certificate_pdf.save(f"cert_{token}.pdf", ContentFile(pdf_bytes), save=False)
        cert = None

    application.save(update_fields=['certificate_pdf'])
    return cert


