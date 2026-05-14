from rest_framework import serializers
from .models import SupportTicket, SupportMessage


class SupportMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = SupportMessage
        fields = ['id', 'sender_type', 'sender_name', 'message', 'created_at']

    def get_sender_name(self, obj):
        if obj.sender_type == 'AI':
            return 'GymMS Assistant'
        if obj.sender:
            profile = getattr(obj.sender, 'profile', None)
            if profile and (profile.is_admin or profile.is_vendor):
                return f"{'Admin' if profile.is_admin else 'Vendor'} - {obj.sender.username}"
            return obj.sender.username
        return 'Support'


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = SupportMessageSerializer(many=True, read_only=True)
    member_username = serializers.CharField(source='member.username', read_only=True)

    class Meta:
        model = SupportTicket
        fields = ['id', 'subject', 'status', 'is_escalated', 'created_at', 'updated_at', 'member_username', 'messages']


class SupportTicketListSerializer(serializers.ModelSerializer):
    member_username = serializers.CharField(source='member.username', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = SupportTicket
        fields = ['id', 'subject', 'status', 'is_escalated', 'updated_at', 'member_username', 'last_message', 'unread_count']

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return msg.message[:80] if msg else ''

    def get_unread_count(self, obj):
        return obj.messages.filter(sender_type='USER').count()
