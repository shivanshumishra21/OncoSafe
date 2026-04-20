import RoleBasedNavbar from '../../components/RoleBasedNavbar'
import PrescriptionCheckerPage from '../PrescriptionCheckerPage'

const AdminPrescriptionPage = () => {
  return (
    <div>
      <RoleBasedNavbar />
      <PrescriptionCheckerPage isAdmin={true} />
    </div>
  )
}

export default AdminPrescriptionPage
