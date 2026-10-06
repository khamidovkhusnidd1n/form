import random
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

def generate_certificate(application):
    # Double-check duplicate
    if hasattr(application, 'certificate'):
        return application.certificate
        
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
    c = canvas.Canvas(pdf_io, pagesize=landscape(A4))
    
    # For now, without a real background, we just draw text and QR.
    # We leave room to load a background image if provided.
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(landscape(A4)[0]/2, landscape(A4)[1] - 150, "SERTIFIKAT")
    
    c.setFont("Helvetica", 18)
    c.drawCentredString(landscape(A4)[0]/2, landscape(A4)[1]/2, application.full_name)
    
    # Add QR code image
    from reportlab.lib.utils import ImageReader
    qr_reader = ImageReader(qr_io)
    c.drawImage(qr_reader, 50, 50, width=100, height=100)
    
    c.showPage()
    c.save()
    pdf_io.seek(0)
    
    # Create Certificate object
    cert = Certificate(
        application=application,
        certificate_number=f"CF-{application.id}-{random.randint(1000, 9999)}",
        verification_token=token,
        status=Certificate.Status.ISSUED
    )
    
    # Save files
    cert.qr_code.save(f"qr_{token}.png", ContentFile(qr_io.getvalue()), save=False)
    cert.pdf_file.save(f"cert_{token}.pdf", ContentFile(pdf_io.getvalue()), save=False)
    cert.save()
    
    # Also link to application's certificate_pdf field for backward compatibility
    application.certificate_pdf = cert.pdf_file
    application.save(update_fields=['certificate_pdf'])
    
    return cert

