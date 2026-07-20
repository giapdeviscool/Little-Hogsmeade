import { useSearchParams, Navigate } from 'react-router-dom'
import { InventoryView } from './components/InventoryView'
import { EmployeeList } from './components/EmployeeList'
import { ShiftManagement } from './components/ShiftManagement'
import { ScheduleView } from './components/ScheduleView'
import { AttendanceKiosk } from './components/AttendanceKiosk'
import { PayrollView } from './components/PayrollView'
import { CategoryList } from './components/CategoryList'
import { MenuItemList } from './components/MenuItemList'
import { ToppingGroups } from './components/ToppingGroups'
import { RecipesList } from './components/RecipesList'
import { StockConversion } from './components/StockConversion'
import { ExpenseManagement } from './components/ExpenseManagement'
import { FinancialDashboard } from './components/FinancialDashboard'
import { WhatIfSimulator } from './components/WhatIfSimulator'
import { getAuthSession } from '../../store/auth.store'
import { canAccessInternalTab } from '../../utils/permissions'

const ALL_TABS = [
  'employees', 'shifts', 'schedule', 'attendance', 'payroll',
  'inventory', 'categories', 'menuItems', 'toppingGroups',
  'recipes', 'stock-conversion', 'expenses', 'finance', 'what-if',
]

export function InternalPage() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'employees'
  const session = getAuthSession()
  const roleName = session?.user?.roleName || session?.user?.role || ''

  if (!canAccessInternalTab(roleName, activeTab)) {
    const firstAllowed = ALL_TABS.find(tab => canAccessInternalTab(roleName, tab)) || 'employees'
    return <Navigate to={`/admin/internal?tab=${firstAllowed}`} replace />
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        {activeTab === 'employees' && <EmployeeList />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'shifts' && <ShiftManagement />}
        { activeTab === 'schedule' && <ScheduleView /> }
        { activeTab === 'attendance' && <AttendanceKiosk /> }
        { activeTab === 'payroll' && <PayrollView /> }
        { activeTab === 'categories' && <CategoryList /> }
        { activeTab === 'menuItems' && <MenuItemList /> }
        { activeTab === 'toppingGroups' && <ToppingGroups /> }
        { activeTab === 'recipes' && <RecipesList /> }
        { activeTab === 'stock-conversion' && <StockConversion /> }
        { activeTab === 'expenses' && <ExpenseManagement /> }
        { activeTab === 'finance' && <FinancialDashboard /> }
        { activeTab === 'what-if' && <WhatIfSimulator /> }
      </div>
    </div>
  )
}
