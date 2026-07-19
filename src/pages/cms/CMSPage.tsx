import { useState } from 'react'
import { Eye } from 'lucide-react'
import { LandingPage } from '../landing/LandingPage'
import { cn } from '../../utils/cn'
import { useLocale } from '../../hooks/useLocale'
import type { CmsTab } from './components/cms.types'
import { cmsTabKeys } from './components/cms.constants'
import { LandingEditor } from './components/LandingEditor'
import { BannersPanel } from './components/BannersPanel'
import { FeaturedMenuEditor } from './components/FeaturedMenuEditor'
import { PostsPanel } from './components/PostsPanel'
import { EventsPanel } from './components/EventsPanel'

export function CMSPage() {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<CmsTab>('landing')
  const [isLandingPreviewOpen, setIsLandingPreviewOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mt-2 text-[34px] font-bold tracking-[-0.04em]">{t.cms.pageTitle}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsLandingPreviewOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-coffee shadow-soft transition hover:bg-cream"
          >
            <Eye className="h-4 w-4" />
            {t.cms.previewLanding}
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 rounded-[20px] bg-cream p-2 shadow-soft">
        {cmsTabKeys.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={cn(
              'min-w-[240px] rounded-[16px] px-5 py-4 text-left transition',
              activeTab === tabKey ? 'bg-white text-coffee shadow-soft' : 'text-muted hover:bg-white/70',
            )}
          >
            <span className="block text-[15px] font-semibold">{t.cms.tabs[tabKey].label}</span>
            <span className="mt-1 block text-xs leading-5">{t.cms.tabs[tabKey].description}</span>
          </button>
        ))}
      </div>

      <div className="mt-7 space-y-6">
        {activeTab === 'landing' && <LandingEditor />}
        {activeTab === 'banners' && <BannersPanel />}
        {activeTab === 'featured-menu' && <FeaturedMenuEditor />}
        {activeTab === 'posts' && <PostsPanel />}
        {activeTab === 'events' && <EventsPanel />}
        {/* {activeTab === 'promotions' && <PromotionsPanel />} */}
      </div>

      {isLandingPreviewOpen && <LandingPage onClose={() => setIsLandingPreviewOpen(false)} />}
    </>
  )
}
