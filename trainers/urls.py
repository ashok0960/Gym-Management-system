from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TrainerViewSet, AvailableSpecializationsView, AssignedMembersView,
    WorkoutPlanViewSet, DietPlanViewSet, BodyMetricsViewSet,
)

router = DefaultRouter()
router.register(r'list', TrainerViewSet, basename='trainer')
router.register(r'workout-plans', WorkoutPlanViewSet, basename='workout-plan')
router.register(r'diet-plans', DietPlanViewSet, basename='diet-plan')
router.register(r'body-metrics', BodyMetricsViewSet, basename='body-metrics')

urlpatterns = [
    path('', include(router.urls)),
    path('specializations/', AvailableSpecializationsView.as_view(), name='specializations'),
    path('assigned-members/', AssignedMembersView.as_view(), name='assigned_members'),
]
