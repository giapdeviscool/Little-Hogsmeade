import { Card } from '../../ui/Card'
import type { ChainConfig, MenuSyncPreview } from '../../../types'
import { NumberField, TextField } from './OwnerFields'
import { SimpleList } from './OwnerCharts'
import { formatCurrency } from '../../../utils/owner.utils'

export function SyncPanel({ config, preview, saving, onSaveConfig, onSync }: { config: ChainConfig | null; preview: MenuSyncPreview; saving: boolean; onSaveConfig: (config: Partial<ChainConfig>) => void; onSync: () => void }) {
  return (
    <section className="grid grid-cols-[360px_1fr] gap-5">
      <Card className="p-5">
        <h2 className="text-base font-semibold">Cấu hình chuỗi</h2>
        <div className="mt-4 space-y-4">
          <NumberField label="Tỷ lệ tích điểm" value={config?.loyaltyEarnRate ?? 1} onChange={(value) => onSaveConfig({ loyaltyEarnRate: value })} />
          <TextField label="Tiền tệ mặc định" value={config?.defaultCurrency ?? 'VND'} onChange={(value) => onSaveConfig({ defaultCurrency: value })} />
          <label className="flex items-center gap-2 text-sm text-muted">
            <input checked={config?.globalPricingEnabled ?? true} type="checkbox" onChange={(event) => onSaveConfig({ globalPricingEnabled: event.target.checked })} />
            Bật chính sách giá toàn chuỗi
          </label>
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Menu Sync</h2>
            <p className="mt-1 text-sm text-muted">{preview.categories.length} danh mục chuẩn · {preview.menuItems.length} món chuẩn</p>
          </div>
          <button className="h-9 rounded-lg bg-coffee px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={saving} onClick={onSync}>Đồng bộ menu</button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <SimpleList title="Danh mục chuẩn" items={preview.categories.map((category) => category.name)} />
          <SimpleList title="Món chuẩn" items={preview.menuItems.map((item) => `${item.name} · ${formatCurrency(item.basePrice)}`)} />
        </div>
      </Card>
    </section>
  )
}
