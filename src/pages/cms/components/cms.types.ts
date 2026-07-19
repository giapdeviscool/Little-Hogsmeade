export type CmsTab = 'landing' | 'banners' | 'posts' | 'events' | 'featured-menu'

export type NoticeState = {
  type: 'success' | 'error'
  message: string
}

export type BannerDraft = {
  id?: string
  title: string
  subtitle: string
  imageUrl: string
  ctaUrl: string
  displayOrder: number
  isActive: boolean
  startDate?: string
  endDate?: string
}

export type ContactBlock = {
  phone: string
  email: string
  address: string
  mapLink: string
  socials: string[]
}

export type OpeningHour = {
  day: string
  hours: string
  isClosed: boolean
}

export type OpeningHoursBlock = {
  title: string
  description: string
  hours: OpeningHour[]
}

export type FeaturedMenuItem = {
  name: string
  description: string
  price: number
  imageUrl: string
  badge?: string
}

export type FeaturedMenuBlock = {
  title: string
  description: string
  items: FeaturedMenuItem[]
}
