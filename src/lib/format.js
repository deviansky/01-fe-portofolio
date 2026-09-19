export function formatPeriod(start, end, isCurrent, lang = 'id') {
  if (!start) return ''
  const isEn = lang === 'en'
  const locale = isEn ? 'en-US' : 'id-ID'
  const monthYear = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' })

  const startDate = new Date(start)
  const endDate = isCurrent || !end ? new Date(2026, 8, 1) : new Date(end)
  const from = monthYear.format(startDate)
  const to = isCurrent || !end ? (isEn ? 'Present' : 'Saat ini') : monthYear.format(new Date(end))

  const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1
  const monthUnit = isEn ? 'mos' : 'bln'
  const duration = monthsDiff > 0 ? ` (${monthsDiff} ${monthUnit})` : ''
  return `${from} – ${to}${duration}`
}

export const SKILL_CATEGORIES = [
  { key: 'frontend', label: 'Frontend', labelEn: 'Frontend' },
  { key: 'backend', label: 'Backend', labelEn: 'Backend' },
  { key: 'visual_data', label: 'Visual Data', labelEn: 'Visual Data' },
  { key: 'ml_cv', label: 'ML & CV', labelEn: 'ML & CV' },
  { key: 'tools', label: 'Tools', labelEn: 'Tools' },
  { key: 'soft_skill', label: 'Soft Skill', labelEn: 'Soft Skill' },
]

export const PROJECT_CATEGORIES = [
  { key: 'all', label: 'Semua', labelEn: 'All' },
  { key: 'erp', label: 'ERP & sistem internal', labelEn: 'ERP & internal systems' },
  { key: 'web', label: 'Web', labelEn: 'Web' },
  { key: 'mobile', label: 'Mobile', labelEn: 'Mobile' },
]

export const categoryLabel = (key, lang = 'id') => {
  const cat = PROJECT_CATEGORIES.find((c) => c.key === key)
  if (!cat) return key
  return lang === 'en' ? (cat.labelEn || cat.label) : cat.label
}
