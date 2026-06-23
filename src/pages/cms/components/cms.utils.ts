import type { CmsPage, Banner, CmsPagePayload } from '../../../types'
import { landingPageSlugs, defaultLandingPageDraft, defaultContactBlock, defaultOpeningHoursBlock, defaultFeaturedMenuBlock } from './cms.constants'
import type { ContactBlock, OpeningHoursBlock, FeaturedMenuBlock } from './cms.types'

export function getPageBySlug(pages: CmsPage[], slug: string) {
  const pageList = normalizeList<CmsPage>(pages)
  return pageList.find((page) => page.slug === slug) ?? null
}

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

export function hydrateLandingBlocks(
  pages: CmsPage[],
  banners: Banner[],
  setContactDraft: (value: ContactBlock) => void,
  setOpeningHoursDraft: (value: OpeningHoursBlock) => void,
  setFeaturedMenuDraft: (value: FeaturedMenuBlock) => void,
  setLandingPageDraft: (value: CmsPagePayload) => void,
) {
  const landingPage = getPageBySlug(pages, landingPageSlugs.landingPage)
  if (landingPage) {
    setLandingPageDraft({
      slug: landingPage.slug,
      title: landingPage.title,
      content: landingPage.content,
      imageUrl: landingPage.imageUrl,
      aboutTitle: landingPage.aboutTitle,
      aboutContent: landingPage.aboutContent,
      yearsOfExperience: landingPage.yearsOfExperience,
      isPublished: landingPage.isPublished,
    })
  } else {
    setLandingPageDraft(defaultLandingPageDraft)
  }

  const contact = safeParse<ContactBlock>(getPageBySlug(pages, landingPageSlugs.contact)?.content, defaultContactBlock)
  const openingHours = safeParse<OpeningHoursBlock>(getPageBySlug(pages, landingPageSlugs.openingHours)?.content, defaultOpeningHoursBlock)
  const featuredMenu = safeParse<FeaturedMenuBlock>(getPageBySlug(pages, landingPageSlugs.featuredMenu)?.content, {
    ...defaultFeaturedMenuBlock,
    items: banners.slice(0, 3).map((banner) => ({
      name: banner.title,
      description: banner.description ?? '',
      price: 65000,
      imageUrl: banner.imageUrl,
      badge: banner.ctaLabel ?? undefined,
    })),
  })

  setContactDraft(contact)
  setOpeningHoursDraft(openingHours)
  setFeaturedMenuDraft(featuredMenu)
}
