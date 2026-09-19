import { useTheme } from '../context/ThemeContext'
import { useI18n } from '../i18n/I18nProvider'

export default function ThemeSwitch() {
  const { theme, toggle } = useTheme()
  const { lang } = useI18n()
  const isDark = theme === 'dark'
  const isEn = lang === 'en'

  const label = isDark
    ? (isEn ? 'Switch to light mode' : 'Beralih ke mode terang')
    : (isEn ? 'Switch to dark mode' : 'Beralih ke mode gelap')

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      onClick={toggle}
      className="theme-switch-btn"
    >
      <span className="theme-switch-track">
        {/* Ikon Bulan di kiri (tampil saat mode gelap) */}
        <span className="theme-switch-icon icon-moon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a94a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>

        {/* Ikon Matahari di kanan (tampil saat mode terang) */}
        <span className="theme-switch-icon icon-sun" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a94a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </span>

        {/* Knob geser */}
        <span className={`theme-switch-knob ${isDark ? 'is-dark' : ''}`} />
      </span>
    </button>
  )
}
