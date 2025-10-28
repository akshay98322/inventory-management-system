from django.contrib import admin
from .models import Company, Product, Stock

admin.site.register(Company)
admin.site.register(Product)
admin.site.register(Stock)
