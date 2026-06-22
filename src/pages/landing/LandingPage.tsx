import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, Clock3, MapPin, Search, Star, Navigation, Eye } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { EventDetailModal, PostDetailModal } from '../../components/customer/DetailModals'
import defaultHeroImage from '../../assets/image/default.jpg'
import { cn } from '../../utils/cn'
import { formatVND } from '../../utils/formatCurrency'
import { formatVnDate, formatVnTime } from '../../utils/date'
import { listBanners, listEvents, listPages, listPosts } from '../../api/cms.api'
import { getBranches } from '../../api/chain.api'
import { createReservation } from '../../api/reservation.api'
import type { Banner, CmsPage, Event, Post, Branch } from '../../types'

export type ContactBlock = {
  phone: string
  email: string
  address: string
  mapLink: string
  socials: string[]
}

export type OpeningHoursBlock = {
  title: string
  description: string
  hours: Array<{
    day: string
    hours: string
    isClosed: boolean
  }>
}

export type FeaturedMenuBlock = {
  title: string
  description: string
  items: Array<{
    name: string
    description: string
    price: number
    imageUrl: string
    badge?: string
  }>
}

export type BookingDraft = {
  branchId: string
  name: string
  phone: string
  guests: string
  datetime: string
  note: string
}

export const defaultHero = {
  title: 'Little Hogsmeade',
  subtitle: 'Nơi cà phê, ẩm thực và quầy bar hòa thành một trải nghiệm ấm cúng.',
  image: `${defaultHeroImage}?auto=format&fit=crop&w=1800&q=90`,
}

const fallbackContact: ContactBlock = {
  phone: '1900 6868',
  email: 'hello@littlehogsmeade.vn',
  address: '12 Đồng Khởi, Quận 1, TP.HCM',
  mapLink: 'https://maps.google.com',
  socials: ['Instagram', 'Facebook', 'TikTok'],
}

const fallbackHours: OpeningHoursBlock = {
  title: 'Giờ mở cửa',
  description: 'Áp dụng cho toàn hệ thống',
  hours: [
    { day: 'Thứ 2 - Thứ 6', hours: '07:00 - 23:00', isClosed: false },
    { day: 'Thứ 7', hours: '08:00 - 23:30', isClosed: false },
    { day: 'Chủ nhật', hours: '08:00 - 22:00', isClosed: false },
  ],
}

const fallbackMenu: FeaturedMenuBlock = {
  title: 'Menu nổi bật',
  description: 'Món chủ lực xuất hiện ở Landing Page',
  items: [
    {
      name: 'Cappuccino Đặc Biệt',
      description: 'Espresso đậm đà, foam sữa mịn.',
      price: 65000,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=85',
      badge: 'Best seller',
    },
    {
      name: 'Mì Ý Sốt Truffle',
      description: 'Mì sợi tươi áo sốt nấm truffle đen.',
      price: 185000,
      imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=85',
      badge: 'Featured',
    },
    {
      name: 'Vang Đỏ Old Vine',
      description: 'Hương trái cây chín, hợp bữa tối ấm cúng.',
      price: 220000,
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=85',
      badge: 'Wine',
    },
  ],
}

const fallbackBooking: BookingDraft = {
  branchId: '',
  name: '',
  phone: '',
  guests: '4',
  datetime: '',
  note: '',
}

function safeParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function normalizeList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const items = (value as { items?: unknown }).items
    if (Array.isArray(items)) return items as T[]
  }
  return []
}

export function normalizeBranches(value: unknown): Branch[] {
  return normalizeList<Branch>(value)
}

function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const earthRadiusKm = 6371
  const deltaLat = toRadians(lat2 - lat1)
  const deltaLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getPageBySlug(pages: CmsPage[], slug: string) {
  return pages.find((page) => page.slug === slug) ?? null
}

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
        const [bannerResponse, pageResponse, postResponse, eventResponse] = await Promise.all([
          listBanners(),
          listPages(),
          listPosts(),
          listEvents(),
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



  const activeHero = useMemo(() => {
    const bannerList = Array.isArray(banners) ? banners : []
    return bannerList.find((banner) => banner.isActive) ?? bannerList[0]
  }, [banners])
  const contactBlock = useMemo(() => getContactBlock(pages), [pages])
  const openingHoursBlock = useMemo(() => getOpeningHoursBlock(pages), [pages])
  const featuredMenuBlock = useMemo(() => getFeaturedMenuBlock(pages, banners), [pages, banners])
  const publishedPosts = useMemo(() => posts.filter((post) => post.isPublished).slice(0, 4), [posts])
  const publishedEvents = useMemo(() => events.filter((event) => event.isPublished).slice(0, 4), [events])
  const landingPageContent = useMemo(() => getPageBySlug(pages, 'landing-page'), [pages])

  const hero = landingPageContent && (landingPageContent.title || landingPageContent.imageUrl)
    ? {
      title: landingPageContent.title || defaultHero.title,
      subtitle: landingPageContent.content || defaultHero.subtitle,
      image: landingPageContent.imageUrl || activeHero?.imageUrl || defaultHero.image,
      ctaLabel: activeHero?.ctaLabel || 'Khám phá ngay',
      ctaHref: activeHero?.ctaHref || '#landing-menu',
    }
    : activeHero
      ? {
        title: activeHero.title,
        subtitle: activeHero.description || defaultHero.subtitle,
        image: activeHero.imageUrl || defaultHero.image,
        ctaLabel: activeHero.ctaLabel || 'Khám phá ngay',
        ctaHref: activeHero.ctaHref || '#landing-menu',
      }
      : {
        title: defaultHero.title,
        subtitle: defaultHero.subtitle,
        image: defaultHero.image,
        ctaLabel: 'Khám phá ngay',
        ctaHref: '#landing-menu',
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
    } catch (err) {
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
              hero={hero}
              onPrimaryAction={() => scrollToSection('landing-menu')}
              onSecondaryAction={() => scrollToSection('landing-booking')}
              embedded={embedded}
            />
          )}
          {hideBrowserChrome && (
            <div className="border-b border-line bg-cream px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Preview</p>
                  <h1 className="mt-1 text-[28px] font-bold tracking-[-0.04em]">{hero.title}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{hero.subtitle}</p>
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
                <p className="text-sm leading-6 text-muted">{hero.subtitle}</p>
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

          {!hideBrowserChrome && (
            <footer className="bg-coffee py-16 text-white">
              <div className="mx-auto grid max-w-[1320px] gap-10 px-4 md:grid-cols-2 md:px-8 lg:grid-cols-[1.4fr_.8fr_.9fr_1fr] lg:px-14">
                <div>
                  <h2 className="text-[27px] font-bold">Little Hogsmeade</h2>
                  <p className="mt-4 max-w-[320px] text-sm leading-7 text-white/65">
                    Một góc Bistro Cafe hiện đại, nơi hương vị và những cuộc gặp gỡ đáng nhớ bắt đầu.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gold">Giờ mở cửa</h3>
                  <p className="mt-4 text-sm leading-7 text-white/70">
                    {openingHoursBlock.hours.map((item) => `${item.day}: ${item.isClosed ? 'Đóng cửa' : item.hours}`).join('\n')}
                  </p>
                </div>
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

function LandingLoading({ embedded }: { embedded: boolean }) {
  return (
    <div className={cn('space-y-6 p-6', !embedded && 'pt-20')}>
      <div className="h-[320px] animate-pulse rounded-[28px] bg-cream" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[260px] animate-pulse rounded-[24px] bg-cream" />
        <div className="h-[260px] animate-pulse rounded-[24px] bg-cream" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-[160px] animate-pulse rounded-[20px] bg-cream" />
        <div className="h-[160px] animate-pulse rounded-[20px] bg-cream" />
        <div className="h-[160px] animate-pulse rounded-[20px] bg-cream" />
      </div>
    </div>
  )
}

function LandingError({ embedded, message, onRetry }: { embedded: boolean; message: string; onRetry: () => void }) {
  return (
    <div className={cn('mx-auto max-w-2xl p-6', !embedded && 'pt-24')}>
      <Card className="border-red-200 bg-red-50 p-6 text-red-800">
        <p className="text-sm font-semibold">Không tải được Landing Page</p>
        <p className="mt-2 text-sm leading-6">{message}</p>
        <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-coffee px-4 py-2 text-sm font-semibold text-white">
          Tải lại
        </button>
      </Card>
    </div>
  )
}

export function HeroSection({
  hero,
  onPrimaryAction,
  onSecondaryAction,
  embedded,
}: {
  hero: { title: string; subtitle: string; image: string; ctaLabel: string; ctaHref: string }
  onPrimaryAction: () => void
  onSecondaryAction: () => void
  embedded: boolean
}) {
  return (
    <section
      id="landing-hero"
      className={cn(
        'relative flex min-h-[760px] items-center justify-center overflow-hidden bg-cover bg-center px-4 py-16 text-center md:min-h-[840px] md:px-6',
        embedded && 'min-h-[440px] md:min-h-[560px]',
      )}
      style={{ backgroundImage: `url('${hero.image}')` }}
    >
      <div className="absolute inset-0 bg-white/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/99 via-transparent to-coffee/10" />
      <div className="relative max-w-[1020px]">
        <h1 className="text-[44px] font-bold leading-[1.03] tracking-[-0.055em] text-coffee md:text-[68px]">
          {hero.title}
        </h1>
        <p className="mx-auto mt-6 max-w-[760px] text-[16px] font-medium leading-7 text-coffee/85 md:text-[20px] md:leading-8">
          {hero.subtitle}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onPrimaryAction} className="rounded-full bg-coffee px-7 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-[#3f2d20]">
            Khám phá thực đơn <ArrowRight className="ml-1 inline h-4 w-4" />
          </button>
          <button type="button" onClick={onSecondaryAction} className="rounded-full border border-coffee bg-white/75 px-7 py-3.5 text-sm font-bold text-coffee backdrop-blur transition hover:bg-white">
            Đặt bàn / Order
          </button>
          {hero.ctaHref !== '#landing-menu' && (
            <button type="button" onClick={onPrimaryAction} className="rounded-full border border-line bg-white/75 px-7 py-3.5 text-sm font-bold text-muted backdrop-blur transition hover:bg-white">
              {hero.ctaLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export function StorySection({ landingPage }: { landingPage?: CmsPage | null }) {
  const title = landingPage?.aboutTitle || 'Một câu chuyện ấm áp,\ngói trong từng tách cà phê'
  const years = landingPage?.yearsOfExperience || 12
  const content = landingPage?.aboutContent || 'Little Hogsmeade được tạo ra để trở thành nơi bạn chậm lại, thưởng thức một bữa ăn ngon, một ly cà phê được pha kỹ lưỡng hoặc một chai vang chia sẻ cùng người thân.\nNguyên liệu được tuyển chọn từ nhà cung cấp địa phương và nhập khẩu, giữ tinh thần bistro ấm cúng nhưng vẫn đủ tinh tế cho những cuộc hẹn quan trọng.'
  const contentParagraphs = content.split('\\n').filter(Boolean)

  return (
    <section id="landing-story" className="mx-auto grid max-w-[1280px] gap-10 px-4 py-20 md:px-8 lg:grid-cols-[1fr_1.14fr] lg:items-center lg:gap-14 lg:px-14 lg:py-28">
      <div className="grid grid-cols-2 gap-3">
        <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=85" alt="Bistro phong cách châu Âu" className="h-[240px] w-full rounded-[18px] object-cover md:h-[336px]" />
        <img src="https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=500&q=85" alt="Cà phê thủ công" className="h-[240px] w-full rounded-[18px] object-cover md:h-[248px]" />
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&q=85" alt="Món ăn bistro" className="h-[160px] w-full rounded-[18px] object-cover" />
        <div className="grid h-[160px] place-items-center rounded-[18px] bg-cream text-center md:h-[174px]">
          <div>
            <span className="text-[30px] text-gold">✦</span>
            <b className="block text-[32px]">{years}+</b>
            <small className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Năm kinh nghiệm Bistro</small>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Giới thiệu</p>
        <h2 className="mt-4 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] whitespace-pre-line md:text-[46px]">
          {title}
        </h2>
        {contentParagraphs.map((para, index) => (
          <p key={index} className="mt-7 text-[16px] leading-7 text-coffee/85">
            {para}
          </p>
        ))}
      </div>
    </section>
  )
}

export function FeaturedMenuSection({
  featuredMenuBlock,
  query,
  setQuery,
}: {
  featuredMenuBlock: FeaturedMenuBlock
  query: string
  setQuery: (value: string) => void
}) {
  const filteredItems = featuredMenuBlock.items.filter((item) => [item.name, item.description, item.badge ?? ''].some((value) => value.toLowerCase().includes(query.toLowerCase())))

  return (
    <section id="landing-menu" className="bg-cream py-20 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Menu & khuyến mãi</p>
            <h2 className="mt-3 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] md:text-[48px]">
              {featuredMenuBlock.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{featuredMenuBlock.description}</p>
          </div>
          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm món nổi bật..." className="h-12 w-full rounded-full border border-line bg-white pl-10 pr-4 text-sm outline-none focus:border-latte" />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <article key={item.name} className="overflow-hidden rounded-[22px] border border-line bg-white shadow-soft">
              <img src={item.imageUrl} alt={item.name} className="h-[280px] w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[18px] font-bold">{item.name}</h3>
                    <p className="mt-2 min-h-[44px] text-sm leading-6 text-muted">{item.description}</p>
                  </div>
                  <span className="rounded-full bg-beige px-3 py-1 text-xs font-semibold text-coffee">{item.badge ?? 'Nổi bật'}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <b>{formatVND(item.price)}</b>
                  <button type="button" className="rounded-full bg-coffee px-4 py-2 text-xs font-bold text-white">
                    Order
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="mt-8 p-6 text-center">
            <p className="text-sm font-semibold">Không tìm thấy món phù hợp.</p>
            <p className="mt-2 text-sm text-muted">Thử xoá từ khoá hoặc cập nhật dữ liệu menu nổi bật trong CMS.</p>
          </Card>
        )}
      </div>
    </section>
  )
}

export function EventSection({ events }: { events: Event[] }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const items = events.length
    ? events
    : [
      {
        id: 'fallback-1',
        title: 'Đêm Nhạc Acoustic',
        description: 'Đêm acoustic ấm áp cùng ban nhạc khách mời, free welcome drink.',
        thumbnailUrl: defaultHeroImage,
        eventDate: new Date().toISOString(),
        startTime: '20:00',
        endTime: '23:00',
        locationNote: 'Sân khấu tầng trệt',
        ticketPrice: 0,
        isPublished: true,
      } as unknown as Event,
    ]

  return (
    <section id="landing-events" className="border-y border-line bg-white py-20 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
        <p className="text-center text-xs font-bold uppercase tracking-[0.32em] text-gold">Sự kiện</p>
        <h2 className="mx-auto mt-4 max-w-[700px] text-center text-[36px] font-bold leading-[1] tracking-[-0.055em] md:text-[48px]">
          Khoảnh khắc đáng nhớ tại Little Hogsmeade
        </h2>
        <div className="mt-14 grid gap-7 lg:grid-cols-2">
          {items.map((event) => (
            <article key={event.id} className="relative min-h-[380px] overflow-hidden rounded-[22px] bg-coffee group cursor-pointer" onClick={() => setSelectedEvent(event)}>
              <img src={event.thumbnailUrl} alt={event.title} className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-coffee/95 via-coffee/25 to-transparent" />
              <span className="absolute left-6 top-6 rounded-[14px] bg-white px-4 py-3 text-center text-coffee shadow-soft">
                <small className="block text-[11px] tracking-[0.14em] text-muted">{formatVnDate(event.eventDate)}</small>
                <b className="mt-1 block text-[22px]">{event.isPublished ? 'Published' : 'Draft'}</b>
              </span>
              <div className="absolute bottom-7 left-7 max-w-[520px] text-white">
                <small className="text-xs font-bold tracking-[0.1em] text-white/75">
                  <Clock3 className="mr-1 inline h-4 w-4" />
                  {formatVnTime(event.startTime)} - {formatVnTime(event.endTime)}
                </small>
                <h3 className="mt-3 text-[29px] font-bold">{event.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">{event.description}</p>
                <p className="mt-3 text-sm text-white/70">
                  <MapPin className="mr-1 inline h-4 w-4" />
                  {event.locationNote}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30">
                  <Eye className="h-4 w-4" /> Xem chi tiết event
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </section>
  )
}

export function PostSection({ posts, showSeeMore = false }: { posts: Post[], showSeeMore?: boolean }) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  return (
    <section id="landing-posts" className="bg-cream py-20 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Tin tức / Blog</p>
            <h2 className="mt-3 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] md:text-[48px]">Bài viết mới từ quán</h2>
          </div>
          {showSeeMore && (
            <a href="/blog" className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-bold text-coffee transition hover:border-coffee">
              Xem tất cả bài viết <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-[22px] border border-line bg-white shadow-soft group cursor-pointer transition hover:border-coffee hover:-translate-y-1" onClick={() => setSelectedPost(post)}>
              <div className="overflow-hidden">
                <img src={post.thumbnailUrl} alt={post.title} className="h-[210px] w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5 flex flex-col h-[calc(100%-210px)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{post.category}</p>
                <h3 className="mt-2 text-[18px] font-bold leading-6 transition group-hover:text-coffee">{post.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted flex-1">{post.content}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
                  <span>{formatVnDate(post.publishedAt ?? post.createdAt)}</span>
                  <span className="flex items-center gap-1 font-bold text-coffee"><Eye className="h-3.5 w-3.5" /> Đọc tiếp</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <Card className="mt-8 p-6 text-center">
            <p className="text-sm font-semibold">Chưa có bài viết đã publish.</p>
            <p className="mt-2 text-sm text-muted">Tạo bài viết mới trong CMS để khối Blog hiển thị nội dung thật.</p>
          </Card>
        )}
      </div>
      <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </section>
  )
}

export function BookingSection({
  draft,
  setDraft,
  onSubmit,
  notice,
  branches,
  onDetectLocation,
  locationNotice,
}: {
  draft: BookingDraft
  setDraft: (value: BookingDraft) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  notice: string | null
  branches: Array<{ id: string; name: string; address: string; distanceKm: number | null }>
  onDetectLocation: () => void
  locationNotice: string | null
}) {
  return (
    <section id="landing-booking" className="bg-white py-20 md:py-24">
      <div className="mx-auto grid max-w-[980px] gap-12 px-4 md:px-8 lg:grid-cols-[1fr_425px] lg:items-center lg:gap-24 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Đặt bàn / Order</p>
          <h2 className="mt-4 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] md:text-[46px]">
            Giữ chỗ cho buổi tối
            <br />
            không thể quên của bạn
          </h2>
          <p className="mt-6 text-[15px] leading-7 text-coffee/85">
            Form này ghi nhận yêu cầu phía frontend. Khi backend booking/order có endpoint chính thức, chỉ cần thay `onSubmit` sang gọi API.
          </p>
          <p className="mt-7 flex items-center gap-2 text-sm font-bold text-gold">
            <Star className="h-4 w-4" />
            4.9 / 5 · 1,284 đánh giá
          </p>
        </div>
        <Card className="rounded-[18px] border border-line bg-cream p-7 shadow-soft">
          <h3 className="text-xl font-bold">Thông tin đặt bàn</h3>
          {notice && (
            <div className="mt-4 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </div>
          )}

          {!draft.branchId ? (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold">Chọn cửa hàng bạn muốn đặt bàn <span className="text-red-500">*</span></p>
                <button type="button" onClick={onDetectLocation} className="flex items-center rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-coffee hover:bg-beige transition">
                  <Navigation className="mr-1.5 h-3.5 w-3.5" /> Tìm cửa hàng gần nhất
                </button>
              </div>
              {locationNotice && <p className="mb-4 text-xs italic text-muted">{locationNotice}</p>}
              <div className="grid max-h-[360px] gap-3 overflow-y-auto">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setDraft({ ...draft, branchId: b.id })}
                    className="flex w-full flex-col gap-2 rounded-[14px] border border-line bg-white p-4 text-left transition hover:border-coffee"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-[15px] leading-snug">{b.name}</strong>
                      {b.distanceKm !== null && (
                        <span className="shrink-0 rounded-full bg-cream px-2 py-1 text-[10px] font-bold text-coffee">{b.distanceKm.toFixed(1)} km</span>
                      )}
                    </div>
                    <p className="text-xs leading-5 text-muted">{b.address}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="mb-5 flex items-center justify-between rounded-[14px] border border-emerald-200 bg-emerald-50 p-4">
                <div>
                  <p className="text-xs text-emerald-700">Chi nhánh đã chọn:</p>
                  <strong className="text-sm text-emerald-900">{branches.find((b) => b.id === draft.branchId)?.name}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, branchId: '' })}
                  className="text-xs font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                >
                  Đổi
                </button>
              </div>

              <form className="flex flex-col gap-4" onSubmit={onSubmit}>

                <LandingInput label="Họ và tên" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} placeholder="Trần Mai Anh" />
                <LandingInput label="Số điện thoại" value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} placeholder="0912 345 678" />
                <div className="grid grid-cols-2 gap-3">
                  <LandingInput label="Ngày giờ" value={draft.datetime} onChange={(value) => setDraft({ ...draft, datetime: value })} placeholder="2026-06-20T19:30" type="datetime-local" />
                  <LandingInput label="Số lượng khách" value={draft.guests} onChange={(value) => setDraft({ ...draft, guests: value })} placeholder="4" />
                </div>
                <LandingInput label="Ghi chú" value={draft.note} onChange={(value) => setDraft({ ...draft, note: value })} placeholder="Sinh nhật, ghế trẻ em..." />
                <button type="submit" className="h-12 w-full rounded-[12px] bg-coffee text-sm font-bold text-white">
                  Xác nhận đặt bàn
                </button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}

export function StoreAndMemberSection({
  openingHoursBlock,
  branches,
  storeQuery,
  setStoreQuery,
  userLocation,
  onDetectLocation,
  locationNotice,
}: {
  openingHoursBlock: OpeningHoursBlock
  branches: Array<Branch & { distanceKm: number | null }>
  storeQuery: string
  setStoreQuery: (value: string) => void
  userLocation: { lat: number; lng: number } | null
  onDetectLocation: () => void
  locationNotice: string | null
}) {
  return (
    <section id="landing-stores" className="bg-cream py-20 md:py-24">
      <div className="mx-auto grid max-w-[1080px] gap-8 px-4 md:px-8 lg:grid-cols-2 lg:px-8">
        <Card className="rounded-[18px] border border-line bg-white p-7">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Tìm cửa hàng</p>
          <h2 className="mt-3 text-[24px] font-bold">Tìm cửa hàng gần nhất</h2>
          <p className="mt-3 text-sm leading-6 text-coffee/80">Danh sách lấy từ `/api/v1/branches`, ưu tiên sắp xếp theo khoảng cách nếu người dùng cho phép location.</p>
          <div className="mt-5 flex gap-2 rounded-[14px] border border-line bg-cream p-2">
            <input value={storeQuery} onChange={(event) => setStoreQuery(event.target.value)} className="flex-1 bg-transparent px-2 text-sm outline-none" placeholder="Nhập quận / thành phố / từ khóa..." />
            <button type="button" onClick={onDetectLocation} className="rounded-[10px] bg-coffee px-4 py-2 text-xs font-bold text-white">
              Dùng vị trí
            </button>
          </div>
          {locationNotice && (
            <div className="mt-3 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {locationNotice}
            </div>
          )}
          <div className="mt-4 space-y-2">
            {branches.length > 0 ? (
              branches.slice(0, 4).map((branch) => (
                <div key={branch.id} className="rounded-[16px] border border-line bg-white p-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-coffee">{branch.name}</p>
                      <p className="mt-1 text-muted">{branch.address}</p>
                      <p className="mt-2 text-xs text-muted">
                        {branch.phone}
                        {branch.email ? ` · ${branch.email}` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-coffee">
                      {branch.distanceKm == null ? 'Xem sau' : `${branch.distanceKm.toFixed(1)} km`}
                    </span>
                  </div>
                  <a
                    className="mt-3 inline-block text-xs font-semibold text-gold"
                    href={`https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mở bản đồ
                  </a>
                  <a
                    className="ml-4 mt-3 inline-block text-xs font-semibold text-muted"
                    href={`https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Xem tuyến đường
                  </a>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-latte bg-cream px-4 py-6 text-center text-sm text-muted">
                Không có chi nhánh phù hợp.
              </div>
            )}
          </div>
        </Card>

        <Card className="rounded-[18px] border border-line bg-white p-7">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Thành viên</p>
          <h2 className="mt-3 text-[24px] font-bold">Tra cứu hạng và điểm</h2>
          <p className="mt-3 text-sm leading-6 text-coffee/80">
            Giao diện tra cứu thành viên sẵn khung để nối API khi backend mở endpoint membership/loyalty.
          </p>

          <div className="mt-5 rounded-[16px] bg-beige p-4">
            <p className="text-sm font-semibold text-coffee">{openingHoursBlock.title}</p>
            <div className="mt-3 space-y-2 text-sm text-muted">
              {openingHoursBlock.hours.map((item) => (
                <div key={item.day} className="flex items-center justify-between gap-4">
                  <span>{item.day}</span>
                  <span>{item.isClosed ? 'Đóng cửa' : item.hours}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-[16px] border border-line bg-cream p-4">
            <p className="text-sm font-semibold text-coffee">Vị trí hiện tại</p>
            <p className="mt-1 text-sm text-muted">{userLocation ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}` : 'Chưa bật định vị'}</p>
          </div>
        </Card>
      </div>
    </section>
  )
}

function MiniBlock({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-coffee">{title}</p>
      <p className="mt-1 text-xs text-muted">{description}</p>
      <div className="mt-4">{children}</div>
    </Card>
  )
}

function LandingInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-bold">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        className="h-12 rounded-[12px] border border-line bg-cream px-4 text-sm outline-none focus:border-latte"
      />
    </label>
  )
}

function hydrateBookingDraft(pages: CmsPage[], setDraft: (value: BookingDraft) => void) {
  const bookingPage = getPageBySlug(pages, 'landing-booking')
  const parsed = safeParse<BookingDraft>(bookingPage?.content, fallbackBooking)
  setDraft(parsed)
}

export function getContactBlock(pages: CmsPage[]) {
  return safeParse<ContactBlock>(getPageBySlug(pages, 'landing-contact')?.content, fallbackContact)
}

export function getOpeningHoursBlock(pages: CmsPage[]) {
  return safeParse<OpeningHoursBlock>(getPageBySlug(pages, 'landing-opening-hours')?.content, fallbackHours)
}

export function getFeaturedMenuBlock(pages: CmsPage[], banners: Banner[]) {
  return safeParse<FeaturedMenuBlock>(getPageBySlug(pages, 'landing-featured-menu')?.content, {
    ...fallbackMenu,
    items: banners.filter((banner) => banner.isActive).slice(0, 4).map((banner, index) => ({
      name: banner.title,
      description: banner.description ?? '',
      price: 65000 + index * 25000,
      imageUrl: banner.imageUrl,
      badge: banner.ctaLabel ?? 'Featured',
    })),
  })
}
