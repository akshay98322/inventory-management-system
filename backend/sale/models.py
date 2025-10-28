from django.db import models
from django.db import transaction
from django.core.exceptions import ValidationError

# Create your models here.
class Customer(models.Model):
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

class SaleOrder(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='sale_orders')
    invoice_number = models.CharField(max_length=100, unique=True, editable=False)
    order_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, editable=False, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def generate_invoice_number(self):
        """Generate auto-incremental invoice number in format: SALE-YYYY-NNNN"""
        from datetime import datetime
        
        current_year = datetime.now().year
        prefix = f"SALE-{current_year}-"
        
        # Get the last invoice number for current year
        last_order = SaleOrder.objects.filter(
            invoice_number__startswith=prefix
        ).order_by('-invoice_number').first()
        
        if last_order:
            # Extract the number part and increment
            try:
                last_number = int(last_order.invoice_number.split('-')[-1])
                next_number = last_number + 1
            except (ValueError, IndexError):
                next_number = 1
        else:
            next_number = 1
        
        # Format with leading zeros (4 digits)
        return f"{prefix}{next_number:04d}"

    def save(self, *args, **kwargs):
        # Always generate invoice number for new records
        if not self.pk and not self.invoice_number:
            self.invoice_number = self.generate_invoice_number()
        
        # Check if this is an update and if status is changing to 'Completed'
        old_status = None
        if self.pk:  # This is an update, not a new instance
            try:
                old_instance = SaleOrder.objects.get(pk=self.pk)
                old_status = old_instance.status
            except SaleOrder.DoesNotExist:
                old_status = None
        
        # Save first to ensure we have a primary key
        super().save(*args, **kwargs)
        
        # Calculate total_amount from related order items
        self.total_amount = sum(item.total_price for item in self.order_items.all())
        
        # Only update if there are changes to avoid infinite recursion
        if hasattr(self, '_state') and self._state.adding is False:
            # Use update to avoid triggering save() again
            SaleOrder.objects.filter(pk=self.pk).update(total_amount=self.total_amount)

        # Trigger Celery task if status changed to 'Completed'
        if old_status and old_status != 'Completed' and self.status == 'Completed':
            print(f" [x] Status changed from '{old_status}' to '{self.status}' for Sale Order {self.id}")
            
            # Use transaction.on_commit to ensure the task runs after the transaction commits
            def trigger_celery_task():
                from inventory.tasks import reduce_stock_from_sale
                from .serializers import SaleOrderItemSerializer
                
                print(f" [x] Triggering Celery task for Sale Order {self.id}")
                
                # Get the order items
                items = self.order_items.all()
                items_data = SaleOrderItemSerializer(items, many=True).data
                
                print(f" [x] Dispatching task with {len(items_data)} items")
                
                # Dispatch the Celery task asynchronously
                task_result = reduce_stock_from_sale.delay(items_data)
                print(f" [x] Celery task dispatched with ID: {task_result.id}")
            
            transaction.on_commit(trigger_celery_task)

    def __str__(self):
        return f"{self.id} | {self.customer.name}"

class SaleOrderItem(models.Model):
    sale_order = models.ForeignKey(SaleOrder, on_delete=models.CASCADE, related_name='order_items')
    stock = models.ForeignKey('inventory.Stock', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        """Validate that sufficient stock is available for sale"""
        if self.quantity and self.stock:
            if self.stock.quantity < self.quantity:
                raise ValidationError(
                    f"Insufficient stock. Available: {self.stock.quantity}, "
                    f"Requested: {self.quantity} for {self.stock.product.name} "
                    f"(Batch: {self.stock.batch_number})"
                )

    def save(self, *args, **kwargs):
        # Run validation before saving
        self.clean()
        
        # Calculate total price based on stock's sale price
        self.total_price = (self.quantity * self.stock.sale_price) * (1 + self.stock.tax / 100)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} of {self.stock.product.name} (Sale)"
    
    # Property methods to access stock details easily
    @property
    def product(self):
        return self.stock.product
    
    @property
    def batch_number(self):
        return self.stock.batch_number
    
    @property
    def expiry_date(self):
        return self.stock.expiry_date
    
    @property
    def purchase_price(self):
        return self.stock.purchase_price
    
    @property
    def sale_price(self):
        return self.stock.sale_price
    
    @property
    def mrp(self):
        return self.stock.mrp
    
    @property
    def tax(self):
        return self.stock.tax
    
    @property
    def hsn_code(self):
        return self.stock.hsn_code
