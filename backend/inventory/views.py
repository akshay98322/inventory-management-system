from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Company, Product, Stock
from .serializers import CompanySerializer, ProductSerializer, StockSerializer

# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000  # Increased limit for search operations

class CompanyViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows companies to be viewed or edited.
    
    Provides CRUD operations for managing pharmaceutical companies.
    Supports search and ordering functionality.
    """
    queryset = Company.objects.all().order_by('id')
    serializer_class = CompanySerializer
    pagination_class = StandardResultsSetPagination
    
    @swagger_auto_schema(
        operation_description="Retrieve a list of companies with optional search and ordering",
        operation_summary="List Companies",
        tags=['Inventory - Companies'],
        manual_parameters=[
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Search companies by name",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'ordering',
                openapi.IN_QUERY,
                description="Order results by field (id, name, created_at, updated_at). Use '-' prefix for descending order",
                type=openapi.TYPE_STRING,
                enum=['id', '-id', 'name', '-name', 'created_at', '-created_at', 'updated_at', '-updated_at']
            ),
            openapi.Parameter(
                'page',
                openapi.IN_QUERY,
                description="Page number for pagination",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'page_size',
                openapi.IN_QUERY,
                description="Number of results per page (max 1000)",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: openapi.Response(
                description="Companies retrieved successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'next': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                        'previous': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                        'results': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'name': openapi.Schema(type=openapi.TYPE_STRING),
                                    'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                                    'updated_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time')
                                }
                            )
                        )
                    }
                )
            ),
            400: openapi.Response(description="Invalid query parameters"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Create a new company",
        operation_summary="Create Company",
        tags=['Inventory - Companies'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description="Company name")
            }
        ),
        responses={
            201: openapi.Response(description="Company created successfully"),
            400: openapi.Response(description="Invalid data provided"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Retrieve a specific company by ID",
        operation_summary="Get Company",
        tags=['Inventory - Companies'],
        responses={
            200: openapi.Response(description="Company retrieved successfully"),
            404: openapi.Response(description="Company not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Update a company completely",
        operation_summary="Update Company",
        tags=['Inventory - Companies'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description="Company name")
            }
        ),
        responses={
            200: openapi.Response(description="Company updated successfully"),
            400: openapi.Response(description="Invalid data provided"),
            404: openapi.Response(description="Company not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Partially update a company",
        operation_summary="Partial Update Company",
        tags=['Inventory - Companies'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description="Company name")
            }
        ),
        responses={
            200: openapi.Response(description="Company updated successfully"),
            400: openapi.Response(description="Invalid data provided"),
            404: openapi.Response(description="Company not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Delete a company",
        operation_summary="Delete Company",
        tags=['Inventory - Companies'],
        responses={
            204: openapi.Response(description="Company deleted successfully"),
            404: openapi.Response(description="Company not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    def get_queryset(self):
        queryset = Company.objects.all()
        search = self.request.query_params.get('search', None)
        ordering = self.request.query_params.get('ordering', 'id')
        
        if search is not None:
            queryset = queryset.filter(
                Q(name__icontains=search)
            )
        
        # Handle ordering
        valid_orderings = ['id', '-id', 'name', '-name', 'created_at', '-created_at', 'updated_at', '-updated_at']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
            
        return queryset

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows products to be viewed or edited.
    
    Provides CRUD operations for managing pharmaceutical products.
    Supports search by product name or company name, and ordering functionality.
    """
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer
    pagination_class = StandardResultsSetPagination
    
    @swagger_auto_schema(
        operation_description="Retrieve a list of products with optional search and ordering",
        operation_summary="List Products",
        tags=['Inventory - Products'],
        manual_parameters=[
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Search products by name or company name",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'ordering',
                openapi.IN_QUERY,
                description="Order results by field. Use '-' prefix for descending order",
                type=openapi.TYPE_STRING,
                enum=['id', '-id', 'name', '-name', 'company__name', '-company__name', 'created_at', '-created_at', 'updated_at', '-updated_at']
            ),
            openapi.Parameter(
                'page',
                openapi.IN_QUERY,
                description="Page number for pagination",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'page_size',
                openapi.IN_QUERY,
                description="Number of results per page (max 1000)",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: openapi.Response(
                description="Products retrieved successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'next': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                        'previous': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                        'results': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'name': openapi.Schema(type=openapi.TYPE_STRING),
                                    'company': openapi.Schema(type=openapi.TYPE_INTEGER, description="Company ID"),
                                    'company_name': openapi.Schema(type=openapi.TYPE_STRING, description="Company name"),
                                    'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                                    'updated_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time')
                                }
                            )
                        )
                    }
                )
            ),
            400: openapi.Response(description="Invalid query parameters"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Create a new product",
        operation_summary="Create Product",
        tags=['Inventory - Products'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name', 'company'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description="Product name"),
                'company': openapi.Schema(type=openapi.TYPE_INTEGER, description="Company ID")
            }
        ),
        responses={
            201: openapi.Response(description="Product created successfully"),
            400: openapi.Response(description="Invalid data provided"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Retrieve a specific product by ID",
        operation_summary="Get Product",
        tags=['Inventory - Products'],
        responses={
            200: openapi.Response(description="Product retrieved successfully"),
            404: openapi.Response(description="Product not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Update a product completely",
        operation_summary="Update Product",
        tags=['Inventory - Products'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name', 'company'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description="Product name"),
                'company': openapi.Schema(type=openapi.TYPE_INTEGER, description="Company ID")
            }
        ),
        responses={
            200: openapi.Response(description="Product updated successfully"),
            400: openapi.Response(description="Invalid data provided"),
            404: openapi.Response(description="Product not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Partially update a product",
        operation_summary="Partial Update Product",
        tags=['Inventory - Products'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description="Product name"),
                'company': openapi.Schema(type=openapi.TYPE_INTEGER, description="Company ID")
            }
        ),
        responses={
            200: openapi.Response(description="Product updated successfully"),
            400: openapi.Response(description="Invalid data provided"),
            404: openapi.Response(description="Product not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Delete a product",
        operation_summary="Delete Product",
        tags=['Inventory - Products'],
        responses={
            204: openapi.Response(description="Product deleted successfully"),
            404: openapi.Response(description="Product not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    def get_queryset(self):
        queryset = Product.objects.select_related('company').all()
        search = self.request.query_params.get('search', None)
        ordering = self.request.query_params.get('ordering', 'id')
        
        if search is not None:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(company__name__icontains=search)
            )
        
        # Handle ordering
        valid_orderings = [
            'id', '-id', 'name', '-name', 'company__name', '-company__name',
            'created_at', '-created_at', 'updated_at', '-updated_at'
        ]
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
            
        return queryset

class StockViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows stock to be viewed or edited.
    
    Provides CRUD operations for managing pharmaceutical stock inventory.
    Supports comprehensive search by product, company, batch number, HSN code
    and extensive ordering functionality.
    """
    queryset = Stock.objects.all().order_by('id')
    serializer_class = StockSerializer
    pagination_class = StandardResultsSetPagination
    
    @swagger_auto_schema(
        operation_description="Retrieve a list of stock items with optional search and ordering",
        operation_summary="List Stock Items",
        tags=['Inventory - Stock'],
        manual_parameters=[
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Search stock by product name, company name, batch number, or HSN code",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'ordering',
                openapi.IN_QUERY,
                description="Order results by field. Use '-' prefix for descending order",
                type=openapi.TYPE_STRING,
                enum=[
                    'id', '-id', 'product__name', '-product__name', 
                    'product__company__name', '-product__company__name',
                    'batch_number', '-batch_number', 'expiry_date', '-expiry_date',
                    'quantity', '-quantity', 'purchase_price', '-purchase_price',
                    'sale_price', '-sale_price', 'mrp', '-mrp', 'tax', '-tax',
                    'hsn_code', '-hsn_code', 'total_price', '-total_price',
                    'created_at', '-created_at', 'updated_at', '-updated_at'
                ]
            ),
            openapi.Parameter(
                'page',
                openapi.IN_QUERY,
                description="Page number for pagination",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'page_size',
                openapi.IN_QUERY,
                description="Number of results per page (max 1000)",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: openapi.Response(
                description="Stock items retrieved successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'next': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                        'previous': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                        'results': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'product': openapi.Schema(type=openapi.TYPE_INTEGER, description="Product ID"),
                                    'product_name': openapi.Schema(type=openapi.TYPE_STRING),
                                    'company_name': openapi.Schema(type=openapi.TYPE_STRING),
                                    'batch_number': openapi.Schema(type=openapi.TYPE_STRING),
                                    'expiry_date': openapi.Schema(type=openapi.TYPE_STRING, format='date'),
                                    'quantity': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'purchase_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal'),
                                    'sale_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal'),
                                    'mrp': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal'),
                                    'tax': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal'),
                                    'hsn_code': openapi.Schema(type=openapi.TYPE_STRING),
                                    'total_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal'),
                                    'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                                    'updated_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time')
                                }
                            )
                        )
                    }
                )
            ),
            400: openapi.Response(description="Invalid query parameters"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Create a new stock item",
        operation_summary="Create Stock Item",
        tags=['Inventory - Stock'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['product', 'batch_number', 'expiry_date', 'quantity', 'purchase_price', 'sale_price', 'mrp', 'tax', 'hsn_code'],
            properties={
                'product': openapi.Schema(type=openapi.TYPE_INTEGER, description="Product ID"),
                'batch_number': openapi.Schema(type=openapi.TYPE_STRING, description="Batch number"),
                'expiry_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description="Expiry date (YYYY-MM-DD)"),
                'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, description="Quantity in stock"),
                'purchase_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Purchase price per unit"),
                'sale_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Sale price per unit"),
                'mrp': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Maximum retail price"),
                'tax': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Tax percentage"),
                'hsn_code': openapi.Schema(type=openapi.TYPE_STRING, description="HSN/SAC code")
            }
        ),
        responses={
            201: openapi.Response(description="Stock item created successfully"),
            400: openapi.Response(description="Invalid data provided"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Retrieve a specific stock item by ID",
        operation_summary="Get Stock Item",
        tags=['Inventory - Stock'],
        responses={
            200: openapi.Response(description="Stock item retrieved successfully"),
            404: openapi.Response(description="Stock item not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Update a stock item completely",
        operation_summary="Update Stock Item",
        tags=['Inventory - Stock'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['product', 'batch_number', 'expiry_date', 'quantity', 'purchase_price', 'sale_price', 'mrp', 'tax', 'hsn_code'],
            properties={
                'product': openapi.Schema(type=openapi.TYPE_INTEGER, description="Product ID"),
                'batch_number': openapi.Schema(type=openapi.TYPE_STRING, description="Batch number"),
                'expiry_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description="Expiry date (YYYY-MM-DD)"),
                'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, description="Quantity in stock"),
                'purchase_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Purchase price per unit"),
                'sale_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Sale price per unit"),
                'mrp': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Maximum retail price"),
                'tax': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Tax percentage"),
                'hsn_code': openapi.Schema(type=openapi.TYPE_STRING, description="HSN/SAC code")
            }
        ),
        responses={
            200: openapi.Response(description="Stock item updated successfully"),
            400: openapi.Response(description="Invalid data provided"),
            404: openapi.Response(description="Stock item not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Partially update a stock item",
        operation_summary="Partial Update Stock Item",
        tags=['Inventory - Stock'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'product': openapi.Schema(type=openapi.TYPE_INTEGER, description="Product ID"),
                'batch_number': openapi.Schema(type=openapi.TYPE_STRING, description="Batch number"),
                'expiry_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description="Expiry date (YYYY-MM-DD)"),
                'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, description="Quantity in stock"),
                'purchase_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Purchase price per unit"),
                'sale_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Sale price per unit"),
                'mrp': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Maximum retail price"),
                'tax': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Tax percentage"),
                'hsn_code': openapi.Schema(type=openapi.TYPE_STRING, description="HSN/SAC code")
            }
        ),
        responses={
            200: openapi.Response(description="Stock item updated successfully"),
            400: openapi.Response(description="Invalid data provided"),
            404: openapi.Response(description="Stock item not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Delete a stock item",
        operation_summary="Delete Stock Item",
        tags=['Inventory - Stock'],
        responses={
            204: openapi.Response(description="Stock item deleted successfully"),
            404: openapi.Response(description="Stock item not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    def get_queryset(self):
        queryset = Stock.objects.select_related('product', 'product__company').all()
        search = self.request.query_params.get('search', None)
        ordering = self.request.query_params.get('ordering', 'id')
        
        if search is not None:
            queryset = queryset.filter(
                Q(product__name__icontains=search) |
                Q(product__company__name__icontains=search) |
                Q(batch_number__icontains=search) |
                Q(hsn_code__icontains=search)
            )
        
        # Handle ordering
        valid_orderings = [
            'id', '-id', 'product__name', '-product__name', 
            'product__company__name', '-product__company__name',
            'batch_number', '-batch_number', 'expiry_date', '-expiry_date',
            'quantity', '-quantity', 'purchase_price', '-purchase_price',
            'sale_price', '-sale_price', 'mrp', '-mrp', 'tax', '-tax',
            'hsn_code', '-hsn_code', 'total_price', '-total_price',
            'created_at', '-created_at', 'updated_at', '-updated_at'
        ]
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
            
        return queryset
