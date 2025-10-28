from rest_framework import serializers
from .models import Supplier, PurchaseOrder, PurchaseOrderItem
from inventory.serializers import ProductSerializer

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'product', 'batch_number', 'expiry_date', 'quantity', 'purchase_price', 'sale_price', 'mrp', 'tax', 'hsn_code', 'total_price']
        extra_kwargs = {
            'total_price': {'read_only': True}
        }


class PurchaseOrderSerializer(serializers.ModelSerializer):
    order_items = PurchaseOrderItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    items = PurchaseOrderItemSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'supplier', 'supplier_name', 'invoice_number', 'order_date', 'status', 'total_amount', 'created_at', 'updated_at', 'order_items', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            PurchaseOrderItem.objects.create(purchase_order=purchase_order, **item_data)
        
        return purchase_order
