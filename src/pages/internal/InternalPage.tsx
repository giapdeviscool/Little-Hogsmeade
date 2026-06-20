import { useState } from 'react'
import { cn } from '../../utils/cn'
import { InventoryView } from './components/InventoryView'
import { EmployeeList } from './components/EmployeeList'
import { ShiftManagement } from './components/ShiftManagement'
import { ScheduleView } from './components/ScheduleView'
import { AttendanceKiosk } from './components/AttendanceKiosk'
import { PayrollView } from './components/PayrollView'
import { CategoryList } from './components/CategoryList'
import { MenuItemList } from './components/MenuItemList'
import { ToppingGroups } from './components/ToppingGroups'

type InternalTab = 'employees' | 'inventory' | 'shifts' | 'schedule' | 'attendance' | 'payroll' | 'categories' | 'menuItems' | 'toppingGroups'

export function InternalPage() {
  const [activeTab, setActiveTab] = useState<InternalTab>('employees')

  const tabs: { key: InternalTab; label: string }[] = [
    { key: 'employees', label: 'Nhân sự' },
    { key: 'shifts', label: 'Ca làm việc' },
    { key: 'schedule', label: 'Lịch làm việc' },
    { key: 'attendance', label: 'Chấm công' },
    { key: 'payroll', label: 'Bảng lương' },
    { key: 'inventory', label: 'Tồn kho' },
    { key: 'categories', label: 'Danh mục menu' },
    { key: 'menuItems', label: 'Danh sách món ăn' },
    { key: 'toppingGroups', label: 'Nhóm Topping' },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Sub-navigation */}
      <div className="mb-6 flex gap-4 border-b border-line pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 font-bold text-sm transition-colors whitespace-nowrap',
              activeTab === tab.key ? 'border-b-2 border-coffee text-coffee' : 'text-muted hover:text-black'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
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
      </div>
    </div>
  )
}
