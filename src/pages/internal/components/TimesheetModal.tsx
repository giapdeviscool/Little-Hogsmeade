import { X } from 'lucide-react'
import type { PayrollSummary } from '../../../types'

interface TimesheetModalProps {
  isOpen: boolean
  onClose: () => void
  payroll: PayrollSummary | null
}

export function TimesheetModal({ isOpen, onClose, payroll }: TimesheetModalProps) {
  if (!isOpen || !payroll) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-coffee">Lịch sử chấm công</h2>
            <p className="text-sm text-muted mt-1">Nhân viên: <span className="font-semibold text-foreground">{payroll.employeeName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted transition hover:bg-beige"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {payroll.dailyDetails.length === 0 ? (
            <div className="text-center py-8 text-muted">Không có dữ liệu chấm công.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {payroll.dailyDetails.map((d, idx) => (
                <div key={idx} className="rounded-xl border border-line bg-surface px-4 py-3 shadow-sm hover:border-coffee transition-colors">
                  <div className="font-bold text-coffee mb-2 pb-2 border-b border-line text-sm">
                    {new Date(d.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted">Vào ca:</span>
                      <span className="font-medium">{d.checkIn ? new Date(d.checkIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Ra ca:</span>
                      <span className="font-medium">{d.checkOut ? new Date(d.checkOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-line mt-2">
                      <span className="text-muted text-xs">Thời gian:</span>
                      <span className="font-bold text-coffee">{d.workedHours}h</span>
                    </div>
                  </div>
                  {d.shiftName && <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 py-1 px-2 rounded w-max">Ca: {d.shiftName}</div>}
                  {d.note && <div className="mt-2 text-xs font-medium text-orange-600 bg-orange-50 py-1 px-2 rounded">⚠ {d.note}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
