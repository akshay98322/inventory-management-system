# Generated manually on 2025-10-19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('purchase', '0011_auto_20251019_1823'),
    ]

    operations = [
        # First, alter the stock field to be non-nullable (all records should have stock populated by now)
        migrations.AlterField(
            model_name='purchaseorderitem',
            name='stock',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='inventory.stock'),
        ),
        # Remove the old fields that are now available through stock relationship
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='product',
        ),
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='batch_number',
        ),
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='expiry_date',
        ),
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='purchase_price',
        ),
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='sale_price',
        ),
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='mrp',
        ),
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='tax',
        ),
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='hsn_code',
        ),
    ]