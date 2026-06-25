import { useLocale } from '../../hooks/useLocale'
import { CustomerListPanel } from './components/CustomerListPanel'

export function CustomerListPage() {
  const { t } = useLocale()

  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
          {t.customers.sectionLabel}
        </p>
        <h1 className="mt-2 text-[34px] font-bold tracking-[-0.04em]">{t.customers.pageTitle}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">{t.customers.pageDescription}</p>
      </div>

      <div className="mt-7">
        <CustomerListPanel />
      </div>
    </>
  )
}
