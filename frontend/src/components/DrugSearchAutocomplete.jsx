import { useState, useEffect } from 'react'
import { getDrugs } from '../api/endpoints'
import { Search, X } from 'lucide-react'
import Loader from './Loader'

const DrugSearchAutocomplete = ({ onSelect, selectedDrugs = [] }) => {
  const [search, setSearch] = useState('')
  const [drugs, setDrugs] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (search.length === 0) {
      setDrugs([])
      setShowDropdown(false)
      return
    }
    
    const timer = setTimeout(() => {
      setLoading(true)
      getDrugs(search)
        .then(response => {
          const allDrugs = response.data.results || response.data
          // Filter out already selected drugs
          const filtered = allDrugs.filter(
            drug => !selectedDrugs.find(d => d.id === drug.id)
          )
          setDrugs(filtered)
          setShowDropdown(true)
        })
        .catch(error => console.error('Error fetching drugs:', error))
        .finally(() => setLoading(false))
    }, 300)
    
    return () => clearTimeout(timer)
  }, [search, selectedDrugs])
  
  const handleSelect = (drug) => {
    onSelect(drug)
    setSearch('')
    setShowDropdown(false)
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }
  
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search drugs..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4">
              <Loader size="sm" />
            </div>
          ) : drugs.length === 0 ? (
            <div className="px-4 py-3 text-gray-600 text-center">No drugs found</div>
          ) : (
            drugs.map(drug => (
              <div
                key={drug.id}
                onClick={() => handleSelect(drug)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                <div className="font-semibold text-gray-800">{drug.name}</div>
                <div className="text-sm text-gray-600">{drug.category}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default DrugSearchAutocomplete
