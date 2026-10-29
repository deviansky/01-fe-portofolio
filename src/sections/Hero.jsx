import { useLayoutEffect, useRef, useState } from 'react'
import defaultPhoto from '../assets/david.webp'
import { useI18n } from '../i18n/I18nProvider'
import { useReveal } from '../motion/useReveal'
import { gsap, prefersReducedMotion } from '../motion/gsap'
import SplitWords from '../components/SplitWords'
import Cta from '../components/Cta'
import { contactConfig } from '../config/contactConfig'

// tirai pembuka hanya diputar sekali per muat halaman, bukan tiap kembali ke beranda
let introPlayed = false

// tahun pengalaman dihitung dari pengalaman kerja paling awal
function yearsOfExperience(experiences = []) {
  const starts = experiences.map((e) => new Date(e.started_at).getTime()).filter(Number.isFinite)
  if (!starts.length) return 0
  return Math.max(1, Math.floor((Date.now() - Math.min(...starts)) / (365.25 * 864e5)))
}

// GitHub dari profil; kalau kosong, ambil username dari repo proyek
function githubUrl(profile, projects = []) {
  if (profile.socials?.github) return profile.socials.github
  const repo = projects.map((p) => p.repo_url).find((u) => /github\.com\/[^/]+/.test(u || ''))
  return repo ? repo.match(/^https?:\/\/(www\.)?github\.com\/[^/]+/)[0] : null
}

export default function Hero({ profile, experiences = [], projects = [], skills = [] }) {
  const { t, lang } = useI18n()
  const isEn = lang === 'en'
  const rootRef = useRef(null)
  const curtainRef = useRef(null)
  // datang lewat transisi halaman → lembaran sudah jadi pembuka, tirai intro dilewati
  const [showIntro, setShowIntro] = useState(
    () => !introPlayed && !prefersReducedMotion() && !document.documentElement.classList.contains('is-transitioning'),
  )

  const photo = profile.avatar_url || defaultPhoto
  const firstName = profile.name.split(' ')[0]
  const headWords = (profile.headline || '').split(' ')
  const accent = headWords.pop()
  const lead = headWords.join(' ')
  const current = experiences.find((e) => e.is_current)

  const stats = [
    { value: yearsOfExperience(experiences), suffix: '+', label: t('hero.yearsExp') },
    { value: projects.length, suffix: '', label: t('hero.projectsDone') },
    { value: skills.filter((s) => s.category !== 'soft_skill').length, suffix: '', label: t('hero.techCount') },
  ].filter((s) => s.value > 0)

  const socials = [
    { label: 'GitHub', href: githubUrl(profile, projects), icon: 'M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.3-1.69-1.3-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.27 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z' },
    { label: 'LinkedIn', href: profile.socials?.linkedin || contactConfig.linkedin.href, icon: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z' },
    { label: 'Instagram', href: profile.socials?.instagram || contactConfig.instagram.href, icon: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3Z' },
  ].filter((s) => s.href)

  // kata-kata hero menunggu tirai terangkat dulu
  const d = showIntro ? 0.75 : 0.1

  useLayoutEffect(() => {
    if (!showIntro || !curtainRef.current) return
    introPlayed = true
    const ctx = gsap.context(() => {
      gsap.timeline({ onComplete: () => setShowIntro(false) })
        .from('.intro-name .sw-i', { yPercent: 110, duration: 0.6, ease: 'expo.out', stagger: 0.06 })
        .to(curtainRef.current, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '+=0.15')
    })
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // angka statistik menghitung naik dari 0
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      root.querySelectorAll('[data-count]').forEach((el) => {
        const obj = { v: 0 }
        gsap.to(obj, {
          v: Number(el.dataset.count),
          duration: 1.6,
          delay: d + 0.6,
          ease: 'power3.out',
          onUpdate: () => { el.textContent = Math.round(obj.v) },
        })
      })
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  useReveal(rootRef, [lang])

  return (
    <section className="hx" id="top" ref={rootRef}>
      {showIntro && (
        <div className="intro" ref={curtainRef} aria-hidden="true">
          <p className="intro-name"><SplitWords text={profile.short_name || profile.name} /></p>
        </div>
      )}

      <div className="container hx-inner">
        <div className="hx-text">
          <p className="hx-badge" data-reveal="up" data-reveal-now data-reveal-delay={d}>
            <span className={`hx-dot ${profile.available_for_work ? '' : 'is-off'}`} aria-hidden="true" />
            {profile.available_for_work ? t('hero.availableBadge') : profile.headline}
          </p>

          <p className="hx-hello" data-reveal="up" data-reveal-now data-reveal-delay={d + 0.05}>
            {t('hero.hello')}
          </p>
          <h1 className="hx-title">
            <span className="hx-line" data-reveal="words" data-reveal-now data-reveal-delay={d + 0.1}>
              <SplitWords text={profile.name} />
            </span>
          </h1>
          <p className="hx-role" data-reveal="words" data-reveal-now data-reveal-delay={d + 0.25}>
            {lead && <SplitWords text={lead} />}{' '}
            <em className="hx-accent"><SplitWords text={accent} /></em>
          </p>

          <p className="hx-tagline" data-reveal="up" data-reveal-now data-reveal-delay={d + 0.4}>
            {profile.tagline}
          </p>

          <div className="hx-actions" data-reveal="up" data-reveal-now data-reveal-delay={d + 0.5}>
            <Cta href="/proyek" data-pt-label={t('nav.projects')}>{t('hero.seeProjects')}</Cta>
            {profile.cv_url ? (
              <Cta href={profile.cv_url} variant="outline" target="_blank" rel="noreferrer">
                {isEn ? 'Download CV' : 'Unduh CV'}
              </Cta>
            ) : (
              <Cta href="/kontak" variant="outline" data-pt-label={t('nav.contact')}>{t('hero.contactMe')}</Cta>
            )}
            <ul className="hx-socials" aria-label={isEn ? 'Social profiles' : 'Profil sosial'}>
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} data-magnetic="0.4">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={s.icon} /></svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hx-visual" data-reveal="clip" data-reveal-now data-reveal-delay={d + 0.15}>
          <div className="hx-photo-wrap" data-parallax>
            <img
              className="hp-photo"
              src={photo}
              alt={`Foto ${firstName}`}
              width="820"
              height="1011"
              fetchPriority="high"
            />
          </div>
          {current && (
            <div className="hx-card hx-card--now">
              <span className="hx-card-label">{isEn ? 'Currently' : 'Saat ini'}</span>
              <strong>{current.position}</strong>
              <span>@ {current.company}</span>
            </div>
          )}
          {profile.focus_areas?.[0] && (
            <div className="hx-card hx-card--focus">
              <span className="hx-card-label">{isEn ? 'Focus' : 'Fokus'}</span>
              <strong>{profile.focus_areas[0].title}</strong>
              <span>{profile.focus_areas[0].detail}</span>
            </div>
          )}
        </div>
      </div>

      {stats.length > 0 && (
        <div className="container">
          <dl className="hx-stats" data-reveal="up" data-reveal-now data-reveal-delay={d + 0.6}>
            {stats.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd><span data-count={s.value}>{s.value}</span>{s.suffix}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  )
}
