import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/adminProjects.css'

export default function AdminProjectFormPlaceholder() {
    return (
        <div className="admin-projects-container">
            <div className="admin-projects-header">
                <h1 className="admin-projects-title">Editor Proyek</h1>
            </div>
            <div className="admin-empty-state" style={{ padding: 'var(--s-12) var(--s-4)', backgroundColor: 'var(--surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
                <p style={{ fontSize: 'var(--fs-md)', color: 'var(--ink-soft)', marginBottom: 'var(--s-4)' }}>
                    Editor proyek dibuat di Fase 3.
                </p>
                <Link to="/admin/proyek" className="admin-btn admin-btn-secondary">
                    ← Kembali ke daftar proyek
                </Link>
            </div>
        </div>
    )
}
