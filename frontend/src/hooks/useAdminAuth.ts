import { useCallback, useEffect, useRef, useState } from 'react'
import {
  adminApi,
  ApiError,
  readToken,
  saveToken,
  type AdminUser,
} from '../lib/api'

export type AdminAuthStatus = 'checking' | 'signed-out' | 'signed-in' | 'offline'

interface AdminAuth {
  status: AdminAuthStatus
  user: AdminUser | null
  /** Re-checks the stored session (used by the "try again" button). */
  refresh: () => void
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

/**
 * Session state for the menu manager.
 *
 * On mount the stored token is validated against `GET /api/auth/me`; if the API is
 * unreachable the panel reports `offline` instead of silently pretending to be
 * signed out, so the owner gets a real error message.
 */
export function useAdminAuth(): AdminAuth {
  const [status, setStatus] = useState<AdminAuthStatus>(() =>
    readToken() ? 'checking' : 'signed-out',
  )
  const [user, setUser] = useState<AdminUser | null>(null)
  const [attempt, setAttempt] = useState(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!readToken()) {
      setStatus('signed-out')
      return
    }

    setStatus('checking')

    adminApi
      .me()
      .then((sessionUser) => {
        if (!mounted.current) return
        setUser(sessionUser)
        setStatus('signed-in')
      })
      .catch((error: unknown) => {
        if (!mounted.current) return

        if (error instanceof ApiError && error.isNetworkError) {
          setStatus('offline')
          return
        }

        saveToken(null)
        setUser(null)
        setStatus('signed-out')
      })
  }, [attempt])

  const refresh = useCallback(() => setAttempt((value) => value + 1), [])

  const signIn = useCallback(async (username: string, password: string) => {
    const session = await adminApi.login(username, password)
    saveToken(session.accessToken)
    setUser(session.user)
    setStatus('signed-in')
  }, [])

  const signOut = useCallback(async () => {
    try {
      await adminApi.logout()
    } catch {
      /* the token is dropped locally either way */
    }

    saveToken(null)
    setUser(null)
    setStatus('signed-out')
  }, [])

  return { status, user, refresh, signIn, signOut }
}
