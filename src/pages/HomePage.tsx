import type { ReactNode } from 'react'
import { AdminLayout } from '../layouts/AdminLayout'
import { useAdminTab } from '../hooks/useAdminTab'
import type { TabKey } from '../constants/navigation'
import { DashboardPage } from './dashboard/DashboardPage'
import { POSPage } from './pos/POSPage'
import { OperationsPage } from './operations/OperationsPage'
import { InternalPage } from './internal/InternalPage'
import { OwnerPage } from './owner/OwnerPage'
import { CMSPage } from './cms/CMSPage'
import { SettingsPage } from './settings/SettingsPage'

function MainView({ active }: { active: TabKey }) {
  const views: Record<TabKey, ReactNode> = {
    dashboard: <DashboardPage />,
    pos: <POSPage />,
    operations: <OperationsPage />,
    internal: <InternalPage />,
    owner: <OwnerPage />,
    cms: <CMSPage />,
    settings: <SettingsPage />,
  }

  return views[active]
}

export function HomePage() {
  const [active, setActive] = useAdminTab('dashboard')

  return (
    <AdminLayout active={active} onSelect={setActive}>
      <MainView active={active} />
    </AdminLayout>
  )
}
