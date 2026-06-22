import type { ReactNode } from 'react'
import { Card } from '../../../components/ui/Card'
import { cn } from '../../../utils/cn'

export function LandingLoading({ embedded }: { embedded: boolean }) {
  return (
    <div className={cn('space-y-6 p-6', !embedded && 'pt-20')}>
      <div className="h-[320px] animate-pulse rounded-[28px] bg-cream" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[260px] animate-pulse rounded-[24px] bg-cream" />
        <div className="h-[260px] animate-pulse rounded-[24px] bg-cream" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-[160px] animate-pulse rounded-[20px] bg-cream" />
        <div className="h-[160px] animate-pulse rounded-[20px] bg-cream" />
        <div className="h-[160px] animate-pulse rounded-[20px] bg-cream" />
      </div>
    </div>
  )
}

export function LandingError({ embedded, message, onRetry }: { embedded: boolean; message: string; onRetry: () => void }) {
  return (
    <div className={cn('mx-auto max-w-2xl p-6', !embedded && 'pt-24')}>
      <Card className="border-red-200 bg-red-50 p-6 text-red-800">
        <p className="text-sm font-semibold">Không tải được Landing Page</p>
        <p className="mt-2 text-sm leading-6">{message}</p>
        <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-coffee px-4 py-2 text-sm font-semibold text-white">
          Tải lại
        </button>
      </Card>
    </div>
  )
}

export function MiniBlock({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-coffee">{title}</p>
      <p className="mt-1 text-xs text-muted">{description}</p>
      <div className="mt-4">{children}</div>
    </Card>
  )
}

export function LandingInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-bold">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        className="h-12 rounded-[12px] border border-line bg-cream px-4 text-sm outline-none focus:border-latte"
      />
    </label>
  )
}
