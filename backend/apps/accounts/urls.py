from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.me_view, name='me'),
    path('change-password/', views.change_password_view, name='change_password'),
    path('users/', views.AdminUserListCreateView.as_view(), name='admin_users'),
    path('users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin_user_detail'),
]
