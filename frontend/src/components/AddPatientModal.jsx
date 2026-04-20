import { useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

const AddPatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    kidney_status: 'Normal',
    liver_status: 'Normal',
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState(null)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await api.post('/patients/', formData)
      
      // Store credentials to display success message
      setCredentials({
        username: formData.username,
        password: formData.password
      })
      
      toast.success('Patient created successfully!')
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        weight: '',
        height: '',
        kidney_status: 'Normal',
        liver_status: 'Normal',
        username: '',
        password: ''
      })
      
      // Call onSuccess callback to refresh patient list
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create patient')
    } finally {
      setLoading(false)
    }
  }
  
  const handleClose = () => {
    setCredentials(null)
    setFormData({
      name: '',
      age: '',
      weight: '',
      height: '',
      kidney_status: 'Normal',
      liver_status: 'Normal',
      username: '',
      password: ''
    })
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Add New Patient</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>
        
        {credentials ? (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Patient Account Created Successfully!
              </h3>
              <p className="text-green-700 mb-3">
                Please save these credentials and share them with the patient:
              </p>
              <div className="bg-white rounded p-3 space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Username:</span>
                  <span className="ml-2 font-mono text-gray-900">{credentials.username}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Password:</span>
                  <span className="ml-2 font-mono text-gray-900">{credentials.password}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-900 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Age</label>
                <input
                  type="number"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Kidney Status</label>
                <select
                  value={formData.kidney_status}
                  onChange={(e) => setFormData({ ...formData, kidney_status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Liver Status</label>
                <select
                  value={formData.liver_status}
                  onChange={(e) => setFormData({ ...formData, liver_status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-900 transition disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Patient'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AddPatientModal
