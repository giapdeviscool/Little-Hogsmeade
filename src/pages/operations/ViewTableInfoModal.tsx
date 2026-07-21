import { Armchair, CalendarClock, ReceiptText, Users } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import type { BranchTable } from '../../types'
import { formatVnDate, formatVnTime } from '../../utils/date'

type ViewTableInfoModalProps = {
  isOpen: boolean
  table: BranchTable | null
  onClose: () => void
}

export function ViewTableInfoModal({ isOpen, table, onClose }: ViewTableInfoModalProps) {
  if (!table) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="rounded-2xl border-[rgba(74,53,37,0.12)] bg-white p-0 text-coffee sm:max-w-[480px]">
        <DialogHeader className="border-b border-[rgba(74,53,37,0.08)] bg-[#fffaf4] px-6 py-5">
          <div className="flex items-center gap-3 pr-8">
            <span className="grid size-10 place-items-center rounded-xl bg-[#c2a68c]/25 text-[#8a5a32]">
              <Armchair className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold">{table.name}</DialogTitle>
              <p className="mt-1 text-sm text-muted">
                {table.status === 'available' && 'Bàn đang trống'}
                {table.status === 'occupied' && 'Bàn đang phục vụ'}
                {table.status === 'reserved' && 'Bàn đã được đặt trước'}
                {table.status === 'cleaning' && 'Bàn đang dọn dẹp'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-cream px-4 py-3">
              <span className="text-sm font-semibold text-muted">Sức chứa</span>
              <span className="flex items-center gap-1.5 font-bold">
                <Users className="size-4" /> {table.capacity} khách
              </span>
            </div>

            {table.status === 'reserved' && (
              <div className="rounded-2xl border border-gold/30 bg-[#fffaf0] p-5">
                <h4 className="flex items-center gap-2 font-bold text-[#8a6820]">
                  <CalendarClock className="size-4" /> Thông tin đặt bàn
                </h4>
                <div className="mt-3 space-y-2 text-sm">
                  {table.guest_name && (
                    <div className="flex justify-between">
                      <span className="text-muted">Khách hàng:</span>
                      <strong className="font-semibold">{table.guest_name}</strong>
                    </div>
                  )}
                  {table.reserved_time && (
                    <div className="flex justify-between">
                      <span className="text-muted">Thời gian hẹn:</span>
                      <strong className="font-semibold">
                        {formatVnTime(table.reserved_time)} - {formatVnDate(table.reserved_time)}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {table.status === 'occupied' && table.guest_name && (
              <div className="rounded-2xl border border-line bg-white p-5">
                <h4 className="flex items-center gap-2 font-bold">
                  <ReceiptText className="size-4 text-muted" /> Đang phục vụ
                </h4>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Khách hàng:</span>
                    <strong className="font-semibold">{table.guest_name}</strong>
                  </div>
                </div>
              </div>
            )}

            <Button type="button" variant="outline" onClick={onClose} className="mt-4 h-11 w-full rounded-xl border-line">
              Đóng
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
