import { useState } from 'react'
import type { Employee, CreateEmployeePayload, UpdateEmployeePayload, Role, Branch } from '../../../types'
import { createEmployee, updateEmployee } from '../../../api/employee.api'

interface Props {
  employee?: Employee | null
  roles: Role[]
  branches: Branch[]
  onClose: () => void
  onSuccess: (msg?: string) => void
}

const PHONE_REGEX = /^(0[2-9])\d{8,9}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateForm(
  data: Record<string, string>,
  isEditing: boolean
): string | null {
  if (!data.fullName.trim()) {
    return 'Họ và tên không được để trống.'
  }

  if (!data.phone.trim()) {
    return 'Số điện thoại không được để trống.'
  }

  if (!PHONE_REGEX.test(data.phone.trim())) {
    return 'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0901234567).'
  }

  if (data.email && data.email.trim() && !EMAIL_REGEX.test(data.email.trim())) {
    return 'Email không hợp lệ. Vui lòng nhập đúng định dạng (VD: abc@email.com).'
  }

  if (!isEditing) {
    if (!data.roleId) {
      return 'Vui lòng chọn vai trò cho nhân viên.'
    }
    if (!data.branchId) {
      return 'Vui lòng chọn chi nhánh cho nhân viên.'
    }
  }

  if (data.baseSalary && Number(data.baseSalary) < 0) {
    return 'Mức lương không được âm.'
  }

  return null
}

export function EmployeeModal({ employee, roles, branches, onClose, onSuccess }: Props) {
  const isEditing = !!employee
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successPin, setSuccessPin] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: employee?.fullName || '',
    phone: employee?.phone || '',
    email: employee?.email || '',
    roleId: employee?.roleId || '',
    branchId: employee?.branchId || '',
    baseSalary: employee?.baseSalary?.toString() || '',
    hiredDate: employee?.hiredDate ? new Date(employee.hiredDate).toISOString().split('T')[0] : '',
    status: employee?.status || 'active',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm(formData, isEditing)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      if (isEditing) {
        const payload: UpdateEmployeePayload = {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          baseSalary: formData.baseSalary ? Number(formData.baseSalary) : null,
          status: formData.status,
          hiredDate: formData.hiredDate ? new Date(formData.hiredDate).toISOString() : undefined,
        }
        await updateEmployee(employee.id, payload)
        onSuccess('Cập nhật thông tin nhân viên thành công!')
      } else {
        const payload: CreateEmployeePayload = {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          roleId: formData.roleId,
          branchId: formData.branchId,
          baseSalary: formData.baseSalary ? Number(formData.baseSalary) : undefined,
          hiredDate: formData.hiredDate ? new Date(formData.hiredDate).toISOString() : undefined,
        }
        const res = await createEmployee(payload)
        // Backend returns generatedPin at top-level of response
        setSuccessPin(res.generatedPin)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Đã xảy ra lỗi')
      }
    } finally {
      setLoading(false)
    }
  }

  if (successPin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-bold text-emerald-600">Thêm nhân viên thành công!</h2>
          <p className="mb-4 text-sm text-gray-600">Vui lòng ghi lại mã PIN để nhân viên đăng nhập máy POS. Mã này chỉ hiển thị một lần duy nhất.</p>
          <div className="mb-6 rounded-xl bg-gray-100 py-4 text-center text-3xl font-mono tracking-widest font-bold">
            {successPin}
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => { setSuccessPin(null); onSuccess('Thêm nhân viên mới thành công!') }} className="rounded-[14px] bg-coffee px-6 py-2.5 text-sm font-bold text-white hover:opacity-90">
              Đóng
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl mt-10 mb-10">
        <h2 className="mb-6 text-xl font-bold">{isEditing ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}</h2>
        
        {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Họ và tên *</label>
            <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full rounded-[14px] border border-line px-4 py-2" placeholder="VD: Nguyễn Văn A" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Số điện thoại *</label>
              <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-[14px] border border-line px-4 py-2" placeholder="VD: 0901234567" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-[14px] border border-line px-4 py-2" placeholder="VD: a@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Vai trò {isEditing && '(Không thể sửa)'}</label>
              <select name="roleId" value={formData.roleId} onChange={handleChange} disabled={isEditing} className="w-full rounded-[14px] border border-line px-4 py-2 disabled:bg-gray-100">
                <option value="">-- Chọn vai trò --</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Chi nhánh {isEditing && '(Không thể sửa)'}</label>
              <select name="branchId" value={formData.branchId} onChange={handleChange} disabled={isEditing} className="w-full rounded-[14px] border border-line px-4 py-2 disabled:bg-gray-100">
                <option value="">-- Chọn chi nhánh --</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Mức lương cơ bản</label>
              <input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleChange} className="w-full rounded-[14px] border border-line px-4 py-2" placeholder="VD: 5000000" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ngày vào làm</label>
              <input type="date" name="hiredDate" value={formData.hiredDate} onChange={handleChange} className="w-full rounded-[14px] border border-line px-4 py-2" />
            </div>
          </div>

          {isEditing && (
            <div>
              <label className="mb-1 block text-sm font-medium">Trạng thái</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-[14px] border border-line px-4 py-2">
                <option value="active">Đang làm việc (Active)</option>
                <option value="on_leave">Nghỉ phép (On Leave)</option>
                <option value="resigned">Đã nghỉ việc (Resigned)</option>
                <option value="inactive">Tạm khóa (Inactive)</option>
              </select>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={onClose} disabled={loading} className="rounded-[14px] border border-line px-6 py-2.5 text-sm font-bold hover:bg-gray-50">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="rounded-[14px] bg-coffee px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
              {loading ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
