import { useState, useEffect } from 'react'
import { getStockLedger } from '../../../api/stock-transaction.api'
import { cn } from '../../../utils/cn'

interface StockLedgerModalProps {
  isOpen: boolean
  onClose: () => void
  branchId: string
  ingredient: any
}

export function StockLedgerModal({ isOpen, onClose, branchId, ingredient }: StockLedgerModalProps) {
  const [ledgerData, setLedgerData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Default to last 30 days
  const defaultStartDate = new Date()
  defaultStartDate.setDate(defaultStartDate.getDate() - 30)
  
  const [startDate, setStartDate] = useState(defaultStartDate.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (isOpen && branchId && ingredient) {
      loadLedger()
    }
  }, [isOpen, branchId, ingredient])

  const loadLedger = async () => {
    if (!startDate || !endDate) return
    try {
      setLoading(true)
      // Append time to dates to cover full days
      const startDateTime = new Date(startDate)
      startDateTime.setHours(0, 0, 0, 0)
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)

      const res = await getStockLedger({
        branchId,
        ingredientId: ingredient.id,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString()
      })
      setLedgerData(res.data)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải thẻ kho')
    } finally {
      setLoading(false)
    }
  }

  const formatType = (type: string) => {
    switch(type) {
      case 'RECEIPT': return 'Nhập kho'
      case 'ISSUE_DAMAGED': return 'Xuất hủy (Hư hỏng)'
      case 'ISSUE_DISPOSAL': return 'Xuất hủy (Quá hạn)'
      case 'ISSUE_INTERNAL_USE': return 'Xuất dùng nội bộ'
      case 'POS_DEDUCTION': return 'Bán hàng (POS)'
      case 'STOCKTAKE_SURPLUS': return 'Kiểm kho (Thừa)'
      case 'STOCKTAKE_SHORTAGE': return 'Kiểm kho (Thiếu)'
      case 'MANUAL_ADD': return 'Nhập tay'
      default: return type
    }
  }

  if (!isOpen || !ingredient) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-coffee">Thẻ Kho / Lịch Sử Biến Động</h2>
            <p className="text-sm text-muted mt-1">
              Nguyên liệu: <strong className="text-coffee">{ingredient.name}</strong> ({ingredient.sku}) - Đơn vị: {ingredient.unit}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-line">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Từ ngày:</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-line rounded px-2 py-1 text-sm focus:outline-none focus:border-coffee"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Đến ngày:</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-line rounded px-2 py-1 text-sm focus:outline-none focus:border-coffee"
            />
          </div>
          <button 
            onClick={loadLedger}
            disabled={loading}
            className="ml-auto bg-coffee text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-coffee/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Đang lọc...' : 'Lọc'}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col border border-line rounded-lg bg-white">
          <div className="overflow-y-auto flex-1 relative">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-Cream sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-coffee font-bold text-xs uppercase border-b border-line">Thời gian</th>
                  <th className="px-4 py-3 text-coffee font-bold text-xs uppercase border-b border-line">Loại giao dịch</th>
                  <th className="px-4 py-3 text-coffee font-bold text-xs uppercase border-b border-line text-right">Thay đổi</th>
                  <th className="px-4 py-3 text-coffee font-bold text-xs uppercase border-b border-line text-right">Tồn cuối (Balance)</th>
                  <th className="px-4 py-3 text-coffee font-bold text-xs uppercase border-b border-line">Ghi chú</th>
                  <th className="px-4 py-3 text-coffee font-bold text-xs uppercase border-b border-line">Nhân viên</th>
                </tr>
              </thead>
              <tbody>
                {/* Tồn đầu kỳ */}
                <tr className="bg-gray-50 border-b border-line">
                  <td className="px-4 py-3 font-semibold text-gray-600 italic" colSpan={3}>Số dư đầu kỳ (Starting Balance)</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-700">{ledgerData?.startingBalance ?? '-'}</td>
                  <td colSpan={2} className="px-4 py-3 bg-gray-50"></td>
                </tr>

                {ledgerData?.transactions?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted">Không có giao dịch nào trong khoảng thời gian này.</td>
                  </tr>
                ) : (
                  ledgerData?.transactions?.map((tx: any) => {
                    const isPositive = tx.quantityChanged > 0
                    return (
                      <tr key={tx.id} className="hover:bg-Cream/30 border-b border-line last:border-0 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-medium">
                          {new Date(tx.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-semibold",
                            isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          )}>
                            {formatType(tx.type)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          <span className={isPositive ? 'text-emerald-600' : 'text-red-600'}>
                            {isPositive ? '+' : ''}{tx.quantityChanged}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800 bg-gray-50/50">
                          {tx.remainingBalance}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={tx.note}>
                          {tx.note || '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {tx.employee?.fullName || '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex justify-end border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-6 py-2 font-semibold text-muted bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
