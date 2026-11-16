import { useEffect, useState, type MouseEvent } from 'react'
import { Menu, MessageCircle, Phone, ShoppingBag, X } from 'lucide-react'
import { navLinks, sectionIds } from '../../data/navigation'
import { business, isPhoneConfigured } from '../../data/site'
import { callHref, enquiryWhatsAppUrl } from '../../lib/whatsapp'
import { BAG_PATH, navigate } from '../../lib/router'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useBag } from '../order/BagContext'
import { cn } from '../../lib/cn'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeSection = useActiveSection(sectionIds)
  const { count } = useBag()

  useLockBodyScroll(mobileOpen)

  const openBagPage = (event: MouseEvent) => {
    event.preventDefault()
    setMobileOpen(false)
    navigate(BAG_PATH)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (media.matches) setMobileOpen(false)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const brandMark = (
    <a
      href="#home"
      onClick={() => setMobileOpen(false)}
      className="group flex shrink-0 flex-col leading-none"
      aria-label={`${business.name} — ${business.signLine}, home`}
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
  )

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[90] transition-[background-color,box-shadow,border-color] duration-500 ease-premium',
          scrolled
            ? 'border-b border-cream/10 bg-ink/95 shadow-[0_16px_50px_-30px_rgba(0,0,0,1)] backdrop-blur-xl'
            : 'border-b border-transparent bg-gradient-to-b from-coal/80 via-coal/30 to-transparent',
        )}
      >
        <div
          className={cn(
            'container-page flex items-center justify-between gap-4 transition-[height] duration-500 ease-premium',
            scrolled ? 'h-[68px] lg:h-[74px]' : 'h-[74px] lg:h-[92px]',
          )}
        >
          {brandMark}

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-5 xl:gap-8">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.replace('#', '')
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'group relative block py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 xl:text-[11px]',
                        isActive ? 'text-gold' : 'text-cream/65 hover:text-cream',
                      )}
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gold transition-transform duration-500 ease-premium',
                          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                        )}
                      />
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isPhoneConfigured && (
              <a
                href={callHref(business.phone)}
                className="hidden h-10 w-10 items-center justify-center border border-cream/15 text-cream/70 transition-all duration-300 hover:border-gold/60 hover:text-gold sm:flex"
                aria-label={`Call ${business.name}`}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
              </a>
            )}

            <a
              href={BAG_PATH}
              onClick={openBagPage}
              aria-label={
                count > 0
                  ? `Open order bag, ${count} item${count === 1 ? '' : 's'}`
                  : 'Open order bag'
              }
              className="relative flex h-11 w-11 items-center justify-center border border-cream/15 text-cream/70 transition-all duration-300 hover:border-gold/60 hover:text-gold sm:h-10 sm:w-10"
            >
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
              {count > 0 && (
                <span
                  className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold leading-none text-ink shadow-[0_0_12px_rgba(214,168,75,0.6)]"
                  aria-hidden="true"
                >
                  {count}
                </span>
              )}
            </a>

            <a
              href={enquiryWhatsAppUrl('placing an order')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold hidden !px-6 !py-3.5 !text-[10px] sm:inline-flex"
            >
              Order Now
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center border border-cream/15 text-cream transition-colors duration-300 hover:border-gold/60 hover:text-gold lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- mobile drawer */}
      <div
        id="mobile-menu"
        className={cn(
          'fixed inset-0 z-[110] lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-coal/90 backdrop-blur-md transition-opacity duration-500',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        <div
          className={cn(
            'relative flex h-full w-[86%] max-w-[380px] flex-col overflow-y-auto border-r border-gold/15 bg-gradient-to-b from-night via-ink to-coal px-6 pb-10 pt-5 transition-transform duration-500 ease-premium',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between">
            {brandMark}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center border border-cream/15 text-cream/80 transition-colors duration-300 hover:border-gold/60 hover:text-gold"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile" className="mt-10">
            <ul className="flex flex-col">
              {navLinks.map((link, index) => (
                <li key={link.href} className="border-b border-cream/[0.07]">
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    tabIndex={mobileOpen ? 0 : -1}
                    className={cn(
                      'flex items-baseline gap-4 py-4 transition-colors duration-300',
                      activeSection === link.href.replace('#', '')
                        ? 'text-gold'
                        : 'text-cream/80 hover:text-gold',
                    )}
                  >
                    <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-gold/50">
                      0{index + 1}
                    </span>
                    <span className="font-display text-[26px] leading-none">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-9 space-y-3">
            <a
              href={enquiryWhatsAppUrl('placing an order')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full"
              onClick={() => setMobileOpen(false)}
              tabIndex={mobileOpen ? 0 : -1}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Order on WhatsApp
            </a>
            <a
              href={BAG_PATH}
              onClick={openBagPage}
              tabIndex={mobileOpen ? 0 : -1}
              className="btn-outline w-full"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Order Bag{count > 0 ? ` (${count})` : ''}
            </a>
            <a
              href={isPhoneConfigured ? callHref(business.phone) : '#contact'}
              onClick={() => setMobileOpen(false)}
              className="btn-outline w-full"
              tabIndex={mobileOpen ? 0 : -1}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {isPhoneConfigured ? 'Call the Shop' : 'Contact Details'}
            </a>
          </div>

          <p className="mt-auto pt-8 text-[10px] uppercase tracking-[0.2em] text-cream/30">
            {business.name} — {business.signLine}
          </p>
        </div>
      </div>
    </>
  )
}
