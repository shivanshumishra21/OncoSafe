import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../api/endpoints'
import toast from 'react-hot-toast'
import { Pill, Loader2 } from 'lucide-react'

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  
  useEffect(() => {
    document.title = 'OncoSafe – Login'
  }, [])
  
  const validate = () => {
    const newErrors = {}
    if (!credentials.username.trim()) {
      newErrors.username = 'Username is required'
    }
    if (!credentials.password) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setLoading(true)
    
    try {
      const response = await loginUser(credentials)
      const { access, role } = response.data
      login(access, role)
      toast.success('Login successful!')
      
      // Decode JWT to extract role for routing
      const payload = access.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      const userRole = decoded.role || role || 'patient'
      
      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/patient/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Pill size={32} className="text-primary" />
            <h1 className="text-3xl font-bold text-gray-800">OncoSafe</h1>
          </div>
          <h2 className="text-xl text-gray-600">Oncology Pharmacy Assistant</h2>
          <p className="text-sm text-gray-500 mt-2">Login with your credentials</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.username ? 'border-danger' : 'border-gray-300'
              }`}
            />
            {errors.username && (
              <p className="text-danger text-sm mt-1">{errors.username}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.password ? 'border-danger' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="text-danger text-sm mt-1">{errors.password}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Register
          </Link>
        </p>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            <strong>Test Accounts:</strong><br />
            Admin: admin/admin123<br />
            Patient: patient1/patient123
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
