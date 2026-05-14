from django.contrib import admin
from .models import MembershipPlan, MembershipUpgrade

@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'duration', 'price', 'discount_price', 'is_active']
    list_editable = ['price', 'discount_price', 'is_active']
    list_filter = ['duration', 'is_active']

@admin.register(MembershipUpgrade)
class MembershipUpgradeAdmin(admin.ModelAdmin):
    list_display = ['member', 'old_plan', 'new_plan', 'upgrade_date', 'additional_payment']
    list_filter = ['old_plan', 'new_plan']