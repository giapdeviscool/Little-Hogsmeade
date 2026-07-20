export interface Recipe {
  id: string
  menuItemId: string
  menuItemName: string
  variantId: string | null
  variantName: string | null
  ingredientId: string
  ingredientName: string
  unit: string
  quantityRequired: number
  isIngredientActive: boolean
  currentStock?: number
}

export interface RecipeFilterParams {
  page?: number
  limit?: number
  search?: string
  ingredientId?: string
  branchId?: string
}
