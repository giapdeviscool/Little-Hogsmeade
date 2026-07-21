export type TableShape = 'square' | 'circle' | 'wide'

export type TableStatus = 'Đang phục vụ' | 'Trống sẵn sàng' | 'Đã đặt trước'

export type TableMapMock = readonly [
  tableNumber: string,
  seats: number,
  status: TableStatus,
  time: string,
  shape: TableShape,
]

export type BranchTableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning'

export type BranchTable = {
  id: number | string
  name: string
  capacity: number
  status: BranchTableStatus
  current_order_id?: number | string | null
  reservation_id?: number | string | null
  guest_count?: number | null
  guest_name?: string | null
  guest_phone?: string | null
  reserved_time?: string | null
  note?: string | null
  updated_at: string
}

export type BranchTableArea = {
  area_name: string
  tables: BranchTable[]
}

export type BranchTableLayout = {
  branch_id: number | string
  branch_name: string
  total_tables: number
  areas: BranchTableArea[]
}

export type BranchTableLayoutResponse = {
  status: 'success' | 'error'
  message: string
  data: BranchTableLayout
}

export type BranchTableFilters = {
  area?: string
  status?: BranchTableStatus
}

export type UpdateTableStatus = Exclude<BranchTableStatus, 'cleaning'>

export type UpdateTableStatusPayload = {
  status: UpdateTableStatus
  guest_count?: number
  order_id?: string
  reservation_id?: string
  note?: string
}

export type TableStatusUpdatedEvent = {
  tableId: number | string
  newStatus: BranchTableStatus
  branchId?: number | string
}
