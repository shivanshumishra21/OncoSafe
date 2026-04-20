from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PrescriptionViewSet, check_prescription, calculate_dose

router = DefaultRouter()
router.register(r'prescriptions', PrescriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('prescription/check/', check_prescription, name='check_prescription'),
    path('calculate-dose/', calculate_dose, name='calculate_dose'),
]
