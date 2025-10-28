from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'customers', views.CustomerViewSet)
router.register(r'orders', views.SaleOrderViewSet)
router.register(r'order-items', views.SaleOrderItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]