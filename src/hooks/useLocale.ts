import { useContext } from 'react'
import { LocaleContext } from '../locales/locale-context'

export function useLocale() {
  return useContext(LocaleContext)
}
