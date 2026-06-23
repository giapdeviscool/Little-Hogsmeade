import type { Branch, Promotion, PromotionPayload } from '../../../types'
import { dateToInput, formatCurrency } from '../../../utils/owner.utils'
import { StatusBadge, ScopeBadge } from './OwnerFields'
import { DataTable } from './DataTable'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Eye, Pencil, Power, PowerOff, Plus } from 'lucide-react'
import { ConfirmDialog } from './ConfirmDialog'
import { PromotionDialog } from './PromotionDialog'

type PromotionDialogMode = 'create' | 'edit' | 'view'

export function PromotionsPanel({
  branches,
  promotions,
  form,
  saving,
  onFormChange,
  onSave,
  isModalOpen,
  dialogMode,
  selectedPromotionId,
  onOpenModal,
  onCloseModal,
  onEdit,
  onView,
  confirmTogglePromotionId,
  setConfirmTogglePromotionId,
  onTogglePromotionStatus
}: {
  branches: Branch[]
  promotions: Promotion[]
  form: PromotionPayload
  saving: boolean
  onFormChange: (form: PromotionPayload) => void
  onSave: () => void
  isModalOpen: boolean
  dialogMode: PromotionDialogMode
  selectedPromotionId: string | null
  onOpenModal: () => void
  onCloseModal: () => void
  onEdit: (promotion: Promotion) => void
  onView: (promotion: Promotion) => void
  confirmTogglePromotionId: string | null
  setConfirmTogglePromotionId: (id: string | null) => void
  onTogglePromotionStatus: (id: string) => void
}) {

  const promotionToToggle = promotions.find(p => p.id === confirmTogglePromotionId)
  const selectedPromotion = selectedPromotionId ? promotions.find(p => p.id === selectedPromotionId) || null : null

  return (
    <TooltipProvider>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-coffee">
            Danh sách khuyến mãi
          </h2>
          <button
            onClick={onOpenModal}
            className="flex h-9 items-center gap-2 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90"
          >
            <Plus className="h-4 w-4" />
            Tạo khuyến mãi
          </button>
        </div>

        <DataTable
          data={promotions}
          colSpan={6}
          emptyMessage="Chưa có khuyến mãi."
          renderHeader={() => (
            <tr>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Giảm</th>
              <th className="px-4 py-3">Phạm vi</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          )}
          renderRow={(promotion) => {
            return (
              <tr
                key={promotion.id}
                className="cursor-pointer border-t border-line bg-white hover:bg-cream"
                onClick={() => onView(promotion)}
              >
                <td className="px-4 py-3 font-semibold">
                  {promotion.name}
                  {promotion.description && <div className="text-sm font-normal text-muted mt-0.5">{promotion.description}</div>}
                </td>
                <td className="px-4 py-3 text-muted">
                  <div className="text-sm">
                    {dateToInput(new Date(promotion.startDate))} → {dateToInput(new Date(promotion.endDate))}
                  </div>
                  {/* <div className="mt-1.5 h-1 w-full rounded-full bg-beige overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div> */}
                </td>
                <td className="px-4 py-3 font-medium text-coffee">
                  {promotion.discountType === 'percent' ? `${promotion.discountValue}%` : formatCurrency(promotion.discountValue)}
                </td>
                <td className="px-4 py-3">
                  <ScopeBadge scope={promotion.scope} branchCount={promotion.appliedBranches?.length || 0} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={promotion.isActive ? 'active' : 'inactive'} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-beige hover:text-coffee"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(promotion);
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
                            onEdit(promotion);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chỉnh sửa khuyến mãi</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            promotion.isActive
                              ? "text-red-700 hover:bg-red-50"
                              : "text-green-700 hover:bg-green-50"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmTogglePromotionId(promotion.id);
                          }}
                        >
                          {promotion.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {promotion.isActive
                            ? "Vô hiệu hóa khuyến mãi"
                            : "Kích hoạt khuyến mãi"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          }}
        />

        <PromotionDialog
          isOpen={isModalOpen}
          onClose={onCloseModal}
          mode={dialogMode}
          promotion={selectedPromotion}
          form={form}
          branches={branches}
          saving={saving}
          onFormChange={onFormChange}
          onSave={onSave}
        />

        <ConfirmDialog
          isOpen={!!confirmTogglePromotionId}
          title={promotionToToggle?.isActive ? "Vô hiệu hóa khuyến mãi này?" : "Kích hoạt lại khuyến mãi này?"}
          description={promotionToToggle?.isActive
            ? "Khuyến mãi sẽ không áp dụng được cho đến khi bạn kích hoạt lại."
            : "Khuyến mãi sẽ được kích hoạt và áp dụng ngay theo thời gian cài đặt."}
          onConfirm={() => {
            if (confirmTogglePromotionId) {
              onTogglePromotionStatus(confirmTogglePromotionId);
            }
          }}
          onClose={() => setConfirmTogglePromotionId(null)}
          loading={saving}
        />
      </section>
    </TooltipProvider>
  )
}
