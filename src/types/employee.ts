export interface Role {
  id: string
  name: string
}

export interface Branch {
  id: string
  name: string
  address?: string
}

export interface Employee {
  id: string
  fullName: string
  phone: string
  email: string | null
  avatarUrl: string | null
  roleId: string
  branchId: string
  hiredDate: string
  baseSalary: number | null
  status: 'active' | 'on_leave' | 'resigned' | 'inactive'
  role?: Role
  branch?: Branch
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface EmployeeListParams {
  page?: number
  limit?: number
  status?: string
  branchId?: string
  roleId?: string
  search?: string
}

export interface CreateEmployeePayload {
  fullName: string
  phone: string
  email?: string
  roleId: string
  branchId: string
  baseSalary?: number
  hiredDate?: string
  avatarUrl?: string
}

export interface UpdateEmployeePayload {
  fullName?: string
  phone?: string
  email?: string | null
  baseSalary?: number | null
  status?: string
  avatarUrl?: string | null
  hiredDate?: string
}

export interface CreateEmployeeResponse {
  employee: Employee
  generatedPin: string
}
