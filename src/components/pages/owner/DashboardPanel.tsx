import { Card } from '../../ui/Card'
import type { Branch, ChainDashboard } from '../../../types'
import { BarChart, BranchShareChart, MetricCard } from './OwnerCharts'
import { Field } from './OwnerFields'
import { formatCurrency } from '../../../utils/owner.utils'

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
  dashboard: ChainDashboard | null
  branches: Branch[]
  selectedBranchId: string
  startDate: string
  endDate: string
  onBranchChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
}) {
  const kpis = dashboard?.kpis ?? { totalRevenue: 0, totalOrders: 0, grossProfit: 0 }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Từ ngày">
            <input className="h-9 rounded-lg border border-line bg-white px-3 text-sm" type="date" value={startDate} onChange={(event) => onStartDateChange(event.target.value)} />
          </Field>
          <Field label="Đến ngày">
            <input className="h-9 rounded-lg border border-line bg-white px-3 text-sm" type="date" value={endDate} onChange={(event) => onEndDateChange(event.target.value)} />
          </Field>
          <Field label="Chi nhánh">
            <select className="h-9 rounded-lg border border-line bg-white px-3 text-sm" value={selectedBranchId} onChange={(event) => onBranchChange(event.target.value)}>
              <option value="">Tất cả chi nhánh</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </Field>
        </div>
      </Card>
      <section className="grid grid-cols-3 gap-4">
        <MetricCard label="Tổng doanh thu" value={formatCurrency(kpis.totalRevenue)} />
        <MetricCard label="Tổng đơn hàng" value={String(kpis.totalOrders)} />
        <MetricCard label="Lợi nhuận gộp" value={formatCurrency(kpis.grossProfit)} />
      </section>
      <section className="grid grid-cols-[1fr_360px] gap-5">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Doanh thu theo thời gian</h2>
          <BarChart data={dashboard?.revenueSeries ?? []} />
        </Card>
        <Card className="p-6">
          <h2 className="text-base font-semibold">Hiệu suất chi nhánh</h2>
          <BranchShareChart data={dashboard?.branchPerformance ?? []} />
        </Card>
      </section>
    </div>
  )
}
