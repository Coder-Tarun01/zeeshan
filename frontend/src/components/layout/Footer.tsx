import { ArrowUp, Clock, MapPin, MessageCircle, Phone, Truck } from 'lucide-react'
import { navLinks } from '../../data/navigation'
import { priceHint } from '../../data/menu'
import { activeSocials, business, isPhoneConfigured } from '../../data/site'
import { callHref, enquiryWhatsAppUrl } from '../../lib/whatsapp'
import { ADMIN_PATH, HOME_PATH, TERMS_PATH } from '../../lib/router'
import { cn } from '../../lib/cn'
import { AddToBagButton } from '../order/AddToBagButton'
import { useOrder } from '../order/OrderContext'
import { useMenu } from '../menu/MenuContext'

const socialLabel: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
}

const DELIVERY_HIGHLIGHT = 'FREE DELIVERY'
const [deliveryBefore, deliveryAfter] = business.delivery.banner.split(DELIVERY_HIGHLIGHT)

export function Footer() {
  const { openOrder } = useOrder()
  const { items } = useMenu()
  const year = new Date().getFullYear()

  const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="relative overflow-hidden border-t border-gold/20 bg-coal">
      <div className="border-b border-gold/15 bg-burgundy-deep/70">
        <div className="container-page flex items-center justify-center gap-2 py-3 text-center">
          <Truck className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
          <p className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-cream/85 sm:text-[10.5px]">
            {deliveryBefore}
            <span className="text-gold">{DELIVERY_HIGHLIGHT}</span>
            {deliveryAfter}
          </p>
        </div>
      </div>

      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gold/[0.06] blur-[140px]"
        aria-hidden="true"
      />

      <div className="container-page relative pb-36 pt-14 sm:pb-8 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* brand */}
          <div className="lg:col-span-4">
            <a
              href={HOME_PATH}
              className="group inline-flex flex-col leading-none"
              aria-label={`${business.name} home`}
            >
              <span className="font-display text-[30px] tracking-[0.16em] text-cream transition-colors duration-500 group-hover:text-gold-light sm:text-[34px]">
                {business.name}
              </span>
              <span className="mt-2 flex items-center gap-2 text-[8px] uppercase tracking-[0.34em] text-gold/85">
                <span className="h-px w-4 bg-gold/50" aria-hidden="true" />
                {business.signLine}
                <span className="h-px w-4 bg-gold/50" aria-hidden="true" />
              </span>
            </a>

            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-cream/45">
              {business.shortDescription} Order chicken specialities and non-veg favourites on
              WhatsApp in under a minute.
            </p>

            {activeSocials.length > 0 && (
              <div className="mt-6 flex items-center gap-2">
                {activeSocials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 items-center justify-center border border-cream/15 px-3 text-[9px] uppercase tracking-[0.16em] text-cream/55 transition-all duration-300 hover:border-gold/60 hover:text-gold"
                  >
                    {socialLabel[social.platform] ?? social.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* explore */}
          <nav aria-label="Footer" className="lg:col-span-2">
            <p className="label-caps">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[13px] text-cream/55 transition-colors duration-300 hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* menu */}
          <div className="lg:col-span-3">
            <p className="label-caps">On the Menu</p>
            <ul className="mt-4 space-y-2.5">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openOrder({
                        item: item.name,
                        category: 'ZEESHAN Menu',
                        image: item.image,
                      })
                    }
                    className="group inline-flex flex-wrap items-center gap-2 text-left text-[13px] text-cream/55 transition-colors duration-300 hover:text-gold"
                  >
                    {item.name}
                    <span
                      className={cn(
                        'text-[9.5px] uppercase tracking-[0.14em] transition-colors duration-300',
                        item.available ? 'text-cream/30 group-hover:text-gold/70' : 'text-burgundy-light',
                      )}
                    >
                      {item.available ? priceHint(item) : 'Sold out'}
                    </span>
                    <span
                      className="text-[10px] text-gold/0 transition-colors duration-300 group-hover:text-gold/80"
                      aria-hidden="true"
                    >
                      &#8599;
                    </span>
                  </button>
                  <AddToBagButton
                    variant="icon"
                    item={item.name}
                    category="ZEESHAN Menu"
                    image={item.image}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div className="lg:col-span-3">
            <p className="label-caps">Order &amp; Contact</p>

            <ul className="mt-4 space-y-3 text-[13px] text-cream/55">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden="true" />
                {business.mapsLink ? (
                  <a
                    href={business.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-gold/25 decoration-1 underline-offset-4 transition-colors duration-300 hover:text-gold hover:decoration-gold/70"
                  >
                    {[business.addressLine, business.addressArea].filter(Boolean).join(', ') ||
                      'Get directions on Google Maps'}
                  </a>
                ) : (
                  <span>
                    {[business.addressLine, business.addressArea].filter(Boolean).join(', ') ||
                      'Shop location shared on request'}
                  </span>
                )}
              </li>
              {isPhoneConfigured && (
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden="true" />
                  <a
                    href={callHref(business.phone)}
                    className="transition-colors duration-300 hover:text-gold"
                  >
                    {business.phoneDisplay}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2.5">
                <MessageCircle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70"
                  aria-hidden="true"
                />
                <span>WhatsApp ordering available</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden="true" />
                <span>
                  {business.hours.length > 0
                    ? business.hours.map((row) => `${row.days}, ${row.time}`).join(' · ')
                    : 'Timings on request'}
                </span>
              </li>
            </ul>

            <a
              href={enquiryWhatsAppUrl('placing an order')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold mt-5 w-full !px-5 !py-3.5 !text-[9.5px]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Order on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-[10px] uppercase tracking-[0.18em] text-cream/30">
            &copy; {year} {business.name} {business.signLine}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-end">
            <a
              href={TERMS_PATH}
              className="text-[10px] uppercase tracking-[0.18em] text-cream/40 transition-colors duration-300 hover:text-gold"
            >
              Terms &amp; Conditions
            </a>
            <a
              href={ADMIN_PATH}
              className="text-[10px] uppercase tracking-[0.18em] text-cream/40 transition-colors duration-300 hover:text-gold"
            >
              Admin
            </a>
            <button
              type="button"
              onClick={backToTop}
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-cream/40 transition-colors duration-300 hover:text-gold"
            >
              Back to top
              <ArrowUp
                className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
