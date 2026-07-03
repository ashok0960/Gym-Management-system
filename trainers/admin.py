
from django.contrib import admin
from .models import Trainer, WorkoutPlan, DietPlan

@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialization', 'experience_years', 'phone', 'is_active']
    list_filter = ['specialization', 'is_active']
    search_fields = ['name', 'email', 'phone']
    list_editable = ['is_active']


@admin.register(WorkoutPlan)
class WorkoutPlanAdmin(admin.ModelAdmin):
    list_display = ['title', 'member', 'trainer', 'start_date', 'is_active']
    list_filter = ['is_active', 'start_date']
    search_fields = ['title', 'member__user__username', 'trainer__name']


@admin.register(DietPlan)
class DietPlanAdmin(admin.ModelAdmin):
    list_display = ['title', 'member', 'trainer', 'start_date', 'is_active']
    list_filter = ['is_active', 'start_date']
    search_fields = ['title', 'member__user__username', 'trainer__name']
