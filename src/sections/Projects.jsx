import { useCallback, useMemo, useState } from 'react'
import { PROJECT_CATEGORIES } from '../lib/format'
import ProjectCard from '../components/project/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import { useI18n } from '../i18n/I18nProvider'

export default function Projects({ projects }) {
  const { t, lang } = useI18n()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const close = useCallback(() => setSelected(null), [])

  const available = PROJECT_CATEGORIES.filter(
    (c) => c.key === 'all' || projects.some((p) => p.category === c.key),
  )

  const handleFilterChange = (key) => {
    setFilter(key)
    setExpanded(false)
  }

  const visible = useMemo(() => {
    const list = filter === 'all' ? projects : projects.filter((p) => p.category === filter)
    return [...list].sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
  }, [projects, filter])

  return (
    <section className="section container" id="proyek">
      <div className="section-head">
        <h2 className="section-title">{t('projects.title')}</h2>
        <div className="filters-wrapper">
          <div className="filters" role="group" aria-label="Saring proyek">
            {available.map((c) => (
              <button
                key={c.key}
                type="button"
                className="filter-btn"
                aria-pressed={filter === c.key}
                onClick={() => handleFilterChange(c.key)}
              >
                {lang === 'en' ? (c.labelEn || c.label) : c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="empty">{lang === 'en' ? 'No projects in this category.' : 'Belum ada proyek di kategori ini.'}</p>
      ) : (
        <>
          <ul className={`pj-grid ${expanded ? 'is-expanded' : ''}`}>
            {visible.map((p) => (
              <li key={p.id}>
                <ProjectCard project={p} onOpen={() => setSelected(p)} />
              </li>
            ))}
          </ul>
          {visible.length > 3 && (
            <button
              type="button"
              className="pj-more-btn"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? t('projects.showLess') : `${t('projects.showAll')} (${visible.length})`}
            </button>
          )}
        </>
      )}

      <ProjectModal project={selected} onClose={close} />
    </section>
  )
}
