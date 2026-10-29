import React from 'react'
import { categoryLabel } from '../../lib/format'
import ProjectCover from '../ProjectCover'
import { projectColor } from '../../lib/projectColor'
import { useI18n } from '../../i18n/I18nProvider'

/**
 * Komponen tampilan murni untuk Kartu Proyek.
 * Hanya menerima props tanpa data fetching, router, atau dialog state.
 * Seluruh kartu bisa diklik lewat tombol judul (pseudo-element merentang);
 * link repo berada di atas lapisan itu supaya tetap bisa diklik sendiri.
 */
export default function ProjectCard({ project, onOpen, maxStack = 4 }) {
    const { lang } = useI18n()
    if (!project) return null

    const isEn = lang === 'en'
    const stackList = project.stack ?? []
    const extra = stackList.length - maxStack
    const color = projectColor(project)

    return (
        <article
            className="pj-card"
            data-cursor-text={isEn ? 'View' : 'Lihat'}
            data-cursor-color={color.bg}
            data-cursor-ink={color.fg}
        >
            <div className="pj-card-cover" data-reveal="clip">
                <ProjectCover project={project} parallax />
                <div className="pj-cover-tags" aria-hidden="true">
                    <span>{categoryLabel(project.category, lang)}</span>
                    {project.year && <span>{project.year}</span>}
                    {project.is_confidential && <span>Internal</span>}
                </div>
                {stackList.length > 0 && (
                    <ul className="pj-cover-stack" aria-hidden="true">
                        {stackList.slice(0, maxStack).map((s) => <li key={s}>{s}</li>)}
                        {extra > 0 && <li>+{extra}</li>}
                    </ul>
                )}
            </div>
            <div className="pj-card-body">
                <h3 className="pj-title">
                    <button type="button" className="pj-open" onClick={onOpen}>
                        {project.title}
                    </button>
                </h3>
                {project.role && <p className="pj-meta">{project.role}</p>}
                <p className="pj-summary">{project.summary}</p>
                <div className="pj-foot">
                    <span className="pj-more-link" aria-hidden="true">
                        {isEn ? 'View details' : 'Lihat detail'}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {project.repo_url && (
                        <a className="pj-repo" href={project.repo_url} target="_blank" rel="noreferrer">
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.3-1.69-1.3-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.27 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" /></svg>
                            {isEn ? 'Source code' : 'Kode sumber'}
                        </a>
                    )}
                </div>
            </div>
        </article>
    )
}
