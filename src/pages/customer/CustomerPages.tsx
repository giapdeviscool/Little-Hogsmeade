import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookingSection,
  EventSection,
  FeaturedMenuSection,
  HeroSection,
  PostSection,
  StoreAndMemberSection,
  StorySection,
  defaultHero,
  getFeaturedMenuBlock,
  getOpeningHoursBlock,
  normalizeBranches,
  normalizeList,
  type BookingDraft,
} from '../landing/LandingPage'
import { listBanners, listEvents, listPages, listPosts } from '../../api/cms.api'
import { getBranches } from '../../api/chain.api'
import type { Banner, Branch, CmsPage, Event, Post } from '../../types'
import { ROUTES } from '../../constants/routes'

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

export function CustomerHomePage() {
  const navigate = useNavigate()
  const [banners, setBanners] = useState<Banner[]>([])
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    let alive = true
    Promise.all([listBanners(), listEvents()]).then(([b, e]) => {
      if (alive) {
        setBanners(normalizeList<Banner>(b.data))
        setEvents(normalizeList<Event>(e.data))
      }
    })
    return () => { alive = false }
  }, [])

  const activeHero = banners.find((b) => b.isActive) ?? banners[0]
  const hero = activeHero
    ? {
        title: activeHero.title,
        subtitle: activeHero.description || defaultHero.subtitle,
        image: activeHero.imageUrl || defaultHero.image,
        ctaLabel: activeHero.ctaLabel || 'Khám phá ngay',
        ctaHref: activeHero.ctaHref || ROUTES.customerMenu,
      }
    : {
        title: defaultHero.title,
        subtitle: defaultHero.subtitle,
        image: defaultHero.image,
        ctaLabel: 'Khám phá ngay',
        ctaHref: ROUTES.customerMenu,
      }

  const publishedEvents = events.filter((e) => e.isPublished).slice(0, 4)

  return (
    <>
      <HeroSection
        hero={hero}
        onPrimaryAction={() => navigate(ROUTES.customerMenu)}
        onSecondaryAction={() => navigate(ROUTES.customerBooking)}
        embedded={true}
      />
      <EventSection events={publishedEvents} />
    </>
  )
}

export function CustomerMenuPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [pages, setPages] = useState<CmsPage[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([listBanners(), listPages()]).then(([b, p]) => {
      if (alive) {
        setBanners(normalizeList<Banner>(b.data))
        setPages(normalizeList<CmsPage>(p.data))
      }
    })
    return () => { alive = false }
  }, [])

  const featuredMenuBlock = useMemo(() => getFeaturedMenuBlock(pages, banners), [pages, banners])

  return <FeaturedMenuSection featuredMenuBlock={featuredMenuBlock} query={query} setQuery={setQuery} />
}

export function CustomerPromotionsPage() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    let alive = true
    listEvents().then((e) => {
      if (alive) setEvents(normalizeList<Event>(e.data))
    })
    return () => { alive = false }
  }, [])

  const publishedEvents = events.filter((e) => e.isPublished)

  return <EventSection events={publishedEvents} />
}

export function CustomerBookingPage() {
  const [draft, setDraft] = useState<BookingDraft>({ name: '', phone: '', guests: '4', datetime: '', note: '' })
  const [notice, setNotice] = useState<string | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setNotice('Đã ghi nhận yêu cầu. Cảm ơn bạn!')
  }

  return <BookingSection draft={draft} setDraft={setDraft} onSubmit={onSubmit} notice={notice} />
}

export function CustomerBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    let alive = true
    listPosts().then((p) => {
      if (alive) setPosts(normalizeList<Post>(p.data))
    })
    return () => { alive = false }
  }, [])

  const publishedPosts = posts.filter((p) => p.isPublished)

  return <PostSection posts={publishedPosts} />
}

export function CustomerStoresPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [pages, setPages] = useState<CmsPage[]>([])
  const [query, setQuery] = useState('')
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([getBranches(), listPages()]).then(([b, p]) => {
      if (alive) {
        setBranches(normalizeBranches(b.data))
        setPages(normalizeList<CmsPage>(p.data))
      }
    })
    return () => { alive = false }
  }, [])

  const branchCards = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...branches]
      .filter((branch) => !q || [branch.name, branch.address, branch.phone, branch.email ?? ''].some((value) => value.toLowerCase().includes(q)))
      .map((branch) => ({
        ...branch,
        distanceKm: loc ? calculateDistanceKm(loc.lat, loc.lng, branch.lat, branch.lng) : null,
      }))
      .sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return a.name.localeCompare(b.name)
        if (a.distanceKm == null) return 1
        if (b.distanceKm == null) return -1
        return a.distanceKm - b.distanceKm
      })
  }, [branches, query, loc])

  const openingHoursBlock = useMemo(() => getOpeningHoursBlock(pages), [pages])

  function onDetect() {
    if (!navigator.geolocation) {
      setNotice('Trình duyệt không hỗ trợ.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setNotice('Không lấy được vị trí.')
    )
  }

  return (
    <StoreAndMemberSection
      openingHoursBlock={openingHoursBlock}
      branches={branchCards}
      storeQuery={query}
      setStoreQuery={setQuery}
      userLocation={loc}
      onDetectLocation={onDetect}
      locationNotice={notice}
    />
  )
}

export function CustomerMembershipPage() {
  return (
    <section className="bg-cream py-20 md:py-24">
      <div className="mx-auto max-w-[800px] px-4 md:px-8">
        <h2 className="text-[36px] font-bold">Tra cứu hạng và điểm</h2>
        <p className="mt-4 text-muted">Chức năng đang được cập nhật...</p>
      </div>
    </section>
  )
}

export function CustomerAboutPage() {
  return <StorySection />
}

