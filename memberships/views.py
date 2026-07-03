from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import MembershipPlan, MembershipUpgrade
from .serializers import MembershipPlanSerializer, MembershipUpgradeSerializer


class MembershipPlanListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MembershipPlanSerializer

    def get_queryset(self):
        profile = self.request.user.profile
        if profile.is_admin:
            return MembershipPlan.objects.all()
        return MembershipPlan.objects.filter(is_active=True)

    def create(self, request, *args, **kwargs):
        if not request.user.profile.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)


class MembershipPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = MembershipPlan.objects.all()
    serializer_class = MembershipPlanSerializer

    def update(self, request, *args, **kwargs):
        if not request.user.profile.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.profile.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class UpgradeMembershipView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MembershipUpgradeSerializer

    def create(self, request, *args, **kwargs):
        profile = request.user.profile
        old_plan = profile.membership_type
        new_plan = request.data.get('new_plan', '').upper().strip()
        if not new_plan:
            return Response({'error': 'New plan is required'}, status=status.HTTP_400_BAD_REQUEST)
        if old_plan == new_plan:
            return Response({'error': 'You are already on this plan'}, status=status.HTTP_400_BAD_REQUEST)
        valid_plans = {p.name.upper(): float(p.price) for p in MembershipPlan.objects.filter(is_active=True)}
        if new_plan not in valid_plans:
            return Response({'error': f'Invalid plan: {new_plan}'}, status=status.HTTP_400_BAD_REQUEST)
        additional = valid_plans[new_plan] - valid_plans.get(old_plan, 0)
        if additional < 0:
            return Response({'error': 'Cannot downgrade. Contact admin.'}, status=status.HTTP_400_BAD_REQUEST)
        upgrade = MembershipUpgrade.objects.create(
            member=profile, old_plan=old_plan, new_plan=new_plan, additional_payment=additional
        )
        profile.membership_type = new_plan
        profile.save()
        return Response(self.get_serializer(upgrade).data, status=status.HTTP_201_CREATED)
