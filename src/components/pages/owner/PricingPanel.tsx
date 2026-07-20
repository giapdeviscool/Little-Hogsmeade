import { useMemo } from 'react'
import { Card } from '../../ui/Card'
import type { Branch, MenuSyncPreview } from '../../../types'
import { NumberField, ScopeBadge } from './OwnerFields'
import { formatCurrency } from '../../../utils/owner.utils'

export function PricingPanel({ branches, preview, pricingItemId, pricingBranchId, newPrice, saving, onItemChange, onBranchChange, onPriceChange, onSave, onCancel }: {
  branches: Branch[]
  preview: MenuSyncPreview
  pricingItemId: string
  pricingBranchId: string
  newPrice: number
  saving: boolean
  onItemChange: (value: string) => void
  onBranchChange: (value: string) => void
  onPriceChange: (value: number) => void
  onSave: () => void
  onCancel?: () => void
}) {
  const selectedItem = useMemo(
    () => preview.menuItems.find((item) => item.id === pricingItemId) ?? null,
    [preview.menuItems, pricingItemId]
  )

  const currentPrice = selectedItem?.basePrice ?? null
  const percentChange = currentPrice && currentPrice > 0
    ? ((newPrice - currentPrice) / currentPrice) * 100
    : null

  const canSave = Boolean(pricingItemId) && newPrice > 0 && !saving

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Cập nhật giá hàng loạt</h2>
        <ScopeBadge
          scope={pricingBranchId ? 'specific' : 'global'}
          branchCount={pricingBranchId ? 1 : branches.length}
        />
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Món chuẩn</p>
          <select
            className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm"
            value={pricingItemId}
            onChange={(event) => onItemChange(event.target.value)}
          >
            <option value="">Chọn món</option>
            {preview.menuItems.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Chi nhánh áp dụng</p>
          <select
            className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm"
            value={pricingBranchId}
            onChange={(event) => onBranchChange(event.target.value)}
          >
            {branches.length <= 1 ? (
              <option value={branches[0]?.id || ''}>{branches[0]?.name || 'Không có chi nhánh'}</option>
            ) : (
              <>
              <option value="">Tất cả chi nhánh hoạt động</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
              </>
            )}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-5 rounded-lg border border-dashed border-line bg-cream/40 px-4 py-3.5">
        <div className="flex-1">
          <p className="mb-0.5 text-[11px] text-muted">Giá hiện tại</p>
          <p className="text-sm text-muted line-through">
            {currentPrice !== null ? formatCurrency(currentPrice) : '—'}
          </p>
        </div>

        <span className="text-coffee">→</span>

        <div className="flex-[1.3]">
          <p className="mb-0.5 text-[11px] text-muted">Giá mới</p>
          <NumberField label="" value={newPrice} onChange={onPriceChange} emphasized />
        </div>

        <div className="flex-1 text-right">
          <p className="mb-0.5 text-[11px] text-muted">Thay đổi</p>
          <p
            className={
              percentChange === null
                ? 'text-sm font-semibold text-muted'
                : percentChange >= 0
                  ? 'text-sm font-semibold text-green-700'
                  : 'text-sm font-semibold text-red-600'
            }
          >
            {percentChange === null ? '—' : `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2.5">
        {onCancel ? (
          <button
            className="h-9 rounded-lg border border-line px-4 text-sm text-muted hover:bg-cream"
            onClick={onCancel}
            disabled={saving}
          >
            Huỷ
          </button>
        ) : null}
        <button
          className="h-9 rounded-lg bg-coffee px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSave}
          onClick={onSave}
        >
          {saving ? 'Đang cập nhật...' : 'Cập nhật giá'}
        </button>
      </div>
    </Card>
  )
}