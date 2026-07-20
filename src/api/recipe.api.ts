import { httpClient } from './httpClient'
import type { Recipe, RecipeFilterParams } from '../types'

export function getRecipes(params?: RecipeFilterParams) {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.ingredientId) queryParams.append('ingredientId', params.ingredientId)
  if (params?.branchId) queryParams.append('branchId', params.branchId)

  const queryString = queryParams.toString()
  const url = queryString ? `/recipes?${queryString}` : '/recipes'
  
  return httpClient<{ data: { items: Recipe[], pagination: any } }>(url)
}

export function setMenuItemRecipes(menuItemId: string, variantId: string | null, recipes: { ingredientId: string, quantityRequired: number }[]) {
  return httpClient<{ data: any }>(`/menu-items/${menuItemId}/recipes`, {
    method: 'PUT',
    body: JSON.stringify({ variantId, recipes })
  })
}
