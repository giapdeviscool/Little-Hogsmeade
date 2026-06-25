import { useEffect, useRef, useState } from 'react'
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react'
import { listPages, createPage, updatePage, deletePage, uploadImage } from '../../../api/cms.api'
import { getMenuItems } from '../../../api/menu-item.api'
import type { CmsPage, MenuItem } from '../../../types'
import { Card } from '../../../components/ui/Card'
import { useLocale } from '../../../hooks/useLocale'
import type { NoticeState, FeaturedMenuBlock, FeaturedMenuItem } from './cms.types'
import { landingPageSlugs, defaultFeaturedMenuBlock } from './cms.constants'
import { getPageBySlug, safeParse } from './cms.utils'
import {
  InlineNotice,
  SectionHeading,
  TextField,
  TextAreaField,
  NumberField,
  ImageField,
  PageSyncMeta,
} from './CmsSharedUI'

export function FeaturedMenuEditor() {
  const { t } = useLocale()
  const [pages, setPages] = useState<CmsPage[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<FeaturedMenuBlock>(defaultFeaturedMenuBlock)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let alive = true

    async function load() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const [pageResponse, menuResponse] = await Promise.all([
          listPages(),
          getMenuItems({ isActive: true }),
        ])
        if (!alive) return

        const normalizedPages = Array.isArray(pageResponse.data) ? pageResponse.data : []
        setPages(normalizedPages)

        const menuData = menuResponse?.data
        const normalizedMenuItems: MenuItem[] = Array.isArray(menuData)
          ? menuData
          : menuData?.items
            ? menuData.items
            : []
        setMenuItems(normalizedMenuItems)

        const existingPage = getPageBySlug(normalizedPages, landingPageSlugs.featuredMenu)
        if (existingPage?.content) {
          const parsed = safeParse<FeaturedMenuBlock>(existingPage.content, defaultFeaturedMenuBlock)
          setDraft(parsed)
        }
      } catch (err) {
        if (!alive) return
        setLoadError(err instanceof Error ? err.message : t.cms.shared.loadError)
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    void load()
    return () => { alive = false }
  }, [])

  const featuredPage = getPageBySlug(pages, landingPageSlugs.featuredMenu)

  async function handleSave() {
    setSaving(true)
    setNotice(null)
    try {
      const payload = {
        slug: landingPageSlugs.featuredMenu,
        title: draft.title,
        content: JSON.stringify(draft),
        isPublished: true,
      }
      const response = featuredPage
        ? await updatePage(featuredPage.id, payload)
        : await createPage(payload)
      const saved = response.data
      if (saved) {
        setPages((current) => {
          const without = current.filter((p) => p.id !== saved.id)
          return [...without, saved]
        })
      }
      setNotice({ type: 'success', message: t.cms.landing.saveSuccessFeaturedMenu })
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof Error ? err.message : t.common.saveError })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(t.cms.landing.confirmDeleteBlock)) return
    if (!featuredPage) {
      setDraft(defaultFeaturedMenuBlock)
      return
    }
    setSaving(true)
    setNotice(null)
    try {
      await deletePage(featuredPage.id)
      setPages((current) => current.filter((p) => p.id !== featuredPage.id))
      setDraft(defaultFeaturedMenuBlock)
      setNotice({ type: 'success', message: t.cms.landing.deleteSuccessBlock })
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof Error ? err.message : t.common.deleteError })
    } finally {
      setSaving(false)
    }
  }

  function addItemFromMenu(menuItem: MenuItem) {
    const newItem: FeaturedMenuItem = {
      name: menuItem.name,
      description: menuItem.description ?? '',
      price: menuItem.basePrice,
      imageUrl: menuItem.imageUrl ?? '',
      badge: 'Nổi bật',
    }
    setDraft((current) => ({
      ...current,
      items: [...current.items, newItem],
    }))
  }

  function removeItem(index: number) {
    setDraft((current) => ({
      ...current,
      items: current.items.filter((_, i) => i !== index),
    }))
  }

  function updateItem(index: number, field: keyof FeaturedMenuItem, value: string | number) {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const filteredMenuItems = menuItems.filter((item) =>
    [item.name, item.description ?? ''].some((v) =>
      v.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  )

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded bg-beige" />
          <div className="h-12 w-full rounded bg-beige" />
          <div className="h-12 w-full rounded bg-beige" />
        </div>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card className="p-6">
        <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {notice && <InlineNotice notice={notice} />}

      {/* Tham khảo menu items thật */}
      <Card className="p-6">
        <SectionHeading
          title="Danh sách món từ thực đơn"
          description="Chọn món từ thực đơn để thêm vào Món nổi bật"
        />
        <div className="mt-4">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm món..."
            className="h-12 w-full rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMenuItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-[14px] border border-line bg-white p-3 transition hover:bg-cream"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-14 w-14 flex-shrink-0 rounded-[10px] object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[10px] bg-beige text-xs text-muted">
                  No img
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-coffee">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.basePrice.toLocaleString('vi-VN')}₫
                </p>
              </div>
              <button
                type="button"
                onClick={() => addItemFromMenu(item)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-coffee text-white transition hover:bg-coffee/90"
                title="Thêm vào món nổi bật"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
          {filteredMenuItems.length === 0 && (
            <p className="col-span-full py-4 text-center text-sm text-muted">
              {searchQuery ? 'Không tìm thấy món phù hợp.' : 'Đang tải danh sách món...'}
            </p>
          )}
        </div>
      </Card>

      {/* Editor menu nổi bật */}
      <Card className="p-6">
        <SectionHeading
          title={t.cms.landing.featuredMenu}
          description={t.cms.landing.featuredMenuDesc}
        />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <TextField
            label="Tiêu đề"
            value={draft.title}
            onChange={(val) => setDraft((d) => ({ ...d, title: val }))}
          />
          <TextField
            label="Mô tả"
            value={draft.description}
            onChange={(val) => setDraft((d) => ({ ...d, description: val }))}
          />
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-coffee">
              Danh sách món nổi bật ({draft.items.length})
            </p>
            <button
              type="button"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  items: [
                    ...d.items,
                    { name: '', description: '', price: 0, imageUrl: '', badge: '' },
                  ],
                }))
              }
              className="inline-flex items-center gap-2 rounded-full bg-coffee px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.cms.landing.addItem}
            </button>
          </div>

          {draft.items.map((item, index) => (
            <div
              key={index}
              className="rounded-[16px] border border-line bg-cream p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted" />
                  <span className="text-xs font-semibold text-muted">
                    #{index + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <TextField
                  label={t.cms.landing.itemName}
                  value={item.name}
                  onChange={(val) => updateItem(index, 'name', val)}
                />
                <NumberField
                  label={t.cms.landing.itemPrice}
                  value={item.price}
                  onChange={(val) => updateItem(index, 'price', val)}
                />
                <TextField
                  label={t.cms.landing.itemBadge}
                  value={item.badge ?? ''}
                  onChange={(val) => updateItem(index, 'badge', val)}
                />
              </div>
              <div className="mt-3">
                <TextAreaField
                  label={t.cms.landing.itemDescription}
                  value={item.description}
                  onChange={(val) => updateItem(index, 'description', val)}
                  rows={2}
                />
              </div>
              <div className="mt-3">
                <ImageField
                  label={t.cms.landing.itemImage}
                  value={item.imageUrl}
                  onChange={(val) => updateItem(index, 'imageUrl', val)}
                  onUpload={async (file) => {
                    setSaving(true)
                    try {
                      const response = await uploadImage(file, 'landing/featured-menu')
                      const imageUrl = response.data?.secure_url
                      if (imageUrl) {
                        updateItem(index, 'imageUrl', imageUrl)
                      }
                    } catch {
                      // silent
                    } finally {
                      setSaving(false)
                    }
                  }}
                  fileRef={fileInputRef}
                />
              </div>
            </div>
          ))}

          {draft.items.length === 0 && (
            <div className="rounded-[16px] border border-dashed border-latte bg-cream px-4 py-8 text-center text-sm text-muted">
              Chưa có món nào. Thêm món từ thực đơn bên trên hoặc nhập tay.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-red-700 disabled:opacity-70"
          >
            {t.cms.landing.deleteBlock}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t.cms.landing.saveFeaturedMenu}
          </button>
        </div>
        {featuredPage && <PageSyncMeta page={featuredPage} />}
      </Card>
    </div>
  )
}