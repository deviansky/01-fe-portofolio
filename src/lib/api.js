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

const BASE_URL = getApiUrl()

function getActiveLang() {
  if (typeof window === 'undefined') return 'id'
  const params = new URLSearchParams(window.location.search)
  const langParam = params.get('lang')?.toLowerCase()
  if (langParam === 'id' || langParam === 'en') return langParam
  const saved = localStorage.getItem('portfolio_lang')
  if (saved === 'id' || saved === 'en') return saved
  return (navigator.language || '').toLowerCase().startsWith('id') ? 'id' : 'en'
}

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

async function request(path, { method = 'GET', body, signal, lang } = {}) {
  let res
  try {
    const activeLang = lang || getActiveLang()
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    // Append ?lang= to public requests
    const urlObj = new URL(`${BASE_URL}${cleanPath}`, window.location.origin)
    if (!urlObj.searchParams.has('lang')) {
      urlObj.searchParams.set('lang', activeLang)
    }

    const fullUrl = BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')
      ? urlObj.toString()
      : urlObj.pathname + urlObj.search

    res = await fetch(fullUrl, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        'Accept-Language': activeLang === 'en' ? 'en-US,en;q=0.9' : 'id-ID,id;q=0.9',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Server tidak bisa dihubungi.', 0)
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new ApiError('Server tidak mengembalikan JSON.', res.status)
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 419) {
      throw new ApiError('Sesi kedaluwarsa. Muat ulang halaman lalu coba lagi.', 419, json.errors)
    }
    throw new ApiError(json.message ?? `Request gagal (${res.status}).`, res.status, json.errors)
  }
  return json.data ?? json
}

export const api = {
  getPortfolio: (signal, lang) => request('/portfolio', { signal, lang }),
  getProject: (slug, signal, lang) => request(`/projects/${encodeURIComponent(slug)}`, { signal, lang }),
  sendMessage: (payload, lang) => request('/contact', { method: 'POST', body: payload, lang }),

  // Admin / Manager GUI methods
  getAdminProjects: (params = {}, signal) => {
    const query = new URLSearchParams(params).toString()
    return request(`/admin/projects${query ? `?${query}` : ''}`, { signal })
  },
  getAdminProject: (id, signal) => request(`/admin/projects/${id}`, { signal }),
  createProject: (payload) => request('/admin/projects', { method: 'POST', body: payload }),
  updateProject: (id, payload) => request(`/admin/projects/${id}`, { method: 'PUT', body: payload }),
  deleteProject: (id) => request(`/admin/projects/${id}`, { method: 'DELETE' }),

  uploadThumbnail: async (id, file) => {
    const formData = new FormData()
    formData.append('image', file)

    let res
    try {
      res = await fetch(`${BASE_URL}/admin/projects/${id}/thumbnail`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      })
    } catch {
      throw new ApiError('Server tidak bisa dihubungi.', 0)
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new ApiError('Server tidak mengembalikan JSON.', res.status)
    }

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new ApiError(json.message ?? `Upload gagal (${res.status}).`, res.status, json.errors)
    }
    return json
  },
}
