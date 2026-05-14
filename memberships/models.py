from django.db import models

class MembershipPlan(models.Model):
    DURATION_CHOICES = [
        ('MONTHLY', 'Monthly (30 days)'),
        ('QUARTERLY', 'Quarterly (90 days)'),
        ('HALF_YEARLY', 'Half Yearly (180 days)'),
        ('YEARLY', 'Yearly (365 days)'),
    ]
    
    name = models.CharField(max_length=100)
    duration = models.CharField(max_length=20, choices=DURATION_CHOICES)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    discount_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    features = models.TextField(help_text="Comma separated features")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_duration_display()} - ${self.price}"
    
    def get_features_list(self):
        return [f.strip() for f in self.features.split(',') if f.strip()]
    
    class Meta:
        ordering = ['price']

class MembershipUpgrade(models.Model):
    member = models.ForeignKey('accounts.MemberProfile', on_delete=models.CASCADE, related_name='upgrades')
    old_plan = models.CharField(max_length=10)
    new_plan = models.CharField(max_length=10)
    upgrade_date = models.DateTimeField(auto_now_add=True)
    additional_payment = models.DecimalField(max_digits=8, decimal_places=2)
    
    def __str__(self):
        return f"{self.member.user.username} - {self.old_plan} to {self.new_plan}"