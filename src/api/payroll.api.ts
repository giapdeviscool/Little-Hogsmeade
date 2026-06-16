import { httpClient } from './httpClient'
import type { PayrollSummary, PayrollParams } from '../types'

interface ApiResponse<T> {
  data: T
  message?: string
}

export function getPayroll(params: PayrollParams) {
  const query = new URLSearchParams()
  if (params.month) query.append('month', params.month)
  if (params.branchId) query.append('branchId', params.branchId)
  if (params.employeeId) query.append('employeeId', params.employeeId)
  return httpClient<ApiResponse<PayrollSummary[]>>(`/payroll?${query.toString()}`)
}
