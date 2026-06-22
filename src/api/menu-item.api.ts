import { httpClient } from './httpClient'

export async function getMenuItems(params?: Record<string, any>) {
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

export async function createMenuItem(data: FormData) {
  return httpClient<any>('/menu-items', {
    method: 'POST',
    body: data
  })
}

export async function updateMenuItemStatus(id: string, isActive: boolean) {
  return httpClient<any>(`/menu-items/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive })
  })
}

export async function getMenuItemToppingGroups(id: string) {
  return httpClient<any>(`/menu-items/${id}/topping-groups`)
}

export async function assignMenuItemToppingGroups(id: string, toppingGroupIds: string[]) {
  return httpClient<any>(`/menu-items/${id}/topping-groups`, {
    method: 'PUT',
    body: JSON.stringify({ toppingGroupIds })
  })
}

