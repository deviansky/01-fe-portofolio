import { useI18n } from '../i18n/I18nProvider'

export default function Footer({ name }) {
  const { lang } = useI18n()
  const isEn = lang === 'en'

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} {name}</p>
        <a href="#top">{isEn ? 'Back to top' : 'Kembali ke atas'}</a>
      </div>
    </footer>
  )
}
