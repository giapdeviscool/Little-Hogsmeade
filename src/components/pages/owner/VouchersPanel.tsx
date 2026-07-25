import { useState, useMemo } from 'react'
import type { Branch, Voucher, VoucherPayload } from '../../../types'
import { dateToInput, formatCurrency } from '../../../utils/owner.utils'
import { Pagination } from '../../ui/Pagination'
import { StatusBadge, ScopeBadge } from './OwnerFields'
import { DataTable } from './DataTable'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Eye, Pencil, Power, PowerOff, Plus, Ticket, BadgeDollarSign } from 'lucide-react'
import { ConfirmDialog } from './ConfirmDialog'
import { VoucherDialog } from './VoucherDialog'

type VoucherDialogMode = 'create' | 'edit' | 'view'

export function VouchersPanel({
  branches,
  Vouchers,
  form,
  saving,
  onFormChange,
  onSave,
  isModalOpen,
  dialogMode,
  selectedVoucherId,
  onOpenModal,
  onCloseModal,
  onEdit,
  onView,
  confirmToggleVoucherId,
  setConfirmToggleVoucherId,
  onToggleVoucherStatus
}: {
  branches: Branch[]
  Vouchers: Voucher[]
  form: VoucherPayload
  saving: boolean
  onFormChange: (form: VoucherPayload) => void
  onSave: () => void
  isModalOpen: boolean
  dialogMode: VoucherDialogMode
  selectedVoucherId: string | null
  onOpenModal: () => void
  onCloseModal: () => void
  onEdit: (Voucher: Voucher) => void
  onView: (Voucher: Voucher) => void
  confirmToggleVoucherId: string | null
  setConfirmToggleVoucherId: (id: string | null) => void
  onToggleVoucherStatus: (id: string) => void
}) {

  const VoucherToToggle = Vouchers.find(p => p.id === confirmToggleVoucherId)
  const selectedVoucher = selectedVoucherId ? Vouchers.find(p => p.id === selectedVoucherId) || null : null

  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredVouchers = useMemo(() => {
    return Vouchers.filter(v => {
      if (statusFilter === 'active' && v.isActive === false) return false
      if (statusFilter === 'inactive' && v.isActive !== false) return false
      return true
    })
  }, [Vouchers, statusFilter])

  const PAGE_SIZE = 10
  const totalItems = filteredVouchers.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1
  const paginatedVouchers = filteredVouchers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <TooltipProvider>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-coffee">
              Danh sách Voucher
            </h2>
            <select
              className="h-9 rounded-lg border border-line bg-white px-3 text-sm focus:border-coffee focus:outline-none"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any)
                setPage(1)
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
          <button
            onClick={onOpenModal}
            className="flex h-9 items-center gap-2 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90"
          >
            <Plus className="h-4 w-4" />
            Tạo Voucher
          </button>
        </div>

        <DataTable
          data={paginatedVouchers}
          colSpan={6}
          emptyMessage="Chưa có Voucher."
          renderHeader={() => (
            <tr>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Thời gian Voucher</th>
              <th className="px-4 py-3 flex items-center gap-1">Giảm <BadgeDollarSign className="inline h-4 w-4 " /></th>
              <th className="px-4 py-3">Phạm vi</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          )}
          renderRow={(Voucher) => {
            return (
              <tr
                key={Voucher.id}
                className="cursor-pointer border-t border-line bg-white hover:bg-cream"
                onClick={() => onView(Voucher)}
              >
                <td className="px-4 py-3 font-semibold">
                  <Ticket className="mr-1.5 inline h-4 w-4 text-coffee" />
                  {Voucher.name}
                  {Voucher.description && <div className="text-sm font-normal text-muted mt-0.5">{Voucher.description}</div>}
                </td>
                <td className="px-4 py-3 text-muted">
                  <div className="text-sm">
                    {dateToInput(new Date(Voucher.startDate))} → {dateToInput(new Date(Voucher.expireDate))}
                  </div>
                  {/* <div className="mt-1.5 h-1 w-full rounded-full bg-beige overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div> */}
                </td>
                <td className="px-4 py-3 font-medium text-coffee">
                  {Voucher.discountType === 'percent' ? `${Voucher.discountValue}%` : formatCurrency(Voucher.discountValue)}
                </td>
                <td className="px-4 py-3">
                  <ScopeBadge scope={Voucher.scope} branchCount={Voucher.appliedBranches?.length || 0} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={Voucher.isActive ? 'active' : 'inactive'} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-beige hover:text-coffee"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(Voucher);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Xem chi tiết</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-beige hover:text-coffee"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(Voucher);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chỉnh sửa Voucher</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            Voucher.isActive
                              ? "text-red-700 hover:bg-red-50"
                              : "text-green-700 hover:bg-green-50"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmToggleVoucherId(Voucher.id);
                          }}
                        >
                          {Voucher.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {Voucher.isActive
                            ? "Vô hiệu hóa Voucher"
                            : "Kích hoạt Voucher"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          }}
        />

        {totalPages > 1 || totalItems > 0 ? (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={totalItems}
            onPageChange={setPage}
            label="voucher"
          />
        ) : null}

        <VoucherDialog
          isOpen={isModalOpen}
          onClose={onCloseModal}
          mode={dialogMode}
          Voucher={selectedVoucher}
          form={form}
          branches={branches}
          saving={saving}
          onFormChange={onFormChange}
          onSave={onSave}
        />

        <ConfirmDialog
          isOpen={!!confirmToggleVoucherId}
          title={VoucherToToggle?.isActive ? "Vô hiệu hóa Voucher này?" : "Kích hoạt lại Voucher này?"}
          description={VoucherToToggle?.isActive
            ? "Voucher sẽ không áp dụng được cho đến khi bạn kích hoạt lại."
            : "Voucher sẽ được kích hoạt và áp dụng ngay theo thời gian cài đặt."}
          onConfirm={() => {
            if (confirmToggleVoucherId) {
              onToggleVoucherStatus(confirmToggleVoucherId);
            }
          }}
          onClose={() => setConfirmToggleVoucherId(null)}
          loading={saving}
        />
      </section>
    </TooltipProvider>
  )
}


