import { useState } from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../hooks/useLocale'
import { loyaltyTabKeys } from './loyalty.constants'
import type { LoyaltyTab } from './loyalty.types'
import { LoyaltyCrmNav } from './components/LoyaltyCrmNav'
import { EarnRulesTab } from './components/EarnRulesTab'
import { RewardsCatalogTab } from './components/RewardsCatalogTab'

export function LoyaltyConfigurationPage() {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<LoyaltyTab>('earning')

  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
          {t.loyalty.sectionLabel}
        </p>
        <h1 className="mt-2 text-[34px] font-bold tracking-[-0.04em]">{t.loyalty.pageTitle}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">{t.loyalty.pageDescription}</p>
      </div>

      <div className="mt-6">
        <LoyaltyCrmNav />
      </div>

      <div className="mt-6 flex flex-wrap gap-2 rounded-[20px] bg-cream p-2 shadow-soft">
        {loyaltyTabKeys.map((tabKey) => (
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
        {activeTab === 'rewards' && <RewardsCatalogTab />}
      </div>
    </>
  )
}
