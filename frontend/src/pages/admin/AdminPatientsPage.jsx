import { useState, useEffect } from 'react'
import RoleBasedNavbar from '../../components/RoleBasedNavbar'
import AddPatientModal from '../../components/AddPatientModal'
import { getPatients } from '../../api/endpoints'
import toast from 'react-hot-toast'
import { UserPlus, Search } from 'lucide-react'

const AdminPatientsPage = () => {
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  
  useEffect(() => {
    document.title = 'Manage Patients - OncoSafe Admin'
    fetchPatients()
  }, [])
  
  const fetchPatients = async () => {
    try {
      const response = await getPatients()
      setPatients(response.data.results || response.data)
    } catch (error) {
      toast.error('Failed to load patients')
    }
  }
  
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <div className="min-h-screen bg-gray-100">
      <RoleBasedNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Patients</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition"
          >
            <UserPlus size={20} />
            Add Patient
          </button>
        </div>
        
        <AddPatientModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchPatients}
        />
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Age</th>
                  <th className="text-left py-3 px-4">Weight</th>
                  <th className="text-left py-3 px-4">Height</th>
                  <th className="text-left py-3 px-4">Kidney</th>
                  <th className="text-left py-3 px-4">Liver</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{patient.name}</td>
                    <td className="py-3 px-4">{patient.age}</td>
                    <td className="py-3 px-4">{patient.weight} kg</td>
                    <td className="py-3 px-4">{patient.height} cm</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        patient.kidney_status === 'Normal' ? 'bg-green-100 text-green-800' :
                        patient.kidney_status === 'Low' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {patient.kidney_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
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
        </div>
      </div>
    </div>
  )
}

export default AdminPatientsPage
