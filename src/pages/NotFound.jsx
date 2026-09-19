import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <section className="container detail">
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.desc')}</p>
      <Link to="/" className="btn btn-primary">{t('notFound.backHome')}</Link>
    </section>
  )
}
