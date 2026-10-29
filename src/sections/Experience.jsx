import { useRef } from 'react'
import Entry from '../components/Entry'
import { useI18n } from '../i18n/I18nProvider'
import { useReveal } from '../motion/useReveal'
import SplitWords from '../components/SplitWords'

export default function Experience({ experiences }) {
  const { t, lang } = useI18n()
  const rootRef = useRef(null)
  useReveal(rootRef, [lang, experiences?.length])

  if (!experiences?.length) return null
  return (
    <section className="section" id="pengalaman" ref={rootRef}>
      <div className="container">
        <h2 className="sec-title" data-reveal="words"><SplitWords text={t('experience.title')} /></h2>
        <ol className="entries-list">
          {experiences.map((item, i) => (
            <Entry key={item.id} item={item} type="experience" index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
