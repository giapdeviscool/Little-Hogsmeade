import { useState } from "react";
import type { Branch, BranchPayload } from "../../../types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Plus, Store } from "lucide-react";
import { BranchCard } from "./BranchCard";
import { BranchDialog } from "./BranchDialog";
import { BranchDetailDialog } from "./BranchDetailDialog";
import { isOwner } from "../../../utils/permissions";

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
  const [detailBranch, setDetailBranch] = useState<Branch | null>(null);

  return (
    <TooltipProvider>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-coffee">
            Danh sách chi nhánh
          </h2>
          {isOwner() && (
          <button
            onClick={onOpenModal}
            className="flex h-9 items-center gap-2 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90"
          >
            <Plus className="h-4 w-4" />
            Tạo chi nhánh
          </button>
          )}
        </div>

        {branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-cream py-16 text-center">
            <Store className="mb-3 h-10 w-10 text-latte" />
            <p className="text-base font-semibold text-coffee">Chưa có chi nhánh</p>
            <p className="mt-1 text-sm text-muted">Bắt đầu bằng cách tạo chi nhánh đầu tiên.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onView={() => setDetailBranch(branch)}
                onEdit={() => onEdit(branch)}
                onToggle={() => onToggleStatus(branch.id)}
                canEdit={isOwner()}
              />
            ))}
          </div>
        )}

        <BranchDialog
          isOpen={isModalOpen}
          onClose={onCloseModal}
          form={form}
          editingBranchId={editingBranchId}
          saving={saving}
          onFormChange={onFormChange}
          onSave={onSave}
        />

        <BranchDetailDialog
          isOpen={detailBranch !== null}
          onClose={() => setDetailBranch(null)}
          branch={detailBranch}
        />
      </section>
    </TooltipProvider>
  );
}