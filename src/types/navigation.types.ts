export type TabKey = 'dashboard' | 'pos' | 'operations' | 'internal' | 'owner' | 'cms' | 'customers' | 'settings' | 'loyalty'

export type SidebarNavKey = Exclude<TabKey, 'settings'>

export type NavIconKey = 'grid' | 'cart' | 'service' | 'users' | 'building' | 'globe' | 'loyalty' | 'settings' | 'logout' | 'bell' | 'search' | 'customers' | 'menu' | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'arrow-down' | 'plus' | 'minus' | 'check' | 'close' | 'edit' | 'trash' | 'eye' | 'eye-off' | 'download' | 'upload'

export type NavItem = {
  key: SidebarNavKey
  icon: NavIconKey
  href?: string
  subItems?: { key: string; label: string }[]
}
