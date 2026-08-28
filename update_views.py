import re

with open('backend/apps/applications/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_stmt = "from apps.notifications.services import NotificationService\n"
content = content.replace("from .services import ApplicationService\n", import_stmt + "from .services import ApplicationService\n")

# Update perform_create
old_perform_create = '''    def perform_create(self, serializer):
        application = serializer.save()'''

new_perform_create = '''    def perform_create(self, serializer):
        application = serializer.save()
        try:
            NotificationService.send_status_email(application, 'submitted')
        except Exception:
            pass'''

content = content.replace(old_perform_create, new_perform_create)

with open('backend/apps/applications/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
