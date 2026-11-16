import { Truck } from 'lucide-react'
import { business } from '../../data/site'

const HIGHLIGHT = 'FREE DELIVERY'

/**
 * Slim announcement bar pinned above the navbar.
 * Copy comes from `business.delivery.banner`; the free-delivery phrase is gold.
 */
export function TopBar() {
  const [before, after] = business.delivery.banner.split(HIGHLIGHT)

  return (
    <div className="fixed inset-x-0 top-0 z-[95] h-8 border-b border-gold/25 bg-burgundy-deep">
      <div className="container-page flex h-full items-center justify-center gap-2 text-center">
        <Truck className="hidden h-3.5 w-3.5 shrink-0 text-gold sm:block" aria-hidden="true" />
        <p className="text-[8.5px] font-medium uppercase tracking-[0.16em] text-cream/85 sm:text-[10px] sm:tracking-[0.18em]">
          {before}
          <span className="text-gold">{HIGHLIGHT}</span>
          {after}
        </p>
      </div>
    </div>
  )
}
