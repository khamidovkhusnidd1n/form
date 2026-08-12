from django.urls import path
from . import views

urlpatterns = [
    path('', views.EventListView.as_view(), name='event_list'),
    path('<int:pk>/', views.EventDetailView.as_view(), name='event_detail'),
    path('admin/', views.AdminEventListCreateView.as_view(), name='admin_event_list'),
    path('admin/<int:pk>/', views.AdminEventDetailView.as_view(), name='admin_event_detail'),
    path('admin/<int:pk>/gallery/', views.add_gallery_image, name='add_gallery'),
    path('stats/', views.dashboard_stats, name='dashboard_stats'),
]
