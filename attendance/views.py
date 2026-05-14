from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import uuid
from .models import Attendance, QRCode
from .serializers import AttendanceSerializer, MarkAttendanceSerializer, QRCodeSerializer
from django.contrib.auth.models import User


class TodayAttendanceView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        today = timezone.now().date()
        profile = self.request.user.profile
        if profile.is_admin or profile.is_vendor:
            return Attendance.objects.filter(date=today).select_related('member', 'gym_class')
        return Attendance.objects.filter(member=self.request.user, date=today)


class MarkAttendanceView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AttendanceSerializer

    def create(self, request, *args, **kwargs):
        profile = request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            return Response({'error': 'Admin or Vendor access required'}, status=status.HTTP_403_FORBIDDEN)

        serializer = MarkAttendanceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        member_id = serializer.validated_data['member_id']
        qr_code = serializer.validated_data.get('qr_code')

        if qr_code:
            try:
                qr = QRCode.objects.get(code=qr_code, is_active=True)
                if not qr.is_valid():
                    return Response({'error': 'QR code expired'}, status=status.HTTP_400_BAD_REQUEST)
            except QRCode.DoesNotExist:
                return Response({'error': 'Invalid QR code'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member = User.objects.get(id=member_id)
        except User.DoesNotExist:
            return Response({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now().date()
        attendance, created = Attendance.objects.get_or_create(
            member=member,
            date=today,
            defaults={'marked_by': request.user}
        )

        if not created:
            return Response({'error': 'Attendance already marked for today'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(AttendanceSerializer(attendance).data, status=status.HTTP_201_CREATED)


class AttendanceReportView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        profile = self.request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            return Attendance.objects.none()

        queryset = Attendance.objects.all().select_related('member', 'gym_class')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month and year:
            queryset = queryset.filter(date__year=year, date__month=month)
        return queryset


class GenerateQRCodeView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            return Response({'error': 'Admin or Vendor access required'}, status=status.HTTP_403_FORBIDDEN)

        # Deactivate old QR codes
        QRCode.objects.filter(is_active=True).update(is_active=False)

        qr_code = QRCode.objects.create(
            code=str(uuid.uuid4())[:8].upper(),
            expires_at=timezone.now() + timedelta(minutes=1)
        )

        return Response(QRCodeSerializer(qr_code).data)
