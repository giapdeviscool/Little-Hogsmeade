import { useState, useEffect, useMemo } from 'react'
import { getDailyProfit, type DailyProfitData, type DailyProfitMeta } from '@/api/expense.api'
import { formatVND } from '@/utils/formatCurrency'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { AlertTriangle, Info, X, TrendingUp, TrendingDown, ChevronRight, ChevronLeft } from 'lucide-react'

interface DailyProfitViewProps {
  branchId: string
  month: number
  year: number
  onMonthChange?: (month: number, year: number) => void
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function getProfitColor(profit: number, maxAbs: number): string {
  if (maxAbs === 0) return 'bg-gray-50 border-gray-100'
  const ratio = Math.min(Math.abs(profit) / maxAbs, 1)
  if (profit > 0) {
    if (ratio > 0.7) return 'bg-green-200 border-green-300'
    if (ratio > 0.3) return 'bg-green-100 border-green-200'
    return 'bg-green-50 border-green-100'
  }
  if (profit < 0) {
    if (ratio > 0.7) return 'bg-red-200 border-red-300'
    if (ratio > 0.3) return 'bg-red-100 border-red-200'
    return 'bg-red-50 border-red-100'
  }
  return 'bg-gray-50 border-gray-100'
}

function DayDetailPanel({ day, meta, onClose }: { day: DailyProfitData; meta: DailyProfitMeta | null; onClose: () => void }) {
  const dateObj = new Date(day.date)
  const dayOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][dateObj.getDay()]
  
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-lg animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-coffee">
            {dayOfWeek}, {dateObj.toLocaleDateString('vi-VN')}
          </h3>
          <p className="text-xs text-muted mt-0.5">Chi tiết lợi nhuận trong ngày</p>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-muted transition hover:bg-beige">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Waterfall breakdown */}
      <div className="space-y-3">
        {/* Doanh thu */}
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-green-50 border border-green-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">Doanh thu</span>
          </div>
          <span className="text-sm font-bold text-green-700">+{formatVND(day.revenue)}</span>
        </div>

        {/* COGS */}
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-orange-50 border border-orange-100">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">COGS (NL × {day.unitsSold} cốc)</span>
          </div>
          <span className="text-sm font-bold text-orange-700">−{formatVND(day.cogs)}</span>
        </div>

        {/* Định phí */}
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-red-50 border border-red-100">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm font-semibold text-red-800">Định phí/ngày</span>
          </div>
          <span className="text-sm font-bold text-red-600">−{formatVND(day.fixedCostPerDay)}</span>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-dashed border-coffee/20" />

        {/* Lãi ròng */}
        <div className={`flex items-center justify-between py-3 px-3 rounded-xl border-2 ${
          day.netProfit >= 0 ? 'bg-purple-50 border-purple-200' : 'bg-red-50 border-red-300'
        }`}>
          <span className="text-sm font-bold text-coffee">= Lãi ròng/ngày</span>
          <span className={`text-lg font-bold ${day.netProfit >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
            {formatVND(day.netProfit)}
          </span>
        </div>
      </div>

      {/* Định phí breakdown */}
      {meta && meta.fixedBreakdown.length > 0 && (
        <div className="mt-4 pt-3 border-t border-line">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Cơ cấu Định phí tháng</p>
          <div className="space-y-1.5">
            {meta.fixedBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted">{item.name}</span>
                <span className="font-semibold text-coffee">{formatVND(item.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-line">
              <span className="font-bold text-coffee">Tổng ÷ {meta.daysInMonth} ngày</span>
              <span className="font-bold text-red-600">{formatVND(meta.dailyFixedCost)}/ngày</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function DailyProfitView({ branchId, month, year, onMonthChange }: DailyProfitViewProps) {
  const [data, setData] = useState<DailyProfitData[]>([])
  const [meta, setMeta] = useState<DailyProfitMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<DailyProfitData | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'chart'>('calendar')

  useEffect(() => {
    if (!branchId) return
    const fetchDaily = async () => {
      setLoading(true)
      try {
        const startDate = new Date(year, month - 1, 1).toISOString()
        const endDate = new Date(year, month, 0).toISOString()
        const res = await getDailyProfit(branchId, startDate, endDate)
        setData(res.days || [])
        setMeta(res.meta || null)
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu lợi nhuận ngày', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDaily()
  }, [branchId, month, year])

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    if (data.length === 0) return []
    
    const firstDay = new Date(year, month - 1, 1)
    // getDay: 0=Sun, convert to Mon-start: (getDay + 6) % 7
    const startOffset = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(year, month, 0).getDate()
    
    const dataMap = new Map<string, DailyProfitData>()
    for (const d of data) {
      dataMap.set(d.date, d)
    }
    
    const weeks: (DailyProfitData | null)[][] = []
    let currentWeek: (DailyProfitData | null)[] = []
    
    // Fill empty cells before first day
    for (let i = 0; i < startOffset; i++) {
      currentWeek.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month - 1, day).toISOString().split('T')[0]
      const dayData = dataMap.get(dateStr) || {
        date: dateStr,
        revenue: 0,
        cogs: 0,
        fixedCostPerDay: meta?.dailyFixedCost || 0,
        netProfit: -(meta?.dailyFixedCost || 0),
        unitsSold: 0
      }
      currentWeek.push(dayData)
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    
    // Fill remaining cells in last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null)
      weeks.push(currentWeek)
    }
    
    return weeks
  }, [data, month, year, meta])

  const maxAbsProfit = useMemo(() => {
    return data.reduce((max, d) => Math.max(max, Math.abs(d.netProfit)), 1)
  }, [data])

  if (loading) {
    return <div className="text-center py-8 text-muted">Đang tải dữ liệu lợi nhuận theo ngày...</div>
  }

  if (data.length === 0) return null

  const totalNetProfit = data.reduce((sum, d) => sum + d.netProfit, 0)
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalCOGS = data.reduce((sum, d) => sum + d.cogs, 0)
  const totalUnits = data.reduce((sum, d) => sum + d.unitsSold, 0)
  const profitDays = data.filter(d => d.netProfit > 0).length
  const lossDays = data.filter(d => d.netProfit < 0).length

  const chartData = data.map(d => ({
    ...d,
    dateDisplay: new Date(d.date).getDate().toString()
  }))

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="mt-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-coffee">Lợi nhuận theo ngày</h2>
            {onMonthChange && (
              <div className="flex items-center gap-1 bg-beige rounded-xl px-1.5 py-1">
                <button 
                  onClick={() => {
                    let m = month - 1; let y = year
                    if (m < 1) { m = 12; y-- }
                    onMonthChange(m, y)
                  }}
                  className="p-1 rounded-lg hover:bg-white text-coffee transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-coffee min-w-[80px] text-center">
                  Tháng {month}/{year}
                </span>
                <button 
                  onClick={() => {
                    let m = month + 1; let y = year
                    if (m > 12) { m = 1; y++ }
                    onMonthChange(m, y)
                  }}
                  className="p-1 rounded-lg hover:bg-white text-coffee transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted mt-1">
            Lãi/ngày = Doanh thu − COGS − Định phí/{meta?.daysInMonth || 30} ngày • Click vào ô ngày để xem chi tiết
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'calendar' ? 'bg-coffee text-white' : 'bg-beige text-coffee hover:bg-coffee/10'
            }`}
          >
            📅 Lịch
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'chart' ? 'bg-coffee text-white' : 'bg-beige text-coffee hover:bg-coffee/10'
            }`}
          >
            📈 Biểu đồ
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border border-line bg-white p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Tổng Doanh thu</div>
          <div className="mt-1 text-lg font-bold text-green-600">{formatVND(totalRevenue)}</div>
        </div>
        <div className="rounded-xl border border-line bg-white p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Tổng COGS</div>
          <div className="mt-1 text-lg font-bold text-orange-600">{formatVND(totalCOGS)}</div>
        </div>
        <div className="rounded-xl border border-line bg-white p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Tổng cốc bán</div>
          <div className="mt-1 text-lg font-bold text-coffee">{totalUnits.toLocaleString('vi-VN')}</div>
        </div>
        <div className={`rounded-xl border p-3 shadow-sm ${totalNetProfit >= 0 ? 'border-purple-200 bg-purple-50' : 'border-red-200 bg-red-50'}`}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Tổng Lãi ròng</div>
          <div className={`mt-1 text-lg font-bold ${totalNetProfit >= 0 ? 'text-purple-700' : 'text-red-700'}`}>{formatVND(totalNetProfit)}</div>
        </div>
        <div className="rounded-xl border border-line bg-white p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Ngày lãi / lỗ</div>
          <div className="mt-1 text-lg font-bold text-coffee">
            <span className="text-green-600">{profitDays}</span>
            <span className="text-muted mx-1">/</span>
            <span className="text-red-500">{lossDays}</span>
          </div>
        </div>
      </div>

      {/* Default utility warning */}
      {meta?.defaultUtilityUsed && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-amber-700 text-xs">
            <strong>Điện nước mặc định {formatVND(meta.defaultUtilityAmount)}/tháng</strong> — Chưa tìm thấy phiếu chi điện nước tháng {month}/{year}. Tạo phiếu chi loại "Cố định" với mô tả "điện nước" để cập nhật.
          </p>
        </div>
      )}

      {/* Fixed cost info */}
      {meta && (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5 text-xs">
          <Info className="h-4 w-4 text-coffee shrink-0" />
          <span className="text-muted">
            Định phí tháng: <strong className="text-coffee">{formatVND(meta.totalFixedMonth)}</strong> ÷ {meta.daysInMonth} ngày = <strong className="text-red-600">{formatVND(meta.dailyFixedCost)}/ngày</strong>
          </span>
          {meta.fixedBreakdown.length > 0 && (
            <span className="text-muted ml-auto hidden md:inline">
              ({meta.fixedBreakdown.map(b => b.name).join(', ')})
            </span>
          )}
        </div>
      )}

      {viewMode === 'calendar' ? (
        /* ════════════════ CALENDAR HEATMAP ════════════════ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 rounded-2xl border border-line bg-white p-5 shadow-sm">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-muted py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="space-y-1.5">
              {calendarGrid.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1.5">
                  {week.map((day, di) => {
                    if (!day) {
                      return <div key={di} className="aspect-square rounded-lg" />
                    }
                    
                    const dayNum = new Date(day.date).getDate()
                    const isToday = day.date === today
                    const isSelected = selectedDay?.date === day.date
                    const hasActivity = day.revenue > 0 || day.unitsSold > 0
                    
                    return (
                      <button
                        key={di}
                        onClick={() => setSelectedDay(day)}
                        className={`
                          aspect-square rounded-lg border p-1 flex flex-col items-center justify-center gap-0.5
                          transition-all duration-200 cursor-pointer relative group
                          ${getProfitColor(day.netProfit, maxAbsProfit)}
                          ${isToday ? 'ring-2 ring-coffee ring-offset-1' : ''}
                          ${isSelected ? 'ring-2 ring-purple-500 ring-offset-1 scale-105 shadow-md' : 'hover:scale-105 hover:shadow-sm'}
                        `}
                      >
                        <span className={`text-[11px] font-bold ${isToday ? 'text-coffee' : 'text-foreground/70'}`}>
                          {dayNum}
                        </span>
                        {hasActivity ? (
                          <span className={`text-[9px] font-bold leading-none ${day.netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            {day.netProfit >= 0 ? '+' : ''}{(day.netProfit / 1000).toFixed(0)}k
                          </span>
                        ) : (
                          <span className="text-[9px] text-muted leading-none">—</span>
                        )}
                        {day.unitsSold > 0 && (
                          <span className="text-[8px] text-muted leading-none">{day.unitsSold} ly</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-line text-[10px] text-muted">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-200 border border-red-300" />
                <span>Lỗ nhiều</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-50 border border-red-100" />
                <span>Lỗ ít</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-gray-50 border border-gray-100" />
                <span>Hòa vốn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-50 border border-green-100" />
                <span>Lãi ít</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-200 border border-green-300" />
                <span>Lãi nhiều</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-3 h-3 rounded bg-white ring-2 ring-coffee ring-offset-1" />
                <span>Hôm nay</span>
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedDay ? (
              <DayDetailPanel day={selectedDay} meta={meta} onClose={() => setSelectedDay(null)} />
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-surface-alt/30 p-8 flex flex-col items-center justify-center text-center h-full min-h-[280px]">
                <ChevronRight className="h-8 w-8 text-muted/40 mb-3" />
                <p className="text-sm font-semibold text-muted/60">Chọn một ngày trên lịch</p>
                <p className="text-xs text-muted/40 mt-1">để xem chi tiết công thức tính lãi</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ════════════════ CHART VIEW ════════════════ */
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="dateDisplay" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
              <YAxis 
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#737373' }} 
              />
              <RechartsTooltip 
                labelFormatter={(val) => `Ngày ${val}`}
                formatter={(val: number, name: string) => [formatVND(val), name]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="netProfit" name="Lãi ròng" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="cogs" name="COGS (NL×cốc)" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fixedCostPerDay" name="Định phí/ngày" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
