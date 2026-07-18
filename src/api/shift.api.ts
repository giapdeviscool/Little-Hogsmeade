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

export interface RequestClosurePayload {
  shiftId: string;
  actualCashCounted: number;
}

export interface RequestClosureResponse {
  success: boolean;
  message?: string;
}

export interface FinalizeClosurePayload {
  shiftId: string;
  actualCashCounted: number;
  code: string;
}

export interface FinalizeCashierShiftPayload {
  actual_cash_counted: number;
}

export interface FinalizeCashierShiftResponse {
  data: {
    shift: Shift;
  }
}

export function requestShiftClosure(payload: RequestClosurePayload) {
  return httpClient<RequestClosureResponse>('/shifts/request-closure', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function finalizeShiftClosure(payload: FinalizeClosurePayload) {
  return httpClient<any>('/shifts/finalize-closure', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function finalizeCashierShift(shiftId: string, payload: FinalizeCashierShiftPayload) {
  return httpClient<FinalizeCashierShiftResponse>(`/cashier-shifts/${shiftId}/close`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getActiveCashierShift() {
  return httpClient<any>('/cashier-shifts/active');
}

export function getShiftCloseRequest(shiftId: string) {
  return httpClient<any>(`/cashier-shifts/${shiftId}/close-request`, {
    method: 'POST'
  });
}

export function getShiftReconciliation(shiftId: string) {
  return httpClient<any>(`/shifts/${shiftId}/reconciliation`, {
    method: 'GET'
  });
}
