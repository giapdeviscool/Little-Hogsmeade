import { useState, useEffect } from 'react'
import { getPendingStocktakes, processStocktake } from '../../../api/stocktake.api'
import { cn } from '../../../utils/cn'
import { ConfirmModal } from '../../../components/ui/ConfirmModal'

interface ProcessStocktakeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  branchId: string
}

export function ProcessStocktakeModal({ isOpen, onClose, onSuccess, branchId }: ProcessStocktakeModalProps) {
  const [notes, setNotes] = useState<any[]>([])
  const [selectedNote, setSelectedNote] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<'APPROVE' | 'REJECT' | null>(null)

  useEffect(() => {
    if (isOpen && branchId) {
      loadPendingNotes()
    }
  }, [isOpen, branchId])

  const loadPendingNotes = async () => {
    try {
      setLoading(true)
      const res = await getPendingStocktakes(branchId)
      setNotes(res.data)
      setSelectedNote(null)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách phiếu kiểm kho')
    } finally {
      setLoading(false)
    }
  }

  const requestProcess = (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE') {
      setPendingAction(action)
      setIsConfirmOpen(true)
    } else {
      executeProcess(action)
    }
  }

  const executeProcess = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedNote) return
    setIsConfirmOpen(false)

    try {
      setLoading(true)
      await processStocktake(selectedNote.id, action)
      // Custom toast or alert could be used instead of browser alert, but let's keep it simple or remove it.
      onSuccess()
    } catch (err: any) {
      setError(err.message || `Lỗi khi ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} phiếu`)
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-coffee">
            {selectedNote ? 'Chi tiết Phiếu Kiểm Kho' : 'Danh sách Phiếu Kiểm Kho Chờ Duyệt'}
          </h2>
          {selectedNote && (
            <button 
              onClick={() => setSelectedNote(null)}
              className="text-sm text-blue-600 font-semibold hover:underline"
            >
              ← Quay lại danh sách
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!selectedNote ? (
          // LIST VIEW
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-10 text-muted">Đang tải...</div>
            ) : notes.length === 0 ? (
              <div className="text-center py-10 text-muted bg-gray-50 rounded-lg border border-dashed border-gray-300">
                Không có phiếu kiểm kho nào đang chờ duyệt.
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-muted uppercase text-xs border-b border-line">Mã Phiếu</th>
                    <th className="px-4 py-3 text-muted uppercase text-xs border-b border-line">Người tạo</th>
                    <th className="px-4 py-3 text-muted uppercase text-xs border-b border-line">Ngày tạo</th>
                    <th className="px-4 py-3 text-muted uppercase text-xs border-b border-line">Ghi chú</th>
                    <th className="px-4 py-3 text-muted uppercase text-xs border-b border-line">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map(note => (
                    <tr key={note.id} className="hover:bg-Cream/50 border-b border-line last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{note.id}</td>
                      <td className="px-4 py-3 font-semibold text-coffee">{note.employee?.fullName}</td>
                      <td className="px-4 py-3">{new Date(note.createdAt).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3 text-muted truncate max-w-[200px]">{note.note || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedNote(note)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded hover:bg-blue-100 transition-colors"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          // DETAIL VIEW
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <strong>Thông tin chung:</strong> Người tạo: {selectedNote.employee?.fullName} | 
              Ngày tạo: {new Date(selectedNote.createdAt).toLocaleString('vi-VN')} | 
              Ghi chú: {selectedNote.note || 'Không có'}
            </div>

            <div className="flex-1 overflow-y-auto border border-line rounded-lg">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-muted uppercase text-xs border-b border-line">Nguyên liệu</th>
                    <th className="px-3 py-2 text-muted uppercase text-xs border-b border-line text-right">Tồn HT</th>
                    <th className="px-3 py-2 text-muted uppercase text-xs border-b border-line text-right">Đếm thực tế</th>
                    <th className="px-3 py-2 text-muted uppercase text-xs border-b border-line text-right">Chênh lệch</th>
                    <th className="px-3 py-2 text-muted uppercase text-xs border-b border-line">Lý do & Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedNote.items.map((item: any) => {
                    const variance = item.variance
                    return (
                      <tr key={item.id} className="border-b border-line last:border-0 hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="font-semibold text-coffee">{item.ingredient?.name}</div>
                          <div className="text-[10px] text-muted">{item.ingredient?.sku} - {item.ingredient?.unit}</div>
                        </td>
                        <td className="px-3 py-3 text-right">{item.systemQuantity}</td>
                        <td className="px-3 py-3 text-right font-semibold">{item.actualQuantity}</td>
                        <td className="px-3 py-3 text-right font-bold">
                          <span className={cn(variance < 0 ? 'text-red-500' : variance > 0 ? 'text-emerald-600' : 'text-gray-500')}>
                            {variance > 0 ? '+' : ''}{variance}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-semibold">{item.reason || '-'}</div>
                          <div className="text-xs text-muted">{item.note}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between border-t border-line pt-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 font-semibold text-muted hover:bg-gray-100"
                >
                  Đóng
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => requestProcess('REJECT')}
                  disabled={loading}
                  className="rounded-lg border border-red-500/30 bg-red-50 px-6 py-2 font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : 'Từ chối (Reject)'}
                </button>
                <button
                  onClick={() => requestProcess('APPROVE')}
                  disabled={loading}
                  className="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-md"
                >
                  {loading ? 'Đang xử lý...' : 'Duyệt & Cập nhật kho'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedNote && (
          <div className="mt-6 flex justify-end border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-semibold text-muted hover:bg-gray-100"
            >
              Đóng
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Xác nhận Duyệt"
        message="Hành động này sẽ CẬP NHẬT TRỰC TIẾP tồn kho thực tế của chi nhánh và không thể hoàn tác. Bạn có chắc chắn muốn Duyệt phiếu này?"
        onConfirm={() => executeProcess('APPROVE')}
        onCancel={() => setIsConfirmOpen(false)}
        confirmText="Xác nhận Duyệt"
        cancelText="Hủy"
      />
    </div>
  )
}
