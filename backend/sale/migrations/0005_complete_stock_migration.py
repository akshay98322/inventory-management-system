# Complete SaleOrderItem migration to Stock-based structure

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sale', '0004_add_stock_field'),
    ]

    operations = [
        # Make stock field required (no existing data to worry about)
        migrations.AlterField(
            model_name='saleorderitem',
            name='stock',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='inventory.stock'),
        ),
        
        # Remove the old fields since we have no existing data
        migrations.RemoveField(
            model_name='saleorderitem',
            name='product',
        ),
        migrations.RemoveField(
            model_name='saleorderitem',
            name='batch_number',
        ),
        migrations.RemoveField(
            model_name='saleorderitem',
            name='expiry_date',
        ),
        migrations.RemoveField(
            model_name='saleorderitem',
            name='purchase_price',
        ),
        migrations.RemoveField(
            model_name='saleorderitem',
            name='sale_price',
        ),
        migrations.RemoveField(
            model_name='saleorderitem',
            name='mrp',
        ),
        migrations.RemoveField(
            model_name='saleorderitem',
            name='tax',
        ),
        migrations.RemoveField(
            model_name='saleorderitem',
            name='hsn_code',
        ),
    ]