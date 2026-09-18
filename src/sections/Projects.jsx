import { useCallback, useMemo, useState } from 'react'
import { PROJECT_CATEGORIES, categoryLabel } from '../lib/format'
import ProjectCover from '../components/ProjectCover'
import ProjectModal from '../components/ProjectModal'

const MAX_STACK = 3

export default function Projects({ projects }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const close = useCallback(() => setSelected(null), [])

  const available = PROJECT_CATEGORIES.filter(
    (c) => c.key === 'all' || projects.some((p) => p.category === c.key),
  )

  const visible = useMemo(() => {
    const list = filter === 'all' ? projects : projects.filter((p) => p.category === filter)
    return [...list].sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
  }, [projects, filter])

  return (
    <section className="section container" id="proyek">
      <div className="section-head">
        <h2 className="section-title">Proyek</h2>
        <div className="filters" role="group" aria-label="Saring proyek">
          {available.map((c) => (
            <button key={c.key} type="button" className="filter-btn"
              aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="empty">Belum ada proyek di kategori ini.</p>
      ) : (
        <ul className="pj-grid">
          {visible.map((p) => {
            const extra = (p.stack?.length ?? 0) - MAX_STACK
            return (
              <li key={p.id}>
                <article className="pj-card">
                  <ProjectCover project={p} />
                  <div className="pj-card-body">
                    <p className="pj-meta">
                      <span>{categoryLabel(p.category)}</span>
                      {p.year && <span>{p.year}</span>}
                    </p>
                    <h3 className="pj-title">
                      {/* ::after tombol ini menutupi seluruh kartu, jadi seluruh kartu bisa diklik */}
                      <button type="button" className="pj-open" onClick={() => setSelected(p)}>
                        {p.title}
                      </button>
                    </h3>
                    {p.role && <p className="pj-role">{p.role}</p>}
                    <p className="pj-summary">{p.summary}</p>
                    <div className="pj-foot">
                      <span className="pj-stack">
                        {p.stack?.slice(0, MAX_STACK).join(', ')}
                        {extra > 0 && ` +${extra}`}
                      </span>
                      {p.is_confidential && <span className="pj-internal">Internal</span>}
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}

      <ProjectModal project={selected} onClose={close} />
    </section>
  )
}
