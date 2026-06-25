import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, NumberField, TextField } from '../../../components/pages/owner/OwnerFields'
import { getMenuItems } from '../../../api/menu-item.api'
import type { MenuItem } from '../../../types/menu.types'
import type { LoyaltyReward, LoyaltyRewardPayload, RewardDialogMode, RewardFormErrors } from '../loyalty.types'
import { fallbackMenuOptions } from '../loyalty.constants'
import { cn } from '../../../utils/cn'

const emptyForm: LoyaltyRewardPayload = {
  name: '',
  type: 'VOUCHER',
  pointsRequired: 1,
  voucherAmount: 50000,
  minOrderAmount: 0,
  menuItemId: '',
  description: '',
  isActive: true,
}

function validateForm(form: LoyaltyRewardPayload): RewardFormErrors {
  const errors: RewardFormErrors = {}

  if (!form.name.trim()) {
    errors.name = 'Tên phần thưởng là bắt buộc'
  }

  if (!form.pointsRequired || form.pointsRequired < 1) {
    errors.pointsRequired = 'Số điểm tối thiểu là 1'
  }

  if (form.type === 'VOUCHER' && (!form.voucherAmount || form.voucherAmount <= 0)) {
    errors.voucherAmount = 'Mệnh giá giảm phải lớn hơn 0'
  }

  if (form.type === 'FREE_PRODUCT' && !form.menuItemId) {
    errors.menuItemId = 'Vui lòng chọn sản phẩm từ thực đơn'
  }

  return errors
}

export function RewardDialog({
  isOpen,
  mode,
  reward,
  saving,
  onClose,
  onSave,
}: {
  isOpen: boolean
  mode: RewardDialogMode
  reward: LoyaltyReward | null
  saving: boolean
  onClose: () => void
  onSave: (payload: LoyaltyRewardPayload) => void
}) {
  const [form, setForm] = useState<LoyaltyRewardPayload>(emptyForm)
  const [errors, setErrors] = useState<RewardFormErrors>({})
  const [menuItems, setMenuItems] = useState<Array<{ id: string; name: string }>>(fallbackMenuOptions)
  const [productSearch, setProductSearch] = useState('')

  useEffect(() => {
    if (!isOpen) return

    if (mode === 'edit' && reward) {
      setForm({
        name: reward.name,
        type: reward.type,
        pointsRequired: reward.pointsRequired,
        voucherAmount: reward.voucherAmount ?? 0,
        minOrderAmount: reward.minOrderAmount ?? 0,
        menuItemId: reward.menuItemId ?? '',
        description: reward.description ?? '',
        isActive: reward.isActive,
      })
    } else {
      setForm(emptyForm)
    }

    setErrors({})
    setProductSearch('')
  }, [isOpen, mode, reward])

  useEffect(() => {
    if (!isOpen) return

    getMenuItems({ isActive: true, limit: 100 })
      .then((response) => {
        const items = (response?.data?.items ?? response?.data ?? []) as MenuItem[]
        if (Array.isArray(items) && items.length > 0) {
          setMenuItems(items.map((item) => ({ id: item.id, name: item.name })))
        }
      })
      .catch(() => {
        setMenuItems(fallbackMenuOptions)
      })
  }, [isOpen])

  const filteredMenuItems = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase()
    if (!keyword) return menuItems
    return menuItems.filter((item) => item.name.toLowerCase().includes(keyword))
  }, [menuItems, productSearch])

  const title = mode === 'create' ? 'Thêm phần thưởng mới' : 'Chỉnh sửa phần thưởng'

  const handleSubmit = () => {
    const nextErrors = validateForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSave(form)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-coffee">{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <TextField
            label="Tên phần thưởng"
            value={form.name}
            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
          />
          {errors.name ? <p className="-mt-2 text-xs text-[#c25a5a]">{errors.name}</p> : null}

          <NumberField
            label="Số điểm cần đổi"
            value={form.pointsRequired}
            onChange={(value) => setForm((prev) => ({ ...prev, pointsRequired: value }))}
          />
          {errors.pointsRequired ? <p className="-mt-2 text-xs text-[#c25a5a]">{errors.pointsRequired}</p> : null}

          <Field label="Loại phần thưởng">
            <select
              className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm"
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  type: event.target.value as LoyaltyRewardPayload['type'],
                }))
              }
            >
              <option value="VOUCHER">Tặng Voucher giảm giá</option>
              <option value="FREE_PRODUCT">Tặng Sản phẩm/Đồ uống</option>
            </select>
          </Field>

          {form.type === 'VOUCHER' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <NumberField
                  label="Số tiền giảm giá (VND)"
                  value={form.voucherAmount ?? 0}
                  onChange={(value) => setForm((prev) => ({ ...prev, voucherAmount: value }))}
                />
                {errors.voucherAmount ? <p className="mt-1 text-xs text-[#c25a5a]">{errors.voucherAmount}</p> : null}
              </div>
              <NumberField
                label="Giá trị đơn hàng tối thiểu (VND)"
                value={form.minOrderAmount ?? 0}
                onChange={(value) => setForm((prev) => ({ ...prev, minOrderAmount: value }))}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Field label="Tìm kiếm sản phẩm">
                <input
                  className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm"
                  placeholder="Gõ tên món để lọc nhanh..."
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                />
              </Field>
              <Field label="Chọn sản phẩm từ Menu">
                <select
                  className={cn(
                    'h-9 w-full rounded-lg border bg-white px-3 text-sm',
                    errors.menuItemId ? 'border-[#c25a5a]' : 'border-line',
                  )}
                  value={form.menuItemId ?? ''}
                  onChange={(event) => {
                    setForm((prev) => ({
                      ...prev,
                      menuItemId: event.target.value,
                    }))
                  }}
                >
                  <option value="">Chọn sản phẩm</option>
                  {filteredMenuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              {errors.menuItemId ? <p className="text-xs text-[#c25a5a]">{errors.menuItemId}</p> : null}
            </div>
          )}

          <label className="block text-sm font-medium text-coffee">
            <span className="mb-1.5 block">Mô tả chi tiết</span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              value={form.description ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Ghi chú điều kiện áp dụng..."
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="h-9 rounded-lg px-4 text-sm font-semibold text-muted transition-colors hover:bg-beige"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="h-9 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90 disabled:opacity-50"
              disabled={saving}
              onClick={handleSubmit}
            >
              {mode === 'create' ? 'Tạo mới' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { emptyForm as emptyRewardForm }
