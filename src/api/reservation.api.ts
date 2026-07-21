import { httpClient } from './httpClient'
import type { ApiResponse } from '../types'
import type { Reservation, ReservationPayload } from '../types/reservation.types'

export function listReservations(branchId?: string) {
  const url = branchId ? `/reservations?branchId=${branchId}` : '/reservations'
  return httpClient<ApiResponse<Reservation[]>>(url)
}

export function createReservation(payload: ReservationPayload) {
  return httpClient<ApiResponse<Reservation>>('/reservations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function assignReservationTable(id: string, tableId: string | number) {
  return httpClient<ApiResponse<Reservation>>(`/reservations/${id}/assign-table`, {
    method: 'PATCH',
    body: JSON.stringify({ tableId }),
  })
}

export function updateReservation(id: string, payload: Partial<ReservationPayload>) {
  if (payload.status === 'checked_in') {
    return httpClient<ApiResponse<Reservation>>(`/reservations/${id}/check-in`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  if (payload.status === 'completed' || payload.status === 'cancelled' || payload.status === 'pending' || payload.status === 'no_show' || payload.status === 'confirmed') {
    return httpClient<ApiResponse<Reservation>>(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: payload.status }),
    })
  }

  return httpClient<ApiResponse<Reservation>>(`/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteReservation(id: string) {
  return httpClient<ApiResponse<{ id: string }>>(`/reservations/${id}`, {
    method: 'DELETE',
  })
}
