import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import ProjectModalContent from './project/ProjectModalContent'

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
      .catch(() => { })
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
      {p && <ProjectModalContent project={p} onClose={onClose} />}
    </dialog>
  )
}
