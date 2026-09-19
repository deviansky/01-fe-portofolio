import React, { useState, useEffect } from 'react'
import {
    getAdminMessages,
    getAdminMessage,
    toggleAdminMessageRead,
    deleteAdminMessage,
} from '../lib/adminApi'

export default function AdminMessages() {
    const [messages, setMessages] = useState([])
    const [selectedMessage, setSelectedMessage] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'unread' | 'read'
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [detailLoading, setDetailLoading] = useState(false)
    const [error, setError] = useState(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    // Mobile navigation state
    const [showDetailMobile, setShowDetailMobile] = useState(false)

    // Fetch messages list
    const fetchMessages = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getAdminMessages({
                status: statusFilter,
                search: searchQuery,
            })
            const list = data.data || []
            setMessages(list)

            // If selectedMessage is no longer in list, keep it or sync
            if (selectedMessage) {
                const refreshed = list.find((m) => m.id === selectedMessage.id)
                if (refreshed) {
                    setSelectedMessage((prev) => ({ ...prev, ...refreshed }))
                }
            }
        } catch (err) {
            setError('Gagal memuat pesan masuk.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMessages()
    }, [statusFilter, searchQuery])

    // Select a message and fetch full details (auto marks as read)
    const handleSelectMessage = async (msg) => {
        setSelectedMessage(msg)
        setShowDetailMobile(true)
        setDetailLoading(true)

        try {
            const fullMsg = await getAdminMessage(msg.id)
            setSelectedMessage(fullMsg)
            // Update read_at state in the list
            setMessages((prevList) =>
                prevList.map((m) => (m.id === msg.id ? { ...m, read_at: fullMsg.read_at } : m))
            )
        } catch (err) {
            console.error('Error opening message:', err)
        } finally {
            setDetailLoading(false)
        }
    }

    // Toggle read/unread status
    const handleToggleRead = async () => {
        if (!selectedMessage) return
        try {
            const updated = await toggleAdminMessageRead(selectedMessage.id)
            setSelectedMessage(updated)
            setMessages((prevList) =>
                prevList.map((m) => (m.id === selectedMessage.id ? { ...m, read_at: updated.read_at } : m))
            )
        } catch (err) {
            alert('Gagal mengubah status pesan.')
        }
    }

    // Delete message
    const handleDeleteMessage = async () => {
        if (!selectedMessage) return
        try {
            await deleteAdminMessage(selectedMessage.id)
            setDeleteModalOpen(false)
            setMessages((prevList) => prevList.filter((m) => m.id !== selectedMessage.id))
            setSelectedMessage(null)
            setShowDetailMobile(false)
        } catch (err) {
            alert('Gagal menghapus pesan.')
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const d = new Date(dateString)
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="admin-page-container">
            {/* Page Header */}
            <div className="admin-header-group" style={{ marginBottom: '20px' }}>
                <h1 className="admin-title">Pesan Masuk</h1>
                <p className="admin-subtitle">Kelola pesan dan pertanyaan dari pengunjung situs.</p>
            </div>

            {/* Split View Container */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth > 900 ? '340px 1fr' : '1fr',
                    gap: '20px',
                    minHeight: '600px',
                    background: 'var(--surface)',
                    border: '1px stroke var(--border)',
                    borderRadius: 'var(--r-md, 8px)',
                    overflow: 'hidden',
                }}
            >
                {/* Left Column: Messages List */}
                <div
                    style={{
                        display: showDetailMobile && window.innerWidth <= 900 ? 'none' : 'flex',
                        flexDirection: 'column',
                        borderRight: window.innerWidth > 900 ? '1px stroke var(--border)' : 'none',
                        background: 'var(--surface)',
                    }}
                >
                    {/* Filters & Search Toolbar */}
                    <div style={{ padding: '16px', borderBottom: '1px stroke var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Filter Tabs */}
                        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg)', padding: '4px', borderRadius: '6px' }}>
                            <button
                                type="button"
                                className={`preview-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('all')}
                                style={{ flex: 1, textAlign: 'center', fontSize: '13px' }}
                            >
                                Semua
                            </button>
                            <button
                                type="button"
                                className={`preview-tab-btn ${statusFilter === 'unread' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('unread')}
                                style={{ flex: 1, textAlign: 'center', fontSize: '13px' }}
                            >
                                Belum dibaca
                            </button>
                            <button
                                type="button"
                                className={`preview-tab-btn ${statusFilter === 'read' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('read')}
                                style={{ flex: 1, textAlign: 'center', fontSize: '13px' }}
                            >
                                Sudah dibaca
                            </button>
                        </div>

                        {/* Search Input */}
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Cari nama, email, subjek..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ fontSize: '13px', padding: '8px 12px' }}
                        />
                    </div>

                    {/* Message List Items */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Memuat pesan...
                            </div>
                        ) : error ? (
                            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#ef4444' }}>
                                {error}
                            </div>
                        ) : messages.length === 0 ? (
                            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                Tidak ada pesan.
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isUnread = !msg.read_at
                                const isSelected = selectedMessage?.id === msg.id

                                return (
                                    <div
                                        key={msg.id}
                                        onClick={() => handleSelectMessage(msg)}
                                        style={{
                                            padding: '14px 16px',
                                            borderBottom: '1px stroke var(--border)',
                                            cursor: 'pointer',
                                            background: isSelected ? 'var(--bg)' : 'transparent',
                                            transition: 'background 0.15s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {isUnread && (
                                                    <span
                                                        style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            background: 'var(--route, #3b82f6)',
                                                            display: 'inline-block',
                                                        }}
                                                    />
                                                )}
                                                <span style={{ fontWeight: isUnread ? 700 : 500, fontSize: '14px' }}>
                                                    {msg.name}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {formatDate(msg.created_at)}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: '13px', fontWeight: isUnread ? 600 : 400, color: 'var(--fg)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {msg.subject || '(Tanpa subjek)'}
                                        </div>

                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {msg.message}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Right Column: Message Detail View */}
                <div
                    style={{
                        display: !showDetailMobile && window.innerWidth <= 900 ? 'none' : 'flex',
                        flexDirection: 'column',
                        padding: '24px',
                        background: 'var(--surface)',
                        overflowY: 'auto',
                    }}
                >
                    {/* Mobile Back Button */}
                    {showDetailMobile && window.innerWidth <= 900 && (
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setShowDetailMobile(false)}
                            style={{ alignSelf: 'flex-start', marginBottom: '16px' }}
                        >
                            ← Kembali ke daftar pesan
                        </button>
                    )}

                    {selectedMessage ? (
                        detailLoading ? (
                            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Memuat detail pesan...
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                {/* Detail Header & Action Buttons */}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        paddingBottom: '16px',
                                        marginBottom: '20px',
                                        borderBottom: '1px stroke var(--border)',
                                        flexWrap: 'wrap',
                                        gap: '12px',
                                    }}
                                >
                                    <div>
                                        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>
                                            {selectedMessage.name}
                                        </h2>
                                        <p style={{ margin: '0 0 2px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                            &lt;{selectedMessage.email}&gt;
                                        </p>
                                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {formatDate(selectedMessage.created_at)}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <a
                                            href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || '')}`}
                                            className="btn btn-ghost"
                                            style={{ fontSize: '13px', padding: '6px 12px' }}
                                        >
                                            Balas via email ↗
                                        </a>

                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            onClick={handleToggleRead}
                                            style={{ fontSize: '13px', padding: '6px 12px' }}
                                        >
                                            {selectedMessage.read_at ? 'Tandai belum dibaca' : 'Tandai dibaca'}
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            onClick={() => setDeleteModalOpen(true)}
                                            style={{ fontSize: '13px', padding: '6px 12px', color: '#ef4444' }}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>

                                {/* Subject */}
                                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px' }}>
                                    {selectedMessage.subject || '(Tanpa subjek)'}
                                </h3>

                                {/* Message Body */}
                                <div
                                    style={{
                                        fontSize: '15px',
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        color: 'var(--fg)',
                                        flex: 1,
                                    }}
                                >
                                    {selectedMessage.message}
                                </div>
                            </div>
                        )
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                minHeight: '300px',
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                            }}
                        >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.5 }}>
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <p style={{ fontSize: '15px', margin: 0 }}>Pilih pesan untuk membaca</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Delete Modal */}
            {deleteModalOpen && (
                <div className="editor-dialog-overlay">
                    <div className="editor-dialog">
                        <h3 className="editor-dialog-title">Hapus Pesan?</h3>
                        <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            Apakah Anda yakin ingin menghapus pesan dari "{selectedMessage?.name}"? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="editor-dialog-actions">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ background: '#ef4444', borderColor: '#ef4444', color: '#ffffff' }}
                                onClick={handleDeleteMessage}
                            >
                                Hapus Pesan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
