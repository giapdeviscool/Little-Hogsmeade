import { createContext } from 'react'
import { defaultLocale, locales } from '.'
import type { Locale } from '../types'

export type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (typeof locales)[Locale]
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  setLocale: () => undefined,
  t: locales[defaultLocale],
})
