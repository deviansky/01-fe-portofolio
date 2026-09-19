function getApiUrl() {
    const envUrl = import.meta.env.VITE_API_URL
    if (typeof envUrl === 'string') {
        const trimmed = envUrl.trim()
        if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed.replace(/\/$/, '')
        }
        if (trimmed !== '') {
            console.warn(`[API] VITE_API_URL "${envUrl}" tidak valid. Harus diawali dengan "/", "http://", atau "https://". Memakai default "/api".`)
        }
    }
    return '/api'
}

const rawApiUrl = getApiUrl()

function getBaseAndCsrf() {
    if (rawApiUrl.startsWith('/')) {
        return {
            apiPrefix: rawApiUrl,
            csrfUrl: '/sanctum/csrf-cookie',
            serverBase: '',
        }
    }
    try {
        const urlObj = new URL(rawApiUrl)
        const origin = urlObj.origin
        return {
            apiPrefix: rawApiUrl,
            csrfUrl: `${origin}/sanctum/csrf-cookie`,
            serverBase: origin,
        }
    } catch {
        return {
            apiPrefix: rawApiUrl,
            csrfUrl: '/sanctum/csrf-cookie',
            serverBase: '',
        }
    }
}

function getXsrfToken() {
    const match = document.cookie.match(new RegExp('(^|; )XSRF-TOKEN=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
}

export async function getCsrfCookie() {
    const { csrfUrl } = getBaseAndCsrf()
    return fetch(csrfUrl, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        },
    })
}

export async function adminFetch(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    let url = cleanEndpoint

    if (!endpoint.startsWith('http')) {
        const { serverBase } = getBaseAndCsrf()
        url = serverBase ? `${serverBase}${cleanEndpoint}` : cleanEndpoint
    }

    const method = (options.method || 'GET').toUpperCase()

    const headers = {
        'Accept': 'application/json',
        ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
    }

    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        const xsrfToken = getXsrfToken()
        if (xsrfToken) {
            headers['X-XSRF-TOKEN'] = xsrfToken
        }
    }

    const response = await fetch(url, {
        ...options,
        method,
        headers,
        credentials: 'include',
    })

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json') && response.status !== 204) {
        throw new Error('Server tidak mengembalikan JSON')
    }

    if (response.status === 401 && !endpoint.includes('/api/login') && !endpoint.includes('/sanctum/csrf-cookie')) {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
            window.location.href = '/admin/login'
        }
    }

    return response
}

export async function getAdminProjects(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.append('search', params.search)
    if (params.category && params.category !== 'Semua') query.append('category', params.category)
    if (params.status && params.status !== 'Semua') query.append('status', params.status.toLowerCase())
    if (params.sort) query.append('sort', params.sort)
    if (params.page) query.append('page', params.page)

    const queryString = query.toString() ? `?${query.toString()}` : ''
    const res = await adminFetch(`/api/admin/projects${queryString}`)
    return res.json()
}

export async function getAdminProject(id) {
    const res = await adminFetch(`/api/admin/projects/${id}`)
    return res.json()
}

export async function createAdminProject(data) {
    const res = await adminFetch('/api/admin/projects', {
        method: 'POST',
        body: JSON.stringify(data),
    })
    return res.json()
}

export async function updateAdminProject(id, data) {
    const res = await adminFetch(`/api/admin/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
    return res.json()
}

export async function deleteAdminProject(id) {
    const res = await adminFetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
    })
    return res
}

/**
 * Upload gambar dengan FormData dan XMLHttpRequest (XHR) agar dapat memantau progress upload.
 */
export function uploadAdminImage(file, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        const { serverBase } = getBaseAndCsrf()
        const uploadEndpoint = '/api/admin/uploads'
        const url = serverBase ? `${serverBase}${uploadEndpoint}` : uploadEndpoint

        xhr.open('POST', url)
        xhr.withCredentials = true
        xhr.setRequestHeader('Accept', 'application/json')

        const xsrfToken = getXsrfToken()
        if (xsrfToken) {
            xhr.setRequestHeader('X-XSRF-TOKEN', xsrfToken)
        }

        if (xhr.upload && typeof onProgress === 'function') {
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100)
                    onProgress(percent)
                }
            }
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const json = JSON.parse(xhr.responseText)
                    resolve(json)
                } catch {
                    reject(new Error('Respon upload tidak valid'))
                }
            } else {
                try {
                    const json = JSON.parse(xhr.responseText)
                    reject(json)
                } catch (err) {
                    reject(new Error(`Upload gagal (${xhr.status})`))
                }
            }
        }

        xhr.onerror = () => {
            reject(new Error('Koneksi upload terputus'))
        }

        const formData = new FormData()
        formData.append('image', file)
        xhr.send(formData)
    })
}

/**
 * Contact Messages API Helpers
 */
export async function getAdminMessages(params = {}) {
    const query = new URLSearchParams()
    if (params.status && params.status !== 'all') query.append('status', params.status)
    if (params.search) query.append('search', params.search)
    if (params.page) query.append('page', params.page)

    const queryString = query.toString() ? `?${query.toString()}` : ''
    const res = await adminFetch(`/api/admin/messages${queryString}`)
    return res.json()
}

export async function getAdminUnreadMessagesCount() {
    const res = await adminFetch('/api/admin/messages/unread-count')
    return res.json()
}

export async function getAdminMessage(id) {
    const res = await adminFetch(`/api/admin/messages/${id}`)
    return res.json()
}

export async function toggleAdminMessageRead(id) {
    const res = await adminFetch(`/api/admin/messages/${id}/toggle-read`, {
        method: 'PATCH',
    })
    return res.json()
}

export async function deleteAdminMessage(id) {
    const res = await adminFetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
    })
    return res.json()
}
