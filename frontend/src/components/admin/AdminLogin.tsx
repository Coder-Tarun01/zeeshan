import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { ApiError, API_BASE_URL } from '../../lib/api'
import { cn } from '../../lib/cn'

interface AdminLoginProps {
  /** Message shown on first render, e.g. when the API could not be reached. */
  initialError?: string | null
  /** A saved session exists but the API is unreachable — show the recovery hint. */
  initialOffline?: boolean
  onSubmit: (username: string, password: string) => Promise<void>
  onRetryConnection?: () => void
}

const inputClass =
  'mt-1.5 w-full border border-cream/15 bg-ink/60 px-3.5 py-3 text-[13.5px] text-cream placeholder:text-cream/25 focus:border-gold/60 focus:outline-none disabled:opacity-60'

const labelClass = 'text-[9px] font-medium uppercase tracking-[0.18em] text-cream/45'

/**
 * Sign-in card for `/admin`. Nothing on the panel is rendered until the API has
 * accepted the username and password.
 */
export function AdminLogin({
  initialError,
  initialOffline = false,
  onSubmit,
  onRetryConnection,
}: AdminLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [pending, setPending] = useState(false)
  const [offline, setOffline] = useState(initialOffline)
  const usernameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  useEffect(() => {
    if (initialError) setError(initialError)
  }, [initialError])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return

    if (!username.trim() || !password) {
      setError('Enter both your username and password.')
      return
    }

    setPending(true)
    setError(null)

    try {
      await onSubmit(username, password)
    } catch (caught) {
      if (caught instanceof ApiError) {
        setOffline(caught.isNetworkError)
        setError(caught.message)
      } else {
        setError('Could not sign in. Please try again.')
      }
      setPassword('')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <nav aria-label="Breadcrumb" className="text-[9px] uppercase tracking-[0.2em] text-cream/35">
        <a href="/" className="transition-colors duration-300 hover:text-gold">
          Home
        </a>
        <span className="mx-2 text-gold/40" aria-hidden="true">
          /
        </span>
        <span className="text-cream/60">Staff sign in</span>
      </nav>

      <div className="mt-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center border border-gold/40 bg-gold/[0.08] text-gold">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[9px] font-medium uppercase tracking-label text-gold">Staff only</p>
          <h1 className="mt-1 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-none text-cream">
            Sign in
          </h1>
        </div>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-cream/45">
        The menu manager is protected. Sign in with your ZEESHAN staff account to add dishes,
        change prices or mark items sold out.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 border border-gold/25 bg-night p-5 sm:p-7">
        <div>
          <label className={labelClass} htmlFor="admin-username">
            Username
          </label>
          <input
            id="admin-username"
            ref={usernameRef}
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={username}
            disabled={pending}
            onChange={(event) => {
              setUsername(event.target.value.slice(0, 64))
              setError(null)
            }}
            className={inputClass}
            placeholder="e.g. owner"
          />
        </div>

        <div className="mt-5">
          <label className={labelClass} htmlFor="admin-password">
            Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              disabled={pending}
              onChange={(event) => {
                setPassword(event.target.value)
                setError(null)
              }}
              className={cn(inputClass, 'pr-12')}
              placeholder="Your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-0 top-1.5 flex h-10 w-11 items-center justify-center text-cream/40 transition-colors duration-300 hover:text-gold"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 border border-red-400/40 bg-red-400/10 px-4 py-3 text-[12px] leading-relaxed text-red-200"
          >
            <p>{error}</p>
            {offline && (
              <>
                <p className="mt-2 text-red-200/70">
                  The panel needs the admin API. Start it with{' '}
                  <code className="text-cream/80">uvicorn app.main:app --port 8000</code> inside{' '}
                  <code className="text-cream/80">backend/</code>, then try again.
                </p>
                {onRetryConnection && (
                  <button
                    type="button"
                    onClick={onRetryConnection}
                    className="mt-3 border border-red-300/40 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-cream/80 transition-colors duration-300 hover:border-cream/60"
                  >
                    Try again
                  </button>
                )}
              </>
            )}
          </div>
        )}

        <button type="submit" disabled={pending} className="btn-gold mt-6 w-full">
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
          )}
          {pending ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-cream/35">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/60" aria-hidden="true" />
          <span>
            Sessions are signed tokens and expire after a few hours. Too many wrong attempts lock
            this username for a few minutes.
          </span>
        </p>
      </form>

      <p className="mt-4 text-center text-[10px] uppercase tracking-[0.16em] text-cream/25">
        API: {API_BASE_URL.replace(/^https?:\/\//, '')}
      </p>
    </div>
  )
}
