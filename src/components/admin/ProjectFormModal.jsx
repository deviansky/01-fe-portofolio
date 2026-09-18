import { useEffect, useState } from 'react'

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

export default function ProjectFormModal({ project, onClose, onSave }) {
    const isEdit = Boolean(project?.id)

    const [form, setForm] = useState({
        title: '',
        slug: '',
        category: 'web',
        status: 'published',
        is_featured: false,
        is_confidential: false,
        role: '',
        year: new Date().getFullYear(),
        summary: '',
        description: '',
        highlights: [''],
        stackStr: '',
        repo_url: '',
        demo_url: '',
        thumbnail_path: '',
    })

    const [thumbnailFile, setThumbnailFile] = useState(null)
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (project) {
            setForm({
                title: project.title || '',
                slug: project.slug || '',
                category: project.category || 'web',
                status: project.status || 'published',
                is_featured: Boolean(project.is_featured),
                is_confidential: Boolean(project.is_confidential),
                role: project.role || '',
                year: project.year || new Date().getFullYear(),
                summary: project.summary || '',
                description: project.description || '',
                highlights: project.highlights?.length ? project.highlights : [''],
                stackStr: Array.isArray(project.stack) ? project.stack.join(', ') : '',
                repo_url: project.repo_url || '',
                demo_url: project.demo_url || '',
                thumbnail_path: project.thumbnail_path || '',
            })
            setSlugManuallyEdited(true)
        }
    }, [project])

    const handleTitleChange = (e) => {
        const val = e.target.value
        setForm((f) => ({
            ...f,
            title: val,
            slug: slugManuallyEdited ? f.slug : slugify(val),
        }))
    }

    const handleSlugChange = (e) => {
        setSlugManuallyEdited(true)
        setForm((f) => ({ ...f, slug: e.target.value }))
    }

    const handleHighlightChange = (index, value) => {
        setForm((f) => {
            const next = [...f.highlights]
            next[index] = value
            return { ...f, highlights: next }
        })
    }

    const addHighlight = () => {
        setForm((f) => ({ ...f, highlights: [...f.highlights, ''] }))
    }

    const removeHighlight = (index) => {
        setForm((f) => ({
            ...f,
            highlights: f.highlights.filter((_, i) => i !== index),
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title.trim() || !form.summary.trim()) {
            setError('Judul dan ringkasan wajib diisi.')
            return
        }

        setSubmitting(true)
        setError(null)

        const payload = {
            title: form.title,
            slug: form.slug.trim() || slugify(form.title),
            category: form.category,
            status: form.status,
            is_featured: form.is_featured,
            is_confidential: form.is_confidential,
            role: form.role,
            year: Number(form.year) || null,
            summary: form.summary,
            description: form.description,
            highlights: form.highlights.filter((h) => h.trim() !== ''),
            stack: form.stackStr
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            repo_url: form.repo_url || null,
            demo_url: form.demo_url || null,
            thumbnail_path: form.thumbnail_path || null,
        }

        try {
            await onSave(payload, thumbnailFile)
            onClose()
        } catch (err) {
            setError(err.message || 'Gagal menyimpan proyek.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2>{isEdit ? 'Edit Proyek' : 'Tambah Proyek Baru'}</h2>
                    <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Tutup">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="admin-modal-body">
                    {error && <div className="notice notice-error">{error}</div>}

                    <div className="form-grid-2">
                        <div className="form-field">
                            <label htmlFor="p-title">Judul Proyek *</label>
                            <input
                                id="p-title"
                                type="text"
                                className="form-input"
                                placeholder="Contoh: TAP Sales ERP"
                                value={form.title}
                                onChange={handleTitleChange}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="p-slug">Slug (URL)</label>
                            <input
                                id="p-slug"
                                type="text"
                                className="form-input"
                                placeholder="tap-sales-erp"
                                value={form.slug}
                                onChange={handleSlugChange}
                            />
                            <span className="form-hint">Otomatis dari judul jika dikosongkan.</span>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-field">
                            <label htmlFor="p-category">Kategori *</label>
                            <select
                                id="p-category"
                                className="form-select"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                <option value="erp">ERP & Sistem Internal</option>
                                <option value="web">Web</option>
                                <option value="mobile">Mobile</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="p-status">Status Publikasi *</label>
                            <select
                                id="p-status"
                                className="form-select"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                            >
                                <option value="published">Published (Tampil di website)</option>
                                <option value="draft">Draft (Sembunyikan)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-field">
                            <label htmlFor="p-role">Peran / Jabatan</label>
                            <input
                                id="p-role"
                                type="text"
                                className="form-input"
                                placeholder="Contoh: Fullstack Developer"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="p-year">Tahun Pengerjaan</label>
                            <input
                                id="p-year"
                                type="number"
                                className="form-input"
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-grid-2" style={{ alignItems: 'center' }}>
                        <label className="form-checkbox-label">
                            <input
                                type="checkbox"
                                checked={form.is_featured}
                                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                            />
                            <span>Unggulkan proyek ini (Top Priority)</span>
                        </label>
                        <label className="form-checkbox-label">
                            <input
                                type="checkbox"
                                checked={form.is_confidential}
                                onChange={(e) => setForm({ ...form, is_confidential: e.target.checked })}
                            />
                            <span>Proyek Internal (Confidential)</span>
                        </label>
                    </div>

                    <div className="form-field">
                        <label htmlFor="p-stack">Teknologi (Tech Stack)</label>
                        <input
                            id="p-stack"
                            type="text"
                            className="form-input"
                            placeholder="Laravel, React, Vite, MySQL (pisahkan dengan koma)"
                            value={form.stackStr}
                            onChange={(e) => setForm({ ...form, stackStr: e.target.value })}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="p-summary">RingkasanSingkat (Summary) *</label>
                        <textarea
                            id="p-summary"
                            className="form-textarea"
                            rows={2}
                            maxLength={300}
                            placeholder="Deskripsi ringkas proyek yang muncul pada kartu..."
                            value={form.summary}
                            onChange={(e) => setForm({ ...form, summary: e.target.value })}
                            required
                        />
                        <span className="form-hint">{form.summary.length}/300 karakter</span>
                    </div>

                    <div className="form-field">
                        <label htmlFor="p-description">Deskripsi Lengkap</label>
                        <textarea
                            id="p-description"
                            className="form-textarea"
                            rows={4}
                            placeholder="Detail penjelasan alur proyek, tantangan, dan solusi..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div className="form-field">
                        <label>Poin Pencapaian / Sorotan (Highlights)</label>
                        <div className="dynamic-list">
                            {form.highlights.map((item, idx) => (
                                <div key={idx} className="dynamic-row">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={`Poin sorotan #${idx + 1}`}
                                        value={item}
                                        onChange={(e) => handleHighlightChange(idx, e.target.value)}
                                    />
                                    {form.highlights.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-row-btn"
                                            onClick={() => removeHighlight(idx)}
                                            title="Hapus baris"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                className="admin-btn-secondary"
                                style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                                onClick={addHighlight}
                            >
                                + Tambah Poin Highlight
                            </button>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-field">
                            <label htmlFor="p-repo">URL Repositori (opsional)</label>
                            <input
                                id="p-repo"
                                type="url"
                                className="form-input"
                                placeholder="https://github.com/username/repo"
                                value={form.repo_url}
                                onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="p-demo">URL Demo Live (opsional)</label>
                            <input
                                id="p-demo"
                                type="url"
                                className="form-input"
                                placeholder="https://proyek-demo.com"
                                value={form.demo_url}
                                onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="p-file">File Gambar Sampul / Thumbnail</label>
                        <input
                            id="p-file"
                            type="file"
                            accept="image/*"
                            className="form-input"
                            onChange={(e) => setThumbnailFile(e.target.files[0] || null)}
                        />
                        {form.thumbnail_path && (
                            <span className="form-hint">Thumbnail saat ini: {form.thumbnail_path}</span>
                        )}
                    </div>

                    <div className="admin-modal-footer">
                        <button
                            type="button"
                            className="admin-btn-secondary"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Batal
                        </button>
                        <button type="submit" className="admin-btn-primary" disabled={submitting}>
                            {submitting ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Proyek'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
