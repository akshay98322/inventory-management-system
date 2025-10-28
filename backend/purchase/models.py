from django.db import models
from django.db import transaction

# Create your models here.
class Supplier(models.Model):
    name = models.CharField(max_length=255, unique=True)
    contact_person = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(unique=True)
    address = models.TextField(blank=True, null=True)
    drug_license_number = models.CharField(max_length=100, blank=True)
    gst_number = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    invoice_number = models.CharField(max_length=100, unique=True)
    order_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Check if this is an update and if status is changing to 'Completed'
        old_status = None
        if self.pk:  # This is an update, not a new instance
            try:
                old_instance = PurchaseOrder.objects.get(pk=self.pk)
                old_status = old_instance.status
            except PurchaseOrder.DoesNotExist:
                old_status = None
        
        # Save first to ensure we have a primary key
        super().save(*args, **kwargs)
        
        # Calculate total_amount from related order items
        self.total_amount = sum(item.total_price for item in self.order_items.all())
        
        # Only update if there are changes to avoid infinite recursion
        if hasattr(self, '_state') and self._state.adding is False:
            # Use update to avoid triggering save() again
            PurchaseOrder.objects.filter(pk=self.pk).update(total_amount=self.total_amount)

        # Trigger Celery task if status changed to 'Completed'
        if old_status and old_status != 'Completed' and self.status == 'Completed':
            print(f" [x] Status changed from '{old_status}' to '{self.status}' for Purchase Order {self.id}")
            
            # Use transaction.on_commit to ensure the task runs after the transaction commits
            def trigger_celery_task():
                from inventory.tasks import update_stock_from_purchase
                from .serializers import PurchaseOrderItemSerializer
                
                print(f" [x] Triggering Celery task for Purchase Order {self.id}")
                
                # Get the order items
                items = self.order_items.all()
                items_data = PurchaseOrderItemSerializer(items, many=True).data
                
                print(f" [x] Dispatching task with {len(items_data)} items")
                
                # Dispatch the Celery task asynchronously
                task_result = update_stock_from_purchase.delay(items_data)
                print(f" [x] Celery task dispatched with ID: {task_result.id}")
            
            transaction.on_commit(trigger_celery_task)

    def __str__(self):
        return f"{self.id} | {self.supplier.name}"

class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='order_items')
    product = models.ForeignKey('inventory.Product', on_delete=models.CASCADE)
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField()
    quantity = models.PositiveIntegerField(default=0)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=5.00)
    hsn_code = models.CharField(max_length=15, blank=True, null=True)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.total_price = (self.quantity * self.purchase_price) * (1 + self.tax / 100)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} of {self.product.name}"
