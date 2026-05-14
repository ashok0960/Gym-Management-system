from django.db import models
from django.contrib.auth.models import User
from memberships.models import MembershipPlan
import uuid

class Payment(models.Model):
    PAYMENT_STATUS = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('COMPLETED', 'Completed'),
        ('OVERDUE', 'Overdue'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]
    
    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('CARD', 'Credit/Debit Card'),
        ('ONLINE', 'Online Transfer'),
        ('KHALTI', 'Khalti'),
        ('ESEWA', 'eSewa'),
    ]
    
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    membership_plan = models.ForeignKey(MembershipPlan, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=100, unique=True, default=uuid.uuid4)
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='PENDING')
    receipt_url = models.CharField(max_length=500, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.member.username} - ${self.amount} - {self.status}"

    @property
    def receipt_number(self):
        return f"RCPT-{self.id:06d}" if self.id else ""
    
    class Meta:
        ordering = ['-payment_date']
