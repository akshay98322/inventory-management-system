from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import Q
from .models import Customer, SaleOrder, SaleOrderItem
from .serializers import CustomerSerializer, SaleOrderSerializer, SaleOrderItemSerializer

# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000  # Increased limit for search operations

class CustomerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows customers to be viewed or edited.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Customer.objects.all()
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

class SaleOrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows sale orders to be viewed or edited.
    """
    queryset = SaleOrder.objects.select_related('customer').all()
    serializer_class = SaleOrderSerializer
    pagination_class = StandardResultsSetPagination
    
    def create(self, request, *args, **kwargs):
        """
        Create a sale order with its items, with stock validation
        """
        try:
            print(f"Received sale order request data: {request.data}")
            
            with transaction.atomic():
                # Use the serializer's built-in create method which handles items and validation
                serializer = self.get_serializer(data=request.data)
                
                if not serializer.is_valid():
                    print(f"Serializer validation errors: {serializer.errors}")
                    return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
                
                sale_order = serializer.save()
                print(f"Sale order created successfully: {sale_order.id}")
                
                # Return the created sale order with items
                response_serializer = self.get_serializer(sale_order)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            print(f"Exception in create method: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def get_queryset(self):
        queryset = SaleOrder.objects.select_related('customer').all()
        search = self.request.query_params.get('search', None)
        ordering = self.request.query_params.get('ordering', 'id')
        
        if search is not None:
            queryset = queryset.filter(
                Q(invoice_number__icontains=search) |
                Q(customer__name__icontains=search) |
                Q(status__icontains=search) |
                Q(total_amount__icontains=search)
            )
        
        # Handle ordering
        valid_orderings = [
            'id', '-id', 'customer__name', '-customer__name', 'invoice_number', '-invoice_number',
            'order_date', '-order_date', 'status', '-status', 'total_amount', '-total_amount',
            'created_at', '-created_at', 'updated_at', '-updated_at'
        ]
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
            
        return queryset

class SaleOrderItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows sale order items to be viewed or edited.
    """
    queryset = SaleOrderItem.objects.all()
    serializer_class = SaleOrderItemSerializer
