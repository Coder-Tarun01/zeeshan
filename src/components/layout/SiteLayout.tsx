import type { MouseEvent, ReactNode } from 'react'
import { Footer } from './Footer'
import { FloatingActions } from './FloatingActions'
import { Navbar } from './Navbar'
import { TopBar } from './TopBar'

interface SiteLayoutProps {
  children: ReactNode
  /** Inner pages need a little space under the fixed navbar; the hero does not. */
  padded?: boolean
  /** Override the <main> classes (used by the bag / checkout pages). */
  mainClassName?: string
  /** Hide the floating WhatsApp/call buttons where a page has its own CTA. */
  withFloatingActions?: boolean
}

export function SiteLayout({
  children,
  padded = true,
  mainClassName,
  withFloatingActions = true,
}: SiteLayoutProps) {
  const skipToContent = (event: MouseEvent) => {
    event.preventDefault()
    document.getElementById('main')?.focus()
  }

  return (
    <>
      <a
        href="#main"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-gold focus:px-4 focus:py-2 focus:text-[11px] focus:font-semibold focus:uppercase focus:tracking-[0.18em] focus:text-ink"
      >
        Skip to content
      </a>

      <TopBar />
      <Navbar />

      <main
        id="main"
        tabIndex={-1}
        className={mainClassName ?? (padded ? 'pt-12 lg:pt-14' : undefined)}
      >
        {children}
      </main>

      <Footer />
      {withFloatingActions && <FloatingActions />}
    </>
  )
}
