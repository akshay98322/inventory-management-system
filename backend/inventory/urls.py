from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, ProductViewSet, StockViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'products', ProductViewSet)
router.register(r'stock', StockViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
