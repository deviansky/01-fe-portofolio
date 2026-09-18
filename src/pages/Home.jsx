import { useEffect } from 'react'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Skills from '../sections/Skills'
import Projects from '../sections/Projects'
import Experience from '../sections/Experience'
import Education from '../sections/Education'
import Contact from '../sections/Contact'

export default function Home({ data }) {
  const { profile } = data
  useEffect(() => {
    document.title = `${profile.name} | ${profile.headline}`
  }, [profile])

  return (
    <>
      <Hero profile={profile} />
      <About profile={profile} education={data.educations[0]} />
      <Skills skills={data.skills} />
      <Projects projects={data.projects} />
      <Experience experiences={data.experiences} />
      <Education educations={data.educations} certifications={data.certifications} />
      <Contact profile={profile} />
    </>
  )
}
