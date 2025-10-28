from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Supplier, PurchaseOrder, PurchaseOrderItem
from .serializers import SupplierSerializer, PurchaseOrderSerializer, PurchaseOrderItemSerializer

# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000  # Increased limit for search operations

class SupplierViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows suppliers to be viewed or edited.
    
    Provides CRUD operations for managing pharmaceutical suppliers.
    Supports comprehensive search across all supplier fields.
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    pagination_class = StandardResultsSetPagination
    
    @swagger_auto_schema(
        operation_description="Retrieve a list of suppliers with optional search and ordering",
        operation_summary="List Suppliers",
        tags=['Purchase - Suppliers'],
        manual_parameters=[
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Search suppliers by name, contact person, phone, email, address, drug license, or GST number",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'ordering',
                openapi.IN_QUERY,
                description="Order results by field. Use '-' prefix for descending order",
                type=openapi.TYPE_STRING,
                enum=[
                    'id', '-id', 'name', '-name', 'contact_person', '-contact_person',
                    'phone_number', '-phone_number', 'email', '-email', 'address', '-address',
                    'drug_license_number', '-drug_license_number', 'gst_number', '-gst_number',
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
                description="Suppliers retrieved successfully",
                examples={
                    "application/json": {
                        "count": 25,
                        "next": "http://localhost:8000/api/suppliers/?page=2",
                        "previous": None,
                        "results": [
                            {
                                "id": 1,
                                "name": "MediSupply Co.",
                                "contact_person": "John Doe",
                                "phone_number": "+1234567890",
                                "email": "contact@medisupply.com",
                                "address": "123 Medical St, Healthcare City",
                                "drug_license_number": "DL20/21/3456",
                                "gst_number": "GST123456789",
                                "created_at": "2025-01-08T10:30:00Z",
                                "updated_at": "2025-01-08T10:30:00Z"
                            }
                        ]
                    }
                }
            ),
            400: openapi.Response(description="Invalid query parameters"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Create a new supplier",
        operation_summary="Create Supplier",
        tags=['Purchase - Suppliers'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name', 'contact_person', 'phone_number', 'email', 'address', 'drug_license_number', 'gst_number'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description="Supplier company name"),
                'contact_person': openapi.Schema(type=openapi.TYPE_STRING, description="Primary contact person"),
                'phone_number': openapi.Schema(type=openapi.TYPE_STRING, description="Contact phone number"),
                'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description="Contact email address"),
                'address': openapi.Schema(type=openapi.TYPE_STRING, description="Complete address"),
                'drug_license_number': openapi.Schema(type=openapi.TYPE_STRING, description="Drug license number"),
                'gst_number': openapi.Schema(type=openapi.TYPE_STRING, description="GST registration number")
            }
        ),
        responses={
            201: openapi.Response(description="Supplier created successfully"),
            400: openapi.Response(description="Invalid data provided"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Retrieve a specific supplier by ID",
        operation_summary="Get Supplier",
        tags=['Purchase - Suppliers'],
        responses={
            200: openapi.Response(description="Supplier retrieved successfully"),
            404: openapi.Response(description="Supplier not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Update a supplier completely",
        operation_summary="Update Supplier",
        tags=['Purchase - Suppliers'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name', 'contact_person', 'phone_number', 'email', 'address', 'drug_license_number', 'gst_number'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description="Supplier company name"),
                'contact_person': openapi.Schema(type=openapi.TYPE_STRING, description="Primary contact person"),
                'phone_number': openapi.Schema(type=openapi.TYPE_STRING, description="Contact phone number"),
                'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description="Contact email address"),
                'address': openapi.Schema(type=openapi.TYPE_STRING, description="Complete address"),
                'drug_license_number': openapi.Schema(type=openapi.TYPE_STRING, description="Drug license number"),
                'gst_number': openapi.Schema(type=openapi.TYPE_STRING, description="GST registration number")
            }
        ),
        responses={
            200: openapi.Response(description="Supplier updated successfully"),
            400: openapi.Response(description="Invalid data provided"),
            404: openapi.Response(description="Supplier not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Partially update a supplier",
        operation_summary="Partial Update Supplier",
        tags=['Purchase - Suppliers'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description="Supplier company name"),
                'contact_person': openapi.Schema(type=openapi.TYPE_STRING, description="Primary contact person"),
                'phone_number': openapi.Schema(type=openapi.TYPE_STRING, description="Contact phone number"),
                'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description="Contact email address"),
                'address': openapi.Schema(type=openapi.TYPE_STRING, description="Complete address"),
                'drug_license_number': openapi.Schema(type=openapi.TYPE_STRING, description="Drug license number"),
                'gst_number': openapi.Schema(type=openapi.TYPE_STRING, description="GST registration number")
            }
        ),
        responses={
            200: openapi.Response(description="Supplier updated successfully"),
            400: openapi.Response(description="Invalid data provided"),
            404: openapi.Response(description="Supplier not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Delete a supplier",
        operation_summary="Delete Supplier",
        tags=['Purchase - Suppliers'],
        responses={
            204: openapi.Response(description="Supplier deleted successfully"),
            404: openapi.Response(description="Supplier not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    def get_queryset(self):
        queryset = Supplier.objects.all()
        search = self.request.query_params.get('search', None)
        ordering = self.request.query_params.get('ordering', 'id')
        
        if search is not None:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(contact_person__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(email__icontains=search) |
                Q(address__icontains=search) |
                Q(drug_license_number__icontains=search) |
                Q(gst_number__icontains=search)
            )
        
        # Handle ordering
        valid_orderings = [
            'id', '-id', 'name', '-name', 'contact_person', '-contact_person',
            'phone_number', '-phone_number', 'email', '-email', 'address', '-address',
            'drug_license_number', '-drug_license_number', 'gst_number', '-gst_number',
            'created_at', '-created_at', 'updated_at', '-updated_at'
        ]
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
            
        return queryset

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows purchase orders to be viewed or edited.
    
    Provides CRUD operations for managing purchase orders with their items.
    Supports search by invoice number, supplier name, status, and total amount.
    """
    queryset = PurchaseOrder.objects.select_related('supplier').all()
    serializer_class = PurchaseOrderSerializer
    pagination_class = StandardResultsSetPagination
    
    @swagger_auto_schema(
        operation_description="Retrieve a list of purchase orders with optional search and ordering",
        operation_summary="List Purchase Orders",
        tags=['Purchase - Orders'],
        manual_parameters=[
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Search by invoice number, supplier name, status, or total amount",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'ordering',
                openapi.IN_QUERY,
                description="Order results by field. Use '-' prefix for descending order",
                type=openapi.TYPE_STRING,
                enum=[
                    'id', '-id', 'supplier__name', '-supplier__name', 'invoice_number', '-invoice_number',
                    'order_date', '-order_date', 'status', '-status', 'total_amount', '-total_amount',
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
                description="Purchase orders retrieved successfully",
                examples={
                    "application/json": {
                        "count": 15,
                        "next": None,
                        "previous": None,
                        "results": [
                            {
                                "id": 1,
                                "supplier": 1,
                                "supplier_name": "MediSupply Co.",
                                "invoice_number": "INV-2025-001",
                                "order_date": "2025-01-08",
                                "status": "completed",
                                "total_amount": 15000.00,
                                "items": [
                                    {
                                        "id": 1,
                                        "product": 1,
                                        "product_name": "Aspirin 100mg",
                                        "quantity": 100,
                                        "unit_price": 150.00,
                                        "total_price": 15000.00
                                    }
                                ],
                                "created_at": "2025-01-08T10:30:00Z",
                                "updated_at": "2025-01-08T10:30:00Z"
                            }
                        ]
                    }
                }
            ),
            400: openapi.Response(description="Invalid query parameters"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Create a new purchase order with items",
        operation_summary="Create Purchase Order",
        tags=['Purchase - Orders'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['supplier', 'invoice_number', 'order_date', 'items'],
            properties={
                'supplier': openapi.Schema(type=openapi.TYPE_INTEGER, description="Supplier ID"),
                'invoice_number': openapi.Schema(type=openapi.TYPE_STRING, description="Unique invoice number"),
                'order_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description="Order date (YYYY-MM-DD)"),
                'status': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    enum=['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'],
                    default='pending',
                    description="Order status"
                ),
                'items': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    description="List of order items",
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        required=['product', 'quantity', 'unit_price'],
                        properties={
                            'product': openapi.Schema(type=openapi.TYPE_INTEGER, description="Product ID"),
                            'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, description="Quantity to order"),
                            'unit_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Price per unit")
                        }
                    )
                )
            }
        ),
        responses={
            201: openapi.Response(description="Purchase order created successfully"),
            400: openapi.Response(description="Invalid data provided"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def create(self, request, *args, **kwargs):
        """
        Create a purchase order with its items
        """
        try:
            print(f"Received request data: {request.data}")
            
            with transaction.atomic():
                # Use the serializer's built-in create method which handles items
                serializer = self.get_serializer(data=request.data)
                
                if not serializer.is_valid():
                    print(f"Serializer validation errors: {serializer.errors}")
                    return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
                
                purchase_order = serializer.save()
                print(f"Purchase order created successfully: {purchase_order.id}")
                
                # Return the created purchase order with items
                response_serializer = self.get_serializer(purchase_order)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            print(f"Exception in create method: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Retrieve a specific purchase order by ID",
        operation_summary="Get Purchase Order",
        tags=['Purchase - Orders'],
        responses={
            200: openapi.Response(description="Purchase order retrieved successfully"),
            404: openapi.Response(description="Purchase order not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Update a purchase order completely",
        operation_summary="Update Purchase Order",
        tags=['Purchase - Orders'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['supplier', 'invoice_number', 'order_date', 'items'],
            properties={
                'supplier': openapi.Schema(type=openapi.TYPE_INTEGER, description="Supplier ID"),
                'invoice_number': openapi.Schema(type=openapi.TYPE_STRING, description="Unique invoice number"),
                'order_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description="Order date (YYYY-MM-DD)"),
                'status': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    enum=['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'],
                    description="Order status"
                ),
                'items': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    description="List of order items",
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        required=['product', 'quantity', 'unit_price'],
                        properties={
                            'product': openapi.Schema(type=openapi.TYPE_INTEGER, description="Product ID"),
                            'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, description="Quantity to order"),
                            'unit_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Price per unit")
                        }
                    )
                )
            }
        ),
        responses={
            200: openapi.Response(description="Purchase order updated successfully"),
            400: openapi.Response(description="Invalid data provided"),
            404: openapi.Response(description="Purchase order not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Partially update a purchase order",
        operation_summary="Partial Update Purchase Order",
        tags=['Purchase - Orders'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'supplier': openapi.Schema(type=openapi.TYPE_INTEGER, description="Supplier ID"),
                'invoice_number': openapi.Schema(type=openapi.TYPE_STRING, description="Unique invoice number"),
                'order_date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description="Order date (YYYY-MM-DD)"),
                'status': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    enum=['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'],
                    description="Order status"
                ),
                'items': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    description="List of order items",
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'product': openapi.Schema(type=openapi.TYPE_INTEGER, description="Product ID"),
                            'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, description="Quantity to order"),
                            'unit_price': openapi.Schema(type=openapi.TYPE_NUMBER, format='decimal', description="Price per unit")
                        }
                    )
                )
            }
        ),
        responses={
            200: openapi.Response(description="Purchase order updated successfully"),
            400: openapi.Response(description="Invalid data provided"),
            404: openapi.Response(description="Purchase order not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Delete a purchase order",
        operation_summary="Delete Purchase Order",
        tags=['Purchase - Orders'],
        responses={
            204: openapi.Response(description="Purchase order deleted successfully"),
            404: openapi.Response(description="Purchase order not found"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a purchase order with its items
        """
        try:
            print(f"Received request data: {request.data}")
            
            with transaction.atomic():
                # Use the serializer's built-in create method which handles items
                serializer = self.get_serializer(data=request.data)
                
                if not serializer.is_valid():
                    print(f"Serializer validation errors: {serializer.errors}")
                    return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
                
                purchase_order = serializer.save()
                print(f"Purchase order created successfully: {purchase_order.id}")
                
                # Return the created purchase order with items
                response_serializer = self.get_serializer(purchase_order)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            print(f"Exception in create method: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def get_queryset(self):
        queryset = PurchaseOrder.objects.select_related('supplier').all()
        search = self.request.query_params.get('search', None)
        ordering = self.request.query_params.get('ordering', 'id')
        
        if search is not None:
            queryset = queryset.filter(
                Q(invoice_number__icontains=search) |
                Q(supplier__name__icontains=search) |
                Q(status__icontains=search) |
                Q(total_amount__icontains=search)
            )
        
        # Handle ordering
        valid_orderings = [
            'id', '-id', 'supplier__name', '-supplier__name', 'invoice_number', '-invoice_number',
            'order_date', '-order_date', 'status', '-status', 'total_amount', '-total_amount',
            'created_at', '-created_at', 'updated_at', '-updated_at'
        ]
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
            
        return queryset

class PurchaseOrderItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows purchase order items to be viewed or edited.
    """
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerializer
