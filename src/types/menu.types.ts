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
