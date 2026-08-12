from django.db.models import Count
from django.utils import timezone
from datetime import timedelta, datetime
from apps.applications.models import Application
from apps.events.models import Event

class ReportService:
    @staticmethod
    def dashboard_summary():
        today = timezone.now().date()
        
        months = []
        monthly_stats = []
        
        for i in range(5, -1, -1):
            d = today - timedelta(days=30*i)
            start_date = d.replace(day=1)
            next_month = (start_date.replace(day=28) + timedelta(days=4)).replace(day=1)
            
            start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
            next_dt = timezone.make_aware(datetime.combine(next_month, datetime.min.time()))
            
            count = Application.objects.filter(submitted_at__gte=start_dt, submitted_at__lt=next_dt).count()
            monthly_stats.append({
                'month': start_date.strftime('%b'),
                'arizalar': count
            })

        return {
            'total_applications': Application.objects.count(),
            'approved': Application.objects.filter(status='approved').count(),
            'rejected': Application.objects.filter(status='rejected').count(),
            'pending': Application.objects.filter(status='submitted').count(),
            'under_review': Application.objects.filter(status='under_review').count(),
            'info_required': Application.objects.filter(status='info_required').count(),
            'today_applications': Application.objects.filter(submitted_at__date=today).count(),
            'by_event': list(
                Application.objects.values('event__title').annotate(count=Count('id')).order_by('-count')[:10]
            ),
            'by_region': list(
                Application.objects.values('region').annotate(count=Count('id')).order_by('-count')[:10]
            ),
            'events': Event.objects.count(),
            'active_events': Event.objects.filter(status__in=['published', 'draft']).count(),
            'monthly_applications': monthly_stats,
        }
