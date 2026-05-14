from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Trainer
from .serializers import TrainerSerializer


class TrainerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TrainerSerializer

    def get_queryset(self):
        profile = self.request.user.profile
        # Admin/vendor see all trainers; others only active
        if profile.is_admin or profile.is_vendor:
            queryset = Trainer.objects.all()
        else:
            queryset = Trainer.objects.filter(is_active=True)

        specialization = self.request.query_params.get('specialization')
        if specialization:
            queryset = queryset.filter(specialization=specialization)
        return queryset

    def perform_create(self, serializer):
        profile = self.request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            raise PermissionDenied("Only admins or vendors can create trainers")
        serializer.save()

    def perform_update(self, serializer):
        profile = self.request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            raise PermissionDenied("Only admins or vendors can update trainers")
        serializer.save()

    def perform_destroy(self, instance):
        profile = self.request.user.profile
        if not (profile.is_admin or profile.is_vendor):
            raise PermissionDenied("Only admins or vendors can delete trainers")
        instance.delete()


class AvailableSpecializationsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([{'value': c, 'label': l} for c, l in Trainer.SPECIALIZATIONS])
