import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Pill, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isActive = (path) => location.pathname === path
  
  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/prescription', label: 'Prescription' },
    { path: '/dose', label: 'Dose' },
    { path: '/inventory', label: 'Inventory' }
  ]
  
  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Pill size={24} />
            <span>OncoSafe</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`hover:bg-blue-900 px-3 py-2 rounded transition ${
                  isActive(link.path) ? 'font-bold underline' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* User & Logout */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm">{user?.username || 'User'}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block hover:bg-blue-900 px-3 py-2 rounded transition ${
                  isActive(link.path) ? 'font-bold bg-blue-900' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-blue-700">
              <p className="px-3 py-1 text-sm">{user?.username || 'User'}</p>
              <button
                onClick={logout}
                className="w-full text-left bg-red-600 hover:bg-red-700 px-3 py-2 rounded transition mt-2"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
