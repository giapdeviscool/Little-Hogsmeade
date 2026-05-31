import { httpClient } from './httpClient'
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload } from '../types'

export function login(payload: LoginPayload) {
  return httpClient<ApiResponse<AuthResponse>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: RegisterPayload) {
  return httpClient<ApiResponse<AuthResponse>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
