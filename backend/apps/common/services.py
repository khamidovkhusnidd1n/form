from pathlib import Path
from django.conf import settings
from django.core.files.storage import default_storage


class FileManagementService:
    ALLOWED_EXTENSIONS = {
        'pdf': {'.pdf'},
        'image': {'.jpg', '.jpeg', '.png', '.webp'},
        'document': {'.pdf', '.doc', '.docx', '.xlsx', '.xls'},
    }

    @staticmethod
    def validate_file(file_obj, category: str):
        name = (file_obj.name or '').lower()
        extension = Path(name).suffix
        allowed = FileManagementService.ALLOWED_EXTENSIONS.get(category, set())
        if extension not in allowed:
            raise ValueError(f"Unsupported file type: {extension}")
        return True

    @staticmethod
    def delete_if_unused(file_field) -> None:
        if not file_field:
            return
        path = file_field.name
        if path and default_storage.exists(path):
            default_storage.delete(path)

    @staticmethod
    def build_media_url(path: str | None) -> str | None:
        if not path:
            return None
        return f"{settings.MEDIA_URL}{path}".replace('//', '/')
