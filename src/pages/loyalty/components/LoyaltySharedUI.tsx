import { cn } from '../../../utils/cn'

export function LoyaltyToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={cn(
        'flex items-start justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3',
        disabled && 'opacity-60',
      )}
    >
      <span>
        <span className="block text-sm font-medium text-coffee">{label}</span>
        {description ? <span className="mt-1 block text-xs leading-5 text-muted">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors',
          checked ? 'bg-[#5fa876]' : 'bg-beige',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(74,53,37,0.12)] transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </label>
  )
}

export function InlineSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <div className="inline-flex min-w-[148px] items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors',
          checked ? 'bg-[#5fa876]' : 'bg-beige',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(74,53,37,0.12)] transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
      <span className={cn('shrink-0 whitespace-nowrap text-xs font-semibold', checked ? 'text-[#5fa876]' : 'text-muted')}>
        {label}
      </span>
    </div>
  )
}

export function RewardTypeBadge({ type }: { type: 'VOUCHER' | 'FREE_PRODUCT' }) {
  if (type === 'VOUCHER') {
    return (
      <span className="inline-flex rounded-full bg-[#dbeafe] px-2.5 py-1 text-xs font-semibold text-[#2563eb]">
        Voucher
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-[#ede9fe] px-2.5 py-1 text-xs font-semibold text-[#7c3aed]">
      Sản phẩm miễn phí
    </span>
  )
}

export function formatPoints(value: number) {
  return `${value.toLocaleString('vi-VN')} điểm`
}

export function formatVndAmount(value: number) {
  return `${value.toLocaleString('vi-VN')} VND`
}

export function getRewardValueLabel(reward: {
  type: 'VOUCHER' | 'FREE_PRODUCT'
  voucherAmount?: number
  menuItemName?: string
}) {
  if (reward.type === 'VOUCHER' && reward.voucherAmount) {
    return `Giảm ${formatVndAmount(reward.voucherAmount)}`
  }

  if (reward.type === 'FREE_PRODUCT' && reward.menuItemName) {
    return reward.menuItemName
  }

  return '—'
}
