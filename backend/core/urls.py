"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from .views import MyTokenObtainPairView, company_settings
from .dashboard_views import dashboard_metrics, low_stock_items

# Swagger/OpenAPI Schema
schema_view = get_schema_view(
   openapi.Info(
      title="InvoicERP API",
      default_version='v1',
      description="""
      Comprehensive Inventory Management System API
      
      ## Features
      - **Authentication**: JWT-based secure authentication
      - **Inventory Management**: Companies, Products, and Stock tracking
      - **Purchase Management**: Suppliers and Purchase Orders
      - **Sales Management**: Customers and Sale Orders  
      - **Dashboard Analytics**: Real-time metrics and stock alerts
      
      ## Authentication
      Use the `/api/token/` endpoint to obtain access tokens.
      Include the token in requests using the Authorization header:
      `Authorization: Bearer <your-token>`
      
      ## Business Logic
      - Stock levels are automatically updated when orders are completed
      - Order totals are calculated from line items
      - Invoice numbers are auto-generated for sale orders
      - Batch tracking with expiry dates for pharmaceutical compliance
      """,
      terms_of_service="https://www.invoicerp.com/terms/",
      contact=openapi.Contact(email="contact@invoicerp.com"),
      license=openapi.License(name="MIT License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin and API Documentation
    path('admin/', admin.site.urls),
    
    # Swagger Documentation URLs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # Authentication APIs
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Core APIs
    path('api/settings/company/', company_settings, name='company_settings'),
    path('api/dashboard/metrics/', dashboard_metrics, name='dashboard_metrics'),
    path('api/dashboard/low-stock/', low_stock_items, name='low_stock_items'),
    
    # Domain APIs
    path('api/inventory/', include('inventory.urls')),
    path('api/purchase/', include('purchase.urls')),
    path('api/sale/', include('sale.urls')),
]

