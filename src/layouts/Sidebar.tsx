import { navItems } from '../constants/navigation'
import { Icon } from '../components/icons/Icon'
import { cn } from '../utils/cn'
import { useLocale } from '../hooks/useLocale'
import { Link, useLocation } from 'react-router-dom'

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { t } = useLocale()
  const location = useLocation()
  const navButton = 'flex h-11 w-full items-center gap-3 rounded-[13px] px-4 text-left text-sm font-semibold transition'

  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-line bg-beige px-[18px] py-7 text-coffee">
      <div className="px-3 pb-6">
        <div className="text-[27px] font-semibold leading-none tracking-[-0.02em]">{t.brand.name}</div>
        <div className="mt-3 text-xs font-semibold uppercase tracking-[0.34em] text-muted">{t.brand.tagline}</div>
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-[14px] bg-white px-3 py-3.5 shadow-soft">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-coffee font-bold text-white">A</div>
        <div>
          <span className="block text-xs text-muted">Hello,</span>
          <strong className="block text-[15px]">Admin</strong>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname.includes(`/admin/${item.key}`)
          return (
            <Link key={item.key} to={`/admin/${item.key}`} className={cn(navButton, isActive ? 'bg-latte text-white shadow-[0_10px_24px_rgba(74,53,37,0.16)]' : 'text-coffee hover:bg-white/65')}>
              <Icon name={item.icon} />
              <span>{t.navigation[item.key]}</span>
            </Link>
          )
        })}
      </nav>

      <nav className="mt-auto flex flex-col gap-2 border-t border-line pt-5">
        <Link to="/admin/settings" className={cn(navButton, location.pathname.includes('/admin/settings') ? 'bg-latte text-white' : 'text-coffee hover:bg-white/65')}>
          <Icon name="settings" />
          {t.common.settings}
        </Link>
        <button type="button" onClick={onLogout} className={`${navButton} text-coffee hover:bg-white/65`}>
          <Icon name="logout" />
          {t.common.logout}
        </button>
      </nav>
    </aside>
  )
}
