export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

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
}

export type ReservationPayload = Omit<Reservation, 'id' | 'createdAt'>
