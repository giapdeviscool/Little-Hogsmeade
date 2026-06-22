import { httpClient } from './httpClient'

export interface MenuItem {
  id: string
  categoryId: string
  branchId: string | null
  name: string
  description: string | null
  imageUrl: string | null
  basePrice: number
  isActive: boolean
  isFeatured: boolean
  itemType: string
}

interface PaginatedResponse<T> {
  data: T[]
}

export function getMenuItems(params?: { limit?: number; skip?: number }) {
  const query = new URLSearchParams()
  if (params?.limit !== undefined) query.append('limit', params.limit.toString())
  if (params?.skip !== undefined) query.append('skip', params.skip.toString())
  return httpClient<PaginatedResponse<MenuItem>>(`/menu-items?${query.toString()}`)
}
