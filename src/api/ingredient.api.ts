import { httpClient } from './httpClient'

export interface Ingredient {
  id: string
  name: string
  sku: string | null
  unit: string
  importUnit: string | null
  conversionRate: number
  category: string | null
  branchId: string | null
  minStockLevel: number
  currentStock: number
  isActive: boolean
}

export function getIngredients(params?: { search?: string, branchId?: string }) {
  const query = new URLSearchParams()
  if (params?.search) query.append('search', params.search)
  if (params?.branchId) query.append('branchId', params.branchId)
  
  const url = `/ingredients?${query.toString()}`
  return httpClient<{ data: Ingredient[] }>(url)
}

export function createIngredient(data: Partial<Ingredient>) {
  return httpClient<{ data: Ingredient }>('/ingredients', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function updateIngredient(id: string, data: Partial<Ingredient>) {
  return httpClient<{ data: Ingredient }>(`/ingredients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}
