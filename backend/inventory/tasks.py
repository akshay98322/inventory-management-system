from __future__ import absolute_import, unicode_literals
from celery import shared_task
from django.db import models, transaction
from django.core.exceptions import ValidationError
from .models import Stock

@shared_task
def update_stock_from_purchase(items_data):
    """
    Celery task to update stock levels from a completed purchase order.
    """
    print(" [x] Received 'update_stock_from_purchase' task")
    print(f" [x] Processing {len(items_data)} items")
    
    for item_data in items_data:
        product_id = item_data.get('product')
        quantity = item_data.get('quantity')
        batch_number = item_data.get('batch_number')
        expiry_date = item_data.get('expiry_date')
        purchase_price = item_data.get('purchase_price')
        sale_price = item_data.get('sale_price')
        mrp = item_data.get('mrp')
        tax = item_data.get('tax')
        hsn_code = item_data.get('hsn_code')

        print(f" [x] Processing item: Product {product_id}, Batch {batch_number}, Qty {quantity}")

        if not all([product_id, quantity, batch_number, expiry_date, purchase_price, sale_price, mrp]):
            print(f" [!] Incomplete item data received: {item_data}")
            continue

        try:
            # Convert string values to appropriate types
            from decimal import Decimal
            quantity = int(quantity)
            purchase_price = Decimal(str(purchase_price))
            sale_price = Decimal(str(sale_price))
            mrp = Decimal(str(mrp))
            tax = Decimal(str(tax)) if tax else Decimal('5.00')
            hsn_code = str(hsn_code) if hsn_code else ''

            with transaction.atomic():
                # Check if stock with same product and batch already exists
                existing_stock = Stock.objects.filter(
                    product_id=product_id,
                    batch_number=batch_number
                ).first()
                
                if existing_stock:
                    # If the stock exists, update its quantity
                    existing_stock.quantity = models.F('quantity') + quantity
                    existing_stock.expiry_date = expiry_date  # Update expiry date
                    existing_stock.save()
                    print(f" [+] Stock updated for product {product_id}, batch {batch_number}")
                else:
                    # If the stock does not exist, create a new one
                    new_stock = Stock.objects.create(
                        product_id=product_id,
                        batch_number=batch_number,
                        expiry_date=expiry_date,
                        quantity=quantity,
                        purchase_price=purchase_price,
                        sale_price=sale_price,
                        mrp=mrp,
                        tax=tax,
                        hsn_code=hsn_code,
                        # total_price will be calculated automatically by the model
                    )
                    print(f" [+] New stock created for product {product_id}, batch {batch_number} (Stock ID: {new_stock.id})")

        except Exception as e:
            print(f" [!] An error occurred while updating stock for product {product_id}: {e}")
            import traceback
            traceback.print_exc()
            # Optionally, add retry logic or log to a monitoring service
    
    print(" [x] Stock update process completed.")
    return "Stock update process completed."

@shared_task
def reduce_stock_from_sale(items_data):
    """
    Celery task to reduce stock levels from a completed sale order.
    """
    print(" [x] Received 'reduce_stock_from_sale' task")
    print(f" [x] Processing {len(items_data)} items")
    
    for item_data in items_data:
        stock_id = item_data.get('stock')
        quantity = item_data.get('quantity')
        product_name = item_data.get('product', 'Unknown Product')
        batch_number = item_data.get('batch_number')

        print(f" [x] Processing sale item: Product {product_name}, Stock ID {stock_id}, Batch {batch_number}, Qty {quantity}")

        if not all([stock_id, quantity]):
            print(f" [!] Incomplete item data received: {item_data}")
            continue

        try:
            quantity = int(quantity)
            stock_id = int(stock_id)

            with transaction.atomic():
                # Find the exact stock entry by ID
                try:
                    stock_entry = Stock.objects.get(id=stock_id)
                    
                    # Check if sufficient quantity is available
                    if stock_entry.quantity < quantity:
                        raise ValidationError(
                            f"Insufficient stock for product {stock_entry.product.name}, batch {stock_entry.batch_number}. "
                            f"Available: {stock_entry.quantity}, Required: {quantity}"
                        )
                    
                    # Reduce the stock quantity
                    stock_entry.quantity = models.F('quantity') - quantity
                    stock_entry.save()
                    
                    # Refresh to get the updated quantity
                    stock_entry.refresh_from_db()
                    
                    print(f" [-] Stock reduced for product {stock_entry.product.name}, batch {stock_entry.batch_number}. "
                          f"Remaining quantity: {stock_entry.quantity}")
                    
                    # If quantity becomes 0, optionally keep the record for audit trail
                    # or delete it based on business requirements
                    if stock_entry.quantity == 0:
                        print(f" [!] Stock depleted for product {stock_entry.product.name}, batch {stock_entry.batch_number}")
                        # Option 1: Keep for audit trail (recommended)
                        # Option 2: Delete if preferred
                        # stock_entry.delete()
                        
                except Stock.DoesNotExist:
                    error_msg = f"Stock not found with ID {stock_id}"
                    print(f" [!] {error_msg}")
                    raise ValidationError(error_msg)

        except ValidationError as ve:
            print(f" [!] Validation error: {ve}")
            # You might want to implement proper error handling here
            # such as notifying admins or creating error logs
            
        except Exception as e:
            print(f" [!] An error occurred while reducing stock for stock ID {stock_id}: {e}")
            import traceback
            traceback.print_exc()
    
    print(" [x] Stock reduction process completed.")
    return "Stock reduction process completed."
