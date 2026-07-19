import { httpClient } from './httpClient'
import type { Branch } from '../types'
import type { BranchMenuView } from '../types/menu.types'

export interface PublicCategory {
  id: string
  name: string
  displayOrder: number
}

export interface PublicMenuItem {
  id: string
  categoryId: string
  name: string
  description?: string
  imageUrl?: string
  basePrice: number
  isFeatured: boolean
}

export interface PublicMenuResponse {
  categories: PublicCategory[]
  menuItems: PublicMenuItem[]
}

export function getPublicMenu() {
  return httpClient<{ data: PublicMenuResponse }>('/public/menu')
}

export function getPublicBranchMenu(branchId: string) {
  return httpClient<{ data: BranchMenuView }>(`/public/menu/${branchId}`)
}

export function getBranchesPublic() {
  return httpClient<{ data: { items: Branch[] } }>('/branches?status=active&limit=100')
}
