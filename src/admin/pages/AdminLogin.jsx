import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/adminLogin.css'

export default function AdminLogin() {
    const { user, login } = useAuth()
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const errorRef = useRef(null)

    useEffect(() => {
        let metaTag = document.querySelector('meta[name="robots"]')
        if (!metaTag) {
            metaTag = document.createElement('meta')
            metaTag.name = 'robots'
            document.head.appendChild(metaTag)
        }
        metaTag.content = 'noindex'

        return () => {
            if (metaTag && metaTag.parentNode) {
                metaTag.content = 'index, follow'
            }
        }
    }, [])

    useEffect(() => {
        if (user) {
            navigate('/admin/proyek', { replace: true })
        }
    }, [user, navigate])

    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.focus()
        }
    }, [error])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username.trim() || !password) {
            setError('Username dan password wajib diisi.')
            return
        }

        setError('')
        setSubmitting(true)

        const result = await login(username, password, remember)

        if (result.success) {
            navigate('/admin/proyek', { replace: true })
        } else {
            if (result.status === 429) {
                setError('Terlalu banyak percobaan. Silakan coba lagi nanti.')
            } else {
                const msg = result.data?.message || 'Username atau password salah.'
                setError(msg)
            }
            setSubmitting(false)
        }
    }

    return (
        <div className="admin-login-wrapper">
            <div className="admin-login-frame">
                <Link to="/" className="admin-back-link">
                    ‹ Kembali ke situs
                </Link>

                <div className="admin-login-card">
                    <div className="admin-login-site-name">David Reza W.</div>
                    <h1 className="admin-login-title">Masuk ke panel admin</h1>
                    <p className="admin-login-subtitle">Kelola proyek di portofolio kamu.</p>

                    {error && (
                        <div
                            className="admin-error-banner"
                            role="alert"
                            tabIndex="-1"
                            ref={errorRef}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="admin-login-form">
                        <div className="admin-form-group">
                            <label htmlFor="admin-username">Username</label>
                            <input
                                id="admin-username"
                                type="text"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck="false"
                                placeholder="Username"
                                required
                            />
                        </div>

                        <div className="admin-form-group">
                            <label htmlFor="admin-password">Password</label>
                            <div className="admin-input-wrapper">
                                <input
                                    id="admin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="admin-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        {showPassword ? (
                                            <>
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </>
                                        ) : (
                                            <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="admin-checkbox-group">
                            <input
                                id="admin-remember"
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            <label htmlFor="admin-remember">Ingat saya</label>
                        </div>

                        <button
                            type="submit"
                            className="admin-submit-btn"
                            disabled={submitting}
                        >
                            {submitting ? 'Memproses…' : 'Masuk'}
                        </button>
                    </form>

                    <p className="admin-login-footer-note">Hanya untuk pemilik situs.</p>
                </div>
            </div>
        </div>
    )
}
