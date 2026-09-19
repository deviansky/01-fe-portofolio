import { SKILL_CATEGORIES } from '../lib/format'
import { useI18n } from '../i18n/I18nProvider'

export default function Skills({ skills }) {
  const { t, lang } = useI18n()

  const groups = SKILL_CATEGORIES
    .map((c) => ({
      ...c,
      translatedLabel: t(`skills.categories.${c.key}`) || (lang === 'en' ? (c.labelEn || c.label) : c.label),
      items: skills.filter((s) => s.category === c.key),
    }))
    .filter((g) => g.items.length)

  return (
    <section className="section container split" id="keahlian">
      <h2 className="section-title">{t('skills.title')}</h2>
      <div className="split-body skill-grid">
        {groups.map((g) => (
          <div key={g.key} className="skill-group">
            <h3>{g.translatedLabel}</h3>
            <ul>{g.items.map((s) => <li key={s.id}>{s.name}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  )
}
