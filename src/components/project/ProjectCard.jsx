import React from 'react'
import { categoryLabel } from '../../lib/format'
import ProjectCover from '../ProjectCover'

/**
 * Komponen tampilan murni untuk Kartu Proyek.
 * Hanya menerima props tanpa data fetching, router, atau dialog state.
 */
export default function ProjectCard({ project, onOpen, maxStack = 3 }) {
    if (!project) return null

    const stackList = project.stack ?? []
    const extra = stackList.length - maxStack

    return (
        <article className="pj-card">
            <ProjectCover project={project} />
            <div className="pj-card-body">
                <p className="pj-meta">
                    <span>{categoryLabel(project.category)}</span>
                    {project.year && <span>{project.year}</span>}
                </p>
                <h3 className="pj-title">
                    <button
                        type="button"
                        className="pj-open"
                        onClick={onOpen}
                    >
                        {project.title}
                    </button>
                </h3>
                {project.role && <p className="pj-role">{project.role}</p>}
                <p className="pj-summary">{project.summary}</p>
                <div className="pj-foot">
                    <span className="pj-stack">
                        {stackList.slice(0, maxStack).join(', ')}
                        {extra > 0 && ` +${extra}`}
                    </span>
                    {project.is_confidential && <span className="pj-internal">Internal</span>}
                </div>
            </div>
        </article>
    )
}
