import { useState, useEffect } from 'react'
import { getDailyProfit, type DailyProfitData } from '@/api/expense.api'
import { formatVND } from '@/utils/formatCurrency'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'

interface DailyProfitViewProps {
  branchId: string
  month: number
  year: number
}

export function DailyProfitView({ branchId, month, year }: DailyProfitViewProps) {
  const [data, setData] = useState<DailyProfitData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!branchId) return
    const fetchDaily = async () => {
      setLoading(true)
      try {
        const startDate = new Date(year, month - 1, 1).toISOString()
        const endDate = new Date(year, month, 0).toISOString()
        const res = await getDailyProfit(branchId, startDate, endDate)
        setData(res)
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu lợi nhuận ngày', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDaily()
  }, [branchId, month, year])

  if (loading) {
    return <div className="text-center py-8 text-muted">Đang tải dữ liệu lợi nhuận theo ngày...</div>
  }

  if (data.length === 0) {
    return null
  }

  const totalNetProfit = data.reduce((sum, d) => sum + d.netProfit, 0)
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalCOGS = data.reduce((sum, d) => sum + d.variableCost, 0)

  // Chart data formatting
  const chartData = data.map(d => ({
    ...d,
    dateDisplay: new Date(d.date).getDate().toString()
  }))

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <h2 className="text-xl font-bold text-coffee">Lợi nhuận theo ngày</h2>
        <div className="flex gap-4 mt-2 md:mt-0 text-sm">
          <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium border border-green-100">
            Tổng Lãi ròng: {formatVND(totalNetProfit)}
          </div>
          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100">
            Tổng COGS: {formatVND(totalCOGS)}
          </div>
        </div>
      </div>

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
              formatter={(val: number) => formatVND(val)}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
            <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="netProfit" name="Lợi nhuận ròng" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="variableCost" name="COGS (Giá vốn)" stroke="#f97316" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fixedCost" name="Chi phí CĐ/ngày" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="bg-surface-alt font-medium text-muted">
            <tr>
              <th className="px-4 py-3">Ngày</th>
              <th className="px-4 py-3 text-right">Doanh thu</th>
              <th className="px-4 py-3 text-right">Giá vốn (COGS)</th>
              <th className="px-4 py-3 text-right">Chi phí Cố định</th>
              <th className="px-4 py-3 text-right">Lợi nhuận ròng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.map((d) => (
              <tr key={d.date} className="hover:bg-surface-alt/50 transition-colors">
                <td className="px-4 py-3 font-medium">{new Date(d.date).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-right text-green-600">{formatVND(d.revenue)}</td>
                <td className="px-4 py-3 text-right text-orange-600">{formatVND(d.variableCost)}</td>
                <td className="px-4 py-3 text-right text-red-600">{formatVND(d.fixedCost)}</td>
                <td className={`px-4 py-3 text-right font-bold ${d.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatVND(d.netProfit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
