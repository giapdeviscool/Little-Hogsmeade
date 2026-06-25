import { useEffect, useState } from 'react'
import * as shiftApi from '../../../api/shift.api'
import * as employeeApi from '../../../api/employee.api'
import { getAuthSession } from '../../../store/auth.store'
import type { Shift, CreateShiftPayload, Branch } from '../../../types'

export function ShiftManagement() {
  const authSession = getAuthSession()
  const userRole = (authSession?.user?.roleName || authSession?.user?.role || '').toLowerCase()
  const isChainOwner = userRole.includes('owner')
  const isChainAdmin = userRole.includes('chain admin')
  const userBranchId = authSession?.user?.branchId || ''
  const [shifts, setShifts] = useState<Shift[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState(isChainOwner ? '' : userBranchId)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formStart, setFormStart] = useState('08:00')
  const [formEnd, setFormEnd] = useState('16:00')
  const [formBranch, setFormBranch] = useState('')

  useEffect(() => {
    loadBranches()
  }, [])

  useEffect(() => {
    loadShifts()
  }, [selectedBranch])

  async function loadBranches() {
    try {
      const res = await employeeApi.getBranches()
      const data = res.data
      const items = Array.isArray(data) ? data : (data as any)?.items || []
      setBranches(items)
      if (isChainOwner && items.length > 0 && !selectedBranch) {
        setSelectedBranch(items[0].id)
      }
    } catch { /* ignore */ }
  }

  async function loadShifts() {
    try {
      setLoading(true)
      setError('')
      const res = await shiftApi.getShifts(selectedBranch || undefined)
      const data = res.data
      setShifts(Array.isArray(data) ? data : (data as any)?.items || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load shifts')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!formName.trim() || !formBranch) {
      setError('Tên ca và chi nhánh là bắt buộc')
      return
    }
    try {
      setSaving(true)
      setError('')
      if (editId) {
        await shiftApi.updateShift(editId, { name: formName, startTime: formStart, endTime: formEnd })
        setNotice('Cập nhật ca làm việc thành công')
      } else {
        const payload: CreateShiftPayload = {
          name: formName,
          branchId: formBranch,
          startTime: formStart,
          endTime: formEnd,
        }
        await shiftApi.createShift(payload)
        setNotice('Tạo ca làm việc thành công')
      }
      resetForm()
      await loadShifts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      setSaving(true)
      await shiftApi.deleteShift(id)
      setNotice('Đã xóa ca làm việc')
      await loadShifts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xóa')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(shift: Shift) {
    setEditId(shift.id)
    setFormName(shift.name)
    setFormStart(formatTime(shift.startTime))
    setFormEnd(formatTime(shift.endTime))
    setFormBranch(shift.branchId)
    setShowForm(true)
  }

  function resetForm() {
    setEditId(null)
    setFormName('')
    setFormStart('08:00')
    setFormEnd('16:00')
    setFormBranch(selectedBranch || '')
    setShowForm(false)
  }

  function formatTime(isoString: string) {
    const d = new Date(isoString)
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
  }

  function calcDuration(start: string, end: string) {
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    let mins = (eh * 60 + em) - (sh * 60 + sm)
    if (mins < 0) mins += 1440
    return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? `${mins % 60}m` : ''}`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-[28px] font-bold">Quản lý Ca làm việc</h1>
          <p className="text-sm text-muted mt-1">Thiết lập và quản lý các ca làm việc</p>
        </div>
        <div className="flex gap-2">
          {isChainOwner && (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="rounded-[14px] border border-line px-4 bg-white outline-none text-sm"
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => { resetForm(); setFormBranch(selectedBranch || ''); setShowForm(true) }}
            className="rounded-[14px] bg-coffee px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
          >
            + Tạo ca mới
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">{notice}</div>}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="rounded-xl border border-line bg-surface p-4 space-y-3">
          <h3 className="font-bold text-sm">{editId ? 'Chỉnh sửa ca' : 'Tạo ca mới'}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-muted">Tên ca *</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)}
                placeholder="VD: Ca sáng" className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Giờ bắt đầu *</label>
              <input type="time" value={formStart} onChange={(e) => setFormStart(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Giờ kết thúc *</label>
              <input type="time" value={formEnd} onChange={(e) => setFormEnd(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" />
            </div>
            {!isChainAdmin && (
              <div>
                <label className="text-xs font-medium text-muted">Chi nhánh *</label>
                <select value={formBranch} onChange={(e) => setFormBranch(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" disabled={!!editId}>
                  <option value="">Chọn chi nhánh</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="rounded-lg bg-coffee px-4 py-2 text-sm font-bold text-white hover:bg-coffee/90 disabled:opacity-50">
              {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Tạo mới'}
            </button>
            <button onClick={resetForm}
              className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:bg-gray-50">
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Shift list */}
      {loading ? (
        <div className="py-8 text-center text-muted text-sm">Đang tải...</div>
      ) : shifts.length === 0 ? (
        <div className="py-8 text-center text-muted text-sm">Chưa có ca làm việc nào</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-muted">Tên ca</th>
                <th className="px-4 py-3 text-left font-bold text-muted">Giờ bắt đầu</th>
                <th className="px-4 py-3 text-left font-bold text-muted">Giờ kết thúc</th>
                <th className="px-4 py-3 text-left font-bold text-muted">Thời lượng</th>
                {!isChainAdmin && <th className="px-4 py-3 text-left font-bold text-muted">Chi nhánh</th>}
                <th className="px-4 py-3 text-right font-bold text-muted">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shifts.map((s) => (
                <tr key={s.id} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{formatTime(s.startTime)}</td>
                  <td className="px-4 py-3">{formatTime(s.endTime)}</td>
                  <td className="px-4 py-3 text-muted">{calcDuration(formatTime(s.startTime), formatTime(s.endTime))}</td>
                  {!isChainAdmin && <td className="px-4 py-3">{s.branch?.name ?? '—'}</td>}
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(s)}
                      className="mr-2 text-coffee hover:underline text-xs font-bold">Sửa</button>
                    <button onClick={() => handleDelete(s.id)} disabled={saving}
                      className="text-red-500 hover:underline text-xs font-bold disabled:opacity-50">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
