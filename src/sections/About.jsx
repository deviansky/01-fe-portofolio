import { useI18n } from '../i18n/I18nProvider'

export default function About({ profile, education }) {
  const { t, lang } = useI18n()
  const isEn = lang === 'en'

  return (
    <section className="section container split" id="tentang">
      <h2 className="section-title">{t('about.title')}</h2>
      <div className="split-body">
        <div className="prose">
          {Array.isArray(profile.bio) ? profile.bio.map((p, i) => <p key={i}>{p}</p>) : <p>{profile.bio}</p>}
        </div>
        <dl className="facts">
          {profile.location && (<div><dt>{isEn ? 'Location' : 'Lokasi'}</dt><dd>{profile.location}</dd></div>)}
          {education && (<div><dt>{isEn ? 'Education' : 'Pendidikan'}</dt><dd>{[education.degree, education.field].filter(Boolean).join(' ')}, {education.institution}</dd></div>)}
          <div><dt>{isEn ? 'Status' : 'Status'}</dt><dd>{profile.available_for_work ? (isEn ? 'Open for new projects and roles' : 'Terbuka untuk proyek dan posisi baru') : (isEn ? 'Currently not accepting new projects' : 'Belum menerima proyek baru')}</dd></div>
        </dl>
      </div>
    </section>
  )
}
