from django.urls import path
from .views import TodayAttendanceView, MarkAttendanceView, AttendanceReportView, GenerateQRCodeView

urlpatterns = [
    path('today/', TodayAttendanceView.as_view(), name='today_attendance'),
    path('mark/', MarkAttendanceView.as_view(), name='mark_attendance'),
    path('report/', AttendanceReportView.as_view(), name='attendance_report'),
    path('generate-qr/', GenerateQRCodeView.as_view(), name='generate_qr'),
]