import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import ThemeSwitch from './ThemeSwitch'
import LanguageSwitch from './LanguageSwitch'

export default function Navbar({ name }) {
  const [openNav, setOpenNav] = useState(false)
  const { lang, t } = useI18n()
  const { pathname } = useLocation()
  const onHome = pathname === '/'

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

  const handleLangStateChange = (isOpen) => {
    if (isOpen) setOpenNav(false)
  }

  const handleToggleNav = () => {
    setOpenNav((prev) => !prev)
  }

  return (
    <header className="nav">
      <div className="nav-inner container">
        <Link to="/" className="nav-brand" onClick={() => setOpenNav(false)}>
          <span>{name}</span>
        </Link>

        {/* Link Navigasi (Desktop di tengah-kanan, Mobile menu drawer) */}
        <nav id="nav-links" className={`nav-links ${openNav ? 'is-open' : ''}`} aria-label="Navigasi utama">
          {LINKS.map((l) =>
            onHome ? (
              <a key={l.id} href={`#${l.id}`} onClick={() => setOpenNav(false)}>{l.label}</a>
            ) : (
              <Link key={l.id} to={`/#${l.id}`} onClick={() => setOpenNav(false)}>{l.label}</Link>
            ),
          )}
        </nav>

        {/* Kontrol Kanan: Language, Theme, Mobile Menu Button */}
        <div className="nav-controls">
          <LanguageSwitch onStateChange={handleLangStateChange} />
          <ThemeSwitch />

          <button
            type="button"
            className="nav-menu-btn"
            aria-expanded={openNav}
            aria-controls="nav-links"
            aria-label={openNav ? t('nav.close') : t('nav.menu')}
            onClick={handleToggleNav}
          >
            {openNav ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
