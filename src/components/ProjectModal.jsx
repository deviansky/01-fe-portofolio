import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { categoryLabel } from '../lib/format'
import ProjectCover from './ProjectCover'
import Stack from './Stack'

/**
 * Detail cepat proyek memakai <dialog> bawaan browser:
 * fokus terkunci di dalam modal, Esc menutup, fokus kembali ke kartu.
 */
export default function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null)
  const [detail, setDetail] = useState(null)

  // buka/tutup dialog mengikuti prop project
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (project && !dialog.open) {
      dialog.showModal()
      document.documentElement.classList.add('pj-lock')
    }
    if (!project && dialog.open) dialog.close()
    return () => document.documentElement.classList.remove('pj-lock')
  }, [project])

  // ambil detail lengkap (deskripsi, highlights). Kalau API mati, pakai data kartu.
  useEffect(() => {
    setDetail(null)
    if (!project) return
    const controller = new AbortController()
    api.getProject(project.slug, controller.signal)
      .then(setDetail)
      .catch(() => {})
    return () => controller.abort()
  }, [project])

  const p = detail ?? project

  return (
    <dialog
      ref={dialogRef}
      className="pj-modal"
      aria-labelledby="pj-modal-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === dialogRef.current) onClose() }}
    >
      {p && (
        <div className="pj-modal-inner">
          <ProjectCover project={p} className="pj-modal-cover" />

          <button type="button" className="pj-modal-close" onClick={onClose} aria-label="Tutup detail proyek">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="pj-modal-body">
            <p className="pj-meta">
              <span>{categoryLabel(p.category)}</span>
              {p.year && <span>{p.year}</span>}
            </p>
            <h2 id="pj-modal-title" className="pj-modal-title">{p.title}</h2>
            {p.role && <p className="pj-role">{p.role}</p>}

            <p className="pj-modal-lead">{p.summary}</p>
            {p.description && !p.description.startsWith('TODO') && <p>{p.description}</p>}

            {p.highlights?.length > 0 && (
              <>
                <h3 className="pj-modal-sub">Yang saya kerjakan</h3>
                <ul className="ticks">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
              </>
            )}

            {p.stack?.length > 0 && (
              <>
                <h3 className="pj-modal-sub">Teknologi</h3>
                <Stack items={p.stack} />
              </>
            )}

            {p.is_confidential && (
              <p className="pj-modal-note">
                Proyek internal perusahaan. Kode dan datanya tidak dibagikan publik; detail teknis bisa dibahas saat wawancara.
              </p>
            )}

            <div className="pj-modal-actions">
              {p.demo_url && <a className="btn btn-primary" href={p.demo_url} target="_blank" rel="noreferrer">Buka situs</a>}
              {p.repo_url && <a className="btn btn-ghost" href={p.repo_url} target="_blank" rel="noreferrer">Lihat kode</a>}
              <Link className="pj-modal-link" to={`/proyek/${p.slug}`} onClick={onClose}>Buka halaman proyek</Link>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
