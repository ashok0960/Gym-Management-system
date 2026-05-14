from django.db import models

class Trainer(models.Model):
    SPECIALIZATIONS = [
        ('STRENGTH', '🏋️ Strength Training'),
        ('CARDIO', '🏃 Cardio'),
        ('YOGA', '🧘 Yoga'),
        ('HIIT', '⚡ HIIT'),
        ('NUTRITION', '🥗 Nutrition'),
        ('REHAB', '💪 Rehabilitation'),
        ('BOXING', '🥊 Boxing'),
        ('PILATES', '✨ Pilates'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    specialization = models.CharField(max_length=20, choices=SPECIALIZATIONS)
    experience_years = models.IntegerField()
    bio = models.TextField()
    qualification = models.CharField(max_length=200)
    profile_image = models.ImageField(upload_to='trainers/', null=True, blank=True)
    instagram = models.URLField(blank=True)
    facebook = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    joining_date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_specialization_display()}"
    
    class Meta:
        ordering = ['name']