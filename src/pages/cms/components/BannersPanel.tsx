import { useCallback, useEffect, useState } from 'react'
import { Plus, Search, Edit3, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { listBanners, deleteBanner, createBanner, updateBanner } from '../../../api/cms.api'
import type { Banner, BannerPayload } from '../../../types'
import { Card } from '../../../components/ui/Card'
import { Pagination } from '../../../components/ui/Pagination'
import { formatVnDate } from '../../../utils/date'

import type { NoticeState } from './cms.types'
import { normalizeList } from './cms.utils'
import { StateShell, InlineNotice, StatusPill } from './CmsSharedUI'
import { BannerEditorDialog } from './BannerEditorDialog'

export function BannersPanel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchBanners = useCallback(async (currentPage: number, currentSearch: string, currentStatus: string) => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { page: currentPage, limit: 10 }
      if (currentSearch.trim()) params.search = currentSearch.trim()
      if (currentStatus !== 'all') params.status = currentStatus
      const response = await listBanners()
      
      const paginated = response.data as any
      if (paginated && typeof paginated === 'object' && 'items' in paginated) {
        setBanners(paginated.items)
        const pag = paginated.pagination
        setTotalPages(pag.totalPages)
        setTotal(pag.total)
      } else {
        const list = normalizeList<Banner>(response.data)
        setBanners(list)
        setTotalPages(1)
        setTotal(list.length)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Lỗi tải danh sách Banner')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    void fetchBanners(page, debouncedSearch, statusFilter)
  }, [page, debouncedSearch, statusFilter, fetchBanners])

  function startCreate() {
    setEditingBanner(null)
    setEditorOpen(true)
  }

  function startEdit(banner: Banner) {
    setEditingBanner(banner)
    setEditorOpen(true)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Bạn có chắc muốn xoá banner này không?')) return
    try {
      await deleteBanner(id)
      setNotice({ type: 'success', message: 'Đã xoá banner thành công' })
      void fetchBanners(page, debouncedSearch, statusFilter)
    } catch (deleteError) {
      setNotice({ type: 'error', message: deleteError instanceof Error ? deleteError.message : 'Xoá banner thất bại' })
    }
  }

  async function handleSave(payload: BannerPayload, id?: string) {
    const response = id ? await updateBanner(id, payload) : await createBanner(payload)
    const saved = response.data
    if (saved) {
      void fetchBanners(page, debouncedSearch, statusFilter)
    }
  }

  async function handleSwapOrder(banner1: Banner, banner2: Banner) {
    if (!banner1 || !banner2) return
    try {
      setLoading(true)
      await updateBanner(banner1.id, {
        title: banner1.title ?? undefined,
        subtitle: banner1.subtitle ?? undefined,
        imageUrl: banner1.imageUrl,
        ctaUrl: banner1.ctaUrl ?? undefined,
        displayOrder: banner2.displayOrder,
        isActive: banner1.isActive,
        startDate: banner1.startDate,
        endDate: banner1.endDate,
      })
      await updateBanner(banner2.id, {
        title: banner2.title ?? undefined,
        subtitle: banner2.subtitle ?? undefined,
        imageUrl: banner2.imageUrl,
        ctaUrl: banner2.ctaUrl ?? undefined,
        displayOrder: banner1.displayOrder,
        isActive: banner2.isActive,
        startDate: banner2.startDate,
        endDate: banner2.endDate,
      })
      void fetchBanners(page, debouncedSearch, statusFilter)
    } catch (swapError) {
      setNotice({ type: 'error', message: 'Lỗi khi đổi thứ tự banner' })
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-4 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Tìm kiếm banner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-full border border-line bg-cream pl-9 pr-4 text-[13px] font-medium text-coffee placeholder-muted outline-none transition focus:border-coffee sm:w-[260px]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-10 rounded-full border border-line bg-white px-4 text-[13px] font-medium text-coffee outline-none transition focus:border-coffee"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hiển thị</option>
              <option value="inactive">Đã ẩn</option>
            </select>
          </div>
          <button
            onClick={startCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-coffee px-5 text-[13px] font-bold text-white shadow-soft transition hover:bg-[#3f2d20]"
          >
            <Plus className="h-4 w-4" />
            Tạo Banner
          </button>
        </div>

        <StateShell loading={loading} error={error} empty={banners.length === 0 && !loading} title="Chưa có banner nào" description="Bạn có thể thêm banner mới để hiển thị trên Landing Page" />

        {!loading && !error && banners.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-cream/50 text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3">Ảnh</th>
                  <th className="px-5 py-3">Thông tin</th>
                  <th className="px-5 py-3">Hiển thị</th>
                  <th className="px-5 py-3">Ngày bắt đầu / kết thúc</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-medium text-coffee">
                {banners.map((banner) => (
                  <tr key={banner.id} className="transition hover:bg-cream/30">
                    <td className="px-5 py-4">
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} alt="Banner" className="h-12 w-20 rounded-md object-cover" />
                      ) : (
                        <div className="flex h-12 w-20 items-center justify-center rounded-md bg-cream text-muted">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold line-clamp-1">{banner.title || 'Không có tiêu đề'}</div>
                      <div className="text-muted line-clamp-1">{banner.subtitle || 'Chỉ hiển thị ảnh'}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                        Thứ tự: <strong className="text-coffee">{banner.displayOrder}</strong>
                        <div className="flex -space-x-px rounded-md border border-line">
                          <button
                            type="button"
                            className="flex h-5 w-5 items-center justify-center rounded-l-md bg-white text-coffee transition hover:bg-cream"
                            onClick={() => {
                              const sorted = [...banners].sort((a, b) => a.displayOrder - b.displayOrder)
                              const idx = sorted.findIndex(b => b.id === banner.id)
                              if (idx > 0) handleSwapOrder(banner, sorted[idx - 1])
                            }}
                            title="Tăng thứ tự (lên trên)"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            className="flex h-5 w-5 items-center justify-center rounded-r-md bg-white text-coffee transition hover:bg-cream"
                            onClick={() => {
                              const sorted = [...banners].sort((a, b) => a.displayOrder - b.displayOrder)
                              const idx = sorted.findIndex(b => b.id === banner.id)
                              if (idx < sorted.length - 1) handleSwapOrder(banner, sorted[idx + 1])
                            }}
                            title="Giảm thứ tự (xuống dưới)"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill active={banner.isActive} />
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {banner.startDate && banner.endDate 
                        ? `${formatVnDate(banner.startDate)} - ${formatVnDate(banner.endDate)}` 
                        : 'Không giới hạn'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="Sửa"
                          onClick={() => startEdit(banner)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-coffee transition hover:bg-line hover:text-coffee"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          title="Xoá"
                          onClick={() => handleDelete(banner.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="border-t border-line p-4">
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} label="banners" />
          </div>
        )}
      </Card>

      {notice && <InlineNotice notice={notice} />}

      {editorOpen && (
        <BannerEditorDialog
          banner={editingBanner}
          existingBanners={banners}
          onClose={() => setEditorOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
