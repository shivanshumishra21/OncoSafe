from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from oncosafe.permissions import IsAdmin, IsPatientOwner
from .models import Patient
from .serializers import PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Create a new patient with linked user account
        """
        # Extract user credentials
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user account
        user = User.objects.create_user(
            username=username,
            password=password,
            role='patient'
        )
        
        # Create patient profile
        patient_data = {
            'name': request.data.get('name'),
            'age': request.data.get('age'),
            'weight': request.data.get('weight'),
            'height': request.data.get('height'),
            'kidney_status': request.data.get('kidney_status'),
            'liver_status': request.data.get('liver_status'),
            'user': user.id
        }
        
        serializer = self.get_serializer(data=patient_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'patient': serializer.data,
            'credentials': {
                'username': username,
                'password': password  # In production, don't return password
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsPatientOwner])
def my_profile(request):
    """
    Get the authenticated patient's profile
    """
    try:
        patient = request.user.patient_profile
        serializer = PatientSerializer(patient)
        return Response(serializer.data)
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsPatientOwner])
def my_prescriptions(request):
    """
    Get the authenticated patient's prescriptions
    """
    try:
        patient = request.user.patient_profile
        from apps.prescriptions.models import Prescription
        from apps.prescriptions.serializers import PrescriptionSerializer
        
        prescriptions = Prescription.objects.filter(patient=patient)
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data)
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard(request):
    """
    Admin dashboard endpoint with statistics and recent data
    Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
    """
    from apps.drugs.models import Drug
    from apps.inventory.models import Inventory
    from apps.prescriptions.models import Prescription
    from apps.drugs.serializers import DrugSerializer
    from apps.inventory.serializers import InventorySerializer
    from apps.prescriptions.serializers import PrescriptionSerializer
    
    # Calculate statistics
    total_patients = Patient.objects.count()
    total_drugs = Drug.objects.count()
    
    # Calculate expiry alerts (items expiring within 30 days)
    thirty_days_from_now = timezone.now().date() + timedelta(days=30)
    expiry_alerts_count = Inventory.objects.filter(
        expiry_date__lte=thirty_days_from_now,
        expiry_date__gte=timezone.now().date()
    ).count()
    
    # Calculate low stock count (quantity < 10)
    low_stock_count = Inventory.objects.filter(quantity__lt=10).count()
    
    # Get recent patients (5 most recent)
    recent_patients = Patient.objects.order_by('-id')[:5]
    
    # Get expiring inventory (5 nearest expiry)
    expiring_inventory = Inventory.objects.filter(
        expiry_date__gte=timezone.now().date()
    ).order_by('expiry_date')[:5]
    
    # Get recent prescriptions (5 most recent)
    recent_prescriptions = Prescription.objects.order_by('-created_at')[:5]
    
    # Serialize data
    recent_patients_data = PatientSerializer(recent_patients, many=True).data
    expiring_inventory_data = InventorySerializer(expiring_inventory, many=True).data
    recent_prescriptions_data = PrescriptionSerializer(recent_prescriptions, many=True).data
    
    return Response({
        'total_patients': total_patients,
        'total_drugs': total_drugs,
        'expiry_alerts_count': expiry_alerts_count,
        'low_stock_count': low_stock_count,
        'recent_patients': recent_patients_data,
        'expiring_inventory': expiring_inventory_data,
        'recent_prescriptions': recent_prescriptions_data
    })
