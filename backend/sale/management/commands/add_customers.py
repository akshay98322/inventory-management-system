from django.core.management.base import BaseCommand
from django.db import transaction
import random
import string
from sale.models import Customer


class Command(BaseCommand):
    help = 'Insert sample customers into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=100,
            help='Number of customers to create (default: 100)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing customers before creating new ones',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing customers...'))
            Customer.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing customers cleared.'))

        # Sample data lists for pharmacy customers
        pharmacy_names = [
            'City', 'Metro', 'Central', 'Prime', 'Elite', 'Royal', 'Supreme', 'Golden', 'Crystal',
            'Diamond', 'Health Plus', 'MedCare', 'Wellness', 'LifeLine', 'Guardian', 'Apollo',
            'Max', 'Star', 'New', 'Modern', 'Advanced', 'First Aid', 'Quick', 'Express',
            'Care', 'Trust', 'Hope', 'Unity', 'Sunrise', 'Moonlight', 'Rainbow', 'Bright',
            'Green Cross', 'Red Cross', 'Blue Cross', 'White Cross', 'Health', 'Medical',
            'Pharma', 'Drug', 'Medicine', 'Clinic', 'Hospital', 'Dispensary', 'Chemist'
        ]

        # Pharmacy business type suffixes
        business_suffixes = [
            'Pharmacy', 'Medical Store', 'Chemist', 'Drug Store', 'Medical Hall',
            'Dispensary', 'Health Care', 'Medical Center', 'Clinic Pharmacy',
            'Hospital Pharmacy', 'Community Pharmacy', 'Retail Pharmacy'
        ]

        # Sample names for contact persons
        first_names = [
            'Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anita', 'Suresh', 'Kavya',
            'Rajesh', 'Meera', 'Arjun', 'Divya', 'Manoj', 'Pooja', 'Sanjay', 'Ritu',
            'Deepak', 'Neha', 'Kiran', 'Swati', 'Anil', 'Shilpa', 'Vinod', 'Preeti',
            'Ramesh', 'Sunita', 'Ashok', 'Nisha', 'Prakash', 'Jyoti', 'Rohit', 'Seema',
            'Dr. Anand', 'Dr. Shalini', 'Dr. Naveen', 'Dr. Rekha', 'Dr. Arun', 'Dr. Smita'
        ]

        last_names = [
            'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Agarwal', 'Jain', 'Patel',
            'Shah', 'Reddy', 'Rao', 'Nair', 'Iyer', 'Menon', 'Bansal', 'Mittal',
            'Khanna', 'Malhotra', 'Chopra', 'Kapoor', 'Saxena', 'Srivastava', 'Tiwari', 'Pandey'
        ]

        # Pharmacy business contact person titles
        contact_titles = [
            'Owner', 'Manager', 'Pharmacist', 'Store Manager', 'Business Owner',
            'Director', 'Partner', 'Chief Pharmacist', 'General Manager'
        ]

        # Indian cities
        cities = [
            'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
            'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam',
            'Vadodara', 'Coimbatore', 'Agra', 'Rajkot', 'Kochi', 'Mysore', 'Chandigarh', 'Guwahati',
            'Bhubaneswar', 'Thiruvananthapuram', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad'
        ]

        # Indian states
        states = [
            'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal',
            'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh',
            'Kerala', 'Punjab', 'Haryana', 'Assam', 'Bihar', 'Odisha', 'Jharkhand'
        ]

        customers_to_create = []
        
        self.stdout.write(f'Creating {count} sample customers...')
        
        # Generate sample data
        for i in range(count):
            # Generate unique pharmacy name
            pharmacy_base = random.choice(pharmacy_names)
            business_suffix = random.choice(business_suffixes)
            business_name = f"{pharmacy_base} {business_suffix}"
            
            # Add unique identifier if needed to avoid duplicates
            if random.random() < 0.3:  # 30% chance to add number
                business_name += f" - {random.randint(1, 99)}"
            elif i > len(pharmacy_names):  # For larger counts
                business_name += f" {i}"
            
            # Generate contact person with title
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            contact_title = random.choice(contact_titles)
            contact_person = f"{first_name} {last_name} ({contact_title})"
            
            # Generate Indian-style phone numbers
            phone_number = f"+91-{random.randint(70000, 99999)}-{random.randint(10000, 99999)}"
            
            # Generate email based on business name
            business_domain = pharmacy_base.lower().replace(' ', '').replace('-', '')
            email_prefix = f"{first_name.lower()}.{last_name.lower()}"
            email_dept = random.choice(['info', 'contact', 'admin', 'owner', 'manager'])
            email_domain = random.choice(['com', 'in', 'co.in'])
            
            # Make email unique by adding number
            email = f"{email_prefix}.{email_dept}{i+1}@{business_domain}.{email_domain}"
            
            # Generate realistic address
            street_number = random.randint(1, 999)
            street_names = [
                'Main Road', 'Market Street', 'Gandhi Road', 'Nehru Street', 'MG Road', 
                'Station Road', 'Hospital Road', 'Commercial Street', 'Civil Lines',
                'Medical Square', 'Health Plaza', 'Pharmacy Lane', 'Medicine Street'
            ]
            street_name = random.choice(street_names)
            city = random.choice(cities)
            state = random.choice(states)
            pincode = random.randint(100000, 999999)
            address = f"{street_number} {street_name}, {city}, {state}, India - {pincode}"
            
            # Generate drug license number (Indian format: DL-StateCode-Year-Number)
            state_codes = ['MH', 'DL', 'KA', 'TN', 'UP', 'GJ', 'RJ', 'WB', 'AP', 'TS', 'KL', 'PB', 'HR', 'AS', 'BR', 'OR', 'JH']
            drug_license = f"DL-{random.choice(state_codes)}-{random.randint(2020, 2024)}-{random.randint(100000, 999999)}"
            
            # Generate GST number (Indian format: 15 digit alphanumeric)
            def random_letter():
                return random.choice(string.ascii_uppercase)
            
            gst_number = f"{random.randint(10, 99)}{random_letter()}{random_letter()}{random_letter()}{random_letter()}{random_letter()}{random.randint(1000, 9999)}{random_letter()}{random.randint(1, 9)}{random_letter()}{random.randint(1, 9)}"
            
            customer_data = {
                'name': business_name,
                'contact_person': contact_person,
                'phone_number': phone_number,
                'email': email,
                'address': address,
                'drug_license_number': drug_license,
                'gst_number': gst_number,
            }
            
            customers_to_create.append(Customer(**customer_data))

        # Bulk create customers with transaction
        try:
            with transaction.atomic():
                created_customers = Customer.objects.bulk_create(
                    customers_to_create,
                    ignore_conflicts=True,  # Skip if duplicate name/email exists
                    batch_size=50
                )
                
                actual_created = len(created_customers)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created {actual_created} customers out of {count} attempted.'
                    )
                )
                
                if actual_created < count:
                    self.stdout.write(
                        self.style.WARNING(
                            f'{count - actual_created} customers were skipped due to duplicate names or emails.'
                        )
                    )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating customers: {str(e)}')
            )
            return

        # Display some sample data
        self.stdout.write('\n' + self.style.SUCCESS('Sample customers created:'))
        sample_customers = Customer.objects.order_by('-id')[:5]
        
        for customer in sample_customers:
            self.stdout.write(
                f"• {customer.name}\n"
                f"  Contact: {customer.contact_person}\n"
                f"  Email: {customer.email}\n"
                f"  Phone: {customer.phone_number}\n"
                f"  Drug License: {customer.drug_license_number}\n"
                f"  GST: {customer.gst_number}\n"
                f"  Address: {customer.address[:50]}...\n"
            )

        total_customers = Customer.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'\nTotal customers in database: {total_customers}')
        )