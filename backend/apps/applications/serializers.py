import os
from rest_framework import serializers
from .models import Application
from .services import ApplicationService

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB
FILE_SIGNATURES = {
    '.pdf': (b'%PDF-',),
    '.png': (b'\x89PNG\r\n\x1a\n',),
    '.jpg': (b'\xff\xd8\xff',),
    '.jpeg': (b'\xff\xd8\xff',),
    '.doc': (b'\xd0\xcf\x11\xe0',),
    '.docx': (b'PK\x03\x04',),
}
ALLOWED_FILE_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'}


def validate_uploaded_file(file_obj, allowed_extensions=ALLOWED_FILE_EXTENSIONS, max_size_bytes=MAX_FILE_SIZE_BYTES):
    if not file_obj:
        return file_obj
    if file_obj.size == 0:
        raise serializers.ValidationError("Fayl bo'sh bo'lishi mumkin emas.")
    filename = file_obj.name or ""
    ext = os.path.splitext(filename)[1].lower()
    allowed_normalized = {e.lower() if e.startswith('.') else f".{e.lower()}" for e in allowed_extensions}
    if ext not in allowed_normalized:
        allowed_str = ', '.join([e.upper().lstrip('.') for e in sorted(allowed_normalized)])
        raise serializers.ValidationError(f"Fayl formati ruxsat etilmagan ({ext}). Ruxsat etilgan formatlar: {allowed_str}.")
    if file_obj.size > max_size_bytes:
        max_mb = max_size_bytes // (1024 * 1024)
        raise serializers.ValidationError(f"Fayl hajmi {max_mb}MB dan oshmasligi kerak.")
    signatures = FILE_SIGNATURES.get(ext)
    if signatures:
        head = file_obj.read(8)
        file_obj.seek(0)
        if not any(head.startswith(sig) for sig in signatures):
            raise serializers.ValidationError("Fayl mazmuni uning kengaytmasiga mos kelmaydi.")
    return file_obj


class ApplicationSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            'application_id', 'event', 'attendance_type', 'full_name', 'date_of_birth', 'gender', 'phone', 'email',
            'organization', 'position', 'country', 'region', 'district',
            'presentation_title', 'abstract', 'document', 'passport', 'photo',
        ]
        read_only_fields = ['application_id']

    def validate_document(self, value):
        return validate_uploaded_file(value)

    def validate_passport(self, value):
        return validate_uploaded_file(value)

    def validate_photo(self, value):
        return validate_uploaded_file(value)

    def validate_event(self, value):
        if not value.is_registration_open:
            raise serializers.ValidationError("Bu tadbirga ro'yxatdan o'tish yopilgan yoki qabul qilish muddati tugagan")
        return value

    def validate(self, data):
        event = data.get('event')
        attendance_type = data.get('attendance_type')

        # Validate attendance_type against event format
        if event and attendance_type:
            event_format = event.format  # 'online', 'offline', or 'hybrid'
            if event_format == 'online' and attendance_type == 'offline':
                raise serializers.ValidationError(
                    {"attendance_type": "Bu tadbir faqat Online formatda o'tkaziladi. Offline qatnashish mumkin emas."}
                )
            elif event_format == 'offline' and attendance_type == 'online':
                raise serializers.ValidationError(
                    {"attendance_type": "Bu tadbir faqat Offline (jismoniy) formatda o'tkaziladi. Online qatnashish mumkin emas."}
                )
            # hybrid allows both online and offline

        try:
            ApplicationService.validate_submission(event, data)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        return data


class ApplicationStatusSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_format = serializers.CharField(source='event.format', read_only=True)
    certificate_pdf = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'application_id', 'event', 'full_name', 'email', 'date_of_birth', 'gender', 'phone',
            'organization', 'position',
            'country', 'region', 'district', 'event_title', 'event_format', 'attendance_type',
            'presentation_title', 'abstract', 'document', 'passport', 'photo',
            'status', 'admin_comment', 'user_reply', 'attended', 'translations', 'submitted_at', 'updated_at',
            'is_edited', 'edit_count', 'edited_at',
            'invitation_pdf', 'certificate_pdf',
        ]
        read_only_fields = fields

    def get_certificate_pdf(self, obj):
        """Return certificate URL; self-heal if approved but certificate missing."""
        if obj.status != 'approved':
            return None
        if not obj.certificate_pdf:
            try:
                from apps.certificates.services import generate_certificate
                generate_certificate(obj)
                obj.refresh_from_db(fields=['certificate_pdf'])
            except Exception:
                import logging
                logging.getLogger(__name__).exception("Sertifikatni yaratib bo'lmadi")
                return None
        pdf = obj.certificate_pdf
        if not pdf:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(pdf.url) if request else pdf.url


USER_EDITABLE_FIELDS = [
    'attendance_type', 'full_name', 'date_of_birth', 'gender', 'phone',
    'organization', 'position', 'country', 'region', 'district',
    'presentation_title', 'abstract',
]
USER_EDITABLE_FILES = ['document', 'passport', 'photo']


class ApplicationUserEditSerializer(serializers.ModelSerializer):
    """Applicant edits their own application. First version is snapshotted for admins."""

    class Meta:
        model = Application
        fields = USER_EDITABLE_FIELDS + USER_EDITABLE_FILES
        extra_kwargs = {name: {'required': False} for name in USER_EDITABLE_FIELDS + USER_EDITABLE_FILES}

    def validate_document(self, value):
        return validate_uploaded_file(value)

    def validate_passport(self, value):
        return validate_uploaded_file(value)

    def validate_photo(self, value):
        return validate_uploaded_file(value)

    def validate(self, data):
        event = self.instance.event
        attendance_type = data.get('attendance_type')
        if attendance_type:
            if event.format == 'online' and attendance_type == 'offline':
                raise serializers.ValidationError(
                    {"attendance_type": "Bu tadbir faqat Online formatda o'tkaziladi."})
            if event.format == 'offline' and attendance_type == 'online':
                raise serializers.ValidationError(
                    {"attendance_type": "Bu tadbir faqat Offline formatda o'tkaziladi."})
        return data

    @staticmethod
    def _snapshot(instance):
        from django.conf import settings
        snap = {}
        for name in USER_EDITABLE_FIELDS:
            value = getattr(instance, name)
            snap[name] = value.isoformat() if hasattr(value, 'isoformat') else value
        for name in USER_EDITABLE_FILES:
            f = getattr(instance, name)
            snap[name] = (settings.MEDIA_URL + f.name) if f else None
        snap['status'] = instance.status
        snap['submitted_at'] = instance.submitted_at.isoformat() if instance.submitted_at else None
        return snap

    def update(self, instance, validated_data):
        from django.utils import timezone

        if not instance.original_data:
            instance.original_data = self._snapshot(instance)

        had_certificate = bool(instance.certificate_pdf)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.is_edited = True
        instance.edit_count = (instance.edit_count or 0) + 1
        instance.edited_at = timezone.now()
        # Edited application goes back to the review queue
        instance.status = Application.Status.SUBMITTED
        if had_certificate:
            instance.certificate_pdf = None
        instance.save()

        if had_certificate:
            try:
                from apps.certificates.models import Certificate
                Certificate.objects.filter(application=instance).delete()
            except Exception:
                import logging
                logging.getLogger(__name__).exception("Eski sertifikatni o'chirib bo'lmadi")

        ApplicationService.log_action(
            instance.email, 'user_edit', [instance.id],
            {'application_id': instance.application_id, 'edit_count': instance.edit_count},
        )
        return instance



class ApplicationAdminSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    document_url = serializers.SerializerMethodField()
    passport_url = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    invitation_pdf_url = serializers.SerializerMethodField()
    certificate_pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'

    def get_certificate_pdf_url(self, obj):
        if obj.status != 'approved':
            return None
        if not obj.certificate_pdf:
            try:
                from apps.certificates.services import generate_certificate
                generate_certificate(obj)
                obj.refresh_from_db(fields=['certificate_pdf'])
            except Exception:
                return None
        pdf = obj.certificate_pdf
        if not pdf:
            return None
        req = self.context.get('request')
        return req.build_absolute_uri(pdf.url) if req else pdf.url

    def get_document_url(self, obj):
        req = self.context.get('request')
        return req.build_absolute_uri(obj.document.url) if obj.document and req else None

    def get_passport_url(self, obj):
        req = self.context.get('request')
        return req.build_absolute_uri(obj.passport.url) if obj.passport and req else None

    def get_photo_url(self, obj):
        req = self.context.get('request')
        return req.build_absolute_uri(obj.photo.url) if obj.photo and req else None

    def get_invitation_pdf_url(self, obj):
        req = self.context.get('request')
        return req.build_absolute_uri(obj.invitation_pdf.url) if obj.invitation_pdf and req else None


class StatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Application.Status.choices)
    admin_comment = serializers.CharField(required=False, allow_blank=True)
    translations = serializers.JSONField(required=False, allow_null=True)
