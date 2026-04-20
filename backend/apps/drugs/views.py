from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from oncosafe.permissions import IsAdmin
from .models import Drug
from .serializers import DrugSerializer
from .services.drug_api import search_drugs, get_warnings


class DrugViewSet(viewsets.ModelViewSet):
    """
    Drug viewset that searches live data from RxNorm API
    """
    queryset = Drug.objects.all()
    serializer_class = DrugSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticatedOrReadOnly()]
    
    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('search', '')
        
        if search_query:
            # Search using RxNorm API
            drugs_data = search_drugs(search_query)
            
            # Format response to match expected structure
            formatted_drugs = []
            for drug in drugs_data:
                formatted_drugs.append({
                    'id': drug['rxcui'],  # Use rxcui as ID for frontend
                    'name': drug['name'],
                    'rxcui': drug['rxcui'],
                    'category': drug['category'],
                    'dose_per_m2': _get_standard_dose(drug['name'])  # Provide standard doses
                })
            
            return Response(formatted_drugs)
        
        # If no search query, return drugs from database
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


def _get_standard_dose(drug_name):
    """
    Return standard chemotherapy doses per m²
    This is a lookup table for common chemo drugs
    """
    standard_doses = {
        'cisplatin': 75,
        'carboplatin': 300,
        'oxaliplatin': 85,
        'methotrexate': 40,
        'fluorouracil': 500,
        '5-fu': 500,
        'doxorubicin': 60,
        'epirubicin': 100,
        'cyclophosphamide': 500,
        'paclitaxel': 175,
        'docetaxel': 75,
        'vincristine': 1.4,
        'etoposide': 100,
        'gemcitabine': 1000,
        'irinotecan': 180
    }
    
    drug_lower = drug_name.lower()
    for key, dose in standard_doses.items():
        if key in drug_lower:
            return dose
    
    return None  # Supportive drugs don't have dose_per_m2


@api_view(['GET'])
def get_drug_warnings(request, drug_name):
    """
    Get warnings and toxicity information for a specific drug from OpenFDA
    """
    warnings = get_warnings(drug_name)
    
    if not warnings:
        return Response(
            {'message': 'No warnings found for this drug'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    return Response(warnings)
