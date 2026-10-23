import { supabase } from './supabase'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
const MAX_PAGE_COUNT = 100

async function getAllPages(path, params = {}) {
  const limit = Number(params.limit ?? 50)
  const firstPage = await api.get(`${path}?${new URLSearchParams({ ...params, limit, page: 1 })}`)
  if (!firstPage?.pagination) return firstPage ?? []
  if (firstPage.pagination.totalPages > MAX_PAGE_COUNT) {
    throw new Error('Too many records to load at once. Narrow your search or date range.')
  }
  const pages = Array.from({ length: firstPage.pagination.totalPages - 1 }, (_, index) => index + 2)
  const nextPages = await Promise.all(pages.map((page) => api.get(`${path}?${new URLSearchParams({ ...params, limit, page })}`)))
  return [...(firstPage.items ?? []), ...nextPages.flatMap((result) => result?.items ?? [])]
}

async function getAuthHeader() {
  if (!supabase) return {}
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, path, body = null, options = {}) {
  const authHeaders = await getAuthHeader()

  const headers = {
    ...(body !== null && method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
    ...authHeaders,
    ...options.headers,
  }

  const config = {
    method,
    headers,
    signal: options.signal,
  }

  if (body !== null && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE_URL}${path}`, config)

  if (res.status === 401) {
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } }
    const isRecovery = path === '/api/account/recover'
    if (data?.session && !isRecovery) {
      await supabase.auth.signOut()
      if (window.location.pathname !== '/signin') window.location.href = '/signin'
    }
    throw new Error('Session expired. Please sign in again.')
  }

  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const err = await res.json()
      message = err.error?.message || err.message || err.error || message
    } catch {
      // ignore parse failures
    }
    throw new Error(message)
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null
  }

  const payload = await res.json()
  if (payload?.success === true) {
    if (Array.isArray(payload.data) && payload.pagination) {
      return { items: payload.data, pagination: payload.pagination }
    }
    return payload.data
  }
  return payload
}

export const api = {
  get: (path, options) => request('GET', path, null, options),
  post: (path, body, options) => request('POST', path, body, options),
  patch: (path, body, options) => request('PATCH', path, body, options),
  delete: (path, options) => request('DELETE', path, null, options),
}

export const endpoints = {
  health: () => api.get('/api/health'),

  profile: {
    get: () => api.get('/api/profile'),
    update: (data) => api.patch('/api/profile', data),
  },

  account: {
    recover: () => request('POST', '/api/account/recover', {}),
  },

  subjects: {
    list: () => api.get('/api/subjects'),
    create: (data) => api.post('/api/subjects', data),
    update: (id, data) => api.patch(`/api/subjects/${id}`, data),
    delete: (id) => api.delete(`/api/subjects/${id}`),
  },

  dashboard: {
    get: () => api.get('/api/dashboard'),
  },

  tasks: {
    list: (params = {}) => getAllPages('/api/tasks', params),
    get: (id) => api.get(`/api/tasks/${id}`),
    create: (data) => api.post('/api/tasks', data),
    update: (id, data) => api.patch(`/api/tasks/${id}`, data),
    delete: (id) => api.delete(`/api/tasks/${id}`),
  },

  sessions: {
    list: (params = {}) => getAllPages('/api/study-sessions', params),
    create: (data) => api.post('/api/study-sessions', data),
  },

  history: {
    list: (params = {}) => api.get(`/api/learning-history${Object.keys(params).length ? `?${new URLSearchParams(params)}` : ''}`),
  },

  revisions: {
    list: () => getAllPages('/api/revisions'),
    create: (data) => api.post('/api/revisions', data),
    update: (id, data) => api.patch(`/api/revisions/${id}`, data),
  },

  analytics: {
    get: () => api.get('/api/analytics'),
  },

  ai: {
    tutor: (data) => api.post('/api/ai/tutor', data),
    conversations: {
      list: () => api.get('/api/ai/conversations'),
      get: (id) => api.get(`/api/ai/conversations/${id}`),
      delete: (id) => api.delete(`/api/ai/conversations/${id}`),
    },
  },
}
