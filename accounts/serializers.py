from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode
from django.utils import timezone
from django.contrib.auth.hashers import check_password
from .models import MemberProfile, EmailVerificationCode

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

class MemberProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_trainer_name = serializers.SerializerMethodField()
    is_trainer = serializers.BooleanField(read_only=True)
    is_membership_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = MemberProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'membership_start']

    def get_assigned_trainer_name(self, obj):
        return obj.assigned_trainer.name if obj.assigned_trainer else None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    Conform_password = serializers.CharField(write_only=True, required=True)
    phone = serializers.CharField(required=True)
    address = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    role = serializers.ChoiceField(choices=['MEMBER', 'VENDOR'], default='MEMBER', required=False)
    email_code = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'Conform_password', 'first_name', 'last_name', 'phone', 'address', 'role', 'email_code']

    def validate(self, attrs):
        if attrs['password'] != attrs['Conform_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if User.objects.filter(username__iexact=attrs['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})
        if User.objects.filter(email__iexact=attrs['email']).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})

        email_code = attrs.get('email_code', '').strip()
        if not email_code:
            raise serializers.ValidationError({"email_code": "Enter the verification code sent to your email."})

        verification = EmailVerificationCode.objects.filter(
            email__iexact=attrs['email'],
            purpose='REGISTER',
            is_used=False,
        ).order_by('-created_at').first()

        if not verification or not verification.is_valid():
            raise serializers.ValidationError({"email_code": "Verification code is invalid or expired. Please request a new one."})
        if verification.attempts >= 5:
            raise serializers.ValidationError({"email_code": "Too many incorrect attempts. Request a new code."})
        if not check_password(email_code, verification.code_hash):
            verification.attempts += 1
            verification.save(update_fields=['attempts'])
            raise serializers.ValidationError({"email_code": "Incorrect verification code."})

        attrs['_verification'] = verification
        return attrs

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        address = validated_data.pop('address')
        role = validated_data.pop('role', 'MEMBER')
        password = validated_data.pop('password')
        verification = validated_data.pop('_verification', None)
        validated_data.pop('email_code', None)
        validated_data.pop('Conform_password')

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        profile = user.profile
        profile.phone = phone
        profile.address = address
        profile.role = role
        profile.is_vendor = (role == 'VENDOR')
        profile.save()

        if verification:
            verification.is_used = True
            verification.save(update_fields=['is_used'])

        return user


class SendEmailVerificationCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('This email is already registered. Please sign in instead.')
        return email

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords don't match"})
        return attrs

class UpdateProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    
    class Meta:
        model = MemberProfile
        fields = ['phone', 'address', 'date_of_birth', 'gender', 'emergency_contact_name',
                 'emergency_contact_phone', 'medical_conditions', 'first_name', 'last_name', 'email']
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class MemberManagementSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    assigned_trainer_name = serializers.SerializerMethodField()
    is_membership_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = MemberProfile
        fields = [
            'id', 'user', 'username', 'email', 'first_name', 'last_name', 'phone', 'address',
            'date_of_birth', 'gender', 'membership_type', 'membership_start', 'membership_end',
            'assigned_trainer', 'assigned_trainer_name', 'emergency_contact_name',
            'emergency_contact_phone', 'medical_conditions', 'is_active', 'role',
            'is_membership_expired', 'created_at', 'updated_at',
        ]
        read_only_fields = ['membership_start', 'created_at', 'updated_at']

    def get_assigned_trainer_name(self, obj):
        return obj.assigned_trainer.name if obj.assigned_trainer else None

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.is_vendor = instance.role == 'TRAINER'
        instance.is_admin = instance.role == 'ADMIN'
        instance.save()
        return instance


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('No account found for this email.')
        return value


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    confirm_password = serializers.CharField()

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        try:
            user_id = urlsafe_base64_decode(attrs['uid']).decode()
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({'token': 'Invalid reset link.'})
        if not PasswordResetTokenGenerator().check_token(user, attrs['token']):
            raise serializers.ValidationError({'token': 'Invalid or expired reset token.'})
        attrs['user'] = user
        return attrs
