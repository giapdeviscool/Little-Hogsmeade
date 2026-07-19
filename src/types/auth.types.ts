export type AuthMode = 'login' | 'register' | 'forgot'

export type AuthRole = 'Chain Owner' | 'Branch Manager' | 'Cashier' | 'Customer'

export type AccountType = 'customer' | 'employee'

export type AuthUser = {
  id: string
  fullName?: string
  name?: string
  phone?: string
  email?: string | null
  role?: AuthRole
  roleId?: string
  roleName?: string | null
  branchId?: string
  branchName?: string
  branch?: string
}

export type AuthResponse = {
  accountType: AccountType
  user: AuthUser
  token: string
}

export type ApiResponse<T> = {
  data?: T
  error?: string
}

export type PaginatedData<T> = {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type LoginPayload = {
  identifier: string
  password: string
}

export type RegisterPayload = {
  accountType: 'customer'
  fullName: string
  phone: string
  email?: string
  password: string
}
