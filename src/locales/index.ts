import en from './en.json'
import vi from './vi.json'
import type { Locale } from '../types'

export const locales = {
  vi,
  en,
} as const

export const defaultLocale: Locale = 'vi'
