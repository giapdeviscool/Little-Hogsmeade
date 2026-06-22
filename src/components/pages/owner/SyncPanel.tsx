import { useState, useEffect } from 'react'
import { Card } from '../../ui/Card'
import type { ChainConfig, MenuSyncPreview } from '../../../types'
import { NumberField, TextField } from './OwnerFields'
import { SimpleList } from './OwnerCharts'
import { formatCurrency } from '../../../utils/owner.utils'
import { TriangleAlert } from 'lucide-react'

export function SyncPanel({
  config,
  preview,
  saving,
  overrideBranchesCount = 0,
  onSaveConfig,
  onSync
}: {
  config: ChainConfig | null;
  preview: MenuSyncPreview;
  saving: boolean;
  overrideBranchesCount?: number;
  onSaveConfig: (config: Partial<ChainConfig>) => void;
  onSync: () => void;
}) {
  const [localLoyaltyRate, setLocalLoyaltyRate] = useState(config?.loyaltyEarnRate ?? 1)
  const [localCurrency, setLocalCurrency] = useState(config?.defaultCurrency ?? 'VND')
  const [localGlobalPricing, setLocalGlobalPricing] = useState(config?.globalPricingEnabled ?? true)

  useEffect(() => {
    setLocalLoyaltyRate(config?.loyaltyEarnRate ?? 1)
    setLocalCurrency(config?.defaultCurrency ?? 'VND')
    setLocalGlobalPricing(config?.globalPricingEnabled ?? true)
  }, [config])

  const hasChanges =
    localLoyaltyRate !== (config?.loyaltyEarnRate ?? 1) ||
    localCurrency !== (config?.defaultCurrency ?? 'VND') ||
    localGlobalPricing !== (config?.globalPricingEnabled ?? true)

  const handleSaveConfig = () => {
    onSaveConfig({
      loyaltyEarnRate: localLoyaltyRate,
      defaultCurrency: localCurrency,
      globalPricingEnabled: localGlobalPricing,
    })
  }

  const handleResetConfig = () => {
    setLocalLoyaltyRate(config?.loyaltyEarnRate ?? 1)
    setLocalCurrency(config?.defaultCurrency ?? 'VND')
    setLocalGlobalPricing(config?.globalPricingEnabled ?? true)
  }

  const isMenuEmpty = preview.categories.length === 0 || preview.menuItems.length === 0;

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Chính sách</p>
        <h2 className="mt-1 text-lg font-semibold text-coffee">Cấu hình chuỗi</h2>
        <p className="mt-1 text-sm text-muted">
          Áp dụng cho toàn bộ chi nhánh. Thay đổi có hiệu lực ngay, không ảnh hưởng dữ liệu đã ghi nhận trước đó.
        </p>
        <Card className="mt-4 p-5 sm:max-w-[420px]">
          <div className="space-y-4">
            <NumberField
              label="Tỷ lệ tích điểm"
              value={localLoyaltyRate}
              onChange={setLocalLoyaltyRate}
            />
            <TextField
              label="Tiền tệ mặc định"
              value={localCurrency}
              onChange={setLocalCurrency}
            />
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                checked={localGlobalPricing}
                type="checkbox"
                onChange={(event) => setLocalGlobalPricing(event.target.checked)}
              />
              Bật chính sách giá toàn chuỗi
            </label>

            {hasChanges && (
              <div className="flex gap-2 pt-2">
                <button
                  className="h-9 flex-1 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90 disabled:opacity-50"
                  disabled={saving}
                  onClick={handleSaveConfig}
                >
                  Cập nhật
                </button>
                <button
                  className="h-9 rounded-lg px-4 text-sm font-semibold text-muted transition-colors hover:bg-beige"
                  disabled={saving}
                  onClick={handleResetConfig}
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </Card>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Đồng bộ dữ liệu</p>
        <h2 className="mt-1 text-lg font-semibold text-coffee">Menu chuẩn</h2>
        <p className="mt-1 text-sm text-muted">
          Đẩy danh mục và món chuẩn xuống tất cả chi nhánh đang hoạt động. Hành động này sẽ ghi đè dữ liệu hiện tại.
        </p>
        <Card className="mt-4 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3 flex-1 max-w-[600px]">
              <div>
                <p className="font-medium text-coffee">
                  {preview.categories.length} danh mục chuẩn · {preview.menuItems.length} món chuẩn
                </p>
              </div>

              {overrideBranchesCount > 0 ? (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{overrideBranchesCount} chi nhánh đang tự set giá riêng. Đồng bộ có thể ảnh hưởng đến giá hiện tại của các chi nhánh này.</p>
                </div>
              ) : null}
            </div>
            <button
              className="h-9 whitespace-nowrap rounded-lg bg-coffee px-4 text-sm font-semibold text-white disabled:opacity-50"
              disabled={saving || isMenuEmpty}
              onClick={onSync}
            >
              Đồng bộ menu
            </button>
          </div>

          {isMenuEmpty ? (
            <div className="mt-5 rounded-lg border border-dashed border-line py-10 text-center text-sm text-muted">
              Chưa có menu chuẩn nào được thiết lập. Vào module Quản lý Món ăn để thêm danh mục và món trước khi đồng bộ.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SimpleList title="Danh mục chuẩn" items={preview.categories.map((category) => category.name)} />
              <SimpleList title="Món chuẩn" items={preview.menuItems.map((item) => `${item.name} · ${formatCurrency(item.basePrice)}`)} />
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
