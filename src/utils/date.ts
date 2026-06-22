export function formatVnDate(value?: string | null) {
  if (!value) return 'Chưa cập nhật'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatVnDateTime(value?: string | null) {
  if (!value) return 'Chưa cập nhật'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatVnTime(value?: string | null) {
  if (!value) return '--:--'
  if (value.includes('T')) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC' // Server saves local time as UTC (e.g. 18:00Z)
      }).format(date)
    }
  }
  return value.slice(0, 5)
}

