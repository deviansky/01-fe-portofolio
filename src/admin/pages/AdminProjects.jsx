import React, { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAdminProjects, deleteAdminProject } from '../lib/adminApi'
import { categoryLabel } from '../../lib/format'
import ProjectCover from '../../components/ProjectCover'
import '../styles/adminProjects.css'

export default function AdminProjects() {
    const [searchParams, setSearchParams] = useSearchParams()

    // Read URL Query Params
    const qParam = searchParams.get('q') || ''
    const categoryParam = searchParams.get('category') || 'Semua'
    const statusParam = searchParams.get('status') || 'Semua'
    const sortParam = searchParams.get('sort') || 'newest'
    const pageParam = parseInt(searchParams.get('page') || '1', 10)

    // Local state for debounced search input
    const [searchInput, setSearchInput] = useState(qParam)
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [totalAll, setTotalAll] = useState(0)
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, project: null })
    const [deleting, setDeleting] = useState(false)

    // Helper untuk mengekstrak string judul dari objek translatable
    const getTitle = (t) => (typeof t === 'object' && t !== null ? (t.id || t.en || '') : (t || ''))

    // Sync searchInput when qParam in URL changes externally
    useEffect(() => {
        setSearchInput(qParam)
    }, [qParam])

    // Debounce search input update to URL (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchInput !== qParam) {
                updateParams({ q: searchInput, page: 1 })
            }
        }, 300)

        return () => clearTimeout(handler)
    }, [searchInput, qParam])

    // Helper to update search params while preserving existing ones
    const updateParams = (newParams) => {
        const params = new URLSearchParams(searchParams)

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === '' || value === 'Semua' || (key === 'sort' && value === 'newest') || (key === 'page' && value === 1)) {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })

        setSearchParams(params, { replace: true })
    }

    const isFilterActive = qParam !== '' || categoryParam !== 'Semua' || statusParam !== 'Semua'

    // Fetch projects from API
    const fetchProjects = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getAdminProjects({
                search: qParam,
                category: categoryParam,
                status: statusParam,
                sort: sortParam,
                page: pageParam,
            })
            setProjects(data.data || [])
            setMeta(data.meta || { current_page: 1, last_page: 1, total: data.data?.length || 0 })

            if (!isFilterActive) {
                setTotalAll(data.meta?.total || data.data?.length || 0)
            }
        } catch (err) {
            console.error('Failed to fetch projects:', err)
            setError('Gagal memuat daftar proyek. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }, [qParam, categoryParam, statusParam, sortParam, pageParam, isFilterActive])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    }

    const handleDelete = async () => {
        if (!deleteModal.project) return
        setDeleting(true)
        try {
            await deleteAdminProject(deleteModal.project.id)
            setDeleteModal({ isOpen: false, project: null })
            fetchProjects()
        } catch (err) {
            console.error('Failed to delete project:', err)
            alert('Gagal menghapus proyek.')
        } finally {
            setDeleting(false)
        }
    }

    const handleResetFilters = () => {
        setSearchInput('')
        setSearchParams(sortParam !== 'newest' ? { sort: sortParam } : {}, { replace: true })
    }

    return (
        <div className="admin-projects-container">
            {/* Header */}
            <div className="admin-projects-header">
                <h1 className="admin-projects-title">Proyek</h1>
                <Link to="/admin/proyek/baru" className="admin-btn admin-btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Tambah proyek
                </Link>
            </div>

            {/* Toolbar Row */}
            <div className="admin-toolbar-row">
                <div className="admin-search-wrapper">
                    <span className="admin-search-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Cari judul atau teknologi…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>

                <div className="admin-mobile-select-grid" style={{ display: 'contents' }}>
                    <select
                        id="filter-category"
                        className={`admin-control-select ${categoryParam !== 'Semua' ? 'active' : ''}`}
                        value={categoryParam}
                        onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
                    >
                        <option value="Semua">Semua kategori</option>
                        <option value="ERP">ERP & sistem internal</option>
                        <option value="Web">Web</option>
                        <option value="Mobile">Mobile</option>
                    </select>

                    <select
                        id="filter-status"
                        className={`admin-control-select ${statusParam !== 'Semua' ? 'active' : ''}`}
                        value={statusParam}
                        onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
                    >
                        <option value="Semua">Semua status</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>

                {isFilterActive && (
                    <button type="button" onClick={handleResetFilters} className="admin-reset-btn">
                        Reset filter
                    </button>
                )}

                <div className="admin-toolbar-right">
                    <span className="admin-count-text">
                        {isFilterActive && totalAll > 0
                            ? `${meta.total} dari ${totalAll} proyek`
                            : `${meta.total} proyek`}
                    </span>

                    <select
                        className="admin-control-select"
                        value={sortParam}
                        onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
                    >
                        <option value="newest">Terbaru</option>
                        <option value="oldest">Terlama</option>
                        <option value="title_asc">Judul A–Z</option>
                    </select>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="admin-empty-state" style={{ color: 'var(--danger)' }}>
                    <p>{error}</p>
                    <button type="button" onClick={fetchProjects} className="admin-btn admin-btn-secondary">
                        Coba lagi
                    </button>
                </div>
            )}

            {/* Loading state */}
            {loading && !error && (
                <div className="admin-empty-state">
                    <p className="admin-empty-text">Memuat proyek...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && projects.length === 0 && !isFilterActive && (
                <div className="admin-empty-state">
                    <p className="admin-empty-text">Belum ada proyek. Tambahkan proyek pertama kamu.</p>
                    <Link to="/admin/proyek/baru" className="admin-btn admin-btn-primary">
                        Tambah proyek
                    </Link>
                </div>
            )}

            {!loading && !error && projects.length === 0 && isFilterActive && (
                <div className="admin-empty-state">
                    <p className="admin-empty-text">Tidak ada proyek yang cocok.</p>
                    <button type="button" onClick={handleResetFilters} className="admin-btn admin-btn-secondary">
                        Reset filter
                    </button>
                </div>
            )}

            {/* Desktop Table View */}
            {!loading && !error && projects.length > 0 && (
                <>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Sampul</th>
                                    <th>Judul</th>
                                    <th>EN</th>
                                    <th>Kategori</th>
                                    <th>Tahun</th>
                                    <th>Status</th>
                                    <th>Unggulan</th>
                                    <th>Diubah</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => {
                                    const displayTitle = getTitle(project.title)
                                    // format project title string untuk ProjectCover
                                    const projForCover = { ...project, title: displayTitle }

                                    return (
                                        <tr key={project.id}>
                                            <td>
                                                <div className="admin-cover-mini">
                                                    <ProjectCover project={projForCover} />
                                                </div>
                                            </td>

                                            <td>
                                                <div className="admin-project-meta">
                                                    <Link to={`/admin/proyek/${project.id}`} className="admin-project-title-link">
                                                        {displayTitle}
                                                    </Link>
                                                    <span className="admin-project-slug">/proyek/{project.slug}</span>
                                                </div>
                                            </td>

                                            <td>
                                                {project.has_english ? (
                                                    <span className="admin-badge admin-badge-published" title="Terjemahan Bahasa Inggris tersedia" style={{ fontSize: '0.75rem', padding: '2px 6px' }}>
                                                        ✓ EN
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>-</span>
                                                )}
                                            </td>

                                            <td>{categoryLabel(project.category)}</td>
                                            <td>{project.year}</td>

                                            <td>
                                                <span className={`admin-badge admin-badge-${project.status}`}>
                                                    {project.status === 'published' ? 'Published' : 'Draft'}
                                                </span>
                                            </td>

                                            <td>
                                                {project.is_featured && (
                                                    <span className="admin-badge admin-badge-featured">
                                                        Unggulan
                                                    </span>
                                                )}
                                            </td>

                                            <td>{formatDate(project.updated_at)}</td>

                                            <td>
                                                <div className="admin-actions">
                                                    <Link to={`/admin/proyek/${project.id}`} className="admin-action-link">
                                                        Edit
                                                    </Link>

                                                    {project.status === 'published' && (
                                                        <a
                                                            href={`/proyek/${project.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="admin-action-link"
                                                        >
                                                            Lihat di situs
                                                        </a>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="admin-action-btn-delete"
                                                        onClick={() => setDeleteModal({ isOpen: true, project })}
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards View */}
                    <div className="admin-cards-list">
                        {projects.map((project) => {
                            const displayTitle = getTitle(project.title)
                            const projForCover = { ...project, title: displayTitle }

                            return (
                                <div key={project.id} className="admin-project-card">
                                    <div className="admin-card-header">
                                        <div className="admin-cover-mini">
                                            <ProjectCover project={projForCover} />
                                        </div>
                                        <div className="admin-project-meta" style={{ flex: 1 }}>
                                            <Link to={`/admin/proyek/${project.id}`} className="admin-project-title-link">
                                                {displayTitle}
                                            </Link>
                                            <span className="admin-project-slug">/proyek/{project.slug}</span>
                                            <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-1)', alignItems: 'center' }}>
                                                <span className={`admin-badge admin-badge-${project.status}`}>
                                                    {project.status === 'published' ? 'Published' : 'Draft'}
                                                </span>
                                                {project.has_english && (
                                                    <span className="admin-badge admin-badge-published" style={{ fontSize: '0.7rem', padding: '1px 5px' }}>✓ EN</span>
                                                )}
                                                {project.is_featured && (
                                                    <span className="admin-badge admin-badge-featured">Unggulan</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="admin-card-footer">
                                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                                            {categoryLabel(project.category)} · {project.year} · {formatDate(project.updated_at)}
                                        </span>

                                        <div className="admin-actions">
                                            <Link to={`/admin/proyek/${project.id}`} className="admin-action-link">
                                                Edit
                                            </Link>
                                            {project.status === 'published' && (
                                                <a
                                                    href={`/proyek/${project.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="admin-action-link"
                                                >
                                                    Lihat di situs
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                className="admin-action-btn-delete"
                                                onClick={() => setDeleteModal({ isOpen: true, project })}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--s-2)', marginTop: 'var(--s-4)' }}>
                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                disabled={pageParam <= 1}
                                onClick={() => updateParams({ page: pageParam - 1 })}
                            >
                                Sebelumnya
                            </button>
                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 var(--s-3)', fontSize: 'var(--fs-sm)' }}>
                                Halaman {meta.current_page} dari {meta.last_page}
                            </span>
                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                disabled={pageParam >= meta.last_page}
                                onClick={() => updateParams({ page: pageParam + 1 })}
                            >
                                Selanjutnya
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && deleteModal.project && (
                <div className="admin-modal-backdrop" onClick={() => !deleting && setDeleteModal({ isOpen: false, project: null })}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="admin-modal-title">Konfirmasi Hapus</h3>
                        <div className="admin-modal-body">
                            Hapus proyek &quot;{getTitle(deleteModal.project.title)}&quot;? Tindakan ini tidak bisa dibatalkan.
                        </div>
                        <div className="admin-modal-footer">
                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                disabled={deleting}
                                onClick={() => setDeleteModal({ isOpen: false, project: null })}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                className="admin-btn admin-btn-danger-solid"
                                disabled={deleting}
                                onClick={handleDelete}
                            >
                                {deleting ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
