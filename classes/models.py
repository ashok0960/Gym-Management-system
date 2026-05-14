from django.db import models
from django.contrib.auth.models import User
from trainers.models import Trainer

class GymClass(models.Model):
    CLASS_TYPES = [
        ('YOGA', '🧘 Yoga'),
        ('ZUMBA', '💃 Zumba'),
        ('CROSSFIT', '🏋️ CrossFit'),
        ('BOXING', '🥊 Boxing'),
        ('SPINNING', '🚴 Spinning'),
        ('PILATES', '✨ Pilates'),
        ('AEROBICS', '🤸 Aerobics'),
        ('MEDITATION', '🧠 Meditation'),
    ]
    
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    name = models.CharField(max_length=100)
    class_type = models.CharField(max_length=20, choices=CLASS_TYPES)
    trainer = models.ForeignKey(Trainer, on_delete=models.SET_NULL, null=True, related_name='classes')
    description = models.TextField()
    capacity = models.IntegerField()
    current_bookings = models.IntegerField(default=0)
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.IntegerField()
    location = models.CharField(max_length=200)
    difficulty_level = models.CharField(max_length=20, choices=[('BEGINNER', 'Beginner'), ('INTERMEDIATE', 'Intermediate'), ('ADVANCED', 'Advanced')])
    equipment_needed = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    members = models.ManyToManyField(User, through='ClassBooking', related_name='booked_classes')
    
    def __str__(self):
        return f"{self.name} - {self.get_day_of_week_display()} {self.start_time}"
    
    @property
    def available_spots(self):
        confirmed = self.classbooking_set.filter(status='CONFIRMED').count()
        return max(0, self.capacity - confirmed)

class ClassBooking(models.Model):
    STATUS_CHOICES = [
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
        ('NO_SHOW', 'No Show'),
    ]
    
    member = models.ForeignKey(User, on_delete=models.CASCADE)
    gym_class = models.ForeignKey(GymClass, on_delete=models.CASCADE)
    booking_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='CONFIRMED')
    attended = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-booking_date']
    
    def __str__(self):
        return f"{self.member.username} - {self.gym_class.name} - {self.status}"