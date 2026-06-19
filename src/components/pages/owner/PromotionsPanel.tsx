import type { Branch, Promotion, PromotionPayload } from '../../../types'
import { dateToInput, formatCurrency } from '../../../utils/owner.utils'
import { DateField, Field, NumberField, StatusBadge, TextField } from './OwnerFields'
import { DataTable } from './DataTable'
import { Card } from '../../ui/Card'

export function PromotionsPanel({ branches, promotions, form, saving, onFormChange, onSave }: {
  branches: Branch[]
  promotions: Promotion[]
  form: PromotionPayload
  saving: boolean
  onFormChange: (form: PromotionPayload) => void
  onSave: () => void
}) {
  return (
    <section className="grid grid-cols-[390px_1fr] gap-5">
      <Card className="p-5">
        <h2 className="text-base font-semibold">Tạo khuyến mãi mới</h2>
        <div className="mt-4 space-y-4">
          <TextField label="Tên khuyến mãi" value={form.name} onChange={(value) => onFormChange({ ...form, name: value })} />
          <TextField label="Mô tả" value={form.description ?? ''} onChange={(value) => onFormChange({ ...form, description: value })} />
          <div className="grid grid-cols-2 gap-3">
            <DateField label="Bắt đầu" value={form.startDate} onChange={(value) => onFormChange({ ...form, startDate: value })} />
            <DateField label="Kết thúc" value={form.endDate} onChange={(value) => onFormChange({ ...form, endDate: value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Giảm giá" value={form.discountValue} onChange={(value) => onFormChange({ ...form, discountValue: value })} />
            <Field label="Loại">
              <select className="h-9 rounded-lg border border-line bg-white px-3 text-sm" value={form.discountType} onChange={(event) => onFormChange({ ...form, discountType: event.target.value as PromotionPayload['discountType'] })}>
                <option value="percent">Phần trăm</option>
                <option value="fixed">Số tiền</option>
              </select>
            </Field>
          </div>
          <Field label="Phạm vi">
            <select className="h-9 rounded-lg border border-line bg-white px-3 text-sm" value={form.scope} onChange={(event) => onFormChange({ ...form, scope: event.target.value as PromotionPayload['scope'], appliedBranches: [] })}>
              <option value="global">Toàn chuỗi</option>
              <option value="specific">Chi nhánh cụ thể</option>
            </select>
          </Field>
          {form.scope === 'specific' ? (
            <Field label="Chi nhánh">
              <select className="h-9 rounded-lg border border-line bg-white px-3 text-sm" value={form.appliedBranches[0] ?? ''} onChange={(event) => onFormChange({ ...form, appliedBranches: event.target.value ? [event.target.value] : [] })}>
                <option value="">Chọn chi nhánh</option>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </Field>
          ) : null}
          <button className="h-9 w-full rounded-lg bg-coffee px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={saving} onClick={onSave}>Tạo khuyến mãi</button>
        </div>
      </Card>

      <DataTable
        data={promotions}
        colSpan={5}
        emptyMessage="Chưa có khuyến mãi."
        renderHeader={() => (
          <tr>
            <th className="px-4 py-3">Tên</th>
            <th className="px-4 py-3">Thời gian</th>
            <th className="px-4 py-3">Giảm</th>
            <th className="px-4 py-3">Phạm vi</th>
            <th className="px-4 py-3">Trạng thái</th>
          </tr>
        )}
        renderRow={(promotion) => (
          <tr key={promotion.id} className="border-t border-line bg-white">
            <td className="px-4 py-3 font-semibold">{promotion.name}</td>
            <td className="px-4 py-3 text-muted">{dateToInput(new Date(promotion.startDate))} → {dateToInput(new Date(promotion.endDate))}</td>
            <td className="px-4 py-3">{promotion.discountType === 'percent' ? `${promotion.discountValue}%` : formatCurrency(promotion.discountValue)}</td>
            <td className="px-4 py-3">{promotion.scope === 'global' ? 'Toàn chuỗi' : `${promotion.appliedBranches.length} chi nhánh`}</td>
            <td className="px-4 py-3"><StatusBadge status={promotion.isActive ? 'active' : 'inactive'} /></td>
          </tr>
        )}
      />
    </section>
  )
}