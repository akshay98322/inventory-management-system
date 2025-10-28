from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import CompanySettings

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        # ...

        return token

class CompanySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySettings
        fields = ['id', 'company_name', 'owner_name', 'email', 'phone_number', 'address', 'drug_license_number', 'gst_number', 'created_at', 'updated_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True}
        }
    
    def validate_company_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Company name is required.")
        return value.strip()
    
    def validate_owner_name(self, value):
        if value and len(value.strip()) > 0:
            return value.strip()
        return value
    
    def validate_email(self, value):
        if value:
            # Additional email validation can be added here if needed
            # Django's EmailField already handles basic email validation
            return value.lower().strip()
        return value
    
    def validate_gst_number(self, value):
        if value and len(value) > 0:
            # Basic GST number validation (should be 15 characters)
            if len(value) != 15:
                raise serializers.ValidationError("GST number should be 15 characters long.")
        return value
    
    def validate_drug_license_number(self, value):
        if value and len(value) > 0:
            # Basic validation for drug license number
            if len(value) < 5:
                raise serializers.ValidationError("Drug license number should be at least 5 characters long.")
        return value
