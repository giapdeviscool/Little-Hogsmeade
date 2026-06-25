import { httpClient } from './httpClient'

export function getMenuItems(params?: Record<string, any>) {
  const query = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value.toString())
      }
    })
  }

  return httpClient<any>(`/menu-items?${query.toString()}`)
}

export function createMenuItem(data: FormData) {
  return httpClient<any>('/menu-items', {
    method: 'POST',
    body: data
  })
}

export function updateMenuItem(id: string, data: FormData) {
  return httpClient<any>(`/menu-items/${id}`, {
    method: 'PUT',
    body: data
  })
}

export function updateMenuItemStatus(id: string, isActive: boolean) {
  return httpClient<any>(`/menu-items/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive })
  })
}

export function getMenuItemToppingGroups(id: string) {
  return httpClient<any>(`/menu-items/${id}/topping-groups`)
}

export function assignMenuItemToppingGroups(id: string, toppingGroupIds: string[]) {
  return httpClient<any>(`/menu-items/${id}/topping-groups`, {
    method: 'PUT',
    body: JSON.stringify({ toppingGroupIds })
  })
}

export function moveItemsToCategory(menuItemIds: string[], categoryId: string) {
  return httpClient<any>('/menu-items/move-category', {
    method: 'PATCH',
    body: JSON.stringify({ menuItemIds, categoryId }),
  })
}

