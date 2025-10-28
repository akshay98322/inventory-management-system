from django.core.management.base import BaseCommand
from inventory.models import Company
from django.db import IntegrityError
import random


class Command(BaseCommand):
    help = 'Insert 100 sample pharmaceutical companies into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=100,
            help='Number of companies to create (default: 100)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing companies before inserting new ones'
        )

    def handle(self, *args, **options):
        count = options['count']
        clear_existing = options['clear']

        if clear_existing:
            self.stdout.write(self.style.WARNING('Clearing existing companies...'))
            Company.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing companies cleared.'))

        # List of pharmaceutical and medical company names
        company_names = [
            "Pfizer Inc", "Johnson & Johnson", "Roche Holding AG", "Novartis AG", "Merck & Co",
            "AbbVie Inc", "Bristol Myers Squibb", "AstraZeneca PLC", "GlaxoSmithKline", "Sanofi SA",
            "Gilead Sciences", "Amgen Inc", "Eli Lilly and Company", "Biogen Inc", "Regeneron Pharmaceuticals",
            "Moderna Inc", "Vertex Pharmaceuticals", "Illumina Inc", "Alexion Pharmaceuticals", "Celgene Corporation",
            "Takeda Pharmaceutical", "Bayer AG", "Boehringer Ingelheim", "Teva Pharmaceutical", "Allergan PLC",
            "Shire PLC", "Mylan NV", "Perrigo Company", "Mallinckrodt PLC", "Endo International",
            "Sun Pharmaceutical", "Dr. Reddy's Laboratories", "Cipla Limited", "Lupin Limited", "Aurobindo Pharma",
            "Torrent Pharmaceuticals", "Glenmark Pharmaceuticals", "Cadila Healthcare", "Biocon Limited", "Divi's Laboratories",
            "Alkem Laboratories", "Mankind Pharma", "Strides Pharma Science", "Natco Pharma", "Hetero Drugs",
            "Suven Life Sciences", "Laurus Labs", "Granules India", "Divis Laboratories", "Solara Active Pharma",
            "Unichem Laboratories", "FDC Limited", "JB Chemicals", "Ajanta Pharma", "Alembic Pharmaceuticals",
            "IPCA Laboratories", "Piramal Enterprises", "Wockhardt Limited", "Elder Pharmaceuticals", "Zydus Cadila",
            "Emcure Pharmaceuticals", "Intas Pharmaceuticals", "Micro Labs", "Abbott Healthcare", "Himalaya Drug Company",
            "Ranbaxy Laboratories", "Nicholas Piramal", "Matrix Laboratories", "Orchid Chemicals", "Jubilant Life Sciences",
            "Ind-Swift Laboratories", "Morepen Laboratories", "Nectar Lifesciences", "Punjab Chemicals", "Akums Drugs",
            "Medico Remedies", "Blue Cross Laboratories", "Medley Home", "Concept Pharmaceuticals", "Medispan Limited",
            "Plethico Pharmaceuticals", "Troikaa Pharmaceuticals", "Corona Remedies", "Sanify Healthcare", "Windlas Biotech",
            "Medanta Healthcare", "Apollo Pharmaceuticals", "Max Healthcare", "Fortis Healthcare", "Narayana Health",
            "Manipal Hospitals", "Columbia Asia", "Global Health", "Care Hospitals", "Aster DM Healthcare",
            "Motherhood Hospitals", "Rainbow Children's Hospital", "Sankara Eye Foundation", "LV Prasad Eye Institute", "Aravind Eye Care",
            "Nova Pharmaceuticals", "Zenith Healthcare", "Prime Pharmaceuticals", "Alpha Pharma", "Beta Laboratories",
            "Gamma Healthcare", "Delta Medicines", "Epsilon Drugs", "Zeta Pharmaceuticals", "Eta Life Sciences",
            "Theta Biotech", "Iota Healthcare", "Kappa Remedies", "Lambda Pharma", "Mu Laboratories"
        ]

        # Shuffle the list to get random selection
        random.shuffle(company_names)

        created_count = 0
        skipped_count = 0

        self.stdout.write(f'Creating {count} sample companies...')

        for i in range(count):
            # Use modulo to cycle through names if count > len(company_names)
            name_index = i % len(company_names)
            company_name = company_names[name_index]
            
            # If we need more companies than available names, add a suffix
            if i >= len(company_names):
                suffix = (i // len(company_names)) + 1
                company_name = f"{company_name} - Branch {suffix}"

            try:
                company = Company.objects.create(name=company_name)
                created_count += 1
                if created_count % 10 == 0:
                    self.stdout.write(f'Created {created_count} companies...')
            except IntegrityError:
                # Company with this name already exists
                skipped_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Skipped duplicate company: {company_name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} companies. '
                f'Skipped {skipped_count} duplicates.'
            )
        )