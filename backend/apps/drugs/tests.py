from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Drug


class DrugPermissionTests(APITestCase):
    """Test that IsAdmin permission is correctly applied to POST /api/drugs/"""
    
    def setUp(self):
        # Create admin user
        self.admin_user = User.objects.create_user(
            username='admin',
            password='testpass123',
            role='admin'
        )
        
        # Create patient user
        self.patient_user = User.objects.create_user(
            username='patient',
            password='testpass123',
            role='patient'
        )
        
        # Sample drug data
        self.drug_data = {
            'name': 'Test Drug',
            'rxcui': '12345',
            'category': 'Chemotherapy',
            'dose_per_m2': 100.0
        }
    
    def test_admin_can_create_drug(self):
        """Test that admin users can create drugs via POST /api/drugs/"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/drugs/', self.drug_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_patient_cannot_create_drug(self):
        """Test that patient users cannot create drugs via POST /api/drugs/"""
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.post('/api/drugs/', self.drug_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_cannot_create_drug(self):
        """Test that unauthenticated users cannot create drugs via POST /api/drugs/"""
        response = self.client.post('/api/drugs/', self.drug_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_anyone_can_list_drugs(self):
        """Test that anyone can list drugs via GET /api/drugs/"""
        # Test unauthenticated access
        response = self.client.get('/api/drugs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test patient access
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get('/api/drugs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test admin access
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/drugs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)