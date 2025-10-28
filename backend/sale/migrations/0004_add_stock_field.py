# Step 1: Add stock field to SaleOrderItem

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sale', '0003_alter_saleorder_invoice_number'),
        ('inventory', '0006_alter_stock_total_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='saleorderitem',
            name='stock',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='inventory.stock'),
        ),
    ]