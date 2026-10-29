import { useEffect } from 'react'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Skills from '../sections/Skills'
import Projects from '../sections/Projects'
import Experience from '../sections/Experience'
import Education from '../sections/Education'
import Contact from '../sections/Contact'
import { useI18n } from '../i18n/I18nProvider'

const HOME_PROJECTS = 4

function usePageTitle(title, profile) {
  useEffect(() => {
    document.title = title ? `${title} | ${profile.name}` : `${profile.name} | ${profile.headline}`
  }, [title, profile])
}

/** Beranda: hero + cuplikan proyek. Section lain punya halamannya sendiri. */
export default function Home({ data }) {
  const { profile } = data
  usePageTitle(null, profile)

  return (
    <>
      <Hero profile={profile} experiences={data.experiences} projects={data.projects} skills={data.skills} />
      <Projects projects={data.projects} limit={HOME_PROJECTS} />
    </>
  )
}

export function AboutPage({ data }) {
  const { t } = useI18n()
  usePageTitle(t('nav.about'), data.profile)
  return <About profile={data.profile} education={data.educations[0]} />
}

export function SkillsPage({ data }) {
  const { t } = useI18n()
  usePageTitle(t('nav.skills'), data.profile)
  return <Skills skills={data.skills} />
}

export function ProjectsPage({ data }) {
  const { t } = useI18n()
  usePageTitle(t('nav.projects'), data.profile)
  return <Projects projects={data.projects} />
}

export function ExperiencePage({ data }) {
  const { t } = useI18n()
  usePageTitle(t('nav.experience'), data.profile)
  return (
    <>
      <Experience experiences={data.experiences} />
      <Education educations={data.educations} certifications={data.certifications} />
    </>
  )
}

export function ContactPage({ data }) {
  const { t } = useI18n()
  usePageTitle(t('nav.contact'), data.profile)
  return <Contact profile={data.profile} />
}
