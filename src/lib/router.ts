import { useEffect, useState } from 'react'

export const HOME_PATH = '/'
export const ABOUT_PATH = '/about'
export const MENU_PATH = '/menu'
export const SPECIALS_PATH = '/chicken-specials'
export const GALLERY_PATH = '/gallery'
export const CONTACT_PATH = '/contact'
export const BAG_PATH = '/bag'
export const CHECKOUT_PATH = '/checkout'
export const TERMS_PATH = '/terms'

const normalize = (pathname: string) => {
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? HOME_PATH : trimmed
}

/** Splits `/terms#cancellation` into its pathname and anchor. */
const splitPath = (path: string) => {
  const [pathname, hash = ''] = path.split('#')
  return { pathname: normalize(pathname), hash }
}

/**
 * Scrolls to the current `#anchor` when the route has one, otherwise to the top.
 * Called after every route change so deep links land on the right section.
 */
export function scrollToRouteTarget() {
  const hash = window.location.hash.replace(/^#/, '')

  if (!hash) {
    window.scrollTo({ top: 0, behavior: 'auto' })
    return
  }

  requestAnimationFrame(() => {
    document.getElementById(hash)?.scrollIntoView({ block: 'start' })
  })
}

/** Client-side navigation without pulling in a router dependency. */
export function navigate(path: string) {
  const { pathname, hash } = splitPath(path)
  const samePage = normalize(window.location.pathname) === pathname
  const sameHash = window.location.hash.replace(/^#/, '') === hash

  if (samePage && sameHash) {
    window.scrollTo({ top: 0, behavior: 'auto' })
    return
  }

  window.history.pushState({ path: pathname }, '', hash ? `${pathname}#${hash}` : pathname)

  if (samePage) {
    // Only the anchor changed — nothing to re-render, just move the view.
    scrollToRouteTarget()
    return
  }

  window.dispatchEvent(new PopStateEvent('popstate'))
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

/**
 * Makes internal links (`/menu`, `/bag`, …) navigate inside the SPA instead of
 * reloading the document. External, `tel:`, `mailto:` and new-tab links are
 * left untouched.
 */
export function useLinkInterceptor() {
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
        'a[href]',
      ) as HTMLAnchorElement | null
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href') ?? ''
      if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/#')) return

      event.preventDefault()
      navigate(href)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}

/** Sets the document title (and keeps the canonical URL in step with the route). */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title

    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      canonical.setAttribute('href', window.location.origin + normalize(window.location.pathname))
    }
  }, [title])
}
