import { httpClient } from './httpClient'
import type { ApiResponse } from '../types'
import type { Reservation, ReservationPayload } from '../types/reservation.types'

export function listReservations() {
  return httpClient<ApiResponse<Reservation[]>>('/reservations')
}

export function createReservation(payload: ReservationPayload) {
  return httpClient<ApiResponse<Reservation>>('/reservations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateReservation(id: string, payload: Partial<ReservationPayload>) {
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
