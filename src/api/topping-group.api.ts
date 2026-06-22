import { httpClient } from './httpClient'

export async function getToppingGroups() {
  return httpClient<any>('/topping-groups')
}

export async function createToppingGroup(data: any) {
  return httpClient<any>('/topping-groups', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function softDeleteToppingGroup(id: string) {
  return httpClient<any>(`/topping-groups/${id}`, {
    method: 'DELETE'
  })
}
