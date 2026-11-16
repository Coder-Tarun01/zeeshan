import { useEffect, useState } from 'react'

export const BAG_PATH = '/bag'
export const CHECKOUT_PATH = '/checkout'
export const HOME_PATH = '/'

const normalize = (pathname: string) => {
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? HOME_PATH : trimmed
}

/** Client-side navigation without pulling in a router dependency. */
export function navigate(path: string) {
  const target = normalize(path)

  if (normalize(window.location.pathname) === target) {
    window.scrollTo({ top: 0, behavior: 'auto' })
    return
  }

  window.history.pushState({ path: target }, '', target)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'auto' })
}

export function usePathname(): string {
  const [path, setPath] = useState(() => normalize(window.location.pathname))

  useEffect(() => {
    const onPop = () => setPath(normalize(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return path
}

/** Scrolls to a section id, retrying briefly while the home page mounts. */
export function scrollToHash(hash: string, attempt = 0) {
  const id = hash.replace('#', '')
  if (!id) return

  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  if (attempt < 24) window.setTimeout(() => scrollToHash(hash, attempt + 1), 50)
}

/**
 * Keeps in-page anchors (#menu, #contact…) working from the bag page:
 * they navigate home first, then scroll to the section.
 */
export function useHashLinkBridge() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null
      if (!anchor) return

      const hash = anchor.getAttribute('href') ?? ''
      if (hash.length < 2) return
      if (normalize(window.location.pathname) === HOME_PATH) return

      event.preventDefault()
      navigate(HOME_PATH)
      window.setTimeout(() => scrollToHash(hash), 90)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
