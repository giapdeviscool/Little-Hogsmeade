import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  label?: string
}

export function Pagination({ page, totalPages, total, onPageChange, label = 'mục' }: PaginationProps) {
  // Build page number array with ellipsis
  const pages: (number | '...')[] = []
  const maxVisible = 5
  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    if (start > 2) pages.push('...')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted">
        Tổng <span className="font-semibold text-coffee">{total}</span> {label} · Trang <span className="font-semibold text-coffee">{page}</span>/{totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-coffee transition hover:bg-cream disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-1 text-sm text-muted">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                'inline-flex h-9 min-w-[36px] items-center justify-center rounded-full border text-sm font-semibold transition',
                p === page
                  ? 'border-coffee bg-coffee text-white shadow-soft'
                  : 'border-line bg-white text-coffee hover:bg-cream',
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-coffee transition hover:bg-cream disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
