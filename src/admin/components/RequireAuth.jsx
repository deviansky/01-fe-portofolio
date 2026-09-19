import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children }) {
    const { user, loading } = useAuth()

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

    if (loading) {
        return (
            <div className="admin-loading-screen" role="status">
                <div className="admin-spinner" />
                <p>Memverifikasi sesi admin…</p>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />
    }

    return children ? children : <Outlet />
}
