from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from classes.models import GymClass, ClassBooking
from payments.models import Payment
from attendance.models import Attendance
from accounts.models import MemberProfile
from trainers.models import Trainer
from .models import Notification
from rest_framework import serializers


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['created_at', 'recipient']


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        if not (profile.is_admin or profile.is_trainer):
            return Response({'error': 'Admin or Trainer access required'}, status=403)

        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        member_queryset = MemberProfile.objects.filter(role='MEMBER')
        if profile.is_trainer and not profile.is_admin:
            member_queryset = member_queryset.filter(
                assigned_trainer=getattr(request.user, 'trainer_profile', None)
            )

        total_members = member_queryset.count()
        active_members = member_queryset.filter(is_active=True).count()
        inactive_members = total_members - active_members

        # Expiring memberships (next 7 days)
        expiring_soon = member_queryset.filter(
            membership_end__gte=today,
            membership_end__lte=today + timedelta(days=7)
        ).count()

        # Expired memberships
        expired_memberships = member_queryset.filter(
            membership_end__lt=today
        ).count()

        total_classes = GymClass.objects.filter(is_active=True).count()
        todays_classes = GymClass.objects.filter(is_active=True, day_of_week=today.weekday()).count()
        total_trainers = Trainer.objects.filter(is_active=True).count()
        total_bookings = ClassBooking.objects.count()

        paid_statuses = ['PAID', 'COMPLETED']
        total_revenue = Payment.objects.filter(status__in=paid_statuses).aggregate(Sum('amount'))['amount__sum'] or 0
        revenue_this_month = Payment.objects.filter(
            status__in=paid_statuses,
            payment_date__gte=month_ago
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        revenue_this_week = Payment.objects.filter(
            status__in=paid_statuses,
            payment_date__gte=week_ago
        ).aggregate(Sum('amount'))['amount__sum'] or 0

        attendance_today = Attendance.objects.filter(date=today).count()
        attendance_this_week = Attendance.objects.filter(date__gte=week_ago).count()

        new_members_this_week = member_queryset.filter(created_at__date__gte=week_ago).count()
        new_members_this_month = member_queryset.filter(created_at__date__gte=month_ago).count()

        upcoming_bookings = ClassBooking.objects.filter(
            status='CONFIRMED',
            gym_class__day_of_week__gte=today.weekday()
        ).count()

        attendance_rate = round((attendance_this_week / max(total_members * 7, 1)) * 100, 2)
        membership_stats = member_queryset.values('membership_type').annotate(count=Count('id'))

        # Monthly revenue for last 6 months
        monthly_revenue = []
        for i in range(6):
            month_date = today - timedelta(days=30 * i)
            revenue = Payment.objects.filter(
                status__in=paid_statuses,
                payment_date__year=month_date.year,
                payment_date__month=month_date.month
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            monthly_revenue.append({
                'month': month_date.strftime('%b %Y'),
                'revenue': float(revenue)
            })

        # Weekly attendance for last 4 weeks
        weekly_attendance = []
        for i in range(4):
            week_start = today - timedelta(days=7 * (i + 1))
            week_end = today - timedelta(days=7 * i)
            count = Attendance.objects.filter(date__gte=week_start, date__lt=week_end).count()
            weekly_attendance.append({
                'week': f"Week {4 - i}",
                'count': count
            })

        recent_payments = Payment.objects.filter(
            status__in=paid_statuses
        ).select_related('member').order_by('-payment_date')[:5]

        trainer_performance = [
            {
                'trainer': row['assigned_trainer__name'] or 'Unassigned',
                'members': row['count'],
            }
            for row in member_queryset.values('assigned_trainer__name').annotate(count=Count('id')).order_by('-count')[:10]
        ]

        # Class popularity
        class_popularity = list(
            ClassBooking.objects.filter(status='CONFIRMED')
            .values('gym_class__name', 'gym_class__class_type')
            .annotate(bookings=Count('id'))
            .order_by('-bookings')[:5]
        )

        # Unread notifications count
        unread_notifications = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).count()

        return Response({
            'total_members': total_members,
            'active_members': active_members,
            'inactive_members': inactive_members,
            'expiring_soon': expiring_soon,
            'expired_memberships': expired_memberships,
            'total_classes': total_classes,
            'total_trainers': total_trainers,
            'todays_classes': todays_classes,
            'total_bookings': total_bookings,
            'upcoming_bookings': upcoming_bookings,
            'total_revenue': float(total_revenue),
            'revenue_this_month': float(revenue_this_month),
            'revenue_this_week': float(revenue_this_week),
            'attendance_today': attendance_today,
            'attendance_this_week': attendance_this_week,
            'attendance_rate': attendance_rate,
            'new_members_this_week': new_members_this_week,
            'new_members_this_month': new_members_this_month,
            'membership_distribution': list(membership_stats),
            'trainer_performance': trainer_performance,
            'monthly_revenue': monthly_revenue[::-1],
            'weekly_attendance': weekly_attendance,
            'class_popularity': class_popularity,
            'unread_notifications': unread_notifications,
            'recent_payments': [
                {
                    'member': p.member.username,
                    'amount': float(p.amount),
                    'date': p.payment_date.strftime('%Y-%m-%d'),
                    'method': p.payment_method,
                } for p in recent_payments
            ],
        })


class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        qs = Notification.objects.filter(recipient=self.request.user)
        unread_only = self.request.query_params.get('unread')
        if unread_only == 'true':
            qs = qs.filter(is_read=False)
        return qs[:50]


class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        if pk:
            Notification.objects.filter(id=pk, recipient=request.user).update(is_read=True)
        else:
            Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'Marked as read'})


class CreateNotificationView(APIView):
    """Admin-only: broadcast notification to all members or specific user."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.profile.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        from django.contrib.auth.models import User
        title = request.data.get('title', '')
        message = request.data.get('message', '')
        notification_type = request.data.get('notification_type', 'INFO')
        user_id = request.data.get('user_id')
        broadcast = request.data.get('broadcast', False)

        if not title or not message:
            return Response({'error': 'Title and message required'}, status=status.HTTP_400_BAD_REQUEST)

        if broadcast:
            users = User.objects.filter(is_active=True)
            notifications = [
                Notification(
                    recipient=u,
                    title=title,
                    message=message,
                    notification_type=notification_type,
                )
                for u in users
            ]
            Notification.objects.bulk_create(notifications)
            return Response({'message': f'Notification sent to {len(notifications)} users'})

        if user_id:
            try:
                user = User.objects.get(id=user_id)
                Notification.objects.create(
                    recipient=user,
                    title=title,
                    message=message,
                    notification_type=notification_type,
                )
                return Response({'message': 'Notification sent'})
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'error': 'Provide user_id or set broadcast=true'}, status=status.HTTP_400_BAD_REQUEST)
