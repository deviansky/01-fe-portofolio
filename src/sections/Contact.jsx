import { useState } from 'react'
import { api } from '../lib/api'
import SocialLinks from '../components/SocialLinks'

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' }

export default function Contact({ profile }) {
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
    if (!form.name.trim()) er.name = 'Isi nama kamu.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Isi email yang valid, contoh: nama@domain.com.'
    if (form.message.trim().length < 10) er.message = 'Pesan minimal 10 karakter.'
    return er
  }

  const submit = async (e) => {
    e.preventDefault()
    const er = validate()
    if (Object.keys(er).length) return setErrors(er)

    setStatus('sending')
    try {
      await api.sendMessage(form)
      setStatus('sent')
      setForm(EMPTY)
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])))
        setStatus('idle')
      } else {
        setFailMessage(err.status === 429 ? 'Terlalu banyak pesan dalam waktu singkat. Coba lagi beberapa menit lagi.' : err.message)
        setStatus('failed')
      }
    }
  }

  const field = (name, label, props = {}) => (
    <div className="field">
      <label htmlFor={`c-${name}`}>{label}</label>
      {props.as === 'textarea' ? (
        <textarea id={`c-${name}`} name={name} rows={5} value={form[name]} onChange={update}
          aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `c-${name}-err` : undefined} />
      ) : (
        <input id={`c-${name}`} name={name} type={props.type ?? 'text'} value={form[name]} onChange={update}
          autoComplete={props.autoComplete} aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `c-${name}-err` : undefined} />
      )}
      {errors[name] && <p className="field-error" id={`c-${name}-err`}>{errors[name]}</p>}
    </div>
  )

  return (
    <section className="section container split" id="kontak">
      <h2 className="section-title">Kontak</h2>
      <div className="split-body contact">
        <div className="contact-info">
          <p>Punya proyek, lowongan, atau sekadar ingin diskusi soal sistem? Kirim pesan lewat form ini{profile.email ? ' atau email langsung.' : '.'}</p>
          {profile.email && <p><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}</a></p>}
          <SocialLinks socials={profile.socials} />
        </div>

        {status === 'sent' ? (
          <div className="notice notice-ok" role="status">
            <p>Pesan terkirim. Balasan akan dikirim ke email yang kamu isi.</p>
            <button type="button" className="btn btn-ghost" onClick={() => setStatus('idle')}>Kirim pesan lain</button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={submit} noValidate>
            {field('name', 'Nama', { autoComplete: 'name' })}
            {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
            {field('subject', 'Subjek (opsional)')}
            {field('message', 'Pesan', { as: 'textarea' })}
            {/* honeypot anti-spam: disembunyikan dari manusia */}
            <input type="text" name="website" value={form.website} onChange={update}
              className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            {status === 'failed' && (
              <p className="notice notice-error" role="alert">
                Pesan belum terkirim: {failMessage}
                {profile.email ? ` Kamu juga bisa email langsung ke ${profile.email}.` : ''}
              </p>
            )}
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Mengirim…' : 'Kirim pesan'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
