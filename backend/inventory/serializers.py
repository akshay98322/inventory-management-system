from rest_framework import serializers
from .models import Company, Product, Stock

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'

class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    company_name = serializers.CharField(source='product.company.name', read_only=True)
    
    class Meta:
        model = Stock
        fields = '__all__'
