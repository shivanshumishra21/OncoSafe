from rest_framework import serializers
from .models import Prescription
from apps.drugs.serializers import DrugSerializer


class PrescriptionSerializer(serializers.ModelSerializer):
    drugs_detail = DrugSerializer(source='drugs', many=True, read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    
    class Meta:
        model = Prescription
        fields = ['id', 'patient', 'patient_name', 'drugs', 'drugs_detail', 'created_at']
