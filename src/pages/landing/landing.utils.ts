import type { CmsPage, Banner, Branch } from '../../types'
import { fallbackContact, fallbackHours, fallbackMenu, fallbackBooking } from './landing.constants'
import type { ContactBlock, OpeningHoursBlock, FeaturedMenuBlock, BookingDraft } from './landing.types'

export function safeParse<T>(value: string | null | undefined, fallback: T): T {
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

export function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const earthRadiusKm = 6371
  const deltaLat = toRadians(lat2 - lat1)
  const deltaLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getPageBySlug(pages: CmsPage[], slug: string) {
  return pages.find((page) => page.slug === slug) ?? null
}

export function hydrateBookingDraft(pages: CmsPage[], setDraft: (value: BookingDraft) => void) {
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
      name: banner.title || 'Món nổi bật',
      description: banner.subtitle || '',
      price: 65000 + index * 25000,
      imageUrl: banner.imageUrl,
      badge: 'Featured',
    })),
  })
}
