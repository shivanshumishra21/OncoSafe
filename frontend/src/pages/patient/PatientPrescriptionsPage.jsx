import { useState, useEffect } from 'react'
import RoleBasedNavbar from '../../components/RoleBasedNavbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const PatientPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    document.title = 'My Prescriptions - OncoSafe'
    fetchPrescriptions()
  }, [])
  
  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/my/prescriptions/')
      setPrescriptions(response.data)
    } catch (error) {
      toast.error('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <RoleBasedNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Prescriptions</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          {loading ? (
            <p>Loading...</p>
          ) : prescriptions.length === 0 ? (
            <p className="text-gray-600">No prescriptions found</p>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">Prescription #{prescription.id}</h3>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(prescription.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientPrescriptionsPage
