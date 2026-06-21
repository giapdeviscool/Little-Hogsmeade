import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  BookingSection,
  EventSection,
  FeaturedMenuSection,
  PostSection,
  StoreAndMemberSection,
  StorySection,
  getFeaturedMenuBlock,
  getOpeningHoursBlock,
  normalizeBranches,
  normalizeList,
  type BookingDraft,
} from '../landing/LandingPage'
import { listBanners, listEvents, listPages, listPosts } from '../../api/cms.api'
import { getBranches } from '../../api/chain.api'
import type { Banner, Branch, CmsPage, Event, Post } from '../../types'
import { formatVnDate } from '../../utils/date'

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
  const [draft, setDraft] = useState<BookingDraft>({ name: '', phone: '', guests: '4', datetime: '', note: '', branchId: '' })
  const [notice, setNotice] = useState<string | null>(null)
  const [locationNotice, setLocationNotice] = useState<string | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    let alive = true
    getBranches().then((res) => {
      if (alive) setBranches(normalizeBranches(res.data))
    })
    return () => { alive = false }
  }, [])

  const branchCards = useMemo(() => {
    return [...branches]
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
  }, [branches, loc])

  function onDetectLocation() {
    if (!navigator.geolocation) {
      setLocationNotice('Trình duyệt không hỗ trợ.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationNotice('Đã lấy vị trí hiện tại.')
      },
      () => setLocationNotice('Không lấy được vị trí.')
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!draft.branchId) {
      setNotice('Vui lòng chọn chi nhánh.')
      return
    }
    setNotice('Đã ghi nhận yêu cầu. Cảm ơn bạn!')
  }

  return (
    <BookingSection
      draft={draft}
      setDraft={setDraft}
      onSubmit={onSubmit}
      notice={notice}
      branches={branchCards}
      onDetectLocation={onDetectLocation}
      locationNotice={locationNotice}
    />
  )
}

const BLOG_CATEGORIES = ['All', 'Coffee', 'Food', 'Beverage', 'Lifestyle', 'Event', 'Promotion']

export function CustomerBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    let alive = true
    listPosts().then((p) => {
      if (alive) setPosts(normalizeList<Post>(p.data))
    })
    return () => { alive = false }
  }, [])

  const publishedPosts = posts.filter((p) => p.isPublished)
  const filteredPosts = publishedPosts.filter((p) => activeCategory === 'All' || p.category === activeCategory)
  
  if (filteredPosts.length === 0) {
    return (
      <section className="bg-cream py-20 md:py-24">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Little Hogsmeade Tạp chí</p>
              <h2 className="mt-3 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] md:text-[48px]">Tin tức & Sự kiện</h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {BLOG_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${activeCategory === cat ? 'border-coffee bg-coffee text-white' : 'border-line bg-white text-muted hover:border-coffee'}`}
                >
                  {cat === 'All' ? 'Tất cả' : cat}
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-muted">Chưa có bài viết nào trong danh mục này.</p>
        </div>
      </section>
    )
  }

  const [featuredPost, ...otherPosts] = filteredPosts

  return (
    <section className="bg-cream py-20 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Little Hogsmeade Tạp chí</p>
            <h2 className="mt-3 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] md:text-[48px]">Tin tức & Sự kiện</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {BLOG_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${activeCategory === cat ? 'border-coffee bg-coffee text-white' : 'border-line bg-white text-muted hover:border-coffee'}`}
              >
                {cat === 'All' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Báo Mới: Featured Post */}
        <article className="group mb-12 flex flex-col gap-6 overflow-hidden rounded-[24px] border border-line bg-white shadow-soft lg:flex-row lg:items-center">
          <div className="overflow-hidden lg:w-3/5">
            <img src={featuredPost.thumbnailUrl} alt={featuredPost.title} className="h-[300px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[400px]" />
          </div>
          <div className="flex flex-col p-6 lg:w-2/5 lg:p-10 lg:pl-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{featuredPost.category}</p>
            <h3 className="mt-4 text-[28px] font-bold leading-[1.2] transition group-hover:text-coffee">{featuredPost.title}</h3>
            <p className="mt-4 line-clamp-4 text-base leading-7 text-muted">{featuredPost.content}</p>
            <div className="mt-8 flex items-center justify-between border-t border-line pt-6 text-sm text-muted">
              <span>{formatVnDate(featuredPost.publishedAt ?? featuredPost.createdAt)}</span>
              <span>{featuredPost.tags}</span>
            </div>
          </div>
        </article>

        {/* Các bài khác: Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {otherPosts.map((post) => (
            <article key={post.id} className="group overflow-hidden rounded-[22px] border border-line bg-white shadow-soft transition hover:border-coffee">
              <div className="overflow-hidden">
                <img src={post.thumbnailUrl} alt={post.title} className="h-[210px] w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{post.category}</p>
                <h3 className="mt-2 text-[18px] font-bold leading-6 transition group-hover:text-coffee">{post.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{post.content}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
                  <span>{formatVnDate(post.publishedAt ?? post.createdAt)}</span>
                  <span>{post.tags}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
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

