from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, my_profile, my_prescriptions, admin_dashboard

router = DefaultRouter()
router.register(r'patients', PatientViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('my/profile/', my_profile, name='my_profile'),
    path('my/prescriptions/', my_prescriptions, name='my_prescriptions'),
    path('admin/dashboard/', admin_dashboard, name='admin_dashboard'),
]
