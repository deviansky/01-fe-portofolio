import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import ThemeSwitch from './ThemeSwitch'
import LanguageSwitch from './LanguageSwitch'

export default function Navbar({ name }) {
  const [openNav, setOpenNav] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { lang, t } = useI18n()
  const { pathname } = useLocation()

  const LINKS = [
    { id: 'tentang', label: t('nav.about') },
    { id: 'keahlian', label: t('nav.skills') },
    { id: 'proyek', label: t('nav.projects') },
    { id: 'pengalaman', label: t('nav.experience') },
    { id: 'kontak', label: t('nav.contact') },
  ]

  useEffect(() => {
    document.title = `${name || 'David Reza Widhiwipati'} | Fullstack Developer`
  }, [name, lang])

  // sembunyi saat menggulir ke bawah, muncul lagi saat menggulir ke atas
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      // halaman baru (reset scroll di balik lembaran transisi) selalu mulai dengan navbar tampil
      if (document.documentElement.classList.contains('is-transitioning')) {
        setHidden(false)
        last = y
        return
      }
      if (Math.abs(y - last) > 6) setHidden(y > last && y > 160)
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // kunci scroll halaman selama menu layar penuh terbuka
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', openNav)
    return () => document.documentElement.classList.remove('menu-open')
  }, [openNav])

  const handleLangStateChange = (isOpen) => {
    if (isOpen) setOpenNav(false)
  }

  const cls = ['nav', hidden && !openNav && 'is-hidden', scrolled && 'is-scrolled', openNav && 'is-open']
    .filter(Boolean).join(' ')

  return (
    <header className={cls}>
      <div className="nav-inner container">
        <Link to="/" className="nav-brand" onClick={() => setOpenNav(false)} data-magnetic="0.2">
          <span className="nav-brand-mark" aria-hidden="true" />
          <span>{name}</span>
        </Link>

        <nav id="nav-links" className={`nav-links ${openNav ? 'is-open' : ''}`} aria-label="Navigasi utama">
          {LINKS.map((l, i) => {
            const to = `/${l.id}`
            const active = pathname === to || pathname.startsWith(`${to}/`)
            return (
              <Link
                key={l.id}
                to={to}
                onClick={() => setOpenNav(false)}
                aria-current={active ? 'page' : undefined}
                data-pt-label={l.label}
                style={{ '--i': i }}
              >
                <span className="nav-link-num" aria-hidden="true">0{i + 1}</span>{l.label}
              </Link>
            )
          })}
        </nav>

        <div className="nav-controls">
          <LanguageSwitch onStateChange={handleLangStateChange} />
          <ThemeSwitch />
          <Link to="/kontak" className="nav-cta" data-pt-label={t('nav.contact')} data-magnetic="0.25">
            {t('hero.contactMe')}
          </Link>

          <button
            type="button"
            className="nav-menu-btn"
            aria-expanded={openNav}
            aria-controls="nav-links"
            aria-label={openNav ? t('nav.close') : t('nav.menu')}
            onClick={() => setOpenNav((prev) => !prev)}
          >
            <span className="nav-menu-lines" aria-hidden="true"><span /><span /></span>
          </button>
        </div>
      </div>
    </header>
  )
}
