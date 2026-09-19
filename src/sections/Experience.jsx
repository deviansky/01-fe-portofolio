import Entry from '../components/Entry'
import { useI18n } from '../i18n/I18nProvider'

export default function Experience({ experiences }) {
  const { t } = useI18n()
  if (!experiences?.length) return null
  return (
    <section className="section container split" id="pengalaman">
      <h2 className="section-title">{t('experience.title')}</h2>
      <div className="split-body entries-list">
        {experiences.map((item) => (
          <Entry key={item.id} item={item} type="experience" />
        ))}
      </div>
    </section>
  )
}
