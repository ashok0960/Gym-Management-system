from django.urls import path
from .views import *

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('send-verification-code/', SendEmailVerificationCodeView.as_view(), name='send_verification_code'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='update_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('members/', AllMembersView.as_view(), name='all_members'),
    path('members/manage/', MemberListCreateView.as_view(), name='manage_members'),
    path('members/manage/<int:pk>/', MemberDetailView.as_view(), name='manage_member_detail'),
    path('members/<int:member_id>/toggle-status/', ToggleMemberStatusView.as_view(), name='toggle_member_status'),
]
