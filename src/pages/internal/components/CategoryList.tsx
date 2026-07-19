import { useState, useEffect, useCallback } from 'react'
import { Card } from '../../../components/ui/Card'
import type { Category } from '../../../types'
import { getCategories, deleteCategory } from '../../../api/category.api'
import { CategoryModal } from './CategoryModal'


export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedBranch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCategories({ page, limit: 10, search, branchId: selectedBranch || undefined })
      setCategories(res.data.items)
      setTotalPages(res.data.pagination.totalPages)
      setTotalItems(res.data.pagination.total)
    } catch (error) {
      console.error('Failed to fetch categories', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, selectedBranch])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])


  const renderStatus = (isActive: boolean) => {
    if (isActive) {
      return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Đang hoạt động</span>
    }
    return <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">Ngừng hoạt động</span>
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1)
      fetchCategories()
    }
  }

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = async (category: Category) => {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      try {
        await deleteCategory(category.id)
        handleModalSuccess('Đã xóa danh mục thành công!')
      } catch (err: any) {
        alert(err.message || 'Không thể xóa danh mục này.')
      }
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const handleModalSuccess = (msg?: string) => {
    setIsModalOpen(false)
    fetchCategories()
    if (msg) {
      setSuccessMessage(msg)
      setTimeout(() => setSuccessMessage(null), 3000)
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
          <h1 className="text-[28px] font-bold">Danh mục menu</h1>
          <p className="text-sm text-muted mt-1">Tổng cộng {totalItems} danh mục</p>
        </div>
        <div className="flex gap-2">
          <input
            className="rounded-[14px] border border-line px-4"
            placeholder="Tìm tên danh mục (Enter)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button onClick={handleOpenCreate} className="rounded-[14px] bg-coffee px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">
            + Thêm danh mục
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
                    {[ 'Tên danh mục', 'Số lượng món', 'Trạng thái', 'Thao tác'].map((h) => (
                      <th key={h} className="border-b border-line px-4 py-3 text-xs uppercase text-muted">{h}</th>
                    ))} 
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="border-b border-line px-4 py-4 font-semibold">{cat.name}</td>
                      <td className="border-b border-line px-4 py-4">{cat._count?.menuItems || 0} món</td>
                      <td className="border-b border-line px-4 py-4">{renderStatus(cat.isActive)}</td>
                      <td className="border-b border-line px-4 py-4">
                        <div className="flex gap-3">
                          <button onClick={() => handleOpenEdit(cat)} className="text-blue-600 hover:underline">Sửa</button>
                          <button onClick={() => handleDelete(cat)} className="text-red-600 hover:underline">Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={5} className="border-b border-line px-4 py-8 text-center text-muted">Không tìm thấy danh mục nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded px-3 py-1 border border-line disabled:opacity-50 hover:bg-gray-50"
                >
                  Trang trước
                </button>
                <span className="px-3 py-1 font-medium">Trang {page} / {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded px-3 py-1 border border-line disabled:opacity-50 hover:bg-gray-50"
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  )
}
