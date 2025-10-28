from django.contrib import admin
from .models import Customer, SaleOrder, SaleOrderItem

# Register your models here.

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'phone_number', 'email', 'gst_number', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'contact_person', 'email', 'phone_number', 'gst_number']
    ordering = ['-created_at']

class SaleOrderItemInline(admin.TabularInline):
    model = SaleOrderItem
    extra = 0
    readonly_fields = ['total_price', 'product', 'batch_number', 'expiry_date', 'purchase_price', 'sale_price', 'mrp', 'tax', 'hsn_code']
    fields = ['stock', 'quantity', 'product', 'batch_number', 'expiry_date', 'purchase_price', 'sale_price', 'mrp', 'tax', 'hsn_code', 'total_price']

@admin.register(SaleOrder)
class SaleOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'invoice_number', 'order_date', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'order_date', 'created_at']
    search_fields = ['invoice_number', 'customer__name']
    ordering = ['-created_at']
    readonly_fields = ['invoice_number', 'total_amount', 'created_at', 'updated_at']
    inlines = [SaleOrderItemInline]

@admin.register(SaleOrderItem)
class SaleOrderItemAdmin(admin.ModelAdmin):
    list_display = ['sale_order', 'stock', 'product', 'batch_number', 'quantity', 'sale_price', 'total_price', 'created_at']
    list_filter = ['created_at', 'stock__expiry_date']
    search_fields = ['stock__product__name', 'stock__batch_number', 'sale_order__invoice_number']
    ordering = ['-created_at']
    readonly_fields = ['total_price', 'product', 'batch_number', 'expiry_date', 'purchase_price', 'sale_price', 'mrp', 'tax', 'hsn_code']
