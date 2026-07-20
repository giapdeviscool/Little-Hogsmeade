import { useState, useEffect } from 'react'
import { Card } from '../../../components/ui/Card'
import { getInventoryStats, getIngredients, type Ingredient } from '../../../api/ingredient.api'
import { cn } from '../../../utils/cn'
import { getBranches } from '../../../api/employee.api'
import type { Branch } from '../../../types'
import { getAuthSession } from '../../../store/auth.store'
import { IngredientFormModal } from './IngredientFormModal'
import { PreparationRecipeConfig } from './PreparationRecipeConfig'
import { GoodsReceiptModal } from './GoodsReceiptModal'
import { GoodsIssueModal } from './GoodsIssueModal'
import { StocktakeModal } from './StocktakeModal'
import { ProcessStocktakeModal } from './ProcessStocktakeModal'
import { StockLedgerModal } from './StockLedgerModal'

export function InventoryView() {
  const authSession = getAuthSession()
  const isChainOwner = authSession?.user?.roleName?.toLowerCase().includes('owner') || authSession?.user?.role?.toLowerCase().includes('owner')
  const userBranchId = authSession?.user?.branchId || ''

  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState(isChainOwner ? '' : userBranchId)
  const [stats, setStats] = useState({ totalValue: 0, lowStockCount: 0, receiptsThisMonth: 0 })
  
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null)
  const [isPrepConfigOpen, setIsPrepConfigOpen] = useState(false)
  const [configPrepItem, setConfigPrepItem] = useState<Ingredient | null>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [isStocktakeModalOpen, setIsStocktakeModalOpen] = useState(false)
  const [isProcessStocktakeModalOpen, setIsProcessStocktakeModalOpen] = useState(false)
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false)
  const [selectedIngredientForLedger, setSelectedIngredientForLedger] = useState<Ingredient | null>(null)

  const userRole = (authSession?.user?.roleName || authSession?.user?.role || '').toLowerCase()
  const isManager = userRole.includes('owner') || userRole.includes('admin') || userRole.includes('manager')

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
      const [res, statsRes] = await Promise.all([
        getIngredients({ search, branchId: selectedBranch }),
        getInventoryStats(selectedBranch)
      ])
      let data = res.data
      if (filterType !== 'all') {
        data = data.filter(i => i.ingredientType === filterType)
      }
      setIngredients(data)
      setStats((statsRes as any).data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `₫${(amount / 1e9).toFixed(1)}B`
    if (amount >= 1e6) return `₫${(amount / 1e6).toFixed(1)}M`
    if (amount >= 1e3) return `₫${(amount / 1e3).toFixed(1)}K`
    return `₫${amount}`
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

          {isManager && (
            <button 
              onClick={() => setIsProcessStocktakeModalOpen(true)}
              className="rounded-[14px] border border-emerald-500/30 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-600 whitespace-nowrap hover:bg-emerald-100"
            >
              Duyệt kiểm kho
            </button>
          )}
          <button 
            onClick={() => setIsStocktakeModalOpen(true)}
            className="rounded-[14px] border border-blue-500/30 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-600 whitespace-nowrap hover:bg-blue-100"
          >
            Kiểm kho
          </button>
          <button 
            onClick={() => setIsIssueModalOpen(true)}
            className="rounded-[14px] border border-red-500/30 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 whitespace-nowrap hover:bg-red-100"
          >
            Xuất/Hủy kho
          </button>
          <button 
            onClick={() => setIsReceiptModalOpen(true)}
            className="rounded-[14px] bg-coffee/10 px-5 py-2.5 text-sm font-bold text-coffee whitespace-nowrap hover:bg-coffee/20"
          >
            + Nhập kho
          </button>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="rounded-[14px] bg-coffee px-5 py-2.5 text-sm font-bold text-white whitespace-nowrap"
          >
            + Nhập nguyên liệu
          </button>
        </div>
      </div>
      <section className="mt-6 grid grid-cols-3 gap-5">
        {[
          { label: 'Tổng giá trị kho', value: formatCurrency(stats.totalValue) },
          { label: 'Nguyên liệu sắp hết', value: stats.lowStockCount.toString() },
          { label: 'Số phiếu nhập tháng', value: stats.receiptsThisMonth.toString() }
        ].map((x) => (
          <Card key={x.label} className="p-5">
            <span className="text-sm text-muted">{x.label}</span>
            <b className="block text-[28px]">{x.value}</b>
          </Card>
        ))}
      </section>
      <Card className="mt-6 overflow-hidden p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-coffee">Danh sách Nguyên liệu</h3>
          <div className="flex gap-3">
            <input 
              className="w-64 rounded-[14px] border border-line px-4 py-2.5 text-sm outline-none focus:border-coffee" 
              placeholder="Tìm nguyên liệu..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select 
              className="rounded-[14px] border border-line px-4 text-sm outline-none focus:border-coffee"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              <optgroup label="Nguyên liệu">
                <option value="raw">Nguyên liệu thô</option>
                <option value="preparation">Bán thành phẩm</option>
              </optgroup>
              <option value="consumable">Vật tư tiêu hao (Bao bì)</option>
              <option value="equipment">Công cụ, dụng cụ (CCDC)</option>
              <option value="chemical">Hóa chất & Văn phòng phẩm</option>
            </select>
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead><tr>{['Mã NVL', 'Tên nguyên liệu', 'Loại', ...(selectedBranch === '' ? [] : ['Số lượng']), 'Định mức', ...(selectedBranch === '' ? [] : ['Trạng thái']), 'Thao tác'].map((h) => <th key={h} className="border-b border-line px-4 py-3 text-xs uppercase text-muted">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={selectedBranch === '' ? 5 : 7} className="py-8 text-center">Đang tải...</td></tr>
            ) : ingredients.length === 0 ? (
              <tr><td colSpan={selectedBranch === '' ? 5 : 7} className="py-8 text-center text-muted">Không có nguyên liệu nào.</td></tr>
            ) : (
              ingredients.map((item) => {
                const isSafe = item.currentStock > item.minStockLevel
                return (
                  <tr key={item.id}>
                    <td className="border-b border-line px-4 py-4">{item.sku || `NVL-${item.id.slice(-4).toUpperCase()}`}</td>
                    <td className="border-b border-line px-4 py-4 font-semibold">{item.name}</td>
                    <td className="border-b border-line px-4 py-4">
                      {(() => {
                        const typeMap: Record<string, { label: string, className: string }> = {
                          raw: { label: 'Nguyên liệu thô', className: 'bg-gray-100 text-gray-700' },
                          preparation: { label: 'Bán thành phẩm', className: 'bg-purple-100 text-purple-700' },
                          consumable: { label: 'Vật tư (Bao bì)', className: 'bg-amber-100 text-amber-700' },
                          equipment: { label: 'Công cụ, Dụng cụ', className: 'bg-blue-100 text-blue-700' },
                          chemical: { label: 'Hóa chất & VPP', className: 'bg-rose-100 text-rose-700' },
                        }
                        const typeInfo = typeMap[item.ingredientType] || typeMap.raw;
                        return (
                          <span className={cn('rounded px-2 py-1 text-xs font-semibold whitespace-nowrap', typeInfo.className)}>
                            {typeInfo.label}
                          </span>
                        )
                      })()}
                    </td>
                    {selectedBranch !== '' && (
                      <td className="border-b border-line px-4 py-4">{item.currentStock} {item.unit}</td>
                    )}
                    <td className="border-b border-line px-4 py-4">{item.minStockLevel} {item.unit}</td>
                    {selectedBranch !== '' && (
                      <td className="border-b border-line px-4 py-4">
                        <span className={cn('rounded-full px-3 py-1 text-xs font-bold', isSafe ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                          {isSafe ? 'An toàn' : 'Cần nhập gấp'}
                        </span>
                      </td>
                    )}
                    <td className="border-b border-line px-4 py-4 space-x-3 whitespace-nowrap">
                      {item.globalIngredientId === null && (
                        <button 
                          onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                          className="text-coffee font-bold hover:underline"
                        >
                          Sửa
                        </button>
                      )}
                      {item.ingredientType === 'preparation' && item.globalIngredientId === null && (
                        <button
                          onClick={() => { setConfigPrepItem(item); setIsPrepConfigOpen(true); }}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Cấu hình
                        </button>
                      )}
                      {isManager && (
                        <button
                          onClick={() => { setSelectedIngredientForLedger(item); setIsLedgerModalOpen(true); }}
                          className="rounded bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors shadow-sm ml-2"
                        >
                          Thẻ kho
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
          isReadOnly={!!configPrepItem.globalIngredientId}
        />
      )}

      <GoodsReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onSuccess={() => {
          setIsReceiptModalOpen(false)
          fetchIngredients()
        }}
        branchId={selectedBranch}
      />

      <GoodsIssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={() => {
          setIsIssueModalOpen(false)
          fetchIngredients()
        }}
        branchId={selectedBranch}
      />

      <StocktakeModal
        isOpen={isStocktakeModalOpen}
        onClose={() => setIsStocktakeModalOpen(false)}
        onSuccess={() => {
          setIsStocktakeModalOpen(false)
          fetchIngredients()
        }}
        branchId={selectedBranch}
      />

      <ProcessStocktakeModal
        isOpen={isProcessStocktakeModalOpen}
        onClose={() => setIsProcessStocktakeModalOpen(false)}
        onSuccess={() => {
          setIsProcessStocktakeModalOpen(false)
          fetchIngredients()
        }}
        branchId={selectedBranch}
      />

      <StockLedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => {
          setIsLedgerModalOpen(false)
          setSelectedIngredientForLedger(null)
        }}
        branchId={selectedBranch}
        ingredient={selectedIngredientForLedger}
      />
    </>
  )
}
