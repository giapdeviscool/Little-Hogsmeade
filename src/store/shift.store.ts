const SHIFT_STORAGE_KEY = 'little-hogsmeade-shift-id'

export function setShiftId(shiftId: string) {
  localStorage.setItem(SHIFT_STORAGE_KEY, shiftId)
}

export function getShiftId(): string | null {
  return localStorage.getItem(SHIFT_STORAGE_KEY)
}

export function clearShiftId() {
  localStorage.removeItem(SHIFT_STORAGE_KEY)
}
