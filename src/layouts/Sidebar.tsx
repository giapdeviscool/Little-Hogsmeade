import { navItems, type TabKey } from '../constants/navigation'
import { Icon } from '../components/icons/Icon'
import { cn } from '../utils/cn'
import { useLocale } from '../hooks/useLocale'

export function Sidebar({ active, onSelect, onLogout }: { active: TabKey; onSelect: (key: TabKey) => void; onLogout: () => void }) {
  const { t } = useLocale()
  const navButton = 'flex h-11 w-full items-center gap-3 rounded-[13px] px-4 text-left text-sm font-semibold transition hover:bg-white/65'

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
        {navItems.map((item) => (
          <button key={item.key} type="button" onClick={() => onSelect(item.key)} className={cn(navButton, active === item.key ? 'bg-latte text-white shadow-[0_10px_24px_rgba(74,53,37,0.16)]' : 'text-coffee')}>
            <Icon name={item.icon} />
            <span>{t.navigation[item.key]}</span>
          </button>
        ))}
      </nav>

      <nav className="mt-auto flex flex-col gap-2 border-t border-line pt-5">
        <button type="button" onClick={() => onSelect('settings')} className={cn(navButton, active === 'settings' ? 'bg-latte text-white' : 'text-coffee')}>
          <Icon name="settings" />
          {t.common.settings}
        </button>
        <button type="button" onClick={onLogout} className={`${navButton} text-coffee`}>
          <Icon name="logout" />
          {t.common.logout}
        </button>
      </nav>
    </aside>
  )
}
