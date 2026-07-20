import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateField, Field, NumberField, TextField, StatusBadge, DetailRow } from "./OwnerFields";
import { dateToInput } from "../../../utils/owner.utils";
import type { Branch, Voucher, VoucherPayload } from "../../../types";
import { getAuthSession } from '../../../store/auth.store';

type VoucherDialogMode = "create" | "edit" | "view";

export function VoucherDialog({
  isOpen,
  onClose,
  mode,
  Voucher: voucher,
  form,
  branches,
  saving,
  onFormChange,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: VoucherDialogMode;
  Voucher: Voucher | null;
  form: VoucherPayload;
  branches: Branch[];
  saving: boolean;
  onFormChange: (form: VoucherPayload) => void;
  onSave: () => void;
}) {
  const session = getAuthSession();
  const roleName = session?.user?.role || session?.user?.roleName || '';
  const isOwner = roleName.toLowerCase().includes('owner');

  const isViewMode = mode === "view";
  const title = mode === "create" ? "Tạo Voucher mới" : mode === "edit" ? "Sửa Voucher" : voucher?.name || "Chi tiết Voucher";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-lg p-0 gap-0 overflow-hidden bg-cream border-line">
        <DialogHeader className="border-b border-line bg-white px-6 py-5 text-left">
          <DialogTitle className="text-xl font-bold text-coffee">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 py-6 overflow-y-auto max-h-[80vh]">
          {isViewMode && voucher ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <DetailRow label="Tên Voucher" value={voucher.name} />
                <DetailRow label="Mã nhập" value={voucher.requiresCode ? (voucher.code || "Có mã (chưa thiết lập)") : "Tự động áp dụng"} />
                <DetailRow label="Mô tả" value={voucher.description || "—"} />
                <DetailRow
                  label="Thời gian"
                  value={`${dateToInput(new Date(voucher.startDate))} → ${dateToInput(new Date(voucher.expireDate))}`}
                />
              </div>
              <div className="space-y-4">
                <DetailRow
                  label="Giảm giá"
                  value={voucher.discountType === "percent" ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString("vi-VN")} ₫`}
                />
                <DetailRow
                  label="Điều kiện"
                  value={`Tối thiểu ${voucher.minOrderValue?.toLocaleString("vi-VN")} ₫`}
                />
                <DetailRow
                  label="Giới hạn dùng"
                  value={`${voucher.usedCount} / ${voucher.maxUses} lượt`}
                />
                <DetailRow
                  label="Trạng thái"
                  value={<StatusBadge status={voucher.isActive ? "active" : "inactive"} />}
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-4">
                <DetailRow
                  label="Phạm vi áp dụng"
                  value={
                    voucher.scope === 'global' ? (
                      <span className="font-semibold text-emerald-600">Toàn chuỗi</span>
                    ) : (
                      <div className="flex flex-wrap justify-end gap-1">
                        {voucher.appliedBranches?.map(bId => {
                          const bName = branches.find(b => b.id === bId)?.name || bId;
                          return <span key={bId} className="bg-beige px-2 py-0.5 rounded text-xs text-coffee">{bName}</span>
                        })}
                      </div>
                    )
                  }
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextField
                  label="Tên Voucher"
                  value={form.name}
                  onChange={(value) => onFormChange({ ...form, name: value })}
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mt-7">
                    <input
                      type="checkbox"
                      id="requiresCode"
                      checked={form.requiresCode}
                      onChange={(e) => onFormChange({ ...form, requiresCode: e.target.checked })}
                      className="w-4 h-4 text-coffee"
                    />
                    <label htmlFor="requiresCode" className="text-sm font-semibold text-coffee">
                      Yêu cầu nhập mã
                    </label>
                  </div>
                </div>
              </div>

              {form.requiresCode && (
                <TextField
                  label="Mã giảm giá (code)"
                  value={form.code ?? ""}
                  onChange={(value) => onFormChange({ ...form, code: value.toUpperCase() })}
                />
              )}

              <TextField
                label="Mô tả chi tiết"
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
                  value={form.expireDate}
                  onChange={(value) => onFormChange({ ...form, expireDate: value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Mức giảm"
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
                        discountType: event.target.value as VoucherPayload["discountType"],
                      })
                    }
                  >
                    <option value="percent">Phần trăm</option>
                    <option value="fixed">Số tiền</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Đơn tối thiểu (VNĐ)"
                  value={form.minOrderValue ?? 0}
                  onChange={(value) => onFormChange({ ...form, minOrderValue: value })}
                />
                <NumberField
                  label="Giới hạn số lượt"
                  value={form.maxUses ?? 100}
                  onChange={(value) => onFormChange({ ...form, maxUses: value })}
                />
              </div>

              {isOwner && (
                <Field label="Phạm vi áp dụng">
                  <select
                    className="h-9 rounded-lg border border-line bg-white px-3 text-sm"
                    value={form.scope}
                    onChange={(event) =>
                      onFormChange({
                        ...form,
                        scope: event.target.value as VoucherPayload["scope"],
                        appliedBranches: [],
                      })
                    }
                  >
                    <option value="global">Toàn chuỗi</option>
                    <option value="specific">Chi nhánh cụ thể</option>
                  </select>
                </Field>
              )}
              {isOwner && form.scope === "specific" ? (
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

          <div className="border-t border-line bg-white -mx-6 -mb-6 mt-6 px-6 py-4 flex justify-end gap-2">
            <button
              type="button"
              className="h-9 rounded-lg px-4 text-sm font-semibold text-muted transition-colors hover:bg-beige"
              onClick={onClose}
            >
              {isViewMode ? "Đóng" : "Hủy"}
            </button>
            {!isViewMode && (
              <button
                type="button"
                className="h-9 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90 disabled:opacity-50"
                disabled={saving}
                onClick={onSave}
              >
                {mode === "create" ? "Tạo mới" : "Xác nhận"}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
