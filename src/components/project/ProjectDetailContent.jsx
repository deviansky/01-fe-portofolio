import React from 'react'
import { Link } from 'react-router-dom'
import { categoryLabel } from '../../lib/format'
import Stack from '../Stack'
import RichContent from '../RichContent'

/**
 * Komponen tampilan murni untuk Halaman Detail Proyek.
 * Memuat markup struktur halaman detail proyek tanpa data fetching.
 */
export default function ProjectDetailContent({ project, backLink, renderLink }) {
    if (!project) return null

    return (
        <article className="container detail">
            {backLink ? (
                backLink
            ) : (
                <Link to="/#proyek" className="back-link">Semua proyek</Link>
            )}

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
                <RichContent html={project.description} />
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
                {typeof renderLink === 'function' ? (
                    renderLink(project)
                ) : (
                    <>
                        {project.demo_url && <a className="btn btn-primary" href={project.demo_url} target="_blank" rel="noreferrer">Buka situs</a>}
                        {project.repo_url && <a className="btn btn-ghost" href={project.repo_url} target="_blank" rel="noreferrer">Lihat kode</a>}
                        {project.is_confidential && !project.repo_url && (
                            <p className="muted">Kode dan data proyek ini milik perusahaan, jadi tidak dibagikan publik. Detail teknis bisa dibahas saat wawancara.</p>
                        )}
                    </>
                )}
            </div>
        </article>
    )
}
