import RoleBasedNavbar from '../../components/RoleBasedNavbar'
import DoseCalculatorPage from '../DoseCalculatorPage'

const AdminDosePage = () => {
  return (
    <div>
      <RoleBasedNavbar />
      <DoseCalculatorPage isAdmin={true} />
    </div>
  )
}

export default AdminDosePage
