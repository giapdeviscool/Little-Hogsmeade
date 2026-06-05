import { Card } from '../../ui/Card'
import type { Branch, MenuSyncPreview } from '../../../types'
import { Field, NumberField } from './OwnerFields'

export function PricingPanel({ branches, preview, pricingItemId, pricingBranchId, newPrice, saving, onItemChange, onBranchChange, onPriceChange, onSave }: {
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
}) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold">Cập nhật giá hàng loạt</h2>
      <div className="mt-4 grid grid-cols-4 gap-4">
        <Field label="Món chuẩn">
          <select className="h-9 rounded-lg border border-line bg-white px-3 text-sm" value={pricingItemId} onChange={(event) => onItemChange(event.target.value)}>
            <option value="">Chọn món</option>
            {preview.menuItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </Field>
        <Field label="Chi nhánh áp dụng">
          <select className="h-9 rounded-lg border border-line bg-white px-3 text-sm" value={pricingBranchId} onChange={(event) => onBranchChange(event.target.value)}>
            <option value="">Tất cả chi nhánh active</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
        </Field>
        <NumberField label="Giá mới" value={newPrice} onChange={onPriceChange} />
        <div className="flex items-end">
          <button className="h-9 w-full rounded-lg bg-coffee px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={saving} onClick={onSave}>Cập nhật</button>
        </div>
      </div>
    </Card>
  )
}
