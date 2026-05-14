from django.db import models
from django.contrib.auth.models import User
from classes.models import GymClass
from django.utils import timezone

class Attendance(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    gym_class = models.ForeignKey(GymClass, on_delete=models.SET_NULL, null=True, blank=True)
    check_in_time = models.DateTimeField(auto_now_add=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    date = models.DateField(auto_now_add=True)
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='marked_attendances')
    
    def __str__(self):
        return f"{self.member.username} - {self.date}"
    
    class Meta:
        ordering = ['-date', '-check_in_time']
        unique_together = ['member', 'date']

class QRCode(models.Model):
    code = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.code
    
    def is_valid(self):
        return self.is_active and self.expires_at > timezone.now()