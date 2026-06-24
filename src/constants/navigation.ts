import { ROUTES } from './routes'
import type { NavItem } from '../types'

export type { TabKey } from '../types'

export const navItems: NavItem[] = [
  { key: 'dashboard', icon: 'grid' },
  { key: 'pos', icon: 'cart' },
  { key: 'operations', icon: 'service' },
  { 
    key: 'internal', 
    icon: 'users',
    subItems: [
      { key: 'employees', label: 'Nhân sự' },
      { key: 'shifts', label: 'Ca làm việc' },
      { key: 'schedule', label: 'Lịch làm việc' },
      { key: 'attendance', label: 'Chấm công' },
      { key: 'payroll', label: 'Bảng lương' },
      { key: 'inventory', label: 'Tồn kho' },
      { key: 'categories', label: 'Danh mục menu' },
      { key: 'menuItems', label: 'Danh sách món ăn' },
      { key: 'toppingGroups', label: 'Nhóm Topping' },
      { key: 'recipes', label: 'Công thức BOM' },
      { key: 'stock-conversion', label: 'Chế biến TP' },
    ]
  },
  { key: 'owner', icon: 'building' },
  { key: 'cms', icon: 'globe' },
  { key: 'loyalty', icon: 'loyalty', href: ROUTES.adminLoyaltyCustomers },
]
