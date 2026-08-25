import os
from rest_framework import serializers
from .models import Application
from .services import ApplicationService

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_FILE_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}


def validate_uploaded_file(file_obj, allowed_extensions=ALLOWED_FILE_EXTENSIONS, max_size_bytes=MAX_FILE_SIZE_BYTES):
    if not file_obj:
        return file_obj
    if file_obj.size == 0:
        raise serializers.ValidationError("Fayl bo'sh bo'lishi mumkin emas.")
    filename = file_obj.name or ""
    if len(filename.split('.')) > 2:
        raise serializers.ValidationError("Qo'shaloq fayl kengaytmasidan foydalanish taqiqlangan.")
    ext = os.path.splitext(filename)[1].lower()
    allowed_normalized = {e.lower() if e.startswith('.') else f".{e.lower()}" for e in allowed_extensions}
    if ext not in allowed_normalized:
        allowed_str = ', '.join([e.upper().lstrip('.') for e in sorted(allowed_normalized)])
        raise serializers.ValidationError(f"Fayl formati ruxsat etilmagan ({ext}). Ruxsat etilgan formatlar: {allowed_str}.")
    if file_obj.size > max_size_bytes:
        max_mb = max_size_bytes // (1024 * 1024)
        raise serializers.ValidationError(f"Fayl hajmi {max_mb}MB dan oshmasligi kerak.")
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

    class Meta:
        model = Application
        fields = [
            'application_id', 'full_name', 'email', 'organization', 'position',
            'country', 'region', 'district', 'event_title', 'attendance_type', 'presentation_title', 'abstract',
            'status', 'admin_comment', 'translations', 'submitted_at', 'updated_at',
            'invitation_pdf', 'certificate_pdf',
        ]
        read_only_fields = fields


class ApplicationAdminSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    document_url = serializers.SerializerMethodField()
    passport_url = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    invitation_pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'

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
