import { env } from '../config/env'

export async function httpClient<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null) as { message?: string; errors?: Array<{ message: string }> } | null
    const validationMessage = errorPayload?.errors?.map((error) => error.message).join('. ')
    throw new Error(validationMessage || errorPayload?.message || `Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}
