import { useRef, useState, type FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Banner, BannerPayload } from '../../../types'
import { uploadImage } from '../../../api/cms.api'

import { TextField, ImageField, InlineNotice } from './CmsSharedUI'

export function BannerEditorDialog({
  banner,
  existingBanners = [],
  onClose,
  onSave,
}: {
  banner: Banner | null
  existingBanners?: Banner[]
  onClose: () => void
  onSave: (payload: BannerPayload, id?: string) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState(banner?.title || '')
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '')
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl || '')
  const [ctaUrl, setCtaUrl] = useState(banner?.ctaUrl || '/menu')
  const [displayOrder, setDisplayOrder] = useState(banner?.displayOrder || existingBanners.length + 1)
  const [isActive, setIsActive] = useState(banner?.isActive ?? true)
  
  const [startDate, setStartDate] = useState(banner?.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '')
  const [endDate, setEndDate] = useState(banner?.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '')
  
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(file: File) {
    setLoading(true)
    setError(null)
    try {
      const response = await uploadImage(file, 'banners')
      const url = response.data?.secure_url
      if (url) {
        setImageUrl(url)
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload ảnh thất bại')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!imageUrl) {
      setError('Vui lòng upload ảnh cho banner')
      return
    }

    const currentOrder = Number(displayOrder)
    const isDuplicateOrder = existingBanners.some(
      b => b.displayOrder === currentOrder && b.id !== banner?.id
    )

    if (isDuplicateOrder) {
      setError(`Thứ tự hiển thị ${currentOrder} đã tồn tại. Vui lòng chọn thứ tự khác.`)
      return
    }

    setLoading(true)
    setError(null)
    try {
      await onSave(
        {
          title: title.trim(),
          subtitle: subtitle.trim(),
          imageUrl,
          ctaUrl: ctaUrl.trim(),
          displayOrder: Number(displayOrder),
          isActive,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
        },
        banner?.id
      )
      onClose()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Lỗi khi lưu banner')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-coffee/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-[24px] bg-white shadow-hard" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h3 className="text-xl font-bold tracking-tight text-coffee">
            {banner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-muted transition hover:bg-line hover:text-coffee"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <ImageField
              label="Ảnh Banner"
              value={imageUrl}
              onChange={setImageUrl}
              fileRef={fileRef}
              onUpload={handleImageUpload}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                label="Tiêu đề"
                value={title}
                onChange={setTitle}
                placeholder="VD: Khuyến mãi mùa hè"
              />
              <TextField
                label="Mô tả ngắn (Subtitle)"
                value={subtitle}
                onChange={setSubtitle}
                placeholder="VD: Mua 1 tặng 1..."
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                label="Đường dẫn nút (CTA URL)"
                value={ctaUrl}
                onChange={setCtaUrl}
                placeholder="VD: /menu hoặc https://..."
              />
              <div className="space-y-2">
                <label className="block text-sm font-bold text-coffee">Thứ tự hiển thị</label>
                <input
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm font-medium text-coffee outline-none transition focus:border-coffee"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-coffee">Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm font-medium text-coffee outline-none transition focus:border-coffee"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-coffee">Thời gian kết thúc</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm font-medium text-coffee outline-none transition focus:border-coffee"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 rounded border-line text-coffee accent-coffee transition"
              />
              <span className="text-sm font-bold text-coffee">Cho phép hiển thị</span>
            </label>

            {error && <InlineNotice notice={{ type: 'error', message: error }} />}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-line pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-bold text-muted transition hover:bg-cream"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-w-[120px] items-center justify-center rounded-full bg-coffee px-6 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-[#3f2d20] disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Lưu Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
