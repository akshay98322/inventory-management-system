# Revert PurchaseOrderItem to original structure

from django.db import migrations, models
import django.db.models.deletion


def restore_original_fields(apps, schema_editor):
    PurchaseOrderItem = apps.get_model('purchase', 'PurchaseOrderItem')
    
    items = PurchaseOrderItem.objects.all()
    
    for item in items:
        # Copy data from stock to individual fields
        if item.stock:
            item.product = item.stock.product
            item.batch_number = item.stock.batch_number
            item.expiry_date = item.stock.expiry_date
            item.purchase_price = item.stock.purchase_price
            item.sale_price = item.stock.sale_price
            item.mrp = item.stock.mrp
            item.tax = item.stock.tax
            item.hsn_code = item.stock.hsn_code
            item.save()
    
    print(f"Restored data for {items.count()} purchase order items")


def reverse_restore_original_fields(apps, schema_editor):
    # This would be called if migration is reversed
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('purchase', '0012_remove_old_fields_make_stock_required'),
        ('inventory', '0006_alter_stock_total_price'),
    ]

    operations = [
        # Add back the original fields with nullable=True first
        migrations.AddField(
            model_name='purchaseorderitem',
            name='product',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='inventory.product'),
        ),
        migrations.AddField(
            model_name='purchaseorderitem',
            name='batch_number',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='purchaseorderitem',
            name='expiry_date',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='purchaseorderitem',
            name='purchase_price',
            field=models.DecimalField(decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='purchaseorderitem',
            name='sale_price',
            field=models.DecimalField(decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='purchaseorderitem',
            name='mrp',
            field=models.DecimalField(decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='purchaseorderitem',
            name='tax',
            field=models.DecimalField(decimal_places=2, default=5.00, max_digits=10),
        ),
        migrations.AddField(
            model_name='purchaseorderitem',
            name='hsn_code',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
        
        # Populate the fields from stock data
        migrations.RunPython(restore_original_fields, reverse_restore_original_fields),
        
        # Make fields non-nullable after populating them
        migrations.AlterField(
            model_name='purchaseorderitem',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='inventory.product'),
        ),
        migrations.AlterField(
            model_name='purchaseorderitem',
            name='batch_number',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='purchaseorderitem',
            name='expiry_date',
            field=models.DateField(),
        ),
        migrations.AlterField(
            model_name='purchaseorderitem',
            name='purchase_price',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
        migrations.AlterField(
            model_name='purchaseorderitem',
            name='sale_price',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
        migrations.AlterField(
            model_name='purchaseorderitem',
            name='mrp',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
        
        # Finally remove the stock field
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='stock',
        ),
    ]