from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from math import sqrt
from .models import Prescription
from .serializers import PrescriptionSerializer
from apps.patients.models import Patient
from apps.drugs.services.drug_api import get_interactions, get_warnings, search_drugs


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer


@api_view(['POST'])
def check_prescription(request):
    """
    Check drug interactions and patient-specific risks using live APIs
    """
    patient_id = request.data.get('patient_id')
    drug_ids = request.data.get('drug_ids', [])  # These are RxCUIs from frontend
    
    if not patient_id or not drug_ids:
        return Response(
            {'error': 'patient_id and drug_ids are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get drug names from RxCUIs for patient risk checking
    drug_names = []
    for rxcui in drug_ids:
        # Search to get drug name from rxcui
        drugs = search_drugs('')  # This will use cache if available
        # For now, we'll pass rxcuis directly to interaction check
        drug_names.append(str(rxcui))
    
    # Check interactions using RxNorm API (order-independent)
    rxcui_list_str = ','.join(str(rxcui) for rxcui in drug_ids)
    interactions = get_interactions(rxcui_list_str)
    
    # Check patient-specific toxicity alerts
    toxicity_alerts = []
    
    # Get warnings from OpenFDA for each drug
    for rxcui in drug_ids:
        # Try to get drug name - in production, you'd store this mapping
        # For now, we'll use a simplified approach
        warnings = get_warnings(str(rxcui))
        
        if warnings:
            # Check for kidney/liver specific warnings based on patient status
            if patient.kidney_status.lower() in ['low', 'critical']:
                if 'kidney' in str(warnings).lower() or 'renal' in str(warnings).lower():
                    toxicity_alerts.append(
                        f"⚠️ Kidney function alert: Patient has {patient.kidney_status} kidney status. "
                        f"Drug may require dose adjustment or is contraindicated."
                    )
            
            if patient.liver_status.lower() in ['low', 'critical']:
                if 'liver' in str(warnings).lower() or 'hepatic' in str(warnings).lower():
                    toxicity_alerts.append(
                        f"⚠️ Liver function alert: Patient has {patient.liver_status} liver status. "
                        f"Drug may require dose adjustment or is contraindicated."
                    )
            
            # Add boxed warnings
            if 'boxed_warning' in warnings:
                toxicity_alerts.append(f"🚨 BLACK BOX WARNING: {warnings['boxed_warning'][:200]}")
    
    # Apply hardcoded risk rules for common chemo drugs (as fallback)
    risk_rules = [
        {"drug": "cisplatin", "organ": "kidney", "status": "low", 
         "alert": "High kidney toxicity risk: Patient has low kidney function and Cisplatin is prescribed"},
        {"drug": "cisplatin", "organ": "kidney", "status": "critical", 
         "alert": "CONTRAINDICATED: Cisplatin in critical kidney failure"},
        {"drug": "methotrexate", "organ": "kidney", "status": "low", 
         "alert": "Methotrexate clearance reduced – dose adjustment needed"},
        {"drug": "doxorubicin", "organ": "liver", "status": "low", 
         "alert": "Hepatic impairment increases Doxorubicin toxicity"},
    ]
    
    # Check against drug names (simplified - in production use proper drug name mapping)
    for rxcui in drug_ids:
        rxcui_str = str(rxcui).lower()
        for rule in risk_rules:
            if rule["drug"] in rxcui_str:
                if rule["organ"] == "kidney" and patient.kidney_status.lower() == rule["status"]:
                    toxicity_alerts.append(rule["alert"])
                elif rule["organ"] == "liver" and patient.liver_status.lower() == rule["status"]:
                    toxicity_alerts.append(rule["alert"])
    
    return Response({
        'interactions': interactions,
        'toxicity_alerts': list(set(toxicity_alerts)),  # Remove duplicates
        'dose_recommendations': []
    })


@api_view(['POST'])
def calculate_dose(request):
    """
    Calculate BSA-based dose for a patient and drug
    """
    patient_id = request.data.get('patient_id')
    drug_id = request.data.get('drug_id')  # This is rxcui
    
    if not patient_id or not drug_id:
        return Response(
            {'error': 'patient_id and drug_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response(
            {'error': 'Patient not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get drug info from search (will use cache)
    drug_name = str(drug_id)  # Simplified - in production, maintain rxcui to name mapping
    
    # Get standard dose for the drug
    from apps.drugs.views import _get_standard_dose
    dose_per_m2 = _get_standard_dose(drug_name)
    
    if dose_per_m2 is None:
        return Response(
            {'error': f'Drug does not have dose_per_m2 defined (not a chemotherapy drug)'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Calculate BSA using Mosteller formula
    bsa = sqrt((patient.height * patient.weight) / 3600)
    recommended_dose = bsa * dose_per_m2
    
    return Response({
        'bsa': round(bsa, 2),
        'dose_per_m2': dose_per_m2,
        'recommended_dose': round(recommended_dose, 2),
        'unit': 'mg',
        'drug_name': drug_name,
        'patient_name': patient.name
    })
