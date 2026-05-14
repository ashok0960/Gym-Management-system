from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GymClassViewSet, ClassTypeListView

router = DefaultRouter()
router.register(r'list', GymClassViewSet, basename='class')

urlpatterns = [
    path('', include(router.urls)),
    path('types/', ClassTypeListView.as_view(), name='class_types'),
]