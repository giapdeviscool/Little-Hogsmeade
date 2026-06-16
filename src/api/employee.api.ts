import { httpClient } from './httpClient'
import type {
  EmployeeListParams,
  PaginatedResponse,
  Employee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  Role,
  Branch,
} from '../types'

interface ApiResponse<T> {
  data: T
  message?: string
}

/** Backend returns { data: Employee, generatedPin: string, message: string } */
interface CreateEmployeeApiResponse {
  data: Employee
  generatedPin: string
  message?: string
}

export function getEmployees(params: EmployeeListParams) {
  const query = new URLSearchParams()
  if (params.page) query.append('page', params.page.toString())
  if (params.limit) query.append('limit', params.limit.toString())
  if (params.status) query.append('status', params.status)
  if (params.branchId) query.append('branchId', params.branchId)
  if (params.roleId) query.append('roleId', params.roleId)
  if (params.search) query.append('search', params.search)

  return httpClient<ApiResponse<PaginatedResponse<Employee>>>(`/employees?${query.toString()}`)
}

export function createEmployee(payload: CreateEmployeePayload) {
  return httpClient<CreateEmployeeApiResponse>('/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateEmployee(id: string, payload: UpdateEmployeePayload) {
  return httpClient<ApiResponse<Employee>>(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function getRoles() {
  return httpClient<ApiResponse<Role[]>>('/roles')
}

export function assignRole(employeeId: string, roleId: string) {
  return httpClient<ApiResponse<Employee>>(`/employees/${employeeId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ roleId }),
  })
}

export function getBranches() {
  return httpClient<ApiResponse<Branch[]>>('/branches')
}
