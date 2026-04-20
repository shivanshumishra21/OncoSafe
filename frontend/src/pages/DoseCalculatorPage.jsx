import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import DoseOutput from '../components/DoseOutput'
import { getPatients, getDrugs, calculateDose } from '../api/endpoints'
import toast from 'react-hot-toast'
import { Loader2, Info } from 'lucide-react'

const DoseCalculatorPage = () => {
  const [patients, setPatients] = useState([])
  const [drugs, setDrugs] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedDrug, setSelectedDrug] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  
  useEffect(() => {
    document.title = 'OncoSafe – Dose Calculator'
    fetchData()
    
    // Pre-fill from prescription checker if data passed
    if (location.state?.patient) {
      setSelectedPatient(location.state.patient.id.toString())
    }
  }, [location.state])
  
  const fetchData = async () => {
    try {
      const [patientsRes, drugsRes] = await Promise.all([
        getPatients(),
        getDrugs()
      ])
      
      const allPatients = patientsRes.data.results || patientsRes.data
      const allDrugs = drugsRes.data.results || drugsRes.data
      
      setPatients(allPatients)
      // Filter only drugs with dose_per_m2
      setDrugs(allDrugs.filter(drug => drug.dose_per_m2 !== null))
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    }
  }
  
  const handleCalculate = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient')
      return
    }
    
    if (!selectedDrug) {
      toast.error('Please select a drug')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await calculateDose({
        patient_id: selectedPatient,
        drug_id: selectedDrug
      })
      
      // Get patient data for display
      const patient = patients.find(p => p.id === parseInt(selectedPatient))
      
      setResult({
        ...response.data,
        height: patient.height,
        weight: patient.weight
      })
      toast.success('Dose calculated successfully')
    } catch (error) {
      console.error('Error calculating dose:', error)
      if (error.response?.status === 404) {
        toast.error('Patient or drug not found')
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Error calculating dose')
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">BSA-Based Dose Calculator</h1>
        
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Select Patient</label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} (Weight: {patient.weight}kg, Height: {patient.height}cm)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Select Drug (Chemotherapy)</label>
                <select
                  value={selectedDrug}
                  onChange={(e) => setSelectedDrug(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select Drug --</option>
                  {drugs.map(drug => (
                    <option key={drug.id} value={drug.id}>
                      {drug.name} ({drug.dose_per_m2} mg/m²)
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {loading ? 'Calculating...' : 'Calculate Dose'}
              </button>
            </div>
          </div>
          
          {result && (
            <DoseOutput
              bsa={result.bsa}
              drug_name={result.drug_name}
              dose_per_m2={result.dose_per_m2}
              recommended_dose={result.recommended_dose}
              height={result.height}
              weight={result.weight}
              patient_name={result.patient_name}
            />
          )}
          
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Info className="text-primary flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-primary mb-2">Formula Used:</h3>
                <div className="space-y-1 text-gray-700">
                  <p className="font-mono text-sm">BSA (m²) = √((Height in cm × Weight in kg) / 3600)</p>
                  <p className="font-mono text-sm">Recommended Dose = BSA × Dose per m²</p>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  The Mosteller formula is used for Body Surface Area calculation, which is the standard method for chemotherapy dosing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoseCalculatorPage
