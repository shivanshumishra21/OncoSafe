"""
Unit tests for /api/auth/me/ endpoint
Tests Requirements 2.3 and 2.4 from RBAC specification
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory, force_authenticate
from oncosafe.urls import me_view


class AuthMeEndpointTestCase(TestCase):
    """Test cases for GET /api/auth/me/ endpoint"""
    
    def setUp(self):
        """Set up test users and request factory"""
        self.factory = APIRequestFactory()
        
        # Create patient user
        self.patient_user = User.objects.create_user(
            username='test_patient',
            password='testpass123',
            role='patient'
        )
        
        # Create admin user
        self.admin_user = User.objects.create_user(
            username='test_admin',
            password='adminpass123',
            role='admin',
            is_staff=True
        )
    
    def test_authenticated_patient_returns_user_info(self):
        """
        Test Requirement 2.3: GET /api/auth/me/ returns authenticated user's 
        id, username, and role for patient users
        """
        request = self.factory.get('/api/auth/me/')
        force_authenticate(request, user=self.patient_user)
        
        response = me_view(request)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('id', response.data)
        self.assertIn('username', response.data)
        self.assertIn('role', response.data)
        self.assertEqual(response.data['id'], self.patient_user.id)
        self.assertEqual(response.data['username'], 'test_patient')
        self.assertEqual(response.data['role'], 'patient')
    
    def test_authenticated_admin_returns_user_info(self):
        """
        Test Requirement 2.3: GET /api/auth/me/ returns authenticated user's 
        id, username, and role for admin users
        """
        request = self.factory.get('/api/auth/me/')
        force_authenticate(request, user=self.admin_user)
        
        response = me_view(request)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('id', response.data)
        self.assertIn('username', response.data)
        self.assertIn('role', response.data)
        self.assertEqual(response.data['id'], self.admin_user.id)
        self.assertEqual(response.data['username'], 'test_admin')
        self.assertEqual(response.data['role'], 'admin')
    
    def test_unauthenticated_request_returns_401(self):
        """
        Test Requirement 2.4: GET /api/auth/me/ returns 401 if not authenticated
        """
        request = self.factory.get('/api/auth/me/')
        # Do not authenticate the request
        
        response = me_view(request)
        
        self.assertEqual(response.status_code, 401)
    
    def test_response_includes_email_field(self):
        """
        Test that response includes email field (additional field beyond requirements)
        """
        request = self.factory.get('/api/auth/me/')
        force_authenticate(request, user=self.patient_user)
        
        response = me_view(request)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('email', response.data)
