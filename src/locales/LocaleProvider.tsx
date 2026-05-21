import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultLocale, locales } from '.'
import { LocaleContext } from './locale-context'
import type { Locale } from '../types'

const STORAGE_KEY = 'little-hogsmeade-locale'

function isLocale(value: string | null): value is Locale {
  return value === 'vi' || value === 'en'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const storedLocale = localStorage.getItem(STORAGE_KEY)
    return isLocale(storedLocale) ? storedLocale : defaultLocale
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, t: locales[locale] }), [locale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
