
from django.urls import path
from . import views

urlpatterns = [
    path('verify/<str:token>/', views.VerifyCertificateView.as_view(), name='verify_certificate'),
]
