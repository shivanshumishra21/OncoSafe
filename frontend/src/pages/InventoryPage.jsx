import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import InventoryTable from '../components/InventoryTable'
import { getInventory, getInventoryAlerts } from '../api/endpoints'
import toast from 'react-hot-toast'
import { AlertTriangle, Package, Info } from 'lucide-react'
import Loader from '../components/Loader'

const InventoryPage = () => {
  const [inventory, setInventory] = useState([])
  const [alerts, setAlerts] = useState({ expiring_soon: [], low_stock: [] })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, expiring, low_stock
  
  useEffect(() => {
    document.title = 'OncoSafe – Inventory'
    fetchData()
  }, [])
  
  const fetchData = async () => {
    try {
      const [inventoryRes, alertsRes] = await Promise.all([
        getInventory(),
        getInventoryAlerts()
      ])
      
      setInventory(inventoryRes.data.results || inventoryRes.data)
      setAlerts(alertsRes.data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }
  
  const getFilteredInventory = () => {
    if (filter === 'expiring') {
      const expiringIds = alerts.expiring_soon.map(item => item.id)
      return inventory.filter(item => expiringIds.includes(item.id))
    }
    if (filter === 'low_stock') {
      const lowStockIds = alerts.low_stock.map(item => item.id)
      return inventory.filter(item => lowStockIds.includes(item.id))
    }
    return inventory
  }
  
  const totalAlerts = alerts.expiring_soon.length + alerts.low_stock.length
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Inventory Management</h1>
        
        {/* Alert Banner */}
        {totalAlerts > 0 && (
          <div className="bg-warning text-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} />
              <span className="font-semibold">
                ⚠️ {alerts.expiring_soon.length} items expiring soon | {alerts.low_stock.length} items low on stock
              </span>
            </div>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="bg-white text-warning px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              View Details
            </button>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Items ({inventory.length})
            </button>
            <button
              onClick={() => setFilter('expiring')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'expiring'
                  ? 'bg-warning text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Expiring Soon ({alerts.expiring_soon.length})
            </button>
            <button
              onClick={() => setFilter('low_stock')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'low_stock'
                  ? 'bg-orange-500 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Low Stock ({alerts.low_stock.length})
            </button>
          </div>
        </div>
        
        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {filter === 'all' ? 'All Inventory' : 
             filter === 'expiring' ? 'Expiring Soon' : 
             'Low Stock Items'}
          </h2>
          
          {loading ? (
            <div className="py-12">
              <Loader size="lg" text="Loading inventory..." />
            </div>
          ) : (
            <InventoryTable inventory={getFilteredInventory()} />
          )}
        </div>
        
        {/* Alert Details */}
        {(alerts.expiring_soon.length > 0 || alerts.low_stock.length > 0) && (
          <div className="space-y-6">
            {alerts.expiring_soon.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-warning" size={24} />
                  Expiring Soon (Within 30 Days)
                </h2>
                <div className="space-y-2">
                  {alerts.expiring_soon.map((item, index) => (
                    <div
                      key={index}
                      className="bg-yellow-50 border-l-4 border-warning p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{item.drug_name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} units • Expires: {item.expiry_date}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-warning text-white rounded-full text-sm font-semibold">
                          Expiring
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {alerts.low_stock.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Package className="text-orange-500" size={24} />
                  Low Stock (Less than 10 units)
                </h2>
                <div className="space-y-2">
                  {alerts.low_stock.map((item, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{item.drug_name}</p>
                          <p className="text-sm text-gray-600">
                            Only {item.quantity} units remaining
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-semibold">
                          Low Stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Info Panel */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mt-6">
          <div className="flex items-start gap-3">
            <Info className="text-primary flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-primary mb-2">Alert Thresholds:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Expiry Alert: Items expiring within 30 days</li>
                <li>Low Stock Alert: Items with quantity less than 10 units</li>
                <li>Critical: Items expiring within 7 days</li>
                <li>Expired: Items past their expiry date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryPage
