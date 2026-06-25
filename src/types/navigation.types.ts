export type TabKey = 'dashboard' | 'pos' | 'operations' | 'internal' | 'owner' | 'cms' | 'customers' | 'settings'

export type SidebarNavKey = Exclude<TabKey, 'settings'>

export type NavIconKey = 'grid' | 'cart' | 'service' | 'users' | 'building' | 'globe' | 'loyalty' | 'settings' | 'logout' | 'bell' | 'search'

export type NavItem = {
  key: SidebarNavKey
  icon: NavIconKey
  href?: string
  subItems?: { key: string; label: string }[]
}
