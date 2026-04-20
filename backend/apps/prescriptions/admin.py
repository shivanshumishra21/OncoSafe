from django.contrib import admin
from .models import Prescription


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'created_at']
    list_filter = ['created_at']
    search_fields = ['patient__name']
