import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Search } from 'lucide-react'
import { LanguageSwitch } from '../components/ui/LanguageSwitch'
import { listPages } from '../api/cms.api'
import type { CmsPage } from '../types'
import { ROUTES } from '../constants/routes'
import { getAuthSession } from '../store/auth.store'

type ContactBlock = {
  phone: string
  email: string
  address: string
  mapLink: string
  socials: string[]
}

type OpeningHoursBlock = {
  title: string
  description: string
  hours: Array<{
    day: string
    hours: string
    isClosed: boolean
  }>
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

function getPageBySlug(pages: CmsPage[], slug: string) {
  return pages.find((page) => page.slug === slug) ?? null
}

function getContactBlock(pages: CmsPage[]) {
  return safeParse<ContactBlock>(getPageBySlug(pages, 'landing-contact')?.content, fallbackContact)
}

function getOpeningHoursBlock(pages: CmsPage[]) {
  return safeParse<OpeningHoursBlock>(getPageBySlug(pages, 'landing-opening-hours')?.content, fallbackHours)
}

export function CustomerLayout() {
  const [pages, setPages] = useState<CmsPage[]>([])
  const session = getAuthSession()
  const user = session?.user
  const isEmployee = user && user.role !== 'Customer' && user.roleName?.toLowerCase() !== 'customer'

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const pageResponse = await listPages()
        if (alive) {
          setPages(normalizeList<CmsPage>(pageResponse.data))
        }
      } catch (error) {
        // ignore error for layout
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  const contactBlock = getContactBlock(pages)
  const openingHoursBlock = getOpeningHoursBlock(pages)

  return (
    <div className="relative min-h-screen bg-white text-coffee">
      <header className="sticky top-0 z-50 border-b border-line/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[80px] max-w-[1440px] items-center gap-4 px-4 md:px-8 lg:px-14">
          <Link to={ROUTES.customerHome} className="mr-auto text-[22px] font-bold tracking-[-0.04em] md:text-[24px]">
            Little Hogsmeade
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-semibold xl:flex">
            <Link to={ROUTES.customerHome}>Trang chủ</Link>
            <Link to={ROUTES.customerMenu}>Thực đơn</Link>
            <Link to={ROUTES.customerPromotions}>Sự kiện & KM</Link>
            <Link to={ROUTES.customerBlog}>Tin tức</Link>
            <Link to={ROUTES.customerStores}>Cửa hàng</Link>
            <Link to={ROUTES.customerMembership}>Thành viên</Link>
          </nav>
          <button type="button" aria-label="Tìm kiếm" className="hidden rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-coffee md:inline-flex">
            <Search className="h-4 w-4" />
          </button>
          <LanguageSwitch />
          
          <div className="flex items-center gap-3">
            {user ? (
              <Link to={isEmployee ? ROUTES.home : ROUTES.customerMembership} className="hidden text-sm font-semibold text-coffee hover:underline md:block">
                {isEmployee ? 'Bảng điều khiển' : 'Tài khoản'}
              </Link>
            ) : (
              <Link to={ROUTES.login} className="hidden text-sm font-semibold text-coffee hover:underline md:block">
                Đăng nhập
              </Link>
            )}
            <Link to={ROUTES.customerBooking} className="rounded-full bg-coffee px-4 py-2.5 text-sm font-semibold text-white shadow-soft md:px-5">
              Đặt bàn ngay
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-80px-400px)]">
        <Outlet />
      </main>

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
    </div>
  )
}
