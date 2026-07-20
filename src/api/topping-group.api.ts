import { httpClient } from './httpClient'

export async function getToppingGroups(branchId?: string) {
  const query = branchId ? `?branchId=${branchId}` : ''
  return httpClient<any>(`/topping-groups${query}`)
}

export async function createToppingGroup(data: any) {
  return httpClient<any>('/topping-groups', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function updateToppingGroup(id: string, data: any) {
  return httpClient<any>(`/topping-groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function softDeleteToppingGroup(id: string) {
  return httpClient<any>(`/topping-groups/${id}`, {
    method: 'DELETE'
  })
}
