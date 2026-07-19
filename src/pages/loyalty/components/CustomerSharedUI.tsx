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

export function CustomerTierBadge({ tier }: { tier: string }) {
  // If we want a dynamic color based on the name, we could do a simple hash or just use a fallback color.
  // We'll map known tiers to specific styles, and fallback to beige for custom tiers like 'Bronze'.
  const upperTier = tier.toUpperCase();
  const style = tierStyles[upperTier as MembershipTierCode] || 'bg-beige text-coffee';
  const label = tierLabels[upperTier as MembershipTierCode] || tier;

  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', style)}>
      {label}
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
    'online': 'Online',
    'app': 'Ứng dụng',
    'customer-app': 'Ứng dụng Khách hàng',
    'customer_app': 'Ứng dụng Khách hàng',
    'pos_in_store': 'Tại quầy',
    'web': 'Web',
    'booking': 'Đặt bàn',
  }

  const normalized = source.toLowerCase()
  return labels[normalized] ?? source
}

export function formatPointTransactionLabel(
  transactionType: 'EARN' | 'REDEEM' | 'EXPIRED',
  points: number,
) {
  const formatted = formatCustomerPoints(points)
  if (transactionType === 'EARN') return `+ ${formatted} điểm`
  return `- ${formatted} điểm`
}
