import type { ReactNode } from 'react'

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

export function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <Field label={label}>
      <input className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm" type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </Field>
  )
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

export function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-beige text-muted'}`}>{status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</span>
}
