from django.db import models

class CompanySettings(models.Model):
    """
    Model to store company details for the user's business.
    This is a singleton model - only one instance should exist.
    """
    company_name = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True, null=True)
    drug_license_number = models.CharField(max_length=100, blank=True)
    gst_number = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Company Settings"
        verbose_name_plural = "Company Settings"
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists (singleton pattern)
        if not self.pk and CompanySettings.objects.exists():
            # If this is a new instance and one already exists, update the existing one
            existing = CompanySettings.objects.first()
            existing.company_name = self.company_name
            existing.owner_name = self.owner_name
            existing.email = self.email
            existing.phone_number = self.phone_number
            existing.address = self.address
            existing.drug_license_number = self.drug_license_number
            existing.gst_number = self.gst_number
            existing.save()
            return existing
        super().save(*args, **kwargs)
    
    @classmethod
    def get_company_settings(cls):
        """Get or create company settings instance"""
        obj, created = cls.objects.get_or_create(
            pk=1,
            defaults={
                'company_name': 'Your Company Name',
                'owner_name': '',
                'email': '',
                'phone_number': '',
                'address': '',
                'drug_license_number': '',
                'gst_number': ''
            }
        )
        return obj
    
    def __str__(self):
        return f"Company Settings: {self.company_name}"