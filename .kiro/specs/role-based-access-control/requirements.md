# Requirements Document: Role-Based Access Control (RBAC)

## Introduction

This document specifies requirements for adding Role-Based Access Control (RBAC) to the OncoSafe oncology prescription safety system. The system will support two user roles: Admin (full system access) and Patient (restricted access to personal data only). This feature ensures data privacy, regulatory compliance, and appropriate access segregation between healthcare administrators and patients.

## Glossary

- **System**: The OncoSafe oncology prescription safety application (Django REST Framework backend + React frontend)
- **User**: An authenticated account in the System with a username, password, and assigned role
- **Admin**: A User with role='admin' who has full access to all System features and data
- **Patient_User**: A User with role='patient' who has restricted access to only their own medical data
- **Patient_Profile**: A database record containing medical information (name, age, weight, height, kidney_status, liver_status) linked to a Patient_User
- **JWT_Token**: JSON Web Token used for authentication containing user_id, username, and role
- **Permission_Class**: Django REST Framework authorization component that enforces role-based access rules
- **Protected_Route**: Frontend route that requires authentication and specific role authorization
- **Dashboard**: Role-specific landing page displaying relevant information and actions
- **Prescription**: A drug prescription record containing drug, patient, dosage, and safety check results
- **Dose_History**: Historical records of dose calculations performed for a patient
- **Toxicity_Alert**: A warning about potential drug toxicity based on patient organ function
- **Inventory_Item**: A drug stock record with quantity, batch number, and expiry date
- **Seed_Data**: Initial database records created for testing and demonstration purposes

## Requirements

### Requirement 1: User Role Management

**User Story:** As a system administrator, I want users to have assigned roles, so that access can be controlled based on user type.

#### Acceptance Criteria

1. THE System SHALL extend the Django User model to include a role field with values 'admin' or 'patient'
2. WHEN a new User is created, THE System SHALL assign role='patient' as the default value
3. THE System SHALL link each Patient_User to exactly one Patient_Profile record
4. THE System SHALL store the role field in the JWT_Token payload during authentication
5. THE System SHALL validate that the role field contains only 'admin' or 'patient' values

### Requirement 2: Enhanced Authentication

**User Story:** As a user, I want to receive my role information during login, so that the frontend can route me to the appropriate dashboard.

#### Acceptance Criteria

1. WHEN a User submits valid credentials to the login endpoint, THE System SHALL return a JWT_Token containing user_id, username, and role
2. WHEN a User submits valid credentials to the login endpoint, THE System SHALL return the role value in the response body
3. THE System SHALL provide a GET /api/auth/me/ endpoint that returns the authenticated User's id, username, and role
4. WHEN an unauthenticated request is made to /api/auth/me/, THE System SHALL return HTTP 401 Unauthorized
5. THE System SHALL decode the JWT_Token on the frontend to extract the role for routing decisions

### Requirement 3: Patient Registration with Profile Creation

**User Story:** As a patient, I want my user account and medical profile created together during registration, so that I can immediately access my data.

#### Acceptance Criteria

1. WHEN a new Patient_User registers, THE System SHALL create a User record with role='patient'
2. WHEN a new Patient_User registers, THE System SHALL create a linked Patient_Profile record with the provided medical information
3. WHEN a new Patient_User registers, THE System SHALL store the User's id in the Patient_Profile's user_id foreign key field
4. WHEN Patient_User registration fails, THE System SHALL rollback both User and Patient_Profile creation
5. THE System SHALL require name, age, weight, height, kidney_status, liver_status, username, and password fields for Patient_User registration

### Requirement 4: Admin Permission Enforcement

**User Story:** As a system administrator, I want certain endpoints restricted to admins only, so that patients cannot access administrative functions.

#### Acceptance Criteria

1. THE System SHALL implement an IsAdmin Permission_Class that verifies role='admin' in the JWT_Token
2. WHEN a non-admin User attempts to access an admin-only endpoint, THE System SHALL return HTTP 403 Forbidden
3. THE System SHALL apply IsAdmin permission to POST /api/patients/ (create patient)
4. THE System SHALL apply IsAdmin permission to POST /api/drugs/ (create drug)
5. THE System SHALL apply IsAdmin permission to POST /api/inventory/ (create inventory item)
6. THE System SHALL apply IsAdmin permission to GET /api/admin/dashboard/ (admin statistics)
7. THE System SHALL apply IsAdmin permission to DELETE endpoints for patients, drugs, and inventory

### Requirement 5: Patient Data Isolation

**User Story:** As a patient, I want to see only my own medical data, so that my privacy is protected.

#### Acceptance Criteria

1. THE System SHALL implement an IsPatientOwner Permission_Class that verifies the requested Patient_Profile belongs to the authenticated Patient_User
2. WHEN a Patient_User requests data, THE System SHALL filter results to include only records linked to their Patient_Profile
3. THE System SHALL provide GET /api/my/prescriptions/ endpoint that returns only the authenticated Patient_User's Prescription records
4. THE System SHALL provide GET /api/my/doses/ endpoint that returns only the authenticated Patient_User's Dose_History records
5. THE System SHALL provide GET /api/my/alerts/ endpoint that returns only the authenticated Patient_User's Toxicity_Alert records
6. THE System SHALL provide GET /api/my/profile/ endpoint that returns only the authenticated Patient_User's Patient_Profile
7. WHEN a Patient_User attempts to access another patient's data, THE System SHALL return HTTP 403 Forbidden

### Requirement 6: Admin Dashboard Features

**User Story:** As an admin, I want a comprehensive dashboard with statistics and quick actions, so that I can efficiently manage the system.

#### Acceptance Criteria

1. THE System SHALL provide GET /api/admin/dashboard/ endpoint that returns total_patients, total_drugs, expiry_alerts_count, and low_stock_count
2. THE System SHALL calculate expiry_alerts_count as Inventory_Item records expiring within 30 days
3. THE System SHALL calculate low_stock_count as Inventory_Item records with quantity less than 10 units
4. THE System SHALL return recent_patients as the 5 most recently created Patient_Profile records
5. THE System SHALL return expiring_inventory as the 5 Inventory_Item records with nearest expiry dates
6. THE System SHALL return recent_prescriptions as the 5 most recently created Prescription records
7. WHEN a non-admin User requests /api/admin/dashboard/, THE System SHALL return HTTP 403 Forbidden

### Requirement 7: Admin Patient Management

**User Story:** As an admin, I want to create patient accounts with medical profiles, so that I can onboard new patients into the system.

#### Acceptance Criteria

1. THE System SHALL provide POST /api/patients/ endpoint that creates both User and Patient_Profile records
2. WHEN an Admin creates a patient, THE System SHALL accept name, age, weight, height, kidney_status, liver_status, username, and password fields
3. WHEN an Admin creates a patient, THE System SHALL create a User with role='patient' and the provided username and password
4. WHEN an Admin creates a patient, THE System SHALL create a Patient_Profile linked to the created User
5. WHEN an Admin creates a patient, THE System SHALL return the created Patient_Profile data and the generated User credentials
6. WHEN patient creation fails, THE System SHALL rollback both User and Patient_Profile creation
7. WHEN a Patient_User attempts to create a patient, THE System SHALL return HTTP 403 Forbidden

### Requirement 8: Frontend Role-Based Routing

**User Story:** As a user, I want to be automatically routed to my role-specific dashboard after login, so that I see relevant information immediately.

#### Acceptance Criteria

1. WHEN an Admin logs in, THE System SHALL redirect to /admin/dashboard
2. WHEN a Patient_User logs in, THE System SHALL redirect to /patient/dashboard
3. WHEN a Patient_User attempts to access /admin/* routes, THE System SHALL redirect to /patient/dashboard
4. WHEN an Admin attempts to access /patient/* routes, THE System SHALL redirect to /admin/dashboard
5. THE System SHALL decode the JWT_Token on the frontend to determine the User's role for routing
6. WHEN the JWT_Token is invalid or expired, THE System SHALL redirect to /login

### Requirement 9: Admin Frontend Routes

**User Story:** As an admin, I want dedicated pages for managing patients, drugs, and inventory, so that I can perform administrative tasks efficiently.

#### Acceptance Criteria

1. THE System SHALL provide /admin/dashboard route displaying total_patients, total_drugs, expiry_alerts, low_stock, recent_patients, expiring_inventory, and recent_prescriptions
2. THE System SHALL provide /admin/patients route displaying a searchable patient list and an "Add Patient" button
3. THE System SHALL provide /admin/drugs route displaying a searchable drug list and an "Add Drug" button
4. THE System SHALL provide /admin/inventory route displaying inventory items with expiry alerts and an "Add Inventory" button
5. THE System SHALL provide /admin/prescription route for checking prescriptions for any patient
6. THE System SHALL provide /admin/dose route for calculating doses for any patient
7. WHEN a non-admin User attempts to access /admin/* routes, THE System SHALL redirect to /patient/dashboard

### Requirement 10: Patient Frontend Routes

**User Story:** As a patient, I want dedicated pages to view my prescriptions, dose history, and profile, so that I can track my treatment.

#### Acceptance Criteria

1. THE System SHALL provide /patient/dashboard route displaying welcome message, kidney_status, liver_status, active_prescriptions_count, last_dose_date, and Toxicity_Alert list
2. THE System SHALL provide /patient/prescriptions route displaying the Patient_User's Prescription history
3. THE System SHALL provide /patient/dose-history route displaying the Patient_User's Dose_History records
4. THE System SHALL provide /patient/profile route displaying the Patient_User's Patient_Profile in read-only format
5. WHEN a non-patient User attempts to access /patient/* routes, THE System SHALL redirect to /admin/dashboard

### Requirement 11: Add Patient Modal (Admin)

**User Story:** As an admin, I want a modal form to add new patients, so that I can quickly onboard patients with all required information.

#### Acceptance Criteria

1. WHEN an Admin clicks "Add Patient" on /admin/patients, THE System SHALL display a modal form
2. THE System SHALL require name, age, weight, height, kidney_status, liver_status, username, and password fields in the modal
3. THE System SHALL provide dropdown selections for kidney_status (Normal, Low, Critical) and liver_status (Normal, Low, Critical)
4. WHEN the Admin submits the form, THE System SHALL call POST /api/patients/ with the form data
5. WHEN patient creation succeeds, THE System SHALL display a success message with the generated username and password
6. WHEN patient creation succeeds, THE System SHALL refresh the patient list
7. WHEN patient creation fails, THE System SHALL display an error message with validation details

### Requirement 12: Patient Dashboard Features

**User Story:** As a patient, I want a personalized dashboard showing my health status and alerts, so that I can monitor my treatment safety.

#### Acceptance Criteria

1. THE System SHALL display a welcome banner with the Patient_User's name on /patient/dashboard
2. THE System SHALL display cards showing kidney_status, liver_status, active_prescriptions_count, and last_dose_date
3. THE System SHALL display a color-coded alerts section with Toxicity_Alert records (red for critical, yellow for warning, green for normal)
4. THE System SHALL display the 5 most recent Prescription records for the Patient_User
5. THE System SHALL calculate active_prescriptions_count as Prescription records created within the last 30 days
6. THE System SHALL calculate last_dose_date as the most recent Dose_History record's created_at date

### Requirement 13: Role-Based Navigation Bar

**User Story:** As a user, I want a navigation bar tailored to my role, so that I see only the features I can access.

#### Acceptance Criteria

1. WHEN an Admin is logged in, THE System SHALL display navigation links: Dashboard, Patients, Drugs, Inventory, Prescription, Dose, Logout
2. WHEN a Patient_User is logged in, THE System SHALL display navigation links: My Dashboard, My Prescriptions, My Doses, My Profile, Logout
3. THE System SHALL highlight the current active route in the navigation bar
4. WHEN a User clicks Logout, THE System SHALL clear the JWT_Token and redirect to /login
5. THE System SHALL display the OncoSafe logo on the left side of the navigation bar

### Requirement 14: Seed Data for Testing

**User Story:** As a developer, I want seed data with admin and patient accounts, so that I can test the RBAC features immediately.

#### Acceptance Criteria

1. THE System SHALL provide a management command to create seed data
2. THE System SHALL create an Admin User with username='admin', password='admin123', and role='admin'
3. THE System SHALL create 3 Patient_User accounts with usernames 'patient1', 'patient2', 'patient3' and password='patient123'
4. THE System SHALL create linked Patient_Profile records for each Patient_User with realistic medical data
5. THE System SHALL create sample Prescription records linked to the patient profiles
6. THE System SHALL create sample Inventory_Item records with varying expiry dates and stock levels

### Requirement 15: Admin Patient Account Management

**User Story:** As an admin, I want to deactivate patient accounts and reset passwords, so that I can manage user access.

#### Acceptance Criteria

1. THE System SHALL provide PATCH /api/patients/{id}/deactivate/ endpoint that sets User.is_active=False
2. THE System SHALL provide PATCH /api/patients/{id}/reset-password/ endpoint that generates a new random password
3. WHEN an Admin deactivates a patient account, THE System SHALL prevent the Patient_User from logging in
4. WHEN an Admin resets a patient password, THE System SHALL return the new password in the response
5. WHEN a Patient_User attempts to deactivate or reset passwords, THE System SHALL return HTTP 403 Forbidden
6. WHEN a deactivated Patient_User attempts to login, THE System SHALL return HTTP 401 Unauthorized with message "Account is inactive"

### Requirement 16: Patient Toxicity Alert Display

**User Story:** As a patient, I want to see toxicity warnings prominently on my dashboard, so that I am aware of potential drug risks.

#### Acceptance Criteria

1. WHEN a Patient_User has Toxicity_Alert records, THE System SHALL display an alert banner on /patient/dashboard
2. THE System SHALL color-code alerts: red background for critical alerts, yellow background for warning alerts, green background for normal status
3. THE System SHALL display alert message, drug name, and severity level for each Toxicity_Alert
4. THE System SHALL sort alerts by severity (critical first, then warning, then normal)
5. WHEN a Patient_User has no Toxicity_Alert records, THE System SHALL display "No active alerts" message

### Requirement 17: Admin Inventory Notifications

**User Story:** As an admin, I want to see a notification badge for low stock items, so that I can restock inventory proactively.

#### Acceptance Criteria

1. WHEN an Admin views the navigation bar, THE System SHALL display a badge on the Inventory link showing low_stock_count
2. THE System SHALL calculate low_stock_count as Inventory_Item records with quantity less than 10 units
3. WHEN low_stock_count is 0, THE System SHALL hide the notification badge
4. WHEN low_stock_count is greater than 0, THE System SHALL display the count in a red circular badge
5. THE System SHALL update the badge count when Inventory_Item records are created or updated

### Requirement 18: Patient Profile Read-Only View

**User Story:** As a patient, I want to view my complete medical profile, so that I can verify my information is accurate.

#### Acceptance Criteria

1. THE System SHALL display all Patient_Profile fields on /patient/profile: name, age, weight, height, kidney_status, liver_status
2. THE System SHALL display fields in read-only format (no edit capability for patients)
3. THE System SHALL display units for weight (kg) and height (cm)
4. THE System SHALL display kidney_status and liver_status with color-coded badges (green for Normal, yellow for Low, red for Critical)
5. THE System SHALL display the Patient_User's username and account creation date

### Requirement 19: Backward Compatibility

**User Story:** As a system maintainer, I want existing features to continue working after RBAC implementation, so that current users are not disrupted.

#### Acceptance Criteria

1. THE System SHALL maintain all existing API endpoints for drugs, patients, prescriptions, and inventory
2. THE System SHALL maintain all existing frontend routes and components
3. WHEN an existing User without a role field logs in, THE System SHALL assign role='patient' as default
4. THE System SHALL maintain existing drug search, prescription checking, dose calculation, and inventory management features
5. THE System SHALL maintain integration with RxNorm and OpenFDA external APIs

### Requirement 20: Security and Authorization

**User Story:** As a security officer, I want all endpoints properly secured with role-based permissions, so that unauthorized access is prevented.

#### Acceptance Criteria

1. THE System SHALL require authentication for all API endpoints except /api/auth/register/ and /api/auth/login/
2. THE System SHALL verify JWT_Token signature and expiration on every authenticated request
3. THE System SHALL return HTTP 401 Unauthorized when JWT_Token is missing, invalid, or expired
4. THE System SHALL return HTTP 403 Forbidden when a User attempts to access a resource without proper role permissions
5. THE System SHALL log all authorization failures with timestamp, user_id, and attempted endpoint
6. THE System SHALL prevent SQL injection by using parameterized queries for all database operations
7. THE System SHALL hash all passwords using Django's default PBKDF2 algorithm before storage

## Notes

- This is an additive feature that extends the existing OncoSafe system
- All existing functionality must remain intact and operational
- The implementation should follow Django REST Framework best practices for permissions
- Frontend routing should use React Router's ProtectedRoute pattern with role checking
- JWT tokens should include minimal necessary information (user_id, username, role)
- Patient data privacy is critical - all patient-specific endpoints must enforce ownership verification
- Admin users should have unrestricted access to all system features and data
- The seed data management command should be idempotent (safe to run multiple times)
