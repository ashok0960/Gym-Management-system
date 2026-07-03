from rest_framework import serializers
from .models import Trainer, WorkoutPlan, DietPlan, BodyMetrics


class TrainerSerializer(serializers.ModelSerializer):
    specialization_display = serializers.SerializerMethodField()
    assigned_members_count = serializers.SerializerMethodField()

    class Meta:
        model = Trainer
        fields = '__all__'

    def get_specialization_display(self, obj):
        return obj.get_specialization_display()

    def get_assigned_members_count(self, obj):
        return obj.assigned_member_profiles.count()


class WorkoutPlanSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    trainer_name = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPlan
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_member_name(self, obj):
        return obj.member.user.get_full_name() or obj.member.user.username

    def get_trainer_name(self, obj):
        return obj.trainer.name if obj.trainer else None


class DietPlanSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    trainer_name = serializers.SerializerMethodField()

    class Meta:
        model = DietPlan
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_member_name(self, obj):
        return obj.member.user.get_full_name() or obj.member.user.username

    def get_trainer_name(self, obj):
        return obj.trainer.name if obj.trainer else None


class BodyMetricsSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    recorded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = BodyMetrics
        fields = '__all__'
        read_only_fields = ['recorded_at', 'bmi']

    def get_member_name(self, obj):
        return obj.member.user.get_full_name() or obj.member.user.username

    def get_recorded_by_name(self, obj):
        return obj.recorded_by.get_full_name() or obj.recorded_by.username if obj.recorded_by else None
