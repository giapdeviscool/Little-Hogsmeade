import { Icon } from '../components/icons/Icon'
import { LanguageSwitch } from '../components/ui/LanguageSwitch'
import { useLocale } from '../hooks/useLocale'
import { useLocation } from 'react-router-dom'

export function TopHeader() {
  const { t } = useLocale()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-20 flex h-[82px] items-center gap-6 border-b border-line bg-white px-10">
      <label className="flex h-[42px] w-[448px] items-center gap-3 rounded-[14px] border border-line bg-cream px-4 text-muted">
        <Icon name="search" />
        <input className="w-full bg-transparent text-sm text-coffee outline-none placeholder:text-muted/70" placeholder={t.common.searchPlaceholder} />
      </label>
      {!location.pathname.includes('/admin/owner') && !location.pathname.includes('/admin/cms') && (
        <button className="rounded-[14px] border border-line bg-white px-4 py-2.5 text-sm font-semibold">⌖ {t.common.branch}⌄</button>
      )}
      <button className="relative grid h-11 w-11 place-items-center rounded-[14px] border border-line bg-white">
        <Icon name="bell" />
        <span className="absolute right-3 top-2 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-white" />
      </button>
      <LanguageSwitch />
      <button className="ml-auto flex items-center gap-3 text-left">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-coffee font-bold text-white">A</span>
        <span>
          <strong className="block text-[15px]">Anha Nguyễn</strong>
          <small className="block text-xs text-muted">Chain Owner</small>
        </span>
        <span>⌄</span>
      </button>
    </header>
  )
}
