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
