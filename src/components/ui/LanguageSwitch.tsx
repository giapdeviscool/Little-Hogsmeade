import { useLocale } from '../../hooks/useLocale'
import { cn } from '../../utils/cn'
import type { Locale } from '../../types'

const options: Array<{ label: string; value: Locale }> = [
  { label: 'VI', value: 'vi' },
  { label: 'EN', value: 'en' },
]

export function LanguageSwitch({ tone = 'light' }: { tone?: 'light' | 'glass' }) {
  const { locale, setLocale } = useLocale()

  return (
    <div className={cn('inline-flex rounded-full p-1', tone === 'glass' ? 'bg-white/15 text-white backdrop-blur' : 'border border-line bg-white text-coffee')}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-bold transition',
            locale === option.value ? (tone === 'glass' ? 'bg-white text-coffee' : 'bg-coffee text-white') : tone === 'glass' ? 'text-white/75' : 'text-muted',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
