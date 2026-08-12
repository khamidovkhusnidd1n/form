from django.urls import path
from . import views

urlpatterns = [
    path('', views.FAQListView.as_view(), name='faq_list'),
    path('admin/', views.AdminFAQListCreateView.as_view(), name='admin_faq_list'),
    path('admin/<int:pk>/', views.AdminFAQDetailView.as_view(), name='admin_faq_detail'),
]
