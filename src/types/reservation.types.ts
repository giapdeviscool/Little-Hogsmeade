export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'checked_in' | 'no_show'

export type Reservation = {
  id: string
  branchId: string
  customerId?: string
  guestName: string
  guestPhone: string
  guestCount: number
  tableId?: string
  reservedDate: string
  reservedTime: string
  note?: string
  status: ReservationStatus
  createdAt?: string
  table?: {
    id: string
    name: string
  }
}

export type ReservationPayload = Omit<Reservation, 'id' | 'createdAt'>
