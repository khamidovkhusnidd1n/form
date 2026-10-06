from apps.notifications.services import NotificationService
from apps.common.services import FileManagementService


ALLOWED_TRANSITIONS = {
    'submitted': {'under_review', 'info_required', 'approved', 'rejected'},
    'under_review': {'info_required', 'approved', 'rejected'},
    'info_required': {'under_review', 'approved', 'rejected'},
    'rejected': {'under_review'},
    'approved': {'rejected'},
}


class ApplicationService:
    @staticmethod
    def log_action(actor, action, application_ids, details=None):
        from .models import ApplicationAuditLog
        try:
            ApplicationAuditLog.objects.create(
                actor=str(actor or 'unknown'),
                action=action,
                application_ids=list(application_ids),
                details=details or {},
            )
        except Exception:
            import logging
            logging.exception('Audit log yozishda xatolik')

    @staticmethod
    def can_transition(old_status, new_status):
        return old_status == new_status or new_status in ALLOWED_TRANSITIONS.get(old_status, set())

    @staticmethod
    def validate_submission(event, data):
        if not event.is_registration_open:
            raise ValueError("Bu tadbirga ro'yxatdan o'tish yopilgan yoki qabul qilish muddati tugagan")
        if event.participant_limit:
            from .models import Application
            count = Application.objects.filter(event=event, status__in=['submitted', 'under_review', 'approved']).count()
            if count >= event.participant_limit:
                raise ValueError("Tadbir ishtirokchilar limiti to'lgan")
        return data

    @staticmethod
    def update_status(application, new_status, admin_comment=None, actor=None, translations=None):
        old_status = application.status
        if not ApplicationService.can_transition(old_status, new_status):
            raise ValueError(f"'{old_status}' holatidan '{new_status}' holatiga o'tish mumkin emas")
        application.status = new_status
        update_fields = ['status', 'updated_at']
        if admin_comment is not None:
            application.admin_comment = admin_comment
            update_fields.append('admin_comment')
        if translations is not None:
            if application.translations is None:
                application.translations = {}
            application.translations.update(translations)
            update_fields.append('translations')
        application.save(update_fields=update_fields)
        
        if new_status != old_status:
            ApplicationService.log_action(
                actor, 'status_change', [application.id],
                {'application_id': application.application_id, 'from': old_status, 'to': new_status},
            )

        if new_status == 'approved' and old_status != 'approved':
            from apps.certificates.services import generate_certificate
            from django.db import transaction
            try:
                with transaction.atomic():
                    generate_certificate(application)
            except Exception as e:
                import logging
                logging.error(f"Sertifikat yaratishda xatolik: {e}")
                
        if new_status != old_status:
            NotificationService.send_status_email(application, new_status)
        return application

    @staticmethod
    def validate_uploaded_file(file_obj, category: str):
        return FileManagementService.validate_file(file_obj, category)
