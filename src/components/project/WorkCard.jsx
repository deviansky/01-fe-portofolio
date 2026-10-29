import { Link } from 'react-router-dom'
import { categoryLabel } from '../../lib/format'
import ProjectCover from '../ProjectCover'
import { projectColor } from '../../lib/projectColor'
import { useI18n } from '../../i18n/I18nProvider'

/**
 * Kartu proyek gaya cuberto: sampul besar membulat, di bawahnya
 * "Judul — ringkasan" dalam satu paragraf, lalu tag kecil. Seluruh kartu
 * adalah link ke halaman detail (ikut transisi lembaran).
 */
export default function WorkCard({ project }) {
  const { lang } = useI18n()
  const color = projectColor(project)
  const tags = [
    categoryLabel(project.category, lang),
    project.year,
    project.is_confidential && 'Internal',
    ...(project.stack ?? []).slice(0, 3),
  ].filter(Boolean)

  return (
    <Link
      to={`/proyek/${project.slug}`}
      className="wk-card"
      data-pt-label={project.title}
      data-cursor-text={lang === 'en' ? 'View' : 'Lihat'}
      data-cursor-color={color.bg}
      data-cursor-ink={color.fg}
    >
      <div className="wk-media" data-reveal="clip">
        <ProjectCover project={project} parallax />
      </div>
      <div className="wk-info" data-reveal="up">
        <h3 className="wk-name">
          {project.title}
          {project.summary && <span className="wk-desc"> — {project.summary}</span>}
        </h3>
        <ul className="wk-tags" aria-label="Tag">
          {tags.map((tag, i) => <li key={`${i}-${tag}`}>{tag}</li>)}
        </ul>
      </div>
    </Link>
  )
}
