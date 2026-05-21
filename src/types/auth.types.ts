export type AuthMode = 'login' | 'register' | 'forgot'

export type AuthRole = 'Chain Owner' | 'Branch Manager' | 'Cashier'

export type AuthUser = {
  id: string
  name: string
  role: AuthRole
}
