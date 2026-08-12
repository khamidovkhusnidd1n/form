from apps.notifications.services import NotificationService
from apps.common.services import FileManagementService


class ApplicationService:
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
        NotificationService.send_status_email(application, new_status)
        return application

    @staticmethod
    def validate_uploaded_file(file_obj, category: str):
        return FileManagementService.validate_file(file_obj, category)
