import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { role, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    } else if (!allowedRoles.includes(role)) {
      // Redirect to appropriate dashboard based on role
      if (role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/patient/dashboard')
      }
    }
  }, [role, isAuthenticated, allowedRoles, navigate])
  
  // Only render if authenticated and has correct role
  if (!isAuthenticated || !allowedRoles.includes(role)) {
    return null
  }
  
  return children
}

export default RoleProtectedRoute
