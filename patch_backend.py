import re

with open('backend/apps/applications/views.py', 'r', encoding='utf-8') as f:
    text = f.read()

# I will find the _handle_tracking method and replace the content.
pattern = re.compile(r"def _handle_tracking\(self, request, application_id\):(.*?)return Response\(\{", re.DOTALL)

def replacer(match):
    # This is the new body
    body = """
        if not application_id or not str(application_id).strip():
            return Response(
                {'detail': "Ariza ID raqami kiritilishi shart."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            application = Application.objects.select_related('event').get(
                application_id=str(application_id).strip().upper()
            )
        except (Application.DoesNotExist, AttributeError, ValueError):
            return Response(
                {'detail': "Ariza topilmadi."},
                status=status.HTTP_404_NOT_FOUND
            )

        invitation_url = request.build_absolute_uri(application.invitation_pdf.url) if application.invitation_pdf else None
        certificate_url = request.build_absolute_uri(application.certificate_pdf.url) if application.certificate_pdf else None

        return Response({"""
    return "def _handle_tracking(self, request, application_id):" + body

text = pattern.sub(replacer, text)

with open('backend/apps/applications/views.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("backend patched")
