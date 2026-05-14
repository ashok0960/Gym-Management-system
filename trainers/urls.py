from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainerViewSet, AvailableSpecializationsView

router = DefaultRouter()
router.register(r'list', TrainerViewSet, basename='trainer')

urlpatterns = [
    path('', include(router.urls)),
    path('specializations/', AvailableSpecializationsView.as_view(), name='specializations'),
]