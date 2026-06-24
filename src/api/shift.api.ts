import { httpClient } from './httpClient'
import type {
  Shift,
  CreateShiftPayload,
  UpdateShiftPayload,
} from '../types'

interface ApiResponse<T> {
  data: T
  message?: string
}

export function getShifts(branchId?: string) {
  const query = branchId ? `?branchId=${branchId}` : ''
  return httpClient<ApiResponse<Shift[]>>(`/shifts${query}`)
}

export function createShift(payload: CreateShiftPayload) {
  return httpClient<ApiResponse<Shift>>('/shifts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateShift(id: string, payload: UpdateShiftPayload) {
  return httpClient<ApiResponse<Shift>>(`/shifts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteShift(id: string) {
  return httpClient<ApiResponse<Shift>>(`/shifts/${id}`, {
    method: 'DELETE',
  })
}

export type ShiftOpeningResponse = {
  data: {
    shift_id: string
    status: string
    starting_float: number
    opened_at: string
  }
}

export const openCashierShift = async (startingFloat: number): Promise<ShiftOpeningResponse> => {
  return httpClient<ShiftOpeningResponse>('/cashier-shifts/open', {
    method: 'POST',
    body: JSON.stringify({ starting_float: startingFloat }),
  })
}
