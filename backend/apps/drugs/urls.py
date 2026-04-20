from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DrugViewSet, get_drug_warnings

router = DefaultRouter()
router.register(r'drugs', DrugViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('drugs/<str:drug_name>/warnings/', get_drug_warnings, name='drug_warnings'),
]
