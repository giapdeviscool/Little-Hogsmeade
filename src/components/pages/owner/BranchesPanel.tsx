import { Card } from '../../ui/Card'
import type { Branch, BranchPayload } from '../../../types'
import { isoToTime, timeToIso } from '../../../utils/owner.utils'
import { NumberField, StatusBadge, TextField, TimeField } from './OwnerFields'

export function BranchesPanel({
  branches,
  form,
  editingBranchId,
  saving,
  onFormChange,
  onSave,
  onEdit,
  onCancel,
  onDeactivate,
}: {
  branches: Branch[]
  form: BranchPayload
  editingBranchId: string | null
  saving: boolean
  onFormChange: (form: BranchPayload) => void
  onSave: () => void
  onEdit: (branch: Branch) => void
  onCancel: () => void
  onDeactivate: (id: string) => void
}) {
  return (
    <section className="grid grid-cols-[1fr_380px] gap-5">
      <Card className="overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-beige text-left text-xs font-semibold text-muted">
            <tr>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Địa chỉ</th>
              <th className="px-4 py-3">Số ĐT</th>
              <th className="px-4 py-3">GPS</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr key={branch.id} className="border-t border-line bg-white hover:bg-cream">
                <td className="px-4 py-3 font-semibold">{branch.name}</td>
                <td className="max-w-[260px] px-4 py-3 text-muted">{branch.address}</td>
                <td className="px-4 py-3">{branch.phone}</td>
                <td className="px-4 py-3 text-xs text-muted">{branch.lat}, {branch.lng}</td>
                <td className="px-4 py-3"><StatusBadge status={branch.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button className="mr-2 h-8 rounded-lg px-3 text-xs font-semibold text-muted hover:bg-beige hover:text-coffee" onClick={() => onEdit(branch)}>Sửa</button>
                  <button className="h-8 rounded-lg px-3 text-xs font-semibold text-red-700 hover:bg-red-50" disabled={branch.status === 'inactive'} onClick={() => onDeactivate(branch.id)}>Vô hiệu hóa</button>
                </td>
              </tr>
            ))}
            {branches.length === 0 ? <tr><td className="px-4 py-10 text-center text-muted" colSpan={6}>Chưa có chi nhánh.</td></tr> : null}
          </tbody>
        </table>
      </Card>
      <Card className="p-5">
        <h2 className="text-base font-semibold">{editingBranchId ? 'Sửa chi nhánh' : 'Tạo mới chi nhánh'}</h2>
        <div className="mt-4 space-y-4">
          <TextField label="Tên chi nhánh" value={form.name} onChange={(value) => onFormChange({ ...form, name: value })} />
          <TextField label="Địa chỉ" value={form.address} onChange={(value) => onFormChange({ ...form, address: value })} />
          <TextField label="Số điện thoại" value={form.phone} onChange={(value) => onFormChange({ ...form, phone: value })} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Lat" value={form.lat} onChange={(value) => onFormChange({ ...form, lat: value })} />
            <NumberField label="Lng" value={form.lng} onChange={(value) => onFormChange({ ...form, lng: value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TimeField label="Mở cửa" value={isoToTime(form.openTime)} onChange={(value) => onFormChange({ ...form, openTime: timeToIso(value) })} />
            <TimeField label="Đóng cửa" value={isoToTime(form.closeTime)} onChange={(value) => onFormChange({ ...form, closeTime: timeToIso(value) })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input checked={form.allowLocalPricingOverride} type="checkbox" onChange={(event) => onFormChange({ ...form, allowLocalPricingOverride: event.target.checked })} />
            Cho phép chi nhánh tự sửa giá
          </label>
          <div className="flex justify-end gap-2 pt-2">
            {editingBranchId ? <button className="h-9 rounded-lg px-4 text-sm font-semibold text-muted hover:bg-beige" onClick={onCancel}>Hủy</button> : null}
            <button className="h-9 rounded-lg bg-coffee px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={saving} onClick={onSave}>Lưu</button>
          </div>
        </div>
      </Card>
    </section>
  )
}
