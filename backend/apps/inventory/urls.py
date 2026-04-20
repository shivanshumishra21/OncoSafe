from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryViewSet, inventory_alerts

router = DefaultRouter()
router.register(r'inventory', InventoryViewSet, basename='inventory')

urlpatterns = [
    path('inventory/alerts/', inventory_alerts, name='inventory_alerts'),
    path('', include(router.urls)),
]
