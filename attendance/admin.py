from django.contrib import admin
from .models import Attendance, QRCode

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['member', 'date', 'check_in_time', 'marked_by']
    list_filter = ['date', 'marked_by']
    search_fields = ['member__username']
    date_hierarchy = 'date'

@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'created_at', 'expires_at', 'is_active']
    list_filter = ['is_active']