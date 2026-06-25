import { useState } from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../hooks/useLocale'
import { loyaltyTabKeys } from './loyalty.constants'
import type { LoyaltyTab } from './loyalty.types'
import { LoyaltyCrmNav } from './components/LoyaltyCrmNav'
import { EarnRulesTab } from './components/EarnRulesTab'
import { RewardsCatalogTab } from './components/RewardsCatalogTab'
import { AdminPageHeader } from '../../components/ui/AdminPageHeader'

export function LoyaltyConfigurationPage() {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<LoyaltyTab>('earning')

  return (
    <>
      <AdminPageHeader 
        moduleName={t.loyalty.sectionLabel}
        pageName={t.loyalty.pageTitle}
        pageDescription={t.loyalty.pageDescription}
      />

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
