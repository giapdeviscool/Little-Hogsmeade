import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Ban, Power } from 'lucide-react'
import { checkInactiveConstraints } from '../../../api/chain.api'
import type { CheckInactiveResult } from '../../../api/chain.api'

interface DisableBranchDialogProps {
  branchId: string
  branchName: string
  branchStatus: string
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DisableBranchDialog({
  branchId,
  branchName,
  branchStatus,
  isOpen,
  onClose,
  onConfirm,
}: DisableBranchDialogProps) {
  const [checkResult, setCheckResult] = useState<CheckInactiveResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || branchStatus !== 'active') {
      setCheckResult(null)
      return
    }
    setLoading(true)
    checkInactiveConstraints(branchId)
      .then((res) => setCheckResult(res.data ?? null))
      .catch(() => setCheckResult({ canToggle: true, reasons: [], warnings: [] }))
      .finally(() => setLoading(false))
  }, [isOpen, branchId, branchStatus])

  // Nếu branch đang inactive → toggle active (không cần check)
  if (branchStatus !== 'active') {
    return (
      <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-coffee">
              <Power className="h-5 w-5 text-green-600" />
              Kích hoạt chi nhánh
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted">
              Bạn có chắc muốn kích hoạt lại chi nhánh <strong>{branchName}</strong>?
            </p>
            <p className="mt-2 text-xs text-muted">
              Sau khi kích hoạt, chi nhánh sẽ xuất hiện trở lại trong danh sách và có thể thực hiện giao dịch.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Huỷ</Button>
            <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
              Kích hoạt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-coffee">
            <Ban className="h-5 w-5 text-red-500" />
            Vô hiệu hóa chi nhánh
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted">Đang kiểm tra ràng buộc...</div>
        ) : checkResult && !checkResult.canToggle ? (
          <>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
              <p className="text-sm font-semibold text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Không thể vô hiệu hóa
              </p>
              <p className="text-xs text-red-700">Chi nhánh này còn:</p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {checkResult.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>Đóng</Button>
            </div>
          </>
        ) : (
          <>
            <div className="py-4 space-y-3">
              <p className="text-sm text-muted">
                Bạn có chắc muốn vô hiệu hóa chi nhánh <strong>{branchName}</strong>?
              </p>
              {checkResult && checkResult.warnings.length > 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <p className="font-semibold mb-1">Lưu ý:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {checkResult.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted">
                Dữ liệu cũ vẫn được lưu nhưng không thể tạo giao dịch mới tại chi nhánh này.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Huỷ</Button>
              <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
                Vô hiệu hóa
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
