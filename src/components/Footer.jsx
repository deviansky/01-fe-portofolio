import { useI18n } from '../i18n/I18nProvider'

export default function Footer({ name }) {
  const { lang, t } = useI18n()
  const isEn = lang === 'en'

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="footer-name">© {new Date().getFullYear()} {name}</p>
        <p className="footer-built">{t('footer.builtWith')}</p>
        <a href="#top" className="footer-top" data-magnetic="0.3">
          {isEn ? 'Back to top' : 'Kembali ke atas'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </footer>
  )
}
