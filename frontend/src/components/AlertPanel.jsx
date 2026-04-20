import { AlertTriangle, CheckCircle } from 'lucide-react'

const AlertPanel = ({ interactions = [], toxicityAlerts = [] }) => {
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'dangerous':
        return 'bg-red-100 border-red-500 text-red-800'
      case 'moderate':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      case 'safe':
        return 'bg-green-100 border-green-500 text-green-800'
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800'
    }
  }

  const getSeverityBadge = (severity) => {
    const colors = {
      dangerous: 'bg-danger text-white',
      moderate: 'bg-warning text-white',
      safe: 'bg-success text-white'
    }
    return colors[severity?.toLowerCase()] || 'bg-gray-500 text-white'
  }

  return (
    <div className="space-y-6">
      {/* Interactions Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">Drug Interactions</h3>
        {interactions.length === 0 ? (
          <div className="bg-green-100 border-l-4 border-success p-4 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-success" size={24} />
            <span className="text-success font-semibold">✓ No interactions detected</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Drug Pair</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {interactions.map((interaction, index) => (
                  <tr key={index} className={getSeverityColor(interaction.severity)}>
                    <td className="px-4 py-3 font-semibold">{interaction.drug_pair}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityBadge(interaction.severity)}`}>
                        {interaction.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">{interaction.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toxicity Alerts Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">Patient-Specific Toxicity Alerts</h3>
        {toxicityAlerts.length === 0 ? (
          <div className="bg-green-100 border-l-4 border-success p-4 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-success" size={24} />
            <span className="text-success font-semibold">✓ No toxicity alerts</span>
          </div>
        ) : (
          <div className="space-y-2">
            {toxicityAlerts.map((alert, index) => (
              <div key={index} className="bg-orange-50 border-l-4 border-warning p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-warning flex-shrink-0 mt-0.5" size={20} />
                <span className="text-gray-800">{alert}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertPanel
