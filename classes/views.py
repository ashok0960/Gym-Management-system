from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from datetime import datetime
from .models import GymClass, ClassBooking
from .serializers import GymClassSerializer, ClassBookingSerializer


class GymClassViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = GymClassSerializer

    def get_queryset(self):
        profile = self.request.user.profile
        # Admin/vendor see all classes; members only see active ones
        if profile.is_admin or profile.is_vendor:
            queryset = GymClass.objects.all()
        else:
            queryset = GymClass.objects.filter(is_active=True)

        class_type = self.request.query_params.get('type')
        if class_type:
            queryset = queryset.filter(class_type=class_type)

        day = self.request.query_params.get('day')
        if day is not None:
            queryset = queryset.filter(day_of_week=int(day))

        trainer_id = self.request.query_params.get('trainer')
        if trainer_id:
            queryset = queryset.filter(trainer_id=trainer_id)

        return queryset

    def perform_create(self, serializer):
        profile = self.request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            raise PermissionDenied("Only admins or vendors can create classes")
        serializer.save()

    def perform_update(self, serializer):
        profile = self.request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            raise PermissionDenied("Only admins or vendors can update classes")
        serializer.save()

    def perform_destroy(self, instance):
        profile = self.request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            raise PermissionDenied("Only admins or vendors can delete classes")
        instance.is_active = False
        instance.save()

    @action(detail=True, methods=['post'])
    def book(self, request, pk=None):
        gym_class = self.get_object()
        user = request.user

        if not user.profile.is_active:
            return Response({'error': 'Your membership is inactive'}, status=status.HTTP_400_BAD_REQUEST)

        existing = ClassBooking.objects.filter(member=user, gym_class=gym_class, status='CONFIRMED').first()
        if existing:
            return Response({'error': 'You have already booked this class'}, status=status.HTTP_400_BAD_REQUEST)

        # Always count from DB — never trust the cached counter
        actual_bookings = ClassBooking.objects.filter(gym_class=gym_class, status='CONFIRMED').count()
        if actual_bookings >= gym_class.capacity:
            return Response({'error': 'Class is full'}, status=status.HTTP_400_BAD_REQUEST)

        booking = ClassBooking.objects.create(member=user, gym_class=gym_class, status='CONFIRMED')
        # Sync counter with real count
        gym_class.current_bookings = actual_bookings + 1
        gym_class.save()

        return Response(ClassBookingSerializer(booking).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel_booking(self, request, pk=None):
        gym_class = self.get_object()
        booking = ClassBooking.objects.filter(member=request.user, gym_class=gym_class, status='CONFIRMED').first()

        if not booking:
            return Response({'error': 'No active booking found'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'CANCELLED'
        booking.cancelled_at = timezone.now()
        booking.save()

        # Sync counter with real count
        gym_class.current_bookings = ClassBooking.objects.filter(gym_class=gym_class, status='CONFIRMED').count()
        gym_class.save()

        return Response({'message': 'Booking cancelled successfully'})

    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        bookings = ClassBooking.objects.filter(
            member=request.user
        ).select_related('gym_class').order_by('-booking_date')
        return Response(ClassBookingSerializer(bookings, many=True).data)

    @action(detail=False, methods=['get'])
    def upcoming_classes(self, request):
        today = datetime.now().date()
        bookings = ClassBooking.objects.filter(
            member=request.user,
            status='CONFIRMED',
            gym_class__day_of_week__gte=today.weekday()
        ).select_related('gym_class')
        return Response(ClassBookingSerializer(bookings, many=True).data)


class ClassTypeListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([{'value': c, 'label': l} for c, l in GymClass.CLASS_TYPES])
