export type RewardType = 'VOUCHER' | 'FREE_PRODUCT'

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
  name: string
  type: RewardType
  pointsRequired: number
  voucherAmount?: number
  minOrderAmount?: number
  menuItemId?: string
  menuItemName?: string
  description?: string
  isActive: boolean
  isDeleted?: boolean
}

export type LoyaltyRewardPayload = Omit<LoyaltyReward, 'id' | 'isDeleted' | 'menuItemName'>

export type LoyaltyRewardStatus = 'active' | 'inactive'

export type LoyaltyRewardApiRecord = {
  id: string
  branch_id?: string
  name: string
  required_points: number
  reward_type: RewardType
  discount_value?: number | null
  min_order_value?: number | null
  product_id?: string | null
  product?: { id: string; name: string } | null
  product_name?: string | null
  description?: string | null
  status: LoyaltyRewardStatus
  is_deleted?: boolean
}

export type LoyaltyRewardUpsertPayload = {
  name: string
  required_points: number
  reward_type: RewardType
  discount_value?: number | null
  min_order_value?: number | null
  product_id?: string | null
  description?: string
  status: LoyaltyRewardStatus
}

export type LoyaltyRewardListParams = {
  page?: number
  limit?: number
  search?: string
  reward_type?: RewardType
  status?: 'active' | 'inactive'
  branchId?: string
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

export type RewardFormErrors = Partial<Record<'name' | 'pointsRequired' | 'voucherAmount' | 'menuItemId', string>>

export type EarnConfigErrors = Partial<Record<'spendAmount' | 'pointsEarned' | 'pointExpiryDays', string>>
