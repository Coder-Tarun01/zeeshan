import { MessageCircle, Phone } from 'lucide-react'
import { SiteLayout } from '../components/layout/SiteLayout'
import { termsSections } from '../data/legal'
import { business, isPhoneConfigured } from '../data/site'
import { callHref, enquiryWhatsAppUrl } from '../lib/whatsapp'
import { CONTACT_PATH, HOME_PATH, usePageTitle } from '../lib/router'

/** Two digits, e.g. 01 … 07. */
const sectionNumber = (index: number) => String(index + 1).padStart(2, '0')

export function TermsPage() {
  usePageTitle(`Terms & Conditions — ${business.name} ${business.signLine}`)

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-cream/[0.06] bg-ink pb-12 pt-14 sm:pb-16 sm:pt-20">
        <div
          className="pointer-events-none absolute -right-20 top-0 h-[380px] w-[380px] rounded-full bg-burgundy/20 blur-[130px]"
          aria-hidden="true"
        />

        <div className="container-page relative">
          <nav
            aria-label="Breadcrumb"
            className="text-[9px] uppercase tracking-[0.2em] text-cream/35"
          >
            <a href={HOME_PATH} className="transition-colors duration-300 hover:text-gold">
              Home
            </a>
            <span className="mx-2 text-gold/40" aria-hidden="true">
              /
            </span>
            <span className="text-cream/60">Terms &amp; Conditions</span>
          </nav>

          <div className="mt-7 max-w-2xl">
            <span className="inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-label text-gold">
              <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
              Legal
            </span>

            <h1 className="mt-5 font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] tracking-[-0.01em] text-cream">
              Terms &amp; Conditions
            </h1>

            <p className="mt-5 text-[14.5px] leading-relaxed text-cream/55">
              These terms apply every time you place an order with {business.name}{' '}
              {business.signLine}, and every time you use this website.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-night py-14 sm:py-20">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,230px)_minmax(0,1fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-32 lg:self-start">
              <p className="label-caps">On this page</p>

              <ol className="mt-4 space-y-2.5 border-l border-cream/10 pl-4">
                {termsSections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex gap-2.5 text-[12px] leading-snug text-cream/45 transition-colors duration-300 hover:text-gold"
                    >
                      <span className="shrink-0 text-[9px] tabular-nums text-gold/45 transition-colors duration-300 group-hover:text-gold">
                        {sectionNumber(index)}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>

              <a
                href={CONTACT_PATH}
                className="mt-6 inline-flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors duration-300 hover:text-gold-light"
              >
                Contact the shop
                <span aria-hidden="true">&#8594;</span>
              </a>
            </aside>

            <div className="min-w-0">
              {termsSections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="border-t border-cream/10 py-9 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      className="font-display text-[13px] tabular-nums text-gold/60"
                      aria-hidden="true"
                    >
                      {sectionNumber(index)}
                    </span>
                    <h2 className="font-display text-[clamp(1.3rem,2.3vw,1.8rem)] leading-tight text-cream">
                      {section.title}
                    </h2>
                  </div>

                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 32)}
                      className="mt-3.5 text-[14px] leading-[1.85] text-cream/60"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.contactBlock && (
                    <div className="mt-5">
                      <p className="flex flex-wrap items-center gap-2 text-[14px] text-cream/60">
                        <span className="label-caps">Phone</span>
                        {isPhoneConfigured ? (
                          <a
                            href={callHref(business.phone)}
                            className="text-cream/85 transition-colors duration-300 hover:text-gold"
                          >
                            {business.phoneDisplay}
                          </a>
                        ) : (
                          <span className="text-cream/85">{business.phoneDisplay}</span>
                        )}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {isPhoneConfigured && (
                          <a
                            href={callHref(business.phone)}
                            className="btn-outline !px-5 !py-3 !text-[9.5px]"
                          >
                            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                            Call the Shop
                          </a>
                        )}
                        <a
                          href={enquiryWhatsAppUrl('a question about the Terms & Conditions')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline !px-5 !py-3 !text-[9.5px]"
                        >
                          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Ask on WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </section>
              ))}

              <p className="mt-10 border-t border-cream/10 pt-6 text-[11.5px] leading-relaxed text-cream/30">
                Questions about an order, a payment or a cancellation?{' '}
                <a
                  href={CONTACT_PATH}
                  className="text-cream/45 underline decoration-gold/25 underline-offset-4 transition-colors duration-300 hover:text-gold"
                >
                  Contact the shop
                </a>{' '}
                and we will sort it out with you.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
