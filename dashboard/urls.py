from django.urls import path
from .views import (
    DashboardStatsView, NotificationListView,
    MarkNotificationReadView, CreateNotificationView,
)

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/read/', MarkNotificationReadView.as_view(), name='mark_all_read'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark_read'),
    path('notifications/create/', CreateNotificationView.as_view(), name='create_notification'),
]
