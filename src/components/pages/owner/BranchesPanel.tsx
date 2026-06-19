import type { Branch, BranchPayload } from "../../../types";
import { StatusBadge } from "./OwnerFields";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";
import { Pencil, Power, PowerOff, Plus } from "lucide-react";
import { DataTable } from "./DataTable";
import { BranchDialog } from "./BranchDialog";

export function BranchesPanel({
  branches,
  form,
  editingBranchId,
  saving,
  isModalOpen,
  onOpenModal,
  onCloseModal,
  onFormChange,
  onSave,
  onEdit,
  onToggleStatus,
}: {
  branches: Branch[];
  form: BranchPayload;
  editingBranchId: string | null;
  saving: boolean;
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onFormChange: (form: BranchPayload) => void;
  onSave: () => void;
  onEdit: (branch: Branch) => void;
  onToggleStatus: (id: string) => void;
}) {
  return (
    <TooltipProvider>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-coffee">
            Danh sách chi nhánh
          </h2>
          <button
            onClick={onOpenModal}
            className="flex h-9 items-center gap-2 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90"
          >
            <Plus className="h-4 w-4" />
            Tạo chi nhánh
          </button>
        </div>

        <DataTable
          data={branches}
          colSpan={6}
          emptyMessage="Chưa có chi nhánh."
          renderHeader={() => (
            <tr>
              <th className="px-3 py-3">Tên</th>
              <th className="px-3 py-3">Địa chỉ</th>
              <th className="px-3 py-3">Số ĐT</th>
              <th className="px-3 py-3">GPS</th>
              <th className="px-3 py-3">Trạng thái</th>
              <th className="px-3 py-3 text-right">Thao tác</th>
            </tr>
          )}
          renderRow={(branch) => (
            <tr
              key={branch.id}
              className="border-t border-line bg-white hover:bg-cream"
            >
              <td className="px-3 py-3 font-semibold">{branch.name}</td>
              <td className="max-w-[260px] px-3 py-3 text-muted">
                {branch.address}
              </td>
              <td className="px-3 py-3">{branch.phone}</td>
              <td className="px-3 py-3 text-xs text-muted">
                {branch.lat.toFixed(4)}, {branch.lng.toFixed(4)}
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={branch.status} />
              </td>
              <td className="px-3 py-3 text-right">
                <div className="flex justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-beige hover:text-coffee"
                        onClick={() => onEdit(branch)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Chỉnh sửa chi nhánh</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          branch.status === "active"
                            ? "text-red-700 hover:bg-red-50"
                            : "text-green-700 hover:bg-green-50"
                        }`}
                        onClick={() => onToggleStatus(branch.id)}
                      >
                        {branch.status === "active" ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {branch.status === "active"
                          ? "Vô hiệu hóa chi nhánh"
                          : "Kích hoạt chi nhánh"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </td>
            </tr>
          )}
        />

        <BranchDialog
          isOpen={isModalOpen}
          onClose={onCloseModal}
          form={form}
          editingBranchId={editingBranchId}
          saving={saving}
          onFormChange={onFormChange}
          onSave={onSave}
        />
      </section>
    </TooltipProvider>
  );
}