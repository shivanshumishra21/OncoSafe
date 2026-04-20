import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Pill, LogOut } from 'lucide-react'

const RoleBasedNavbar = () => {
  const { role, logout } = useAuth()
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  
  const linkClass = (path) => `
    px-4 py-2 rounded-lg transition
    ${isActive(path) 
      ? 'bg-white text-primary font-semibold' 
      : 'text-white hover:bg-blue-800'
    }
  `
  
  if (role === 'admin') {
    return (
      <nav className="bg-primary shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Pill size={28} className="text-white" />
              <span className="text-white text-xl font-bold">OncoSafe Admin</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                Dashboard
              </Link>
              <Link to="/admin/patients" className={linkClass('/admin/patients')}>
                Patients
              </Link>
              <Link to="/admin/drugs" className={linkClass('/admin/drugs')}>
                Drugs
              </Link>
              <Link to="/admin/inventory" className={linkClass('/admin/inventory')}>
                Inventory
              </Link>
              <Link to="/admin/prescription" className={linkClass('/admin/prescription')}>
                Prescription
              </Link>
              <Link to="/admin/dose" className={linkClass('/admin/dose')}>
                Dose
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-red-600 rounded-lg transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    )
  }
  
  // Patient navbar
  return (
    <nav className="bg-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Pill size={28} className="text-white" />
            <span className="text-white text-xl font-bold">OncoSafe</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/patient/dashboard" className={linkClass('/patient/dashboard')}>
              My Dashboard
            </Link>
            <Link to="/patient/prescriptions" className={linkClass('/patient/prescriptions')}>
              My Prescriptions
            </Link>
            <Link to="/patient/profile" className={linkClass('/patient/profile')}>
              My Profile
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-red-600 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default RoleBasedNavbar
