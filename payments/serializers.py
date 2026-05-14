from rest_framework import serializers
from .models import Payment
from accounts.serializers import UserSerializer
from memberships.serializers import MembershipPlanSerializer

class PaymentSerializer(serializers.ModelSerializer):
    member_details = UserSerializer(source='member', read_only=True)
    plan_details = MembershipPlanSerializer(source='membership_plan', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['payment_date', 'transaction_id']

class CreatePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['amount', 'payment_method', 'membership_plan', 'notes']