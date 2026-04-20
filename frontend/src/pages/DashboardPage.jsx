import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import { getDrugs, getPatients, getInventoryAlerts } from '../api/endpoints'
import { Pill, Users, AlertTriangle, Package, FileCheck, Calculator, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalDrugs: null,
    totalPatients: null,
    expiryAlerts: null,
    lowStockAlerts: null
  })
  const [recentAlerts, setRecentAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  useEffect(() => {
    document.title = 'OncoSafe – Dashboard'
    fetchStats()
  }, [])
  
  const fetchStats = async () => {
    try {
      const [drugsRes, patientsRes, alertsRes] = await Promise.all([
        getDrugs(),
        getPatients(),
        getInventoryAlerts()
      ])
      
      const drugsData = drugsRes.data.results || drugsRes.data
      const patientsData = patientsRes.data.results || patientsRes.data
      const alertsData = alertsRes.data
      
      setStats({
        totalDrugs: drugsData.length,
        totalPatients: patientsData.length,
        expiryAlerts: alertsData.expiring_soon?.length || 0,
        lowStockAlerts: alertsData.low_stock?.length || 0
      })
      
      setRecentAlerts(alertsData.expiring_soon || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Connection error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }
  
  const getDaysRemaining = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    return days
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Drugs"
            value={stats.totalDrugs}
            icon={Pill}
            color="blue"
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Expiry Alerts"
            value={stats.expiryAlerts}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStockAlerts}
            icon={Package}
            color="orange"
          />
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/prescription')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left group"
            >
              <FileCheck size={32} className="text-primary mb-3 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Check Prescription</h3>
              <p className="text-gray-600">Validate drug interactions and patient risks</p>
            </button>
            
            <button
              onClick={() => navigate('/dose')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left group"
            >
              <Calculator size={32} className="text-success mb-3 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Calculate Dose</h3>
              <p className="text-gray-600">BSA-based dose calculations</p>
            </button>
            
            <button
              onClick={() => navigate('/inventory')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left group"
            >
              <ClipboardList size={32} className="text-warning mb-3 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">View Inventory</h3>
              <p className="text-gray-600">Track stock and expiry dates</p>
            </button>
          </div>
        </div>
        
        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Expiry Alerts</h2>
            <div className="space-y-2">
              {recentAlerts.slice(0, 5).map((item, index) => {
                const daysRemaining = getDaysRemaining(item.expiry_date)
                const isCritical = daysRemaining < 7
                
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isCritical ? 'bg-red-50 border border-danger' : 'bg-yellow-50 border border-warning'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        size={20}
                        className={isCritical ? 'text-danger' : 'text-warning'}
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{item.drug_name}</p>
                        <p className="text-sm text-gray-600">Expires: {item.expiry_date}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        isCritical ? 'bg-danger text-white' : 'bg-warning text-white'
                      }`}
                    >
                      {daysRemaining} days
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
