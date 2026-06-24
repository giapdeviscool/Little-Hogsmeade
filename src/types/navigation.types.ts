export type TabKey = 'dashboard' | 'pos' | 'operations' | 'internal' | 'owner' | 'cms' | 'settings'

export type SidebarNavKey = Exclude<TabKey, 'settings'>

export type NavIconKey = 'grid' | 'cart' | 'service' | 'users' | 'building' | 'globe' | 'settings' | 'logout' | 'bell' | 'search'

export type NavItem = {
  key: SidebarNavKey
  icon: NavIconKey
  subItems?: { key: string; label: string }[]
}
