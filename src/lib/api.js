const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')

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

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(json.message ?? `Request gagal (${res.status}).`, res.status, json.errors)
  }
  return json.data ?? json
}

export const api = {
  getPortfolio: (signal) => request('/portfolio', { signal }),
  getProject: (slug, signal) => request(`/projects/${encodeURIComponent(slug)}`, { signal }),
  sendMessage: (payload) => request('/contact', { method: 'POST', body: payload }),
}
