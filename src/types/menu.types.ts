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
  _count?: {
    menuItemToppingGroups: number
  }
}

export interface ToppingGroupAssignment {
  id: string
  name: string
  minSelect: number
  maxSelect: number
  toppingsCount: number
  isAssigned: boolean
}

export interface BranchCategory {
  id: string
  branchId: string
  categoryId: string
  isActive: boolean
  displayOrder?: number
  category?: Category
}

export interface BranchMenuItem {
  id: string
  branchId: string
  menuItemId: string
  isActive: boolean
  basePrice?: number
  menuItem?: MenuItem
}

export interface BranchMenuView {
  categories: any[]
  menuItems: any[]
}

