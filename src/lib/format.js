const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' })

export function formatPeriod(start, end, isCurrent) {
  if (!start) return ''
  const startDate = new Date(start)
  const endDate = isCurrent || !end ? new Date(2026, 8, 1) : new Date(end)
  const from = monthYear.format(startDate)
  const to = isCurrent || !end ? 'Saat ini' : monthYear.format(new Date(end))

  const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1
  const duration = monthsDiff > 0 ? ` (${monthsDiff} bln)` : ''
  return `${from} – ${to}${duration}`
}

export const SKILL_CATEGORIES = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'database', label: 'Database' },
  { key: 'tools', label: 'Tools & praktik kerja' },
]

export const PROJECT_CATEGORIES = [
  { key: 'all', label: 'Semua' },
  { key: 'erp', label: 'ERP & sistem internal' },
  { key: 'web', label: 'Web' },
  { key: 'mobile', label: 'Mobile' },
]

export const categoryLabel = (key) =>
  PROJECT_CATEGORIES.find((c) => c.key === key)?.label ?? key
