from django.urls import path
from .views import PaymentListView, CreatePaymentView, PaymentHistoryView, PaymentStatsView

urlpatterns = [
    path('', PaymentListView.as_view(), name='payments'),
    path('create/', CreatePaymentView.as_view(), name='create_payment'),
    path('history/', PaymentHistoryView.as_view(), name='payment_history'),
    path('stats/', PaymentStatsView.as_view(), name='payment_stats'),
]