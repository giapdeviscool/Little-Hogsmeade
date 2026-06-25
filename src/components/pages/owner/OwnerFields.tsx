import type { ReactNode } from 'react'

import { Globe, MapPin } from 'lucide-react'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-coffee">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}

export function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <input className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  )
}

export function NumberField({ label, value, onChange, emphasized = false, }: { label: string; value: number; onChange: (value: number) => void; emphasized?: boolean }) {
  const input = (
    <input
      className={
        emphasized
          ? 'h-9 w-full rounded-lg border-2 border-coffee bg-white px-3 text-base font-semibold text-coffee'
          : 'h-9 w-full rounded-lg border border-line bg-white px-3 text-sm'
      }
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  )

  if (!label) return input

  return <Field label={label}>{input}</Field>
}

export function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <input className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm" type="time" value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  )
}

export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <input className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm" type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  )
}

export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2 text-sm last:border-b-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-coffee text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-beige text-muted'}`}>{status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</span>
}

export function ScopeBadge({ scope, branchCount }: { scope: 'global' | 'specific'; branchCount?: number }) {
  const isGlobal = scope === 'global'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-beige px-2.5 py-1 text-xs font-medium text-coffee">
      {isGlobal ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
      {isGlobal ? 'Toàn chuỗi' : `${branchCount || 0} chi nhánh`}
    </span>
  )
}
