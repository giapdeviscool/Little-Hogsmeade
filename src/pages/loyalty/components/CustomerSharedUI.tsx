import { cn } from '../../../utils/cn'
import type { MembershipTierCode } from '../../../types/customer.types'

const tierStyles: Record<MembershipTierCode, string> = {
  MEMBER: 'bg-beige text-coffee',
  SILVER: 'bg-[#e8e4df] text-[#6b6258]',
  GOLD: 'bg-[#f6edcf] text-[#9a7b1a]',
  VIP: 'bg-[#ede9fe] text-[#6d28d9]',
}

const tierLabels: Record<MembershipTierCode, string> = {
  MEMBER: 'Member',
  SILVER: 'Silver',
  GOLD: 'Gold',
  VIP: 'VIP',
}

export function CustomerTierBadge({ tier }: { tier: MembershipTierCode }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', tierStyles[tier])}>
      {tierLabels[tier]}
    </span>
  )
}

export function formatCustomerSpent(value: number) {
  return `${Math.round(value).toLocaleString('vi-VN')} đ`
}

export function formatCustomerPoints(value: number) {
  return value.toLocaleString('vi-VN')
}

export function getCustomerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'KH'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function formatCustomerSource(source: string) {
  const labels: Record<string, string> = {
    'walk-in': 'Tại quầy',
    online: 'Online',
    app: 'Ứng dụng',
    booking: 'Đặt bàn',
  }

  return labels[source] ?? source
}

export function formatPointTransactionLabel(
  transactionType: 'EARN' | 'REDEEM' | 'EXPIRED',
  points: number,
) {
  const formatted = formatCustomerPoints(points)
  if (transactionType === 'EARN') return `+ ${formatted} điểm`
  return `- ${formatted} điểm`
}
