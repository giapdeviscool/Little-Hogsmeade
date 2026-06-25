import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { cn } from '../../../utils/cn'
import { useLocale } from '../../../hooks/useLocale'

export function LoyaltyCrmNav() {
  const { t } = useLocale()
  const location = useLocation()

  const items = [
    { href: ROUTES.adminLoyaltyCustomers, label: t.loyalty.crmNav.customers },
    { href: ROUTES.adminLoyaltyConfiguration, label: t.loyalty.crmNav.configuration },
  ]

  return (
    <div className="flex flex-wrap gap-2 rounded-[16px] border border-line bg-white p-1.5 shadow-soft">
      {items.map((item) => {
        const isActive = location.pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'rounded-xl px-4 py-2.5 text-sm font-semibold transition',
              isActive ? 'bg-coffee text-white shadow-soft' : 'text-muted hover:bg-cream hover:text-coffee',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
