import { Card } from "../../ui/Card";
import type { OwnerActiveTab } from "../../../types";

const ownerTabs: Array<[OwnerActiveTab, string]> = [
  ["dashboard", "Dashboard"],
  ["branches", "Chi nhánh"],
  ["sync", "Đồng bộ"],
  ["pricing", "Giá bán"],
  ["promotions", "Khuyến mãi"],
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
}: {
  error: string;
  notice: string;
}) {
  if (!error && !notice) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}
    >
      {error || notice}
    </div>
  );
}

export function OwnerTabs({ activeTab, onChange }: { activeTab: OwnerActiveTab; onChange: (tab: OwnerActiveTab) => void }) {
  return (
    <div className="flex border-b-2 border-line">
      {ownerTabs.map(([key, label]) => (
        <button
          key={key}
          className={`relative h-[38px] px-4 text-sm font-semibold whitespace-nowrap transition-colors
            after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-0.5 after:transition-all
            ${activeTab === key
              ? 'text-coffee after:bg-coffee'
              : 'text-muted after:bg-transparent hover:text-coffee'
            }`}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function OwnerLoading() {
  return (
    <Card className="p-6 text-sm text-muted">Đang tải dữ liệu chuỗi...</Card>
  );
}
