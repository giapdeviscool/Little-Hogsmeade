import { useState, useEffect } from 'react'
import { getFinanceDashboard, generateSnapshot, exportFinanceReport, getFinanceSnapshots, type FinancialSummary, type FinancialSnapshot } from '@/api/expense.api'
import { getBranches } from '@/api/chain.api'
import type { Branch } from '@/types'
import { getAuthSession } from '@/store/auth.store'
import { formatVND } from '@/utils/formatCurrency'
import { TrendingUp, TrendingDown, Wallet, FileText, Activity, Download, Save, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import { formatVnDate } from '@/utils/date'
import { DailyProfitView } from './DailyProfitView'

const COLORS = {
  fixed: '#f97316', // orange-500
  variable: '#3b82f6', // blue-500
  semi: '#8b5cf6', // violet-500
  revenue: '#16a34a', // green-600
  totalCost: '#dc2626' // red-600
}

export function FinancialDashboard() {
  const session = getAuthSession()
  const currentBranchId = session?.user?.branchId || ''
  const roleName = session?.user?.role?.name || ''
  const isOwner = ['owner', 'admin', 'chủ quán', 'chu quan', 'manager'].some(r => roleName.toLowerCase().includes(r)) || !currentBranchId || roleName === ''
  
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [snapshots, setSnapshots] = useState<FinancialSnapshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState(currentBranchId)

  useEffect(() => {
    getBranches().then(res => {
      const fetchedBranches = res.data?.items || (Array.isArray(res.data) ? res.data : [])
      setBranches(fetchedBranches)
      if (!selectedBranchId && fetchedBranches.length > 0) {
        setSelectedBranchId(fetchedBranches[0].id)
      }
    }).catch(err => console.error(err))
  }, [selectedBranchId])
  
  // Custom Validation Form State
  const [declaredVariableCost, setDeclaredVariableCost] = useState('')
  const [validationResult, setValidationResult] = useState<{ isConsistent: boolean, diffPercent: number } | null>(null)

  // Default to current month
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const fetchSummary = async () => {
    const branchToFetch = isOwner ? selectedBranchId : currentBranchId
    if (!branchToFetch) return
    setIsLoading(true)
    try {
      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 0).toISOString()

      const [data, snapshotData] = await Promise.all([
        getFinanceDashboard(branchToFetch, startDate, endDate),
        getFinanceSnapshots(branchToFetch)
      ])
      
      setSummary(data)
      setSnapshots(snapshotData.slice(0, 6).reverse()) // Get last 6 snapshots for trend
    } catch (error) {
      alert('Lỗi khi tải báo cáo tài chính')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
    setValidationResult(null)
    setDeclaredVariableCost('')
  }, [selectedBranchId, currentBranchId, month, year])

  const handleValidationCheck = () => {
    if (!summary) return
    const declared = Number(declaredVariableCost)
    if (isNaN(declared) || declared < 0) return alert('Vui lòng nhập số tiền hợp lệ')
    
    const actual = summary.variableCosts.total
    const diff = Math.abs(declared - actual)
    const base = Math.max(declared, actual) || 1
    const diffPercent = (diff / base) * 100

    setValidationResult({
      isConsistent: diffPercent <= 5, // Threshold 5%
      diffPercent: diffPercent
    })
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const branchToExport = isOwner ? selectedBranchId : currentBranchId
    if (!branchToExport) return
    try {
      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 0).toISOString()
      await exportFinanceReport(branchToExport, startDate, endDate, format)
    } catch (error: any) {
      alert(error.message || 'Lỗi khi xuất báo cáo')
    }
  }

  const handleSnapshot = async () => {
    if (!isOwner) return alert('Chỉ chủ quán mới được chốt sổ')
    const branchToSnapshot = selectedBranchId
    if (!branchToSnapshot) return alert('Vui lòng chọn chi nhánh')
    if (!confirm(`Bạn có chắc chắn muốn chốt số liệu tài chính tháng ${month}/${year} không? Dữ liệu này sẽ được lưu lại vĩnh viễn.`)) return
    
    try {
      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 0).toISOString()
      await generateSnapshot(branchToSnapshot, startDate, endDate)
      alert('Đã chốt sổ thành công!')
      fetchSummary()
    } catch (error: any) {
      alert(error.message || 'Lỗi khi chốt sổ')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted animate-pulse">Đang tải báo cáo tài chính...</div>
      </div>
    )
  }

  if (!summary) return null

  // 1. Data for Pie Chart
  const pieData = [
    { name: 'Định phí', value: summary.fixedCosts.total, color: COLORS.fixed },
    { name: 'Biến phí', value: summary.variableCosts.total, color: COLORS.variable },
    { name: 'Hỗn hợp', value: summary.semiVariableCosts.total || 0, color: COLORS.semi }
  ].filter(d => d.value > 0)

  // 2. Data for Trend Bar Chart
  const trendData = snapshots.map(s => {
    const d = new Date(s.periodStart)
    return {
      name: `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`,
      revenue: s.totalRevenue,
      cost: s.totalFixedCost + s.totalVariableCost,
      profit: s.netProfit
    }
  })

  // 3. Data for Break-Even Line Chart
  // We plot 3 points: 0 units, BEP units, and 1.5x BEP units to show the intersection
  const bepUnits = summary.breakEvenUnits || 0
  const maxUnits = bepUnits > 0 ? Math.ceil(bepUnits * 1.5) : 1000
  const unitStep = Math.ceil(maxUnits / 5)
  const breakEvenData = []
  
  for (let u = 0; u <= maxUnits; u += unitStep) {
    const rev = u * summary.avgPricePerUnit
    const tc = summary.fixedCosts.total + (u * summary.variableCostPerUnit)
    breakEvenData.push({
      units: u,
      revenue: rev,
      totalCost: tc,
      fixedCost: summary.fixedCosts.total
    })
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-coffee/20 [&::-webkit-scrollbar-thumb]:rounded-full pb-10 pr-2">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee">Báo cáo Tài chính</h1>
          <p className="mt-1 text-sm text-muted">Tổng quan tình hình thu chi và lợi nhuận</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(isOwner || branches.length > 0) && (
            <select
              className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-coffee outline-none cursor-pointer"
              value={selectedBranchId || currentBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
              {branches.length === 0 && currentBranchId && (
                <option value={currentBranchId}>Chi nhánh hiện tại</option>
              )}
            </select>
          )}
          <select
            className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-coffee outline-none cursor-pointer"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
          <select
            className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-coffee outline-none cursor-pointer"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('xlsx')}
              className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-coffee transition hover:bg-beige"
            >
              <Download className="h-4 w-4" />
              Xuất Excel
            </button>
            {isOwner && (
              <button
                onClick={handleSnapshot}
                className="flex items-center gap-2 rounded-xl bg-coffee px-4 py-2 text-sm font-semibold text-white transition hover:bg-coffee/90 shadow-soft"
              >
                <Save className="h-4 w-4" />
                Chốt Sổ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Doanh thu */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-muted">Doanh thu</div>
            <div className="rounded-full bg-green-100 p-1.5 text-green-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-coffee">
            {formatVND(summary.revenue)}
          </div>
        </div>
        
        {/* Lợi nhuận gộp */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-muted">Lợi nhuận gộp</div>
            <div className="rounded-full bg-blue-100 p-1.5 text-blue-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-coffee">
            {formatVND(summary.grossProfit)}
          </div>
          <div className="mt-1 text-xs text-muted">
            Biên LNG: <span className="font-bold text-blue-600">{summary.grossMargin.toFixed(1)}%</span>
          </div>
        </div>

        {/* Tổng chi phí */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-muted">Tổng chi phí</div>
            <div className="rounded-full bg-red-100 p-1.5 text-red-700">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-red-600">
            {formatVND(summary.totalCost)}
          </div>
        </div>

        {/* Lợi nhuận ròng */}
        <div className="rounded-2xl border border-line bg-gradient-to-br from-coffee to-coffee/90 p-5 shadow-[0_10px_24px_rgba(74,53,37,0.16)] text-white relative overflow-hidden transition hover:shadow-[0_15px_30px_rgba(74,53,37,0.25)]">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
            <Activity className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-white/70">Lợi nhuận thuần</div>
            <div className="mt-3 text-2xl font-bold text-gold">
              {formatVND(summary.netProfit)}
            </div>
            <div className="mt-1 text-xs text-white/80">
              Biên LNR: <span className="font-bold text-gold">{summary.netMargin.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tích hợp Validation Warning (Đối soát số liệu) */}
      <div className="mb-8 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-coffee" />
          <h2 className="text-lg font-bold text-coffee">Đối soát Dữ liệu Chi phí</h2>
        </div>
        <p className="text-sm text-muted mb-4 max-w-3xl">
          Tính năng giúp chủ quán kiểm tra tính nhất quán giữa số tiền <strong>Tổng Biến Phí</strong> khai báo (từ sổ sách ngoài) so với tổng cộng các khoản mục chi tiết đã nhập vào hệ thống.
        </p>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Khai báo Tổng Biến Phí thủ công
            </label>
            <input
              type="number"
              placeholder="Nhập số tiền (VNĐ)"
              className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 outline-none transition focus:border-coffee"
              value={declaredVariableCost}
              onChange={(e) => setDeclaredVariableCost(e.target.value)}
            />
          </div>
          <button
            onClick={handleValidationCheck}
            className="rounded-xl bg-coffee px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-coffee/90 shadow-soft"
          >
            Kiểm tra đối soát
          </button>
        </div>

        {validationResult && (
          <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 border ${
            validationResult.isConsistent ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            {validationResult.isConsistent ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div>
              <h3 className={`font-bold ${validationResult.isConsistent ? 'text-green-800' : 'text-red-800'}`}>
                {validationResult.isConsistent ? 'Dữ liệu nhất quán' : 'CẢNH BÁO LỆCH SỐ LIỆU'}
              </h3>
              <p className={`text-sm mt-1 ${validationResult.isConsistent ? 'text-green-700' : 'text-red-700'}`}>
                Tổng hệ thống tính: <strong>{formatVND(summary.variableCosts.total)}</strong>.<br/>
                Mức độ chênh lệch: <strong>{validationResult.diffPercent.toFixed(2)}%</strong> 
                {validationResult.isConsistent ? ' (Nằm trong ngưỡng cho phép ≤ 5%).' : ' (Vượt quá ngưỡng cho phép 5%). Vui lòng kiểm tra lại các khoản mục chi tiết!'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trend Bar Chart */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-coffee mb-4">Xu hướng Doanh thu & Chi phí</h2>
          <div className="flex-1 w-full h-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                  <YAxis 
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#737373' }} 
                  />
                  <RechartsTooltip 
                    formatter={(val: number) => formatVND(val)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Bar dataKey="revenue" name="Doanh thu" fill={COLORS.revenue} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="cost" name="Tổng chi phí" fill={COLORS.totalCost} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted text-sm">
                Chưa có dữ liệu chốt sổ các tháng trước
              </div>
            )}
          </div>
        </div>

        {/* Break-even Line Chart */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-coffee mb-4">Biểu đồ Điểm hòa vốn</h2>
          <div className="flex-1 w-full h-full">
            {summary.avgPricePerUnit > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={breakEvenData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis 
                    dataKey="units" 
                    type="number"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#737373' }} 
                    dy={10} 
                  />
                  <YAxis 
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#737373' }} 
                  />
                  <RechartsTooltip 
                    formatter={(val: number) => formatVND(val)}
                    labelFormatter={(label) => `Số lượng: ${label} ly`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="plainline" />
                  <Line type="monotone" dataKey="revenue" name="Đường Doanh thu" stroke={COLORS.revenue} strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="totalCost" name="Đường Tổng chi phí" stroke={COLORS.totalCost} strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="fixedCost" name="Định phí" stroke={COLORS.fixed} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted text-sm text-center px-8">
                Chưa có dữ liệu bán hàng tháng này để xác định giá bán trung bình và vẽ biểu đồ hòa vốn.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Biểu đồ Cơ cấu chi phí */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-coffee mb-4">Cơ cấu Chi phí</h2>
          <div className="flex-1 w-full h-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => formatVND(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted text-sm">Chưa có dữ liệu chi phí</div>
            )}
          </div>
        </div>

        {/* Breakdown Lists */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
          {/* Variable Costs */}
          <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden flex flex-col h-full">
            <div className="border-b border-line bg-blue-50/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                <h2 className="font-bold text-coffee">Chi tiết Biến phí</h2>
              </div>
              <div className="font-bold text-red-600">
                {formatVND(summary.variableCosts.total)}
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {summary.variableCosts.breakdown.length === 0 ? (
                  <div className="text-center text-muted py-4 text-sm">Không có dữ liệu</div>
                ) : (
                  summary.variableCosts.breakdown.map((item, index) => {
                    const percent = summary.revenue > 0 ? (item.amount / summary.revenue) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium text-coffee">{item.name}</span>
                          <span className="font-bold text-muted">{formatVND(item.amount)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <div className="h-1.5 flex-1 rounded-full bg-beige overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(percent, 100)}%` }} />
                          </div>
                          <span className="w-10 text-right">{percent.toFixed(1)}%</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Fixed Costs */}
          <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden flex flex-col h-full">
            <div className="border-b border-line bg-orange-50/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                <h2 className="font-bold text-coffee">Chi tiết Định phí</h2>
              </div>
              <div className="font-bold text-red-600">
                {formatVND(summary.fixedCosts.total)}
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {summary.fixedCosts.breakdown.length === 0 ? (
                  <div className="text-center text-muted py-4 text-sm">Không có dữ liệu</div>
                ) : (
                  summary.fixedCosts.breakdown.map((item, index) => {
                    const percent = summary.revenue > 0 ? (item.amount / summary.revenue) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium text-coffee">{item.name}</span>
                          <span className="font-bold text-muted">{formatVND(item.amount)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <div className="h-1.5 flex-1 rounded-full bg-beige overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(percent, 100)}%` }} />
                          </div>
                          <span className="w-10 text-right">{percent.toFixed(1)}%</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Profit View */}
      <DailyProfitView 
        branchId={isOwner ? selectedBranchId : currentBranchId} 
        month={month} 
        year={year} 
        onMonthChange={(m, y) => {
          setMonth(m)
          setYear(y)
        }}
      />

    </div>
  )
}
