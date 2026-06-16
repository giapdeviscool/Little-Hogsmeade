import { httpClient } from './httpClient'
import type {
  AttendanceCheckPayload,
  AttendanceResult,
  TimesheetRecord,
} from '../types'

interface ApiResponse<T> {
  data: T
  message?: string
}

export function checkIn(payload: AttendanceCheckPayload) {
  return httpClient<ApiResponse<AttendanceResult>>('/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function checkOut(payload: AttendanceCheckPayload) {
  return httpClient<ApiResponse<AttendanceResult>>('/attendance/check-out', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getTodayAttendance(branchId?: string) {
  const query = branchId ? `?branchId=${branchId}` : ''
  return httpClient<ApiResponse<TimesheetRecord[]>>(`/attendance/today${query}`)
}
