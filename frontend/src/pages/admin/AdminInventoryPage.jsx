import { useState, useEffect } from 'react'
import RoleBasedNavbar from '../../components/RoleBasedNavbar'
import { getInventory } from '../../api/endpoints'
import toast from 'react-hot-toast'
import { Package, Plus, AlertTriangle } from 'lucide-react'

const AdminInventoryPage = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    document.title = 'Manage Inventory - OncoSafe Admin'
    fetchInventory()
  }, [])
  
  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await getInventory()
      setInventory(response.data.results || response.data)
    } catch (error) {
      toast.error('Failed to load inventory')
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddInventory = () => {
    toast('Add Inventory functionality coming soon', { icon: '🚧' })
  }
  
  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  
  // Get expiry badge based on days remaining
  const getExpiryBadge = (expiryDate) => {
    const daysRemaining = getDaysUntilExpiry(expiryDate)
    
    if (daysRemaining < 0) {
      return (
        <span className="px-2 py-1 rounded text-sm bg-red-600 text-white font-semibold">
          Expired
        </span>
      )
    } else if (daysRemaining <= 7) {
      return (
        <span className="px-2 py-1 rounded text-sm bg-red-500 text-white font-semibold">
          {daysRemaining} days left
        </span>
      )
    } else if (daysRemaining <= 30) {
      return (
        <span className="px-2 py-1 rounded text-sm bg-yellow-500 text-white font-semibold">
          {daysRemaining} days left
        </span>
      )
    } else {
      return (
        <span className="px-2 py-1 rounded text-sm bg-green-500 text-white">
          {daysRemaining} days left
        </span>
      )
    }
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <RoleBasedNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Inventory</h1>
          <button
            onClick={handleAddInventory}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition"
          >
            <Plus size={20} />
            Add Inventory
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-600">Loading inventory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Drug Name</th>
                    <th className="text-left py-3 px-4">Quantity</th>
                    <th className="text-left py-3 px-4">Storage Type</th>
                    <th className="text-left py-3 px-4">Expiry Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length > 0 ? (
                    inventory.map((item) => {
                      const daysRemaining = getDaysUntilExpiry(item.expiry_date)
                      const isExpiringSoon = daysRemaining <= 30 && daysRemaining >= 0
                      const isExpired = daysRemaining < 0
                      
                      return (
                        <tr 
                          key={item.id} 
                          className={`border-b hover:bg-gray-50 ${
                            isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {(isExpired || isExpiringSoon) && (
                                <AlertTriangle 
                                  size={18} 
                                  className={isExpired ? 'text-red-600' : 'text-yellow-600'} 
                                />
                              )}
                              <span className="font-medium">{item.drug_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.quantity}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                              {item.storage_type || 'Standard'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {formatDate(item.expiry_date)}
                          </td>
                          <td className="py-3 px-4">
                            {getExpiryBadge(item.expiry_date)}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">
                        <Package size={48} className="mx-auto mb-2 text-gray-400" />
                        <p>No inventory items available</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminInventoryPage
