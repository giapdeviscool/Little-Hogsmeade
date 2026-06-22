import { useCallback, useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import { ChevronDown, ChevronUp, Clock3, Edit3, Eye, ImagePlus, Loader2, Plus, Search, Trash2 } from 'lucide-react'
import { LandingPage } from '../landing/LandingPage'
import { CmsEditorModal } from './CmsEditorModal'
import { PromotionsPanel } from './PromotionsPanel'
import { Card } from '../../components/ui/Card'
import { Pagination } from '../../components/ui/Pagination'
import { cn } from '../../utils/cn'
import { formatVND } from '../../utils/formatCurrency'
import { formatVnDate, formatVnDateTime, formatVnTime } from '../../utils/date'
import { getBranches } from '../../api/chain.api'
import {
  createBanner,
  createEvent,
  createPage,
  createPost,
  deleteBanner,
  deleteEvent,
  deletePage,
  deletePost,
  listBanners,
  listEvents,
  listPages,
  listPosts,
  updateBanner,
  updateEvent,
  updatePage,
  updatePost,
  uploadImage,
} from '../../api/cms.api'
import type { Banner, CmsPage, CmsPagePayload, Event, EventPayload, Post, PostPayload, Branch } from '../../types'

type CmsTab = 'landing' | 'posts' | 'events' | 'promotions'

type NoticeState = {
  type: 'success' | 'error'
  message: string
}

type BannerDraft = {
  id?: string
  title: string
  description: string
  imageUrl: string
  ctaLabel: string
  ctaHref: string
  sortOrder: number
  isActive: boolean
}

type ContactBlock = {
  phone: string
  email: string
  address: string
  mapLink: string
  socials: string[]
}

type OpeningHour = {
  day: string
  hours: string
  isClosed: boolean
}

type OpeningHoursBlock = {
  title: string
  description: string
  hours: OpeningHour[]
}

type FeaturedMenuItem = {
  name: string
  description: string
  price: number
  imageUrl: string
  badge?: string
}

type FeaturedMenuBlock = {
  title: string
  description: string
  items: FeaturedMenuItem[]
}

const cmsTabs: Array<{ key: CmsTab; label: string; description: string }> = [
  { key: 'landing', label: 'Landing Page Editor', description: 'Banner, liên hệ, giờ mở cửa, món nổi bật' },
  { key: 'posts', label: 'Posts List', description: 'Bài viết, ảnh đại diện, trạng thái hiển thị' },
  { key: 'events', label: 'Events List', description: 'Sự kiện, chiến dịch, voucher, combo' },
  { key: 'promotions', label: 'Promotions List', description: 'Quản lý khuyến mãi, giảm giá' },
]

const landingPageSlugs = {
  landingPage: 'landing-page',
  contact: 'landing-contact',
  openingHours: 'landing-opening-hours',
  featuredMenu: 'landing-featured-menu',
}

const dayOptions = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

const defaultLandingPageDraft: CmsPagePayload = {
  slug: 'landing-page',
  title: '',
  content: '',
  imageUrl: '',
  aboutTitle: '',
  aboutContent: '',
  yearsOfExperience: 0,
  isPublished: true,
}

const defaultContactBlock: ContactBlock = {
  phone: '1900 6868',
  email: 'hello@littlehogsmeade.vn',
  address: '12 Đồng Khởi, Quận 1, TP.HCM',
  mapLink: 'https://maps.google.com',
  socials: ['Instagram', 'Facebook', 'TikTok'],
}

const defaultOpeningHoursBlock: OpeningHoursBlock = {
  title: 'Giờ mở cửa',
  description: 'Khung giờ áp dụng cho toàn hệ thống',
  hours: dayOptions.map((day, index) => ({
    day,
    hours: index === 6 ? '08:00 - 22:00' : '07:00 - 23:00',
    isClosed: false,
  })),
}

const defaultFeaturedMenuBlock: FeaturedMenuBlock = {
  title: 'Menu nổi bật',
  description: 'Gợi ý món chủ lực xuất hiện ở Landing Page',
  items: [
    {
      name: 'Cappuccino Đặc Biệt',
      description: 'Espresso đậm đà với foam sữa mịn.',
      price: 65000,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85',
      badge: 'Best seller',
    },
  ],
}

const defaultBannerDraft: BannerDraft = {
  title: 'Mùa mới tại Little Hogsmeade',
  description: 'Bữa sáng, cà phê và cocktail trong không gian ấm cúng.',
  imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=90',
  ctaLabel: 'Khám phá ngay',
  ctaHref: '/menu',
  sortOrder: 1,
  isActive: true,
}


const emptyEventDraft: EventPayload = {
  title: '',
  branchId: '',
  description: '',
  thumbnailUrl: '',
  eventDate: '',
  startTime: '18:00',
  endTime: '21:00',
  locationNote: '',
  ticketPrice: 0,
  isPublished: false,
}

export function CMSPage() {
  const [activeTab, setActiveTab] = useState<CmsTab>('landing')
  const [isLandingPreviewOpen, setIsLandingPreviewOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mt-2 text-[34px] font-bold tracking-[-0.04em]">Quản lý Landing Page, Posts và Events</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Dữ liệu lấy trực tiếp từ API, ảnh upload qua Cloudinary và mỗi khu vực đều có loading, empty, error, xác nhận xóa và cảnh báo khi có thay đổi chưa lưu.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsLandingPreviewOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-coffee shadow-soft transition hover:bg-cream"
          >
            <Eye className="h-4 w-4" />
            Xem Landing Page
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 rounded-[20px] bg-cream p-2 shadow-soft">
        {cmsTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'min-w-[240px] rounded-[16px] px-5 py-4 text-left transition',
              activeTab === tab.key ? 'bg-white text-coffee shadow-soft' : 'text-muted hover:bg-white/70',
            )}
          >
            <span className="block text-[15px] font-semibold">{tab.label}</span>
            <span className="mt-1 block text-xs leading-5">{tab.description}</span>
          </button>
        ))}
      </div>

      <div className="mt-7">
        {activeTab === 'landing' && <LandingEditor />}
        {activeTab === 'posts' && <PostsPanel />}
        {activeTab === 'events' && <EventsPanel />}
        {activeTab === 'promotions' && <PromotionsPanel />}
      </div>

      {isLandingPreviewOpen && <LandingPage onClose={() => setIsLandingPreviewOpen(false)} />}
    </>
  )
}

function LandingEditor() {
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
    <div className="grid gap-6 xl:grid-cols-[1.25fr_.95fr]">
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

      <aside className="space-y-6">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Preview</p>
            <h2 className="mt-1 text-[22px] font-bold">Khung xem trước Landing Page</h2>
          </div>
          <div className="max-h-[1100px] overflow-auto bg-white">
            <LandingPage embedded hideBrowserChrome />
          </div>
        </Card>
      </aside>
    </div>
  )
}

import { getAuthSession } from '../../store/auth.store'

function PostsPanel() {
  const session = getAuthSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchPosts = useCallback(async (currentPage: number, currentSearch: string, currentStatus: string) => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { page: currentPage, limit: 5 }
      if (currentSearch.trim()) params.search = currentSearch.trim()
      if (currentStatus !== 'all') params.status = currentStatus
      const response = await listPosts(params)
      const paginated = response.data
      if (paginated && typeof paginated === 'object' && 'items' in paginated) {
        setPosts((paginated as { items: Post[] }).items)
        const pag = (paginated as { pagination: { page: number; limit: number; total: number; totalPages: number } }).pagination
        setTotalPages(pag.totalPages)
        setTotal(pag.total)
      } else {
        setPosts(normalizeList<Post>(response.data))
        setTotalPages(1)
        setTotal(0)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không tải được danh sách bài viết.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  // Fetch posts when page, search, or status changes
  useEffect(() => {
    void fetchPosts(page, debouncedSearch, statusFilter)
  }, [page, debouncedSearch, statusFilter, fetchPosts])

  function startCreate() {
    setEditingPost(null)
    setEditorOpen(true)
  }

  function startEdit(post: Post) {
    setEditingPost(post)
    setEditorOpen(true)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Xóa bài viết này?')) return
    try {
      await deletePost(id)
      setNotice({ type: 'success', message: 'Đã xóa bài viết.' })
      void fetchPosts(page, debouncedSearch, statusFilter)
    } catch (deleteError) {
      setNotice({ type: 'error', message: deleteError instanceof Error ? deleteError.message : 'Không xóa được bài viết.' })
    }
  }

  async function handleSave(payload: PostPayload, id?: string) {
    if (!id && session?.user?.id) {
      payload.authorId = session.user.id
    }
    const response = id ? await updatePost(id, payload) : await createPost(payload)
    const saved = response.data
    setPosts((current) => {
      const next = current.filter((item) => item.id !== saved.id)
      return [saved, ...next]
    })
    setNotice({ type: 'success', message: id ? 'Đã cập nhật bài viết.' : 'Đã tạo bài viết mới.' })
    void fetchPosts(page, debouncedSearch, statusFilter)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Posts</p>
            <h2 className="mt-1 text-[24px] font-bold">Quản lý Posts</h2>
            <p className="mt-2 text-sm text-muted">Search theo title, slug, category. Lọc theo trạng thái và sắp xếp theo ngày đăng.</p>
          </div>
          <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft">
            <Plus className="h-4 w-4" />
            New Post
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo title, slug, category..." className="h-12 w-full rounded-[14px] border border-line bg-white pl-10 pr-4 text-sm outline-none focus:border-latte" />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none">
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      {notice && <InlineNotice notice={notice} />}
      <StateShell loading={loading} error={error} empty={posts.length === 0 && !loading} title="Chưa có bài viết" description="Tạo bài viết đầu tiên cho blog / tin tức." />

      <div className="grid gap-4">
        {posts.map((post) => (
          <article key={post.id} className="grid gap-4 rounded-[22px] border border-line bg-white p-4 shadow-soft lg:grid-cols-[160px_1fr]">
            <img src={post.thumbnailUrl} alt={post.title} className="h-[140px] w-full rounded-[16px] object-cover" />
            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[20px] font-semibold">{post.title}</h3>
                    <StatusPill active={post.isPublished} />
                  </div>
                  <p className="mt-2 text-sm text-muted">{post.slug} · {post.category}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-coffee/80">{post.content}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => startEdit(post)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-coffee">
                    <Edit3 className="h-4 w-4" />
                    Sửa
                  </button>
                  <button type="button" onClick={() => handleDelete(post.id)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatVnDate(post.publishedAt ?? post.createdAt)}
                </span>
                <span className="rounded-full bg-cream px-3 py-1">Tags: {post.tags || 'Không có'}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!loading && totalPages > 0 && (
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} label="bài viết" />
      )}

      {editorOpen && (
        <PostEditorDialog
          post={editingPost}
          onClose={() => setEditorOpen(false)}
          onSave={async (payload) => {
            await handleSave(payload, editingPost?.id)
            setEditorOpen(false)
          }}
        />
      )}
    </div>
  )
}

function EventsPanel() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  // Load branches once
  useEffect(() => {
    void getBranches().then((res) => setBranches(normalizeList<Branch>(res.data))).catch(() => {})
  }, [])

  const fetchEvents = useCallback(async (currentPage: number, currentSearch: string, currentStatus: string) => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { page: currentPage, limit: 4 }
      if (currentSearch.trim()) params.search = currentSearch.trim()
      if (currentStatus !== 'all') params.status = currentStatus
      const response = await listEvents(params)
      const paginated = response.data
      if (paginated && typeof paginated === 'object' && 'items' in paginated) {
        setEvents((paginated as { items: Event[] }).items)
        const pag = (paginated as { pagination: { page: number; limit: number; total: number; totalPages: number } }).pagination
        setTotalPages(pag.totalPages)
        setTotal(pag.total)
      } else {
        setEvents(normalizeList<Event>(response.data))
        setTotalPages(1)
        setTotal(0)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không tải được danh sách sự kiện.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  // Fetch events when page, search, or status changes
  useEffect(() => {
    void fetchEvents(page, debouncedSearch, statusFilter)
  }, [page, debouncedSearch, statusFilter, fetchEvents])

  function startCreate() {
    setEditingEvent(null)
    setEditorOpen(true)
  }

  function startEdit(event: Event) {
    setEditingEvent(event)
    setEditorOpen(true)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Xóa sự kiện này?')) return
    try {
      await deleteEvent(id)
      setNotice({ type: 'success', message: 'Đã xóa sự kiện.' })
      void fetchEvents(page, debouncedSearch, statusFilter)
    } catch (deleteError) {
      setNotice({ type: 'error', message: deleteError instanceof Error ? deleteError.message : 'Không xóa được sự kiện.' })
    }
  }

  async function handleSave(payload: EventPayload, id?: string) {
    const response = id ? await updateEvent(id, payload) : await createEvent(payload)
    const saved = response.data
    setEvents((current) => {
      const next = current.filter((item) => item.id !== saved.id)
      return [saved, ...next]
    })
    setNotice({ type: 'success', message: id ? 'Đã cập nhật sự kiện.' : 'Đã tạo sự kiện mới.' })
    void fetchEvents(page, debouncedSearch, statusFilter)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Events</p>
            <h2 className="mt-1 text-[24px] font-bold">Quản lý Events</h2>
            <p className="mt-2 text-sm text-muted">Lưu ngày giờ theo ISO string, hiển thị theo locale vi-VN.</p>
          </div>
          <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft">
            <Plus className="h-4 w-4" />
            New Event
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo title, mô tả, địa điểm..." className="h-12 w-full rounded-[14px] border border-line bg-white pl-10 pr-4 text-sm outline-none focus:border-latte" />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none">
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      {notice && <InlineNotice notice={notice} />}
      <StateShell loading={loading} error={error} empty={events.length === 0 && !loading} title="Chưa có sự kiện" description="Tạo sự kiện đầu tiên cho chiến dịch, voucher hoặc combo." />

      <div className="grid gap-6 md:grid-cols-2">
        {events.map((event) => (
          <article key={event.id} className="overflow-hidden rounded-[22px] border border-line bg-white shadow-soft">
            <div className="relative aspect-video bg-beige">
              <img src={event.thumbnailUrl} alt={event.title} className="h-full w-full object-cover" />
              <div className="absolute left-4 top-4 flex gap-2">
                <StatusPill active={event.isPublished} />
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-coffee">
                  {formatVnDate(event.eventDate)}
                </span>
              </div>
            </div>
            <div className="border-b border-line p-5">
              <h3 className="text-[20px] font-bold">{event.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{event.description}</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid gap-3 text-sm text-muted lg:grid-cols-2">
                <InfoRow label="Khung giờ" value={`${formatVnTime(event.startTime)} - ${formatVnTime(event.endTime)}`} />
                <InfoRow label="Địa điểm" value={event.locationNote} />
                <InfoRow label="Giá vé" value={formatVND(event.ticketPrice)} />
                <InfoRow label="Cập nhật" value={formatVnDateTime(event.updatedAt ?? event.createdAt)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => startEdit(event)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-coffee">
                  <Edit3 className="h-4 w-4" />
                  Sửa
                </button>
                <button type="button" onClick={() => handleDelete(event.id)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-red-700">
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!loading && totalPages > 0 && (
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} label="sự kiện" />
      )}

      {editorOpen && (
        <EventEditorDialog
          event={editingEvent}
          branches={branches}
          onClose={() => setEditorOpen(false)}
          onSave={async (payload) => {
            await handleSave(payload, editingEvent?.id)
            setEditorOpen(false)
          }}
        />
      )}
    </div>
  )
}

function PostEditorDialog({
  post,
  onClose,
  onSave,
}: {
  post: Post | null
  onClose: () => void
  onSave: (payload: PostPayload) => Promise<void>
}) {
  const [draft, setDraft] = useState<PostPayload>(
    post
      ? {
        title: post.title,
        slug: post.slug,
        thumbnailUrl: post.thumbnailUrl,
        content: post.content,
        category: post.category,
        tags: post.tags || '',
        isPublished: post.isPublished,
        publishedAt: post.publishedAt ?? null,
      }
      : { title: '', slug: '', thumbnailUrl: '', content: '', category: '', tags: '', isPublished: false, publishedAt: null },
  )
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [unsaved, setUnsaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function updateDraft<K extends keyof PostPayload>(key: K, value: PostPayload[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setUnsaved(true)
  }

  async function handleUpload(file: File) {
    setSaving(true)
    setNotice(null)
    try {
      const response = await uploadImage(file, 'posts')
      updateDraft('thumbnailUrl', response.data.secure_url)
      setNotice({ type: 'success', message: 'Ảnh đại diện đã được tải lên.' })
    } catch (uploadError) {
      setNotice({ type: 'error', message: uploadError instanceof Error ? uploadError.message : 'Không tải được ảnh.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...draft,
        title: draft.title.trim(),
        slug: draft.slug.trim(),
        category: draft.category.trim(),
        tags: draft.tags.trim(),
        content: draft.content.trim(),
      })
      setUnsaved(false)
    } catch (saveError) {
      setNotice({ type: 'error', message: saveError instanceof Error ? saveError.message : 'Không lưu được bài viết.' })
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    if (unsaved && !window.confirm('Bạn có thay đổi chưa lưu. Đóng form mà không lưu?')) return
    onClose()
  }

  return (
    <CmsEditorModal
      open
      title={post ? 'Sửa bài viết' : 'Tạo bài viết mới'}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      {notice && <InlineNotice notice={notice} />}
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <TextField label="Tiêu đề" value={draft.title} onChange={(value) => updateDraft('title', value)} required />
        <TextField label="Slug" value={draft.slug} onChange={(value) => updateDraft('slug', value)} required />
        <SelectField
          label="Danh mục"
          value={draft.category}
          onChange={(value) => updateDraft('category', value)}
          options={['Coffee', 'Food', 'Beverage', 'Lifestyle', 'Event', 'Promotion']}
        />
        <TextField
          label="Tags"
          value={draft.tags}
          onChange={(value) => updateDraft('tags', value)}
          placeholder="cà phê, espresso, đồ uống"
        />
        <ImageField label="Thumbnail" value={draft.thumbnailUrl} onChange={(value) => updateDraft('thumbnailUrl', value)} onUpload={handleUpload} fileRef={fileRef} />
        <ToggleField label="Published" checked={draft.isPublished} onChange={(checked) => updateDraft('isPublished', checked)} />
        <TextAreaField label="Nội dung" value={draft.content} onChange={(value) => updateDraft('content', value)} rows={8} />
        <TextField
          label="Published at"
          type="datetime-local"
          value={draft.publishedAt ? draft.publishedAt.slice(0, 16) : ''}
          onChange={(value) => updateDraft('publishedAt', value ? new Date(value).toISOString() : null)}
        />
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={handleClose} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee">
            Hủy
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {post ? 'Lưu thay đổi' : 'Tạo bài viết'}
          </button>
        </div>
      </form>
    </CmsEditorModal>
  )
}

function EventEditorDialog({
  event,
  branches,
  onClose,
  onSave,
}: {
  event: Event | null
  branches: Branch[]
  onClose: () => void
  onSave: (payload: EventPayload) => Promise<void>
}) {
  const [draft, setDraft] = useState<EventPayload>(
    event
      ? {
        title: event.title,
        branchId: event.branchId,
        description: event.description,
        thumbnailUrl: event.thumbnailUrl,
        eventDate: event.eventDate.split('T')[0],
        startTime: event.startTime.includes('T') ? event.startTime.split('T')[1].slice(0, 5) : event.startTime,
        endTime: event.endTime.includes('T') ? event.endTime.split('T')[1].slice(0, 5) : event.endTime,
        locationNote: event.locationNote,
        ticketPrice: event.ticketPrice,
        isPublished: event.isPublished,
      }
      : { ...emptyEventDraft },
  )
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [unsaved, setUnsaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function updateDraft<K extends keyof EventPayload>(key: K, value: EventPayload[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setUnsaved(true)
  }

  async function handleUpload(file: File) {
    setSaving(true)
    setNotice(null)
    try {
      const response = await uploadImage(file, 'events')
      updateDraft('thumbnailUrl', response.data.secure_url)
      setNotice({ type: 'success', message: 'Ảnh sự kiện đã được tải lên.' })
    } catch (uploadError) {
      setNotice({ type: 'error', message: uploadError instanceof Error ? uploadError.message : 'Không tải được ảnh.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...draft,
        title: draft.title.trim(),
        branchId: draft.branchId,
        description: draft.description.trim(),
        locationNote: draft.locationNote.trim(),
        thumbnailUrl: draft.thumbnailUrl.trim(),
        eventDate: new Date(draft.eventDate).toISOString(),
        startTime: new Date(`${draft.eventDate}T${draft.startTime}:00.000Z`).toISOString(),
        endTime: new Date(`${draft.eventDate}T${draft.endTime}:00.000Z`).toISOString(),
      })
      setUnsaved(false)
    } catch (saveError) {
      setNotice({ type: 'error', message: saveError instanceof Error ? saveError.message : 'Không lưu được sự kiện.' })
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    if (unsaved && !window.confirm('Bạn có thay đổi chưa lưu. Đóng form mà không lưu?')) return
    onClose()
  }

  return (
    <CmsEditorModal
      open
      title={event ? 'Sửa sự kiện' : 'Tạo sự kiện mới'}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      {notice && <InlineNotice notice={notice} />}
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label="Tiêu đề" value={draft.title} onChange={(value) => updateDraft('title', value)} required />
          <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
            <span>Chi nhánh tổ chức</span>
            <select
              value={draft.branchId}
              onChange={(e) => updateDraft('branchId', e.target.value)}
              required
              className="h-12 w-full appearance-none rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="" disabled>Chọn chi nhánh</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
        </div>
        <TextAreaField label="Mô tả" value={draft.description} onChange={(value) => updateDraft('description', value)} rows={5} />
        <ImageField label="Thumbnail" value={draft.thumbnailUrl} onChange={(value) => updateDraft('thumbnailUrl', value)} onUpload={handleUpload} fileRef={fileRef} />
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label="Ngày diễn ra" type="date" value={draft.eventDate} onChange={(value) => updateDraft('eventDate', value)} />
          <NumberField label="Ticket price" value={draft.ticketPrice} onChange={(value) => updateDraft('ticketPrice', value)} />
          <TextField label="Start time" type="time" value={draft.startTime} onChange={(value) => updateDraft('startTime', value)} />
          <TextField label="End time" type="time" value={draft.endTime} onChange={(value) => updateDraft('endTime', value)} />
        </div>
        <TextField label="Location note" value={draft.locationNote} onChange={(value) => updateDraft('locationNote', value)} />
        <ToggleField label="Published" checked={draft.isPublished} onChange={(checked) => updateDraft('isPublished', checked)} />
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={handleClose} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee">
            Hủy
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {event ? 'Lưu thay đổi' : 'Tạo sự kiện'}
          </button>
        </div>
      </form>
    </CmsEditorModal>
  )
}

function StateShell({
  loading,
  error,
  empty,
  title,
  description,
  onRetry,
}: {
  loading: boolean
  error: string | null
  empty: boolean
  title: string
  description: string
  onRetry?: () => void
}) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-4 w-96" />
          <SkeletonBlock className="h-40 w-full" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 p-6 text-red-800">
        <p className="text-sm font-semibold">Không tải được dữ liệu</p>
        <p className="mt-2 text-sm leading-6">{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-coffee px-4 py-2 text-sm font-semibold text-white">
            Tải lại
          </button>
        )}
      </Card>
    )
  }

  if (empty) {
    return (
      <Card className="p-6">
        <EmptyPanel title={title} description={description} />
      </Card>
    )
  }

  return null
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid place-items-center rounded-[18px] border border-dashed border-latte bg-cream px-6 py-10 text-center">
      <div className="max-w-md">
        <p className="text-base font-semibold text-coffee">{title}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  )
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-[22px] font-bold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
  required?: boolean
}) {
  return (
    <label className={cn('flex flex-col gap-2 text-sm font-semibold text-coffee', className)}>
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
        className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  className?: string
}) {
  return (
    <label className={cn('flex flex-col gap-2 text-sm font-semibold text-coffee', className)}>
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
        style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
      >
        <option value="" disabled>Chọn danh mục</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="rounded-[14px] border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-latte"
      />
    </label>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-[14px] border border-line bg-white px-4 py-3 text-sm font-semibold text-coffee">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn('relative h-7 w-12 rounded-full transition', checked ? 'bg-coffee' : 'bg-beige')}
      >
        <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white transition', checked ? 'left-6' : 'left-1')} />
      </button>
    </label>
  )
}

function ImageField({
  label,
  value,
  onChange,
  onUpload,
  fileRef,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onUpload: (file: File) => Promise<void>
  fileRef: RefObject<HTMLInputElement | null>
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-coffee">{label}</label>
        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-coffee">
          <ImagePlus className="h-4 w-4" />
          Tải ảnh
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void onUpload(file)
          event.currentTarget.value = ''
        }}
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://..."
        className="h-12 w-full rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
      />
      {value ? (
        <div className="overflow-hidden rounded-[18px] border border-line bg-cream">
          <img src={value} alt={label} className="h-52 w-full object-cover" />
        </div>
      ) : null}
    </div>
  )
}

function StatusPill({ active }: { active: boolean }) {
  return <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', active ? 'bg-emerald-100 text-emerald-700' : 'bg-beige text-muted')}>{active ? 'Published' : 'Draft'}</span>
}

function InlineNotice({ notice }: { notice: NoticeState }) {
  return (
    <div className={cn('rounded-[16px] border px-4 py-3 text-sm', notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800')}>
      {notice.message}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-cream px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-coffee">{value}</p>
    </div>
  )
}

function PageSyncMeta({ page }: { page: CmsPage }) {
  return (
    <p className="mt-4 text-xs text-muted">
      Slug: {page.slug} · Cập nhật: {formatVnDateTime(page.updatedAt ?? page.createdAt)}
    </p>
  )
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={cn('animate-pulse rounded-md bg-beige', className)} />
}

function getPageBySlug(pages: CmsPage[], slug: string) {
  const pageList = normalizeList<CmsPage>(pages)
  return pageList.find((page) => page.slug === slug) ?? null
}

function safeParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}


function normalizeList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const items = (value as { items?: unknown }).items
    if (Array.isArray(items)) return items as T[]
  }
  return []
}

function hydrateLandingBlocks(
  pages: CmsPage[],
  banners: Banner[],
  setContactDraft: (value: ContactBlock) => void,
  setOpeningHoursDraft: (value: OpeningHoursBlock) => void,
  setFeaturedMenuDraft: (value: FeaturedMenuBlock) => void,
  setLandingPageDraft: (value: CmsPagePayload) => void,
) {
  const landingPage = getPageBySlug(pages, landingPageSlugs.landingPage)
  if (landingPage) {
    setLandingPageDraft({
      slug: landingPage.slug,
      title: landingPage.title,
      content: landingPage.content,
      imageUrl: landingPage.imageUrl,
      aboutTitle: landingPage.aboutTitle,
      aboutContent: landingPage.aboutContent,
      yearsOfExperience: landingPage.yearsOfExperience,
      isPublished: landingPage.isPublished,
    })
  } else {
    setLandingPageDraft(defaultLandingPageDraft)
  }

  const contact = safeParse<ContactBlock>(getPageBySlug(pages, landingPageSlugs.contact)?.content, defaultContactBlock)
  const openingHours = safeParse<OpeningHoursBlock>(getPageBySlug(pages, landingPageSlugs.openingHours)?.content, defaultOpeningHoursBlock)
  const featuredMenu = safeParse<FeaturedMenuBlock>(getPageBySlug(pages, landingPageSlugs.featuredMenu)?.content, {
    ...defaultFeaturedMenuBlock,
    items: banners.slice(0, 3).map((banner) => ({
      name: banner.title,
      description: banner.description ?? '',
      price: 65000,
      imageUrl: banner.imageUrl,
      badge: banner.ctaLabel ?? undefined,
    })),
  })

  setContactDraft(contact)
  setOpeningHoursDraft(openingHours)
  setFeaturedMenuDraft(featuredMenu)
}
