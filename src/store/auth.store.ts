import type { AuthResponse, AuthUser } from '../types'

const AUTH_STORAGE_KEY = 'little-hogsmeade-auth'

export const demoUser: AuthUser = {
  id: 'usr_demo_admin',
  name: 'Anha Nguyễn',
  role: 'Chain Owner',
}

export function saveAuthSession(session: AuthResponse) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function getAuthSession() {
  const storedSession = localStorage.getItem(AUTH_STORAGE_KEY)
  return storedSession ? (JSON.parse(storedSession) as AuthResponse) : null
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
