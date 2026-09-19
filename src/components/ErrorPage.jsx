import React from 'react'
import { useRouteError, Link } from 'react-router-dom'

export default function ErrorPage() {
    const error = useRouteError()

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
                background: 'var(--bg, #0f172a)',
                color: 'var(--fg, #f8fafc)',
                fontFamily: 'sans-serif',
            }}
        >
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
                Terjadi kesalahan
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted, #94a3b8)', marginBottom: '24px', maxWidth: '420px', lineHeight: 1.5 }}>
                Terjadi kesalahan. Muat ulang halaman atau kembali ke beranda.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '6px',
                        border: '1px solid var(--border, #334155)',
                        background: 'var(--surface, #1e293b)',
                        color: 'var(--fg, #f8fafc)',
                        fontSize: '14px',
                        cursor: 'pointer',
                    }}
                >
                    Muat ulang
                </button>
                <Link
                    to="/"
                    style={{
                        padding: '10px 18px',
                        borderRadius: '6px',
                        background: 'var(--primary, #3b82f6)',
                        color: '#ffffff',
                        fontSize: '14px',
                        textDecoration: 'none',
                        fontWeight: 500,
                    }}
                >
                    Ke beranda
                </Link>
            </div>

            {import.meta.env.DEV && error && (
                <div
                    style={{
                        marginTop: '32px',
                        padding: '16px',
                        background: '#1e1e1e',
                        color: '#ef4444',
                        borderRadius: '8px',
                        textAlign: 'left',
                        maxWidth: '600px',
                        width: '100%',
                        overflowX: 'auto',
                        fontSize: '12px',
                    }}
                >
                    <strong>Dev Debug Error:</strong>
                    <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                        {error.stack || error.message || JSON.stringify(error)}
                    </pre>
                </div>
            )}
        </div>
    )
}
