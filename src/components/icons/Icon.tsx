const paths: Record<string, string> = {
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  cart: 'M5 6h2l1.2 9h8.8l2-6H8.6M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2M17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
  service: 'M7 3v8M11 3v8M9 3v18M17 3v18M15 3h4v8h-4',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M3 21a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M19 21a5 5 0 0 0-4-4.9',
  building: 'M5 21V5l8-3v19M13 7h6v14M8 8h1M8 12h1M8 16h1M16 11h1M16 15h1',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  loyalty: 'M12 21s-7.5-4.1-7.5-9.5A4.5 4.5 0 0 1 12 7.5a4.5 4.5 0 0 1 7.5 4c0 5.4-7.5 9.5-7.5 9.5M9.5 11.5l1.8 1.8 3.7-3.7',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4',
  logout: 'M10 17l5-5-5-5M15 12H3M21 4v16',
  bell: 'M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16zM10 20h4',
  search: 'M11 19a8 8 0 1 1 5.7-2.3L21 21',
  chevronDown: 'M6 9l6 6 6-6',
}

export function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
