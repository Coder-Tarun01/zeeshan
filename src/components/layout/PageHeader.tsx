import type { MouseEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { business } from '../../data/site'
import { HOME_PATH, navigate } from '../../lib/router'

interface PageHeaderProps {
  backLabel: string
  onBack: () => void
}

/** Slim header used by the /bag and /checkout pages. */
export function PageHeader({ backLabel, onBack }: PageHeaderProps) {
  const goHome = (event: MouseEvent) => {
    event.preventDefault()
    navigate(HOME_PATH)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[90] border-b border-cream/10 bg-ink/95 backdrop-blur-xl">
      <div className="container-page flex h-[74px] items-center justify-between gap-4">
        <a
          href="/"
          onClick={goHome}
          className="group flex shrink-0 flex-col leading-none"
          aria-label={`${business.name} — home`}
        >
          <span className="font-display text-[25px] font-medium tracking-[0.16em] text-cream transition-colors duration-500 group-hover:text-gold-light sm:text-[28px]">
            {business.name}
          </span>
          <span className="mt-1.5 flex items-center gap-2 text-[7.5px] uppercase tracking-[0.34em] text-gold/80 sm:text-[8.5px]">
            <span className="h-px w-3 bg-gold/50" aria-hidden="true" />
            {business.signLine}
            <span className="h-px w-3 bg-gold/50" aria-hidden="true" />
          </span>
        </a>

        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-cream/60 transition-colors duration-300 hover:text-gold"
        >
          <ArrowLeft
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          {backLabel}
        </button>
      </div>
    </header>
  )
}
