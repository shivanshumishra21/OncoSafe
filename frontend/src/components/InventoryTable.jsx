import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const InventoryTable = ({ inventory }) => {
  const getStatus = (item) => {
    const today = new Date()
    const expiry = new Date(item.expiry_date)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return { label: 'Expired', color: 'bg-danger text-white', priority: 1 }
    }
    if (daysUntilExpiry < 7) {
      return { label: 'Critical', color: 'bg-danger text-white', priority: 2 }
    }
    if (daysUntilExpiry < 30) {
      return { label: 'Expiring Soon', color: 'bg-warning text-white', priority: 3 }
    }
    if (item.quantity < 10) {
      return { label: 'Low Stock', color: 'bg-orange-500 text-white', priority: 4 }
    }
    return { label: 'OK', color: 'bg-success text-white', priority: 5 }
  }
  
  const getDaysRemaining = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    return days
  }
  
  if (!inventory || inventory.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p className="text-lg">No inventory items found</p>
        <p className="text-sm mt-2">Add items to start tracking your pharmacy inventory</p>
      </div>
    )
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Drug Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Expiry Date</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Storage</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {inventory.map((item) => {
            const status = getStatus(item)
            const daysRemaining = getDaysRemaining(item.expiry_date)
            
            return (
              <tr key={item.id} className={status.priority <= 3 ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
                  {item.drug_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {item.category || 'N/A'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${item.quantity < 10 ? 'text-danger font-bold' : 'text-gray-800'}`}>
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={daysRemaining < 30 ? 'text-warning font-semibold' : 'text-gray-800'}>
                    {item.expiry_date}
                  </div>
                  {daysRemaining >= 0 && daysRemaining < 30 && (
                    <div className="text-xs text-gray-600 mt-1">
                      {daysRemaining} days remaining
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {item.storage_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryTable
