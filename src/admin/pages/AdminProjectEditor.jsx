import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useLocation, useBlocker, Link } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import DOMPurify from 'dompurify'

import { PROJECT_CATEGORIES } from '../../lib/format'
import { getAdminProject, createAdminProject, updateAdminProject, uploadAdminImage, getAdminProjects } from '../lib/adminApi'
import PreviewFrame from '../components/PreviewFrame'
import ProjectCard from '../../components/project/ProjectCard'
import ProjectModalContent from '../../components/project/ProjectModalContent'
import ProjectDetailContent from '../../components/project/ProjectDetailContent'
import ProjectCover from '../../components/ProjectCover'
import '../styles/adminProjectEditor.css'

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

export default function AdminProjectEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isEdit = Boolean(id)

    const [loading, setLoading] = useState(isEdit)
    const [notFound, setNotFound] = useState(false)
    const [isDirty, setIsDirtyState] = useState(false)
    const isDirtyRef = React.useRef(false)

    const setIsDirty = useCallback((val) => {
        isDirtyRef.current = val
        setIsDirtyState(val)
    }, [])

    const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'unsaved'
    const [lastSavedTime, setLastSavedTime] = useState('')
    const [errors, setErrors] = useState({})
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

    // Suggestion options from API & existing projects
    const [skillSuggestions, setSkillSuggestions] = useState([])
    const [tagInputText, setTagInputText] = useState('')

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'ERP & sistem internal',
        year: new Date().getFullYear().toString(),
        role: '',
        is_featured: false,
        is_confidential: false,
        summary: '',
        thumbnail_path: '',
        thumbnail_url: '',
        description: '',
        highlights: [],
        stack: [],
        demo_url: '',
        repo_url: '',
        images: [],
        status: 'draft',
    })

    // Debounced preview data (300ms) with fallback when fields are empty
    const [debouncedData, setDebouncedData] = useState(formData)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedData(formData)
        }, 300)
        return () => clearTimeout(handler)
    }, [formData])

    const previewData = useMemo(() => {
        return {
            ...debouncedData,
            title: debouncedData.title?.trim() || 'Judul proyek',
            category: debouncedData.category || 'ERP & sistem internal',
            summary: debouncedData.summary?.trim() || 'Ringkasan singkat proyek akan muncul di sini.',
            year: debouncedData.year || new Date().getFullYear().toString(),
            stack: debouncedData.stack.length > 0 ? debouncedData.stack : ['Teknologi'],
        }
    }, [debouncedData])

    // Upload States
    const [coverProgress, setCoverProgress] = useState(0)
    const [coverUploading, setCoverUploading] = useState(false)
    const [coverError, setCoverError] = useState('')
    const [galleryUploading, setGalleryUploading] = useState(false)

    // Dialog States
    const [linkDialogOpen, setLinkDialogOpen] = useState(false)
    const [linkUrlInput, setLinkUrlInput] = useState('')
    const [imageDialogOpen, setImageDialogOpen] = useState(false)
    const [imageAltInput, setImageAltInput] = useState('')
    const [pendingImageFile, setPendingImageFile] = useState(null)
    const [imageUploading, setImageUploading] = useState(false)

    // Layout View Controls
    const [mobileTab, setMobileTab] = useState('form') // 'form' | 'preview'
    const [previewTab, setPreviewTab] = useState('page') // 'card' | 'modal' | 'page'
    const [previewViewport, setPreviewViewport] = useState('desktop') // 'desktop' (1100) | 'mobile' (390)

    // React Router Blocker for unsaved changes
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirtyRef.current && currentLocation.pathname !== nextLocation.pathname
    )

    useEffect(() => {
        if (blocker.state === 'blocked') {
            const confirmLeave = window.confirm(
                'Ada perubahan yang belum disimpan. Anda yakin ingin meninggalkan halaman ini?'
            )
            if (confirmLeave) {
                blocker.proceed()
            } else {
                blocker.reset()
            }
        }
    }, [blocker])

    // Window beforeunload listener
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirtyRef.current) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [])

    // TipTap Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            LinkExtension.configure({ openOnClick: false }),
            ImageExtension,
            Placeholder.configure({
                placeholder: 'Ceritakan masalahnya, peran kamu, keputusan teknis, dan hasilnya.',
            }),
        ],
        content: formData.description,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            setFormData((prev) => ({ ...prev, description: html }))
            setIsDirty(true)
            setSaveStatus('unsaved')
        },
    })

    // Sync editor content when formData.description changes on initial load
    useEffect(() => {
        if (editor && formData.description && editor.getHTML() !== formData.description) {
            editor.commands.setContent(formData.description)
        }
    }, [formData.description, editor])

    const [showExtraDetails, setShowExtraDetails] = useState(false)

    // Fetch initial project data (for Edit mode) & tag suggestions
    useEffect(() => {
        let isSubscribed = true

        // Fetch skills from public portfolio API
        fetch('http://localhost:8000/api/portfolio')
            .then((res) => res.json())
            .then((data) => {
                if (!isSubscribed) return
                const skillNames = (data.profile?.skills || []).map((s) => s.name)
                setSkillSuggestions((prev) => Array.from(new Set([...prev, ...skillNames])))
            })
            .catch(() => { })

        // Fetch existing admin projects stack
        getAdminProjects({ page: 1 })
            .then((res) => {
                if (!isSubscribed) return
                const existingProjects = res.data || []
                const projectStacks = existingProjects.flatMap((p) => p.stack || [])
                setSkillSuggestions((prev) => Array.from(new Set([...prev, ...projectStacks])).sort())
            })
            .catch(() => { })

        if (isEdit) {
            setLoading(true)
            getAdminProject(id)
                .then((res) => {
                    if (!isSubscribed) return
                    const data = res?.data
                    if (!data || res?.message === 'Not Found' || !data.id) {
                        setNotFound(true)
                        return
                    }
                    setFormData({
                        title: data.title || '',
                        slug: data.slug || '',
                        category: data.category || 'web',
                        year: data.year ? data.year.toString() : new Date().getFullYear().toString(),
                        role: data.role || '',
                        is_featured: Boolean(data.is_featured),
                        is_confidential: Boolean(data.is_confidential),
                        summary: data.summary || '',
                        thumbnail_path: data.thumbnail_path || '',
                        thumbnail_url: data.thumbnail_url || '',
                        description: data.description || '',
                        highlights: data.highlights || [],
                        stack: data.stack || [],
                        demo_url: data.demo_url || '',
                        repo_url: data.repo_url || '',
                        images: data.images || [],
                        status: data.status || 'published',
                    })
                    setIsSlugManuallyEdited(true)
                    setNotFound(false)
                })
                .catch(() => {
                    if (isSubscribed) setNotFound(true)
                })
                .finally(() => {
                    if (isSubscribed) setLoading(false)
                })
        } else {
            setLoading(false)
        }

        return () => {
            isSubscribed = false
        }
    }, [id, isEdit])

    // Handle form field change
    const handleChange = (field, value) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value }

            // Auto slug from title
            if (field === 'title' && !isSlugManuallyEdited) {
                updated.slug = slugify(value)
            }

            return updated
        })
        setIsDirty(true)
        setSaveStatus('unsaved')
        setErrors((prev) => ({ ...prev, [field]: null }))
    }

    // Cover image upload
    const handleCoverUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setCoverUploading(true)
        setCoverError('')
        setCoverProgress(0)

        try {
            const res = await uploadAdminImage(file, (percent) => {
                setCoverProgress(percent)
            })
            handleChange('thumbnail_path', res.path)
            setFormData((prev) => ({ ...prev, thumbnail_url: res.url }))
        } catch (err) {
            setCoverError(err.message || 'Gagal mengunggah gambar sampul.')
        } finally {
            setCoverUploading(false)
        }
    }

    // Stack Tag Add / Remove
    const handleAddTag = (tag) => {
        const cleanTag = tag.trim()
        if (!cleanTag) return
        const exists = formData.stack.some((s) => s.toLowerCase() === cleanTag.toLowerCase())
        if (!exists) {
            handleChange('stack', [...formData.stack, cleanTag])
        }
        setTagInputText('')
    }

    const handleRemoveTag = (index) => {
        handleChange(
            'stack',
            formData.stack.filter((_, i) => i !== index)
        )
    }

    // Highlights Add / Move / Remove
    const handleAddHighlight = () => {
        handleChange('highlights', [...formData.highlights, ''])
    }

    const handleUpdateHighlight = (index, val) => {
        const updated = [...formData.highlights]
        updated[index] = val
        handleChange('highlights', updated)
    }

    const handleMoveHighlight = (index, direction) => {
        const updated = [...formData.highlights]
        const targetIdx = index + direction
        if (targetIdx < 0 || targetIdx >= updated.length) return
        const temp = updated[index]
        updated[index] = updated[targetIdx]
        updated[targetIdx] = temp
        handleChange('highlights', updated)
    }

    const handleRemoveHighlight = (index) => {
        handleChange(
            'highlights',
            formData.highlights.filter((_, i) => i !== index)
        )
    }

    // Gallery Add / Move / Remove / Caption
    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        setGalleryUploading(true)
        try {
            const newImages = []
            for (const file of files) {
                const res = await uploadAdminImage(file)
                newImages.push({
                    path: res.path,
                    url: res.url,
                    caption: '',
                })
            }
            handleChange('images', [...formData.images, ...newImages])
        } catch (err) {
            alert('Gagal mengunggah beberapa gambar galeri.')
        } finally {
            setGalleryUploading(false)
        }
    }

    const handleUpdateGalleryCaption = (index, caption) => {
        const updated = [...formData.images]
        updated[index] = { ...updated[index], caption }
        handleChange('images', updated)
    }

    const handleMoveGallery = (index, direction) => {
        const updated = [...formData.images]
        const targetIdx = index + direction
        if (targetIdx < 0 || targetIdx >= updated.length) return
        const temp = updated[index]
        updated[index] = updated[targetIdx]
        updated[targetIdx] = temp
        handleChange('images', updated)
    }

    const handleRemoveGallery = (index) => {
        handleChange(
            'images',
            formData.images.filter((_, i) => i !== index)
        )
    }

    // TipTap Link Insert Dialog
    const openLinkDialog = () => {
        const previousUrl = editor?.getAttributes('link').href || ''
        setLinkUrlInput(previousUrl)
        setLinkDialogOpen(true)
    }

    const saveLink = () => {
        if (!linkUrlInput) {
            editor?.chain().focus().unsetLink().run()
        } else {
            editor?.chain().focus().setLink({ href: linkUrlInput }).run()
        }
        setLinkDialogOpen(false)
    }

    // TipTap Image Insert Dialog
    const openImageDialog = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setPendingImageFile(file)
        setImageAltInput('')
        setImageDialogOpen(true)
    }

    const saveEditorImage = async () => {
        if (!pendingImageFile) return
        setImageUploading(true)
        try {
            const res = await uploadAdminImage(pendingImageFile)
            editor?.chain().focus().setImage({ src: res.url, alt: imageAltInput }).run()
            setImageDialogOpen(false)
            setPendingImageFile(null)
        } catch (err) {
            alert('Gagal mengunggah gambar editor.')
        } finally {
            setImageUploading(false)
        }
    }

    // Main Save Handler (Save Draft / Publish)
    const handleSave = async (targetStatus) => {
        setSaveStatus('saving')
        setErrors({})

        const payload = {
            ...formData,
            status: targetStatus ?? formData.status,
            // Filter out empty highlights
            highlights: formData.highlights.filter((h) => h.trim() !== ''),
        }

        try {
            let res
            if (isEdit) {
                res = await updateAdminProject(id, payload)
            } else {
                res = await createAdminProject(payload)
            }

            if (res.errors) {
                setErrors(res.errors)
                setSaveStatus('unsaved')

                // Scroll to first error section
                const firstErrorKey = Object.keys(res.errors)[0]
                const errorElement = document.querySelector(`[data-field="${firstErrorKey}"]`)
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
                return
            }

            const updatedProject = res.data || res
            if (updatedProject && updatedProject.status) {
                setFormData((prev) => ({
                    ...prev,
                    ...updatedProject,
                    year: updatedProject.year ? updatedProject.year.toString() : prev.year,
                }))
            }

            setIsDirty(false)
            setSaveStatus('saved')
            const now = new Date()
            setLastSavedTime(
                `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
            )

            const createdId = res.id || res.data?.id
            if (!isEdit && createdId) {
                // Replace URL to edit mode cleanly without page refresh
                navigate(`/admin/proyek/${createdId}`, { replace: true })
            }
        } catch (err) {
            setSaveStatus('unsaved')
            alert(err.message || 'Gagal menyimpan proyek.')
        }
    }

    // Ctrl+S / Cmd+S Keyboard Shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault()
                handleSave()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [formData, isEdit])

    if (loading) {
        return (
            <div className="admin-loading-screen" role="status">
                <div className="admin-spinner" />
                <p>Memuat data proyek…</p>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="editor-shell" style={{ textAlign: 'center', paddingTop: '80px' }}>
                <h2>Proyek tidak ditemukan.</h2>
                <p className="form-hint" style={{ marginBottom: '24px' }}>
                    Proyek ini mungkin sudah dihapus atau alamatnya salah.
                </p>
                <Link to="/admin/proyek" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
                    Kembali ke daftar proyek
                </Link>
            </div>
        )
    }

    const backQuery = location.search || ''
    const previewWidth = previewViewport === 'desktop' ? 1100 : 390

    return (
        <div className="editor-shell">
            {/* Header Bar */}
            <div className="editor-header">
                <div>
                    <Link to={`/admin/proyek${backQuery}`} className="editor-back">
                        ← Kembali ke daftar proyek
                    </Link>
                    <div className="editor-title-row">
                        <h1 className="editor-title">{isEdit ? 'Edit proyek' : 'Proyek baru'}</h1>
                        <span className={`editor-status-badge ${formData.status}`}>
                            {formData.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                        </span>
                    </div>
                </div>

                {/* Mobile View Toggle (< 1100px) */}
                <div className="editor-view-toggle">
                    <button
                        type="button"
                        className={mobileTab === 'form' ? 'active' : ''}
                        onClick={() => setMobileTab('form')}
                    >
                        Form
                    </button>
                    <button
                        type="button"
                        className={mobileTab === 'preview' ? 'active' : ''}
                        onClick={() => setMobileTab('preview')}
                    >
                        Preview
                    </button>
                </div>
            </div>

            {/* Main 2-Column Grid */}
            <div className="editor-grid">
                {/* Left Column: Form Sections */}
                <div
                    className="editor-form-col"
                    style={{ display: mobileTab === 'form' || window.innerWidth > 1100 ? 'flex' : 'none' }}
                >
                    {/* Section 1: Informasi dasar (Judul, Kategori + Tahun) */}
                    <div className={`editor-section ${errors.title ? 'has-error' : ''}`}>
                        <div className="editor-section-head">
                            <h2 className="editor-section-title">Informasi dasar</h2>
                            <span className="editor-section-badge">Tampil di: Kartu · Modal · Halaman</span>
                        </div>

                        <div className="form-group" data-field="title">
                            <label htmlFor="input-title">Judul proyek *</label>
                            <input
                                id="input-title"
                                type="text"
                                className={`form-input ${errors.title ? 'is-invalid' : ''}`}
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="mis. Module Sales Forces"
                            />
                            <p className="form-hint" style={{ marginTop: '6px', fontSize: '12px' }}>
                                Alamat: /proyek/{formData.slug || slugify(formData.title) || 'eduvision-deteksi-buah'}
                            </p>
                            {errors.title && <p className="form-error">{errors.title[0]}</p>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group" data-field="category">
                                <label htmlFor="select-category">Kategori *</label>
                                <select
                                    id="select-category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                >
                                    {PROJECT_CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                                        <option key={c.key} value={c.key}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" data-field="year">
                                <label htmlFor="input-year">Tahun *</label>
                                <input
                                    id="input-year"
                                    type="text"
                                    className="form-input"
                                    value={formData.year}
                                    onChange={(e) => handleChange('year', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Ringkasan */}
                    <div className={`editor-section ${errors.summary ? 'has-error' : ''}`} data-field="summary">
                        <div className="editor-section-head">
                            <h2 className="editor-section-title">Ringkasan</h2>
                            <span className="editor-section-badge">Tampil di: Kartu · Modal · Halaman</span>
                        </div>
                        <div className="form-group">
                            <textarea
                                className={`form-textarea ${errors.summary ? 'is-invalid' : ''}`}
                                maxLength={300}
                                value={formData.summary}
                                onChange={(e) => handleChange('summary', e.target.value)}
                                placeholder="Ringkasan singkat 1-2 kalimat..."
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                <span className={`form-hint ${formData.summary.length > 160 ? 'warning' : ''}`}>
                                    {formData.summary.length > 160 && 'Di kartu, ringkasan dipotong 3 baris.'}
                                </span>
                                <span className="form-hint">{formData.summary.length}/300</span>
                            </div>
                            {errors.summary && <p className="form-error">{errors.summary[0]}</p>}
                        </div>
                    </div>

                    {/* Section 3: Sampul */}
                    <div className="editor-section" data-field="thumbnail_path">
                        <div className="editor-section-head">
                            <h2 className="editor-section-title">Sampul</h2>
                            <span className="editor-section-badge">Tampil di: Kartu · Modal · Halaman</span>
                        </div>

                        {formData.thumbnail_url ? (
                            <div className="upload-dropzone">
                                <div className="upload-dropzone-inner">
                                    <div className="upload-thumbnail-box">
                                        <img src={formData.thumbnail_url} alt="Preview sampul" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '14px' }}>Sampul proyek terunggah</p>
                                        <p className="form-hint" style={{ margin: 0 }}>Klik "Ganti" untuk memilih gambar sampul lain.</p>
                                    </div>
                                    <div className="upload-preview-actions" style={{ position: 'static' }}>
                                        <label className="btn btn-ghost" style={{ background: 'var(--surface)', cursor: 'pointer' }}>
                                            Ganti
                                            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} hidden />
                                        </label>
                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            style={{ background: 'var(--surface)', color: '#ef4444' }}
                                            onClick={() => {
                                                handleChange('thumbnail_path', '')
                                                setFormData((prev) => ({ ...prev, thumbnail_url: '' }))
                                            }}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <label className="upload-dropzone">
                                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} hidden />
                                <div className="upload-dropzone-inner">
                                    <div className="upload-thumbnail-box" style={{ overflow: 'hidden' }}>
                                        <ProjectCover project={{ category: formData.category, title: formData.title || 'Wireframe' }} />
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '14px' }}>Klik atau geser gambar ke sini untuk mengunggah</p>
                                        <p className="form-hint" style={{ margin: 0 }}>JPG, PNG, atau WebP, maks 4 MB. Kosong = ilustrasi otomatis.</p>
                                    </div>
                                </div>
                            </label>
                        )}

                        {coverUploading && (
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${coverProgress}%` }} />
                            </div>
                        )}

                        {coverError && <p className="form-error" style={{ marginTop: '8px' }}>{coverError}</p>}
                    </div>

                    {/* Section 4: Konten */}
                    <div className={`editor-section ${errors.description ? 'has-error' : ''}`} data-field="description">
                        <div className="editor-section-head">
                            <h2 className="editor-section-title">Konten</h2>
                            <span className="editor-section-badge">Tampil di: Modal · Halaman</span>
                        </div>

                        <div className={`tiptap-wrapper ${errors.description ? 'is-invalid' : ''}`}>
                            <div className="tiptap-toolbar">
                                <button
                                    type="button"
                                    title="Heading 2"
                                    aria-label="Heading 2"
                                    aria-pressed={editor?.isActive('heading', { level: 2 })}
                                    className={`tiptap-btn ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                                >
                                    H2
                                </button>
                                <button
                                    type="button"
                                    title="Heading 3"
                                    aria-label="Heading 3"
                                    aria-pressed={editor?.isActive('heading', { level: 3 })}
                                    className={`tiptap-btn ${editor?.isActive('heading', { level: 3 }) ? 'active' : ''}`}
                                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                                >
                                    H3
                                </button>

                                <div className="tiptap-divider" />

                                <button
                                    type="button"
                                    title="Tebal"
                                    aria-label="Tebal"
                                    aria-pressed={editor?.isActive('bold')}
                                    className={`tiptap-btn ${editor?.isActive('bold') ? 'active' : ''}`}
                                    onClick={() => editor?.chain().focus().toggleBold().run()}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>
                                </button>
                                <button
                                    type="button"
                                    title="Miring"
                                    aria-label="Miring"
                                    aria-pressed={editor?.isActive('italic')}
                                    className={`tiptap-btn ${editor?.isActive('italic') ? 'active' : ''}`}
                                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>
                                </button>

                                <div className="tiptap-divider" />

                                <button
                                    type="button"
                                    title="Daftar poin"
                                    aria-label="Daftar poin"
                                    aria-pressed={editor?.isActive('bulletList')}
                                    className={`tiptap-btn ${editor?.isActive('bulletList') ? 'active' : ''}`}
                                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                                </button>
                                <button
                                    type="button"
                                    title="Daftar nomor"
                                    aria-label="Daftar nomor"
                                    aria-pressed={editor?.isActive('orderedList')}
                                    className={`tiptap-btn ${editor?.isActive('orderedList') ? 'active' : ''}`}
                                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
                                </button>
                                <button
                                    type="button"
                                    title="Kutipan"
                                    aria-label="Kutipan"
                                    aria-pressed={editor?.isActive('blockquote')}
                                    className={`tiptap-btn ${editor?.isActive('blockquote') ? 'active' : ''}`}
                                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>
                                </button>
                                <button
                                    type="button"
                                    title="Blok kode"
                                    aria-label="Blok kode"
                                    aria-pressed={editor?.isActive('codeBlock')}
                                    className={`tiptap-btn ${editor?.isActive('codeBlock') ? 'active' : ''}`}
                                    onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                                </button>

                                <div className="tiptap-divider" />

                                <button
                                    type="button"
                                    title="Tautan"
                                    aria-label="Tautan"
                                    aria-pressed={editor?.isActive('link')}
                                    className={`tiptap-btn ${editor?.isActive('link') ? 'active' : ''}`}
                                    onClick={openLinkDialog}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                </button>

                                <label className="tiptap-btn" title="Gambar" aria-label="Gambar" style={{ cursor: 'pointer' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={openImageDialog} hidden />
                                </label>

                                <button
                                    type="button"
                                    title="Garis pemisah"
                                    aria-label="Garis pemisah"
                                    aria-pressed={false}
                                    className="tiptap-btn"
                                    onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                </button>

                                <div className="tiptap-divider" />

                                <button
                                    type="button"
                                    title="Urungkan"
                                    aria-label="Urungkan"
                                    className="tiptap-btn"
                                    onClick={() => editor?.chain().focus().undo().run()}
                                    disabled={!editor?.can().undo()}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
                                </button>
                                <button
                                    type="button"
                                    title="Ulangi"
                                    aria-label="Ulangi"
                                    className="tiptap-btn"
                                    onClick={() => editor?.chain().focus().redo().run()}
                                    disabled={!editor?.can().redo()}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" /></svg>
                                </button>
                            </div>

                            <EditorContent editor={editor} className="tiptap-content" />
                        </div>

                        {errors.description && <p className="form-error">{errors.description[0]}</p>}
                    </div>

                    {/* Section 5: Detail Tambahan (Accordion, Default Collapsed) */}
                    <div className="editor-section" style={{ borderStyle: showExtraDetails ? 'solid' : 'dashed' }}>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            style={{
                                width: '100%',
                                justifyContent: 'space-between',
                                fontWeight: 600,
                                fontSize: '15px',
                                padding: '12px 16px',
                            }}
                            onClick={() => setShowExtraDetails(!showExtraDetails)}
                        >
                            <span>Detail tambahan (Peran, Teknologi, Tautan, Galeri, Unggulan)</span>
                            <span>{showExtraDetails ? '▲ Sembunyikan' : '▼ Tampilkan'}</span>
                        </button>

                        {showExtraDetails && (
                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Peran */}
                                <div className="form-group" data-field="role">
                                    <label htmlFor="input-role">Peran</label>
                                    <input
                                        id="input-role"
                                        type="text"
                                        className="form-input"
                                        value={formData.role}
                                        onChange={(e) => handleChange('role', e.target.value)}
                                        placeholder="mis. Fullstack Developer"
                                    />
                                </div>

                                {/* Teknologi */}
                                <div className="form-group">
                                    <label>Teknologi (Stack)</label>
                                    <div className="tag-input-container">
                                        {formData.stack.map((tag, idx) => (
                                            <span key={idx} className="tag-badge">
                                                {tag}
                                                <button type="button" className="tag-remove" onClick={() => handleRemoveTag(idx)}>
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            className="tag-field"
                                            placeholder="Ketik teknologi lalu tekan Enter..."
                                            value={tagInputText}
                                            onChange={(e) => setTagInputText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault()
                                                    handleAddTag(tagInputText)
                                                }
                                            }}
                                        />
                                    </div>
                                    {skillSuggestions.length > 0 && (
                                        <div className="tag-suggestions" style={{ marginTop: '8px' }}>
                                            <span className="form-hint">Saran:</span>
                                            {skillSuggestions
                                                .filter((s) => !formData.stack.some((t) => t.toLowerCase() === s.toLowerCase()))
                                                .slice(0, 10)
                                                .map((s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        className="tag-suggestion-chip"
                                                        onClick={() => handleAddTag(s)}
                                                    >
                                                        + {s}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {/* Tautan */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group" data-field="demo_url">
                                        <label htmlFor="input-demo">URL demo</label>
                                        <input
                                            id="input-demo"
                                            type="url"
                                            className={`form-input ${errors.demo_url ? 'is-invalid' : ''}`}
                                            value={formData.demo_url}
                                            onChange={(e) => handleChange('demo_url', e.target.value)}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                    <div className="form-group" data-field="repo_url">
                                        <label htmlFor="input-repo">URL repositori</label>
                                        <input
                                            id="input-repo"
                                            type="url"
                                            className={`form-input ${errors.repo_url ? 'is-invalid' : ''}`}
                                            value={formData.repo_url}
                                            onChange={(e) => handleChange('repo_url', e.target.value)}
                                            placeholder="https://github.com/..."
                                        />
                                    </div>
                                </div>

                                {/* Galeri */}
                                <div className="form-group">
                                    <label>Galeri gambar</label>
                                    {formData.images.map((img, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                gap: '12px',
                                                alignItems: 'center',
                                                marginBottom: '12px',
                                                padding: '12px',
                                                background: 'var(--bg)',
                                                borderRadius: 'var(--r-sm)',
                                            }}
                                        >
                                            <img
                                                src={img.url}
                                                alt={`Galeri ${index + 1}`}
                                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Keterangan gambar (caption opsional)..."
                                                value={img.caption || ''}
                                                onChange={(e) => handleUpdateGalleryCaption(index, e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                disabled={index === 0}
                                                onClick={() => handleMoveGallery(index, -1)}
                                                aria-label="Naik"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                disabled={index === formData.images.length - 1}
                                                onClick={() => handleMoveGallery(index, 1)}
                                                aria-label="Turun"
                                            >
                                                ↓
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                style={{ color: '#ef4444' }}
                                                onClick={() => handleRemoveGallery(index)}
                                                aria-label="Hapus"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}

                                    <label className="btn btn-ghost" style={{ cursor: 'pointer', marginTop: '4px', width: 'fit-content' }}>
                                        {galleryUploading ? 'Mengunggah…' : '+ Unggah Gambar Galeri'}
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleGalleryUpload}
                                            hidden
                                        />
                                    </label>
                                </div>

                                {/* Toggles */}
                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <label className="form-toggle-row">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_featured}
                                            onChange={(e) => handleChange('is_featured', e.target.checked)}
                                        />
                                        <span>Proyek unggulan</span>
                                    </label>

                                    <label className="form-toggle-row">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_confidential}
                                            onChange={(e) => handleChange('is_confidential', e.target.checked)}
                                        />
                                        <span>Proyek internal perusahaan</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Live Preview Frame */}
                <div
                    className="editor-preview-col"
                    style={{ display: mobileTab === 'preview' || window.innerWidth > 1100 ? 'flex' : 'none' }}
                >
                    {/* Controls Bar */}
                    <div className="preview-controls">
                        <div className="preview-tabs">
                            <button
                                type="button"
                                className={`preview-tab-btn ${previewTab === 'card' ? 'active' : ''}`}
                                onClick={() => setPreviewTab('card')}
                            >
                                Kartu
                            </button>
                            <button
                                type="button"
                                className={`preview-tab-btn ${previewTab === 'modal' ? 'active' : ''}`}
                                onClick={() => setPreviewTab('modal')}
                            >
                                Modal
                            </button>
                            <button
                                type="button"
                                className={`preview-tab-btn ${previewTab === 'page' ? 'active' : ''}`}
                                onClick={() => setPreviewTab('page')}
                            >
                                Halaman
                            </button>
                        </div>

                        <div className="preview-viewport-toggle">
                            <button
                                type="button"
                                className={`preview-vp-btn ${previewViewport === 'desktop' ? 'active' : ''}`}
                                onClick={() => setPreviewViewport('desktop')}
                            >
                                Desktop (1100)
                            </button>
                            <button
                                type="button"
                                className={`preview-vp-btn ${previewViewport === 'mobile' ? 'active' : ''}`}
                                onClick={() => setPreviewViewport('mobile')}
                            >
                                Mobile (390)
                            </button>
                        </div>
                    </div>

                    {/* Scaled Preview Frame */}
                    <PreviewFrame width={previewWidth}>
                        {previewTab === 'card' && (
                            <div className="preview-card-wrapper">
                                <div className="preview-card-grid">
                                    <ProjectCard project={previewData} />
                                    <div className="preview-card-dummy">
                                        <ProjectCard
                                            project={{
                                                id: 999,
                                                title: 'Proyek Contoh A',
                                                category: 'ERP & sistem internal',
                                                summary: 'Contoh kartu proyek lain untuk ilustrasi grid.',
                                                stack: ['React', 'Laravel'],
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {previewTab === 'modal' && (
                            <div style={{ padding: '24px', background: 'rgba(0, 0, 0, 0.5)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="pj-modal" style={{ display: 'block', position: 'static', margin: '0 auto', maxWidth: '640px', width: '100%' }}>
                                    <ProjectModalContent project={previewData} />
                                </div>
                            </div>
                        )}

                        {previewTab === 'page' && (
                            <div style={{ padding: '24px 0' }}>
                                <ProjectDetailContent project={previewData} />
                            </div>
                        )}
                    </PreviewFrame>

                    <p className="preview-note">Preview memakai komponen yang sama dengan situs.</p>
                </div>
            </div >

            {/* Sticky Bottom Action Bar */}
            < div className="editor-bottom-bar" >
                <div className="editor-save-status">
                    {saveStatus === 'saving' && <span>Menyimpan…</span>}
                    {saveStatus === 'unsaved' && <span>Belum disimpan</span>}
                    {saveStatus === 'saved' && (
                        <span>{!isEdit && !isDirty ? 'Belum disimpan' : `Tersimpan ${lastSavedTime || 'baru saja'}`}</span>
                    )}
                </div>

                <div className="editor-actions-right">
                    {formData.status === 'published' ? (
                        <>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => handleSave('draft')}
                            >
                                Jadikan draft
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => handleSave('published')}
                            >
                                Simpan perubahan
                            </button>
                            <a
                                href={`/proyek/${formData.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-ghost"
                            >
                                Buka di situs ↗
                            </a>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => handleSave('draft')}
                            >
                                Simpan draft
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => handleSave('published')}
                            >
                                Publikasikan
                            </button>
                        </>
                    )}
                </div>
            </div >

            {/* Inline Dialog: TipTap Link URL */}
            {
                linkDialogOpen && (
                    <div className="editor-dialog-overlay">
                        <div className="editor-dialog">
                            <h3 className="editor-dialog-title">Masukkan Tautan (URL)</h3>
                            <input
                                type="url"
                                className="form-input"
                                value={linkUrlInput}
                                onChange={(e) => setLinkUrlInput(e.target.value)}
                                placeholder="https://..."
                                autoFocus
                            />
                            <div className="editor-dialog-actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setLinkDialogOpen(false)}>
                                    Batal
                                </button>
                                <button type="button" className="btn btn-primary" onClick={saveLink}>
                                    Simpan Tautan
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Inline Dialog: TipTap Image Alt Text */}
            {
                imageDialogOpen && (
                    <div className="editor-dialog-overlay">
                        <div className="editor-dialog">
                            <h3 className="editor-dialog-title">Keterangan Gambar (Alt Text)</h3>
                            <input
                                type="text"
                                className="form-input"
                                value={imageAltInput}
                                onChange={(e) => setImageAltInput(e.target.value)}
                                placeholder="Deskripsi singkat gambar..."
                                autoFocus
                            />
                            <div className="editor-dialog-actions">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setImageDialogOpen(false)
                                        setPendingImageFile(null)
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={imageUploading}
                                    onClick={saveEditorImage}
                                >
                                    {imageUploading ? 'Mengunggah…' : 'Sisipkan Gambar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
