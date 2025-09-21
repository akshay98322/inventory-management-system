from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockViewSet

router = DefaultRouter()
router.register(r'stocks', StockViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
