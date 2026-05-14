from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
import uuid
from .models import Payment
from .serializers import PaymentSerializer, CreatePaymentSerializer


class PaymentListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        profile = self.request.user.profile
        if profile.is_admin or profile.is_vendor:
            return Payment.objects.all()
        return Payment.objects.filter(member=self.request.user)


class CreatePaymentView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreatePaymentSerializer

    def perform_create(self, serializer):
        # Generate a unique transaction ID
        transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"

        payment = serializer.save(
            member=self.request.user,
            status='COMPLETED',
            transaction_id=transaction_id
        )

        profile = self.request.user.profile
        plan = payment.membership_plan

        if plan:
            duration_map = {
                'MONTHLY': 30,
                'QUARTERLY': 90,
                'HALF_YEARLY': 180,
                'YEARLY': 365,
            }
            days = duration_map.get(plan.duration, 30)

            if profile.membership_end and profile.membership_end > timezone.now().date():
                profile.membership_end += timedelta(days=days)
            else:
                profile.membership_end = timezone.now().date() + timedelta(days=days)

            # Map plan name to membership type choice
            plan_name_upper = plan.name.upper().strip()
            valid_types = ['BASIC', 'PREMIUM', 'VIP']
            if plan_name_upper in valid_types:
                profile.membership_type = plan_name_upper

            profile.is_active = True
            profile.save()


class PaymentHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(member=self.request.user)


class PaymentStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            return Response({'error': 'Admin or Vendor access required'}, status=status.HTTP_403_FORBIDDEN)

        total_revenue = Payment.objects.filter(status='COMPLETED').aggregate(Sum('amount'))['amount__sum'] or 0
        monthly_revenue = Payment.objects.filter(
            status='COMPLETED',
            payment_date__month=timezone.now().month,
            payment_date__year=timezone.now().year,
        ).aggregate(Sum('amount'))['amount__sum'] or 0

        return Response({
            'total_revenue': float(total_revenue),
            'monthly_revenue': float(monthly_revenue),
            'total_transactions': Payment.objects.filter(status='COMPLETED').count(),
            'pending_payments': Payment.objects.filter(status='PENDING').count(),
        })
