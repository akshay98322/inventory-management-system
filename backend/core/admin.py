from django.contrib import admin
from .models import CompanySettings

@admin.register(CompanySettings)
class CompanySettingsAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'phone_number', 'drug_license_number', 'gst_number', 'updated_at')
    search_fields = ('company_name', 'phone_number', 'gst_number')
    readonly_fields = ('created_at', 'updated_at')
    
    def has_add_permission(self, request):
        # Prevent adding multiple instances (singleton pattern)
        return not CompanySettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of company settings
        return False