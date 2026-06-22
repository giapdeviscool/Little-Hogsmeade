import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateField, Field, NumberField, TextField, StatusBadge, DetailRow } from "./OwnerFields";
import { dateToInput } from "../../../utils/owner.utils";
import type { Branch, Promotion, PromotionPayload } from "../../../types";

type PromotionDialogMode = "create" | "edit" | "view";

export function PromotionDialog({
  isOpen,
  onClose,
  mode,
  promotion,
  form,
  branches,
  saving,
  onFormChange,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: PromotionDialogMode;
  promotion: Promotion | null;
  form: PromotionPayload;
  branches: Branch[];
  saving: boolean;
  onFormChange: (form: PromotionPayload) => void;
  onSave: () => void;
}) {
  const isViewMode = mode === "view";
  const title = mode === "create" ? "Tạo khuyến mãi mới" : mode === "edit" ? "Sửa khuyến mãi" : promotion?.name || "Chi tiết khuyến mãi";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-coffee">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {isViewMode && promotion ? (
            <>
              <DetailRow label="Mô tả" value={promotion.description || "—"} />
              <DetailRow
                label="Thời gian"
                value={`${dateToInput(new Date(promotion.startDate))} → ${dateToInput(new Date(promotion.endDate))}`}
              />
              <DetailRow
                label="Giảm giá"
                value={promotion.discountType === "percent" ? `${promotion.discountValue}%` : `${promotion.discountValue.toLocaleString("vi-VN")} ₫`}
              />
              <DetailRow
                label="Phạm vi"
                value={promotion.scope === "global" ? "Toàn chuỗi" : `${promotion.appliedBranches?.length || 0} chi nhánh`}
              />
              <DetailRow
                label="Trạng thái"
                value={<StatusBadge status={promotion.isActive ? "active" : "inactive"} />}
              />
            </>
          ) : (
            <>
              <TextField
                label="Tên khuyến mãi"
                value={form.name}
                onChange={(value) => onFormChange({ ...form, name: value })}
              />
              <TextField
                label="Mô tả"
                value={form.description ?? ""}
                onChange={(value) => onFormChange({ ...form, description: value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <DateField
                  label="Bắt đầu"
                  value={form.startDate}
                  onChange={(value) => onFormChange({ ...form, startDate: value })}
                />
                <DateField
                  label="Kết thúc"
                  value={form.endDate}
                  onChange={(value) => onFormChange({ ...form, endDate: value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Giảm giá"
                  value={form.discountValue}
                  onChange={(value) => onFormChange({ ...form, discountValue: value })}
                />
                <Field label="Loại">
                  <select
                    className="h-9 rounded-lg border border-line bg-white px-3 text-sm"
                    value={form.discountType}
                    onChange={(event) =>
                      onFormChange({
                        ...form,
                        discountType: event.target.value as PromotionPayload["discountType"],
                      })
                    }
                  >
                    <option value="percent">Phần trăm</option>
                    <option value="fixed">Số tiền</option>
                  </select>
                </Field>
              </div>
              <Field label="Phạm vi">
                <select
                  className="h-9 rounded-lg border border-line bg-white px-3 text-sm"
                  value={form.scope}
                  onChange={(event) =>
                    onFormChange({
                      ...form,
                      scope: event.target.value as PromotionPayload["scope"],
                      appliedBranches: [],
                    })
                  }
                >
                  <option value="global">Toàn chuỗi</option>
                  <option value="specific">Chi nhánh cụ thể</option>
                </select>
              </Field>
              {form.scope === "specific" ? (
                <Field label="Chi nhánh">
                  <select
                    className="h-9 rounded-lg border border-line bg-white px-3 text-sm"
                    value={form.appliedBranches[0] ?? ""}
                    onChange={(event) =>
                      onFormChange({
                        ...form,
                        appliedBranches: event.target.value ? [event.target.value] : [],
                      })
                    }
                  >
                    <option value="">Chọn chi nhánh</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              className="h-9 rounded-lg px-4 text-sm font-semibold text-muted transition-colors hover:bg-beige"
              onClick={onClose}
            >
              {isViewMode ? "Đóng" : "Hủy"}
            </button>
            {!isViewMode ? (
              <button
                className="h-9 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90 disabled:opacity-50"
                disabled={saving}
                onClick={onSave}
              >
                {mode === "create" ? "Tạo khuyến mãi" : "Lưu"}
              </button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
