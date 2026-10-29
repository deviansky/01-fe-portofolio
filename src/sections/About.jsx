import { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { useReveal } from '../motion/useReveal'
import SplitWords from '../components/SplitWords'

export default function About({ profile, education }) {
  const { t, lang } = useI18n()
  const isEn = lang === 'en'
  const rootRef = useRef(null)
  useReveal(rootRef, [lang])

  const bio = Array.isArray(profile.bio) ? profile.bio : [profile.bio].filter(Boolean)
  const [statement, ...rest] = bio
  const focus = profile.focus_areas ?? []

  return (
    <section className="section ab" id="tentang" ref={rootRef}>
      <div className="container">
        <h2 className="sec-title" data-reveal="words"><SplitWords text={t('about.title')} /></h2>

        {statement && (
          <p className="ab-statement" data-reveal="scrub"><SplitWords text={statement} /></p>
        )}

        <div className="ab-grid">
          <dl className="facts" data-reveal="up">
            {profile.location && (<div><dt>{isEn ? 'Location' : 'Lokasi'}</dt><dd>{profile.location}</dd></div>)}
            {education && (<div><dt>{isEn ? 'Education' : 'Pendidikan'}</dt><dd>{[education.degree, education.field].filter(Boolean).join(' ')}, {education.institution}</dd></div>)}
            <div><dt>Status</dt><dd>{profile.available_for_work ? (isEn ? 'Open for new projects and roles' : 'Terbuka untuk proyek dan posisi baru') : (isEn ? 'Currently not accepting new projects' : 'Belum menerima proyek baru')}</dd></div>
          </dl>
          {rest.length > 0 && (
            <div className="ab-bio" data-reveal="up" data-reveal-delay="0.1">
              {rest.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}
        </div>

        {focus.length > 0 && (
          <div className="ab-focus">
            <h3 className="sub-title" data-reveal="up">{t('about.focusTitle')}</h3>
            <ol className="rows">
              {focus.map((f, i) => (
                <li key={f.title} className="row" data-reveal="up" style={{ '--row-color': `var(--v-r${(i % 4) + 1})` }}>
                  <span className="row-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="row-title">{f.title}</span>
                  <span className="row-aside">{f.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}
