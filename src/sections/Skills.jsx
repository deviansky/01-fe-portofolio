import { useRef } from 'react'
import { SKILL_CATEGORIES } from '../lib/format'
import { useI18n } from '../i18n/I18nProvider'
import { useReveal } from '../motion/useReveal'
import SplitWords from '../components/SplitWords'
import Marquee from '../components/Marquee'

export default function Skills({ skills }) {
  const { t, lang } = useI18n()
  const rootRef = useRef(null)
  useReveal(rootRef, [lang])

  const groups = SKILL_CATEGORIES
    .map((c) => ({
      ...c,
      translatedLabel: t(`skills.categories.${c.key}`) || (lang === 'en' ? (c.labelEn || c.label) : c.label),
      items: skills.filter((s) => s.category === c.key),
    }))
    .filter((g) => g.items.length)

  // marquee dekoratif: semua teknologi kecuali soft skill
  const names = skills.filter((s) => s.category !== 'soft_skill').map((s) => s.name)

  return (
    <section className="section sk" id="keahlian" ref={rootRef}>
      <div className="container">
        <h2 className="sec-title" data-reveal="words"><SplitWords text={t('skills.title')} /></h2>
        <p className="sec-lead" data-reveal="up">{t('skills.subtitle')}</p>
      </div>

      {names.length > 0 && <Marquee items={names} duration={40} className="sk-marquee" />}

      <div className="container">
        <div className="skill-grid">
          {groups.map((g, i) => (
            <div key={g.key} className="skill-group" data-reveal="up" data-reveal-delay={(i % 3) * 0.08}>
              <h3>{g.translatedLabel}</h3>
              <ul>{g.items.map((s) => <li key={s.id}>{s.name}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
