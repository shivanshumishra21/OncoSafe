import { useState, useEffect } from 'react'
import RoleBasedNavbar from '../../components/RoleBasedNavbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { User, Activity, Heart, Weight, Ruler } from 'lucide-react'

const PatientProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    document.title = 'My Profile - OncoSafe'
    fetchProfile()
  }, [])
  
  const fetchProfile = async () => {
    try {
      const response = await api.get('/my/profile/')
      setProfile(response.data)
    } catch (error) {
      toast.error('Failed to load profile')
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>
        
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary text-white rounded-full p-4">
              <User size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.name}</h2>
              <p className="text-gray-600">Patient Profile</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="text-primary" size={24} />
                <h3 className="font-semibold text-gray-700">Age</h3>
              </div>
              <p className="text-2xl font-bold">{profile?.age} years</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Weight className="text-primary" size={24} />
                <h3 className="font-semibold text-gray-700">Weight</h3>
              </div>
              <p className="text-2xl font-bold">{profile?.weight} kg</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Ruler className="text-primary" size={24} />
                <h3 className="font-semibold text-gray-700">Height</h3>
              </div>
              <p className="text-2xl font-bold">{profile?.height} cm</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="text-primary" size={24} />
                <h3 className="font-semibold text-gray-700">Kidney Status</h3>
              </div>
              <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
                profile?.kidney_status === 'Normal' ? 'bg-green-100 text-green-800' :
                profile?.kidney_status === 'Low' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {profile?.kidney_status}
              </span>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="text-red-500" size={24} />
                <h3 className="font-semibold text-gray-700">Liver Status</h3>
              </div>
              <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
                profile?.liver_status === 'Normal' ? 'bg-green-100 text-green-800' :
                profile?.liver_status === 'Low' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {profile?.liver_status}
              </span>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="text-primary" size={24} />
                <h3 className="font-semibold text-gray-700">Username</h3>
              </div>
              <p className="text-xl font-semibold">{profile?.username}</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This information is read-only. Contact your healthcare provider to update your medical information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientProfilePage
