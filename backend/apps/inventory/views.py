from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime, timedelta
from oncosafe.permissions import IsAdmin
from .models import Inventory
from .serializers import InventorySerializer


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()


@api_view(['GET'])
def inventory_alerts(request):
    """
    Get inventory alerts for expiring items and low stock
    """
    today = datetime.now().date()
    expiry_threshold = today + timedelta(days=30)
    
    expiring_soon = Inventory.objects.filter(expiry_date__lte=expiry_threshold, expiry_date__gte=today)
    low_stock = Inventory.objects.filter(quantity__lt=10)
    
    expiring_serializer = InventorySerializer(expiring_soon, many=True)
    low_stock_serializer = InventorySerializer(low_stock, many=True)
    
    return Response({
        'expiring_soon': expiring_serializer.data,
        'low_stock': low_stock_serializer.data
    })
