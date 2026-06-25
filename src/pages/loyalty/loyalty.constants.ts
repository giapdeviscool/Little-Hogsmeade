import type { LoyaltyEarnConfig, LoyaltyTab } from './loyalty.types'

export const loyaltyTabKeys: LoyaltyTab[] = ['earning', 'rewards']

export const defaultLoyaltyEarnConfig: LoyaltyEarnConfig = {
  spendAmount: 10000,
  pointsEarned: 1,
  earnOnVoucherOrders: false,
  allowFractionalPoints: false,
  pointExpiryDays: 365,
  isActive: true,
}

export const fallbackMenuOptions = [
  { id: 'menu-peach-tea', name: 'Trà Đào size M' },
  { id: 'menu-cappuccino', name: 'Cappuccino Đặc Biệt' },
  { id: 'menu-latte', name: 'Latte Sữa Oat' },
  { id: 'menu-croissant', name: 'Croissant Bơ Pháp' },
]
