import { httpClient } from './httpClient'
import type { Branch } from '../types'
import type { BranchMenuView } from '../types/menu.types'

export interface PublicCategory {
  id: string
  name: string
  icon?: string
  displayOrder: number
}

export interface PublicTopping {
  id: string
  name: string
  extraPrice: number
  isActive: boolean
}

export interface PublicToppingGroup {
  id: string
  name: string
  isRequired: boolean
  minSelect: number
  maxSelect: number
  toppings: PublicTopping[]
}

export interface PublicMenuItemVariant {
  id: string
  name: string
  priceAdjustment: number
}

export interface PublicMenuItem {
  id: string
  categoryId: string
  name: string
  description?: string | null
  imageUrl?: string | null
  basePrice: number
  isFeatured?: boolean
  menuItemVariants?: PublicMenuItemVariant[]
  menuItemToppingGroups?: { toppingGroup: PublicToppingGroup }[]
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

export function getTopSellingMenu() {
  return httpClient<{ data: PublicMenuItem[] }>('/public/menu/top-selling')
}
