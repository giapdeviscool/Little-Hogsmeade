import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Settings, ClipboardList, Store, ChevronLeft, ChevronRight } from 'lucide-react'
import { GlobalMenuPanel } from './GlobalMenuPanel'
import { BranchMenuEditor } from './BranchMenuEditor'
import { EditableLoyaltyEarnField, PricingToggleSection } from './SyncPanel'
import { getBranchMenu, updateBranchMenuItems } from '../../../api/branch-menu.api'
import { getCategories } from '../../../api/category.api'
import type { Branch, ChainConfig, Category } from '../../../types'

interface BranchMenuPanelProps {
  branches: Branch[]
  config: ChainConfig | null
  saving: boolean
  overrideBranchesCount: number
  onSync: () => void
  onSaveConfig: (config: Partial<ChainConfig>) => void
}

export function BranchMenuPanel({
  branches,
  config,
  saving,
  overrideBranchesCount,
  onSync,
  onSaveConfig,
}: BranchMenuPanelProps) {
  const [activeOuterTab, setActiveOuterTab] = useState('config')
  const [activeBranchTab, setActiveBranchTab] = useState('base')
  const [branchMenus, setBranchMenus] = useState<Record<string, any>>({})
  const [loadingBranch, setLoadingBranch] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeBranches = branches.filter((b) => b.status === 'active')

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const hasOverflow = el.scrollWidth > el.clientWidth
    setCanScrollLeft(hasOverflow && el.scrollLeft > 4)
    setCanScrollRight(hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect() }
  }, [checkScroll, activeBranches.length])

  const scrollTabs = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  useEffect(() => {
    getCategories({ limit: 100, status: 'active' })
      .then((res) => {
        const data = res.data?.items ?? res.data ?? []
        setAllCategories(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (activeBranchTab === 'base') return
    let cancelled = false
    setLoadingBranch(true)
    getBranchMenu(activeBranchTab)
      .then((res) => {
        if (!cancelled) setBranchMenus((prev) => ({ ...prev, [activeBranchTab]: res.data ?? { categories: [], menuItems: [] } }))
      })
      .catch((err) => { if (!cancelled) console.error(err) })
      .finally(() => { if (!cancelled) setLoadingBranch(false) })
    return () => { cancelled = true }
  }, [activeBranchTab])

  const handleSaveBranchMenu = useCallback(async (branchId: string, items: any[]) => {
    try {
      if (items.length > 0) await updateBranchMenuItems(branchId, items)
      const res = await getBranchMenu(branchId)
      setBranchMenus((prev) => ({ ...prev, [branchId]: res.data ?? { categories: [], menuItems: [] } }))
    } catch (err) { console.error(err) }
  }, [])

  const handleResetBranchMenu = useCallback(async (branchId: string) => {
    try {
      const res = await getBranchMenu(branchId)
      setBranchMenus((prev) => ({ ...prev, [branchId]: res.data ?? { categories: [], menuItems: [] } }))
    } catch (err) { console.error(err) }
  }, [])

  const branchTabs = activeBranches.map((b) => ({
    id: b.id,
    name: b.name,
    allowLocalPricingOverride: b.allowLocalPricingOverride,
  }))

  const TabTriggerStyle =
    'relative px-1 py-3 text-sm font-semibold rounded-none border-0 bg-transparent data-active:bg-transparent data-active:text-coffee data-active:shadow-none text-muted transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-coffee after:opacity-0 data-active:after:opacity-100 hover:text-coffee'

  const BranchTabTriggerStyle =
    'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-tl-lg rounded-tr-lg border-0 bg-transparent data-active:bg-beige data-active:text-coffee text-muted transition-colors hover:text-coffee hover:bg-beige/50'

  return (
    <Tabs value={activeOuterTab} onValueChange={setActiveOuterTab} className="w-full">
      {/* Outer tab bar */}
      <div className="border-b border-line">
        <TabsList variant="line" className="h-auto bg-transparent gap-6 px-0 rounded-none">
          <TabsTrigger value="config" className={TabTriggerStyle}>
            <Settings className="h-4 w-4" />
            Cấu hình chung
          </TabsTrigger>
          <TabsTrigger value="menu" className={TabTriggerStyle}>
            <ClipboardList className="h-4 w-4" />
            Menu
          </TabsTrigger>
        </TabsList>
      </div>

      {/* TAB: Cấu hình chung */}
      <TabsContent value="config" className="mt-6 space-y-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Chính sách</p>
          <h2 className="mt-1 text-lg font-semibold text-coffee">Cấu hình chuỗi</h2>
          <p className="mt-1 text-sm text-muted">Mỗi cấu hình được lưu độc lập. Thay đổi có hiệu lực ngay, không ảnh hưởng dữ liệu đã ghi nhận trước đó.</p>
          <Card className="mt-4 divide-y divide-line px-5">
            <EditableLoyaltyEarnField saving={saving} />
          </Card>
        </section>
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Giá bán</p>
          <h2 className="mt-1 text-lg font-semibold text-coffee">Chính sách giá toàn chuỗi</h2>
          <p className="mt-1 text-sm text-muted">Khi bật, giá từ menu chuẩn sẽ được áp dụng đồng nhất cho toàn bộ chi nhánh.</p>
          <Card className="mt-4 p-5">
            <PricingToggleSection config={config} saving={saving} overrideBranchesCount={overrideBranchesCount} onSaveConfig={onSaveConfig} />
          </Card>
        </section>
      </TabsContent>

      {/* TAB: Menu */}
      <TabsContent value="menu" className="mt-0">
        <Tabs value={activeBranchTab} onValueChange={setActiveBranchTab} className="w-full">
          {/* Inner tab bar with scroll arrows */}
          <div className="relative border-b border-line mb-6">
            <div className="flex items-center">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollTabs('left')}
                  className="shrink-0 flex items-center justify-center h-9 w-7 -ml-1 text-muted hover:text-coffee transition-colors z-10"
                  aria-label="Cuộn trái"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <div
                ref={scrollRef}
                className="overflow-x-auto scrollbar-none flex-1 -mb-px"
              >
                <TabsList className="h-auto gap-0 bg-transparent min-w-max px-0">
                  <TabsTrigger value="base" className={BranchTabTriggerStyle}>
                    <ClipboardList className="mr-1.5 h-3.5 w-3.5" />Base Menu
                  </TabsTrigger>
                  {branchTabs.map((bt) => (
                    <TabsTrigger key={bt.id} value={bt.id} className={BranchTabTriggerStyle}>
                      <Store className="mr-1.5 h-3.5 w-3.5" />{bt.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollTabs('right')}
                  className="shrink-0 flex items-center justify-center h-9 w-7 -mr-1 text-muted hover:text-coffee transition-colors z-10"
                  aria-label="Cuộn phải"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <TabsContent value="base" className="mt-0">
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Global Menu</p>
                  <h2 className="mt-1 text-lg font-semibold text-coffee">Thực đơn chuẩn toàn chuỗi</h2>
                </div>
              </div>
              <Card className="p-5">
                <GlobalMenuPanel
                  overrideBranchesCount={overrideBranchesCount}
                  saving={saving}
                  onSync={onSync}
                />
              </Card>
            </section>
          </TabsContent>

          {branchTabs.map((bt) => (
            <TabsContent key={bt.id} value={bt.id} className="mt-0">
              {loadingBranch && !branchMenus[bt.id] ? (
                <div className="rounded-xl border border-dashed border-line py-16 text-center">
                  <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-beige" />
                  <p className="font-medium text-muted">Đang tải menu cho chi nhánh...</p>
                </div>
              ) : branchMenus[bt.id] ? (
                <BranchMenuEditor
                  branchName={bt.name}
                  branchId={bt.id}
                  menuData={branchMenus[bt.id]}
                  onSave={(items) => void handleSaveBranchMenu(bt.id, items)}
                  onReset={() => void handleResetBranchMenu(bt.id)}
                  saving={saving}
                  categories={allCategories}
                  branches={activeBranches}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-line py-16 text-center">
                  <p className="font-medium text-muted">Chưa có dữ liệu menu</p>
                  <p className="mt-1 text-sm text-muted/70">Hãy đồng bộ từ Base Menu trước.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>
    </Tabs>
  )
}
