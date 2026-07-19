import { useState, useEffect, useCallback } from 'react'
import { Card } from '../../../components/ui/Card'
import type { Employee, Role, Branch } from '../../../types'
import { getEmployees, getRoles, getBranches } from '../../../api/employee.api'
import { EmployeeModal } from './EmployeeModal'
import { getAuthSession } from '../../../store/auth.store'
export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedBranch, setSelectedBranch] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const authSession = getAuthSession()
  const userRole = (authSession?.user?.roleName || authSession?.user?.role || '').toLowerCase()
  const isChainAdmin = userRole.includes('chain admin')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getEmployees({ page, limit: 10, branchId: selectedBranch || undefined, search: debouncedSearch || undefined })
      setEmployees(res.data.items)
      setTotalPages(res.data.pagination.totalPages)
      setTotalItems(res.data.pagination.total)
    } catch (error) {
      console.error('Failed to fetch employees', error)
    } finally {
      setLoading(false)
    }
  }, [page, selectedBranch, debouncedSearch])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees()
  }, [fetchEmployees])

  useEffect(() => {
    Promise.all([getRoles(), getBranches()])
      .then(([rolesRes, branchesRes]) => {
        const rolesData = Array.isArray(rolesRes.data) ? rolesRes.data : (rolesRes.data as any).items || []
        const branchesData = Array.isArray(branchesRes.data) ? branchesRes.data : (branchesRes.data as any).items || []
        setRoles(rolesData)
        setBranches(branchesData)
      })
      .catch(err => console.error('Failed to load roles/branches', err))
  }, [])

  const handleOpenCreate = () => {
    setEditingEmployee(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingEmployee(null)
  }

  const handleModalSuccess = (msg?: string) => {
    setIsModalOpen(false)
    fetchEmployees()
    if (msg) {
      setSuccessMessage(msg)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const renderStatus = (status: string) => {
    switch (status) {
      case 'active': return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Đang làm việc</span>
      case 'on_leave': return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Nghỉ phép</span>
      case 'resigned': return <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">Đã nghỉ việc</span>
      case 'inactive': return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">Tạm khóa</span>
      default: return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">{status}</span>
    }
  }

  return (
    <>
      {successMessage && (
        <div className="fixed top-4 right-4 z-[60] flex items-center rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg transition-all">
          {successMessage}
        </div>
      )}

      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-[28px] font-bold">Quản lý Nhân sự</h1>
          <p className="text-sm text-muted mt-1">Tổng cộng {totalItems} nhân viên</p>
        </div>
        <div className="flex gap-2">
          {!isChainAdmin && (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="rounded-[14px] border border-line px-4 bg-white outline-none"
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <input 
            className="rounded-[14px] border border-line px-4" 
            placeholder="Tìm tên hoặc SĐT..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={handleOpenCreate} className="rounded-[14px] bg-coffee px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">
            + Thêm nhân viên
          </button>
        </div>
      </div>

      <Card className="overflow-hidden p-6">
        {loading ? (
          <div className="py-10 text-center text-muted">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr>
                    {['Họ và tên', 'SĐT', ...(isChainAdmin ? [] : ['Chi nhánh']), 'Vai trò', 'Ngày vào làm', 'Trạng thái', 'Thao tác'].map((h) => (
                      <th key={h} className="border-b border-line px-4 py-3 text-xs uppercase text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="border-b border-line px-4 py-4 font-semibold">{emp.fullName}</td>
                      <td className="border-b border-line px-4 py-4">{emp.phone}</td>
                      {!isChainAdmin && (
                        <td className="border-b border-line px-4 py-4">{emp.branch?.name || emp.branchId}</td>
                      )}
                      <td className="border-b border-line px-4 py-4">{emp.role?.name || emp.roleId}</td>
                      <td className="border-b border-line px-4 py-4">{new Date(emp.hiredDate).toLocaleDateString('vi-VN')}</td>
                      <td className="border-b border-line px-4 py-4">{renderStatus(emp.status)}</td>
                      <td className="border-b border-line px-4 py-4">
                        <button onClick={() => handleOpenEdit(emp)} className="text-blue-600 hover:underline">Sửa</button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={isChainAdmin ? 6 : 7} className="border-b border-line px-4 py-8 text-center text-muted">Không tìm thấy nhân viên nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-end gap-2">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  className="rounded px-3 py-1 border border-line disabled:opacity-50"
                >
                  Trang trước
                </button>
                <span className="px-3 py-1">Trang {page} / {totalPages}</span>
                <button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => p + 1)}
                  className="rounded px-3 py-1 border border-line disabled:opacity-50"
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      {isModalOpen && (
        <EmployeeModal
          employee={editingEmployee}
          roles={roles}
          branches={branches}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  )
}
