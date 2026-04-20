import { useState, useEffect } from 'react'
import RoleBasedNavbar from '../../components/RoleBasedNavbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Activity, Heart } from 'lucide-react'

const PatientDashboardPage = () => {
  const [profile, setProfile] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    document.title = 'My Dashboard - OncoSafe'
    fetchData()
  }, [])
  
  const fetchData = async () => {
    try {
      const [profileRes, prescriptionsRes] = await Promise.all([
        api.get('/my/profile/'),
        api.get('/my/prescriptions/')
      ])
      setProfile(profileRes.data)
      setPrescriptions(prescriptionsRes.data)
    } catch (error) {
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
          <p>Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <RoleBasedNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-primary to-blue-900 rounded-xl shadow-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.name}!</h1>
          <p className="text-blue-100">Here's your health overview</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="text-primary" size={32} />
              <h2 className="text-xl font-bold">Kidney Status</h2>
            </div>
            <p className={`text-3xl font-bold ${
              profile?.kidney_status === 'Normal' ? 'text-green-600' :
              profile?.kidney_status === 'Low' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {profile?.kidney_status}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="text-red-500" size={32} />
              <h2 className="text-xl font-bold">Liver Status</h2>
            </div>
            <p className={`text-3xl font-bold ${
              profile?.liver_status === 'Normal' ? 'text-green-600' :
              profile?.liver_status === 'Low' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {profile?.liver_status}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Prescriptions</h2>
          {prescriptions.length === 0 ? (
            <p className="text-gray-600">No prescriptions yet</p>
          ) : (
            <div className="space-y-2">
              {prescriptions.slice(0, 5).map((prescription, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">Prescription #{prescription.id}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(prescription.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientDashboardPage
