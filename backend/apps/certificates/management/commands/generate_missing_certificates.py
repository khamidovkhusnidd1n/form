from django.core.management.base import BaseCommand
from apps.applications.models import Application
from apps.certificates.services import generate_certificate
import traceback

class Command(BaseCommand):
    help = 'Generates missing certificates for all approved applications'

    def handle(self, *args, **options):
        apps = Application.objects.filter(status='approved')
        total = apps.count()
        self.stdout.write(f"Found {total} approved applications.")
        
        success_count = 0
        error_count = 0
        
        for app in apps:
            if not app.certificate_pdf:
                self.stdout.write(f"Generating for app {app.id}...")
                try:
                    generate_certificate(app)
                    app.refresh_from_db(fields=['certificate_pdf'])
                    if app.certificate_pdf:
                        self.stdout.write(self.style.SUCCESS(f"  [OK] Generated for app {app.id}: {app.certificate_pdf.name}"))
                        success_count += 1
                    else:
                        self.stdout.write(self.style.WARNING(f"  [WARN] Failed to attach to app {app.id}"))
                except Exception as e:
                    error_count += 1
                    self.stdout.write(self.style.ERROR(f"  [ERROR] App {app.id}: {str(e)}"))
                    self.stdout.write(traceback.format_exc())
            else:
                self.stdout.write(f"App {app.id} already has a certificate.")
                
        self.stdout.write(self.style.SUCCESS(f"\nDone! Generated: {success_count}, Errors: {error_count}"))
