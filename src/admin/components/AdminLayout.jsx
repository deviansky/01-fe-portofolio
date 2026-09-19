import React, { useState, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAdminUnreadMessagesCount } from '../lib/adminApi'
import '../styles/adminLayout.css'

export default function AdminLayout() {
    const { logout } = useAuth()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        let isSubscribed = true
        const fetchUnread = () => {
            getAdminUnreadMessagesCount()
                .then((res) => {
                    if (isSubscribed && res?.unread_count !== undefined) {
                        setUnreadCount(res.unread_count)
                    }
                })
                .catch(() => {})
        }

        fetchUnread()
        const interval = setInterval(fetchUnread, 15000)

        return () => {
            isSubscribed = false
            clearInterval(interval)
        }
    }, [])

    const handleLogout = async () => {
        try {
            await logout()
        } catch (err) {
            console.error('Logout error:', err)
        }
    }

    const closeMobile = () => setIsMobileOpen(false)

    return (
        <div className="admin-shell">
            {/* Mobile Top Header */}
            <div className="admin-mobile-header">
                <span className="admin-sidebar-brand">Admin</span>
                <button
                    className="admin-mobile-toggle"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    aria-label="Toggle Menu"
                >
                    Menu
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && <div className="admin-overlay" onClick={closeMobile} />}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isMobileOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <NavLink to="/admin/proyek" className="admin-sidebar-brand" onClick={closeMobile}>
                        Admin
                    </NavLink>
                </div>

                <nav className="admin-nav">
                    <NavLink
                        to="/admin/proyek"
                        className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                        onClick={closeMobile}
                    >
                        Proyek
                    </NavLink>

                    <NavLink
                        to="/admin/pesan"
                        className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                        onClick={closeMobile}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <span>Pesan</span>
                        {unreadCount > 0 && (
                            <span className="admin-badge admin-badge-draft" style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 6px' }}>
                                {unreadCount}
                            </span>
                        )}
                    </NavLink>

                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-nav-item"
                        onClick={closeMobile}
                    >
                        Lihat situs ↗
                    </a>

                    <button
                        type="button"
                        className="admin-nav-item"
                        onClick={() => {
                            closeMobile()
                            handleLogout()
                        }}
                    >
                        Keluar
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    )
}
