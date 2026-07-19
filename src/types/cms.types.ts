export type CmsPage = {
  id: string
  branchId: string | null
  slug: string
  title: string
  content: string
  imageUrl: string | null
  aboutTitle: string | null
  aboutContent: string | null
  yearsOfExperience: number | null
  isPublished: boolean
  updatedAt?: string | null
  createdAt?: string | null
}

export type CmsPagePayload = {
  slug: string
  title: string
  content: string
  imageUrl?: string | null
  aboutTitle?: string | null
  aboutContent?: string | null
  yearsOfExperience?: number | null
  isPublished: boolean
}

export type Banner = {
  id: string
  title?: string | null
  subtitle?: string | null
  imageUrl: string
  ctaUrl?: string | null
  displayOrder: number
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

export type BannerPayload = {
  title?: string
  subtitle?: string
  imageUrl: string
  ctaUrl?: string
  displayOrder: number
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
}

export type Post = {
  id: string
  title: string
  slug: string
  thumbnailUrl: string
  content: string
  category: string
  tags: string
  isPublished: boolean
  publishedAt?: string | null
  updatedAt?: string | null
  createdAt?: string | null
  authorId?: string
}

export type PostPayload = {
  title: string
  slug: string
  thumbnailUrl: string
  content: string
  category: string
  tags: string
  isPublished: boolean
  publishedAt?: string | null
  authorId?: string
}

export type Event = {
  id: string
  branchId: string
  title: string
  description: string
  thumbnailUrl: string
  eventDate: string
  startTime: string
  endTime: string
  locationNote: string
  ticketPrice: number
  isPublished: boolean
  updatedAt?: string | null
  createdAt?: string | null
}

export type EventPayload = {
  branchId: string
  title: string
  description: string
  thumbnailUrl: string
  eventDate: string
  startTime: string
  endTime: string
  locationNote: string
  ticketPrice: number
  isPublished: boolean
}

export type Promotion = {
  id: string
  name: string
  description: string
  discountInfo: string
  applicableProducts: string[]
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'draft'
  updatedAt?: string | null
  createdAt?: string | null
}

export type PromotionPayload = {
  name: string
  description: string
  discountInfo: string
  applicableProducts: string[]
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'draft'
}

export type UploadImageResponse = {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  bytes: number
}

export type LandingBlockKey = 'banner' | 'contact' | 'opening-hours' | 'featured-menu'

