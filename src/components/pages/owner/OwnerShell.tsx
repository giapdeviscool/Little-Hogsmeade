import { Card } from "../../ui/Card";
import type { OwnerActiveTab } from "../../../types";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

const ownerTabs: Array<{
  key: OwnerActiveTab;
  label: string;
  description: string;
}> = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Tổng quan doanh thu - hiệu suất",
  },
  {
    key: "branches",
    label: "Chi nhánh",
    description: "Quản lý thông tin chi nhánh",
  },
  {
    key: "sync",
    label: "Đồng bộ",
    description: "Đồng bộ thực đơn - cấu hình",
  },
  {
    key: "pricing",
    label: "Giá bán",
    description: "Thiết lập & tùy chỉnh giá bán",
  },
];

export function OwnerHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-muted">Control Center</p>
        <h1 className="text-[30px] font-semibold text-coffee">
          Quản trị Chuỗi
        </h1>
      </div>
      <button
        className="h-9 rounded-lg border border-latte bg-white px-4 text-sm font-semibold text-coffee transition-colors hover:bg-beige"
        onClick={onRefresh}
      >
        Làm mới
      </button>
    </div>
  );
}

export function OwnerAlert({
  error,
  notice,
  onClose,
}: {
  error: string;
  notice: string;
  onClose: () => void;
}) {
  if (!error && !notice) {
    return null;
  }

  return (
    <div
      className={`relative flex items-center justify-between rounded-lg border px-4 py-3 text-sm pr-10 ${
        error
          ? "border-red-100 bg-red-50 text-red-700"
          : "border-emerald-100 bg-emerald-50 text-emerald-700"
      }`}
    >
      <span>{error || notice}</span>
      <button
        onClick={onClose}
        className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors ${
          error
            ? "hover:bg-red-100 text-red-500 hover:text-red-900"
            : "hover:bg-emerald-100 text-emerald-500 hover:text-emerald-900"
        }`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function OwnerTabs({
  activeTab,
  onChange,
}: {
  activeTab: OwnerActiveTab;
  onChange: (tab: OwnerActiveTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-line/50 bg-cream p-2 shadow-soft">
      {ownerTabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex-1 min-w-[200px] rounded-[16px] p-4 text-left transition",
              isActive 
                ? "bg-white text-coffee shadow-soft" 
                : "text-muted hover:bg-white/70"
            )}
          >
            <span className="block text-[15px] font-semibold">
              {tab.label}
            </span>
            <span className={cn(
              "mt-1 block text-xs leading-5",
              isActive ? "text-coffee/80" : "text-muted/70"
            )}>
              {tab.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function OwnerLoading() {
  return (
    <Card className="p-6 text-sm text-muted">Đang tải dữ liệu chuỗi...</Card>
  );
}
