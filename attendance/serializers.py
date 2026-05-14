from rest_framework import serializers
from .models import Attendance, QRCode
from accounts.serializers import UserSerializer
from classes.serializers import GymClassSerializer

class AttendanceSerializer(serializers.ModelSerializer):
    member_details = UserSerializer(source='member', read_only=True)
    class_details = GymClassSerializer(source='gym_class', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'

class MarkAttendanceSerializer(serializers.Serializer):
    member_id = serializers.IntegerField()
    class_id = serializers.IntegerField(required=False)
    qr_code = serializers.CharField(required=False)

class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = '__all__'