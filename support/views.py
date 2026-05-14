from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import SupportTicket, SupportMessage
from .serializers import SupportTicketSerializer, SupportTicketListSerializer, SupportMessageSerializer

# Simple rule-based AI responses for gym guidance
AI_RESPONSES = {
    'class': 'To book a class, go to the Classes page and click "Book Now". You can cancel anytime before the class starts.',
    'book': 'To book a class, go to the Classes page and click "Book Now". Payment is required at booking.',
    'payment': 'We accept Cash, Card, eSewa, and Khalti. Go to Payments page to view your history or make a new payment.',
    'membership': 'We offer Monthly, Quarterly, Half-Yearly, and Yearly plans. Visit the Memberships page to see all plans and pricing in Rs.',
    'trainer': 'You can view all our certified trainers on the Trainers page. Each trainer has their specialization and experience listed.',
    'attendance': 'Your attendance is tracked automatically when you check in. View your attendance history on the Attendance page.',
    'cancel': 'You can cancel a class booking from the Classes page by clicking "Cancel Booking" on your booked class.',
    'password': 'To change your password, go to your Profile page and use the Change Password section.',
    'profile': 'You can update your profile information, including phone, address, and emergency contact, on the Profile page.',
    'schedule': 'Class schedules are shown on the Classes page. Each class shows the day, time, trainer, and available spots.',
    'price': 'All our membership plans are priced in Nepali Rupees (Rs.). Visit the Memberships page to see current pricing.',
    'esewa': 'We accept eSewa payments. Select eSewa as your payment method when making a payment.',
    'khalti': 'We accept Khalti payments. Select Khalti as your payment method when making a payment.',
    'refund': 'For refund requests, please describe your issue and our staff will assist you shortly.',
    'help': 'I can help you with: booking classes, membership plans, payments, trainer info, attendance, and profile settings. What do you need?',
}

ESCALATION_KEYWORDS = [
    'refund', 'complaint', 'problem', 'issue', 'error', 'wrong', 'broken',
    'not working', 'failed', 'dispute', 'charge', 'overcharged', 'urgent',
    'manager', 'staff', 'human', 'person', 'speak', 'talk', 'contact',
]

def get_ai_response(message):
    msg_lower = message.lower()
    for keyword, response in AI_RESPONSES.items():
        if keyword in msg_lower:
            return response, False
    # Check if needs escalation
    for kw in ESCALATION_KEYWORDS:
        if kw in msg_lower:
            return (
                "I understand this needs personal attention. I'm escalating your message to our staff. "
                "An admin or vendor will respond to you shortly. Thank you for your patience! 🙏",
                True
            )
    return (
        "Thank you for your message! I can help with class bookings, memberships, payments, trainers, and attendance. "
        "Could you please be more specific about what you need help with?",
        False
    )


class MyTicketView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get or return user's active ticket
        ticket = SupportTicket.objects.filter(member=request.user).first()
        if not ticket:
            return Response(None)
        return Response(SupportTicketSerializer(ticket).data)

    def post(self, request):
        # Send a message — creates ticket if none exists
        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response({'error': 'Message required'}, status=status.HTTP_400_BAD_REQUEST)

        ticket, _ = SupportTicket.objects.get_or_create(
            member=request.user,
            status__in=['OPEN', 'IN_PROGRESS'],
            defaults={'subject': message_text[:100]}
        )

        # Save user message
        SupportMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            sender_type='USER',
            message=message_text
        )

        # Get AI response
        ai_text, should_escalate = get_ai_response(message_text)

        SupportMessage.objects.create(
            ticket=ticket,
            sender=None,
            sender_type='AI',
            message=ai_text
        )

        if should_escalate and not ticket.is_escalated:
            ticket.is_escalated = True
            ticket.status = 'IN_PROGRESS'
            ticket.save()

        return Response(SupportTicketSerializer(ticket).data)


class StaffTicketsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportTicketListSerializer

    def get_queryset(self):
        profile = self.request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            return SupportTicket.objects.none()
        return SupportTicket.objects.filter(is_escalated=True)


class StaffReplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, ticket_id):
        profile = request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            return Response({'error': 'Staff only'}, status=status.HTTP_403_FORBIDDEN)

        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response({'error': 'Message required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ticket = SupportTicket.objects.get(id=ticket_id)
        except SupportTicket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

        SupportMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            sender_type='STAFF',
            message=message_text
        )

        ticket.status = 'IN_PROGRESS'
        ticket.save()

        return Response(SupportTicketSerializer(ticket).data)


class StaffTicketDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ticket_id):
        profile = request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            return Response({'error': 'Staff only'}, status=status.HTTP_403_FORBIDDEN)
        try:
            ticket = SupportTicket.objects.get(id=ticket_id)
            return Response(SupportTicketSerializer(ticket).data)
        except SupportTicket.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, ticket_id):
        profile = request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            return Response({'error': 'Staff only'}, status=status.HTTP_403_FORBIDDEN)
        try:
            ticket = SupportTicket.objects.get(id=ticket_id)
            new_status = request.data.get('status')
            if new_status:
                ticket.status = new_status
                ticket.save()
            return Response(SupportTicketSerializer(ticket).data)
        except SupportTicket.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
