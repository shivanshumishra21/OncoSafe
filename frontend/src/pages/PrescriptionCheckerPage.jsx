import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import DrugSearchAutocomplete from '../components/DrugSearchAutocomplete'
import AlertPanel from '../components/AlertPanel'
import { getPatients, checkPrescription } from '../api/endpoints'
import toast from 'react-hot-toast'
import { X, Loader2, ArrowRight } from 'lucide-react'

const PrescriptionCheckerPage = () => {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedPatientData, setSelectedPatientData] = useState(null)
  const [selectedDrugs, setSelectedDrugs] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  useEffect(() => {
    document.title = 'OncoSafe – Prescription Checker'
    fetchPatients()
  }, [])
  
  const fetchPatients = async () => {
    try {
      const response = await getPatients()
      setPatients(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Failed to load patients')
    }
  }
  
  const handlePatientSelect = (e) => {
    const patientId = e.target.value
    setSelectedPatient(patientId)
    const patient = patients.find(p => p.id === parseInt(patientId))
    setSelectedPatientData(patient)
  }
  
  const handleDrugSelect = (drug) => {
    setSelectedDrugs([...selectedDrugs, drug])
  }
  
  const handleDrugRemove = (drugId) => {
    setSelectedDrugs(selectedDrugs.filter(d => d.id !== drugId))
  }
  
  const handleCheck = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient')
      return
    }
    
    if (selectedDrugs.length === 0) {
      toast.error('Please select at least one drug')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await checkPrescription({
        patient_id: selectedPatient,
        drug_ids: selectedDrugs.map(d => d.id)
      })
      setResults(response.data)
      toast.success('Prescription checked successfully')
    } catch (error) {
      console.error('Error checking prescription:', error)
      if (error.response?.status === 404) {
        toast.error('Patient not found')
      } else {
        toast.error('Error checking prescription')
      }
    } finally {
      setLoading(false)
    }
  }
  
  const handleCalculateDose = () => {
    navigate('/dose', {
      state: {
        patient: selectedPatientData,
        drugs: selectedDrugs
      }
    })
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Prescription Checker</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL - Input Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Step 1: Select Patient</h2>
              <select
                value={selectedPatient}
                onChange={handlePatientSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select Patient --</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} – {patient.age} yrs | Kidney: {patient.kidney_status} | Liver: {patient.liver_status}
                  </option>
                ))}
              </select>
              
              {selectedPatientData && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-2">Patient Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-semibold">{selectedPatientData.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <span className="ml-2 font-semibold">{selectedPatientData.age} years</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Weight:</span>
                      <span className="ml-2 font-semibold">{selectedPatientData.weight} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Height:</span>
                      <span className="ml-2 font-semibold">{selectedPatientData.height} cm</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kidney:</span>
                      <span className={`ml-2 font-semibold ${
                        selectedPatientData.kidney_status.toLowerCase() === 'critical' ? 'text-danger' :
                        selectedPatientData.kidney_status.toLowerCase() === 'low' ? 'text-warning' :
                        'text-success'
                      }`}>
                        {selectedPatientData.kidney_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Liver:</span>
                      <span className={`ml-2 font-semibold ${
                        selectedPatientData.liver_status.toLowerCase() === 'critical' ? 'text-danger' :
                        selectedPatientData.liver_status.toLowerCase() === 'low' ? 'text-warning' :
                        'text-success'
                      }`}>
                        {selectedPatientData.liver_status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Step 2: Select Drugs</h2>
              <DrugSearchAutocomplete
                onSelect={handleDrugSelect}
                selectedDrugs={selectedDrugs}
              />
              
              {selectedDrugs.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Selected Drugs:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDrugs.map(drug => (
                      <div
                        key={drug.id}
                        className="bg-primary text-white px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{drug.name}</span>
                        <button
                          onClick={() => handleDrugRemove(drug.id)}
                          className="hover:bg-blue-900 rounded-full p-0.5"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Step 3: Check</h2>
              <button
                onClick={handleCheck}
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {loading ? 'Checking...' : 'Check Prescription'}
              </button>
            </div>
          </div>
          
          {/* RIGHT PANEL - Results */}
          <div>
            {results ? (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <AlertPanel
                    interactions={results.interactions}
                    toxicityAlerts={results.toxicity_alerts}
                  />
                </div>
                
                {results.interactions.length === 0 && results.toxicity_alerts.length === 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-center text-success">
                      <div className="text-6xl mb-4">✓</div>
                      <p className="text-xl font-bold">Prescription appears safe</p>
                      <p className="mt-2 text-gray-600">No interactions or alerts detected for the selected patient.</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <button
                    onClick={handleCalculateDose}
                    className="w-full bg-success text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    Calculate Dose for Selected Drugs
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                <p className="text-lg">Select a patient and drugs, then click "Check Prescription" to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionCheckerPage
