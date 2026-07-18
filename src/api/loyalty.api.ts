import { httpClient } from './httpClient'
import { env } from '../config/env'
import { getAuthSession } from '../store/auth.store'
import type {
  ApiResponse,
  LoyaltyConfigApiRecord,
  LoyaltyConfigUpdatePayload,
  LoyaltyEarnConfig,
  LoyaltyReward,
  LoyaltyRewardApiRecord,
  LoyaltyRewardListParams,
  LoyaltyRewardListResult,
  LoyaltyRewardPayload,
  LoyaltyRewardUpsertPayload,
  PaginatedData,
} from '../types'
import { defaultLoyaltyEarnConfig } from '../pages/loyalty/loyalty.constants'

function resolveBranchId(branchId?: string) {
  return branchId || getAuthSession()?.user?.branchId || env.defaultBranchId || undefined
}

function buildBranchQuery(branchId?: string, existingQuery = '') {
  const resolvedBranchId = resolveBranchId(branchId)
  if (!resolvedBranchId) return existingQuery

  const separator = existingQuery ? '&' : '?'
  return `${existingQuery}${separator}branchId=${encodeURIComponent(resolvedBranchId)}`
}

export function mapLoyaltyConfigFromApi(data: LoyaltyConfigApiRecord): LoyaltyEarnConfig {
  return {
    id: data.id,
    branchId: data.branch_id,
    spendAmount: data.spend_amount,
    pointsEarned: data.earn_point,
    earnOnVoucherOrders: data.allow_voucher_earning,
    allowFractionalPoints: data.allow_fractional_points,
    pointExpiryDays: data.points_expiry_days === 0 ? null : data.points_expiry_days,
    isActive: data.is_active,
  }
}

export function mapLoyaltyConfigToApi(config: LoyaltyEarnConfig): LoyaltyConfigUpdatePayload {
  return {
    spend_amount: config.spendAmount,
    earn_point: config.pointsEarned,
    points_expiry_days: config.pointExpiryDays ?? 0,
    allow_voucher_earning: config.earnOnVoucherOrders,
    allow_fractional_points: config.allowFractionalPoints,
    is_active: config.isActive,
  }
}

export function mapLoyaltyRewardFromApi(data: LoyaltyRewardApiRecord): LoyaltyReward {
  return {
    id: data.id,
    name: data.name,
    pointsRequired: data.pointsRequired,
    discountValue: data.discountValue,
    discountType: data.discountType,
    minOrderValue: data.minOrderValue,
    expiryDays: data.expiryDays,
    description: data.description ?? undefined,
    imageUrl: data.imageUrl ?? undefined,
    isActive: data.isActive,
    isDeleted: data.isDeleted,
  }
}

export function mapLoyaltyRewardToApi(payload: LoyaltyRewardPayload): LoyaltyRewardUpsertPayload {
  return {
    name: payload.name.trim(),
    pointsRequired: payload.pointsRequired,
    discountValue: payload.discountValue,
    discountType: payload.discountType,
    minOrderValue: payload.minOrderValue,
    expiryDays: payload.expiryDays,
    description: payload.description?.trim() || undefined,
    isActive: payload.isActive,
  }
}

export async function getLoyaltyConfig(branchId?: string): Promise<LoyaltyEarnConfig> {
  const response = await httpClient<ApiResponse<LoyaltyConfigApiRecord>>(
    `/admin/loyalty/configs${buildBranchQuery(branchId)}`,
  )

  if (!response.data) {
    return defaultLoyaltyEarnConfig
  }

  return mapLoyaltyConfigFromApi(response.data)
}

export async function saveLoyaltyConfig(
  config: LoyaltyEarnConfig,
  branchId?: string,
): Promise<LoyaltyEarnConfig> {
  const response = await httpClient<ApiResponse<LoyaltyConfigApiRecord>>(
    `/admin/loyalty/configs${buildBranchQuery(branchId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(mapLoyaltyConfigToApi(config)),
    },
  )

  if (!response.data) {
    return config
  }

  return mapLoyaltyConfigFromApi(response.data)
}

function buildRewardsQuery(params: LoyaltyRewardListParams = {}) {
  const query = new URLSearchParams()

  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search?.trim()) query.set('search', params.search.trim())
  if (params.reward_type) query.set('reward_type', params.reward_type)
  if (params.status) query.set('status', params.status)

  const base = query.toString() ? `?${query.toString()}` : ''
  return buildBranchQuery(params.branchId, base)
}

export async function getLoyaltyRewards(
  params: LoyaltyRewardListParams = {},
): Promise<LoyaltyRewardListResult> {
  const response = await httpClient<ApiResponse<PaginatedData<LoyaltyRewardApiRecord>>>(
    `/admin/loyalty/rewards${buildRewardsQuery(params)}`,
  )

  const data = response.data
  const items = (data?.items ?? []).map(mapLoyaltyRewardFromApi)
  const pagination = data?.pagination ?? {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    total: items.length,
    totalPages: 1,
  }

  return { items, pagination }
}

export async function getCustomerLoyaltyRewards(
  branchId?: string,
): Promise<LoyaltyReward[]> {
  // Using public endpoint that doesn't require admin role
  const response = await httpClient<ApiResponse<PaginatedData<LoyaltyRewardApiRecord>>>(
    `/customer/loyalty/rewards${buildBranchQuery(branchId)}`
  )

  const data = response.data
  return (data?.items ?? []).map(mapLoyaltyRewardFromApi)
}

export async function createLoyaltyReward(payload: LoyaltyRewardPayload): Promise<LoyaltyReward> {
  const response = await httpClient<ApiResponse<LoyaltyRewardApiRecord>>('/admin/loyalty/rewards', {
    method: 'POST',
    body: JSON.stringify(mapLoyaltyRewardToApi(payload)),
  })

  if (!response.data) {
    throw new Error('Không tạo được phần thưởng.')
  }

  return mapLoyaltyRewardFromApi(response.data)
}

export async function updateLoyaltyReward(
  id: string,
  payload: LoyaltyRewardPayload,
): Promise<LoyaltyReward> {
  const response = await httpClient<ApiResponse<LoyaltyRewardApiRecord>>(`/admin/loyalty/rewards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapLoyaltyRewardToApi(payload)),
  })

  if (!response.data) {
    throw new Error('Không cập nhật được phần thưởng.')
  }

  return mapLoyaltyRewardFromApi(response.data)
}

export async function deleteLoyaltyReward(id: string): Promise<void> {
  await httpClient<ApiResponse<unknown>>(`/admin/loyalty/rewards/${id}`, {
    method: 'DELETE',
  })
}

export async function toggleLoyaltyRewardStatus(reward: LoyaltyReward): Promise<LoyaltyReward> {
  return updateLoyaltyReward(reward.id, {
    name: reward.name,
    type: reward.type,
    pointsRequired: reward.pointsRequired,
    voucherAmount: reward.voucherAmount,
    minOrderAmount: reward.minOrderAmount,
    menuItemId: reward.menuItemId,
    description: reward.description,
    isActive: !reward.isActive,
  })
}

export interface MembershipTier {
  id: string;
  name: string;
  minPoints: number;
  discountPercent: number;
  description?: string;
}

export type MembershipTierPayload = Omit<MembershipTier, 'id'>;

export async function getMembershipTiers(): Promise<MembershipTier[]> {
  const response = await httpClient<ApiResponse<MembershipTier[]>>('/admin/loyalty/tiers')
  return response.data || []
}

export async function createMembershipTier(payload: MembershipTierPayload): Promise<MembershipTier> {
  const response = await httpClient<ApiResponse<MembershipTier>>('/admin/loyalty/tiers', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  if (!response.data) throw new Error('Không tạo được Hạng thẻ')
  return response.data
}

export async function updateMembershipTier(id: string, payload: Partial<MembershipTierPayload>): Promise<MembershipTier> {
  const response = await httpClient<ApiResponse<MembershipTier>>(`/admin/loyalty/tiers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
  if (!response.data) throw new Error('Không cập nhật được Hạng thẻ')
  return response.data
}

export async function deleteMembershipTier(id: string): Promise<void> {
  await httpClient(`/admin/loyalty/tiers/${id}`, {
    method: 'DELETE'
  })
}
