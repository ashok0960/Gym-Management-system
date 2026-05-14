from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
import secrets
from datetime import timedelta
from .serializers import (
    RegisterSerializer, MemberProfileSerializer, ChangePasswordSerializer, UpdateProfileSerializer,
    MemberManagementSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
    SendEmailVerificationCodeSerializer,
)
from .models import MemberProfile, EmailVerificationCode


def has_staff_access(user):
    profile = user.profile
    return profile.is_admin or profile.is_trainer or user.is_superuser


def auth_payload(user):
    profile, _ = MemberProfile.objects.get_or_create(user=user)
    if user.is_superuser and not profile.is_admin:
        profile.is_admin = True
        profile.role = 'ADMIN'
        profile.save()
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_admin': profile.is_admin or user.is_superuser,
        'is_vendor': profile.is_vendor,
        'is_trainer': profile.is_trainer,
        'is_active': profile.is_active,
        'role': 'ADMIN' if user.is_superuser else profile.role,
    }


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': auth_payload(user),
                'refresh': str(refresh), 'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendEmailVerificationCodeView(APIView):
    permission_classes = [AllowAny]

    # Allowed email domains — only real providers
    ALLOWED_DOMAINS = {
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
        'live.com', 'icloud.com', 'protonmail.com', 'ymail.com',
    }

    def post(self, request):
        serializer = SendEmailVerificationCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        # Block unknown/disposable email domains
        domain = email.split('@')[-1].lower()
        if domain not in self.ALLOWED_DOMAINS:
            return Response(
                {'error': f'Email domain "{domain}" is not allowed. Please use Gmail, Yahoo, Outlook, or similar.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cooldown_seconds = int(getattr(settings, 'EMAIL_VERIFICATION_COOLDOWN_SECONDS', 10))
        daily_limit = int(getattr(settings, 'EMAIL_VERIFICATION_DAILY_LIMIT', 50))

        recent = EmailVerificationCode.objects.filter(
            email__iexact=email,
            purpose='REGISTER',
            is_used=False,
            created_at__gte=timezone.now() - timedelta(seconds=cooldown_seconds),
        ).order_by('-created_at').first()
        if recent:
            remaining = max(1, cooldown_seconds - int((timezone.now() - recent.created_at).total_seconds()))
            return Response(
                {'error': f'Please wait {remaining} seconds before requesting another code.', 'retry_after': remaining},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Daily safety limit. Configurable for development/testing.
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        daily_count = EmailVerificationCode.objects.filter(
            email__iexact=email,
            purpose='REGISTER',
            created_at__gte=today_start,
        ).count()
        if daily_count >= daily_limit:
            return Response(
                {'error': f'Maximum {daily_limit} verification codes per day. Try again tomorrow.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        code = f"{secrets.randbelow(1000000):06d}"
        EmailVerificationCode.objects.filter(email__iexact=email, purpose='REGISTER', is_used=False).update(is_used=True)
        verification = EmailVerificationCode.objects.create(
            email=email,
            code_hash=make_password(code),
            purpose='REGISTER',
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        try:
            send_mail(
                subject='GymMS - Email Verification Code',
                message=(
                    f"Hello,\n\n"
                    f"Your GymMS registration verification code is:\n\n"
                    f"  {code}\n\n"
                    f"This code expires in 10 minutes.\n"
                    f"If you did not request this, please ignore this email.\n\n"
                    f"- GymMS Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as exc:
            verification.is_used = True
            verification.save(update_fields=['is_used'])
            return Response(
                {'error': f'Could not send email: {str(exc)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({'message': f'Verification code sent to {email}. Check your inbox (and spam folder).'})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            try:
                u = User.objects.get(email__iexact=username)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                pass

        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': auth_payload(user),
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


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
        if p.is_admin:
            return MemberProfile.objects.select_related('user', 'assigned_trainer').all()
        if p.is_trainer:
            trainer = getattr(self.request.user, 'trainer_profile', None)
            return MemberProfile.objects.select_related('user', 'assigned_trainer').filter(assigned_trainer=trainer)
        return MemberProfile.objects.none()

    def list(self, request, *args, **kwargs):
        if not has_staff_access(request.user):
            return Response({'error': 'Admin or Trainer access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)


class ToggleMemberStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, member_id):
        if not has_staff_access(request.user):
            return Response({'error': 'Admin or Trainer access required'}, status=status.HTTP_403_FORBIDDEN)
        try:
            profile = MemberProfile.objects.get(id=member_id)
            if request.user.profile.is_trainer and profile.assigned_trainer != getattr(request.user, 'trainer_profile', None):
                return Response({'error': 'You can only manage assigned members'}, status=status.HTTP_403_FORBIDDEN)
            profile.is_active = not profile.is_active
            profile.save()
            return Response({'message': f'Member {"activated" if profile.is_active else "deactivated"}'})
        except MemberProfile.DoesNotExist:
            return Response({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)


class MemberListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return RegisterSerializer if self.request.method == 'POST' else MemberManagementSerializer

    def get_queryset(self):
        profile = self.request.user.profile
        if profile.is_admin:
            queryset = MemberProfile.objects.select_related('user', 'assigned_trainer').all()
        elif profile.is_trainer:
            queryset = MemberProfile.objects.select_related('user', 'assigned_trainer').filter(
                assigned_trainer=getattr(self.request.user, 'trainer_profile', None)
            )
        else:
            queryset = MemberProfile.objects.none()

        search = self.request.query_params.get('search')
        role = self.request.query_params.get('role')
        active = self.request.query_params.get('active')
        membership = self.request.query_params.get('membership_type')
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(phone__icontains=search)
            )
        if role:
            queryset = queryset.filter(role=role.upper())
        if active in ('true', 'false'):
            queryset = queryset.filter(is_active=active == 'true')
        if membership:
            queryset = queryset.filter(membership_type=membership.upper())
        return queryset

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated and not has_staff_access(request.user):
            return Response({'error': 'Admin or Trainer access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().dispatch(request, *args, **kwargs)


class MemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MemberManagementSerializer

    def get_queryset(self):
        profile = self.request.user.profile
        if profile.is_admin:
            return MemberProfile.objects.select_related('user', 'assigned_trainer').all()
        if profile.is_trainer:
            return MemberProfile.objects.select_related('user', 'assigned_trainer').filter(
                assigned_trainer=getattr(self.request.user, 'trainer_profile', None)
            )
        return MemberProfile.objects.none()

    def destroy(self, request, *args, **kwargs):
        if not request.user.profile.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        profile = self.get_object()
        profile.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.get(email__iexact=serializer.validated_data['email'])
        token = PasswordResetTokenGenerator().make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        return Response({
            'message': 'Password reset token generated. Connect email settings in production.',
            'uid': uid,
            'token': token,
        })


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password reset successfully'})
