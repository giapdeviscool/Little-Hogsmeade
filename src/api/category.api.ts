import { httpClient } from './httpClient'

export async function getCategories(params: { page?: number; limit?: number; search?: string; status?: string; branchId?: string }) {
  const query = new URLSearchParams()
  if (params.page) query.append('page', params.page.toString())
  if (params.limit) query.append('limit', params.limit.toString())
  
  if (params.search) {
    query.append('search', params.search)
  }
  if (params.status) {
    query.append('status', params.status)
  }
  if (params.branchId) {
    query.append('branchId', params.branchId)
  }

  return httpClient<any>(`/categories?${query.toString()}`)
}

export async function createCategory(data: Partial<any>) {
  return httpClient<any>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCategory(id: string, data: Partial<any>) {
  return httpClient<any>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCategory(id: string) {
  return httpClient<any>(`/categories/${id}`, {
    method: 'DELETE',
  })
}
