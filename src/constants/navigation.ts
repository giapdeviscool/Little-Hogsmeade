import type { NavItem } from '../types'

export type { TabKey } from '../types'

export const navItems: NavItem[] = [
  { key: 'dashboard', icon: 'grid' },
  { key: 'pos', icon: 'cart' },
  {
    key: 'operations',
    icon: 'service',
    subItems: [
      { key: 'tables', label: 'Danh sách bàn' },
      { key: 'reservations', label: 'Quản lý đặt bàn' },
    ]
  },
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
      { key: 'expenses', label: 'Quản lý Phiếu chi' },
      { key: 'finance', label: 'Báo cáo Tài chính' },
      { key: 'what-if', label: 'Mô phỏng What-if' },
    ]
  },
  { key: 'owner', icon: 'building', roles: ['Chain Owner'] },
  { key: 'cms', icon: 'globe', roles: ['Chain Owner'] },
  { key: 'loyalty', icon: 'loyalty' },
  { key: 'customers', icon: 'users' },
]
