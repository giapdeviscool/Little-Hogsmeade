import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'
import type { TabKey } from '../constants/navigation'
import { clearAuthSession } from '../store/auth.store'

export function AdminLayout({ children, active, onSelect }: { children: ReactNode; active: TabKey; onSelect: (key: TabKey) => void }) {
  const navigate = useNavigate()
  const logout = () => {
    clearAuthSession()
    navigate('/login')
  }

  return (
    <div className="grid min-h-screen grid-cols-[290px_minmax(990px,1fr)] bg-white text-coffee">
      <Sidebar active={active} onSelect={onSelect} onLogout={logout} />
      <main className="min-w-0">
        <TopHeader />
        <div className="px-10 py-8">{children}</div>
      </main>
    </div>
  )
}
