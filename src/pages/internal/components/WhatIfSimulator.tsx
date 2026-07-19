import { useState } from 'react'
import { Activity, ShieldAlert, Calculator } from 'lucide-react'
import { formatVND } from '@/utils/formatCurrency'

export function WhatIfSimulator() {
  const [params, setParams] = useState({
    avgPrice: 50000,
    unitCost: 20000,
    fixedCost: 327000000,
    expectedUnits: 6000
  })

  // Calculations based on finance-calculation.service pure functions logic
  const revenue = params.avgPrice * params.expectedUnits
  const variableCost = params.unitCost * params.expectedUnits
  const totalCost = params.fixedCost + variableCost
  
  const grossProfit = revenue - variableCost
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0
  
  const netProfit = revenue - totalCost
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

  const contributionMarginPerUnit = params.avgPrice - params.unitCost
  const breakEvenUnits = contributionMarginPerUnit > 0 ? params.fixedCost / contributionMarginPerUnit : Infinity
  
  const contributionMarginRatio = revenue > 0 ? 1 - (variableCost / revenue) : 0
  const breakEvenRevenue = contributionMarginRatio > 0 ? params.fixedCost / contributionMarginRatio : Infinity
  
  const marginOfSafety = isFinite(breakEvenRevenue) ? revenue - breakEvenRevenue : -Infinity
  const marginOfSafetyPercent = revenue > 0 && isFinite(breakEvenRevenue) ? ((revenue - breakEvenRevenue) / revenue) * 100 : 0

  return (
    <div className="flex h-full flex-col overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-coffee/20 [&::-webkit-scrollbar-thumb]:rounded-full pb-10 pr-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-coffee">Mô phỏng Tài chính (What-if)</h1>
        <p className="mt-1 text-sm text-muted">Dự báo điểm hòa vốn và lợi nhuận khi thay đổi các biến số kinh doanh.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form nhập liệu */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="h-5 w-5 text-coffee" />
            <h2 className="text-lg font-bold text-coffee">Tham số giả định</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-coffee">Giá bán TB / sản phẩm (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="1000"
                className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 outline-none transition focus:border-coffee"
                value={params.avgPrice}
                onChange={(e) => setParams({ ...params, avgPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-coffee">Biến phí TB / sản phẩm (VNĐ)</label>
              <p className="text-xs text-muted mb-1">Giá vốn NVL, bao bì, chiết khấu app...</p>
              <input
                type="number"
                min="0"
                step="500"
                className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 outline-none transition focus:border-coffee"
                value={params.unitCost}
                onChange={(e) => setParams({ ...params, unitCost: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-coffee">Tổng Định Phí / Tháng (VNĐ)</label>
              <p className="text-xs text-muted mb-1">Thuê nhà, khấu hao, lương cứng...</p>
              <input
                type="number"
                min="0"
                step="1000000"
                className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 outline-none transition focus:border-coffee text-orange-600 font-semibold"
                value={params.fixedCost}
                onChange={(e) => setParams({ ...params, fixedCost: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-coffee">Dự kiến số lượng bán / Tháng</label>
              <input
                type="number"
                min="0"
                step="100"
                className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 outline-none transition focus:border-coffee text-blue-600 font-semibold"
                value={params.expectedUnits}
                onChange={(e) => setParams({ ...params, expectedUnits: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Kết quả mô phỏng */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lợi nhuận dự kiến */}
          <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="border-b border-line bg-cream/50 p-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-bold text-coffee">Kết quả Kinh doanh Dự kiến</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-bold text-muted uppercase tracking-wider block mb-1">Doanh thu dự kiến</span>
                <span className="text-3xl font-bold text-coffee">{formatVND(revenue)}</span>
              </div>
              <div>
                <span className="text-sm font-bold text-muted uppercase tracking-wider block mb-1">Tổng chi phí</span>
                <span className="text-3xl font-bold text-red-600">{formatVND(totalCost)}</span>
              </div>
              <div>
                <span className="text-sm font-bold text-muted uppercase tracking-wider block mb-1">Lợi nhuận gộp</span>
                <span className="text-2xl font-bold text-coffee">{formatVND(grossProfit)}</span>
                <span className="text-sm font-bold text-blue-600 ml-2">({grossMargin.toFixed(1)}%)</span>
              </div>
              <div>
                <span className="text-sm font-bold text-muted uppercase tracking-wider block mb-1">Lợi nhuận ròng</span>
                <span className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatVND(netProfit)}
                </span>
                <span className={`text-sm font-bold ml-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({netMargin.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Điểm hòa vốn */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden flex flex-col ${
            netProfit >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <div className="border-b border-line p-4 flex items-center gap-2">
              <ShieldAlert className={`h-5 w-5 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <h2 className="text-lg font-bold text-coffee">Phân tích Hòa Vốn & Rủi ro</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-bold text-muted uppercase tracking-wider block mb-1">BEP Số lượng</span>
                <span className="text-2xl font-bold text-coffee">
                  {isFinite(breakEvenUnits) ? Math.ceil(breakEvenUnits).toLocaleString('vi-VN') + ' ly/sản phẩm' : 'Không thể hòa vốn'}
                </span>
                <p className="text-xs text-muted mt-1">~ {Math.ceil(breakEvenUnits / 30)} ly / ngày</p>
              </div>
              <div>
                <span className="text-sm font-bold text-muted uppercase tracking-wider block mb-1">BEP Doanh thu</span>
                <span className="text-2xl font-bold text-coffee">
                  {isFinite(breakEvenRevenue) ? formatVND(breakEvenRevenue) : 'Không thể hòa vốn'}
                </span>
              </div>
              <div>
                <span className="text-sm font-bold text-muted uppercase tracking-wider block mb-1">Biên an toàn (VND)</span>
                <span className={`text-2xl font-bold ${marginOfSafety >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {isFinite(marginOfSafety) ? formatVND(marginOfSafety) : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-sm font-bold text-muted uppercase tracking-wider block mb-1">Biên an toàn (%)</span>
                <span className={`text-2xl font-bold ${marginOfSafetyPercent >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {marginOfSafetyPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
