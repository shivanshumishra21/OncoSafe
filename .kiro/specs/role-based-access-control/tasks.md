# Implementation Plan: Role-Based Access Control (RBAC)

## Overview

This implementation plan breaks down the RBAC feature into discrete backend and frontend tasks. The backend tasks focus on extending the User model with roles, implementing permission classes, and creating role-specific API endpoints. The frontend tasks focus on role-based routing, role-specific dashboards, and UI components that adapt to user roles.

## Tasks

### Backend Implementation

- [x] 1. Create database migration to add role field to User model
  - Create migration file to add `role` CharField to Django User model
  - Set choices as [('admin', 'Admin'), ('patient', 'Patient')]
  - Set default value to 'patient'
  - _Requirements: 1.1, 1.2_

- [x] 2. Create database migration to link Patient model to User model
  - Add `user` OneToOneField to Patient model pointing to auth.User
  - Set on_delete=CASCADE and related_name='patient_profile'
  - Set null=True to allow existing patients to remain valid during migration
  - _Requirements: 1.3_

- [x] 3. Create data migration to link existing patients to user accounts
  - For each existing Patient without a user, create a User account
  - Generate username as 'patient_{id}' and random password
  - Link Patient to created User via user_id field
  - _Requirements: 1.3, 19.3_

- [x] 4. Create custom JWT serializer to include role in token
  - Create `backend/oncosafe/serializers.py` file
  - Implement CustomTokenObtainPairSerializer extending TokenObtainPairSerializer
  - Override get_token() to add role to token payload
  - Override validate() to include role in response data
  - Update SIMPLE_JWT settings to use custom serializer
  - _Requirements: 1.4, 2.1, 2.2_

- [x] 5. Create permission classes for role-based access control
  - Create `backend/oncosafe/permissions.py` file
  - Implement IsAdmin permission class checking role='admin'
  - Implement IsPatientOwner permission class checking role='patient' and ownership
  - _Requirements: 4.1, 5.1_

- [ ] 6. Create patient-specific API endpoints
  - [x] 6.1 Create GET /api/my/profile/ endpoint
    - Return authenticated patient's Patient_Profile data
    - Apply IsPatientOwner permission
    - _Requirements: 5.6_
  
  - [x] 6.2 Create GET /api/my/prescriptions/ endpoint
    - Return prescriptions filtered by authenticated patient
    - Apply IsPatientOwner permission
    - _Requirements: 5.3_

- [ ] 7. Update existing API endpoints with permission classes
  - [x] 7.1 Apply IsAdmin permission to POST /api/patients/
    - _Requirements: 4.3_
  
  - [x] 7.2 Apply IsAdmin permission to POST /api/drugs/
    - _Requirements: 4.4_
  
  - [x] 7.3 Apply IsAdmin permission to POST /api/inventory/
    - _Requirements: 4.5_
  
  - [x] 7.4 Apply IsAdmin permission to DELETE endpoints for patients, drugs, inventory
    - _Requirements: 4.7_

- [x] 8. Create admin dashboard API endpoint
  - Create GET /api/admin/dashboard/ endpoint
  - Calculate total_patients, total_drugs, expiry_alerts_count, low_stock_count
  - Return recent_patients (5 most recent), expiring_inventory (5 nearest expiry), recent_prescriptions (5 most recent)
  - Apply IsAdmin permission
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 9. Update patient creation endpoint to create User and Patient together
  - Modify POST /api/patients/ to accept username, password fields
  - Create User with role='patient' and provided credentials
  - Create Patient_Profile linked to created User
  - Implement transaction rollback on failure
  - Return both Patient_Profile data and User credentials
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.2, 7.3, 7.4, 7.5_

- [x] 10. Create GET /api/auth/me/ endpoint
  - Return authenticated user's id, username, and role
  - Return 401 if not authenticated
  - _Requirements: 2.3, 2.4_

- [x] 11. Create seed data management command
  - Create `backend/apps/patients/management/commands/seed_rbac_data.py`
  - Create admin user (username='admin', password='admin123', role='admin')
  - Create 3 patient users with linked Patient_Profile records
  - Create sample Prescription and Inventory records
  - Make command idempotent (safe to run multiple times)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [x] 12. Checkpoint - Run migrations and seed data
  - Run `python manage.py makemigrations` and `python manage.py migrate`
  - Run `python manage.py seed_rbac_data`
  - Test admin login returns JWT with role='admin'
  - Test patient login returns JWT with role='patient'
  - Ensure all tests pass, ask the user if questions arise.

### Frontend Implementation

- [x] 13. Update AuthContext to handle role extraction and storage
  - Add `role` state variable to AuthContext
  - Extract role from JWT token payload in login() function
  - Extract role from JWT token payload in useEffect initialization
  - Expose role in AuthContext value
  - _Requirements: 2.5, 8.5_

- [x] 14. Update LoginPage to redirect based on role
  - After successful login, decode JWT to extract role
  - Redirect to /admin/dashboard if role='admin'
  - Redirect to /patient/dashboard if role='patient'
  - _Requirements: 8.1, 8.2_

- [x] 15. Create RoleProtectedRoute component
  - Create `frontend/src/components/RoleProtectedRoute.jsx`
  - Accept `allowedRoles` prop (array of allowed roles)
  - Check if user is authenticated and has allowed role
  - Redirect to /login if not authenticated
  - Redirect to role-specific dashboard if role not allowed
  - _Requirements: 8.3, 8.4, 8.6_

- [x] 16. Create role-based navbar component
  - Create `frontend/src/components/RoleBasedNavbar.jsx`
  - Display admin navigation links if role='admin': Dashboard, Patients, Drugs, Inventory, Prescription, Dose, Logout
  - Display patient navigation links if role='patient': My Dashboard, My Prescriptions, My Profile, Logout
  - Highlight active route
  - Display OncoSafe logo on left side
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 17. Create admin dashboard page
  - Create `frontend/src/pages/admin/AdminDashboardPage.jsx`
  - Fetch data from GET /api/admin/dashboard/
  - Display stat cards: total_patients, total_drugs, expiry_alerts, low_stock
  - Display tables: recent_patients, expiring_inventory, recent_prescriptions
  - _Requirements: 9.1_

- [x] 18. Create admin patients management page
  - Create `frontend/src/pages/admin/AdminPatientsPage.jsx`
  - Display searchable patient list
  - Add "Add Patient" button that opens modal
  - _Requirements: 9.2_

- [x] 19. Create AddPatientModal component
  - Create `frontend/src/components/AddPatientModal.jsx`
  - Include form fields: name, age, weight, height, kidney_status, liver_status, username, password
  - Provide dropdown selections for kidney_status and liver_status
  - Call POST /api/patients/ on submit
  - Display success message with generated credentials
  - Display error message on failure
  - Refresh patient list on success
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 20. Create admin drugs management page
  - Create `frontend/src/pages/admin/AdminDrugsPage.jsx`
  - Display searchable drug list
  - Add "Add Drug" button
  - _Requirements: 9.3_

- [x] 21. Create admin inventory management page
  - Create `frontend/src/pages/admin/AdminInventoryPage.jsx`
  - Display inventory items with expiry alerts
  - Add "Add Inventory" button
  - _Requirements: 9.4_

- [x] 22. Create admin prescription checker page
  - Create `frontend/src/pages/admin/AdminPrescriptionPage.jsx`
  - Reuse existing prescription checker functionality
  - Allow checking prescriptions for any patient
  - _Requirements: 9.5_

- [x] 23. Create admin dose calculator page
  - Create `frontend/src/pages/admin/AdminDosePage.jsx`
  - Reuse existing dose calculator functionality
  - Allow calculating doses for any patient
  - _Requirements: 9.6_

- [x] 24. Create patient dashboard page
  - Create `frontend/src/pages/patient/PatientDashboardPage.jsx`
  - Display welcome banner with patient name
  - Display stat cards: kidney_status, liver_status, active_prescriptions_count, last_dose_date
  - Display recent prescriptions (5 most recent)
  - _Requirements: 10.1, 12.1, 12.2, 12.5_

- [x] 25. Create patient prescriptions page
  - Create `frontend/src/pages/patient/PatientPrescriptionsPage.jsx`
  - Fetch data from GET /api/my/prescriptions/
  - Display prescription history in table format
  - _Requirements: 10.2_

- [x] 26. Create patient profile page
  - Create `frontend/src/pages/patient/PatientProfilePage.jsx`
  - Fetch data from GET /api/my/profile/
  - Display all Patient_Profile fields in read-only format
  - Display units for weight (kg) and height (cm)
  - Display color-coded badges for kidney_status and liver_status
  - Display username and account creation date
  - _Requirements: 10.4, 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 27. Update App.jsx with role-based routes
  - Import RoleProtectedRoute and RoleBasedNavbar
  - Add admin routes: /admin/dashboard, /admin/patients, /admin/drugs, /admin/inventory, /admin/prescription, /admin/dose
  - Add patient routes: /patient/dashboard, /patient/prescriptions, /patient/profile
  - Wrap each route with RoleProtectedRoute and appropriate allowedRoles
  - Add RoleBasedNavbar to layout
  - _Requirements: 9.7, 10.5_

- [x] 28. Final checkpoint - End-to-end testing
  - Test admin login flow: login → /admin/dashboard → navigate to all admin pages
  - Test patient login flow: login → /patient/dashboard → navigate to all patient pages
  - Test cross-role access prevention: patient cannot access /admin/*, admin redirected from /patient/*
  - Test logout clears token and redirects to /login
  - Test permission enforcement: patient cannot see other patients' data
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All backend endpoints must enforce permissions on the backend (not just frontend)
- Patient data isolation is critical - always filter by authenticated user
- JWT tokens should be kept minimal (user_id, username, role only)
- Frontend routing is for UX - backend permissions are for security
- Existing functionality must remain intact (backward compatibility)
- Use Django transactions for operations that create multiple related records
- Test with seed data before moving to production

