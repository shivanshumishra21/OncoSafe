from django.contrib import admin
from .models import Drug


@admin.register(Drug)
class DrugAdmin(admin.ModelAdmin):
    list_display = ['name', 'rxcui', 'category']
    search_fields = ['name', 'rxcui', 'category']
    list_filter = ['category']
