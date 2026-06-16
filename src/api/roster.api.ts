import { httpClient } from './httpClient'
import type {
  RosterEntry,
  CreateRosterPayload,
  BulkRosterPayload,
  BulkRosterResult,
} from '../types'

interface ApiResponse<T> {
  data: T
  message?: string
}

export function getRosters(params: { branchId?: string; weekStart?: string; employeeId?: string }) {
  const query = new URLSearchParams()
  if (params.branchId) query.append('branchId', params.branchId)
  if (params.weekStart) query.append('weekStart', params.weekStart)
  if (params.employeeId) query.append('employeeId', params.employeeId)
  return httpClient<ApiResponse<RosterEntry[]>>(`/rosters?${query.toString()}`)
}

export function createRoster(payload: CreateRosterPayload) {
  return httpClient<ApiResponse<RosterEntry>>('/rosters', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createBulkRosters(payload: BulkRosterPayload) {
  return httpClient<ApiResponse<BulkRosterResult>>('/rosters', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteRoster(id: string) {
  return httpClient<{ message: string }>(`/rosters/${id}`, {
    method: 'DELETE',
  })
}
