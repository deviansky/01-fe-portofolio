import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { fallbackPortfolio } from '../../data/fallback'
import ProjectFormModal from '../../components/admin/ProjectFormModal'

export default function AdminProjects() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    const [selectedProject, setSelectedProject] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [notice, setNotice] = useState(null)

    const loadProjects = useCallback(async (signal) => {
        setLoading(true)
        setError(null)
        try {
            const res = await api.getAdminProjects({}, signal)
            setProjects(Array.isArray(res) ? res : res.data || [])
        } catch {
            // Fallback ke data lokal jika BE belum menyala
            setProjects(fallbackPortfolio.projects || [])
            setNotice({
                type: 'info',
                text: 'Menggunakan data lokal. Hubungkan ke backend Laravel untuk menyimpan data secara permanen.',
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const controller = new AbortController()
        loadProjects(controller.signal)
        return () => controller.abort()
    }, [loadProjects])

    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            const matchSearch =
                !search.trim() ||
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.slug?.toLowerCase().includes(search.toLowerCase())
            const matchCat = categoryFilter === 'all' || p.category === categoryFilter
            const matchStatus = statusFilter === 'all' || p.status === statusFilter
            return matchSearch && matchCat && matchStatus
        })
    }, [projects, search, categoryFilter, statusFilter])

    const handleCreateNew = () => {
        setSelectedProject(null)
        setIsModalOpen(true)
    }

    const handleEdit = (project) => {
        setSelectedProject(project)
        setIsModalOpen(true)
    }

    const handleDelete = async (project) => {
        if (!window.confirm(`Yakin ingin menghapus proyek "${project.title}"?`)) {
            return
        }

        try {
            await api.deleteProject(project.id)
            setNotice({ type: 'success', text: `Proyek "${project.title}" berhasil dihapus.` })
            setProjects((prev) => prev.filter((p) => p.id !== project.id))
        } catch {
            // Fallback local delete
            setProjects((prev) => prev.filter((p) => p.id !== project.id))
            setNotice({
                type: 'info',
                text: `Proyek "${project.title}" dihapus dari tampilan lokal.`,
            })
        }
    }

    const handleSaveProject = async (payload, file) => {
        let saved
        if (selectedProject?.id) {
            // Update existing
            try {
                saved = await api.updateProject(selectedProject.id, payload)
                if (file) {
                    const upRes = await api.uploadThumbnail(selectedProject.id, file)
                    saved = upRes.data || saved
                }
                setProjects((prev) =>
                    prev.map((p) => (p.id === selectedProject.id ? { ...p, ...payload, ...saved } : p)),
                )
                setNotice({ type: 'success', text: 'Proyek berhasil diperbarui!' })
            } catch {
                // Fallback update local state
                setProjects((prev) =>
                    prev.map((p) =>
                        p.id === selectedProject.id ? { ...p, ...payload, id: selectedProject.id } : p,
                    ),
                )
                setNotice({
                    type: 'info',
                    text: 'Perubahan disimpan di memori browser (mode fallback).',
                })
            }
        } else {
            // Create new
            try {
                saved = await api.createProject(payload)
                const newId = saved?.id || saved?.data?.id
                if (file && newId) {
                    await api.uploadThumbnail(newId, file)
                }
                setProjects((prev) => [saved?.data || saved || { ...payload, id: Date.now() }, ...prev])
                setNotice({ type: 'success', text: 'Proyek baru berhasil ditambahkan!' })
            } catch {
                // Fallback create local state
                const newProj = {
                    ...payload,
                    id: Date.now(),
                    status: payload.status || 'published',
                }
                setProjects((prev) => [newProj, ...prev])
                setNotice({
                    type: 'info',
                    text: 'Proyek baru ditambahkan di memori browser (mode fallback).',
                })
            }
        }
    }

    return (
        <div className="admin-projects-page">
            <div className="admin-page-header">
                <div className="admin-page-title">
                    <h1>Manajemen Proyek</h1>
                    <p>Kelola, buat, edit, dan hapus proyek yang tampil pada portofolio Anda.</p>
                </div>
                <button type="button" className="admin-btn-primary" onClick={handleCreateNew}>
                    <span>+ Tambah Proyek Baru</span>
                </button>
            </div>

            {notice && (
                <div
                    className={`notice ${notice.type === 'success' ? 'notice-ok' : 'notice-info'
                        }`}
                    style={{ marginBottom: '20px' }}
                >
                    <p>{notice.text}</p>
                </div>
            )}

            {/* Toolbar */}
            <div className="admin-toolbar">
                <div className="admin-search-group">
                    <input
                        type="search"
                        className="admin-search-input"
                        placeholder="Cari proyek berdasarkan judul atau slug..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="admin-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Semua Kategori</option>
                        <option value="erp">ERP & Sistem Internal</option>
                        <option value="web">Web</option>
                        <option value="mobile">Mobile</option>
                    </select>
                    <select
                        className="admin-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Semua Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="loading">Memuat data proyek…</div>
            ) : filteredProjects.length === 0 ? (
                <p className="empty" style={{ padding: '32px 0' }}>
                    Tidak ada proyek yang sesuai dengan kriteria filter.
                </p>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Proyek</th>
                                <th>Kategori</th>
                                <th>Tahun & Role</th>
                                <th>Tech Stack</th>
                                <th>Status</th>
                                <th>Badge</th>
                                <th style={{ textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="admin-pj-title">{p.title}</div>
                                        <div className="admin-pj-slug">/{p.slug}</div>
                                    </td>
                                    <td>
                                        <span className="badge badge-category">{p.category}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{p.year || '-'}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                                            {p.role || '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: 'var(--ink-soft)',
                                                maxWidth: '220px',
                                            }}
                                        >
                                            {Array.isArray(p.stack) ? p.stack.join(', ') : '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${p.status === 'published' ? 'badge-published' : 'badge-draft'
                                                }`}
                                        >
                                            {p.status || 'published'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {p.is_featured && <span className="badge badge-featured">Featured</span>}
                                            {p.is_confidential && (
                                                <span className="badge badge-confidential">Internal</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div
                                            style={{
                                                display: 'inline-flex',
                                                gap: '8px',
                                                justifyContent: 'flex-end',
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="admin-btn-secondary"
                                                onClick={() => handleEdit(p)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-btn-secondary admin-btn-danger"
                                                onClick={() => handleDelete(p)}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <ProjectFormModal
                    project={selectedProject}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProject}
                />
            )}
        </div>
    )
}
