from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PurchaseItem
from stock.models import Stock

@receiver(post_save, sender=PurchaseItem)
def update_stock_on_purchase(sender, instance, created, **kwargs):
    if created:
        stock = instance.stock
        stock.quantity += instance.quantity
        stock.save()
