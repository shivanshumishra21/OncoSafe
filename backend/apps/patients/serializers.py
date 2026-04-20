from rest_framework import serializers
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True, required=False)
    
    class Meta:
        model = Patient
        fields = ['id', 'name', 'age', 'weight', 'height', 'kidney_status', 'liver_status', 'user', 'username']
        extra_kwargs = {'user': {'required': False}}
