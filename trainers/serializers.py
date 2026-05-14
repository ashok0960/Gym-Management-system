from rest_framework import serializers
from .models import Trainer

class TrainerSerializer(serializers.ModelSerializer):
    specialization_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Trainer
        fields = '__all__'
    
    def get_specialization_display(self, obj):
        return obj.get_specialization_display()