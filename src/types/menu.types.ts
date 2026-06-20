export interface Category {
  id: string
  branchId?: string
  name: string
  icon?: string
  displayOrder: number
  isActive: boolean
  _count?: {
    menuItems: number
  }
}

export interface MenuItem {
  id: string
  categoryId: string
  branchId?: string
  name: string
  description?: string
  imageUrl?: string
  basePrice: number
  isActive: boolean
  isFeatured: boolean
  itemType: string
  category: {
    name: string
    displayOrder: number
  }
}
