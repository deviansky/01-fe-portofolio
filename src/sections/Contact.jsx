import { useRef, useState } from 'react'
import { api } from '../lib/api'
import { contactConfig } from '../config/contactConfig'
import { useI18n } from '../i18n/I18nProvider'
import { useReveal } from '../motion/useReveal'
import SplitWords from '../components/SplitWords'

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' }

export default function Contact({ profile }) {
  const { t, lang } = useI18n()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | failed
  const [failMessage, setFailMessage] = useState('')
  const rootRef = useRef(null)
  useReveal(rootRef, [lang, status === 'sent'])

  const update = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
  }

  const validate = () => {
    const er = {}
    if (!form.name.trim()) er.name = lang === 'en' ? 'Please fill in your name.' : 'Isi nama kamu.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = lang === 'en' ? 'Please enter a valid email address.' : 'Isi email yang valid, contoh: nama@domain.com.'
    if (form.message.trim().length < 10) er.message = lang === 'en' ? 'Message must be at least 10 characters.' : 'Pesan minimal 10 karakter.'
    return er
  }

  const submit = async (e) => {
    e.preventDefault()
    const er = validate()
    if (Object.keys(er).length) return setErrors(er)

    setStatus('sending')
    try {
      await api.sendMessage(form, lang)
      setStatus('sent')
      setForm(EMPTY)
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])))
        setStatus('idle')
      } else {
        setFailMessage(err.status === 429
          ? (lang === 'en' ? 'Too many messages in a short time. Please try again in a few minutes.' : 'Terlalu banyak pesan dalam waktu singkat. Coba lagi beberapa menit lagi.')
          : (err.message || t('contact.errorGeneral')))
        setStatus('failed')
      }
    }
  }

  // Data kontak
  const phoneDisplay = profile?.phone || contactConfig.phone.display
  const phoneHref = profile?.phone ? `tel:${profile.phone}` : contactConfig.phone.href

  const linkedinDisplay = profile?.socials?.linkedin
    ? profile.socials.linkedin.replace(/^https?:\/\/(www\.)?/, '')
    : contactConfig.linkedin.display
  const linkedinHref = profile?.socials?.linkedin || contactConfig.linkedin.href

  const instagramDisplay = profile?.socials?.instagram
    ? `@${profile.socials.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')}`
    : contactConfig.instagram.display
  const instagramHref = profile?.socials?.instagram || contactConfig.instagram.href

  const reach = [
    { label: lang === 'en' ? 'Phone' : 'Telepon', text: phoneDisplay, href: phoneHref },
    { label: 'LinkedIn', text: linkedinDisplay, href: linkedinHref },
    { label: 'Instagram', text: instagramDisplay, href: instagramHref },
  ]

  return (
    <section className="contact-section" id="kontak" ref={rootRef}>
      <div className="container">
        <h2 className="contact-title" data-reveal="words">
          <span className="contact-title-line"><SplitWords text={t('contact.bigTitle')} /></span>
          <em className="contact-title-line"><SplitWords text={t('contact.bigAccent')} /></em>
        </h2>
      </div>

      <div className="container contact-container">
        {/* Kolom Kiri: ajakan & kontak langsung */}
        <div className="contact-left" data-reveal="up">
          <p className="contact-desc">{t('contact.subtitle')}</p>
          <a href="#c-name" className="contact-orb" data-magnetic="0.45" onClick={(e) => { e.preventDefault(); document.getElementById('c-name')?.focus({ preventScroll: false }) }}>
            <span className="cta-fill" aria-hidden="true" />
            <span className="cta-text">{t('contact.toForm')}</span>
          </a>

          <div className="contact-person">
            <p className="contact-label">{t('contact.orReach')}</p>
            <ul className="contact-list">
              {reach.map((r) => (
                <li key={r.label}>
                  <a href={r.href} className="contact-item" target="_blank" rel="noopener noreferrer">
                    <span className="contact-item-label">{r.label}</span>
                    <span className="contact-item-text">{r.text}</span>
                    <svg className="contact-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Kolom Kanan: Form Kontak */}
        <div className="contact-form-block" data-reveal="up" data-reveal-delay="0.1">
          {status === 'sent' ? (
            <div className="contact-notice contact-notice-ok" role="status">
              <p>{t('contact.successMsg')}</p>
              <button type="button" className="contact-submit-btn cta cta--light" onClick={() => setStatus('idle')}>
                <span className="cta-fill" aria-hidden="true" />
                <span className="cta-text">{lang === 'en' ? 'Send another message' : 'Kirim pesan lain'}</span>
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit} noValidate>
              <div className="contact-field">
                <label htmlFor="c-name">{t('contact.nameLabel')}</label>
                <input
                  id="c-name"
                  name="name"
                  type="text"
                  placeholder={t('contact.namePlaceholder')}
                  value={form.name}
                  onChange={update}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'c-name-err' : undefined}
                  className="contact-input"
                />
                {errors.name && <p className="contact-field-error" id="c-name-err">{errors.name}</p>}
              </div>

              <div className="contact-field">
                <label htmlFor="c-email">{t('contact.emailLabel')}</label>
                <input
                  id="c-email"
                  name="email"
                  type="email"
                  placeholder={t('contact.emailPlaceholder')}
                  value={form.email}
                  onChange={update}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'c-email-err' : undefined}
                  className="contact-input"
                />
                {errors.email && <p className="contact-field-error" id="c-email-err">{errors.email}</p>}
              </div>

              <div className="contact-field">
                <label htmlFor="c-subject">{lang === 'en' ? 'Subject (optional)' : 'Subjek (opsional)'}</label>
                <input
                  id="c-subject"
                  name="subject"
                  type="text"
                  placeholder={lang === 'en' ? 'Message subject' : 'Topik pesan'}
                  value={form.subject}
                  onChange={update}
                  className="contact-input"
                />
              </div>

              <div className="contact-field">
                <label htmlFor="c-message">{t('contact.messageLabel')}</label>
                <textarea
                  id="c-message"
                  name="message"
                  rows={5}
                  placeholder={t('contact.messagePlaceholder')}
                  value={form.message}
                  onChange={update}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'c-message-err' : undefined}
                  className="contact-textarea"
                />
                {errors.message && <p className="contact-field-error" id="c-message-err">{errors.message}</p>}
              </div>

              {/* Honeypot field anti-spam */}
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={update}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ display: 'none' }}
              />

              {status === 'failed' && (
                <div className="contact-notice contact-notice-err" role="alert">
                  <p>
                    {lang === 'en' ? 'Message not sent:' : 'Pesan belum terkirim:'} {failMessage}
                    {profile?.email ? (lang === 'en' ? ` You can also email directly to ${profile.email}.` : ` Kamu juga bisa email langsung ke ${profile.email}.`) : ''}
                  </p>
                </div>
              )}

              <div className="contact-actions">
                <button type="submit" className="contact-submit-btn cta cta--light cta--lg" data-magnetic="0.3" disabled={status === 'sending'}>
                  <span className="cta-fill" aria-hidden="true" />
                  <span className="cta-text">{status === 'sending' ? t('contact.sendingBtn') : t('contact.sendBtn')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
