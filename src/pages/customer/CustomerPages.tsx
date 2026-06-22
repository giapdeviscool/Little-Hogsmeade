import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BookingSection } from '../landing/components/BookingSection'
import { EventSection } from '../landing/components/EventSection'
import { FeaturedMenuSection } from '../landing/components/FeaturedMenuSection'
import { StoreAndMemberSection } from '../landing/components/StoreAndMemberSection'
import { StorySection } from '../landing/components/StorySection'
import {
  getFeaturedMenuBlock,
  getOpeningHoursBlock,
  normalizeBranches,
  normalizeList,
} from '../landing/landing.utils'
import type { BookingDraft } from '../landing/landing.types'
import { listBanners, listEvents, listPages, listPosts } from '../../api/cms.api'
import { searchCustomerByPhone, getCustomerMemberships, getPointTransactions, getActiveCampaigns, redeemPoints, updateMembershipPoints } from '../../api/customer.api'
import { getBranches } from '../../api/chain.api'
import type { Banner, Branch, CmsPage, Event, Post, Promotion } from '../../types'
import type { Customer, CustomerMembership, PointTransaction } from '../../types/customer.types'
import { formatVnDate, formatVnDateTime } from '../../utils/date'
import { Eye, Search, Gift, Award, History, X } from 'lucide-react'
import { PostDetailModal } from '../../components/customer/DetailModals'
import { cn } from '../../utils/cn'

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

export function CustomerEventsPage() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    let alive = true
    listEvents().then((res) => {
      if (alive && res.data) {
        setEvents(normalizeList<Event>(res.data))
      }
    })
    return () => { alive = false }
  }, [])

  return (
    <>
      <EventSection events={events} className="border-b border-line bg-white py-20 md:py-24" />
    </>
  )
}

export function CustomerPromotionsPage() {
  const [campaigns, setCampaigns] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [membership, setMembership] = useState<CustomerMembership | null>(null)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{type: 'success' | 'error', msg: string} | null>(null)

  useEffect(() => {
    let alive = true
    getActiveCampaigns().then((res) => {
      if (alive) {
        setCampaigns(res.data || [])
        setLoading(false)
      }
    }).catch(() => {
      if (alive) setLoading(false)
    })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 10000)
      return () => clearTimeout(timer)
    }
  }, [notice])

  async function handleCheckPhone(e: FormEvent) {
    e.preventDefault()
    if (!phone) return
    try {
      const cusRes = await searchCustomerByPhone(phone)
      if (cusRes.data && cusRes.data.length > 0) {
        setCustomer(cusRes.data[0])
        const memRes = await getCustomerMemberships(cusRes.data[0].id)
        if (memRes.data && memRes.data.length > 0) {
          setMembership(memRes.data[0])
          setNotice({ type: 'success', msg: 'Đã xác thực thành viên thành công.' })
        } else {
          setNotice({ type: 'error', msg: 'Chưa có thông tin hạng thẻ.' })
        }
      } else {
        setNotice({ type: 'error', msg: 'Không tìm thấy số điện thoại này.' })
        setCustomer(null)
        setMembership(null)
      }
    } catch {
      setNotice({ type: 'error', msg: 'Lỗi khi kiểm tra thông tin.' })
    }
  }

  async function handleRedeem(campaign: Promotion) {
    if (!membership) {
      setNotice({ type: 'error', msg: 'Vui lòng xác thực số điện thoại trước khi đổi ưu đãi.' })
      return
    }
    
    // Giả định: Đổi mã tốn 50 điểm
    const requiredPoints = 50
    if (membership.totalPoints < requiredPoints) {
      setNotice({ type: 'error', msg: `Bạn không đủ điểm. Cần ${requiredPoints} điểm để đổi.` })
      return
    }

    if (!window.confirm(`Bạn có chắc muốn dùng ${requiredPoints} điểm để đổi ưu đãi "${campaign.name}"?`)) return

    setRedeemingId(campaign.id)
    try {
      // 1. Trừ điểm
      const newPoints = membership.totalPoints - requiredPoints
      await updateMembershipPoints(membership.id, newPoints)
      
      // 2. Ghi log transaction
      await redeemPoints({
        customerMembershipId: membership.id,
        points: requiredPoints,
        note: `Đổi voucher chiến dịch: ${campaign.name}`
      })
      
      // Update local state
      setMembership({ ...membership, totalPoints: newPoints })
      setNotice({ type: 'success', msg: `Đổi thành công! Ưu đãi đã được thêm vào tài khoản của bạn.` })
    } catch {
      setNotice({ type: 'error', msg: 'Có lỗi xảy ra khi đổi điểm. Vui lòng thử lại.' })
    } finally {
      setRedeemingId(null)
    }
  }

  return (
    <section className="bg-cream py-20 md:py-24 min-h-[80vh]">
      <div className="mx-auto max-w-[1000px] px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Offers & Rewards</p>
          <h2 className="mt-3 text-[36px] font-bold md:text-[48px]">Đổi Điểm Nhận Ưu Đãi</h2>
          <p className="mt-4 text-muted mx-auto max-w-xl">Sử dụng điểm tích lũy của bạn để đổi lấy các voucher giảm giá cực hấp dẫn từ Little Hogsmeade.</p>
        </div>

        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-soft mb-12 border border-line flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            {membership ? (
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-coffee/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-coffee" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-coffee">{customer?.fullName}</p>
                  <p className="text-sm text-muted">Hạng: <span className="font-bold text-gold">{membership.tier?.name || 'Thành viên'}</span> • Hiện có: <span className="font-bold text-coffee">{membership.totalPoints} điểm</span></p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckPhone} className="flex gap-3 w-full">
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Nhập số điện thoại để xem điểm..."
                  className="flex-1 h-[48px] rounded-xl border border-line bg-white px-4 text-sm outline-none focus:border-coffee"
                />
                <button type="submit" className="h-[48px] rounded-xl bg-coffee px-6 font-bold text-white transition hover:bg-opacity-90">
                  Xác thực
                </button>
              </form>
            )}
          </div>
          
          {membership && (
            <button onClick={() => { setMembership(null); setCustomer(null); setPhone(''); setNotice(null); }} className="text-sm text-muted hover:text-coffee font-semibold underline">
              Đổi số điện thoại khác
            </button>
          )}
        </div>

        {notice && (
          <div className={cn("mb-8 rounded-xl p-4 text-center text-sm font-semibold border", notice.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>
            {notice.msg}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-10 text-muted">Đang tải ưu đãi...</div>
          ) : campaigns.length > 0 ? (
            campaigns.map(campaign => (
              <div key={campaign.id} className="group overflow-hidden rounded-[24px] bg-white border border-line shadow-soft transition hover:-translate-y-1 hover:shadow-hover flex flex-col">
                <div className="h-[140px] bg-coffee p-6 text-white flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute right-[-20px] top-[-20px] h-[100px] w-[100px] rounded-full bg-white/10" />
                  <Gift className="h-8 w-8 mb-2 text-gold" />
                  <h3 className="font-bold text-xl relative z-10 leading-tight truncate">{campaign.name}</h3>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-sm text-muted mb-4 flex-1">{campaign.description || 'Voucher giảm giá hóa đơn áp dụng cho các chi nhánh.'}</p>
                  
                  <div className="flex items-center justify-between mb-6 pt-4 border-t border-line border-dashed">
                    <div>
                      <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Mức giảm</p>
                      <p className="font-bold text-lg text-coffee">
                        {campaign.discountType === 'percent' ? `${campaign.discountValue}%` : `${new Intl.NumberFormat('vi-VN').format(campaign.discountValue)}đ`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Cần dùng</p>
                      <p className="font-bold text-lg text-gold">50 Điểm</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRedeem(campaign)}
                    disabled={redeemingId === campaign.id || (membership && membership.totalPoints < 50) || !membership}
                    className="w-full h-12 rounded-full bg-coffee font-bold text-white transition hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {redeemingId === campaign.id ? 'Đang xử lý...' : membership ? 'Đổi ưu đãi' : 'Đăng nhập để đổi'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-muted">
              Hiện chưa có chương trình ưu đãi nào. Bạn quay lại sau nhé!
            </div>
          )}
        </div>
      </div>
    </section>
  )
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
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  useEffect(() => {
    let alive = true
    listPosts().then((p) => {
      if (alive) {
        setPosts(normalizeList<Post>(p.data))
      }
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
        <article className="group mb-12 flex flex-col gap-6 overflow-hidden rounded-[24px] border border-line bg-white shadow-soft lg:flex-row lg:items-center cursor-pointer transition hover:border-coffee" onClick={() => setSelectedPost(featuredPost)}>
          <div className="overflow-hidden lg:w-3/5">
            <img src={featuredPost.thumbnailUrl} alt={featuredPost.title} className="h-[300px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[400px]" />
          </div>
          <div className="flex flex-col p-6 lg:w-2/5 lg:p-10 lg:pl-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{featuredPost.category}</p>
            <h3 className="mt-4 text-[28px] font-bold leading-[1.2] transition group-hover:text-coffee">{featuredPost.title}</h3>
            <p className="mt-4 line-clamp-4 text-base leading-7 text-muted">{featuredPost.content}</p>
            <div className="mt-8 flex items-center justify-between border-t border-line pt-6 text-sm text-muted">
              <span>{formatVnDate(featuredPost.publishedAt ?? featuredPost.createdAt)}</span>
              <span className="flex items-center gap-2 font-bold text-coffee"><Eye className="h-4 w-4" /> Đọc tiếp</span>
            </div>
          </div>
        </article>

        {/* Các bài khác: Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {otherPosts.map((post) => (
            <article key={post.id} className="group overflow-hidden rounded-[22px] border border-line bg-white shadow-soft transition hover:border-coffee cursor-pointer hover:-translate-y-1" onClick={() => setSelectedPost(post)}>
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
      </div>
      <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
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
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [membership, setMembership] = useState<CustomerMembership | null>(null)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000)
      return () => clearTimeout(timer)
    }
  }, [error])

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!phone) return
    
    setLoading(true)
    setError(null)
    try {
      const cusRes = await searchCustomerByPhone(phone)
      if (cusRes.data && cusRes.data.length > 0) {
        const foundCustomer = cusRes.data[0]
        setCustomer(foundCustomer)
        
        const memRes = await getCustomerMemberships(foundCustomer.id)
        if (memRes.data && memRes.data.length > 0) {
          const foundMem = memRes.data[0]
          setMembership(foundMem)
          
          const transRes = await getPointTransactions(foundMem.id)
          setTransactions(transRes.data || [])
        } else {
          setMembership(null)
        }
      } else {
        setError('Không tìm thấy thông tin cho số điện thoại này.')
        setCustomer(null)
        setMembership(null)
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tra cứu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-cream py-20 md:py-24 min-h-[80vh]">
      <div className="mx-auto max-w-[800px] px-4 md:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Little Hogsmeade</p>
          <h2 className="mt-3 text-[36px] font-bold md:text-[48px]">Tra cứu Thẻ thành viên</h2>
        </div>
        
        <form onSubmit={handleSearch} className="relative flex items-center mx-auto max-w-[500px] mb-12">
          <input 
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại của bạn..."
            className="h-[60px] w-full rounded-full border border-line bg-white pl-6 pr-32 text-base outline-none focus:border-coffee shadow-soft"
          />
          <button 
            type="submit" 
            disabled={loading || !phone}
            className="absolute right-2 top-2 bottom-2 rounded-full bg-coffee px-6 font-bold text-white transition hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </form>

        {error && (
          <div className="mx-auto max-w-[500px] rounded-[16px] border border-red-200 bg-red-50 p-4 text-center text-sm text-red-800 mb-8">
            {error}
          </div>
        )}

        {customer && membership && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="grid md:grid-cols-[1fr_300px] gap-6">
              <div className="rounded-[24px] border border-line bg-white p-6 md:p-8 shadow-soft flex flex-col justify-between">
                <div>
                  <p className="text-sm text-muted mb-1">Thẻ thành viên của</p>
                  <h3 className="text-[24px] font-bold text-coffee">{customer.fullName}</h3>
                  <p className="text-sm font-semibold mt-2 px-3 py-1 bg-gold/10 text-gold rounded-full inline-block">
                    Hạng: {membership.tier?.name || 'Khách hàng mới'}
                  </p>
                </div>
                
                <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
                  <div>
                    <p className="text-xs text-muted mb-1 uppercase tracking-wider font-bold">Điểm hiện tại</p>
                    <p className="text-[32px] font-bold text-coffee leading-none">{membership.totalPoints}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted mb-1 uppercase tracking-wider font-bold">Chi tiêu tích lũy</p>
                    <p className="text-[20px] font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(membership.totalSpent)}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-[24px] border border-line bg-coffee text-white p-6 md:p-8 shadow-soft">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="h-6 w-6 text-gold" />
                  <h3 className="font-bold text-lg">Đặc quyền hạng thẻ</h3>
                </div>
                {membership.tier ? (
                  <ul className="space-y-4 text-sm text-white/80">
                    {membership.tier.discountPercent > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-gold">★</span>
                        <span>Giảm <strong>{membership.tier.discountPercent}%</strong> cho mọi hóa đơn.</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="text-gold">★</span>
                      <span>{membership.tier.description || 'Tham gia tích điểm đổi quà.'}</span>
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm text-white/70">Chưa có thông tin đặc quyền.</p>
                )}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <a href="/promotions" className="w-full block text-center rounded-xl bg-white text-coffee font-bold py-3 hover:bg-cream transition">
                    Đổi thưởng ngay
                  </a>
                </div>
              </div>
            </div>

            {/* Lịch sử giao dịch */}
            <div className="rounded-[24px] border border-line bg-white p-6 md:p-8 shadow-soft mt-8">
              <div className="flex items-center gap-2 mb-6">
                <History className="h-5 w-5 text-muted" />
                <h3 className="font-bold text-lg">Lịch sử tích/tiêu điểm</h3>
              </div>
              
              {transactions.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between border-b border-line pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-[15px]">{tx.type === 'earn' ? 'Tích điểm từ hóa đơn' : tx.type === 'redeem' ? 'Đổi điểm nhận ưu đãi' : 'Điều chỉnh điểm'}</p>
                        <p className="text-xs text-muted mt-1">{formatVnDateTime(tx.createdAt)}</p>
                      </div>
                      <div className={`font-bold text-lg ${tx.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.points > 0 ? '+' : ''}{tx.points}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted text-center py-6">Chưa có giao dịch nào.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export function CustomerAboutPage() {
  return <StorySection />
}

