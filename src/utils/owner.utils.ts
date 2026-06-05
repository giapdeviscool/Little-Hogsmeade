export function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString('vi-VN')} ₫`
}

export function dateToInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

export function timeToIso(value: string) {
  return `${dateToInput(new Date())}T${value || '00:00'}:00.000Z`
}

export function isoToTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '00:00'
  return date.toISOString().slice(11, 16)
}

export function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Không thể kết nối. Vui lòng thử lại.'
}
