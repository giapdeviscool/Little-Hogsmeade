import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Skeleton } from '../../../components/ui/skeleton'
import { cn } from '../../../utils/cn'
import { getLoyaltyConfig, saveLoyaltyConfig } from '../../../api/loyalty.api'
import type { EarnConfigErrors, LoyaltyEarnConfig } from '../loyalty.types'
import { defaultLoyaltyEarnConfig } from '../loyalty.constants'
import { LoyaltyToggle, formatVndAmount } from './LoyaltySharedUI'

function validateConfig(config: LoyaltyEarnConfig): EarnConfigErrors {
  const errors: EarnConfigErrors = {}

  if (!config.spendAmount || config.spendAmount < 1000) {
    errors.spendAmount = 'Số tiền quy đổi tối thiểu là 1.000 VND'
  }

  if (!config.pointsEarned || config.pointsEarned < 1) {
    errors.pointsEarned = 'Số điểm nhận được phải lớn hơn hoặc bằng 1'
  }

  if (config.pointExpiryDays !== null && (config.pointExpiryDays < 0 || !Number.isInteger(config.pointExpiryDays))) {
    errors.pointExpiryDays = 'Thời hạn điểm phải là số nguyên dương hoặc để trống'
  }

  return errors
}

function EarnRulesSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-72 bg-beige" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl bg-beige" />
      <div className="mt-6 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-40 bg-beige" />
        <Skeleton className="h-10 w-24 bg-beige" />
        <Skeleton className="h-10 w-40 bg-beige" />
      </div>
      <div className="mt-8 space-y-3">
        <Skeleton className="h-16 w-full bg-beige" />
        <Skeleton className="h-16 w-full bg-beige" />
        <Skeleton className="h-10 w-48 bg-beige" />
      </div>
    </Card>
  )
}

export function EarnRulesTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedConfig, setSavedConfig] = useState<LoyaltyEarnConfig>(defaultLoyaltyEarnConfig)
  const [form, setForm] = useState<LoyaltyEarnConfig>(defaultLoyaltyEarnConfig)
  const [errors, setErrors] = useState<EarnConfigErrors>({})
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getLoyaltyConfig()
      .then((config) => {
        if (!active) return
        setSavedConfig(config)
        setForm(config)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : 'Không tải được cấu hình tích điểm.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const previewLabel = useMemo(() => {
    const spend = form.spendAmount > 0 ? formatVndAmount(form.spendAmount) : '...'
    const points = form.pointsEarned > 0 ? form.pointsEarned : '...'
    return `Khách hàng chi tiêu ${spend} sẽ nhận được ${points} điểm.`
  }, [form.spendAmount, form.pointsEarned])

  const hasChanges = JSON.stringify(form) !== JSON.stringify(savedConfig)

  const handleReset = () => {
    setForm(savedConfig)
    setErrors({})
    setSaveMessage(null)
    setSaveError(null)
  }

  const handleSave = async () => {
    const nextErrors = validateConfig(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    setSaveMessage(null)
    setSaveError(null)

    try {
      const updated = await saveLoyaltyConfig(form)
      setSavedConfig(updated)
      setForm(updated)
      setSaveMessage('Đã lưu cấu hình tích điểm.')
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : 'Không lưu được cấu hình tích điểm.')
    } finally {
      setSaving(false)
    }
  }

  const handleRetryLoad = () => {
    setLoading(true)
    setLoadError(null)

    getLoyaltyConfig()
      .then((config) => {
        setSavedConfig(config)
        setForm(config)
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : 'Không tải được cấu hình tích điểm.')
      })
      .finally(() => setLoading(false))
  }

  if (loading) {
    return <EarnRulesSkeleton />
  }

  if (loadError) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium text-[#c25a5a]">{loadError}</p>
        <button
          type="button"
          onClick={handleRetryLoad}
          className="mt-4 h-10 rounded-lg bg-coffee px-5 text-sm font-semibold text-white transition hover:bg-coffee/90"
        >
          Tải lại
        </button>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div>
        <h2 className="text-lg font-semibold text-coffee">Thiết lập tỷ lệ tích điểm cơ bản</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Hệ thống tự động quy đổi giá trị đơn hàng hoàn tất sang điểm thưởng dựa trên tỷ lệ dưới đây.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-4 text-sm text-coffee">
          <span className="font-medium">Khi khách hàng chi tiêu</span>
          <div>
            <input
              type="number"
              min={1000}
              step={1000}
              disabled={saving}
              value={form.spendAmount}
              onChange={(event) => setForm((prev) => ({ ...prev, spendAmount: Number(event.target.value) }))}
              placeholder="10.000"
              className={cn(
                'h-10 w-36 rounded-lg border bg-white px-3 text-sm font-semibold',
                errors.spendAmount ? 'border-[#c25a5a]' : 'border-line',
              )}
            />
            {errors.spendAmount ? <p className="mt-1 text-xs text-[#c25a5a]">{errors.spendAmount}</p> : null}
          </div>
          <span className="font-medium">VND, hệ thống sẽ tự động cộng</span>
          <div>
            <input
              type="number"
              min={1}
              step={1}
              disabled={saving}
              value={form.pointsEarned}
              onChange={(event) => setForm((prev) => ({ ...prev, pointsEarned: Number(event.target.value) }))}
              placeholder="1"
              className={cn(
                'h-10 w-24 rounded-lg border bg-white px-3 text-sm font-semibold',
                errors.pointsEarned ? 'border-[#c25a5a]' : 'border-line',
              )}
            />
            {errors.pointsEarned ? <p className="mt-1 text-xs text-[#c25a5a]">{errors.pointsEarned}</p> : null}
          </div>
          <span className="font-medium">điểm vào ví tích lũy.</span>
        </div>

        <p className="mt-4 rounded-xl bg-beige px-4 py-3 text-sm font-medium text-coffee">{previewLabel}</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
        <button
          type="button"
          disabled={saving}
          onClick={() => setAdvancedOpen((open) => !open)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div>
            <p className="text-sm font-semibold text-coffee">Cấu hình nâng cao</p>
            <p className="mt-1 text-xs text-muted">Tuỳ chọn mở rộng cho chính sách tích điểm.</p>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', advancedOpen && 'rotate-180')} />
        </button>

        {advancedOpen ? (
          <div className="space-y-3 border-t border-line px-5 py-4">
            <LoyaltyToggle
              label="Kích hoạt chương trình tích điểm"
              description="Tắt tuỳ chọn này sẽ ngừng tích điểm cho chi nhánh hiện tại."
              checked={form.isActive}
              disabled={saving}
              onChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
            />
            <LoyaltyToggle
              label="Áp dụng tích điểm cho đơn hàng sử dụng Voucher giảm giá"
              checked={form.earnOnVoucherOrders}
              disabled={saving}
              onChange={(checked) => setForm((prev) => ({ ...prev, earnOnVoucherOrders: checked }))}
            />
            <LoyaltyToggle
              label="Cho phép tích điểm lẻ (Số thập phân)"
              description="Nếu tắt, hệ thống tự động làm tròn xuống sang số nguyên gần nhất."
              checked={form.allowFractionalPoints}
              disabled={saving}
              onChange={(checked) => setForm((prev) => ({ ...prev, allowFractionalPoints: checked }))}
            />
            <label className="block text-sm font-medium text-coffee">
              <span className="mb-1.5 block">Thời hạn hết hạn của điểm thưởng (Ngày)</span>
              <input
                type="number"
                min={0}
                step={1}
                disabled={saving}
                value={form.pointExpiryDays ?? ''}
                onChange={(event) => {
                  const raw = event.target.value
                  setForm((prev) => ({
                    ...prev,
                    pointExpiryDays: raw === '' ? null : Number(raw),
                  }))
                }}
                placeholder="365"
                className={cn(
                  'h-10 w-full max-w-xs rounded-lg border bg-white px-3 text-sm',
                  errors.pointExpiryDays ? 'border-[#c25a5a]' : 'border-line',
                )}
              />
              {errors.pointExpiryDays ? (
                <span className="mt-1 block text-xs text-[#c25a5a]">{errors.pointExpiryDays}</span>
              ) : (
                <span className="mt-1 block text-xs text-muted">Để trống hoặc nhập 0 nếu không giới hạn thời gian.</span>
              )}
            </label>
          </div>
        ) : null}
      </div>

      {saveMessage ? <p className="mt-4 text-sm font-medium text-[#5fa876]">{saveMessage}</p> : null}
      {saveError ? <p className="mt-4 text-sm font-medium text-[#c25a5a]">{saveError}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving || !hasChanges}
          onClick={handleReset}
          className="h-10 rounded-lg border border-line bg-white px-5 text-sm font-semibold text-muted transition hover:bg-beige disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          disabled={saving || !hasChanges}
          onClick={handleSave}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-coffee px-5 text-sm font-semibold text-white transition hover:bg-coffee/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Lưu cấu hình
        </button>
      </div>
    </Card>
  )
}
