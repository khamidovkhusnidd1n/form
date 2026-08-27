from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.SubmitApplicationView.as_view(), name='submit_application'),
    path('track/<str:application_id>/', views.track_application, name='track_application'),
    path('admin/', views.AdminApplicationListView.as_view(), name='admin_applications'),
    path('admin/export/excel/', views.export_applications_excel, name='export_excel'),
    path('admin/bulk-delete/', views.bulk_delete_applications, name='bulk_delete_applications'),
    path('admin/bulk-status/', views.bulk_status_applications, name='bulk_status_applications'),
    path('admin/<int:pk>/', views.AdminApplicationDetailView.as_view(), name='admin_application_detail'),
    path('admin/<int:pk>/status/', views.update_application_status, name='update_status'),
    path('admin/<int:pk>/check-in/', views.check_in_application, name='check_in'),
]
