import { httpClient } from './httpClient'
import { getAuthToken } from '../store/auth.store'
import type { ApiResponse, Branch, BranchListResponse, BranchPayload, ChainConfig, ChainDashboard, MenuSyncPreview, MenuSyncResult, Promotion, PromotionPayload } from '../types'

function authHeaders(): Record<string, string> {
  const token = getAuthToken()

  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function getChainDashboard(params: { branchId?: string; startDate?: string; endDate?: string }) {
  const query = new URLSearchParams()

  if (params.branchId) query.set('branchId', params.branchId)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)

  return httpClient<ApiResponse<ChainDashboard>>(`/chain/dashboard?${query.toString()}`, {
    headers: authHeaders(),
  })
}

export function getBranches() {
  return httpClient<ApiResponse<BranchListResponse>>('/branches?limit=100', {
    headers: authHeaders(),
  })
}

export function createBranch(payload: BranchPayload) {
  return httpClient<ApiResponse<Branch>>('/branches', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function updateBranch(id: string, payload: BranchPayload) {
  return httpClient<ApiResponse<Branch>>(`/branches/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function deactivateBranch(id: string) {
  return httpClient<ApiResponse<Branch>>(`/branches/${id}/deactivate`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
}

export function getChainConfig() {
  return httpClient<ApiResponse<ChainConfig>>('/chain/config', {
    headers: authHeaders(),
  })
}

export function updateChainConfig(payload: Partial<Pick<ChainConfig, 'loyaltyEarnRate' | 'globalPricingEnabled' | 'defaultCurrency'>>) {
  return httpClient<ApiResponse<ChainConfig>>('/chain/config', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function getMenuSyncPreview() {
  return httpClient<ApiResponse<MenuSyncPreview>>('/chain/menu-sync-preview', {
    headers: authHeaders(),
  })
}

export function syncMenu() {
  return httpClient<ApiResponse<MenuSyncResult>>('/chain/sync-menu', {
    method: 'POST',
    headers: authHeaders(),
  })
}

export function updatePricing(payload: { menuItemId: string; basePrice: number; branchIds: string[] }) {
  return httpClient<ApiResponse<{ updatedBranchItems: number; targetBranches: number }>>('/chain/pricing', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function getPromotions() {
  return httpClient<ApiResponse<Promotion[]>>('/promotions', {
    headers: authHeaders(),
  })
}

export function createPromotion(payload: PromotionPayload) {
  return httpClient<ApiResponse<Promotion>>('/promotions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}
