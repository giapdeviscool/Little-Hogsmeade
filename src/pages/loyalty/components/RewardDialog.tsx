import { useEffect, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, NumberField, TextField } from '../../../components/pages/owner/OwnerFields'
import type { LoyaltyReward, LoyaltyRewardPayload, RewardDialogMode, RewardFormErrors } from '../loyalty.types'
import { ImageField } from '../../cms/components/CmsSharedUI'
import { uploadImage } from '../../../api/cms.api'

const emptyForm: LoyaltyRewardPayload = {
  name: '',
  pointsRequired: 1,
  discountValue: 10,
  discountType: 'percent',
  minOrderValue: 0,
  expiryDays: 30,
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

  if (form.discountType !== 'gift' && form.discountValue <= 0) {
    errors.discountValue = 'Mức giảm giá phải lớn hơn 0'
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
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUploadImage = async (file: File) => {
    try {
      const res = await uploadImage(file, 'rewards')
      setForm((prev) => ({ ...prev, imageUrl: res.data?.secure_url || '' }))
    } catch (error) {
      alert('Có lỗi xảy ra khi tải ảnh lên')
    }
  }

  useEffect(() => {
    if (!isOpen) return

    if (mode === 'edit' && reward) {
      setForm({
        name: reward.name,
        pointsRequired: reward.pointsRequired,
        discountValue: reward.discountValue ?? 0,
        discountType: reward.discountType ?? 'percent',
        minOrderValue: reward.minOrderValue ?? 0,
        expiryDays: reward.expiryDays ?? 30,
        description: reward.description ?? '',
        imageUrl: reward.imageUrl,
        isActive: reward.isActive,
      })
    } else {
      setForm(emptyForm)
    }

    setErrors({})
  }, [isOpen, mode, reward])

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <NumberField
                label="Mức giảm"
                value={form.discountType === 'gift' ? 0 : form.discountValue ?? 0}
                onChange={(value) => setForm((prev) => ({ ...prev, discountValue: value }))}
              />
              {errors.discountValue ? <p className="mt-1 text-xs text-[#c25a5a]">{errors.discountValue}</p> : null}
            </div>
            <Field label="Loại phần thưởng / Giảm giá">
              <select
                className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm"
                value={form.discountType}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    discountType: event.target.value as 'percent' | 'fixed' | 'gift',
                    ...(event.target.value === 'gift' ? { discountValue: 0, minOrderValue: 0 } : {})
                  }))
                }
              >
                <option value="percent">Giảm Phần trăm (%)</option>
                <option value="fixed">Giảm Số tiền (VNĐ)</option>
                <option value="gift">Quà tặng (Miễn phí)</option>
              </select>
            </Field>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Giá trị đơn hàng tối thiểu (VND)"
              value={form.discountType === 'gift' ? 0 : form.minOrderValue ?? 0}
              onChange={(value) => setForm((prev) => ({ ...prev, minOrderValue: value }))}
            />
            <NumberField
              label="Thời hạn Voucher (Số ngày)"
              value={form.expiryDays ?? 30}
              onChange={(value) => setForm((prev) => ({ ...prev, expiryDays: value }))}
            />
          </div>

          <label className="block text-sm font-medium text-coffee">
            <span className="mb-1.5 block">Mô tả chi tiết</span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              value={form.description ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Ghi chú điều kiện áp dụng..."
            />
          </label>

          <ImageField
            label="Ảnh minh họa"
            value={form.imageUrl ?? ''}
            onChange={(val) => setForm(prev => ({ ...prev, imageUrl: val }))}
            onUpload={handleUploadImage}
            fileRef={fileRef}
          />

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
