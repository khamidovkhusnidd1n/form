"""Shared A4 certificate layout used by issued certificates and admin previews."""
import io
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader
import qrcode


def render_certificate(*, full_name, event_title, date, number, verify_url, partners):
    output = io.BytesIO()
    width, height = landscape(A4)
    c = canvas.Canvas(output, pagesize=(width, height))
    c.setTitle('Sertifikat — ' + full_name)
    navy, gold = HexColor('#152D4B'), HexColor('#B99145')
    c.setFillColor(HexColor('#FCFBF7'))
    c.rect(0, 0, width, height, fill=1, stroke=0)
    c.setStrokeColor(navy)
    c.setLineWidth(2)
    c.rect(22, 22, width - 44, height - 44)
    c.setStrokeColor(gold)
    c.setLineWidth(.7)
    c.rect(29, 29, width - 58, height - 58)
    for x, y in [(35, 35), (width-35, 35), (35, height-35), (width-35, height-35)]:
        c.setFillColor(gold)
        c.circle(x, y, 3, fill=1, stroke=0)

    def paragraph(text, top, size=14, font='Times-Roman', max_width=660, color=navy, max_height=60):
        while True:
            style = ParagraphStyle('certificate', fontName=font, fontSize=size,
                                   leading=size * 1.25, alignment=1, textColor=color)
            p = Paragraph(escape(str(text)), style)
            _, h = p.wrap(max_width, height)
            if h <= max_height:
                break
            size -= .5
        p.drawOn(c, (width-max_width)/2, top-h)
        return top-h

    # Two rows allow up to twelve partners without distorting their logos.
    count = len(partners)
    rows = 2 if count > 6 else 1
    columns = (count + rows - 1)//rows if count else 1
    cell = (width-100)/columns
    for index, partner in enumerate(partners):
        row, col = divmod(index, columns)
        x = 50 + col*cell
        y = height-125-row*62 if rows == 2 else height-155
        box_height = 46 if rows == 2 else 75
        source = partner['logo']
        if hasattr(source, 'open'):
            source.open('rb')
        try:
            reader = ImageReader(source)
            iw, ih = reader.getSize()
            scale = min((cell-18)/iw, box_height/ih)
            dw, dh = iw*scale, ih*scale
            c.drawImage(reader, x+(cell-dw)/2, y+(box_height-dh)/2,
                        width=dw, height=dh, mask='auto')
        finally:
            if hasattr(source, 'close'):
                source.close()

    c.setStrokeColor(gold)
    c.line(100, height-192, width-100, height-192)
    paragraph('S E R T I F I K A T', height-210, 40, 'Times-Bold')
    paragraph('Ushbu sertifikat', height-269, 13)
    name_bottom = paragraph(full_name, height-299, 31, 'Times-BoldItalic', max_width=670, max_height=55)
    c.setStrokeColor(gold)
    c.line(240, name_bottom-12, width-240, name_bottom-12)
    title_bottom = paragraph('«' + event_title + '»', name_bottom-28, 17, 'Times-Bold', max_width=640, max_height=70)
    paragraph('tadbirida faol ishtirok etganligi uchun taqdim etiladi.', title_bottom-9, 13)
    # Footer stays fixed so metadata and QR never drift out of the page.
    qr = qrcode.make(verify_url)
    c.drawImage(ImageReader(qr.get_image()), 58, 52, width=74, height=74, mask='auto')
    c.setFillColor(navy)
    c.setFont('Helvetica', 10)
    c.drawString(149, 101, 'Sana: ' + date)
    c.drawString(149, 82, 'Qayd raqami: ' + number)
    c.setFont('Helvetica', 7)
    c.drawString(149, 63, 'Haqiqiyligini QR-kod orqali tekshiring')
    c.setStrokeColor(gold)
    c.line(width-282, 92, width-64, 92)
    c.setFont('Times-Roman', 11)
    c.drawCentredString(width-173, 74, 'Tashkilotchi / mas’ul shaxs')
    c.showPage()
    c.save()
    return output.getvalue()
