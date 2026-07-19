import { useState } from 'react'
import * as attendanceApi from '../../../api/attendance.api'
import type { AttendanceResult } from '../../../types'

export function AttendanceKiosk({ branchId = 'default-branch-id' }: { branchId?: string }) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AttendanceResult | null>(null)
  const [error, setError] = useState('')

  const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Trình duyệt không hỗ trợ định vị (Geolocation).'))
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          },
          (err) => {
            console.error(err)
            reject(new Error('Không thể lấy vị trí. Vui lòng bật định vị và cấp quyền truy cập Vị trí cho trình duyệt.'))
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      }
    })
  }

  function handlePinInput(digit: string) {
    if (pin.length < 6) {
      setPin(pin + digit)
    }
  }

  function handleClear() {
    setPin('')
    setResult(null)
    setError('')
  }

  function handleBackspace() {
    setPin(pin.slice(0, -1))
  }

  async function handleCheckIn() {
    if (pin.length !== 6) {
      setError('Vui lòng nhập đủ 6 số PIN')
      return
    }
    try {
      setLoading(true)
      setError('')
      setResult(null)

      const loc = await getCurrentLocation()

      const res = await attendanceApi.checkIn({ pin, branchId, lat: loc.lat, lng: loc.lng })
      setResult(res.data)
      setPin('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Check-in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckOut() {
    if (pin.length !== 6) {
      setError('Vui lòng nhập đủ 6 số PIN')
      return
    }
    try {
      setLoading(true)
      setError('')
      setResult(null)

      const loc = await getCurrentLocation()

      const res = await attendanceApi.checkOut({ pin, branchId, lat: loc.lat, lng: loc.lng })
      setResult(res.data)
      setPin('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Check-out failed')
    } finally {
      setLoading(false)
    }
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '']

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h2 className="text-center text-lg font-bold text-foreground">Chấm công</h2>

      {/* PIN display */}
      <div className="rounded-xl border bg-card p-4 text-center">
        <div className="mx-auto flex justify-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-12 w-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold
              ${i < pin.length ? 'border-coffee bg-coffee/10 text-coffee' : 'border-line bg-surface text-transparent'}`}>
              {i < pin.length ? '●' : '○'}
            </div>
          ))}
        </div>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2">
        {digits.map((d, i) => (
          d ? (
            <button key={i} onClick={() => handlePinInput(d)} disabled={loading}
              className="h-14 rounded-xl border border-line bg-surface text-lg font-bold text-foreground
                hover:bg-surface-alt active:bg-coffee/10 transition-colors disabled:opacity-50">
              {d}
            </button>
          ) : (
            i === 9 ? (
              <button key={i} onClick={handleBackspace} disabled={loading}
                className="h-14 rounded-xl border border-line bg-surface text-sm font-bold text-muted hover:bg-surface-alt">
                ⌫
              </button>
            ) : (
              <button key={i} onClick={handleClear}
                className="h-14 rounded-xl border border-line bg-surface text-sm font-bold text-muted hover:bg-surface-alt">
                CLR
              </button>
            )
          )
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleCheckIn} disabled={loading || pin.length !== 6}
          className="rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 transition-colors">
          {loading ? '...' : '✓ CHECK IN'}
        </button>
        <button onClick={handleCheckOut} disabled={loading || pin.length !== 6}
          className="rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors">
          {loading ? '...' : '✗ CHECK OUT'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-xl border p-4 text-center ${
          result.action === 'CHECK_IN' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
        }`}>
          <div className="text-lg font-bold">
            {result.action === 'CHECK_IN' ? '✅ Đã Check-in' : '🔴 Đã Check-out'}
          </div>
          <div className="text-sm text-muted mt-1">
            {result.employeeName} — {new Date(result.timestamp).toLocaleTimeString('vi-VN')}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
