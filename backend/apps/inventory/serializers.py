from rest_framework import serializers
from .models import Inventory


class InventorySerializer(serializers.ModelSerializer):
    drug_name = serializers.CharField(source='drug.name', read_only=True)
    
    class Meta:
        model = Inventory
        fields = ['id', 'drug', 'drug_name', 'quantity', 'expiry_date', 'storage_type']
