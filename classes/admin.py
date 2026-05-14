from django.contrib import admin
from .models import GymClass, ClassBooking

@admin.register(GymClass)
class GymClassAdmin(admin.ModelAdmin):
    list_display = ['name', 'class_type', 'trainer', 'day_of_week', 'start_time', 'capacity', 'current_bookings']
    list_filter = ['class_type', 'day_of_week', 'is_active', 'difficulty_level']
    search_fields = ['name', 'trainer__name']
    list_editable = ['capacity']

@admin.register(ClassBooking)
class ClassBookingAdmin(admin.ModelAdmin):
    list_display = ['member', 'gym_class', 'booking_date', 'status', 'attended']
    list_filter = ['status', 'attended', 'booking_date']
    search_fields = ['member__username', 'gym_class__name']