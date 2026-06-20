import { useState, useEffect, useCallback } from 'react'
import { Card } from '../../../components/ui/Card'
import { getToppingGroups, softDeleteToppingGroup } from '../../../api/topping-group.api'
import { ToppingGroupModal } from './ToppingGroupModal'

export function ToppingGroups() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getToppingGroups()
      setGroups(res.data)
    } catch (error) {
      console.error('Failed to fetch topping groups', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá nhóm Topping này?')) return
    try {
      await softDeleteToppingGroup(id)
      alert('Đã xoá nhóm Topping thành công')
      fetchGroups()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xoá nhóm Topping')
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold">Quản lý nhóm Topping</h1>
          <p className="text-sm text-muted mt-1">Các tuỳ chọn thêm (Đá, Đường, Topping...)</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-[14px] bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            + Thêm nhóm Topping
          </button>
        </div>
      </div>

      <Card className="overflow-hidden p-6">
        {loading ? (
          <div className="py-10 text-center text-muted">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr>
                  <th className="border-b border-line px-4 py-3 text-xs uppercase text-muted">Tên nhóm</th>
                  <th className="border-b border-line px-4 py-3 text-xs uppercase text-muted">Quy tắc chọn</th>
                  <th className="border-b border-line px-4 py-3 text-xs uppercase text-muted">Số lựa chọn</th>
                  <th className="border-b border-line px-4 py-3 text-xs uppercase text-muted">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="border-b border-line px-4 py-4 font-semibold text-gray-800">{g.name}</td>
                    <td className="border-b border-line px-4 py-4">
                      Tối thiểu: {g.minSelect} - Tối đa: {g.maxSelect}
                    </td>
                    <td className="border-b border-line px-4 py-4">
                      {g.toppings.length} tuỳ chọn
                    </td>
                    <td className="border-b border-line px-4 py-4">
                      <button 
                        onClick={() => handleDelete(g.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
                {groups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="border-b border-line px-4 py-8 text-center text-muted">Chưa có nhóm Topping nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ToppingGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false)
          fetchGroups()
        }}
      />
    </>
  )
}
