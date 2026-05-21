import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[16px] border border-line bg-cream shadow-soft ${className}`}>{children}</section>
}
