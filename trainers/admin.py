
from django.contrib import admin
from .models import Trainer

@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialization', 'experience_years', 'phone', 'is_active']
    list_filter = ['specialization', 'is_active']
    search_fields = ['name', 'email', 'phone']
    list_editable = ['is_active']