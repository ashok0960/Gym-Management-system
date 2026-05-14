from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Trainer, WorkoutPlan, DietPlan
from .serializers import TrainerSerializer, WorkoutPlanSerializer, DietPlanSerializer


def is_admin(profile):
    return profile.is_admin


def is_trainer(profile):
    return profile.is_trainer


class TrainerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TrainerSerializer

    def get_queryset(self):
        profile = self.request.user.profile
        if is_admin(profile):
            queryset = Trainer.objects.all()
        elif is_trainer(profile):
            queryset = Trainer.objects.filter(user=self.request.user)
        else:
            queryset = Trainer.objects.filter(is_active=True)

        specialization = self.request.query_params.get('specialization')
        if specialization:
            queryset = queryset.filter(specialization=specialization)
        return queryset

    def perform_create(self, serializer):
        profile = self.request.user.profile
        if not is_admin(profile):
            raise PermissionDenied("Only admins can create trainers")
        serializer.save()

    def perform_update(self, serializer):
        profile = self.request.user.profile
        if not (is_admin(profile) or is_trainer(profile)):
            raise PermissionDenied("Only admins or trainers can update trainers")
        if is_trainer(profile) and serializer.instance.user_id != self.request.user.id:
            raise PermissionDenied("You can only update your trainer profile")
        serializer.save()

    def perform_destroy(self, instance):
        profile = self.request.user.profile
        if not is_admin(profile):
            raise PermissionDenied("Only admins can delete trainers")
        instance.delete()


class AvailableSpecializationsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([{'value': c, 'label': l} for c, l in Trainer.SPECIALIZATIONS])


class AssignedMembersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trainer = getattr(request.user, 'trainer_profile', None)
        if not (request.user.profile.is_admin or trainer):
            return Response({'error': 'Trainer access required'}, status=status.HTTP_403_FORBIDDEN)
        qs = trainer.assigned_member_profiles.select_related('user') if trainer else []
        return Response([
            {
                'id': m.id,
                'user_id': m.user_id,
                'name': m.user.get_full_name() or m.user.username,
                'email': m.user.email,
                'phone': m.phone,
                'membership_type': m.membership_type,
                'is_active': m.is_active,
            }
            for m in qs
        ])


class PlanAccessMixin:
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = self.request.user.profile
        model = self.queryset.model
        if profile.is_admin:
            queryset = model.objects.select_related('member__user', 'trainer').all()
        elif profile.is_trainer:
            trainer = getattr(self.request.user, 'trainer_profile', None)
            queryset = model.objects.select_related('member__user', 'trainer').filter(member__assigned_trainer=trainer)
        else:
            queryset = model.objects.select_related('member__user', 'trainer').filter(member=profile)

        member_id = self.request.query_params.get('member')
        active = self.request.query_params.get('active')
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        if active in ('true', 'false'):
            queryset = queryset.filter(is_active=active == 'true')
        return queryset

    def perform_create(self, serializer):
        profile = self.request.user.profile
        member = serializer.validated_data['member']
        if profile.is_admin:
            serializer.save()
            return
        trainer = getattr(self.request.user, 'trainer_profile', None)
        if not trainer or member.assigned_trainer_id != trainer.id:
            raise PermissionDenied("You can only create plans for your assigned members")
        serializer.save(trainer=trainer)

    def perform_update(self, serializer):
        profile = self.request.user.profile
        member = serializer.validated_data.get('member', serializer.instance.member)
        if profile.is_admin:
            serializer.save()
            return
        trainer = getattr(self.request.user, 'trainer_profile', None)
        if not trainer or member.assigned_trainer_id != trainer.id:
            raise PermissionDenied("You can only update plans for your assigned members")
        serializer.save(trainer=trainer)

    def perform_destroy(self, instance):
        profile = self.request.user.profile
        trainer = getattr(self.request.user, 'trainer_profile', None)
        if not (profile.is_admin or (trainer and instance.member.assigned_trainer_id == trainer.id)):
            raise PermissionDenied("You can only delete plans for your assigned members")
        instance.delete()


class WorkoutPlanViewSet(PlanAccessMixin, viewsets.ModelViewSet):
    serializer_class = WorkoutPlanSerializer
    queryset = WorkoutPlan.objects.all()


class DietPlanViewSet(PlanAccessMixin, viewsets.ModelViewSet):
    serializer_class = DietPlanSerializer
    queryset = DietPlan.objects.all()
