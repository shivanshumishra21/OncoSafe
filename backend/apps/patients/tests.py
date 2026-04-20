from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from apps.patients.models import Patient
from apps.drugs.models import Drug
from apps.inventory.models import Inventory
from apps.prescriptions.models import Prescription


class PatientCreationTestCase(TestCase):
    """
    Test cases for patient creation endpoint
    Requirements: 3.1, 3.2, 3.3, 3.4, 7.2, 7.3, 7.4, 7.5
    """
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create admin user
        self.admin_user = User.objects.create_user(
            username='admin',
            password='admin123',
            role='admin'
        )
        
        # Create patient user
        self.patient_user = User.objects.create_user(
            username='patient1',
            password='patient123',
            role='patient'
        )
    
    def test_admin_can_create_patient_with_user_account(self):
        """
        Test that admin can create patient with linked user account
        Requirements: 3.1, 3.2, 3.3, 7.2, 7.3, 7.4, 7.5
        """
        self.client.force_authenticate(user=self.admin_user)
        
        patient_data = {
            'name': 'Jane Smith',
            'age': 52,
            'weight': 65.0,
            'height': 165.0,
            'kidney_status': 'Normal',
            'liver_status': 'Low',
            'username': 'janesmith',
            'password': 'securepass123'
        }
        
        response = self.client.post('/api/patients/', patient_data, format='json')
        
        # Verify response status
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify response contains patient data
        self.assertIn('patient', response.data)
        self.assertEqual(response.data['patient']['name'], 'Jane Smith')
        self.assertEqual(response.data['patient']['age'], 52)
        self.assertEqual(response.data['patient']['weight'], 65.0)
        self.assertEqual(response.data['patient']['height'], 165.0)
        self.assertEqual(response.data['patient']['kidney_status'], 'Normal')
        self.assertEqual(response.data['patient']['liver_status'], 'Low')
        
        # Verify response contains credentials (Requirement 7.5)
        self.assertIn('credentials', response.data)
        self.assertEqual(response.data['credentials']['username'], 'janesmith')
        self.assertEqual(response.data['credentials']['password'], 'securepass123')
        
        # Verify User was created with role='patient' (Requirements 3.1, 7.3)
        user = User.objects.get(username='janesmith')
        self.assertEqual(user.role, 'patient')
        
        # Verify Patient_Profile was created and linked to User (Requirements 3.2, 3.3, 7.4)
        patient = Patient.objects.get(name='Jane Smith')
        self.assertEqual(patient.user, user)
        self.assertEqual(patient.user.id, user.id)
    
    def test_patient_creation_requires_username_and_password(self):
        """Test that username and password are required fields"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Missing username
        patient_data = {
            'name': 'Jane Smith',
            'age': 52,
            'weight': 65.0,
            'height': 165.0,
            'kidney_status': 'Normal',
            'liver_status': 'Low',
            'password': 'securepass123'
        }
        
        response = self.client.post('/api/patients/', patient_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        
        # Missing password
        patient_data = {
            'name': 'Jane Smith',
            'age': 52,
            'weight': 65.0,
            'height': 165.0,
            'kidney_status': 'Normal',
            'liver_status': 'Low',
            'username': 'janesmith'
        }
        
        response = self.client.post('/api/patients/', patient_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_patient_creation_rejects_duplicate_username(self):
        """Test that duplicate usernames are rejected"""
        self.client.force_authenticate(user=self.admin_user)
        
        patient_data = {
            'name': 'Jane Smith',
            'age': 52,
            'weight': 65.0,
            'height': 165.0,
            'kidney_status': 'Normal',
            'liver_status': 'Low',
            'username': 'patient1',  # Already exists
            'password': 'securepass123'
        }
        
        response = self.client.post('/api/patients/', patient_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('already exists', response.data['error'].lower())
    
    def test_patient_creation_transaction_rollback(self):
        """
        Test that transaction rollback works on failure
        Requirement: 3.4
        """
        self.client.force_authenticate(user=self.admin_user)
        
        # Count users and patients before
        user_count_before = User.objects.count()
        patient_count_before = Patient.objects.count()
        
        # Try to create patient with invalid data (missing required field)
        patient_data = {
            'name': 'Jane Smith',
            # Missing age - should cause validation error
            'weight': 65.0,
            'height': 165.0,
            'kidney_status': 'Normal',
            'liver_status': 'Low',
            'username': 'janesmith',
            'password': 'securepass123'
        }
        
        response = self.client.post('/api/patients/', patient_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify no User or Patient was created (rollback worked)
        user_count_after = User.objects.count()
        patient_count_after = Patient.objects.count()
        
        self.assertEqual(user_count_before, user_count_after)
        self.assertEqual(patient_count_before, patient_count_after)
    
    def test_patient_user_cannot_create_patient(self):
        """Test that patient users cannot create other patients"""
        self.client.force_authenticate(user=self.patient_user)
        
        patient_data = {
            'name': 'Jane Smith',
            'age': 52,
            'weight': 65.0,
            'height': 165.0,
            'kidney_status': 'Normal',
            'liver_status': 'Low',
            'username': 'janesmith',
            'password': 'securepass123'
        }
        
        response = self.client.post('/api/patients/', patient_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_cannot_create_patient(self):
        """Test that unauthenticated users cannot create patients"""
        patient_data = {
            'name': 'Jane Smith',
            'age': 52,
            'weight': 65.0,
            'height': 165.0,
            'kidney_status': 'Normal',
            'liver_status': 'Low',
            'username': 'janesmith',
            'password': 'securepass123'
        }
        
        response = self.client.post('/api/patients/', patient_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AdminDashboardTestCase(TestCase):
    """
    Test cases for admin dashboard endpoint
    Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
    """
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create admin user
        self.admin_user = User.objects.create_user(
            username='admin',
            password='admin123',
            role='admin'
        )
        
        # Create patient user
        self.patient_user = User.objects.create_user(
            username='patient1',
            password='patient123',
            role='patient'
        )
        
        # Create patient profile
        self.patient = Patient.objects.create(
            user=self.patient_user,
            name='John Doe',
            age=45,
            weight=75.0,
            height=175.0,
            kidney_status='Normal',
            liver_status='Normal'
        )
        
        # Create drugs
        self.drug1 = Drug.objects.create(
            name='Cisplatin',
            rxcui='2555',
            category='Chemo'
        )
        self.drug2 = Drug.objects.create(
            name='Doxorubicin',
            rxcui='3639',
            category='Chemo'
        )
        
        # Create inventory items
        today = date.today()
        
        # Low stock item expiring soon
        self.inventory1 = Inventory.objects.create(
            drug=self.drug1,
            quantity=5,
            expiry_date=today + timedelta(days=15),
            storage_type='Cold'
        )
        
        # Low stock item expiring soon
        self.inventory2 = Inventory.objects.create(
            drug=self.drug2,
            quantity=8,
            expiry_date=today + timedelta(days=10),
            storage_type='Normal'
        )
        
        # Good stock item not expiring soon
        self.inventory3 = Inventory.objects.create(
            drug=self.drug1,
            quantity=50,
            expiry_date=today + timedelta(days=365),
            storage_type='Cold'
        )
        
        # Create prescription
        self.prescription = Prescription.objects.create(
            patient=self.patient
        )
        self.prescription.drugs.add(self.drug1, self.drug2)
    
    def test_admin_can_access_dashboard(self):
        """Test that admin user can access dashboard endpoint"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/admin/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_patients', response.data)
        self.assertIn('total_drugs', response.data)
        self.assertIn('expiry_alerts_count', response.data)
        self.assertIn('low_stock_count', response.data)
        self.assertIn('recent_patients', response.data)
        self.assertIn('expiring_inventory', response.data)
        self.assertIn('recent_prescriptions', response.data)
    
    def test_patient_cannot_access_dashboard(self):
        """Test that patient user cannot access admin dashboard"""
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get('/api/admin/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_cannot_access_dashboard(self):
        """Test that unauthenticated user cannot access dashboard"""
        response = self.client.get('/api/admin/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_dashboard_statistics_calculation(self):
        """Test that dashboard statistics are calculated correctly"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/admin/dashboard/')
        
        # Verify counts
        self.assertEqual(response.data['total_patients'], 1)
        self.assertEqual(response.data['total_drugs'], 2)
        self.assertEqual(response.data['expiry_alerts_count'], 2)  # 2 items expiring within 30 days
        self.assertEqual(response.data['low_stock_count'], 2)  # 2 items with quantity < 10
    
    def test_dashboard_recent_data(self):
        """Test that dashboard returns recent data correctly"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/admin/dashboard/')
        
        # Verify recent patients
        self.assertEqual(len(response.data['recent_patients']), 1)
        self.assertEqual(response.data['recent_patients'][0]['name'], 'John Doe')
        
        # Verify expiring inventory (ordered by expiry date)
        self.assertEqual(len(response.data['expiring_inventory']), 3)
        self.assertEqual(response.data['expiring_inventory'][0]['drug_name'], 'Doxorubicin')
        
        # Verify recent prescriptions
        self.assertEqual(len(response.data['recent_prescriptions']), 1)
        self.assertEqual(response.data['recent_prescriptions'][0]['patient_name'], 'John Doe')
