from rest_framework import serializers
from .models import MembershipPlan, MembershipUpgrade

class MembershipPlanSerializer(serializers.ModelSerializer):
    features_list = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()
    
    class Meta:
        model = MembershipPlan
        fields = '__all__'
    
    def get_features_list(self, obj):
        return obj.get_features_list()
    
    def get_final_price(self, obj):
        return obj.discount_price if obj.discount_price else obj.price

class MembershipUpgradeSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MembershipUpgrade
        fields = '__all__'
    
    def get_member_name(self, obj):
        return obj.member.user.get_full_name()