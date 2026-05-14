from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, MemberProfileSerializer, ChangePasswordSerializer, UpdateProfileSerializer
from .models import MemberProfile


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            profile = MemberProfile.objects.get(user=user)
            return Response({
                'user': {'id': user.id, 'username': user.username, 'email': user.email,
                         'first_name': user.first_name, 'last_name': user.last_name,
                         'is_admin': profile.is_admin, 'is_vendor': profile.is_vendor, 'role': profile.role},
                'refresh': str(refresh), 'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            profile, _ = MemberProfile.objects.get_or_create(user=user)
            if user.is_superuser and not profile.is_admin:
                profile.is_admin = True
                profile.role = 'ADMIN'
                profile.save()
            return Response({
                'user': {'id': user.id, 'username': user.username, 'email': user.email,
                         'first_name': user.first_name, 'last_name': user.last_name,
                         'is_admin': profile.is_admin or user.is_superuser,
                         'is_vendor': profile.is_vendor, 'is_active': profile.is_active, 'role': profile.role},
                'refresh': str(refresh), 'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MemberProfileSerializer
    def get_object(self): return self.request.user.profile


class UpdateProfileView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateProfileSerializer
    def get_object(self): return self.request.user.profile


class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            if not request.user.check_password(serializer.validated_data['old_password']):
                return Response({'old_password': 'Wrong password'}, status=status.HTTP_400_BAD_REQUEST)
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AllMembersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MemberProfileSerializer

    def get_queryset(self):
        p = self.request.user.profile
        return MemberProfile.objects.all() if (p.is_admin or p.is_vendor) else MemberProfile.objects.none()

    def list(self, request, *args, **kwargs):
        if not (request.user.profile.is_admin or request.user.profile.is_vendor):
            return Response({'error': 'Admin or Vendor access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)


class ToggleMemberStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, member_id):
        if not (request.user.profile.is_admin or request.user.profile.is_vendor):
            return Response({'error': 'Admin or Vendor access required'}, status=status.HTTP_403_FORBIDDEN)
        try:
            profile = MemberProfile.objects.get(id=member_id)
            profile.is_active = not profile.is_active
            profile.save()
            return Response({'message': f'Member {"activated" if profile.is_active else "deactivated"}'})
        except MemberProfile.DoesNotExist:
            return Response({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)
