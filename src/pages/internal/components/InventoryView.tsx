import { useState, useEffect } from 'react'
import { Card } from '../../../components/ui/Card'
import { cn } from '../../../utils/cn'
import { getIngredients, type Ingredient } from '../../../api/ingredient.api'
import { IngredientFormModal } from './IngredientFormModal'

export function InventoryView() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null)

  const fetchIngredients = async () => {
    try {
      setLoading(true)
      const res = await getIngredients({ search })
      setIngredients(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIngredients()
  }, [search])
  return (
    <>
      <div className="flex justify-between">
        <div><p className="text-sm text-muted">Quản trị Nội bộ</p><h1 className="text-[34px] font-bold">Quản lý Tồn kho</h1></div>
        <div className="flex gap-2">
          <input 
            className="rounded-[14px] border border-line px-4" 
            placeholder="Tìm nguyên liệu..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="rounded-[14px] bg-coffee px-5 py-2.5 text-sm font-bold text-white"
          >
            + Nhập nguyên liệu mới
          </button>
          <button className="rounded-[14px] border border-line px-4">Kiểm kê định kỳ</button>
        </div>
      </div>
      <section className="mt-6 grid grid-cols-3 gap-5">{['Tổng giá trị kho ₫428.6M', 'Nguyên liệu sắp hết 12', 'Số phiếu nhập tháng 84'].map((x) => <Card key={x} className="p-5"><span className="text-sm text-muted">{x.split(' ').slice(0, -1).join(' ')}</span><b className="block text-[28px]">{x.split(' ').at(-1)}</b></Card>)}</section>
      <Card className="mt-6 overflow-hidden p-6">
        <table className="w-full text-left text-sm">
          <thead><tr>{['Mã NVL', 'Tên nguyên liệu', 'Danh mục', 'Số lượng', 'Định mức', 'Trạng thái', 'Thao tác'].map((h) => <th key={h} className="border-b border-line px-4 py-3 text-xs uppercase text-muted">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-8 text-center">Đang tải...</td></tr>
            ) : ingredients.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-muted">Không có nguyên liệu nào.</td></tr>
            ) : (
              ingredients.map((item) => {
                const isSafe = item.currentStock > item.minStockLevel
                return (
                  <tr key={item.id}>
                    <td className="border-b border-line px-4 py-4">{item.sku || `NVL-${item.id.slice(-4).toUpperCase()}`}</td>
                    <td className="border-b border-line px-4 py-4 font-semibold">{item.name}</td>
                    <td className="border-b border-line px-4 py-4">{item.category || 'Khác'}</td>
                    <td className="border-b border-line px-4 py-4">{item.currentStock} {item.unit}</td>
                    <td className="border-b border-line px-4 py-4">{item.minStockLevel} {item.unit}</td>
                    <td className="border-b border-line px-4 py-4">
                      <span className={cn('rounded-full px-3 py-1 text-xs font-bold', isSafe ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                        {isSafe ? 'An toàn' : 'Cần nhập gấp'}
                      </span>
                    </td>
                    <td className="border-b border-line px-4 py-4">
                      <button 
                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                        className="text-coffee font-bold hover:underline"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Card>
      
      <IngredientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ingredient={editingItem}
        onSuccess={() => {
          setIsModalOpen(false)
          fetchIngredients()
        }}
      />
    </>
  )
}
