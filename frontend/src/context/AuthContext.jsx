import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // Decode JWT payload (middle part)
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload))
        setUser(decoded)
        setRole(decoded.role || 'patient')
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Invalid token:', error)
        localStorage.removeItem('token')
      }
    }
  }, [])

  const login = (token, userRole) => {
    localStorage.setItem('token', token)
    try {
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      setUser(decoded)
      setRole(userRole || decoded.role || 'patient')
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Invalid token:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setRole(null)
    setIsAuthenticated(false)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
