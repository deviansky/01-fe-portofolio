import { useRef } from 'react'
import Entry from '../components/Entry'
import { useI18n } from '../i18n/I18nProvider'
import { useReveal } from '../motion/useReveal'
import SplitWords from '../components/SplitWords'

export default function Education({ educations = [], certifications = [] }) {
  const { t, lang } = useI18n()
  const rootRef = useRef(null)
  useReveal(rootRef, [lang, educations.length, certifications.length])

  if (!educations.length && !certifications.length) return null
  return (
    <section className="section" id="pendidikan" ref={rootRef}>
      <div className="container">
        <h2 className="sec-title" data-reveal="words"><SplitWords text={t('education.title')} /></h2>
        {educations.length > 0 && (
          <ol className="entries-list">
            {educations.map((item, i) => (
              <Entry key={item.id} item={item} type="education" index={i + 2} />
            ))}
          </ol>
        )}
        {certifications.length > 0 && (
          <div className="certifications-block" data-reveal="up">
            <h3 className="sub-title">{lang === 'en' ? 'Certifications' : 'Sertifikasi'}</h3>
            <ul className="plain-list">
              {certifications.map((c) => (
                <li key={c.id}>
                  {c.credential_url ? (
                    <a href={c.credential_url} target="_blank" rel="noreferrer">{c.name}</a>
                  ) : c.name}
                  <span className="muted">, {c.issuer}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
