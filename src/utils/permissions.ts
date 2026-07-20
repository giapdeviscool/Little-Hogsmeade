import type { SidebarNavKey } from '../types'
import { getAuthSession } from '../store/auth.store'

function resolveRole(roleName?: string | null): string {
  const name = (roleName || '').toLowerCase().trim()
  if (name.includes('owner')) return 'owner'
  if (name.includes('chain admin') || name === 'admin') return 'chain admin'
  if (name.includes('cashier')) return 'cashier'
  if (name.includes('staff') || name.includes('kitchen')) return 'staff'
  return ''
}

const SIDEBAR_PERMISSIONS: Record<string, SidebarNavKey[]> = {
  owner: ['dashboard', 'pos', 'operations', 'internal', 'owner', 'cms', 'loyalty', 'customers'],
  'chain admin': ['dashboard', 'pos', 'operations', 'internal', 'owner'],
  cashier: ['pos'],
  staff: ['operations', 'internal'],
}

const INTERNAL_TAB_PERMISSIONS: Record<string, string[]> = {
  owner: ['employees', 'shifts', 'schedule', 'attendance', 'payroll', 'inventory', 'categories', 'menuItems', 'toppingGroups', 'recipes', 'stock-conversion', 'expenses', 'finance', 'what-if'],
  'chain admin': ['employees', 'shifts', 'schedule', 'payroll', 'inventory', 'categories', 'menuItems', 'toppingGroups', 'recipes', 'stock-conversion', 'expenses', 'finance'],
  cashier: ['attendance', 'payroll'],
  staff: ['schedule', 'payroll', 'recipes', 'stock-conversion'],
}

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  owner: ['/admin/dashboard', '/admin/pos', '/admin/operations', '/admin/internal', '/admin/owner', '/admin/cms', '/admin/customers', '/admin/loyalty', '/admin/settings'],
  'chain admin': ['/admin/dashboard', '/admin/pos', '/admin/operations', '/admin/internal', '/admin/owner'],
  cashier: ['/pos', '/shift-opening', '/shift-closing', '/shift-resume', '/shift-overview', '/invoices'],
  staff: ['/admin/operations', '/admin/internal'],
}

export function canAccessSidebarItem(roleName: string | null | undefined, itemKey: string): boolean {
  const role = resolveRole(roleName)
  const allowed = SIDEBAR_PERMISSIONS[role]
  return allowed ? allowed.includes(itemKey as SidebarNavKey) : false
}

export function canAccessInternalTab(roleName: string | null | undefined, tabKey: string): boolean {
  const role = resolveRole(roleName)
  const allowed = INTERNAL_TAB_PERMISSIONS[role]
  return allowed ? allowed.includes(tabKey) : false
}

export function canAccessRoute(roleName: string | null | undefined, pathname: string): boolean {
  const role = resolveRole(roleName)
  const allowed = ROUTE_PERMISSIONS[role]
  return allowed ? allowed.some(prefix => pathname.startsWith(prefix)) : false
}

export function getUserBranchId(): string | null {
  const session = getAuthSession()
  if (!session?.user) return null
  const roleName = session.user.roleName || session.user.role || ''
  const role = resolveRole(roleName)
  if (role === 'owner') return null
  return session.user.branchId || null
}

export function isOwner(): boolean {
  const session = getAuthSession()
  const roleName = session?.user?.roleName || session?.user?.role || ''
  return resolveRole(roleName) === 'owner'
}

export function filterBranchesByRole(branches: { id: string }[]): { id: string }[] {
  const branchId = getUserBranchId()
  if (!branchId) return branches
  return branches.filter(b => b.id === branchId)
}

export function getRoleName(): string {
  const session = getAuthSession()
  return session?.user?.roleName || session?.user?.role || ''
}
