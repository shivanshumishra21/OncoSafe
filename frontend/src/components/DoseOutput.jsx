const DoseOutput = ({ bsa, drug_name, dose_per_m2, recommended_dose, height, weight, patient_name }) => {
  if (!bsa) return null
  
  return (
    <div className="bg-green-50 border-2 border-success rounded-xl p-6 animate-fade-in">
      <h3 className="text-2xl font-bold text-success mb-6">Dose Calculation Result</h3>
      
      <div className="space-y-4">
        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-green-200">
          <div>
            <p className="text-gray-600 text-sm">Patient</p>
            <p className="font-semibold text-gray-800">{patient_name}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Drug</p>
            <p className="font-semibold text-gray-800">{drug_name}</p>
          </div>
        </div>
        
        {/* BSA Calculation */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-2">BSA Calculation</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-700">Height: <span className="font-semibold">{height}cm</span></span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-700">Weight: <span className="font-semibold">{weight}kg</span></span>
          </div>
          <p className="text-xl font-bold text-primary mt-2">BSA = {bsa} m²</p>
        </div>
        
        {/* Dose Calculation */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-gray-600 text-sm">Dose per m²</p>
          <p className="font-semibold text-gray-800">{dose_per_m2} mg/m²</p>
        </div>
        
        {/* Final Dose */}
        <div className="bg-success text-white rounded-lg p-6 text-center">
          <p className="text-sm opacity-90 mb-1">Recommended Dose</p>
          <p className="text-4xl font-bold">{recommended_dose} mg</p>
        </div>
      </div>
    </div>
  )
}

export default DoseOutput
