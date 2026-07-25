export function stripHtml(html: string): string {
  if (typeof window === 'undefined') return html
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
}

export function formatHtml(html: string): string {
  if (!html) return ''
  return html.replace(/&nbsp;/g, ' ')
}
