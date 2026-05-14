from django.urls import path
from .views import MyTicketView, StaffTicketsView, StaffReplyView, StaffTicketDetailView

urlpatterns = [
    path('my/', MyTicketView.as_view(), name='my_ticket'),
    path('staff/tickets/', StaffTicketsView.as_view(), name='staff_tickets'),
    path('staff/tickets/<int:ticket_id>/', StaffTicketDetailView.as_view(), name='staff_ticket_detail'),
    path('staff/tickets/<int:ticket_id>/reply/', StaffReplyView.as_view(), name='staff_reply'),
]
