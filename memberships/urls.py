from django.urls import path
from .views import MembershipPlanListView, MembershipPlanDetailView, UpgradeMembershipView

urlpatterns = [
    path('plans/', MembershipPlanListView.as_view(), name='membership_plans'),
    path('plans/<int:pk>/', MembershipPlanDetailView.as_view(), name='membership_plan_detail'),
    path('upgrade/', UpgradeMembershipView.as_view(), name='upgrade_membership'),
]
