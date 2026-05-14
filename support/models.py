from django.db import models
from django.contrib.auth.models import User


class SupportTicket(models.Model):
    STATUS = [('OPEN', 'Open'), ('IN_PROGRESS', 'In Progress'), ('RESOLVED', 'Resolved')]

    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    subject = models.CharField(max_length=200, default='Support Request')
    status = models.CharField(max_length=20, choices=STATUS, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_escalated = models.BooleanField(default=False)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Ticket #{self.id} - {self.member.username} - {self.status}"


class SupportMessage(models.Model):
    SENDER_TYPES = [('USER', 'User'), ('AI', 'AI'), ('STAFF', 'Staff')]

    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    sender_type = models.CharField(max_length=10, choices=SENDER_TYPES, default='USER')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Msg in Ticket #{self.ticket_id} by {self.sender_type}"
