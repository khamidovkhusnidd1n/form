from django.urls import path
from .views import verify_qr

urlpatterns = [
    path('verify/<str:qr_type>/<int:object_id>/', verify_qr, name='verify_qr'),
]
