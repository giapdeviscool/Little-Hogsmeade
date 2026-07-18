import { httpClient } from './httpClient'

export interface PublicCategory {
  id: string
  name: string
  icon?: string
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
