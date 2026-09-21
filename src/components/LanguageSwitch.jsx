import { useState, useRef, useEffect } from 'react'
import { useI18n } from '../i18n/I18nProvider'

export function FlagID({ className = '' }) {
  return (
    <svg width="19" height="13" viewBox="0 0 19 13" fill="none" className={`flag-svg ${className}`} aria-hidden="true">
      <rect width="19" height="13" rx="2" fill="#FFFFFF" />
      <path d="M0 2C0 0.895431 0.895431 0 2 0H17C18.1046 0 19 0.895431 19 2V6.5H0V2Z" fill="#E70011" />
      <rect x="0.5" y="0.5" width="18" height="12" rx="1.5" stroke="rgba(0, 0, 0, 0.15)" strokeWidth="1" />
    </svg>
  )
}

export function FlagEN({ className = '' }) {
  return (
    <svg width="19" height="13" viewBox="0 0 19 13" fill="none" className={`flag-svg ${className}`} aria-hidden="true">
      <rect width="19" height="13" rx="2" fill="#012169" />
      <path d="M0 0L19 13M19 0L0 13" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M0 0L19 13M19 0L0 13" stroke="#C8102E" strokeWidth="1.2" />
      <path d="M9.5 0V13M0 6.5H19" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M9.5 0V13M0 6.5H19" stroke="#C8102E" strokeWidth="2.4" />
      <rect x="0.5" y="0.5" width="18" height="12" rx="1.5" stroke="rgba(0, 0, 0, 0.15)" strokeWidth="1" />
    </svg>
  )
}

export default function LanguageSwitch({ onStateChange }) {
  const { lang, setLang } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const itemsRef = useRef([])

  const isEn = lang === 'en'

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (typeof onStateChange === 'function') onStateChange(next)
      return next
    })
  }

  const closeDropdown = (restoreFocus = true) => {
    setIsOpen(false)
    if (typeof onStateChange === 'function') onStateChange(false)
    if (restoreFocus && triggerRef.current) {
      triggerRef.current.focus()
    }
  }

  const selectLang = (code) => {
    setLang(code)
    closeDropdown(true)
  }

  // Handle click outside & Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        e.preventDefault()
        closeDropdown(true)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((prev) => (prev + 1) % 2)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((prev) => (prev - 1 + 2) % 2)
      }
    }

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeDropdown(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus item when keyboard navigating
  useEffect(() => {
    if (isOpen && itemsRef.current[focusedIndex]) {
      itemsRef.current[focusedIndex].focus()
    }
  }, [isOpen, focusedIndex])

  return (
    <div className="lang-switch-container" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="lang-switch-btn"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={isEn ? 'Choose language' : 'Pilih bahasa'}
        onClick={toggleDropdown}
      >
        {lang === 'id' ? <FlagID /> : <FlagEN />}
        <span className="lang-code">{lang.toUpperCase()}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`lang-chevron ${isOpen ? 'is-open' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu" role="menu" aria-label={isEn ? 'Language options' : 'Pilihan bahasa'}>
          <div className="lang-dropdown-arrow" aria-hidden="true" />
          <button
            ref={(el) => (itemsRef.current[0] = el)}
            type="button"
            role="menuitemradio"
            aria-checked={lang === 'id'}
            aria-label="Bahasa Indonesia"
            className={`lang-dropdown-item ${lang === 'id' ? 'is-active' : ''}`}
            onClick={() => selectLang('id')}
          >
            <FlagID />
            <span className="lang-code">ID</span>
          </button>
          <button
            ref={(el) => (itemsRef.current[1] = el)}
            type="button"
            role="menuitemradio"
            aria-checked={lang === 'en'}
            aria-label="English"
            className={`lang-dropdown-item ${lang === 'en' ? 'is-active' : ''}`}
            onClick={() => selectLang('en')}
          >
            <FlagEN />
            <span className="lang-code">EN</span>
          </button>
        </div>
      )}
    </div>
  )
}
