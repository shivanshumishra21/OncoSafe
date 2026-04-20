const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    orange: 'text-orange-600 bg-orange-50'
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colorClasses[color]?.split(' ')[0] || 'text-gray-800'}`}>
            {value !== undefined && value !== null ? value : '—'}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color] || 'bg-gray-50'}`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
    </div>
  )
}

export default StatCard
