from django.contrib import admin
from .models import Inventory


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ['drug', 'quantity', 'expiry_date', 'storage_type']
    list_filter = ['storage_type', 'expiry_date']
    search_fields = ['drug__name']
