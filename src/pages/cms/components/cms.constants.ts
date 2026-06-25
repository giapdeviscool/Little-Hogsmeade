import type { CmsPagePayload, EventPayload } from '../../../types'
import type { BannerDraft, ContactBlock, OpeningHoursBlock, FeaturedMenuBlock, CmsTab } from './cms.types'

export const cmsTabKeys: CmsTab[] = ['landing', 'posts', 'events', 'featured-menu'] //promotions 

export const landingPageSlugs = {
  landingPage: 'landing-page',
  contact: 'landing-contact',
  openingHours: 'landing-opening-hours',
  featuredMenu: 'landing-featured-menu',
}

export const dayOptions = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

export const defaultLandingPageDraft: CmsPagePayload = {
  slug: 'landing-page',
  title: '',
  content: '',
  imageUrl: '',
  aboutTitle: '',
  aboutContent: '',
  yearsOfExperience: 0,
  isPublished: true,
}

export const defaultContactBlock: ContactBlock = {
  phone: '1900 6868',
  email: 'hello@littlehogsmeade.vn',
  address: '12 Đồng Khởi, Quận 1, TP.HCM',
  mapLink: 'https://maps.google.com',
  socials: ['Instagram', 'Facebook', 'TikTok'],
}

export const defaultOpeningHoursBlock: OpeningHoursBlock = {
  title: 'Giờ mở cửa',
  description: 'Khung giờ áp dụng cho toàn hệ thống',
  hours: dayOptions.map((day, index) => ({
    day,
    hours: index === 6 ? '08:00 - 22:00' : '07:00 - 23:00',
    isClosed: false,
  })),
}

export const defaultFeaturedMenuBlock: FeaturedMenuBlock = {
  title: 'Món nổi bật',
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

export const defaultBannerDraft: BannerDraft = {
  title: 'Mùa mới tại Little Hogsmeade',
  description: 'Bữa sáng, cà phê và cocktail trong không gian ấm cúng.',
  imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=90',
  ctaLabel: 'Khám phá ngay',
  ctaHref: '/menu',
  sortOrder: 1,
  isActive: true,
}

export const emptyEventDraft: EventPayload = {
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
