export type MembershipTierCode = 'MEMBER' | 'SILVER' | 'GOLD' | 'VIP'

export type Customer = {
  id: string
  phone: string
  fullName: string
  email?: string
  birthday?: string
  avatarUrl?: string
  createdAt: string
  source: string
  isNew?: boolean
}

export type CustomerListItem = {
  id: string
  fullName: string
  phone: string
  avatarUrl?: string
  tier: string
  totalPoints: number
  totalSpent: number
}

export type CustomerListParams = {
  page?: number
  limit?: number
  search?: string
  tier?: string
}

export type CustomerListApiRecord = {
  id: string
  full_name?: string
  fullName?: string
  phone: string
  avatar_url?: string | null
  avatarUrl?: string | null
  tier?: MembershipTierCode | string
  total_points?: number
  totalPoints?: number
  total_spent?: number
  totalSpent?: number
  membership?: {
    tier?: { name?: string } | string
    total_points?: number
    total_spent?: number
    totalPoints?: number
    totalSpent?: number
  }
}

export type MembershipTier = {
  id: string
  name: string
  minPoints: number
  discountPercent: number
  description?: string
}

export type CustomerMembership = {
  id: string
  customerId: string
  tierId: string
  totalPoints: number
  totalSpent: number
  joinedAt: string
  updatedAt: string
  customer?: Customer
  tier?: MembershipTier
}

export type PointTransaction = {
  id: string
  customerMembershipId: string
  orderId?: string
  type: string
  points: number
  note?: string
  createdAt: string
}

export type CustomerProfile = {
  id: string
  fullName: string
  phone: string
  email?: string
  birthday?: string | null
  avatarUrl?: string
  createdAt: string
  source: string
  tier: string
  totalPoints: number
  totalSpent: number
  rawPhone?: string
}

export type CustomerProfileApiRecord = CustomerListApiRecord & {
  email?: string | null
  birthday?: string | null
  created_at?: string
  createdAt?: string
  joined_date?: string
  source?: string
  registration_source?: string
  raw_phone?: string
  customerMemberships?: CustomerMembership[]
}

export type CustomerOrderHistoryItem = {
  id: string
  orderCode: string
  purchasedAt: string
  branchName: string
  briefItems: string
  totalAmount?: number
}

export type CustomerOrderApiRecord = {
  id: string
  order_code?: string
  orderCode?: string
  created_at?: string
  createdAt?: string
  branch_name?: string
  branchName?: string
  brief_items?: string | string[]
  total_amount?: number
  totalAmount?: number
}

export type PointTransactionType = 'EARN' | 'REDEEM' | 'EXPIRED'

export type CustomerPointTransaction = {
  id: string
  transactionType: PointTransactionType
  points: number
  note?: string
  createdAt: string
}

export type CustomerPointTransactionApiRecord = {
  id?: string
  transaction_id?: string
  transaction_type?: string
  transactionType?: string
  type?: string
  points?: number
  points_changed?: number
  note?: string | null
  description?: string | null
  created_at?: string
  createdAt?: string
}

export type CustomerProfileTab = 'orders' | 'points'
