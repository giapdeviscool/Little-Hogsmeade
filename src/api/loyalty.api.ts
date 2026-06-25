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
    type: data.reward_type,
    pointsRequired: data.required_points,
    voucherAmount: data.discount_value ?? undefined,
    minOrderAmount: data.min_order_value ?? undefined,
    menuItemId: data.product_id ?? undefined,
    menuItemName: data.product?.name ?? data.product_name ?? undefined,
    description: data.description ?? undefined,
    isActive: data.status === 'active',
    isDeleted: data.is_deleted,
  }
}

export function mapLoyaltyRewardToApi(payload: LoyaltyRewardPayload): LoyaltyRewardUpsertPayload {
  return {
    name: payload.name.trim(),
    required_points: payload.pointsRequired,
    reward_type: payload.type,
    discount_value: payload.type === 'VOUCHER' ? payload.voucherAmount ?? 0 : null,
    min_order_value: payload.type === 'VOUCHER' ? payload.minOrderAmount ?? 0 : null,
    product_id: payload.type === 'FREE_PRODUCT' ? payload.menuItemId ?? null : null,
    description: payload.description?.trim() || undefined,
    status: payload.isActive ? 'active' : 'inactive',
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
