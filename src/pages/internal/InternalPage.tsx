import { useSearchParams } from 'react-router-dom'
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

export function InternalPage() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'employees'

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
      </div>
    </div>
  )
}
