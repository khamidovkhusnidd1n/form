from django.core.management.base import BaseCommand
from apps.applications.models import Application
from apps.certificates.services import generate_certificate
from apps.certificates.models import Certificate
import traceback

class Command(BaseCommand):
    help = 'Forces regeneration of all certificates to fix QR code URLs'

    def handle(self, *args, **options):
        # Optional: delete existing certificates from database
        Certificate.objects.all().delete()
        
        apps = Application.objects.filter(status='approved')
        for app in apps:
            app.certificate_pdf = None
            app.save(update_fields=['certificate_pdf'])
            
        total = apps.count()
        self.stdout.write(f"Found {total} approved applications. Re-generating...")
        
        success_count = 0
        error_count = 0
        
        for app in apps:
            self.stdout.write(f"Generating for app {app.id}...")
            try:
                generate_certificate(app)
                app.refresh_from_db(fields=['certificate_pdf'])
                if app.certificate_pdf:
                    self.stdout.write(self.style.SUCCESS(f"  [OK] Generated for app {app.id}"))
                    success_count += 1
                else:
                    self.stdout.write(self.style.WARNING(f"  [WARN] Failed to attach to app {app.id}"))
            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f"  [ERROR] App {app.id}: {str(e)}"))
                
        self.stdout.write(self.style.SUCCESS(f"\nDone! Generated: {success_count}, Errors: {error_count}"))
