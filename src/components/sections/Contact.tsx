import {
  Clock,
  Facebook,
  Instagram,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Youtube,
} from 'lucide-react'
import { activeSocials, business, isPhoneConfigured } from '../../data/site'
import { callHref, enquiryWhatsAppUrl } from '../../lib/whatsapp'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'

const socialIcons = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
} as const

const mapsQuery = encodeURIComponent(business.mapsSearchQuery)
const mapsHref = business.mapsLink || `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

const fullAddress = [business.addressLine, business.addressArea].filter(Boolean).join(', ')

export function Contact() {
  const hoursRows = business.hours.length > 0 ? business.hours : null

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-cream/[0.06] bg-night py-20 sm:py-24 lg:py-32"
    >
      <div
        className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-burgundy/20 blur-[130px]"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="Contact & Location"
          title={
            <>
              Come Hungry.
              <br />
              Leave <span className="italic text-gold">Happy.</span>
            </>
          }
          description="Message us for today's dishes, prices and pickup time. We will reply as soon as the kitchen is free."
          align="center"
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
          <Reveal variant="left" className="flex flex-col gap-4">
            <div className="border border-cream/10 bg-ink/60 p-5 transition-colors duration-500 hover:border-gold/35 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] text-gold">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="label-caps">Visit the shop</p>
                  {fullAddress ? (
                    <p className="mt-2 text-[14px] leading-relaxed text-cream/75">{fullAddress}</p>
                  ) : (
                    <p className="mt-2 text-[13.5px] leading-relaxed text-cream/55">
                      {business.addressFallback}
                    </p>
                  )}
                  <a
                    href={fullAddress ? mapsHref : enquiryWhatsAppUrl('the shop location pin')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors duration-300 hover:text-gold-light"
                  >
                    <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                    {fullAddress ? 'Get directions' : 'Ask for the location pin'}
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-cream/10 bg-ink/60 p-5 transition-colors duration-500 hover:border-gold/35">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] text-gold">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="label-caps mt-4">Call us</p>
                {isPhoneConfigured ? (
                  <>
                    <p className="mt-2 text-[14px] text-cream/75">{business.phoneDisplay}</p>
                    <a
                      href={callHref(business.phone)}
                      className="mt-3 inline-flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors duration-300 hover:text-gold-light"
                    >
                      Call now
                    </a>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-[13px] leading-relaxed text-cream/50">
                      The shop number is shared on request.
                    </p>
                    <a
                      href={enquiryWhatsAppUrl('the shop phone number')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors duration-300 hover:text-gold-light"
                    >
                      Request the number
                    </a>
                  </>
                )}
              </div>

              <div className="border border-gold/25 bg-gradient-to-br from-ink to-burgundy-deep/40 p-5 transition-colors duration-500 hover:border-gold/60">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="label-caps mt-4">WhatsApp</p>
                <p className="mt-2 text-[13px] leading-relaxed text-cream/60">
                  Send your order or ask what is ready today.
                </p>
                <a
                  href={enquiryWhatsAppUrl('placing an order')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors duration-300 hover:text-gold-light"
                >
                  Message ZEESHAN
                </a>
              </div>
            </div>

            <div className="border border-cream/10 bg-ink/60 p-5 transition-colors duration-500 hover:border-gold/35 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] text-gold">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="label-caps">Business hours</p>
                  {hoursRows ? (
                    <ul className="mt-2 space-y-1.5">
                      {hoursRows.map((row) => (
                        <li
                          key={`${row.days}-${row.time}`}
                          className="flex flex-wrap items-baseline justify-between gap-2 text-[13px] text-cream/70"
                        >
                          <span>{row.days}</span>
                          <span className="text-cream/50">{row.time}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[13px] leading-relaxed text-cream/55">
                      {business.hoursFallback}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {activeSocials.length > 0 && (
              <div className="flex items-center gap-3 border border-cream/10 bg-ink/60 px-5 py-4">
                <span className="label-caps">Follow</span>
                <div className="flex items-center gap-2">
                  {activeSocials.map((social) => {
                    const Icon = socialIcons[social.platform]
                    return (
                      <a
                        key={social.platform}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${business.name} on ${social.label}`}
                        className="flex h-9 w-9 items-center justify-center border border-cream/15 text-cream/60 transition-all duration-300 hover:border-gold/60 hover:text-gold"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </Reveal>

          {/* ----------------------------------------------------------- map */}
          <Reveal variant="right" delay={120} className="min-h-[420px]">
            <div className="relative h-full min-h-[420px] overflow-hidden border border-gold/20 bg-ink">
              {business.mapsEmbedUrl ? (
                <iframe
                  title={`${business.name} location on Google Maps`}
                  src={business.mapsEmbedUrl}
                  className="h-full min-h-[420px] w-full border-0 grayscale-[0.35] contrast-[1.05]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-6 py-14 text-center">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.14]"
                    aria-hidden="true"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(214,168,75,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(214,168,75,0.55) 1px, transparent 1px)',
                      backgroundSize: '56px 56px',
                    }}
                  />
                  <div
                    className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20"
                    aria-hidden="true"
                  >
                    <span className="absolute inset-8 rounded-full border border-gold/15" />
                    <span className="absolute inset-16 rounded-full border border-gold/10" />
                  </div>

                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold animate-floaty">
                    <MapPin className="h-6 w-6" aria-hidden="true" />
                  </span>

                  <p className="relative mt-6 text-[9px] uppercase tracking-label text-gold/80">
                    Google Maps
                  </p>
                  <p className="relative mt-3 font-display text-2xl text-cream sm:text-[28px]">
                    Shop location pin
                  </p>
                  <p className="relative mt-2 max-w-xs text-[12.5px] leading-relaxed text-cream/45">
                    The exact Google Maps embed appears here once the shop location is confirmed.
                    Until then, search for us or ask for the location pin on WhatsApp.
                  </p>
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline relative mt-6 !px-6 !py-3.5 !text-[9.5px]"
                  >
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                    Search on Google Maps
                  </a>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
