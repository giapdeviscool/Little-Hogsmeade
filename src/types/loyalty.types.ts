export type RewardType = 'percent' | 'fixed' | 'gift'
export type TypeFilter = 'all' | 'percent' | 'fixed' | 'gift'

export type LoyaltyEarnConfig = {
  id?: string
  branchId?: string
  spendAmount: number
  pointsEarned: number
  earnOnVoucherOrders: boolean
  allowFractionalPoints: boolean
  pointExpiryDays: number | null
  isActive: boolean
}

export type LoyaltyConfigApiRecord = {
  id: string
  branch_id: string
  spend_amount: number
  earn_point: number
  spend_per_point?: number
  point_to_vnd?: number
  points_expiry_days: number
  allow_voucher_earning: boolean
  allow_fractional_points: boolean
  is_active: boolean
}

export type LoyaltyConfigUpdatePayload = {
  spend_amount: number
  earn_point: number
  points_expiry_days: number
  allow_voucher_earning: boolean
  allow_fractional_points: boolean
  is_active: boolean
}

export type LoyaltyReward = {
  id: string
  branchId?: string | null
  name: string
  pointsRequired: number
  discountValue: number
  discountType: 'percent' | 'fixed' | 'gift'
  minOrderValue: number
  expiryDays: number
  description?: string
  imageUrl?: string
  isActive: boolean
  isDeleted?: boolean
}

export type LoyaltyRewardPayload = Omit<LoyaltyReward, 'id' | 'isDeleted'>

export type LoyaltyRewardStatus = 'active' | 'inactive'

export type LoyaltyRewardApiRecord = {
  id: string
  branch_id?: string
  name: string
  pointsRequired: number
  discountValue: number
  discountType: 'percent' | 'fixed' | 'gift'
  minOrderValue: number
  expiryDays: number
  description?: string | null
  imageUrl?: string | null
  isActive: boolean
  isDeleted?: boolean
}

export type LoyaltyRewardUpsertPayload = {
  name: string
  branchId?: string | null
  pointsRequired: number
  discountValue: number
  discountType: 'percent' | 'fixed' | 'gift'
  minOrderValue: number
  expiryDays: number
  description?: string
  imageUrl?: string | null
  isActive: boolean
}

export type LoyaltyRewardListParams = {
  page?: number
  limit?: number
  search?: string
  discount_type?: TypeFilter
  status?: 'active' | 'inactive'
  branchId?: string | null
}

export type LoyaltyRewardListResult = {
  items: LoyaltyReward[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type RewardDialogMode = 'create' | 'edit'

export type RewardFormErrors = Partial<Record<keyof LoyaltyRewardPayload, string>>

export type EarnConfigErrors = Partial<Record<'spendAmount' | 'pointsEarned' | 'pointExpiryDays', string>>
