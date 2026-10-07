from django.urls import path
from . import views
from . import debug_views

urlpatterns = [
    path('submit/', views.SubmitApplicationView.as_view(), name='submit_application'),
    path('me/', views.MyApplicationListView.as_view(), name='my_applications'),
    path('me/<int:pk>/', views.MyApplicationUpdateView.as_view(), name='my_application_update'),
    path('debug-me/', debug_views.DebugMeView.as_view(), name='debug_me'),
    path('me/<int:pk>/reply/', views.UserReplyView.as_view(), name='user_reply'),
    path('track/<str:application_id>/', views.TrackApplicationView.as_view(), name='track_application'),
    path('admin/', views.AdminApplicationListView.as_view(), name='admin_applications'),
    path('admin/export/excel/', views.export_applications_excel, name='export_excel'),
    path('admin/bulk-remove/', views.bulk_delete_applications, name='bulk_delete_applications'),
    path('admin/bulk-remove', views.bulk_delete_applications),
    path('admin/bulk-status/', views.bulk_status_applications, name='bulk_status_applications'),
    path('admin/<int:pk>/', views.AdminApplicationDetailView.as_view(), name='admin_application_detail'),
    path('admin/<int:pk>/status/', views.update_application_status, name='update_status'),
    path('admin/<int:pk>/check-in/', views.check_in_application, name='check_in'),
    path('debug/cert/<int:pk>/', debug_views.test_cert_generation, name='debug_cert'),
]
