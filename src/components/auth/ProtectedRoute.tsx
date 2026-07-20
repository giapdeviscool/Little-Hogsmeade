import { Navigate, useLocation } from 'react-router-dom'
import { getAuthSession } from '../../store/auth.store'
import { canAccessRoute } from '../../utils/permissions'
import { ROUTES } from '../../constants/routes'

function getDefaultRoute(roleName: string): string {
  const n = roleName.toLowerCase().trim()
  if (n.includes('owner') || n.includes('chain admin') || n === 'admin') return '/admin/dashboard'
  if (n.includes('cashier') || n.includes('staff') || n.includes('kitchen')) return '/admin/operations'
  return ROUTES.login
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = getAuthSession()
  const location = useLocation()

  if (!session?.user) {
    return <Navigate to={ROUTES.login} replace />
  }

  const roleName = session.user.roleName || session.user.role || ''
  if (!canAccessRoute(roleName, location.pathname)) {
    return <Navigate to={getDefaultRoute(roleName)} replace />
  }

  return <>{children}</>
}
