import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import PrescriptionCheckerPage from './pages/PrescriptionCheckerPage'
import DoseCalculatorPage from './pages/DoseCalculatorPage'
import InventoryPage from './pages/InventoryPage'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminPatientsPage from './pages/admin/AdminPatientsPage'
import AdminDrugsPage from './pages/admin/AdminDrugsPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'
import AdminPrescriptionPage from './pages/admin/AdminPrescriptionPage'
import AdminDosePage from './pages/admin/AdminDosePage'

// Patient Pages
import PatientDashboardPage from './pages/patient/PatientDashboardPage'
import PatientPrescriptionsPage from './pages/patient/PatientPrescriptionsPage'
import PatientProfilePage from './pages/patient/PatientProfilePage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/patients" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminPatientsPage />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/drugs" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDrugsPage />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/inventory" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminInventoryPage />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/prescription" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminPrescriptionPage />
            </RoleProtectedRoute>
          } />
          <Route path="/admin/dose" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDosePage />
            </RoleProtectedRoute>
          } />
          
          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <PatientDashboardPage />
            </RoleProtectedRoute>
          } />
          <Route path="/patient/prescriptions" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <PatientPrescriptionsPage />
            </RoleProtectedRoute>
          } />
          <Route path="/patient/profile" element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <PatientProfilePage />
            </RoleProtectedRoute>
          } />
          
          {/* Legacy Routes (kept for backward compatibility) */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/prescription" element={<ProtectedRoute><PrescriptionCheckerPage /></ProtectedRoute>} />
          <Route path="/dose" element={<ProtectedRoute><DoseCalculatorPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
