import { useState, useEffect, useCallback } from 'react'
import { Card } from '../../../components/ui/Card'
import type { MenuItem, Category } from '../../../types'
import { getMenuItems, updateMenuItemStatus } from '../../../api/menu-item.api'
import { getCategories } from '../../../api/category.api'

import { AddMenuItemModal } from './AddMenuItemModal'

export function MenuItemList() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  // Pagination & Filtering
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    // Fetch categories for the filter dropdown
    getCategories({ limit: 100 }).then(res => {
      setCategories(res.data.items)
    }).catch(console.error)
  }, [])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMenuItems({
        page,
        limit: 10,
        search,
        categoryId: selectedCategory,
        status: selectedStatus
      })
      setItems(res.data.items)
      setTotalPages(res.data.pagination.totalPages)
      setTotalItems(res.data.pagination.total)
    } catch (error) {
      console.error('Failed to fetch menu items', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, selectedCategory, selectedStatus])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const isActive = newStatus === 'true'
      await updateMenuItemStatus(id, isActive)
      alert('Đổi trạng thái thành công!')
      fetchItems()
    } catch (err: any) {
      alert(err.message || 'Không thể đổi trạng thái món ăn.')
      // Fetch again to reset the dropdown UI to previous state in case of error
      fetchItems()
    }
  }

  const renderStatus = (item: MenuItem) => {
    return (
      <select
        className={`rounded-full px-3 py-1 text-xs font-bold ${item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
        value={item.isActive.toString()}
        onChange={(e) => handleStatusChange(item.id, e.target.value)}
      >
        <option value="true">Đang hoạt động</option>
        <option value="false">Ngừng hoạt động</option>
      </select>
    )
  }

  const renderImage = (url?: string) => {
    if (url) {
      return <img src={url} alt="thumbnail" className="h-10 w-10 rounded-lg object-cover" />
    }
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    )
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1)
      fetchItems()
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold">Danh sách món ăn</h1>
          <p className="text-sm text-muted mt-1">Tổng cộng {totalItems} món</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-[14px] bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            + Thêm món ăn
          </button>
          <input 
            className="rounded-[14px] border border-line px-4 w-full sm:w-auto" 
            placeholder="Tìm tên món (Enter)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
          <select
            className="rounded-[14px] border border-line px-4 py-2.5 bg-white text-sm"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="rounded-[14px] border border-line px-4 py-2.5 bg-white text-sm"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Ngừng hoạt động</option>
          </select>
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
                    {['Mã món', 'Hình ảnh', 'Tên món', 'Danh mục', 'Giá cơ bản', 'Trạng thái'].map((h) => (
                      <th key={h} className="border-b border-line px-4 py-3 text-xs uppercase text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border-b border-line px-4 py-4 font-mono text-xs text-gray-500">#{item.id.slice(-6).toUpperCase()}</td>
                      <td className="border-b border-line px-4 py-4">
                        {renderImage(item.imageUrl)}
                      </td>
                      <td className="border-b border-line px-4 py-4 font-semibold text-gray-800">{item.name}</td>
                      <td className="border-b border-line px-4 py-4">{item.category.name}</td>
                      <td className="border-b border-line px-4 py-4 font-medium text-emerald-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.basePrice)}
                      </td>
                      <td className="border-b border-line px-4 py-4">{renderStatus(item)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="border-b border-line px-4 py-8 text-center text-muted">Không tìm thấy món ăn nào phù hợp</td>
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

      <AddMenuItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false)
          setPage(1)
          fetchItems()
        }}
        categories={categories}
      />
    </>
  )
}
