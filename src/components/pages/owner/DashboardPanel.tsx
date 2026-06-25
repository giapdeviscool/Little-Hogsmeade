import { useState } from "react";
import { Card } from "../../ui/Card";
import type { Branch, ChainDashboard } from "../../../types";
import {
  BarChart,
  BranchPerformanceTable,
  LowStockBanner,
  MetricCard,
} from "./OwnerCharts";
import { Field } from "./OwnerFields";
import { formatCurrency } from "../../../utils/owner.utils";
import { exportChainDashboard } from "../../../api/chain.api";
import { Sheet } from "lucide-react";

export function DashboardPanel({
  dashboard,
  branches,
  selectedBranchId,
  startDate,
  endDate,
  onBranchChange,
  onStartDateChange,
  onEndDateChange,
}: {
  dashboard: ChainDashboard | null;
  branches: Branch[];
  selectedBranchId: string;
  startDate: string;
  endDate: string;
  onBranchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const kpis = dashboard?.kpis ?? {
    totalRevenue: 0,
    totalOrders: 0,
    grossProfit: 0,
  };

  const handleExport = async () => {
    if (!dashboard?.filters) return;
    setIsExporting(true);
    try {
      const blob = await exportChainDashboard({
        startDate: dashboard.filters.startDate,
        endDate: dashboard.filters.endDate,
        branchId: dashboard.filters.branchId || undefined,
      });

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;

      const branchName = branches.find((branch) => branch.id === dashboard.filters.branchId)?.name;

      const suffix = dashboard.filters.branchId
        ? `branch_${branchName || dashboard.filters.branchId}`
        : "all";
      link.setAttribute("download", `bao-cao-chuoi_${suffix}.xlsx`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-end justify-between gap-4">
          <div className="grid flex-1 grid-cols-3 gap-4">
            <Field label="Từ ngày">
              <input
                className="h-9 rounded-lg border border-line bg-white px-3 text-sm"
                type="date"
                value={startDate}
                onChange={(event) => onStartDateChange(event.target.value)}
              />
            </Field>
            <Field label="Đến ngày">
              <input
                className="h-9 rounded-lg border border-line bg-white px-3 text-sm"
                type="date"
                value={endDate}
                onChange={(event) => onEndDateChange(event.target.value)}
              />
            </Field>
            <Field label="Chi nhánh">
              <select
                className="h-9 rounded-lg border border-line bg-white px-3 text-sm"
                value={selectedBranchId}
                onChange={(event) => onBranchChange(event.target.value)}
              >
                <option value="">Tất cả chi nhánh</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting || !dashboard}
            className="h-9 rounded-lg bg-coffee px-4 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
          <Sheet className="inline h-4 w-4 mr-1" />  {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </button>
        </div>
      </Card>

      <section className="grid grid-cols-[1.4fr_1fr_1fr] gap-4">
        <MetricCard
          label="Lợi nhuận gộp"
          value={formatCurrency(kpis.grossProfit)}
          emphasis
          helperText="Lợi nhuận kỳ này"
        />
        <MetricCard
          label="Tổng doanh thu"
          value={formatCurrency(kpis.totalRevenue)}
        />
        <MetricCard label="Tổng đơn hàng" value={String(kpis.totalOrders)} />
      </section>

      <section className="grid grid-cols-[1fr_420px] gap-4">
        <Card className="p-4">
          <h2 className="text-base font-semibold">Doanh thu theo thời gian</h2>
          <BarChart data={dashboard?.revenueSeries ?? []} />
        </Card>
        <Card className="p-4">
          <h2 className="text-base font-semibold">Hiệu suất chi nhánh</h2>
          <BranchPerformanceTable data={dashboard?.branchPerformance ?? []} />
        </Card>
      </section>

      <LowStockBanner data={dashboard?.lowStockAlerts ?? []} />
    </div>
  );
}
