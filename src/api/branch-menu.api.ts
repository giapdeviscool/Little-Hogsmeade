import { httpClient } from './httpClient'
import { getAuthToken } from '../store/auth.store'
import type { BranchMenuView } from '../types/menu.types'

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function getBranchMenu(branchId: string) {
  return httpClient<{ data: BranchMenuView }>(`/chain/branch-menu/${branchId}/menu`, {
    headers: authHeaders(),
  })
}

export function updateBranchCategories(branchId: string, categories: { categoryId: string; isActive: boolean; displayOrder?: number }[]) {
  return httpClient<{ data: any }>(`/chain/branch-menu/${branchId}/categories`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ categories }),
  })
}

export function updateBranchMenuItems(branchId: string, items: { menuItemId: string; isActive: boolean; basePrice?: number | null }[]) {
  return httpClient<{ data: any }>(`/chain/branch-menu/${branchId}/items`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ items }),
  })
}
