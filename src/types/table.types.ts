export type TableShape = 'square' | 'circle' | 'wide'

export type TableStatus = 'Đang phục vụ' | 'Trống sẵn sàng' | 'Đã đặt trước'

export type TableMapMock = readonly [
  tableNumber: string,
  seats: number,
  status: TableStatus,
  time: string,
  shape: TableShape,
]
