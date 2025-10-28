#!/usr/bin/env python3
"""
Test script to verify Swagger integration
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, '/Users/akshdas/akshay_das_workspace/work/my-scripts/my-project/Inventory-Management-System/backend')

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Setup Django
django.setup()

try:
    from drf_yasg.views import get_schema_view
    from drf_yasg import openapi
    print("✅ drf-yasg imported successfully!")
    print("✅ Swagger integration is ready!")
    
    # Test schema view creation
    schema_view = get_schema_view(
        openapi.Info(
            title="Inventory Management API",
            default_version='v1',
        ),
        public=True,
    )
    print("✅ Schema view created successfully!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")