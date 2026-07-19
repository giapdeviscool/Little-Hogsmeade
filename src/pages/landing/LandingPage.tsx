import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { listBanners, listEvents, listPages, listPosts } from '../../api/cms.api'
import { getBranchesPublic as getBranches, getTopSellingMenu } from '../../api/public-menu.api'
import { createReservation } from '../../api/reservation.api'
import type { Banner, CmsPage, Event, Post, Branch } from '../../types'
import type { BookingDraft } from './landing.types'
import {
  defaultHero,
  fallbackBooking,
} from './landing.constants'
import {
  normalizeList,
  normalizeBranches,
  calculateDistanceKm,
  getPageBySlug,
  hydrateBookingDraft,
  getContactBlock,
  getOpeningHoursBlock,
  getFeaturedMenuBlock,
} from './landing.utils'

import { LandingLoading, LandingError, MiniBlock } from './components/LandingSharedUI'
import { HeroSection } from './components/HeroSection'
import { StorySection } from './components/StorySection'
import { EventSection } from './components/EventSection'
import { FeaturedMenuSection } from './components/FeaturedMenuSection'
import { PostSection } from './components/PostSection'
import { BookingSection } from './components/BookingSection'
import { StoreAndMemberSection } from './components/StoreAndMemberSection'

export function LandingPage({
  onClose,
  embedded = false,
  hideBrowserChrome = false,
  initialSection,
}: {
  onClose?: () => void
  embedded?: boolean
  hideBrowserChrome?: boolean
  initialSection?: string
}) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [pages, setPages] = useState<CmsPage[]>([])
  const [topSellingMenu, setTopSellingMenu] = useState<any[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(fallbackBooking)
  const [bookingNotice, setBookingNotice] = useState<string | null>(null)
  const [activeMenuQuery, setActiveMenuQuery] = useState('')
  const [storeQuery, setStoreQuery] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationNotice, setLocationNotice] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [bannerResponse, pageResponse, postResponse, eventResponse, topSellingResponse] = await Promise.all([
          listBanners(),
          listPages(),
          listPosts(),
          listEvents(),
          getTopSellingMenu(),
        ])
        const branchResponse = await getBranches()
        if (!alive) return
        const normalizedBanners = normalizeList<Banner>(bannerResponse.data)
        const normalizedPages = normalizeList<CmsPage>(pageResponse.data)
        const normalizedPosts = normalizeList<Post>(postResponse.data)
        const normalizedEvents = normalizeList<Event>(eventResponse.data)
        const normalizedBranches = normalizeBranches(branchResponse.data)
        setBanners(normalizedBanners)
        setPages(normalizedPages)
        setPosts(normalizedPosts.filter((p) => p.isPublished).slice(0, 3))
        setEvents(normalizedEvents.filter((e) => e.isPublished).slice(0, 2))
        setBranches(normalizedBranches)
        setTopSellingMenu(topSellingResponse.data || [])
        hydrateBookingDraft(normalizedPages, setBookingDraft)
      } catch (loadError) {
        if (!alive) return
        setError(loadError instanceof Error ? loadError.message : 'Không tải được Landing Page.')
      } finally {
        if (alive) setLoading(false)
      }
    }

    void load()

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!initialSection) return
    requestAnimationFrame(() => {
      document.getElementById(initialSection)?.scrollIntoView({ behavior: 'auto', block: 'start' })
    })
  }, [initialSection])

  const branchCards = useMemo(() => {
    const query = storeQuery.trim().toLowerCase()
    return [...branches]
      .filter((branch) => !query || [branch.name, branch.address, branch.phone, branch.email ?? ''].some((value) => value.toLowerCase().includes(query)))
      .map((branch) => ({
        ...branch,
        distanceKm: userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, branch.lat, branch.lng) : null,
      }))
      .sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return a.name.localeCompare(b.name)
        if (a.distanceKm == null) return 1
        if (b.distanceKm == null) return -1
        return a.distanceKm - b.distanceKm
      })
  }, [branches, storeQuery, userLocation])

  const activeBanners = useMemo(() => {
    const bannerList = Array.isArray(banners) ? banners : []
    const now = new Date()
    return bannerList
      .filter((banner) => {
        if (!banner.isActive) return false
        if (banner.startDate && new Date(banner.startDate) > now) return false
        if (banner.endDate && new Date(banner.endDate) < now) return false
        return true
      })
      .sort((a, b) => a.displayOrder - b.displayOrder)
  }, [banners])
  const contactBlock = useMemo(() => getContactBlock(pages), [pages])
  const openingHoursBlock = useMemo(() => getOpeningHoursBlock(pages), [pages])
  const featuredMenuBlock = useMemo(() => getFeaturedMenuBlock(pages, topSellingMenu), [pages, topSellingMenu])
  const publishedPosts = useMemo(() => posts.filter((post) => post.isPublished).slice(0, 4), [posts])
  const publishedEvents = useMemo(() => events.filter((event) => event.isPublished).slice(0, 4), [events])
  const landingPageContent = useMemo(() => getPageBySlug(pages, 'landing-page'), [pages])

  const isFullBanner = activeBanners.length > 0

  const mappedBanners = activeBanners.map(b => ({
    title: b.title || '',
    subtitle: b.subtitle || '',
    image: b.imageUrl || defaultHero.image,
    ctaLabel: '',
    ctaHref: b.ctaUrl || '/menu',
  }))

  const fallbackHero = {
    title: landingPageContent?.title || defaultHero.title,
    subtitle: landingPageContent?.content || defaultHero.subtitle,
    image: landingPageContent?.imageUrl || defaultHero.image,
    ctaLabel: 'Khám phá ngay',
    ctaHref: '/menu',
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!bookingDraft.branchId) {
      setBookingNotice('Vui lòng chọn chi nhánh.')
      return
    }

    try {
      const [datePart, timePart] = bookingDraft.datetime.split('T')
      if (!datePart || !timePart) {
        setBookingNotice('Vui lòng chọn ngày giờ hợp lệ.')
        return
      }

      await createReservation({
        branchId: bookingDraft.branchId,
        guestName: bookingDraft.name,
        guestPhone: bookingDraft.phone,
        guestCount: parseInt(bookingDraft.guests, 10) || 1,
        reservedDate: new Date(datePart).toISOString(),
        reservedTime: new Date(bookingDraft.datetime).toISOString(),
        note: bookingDraft.note,
        status: 'pending'
      })

      setBookingNotice('Đã gửi yêu cầu đặt bàn thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất.')
      setBookingDraft(fallbackBooking)
    } catch {
      setBookingNotice('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.')
    }
  }

  function handleDetectLocation() {
    if (!navigator.geolocation) {
      setLocationNotice('Trình duyệt không hỗ trợ định vị.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationNotice('Đã lấy vị trí hiện tại để sắp xếp cửa hàng gần nhất.')
      },
      () => {
        setLocationNotice('Không thể lấy vị trí. Bạn có thể nhập từ khóa để tìm cửa hàng.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }

  const shellClassName = embedded
    ? 'relative min-h-screen bg-white text-coffee'
    : 'fixed inset-0 z-50 overflow-y-auto bg-white text-coffee'

  return (
    <div className={shellClassName}>

      {loading ? (
        <LandingLoading embedded={embedded} />
      ) : error ? (
        <LandingError embedded={embedded} message={error} onRetry={() => window.location.reload()} />
      ) : (
        <main>
          {!hideBrowserChrome && (
            <HeroSection
              banners={mappedBanners}
              fallbackHero={fallbackHero}
              onPrimaryAction={() => scrollToSection('landing-menu')}
              onSecondaryAction={() => document.getElementById('booking-trigger')?.click()}
              embedded={embedded}
              isFullBanner={isFullBanner}
            />
          )}
          {hideBrowserChrome && (
            <div className="border-b border-line bg-cream px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Preview</p>
                  <h1 className="mt-1 text-[28px] font-bold tracking-[-0.04em]">{mappedBanners[0]?.title || fallbackHero.title}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{mappedBanners[0]?.subtitle || fallbackHero.subtitle}</p>
                </div>
                <div className="text-right text-xs text-muted">
                  <p>Landing Page preview</p>
                  <p>{publishedPosts.length} posts · {publishedEvents.length} events</p>
                </div>
              </div>
            </div>
          )}

          {!hideBrowserChrome && <StorySection landingPage={landingPageContent} />}
          {!hideBrowserChrome && <FeaturedMenuSection featuredMenuBlock={featuredMenuBlock} query={activeMenuQuery} setQuery={setActiveMenuQuery} />}
          {!hideBrowserChrome && <EventSection events={publishedEvents} />}
          {!hideBrowserChrome && <PostSection posts={publishedPosts} />}
          {!hideBrowserChrome && <BookingSection draft={bookingDraft} setDraft={setBookingDraft} onSubmit={handleBookingSubmit} notice={bookingNotice} branches={branchCards} onDetectLocation={handleDetectLocation} locationNotice={locationNotice} />}
          {!hideBrowserChrome && (
            <StoreAndMemberSection
              openingHoursBlock={openingHoursBlock}
              branches={branchCards}
              storeQuery={storeQuery}
              setStoreQuery={setStoreQuery}
              userLocation={userLocation}
              onDetectLocation={handleDetectLocation}
              locationNotice={locationNotice}
            />
          )}

          {hideBrowserChrome && (
            <div className="space-y-8 p-6">
              <MiniBlock title="About Us" description="Ảnh hero, câu chuyện thương hiệu và vibe không gian.">
                <p className="text-sm leading-6 text-muted">{mappedBanners[0]?.subtitle || fallbackHero.subtitle}</p>
              </MiniBlock>
              <MiniBlock title="Menu & Khuyến mãi" description="Card món rõ giá, ảnh và mô tả ngắn.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {featuredMenuBlock.items.slice(0, 2).map((item) => (
                    <div key={item.name} className="rounded-[16px] border border-line bg-white p-3">
                      <img src={item.imageUrl} alt={item.name} className="h-36 w-full rounded-[12px] object-cover" />
                      <div className="mt-3">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="mt-1 text-xs text-muted">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </MiniBlock>
            </div>
          )}

          {!hideBrowserChrome && !embedded && (
            <footer className="bg-coffee py-16 text-white">
              <div className="mx-auto grid max-w-[1320px] gap-10 px-4 md:grid-cols-2 md:px-8 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-14">
                <div>
                  <h2 className="text-[27px] font-bold">Little Hogsmeade</h2>
                  <p className="mt-4 max-w-[320px] text-sm leading-7 text-white/65">
                    Một góc Bistro Cafe hiện đại, nơi hương vị và những cuộc gặp gỡ đáng nhớ bắt đầu.
                  </p>
                </div>
                {/* <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gold">Giờ mở cửa</h3>
                  <p className="mt-4 text-sm leading-7 text-white/70">
                    {openingHoursBlock.hours.map((item) => `${item.day}: ${item.isClosed ? 'Đóng cửa' : item.hours}`).join('\n')}
                  </p>
                </div> */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gold">Liên hệ</h3>
                  <p className="mt-4 text-sm leading-7 text-white/70">
                    Hotline: {contactBlock.phone}
                    <br />
                    {contactBlock.email}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gold">Kết nối</h3>
                  <p className="mt-4 text-sm leading-7 text-white/70">{contactBlock.socials.join(' · ')}</p>
                </div>
              </div>
            </footer>
          )}
        </main>
      )}

      {onClose && !embedded && (
        <button type="button" onClick={onClose} className="fixed right-4 top-4 z-[60] rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-coffee shadow-soft">
          Đóng preview
        </button>
      )}
    </div>
  )
}
