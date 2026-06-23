import { useState } from 'react'
import { CalendarClock, ReceiptText, ShoppingBag } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { AddOrderItemsPanel } from './AddOrderItemsPanel'

type StartTableOrderModalProps = {
  isOpen: boolean
  tableId: string | number | null
  tableName?: string
  onClose: () => void
  onReserve: () => void
  onSuccess: () => void
}

export function StartTableOrderModal({ isOpen, tableId, tableName, onClose, onReserve, onSuccess }: StartTableOrderModalProps) {
  const [showOrderPanel, setShowOrderPanel] = useState(false)

  return <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border-[rgba(74,53,37,0.12)] bg-white p-0 text-coffee sm:max-w-[640px]">
      <DialogHeader className="border-b border-[rgba(74,53,37,0.08)] bg-[#fffaf4] px-6 py-5"><div className="flex items-center gap-3 pr-8"><span className="grid size-10 place-items-center rounded-xl bg-[#c2a68c]/25 text-[#8a5a32]"><ReceiptText className="size-5" /></span><div><DialogTitle className="text-xl font-bold">{tableName ?? `Bàn #${tableId}`}</DialogTitle><p className="mt-1 text-sm text-muted">Chọn nghiệp vụ cho bàn trống</p></div></div></DialogHeader>
      <div className="px-6 py-5">{showOrderPanel ? <AddOrderItemsPanel isOpen={isOpen} orderId={null} tableId={tableId} onBack={() => setShowOrderPanel(false)} onAdded={() => { onSuccess(); onClose() }} /> : <section className="space-y-4"><p className="text-sm text-muted">Khách đã có mặt thì gọi món và tạo hóa đơn ngay. Nếu khách hẹn đến sau, hãy tạo đặt bàn trước.</p><button type="button" onClick={() => setShowOrderPanel(true)} className="flex w-full items-start gap-4 rounded-2xl border border-line bg-white p-5 text-left transition hover:border-latte hover:bg-cream"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#c2a68c]/20 text-[#8a5a32]"><ShoppingBag className="size-5" /></span><span><strong className="block">Khách đến trực tiếp · Gọi món</strong><small className="mt-1 block text-muted">Chọn món đầu tiên để tạo hóa đơn pending và chuyển bàn sang đang phục vụ.</small></span></button><button type="button" onClick={onReserve} className="flex w-full items-start gap-4 rounded-2xl border border-gold/30 bg-[#fffaf0] p-5 text-left transition hover:border-gold"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-[#9a760d]"><CalendarClock className="size-5" /></span><span><strong className="block">Đặt bàn trước</strong><small className="mt-1 block text-muted">Lưu thông tin khách và thời gian hẹn; bàn chuyển sang trạng thái đã đặt trước.</small></span></button><Button type="button" variant="outline" onClick={onClose} className="h-10 w-full rounded-xl border-line">Đóng</Button></section>}</div>
    </DialogContent>
  </Dialog>
}
