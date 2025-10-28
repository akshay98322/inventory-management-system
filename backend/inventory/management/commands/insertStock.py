from django.core.management.base import BaseCommand
from django.db import transaction
from inventory.models import Product, Stock
from django.db import IntegrityError
import random
from decimal import Decimal
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Insert 1000 sample stock entries based on existing products in the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=1000,
            help='Number of stock entries to create (default: 1000)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing stock entries before creating new ones',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing stock entries...'))
            Stock.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing stock entries cleared.'))

        # Check if products exist
        products = list(Product.objects.all())
        if not products:
            self.stdout.write(
                self.style.ERROR(
                    'No products found in database. Please run insert_products command first.'
                )
            )
            return

        # HSN codes for pharmaceutical products
        hsn_codes = [
            '30049099', '30041000', '30042000', '30043100', '30043200',
            '30043900', '30044000', '30045000', '30049011', '30049012',
            '30049013', '30049014', '30049015', '30049016', '30049017',
            '30049018', '30049019', '30049020', '30049030', '30049040'
        ]

        # Batch number prefixes
        batch_prefixes = [
            'BATCH', 'LOT', 'MFG', 'PHX', 'RX', 'MED', 'DRG', 'CAP', 
            'TAB', 'SYR', 'INJ', 'CRM', 'GEL', 'PWD', 'SOL', 'SUS'
        ]

        # Tax rates (GST rates in India for pharmaceuticals)
        tax_rates = [0.0, 5.0, 12.0]

        stock_entries_to_create = []
        created_count = 0
        skipped_count = 0
        
        self.stdout.write(f'Creating {count} sample stock entries...')
        
        # Generate sample stock data
        for i in range(count):
            try:
                # Select random product
                product = random.choice(products)
                
                # Generate unique batch number
                batch_prefix = random.choice(batch_prefixes)
                batch_year = random.randint(2023, 2025)
                batch_month = random.randint(1, 12)
                batch_sequence = random.randint(1000, 9999)
                batch_number = f"{batch_prefix}{batch_year}{batch_month:02d}{batch_sequence}"
                
                # Generate expiry date (6 months to 3 years from now)
                days_to_expiry = random.randint(180, 1095)  # 6 months to 3 years
                expiry_date = datetime.now().date() + timedelta(days=days_to_expiry)
                
                # Generate realistic quantities (pharmaceutical stock)
                quantity_ranges = [
                    (10, 50),    # Small batches
                    (50, 200),   # Medium batches  
                    (200, 1000), # Large batches
                    (1000, 5000) # Bulk inventory
                ]
                min_qty, max_qty = random.choice(quantity_ranges)
                quantity = random.randint(min_qty, max_qty)
                
                # Generate realistic prices
                # Purchase price between ₹5-2000 (depending on product type)
                base_price_ranges = [
                    (5, 50),     # Generic medicines
                    (50, 200),   # Branded medicines
                    (200, 500),  # Specialized drugs
                    (500, 2000)  # High-end pharmaceuticals
                ]
                min_price, max_price = random.choice(base_price_ranges)
                purchase_price = Decimal(str(round(random.uniform(min_price, max_price), 2)))
                
                # Sale price is 15-35% markup from purchase price
                markup = random.uniform(1.15, 1.35)
                sale_price = Decimal(str(round(float(purchase_price) * markup, 2)))
                
                # MRP is 8-20% markup from sale price
                mrp_markup = random.uniform(1.08, 1.20)
                mrp = Decimal(str(round(float(sale_price) * mrp_markup, 2)))
                
                # Random tax rate
                tax = Decimal(str(random.choice(tax_rates)))
                
                # Random HSN code
                hsn_code = random.choice(hsn_codes)

                # Calculate total_price manually (since bulk_create doesn't call save())
                total_price = quantity * purchase_price + tax

                # Create stock entry data
                stock_data = {
                    'product': product,
                    'batch_number': batch_number,
                    'expiry_date': expiry_date,
                    'quantity': quantity,
                    'purchase_price': purchase_price,
                    'sale_price': sale_price,
                    'mrp': mrp,
                    'tax': tax,
                    'hsn_code': hsn_code,
                    'total_price': total_price,  # Manually calculated
                }
                
                stock_entries_to_create.append(Stock(**stock_data))
                
                # Bulk create every 50 entries to avoid memory issues
                if len(stock_entries_to_create) >= 50:
                    try:
                        with transaction.atomic():
                            created_stocks = Stock.objects.bulk_create(
                                stock_entries_to_create,
                                ignore_conflicts=True,  # Skip if duplicate batch number exists
                                batch_size=50
                            )
                            created_count += len(created_stocks)
                            stock_entries_to_create = []  # Reset the list
                            
                            if created_count % 50 == 0:
                                self.stdout.write(f'Created {created_count} stock entries...')
                                
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f'Error in bulk create: {str(e)}')
                        )
                        skipped_count += len(stock_entries_to_create)
                        stock_entries_to_create = []

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating stock entry {i+1}: {str(e)}')
                )
                skipped_count += 1

        # Create any remaining stock entries
        if stock_entries_to_create:
            try:
                with transaction.atomic():
                    created_stocks = Stock.objects.bulk_create(
                        stock_entries_to_create,
                        ignore_conflicts=True,
                        batch_size=50
                    )
                    created_count += len(created_stocks)
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error in final bulk create: {str(e)}')
                )
                skipped_count += len(stock_entries_to_create)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} stock entries. '
                f'Skipped {skipped_count} duplicates/errors.'
            )
        )
        
        # Display some sample data
        self.stdout.write('\n' + self.style.SUCCESS('Sample stock entries created:'))
        sample_stocks = Stock.objects.select_related('product', 'product__company').order_by('-id')[:5]
        
        for stock in sample_stocks:
            self.stdout.write(
                f"• {stock.product.name} (Batch: {stock.batch_number})\n"
                f"  Company: {stock.product.company.name if stock.product.company else 'Unknown'}\n"
                f"  Quantity: {stock.quantity} units\n"
                f"  Purchase Price: ₹{stock.purchase_price}\n"
                f"  Sale Price: ₹{stock.sale_price}\n"
                f"  MRP: ₹{stock.mrp}\n"
                f"  Tax: {stock.tax}%\n"
                f"  HSN Code: {stock.hsn_code}\n"
                f"  Total Price: ₹{stock.total_price}\n"
                f"  Expiry: {stock.expiry_date}\n"
            )

        # Display summary statistics
        total_stocks = Stock.objects.count()
        total_products = Product.objects.count()
        total_companies = Product.objects.values('company').distinct().count()
        
        # Calculate some inventory statistics
        total_inventory_value = sum([
            float(stock.total_price) for stock in Stock.objects.all()
        ])
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=== INVENTORY SUMMARY ==='))
        self.stdout.write(f'Total Stock Entries: {total_stocks}')
        self.stdout.write(f'Total Products: {total_products}')
        self.stdout.write(f'Total Companies: {total_companies}')
        self.stdout.write(f'Average Stock Entries per Product: {total_stocks/total_products:.1f}')
        self.stdout.write(f'Total Inventory Value: ₹{total_inventory_value:,.2f}')
        
        # Show expiry date distribution
        from datetime import date
        today = date.today()
        expired = Stock.objects.filter(expiry_date__lt=today).count()
        expiring_soon = Stock.objects.filter(
            expiry_date__gte=today, 
            expiry_date__lt=today + timedelta(days=90)
        ).count()
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=== EXPIRY ANALYSIS ==='))
        self.stdout.write(f'Expired Stock Entries: {expired}')
        self.stdout.write(f'Expiring in 90 days: {expiring_soon}')
        self.stdout.write(f'Good Stock: {total_stocks - expired - expiring_soon}')