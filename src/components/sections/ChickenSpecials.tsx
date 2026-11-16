import { useState } from 'react'
import { ArrowUpRight, Flame } from 'lucide-react'
import {
  chickenSpecials,
  DEFAULT_PORTION,
  PORTIONS,
  type Portion,
} from '../../data/menu'
import { enquiryWhatsAppUrl } from '../../lib/whatsapp'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'
import { AddToBagButton } from '../order/AddToBagButton'
import { useOrder } from '../order/OrderContext'
import { cn } from '../../lib/cn'

export function ChickenSpecials() {
  const { openOrder } = useOrder()
  const [featured, ...rest] = chickenSpecials
  const [featuredPortion, setFeaturedPortion] = useState<Portion>(DEFAULT_PORTION)

  return (
    <section id="specials" className="relative overflow-hidden bg-coal py-20 sm:py-24 lg:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-burgundy/20 blur-[150px]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Chicken Specials"
            title={
              <>
                Fried. Spiced.
                <br />
                <span className="italic text-gold">Unapologetic.</span>
              </>
            }
            description="These are the three orders that leave our counter most often — crunchy, hot and heavy on flavour."
            className="max-w-xl"
          />

          <Reveal delay={120} className="hidden lg:block">
            <a
              href={enquiryWhatsAppUrl('today’s chicken specials')}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-cream/50 transition-colors duration-300 hover:text-gold"
            >
              What&apos;s frying today?
              <ArrowUpRight className="h-4 w-4 text-gold/80" aria-hidden="true" />
            </a>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
          {/* featured */}
          <Reveal className="group relative overflow-hidden border border-cream/10 lg:col-span-7">
            <SmartImage
              image={featured.image}
              className="aspect-[4/5] w-full sm:aspect-[4/3] lg:aspect-[16/13]"
              imgClassName="transition-transform duration-[1600ms] ease-premium group-hover:scale-[1.06]"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-coal via-coal/55 to-transparent"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              aria-hidden="true"
            />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-gold/50 text-[10px] text-gold">
                  {featured.index}
                </span>
                <span className="flex items-center gap-2 text-[9px] uppercase tracking-label text-gold/85">
                  <Flame className="h-3 w-3" aria-hidden="true" />
                  House Signature
                </span>
              </div>

              <h3 className="mt-4 font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-tight text-cream">
                {featured.name}
              </h3>
              <p className="mt-1.5 font-display text-lg italic text-gold-light/90">
                {featured.tagline}
              </p>
              <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-cream/60">
                {featured.description}
              </p>

              <div
                role="group"
                aria-label={`Portion size for ${featured.name}`}
                className="mt-5 flex gap-1.5"
              >
                {PORTIONS.map((size) => {
                  const isActive = size === featuredPortion
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFeaturedPortion(size)}
                      aria-pressed={isActive}
                      className={cn(
                        'border px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] backdrop-blur-sm transition-all duration-300',
                        isActive
                          ? 'border-gold bg-gold text-ink'
                          : 'border-cream/25 text-cream/70 hover:border-gold/60 hover:text-cream',
                      )}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <AddToBagButton
                  variant="solid"
                  label="Add to Order List"
                  item={featured.name}
                  category="Chicken Specials"
                  price={null}
                  portion={featuredPortion}
                  image={featured.image}
                />
                <button
                  type="button"
                  onClick={() =>
                    openOrder({
                      item: featured.name,
                      category: 'Chicken Specials',
                      price: null,
                      portion: featuredPortion,
                      image: featured.image,
                    })
                  }
                  className="inline-flex items-center gap-2 border border-gold/45 bg-coal/40 px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold backdrop-blur-sm transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink"
                >
                  Order {featured.name}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </Reveal>

          {/* secondary cards */}
          <div className="flex flex-col gap-5 lg:col-span-5 lg:gap-6">
            {rest.map((special, index) => (
              <Reveal
                key={special.name}
                delay={120 + index * 100}
                className="group relative flex flex-1 flex-col overflow-hidden border border-cream/10 bg-night transition-colors duration-700 hover:border-gold/40 sm:flex-row"
              >
                <SmartImage
                  image={special.image}
                  className="h-52 w-full sm:h-auto sm:w-[42%]"
                  imgClassName="transition-transform duration-[1400ms] ease-premium group-hover:scale-[1.08]"
                  sizes="(min-width: 1024px) 22vw, 100vw"
                />

                <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="font-display text-sm text-gold/70">{special.index}</span>
                    <span className="h-px w-6 bg-gold/40" aria-hidden="true" />
                  </div>
                  <h3 className="mt-2.5 font-display text-[25px] leading-tight text-cream">
                    {special.name}
                  </h3>
                  <p className="mt-1 font-display text-[15px] italic text-gold-light/80">
                    {special.tagline}
                  </p>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-cream/55">
                    {special.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        openOrder({
                          item: special.name,
                          category: 'Chicken Specials',
                          price: null,
                          image: special.image,
                        })
                      }
                      className="inline-flex w-fit items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors duration-300 hover:text-gold-light"
                    >
                      Order Now
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <AddToBagButton
                      variant="text"
                      label={`Add ${DEFAULT_PORTION}`}
                      item={special.name}
                      category="Chicken Specials"
                      price={null}
                      portion={DEFAULT_PORTION}
                      image={special.image}
                    />
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={320}>
              <a
                href={enquiryWhatsAppUrl('chicken specialities')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 border border-dashed border-gold/30 px-5 py-4 transition-colors duration-500 hover:border-gold/70 hover:bg-gold/[0.04]"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-cream/55">
                  More specialities on the counter daily
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
