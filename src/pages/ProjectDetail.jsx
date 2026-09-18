import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import Stack from '../components/Stack'
import { categoryLabel } from '../lib/format'
import NotFound from './NotFound'

export default function ProjectDetail({ data, source }) {
  const { slug } = useParams()
  const fromList = data.projects.find((p) => p.slug === slug)
  const [project, setProject] = useState(fromList)

  // Data list hanya ringkasan; detail lengkap (deskripsi, gambar) diambil dari API.
  useEffect(() => {
    if (source !== 'api') return
    const controller = new AbortController()
    api.getProject(slug, controller.signal)
      .then(setProject)
      .catch((err) => { if (err.name !== 'AbortError') console.warn(err.message) })
    return () => controller.abort()
  }, [slug, source])

  useEffect(() => {
    if (project) document.title = `${project.title} | ${data.profile.name}`
  }, [project, data.profile.name])

  if (!project) return <NotFound />

  return (
    <article className="container detail">
      <Link to="/#proyek" className="back-link">Semua proyek</Link>

      <header className="detail-head">
        <h1>{project.title}</h1>
        <p className="detail-summary">{project.summary}</p>
        <dl className="detail-meta">
          <div><dt>Peran</dt><dd>{project.role}</dd></div>
          <div><dt>Tahun</dt><dd>{project.year}</dd></div>
          <div><dt>Kategori</dt><dd>{categoryLabel(project.category)}</dd></div>
        </dl>
        <Stack items={project.stack} />
      </header>

      {project.thumbnail_url && (
        <img className="detail-cover" src={project.thumbnail_url} alt={`Tampilan ${project.title}`} />
      )}

      <div className="prose detail-body">
        {project.description && <p>{project.description}</p>}
        {project.highlights?.length > 0 && (
          <>
            <h2>Yang saya kerjakan</h2>
            <ul className="ticks">{project.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </>
        )}
      </div>

      {project.images?.length > 0 && (
        <div className="gallery">
          {project.images.map((img) => (
            <figure key={img.url}>
              <img src={img.url} alt={img.caption || project.title} loading="lazy" />
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      <div className="detail-links">
        {project.demo_url && <a className="btn btn-primary" href={project.demo_url} target="_blank" rel="noreferrer">Buka situs</a>}
        {project.repo_url && <a className="btn btn-ghost" href={project.repo_url} target="_blank" rel="noreferrer">Lihat kode</a>}
        {project.is_confidential && !project.repo_url && (
          <p className="muted">Kode dan data proyek ini milik perusahaan, jadi tidak dibagikan publik. Detail teknis bisa dibahas saat wawancara.</p>
        )}
      </div>
    </article>
  )
}
