import { createContext, useContext, useEffect, useState } from 'react'
import { adminFetch, getCsrfCookie } from '../lib/adminApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const checkAuth = async () => {
        try {
            const res = await adminFetch('/api/me')
            if (res.ok) {
                const data = await res.json()
                setUser(data)
            } else {
                setUser(null)
            }
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    const login = async (username, password, remember = false) => {
        try {
            await getCsrfCookie()
            const res = await adminFetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({ username, password, remember }),
            })

            const data = await res.json().catch(() => ({}))

            if (res.ok) {
                setUser(data)
                return { success: true, data }
            }

            return {
                success: false,
                status: res.status,
                data,
            }
        } catch (err) {
            return {
                success: false,
                status: 500,
                data: { message: 'Terjadi kesalahan jaringan atau server.' },
            }
        }
    }

    const logout = async () => {
        try {
            await adminFetch('/api/logout', { method: 'POST' })
        } finally {
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider')
    }
    return context
}
