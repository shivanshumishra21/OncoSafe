import { useState, useEffect } from 'react'
import RoleBasedNavbar from '../../components/RoleBasedNavbar'
import StatCard from '../../components/StatCard'
import { getAdminDashboard } from '../../api/endpoints'
import { Pill, Users, AlertTriangle, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    total_patients: 0,
    total_drugs: 0,
    expiry_alerts_count: 0,
    low_stock_count: 0
  })
  const [recentPatients, setRecentPatients] = useState([])
  const [expiringInventory, setExpiringInventory] = useState([])
  const [recentPrescriptions, setRecentPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    document.title = 'Admin Dashboard - OncoSafe'
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAdminDashboard()
      const data = response.data
      
      setStats({
        total_patients: data.total_patients,
        total_drugs: data.total_drugs,
        expiry_alerts_count: data.expiry_alerts_count,
        low_stock_count: data.low_stock_count
      })
      
      setRecentPatients(data.recent_patients || [])
      setExpiringInventory(data.expiring_inventory || [])
      setRecentPrescriptions(data.recent_prescriptions || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <RoleBasedNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Loading dashboard...</div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <RoleBasedNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <RoleBasedNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Patients"
            value={stats.total_patients}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Total Drugs"
            value={stats.total_drugs}
            icon={Pill}
            color="blue"
          />
          <StatCard
            title="Expiry Alerts"
            value={stats.expiry_alerts_count}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Low Stock"
            value={stats.low_stock_count}
            icon={Package}
            color="orange"
          />
        </div>
        
        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Patients */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Patients</h2>
            {recentPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Age</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Kidney</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Liver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPatients.map((patient) => (
                      <tr key={patient.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-sm text-gray-800">{patient.name}</td>
                        <td className="py-2 px-3 text-sm text-gray-600">{patient.age}</td>
                        <td className="py-2 px-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            patient.kidney_status === 'Normal' ? 'bg-green-100 text-green-800' :
                            patient.kidney_status === 'Low' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {patient.kidney_status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            patient.liver_status === 'Normal' ? 'bg-green-100 text-green-800' :
                            patient.liver_status === 'Low' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {patient.liver_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent patients</p>
            )}
          </div>
          
          {/* Expiring Inventory */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Expiring Inventory</h2>
            {expiringInventory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Drug</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Batch</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Expiry</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringInventory.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-sm text-gray-800">{item.drug_name || item.drug}</td>
                        <td className="py-2 px-3 text-sm text-gray-600">{item.batch_number}</td>
                        <td className="py-2 px-3 text-sm text-red-600">{item.expiry_date}</td>
                        <td className="py-2 px-3 text-sm text-gray-600">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No expiring inventory</p>
            )}
          </div>
        </div>
        
        {/* Recent Prescriptions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Prescriptions</h2>
          {recentPrescriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Patient</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Drug</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Dosage</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPrescriptions.map((prescription) => (
                    <tr key={prescription.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm text-gray-800">{prescription.patient_name || prescription.patient}</td>
                      <td className="py-2 px-3 text-sm text-gray-800">{prescription.drug_name || prescription.drug}</td>
                      <td className="py-2 px-3 text-sm text-gray-600">{prescription.dosage}</td>
                      <td className="py-2 px-3 text-sm text-gray-600">
                        {prescription.created_at ? new Date(prescription.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-2 px-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          prescription.is_safe === true ? 'bg-green-100 text-green-800' :
                          prescription.is_safe === false ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {prescription.is_safe === true ? 'Safe' : prescription.is_safe === false ? 'Unsafe' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent prescriptions</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
