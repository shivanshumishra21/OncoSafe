from django.contrib import admin
from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['name', 'age', 'weight', 'height', 'kidney_status', 'liver_status']
    search_fields = ['name']
    list_filter = ['kidney_status', 'liver_status']
