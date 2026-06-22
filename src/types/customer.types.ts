export type Customer = {
  id: string
  phone: string
  fullName: string
  email?: string
  birthday?: string
  avatarUrl?: string
  createdAt: string
  source: string
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
