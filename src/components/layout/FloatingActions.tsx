import { MessageCircle, Phone } from 'lucide-react'
import { business, isPhoneConfigured } from '../../data/site'
import { callHref, enquiryWhatsAppUrl } from '../../lib/whatsapp'

/**
 * Persistent ordering actions.
 * The gold disc is the primary WhatsApp order entry point on every screen.
 */
export function FloatingActions() {
  return (
    <div className="fixed bottom-4 right-4 z-[95] flex flex-col items-center gap-3 sm:bottom-6 sm:right-6">
      {isPhoneConfigured && (
        <a
          href={callHref(business.phone)}
          aria-label={`Call ${business.name}`}
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-coal/85 text-gold shadow-card backdrop-blur-md transition-all duration-500 ease-premium hover:border-gold hover:bg-gold hover:text-ink"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
        </a>
      )}

      <a
        href={enquiryWhatsAppUrl('placing an order')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gold-sheen text-ink shadow-gold-strong transition-transform duration-500 ease-premium hover:scale-105 sm:h-16 sm:w-16"
      >
        <span
          className="absolute inset-0 rounded-full border border-gold/60 animate-glowPulse"
          aria-hidden="true"
        />
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />

        <span className="pointer-events-none absolute right-[calc(100%+12px)] hidden whitespace-nowrap border border-gold/30 bg-coal/95 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-cream/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
          Order on WhatsApp
        </span>
      </a>
    </div>
  )
}
