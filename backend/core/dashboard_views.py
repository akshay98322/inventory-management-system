from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from inventory.models import Company, Product, Stock
from purchase.models import Supplier
from sale.models import Customer
from inventory.serializers import StockSerializer

@swagger_auto_schema(
    method='get',
    operation_description="Get comprehensive dashboard metrics including entity counts and empty stock items",
    operation_summary="Dashboard Metrics",
    tags=['Dashboard'],
    responses={
        200: openapi.Response(
            description="Dashboard metrics retrieved successfully",
            examples={
                "application/json": {
                    "metrics": {
                        "manufacturers_count": 25,
                        "products_count": 150,
                        "suppliers_count": 10,
                        "customers_count": 50,
                        "stock_items_count": 300
                    },
                    "empty_stock_items": [
                        {
                            "id": 1,
                            "product_name": "Paracetamol 500mg",
                            "company_name": "PharmaCorp",
                            "batch_number": "PC001",
                            "expiry_date": "2025-12-31",
                            "purchase_price": 10.50,
                            "sale_price": 15.00,
                            "mrp": 20.00,
                            "tax": 5.00,
                            "hsn_code": "30041000"
                        }
                    ],
                    "empty_stock_count": 5
                }
            }
        ),
        401: openapi.Response(description="Authentication required"),
        500: openapi.Response(description="Internal server error")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metrics(request):
    """
    Get dashboard metrics including counts and empty stock items
    """
    try:
        # Get counts for all entities
        manufacturers_count = Company.objects.count()
        products_count = Product.objects.count()
        suppliers_count = Supplier.objects.count()
        customers_count = Customer.objects.count()
        stock_items_count = Stock.objects.filter(quantity__gt=0).count()
        
        # Get empty stock items (quantity = 0)
        empty_stock_items = Stock.objects.filter(
            quantity=0
        ).select_related(
            'product', 
            'product__company'
        ).order_by('product__name', 'batch_number')
        
        # Serialize empty stock items
        empty_stock_data = []
        for stock in empty_stock_items:
            empty_stock_data.append({
                'id': stock.id,
                'product_name': stock.product.name,
                'company_name': stock.product.company.name if stock.product.company else 'Unknown',
                'batch_number': stock.batch_number,
                'expiry_date': stock.expiry_date,
                'purchase_price': float(stock.purchase_price),
                'sale_price': float(stock.sale_price),
                'mrp': float(stock.mrp),
                'tax': float(stock.tax),
                'hsn_code': stock.hsn_code,
            })
        
        response_data = {
            'metrics': {
                'manufacturers_count': manufacturers_count,
                'products_count': products_count,
                'suppliers_count': suppliers_count,
                'customers_count': customers_count,
                'stock_items_count': stock_items_count,
            },
            'empty_stock_items': empty_stock_data,
            'empty_stock_count': len(empty_stock_data)
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch dashboard metrics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@swagger_auto_schema(
    method='get',
    operation_description="Get items with low stock based on configurable threshold",
    operation_summary="Low Stock Items",
    tags=['Dashboard'],
    manual_parameters=[
        openapi.Parameter(
            'threshold',
            openapi.IN_QUERY,
            description="Stock quantity threshold (default: 10)",
            type=openapi.TYPE_INTEGER,
            default=10
        )
    ],
    responses={
        200: openapi.Response(
            description="Low stock items retrieved successfully",
            examples={
                "application/json": {
                    "low_stock_items": [
                        {
                            "id": 1,
                            "product_name": "Aspirin 100mg",
                            "company_name": "MediCorp",
                            "batch_number": "MC002",
                            "expiry_date": "2025-08-15",
                            "quantity": 5,
                            "purchase_price": 8.00,
                            "sale_price": 12.00,
                            "mrp": 15.00,
                            "tax": 5.00,
                            "hsn_code": "30041000"
                        }
                    ],
                    "low_stock_count": 12,
                    "threshold": 10
                }
            }
        ),
        400: openapi.Response(description="Invalid threshold value"),
        401: openapi.Response(description="Authentication required"),
        500: openapi.Response(description="Internal server error")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_items(request):
    """
    Get items with low stock (quantity <= threshold)
    Default threshold is 10, can be customized via query parameter
    """
    try:
        # Get threshold from query parameter, default to 10
        threshold = int(request.GET.get('threshold', 10))
        
        low_stock_items = Stock.objects.filter(
            quantity__lte=threshold,
            quantity__gt=0  # Exclude empty stock (handled separately)
        ).select_related(
            'product', 
            'product__company'
        ).order_by('quantity', 'product__name')
        
        # Serialize low stock items
        low_stock_data = []
        for stock in low_stock_items:
            low_stock_data.append({
                'id': stock.id,
                'product_name': stock.product.name,
                'company_name': stock.product.company.name if stock.product.company else 'Unknown',
                'batch_number': stock.batch_number,
                'expiry_date': stock.expiry_date,
                'quantity': stock.quantity,
                'purchase_price': float(stock.purchase_price),
                'sale_price': float(stock.sale_price),
                'mrp': float(stock.mrp),
                'tax': float(stock.tax),
                'hsn_code': stock.hsn_code,
            })
        
        response_data = {
            'low_stock_items': low_stock_data,
            'low_stock_count': len(low_stock_data),
            'threshold': threshold
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except ValueError:
        return Response(
            {'error': 'Invalid threshold value. Must be a number.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch low stock items: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )