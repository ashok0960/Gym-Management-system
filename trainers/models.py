from django.db import models
from django.contrib.auth.models import User


class Trainer(models.Model):
    SPECIALIZATIONS = [
        ('STRENGTH', 'Strength Training'),
        ('CARDIO', 'Cardio'),
        ('YOGA', 'Yoga'),
        ('HIIT', 'HIIT'),
        ('NUTRITION', 'Nutrition'),
        ('REHAB', 'Rehabilitation'),
        ('BOXING', 'Boxing'),
        ('PILATES', 'Pilates'),
    ]

    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='trainer_profile')
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    specialization = models.CharField(max_length=20, choices=SPECIALIZATIONS)
    experience_years = models.IntegerField(default=0)
    bio = models.TextField(blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    profile_image = models.ImageField(upload_to='trainers/', null=True, blank=True)
    instagram = models.URLField(blank=True)
    facebook = models.URLField(blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    schedule_notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    joining_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.get_specialization_display()}"

    class Meta:
        ordering = ['name']


class WorkoutPlan(models.Model):
    member = models.ForeignKey('accounts.MemberProfile', on_delete=models.CASCADE, related_name='workout_plans')
    trainer = models.ForeignKey(Trainer, on_delete=models.SET_NULL, null=True, blank=True, related_name='workout_plans')
    title = models.CharField(max_length=150)
    goal = models.CharField(max_length=200, blank=True)
    weekly_schedule = models.TextField(help_text='Describe the weekly workout split and exercises')
    notes = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.member.user.username} - {self.title}"

    class Meta:
        ordering = ['-created_at']


class DietPlan(models.Model):
    member = models.ForeignKey('accounts.MemberProfile', on_delete=models.CASCADE, related_name='diet_plans')
    trainer = models.ForeignKey(Trainer, on_delete=models.SET_NULL, null=True, blank=True, related_name='diet_plans')
    title = models.CharField(max_length=150)
    calories_per_day = models.PositiveIntegerField(null=True, blank=True)
    protein_goal = models.CharField(max_length=100, blank=True)
    meal_plan = models.TextField(help_text='Breakfast, lunch, dinner, snacks, and hydration guidance')
    notes = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.member.user.username} - {self.title}"

    class Meta:
        ordering = ['-created_at']
