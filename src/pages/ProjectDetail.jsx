import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import ProjectDetailContent from '../components/project/ProjectDetailContent'
import NotFound from './NotFound'
import { useI18n } from '../i18n/I18nProvider'

export default function ProjectDetail({ data, source }) {
  const { slug } = useParams()
  const { lang } = useI18n()
  const fromList = data.projects.find((p) => p.slug === slug)
  const [project, setProject] = useState(fromList)

  // Data list hanya ringkasan; detail lengkap (deskripsi, gambar) diambil dari API.
  useEffect(() => {
    if (source !== 'api') return
    const controller = new AbortController()
    api.getProject(slug, controller.signal, lang)
      .then(setProject)
      .catch((err) => { if (err.name !== 'AbortError') console.warn(err.message) })
    return () => controller.abort()
  }, [slug, source, lang])

  useEffect(() => {
    if (project) document.title = `${project.title} | ${data.profile.name}`
  }, [project, data.profile.name])

  if (!project) return <NotFound />

  return <ProjectDetailContent project={project} />
}
