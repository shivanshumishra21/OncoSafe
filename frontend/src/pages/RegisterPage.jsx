import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api/endpoints'
import toast from 'react-hot-toast'
import { Pill, Loader2 } from 'lucide-react'

const RegisterPage = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  useEffect(() => {
    document.title = 'OncoSafe – Register'
  }, [])
  
  const validate = () => {
    const newErrors = {}
    
    if (!userData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    
    if (!userData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!userData.password) {
      newErrors.password = 'Password is required'
    } else if (userData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setLoading(true)
    
    try {
      await registerUser({
        username: userData.username,
        email: userData.email,
        password: userData.password
      })
      toast.success('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.username?.[0] || 
                       err.response?.data?.email?.[0] ||
                       'Registration failed. Please try again.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Pill size={32} className="text-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          </div>
          <p className="text-gray-600">Join OncoSafe as a Patient</p>
          <p className="text-sm text-gray-500 mt-1">Patient accounts are created here. Admin accounts are created by administrators.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Username</label>
            <input
              type="text"
              value={userData.username}
              onChange={(e) => setUserData({ ...userData, username: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.username ? 'border-danger' : 'border-gray-300'
              }`}
            />
            {errors.username && (
              <p className="text-danger text-sm mt-1">{errors.username}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.email ? 'border-danger' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-danger text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={userData.password}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.password ? 'border-danger' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="text-danger text-sm mt-1">{errors.password}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={userData.confirmPassword}
              onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.confirmPassword ? 'border-danger' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-danger text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
