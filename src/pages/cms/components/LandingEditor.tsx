import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Plus, Edit3, Trash2, ChevronUp, ChevronDown, Loader2 } from 'lucide-react'
import {
  listBanners,
  listPages,
  createPage,
  updatePage,
  deletePage,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadImage,
} from '../../../api/cms.api'
import type { Banner, CmsPage, CmsPagePayload } from '../../../types'
import { Card } from '../../../components/ui/Card'
import { formatVnDateTime } from '../../../utils/date'
import type { BannerDraft, ContactBlock, OpeningHoursBlock, FeaturedMenuBlock, NoticeState } from './cms.types'
import {
  landingPageSlugs,
  defaultBannerDraft,
  defaultLandingPageDraft,
  defaultContactBlock,
  defaultOpeningHoursBlock,
  defaultFeaturedMenuBlock,
} from './cms.constants'
import { normalizeList, getPageBySlug, hydrateLandingBlocks } from './cms.utils'
import {
  StateShell,
  InlineNotice,
  SectionHeading,
  TextField,
  ImageField,
  NumberField,
  TextAreaField,
  ToggleField,
  PageSyncMeta,
  EmptyPanel,
  StatusPill,
} from './CmsSharedUI'

export function LandingEditor() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [pages, setPages] = useState<CmsPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [saving, setSaving] = useState(false)
  const [bannerDraft, setBannerDraft] = useState<BannerDraft>(defaultBannerDraft)
  const [landingPageDraft, setLandingPageDraft] = useState<CmsPagePayload>(defaultLandingPageDraft)
  const [contactDraft, setContactDraft] = useState<ContactBlock>(defaultContactBlock)
  const [openingHoursDraft, setOpeningHoursDraft] = useState<OpeningHoursBlock>(defaultOpeningHoursBlock)
  const [featuredMenuDraft, setFeaturedMenuDraft] = useState<FeaturedMenuBlock>(defaultFeaturedMenuBlock)
  const bannerFileRef = useRef<HTMLInputElement>(null)
  const landingPageFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let alive = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [bannerResponse, pageResponse] = await Promise.all([listBanners(), listPages()])
        if (!alive) return

        const sortedBanners = normalizeList<Banner>(bannerResponse.data).sort((a, b) => a.sortOrder - b.sortOrder)
        setBanners(sortedBanners)
        setPages(normalizeList<CmsPage>(pageResponse.data))
        hydrateLandingBlocks(pageResponse.data, sortedBanners, setContactDraft, setOpeningHoursDraft, setFeaturedMenuDraft, setLandingPageDraft)
      } catch (loadError) {
        if (!alive) return
        setError(loadError instanceof Error ? loadError.message : 'Không tải được dữ liệu Landing Page.')
      } finally {
        if (alive) setLoading(false)
      }
    }

    void load()

    return () => {
      alive = false
    }
  }, [])

  const contactPage = getPageBySlug(pages, landingPageSlugs.contact)
  const openingHoursPage = getPageBySlug(pages, landingPageSlugs.openingHours)
  const featuredMenuPage = getPageBySlug(pages, landingPageSlugs.featuredMenu)

  async function persistPage(slug: string, title: string, content: string, isPublished: boolean) {
    const existing = getPageBySlug(pages, slug)
    const payload = { slug, title, content, isPublished }
    const response = existing ? await updatePage(existing.id, payload) : await createPage(payload)
    const saved = response.data
    setPages((current) => {
      const withoutCurrent = current.filter((page) => page.id !== saved.id)
      return [...withoutCurrent, saved]
    })
    return saved
  }

  async function handleBannerSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      const payload = {
        title: bannerDraft.title.trim(),
        description: bannerDraft.description.trim(),
        imageUrl: bannerDraft.imageUrl.trim(),
        ctaLabel: bannerDraft.ctaLabel.trim(),
        ctaHref: bannerDraft.ctaHref.trim(),
        sortOrder: bannerDraft.sortOrder,
        isActive: bannerDraft.isActive,
      }

      if (bannerDraft.id) {
        const response = await updateBanner(bannerDraft.id, payload)
        setBanners((current) => current.map((item) => (item.id === response.data.id ? response.data : item)).sort((a, b) => a.sortOrder - b.sortOrder))
      } else {
        const response = await createBanner(payload)
        setBanners((current) => [...current, response.data].sort((a, b) => a.sortOrder - b.sortOrder))
      }
      setNotice({ type: 'success', message: 'Đã lưu banner Landing Page.' })
      setBannerDraft((current) => ({ ...defaultBannerDraft, sortOrder: current.sortOrder + 1 }))
    } catch (saveError) {
      setNotice({ type: 'error', message: saveError instanceof Error ? saveError.message : 'Không lưu được banner.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleUpload(file: File) {
    setSaving(true)
    setNotice(null)
    try {
      const response = await uploadImage(file, 'landing/banner')
      setBannerDraft((current) => ({ ...current, imageUrl: response.data.secure_url }))
      setNotice({ type: 'success', message: 'Ảnh đã tải lên thành công.' })
    } catch (uploadError) {
      setNotice({ type: 'error', message: uploadError instanceof Error ? uploadError.message : 'Không tải được ảnh.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteBanner(id: string) {
    if (!window.confirm('Xóa banner này? Hành động không thể hoàn tác.')) return
    setSaving(true)
    setNotice(null)
    try {
      await deleteBanner(id)
      setBanners((current) => current.filter((item) => item.id !== id))
      setNotice({ type: 'success', message: 'Đã xóa banner.' })
      if (bannerDraft.id === id) {
        setBannerDraft(defaultBannerDraft)
      }
    } catch (deleteError) {
      setNotice({ type: 'error', message: deleteError instanceof Error ? deleteError.message : 'Không xóa được banner.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleMoveBanner(id: string, direction: 'up' | 'down') {
    const index = banners.findIndex((item) => item.id === id)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || targetIndex < 0 || targetIndex >= banners.length) return

    const currentItem = banners[index]
    const targetItem = banners[targetIndex]
    const nextBanners = [...banners]
    nextBanners[index] = { ...currentItem, sortOrder: targetItem.sortOrder }
    nextBanners[targetIndex] = { ...targetItem, sortOrder: currentItem.sortOrder }
    setBanners(nextBanners.sort((a, b) => a.sortOrder - b.sortOrder))

    try {
      await Promise.all([
        updateBanner(currentItem.id, {
          title: currentItem.title,
          description: currentItem.description ?? '',
          imageUrl: currentItem.imageUrl,
          ctaLabel: currentItem.ctaLabel ?? '',
          ctaHref: currentItem.ctaHref ?? '',
          sortOrder: targetItem.sortOrder,
          isActive: currentItem.isActive,
        }),
        updateBanner(targetItem.id, {
          title: targetItem.title,
          description: targetItem.description ?? '',
          imageUrl: targetItem.imageUrl,
          ctaLabel: targetItem.ctaLabel ?? '',
          ctaHref: targetItem.ctaHref ?? '',
          sortOrder: currentItem.sortOrder,
          isActive: targetItem.isActive,
        }),
      ])
      setNotice({ type: 'success', message: 'Đã thay đổi thứ tự banner.' })
    } catch (reorderError) {
      setNotice({ type: 'error', message: reorderError instanceof Error ? reorderError.message : 'Không đổi được thứ tự.' })
    }
  }

  async function handlePageSave(
    block: 'contact' | 'opening-hours' | 'featured-menu',
    draft: ContactBlock | OpeningHoursBlock | FeaturedMenuBlock,
    title: string,
  ) {
    setSaving(true)
    setNotice(null)
    try {
      const saved = await persistPage(block === 'contact' ? landingPageSlugs.contact : block === 'opening-hours' ? landingPageSlugs.openingHours : landingPageSlugs.featuredMenu, title, JSON.stringify(draft), true)
      setPages((current) => {
        const withoutCurrent = current.filter((page) => page.id !== saved.id)
        return [...withoutCurrent, saved]
      })
      setNotice({ type: 'success', message: 'Đã lưu nội dung Landing Page.' })
    } catch (pageError) {
      setNotice({ type: 'error', message: pageError instanceof Error ? pageError.message : 'Không lưu được nội dung.' })
    } finally {
      setSaving(false)
    }
  }

  async function handlePageDelete(slug: string, resetDraft: () => void) {
    const existing = getPageBySlug(pages, slug)
    if (!window.confirm('Xóa dữ liệu block này?')) return
    if (!existing) {
      resetDraft()
      return
    }

    setSaving(true)
    setNotice(null)
    try {
      await deletePage(existing.id)
      setPages((current) => current.filter((page) => page.id !== existing.id))
      resetDraft()
      setNotice({ type: 'success', message: 'Đã xóa block Landing Page.' })
    } catch (deleteError) {
      setNotice({ type: 'error', message: deleteError instanceof Error ? deleteError.message : 'Không xóa được block.' })
    } finally {
      setSaving(false)
    }
  }

  function startEditBanner(item: Banner) {
    setBannerDraft({
      id: item.id,
      title: item.title,
      description: item.description ?? '',
      imageUrl: item.imageUrl,
      ctaLabel: item.ctaLabel ?? '',
      ctaHref: item.ctaHref ?? '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    })
  }

  function resetBannerDraft() {
    setBannerDraft({ ...defaultBannerDraft, sortOrder: banners.length + 1 })
  }

  async function handleLandingPageSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      const existing = getPageBySlug(pages, landingPageSlugs.landingPage)
      const response = existing ? await updatePage(existing.id, landingPageDraft) : await createPage(landingPageDraft)
      const saved = response.data
      setPages((current) => {
        const withoutCurrent = current.filter((page) => page.id !== saved.id)
        return [...withoutCurrent, saved]
      })
      setNotice({ type: 'success', message: 'Đã lưu Hero & Giới thiệu.' })
    } catch (saveError) {
      setNotice({ type: 'error', message: saveError instanceof Error ? saveError.message : 'Không lưu được nội dung.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleLandingPageUpload(file: File) {
    setSaving(true)
    setNotice(null)
    try {
      const response = await uploadImage(file, 'landing/hero')
      setLandingPageDraft((current) => ({ ...current, imageUrl: response.data.secure_url }))
      setNotice({ type: 'success', message: 'Ảnh hero đã tải lên thành công.' })
    } catch (uploadError) {
      setNotice({ type: 'error', message: uploadError instanceof Error ? uploadError.message : 'Không tải được ảnh.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <StateShell loading={loading} error={error} empty={banners.length === 0 && !loading} title="Landing Page" description="Chưa có dữ liệu banner." onRetry={() => window.location.reload()} />

      {notice && <InlineNotice notice={notice} />}

      <Card className="p-6">
        <SectionHeading title="Hero Banner & Giới thiệu" description="Cấu hình nội dung chính cho trang Landing Page." />
        <form className="mt-6 grid gap-4" onSubmit={handleLandingPageSave}>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField label="Hero Title" value={landingPageDraft.title} onChange={(val) => setLandingPageDraft(d => ({ ...d, title: val }))} />
            <TextField label="Hero Subtitle" value={landingPageDraft.content} onChange={(val) => setLandingPageDraft(d => ({ ...d, content: val }))} />
          </div>
          <ImageField label="Hero Image (Để trống để dùng Default Hero của source code)" value={landingPageDraft.imageUrl ?? ''} onChange={(val) => setLandingPageDraft(d => ({ ...d, imageUrl: val }))} onUpload={handleLandingPageUpload} fileRef={landingPageFileRef} />

          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-gold">Về chúng tôi (Story)</p>
            <div className="grid gap-4 lg:grid-cols-2">
              <TextField label="Tiêu đề Story" value={landingPageDraft.aboutTitle ?? ''} onChange={(val) => setLandingPageDraft(d => ({ ...d, aboutTitle: val }))} />
              <NumberField label="Số năm kinh nghiệm" value={landingPageDraft.yearsOfExperience ?? 0} onChange={(val) => setLandingPageDraft(d => ({ ...d, yearsOfExperience: val }))} />
            </div>
            <div className="mt-4">
              <TextAreaField label="Nội dung Story" value={landingPageDraft.aboutContent ?? ''} onChange={(val) => setLandingPageDraft(d => ({ ...d, aboutContent: val }))} rows={4} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="mt-2 inline-flex items-center gap-2 justify-center rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Lưu thay đổi Landing Page
          </button>
          <PageSyncMeta page={getPageBySlug(pages, landingPageSlugs.landingPage) ?? { slug: 'landing-page', title: '', content: '', isPublished: true, id: '' } as CmsPage} />
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Banner</p>
            <h2 className="mt-1 text-[24px] font-bold">Quản lý banner Landing Page</h2>
          </div>
          <button
            type="button"
            onClick={resetBannerDraft}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-coffee transition hover:bg-cream"
          >
            <Plus className="h-4 w-4" />
            Thêm banner
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          {banners.length === 0 ? (
            <EmptyPanel title="Chưa có banner" description="Tạo banner đầu tiên để khách nhìn thấy hero section trên trang chủ." />
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="grid gap-4 rounded-[20px] border border-line bg-cream p-4 lg:grid-cols-[180px_1fr]">
                <div className="overflow-hidden rounded-[16px] bg-beige">
                  <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[18px] font-semibold">{banner.title}</h3>
                        <StatusPill active={banner.isActive} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted">{banner.description}</p>
                      <p className="mt-2 text-xs text-muted">
                        Thứ tự hiển thị: {banner.sortOrder} · Cập nhật: {formatVnDateTime(banner.updatedAt ?? banner.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleMoveBanner(banner.id, 'up')} className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-coffee">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleMoveBanner(banner.id, 'down')} className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-coffee">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => startEditBanner(banner)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-coffee">
                        <Edit3 className="h-4 w-4" />
                        Sửa
                      </button>
                      <button type="button" onClick={() => handleDeleteBanner(banner.id)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-red-700">
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted">
                    <span className="rounded-full bg-white px-3 py-1">CTA: {banner.ctaLabel || 'Không có'}</span>
                    <span className="rounded-full bg-white px-3 py-1">Link: {banner.ctaHref || 'Không có'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Banner form</p>
            <h2 className="mt-1 text-[24px] font-bold">{bannerDraft.id ? 'Cập nhật banner' : 'Tạo banner mới'}</h2>
          </div>
          <span className="text-xs text-muted">Ảnh upload qua field `image`</span>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleBannerSave}>
          <TextField label="Tiêu đề" value={bannerDraft.title} onChange={(value) => setBannerDraft((current) => ({ ...current, title: value }))} required />
          <TextAreaField label="Mô tả" value={bannerDraft.description} onChange={(value) => setBannerDraft((current) => ({ ...current, description: value }))} rows={4} />
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField label="Nhãn CTA" value={bannerDraft.ctaLabel} onChange={(value) => setBannerDraft((current) => ({ ...current, ctaLabel: value }))} />
            <TextField label="CTA link" value={bannerDraft.ctaHref} onChange={(value) => setBannerDraft((current) => ({ ...current, ctaHref: value }))} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <NumberField label="Thứ tự" value={bannerDraft.sortOrder} onChange={(value) => setBannerDraft((current) => ({ ...current, sortOrder: value }))} />
            <ToggleField label="Đang hiển thị" checked={bannerDraft.isActive} onChange={(checked) => setBannerDraft((current) => ({ ...current, isActive: checked }))} />
          </div>
          <ImageField
            label="Ảnh banner"
            value={bannerDraft.imageUrl}
            onChange={(value) => setBannerDraft((current) => ({ ...current, imageUrl: value }))}
            onUpload={handleUpload}
            fileRef={bannerFileRef}
          />
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {bannerDraft.id ? 'Lưu thay đổi' : 'Lưu banner'}
            </button>
            <button type="button" onClick={resetBannerDraft} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee">
              Làm mới
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <SectionHeading title="Thông tin liên hệ" description="Được dùng cho footer và khối contact trên Landing Page." />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <TextField label="Số điện thoại" value={contactDraft.phone} onChange={(value) => setContactDraft((current) => ({ ...current, phone: value }))} />
          <TextField label="Email" value={contactDraft.email} onChange={(value) => setContactDraft((current) => ({ ...current, email: value }))} />
          <TextField label="Địa chỉ" value={contactDraft.address} onChange={(value) => setContactDraft((current) => ({ ...current, address: value }))} className="lg:col-span-2" />
          <TextField label="Map link" value={contactDraft.mapLink} onChange={(value) => setContactDraft((current) => ({ ...current, mapLink: value }))} className="lg:col-span-2" />
          <TextField label="Social links" value={contactDraft.socials.join(', ')} onChange={(value) => setContactDraft((current) => ({ ...current, socials: value.split(',').map((item) => item.trim()).filter(Boolean) }))} className="lg:col-span-2" />
        </div>
        <div className="mt-5">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => handlePageDelete(landingPageSlugs.contact, () => setContactDraft(defaultContactBlock))} disabled={saving} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-red-700 disabled:opacity-70">
              Xóa block
            </button>
            <button type="button" onClick={() => handlePageSave('contact', contactDraft, 'Thông tin liên hệ')} disabled={saving} className="rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
              Lưu thông tin liên hệ
            </button>
          </div>
        </div>
        {contactPage && <PageSyncMeta page={contactPage} />}
      </Card>

      <Card className="p-6">
        <SectionHeading title="Giờ mở cửa" description="Theo từng ngày trong tuần, lưu dạng ISO payload để backend xử lý." />
        <div className="mt-5 grid gap-3">
          {openingHoursDraft.hours.map((item, index) => (
            <div key={item.day} className="grid gap-3 rounded-[16px] border border-line bg-white p-4 lg:grid-cols-[120px_1fr_120px]">
              <TextField label="Ngày" value={item.day} onChange={(value) => setOpeningHoursDraft((current) => {
                const next = [...current.hours]
                next[index] = { ...next[index], day: value }
                return { ...current, hours: next }
              })} />
              <TextField
                label="Khung giờ"
                value={item.hours}
                onChange={(value) => setOpeningHoursDraft((current) => {
                  const next = [...current.hours]
                  next[index] = { ...next[index], hours: value }
                  return { ...current, hours: next }
                })}
              />
              <ToggleField
                label="Đóng cửa"
                checked={item.isClosed}
                onChange={(checked) => setOpeningHoursDraft((current) => {
                  const next = [...current.hours]
                  next[index] = { ...next[index], isClosed: checked }
                  return { ...current, hours: next }
                })}
              />
            </div>
          ))}
        </div>
        <div className="mt-5">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => handlePageDelete(landingPageSlugs.openingHours, () => setOpeningHoursDraft(defaultOpeningHoursBlock))} disabled={saving} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-red-700 disabled:opacity-70">
              Xóa block
            </button>
            <button type="button" onClick={() => handlePageSave('opening-hours', openingHoursDraft, 'Giờ mở cửa')} disabled={saving} className="rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
              Lưu giờ mở cửa
            </button>
          </div>
        </div>
        {openingHoursPage && <PageSyncMeta page={openingHoursPage} />}
      </Card>

      <Card className="p-6">
        <SectionHeading title="Menu nổi bật" description="Danh sách hiển thị ở Landing Page, có thể trỏ từ menu_items sau này." />
        <div className="mt-5 grid gap-4">
          {featuredMenuDraft.items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="grid gap-4 rounded-[16px] border border-line bg-white p-4 lg:grid-cols-[160px_1fr]">
              <img src={item.imageUrl} alt={item.name} className="h-[140px] w-full rounded-[14px] object-cover" />
              <div className="grid gap-3">
                <div className="grid gap-3 lg:grid-cols-2">
                  <TextField label="Tên món" value={item.name} onChange={(value) => setFeaturedMenuDraft((current) => {
                    const next = [...current.items]
                    next[index] = { ...next[index], name: value }
                    return { ...current, items: next }
                  })} />
                  <NumberField label="Giá" value={item.price} onChange={(value) => setFeaturedMenuDraft((current) => {
                    const next = [...current.items]
                    next[index] = { ...next[index], price: value }
                    return { ...current, items: next }
                  })} />
                </div>
                <TextAreaField
                  label="Mô tả"
                  value={item.description}
                  onChange={(value) => setFeaturedMenuDraft((current) => {
                    const next = [...current.items]
                    next[index] = { ...next[index], description: value }
                    return { ...current, items: next }
                  })}
                  rows={3}
                />
                <div className="grid gap-3 lg:grid-cols-2">
                  <TextField label="Badge" value={item.badge ?? ''} onChange={(value) => setFeaturedMenuDraft((current) => {
                    const next = [...current.items]
                    next[index] = { ...next[index], badge: value }
                    return { ...current, items: next }
                  })} />
                  <TextField label="Ảnh" value={item.imageUrl} onChange={(value) => setFeaturedMenuDraft((current) => {
                    const next = [...current.items]
                    next[index] = { ...next[index], imageUrl: value }
                    return { ...current, items: next }
                  })} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setFeaturedMenuDraft((current) => ({ ...current, items: [...current.items, { ...defaultFeaturedMenuBlock.items[0], name: `Món nổi bật ${current.items.length + 1}` }] }))}
            className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee"
          >
            Thêm món
          </button>
          <button type="button" onClick={() => handlePageDelete(landingPageSlugs.featuredMenu, () => setFeaturedMenuDraft(defaultFeaturedMenuBlock))} disabled={saving} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-red-700 disabled:opacity-70">
            Xóa block
          </button>
          <button type="button" onClick={() => handlePageSave('featured-menu', featuredMenuDraft, 'Menu nổi bật')} disabled={saving} className="rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
            Lưu menu nổi bật
          </button>
        </div>
        {featuredMenuPage && <PageSyncMeta page={featuredMenuPage} />}
      </Card>
    </div>
  )
}
