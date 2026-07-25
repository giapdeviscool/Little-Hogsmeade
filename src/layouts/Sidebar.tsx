import { useState } from 'react'
import { navItems } from '../constants/navigation'
import { Icon } from '../components/icons/Icon'
import { cn } from '../utils/cn'
import { useLocale } from '../hooks/useLocale'
import { Link, useLocation } from 'react-router-dom'
import { getAuthSession } from '../store/auth.store'
import { canAccessSidebarItem, canAccessInternalTab } from '../utils/permissions'

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { t } = useLocale()
  const location = useLocation()
  const session = getAuthSession()
  const user = session?.user
  const roleName = session?.user?.roleName || session?.user?.role || ''
  const displayName = user?.fullName || user?.name || 'Admin'
  const initial = displayName.charAt(0).toUpperCase()
  const navButton = 'flex h-11 w-full items-center rounded-[13px] text-left text-sm font-semibold transition overflow-hidden'

  const [collapsedKeys, setCollapsedKeys] = useState<string[]>([])
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isExpanded = isPinned || isHovered
  const filteredNavItems = navItems.filter(item => canAccessSidebarItem(roleName, item.key))

  const handleParentClick = (e: React.MouseEvent, key: string, isActive: boolean, hasSubItems: boolean) => {
    if (hasSubItems) {
      if (isActive) {
        e.preventDefault()
        setCollapsedKeys(prev =>
          prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        )
      } else {
        setCollapsedKeys(prev => prev.filter(k => k !== key))
      }
    }
  }

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-line bg-beige py-7 text-coffee overflow-y-auto overflow-x-hidden transition-all duration-300 z-50 shrink-0",
        isExpanded ? "w-[290px] px-[18px]" : "w-[72px] px-2",
        "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-coffee/20 [&::-webkit-scrollbar-thumb]:rounded-full"
      )}
    >
      <div className={cn("pb-6 flex items-start w-full", isExpanded ? "justify-between gap-2" : "justify-center")}>
        <div className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap min-w-0", isExpanded ? "flex-1 opacity-100" : "opacity-0 w-0")}>
          <div className="text-2xl font-semibold leading-none tracking-[-0.02em] truncate">{t.brand.name}</div>
          <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted truncate">{t.brand.tagline}</div>
        </div>
        <button 
          onClick={() => setIsPinned(!isPinned)} 
          className={cn("text-coffee/50 hover:bg-black/5 hover:text-coffee rounded-lg transition shrink-0 flex items-center justify-center", isExpanded ? "p-1.5" : "p-2")} 
          title={isPinned ? "Thu gọn" : "Ghim"}
        >
          <Icon name={isPinned ? "chevronLeft" : "menu"} />
        </button>
      </div>

      <div className={cn("mb-5 flex flex-col rounded-[14px] bg-white py-3.5 shadow-soft w-full transition-all duration-300", isExpanded ? "px-3" : "px-2")}>
        <div className={cn("flex items-center", isExpanded ? "gap-3" : "justify-center")}>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-coffee font-bold text-white">{initial}</div>
          <div className={cn("min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap", isExpanded ? "flex-1 opacity-100" : "opacity-0 w-0")}>
            <span className="block text-xs text-muted">Xin chào,</span>
            <strong className="block text-[15px] truncate max-w-[120px]" title={displayName}>{displayName}</strong>
          </div>
        </div>
        {(!roleName?.toLowerCase().includes('owner')) && (user?.branchName || user?.branch) && (
          <div className={cn("flex items-center gap-1.5 rounded-lg bg-beige/50 text-xs font-semibold text-coffee/90 border border-coffee/5 overflow-hidden transition-all duration-300 whitespace-nowrap", isExpanded ? "mt-2.5 px-2 py-1.5 opacity-100" : "mt-0 h-0 opacity-0 border-none")}>
            <div className="scale-75 origin-left shrink-0"><Icon name="building" /></div>
            <span className="truncate" title={user.branchName || user.branch}>{user.branchName || user.branch}</span>
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-2">
        {filteredNavItems.map((item) => {
          const href = item.href ?? `/admin/${item.key}`
          const isActive = location.pathname.startsWith(href)
          const isSubMenuExpanded = isActive && !collapsedKeys.includes(item.key)
          return (
            <div key={item.key} className="flex flex-col">
              <Link
                to={`/admin/${item.href || item.key}`}
                onClick={(e) => handleParentClick(e, item.key, isActive, !!item.subItems)}
                className={cn(navButton, isActive ? 'bg-latte text-white shadow-[0_10px_24px_rgba(74,53,37,0.16)]' : 'text-coffee hover:bg-white/65', isExpanded ? 'px-3.5 gap-3' : 'justify-center px-0')}
              >
                <div className="shrink-0 flex items-center justify-center"><Icon name={item.icon} /></div>
                <span className={cn("whitespace-nowrap overflow-hidden transition-all duration-300", isExpanded ? "flex-1 opacity-100" : "opacity-0 w-0")}>
                  {t.navigation[item.key]}
                </span>
                {item.subItems && (
                  <span className={cn('transition-transform duration-200 shrink-0 overflow-hidden', isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0', isSubMenuExpanded ? 'rotate-180' : '')}>
                    <Icon name="chevronDown" />
                  </span>
                )}
              </Link>

              {item.subItems && isSubMenuExpanded && isExpanded && [true].map(function() {
                const subs = item.subItems!
                const allowedSubItems = subs.filter(function(sub) {
                  if (item.key === 'internal') return canAccessInternalTab(roleName, sub.key)
                  return true
                })
                if (allowedSubItems.length === 0) return null
                return (
                <div className="mt-1 flex flex-col gap-1 pl-11 pr-2">
                  {allowedSubItems.map(function(sub) {
                    const searchParams = new URLSearchParams(location.search)
                    const currentTab = searchParams.get('tab') || allowedSubItems[0]?.key
                    const isSubActive = currentTab === sub.key

                    return (
                      <Link
                        key={sub.key}
                        to={`/admin/${item.key}?tab=${sub.key}`}
                        className={cn(
                          'rounded-[10px] px-3 py-2 text-sm font-semibold transition-colors',
                          isSubActive ? 'bg-coffee/10 text-coffee' : 'text-coffee/70 hover:bg-white/50 hover:text-coffee'
                        )}
                      >
                        {sub.label}
                      </Link>
                    )
                  })}
                </div>
              )})[0]}
            </div>
          )
        })}
      </nav>

      <nav className="mt-auto flex flex-col gap-2 border-t border-line pt-5 w-full">
        {(((roleName||'').toLowerCase().includes('owner')) || (roleName||'').toLowerCase().includes('chain admin')) && (
          <Link to="/admin/settings" className={cn(navButton, location.pathname.includes('/admin/settings') ? 'bg-latte text-white' : 'text-coffee hover:bg-white/65', isExpanded ? 'px-3.5 gap-3' : 'justify-center px-0')}>
            <div className="shrink-0 flex items-center justify-center"><Icon name="settings" /></div>
            <span className={cn("whitespace-nowrap overflow-hidden transition-all duration-300", isExpanded ? "flex-1 opacity-100" : "opacity-0 w-0")}>{t.common.settings}</span>
          </Link>
        )}
        <button type="button" onClick={onLogout} className={cn(navButton, 'text-coffee hover:bg-white/65', isExpanded ? 'px-3.5 gap-3' : 'justify-center px-0')}>
          <div className="shrink-0 flex items-center justify-center"><Icon name="logout" /></div>
          <span className={cn("whitespace-nowrap overflow-hidden transition-all duration-300", isExpanded ? "flex-1 opacity-100" : "opacity-0 w-0")}>{t.common.logout}</span>
        </button>
      </nav>
    </aside>
  )
}