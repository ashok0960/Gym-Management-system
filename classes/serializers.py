from rest_framework import serializers
from .models import GymClass, ClassBooking
from trainers.serializers import TrainerSerializer
from accounts.serializers import UserSerializer

class GymClassSerializer(serializers.ModelSerializer):
    trainer_details = TrainerSerializer(source='trainer', read_only=True)
    available_spots = serializers.SerializerMethodField()
    class_type_display = serializers.SerializerMethodField()
    day_display = serializers.SerializerMethodField()
    
    class Meta:
        model = GymClass
        fields = '__all__'
    
    def get_available_spots(self, obj):
        return obj.available_spots
    
    def get_class_type_display(self, obj):
        return obj.get_class_type_display()
    
    def get_day_display(self, obj):
        return obj.get_day_of_week_display()

class ClassBookingSerializer(serializers.ModelSerializer):
    class_details = GymClassSerializer(source='gym_class', read_only=True)
    member_details = UserSerializer(source='member', read_only=True)
    
    class Meta:
        model = ClassBooking
        fields = '__all__'