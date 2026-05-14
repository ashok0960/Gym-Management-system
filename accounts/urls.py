from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView, UpdateProfileView,
    ChangePasswordView, AllMembersView, ToggleMemberStatusView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='update_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('members/', AllMembersView.as_view(), name='all_members'),
    path('members/<int:member_id>/toggle-status/', ToggleMemberStatusView.as_view(), name='toggle_member_status'),
]