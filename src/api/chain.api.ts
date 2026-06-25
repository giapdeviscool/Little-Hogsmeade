import { httpClient } from './httpClient'
import { env } from '../config/env'
import { getAuthToken } from '../store/auth.store'
import type { ApiResponse, PaginatedData, Branch, BranchListResponse, BranchPayload, ChainConfig, ChainDashboard, MenuSyncPreview, MenuSyncResult, Promotion, PromotionPayload } from '../types'

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

export async function exportChainDashboard(params: { branchId?: string; startDate?: string; endDate?: string }) {
  const query = new URLSearchParams()
  const headers = authHeaders()

  if (params.branchId) query.set('branchId', params.branchId)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)

  const response = await fetch(`${env.apiBaseUrl}/chain/dashboard/export?${query.toString()}`, {
    headers,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.blob()
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

export function toggleBranchStatus(id: string) {
  return httpClient<ApiResponse<Branch>>(`/branches/${id}/toggle-status`, {
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

export function getPromotions(params?: Record<string, string | number>) {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : ''
  return httpClient<ApiResponse<PaginatedData<Promotion>>>(`/promotions${query}`, {
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

export function updatePromotion(id: string, payload: PromotionPayload) {
  return httpClient<ApiResponse<Promotion>>(`/promotions/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function togglePromotionStatus(id: string) {
  return httpClient<ApiResponse<Promotion>>(`/promotions/${id}/toggle-status`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
}
