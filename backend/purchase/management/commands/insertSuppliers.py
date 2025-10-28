from django.core.management.base import BaseCommand
from django.db import transaction
import random
import string
from purchase.models import Supplier

class Command(BaseCommand):
    help = 'Insert 100 sample suppliers into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=100,
            help='Number of suppliers to create (default: 100)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing suppliers before creating new ones',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing suppliers...'))
            Supplier.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing suppliers cleared.'))

        # Sample data lists
        company_names = [
            'Apollo', 'Cipla', 'Sun', 'Lupin', 'Aurobindo', 'Reddy\'s', 'Torrent', 'Glenmark',
            'Biocon', 'Cadila', 'Mankind', 'Alkem', 'Micro Labs', 'Zydus', 'Intas', 'Aristo',
            'Abbott', 'Pfizer', 'GSK', 'Novartis', 'Sanofi', 'Merck', 'Johnson', 'Roche',
            'AstraZeneca', 'Bayer', 'Boehringer', 'Takeda', 'Eli Lilly', 'Bristol Myers',
            'Medico', 'Pharma Plus', 'Health Care', 'Medi Corp', 'Bio Labs', 'Vita Health',
            'Prime Pharma', 'Elite Medical', 'Global Health', 'Supreme Medical', 'Advanced Bio',
            'United Pharma', 'Crystal Medical', 'Royal Health', 'Diamond Medical', 'Golden Pharma'
        ]

        # Pharmaceutical company name suffixes
        pharma_suffixes = [
            'Pharmaceuticals', 'Medical', 'Healthcare', 'Labs', 'Biotech',
            'Medicines', 'Life Sciences', 'Drug Company', 'Medical Supplies',
            'Pharmaceutical Industries', 'Health Solutions', 'Medical Systems'
        ]

        # Sample names for contact persons
        first_names = [
            'Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anita', 'Suresh', 'Kavya',
            'Rajesh', 'Meera', 'Arjun', 'Divya', 'Manoj', 'Pooja', 'Sanjay', 'Ritu',
            'Deepak', 'Neha', 'Kiran', 'Swati', 'Anil', 'Shilpa', 'Vinod', 'Preeti',
            'Ramesh', 'Sunita', 'Ashok', 'Nisha', 'Prakash', 'Jyoti', 'Rohit', 'Seema'
        ]

        last_names = [
            'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Agarwal', 'Jain', 'Patel',
            'Shah', 'Reddy', 'Rao', 'Nair', 'Iyer', 'Menon', 'Bansal', 'Mittal',
            'Khanna', 'Malhotra', 'Chopra', 'Kapoor', 'Saxena', 'Srivastava', 'Tiwari', 'Pandey'
        ]

        # Common pharmaceutical industry contact person titles
        contact_titles = [
            'Sales Manager', 'Business Development Manager', 'Account Manager',
            'Regional Manager', 'Supply Chain Manager', 'Product Manager',
            'Area Sales Manager', 'Key Account Manager', 'Territory Manager'
        ]

        # Indian cities
        cities = [
            'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
            'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam',
            'Vadodara', 'Coimbatore', 'Agra', 'Rajkot', 'Kochi', 'Mysore', 'Chandigarh', 'Guwahati'
        ]

        # Indian states
        states = [
            'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal',
            'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh',
            'Kerala', 'Punjab', 'Haryana', 'Assam', 'Bihar', 'Odisha', 'Jharkhand'
        ]

        suppliers_to_create = []
        
        self.stdout.write(f'Creating {count} sample suppliers...')
        
        # Generate sample data
        for i in range(count):
            # Generate unique company name
            company_base = random.choice(company_names)
            company_suffix = random.choice(pharma_suffixes)
            company_name = f"{company_base} {company_suffix}"
            
            # Add unique identifier if needed
            if random.random() < 0.3:  # 30% chance to add number
                company_name += f" {random.randint(1, 99)}"
            
            # Generate contact person with title
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            contact_title = random.choice(contact_titles)
            contact_person = f"{first_name} {last_name} ({contact_title})"
            
            # Generate Indian-style phone numbers
            phone_number = f"+91-{random.randint(70000, 99999)}-{random.randint(10000, 99999)}"
            
            # Generate email based on company name
            company_domain = company_base.lower().replace(' ', '').replace('\'', '')
            email_prefix = f"{first_name.lower()}.{last_name.lower()}"
            email_dept = random.choice(['sales', 'info', 'contact', 'business'])
            email_domain = random.choice(['com', 'in', 'co.in'])
            email = f"{email_prefix}.{email_dept}@{company_domain}.{email_domain}"
            
            # Make email unique by adding number if needed
            if i > 0:  # Add unique identifier to avoid duplicates
                email = f"{email_prefix}.{email_dept}{i}@{company_domain}.{email_domain}"
            
            # Generate realistic address
            street_number = random.randint(1, 999)
            street_names = ['MG Road', 'Park Street', 'Brigade Road', 'Commercial Street', 'Main Road', 'Gandhi Road', 'Nehru Street', 'Station Road']
            street_name = random.choice(street_names)
            city = random.choice(cities)
            state = random.choice(states)
            pincode = random.randint(100000, 999999)
            address = f"{street_number} {street_name}, {city}, {state}, India - {pincode}"
            
            # Generate drug license number (Indian format: DL-StateCode-Year-Number)
            state_codes = ['MH', 'DL', 'KA', 'TN', 'UP', 'GJ', 'RJ', 'WB', 'AP', 'TS']
            drug_license = f"DL-{random.choice(state_codes)}-{random.randint(2020, 2024)}-{random.randint(100000, 999999)}"
            
            # Generate GST number (Indian format: 15 digit alphanumeric)
            def random_letter():
                return random.choice(string.ascii_uppercase)
            
            gst_number = f"{random.randint(10, 99)}{random_letter()}{random_letter()}{random_letter()}{random_letter()}{random_letter()}{random.randint(1000, 9999)}{random_letter()}{random.randint(1, 9)}{random_letter()}{random.randint(1, 9)}"
            
            supplier_data = {
                'name': company_name,
                'contact_person': contact_person,
                'phone_number': phone_number,
                'email': email,
                'address': address,
                'drug_license_number': drug_license,
                'gst_number': gst_number,
            }
            
            suppliers_to_create.append(Supplier(**supplier_data))

        # Bulk create suppliers with transaction
        try:
            with transaction.atomic():
                created_suppliers = Supplier.objects.bulk_create(
                    suppliers_to_create,
                    ignore_conflicts=True,  # Skip if duplicate name/email exists
                    batch_size=50
                )
                
                actual_created = len(created_suppliers)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created {actual_created} suppliers out of {count} attempted.'
                    )
                )
                
                if actual_created < count:
                    self.stdout.write(
                        self.style.WARNING(
                            f'{count - actual_created} suppliers were skipped due to duplicate names or emails.'
                        )
                    )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating suppliers: {str(e)}')
            )
            return

        # Display some sample data
        self.stdout.write('\n' + self.style.SUCCESS('Sample suppliers created:'))
        sample_suppliers = Supplier.objects.order_by('-id')[:5]
        
        for supplier in sample_suppliers:
            self.stdout.write(
                f"• {supplier.name}\n"
                f"  Contact: {supplier.contact_person}\n"
                f"  Email: {supplier.email}\n"
                f"  Phone: {supplier.phone_number}\n"
                f"  Drug License: {supplier.drug_license_number}\n"
                f"  GST: {supplier.gst_number}\n"
                f"  Address: {supplier.address[:50]}...\n"
            )

        total_suppliers = Supplier.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'\nTotal suppliers in database: {total_suppliers}')
        )