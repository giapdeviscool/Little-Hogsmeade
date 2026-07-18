export type BranchStatus = 'active' | 'inactive'

export type Branch = {
  id: string
  name: string
  address: string
  phone: string
  email?: string | null
  lat: number
  lng: number
  openTime: string
  closeTime: string
  status: BranchStatus
  allowLocalPricingOverride: boolean
  imageUrl?: string | null
}

export type BranchPayload = {
  name: string
  address: string
  phone: string
  email?: string
  lat: number
  lng: number
  openTime: string
  closeTime: string
  status: BranchStatus
  allowLocalPricingOverride: boolean
  imageUrl: string | null
  imageFile: File | null
}

export type BranchListResponse = {
  items: Branch[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type ChainDashboard = {
  filters: {
    startDate: string
    endDate: string
    branchId: string | null
  }
  kpis: {
    totalRevenue: number
    totalOrders: number
    grossProfit: number
  }
  revenueSeries: Array<{
    date: string
    revenue: number
  }>
  branchPerformance: Array<{
    branchId: string
    branchName: string
    revenue: number
    orders: number
    expenses: number
    grossProfit: number
  }>
  lowStockAlerts: Array<{
    branchId: string
    branchName: string
    count: number
  }>
}

export type ChainConfig = {
  id: string
  loyaltyEarnRate: number
  globalPricingEnabled: boolean
  defaultCurrency: string
}

export type MenuSyncPreview = {
  categories: Array<{
    id: string
    name: string
    displayOrder: number
    isActive: boolean
  }>
  menuItems: Array<{
    id: string
    name: string
    basePrice: number
    itemType: string
    isActive: boolean
  }>
}

export type MenuSyncResult = {
  syncedBranches: number
  syncedBranchIds: string[]
  standardCategories: number
  standardMenuItems: number
}

export type Voucher = {
  id: string
  name: string
  description?: string | null
  code: string | null
  requiresCode: boolean
  startDate: string
  expireDate: string
  discountValue: number
  discountType: 'percent' | 'fixed'
  minOrderValue: number
  maxUses: number
  usedCount: number
  scope: 'global' | 'specific'
  appliedBranches: string[]
  isActive: boolean
}

export type VoucherPayload = {
  name: string
  description?: string
  code?: string
  requiresCode?: boolean
  startDate: string
  expireDate: string
  discountValue: number
  discountType: 'percent' | 'fixed'
  minOrderValue?: number
  maxUses?: number
  scope: 'global' | 'specific'
  appliedBranches: string[]
  isActive?: boolean
}
