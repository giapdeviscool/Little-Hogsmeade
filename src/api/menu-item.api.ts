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
