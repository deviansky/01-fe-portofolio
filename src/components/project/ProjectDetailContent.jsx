import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryLabel } from '../../lib/format'
import ProjectCover from '../ProjectCover'
import SplitWords from '../SplitWords'
import Stack from '../Stack'
import RichContent from '../RichContent'
import { useI18n } from '../../i18n/I18nProvider'

function GalleryItem({ img, projectTitle }) {
    const [failed, setFailed] = useState(false)
    if (failed) return null

    return (
        <figure>
            <img
                src={img.url}
                alt={img.caption || projectTitle}
                loading="lazy"
                onError={() => setFailed(true)}
            />
            {img.caption && <figcaption>{img.caption}</figcaption>}
        </figure>
    )
}

/**
 * Komponen tampilan murni untuk Halaman Detail Proyek.
 * Memuat markup struktur halaman detail proyek tanpa data fetching.
 */
export default function ProjectDetailContent({ project, backLink, renderLink }) {
    const { t, lang } = useI18n()
    const isEn = lang === 'en'

    if (!project) return null

    return (
        <article className="container detail">
            {backLink ? (
                backLink
            ) : (
                <Link to="/proyek" className="back-link" data-pt-label={t('nav.projects')}>{isEn ? 'All projects' : 'Semua proyek'}</Link>
            )}

            <header className="detail-head">
                <p className="detail-kicker" data-reveal="up" data-reveal-now>{categoryLabel(project.category, lang)}{project.year && ` — ${project.year}`}</p>
                <h1 data-reveal="words" data-reveal-now data-reveal-delay="0.1"><SplitWords text={project.title} /></h1>
                <p className="detail-summary" data-reveal="up" data-reveal-now data-reveal-delay="0.35">{project.summary}</p>
                <dl className="detail-meta" data-reveal="up" data-reveal-now data-reveal-delay="0.45">
                    <div><dt>{t('projects.role')}</dt><dd>{project.role}</dd></div>
                    <div><dt>{t('projects.year')}</dt><dd>{project.year}</dd></div>
                    <div><dt>{t('projects.category')}</dt><dd>{categoryLabel(project.category, lang)}</dd></div>
                </dl>
                <Stack items={project.stack} />
            </header>

            <div className="detail-cover-wrap" data-reveal="clip" data-reveal-now data-reveal-delay="0.3">
                <ProjectCover project={project} className="detail-cover" parallax />
            </div>

            <div className="prose detail-body" data-reveal="up">
                <RichContent html={project.description} />
                {project.highlights?.length > 0 && (
                    <>
                        <h2>{t('projects.whatIDid')}</h2>
                        <ul className="ticks">{project.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
                    </>
                )}
            </div>

            {project.images?.length > 0 && (
                <div className="gallery" data-reveal="up">
                    {project.images.map((img) => (
                        <GalleryItem key={img.url} img={img} projectTitle={project.title} />
                    ))}
                </div>
            )}

            <div className="detail-links" data-reveal="up">
                {typeof renderLink === 'function' ? (
                    renderLink(project)
                ) : (
                    <>
                        {project.demo_url && <a className="btn btn-primary" href={project.demo_url} target="_blank" rel="noreferrer">{t('projects.viewSite')}</a>}
                        {project.repo_url && <a className="btn btn-ghost" href={project.repo_url} target="_blank" rel="noreferrer">{t('projects.viewCode')}</a>}
                        {project.is_confidential && !project.repo_url && (
                            <p className="muted">{t('projects.confidentialNotice')}</p>
                        )}
                    </>
                )}
            </div>
        </article>
    )
}
