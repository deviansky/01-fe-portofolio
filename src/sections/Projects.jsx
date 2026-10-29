import { useMemo, useState, useRef, useEffect } from 'react'
import { PROJECT_CATEGORIES } from '../lib/format'
import WorkCard from '../components/project/WorkCard'
import { useI18n } from '../i18n/I18nProvider'
import { useReveal } from '../motion/useReveal'
import SplitWords from '../components/SplitWords'
import Cta from '../components/Cta'

/**
 * Daftar proyek ala cuberto.com/projects: judul besar + jumlah, filter pill,
 * grid 2 kolom yang kolom kanannya turun (stagger), kartu menuju halaman detail.
 * `limit` → mode cuplikan untuk beranda: tanpa filter, ada tombol ke /proyek.
 */
export default function Projects({ projects, limit }) {
  const { t, lang } = useI18n()
  const isEn = lang === 'en'
  const [filter, setFilter] = useState('all')
  const filterBtnsRef = useRef({})
  const rootRef = useRef(null)
  const preview = Boolean(limit)

  const available = PROJECT_CATEGORIES.filter(
    (c) => c.key === 'all' || projects.some((p) => p.category === c.key),
  )

  // Geser baris filter (horizontal saja) supaya filter aktif terlihat,
  // tanpa ikut menggulir halaman seperti scrollIntoView.
  useEffect(() => {
    const activeEl = filterBtnsRef.current[filter]
    const row = activeEl?.parentElement
    if (!row || row.scrollWidth <= row.clientWidth) return
    const left = activeEl.offsetLeft - (row.clientWidth - activeEl.offsetWidth) / 2
    row.scrollTo({ left, behavior: 'smooth' })
  }, [filter])

  const visible = useMemo(() => {
    const list = filter === 'all' ? projects : projects.filter((p) => p.category === filter)
    const sorted = [...list].sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    return preview ? sorted.slice(0, limit) : sorted
  }, [projects, filter, preview, limit])

  useReveal(rootRef, [lang, filter, visible.length])

  const Title = preview ? 'h2' : 'h1'

  return (
    <section className={`section wk ${preview ? 'wk--preview' : ''}`} ref={rootRef}>
      <div className="container">
        <header className="wk-head">
          <Title className="wk-title">
            <span data-reveal="words"><SplitWords text={preview ? (isEn ? 'Selected work' : 'Karya pilihan') : t('nav.projects')} /></span>
            <sup className="wk-count" data-reveal="up" data-reveal-delay="0.2">{projects.length}</sup>
          </Title>
          <p className="wk-lead" data-reveal="up">{t('projects.subtitle')}</p>
        </header>

        {!preview && (
          <div className="wk-filters" data-reveal="up">
            <div className="filters" role="group" aria-label={isEn ? 'Filter projects' : 'Saring proyek'}>
              {available.map((c) => {
                const count = c.key === 'all' ? projects.length : projects.filter((p) => p.category === c.key).length
                return (
                  <button
                    key={c.key}
                    ref={(el) => (filterBtnsRef.current[c.key] = el)}
                    type="button"
                    className="filter-btn"
                    aria-pressed={filter === c.key}
                    onClick={() => setFilter(c.key)}
                  >
                    {isEn ? (c.labelEn || c.label) : c.label}
                    <sup>{count}</sup>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {visible.length === 0 ? (
          <p className="empty">{isEn ? 'No projects in this category.' : 'Belum ada proyek di kategori ini.'}</p>
        ) : (
          <ul className="wk-grid">
            {visible.map((p) => (
              <li key={p.id} className="wk-item">
                <WorkCard project={p} />
              </li>
            ))}
          </ul>
        )}

        {preview && projects.length > visible.length && (
          <div className="wk-more" data-reveal="up">
            <Cta href="/proyek" variant="outline" size="lg" data-pt-label={t('nav.projects')}>
              {`${t('projects.showAll')} (${projects.length})`}
            </Cta>
          </div>
        )}
      </div>
    </section>
  )
}
