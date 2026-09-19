import React from 'react'
import { Link } from 'react-router-dom'
import { categoryLabel } from '../../lib/format'
import ProjectCover from '../ProjectCover'
import Stack from '../Stack'
import RichContent from '../RichContent'
import { useI18n } from '../../i18n/I18nProvider'

/**
 * Komponen tampilan murni untuk Isi Modal Proyek.
 * Memuat tata letak modal inner tanpa logika fetching data atau <dialog> state.
 */
export default function ProjectModalContent({ project, onClose, renderLink }) {
    const { t, lang } = useI18n()
    if (!project) return null

    const p = project

    return (
        <div className="pj-modal-inner">
            <ProjectCover project={p} className="pj-modal-cover" />

            {onClose && (
                <button type="button" className="pj-modal-close" onClick={onClose} aria-label={t('projects.closeDetail')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}

            <div className="pj-modal-body">
                <p className="pj-meta">
                    <span>{categoryLabel(p.category, lang)}</span>
                    {p.year && <span>{p.year}</span>}
                </p>
                <h2 id="pj-modal-title" className="pj-modal-title">{p.title}</h2>
                {p.role && <p className="pj-role">{p.role}</p>}

                <p className="pj-modal-lead">{p.summary}</p>

                <RichContent html={p.description} />

                {p.highlights?.length > 0 && (
                    <>
                        <h3 className="pj-modal-sub">{t('projects.whatIDid')}</h3>
                        <ul className="ticks">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
                    </>
                )}

                {p.stack?.length > 0 && (
                    <>
                        <h3 className="pj-modal-sub">{t('projects.techUsed')}</h3>
                        <Stack items={p.stack} />
                    </>
                )}

                {p.is_confidential && (
                    <p className="pj-modal-note">
                        {t('projects.confidentialNotice')}
                    </p>
                )}

                <div className="pj-modal-actions">
                    {p.demo_url && <a className="btn btn-primary" href={p.demo_url} target="_blank" rel="noreferrer">{t('projects.viewSite')}</a>}
                    {p.repo_url && <a className="btn btn-ghost" href={p.repo_url} target="_blank" rel="noreferrer">{t('projects.viewCode')}</a>}
                    {typeof renderLink === 'function' ? (
                        renderLink(p)
                    ) : (
                        <Link className="pj-modal-link" to={`/proyek/${p.slug}`} onClick={onClose}>{t('projects.openProjectPage')}</Link>
                    )}
                </div>
            </div>
        </div>
    )
}
