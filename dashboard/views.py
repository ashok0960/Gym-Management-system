from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from classes.models import GymClass, ClassBooking
from payments.models import Payment
from attendance.models import Attendance
from accounts.models import MemberProfile


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            return Response({'error': 'Admin or Vendor access required'}, status=403)

        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # Count only member profiles (excludes Django superusers without profiles)
        total_members = MemberProfile.objects.count()
        active_members = MemberProfile.objects.filter(is_active=True).count()
        inactive_members = total_members - active_members

        total_classes = GymClass.objects.filter(is_active=True).count()
        todays_classes = GymClass.objects.filter(is_active=True, day_of_week=today.weekday()).count()
        total_bookings = ClassBooking.objects.count()

        total_revenue = Payment.objects.filter(status='COMPLETED').aggregate(Sum('amount'))['amount__sum'] or 0
        revenue_this_month = Payment.objects.filter(
            status='COMPLETED',
            payment_date__gte=month_ago
        ).aggregate(Sum('amount'))['amount__sum'] or 0

        attendance_today = Attendance.objects.filter(date=today).count()
        attendance_this_week = Attendance.objects.filter(date__gte=week_ago).count()

        new_members_this_week = MemberProfile.objects.filter(created_at__date__gte=week_ago).count()
        new_members_this_month = MemberProfile.objects.filter(created_at__date__gte=month_ago).count()

        upcoming_bookings = ClassBooking.objects.filter(
            status='CONFIRMED',
            gym_class__day_of_week__gte=today.weekday()
        ).count()

        membership_stats = MemberProfile.objects.values('membership_type').annotate(count=Count('id'))

        monthly_revenue = []
        for i in range(6):
            month_date = today - timedelta(days=30 * i)
            revenue = Payment.objects.filter(
                status='COMPLETED',
                payment_date__year=month_date.year,
                payment_date__month=month_date.month
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            monthly_revenue.append({
                'month': month_date.strftime('%b %Y'),
                'revenue': float(revenue)
            })

        recent_payments = Payment.objects.filter(
            status='COMPLETED'
        ).select_related('member').order_by('-payment_date')[:5]

        return Response({
            'total_members': total_members,
            'active_members': active_members,
            'inactive_members': inactive_members,
            'total_classes': total_classes,
            'todays_classes': todays_classes,
            'total_bookings': total_bookings,
            'upcoming_bookings': upcoming_bookings,
            'total_revenue': float(total_revenue),
            'revenue_this_month': float(revenue_this_month),
            'attendance_today': attendance_today,
            'attendance_this_week': attendance_this_week,
            'new_members_this_week': new_members_this_week,
            'new_members_this_month': new_members_this_month,
            'membership_distribution': list(membership_stats),
            'monthly_revenue': monthly_revenue[::-1],
            'recent_payments': [
                {
                    'member': p.member.username,
                    'amount': float(p.amount),
                    'date': p.payment_date.strftime('%Y-%m-%d')
                } for p in recent_payments
            ],
        })
