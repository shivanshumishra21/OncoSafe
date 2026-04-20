import { useState, useEffect } from 'react'
import RoleBasedNavbar from '../../components/RoleBasedNavbar'
import { getDrugs } from '../../api/endpoints'
import toast from 'react-hot-toast'
import { Pill, Search } from 'lucide-react'

const AdminDrugsPage = () => {
  const [drugs, setDrugs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    document.title = 'Manage Drugs - OncoSafe Admin'
    fetchDrugs()
  }, [])
  
  const fetchDrugs = async (search = '') => {
    try {
      setLoading(true)
      const response = await getDrugs(search)
      setDrugs(response.data.results || response.data)
    } catch (error) {
      toast.error('Failed to load drugs')
      console.error('Error fetching drugs:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSearch = (value) => {
    setSearchTerm(value)
    // Debounce search to avoid too many API calls
    if (value.length >= 2) {
      fetchDrugs(value)
    } else if (value.length === 0) {
      fetchDrugs()
    }
  }
  
  const handleAddDrug = () => {
    toast('Add Drug functionality coming soon', { icon: '🚧' })
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <RoleBasedNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Drugs</h1>
          <button
            onClick={handleAddDrug}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition"
          >
            <Pill size={20} />
            Add Drug
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search drugs by name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-600">Loading drugs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Drug Name</th>
                    <th className="text-left py-3 px-4">RxCUI</th>
                    <th className="text-left py-3 px-4">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {drugs.length > 0 ? (
                    drugs.map((drug) => (
                      <tr key={drug.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{drug.name}</td>
                        <td className="py-3 px-4 text-gray-600">{drug.rxcui || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                            {drug.category || 'Oncology'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-gray-500">
                        {searchTerm ? 'No drugs found matching your search' : 'No drugs available'}
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

export default AdminDrugsPage
