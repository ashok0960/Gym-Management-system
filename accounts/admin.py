from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import MemberProfile, EmailVerificationCode


class MemberProfileInline(admin.StackedInline):
    model = MemberProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    extra = 0


class UserAdmin(BaseUserAdmin):
    inlines = (MemberProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_role', 'get_membership')
    list_filter = ('is_staff', 'is_superuser', 'profile__role', 'profile__membership_type', 'profile__is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'profile__phone')

    def get_role(self, obj):
        return getattr(obj, 'profile', None) and obj.profile.role or '-'
    get_role.short_description = 'Role'

    def get_membership(self, obj):
        return getattr(obj, 'profile', None) and obj.profile.membership_type or '-'
    get_membership.short_description = 'Membership'


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(MemberProfile)
class MemberProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'membership_type', 'is_active', 'membership_end', 'created_at')
    list_filter = ('role', 'membership_type', 'is_active', 'gender')
    search_fields = ('user__username', 'user__email', 'phone')
    raw_id_fields = ('user', 'assigned_trainer')
    readonly_fields = ('created_at', 'updated_at', 'membership_start')
    date_hierarchy = 'created_at'


@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('email', 'purpose', 'is_used', 'attempts', 'expires_at', 'created_at')
    list_filter = ('purpose', 'is_used')
    search_fields = ('email',)
    readonly_fields = ('created_at',)
