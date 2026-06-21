import { Outlet, useNavigate, Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'
import { clearAuthSession, getAuthSession } from '../store/auth.store'
import { ROUTES } from '../constants/routes'

export function AdminLayout() {
  const navigate = useNavigate()
  const session = getAuthSession()

  if (!session?.user) {
    return <Navigate to={ROUTES.login} replace />
  }

  const role = session.user.role || session.user.roleName || ''
  const isCustomer = role.toLowerCase() === 'customer'

  if (isCustomer) {
    return <Navigate to={ROUTES.customerHome} replace />
  }

  const logout = () => {
    clearAuthSession()
    navigate(ROUTES.login)
  }

  return (
    <div className="grid min-h-screen grid-cols-[290px_minmax(990px,1fr)] bg-white text-coffee">
      <Sidebar onLogout={logout} />
      <main className="min-w-0">
        <TopHeader />
        <div className="px-10 py-8"><Outlet /></div>
      </main>
    </div>
  )
}
