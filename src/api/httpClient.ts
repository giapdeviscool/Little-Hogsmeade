import { env } from '../config/env'
import { getAuthToken } from '../store/auth.store'

export async function httpClient<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...init?.headers }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null) as { message?: string; errors?: Array<{ message: string }> } | null
    const validationMessage = errorPayload?.errors?.map((error) => error.message).join('. ')
    throw new Error(validationMessage || errorPayload?.message || `Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}
