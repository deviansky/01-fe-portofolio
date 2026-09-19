import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const LINKS = [
  { id: 'tentang', label: 'Tentang' },
  { id: 'keahlian', label: 'Keahlian' },
  { id: 'proyek', label: 'Proyek' },
  { id: 'pengalaman', label: 'Pengalaman' },
  { id: 'kontak', label: 'Kontak' },
]

export default function Navbar({ name }) {
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const onHome = pathname === '/'

  return (
    <header className="nav">
      <div className="nav-inner container">
        <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
          {/* <img src="/favicon.svg" alt="Logo" className="nav-brand-logo" width="24" height="24" style={{ borderRadius: '6px', marginRight: '8px', verticalAlign: 'middle', display: 'inline-block' }} /> */}
          <span>{name}</span>
        </Link>

        <button
          type="button"
          className="nav-menu-btn"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Tutup' : 'Menu'}
        </button>

        <nav id="nav-links" className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Navigasi utama">
          {LINKS.map((l) =>
            onHome ? (
              <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)}>{l.label}</a>
            ) : (
              <Link key={l.id} to={`/#${l.id}`} onClick={() => setOpen(false)}>{l.label}</Link>
            ),
          )}
          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
          >
            {theme === 'dark' ? 'Terang' : 'Gelap'}
          </button>
        </nav>
      </div>
    </header>
  )
}
