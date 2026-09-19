import { useState } from 'react'
import { api } from '../lib/api'
import { contactConfig } from '../config/contactConfig'
import { useI18n } from '../i18n/I18nProvider'

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' }

export default function Contact({ profile }) {
  const { t, lang } = useI18n()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | failed
  const [failMessage, setFailMessage] = useState('')

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

  return (
    <section className="contact-section container" id="kontak">
      <div className="contact-container">
        {/* Kolom Kiri: Judul & Informasi Kontak */}
        <div className="contact-left">
          <div className="contact-header">
            <h2 className="contact-title">{lang === 'en' ? 'Get in\ntouch.' : 'Hubungi\nsaya.'}</h2>
            <p className="contact-desc">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="contact-person">
            <h3 className="contact-name">{profile?.name || contactConfig.name}</h3>
            <p className="contact-role">Fullstack Developer</p>

            <div className="contact-list">
              <a href={phoneHref} className="contact-item" target="_blank" rel="noopener noreferrer">
                <div className="contact-icon-box" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span>{phoneDisplay}</span>
              </a>

              <a href={linkedinHref} className="contact-item" target="_blank" rel="noopener noreferrer">
                <div className="contact-icon-box" aria-hidden="true">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 100 3.24 1.62 1.62 0 000-3.24z" />
                  </svg>
                </div>
                <span>{linkedinDisplay}</span>
              </a>

              <a href={instagramHref} className="contact-item" target="_blank" rel="noopener noreferrer">
                <div className="contact-icon-box" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
                <span>{instagramDisplay}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Kontak */}
        <div className="contact-form-block">
          {status === 'sent' ? (
            <div className="contact-notice contact-notice-ok" role="status">
              <p>{t('contact.successMsg')}</p>
              <button type="button" className="contact-submit-btn" style={{ marginTop: '16px' }} onClick={() => setStatus('idle')}>
                {lang === 'en' ? 'Send another message' : 'Kirim pesan lain'}
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
                <button type="submit" className="contact-submit-btn" disabled={status === 'sending'}>
                  <span>{status === 'sending' ? t('contact.sendingBtn') : t('contact.sendBtn')}</span>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
