import { useState } from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../hooks/useLocale'
import { loyaltyTabKeys } from './loyalty.constants'
import type { LoyaltyTab } from './loyalty.types'
import { EarnRulesTab } from './components/EarnRulesTab'
import { RewardsCatalogTab } from './components/RewardsCatalogTab'
import { VouchersTab } from './components/VouchersTab'
import { TiersTab } from './components/TiersTab'

import { getAuthSession } from '../../store/auth.store'

export function LoyaltyConfigurationPage() {
  const { t } = useLocale()
  const session = getAuthSession()
  const user = session?.user
  
  const roleName = user?.role || user?.roleName || ''
  const isOwner = roleName.toLowerCase().includes('owner')

  const accessibleTabs = loyaltyTabKeys.filter(tab => {
    if ((tab === 'earning' || tab === 'tiers') && !isOwner) return false
    return true
  })

  const [activeTab, setActiveTab] = useState<LoyaltyTab>(accessibleTabs[0] || 'rewards')

  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
          {t.loyalty.sectionLabel}
        </p>
        <h1 className="mt-2 text-[34px] font-bold tracking-[-0.04em]">{t.loyalty.pageTitle}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">{t.loyalty.pageDescription}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 rounded-[20px] bg-cream p-2 shadow-soft">
        {accessibleTabs.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={cn(
              'min-w-[240px] rounded-[16px] px-5 py-4 text-left transition',
              activeTab === tabKey ? 'bg-white text-coffee shadow-soft' : 'text-muted hover:bg-white/70',
            )}
          >
            <span className="block text-[15px] font-semibold">{t.loyalty.tabs[tabKey].label}</span>
            <span className="mt-1 block text-xs leading-5">{t.loyalty.tabs[tabKey].description}</span>
          </button>
        ))}
      </div>

      <div className="mt-7 space-y-6">
        {activeTab === 'earning' && <EarnRulesTab />}
        {activeTab === 'tiers' && <TiersTab />}
        {activeTab === 'rewards' && <RewardsCatalogTab />}
        {activeTab === 'vouchers' && <VouchersTab />}
      </div>
    </>
  )
}
