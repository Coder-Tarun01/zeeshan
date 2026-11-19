/**
 * Client for the ZEESHAN admin API (FastAPI + PostgreSQL, see `backend/`).
 *
 * The token is kept in `sessionStorage`: it survives a page reload, but not a new
 * browser session — sensible for a panel opened on the shop's own phone/tablet.
 */

const configuredBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim()

/** `VITE_API_URL` in production, localhost while developing. */
export const API_BASE_URL = (
  configuredBase && configuredBase.length > 0 ? configuredBase : 'http://127.0.0.1:8000'
).replace(/\/+$/, '')

const TOKEN_KEY = 'zeeshan:admin-token:v1'

export interface AdminUser {
  id: string
  username: string
  displayName: string | null
  role: string
  isActive: boolean
}

export interface AdminSession {
  accessToken: string
  expiresIn: number
  user: AdminUser
}

interface ApiUserPayload {
  id: string
  username: string
  display_name: string | null
  role: string
  is_active: boolean
}

export class ApiError extends Error {
  /** HTTP status, or `0` when the API could not be reached at all. */
  readonly status: number
  readonly retryAfter?: number

  constructor(message: string, status: number, retryAfter?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.retryAfter = retryAfter
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isUnauthorised(): boolean {
    return this.status === 401
  }
}

export function readToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveToken(token: string | null): void {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token)
    else window.sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage blocked — the panel stays usable until the tab is closed */
  }
}

const toUser = (payload: ApiUserPayload): AdminUser => ({
  id: payload.id,
  username: payload.username,
  displayName: payload.display_name,
  role: payload.role,
  isActive: payload.is_active,
})

/** FastAPI returns `{detail: "…"}` or `{detail: [{msg, loc}]}` for validation errors. */
function extractDetail(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const detail = (payload as { detail?: unknown }).detail

  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: unknown }
    if (typeof first?.msg === 'string') return first.msg.replace(/^Value error,\s*/i, '')
  }

  return null
}

function fallbackMessage(status: number): string {
  if (status === 401) return 'Incorrect username or password.'
  if (status === 403) return 'This account is not allowed to sign in.'
  if (status === 429) return 'Too many attempts. Please wait a few minutes.'
  if (status >= 500) return 'The admin API had a problem. Please try again.'
  return 'Something went wrong. Please try again.'
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  /** Send the stored bearer token. */
  auth?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }

  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  if (options.auth) {
    const token = readToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'omit',
      cache: 'no-store',
    })
  } catch {
    throw new ApiError(`Cannot reach the admin API at ${API_BASE_URL}.`, 0)
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const retryAfter = Number.parseInt(response.headers.get('Retry-After') ?? '', 10)
    throw new ApiError(
      extractDetail(payload) ?? fallbackMessage(response.status),
      response.status,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    )
  }

  return payload as T
}

export const adminApi = {
  health: () => request<{ status: string; database: string }>('/api/health'),

  async login(username: string, password: string): Promise<AdminSession> {
    const data = await request<{
      access_token: string
      expires_in: number
      user: ApiUserPayload
    }>('/api/auth/login', {
      method: 'POST',
      body: { username: username.trim(), password },
    })

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      user: toUser(data.user),
    }
  },

  me: () => request<ApiUserPayload>('/api/auth/me', { auth: true }).then(toUser),

  logout: () => request<void>('/api/auth/logout', { method: 'POST', auth: true }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>('/api/auth/change-password', {
      method: 'POST',
      auth: true,
      body: { current_password: currentPassword, new_password: newPassword },
    }),
}
