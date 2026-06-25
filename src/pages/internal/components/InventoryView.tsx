import { useState, useEffect } from 'react'
import { Card } from '../../../components/ui/Card'
import { cn } from '../../../utils/cn'
import { getIngredients, type Ingredient } from '../../../api/ingredient.api'
import { getBranches, type Branch } from '../../../api/employee.api'
import { getAuthSession } from '../../../store/auth.store'
import { IngredientFormModal } from './IngredientFormModal'
import { PreparationRecipeConfig } from './PreparationRecipeConfig'

export function InventoryView() {
  const authSession = getAuthSession()
  const isChainOwner = authSession?.user?.roleName?.toLowerCase().includes('owner') || authSession?.user?.role?.toLowerCase().includes('owner')
  const userBranchId = authSession?.user?.branchId || ''

  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState(isChainOwner ? '' : userBranchId)
  
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null)
  const [isPrepConfigOpen, setIsPrepConfigOpen] = useState(false)
  const [configPrepItem, setConfigPrepItem] = useState<Ingredient | null>(null)

  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await getBranches()
        const data = res.data
        const items = Array.isArray(data) ? data : (data as any)?.items || []
        setBranches(items)
        // if (isChainOwner && items.length > 0 && !selectedBranch) setSelectedBranch(items[0].id)
      } catch {
        // ignore
      }
    }
    loadBranches()
  }, [])

  const fetchIngredients = async () => {
    // allow fetching for all branches
    try {
      setLoading(true)
      const res = await getIngredients({ search, branchId: selectedBranch })
      let data = res.data
      if (filterType !== 'all') {
        data = data.filter(i => i.ingredientType === filterType)
      }
      setIngredients(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIngredients()
  }, [search, filterType, selectedBranch])

  return (
    <>
      <div className="flex justify-between items-end">
        <div><p className="text-sm text-muted">Quản trị Nội bộ</p><h1 className="text-[34px] font-bold">Quản lý Tồn kho</h1></div>
        <div className="flex gap-2">
          {isChainOwner && (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="rounded-[14px] border border-line px-4 bg-white outline-none text-sm font-semibold"
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <input 
            className="rounded-[14px] border border-line px-4 text-sm" 
            placeholder="Tìm nguyên liệu..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="rounded-[14px] border border-line px-4 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            <option value="raw">Nguyên liệu thô</option>
            <option value="preparation">Bán thành phẩm</option>
          </select>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="rounded-[14px] bg-coffee px-5 py-2.5 text-sm font-bold text-white whitespace-nowrap"
          >
            + Nhập nguyên liệu
          </button>
        </div>
      </div>
      <section className="mt-6 grid grid-cols-3 gap-5">{['Tổng giá trị kho ₫428.6M', 'Nguyên liệu sắp hết 12', 'Số phiếu nhập tháng 84'].map((x) => <Card key={x} className="p-5"><span className="text-sm text-muted">{x.split(' ').slice(0, -1).join(' ')}</span><b className="block text-[28px]">{x.split(' ').at(-1)}</b></Card>)}</section>
      <Card className="mt-6 overflow-hidden p-6">
        <table className="w-full text-left text-sm">
          <thead><tr>{['Mã NVL', 'Tên nguyên liệu', 'Loại', 'Danh mục', 'Số lượng', 'Định mức', 'Trạng thái', 'Thao tác'].map((h) => <th key={h} className="border-b border-line px-4 py-3 text-xs uppercase text-muted">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-8 text-center">Đang tải...</td></tr>
            ) : ingredients.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-muted">Không có nguyên liệu nào.</td></tr>
            ) : (
              ingredients.map((item) => {
                const isSafe = item.currentStock > item.minStockLevel
                return (
                  <tr key={item.id}>
                    <td className="border-b border-line px-4 py-4">{item.sku || `NVL-${item.id.slice(-4).toUpperCase()}`}</td>
                    <td className="border-b border-line px-4 py-4 font-semibold">{item.name}</td>
                    <td className="border-b border-line px-4 py-4">
                      <span className={cn('rounded px-2 py-1 text-xs', item.ingredientType === 'preparation' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700')}>
                        {item.ingredientType === 'preparation' ? 'Bán thành phẩm' : 'Nguyên liệu thô'}
                      </span>
                    </td>
                    <td className="border-b border-line px-4 py-4">{item.category || 'Khác'}</td>
                    <td className="border-b border-line px-4 py-4">{item.currentStock} {item.unit}</td>
                    <td className="border-b border-line px-4 py-4">{item.minStockLevel} {item.unit}</td>
                    <td className="border-b border-line px-4 py-4">
                      <span className={cn('rounded-full px-3 py-1 text-xs font-bold', isSafe ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                        {isSafe ? 'An toàn' : 'Cần nhập gấp'}
                      </span>
                    </td>
                    <td className="border-b border-line px-4 py-4 space-x-3">
                      <button 
                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                        className="text-coffee font-bold hover:underline"
                      >
                        Sửa
                      </button>
                      {item.ingredientType === 'preparation' && (
                        <button
                          onClick={() => { setConfigPrepItem(item); setIsPrepConfigOpen(true); }}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Cấu hình
                        </button>
                      )}
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
        branchId={editingItem ? (editingItem.branchId || selectedBranch) : selectedBranch}
        branches={branches}
        isChainOwner={isChainOwner}
        onSuccess={() => {
          setIsModalOpen(false)
          fetchIngredients()
        }}
      />
      
      {configPrepItem && (
        <PreparationRecipeConfig
          isOpen={isPrepConfigOpen}
          onClose={() => setIsPrepConfigOpen(false)}
          onSuccess={() => setIsPrepConfigOpen(false)}
          preparationId={configPrepItem.id}
          preparationName={configPrepItem.name}
          yieldUnit={configPrepItem.unit}
          branchId={configPrepItem.branchId || selectedBranch}
        />
      )}
    </>
  )
}
