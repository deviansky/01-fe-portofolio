const rawApiUrl = (import.meta.env.VITE_API_URL ?? '/api').trim()
const BASE_URL = rawApiUrl.replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.status = status
    this.errors = errors // error validasi Laravel (422): { field: ['pesan'] }
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
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
  getPortfolio: (signal) => request('/portfolio', { signal }),
  getProject: (slug, signal) => request(`/projects/${encodeURIComponent(slug)}`, { signal }),
  sendMessage: (payload) => request('/contact', { method: 'POST', body: payload }),

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
