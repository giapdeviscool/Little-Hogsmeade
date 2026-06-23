import { type RefObject } from 'react'
import { ImagePlus } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { cn } from '../../../utils/cn'
import { formatVnDateTime } from '../../../utils/date'
import { useLocale } from '../../../hooks/useLocale'
import type { CmsPage } from '../../../types'
import type { NoticeState } from './cms.types'

export function StateShell({
  loading,
  error,
  empty,
  title,
  description,
  onRetry,
}: {
  loading: boolean
  error: string | null
  empty: boolean
  title: string
  description: string
  onRetry?: () => void
}) {
  const { t } = useLocale()
  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-4 w-96" />
          <SkeletonBlock className="h-40 w-full" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 p-6 text-red-800">
        <p className="text-sm font-semibold">{t.cms.shared.errorTitle}</p>
        <p className="mt-2 text-sm leading-6">{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-coffee px-4 py-2 text-sm font-semibold text-white">
            {t.cms.shared.retryButton}
          </button>
        )}
      </Card>
    )
  }

  if (empty) {
    return (
      <Card className="p-6">
        <EmptyPanel title={title} description={description} />
      </Card>
    )
  }

  return null
}

export function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid place-items-center rounded-[18px] border border-dashed border-latte bg-cream px-6 py-10 text-center">
      <div className="max-w-md">
        <p className="text-base font-semibold text-coffee">{title}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  )
}

export function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-[22px] font-bold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
  required?: boolean
}) {
  return (
    <label className={cn('flex flex-col gap-2 text-sm font-semibold text-coffee', className)}>
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
        className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
      />
    </label>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  className?: string
}) {
  const { t } = useLocale()
  return (
    <label className={cn('flex flex-col gap-2 text-sm font-semibold text-coffee', className)}>
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
        style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
      >
        <option value="" disabled>{t.common.selectCategory}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  )
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-12 rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
      />
    </label>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-coffee">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="rounded-[14px] border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-latte"
      />
    </label>
  )
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-[14px] border border-line bg-white px-4 py-3 text-sm font-semibold text-coffee">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn('relative h-7 w-12 rounded-full transition', checked ? 'bg-coffee' : 'bg-beige')}
      >
        <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white transition', checked ? 'left-6' : 'left-1')} />
      </button>
    </label>
  )
}

export function ImageField({
  label,
  value,
  onChange,
  onUpload,
  fileRef,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onUpload: (file: File) => Promise<void>
  fileRef: RefObject<HTMLInputElement | null>
}) {
  const { t } = useLocale()
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-coffee">{label}</label>
        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-coffee">
          <ImagePlus className="h-4 w-4" />
          {t.common.uploadImage}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void onUpload(file)
          event.currentTarget.value = ''
        }}
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t.common.imageUrlPlaceholder}
        className="h-12 w-full rounded-[14px] border border-line bg-white px-4 text-sm outline-none transition focus:border-latte"
      />
      {value ? (
        <div className="overflow-hidden rounded-[18px] border border-line bg-cream">
          <img src={value} alt={label} className="h-52 w-full object-cover" />
        </div>
      ) : null}
    </div>
  )
}

export function StatusPill({ active }: { active: boolean }) {
  const { t } = useLocale()
  return <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', active ? 'bg-emerald-100 text-emerald-700' : 'bg-beige text-muted')}>{active ? t.common.published : t.common.draft}</span>
}

export function InlineNotice({ notice }: { notice: NoticeState }) {
  return (
    <div className={cn('rounded-[16px] border px-4 py-3 text-sm', notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800')}>
      {notice.message}
    </div>
  )
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-cream px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-coffee">{value}</p>
    </div>
  )
}

export function PageSyncMeta({ page }: { page: CmsPage }) {
  const { t } = useLocale()
  return (
    <p className="mt-4 text-xs text-muted">
      Slug: {page.slug} · {t.common.updatedAt}: {formatVnDateTime(page.updatedAt ?? page.createdAt)}
    </p>
  )
}

export function SkeletonBlock({ className }: { className: string }) {
  return <div className={cn('animate-pulse rounded-md bg-beige', className)} />
}
