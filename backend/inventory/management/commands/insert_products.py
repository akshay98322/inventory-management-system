from django.core.management.base import BaseCommand
from inventory.models import Product, Company
from django.db import IntegrityError
import random


class Command(BaseCommand):
    help = 'Insert 1000 sample pharmaceutical products (basic info only) into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=1000,
            help='Number of products to create (default: 1000)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing products before inserting new ones'
        )

    def handle(self, *args, **options):
        count = options['count']
        clear_existing = options['clear']

        if clear_existing:
            self.stdout.write(self.style.WARNING('Clearing existing products...'))
            Product.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing products cleared.'))

        # Check if companies exist
        companies = list(Company.objects.all())
        if not companies:
            self.stdout.write(
                self.style.ERROR(
                    'No companies found in database. Please run insert_companies command first.'
                )
            )
            return

        # Pharmaceutical product categories and base names
        product_categories = {
            'Antibiotics': [
                'Amoxicillin', 'Azithromycin', 'Cephalexin', 'Ciprofloxacin', 'Doxycycline',
                'Erythromycin', 'Metronidazole', 'Penicillin', 'Tetracycline', 'Clarithromycin'
            ],
            'Analgesics': [
                'Acetaminophen', 'Aspirin', 'Ibuprofen', 'Naproxen', 'Diclofenac',
                'Morphine', 'Codeine', 'Tramadol', 'Celecoxib', 'Ketorolac'
            ],
            'Antidiabetics': [
                'Metformin', 'Insulin', 'Glipizide', 'Glyburide', 'Sitagliptin',
                'Pioglitazone', 'Acarbose', 'Repaglinide', 'Exenatide', 'Liraglutide'
            ],
            'Cardiovascular': [
                'Amlodipine', 'Atenolol', 'Lisinopril', 'Metoprolol', 'Simvastatin',
                'Atorvastatin', 'Warfarin', 'Clopidogrel', 'Digoxin', 'Furosemide'
            ],
            'Respiratory': [
                'Albuterol', 'Salbutamol', 'Montelukast', 'Prednisolone', 'Theophylline',
                'Budesonide', 'Ipratropium', 'Salmeterol', 'Fluticasone', 'Beclomethasone'
            ],
            'Antacids': [
                'Omeprazole', 'Pantoprazole', 'Ranitidine', 'Famotidine', 'Lansoprazole',
                'Esomeprazole', 'Rabeprazole', 'Aluminum Hydroxide', 'Magnesium Hydroxide', 'Simethicone'
            ],
            'Vitamins': [
                'Vitamin D3', 'Vitamin B12', 'Vitamin C', 'Folic Acid', 'Iron',
                'Calcium', 'Zinc', 'Multivitamin', 'Vitamin E', 'Biotin'
            ],
            'Antifungals': [
                'Fluconazole', 'Itraconazole', 'Ketoconazole', 'Terbinafine', 'Clotrimazole',
                'Miconazole', 'Nystatin', 'Amphotericin B', 'Voriconazole', 'Caspofungin'
            ],
            'Antihistamines': [
                'Cetirizine', 'Loratadine', 'Diphenhydramine', 'Fexofenadine', 'Chlorpheniramine',
                'Desloratadine', 'Levocetirizine', 'Promethazine', 'Hydroxyzine', 'Meclizine'
            ],
            'Antihypertensives': [
                'Losartan', 'Valsartan', 'Telmisartan', 'Irbesartan', 'Candesartan',
                'Nifedipine', 'Amlodipine', 'Diltiazem', 'Verapamil', 'Indapamide'
            ]
        }

        # Dosage forms
        dosage_forms = [
            'Tablets', 'Capsules', 'Syrup', 'Injection', 'Cream', 'Ointment',
            'Drops', 'Suspension', 'Powder', 'Gel', 'Inhaler', 'Patches'
        ]

        # Strengths for different categories
        strengths = {
            'mg': ['5mg', '10mg', '25mg', '50mg', '100mg', '250mg', '500mg', '1000mg'],
            'ml': ['5ml', '10ml', '15ml', '30ml', '60ml', '100ml', '200ml'],
            'units': ['100IU', '500IU', '1000IU', '2000IU', '5000IU'],
            'percent': ['1%', '2%', '5%', '10%', '15%', '20%']
        }

        created_count = 0
        skipped_count = 0

        self.stdout.write(f'Creating {count} sample pharmaceutical products...')

        for i in range(count):
            try:
                # Select random category and product
                category = random.choice(list(product_categories.keys()))
                base_name = random.choice(product_categories[category])
                
                # Select random dosage form and strength
                dosage_form = random.choice(dosage_forms)
                strength_type = random.choice(list(strengths.keys()))
                strength = random.choice(strengths[strength_type])
                
                # Create product name
                product_name = f"{base_name} {strength} {dosage_form}"
                
                # Add variation if duplicate names might occur
                if i > len([item for sublist in product_categories.values() for item in sublist]) * len(dosage_forms):
                    variation = random.choice(['XR', 'SR', 'CR', 'ER', 'IR', 'DS', 'Forte', 'Plus'])
                    product_name = f"{base_name} {strength} {dosage_form} {variation}"

                # Select random company
                company = random.choice(companies)

                # Create product (only basic information - pricing is now in Stock model)
                product = Product.objects.create(
                    name=product_name,
                    company=company
                )
                
                created_count += 1
                
                if created_count % 50 == 0:
                    self.stdout.write(f'Created {created_count} products...')

            except IntegrityError:
                # Product with this name already exists
                skipped_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Skipped duplicate product: {product_name}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating product {i+1}: {str(e)}')
                )
                skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} basic products (name + company only). '
                f'Skipped {skipped_count} duplicates/errors. '
                f'Use Stock model for pricing and inventory data.'
            )
        )
        
        # Display summary statistics
        total_products = Product.objects.count()
        total_companies = Company.objects.count()
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=== DATABASE SUMMARY ==='))
        self.stdout.write(f'Total Products: {total_products}')
        self.stdout.write(f'Total Companies: {total_companies}')
        self.stdout.write(f'Average Products per Company: {total_products/total_companies:.1f}')