from rest_framework import serializers
from .models import Customer, SaleOrder, SaleOrderItem
from inventory.serializers import ProductSerializer, StockSerializer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class SaleOrderItemSerializer(serializers.ModelSerializer):
    stock_details = StockSerializer(source='stock', read_only=True)
    # Convenience fields for backward compatibility
    product = serializers.CharField(source='stock.product.name', read_only=True)
    product_id = serializers.IntegerField(source='stock.product.id', read_only=True)
    batch_number = serializers.CharField(source='stock.batch_number', read_only=True)
    expiry_date = serializers.DateField(source='stock.expiry_date', read_only=True)
    purchase_price = serializers.DecimalField(source='stock.purchase_price', max_digits=10, decimal_places=2, read_only=True)
    sale_price = serializers.DecimalField(source='stock.sale_price', max_digits=10, decimal_places=2, read_only=True)
    mrp = serializers.DecimalField(source='stock.mrp', max_digits=10, decimal_places=2, read_only=True)
    tax = serializers.DecimalField(source='stock.tax', max_digits=10, decimal_places=2, read_only=True)
    hsn_code = serializers.CharField(source='stock.hsn_code', read_only=True)
    
    class Meta:
        model = SaleOrderItem
        fields = ['id', 'stock', 'stock_details', 'product', 'product_id', 'batch_number', 'expiry_date', 'quantity', 'purchase_price', 'sale_price', 'mrp', 'tax', 'hsn_code', 'total_price']
        extra_kwargs = {
            'total_price': {'read_only': True}
        }


class SaleOrderSerializer(serializers.ModelSerializer):
    order_items = SaleOrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    items = SaleOrderItemSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = SaleOrder
        fields = ['id', 'customer', 'customer_name', 'invoice_number', 'order_date', 'status', 'total_amount', 'created_at', 'updated_at', 'order_items', 'items']
        extra_kwargs = {
            'invoice_number': {'read_only': True},
            'total_amount': {'read_only': True},
        }

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        sale_order = SaleOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            SaleOrderItem.objects.create(sale_order=sale_order, **item_data)
        
        return sale_order

    def validate_items(self, items_data):
        """
        Validate all items have sufficient stock before creating the order.
        """
        from inventory.models import Stock
        
        for item_data in items_data:
            if 'stock' in item_data and 'quantity' in item_data:
                try:
                    stock_entry = Stock.objects.get(id=item_data['stock'].id if hasattr(item_data['stock'], 'id') else item_data['stock'])
                    
                    if stock_entry.quantity < item_data['quantity']:
                        raise serializers.ValidationError(
                            f"Insufficient stock for {stock_entry.product.name}. "
                            f"Available: {stock_entry.quantity}, Requested: {item_data['quantity']}"
                        )
                        
                except Stock.DoesNotExist:
                    raise serializers.ValidationError(
                        f"Stock entry not found"
                    )
        
        return items_data