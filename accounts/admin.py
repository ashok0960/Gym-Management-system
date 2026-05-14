from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import MemberProfile, EmailVerificationCode


class MemberProfileInline(admin.StackedInline):
    model = MemberProfile
    can_delete = False
    verbose_name_plural = 'Profile'


class CustomUserAdmin(UserAdmin):
    inlines = (MemberProfileInline,)
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'get_role', 'get_membership']

    def get_role(self, obj):
        try:
            return obj.profile.role
        except MemberProfile.DoesNotExist:
            return '—'
    get_role.short_description = 'Role'

    def get_membership(self, obj):
        try:
            return obj.profile.membership_type
        except MemberProfile.DoesNotExist:
            return '—'
    get_membership.short_description = 'Membership'


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ['email', 'purpose', 'expires_at', 'attempts', 'is_used', 'created_at']
    list_filter = ['purpose', 'is_used', 'created_at']
    search_fields = ['email']
    readonly_fields = ['code_hash', 'created_at']
