import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { GlobalMenuPanel } from './GlobalMenuPanel'
import { BranchMenuEditor } from './BranchMenuEditor'
import { EditableLoyaltyEarnField, PricingToggleSection } from './SyncPanel'
import { getBranchMenu, updateBranchCategories, updateBranchMenuItems } from '../../../api/branch-menu.api'
import type { Branch, ChainConfig, BranchMenuView } from '../../../types'

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
  const [activeBranchTab, setActiveBranchTab] = useState<string>('base')
  const [branchMenus, setBranchMenus] = useState<Record<string, BranchMenuView>>({})
  const [loadingBranch, setLoadingBranch] = useState(false)

  const activeBranches = branches.filter((b) => b.status === 'active')

  // Fetch branch menu when switching to a branch tab
  useEffect(() => {
    if (activeBranchTab === 'base') return
    if (branchMenus[activeBranchTab]) return

    let cancelled = false
    setLoadingBranch(true)
    getBranchMenu(activeBranchTab)
      .then((res) => {
        if (!cancelled) {
          setBranchMenus((prev) => ({
            ...prev,
            [activeBranchTab]: res.data ?? { categories: [], menuItems: [] },
          }))
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to fetch branch menu', err)
      })
      .finally(() => {
        if (!cancelled) setLoadingBranch(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeBranchTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveBranchMenu = useCallback(
    async (
      branchId: string,
      catChanges: { categoryId: string; isActive: boolean }[],
      itemChanges: { menuItemId: string; isActive: boolean; basePrice?: number | null }[],
    ) => {
      try {
        if (catChanges.length > 0) {
          await updateBranchCategories(branchId, catChanges)
        }
        if (itemChanges.length > 0) {
          await updateBranchMenuItems(branchId, itemChanges)
        }
        const res = await getBranchMenu(branchId)
        setBranchMenus((prev) => ({
          ...prev,
          [branchId]: res.data ?? { categories: [], menuItems: [] },
        }))
      } catch (err) {
        console.error('Failed to save branch menu', err)
      }
    },
    [],
  )

  const handleResetBranchMenu = useCallback(
    async (branchId: string) => {
      try {
        const res = await getBranchMenu(branchId)
        setBranchMenus((prev) => ({
          ...prev,
          [branchId]: res.data ?? { categories: [], menuItems: [] },
        }))
      } catch (err) {
        console.error('Failed to reset branch menu', err)
      }
    },
    [],
  )

  const branchTabs = activeBranches.map((b) => ({
    id: b.id,
    name: b.name,
    allowLocalPricingOverride: b.allowLocalPricingOverride,
  }))

  return (
    <Tabs defaultValue="config" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="config">Cấu hình chung</TabsTrigger>
        <TabsTrigger value="menu">Menu</TabsTrigger>
      </TabsList>

      {/* ====== TAB 1: Cấu hình chung ====== */}
      <TabsContent value="config" className="space-y-10">
        {/* Chính sách tích điểm */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Chính sách
          </p>
          <h2 className="mt-1 text-lg font-semibold text-coffee">
            Cấu hình chuỗi
          </h2>
          <p className="mt-1 text-sm text-muted">
            Mỗi cấu hình được lưu độc lập. Thay đổi có hiệu lực ngay, không ảnh
            hưởng dữ liệu đã ghi nhận trước đó.
          </p>
          <Card className="mt-4 divide-y divide-line px-5">
            <EditableLoyaltyEarnField saving={saving} />
          </Card>
        </section>

        {/* Chính sách giá toàn chuỗi */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Giá bán
          </p>
          <h2 className="mt-1 text-lg font-semibold text-coffee">
            Chính sách giá toàn chuỗi
          </h2>
          <p className="mt-1 text-sm text-muted">
            Khi bật, giá từ menu chuẩn sẽ được áp dụng đồng nhất cho toàn bộ chi
            nhánh. Chi nhánh không thể tự đặt giá riêng trừ khi được cấp quyền
            override.
          </p>
          <Card className="mt-4 p-5">
            <PricingToggleSection
              config={config}
              saving={saving}
              overrideBranchesCount={overrideBranchesCount}
              onSaveConfig={onSaveConfig}
            />
          </Card>
        </section>
      </TabsContent>

      {/* ====== TAB 2: Menu (với Base + chi nhánh sub-tabs) ====== */}
      <TabsContent value="menu" className="space-y-6">
        <Tabs defaultValue="base" value={activeBranchTab} onValueChange={setActiveBranchTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="base">Base Menu</TabsTrigger>
            {branchTabs.map((bt) => (
              <TabsTrigger key={bt.id} value={bt.id}>
                {bt.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Base Menu tab */}
          <TabsContent value="base">
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Global Menu
              </p>
              <h2 className="mt-1 text-lg font-semibold text-coffee">Global Menu</h2>
              <Card className="mt-4 p-5">
                <GlobalMenuPanel
                  overrideBranchesCount={overrideBranchesCount}
                  saving={saving}
                  onSync={onSync}
                />
              </Card>
            </section>
          </TabsContent>

          {/* Branch tabs */}
          {branchTabs.map((bt) => (
            <TabsContent key={bt.id} value={bt.id}>
              {loadingBranch && !branchMenus[bt.id] ? (
                <div className="py-12 text-center text-sm text-muted">
                  Đang tải menu cho chi nhánh...
                </div>
              ) : branchMenus[bt.id] ? (
                <BranchMenuEditor
                  branchId={bt.id}
                  branchName={bt.name}
                  globalPricingEnabled={config?.globalPricingEnabled ?? true}
                  allowLocalPricingOverride={bt.allowLocalPricingOverride}
                  saving={saving}
                  menuData={branchMenus[bt.id]}
                  onSave={(catChanges, itemChanges) =>
                    void handleSaveBranchMenu(bt.id, catChanges, itemChanges)
                  }
                  onReset={() => void handleResetBranchMenu(bt.id)}
                />
              ) : (
                <div className="py-12 text-center text-sm text-muted">
                  Không thể tải dữ liệu menu. Hãy đồng bộ từ Base Menu trước.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>
    </Tabs>
  )
}
