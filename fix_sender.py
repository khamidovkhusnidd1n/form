import re

with open('backend/apps/notifications/services.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_send = '''    @staticmethod
    def send_email(subject: str, body: str, recipient: str) -> bool:
        if not settings.EMAIL_HOST_USER:
            return False
        send_mail(subject=subject, message=body, from_email=settings.DEFAULT_FROM_EMAIL, recipient_list=[recipient], fail_silently=True)
        return True'''

new_send = '''    @staticmethod
    def send_email(subject: str, body: str, recipient: str) -> bool:
        if not settings.EMAIL_HOST_USER:
            return False
        # umail.uz strict sender policy fix: ALWAYS send from EMAIL_HOST_USER
        from_email = settings.EMAIL_HOST_USER
        try:
            send_mail(subject=subject, message=body, from_email=from_email, recipient_list=[recipient], fail_silently=False)
            return True
        except Exception as e:
            import logging
            logging.error(f"Mail failed: {e}")
            return False'''

content = content.replace(old_send, new_send)

with open('backend/apps/notifications/services.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
